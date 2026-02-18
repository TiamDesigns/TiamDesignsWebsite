import pypdf
import os
import sys

# Define paths
base_path = r"c:\Users\tiamb\OneDrive\Documents\TiamDesigns\TiamDesignsWebsite\assets\SampleSubway"
output_dir = os.path.join(base_path, "extracted_images")

# Create output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

files_to_extract = [
    "Final Design.pdf",
    "GNG1103 - User Manual.pdf"
]

for filename in files_to_extract:
    pdf_path = os.path.join(base_path, filename)
    print(f"Extracting images from {filename}...")
    
    try:
        reader = pypdf.PdfReader(pdf_path)
        
        count = 0
        # Limit to checking first 20 pages for images to avoid too many
        for page_num, page in enumerate(reader.pages[:20]):
            for image_file_object in page.images:
                # Filter small images (likely icons/lines)
                if len(image_file_object.data) < 10000:
                    continue
                    
                image_name = f"{filename.split('.')[0]}_p{page_num+1}_{image_file_object.name}"
                with open(os.path.join(output_dir, image_name), "wb") as fp:
                    fp.write(image_file_object.data)
                    count += 1
        
        print(f"Extracted {count} images from {filename}")

    except Exception as e:
        print(f"Error extracting images from {filename}: {e}")

print(f"Done. Images in {output_dir}")
