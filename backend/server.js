
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database/db');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic auth for write
const UPLOAD_USER = process.env.UPLOAD_USER || '';
const UPLOAD_PASS = process.env.UPLOAD_PASS || '';
function requireBasicAuth(req, res, next) {
  if (!UPLOAD_USER || !UPLOAD_PASS) return next();
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Uploads"');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const decoded = Buffer.from(hdr.slice(6), 'base64').toString('utf8');
  const sep = decoded.indexOf(':');
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);
  if (user === UPLOAD_USER && pass === UPLOAD_PASS) return next();
  res.set('WWW-Authenticate', 'Basic realm="Uploads"');
  return res.status(401).json({ error: 'Unauthorized' });
}
function protectWrite(req,res,next){
  const m = (req.method||'GET').toUpperCase();
  if (['POST','PUT','PATCH','DELETE'].includes(m)) return requireBasicAuth(req,res,next);
  return next();
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api', protectWrite, apiRouter);

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/health', async (req,res)=>{
  const ok = await db.testConnection();
  res.json({ ok, time: new Date().toISOString() });
});
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});
app.listen(PORT, '0.0.0.0', ()=>console.log(`Listening on ${PORT}`));
