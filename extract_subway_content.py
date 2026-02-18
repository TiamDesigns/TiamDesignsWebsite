import pypdf
import os
import sys
import io

# Set encoding to utf-8 for stdout
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

base_path = r"c:\Users\tiamb\OneDrive\Documents\TiamDesigns\TiamDesignsWebsite\assets\SampleSubway"
files_to_extract = [
    "Final Design.pdf",
    "GNG1103 - User Manual.pdf",
    "GNG1103 - Project - Bill of Materials.pdf"
]

output_file = "subway_content.txt"

with open(output_file, "w", encoding="utf-8") as out:
    for filename in files_to_extract:
        pdf_path = os.path.join(base_path, filename)
        out.write(f"\n\n{'='*20}\nFILE: {filename}\n{'='*20}\n")
        
        try:
            reader = pypdf.PdfReader(pdf_path)
            # Limit to first 20 pages for the big design doc to avoid huge output, 
            # and all pages for BOM and User Manual
            max_pages = 20 if "Final Design" in filename else len(reader.pages)
            
            for i in range(min(max_pages, len(reader.pages))):
                out.write(f"\n--- Page {i+1} ---\n")
                text = reader.pages[i].extract_text()
                out.write(text)
                
            print(f"Extracted {filename}")
            
        except Exception as e:
            out.write(f"\nError extracting {filename}: {e}\n")
            print(f"Error extracting {filename}: {e}")

print(f"Done. Content written to {output_file}")
