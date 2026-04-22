// KiotViet Sale - Full Featured JS
document.addEventListener('DOMContentLoaded', function () {
    initLocalDB(); // Load products + customers from localStorage first
    injectFeatureCSS();
    initModeSwitch();
    initProductGrid();
    initThuongGrid();
    initCart();
    initPayment();
    initSearch();
    initCustomerSearch();
    initMultiTab();
    initHotkeys();
    initMenuDropdown();
    initToolbarButtons();
    initBarcodeScanner();
    fixGiaoHangBugs();
    initStaffDropdown();
    updateDatetime();
    setInterval(updateDatetime, 60000);
});

// Inject additional CSS for new features (without touching sale.css)
function injectFeatureCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .product-price { color:#0090DA; font-size:13px; font-weight:600; margin-top:2px; text-align:center; }
        .product-stock { font-size:11px; margin-top:1px; text-align:center; font-weight:500; }
        .product-stock.in-stock { color:#27ae60; }
        .product-stock.low-stock { color:#f39c12; }
        .product-stock.out-of-stock { color:#e74c3c; font-weight:700; }
        /* R27: Bán Thường — stock quantity below product name */
        .thuong-grid-item { display:flex; flex-direction:column; }
        .thuong-grid-item .thuong-name { font-size:12px; font-weight:600; line-height:1.3; }
        .thuong-grid-item .thuong-stock-row { font-size:10px; margin-top:2px; }
        .thuong-grid-stock { font-size:10px; margin-top:1px; }
        .thuong-grid-stock.in-stock { color:#27ae60; }
        .thuong-grid-stock.low-stock { color:#f39c12; }
        .thuong-grid-stock.out-of-stock { color:#e74c3c; font-weight:700; }
        .customer-info-badge { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; padding:4px 8px; background:#F5F7FA; border-radius:6px; font-size:11px; }
        .customer-info-badge .ci-item { display:flex; align-items:center; gap:3px; color:#555; }
        .customer-info-badge .ci-item i { font-size:10px; color:#0090DA; }
        .customer-info-badge .ci-label { color:#999; }
        .customer-info-badge .ci-value { font-weight:600; color:#333; }
        .multi-pay-split { margin:6px 0;padding:8px 10px;background:#F0F8FF;border:1px solid #B3D9F2;border-radius:8px;font-size:12px; }
        .multi-pay-split .split-row { display:flex;align-items:center;gap:6px;margin:4px 0; }
        .multi-pay-split .split-row label { min-width:90px;font-size:11px;color:#555; }
        .multi-pay-split .split-row input { flex:1;border:1px solid #D0D5DD;border-radius:4px;padding:4px 6px;text-align:right;font-size:12px;outline:none; }
        .multi-pay-split .split-row input:focus { border-color:#0090DA; }
        .cart-total-qty { display:flex;align-items:center;gap:6px;padding:6px 10px;background:#EEF7FF;border-radius:6px;margin-top:4px;font-size:12px;color:#0090DA;font-weight:600; }
        .cart-total-qty i { font-size:11px; }
        .cart-header-row { background:#F5F5F5; font-weight:600; font-size:11px; color:#666; padding:6px 8px; border-bottom:1px solid #E0E0E0; }
        .cart-row .cart-name { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pay-method-btn.active { background:#E8F4FD!important; border-color:#0090DA!important; color:#0090DA!important; }
        /* Editable price input in cart */
        .cart-price-input {
            width:80px; border:1px solid #D0453A; border-radius:4px;
            text-align:right; padding:2px 5px; font-size:13px;
            color:#D0453A; font-weight:600; background:#fff;
            outline:none;
        }
        .cart-price-input:focus { border-color:#0090DA; color:#333; box-shadow:0 0 0 2px rgba(0,144,218,0.15); }
        /* Item discount badge */
        .item-disc-badge {
            display:inline-block; background:#FFF3E0; color:#F57C00;
            font-size:10px; font-weight:600; border-radius:3px;
            padding:1px 5px; margin-left:4px; cursor:pointer;
            border:1px solid #FFB74D; white-space:nowrap;
        }
        /* Item discount popup */
        .item-disc-popup {
            position:fixed; background:#fff; border:1px solid #E0E0E0;
            border-radius:8px; padding:14px; z-index:9999;
            box-shadow:0 4px 20px rgba(0,0,0,0.18); width:240px;
        }
        .item-disc-popup h4 { margin:0 0 10px; font-size:13px; color:#333; }
        .item-disc-row { display:flex; align-items:center; gap:6px; margin-bottom:8px; }
        .item-disc-row label { font-size:12px; color:#666; width:60px; }
        .item-disc-row input { flex:1; border:1px solid #DDD; border-radius:4px; padding:4px 8px; font-size:13px; }
        .item-disc-row input:focus { outline:none; border-color:#0090DA; }
        .item-disc-type { display:flex; gap:4px; }
        .item-disc-type button {
            flex:1; padding:4px 0; border:1px solid #DDD; border-radius:4px;
            font-size:12px; cursor:pointer; background:#F5F5F5; color:#555;
            transition:all .15s;
        }
        .item-disc-type button.active {
            background:#0090DA; border-color:#0090DA; color:#fff;
        }
        .item-disc-actions { display:flex; gap:6px; margin-top:10px; }
        .item-disc-actions button {
            flex:1; padding:5px 0; border-radius:4px; font-size:12px;
            cursor:pointer; border:none;
        }
        .item-disc-actions .btn-apply { background:#0090DA; color:#fff; }
        .item-disc-actions .btn-remove { background:#F5F5F5; color:#555; border:1px solid #DDD; }
        /* Đặt hàng tab - giống KiotViet: nền giống tab thường, chữ cam */
        .order-tab.dat-hang-tab { color:#E65100; }
        .order-tab.dat-hang-tab .tab-label { color:#E65100; font-weight:600; }
        .order-tab.dat-hang-tab .tab-icon { color:#E65100; }

        /* ===== Bán Thường Cart Styles ===== */
        .thuong-cart-list { display:flex; flex-direction:column; gap:0; }
        .thuong-cart-item {
            display:flex; align-items:flex-start; gap:10px; padding:10px 12px;
            border-bottom:1px solid #F0F0F0; position:relative;
        }
        .thuong-cart-item:hover { background:#FAFAFA; }
        .thuong-cart-item .tc-index {
            min-width:18px; font-size:12px; color:#999; padding-top:4px; text-align:center;
        }
        .thuong-cart-item .tc-img {
            width:44px; height:44px; border-radius:50%; overflow:hidden; flex-shrink:0;
            border:1px solid #E8E8E8; display:flex; align-items:center; justify-content:center;
            background:#F9F9F9;
        }
        .thuong-cart-item .tc-img img { width:100%; height:100%; object-fit:cover; }
        .thuong-cart-item .tc-info { flex:1; min-width:0; }
        .thuong-cart-item .tc-code { font-size:11px; color:#999; }
        .thuong-cart-item .tc-name {
            font-size:13px; color:#333; font-weight:500;
            white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .thuong-cart-item .tc-qty-row {
            display:flex; align-items:center; gap:0; margin-top:4px;
        }
        .thuong-cart-item .tc-qty-btn {
            width:26px; height:26px; border:1px solid #DDD; background:#fff;
            cursor:pointer; font-size:14px; color:#555; display:flex;
            align-items:center; justify-content:center; border-radius:4px;
        }
        .thuong-cart-item .tc-qty-btn:hover { background:#F0F0F0; }
        .thuong-cart-item .tc-qty-val {
            width:36px; text-align:center; border:1px solid #DDD; border-left:none; border-right:none;
            height:26px; font-size:13px; font-weight:600; color:#333;
        }
        .thuong-cart-item .tc-note {
            font-size:11px; color:#AAA; font-style:italic; margin-top:2px; cursor:pointer;
        }
        .thuong-cart-item .tc-right {
            text-align:right; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:2px;
        }
        .thuong-cart-item .tc-unit-select {
            padding:2px 6px; border:1px solid #2196F3; border-radius:4px;
            font-size:11px; color:#2196F3; background:#fff; cursor:pointer;
        }
        .thuong-cart-item .tc-price { font-size:14px; font-weight:600; color:#333; }
        .thuong-cart-item .tc-more {
            position:absolute; top:6px; right:6px; background:none; border:none;
            cursor:pointer; color:#999; font-size:14px; padding:2px 6px;
        }
        .thuong-cart-item .tc-more:hover { color:#555; }

        /* Cart item context menu */
        .cart-ctx-menu {
            position:fixed; background:#fff; border:1px solid #E0E0E0; border-radius:8px;
            min-width:160px; z-index:9999; box-shadow:0 4px 16px rgba(0,0,0,0.15);
            overflow:hidden;
        }
        .cart-ctx-menu .ctx-item {
            padding:8px 14px; cursor:pointer; font-size:13px; color:#333;
            display:flex; align-items:center; gap:8px;
        }
        .cart-ctx-menu .ctx-item:hover { background:#F5F5F5; }
        .cart-ctx-menu .ctx-item i { width:18px; text-align:center; color:#777; }

        /* ===== Print Settings Panel ===== */
        .print-settings-panel {
            position:absolute; top:100%; right:0; width:280px;
            background:#fff; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.18);
            z-index:9999; padding:16px; display:none;
        }
        .print-settings-panel.open { display:block; }
        .ps-row {
            display:flex; align-items:center; justify-content:space-between;
            padding:8px 0; border-bottom:1px solid #F0F0F0;
        }
        .ps-row:last-child { border-bottom:none; }
        .ps-label { font-size:13px; color:#333; }
        .ps-toggle {
            position:relative; width:44px; height:24px; cursor:pointer;
        }
        .ps-toggle input { opacity:0; width:0; height:0; }
        .ps-toggle .ps-slider {
            position:absolute; inset:0; background:#ccc; border-radius:12px; transition:.3s;
        }
        .ps-toggle .ps-slider:before {
            content:''; position:absolute; width:18px; height:18px; left:3px; bottom:3px;
            background:#fff; border-radius:50%; transition:.3s;
        }
        .ps-toggle input:checked + .ps-slider { background:#4285F4; }
        .ps-toggle input:checked + .ps-slider:before { transform:translateX(20px); }
        .ps-input {
            width:50px; text-align:center; border:1px solid #ddd; border-radius:4px;
            padding:4px; font-size:13px;
        }
        .ps-select {
            display:inline-block; padding:6px 12px; border:2px solid #4285F4;
            border-radius:20px; font-size:13px; color:#4285F4; font-weight:600;
            cursor:pointer; background:#fff;
        }
        .ps-actions {
            display:flex; gap:8px; margin-top:12px; justify-content:flex-end;
        }
        .ps-actions button {
            padding:6px 20px; border-radius:20px; font-size:13px; cursor:pointer; font-weight:500;
        }
        .ps-btn-skip { border:1px solid #4285F4; background:#fff; color:#4285F4; }
        .ps-btn-done { border:none; background:#4285F4; color:#fff; }

        /* ===== Xử lý đặt hàng Modal ===== */
        .xldh-overlay {
            position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:10000;
            display:flex; align-items:flex-start; justify-content:center; padding-top:40px;
        }
        .xldh-modal {
            background:#fff; border-radius:8px; width:90%; max-width:900px;
            box-shadow:0 8px 40px rgba(0,0,0,0.25); overflow:hidden;
        }
        .xldh-header {
            display:flex; align-items:center; justify-content:space-between;
            padding:14px 20px; border-bottom:1px solid #E8E8E8;
        }
        .xldh-header h3 { margin:0; font-size:16px; font-weight:600; color:#333; }
        .xldh-close {
            background:none; border:none; font-size:22px; cursor:pointer; color:#999;
            padding:0 4px; line-height:1;
        }
        .xldh-close:hover { color:#333; }
        .xldh-body { display:flex; min-height:360px; }
        .xldh-sidebar {
            width:200px; flex-shrink:0; padding:14px; border-right:1px solid #E8E8E8;
        }
        .xldh-sidebar-title { font-size:13px; font-weight:600; color:#333; margin-bottom:10px; }
        .xldh-sidebar input[type=text] {
            width:100%; border:none; border-bottom:1px solid #E0E0E0; padding:6px 0;
            font-size:12px; color:#555; outline:none; margin-bottom:6px;
        }
        .xldh-sidebar input[type=text]:focus { border-bottom-color:#4285F4; }
        .xldh-time-title { font-size:13px; font-weight:600; color:#333; margin:14px 0 8px; }
        .xldh-date-row {
            display:flex; align-items:center; gap:6px; margin-bottom:6px;
        }
        .xldh-date-input {
            flex:1; border:1px solid #DDD; border-radius:4px; padding:5px 8px;
            font-size:12px; color:#555;
        }
        .xldh-main { flex:1; display:flex; flex-direction:column; }
        .xldh-table-header {
            display:flex; background:#4661D0; color:#fff; font-size:12px;
            font-weight:600; padding:0;
        }
        .xldh-table-header span {
            padding:10px 12px; flex:1;
        }
        .xldh-empty {
            flex:1; display:flex; flex-direction:column; align-items:center;
            justify-content:center; color:#999; gap:8px;
        }
        .xldh-empty i { font-size:36px; color:#CCC; }
    `;
    document.head.appendChild(style);
}

// Products data loaded from products.js (1681 products)

// ==================== CUSTOMERS DATA ====================
let customers = [
    { id: 'KH000001', name: 'Khách lẻ', phone: '', address: '', debt: 0, points: 0 },
    { id: 'KH000002', name: 'Nguyễn Văn A', phone: '0901234567', address: 'Hà Nội', debt: 350000, points: 120 },
    { id: 'KH000003', name: 'Trần Thị B', phone: '0912345678', address: 'TP.HCM', debt: 0, points: 85 },
    { id: 'KH000004', name: 'Lê Văn C', phone: '0923456789', address: 'Đà Nẵng', debt: 150000, points: 45 },
    { id: 'KH000005', name: 'Phạm Thị D', phone: '0934567890', address: 'Bắc Ninh', debt: 0, points: 210 }
];

// ==================== STATE ====================
let tabs = [{ id: 1, type: 'hoadon', cart: [], customer: null, note: '', payMethod: 'cash' }];
let activeTabId = 1;
let nextTabId = 2;
let thuongPage = 1;
const THUONG_PER_PAGE = 30;
let qtyMode = false; // toggle "Số lượng" mode
let qtyBuffer = 1;
let discountMode = 'vnd'; // 'vnd' | '%' - for order-level discount
let completedOrders = []; // order history for return feature
let pendingOrders = [];    // held/pending orders (đơn chờ)

// Load persisted data from localStorage
function loadPersistedData() {
    try {
        const co = localStorage.getItem('hasu_completedOrders');
        if (co) {
            completedOrders = JSON.parse(co);
            completedOrders.forEach(o => o.time = new Date(o.time));
        }
        const po = localStorage.getItem('hasu_pendingOrders');
        if (po) {
            pendingOrders = JSON.parse(po);
            pendingOrders.forEach(o => o.savedAt = new Date(o.savedAt));
        }
        // Load saved customers (appended by users)
        const sc = localStorage.getItem('hasu_customers');
        if (sc) {
            const saved = JSON.parse(sc);
            saved.forEach(s => {
                if (!customers.find(c => c.id === s.id)) {
                    customers.push(s);
                }
            });
        }
    } catch (e) { console.warn('localStorage load error', e); }
}
function saveCustomers() {
    // Only persist user-added customers (id starts with KH + timestamp format)
    const custom = customers.filter(c => c.id.startsWith('KH') && c.id.length > 8);
    try { localStorage.setItem('hasu_customers', JSON.stringify(custom)); } catch (e) { }
}
function saveCompletedOrders() {
    try { localStorage.setItem('hasu_completedOrders', JSON.stringify(completedOrders)); } catch (e) { }
}
function savePendingOrders() {
    try { localStorage.setItem('hasu_pendingOrders', JSON.stringify(pendingOrders)); } catch (e) { }
}
loadPersistedData();

function getActiveTab() { return tabs.find(t => t.id === activeTabId); }

// ==================== MODE SWITCHING ====================
function initModeSwitch() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const mode = this.dataset.mode;
            document.body.className = 'mode-' + mode;
            updateTabLabels(mode);
            renderCart(); // Re-render cart in new mode format
        });
    });
}

function updateTabLabels(mode) {
    // Re-render tabs so labels stay consistent with tab type
    renderTabs();
    // Update order button text based on current mode
    const isBanNhanh = mode === 'ban-nhanh';
    document.querySelectorAll('.btn-order').forEach(btn => {
        btn.textContent = isBanNhanh ? 'THANH TOÁN' : 'ĐẶT HÀNG';
    });
}

// ==================== MULTI-TAB ====================
function initMultiTab() {
    // Bind nút + (Thêm hóa đơn) - dùng ID để tránh nhầm với nút ▼
    const addBtn = document.getElementById('btnAddInvoice') || document.querySelector('.btn-add-order');
    if (addBtn) {
        addBtn.addEventListener('click', addNewTab);
    }
    // Setup first tab
    const firstTab = document.getElementById('orderTab1');
    if (firstTab) {
        firstTab.dataset.tabId = '1';
        firstTab.addEventListener('click', function (e) {
            if (e.target.classList.contains('tab-close')) { closeTab(1); return; }
            switchTab(1);
        });
    }
    renderTabs();
}

function addNewTab() {
    if (tabs.length >= 10) {
        showToast('Tối đa 10 hóa đơn cùng lúc', 'error');
        return;
    }
    const newTab = { id: nextTabId, type: 'hoadon', cart: [], customer: null, note: '', payMethod: 'cash' };
    tabs.push(newTab);
    activeTabId = nextTabId;
    nextTabId++;
    renderTabs();
    renderCart();
    calculateTotals();
    showToast('Đã tạo hóa đơn mới', 'success');
}

function addNewDatHangTab() {
    if (tabs.length >= 10) {
        showToast('Tối đa 10 đơn cùng lúc', 'error');
        return;
    }
    const newTab = { id: nextTabId, type: 'dathang', cart: [], customer: null, note: '', payMethod: 'cash' };
    tabs.push(newTab);
    activeTabId = nextTabId;
    nextTabId++;
    renderTabs();
    renderCart();
    calculateTotals();
    showToast('Đã tạo đặt hàng mới', 'success');
    // Close dropdown if open
    const dd = document.getElementById('addOrderDropdown');
    if (dd) dd.remove();
}

// Show mini dropdown khi bấm nút ▼
function showAddOrderMenu(btn) {
    // Toggle: nếu đang hiện thì đóng
    const existing = document.getElementById('addOrderDropdown');
    if (existing) { existing.remove(); return; }

    const dd = document.createElement('div');
    dd.id = 'addOrderDropdown';
    dd.style.cssText = 'position:fixed;background:#fff;border:1px solid #E0E0E0;border-radius:10px;min-width:220px;z-index:9999;box-shadow:0 6px 20px rgba(0,0,0,0.15);overflow:hidden';

    // Item: Thêm mới đặt hàng → chuyển sang Bán giao hàng
    const item1 = document.createElement('div');
    item1.style.cssText = 'padding:10px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;color:#333';
    item1.innerHTML = '<i class="fas fa-truck" style="color:#FF6D00;font-size:18px;width:24px;text-align:center"></i><span>Thêm mới đặt hàng</span>';
    item1.onmouseover = () => item1.style.background = '#F5F5F5';
    item1.onmouseout = () => item1.style.background = '';
    item1.addEventListener('click', function (e) {
        e.stopPropagation();
        dd.remove();
        addNewDatHangTab();
    });

    dd.appendChild(item1);
    dd.addEventListener('click', e => e.stopPropagation());
    document.body.appendChild(dd);

    const rect = btn.getBoundingClientRect();
    dd.style.top = (rect.bottom + 4) + 'px';
    dd.style.left = Math.max(4, rect.right - 220) + 'px';

    // Đóng khi click bên ngoài
    setTimeout(() => {
        document.addEventListener('click', function _close() {
            dd.remove();
            document.removeEventListener('click', _close);
        }, { once: true });
    }, 100);
}

function switchTab(tabId) {
    // Save current state
    const cur = getActiveTab();
    if (cur) {
        const noteInput = document.querySelector('.note-input-wrapper input');
        if (noteInput) cur.note = noteInput.value;
    }
    activeTabId = tabId;
    renderTabs();
    // Restore state
    const tab = getActiveTab();
    if (tab) {
        const noteInput = document.querySelector('.note-input-wrapper input');
        if (noteInput) noteInput.value = tab.note || '';
    }
    renderCart();
    calculateTotals();
}

function closeTab(tabId) {
    if (tabs.length <= 1) {
        showToast('Phải có ít nhất 1 hóa đơn', 'error');
        return;
    }
    tabs = tabs.filter(t => t.id !== tabId);
    if (activeTabId === tabId) {
        activeTabId = tabs[0].id;
    }
    renderTabs();
    renderCart();
    calculateTotals();
}

function renderTabs() {
    const container = document.querySelector('.order-tabs');
    if (!container) return;
    // Đếm số thứ tự riêng cho từng loại
    let hdCount = 0, dhCount = 0;
    container.innerHTML = tabs.map(t => {
        const isDatHang = t.type === 'dathang';
        let label;
        if (isDatHang) { dhCount++; label = `Đặt hàng ${dhCount}`; }
        else { hdCount++; label = `Hoá đơn ${hdCount}`; }
        const active = t.id === activeTabId ? 'active' : '';
        const itemCount = t.cart.reduce((s, c) => s + c.qty, 0);
        const badge = itemCount > 0 ? `<span style="background:#e74c3c;color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:10px;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:0 4px">${itemCount}</span>` : '';
        const tabStyle = isDatHang ? (t.id === activeTabId ? 'order-tab active dat-hang-tab' : 'order-tab dat-hang-tab') : `order-tab ${active}`;
        const icon = isDatHang ? 'fas fa-exchange-alt' : 'fas fa-exchange-alt';
        return `<div class="${tabStyle}" data-tab-id="${t.id}" data-tab-type="${t.type || 'hoadon'}" onclick="switchTab(${t.id})">
            <span class="tab-icon"><i class="${icon}"></i></span>
            <span class="tab-label">${label}</span>${badge}
            <span class="tab-close" onclick="event.stopPropagation();closeTab(${t.id})">&times;</span>
        </div>`;
    }).join('');
}

// ==================== PRODUCT GRID (Bán nhanh) ====================
function initProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    renderProductGrid();
}

function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = products.map((p, i) => {
        const stockClass = p.stock <= 0 ? 'out-of-stock' : p.stock <= 3 ? 'low-stock' : 'in-stock';
        const stockLabel = p.stock <= 0 ? 'Hết hàng' : `Tồn: ${p.stock} ${p.unit || ''}`;
        return `
        <div class="product-grid-item" onclick="addToCart(${i})">
            <div class="product-img">${p.img ? `<img src="${p.img}" alt="${p.name}">` : `<i class="far fa-image" style="color:#CCC;font-size:24px"></i>`}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">${p.price.toLocaleString()}</div>
            <div class="product-stock ${stockClass}">${stockLabel}</div>
        </div>`;
    }).join('');
}

// ==================== THUONG GRID (3-column) ====================
function initThuongGrid() {
    thuongPage = 1;
    renderThuongGrid();
    initThuongPagination();
}

function renderThuongGrid() {
    const grid = document.getElementById('thuongProductGrid');
    if (!grid) return;
    const totalPages = Math.ceil(products.length / THUONG_PER_PAGE);
    const start = (thuongPage - 1) * THUONG_PER_PAGE;
    const pageProducts = products.slice(start, start + THUONG_PER_PAGE);
    grid.innerHTML = pageProducts.map((p, i) => {
        const realIdx = start + i;
        const stockClass = p.stock <= 0 ? 'out-of-stock' : p.stock <= 3 ? 'low-stock' : 'in-stock';
        const stockLabel = p.stock <= 0 ? 'Hết hàng' : `Tồn: ${p.stock}`;
        return `<div class="thuong-grid-item" onclick="addToCart(${realIdx})">
            <div class="thuong-grid-thumb">${p.img ? `<img src="${p.img}" alt="${p.name}">` : `<i class="far fa-image" style="color:#CCC;font-size:20px;display:flex;align-items:center;justify-content:center;height:100%"></i>`}</div>
            <div class="thuong-grid-info">
                <div class="thuong-grid-name">${p.name}</div>
                <div class="thuong-grid-price">${p.price.toLocaleString()} <span class="thuong-grid-stock ${stockClass}">${stockLabel}</span></div>
            </div>
        </div>`;
    }).join('');
    // Update pagination text
    const pageInfo = document.querySelector('.page-info');
    if (pageInfo) pageInfo.textContent = `${thuongPage}/${totalPages}`;
}

function initThuongPagination() {
    const pagBtns = document.querySelectorAll('.thuong-pagination .page-btn');
    if (pagBtns.length >= 2) {
        pagBtns[0].addEventListener('click', () => {
            if (thuongPage > 1) { thuongPage--; renderThuongGrid(); }
        });
        pagBtns[1].addEventListener('click', () => {
            const totalPages = Math.ceil(products.length / THUONG_PER_PAGE);
            if (thuongPage < totalPages) { thuongPage++; renderThuongGrid(); }
        });
    }
}

// ==================== CART ====================
function initCart() { }

// Generate unit variants for a product
function getProductUnits(p) {
    const base = p.unit || 'Cái';
    const basePrice = p.price || 0;
    const units = [{ name: base, factor: 1, price: basePrice }];
    // Add per-product unit conversions if defined
    if (p.unitConversions && Array.isArray(p.unitConversions)) {
        p.unitConversions.forEach(uc => {
            units.push({ name: uc.name, factor: uc.factor || 1, price: uc.price || Math.round(basePrice * (uc.factor || 1)) });
        });
    }
    return units;
}

function addToCart(idx) {
    const p = products[idx];
    if (!p) return;
    const tab = getActiveTab();
    if (!tab) return;
    const qty = qtyMode ? qtyBuffer : 1;
    const existing = tab.cart.find(c => c.code === p.code && c.selectedUnit === (p.unit || 'Cái'));
    if (existing) {
        existing.qty += qty;
    } else {
        const units = getProductUnits(p);
        tab.cart.push({
            ...p, qty: qty, customPrice: null, discAmt: 0, discType: '%',
            selectedUnit: units[0].name, units: units
        });
    }
    if (qtyMode) { qtyBuffer = 1; qtyMode = false; updateQtyModeUI(); }
    renderCart();
    calculateTotals();
    renderTabs();
}

function getCartItemPrice(item) {
    // Returns effective unit price (respects customPrice override, then selected unit price)
    if (item.customPrice !== null && item.customPrice !== undefined) return item.customPrice;
    if (item.units && item.selectedUnit) {
        const u = item.units.find(u => u.name === item.selectedUnit);
        if (u) return u.price;
    }
    return item.price;
}

function getCartItemLineTotal(item) {
    const unitPrice = getCartItemPrice(item);
    const lineBeforeDisc = unitPrice * item.qty;
    if (!item.discAmt || item.discAmt <= 0) return lineBeforeDisc;
    if (item.discType === '%') {
        return lineBeforeDisc * (1 - item.discAmt / 100);
    }
    return lineBeforeDisc - item.discAmt;
}

function getCurrentMode() {
    const cls = document.body.className || '';
    if (cls.includes('mode-ban-thuong')) return 'ban-thuong';
    if (cls.includes('mode-ban-giao-hang')) return 'ban-giao-hang';
    return 'ban-nhanh';
}

function renderCart() {
    const section = document.getElementById('cartSection');
    if (!section) return;
    const tab = getActiveTab();
    const cart = tab ? tab.cart : [];

    if (cart.length === 0) {
        section.innerHTML = '';
        const gridW = document.getElementById('productGridWrapper');
        if (gridW) gridW.style.display = '';
        return;
    }

    // Dispatch to mode-specific renderer
    if (getCurrentMode() === 'ban-thuong') {
        renderCartThuong(section, cart);
    } else {
        renderCartNhanh(section, cart);
    }

    const gridW = document.getElementById('productGridWrapper');
    if (gridW) gridW.style.display = cart.length > 0 ? 'none' : '';
}

// ===== Bán Nhanh cart (table format) =====
function renderCartNhanh(section, cart) {
    const vis = typeof getColVis === 'function' ? getColVis() : { stt: true, hinhanh: true, tenHang: true, dvt: true, sl: true, giaVon: false, giaBan: true, thanhTien: true, giamGia: true };
    const h = (show) => show ? '' : 'display:none;';

    let html = `<div class="cart-row cart-header-row">
        <span class="cart-stt" style="${h(vis.stt)}">STT</span>
        <span style="width:28px"></span>
        <span class="cart-name" style="${h(vis.tenHang)}">Tên hàng</span>
        <span style="width:60px;text-align:center;${h(vis.dvt)}">ĐVT</span>
        <span class="cart-qty" style="text-align:center;${h(vis.sl)}">SL</span>
        ${vis.giaVon ? '<span class="cart-price" style="text-align:right;min-width:70px">Giá vốn</span>' : ''}
        <span class="cart-price" style="text-align:right;min-width:90px;${h(vis.giaBan)}">Đơn giá</span>
        <span class="cart-total" style="text-align:right;${h(vis.thanhTien)}">Thành tiền</span>
        <span style="width:56px"></span>
    </div>`;

    html += cart.map((item, i) => {
        const unitPrice = getCartItemPrice(item);
        const lineTotal = getCartItemLineTotal(item);
        const hasDisc = item.discAmt && item.discAmt > 0;
        const discLabel = hasDisc
            ? (item.discType === '%'
                ? `-${item.discAmt}%`
                : `-${Number(item.discAmt).toLocaleString()}`)
            : '';
        return `
        <div class="cart-row" data-cart-idx="${i}">
            <span class="cart-stt" style="${h(vis.stt)}">${i + 1}</span>
            <button class="cart-delete" onclick="removeFromCart(${i})"><i class="fas fa-trash-alt"></i></button>
            <span class="cart-name" style="${h(vis.tenHang)}" title="${item.code} - ${item.name}">
                ${item.name}
                ${hasDisc ? `<span class="item-disc-badge" onclick="openItemDiscount(${i},event)">${discLabel}</span>` : ''}
            </span>
            <select class="unit-select" style="${h(vis.dvt)}" onchange="changeUnit(${i},this.value)">${(item.units || [{ name: item.unit || 'Cái' }]).map(u => `<option value="${u.name}" ${u.name === item.selectedUnit ? 'selected' : ''}>${u.name}</option>`).join('')}</select>
            <span class="cart-qty" style="${h(vis.sl)}"><input type="number" value="${item.qty}" min="1" onchange="changeQty(${i},this.value)"></span>
            ${vis.giaVon ? `<span class="cart-price" style="text-align:right;min-width:70px;color:#888">0</span>` : ''}
            <span class="cart-price" style="text-align:right;${h(vis.giaBan)}">
                <input class="cart-price-input"
                    type="text"
                    value="${unitPrice.toLocaleString()}"
                    data-raw="${unitPrice}"
                    onfocus="this.select()"
                    onblur="changePrice(${i},this.value)"
                    onkeydown="if(event.key==='Enter')this.blur()"
                >
            </span>
            <span class="cart-total" style="text-align:right;${h(vis.thanhTien)}color:${hasDisc ? '#D0453A' : 'inherit'};font-weight:${hasDisc ? '600' : '400'}">${Math.round(lineTotal).toLocaleString()}</span>
            <button class="cart-add-btn" onclick="addToCart(${findProductIdx(item.code)})"><i class="fas fa-plus"></i></button>
            <button class="cart-more-btn" onclick="openCartItemMenu(${i},event)" title="Tùy chọn"><i class="fas fa-ellipsis-v"></i></button>
        </div>`;
    }).join('');
    section.innerHTML = html;
}

// ===== Bán Thường cart (KiotViet list with images) =====
function renderCartThuong(section, cart) {
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);
    const totalAmt = cart.reduce((s, c) => s + getCartItemLineTotal(c), 0);

    let html = '<div class="thuong-cart-list">';
    html += cart.map((item, i) => {
        const unitPrice = getCartItemPrice(item);
        const lineTotal = getCartItemLineTotal(item);
        const imgHtml = item.img
            ? `<img src="${item.img}" alt="${item.name}">`
            : `<i class="far fa-image" style="color:#CCC;font-size:18px"></i>`;
        return `
        <div class="thuong-cart-item" data-cart-idx="${i}">
            <span class="tc-index">${i + 1}</span>
            <div class="tc-img">${imgHtml}</div>
            <div class="tc-info">
                <div class="tc-code">${item.code || ''}</div>
                <div class="tc-name" title="${item.name}">${item.name}</div>
                <div class="tc-qty-row">
                    <button class="tc-qty-btn" onclick="changeQty(${i},${item.qty - 1})">−</button>
                    <input class="tc-qty-val" type="number" value="${item.qty}" min="1" onchange="changeQty(${i},this.value)">
                    <button class="tc-qty-btn" onclick="changeQty(${i},${item.qty + 1})">+</button>
                </div>
                <div class="tc-note" onclick="openCartItemNote(${i})">${item.note ? item.note : 'Ghi chú...'}</div>
            </div>
            <div class="tc-right">
                <select class="tc-unit-select"><option>${item.unit || 'Cái'}</option></select>
                <div class="tc-price">${unitPrice.toLocaleString()}</div>
            </div>
            <button class="tc-more" onclick="openCartItemMenu(${i},event)"><i class="fas fa-ellipsis-v"></i></button>
        </div>`;
    }).join('');
    html += '</div>';

    // Bottom summary bar
    html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#F5F7FA;border-top:1px solid #E0E0E0;font-size:13px">
        <span>Tổng tiền hàng: <b style="color:#e74c3c">${cart.length}</b></span>
        <b style="color:#e74c3c;font-size:15px">${Math.round(totalAmt).toLocaleString()}</b>
    </div>`;
    section.innerHTML = html;
}

// ===== 3-dot context menu for cart items =====
function openCartItemMenu(i, event) {
    event.stopPropagation();
    // Remove any existing menu
    const old = document.getElementById('cartCtxMenu');
    if (old) old.remove();

    const menu = document.createElement('div');
    menu.id = 'cartCtxMenu';
    menu.className = 'cart-ctx-menu';
    menu.innerHTML = `
        <div class="ctx-item" onclick="openItemDiscount(${i},event);document.getElementById('cartCtxMenu')?.remove()">
            <i class="fas fa-tag"></i><span>Giảm giá</span>
        </div>
        <div class="ctx-item" onclick="openCartItemNote(${i});document.getElementById('cartCtxMenu')?.remove()">
            <i class="fas fa-pen"></i><span>Ghi chú</span>
        </div>
        <div class="ctx-item" onclick="viewCartItemDetail(${i});document.getElementById('cartCtxMenu')?.remove()">
            <i class="fas fa-info-circle"></i><span>Xem chi tiết</span>
        </div>
    `;
    menu.addEventListener('click', e => e.stopPropagation());
    document.body.appendChild(menu);

    const rect = event.target.getBoundingClientRect();
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(4, rect.right - 180) + 'px';

    setTimeout(() => {
        document.addEventListener('click', function _c() {
            menu.remove();
            document.removeEventListener('click', _c);
        }, { once: true });
    }, 50);
}

function openCartItemNote(i) {
    const tab = getActiveTab();
    if (!tab || !tab.cart[i]) return;
    const item = tab.cart[i];
    const note = prompt('Ghi chú cho sản phẩm:', item.note || '');
    if (note !== null) {
        item.note = note;
        renderCart();
    }
}

function viewCartItemDetail(i) {
    const tab = getActiveTab();
    if (!tab || !tab.cart[i]) return;
    const item = tab.cart[i];
    const unitPrice = getCartItemPrice(item);
    const lineTotal = getCartItemLineTotal(item);
    alert(`Mã: ${item.code}\nTên: ${item.name}\nĐVT: ${item.unit || 'Cái'}\nSL: ${item.qty}\nĐơn giá: ${unitPrice.toLocaleString()}\nThành tiền: ${Math.round(lineTotal).toLocaleString()}`);
}

function findProductIdx(code) {
    return products.findIndex(p => p.code === code);
}

function removeFromCart(i) {
    const tab = getActiveTab();
    if (tab) { tab.cart.splice(i, 1); }
    renderCart();
    calculateTotals();
    renderTabs();
}

function changeQty(i, val) {
    const tab = getActiveTab();
    if (!tab) return;
    const q = parseInt(val);
    if (q > 0) tab.cart[i].qty = q;
    else { tab.cart.splice(i, 1); }
    renderCart();
    calculateTotals();
    renderTabs();
}

function changeUnit(i, unitName) {
    const tab = getActiveTab();
    if (!tab || !tab.cart[i]) return;
    tab.cart[i].selectedUnit = unitName;
    tab.cart[i].customPrice = null; // Reset custom price so unit price takes effect
    renderCart();
    calculateTotals();
    renderTabs();
}

// ==================== TOTALS ====================
function calculateTotals() {
    const tab = getActiveTab();
    const cart = tab ? tab.cart : [];
    // Use effective line totals (custom price + per-item discount)
    const subtotal = Math.round(cart.reduce((s, c) => s + getCartItemLineTotal(c), 0));
    const count = cart.reduce((s, c) => s + c.qty, 0);

    // Order-level discount (supports % or fixed VND)
    const rawDisc = parseFloat(document.getElementById('discountInput')?.value || 0);
    let discount = 0;
    if (discountMode === '%') {
        discount = Math.round(subtotal * Math.min(rawDisc, 100) / 100);
    } else {
        discount = Math.round(rawDisc);
    }

    // Show computed discount amount next to the label when in % mode
    const discLabel = document.getElementById('discountComputedLabel');
    if (discLabel) {
        discLabel.textContent = discountMode === '%' && rawDisc > 0
            ? `(-${discount.toLocaleString()}đ)` : '';
    }

    const other = parseInt(document.getElementById('otherInput')?.value || 0);
    const total = subtotal - discount + other;

    const el = id => document.getElementById(id);
    // Payment panel (Bán nhanh)
    if (el('totalCount')) el('totalCount').textContent = count;
    if (el('subtotalValue')) el('subtotalValue').textContent = subtotal.toLocaleString();
    if (el('grandTotal')) el('grandTotal').textContent = total.toLocaleString();

    // R30: Total quantity display in cart area - placed just before note input
    let totalQtyEl = document.getElementById('cartTotalQty');
    if (cart.length > 0) {
        if (!totalQtyEl) {
            totalQtyEl = document.createElement('div');
            totalQtyEl.id = 'cartTotalQty';
            totalQtyEl.className = 'cart-total-qty';
        }
        // Always re-position just above note-input-wrapper
        const noteWrapper = document.querySelector('.note-input-wrapper');
        if (noteWrapper) {
            noteWrapper.parentElement.insertBefore(totalQtyEl, noteWrapper);
            // Force inline style so it pushes itself to the bottom of the flex column
            totalQtyEl.style.marginTop = 'auto';
        } else {
            const cartSection = document.getElementById('cartSection');
            if (cartSection && !totalQtyEl.parentElement) {
                cartSection.parentElement.insertBefore(totalQtyEl, cartSection.nextSibling);
            }
        }
        totalQtyEl.innerHTML = `<i class="fas fa-box"></i> Tổng SL: <span>${count}</span> &nbsp;|&nbsp; Tổng tiền hàng: <span>${subtotal.toLocaleString()}đ</span>`;
        totalQtyEl.style.display = '';
    } else if (totalQtyEl) {
        totalQtyEl.style.display = 'none';
    }

    // Calculate change based on paid amount
    const payInput = el('payAmountInput');
    const paid = payInput ? parseInt(payInput.value || 0) : 0;
    const change = paid > 0 ? paid - total : 0 - total;
    if (el('changeValue')) el('changeValue').textContent = change >= 0 ? change.toLocaleString() : '- ' + Math.abs(change).toLocaleString();

    // Bottom summary (Bán thường)
    if (el('summaryCount')) el('summaryCount').textContent = count;
    if (el('summaryTotal')) el('summaryTotal').textContent = subtotal.toLocaleString();

    // Bottom price breakdown (Bán giao hàng)
    if (el('bpCount')) el('bpCount').textContent = count;
    if (el('bpSubtotal')) el('bpSubtotal').textContent = subtotal.toLocaleString();
    if (el('bpTotal')) el('bpTotal').textContent = total.toLocaleString();

    // If bank transfer is selected, refresh QR with new amount
    updateTransferQR();
}

// ==================== CHANGE PRICE PER ITEM ====================
function changePrice(i, rawVal) {
    const tab = getActiveTab();
    if (!tab) return;
    // Strip formatting commas, parse
    const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num >= 0) {
        tab.cart[i].customPrice = num;
    } else {
        tab.cart[i].customPrice = null; // revert to original
    }
    renderCart();
    calculateTotals();
}

// ==================== PER-ITEM DISCOUNT ====================
let _discPopupIdx = null;

function openItemDiscount(i, event) {
    event.stopPropagation();
    closeItemDiscountPopup();
    _discPopupIdx = i;
    const tab = getActiveTab();
    if (!tab) return;
    const item = tab.cart[i];
    const unitPrice = getCartItemPrice(item);

    const popup = document.createElement('div');
    popup.className = 'item-disc-popup';
    popup.id = 'itemDiscPopup';
    popup.innerHTML = `
        <h4><i class="fas fa-tag" style="color:#F57C00;margin-right:6px"></i>Giảm giá: <b>${item.name.slice(0, 20)}${item.name.length > 20 ? '...' : ''}</b></h4>
        <div class="item-disc-row">
            <label>Loại</label>
            <div class="item-disc-type">
                <button id="discTypePct" class="${item.discType === '%' ? 'active' : ''}" onclick="_setDiscType('%')" type="button">%</button>
                <button id="discTypeVnd" class="${item.discType === 'vnd' ? 'active' : ''}" onclick="_setDiscType('vnd')" type="button">VNĐ</button>
            </div>
        </div>
        <div class="item-disc-row">
            <label>Giảm</label>
            <input id="discAmtInput" type="number" min="0" value="${item.discAmt || 0}" placeholder="0"
                style="text-align:right" onfocus="this.select()">
            <span id="discUnitLabel" style="font-size:12px;color:#888;width:24px">${item.discType === '%' ? '%' : ''}</span>
        </div>
        <div class="item-disc-row" style="margin-bottom:2px">
            <label style="color:#999;font-size:11px">Đơn giá</label>
            <span style="font-size:12px;color:#555">${unitPrice.toLocaleString()} × ${item.qty}</span>
        </div>
        <div class="item-disc-actions">
            <button class="btn-remove" onclick="removeItemDiscount()" type="button">Bỏ giảm giá</button>
            <button class="btn-apply" onclick="applyItemDiscount()" type="button">Áp dụng</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Position near the clicked element
    const rect = event.target.getBoundingClientRect();
    const pW = 240, pH = 200;
    let top = rect.bottom + 4;
    let left = rect.left - pW + rect.width;
    if (left < 8) left = 8;
    if (top + pH > window.innerHeight) top = rect.top - pH - 4;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';

    // Focus amount input
    setTimeout(() => { const inp = document.getElementById('discAmtInput'); if (inp) inp.focus(); }, 50);

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', _outsideDiscClick);
    }, 10);
}

function _outsideDiscClick(e) {
    const popup = document.getElementById('itemDiscPopup');
    if (popup && !popup.contains(e.target)) {
        closeItemDiscountPopup();
    }
}

function _setDiscType(type) {
    const tab = getActiveTab();
    if (!tab || _discPopupIdx === null) return;
    tab.cart[_discPopupIdx].discType = type;
    document.getElementById('discTypePct').classList.toggle('active', type === '%');
    document.getElementById('discTypeVnd').classList.toggle('active', type === 'vnd');
    document.getElementById('discUnitLabel').textContent = type === '%' ? '%' : '';
}

function applyItemDiscount() {
    const tab = getActiveTab();
    if (!tab || _discPopupIdx === null) return;
    const inp = document.getElementById('discAmtInput');
    const val = parseFloat(inp.value || 0);
    tab.cart[_discPopupIdx].discAmt = val >= 0 ? val : 0;
    closeItemDiscountPopup();
    renderCart();
    calculateTotals();
    showToast('Đã áp dụng giảm giá', 'success');
}

function removeItemDiscount() {
    const tab = getActiveTab();
    if (!tab || _discPopupIdx === null) return;
    tab.cart[_discPopupIdx].discAmt = 0;
    closeItemDiscountPopup();
    renderCart();
    calculateTotals();
}

function closeItemDiscountPopup() {
    const popup = document.getElementById('itemDiscPopup');
    if (popup) popup.remove();
    document.removeEventListener('click', _outsideDiscClick);
    _discPopupIdx = null;
}

// ==================== PAYMENT ====================
function initPayment() {
    const discountInput = document.getElementById('discountInput');
    const otherInput = document.getElementById('otherInput');

    if (discountInput) {
        discountInput.addEventListener('input', calculateTotals);

        // Inject % / VNĐ toggle button next to discountInput
        const discRow = discountInput.closest('.price-row');
        if (discRow) {
            // Insert computed-discount label (shown when % mode)
            const computedLabel = document.createElement('span');
            computedLabel.id = 'discountComputedLabel';
            computedLabel.style.cssText = 'font-size:11px;color:#F57C00;min-width:70px;text-align:right;margin-right:4px';
            discRow.insertBefore(computedLabel, discountInput);

            // Toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'discModeToggle';
            toggleBtn.type = 'button';
            toggleBtn.textContent = 'VNĐ';
            toggleBtn.title = 'Switch between % and VNĐ';
            toggleBtn.style.cssText = `
                margin-left:4px;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;
                cursor:pointer;border:1px solid #0090DA;background:#E8F4FD;color:#0090DA;
                white-space:nowrap;flex-shrink:0;
            `;
            toggleBtn.addEventListener('click', () => {
                discountMode = discountMode === 'vnd' ? '%' : 'vnd';
                toggleBtn.textContent = discountMode === '%' ? '%' : 'VNĐ';
                toggleBtn.style.background = discountMode === '%' ? '#FFF3E0' : '#E8F4FD';
                toggleBtn.style.borderColor = discountMode === '%' ? '#F57C00' : '#0090DA';
                toggleBtn.style.color = discountMode === '%' ? '#F57C00' : '#0090DA';
                // Update placeholder
                discountInput.placeholder = discountMode === '%' ? '0 (%)' : '0';
                discountInput.value = '0';
                calculateTotals();
            });
            discRow.appendChild(toggleBtn);
        }
    }
    if (otherInput) otherInput.addEventListener('input', calculateTotals);

    // Inject payment method selector + pay amount input
    injectPaymentMethod();

    // Order buttons
    document.querySelectorAll('.btn-order').forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = getActiveTab();
            if (!tab || tab.cart.length === 0) {
                showToast('Chưa có sản phẩm trong đơn hàng', 'error');
                return;
            }
            // Save order snapshot for return feature (before cart clear)
            const snap = {
                id: 'HD' + Date.now().toString().slice(-8),
                time: new Date(),
                customer: tab.customer ? { ...tab.customer } : null,
                cart: tab.cart.map(c => ({ ...c })),
                payMethod: tab.payMethod || 'cash',
                discountMode: discountMode,
                discValue: parseFloat(document.getElementById('discountInput')?.value || 0),
                other: parseInt(document.getElementById('otherInput')?.value || 0),
            };
            snap.subtotal = Math.round(snap.cart.reduce((s, c) => s + getCartItemLineTotal(c), 0));
            snap.discount = discountMode === '%' ? Math.round(snap.subtotal * Math.min(snap.discValue, 100) / 100) : Math.round(snap.discValue);
            snap.grandTotal = snap.subtotal - snap.discount + snap.other;
            completedOrders.unshift(snap); // newest first
            saveCompletedOrders();

            // --- SYNC WITH HOADON MANAGEMENT ---
            try {
                let hoadonSaved = localStorage.getItem('hoadon_data');
                let hoadonArr = hoadonSaved ? JSON.parse(hoadonSaved) : [];

                const pad = n => n.toString().padStart(2, '0');
                const d = snap.time;
                const timeStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

                let paymentMethodLabel = 'Tiền mặt';
                if (snap.payMethod === 'bank') paymentMethodLabel = 'Chuyển khoản';
                if (snap.payMethod === 'card') paymentMethodLabel = 'Thẻ';

                const cxId = snap.customer && snap.customer.id ? snap.customer.id : ('KH' + Date.now().toString().slice(-6));
                const cxName = snap.customer && snap.customer.name ? snap.customer.name : 'Khách lẻ';

                const newHoadon = {
                    id: Date.now(),
                    docId: snap.id,
                    time: timeStr,
                    refReturn: '',
                    cxCode: cxId,
                    cxName: cxName,
                    subtotal: snap.subtotal,
                    discount: snap.discount,
                    finalTotal: snap.grandTotal,
                    status: 'Hoàn thành',
                    creator: 'Nhân viên bán hàng',
                    seller: 'Nhân viên bán hàng',
                    channel: 'Bán trực tiếp',
                    priceList: 'Bảng giá chung',
                    branch: 'Chi nhánh trung tâm',
                    items: snap.cart.map(c => ({
                        sku: c.code,
                        name: c.name,
                        qty: c.qty,
                        price: c.price,
                        discount: c.discAmt || 0,
                        finalPrice: (c.customPrice !== null && c.customPrice !== undefined ? c.customPrice : c.price) - (c.discAmt || 0),
                        total: getCartItemLineTotal(c)
                    })),
                    payments: [{
                        time: timeStr,
                        code: 'PT' + snap.id.replace('HD', ''),
                        method: paymentMethodLabel,
                        total: snap.grandTotal,
                        paid: snap.grandTotal
                    }]
                };

                hoadonArr.unshift(newHoadon);
                localStorage.setItem('hoadon_data', JSON.stringify(hoadonArr));
            } catch (e) { console.error("Error saving to hoadon_data", e); }
            // ------------------------------------

            // R7/R8/R9: Show print options before printing
            showPrintOptions();
        });
    });
}

// Called after employee prints from the bill popup
function completeOrder() {
    const tab = getActiveTab();
    if (!tab) return;
    const overlay = document.getElementById('successOverlay');
    if (overlay) overlay.classList.add('show');
    setTimeout(() => {
        if (overlay) overlay.classList.remove('show');
        // Deduct stock before clearing cart
        if (typeof deductStock === 'function') deductStock(tab.cart);
        tab.cart = [];
        tab.customer = null;
        tab.note = '';
        discountMode = 'vnd';
        const discToggle = document.getElementById('discModeToggle');
        if (discToggle) {
            discToggle.textContent = 'VNĐ';
            discToggle.style.background = '#E8F4FD';
            discToggle.style.borderColor = '#0090DA';
            discToggle.style.color = '#0090DA';
        }
        const noteInput = document.querySelector('.note-input-wrapper input');
        if (noteInput) noteInput.value = '';
        renderCart();
        calculateTotals();
        renderTabs();
        // R5: Auto-create new tab after payment
        addNewTab();
        showToast('Thanh toán thành công!', 'success');
    }, 1500);
}

function injectPaymentMethod() {
    const priceBreakdown = document.querySelector('.payment-panel .price-breakdown');
    if (!priceBreakdown) return;

    // Find "Tiền thừa trả khách" row and insert payment method + pay amount before it
    const rows = priceBreakdown.querySelectorAll('.price-row');
    const changeRow = rows[rows.length - 1]; // Last row is "Tiền thừa trả khách"
    const totalRow = rows[rows.length - 2]; // "Khách cần trả"

    if (totalRow && changeRow) {
        // Payment method row
        const pmRow = document.createElement('div');
        pmRow.className = 'price-row';
        pmRow.style.cssText = 'padding:8px 0;border-top:1px solid #F0F0F0;margin-top:4px';
        pmRow.innerHTML = `
            <span class="label">Phương thức thanh toán</span>
            <div style="display:flex;gap:4px;margin-left:auto">
                <button class="pay-method-btn active" data-method="cash" onclick="selectPayMethod('cash')" style="padding:4px 10px;border:1px solid #0090DA;border-radius:4px;font-size:11px;cursor:pointer;background:#E8F4FD;color:#0090DA">Tiền mặt</button>
                <button class="pay-method-btn" data-method="bank" onclick="selectPayMethod('bank')" style="padding:4px 10px;border:1px solid #E0E0E0;border-radius:4px;font-size:11px;cursor:pointer;background:#FFF;color:#666">Chuyển khoản</button>
                <button class="pay-method-btn" data-method="card" onclick="selectPayMethod('card')" style="padding:4px 10px;border:1px solid #E0E0E0;border-radius:4px;font-size:11px;cursor:pointer;background:#FFF;color:#666">Thẻ</button>
            </div>
        `;

        // Cash denomination panel (shown by default since cash is default)
        const cashPanel = document.createElement('div');
        cashPanel.id = 'cashDenomPanel';
        cashPanel.style.cssText = 'margin:6px 0 4px;padding:10px;background:#F5F7FA;border:1px solid #E0E4EA;border-radius:8px';
        cashPanel.innerHTML = `
            <div style="font-size:11px;color:#555;margin-bottom:6px"><i class="fas fa-money-bill-wave" style="margin-right:4px;color:#2E7D32"></i>Chọn mệnh giá</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
                <button class="denom-btn denom-exact" onclick="denomExact()" style="padding:5px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #2E7D32;background:#E8F5E9;color:#2E7D32">✔ Đủ tiền</button>
                <button class="denom-btn" onclick="denomSet(10000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">10,000</button>
                <button class="denom-btn" onclick="denomSet(20000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">20,000</button>
                <button class="denom-btn" onclick="denomSet(50000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">50,000</button>
                <button class="denom-btn" onclick="denomSet(100000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">100,000</button>
                <button class="denom-btn" onclick="denomSet(200000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">200,000</button>
                <button class="denom-btn" onclick="denomSet(500000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">500,000</button>
            </div>
        `;

        // QR Code panel (hidden by default, shown when bank selected)
        const qrPanel = document.createElement('div');
        qrPanel.id = 'transferQRPanel';
        qrPanel.style.cssText = 'display:none;margin:8px 0 4px;padding:12px;background:#F9FFFE;border:1px solid #B2DFDB;border-radius:10px;text-align:center';
        qrPanel.innerHTML = `
            <div style="font-size:12px;color:#00796B;font-weight:600;margin-bottom:8px">
                <i class="fas fa-qrcode" style="margin-right:6px"></i>Quét mã chuyển khoản
            </div>
            <div id="qrImageWrap" style="display:inline-block;background:#fff;padding:8px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
                <img id="transferQRImg" src="" alt="QR" style="width:180px;height:180px;display:block">
            </div>
            <div style="margin-top:8px;font-size:11px;color:#555">
                <div id="qrBankName" style="font-weight:600;color:#222;font-size:12px"></div>
                <div id="qrAccNo" style="color:#0090DA;font-size:13px;font-weight:700;letter-spacing:1px;margin:2px 0"></div>
                <div id="qrAccHolder" style="color:#666"></div>
            </div>
            <div style="margin-top:8px;display:flex;align-items:center;justify-content:center;gap:6px">
                <span style="font-size:11px;color:#999">Số tiền:</span>
                <span id="qrAmount" style="font-size:15px;font-weight:700;color:#0090DA"></span>
            </div>
            <div style="margin-top:6px;font-size:10px;color:#999;font-style:italic">Nội dung: <span id="qrDesc"></span></div>
        `;

        // Pay amount row
        const payRow = document.createElement('div');
        payRow.className = 'price-row';
        payRow.innerHTML = `<span class="label">Tiền khách trả</span><span class="flex-spacer"></span><input class="price-input" id="payAmountInput" value="0" style="text-align:right">`;

        totalRow.insertAdjacentElement('afterend', payRow);
        payRow.insertAdjacentElement('afterend', pmRow);

        // Reorder: method -> cashPanel -> QR -> pay amount -> change
        priceBreakdown.insertBefore(pmRow, changeRow);
        priceBreakdown.insertBefore(cashPanel, changeRow);
        priceBreakdown.insertBefore(qrPanel, changeRow);
        priceBreakdown.insertBefore(payRow, changeRow);

        // Listen to pay amount
        const payInput = document.getElementById('payAmountInput');
        if (payInput) {
            payInput.addEventListener('input', calculateTotals);
        }
    }
}

// ==================== BANK INFO (edit these 3 lines to set real account) ====================
const BANK_ID = '970436';          // VietcomBank BIN (change to your bank)
const BANK_ACCT = '1234567890';      // Tài khoản nhận (số gọi quần)
const BANK_NAME_DISPLAY = 'Vietcombank';
const ACCT_HOLDER = 'NGUYEN VAN A';    // Tên chủ TK (Viết hoa, bỏ dấu)
// ==========================================================================================

function selectPayMethod(method) {
    const tab = getActiveTab();
    if (!tab) return;

    // Single-select: replace current method
    tab.payMethod = method;
    tab.payMethods = [method]; // keep backwards compat

    // Update button styles
    document.querySelectorAll('.pay-method-btn').forEach(btn => {
        const isActive = btn.dataset.method === method;
        btn.classList.toggle('active', isActive);
        btn.style.background = isActive ? '#E8F4FD' : '#FFF';
        btn.style.borderColor = isActive ? '#0090DA' : '#E0E0E0';
        btn.style.color = isActive ? '#0090DA' : '#666';
    });

    // Show/hide panels based on selected method
    const qrPanel = document.getElementById('transferQRPanel');
    const cashPanel = document.getElementById('cashDenomPanel');
    if (cashPanel) cashPanel.style.display = method === 'cash' ? 'block' : 'none';
    if (qrPanel) {
        qrPanel.style.display = method === 'bank' ? 'block' : 'none';
        if (method === 'bank') updateTransferQR();
    }

    // Hide multi-pay split panel (no longer needed)
    const splitPanel = document.getElementById('multiPaySplit');
    if (splitPanel) splitPanel.style.display = 'none';
}

function updateMultiPayTotal() {
    const tab = getActiveTab();
    if (!tab || !tab.payMethods) return;
    let total = 0;
    tab.payMethods.forEach(m => {
        const inp = document.getElementById('split_' + m);
        if (inp) total += parseInt(inp.value.replace(/[^0-9]/g, '') || 0);
    });
    const payInput = document.getElementById('payAmountInput');
    if (payInput) {
        payInput.value = total;
        calculateTotals();
    }
}

// Cash denomination helpers
function denomSet(amount) {
    const inp = document.getElementById('payAmountInput');
    if (inp) {
        inp.value = amount;
        calculateTotals();
    }
    // Highlight active denom
    document.querySelectorAll('.denom-btn').forEach(b => {
        b.style.background = '#FFF';
        b.style.borderColor = '#E0E0E0';
        b.style.color = '#333';
    });
    const exact = document.querySelector('.denom-exact');
    if (exact) { exact.style.background = '#E8F5E9'; exact.style.borderColor = '#2E7D32'; exact.style.color = '#2E7D32'; }
    event?.target?.style && Object.assign(event.target.style, { background: '#E3F2FD', borderColor: '#1976D2', color: '#1976D2' });
}
function denomExact() {
    // Set pay amount = grand total (exact change)
    const totalEl = document.getElementById('grandTotal');
    if (!totalEl) return;
    const total = parseInt(totalEl.textContent.replace(/\D/g, '')) || 0;
    const inp = document.getElementById('payAmountInput');
    if (inp) { inp.value = total; calculateTotals(); }
    // Highlight
    document.querySelectorAll('.denom-btn').forEach(b => {
        b.style.background = '#FFF'; b.style.borderColor = '#E0E0E0'; b.style.color = '#333';
    });
    const exact = document.querySelector('.denom-exact');
    if (exact) { exact.style.background = '#C8E6C9'; exact.style.borderColor = '#2E7D32'; exact.style.color = '#2E7D32'; }
}

function updateTransferQR() {
    const qrPanel = document.getElementById('transferQRPanel');
    if (!qrPanel || qrPanel.style.display === 'none') return;

    // Get current grand total
    const totalEl = document.getElementById('grandTotal');
    const amount = totalEl ? parseInt((totalEl.textContent || '0').replace(/,/g, '').replace(/[^\d]/g, '')) : 0;

    // Build description
    const desc = encodeURIComponent('THANH TOAN HASU');
    const accountName = encodeURIComponent(ACCT_HOLDER);

    // VietQR API
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCT}-compact2.png?amount=${amount}&addInfo=${desc}&accountName=${accountName}`;

    const img = document.getElementById('transferQRImg');
    if (img) img.src = qrUrl;

    // Fill info labels
    const el = id => document.getElementById(id);
    if (el('qrBankName')) el('qrBankName').textContent = BANK_NAME_DISPLAY;
    if (el('qrAccNo')) el('qrAccNo').textContent = BANK_ACCT;
    if (el('qrAccHolder')) el('qrAccHolder').textContent = ACCT_HOLDER;
    if (el('qrAmount')) el('qrAmount').textContent = amount.toLocaleString() + 'đ';
    if (el('qrDesc')) el('qrDesc').textContent = 'THANH TOAN HASU';
}

// ==================== SEARCH PRODUCTS (F3) ====================
function initSearch() {
    const searchInput = document.querySelector('.sale-toolbar .search-wrapper input');
    if (!searchInput) return;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'searchDropdown';
    dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#FFF;border:1px solid #E0E0E0;border-radius:0 0 8px 8px;max-height:400px;overflow-y:auto;z-index:999;display:none;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(dropdown);

    searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        if (q.length === 0) { dropdown.style.display = 'none'; return; }

        // Barcode search: show dropdown for user to select unit — do NOT auto-add

        // Search by name, code, or barcode
        const results = products.filter(p =>
            p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.barcode && p.barcode.toLowerCase().includes(q))
        );
        if (results.length === 0) {
            const isBarcode = /^\d{6,}$/.test(q);
            dropdown.innerHTML = `
                <div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px">
                    <span style="color:#999;font-size:13px">Không tìm thấy sản phẩm</span>
                    <button onclick="openAddProductModal('${q.replace(/'/g, "\\'")}',${isBarcode})"
                        style="display:flex;align-items:center;gap:5px;background:#0090DA;color:#fff;border:none;
                        border-radius:5px;padding:5px 12px;font-size:12px;cursor:pointer;white-space:nowrap;flex-shrink:0">
                        <i class="fas fa-plus"></i> Thêm sản phẩm mới
                    </button>
                </div>
            `;
        } else {
            dropdown.innerHTML = results.map((p, i) => {
                const idx = products.indexOf(p);
                return `<div class="search-result-item" onclick="addToCart(${idx});document.getElementById('searchDropdown').style.display='none';document.querySelector('.search-wrapper input').value=''" style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #F5F5F5;font-size:13px" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'">
                    <div style="width:36px;height:36px;border-radius:4px;border:1px solid #F0F0F0;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#FAFAFA">${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : `<i class="far fa-image" style="color:#CCC;font-size:14px"></i>`}</div>
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
                        <div style="font-size:11px;color:#999">${p.code}${p.barcode ? ' · ' + p.barcode : ''}</div>
                    </div>
                    <div style="color:#0090DA;font-weight:600;flex-shrink:0">${p.price.toLocaleString()}</div>
                </div>`;
            }).join('');
        }
        dropdown.style.display = 'block';
    });

    searchInput.addEventListener('focus', function () {
        if (this.value.trim().length > 0) dropdown.style.display = 'block';
    });

    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// ==================== QUICK ADD PRODUCT ====================
function openAddProductModal(query, isBarcode) {
    // Close search dropdown
    const dd = document.getElementById('searchDropdown');
    if (dd) dd.style.display = 'none';
    const searchInput = document.querySelector('.sale-toolbar .search-wrapper input');
    if (searchInput) searchInput.value = '';

    // Remove existing modal
    const existing = document.getElementById('addProductModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'addProductModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;
        display:flex;align-items:center;justify-content:center`;

    const nameVal = isBarcode ? '' : query;
    const bcVal = isBarcode ? query : '';

    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:420px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,0.2);overflow:hidden">
            <div style="background:#0090DA;color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:15px;font-weight:600"><i class="fas fa-plus-circle" style="margin-right:8px"></i>Thêm sản phẩm mới</span>
                <button onclick="document.getElementById('addProductModal').remove()"
                    style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1">×</button>
            </div>
            <div style="padding:18px;display:flex;flex-direction:column;gap:13px">
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">TÊN SẢN PHẨM <span style="color:#e74c3c">*</span></label>
                    <input id="apName" type="text" value="${nameVal}" placeholder="Nhập tên sản phẩm..."
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">MÃ VẠCH / BARCODE</label>
                        <input id="apBarcode" type="text" value="${bcVal}" placeholder="Nhập mã vạch..."
                            style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                            onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                    </div>
                    <div>
                        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">ĐƠN VỊ TÍNH</label>
                        <input id="apUnit" type="text" value="Cái" placeholder="Cái, Hộp, Kg..."
                            style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                            onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">ĐƠN GIÁ BÁN <span style="color:#e74c3c">*</span></label>
                    <input id="apPrice" type="number" value="" placeholder="0"
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none;text-align:right"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                </div>
                <div style="color:#999;font-size:11px;background:#F9F9F9;padding:8px 10px;border-radius:6px">
                    <i class="fas fa-info-circle" style="margin-right:4px;color:#0090DA"></i>
                    Sản phẩm sẽ được thêm tạm thời vào phiên làm việc này và thêm vào giỏ hàng ngay.
                </div>
            </div>
            <div style="padding:12px 18px;border-top:1px solid #F0F0F0;display:flex;gap:8px;justify-content:flex-end">
                <button onclick="document.getElementById('addProductModal').remove()"
                    style="padding:8px 18px;border:1px solid #DDD;border-radius:6px;background:#F5F5F5;color:#555;font-size:13px;cursor:pointer">
                    Hủy
                </button>
                <button onclick="saveNewProduct()"
                    style="padding:8px 20px;border:none;border-radius:6px;background:#0090DA;color:#fff;font-size:13px;cursor:pointer;font-weight:600">
                    <i class="fas fa-check" style="margin-right:6px"></i>Lưu & thêm vào đơn
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    // Focus name or price
    setTimeout(() => {
        const focusEl = document.getElementById(isBarcode ? 'apName' : 'apPrice');
        if (focusEl) focusEl.focus();
    }, 80);
}

function saveNewProduct() {
    const name = (document.getElementById('apName')?.value || '').trim();
    const price = parseFloat(document.getElementById('apPrice')?.value || 0);
    const barcode = (document.getElementById('apBarcode')?.value || '').trim();
    const unit = (document.getElementById('apBarcode') ? document.getElementById('apUnit')?.value : '') || 'Cái';

    if (!name) {
        document.getElementById('apName').style.borderColor = '#e74c3c';
        document.getElementById('apName').focus();
        showToast('Vui lòng nhập tên sản phẩm', 'error');
        return;
    }
    if (price < 0) {
        document.getElementById('apPrice').style.borderColor = '#e74c3c';
        showToast('Đơn giá không hợp lệ', 'error');
        return;
    }

    // Generate a new code (SP + timestamp)
    const newCode = 'SP' + Date.now().toString().slice(-7);
    const newProduct = {
        code: newCode,
        name: name,
        price: price || 0,
        unit: unit || 'Cái',
        barcode: barcode || '',
        img: '',
        customPrice: null,
        discAmt: 0,
        discType: '%'
    };

    products.push(newProduct);

    // Re-render product grids (if visible)
    renderProductGrid();
    renderThuongGrid();

    // Add to cart
    const tab = getActiveTab();
    if (tab) {
        tab.cart.push({ ...newProduct, qty: 1 });
        renderCart();
        calculateTotals();
        renderTabs();
    }

    // Close modal
    const modal = document.getElementById('addProductModal');
    if (modal) modal.remove();

    showToast(`✓ Đã thêm "${name}" vào đơn hàng`, 'success');
}

// ==================== SEARCH CUSTOMER (F4) ====================
function initCustomerSearch() {
    document.querySelectorAll('.customer-search .search-input input, .thuong-header .search-input input, .delivery-customer-search .search-input input').forEach(input => {
        if (!input) return;
        const wrapper = input.closest('.search-input') || input.parentElement;
        wrapper.style.position = 'relative';

        const dropdown = document.createElement('div');
        dropdown.className = 'customer-dropdown';
        dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#FFF;border:1px solid #E0E0E0;border-radius:0 0 8px 8px;max-height:300px;overflow-y:auto;z-index:999;display:none;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
        wrapper.appendChild(dropdown);

        input.addEventListener('input', function () {
            const q = this.value.trim().toLowerCase();
            const results = q.length === 0 ? customers : customers.filter(c =>
                c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q)
            );
            dropdown.innerHTML = results.map(c => `
                <div onclick="selectCustomer('${c.id}');this.closest('.customer-dropdown').style.display='none'" style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #F5F5F5;font-size:13px" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'">
                    <div style="width:28px;height:28px;border-radius:50%;background:#E8F4FD;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0090DA;font-size:11px;font-weight:600">${c.name.charAt(0)}</div>
                    <div style="flex:1">
                        <div style="font-weight:500">${c.name}</div>
                        <div style="font-size:11px;color:#999">${c.phone || 'Chưa có SĐT'} · ${c.id}</div>
                    </div>
                </div>
            `).join('');
            dropdown.style.display = 'block';
        });

        input.addEventListener('focus', function () {
            this.dispatchEvent(new Event('input'));
        });

        document.addEventListener('click', function (e) {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });

    // Add customer + button → open modal
    document.querySelectorAll('.btn-add-customer-inline, .btn-add-customer').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            // Get current search text from nearest input
            const nearInput = btn.closest('.search-input, .customer-search')?.querySelector('input[type="text"]');
            const query = nearInput ? nearInput.value.trim() : '';
            openAddCustomerModal(query);
        });
    });
}

function selectCustomer(customerId) {
    const c = customers.find(x => x.id === customerId);
    if (!c) return;
    const tab = getActiveTab();
    if (tab) tab.customer = c;

    // NOTE: do NOT write customer name into .user-badge — that's the staff area

    // Show customer info badge (phone, debt, points) below the search
    const custInfoId = 'customerInfoBadge';
    document.getElementById(custInfoId)?.remove();
    const custSearchEl = document.querySelector('.payment-panel .customer-search') || document.querySelector('.thuong-header .search-input');
    if (custSearchEl && c.id !== 'KH000001') {
        const badge = document.createElement('div');
        badge.id = custInfoId;
        badge.className = 'customer-info-badge';
        badge.innerHTML = `
            <div class="ci-item"><i class="fas fa-user"></i><span class="ci-value">${c.name}</span></div>
            ${c.phone ? `<div class="ci-item"><i class="fas fa-phone"></i><span class="ci-value">${c.phone}</span></div>` : ''}
            <div class="ci-item"><i class="fas fa-wallet"></i><span class="ci-label">Nợ:</span><span class="ci-value" style="color:${(c.debt || 0) > 0 ? '#e74c3c' : '#27ae60'}">${(c.debt || 0).toLocaleString()}đ</span></div>
            <div class="ci-item"><i class="fas fa-star" style="color:#f39c12"></i><span class="ci-label">Điểm:</span><span class="ci-value">${c.points || 0}</span></div>
        `;
        custSearchEl.parentElement.insertBefore(badge, custSearchEl.nextSibling);
    }

    // Fill search inputs
    document.querySelectorAll('.customer-search input, .thuong-header .search-input input, .delivery-customer-search input').forEach(input => {
        if (input.type === 'text' && input.placeholder?.includes('khách')) {
            input.value = c.name;
        }
    });

    // Hide all customer dropdowns
    document.querySelectorAll('.customer-dropdown').forEach(d => d.style.display = 'none');
    // No toast — the customer badge below search already shows name/phone/debt/points
}

// ==================== QUICK ADD CUSTOMER ====================
function openAddCustomerModal(query) {
    const existing = document.getElementById('addCustomerModal');
    if (existing) existing.remove();

    // Detect if query looks like a phone number
    const isPhone = /^0\d{7,}$/.test(query) || /^\+84/.test(query);
    const nameVal = (!isPhone && !/^\d/.test(query)) ? query : '';
    const phoneVal = isPhone ? query : '';

    const modal = document.createElement('div');
    modal.id = 'addCustomerModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;
        display:flex;align-items:center;justify-content:center`;

    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:440px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,0.2);overflow:hidden">
            <div style="background:#0090DA;color:#fff;padding:14px 18px;display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:15px;font-weight:600"><i class="fas fa-user-plus" style="margin-right:8px"></i>Thêm khách hàng mới</span>
                <button onclick="document.getElementById('addCustomerModal').remove()"
                    style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1">×</button>
            </div>
            <div style="padding:18px;display:flex;flex-direction:column;gap:12px">
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">TÊN KHÁCH HÀNG <span style="color:#e74c3c">*</span></label>
                    <input id="acName" type="text" value="${nameVal}" placeholder="Nhập tên khách hàng..."
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">SỐ ĐIỆN THOẠI</label>
                        <input id="acPhone" type="tel" value="${phoneVal}" placeholder="0901234567"
                            style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                            onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                    </div>
                    <div>
                        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">GIỚI TÍNH</label>
                        <select id="acGender"
                            style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none;background:#fff;cursor:pointer">
                            <option value="">Chưa rõ</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">ĐỊA CHỈ</label>
                    <input id="acAddress" type="text" placeholder="Số nhà, đường, phường, quận..."
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                </div>
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">EMAIL</label>
                    <input id="acEmail" type="email" placeholder="email@example.com"
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'">
                </div>
                <div style="color:#999;font-size:11px;background:#F9F9F9;padding:8px 10px;border-radius:6px">
                    <i class="fas fa-info-circle" style="margin-right:4px;color:#0090DA"></i>
                    Khách hàng sẽ được thêm vào danh sách và chọn tự động cho đơn hàng này.
                </div>
            </div>
            <div style="padding:12px 18px;border-top:1px solid #F0F0F0;display:flex;gap:8px;justify-content:flex-end">
                <button onclick="document.getElementById('addCustomerModal').remove()"
                    style="padding:8px 18px;border:1px solid #DDD;border-radius:6px;background:#F5F5F5;color:#555;font-size:13px;cursor:pointer">Hủy</button>
                <button onclick="saveNewCustomer()"
                    style="padding:8px 20px;border:none;border-radius:6px;background:#0090DA;color:#fff;font-size:13px;cursor:pointer;font-weight:600">
                    <i class="fas fa-check" style="margin-right:6px"></i>Lưu khách hàng
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    setTimeout(() => {
        const focus = document.getElementById(isPhone ? 'acName' : 'acName');
        if (focus) focus.focus();
    }, 80);
}

function saveNewCustomer() {
    const name = (document.getElementById('acName')?.value || '').trim();
    const phone = (document.getElementById('acPhone')?.value || '').trim();
    const address = (document.getElementById('acAddress')?.value || '').trim();
    const email = (document.getElementById('acEmail')?.value || '').trim();
    const gender = (document.getElementById('acGender')?.value || '');

    if (!name) {
        const el = document.getElementById('acName');
        if (el) { el.style.borderColor = '#e74c3c'; el.focus(); }
        showToast('Vui lòng nhập tên khách hàng', 'error');
        return;
    }

    // Generate ID
    const newId = 'KH' + Date.now().toString().slice(-6);
    const newCustomer = { id: newId, name, phone, address, email, gender };
    customers.push(newCustomer);
    saveCustomers(); // Persist to localStorage

    // Close modal
    const modal = document.getElementById('addCustomerModal');
    if (modal) modal.remove();

    // Auto-select the new customer (badge will show below search)
    selectCustomer(newId);
    // No toast — customer badge below search already shows the name
}

// ==================== HOTKEYS ====================
function initHotkeys() {
    document.addEventListener('keydown', function (e) {
        // Don't capture when typing in input
        const tag = e.target.tagName;
        const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        switch (e.key) {
            case 'F2':
                e.preventDefault();
                addNewTab();
                break;
            case 'F3':
                e.preventDefault();
                const searchInput = document.querySelector('.sale-toolbar .search-wrapper input');
                if (searchInput) searchInput.focus();
                break;
            case 'F4':
                e.preventDefault();
                const custInput = document.querySelector('.payment-panel .customer-search input[type="text"]') ||
                    document.querySelector('.thuong-header .search-input input') ||
                    document.querySelector('.delivery-customer-search input[type="text"]');
                if (custInput) custInput.focus();
                break;
            case 'F9':
                e.preventDefault();
                const orderBtn = document.querySelector('.payment-panel .btn-order') ||
                    document.querySelector('.thuong-actions .btn-order') ||
                    document.querySelector('.delivery-buttons .btn-order');
                if (orderBtn) orderBtn.click();
                break;
            case 'Escape':
                if (isInput) e.target.blur();
                document.querySelectorAll('#searchDropdown, .customer-dropdown').forEach(d => d.style.display = 'none');
                break;
        }
    });
}

// ==================== MENU DROPDOWN (☰) ====================
function initMenuDropdown() {
    const menuBtn = document.querySelector('.toolbar-right .toolbar-icon-btn:last-child');
    if (!menuBtn) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'menuDropdown';
    dropdown.style.cssText = 'position:fixed;background:#FFF;border:1px solid #E0E0E0;border-radius:8px;width:260px;z-index:9999;display:none;box-shadow:0 4px 16px rgba(0,0,0,0.15);overflow:hidden';
    dropdown.innerHTML = `
        <div class="menu-item" onclick="openBaoCaoCuoiNgay()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-chart-line" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Xem báo cáo cuối ngày</div>
        <div class="menu-item" onclick="openQuanLyDatHang()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-box-open" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Quản lý đặt hàng</div>
        <div class="menu-item" onclick="openTraHang()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-exchange-alt" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Chọn hóa đơn trả hàng</div>
        <div class="menu-item" onclick="openDatHang()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-cart-plus" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Tạo đơn đặt hàng</div>
        <div class="menu-item" onclick="openLapPhieuThu()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-file-invoice" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Lập phiếu thu</div>
        <div class="menu-item" onclick="openImportFile()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-file-import" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Import file</div>
        <div class="menu-item" onclick="openThietLapIn()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-print" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Thiết lập in</div>
        <div class="menu-item" onclick="openTuyChonHienThi()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-sliders-h" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Tùy chọn hiển thị</div>
        <div class="menu-item" onclick="openPhimTat()" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-info-circle" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Phím tắt</div>
        <div class="menu-item" onclick="window.location.href='management.html'" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-th-large" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Quản lý</div>
        <div class="menu-item" onclick="window.location.href='index.html'" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;color:#555" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-sign-out-alt" style="width:20px;text-align:center;font-size:16px"></i> Đăng xuất</div>
    `;

    document.body.appendChild(dropdown);

    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isShown = dropdown.style.display === 'block';
        if (!isShown) {
            const rect = menuBtn.getBoundingClientRect();
            dropdown.style.top = rect.bottom + 'px';
            dropdown.style.left = (rect.right - 260) + 'px';
        }
        dropdown.style.display = isShown ? 'none' : 'block';
    });

    document.addEventListener('click', () => { dropdown.style.display = 'none'; });
}

// ==================== TOOLBAR BUTTONS ====================
function initToolbarButtons() {
    const btns = document.querySelectorAll('.toolbar-left .toolbar-btn-icon, .toolbar-left .toolbar-btn-text');

    // Image toggle button (first icon btn)
    const imgBtn = btns[0];
    if (imgBtn) {
        let showImages = true;
        imgBtn.addEventListener('click', function () {
            showImages = !showImages;
            document.querySelectorAll('.product-img img, .thuong-grid-thumb img').forEach(img => {
                img.style.display = showImages ? '' : 'none';
            });
            this.style.opacity = showImages ? '1' : '0.5';
            showToast(showImages ? 'Hiện ảnh sản phẩm' : 'Ẩn ảnh sản phẩm', 'info');
        });
    }

    // "Số lượng" toggle button
    const qtyBtn = btns[1];
    if (qtyBtn) {
        qtyBtn.addEventListener('click', function () {
            qtyMode = !qtyMode;
            updateQtyModeUI();
            if (qtyMode) {
                const qty = prompt('Nhập số lượng muốn thêm:', '1');
                if (qty && parseInt(qty) > 0) {
                    qtyBuffer = parseInt(qty);
                    showToast(`Chế độ SL: ${qtyBuffer}. Click SP để thêm`, 'info');
                } else {
                    qtyMode = false;
                    updateQtyModeUI();
                }
            }
        });
    }

    // Scan barcode button — focus search bar in barcode mode
    const scanBtn = document.querySelector('.toolbar-btn-scan');
    if (scanBtn) {
        scanBtn.addEventListener('click', function () {
            const searchInput = document.querySelector('.sale-toolbar .search-wrapper input');
            if (searchInput) {
                searchInput.value = '';
                searchInput.placeholder = 'Quét hoặc nhập mã vạch...';
                searchInput.focus();
                scanBtn.style.background = '#FF6B35';
                scanBtn.style.color = '#FFF';
                showToast('Sẵn sàng quét mã vạch. Dùng máy quét hoặc nhập mã vạch.', 'info');
                // Reset appearance on blur
                const resetScan = () => {
                    searchInput.placeholder = 'Tìm hàng hóa (F3)';
                    scanBtn.style.background = '';
                    scanBtn.style.color = '';
                    searchInput.removeEventListener('blur', resetScan);
                };
                searchInput.addEventListener('blur', resetScan);
            }
        });
    }

    // Toolbar right buttons
    const rightBtns = document.querySelectorAll('.toolbar-right .toolbar-icon-btn');
    // [bag, reply, refresh, print, menu]
    if (rightBtns[0]) rightBtns[0].addEventListener('click', () => showPendingOrdersModal());
    if (rightBtns[1]) rightBtns[1].addEventListener('click', () => showReturnModal());
    if (rightBtns[2]) rightBtns[2].addEventListener('click', () => { location.reload(); });
    if (rightBtns[3]) rightBtns[3].addEventListener('click', () => printInvoice());

    // Wire payment-panel IN button
    document.querySelectorAll('.btn-print, .payment-actions .btn-secondary').forEach(btn => {
        if (btn.textContent.trim() === 'IN' || btn.classList.contains('btn-print')) {
            btn.addEventListener('click', printInvoice);
        }
    });
    // Also look for any button with text 'IN' in payment section
    document.querySelectorAll('.payment-panel button, .payment-actions button').forEach(btn => {
        if (btn.textContent.trim() === 'IN') btn.addEventListener('click', printInvoice);
    });
}

// ==================== PENDING ORDERS (ĐƠN CHỜ) ====================
function holdCurrentOrder() {
    const tab = getActiveTab();
    if (!tab || tab.cart.length === 0) { showToast('Giỏ hàng trống, không thể lưu đơn chờ', 'error'); return; }
    const held = {
        id: 'DC' + Date.now().toString().slice(-6),
        savedAt: new Date(),
        customer: tab.customer ? { ...tab.customer } : null,
        cart: tab.cart.map(c => ({ ...c })),
        payMethod: tab.payMethod || 'cash',
        note: tab.note || '',
    };
    pendingOrders.unshift(held);
    savePendingOrders();
    // Clear current cart
    tab.cart = [];
    tab.customer = null;
    tab.note = '';
    renderCart();
    calculateTotals();
    renderTabs();
    showToast('Đã lưu đơn chờ: ' + held.id, 'success');
}

function showPendingOrdersModal() {
    document.getElementById('pendingModal')?.remove();
    const fmt = (n) => n.toLocaleString('vi-VN');
    const timeStr = (d) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let listHTML;
    if (pendingOrders.length === 0) {
        listHTML = '<div style="text-align:center;padding:40px 0;color:#888"><i class="fas fa-bag-shopping" style="font-size:36px;opacity:.3"></i><p style="margin-top:12px">Chưa có đơn chờ nào</p></div>';
    } else {
        const rows = pendingOrders.map((o, idx) => {
            const total = o.cart.reduce((s, c) => {
                const ep = (c.customPrice !== null && c.customPrice !== undefined) ? c.customPrice : c.price;
                return s + ep * c.qty;
            }, 0);
            return '<div class="pend-order" data-idx="' + idx + '" style="border:1px solid #e0e0e0;border-radius:8px;padding:10px 14px;margin-bottom:8px;cursor:pointer;background:#fff;transition:background .15s">'
                + '<div style="display:flex;justify-content:space-between;align-items:center">'
                + '<span style="font-weight:600;color:#FF6B35">' + o.id + '</span>'
                + '<span style="font-size:12px;color:#555">' + timeStr(o.savedAt) + '</span>'
                + '</div>'
                + '<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:13px">'
                + '<span style="color:#333">' + (o.customer ? o.customer.name : 'Khách lẻ') + ' &bull; ' + o.cart.reduce((s, c) => s + c.qty, 0) + ' sp</span>'
                + '<span style="font-weight:700;color:#1a237e">' + fmt(total) + 'đ</span>'
                + '</div>'
                + '<div style="margin-top:6px;display:flex;gap:6px">'
                + '<button class="pend-restore" data-idx="' + idx + '" style="padding:3px 10px;font-size:11px;border:1px solid #0090DA;background:#E8F4FD;color:#0090DA;border-radius:4px;cursor:pointer">↩ Khôi phục</button>'
                + '<button class="pend-delete" data-idx="' + idx + '" style="padding:3px 10px;font-size:11px;border:1px solid #e0e0e0;background:#fff;color:#999;border-radius:4px;cursor:pointer">✕ Xóa</button>'
                + '</div>'
                + '</div>';
        }).join('');
        listHTML = '<div style="max-height:400px;overflow-y:auto">' + rows + '</div>';
    }

    const overlay = document.createElement('div');
    overlay.id = 'pendingModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:#fff;border-radius:12px;width:480px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.2);font-family:Arial,sans-serif">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee">'
        + '<h3 style="margin:0;font-size:16px"><i class="fas fa-bag-shopping" style="color:#FF6B35;margin-right:8px"></i>Đơn chờ (' + pendingOrders.length + ')</h3>'
        + '<div style="display:flex;gap:8px;align-items:center">'
        + '<button id="btnHoldCurrent" style="padding:5px 14px;background:#FF6B35;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer">+ Lưu đơn hiện tại</button>'
        + '<button onclick="document.getElementById(\'pendingModal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666">&times;</button>'
        + '</div></div>'
        + '<div style="padding:16px 20px">' + listHTML + '</div>'
        + '</div>';

    // Wire buttons
    overlay.querySelector('#btnHoldCurrent').addEventListener('click', () => {
        holdCurrentOrder();
        showPendingOrdersModal(); // refresh modal
    });
    overlay.querySelectorAll('.pend-restore').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            restorePendingOrder(idx);
        });
    });
    overlay.querySelectorAll('.pend-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            pendingOrders.splice(idx, 1);
            savePendingOrders();
            showPendingOrdersModal();
            showToast('Đã xóa đơn chờ', 'info');
        });
    });
    overlay.querySelectorAll('.pend-order').forEach(row => {
        row.addEventListener('mouseenter', () => row.style.background = '#f9f9f9');
        row.addEventListener('mouseleave', () => row.style.background = '#fff');
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

function restorePendingOrder(idx) {
    const order = pendingOrders[idx];
    if (!order) return;
    const tab = getActiveTab();
    if (tab.cart.length > 0) {
        if (!confirm('Giỏ hàng hiện tại không trống. Khôi phục sẽ thay thế giỏ hàng. Tiếp tục?')) return;
    }
    tab.cart = order.cart.map(c => ({ ...c }));
    tab.customer = order.customer ? { ...order.customer } : null;
    tab.note = order.note || '';
    tab.payMethod = order.payMethod || 'cash';
    pendingOrders.splice(idx, 1);
    savePendingOrders();
    renderCart();
    calculateTotals();
    renderTabs();
    selectPayMethod(tab.payMethod);
    document.getElementById('pendingModal')?.remove();
    showToast('Đã khôi phục đơn chờ: ' + order.id, 'success');
}

// ==================== RETURN MODAL ====================
function showReturnModal() {
    // Remove any existing modal
    document.getElementById('returnModal')?.remove();

    const today = new Date();
    const todayStr = today.toDateString();
    const todayOrders = completedOrders.filter(o => o.time.toDateString() === todayStr);

    const overlay = document.createElement('div');
    overlay.id = 'returnModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';

    const fmt = (n) => n.toLocaleString('vi-VN');
    const timeStr = (d) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let listHTML;
    if (todayOrders.length === 0) {
        listHTML = '<div style="text-align:center;padding:40px 0;color:#888"><i class="fas fa-receipt" style="font-size:36px;opacity:.3"></i><p style="margin-top:12px">Chưa có hoá đơn nào trong ngày</p></div>';
    } else {
        const rows = todayOrders.map((o, idx) => {
            const isLatest = idx === 0;
            return `
            <div class="ret-order ${isLatest ? 'ret-order--latest' : ''}" data-idx="${idx}"
                 style="border:1px solid ${isLatest ? '#0090DA' : '#e0e0e0'};border-radius:8px;padding:10px 14px;margin-bottom:8px;cursor:pointer;background:${isLatest ? '#EBF5FB' : '#fff'};transition:background .15s">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-weight:600;color:#0090DA">${o.id}</span>
                <span style="font-size:12px;color:#555">${timeStr(o.time)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:13px">
                <span style="color:#333">${o.customer ? o.customer.name : 'Khách lẻ'} &bull; ${o.cart.reduce((s, c) => s + c.qty, 0)} sp</span>
                <span style="font-weight:700;color:#1a237e">${fmt(o.grandTotal)}đ</span>
              </div>
              ${isLatest ? '<div style="font-size:11px;color:#0090DA;margin-top:2px">★ Mới nhất</div>' : ''}
            </div>`;
        }).join('');
        listHTML = `<div style="max-height:340px;overflow-y:auto;padding-right:2px">${rows}</div>`;
    }

    overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:520px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.2);font-family:Arial,sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee">
            <h3 style="margin:0;font-size:16px">Trả hàng</h3>
            <button onclick="document.getElementById('returnModal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666">&times;</button>
        </div>
        <div style="padding:16px 20px">
            <div style="font-size:13px;color:#555;margin-bottom:10px">Hoá đơn trong ngày (${today.toLocaleDateString('vi-VN')}) &mdash; chọn hoá đơn cần trả:</div>
            ${listHTML}
        </div>
    </div>`;

    // Click order row to open detail
    overlay.querySelectorAll('.ret-order').forEach(row => {
        row.addEventListener('mouseenter', () => { if (!row.classList.contains('ret-order--latest')) row.style.background = '#f5f5f5'; });
        row.addEventListener('mouseleave', () => { if (!row.classList.contains('ret-order--latest')) row.style.background = '#fff'; });
        row.addEventListener('click', () => {
            const idx = parseInt(row.dataset.idx);
            showReturnDetail(todayOrders[idx]);
        });
    });

    // Close on overlay click (outside modal)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

function showReturnDetail(order) {
    document.getElementById('returnModal')?.remove();
    const fmt = (n) => n.toLocaleString('vi-VN');
    const timeStr = order.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const payLabel = order.payMethod === 'bank' ? 'Chuyển khoản' : order.payMethod === 'card' ? 'Thẻ' : 'Tiền mặt';

    const rows = order.cart.map((item, i) => {
        const ep = (item.customPrice !== null && item.customPrice !== undefined) ? item.customPrice : item.price;
        const lineTotal = ep * item.qty;
        return `<tr style="border-bottom:1px solid #eee">
            <td style="padding:6px 8px;font-size:13px">${item.name}</td>
            <td style="padding:6px 8px;text-align:center;font-size:13px">${item.qty}</td>
            <td style="padding:6px 8px;text-align:right;font-size:13px">${fmt(ep)}đ</td>
            <td style="padding:6px 8px;text-align:right;font-size:13px">${fmt(lineTotal)}đ</td>
            <td style="padding:6px 8px;text-align:center">
                <input type="checkbox" class="ret-chk" data-idx="${i}" checked
                       style="width:16px;height:16px;cursor:pointer">
            </td>
        </tr>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'returnModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;width:620px;max-width:96vw;box-shadow:0 8px 40px rgba(0,0,0,.2);font-family:Arial,sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee">
            <h3 style="margin:0;font-size:16px">Trả hàng &mdash; ${order.id} &mdash; ${timeStr}</h3>
            <div style="display:flex;gap:8px;align-items:center">
                <button onclick="showReturnModal()" style="background:#f0f0f0;border:none;border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer">← Quay lại</button>
                <button onclick="document.getElementById('returnModal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666">&times;</button>
            </div>
        </div>
        <div style="padding:16px 20px">
            <div style="font-size:13px;color:#555;margin-bottom:8px">
                <b>${order.customer ? order.customer.name : 'Khách lẻ'}</b> &nbsp;&bull;&nbsp; ${payLabel} &nbsp;&bull;&nbsp; Tổng: <b>${fmt(order.grandTotal)}đ</b>
            </div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #eee">
                <thead style="background:#f5f5f5">
                    <tr>
                        <th style="padding:6px 8px;text-align:left;font-size:12px">Sản phẩm</th>
                        <th style="padding:6px 8px;text-align:center;font-size:12px">SL</th>
                        <th style="padding:6px 8px;text-align:right;font-size:12px">Đơn giá</th>
                        <th style="padding:6px 8px;text-align:right;font-size:12px">Thành tiền</th>
                        <th style="padding:6px 8px;text-align:center;font-size:12px">Chọn trả</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
            <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:10px">
                <button onclick="document.getElementById('returnModal').remove()" style="padding:8px 20px;background:#f0f0f0;border:none;border-radius:7px;font-size:13px;cursor:pointer">Hủy</button>
                <button id="btnConfirmReturn" style="padding:8px 22px;background:#e53935;color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer">Xác nhận trả hàng</button>
            </div>
        </div>
    </div>`;

    overlay.querySelector('#btnConfirmReturn').addEventListener('click', () => {
        const checked = [...overlay.querySelectorAll('.ret-chk:checked')].map(c => parseInt(c.dataset.idx));
        if (checked.length === 0) { showToast('Chưa chọn mặt hàng nào để trả', 'error'); return; }
        // Add returned items to a new tab as negative-qty note
        const returnItems = checked.map(i => order.cart[i]);
        showToast('Trả hàng thành công: ' + returnItems.map(it => it.name).join(', '), 'success');
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
}

function updateQtyModeUI() {
    const qtyBtn = document.querySelector('.toolbar-left .toolbar-btn-text');
    if (qtyBtn) {
        qtyBtn.style.background = qtyMode ? '#FF6B35' : '';
        qtyBtn.style.color = qtyMode ? '#FFF' : '';
    }
}

// ==================== PRINT INVOICE ====================
const STORE_INFO = {
    name: 'BHS HASU',
    address: '123 Đường ABC, Phường XYZ, TP. Hồ Chí Minh',
    phone: '0901 234 567',
    taxId: '',  // Mã thuế (nếu có)
    footer: 'Cảm ơn quý khách! Hẹn gặp lại!',
};

let receiptSize = 'K80'; // 'K80' or 'K57' — default receipt paper size

function printInvoice() {
    const tab = getActiveTab();
    if (!tab || tab.cart.length === 0) {
        showToast('Kh\u00f4ng c\u00f3 s\u1ea3n ph\u1ea9m \u0111\u1ec3 in', 'error');
        return;
    }

    const cart = tab.cart;
    const subtotal = Math.round(cart.reduce((s, c) => s + getCartItemLineTotal(c), 0));
    const rawDisc = parseFloat(document.getElementById('discountInput')?.value || 0);
    const discount = discountMode === '%' ? Math.round(subtotal * Math.min(rawDisc, 100) / 100) : Math.round(rawDisc);
    const other = parseInt(document.getElementById('otherInput')?.value || 0);
    const grandTotal = subtotal - discount + other;

    const now = new Date();
    const invoiceNo = 'HD' + Date.now().toString().slice(-8);
    const dateStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const customer = tab.customer ? tab.customer.name : 'Kh\u00e1ch l\u1ebb';
    const cashier = activeStaffId ? (staffList.find(s => s.id === activeStaffId)?.name || 'NV') : 'NV';
    const payMethod = tab.payMethod === 'bank' ? 'Chuy\u1ec3n kho\u1ea3n' : tab.payMethod === 'card' ? 'Th\u1ebb' : 'Ti\u1ec1n m\u1eb7t';
    const paid = parseInt(document.getElementById('payAmountInput')?.value || 0);
    const change = paid > grandTotal ? paid - grandTotal : 0;

    const showQR = tab.payMethod === 'bank';
    const qrUrl = showQR
        ? 'https://img.vietqr.io/image/' + BANK_ID + '-' + BANK_ACCT + '-compact2.png?amount=' + grandTotal + '&addInfo=THANH%20TOAN%20HASU&accountName=' + encodeURIComponent(ACCT_HOLDER)
        : '';

    const fmt = (n) => n.toLocaleString('vi-VN');
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);

    // Build item rows (thermal style: name on line 1, qty x price = total on line 2)
    const itemRows = cart.map((item, i) => {
        const ep = (item.customPrice !== null && item.customPrice !== undefined) ? item.customPrice : item.price;
        let iDisc = 0;
        if (item.discAmt > 0) {
            iDisc = item.discType === '%' ? Math.round(ep * item.qty * item.discAmt / 100) : Math.round(item.discAmt);
        }
        const lt = ep * item.qty - iDisc;
        let row = '<div class="item-name">' + (i + 1) + '. ' + item.name + '</div>';
        row += '<div class="item-detail"><span>' + item.qty + ' x ' + fmt(ep) + '</span><span>' + fmt(lt) + '</span></div>';
        if (item.discAmt > 0) {
            row += '<div class="item-disc">   Gi\u1ea3m: ' + (item.discType === '%' ? item.discAmt + '%' : fmt(item.discAmt) + '\u0111') + '</div>';
        }
        return row;
    }).join('');

    // Build total block
    let totals = '';
    totals += '<div class="tot-line"><span>T\u1ed5ng ti\u1ec1n h\u00e0ng (' + totalQty + ' SP):</span><span>' + fmt(subtotal) + '</span></div>';
    if (discount > 0) {
        totals += '<div class="tot-line"><span>Chi\u1ebft kh\u1ea5u' + (discountMode === '%' ? ' (' + rawDisc + '%)' : '') + ':</span><span>-' + fmt(discount) + '</span></div>';
    }
    if (other > 0) {
        totals += '<div class="tot-line"><span>Thu kh\u00e1c:</span><span>+' + fmt(other) + '</span></div>';
    }
    totals += '<div class="tot-line grand"><span>T\u1ed5ng thanh to\u00e1n:</span><span>' + fmt(grandTotal) + '</span></div>';
    totals += '<div class="tot-line"><span>Ph\u01b0\u01a1ng th\u1ee9c TT:</span><span>' + payMethod + '</span></div>';
    if (paid > 0) {
        totals += '<div class="tot-line"><span>Ti\u1ec1n kh\u00e1ch tr\u1ea3:</span><span>' + fmt(paid) + '</span></div>';
    }
    if (change > 0) {
        totals += '<div class="tot-line"><span>Ti\u1ec1n th\u1eeba:</span><span>' + fmt(change) + '</span></div>';
    }

    // QR block
    const qrBlock = showQR
        ? '<div class="qr-zone"><img src="' + qrUrl + '" class="qr-img"><div class="qr-info">' + BANK_NAME_DISPLAY + ' \u00b7 ' + BANK_ACCT + '<br>' + ACCT_HOLDER + '</div></div>'
        : '';

    const isK57 = receiptSize === 'K57';
    const bodyW = isK57 ? 200 : 302; // px: K57=48mm≈200px, K80=72mm≈302px
    const fontSize = isK57 ? 11 : 13;
    const titleSize = isK57 ? 14 : 18;
    const subSize = isK57 ? 10 : 11;
    const qrW = isK57 ? 100 : 140;

    const html = '<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">'
        + '<title>H\u00f3a \u0111\u01a1n - ' + invoiceNo + '</title>'
        + '<style>'
        + '* { margin:0; padding:0; box-sizing:border-box; }'
        + 'html, body { background:#fff!important; color:#000!important; color-scheme:light!important; }'
        + 'body { font-family:"Courier New",Courier,monospace; font-size:' + fontSize + 'px; width:' + bodyW + 'px; margin:0 auto; padding:8px; }'
        + '.store-logo { display:block; margin:0 auto 4px; }'
        + '.store-name { text-align:center; font-size:' + titleSize + 'px; font-weight:900; letter-spacing:1px; margin-bottom:2px; }'
        + '.store-sub { text-align:center; font-size:' + subSize + 'px; color:#333; line-height:1.5; }'
        + '.dv { border:none; border-top:1px dashed #555; margin:6px 0; }'
        + '.inv-title { text-align:center; font-size:' + (fontSize + 1) + 'px; font-weight:700; margin:4px 0 2px; }'
        + '.inv-info { font-size:' + subSize + 'px; }'
        + '.inv-info span { display:inline-block; }'
        + '.item-name { font-size:' + fontSize + 'px; font-weight:600; margin-top:4px; word-break:break-word; }'
        + '.item-detail { display:flex; justify-content:space-between; font-size:' + fontSize + 'px; }'
        + '.item-disc { font-size:' + (fontSize - 2) + 'px; color:#C62828; }'
        + '.tot-line { display:flex; justify-content:space-between; font-size:' + fontSize + 'px; padding:1px 0; }'
        + '.tot-line.grand { font-weight:900; font-size:' + (fontSize + 2) + 'px; border-top:1px dashed #000; border-bottom:1px dashed #000; padding:4px 0; margin:4px 0; }'
        + '.footer-msg { text-align:center; font-size:' + subSize + 'px; font-style:italic; margin-top:8px; color:#333; }'
        + '.qr-zone { text-align:center; margin:8px 0; }'
        + '.qr-img { width:' + qrW + 'px; height:' + qrW + 'px; }'
        + '.qr-info { font-size:' + (subSize - 1) + 'px; color:#555; margin-top:2px; }'
        // Size picker + print button bar (hidden when printing)
        + '.toolbar-bar { display:flex; justify-content:center; align-items:center; gap:8px; margin:12px 0 4px; }'
        + '.sz-btn { padding:4px 14px; border:1px solid #ccc; border-radius:4px; font-size:12px; cursor:pointer; background:#f5f5f5; font-family:Arial,sans-serif; }'
        + '.sz-btn.active { background:#0090DA; color:#fff; border-color:#0090DA; }'
        + '.print-go { padding:6px 22px; background:#0090DA; color:#fff; border:none; border-radius:5px; font-size:13px; cursor:pointer; font-family:Arial,sans-serif; }'
        + '@media print { .toolbar-bar { display:none!important; } body { padding:2px!important; } }'
        + '</style></head><body>'
        // Receipt content
        + '<div style="text-align:center"><img class="store-logo" src="https://hasu.nentangso.site/logo.png" alt="Logo" style="width:' + (isK57 ? 50 : 60) + 'px;height:auto"></div>'
        + '<div class="store-name">' + STORE_INFO.name + '</div>'
        + '<div class="store-sub">' + STORE_INFO.address + '</div>'
        + '<div class="store-sub">S\u0110T: ' + STORE_INFO.phone + (STORE_INFO.taxId ? ' | MST: ' + STORE_INFO.taxId : '') + '</div>'
        + '<hr class="dv">'
        + '<div class="inv-title">H\u00d3A \u0110\u01a0N B\u00c1N H\u00c0NG</div>'
        + '<div class="store-sub">S\u1ed1: ' + invoiceNo + '</div>'
        + '<div class="store-sub">' + dateStr + '</div>'
        + '<hr class="dv">'
        + '<div class="inv-info"><span>KH: ' + customer + '</span></div>'
        + '<div class="inv-info"><span>NV: ' + cashier + '</span></div>'
        + '<hr class="dv">'
        + itemRows
        + '<hr class="dv">'
        + totals
        + (showQR ? '<hr class="dv">' + qrBlock : '')
        + '<hr class="dv">'
        + '<div class="footer-msg">' + STORE_INFO.footer + '</div>'
        + '<div class="toolbar-bar">'
        + '<button class="sz-btn' + (receiptSize === 'K80' ? ' active' : '') + '" id="btnK80" onclick="switchSize(\'K80\')">K80</button>'
        + '<button class="sz-btn' + (receiptSize === 'K57' ? ' active' : '') + '" id="btnK57" onclick="switchSize(\'K57\')">K57</button>'
        + '<button class="print-go" onclick="doPrint()">' + '\uD83D\uDDA8 In</button>'
        + '</div>'
        + '<script>'
        + 'var sizes={"K80":{w:302,fs:13,ts:18,ss:11,qr:140,logo:60},"K57":{w:200,fs:11,ts:14,ss:10,qr:100,logo:50}};'
        + 'function switchSize(s){'
        + '  if(window.opener) window.opener.receiptSize=s;'
        + '  var c=sizes[s];'
        + '  document.body.style.width=c.w+"px";'
        + '  document.body.style.fontSize=c.fs+"px";'
        + '  document.querySelector(".store-name").style.fontSize=c.ts+"px";'
        + '  document.querySelectorAll(".store-sub,.inv-info").forEach(function(e){e.style.fontSize=c.ss+"px"});'
        + '  document.querySelectorAll(".item-name,.item-detail,.tot-line").forEach(function(e){e.style.fontSize=c.fs+"px"});'
        + '  document.querySelector(".inv-title").style.fontSize=(c.fs+1)+"px";'
        + '  var gl=document.querySelector(".tot-line.grand"); if(gl) gl.style.fontSize=(c.fs+2)+"px";'
        + '  document.querySelectorAll(".item-disc").forEach(function(e){e.style.fontSize=(c.fs-2)+"px"});'
        + '  document.querySelector(".footer-msg").style.fontSize=c.ss+"px";'
        + '  var logo=document.querySelector(".store-logo"); if(logo) logo.style.width=c.logo+"px";'
        + '  var qi=document.querySelector(".qr-img"); if(qi){qi.style.width=c.qr+"px";qi.style.height=c.qr+"px"}'
        + '  document.getElementById("btnK80").className="sz-btn"+(s==="K80"?" active":"");'
        + '  document.getElementById("btnK57").className="sz-btn"+(s==="K57"?" active":"");'
        + '  window.resizeTo(c.w+80,700);'
        + '}'
        + 'function doPrint(){'
        + '  window.print();'
        + '  if(window.opener && window.opener.completeOrder) window.opener.completeOrder();'
        + '}'
        + '<\/script>'
        + '</body></html>';

    const win = window.open('', '_blank', 'width=' + (bodyW + 60) + ',height=700,scrollbars=yes');
    if (!win) { showToast('Tr\u00ecnh duy\u1ec7t \u0111\u00e3 ch\u1eb7n pop-up. Vui l\u00f2ng cho ph\u00e9p pop-up.', 'error'); return; }
    win.document.write(html);
    win.document.close();
    // No auto-print — employee reviews bill first, then clicks In
}


// ==================== BARCODE SCANNER LISTENER ====================
function initBarcodeScanner() {
    let barcodeBuf = '';
    let lastKeyTime = 0;
    const SCAN_THRESHOLD = 50;  // Max ms between keypresses for scanner input
    const SCAN_TIMEOUT = 300;   // Reset buffer after this ms of inactivity
    let scanTimer = null;

    document.addEventListener('keydown', function (e) {
        const tag = e.target.tagName;
        const isSearchInput = e.target === document.querySelector('.sale-toolbar .search-wrapper input');
        const isOtherInput = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && !isSearchInput;

        // Don't intercept when typing in non-search inputs
        if (isOtherInput) return;

        const now = Date.now();
        const timeDiff = now - lastKeyTime;
        lastKeyTime = now;

        // Clear timer
        if (scanTimer) clearTimeout(scanTimer);

        if (e.key === 'Enter' && barcodeBuf.length >= 4) {
            // Scanner finished — show search results instead of auto-adding
            e.preventDefault();
            const code = barcodeBuf.trim();
            barcodeBuf = '';

            // Put the barcode into the search input and trigger search dropdown
            const searchInput = document.querySelector('.sale-toolbar .search-wrapper input');
            if (searchInput) {
                searchInput.value = code;
                searchInput.focus();
                // Trigger the search so dropdown appears with product + unit options
                const evt = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(evt);
            }
            return;
        }

        // Build buffer from rapid keypresses (scanner fires keys very fast)
        if (e.key.length === 1) {
            if (timeDiff < SCAN_THRESHOLD || barcodeBuf.length === 0) {
                barcodeBuf += e.key;
            } else {
                // Too slow — user is typing manually, reset
                barcodeBuf = e.key;
            }
        }

        // Auto-clear buffer after inactivity
        scanTimer = setTimeout(() => { barcodeBuf = ''; }, SCAN_TIMEOUT);
    });
}

// ==================== FIX BÁN GIAO HÀNG BUGS ====================
function fixGiaoHangBugs() {
    // Bug fix: In Bán giao hàng mode, ensure note-input-wrapper only shows once
    // and bottom-price-breakdown doesn't show payment panel content.
    // This is handled by CSS mode switching already, but the server HTML
    // might have duplicate elements. Clean them up via JS.

    // Wait for DOM to settle
    setTimeout(() => {
        // Remove any duplicate "Ghi chú đơn hàng" in delivery area
        const noteWrappers = document.querySelectorAll('.note-input-wrapper');
        if (noteWrappers.length > 1) {
            for (let i = 1; i < noteWrappers.length; i++) {
                noteWrappers[i].remove();
            }
        }

        // Ensure bottom-summary is removed if it exists (old structure)
        const bottomSummary = document.getElementById('bottomSummary');
        if (bottomSummary) bottomSummary.remove();
    }, 100);
}

// ==================== STAFF & BRANCH DROPDOWN (Tester ▼ / 🚶 ▼) ====================
const staffList = [
    { id: 'NV001', name: 'Tester', role: 'Thu ngân' },
    { id: 'NV002', name: 'Nguyễn Bình', role: 'Thu ngân' },
    { id: 'NV003', name: 'Trần Minh', role: 'Quản lý' },
    { id: 'NV004', name: 'Lê Hoa', role: 'Hỗ trợ' },
];
const branchList = [
    { id: 'KH01', name: 'Zalo', label: 'Zalo OA', icon: 'fab fa-comment-dots', color: '#0068FF' },
    { id: 'KH02', name: 'TikTok', label: 'TikTok Shop', icon: 'fab fa-tiktok', color: '#010101' },
    { id: 'KH03', name: 'Facebook', label: 'Facebook Page', icon: 'fab fa-facebook', color: '#1877F2' },
];
let activeStaffId = 'NV001';
let activeBranchId = 'KH01';

function initStaffDropdown() {
    // Find all payment-user divs (payment panel + delivery panel)
    document.querySelectorAll('.payment-user, .delivery-user').forEach(container => {
        container.style.cssText += 'position:relative;cursor:pointer;user-select:none';

        container.addEventListener('click', function (e) {
            e.stopPropagation();
            // Determine which part was clicked: badge (staff) or walking icon (branch)
            const clickedBadge = e.target.closest('.user-badge') || e.target.classList.contains('fa-caret-down') &&
                e.target.previousSibling?.tagName === 'SPAN';
            const clickedWalk = e.target.classList.contains('fa-walking') ||
                e.target.classList.contains('fa-thumbtack') ||
                (e.target.classList.contains('fa-caret-down') && !e.target.closest('.user-badge'));

            closeAllStaffDropdowns();

            if (clickedWalk || (!clickedBadge && clickedWalk)) {
                openBranchDropdown(container);
            } else {
                openStaffDropdown(container);
            }
        });
    });

    document.addEventListener('click', closeAllStaffDropdowns);
}

function closeAllStaffDropdowns() {
    document.querySelectorAll('#staffDropdown,#branchDropdown').forEach(d => d.remove());
}

function openStaffDropdown(anchor) {
    const d = document.createElement('div');
    d.id = 'staffDropdown';
    d.style.cssText = `position:absolute;top:100%;left:0;background:#fff;border:1px solid #E0E0E0;
        border-radius:8px;min-width:200px;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);overflow:hidden`;
    d.innerHTML = `
        <div style="padding:8px 12px;font-size:11px;color:#999;border-bottom:1px solid #F5F5F5;font-weight:600">NHÂN VIÊN BÁN HÀNG</div>
        ${staffList.map(s => `
            <div onclick="selectStaff('${s.id}')" style="
                display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;
                font-size:13px;border-bottom:1px solid #F5F5F5;
                background:${s.id === activeStaffId ? '#F0F7FF' : '#FFF'};
                color:${s.id === activeStaffId ? '#0090DA' : '#333'}
            " onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='${s.id === activeStaffId ? '#F0F7FF' : '#FFF'}'">
                <div style="width:28px;height:28px;border-radius:50%;background:${s.id === activeStaffId ? '#0090DA' : '#E0E0E0'};
                    display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600;flex-shrink:0">
                    ${s.name.charAt(0)}
                </div>
                <div style="flex:1">
                    <div style="font-weight:${s.id === activeStaffId ? '600' : '400'}">${s.name}</div>
                    <div style="font-size:10px;color:#999">${s.role}</div>
                </div>
                ${s.id === activeStaffId ? '<i class="fas fa-check" style="color:#0090DA;font-size:12px"></i>' : ''}
            </div>
        `).join('')}
    `;
    anchor.appendChild(d);
    d.addEventListener('click', e => e.stopPropagation());
}

function openBranchDropdown(anchor) {
    const d = document.createElement('div');
    d.id = 'branchDropdown';
    d.style.cssText = `position:absolute;top:100%;left:0;background:#fff;border:1px solid #E0E0E0;
        border-radius:8px;min-width:210px;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15);overflow:hidden`;

    const directActive = activeBranchId === null;
    d.innerHTML = `
        <div style="padding:8px 12px;font-size:11px;color:#999;border-bottom:1px solid #F5F5F5;font-weight:600">KÊNH BÁN HÀNG</div>
        <div onclick="selectBranch(null)" style="
            display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;
            font-size:13px;border-bottom:1px solid #F5F5F5;
            background:${directActive ? '#F0F7FF' : '#FFF'};
        " onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='${directActive ? '#F0F7FF' : '#FFF'}'">
            <i class="fas fa-store" style="color:${directActive ? '#0090DA' : '#999'};width:22px;text-align:center;font-size:14px"></i>
            <div style="flex:1">
                <div style="font-weight:${directActive ? '600' : '400'};color:${directActive ? '#0090DA' : '#333'}">Bán trực tiếp</div>
                <div style="font-size:10px;color:#999">Tại quầy</div>
            </div>
            ${directActive ? '<i class="fas fa-check" style="color:#0090DA;font-size:12px"></i>' : ''}
        </div>
        ${branchList.map(b => {
        const isActive = b.id === activeBranchId;
        return `<div onclick="selectBranch('${b.id}')" style="
                display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;
                font-size:13px;border-bottom:1px solid #F5F5F5;
                background:${isActive ? '#F0F7FF' : '#FFF'};
            " onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='${isActive ? '#F0F7FF' : '#FFF'}'">
                <i class="${b.icon}" style="color:${isActive ? b.color : '#999'};width:22px;text-align:center;font-size:16px"></i>
                <div style="flex:1">
                    <div style="font-weight:${isActive ? '600' : '400'};color:${isActive ? b.color : '#333'}">${b.name}</div>
                    <div style="font-size:10px;color:#999">${b.label}</div>
                </div>
                ${isActive ? `<i class="fas fa-check" style="color:${b.color};font-size:12px"></i>` : ''}
            </div>`;
    }).join('')}
    `;
    anchor.appendChild(d);
    d.addEventListener('click', e => e.stopPropagation());
}

function selectStaff(id) {
    activeStaffId = id;
    const s = staffList.find(x => x.id === id);
    if (!s) return;
    // Update all user-badge spans
    document.querySelectorAll('.user-badge').forEach(badge => {
        badge.innerHTML = `${s.name} <i class="fas fa-caret-down" style="font-size:10px;color:#999"></i>`;
    });
    closeAllStaffDropdowns();
}

function selectBranch(id) {
    activeBranchId = id;
    closeAllStaffDropdowns();
}

// ==================== TOAST ====================
function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
    const icon = icons[type || 'success'] || '✓';
    toast.innerHTML = `<span style="margin-right:6px;font-weight:700">${icon}</span>${message}`;
    toast.className = 'toast-notification show toast-' + (type || 'success');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 2800);
}

// ==================== DATETIME ====================
function updateDatetime() {
    const now = new Date();
    const str = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const el1 = document.getElementById('paymentDatetime');
    const el2 = document.getElementById('deliveryDatetime');
    if (el1) el1.textContent = str;
    if (el2) el2.textContent = str;
}

// ==================== MODAL HELPER ====================
function openModal(title, content, width = '700px') {
    closeModal();
    const overlay = document.createElement('div');
    overlay.id = 'kvModal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `<div style="background:#fff;border-radius:8px;width:${width};max-width:95vw;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.25)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #E0E0E0;background:#F8F9FA;border-radius:8px 8px 0 0">
            <h3 style="margin:0;font-size:16px;color:#333">${title}</h3>
            <button onclick="closeModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666;padding:4px 8px">&times;</button>
        </div>
        <div style="padding:20px;overflow-y:auto;flex:1">${content}</div>
    </div>`;
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
}

function closeModal() {
    const m = document.getElementById('kvModal');
    if (m) m.remove();
}

// ==================== 1. BÁO CÁO CUỐI NGÀY ====================
function openBaoCaoCuoiNgay() {
    document.getElementById('menuDropdown').style.display = 'none';
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    const totalOrders = tabs.reduce((s, t) => s + (t.cart.length > 0 ? 1 : 0), 0);

    const content = `
        <div style="margin-bottom:16px;display:flex;gap:12px">
            <button class="report-tab active" onclick="switchReportTab(this,'summary')" style="padding:8px 16px;border:1px solid #0090DA;background:#E8F4FD;color:#0090DA;border-radius:4px;cursor:pointer;font-size:13px">Tổng hợp</button>
            <button class="report-tab" onclick="switchReportTab(this,'products')" style="padding:8px 16px;border:1px solid #ddd;background:#fff;color:#666;border-radius:4px;cursor:pointer;font-size:13px">Hàng hóa</button>
            <button class="report-tab" onclick="switchReportTab(this,'cashflow')" style="padding:8px 16px;border:1px solid #ddd;background:#fff;color:#666;border-radius:4px;cursor:pointer;font-size:13px">Thu chi</button>
        </div>
        <div id="reportContent">
            <div style="text-align:center;color:#666;padding:20px;border:1px solid #eee;border-radius:8px">
                <h4 style="margin:0 0 16px">Báo cáo cuối ngày - ${dateStr}</h4>
                <table style="width:100%;text-align:left;border-collapse:collapse">
                    <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Tổng số hóa đơn</td><td style="padding:10px;font-weight:600;text-align:right">${totalOrders}</td></tr>
                    <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Tổng doanh thu</td><td style="padding:10px;font-weight:600;text-align:right;color:#0090DA">0</td></tr>
                    <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Tiền mặt</td><td style="padding:10px;text-align:right">0</td></tr>
                    <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Chuyển khoản</td><td style="padding:10px;text-align:right">0</td></tr>
                    <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Thẻ</td><td style="padding:10px;text-align:right">0</td></tr>
                    <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Giảm giá</td><td style="padding:10px;text-align:right">0</td></tr>
                    <tr><td style="padding:10px;color:#666;font-weight:600">Tiền mặt trong két</td><td style="padding:10px;font-weight:600;text-align:right;color:#27ae60">0</td></tr>
                </table>
            </div>
        </div>`;
    openModal('Báo cáo cuối ngày', content, '600px');
}

function switchReportTab(btn, tab) {
    document.querySelectorAll('.report-tab').forEach(b => { b.style.background = '#fff'; b.style.color = '#666'; b.style.borderColor = '#ddd'; });
    btn.style.background = '#E8F4FD'; btn.style.color = '#0090DA'; btn.style.borderColor = '#0090DA';
    const content = document.getElementById('reportContent');
    if (tab === 'products') {
        content.innerHTML = '<div style="text-align:center;padding:40px;color:#999"><i class="fas fa-box" style="font-size:40px;margin-bottom:12px"></i><p>Chưa có dữ liệu hàng hóa bán ra hôm nay</p></div>';
    } else if (tab === 'cashflow') {
        content.innerHTML = '<div style="text-align:center;padding:40px;color:#999"><i class="fas fa-wallet" style="font-size:40px;margin-bottom:12px"></i><p>Chưa có phiếu thu/chi hôm nay</p></div>';
    } else {
        openBaoCaoCuoiNgay();
    }
}

// ==================== 2. XỬ LÝ ĐẶT HÀNG ====================
function openXuLyDatHang() {
    document.getElementById('menuDropdown').style.display = 'none';
    const content = `
        <div style="display:flex;gap:12px;margin-bottom:16px">
            <input type="text" placeholder="Tìm mã đặt hàng, khách hàng..." style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px">
            <input type="date" style="padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px">
            <input type="date" style="padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px">
            <button style="padding:8px 16px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer"><i class="fas fa-search"></i></button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#F5F5F5;">
                <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Mã đặt hàng</th>
                <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Thời gian</th>
                <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Khách hàng</th>
                <th style="padding:10px;text-align:right;border-bottom:2px solid #E0E0E0">Tổng tiền</th>
                <th style="padding:10px;text-align:center;border-bottom:2px solid #E0E0E0">Trạng thái</th>
            </tr></thead>
            <tbody>
                <tr><td colspan="5" style="padding:40px;text-align:center;color:#999"><i class="fas fa-inbox" style="font-size:40px;margin-bottom:12px;display:block"></i>Chưa có đơn đặt hàng nào</td></tr>
            </tbody>
        </table>`;
    openModal('Xử lý đặt hàng', content, '800px');
}

// ==================== 3. CHỌN HÓA ĐƠN TRẢ HÀNG ====================
function openTraHang() {
    document.getElementById('menuDropdown').style.display = 'none';

    // Load invoices from localStorage (shared with hoadon.html) or use defaults
    const _defaultHD = [
        { docId: 'HD013674', time: '14/03/2026 00:07', cxName: 'Khách lẻ', finalTotal: 168000, status: 'Hoàn thành' },
        { docId: 'HD013673', time: '14/03/2026 00:05', cxName: 'Nguyễn Văn A', finalTotal: 330000, status: 'Hoàn thành' },
        { docId: 'HD013672', time: '13/03/2026 15:30', cxName: 'Lê C', finalTotal: 1500000, status: 'Đã hủy' }
    ];
    let _hdList = _defaultHD;
    try {
        const saved = localStorage.getItem('hoadon_data');
        if (saved) _hdList = JSON.parse(saved);
    } catch (e) { }

    function renderTraHangRows(list, q) {
        const fmtV = n => Number(n).toLocaleString('vi-VN');
        const filtered = q ? list.filter(h =>
            (h.docId || '').toLowerCase().includes(q) ||
            (h.cxName || '').toLowerCase().includes(q) ||
            (h.cxCode || '').toLowerCase().includes(q)
        ) : list;
        if (!filtered.length) {
            return `<tr><td colspan="5" style="padding:40px;text-align:center;color:#999"><i class="fas fa-file-invoice" style="font-size:40px;margin-bottom:12px;display:block"></i>Không tìm thấy hóa đơn</td></tr>`;
        }
        return filtered.map(h => `
            <tr style="border-bottom:1px solid #F5F5F5;font-size:13px">
                <td style="padding:10px;color:#0090DA;font-weight:500">${h.docId || ''}</td>
                <td style="padding:10px">${h.time || ''}</td>
                <td style="padding:10px">${h.cxName || 'Khách lẻ'}</td>
                <td style="padding:10px;text-align:right;font-weight:600">${fmtV(h.finalTotal || 0)}</td>
                <td style="padding:10px;text-align:center">
                    ${h.status === 'Hoàn thành'
                ? `<button onclick="selectReturnInvoice('${h.docId}')" style="padding:5px 14px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">Chọn</button>`
                : `<span style="color:#aaa;font-size:12px">${h.status || ''}</span>`
            }
                </td>
            </tr>
        `).join('');
    }

    const content = `
        <div style="display:flex;gap:12px;margin-bottom:16px">
            <input type="text" id="traHangSearch" placeholder="Tìm mã hóa đơn, tên khách hàng..."
                style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px;outline:none"
                oninput="(function(el){
                    var q=el.value.toLowerCase().trim();
                    var tb=document.getElementById('traHangTbody');
                    if(tb) tb.innerHTML=window._renderTraHangRows(window._hdListTH, q);
                })(this)">
            <button onclick="(function(){
                    var el=document.getElementById('traHangSearch');
                    var q=el?el.value.toLowerCase().trim():'';
                    var tb=document.getElementById('traHangTbody');
                    if(tb) tb.innerHTML=window._renderTraHangRows(window._hdListTH, q);
                })()"
                style="padding:8px 16px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer">
                <i class="fas fa-search"></i> Tìm
            </button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#F5F5F5;">
                <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Mã hóa đơn</th>
                <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Thời gian</th>
                <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Khách hàng</th>
                <th style="padding:10px;text-align:right;border-bottom:2px solid #E0E0E0">Tổng tiền</th>
                <th style="padding:10px;text-align:center;border-bottom:2px solid #E0E0E0">Thao tác</th>
            </tr></thead>
            <tbody id="traHangTbody">${renderTraHangRows(_hdList, '')}</tbody>
        </table>`;

    // Expose to window for oninput access
    window._hdListTH = _hdList;
    window._renderTraHangRows = renderTraHangRows;

    openModal('Chọn hóa đơn trả hàng', content, '800px');
}

function selectReturnInvoice(docId) {
    closeModal();
    showToast('Đang tạo phiếu trả hàng cho ' + docId, 'info');
}


// ==================== 4. LẬP PHIẾU THU ====================
function openLapPhieuThu() {
    document.getElementById('menuDropdown').style.display = 'none';
    const now = new Date();
    const code = 'PT' + now.getFullYear().toString().slice(-2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '001';
    const content = `
        <form onsubmit="event.preventDefault();showToast('Đã lưu phiếu thu ${code}','success');closeModal()">
            <div style="display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center;font-size:13px">
                <label style="color:#666">Mã phiếu:</label>
                <input type="text" value="${code}" readonly style="padding:8px 12px;border:1px solid #ddd;border-radius:4px;background:#F5F5F5;color:#999">
                
                <label style="color:#666">Loại thu:</label>
                <select style="padding:8px 12px;border:1px solid #ddd;border-radius:4px">
                    <option>Thu tiền khách</option><option>Thu khác</option><option>Thu nợ</option>
                </select>
                
                <label style="color:#666">Người nộp:</label>
                <input type="text" placeholder="Tên người nộp tiền" style="padding:8px 12px;border:1px solid #ddd;border-radius:4px">
                
                <label style="color:#666">Giá trị:</label>
                <input type="number" placeholder="0" style="padding:8px 12px;border:1px solid #ddd;border-radius:4px">
                
                <label style="color:#666">Phương thức:</label>
                <div style="display:flex;gap:8px">
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="pttt" checked> Tiền mặt</label>
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="pttt"> Chuyển khoản</label>
                </div>
                
                <label style="color:#666">Ghi chú:</label>
                <textarea rows="3" placeholder="Ghi chú..." style="padding:8px 12px;border:1px solid #ddd;border-radius:4px;resize:vertical"></textarea>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px">
                <button type="button" onclick="closeModal()" style="padding:8px 24px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer">Bỏ qua</button>
                <button type="submit" style="padding:8px 24px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer">Lưu phiếu thu</button>
            </div>
        </form>`;
    openModal('Lập phiếu thu', content, '500px');
}

// ==================== 5. IMPORT FILE ====================
function openImportFile() {
    document.getElementById('menuDropdown').style.display = 'none';
    const content = `
        <div style="text-align:center;padding:20px">
            <div style="border:2px dashed #ddd;border-radius:8px;padding:40px;margin-bottom:16px">
                <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:#0090DA;margin-bottom:16px"></i>
                <p style="color:#666;margin:8px 0">Kéo thả file Excel vào đây hoặc</p>
                <input type="file" id="importFileInput" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleImportFile(this)">
                <button onclick="document.getElementById('importFileInput').click()" style="padding:10px 24px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px"><i class="fas fa-folder-open"></i> Chọn file</button>
            </div>
            <div style="text-align:left;background:#F8F9FA;padding:16px;border-radius:8px;font-size:13px">
                <p style="margin:0 0 8px;font-weight:600;color:#333">Hướng dẫn:</p>
                <ul style="margin:0;padding-left:20px;color:#666">
                    <li>Hỗ trợ file Excel (.xlsx, .xls) hoặc CSV</li>
                    <li>Tải file mẫu: <a href="#" onclick="showToast('Đã tải file mẫu','success');return false" style="color:#0090DA">Tải file mẫu hàng hóa</a></li>
                    <li>Kích thước tối đa: 10MB</li>
                </ul>
            </div>
        </div>`;
    openModal('Import file', content, '500px');
}

function handleImportFile(input) {
    if (input.files.length === 0) return;
    const file = input.files[0];
    const modalContent = document.querySelector('#kvModal div[style*="padding:20px"]');
    if (modalContent) {
        modalContent.innerHTML = '<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin" style="font-size:40px;color:#0090DA;margin-bottom:16px"></i><p style="color:#666">Đang xử lý file: ' + file.name + '...</p></div>';
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (jsonData.length === 0) {
                showToast('File không có dữ liệu!', 'error');
                closeModal();
                return;
            }

            // Auto-detect column mapping from headers
            const headers = Object.keys(jsonData[0]);
            const colMap = {
                code: headers.find(h => /mã\s*(hàng|sp|hh)|code|ma_hang/i.test(h)) || headers.find(h => /mã/i.test(h)) || '',
                barcode: headers.find(h => /barcode|mã\s*vạch/i.test(h)) || '',
                name: headers.find(h => /tên\s*(hàng|sp|hh)|name|ten_hang/i.test(h)) || headers.find(h => /tên/i.test(h)) || '',
                price: headers.find(h => /giá\s*(bán|sp)|price|gia_ban/i.test(h)) || headers.find(h => /giá/i.test(h)) || '',
                stock: headers.find(h => /tồn\s*(kho)?|stock|ton_kho/i.test(h)) || headers.find(h => /tồn/i.test(h)) || '',
                unit: headers.find(h => /đvt|đơn\s*vị|unit|dvt/i.test(h)) || '',
                img: headers.find(h => /ảnh|hình|image|img|link\s*ảnh/i.test(h)) || ''
            };

            let imported = 0, skipped = 0, updated = 0;

            jsonData.forEach(row => {
                const name = String(row[colMap.name] || '').trim();
                if (!name) { skipped++; return; }

                const newProduct = {
                    code: String(row[colMap.code] || '').trim(),
                    barcode: String(row[colMap.barcode] || '').trim(),
                    name: name,
                    price: parseInt(String(row[colMap.price] || '0').replace(/[^\d]/g, '')) || 0,
                    stock: parseInt(row[colMap.stock]) || 0,
                    unit: String(row[colMap.unit] || 'Cái').trim(),
                    img: String(row[colMap.img] || '').trim()
                };

                // Check if product already exists (by code or barcode)
                const existingIdx = products.findIndex(p =>
                    (newProduct.code && p.code === newProduct.code) ||
                    (newProduct.barcode && p.barcode === newProduct.barcode)
                );

                if (existingIdx >= 0) {
                    // Update existing product
                    products[existingIdx] = { ...products[existingIdx], ...newProduct };
                    updated++;
                } else {
                    products.push(newProduct);
                    imported++;
                }
            });

            // Refresh product grid
            if (typeof renderProductGrid === 'function') renderProductGrid();
            if (typeof initProductGrid === 'function') initProductGrid();

            // Show results
            if (modalContent) {
                modalContent.innerHTML = `
                    <div style="text-align:center;padding:20px">
                        <i class="fas fa-check-circle" style="font-size:48px;color:#27ae60;margin-bottom:16px"></i>
                        <h4 style="margin:8px 0;color:#333">Import thành công!</h4>
                        <div style="background:#F8F9FA;padding:16px;border-radius:8px;margin:16px 0;text-align:left;font-size:13px">
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><span>File:</span><strong>${file.name}</strong></div>
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><span>Tổng dòng đọc được:</span><strong>${jsonData.length}</strong></div>
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><span style="color:#27ae60">Thêm mới:</span><strong style="color:#27ae60">${imported}</strong></div>
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><span style="color:#0090DA">Cập nhật:</span><strong style="color:#0090DA">${updated}</strong></div>
                            <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:#999">Bỏ qua (thiếu tên):</span><strong style="color:#999">${skipped}</strong></div>
                        </div>
                        <p style="color:#666;font-size:12px">Tổng sản phẩm hiện tại: <strong>${products.length}</strong></p>
                        <button onclick="closeModal()" style="padding:10px 32px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;margin-top:8px">Đóng</button>
                    </div>`;
            }

            showToast('Import thành công! Thêm ' + imported + ', cập nhật ' + updated + ' sản phẩm', 'success');
        } catch (err) {
            showToast('Lỗi đọc file: ' + err.message, 'error');
            closeModal();
        }
    };
    reader.readAsArrayBuffer(file);
}

// ==================== 6. TÙY CHỌN HIỂN THỊ ====================
function openTuyChonHienThi() {
    document.getElementById('menuDropdown').style.display = 'none';
    openColumnSettings();
}

// ==================== 7. PHÍM TẮT ====================
function openPhimTat() {
    document.getElementById('menuDropdown').style.display = 'none';
    const shortcuts = [
        ['F2', 'Tạo hóa đơn mới'],
        ['F3', 'Tìm hàng hóa'],
        ['F4', 'Tìm khách hàng'],
        ['F9', 'Thanh toán / Đặt hàng'],
        ['Esc', 'Đóng popup / Hủy'],
        ['Ctrl + F', 'Tìm kiếm nhanh'],
        ['Ctrl + D', 'Xóa dòng đang chọn'],
        ['↑ ↓', 'Di chuyển trong danh sách'],
        ['Enter', 'Chọn / Xác nhận'],
        ['Tab', 'Chuyển giữa các ô nhập liệu']
    ];
    const rows = shortcuts.map(([key, desc]) =>
        `<tr style="border-bottom:1px solid #F5F5F5">
            <td style="padding:10px 16px"><kbd style="background:#F5F5F5;border:1px solid #ddd;border-radius:4px;padding:4px 10px;font-family:monospace;font-size:13px;color:#333">${key}</kbd></td>
            <td style="padding:10px 16px;color:#555;font-size:13px">${desc}</td>
        </tr>`
    ).join('');

    const content = `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#F8F9FA"><th style="padding:10px 16px;text-align:left;font-size:12px;color:#999;text-transform:uppercase">Phím tắt</th><th style="padding:10px 16px;text-align:left;font-size:12px;color:#999;text-transform:uppercase">Chức năng</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
    openModal('Phím tắt', content, '460px');
}

// ==================== R17: ĐẶT HÀNG (ORDER BOOKING) ====================
let bookedOrders = JSON.parse(localStorage.getItem('_hasu_booked_orders') || '[]');

function openDatHang() {
    document.getElementById('menuDropdown').style.display = 'none';
    const tab = getActiveTab();
    const customerName = tab && tab.customer ? tab.customer.name : 'Khách lẻ';
    const cartHtml = tab && tab.cart.length > 0
        ? tab.cart.map((item, i) => `
            <tr style="border-bottom:1px solid #F0F0F0">
                <td style="padding:6px 8px;font-size:12px">${i + 1}</td>
                <td style="padding:6px 8px;font-size:12px">${item.name}</td>
                <td style="padding:6px 8px;text-align:center;font-size:12px">${item.qty}</td>
                <td style="padding:6px 8px;text-align:right;font-size:12px">${item.price.toLocaleString()}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="4" style="padding:20px;text-align:center;color:#999;font-size:12px">Chưa có sản phẩm. Thêm SP vào giỏ trước khi đặt hàng.</td></tr>';

    const content = `
        <div style="font-size:13px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Khách hàng</label>
                    <input id="bookCust" type="text" value="${customerName}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                </div>
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">SĐT</label>
                    <input id="bookPhone" type="text" value="${tab?.customer?.phone || ''}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px" placeholder="Số điện thoại">
                </div>
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Ngày giao dự kiến</label>
                    <input id="bookDate" type="date" value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                </div>
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Ghi chú</label>
                    <input id="bookNote" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px" placeholder="Ghi chú đơn hàng">
                </div>
            </div>
            <h4 style="margin:0 0 8px;font-size:13px;color:#333">Sản phẩm đặt hàng</h4>
            <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:6px">
                <thead><tr style="background:#F8F9FA">
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">STT</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">Tên hàng</th>
                    <th style="padding:8px;text-align:center;font-size:11px;color:#999">SL</th>
                    <th style="padding:8px;text-align:right;font-size:11px;color:#999">Đơn giá</th>
                </tr></thead>
                <tbody>${cartHtml}</tbody>
            </table>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;border-top:1px solid #eee;padding-top:12px">
                <button onclick="closeModal()" style="padding:8px 24px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer">Hủy</button>
                <button onclick="saveDatHang()" style="padding:8px 24px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">Lưu đơn đặt hàng</button>
            </div>
        </div>`;
    openModal('Tạo đơn đặt hàng', content, '600px');
}

function saveDatHang() {
    const tab = getActiveTab();
    if (!tab || tab.cart.length === 0) {
        showToast('Chưa có sản phẩm trong giỏ hàng', 'error');
        return;
    }
    const order = {
        id: 'DH' + Date.now().toString().slice(-8),
        customer: document.getElementById('bookCust')?.value || 'Khách lẻ',
        phone: document.getElementById('bookPhone')?.value || '',
        date: document.getElementById('bookDate')?.value || '',
        note: document.getElementById('bookNote')?.value || '',
        items: tab.cart.map(c => ({ ...c })),
        total: Math.round(tab.cart.reduce((s, c) => s + getCartItemLineTotal(c), 0)),
        status: 'Chờ xử lý',
        createdAt: new Date().toISOString()
    };
    bookedOrders.unshift(order);
    localStorage.setItem('_hasu_booked_orders', JSON.stringify(bookedOrders));
    closeModal();
    showToast(`Đã tạo đơn đặt hàng ${order.id}`, 'success');
}

// ==================== R18: QUẢN LÝ ĐƠN ĐẶT HÀNG ====================
function openQuanLyDatHang() {
    document.getElementById('menuDropdown').style.display = 'none';
    const fmt = n => Number(n).toLocaleString();
    const statusColors = { 'Chờ xử lý': '#f39c12', 'Đang giao': '#3498db', 'Hoàn thành': '#27ae60', 'Đã hủy': '#e74c3c' };
    const rows = bookedOrders.length > 0
        ? bookedOrders.map((o, i) => `
            <tr style="border-bottom:1px solid #F0F0F0">
                <td style="padding:8px;font-size:12px;color:#0090DA;font-weight:600">${o.id}</td>
                <td style="padding:8px;font-size:12px">${o.customer}</td>
                <td style="padding:8px;font-size:12px">${o.phone || '-'}</td>
                <td style="padding:8px;font-size:12px">${o.date || '-'}</td>
                <td style="padding:8px;text-align:right;font-size:12px;font-weight:600">${fmt(o.total)}</td>
                <td style="padding:8px"><span style="padding:3px 8px;border-radius:10px;font-size:10px;font-weight:600;color:#fff;background:${statusColors[o.status] || '#999'}">${o.status}</span></td>
                <td style="padding:8px">
                    <button onclick="updateBookedStatus(${i},'Đang giao')" style="font-size:10px;padding:3px 6px;cursor:pointer;border:1px solid #3498db;background:#EBF5FB;color:#3498db;border-radius:3px;margin-right:2px" title="Đang giao">📦</button>
                    <button onclick="updateBookedStatus(${i},'Hoàn thành')" style="font-size:10px;padding:3px 6px;cursor:pointer;border:1px solid #27ae60;background:#E8F8F5;color:#27ae60;border-radius:3px;margin-right:2px" title="Hoàn thành">✓</button>
                    <button onclick="updateBookedStatus(${i},'Đã hủy')" style="font-size:10px;padding:3px 6px;cursor:pointer;border:1px solid #e74c3c;background:#FDEDEC;color:#e74c3c;border-radius:3px" title="Hủy">✗</button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="7" style="padding:30px;text-align:center;color:#999;font-size:13px">Chưa có đơn đặt hàng nào</td></tr>';

    const content = `
        <div style="font-size:13px">
            <div style="display:flex;gap:8px;margin-bottom:12px">
                <button onclick="openDatHang()" style="padding:6px 16px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px"><i class="fas fa-plus" style="margin-right:4px"></i>Tạo đơn mới</button>
            </div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:6px">
                <thead><tr style="background:#F8F9FA">
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">Mã đơn</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">Khách hàng</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">SĐT</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">Ngày giao</th>
                    <th style="padding:8px;text-align:right;font-size:11px;color:#999">Tổng tiền</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">Trạng thái</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#999">Thao tác</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    openModal('Quản lý đơn đặt hàng', content, '800px');
}

function updateBookedStatus(idx, status) {
    if (bookedOrders[idx]) {
        bookedOrders[idx].status = status;
        localStorage.setItem('_hasu_booked_orders', JSON.stringify(bookedOrders));
        showToast(`Đã cập nhật: ${bookedOrders[idx].id} → ${status}`, 'success');
        openQuanLyDatHang(); // refresh
    }
}

// ==================== COLUMN VISIBILITY SETTINGS (Row 28) ====================
const _defaultColVis = { hinhanh: true, stt: true, tenHang: true, dvt: true, sl: true, giaVon: false, giaBan: true, thanhTien: true, giamGia: true };

function getColVis() {
    try {
        const saved = localStorage.getItem('hasu_col_vis');
        return saved ? { ..._defaultColVis, ...JSON.parse(saved) } : { ..._defaultColVis };
    } catch { return { ..._defaultColVis }; }
}

function openColumnSettings() {
    const vis = getColVis();
    const fields = [
        { key: 'stt', label: 'STT' },
        { key: 'hinhanh', label: 'Hình ảnh' },
        { key: 'tenHang', label: 'Tên hàng' },
        { key: 'dvt', label: 'Đơn vị tính' },
        { key: 'sl', label: 'Số lượng' },
        { key: 'giaVon', label: 'Giá vốn' },
        { key: 'giaBan', label: 'Giá bán' },
        { key: 'thanhTien', label: 'Thành tiền' },
        { key: 'giamGia', label: 'Giảm giá' }
    ];

    const content = `
        <div style="font-size:13px">
            <h4 style="margin:0 0 14px;color:#333;font-size:14px"><i class="fas fa-columns" style="margin-right:6px;color:#4661D0"></i>Tùy chọn hiển thị</h4>
            <div style="margin-bottom:10px;font-weight:600;color:#555">Cột hiển thị trên bảng hàng hóa</div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px" id="colVisChecks">
                ${fields.map(f => `
                    <label style="display:flex;gap:8px;align-items:center;cursor:pointer">
                        <input type="checkbox" data-col="${f.key}" ${vis[f.key] ? 'checked' : ''}> ${f.label}
                    </label>
                `).join('')}
            </div>
            <div style="margin-bottom:10px;font-weight:600;color:#555">Cách hiển thị</div>
            <label style="display:flex;gap:8px;align-items:center;cursor:pointer;margin-bottom:6px">
                <input type="checkbox" id="colVisAutoIn" checked> Hiển thị ảnh sản phẩm trên POS
            </label>
            <div style="display:flex;justify-content:flex-end;gap:12px;border-top:1px solid #eee;padding-top:12px;margin-top:12px">
                <button onclick="closeModal()" style="padding:8px 24px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer">Đóng</button>
                <button onclick="saveColumnSettings()" style="padding:8px 24px;background:#4661D0;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">Lưu thiết lập</button>
            </div>
        </div>`;
    openModal('Tùy chọn hiển thị', content, '420px');
}

function saveColumnSettings() {
    const vis = {};
    document.querySelectorAll('#colVisChecks input[type=checkbox]').forEach(cb => {
        vis[cb.dataset.col] = cb.checked;
    });
    localStorage.setItem('hasu_col_vis', JSON.stringify(vis));
    closeModal();
    renderCart();
    showToast('Đã lưu thiết lập hiển thị', 'success');
}

// ==================== LOCALSTORAGE PERSISTENCE (Row 26) ====================

function initLocalDB() {
    // Sync products to localStorage on first load
    if (!localStorage.getItem('hasu_products_init')) {
        localStorage.setItem('hasu_products', JSON.stringify(products.map(p => ({
            code: p.code, barcode: p.barcode, name: p.name, price: p.price,
            cost: p.cost || 0, stock: p.stock, unit: p.unit, img: p.img,
            group: p.group || '', brand: p.brand || '', supplier: p.supplier || '',
            note: p.note || '', unitConversions: p.unitConversions || []
        }))));
        localStorage.setItem('hasu_products_init', '1');
    }
    // Load saved data into products array
    try {
        const saved = JSON.parse(localStorage.getItem('hasu_products') || '[]');
        saved.forEach(sp => {
            const p = products.find(x => x.code === sp.code);
            if (p) {
                if (sp.stock !== undefined) p.stock = sp.stock;
                if (sp.cost !== undefined) p.cost = sp.cost;
                if (sp.group) p.group = sp.group;
                if (sp.brand) p.brand = sp.brand;
                if (sp.supplier) p.supplier = sp.supplier;
                if (sp.note) p.note = sp.note;
                if (sp.unitConversions) p.unitConversions = sp.unitConversions;
                if (sp.price !== undefined) p.price = sp.price;
                if (sp.name) p.name = sp.name;
                if (sp.barcode) p.barcode = sp.barcode;
            }
        });
        // Add any new products that were created in management page
        saved.forEach(sp => {
            if (!products.find(x => x.code === sp.code)) {
                products.unshift(sp);
            }
        });
    } catch { }

    // Merge saved customers into global customers array (don't overwrite defaults)
    try {
        const savedCust = JSON.parse(localStorage.getItem('hasu_customers') || '[]');
        savedCust.forEach(sc => {
            if (!customers.find(c => c.id === sc.id)) {
                customers.push(sc);
            }
        });
    } catch { }
}

function saveLocalDB() {
    localStorage.setItem('hasu_products', JSON.stringify(products.map(p => ({
        code: p.code, barcode: p.barcode, name: p.name, price: p.price,
        cost: p.cost || 0, stock: p.stock, unit: p.unit, img: p.img,
        group: p.group || '', brand: p.brand || '', supplier: p.supplier || '',
        note: p.note || '', unitConversions: p.unitConversions || []
    }))));
}

function deductStock(cart) {
    cart.forEach(item => {
        const p = products.find(x => x.code === item.code);
        if (p) {
            const factor = item.units ? (item.units.find(u => u.name === item.selectedUnit)?.factor || 1) : 1;
            p.stock = Math.max(0, (p.stock || 0) - (item.qty * factor));
        }
    });
    saveLocalDB();
    // Refresh product grid to show updated stock
    if (typeof renderProductGrid === 'function') renderProductGrid();
}

// Initialize localStorage on load
if (typeof products !== 'undefined') { initLocalDB(); }

// ==================== R19: THIẾT LẬP IN ====================
function openThietLapIn() {
    document.getElementById('menuDropdown').style.display = 'none';
    const content = `
        <div style="font-size:13px">
            <h4 style="margin:0 0 12px;color:#333;font-size:14px"><i class="fas fa-print" style="margin-right:6px;color:#0090DA"></i>Cấu hình in hóa đơn</h4>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Khổ giấy</label>
                    <select id="printPaperSize" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                        <option value="K80" ${receiptSize === 'K80' ? 'selected' : ''}>K80 (80mm)</option>
                        <option value="K57" ${receiptSize === 'K57' ? 'selected' : ''}>K57 (57mm)</option>
                        <option value="A4">A4</option>
                        <option value="A5">A5</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Máy in</label>
                    <select style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                        <option>Mặc định (trình duyệt)</option>
                        <option>ESC/POS USB</option>
                    </select>
                </div>
            </div>

            <h4 style="margin:0 0 12px;color:#333;font-size:14px;border-top:1px solid #eee;padding-top:16px">Thông tin hóa đơn</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Tên cửa hàng</label>
                    <input id="printStoreName" type="text" value="${STORE_INFO.name}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                </div>
                <div>
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Số điện thoại</label>
                    <input id="printStorePhone" type="text" value="${STORE_INFO.phone}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                </div>
                <div style="grid-column:1/-1">
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Địa chỉ</label>
                    <input id="printStoreAddr" type="text" value="${STORE_INFO.address}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                </div>
                <div style="grid-column:1/-1">
                    <label style="font-size:11px;color:#999;display:block;margin-bottom:4px">Chân trang</label>
                    <input id="printStoreFooter" type="text" value="${STORE_INFO.footer}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:13px">
                </div>
            </div>

            <h4 style="margin:0 0 12px;color:#333;font-size:14px;border-top:1px solid #eee;padding-top:16px">Tùy chọn</h4>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
                <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="printAutoCheck" checked> Tự động in sau thanh toán</label>
                <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="printLogoCheck" checked> Hiện logo trên hóa đơn</label>
                <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="printQRCheck"> In mã QR thanh toán</label>
                <label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="printBarcodeCheck" checked> In mã vạch đơn hàng</label>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:12px;border-top:1px solid #eee;padding-top:12px">
                <button onclick="closeModal()" style="padding:8px 24px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer">Hủy</button>
                <button onclick="saveThietLapIn()" style="padding:8px 24px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">Lưu cấu hình</button>
            </div>
        </div>`;
    openModal('Thiết lập in', content, '560px');
}

// ===== Print Settings Dropdown (KiotViet-style) =====
let _printSettings = { autoIn: true, gopHang: true, soBanIn: 2, mauIn: 'A' };

function togglePrintSettings(e) {
    e.stopPropagation();
    let panel = document.getElementById('printSettingsPanel');
    if (panel) {
        panel.classList.toggle('open');
        return;
    }
    // Create panel
    const btn = document.getElementById('btnPrintSettings');
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    btn.parentNode.insertBefore(wrapper, btn);
    wrapper.appendChild(btn);

    panel = document.createElement('div');
    panel.id = 'printSettingsPanel';
    panel.className = 'print-settings-panel open';
    panel.innerHTML = `
        <div class="ps-row">
            <span class="ps-label">Tự động in hóa đơn</span>
            <label class="ps-toggle"><input type="checkbox" id="psAutoIn" ${_printSettings.autoIn ? 'checked' : ''} onchange="_printSettings.autoIn=this.checked"><span class="ps-slider"></span></label>
        </div>
        <div class="ps-row">
            <span class="ps-label">Gộp hàng cùng loại</span>
            <label class="ps-toggle"><input type="checkbox" id="psGopHang" ${_printSettings.gopHang ? 'checked' : ''} onchange="_printSettings.gopHang=this.checked"><span class="ps-slider"></span></label>
        </div>
        <div class="ps-row">
            <span class="ps-label">Số bản in (Liên)</span>
            <input class="ps-input" type="number" min="1" max="5" value="${_printSettings.soBanIn}" onchange="_printSettings.soBanIn=parseInt(this.value)||1">
        </div>
        <div class="ps-row">
            <span class="ps-label">Chọn mẫu in</span>
        </div>
        <div style="padding:4px 0">
            <span class="ps-select" id="psMauIn">A. Mẫu in hóa đơn</span>
        </div>
        <div class="ps-actions">
            <button class="ps-btn-skip" onclick="document.getElementById('printSettingsPanel').classList.remove('open')">Bỏ qua</button>
            <button class="ps-btn-done" onclick="savePrintSettings()">Xong</button>
        </div>
    `;
    panel.addEventListener('click', ev => ev.stopPropagation());
    wrapper.appendChild(panel);

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function _cp() {
            panel.classList.remove('open');
            document.removeEventListener('click', _cp);
        }, { once: true });
    }, 50);
}

function savePrintSettings() {
    const panel = document.getElementById('printSettingsPanel');
    if (panel) panel.classList.remove('open');
    showToast('Đã lưu cài đặt in', 'success');
}

// ===== Xử lý đặt hàng Modal =====
function openXuLyDatHang() {
    // Remove existing
    const old = document.getElementById('xldhOverlay');
    if (old) old.remove();

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;

    const overlay = document.createElement('div');
    overlay.id = 'xldhOverlay';
    overlay.className = 'xldh-overlay';
    overlay.innerHTML = `
        <div class="xldh-modal">
            <div class="xldh-header">
                <h3>Xử lý đặt hàng</h3>
                <button class="xldh-close" onclick="document.getElementById('xldhOverlay').remove()">&times;</button>
            </div>
            <div class="xldh-body">
                <div class="xldh-sidebar">
                    <div class="xldh-sidebar-title">Tìm kiếm</div>
                    <input type="text" placeholder="Theo mã đặt hàng">
                    <input type="text" placeholder="Theo khách hàng">
                    <input type="text" placeholder="Theo ghi chú đặt hàng">
                    <input type="text" placeholder="Theo mã hàng">
                    <input type="text" placeholder="Theo tên hàng">

                    <div class="xldh-time-title">Thời gian</div>
                    <div class="xldh-date-row">
                        <input type="date" class="xldh-date-input" value="${yyyy}-${mm}-${dd}">
                    </div>
                    <div class="xldh-date-row">
                        <input type="date" class="xldh-date-input" placeholder="Đến ngày">
                    </div>
                </div>
                <div class="xldh-main">
                    <div class="xldh-table-header">
                        <span>Mã đặt hàng</span>
                        <span>Thời gian</span>
                        <span>Khách hàng</span>
                        <span>Tổng cộng</span>
                        <span>Trạng thái</span>
                        <span>Ghi chú</span>
                    </div>
                    <div class="xldh-empty">
                        <i class="fas fa-inbox"></i>
                        <span>Không tìm thấy kết quả nào phù hợp</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
}

function saveThietLapIn() {
    const size = document.getElementById('printPaperSize')?.value;
    if (size) receiptSize = size;
    const name = document.getElementById('printStoreName')?.value;
    if (name) STORE_INFO.name = name;
    const phone = document.getElementById('printStorePhone')?.value;
    if (phone) STORE_INFO.phone = phone;
    const addr = document.getElementById('printStoreAddr')?.value;
    if (addr) STORE_INFO.address = addr;
    const footer = document.getElementById('printStoreFooter')?.value;
    if (footer !== undefined) STORE_INFO.footer = footer;
    localStorage.setItem('_hasu_print_settings', JSON.stringify({ receiptSize, storeInfo: STORE_INFO }));
    closeModal();
    showToast('Đã lưu cấu hình in', 'success');
}

// Load saved print settings
(function loadPrintSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem('_hasu_print_settings'));
        if (saved) {
            if (saved.receiptSize) receiptSize = saved.receiptSize;
            if (saved.storeInfo) Object.assign(STORE_INFO, saved.storeInfo);
        }
    } catch (e) { }
})();

// ==================== PRINT OPTIONS MODAL (R7/R8/R9) ====================
function showPrintOptions() {
    document.getElementById('printOptionsModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'printOptionsModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;width:360px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
            <div style="font-size:15px;font-weight:700;color:#1A1A2E;margin-bottom:18px;display:flex;align-items:center;gap:8px">
                <i class="fas fa-print" style="color:#0090DA"></i> Tùy chọn in
            </div>
            <div style="margin-bottom:14px">
                <div style="font-size:11px;color:#666;margin-bottom:6px;font-weight:600">LOẠI IN</div>
                <div style="display:flex;gap:6px">
                    <button id="popt_invoice" onclick="setPrintType('invoice')" style="flex:1;padding:8px 4px;border-radius:8px;border:2px solid #0090DA;background:#E8F4FD;color:#0090DA;font-size:11px;font-weight:600;cursor:pointer;text-align:center">
                        <i class="fas fa-receipt" style="display:block;font-size:16px;margin-bottom:3px"></i>Hóa đơn
                    </button>
                    <button id="popt_order" onclick="setPrintType('order')" style="flex:1;padding:8px 4px;border-radius:8px;border:2px solid #E0E0E0;background:#fff;color:#666;font-size:11px;cursor:pointer;text-align:center">
                        <i class="fas fa-file-alt" style="display:block;font-size:16px;margin-bottom:3px"></i>Đơn hàng
                    </button>
                    <button id="popt_label" onclick="setPrintType('label')" style="flex:1;padding:8px 4px;border-radius:8px;border:2px solid #E0E0E0;background:#fff;color:#666;font-size:11px;cursor:pointer;text-align:center">
                        <i class="fas fa-tag" style="display:block;font-size:16px;margin-bottom:3px"></i>Nhãn SP
                    </button>
                </div>
            </div>
            <div style="margin-bottom:18px;display:flex;align-items:center;gap:10px">
                <span style="font-size:12px;color:#666;font-weight:600">Số bản in</span>
                <button onclick="changeCopies(-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid #E0E0E0;background:#F5F5F5;font-size:18px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center">−</button>
                <span id="printCopiesVal" style="font-size:18px;font-weight:700;min-width:28px;text-align:center">1</span>
                <button onclick="changeCopies(1)" style="width:28px;height:28px;border-radius:50%;border:1px solid #E0E0E0;background:#F5F5F5;font-size:18px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center">+</button>
            </div>
            <div style="display:flex;gap:8px">
                <button onclick="skipPrint()" style="flex:1;padding:10px;border-radius:8px;border:1px solid #E0E0E0;background:#F5F5F5;color:#666;font-size:13px;cursor:pointer">Bỏ qua</button>
                <button onclick="doPrint()" style="flex:2;padding:10px;border-radius:8px;border:none;background:#0090DA;color:#fff;font-size:13px;font-weight:700;cursor:pointer">
                    <i class="fas fa-print"></i> In ngay
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    window._printType = 'invoice';
    window._printCopies = 1;
}
function setPrintType(type) {
    window._printType = type;
    ['invoice', 'order', 'label'].forEach(t => {
        const b = document.getElementById('popt_' + t);
        if (b) { b.style.borderColor = t === type ? '#0090DA' : '#E0E0E0'; b.style.background = t === type ? '#E8F4FD' : '#fff'; b.style.color = t === type ? '#0090DA' : '#666'; }
    });
}
function changeCopies(d) {
    window._printCopies = Math.max(1, Math.min(10, (window._printCopies || 1) + d));
    const el = document.getElementById('printCopiesVal');
    if (el) el.textContent = window._printCopies;
}
function doPrint() {
    const copies = window._printCopies || 1;
    document.getElementById('printOptionsModal')?.remove();
    if (typeof printInvoice === 'function') {
        for (let i = 0; i < copies; i++) setTimeout(() => printInvoice(), i * 900);
    } else {
        // No printInvoice available — just complete the order
        completeOrder();
    }
    // NOTE: Do NOT call completeOrder() here directly.
    // printInvoice() will show the bill preview and completeOrder() is called
    // when the user clicks the IN/Xong button inside the print preview.
}
function skipPrint() {
    document.getElementById('printOptionsModal')?.remove();
    completeOrder();
}

// ==================== NEW ORDER DROPDOWN (▼ button) ====================
function openNewOrderDropdown(btn) {
    // Remove existing
    const existing = document.getElementById('newOrderDropdown');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'newOrderDropdown';
    menu.style.cssText = [
        'position:absolute',
        'background:#fff',
        'border-radius:10px',
        'box-shadow:0 4px 20px rgba(0,0,0,0.18)',
        'min-width:200px',
        'z-index:9999',
        'overflow:hidden',
        'padding:6px 0',
        'animation:fadeInDown .18s ease'
    ].join(';');

    menu.innerHTML = `
        <div onclick="switchToGiaoHang()" style="
            display:flex;align-items:center;gap:10px;
            padding:12px 16px;cursor:pointer;font-size:14px;color:#1A1A2E;
            transition:background .15s"
            onmouseover="this.style.background='#F5F7FA'"
            onmouseout="this.style.background='transparent'">
            <i class="fas fa-shipping-fast" style="color:#0090DA;width:18px;text-align:center"></i>
            Thêm mới đặt hàng
        </div>`;

    // Position below the button
    document.body.appendChild(menu);
    const rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.left = Math.max(8, rect.right - menu.offsetWidth) + 'px';

    // Close on outside click
    setTimeout(() => {
        document.addEventListener('click', function _close(e) {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.remove();
                document.removeEventListener('click', _close);
            }
        });
    }, 10);
}

function switchToGiaoHang() {
    document.getElementById('newOrderDropdown')?.remove();
    const tab = document.querySelector('.mode-tab[data-mode="ban-giao-hang"]');
    if (tab) tab.click();
}
