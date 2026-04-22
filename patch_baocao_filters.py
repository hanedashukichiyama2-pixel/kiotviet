import re
import paramiko
import os

filepath = r"c:\xampp\htdocs\hasu_nentangso\baocao.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the layout to include filters
layout_replacement = """        <div class="page-body">
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
        r'<div class="page-body">.*?<div class="main-content".*?</div>.*?</div>',
        layout_replacement,
        content,
        flags=re.DOTALL
    )

# 2. Inject `loadRealData` script before the INIT block
load_script = """
/* ===== LOAD REAL DATA ===== */
function loadRealData() {
    try {
        const dStr = localStorage.getItem('hasu_completedOrders');
        if(!dStr) return;
        let inv = JSON.parse(dStr);

        const timeFilter = document.querySelector('input[name="timeFilter"]:checked');
        const tf = timeFilter ? timeFilter.value : 'month';
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startD, endD = new Date();
        
        if (tf === 'today') {
            startD = new Date(today);
        } else if (tf === 'yesterday') {
            startD = new Date(today); startD.setDate(startD.getDate() - 1);
            endD = new Date(startD); endD.setHours(23, 59, 59, 999);
        } else if (tf === 'week') {
            startD = new Date(today);
            let day = startD.getDay(); let diff = startD.getDate() - day + (day === 0 ? -6 : 1);
            startD.setDate(diff);
        } else if (tf === 'month') {
            startD = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (tf === 'quarter') {
            startD = new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1);
        } else {
            startD = new Date(0);
        }
        
        // Filter by Date
        inv = inv.filter(o => {
            const od = new Date(o.time.replace(' ', 'T'));
            if(isNaN(od)) return true;
            return od >= startD && od <= endD;
        });
        
        // Aggregate 'Cuối ngày'
        let rev = 0, netRev = 0, cash = 0, bank = 0;
        let _invoices = [];
        inv.forEach(o => {
            const r = o.finalTotal || o.total || 0;
            rev += r;
            if((o.paymentMethod || o.method) === 'Chuyển khoản') bank += r;
            else cash += r;
            
            _invoices.push({
                code: o.id || o.code,
                time: o.time.substring(5,16).replace('-','/'),
                customer: o.customerName || 'Khách lẻ',
                total: r,
                method: o.paymentMethod || o.method || 'Tiền mặt'
            });
        });
        
        D.cuoingay.revenue = rev;
        D.cuoingay.netRevenue = rev;
        D.cuoingay.orders = inv.length;
        D.cuoingay.cash = cash;
        D.cuoingay.bank = bank;
        D.cuoingay.returns = 0;
        D.cuoingay.returnVal = 0;
        D.cuoingay.avgOrder = inv.length > 0 ? Math.floor(rev / inv.length) : 0;
        D.cuoingay._invoices = _invoices.slice(0, 15);
        
        // Aggregate 'Bán hàng'
        const dailyMap = {};
        for(let i=6; i>=0; i--) {
            let d = new Date(); d.setDate(d.getDate() - i);
            let k = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0');
            dailyMap[k] = 0;
        }
        
        const prodMap = {};
        inv.forEach(o => {
            let d = new Date(o.time.replace(' ', 'T'));
            if(!isNaN(d)) {
                let k = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0');
                if(k in dailyMap) dailyMap[k] += (o.finalTotal || o.total || 0);
            }
            (o.items || []).forEach(it => {
                const name = it.name || it.productName || 'SP';
                if(!prodMap[name]) prodMap[name] = {name, qty: 0, revenue: 0, profit: 0};
                prodMap[name].qty += it.qty || 1;
                prodMap[name].revenue += (it.price || 0) * (it.qty||1);
            });
        });
        
        D.banhang.daily = Object.entries(dailyMap).map(([date, rv]) => ({date: date, rev: rv}));
        D.banhang.summary.revenue = rev;
        D.banhang.summary.netRevenue = rev;
        D.banhang.summary.orders = inv.length;
        D.banhang.top = Object.values(prodMap).sort((a,b)=>b.revenue-a.revenue).slice(0, 5);
        
    } catch(e) { console.warn(e); }
}

"""

if 'function loadRealData()' not in content:
    content = content.replace('/* ===== INIT ===== */', load_script + '\n\n/* ===== INIT ===== */')

# 3. Add loadRealData(); to INIT
if 'loadRealData();' not in content:
    content = re.sub(
        r"document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{",
        "document.addEventListener('DOMContentLoaded', () => {\n    if (typeof loadRealData === 'function') loadRealData();",
        content
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
    print("SUCCESS: baocao.html filters patched and uploaded!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
