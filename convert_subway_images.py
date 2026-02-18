import os
from PIL import Image

# Define paths
base_path = r"c:\Users\tiamb\OneDrive\Documents\TiamDesigns\TiamDesignsWebsite\assets\SampleSubway"
input_dir = os.path.join(base_path, "extracted_images")
output_dir = os.path.join(base_path, "web_images")

# Create output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# List of specific images we likely want based on filenames (from previous list_dir)
# prioritizing larger images which are likely photos or renders
images_to_convert = [
    "Final Design_p1_X40.jp2", # 10MB - likely main render
    "Final Design_p1_X39.jp2", # 4.9MB
    "Final Design_p1_X13.jp2", # 4.8MB
    "Final Design_p1_X41.jp2", # 4.1MB
    "Final Design_p1_X11.jp2", # 1.8MB
    "Final Design_p1_X42.jp2", # 1.8MB
    "Final Design_p1_X51.jp2", # 1.3MB
    "Final Design_p1_X32.jp2", # 1.2MB
    "Final Design_p1_X43.jp2", # 1MB
    "Final Design_p1_X45.jp2", # 1MB
]

count = 0
for filename in os.listdir(input_dir):
    if filename.endswith(".jp2") or filename.endswith(".png"):
        # Convert all significant images, not just the list, but maybe filter by size if needed
        # For now, let's just convert the big ones we identified and maybe a few others if found
        
        file_path = os.path.join(input_dir, filename)
        file_size = os.path.getsize(file_path)
        
        # Filter: Only convert images > 500KB to avoid icons/lines, unless it's a PNG which might be a diagram
        if file_size > 500000 or filename in images_to_convert or filename.endswith(".png"):
            try:
                with Image.open(file_path) as img:
                    # distinct name
                    new_name = os.path.splitext(filename)[0] + ".png"
                    output_path = os.path.join(output_dir, new_name)
                    
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                        
                    img.save(output_path, "PNG")
                    print(f"Converted {filename} to {new_name}")
                    count += 1
            except Exception as e:
                print(f"Error converting {filename}: {e}")

print(f"Done. Converted {count} images to {output_dir}")
