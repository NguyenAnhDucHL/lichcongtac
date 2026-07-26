import os

target_dir = '/Users/macbookpro/lichcongtac'

# 1. Update file contents
for root, dirs, files in os.walk(target_dir):
    # Exclude directories
    if '.git' in root or 'node_modules' in root or '/bin' in root or '/obj' in root or '/data_dump' in root:
        continue
    for file in files:
        if file.endswith('.cs') or file.endswith('.json') or file.endswith('.md') or file.endswith('.js') or file.endswith('.jsx') or file.endswith('.yml') or file == 'Dockerfile':
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace('ToolCalendar', 'LichCongTac')
                new_content = new_content.replace('Tool-Calendar', 'LichCongTac')
                new_content = new_content.replace('Tool_Calendar', 'LichCongTac')
                
                # If it's an .agents file, also replace tc- with lc-
                if '.agents' in root:
                    new_content = new_content.replace('tc-', 'lc-')
                    new_content = new_content.replace('TC-', 'LC-')
                
                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated content in {filepath}")
            except Exception as e:
                print(f"Could not process {filepath}: {e}")

# 2. Rename files and folders in .agents
agents_dir = os.path.join(target_dir, '.agents')
for root, dirs, files in os.walk(agents_dir, topdown=False):
    for name in files + dirs:
        if name.startswith('tc-'):
            old_path = os.path.join(root, name)
            new_name = name.replace('tc-', 'lc-', 1)
            new_path = os.path.join(root, new_name)
            os.rename(old_path, new_path)
            print(f"Renamed {old_path} -> {new_path}")
