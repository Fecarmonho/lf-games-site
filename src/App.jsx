import { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import logoImg from "./logo.png";
import storeHeroImg from "./store-hero.jpg";
import mascoteImg from "./mascote.png";

// ─────────────────────────────────────────────
// FIREBASE (mesmo projeto do ERP — leitura de produtos em tempo real)
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBIr9egtBxjjdXaIMGLKYlxsyitz4Vx_vk",
  authDomain: "lf-games-app.firebaseapp.com",
  projectId: "lf-games-app",
  storageBucket: "lf-games-app.firebasestorage.app",
  messagingSenderId: "864404535098",
  appId: "1:864404535098:web:a2253048e79b812ff0c203",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ─────────────────────────────────────────────
// DADOS DA LOJA — edite aqui
// ─────────────────────────────────────────────
const WHATSAPP_NUMERO = "5515998134273"; // (15) 99813-4273
const INSTAGRAM_USUARIO = "larissa_felipe_lf_games";
const ENDERECO_TEXTO = "Votorantim - SP";
const ENDERECO_MAPA_QUERY = "Votorantim, SP";
const LOJA_ML_URL = "https://lista.mercadolivre.com.br/_CustId_3321049824";

const CATEGORIAS_PRODUTO = [
  "PlayStation", "Xbox", "Nintendo", "PC Gamer", "Jogos", "Controles",
  "Headsets", "Mouse", "Teclados", "Cadeiras", "Gift Cards", "Cabos",
  "Acessórios", "Colecionáveis",
];

function formatBRL(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function linkWhatsApp(produto) {
  const msg = `Olá! Tenho interesse no produto *${produto.nome}*, vi no site da LF Games. Ainda está disponível?`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
}

function linkWhatsAppGeral() {
  const msg = "Olá! Vim pelo site da LF Games e queria tirar uma dúvida.";
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
}

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
  :root {
    --bg: #09090b;
    --surface: #131316;
    --surface2: #1a1a1f;
    --surface3: #24242b;
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.14);
    --text: #f2f2f4;
    --text2: #8a8a96;
    --accent: #ff2d4d;
    --accent2: #ff6b83;
    --green: #3ecf8e;
    --blue: #3ea6ff;
    --purple: #a259ff;
    --gold: #f5a623;
    --radius: 14px;
    --radius-sm: 9px;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; overflow-x: hidden; width: 100%; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; width: 100%; max-width: 100vw; }
  h1,h2,h3,h4 { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; margin: 0; }
  p { overflow-wrap: break-word; word-break: break-word; }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }
  .wrap { max-width: 1240px; margin: 0 auto; padding: 0 24px; min-width: 0; }

  .topbar { position: sticky; top: 0; z-index: 50; background: rgba(9,9,11,0.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
  .topbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; max-width: 1240px; margin: 0 auto; }
  .topbar-logo { display: flex; align-items: center; gap: 10px; }
  .topbar-logo img { width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0 0 6px rgba(255,45,77,0.3)); }
  .topbar-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; }
  .topbar-nav { display: flex; gap: 26px; font-size: 14px; color: var(--text2); }
  .topbar-nav a:hover { color: var(--text); }
  .topbar-cta { display: flex; align-items: center; gap: 8px; background: var(--accent); color: #fff; padding: 9px 16px; border-radius: 999px; font-weight: 700; font-size: 13px; box-shadow: 0 0 16px rgba(255,45,77,0.3); }
  .topbar-cta:hover { background: var(--accent2); }
  @media (max-width: 780px) { .topbar-nav { display: none; } }

  .hero { position: relative; overflow: hidden; padding: 26px 24px 30px; text-align: center;
      background:
        radial-gradient(circle at 20% 10%, rgba(255,45,77,0.20), transparent 45%),
        radial-gradient(circle at 85% 30%, rgba(62,166,255,0.14), transparent 40%),
        linear-gradient(180deg, rgba(9,9,11,0.70) 0%, rgba(9,9,11,0.95) 100%),
        url(${storeHeroImg});
      background-repeat: no-repeat;
      background-position: center, center, center, center 30%;
      background-size: auto, auto, auto, cover; }
  .hero-logo { width: 230px; height: auto; object-fit: contain; margin: 0 auto 2px; filter: drop-shadow(0 0 30px rgba(255,45,77,0.4)); }
  .hero h1 { font-size: clamp(36px, 6.5vw, 68px); line-height: 0.92; }
  .hero h1 span { color: var(--accent); }
  .hero p { color: var(--text2); font-size: 15px; max-width: 470px; margin: 10px auto 18px; }
  .hero-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: transform .15s ease, background .15s ease; }
  .btn:hover { transform: translateY(-2px); }
  .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 0 20px rgba(255,45,77,0.35); }
  .btn-primary:hover { background: var(--accent2); }
  .btn-outline { background: transparent; color: var(--text); border: 1.5px solid var(--border2); }
  .btn-outline:hover { border-color: var(--accent); color: var(--accent2); }
  .btn-ml { background: #ffe600; color: #1a1a1f; }
  .btn-ml:hover { background: #fff04d; }
  .btn-sm { padding: 9px 14px; font-size: 12.5px; }
  .btn-block { width: 100%; justify-content: center; }

  .section { padding: 60px 0; }
  .section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 26px; flex-wrap: wrap; gap: 10px; }
  .section-title { font-size: 32px; }
  .section-sub { color: var(--text2); font-size: 14px; }

  .chips { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
  .chip { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border2); font-size: 13px; color: var(--text2); cursor: pointer; background: var(--surface); white-space: nowrap; }
  .chip:hover { border-color: var(--accent); color: var(--text); }
  .chip.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 700; }

  .search-row { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
  .search-input { flex: 1; min-width: 220px; background: var(--surface); border: 1px solid var(--border2); border-radius: 999px; padding: 13px 20px; color: var(--text); font-size: 14px; }
  .search-input:focus { outline: none; border-color: var(--accent); }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 20px; }
  .featured-row { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; }
  .featured-row .card { min-width: 230px; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; display: flex; flex-direction: column; transition: border-color .15s ease, transform .15s ease; position: relative; }
  .card:hover { border-color: var(--border2); transform: translateY(-3px); }
  .card-badge { position: absolute; top: 10px; left: 10px; z-index: 2; background: var(--gold); color: #1a1a1f; font-size: 10px; font-weight: 800; padding: 4px 9px; border-radius: 999px; letter-spacing: 0.5px; }
  .card-img { height: 160px; background: var(--surface2); display: flex; align-items: center; justify-content: center; font-size: 52px; overflow: hidden; }
  .card-img img { width: 100%; height: 100%; object-fit: cover; }
  .card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .card-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { font-size: 10.5px; padding: 3px 9px; border-radius: 999px; font-weight: 700; letter-spacing: 0.3px; }
  .tag-cat { background: rgba(62,166,255,0.15); color: var(--blue); }
  .tag-cond-novo { background: rgba(62,207,142,0.15); color: var(--green); }
  .tag-cond-seminovo { background: rgba(245,166,35,0.15); color: var(--gold); }
  .tag-cond-usado { background: rgba(255,255,255,0.08); color: var(--text2); }
  .card-name { font-size: 15.5px; font-weight: 700; line-height: 1.25; font-family: 'DM Sans', sans-serif; }
  .card-console { font-size: 12px; color: var(--text2); }
  .card-price { font-size: 22px; font-weight: 800; color: var(--text); margin-top: 2px; }
  .card-stock { font-size: 11.5px; font-weight: 700; }
  .stock-ok { color: var(--green); }
  .stock-out { color: var(--gold); }
  .card-actions { display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 8px; }

  .empty { text-align: center; padding: 70px 20px; color: var(--text2); }
  .empty-emoji { font-size: 46px; margin-bottom: 12px; }

  .footer { background: var(--surface); border-top: 1px solid var(--border); margin-top: 40px; }
  .footer-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 40px; padding-top: 56px; padding-bottom: 30px; min-width: 0; }
  .footer-col { min-width: 0; }
  .footer-col h4 { font-size: 13px; color: var(--text2); letter-spacing: 1.5px; margin-bottom: 16px; text-transform: uppercase; }
  .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .footer-logo img { width: 38px; height: 38px; object-fit: contain; }
  .footer-logo span { font-family: 'Bebas Neue', sans-serif; font-size: 19px; letter-spacing: 2px; }
  .footer-tagline { color: var(--text2); font-size: 13px; max-width: 260px; overflow-wrap: break-word; word-break: break-word; }
  .footer-link { display: flex; align-items: center; gap: 8px; color: var(--text2); font-size: 14px; margin-bottom: 12px; }
  .footer-link:hover { color: var(--accent2); }
  .map-frame { border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border2); margin-top: 8px; width: 100%; max-width: 100%; }
  .map-frame iframe { width: 100%; max-width: 100%; height: 150px; border: 0; display: block; filter: grayscale(0.4) invert(0.92) contrast(0.9); }
  .footer-bottom { border-top: 1px solid var(--border); padding: 18px 0; text-align: center; font-size: 12px; color: var(--text2); }
  @media (max-width: 820px) { .footer-grid { grid-template-columns: 1fr; gap: 30px; padding-top: 40px; padding-bottom: 20px; } }

  .whatsapp-float { position: fixed; bottom: 22px; right: 22px; z-index: 60; width: 58px; height: 58px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(37,211,102,0.45); font-size: 28px; }
  .whatsapp-float:hover { transform: scale(1.06); }

  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px; }
  .spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid var(--border2); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Mobile: cards 2 por linha (estilo e-commerce) */
  @media (max-width: 640px) {
    .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .featured-row { gap: 10px; }
    .featured-row .card { min-width: 160px; }
    .card-img { height: 115px; font-size: 40px; }
    .card-body { padding: 11px 10px 13px; gap: 6px; }
    .card-badge { font-size: 9px; padding: 3px 7px; }
    .tag { font-size: 9.5px; padding: 2px 7px; }
    .card-name { font-size: 13px; }
    .card-console { font-size: 11px; }
    .card-price { font-size: 17px; }
    .card-stock { font-size: 10.5px; }
    .card-actions .btn-sm { padding: 8px 6px; font-size: 10px; }
  }
