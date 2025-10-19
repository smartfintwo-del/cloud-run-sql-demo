
const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/healthz', async (req,res) => {
  const ok = await db.testConnection();
  res.json({ ok });
});

router.get('/holdings', async (req,res,next) => {
  try {
    const { rows } = await db.query("SELECT * FROM holdings ORDER BY created_at DESC LIMIT 200");
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/holdings', async (req,res,next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const inserted = [];
    for (const it of items) {
      const { ticker, company_name, weight, sector } = it;
      const w = (typeof weight === 'number') ? weight : (weight ? Number(weight) : null);
      const q = `INSERT INTO holdings (ticker, company_name, weight, sector) VALUES ($1,$2,$3,$4) RETURNING *`;
      const { rows } = await db.query(q, [ticker, company_name || null, w, sector || null]);
      inserted.push(rows[0]);
    }
    res.json({ insertedCount: inserted.length, rows: inserted });
  } catch (e) { next(e); }
});

router.post('/upload-history', async (req,res,next) => {
  try {
    const { file_name, total_rows, status='success', error_message=null } = req.body || {};
    const q = `INSERT INTO upload_history (file_name, total_rows, status, error_message) VALUES ($1,$2,$3,$4) RETURNING *`;
    const { rows } = await db.query(q, [file_name||null, total_rows||0, status, error_message]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/upload-history', async (req,res,next) => {
  try {
    const { rows } = await db.query("SELECT * FROM upload_history ORDER BY created_at DESC LIMIT 100");
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
