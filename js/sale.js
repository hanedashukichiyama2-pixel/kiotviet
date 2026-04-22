// KiotViet Sale - Full Featured JS
// Vietnamese number format helper: 200000 → "200.000"
function fmtVN(n) { return Number(n).toLocaleString('vi-VN'); }
// All Vietnamese unit types for cart ĐVT dropdown
const ALL_UNITS = [
    { group: '📦 Đóng gói', items: ['Hộp', 'Lốc'] },
    { group: '🛍️ Bao bì', items: ['Gói', 'Túi', 'Thùng'] },
    { group: '🔩 Đơn lẻ', items: ['Cái', 'Chiếc', 'Sản phẩm'] },
    { group: '⚖️ Đo lường', items: ['Kg', 'Gram', 'Lít', 'Ml'] },
    { group: '📏 Kích thước', items: ['Mét', 'Cm', 'Cuộn'] },
    { group: '🧴 Khác', items: ['Chai', 'Lọ', 'Lon', 'Hũ'] }
];
function buildUnitOptions(selected, itemUnits) {
    // Always use product-specific units when available
    if (itemUnits && itemUnits.length > 0) {
        return itemUnits.map(u => {
            return `<option value="${u.name}" ${u.name === selected ? 'selected' : ''}>- ${u.name}</option>`;
        }).join('');
    }
    // Fallback for products without any units data
    return `<option value="${selected || 'Cái'}" selected>- ${selected || 'Cái'}</option>`;
}

function getGroupedProducts(list) {
    let groups = [];
    let nameMap = {};
    list.forEach((p, index) => {
        p._originalIndex = index; // Store original index for addToCart
        const nameKey = (p.name || '').trim().toLowerCase();
        if (!nameMap[nameKey]) {
            nameMap[nameKey] = { variants: [p] };
            groups.push(nameMap[nameKey]);
        } else {
            nameMap[nameKey].variants.push(p);
        }
    });
    groups.forEach(g => {
        g.variants.sort((a, b) => (a.price || 0) - (b.price || 0));
        g.base = g.variants[0];
    });
    return groups.map(g => g.base);
}
document.addEventListener('DOMContentLoaded', function () {
    // Inject user info into sale header if available
    const userName = localStorage.getItem('hasu_userName');
    if (userName) {
        document.querySelectorAll('.toolbar-username').forEach(el => el.textContent = userName);
        document.querySelectorAll('.user-badge, .delivery-user').forEach(el => {
            if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) {
                el.firstChild.nodeValue = userName + ' ';
            }
        });
    }

    injectFeatureCSS();
    initModeSwitch();
    // Load stock first, then initialise UI components
    loadStockFromServer().then(() => {
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
        setTimeout(checkAndLoadEditInvoice, 100);
        setTimeout(checkAndLoadReturnInvoice, 150);
    });
});

// ================== EDIT INVOICE (Redirected from Quản lý) ==================
function checkAndLoadEditInvoice() {
    const editId = localStorage.getItem('edit_invoice_id');
    if (!editId) return;

    try {
        const savedData = localStorage.getItem('hoadon_data');
        if (!savedData) return;
        const invoices = JSON.parse(savedData);
        const inv = invoices.find(i => i.id == editId);
        if (!inv) return;

        // Clear the cart
        const tab = getActiveTab();
        if (!tab) return;
        tab.cart = [];

        // Determine correct base properties
        inv.items.forEach(it => {
            const productMatch = products.find(p => p.code === it.sku || p.id === it.sku);
            if (productMatch) {
                // Add to cart directly
                tab.cart.push({
                    cartId: nextCartId++,
                    productId: productMatch.id,
                    code: productMatch.code,
                    name: productMatch.name,
                    unitName: productMatch.units[0].name,
                    units: productMatch.units,
                    price: it.price,
                    qty: it.qty,
                    stock: productMatch.stock
                });
            } else {
                // Product not found in catalog, add generically
                tab.cart.push({
                    cartId: nextCartId++,
                    productId: 'UNKNOWN',
                    code: it.sku,
                    name: it.name,
                    unitName: 'Cái',
                    units: [{ name: 'Cái', price: it.price, ratio: 1 }],
                    price: it.price,
                    qty: it.qty,
                    stock: 999
                });
            }
        });

        // Set customer
        if (inv.cxCode && inv.cxCode !== 'KH0001') {
            const custMatch = customers.find(c => c.id === inv.cxCode);
            if (custMatch) tab.customer = custMatch;
        }

        // Set discount
        if (inv.discount > 0) {
            discountMode = 'vnd';
            const discToggle = document.getElementById('discModeToggle');
            if (discToggle) {
                discToggle.textContent = 'VNĐ';
                discToggle.style.background = '#E8F4FD';
                discToggle.style.borderColor = '#0090DA';
                discToggle.style.color = '#0090DA';
            }
            const discInput = document.getElementById('discountInput');
            if (discInput) discInput.value = fmtVN(inv.discount);
        }

        // Save editing context
        tab.editingInvoiceDocId = inv.docId;
        tab.editingInvoiceId = inv.id;
        tab.editingOriginalTime = inv.time;
        // Sum previous payments
        const previousPaid = (inv.payments || []).reduce((sum, p) => sum + (p.total || 0), 0);
        tab.editingOriginalPaid = previousPaid;

        // Update UI
        renderCart();
        calculateTotals();
        renderTabs();

        showToast('Đang chỉnh sửa hóa đơn ' + inv.docId, 'success');
        localStorage.removeItem('edit_invoice_id');

    } catch (e) {
        console.error('Error loading edit invoice:', e);
    }
}

