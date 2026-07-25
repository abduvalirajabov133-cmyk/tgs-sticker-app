import asyncio
import logging
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    PreCheckoutQuery,
    FSInputFile
)

# Load environment variables
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "8929381759:AAFf20dPeWlA7WYrr3PpSNgUldU02fJL31c")
ADMIN_ID = int(os.getenv("ADMIN_ID", "8544023815"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://tgs-sticker-app.vercel.app")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

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
        "Bu bot orqali o'zingizning shaxsiy ismingiz, usernamesingiz va logotingiz tushirilgan **Telegram Animated Stikerlarini (.tgs)** avtomatik yaratishingiz mumkin!\n\n"
        "Pastdagi tugmani bosing va Mini App ichida tayyor shablonlarni ko'ring va xarid qiling:",
        reply_markup=kb,
        parse_mode="Markdown"
    )

@dp.pre_checkout_query()
async def process_pre_checkout(pre_checkout_query: PreCheckoutQuery):
    await bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)

@dp.message(F.successful_payment)
async def process_successful_payment(message: Message):
    user_id = message.from_user.id
    user_name = message.from_user.full_name
    
    # Notify Admin
    try:
        await bot.send_message(
            ADMIN_ID,
            f"💰 **Yangi To'lov Bajarildi!**\n\n"
            f"👤 Foydalanuvchi: {user_name} (`{user_id}`)\n"
            f"⭐ To'lov miqdori: {message.successful_payment.total_amount} Stars"
        )
    except Exception as e:
        logging.error(f"Failed to notify admin: {e}")

    await message.answer(
        "🎉 **To'lov muvaffaqiyatli qabul qilindi!**\n\n"
        "Sizning shaxsiy Telegram animatsiyali stikeringiz tayyorlanmoqda..."
    )

async def on_startup():
    logging.info("Bot starting up...")
    try:
        await bot.send_message(ADMIN_ID, "🚀 **TGS Sticker Lab Bot Render'da Muvaffaqiyatli Ishga Tushdi!**")
    except Exception as e:
        logging.warning(f"Could not send startup message to admin {ADMIN_ID}: {e}")

async def main():
    logging.basicConfig(level=logging.INFO)
    dp.startup.register(on_startup)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
