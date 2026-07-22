"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Entry = { id: string; title: string; japanese?: string; year: number; kind: "episode" | "movie" | "special"; group: string; season: string; number: number };
type Progress = Record<string, { watched: boolean; favorite?: boolean; rating?: number; notes?: string; watchedAt?: string[] }>;

const SERIES = [
  ["The Beginning", "Indigo League", 1997, 82], ["The Beginning", "Adventures in the Orange Islands", 1999, 36],
  ["The Beginning", "The Johto Journeys", 1999, 41], ["The Beginning", "Johto League Champions", 2000, 52], ["The Beginning", "Master Quest", 2001, 65],
  ["Ruby & Sapphire", "Advanced", 2002, 40], ["Ruby & Sapphire", "Advanced Challenge", 2003, 52], ["Ruby & Sapphire", "Advanced Battle", 2004, 54], ["Ruby & Sapphire", "Battle Frontier", 2005, 47],
  ["Diamond & Pearl", "Diamond and Pearl", 2006, 52], ["Diamond & Pearl", "Battle Dimension", 2007, 52], ["Diamond & Pearl", "Galactic Battles", 2008, 52], ["Diamond & Pearl", "Sinnoh League Victors", 2010, 34],
  ["Black & White", "Black & White", 2010, 48], ["Black & White", "Rival Destinies", 2011, 49], ["Black & White", "Adventures in Unova", 2012, 45],
  ["XY", "XY", 2013, 48], ["XY", "Kalos Quest", 2014, 45], ["XY", "XYZ", 2015, 47],
  ["Sun & Moon", "Sun & Moon", 2016, 43], ["Sun & Moon", "Ultra Adventures", 2017, 49], ["Sun & Moon", "Ultra Legends", 2018, 54],
  ["Journeys", "Pokémon Journeys", 2019, 48], ["Journeys", "Master Journeys", 2020, 42], ["Journeys", "Ultimate Journeys", 2021, 54], ["Journeys", "To Be a Pokémon Master", 2023, 11],
  ["Horizons", "Pokémon Horizons", 2023, 45], ["Horizons", "The Search for Laqua", 2024, 44], ["Horizons", "Rising Hope", 2025, 30],
] as const;

const MOVIES = ["Mewtwo Strikes Back", "The Power of One", "Spell of the Unown", "Pokémon 4Ever", "Pokémon Heroes", "Jirachi—Wish Maker", "Destiny Deoxys", "Lucario and the Mystery of Mew", "Pokémon Ranger and the Temple of the Sea", "The Rise of Darkrai", "Giratina and the Sky Warrior", "Arceus and the Jewel of Life", "Zoroark—Master of Illusions", "Black—Victini and Reshiram", "White—Victini and Zekrom", "Kyurem vs. the Sword of Justice", "Genesect and the Legend Awakened", "Diancie and the Cocoon of Destruction", "Hoopa and the Clash of Ages", "Volcanion and the Mechanical Marvel", "I Choose You!", "The Power of Us", "Mewtwo Strikes Back—Evolution", "Secrets of the Jungle"];
const SPECIALS = ["Mewtwo Returns", "The Legend of Thunder!", "Pokémon Chronicles", "Pokémon Mystery Dungeon", "Pokémon Origins", "Pokémon Generations", "Pokémon: Twilight Wings", "Pokémon: Path to the Peak", "Pokémon: Paldean Winds", "Pokémon: Hisuian Snow", "Pokémon Concierge", "Pokétoon", "Bidoof's Big Stand", "The Arceus Chronicles"];

