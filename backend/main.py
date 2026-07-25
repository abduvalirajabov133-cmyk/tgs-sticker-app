from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import uuid
import asyncio
import logging
from dotenv import load_dotenv

from tgs_engine import TGSEngine
from templates_manager import get_all_templates, get_template_by_id, CARD_NUMBER, CARD_HOLDER

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(os.path.dirname(BASE_DIR), "templates")
TEMP_OUT_DIR = os.path.join(os.path.dirname(BASE_DIR), "output")
os.makedirs(TEMP_OUT_DIR, exist_ok=True)

engine = TGSEngine(TEMPLATES_DIR)

app = FastAPI(title="TGS Sticker Lab API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PreviewRequest(BaseModel):
    template_id: str
    text: str
    font_type: Optional[str] = "bold"
    color_hex: Optional[str] = "#FFFFFF"

class OrderRequest(BaseModel):
    template_id: str
    text: str
    font_type: Optional[str] = "bold"
    color_hex: Optional[str] = "#FFFFFF"
    user_id: Optional[int] = None
    user_name: Optional[str] = "Foydalanuvchi"
    receipt_info: Optional[str] = ""
    phone: Optional[str] = ""

@app.get("/")
def read_root():
    return {"status": "online", "service": "TGS Sticker Lab API"}

@app.get("/api/templates")
def list_templates():
    return {
        "templates": get_all_templates(),
        "card_info": {
            "card_number": os.getenv("CARD_NUMBER", CARD_NUMBER),
            "card_holder": os.getenv("CARD_HOLDER", CARD_HOLDER)
        }
    }

@app.get("/api/templates/{template_id}/json")
def get_template_json(template_id: str):
    template_path = os.path.join(TEMPLATES_DIR, f"{template_id}.json")
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    return FileResponse(template_path, media_type="application/json")

@app.post("/api/preview")
def preview_sticker(req: PreviewRequest):
    try:
        lottie_dict = engine.generate_sticker(
            template_id=req.template_id,
            text=req.text,
            font_type=req.font_type,
            color_hex=req.color_hex
        )
        return lottie_dict
    except Exception as e:
        logging.error(f"Preview error: {e}")
        # Return fallback template JSON
        template_path = os.path.join(TEMPLATES_DIR, f"{req.template_id}.json")
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as f:
                import json
                return json.load(f)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-order")
async def create_order(req: OrderRequest):
    try:
        order_id = uuid.uuid4().hex[:8].upper()
        template = get_template_by_id(req.template_id)
        template_title = template["title"] if template else req.template_id
        price_uzs = template["price_uzs"] if template else 10000

        # Import bot helpers
        from bot import notify_admin_new_order
        
        # Notify Admin on Telegram
        await notify_admin_new_order(
            order_id=order_id,
            user_id=req.user_id,
            user_name=req.user_name,
            template_id=req.template_id,
            template_title=template_title,
            text=req.text,
            font_type=req.font_type,
            color_hex=req.color_hex,
            price_uzs=price_uzs,
            receipt_info=req.receipt_info,
            phone=req.phone
        )

        return {
            "status": "success",
            "order_id": order_id,
            "message": "Buyurtma va chek ma'lumotlari adminga yuborildi. Admin tekshirib stikerni bot orqali yuboradi."
        }
    except Exception as e:
        logging.error(f"Create order error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
