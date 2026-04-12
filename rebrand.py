import os

replacements = [
    ("Store Incentive", "weboffice"),
    ("Store", "Store"),
    ("store", "store")
]

extensions = [".tsx", ".ts", ".css", ".json", ".md", ".html"]
exclude_dirs = ["node_modules", ".next", ".git", ".gemini"]

def rebrand():
    for root, dirs, files in os.walk("."):
        # Prune excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    new_content = content
                    modified = False
                    
                    for old, new in replacements:
                        if old in new_content:
                            new_content = new_content.replace(old, new)
                            modified = True
                    
                    if modified:
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Updated: {file_path}")
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    rebrand()
