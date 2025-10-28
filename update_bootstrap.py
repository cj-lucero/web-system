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

# Common head content with Bootstrap
head_content = '''  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Climate Crisis Hub - {title}</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Custom CSS -->
  <link rel="stylesheet" href="style.css">
  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
'''

# Navigation bar HTML
nav_bar = '''  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <a class="navbar-brand" href="index.html">Climate Crisis Hub</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link {home_active}" href="index.html"><i class="bi bi-house-door"></i> Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {about_active}" href="about.html"><i class="bi bi-info-circle"></i> About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {causes_active}" href="causes.html"><i class="bi bi-exclamation-triangle"></i> Causes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {effects_active}" href="effects.html"><i class="bi bi-activity"></i> Effects</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {ph_active}" href="philippines.html"><i class="bi bi-geo-alt"></i> Philippines</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {stats_active}" href="statistics.html"><i class="bi bi-graph-up"></i> Statistics</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {videos_active}" href="videos.html"><i class="bi bi-play-circle"></i> Videos</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {move_active}" href="movement.html"><i class="bi bi-people"></i> Movement</a>
          </li>
          <li class="nav-item">
            <a class="nav-link {arctic_active}" href="arctic-help.html"><i class="bi bi-snow2"></i> Arctic Help</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>'''

# Bootstrap JS and other scripts
end_body = '''  <!-- Bootstrap JS Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>'''

def update_file(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Get page title
        title_match = re.search(r'<title>(.*?)</title>', content)
        title = title_match.group(1).replace('Climate Crisis Hub - ', '') if title_match else 'Climate Crisis Hub'
        
        # Determine active page for navigation
        active_pages = {
            'home_active': 'active' if 'index.html' in filename else '',
            'about_active': 'active' if 'about.html' in filename else '',
            'causes_active': 'active' if 'causes.html' in filename else '',
            'effects_active': 'active' if 'effects.html' in filename else '',
            'ph_active': 'active' if 'philippines.html' in filename else '',
            'stats_active': 'active' if 'statistics.html' in filename else '',
            'videos_active': 'active' if 'videos.html' in filename else '',
            'move_active': 'active' if 'movement.html' in filename else '',
            'arctic_active': 'active' if 'arctic-help.html' in filename else ''
        }
        
        # Replace head section
        new_head = head_content.format(title=title)
        content = re.sub(r'<head>.*?</head>', f'<head>\n{new_head}</head>', content, flags=re.DOTALL)
        
        # Replace navigation
        current_nav = nav_bar.format(**active_pages)
        content = re.sub(r'<header class="navbar">.*?</header>', current_nav, content, flags=re.DOTALL)
        content = re.sub(r'<nav class="navbar">.*?</nav>', current_nav, content, flags=re.DOTALL)
        
        # Add Bootstrap JS before closing body
        content = re.sub(r'</body>.*?</html>', end_body, content, flags=re.DOTALL)
        
        # Save the updated content
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"Updated {filename}")
        return True
    except Exception as e:
        print(f"Error updating {filename}: {str(e)}")
        return False

# Update all HTML files
for html_file in html_files:
    if os.path.exists(html_file):
        update_file(html_file)
    else:
        print(f"File not found: {html_file}")
