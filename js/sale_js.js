/* ===== KiotViet Sale JS - Bán nhanh Full Integration ===== */
(function () {
    'use strict';

    /* ---------- PRODUCT DATA ---------- */
    const PRODUCTS = [
        {
            id: 'SP001', code: '09000775', name: 'Mì Shin Ramyun [120G X 5 X 8]',
            img: 'https://cdn2-retail-images.kiotviet.vn/2025/10/07/bachhoabn/4dc9077b14f541aba8a30b501168a9d9.png',
            units: [
                { name: 'Gói', price: 20500, ratio: 1 },
                { name: 'Thùng', price: 820000, ratio: 40 },
                { name: 'Túi', price: 102500, ratio: 5 }
            ]
        },
        {
            id: 'SP002', code: '08001234', name: 'Bia lon Budweiser 330ml',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/6232f341ad3a429db3681e909ef05e89.jpeg',
            units: [
                { name: 'Lon', price: 18000, ratio: 1 },
                { name: 'Thùng', price: 420000, ratio: 24 }
            ]
        },
        {
            id: 'SP003', code: '07005678', name: 'Nước khoáng thiên nhiên Quanh Hanh 500ml',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/af2e1c8a9d43482a9a239b7e27ad1357.jpeg',
            units: [
                { name: 'Chai', price: 6000, ratio: 1 },
                { name: 'Thùng', price: 135000, ratio: 24 }
            ]
        },
        {
            id: 'SP004', code: '06009012', name: 'Nước giặt OMO MATIC của trên tỉnh ban đầu',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/76de6cd5340944c4b88342f30053c8a1.jpeg',
            units: [
                { name: 'Chai', price: 95000, ratio: 1 },
                { name: 'Thùng', price: 540000, ratio: 6 }
            ]
        },
        {
            id: 'SP005', code: '05003456', name: 'Nivea men silver protect',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/4c2da649456c418d83d0f0444d26d476.jpeg',
            units: [
                { name: 'Chai', price: 75000, ratio: 1 },
                { name: 'Hộp', price: 215000, ratio: 3 }
            ]
        },
        {
            id: 'SP006', code: '04007890', name: 'Nước yến sào và hạt chia Green Bird',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/a4969e65154b44cf8f7503c1a24d54b8.jpeg',
            units: [
                { name: 'Hộp', price: 156000, ratio: 1 },
                { name: 'Thùng', price: 900000, ratio: 6 }
            ]
        },
        {
            id: 'SP007', code: '03002345', name: '109CLEAR Dầu Gội Sạch Gàu Gừng Và Bạc Hà',
            img: '',
            units: [{ name: 'Chai', price: 165000, ratio: 1 }]
        },
        {
            id: 'SP008', code: '02006789', name: 'Clear DG mát lạnh BH 340g/12',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/a409d0cc343e4b648935b60ffa5fb96b.jpeg',
            units: [
                { name: 'Chai', price: 102000, ratio: 1 },
                { name: 'Thùng', price: 1200000, ratio: 12 }
            ]
        },
        {
            id: 'SP009', code: '01001122', name: '111SSK SUNSILK Dầu Gội Dưỡng Mượt Diệu Kỳ',
            img: 'https://cdn-images.kiotviet.vn/2025/09/13/bachhoabn/51ee815923ad4ee1abb13d92f9319c5a.jpeg',
            units: [
                { name: 'Chai', price: 90000, ratio: 1 },
                { name: 'Thùng', price: 1050000, ratio: 12 }
            ]
        },
        {
            id: 'SP010', code: '00005566', name: 'Sunsilk DG đen óng mượt rạng ngời 640g',
            img: 'https://cdn1-retail-images.kiotviet.vn/2026/03/10/bachhoabn/1f4b920a70cf4a659682daaaf88cb9e1.jpeg',
            units: [{ name: 'Chai', price: 75000, ratio: 1 }]
        },
        {
            id: 'SP011', code: '00009988', name: 'Dove DG ngăn gãy rụng tóc 640g/8',
            img: 'https://cdn1-retail-images.kiotviet.vn/2026/03/10/bachhoabn/20c6de11bcf0460d9e378a8ecfddc105.jpeg',
            units: [
                { name: 'Chai', price: 135000, ratio: 1 },
                { name: 'Thùng', price: 1050000, ratio: 8 }
            ]
        },
        {
            id: 'SP012', code: '00007744', name: '107LFB Dầu gội dưỡng tóc óng ả Sunsilk',
            img: 'https://cdn1-retail-images.kiotviet.vn/2026/03/10/bachhoabn/7c6c46e7170a4c4da1899342cdee176f.jpeg',
            units: [{ name: 'Chai', price: 95000, ratio: 1 }]
        }
    ];

    /* ---------- STATE ---------- */
    let cart = [];
    let nextCartId = 1;
    let currentMode = 'ban-nhanh';

    /* ---------- DOM REFS ---------- */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    /* ---------- INIT ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        renderProductGrid();
        renderThuongProductGrid();
        setupModeTabs();
        setupToolbarButtons();
        setupPaymentButtons();
        setupDeliveryButtons();
        setupUnitModal();
        updateDateTime();
        setInterval(updateDateTime, 30000);
        updateCartUI();
    });

    /* ---------- PRODUCT GRID (Bán nhanh) ---------- */
    function renderProductGrid() {
        const grid = $('#productGrid');
        if (!grid) return;
        grid.innerHTML = '';
        PRODUCTS.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = p.id;
            card.innerHTML = `
                <div class="product-img-wrap">
                    ${p.img ? `<img src="${p.img}" alt="${p.name}" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<i class=\\'far fa-image product-placeholder\\'></i>'">` : '<i class="far fa-image product-placeholder"></i>'}
                </div>
                <div class="product-card-name">${p.name}</div>
            `;
            card.addEventListener('click', () => openUnitModal(p));
            grid.appendChild(card);
        });
    }

    /* ---------- PRODUCT GRID (Bán thường) ---------- */
    function renderThuongProductGrid() {
        const grid = $('#thuongProductGrid');
        if (!grid) return;
        grid.innerHTML = '';
        PRODUCTS.forEach(p => {
            const card = document.createElement('div');
            card.className = 'thuong-grid-item';
            card.dataset.id = p.id;
            const baseUnit = p.units[0];
            card.innerHTML = `
                <div class="thuong-grid-thumb">
                    ${p.img ? `<img src="${p.img}" alt="${p.name}" referrerpolicy="no-referrer" onerror="this.parentElement.innerHTML='<i class=\\'far fa-image\\'></i>'">` : '<i class="far fa-image"></i>'}
                </div>
                <div class="thuong-grid-info">
                    <div class="thuong-grid-name">${p.name}</div>
                    <div class="thuong-grid-price">${formatMoney(baseUnit.price)}</div>
                </div>
            `;
            card.addEventListener('click', () => openUnitModal(p));
            grid.appendChild(card);
        });
    }

    /* ---------- UNIT SELECTION MODAL ---------- */
    let modalProduct = null;
    let modalQtys = {};

    function openUnitModal(product) {
        modalProduct = product;
        modalQtys = {};
        product.units.forEach((u, i) => { modalQtys[i] = (i === 0) ? 1 : 0; });

        $('#unitModalTitle').textContent = product.name;
        renderUnitCards();
        $('#unitModal').classList.add('show');
    }

    function renderUnitCards() {
        const body = $('#unitModalBody');
        body.innerHTML = '';
        modalProduct.units.forEach((unit, i) => {
            const card = document.createElement('div');
            card.className = 'unit-card' + (modalQtys[i] > 0 ? ' selected' : '');
            card.innerHTML = `
                <div class="unit-card-img">
                    ${modalProduct.img ? `<img src="${modalProduct.img}" alt="${unit.name}" onerror="this.parentElement.innerHTML='<i class=\\'far fa-image\\'></i>'">` : '<i class="far fa-image"></i>'}
                </div>
                <div class="unit-card-name">${modalProduct.name} <span class="unit-type">${unit.name}</span></div>
                <div class="unit-card-price">${formatMoney(unit.price)}</div>
                <div class="unit-qty-selector">
                    <button class="qty-btn minus" data-idx="${i}">−</button>
                    <input type="number" class="qty-input" value="${modalQtys[i]}" min="0" data-idx="${i}">
                    <button class="qty-btn plus" data-idx="${i}">+</button>
                </div>
            `;
            body.appendChild(card);
        });

        // Attach events
        body.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                if (modalQtys[idx] > 0) modalQtys[idx]--;
                renderUnitCards();
            });
        });
        body.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                modalQtys[idx]++;
                renderUnitCards();
            });
        });
        body.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', () => {
                const idx = parseInt(input.dataset.idx);
                const val = parseInt(input.value) || 0;
                modalQtys[idx] = Math.max(0, val);
                renderUnitCards();
            });
        });
    }

    function setupUnitModal() {
        $('#unitModalClose').addEventListener('click', closeUnitModal);
        $('#unitSkip').addEventListener('click', closeUnitModal);
        $('#unitConfirm').addEventListener('click', confirmUnitModal);
        $('#unitModal').addEventListener('click', (e) => {
            if (e.target === $('#unitModal')) closeUnitModal();
        });
    }

    function closeUnitModal() {
        $('#unitModal').classList.remove('show');
        modalProduct = null;
    }

    function confirmUnitModal() {
        if (!modalProduct) return;
        let added = false;
        modalProduct.units.forEach((unit, i) => {
            if (modalQtys[i] > 0) {
                addToCart(modalProduct, unit, modalQtys[i]);
                added = true;
            }
        });
        if (added) showToast('Đã thêm vào giỏ hàng');
        closeUnitModal();
    }

    /* ---------- CART MANAGEMENT ---------- */
    function addToCart(product, unit, qty) {
        // Check if same product+unit already in cart
        const existing = cart.find(item => item.productId === product.id && item.unitName === unit.name);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({
                cartId: nextCartId++,
                productId: product.id,
                code: product.code,
                name: product.name,
                unitName: unit.name,
                units: product.units,
                price: unit.price,
                qty: qty
            });
        }
        updateCartUI();
    }

    function removeFromCart(cartId) {
        cart = cart.filter(item => item.cartId !== cartId);
        updateCartUI();
    }

    function updateCartQty(cartId, newQty) {
        const item = cart.find(i => i.cartId === cartId);
        if (!item) return;
        if (newQty <= 0) {
            removeFromCart(cartId);
            return;
        }
        item.qty = newQty;
        updateCartUI();
    }

    function changeCartUnit(cartId, newUnitName) {
        const item = cart.find(i => i.cartId === cartId);
        if (!item) return;
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;
        const newUnit = product.units.find(u => u.name === newUnitName);
        if (!newUnit) return;
        item.unitName = newUnit.name;
        item.price = newUnit.price;
        updateCartUI();
    }

    /* ---------- CART UI ---------- */
    function updateCartUI() {
        renderCartRows();
        updateTotals();
    }

    function renderCartRows() {
        const section = $('#cartSection');
        if (!section) return;

        if (cart.length === 0) {
            section.innerHTML = '';
            section.style.display = 'none';
            const gridWrap = $('#productGridWrapper');
            if (gridWrap) gridWrap.style.display = 'flex';
            return;
        }

        section.style.display = 'block';
        // In ban-nhanh: always show product grid below the cart
        const gridWrap = $('#productGridWrapper');
        if (gridWrap) gridWrap.style.display = 'flex';

        let html = `<div class="cart-header">
            <span style="width:24px">#</span>
            <span style="width:24px"></span>
            <span style="flex:1">Tên hàng</span>
            <span style="width:36px;text-align:center">SL</span>
            <span style="width:70px;text-align:right">Đơn giá</span>
            <span style="width:80px;text-align:right">T.Tiền</span>
            <span style="width:24px"></span>
        </div>`;

        cart.forEach((item, idx) => {
            const total = item.price * item.qty;

            html += `
                <div class="cart-row" data-cart-id="${item.cartId}">
                    <span class="cart-stt">${idx + 1}</span>
                    <button class="cart-delete" onclick="window._saleRemove(${item.cartId})" title="Xóa"><i class="fas fa-times"></i></button>
                    <span class="cart-name" title="${item.name}">${item.name}</span>
                    <span class="cart-qty"><input type="number" value="${item.qty}" min="1" onchange="window._saleQty(${item.cartId}, parseInt(this.value)||1)"></span>
                    <span class="cart-price">${formatMoney(item.price)}</span>
                    <span class="cart-total">${formatMoney(total)}</span>
                    <button class="cart-add-btn" onclick="window._saleQty(${item.cartId}, ${item.qty + 1})"><i class="fas fa-plus"></i></button>
                    <button class="cart-more"><i class="fas fa-ellipsis-v"></i></button>
                </div>
            `;
        });
        section.innerHTML = html;
    }

    // Expose cart functions globally for inline onclick handlers
    window._saleRemove = removeFromCart;
    window._saleQty = updateCartQty;
    window._saleChangeUnit = changeCartUnit;

    function updateTotals() {
        let totalItems = 0;
        let totalAmount = 0;
        cart.forEach(item => {
            totalItems += item.qty;
            totalAmount += item.price * item.qty;
        });

        // Payment panel (Bán nhanh)
        const countEl = $('#totalCount');
        const subtotalEl = $('#subtotalValue');
        const grandEl = $('#grandTotal');
        const changeEl = $('#changeValue');

        if (countEl) countEl.textContent = totalItems;
        if (subtotalEl) subtotalEl.textContent = formatMoney(totalAmount);
        if (grandEl) {
            grandEl.textContent = formatMoney(totalAmount);
            grandEl.style.color = totalAmount > 0 ? '#0090DA' : '';
        }
        if (changeEl) changeEl.textContent = formatMoney(0);

        // Bottom summary (Bán thường)
        const sumCount = $('#summaryCount');
        const sumTotal = $('#summaryTotal');
        if (sumCount) sumCount.textContent = totalItems;
        if (sumTotal) sumTotal.textContent = formatMoney(totalAmount);

        // Bottom price breakdown (Bán giao hàng)
        const bpCount = $('#bpCount');
        const bpSub = $('#bpSubtotal');
        const bpTotal = $('#bpTotal');
        if (bpCount) bpCount.textContent = totalItems;
        if (bpSub) bpSub.textContent = formatMoney(totalAmount);
        if (bpTotal) bpTotal.textContent = formatMoney(totalAmount);

        // Update COD value if toggle is ON
        updateCODValue(totalAmount);

        // Update tab label with item count
        const tabLabel = $('#orderTabLabel');
        if (tabLabel) {
            tabLabel.textContent = cart.length > 0 ? `Hóa đơn 1` : 'Hóa đơn 1';
        }
    }

    /* ---------- PAYMENT ---------- */
    function setupPaymentButtons() {
        const btnOrder = $('#btnOrder');
        if (btnOrder) {
            btnOrder.addEventListener('click', () => {
                if (cart.length === 0) {
                    showToast('Chưa có sản phẩm trong giỏ hàng');
                    return;
                }
                processPayment();
            });
        }
        const btnPrint = $('#btnPrint');
        if (btnPrint) {
            btnPrint.addEventListener('click', () => {
                showToast('Đang in hóa đơn...');
            });
        }

        // All THANH TOÁN / ĐẶT HÀNG buttons
        $$('.btn-order').forEach(btn => {
            if (btn.id === 'btnOrder') return; // already handled
            btn.addEventListener('click', () => {
                if (cart.length === 0) {
                    showToast('Chưa có sản phẩm trong giỏ hàng');
                    return;
                }
                processPayment();
            });
        });
    }

    function processPayment() {
        const overlay = $('#successOverlay');
        if (!overlay) return;
        overlay.classList.add('show');
        setTimeout(() => {
            overlay.classList.remove('show');
            cart = [];
            nextCartId = 1;
            updateCartUI();
        }, 2000);
    }

    /* ---------- DELIVERY MODE BUTTONS & COD ---------- */
    function updateCODValue(totalAmount) {
        const codToggle = $('#codToggle');
        const codVal = $('#codValue');
        if (!codVal) return;
        if (codToggle && codToggle.checked) {
            codVal.textContent = formatMoney(totalAmount !== undefined ? totalAmount : getTotalAmount());
        } else {
            codVal.textContent = '0';
        }
    }

    function getTotalAmount() {
        let total = 0;
        cart.forEach(item => { total += item.price * item.qty; });
        return total;
    }

    function setupDeliveryButtons() {
        // COD toggle
        const codToggle = $('#codToggle');
        if (codToggle) {
            codToggle.addEventListener('change', () => {
                updateCODValue();
            });
        }

        // THANH TOÁN button in delivery mode
        const btnPay = $('#btnDeliveryPay');
        if (btnPay) {
            btnPay.addEventListener('click', () => {
                if (cart.length === 0) {
                    showToast('Chưa có sản phẩm trong giỏ hàng');
                    return;
                }
                processPayment();
            });
        }

        // IN button in delivery mode
        const btnPrint = $('#btnDeliveryPrint');
        if (btnPrint) {
            btnPrint.addEventListener('click', () => {
                showToast('Đang in hóa đơn...');
            });
        }
    }

    /* ---------- MODE SWITCHING ---------- */
    function setupModeTabs() {
        $$('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                if (mode === currentMode) return;
                currentMode = mode;

                // Update active tab
                $$('.mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Switch body class
                document.body.className = `mode-${mode}`;

                // Update cart visibility
                updateCartUI();
            });
        });
    }

    /* ---------- TOOLBAR ---------- */
    function setupToolbarButtons() {
        // Scan button -> focus search input (ready for scanner)
        const scanBtn = $('.toolbar-btn-scan');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => {
                const searchInput = $('.search-wrapper input');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                    showToast('Sẵn sàng quét mã vạch...');
                }
            });
        }

        // Add order button
        const addBtn = $('.btn-add-order');
        if (addBtn) {
            addBtn.addEventListener('click', () => showToast('Tạo hóa đơn mới'));
        }

        // Search focus
        const searchInput = $('.search-wrapper input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.placeholder = 'Nhập tên hoặc mã sản phẩm...';
            });
            searchInput.addEventListener('blur', () => {
                searchInput.placeholder = 'Tìm hàng hóa (F3)';
            });

            // Enter key: exact barcode match -> auto add to cart
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (!query) return;

                    // Try exact code match first (barcode scan)
                    const exactMatch = PRODUCTS.find(p => p.code === query);
                    if (exactMatch) {
                        const defaultUnit = exactMatch.units[0];
                        addToCart(exactMatch, defaultUnit, 1);
                        searchInput.value = '';
                        // Reset grid visibility
                        resetGridVisibility();
                        showToast('Đã thêm: ' + exactMatch.name);
                        return;
                    }

                    // Try partial name/code match - add first match
                    const partialMatch = PRODUCTS.find(p =>
                        p.name.toLowerCase().includes(query.toLowerCase()) ||
                        p.code.includes(query)
                    );
                    if (partialMatch) {
                        const defaultUnit = partialMatch.units[0];
                        addToCart(partialMatch, defaultUnit, 1);
                        searchInput.value = '';
                        resetGridVisibility();
                        showToast('Đã thêm: ' + partialMatch.name);
                    } else {
                        showToast('Không tìm thấy sản phẩm: ' + query);
                    }
                }
            });

            // Live search filter (filter product grid as you type)
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase().trim();
                // Filter Bán nhanh cards
                const cards = $$('.product-card');
                cards.forEach(card => {
                    const productId = card.dataset.id;
                    const product = PRODUCTS.find(p => p.id === productId);
                    if (!product) return;
                    const match = !query || product.name.toLowerCase().includes(query) || product.code.includes(query);
                    card.style.display = match ? '' : 'none';
                });
                // Filter Bán thường cards
                const thuongCards = $$('.thuong-product-card');
                thuongCards.forEach(card => {
                    const productId = card.dataset.id;
                    const product = PRODUCTS.find(p => p.id === productId);
                    if (!product) return;
                    const match = !query || product.name.toLowerCase().includes(query) || product.code.includes(query);
                    card.style.display = match ? '' : 'none';
                });
            });
        }

        // F3 keyboard shortcut to focus search
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                const searchInput = $('.search-wrapper input');
                if (searchInput) searchInput.focus();
            }
        });
    }

    function resetGridVisibility() {
        $$('.product-card').forEach(c => c.style.display = '');
        $$('.thuong-product-card').forEach(c => c.style.display = '');
    }

    /* ---------- DATE/TIME ---------- */
    function updateDateTime() {
        const now = new Date();
        const str = now.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }) + ' ' + now.toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        });
        const el = $('#paymentDatetime');
        if (el) el.textContent = str;
        const del = $('#deliveryDatetime');
        if (del) del.textContent = str;
    }

    /* ---------- UTILITIES ---------- */
    function formatMoney(amount) {
        if (!amount || amount === 0) return '0';
        return amount.toLocaleString('vi-VN');
    }

    function showToast(msg) {
        const toast = $('#toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    /* ---------- KEYBOARD SHORTCUTS ---------- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            e.preventDefault();
            const input = $('.search-wrapper input');
            if (input) input.focus();
        }
    });

})();