`;

// ─────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────
function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-logo">
          <img src={logoImg} alt="LF Games" />
          <span className="topbar-name">LF GAMES</span>
        </div>
        <nav className="topbar-nav">
          <a href="#catalogo">Catálogo</a>
          <a href="#categorias">Categorias</a>
          <a href={LOJA_ML_URL} target="_blank" rel="noreferrer">Mercado Livre</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="topbar-cta" href={linkWhatsAppGeral()} target="_blank" rel="noreferrer">💬 WhatsApp</a>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="hero">
      <img src={mascoteImg} alt="LF Games" className="hero-logo" />
      <h1>JOGUE. <span>VENÇA.</span><br />DIVIRTA-SE.</h1>
      <p>Consoles, jogos, controles e acessórios em Votorantim-SP. Veja o produto aqui e feche a compra direto pelo WhatsApp ou Mercado Livre.</p>
      <div className="hero-ctas">
        <a className="btn btn-primary" href="#catalogo">Ver catálogo</a>
        <a className="btn btn-outline" href={linkWhatsAppGeral()} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
        <a className="btn btn-outline" href={LOJA_ML_URL} target="_blank" rel="noreferrer">Loja no Mercado Livre</a>
        <a className="btn btn-outline" href={`https://instagram.com/${INSTAGRAM_USUARIO}`} target="_blank" rel="noreferrer">Seguir no Instagram</a>
      </div>
    </div>
  );
}

