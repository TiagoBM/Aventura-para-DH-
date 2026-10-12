// Trono Carmesim: Medo. Barra de Medo com olhos de Groetus.
// Le o Medo do sistema Daggerheart (configuracao "ResourcesFear") e mostra uma fileira de olhos:
// os primeiros N estao abertos (N = Medo atual). So o mestre altera o Medo (clicando num olho ou nos botoes + e -).
const MOD = "trono-carmesim-medo";
const IMG = (n) => `modules/${MOD}/assets/${n}`;
const ASPECTO = 300 / 457;                 // largura / altura da imagem do olho

/* ---------------- Medo do sistema ---------------- */
const sysId = () => CONFIG.DH?.id ?? "daggerheart";
const fearKey = () => CONFIG.DH?.SETTINGS?.gameSettings?.Resources?.Fear ?? "ResourcesFear";

function lerMedo() {
  try {
    let v = game.settings.get(sysId(), fearKey());
    if (v && typeof v === "object" && "value" in v) v = v.value;
    return Math.max(0, Math.round(Number(v) || 0));
  } catch (e) { return 0; }
}
function lerMax() {
  try {
    const m = game.system?.settings?.homebrew?.maxFear;
    if (Number(m) > 0) return Math.round(Number(m));
  } catch (e) { /* cai no padrao */ }
  try {
    let h = game.settings.get(sysId(), "Homebrew");
    if (typeof h === "string") h = JSON.parse(h);
    if (Number(h?.maxFear) > 0) return Math.round(Number(h.maxFear));
  } catch (e) { /* cai no padrao */ }
  return 12;
}
async function gravarMedo(valor) {
  if (!game.user.isGM) return;
  const v = Math.max(0, Math.min(lerMax(), Math.round(valor)));
  if (v === lerMedo()) return;
  try {
    if (ui.resources?.updateFear) await ui.resources.updateFear(v);
    else await game.settings.set(sysId(), fearKey(), v);
  } catch (e) {
    try { await game.settings.set(sysId(), fearKey(), v); } catch (e2) { console.error(MOD, e2); }
  }
}

/* ---------------- Configuracoes (cada usuario escolhe as suas) ---------------- */
const cfg = (k) => game.settings.get(MOD, k);
const travada = () => !!cfg("travar") || (!game.user.isGM && !!cfg("travarJogadores"));   // posicao fixa para este usuario?

Hooks.once("init", () => {
  const base = { scope: "client", config: true, onChange: () => montar() };
  game.settings.register(MOD, "visivel", { ...base, name: "Mostrar a barra de Medo", hint: "Liga ou desliga a barra so para voce.", type: Boolean, default: true });
  game.settings.register(MOD, "tamanho", { ...base, name: "Tamanho dos olhos (px)", hint: "Altura de cada olho. 60 = pequeno, 90 = medio, 140 = grande. Se a barra nao couber na tela, o modulo reduz sozinho. So para voce.", type: Number, default: 90, range: { min: 30, max: 200, step: 2 } });
  game.settings.register(MOD, "espaco", { ...base, name: "Espaco entre os olhos (px)", hint: "Valores negativos sobrepoem os olhos, como cartas em leque.", type: Number, default: 2, range: { min: -40, max: 40, step: 1 } });
  game.settings.register(MOD, "brilho", { ...base, name: "Brilho e animacoes", hint: "Olhos abertos brilham de leve; ao abrir ou fechar um olho, a barra reage.", type: Boolean, default: true });
  game.settings.register(MOD, "esconderSistema", { ...base, name: "Esconder a barra de Medo do sistema", hint: "Evita duas barras de Medo na tela.", type: Boolean, default: true });
  game.settings.register(MOD, "fundo", { ...base, name: "Fundo escuro atras da barra", hint: "Liga um painel escuro com borda atras dos olhos (ajuda a ler sobre mapas claros). Desligado por padrao.", type: Boolean, default: false });
  game.settings.register(MOD, "som", { ...base, name: "Sussurro quando o Medo sobe", hint: "Um sussurro grave e distante toca quando o Medo aumenta. So para voce.", type: Boolean, default: true });
  game.settings.register(MOD, "volume", { ...base, name: "Volume do sussurro", hint: "0 = mudo, 1 = o volume do arquivo (que ja e bem baixo). Tambem depende do volume de interface do Foundry.", type: Number, default: 1, range: { min: 0, max: 1, step: 0.05 } });
  game.settings.register(MOD, "travar", { ...base, name: "Travar a posicao", hint: "Impede de arrastar a barra sem querer.", type: Boolean, default: false });
  game.settings.register(MOD, "travarJogadores", { scope: "world", config: true, onChange: () => montar(), name: "Travar a barra dos jogadores", hint: "Impede que os jogadores arrastem a barra de Medo deles. So o mestre muda. O seu proprio 'Travar a posicao' continua pessoal.", type: Boolean, default: true });
  game.settings.register(MOD, "pos", { scope: "client", config: false, type: Object, default: {} });
  game.settings.register(MOD, "esconderDanoErro", { scope: "world", config: true, name: "Nao rolar dano quando o ataque erra", hint: "Se o ataque nao acertou o alvo, o sistema nao rola o dano (so ele e pulado: o Medo, os custos e o resto da acao continuam normais). Precisa de alvo selecionado antes do ataque. Vale para todos os jogadores.", type: Boolean, default: true });
});

