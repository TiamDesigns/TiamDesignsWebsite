import os
from PIL import Image

# Directories to scan
TARGET_DIRS = [
    r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets",
    r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Titan65",
    r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project",
    r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite\assets\Thesis Project\images"
]

# Supported formats
EXTENSIONS = {'.jpg', '.jpeg', '.png'}

def optimize_image(img_path):
    try:
        filename, ext = os.path.splitext(img_path)
        
        # 1. Generate standard WebP (Full resolution)
        webp_path = f"{filename}.webp"
        if not os.path.exists(webp_path):
            with Image.open(img_path) as img:
                img.save(webp_path, 'WEBP', quality=85)
                print(f"Generated WebP: {os.path.basename(webp_path)}")
        
        # 2. Generate mobile WebP (Max width 800px)
        mobile_webp_path = f"{filename}-mobile.webp"
        if not os.path.exists(mobile_webp_path):
            with Image.open(img_path) as img:
                width, height = img.size
                if width > 800:
                    new_height = int(height * (800 / width))
                    img = img.resize((800, new_height), Image.Resampling.LANCZOS)
                img.save(mobile_webp_path, 'WEBP', quality=80)
                print(f"Generated Mobile WebP: {os.path.basename(mobile_webp_path)}")
                
    except Exception as e:
        print(f"Error optimizing {img_path}: {e}")

def main():
    print("Starting image optimization...")
    count = 0
    for directory in TARGET_DIRS:
        if not os.path.exists(directory):
            print(f"Skipping missing directory: {directory}")
            continue
            
        for root, _, files in os.walk(directory):
            for file in files:
                if os.path.splitext(file)[1].lower() in EXTENSIONS:
                    # Avoid re-processing optimized files or thumbnails if naming convention loops
                    if "-mobile" not in file: 
                        img_path = os.path.join(root, file)
                        optimize_image(img_path)
                        count += 1
    
    print(f"Finished. Scanned {count} source images.")

if __name__ == "__main__":
    main()
