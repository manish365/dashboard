import os
import re

SRC = r'c:\Users\manis\OneDrive\Desktop\poc\store\src'

# Pattern: className="existing" className="theme-xxx"
# Merge into: className="existing theme-xxx"
PATTERN = re.compile(r'className="([^"]*?)"\s+className="([^"]*?)"')

total_files = 0

for root, dirs, files in os.walk(SRC):
    dirs[:] = [d for d in dirs if d not in ['.next', 'node_modules', '__pycache__']]
    for fname in files:
        if not (fname.endswith('.tsx') or fname.endswith('.ts')):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if 'className=' not in content:
            continue

        original = content
        # Keep merging until no more duplicates (handles 3+ consecutive classNames)
        for _ in range(5):
            new_content = PATTERN.sub(lambda m: f'className="{m.group(1)} {m.group(2)}"', content)
            if new_content == content:
                break
            content = new_content

        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            total_files += 1
            print(f'Fixed: {os.path.relpath(fpath, SRC)}')

print(f'\nDone. Fixed {total_files} files.')
