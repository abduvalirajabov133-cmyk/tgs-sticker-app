from typing import List, Dict

TEMPLATES_CATALOG: List[Dict] = [
    {
        "id": "flag",
        "title": "To'lqinlanuvchi Bayroq Stiker",
        "description": "Yorqin ranglar va to'lqinlanuvchi harakatli bayroq stikeri. Ismingiz yoki brendingiz uchun ideal.",
        "category": "Bayroqlar",
        "price_uzs": 10000,
        "badge": "Popular",
        "icon": "🚩",
        "preview_lottie_file": "flag.json",
        "default_text": "Zuhra",
        "supported_fields": ["text", "font", "color"]
    },
    {
        "id": "heart",
        "title": "Urib turuvchi Yurak Stiker",
        "description": "Nurlanuvchi va urib turuvchi 3D romantik yurak stikeri. Husnixat va shrift bilan kiritish.",
        "category": "Sevgi",
        "price_uzs": 10000,
        "badge": "Trending",
        "icon": "💖",
        "preview_lottie_file": "heart.json",
        "default_text": "Zuhra",
        "supported_fields": ["text", "font", "color"]
    },
    {
        "id": "instagram",
        "title": "Instagram Profil Stiker",
        "description": "Rasmiy Instagram logotipi va animatsiyali profilingiz username stikeri.",
        "category": "Social",
        "price_uzs": 8000,
        "badge": "Hot",
        "icon": "📸",
        "preview_lottie_file": "instagram.json",
        "default_text": "olimova_ai",
        "supported_fields": ["text", "font", "color"]
    }
]

CARD_NUMBER = "8600 0000 0000 0000" # Card number for user payments
CARD_HOLDER = "ABDUVALI R."

def get_all_templates():
    return TEMPLATES_CATALOG

def get_template_by_id(template_id: str):
    for t in TEMPLATES_CATALOG:
        if t["id"] == template_id:
            return t
    return None
