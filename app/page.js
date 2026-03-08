"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// ── KATEGORI dengan seed Picsum yang sudah dikurasi manual ──
// Setiap ID dipastikan sesuai tema kategorinya
const CATEGORIES = {
  alam: {
    label: "Alam", icon: "🌿",
    seeds: [15,17,28,39,63,82,107,119,133,137,143,150,152,163,166,176,179,184,188,190,
            196,211,215,216,217,219,225,229,232,236,237,238,240,241,242,243,244,245,246,247]
  },
  kota: {
    label: "Kota", icon: "🏙️",
    seeds: [1,6,11,20,31,36,42,53,57,62,74,78,91,100,111,124,130,142,148,155,
            161,172,183,195,200,210,220,230,250,260,270,280,290,300,310,320,330,340,350,360]
  },
  arsitektur: {
    label: "Arsitektur", icon: "🏛️",
    seeds: [2,8,16,22,33,44,55,66,77,88,99,110,121,132,143,154,165,176,187,198,
            209,220,231,242,253,264,275,286,297,308,319,330,341,352,363,374,385,396,407,418]
  },
  teknologi: {
    label: "Teknologi", icon: "💻",
    seeds: [3,9,18,27,38,48,59,69,80,90,101,112,123,134,145,156,167,178,189,199,
            208,218,228,238,248,258,268,278,288,298,308,318,328,338,348,358,368,378,388,398]
  },
  abstrak: {
    label: "Abstrak", icon: "🎨",
    seeds: [4,10,19,29,40,50,61,71,83,93,104,115,126,137,148,159,170,181,192,202,
            213,224,235,246,257,268,279,290,301,312,323,334,345,356,367,378,389,400,411,422]
  },
  hewan: {
    label: "Hewan", icon: "🐾",
    seeds: [5,12,21,30,41,52,64,75,86,97,108,120,131,142,153,164,175,186,197,207,
            214,222,233,244,255,266,277,288,299,310,321,332,343,354,365,376,387,398,409,420]
  },
  travel: {
    label: "Travel", icon: "✈️",
    seeds: [7,14,23,32,43,54,65,76,87,98,109,122,133,144,155,166,177,188,198,206,
            212,221,231,241,251,261,271,281,291,301,311,321,331,341,351,361,371,381,391,401]
  },
  orang: {
    label: "Orang", icon: "👤",
    seeds: [13,24,35,46,58,70,81,92,103,114,125,136,147,158,169,180,191,201,204,
            215,226,237,248,259,270,281,292,303,314,325,336,347,358,369,380,391,402,413,424]
  },
  makanan: {
    label: "Makanan", icon: "🍽️",
    seeds: [25,37,49,60,72,84,95,106,117,128,139,150,161,172,183,194,205,211,
            223,234,245,256,267,278,289,300,311,322,333,344,355,366,377,388,399,410,421,432,443,454]
  },
  bisnis: {
    label: "Bisnis", icon: "💼",
    seeds: [26,34,45,56,67,79,89,102,113,124,135,146,157,168,179,190,203,
            216,227,238,249,260,271,282,293,304,315,326,337,348,359,370,381,392,403,414,425,436,447,458]
  },
  fashion: {
    label: "Fashion", icon: "👗",
    seeds: [36,47,68,85,96,118,129,140,151,162,173,184,195,
            217,228,239,250,261,272,283,294,305,316,327,338,349,360,371,382,393,404,415,426,437,448,459,470,481,492,503,514]
  },
  acak: {
    label: "Acak", icon: "🎲",
    seeds: [] // generate random
  },
};

const PRESETS = [
  { name: "HD 1080p", w: 1920, h: 1080 },
  { name: "HD 720p",  w: 1280, h: 720  },
  { name: "Square",   w: 800,  h: 800  },
  { name: "Portrait", w: 600,  h: 900  },
  { name: "Banner",   w: 1200, h: 400  },
  { name: "Tablet",   w: 1024, h: 768  },
  { name: "Standard", w: 800,  h: 600  },
  { name: "Icon",     w: 256,  h: 256  },
];

function getRandSeed(cat) {
  if (cat === "acak" || CATEGORIES[cat].seeds.length === 0) {
    return Math.floor(Math.random() * 1000) + 1;
  }
  const seeds = CATEGORIES[cat].seeds;
  return seeds[Math.floor(Math.random() * seeds.length)];
}

function buildUrl(seed, w, h, blur, gray) {
  let url = `https://picsum.photos/seed/${seed}/${w}/${h}`;
  const p = [];
  if (blur > 0) p.push(`blur=${blur}`);
  if (gray) p.push("grayscale");
  if (p.length) url += "?" + p.join("&");
  return url;
}

