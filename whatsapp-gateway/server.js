const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));

const PORT = 3300;
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

let sock = null;
let latestQrCode = null;
let isConnected = false;
let userPhone = null;
let activeSendJob = null;

const logger = pino({ level: 'silent' });

async function initWhatsApp() {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      logger,
      browser: ['ARK Infra Vizag', 'Chrome', '1.0.0'],
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          latestQrCode = await qrcode.toDataURL(qr, { width: 340, margin: 2 });
          isConnected = false;
          console.log('[WhatsApp Gateway] New QR code generated. Scan with your phone.');
        } catch (err) {
          console.error('[WhatsApp Gateway] Error creating QR image:', err);
        }
      }

      if (connection === 'close') {
        isConnected = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[WhatsApp Gateway] Connection closed. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

        if (statusCode === DisconnectReason.loggedOut) {
          console.log('[WhatsApp Gateway] Logged out. Clearing credentials...');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (_) {}
          latestQrCode = null;
          userPhone = null;
          setTimeout(initWhatsApp, 2000);
        } else {
          setTimeout(initWhatsApp, 3000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        latestQrCode = null;
        userPhone = sock.user?.id ? sock.user.id.split(':')[0] : 'Connected';
        console.log(`[WhatsApp Gateway] ✅ WhatsApp Connected Successfully! Linked Phone: +${userPhone}`);
      }
    });
  } catch (err) {
    console.error('[WhatsApp Gateway] Initialization error:', err);
    setTimeout(initWhatsApp, 5000);
  }
}

// Helper to normalize Indian and international numbers into Baileys JID
function formatJid(rawPhone) {
  if (!rawPhone) return null;
  let clean = rawPhone.toString().replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean + '@s.whatsapp.net';
}

