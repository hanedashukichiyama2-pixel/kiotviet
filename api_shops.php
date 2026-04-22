<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$filename = 'shops.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data && isset($data['shop']) && isset($data['email'])) {
        $shops = [];
        if (file_exists($filename)) {
            $shops = json_decode(file_get_contents($filename), true) ?: [];
        }

        $data['timestamp'] = date('c');
        $data['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        // Prevent pure duplicates by email, but update data if it already exists
        $exists = false;
        foreach ($shops as $idx => $s) {
            if ($s['email'] === $data['email']) {
                if (isset($data['gmv']))
                    $shops[$idx]['gmv'] = $data['gmv'];
                $shops[$idx]['last_seen'] = $data['timestamp'];
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            if (!isset($data['gmv']))
                $data['gmv'] = 0;
            $entry = $data;
            unset($entry['products']);
            unset($entry['customers']);
            array_unshift($shops, $entry); // Newest first
        }

        // DEEP SYNC: Save products and customers to tenant-specific file
        $tenantFile = 'tenant_' . md5($data['email']) . '.json';
        $deepData = [];
        if (file_exists($tenantFile)) {
            $deepData = json_decode(file_get_contents($tenantFile), true) ?: [];
        }
        if (isset($data['products']))
            $deepData['products'] = $data['products'];
        if (isset($data['customers']))
            $deepData['customers'] = $data['customers'];
        if (isset($data['gmv']))
            $deepData['gmv'] = $data['gmv'];

        file_put_contents($tenantFile, json_stringify_pretty($deepData));

        // Cleanup main data so shops.json remains small
        unset($data['products']);
        unset($data['customers']);

        file_put_contents($filename, json_stringify_pretty($shops));
        echo json_encode(['status' => 'success', 'data' => $data]);
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid data payload']);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    if (isset($_GET['tenant'])) {
        $tf = 'tenant_' . md5($_GET['tenant']) . '.json';
        if (file_exists($tf)) {
            echo file_get_contents($tf);
        } else {
            echo json_encode(['products' => [], 'customers' => []]);
        }
        exit;
    }

    if (isset($_GET['aggregate'])) {
        $shops = [];
        if (file_exists($filename)) {
            $shops = json_decode(file_get_contents($filename), true) ?: [];
        }
        $shopMap = [];
        foreach ($shops as $s) {
            $shopMap[md5($s['email'])] = $s['shop'] ?: 'Unknown Shop';
        }

        $allProducts = [];
        $allCustomers = [];

        $files = glob('tenant_*.json');
        foreach ($files as $tf) {
            $hash = str_replace(['tenant_', '.json'], '', $tf);
            $sName = $shopMap[$hash] ?? 'Unknown Shop';

            $deepData = json_decode(file_get_contents($tf), true) ?: [];
            if (!empty($deepData['products'])) {
                foreach ($deepData['products'] as $p) {
                    $p['tenant_shop'] = $sName;
                    $allProducts[] = $p;
                }
            }
            if (!empty($deepData['customers'])) {
                foreach ($deepData['customers'] as $c) {
                    $c['tenant_shop'] = $sName;
                    $allCustomers[] = $c;
                }
            }
        }
        echo json_encode(['products' => $allProducts, 'customers' => $allCustomers]);
        exit;
    }

    if (file_exists($filename)) {
        echo file_get_contents($filename);
    } else {
        echo json_encode([]);
    }
}

function json_stringify_pretty($data)
{
    return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>