function checkAndLoadReturnInvoice() {
    const returnCode = localStorage.getItem('hasu_return_invoice_code');
    if (!returnCode) return;

    try {
        localStorage.removeItem('hasu_return_invoice_code');

        let hist = JSON.parse(localStorage.getItem('hasu_sale_history') || '[]');
        let order = hist.find(o => o.id === returnCode || o.docId === returnCode);

        if (!order) {
            let hdata = JSON.parse(localStorage.getItem('hoadon_data') || '[]');
            let inv = hdata.find(h => h.docId === returnCode || h.id == returnCode);
            if (inv) {
                // Map hoadon Format to POS Array Format!
                function parseViDate(dStr) {
                    if (!dStr) return new Date();
                    try {
                        const m = dStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
                        if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`);
                    } catch (e) { }
                    return new Date();
                }
                order = {
                    id: inv.docId || 'HD' + inv.id,
                    time: parseViDate(inv.time),
                    customer: inv.cxName ? { name: inv.cxName, id: inv.cxCode } : null,
                    payMethod: 'cash',
                    grandTotal: inv.finalTotal || inv.subtotal || 0,
                    cart: (inv.items || []).map(i => ({
                        code: i.sku,
                        name: i.name,
                        qty: i.qty,
                        price: i.price,
                        customPrice: i.finalPrice || i.price
                    }))
                };
            }
        }

        if (order) {
            if (!(order.time instanceof Date)) {
                if (typeof order.time === 'string' && order.time.includes('/')) {
                    const m = order.time.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
                    order.time = m ? new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`) : new Date();
                } else if (!order.time && order.date) {
                    const m = order.date.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
                    order.time = m ? new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`) : new Date();
                } else {
                    try { order.time = new Date(order.time || Date.now()); } catch (e) { order.time = new Date(); }
                }
            }

            setTimeout(() => {
                if (typeof showReturnDetail === 'function') showReturnDetail(order);
                else showToast('Chức năng trả hàng chưa sẵn sàng, vui lòng thử lại', 'warning');
            }, 300);
        } else {
            showToast('Không tìm thấy dữ liệu hóa đơn ' + returnCode, 'error');
        }
    } catch (e) {
        console.error('Return load error:', e);
    }
}

// ================== STOCK SYNC (Đồng bộ tồn kho thực tế) ==================
// Xác định URL của stock_sync.php (cùng thư mục gốc với sale.html)
const STOCK_SYNC_URL = (function () {
    const origin = window.location.origin;
    const path = window.location.pathname; // e.g. /sale.html or /hsm/sale.html
    const dir = path.substring(0, path.lastIndexOf('/') + 1);
    return origin + dir + 'stock_sync.php';
})();

/**
 * Lấy tồn kho mới nhất từ server (stock.json) và ghi đè vào mảng products[]
 * Gọi lúc trang load để tất cả tài khoản thấy cùng số tồn kho
 */
function loadStockFromServer() {
    return fetch(STOCK_SYNC_URL + '?t=' + Date.now(), {
        method: 'GET',
        cache: 'no-store'
    })
        .then(r => r.json())
        .then(data => {
            if (!data.ok || !data.stock) return;
            const serverStock = data.stock;
            let updated = 0;
            if (typeof products !== 'undefined' && Array.isArray(products)) {
                products.forEach(p => {
                    if (serverStock.hasOwnProperty(p.code)) {
                        p.stock = serverStock[p.code];
                        updated++;
                    }
                });
            }
            if (updated > 0) {
                if (typeof renderProductGrid === 'function') renderProductGrid();
                if (typeof renderThuongGrid === 'function') renderThuongGrid();
                console.log('[StockSync] Updated stock for', updated, 'items from server.');
            }
        })
        .catch(err => console.warn('[StockSync] Cannot load stock from server:', err));
}

/**
 * Trừ tồn kho sau mỗi đơn hàng thành công
 * Gửi danh sách sản phẩm đã bán lên server để cập nhật stock.json
 * @param {Array} cartItems - mảng item trong giỏ hàng
 */
function deductStock(cartItems) {
    if (!cartItems || cartItems.length === 0) return;
    const items = cartItems.map(c => ({
        code: c.code || (c.product && c.product.code) || '',
        qty: c.qty || c.quantity || 1,
        baseStock: c.stock !== undefined ? c.stock : (c.product && c.product.stock !== undefined ? c.product.stock : 0)
    })).filter(i => i.code && i.qty > 0);

    if (items.length === 0) return;

    // Ngay lập tức trừ trực tiếp trên mảng products[] (hiển thị tức thì)
    if (typeof products !== 'undefined' && Array.isArray(products)) {
        items.forEach(item => {
            const p = products.find(p => p.code === item.code);
            if (p) p.stock = Math.max(0, (p.stock || 0) - item.qty);
        });
    }

    // Gửi lên server để lưu vĩnh viễn
    fetch(STOCK_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
    })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                console.log('[StockSync] Đã cập nhật tồn kho server sau bán hàng:', items);
                // Đồng bộ lại với server để đảm bảo chính xác
                loadStockFromServer();
            }
        })
        .catch(err => {
            console.warn('[StockSync] Không thể ghi tồn kho lên server:', err);
        });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type) {
    const bg = type === 'success' ? '#27AE60' : type === 'error' ? '#E74C3C' : '#0090DA';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:60px;right:20px;background:' + bg + ';color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:99999;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);animation:toastSlideIn .3s ease;max-width:350px;';
    toast.innerHTML = '<i class="fas ' + icon + '"></i><span>' + message + '</span>';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 2500);
}

// Inject additional CSS for new features (without touching sale.css)
function injectFeatureCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        .cart-qty input[type=number]::-webkit-inner-spin-button, .cart-qty input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none;margin:0; }
        .cart-qty input[type=number] { -moz-appearance:textfield; }
        .pay-method-btn { padding:5px 10px;border:1.5px solid #E0E0E0;border-radius:6px;font-size:11px;cursor:pointer;background:#FFF;color:#666;display:inline-flex;align-items:center;gap:4px;transition:all .2s;white-space:nowrap;font-weight:500; }
        .pay-method-btn:hover { filter:brightness(0.95);transform:translateY(-1px); }
        .pay-method-btn.active { font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.08); }
        .pay-method-btn i { font-size:11px; }
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

        /* ===== KiotViet-style Thiết lập Panel ===== */
        .tl-overlay {
            position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:10000;
            display:flex; justify-content:flex-end;
            animation:tlFadeIn .2s ease;
        }
        @keyframes tlFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes tlSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .tl-panel {
            width:380px; max-width:90vw; height:100%; background:#fff;
            box-shadow:-4px 0 24px rgba(0,0,0,0.12);
            display:flex; flex-direction:column;
            animation:tlSlideIn .25s ease;
        }
        .tl-header {
            display:flex; align-items:center; justify-content:space-between;
            padding:16px 20px 12px; border-bottom:1px solid #E8E8E8;
        }
        .tl-header h3 { margin:0; font-size:16px; font-weight:700; color:#1A1A2E; }
        .tl-close {
            background:none; border:none; font-size:22px; cursor:pointer;
            color:#999; padding:0 4px; line-height:1;
        }
        .tl-close:hover { color:#333; }
        .tl-tabs {
            display:flex; border-bottom:2px solid #E8E8E8;
            padding:0 20px;
        }
        .tl-tab {
            padding:10px 16px; font-size:13px; font-weight:600;
            color:#999; cursor:pointer; border:none; background:none;
            border-bottom:2px solid transparent; margin-bottom:-2px;
            transition:all .2s;
        }
        .tl-tab.active { color:#1565C0; border-bottom-color:#1565C0; }
        .tl-tab:hover:not(.active) { color:#555; }
        .tl-body {
            flex:1; overflow-y:auto; padding:8px 0;
        }
        .tl-section { display:none; }
        .tl-section.active { display:block; }
        .tl-row {
            display:flex; align-items:center; justify-content:space-between;
            padding:12px 20px; border-bottom:1px solid #F5F5F5;
        }
        .tl-row:hover { background:#FAFAFA; }
        .tl-row-label {
            font-size:13px; color:#333; display:flex; align-items:center; gap:6px;
        }
        .tl-row-label .tl-info {
            display:inline-flex; align-items:center; justify-content:center;
            width:16px; height:16px; border-radius:50%; border:1px solid #CCC;
            font-size:10px; color:#999; cursor:help;
        }
        /* iOS-style toggle */
        .tl-toggle {
            position:relative; width:44px; height:24px; cursor:pointer; flex-shrink:0;
        }
        .tl-toggle input { opacity:0; width:0; height:0; position:absolute; }
        .tl-toggle .tl-slider {
            position:absolute; inset:0; background:#ccc; border-radius:12px; transition:.3s;
        }
        .tl-toggle .tl-slider:before {
            content:''; position:absolute; width:18px; height:18px; left:3px; bottom:3px;
            background:#fff; border-radius:50%; transition:.3s;
            box-shadow:0 1px 3px rgba(0,0,0,0.2);
        }
        .tl-toggle input:checked + .tl-slider { background:#4285F4; }
        .tl-toggle input:checked + .tl-slider:before { transform:translateX(20px); }
        /* VND / % selector for Giảm giá */
        .tl-disc-type {
            display:flex; gap:0; margin-right:10px;
        }
        .tl-disc-type button {
            padding:4px 10px; font-size:11px; font-weight:600; cursor:pointer;
            border:1px solid #DDD; background:#F5F5F5; color:#666;
            transition:all .15s;
        }
        .tl-disc-type button:first-child { border-radius:4px 0 0 4px; }
        .tl-disc-type button:last-child { border-radius:0 4px 4px 0; border-left:none; }
        .tl-disc-type button.active {
            background:#1565C0; border-color:#1565C0; color:#fff;
        }

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

        /* ===== SPLIT PAYMENT (Combined) ===== */
        .split-pay-panel {
            margin:8px 0 4px; padding:10px; background:#F8FAFF;
            border:1px solid #D0D9F0; border-radius:10px;
        }
        .split-pay-header {
            display:flex; align-items:center; justify-content:space-between;
            margin-bottom:8px; font-size:11px; font-weight:600; color:#333;
        }
        .split-pay-header .split-badge {
            background:#E3F2FD; color:#1565C0; padding:2px 8px;
            border-radius:10px; font-size:10px; font-weight:700;
        }
        .split-pay-row {
            display:flex; align-items:center; gap:8px; padding:6px 8px;
            border-radius:6px; margin-bottom:4px; background:#fff;
            border:1px solid #E8ECF4; transition:all .15s;
        }
        .split-pay-row:hover { border-color:#90CAF9; }
        .split-pay-row .spr-icon {
            width:28px; height:28px; border-radius:50%; display:flex;
            align-items:center; justify-content:center; font-size:12px; flex-shrink:0;
        }
        .split-pay-row .spr-name {
            font-size:12px; font-weight:500; color:#444; min-width:80px;
        }
        .split-pay-row .spr-input {
            flex:1; text-align:right; border:1px solid #DDD; border-radius:5px;
            padding:5px 8px; font-size:13px; font-weight:600; color:#333;
            font-family:inherit; outline:none; transition:border .15s;
        }
        .split-pay-row .spr-input:focus { border-color:#1976D2; }
        .split-pay-row .spr-auto-tag {
            font-size:9px; color:#FF8F00; font-weight:600; background:#FFF8E1;
            padding:1px 6px; border-radius:8px; white-space:nowrap;
        }
        .split-progress-wrap {
            margin-top:6px; padding:4px 0;
        }
        .split-progress-bar {
            height:6px; background:#E0E0E0; border-radius:3px; overflow:hidden;
        }
        .split-progress-fill {
            height:100%; border-radius:3px; transition:width .25s ease;
            background:linear-gradient(90deg,#42A5F5,#1565C0);
        }
        .split-progress-fill.exact { background:linear-gradient(90deg,#66BB6A,#2E7D32); }
        .split-progress-fill.over { background:linear-gradient(90deg,#EF5350,#C62828); }
        .split-remaining {
            display:flex; justify-content:space-between; margin-top:4px;
            font-size:11px; color:#888;
        }
        .split-remaining .sr-val { font-weight:700; }
        .split-remaining .sr-val.exact { color:#2E7D32; }
        .split-remaining .sr-val.over { color:#C62828; }
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
        // Load saved customers (appended by users and updated state)
        const sc = localStorage.getItem('hasu_customers');
        if (sc) {
            const saved = JSON.parse(sc);
            saved.forEach(s => {
                const existing = customers.find(c => c.id === s.id);
                if (existing) {
                    existing.debt = s.debt || 0;
                    existing.points = s.points || 0;
                    existing.name = s.name;
                    existing.phone = s.phone;
                    existing.address = s.address;
                } else {
                    customers.push(s);
                }
            });
        }
    } catch (e) { console.warn('localStorage load error', e); }
}
function saveCustomers() {
    // Persist ALL customers so debt and points updates are saved
    try { localStorage.setItem('hasu_customers', JSON.stringify(customers)); } catch (e) { }
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
    const activeTab = getActiveTab();
    const isEditing = activeTab && !!activeTab.editingInvoiceId;
    document.querySelectorAll('.btn-order, .btn-delivery-order').forEach(btn => {
        if (isEditing) {
            btn.textContent = 'CẬP NHẬT';
        } else {
            btn.textContent = isBanNhanh ? 'THANH TOÁN' : 'ĐẶT HÀNG';
        }
    });
}

// ==================== MULTI-TAB ====================
function initMultiTab() {
    // Tách riêng biệt Nút Thêm Hóa Đơn (+) và Nút Menu Đặt Hàng (▼)
    const addInvoiceBtn = document.getElementById('btnAddInvoice');
    if (addInvoiceBtn) {
        addInvoiceBtn.addEventListener('click', addNewTab);
    }

    const addOrderDropdownBtn = document.getElementById('btnAddOrderDropdown');
    if (addOrderDropdownBtn) {
        addOrderDropdownBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showAddOrderMenu(this);
        });
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
        if (t.editingInvoiceDocId) {
            label = `Sửa HD: ${t.editingInvoiceDocId}`;
        } else if (isDatHang) {
            dhCount++; label = `Đặt hàng ${dhCount}`;
        } else {
            hdCount++; label = `Hoá đơn ${hdCount}`;
        }
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
    const grouped = getGroupedProducts(products);
    grid.innerHTML = grouped.map((p, i) => {
        const stockClass = p.stock <= 0 ? 'out-of-stock' : p.stock <= 3 ? 'low-stock' : 'in-stock';
        const stockLabel = p.stock <= 0 ? 'Hết hàng' : `Tồn: ${p.stock} ${p.unit || ''}`;
        return `
        <div class="product-grid-item" onclick="addToCart(${p._originalIndex})">
            <div class="product-img">${p.img ? `<img src="${p.img}" alt="${p.name}">` : `<i class="far fa-image" style="color:#CCC;font-size:24px"></i>`}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">${fmtVN(p.price)}</div>
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
    const grouped = getGroupedProducts(products);
    const totalPages = Math.ceil(grouped.length / THUONG_PER_PAGE);
    const start = (thuongPage - 1) * THUONG_PER_PAGE;
    const pageProducts = grouped.slice(start, start + THUONG_PER_PAGE);
    grid.innerHTML = pageProducts.map((p, i) => {
        const stockClass = p.stock <= 0 ? 'out-of-stock' : p.stock <= 3 ? 'low-stock' : 'in-stock';
        const stockLabel = p.stock <= 0 ? 'Hết hàng' : `Tồn: ${p.stock}`;
        return `<div class="thuong-grid-item" onclick="addToCart(${p._originalIndex})">
            <div class="thuong-grid-thumb">${p.img ? `<img src="${p.img}" alt="${p.name}">` : `<i class="far fa-image" style="color:#CCC;font-size:20px;display:flex;align-items:center;justify-content:center;height:100%"></i>`}</div>
            <div class="thuong-grid-info">
                <div class="thuong-grid-name">${p.name}</div>
                <div class="thuong-grid-price">${fmtVN(p.price)} <span class="thuong-grid-stock ${stockClass}">${stockLabel}</span></div>
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

// Generate unit variants for a product (KiotViet linked-product model)
function getProductUnits(p) {
    const base = p.unit || 'Cái';
    const basePrice = p.price || 0;
    const units = [{ name: base, factor: 1, price: basePrice, code: p.code }];

    // Strip .0 from end of strings parsing Excel floats
    const stripDot0 = (str) => str ? String(str).replace(/\.0$/, '') : '';
    const myCode = stripDot0(p.code);
    const myBarcode = stripDot0(p.barcode);
    const myBaseCode = stripDot0(p.baseUnitCode);

    // If this product IS a base unit (no baseUnitCode):
    // find all derived products whose baseUnitCode matches this product's code or barcode
    if (!myBaseCode) {
        products.forEach(dp => {
            let dpBase = stripDot0(dp.baseUnitCode);
            if (dpBase && (dpBase === myCode || dpBase === myBarcode) && stripDot0(dp.code) !== myCode) {
                units.push({
                    name: dp.unit || 'ĐVT khác',
                    factor: dp.conversionRate || 1,
                    price: dp.price || Math.round(basePrice * (dp.conversionRate || 1)),
                    code: dp.code
                });
            }
        });
    }

    // If this product IS a derived unit (has baseUnitCode):
    // also include the base unit so user can switch
    if (myBaseCode) {
        const baseProduct = products.find(bp => stripDot0(bp.code) === myBaseCode || stripDot0(bp.barcode) === myBaseCode);
        if (baseProduct) {
            // Reorder: base unit first, then this derived unit
            units.length = 0;
            units.push({ name: baseProduct.unit || 'Cái', factor: 1, price: baseProduct.price || 0, code: baseProduct.code });
            units.push({ name: p.unit || 'ĐVT khác', factor: p.conversionRate || 1, price: p.price || 0, code: p.code });

            const bpCode = stripDot0(baseProduct.code);
            const bpBarcode = stripDot0(baseProduct.barcode);

            // Also add other derived units of the same base
            products.forEach(dp => {
                let dCode = stripDot0(dp.code);
                let dpBase = stripDot0(dp.baseUnitCode);
                if (dCode !== myCode && dCode !== bpCode && dpBase &&
                    (dpBase === bpCode || dpBase === bpBarcode)) {
                    if (!units.find(u => stripDot0(u.code) === dCode)) {
                        units.push({ name: dp.unit || 'ĐVT khác', factor: dp.conversionRate || 1, price: dp.price || 0, code: dp.code });
                    }
                }
            });
        }
    }

    // NEW: Fallback & enhancement - Group all variants with the EXACT SAME NAME
    // This solves the issue where users import identical names but forget to link them via baseUnitCode
    const nameKey = (p.name || '').trim().toLowerCase();
    products.forEach(dp => {
        if (dp.code !== p.code && (dp.name || '').trim().toLowerCase() === nameKey) {
            if (!units.find(u => u.code === dp.code)) {
                units.push({
                    name: dp.unit || 'ĐVT khác',
                    factor: 1, // Assume 1 if not explicitly linked
                    price: dp.price || 0,
                    code: dp.code
                });
            }
        }
    });

    // Legacy support: old unitConversions array
    if (p.unitConversions && Array.isArray(p.unitConversions)) {
        p.unitConversions.forEach(uc => {
            units.push({ name: uc.name, factor: uc.factor || 1, price: uc.price || Math.round(basePrice * (uc.factor || 1)) });
        });
    }

    return units;
}


function getProductVariantsByName(nameStr) {
    const nameKey = (nameStr || '').trim().toLowerCase();
    const variants = products.filter(p => (p.name || '').trim().toLowerCase() === nameKey);
    return variants.sort((a, b) => (a.price || 0) - (b.price || 0));
}

let activeVariantModalItems = [];

function showVariantModal(variants, pName) {
    const modal = document.getElementById('unitModal');
    if (!modal) return;
    const body = document.getElementById('unitModalBody');
    const title = document.getElementById('unitModalTitle');

    title.textContent = pName;
    activeVariantModalItems = variants.map(v => ({ product: v, qty: 0 }));

    renderVariantModalBody();

    modal.classList.add('show');

    // Bind buttons
    document.getElementById('unitModalClose').onclick = () => modal.classList.remove('show');
    document.getElementById('unitSkip').onclick = () => modal.classList.remove('show');

    const confirmBtn = document.getElementById('unitConfirm');
    confirmBtn.onclick = () => {
        try {
            let added = false;
            activeVariantModalItems.forEach(item => {
                if (item.qty > 0) {
                    for (let i = 0; i < item.qty; i++) {
                        addToCartDirect(item.product, 1);
                    }
                    added = true;
                }
            });
            if (added) {
                const testModal = document.getElementById('unitModal');
                if (testModal) testModal.classList.remove('show');

                // Fallback to force native close
                const closeBtn = document.getElementById('unitModalClose');
                if (closeBtn) closeBtn.click();

                if (qtyMode) { qtyBuffer = 1; qtyMode = false; updateQtyModeUI(); }
            } else {
                showToast('Vui lòng chọn số lượng', 'warning');
            }
        } catch (e) {
            showToast('Lỗi JS: ' + e.message, 'warning');
        }
    };
}

function renderVariantModalBody() {
    const body = document.getElementById('unitModalBody');
    body.innerHTML = activeVariantModalItems.map((item, idx) => {
        const v = item.product;
        const imgHtml = v.img ? `<img src="${v.img}" alt="${v.unit}">` : `<i class="far fa-image"></i>`;
        return `
            <div class="unit-variant-card">
                ${imgHtml}
                <div class="uvc-name">${v.name}</div>
                <div class="uvc-unit">${v.unit || 'Cái'}</div>
                <div class="uvc-price">${fmtVN(v.price)}</div>
                <div class="uvc-stepper">
                    <button class="uvc-btn" onclick="updateVariantModalQty(${idx}, -1)"><i class="fas fa-minus"></i></button>
                    <input type="number" class="uvc-input" value="${item.qty}" readonly>
                    <button class="uvc-btn" onclick="updateVariantModalQty(${idx}, 1)"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function updateVariantModalQty(idx, change) {
    if (!activeVariantModalItems[idx]) return;
    let n = activeVariantModalItems[idx].qty + change;
    if (n < 0) n = 0;
    activeVariantModalItems[idx].qty = n;
    renderVariantModalBody();
}

function addToCart(idx) {
    const p = products[idx];
    if (!p) return;

    // Check for variants
    const variants = getProductVariantsByName(p.name);
    if (variants.length > 1) {
        showVariantModal(variants, p.name);
        return;
    }

    // If no variants, just add directly
    addToCartDirect(p, qtyMode ? qtyBuffer : 1);
}

function addToCartDirect(p, forceQty) {
    const tab = getActiveTab();
    if (!tab) return;
    const qty = forceQty || 1;
    const existing = tab.cart.find(c => c.code === p.code && c.selectedUnit === (p.unit || 'Cái'));
    if (existing) {
        existing.qty += qty;
    } else {
        const units = getProductUnits(p);

        // Find if my p.unit exists in units, otherwise fallback to p.unit
        const myExtractedUnit = p.unit || 'Cái';
        let foundUnit = units.find(u => u.name === myExtractedUnit);
        let actualSelectedUnit = foundUnit ? foundUnit.name : units[0].name;

        tab.cart.push({
            ...p, qty: qty, customPrice: null, discAmt: 0, discType: '%',
            selectedUnit: actualSelectedUnit, units: units
        });

    }

    // Warn when qty exceeds stock
    const cartItem = existing || tab.cart[tab.cart.length - 1];
    const stock = p.stock || 0;
    if (cartItem.qty > stock) {
        showToast(`Số lượng bán (${cartItem.qty}) vượt tồn kho (${stock}) — ${p.name}`, 'warning');
    }
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
    const vis = typeof getColVis === 'function' ? getColVis() : { hinhanh: true, tenHang: true, dvt: true, sl: true, giaVon: true, giaBan: true, thanhTien: true, giamGia: true };
    const h = (show) => show ? '' : 'display:none;';

    let html = `<div class="cart-row cart-header-row">
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
                : `-${fmtVN(item.discAmt)}`)
            : '';
        // Look up stock from product data
        const pIdx = findProductIdx(item.code);
        const stock = pIdx >= 0 ? (products[pIdx].stock || 0) : 0;
        const stockColor = stock <= 0 ? '#e74c3c' : stock <= 3 ? '#f39c12' : '#27ae60';
        const stockLabel = stock <= 0 ? 'Hết hàng' : `Tồn: ${stock}`;
        return `
        <div class="cart-row" data-cart-idx="${i}">
            <button class="cart-delete" onclick="removeFromCart(${i})"><i class="fas fa-trash-alt"></i></button>
            <span class="cart-name" style="${h(vis.tenHang)};display:flex;align-items:center;gap:8px" title="${item.code} - ${item.name}">
                ${item.img ? `<img src="${item.img}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;flex-shrink:0;border:1px solid #ddd">` : `<div style="width:36px;height:36px;background:#f5f7fa;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #eee"><i class="fa-regular fa-image" style="color:#ccc;font-size:16px"></i></div>`}
                <div style="display:flex;align-items:center;flex-wrap:wrap">
                    <span style="margin-right:4px">${item.name}</span>
                    <span style="font-size:10px;color:${stockColor};font-weight:500">(${stockLabel})</span>
                    ${hasDisc ? `<span class="item-disc-badge" style="margin-left:4px" onclick="openItemDiscount(${i},event)">${discLabel}</span>` : ''}
                </div>
            </span>
            <div style="${h(vis.dvt)};position:relative;display:inline-block;padding-top:2px;">
                <select class="unit-select" style="padding:0 12px 0 0;font-size:12px;border:none;background:transparent;outline:none;cursor:pointer;color:#0090DA;appearance:none;-webkit-appearance:none;font-family:inherit;font-weight:500;" onchange="changeUnit(${i},this.value)">${buildUnitOptions(item.selectedUnit || item.unit || 'Cái', item.units)}</select>
                <i class="fa-solid fa-chevron-down" style="position:absolute;right:0;top:6px;font-size:8px;color:#0090DA;pointer-events:none;"></i>
            </div>
            <span class="cart-qty" style="${h(vis.sl)};display:flex;align-items:center;gap:0">
                <button onclick="changeQty(${i},${Math.max(1, item.qty - 1)})" style="width:22px;height:22px;border:1px solid #E0E0E0;border-radius:4px 0 0 4px;background:#F5F7FA;cursor:pointer;font-size:13px;line-height:1;color:#555;display:flex;align-items:center;justify-content:center;padding:0">&minus;</button>
                <input type="number" value="${item.qty}" min="1" onchange="changeQty(${i},Math.max(1,this.value))" onclick="openQtyInfo(${i},event)" style="width:32px;height:22px;text-align:center;border:1px solid #E0E0E0;border-left:none;border-right:none;font-size:12px;outline:none;-moz-appearance:textfield" onfocus="this.select()">
                <button onclick="changeQty(${i},${item.qty + 1})" style="width:22px;height:22px;border:1px solid #E0E0E0;border-radius:0 4px 4px 0;background:#F5F7FA;cursor:pointer;font-size:13px;line-height:1;color:#555;display:flex;align-items:center;justify-content:center;padding:0">+</button>
            </span>
            ${vis.giaVon ? `<span class="cart-price" style="text-align:right;min-width:70px;color:#888">${fmtVN(Math.round(item.costPrice || 0))}</span>` : ''}
            <span class="cart-price" style="text-align:right;${h(vis.giaBan)}">
                <input class="cart-price-input"
                    type="text"
                    value="${fmtVN(unitPrice)}"
                    data-raw="${unitPrice}"
                    onfocus="this.select()"
                    onclick="openItemDetail(${i},event)"
                    onblur="changePrice(${i},this.value)"
                    onkeydown="if(event.key==='Enter')this.blur()"
                >
            </span>
            <span class="cart-total" style="text-align:right;${h(vis.thanhTien)}color:${hasDisc ? '#D0453A' : 'inherit'};font-weight:${hasDisc ? '600' : '400'}">${fmtVN(Math.round(lineTotal))}</span>
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
        // Look up stock from product data
        const pIdx = findProductIdx(item.code);
        const stock = pIdx >= 0 ? (products[pIdx].stock || 0) : 0;
        const stockColor = stock <= 0 ? '#e74c3c' : stock <= 3 ? '#f39c12' : '#27ae60';
        const stockLabel = stock <= 0 ? 'Hết hàng' : `Tồn: ${stock}`;
        return `
        <div class="thuong-cart-item" data-cart-idx="${i}">
            <span class="tc-index">${i + 1}</span>
            <div class="tc-img">${imgHtml}</div>
            <div class="tc-info">
                <div class="tc-code">${item.code || ''} <span style="font-size:10px;color:${stockColor};font-weight:600">(${stockLabel})</span></div>
                <div class="tc-name" title="${item.name}">${item.name}</div>
                <div class="tc-qty-row">
                    <button class="tc-qty-btn" onclick="changeQty(${i},${item.qty - 1})">−</button>
                    <input class="tc-qty-val" type="number" value="${item.qty}" min="1" onchange="changeQty(${i},this.value)">
                    <button class="tc-qty-btn" onclick="changeQty(${i},${item.qty + 1})">+</button>
                </div>
                <div class="tc-note" onclick="openCartItemNote(${i})">${item.note ? item.note : 'Ghi chú...'}</div>
            </div>
            <div class="tc-right">
                <div style="position:relative;display:inline-block;">
                    <select class="tc-unit-select" style="padding:0 12px 0 0;font-size:12px;border:none;background:transparent;outline:none;cursor:pointer;color:#0090DA;appearance:none;-webkit-appearance:none;font-family:inherit;font-weight:500;" onchange="changeUnit(${i},this.value)">${buildUnitOptions(item.selectedUnit || item.unit || 'Cái', item.units)}</select>
                    <i class="fa-solid fa-chevron-down" style="position:absolute;right:0;top:4px;font-size:8px;color:#0090DA;pointer-events:none;"></i>
                </div>
                <div class="tc-price">${fmtVN(unitPrice)}</div>
            </div>
            <button class="tc-more" onclick="openCartItemMenu(${i},event)"><i class="fas fa-ellipsis-v"></i></button>
        </div>`;
    }).join('');
    html += '</div>';

    // Bottom summary bar
    html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#F5F7FA;border-top:1px solid #E0E0E0;font-size:13px">
        <span>Tổng tiền hàng: <b style="color:#e74c3c">${cart.length}</b></span>
        <b style="color:#e74c3c;font-size:15px">${fmtVN(Math.round(totalAmt))}</b>
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

    // Remove any existing note popup
    const old = document.getElementById('notePopup');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'notePopup';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.35);z-index:99999;display:flex;align-items:center;justify-content:center;';

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:10px;padding:24px 28px;width:400px;max-width:90%;box-shadow:0 8px 30px rgba(0,0,0,0.2);';
    box.innerHTML = `
        <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:6px;">
            <i class="fas fa-pen" style="color:#0090DA;margin-right:8px;"></i>Ghi chú sản phẩm
        </div>
        <div style="font-size:13px;color:#666;margin-bottom:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${item.name}">${item.name}</div>
        <textarea id="notePopupInput" style="width:100%;height:80px;border:1px solid #ddd;border-radius:6px;padding:10px;font-size:13px;font-family:inherit;resize:vertical;outline:none;box-sizing:border-box;" placeholder="Nhập ghi chú cho sản phẩm...">${item.note || ''}</textarea>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;">
            <button id="notePopupCancel" style="padding:8px 20px;border:1px solid #ddd;border-radius:6px;background:#fff;color:#555;font-size:13px;cursor:pointer;font-weight:500;">Hủy</button>
            <button id="notePopupSave" style="padding:8px 20px;border:none;border-radius:6px;background:#0090DA;color:#fff;font-size:13px;cursor:pointer;font-weight:600;">Lưu</button>
        </div>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const inp = document.getElementById('notePopupInput');
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);

    document.getElementById('notePopupCancel').onclick = function () { overlay.remove(); };
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });

    document.getElementById('notePopupSave').onclick = function () {
        item.note = inp.value.trim();
        renderCart();
        overlay.remove();
        showToast('Đã lưu ghi chú', 'success');
    };

    // Enter key to save
    inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('notePopupSave').click();
        }
    });
}

function viewCartItemDetail(i) {
    const tab = getActiveTab();
    if (!tab || !tab.cart[i]) return;
    const item = tab.cart[i];
    const unitPrice = getCartItemPrice(item);
    const lineTotal = getCartItemLineTotal(item);

    // Build a KiotViet-style detail modal containing Edit & Delete
    const content = `
        <div style="font-size:13px; color:#333;">
            <div style="display:flex; justify-content:center; margin-bottom:16px;">
                <div style="width:80px;height:80px;border-radius:8px;overflow:hidden;border:1px solid #eee;background:#f9f9f9;display:flex;align-items:center;justify-content:center;">
                    ${item.img ? `<img src="${item.img}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fa-solid fa-box" style="font-size:32px;color:#ccc;"></i>`}
                </div>
            </div>
            <h4 style="font-size:15px; font-weight:600; text-align:center; color:#1a1a2e; margin:0 0 16px;">${item.name}</h4>
            
            <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                <tr><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; color:#666; width:100px;">Mã hàng</td><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-weight:500; text-align:right;">${item.code}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; color:#666;">Số lượng</td><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-weight:600; text-align:right; color:var(--blue);">${item.qty} ${item.unit || 'Cái'}</td></tr>
                <tr><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; color:#666;">Đơn giá</td><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-weight:500; text-align:right;">${fmtVN(unitPrice)} đ</td></tr>
                ${item.discAmt > 0 ? `<tr><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; color:#666;">Giảm giá</td><td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-weight:500; text-align:right; color:#e65100;">${item.discType === '%' ? item.discAmt + '%' : fmtVN(item.discAmt) + 'đ'}</td></tr>` : ''}
                <tr><td style="padding:10px 0 4px; color:#333; font-weight:600; font-size:14px;">Thành tiền</td><td style="padding:10px 0 4px; font-weight:700; text-align:right; color:#0090DA; font-size:15px;">${fmtVN(Math.round(lineTotal))} đ</td></tr>
            </table>

            <div style="display:flex; gap:12px; justify-content:space-between; margin-top:10px;">
                <button onclick="closeModal(); removeFromCart(${i})" style="flex:1; padding:10px; border-radius:6px; border:1px solid #e74c3c; background:#FDEDEC; color:#e74c3c; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;">
                    <i class="fa-solid fa-trash-alt"></i> Xóa khỏi giỏ
                </button>
                <button onclick="closeModal(); setTimeout(()=>openItemDetail(${i}, {target: document.body}), 200)" style="flex:1; padding:10px; border-radius:6px; border:none; background:#0090DA; color:#fff; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;">
                    <i class="fa-solid fa-pen"></i> Chỉnh sửa
                </button>
            </div>
        </div>
    `;
    openModal('Chi tiết hàng hóa', content, '380px');
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
    if (q > 0) {
        tab.cart[i].qty = q;
        // KiotViet-style: warn when qty exceeds stock
        const item = tab.cart[i];
        const pIdx = findProductIdx(item.code);
        const stock = pIdx >= 0 ? (products[pIdx].stock || 0) : 0;
        if (q > stock) {
            showToast(`Số lượng bán (${q}) vượt tồn kho (${stock}) — ${item.name}`, 'warning');
        }
    } else {
        tab.cart.splice(i, 1);
    }
    renderCart();
    calculateTotals();
    renderTabs();
}

function changeUnit(i, unitName) {
    const tab = getActiveTab();
    if (!tab || !tab.cart[i]) return;
    const item = tab.cart[i];
    item.selectedUnit = unitName;
    item.customPrice = null; // Reset custom price so unit price takes effect

    // Look up the matching unit and update the item's display price
    if (item.units) {
        const matchedUnit = item.units.find(u => u.name === unitName);
        if (matchedUnit) {
            item.price = matchedUnit.price;
            // UPDATE item.code SO STOCK IS DEDUCTED CORRECTLY FOR THE CHOSEN UNIT
            if (matchedUnit.code && matchedUnit.code !== item.code) {
                // Ensure we also update the original identifier
                item.code = matchedUnit.code;
            }
        }
    }

    renderCart();
    calculateTotals();
    renderTabs();
}

// ==================== TOTALS ====================
// Helper: compute consistent order totals from cart + current discount settings
function _getOrderTotals(cart) {
    const gross = Math.round(cart.reduce((s, c) => s + getCartItemPrice(c) * c.qty, 0));
    const net = Math.round(cart.reduce((s, c) => s + getCartItemLineTotal(c), 0));
    const itemDisc = gross - net;
    const rawDisc = Math.max(0, parseFloat(document.getElementById('discountInput')?.value || 0));
    const other = Math.max(0, parseInt(document.getElementById('otherInput')?.value || 0));
    let orderDisc = 0;
    if (discountMode === '%') {
        // % mode: apply to GROSS to avoid double-discounting
        orderDisc = Math.round(gross * Math.min(rawDisc, 100) / 100);
    } else {
        orderDisc = Math.round(rawDisc);
    }
    const grandTotal = gross - orderDisc + other;
    return { gross, net, itemDisc, orderDisc, other, grandTotal };
}

function calculateTotals() {
    const tab = getActiveTab();
    const cart = tab ? tab.cart : [];
    // Gross subtotal: original prices × qty (before per-item discounts)
    const grossSubtotal = Math.round(cart.reduce((s, c) => s + getCartItemPrice(c) * c.qty, 0));
    // Net subtotal: after per-item discounts
    const netSubtotal = Math.round(cart.reduce((s, c) => s + getCartItemLineTotal(c), 0));
    // Sum of all per-item discounts in VNĐ
    const itemDiscSum = grossSubtotal - netSubtotal;
    const count = cart.reduce((s, c) => s + c.qty, 0);

    // Smart-sync discountInput with item-level discounts ONLY if they exist
    const discInput = document.getElementById('discountInput');
    if (discInput) {
        const discountedItems = cart.filter(c => c.discAmt && c.discAmt > 0);
        if (discountedItems.length > 0) {
            const allSamePct = discountedItems.every(c => c.discType === '%')
                && new Set(discountedItems.map(c => c.discAmt)).size === 1;
            if (allSamePct) {
                // All items share same % discount → show as % in right panel
                if (window._setOrderDiscMode && discountMode !== '%') window._setOrderDiscMode('%');
                discInput.value = discountedItems[0].discAmt;
            } else {
                // VNĐ or mixed → show as VNĐ total
                if (window._setOrderDiscMode && discountMode !== 'vnd') window._setOrderDiscMode('vnd');
                discInput.value = itemDiscSum;
            }
        }
    }

    // Effective discount calculation
    const rawDisc = Math.max(0, parseFloat(discInput?.value || 0));
    let discount = 0;
    if (discountMode === '%') {
        // % mode: always apply percentage to GROSS subtotal (original price)
        // This avoids double-discounting when % is auto-synced from item-level discounts
        discount = Math.round(grossSubtotal * Math.min(rawDisc, 100) / 100);
    } else {
        // VNĐ mode: discInput auto-shows itemDiscSum
        discount = Math.round(rawDisc);
    }

    // Show computed discount amount next to the label when in % mode
    const discLabel = document.getElementById('discountComputedLabel');
    if (discLabel) {
        discLabel.textContent = discountMode === '%' && rawDisc > 0
            ? `(-${fmtVN(discount)}đ)` : '';
    }

    const other = Math.max(0, parseInt(document.getElementById('otherInput')?.value || 0));
    // Unified formula: total = gross - discount + other
    // VNĐ mode: discount = itemDiscSum → total = gross - itemDiscSum = net ✓
    // % mode:   discount = % of gross  → total = gross - gross*% ✓ (no double-discount)
    const total = grossSubtotal - discount + other;

    const el = id => document.getElementById(id);
    // Payment panel (Bán nhanh)
    if (el('totalCount')) el('totalCount').textContent = count;
    if (el('subtotalValue')) el('subtotalValue').textContent = fmtVN(grossSubtotal);

    const isEditing = tab && !!tab.editingInvoiceId;
    const priorPaid = isEditing ? (tab.editingOriginalPaid || 0) : 0;
    const remainingToPay = total - priorPaid;

    if (el('grandTotal')) el('grandTotal').textContent = fmtVN(total);

    // Dynamically inject "Đã thanh toán trước đó" row if editing
    let priorPayRow = document.getElementById('priorPayRow');
    if (isEditing && priorPaid > 0) {
        if (!priorPayRow) {
            priorPayRow = document.createElement('div');
            priorPayRow.id = 'priorPayRow';
            priorPayRow.className = 'price-row';
            priorPayRow.innerHTML = `<div class="label" style="color:#888;">Đã thanh toán</div><div class="value" style="font-weight:600;color:#333;">${fmtVN(priorPaid)}</div>`;
            const grandTotalRow = el('grandTotal').closest('.price-row');
            grandTotalRow.parentNode.insertBefore(priorPayRow, grandTotalRow.nextSibling);

            const remainingRow = document.createElement('div');
            remainingRow.id = 'remainingPayRow';
            remainingRow.className = 'price-row';
            remainingRow.innerHTML = `<div class="label" style="font-weight:600;color:#e74c3c;">Khách cần trả</div><div class="value" style="font-weight:700;color:#e74c3c;font-size:16px;">${fmtVN(remainingToPay)}</div>`;
            priorPayRow.parentNode.insertBefore(remainingRow, priorPayRow.nextSibling);
        } else {
            priorPayRow.innerHTML = `<div class="label" style="color:#888;">Đã thanh toán</div><div class="value" style="font-weight:600;color:#333;">${fmtVN(priorPaid)}</div>`;
            const remainingRow = document.getElementById('remainingPayRow');
            if (remainingRow) remainingRow.innerHTML = `<div class="label" style="font-weight:600;color:#e74c3c;">Khách cần trả</div><div class="value" style="font-weight:700;color:#e74c3c;font-size:16px;">${fmtVN(remainingToPay)}</div>`;
        }
    } else {
        if (priorPayRow) priorPayRow.remove();
        const remainingRow = document.getElementById('remainingPayRow');
        if (remainingRow) remainingRow.remove();
    }

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
            totalQtyEl.style.marginTop = 'auto';
        } else {
            const cartSection = document.getElementById('cartSection');
            if (cartSection && !totalQtyEl.parentElement) {
                cartSection.parentElement.insertBefore(totalQtyEl, cartSection.nextSibling);
            }
        }
        totalQtyEl.innerHTML = `<i class="fas fa-box"></i> Tổng SL: <span>${count}</span> &nbsp;|&nbsp; Tổng tiền hàng: <span>${fmtVN(grossSubtotal)}đ</span>`;
        totalQtyEl.style.display = '';
    } else if (totalQtyEl) {
        totalQtyEl.style.display = 'none';
    }

    // Calculate change or debt based on paid amount vs REMAINING to pay (offsetting prior payments)
    const payInput = el('payAmountInput');
    const paid = payInput && payInput.value ? parseInt(payInput.value.replace(/[,.]/g, '')) : (isEditing ? 0 : total);
    // Auto-fill paid input to exact total if it's new order. If editing, default to 0 because they don't necessarily pay anything more unless total increased.

    const changeEl = el('changeValue');
    const changeRow = changeEl ? changeEl.closest('.price-row') : null;
    const changeLabel = changeRow ? changeRow.querySelector('.label') : null;

    const targetAmount = isEditing ? remainingToPay : total;

    if (paid > 0 && paid >= targetAmount) {
        // Customer paid enough or more → show change
        const change = paid - targetAmount;
        if (changeLabel) { changeLabel.textContent = isEditing && targetAmount < 0 ? 'Trả lại khách' : 'Tiền thừa trả khách'; changeLabel.style.color = ''; }
        if (changeEl) { changeEl.textContent = fmtVN(change); changeEl.style.color = '#27ae60'; changeEl.style.fontWeight = '600'; }
    } else if (paid > 0 && paid < targetAmount) {
        // Customer paid less → show debt (Còn nợ)
        const debt = targetAmount - paid;
        if (changeLabel) { changeLabel.textContent = 'Còn nợ'; changeLabel.style.color = '#e74c3c'; }
        if (changeEl) { changeEl.textContent = fmtVN(debt); changeEl.style.color = '#e74c3c'; changeEl.style.fontWeight = '700'; }
    } else {
        // No payment entered yet (e.g. they wiped the input)
        if (changeLabel) { changeLabel.textContent = isEditing && targetAmount < 0 ? 'Cần trả lại khách' : 'Tiền thừa trả khách'; changeLabel.style.color = ''; }
        if (changeEl) { changeEl.textContent = fmtVN(targetAmount); changeEl.style.color = ''; changeEl.style.fontWeight = ''; }
    }

    // Bottom summary (Bán thường)
    if (el('summaryCount')) el('summaryCount').textContent = count;
    if (el('summaryTotal')) el('summaryTotal').textContent = fmtVN(grossSubtotal);

    // Bottom price breakdown (Bán giao hàng)
    if (el('bpCount')) el('bpCount').textContent = count;
    if (el('bpSubtotal')) el('bpSubtotal').textContent = fmtVN(grossSubtotal);
    if (el('bpTotal')) el('bpTotal').textContent = fmtVN(total);

    // If bank transfer is selected, refresh QR with new amount
    updateTransferQR();
}

// ==================== CHANGE PRICE PER ITEM ====================
function changePrice(i, rawVal) {
    const tab = getActiveTab();
    if (!tab) return;
    // Strip formatting dots/commas (VN uses . as thousands separator)
    const num = parseInt(String(rawVal).replace(/[,.]/g, ''));
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
            <span style="font-size:12px;color:#555">${fmtVN(unitPrice)} × ${item.qty}</span>
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

// ==================== QTY INFO POPUP (Tồn / Đặt) ====================
function openQtyInfo(i, event) {
    event.stopPropagation();
    document.getElementById('qtyInfoPopup')?.remove();
    const tab = getActiveTab();
    if (!tab) return;
    const item = tab.cart[i];
    const pIdx = findProductIdx(item.code);
    const stock = pIdx >= 0 ? (products[pIdx].stock || 0) : 0;
    const ordered = pIdx >= 0 ? (products[pIdx].ordered || 0) : 0;

    const popup = document.createElement('div');
    popup.id = 'qtyInfoPopup';
    popup.style.cssText = 'position:fixed;z-index:9999;background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.15);padding:8px 14px;font-size:12px;animation:fadeInDown .12s ease';
    popup.innerHTML = `
        <div style="color:#333;line-height:1.8">
            <div><b>Tồn:</b> <span style="color:${stock > 0 ? '#27ae60' : '#e74c3c'};font-weight:600">${stock}</span></div>
            <div><b>Đặt:</b> <span style="color:#0090DA;font-weight:600">${ordered}</span></div>
        </div>
    `;
    document.body.appendChild(popup);
    const rect = event.target.getBoundingClientRect();
    popup.style.top = (rect.bottom + 4) + 'px';
    popup.style.left = (rect.left - 10) + 'px';

    setTimeout(() => {
        document.addEventListener('click', function _closeQty(e) {
            if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener('click', _closeQty); }
        });
    }, 10);
}

// ==================== ITEM DETAIL POPUP (Đơn giá / Giảm giá / Giá bán) ====================
let _detailPopupIdx = null;
function openItemDetail(i, event) {
    event.stopPropagation();
    closeItemDetailPopup();
    _detailPopupIdx = i;
    const tab = getActiveTab();
    if (!tab) return;
    const item = tab.cart[i];
    const unitPrice = getCartItemPrice(item);
    const discAmt = item.discAmt || 0;
    const discType = item.discType || '%';
    // Calculate sale price
    let discValue = 0;
    if (discAmt > 0) {
        discValue = discType === '%' ? Math.round(unitPrice * discAmt / 100) : Math.round(discAmt);
    }
    const salePrice = unitPrice - discValue;

    const popup = document.createElement('div');
    popup.id = 'itemDetailPopup';
    popup.style.cssText = 'position:fixed;z-index:9999;background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,0.18);padding:14px 16px;width:260px;font-size:13px;animation:fadeInDown .15s ease';
    popup.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div style="font-size:12px;font-weight:600;color:#1A1A2E"><i class="fas fa-info-circle" style="color:#0090DA;margin-right:4px"></i>${item.name.slice(0, 25)}${item.name.length > 25 ? '...' : ''}</div>
            <button onclick="closeItemDetailPopup()" style="border:none;background:none;cursor:pointer;font-size:14px;color:#999">&times;</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #F0F0F0">
            <span style="color:#666">Đơn giá</span>
            <input id="detailPriceInput" type="text" value="${fmtVN(unitPrice)}"
                style="width:120px;text-align:right;border:1px solid #E0E0E0;border-radius:5px;padding:4px 8px;font-size:13px;font-weight:600;outline:none"
                onfocus="this.select()">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #F0F0F0">
            <span style="color:#666">Giảm giá</span>
            <div style="display:flex;align-items:center;gap:4px">
                <input id="detailDiscInput" type="text" value="${discAmt > 0 ? discAmt : ''}" placeholder="0"
                    style="width:60px;text-align:right;border:1px solid #E0E0E0;border-radius:5px;padding:4px 6px;font-size:12px;outline:none"
                    onfocus="this.select()" oninput="_updateDetailSalePrice()">
                <div style="display:flex;border-radius:4px;overflow:hidden;border:1px solid #0090DA">
                    <button id="detailDiscVND" type="button" onclick="_setDetailDiscType('vnd')"
                        style="padding:2px 8px;font-size:10px;font-weight:600;cursor:pointer;border:none;${discType === 'vnd' ? 'background:#0090DA;color:#fff' : 'background:#fff;color:#0090DA'}">VNĐ</button>
                    <button id="detailDiscPct" type="button" onclick="_setDetailDiscType('%')"
                        style="padding:2px 8px;font-size:10px;font-weight:600;cursor:pointer;border:none;${discType === '%' ? 'background:#F57C00;color:#fff' : 'background:#fff;color:#0090DA'}">%</button>
                </div>
            </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
            <span style="color:#333;font-weight:600">Giá bán</span>
            <span id="detailSalePrice" style="font-size:15px;font-weight:700;color:#0090DA">${fmtVN(salePrice)}</span>
        </div>
        <div style="display:flex;gap:6px;margin-top:4px">
            <button onclick="closeItemDetailPopup()" type="button"
                style="flex:1;padding:7px;border-radius:6px;border:1px solid #E0E0E0;background:#F5F5F5;color:#666;font-size:12px;cursor:pointer">Hủy</button>
            <button onclick="_applyItemDetail()" type="button"
                style="flex:2;padding:7px;border-radius:6px;border:none;background:#0090DA;color:#fff;font-size:12px;font-weight:600;cursor:pointer">Áp dụng</button>
        </div>
    `;

    document.body.appendChild(popup);
    // Position near click
    const rect = event.target.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left - 130;
    if (left < 8) left = 8;
    if (top + 280 > window.innerHeight) top = rect.top - 280;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';

    setTimeout(() => { document.getElementById('detailPriceInput')?.focus(); }, 50);
    setTimeout(() => { document.addEventListener('click', _outsideDetailClick); }, 10);
}

window._detailDiscType = '%';
function _setDetailDiscType(type) {
    window._detailDiscType = type;
    const vndBtn = document.getElementById('detailDiscVND');
    const pctBtn = document.getElementById('detailDiscPct');
    if (type === 'vnd') {
        vndBtn.style.background = '#0090DA'; vndBtn.style.color = '#fff';
        pctBtn.style.background = '#fff'; pctBtn.style.color = '#0090DA';
    } else {
        pctBtn.style.background = '#F57C00'; pctBtn.style.color = '#fff';
        vndBtn.style.background = '#fff'; vndBtn.style.color = '#0090DA';
    }
    _updateDetailSalePrice();
}

function _updateDetailSalePrice() {
    const priceRaw = parseInt((document.getElementById('detailPriceInput')?.value || '0').replace(/[,.]/g, ''));
    const discRaw = parseFloat(document.getElementById('detailDiscInput')?.value || 0);
    const type = window._detailDiscType;
    let discVal = 0;
    if (discRaw > 0) {
        discVal = type === '%' ? Math.round(priceRaw * Math.min(discRaw, 100) / 100) : Math.round(discRaw);
    }
    const sale = Math.max(0, priceRaw - discVal);
    const el = document.getElementById('detailSalePrice');
    if (el) el.textContent = fmtVN(sale);
}

function _applyItemDetail() {
    const tab = getActiveTab();
    if (!tab || _detailPopupIdx === null) return;
    const item = tab.cart[_detailPopupIdx];
    // Apply custom price
    const priceRaw = parseInt((document.getElementById('detailPriceInput')?.value || '0').replace(/[,.]/g, ''));
    if (priceRaw > 0) item.customPrice = priceRaw;
    // Apply discount
    const discRaw = parseFloat(document.getElementById('detailDiscInput')?.value || 0);
    item.discType = window._detailDiscType;
    item.discAmt = discRaw >= 0 ? discRaw : 0;
    closeItemDetailPopup();
    renderCart();
    calculateTotals();
    showToast('Đã cập nhật giá', 'success');
}

function closeItemDetailPopup() {
    const p = document.getElementById('itemDetailPopup');
    if (p) p.remove();
    document.removeEventListener('click', _outsideDetailClick);
    _detailPopupIdx = null;
}

function _outsideDetailClick(e) {
    const popup = document.getElementById('itemDetailPopup');
    if (popup && !popup.contains(e.target)) closeItemDetailPopup();
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

            // Two-button VNĐ / % selector
            const btnWrap = document.createElement('div');
            btnWrap.style.cssText = 'display:flex;margin-left:4px;border-radius:5px;overflow:hidden;border:1px solid #0090DA;flex-shrink:0';
            btnWrap.innerHTML = `
                <button type="button" id="discBtnVND" style="padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;border:none;background:#0090DA;color:#fff;transition:all .2s">VNĐ</button>
                <button type="button" id="discBtnPct" style="padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;border:none;background:#fff;color:#0090DA;transition:all .2s">%</button>
            `;
            discRow.appendChild(btnWrap);

            function setDiscMode(mode) {
                discountMode = mode;
                const vndBtn = document.getElementById('discBtnVND');
                const pctBtn = document.getElementById('discBtnPct');
                if (mode === 'vnd') {
                    vndBtn.style.background = '#0090DA'; vndBtn.style.color = '#fff';
                    pctBtn.style.background = '#fff'; pctBtn.style.color = '#0090DA';
                    discountInput.placeholder = '0';
                } else {
                    pctBtn.style.background = '#F57C00'; pctBtn.style.color = '#fff';
                    vndBtn.style.background = '#fff'; vndBtn.style.color = '#0090DA';
                    btnWrap.style.borderColor = '#F57C00';
                    discountInput.placeholder = '0 (%)';
                }
                if (mode === 'vnd') btnWrap.style.borderColor = '#0090DA';
                discountInput.value = '0';
                calculateTotals();
            }

            // Expose for use in calculateTotals auto-sync
            window._setOrderDiscMode = function (mode) {
                discountMode = mode;
                const vb = document.getElementById('discBtnVND');
                const pb = document.getElementById('discBtnPct');
                if (mode === 'vnd') {
                    if (vb) { vb.style.background = '#0090DA'; vb.style.color = '#fff'; }
                    if (pb) { pb.style.background = '#fff'; pb.style.color = '#0090DA'; }
                    if (vb?.parentElement) vb.parentElement.style.borderColor = '#0090DA';
                    discountInput.placeholder = '0';
                } else {
                    if (pb) { pb.style.background = '#F57C00'; pb.style.color = '#fff'; }
                    if (vb) { vb.style.background = '#fff'; vb.style.color = '#0090DA'; }
                    if (pb?.parentElement) pb.parentElement.style.borderColor = '#F57C00';
                    discountInput.placeholder = '0 (%)';
                }
            };
            btnWrap.querySelector('#discBtnVND').addEventListener('click', () => { window._setOrderDiscMode('vnd'); discountInput.value = '0'; calculateTotals(); });
            btnWrap.querySelector('#discBtnPct').addEventListener('click', () => { window._setOrderDiscMode('%'); discountInput.value = '0'; calculateTotals(); });
        }
    }
    if (otherInput) otherInput.addEventListener('input', calculateTotals);

    // Inject payment method selector + pay amount input
    injectPaymentMethod();

    // Inject Modal CSS for 'Bán thường'
    if (!document.getElementById('thuongStyle')) {
        const style = document.createElement('style');
        style.id = 'thuongStyle';
        style.innerHTML = `
            #paymentPanel.modal-mode {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 400px !important;
                height: auto !important;
                min-height: 500px !important;
                max-height: 90vh !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                z-index: 9999 !important;
                border-radius: 8px !important;
                display: flex !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Intercept checkout for 'Bán thường' to show modal
    const btnOrderThuong = document.querySelector('.thuong-actions .btn-order');
    if (btnOrderThuong) {
        btnOrderThuong.addEventListener('click', function (e) {
            e.stopPropagation();
            const tab = getActiveTab();
            if (!tab || tab.cart.length === 0) {
                showToast('Chưa có sản phẩm trong đơn hàng', 'error');
                return;
            }
            const payPanel = document.getElementById('paymentPanel');
            if (payPanel) {
                payPanel.classList.add('modal-mode');
                payPanel.style.display = 'flex';
                let backdrop = document.getElementById('payBackdrop');
                if (!backdrop) {
                    backdrop = document.createElement('div');
                    backdrop.id = 'payBackdrop';
                    backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9990;display:none;';
                    document.body.appendChild(backdrop);
                    backdrop.addEventListener('click', () => {
                        payPanel.classList.remove('modal-mode');
                        payPanel.style.display = '';
                        backdrop.style.display = 'none';
                    });
                }
                backdrop.style.display = 'block';
            }
        });
    }

    // Execute standard checkout logic (Modal button / Delivery mode / Fast mode)
    document.querySelectorAll('#paymentPanel .btn-order, #btnDeliveryPay, .btn-delivery-order').forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = getActiveTab();
            if (!tab || tab.cart.length === 0) {
                showToast('Chưa có sản phẩm trong đơn hàng', 'error');
                return;
            }

            // KiotViet Validation: Chặn số lượng âm (<0) hoặc tổng tiền âm
            const hasInvalidQty = tab.cart.some(item => typeof item.qty !== 'number' || item.qty <= 0);
            if (hasInvalidQty) {
                showToast('Số lượng sản phẩm không hợp lệ (phải lớn hơn 0).', 'error');
                return;
            }

            // KiotViet Validation: Chặn xuất bán vượt tồn kho (Synchronized across base units)
            let exceedingBaseCode = null;
            let requiredBase = 0;
            let availableBase = 0;
            let exceedName = '';

            const baseDemand = {};
            const baseNames = {};
            for (const item of tab.cart) {
                const pIdx = findProductIdx(item.code);
                const pData = pIdx >= 0 ? products[pIdx] : null;
                const conv = pData && pData.conversionRate ? pData.conversionRate : 1;
                const baseCode = item.code.split('-')[0];

                baseDemand[baseCode] = (baseDemand[baseCode] || 0) + (item.qty * conv);
                baseNames[baseCode] = item.name;
            }

            let liveProducts = [];
            try {
                liveProducts = JSON.parse(localStorage.getItem('hasu_products') || '[]');
                if (!Array.isArray(liveProducts) || liveProducts.length === 0) liveProducts = products;
            } catch (e) { liveProducts = products; }

            for (const bCode in baseDemand) {
                const bIdx = liveProducts.findIndex(p => p.code === bCode);
                // Safe check if it's a custom service item missing from DB
                if (bCode && bIdx === -1 && liveProducts.length > 0) continue;
                const stock = bIdx >= 0 ? (liveProducts[bIdx].stock || 0) : 0;
                if (baseDemand[bCode] > stock + 0.001) {
                    exceedingBaseCode = bCode;
                    requiredBase = baseDemand[bCode];
                    availableBase = stock;
                    exceedName = baseNames[bCode];
                    break;
                }
            }

            if (exceedingBaseCode) {
                let fR = Number.isInteger(requiredBase) ? requiredBase : requiredBase.toFixed(2);
                let fA = Number.isInteger(availableBase) ? availableBase : availableBase.toFixed(2);
                showToast(`Không thể thanh toán: Vượt tồn kho. (${exceedName} yêu cầu ${fR} đơn vị cơ bản, chỉ còn ${fA})`, 'error');
                return;
            }
            const currentTotals = _getOrderTotals(tab.cart);
            const totalDiscValue = parseFloat(document.getElementById('discountInput')?.value || 0);
            let finalTestTotal = currentTotals.grandTotal;
            if (discountMode === 'vnd') finalTestTotal -= totalDiscValue;
            else if (discountMode === '%') finalTestTotal -= (currentTotals.gross * totalDiscValue / 100);

            if (finalTestTotal < 0) {
                showToast('Tổng tiền thanh toán không được âm.', 'error');
                return;
            }

            // Save order snapshot for return feature (before cart clear)
            const snap = {
                id: 'HD' + Date.now().toString().slice(-8),
                time: new Date(),
                customer: tab.customer ? { ...tab.customer } : null,
                cart: tab.cart.map(c => ({ ...c })),
                payMethod: (tab.payMethods && tab.payMethods.length > 1) ? 'combined' : (tab.payMethod || 'cash'),
                payMethods: tab.payMethods ? [...tab.payMethods] : [tab.payMethod || 'cash'],
                discountMode: discountMode,
                discValue: parseFloat(document.getElementById('discountInput')?.value || 0),
                other: parseInt(document.getElementById('otherInput')?.value || 0),
            };
            const _snapTotals = _getOrderTotals(snap.cart);
            snap.subtotal = _snapTotals.gross;
            snap.discount = _snapTotals.orderDisc;
            snap.grandTotal = _snapTotals.grandTotal;
            // Track paid amount, breakdown, and debt
            snap.payBreakdown = typeof getPayBreakdown === 'function' ? getPayBreakdown() : [];
            snap.paidAmount = typeof getTotalPaid === 'function' ? getTotalPaid() : 0;
            if (snap.paidAmount === 0) {
                const payInp = document.getElementById('payAmountInput');
                if (payInp && payInp.value.trim() === '') {
                    snap.paidAmount = snap.grandTotal;
                } else if (payInp) {
                    snap.paidAmount = parseInt((payInp.value || '0').replace(/[,.]/g, ''));
                }
            }
            snap.debt = snap.paidAmount > 0 ? Math.max(0, snap.grandTotal - snap.paidAmount) : snap.grandTotal;
            snap.change = snap.paidAmount > snap.grandTotal ? snap.paidAmount - snap.grandTotal : 0;

            // KiotViet Validation: Guest customers (Khách lẻ) cannot have debt!
            if (snap.debt > 0 && (!tab.customer || !tab.customer.id || tab.customer.id === 'KH000001')) {
                showToast('Khách lẻ không được nợ. Vui lòng thanh toán đủ!', 'error');
                return; // Stop checkout completely
            }

            completedOrders.unshift(snap); // newest first
            saveCompletedOrders();

            // R7/R8/R9: Show print options before printing
            showPrintOptions();
        });
    });
}

// Called after employee prints from the bill popup
function completeOrder() {
    const tab = getActiveTab();
    if (!tab) return;

    // KiotViet Validation: Chặn số lượng âm hoặc tổng tiền âm (Centralized for all triggers including F9)
    const hasInvalidQty = tab.cart.some(item => typeof item.qty !== 'number' || item.qty <= 0);
    if (hasInvalidQty) {
        showToast('Số lượng sản phẩm không hợp lệ (phải lớn hơn 0).', 'error');
        return;
    }

    // KiotViet Validation: Chặn xuất bán vượt tồn kho (Synchronized across base units)
    let exceedingBaseCode = null;
    let requiredBase = 0;
    let availableBase = 0;
    let exceedName = '';

    // Group all cart quantities by base product
    const baseDemand = {};
    const baseNames = {};
    for (const item of tab.cart) {
        const pIdx = findProductIdx(item.code);
        const pData = pIdx >= 0 ? products[pIdx] : null;
        const conv = pData && pData.conversionRate ? pData.conversionRate : 1;
        const baseCode = item.code.split('-')[0];

        baseDemand[baseCode] = (baseDemand[baseCode] || 0) + (item.qty * conv);
        baseNames[baseCode] = item.name;
    }

    for (const bCode in baseDemand) {
        const bIdx = products.findIndex(p => p.code === bCode);
        const stock = bIdx >= 0 ? (products[bIdx].stock || 0) : 0;
        // Float precision fix for base quantities (e.g. 0.999999)
        if (baseDemand[bCode] > stock + 0.001) {
            exceedingBaseCode = bCode;
            requiredBase = baseDemand[bCode];
            availableBase = stock;
            exceedName = baseNames[bCode];
            break;
        }
    }

    if (exceedingBaseCode) {
        let fR = Number.isInteger(requiredBase) ? requiredBase : requiredBase.toFixed(2);
        let fA = Number.isInteger(availableBase) ? availableBase : availableBase.toFixed(2);
        showToast(`Không thể thanh toán: Vượt tồn kho. (${exceedName} yêu cầu ${fR} đơn vị cơ bản, chỉ còn ${fA})`, 'error');
        return;
    }

    const currentTotals = _getOrderTotals(tab.cart);
    if (currentTotals.grandTotal < 0) {
        showToast('Tổng tiền thanh toán không được âm.', 'error');
        return;
    }

    const overlay = document.getElementById('successOverlay');
    if (overlay) overlay.classList.add('show');

    // Check if this was a debt order for the success message
    const payInp = document.getElementById('payAmountInput');
    let paidAmt = payInp ? parseInt((payInp.value || '0').replace(/[,.]/g, '')) : 0;
    const { gross: subtotal, orderDisc: discount, grandTotal: total } = _getOrderTotals(tab.cart);

    // If paidAmt is still 0, check the latest snapshot (completedOrders[0]) for actual paid amount.
    // This handles the case where user clicked "Đủ tiền" or payment method auto-filled the amount.
    if (paidAmt === 0 && completedOrders.length > 0) {
        const latestSnap = completedOrders[0];
        if (latestSnap && latestSnap.paidAmount > 0) {
            paidAmt = latestSnap.paidAmount;
        }
    }

    // For direct sales: if paidAmt is still 0 after all fallbacks, assume full payment (no debt).
    // Real debt orders are only created when the customer explicitly underpays.
    const debt = paidAmt > 0 ? Math.max(0, total - paidAmt) : 0;

    // UPDATE CUSTOMER DEBT AND POINTS
    if (tab.customer && tab.customer.id && tab.customer.id !== 'KH000001') {
        const custIdx = customers.findIndex(c => c.id === tab.customer.id);
        if (custIdx !== -1) {
            let customerData = customers[custIdx];
            // Debt formula: New Debt = Old Debt + (Invoice Total - Paid Amount)
            // If customer overpays (paidAmt > total), old debt decreases
            customerData.debt = (customerData.debt || 0) + (total - paidAmt);

            // Calculate points: 1 point per 100,000 VND
            const earnedPoints = Math.floor(total / 100000);
            customerData.points = (customerData.points || 0) + earnedPoints;

            // Update the tab's customer reference
            tab.customer = customerData;

            saveCustomers();
        }
    }

    // --- BEGIN HASU SYNC INVOICE ---
    try {
        const isEditing = !!tab.editingInvoiceId;
        const idTs = isEditing ? tab.editingInvoiceId : Date.now();
        const docId = isEditing ? tab.editingInvoiceDocId : ('HD' + idTs.toString().slice(-6));
        const now = new Date();
        const timeStr = [("0" + now.getDate()).slice(-2), ("0" + (now.getMonth() + 1)).slice(-2), now.getFullYear()].join('/') + ' ' + [("0" + now.getHours()).slice(-2), ("0" + now.getMinutes()).slice(-2)].join(':');

        const invItems = tab.cart.map(c => {
            let iPrice = getCartItemPrice(c);
            let iTotal = getCartItemLineTotal(c);
            let iDisc = (iPrice * c.qty) - iTotal;
            return {
                sku: c.code || '',
                name: c.name || '',
                qty: c.qty,
                price: iPrice,
                discount: Math.max(0, iDisc),
                finalPrice: iTotal / c.qty,
                total: iTotal
            };
        });

        // Try to get payment method from UI 
        let payMethodStr = 'Tiền mặt';
        try {
            const activeMethodBtn = document.querySelector('.pay-method.active');
            if (activeMethodBtn) {
                const m = activeMethodBtn.dataset.method;
                if (m === 'transfer') payMethodStr = 'Chuyển khoản';
                else if (m === 'card') payMethodStr = 'Thẻ';
                else if (m === 'ewallet') payMethodStr = 'Ví điện tử';
            }
        } catch (e) { }

        const newInvoice = {
            id: idTs,
            docId: docId,
            time: timeStr,
            refReturn: '',
            cxCode: (tab.customer && tab.customer.id && tab.customer.id !== 'KH000001') ? tab.customer.id : 'KH0001',
            cxName: (tab.customer && tab.customer.name) ? tab.customer.name : 'Khách lẻ',
            subtotal: subtotal,
            discount: discount,
            finalTotal: total,
            status: debt > 0 ? 'Đang xử lý' : 'Hoàn thành',
            creator: window.saleActiveUser || 'Tester',
            seller: window.saleActiveUser || 'Tester',
            channel: 'Bán trực tiếp',
            priceList: 'Bảng giá chung',
            branch: 'BHS Bình Than',
            items: invItems,
            payments: paidAmt > 0 ? [{
                time: timeStr,
                code: 'PT' + docId.replace('HD', ''),
                method: payMethodStr,
                total: total,
                paid: paidAmt
            }] : []
        };

        const savedData = localStorage.getItem('hoadon_data');
        let invoices = [];
        if (savedData) {
            try { invoices = JSON.parse(savedData); } catch (e) { }
        }

        if (isEditing) {
            const extIdx = invoices.findIndex(x => x.id == idTs);
            if (extIdx !== -1) {
                invoices.splice(extIdx, 1);
            }
        }

        invoices.unshift(newInvoice);
        localStorage.setItem('hoadon_data', JSON.stringify(invoices));

        // --- ADDED: Push to Dashboard & Cashbook ---
        try {
            // Update hasu_sale_history for tongquan.html
            let hist = JSON.parse(localStorage.getItem('hasu_sale_history') || '[]');
            hist.unshift({
                customer: newInvoice.cxName,
                total: newInvoice.finalTotal,
                date: newInvoice.time
            });
            localStorage.setItem('hasu_sale_history', JSON.stringify(hist));

            // Update sothuchi_data for soquy.html
            let cb = JSON.parse(localStorage.getItem('sothuchi_data') || '[]');
            let ptCode = 'PT' + docId.replace('HD', '');
            let cbItemIndex = cb.findIndex(c => c.id === ptCode);
            if (cbItemIndex === -1 && paidAmt > 0) {
                cb.unshift({
                    id: ptCode,
                    time: newInvoice.time,
                    type: 'receipt',
                    category: 'Tiền thu từ bán hàng',
                    amount: paidAmt,
                    method: payMethodStr,
                    note: 'Thanh toán hóa đơn ' + docId,
                    status: 'Hoàn thành'
                });
                localStorage.setItem('sothuchi_data', JSON.stringify(cb));
            }
        } catch (ex) {
            console.error('[HASU] Dashboard Sync Error', ex);
        }
        console.log('[HASU] Saved/Updated invoice syncing to Management:', docId);
    } catch (e) {
        console.error('[HASU] Invoice Sync Error:', e);
    }
    // --- END HASU SYNC INVOICE ---


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

        if (debt > 0) {
            showToast('Tạo đơn ghi nợ thành công!', 'success');
        } else {
            showToast('Thanh toán thành công!', 'success');
        }

        // Tự động reload trang sau khi hóa đơn được hoàn tất để cập nhật nợ/điểm mới nhất
        setTimeout(() => {
            location.reload();
        }, 1500);
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
        // Payment method row — 5 methods in 2 rows
        const pmRow = document.createElement('div');
        pmRow.className = 'price-row';
        pmRow.style.cssText = 'padding:8px 0;border-top:1px solid #F0F0F0;margin-top:4px;flex-direction:column;align-items:stretch';
        pmRow.innerHTML = `
            <span class="label" style="margin-bottom:6px;font-weight:600;font-size:12px">Phương thức thanh toán</span>
            <div class="pay-methods-grid" style="display:flex;flex-wrap:wrap;gap:5px">
                <button class="pay-method-btn active" data-method="cash" onclick="selectPayMethod('cash')">
                    <i class="fas fa-money-bill-wave"></i> Tiền mặt
                </button>
                <button class="pay-method-btn" data-method="bank" onclick="selectPayMethod('bank')">
                    <i class="fas fa-university"></i> Chuyển khoản
                </button>
                <button class="pay-method-btn" data-method="card" onclick="selectPayMethod('card')">
                    <i class="fas fa-credit-card"></i> Thẻ
                </button>
                <button class="pay-method-btn" data-method="ewallet" onclick="selectPayMethod('ewallet')">
                    <i class="fas fa-wallet"></i> Ví điện tử
                </button>
                <button class="pay-method-btn" data-method="hasu" onclick="selectPayMethod('hasu')">
                    <i class="fas fa-star"></i> Ví Hasu
                </button>
            </div>
        `;

        // Cash denomination panel (shown by default since cash is default)
        const cashPanel = document.createElement('div');
        cashPanel.id = 'cashDenomPanel';
        cashPanel.className = 'pay-sub-panel';
        cashPanel.style.cssText = 'margin:6px 0 4px;padding:10px;background:#F5F7FA;border:1px solid #E0E4EA;border-radius:8px';
        cashPanel.innerHTML = `
            <div style="font-size:11px;color:#555;margin-bottom:6px"><i class="fas fa-money-bill-wave" style="margin-right:4px;color:#2E7D32"></i>Chọn mệnh giá</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
                <button class="denom-btn denom-exact" onclick="denomExact()" style="padding:5px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #2E7D32;background:#E8F5E9;color:#2E7D32">✔ Đủ tiền</button>
                <button class="denom-btn" onclick="denomSet(10000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">10.000</button>
                <button class="denom-btn" onclick="denomSet(20000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">20.000</button>
                <button class="denom-btn" onclick="denomSet(50000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">50.000</button>
                <button class="denom-btn" onclick="denomSet(100000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">100.000</button>
                <button class="denom-btn" onclick="denomSet(200000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">200.000</button>
                <button class="denom-btn" onclick="denomSet(500000)" style="padding:5px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #E0E0E0;background:#FFF;color:#333">500.000</button>
            </div>
        `;

        // QR Code panel (hidden by default, shown when bank selected)
        const qrPanel = document.createElement('div');
        qrPanel.id = 'transferQRPanel';
        qrPanel.className = 'pay-sub-panel';
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

        // E-wallet panel (Momo, ZaloPay, VNPay)
        const ewalletPanel = document.createElement('div');
        ewalletPanel.id = 'ewalletPanel';
        ewalletPanel.className = 'pay-sub-panel';
        ewalletPanel.style.cssText = 'display:none;margin:6px 0 4px;padding:12px;background:#FFF8F0;border:1px solid #FFE0B2;border-radius:8px';
        ewalletPanel.innerHTML = `
            <div style="font-size:11px;color:#E65100;margin-bottom:8px;font-weight:600">
                <i class="fas fa-wallet" style="margin-right:4px"></i>Chọn ví điện tử
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button class="ewallet-opt-btn" data-ewallet="momo" onclick="selectEwallet('momo')" style="flex:1;min-width:80px;padding:10px 8px;border-radius:8px;border:2px solid #E0E0E0;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .2s">
                    <div style="width:36px;height:36px;border-radius:50%;background:#A50064;display:flex;align-items:center;justify-content:center">
                        <span style="color:#fff;font-weight:800;font-size:11px">M</span>
                    </div>
                    <span style="font-size:11px;font-weight:600;color:#A50064">Momo</span>
                </button>
                <button class="ewallet-opt-btn" data-ewallet="zalopay" onclick="selectEwallet('zalopay')" style="flex:1;min-width:80px;padding:10px 8px;border-radius:8px;border:2px solid #E0E0E0;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .2s">
                    <div style="width:36px;height:36px;border-radius:50%;background:#0068FF;display:flex;align-items:center;justify-content:center">
                        <span style="color:#fff;font-weight:800;font-size:11px">Z</span>
                    </div>
                    <span style="font-size:11px;font-weight:600;color:#0068FF">ZaloPay</span>
                </button>
                <button class="ewallet-opt-btn" data-ewallet="vnpay" onclick="selectEwallet('vnpay')" style="flex:1;min-width:80px;padding:10px 8px;border-radius:8px;border:2px solid #E0E0E0;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .2s">
                    <div style="width:36px;height:36px;border-radius:50%;background:#D4232B;display:flex;align-items:center;justify-content:center">
                        <span style="color:#fff;font-weight:800;font-size:10px">VN</span>
                    </div>
                    <span style="font-size:11px;font-weight:600;color:#D4232B">VNPay</span>
                </button>
            </div>
            <div id="ewalletSelectedInfo" style="display:none;margin-top:8px;padding:8px;background:#fff;border-radius:6px;border:1px solid #FFE0B2;font-size:12px;text-align:center">
                <span id="ewalletSelectedName" style="font-weight:600"></span>
                <div style="margin-top:4px;font-size:11px;color:#888">Thanh toán bằng ví điện tử</div>
            </div>
        `;

        // Ví Hasu panel
        const hasuPanel = document.createElement('div');
        hasuPanel.id = 'hasuWalletPanel';
        hasuPanel.className = 'pay-sub-panel';
        hasuPanel.style.cssText = 'display:none;margin:6px 0 4px;padding:12px;background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border:1px solid #FFD54F;border-radius:8px';
        hasuPanel.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FF8F00,#FFB300);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(255,143,0,0.3)">
                    <i class="fas fa-star" style="color:#fff;font-size:14px"></i>
                </div>
                <div>
                    <div style="font-size:12px;font-weight:700;color:#E65100">Ví Hasu</div>
                    <div style="font-size:10px;color:#999">Số dư khả dụng</div>
                </div>
                <div style="margin-left:auto;text-align:right">
                    <div id="hasuBalance" style="font-size:15px;font-weight:700;color:#E65100">0đ</div>
                </div>
            </div>
            <div style="font-size:11px;color:#888;text-align:center;padding:6px;background:#fff;border-radius:6px;border:1px solid #FFE082">
                <i class="fas fa-info-circle" style="margin-right:4px;color:#FFB300"></i>
                Thanh toán bằng Ví Hasu sẽ trừ trực tiếp từ số dư ví của khách hàng
            </div>
        `;

        // Card panel
        const cardPanel = document.createElement('div');
        cardPanel.id = 'cardPanel';
        cardPanel.className = 'pay-sub-panel';
        cardPanel.style.cssText = 'display:none;margin:6px 0 4px;padding:12px;background:#F3E5F5;border:1px solid #CE93D8;border-radius:8px;text-align:center';
        cardPanel.innerHTML = `
            <div style="font-size:11px;color:#7B1FA2;font-weight:600;margin-bottom:4px">
                <i class="fas fa-credit-card" style="margin-right:4px"></i>Thanh toán bằng thẻ
            </div>
            <div style="font-size:11px;color:#888">Quẹt thẻ tại máy POS</div>
        `;

        // Pay amount row
        const payRow = document.createElement('div');
        payRow.className = 'price-row';
        payRow.id = 'payAmountRow';
        payRow.innerHTML = `<span class="label">Tiền khách trả</span><span class="flex-spacer"></span><input class="price-input" id="payAmountInput" value="0" style="text-align:right">`;

        // Insert all panels in order: method -> panels -> pay amount -> change
        priceBreakdown.insertBefore(pmRow, changeRow);
        priceBreakdown.insertBefore(cashPanel, changeRow);
        priceBreakdown.insertBefore(qrPanel, changeRow);
        priceBreakdown.insertBefore(ewalletPanel, changeRow);
        priceBreakdown.insertBefore(hasuPanel, changeRow);
        priceBreakdown.insertBefore(cardPanel, changeRow);
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

// Payment method color themes
const PAY_METHOD_THEMES = {
    cash: { bg: '#E8F5E9', border: '#2E7D32', color: '#2E7D32' },
    bank: { bg: '#E8F4FD', border: '#0090DA', color: '#0090DA' },
    card: { bg: '#F3E5F5', border: '#7B1FA2', color: '#7B1FA2' },
    ewallet: { bg: '#FFF3E0', border: '#E65100', color: '#E65100' },
    hasu: { bg: '#FFF8E1', border: '#FF8F00', color: '#FF8F00' },
};

function selectPayMethod(method) {
    const tab = getActiveTab();
    if (!tab) return;

    // Initialize payMethods array if needed
    if (!tab.payMethods) tab.payMethods = [tab.payMethod || 'cash'];

    const idx = tab.payMethods.indexOf(method);
    if (idx >= 0) {
        // Already selected → deselect (but keep at least 1)
        if (tab.payMethods.length > 1) {
            tab.payMethods.splice(idx, 1);
        } else {
            return; // can't deselect the only method
        }
    } else {
        // Add to selection
        tab.payMethods.push(method);
    }

    // Primary payMethod = first in list
    tab.payMethod = tab.payMethods[0];

    // Update button styles
    document.querySelectorAll('.pay-method-btn').forEach(btn => {
        const m = btn.dataset.method;
        const isActive = tab.payMethods.includes(m);
        const theme = PAY_METHOD_THEMES[m] || PAY_METHOD_THEMES.cash;
        btn.classList.toggle('active', isActive);
        if (isActive) {
            btn.style.background = theme.bg;
            btn.style.borderColor = theme.border;
            btn.style.color = theme.color;
        } else {
            btn.style.background = '#FFF';
            btn.style.borderColor = '#E0E0E0';
            btn.style.color = '#666';
        }
    });

    document.querySelectorAll('.pay-sub-panel').forEach(p => p.style.display = 'none');

    if (tab.payMethods.length === 1) {
        const panelMap = { cash: 'cashDenomPanel', bank: 'transferQRPanel', card: 'cardPanel', ewallet: 'ewalletPanel', hasu: 'hasuWalletPanel' };
        const panelId = panelMap[tab.payMethods[0]];
        if (panelId) { const p = document.getElementById(panelId); if (p) p.style.display = 'block'; }
        if (tab.payMethods[0] === 'bank') updateTransferQR();
        if (tab.payMethods[0] === 'hasu') updateHasuBalance();
        const splitPanel = document.getElementById('multiPaySplitPanel');
        if (splitPanel) splitPanel.style.display = 'none';
        const payRow = document.getElementById('payAmountRow');
        if (payRow) payRow.style.display = '';
    } else {
        renderSplitPanel();
        const payRow = document.getElementById('payAmountRow');
        if (payRow) payRow.style.display = 'none';
    }
}

// E-wallet sub-selection (Momo, ZaloPay, VNPay)
function selectEwallet(wallet) {
    const tab = getActiveTab();
    if (tab) tab.ewalletType = wallet;

    const names = { momo: 'Momo', zalopay: 'ZaloPay', vnpay: 'VNPay' };
    const colors = { momo: '#A50064', zalopay: '#0068FF', vnpay: '#D4232B' };

    // Update e-wallet option button styles
    document.querySelectorAll('.ewallet-opt-btn').forEach(btn => {
        const isActive = btn.dataset.ewallet === wallet;
        btn.style.borderColor = isActive ? (colors[wallet] || '#E0E0E0') : '#E0E0E0';
        btn.style.background = isActive ? (colors[wallet] + '10') : '#fff';
        btn.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
    });

    // Show selected info
    const info = document.getElementById('ewalletSelectedInfo');
    const nameEl = document.getElementById('ewalletSelectedName');
    if (info && nameEl) {
        info.style.display = 'block';
        info.style.borderColor = colors[wallet] || '#FFE0B2';
        nameEl.textContent = '✓ Đã chọn ' + (names[wallet] || wallet);
        nameEl.style.color = colors[wallet] || '#E65100';
    }
    showToast('Thanh toán bằng ' + (names[wallet] || wallet), 'success');
}

// Update Hasu wallet balance display
function updateHasuBalance() {
    const tab = getActiveTab();
    const balanceEl = document.getElementById('hasuBalance');
    if (!balanceEl) return;
    // Use customer's wallet balance if available, otherwise show 0
    const balance = (tab && tab.customer && tab.customer.hasuBalance) || 0;
    balanceEl.textContent = fmtVN(balance) + 'đ';
}

// ==================== CASH DENOMINATION BUTTONS ====================
function denomExact() {
    // Set pay amount = exact grand total (Đủ tiền)
    const total = document.getElementById('grandTotal');
    const payInput = document.getElementById('payAmountInput');
    if (total && payInput) {
        const amount = parseInt(total.textContent.replace(/[,.]/g, '')) || 0;
        payInput.value = fmtVN(amount);
        calculateTotals();
        highlightDenom(null); // highlight "Đủ tiền" button
    }
}

function denomSet(amount) {
    // Set pay amount to the chosen denomination (replace, not add)
    const payInput = document.getElementById('payAmountInput');
    if (payInput) {
        payInput.value = fmtVN(amount);
        calculateTotals();
        highlightDenom(amount);
    }
}

function highlightDenom(clickedAmount) {
    // Reset all buttons first
    document.querySelectorAll('.denom-btn').forEach(btn => {
        btn.style.background = '#FFF';
        btn.style.borderColor = '#E0E0E0';
        btn.style.color = '#333';
        btn.style.fontWeight = '';
    });
    if (clickedAmount === null) {
        // "Đủ tiền" was clicked
        const exactBtn = document.querySelector('.denom-exact');
        if (exactBtn) {
            exactBtn.style.background = '#E8F5E9';
            exactBtn.style.borderColor = '#2E7D32';
            exactBtn.style.color = '#2E7D32';
            exactBtn.style.fontWeight = '600';
        }
    } else {
        // A denomination was clicked — find and highlight it
        document.querySelectorAll('.denom-btn:not(.denom-exact)').forEach(btn => {
            if (btn.textContent.trim().replace(/\./g, '') === String(clickedAmount)) {
                btn.style.background = '#E3F2FD';
                btn.style.borderColor = '#1976D2';
                btn.style.color = '#1976D2';
                btn.style.fontWeight = '600';
            }
        });
    }
}

// ==================== SPLIT PAYMENT PANEL ====================
const PAY_METHOD_INFO = {
    cash: { icon: 'fas fa-money-bill-wave', name: 'Tiền mặt', bg: '#E8F5E9', color: '#2E7D32' },
    bank: { icon: 'fas fa-university', name: 'Chuyển khoản', bg: '#E0F2F1', color: '#00796B' },
    card: { icon: 'fas fa-credit-card', name: 'Thẻ', bg: '#F3E5F5', color: '#7B1FA2' },
    ewallet: { icon: 'fas fa-wallet', name: 'Ví điện tử', bg: '#FFF3E0', color: '#E65100' },
    hasu: { icon: 'fas fa-star', name: 'Ví Hasu', bg: '#FFF8E1', color: '#FF8F00' },
};

function renderSplitPanel() {
    const tab = getActiveTab();
    if (!tab || !tab.payMethods || tab.payMethods.length < 2) return;

    let panel = document.getElementById('multiPaySplitPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'multiPaySplitPanel';
        panel.className = 'split-pay-panel';
        const pmRow = document.querySelector('.pay-methods-grid');
        if (pmRow) {
            const parentRow = pmRow.closest('.price-row');
            if (parentRow && parentRow.nextSibling) parentRow.parentNode.insertBefore(panel, parentRow.nextSibling);
            else if (parentRow) parentRow.parentNode.appendChild(panel);
        }
    }
    panel.style.display = 'block';

    const grandTotalEl = document.getElementById('grandTotal');
    const grandTotal = grandTotalEl ? parseInt(grandTotalEl.textContent.replace(/[^0-9]/g, '') || 0) : 0;

    let rowsHtml = '';
    tab.payMethods.forEach((m) => {
        const info = PAY_METHOD_INFO[m] || PAY_METHOD_INFO.cash;
        rowsHtml += `
            <div class="split-pay-row">
                <div class="spr-icon" style="background:${info.bg};color:${info.color}"><i class="${info.icon}"></i></div>
                <span class="spr-name">${info.name}</span>
                <input class="spr-input" id="split_${m}" type="text" placeholder="0"
                    oninput="onSplitInput('${m}')" onfocus="this.select()">
            </div>`;
    });

    panel.innerHTML = `
        <div class="split-pay-header">
            <span><i class="fas fa-layer-group" style="margin-right:4px;color:#1565C0"></i>Thanh toán kết hợp</span>
            <span class="split-badge">${tab.payMethods.length} phương thức</span>
        </div>
        ${rowsHtml}
        <div class="split-progress-wrap">
            <div class="split-progress-bar"><div class="split-progress-fill" id="splitProgressFill" style="width:0%"></div></div>
            <div class="split-remaining">
                <span>Khách cần trả: <b>${fmtVN(grandTotal)}</b></span>
                <span>Còn lại: <span class="sr-val" id="splitRemainingVal">0</span></span>
            </div>
        </div>`;

    recalcSplitRemaining();
}

function onSplitInput(changedMethod) {
    recalcSplitRemaining(changedMethod);
}

function recalcSplitRemaining(changedMethod = null) {
    const tab = getActiveTab();
    if (!tab || !tab.payMethods || tab.payMethods.length < 2) return;

    const grandTotalEl = document.getElementById('grandTotal');
    const grandTotal = grandTotalEl ? parseInt(grandTotalEl.textContent.replace(/[^0-9]/g, '') || 0) : 0;

    // Auto-fill the OTHER method if there are exactly 2 methods
    if (changedMethod && tab.payMethods.length === 2) {
        const otherMethod = tab.payMethods.find(m => m !== changedMethod);
        const changedInput = document.getElementById('split_' + changedMethod);
        const otherInput = document.getElementById('split_' + otherMethod);
        if (changedInput && otherInput) {
            const changedVal = parseInt(changedInput.value.replace(/[^0-9]/g, '') || 0);
            const remainder = Math.max(0, grandTotal - changedVal);
            otherInput.value = fmtVN(remainder);
        }
    }

    let sum = 0;
    for (let i = 0; i < tab.payMethods.length; i++) {
        const inp = document.getElementById('split_' + tab.payMethods[i]);
        if (inp) {
            const val = parseInt(inp.value.replace(/[^0-9]/g, '') || 0);
            sum += val;
            if (inp.value) inp.value = fmtVN(val); // format beautifully
        }
    }

    const diff = grandTotal - sum;
    const remEl = document.getElementById('splitRemainingVal');
    if (remEl) {
        remEl.textContent = diff <= 0 ? '✓ Đủ tiền' : fmtVN(diff);
        remEl.className = 'sr-val' + (diff <= 0 ? ' exact' : '');
        remEl.style.color = diff > 0 ? '#e74c3c' : '#27ae60';
    }

    const fill = document.getElementById('splitProgressFill');
    if (fill) {
        const pct = grandTotal > 0 ? Math.min(100, (sum / grandTotal) * 100) : 100;
        fill.style.width = pct + '%';
        fill.style.background = pct >= 100 ? '#27ae60' : '#0090DA';
    }

    const payInput = document.getElementById('payAmountInput');
    if (payInput) {
        payInput.value = sum;
        calculateTotals();
    }

    if (tab.payMethods.includes('bank')) {
        updateTransferQR();
    }
}

function getPayBreakdown() {
    const tab = getActiveTab();
    if (!tab || !tab.payMethods) return [{ method: 'cash', amount: 0 }];
    if (tab.payMethods.length === 1) {
        const payInput = document.getElementById('payAmountInput');
        const amt = payInput ? parseInt((payInput.value || '0').replace(/[^0-9]/g, '')) : 0;
        return [{ method: tab.payMethods[0], amount: amt, label: (PAY_METHOD_INFO[tab.payMethods[0]] || {}).name || tab.payMethods[0] }];
    }
    return tab.payMethods.map(m => {
        const inp = document.getElementById('split_' + m);
        const amt = inp ? parseInt(inp.value.replace(/[^0-9]/g, '') || 0) : 0;
        return { method: m, amount: amt, label: (PAY_METHOD_INFO[m] || {}).name || m };
    });
}

function getTotalPaid() {
    return getPayBreakdown().reduce((s, b) => s + b.amount, 0);
}

function updateMultiPayTotal() {
    const tab = getActiveTab();
    if (!tab || !tab.payMethods) return;
    if (tab.payMethods.length >= 2) {
        recalcSplitRemaining();
    } else {
        const payInput = document.getElementById('payAmountInput');
        if (payInput) calculateTotals();
    }
}


function updateTransferQR() {
    const qrPanel = document.getElementById('transferQRPanel');
    if (!qrPanel || qrPanel.style.display === 'none') return;

    // Calculate correct bank amount: if split mode, read from split_bank, else grandTotal
    const tab = getActiveTab();
    let amount = 0;
    if (tab && tab.payMethods && tab.payMethods.length > 1 && tab.payMethods.includes('bank')) {
        const bankInp = document.getElementById('split_bank');
        amount = bankInp ? parseInt((bankInp.value || '0').replace(/[^\d]/g, '')) : 0;
    } else {
        const totalEl = document.getElementById('grandTotal');
        amount = totalEl ? parseInt((totalEl.textContent || '0').replace(/[^\d]/g, '')) : 0;
    }

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
    if (el('qrAmount')) el('qrAmount').textContent = fmtVN(amount) + 'đ';
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
            const groupedResults = getGroupedProducts(results);
            dropdown.innerHTML = groupedResults.map((p, i) => {
                const globalIdx = products.findIndex(x => x.code === p.code);
                const stockVal = p.stock || 0;
                return `<div class="search-result-item" onclick="addToCart(${globalIdx});document.getElementById('searchDropdown').style.display='none';document.querySelector('.search-wrapper input').value=''" style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #F5F5F5;font-size:13px" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'">
                    <div style="width:36px;height:36px;border-radius:4px;border:1px solid #F0F0F0;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#FAFAFA">${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">` : `<i class="far fa-image" style="color:#CCC;font-size:14px"></i>`}</div>
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name} <span style="color:#0090DA;font-size:11px;font-weight:400;background:#E8F4FD;padding:1px 6px;border-radius:3px;margin-left:4px">${p.unit || ''}</span></div>
                        <div style="font-size:11px;color:#999">${p.code}${p.barcode ? ' · ' + p.barcode : ''}</div>
                        <div style="font-size:11px;color:#888;margin-top:2px">Tồn: <b style="color:#333">${stockVal}</b> &nbsp;| Đặt NCC: <b style="color:#333">0</b> &nbsp;| KH đặt: <b style="color:#333">0</b></div>
                    </div>
                    <div style="color:#0090DA;font-weight:600;flex-shrink:0">${fmtVN(p.price)}</div>
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
                <button type="button" onclick="document.getElementById('addProductModal').remove()"
                    style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1">×</button>
            </div>
            <div style="padding:18px;display:flex;flex-direction:column;gap:13px">
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">TÊN SẢN PHẨM <span style="color:#e74c3c">*</span></label>
                    <input id="apName" type="text" value="${nameVal}" placeholder="Nhập tên sản phẩm..."
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('apBarcode').focus();}">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div>
                        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">MÃ VẠCH / BARCODE</label>
                        <input id="apBarcode" type="text" value="${bcVal}" placeholder="Nhập mã vạch..."
                            style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                            onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('apPrice').focus();}">
                    </div>
                    <div>
                        <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">ĐƠN VỊ TÍNH</label>
                        <input id="apUnit" type="text" value="Cái" placeholder="Cái, Hộp, Kg..."
                            style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none"
                            onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'"
                            onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('apPrice').focus();}">
                    </div>
                </div>
                <div>
                    <label style="font-size:12px;color:#666;display:block;margin-bottom:4px;font-weight:600">ĐƠN GIÁ BÁN <span style="color:#e74c3c">*</span></label>
                    <input id="apPrice" type="number" value="" placeholder="0"
                        style="width:100%;box-sizing:border-box;border:1px solid #DDD;border-radius:6px;padding:8px 10px;font-size:13px;outline:none;text-align:right"
                        onfocus="this.style.borderColor='#0090DA'" onblur="this.style.borderColor='#DDD'"
                        onkeydown="if(event.key==='Enter'){event.preventDefault();saveNewProduct();}">
                </div>
                <div style="color:#999;font-size:11px;background:#F9F9F9;padding:8px 10px;border-radius:6px">
                    <i class="fas fa-info-circle" style="margin-right:4px;color:#0090DA"></i>
                    Sản phẩm sẽ được thêm tạm thời vào phiên làm việc này và thêm vào giỏ hàng ngay.
                </div>
            </div>
            <div style="padding:12px 18px;border-top:1px solid #F0F0F0;display:flex;gap:8px;justify-content:flex-end">
                <button type="button" onclick="document.getElementById('addProductModal').remove()"
                    style="padding:8px 18px;border:1px solid #DDD;border-radius:6px;background:#F5F5F5;color:#555;font-size:13px;cursor:pointer">
                    Hủy
                </button>
                <button type="button" onclick="saveNewProduct()"
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

    // Persist new product to localStorage
    try {
        localStorage.setItem('hasu_products', JSON.stringify(products.map(p => ({
            code: p.code, barcode: p.barcode, name: p.name, price: p.price,
            cost: p.cost || 0, stock: p.stock, unit: p.unit, img: p.img,
            group: p.group || '', brand: p.brand || '', supplier: p.supplier || '',
            note: p.note || '', unitConversions: p.unitConversions || []
        }))));
        localStorage.setItem('hasu_global_products', JSON.stringify(products.map(p => ({
            code: p.code, barcode: p.barcode, name: p.name, price: p.price,
            costPrice: p.cost, stock: p.stock, unit: p.unit, category: p.group, img: p.img
        }))));

        // PUSH REAL-TIME API
        const apiUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + 'products_sync.php';
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                products: products.map(p => ({
                    code: p.code, barcode: p.barcode, name: p.name, price: p.price,
                    costPrice: p.cost, stock: p.stock, unit: p.unit, category: p.group, img: p.img
                }))
            })
        }).catch(err => console.error('[HASU POS] Push API from QuickAdd failed', err));
    } catch (e) { }

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
        <div class="menu-item" onclick="window.location.href='tongquan.html'" style="padding:12px 16px;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #F5F5F5" onmouseover="this.style.background='#F5F5F5'" onmouseout="this.style.background='#FFF'"><i class="fas fa-th-large" style="color:#555;width:20px;text-align:center;font-size:16px"></i> Quản lý</div>
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
        const isRet = order.returnedIndices && order.returnedIndices.includes(i);
        return `<tr style="border-bottom:1px solid #eee;${isRet ? 'opacity:0.5' : ''}">
            <td style="padding:6px 8px;font-size:13px">${item.name} ${isRet ? '<span style="color:#e53935;font-size:10px;margin-left:4px">(Đã trả)</span>' : ''}</td>
            <td style="padding:6px 8px;text-align:center;font-size:13px">${item.qty}</td>
            <td style="padding:6px 8px;text-align:right;font-size:13px">${fmt(ep)}đ</td>
            <td style="padding:6px 8px;text-align:right;font-size:13px">${fmt(lineTotal)}đ</td>
            <td style="padding:6px 8px;text-align:center">
                ${isRet ? '<span style="color:#e53935;font-size:18px;font-weight:bold">-</span>' : `<input type="checkbox" class="ret-chk" data-idx="${i}" checked style="width:16px;height:16px;cursor:pointer">`}
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

        const returnItems = checked.map(i => order.cart[i]);

        order.returnedIndices = order.returnedIndices || [];
        order.returnedIndices.push(...checked);
        let allOrders = JSON.parse(localStorage.getItem('hasu_completedOrders') || '[]');
        let orderIdx = allOrders.findIndex(o => o.id === order.id);
        if (orderIdx > -1) {
            allOrders[orderIdx] = order;
            try { localStorage.setItem('hasu_completedOrders', JSON.stringify(allOrders)); } catch (e) { }
        }

        // --- ADDED: Ghi đè vào Lịch sử và Sổ Quỹ ---
        let returnTotal = 0;
        returnItems.forEach(item => {
            const ep = (item.customPrice !== null && item.customPrice !== undefined) ? item.customPrice : item.price;
            returnTotal += ep * item.qty;
        });

        const today = new Date();
        const pad = n => String(n).padStart(2, '0');
        const timeStr = today.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + pad(today.getDate()) + '/' + pad(today.getMonth() + 1) + '/' + today.getFullYear();

        try {
            // Cập nhật Lịch sử Doanh thu (số âm)
            let hist = JSON.parse(localStorage.getItem('hasu_sale_history') || '[]');
            hist.unshift({
                id: 'TH' + Date.now().toString().slice(-8),
                type: 'return',
                customer: order.customer ? order.customer.name : 'Khách lẻ',
                total: -returnTotal,
                date: timeStr,
                note: 'Hoàn trả mặt hàng'
            });
            localStorage.setItem('hasu_sale_history', JSON.stringify(hist));

            // Sinh Log Danh Sách Đơn Trả Hàng (trahang.html)
            let returnsList = JSON.parse(localStorage.getItem('returns') || '[]');
            returnsList.unshift({
                id: 'TH' + Date.now().toString().slice(-8),
                time: timeStr,
                customerCode: order.customer ? order.customer.id : '',
                customer: order.customer ? order.customer.name : 'Khách lẻ',
                total: returnTotal,
                paid: returnTotal,
                status: 'Hoàn thành',
                creator: 'Admin',
                assignee: 'Admin',
                items: returnItems.map(it => ({
                    code: it.code,
                    name: it.name,
                    qty: it.qty,
                    price: (it.customPrice !== null && it.customPrice !== undefined) ? it.customPrice : it.price,
                    discount: it.discAmt || 0,
                    subtotal: ((it.customPrice !== null && it.customPrice !== undefined) ? it.customPrice : it.price) * it.qty
                }))
            });
            localStorage.setItem('returns', JSON.stringify(returnsList));

            // Sinh Phiếu Chi trên Sổ thu chi
            let cb = JSON.parse(localStorage.getItem('sothuchi_data') || '[]');
            cb.unshift({
                id: 'PC' + Date.now().toString().slice(-8),
                time: timeStr,
                type: 'payment',
                category: 'Hoàn tiền trả hàng',
                amount: returnTotal,
                method: order.payMethod === 'card' ? 'Thẻ' : (order.payMethod === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'),
                note: 'Hoàn tiền hóa đơn ' + order.id,
                status: 'Hoàn thành'
            });
            localStorage.setItem('sothuchi_data', JSON.stringify(cb));
        } catch (e) { console.error('[HASU] Return Logging Error', e); }
        // -------------------------------------------

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
    const { gross: subtotal, orderDisc: discount, grandTotal } = _getOrderTotals(cart);

    const now = new Date();
    const invoiceNo = 'HD' + Date.now().toString().slice(-8);
    const dateStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const customer = tab.customer ? tab.customer.name : 'Kh\u00e1ch l\u1ebb';
    const cashier = activeStaffId ? (staffList.find(s => s.id === activeStaffId)?.name || 'NV') : 'NV';
    const _pmMap = { cash: 'Ti\u1ec1n m\u1eb7t', bank: 'Chuy\u1ec3n kho\u1ea3n', card: 'Th\u1ebb', ewallet: 'V\u00ed \u0111i\u1ec7n t\u1eed', hasu: 'V\u00ed Hasu' };
    const payMethod = _pmMap[tab.payMethod] || 'Ti\u1ec1n m\u1eb7t';
    const paid = parseInt((document.getElementById('payAmountInput')?.value || '0').replace(/[,.]/g, ''));
    const change = paid > grandTotal ? paid - grandTotal : 0;
    const debt = (paid > 0 && paid < grandTotal) ? grandTotal - paid : 0;

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
    if (debt > 0) {
        totals += '<div class="tot-line" style="color:#C62828;font-weight:700"><span>C\u00f2n n\u1ee3:</span><span>' + fmt(debt) + '</span></div>';
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
    const SCAN_THRESHOLD = 35;  // Max ms between keypresses for scanner input (reduced from 150 to prevent deleting fast human typing)
    const SCAN_TIMEOUT = 600;    // Reset buffer after this ms of inactivity
    let scanTimer = null;
    let rapidCount = 0;          // Count of consecutive rapid keypresses

    document.addEventListener('keydown', function (e) {
        const tag = e.target.tagName;
        const searchInput = document.querySelector('.sale-toolbar .search-wrapper input');
        const isSearchInput = e.target === searchInput;
        const isOtherInput = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') && !isSearchInput;

        // Don't intercept when typing in non-search inputs
        if (isOtherInput) return;

        const now = Date.now();
        const timeDiff = now - lastKeyTime;
        lastKeyTime = now;

        // Clear timer
        if (scanTimer) clearTimeout(scanTimer);

        // Handle Enter — process the scanned barcode
        if (e.key === 'Enter' && barcodeBuf.length >= 6) {
            e.preventDefault();
            const scannedCode = barcodeBuf.trim();
            barcodeBuf = '';
            rapidCount = 0;

            // Clear anything that leaked into search input
            if (searchInput) searchInput.value = '';

            // Find product by barcode (exact match first, then partial)
            let productIdx = products.findIndex(p => p.barcode === scannedCode);
            if (productIdx === -1) {
                // Try matching by code
                productIdx = products.findIndex(p => p.code === scannedCode);
            }
            if (productIdx === -1) {
                // Try partial barcode match (in case barcode has suffix like -1, -2)
                productIdx = products.findIndex(p => p.barcode && p.barcode.startsWith(scannedCode));
            }
            if (productIdx === -1) {
                productIdx = products.findIndex(p => p.barcode && p.barcode.includes(scannedCode));
            }

            if (productIdx >= 0) {
                // AUTO-ADD to cart immediately
                addToCart(productIdx);
                showToast('Đã thêm: ' + products[productIdx].name, 'success');
            } else {
                // Product not found — show barcode in search for manual lookup
                if (searchInput) {
                    searchInput.value = scannedCode;
                    searchInput.focus();
                    const evt = new Event('input', { bubbles: true });
                    searchInput.dispatchEvent(evt);
                }
                showToast('Không tìm thấy SP với mã: ' + scannedCode, 'error');
            }
            return;
        }

        // Build buffer from rapid keypresses (scanner fires keys very fast)
        if (e.key.length === 1) {
            const isRapid = (timeDiff < SCAN_THRESHOLD);

            if (isRapid || barcodeBuf.length === 0) {
                barcodeBuf += e.key;
                if (isRapid) rapidCount++;

                // After 2+ rapid chars in a row, we know it's a scanner
                // Block ALL chars from going into search input to prevent partial display
                if (rapidCount >= 2) {
                    e.preventDefault();
                    // Also clear any chars that already leaked into search input
                    if (isSearchInput && searchInput) {
                        setTimeout(() => { searchInput.value = ''; }, 0);
                    }
                }
            } else {
                // Too slow — user is typing manually, reset buffer
                barcodeBuf = e.key;
                rapidCount = 0;
            }
        }

        // Auto-clear buffer after inactivity
        scanTimer = setTimeout(() => { barcodeBuf = ''; rapidCount = 0; }, SCAN_TIMEOUT);
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
function renderBaoCaoSummary() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');

    let totalInvoices = 0;
    let totalRevenue = 0;
    let cash = 0, transfer = 0, card = 0, ewallet = 0;
    let totalDiscount = 0;

    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    completedOrders.forEach(o => {
        const orderDateObj = new Date(o.time || o.createdAt);
        if (orderDateObj.getFullYear() === y && orderDateObj.getMonth() === m && orderDateObj.getDate() === d) {
            totalInvoices++;
            const gTotal = parseInt(o.grandTotal) || 0;
            totalRevenue += gTotal;
            totalDiscount += parseInt(o.discount) || 0;

            const method = o.payMethod || 'cash';
            if (method === 'cash') cash += gTotal;
            else if (method === 'bank') transfer += gTotal;
            else if (method === 'card') card += gTotal;
            else if (method === 'ewallet' || method === 'hasu') ewallet += gTotal;
            else if (method === 'combined' && o.payBreakdown) {
                o.payBreakdown.forEach(p => {
                    const pam = parseInt(p.amount) || 0;
                    if (p.method === 'cash') cash += pam;
                    else if (p.method === 'bank') transfer += pam;
                    else if (p.method === 'card') card += pam;
                    else if (p.method === 'ewallet' || p.method === 'hasu') ewallet += pam;
                });
            }
        }
    });

    const fmt = n => Number(Math.round(n)).toLocaleString('vi-VN');
    const safeCash = cash > 0 ? cash : 0; // Prevent showing negative in drawer if not handled

    return `
        <div style="text-align:center;color:#666;padding:20px;border:1px solid #eee;border-radius:8px">
            <h4 style="margin:0 0 16px">Báo cáo cuối ngày - ${dateStr}</h4>
            <table style="width:100%;text-align:left;border-collapse:collapse;font-size:13px">
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Tổng số hóa đơn</td><td style="padding:10px;font-weight:600;text-align:right">${totalInvoices}</td></tr>
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Tổng doanh thu</td><td style="padding:10px;font-weight:600;text-align:right;color:#0090DA">${fmt(totalRevenue)}</td></tr>
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Tiền mặt</td><td style="padding:10px;text-align:right">${fmt(cash)}</td></tr>
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Chuyển khoản</td><td style="padding:10px;text-align:right">${fmt(transfer)}</td></tr>
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Thẻ</td><td style="padding:10px;text-align:right">${fmt(card)}</td></tr>
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Ví điện tử / Điểm</td><td style="padding:10px;text-align:right">${fmt(ewallet)}</td></tr>
                <tr style="border-bottom:1px solid #eee"><td style="padding:10px;color:#666">Giảm giá</td><td style="padding:10px;text-align:right">${fmt(totalDiscount)}</td></tr>
                <tr><td style="padding:10px;color:#666;font-weight:600">Tiền mặt trong két</td><td style="padding:10px;font-weight:600;text-align:right;color:#27ae60">${fmt(safeCash)}</td></tr>
            </table>
        </div>`;
}

function openBaoCaoCuoiNgay() {
    document.getElementById('menuDropdown').style.display = 'none';
    const content = `
        <div style="margin-bottom:16px;display:flex;gap:12px">
            <button class="report-tab active" onclick="switchReportTab(this,'summary')" style="padding:8px 16px;border:1px solid #0090DA;background:#E8F4FD;color:#0090DA;border-radius:4px;cursor:pointer;font-size:13px">Tổng hợp</button>
            <button class="report-tab" onclick="switchReportTab(this,'products')" style="padding:8px 16px;border:1px solid #ddd;background:#fff;color:#666;border-radius:4px;cursor:pointer;font-size:13px">Hàng hóa</button>
            <button class="report-tab" onclick="switchReportTab(this,'cashflow')" style="padding:8px 16px;border:1px solid #ddd;background:#fff;color:#666;border-radius:4px;cursor:pointer;font-size:13px">Thu chi</button>
        </div>
        <div id="reportContent">
            ${renderBaoCaoSummary()}
        </div>`;
    openModal('Báo cáo cuối ngày', content, '600px');
}

function renderBaoCaoProducts() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN');
    let productMap = {};

    completedOrders.forEach(o => {
        const orderDate = new Date(o.time || o.createdAt).toLocaleDateString('vi-VN');
        if (orderDate === dateStr && o.cart) {
            o.cart.forEach(item => {
                if (!productMap[item.code]) {
                    productMap[item.code] = { name: item.name, qty: 0, revenue: 0 };
                }
                productMap[item.code].qty += item.qty;
                productMap[item.code].revenue += item.qty * item.price;
            });
        }
    });

    const products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    if (products.length === 0) {
        return '<div style="text-align:center;padding:40px;color:#999"><i class="fas fa-box" style="font-size:40px;margin-bottom:12px"></i><p>Chưa có dữ liệu hàng hóa bán ra hôm nay</p></div>';
    }

    const fmt = n => Number(Math.round(n)).toLocaleString('vi-VN');
    const rows = products.map(p => `
        <tr style="border-bottom:1px solid #eee">
            <td style="padding:10px;color:#333">${p.name}</td>
            <td style="padding:10px;text-align:center">${p.qty}</td>
            <td style="padding:10px;text-align:right;color:#0090DA">${fmt(p.revenue)}</td>
        </tr>
    `).join('');

    return `
        <div style="padding:0;border:1px solid #eee;border-radius:8px;max-height:300px;overflow-y:auto">
            <table style="width:100%;text-align:left;border-collapse:collapse;font-size:13px">
                <thead style="background:#F5F5F5;position:sticky;top:0">
                    <tr>
                        <th style="padding:10px;color:#666">Tên hàng</th>
                        <th style="padding:10px;text-align:center;color:#666">SL</th>
                        <th style="padding:10px;text-align:right;color:#666">Doanh thu</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function switchReportTab(btn, tab) {
    document.querySelectorAll('.report-tab').forEach(b => { b.style.background = '#fff'; b.style.color = '#666'; b.style.borderColor = '#ddd'; });
    btn.style.background = '#E8F4FD'; btn.style.color = '#0090DA'; btn.style.borderColor = '#0090DA';
    const content = document.getElementById('reportContent');
    if (tab === 'products') {
        content.innerHTML = renderBaoCaoProducts();
    } else if (tab === 'cashflow') {
        content.innerHTML = '<div style="text-align:center;padding:40px;color:#999"><i class="fas fa-wallet" style="font-size:40px;margin-bottom:12px"></i><p>Chưa có phiếu thu/chi hôm nay</p></div>';
    } else {
        content.innerHTML = renderBaoCaoSummary();
    }
}

