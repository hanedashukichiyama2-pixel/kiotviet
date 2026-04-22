<?php
/**
 * products_sync.php - API Đồng bộ danh mục sản phẩm thời gian thực
 * Xử lý Fetch / Đẩy dữ liệu products.json trung tâm
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$productsFile = __DIR__ . '/products.json';

// === GET: Trả về danh sách sản phẩm hiện tại ===
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($productsFile)) {
        echo json_encode(['ok' => true, 'products' => []]);
        exit;
    }
    $data = file_get_contents($productsFile);
    $products = json_decode($data, true) ?: [];
    echo json_encode(['ok' => true, 'products' => $products]);
    exit;
}

// === POST: Nhận danh sách cập nhật từ Client và LƯU vào JSON ===
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    if (!isset($body['products']) || !is_array($body['products'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing products array']);
        exit;
    }

    $newProducts = $body['products'];

    // Dùng file lock để tránh race condition khi nhiều tab/user cùng up file Excel
    $fp = fopen($productsFile . '.lock', 'c+');
    flock($fp, LOCK_EX);

    // Ghi đè toàn bộ (hoặc MERGE) list sản phẩm. Ở dạng này Client Master sẽ PUSH toàn bộ mảng Local để ghi đè.
    file_put_contents($productsFile, json_encode($newProducts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    flock($fp, LOCK_UN);
    fclose($fp);

    echo json_encode(['ok' => true, 'message' => 'Synced ' . count($newProducts) . ' products']);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