/* ---------------- Interface ---------------- */
let anterior = null;     // Medo mostrado na ultima atualizacao
let ultimoSom = 0;       // evita sussurros empilhados

function sussurrar() {
  try {
    if (!cfg("som")) return;
    const agora = Date.now();
    if (agora - ultimoSom < 1500) return;
    ultimoSom = agora;
    const vol = Number(cfg("volume")) * (game.settings.get("core", "globalInterfaceVolume") ?? 1);
    if (!(vol > 0)) return;
    const n = 1 + Math.floor(Math.random() * 3);
    const AH = foundry.audio?.AudioHelper ?? globalThis.AudioHelper;
    AH.play({ src: `modules/${MOD}/assets/sussurro-${n}.wav`, volume: vol, autoplay: true, loop: false }, false);
  } catch (e) { console.warn(MOD, "nao foi possivel tocar o sussurro", e); }
}

function criarBotao(tipo, aoClicar) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `tc-btn tc-${tipo}`;
  b.textContent = tipo === "mais" ? "+" : "−";
  b.setAttribute("aria-label", tipo === "mais" ? "Aumentar o Medo" : "Diminuir o Medo");
  b.addEventListener("pointerdown", (e) => e.stopPropagation());
  b.addEventListener("click", (e) => { e.stopPropagation(); aoClicar(); });
  return b;
}

function construir(el, max) {
  el.replaceChildren();
  el.dataset.max = String(max);
  if (game.user.isGM) el.appendChild(criarBotao("menos", () => gravarMedo(lerMedo() - 1)));
  const trilho = document.createElement("div");
  trilho.className = "tc-trilho";
  for (let i = 0; i < max; i++) {
    const o = document.createElement("div");
    o.className = "tc-olho";
    o.dataset.i = String(i);
    o.innerHTML = `<img class="tc-fechado" src="${IMG("olho-fechado.png")}" alt="" draggable="false"><img class="tc-aberto" src="${IMG("olho-aberto.png")}" alt="" draggable="false">`;
    if (game.user.isGM) {
      o.title = "Clique para ajustar o Medo";
      o.addEventListener("pointerdown", (e) => e.stopPropagation());
      o.addEventListener("click", (e) => {
        e.stopPropagation();
        const n = i + 1;
        gravarMedo(lerMedo() === n ? i : n);
      });
    }
    trilho.appendChild(o);
  }
  el.appendChild(trilho);
  if (game.user.isGM) el.appendChild(criarBotao("mais", () => gravarMedo(lerMedo() + 1)));
}

function atualizar(el, atual, animar) {
  const olhos = el.querySelectorAll(".tc-olho");
  olhos.forEach((o, i) => {
    const ligado = i < atual;
    const estava = o.classList.contains("ligado");
    o.classList.toggle("ligado", ligado);
    if (animar && ligado !== estava) {
      o.classList.remove("abrindo", "fechando");
      void o.offsetWidth;                                  // reinicia a animacao
      o.classList.add(ligado ? "abrindo" : "fechando");
      o.addEventListener("animationend", () => o.classList.remove("abrindo", "fechando"), { once: true });
    }
  });
  if (animar && anterior !== null && atual > anterior) sussurrar();
  if (animar && anterior !== null && atual > anterior && cfg("brilho")) {
    el.classList.remove("tremor"); void el.offsetWidth; el.classList.add("tremor");
    el.addEventListener("animationend", (e) => { if (e.target === el) el.classList.remove("tremor"); }, { once: true });
  }
  el.setAttribute("aria-label", `Medo: ${atual} de ${olhos.length}`);
  el.dataset.medo = String(atual);
}

function montar() {
  if (!game?.ready) return;
  document.body.classList.toggle("tc-medo-sem-sistema", !!cfg("esconderSistema"));
  let el = document.getElementById("tc-medo");
  if (!cfg("visivel")) { if (el) el.hidden = true; return; }
  const max = lerMax(), atual = Math.min(lerMedo(), max);
  const primeira = !el;
  if (!el) {
    el = document.createElement("div");
    el.id = "tc-medo";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
    habilitarArrasto(el);
    // se o usuario nunca moveu a barra, mantem-na centralizada sempre que o tamanho dela mudar (imagens, fontes, ajuste automatico)
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => { const p = cfg("pos") || {}; if (!(Number.isFinite(p.left) && Number.isFinite(p.top)) && !el.hidden) posicionar(el); }).observe(el);
  }
  el.hidden = false;
  el.classList.toggle("gm", !!game.user.isGM);
  el.classList.toggle("sem-brilho", !cfg("brilho"));
  el.classList.toggle("com-fundo", !!cfg("fundo"));
  el.classList.toggle("travado", travada());
  el.style.setProperty("--tc-gap", `${cfg("espaco")}px`);
  if (el.dataset.max !== String(max)) construir(el, max);
  ajustarLargura(el);
  atualizar(el, atual, !primeira && anterior !== null);
  anterior = atual;
  posicionar(el);
}