// ==================== 2. XỬ LÝ ĐẶT HÀNG ====================
function renderDatHangRows(list, searchStr) {
    const s = searchStr.toLowerCase();
    const filtered = list.filter(o =>
        (o.id || '').toLowerCase().includes(s) ||
        (o.customer || '').toLowerCase().includes(s) ||
        (o.phone || '').includes(s)
    );
    if (filtered.length === 0) {
        return `<tr><td colspan="5" style="padding:40px;text-align:center;color:#999"><i class="fas fa-inbox" style="font-size:40px;margin-bottom:12px;display:block"></i>Không tìm thấy đơn đặt hàng</td></tr>`;
    }
    const fmt = n => Number(Math.round(n)).toLocaleString('vi-VN');
    return filtered.map(o => {
        const timeStr = new Date(o.createdAt || o.time || Date.now()).toLocaleString('vi-VN');
        return `
        <tr style="border-bottom:1px solid #F5F5F5;font-size:13px">
            <td style="padding:10px;color:#0090DA;font-weight:500">${o.id}</td>
            <td style="padding:10px;color:#555">${timeStr}</td>
            <td style="padding:10px;color:#333">${o.customer} ${o.phone ? '<br><small style="color:#888">' + o.phone + '</small>' : ''}</td>
            <td style="padding:10px;text-align:right;font-weight:600">${fmt(o.total)}</td>
            <td style="padding:10px;text-align:center">
                <span style="padding:4px 8px;border-radius:4px;font-size:11px;background:${o.status === 'Chờ xử lý' ? '#FFF3E0;color:#F57C00' : '#E8F5E9;color:#2E7D32'}">${o.status || 'Chờ xử lý'}</span>
            </td>
        </tr>`;
    }).join('');
}

