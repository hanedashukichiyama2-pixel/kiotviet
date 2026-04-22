// ============================================================
// KiotViet Management - Fresh JS (No old code)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    // Inject user info into header if available
    var userName = localStorage.getItem('hasu_userName');
    var userEmail = localStorage.getItem('hasu_userEmail');
    if (userName) {
        var nameDiv = document.querySelector('#avatarPanel div[style*="font-weight:600"]');
        if (nameDiv) nameDiv.textContent = userName;
    }
    if (userEmail) {
        var emailDiv = document.querySelector('#avatarPanel div[style*="color:#888"]');
        if (emailDiv) emailDiv.textContent = userEmail;
    }

    initNav();
    navigate('tongquan', null);
});

// ==================== NAVIGATION ====================

function initNav() {
    // Nav tab clicks (top level)
    document.querySelectorAll('.kv-nav-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            setActiveTab(this);
            navigate(this.dataset.page, null);
        });
    });

    // Dropdown item clicks
    document.querySelectorAll('.kv-dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            var page = this.dataset.page;
            var sub = this.dataset.sub;
            // Activate parent tab
            var wrapper = this.closest('.kv-nav-wrapper');
            if (wrapper) {
                var tab = wrapper.querySelector('.kv-nav-tab');
                if (tab) setActiveTab(tab);
            }
            navigate(page, sub);
        });
    });
}

function setActiveTab(tab) {
    document.querySelectorAll('.kv-nav-tab').forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
}

function navigate(page, sub) {
    var c = document.getElementById('pageContent');
    var map = {
        tongquan: renderTongQuan,
        hanghoa: renderHangHoa,
        donhang: renderDonHang,
        khachhang: renderKhachHang,
        soquy: renderSoQuy,
        baocao: renderBaoCao,
        banonline: renderBanOnline,
        thietlap: renderThietLap
    };
    if (map[page]) {
        c.innerHTML = map[page](sub);
        initSubTabs();
        initFilterToggles();
        initBtnDropdowns();
    }
}

function initSubTabs() {
    document.querySelectorAll('.kv-subtab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.kv-subtab').forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');
            var sub = this.dataset.sub;
            var page = this.dataset.page;
            // Báo cáo sub-tabs: full page re-render
            if (page === 'baocao' && sub) {
                var c = document.getElementById('pageContent');
                c.innerHTML = renderBaoCao(sub);
                initSubTabs();
                initFilterToggles();
                initBtnDropdowns();
                return;
            }
            var subMap = {
                danhsach: renderSubDanhSach, thietlapgia: renderSubThietLapGia,
                nhacungcap: renderSubNhaCungCap, nhaphang: renderSubNhapHang,
                chuyenhang: renderSubChuyenHang, kiemkho: renderSubKiemKho,
                trahangnhap: renderSubTraHangNhap, xuathuy: renderSubXuatHuy,
                dathangnhap: renderSubDatHangNhap,
                hoadon: function () { return renderDonHangSub('Hóa đơn', 'Mã hóa đơn', hdHeaders()); },
                trahang: function () { return renderDonHangSub('Trả hàng', 'Mã trả hàng', thHeaders()); },
                dathang: function () { return renderDonHangSub('Đặt hàng', 'Mã đặt hàng', dhHeaders()); },
                vandon: function () { return renderDonHangSub('Vận đơn', 'Mã vận đơn', vdHeaders()); }
            };
            if (subMap[sub]) {
                var container = document.querySelector('.kv-container');
                if (container) {
                    container.outerHTML = subMap[sub]();
                    initFilterToggles();
                    initBtnDropdowns();
                }
            }
        });
    });
}

function initFilterToggles() {
    document.querySelectorAll('.kv-filter-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var group = this.closest('.kv-filter-toggle-group');
            if (group) group.querySelectorAll('.kv-filter-toggle').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
        });
    });
}

function initBtnDropdowns() {
    document.querySelectorAll('.kv-btn-dropdown').forEach(function (wrapper) {
        var btn = wrapper.querySelector('.kv-btn');
        var menu = wrapper.querySelector('.kv-btn-dropdown-menu');
        if (btn && menu) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                menu.classList.toggle('open');
            });
        }
    });
    document.addEventListener('click', function () {
        document.querySelectorAll('.kv-btn-dropdown-menu.open').forEach(function (m) { m.classList.remove('open'); });
    });
}

// ==================== HELPERS ====================

function H(tag, cls, inner) { return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + (inner || '') + '</' + tag + '>'; }

function emptyState(title, desc) {
    return '<div class="kv-empty">' +
        '<div class="kv-empty-icon"><i class="fas fa-inbox"></i></div>' +
        '<div class="kv-empty-title">' + title + '</div>' +
        '<div class="kv-empty-desc">' + desc + '</div>' +
        '</div>';
}

function filterSection(label, content, linkText) {
    var link = linkText ? '<a class="kv-filter-link">' + linkText + '</a>' : '';
    return '<div class="kv-filter-section">' +
        '<div class="kv-filter-label">' + label + link + '</div>' +
        content + '</div>';
}

function filterTime(label) {
    return filterSection(label || 'Thời gian',
        '<button class="kv-tp-btn"><span>Tháng này</span><i class="fas fa-chevron-right"></i></button>' +
        '<div class="kv-filter-radio"><input type="radio"><span>Tùy chỉnh</span><i class="far fa-calendar-alt" style="margin-left:auto"></i></div>');
}

function filterPerson(label) {
    return filterSection(label, '<input class="kv-filter-input" placeholder="Chọn ' + label.toLowerCase() + '">');
}

function filterStatus(items) {
    return filterSection('Trạng thái', items.map(function (i) {
        return '<div class="kv-filter-check"><input type="checkbox"' + (i.checked ? ' checked' : '') + '><span>' + i.label + '</span></div>';
    }).join(''));
}

