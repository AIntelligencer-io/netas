(function () {
  "use strict";
  document.documentElement.lang = "tr";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* Header */
  var header = document.getElementById("site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  var menuBtn = document.getElementById("menu-btn");
  var navLinks = document.getElementById("primary-nav");
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    if (open) header.classList.add("scrolled"); else onScroll();
  }
  menuBtn.addEventListener("click", function () { setMenu(!navLinks.classList.contains("open")); });
  navLinks.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && navLinks.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });

  /* Clocks */
  var clocks = document.querySelectorAll("#clocks dd");
  function tick() {
    var now = new Date();
    clocks.forEach(function (el) {
      try { el.textContent = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: el.dataset.tz }).format(now); }
      catch (err) { el.textContent = "--:--"; }
    });
  }
  tick(); setInterval(tick, 20000);

  /* Generic tabs */
  function tabGroup(tabs, onSelect) {
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      onSelect(tab);
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var k = e.key, d = 0;
        if (k === "ArrowRight" || k === "ArrowDown") d = 1;
        if (k === "ArrowLeft" || k === "ArrowUp") d = -1;
        if (!d) return;
        e.preventDefault();
        select(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
  }
  var trackerTabs = Array.prototype.slice.call(document.querySelectorAll(".t-tab"));
  tabGroup(trackerTabs, function (tab) {
    trackerTabs.forEach(function (t) { document.getElementById(t.getAttribute("aria-controls")).hidden = t !== tab; });
  });
  var feats = Array.prototype.slice.call(document.querySelectorAll(".feat"));
  var aboutNum = document.getElementById("about-num");
  tabGroup(feats, function (tab) {
    aboutNum.textContent = tab.dataset.num;
    feats.forEach(function (t) {
      var card = document.getElementById(t.getAttribute("aria-controls"));
      var on = t === tab;
      card.classList.toggle("active", on);
      card.classList.toggle("dim", !on);
    });
    repaintVisible();
  });

  /* Tracking (example data) */
  var SHIPMENTS = {
    "NTS-482190": { route: "Ambarlı → Rotterdam", sub: "Deniz · FCL · 1 × 40' HC", status: ["Yolda", "ok"], progress: 62, start: "17 Kas", end: "ETA 02 Ara", last: ["Akdeniz'de seyirde", "36°48′K 14°12′D"] },
    "NTS-771045": { route: "İstanbul (IST) → New York (JFK)", sub: "Hava · 3 palet · AWB 235-48219034", status: ["Teslim edildi", "ok"], progress: 100, start: "18 Kas", end: "19 Kas", last: ["Alıcıya teslim edildi", "Newark, NJ · imzalı POD"] },
    "NTS-305512": { route: "Bursa → Münih", sub: "Karayolu · FTL · 22 palet", status: ["Gümrükte", "warn"], progress: 45, start: "19 Kas", end: "ETA 24 Kas", last: ["Sınır kapısında bekliyor", "Kapıkule · tahmini 6 saat"] }
  };
  var tInput = document.getElementById("track-id");
  var tResult = document.getElementById("track-result");
  function renderTrack(raw) {
    var key = String(raw).trim().toUpperCase().replace(/\s+/g, "");
    if (/^\d{6}$/.test(key)) key = "NTS-" + key;
    var s = SHIPMENTS[key];
    if (!s) {
      tInput.setAttribute("aria-invalid", "true");
      tResult.innerHTML = '<div class="t-result"><p class="t-error"><b>Gönderi bulunamadı.</b> Takip numarası NTS- ve 6 rakamdan oluşur, örneğin NTS-482190.</p></div>';
      return;
    }
    tInput.removeAttribute("aria-invalid");
    tResult.innerHTML = '<div class="t-result">' +
      '<div class="t-res-head"><div><div class="t-route">' + esc(s.route) + '</div><div class="t-sub">' + esc(s.sub) + '</div></div><span class="chip chip-' + s.status[1] + '-d">' + esc(s.status[0]) + '</span></div>' +
      '<div class="t-bar" role="progressbar" aria-label="Yolculuk ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.progress + '"><span style="width:' + s.progress + '%"></span></div>' +
      '<div class="t-meta"><span>' + esc(s.start) + '</span><span>%' + s.progress + '</span><span>' + esc(s.end) + '</span></div>' +
      '<p class="t-last">Son hareket: <b>' + esc(s.last[0]) + '</b> · ' + esc(s.last[1]) + '</p></div>';
  }
  document.getElementById("track-form").addEventListener("submit", function (e) { e.preventDefault(); renderTrack(tInput.value); });
  document.querySelectorAll(".t-sample").forEach(function (b) { b.addEventListener("click", function () { tInput.value = b.dataset.id; renderTrack(b.dataset.id); }); });
  renderTrack(tInput.value);

  /* Logo marquee duplicate */
  var logoList = document.getElementById("logo-list");
  var dup = logoList.cloneNode(true);
  dup.removeAttribute("id"); dup.setAttribute("aria-hidden", "true");
  logoList.parentNode.appendChild(dup);

  /* Sliders */
  document.querySelectorAll(".nav-arrow").forEach(function (btn) {
    var slider = document.getElementById(btn.dataset.slider);
    btn.addEventListener("click", function () {
      var card = slider.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 16 : 300;
      slider.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
  function updateArrows() {
    document.querySelectorAll(".nav-arrow").forEach(function (btn) {
      var s = document.getElementById(btn.dataset.slider);
      var max = s.scrollWidth - s.clientWidth - 2;
      btn.disabled = Number(btn.dataset.dir) < 0 ? s.scrollLeft <= 2 : s.scrollLeft >= max;
    });
  }
  document.querySelectorAll(".slider").forEach(function (s) { s.addEventListener("scroll", updateArrows, { passive: true }); });
  window.addEventListener("resize", updateArrows);
  updateArrows();

  /* Copy */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.dataset.copy);
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(el);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        btn.textContent = "Seçildi";
      }
      try {
        navigator.clipboard.writeText(el.textContent).then(function () {
          btn.textContent = "Kopyalandı";
          setTimeout(function () { btn.textContent = "Kopyala"; }, 1800);
        }, fallback);
      } catch (err) { fallback(); }
    });
  });

  /* Quote form */
  var qForm = document.getElementById("quote-form");
  var qStatus = document.getElementById("q-status");
  var rules = [
    ["q-name", function (v) { return v.trim().length >= 2 ? "" : "Adınızı ve soyadınızı yazın."; }],
    ["q-email", function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Geçerli bir e-posta yazın, örneğin ad@firma.com."; }],
    ["q-from", function (v) { return v.trim() ? "" : "Yükün çıkacağı şehri veya limanı yazın."; }],
    ["q-to", function (v) { return v.trim() ? "" : "Yükün gideceği şehri veya limanı yazın."; }]
  ];
  function check(r) {
    var input = document.getElementById(r[0]);
    var msg = r[1](input.value);
    document.getElementById(r[0] + "-err").textContent = msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !msg;
  }
  rules.forEach(function (r) { document.getElementById(r[0]).addEventListener("blur", function () { if (this.value) check(r); }); });
  qForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    rules.forEach(function (r) { if (!check(r) && !bad) bad = r[0]; });
    if (bad) { qStatus.hidden = true; document.getElementById(bad).focus(); return; }
    var mode = qForm.querySelector('input[name="mode"]:checked').value;
    qStatus.innerHTML = "<b>Talebiniz hazır: " + esc(document.getElementById("q-from").value) + " → " + esc(document.getElementById("q-to").value) + " (" + esc(mode) + ")</b>Bu bir önizleme sürümü. Form henüz bir sisteme bağlı olmadığı için bilgileriniz gönderilmedi.";
    qStatus.hidden = false;
  });
  document.getElementById("news-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = document.getElementById("f-email").value.trim();
    document.getElementById("news-note").textContent = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
      ? "Önizleme sürümü: bülten kaydı henüz bir sisteme bağlı değil, adresiniz kaydedilmedi."
      : "Geçerli bir e-posta yazın, örneğin ad@firma.com.";
  });

  /* ---------- Land data (5° bands) ---------- */
  var LAND = {
    80: [[-70, -20], [95, 110]], 75: [[-125, -75], [-70, -20], [55, 70], [95, 140]],
    70: [[-165, -60], [-55, -22], [15, 180]], 65: [[-168, -62], [-52, -38], [-24, -13], [8, 180]],
    60: [[-165, -95], [-78, -64], [-48, -42], [5, 165]], 55: [[-132, -92], [-80, -58], [-8, 0], [8, 140], [155, 162]],
    50: [[-128, -55], [-5, 142]], 45: [[-124, -65], [-2, 30], [40, 135], [140, 145]],
    40: [[-124, -74], [-9, 3], [12, 18], [20, 26], [27, 45], [54, 122], [125, 129], [139, 142]],
    35: [[-120, -77], [-6, 11], [33, 120], [132, 140]], 30: [[-115, -81], [-10, 32], [34, 48], [50, 122]],
    25: [[-110, -97], [-82, -80], [-15, 35], [37, 56], [57, 90], [95, 120]],
    20: [[-105, -87], [-78, -68], [-17, 38], [42, 57], [72, 87], [93, 110]],
    15: [[-92, -84], [-17, 51], [74, 80], [97, 109], [120, 124]], 10: [[-85, -61], [-15, 51], [76, 80], [98, 106], [122, 126]],
    5: [[-78, -50], [-8, 48], [96, 104], [109, 119]], 0: [[-80, -48], [9, 42], [98, 106], [109, 118], [120, 125], [131, 135]],
    "-5": [[-81, -35], [12, 40], [105, 115], [135, 150]], "-10": [[-78, -36], [13, 40], [125, 142]],
    "-15": [[-75, -39], [12, 40], [44, 50], [123, 145]], "-20": [[-70, -40], [13, 35], [44, 48], [115, 149]],
    "-25": [[-70, -48], [15, 33], [113, 153]], "-30": [[-71, -51], [17, 31], [115, 153]],
    "-35": [[-72, -57], [18, 24], [117, 124], [135, 150], [173, 178]], "-40": [[-73, -62], [145, 148], [172, 177]],
    "-45": [[-75, -66], [167, 172]], "-50": [[-75, -68]], "-55": [[-72, -66]]
  };
  function isLand(lon, lat) {
    var band = LAND[String(Math.round(lat / 5) * 5)];
    if (!band) return false;
    for (var i = 0; i < band.length; i++) if (lon >= band[i][0] && lon <= band[i][1]) return true;
    return false;
  }
  var HUBS = {
    ist: [29, 41], mer: [34.6, 36.8], rtm: [4.5, 51.9], ham: [10, 53.5], nyc: [-74, 40.7], dxb: [55.3, 25.2],
    sha: [121.5, 31.2], sin: [103.8, 1.3], los: [3.4, 6.5], sao: [-46.6, -23.5], ala: [76.9, 43.2], xian: [108.9, 34.3]
  };
  var ROUTES = [["ist", "rtm"], ["ist", "ham"], ["ist", "nyc"], ["ist", "dxb"], ["ist", "ala"], ["ala", "xian"], ["xian", "sha"], ["mer", "sin"], ["sin", "sha"], ["mer", "los"], ["ist", "sao"], ["dxb", "sin"]];

  function setupCanvas(cv) {
    var r = cv.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, r.width), h = Math.max(1, r.height);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  /* ---------- Hero globe ---------- */
  var globe = document.getElementById("globe");
  var G = null, landPts = [], gRaf = 0, gVisible = true;
  for (var la = 78; la >= -56; la -= 2.5) {
    var stepLon = 2.5 / Math.max(0.35, Math.cos(la * Math.PI / 180));
    for (var lo = -180; lo < 180; lo += stepLon) if (isLand(lo, la)) landPts.push([lo, la]);
  }
  var D2R = Math.PI / 180;
  function gProj(lon, lat, lon0, lat0, R, cx, cy, h) {
    var l = lon * D2R, p = lat * D2R, l0 = lon0 * D2R, p0 = lat0 * D2R;
    var cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
    var x = Math.cos(p) * Math.sin(l - l0);
    var y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0);
    h = h || 1;
    return [cx + R * h * x, cy - R * h * y, cosc];
  }
  function toVec(ll) { var l = ll[0] * D2R, p = ll[1] * D2R; return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]; }
  function slerpLL(a, b, t) {
    var A = toVec(a), B = toVec(b);
    var dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    var om = Math.acos(dot);
    if (om < 1e-6) return [a[0], a[1], 0];
    var s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
    var v = [A[0] * s1 + B[0] * s2, A[1] * s1 + B[1] * s2, A[2] * s1 + B[2] * s2];
    return [Math.atan2(v[1], v[0]) / D2R, Math.asin(v[2]) / D2R, om];
  }
  function sizeGlobe() { G = setupCanvas(globe); }
  function drawGlobe(time) {
    if (!G) return;
    var ctx = G.ctx, W = G.w, H = G.h, t = (time || 0) / 1000;
    var mobile = W < 768;
    var R = mobile ? Math.min(W * 0.78, H * 0.5) : Math.min(W * 0.34, H * 0.62);
    var cx = mobile ? W * 0.55 : W * 0.7, cy = mobile ? H * 0.72 : H * 0.52;
    var lon0 = 28 + (reduceMotion ? 0 : Math.sin(t * 0.07) * 42), lat0 = 24;
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 1.05);
    g.addColorStop(0, "#1d1f22"); g.addColorStop(1, "#0b0b0c");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    var rim = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.25);
    rim.addColorStop(0, "rgba(234,88,12,0.18)"); rim.addColorStop(1, "rgba(234,88,12,0)");
    ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
    var dr = Math.max(0.9, R / 260);
    for (var i = 0; i < landPts.length; i++) {
      var p = gProj(landPts[i][0], landPts[i][1], lon0, lat0, R, cx, cy);
      if (p[2] <= 0) continue;
      ctx.fillStyle = "rgba(255,255,255," + (0.12 + p[2] * 0.5).toFixed(3) + ")";
      ctx.fillRect(p[0] - dr, p[1] - dr, dr * 2, dr * 2);
    }
    ROUTES.forEach(function (rt, k) {
      var a = HUBS[rt[0]], b = HUBS[rt[1]];
      var om = slerpLL(a, b, 0.5)[2];
      var lift = 0.06 + om * 0.12;
      ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(243,118,47,0.75)";
      ctx.beginPath();
      var started = false;
      for (var s = 0; s <= 40; s++) {
        var tt = s / 40, ll = slerpLL(a, b, tt);
        var q = gProj(ll[0], ll[1], lon0, lat0, R, cx, cy, 1 + lift * Math.sin(Math.PI * tt));
        if (q[2] > -0.08) { if (!started) { ctx.moveTo(q[0], q[1]); started = true; } else ctx.lineTo(q[0], q[1]); }
        else started = false;
      }
      ctx.stroke();
      var pt = reduceMotion ? 0.6 : ((t * 0.14 + k * 0.19) % 1);
      var pl = slerpLL(a, b, pt);
      var pp = gProj(pl[0], pl[1], lon0, lat0, R, cx, cy, 1 + lift * Math.sin(Math.PI * pt));
      if (pp[2] > -0.08) {
        ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(pp[0], pp[1], 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(243,118,47,0.35)"; ctx.beginPath(); ctx.arc(pp[0], pp[1], 6, 0, Math.PI * 2); ctx.fill();
      }
    });
    Object.keys(HUBS).forEach(function (key) {
      var h = gProj(HUBS[key][0], HUBS[key][1], lon0, lat0, R, cx, cy);
      if (h[2] <= 0) return;
      var main = key === "ist";
      ctx.fillStyle = "#EA580C"; ctx.beginPath(); ctx.arc(h[0], h[1], main ? 5 : 3.2, 0, Math.PI * 2); ctx.fill();
      if (main && !reduceMotion) {
        var pr = (t % 2) / 2;
        ctx.strokeStyle = "rgba(234,88,12," + (1 - pr).toFixed(2) + ")"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(h[0], h[1], 5 + pr * 18, 0, Math.PI * 2); ctx.stroke();
      }
    });
  }
  function globeLoop(time) { drawGlobe(time); if (!reduceMotion && gVisible) gRaf = requestAnimationFrame(globeLoop); }

  /* ---------- Flat network map ---------- */
  var mapCv = document.getElementById("map");
  var destLayer = document.getElementById("dest-layer");
  var M = null, mapBase = null, mRaf = 0, mVisible = false;
  var DESTS = [
    { hub: "nyc", label: "Varış", title: "NYC · New York", meta: "ETA 9 saat · Planlanandan erken", cls: "ok" },
    { hub: "rtm", label: "Varış", title: "RTM · Rotterdam", meta: "ETA 14 gün · Zamanında", cls: "ok" },
    { hub: "ist", label: "Çıkış", title: "IST · İstanbul", meta: "Kalkış 04:20 TSİ", cls: "", below: true },
    { hub: "dxb", label: "Varış", title: "DXB · Dubai", meta: "ETA 6 gün · Zamanında", cls: "ok", below: true, opt: true },
    { hub: "sha", label: "Varış", title: "SHA · Şanghay", meta: "ETA 18 gün · Hafif gecikme", cls: "warn" },
    { hub: "sao", label: "Varış", title: "SAO · São Paulo", meta: "ETA 24 gün · Zamanında", cls: "ok", opt: true }
  ];
  function mProj(p) { return [(p[0] + 180) / 360 * M.w, (80 - p[1]) / 140 * M.h]; }
  function mCtrl(a, z) { var d = Math.hypot(z[0] - a[0], z[1] - a[1]); return [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2 - d * 0.3]; }
  function mBez(a, c, z, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * z[0], u * u * a[1] + 2 * u * t * c[1] + t * t * z[1]]; }
  destLayer.innerHTML = DESTS.map(function (d) {
    return '<div class="dest' + (d.below ? " below" : "") + (d.opt ? " opt" : "") + '" data-hub="' + d.hub + '"><span class="dest-label">' + d.label + '</span><span class="dest-title">' + esc(d.title) + '</span><span class="dest-meta"><span class="' + d.cls + '">' + esc(d.meta) + '</span></span></div>';
  }).join("");
  function placeDests() {
    destLayer.querySelectorAll(".dest").forEach(function (el) {
      var p = HUBS[el.dataset.hub];
      el.style.left = ((p[0] + 180) / 360 * 100).toFixed(2) + "%";
      el.style.top = ((80 - p[1]) / 140 * 100).toFixed(2) + "%";
    });
  }
  function sizeMap() {
    M = setupCanvas(mapCv);
    mapBase = document.createElement("canvas");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    mapBase.width = Math.round(M.w * dpr); mapBase.height = Math.round(M.h * dpr);
    var b = mapBase.getContext("2d"); b.setTransform(dpr, 0, 0, dpr, 0, 0);
    var step = M.w < 600 ? 4 : 2.2, r = Math.max(0.8, (M.w / 360) * step * 0.3);
    b.fillStyle = "rgba(33,37,41,0.32)";
    for (var lat = 80; lat >= -57.5; lat -= step) for (var lon = -180; lon <= 180; lon += step) {
      if (!isLand(lon, lat)) continue;
      var p = mProj([lon, lat]);
      b.beginPath(); b.arc(p[0], p[1], r, 0, Math.PI * 2); b.fill();
    }
    b.strokeStyle = "rgba(234,88,12,0.6)"; b.lineWidth = Math.max(1, M.w / 900); b.setLineDash([4, 4]);
    ROUTES.forEach(function (rt) { var a = mProj(HUBS[rt[0]]), z = mProj(HUBS[rt[1]]), c = mCtrl(a, z); b.beginPath(); b.moveTo(a[0], a[1]); b.quadraticCurveTo(c[0], c[1], z[0], z[1]); b.stroke(); });
    b.setLineDash([]);
    Object.keys(HUBS).forEach(function (k) {
      var p = mProj(HUBS[k]);
      b.fillStyle = "#EA580C"; b.beginPath(); b.arc(p[0], p[1], Math.max(2.5, M.w / 320), 0, Math.PI * 2); b.fill();
      b.strokeStyle = "rgba(234,88,12,0.3)"; b.lineWidth = 1.5; b.beginPath(); b.arc(p[0], p[1], Math.max(6, M.w / 130), 0, Math.PI * 2); b.stroke();
    });
    placeDests();
    drawMap(performance.now());
  }
  function drawMap(time) {
    if (!M) return;
    var ctx = M.ctx; ctx.clearRect(0, 0, M.w, M.h);
    ctx.drawImage(mapBase, 0, 0, M.w, M.h);
    var t = (time || 0) / 1000;
    ROUTES.forEach(function (rt, i) {
      var a = mProj(HUBS[rt[0]]), z = mProj(HUBS[rt[1]]), c = mCtrl(a, z);
      var p = mBez(a, c, z, reduceMotion ? 0.55 : ((t * 0.12 + i * 0.17) % 1));
      ctx.fillStyle = "#EA580C"; ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(2.2, M.w / 400), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(234,88,12,0.22)"; ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(5, M.w / 180), 0, Math.PI * 2); ctx.fill();
    });
  }
  function mapLoop(time) { drawMap(time); if (!reduceMotion && mVisible) mRaf = requestAnimationFrame(mapLoop); }

  /* ---------- Procedural container-yard images ---------- */
  var SKIES = {
    dawn: { stops: ["#2B2E36", "#7A4A36", "#E89A62"], ground: "#26282B", light: 0.95, sun: "rgba(255,196,140,0.9)", haze: "#D88A5A" },
    day: { stops: ["#8FA3B4", "#B9C5CE", "#E3E7E8"], ground: "#55595D", light: 1, sun: null, haze: "#C9D1D6" },
    dusk: { stops: ["#101319", "#3A2830", "#C2582A"], ground: "#17181A", light: 0.72, sun: "rgba(255,140,80,0.85)", haze: "#7A3A26" },
    night: { stops: ["#040507", "#0B0F15", "#1C232C"], ground: "#0C0D0F", light: 0.42, sun: null, haze: "#1C232C", lights: true }
  };
  var CCOL = ["#B9490E", "#EA580C", "#1F2A44", "#2D5F6E", "#7C8288", "#D6D5CF", "#6B1D1D", "#3F5D45", "#243B55", "#9A3412", "#C9A227", "#5B6770"];
  function rng(seed) { var s = (seed * 9301 + 49297) % 233280 || 1; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(c1, c2, t, f) { var a = hexRgb(c1), b = hexRgb(c2); f = f || 1; return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(Math.min(255, (a[i] * (1 - t) + b[i] * t) * f)); }).join(",") + ")"; }
  function paintYard(cv) {
    var S = setupCanvas(cv), ctx = S.ctx, W = S.w, H = S.h;
    if (W < 4 || H < 4) return;
    var sky = SKIES[cv.dataset.sky] || SKIES.day;
    var rand = rng(Number(cv.dataset.seed) || 7);
    var hz = (Number(cv.dataset.horizon) || 0.5) * H;
    var cranes = cv.dataset.cranes != null ? Number(cv.dataset.cranes) : 1;
    var unit = Math.max(10, Math.min(H * 0.09, W * 0.06));
    var sg = ctx.createLinearGradient(0, 0, 0, hz);
    sg.addColorStop(0, sky.stops[0]); sg.addColorStop(0.6, sky.stops[1]); sg.addColorStop(1, sky.stops[2]);
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, hz + 2);
    if (sky.sun) {
      var sx = W * (0.25 + rand() * 0.5), sy = hz * 0.86, sr = Math.max(W, H) * 0.35;
      var sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      sun.addColorStop(0, sky.sun); sun.addColorStop(0.08, sky.sun.replace(/[\d.]+\)$/, "0.5)")); sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, hz + 2);
    }
    if (sky.lights) {
      for (var st = 0; st < 60; st++) { ctx.fillStyle = "rgba(255,255,255," + (0.1 + rand() * 0.4).toFixed(2) + ")"; ctx.fillRect(rand() * W, rand() * hz * 0.7, 1, 1); }
    }
    var craneCol = mix("#1A1D22", sky.stops[0], 0.2, sky.light < 0.6 ? 0.7 : 1);
    for (var c = 0; c < cranes; c++) {
      var cxp = W * (0.15 + (c + rand() * 0.6) / Math.max(1, cranes) * 0.75);
      var top = hz - H * (0.28 + rand() * 0.1), legW = unit * 2.2, lw = Math.max(2, unit * 0.16);
      ctx.strokeStyle = craneCol; ctx.lineWidth = lw; ctx.lineCap = "square";
      ctx.beginPath();
      ctx.moveTo(cxp, hz + unit); ctx.lineTo(cxp, top);
      ctx.moveTo(cxp + legW, hz + unit); ctx.lineTo(cxp + legW, top);
      ctx.moveTo(cxp, top + (hz - top) * 0.35); ctx.lineTo(cxp + legW, top + (hz - top) * 0.35);
      ctx.moveTo(cxp, top + (hz - top) * 0.35); ctx.lineTo(cxp + legW, top);
      ctx.moveTo(cxp - unit * 3.5, top); ctx.lineTo(cxp + legW + unit * 6, top);
      ctx.moveTo(cxp + legW * 0.5, top); ctx.lineTo(cxp + legW * 0.5, top - unit * 1.6);
      ctx.moveTo(cxp + legW * 0.5, top - unit * 1.6); ctx.lineTo(cxp + legW + unit * 5, top);
      ctx.moveTo(cxp + legW * 0.5, top - unit * 1.6); ctx.lineTo(cxp - unit * 3, top);
      ctx.stroke();
      if (sky.lights || sky.light < 0.8) {
        ctx.fillStyle = "rgba(255,200,120,0.9)";
        ctx.fillRect(cxp + legW * 0.5 - 1.5, top - unit * 1.6 - 1.5, 3, 3);
        ctx.fillRect(cxp + legW + unit * 6 - 1.5, top - 1.5, 3, 3);
      }
    }
    var gg = ctx.createLinearGradient(0, hz, 0, H);
    gg.addColorStop(0, mix(sky.ground, sky.haze, 0.3)); gg.addColorStop(1, sky.ground);
    ctx.fillStyle = gg; ctx.fillRect(0, hz, W, H - hz);
    var rows = [{ s: 0.5, y: 0.14, max: 5, haze: 0.45 }, { s: 0.75, y: 0.5, max: 4, haze: 0.22 }, { s: 1.05, y: 0.98, max: 3, haze: 0 }];
    rows.forEach(function (row) {
      var ch = unit * row.s, base = hz + (H - hz) * row.y, x = -rand() * ch * 3;
      while (x < W) {
        var len = rand() < 0.55 ? 4.6 : 2.3, cw = ch * len;
        var n = 1 + Math.floor(rand() * row.max);
        if (rand() < 0.12) { x += cw * 0.6; continue; }
        for (var k = 0; k < n; k++) {
          var y = base - (k + 1) * ch;
          var col = CCOL[Math.floor(rand() * CCOL.length)];
          var lightF = sky.light * (0.85 + k * 0.05);
          ctx.fillStyle = mix(col, sky.haze, row.haze, lightF);
          ctx.fillRect(x, y, cw - 1, ch - 1);
          var rib = Math.max(2, ch * 0.13);
          ctx.fillStyle = "rgba(0,0,0,0.16)";
          for (var rx = x + rib * 0.5; rx < x + cw - 2; rx += rib) ctx.fillRect(rx, y + ch * 0.08, Math.max(0.6, rib * 0.35), ch * 0.84);
          ctx.fillStyle = "rgba(255,255,255," + (0.12 * sky.light).toFixed(3) + ")";
          ctx.fillRect(x, y, cw - 1, Math.max(1, ch * 0.07));
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.fillRect(x, y + ch * 0.9, cw - 1, ch * 0.1 - 1);
          if (rand() < 0.35) { ctx.fillStyle = "rgba(255,255,255," + (0.35 * sky.light).toFixed(2) + ")"; ctx.fillRect(x + cw * 0.08, y + ch * 0.2, ch * 0.5, ch * 0.12); }
        }
        x += cw + ch * (0.08 + rand() * 0.25);
      }
    });
    var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    cv.dataset.painted = W + "x" + H;
  }
  var yards = Array.prototype.slice.call(document.querySelectorAll("canvas.yard"));
  function repaintVisible() {
    yards.forEach(function (cv) {
      var r = cv.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (cv.dataset.painted === Math.round(r.width) + "x" + Math.round(r.height) || cv.dataset.painted === r.width + "x" + r.height) return;
      paintYard(cv);
    });
  }

  /* ---------- Boot & lifecycle ---------- */
  function resizeAll() {
    sizeGlobe(); drawGlobe(performance.now());
    sizeMap();
    yards.forEach(function (cv) { cv.dataset.painted = ""; });
    repaintVisible();
    updateArrows();
  }
  resizeAll();
  if (!reduceMotion) gRaf = requestAnimationFrame(globeLoop);
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resizeAll, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { yards.forEach(function (cv) { cv.dataset.painted = ""; }); repaintVisible(); placeDests(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      gVisible = en[0].isIntersecting;
      cancelAnimationFrame(gRaf);
      if (gVisible && !reduceMotion) gRaf = requestAnimationFrame(globeLoop);
    }).observe(globe);
    new IntersectionObserver(function (en) {
      mVisible = en[0].isIntersecting;
      cancelAnimationFrame(mRaf);
      if (mVisible && !reduceMotion) mRaf = requestAnimationFrame(mapLoop);
    }).observe(mapCv);
  }
})();
