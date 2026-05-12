"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = {
  tanaman: {
    label: "Tanaman",
    short: "Tanam",
    query: "plants,botanical,leaves,flower,garden",
    tone: "#5fc98a",
  },
  alam: {
    label: "Alam",
    short: "Alam",
    query: "nature,mountain,forest,river,landscape",
    tone: "#72b7f2",
  },
  pantai: {
    label: "Pantai",
    short: "Pantai",
    query: "beach,ocean,coast,tropical,sea",
    tone: "#66d9d9",
  },
  kota: {
    label: "Kota",
    short: "Kota",
    query: "city,street,skyline,urban,night",
    tone: "#c9a84c",
  },
  arsitektur: {
    label: "Arsitektur",
    short: "Bangun",
    query: "architecture,building,interior,modern,facade",
    tone: "#d7b98a",
  },
  teknologi: {
    label: "Teknologi",
    short: "Tekno",
    query: "technology,computer,circuit,server,workspace",
    tone: "#8aa7ff",
  },
  makanan: {
    label: "Makanan",
    short: "Makan",
    query: "food,restaurant,dessert,coffee,cooking",
    tone: "#f1a24f",
  },
  hewan: {
    label: "Hewan",
    short: "Hewan",
    query: "animal,wildlife,bird,cat,dog",
    tone: "#d7a05f",
  },
  orang: {
    label: "Orang",
    short: "Orang",
    query: "people,portrait,person,profile,human",
    tone: "#d48abf",
  },
  travel: {
    label: "Perjalanan",
    short: "Jalan",
    query: "travel,landmark,road,adventure,tourism",
    tone: "#f0d080",
  },
  bisnis: {
    label: "Bisnis",
    short: "Bisnis",
    query: "business,office,meeting,laptop,team",
    tone: "#b7c1d6",
  },
  abstrak: {
    label: "Abstrak",
    short: "Abstrak",
    query: "abstract,texture,pattern,color,art",
    tone: "#b98cff",
  },
  acak: {
    label: "Acak",
    short: "Acak",
    query: "",
    tone: "#c9a84c",
  },
};

const SOURCES = {
  semantic: {
    label: "Flickr Semantik",
    desc: "Cocok untuk kategori spesifik seperti tanaman, hewan, makanan, dan kota.",
  },
  picsum: {
    label: "Picsum Editorial",
    desc: "Gambar acak bergaya editorial untuk variasi visual.",
  },
  poster: {
    label: "Poster Otomatis",
    desc: "Fallback cepat berbasis teks dan warna kategori.",
  },
};

