$htmlFiles = Get-ChildItem "c:\xampp\htdocs\hasu_nentangso\*.html"
$script = @"
<script>
document.addEventListener('DOMContentLoaded', function() {
    var uName = localStorage.getItem('hasu_userName');
    var uEmail = localStorage.getItem('hasu_userEmail');
    if (uName || uEmail) {
        var aPanel = document.getElementById('avatarPanel');
        if (aPanel) {
            var nDiv = aPanel.querySelector('div[style*="font-weight:600"]');
            var eDiv = aPanel.querySelector('div[style*="color:#888"]');
            if (nDiv && uName) nDiv.textContent = uName;
            if (eDiv && uEmail) eDiv.textContent = uEmail;
        }
    }
});
</script>
"@

foreach ($file in $htmlFiles) {
    if ($file.Name -ne 'login.html' -and $file.Name -ne 'sale.html') {
        $content = Get-Content $file.FullName -Raw
        if ($content -notmatch "localStorage.getItem\('hasu_userName'\)") {
            $content = $content -replace "</body>", "$script`n</body>"
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "Patched $($file.Name)"
        }
    }
}
Write-Host "Done"
