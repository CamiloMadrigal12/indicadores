(function () {
  'use strict';
  const DATA = window.PDM_DATA || [];
  const num = (x) => (x === '' || x == null || isNaN(Number(x)) ? null : Number(x));
  const pct = (v) => (v == null ? '—' : Math.round(v * 100) + '%');
  const nf = new Intl.NumberFormat('es-CO', {maximumFractionDigits: 2});
  const val = (v, unidad) => (num(v) == null ? 'NP' : (String(unidad).toLowerCase() === 'porcentaje' ? (Math.round(num(v) * 1000) / 10).toLocaleString('es-CO') + '%' : nf.format(num(v))));
  const colorOf = (e) => (e === 'verde' ? 'var(--okf)' : e === 'amarillo' ? 'var(--warnf)' : 'var(--badf)');
  const estadoDe = (p) => (p >= 0.8 ? 'verde' : p >= 0.6 ? 'amarillo' : 'rojo');
  const $ = (id) => document.getElementById(id);
  const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Resumen por secretaría: cuenta por estado y promedia el cumplimiento de los programados (tope 100% por indicador).
  const resumen = (() => {
    const g = new Map();
    for (const r of DATA) {
      const s = g.get(r.secretaria) || {secretaria: r.secretaria, total: 0, programados: 0, verde: 0, amarillo: 0, rojo: 0, np: 0, suma: 0};
      s.total += 1;
      if (r.estado === 'NP') s.np += 1; else { s.programados += 1; s[r.estado] += 1; s.suma += Math.min(Number(r.cumplimiento_2026), 1); }
      g.set(r.secretaria, s);
    }
    return [...g.values()].map(({suma, ...s}) => ({...s, promedio: s.programados ? suma / s.programados : null}));
  })();
  const total = (() => {
    const p = DATA.filter((r) => r.estado !== 'NP');
    const c = (e) => p.filter((r) => r.estado === e).length;
    return {programados: p.length, verde: c('verde'), amarillo: c('amarillo'), rojo: c('rojo'), promedio: p.length ? p.reduce((a, r) => a + Math.min(Number(r.cumplimiento_2026), 1), 0) / p.length : null};
  })();
  const bySlug = new Map(resumen.map((r) => [slug(r.secretaria), r.secretaria]));

  let sec = '';
  let estado = '';
  let elegido = null;

  const td = (text, cls) => { const c = document.createElement('td'); if (cls) c.className = cls; c.textContent = text; return c; };
  const meter = (p, e) => {
    const wrap = document.createElement('div'); wrap.className = 'pd-meter';
    const track = document.createElement('div'); track.className = 'pd-track';
    const fill = document.createElement('div'); fill.className = 'pd-fill';
    fill.style.width = (Math.max(0, Math.min(p, 1.5)) / 1.5 * 100) + '%'; fill.style.background = colorOf(e);
    const ref = document.createElement('div'); ref.className = 'pd-ref';
    track.append(fill, ref);
    const t = document.createElement('span'); t.className = 'pd-pct'; t.textContent = pct(p);
    wrap.append(track, t); return wrap;
  };

  function irA(nombre) {
    elegido = null; estado = '';
    const h = nombre ? '#' + slug(nombre) : '';
    if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
    sec = nombre || '';
    render();
    window.scrollTo({top: 0});
  }

  // Selector
  const sel = $('sec-select');
  sel.replaceChildren(new Option('Todas las secretarías', ''), ...[...resumen].sort((a, b) => a.secretaria.localeCompare(b.secretaria, 'es')).map((r) => new Option(r.secretaria, r.secretaria)));
  sel.addEventListener('change', () => irA(sel.value));
  $('btn-back').addEventListener('click', () => irA(''));
  document.querySelectorAll('.pd-filters button').forEach((b) => b.addEventListener('click', () => { estado = b.dataset.estado; drawInd(); }));

  function drawHeader() {
    const r = sec ? resumen.find((x) => x.secretaria === sec) : total;
    $('t-verde').textContent = r ? r.verde : '—';
    $('t-prog').textContent = r ? r.programados : '—';
    $('t-rojo').textContent = r ? r.rojo : '—';
  }

  function drawGeneral() {
    $('g-prom').textContent = pct(total.promedio);
    $('g-prog').textContent = total.programados;
    $('g-verde').textContent = total.verde;
    $('g-amarillo').textContent = total.amarillo;
    $('g-rojo').textContent = total.rojo;
    const rows = resumen.filter((r) => r.programados > 0).sort((a, b) => a.promedio - b.promedio);
    $('tabla-sec').replaceChildren(...rows.map((r) => {
      const tr = document.createElement('tr'); tr.className = 'click';
      const pc = document.createElement('td'); pc.append(meter(r.promedio, estadoDe(r.promedio)));
      tr.append(td(r.secretaria), td(String(r.programados), 'n'), td(String(r.verde), 'n v'), td(String(r.amarillo), 'n a'), td(String(r.rojo), 'n r'), pc);
      tr.addEventListener('click', () => irA(r.secretaria));
      return tr;
    }));
  }

  const indRows = () => DATA.filter((r) => r.secretaria === sec);

  function drawInd() {
    document.querySelectorAll('.pd-filters button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.estado === estado)));
    const rows = indRows().map((r, i) => ({r, i})).filter(({r}) => r.estado !== 'NP' && (!estado || r.estado === estado)).sort((a, b) => Number(a.r.cumplimiento_2026) - Number(b.r.cumplimiento_2026));
    $('tabla-ind').replaceChildren(...rows.map(({r, i}) => {
      const tr = document.createElement('tr'); tr.className = 'click' + (elegido === i ? ' pd-sel' : '');
      const pc = document.createElement('td'); pc.append(meter(Number(r.cumplimiento_2026), r.estado));
      tr.append(td(r.codigo, 'pd-code'), td(r.indicador), td(val(r.meta_2026, r.unidad), 'n'), td(val(r.cierre_2026, r.unidad), 'n'), pc);
      tr.addEventListener('click', () => { elegido = i; drawInd(); drawDetalle(); });
      return tr;
    }));
  }

  function drawDetalle() {
    const r = elegido == null ? null : indRows()[elegido];
    const el = $('detalle');
    $('hint').hidden = !!r; el.hidden = !r;
    if (!r) { el.replaceChildren(); return; }
    const p = document.createElement('p'); const b = document.createElement('b'); b.textContent = r.indicador;
    p.append(r.codigo + ' · ', b);
    const dl = document.createElement('dl');
    for (const [k, v] of [['Tipo de indicador', r.tipo], ['Unidad', r.unidad], ['Meta 2026', val(r.meta_2026, r.unidad)], ['Cierre 2026 a la fecha', val(r.cierre_2026, r.unidad)], ['Cumplimiento 2026', pct(Number(r.cumplimiento_2026))], ['Cómo se calculó', r.calculo]]) {
      const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd);
    }
    el.replaceChildren(p, dl);
  }

  function drawSecretaria() {
    const r = resumen.find((x) => x.secretaria === sec);
    $('s-nombre').textContent = r ? r.secretaria : '—';
    $('s-prom').textContent = r ? pct(r.promedio) : '—';
    $('s-prog').textContent = r ? r.programados : '—';
    $('s-verde').textContent = r ? r.verde : '—';
    $('s-amarillo').textContent = r ? r.amarillo : '—';
    $('s-rojo').textContent = r ? r.rojo : '—';
    $('nota-inder').hidden = sec !== 'INDER';
    drawInd(); drawDetalle();
    const np = indRows().filter((x) => x.estado === 'NP');
    $('tabla-np').replaceChildren(...np.map((x) => { const tr = document.createElement('tr'); tr.append(td(x.codigo, 'pd-code'), td(x.indicador)); return tr; }));
    $('no-programados').hidden = !np.length;
  }

  function render() {
    sel.value = sec;
    $('general').hidden = !!sec;
    $('secretaria').hidden = !sec;
    $('btn-back').hidden = !sec;
    drawHeader();
    if (sec) drawSecretaria(); else drawGeneral();
  }

  function fromHash() { sec = bySlug.get(location.hash.slice(1)) || ''; elegido = null; estado = ''; render(); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
