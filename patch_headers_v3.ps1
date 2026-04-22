$htmlFiles = Get-ChildItem "c:\xampp\htdocs\hasu_nentangso\*.html"
$newScript = @"
<script>
document.addEventListener('DOMContentLoaded', function() {
    var uName = localStorage.getItem('hasu_userName');
    var uEmail = localStorage.getItem('hasu_userEmail');
    if (uName) {
        var aPanel = document.getElementById('avatarPanel');
        if (aPanel) {
            var divs = aPanel.querySelectorAll('div');
            for (var i = 0; i < divs.length; i++) {
                if (divs[i].textContent.trim() === 'Tester') divs[i].textContent = uName;
                if (divs[i].textContent.trim() === 'tester@hasu.vn' && uEmail) divs[i].textContent = uEmail;
            }
        }
        
        var userPanel = document.getElementById('userPanel');
        if (userPanel) {
            var udivs = userPanel.querySelectorAll('div');
            for (var j = 0; j < udivs.length; j++) {
                if (udivs[j].textContent.trim() === 'Tester') udivs[j].textContent = uName;
                if (udivs[j].textContent.trim() === 'tester@hasu.vn' && uEmail) udivs[j].textContent = uEmail;
            }
        }

        var tbUser = document.querySelector('.toolbar-username');
        if (tbUser && tbUser.textContent.trim() === 'Tester') tbUser.textContent = uName;
    }
});
</script>
"@

foreach ($file in $htmlFiles) {
    if ($file.Name -ne 'login.html') {
        $content = Get-Content $file.FullName -Raw
        
        # Remove any previously injected script (from v1 or v2)
        $pattern = "(?s)<script>\s*document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*\{\s*var uName = localStorage\.getItem\('hasu_userName'\).*?<\/script>\s*"
        $content = $content -replace $pattern, ""
        
        $content = $content -replace "</body>", "$newScript`n</body>"
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Patched $($file.Name)"
    }
}
Write-Host "Done v3"
