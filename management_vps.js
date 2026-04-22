// ============================================================
// Hasu Management - KiotViet-style UI v4
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    initNav();
    navigate('tongquan', null);
});

// ==================== NAVIGATION ====================

function initNav() {
    document.querySelectorAll('.kv-nav-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            setActiveTab(this);
            navigate(this.dataset.page, null);
        });
    });
    document.querySelectorAll('.kv-dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            var page = this.dataset.page;
            var sub = this.dataset.sub;
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
        nhanvien: renderNhanVien,
        soquy: renderSoQuy,
        phantich: renderPhanTich,
        baocao: renderPhanTich,
        banonline: renderBanOnline,
        thuekeToan: renderThueToanKe,
        thietlap: renderThietLap
    };
    if (map[page]) {
        c.innerHTML = map[page](sub);
        initPageEvents();
    }
}

function initPageEvents() {
    // Sub-tab clicks - re-render the full parent section with new active sub
    var pageRenderMap = {
        hanghoa: renderHangHoa,
        donhang: renderDonHang,
        khachhang: renderKhachHang,
        nhanvien: renderNhanVien,
        phantich: renderPhanTich,
        baocao: renderPhanTich
    };
    document.querySelectorAll('.kv-subtab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            var sub = this.dataset.sub;
            var page = this.dataset.page;
            var c = document.getElementById('pageContent');
            if (!c) return;
            if (pageRenderMap[page]) {
                c.innerHTML = pageRenderMap[page](sub);
                initPageEvents();
            }
        });
    });
    // Filter toggle buttons
    document.querySelectorAll('.kv-filter-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var g = this.closest('.kv-filter-toggle-group');
            if (g) g.querySelectorAll('.kv-filter-toggle').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
        });
    });
}

// ==================== KV LAYOUT HELPERS ====================

// KiotViet-style top action bar
function kvTopBar(title, searchPh, actionsHtml) {
    return '<div class="kv-topbar">' +
        '<span class="kv-topbar-title">' + title + '</span>' +
        '<button class="kv-filter-btn" title="Lọc"><i class="fas fa-filter"></i></button>' +
        '<div class="kv-topbar-search">' +
        '<i class="fas fa-search"></i>' +
        '<input placeholder="' + searchPh + '">' +
        '<i class="fas fa-sliders-h" style="color:#BABABA;cursor:pointer"></i>' +
        '</div>' +
        '<div class="kv-topbar-actions">' + actionsHtml + '</div>' +
        '</div>';
}

// KiotViet-style table head
function kvTableHead(cols) {
    return '<div class="kv-tbl-head">' +
        '<span class="kv-tcol kv-tcol-check"><input type="checkbox"></span>' +
        '<span class="kv-tcol kv-tcol-star"><i class="far fa-star"></i></span>' +
        cols.map(function (c) {
            return '<span class="kv-tcol" style="flex:' + (c.flex || 1) + ';' + (c.right ? 'text-align:right' : '') + '">' + c.label + '</span>';
        }).join('') +
        '</div>';
}

// KiotViet-style empty state
function kvEmpty(title, desc) {
    return '<div class="kv-kv-empty">' +
        '<div class="kv-kv-empty-icon">' +
        '<svg viewBox="0 0 64 64" fill="none"><rect x="8" y="20" width="48" height="36" rx="4" fill="#D0D9F5"/><path d="M8 32h12l4 6h16l4-6h12" stroke="#8898D4" stroke-width="2" fill="none"/><rect x="20" y="8" width="24" height="4" rx="2" fill="#B0BDE8"/></svg>' +
        '</div>' +
        '<div class="kv-kv-empty-title">' + title + '</div>' +
        (desc ? '<div class="kv-kv-empty-desc">' + desc + '</div>' : '') +
        '</div>';
}

// Full list page: topbar + [summary] + table head + body
function kvListPage(topbarHtml, summaryHtml, tableHeadHtml, bodyHtml, paginationHtml) {
    return '<div class="kv-list-page">' +
        topbarHtml +
        (summaryHtml || '') +
        '<div class="kv-table-wrapper">' +
        tableHeadHtml + bodyHtml +
        '</div>' +
        (paginationHtml || '') +
        '</div>';
}

// Standard action buttons (+ Import Export ≡ ⚙ ?)
function kvStdBtns(primaryLabel) {
    return '<button class="kv-btn-add" onclick="openProductForm()" title="' + primaryLabel + '"><i class="fas fa-plus"></i></button>' +
        '<button class="kv-btn-sm" title="Import"><i class="fas fa-file-import"></i></button>' +
        '<button class="kv-btn-sm" title="Xuất file"><i class="fas fa-file-export"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>';
}

function kvSimpleBtns(addLabel) {
    return '<button class="kv-btn-add" title="' + (addLabel || 'Tạo mới') + '"><i class="fas fa-plus"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-ellipsis-h"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>';
}

function kvPagination() {
    return '<div class="kv-pagination">' +
        '<span style="font-size:12px;color:#777">Hiển thị</span>' +
        '<select class="kv-per-page"><option>15 dòng</option><option>30 dòng</option><option>50 dòng</option></select>' +
        '</div>';
}

// Sub-tabs bar
function kvSubTabs(tabs, page, activeSub) {
    return '<div class="kv-subtabs">' + tabs.map(function (t) {
        return '<button class="kv-subtab' + (t.key === activeSub ? ' active' : '') + '" data-sub="' + t.key + '" data-page="' + (page || '') + '">' + t.label + '</button>';
    }).join('') + '</div>';
}

// Page title row (used with sub-tabs)
function kvPageTitle(title) {
    return '<div class="kv-page-header"><span class="kv-page-title">' + title + '</span></div>';
}

// ==================== TỔNG QUAN ====================

