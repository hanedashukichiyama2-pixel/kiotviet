import paramiko
import re

filepath = r"c:\xampp\htdocs\hasu_nentangso\baocao.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update loadRealData logic
robust_loader = """        /* ===== REAL DATA LOADER ===== */
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
        
        inv = inv.filter(o => {
            const od = new Date(o.time.replace(' ', 'T'));
            if(isNaN(od)) return true;
            return od >= startD && od <= endD;
        });
        
        // Aggregate 'Cuối ngày'
        let rev = 0, cash = 0, bank = 0;
        let _invoices = [];
        let pmtMap = {};
        
        inv.forEach(o => {
            const r = o.total || o.grandTotal || o.subtotal || o.finalTotal || 0;
            rev += r;
            
            let mth = o.paymentMethod || o.method || ((o.payments && o.payments[0]) ? o.payments[0].method : 'Tiền mặt');
            if (!pmtMap[mth]) pmtMap[mth] = 0;
            pmtMap[mth] += r;
            
            if(mth === 'Tiền mặt') cash += r;
            else bank += r;
            
            _invoices.push({
                code: o.id || o.code,
                time: (function(t){const d = new Date(t.replace(' ', 'T')); return (isNaN(d)?t:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'));})(o.time),
                customer: o.cxName || o.customerName || 'Khách lẻ',
                total: r,
                method: mth
            });
        });
        
        const pmtArr = [];
        for (let k in pmtMap) {
            pmtArr.push({ name: k, amount: pmtMap[k], pct: rev > 0 ? Math.round((pmtMap[k] / rev) * 100) : 0 });
        }
        
        D.cuoingay.revenue = rev;
        D.cuoingay.netRevenue = rev;
        D.cuoingay.orders = inv.length;
        D.cuoingay.cash = cash;
        D.cuoingay.bank = bank;
        D.cuoingay.payments = pmtArr;
        D.cuoingay.returns = 0;
        D.cuoingay.returnVal = 0;
        D.cuoingay.avgOrder = inv.length > 0 ? Math.floor(rev / inv.length) : 0;
        D.cuoingay._invoices = _invoices.reverse().slice(0, 15);
        
        // Aggregate 'Bán hàng' Daily Chart
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
                if(k in dailyMap) dailyMap[k] += (o.total || o.grandTotal || o.subtotal || o.finalTotal || 0);
            }
            (o.items || o.cart || []).forEach(it => {
                const name = it.name || it.productName || 'SP';
                if(!prodMap[name]) prodMap[name] = {name, qty: 0, revenue: 0, profit: 0};
                prodMap[name].qty += it.qty || it.quantity || 1;
                prodMap[name].revenue += (it.price || 0) * (it.qty || it.quantity || 1);
            });
        });
        
        D.banhang.daily = Object.entries(dailyMap).map(([date, rv]) => ({date: date, rev: rv}));
        D.banhang.summary.revenue = rev;
        D.banhang.summary.netRevenue = rev;
        D.banhang.summary.orders = inv.length;
        D.banhang.top = Object.values(prodMap).sort((a,b)=>b.revenue-a.revenue).slice(0, 5);
        
    } catch(e) { console.warn('baocao loadRealData:', e); }
}"""

content = re.sub(r'/\* ===== REAL DATA LOADER ===== \*/.*?(?=/\* ===== INIT ===== \*/)', robust_loader + '\n\n', content, flags=re.DOTALL)


# 2. Update renderCuoiNgay logic to construct conic gradients dynamically
render_cuoingay = """        /* --- Cuối ngày --- */
        function renderCuoiNgay() {
            const d = D.cuoingay;
            const pmts = d.payments || [];
            const colors = ['var(--blue)', '#43a047', '#f57c00', '#7b1fa2', '#e53935', '#00acc1'];
            
            let conic = '', pctCum = 0;
            const validPmts = pmts.filter(p => p.amount > 0);
            if (validPmts.length === 0) {
                conic = '#eee 0% 100%';
            } else {
                validPmts.forEach((p, i) => { 
                    const c = colors[i % colors.length];
                    conic += `${c} ${pctCum}% ${pctCum + p.pct}%,`; 
                    pctCum += p.pct; 
                });
                conic = conic.slice(0, -1);
            }

            return `
      <div class="stat-row">
        <div class="stat-card"><div class="sc-label">Doanh thu</div><div class="sc-value blue">${fmt(d.revenue)}</div></div>
        <div class="stat-card green"><div class="sc-label">Doanh thu thuần</div><div class="sc-value green">${fmt(d.netRevenue)}</div></div>
        <div class="stat-card"><div class="sc-label">Số hóa đơn</div><div class="sc-value">${d.orders}</div></div>
        <div class="stat-card red"><div class="sc-label">Trả hàng</div><div class="sc-value red">${d.returns} (${fmt(d.returnVal)})</div></div>
      </div>
      <div class="stat-row">
        <div class="stat-card"><div class="sc-label">Tiền mặt thu</div><div class="sc-value">${fmt(d.cash)}</div></div>
        <div class="stat-card"><div class="sc-label">Chuyển khoản (Khác)</div><div class="sc-value">${fmt(d.revenue - d.cash)}</div></div>
        <div class="stat-card orange"><div class="sc-label">Trung bình / đơn</div><div class="sc-value">${fmt(d.avgOrder)}</div></div>
      </div>
      <div class="chart-card">
        <div class="chart-header"><div class="chart-title">Phân bổ doanh thu theo phương thức thanh toán</div></div>
        <div style="display:flex;align-items:center;gap:40px;padding:20px 0">
          <div style="width:160px;height:160px;border-radius:50%;background:conic-gradient(${conic});position:relative;flex-shrink:0">
            <div style="position:absolute;inset:25%;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#333">${fmt(d.revenue)}</div>
          </div>
          <div>
            ${validPmts.map((p, i) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div class="legend-dot" style="background:${colors[i % colors.length]}"></div><span style="font-size:13px">${p.name}: <strong>${fmt(p.amount)}</strong> (${p.pct}%)</span></div>`).join('')}
            ${validPmts.length === 0 ? `<span style="font-size:13px;color:#999">Chưa có dữ liệu thanh toán</span>` : ''}
          </div>
        </div>
      </div>
      <div class="table-card">
        <div class="table-header"><div class="table-title">Chi tiết hóa đơn trong ngày</div>
          <div class="table-actions"><button class="tbl-btn"><i class="fa-solid fa-file-export"></i> Xuất file</button></div>
        </div>
        <table><thead><tr><th>Mã HĐ</th><th>Thời gian</th><th>Khách hàng</th><th class="right">Tổng tiền</th><th class="center">Thanh toán</th></tr></thead>
        <tbody>
          ${(d._invoices||[]).map(r=>`<tr><td class="tbl-code">${r.code}</td><td>${r.time}</td><td>${r.customer}</td><td class="right">${fmt(r.total)}</td><td class="center">${r.method}</td></tr>`).join('')}</tbody></table>
      </div>`;
        }"""

content = re.sub(r'/\* --- Cuối ngày --- \*/.*?function renderBanHang\(\)', render_cuoingay + '\n\n        /* --- Bán hàng --- */\n        function renderBanHang()', content, flags=re.DOTALL)

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
    print("SUCCESS: Payment dynamics patched and uploaded!")
except Exception as e:
    print(f"Error: {e}")
finally:
    ssh.close()
