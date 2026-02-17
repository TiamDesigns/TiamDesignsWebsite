import pypdf
import os

# Define paths
pdf_path = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\4502_W22_THESIS-REPORT_Morrow-Rogers_Tiam.pdf"
output_dir = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\images"

# Create output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

try:
    reader = pypdf.PdfReader(pdf_path)
    
    count = 0
    for page_num, page in enumerate(reader.pages):
        for image_file_object in page.images:
            with open(os.path.join(output_dir, f"page_{page_num+1}_{image_file_object.name}"), "wb") as fp:
                fp.write(image_file_object.data)
                count += 1
                
    print(f"Extracted {count} images to {output_dir}")

except Exception as e:
    print(f"Error: {e}")
