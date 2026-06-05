import os
import re
import json

workspace_dir = r"c:\DHIRA\2026\EIS 2026"
v4_dir = os.path.join(workspace_dir, "v4")

# List of pages to compile
html_pages = [
    "Home.html",
    "Assistant.html",
    "Approvals.html",
    "ClientProfile.html",
    "Clients.html",
    "Collections.html",
    "Decisions.html",
    "Documents.html",
    "EmployeeProfile.html",
    "Employees.html",
    "Financials.html",
    "Horizon.html",
    "IntegrationHealth.html",
    "Mobile.html",
    "Pipeline.html",
    "PracticePL.html",
    "ProjectProfile.html",
    "Projects.html",
    "Settings.html",
    "Skills.html"
]

# Read stylesheet and script files
def read_file(filename):
    filepath = os.path.join(v4_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return ""

compiled_pages = {}

for page in html_pages:
    content = read_file(page)
    if not content:
        print(f"Warning: {page} not found.")
        continue

    # Inline CSS files
    def replace_css(match):
        css_file = match.group(1)
        css_content = read_file(css_file)
        return f"<style>\n/* Inlined {css_file} */\n{css_content}\n</style>"

    content = re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>', replace_css, content)

    # Inline JS files
    def replace_js(match):
        js_file = match.group(1)
        js_content = read_file(js_file)
        return f"<script>\n/* Inlined {js_file} */\n{js_content}\n</script>"

    content = re.sub(r'<script\s+src="([^"]+)"></script>', replace_js, content)

    # Replace location.href and window.location.href with window.AK_navigate
    # Match pattern: (window.)?location.href = ...
    content = re.sub(r'(?:window\.)?location\.href\s*=\s*([^;\}"]+)(;|\})?', r'window.AK_navigate(\1)\2', content)

    # Inject our navigation interceptor script before the closing </body> tag
    interceptor_script = """
<script>
// Define navigation wrapper
window.AK_navigate = function(url) {
  window.parent.postMessage({ type: 'navigate', target: url }, '*');
};

// Intercept click on local links
document.addEventListener('click', function(e) {
  var anchor = e.target.closest('a');
  if (anchor) {
    var href = anchor.getAttribute('href');
    if (href) {
      // If it ends with .html, intercept and navigate
      var cleanHref = href.split('#')[0].split('?')[0];
      if (cleanHref.endsWith('.html') && !href.startsWith('http') && !href.startsWith('//')) {
        e.preventDefault();
        window.parent.postMessage({ type: 'navigate', target: href }, '*');
      }
    }
  }
});
</script>
"""
    content = content.replace("</body>", f"{interceptor_script}\n</body>")
    compiled_pages[page] = content

# Create the master index file
master_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Akashic EIS — Single File Prototype</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #fbfbfb;
      font-family: system-ui, -apple-system, sans-serif;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      margin: 0;
      padding: 0;
      display: block;
    }
  </style>
</head>
<body>

  <iframe id="app-viewport" srcdoc=""></iframe>

  <script>
    // Dictionary of all compiled page contents
    const PAGES = %%PAGES_JSON%%;

    const viewport = document.getElementById('app-viewport');
    let lastLoadedPage = "";

    function showPage(pageName) {
      // Clean hash and query params
      const cleanName = pageName.split('#')[0].split('?')[0];
      if (PAGES[cleanName]) {
        // Set the srcdoc
        viewport.srcdoc = PAGES[cleanName];
        lastLoadedPage = pageName;
        // Update hash to match the navigation
        if (window.location.hash.substring(1) !== pageName) {
          window.location.hash = pageName;
        }
      } else {
        console.error("Page not found:", cleanName);
        // Fallback to Home
        if (cleanName !== "Home.html") {
          showPage("Home.html");
        }
      }
    }

    // Listen to messages from nested pages
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'navigate') {
        showPage(e.data.target);
      }
    });

    // Initial page load
    window.addEventListener('load', function() {
      let initialPage = window.location.hash.substring(1) || 'Home.html';
      showPage(initialPage);
    });

    // Handle history navigation (back/forward)
    window.addEventListener('hashchange', function() {
      let currentPage = window.location.hash.substring(1) || 'Home.html';
      if (currentPage !== lastLoadedPage) {
        showPage(currentPage);
      }
    });
  </script>
</body>
</html>
"""

# Replace placeholder with JSON string of pages
pages_json = json.dumps(compiled_pages).replace("</script>", "<\\/script>").replace("</SCRIPT>", "<\\/SCRIPT>")
master_html = master_html.replace("%%PAGES_JSON%%", pages_json)

output_path = os.path.join(workspace_dir, "Akashic_EIS_SingleFile.html")
with open(output_path, "w", encoding="utf-8") as f:
    f.write(master_html)

print(f"Success! Master file created at: {output_path}")
