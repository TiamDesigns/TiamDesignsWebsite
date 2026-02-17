import fitz  # pymupdf
import os
from PIL import Image

pdf_path = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\4502_W22_THESIS-REPORT_Morrow-Rogers_Tiam.pdf"
output_dir = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\images\rendered"
cropped_dir = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\images\cropped"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)
if not os.path.exists(cropped_dir):
    os.makedirs(cropped_dir)

# Page mappings (Index: Filename)
# Note: "Page 17" in TOC is roughly Index 16 if TOC starts at 1. 29 was Page 30.
# So Offset is -1 from printed page map.
pages_to_render = {
    # Personas (Printed 17-19 -> Indices 16-18) - Rendering extra range to be safe
    16: "Persona_Primary_User",
    17: "Persona_Secondary_User",
    18: "Persona_Tertiary_User_1",
    19: "Persona_Tertiary_User_2",
    
    # Needs (Printed 30 -> Index 29)
    29: "Figure_4_Categorization_of_Needs",
    
    # Needs Analysis (Printed 31-32 -> Index 30-31)
    30: "Table_14_Needs_Analysis_1",
    31: "Table_14_Needs_Analysis_2",
    
    # UX Mapping (Printed 35 -> Index 34)
    34: "Table_15_UX_Mapping",
    
    # Mind Maps (Printed 44-45 -> Index 43-44)
    43: "Figure_9_Mind_Mapping_General",
    44: "Figure_10_Mind_Mapping_Injuries",
    
    # Ideation (Printed 46-48 -> Index 45-47)
    45: "Ideation_Page_46",
    46: "Ideation_Page_47",
    47: "Ideation_Page_48"
}

def crop_image(image_path, output_path):
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            # Crop top 12% and bottom 12% to remove headers/footers
            # This is a heuristic; fine-tuning might be needed if they are larger/smaller
            left = 0
            top = height * 0.12
            right = width
            bottom = height * 0.88
            
            cropped_img = img.crop((left, top, right, bottom))
            cropped_img.save(output_path)
            print(f"Cropped {os.path.basename(image_path)}")
    except Exception as e:
        print(f"Error cropping {image_path}: {e}")

try:
    doc = fitz.open(pdf_path)
    for page_idx, filename in pages_to_render.items():
        if page_idx < len(doc):
            page = doc.load_page(page_idx)
            pix = page.get_pixmap(matrix=fitz.Matrix(3, 3)) # 3x zoom for high quality
            
            raw_path = os.path.join(output_dir, f"{filename}.png")
            pix.save(raw_path)
            
            cropped_path = os.path.join(cropped_dir, f"{filename}.png")
            crop_image(raw_path, cropped_path)
        else:
            print(f"Page index {page_idx} out of range")
            
    print("Done processing images.")
except Exception as e:
    print(f"Error: {e}")