function openXuLyDatHang() {
    document.getElementById('menuDropdown').style.display = 'none';
    let bookedOrders = [];
    try {
        bookedOrders = JSON.parse(localStorage.getItem('_hasu_booked_orders') || '[]');
    } catch (e) { }

    bookedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    window._cachedBookedOrders = bookedOrders;

    const content = `
        <div style="display:flex;gap:12px;margin-bottom:16px">
            <input type="text" id="searchDatHangInput" placeholder="Tìm mã đặt hàng, khách hàng..." style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px" oninput="document.getElementById('datHangTbody').innerHTML=renderDatHangRows(window._cachedBookedOrders, this.value)">
            <input type="date" style="padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px">
            <input type="date" style="padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px">
            <button style="padding:8px 16px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer"><i class="fas fa-search"></i></button>
        </div>
        <div style="max-height:400px;overflow-y:auto;border:1px solid #eee;border-radius:6px">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead style="background:#F5F5F5;position:sticky;top:0"><tr>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Mã đặt hàng</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Thời gian</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Khách hàng</th>
                    <th style="padding:10px;text-align:right;border-bottom:2px solid #E0E0E0">Tổng tiền</th>
                    <th style="padding:10px;text-align:center;border-bottom:2px solid #E0E0E0">Trạng thái</th>
                </tr></thead>
                <tbody id="datHangTbody">${renderDatHangRows(bookedOrders, '')}</tbody>
            </table>
        </div>`;
    openModal('Xử lý đặt hàng', content, '800px');
}

