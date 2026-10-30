<?php

// =====================================================
// DEBUG FLAGS  (set SHOW_PAYLOAD to false before going live)
// =====================================================
$SHOW_PAYLOAD    = true;
$SKIP_SALESFORCE = false;   // true = save lead in DB only, skip Salesforce + Google Form


// =====================================================
// CORS
// =====================================================
$allowedOrigins = [
    'http://localhost:3000',
    'https://wzpocs.in',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');


// =====================================================
// DATABASE CONNECTION
// =====================================================
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}
$DB_HOST = $DB_HOST ?? (getenv('DB_HOST') ?: 'localhost');
$DB_USER = $DB_USER ?? (getenv('DB_USER') ?: 'root');
$DB_PASS = $DB_PASS ?? (getenv('DB_PASS') ?: '');
$DB_NAME = $DB_NAME ?? (getenv('DB_NAME') ?: 'test_rustomjee_bellevie');
$SF_CLIENT_ID     = $SF_CLIENT_ID     ?? (getenv('SF_CLIENT_ID') ?: '');
$SF_CLIENT_SECRET = $SF_CLIENT_SECRET ?? (getenv('SF_CLIENT_SECRET') ?: '');
$SF_USERNAME      = $SF_USERNAME      ?? (getenv('SF_USERNAME') ?: '');
$SF_PASSWORD      = $SF_PASSWORD      ?? (getenv('SF_PASSWORD') ?: '');
$con = mysqli_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (!$con) {
    echo json_encode(["status" => 0, "msg" => "Database connection failed", "error" => mysqli_connect_error()]);
    exit;
}
mysqli_set_charset($con, "utf8mb4");


// =====================================================
// ONLY POST
// =====================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => 0, "msg" => "Request method not accepted"]);
    mysqli_close($con);
    exit;
}


// =====================================================
// CLIENT IP
// =====================================================
function get_client_ip()
{
    if (!empty($_SERVER["HTTP_CF_CONNECTING_IP"])) {
        return $_SERVER["HTTP_CF_CONNECTING_IP"];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    } elseif (getenv('HTTP_CLIENT_IP')) {
        return getenv('HTTP_CLIENT_IP');
    } elseif (getenv('REMOTE_ADDR')) {
        return getenv('REMOTE_ADDR');
    }
    return 'UNKNOWN';
}
$ipaddress = get_client_ip();


// =====================================================
// IP BLOCK CHECK (skipped silently if table is missing)
// =====================================================
$stmt_check = @$con->prepare("SELECT status FROM blocked_ips WHERE ip_address = ?");
if ($stmt_check) {
    $stmt_check->bind_param("s", $ipaddress);
    $stmt_check->execute();
    $res_check = $stmt_check->get_result();
    if ($row_check = $res_check->fetch_assoc()) {
        if ($row_check['status'] == 1) {
            echo json_encode(["status" => 0, "msg" => "Your IP has been blocked."]);
            mysqli_close($con);
            exit;
        }
    }
    $stmt_check->close();
}


// =====================================================
// GET JSON DATA
// =====================================================
$rawData = file_get_contents("php://input");
$data    = json_decode($rawData, true);

if (!is_array($data)) {
    echo json_encode(["status" => 0, "msg" => "Invalid JSON data", "raw_data" => $rawData]);
    mysqli_close($con);
    exit;
}

// Honeypot
if (!empty($data['honeypot'])) {
    echo json_encode(["status" => 0, "msg" => "Bot detected"]);
    mysqli_close($con);
    exit;
}


// =====================================================
// BASIC LEAD DATA
// =====================================================
$name        = trim($data['name'] ?? '');
$email       = trim($data['email'] ?? '');
$mobile      = trim($data['mobile'] ?? '');
$countrycode = trim($data['countrycode'] ?? '');

if ($mobile === '' || $email === '' || strlen($mobile) <= 6) {
    echo json_encode(["status" => 0, "msg" => "Valid mobile and email are required"]);
    mysqli_close($con);
    exit;
}


// =====================================================
// SOURCE / CAMPAIGN DATA (from your URL params)
// =====================================================
$campaignsource    = $data['utm_source'] ?? '';
$campaignsubsource = $data['utm_sub_source'] ?? '';
$utmM              = $data['utm_medium'] ?? '';
$placement         = $data['Lead_Placement'] ?? '';
$device            = $data['Lead_Device'] ?? '';
$keyword           = $data['Lead_Keyword'] ?? '';
$gclid             = $data['gclid'] ?? '';

