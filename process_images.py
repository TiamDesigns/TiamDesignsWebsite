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

# Corrected indices based on visual verification (File naming vs Pymupdf Index)
# generate_index.py saved "page_X.png" where X was the 0-based index used in load_page(i).
# So if the subagent saw "page_16.png" as Primary User, the index is 16.

pages_to_render = {
    # Personas
    16: "Persona_Primary_User",
    17: "Persona_Secondary_User",
    18: "Persona_Tertiary_User_1", # Likely contains both tertiary tables or one of them? Subagent said "Tertiary User Personas"
    # Note: If 18 has both, we might need 2 crops, but for now let's just render it.
    
    # Needs (Fig 4)
    29: "Figure_4_Categorization_of_Needs",
    
    # Needs Analysis (Table 14)
    32: "Table_14_Needs_Analysis",
    
    # UX Mapping (Table 15)
    35: "Table_15_UX_Mapping",
    
    # Mind Maps
    45: "Figure_9_Mind_Mapping_General",
    46: "Figure_10_Mind_Mapping_Injuries",
    
    # Ideation (Figs 11-16)
    47: "Ideation_Page_47",
    48: "Ideation_Page_48",
    49: "Ideation_Page_49",
    50: "Ideation_Page_50"
}

def crop_image(image_path, output_path, crop_type="default"):
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            
            # Default aggressive crop (remove top 15% and bottom 15% to clear headers/footers)
            top_pct = 0.15
            bottom_pct = 0.85
            
            # Custom crops for specific layouts if needed
            if crop_type == "persona":
                # Personas usually are in the middle. Crop more.
                top_pct = 0.20
                bottom_pct = 0.80
            elif crop_type == "full_page_figure":
                # Full page figures might need less cropping if they span the page
                top_pct = 0.12
                bottom_pct = 0.88
            
            left = 0
            top = height * top_pct
            right = width
            bottom = height * bottom_pct
            
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
            # High quality render
            pix = page.get_pixmap(matrix=fitz.Matrix(3, 3)) 
            
            raw_path = os.path.join(output_dir, f"{filename}.png")
            pix.save(raw_path)
            
            # Determine crop type
            crop_type = "default"
            if "Persona" in filename:
                crop_type = "persona"
            elif "Ideation" in filename or "Figure" in filename:
                crop_type = "full_page_figure"
                
            cropped_path = os.path.join(cropped_dir, f"{filename}.png")
            crop_image(raw_path, cropped_path, crop_type)
        else:
            print(f"Page index {page_idx} out of range")
            
    print("Done processing images.")
except Exception as e:
    print(f"Error: {e}")
