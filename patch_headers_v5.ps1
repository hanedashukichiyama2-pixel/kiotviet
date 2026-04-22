$htmlFiles = Get-ChildItem "c:\xampp\htdocs\hasu_nentangso\*.html"
$newScript = @"
<script>
document.addEventListener('DOMContentLoaded', function() {
    var uName = localStorage.getItem('hasu_userName');
    var uEmail = localStorage.getItem('hasu_userEmail');
    if (!uName) return;

    function applyReplacements() {
        var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.nodeName)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }, false);
        var n;
        while(n = walk.nextNode()) {
            if (n.nodeValue.includes('Tester')) {
                n.nodeValue = n.nodeValue.replace(/Tester/g, uName);
            }
            if (uEmail && n.nodeValue.includes('tester@hasu.vn')) {
                n.nodeValue = n.nodeValue.replace(/tester@hasu\.vn/g, uEmail);
            }
        }
        
        // Also update standard inputs if they magically have Tester
        document.querySelectorAll('input').forEach(function(inp) {
            if (inp.value === 'Tester') inp.value = uName;
        });
    }

    // Run immediately
    applyReplacements();
    
    // Run after a short delay to catch dynamically rendered mock data (like Vue/React or inline JS renders)
    setTimeout(applyReplacements, 150);
    setTimeout(applyReplacements, 500);
});
</script>
"@

foreach ($file in $htmlFiles) {
    if ($file.Name -ne 'login.html') {
        $content = Get-Content $file.FullName -Raw
        
        # Remove any previously injected script (from v1, v2, v3, v4)
        $pattern = "(?s)<script>\s*document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*\{\s*var uName = localStorage\.getItem\('hasu_userName'\).*?<\/script>\s*"
        $content = $content -replace $pattern, ""
        
        # Safely inject at end
        $content = $content -replace "(?i)</body>\s*</html>\s*`$", "`n$newScript`n</body>`n</html>"
        
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Patched $($file.Name)"
    }
}
Write-Host "Done v5"
