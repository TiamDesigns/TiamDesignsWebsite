import os
import re

# Directories to scan
TARGET_DIR = r"c:\Users\tiamb\Documents\Coding\TiamDesignsWebsite"
HTML_EXTENSIONS = {'.html', '.htm'}

def is_external_link(url):
    """Checks if a URL is external."""
    if not url:
        return False
    # Check for absolute URLs that are not localhost or internal
    if url.startswith('http://') or url.startswith('https://'):
        if 'localhost' in url or '127.0.0.1' in url:
            return False
        # Add your own domain here if you have one deployed, e.g. 'tiamdesigns.com'
        # if 'tiamdesigns.com' in url: return False
        return True
    return False

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find <a> tags
    # This is a basic regex and might not cover all edge cases, but suffice for this task
    # It captures the opening <a ... > tag
    link_pattern = re.compile(r'<a\s+([^>]*)>', re.IGNORECASE)
    
    modified_content = content
    modifications = 0

    def replace_link(match):
        nonlocal modifications
        attrs_str = match.group(1)
        
        # Parse attributes loosely
        href_match = re.search(r'href=["\']([^"\']*)["\']', attrs_str, re.IGNORECASE)
        if not href_match:
            return match.group(0) # No href, ignore
            
        href = href_match.group(1)
        
        if is_external_link(href):
            new_attrs = attrs_str
            
            # 1. Add rel="noopener noreferrer"
            if 'rel=' in new_attrs:
                # If rel exists, check if it has noopener noreferrer
                rel_match = re.search(r'rel=["\']([^"\']*)["\']', new_attrs, re.IGNORECASE)
                if rel_match:
                    current_rel = rel_match.group(1)
                    if 'noopener' not in current_rel or 'noreferrer' not in current_rel:
                        # naive append, better to replace ensuring uniqueness but this is safe
                        new_rel = current_rel
                        if 'noopener' not in new_rel: new_rel += ' noopener'
                        if 'noreferrer' not in new_rel: new_rel += ' noreferrer'
                        new_attrs = new_attrs.replace(f'rel="{current_rel}"', f'rel="{new_rel.strip()}"')
                        new_attrs = new_attrs.replace(f"rel='{current_rel}'", f"rel='{new_rel.strip()}'")
            else:
                new_attrs += ' rel="noopener noreferrer"'
            
            # 2. Add target="_blank" if missing (usually preferred for external, user didn't explicitly ask but good practice)
            # User only asked for rel and visual indicator. Let's stick to user request + security.
            # actually user asked for visual indicator, which often implies target blank, but let's just add the class.
            
            # 3. Add class="external-link"
            if 'class=' in new_attrs:
                class_match = re.search(r'class=["\']([^"\']*)["\']', new_attrs, re.IGNORECASE)
                if class_match:
                    current_class = class_match.group(1)
                    if 'external-link' not in current_class:
                        new_class = f"{current_class} external-link"
                        new_attrs = new_attrs.replace(f'class="{current_class}"', f'class="{new_class}"')
                        new_attrs = new_attrs.replace(f"class='{current_class}'", f"class='{new_class}'")
            else:
                new_attrs += ' class="external-link"'
            
            if new_attrs != attrs_str:
                modifications += 1
                return f'<a {new_attrs}>'
        
        return match.group(0)

    modified_content = link_pattern.sub(replace_link, content)

    if modifications > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        print(f"Updated {os.path.basename(file_path)}: {modifications} links secured.")
    else:
        print(f"No changes needed for {os.path.basename(file_path)}.")

def main():
    print("Scanning for external links...")
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if os.path.splitext(file)[1].lower() in HTML_EXTENSIONS:
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