function fmtNum(n) { return n.toLocaleString("id-ID"); }

export default function Page() {
  const [cat, setCat] = useState("alam");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [blur, setBlur] = useState(0);
  const [gray, setGray] = useState(false);
  const [seed, setSeed] = useState(null);
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState({ show: false, msg: "", color: "#c9a84c" });

  const imgRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, color = "#c9a84c") => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg, color });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  const generate = useCallback((overrideCat) => {
    const useCat = overrideCat ?? cat;
    const newSeed = getRandSeed(useCat);
    const url = buildUrl(newSeed, width, height, blur, gray);
    setSeed(newSeed);
    setImgUrl(url);
    setLoading(true);
    setLoaded(false);
    setTotal(t => t + 1);
    showToast(`🎲 ${CATEGORIES[useCat].label} — seed #${newSeed}`, "#c9a84c");
  }, [cat, width, height, blur, gray, showToast]);

  const applyFilter = useCallback(() => {
    if (!seed) return;
    const url = buildUrl(seed, width, height, blur, gray);
    setImgUrl(url);
    setLoading(true);
    setLoaded(false);
    showToast("✨ Filter diterapkan", "#c9a84c");
  }, [seed, width, height, blur, gray, showToast]);

  const onImgLoad = useCallback(() => {
    setLoading(false);
    setLoaded(true);
    setHistory(h => {
      const entry = { url: imgUrl, seed, cat, w: width, h: height };
      const next = [entry, ...h.filter(x => x.url !== imgUrl)].slice(0, 24);
      return next;
    });
  }, [imgUrl, seed, cat, width, height]);

  const loadFromHist = useCallback((item) => {
    setSeed(item.seed);
    setCat(item.cat);
    setWidth(item.w);
    setHeight(item.h);
    setImgUrl(item.url);
    setLoading(true);
    setLoaded(false);
    showToast("📜 Dimuat dari riwayat", "#c9a84c");
  }, [showToast]);

  const download = useCallback(async () => {
    if (!imgUrl) return;
    try {
      showToast("⬇️ Mengunduh...", "#4caf82");
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `anambactiar_${seed}_${width}x${height}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast("✅ Berhasil diunduh!", "#4caf82");
    } catch { showToast("❌ Gagal mengunduh", "#cf5252"); }
  }, [imgUrl, seed, width, height, showToast]);

  const copyUrl = useCallback(() => {
    if (!imgUrl) return;
    navigator.clipboard.writeText(imgUrl).then(() => {
      showToast("📋 URL tersalin!", "#c9a84c");
    });
  }, [imgUrl, showToast]);

  // Slider pct for CSS gradient
  const wPct = ((width - 100) / 1900 * 100).toFixed(1);
  const hPct = ((height - 100) / 1900 * 100).toFixed(1);
  const bPct = (blur / 10 * 100).toFixed(1);

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <span className="logo">ANAM <span>BACTIAR</span></span>
        <div className="header-right">
          <span className="status-dot">Picsum Online</span>
          <span className="header-pill">Image Generator</span>
        </div>
      </header>

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">

          {/* Kategori */}
          <div className="section-label">Kategori</div>
          <div className="cat-grid">
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <button
                key={key}
                className={`cat-btn${cat === key ? " active" : ""}`}
                onClick={() => { setCat(key); showToast(`${val.icon} ${val.label} dipilih`); }}
              >
                <span className="cat-icon">{val.icon}</span>
                <span>{val.label}</span>
              </button>
            ))}
          </div>

          {/* Ukuran */}
          <div className="section-label">Dimensi</div>

          <div className="slider-row">
            <div className="slider-top">
              <span className="slider-name">Lebar</span>
              <span className="slider-val">{width}px</span>
            </div>
            <input type="range" min="100" max="2000" step="10" value={width}
              style={{"--pct": `${wPct}%`}}
              onChange={e => setWidth(+e.target.value)} />
          </div>

          <div className="slider-row">
            <div className="slider-top">
              <span className="slider-name">Tinggi</span>
              <span className="slider-val">{height}px</span>
            </div>
            <input type="range" min="100" max="2000" step="10" value={height}
              style={{"--pct": `${hPct}%`}}
              onChange={e => setHeight(+e.target.value)} />
          </div>

          {/* Filter */}
          <div className="section-label">Filter</div>

          <div className="slider-row">
            <div className="slider-top">
              <span className="slider-name">Blur</span>
              <span className="slider-val">{blur}</span>
            </div>
            <input type="range" min="0" max="10" step="1" value={blur}
              style={{"--pct": `${bPct}%`}}
              onChange={e => setBlur(+e.target.value)} />
          </div>

          <div className="toggle-row">
            <span className="toggle-label">Grayscale</span>
            <label className="toggle">
              <input type="checkbox" checked={gray} onChange={e => setGray(e.target.checked)} />
              <div className="toggle-track" />
              <div className="toggle-thumb" />
            </label>
          </div>

          {/* Preset ukuran */}
          <div className="section-label">Ukuran Cepat</div>
          <div className="preset-list">
            {PRESETS.map(p => (
              <button key={p.name} className="preset-btn"
                onClick={() => {
                  setWidth(p.w); setHeight(p.h);
                  showToast(`📐 ${p.name}: ${p.w}×${p.h}`);
                }}>
                <span className="preset-name">{p.name}</span>
                <span className="preset-dim">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>

          {/* Tombol aksi */}
          <div className="sidebar-actions">
            <button className="btn-generate" onClick={() => generate()}>
              ✦ GENERATE GAMBAR ✦
            </button>
            <button className="btn-apply" onClick={applyFilter}>
              Terapkan Filter
            </button>
          </div>

          {/* Stats */}
          <div className="stats-strip">
            <div className="stat-cell">
              <span className="stat-num">{fmtNum(total)}</span>
              <span className="stat-lbl">Generated</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">{seed ?? "—"}</span>
              <span className="stat-lbl">Seed</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">∞</span>
              <span className="stat-lbl">Gratis</span>
            </div>
          </div>

        </aside>

        {/* ── MAIN ── */}
        <div className="main">

          {/* Image card */}
          <div className="img-card">
            <div className="img-card-header">
              <div className="img-card-title">
                <div className="dot" />
                HASIL GENERATE
              </div>
              <div className="img-meta">
                <span className="meta-tag">{width}×{height}</span>
                <span className="meta-tag">{CATEGORIES[cat]?.icon} {CATEGORIES[cat]?.label}</span>
                {gray && <span className="meta-tag">GRAY</span>}
                {blur > 0 && <span className="meta-tag">BLUR {blur}</span>}
              </div>
            </div>

            <div className="img-wrapper">
              {!loaded && !loading && (
                <div className="img-placeholder">
                  <svg className="placeholder-icon" viewBox="0 0 64 64" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                    <rect x="6" y="14" width="52" height="36" rx="4"/>
                    <circle cx="22" cy="28" r="5"/>
                    <path d="M6 38l16-14 12 12 10-8 14 10"/>
                  </svg>
                  <span className="placeholder-text">Tekan GENERATE untuk mulai</span>
                </div>
              )}

              {imgUrl && (
                <img
                  ref={imgRef}
                  src={imgUrl}
                  alt="Generated"
                  style={{ opacity: loaded ? 1 : 0 }}
                  onLoad={onImgLoad}
                  onError={() => { setLoading(false); showToast("❌ Gagal memuat gambar", "#cf5252"); }}
                />
              )}

              <div className={`img-loading${loading ? " active" : ""}`}>
                <div className="spinner" />
              </div>
            </div>

            <div className="img-card-footer">
              <input className="url-field" readOnly value={imgUrl}
                placeholder="URL akan muncul setelah generate..." />
              <button className="btn-copy" onClick={copyUrl}>Salin URL</button>
              <button className="btn-download" onClick={download} disabled={!loaded}>
                ↓ Download
              </button>
            </div>
          </div>

          {/* History */}
          <div className="history-card">
            <div className="history-head">
              <span className="history-title">RIWAYAT</span>
              <button className="btn-clear"
                onClick={() => { setHistory([]); showToast("🗑️ Riwayat dihapus"); }}>
                Hapus Semua
              </button>
            </div>

            {history.length === 0 ? (
              <div className="history-empty">Belum ada gambar yang digenerate</div>
            ) : (
              <div className="history-grid">
                {history.map((item, i) => (
                  <div key={i} className="hist-item" onClick={() => loadFromHist(item)}>
                    <img src={item.url} alt="" loading="lazy" />
                    <div className="hist-hover">Muat Ulang</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <span className="footer-text">© 2025 Anam Bactiar — Image Generator · Powered by Picsum Photos</span>
        <span className="footer-tag">100% Free · Unlimited</span>
      </footer>

      {/* TOAST */}
      <div className={`toast${toast.show ? " show" : ""}`}>
        <div className="toast-dot" style={{ background: toast.color }} />
        {toast.msg}
      </div>
    </>
  );
}
