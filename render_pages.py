import fitz  # pymupdf
import os

pdf_path = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\4502_W22_THESIS-REPORT_Morrow-Rogers_Tiam.pdf"
output_dir = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\images\rendered"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Pages to render (1-based from TOC needs to be converted to 0-based for fitz)
# Figure 4: Page 30 -> Index 29
# Table 14: Pages 31-32 -> Indices 30, 31
# Table 15: Page 35 -> Index 34 (Checking surrounding pages too just in case: 33-36)
# Figure 9: Page 44 -> Index 43
# Figure 10: Page 45 -> Index 44
# Ideation (Fig 11-16): Pages 46-48 -> Indices 45, 46, 47

pages_to_render = {
    29: "Figure_4_Categorization_of_Needs",
    30: "Table_14_Needs_Analysis_1",
    31: "Table_14_Needs_Analysis_2",
    34: "Table_15_UX_Mapping",
    43: "Figure_9_Mind_Mapping_General",
    44: "Figure_10_Mind_Mapping_Injuries",
    45: "Ideation_Page_46",
    46: "Ideation_Page_47",
    47: "Ideation_Page_48"
}

try:
    doc = fitz.open(pdf_path)
    for page_idx, filename in pages_to_render.items():
        if page_idx < len(doc):
            page = doc.load_page(page_idx)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better quality
            output_path = os.path.join(output_dir, f"{filename}.png")
            pix.save(output_path)
            print(f"Rendered Page {page_idx+1} to {output_path}")
        else:
            print(f"Page index {page_idx} out of range")
    print("Done rendering.")
except Exception as e:
    print(f"Error: {e}")
