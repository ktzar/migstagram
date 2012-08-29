<?php
/**
 * This script might be INSECURE
 * If you have sensitive information in the same local network where your server is, you might want not to
 * use this script. It tries to prevent 
 */
function isValidURL($url) {
    return preg_match('|^http(s)?://[a-z0-9-]+(.[a-z0-9-]+)*(:[0-9]+)?(/.*)?$|i', $url);
}
function is_numeric_array($array) {
    foreach ($array as $key => $value) {
        if (!is_numeric($value)) return false;
    }
    return true;
}

$url = $_GET['url'];
if (!isValidURL($url)) {
    die('no url');
}
$url_info = parse_url($url);
$url_host_parts = explode('.', $url_info['host']);
if (count($url_host_parts == 4) && is_numeric_array($url_host_parts)) {
    die('no ips, thanks');
}

$error = true;
//Send specific headers depending on extension
$ext = substr($url, -3) ;
if ( $ext == 'png') {
    header('Content-type: image/png');
    $error = false;
} elseif ( $ext == 'jpg') {
    header('Content-type: image/jpeg');
    $error = false;
} elseif ( $ext == 'gif') {
    header('Content-type: image/gif');
    $error = false;
}
if (!$error) {
    $contents = file_get_contents($url);
    echo $contents;
}

