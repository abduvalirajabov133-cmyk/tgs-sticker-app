import asyncio
import logging
import os
import tempfile
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    CallbackQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    FSInputFile
)

from tgs_engine import TGSEngine

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "8929381759:AAFf20dPeWlA7WYrr3PpSNgUldU02fJL31c")
ADMIN_ID = int(os.getenv("ADMIN_ID", "8544023815"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://tgs-sticker-app.vercel.app")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(os.path.dirname(BASE_DIR), "templates")
engine = TGSEngine(TEMPLATES_DIR)

# Store transient order data for admin approval
PENDING_ORDERS = {}

@dp.message(CommandStart())
async def cmd_start(message: Message):
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✨ TGS Sticker Lab Mini App'ni Ochish",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]
        ]
    )
    await message.answer(
        "👋 **Xush kelibsiz! TGS Sticker Lab Mini App'ga xush kelibsiz!**\n\n"
        "Bu bot orqali o'zingizning shaxsiy ismingiz, usernamesingiz va logotingiz tushirilgan **Telegram Animated Stikerlarini (.tgs)** avtomatik buyurtma qilishingiz mumkin!\n\n"
        "Pastdagi tugmani bosing va Mini App ichida tayyor shablonlarni ko'ring:",
        reply_markup=kb,
        parse_mode="Markdown"
    )

async def notify_admin_new_order(
    order_id: str,
    user_id: int,
    user_name: str,
    template_id: str,
    template_title: str,
    text: str,
    font_type: str,
    color_hex: str,
    price_uzs: int,
    receipt_info: str,
    phone: str
):
    # Store order info
    PENDING_ORDERS[order_id] = {
        "user_id": user_id,
        "user_name": user_name,
        "template_id": template_id,
        "text": text,
        "font_type": font_type,
        "color_hex": color_hex,
        "price_uzs": price_uzs
    }

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Tasdiqlash va Stikerni Yuborish", callback_data=f"approve_{order_id}"),
                InlineKeyboardButton(text="❌ Rad etish", callback_data=f"reject_{order_id}")
            ]
        ]
    )

    admin_msg = (
        f"📩 **YANGI BUYURTMA #{order_id}**\n\n"
        f"👤 **Foydalanuvchi:** {user_name} (`{user_id}`)\n"
        f"🎨 **Shablon:** {template_title}\n"
        f"✍️ **Matn:** `{text}`\n"
        f"💰 **Narxi:** {price_uzs:,} so'm\n"
        f"🧾 **Chek / Tranzaksiya:** {receipt_info or 'Kiritilmagan'}\n"
        f"📞 **Tel:** {phone or 'Kiritilmagan'}\n\n"
        f"Chekni tekshirib, tasdiqlash tugmasini bosing:"
    )

    try:
        await bot.send_message(ADMIN_ID, admin_msg, reply_markup=kb, parse_mode="Markdown")
    except Exception as e:
        logging.error(f"Failed to send order notification to admin: {e}")

@dp.callback_query(F.data.startswith("approve_"))
async def handle_approve_order(callback: CallbackQuery):
    order_id = callback.data.replace("approve_", "")
    order = PENDING_ORDERS.get(order_id)

    if not order:
        await callback.answer("Buyurtma topilmadi yoki allaqachon bajarilgan.", show_alert=True)
        return

    await callback.answer("Stiker generatsiya qilinmoqda...")
    
    try:
        # Generate custom .tgs file
        lottie_dict = engine.generate_sticker(
            template_id=order["template_id"],
            text=order["text"],
            font_type=order["font_type"],
            color_hex=order["color_hex"]
        )

        out_file = os.path.join(tempfile.gettempdir(), f"{order['template_id']}_{order_id}.tgs")
        engine.compress_to_tgs(lottie_dict, out_file)

        user_id = order["user_id"]
        if user_id:
            # Send file to user
            input_file = FSInputFile(out_file)
            await bot.send_document(
                user_id,
                input_file,
                caption=f"🎉 **Sizning buyurtmangiz tasdiqlandi!**\n\n✨ Matn: `{order['text']}`\n\nMana sizning tayyor `.tgs` animatsiyali stiker faylingiz!"
            )
            await bot.send_message(ADMIN_ID, f"✅ Buyurtma #{order_id} tasdiqlandi va stiker foydalanuvchiga yuborildi!")
        else:
            await bot.send_message(ADMIN_ID, f"⚠️ Buyurtma #{order_id} uchun foydalanuvchi Telegram ID si topilmadi.")

        await callback.message.edit_text(callback.message.text + "\n\n✅ **STATUS: TASDIQLANDI VA YUBORILDI**")
        del PENDING_ORDERS[order_id]
    except Exception as e:
        logging.error(f"Error handling approve order: {e}")
        await callback.message.answer(f"❌ Xatolik yuz berdi: {e}")

@dp.callback_query(F.data.startswith("reject_"))
async def handle_reject_order(callback: CallbackQuery):
    order_id = callback.data.replace("reject_", "")
    order = PENDING_ORDERS.get(order_id)

    if order and order.get("user_id"):
        try:
            await bot.send_message(order["user_id"], f"❌ Buyurtmangiz #{order_id} admin tomonidan rad etildi. Iltimos chek va ma'lumotlarni qayta tekshiring.")
        except Exception:
            pass

    await callback.message.edit_text(callback.message.text + "\n\n❌ **STATUS: RAD ETILDI**")
    await callback.answer("Buyurtma rad etildi.")
    if order_id in PENDING_ORDERS:
        del PENDING_ORDERS[order_id]

async def on_startup():
    logging.info("Bot starting up...")
    try:
        await bot.send_message(ADMIN_ID, "🚀 **TGS Sticker Lab Bot Ishga Tushdi!**")
    except Exception as e:
        logging.warning(f"Could not send startup message: {e}")

async def main():
    logging.basicConfig(level=logging.INFO)
    dp.startup.register(on_startup)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
