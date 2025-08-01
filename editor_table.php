<?php
// editor_table.php - Table-based JSON editor for mucollection
// Place this file in the mucollection directory and open in your browser

$dataFiles = [
    'maps.json',
    'vehicles.json',
    'clothing.json',
    'scripts.json',
    'others.json'
];

$file = isset($_GET['file']) && in_array($_GET['file'], $dataFiles) ? $_GET['file'] : $dataFiles[0];

// Handle save (AJAX)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsondata'])) {
    $json = $_POST['jsondata'];
    json_decode($json);
    if (json_last_error() === JSON_ERROR_NONE) {
        file_put_contents($file, $json);
        echo 'success';
    } else {
        http_response_code(400);
        echo 'Invalid JSON: ' . json_last_error_msg();
    }
    exit;
}

$jsonContent = file_exists($file) ? file_get_contents($file) : '[]';
$data = json_decode($jsonContent, true) ?: [];

function h($s) { return htmlspecialchars($s, ENT_QUOTES); }

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Table JSON Editor</title>
    <style>
        body { background: #23242a; color: #eee; font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; margin: 0; padding: 0; }
        .header { background: #23242a; box-shadow: 0 2px 16px #0008; padding: 1.5em 0 1em 0; text-align: center; border-bottom: 1px solid #333; }
        .header h1 { margin: 0; font-size: 2.2em; letter-spacing: 1px; color: #ffd700; font-weight: 700; }
        .container {
            max-width: 98vw;
            width: 1800px;
            min-width: 900px;
            margin: 2.5em auto 2em auto;
            background: #292a33;
            border-radius: 18px;
            box-shadow: 0 8px 32px #000a;
            padding: 2.5em 2.5em 5em 2.5em;
            position: relative;
            overflow-x: auto;
        }
        .file-select { margin-bottom: 1.5em; display: flex; align-items: center; gap: 1em; justify-content: center; }
        label { font-size: 1.1em; color: #ffd700; font-weight: 500; }
        select { font-size: 1.1em; padding: 0.5em 1.2em; border-radius: 7px; border: none; background: #23242a; color: #ffd700; box-shadow: 0 2px 8px #0003; outline: none; }
        select:focus { border: 1.5px solid #ffd700; }
        table {
            width: 100%;
            min-width: 1400px;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 1.5em;
            background: #23242a;
            border-radius: 10px;
            overflow: hidden;
        }
        th, td { padding: 1em 0.7em; border-bottom: 1px solid #333; text-align: left; }
        th { background: #23242a; color: #ffd700; font-size: 1.08em; position: sticky; top: 0; z-index: 2; box-shadow: 0 2px 8px #0003; }
        tr:last-child td { border-bottom: none; }
        tr.selected { background: #35364a; }
        tbody tr:nth-child(even) { background: #282a36; }
        tbody tr:nth-child(odd) { background: #23242a; }
        td input, td textarea { width: 100%; background: #23242a; color: #ffe066; border: 1.5px solid #444; border-radius: 6px; padding: 0.5em 0.7em; font-size: 1.05em; box-shadow: 0 1px 4px #0002; }
        td textarea { resize: vertical; min-height: 2em; }
        td input:focus, td textarea:focus { border: 1.5px solid #ffd700; outline: none; background: #181920; color: #ffd700; }
        .actions { display: flex; gap: 0.5em; }
        .actions button { background: #ffd700; color: #23242a; border: none; border-radius: 6px; padding: 0.3em 1.1em; font-weight: 600; cursor: pointer; transition: background 0.18s; }
        .actions button:hover { background: #ffe066; }
        .add-row { margin: 1.5em 0 0.5em 0; text-align: right; }
        .add-row button { background: linear-gradient(90deg, #ffd700 0%, #ffb300 100%); color: #23242a; font-weight: 700; border: none; border-radius: 8px; padding: 0.5em 2em; font-size: 1.1em; box-shadow: 0 2px 8px #0005; cursor: pointer; transition: background 0.18s, color 0.18s; }
        .add-row button:hover { background: linear-gradient(90deg, #ffe066 0%, #ffd700 100%); color: #181920; }
        .msg { margin: 1.2em 0 0.5em 0; color: #ffd700; font-weight: 600; text-align: center; font-size: 1.1em; }
        .save-bar { position: fixed; left: 0; right: 0; bottom: 0; background: #23242a; box-shadow: 0 -2px 16px #000a; padding: 1em 0.5em; display: flex; justify-content: center; z-index: 100; }
        .save-bar button { font-size: 1.15em; padding: 0.6em 2.2em; border-radius: 8px; border: none; background: linear-gradient(90deg, #ffd700 0%, #ffb300 100%); color: #23242a; font-weight: 700; box-shadow: 0 2px 8px #0005; cursor: pointer; transition: background 0.18s, color 0.18s; }
        .save-bar button:hover { background: linear-gradient(90deg, #ffe066 0%, #ffd700 100%); color: #181920; }
        .tip { margin-top: 2.5em; font-size: 1em; color: #aaa; text-align: center; }
        @media (max-width: 1800px) {
            .container { width: 99vw; min-width: 0; padding: 1em 0.5em 5em 0.5em; }
            table { min-width: 900px; font-size: 0.95em; }
        }
        @media (max-width: 1200px) {
            .container { width: 100vw; min-width: 0; padding: 0.5em 0.2em 5em 0.2em; }
            table { min-width: 700px; font-size: 0.93em; }
        }
    </style>
</head>
<body>
<div class="header">
    <h1>📋 Table JSON Editor</h1>
</div>
<div class="container">
    <form method="get" class="file-select">
        <label for="file">Select file:</label>
        <select name="file" id="file" onchange="this.form.submit()">
            <?php foreach ($dataFiles as $f): ?>
                <option value="<?= h($f) ?>"<?= $f === $file ? ' selected' : '' ?>><?= h($f) ?></option>
            <?php endforeach; ?>
        </select>
    </form>
    <div class="add-row">
        <button type="button" onclick="addRow()">+ Add Item</button>
    </div>
    <form id="tableform">
        <table id="datatable">
            <thead>
            <tr>
                <?php
                // Show all keys as columns
                $allKeys = [];
                foreach ($data as $row) $allKeys = array_merge($allKeys, array_keys($row));
                $allKeys = array_unique($allKeys);
                foreach ($allKeys as $key): ?>
                    <th><?= h($key) ?></th>
                <?php endforeach; ?>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($data as $i => $row): ?>
                <tr>
                    <?php foreach ($allKeys as $key): ?>
                        <td>
                            <?php if (is_array($row[$key] ?? null)): ?>
                                <textarea name="row<?= $i ?>[<?= h($key) ?>]"><?= h(json_encode($row[$key], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) ?></textarea>
                            <?php else: ?>
                                <input type="text" name="row<?= $i ?>[<?= h($key) ?>]" value="<?= h($row[$key] ?? '') ?>">
                            <?php endif; ?>
                        </td>
                    <?php endforeach; ?>
                    <td class="actions">
                        <button type="button" onclick="deleteRow(this)">Delete</button>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </form>
    <div class="msg" id="msg"></div>
    <div class="tip">Tip: Arrays/objects are edited as JSON. Click 'Add Item' to insert a new row. Don't forget to save!</div>
</div>
<div class="save-bar">
    <button type="button" onclick="saveTable()">💾 Save</button>
</div>
<script>
function addRow() {
    const table = document.getElementById('datatable').getElementsByTagName('tbody')[0];
    const cols = table.parentNode.getElementsByTagName('th').length - 1;
    const tr = document.createElement('tr');
    for (let i = 0; i < cols; i++) {
        const td = document.createElement('td');
        td.innerHTML = '<input type="text">';
        tr.appendChild(td);
    }
    const tdActions = document.createElement('td');
    tdActions.className = 'actions';
    tdActions.innerHTML = '<button type="button" onclick="deleteRow(this)">Delete</button>';
    tr.appendChild(tdActions);
    table.appendChild(tr);
}
function deleteRow(btn) {
    btn.closest('tr').remove();
}
function saveTable() {
    const table = document.getElementById('datatable');
    const rows = Array.from(table.getElementsByTagName('tbody')[0].rows);
    const keys = Array.from(table.getElementsByTagName('th')).slice(0, -1).map(th => th.textContent);
    const data = rows.map(row => {
        const obj = {};
        Array.from(row.cells).slice(0, -1).forEach((cell, i) => {
            const input = cell.querySelector('input,textarea');
            let val = input ? input.value : '';
            // Try to parse JSON for textarea
            if (input && input.tagName === 'TEXTAREA') {
                try { val = JSON.parse(val); } catch (e) { val = val; }
            }
            obj[keys[i]] = val;
        });
        return obj;
    });
    const msg = document.getElementById('msg');
    msg.textContent = 'Saving...';
    fetch(location.pathname + '?file=' + encodeURIComponent(document.getElementById('file').value), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'jsondata=' + encodeURIComponent(JSON.stringify(data, null, 2))
    })
    .then(r => r.ok ? r.text() : r.text().then(t => { throw t; }))
    .then(() => { msg.textContent = 'Saved successfully!'; setTimeout(()=>msg.textContent='', 2000); })
    .catch(e => { msg.textContent = e; });
}
</script>
</body>
</html>
