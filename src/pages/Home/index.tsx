import { useState, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshake, faHeart, faHome, faUsers,
  faCopy, faCheck, faArrowRight, faMapMarkerAlt,
  faEnvelope, faQuoteLeft, faChevronLeft, faChevronRight,
  faPen, faPlus, faTrash, faSave, faXmark, faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faInstagram } from "@fortawesome/free-brands-svg-icons";

const defaultContent = {
  hero: {
    eyebrow: "Instituto Umanizzare",
    title: "Humanizando vidas\natravés do acolhimento,\ndesenvolvimento e",
    titleSpan: "transformação social.",
    sub: "O Instituto Umanizzare atua no fortalecimento de famílias, crianças, adolescentes e comunidades por meio de projetos sociais e ações de desenvolvimento humano.",
  },
  stats: [
    { value: "500+", label: "Pessoas atendidas todos os anos" },
    { value: "15+", label: "Projetos realizados" },
    { value: "8+", label: "Comunidades atendidas" },
    { value: "30+", label: "Voluntários engajados" },
  ],
  somos: {
    titulo: "Nossa história é feita\nde pessoas e",
    tituloSpan: "propósitos.",
    texto: "O Instituto Umanizzare nasceu do desejo de promover dignidade, oportunidades e transformar realidades. Acreditamos no poder do acolhimento, da educação e do desenvolvimento humano para construir um futuro mais justo e solidário.",
    quote: "Acreditamos que pequenas atitudes geram grandes transformações.",
  },
  projetos: [
    { titulo: "Acolher", desc: "Acompanhamento psicossocial para famílias em situação de vulnerabilidade." },
    { titulo: "Transformar", desc: "Capacitação profissional e desenvolvimento de habilidades para o futuro." },
    { titulo: "Crescer", desc: "Apoio ao desenvolvimento infantil e fortalecimento de vínculos familiares." },
    { titulo: "Compartilhar", desc: "Ações de doação de alimentos, roupas e apoio a emergências familiares." },
  ],
  depoimentos: [
    { texto: "O Umanizzare chegou na minha vida em um momento muito difícil. Hoje tenho esperança e estou reconstruindo um futuro melhor para minhas filhas.", nome: "Maria S.", cargo: "Atendida" },
    { texto: "Ser voluntário aqui me ensinou o verdadeiro sentido de propósito. Cada pessoa que passa por aqui transforma a nossa vida também.", nome: "João R.", cargo: "Voluntário" },
    { texto: "Os projetos do Instituto fazem toda a diferença na nossa comunidade. Gratidão por tudo que vocês nos oferecem!", nome: "Ana L.", cargo: "Parceira" },
  ],
  contato: {
    whatsapp: "(61) 99604-8818",
    instagram: "@institutoumanizzare",
    email: "institutoumanizzare@gmail.com",
    endereco: "SIBS Quadra 3 Conjunto B Lote 13, Núcleo Bandeirante, DF",
  },
  images: {
    hero: "",
    somos: "",
    projetos: ["", "", "", ""],
    qrcode: "",
  },
};

type Content = typeof defaultContent;

function loadContent(): Content {
  try {
    const saved = localStorage.getItem("@Umanizzare:homeContent");
    if (!saved) return defaultContent;
    const parsed = JSON.parse(saved);
    return {
      ...defaultContent,
      ...parsed,
      images: {
        ...defaultContent.images,
        ...parsed.images,
        qrcode: parsed.images?.qrcode || "",
        projetos: parsed.images?.projetos || ["", "", "", ""],
      },
    };
  } catch {
    return defaultContent;
  }
}

