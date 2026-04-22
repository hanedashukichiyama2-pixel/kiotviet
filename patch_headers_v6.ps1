$htmlFiles = Get-ChildItem "c:\xampp\htdocs\hasu_nentangso\*.html"
$newScript = @"
<script>
document.addEventListener('DOMContentLoaded', function() {
    var uName = localStorage.getItem('hasu_userName');
    var uEmail = localStorage.getItem('hasu_userEmail');
    if (!uName) return;

    var isAdmin = (uEmail === 'admin@hasu.vn' || uEmail === 'tester@hasu.vn');

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
        
        document.querySelectorAll('input').forEach(function(inp) {
            if (inp.value === 'Tester') inp.value = uName;
        });

        // Hide mock history explicitly for newly created non-admin users
        if (!isAdmin) {
            document.querySelectorAll('.activity-item, .tl-history-row, tr').forEach(function(el) {
                var txt = el.textContent;
                // If it contains hardcoded deep mock past dates in the frontend UI
                if (txt.includes('ngày trước') || txt.includes('14/03') || txt.includes('23 ngày trước')) {
                    el.style.display = 'none';
                }
            });
            // If the activity list becomes visually empty, show empty state
            var aList = document.getElementById('activityList');
            if (aList && Array.from(aList.children).filter(function(x){ return x.style.display !== 'none'; }).length === 0) {
                aList.innerHTML = '<div style="padding:30px;text-align:center;color:#bbb">Chưa có hoạt động nào</div>';
            }
        }
    }

    applyReplacements();
    setTimeout(applyReplacements, 150);
    setTimeout(applyReplacements, 500);
});
</script>
"@

foreach ($file in $htmlFiles) {
    if ($file.Name -ne 'login.html') {
        $content = Get-Content $file.FullName -Raw
        
        # Remove any previously injected script
        $pattern = "(?s)<script>\s*document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*\{\s*var uName = localStorage\.getItem\('hasu_userName'\).*?<\/script>\s*"
        $content = $content -replace $pattern, ""
        
        # Safely inject at end
        $content = $content -replace "(?i)</body>\s*</html>\s*`$", "`n$newScript`n</body>`n</html>"
        
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    }
}
Write-Host "Done v6"