/* Se a barra nao couber na largura da tela, reduz os olhos sozinha (a barra nunca sai da tela). */
function ajustarLargura(el) {
  let h = Number(cfg("tamanho"));
  const aplicar = (v) => { el.style.setProperty("--tc-h", `${v}px`); el.style.setProperty("--tc-w", `${(v * ASPECTO).toFixed(1)}px`); };
  aplicar(h);
  const larg = () => Math.max(el.offsetWidth, el.scrollWidth);   // scrollWidth enxerga o excesso mesmo com max-width
  for (let i = 0; i < 8 && larg() > window.innerWidth - 8 && h > 24; i++) {
    h = Math.max(24, Math.floor(h * (window.innerWidth - 8) / larg()) - 1);
    aplicar(h);
  }
}
/* ---------------- Posicao (sempre dentro da tela) ---------------- */
function limitar(el, x, y) {
  const w = el.offsetWidth, h = el.offsetHeight;
  const maxX = Math.max(0, window.innerWidth - w), maxY = Math.max(0, window.innerHeight - h);
  return { left: Math.min(Math.max(0, x), maxX), top: Math.min(Math.max(0, y), maxY) };
}
function posicionar(el) {
  const p = cfg("pos") || {};
  const padrao = { left: (window.innerWidth - el.offsetWidth) / 2, top: 12 };
  const alvo = (Number.isFinite(p.left) && Number.isFinite(p.top)) ? p : padrao;
  const { left, top } = limitar(el, alvo.left, alvo.top);
  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
}
function habilitarArrasto(el) {
  let ini = null;
  el.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || travada()) return;
    const r = el.getBoundingClientRect();
    ini = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    el.setPointerCapture?.(e.pointerId);
    el.classList.add("arrastando");
    e.preventDefault();
  });
  el.addEventListener("pointermove", (e) => {
    if (!ini) return;
    const { left, top } = limitar(el, e.clientX - ini.dx, e.clientY - ini.dy);
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
  });
  const fim = async () => {
    if (!ini) return;
    ini = null; el.classList.remove("arrastando");
    await game.settings.set(MOD, "pos", { left: parseFloat(el.style.left), top: parseFloat(el.style.top) });
  };
  el.addEventListener("pointerup", fim);
  el.addEventListener("pointercancel", fim);
}

/* ---------------- Dano so quando o ataque acerta ---------------- */
// O Daggerheart rola o dano mesmo quando o ataque erra (so nao aplica no alvo). Aqui a etapa de dano e pulada
// quando o sistema ja sabe que o ataque errou (config.roll.success === false). Pular so essa etapa NAO interrompe a acao:
// o Medo, os custos e o restante continuam sendo gravados. O botao de dano do chat (force = true) nao e afetado.
const ALVO_DANO = "game.system.api.fields.ActionFields.DamageField.execute";
function pularDanoSeErrou(wrapped, ...args) {
  try {
    const [config, , force] = args;
    if (!force && game.settings.get(MOD, "esconderDanoErro") && config?.roll?.success === false) return undefined;
  } catch (e) { console.warn(MOD, "verificacao de dano falhou; seguindo o fluxo normal", e); }
  return wrapped(...args);
}
function instalarFiltroDeDano() {
  const campo = game.system?.api?.fields?.ActionFields?.DamageField;
  if (typeof campo?.execute !== "function") {
    console.warn(MOD, "DamageField.execute nao encontrado; o ajuste de dano nao foi instalado (versao do Daggerheart diferente?).");
    if (game.user.isGM) ui.notifications.warn("Trono Carmesim: Medo: nao foi possivel instalar o ajuste de dano (versao do Daggerheart diferente). O resto do modulo funciona normalmente.");
    return;
  }
  if (globalThis.libWrapper) {
    libWrapper.register(MOD, ALVO_DANO, function (wrapped, ...args) { return pularDanoSeErrou.call(this, (...a) => wrapped.apply(this, a), ...args); }, "WRAPPER");
  } else {
    const original = campo.execute;
    campo.execute = function (...args) { return pularDanoSeErrou.call(this, (...a) => original.apply(this, a), ...args); };
  }
}

/* ---------------- Ganchos ---------------- */
Hooks.once("ready", () => {
  montar();
  instalarFiltroDeDano();
  window.addEventListener("resize", () => { const el = document.getElementById("tc-medo"); if (el && !el.hidden) { ajustarLargura(el); posicionar(el); } });
  // Macro de emergencia: TCMedo.reset()  (volta a barra para o topo, centralizada)
  window.TCMedo = {
    reset: async () => { await game.settings.set(MOD, "pos", {}); montar(); ui.notifications.info("Trono Carmesim: Medo: posicao redefinida."); },
    render: montar
  };
});

Hooks.on("updateSetting", (setting) => {
  const k = setting?.key ?? "";
  if (k === `${sysId()}.${fearKey()}` || k === `${sysId()}.Homebrew`) montar();
});