// 1. Dashboard View (Luxury ARK Infra Theme)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ARK Infra - WhatsApp Gateway Engine</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --navy: #050d1a;
      --navy-card: #0c182c;
      --gold: #c9a962;
      --green: #25d366;
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--navy);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: var(--navy-card);
      border: 1.5px solid var(--gold);
      border-radius: 14px;
      padding: 2.2rem;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(201,169,98,0.2);
    }
    h1 {
      margin: 0 0 0.5rem 0;
      color: var(--gold);
      font-size: 1.6rem;
    }
    p {
      color: #cbd5e1;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }
    .qr-box {
      background: #fff;
      padding: 12px;
      border-radius: 10px;
      display: inline-block;
      margin: 1rem 0;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .badge-success { background: rgba(37,211,102,0.2); color: var(--green); border: 1px solid var(--green); }
    .badge-waiting { background: rgba(201,169,98,0.2); color: var(--gold); border: 1px solid var(--gold); }
    .btn {
      background: var(--gold);
      color: #000;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    .btn-danger { background: #ef4444; color: #fff; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📱 ARK Infra WhatsApp Gateway</h1>
    <p>100% Free Background Bulk Delivery Engine (Zero Popups)</p>

    <div id="statusArea">
      <div class="badge badge-waiting">⏳ Checking Connection...</div>
    </div>

    <div id="qrArea" style="display:none;">
      <div class="qr-box">
        <img id="qrImg" src="" alt="Scan QR Code" style="width: 280px; height: 280px; display:block;">
      </div>
      <p style="font-size: 0.85rem; color: #94a3b8;">
        Open <b>WhatsApp</b> on your phone ➔ <b>Linked Devices</b> ➔ <b>Link a Device</b> ➔ Scan this code!
      </p>
    </div>

    <div id="connectedArea" style="display:none;">
      <div class="badge badge-success" id="connectedBadge">🟢 Connected & Ready</div>
      <p style="color: #4ade80; font-size: 0.95rem;">
        Your WhatsApp is connected! You can now send bulk messages from your Admin Portal with 1-click.
      </p>
      <button class="btn btn-danger" onclick="logout()">Unlink / Connect Another Number</button>
    </div>
  </div>

  <script>
    async function checkStatus() {
      try {
        const res = await fetch('/status');
        const data = await res.json();

        if (data.connected) {
          document.getElementById('statusArea').style.display = 'none';
          document.getElementById('qrArea').style.display = 'none';
          document.getElementById('connectedArea').style.display = 'block';
          document.getElementById('connectedBadge').textContent = '🟢 Connected: +' + (data.phone || '');
        } else if (data.qr) {
          document.getElementById('statusArea').style.display = 'none';
          document.getElementById('connectedArea').style.display = 'none';
          document.getElementById('qrArea').style.display = 'block';
          document.getElementById('qrImg').src = data.qr;
        } else {
          document.getElementById('statusArea').innerHTML = '<div class="badge badge-waiting">⏳ Generating QR Code...</div>';
          document.getElementById('qrArea').style.display = 'none';
          document.getElementById('connectedArea').style.display = 'none';
        }
      } catch (err) {
        document.getElementById('statusArea').innerHTML = '<div class="badge" style="background:rgba(239,68,68,0.2);color:#f87171;">Server offline</div>';
      }
    }

    async function logout() {
      if (!confirm('Are you sure you want to unlink this WhatsApp number?')) return;
      await fetch('/logout', { method: 'POST' });
      alert('Unlinked! Generating new QR code...');
      location.reload();
    }

    setInterval(checkStatus, 2500);
    checkStatus();
  </script>
</body>
</html>
  `);
});

// 2. Status Endpoint
app.get('/status', (req, res) => {
  res.json({
    success: true,
    connected: isConnected,
    phone: userPhone,
    qr: latestQrCode,
    activeJob: activeSendJob ? { total: activeSendJob.total, sent: activeSendJob.sent } : null
  });
});

// 3. Single Send Endpoint
app.post('/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!isConnected || !sock) {
    return res.status(400).json({ success: false, error: 'WhatsApp is not connected. Please scan the QR code first.' });
  }
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Phone and message are required.' });
  }

  const jid = formatJid(phone);
  try {
    const result = await sock.sendMessage(jid, { text: message });
    return res.json({ success: true, messageId: result.key.id, to: jid });
  } catch (err) {
    console.error(`[WhatsApp Gateway] Send failed to ${phone}:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Bulk Send Endpoint (With Anti-Ban Smart Pacing)
app.post('/bulk-send', async (req, res) => {
  const { phones, message, delayMs = 1500 } = req.body;

  if (!isConnected || !sock) {
    return res.status(400).json({ success: false, error: 'WhatsApp is not connected. Please scan the QR code first.' });
  }
  if (!Array.isArray(phones) || phones.length === 0 || !message) {
    return res.status(400).json({ success: false, error: 'List of phones and message are required.' });
  }

  let sent = 0;
  let failed = 0;
  const errors = [];

  activeSendJob = { total: phones.length, sent: 0, failed: 0 };

  console.log(`[WhatsApp Gateway] 🚀 Starting bulk broadcast to ${phones.length} recipients...`);

  for (let i = 0; i < phones.length; i++) {
    const p = phones[i];
    const jid = formatJid(p);

    try {
      await sock.sendMessage(jid, { text: message });
      sent++;
      activeSendJob.sent = sent;
      console.log(`[WhatsApp Gateway] (${sent}/${phones.length}) Delivered to ${p}`);
    } catch (err) {
      failed++;
      activeSendJob.failed = failed;
      errors.push({ phone: p, error: err.message });
      console.error(`[WhatsApp Gateway] Failed to send to ${p}:`, err.message);
    }

    // Anti-ban delay between messages (default 1.5 seconds)
    if (i < phones.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  activeSendJob = null;
  console.log(`[WhatsApp Gateway] 🎉 Broadcast complete! Sent: ${sent}, Failed: ${failed}`);

  return res.json({
    success: true,
    total: phones.length,
    sent,
    failed,
    errors: errors.slice(0, 10),
    message: `Delivered to ${sent} contacts (${failed} failed)`
  });
});

// 5. Logout / Reset Endpoint
app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout().catch(() => {});
    }
  } catch (_) {}

  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (_) {}

  isConnected = false;
  latestQrCode = null;
  userPhone = null;

  setTimeout(initWhatsApp, 1000);
  return res.json({ success: true, message: 'Session logged out and cleared.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 ARK Infra WhatsApp Gateway running on http://localhost:${PORT}`);
  console.log(`📱 Scan your QR code at: http://localhost:${PORT}`);
  console.log(`====================================================`);
  initWhatsApp();
});
