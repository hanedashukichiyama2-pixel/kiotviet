import re
import paramiko

filepath = r"c:\xampp\htdocs\hasu_nentangso\baocao.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

layout_replacement = """    <!-- BODY -->
    <div class="page-body">
        <aside class="sidebar">
            <div class="sb-title">Bộ lọc</div>
            <div class="filter-sec">
                <span class="f-label">Thời gian</span>
                <div class="f-radio-group">
                    <label><input type="radio" name="timeFilter" value="today" onchange="loadRealData();renderReport()"> Hôm
                        nay</label>
                    <label><input type="radio" name="timeFilter" value="yesterday" onchange="loadRealData();renderReport()"> Hôm
                        qua</label>
                    <label><input type="radio" name="timeFilter" value="week" onchange="loadRealData();renderReport()"> Tuần
                        này</label>
                    <label><input type="radio" name="timeFilter" value="month" checked onchange="loadRealData();renderReport()"> Tháng
                        này</label>
                    <label><input type="radio" name="timeFilter" value="quarter" onchange="loadRealData();renderReport()"> Quý
                        này</label>
                </div>
            </div>
            <div class="filter-sec">
                <span class="f-label">Chi nhánh</span>
                <select class="filter-select" onchange="loadRealData();renderReport()">
                    <option>Tất cả chi nhánh</option>
                    <option>BHS Bình Than</option>
                </select>
            </div>
            <div class="filter-sec" id="extraFilters"></div>
        </aside>
        <div class="main-content" id="reportContent"></div>
    </div>"""


# Regex replacement for the entire BODY section and page-body class
if '<aside class="sidebar">' not in content:
    content = re.sub(
        r'<!-- BODY -->\s*<div class="page-body">\s*<div class="main-content" id="reportContent"></div>\s*</div>',
        layout_replacement,
        content,
        flags=re.DOTALL
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# SFTP Sync
host = "45.119.83.233"
username = "root"
password = "nSmaPGEY39"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=username, password=password)
    sftp = ssh.open_sftp()
    sftp.put(filepath, '/var/www/demo.trangha2004.online/baocao.html')
    sftp.close()
    print("SUCCESS: baocao.html FINAL anchor patched and uploaded!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