function ProductCard({ p }) {
  const emStoque = (p.quantidadeEstoque || 0) > 0;
  const condClass = p.condicao === "Novo" ? "tag-cond-novo" : p.condicao === "Seminovo" ? "tag-cond-seminovo" : "tag-cond-usado";
  return (
    <div className="card">
      {p.destaque && <div className="card-badge">⭐ Destaque</div>}
      <div className="card-img">{p.imagem ? <img src={p.imagem} alt={p.nome} /> : "🎮"}</div>
      <div className="card-body">
        <div className="card-tags">
          {p.categoria && <span className="tag tag-cat">{p.categoria}</span>}
          {p.condicao && <span className={`tag ${condClass}`}>{p.condicao}</span>}
        </div>
        <div className="card-name">{p.nome}</div>
        {p.console && p.console !== "Não se aplica" && <div className="card-console">{p.console}</div>}
        <div className="card-price">{formatBRL(p.precoVenda)}</div>
        <div className={`card-stock ${emStoque ? "stock-ok" : "stock-out"}`}>
          {emStoque ? "✓ Em estoque" : "Sob encomenda"}
        </div>
        <div className="card-actions">
          <a className="btn btn-primary btn-sm btn-block" href={linkWhatsApp(p)} target="_blank" rel="noreferrer">💬 Comprar no WhatsApp</a>
          {p.linkML && <a className="btn btn-ml btn-sm btn-block" href={p.linkML} target="_blank" rel="noreferrer">Ver no Mercado Livre</a>}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(ENDERECO_MAPA_QUERY)}&output=embed`;
  return (
    <div className="footer" id="contato">
      <div className="wrap footer-grid">
        <div className="footer-col">
          <div className="footer-logo"><img src={logoImg} alt="LF Games" /><span>LF GAMES</span></div>
          <p className="footer-tagline">Jogue. Vença. Divirta-se. Consoles, jogos e acessórios com atendimento direto pelo WhatsApp.</p>
        </div>
        <div className="footer-col">
          <h4>Contato</h4>
          <a className="footer-link" href={linkWhatsAppGeral()} target="_blank" rel="noreferrer">💬 WhatsApp</a>
          <a className="footer-link" href={LOJA_ML_URL} target="_blank" rel="noreferrer">🛒 Loja no Mercado Livre</a>
          <a className="footer-link" href={`https://instagram.com/${INSTAGRAM_USUARIO}`} target="_blank" rel="noreferrer">📷 Instagram</a>
          <div className="footer-link">📍 {ENDERECO_TEXTO}</div>
        </div>
        <div className="footer-col">
          <h4>Localização</h4>
          <div className="map-frame"><iframe src={mapSrc} loading="lazy" title="Mapa"></iframe></div>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} LF Games — Todos os direitos reservados.</div>
    </div>
  );
}

