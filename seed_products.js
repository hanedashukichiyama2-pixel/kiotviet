// Seed 10 categories x 10 products with real product images
// Run this in browser console on any page, or via Node

const categories = [
    { id: 1, name: 'Thực phẩm & Gia vị', desc: 'Gạo, mì, dầu ăn, gia vị, đồ khô các loại', status: 'active' },
    { id: 2, name: 'Đồ uống', desc: 'Nước ngọt, sữa, trà, cà phê, nước ép', status: 'active' },
    { id: 3, name: 'Bánh kẹo & Snack', desc: 'Bánh, kẹo, snack, hạt dinh dưỡng', status: 'active' },
    { id: 4, name: 'Chăm sóc cá nhân', desc: 'Dầu gội, sữa tắm, kem đánh răng, mỹ phẩm', status: 'active' },
    { id: 5, name: 'Đồ gia dụng', desc: 'Nồi, chảo, bát đĩa, dụng cụ nhà bếp', status: 'active' },
    { id: 6, name: 'Điện tử & Phụ kiện', desc: 'Tai nghe, sạc, cáp, phụ kiện điện thoại', status: 'active' },
    { id: 7, name: 'Thời trang', desc: 'Áo, quần, giày dép, túi xách', status: 'active' },
    { id: 8, name: 'Mẹ & Bé', desc: 'Sữa bột, tã, đồ chơi, quần áo trẻ em', status: 'active' },
    { id: 9, name: 'Sức khỏe & Làm đẹp', desc: 'Vitamin, thực phẩm chức năng, thiết bị y tế', status: 'active' },
    { id: 10, name: 'Văn phòng phẩm', desc: 'Bút, vở, giấy, dụng cụ học tập', status: 'active' }
];

