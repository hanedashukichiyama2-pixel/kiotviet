$files = Get-ChildItem -Path c:\xampp\htdocs\hasu_nentangso -Filter *.html
foreach ($file in $files) {
    $c = Get-Content $file.FullName -Raw
    
    $c = $c -replace '(?s)let tableData = \[.*?\];', 'let tableData = [];'
    $c = $c -replace '(?s)var tableData = \[.*?\];', 'var tableData = [];'
    $c = $c -replace '(?s)const tableData = \[.*?\];', 'const tableData = [];'
    
    $c = $c -replace '(?s)const ACTIVITIES = \[.*?\];', 'const ACTIVITIES = [];'
    $c = $c -replace '(?s)const historyList = \[.*?\];', 'const historyList = [];'
    
    Set-Content $file.FullName $c -Encoding UTF8
}
Write-Host "Wipe done."