function buildCatalog(): Entry[] {
  const episodes = SERIES.flatMap(([group, season, year, count]) => Array.from({ length: count }, (_, i) => ({ id: `ep-${season}-${i + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: `Episode ${i + 1}`, year, kind: "episode" as const, group, season, number: i + 1 })));
  const movies = MOVIES.map((title, i) => ({ id: `movie-${i + 1}`, title, year: 1998 + i, kind: "movie" as const, group: "Feature Films", season: "Movies", number: i + 1 }));
  const specials = SPECIALS.map((title, i) => ({ id: `special-${i + 1}`, title, year: 2000 + i, kind: "special" as const, group: "Special Animation", season: "Specials & Web Series", number: i + 1 }));
  return [...episodes, ...movies, ...specials];
}

const CATALOG = buildCatalog();
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${BASE_PATH}/assets/${path}`;
const icon = (n: string) => asset(`icons/${n}`);

export default function Home() {
  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("pokemon-journal-progress") || "{}"); } catch { return {}; }
  });
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | Entry["kind"]>("all");
  const [hideWatched, setHideWatched] = useState(false);
  const [open, setOpen] = useState<string[]>(["Indigo League"]);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [tab, setTab] = useState<"journey" | "catalog" | "stats" | "history">("journey");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem("pokemon-journal-progress", JSON.stringify(progress)); }, [progress]);

  const watched = Object.values(progress).filter(x => x.watched).length;
  const pct = Math.round((watched / CATALOG.length) * 100);
  const filtered = useMemo(() => CATALOG.filter(e => (kind === "all" || e.kind === kind) && (!hideWatched || !progress[e.id]?.watched) && (`${e.title} ${e.season} ${e.group}`).toLowerCase().includes(query.toLowerCase())), [query, kind, hideWatched, progress]);
  const seasons = useMemo(() => Array.from(new Set(filtered.map(e => e.season))), [filtered]);
  const next = CATALOG.find(e => !progress[e.id]?.watched) || CATALOG[0];
  const toggle = (entry: Entry) => setProgress(p => ({ ...p, [entry.id]: { ...p[entry.id], watched: !p[entry.id]?.watched, watchedAt: !p[entry.id]?.watched ? [...(p[entry.id]?.watchedAt || []), new Date().toISOString()] : p[entry.id]?.watchedAt } }));
  const exportData = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), progress }, null, 2)], { type: "application/json" })); a.download = "pokemon-trainer-journal-backup.json"; a.click(); URL.revokeObjectURL(a.href); };
  const importData = async (file?: File) => { if (!file) return; try { const data = JSON.parse(await file.text()); setProgress(data.progress || data); } catch { alert("That backup file could not be read."); } };

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setTab("journey")}><img src={asset("core/06-journal-cover.png")} alt=""/><span><b>Pokémon</b><em>Trainer Journal</em></span></button>
      <nav>{[["journey","01-journey.png","Journey"],["catalog","02-catalog.png","Catalog"],["stats","04-statistics.png","Statistics"],["history","06-calendar-history.png","History"]].map(([id,img,label]) => <button key={id} className={tab===id?"active":""} onClick={()=>setTab(id as typeof tab)}><img src={icon(img)}/><span>{label}</span></button>)}</nav>
      <button className="avatar"><img src={asset("core/07-trainer-avatar-fox-card.png")}/><span>{watched}<small>logged</small></span></button>
    </header>

    <section className="hero paper">
      <img className="hero-art" src={asset("core/01-hero-landscape.png")} alt="A painted Pokémon journey landscape"/>
      <div className="hero-copy"><p className="eyebrow">旅の記録 · Adventure Log</p><h1>Your great journey,<br/><i>one story at a time.</i></h1><p>Every episode, film, special, and Japanese animation—kept together in one well-worn field journal.</p><div className="hero-actions"><button onClick={()=>{setTab("catalog");setSelected(next)}}>Continue journey <span>→</span></button><span><b>{pct}%</b> of the complete animated archive</span></div></div>
      <img className="seal" src={asset("decor/04-vermilion-journey-seal.png")} alt=""/>
    </section>

    {tab === "journey" && <>
      <section className="stat-grid">
        <article className="paper"><img src={asset("core/08-open-watch-log.png")}/><div><small>Stories logged</small><strong>{watched.toLocaleString()}</strong><span>of {CATALOG.length.toLocaleString()}</span></div></article>
        <article className="paper"><img src={asset("core/10-episode-film-projector.png")}/><div><small>Episodes</small><strong>{Object.keys(progress).filter(id=>id.startsWith("ep-")&&progress[id].watched).length}</strong><span>television adventures</span></div></article>
        <article className="paper"><img src={asset("core/09-trainer-backpack.png")}/><div><small>Movies & specials</small><strong>{Object.keys(progress).filter(id=>!id.startsWith("ep-")&&progress[id].watched).length}</strong><span>rare discoveries</span></div></article>
        <article className="paper"><img src={asset("core/04-achievement-patch.png")}/><div><small>Completion</small><strong>{pct}%</strong><span>{pct>=25?"Trailblazer rank":"First Steps rank"}</span></div></article>
      </section>
      <section className="next-section"><div className="section-title"><span>次の目的地</span><h2>Next up in your journey</h2><button onClick={()=>setTab("catalog")}>View full catalog →</button></div><article className="feature-card"><img src={asset("cards/01-panoramic-journey.png")}/><div className="feature-shade"></div><div className="feature-copy"><span>{next.group} · {next.year}</span><h3>{next.season}</h3><p>{next.title}</p><button onClick={()=>toggle(next)}>{progress[next.id]?.watched?"✓ Logged":"Log as watched"}</button></div></article></section>
    </>}

    {tab === "catalog" && <section className="catalog paper"><div className="catalog-head"><div><span>全編目録</span><h2>The complete animated archive</h2><p>{filtered.length.toLocaleString()} entries across series, films, and special animation.</p></div><img src={asset("core/03-travel-map-compass.png")}/></div>
      <div className="toolbar"><label><img src={icon("03-search-filter.png")}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search series, season, or title…"/></label><div className="segmented">{(["all","episode","movie","special"] as const).map(k=><button className={kind===k?"active":""} onClick={()=>setKind(k)} key={k}>{k}</button>)}</div><button className={hideWatched?"check active":"check"} onClick={()=>setHideWatched(v=>!v)}>Hide watched</button></div>
      <div className="season-list">{seasons.map(season=>{const entries=filtered.filter(e=>e.season===season);const isOpen=open.includes(season);const done=entries.filter(e=>progress[e.id]?.watched).length;return <article key={season} className="season"><button className="season-row" onClick={()=>setOpen(o=>isOpen?o.filter(x=>x!==season):[...o,season])}><div className="season-thumb"><img src={entries[0]?.kind==="movie"?asset("cards/02-postcard-collage.png"):entries[0]?.kind==="special"?asset("cards/05-travel-still-life.png"):asset("cards/01-panoramic-journey.png")}/></div><div><small>{entries[0]?.group}</small><h3>{season}</h3><span>{done} of {entries.length} complete</span></div><div className="mini-progress"><i style={{width:`${entries.length?done/entries.length*100:0}%`}}/></div><b>{isOpen?"−":"+"}</b></button>{isOpen&&<div className="entries">{entries.map(e=><button key={e.id} className={progress[e.id]?.watched?"entry watched":"entry"} onClick={()=>setSelected(e)}><span className="checkbox" onClick={ev=>{ev.stopPropagation();toggle(e)}}>{progress[e.id]?.watched?"✓":""}</span><span className="entry-num">{e.kind==="episode"?`EP ${String(e.number).padStart(3,"0")}`:e.year}</span><span className="entry-title">{e.title}</span><span className="entry-kind">{e.kind}</span><span>›</span></button>)}</div>}</article>})}</div>
    </section>}

    {tab === "stats" && <section className="insight paper"><div><span>旅の成果</span><h2>Your journey in numbers</h2><p>You have logged {watched.toLocaleString()} of {CATALOG.length.toLocaleString()} animated stories.</p></div><div className="big-ring" style={{"--pct":`${pct*3.6}deg`} as React.CSSProperties}><strong>{pct}%</strong><span>complete</span></div><div className="breakdown">{["The Beginning","Ruby & Sapphire","Diamond & Pearl","Black & White","XY","Sun & Moon","Journeys","Horizons","Feature Films","Special Animation"].map(g=>{const all=CATALOG.filter(e=>e.group===g), done=all.filter(e=>progress[e.id]?.watched).length;return <div key={g}><span>{g}</span><i><b style={{width:`${all.length?done/all.length*100:0}%`}}/></i><em>{done}/{all.length}</em></div>})}</div></section>}

    {tab === "history" && <section className="insight paper"><div><span>思い出の記録</span><h2>Viewing history & safekeeping</h2><p>Your progress lives in this browser. Download a backup whenever you want a portable copy.</p></div><div className="backup-actions"><button onClick={exportData}><img src={icon("07-backup-restore.png")}/>Download backup</button><button onClick={()=>fileRef.current?.click()}><img src={icon("07-backup-restore.png")}/>Restore backup</button><input ref={fileRef} hidden type="file" accept="application/json" onChange={e=>importData(e.target.files?.[0])}/></div><div className="timeline">{CATALOG.filter(e=>progress[e.id]?.watched).slice(-20).reverse().map(e=><article key={e.id}><span>✓</span><div><b>{e.season} · {e.title}</b><small>{progress[e.id]?.watchedAt?.at(-1)?.slice(0,10)||"Date not recorded"}</small></div></article>)}{watched===0&&<div className="empty"><img src={asset("core/05-companion-empty-state.png")}/><p>Your first logged story will appear here.</p></div>}</div></section>}

    {selected&&<div className="drawer-wrap" onClick={()=>setSelected(null)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><img className="drawer-art" src={selected.kind==="movie"?asset("cards/02-postcard-collage.png"):selected.kind==="special"?asset("cards/05-travel-still-life.png"):asset("cards/01-panoramic-journey.png")}/><span>{selected.group} · {selected.year}</span><h2>{selected.season}</h2><h3>{selected.title}</h3><button className="log" onClick={()=>toggle(selected)}>{progress[selected.id]?.watched?"✓ Watched":"Mark as watched"}</button><label>Rating <div className="stars">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setProgress(p=>({...p,[selected.id]:{...p[selected.id],watched:p[selected.id]?.watched||false,rating:n}}))}>{(progress[selected.id]?.rating||0)>=n?"★":"☆"}</button>)}</div></label><label>Field notes<textarea value={progress[selected.id]?.notes||""} onChange={e=>setProgress(p=>({...p,[selected.id]:{...p[selected.id],watched:p[selected.id]?.watched||false,notes:e.target.value}}))} placeholder="Memories, favorite moments, where you watched…"/></label></aside></div>}

    <footer><img src={asset("decor/12-mountain-sun-postal-stamp.png")}/><p>A fan-made completion journal for the world’s animated Pokémon adventures.</p><button onClick={()=>setTab("history")}><img src={icon("08-settings.png")}/>Backup & settings</button></footer>
  </main>;
}