function renderTongQuan() {
    var activities = [
        { time: '25 ngày trước', user: 'Tester', action: 'bán đơn hàng', val: '168,000', icon: 'fas fa-receipt' },
        { time: '25 ngày trước', user: 'Tester', action: 'thực hiện kiểm hàng', val: '', icon: 'fas fa-clipboard-check' }
    ];
    var actHtml = activities.map(function (a) {
        return '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #F5F5F5">' +
            '<div style="width:36px;height:36px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="' + a.icon + '" style="color:#4661D0;font-size:14px"></i></div>' +
            '<div><div style="font-size:13px;color:#333"><a href="#" style="color:#4661D0;font-weight:500">' + a.user + '</a> vừa <a href="#" style="color:#4661D0">' + a.action + '</a>' + (a.val ? ' với giá trị <strong>' + a.val + '</strong>' : '') + '</div>' +
            '<div style="font-size:12px;color:#999;margin-top:3px">' + a.time + '</div></div>' +
            '</div>';
    }).join('');

    var todayCard = '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:18px 20px;margin-bottom:12px">' +
        '<div style="font-size:14px;font-weight:600;color:#333;margin-bottom:14px">Kết quả bán hàng hôm nay</div>' +
        '<div style="display:flex;gap:30px">' +
        '<div style="display:flex;align-items:center;gap:10px"><div style="width:36px;height:36px;border-radius:50%;background:#E3F2FD;display:flex;align-items:center;justify-content:center"><i class="fas fa-dollar-sign" style="color:#1565C0"></i></div><div><div style="font-size:12px;color:#777">Doanh thu</div><div style="font-size:20px;font-weight:700;color:#333">0</div></div></div>' +
        '<div style="display:flex;align-items:center;gap:10px"><div style="width:36px;height:36px;border-radius:50%;background:#FFF8E1;display:flex;align-items:center;justify-content:center"><i class="fas fa-undo-alt" style="color:#E65100"></i></div><div><div style="font-size:12px;color:#777">Trả hàng</div><div style="font-size:20px;font-weight:700;color:#333">0</div></div></div>' +
        '</div></div>';

    var chartCard = '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:18px 20px;margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:600;color:#333">Doanh thu thuần <span style="font-size:18px;font-weight:700;color:#1565C0;margin-left:8px">0</span></div>' +
        '<div style="display:flex;gap:6px;align-items:center">' +
        '<button class="kv-btn-sm" style="background:#EEF2FF;border-color:#C5CAE9"><i class="fas fa-chart-bar" style="color:#4661D0"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-chart-pie"></i></button>' +
        '<select class="kv-per-page"><option>Tháng này</option><option>Tuần này</option><option>Hôm nay</option></select>' +
        '</div></div>' +
        '<div style="display:flex;gap:16px;border-bottom:1px solid #EEE;padding-bottom:10px;margin-bottom:16px">' +
        '<span style="padding-bottom:10px;margin-bottom:-11px;border-bottom:2px solid #1565C0;font-size:13px;font-weight:600;color:#1565C0;cursor:pointer">Theo ngày</span>' +
        '<span style="font-size:13px;color:#888;cursor:pointer">Theo giờ</span>' +
        '<span style="font-size:13px;color:#888;cursor:pointer">Theo thứ</span>' +
        '</div>' +
        kvEmpty('Chưa có dữ liệu', '') +
        '</div>';

    var topCards = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">' +
        '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:16px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<span style="font-size:13px;font-weight:600;color:#333">Top 10 hàng bán chạy</span>' +
        '<div style="display:flex;gap:6px"><select class="kv-per-page" style="font-size:11px;padding:3px 6px"><option>Theo doanh thu thuần</option></select><select class="kv-per-page" style="font-size:11px;padding:3px 6px"><option>Tháng này</option></select></div>' +
        '</div>' + kvEmpty('Chưa có dữ liệu', '') + '</div>' +
        '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:16px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<span style="font-size:13px;font-weight:600;color:#333">Top 10 khách mua nhiều nhất</span>' +
        '<select class="kv-per-page" style="font-size:11px;padding:3px 6px"><option>Tháng này</option></select>' +
        '</div>' + kvEmpty('Chưa có dữ liệu', '') + '</div>' +
        '</div>';

    return '<div style="display:flex;gap:12px;padding:12px;flex:1;overflow-y:auto;background:#F2F2F2">' +
        '<div style="flex:1;min-width:0">' + todayCard + chartCard + topCards + '</div>' +
        '<div style="width:300px;flex-shrink:0">' +
        '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:16px">' +
        '<div style="font-size:14px;font-weight:600;color:#333;margin-bottom:12px">Hoạt động gần đây</div>' +
        actHtml + '</div></div>' +
        '</div>';
}

// ==================== HÀNG HÓA ====================

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
        { key: 'xuathuy', label: 'Xuất hủy' },
        { key: 'xuatnoibo', label: 'Xuất dùng nội bộ' }
    ];
    return kvSubTabs(tabs, 'hanghoa', active);
}

function renderHangHoa(sub) {
    var activeSub = sub || 'danhsach';
    var subMap = {
        thietlapgia: renderSubThietLapGia, nhacungcap: renderSubNhaCungCap,
        nhaphang: renderSubNhapHang, chuyenhang: renderSubChuyenHang,
        kiemkho: renderSubKiemKho, trahangnhap: renderSubTraHangNhap,
        xuathuy: renderSubXuatHuy, dathangnhap: renderSubDatHangNhap,
        xuatnoibo: renderSubXuatNoiBo, hoadondauvao: renderSubHoaDonDauVao
    };
    var content = subMap[activeSub] ? subMap[activeSub]() : renderSubDanhSach();
    return kvPageTitle('Hàng hóa') + hhSubTabs(activeSub) + content;
}

function renderSubDanhSach() {
    var prods = JSON.parse(localStorage.getItem('hasu_products') || '[]');
    if (prods.length === 0 && typeof products !== 'undefined' && products.length > 0) { prods = products; }
    var limit = Math.min(prods.length, 50);
    var rows = '';
    for (var j = 0; j < limit; j++) {
        var p = prods[j];
        var stockStyle = (p.stock || 0) <= 0 ? 'color:#C62828;font-weight:600' : '';
        var imgHtml = p.img ?
            '<img src="' + p.img + '" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #EEE">' :
            '<div style="width:36px;height:36px;border-radius:4px;background:#F0F0F0;display:flex;align-items:center;justify-content:center"><i class="fas fa-image" style="color:#CCC;font-size:14px"></i></div>';
        rows += '<div class="kv-tbl-row" onclick="openProductForm(' + j + ')">' +
            '<span class="kv-tcol kv-tcol-check"><input type="checkbox" onclick="event.stopPropagation()"></span>' +
            '<span class="kv-tcol kv-tcol-star"><i class="far fa-star" style="cursor:pointer"></i></span>' +
            '<span class="kv-tcol kv-tcol-img">' + imgHtml + '</span>' +
            '<span class="kv-tcol kv-tcol-code" style="flex:1">' + (p.code || '') + '</span>' +
            '<span class="kv-tcol" style="flex:2">' + (p.name || '') + '</span>' +
            '<span class="kv-tcol" style="flex:1;text-align:right">' + (p.price || 0).toLocaleString() + '</span>' +
            '<span class="kv-tcol" style="flex:1;text-align:right">' + (p.cost || 0).toLocaleString() + '</span>' +
            '<span class="kv-tcol" style="flex:0.8;text-align:right;' + stockStyle + '">' + (p.stock || 0).toLocaleString() + '</span>' +
            '<span class="kv-tcol" style="flex:0.6;text-align:center">' + (p.unit || 'Cái') + '</span>' +
            '</div>';
    }
    var infoBar = '<div style="padding:6px 16px;font-size:12px;color:#777;background:#FAFAFA;border-bottom:1px solid #EEE">Hiển thị ' + limit + ' / ' + prods.length + ' sản phẩm</div>';
    var cols = [
        { label: '', flex: 0.3 }, { label: 'Mã hàng', flex: 1 }, { label: 'Tên hàng', flex: 2 },
        { label: 'Giá bán', flex: 1, right: true }, { label: 'Giá vốn', flex: 1, right: true },
        { label: 'Tồn kho', flex: 0.8, right: true }, { label: 'ĐVT', flex: 0.6 }
    ];
    var topbar = kvTopBar('Hàng hóa', 'Theo mã, tên hàng',
        '<button class="kv-btn-add" onclick="openProductForm()" title="Tạo mới hàng hóa"><i class="fas fa-plus"></i></button>' +
        '<button class="kv-btn-sm btn-sync-all" title="Đồng bộ thiết bị" onclick="syncAllProducts()" style="background:#EEF2FF;color:#4661D0;border-color:#C5CAE9;width:auto;padding:0 10px"><i class="fas fa-sync-alt" style="margin-right:4px"></i> Đồng bộ thiết bị</button>' +
        '<button class="kv-btn-sm" title="Import"><i class="fas fa-file-import"></i></button>' +
        '<button class="kv-btn-sm" title="Xuất file"><i class="fas fa-file-export"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
        '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>');
    return kvListPage(topbar, null, kvTableHead(cols), infoBar + '<div id="productTableBody">' + rows + '</div>', kvPagination());
}

