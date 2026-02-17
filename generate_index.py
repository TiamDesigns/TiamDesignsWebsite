import fitz  # pymupdf
import os

pdf_path = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\4502_W22_THESIS-REPORT_Morrow-Rogers_Tiam.pdf"
output_dir = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\images\index"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

doc = fitz.open(pdf_path)

# Render pages 15 to 60 to find all tables and figures
# We will save them as small thumbnails to quickly check content
for i in range(15, 60):
    page = doc.load_page(i)
    pix = page.get_pixmap(matrix=fitz.Matrix(0.3, 0.3)) # Low res
    pix.save(os.path.join(output_dir, f"page_{i}.png"))
    
print(f"Rendered index pages {15}-{59}")
