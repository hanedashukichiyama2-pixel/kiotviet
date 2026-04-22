<?php
/**
 * stock_sync.php - Đồng bộ tồn kho thực tế
 * API endpoint để đọc/ghi tồn kho từ file JSON dùng chung
 * Tất cả tài khoản đều đọc/ghi file này → tồn kho thống nhất
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

$stockFile = __DIR__ . '/stock.json';

// ── GET: Trả về tồn kho hiện tại
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($stockFile)) {
        echo json_encode(['ok' => true, 'stock' => (object)[]]);
        exit;
    }
    $data = file_get_contents($stockFile);
    $stock = json_decode($data, true) ?: [];
    echo json_encode(['ok' => true, 'stock' => $stock]);
    exit;
}

// ── POST: Trừ tồn kho sau mỗi đơn hàng
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($body['items']) || !is_array($body['items'])) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Missing items array']);
        exit;
    }

    // Dùng file lock để tránh race condition giữa nhiều tab/user cùng lúc
    $fp = fopen($stockFile . '.lock', 'c+');
    flock($fp, LOCK_EX);

    // Đọc tồn kho hiện tại
    $stock = [];
    if (file_exists($stockFile)) {
        $raw = file_get_contents($stockFile);
        $stock = json_decode($raw, true) ?: [];
    }

    // Trừ tồn kho theo từng sản phẩm
    foreach ($body['items'] as $item) {
        $code = isset($item['code']) ? (string)$item['code'] : null;
        $qty  = isset($item['qty'])  ? intval($item['qty'])   : 0;
        if (!$code || $qty <= 0) continue;

        // Nếu chưa có trong JSON → dùng stock từ products.js (gửi kèm)
        if (!isset($stock[$code])) {
            $stock[$code] = isset($item['baseStock']) ? intval($item['baseStock']) : 0;
        }
        $stock[$code] = max(0, $stock[$code] - $qty);
    }

    file_put_contents($stockFile, json_encode($stock, JSON_PRETTY_PRINT));

    flock($fp, LOCK_UN);
    fclose($fp);

    echo json_encode(['ok' => true, 'stock' => $stock]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
