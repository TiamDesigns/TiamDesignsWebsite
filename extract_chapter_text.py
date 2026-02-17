import fitz  # pymupdf

pdf_path = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\4502_W22_THESIS-REPORT_Morrow-Rogers_Tiam.pdf"

pages_to_extract = {
    "Problem": 13, # Chapter 1 Intro
    "Personas": [17, 18, 19], # Primary, Sec, Tert
    "Needs": [32, 33], # Needs Analysis, Categorization
    "MindMap": [46, 47], # Mind Mapping (Page 46 in TOC is likely index 45/46)
    "Ideation": [48, 49, 50] # Ideation
}

doc = fitz.open(pdf_path)
extracted_content = {}

print("Extracting text...")
for section, indices in pages_to_extract.items():
    content = ""
    if isinstance(indices, int):
        indices = [indices]
    for idx in indices:
        # PDF page index is 0-based, TOC is 1-based. Usually TOC page X is index X-1.
        # Let's try index X-1.
        try:
            page = doc.load_page(idx - 1) 
            text = page.get_text("text")
            content += f"\n--- Page {idx} ---\n{text}"
        except Exception as e:
            print(f"Error on page {idx}: {e}")
            
    extracted_content[section] = content

# Save to file for reading
with open("thesis_text_extracts.txt", "w", encoding="utf-8") as f:
    for section, text in extracted_content.items():
        f.write(f"\n\n=== {section} ===\n{text}")

print("Done.")
