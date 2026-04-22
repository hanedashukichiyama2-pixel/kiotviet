$htmlPath = "C:\xampp\htdocs\hasu_nentangso\word.html"
$docxPath = "C:\xampp\htdocs\hasu_nentangso\Huong_dan_su_dung_HASU_Platform.docx"

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($htmlPath)
    
    # 16 is wdFormatDocumentDefault
    $doc.SaveAs([ref]$docxPath, [ref]16)
    
    $doc.Close()
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word)
    echo "SUCCESS"
} catch {
    echo "FAILED: $_"
}
