<?php
declare(strict_types=1);

session_start();

function redirect_with_status(string $status): never
{
    header('Location: contact.html?status=' . rawurlencode($status));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_status('invalid');
}

// Basic rate limit: one submission per minute per session.
$now = time();
$lastSubmission = isset($_SESSION['last_contact_submission']) ? (int) $_SESSION['last_contact_submission'] : 0;
if ($lastSubmission > 0 && ($now - $lastSubmission) < 60) {
    redirect_with_status('error');
}

// Honeypot field: real users should leave this empty.
if (!empty($_POST['website'] ?? '')) {
    redirect_with_status('success');
}

$fields = [
    'name' => trim((string) ($_POST['name'] ?? '')),
    'email' => trim((string) ($_POST['email'] ?? '')),
    'telephone' => trim((string) ($_POST['telephone'] ?? '')),
    'company' => trim((string) ($_POST['company'] ?? '')),
    'country' => trim((string) ($_POST['country'] ?? '')),
    'interest' => trim((string) ($_POST['interest'] ?? 'General enquiry')),
    'message' => trim((string) ($_POST['message'] ?? '')),
];

$lengthLimits = [
    'name' => 100,
    'email' => 160,
    'telephone' => 40,
    'company' => 140,
    'country' => 80,
    'interest' => 80,
    'message' => 3000,
];

foreach ($fields as $key => $value) {
    if (mb_strlen($value) > $lengthLimits[$key]) {
        redirect_with_status('invalid');
    }
}

if (
    $fields['name'] === '' ||
    $fields['company'] === '' ||
    $fields['country'] === '' ||
    $fields['message'] === '' ||
    !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)
) {
    redirect_with_status('invalid');
}

// Prevent header injection in fields that may be placed in mail headers.
if (preg_match('/[\r\n]/', $fields['email']) || preg_match('/[\r\n]/', $fields['name'])) {
    redirect_with_status('invalid');
}

$recipient = 'adam_lim@hamagawa.com';
$subject = 'Website enquiry: ' . preg_replace('/[^A-Za-z0-9 _-]/', '', $fields['interest']);

$body = "New website enquiry\n\n";
$body .= "Name: {$fields['name']}\n";
$body .= "Email: {$fields['email']}\n";
$body .= "Telephone: {$fields['telephone']}\n";
$body .= "Company: {$fields['company']}\n";
$body .= "Country: {$fields['country']}\n";
$body .= "Project interest: {$fields['interest']}\n\n";
$body .= "Project details:\n{$fields['message']}\n";

$host = $_SERVER['HTTP_HOST'] ?? 'hamagawaortho.com';
$host = preg_replace('/[^A-Za-z0-9.-]/', '', $host);
$headers = [
    'From: Hamagawa Website <no-reply@' . $host . '>',
    'Reply-To: ' . $fields['email'],
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));
if ($sent) {
    $_SESSION['last_contact_submission'] = $now;
    redirect_with_status('success');
}

redirect_with_status('error');