function filterSelect(label, options) {
    return filterSection(label, '<select class="kv-filter-select">' + options.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>');
}

function filterToggle(label, items) {
    return filterSection(label, '<div class="kv-filter-toggle-group">' + items.map(function (i, idx) {
        return '<button class="kv-filter-toggle' + (idx === 0 ? ' active' : '') + '">' + i + '</button>';
    }).join('') + '</div>');
}

function subTabsHtml(tabs, page) {
    return '<div class="kv-subtabs">' + tabs.map(function (t, i) {
        return '<button class="kv-subtab' + (i === 0 ? ' active' : '') + '" data-sub="' + t.key + '" data-page="' + (page || '') + '">' + t.label + '</button>';
    }).join('') + '</div>';
}

function actionsBar(searchPh, buttonsHtml) {
    return '<div class="kv-actions">' +
        '<div class="kv-search"><i class="fas fa-search"></i><input placeholder="' + searchPh + '"><i class="fas fa-sliders-h" style="color:#BABABA;cursor:pointer"></i></div>' +
        '<div class="kv-btn-group">' + buttonsHtml + '</div>' +
        '</div>';
}

function tableHeader(cols) {
    return '<div class="kv-table-header">' +
        '<span class="kv-col kv-col-check"><input type="checkbox"></span>' +
        '<span class="kv-col kv-col-star"><i class="far fa-star"></i></span>' +
        cols.map(function (c) { return '<span class="kv-col" style="flex:' + (c.flex || 1) + '">' + c.label + '</span>'; }).join('') +
        '</div>';
}

function pageLayout(sidebar, main) {
    return '<div class="kv-container"><div class="kv-sidebar">' + sidebar + '</div><div class="kv-main">' + main + '</div></div>';
}

function stdBtns(primaryLabel) {
    return '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> ' + primaryLabel + '</button>' +
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-file-import"></i> Import file</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>';
}

function pageTitle(title) {
    return '<div class="kv-page-header"><span class="kv-page-title">' + title + '</span></div>';
}

// ==================== TỔNG QUAN ====================

function renderTongQuan() {
    var activities = ['7 ngày trước', '12 ngày trước', 'một tháng trước', 'một tháng trước'];
    var actHtml = activities.map(function (t, i) {
        return '<div class="kv-activity-item">' +
            '<div class="kv-activity-icon"><i class="fas fa-' + (i === 2 ? 'box-open' : 'clipboard-check') + '"></i></div>' +
            '<div><div class="kv-activity-text"><a href="#">Tuấn Anh</a> vừa <a href="#">' + (i === 2 ? 'nhận hàng' : 'thực hiện kiểm hàng') + '</a></div>' +
            '<div class="kv-activity-time">' + t + '</div></div></div>';
    }).join('');

    var main = '<div class="kv-dashboard-main">' +
        '<div class="kv-card"><div class="kv-card-header">Kết quả bán hàng hôm nay</div><div class="kv-card-body"><div class="kv-sales-stats">' +
        '<div class="kv-stat"><div class="kv-stat-icon revenue"><i class="fas fa-info-circle"></i></div><div><div class="kv-stat-label">Doanh thu</div><div class="kv-stat-value">0</div></div></div>' +
        '<div class="kv-stat"><div class="kv-stat-icon returns"><i class="fas fa-undo-alt"></i></div><div><div class="kv-stat-label">Trả hàng</div><div class="kv-stat-value">0</div></div></div>' +
        '</div></div></div>' +
        '<div class="kv-card">' +
        '<div class="kv-chart-header"><div class="kv-chart-title">Doanh thu thuần <span class="kv-chart-value">0</span></div>' +
        '<div class="kv-chart-controls"><button class="kv-chart-btn active"><i class="fas fa-chart-bar"></i></button><button class="kv-chart-btn"><i class="fas fa-chart-pie"></i></button><select class="kv-chart-period"><option>Tháng này</option></select></div></div>' +
        '<div class="kv-chart-tabs"><button class="kv-chart-tab active">Theo ngày</button><button class="kv-chart-tab">Theo giờ</button><button class="kv-chart-tab">Theo thứ</button></div>' +
        '<div class="kv-chart-area"><i class="fas fa-inbox"></i><span>Chưa có dữ liệu</span></div></div>' +
        '<div class="kv-bottom-cards">' +
        '<div class="kv-card"><div class="kv-bottom-header">Top 10 hàng bán chạy<div class="kv-bottom-header-filters"><select><option>Theo doanh thu thuần</option></select><select><option>Tháng này</option></select></div></div><div class="kv-bottom-body"><i class="fas fa-inbox"></i>Chưa có dữ liệu</div></div>' +
        '<div class="kv-card"><div class="kv-bottom-header">Top 10 khách mua nhiều nhất<div class="kv-bottom-header-filters"><select><option>Tháng này</option></select></div></div><div class="kv-bottom-body"><i class="fas fa-inbox"></i>Chưa có dữ liệu</div></div>' +
        '</div></div>';

    var aside = '<div class="kv-dashboard-aside">' +
        '<div class="kv-card"><div class="kv-card-header">Hoạt động gần đây</div><div class="kv-activity-list">' + actHtml + '</div></div></div>';

    return '<div class="kv-dashboard">' + main + aside + '</div>';
}

// ==================== HÀNG HÓA ====================

function renderHangHoa(sub) {
    if (sub && sub !== 'danhsach') {
        var subMap = {
            thietlapgia: renderSubThietLapGia, nhacungcap: renderSubNhaCungCap,
            nhaphang: renderSubNhapHang, chuyenhang: renderSubChuyenHang,
            kiemkho: renderSubKiemKho, trahangnhap: renderSubTraHangNhap,
            xuathuy: renderSubXuatHuy, dathangnhap: renderSubDatHangNhap
        };
        if (subMap[sub]) {
            var titleMap = { thietlapgia: 'Thiết lập giá', nhacungcap: 'Nhà cung cấp', nhaphang: 'Nhập hàng', chuyenhang: 'Chuyển hàng', kiemkho: 'Kiểm kho', trahangnhap: 'Trả hàng nhập', xuathuy: 'Xuất hủy', dathangnhap: 'Đặt hàng nhập' };
            return pageTitle(titleMap[sub] || '') + hhSubTabs(sub) + subMap[sub]();
        }
    }
    return pageTitle('Hàng hóa') + hhSubTabs('danhsach') + renderSubDanhSach();
}

function hhSubTabs(active) {
    var tabs = [
        { key: 'danhsach', label: 'Danh sách hàng hóa' },
        { key: 'thietlapgia', label: 'Thiết lập giá' },
        { key: 'nhacungcap', label: 'Nhà cung cấp' },
        { key: 'dathangnhap', label: 'Đặt hàng nhập' },
        { key: 'nhaphang', label: 'Nhập hàng' },
        { key: 'trahangnhap', label: 'Trả hàng nhập' },
        { key: 'chuyenhang', label: 'Chuyển hàng' },
        { key: 'kiemkho', label: 'Kiểm kho' },
        { key: 'xuathuy', label: 'Xuất hủy' }
    ];
    return '<div class="kv-subtabs">' + tabs.map(function (t) {
        return '<button class="kv-subtab' + (t.key === active ? ' active' : '') + '" data-sub="' + t.key + '" data-page="hanghoa">' + t.label + '</button>';
    }).join('') + '</div>';
}

function renderSubDanhSach() {
    var sidebar =
        filterSection('Nhóm hàng', '<input class="kv-filter-input" placeholder="Chọn nhóm hàng">', 'Tạo mới') +
        filterSelect('Tồn kho', ['Tất cả']) +
        filterSection('Dự kiến hết hàng', '<button class="kv-tp-btn"><span>Toàn thời gian</span><i class="fas fa-chevron-right"></i></button>') +
        filterSection('Thời gian tạo', '<button class="kv-tp-btn"><span>Toàn thời gian</span><i class="fas fa-chevron-right"></i></button>') +
        filterPerson('Nhà cung cấp') +
        filterPerson('Thương hiệu') +
        filterPerson('Vị trí') +
        filterPerson('Loại hàng') +
        filterToggle('Tích điểm', ['Tất cả', 'Có', 'Không']) +
        filterToggle('Bán trực tiếp', ['Tất cả', 'Có', 'Không']);

    var btns = '<div class="kv-btn-dropdown">' +
        '<button class="kv-btn kv-btn-primary" onclick="openProductForm()"><i class="fas fa-plus"></i> Tạo mới <i class="fas fa-caret-down"></i></button>' +
        '</div>' +
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-file-import"></i> Import file</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>';

    var cols = [{ label: '', flex: 0.3 }, { label: 'Mã hàng', flex: 1 }, { label: 'Tên hàng', flex: 2 }, { label: 'Giá bán', flex: 1 }, { label: 'Giá vốn', flex: 1 }, { label: 'Tồn kho', flex: 0.8 }, { label: 'ĐVT', flex: 0.6 }];

    // Render real product data
    var prods = (typeof products !== 'undefined') ? products : [];
    var rows = '';
    var limit = Math.min(prods.length, 50); // Show first 50 for performance
    for (var j = 0; j < limit; j++) {
        var p = prods[j];
        var stockClass = (p.stock || 0) <= 0 ? 'color:#D32F2F;font-weight:600' : '';
        rows += '<div class="kv-table-row" data-product-idx="' + j + '" onclick="openProductForm(' + j + ')" style="display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid #F0F0F0;cursor:pointer;font-size:13px" onmouseover="this.style.background=\'#F5F9FF\'" onmouseout="this.style.background=\'#FFF\'">' +
            '<span style="flex:0.3"><input type="checkbox"></span>' +
            '<span style="flex:1;color:#0090DA;font-weight:500">' + (p.code || '') + '</span>' +
            '<span style="flex:2">' + (p.name || '') + '</span>' +
            '<span style="flex:1;text-align:right">' + (p.price || 0).toLocaleString() + '</span>' +
            '<span style="flex:1;text-align:right">' + (p.cost || 0).toLocaleString() + '</span>' +
            '<span style="flex:0.8;text-align:right;' + stockClass + '">' + (p.stock || 0).toLocaleString() + '</span>' +
            '<span style="flex:0.6;text-align:center">' + (p.unit || 'Cái') + '</span>' +
            '</div>';
    }
    var totalInfo = '<div style="padding:8px 16px;font-size:12px;color:#777;background:#FAFAFA;border-bottom:1px solid #EEE">Hiển thị ' + limit + ' / ' + prods.length + ' sản phẩm</div>';

    return pageLayout(sidebar, actionsBar('Theo mã, tên hàng', btns) + tableHeader(cols) + totalInfo + '<div id="productTableBody">' + rows + '</div>');
}

// Product CRUD form modal — KiotViet style with unit conversions
var _ucRows = []; // temp unit conversion rows for form

function openProductForm(idx) {
    var isEdit = (idx !== undefined && idx !== null);
    var p = isEdit ? products[idx] : { code: '', barcode: '', name: '', price: 0, cost: 0, stock: 0, unit: 'Cái', img: '', group: '', brand: '', supplier: '', note: '', unitConversions: [] };
    _ucRows = (p.unitConversions || []).map(function (u) { return { name: u.name || '', factor: u.factor || 1, price: u.price || 0 }; });

    var content = '<div style="font-size:13px;max-height:560px;overflow-y:auto;padding-right:6px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
        pField('Mã hàng', 'pfCode', p.code, isEdit ? 'readonly' : '') +
        pField('Barcode', 'pfBarcode', p.barcode || '') +
        '</div>' +
        pField('Tên hàng', 'pfName', p.name) +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        pField('Giá bán', 'pfPrice', p.price || 0, '', 'number') +
        pField('Giá vốn', 'pfCost', p.cost || 0, '', 'number') +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        pField('Tồn kho', 'pfStock', p.stock || 0, '', 'number') +
        pField('Đơn vị cơ bản', 'pfUnit', p.unit || 'Cái') +
        '</div>' +
        // ===== Unit Conversion Section =====
        '<div style="margin:16px 0 12px;padding:14px;background:#F8FBFF;border:1px solid #D6E8F7;border-radius:6px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<span style="font-weight:600;color:#0090DA;font-size:13px"><i class="fas fa-exchange-alt" style="margin-right:6px"></i>Đơn vị quy đổi</span>' +
        '<button onclick="addUCRow()" style="padding:4px 12px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px"><i class="fas fa-plus" style="margin-right:4px"></i>Thêm ĐVT</button>' +
        '</div>' +
        '<div id="ucTableWrap">' + renderUCTable() + '</div>' +
        '</div>' +
        // ===== Other fields =====
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        pField('Nhóm hàng', 'pfGroup', p.group || '') +
        pField('Thương hiệu', 'pfBrand', p.brand || '') +
        '</div>' +
        pField('Nhà cung cấp', 'pfSupplier', p.supplier || '') +
        pField('Ghi chú', 'pfNote', p.note || '', '', 'textarea') +
        '<div style="display:flex;justify-content:flex-end;gap:12px;border-top:1px solid #eee;padding-top:14px;margin-top:16px">' +
        (isEdit ? '<button onclick="deleteProduct(' + idx + ')" style="padding:8px 20px;background:#D32F2F;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-right:auto">Xóa</button>' : '') +
        '<button onclick="closeModal()" style="padding:8px 24px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer">Hủy</button>' +
        '<button onclick="saveProductForm(' + (isEdit ? idx : -1) + ')" style="padding:8px 24px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">' + (isEdit ? 'Cập nhật' : 'Tạo mới') + '</button>' +
        '</div></div>';
    openModal((isEdit ? 'Sửa hàng hóa' : 'Tạo hàng hóa mới'), content, '600px');
}

function renderUCTable() {
    if (_ucRows.length === 0) return '<div style="text-align:center;color:#999;font-size:12px;padding:8px">Chưa có đơn vị quy đổi. Ấn "Thêm ĐVT" để thêm.</div>';
    var html = '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
        '<tr style="background:#E8F4FD"><th style="padding:6px 8px;text-align:left;border:1px solid #D6E8F7">Tên ĐVT</th><th style="padding:6px 8px;text-align:center;border:1px solid #D6E8F7">Quy đổi (×)</th><th style="padding:6px 8px;text-align:right;border:1px solid #D6E8F7">Giá bán</th><th style="padding:6px 8px;width:36px;border:1px solid #D6E8F7"></th></tr>';
    for (var i = 0; i < _ucRows.length; i++) {
        var r = _ucRows[i];
        html += '<tr>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0"><input type="text" value="' + (r.name || '') + '" style="width:100%;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:12px" onchange="updateUCRow(' + i + ',\'name\',this.value)" placeholder="VD: Lốc, Thùng"></td>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0;text-align:center"><input type="number" value="' + (r.factor || 1) + '" min="1" style="width:60px;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:12px;text-align:center" onchange="updateUCRow(' + i + ',\'factor\',this.value)"></td>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0;text-align:right"><input type="number" value="' + (r.price || 0) + '" style="width:100%;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:12px;text-align:right" onchange="updateUCRow(' + i + ',\'price\',this.value)"></td>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0;text-align:center"><button onclick="removeUCRow(' + i + ')" style="background:none;border:none;color:#D32F2F;cursor:pointer;font-size:14px" title="Xóa"><i class="fas fa-trash-alt"></i></button></td>' +
            '</tr>';
    }
    html += '</table>';
    return html;
}

function addUCRow() {
    _ucRows.push({ name: '', factor: 1, price: 0 });
    var w = document.getElementById('ucTableWrap');
    if (w) w.innerHTML = renderUCTable();
}

function removeUCRow(i) {
    _ucRows.splice(i, 1);
    var w = document.getElementById('ucTableWrap');
    if (w) w.innerHTML = renderUCTable();
}

function updateUCRow(i, field, val) {
    if (!_ucRows[i]) return;
    if (field === 'factor' || field === 'price') val = parseInt(val) || 0;
    _ucRows[i][field] = val;
}

function pField(label, id, val, extra, type) {
    extra = extra || '';
    type = type || 'text';
    if (type === 'textarea') {
        return '<div style="margin-bottom:10px"><label style="display:block;font-weight:500;margin-bottom:4px;color:#555">' + label + '</label><textarea id="' + id + '" style="width:100%;padding:7px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;resize:vertical;min-height:60px" ' + extra + '>' + (val || '') + '</textarea></div>';
    }
    return '<div style="margin-bottom:10px"><label style="display:block;font-weight:500;margin-bottom:4px;color:#555">' + label + '</label><input id="' + id + '" type="' + type + '" value="' + (val || '') + '" style="width:100%;padding:7px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px" ' + extra + '></div>';
}

function saveProductForm(idx) {
    var name = document.getElementById('pfName').value.trim();
    if (!name) { alert('Vui lòng nhập tên hàng hóa'); return; }
    // Collect unit conversions (filter out empty rows)
    var conversions = _ucRows.filter(function (r) { return r.name && r.name.trim(); }).map(function (r) {
        return { name: r.name.trim(), factor: parseInt(r.factor) || 1, price: parseInt(r.price) || 0 };
    });
    var data = {
        code: document.getElementById('pfCode').value.trim() || ('SP' + Date.now().toString().slice(-6)),
        barcode: document.getElementById('pfBarcode').value.trim(),
        name: name,
        price: parseInt(document.getElementById('pfPrice').value) || 0,
        cost: parseInt(document.getElementById('pfCost').value) || 0,
        stock: parseInt(document.getElementById('pfStock').value) || 0,
        unit: document.getElementById('pfUnit').value.trim() || 'Cái',
        img: '',
        group: document.getElementById('pfGroup').value.trim(),
        brand: document.getElementById('pfBrand').value.trim(),
        supplier: (document.getElementById('pfSupplier') || {}).value ? document.getElementById('pfSupplier').value.trim() : '',
        note: document.getElementById('pfNote').value.trim(),
        unitConversions: conversions
    };
    if (idx >= 0) {
        Object.assign(products[idx], data);
    } else {
        products.unshift(data);
    }
    if (typeof saveLocalDB === 'function') saveLocalDB();
    closeModal();
    var c = document.getElementById('mainContent');
    if (c) c.innerHTML = renderHangHoa();
    if (typeof initAfterRender === 'function') initAfterRender();
    showToast(idx >= 0 ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm mới', 'success');
}

function deleteProduct(idx) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm "' + products[idx].name + '"?')) return;
    products.splice(idx, 1);
    if (typeof saveLocalDB === 'function') saveLocalDB();
    closeModal();
    var c = document.getElementById('mainContent');
    if (c) c.innerHTML = renderHangHoa();
    if (typeof initAfterRender === 'function') initAfterRender();
    showToast('Đã xóa sản phẩm', 'success');
}

function renderSubThietLapGia() {
    var sidebar =
        filterSection('Bảng giá', '<div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:16px;background:#FFF8E1;color:#E65100;font-size:12px;font-weight:500;cursor:pointer;border:1px solid #FFB74D">Bảng giá chung <span style="font-weight:700;cursor:pointer" onclick="this.parentElement.remove()">×</span></div>', 'Tạo mới') +
        filterPerson('Nhóm hàng') +
        filterSelect('Tồn kho', ['Tất cả']);

    var cols = [{ label: 'Mã hàng', flex: 1 }, { label: 'Tên hàng', flex: 2.5 }, { label: 'Giá vốn', flex: 0.8 }, { label: 'Giá nhập cuối', flex: 0.8 }, { label: 'Bảng giá chung', flex: 1 }];

    return pageLayout(sidebar, actionsBar('Theo mã, tên hàng', stdBtns('Bảng giá')) + tableHeader(cols) +
        emptyState('Không tìm thấy kết quả', 'Không tìm thấy hàng hóa nào.'));
}

function renderSubNhaCungCap() {
    var sidebar = filterPerson('Nhóm NCC') + filterSelect('Nợ hiện tại', ['Tất cả']) + filterToggle('Trạng thái', ['Tất cả', 'Đang giao dịch', 'Ngừng giao dịch']);
    var cols = [{ label: 'Mã NCC', flex: 1 }, { label: 'Tên nhà cung cấp', flex: 1.5 }, { label: 'Điện thoại', flex: 1 }, { label: 'Email', flex: 1 }, { label: 'Nợ hiện tại', flex: 1 }];
    return pageLayout(sidebar, actionsBar('Theo mã, tên NCC', stdBtns('Nhà cung cấp')) + tableHeader(cols) +
        emptyState('Không tìm thấy kết quả', 'Không tìm thấy nhà cung cấp nào.'));
}

function renderSubNhapHang() {
    var sidebar = filterTime('Thời gian') + filterPerson('Nhà cung cấp') +
        filterStatus([{ label: 'Phiếu tạm', checked: true }, { label: 'Đã nhập hàng', checked: true }, { label: 'Đã hủy' }]) +
        filterPerson('Người tạo');
    var cols = [{ label: 'Mã nhập hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Nhà cung cấp', flex: 1.5 }, { label: 'Cần trả NCC', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return pageLayout(sidebar, actionsBar('Theo mã nhập hàng', stdBtns('Nhập hàng')) + tableHeader(cols) +
        emptyState('Không tìm thấy kết quả', 'Không tìm thấy phiếu nhập hàng nào.'));
}

function renderSubChuyenHang() {
    var sidebar = filterTime('Thời gian') + filterPerson('Chi nhánh chuyển') + filterPerson('Chi nhánh nhận') +
        filterStatus([{ label: 'Đang chuyển', checked: true }, { label: 'Đã nhận', checked: true }, { label: 'Đã hủy' }]);
    var cols = [{ label: 'Mã chuyển hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Chi nhánh chuyển', flex: 1.2 }, { label: 'Chi nhánh nhận', flex: 1.2 }, { label: 'Trạng thái', flex: 0.8 }];
    return pageLayout(sidebar, actionsBar('Theo mã chuyển hàng',
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Chuyển hàng</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy phiếu chuyển hàng nào.'));
}

function renderSubKiemKho() {
    var sidebar = filterTime('Thời gian') +
        filterStatus([{ label: 'Phiếu tạm', checked: true }, { label: 'Đã cân bằng kho', checked: true }, { label: 'Đã hủy' }]) +
        filterPerson('Người tạo');
    var cols = [{ label: 'Mã kiểm kho', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Ngày cân bằng', flex: 1 }, { label: 'SL thực tế', flex: 0.8 }, { label: 'SL lệch', flex: 0.8 }, { label: 'Trạng thái', flex: 0.8 }];
    return pageLayout(sidebar, actionsBar('Theo mã kiểm kho',
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Kiểm kho</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy phiếu kiểm kho nào.'));
}

function renderSubTraHangNhap() {
    var sidebar = filterTime('Thời gian') + filterPerson('Nhà cung cấp') +
        filterStatus([{ label: 'Phiếu tạm', checked: true }, { label: 'Đã trả hàng', checked: true }, { label: 'Đã hủy' }]);
    var cols = [{ label: 'Mã trả hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Nhà cung cấp', flex: 1.5 }, { label: 'Giá trị trả', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return pageLayout(sidebar, actionsBar('Theo mã trả hàng nhập',
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Trả hàng nhập</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy phiếu trả hàng nhập nào.'));
}

function renderSubXuatHuy() {
    var sidebar = filterTime('Thời gian') +
        filterStatus([{ label: 'Phiếu tạm', checked: true }, { label: 'Đã xuất hủy', checked: true }, { label: 'Đã hủy' }]) +
        filterPerson('Người tạo');
    var cols = [{ label: 'Mã xuất hủy', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Giá trị xuất hủy', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return pageLayout(sidebar, actionsBar('Theo mã xuất hủy',
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Xuất hủy</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy phiếu xuất hủy nào.'));
}

function renderSubDatHangNhap() {
    var sidebar = filterTime('Thời gian') + filterPerson('Nhà cung cấp') +
        filterStatus([{ label: 'Đang thực hiện', checked: true }, { label: 'Hoàn thành', checked: true }, { label: 'Đã hủy' }]) +
        filterPerson('Người tạo');
    var cols = [{ label: 'Mã đặt hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Nhà cung cấp', flex: 1.5 }, { label: 'Tổng tiền', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return pageLayout(sidebar, actionsBar('Theo mã đặt hàng nhập',
        '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Đặt hàng nhập</button>' +
        '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy đơn đặt hàng nhập nào.'));
}

// ==================== ĐƠN HÀNG ====================

function hdHeaders() { return [{ label: 'Mã hóa đơn', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mã trả hàng', flex: 1 }, { label: 'Khách hàng', flex: 1.2 }, { label: 'Tổng tiền hàng', flex: 1 }, { label: 'Giảm giá', flex: 0.8 }, { label: 'Tổng sau giảm', flex: 1 }]; }
function thHeaders() { return [{ label: 'Mã trả hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mã hóa đơn gốc', flex: 1 }, { label: 'Khách hàng', flex: 1.2 }, { label: 'Giá trị trả', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }]; }
function dhHeaders() { return [{ label: 'Mã đặt hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Khách hàng', flex: 1.2 }, { label: 'Tổng tiền', flex: 1 }, { label: 'Còn phải thu', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }]; }
function vdHeaders() { return [{ label: 'Mã vận đơn', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Đối tác', flex: 1 }, { label: 'Người nhận', flex: 1.2 }, { label: 'COD', flex: 0.8 }, { label: 'Trạng thái', flex: 0.8 }]; }

function renderDonHangSub(title, searchPh, cols) {
    return pageLayout(renderDonHangSidebar(),
        actionsBar(searchPh,
            '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Tạo mới</button>' +
            '<button class="kv-btn kv-btn-primary"><i class="fas fa-file-import"></i> Import file</button>' +
            '<button class="kv-btn kv-btn-outline"><i class="fas fa-file-export"></i> Xuất file</button>' +
            '<button class="kv-btn-sm"><i class="fas fa-ellipsis-h"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy giao dịch nào phù hợp trong tháng này.'));
}

function renderDonHangSidebar() {
    return filterTime('Thời gian') +
        filterSection('Loại hóa đơn',
            '<div class="kv-filter-check"><input type="checkbox" checked><span>Không giao hàng</span></div>' +
            '<div class="kv-filter-check"><input type="checkbox" checked><span>Giao hàng</span></div>') +
        filterStatus([{ label: 'Đang xử lý', checked: true }, { label: 'Hoàn thành', checked: true }, { label: 'Không giao được' }, { label: 'Đã hủy' }]) +
        filterPerson('Đối tác giao hàng') + filterTime('Thời gian giao hàng') +
        filterPerson('Khu vực giao hàng') + filterPerson('Phương thức thanh toán') +
        filterPerson('Người tạo') + filterPerson('Người bán');
}

function renderDonHang(sub) {
    var subtabs = [{ key: 'hoadon', label: 'Hóa đơn' }, { key: 'trahang', label: 'Trả hàng' }, { key: 'dathang', label: 'Đặt hàng' }, { key: 'vandon', label: 'Vận đơn' }];
    var activeSub = sub || 'hoadon';
    var titles = { hoadon: 'Hóa đơn', trahang: 'Trả hàng', dathang: 'Đặt hàng', vandon: 'Vận đơn' };
    var colMap = { hoadon: hdHeaders(), trahang: thHeaders(), dathang: dhHeaders(), vandon: vdHeaders() };
    return pageTitle(titles[activeSub] || 'Hóa đơn') +
        '<div class="kv-subtabs">' + subtabs.map(function (t) {
            return '<button class="kv-subtab' + (t.key === activeSub ? ' active' : '') + '" data-sub="' + t.key + '" data-page="donhang">' + t.label + '</button>';
        }).join('') + '</div>' +
        renderDonHangSub(titles[activeSub], 'Theo mã hóa đơn', colMap[activeSub] || hdHeaders());
}

// ==================== KHÁCH HÀNG ====================

function renderKhachHang() {
    var sidebar = filterSelect('Nhóm khách hàng', ['Tất cả các nhóm']) +
        filterTime('Ngày tạo') + filterPerson('Người tạo') +
        filterToggle('Loại khách hàng', ['Tất cả', 'Cá nhân', 'Công ty']) +
        filterToggle('Giới tính', ['Tất cả', 'Nam', 'Nữ']) +
        filterTime('Ngày giao dịch cuối') +
        filterSection('Tổng bán', '<input class="kv-filter-input" placeholder="Từ" style="margin-bottom:4px"><input class="kv-filter-input" placeholder="Đến">') +
        filterToggle('Trạng thái', ['Tất cả', 'Đang hoạt động', 'Ngừng hoạt động']);

    var cols = [{ label: 'Mã khách hàng', flex: 1 }, { label: 'Tên khách hàng', flex: 1.2 }, { label: 'Điện thoại', flex: 1 }, { label: 'Nợ hiện tại', flex: 0.8 }, { label: 'Tổng bán', flex: 1 }, { label: 'Tổng bán trừ trả hàng', flex: 1.2 }];

    return pageTitle('Khách hàng') + pageLayout(sidebar,
        actionsBar('Theo mã, tên, số điện thoại',
            '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Khách hàng</button>' +
            '<button class="kv-btn kv-btn-primary"><i class="fas fa-file-import"></i> Import file</button>' +
            '<button class="kv-btn-sm"><i class="fas fa-ellipsis-h"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy khách hàng nào phù hợp.'));
}

// ==================== SỔ QUỸ ====================

function renderSoQuy() {
    var sidebar = filterSection('Quỹ tiền',
        '<div class="kv-filter-radio"><input type="radio" name="quy" checked><span>Tiền mặt</span></div>' +
        '<div class="kv-filter-radio"><input type="radio" name="quy"><span>Ngân hàng</span></div>' +
        '<div class="kv-filter-radio"><input type="radio" name="quy"><span>Ví điện tử</span></div>' +
        '<div class="kv-filter-radio"><input type="radio" name="quy"><span>Tổng quỹ</span></div>') +
        filterTime() +
        filterSection('Loại chứng từ',
            '<div class="kv-filter-check"><input type="checkbox"><span>Phiếu thu</span></div>' +
            '<div class="kv-filter-check"><input type="checkbox"><span>Phiếu chi</span></div>') +
        filterPerson('Loại thu chi') +
        filterStatus([{ label: 'Đã thanh toán', checked: true }, { label: 'Đã hủy' }]) +
        filterPerson('Người tạo') + filterPerson('Nhân viên');

    var summaryBar = '<div class="kv-summary-bar">' +
        '<div class="kv-summary-item"><span class="kv-summary-label">Quỹ đầu kỳ</span><span class="kv-summary-value">0</span></div>' +
        '<div class="kv-summary-item"><span class="kv-summary-label">Tổng thu</span><span class="kv-summary-value blue">0</span></div>' +
        '<div class="kv-summary-item"><span class="kv-summary-label">Tổng chi</span><span class="kv-summary-value red">0</span></div>' +
        '<div class="kv-summary-item"><span class="kv-summary-label">Tồn quỹ ⓘ</span><span class="kv-summary-value blue">0</span></div>' +
        '</div>';

    var cols = [{ label: 'Mã phiếu', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Loại thu chi', flex: 1.2 }, { label: 'Người nộp/nhận', flex: 1.2 }, { label: 'Giá trị', flex: 1 }];

    return pageTitle('Sổ quỹ tiền mặt') + pageLayout(sidebar, summaryBar +
        actionsBar('Theo mã phiếu',
            '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Phiếu thu</button>' +
            '<button class="kv-btn kv-btn-primary"><i class="fas fa-plus"></i> Phiếu chi</button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        tableHeader(cols) + emptyState('Không tìm thấy kết quả', 'Không tìm thấy chứng từ nào phù hợp.'));
}

// ==================== BÁO CÁO ====================

function bcSidebar(sub) {
    var s = filterToggle('Kiểu hiển thị', ['Biểu đồ', 'Báo cáo']) +
        filterSelect('Mối quan tâm', ['Thời gian']);
    switch (sub) {
        case 'bc_banhang':
            s += filterPerson('Bảng giá') + filterTime() + filterPerson('Phương thức bán hàng') + filterPerson('Kênh bán');
            break;
        case 'bc_hanghoa':
            s += filterPerson('Nhóm hàng') + filterTime() + filterPerson('Loại hàng');
            break;
        case 'bc_khachhang':
            s += filterPerson('Nhóm khách hàng') + filterTime() + filterPerson('Khu vực');
            break;
        case 'bc_nhanvien':
            s += filterPerson('Nhân viên') + filterTime();
            break;
        case 'bc_taichinh':
            s += filterTime() + filterPerson('Loại thu chi');
            break;
        case 'bc_cuoingay':
            s += filterTime() + filterPerson('Người tạo');
            break;
        case 'bc_dathang':
            s += filterPerson('Khách hàng') + filterTime() + filterPerson('Trạng thái');
            break;
        case 'bc_kenhban':
            s += filterPerson('Kênh bán') + filterTime();
            break;
        case 'bc_nhacungcap':
            s += filterPerson('Nhà cung cấp') + filterTime();
            break;
        default:
            s += filterPerson('Bảng giá') + filterTime() + filterPerson('Phương thức bán hàng') + filterPerson('Kênh bán');
    }
    return s;
}

function bcChartTitle(sub) {
    var m = {
        bc_banhang: 'Doanh thu thuần tuần này',
        bc_hanghoa: 'Doanh thu theo nhóm hàng',
        bc_khachhang: 'Doanh thu theo khách hàng',
        bc_nhanvien: 'Doanh thu theo nhân viên',
        bc_taichinh: 'Tổng thu chi trong kỳ',
        bc_cuoingay: 'Tổng kết cuối ngày',
        bc_dathang: 'Đặt hàng trong kỳ',
        bc_kenhban: 'Doanh thu theo kênh bán',
        bc_nhacungcap: 'Nhập hàng theo nhà cung cấp'
    };
    return m[sub] || 'Doanh thu thuần tuần này';
}

function bcPageTitle(sub) {
    var m = {
        bc_banhang: 'Báo cáo bán hàng',
        bc_hanghoa: 'Báo cáo hàng hóa',
        bc_khachhang: 'Báo cáo khách hàng',
        bc_nhanvien: 'Báo cáo nhân viên',
        bc_taichinh: 'Báo cáo tài chính',
        bc_cuoingay: 'Báo cáo cuối ngày',
        bc_dathang: 'Báo cáo đặt hàng',
        bc_kenhban: 'Báo cáo kênh bán hàng',
        bc_nhacungcap: 'Báo cáo nhà cung cấp'
    };
    return m[sub] || 'Báo cáo bán hàng';
}

function renderBaoCao(sub) {
    var tabs = [
        { key: 'bc_banhang', label: 'Bán hàng' }, { key: 'bc_hanghoa', label: 'Hàng hóa' },
        { key: 'bc_khachhang', label: 'Khách hàng' }, { key: 'bc_nhanvien', label: 'Nhân viên' },
        { key: 'bc_taichinh', label: 'Tài chính' }, { key: 'bc_cuoingay', label: 'Cuối ngày' },
        { key: 'bc_dathang', label: 'Đặt hàng' }, { key: 'bc_kenhban', label: 'Kênh bán hàng' },
        { key: 'bc_nhacungcap', label: 'Nhà cung cấp' }
    ];
    var activeSub = sub || 'bc_banhang';
    var sidebar = bcSidebar(activeSub);

    var chartArea = '<div style="padding:16px">' +
        '<h3 style="font-size:13px;font-weight:600;color:#555;margin-bottom:10px;text-align:center">' + bcChartTitle(activeSub) + '</h3>' +
        '<div class="kv-bc-chart">' +
        '<span class="kv-bc-chart-label" style="top:8px;left:8px">10 tr</span>' +
        '<span class="kv-bc-chart-label" style="bottom:8px;left:8px">0</span>' +
        '</div>' +
        '<div class="kv-bc-promo">' +
        '<i class="fas fa-money-bill-wave"></i>' +
        '<div><strong>Muốn đẩy mạnh doanh thu tháng tới?</strong>Bổ sung vốn lên tới 1 tỷ - Đăng ký online 100% - Giải ngân trong 24H.</div>' +
        '<i class="fas fa-chevron-right kv-bc-promo-arrow"></i>' +
        '</div></div>';

    return pageTitle(bcPageTitle(activeSub)) +
        '<div class="kv-subtabs">' + tabs.map(function (t) {
            return '<button class="kv-subtab' + (t.key === activeSub ? ' active' : '') + '" data-sub="' + t.key + '" data-page="baocao">' + t.label + '</button>';
        }).join('') + '</div>' +
        pageLayout(sidebar, chartArea);
}

// ==================== BÁN ONLINE ====================

function renderBanOnline() {
    var icons = [
        { icon: 'store', active: true }, { label: 'MKT', text: true },
        { sep: 'TMĐT' },
        { icon: 'shopping-bag' }, { icon: 'file-alt' }, { icon: 'calendar' }, { icon: 'sign-out-alt' },
        { sep: 'MXH' },
        { icon: 'comments' }, { icon: 'edit' }, { icon: 'copy' }, { icon: 'chart-bar' }, { icon: 'puzzle-piece' }, { icon: 'cog' }
    ];

    var sidebarHtml = icons.map(function (item) {
        if (item.sep) return '<div class="kv-online-label">' + item.sep + '</div>';
        if (item.text) return '<div class="kv-online-icon" style="background:#E53935;color:#fff;font-size:9px;border-radius:50%">' + item.label + '</div>';
        return '<div class="kv-online-icon' + (item.active ? ' active' : '') + '"><i class="fas fa-' + item.icon + '"></i></div>';
    }).join('');

    var mainHtml = '<div class="kv-online-section">' +
        '<div class="kv-online-section-title">Kết nối sàn thương mại điện tử</div>' +
        '<div class="kv-online-section-desc">Quản lý hàng hóa tập trung, xử lý đơn hàng nhanh chóng, kiểm soát chính xác hiệu quả bán hàng từ mọi kênh bán.</div>' +
        '<div class="kv-online-cards">' +
        '<div class="kv-online-card"><span style="color:#EE4D2D;font-size:18px">🛒</span> Shopee</div>' +
        '<div class="kv-online-card"><span style="font-size:18px">🎵</span> Tiktok Shop</div>' +
        '<div class="kv-online-card"><span style="color:#0F146D;font-size:18px">🛍️</span> Lazada</div>' +
        '<div class="kv-online-card"><span style="color:#1A94FF;font-size:18px">📦</span> Tiki</div>' +
        '</div></div>' +
        '<div class="kv-online-section">' +
        '<div class="kv-online-section-title">Kết nối mạng xã hội</div>' +
        '<div class="kv-online-section-desc">Tối ưu thời gian phản hồi và chăm sóc khách hàng, lên đơn cực nhanh, giúp tăng tỷ lệ chuyển đổi khách hàng tiềm năng.</div>' +
        '<div class="kv-online-cards">' +
        '<div class="kv-online-card"><span style="color:#1877F2;font-size:18px">📘</span> Facebook</div>' +
        '<div class="kv-online-card"><span style="font-size:18px">📷</span> Instagram</div>' +
        '</div></div>';

    return pageTitle('Bán hàng đa kênh - Quản lý nhãn tệnh cùng KiotViet') +
        '<div class="kv-online-layout">' +
        '<div class="kv-online-sidebar">' + sidebarHtml + '</div>' +
        '<div class="kv-online-main">' + mainHtml + '</div>' +
        '</div>';
}

// ==================== THIẾT LẬP (SETTINGS) ====================
function renderThietLap(sub) {
    sub = sub || 'hanghoa';
    var cats = [
        { id: 'hanghoa', icon: 'fas fa-globe', title: 'Hàng hóa', desc: 'Thông tin, Nhập hàng, Nhà cung cấp' },
        { id: 'donhang', icon: 'fas fa-exchange-alt', title: 'Đơn hàng', desc: 'Đặt hàng, Bán hàng, Trả hàng' },
        { id: 'tienich', icon: 'fas fa-truck', title: 'Tiện ích', desc: 'Giao hàng, Thanh toán' },
        { id: 'cuahang', icon: 'fas fa-store', title: 'Cửa hàng', desc: 'Thông tin, Người dùng, Chi nhánh, Bảo mật' },
        { id: 'dulieu', icon: 'fas fa-shield-alt', title: 'Dữ liệu và Lịch sử thao tác', desc: 'Khoá sổ, Lịch sử thao tác, Xoá dữ liệu' }
    ];
    var sidebar = '<div class="tl-sidebar">';
    cats.forEach(function (c) {
        sidebar += '<a class="tl-sidebar-item' + (c.id === sub ? ' active' : '') + '" href="javascript:void(0)" onclick="navigate(\'thietlap\',\'' + c.id + '\')">' +
            '<i class="' + c.icon + '" style="width:22px;text-align:center;font-size:16px;color:' + (c.id === sub ? '#4661D0' : '#666') + '"></i>' +
            '<div><div class="tl-item-title">' + c.title + '</div><div class="tl-item-desc">' + c.desc + '</div></div></a>';
    });
    sidebar += '</div>';
    var content = tlContent(sub);
    return '<div class="tl-page"><div class="tl-header"><i class="fas fa-cog" style="color:#4661D0;margin-right:8px"></i>Thiết lập</div><div class="tl-body">' + sidebar + '<div class="tl-content">' + content + '</div></div></div>';
}

function tlToggle(label, desc, checked) {
    return '<div class="tl-toggle-row"><div class="tl-toggle-info"><div class="tl-toggle-label">' + label + '</div>' + (desc ? '<div class="tl-toggle-desc">' + desc + '</div>' : '') + '</div>' +
        '<label class="tl-switch"><input type="checkbox"' + (checked ? ' checked' : '') + ' disabled><span class="tl-slider"></span></label></div>';
}
function tlInput(label, placeholder, value) {
    return '<div class="tl-field"><label>' + label + '</label><input type="text" placeholder="' + (placeholder || '') + '" value="' + (value || '') + '" readonly></div>';
}
function tlSelect(label, options) {
    return '<div class="tl-field"><label>' + label + '</label><select disabled>' + options.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></div>';
}
function tlSection(title, body) {
    return '<div class="tl-section"><div class="tl-section-title">' + title + '</div><div class="tl-section-body">' + body + '</div></div>';
}

function tlContent(sub) {
    switch (sub) {
        case 'hanghoa': return '<h2 class="tl-page-title">Thiết lập Hàng hóa</h2>' +
            tlSection('Quản lý hàng hóa',
                tlToggle('Cho phép bán khi hết hàng', 'Khi bật, vẫn cho phép thêm sản phẩm vào giỏ dù tồn kho = 0', true) +
                tlToggle('Hiển thị giá vốn', 'Hiện giá vốn trên danh sách hàng hóa', false) +
                tlToggle('Quản lý hàng theo lô/hạn sử dụng', 'Theo dõi lô hàng và ngày hết hạn', false) +
                tlToggle('Quản lý hàng theo Serial/IMEI', 'Theo dõi sản phẩm theo số serial', false) +
                tlSelect('Phương pháp tính giá vốn', ['Bình quân gia quyền', 'FIFO (Nhập trước xuất trước)'])
            ) +
            tlSection('Nhập hàng',
                tlToggle('Tự động cập nhật giá vốn khi nhập', 'Giá vốn tự động tính lại sau mỗi lần nhập', true) +
                tlToggle('Cho phép nhập hàng âm', 'Cho phép nhập số lượng trả âm', false)
            ) +
            tlSection('Nhà cung cấp',
                tlToggle('Bắt buộc chọn nhà cung cấp khi nhập hàng', 'Nhập hàng phải chọn NCC', true)
            );
        case 'donhang': return '<h2 class="tl-page-title">Thiết lập Đơn hàng</h2>' +
            tlSection('Bán hàng',
                tlToggle('Cho phép giá bán nhỏ hơn giá vốn', 'Cảnh báo khi bán dưới giá vốn', false) +
                tlToggle('Bắt buộc chọn khách hàng', 'Phải chọn KH trước khi thanh toán', false) +
                tlToggle('Tự động in hóa đơn sau khi thanh toán', 'In bill ngay khi bấm thanh toán', true) +
                tlSelect('Mẫu in mặc định', ['K80 (80mm)', 'K57 (57mm)', 'A4'])
            ) +
            tlSection('Đặt hàng',
                tlToggle('Cho phép đặt hàng khi hết tồn', 'Tạo đơn đặt dù hàng đã hết', true) +
                tlToggle('Tự động trừ tồn khi xác nhận đơn', 'Trừ tồn kho ngay khi xác nhận', false)
            ) +
            tlSection('Trả hàng',
                tlToggle('Cho phép trả hàng không cần hóa đơn gốc', 'Trả hàng mà không cần bill gốc', false) +
                tlSelect('Thời hạn cho phép trả hàng', ['7 ngày', '15 ngày', '30 ngày', 'Không giới hạn'])
            );
        case 'tienich': return '<h2 class="tl-page-title">Thiết lập Tiện ích</h2>' +
            tlSection('Giao hàng',
                tlToggle('Kích hoạt giao hàng', 'Bật tính năng giao hàng trong POS', true) +
                tlSelect('Đối tác vận chuyển mặc định', ['Tự giao hàng', 'GHTK', 'GHN', 'Viettel Post', 'J&T Express']) +
                tlToggle('Tự động tính phí vận chuyển', 'Tính phí ship dựa trên địa chỉ', false) +
                tlToggle('Cho phép COD', 'Thu hộ tiền khi giao hàng', true)
            ) +
            tlSection('Thanh toán',
                tlToggle('Thanh toán tiền mặt', '', true) +
                tlToggle('Chuyển khoản ngân hàng', '', true) +
                tlToggle('Quẹt thẻ (POS)', '', true) +
                tlInput('Số tài khoản ngân hàng', 'Nhập số tài khoản', '1234567890') +
                tlInput('Tên chủ tài khoản', 'Nhập tên', 'NGUYEN VAN A') +
                tlSelect('Ngân hàng', ['Vietcombank', 'Techcombank', 'BIDV', 'Agribank', 'MB Bank', 'VPBank', 'ACB', 'Sacombank'])
            );
        case 'cuahang': return '<h2 class="tl-page-title">Thiết lập Cửa hàng</h2>' +
            tlSection('Thông tin cửa hàng',
                tlInput('Tên cửa hàng', '', 'BHS HASU') +
                tlInput('Địa chỉ', '', '123 Đường ABC, TP. Hồ Chí Minh') +
                tlInput('Số điện thoại', '', '0901 234 567') +
                tlInput('Email', '', 'contact@bhshasu.vn') +
                tlInput('Mã số thuế', '', ' ')
            ) +
            tlSection('Người dùng',
                '<div class="tl-user-list">' +
                '<div class="tl-user-row"><span class="tl-user-avatar"><i class="fas fa-user"></i></span><div><strong>Tester</strong><div style="font-size:12px;color:#888">Chủ cửa hàng</div></div><span class="tl-badge-owner">Chủ CH</span></div>' +
                '<div class="tl-user-row"><span class="tl-user-avatar"><i class="fas fa-user"></i></span><div><strong>Nguyễn Bình</strong><div style="font-size:12px;color:#888">Thu ngân</div></div><span class="tl-badge-staff">Nhân viên</span></div>' +
                '<div class="tl-user-row"><span class="tl-user-avatar"><i class="fas fa-user"></i></span><div><strong>Tuấn Anh</strong><div style="font-size:12px;color:#888">Thu ngân</div></div><span class="tl-badge-staff">Nhân viên</span></div>' +
                '</div>'
            ) +
            tlSection('Chi nhánh',
                '<div class="tl-branch-card"><i class="fas fa-map-marker-alt" style="color:#E53935;margin-right:8px"></i><strong>BHS Binh Than</strong> <span style="color:#888;font-size:12px;margin-left:8px">(Chi nhánh chính)</span></div>'
            ) +
            tlSection('Bảo mật',
                tlToggle('Bắt buộc đổi mật khẩu định kỳ', 'Yêu cầu đổi mật khẩu mỗi 90 ngày', false) +
                tlToggle('Xác thực 2 lớp (2FA)', 'Bảo mật thêm bằng OTP', true)
            );
        case 'dulieu': return '<h2 class="tl-page-title">Dữ liệu và Lịch sử thao tác</h2>' +
            tlSection('Khoá sổ',
                tlToggle('Khoá sổ cuối ngày', 'Tự động khoá sổ vào 23:59', false) +
                tlSelect('Thời điểm khoá sổ', ['23:59', '22:00', '21:00', 'Tùy chỉnh'])
            ) +
            tlSection('Lịch sử thao tác',
                '<div class="tl-history">' +
                '<div class="tl-history-row"><span class="tl-hist-time">17:30 14/03</span><span class="tl-hist-user">Tester</span><span>Đã tạo hóa đơn #HD00000001</span></div>' +
                '<div class="tl-history-row"><span class="tl-hist-time">17:25 14/03</span><span class="tl-hist-user">Tester</span><span>Đã thêm sản phẩm mới</span></div>' +
                '<div class="tl-history-row"><span class="tl-hist-time">16:00 14/03</span><span class="tl-hist-user">Tuấn Anh</span><span>Đã thực hiện kiểm kho</span></div>' +
                '<div class="tl-history-row"><span class="tl-hist-time">15:30 14/03</span><span class="tl-hist-user">Nguyễn Bình</span><span>Đã nhập hàng từ NCC01</span></div>' +
                '</div>'
            ) +
            tlSection('Xoá dữ liệu',
                '<p style="color:#888;font-size:13px;margin-bottom:12px">Xoá toàn bộ dữ liệu sẽ không thể khôi phục. Vui lòng cân nhắc kỹ trước khi thực hiện.</p>' +
                '<button class="tl-danger-btn" onclick="alert(\'Tính năng này yêu cầu xác nhận từ chủ cửa hàng\')"><i class="fas fa-trash"></i> Xoá toàn bộ dữ liệu</button>'
            );
        default: return '';
    }
}

// ==================== HEADER DROPDOWN HANDLERS ====================

(function initHeaderDropdowns() {
    var panels = [
        { btn: 'giaohangBtn', panel: 'giaohangPanel' },
        { btn: 'branchBtn', panel: 'branchPanel' },
        { btn: 'notifBtn', panel: 'notifPanel' },
        { btn: 'settingsBtn', panel: 'settingsPanel' },
        { btn: 'userBtn', panel: 'userPanel' }
    ];

    function closeAll(except) {
        panels.forEach(function (p) {
            var el = document.getElementById(p.panel);
            if (el && el !== except) el.classList.remove('open');
        });
    }

    panels.forEach(function (p) {
        var btn = document.getElementById(p.btn);
        var panel = document.getElementById(p.panel);
        if (!btn || !panel) return;

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = panel.classList.contains('open');
            closeAll();
            if (!isOpen) panel.classList.add('open');
        });

        panel.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // Close all when clicking outside
    document.addEventListener('click', function () {
        closeAll();
    });

    // Notification tab switching
    document.querySelectorAll('.notif-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.notif-tab').forEach(function (t) {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
})();
