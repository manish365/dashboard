import os

SRC = r'c:\Users\manis\OneDrive\Desktop\poc\store\src'

# Only non-conditional, non-dynamic patterns remaining
SIMPLE = [
    # learnpath roadmap new/[id] - static patterns
    (" style={{ borderColor: 'rgba(0,233,191,0.3)', color: 'var(--text-color)' }}", ' className="theme-text" style={{ borderColor: \'rgba(0,233,191,0.3)\' }}'),
    (" style={{ borderColor: 'rgba(0,233,191,0.2)', color: 'var(--circle)' }}", ' className="theme-text-subtle" style={{ borderColor: \'rgba(0,233,191,0.2)\' }}'),
    # learnpath learner roadmap - gradient (uses CSS var but is a gradient - keep as style, just fix the var part)
    (" style={{ background: 'linear-gradient(90deg, var(--neon-green), transparent)' }}", ' className="theme-neon-gradient"'),
    # permissions page
    (" style={{ background: 'var(--store-wall)', color: 'var(--circle)' }}", ' className="theme-card-bg theme-text-subtle"'),
    # falcon-tree conditional (multi-line) - skip, it's dynamic
    # kpi-tree breadcrumb - conditional, skip
    # submissions
    (" style={{ borderColor: 'var(--border-color)', color: '#f87171' }}", ' className="theme-border theme-text-danger"'),
]

total_files = 0

for root, dirs, files in os.walk(SRC):
    dirs[:] = [d for d in dirs if d not in ['.next', 'node_modules', '__pycache__']]
    for fname in files:
        if not (fname.endswith('.tsx') or fname.endswith('.ts')):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        if 'style={{' not in content:
            continue
        original = content
        for old, new in SIMPLE:
            content = content.replace(old, new)
        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            total_files += 1
            print(f'Updated: {os.path.relpath(fpath, SRC)}')

print(f'\nDone. Updated {total_files} files.')
