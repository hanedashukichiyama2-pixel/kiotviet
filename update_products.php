<?php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$raw_post = file_get_contents('php://input');
$data = json_decode($raw_post, true);

if (!$data || !isset($data['action']) || !isset($data['codes'])) {
    echo json_encode(['ok' => false, 'error' => 'Dữ liệu không hợp lệ']);
    exit();
}

$action = $data['action'];
$codes = $data['codes']; // Array of product codes

if (empty($codes)) {
    echo json_encode(['ok' => false, 'error' => 'Danh sách mã sản phẩm trống']);
    exit();
}

$products_js_path = 'js/products.js';

if (!file_exists($products_js_path)) {
    echo json_encode(['ok' => false, 'error' => 'Không tìm thấy file products.js trên server.']);
    exit();
}

$content = file_get_contents($products_js_path);
$start_pos = strpos($content, 'const products = ');

if ($start_pos === false) {
    echo json_encode(['ok' => false, 'error' => 'Không thể nhận diện mảng products trong file products.js']);
    exit();
}

$start_bracket = strpos($content, '[', $start_pos);
$json_str = substr($content, $start_bracket);
$json_str = rtrim(trim($json_str), ";");

$products = json_decode($json_str, true);

if ($products === null) {
    echo json_encode(['ok' => false, 'error' => 'Lỗi parse JSON products.js: ' . json_last_error_msg()]);
    exit();
}

$codes_to_process = array_flip($codes);
$new_products = [];
$affected = 0;

foreach ($products as $p) {
    $code = isset($p['code']) ? $p['code'] : null;
    
    // Some products might not have 'code' directly defined but instead have something else,
    // though the standard format uses 'code'.
    if ($code !== null && isset($codes_to_process[$code])) {
        if ($action === 'delete') {
            $affected++;
            continue; // Skip adding to new_products
        } else if ($action === 'stop') {
            $p['active'] = 0; // Deactivate
            $affected++;
        }
    }
    
    $new_products[] = $p;
}

$new_json_str = json_encode($new_products, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($new_json_str === false) {
    echo json_encode(['ok' => false, 'error' => 'Lỗi tạo JSON mới.']);
    exit();
}

$new_content_js = substr($content, 0, $start_bracket) . $new_json_str . ";\n";
file_put_contents($products_js_path, $new_content_js);

// Update HTML files to bust cache
$version = 'v=' . date('YmdHis');
$html_files = glob("*.html");
if ($html_files) {
    foreach($html_files as $html_file) {
        $html = file_get_contents($html_file);
        $html = preg_replace('/js\/products\.js\?v=[^\'"]+/', 'js/products.js?'.$version, $html);
        file_put_contents($html_file, $html);
    }
}

echo json_encode(['ok' => true, 'affected' => $affected, 'action' => $action]);
