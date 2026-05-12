"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = {
  tanaman: {
    label: "Tanaman",
    short: "Plant",
    query: "plants,botanical,leaves,flower,garden",
    tone: "#5fc98a",
  },
  alam: {
    label: "Alam",
    short: "Nature",
    query: "nature,mountain,forest,river,landscape",
    tone: "#72b7f2",
  },
  pantai: {
    label: "Pantai",
    short: "Beach",
    query: "beach,ocean,coast,tropical,sea",
    tone: "#66d9d9",
  },
  kota: {
    label: "Kota",
    short: "Urban",
    query: "city,street,skyline,urban,night",
    tone: "#c9a84c",
  },
  arsitektur: {
    label: "Arsitektur",
    short: "Architecture",
    query: "architecture,building,interior,modern,facade",
    tone: "#d7b98a",
  },
  teknologi: {
    label: "Teknologi",
    short: "Tech",
    query: "technology,computer,circuit,server,workspace",
    tone: "#8aa7ff",
  },
  makanan: {
    label: "Makanan",
    short: "Food",
    query: "food,restaurant,dessert,coffee,cooking",
    tone: "#f1a24f",
  },
  hewan: {
    label: "Hewan",
    short: "Animal",
    query: "animal,wildlife,bird,cat,dog",
    tone: "#d7a05f",
  },
  orang: {
    label: "Orang",
    short: "People",
    query: "people,portrait,person,profile,human",
    tone: "#d48abf",
  },
  travel: {
    label: "Travel",
    short: "Travel",
    query: "travel,landmark,road,adventure,tourism",
    tone: "#f0d080",
  },
  bisnis: {
    label: "Bisnis",
    short: "Business",
    query: "business,office,meeting,laptop,team",
    tone: "#b7c1d6",
  },
  abstrak: {
    label: "Abstrak",
    short: "Abstract",
    query: "abstract,texture,pattern,color,art",
    tone: "#b98cff",
  },
  acak: {
    label: "Acak",
    short: "Random",
    query: "",
    tone: "#c9a84c",
  },
};

const SOURCES = {
  smart: {
    label: "Smart Match",
    desc: "Kategori spesifik pakai image semantic. Acak/abstrak boleh editorial.",
  },
  semantic: {
    label: "Flickr Semantic",
    desc: "No API key. Query cocok kategori, bagus untuk tanaman/hewan/makanan.",
  },
  picsum: {
    label: "Picsum Editorial",
    desc: "No API key. Aesthetic random, cocok wallpaper/acak.",
  },
  poster: {
    label: "Poster Placeholder",
    desc: "No API key. Fallback stabil berbasis teks dan warna.",
  },
};

const PRESETS = [
  { name: "Desktop", w: 1920, h: 1080 },
  { name: "Laptop", w: 1440, h: 900 },
  { name: "Square", w: 1080, h: 1080 },
  { name: "Story", w: 1080, h: 1920 },
  { name: "Banner", w: 1600, h: 600 },
  { name: "Card", w: 1200, h: 800 },
];

const QUERY_MAP = {
  tanaman: "plants,botanical,leaves,flower,garden",
  tumbuhan: "plants,botanical,leaves,flower,garden",
  bunga: "flower,bloom,botanical,garden",
  daun: "leaves,green,botanical,plant",
  pohon: "tree,forest,wood,nature",
  mobil: "car,automotive,vehicle,road",
  motor: "motorcycle,bike,road,vehicle",
  rumah: "house,home,interior,architecture",
  pantai: "beach,ocean,coast,tropical",
  gunung: "mountain,landscape,nature,peak",
  kucing: "cat,kitten,pet,animal",
  anjing: "dog,puppy,pet,animal",
  makanan: "food,restaurant,cooking,dessert",
  kopi: "coffee,cup,cafe,drink",
  kantor: "office,workspace,business,laptop",
  laptop: "laptop,computer,desk,technology",
  kota: "city,urban,street,skyline",
};

function randomSeed() {
  return Math.floor(Math.random() * 999999) + 1;
}