function renderSubThietLapGia() {
    var cols = [{ label: 'Mã hàng', flex: 1 }, { label: 'Tên hàng', flex: 2.5 }, { label: 'Giá vốn', flex: 0.8 }, { label: 'Giá nhập cuối', flex: 0.8 }, { label: 'Bảng giá chung', flex: 1 }];
    return kvListPage(
        kvTopBar('Thiết lập giá', 'Theo mã, tên hàng',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-import"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy hàng hóa nào.'), null);
}

function renderSubNhaCungCap() {
    var cols = [{ label: 'Mã NCC', flex: 1 }, { label: 'Tên nhà cung cấp', flex: 1.5 }, { label: 'Điện thoại', flex: 1 }, { label: 'Email', flex: 1 }, { label: 'Nợ hiện tại', flex: 1 }];
    return kvListPage(
        kvTopBar('Nhà cung cấp', 'Theo mã, tên NCC',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-import"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy nhà cung cấp nào.'), null);
}

function renderSubNhapHang() {
    var cols = [{ label: 'Mã nhập hàng', flex: 1 }, { label: 'Mã đặt hàng nhập', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mã NCC', flex: 1 }, { label: 'Cần trả NCC', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Nhập hàng', 'Theo mã phiếu nhập',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button><button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>'),
        null, kvTableHead(cols),
        kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy phiếu nhập hàng nào phù hợp trong tháng này.<br><a href="#" style="color:#0070D2">Nhấn vào đây</a> để tiếp tục tìm kiếm.'), kvPagination());
}

function renderSubChuyenHang() {
    var cols = [{ label: 'Mã chuyển hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Chi nhánh chuyển', flex: 1.2 }, { label: 'Chi nhánh nhận', flex: 1.2 }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Chuyển hàng', 'Theo mã chuyển hàng',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy phiếu chuyển hàng nào.'), null);
}

function renderSubKiemKho() {
    var cols = [{ label: 'Mã kiểm kho', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Ngày cân bằng', flex: 1 }, { label: 'SL thực tế', flex: 0.8, right: true }, { label: 'SL lệch', flex: 0.8, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Kiểm kho', 'Theo mã kiểm kho',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy phiếu kiểm kho nào.'), null);
}

function renderSubTraHangNhap() {
    var cols = [{ label: 'Mã trả hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Nhà cung cấp', flex: 1.5 }, { label: 'Giá trị trả', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Trả hàng nhập', 'Theo mã trả hàng',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy phiếu trả hàng nhập nào.'), null);
}

function renderSubXuatHuy() {
    var cols = [{ label: 'Mã xuất hủy', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Giá trị xuất hủy', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Xuất hủy', 'Theo mã xuất hủy',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy phiếu xuất hủy nào.'), null);
}

function renderSubDatHangNhap() {
    var cols = [{ label: 'Mã đặt hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Nhà cung cấp', flex: 1.5 }, { label: 'Tổng tiền', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Đặt hàng nhập', 'Theo mã đặt hàng',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy đơn đặt hàng nhập nào.'), null);
}

function renderSubXuatNoiBo() {
    var cols = [{ label: 'Mã phiếu', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mục đích', flex: 1.5 }, { label: 'Tổng giá trị', flex: 1, right: true }, { label: 'Người tạo', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Xuất dùng nội bộ', 'Theo mã phiếu',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy phiếu xuất nội bộ nào.'), null);
}

function renderSubHoaDonDauVao() {
    var cols = [{ label: 'Mã hóa đơn', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Nhà cung cấp', flex: 1.5 }, { label: 'Tổng tiền', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Hóa đơn đầu vào', 'Theo mã hóa đơn',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-import"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy hóa đơn đầu vào nào.'), null);
}

// ==================== ĐƠN HÀNG ====================

function hdHeaders() { return [{ label: 'Mã hóa đơn', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mã trả hàng', flex: 1 }, { label: 'Mã KH', flex: 0.8 }, { label: 'Khách hàng', flex: 1.2 }, { label: 'Tổng tiền hàng', flex: 1, right: true }, { label: 'Giảm giá', flex: 0.8, right: true }, { label: 'Tổng sau giảm', flex: 1, right: true }]; }
function thHeaders() { return [{ label: 'Mã trả hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mã hóa đơn gốc', flex: 1 }, { label: 'Mã KH', flex: 0.8 }, { label: 'Khách hàng', flex: 1.2 }, { label: 'Giá trị trả', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }]; }
function dhHeaders() { return [{ label: 'Mã đặt hàng', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Mã KH', flex: 0.8 }, { label: 'Khách hàng', flex: 1.2 }, { label: 'Tổng tiền', flex: 1, right: true }, { label: 'Còn phải thu', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }]; }
function vdHeaders() { return [{ label: 'Mã vận đơn', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Đối tác', flex: 1 }, { label: 'Người nhận', flex: 1.2 }, { label: 'COD', flex: 0.8, right: true }, { label: 'Trạng thái', flex: 0.8 }]; }
function dtgHeaders() { return [{ label: 'Mã đối tác', flex: 1 }, { label: 'Tên đối tác', flex: 1.5 }, { label: 'Điện thoại', flex: 1 }, { label: 'Vận đơn đang giao', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }]; }

function renderDonHangPage(title, searchPh, cols) {
    return kvListPage(
        kvTopBar(title, searchPh,
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-import"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-ellipsis-h"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>'),
        null, kvTableHead(cols),
        kvEmpty('Không tìm thấy kết quả', 'Không tìm thấy giao dịch nào phù hợp trong tháng này.<br><a href="#" style="color:#0070D2">Nhấn vào đây</a> để tiếp tục tìm kiếm.'),
        kvPagination());
}

function renderSubDoiTacGiaoHang() {
    return kvListPage(
        kvTopBar('Đối tác giao hàng', 'Theo mã, tên đối tác',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(dtgHeaders()), kvEmpty('Không tìm thấy kết quả', 'Chưa có đối tác giao hàng nào.'), null);
}

function renderDonHang(sub) {
    var activeSub = sub || 'hoadon';
    var tabs = [
        { key: 'dathang', label: 'Đặt hàng' },
        { key: 'hoadon', label: 'Hóa đơn' },
        { key: 'trahang', label: 'Trả hàng' },
        { key: 'doitacgiaohang', label: 'Đối tác giao hàng' },
        { key: 'vandon', label: 'Vận đơn' }
    ];
    var colMap = { hoadon: hdHeaders(), trahang: thHeaders(), dathang: dhHeaders(), vandon: vdHeaders(), doitacgiaohang: dtgHeaders() };
    var titleMap = { hoadon: 'Hóa đơn', trahang: 'Trả hàng', dathang: 'Đặt hàng', vandon: 'Vận đơn', doitacgiaohang: 'Đối tác giao hàng' };
    var searchMap = { hoadon: 'Theo mã hóa đơn', trahang: 'Theo mã trả hàng', dathang: 'Theo mã đặt hàng', vandon: 'Theo mã vận đơn', doitacgiaohang: 'Theo mã, tên đối tác' };
    return kvPageTitle('Đơn hàng') + kvSubTabs(tabs, 'donhang', activeSub) +
        renderDonHangPage(titleMap[activeSub] || 'Hóa đơn', searchMap[activeSub] || 'Tìm kiếm...', colMap[activeSub] || hdHeaders());
}

// ==================== KHÁCH HÀNG ====================

function khSubTabs(active) {
    var tabs = [
        { key: 'khachhang', label: 'Khách hàng' },
        { key: 'khuyenmai', label: 'Khuyến mãi' },
        { key: 'voucher', label: 'Voucher' },
        { key: 'coupon', label: 'Coupon' }
    ];
    return kvSubTabs(tabs, 'khachhang', active);
}

function renderKhachHang(sub) {
    var activeSub = sub || 'khachhang';
    var subMap = { khuyenmai: renderSubKhuyenMai, voucher: renderSubVoucher, coupon: renderSubCoupon };
    var content = subMap[activeSub] ? subMap[activeSub]() : renderSubKhachhang();
    return kvPageTitle('Khách hàng') + khSubTabs(activeSub) + content;
}

function renderSubKhachhang() {
    var cols = [{ label: 'Tên khách hàng', flex: 1.5 }, { label: 'Điện thoại', flex: 1 }, { label: 'Nợ hiện tại', flex: 0.8, right: true }, { label: 'Tổng bán', flex: 1, right: true }, { label: 'Tổng bán trừ trả hàng', flex: 1.2, right: true }];
    // Show real customers if any, otherwise empty
    var rows = '<div class="kv-tbl-row">' +
        '<span class="kv-tcol kv-tcol-check" style="padding-right:0;font-weight:700;text-align:right;color:#999">0</span>' +
        '<span class="kv-tcol kv-tcol-star"></span>' +
        '<span class="kv-tcol" style="flex:1.5"></span>' +
        '<span class="kv-tcol" style="flex:1"></span>' +
        '<span class="kv-tcol" style="flex:0.8;text-align:right;font-weight:700">0</span>' +
        '<span class="kv-tcol" style="flex:1;text-align:right;font-weight:700">2,175,500</span>' +
        '<span class="kv-tcol" style="flex:1.2;text-align:right;font-weight:700">2,175,500</span>' +
        '</div>';
    var sampleCustomers = [
        { name: 'Nam Anh', phone: '0974736099', debt: 0, total: 498000 },
        { name: 'c nhung', phone: '', debt: 0, total: 190000 },
        { name: 'Fast food', phone: '', debt: 0, total: 56000 },
        { name: 'HASU TOÀN CẦU', phone: '', debt: 0, total: 250000 }
    ];
    sampleCustomers.forEach(function (c) {
        rows += '<div class="kv-tbl-row">' +
            '<span class="kv-tcol kv-tcol-check"><input type="checkbox" onclick="event.stopPropagation()"></span>' +
            '<span class="kv-tcol kv-tcol-star"></span>' +
            '<span class="kv-tcol" style="flex:1.5;font-weight:500">' + c.name + '</span>' +
            '<span class="kv-tcol" style="flex:1">' + c.phone + '</span>' +
            '<span class="kv-tcol" style="flex:0.8;text-align:right">' + c.debt + '</span>' +
            '<span class="kv-tcol" style="flex:1;text-align:right">' + c.total.toLocaleString() + '</span>' +
            '<span class="kv-tcol" style="flex:1.2;text-align:right">' + c.total.toLocaleString() + '</span>' +
            '</div>';
    });
    return kvListPage(
        kvTopBar('Khách hàng', 'Theo mã, tên, số điện thoại',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-import"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-ellipsis-h"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>'),
        null, kvTableHead(cols), rows, kvPagination());
}

function renderSubKhuyenMai() {
    var cols = [{ label: '', flex: 0.3 }, { label: 'Mã CT', flex: 1 }, { label: 'Tên chương trình', flex: 2 }, { label: 'Hình thức', flex: 1.5 }, { label: 'Thời gian hiệu lực', flex: 1.5 }, { label: 'Chi nhánh', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    var promoData = [
        { code: 'KM000162', name: 'Km 50% mì', type: 'Giá bán theo số lượng mua', from: '07/01/2026', to: '31/05/2026', active: true, branches: 'Tất cả chi nhánh' },
        { code: 'KM000161', name: 'KM 50% sữa chua cận date', type: 'Giá bán theo số lượng mua', from: '20/03/2026', to: '30/04/2026', active: true, branches: 'BHS Bình Than' },
        { code: 'KM000160', name: 'Giảm 35% DDVS', type: 'Giá bán theo số lượng mua', from: '18/03/2026', to: '31/05/2026', active: true, branches: 'Tất cả chi nhánh' },
        { code: 'KM000159', name: 'KM 50% mỹ phẩm', type: 'Giá bán theo số lượng mua', from: '10/03/2026', to: '31/05/2026', active: true, branches: 'Tất cả chi nhánh' },
        { code: 'KM000158', name: 'Mua 1 tặng 1 ETU', type: 'Mua hàng tặng hàng', from: '12/02/2026', to: '31/05/2026', active: true, branches: 'Tất cả chi nhánh' },
        { code: 'KM000157', name: 'KM 50% hàng cận date', type: 'Giá bán theo số lượng mua', from: '13/03/2026', to: '31/05/2026', active: true, branches: 'BHS Hà Nội' },
        { code: 'KM000156', name: 'KM 20% hàng cận date', type: 'Giá bán theo số lượng mua', from: '14/03/2026', to: '31/03/2026', active: false, branches: 'BHS Đà Nẵng' }
    ];
    var rows = promoData.map(function (p) {
        var badge = p.active ?
            '<span class="kv-tcol-status-badge kv-status-active"><i class="fas fa-check" style="font-size:9px;margin-right:3px"></i>Đang áp dụng</span>' :
            '<span class="kv-tcol-status-badge kv-status-inactive"><i class="fas fa-times" style="font-size:9px;margin-right:3px"></i>Ngừng</span>';
        return '<div class="kv-tbl-row">' +
            '<span class="kv-tcol kv-tcol-check"><input type="checkbox" onclick="event.stopPropagation()"></span>' +
            '<span class="kv-tcol kv-tcol-star"></span>' +
            '<span class="kv-tcol" style="flex:0.3;text-align:center"><i class="fas fa-gift" style="color:#ff9800"></i></span>' +
            '<span class="kv-tcol kv-tcol-code" style="flex:1">' + p.code + '</span>' +
            '<span class="kv-tcol" style="flex:2;font-weight:500">' + p.name + '</span>' +
            '<span class="kv-tcol" style="flex:1.5">' + p.type + '</span>' +
            '<span class="kv-tcol" style="flex:1.5">' + p.from + ' - ' + p.to + '</span>' +
            '<span class="kv-tcol" style="flex:1">' + p.branches + '</span>' +
            '<span class="kv-tcol" style="flex:0.8">' + badge + '</span>' +
            '</div>';
    }).join('');
    return kvListPage(
        kvTopBar('Khuyến mãi', 'Mã, tên chương trình',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), rows, kvPagination());
}

function renderSubVoucher() {
    var cols = [{ label: 'Mã voucher', flex: 1 }, { label: 'Tên chương trình', flex: 2 }, { label: 'Loại giảm giá', flex: 1 }, { label: 'Thời gian hiệu lực', flex: 1.5 }, { label: 'Đã dùng/Tổng', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Voucher', 'Mã, tên voucher',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Chưa có voucher nào.'), null);
}

function renderSubCoupon() {
    var cols = [{ label: 'Mã coupon', flex: 1 }, { label: 'Tên chương trình', flex: 2 }, { label: 'Hình thức', flex: 1 }, { label: 'Thời gian hiệu lực', flex: 1.5 }, { label: 'Đã dùng/Tổng', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Coupon', 'Mã, tên coupon',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Không tìm thấy kết quả', 'Chưa có coupon nào.'), null);
}

// ==================== NHÂN VIÊN ====================

function nvSubTabs(active) {
    var tabs = [
        { key: 'danhsachnv', label: 'Danh sách nhân viên' },
        { key: 'lichlv', label: 'Lịch làm việc' },
        { key: 'chamcong', label: 'Bảng chấm công' },
        { key: 'luong', label: 'Bảng lương' },
        { key: 'hoahong', label: 'Bảng hoa hồng' },
        { key: 'thietlapnv', label: 'Thiết lập nhân viên' }
    ];
    return kvSubTabs(tabs, 'nhanvien', active);
}

function renderNhanVien(sub) {
    var activeSub = sub || 'danhsachnv';
    var subMap = {
        lichlv: renderSubLichLamViec, chamcong: renderSubChamCong,
        luong: renderSubLuong, hoahong: renderSubHoaHong, thietlapnv: renderSubThietLapNV
    };
    var content = subMap[activeSub] ? subMap[activeSub]() : renderSubDanhSachNV();
    return kvPageTitle('Nhân viên') + nvSubTabs(activeSub) + content;
}

function renderSubDanhSachNV() {
    var cols = [{ label: 'Tên nhân viên', flex: 1.5 }, { label: 'Điện thoại', flex: 1 }, { label: 'Chức vụ', flex: 1 }, { label: 'Chi nhánh', flex: 1 }, { label: 'Trạng thái', flex: 0.8 }];
    var staffData = [
        { name: 'Tester', phone: '', role: 'Chủ cửa hàng', branch: 'BHS Bình Than', active: true },
        { name: 'Nguyễn Bình', phone: '', role: 'Thu ngân', branch: 'BHS Bình Than', active: true },
        { name: 'Tuấn Anh', phone: '', role: 'Thu ngân', branch: 'BHS Bình Than', active: true }
    ];
    var rows = staffData.map(function (s) {
        var badge = s.active ?
            '<span class="kv-tcol-status-badge kv-status-active">Đang làm việc</span>' :
            '<span class="kv-tcol-status-badge kv-status-inactive">Đã nghỉ</span>';
        return '<div class="kv-tbl-row">' +
            '<span class="kv-tcol kv-tcol-check"><input type="checkbox" onclick="event.stopPropagation()"></span>' +
            '<span class="kv-tcol kv-tcol-star"></span>' +
            '<span class="kv-tcol" style="flex:1.5;font-weight:500;display:flex;align-items:center;gap:8px">' +
            '<div style="width:32px;height:32px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-user" style="color:#4661D0;font-size:12px"></i></div>' +
            s.name + '</span>' +
            '<span class="kv-tcol" style="flex:1">' + s.phone + '</span>' +
            '<span class="kv-tcol" style="flex:1">' + s.role + '</span>' +
            '<span class="kv-tcol" style="flex:1">' + s.branch + '</span>' +
            '<span class="kv-tcol" style="flex:0.8">' + badge + '</span>' +
            '</div>';
    }).join('');
    return kvListPage(
        kvTopBar('Danh sách nhân viên', 'Theo tên, số điện thoại',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-import"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), rows, kvPagination());
}

function renderSubLichLamViec() {
    return '<div class="kv-list-page">' +
        kvTopBar('Lịch làm việc', 'Theo tên nhân viên',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>') +
        '<div class="kv-table-wrapper">' + kvEmpty('Chưa có lịch làm việc', 'Tạo lịch làm việc để theo dõi giờ làm của nhân viên.') + '</div></div>';
}

function renderSubChamCong() {
    var cols = [{ label: 'Tên nhân viên', flex: 1.5 }, { label: 'Chức vụ', flex: 1 }, { label: 'Tổng giờ làm', flex: 1 }, { label: 'Số ngày làm', flex: 0.8 }, { label: 'Vắng mặt', flex: 0.8 }, { label: 'Tháng', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Bảng chấm công', 'Theo tên nhân viên',
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Chưa có dữ liệu', 'Chưa có dữ liệu chấm công trong tháng này.'), null);
}

function renderSubLuong() {
    var cols = [{ label: 'Tên nhân viên', flex: 1.5 }, { label: 'Chức vụ', flex: 1 }, { label: 'Lương cơ bản', flex: 1, right: true }, { label: 'Phụ cấp', flex: 1, right: true }, { label: 'Khấu trừ', flex: 1, right: true }, { label: 'Thực lĩnh', flex: 1, right: true }, { label: 'Trạng thái', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Bảng lương', 'Theo tên nhân viên',
            '<button class="kv-btn-add"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button><button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Chưa có dữ liệu', 'Chưa có dữ liệu bảng lương.'), null);
}

function renderSubHoaHong() {
    var cols = [{ label: 'Tên nhân viên', flex: 1.5 }, { label: 'Sản phẩm', flex: 2 }, { label: 'Doanh số', flex: 1, right: true }, { label: 'Tỉ lệ HH', flex: 0.8 }, { label: 'Hoa hồng', flex: 1, right: true }, { label: 'Tháng', flex: 0.8 }];
    return kvListPage(
        kvTopBar('Bảng hoa hồng', 'Theo tên nhân viên',
            '<button class="kv-btn-sm"><i class="fas fa-file-export"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>'),
        null, kvTableHead(cols), kvEmpty('Chưa có dữ liệu', 'Chưa có dữ liệu hoa hồng.'), null);
}

function renderSubThietLapNV() {
    return '<div class="kv-list-page"><div class="kv-table-wrapper" style="padding:24px">' +
        '<div style="max-width:600px">' +
        '<h3 style="font-size:15px;font-weight:600;color:#333;margin-bottom:16px">Thiết lập nhân viên</h3>' +
        tlSection('Chấm công',
            tlToggle('Bật tính năng chấm công', 'Theo dõi giờ ra vào của nhân viên', false) +
            tlSelect('Phương thức chấm công', ['Thủ công', 'Vân tay', 'Thẻ từ'])
        ) +
        tlSection('Bảng lương',
            tlToggle('Tự động tính lương cuối tháng', 'Tính lương dựa trên chấm công', false) +
            tlToggle('Tính lương theo ca làm việc', 'Chia lương theo từng ca', false) +
            tlSelect('Kỳ trả lương', ['Cuối tháng', '15 và cuối tháng', 'Hàng tuần'])
        ) +
        tlSection('Hoa hồng',
            tlToggle('Bật tính năng hoa hồng', 'Tính hoa hồng theo doanh số bán hàng', false) +
            tlSelect('Loại hoa hồng', ['Theo sản phẩm', 'Theo doanh số', 'Theo đơn hàng'])
        ) +
        '<div style="margin-top:20px"><button style="padding:8px 20px;background:#4661D0;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;font-weight:500" onclick="showToast(\'Đã lưu thiết lập\',\'success\')">Lưu thiết lập</button></div>' +
        '</div></div></div>';
}

// ==================== SỔ QUỸ ====================

function renderSoQuy() {
    var cols = [{ label: 'Mã phiếu', flex: 1 }, { label: 'Thời gian', flex: 1 }, { label: 'Loại thu chi', flex: 1.2 }, { label: 'Người nộp/nhận', flex: 1.2 }, { label: 'Giá trị', flex: 1, right: true }];
    var summary = '<div class="kv-summary-strip">' +
        '<div class="kv-sum-item"><span class="kv-sum-label">Tổng thu</span><span class="kv-sum-value blue">0</span></div>' +
        '<div class="kv-sum-item"><span class="kv-sum-label">Tổng chi</span><span class="kv-sum-value red">0</span></div>' +
        '<div class="kv-sum-item"><span class="kv-sum-label">Tồn quỹ <i class="fas fa-info-circle" style="font-size:11px;color:#999"></i></span><span class="kv-sum-value green">168,000</span></div>' +
        '</div>';
    return kvListPage(
        kvTopBar('Sổ quỹ tiền mặt', 'Theo mã phiếu',
            '<button class="kv-btn-add" title="Phiếu thu" style="background:#1565C0"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-add" title="Phiếu chi"><i class="fas fa-plus"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-list"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-cog"></i></button>' +
            '<button class="kv-btn-sm"><i class="fas fa-question-circle"></i></button>'),
        summary, kvTableHead(cols),
        kvEmpty('Không tìm thấy giao dịch nào phù hợp', ''), kvPagination());
}

// ==================== PHÂN TÍCH ====================

function renderPhanTich(sub) {
    var activeSub = sub || 'pt_kinhdoanh';
    var tabs = [
        { key: 'pt_kinhdoanh', label: 'Kinh doanh' },
        { key: 'pt_hanghoa', label: 'Hàng hóa' },
        { key: 'pt_khachhang', label: 'Khách hàng' },
        { key: 'pt_hieuqua', label: 'Hiệu quả' },
        { key: 'pt_cuoingay', label: 'Cuối ngày' },
        { key: 'pt_banhang', label: 'Bán hàng' },
        { key: 'pt_dathang', label: 'Đặt hàng' },
        { key: 'pt_nhacungcap', label: 'Nhà cung cấp' },
        { key: 'pt_nhanvien', label: 'Nhân viên' },
        { key: 'pt_kenhban', label: 'Kênh bán hàng' },
        { key: 'pt_taichinh', label: 'Tài chính' }
    ];
    var titleMap = {
        pt_kinhdoanh: 'Phân tích kinh doanh', pt_hanghoa: 'Phân tích hàng hóa',
        pt_khachhang: 'Phân tích khách hàng', pt_hieuqua: 'Phân tích hiệu quả',
        pt_cuoingay: 'Báo cáo cuối ngày', pt_banhang: 'Báo cáo bán hàng',
        pt_dathang: 'Báo cáo đặt hàng', pt_nhacungcap: 'Báo cáo nhà cung cấp',
        pt_nhanvien: 'Báo cáo nhân viên', pt_kenhban: 'Báo cáo kênh bán hàng',
        pt_taichinh: 'Báo cáo tài chính'
    };
    var chartLabel = titleMap[activeSub] || 'Phân tích kinh doanh';
    var chartContent = '<div class="kv-phantich-layout">' +
        kvSubTabs(tabs, 'phantich', activeSub) +
        '<div class="kv-phantich-body">' +
        '<div class="kv-phantich-sidebar">' +
        filterSection('Kiểu hiển thị', '<div style="display:flex;gap:4px"><button class="kv-filter-toggle active" style="background:#EEF2FF;color:#4661D0;border-color:#C5CAE9">Biểu đồ</button><button class="kv-filter-toggle">Báo cáo</button></div>') +
        filterSection('Mối quan tâm', '<select class="kv-filter-select"><option>Thời gian</option></select>') +
        filterTime() +
        '</div>' +
        '<div class="kv-phantich-main">' +
        '<h3 style="font-size:14px;font-weight:600;color:#555;margin-bottom:12px;text-align:center">' + chartLabel + '</h3>' +
        '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;height:220px;display:flex;align-items:center;justify-content:center;margin-bottom:16px">' +
        kvEmpty('Chưa có dữ liệu', '') +
        '</div>' +
        '<div style="background:#E3F2FD;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:14px">' +
        '<i class="fas fa-money-bill-wave" style="color:#1565C0;font-size:20px;flex-shrink:0"></i>' +
        '<div style="flex:1"><strong style="font-size:13px">Muốn đẩy mạnh doanh thu tháng tới?</strong><div style="font-size:12px;color:#555;margin-top:3px">Bổ sung vốn lên tới 1 tỷ - Đăng ký online 100% - Giải ngân trong 24H.</div></div>' +
        '<i class="fas fa-chevron-right" style="color:#1565C0"></i>' +
        '</div></div></div></div>';
    return kvPageTitle('Phân tích') + chartContent;
}

// Filter helpers (kept for renderPhanTich)
function filterSection(label, content) {
    return '<div class="kv-filter-section"><div class="kv-filter-label">' + label + '</div>' + content + '</div>';
}
function filterTime(label) {
    return filterSection(label || 'Thời gian',
        '<button class="kv-tp-btn"><span>Tháng này</span><i class="fas fa-chevron-right"></i></button>' +
        '<div class="kv-filter-radio"><input type="radio"><span>Tùy chỉnh</span><i class="far fa-calendar-alt" style="margin-left:auto"></i></div>');
}

// ==================== BÁN ONLINE ====================

function renderBanOnline(sub) {
    var activeSub = sub || 'banonline';
    if (activeSub === 'websitebanhang') return kvPageTitle('Website bán hàng') + renderSubWebsiteBanHang();
    return kvPageTitle('Bán hàng đa kênh') + renderSubBanOnline();
}

function renderSubBanOnline() {
    var icons = [
        { icon: 'store', active: true }, { label: 'MKT', text: true },
        { sep: 'TMĐT' },
        { icon: 'shopping-bag' }, { icon: 'file-alt' }, { icon: 'calendar' }, { icon: 'sign-out-alt' },
        { sep: 'MXH' },
        { icon: 'comments' }, { icon: 'edit' }, { icon: 'copy' }, { icon: 'chart-bar' }, { icon: 'puzzle-piece' }, { icon: 'cog' }
    ];
    var sidebarHtml = icons.map(function (item) {
        if (item.sep) return '<div class="kv-online-label" style="font-size:10px;color:#999;padding:4px 0;text-align:center">' + item.sep + '</div>';
        if (item.text) return '<div class="kv-online-icon" style="background:#E53935;color:#fff;font-size:9px;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:2px auto;cursor:pointer">' + item.label + '</div>';
        return '<div class="kv-online-icon' + (item.active ? ' active' : '') + '" style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:2px auto;' + (item.active ? 'background:#EEF2FF;' : '') + '"><i class="fas fa-' + item.icon + '" style="color:' + (item.active ? '#4661D0' : '#666') + '"></i></div>';
    }).join('');
    var mainHtml = '<div style="padding:24px">' +
        '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:20px;margin-bottom:16px">' +
        '<div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px">Kết nối sàn thương mại điện tử</div>' +
        '<div style="font-size:13px;color:#666;margin-bottom:16px">Quản lý hàng hóa tập trung, xử lý đơn hàng nhanh chóng, kiểm soát chính xác hiệu quả bán hàng từ mọi kênh bán.</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '<div style="padding:12px 20px;border:1px solid #E0E0E0;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;transition:border-color .2s" onmouseover="this.style.borderColor=\'#4661D0\'" onmouseout="this.style.borderColor=\'#E0E0E0\'"><span style="color:#EE4D2D;font-size:20px">🛒</span> Shopee</div>' +
        '<div style="padding:12px 20px;border:1px solid #E0E0E0;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;transition:border-color .2s" onmouseover="this.style.borderColor=\'#4661D0\'" onmouseout="this.style.borderColor=\'#E0E0E0\'"><span style="font-size:20px">🎵</span> Tiktok Shop</div>' +
        '<div style="padding:12px 20px;border:1px solid #E0E0E0;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;transition:border-color .2s" onmouseover="this.style.borderColor=\'#4661D0\'" onmouseout="this.style.borderColor=\'#E0E0E0\'"><span style="color:#0F146D;font-size:20px">🛍️</span> Lazada</div>' +
        '<div style="padding:12px 20px;border:1px solid #E0E0E0;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;transition:border-color .2s" onmouseover="this.style.borderColor=\'#4661D0\'" onmouseout="this.style.borderColor=\'#E0E0E0\'"><span style="color:#1A94FF;font-size:20px">📦</span> Tiki</div>' +
        '</div></div>' +
        '<div style="background:#fff;border-radius:8px;border:1px solid #E8E8E8;padding:20px">' +
        '<div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px">Kết nối mạng xã hội</div>' +
        '<div style="font-size:13px;color:#666;margin-bottom:16px">Tối ưu thời gian phản hồi và chăm sóc khách hàng, lên đơn cực nhanh.</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '<div style="padding:12px 20px;border:1px solid #E0E0E0;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500" onmouseover="this.style.borderColor=\'#1877F2\'" onmouseout="this.style.borderColor=\'#E0E0E0\'"><span style="color:#1877F2;font-size:20px">📘</span> Facebook</div>' +
        '<div style="padding:12px 20px;border:1px solid #E0E0E0;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500" onmouseover="this.style.borderColor=\'#E1306C\'" onmouseout="this.style.borderColor=\'#E0E0E0\'"><span style="font-size:20px">📷</span> Instagram</div>' +
        '</div></div></div>';
    return '<div class="kv-online-layout">' +
        '<div class="kv-online-sidebar">' + sidebarHtml + '</div>' +
        '<div class="kv-online-main">' + mainHtml + '</div>' +
        '</div>';
}

function renderSubWebsiteBanHang() {
    return '<div style="display:flex;flex-direction:column;flex:1;align-items:center;justify-content:center;padding:40px;background:#F8F9FB">' +
        '<div style="background:#fff;border-radius:12px;border:1px solid #E8E8E8;padding:40px;max-width:500px;width:100%;text-align:center">' +
        '<i class="fas fa-globe" style="font-size:48px;color:#4661D0;margin-bottom:16px"></i>' +
        '<h3 style="font-size:18px;font-weight:700;color:#333;margin-bottom:8px">Website bán hàng</h3>' +
        '<p style="font-size:14px;color:#666;line-height:1.6;margin-bottom:20px">Tạo website bán hàng chuyên nghiệp, đồng bộ sản phẩm và đơn hàng tự động với Hasu.</p>' +
        '<button style="padding:10px 24px;background:#4661D0;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;font-weight:500">Kích hoạt ngay</button>' +
        '</div></div>';
}

// ==================== THUẾ & KẾ TOÁN ====================

function renderThueToanKe() {
    var cards = [
        { icon: 'fas fa-file-invoice', title: 'Hóa đơn điện tử', desc: 'Phát hành hóa đơn VAT điện tử, liên kết trực tiếp với cơ quan thuế.', action: 'Kích hoạt' },
        { icon: 'fas fa-chart-line', title: 'Báo cáo thuế', desc: 'Tổng hợp dữ liệu để lập báo cáo thuế GTGT, thuế thu nhập doanh nghiệp.', action: 'Xem báo cáo' },
        { icon: 'fas fa-calculator', title: 'Kế toán tổng hợp', desc: 'Đồng bộ dữ liệu bán hàng, nhập hàng sang phần mềm kế toán.', action: 'Tích hợp' },
        { icon: 'fas fa-book-open', title: 'Sổ sách kế toán', desc: 'Quản lý sổ nhật ký, sổ cái, bảng cân đối kế toán tự động.', action: 'Xem sổ sách' }
    ];
    var cardsHtml = cards.map(function (c) {
        return '<div class="kv-thue-card">' +
            '<div style="display:flex;align-items:flex-start;gap:14px">' +
            '<div style="width:44px;height:44px;border-radius:10px;background:#EEF2FF;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="' + c.icon + '" style="font-size:20px;color:#4661D0"></i></div>' +
            '<div style="flex:1"><div style="font-size:14px;font-weight:600;color:#333;margin-bottom:6px">' + c.title + '</div>' +
            '<div style="font-size:13px;color:#666;line-height:1.5;margin-bottom:12px">' + c.desc + '</div>' +
            '<button style="padding:6px 16px;background:#4661D0;color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'#3751B5\'" onmouseout="this.style.background=\'#4661D0\'">' + c.action + '</button>' +
            '</div></div></div>';
    }).join('');
    var newBadge = '<span class="kv-badge-new" style="font-size:11px;padding:2px 8px;border-radius:12px;margin-left:8px;vertical-align:middle">Mới</span>';
    return '<div style="display:flex;flex-direction:column;flex:1;overflow:hidden">' +
        '<div class="kv-page-header"><span class="kv-page-title">Thuế &amp; Kế toán ' + newBadge + '</span></div>' +
        '<div class="kv-thue-container">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:900px">' + cardsHtml + '</div>' +
        '<div style="margin-top:20px;padding:20px;background:#FFF8E1;border-radius:8px;border:1px solid #FFD54F;max-width:900px">' +
        '<div style="display:flex;align-items:center;gap:10px"><i class="fas fa-info-circle" style="color:#F57F17;font-size:18px"></i>' +
        '<div><strong style="font-size:13px;color:#333">Tính năng đang trong giai đoạn phát triển</strong><div style="font-size:12px;color:#666;margin-top:3px">Một số tính năng thuế và kế toán nâng cao sẽ sớm được cập nhật. Liên hệ 1900 6522 để biết thêm chi tiết.</div></div></div>' +
        '</div></div></div>';
}

// ==================== THIẾT LẬP ====================

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
    return '<div class="tl-page"><div class="tl-header"><i class="fas fa-cog" style="color:#4661D0;margin-right:8px"></i>Thiết lập</div><div class="tl-body">' + sidebar + '<div class="tl-content">' + tlContent(sub) + '</div></div></div>';
}

function tlToggle(label, desc, checked) {
    return '<div class="tl-toggle-row"><div class="tl-toggle-info"><div class="tl-toggle-label">' + label + '</div>' + (desc ? '<div class="tl-toggle-desc">' + desc + '</div>' : '') + '</div>' +
        '<label class="tl-switch"><input type="checkbox"' + (checked ? ' checked' : '') + ' onchange="showToast(\'Đã cập nhật thiết lập\',\'success\')"><span class="tl-slider"></span></label></div>';
}
function tlInput(label, placeholder, value) {
    return '<div class="tl-field"><label>' + label + '</label><input type="text" placeholder="' + (placeholder || '') + '" value="' + (value || '') + '" onblur="showToast(\'Đã lưu ' + label + '\',\'success\')"></div>';
}
function tlSelect(label, options) {
    return '<div class="tl-field"><label>' + label + '</label><select onchange="showToast(\'Đã cập nhật ' + label + '\',\'success\')">' + options.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></div>';
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
                '<button class="tl-danger-btn" onclick="confirmDeleteAll()"><i class="fas fa-trash"></i> Xoá toàn bộ dữ liệu</button>'
            );
        default: return '';
    }
}

function confirmDeleteAll() {
    openModal('Xác nhận xoá dữ liệu',
        '<div style="text-align:center;padding:10px 0">' +
        '<i class="fas fa-exclamation-triangle" style="font-size:40px;color:#E53935;margin-bottom:16px"></i>' +
        '<p style="font-size:14px;color:#333;margin-bottom:8px"><strong>Bạn có chắc chắn muốn xoá toàn bộ dữ liệu?</strong></p>' +
        '<p style="font-size:13px;color:#666;margin-bottom:20px">Hành động này không thể hoàn tác. Tất cả giao dịch, hàng hóa và dữ liệu sẽ bị xoá vĩnh viễn.</p>' +
        '<div style="display:flex;gap:10px;justify-content:center">' +
        '<button onclick="closeModal()" style="padding:8px 20px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;font-size:13px">Hủy</button>' +
        '<button onclick="closeModal();showToast(\'Tính năng này yêu cầu xác nhận từ chủ cửa hàng\',\'error\')" style="padding:8px 20px;background:#E53935;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px">Xác nhận xoá</button>' +
        '</div></div>', '400px');
}

// ==================== PRODUCT FORM ====================

var _ucRows = [];

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
        '<div style="margin:16px 0 12px;padding:14px;background:#F8FBFF;border:1px solid #D6E8F7;border-radius:6px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<span style="font-weight:600;color:#0090DA;font-size:13px"><i class="fas fa-exchange-alt" style="margin-right:6px"></i>Đơn vị quy đổi</span>' +
        '<button onclick="addUCRow()" style="padding:4px 12px;background:#0090DA;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px"><i class="fas fa-plus" style="margin-right:4px"></i>Thêm ĐVT</button>' +
        '</div>' +
        '<div id="ucTableWrap">' + renderUCTable() + '</div>' +
        '</div>' +
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
    var html = '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#E8F4FD"><th style="padding:6px 8px;text-align:left;border:1px solid #D6E8F7">Tên ĐVT</th><th style="padding:6px 8px;text-align:center;border:1px solid #D6E8F7">Quy đổi (×)</th><th style="padding:6px 8px;text-align:right;border:1px solid #D6E8F7">Giá bán</th><th style="padding:6px 8px;width:36px;border:1px solid #D6E8F7"></th></tr>';
    for (var i = 0; i < _ucRows.length; i++) {
        var r = _ucRows[i];
        html += '<tr><td style="padding:4px 6px;border:1px solid #E0E0E0"><input type="text" value="' + (r.name || '') + '" style="width:100%;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:12px" onchange="updateUCRow(' + i + ',\'name\',this.value)" placeholder="VD: Lốc, Thùng"></td>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0;text-align:center"><input type="number" value="' + (r.factor || 1) + '" min="1" style="width:60px;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:12px;text-align:center" onchange="updateUCRow(' + i + ',\'factor\',this.value)"></td>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0;text-align:right"><input type="number" value="' + (r.price || 0) + '" style="width:100%;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:12px;text-align:right" onchange="updateUCRow(' + i + ',\'price\',this.value)"></td>' +
            '<td style="padding:4px 6px;border:1px solid #E0E0E0;text-align:center"><button onclick="removeUCRow(' + i + ')" style="background:none;border:none;color:#D32F2F;cursor:pointer;font-size:14px"><i class="fas fa-trash-alt"></i></button></td></tr>';
    }
    return html + '</table>';
}

function addUCRow() { _ucRows.push({ name: '', factor: 1, price: 0 }); var w = document.getElementById('ucTableWrap'); if (w) w.innerHTML = renderUCTable(); }
function removeUCRow(i) { _ucRows.splice(i, 1); var w = document.getElementById('ucTableWrap'); if (w) w.innerHTML = renderUCTable(); }
function updateUCRow(i, field, val) { if (!_ucRows[i]) return; if (field === 'factor' || field === 'price') val = parseInt(val) || 0; _ucRows[i][field] = val; }

function pField(label, id, val, extra, type) {
    extra = extra || ''; type = type || 'text';
    if (type === 'textarea') return '<div style="margin-bottom:10px"><label style="display:block;font-weight:500;margin-bottom:4px;color:#555">' + label + '</label><textarea id="' + id + '" style="width:100%;padding:7px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px;resize:vertical;min-height:60px" ' + extra + '>' + (val || '') + '</textarea></div>';
    return '<div style="margin-bottom:10px"><label style="display:block;font-weight:500;margin-bottom:4px;color:#555">' + label + '</label><input id="' + id + '" type="' + type + '" value="' + (val || '') + '" style="width:100%;padding:7px 10px;border:1px solid #ddd;border-radius:4px;font-size:13px" ' + extra + '></div>';
}

function saveProductForm(idx) {
    var name = document.getElementById('pfName').value.trim();
    if (!name) { showToast('Vui lòng nhập tên hàng hóa', 'error'); return; }
    var conversions = _ucRows.filter(function (r) { return r.name && r.name.trim(); }).map(function (r) { return { name: r.name.trim(), factor: parseInt(r.factor) || 1, price: parseInt(r.price) || 0 }; });
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
    if (idx >= 0) { Object.assign(products[idx], data); } else { products.unshift(data); }
    if (typeof saveLocalDB === 'function') saveLocalDB();
    closeModal();
    navigate('hanghoa', 'danhsach');
    showToast(idx >= 0 ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm mới', 'success');
}

function deleteProduct(idx) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm "' + products[idx].name + '"?')) return;
    products.splice(idx, 1);
    if (typeof saveLocalDB === 'function') saveLocalDB();
    closeModal();
    navigate('hanghoa', 'danhsach');
    showToast('Đã xóa sản phẩm', 'success');
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
        panel.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    document.addEventListener('click', function () { closeAll(); });

    document.querySelectorAll('.notif-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.notif-tab').forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');
        });
    });
})();

// ==================== ĐỒNG BỘ DỮ LIỆU ====================
function syncAllProducts() {
    var prods = JSON.parse(localStorage.getItem('hasu_products') || '[]');
    if (prods.length === 0 && typeof products !== 'undefined' && products.length > 0) {
        prods = products;
    }

    var btn = document.querySelector('.btn-sync-all');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đồng bộ...'; btn.disabled = true; }

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
                if (typeof showToast !== 'undefined') showToast('Đã đồng bộ ' + data.products.length + ' sản phẩm!', 'success');
                else alert('Đã đồng bộ ' + data.products.length + ' sản phẩm toàn hệ thống!');

                var tab = document.querySelector('.kv-nav-tab[data-page="hanghoa"]');
                if (tab && tab.classList.contains('active')) {
                    navigate('hanghoa', document.querySelector('.kv-subtab.active') ? document.querySelector('.kv-subtab.active').dataset.sub : 'danhsach');
                }
            }
        })
        .catch(err => {
            console.error(err);
            if (typeof showToast !== 'undefined') showToast('Có lỗi khi đồng bộ: ' + err.message, 'error');
            else alert('Có lỗi khi đồng bộ sản phẩm: ' + err.message);
        })
        .finally(() => {
            if (btn) { btn.innerHTML = '<i class="fas fa-sync-alt"></i> Đồng bộ thiết bị'; btn.disabled = false; }
        });
}

function autoPullProducts() {
    fetch('products_sync.php')
        .then(r => r.json())
        .then(data => {
            if (data && data.products && data.products.length > 0) {
                var local = JSON.parse(localStorage.getItem('hasu_products') || '[]');
                if (data.products.length !== local.length || JSON.stringify(data.products) !== JSON.stringify(local)) {
                    localStorage.setItem('hasu_products', JSON.stringify(data.products));
                    var tab = document.querySelector('.kv-nav-tab[data-page="hanghoa"]');
                    if (tab && tab.classList.contains('active')) {
                        var tbody = document.getElementById('productTableBody');
                        if (tbody) navigate('hanghoa', document.querySelector('.kv-subtab.active') ? document.querySelector('.kv-subtab.active').dataset.sub : 'danhsach');
                    }
                }
            }
        }).catch(e => console.log('Auto pull failed: ' + e));
}

// Auto pull on load
setTimeout(autoPullProducts, 1500);
