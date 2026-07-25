import os
import json
import gzip
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

class TGSEngine:
    def __init__(self, templates_dir: str):
        self.templates_dir = templates_dir
        self.fonts = {
            "bold": r"C:\Windows\Fonts\segoeuib.ttf" if os.path.exists(r"C:\Windows\Fonts\segoeuib.ttf") else r"C:\Windows\Fonts\arialbd.ttf",
            "script": r"C:\Windows\Fonts\segoesc.ttf" if os.path.exists(r"C:\Windows\Fonts\segoesc.ttf") else r"C:\Windows\Fonts\arial.ttf"
        }

    def generate_text_lottie_shapes(self, text_str: str, font_type: str = "bold", font_size: int = 250, scale_factor: float = 0.35, color_rgba=(1, 1, 1, 1)):
        font_path = self.fonts.get(font_type, self.fonts["bold"])
        img_w, img_h = 2048, 2048
        img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        font = ImageFont.truetype(font_path, font_size)
        bbox = draw.textbbox((0, 0), text_str, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        x_pos = (img_w - text_w) // 2
        y_pos = (img_h - text_h) // 2 - bbox[1]
        draw.text((x_pos, y_pos), text_str, font=font, fill=(255, 255, 255, 255))

        img_np = np.array(img)
        alpha = img_np[:, :, 3]

        _, thresh = cv2.threshold(alpha, 128, 255, cv2.THRESH_BINARY)
        contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

        if hierarchy is None:
            return []

        hierarchy = hierarchy[0]
        center_x = img_w / 2
        center_y = img_h / 2

        lottie_shapes = []

        for i, (cnt, hier) in enumerate(zip(contours, hierarchy)):
            parent = hier[3]
            if parent != -1:
                continue

            outer_pts = cv2.approxPolyDP(cnt, 0.002 * cv2.arcLength(cnt, True), True).reshape(-1, 2)
            if len(outer_pts) < 3:
                continue

            group_items = []

            v_list, i_list, o_list = [], [], []
            for pt in outer_pts:
                x = float((pt[0] - center_x) * scale_factor)
                y = float((pt[1] - center_y) * scale_factor)
                v_list.append([round(x, 2), round(y, 2)])
                i_list.append([0.0, 0.0])
                o_list.append([0.0, 0.0])

            group_items.append({
                "ty": "sh",
                "nm": "Outer Path",
                "ks": {"a": 0, "k": {"i": i_list, "o": o_list, "v": v_list, "c": True}}
            })

            child_idx = hier[2]
            while child_idx != -1:
                child_cnt = contours[child_idx]
                hole_pts = cv2.approxPolyDP(child_cnt, 0.002 * cv2.arcLength(child_cnt, True), True).reshape(-1, 2)
                if len(hole_pts) >= 3:
                    hv_list, hi_list, ho_list = [], [], []
                    for pt in hole_pts:
                        x = float((pt[0] - center_x) * scale_factor)
                        y = float((pt[1] - center_y) * scale_factor)
                        hv_list.append([round(x, 2), round(y, 2)])
                        hi_list.append([0.0, 0.0])
                        ho_list.append([0.0, 0.0])

                    group_items.append({
                        "ty": "sh",
                        "nm": "Hole Path",
                        "ks": {"a": 0, "k": {"i": hi_list, "o": ho_list, "v": hv_list, "c": True}}
                    })
                child_idx = hierarchy[child_idx][0]

            if len(group_items) > 1:
                group_items.append({
                    "ty": "mm",
                    "mm": 1,
                    "nm": "Merge Paths"
                })

            group_items.append({
                "ty": "fl",
                "nm": "Fill",
                "c": {"a": 0, "k": list(color_rgba)},
                "o": {"a": 0, "k": 100}
            })
            group_items.append({
                "ty": "tr",
                "p": {"a": 0, "k": [0, 0]},
                "a": {"a": 0, "k": [0, 0]},
                "s": {"a": 0, "k": [100, 100]},
                "r": {"a": 0, "k": 0},
                "o": {"a": 0, "k": 100}
            })

            lottie_shapes.append({
                "ty": "gr",
                "nm": f"Char {i+1}",
                "it": group_items
            })

        return lottie_shapes

    def generate_sticker(self, template_id: str, text: str, font_type: str = "bold", color_hex: str = "#FFFFFF") -> dict:
        template_file = os.path.join(self.templates_dir, f"{template_id}.json")
        if not os.path.exists(template_file):
            raise FileNotFoundError(f"Template '{template_id}' not found.")

        with open(template_file, "r", encoding="utf-8") as f:
            lottie_data = json.load(f)

        # Convert hex color to RGBA [0..1]
        hex_clean = color_hex.lstrip("#")
        if len(hex_clean) == 6:
            r, g, b = [int(hex_clean[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
        else:
            r, g, b = 1.0, 1.0, 1.0
        color_rgba = (r, g, b, 1.0)

        # Customize based on template
        if template_id == "flag":
            text_shapes = self.generate_text_lottie_shapes(text, font_type=font_type, font_size=420, scale_factor=0.35, color_rgba=color_rgba)
            for asset in lottie_data.get("assets", []):
                if asset.get("id") == "comp_1":
                    asset["layers"] = [{
                        "ddd": 0, "ind": 1, "ty": 4, "nm": "Custom Text", "sr": 1,
                        "ks": {"o": {"a": 0, "k": 100}, "r": {"a": 0, "k": 0}, "p": {"a": 0, "k": [235.695, 269.725]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [120, 120]}},
                        "shapes": text_shapes, "ao": 0, "ip": 0, "op": 180, "st": 0, "bm": 0
                    }]
            for l in lottie_data.get("layers", []):
                if l.get("nm") in ["base 2", "Кривые @kotletovv 2"]:
                    l["hd"] = True

        elif template_id == "heart":
            text_shapes = self.generate_text_lottie_shapes(text, font_type="script" if font_type=="script" else "bold", font_size=320, scale_factor=0.28, color_rgba=color_rgba)
            for asset in lottie_data.get("assets", []):
                if asset.get("id") == "{e7ffa6a5-24df-4f08-892f-cccd110ef3b5}":
                    heart_layer = asset["layers"][5]
                    heart_layer["ind"] = 1
                    text_layer = {
                        "ddd": 0, "ty": 4, "ind": 0, "st": 0, "ip": 0, "op": 921, "ao": 0, "parent": 1,
                        "ks": {"a": {"a": 0, "k": [0, 0]}, "p": {"a": 0, "k": [540.869, 560]}, "s": {"a": 0, "k": [100, 100]}, "r": {"a": 0, "k": 0}, "o": {"a": 0, "k": 100}},
                        "shapes": text_shapes
                    }
                    asset["layers"] = [text_layer, heart_layer]

        elif template_id == "instagram":
            text_shapes = self.generate_text_lottie_shapes(text, font_type=font_type, font_size=180, scale_factor=0.35, color_rgba=color_rgba)
            for asset in lottie_data.get("assets", []):
                if asset.get("id") == "precomp_Shape Layer - SVG":
                    asset["layers"] = [{
                        "ddd": 0, "ind": 1, "ty": 4, "nm": "Text Layer", "sr": 1,
                        "ks": {"o": {"a": 0, "k": 100}, "r": {"a": 0, "k": 0}, "p": {"a": 0, "k": [256, 260]}, "a": {"a": 0, "k": [0, 0]}, "s": {"a": 0, "k": [100, 100]}},
                        "shapes": text_shapes, "ao": 0, "ip": 0, "op": 180, "st": 0, "bm": 0
                    }]

        return lottie_data

    def compress_to_tgs(self, lottie_dict: dict, out_file_path: str):
        json_bytes = json.dumps(lottie_dict, separators=(',', ':')).encode('utf-8')
        with gzip.open(out_file_path, 'wb') as f:
            f.write(json_bytes)
        return out_file_path
