import os
import re

workspace = r"c:\Users\Aidan\Downloads\signalform-briefs-main (2)"

# Define replacements
replacements = [
    (re.compile(r"Signalform Studio", re.IGNORECASE), "Briefs Studio"),
    (re.compile(r"Signalform", re.IGNORECASE), "Briefs Studio"),
    (re.compile(r"Signal Form", re.IGNORECASE), "Briefs Studio")
]

exclude_dirs = {"node_modules", ".git", ".agent", "brain", ".system_generated"}
include_exts = {".html", ".json", ".js", ".toml", ".md", ".rtf", ".css"}

modified_count = 0
file_count = 0

print("Starting whitelabel search and replace...")

for root, dirs, files in os.walk(workspace):
    # Skip excluded directories in place
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext not in include_exts:
            continue
            
        filepath = os.path.join(root, file)
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            new_content = content
            made_changes = False
            
            for pattern, replacement in replacements:
                if pattern.search(new_content):
                    new_content = pattern.sub(replacement, new_content)
                    made_changes = True
            
            if made_changes:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Whitelabeled: {os.path.relpath(filepath, workspace)}")
                modified_count += 1
            
            file_count += 1
        except Exception as e:
            print(f"Error processing {file}: {e}")

print(f"\nWhitelabel complete! Processed {file_count} files, updated {modified_count} files.")