function clampSize(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(160, Math.min(2400, Math.round(n)));
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function encodeTags(query) {
  return query
    .split(",")
    .map((item) => encodeURIComponent(item.trim().replace(/\s+/g, "-")))
    .filter(Boolean)
    .join(",");
}

function resolveQuery(category, customQuery) {
  const raw = customQuery.trim().toLowerCase();
  if (raw) return QUERY_MAP[raw] || raw.split(/[,\s]+/).filter(Boolean).join(",");
  if (category === "acak") {
    const keys = Object.keys(CATEGORIES).filter((key) => key !== "acak" && key !== "abstrak");
    return CATEGORIES[keys[Math.floor(Math.random() * keys.length)]].query;
  }
  return CATEGORIES[category]?.query || CATEGORIES.alam.query;
}

function resolveSource(sourceMode, category, seed) {
  if (sourceMode !== "smart") return sourceMode;
  if (category === "acak" || category === "abstrak") {
    return seed % 3 === 0 ? "picsum" : "semantic";
  }
  return "semantic";
}

function buildUrl({ sourceMode, category, customQuery, width, height, seed, gray, blur }) {
  const source = resolveSource(sourceMode, category, seed);
  const w = clampSize(width, 1280);
  const h = clampSize(height, 720);
  const query = resolveQuery(category, customQuery);

  if (source === "semantic") {
    return `https://loremflickr.com/${w}/${h}/${encodeTags(query)}?lock=${seed}`;
  }

  if (source === "picsum") {
    const params = [];
    if (gray) params.push("grayscale");
    if (blur > 0) params.push(`blur=${blur}`);
    return `https://picsum.photos/seed/${seed}/${w}/${h}${params.length ? `?${params.join("&")}` : ""}`;
  }

  const label = encodeURIComponent((customQuery.trim() || CATEGORIES[category]?.label || "Image").toUpperCase());
  const tone = (CATEGORIES[category]?.tone || "#c9a84c").replace("#", "");
  return `https://placehold.co/${w}x${h}/080808/${tone}/png?text=${label}`;
}

function fmt(n) {
  return Number(n).toLocaleString("id-ID");
}

export default function Page() {
  const [category, setCategory] = useState("tanaman");
  const [sourceMode, setSourceMode] = useState("smart");
  const [customQuery, setCustomQuery] = useState("");
  const [width, setWidth] = useState(1440);
  const [height, setHeight] = useState(900);
  const [gray, setGray] = useState(false);
  const [blur, setBlur] = useState(0);
  const [active, setActive] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState("");
  const toastRef = useRef(null);

  const categoryInfo = CATEGORIES[category] || CATEGORIES.tanaman;
  const resolvedQuery = useMemo(
    () => resolveQuery(category, customQuery),
    [category, customQuery],
  );

  const showToast = useCallback((message) => {
    clearTimeout(toastRef.current);
    setToast(message);
    toastRef.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const makeItem = useCallback((seed) => {
    const url = buildUrl({
      sourceMode,
      category,
      customQuery,
      width,
      height,
      seed,
      gray,
      blur,
    });
    return {
      id: `${seed}-${category}-${sourceMode}-${width}x${height}`,
      url,
      seed,
      category,
      source: resolveSource(sourceMode, category, seed),
      query: resolveQuery(category, customQuery),
      width,
      height,
    };
  }, [blur, category, customQuery, gray, height, sourceMode, width]);

  const generate = useCallback((count = 8) => {
    const next = Array.from({ length: count }, () => makeItem(randomSeed()));
    setItems(next);
    setActive(next[0]);
    setLoading(true);
    setTotal((value) => value + count);
    showToast(`${CATEGORIES[category]?.label || "Gambar"}: ${count} rekomendasi baru`);
  }, [category, makeItem, showToast]);

  const selectItem = useCallback((item) => {
    setActive(item);
    setLoading(true);
  }, []);

  const onMainLoad = useCallback(() => {
    setLoading(false);
    if (!active) return;
    setHistory((prev) => {
      const next = [active, ...prev.filter((item) => item.url !== active.url)].slice(0, 30);
      try { localStorage.setItem("angen-history", JSON.stringify(next)); } catch {}
      return next;
    });
  }, [active]);

  const copyUrl = useCallback(async () => {
    if (!active?.url) return;
    try {
      await navigator.clipboard.writeText(active.url);
      showToast("URL tersalin");
    } catch {
      showToast("Clipboard gagal");
    }
  }, [active, showToast]);

  const download = useCallback(async () => {
    if (!active?.url) return;
    try {
      const res = await fetch(active.url);
      if (!res.ok) throw new Error("download");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `angen-${slugify(categoryInfo.label)}-${active.seed}-${active.width}x${active.height}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("Download dimulai");
    } catch {
      window.open(active.url, "_blank", "noopener,noreferrer");
      showToast("Dibuka di tab baru");
    }
  }, [active, categoryInfo.label, showToast]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("angen-history") || "[]");
      if (Array.isArray(stored)) setHistory(stored.slice(0, 30));
    } catch {}
  }, []);

  useEffect(() => {
    generate(8);
  }, []); // initial studio render

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">AG</span>
          <div>
            <strong>ANGEN</strong>
            <span>Free Image Studio</span>
          </div>
        </div>
        <div className="topbar-meta">
          <span>No API key</span>
          <span>Smart semantic source</span>
          <span>{fmt(total)} generated</span>
        </div>
      </header>

      <main className="studio">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Semantic random image generator</span>
            <h1>Gambar acak, tapi tetap sesuai maumu.</h1>
            <p>
              Pilih kategori atau ketik kata sendiri. Untuk tanaman, hasilnya
              tanaman. Untuk makanan, hasilnya makanan. Source gratis dirotasi
              tanpa API key.
            </p>
          </div>
          <div className="source-card">
            <span>Active Source</span>
            <strong>{SOURCES[sourceMode].label}</strong>
            <p>{SOURCES[sourceMode].desc}</p>
          </div>
        </section>

        <section className="workspace">
          <aside className="control">
            <div className="control-block">
              <span className="block-label">Intent</span>
              <input
                className="query-input"
                value={customQuery}
                onChange={(event) => setCustomQuery(event.target.value)}
                placeholder="contoh: tanaman, bunga, laptop, pantai"
              />
            </div>

            <div className="control-block">
              <span className="block-label">Kategori</span>
              <div className="category-grid">
                {Object.entries(CATEGORIES).map(([key, item]) => (
                  <button
                    key={key}
                    className={`category-btn${category === key ? " active" : ""}`}
                    style={{ "--tone": item.tone }}
                    onClick={() => {
                      setCategory(key);
                      showToast(`${item.label} dipilih`);
                    }}
                  >
                    <strong>{item.short}</strong>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <span className="block-label">Free Source</span>
              <div className="source-grid">
                {Object.entries(SOURCES).map(([key, item]) => (
                  <button
                    key={key}
                    className={`source-btn${sourceMode === key ? " active" : ""}`}
                    onClick={() => setSourceMode(key)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <span className="block-label">Dimensi</span>
              <div className="dimension-row">
                <label>
                  <span>Width</span>
                  <input value={width} onChange={(event) => setWidth(clampSize(event.target.value, 1440))} />
                </label>
                <label>
                  <span>Height</span>
                  <input value={height} onChange={(event) => setHeight(clampSize(event.target.value, 900))} />
                </label>
              </div>
              <div className="preset-row">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setWidth(preset.w);
                      setHeight(preset.h);
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block fx-block">
              <span className="block-label">Picsum FX</span>
              <label className="toggle-line">
                <span>Grayscale</span>
                <input type="checkbox" checked={gray} onChange={(event) => setGray(event.target.checked)} />
              </label>
              <label className="range-line">
                <span>Blur {blur}</span>
                <input type="range" min="0" max="10" value={blur} onChange={(event) => setBlur(Number(event.target.value))} />
              </label>
            </div>

            <button className="generate-btn" onClick={() => generate(8)}>
              Generate 8 rekomendasi
            </button>
          </aside>

          <section className="stage">
            <div className="stage-head">
              <div>
                <span className="block-label">Preview</span>
                <h2>{categoryInfo.label}</h2>
              </div>
              <div className="chips">
                <span>{active?.source || "smart"}</span>
                <span>{active?.width || width}x{active?.height || height}</span>
                <span>{resolvedQuery}</span>
              </div>
            </div>

            <div className="image-frame" style={{ "--tone": categoryInfo.tone }}>
              {active && (
                <img
                  key={active.url}
                  src={active.url}
                  alt={`${categoryInfo.label} generated image`}
                  onLoad={onMainLoad}
                  onError={() => {
                    setLoading(false);
                    showToast("Source gagal, coba generate lagi");
                  }}
                />
              )}
              {!active && <div className="empty-state">Generate untuk mulai</div>}
              {loading && <div className="loading-layer"><span /></div>}
            </div>

            <div className="action-row">
              <input readOnly value={active?.url || ""} placeholder="URL gambar muncul di sini" />
              <button onClick={copyUrl} disabled={!active}>Copy</button>
              <button onClick={download} disabled={!active}>Download</button>
            </div>

            <div className="recommend-panel">
              <div className="panel-head">
                <span>Rekomendasi satu tema</span>
                <small>{items.length} gambar dari intent yang sama</small>
              </div>
              <div className="recommend-grid">
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={active?.url === item.url ? "active" : ""}
                    onClick={() => selectItem(item)}
                  >
                    <img src={item.url} alt="" loading="lazy" />
                    <span>{item.source}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="history-panel">
              <div className="panel-head">
                <span>History</span>
                <button onClick={() => {
                  setHistory([]);
                  try { localStorage.removeItem("angen-history"); } catch {}
                }}>
                  Clear
                </button>
              </div>
              {history.length === 0 ? (
                <p className="history-empty">Belum ada history.</p>
              ) : (
                <div className="history-grid">
                  {history.map((item) => (
                    <button key={item.url} onClick={() => selectItem(item)}>
                      <img src={item.url} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>
      </main>

      <footer className="footer">
        <span>ANGEN uses no-key free image URLs: LoremFlickr, Picsum, Placehold.</span>
        <span>Built for fast previews and non-monotone recommendations.</span>
      </footer>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