const products = [
    // 1. Thực phẩm & Gia vị (cat 1)
    { id: 1, name: 'Gạo ST25 túi 5kg - Đặc sản Sóc Trăng', cat: 1, price: 125000, origPrice: 149000, stock: 200, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', desc: 'Gạo ST25 đạt giải gạo ngon nhất thế giới, hạt dài thơm dẻo', status: 'active' },
    { id: 2, name: 'Dầu ăn Tường An Premium 1L', cat: 1, price: 42000, origPrice: 52000, stock: 150, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', desc: 'Dầu ăn cao cấp chiết xuất từ đậu nành', status: 'active' },
    { id: 3, name: 'Nước mắm Nam Ngư đậm đặc 500ml', cat: 1, price: 28000, origPrice: 35000, stock: 300, img: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop', desc: 'Nước mắm truyền thống đậm vị', status: 'active' },
    { id: 4, name: 'Mì Hảo Hảo tôm chua cay thùng 30 gói', cat: 1, price: 105000, origPrice: 130000, stock: 100, img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop', desc: 'Mì ăn liền bán chạy số 1 Việt Nam', status: 'active' },
    { id: 5, name: 'Bột ngọt Ajinomoto gói 400g', cat: 1, price: 22000, origPrice: 25000, stock: 500, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', desc: 'Bột ngọt tinh khiết Ajinomoto', status: 'active' },
    { id: 6, name: 'Tương ớt Chinsu chai 500g', cat: 1, price: 18000, origPrice: 22000, stock: 400, img: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', desc: 'Tương ớt Chinsu cay nồng đậm vị', status: 'active' },
    { id: 7, name: 'Đường Biên Hòa Pure gói 1kg', cat: 1, price: 24000, origPrice: 28000, stock: 250, img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop', desc: 'Đường tinh luyện Biên Hòa', status: 'active' },
    { id: 8, name: 'Hạt nêm Knorr thịt thăn xương gói 900g', cat: 1, price: 58000, origPrice: 68000, stock: 180, img: 'https://images.unsplash.com/photo-1532768641073-503a250ceafc?w=400&h=400&fit=crop', desc: 'Hạt nêm từ thịt thăn và xương ống', status: 'active' },
    { id: 9, name: 'Bún gạo Bích Chi gói 500g', cat: 1, price: 15000, origPrice: 18000, stock: 350, img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=400&fit=crop', desc: 'Bún gạo trắng mịn', status: 'active' },
    { id: 10, name: 'Muối iốt Bạc Liêu gói 500g', cat: 1, price: 5000, origPrice: 7000, stock: 600, img: 'https://images.unsplash.com/photo-1518110925495-5fe2c631f4dc?w=400&h=400&fit=crop', desc: 'Muối tinh sạch bổ sung iốt', status: 'active' },

    // 2. Đồ uống (cat 2)
    { id: 11, name: 'Coca Cola lon 330ml (lốc 6)', cat: 2, price: 48000, origPrice: 56000, stock: 200, img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop', desc: 'Nước giải khát có gas Coca Cola', status: 'active' },
    { id: 12, name: 'Sữa tươi Vinamilk 100% 1L', cat: 2, price: 32000, origPrice: 36000, stock: 300, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', desc: 'Sữa tươi tiệt trùng không đường', status: 'active' },
    { id: 13, name: 'Trà xanh Không Độ 500ml (lốc 6)', cat: 2, price: 42000, origPrice: 50000, stock: 150, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop', desc: 'Trà xanh thanh nhiệt giải khát', status: 'active' },
    { id: 14, name: 'Cà phê G7 3in1 hộp 18 gói', cat: 2, price: 55000, origPrice: 65000, stock: 250, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', desc: 'Cà phê hòa tan Trung Nguyên G7', status: 'active' },
    { id: 15, name: 'Nước ép Vfresh cam 1L', cat: 2, price: 28000, origPrice: 33000, stock: 180, img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop', desc: 'Nước ép cam tự nhiên 100%', status: 'active' },
    { id: 16, name: 'Bia Tiger lon 330ml (thùng 24)', cat: 2, price: 320000, origPrice: 365000, stock: 80, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop', desc: 'Bia Tiger bạc truyền thống', status: 'active' },
    { id: 17, name: 'Nước suối Lavie 500ml (lốc 6)', cat: 2, price: 18000, origPrice: 22000, stock: 400, img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop', desc: 'Nước khoáng thiên nhiên Lavie', status: 'active' },
    { id: 18, name: 'Sữa đậu nành Fami 200ml (lốc 6)', cat: 2, price: 24000, origPrice: 28000, stock: 220, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop', desc: 'Sữa đậu nành Fami canxi', status: 'active' },
    { id: 19, name: 'Trà sữa Kirin Latte 345ml', cat: 2, price: 15000, origPrice: 19000, stock: 300, img: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=400&fit=crop', desc: 'Trà sữa Kirin chai tiện lợi', status: 'active' },
    { id: 20, name: 'Nước tăng lực Red Bull 250ml (lốc 6)', cat: 2, price: 60000, origPrice: 72000, stock: 160, img: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=400&fit=crop', desc: 'Nước tăng lực Red Bull chính hãng', status: 'active' },

    // 3. Bánh kẹo & Snack (cat 3)
    { id: 21, name: 'Bánh Oreo sô cô la 133g', cat: 3, price: 22000, origPrice: 27000, stock: 300, img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', desc: 'Bánh quy Oreo nhân kem socola', status: 'active' },
    { id: 22, name: 'Snack Poca khoai tây vị tự nhiên 54g', cat: 3, price: 12000, origPrice: 15000, stock: 400, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', desc: 'Snack khoai tây giòn rụm', status: 'active' },
    { id: 23, name: 'Kẹo dẻo Haribo gấu 80g', cat: 3, price: 25000, origPrice: 30000, stock: 200, img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=400&fit=crop', desc: 'Kẹo dẻo trái cây hình gấu', status: 'active' },
    { id: 24, name: 'Socola KitKat thanh 4F 35g (lốc 6)', cat: 3, price: 48000, origPrice: 55000, stock: 150, img: 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop', desc: 'Socola KitKat wafer giòn', status: 'active' },
    { id: 25, name: 'Hạt điều rang muối Lafooco 500g', cat: 3, price: 145000, origPrice: 170000, stock: 80, img: 'https://images.unsplash.com/photo-1563292769-4e05b684d78e?w=400&h=400&fit=crop', desc: 'Hạt điều Bình Phước rang muối vàng', status: 'active' },
    { id: 26, name: 'Bánh tráng trộn Sa tế 100g', cat: 3, price: 18000, origPrice: 22000, stock: 350, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop', desc: 'Bánh tráng trộn vị sa tế cay', status: 'active' },
    { id: 27, name: 'Bánh quy Cosy Marie 396g', cat: 3, price: 35000, origPrice: 42000, stock: 180, img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop', desc: 'Bánh quy bơ sữa Cosy Marie', status: 'active' },
    { id: 28, name: 'Hạt hướng dương Chacheer 130g', cat: 3, price: 15000, origPrice: 18000, stock: 400, img: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&h=400&fit=crop', desc: 'Hạt hướng dương rang muối', status: 'active' },
    { id: 29, name: 'Kẹo sữa Milkita túi 120g', cat: 3, price: 20000, origPrice: 24000, stock: 280, img: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&h=400&fit=crop', desc: 'Kẹo sữa Milkita Indonesia', status: 'active' },
    { id: 30, name: 'Bim bim Lays stax vị BBQ 105g', cat: 3, price: 28000, origPrice: 33000, stock: 220, img: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop', desc: 'Snack khoai tây Lays Stax giòn', status: 'active' },

    // 4. Chăm sóc cá nhân (cat 4)
    { id: 31, name: 'Dầu gội Clear Men Cool Sport 650ml', cat: 4, price: 118000, origPrice: 139000, stock: 120, img: 'https://images.unsplash.com/photo-1585232350437-1aae1c696e41?w=400&h=400&fit=crop', desc: 'Dầu gội sạch gàu cho nam', status: 'active' },
    { id: 32, name: 'Sữa tắm Dove dưỡng ẩm 900g', cat: 4, price: 135000, origPrice: 158000, stock: 100, img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', desc: 'Sữa tắm Dove dưỡng ẩm sâu', status: 'active' },
    { id: 33, name: 'Kem đánh răng P/S bảo vệ 123 240g', cat: 4, price: 32000, origPrice: 38000, stock: 300, img: 'https://images.unsplash.com/photo-1559591937-923e8e73d124?w=400&h=400&fit=crop', desc: 'Kem đánh răng P/S ngừa sâu răng', status: 'active' },
    { id: 34, name: 'Lăn khử mùi Nivea Men 50ml', cat: 4, price: 55000, origPrice: 65000, stock: 180, img: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop', desc: 'Lăn khử mùi Nivea dành cho nam', status: 'active' },
    { id: 35, name: 'Nước hoa hồng Thayers 355ml', cat: 4, price: 230000, origPrice: 280000, stock: 60, img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', desc: 'Nước hoa hồng không cồn Thayers', status: 'active' },
    { id: 36, name: 'Sữa rửa mặt CeraVe 236ml', cat: 4, price: 285000, origPrice: 340000, stock: 50, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', desc: 'Sữa rửa mặt CeraVe dịu nhẹ', status: 'active' },
    { id: 37, name: 'Kem chống nắng Anessa 60ml', cat: 4, price: 380000, origPrice: 450000, stock: 40, img: 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&h=400&fit=crop', desc: 'Kem chống nắng Anessa SPF50+', status: 'active' },
    { id: 38, name: 'Dầu xả TRESemmé Keratin 620ml', cat: 4, price: 95000, origPrice: 115000, stock: 130, img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop', desc: 'Dầu xả phục hồi tóc hư tổn', status: 'active' },
    { id: 39, name: 'Bàn chải đánh răng Oral-B (3 cây)', cat: 4, price: 45000, origPrice: 55000, stock: 250, img: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=400&h=400&fit=crop', desc: 'Bàn chải lông mềm Oral-B', status: 'active' },
    { id: 40, name: 'Nước giặt OMO Matic cửa trước 2.3kg', cat: 4, price: 115000, origPrice: 135000, stock: 150, img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=400&fit=crop', desc: 'Nước giặt OMO khử mùi diệt khuẩn', status: 'active' },

    // 5. Đồ gia dụng (cat 5)
    { id: 41, name: 'Nồi cơm điện Sunhouse 1.8L SHD8601', cat: 5, price: 450000, origPrice: 550000, stock: 30, img: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop', desc: 'Nồi cơm điện nắp gài Sunhouse', status: 'active' },
    { id: 42, name: 'Chảo chống dính Tefal 24cm', cat: 5, price: 280000, origPrice: 350000, stock: 50, img: 'https://images.unsplash.com/photo-1592155931584-901ac15763e4?w=400&h=400&fit=crop', desc: 'Chảo Tefal chống dính cao cấp', status: 'active' },
    { id: 43, name: 'Bộ dao nhà bếp Inox 6 món', cat: 5, price: 185000, origPrice: 230000, stock: 80, img: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop', desc: 'Bộ dao Inox cao cấp kèm kệ gỗ', status: 'active' },
    { id: 44, name: 'Bình giữ nhiệt Lock&Lock 500ml', cat: 5, price: 220000, origPrice: 280000, stock: 100, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', desc: 'Bình giữ nhiệt inox 24h', status: 'active' },
    { id: 45, name: 'Nồi áp suất đa năng Sunhouse 6L', cat: 5, price: 980000, origPrice: 1250000, stock: 20, img: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=400&h=400&fit=crop', desc: 'Nồi áp suất điện 6L đa chức năng', status: 'active' },
    { id: 46, name: 'Bộ bát đĩa sứ 12 món', cat: 5, price: 320000, origPrice: 400000, stock: 40, img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop', desc: 'Bộ bát đĩa sứ trắng cao cấp', status: 'active' },
    { id: 47, name: 'Máy xay sinh tố Philips HR2118', cat: 5, price: 650000, origPrice: 790000, stock: 35, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop', desc: 'Máy xay sinh tố đa năng 2L', status: 'active' },
    { id: 48, name: 'Hộp đựng thực phẩm Tupperware (set 5)', cat: 5, price: 175000, origPrice: 220000, stock: 90, img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop', desc: 'Hộp bảo quản thực phẩm an toàn', status: 'active' },
    { id: 49, name: 'Thớt gỗ tự nhiên 30x40cm', cat: 5, price: 85000, origPrice: 110000, stock: 120, img: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=400&h=400&fit=crop', desc: 'Thớt gỗ tự nhiên không mùi', status: 'active' },
    { id: 50, name: 'Ấm siêu tốc Sunhouse 1.8L', cat: 5, price: 195000, origPrice: 250000, stock: 70, img: 'https://images.unsplash.com/photo-1594213114970-ba6b809e2c2e?w=400&h=400&fit=crop', desc: 'Ấm siêu tốc inox tự ngắt', status: 'active' },

    // 6. Điện tử & Phụ kiện (cat 6)
    { id: 51, name: 'Tai nghe Bluetooth Xiaomi Buds 4', cat: 6, price: 890000, origPrice: 1100000, stock: 60, img: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', desc: 'Tai nghe TWS chống ồn chủ động', status: 'active' },
    { id: 52, name: 'Cáp sạc USB-C Anker 1m', cat: 6, price: 120000, origPrice: 150000, stock: 200, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop', desc: 'Cáp sạc nhanh 60W Anker', status: 'active' },
    { id: 53, name: 'Sạc dự phòng Baseus 10000mAh', cat: 6, price: 350000, origPrice: 420000, stock: 80, img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop', desc: 'Pin dự phòng sạc nhanh 22.5W', status: 'active' },
    { id: 54, name: 'Ốp lưng iPhone 15 MagSafe', cat: 6, price: 95000, origPrice: 130000, stock: 150, img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', desc: 'Ốp lưng trong suốt hỗ trợ MagSafe', status: 'active' },
    { id: 55, name: 'Loa Bluetooth JBL Go 3', cat: 6, price: 780000, origPrice: 950000, stock: 45, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', desc: 'Loa di động chống nước IP67', status: 'active' },
    { id: 56, name: 'Chuột không dây Logitech M331', cat: 6, price: 290000, origPrice: 350000, stock: 90, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop', desc: 'Chuột silent không dây Logitech', status: 'active' },
    { id: 57, name: 'Bàn phím cơ Akko 3068B', cat: 6, price: 1200000, origPrice: 1490000, stock: 35, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop', desc: 'Bàn phím cơ 68 phím RGB Bluetooth', status: 'active' },
    { id: 58, name: 'Kính cường lực 9D full màn hình', cat: 6, price: 25000, origPrice: 45000, stock: 500, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', desc: 'Kính cường lực chống xước chống vỡ', status: 'active' },
    { id: 59, name: 'Đèn bàn LED chống cận USB', cat: 6, price: 165000, origPrice: 210000, stock: 100, img: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab3fe?w=400&h=400&fit=crop', desc: 'Đèn bàn LED 3 chế độ sáng', status: 'active' },
    { id: 60, name: 'Hub USB-C 7 in 1 Ugreen', cat: 6, price: 450000, origPrice: 550000, stock: 55, img: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop', desc: 'Hub chuyển đổi HDMI, USB, SD card', status: 'active' },

    // 7. Thời trang (cat 7)
    { id: 61, name: 'Áo thun nam cotton basic - Trắng', cat: 7, price: 119000, origPrice: 169000, stock: 200, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', desc: 'Áo thun nam 100% cotton thoáng mát', status: 'active' },
    { id: 62, name: 'Quần jean nam slim fit xanh đậm', cat: 7, price: 350000, origPrice: 450000, stock: 100, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', desc: 'Quần jean co giãn 4 chiều', status: 'active' },
    { id: 63, name: 'Giày thể thao nữ Air Max', cat: 7, price: 890000, origPrice: 1200000, stock: 50, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', desc: 'Giày thể thao nữ đệm khí', status: 'active' },
    { id: 64, name: 'Áo hoodie unisex oversize', cat: 7, price: 280000, origPrice: 350000, stock: 120, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', desc: 'Áo hoodie form rộng unisex', status: 'active' },
    { id: 65, name: 'Túi xách nữ da PU thời trang', cat: 7, price: 250000, origPrice: 320000, stock: 80, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop', desc: 'Túi xách nữ thanh lịch dự tiệc', status: 'active' },
    { id: 66, name: 'Kính mát nam phân cực UV400', cat: 7, price: 175000, origPrice: 250000, stock: 100, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', desc: 'Kính mát chống tia UV thời trang', status: 'active' },
    { id: 67, name: 'Nón lưỡi trai MLB NY đen', cat: 7, price: 350000, origPrice: 450000, stock: 70, img: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop', desc: 'Nón MLB chính hãng Hàn Quốc', status: 'active' },
    { id: 68, name: 'Đồng hồ nam Casio MTP classic', cat: 7, price: 780000, origPrice: 950000, stock: 40, img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop', desc: 'Đồng hồ Casio kim loại classic', status: 'active' },
    { id: 69, name: 'Dép Birkenstock Arizona EVA', cat: 7, price: 650000, origPrice: 850000, stock: 55, img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop', desc: 'Dép kẹp Birkenstock siêu nhẹ', status: 'active' },
    { id: 70, name: 'Ví nam da bò ngắn Montblanc style', cat: 7, price: 220000, origPrice: 290000, stock: 90, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', desc: 'Ví nam da bò thật 100%', status: 'active' },

    // 8. Mẹ & Bé (cat 8)
    { id: 71, name: 'Sữa bột Enfamil A+ số 1 (0-6th) 400g', cat: 8, price: 285000, origPrice: 350000, stock: 100, img: 'https://images.unsplash.com/photo-1584797011906-de69afc00f52?w=400&h=400&fit=crop', desc: 'Sữa bột Enfamil công thức DHA', status: 'active' },
    { id: 72, name: 'Tã dán Bobby Newborn 1 40 miếng', cat: 8, price: 105000, origPrice: 125000, stock: 200, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', desc: 'Tã dán Bobby siêu thấm hút', status: 'active' },
    { id: 73, name: 'Bình sữa Pigeon 240ml cổ rộng', cat: 8, price: 155000, origPrice: 190000, stock: 120, img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', desc: 'Bình sữa Pigeon nhựa PPSU an toàn', status: 'active' },
    { id: 74, name: 'Xe đẩy em bé gấp gọn Aprica', cat: 8, price: 2500000, origPrice: 3200000, stock: 15, img: 'https://images.unsplash.com/photo-1608526527455-e0e20bb26878?w=400&h=400&fit=crop', desc: 'Xe đẩy gấp gọn 1 tay siêu nhẹ', status: 'active' },
    { id: 75, name: 'Đồ chơi xếp hình LEGO Duplo 60 mảnh', cat: 8, price: 420000, origPrice: 520000, stock: 40, img: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=400&fit=crop', desc: 'Bộ LEGO Duplo sáng tạo cho bé', status: 'active' },
    { id: 76, name: 'Bộ quần áo cotton cho bé 0-12 tháng', cat: 8, price: 85000, origPrice: 110000, stock: 180, img: 'https://images.unsplash.com/photo-1522771930-78b122ab9846?w=400&h=400&fit=crop', desc: 'Bộ body cotton mềm mại cho bé', status: 'active' },
    { id: 77, name: 'Khăn ướt Bobby không mùi 100 tờ', cat: 8, price: 38000, origPrice: 45000, stock: 300, img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&h=400&fit=crop', desc: 'Khăn ướt không cồn an toàn cho bé', status: 'active' },
    { id: 78, name: 'Nôi cũi cho bé đa năng gấp gọn', cat: 8, price: 1350000, origPrice: 1700000, stock: 20, img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop', desc: 'Nôi cũi gấp gọn kèm đệm lót', status: 'active' },
    { id: 79, name: 'Bột ăn dặm Gerber Organic 227g', cat: 8, price: 120000, origPrice: 145000, stock: 130, img: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=400&fit=crop', desc: 'Bột ăn dặm hữu cơ Gerber', status: 'active' },
    { id: 80, name: 'Máy hâm sữa Fatzbaby FB3002SL', cat: 8, price: 380000, origPrice: 470000, stock: 50, img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop', desc: 'Máy hâm sữa tiệt trùng 4 chức năng', status: 'active' },

    // 9. Sức khỏe & Làm đẹp (cat 9)
    { id: 81, name: 'Vitamin C DHC 60 ngày (120 viên)', cat: 9, price: 145000, origPrice: 180000, stock: 150, img: 'https://images.unsplash.com/photo-1584308666544-ad28a0378b4c?w=400&h=400&fit=crop', desc: 'Vitamin C DHC Nhật Bản chính hãng', status: 'active' },
    { id: 82, name: 'Collagen Shiseido dạng nước hộp 10', cat: 9, price: 520000, origPrice: 650000, stock: 60, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', desc: 'Collagen nước Shiseido Nhật', status: 'active' },
    { id: 83, name: 'Mặt nạ ngủ Laneige 70ml', cat: 9, price: 380000, origPrice: 460000, stock: 70, img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop', desc: 'Mặt nạ ngủ dưỡng ẩm Laneige', status: 'active' },
    { id: 84, name: 'Omega 3 Fish Oil Kirkland 400 viên', cat: 9, price: 580000, origPrice: 720000, stock: 40, img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop', desc: 'Dầu cá Omega 3 Kirkland Mỹ', status: 'active' },
    { id: 85, name: 'Serum Vitamin C Klairs 35ml', cat: 9, price: 310000, origPrice: 380000, stock: 80, img: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=400&h=400&fit=crop', desc: 'Serum sáng da Vitamin C không kích ứng', status: 'active' },
    { id: 86, name: 'Máy đo huyết áp Omron HEM-7120', cat: 9, price: 850000, origPrice: 1050000, stock: 30, img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop', desc: 'Máy đo huyết áp bắp tay tự động', status: 'active' },
    { id: 87, name: 'Sâm Hàn Quốc cắt lát 200g', cat: 9, price: 450000, origPrice: 580000, stock: 50, img: 'https://images.unsplash.com/photo-1598046937895-2be846402a0d?w=400&h=400&fit=crop', desc: 'Sâm tươi Hàn Quốc thượng hạng', status: 'active' },
    { id: 88, name: 'Gel rửa tay diệt khuẩn Lifebuoy 500ml', cat: 9, price: 65000, origPrice: 80000, stock: 200, img: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&h=400&fit=crop', desc: 'Gel rửa tay khô Lifebuoy', status: 'active' },
    { id: 89, name: 'Multivitamin Centrum Adults 100 viên', cat: 9, price: 420000, origPrice: 520000, stock: 55, img: 'https://images.unsplash.com/photo-1577401239170-897c9e8013a5?w=400&h=400&fit=crop', desc: 'Vitamin tổng hợp Centrum Mỹ', status: 'active' },
    { id: 90, name: 'Son dưỡng môi Vaseline 7g', cat: 9, price: 28000, origPrice: 35000, stock: 350, img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', desc: 'Son dưỡng môi giữ ẩm Vaseline', status: 'active' },

    // 10. Văn phòng phẩm (cat 10)
    { id: 91, name: 'Bút bi Thiên Long TL-027 (hộp 20)', cat: 10, price: 48000, origPrice: 58000, stock: 300, img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop', desc: 'Bút bi bấm Thiên Long mực xanh', status: 'active' },
    { id: 92, name: 'Vở Campus 200 trang kẻ ngang', cat: 10, price: 15000, origPrice: 18000, stock: 500, img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', desc: 'Vở Campus các loại bìa cứng', status: 'active' },
    { id: 93, name: 'Giấy A4 Double A 80gsm (500 tờ)', cat: 10, price: 78000, origPrice: 95000, stock: 200, img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop', desc: 'Giấy in A4 Double A trắng mịn', status: 'active' },
    { id: 94, name: 'Bút highlight Stabilo Boss (bộ 6)', cat: 10, price: 85000, origPrice: 105000, stock: 120, img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop', desc: 'Bút dạ quang Stabilo 6 màu', status: 'active' },
    { id: 95, name: 'Máy tính Casio FX-580VN X', cat: 10, price: 520000, origPrice: 650000, stock: 60, img: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=400&fit=crop', desc: 'Máy tính khoa học Casio 521 tính năng', status: 'active' },
    { id: 96, name: 'Balo laptop chống nước 15.6 inch', cat: 10, price: 280000, origPrice: 360000, stock: 80, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', desc: 'Balo laptop chống sốc chống nước', status: 'active' },
    { id: 97, name: 'Bộ bút dạ kỹ thuật Artline 0.4mm (5 cây)', cat: 10, price: 55000, origPrice: 70000, stock: 150, img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop', desc: 'Bút vẽ kỹ thuật Artline ngòi kim', status: 'active' },
    { id: 98, name: 'Kệ để file văn phòng 3 tầng', cat: 10, price: 120000, origPrice: 155000, stock: 100, img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop', desc: 'Kệ file nhựa trong suốt 3 tầng', status: 'active' },
    { id: 99, name: 'Tape cuộn băng dính trong suốt (6 cuộn)', cat: 10, price: 22000, origPrice: 28000, stock: 400, img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop', desc: 'Băng dính trong suốt văn phòng', status: 'active' },
    { id: 100, name: 'Ghim bấm giấy Deli (hộp 1000)', cat: 10, price: 8000, origPrice: 12000, stock: 600, img: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400&h=400&fit=crop', desc: 'Ghim bấm Deli No.10 chất lượng', status: 'active' }
];

// Save to localStorage
localStorage.setItem('hasu_store_categories', JSON.stringify(categories));
localStorage.setItem('hasu_store_products', JSON.stringify(products));

console.log('✅ Seeded ' + categories.length + ' categories, ' + products.length + ' products');
alert('Đã import thành công ' + categories.length + ' danh mục và ' + products.length + ' sản phẩm!');