$utm_campaignname  = $data['utm_campaignname'] ?? '';
$utm_campaignid    = $data['utm_campaignid'] ?? '';
$utm_adgroupname   = $data['utm_adgroupname'] ?? '';
$utm_adgroupid     = $data['utm_adgroupid'] ?? '';
$utm_adname        = $data['utm_adname'] ?? '';

$adset      = $utm_adgroupname !== '' ? $utm_adgroupname : ($data['utm_adset'] ?? '');
$adcreative = $utm_adname !== '' ? $utm_adname : ($data['adcreative'] ?? '');
$ad_id      = $utm_adgroupid !== '' ? $utm_adgroupid : ($data['ad_id'] ?? '');
$utmC       = $utm_campaignname;

$campaigncode = $data['campaigncode'] ?? '';
$campaignname = $data['campaignname'] ?? '';

// Same defaults as the old Belle Vue page
if ($campaigncode === '')     { $campaigncode = "FY26_27"; }
if ($campaignname === '')     { $campaignname = "NRI Digital FY 26_27"; }
if ($campaignsource === '')   { $campaignsource = "Google"; }
if ($campaignsubsource === ''){ $campaignsubsource = "Organic"; }
if ($placement === '')        { $placement = "Webzaa"; }

// Form data
$form_id         = $data['form_id'] ?? '';
$leadgen_id      = $data['leadgen_id'] ?? '';
$page_id         = $data['page_id'] ?? '';
$capturefromname = $data['formname'] ?? ($data['source'] ?? '');
$session         = $data['session_id'] ?? '';
$websitename     = 'Rustomjee Belle Vue';
$reason          = '';


// =====================================================
// UNIQUE ID  (RUSTBELLE001, 002, ...)
// =====================================================
$lastRes = mysqli_query($con, "SELECT uniqueid FROM `lead` WHERE uniqueid LIKE 'RUSTBELLE%' ORDER BY id DESC LIMIT 1");

if (!$lastRes) {
    echo json_encode(["status" => 0, "msg" => "Unique ID query failed", "error" => mysqli_error($con)]);
    mysqli_close($con);
    exit;
}

if (mysqli_num_rows($lastRes) > 0) {
    $row        = mysqli_fetch_assoc($lastRes);
    $number     = preg_replace('/\D/', '', $row['uniqueid']);
    $nextNumber = str_pad(((int) $number) + 1, max(3, strlen($number)), '0', STR_PAD_LEFT);
    $uniqueid   = "RUSTBELLE" . $nextNumber;
} else {
    $uniqueid = "RUSTBELLE001";
}


// =====================================================
// DUPLICATE CHECK (mobile + email)
// =====================================================
$dup = $con->prepare("SELECT id FROM `lead` WHERE mobile = ? AND email = ? LIMIT 1");
$dup->bind_param("ss", $mobile, $email);
$dup->execute();
$dup->store_result();
$duplicate = $dup->num_rows > 0 ? "Yes" : "No";
$dup->close();


// =====================================================
// INSERT LEAD
// =====================================================
$sql = "INSERT INTO `lead`
(name, email, countrycode, mobile, campaignsource, campaignsubsource, placement, device,
 adset, adcreative, keyword, capturefromname, websitename, createddate,
 utmM, utmC, duplicate, last_reson, ip_address, uniqueid)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";

$stmt = mysqli_prepare($con, $sql);

if (!$stmt) {
    echo json_encode(["status" => 0, "msg" => "SQL prepare failed", "error" => mysqli_error($con)]);
    mysqli_close($con);
    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    str_repeat('s', 19),
    $name, $email, $countrycode, $mobile, $campaignsource, $campaignsubsource, $placement, $device,
    $adset, $adcreative, $keyword, $capturefromname, $websitename,
    $utmM, $utmC, $duplicate, $reason, $ipaddress, $uniqueid
);

if (!mysqli_stmt_execute($stmt)) {
    echo json_encode(["status" => 0, "msg" => "Error adding lead", "error" => mysqli_stmt_error($stmt)]);
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    exit;
}

$last_insertid = mysqli_insert_id($con);
mysqli_stmt_close($stmt);


// =====================================================
// ANALYTICS: map click_logs to lead (skipped if table missing)
// =====================================================
if ($session !== '') {
    $map = @$con->prepare("UPDATE click_logs SET lead_id=? WHERE session_id=? AND lead_id IS NULL");
    if ($map) {
        $map->bind_param("is", $last_insertid, $session);
        $map->execute();
        $map->close();
    }
}


