<?php
// editor.php - Simple JSON data editor for mucollection
// Place this file in the mucollection directory and open in your browser

// List of editable JSON files
$dataFiles = [
    'maps.json',
    'vehicles.json',
    'clothing.json',
    'scripts.json',
    'others.json'
];

// Handle file selection
$file = isset($_GET['file']) && in_array($_GET['file'], $dataFiles) ? $_GET['file'] : $dataFiles[0];

// Handle save
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsondata'])) {
    $json = $_POST['jsondata'];
    // Validate JSON
    json_decode($json);
    if (json_last_error() === JSON_ERROR_NONE) {
        file_put_contents($file, $json);
        $msg = "Saved successfully.";
    } else {
        $msg = "Invalid JSON: " . json_last_error_msg();
    }
}

// Load file content
$jsonContent = file_exists($file) ? file_get_contents($file) : '';

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JSON Data Editor</title>
    <style>
        body {
            background: linear-gradient(135deg, #23242a 0%, #3a3b47 100%);
            color: #f3f3f3;
            font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .header {
            background: #23242a;
            box-shadow: 0 2px 16px #0008;
            padding: 1.5em 0 1em 0;
            text-align: center;
            border-bottom: 1px solid #333;
        }
        .header h1 {
            margin: 0;
            font-size: 2.2em;
            letter-spacing: 1px;
            color: #ffd700;
            font-weight: 700;
        }
        .container {
            max-width: 950px;
            margin: 2.5em auto 2em auto;
            background: #292a33;
            border-radius: 18px;
            box-shadow: 0 8px 32px #000a;
            padding: 2.5em 2.5em 5em 2.5em;
            position: relative;
        }
        .file-select {
            margin-bottom: 1.5em;
            display: flex;
            align-items: center;
            gap: 1em;
            justify-content: center;
        }
        label {
            font-size: 1.1em;
            color: #ffd700;
            font-weight: 500;
        }
        select {
            font-size: 1.1em;
            padding: 0.5em 1.2em;
            border-radius: 7px;
            border: none;
            background: #23242a;
            color: #ffd700;
            box-shadow: 0 2px 8px #0003;
            outline: none;
        }
        select:focus {
            border: 1.5px solid #ffd700;
        }
        textarea {
            width: 100%;
            height: 520px;
            font-family: 'Fira Mono', 'Consolas', monospace;
            font-size: 1.08em;
            border-radius: 10px;
            border: 1.5px solid #444;
            background: #181920;
            color: #ffd700;
            padding: 1.2em;
            margin-top: 1em;
            box-shadow: 0 2px 12px #0003;
            transition: border 0.2s;
        }
        textarea:focus {
            border: 1.5px solid #ffd700;
            outline: none;
        }
        .msg {
            margin: 1.2em 0 0.5em 0;
            color: #ffd700;
            font-weight: 600;
            text-align: center;
            font-size: 1.1em;
        }
        .save-bar {
            position: fixed;
            left: 0; right: 0; bottom: 0;
            background: #23242a;
            box-shadow: 0 -2px 16px #000a;
            padding: 1em 0.5em;
            display: flex;
            justify-content: center;
            z-index: 100;
        }
        .save-bar button {
            font-size: 1.15em;
            padding: 0.6em 2.2em;
            border-radius: 8px;
            border: none;
            background: linear-gradient(90deg, #ffd700 0%, #ffb300 100%);
            color: #23242a;
            font-weight: 700;
            box-shadow: 0 2px 8px #0005;
            cursor: pointer;
            transition: background 0.18s, color 0.18s;
        }
        .save-bar button:hover {
            background: linear-gradient(90deg, #ffe066 0%, #ffd700 100%);
            color: #181920;
        }
        .tip {
            margin-top: 2.5em;
            font-size: 1em;
            color: #aaa;
            text-align: center;
        }
        @media (max-width: 700px) {
            .container { padding: 1em 0.5em 5em 0.5em; }
            textarea { height: 320px; font-size: 0.98em; }
        }
    </style>
</head>
<body>
<div class="header">
    <h1>📝 JSON Data Editor</h1>
</div>
<div class="container">
    <form method="get" class="file-select">
        <label for="file">Select file:</label>
        <select name="file" id="file" onchange="this.form.submit()">
            <?php foreach ($dataFiles as $f): ?>
                <option value="<?= htmlspecialchars($f) ?>"<?= $f === $file ? ' selected' : '' ?>><?= htmlspecialchars($f) ?></option>
            <?php endforeach; ?>
        </select>
    </form>
    <?php if (isset($msg)): ?>
        <div class="msg"><?= htmlspecialchars($msg) ?></div>
    <?php endif; ?>
    <form method="post" id="editform">
        <textarea name="jsondata" required spellcheck="false" autocapitalize="off" autocomplete="off"><?= htmlspecialchars($jsonContent) ?></textarea>
    </form>
    <div class="tip">Tip: Use a JSON formatter/validator for easier editing. Always keep a backup!</div>
</div>
<div class="save-bar">
    <button type="submit" form="editform">💾 Save</button>
</div>
</body>
</html>