export default function App() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) setAuthReady(true);
      else signInAnonymously(auth).catch(() => setAuthReady(true));
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const unsub = onSnapshot(collection(db, "produtos"), (snap) => {
      setProdutos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [authReady]);

  const categoriasComProduto = useMemo(() => {
    const set = new Set(produtos.map(p => p.categoria).filter(Boolean));
    return CATEGORIAS_PRODUTO.filter(c => set.has(c));
  }, [produtos]);

  const destaques = useMemo(() => produtos.filter(p => p.destaque), [produtos]);

  const filtrados = useMemo(() => {
    return produtos.filter(p => {
      if (categoriaAtiva !== "todos" && p.categoria !== categoriaAtiva) return false;
      if (busca.trim() && !p.nome?.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }, [produtos, categoriaAtiva, busca]);

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="loading-screen">
          <img src={logoImg} alt="" style={{ width: 70, opacity: 0.8 }} />
          <div className="spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <TopBar />
      <Hero />

      {destaques.length > 0 && (
        <div className="wrap section" id="destaques">
          <div className="section-head">
            <div><h2 className="section-title">Destaques</h2><p className="section-sub">Selecionados pra você</p></div>
          </div>
          <div className="featured-row">
            {destaques.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      <div className="wrap section" id="catalogo">
        <div className="section-head" id="categorias">
          <div><h2 className="section-title">Catálogo</h2><p className="section-sub">{filtrados.length} produto{filtrados.length !== 1 ? "s" : ""}</p></div>
        </div>

        <div className="search-row">
          <input className="search-input" placeholder="🔍 Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        <div className="chips">
          <div className={`chip ${categoriaAtiva === "todos" ? "active" : ""}`} onClick={() => setCategoriaAtiva("todos")}>Todos</div>
          {categoriasComProduto.map(c => (
            <div key={c} className={`chip ${categoriaAtiva === c ? "active" : ""}`} onClick={() => setCategoriaAtiva(c)}>{c}</div>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">🎮</div>
            {produtos.length === 0 ? "Nenhum produto cadastrado ainda." : "Nenhum produto encontrado para esse filtro."}
          </div>
        ) : (
          <div className="grid">
            {filtrados.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

      <Footer />

      <a className="whatsapp-float" href={linkWhatsAppGeral()} target="_blank" rel="noreferrer" title="Falar no WhatsApp">💬</a>
    </>
  );
}
