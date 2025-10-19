
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text().catch(()=>res.statusText));
  return await res.json();
}

async function loadHoldings() {
  const rows = await fetchJSON('/api/holdings');
  const tbody = document.getElementById('tblBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted">데이터 없음</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.ticker}</td>
      <td>${r.company_name || '-'}</td>
      <td style="text-align:right">${r.weight != null ? Number(r.weight).toFixed(4)+'%' : '-'}</td>
      <td>${r.sector || '-'}</td>
      <td>${new Date(r.created_at).toLocaleString()}</td>
    </tr>
  `).join('');
}

async function createHolding() {
  const ticker = document.getElementById('ticker').value.trim();
  const company = document.getElementById('company').value.trim();
  const weight = document.getElementById('weight').value.trim();
  const sector = document.getElementById('sector').value.trim();
  if (!ticker) { alert('티커를 입력하세요'); return; }

  const w = weight ? Number(weight.replace(/[, ]/g,'')) : null;

  await fetchJSON('/api/holdings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, company_name: company || null, weight: w, sector: sector || null })
  });

  document.getElementById('ticker').value = '';
  document.getElementById('company').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('sector').value = '';

  await loadHoldings();
}

document.getElementById('btnUpload').addEventListener('click', createHolding);
document.getElementById('btnLoad').addEventListener('click', loadHoldings);
window.addEventListener('load', loadHoldings);

(function () {
  let __creds = null;
  const write = m => ['POST','PUT','PATCH','DELETE'].includes((m||'GET').toUpperCase());
  const protect = url => {
    try { const u = new URL(url, location.origin); return u.origin===location.origin && u.pathname.startsWith('/api/'); }
    catch { return false; }
  };
  async function ensureCreds() {
    if (__creds?.u && __creds?.p) return;
    const u = prompt('업로드 아이디(UPLOAD_USER):'); if (!u) throw new Error('아이디 필요');
    const p = prompt('업로드 비밀번호(UPLOAD_PASS):'); if (!p) throw new Error('비밀번호 필요');
    __creds = { u:u.trim(), p };
  }
  function basic() { return 'Basic ' + btoa(`${__creds.u}:${__creds.p}`); }
  const orig = window.fetch;
  window.fetch = async function(input, init){
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const method = (init && init.method) || (typeof input!=='string' ? input.method : 'GET');
    if (write(method) && protect(url)) {
      await ensureCreds();
      const headers = new Headers((init && init.headers) || (typeof input!=='string' ? input.headers : undefined) || {});
      if (!headers.has('Authorization')) headers.set('Authorization', basic());
      const next = Object.assign({}, init, { headers });
      return orig.call(this, input, next);
    }
    return orig.call(this, input, init);
  };
})();
