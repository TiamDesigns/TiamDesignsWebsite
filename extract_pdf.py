import pypdf
import sys
import io

# Set encoding to utf-8 for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pdf_path = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\4502_W22_THESIS-REPORT_Morrow-Rogers_Tiam.pdf"

try:
    reader = pypdf.PdfReader(pdf_path)
    
    # Extract title from metadata
    meta = reader.metadata
    print(f"Title: {meta.title if meta.title else 'No Title found in metadata'}")
    
    # Extract text from pages 2-10 to find abstract
    text = ""
    for i in range(2, min(12, len(reader.pages))):
        text += f"\n--- Page {i+1} ---\n"
        text += reader.pages[i].extract_text()
        
    # Write to file
    with open("extracted_thesis.txt", "w", encoding="utf-8") as f:
        f.write(text)
        
    print("Done. Text written to extracted_thesis.txt")

except Exception as e:
    print(f"Error: {e}")