// ==================== 3. CHỌN HÓA ĐƠN TRẢ HÀNG ====================
function renderTraHangRows(list, searchStr) {
    const s = searchStr.toLowerCase();
    const filtered = list.filter(o =>
        (o.id || '').toLowerCase().includes(s) ||
        (o.customer?.name || 'Khách lẻ').toLowerCase().includes(s)
    );
    if (filtered.length === 0) {
        return `<tr><td colspan="5" style="padding:40px;text-align:center;color:#999"><i class="fas fa-file-invoice" style="font-size:40px;margin-bottom:12px;display:block"></i>Không tìm thấy hóa đơn phù hợp</td></tr>`;
    }
    const fmt = n => Number(Math.round(n)).toLocaleString('vi-VN');
    return filtered.map(o => {
        const timeStr = o.time ? new Date(o.time).toLocaleString('vi-VN') : '';
        const custName = o.customer ? o.customer.name : 'Khách lẻ';
        return `
        <tr style="border-bottom:1px solid #F5F5F5;font-size:13px">
            <td style="padding:10px;color:#0090DA;font-weight:500">${o.id}</td>
            <td style="padding:10px;color:#555">${timeStr}</td>
            <td style="padding:10px;color:#333">${custName}</td>
            <td style="padding:10px;text-align:right;font-weight:600">${fmt(o.grandTotal || o.total || 0)}</td>
            <td style="padding:10px;text-align:center">
                <button onclick="selectReturnInvoice('${o.id}')" style="padding:5px 14px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">Chọn</button>
            </td>
        </tr>`;
    }).join('');
}

