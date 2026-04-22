import re
import paramiko
import os

filepath = r"c:\xampp\htdocs\hasu_nentangso\baocao.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

layout_replacement = """        <!-- SUB TABS -->
        <div class="sub-tabs" id="subTabs"></div>
        <div class="page-body">
            <aside class="sidebar">
                <div class="sb-title">Bộ lọc</div>
                <div class="filter-sec"><span class="f-label">Thời gian</span>
                    <div class="f-radio-group">
                        <label><input name="timeFilter" onchange="loadRealData();renderReport()" type="radio" value="today" />Hôm nay</label>
                        <label><input name="timeFilter" onchange="loadRealData();renderReport()" type="radio" value="yesterday" />Hôm qua</label>
                        <label><input name="timeFilter" onchange="loadRealData();renderReport()" type="radio" value="week" />Tuần này</label>
                        <label><input checked="" name="timeFilter" onchange="loadRealData();renderReport()" type="radio" value="month" />Tháng này</label>
                        <label><input name="timeFilter" onchange="loadRealData();renderReport()" type="radio" value="quarter" />Quý này</label>
                    </div>
                </div>
                <div class="filter-sec"><span class="f-label">Chi nhánh</span><select class="filter-select" onchange="loadRealData();renderReport()">
                    <option>Tất cả chi nhánh</option>
                    <option>BHS Bình Than</option>
                </select></div>
                <div class="filter-sec" id="extraFilters"></div>
            </aside>
            <div class="main-content" id="reportContent"></div>
        </div>"""

if '<aside class="sidebar">' not in content:
    content = re.sub(
        r'<div class="sub-tabs" id="subTabs"></div>.*?<div class="main-content" id="reportContent"></div>',
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
    print("SUCCESS: baocao.html anchor patched and uploaded!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
