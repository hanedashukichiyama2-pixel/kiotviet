$htmlFiles = Get-ChildItem "c:\xampp\htdocs\hasu_nentangso\*.html"
$newScript = @"
<script>
document.addEventListener('DOMContentLoaded', function() {
    var uName = localStorage.getItem('hasu_userName');
    var uEmail = localStorage.getItem('hasu_userEmail');
    if (uName) {
        // Handle older tongquan.html variants
        var aPanel = document.getElementById('avatarPanel');
        if (aPanel) {
            var nDiv = aPanel.querySelector('div[style*="font-weight:600"]');
            var eDiv = aPanel.querySelector('div[style*="color:#888"]');
            if (nDiv) nDiv.textContent = uName;
            if (eDiv && uEmail) eDiv.textContent = uEmail;
        }
        
        // Handle modern management_vps.html variants
        var userPanel = document.getElementById('userPanel');
        if (userPanel) {
            var nDivUser = userPanel.querySelector('div[style*="font-weight:600"]');
            if (nDivUser) nDivUser.textContent = uName;
        }

        // Handle POS sale.html toolbar variants explicitly if they fall under the generic loop
        var tbUser = document.querySelector('.toolbar-username');
        if (tbUser) tbUser.textContent = uName;
    }
});
</script>
"@

foreach ($file in $htmlFiles) {
    if ($file.Name -ne 'login.html') {
        $content = Get-Content $file.FullName -Raw
        
        # Remove any previously injected script (it starts with <script>\r\ndocument...hasu_userName)
        $pattern = "(?s)<script>\s*document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*\{\s*var uName = localStorage\.getItem\('hasu_userName'\).*?<\/script>\s*"
        $content = $content -replace $pattern, ""
        
        $content = $content -replace "</body>", "$newScript`n</body>"
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.Name)"
    }
}
Write-Host "Done"
