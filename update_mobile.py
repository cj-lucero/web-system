import os
import re

# List of HTML files to update
html_files = [
    'index.html',
    'about.html',
    'causes.html',
    'effects.html',
    'philippines.html',
    'statistics.html',
    'videos.html',
    'movement.html',
    'arctic-help.html',
    'climate change.html'
]

def update_mobile_optimization(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Update viewport meta tag for better mobile support
        content = re.sub(
            r'<meta name="viewport" content="width=device-width, initial-scale=1\.0">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
            content
        )
        
        # Add mobile-specific meta tags if not present
        if 'apple-mobile-web-app-capable' not in content:
            content = re.sub(
                r'<meta name="viewport"[^>]*>',
                lambda m: m.group(0) + '\n  <!-- Mobile optimization meta tags -->\n  <meta name="apple-mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <meta name="format-detection" content="telephone=no">',
                content
            )
        
        # Ensure sections have proper mobile container structure
        content = re.sub(
            r'<section class="([^"]*)">',
            lambda m: f'<section class="{m.group(1)} container-fluid">',
            content
        )
        
        # Add responsive image classes
        content = re.sub(
            r'<img([^>]*?)>',
            lambda m: f'<img{m.group(1)} class="img-fluid">',
            content
        )
        
        # Ensure tables are responsive
        content = re.sub(
            r'<table([^>]*?)>',
            lambda m: f'<div class="table-responsive"><table{m.group(1)}>',
            content
        )
        content = re.sub(
            r'</table>',
            '</table></div>',
            content
        )
        
        # Add mobile-friendly button classes
        content = re.sub(
            r'<a class="btn-green"',
            '<a class="btn-green btn btn-success d-block d-md-inline-block"',
            content
        )
        
        # Save the updated content
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"Updated mobile optimization for {filename}")
        return True
    except Exception as e:
        print(f"Error updating {filename}: {str(e)}")
        return False

# Update all HTML files
for html_file in html_files:
    if os.path.exists(html_file):
        update_mobile_optimization(html_file)
    else:
        print(f"File not found: {html_file}")

print("Mobile optimization complete!")
