from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import uuid

from tgs_engine import TGSEngine
from templates_manager import get_all_templates, get_template_by_id

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

class GenerateRequest(BaseModel):
    template_id: str
    text: str
    font_type: Optional[str] = "bold"
    color_hex: Optional[str] = "#FFFFFF"
    user_id: Optional[int] = None

@app.get("/")
def read_root():
    return {"status": "online", "service": "TGS Sticker Lab API"}

@app.get("/api/templates")
def list_templates():
    return {"templates": get_all_templates()}

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
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
def generate_sticker_file(req: GenerateRequest):
    try:
        lottie_dict = engine.generate_sticker(
            template_id=req.template_id,
            text=req.text,
            font_type=req.font_type,
            color_hex=req.color_hex
        )
        filename = f"{req.template_id}_{uuid.uuid4().hex[:8]}.tgs"
        file_path = os.path.join(TEMP_OUT_DIR, filename)
        engine.compress_to_tgs(lottie_dict, file_path)
        
        return FileResponse(
            file_path,
            media_type="application/x-gzip",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