function openTraHang() {
    document.getElementById('menuDropdown').style.display = 'none';
    window._cachedReturnOrders = completedOrders;

    const content = `
        <div style="display:flex;gap:12px;margin-bottom:16px">
            <input type="text" id="searchTraHangInput" placeholder="Tìm mã hóa đơn, tên khách hàng..." style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:13px" oninput="document.getElementById('traHangTbody').innerHTML=renderTraHangRows(window._cachedReturnOrders, this.value)">
            <button style="padding:8px 16px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer" onclick="document.getElementById('traHangTbody').innerHTML=renderTraHangRows(window._cachedReturnOrders, document.getElementById('searchTraHangInput').value)"><i class="fas fa-search"></i> Tìm</button>
        </div>
        <div style="max-height:400px;overflow-y:auto;border:1px solid #eee;border-radius:6px">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
                <thead style="background:#F5F5F5;position:sticky;top:0"><tr>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Mã hóa đơn</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Thời gian</th>
                    <th style="padding:10px;text-align:left;border-bottom:2px solid #E0E0E0">Khách hàng</th>
                    <th style="padding:10px;text-align:right;border-bottom:2px solid #E0E0E0">Tổng tiền</th>
                    <th style="padding:10px;text-align:center;border-bottom:2px solid #E0E0E0">Thao tác</th>
                </tr></thead>
                <tbody id="traHangTbody">${renderTraHangRows(completedOrders, '')}</tbody>
            </table>
        </div>`;
    openModal('Chọn hóa đơn trả hàng', content, '800px');
}

