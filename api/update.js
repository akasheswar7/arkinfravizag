// api/update.js
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // A secure private KV bucket ID for storing the update text
  const KV_URL = 'https://kvdb.io/K6K7vQv7u2R1Q2m8Q2p7Q1/arkinfra_active_update';

  if (req.method === 'GET') {
    try {
      const response = await fetch(KV_URL);
      if (response.status === 404) {
        return res.status(200).json({ update: "" });
      }
      const text = await response.text();
      return res.status(200).json({ update: text.trim() });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch update" });
    }
  }

  if (req.method === 'POST') {
    const { username, password, update, verifyOnly } = req.body || {};
    
    // Server-side Authentication check
    if (username !== 'ARUNARK' || password !== 'ARUNHANU97') {
      return res.status(401).json({ error: "Unauthorized: Invalid credentials" });
    }

    if (verifyOnly) {
      return res.status(200).json({ success: true, message: "Credentials verified successfully" });
    }

    try {
      const response = await fetch(KV_URL, {
        method: 'PUT',
        body: (update || "").trim()
      });
      
      if (!response.ok) {
        throw new Error("Failed to write to KV store");
      }
      
      return res.status(200).json({ success: true, update: update });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to save update" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