// =====================================================
// SALESFORCE PAYLOAD
// =====================================================
$sfPayload = [
    "FirstName"              => $name,
    "LastName"               => $name,
    "EmailAddress"           => $email,
    "DialingCode"            => $countrycode,
    "MobileNumber"           => $mobile,
    "CampaignCode"           => $campaigncode,
    "CampaignName"           => $campaignname,
    "Project"                => "Rustomjee Belle Vue",
    "SourceGrouping"         => " NRI Digital",
    "Source"                 => $campaignsource,
    "SubSource"              => $campaignsubsource,
    "Device"                 => $device,
    "GCLID"                  => $gclid,
    "Keyword"                => $keyword,
    "Placement"              => "Webzaa",
    "ProspectCapturingPoint" => "prospect",
    "WhatsappOptn"           => true,
    "preferredproject"       => "",
    "current_resd_location"  => "",
    "budget"                 => "0",
    "AdSetId"                => "",
    "AdsetName"              => $adset,
    "AdId"                   => $ad_id,
    "AdName"                 => $adcreative,
    "MetaId"                 => $uniqueid
];

$sfPayloadJson = json_encode($sfPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
error_log("SF PAYLOAD: " . $sfPayloadJson);

$response1 = '';
$response2 = '';
$token     = '';

if ($SKIP_SALESFORCE) {

    $response2 = "Salesforce skipped (SKIP_SALESFORCE = true)";

} else {

    // ---------- Google Form sync (Belle Vue sheet) ----------
    $formFields = [
        'entry.1229589760' => $name,
        'entry.564300906'  => $email,
        'entry.2021393163' => $mobile,
        'entry.37314956'   => $countrycode,
        'entry.301246766'  => $campaignsource,
        'entry.1379157052' => $campaignsubsource,
        'entry.579415301'  => $utmM,
        'entry.1853380348' => $utmC,
        'entry.1065459765' => $keyword,
        'entry.592845166'  => $adset,
        'entry.3211414'    => $adcreative,
        'entry.910728666'  => $form_id,
        'entry.351071000'  => $page_id,
        'entry.174595556'  => $leadgen_id,
        'entry.390277206'  => $placement,
        'entry.115273061'  => $device,
        'entry.881115463'  => $campaignname
    ];

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfuZOHTyfmmNNourJ4k0a82rH25RlI20Wqu5RXeAfvx6Pc_wQ/formResponse',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => http_build_query($formFields),
        CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded'),
    ));
    curl_exec($curl);
    $formHttpCode  = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $formCurlError = curl_error($curl);
    curl_close($curl);

    error_log("Google Form HTTP Code: " . $formHttpCode);
    error_log("Google Form cURL Error: " . ($formCurlError ?: 'none'));

    // ---------- Salesforce token ----------
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://login.salesforce.com/services/oauth2/token',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => 'grant_type=password&client_id=' . urlencode($SF_CLIENT_ID) . '&client_secret=' . urlencode($SF_CLIENT_SECRET) . '&username=' . urlencode($SF_USERNAME) . '&password=' . urlencode($SF_PASSWORD) . '',
        CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded'),
    ));
    $response1 = curl_exec($curl);
    curl_close($curl);

    $tokenResponse = json_decode((string) $response1);
    $token = $tokenResponse->access_token ?? '';

    // ---------- Salesforce lead ----------
    if ($token !== '') {
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://rustomjeesf.my.salesforce.com/services/apexrest/WebEnqs',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $sfPayloadJson,
            CURLOPT_HTTPHEADER => array(
                "Authorization: Bearer " . $token,
                "Content-Type: application/json"
            ),
        ));
        $response2 = curl_exec($curl);
        curl_close($curl);
    } else {
        $response2 = json_encode(["status" => "Salesforce token failed", "response" => $response1]);
    }
}


// =====================================================
// STORE SALESFORCE RESPONSE
// =====================================================
$curlresponse = json_encode($response2);
$update = $con->prepare("UPDATE `lead` SET curlresponse = ? WHERE id = ?");
if ($update) {
    $update->bind_param("si", $curlresponse, $last_insertid);
    $update->execute();
    $update->close();
}


// =====================================================
// FINAL RESPONSE
// =====================================================
$json = [
    "status"    => 1,
    "msg"       => "Lead added successfully",
    "lead_id"   => $last_insertid,
    "unique_id" => $uniqueid
];

if ($SHOW_PAYLOAD) {
    $json["payload"]             = $sfPayload;
    $json["salesforce_response"] = $response2;
}

mysqli_close($con);
echo json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