const ORIENTATIONS = [
  { id: "horizontal", label: "Horizontal", desc: "Cocok untuk laptop, banner, dan desktop.", w: 1440, h: 900 },
  { id: "vertical", label: "Vertikal", desc: "Cocok untuk HP, story, poster, dan konten mobile.", w: 900, h: 1440 },
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

function resolveSource(category, seed) {
  if (category === "acak" || category === "abstrak") {
    if (seed % 5 === 0) return "poster";
    if (seed % 2 === 0) return "picsum";
    return "semantic";
  }
  if (seed % 9 === 0) return "poster";
  return "semantic";
}

function buildUrl({ category, customQuery, width, height, seed, gray, blur }) {
  const source = resolveSource(category, seed);
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
  const [customQuery, setCustomQuery] = useState("");
  const [orientation, setOrientation] = useState("horizontal");
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
  const orientationInfo = ORIENTATIONS.find((item) => item.id === orientation) || ORIENTATIONS[0];
  const width = orientationInfo.w;
  const height = orientationInfo.h;
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
      category,
      customQuery,
      width,
      height,
      seed,
      gray,
      blur,
    });
    return {
      id: `${seed}-${category}-${orientation}-${width}x${height}`,
      url,
      seed,
      category,
      source: resolveSource(category, seed),
      query: resolveQuery(category, customQuery),
      width,
      height,
    };
  }, [blur, category, customQuery, gray, height, orientation, width]);

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
      showToast("Unduhan dimulai");
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
            <span>Studio Gambar Gratis</span>
          </div>
        </div>
        <div className="topbar-meta">
          <span>Tanpa API key</span>
          <span>Sumber otomatis</span>
          <span>{fmt(total)} dibuat</span>
        </div>
      </header>

      <main className="studio">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Generator gambar gratis otomatis</span>
            <h1>Gambar acak yang tetap sesuai pilihanmu.</h1>
            <p>
              Pilih kategori atau ketik kata sendiri. Sistem akan mencari gambar
              yang masih satu tema, lalu memilih sumber gratis secara otomatis.
              Cocok untuk pemula, HP, dan laptop.
            </p>
          </div>
          <div className="source-card">
            <span>Sumber aktif</span>
            <strong>Rotasi Otomatis</strong>
            <p>Flickr Semantik, Picsum, dan Poster digabung jadi satu alur. Kamu cukup pilih tema.</p>
          </div>
        </section>

        <section className="workspace">
          <aside className="control">
            <div className="control-block">
              <span className="block-label">Kata kunci</span>
              <input
                className="query-input"
                value={customQuery}
                onChange={(event) => setCustomQuery(event.target.value)}
                placeholder="Contoh: tanaman, bunga, laptop, pantai"
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
              <span className="block-label">Bentuk gambar</span>
              <div className="orientation-grid">
                {ORIENTATIONS.map((item) => (
                  <button
                    key={item.id}
                    className={`orientation-btn${orientation === item.id ? " active" : ""}`}
                    onClick={() => setOrientation(item.id)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                    <em>{item.w} x {item.h}</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block fx-block">
              <span className="block-label">Efek tambahan</span>
              <label className="toggle-line">
                <span>Hitam putih</span>
                <input type="checkbox" checked={gray} onChange={(event) => setGray(event.target.checked)} />
              </label>
              <label className="range-line">
                <span>Blur {blur}</span>
                <input type="range" min="0" max="10" value={blur} onChange={(event) => setBlur(Number(event.target.value))} />
              </label>
            </div>

            <button className="generate-btn" onClick={() => generate(8)}>
              Buat 8 rekomendasi
            </button>
          </aside>

          <section className="stage">
            <div className="stage-head">
              <div>
                <span className="block-label">Pratinjau</span>
                <h2>{categoryInfo.label}</h2>
              </div>
              <div className="chips">
                <span>{SOURCES[active?.source]?.label || "Otomatis"}</span>
                <span>{active?.width || width}x{active?.height || height}</span>
                <span>{resolvedQuery}</span>
              </div>
            </div>

            <div className="image-frame" style={{ "--tone": categoryInfo.tone }}>
              {active && (
                <img
                  key={active.url}
                  src={active.url}
                  alt={`Gambar hasil kategori ${categoryInfo.label}`}
                  onLoad={onMainLoad}
                  onError={() => {
                    setLoading(false);
                    showToast("Source gagal, coba generate lagi");
                  }}
                />
              )}
              {!active && <div className="empty-state">Klik buat rekomendasi untuk mulai</div>}
              {loading && <div className="loading-layer"><span /></div>}
            </div>

            <div className="action-row">
              <input readOnly value={active?.url || ""} placeholder="URL gambar muncul di sini" />
              <button onClick={copyUrl} disabled={!active}>Salin</button>
              <button onClick={download} disabled={!active}>Unduh</button>
            </div>

            <div className="recommend-panel">
              <div className="panel-head">
                <span>Rekomendasi satu tema</span>
                <small>{items.length} gambar dari tema yang sama</small>
              </div>
              <div className="recommend-grid">
                {items.map((item) => (
                  <button
                    key={item.id}
                    className={active?.url === item.url ? "active" : ""}
                    onClick={() => selectItem(item)}
                  >
                    <img src={item.url} alt="" loading="lazy" />
                    <span>{SOURCES[item.source]?.label || item.source}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="history-panel">
              <div className="panel-head">
                <span>Riwayat</span>
                <button onClick={() => {
                  setHistory([]);
                  try { localStorage.removeItem("angen-history"); } catch {}
                }}>
                  Hapus
                </button>
              </div>
              {history.length === 0 ? (
                <p className="history-empty">Belum ada riwayat.</p>
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
        <span>ANGEN memakai sumber gambar gratis tanpa API key: LoremFlickr, Picsum, dan Placehold.</span>
        <span>Dibuat agar mudah dipakai pemula di HP maupun laptop.</span>
      </footer>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