function selectReturnInvoice(docId) {
    const order = window._cachedReturnOrders.find(o => o.id === docId);
    if (!order) {
        showToast('Không tìm thấy hóa đơn!', 'error');
        return;
    }

    const tab = getActiveTab();
    if (tab.cart.length > 0) {
        if (!confirm('Giỏ hàng hiện tại không trống. Bạn có muốn thay thế giỏ hàng bằng hóa đơn trả hàng này không?')) return;
    }

    // Load products with negative quantity to simulate a return (refund)
    tab.cart = order.cart.map(c => {
        const retItem = { ...c };
        retItem.qty = -Math.abs(c.qty || 1);
        return retItem;
    });

    if (order.customer) {
        tab.customer = { ...order.customer };
    }

    tab.note = 'Trả hàng Hóa đơn: ' + docId;

    closeModal();
    renderCart();
    calculateTotals();
    renderTabs();
    showToast('Đã tải hóa đơn ' + docId + ' để xử lý trả hàng', 'success');
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

    if (!tab || tab.cart.length === 0) {
        closeModal();
        showToast('Vui lòng thêm sản phẩm vào màn hình Thu Ngân trước khi Tạo Đơn!', 'error');
        return;
    }

    const customerName = tab && tab.customer ? tab.customer.name : 'Khách lẻ';
    const cartHtml = tab.cart.map((item, i) => `
                    <tr style="border-bottom:1px solid #F0F0F0">
                        <td style="padding:6px 8px;font-size:12px">${i + 1}</td>
                        <td style="padding:6px 8px;font-size:12px">${item.name}</td>
                        <td style="padding:6px 8px;text-align:center;font-size:12px">${item.qty}</td>
                        <td style="padding:6px 8px;text-align:right;font-size:12px">${fmtVN(item.price)}</td>
                    </tr>
                    `).join('');

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

    // Load fresh data from localStorage
    let currentBookedOrders = [];
    try {
        currentBookedOrders = JSON.parse(localStorage.getItem('_hasu_booked_orders') || '[]');
        // Sort newest first
        currentBookedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (e) {
        console.error(e);
    }

    const fmt = n => fmtVN(n);
    const statusColors = { 'Chờ xử lý': '#f39c12', 'Đang giao': '#3498db', 'Hoàn thành': '#27ae60', 'Đã hủy': '#e74c3c' };
    const rows = currentBookedOrders.length > 0
        ? currentBookedOrders.map((o, i) => `
                    <tr style="border-bottom:1px solid #F0F0F0">
                        <td style="padding:8px;font-size:12px;color:#0090DA;font-weight:600">${o.id}</td>
                        <td style="padding:8px;font-size:12px">${o.customer}</td>
                        <td style="padding:8px;font-size:12px">${o.phone || '-'}</td>
                        <td style="padding:8px;font-size:12px">${o.date || '-'}</td>
                        <td style="padding:8px;text-align:right;font-size:12px;font-weight:600">${fmt(o.total)}</td>
                        <td style="padding:8px"><span style="padding:3px 8px;border-radius:10px;font-size:10px;font-weight:600;color:#fff;background:${statusColors[o.status] || '#999'}">${o.status}</span></td>
                        <td style="padding:8px">
                            <button onclick="updateBookedStatus('${o.id}','Đang giao')" style="font-size:10px;padding:3px 6px;cursor:pointer;border:1px solid #3498db;background:#EBF5FB;color:#3498db;border-radius:3px;margin-right:2px" title="Đang giao">📦</button>
                            <button onclick="updateBookedStatus('${o.id}','Hoàn thành')" style="font-size:10px;padding:3px 6px;cursor:pointer;border:1px solid #27ae60;background:#E8F8F5;color:#27ae60;border-radius:3px;margin-right:2px" title="Hoàn thành">✓</button>
                            <button onclick="updateBookedStatus('${o.id}','Đã hủy')" style="font-size:10px;padding:3px 6px;cursor:pointer;border:1px solid #e74c3c;background:#FDEDEC;color:#e74c3c;border-radius:3px" title="Hủy">✗</button>
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

function updateBookedStatus(orderId, status) {
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('_hasu_booked_orders') || '[]');
    } catch (e) { }

    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        localStorage.setItem('_hasu_booked_orders', JSON.stringify(orders));
        showToast(`Đã cập nhật: ${orderId} → ${status}`, 'success');
        openQuanLyDatHang(); // refresh
    }
}

// ==================== COLUMN VISIBILITY SETTINGS (Row 28) ====================
const _defaultColVis = { stt: true, hinhanh: true, tenHang: true, maHang: true, dvt: true, sl: true, giaVon: false, giaBan: true, giamGia: true, thanhTien: true, chinhSuaThanhTien: true, xemGiaBanGanNhat: true, goiYKhachThanhToan: true, themDong: true, goiYLoHSD: true, chonNhieuHangHoa: true };
let _discTypeVND = true; // VND or %

function getColVis() {
    try {
        const saved = localStorage.getItem('hasu_col_vis');
        return saved ? { ..._defaultColVis, ...JSON.parse(saved) } : { ..._defaultColVis };
    } catch { return { ..._defaultColVis }; }
}

function openColumnSettings() {
    // Remove existing
    const existing = document.getElementById('tlSettingsOverlay');
    if (existing) { existing.remove(); return; }

    const vis = getColVis();
    const mkToggle = (key, label, info) => `
                    <div class="tl-row">
                        <span class="tl-row-label">${label}${info ? ' <span class="tl-info">i</span>' : ''}</span>
                        <label class="tl-toggle"><input type="checkbox" data-col="${key}" ${vis[key] ? 'checked' : ''} onchange="autoSaveColVis()"><span class="tl-slider"></span></label>
                    </div>`;

    const overlay = document.createElement('div');
    overlay.id = 'tlSettingsOverlay';
    overlay.className = 'tl-overlay';
    overlay.innerHTML = `
                    <div class="tl-panel">
                        <div class="tl-header">
                            <h3>Thiết lập</h3>
                            <button class="tl-close" onclick="document.getElementById('tlSettingsOverlay').remove()">&times;</button>
                        </div>
                        <div class="tl-tabs">
                            <button class="tl-tab active" data-tab="hienthi" onclick="switchTLTab(this,'hienthi')">Hiển thị</button>
                            <button class="tl-tab" data-tab="khac" onclick="switchTLTab(this,'khac')">Khác</button>
                        </div>
                        <div class="tl-body">
                            <div class="tl-section active" id="tlTabHienThi">
                                ${mkToggle('stt', 'Số thứ tự')}
                                ${mkToggle('hinhanh', 'Ảnh hàng hóa')}
                                ${mkToggle('maHang', 'Mã hàng')}
                                ${mkToggle('giaBan', 'Giá bán')}
                                <div class="tl-row">
                                    <span class="tl-row-label">Giảm giá <span class="tl-info">i</span></span>
                                    <div style="display:flex;align-items:center;gap:8px">
                                        <div class="tl-disc-type">
                                            <button class="${_discTypeVND ? 'active' : ''}" onclick="setDiscType(true,this)">VNĐ</button>
                                            <button class="${!_discTypeVND ? 'active' : ''}" onclick="setDiscType(false,this)">%</button>
                                        </div>
                                        <label class="tl-toggle"><input type="checkbox" data-col="giamGia" ${vis.giamGia ? 'checked' : ''} onchange="autoSaveColVis()"><span class="tl-slider"></span></label>
                                    </div>
                                </div>
                                ${mkToggle('thanhTien', 'Thành tiền')}
                                ${mkToggle('chinhSuaThanhTien', 'Chỉnh sửa thành tiền')}
                                ${mkToggle('xemGiaBanGanNhat', 'Xem giá bán gần nhất <span class="tl-info">i</span>')}
                                ${mkToggle('goiYKhachThanhToan', 'Gợi ý khách thanh toán')}
                                ${mkToggle('themDong', 'Thêm dòng <span class="tl-info">i</span>')}
                                ${mkToggle('goiYLoHSD', 'Gợi ý Lô - Hạn sử dụng')}
                                ${mkToggle('chonNhieuHangHoa', 'Chế độ chọn nhiều hàng hóa')}
                            </div>
                            <div class="tl-section" id="tlTabKhac">
                                ${mkToggle('autoFocusBarcode', 'Tự động focus ô quét mã')}
                                ${mkToggle('soundOnScan', 'Âm thanh khi quét mã')}
                                ${mkToggle('autoIn', 'Tự động in sau thanh toán')}
                                ${mkToggle('gopHang', 'Gộp hàng cùng loại')}
                            </div>
                        </div>
                    </div>`;

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
}

function switchTLTab(btn, tab) {
    document.querySelectorAll('.tl-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tl-section').forEach(s => s.classList.remove('active'));
    document.getElementById(tab === 'hienthi' ? 'tlTabHienThi' : 'tlTabKhac').classList.add('active');
}

function setDiscType(isVND, btn) {
    _discTypeVND = isVND;
    const parent = btn.closest('.tl-disc-type');
    parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    localStorage.setItem('hasu_disc_type_vnd', isVND ? '1' : '0');
}

function autoSaveColVis() {
    const vis = {};
    document.querySelectorAll('#tlSettingsOverlay input[data-col]').forEach(cb => {
        vis[cb.dataset.col] = cb.checked;
    });
    localStorage.setItem('hasu_col_vis', JSON.stringify(vis));
    if (typeof renderCart === 'function') renderCart();
}

function saveColumnSettings() {
    autoSaveColVis();
    const overlay = document.getElementById('tlSettingsOverlay');
    if (overlay) overlay.remove();
    showToast('Đã lưu thiết lập hiển thị', 'success');
}

// ==================== LOCALSTORAGE PERSISTENCE (Row 26) ====================

function initLocalDB() {
    // Sync products from VPS realtime API (products_sync.php) First
    try {
        var xhr = new XMLHttpRequest();
        var apiUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + 'products_sync.php';
        xhr.open('GET', apiUrl + '?t=' + Date.now(), false);
        xhr.send(null);
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if (data && data.ok && Array.isArray(data.products) && data.products.length > 0) {
                // Merge data into products array, replacing existing or prepending new
                data.products.forEach(sp => {
                    const existing = products.find(x => x.code === sp.code);
                    if (existing) {
                        Object.assign(existing, sp);
                    } else {
                        products.unshift(sp);
                    }
                });
                console.log('[HASU] Core Sales loaded', data.products.length, 'products from VPS API');
            }
        }
    } catch (e) {
        console.warn('[HASU] Real-time API load failed on POS, fallback to local', e);
    }

    // Sync products to localStorage on first load (Fallback/Cache)
    if (!localStorage.getItem('hasu_products_init')) {
        localStorage.setItem('hasu_products', JSON.stringify(products.map(p => ({
            code: p.code, barcode: p.barcode, name: p.name, price: p.price,
            cost: p.cost || 0, stock: p.stock, unit: p.unit, img: p.img,
            group: p.group || '', brand: p.brand || '', supplier: p.supplier || '',
            note: p.note || '', unitConversions: p.unitConversions || []
        }))));
        localStorage.setItem('hasu_products_init', '1');
    }
    // Load saved data into products array (if sync failed or offline)
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
        // Add any new products that were created in management page (offline cache overlap)
        saved.forEach(sp => {
            if (!products.find(x => x.code === sp.code)) {
                products.unshift(sp);
            }
        });
    } catch { }

    // ===== Cross-module sync: merge products from hanghoa.html (management page) =====
    try {
        const globalRaw = localStorage.getItem('hasu_global_products');
        if (globalRaw) {
            const globalProducts = JSON.parse(globalRaw);
            if (Array.isArray(globalProducts) && globalProducts.length > 0) {
                let addedCount = 0;
                globalProducts.forEach(gp => {
                    const existing = products.find(x => x.code === gp.code);
                    if (existing) {
                        // Update fields from management
                        if (gp.name) existing.name = gp.name;
                        if (gp.price !== undefined) existing.price = gp.price;
                        if (gp.costPrice !== undefined) existing.cost = gp.costPrice;
                        if (gp.stock !== undefined) existing.stock = gp.stock;
                        if (gp.unit) existing.unit = gp.unit;
                        if (gp.barcode) existing.barcode = gp.barcode;
                        if (gp.img) existing.img = gp.img;
                        if (gp.category) existing.group = gp.category;
                        if (gp.baseUnitCode) existing.baseUnitCode = gp.baseUnitCode;
                        if (gp.conversionRate) existing.conversionRate = gp.conversionRate;
                        if (gp.active === false) existing.active = false;
                    } else {
                        // New product from management — add to POS
                        products.unshift({
                            code: gp.code,
                            barcode: gp.barcode || '',
                            name: gp.name || 'Sản phẩm mới',
                            price: gp.price || 0,
                            cost: gp.costPrice || 0,
                            stock: gp.stock || 0,
                            unit: gp.unit || 'Cái',
                            img: gp.img || '',
                            group: gp.category || '',
                            brand: '',
                            supplier: '',
                            note: gp.description || '',
                            baseUnitCode: gp.baseUnitCode || null,
                            conversionRate: gp.conversionRate || 1,
                            active: gp.active !== false,
                            directSale: gp.directSale !== false
                        });
                        addedCount++;
                    }
                });
                if (addedCount > 0) {
                    console.log('[HASU-POS] Merged', addedCount, 'new products from management');
                }
            }
        }
    } catch (e) {
        console.warn('[HASU-POS] Could not merge global products:', e);
    }

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

    // ===== Cross-module sync: write back to hasu_global_products for management page =====
    try {
        const exported = products.map(p => ({
            code: p.code,
            barcode: p.barcode,
            name: p.name,
            price: p.price,
            costPrice: p.cost || 0,
            stock: p.stock,
            unit: p.unit,
            category: p.group || '',
            img: p.img || '',
            baseUnitCode: p.baseUnitCode || null,
            conversionRate: p.conversionRate || 1,
            active: p.active !== false,
            directSale: p.directSale !== false
        }));
        localStorage.setItem('hasu_global_products', JSON.stringify(exported));
    } catch (e) {
        console.warn('[HASU-POS] Could not sync to hasu_global_products:', e);
    }
}

function deductStock(cart) {
    cart.forEach(item => {
        const itemP = products.find(x => x.code === item.code);
        if (!itemP) return;

        const factor = item.units ? (item.units.find(u => u.name === item.selectedUnit)?.factor || 1) : 1;

        let baseP = itemP;
        if (itemP.baseUnitCode) {
            baseP = products.find(x => x.code === itemP.baseUnitCode || x.barcode === itemP.baseUnitCode) || itemP;
        }

        const totalDeduct = item.qty * factor;
        baseP.stock = Math.max(0, (baseP.stock || 0) - totalDeduct);

        // Propagate the proportionally adjusted base stock to all dependent variants
        products.forEach(v => {
            if (v.baseUnitCode === baseP.code || v.baseUnitCode === baseP.barcode) {
                const vRate = v.conversionRate || 1;
                v.stock = Number((baseP.stock / vRate).toFixed(3));
            }
        });
    });

    if (typeof saveLocalDB === 'function') saveLocalDB();
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

    // Print heavily relies on activeTab cart data. We MUST fetch and render it BEFORE clearing the order!
    if (typeof printInvoice === 'function') {
        for (let i = 0; i < copies; i++) {
            printInvoice();
        }
    }

    // Complete the order immediately after print jobs are dispatched
    completeOrder();
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

// ==================== TOAST NOTIFICATION ====================
function showToast(msg, type = 'info') {
    // Remove existing toast
    document.getElementById('saleToast')?.remove();
    const toast = document.createElement('div');
    toast.id = 'saleToast';
    const colors = {
        success: { bg: '#E8F5E9', border: '#4CAF50', color: '#2E7D32', icon: 'fa-check-circle' },
        error: { bg: '#FFEBEE', border: '#F44336', color: '#C62828', icon: 'fa-times-circle' },
        warning: { bg: '#FFF8E1', border: '#FF9800', color: '#E65100', icon: 'fa-exclamation-triangle' },
        info: { bg: '#E3F2FD', border: '#2196F3', color: '#1565C0', icon: 'fa-info-circle' }
    };
    const c = colors[type] || colors.info;
    toast.style.cssText = `position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;
                                        background:${c.bg};border:1px solid ${c.border};color:${c.color};
                                        padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;
                                        box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;
                                        animation:toastSlideIn .3s ease;max-width:500px;`;
    toast.innerHTML = `<i class="fas ${c.icon}"></i><span>${msg}</span>
                                        <button onclick="this.parentElement.remove()" style="border:none;background:none;cursor:pointer;margin-left:8px;font-size:16px;color:${c.color};opacity:0.7">&times;</button>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// Toast animation
if (!document.getElementById('toastAnimStyle')) {
    const s = document.createElement('style');
    s.id = 'toastAnimStyle';
    s.textContent = '@keyframes toastSlideIn {from {opacity:0; transform:translateX(-50%) translateY(-20px); } to {opacity:1; transform:translateX(-50%) translateY(0); } }';
    document.head.appendChild(s);
}

// ==================== ĐỒNG BỘ SẢN PHẨM ====================
function autoPullProductsPOS() {
    fetch('products_sync.php')
        .then(r => r.json())
        .then(data => {
            if (data && data.products && data.products.length > 0) {
                var local = JSON.parse(localStorage.getItem('hasu_products') || '[]');
                if (data.products.length !== local.length || JSON.stringify(data.products) !== JSON.stringify(local)) {
                    localStorage.setItem('hasu_products', JSON.stringify(data.products));
                    if (typeof products !== 'undefined' && Array.isArray(products)) {
                        products.length = 0;
                        products.push(...data.products);
                    }
                    if (typeof renderProductGrid === 'function') renderProductGrid();
                    if (typeof renderThuongGrid === 'function') renderThuongGrid();
                }
            }
        }).catch(e => console.log('Auto pull POS failed: ' + e));
}

function syncAllProductsPOS() {
    var prods = JSON.parse(localStorage.getItem('hasu_products') || '[]');
    if (prods.length === 0 && typeof products !== 'undefined' && products.length > 0) {
        prods = products;
    }

    var btn = document.getElementById('btnSyncPOS');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span style="font-weight:500;">Đang đồng bộ...</span>'; btn.style.opacity = 0.7; btn.style.pointerEvents = 'none'; }

    fetch('products_sync.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: prods })
    })
        .then(r => r.json())
        .then(data => {
            if (data.ok) return fetch('products_sync.php');
            else throw new Error('Push failed');
        })
        .then(r => r.json())
        .then(data => {
            if (data && data.products) {
                localStorage.setItem('hasu_products', JSON.stringify(data.products));
                if (typeof products !== 'undefined' && Array.isArray(products)) {
                    products.length = 0;
                    products.push(...data.products);
                }
                showToast('Đã đồng bộ ' + data.products.length + ' sản phẩm toàn hệ thống!', 'success');
                if (typeof renderProductGrid === 'function') renderProductGrid();
                if (typeof renderThuongGrid === 'function') renderThuongGrid();
            }
        })
        .catch(err => {
            console.error(err);
            showToast('Có lỗi khi đồng bộ: ' + err.message, 'error');
        })
        .finally(() => {
            if (btn) { btn.innerHTML = '<i class="fas fa-sync-alt"></i><span style="font-weight:500;">Đồng bộ thiết bị</span>'; btn.style.opacity = 1; btn.style.pointerEvents = 'auto'; }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const parent = document.querySelector('.header-right');
        if (parent && !document.getElementById('btnSyncPOS')) {
            const syncBtn = document.createElement('a');
            syncBtn.id = 'btnSyncPOS';
            syncBtn.className = 'hdr-icon';
            syncBtn.style.cssText = 'margin-right:15px;color:#555;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:5px;';
            syncBtn.title = 'Đồng bộ sản phẩm';
            syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span style="font-weight:500;">Đồng bộ thiết bị</span>';
            syncBtn.onclick = syncAllProductsPOS;

            const userBadge = document.querySelector('.user-badge');
            if (userBadge && userBadge.parentNode === parent) {
                parent.insertBefore(syncBtn, userBadge);
            } else {
                parent.prepend(syncBtn);
            }
        }
        autoPullProductsPOS();
    }, 500);
});