// ── TEXTO EDITÁVEL ──
function EditableText({ value, onSave, multiline = false, className = "" }: {
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const isAdm = localStorage.getItem("@Umanizzare:role") === "ADMIN";

  if (!isAdm) return <span className={className}>{value}</span>;

  if (editing) {
    return (
      <span className={styles.editableWrapper}>
        {multiline ? (
          <textarea
            className={`${styles.editableInput} ${styles.editableTextarea}`}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            rows={3}
          />
        ) : (
          <input
            className={styles.editableInput}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
          />
        )}
        <span className={styles.editableActions}>
          <button className={styles.editSaveBtn} onClick={() => { onSave(draft); setEditing(false); }} title="Salvar">
            <FontAwesomeIcon icon={faSave} />
          </button>
          <button className={styles.editCancelBtn} onClick={() => { setDraft(value); setEditing(false); }} title="Cancelar">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </span>
      </span>
    );
  }

  return (
    <span className={`${styles.editableWrapper} ${styles.editableHover}`}>
      <span className={className}>{value}</span>
      <button className={styles.editInlineBtn} onClick={() => { setDraft(value); setEditing(true); }} title="Editar">
        <FontAwesomeIcon icon={faPen} />
      </button>
    </span>
  );
}

// ── IMAGEM EDITÁVEL ──
function EditableImage({ value, onSave, className = "", placeholder }: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  placeholder?: React.ReactNode;
}) {
  const isAdm = localStorage.getItem("@Umanizzare:role") === "ADMIN";
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSave(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className={`${styles.editableImgWrapper} ${className}`}>
      {value ? (
        <img src={value} alt="" className={styles.editableImg} />
      ) : (
        <div className={styles.editableImgPlaceholder}>{placeholder}</div>
      )}
      {isAdm && (
        <>
          <button
            className={styles.editImgBtn}
            onClick={() => inputRef.current?.click()}
            title={value ? "Trocar imagem" : "Adicionar imagem"}
          >
            <FontAwesomeIcon icon={faPen} style={{ marginRight: 6 }} />
            {value ? "Trocar" : "Adicionar imagem"}
          </button>
          {value && (
            <button className={styles.removeImgBtn} onClick={() => onSave("")} title="Remover">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </>
      )}
    </div>
  );
}

// ── HOME ──
export function Home() {
  const [content, setContent] = useState<Content>(loadContent);
  const [activeDepo, setActiveDepo] = useState(0);
  const [copied, setCopied] = useState(false);
  const isAdm = localStorage.getItem("@Umanizzare:role") === "ADMIN";
  const statIcons = [faUsers, faHeart, faHome, faHandshake];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDepo(p => (p + 1) % content.depoimentos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [content.depoimentos.length]);

  function save(newContent: Content) {
    setContent(newContent);
    localStorage.setItem("@Umanizzare:homeContent", JSON.stringify(newContent));
  }

  function updateHero(field: keyof Content["hero"], value: string) {
    save({ ...content, hero: { ...content.hero, [field]: value } });
  }

  function updateStat(i: number, field: "value" | "label", value: string) {
    const stats = [...content.stats];
    stats[i] = { ...stats[i], [field]: value };
    save({ ...content, stats });
  }

  function updateSomos(field: keyof Content["somos"], value: string) {
    save({ ...content, somos: { ...content.somos, [field]: value } });
  }

  function updateProjeto(i: number, field: "titulo" | "desc", value: string) {
    const projetos = [...content.projetos];
    projetos[i] = { ...projetos[i], [field]: value };
    save({ ...content, projetos });
  }

  function addProjeto() {
    const projetos = [...content.projetos, { titulo: "Novo Projeto", desc: "Descrição do projeto." }];
    const projetosImgs = [...content.images.projetos, ""];
    save({ ...content, projetos, images: { ...content.images, projetos: projetosImgs } });
  }

  function removeProjeto(i: number) {
    const projetos = content.projetos.filter((_, idx) => idx !== i);
    const projetosImgs = content.images.projetos.filter((_, idx) => idx !== i);
    save({ ...content, projetos, images: { ...content.images, projetos: projetosImgs } });
  }

  function updateDepo(i: number, field: "texto" | "nome" | "cargo", value: string) {
    const depoimentos = [...content.depoimentos];
    depoimentos[i] = { ...depoimentos[i], [field]: value };
    save({ ...content, depoimentos });
  }

  function addDepo() {
    save({ ...content, depoimentos: [...content.depoimentos, { texto: "Novo depoimento.", nome: "Nome", cargo: "Cargo" }] });
  }

  function removeDepo(i: number) {
    save({ ...content, depoimentos: content.depoimentos.filter((_, idx) => idx !== i) });
  }

  function updateContato(field: keyof Content["contato"], value: string) {
    save({ ...content, contato: { ...content.contato, [field]: value } });
  }

  function updateImage(section: "hero" | "somos" | "projeto" | "qrcode", value: string, index?: number) {
    if (section === "hero") {
      save({ ...content, images: { ...content.images, hero: value } });
    } else if (section === "somos") {
      save({ ...content, images: { ...content.images, somos: value } });
    } else if (section === "qrcode") {
      save({ ...content, images: { ...content.images, qrcode: value } });
    } else if (section === "projeto" && index !== undefined) {
      const projetosImgs = [...content.images.projetos];
      projetosImgs[index] = value;
      save({ ...content, images: { ...content.images, projetos: projetosImgs } });
    }
  }

  function copiarPix() {
    navigator.clipboard.writeText("30.617.357/0001-84");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className={styles.page}>

      {isAdm && (
        <div className={styles.adminBanner}>
          <FontAwesomeIcon icon={faPen} style={{ marginRight: 8 }} />
          Modo edição ativo — clique em qualquer texto ou imagem para editar
        </div>
      )}

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.eyebrow}>
            <EditableText value={content.hero.eyebrow} onSave={v => updateHero("eyebrow", v)} />
          </p>
          <h1 className={styles.heroTitle}>
            <EditableText value={content.hero.title} onSave={v => updateHero("title", v)} multiline />
            <br />
            <span><EditableText value={content.hero.titleSpan} onSave={v => updateHero("titleSpan", v)} /></span>
          </h1>
          <p className={styles.heroSub}>
            <EditableText value={content.hero.sub} onSave={v => updateHero("sub", v)} multiline />
          </p>
          <div className={styles.heroBtns}>
            <a href="#projetos" className={styles.btnPrimary}>
              Conhecer projetos <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
            </a>
            <button onClick={copiarPix} className={styles.btnOutline}>
              Fazer doação <FontAwesomeIcon icon={faHeart} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroImgBox}>
            <EditableImage
              value={content.images.hero}
              onSave={v => updateImage("hero", v)}
              className={styles.heroImgPlaceholder}
              placeholder={<FontAwesomeIcon icon={faUsers} style={{ fontSize: "4rem", color: "#800020", opacity: 0.3 }} />}
            />
          </div>
          <div className={styles.heroDecor1}></div>
          <div className={styles.heroDecor2}></div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsBar}>
        {content.stats.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statIconWrap}>
              <FontAwesomeIcon icon={statIcons[i] || faUsers} />
            </div>
            <div>
              <span className={styles.statValue}>
                <EditableText value={s.value} onSave={v => updateStat(i, "value", v)} />
              </span>
              <span className={styles.statLabel}>
                <EditableText value={s.label} onSave={v => updateStat(i, "label", v)} />
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── QUEM SOMOS ── */}
      <section className={styles.section} id="quem-somos">
        <div className={styles.somosGrid}>
          <EditableImage
            value={content.images.somos}
            onSave={v => updateImage("somos", v)}
            className={styles.somosImgPlaceholder}
            placeholder={
              <>
                <FontAwesomeIcon icon={faHome} style={{ fontSize: "3rem", color: "rgba(255,255,255,0.4)" }} />
                <p>Umanizzare Instituto</p>
              </>
            }
          />
          <div className={styles.somosText}>
            <p className={styles.eyebrow}>Quem Somos</p>
            <h2>
              <EditableText value={content.somos.titulo} onSave={v => updateSomos("titulo", v)} multiline />
              {" "}<span><EditableText value={content.somos.tituloSpan} onSave={v => updateSomos("tituloSpan", v)} /></span>
            </h2>
            <p>
              <EditableText value={content.somos.texto} onSave={v => updateSomos("texto", v)} multiline />
            </p>
            <a href="#" className={styles.btnPrimary}>
              Saiba mais sobre nós <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
            </a>
          </div>
          <div className={styles.somosQuote}>
            <FontAwesomeIcon icon={faQuoteLeft} className={styles.quoteIcon} />
            <p><EditableText value={content.somos.quote} onSave={v => updateSomos("quote", v)} multiline /></p>
          </div>
        </div>
      </section>

      {/* ── PROJETOS ── */}
      <section className={styles.sectionAlt} id="projetos">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Nossos Projetos</p>
              <h2>Conheça nossas principais <span>iniciativas</span></h2>
            </div>
            <a href="#" className={styles.linkArrow}>
              Ver todos os projetos <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 4 }} />
            </a>
          </div>
          <div className={styles.projetosGrid}>
            {content.projetos.map((p, i) => (
              <div key={i} className={styles.projetoCard}>
                <EditableImage
                  value={content.images.projetos[i] || ""}
                  onSave={v => updateImage("projeto", v, i)}
                  className={styles.projetoImgPlaceholder}
                  placeholder={<FontAwesomeIcon icon={faHandshake} style={{ fontSize: "2rem", color: "rgba(255,255,255,0.5)" }} />}
                />
                <div className={styles.projetoBody}>
                  {isAdm && (
                    <button className={styles.deleteBtn} onClick={() => removeProjeto(i)} title="Excluir projeto">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                  <h4><EditableText value={p.titulo} onSave={v => updateProjeto(i, "titulo", v)} /></h4>
                  <p><EditableText value={p.desc} onSave={v => updateProjeto(i, "desc", v)} multiline /></p>
                  <a href="#" className={styles.saibaMais}>
                    Saiba mais <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 4 }} />
                  </a>
                </div>
              </div>
            ))}
            {isAdm && (
              <button className={styles.addCard} onClick={addProjeto}>
                <FontAwesomeIcon icon={faPlus} style={{ marginBottom: 8, fontSize: "1.5rem" }} />
                <span>Adicionar projeto</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── DOAÇÃO ── */}
      <section className={styles.doacaoSection}>
        <div className={styles.doacaoLeft}>
          <div className={styles.doacaoIconWrap}>
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <div>
            <h2>Sua contribuição<br /><span>transforma vidas.</span></h2>
            <p>Cada gesto conta. Sua doação é uma semente do bem.<br />Juntos, podemos ir ainda mais longe!</p>
          </div>
        </div>
        <div className={styles.doacaoCenter}>
          <p className={styles.pixLabel}>Doações (PIX/CNPJ):</p>
          <p className={styles.pixKey}>30.617.357/0001-84</p>
          <button onClick={copiarPix} className={styles.btnCopiarPix}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} style={{ marginRight: 8 }} />
            {copied ? "Copiado!" : "Copiar chave PIX"}
          </button>
        </div>
        <div className={styles.doacaoRight}>

          {/* ── QR CODE EDITÁVEL ── */}
          <EditableImage
            value={content.images.qrcode}
            onSave={v => updateImage("qrcode", v)}
            className={styles.qrWrapper}
            placeholder={
              <>
                <FontAwesomeIcon icon={faQrcode} style={{ fontSize: "2.5rem", color: "#ccc" }} />
                <small>QR Code PIX</small>
              </>
            }
          />

          <div className={styles.pixBenefits}>
            <p><FontAwesomeIcon icon={faCheck} style={{ color: "#E09A3E", marginRight: 8 }} />É rápido</p>
            <p><FontAwesomeIcon icon={faCheck} style={{ color: "#E09A3E", marginRight: 8 }} />É seguro</p>
            <p><FontAwesomeIcon icon={faCheck} style={{ color: "#E09A3E", marginRight: 8 }} />Faz a diferença</p>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className={styles.section}>
        <p className={styles.eyebrow}>Depoimentos</p>
        <h2 className={styles.depoTitle}>
          Histórias que nos <span>inspiram</span> todos os dias
        </h2>
        <div className={styles.depoWrapper}>
          <button className={styles.depoNav} onClick={() => setActiveDepo(p => (p - 1 + content.depoimentos.length) % content.depoimentos.length)}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className={styles.depoGrid}>
            {content.depoimentos.map((d, i) => (
              <div key={i} className={`${styles.depoCard} ${i === activeDepo ? styles.depoActive : ""}`}>
                {isAdm && (
                  <button className={styles.deleteBtn} onClick={() => removeDepo(i)} title="Excluir depoimento">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
                <FontAwesomeIcon icon={faQuoteLeft} className={styles.depoQuoteIcon} />
                <p><EditableText value={d.texto} onSave={v => updateDepo(i, "texto", v)} multiline /></p>
                <div className={styles.depoAuthor}>
                  <div className={styles.depoAvatar}>{d.nome[0]}</div>
                  <div>
                    <strong><EditableText value={d.nome} onSave={v => updateDepo(i, "nome", v)} /></strong>
                    <small><EditableText value={d.cargo} onSave={v => updateDepo(i, "cargo", v)} /></small>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.depoNav} onClick={() => setActiveDepo(p => (p + 1) % content.depoimentos.length)}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        {isAdm && (
          <button className={styles.addDepoBtn} onClick={addDepo}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
            Adicionar depoimento
          </button>
        )}
        <div className={styles.depoDots}>
          {content.depoimentos.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === activeDepo ? styles.dotActive : ""}`} onClick={() => setActiveDepo(i)} />
          ))}
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section className={styles.sectionAlt} id="contato">
        <div className={styles.sectionInner}>
          <p className={styles.eyebrow}>Entre em Contato</p>
          <div className={styles.contatoGrid}>
            <a href={`https://wa.me/55${content.contato.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className={styles.contatoItem}>
              <div className={styles.contatoIconWrap} style={{ background: "#e8f5e9" }}>
                <FontAwesomeIcon icon={faWhatsapp} style={{ color: "#2e7d32" }} />
              </div>
              <div>
                <strong>WhatsApp</strong>
                <span><EditableText value={content.contato.whatsapp} onSave={v => updateContato("whatsapp", v)} /></span>
              </div>
            </a>
            <a href={`https://instagram.com/${content.contato.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className={styles.contatoItem}>
              <div className={styles.contatoIconWrap} style={{ background: "#fce4ec" }}>
                <FontAwesomeIcon icon={faInstagram} style={{ color: "#c2185b" }} />
              </div>
              <div>
                <strong>Instagram</strong>
                <span><EditableText value={content.contato.instagram} onSave={v => updateContato("instagram", v)} /></span>
              </div>
            </a>
            <a href={`mailto:${content.contato.email}`} className={styles.contatoItem}>
              <div className={styles.contatoIconWrap} style={{ background: "#e3f2fd" }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ color: "#1565c0" }} />
              </div>
              <div>
                <strong>E-mail</strong>
                <span><EditableText value={content.contato.email} onSave={v => updateContato("email", v)} /></span>
              </div>
            </a>
            <div className={styles.contatoItem}>
              <div className={styles.contatoIconWrap} style={{ background: "#fdecea" }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: "#800020" }} />
              </div>
              <div>
                <strong>Endereço</strong>
                <span><EditableText value={content.contato.endereco} onSave={v => updateContato("endereco", v)} /></span>
              </div>
            </div>
          </div>
          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.468707198754!2d-47.9678!3d-15.8845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDUzJzAyLjQiUyA0N8KwNTgnMDQuMSJX!5e0!3m2!1spt-BR!2sbr!4v1600000000000!5m2!1spt-BR!2sbr"
              width="100%" height="280"
              style={{ border: 0, borderRadius: 16 }}
              allowFullScreen loading="lazy"
              title="Mapa Instituto Umanizzare"
            />
          </div>
        </div>
      </section>

    </main>
  );
}