/*
 * app.js — Interface e interação do AgendaFácil
 * Controla a navegação, o assistente de agendamento e o painel administrativo.
 * Depende de data.js e store.js (carregados antes deste arquivo).
 */

/* Atalho para document.querySelector / getElementById */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const el = (id) => document.getElementById(id);

/* ============================================================
 * Biblioteca de ícones SVG (estilo Lucide, traço fino)
 * Substitui os emojis de interface por ícones vetoriais consistentes.
 * ============================================================ */
const ICONES = {
  "check":       '<polyline points="20 6 9 17 4 12"/>',
  "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  "arrow-left":  '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  "chevron-left":  '<polyline points="15 18 9 12 15 6"/>',
  "chevron-right": '<polyline points="9 18 15 12 9 6"/>',
  "clock":       '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  "calendar":    '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  "calendar-off":'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="4" y1="4" x2="20" y2="20"/>',
  "scissors":    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  "star":        '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  "user":        '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  "users":       '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  "search":      '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  "phone":       '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  "sparkles":    '<path d="M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18l-1.9-5.4L4 10.7l6.1-1.9L12 3z"/>',
  "palette":     '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.15-.75-.4-1-.24-.25-.39-.6-.39-1 0-.8.67-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.96-4.5-9-10-9z"/>',
  "bars-chart":  '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  "sun":         '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  "moon":        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  "inbox":       '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
};

/* Monta o markup de um ícone SVG. `nome` = chave de ICONES, `tam` = px. */
function ic(nome, tam) {
  const s = tam || 20;
  return `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ""}</svg>`;
}

/* Ícone temático de cada serviço (por id), no lugar dos emojis. */
const SERVICO_ICONE = {
  corte:       "scissors",
  barba:       "scissors",
  coloracao:   "palette",
  escova:      "sparkles",
  manicure:    "sparkles",
  limpeza:     "sparkles",
  massagem:    "user",
  sobrancelha: "sparkles",
};
function iconeServico(servicoId, tam) {
  return ic(SERVICO_ICONE[servicoId] || "sparkles", tam);
}

/* ============================================================
 * Fotos reais (conteúdo)
 * Serviços e profissionais são CONTEÚDO, então aparecem como foto.
 * Se por algum motivo a foto não estiver cadastrada, cai de volta no
 * ícone SVG — assim a interface nunca fica quebrada.
 * ============================================================ */

/* Miniatura arredondada do serviço, usada nos resumos e na lista do painel. */
function miniServico(servicoId, extra) {
  const s = SERVICOS.find((x) => x.id === servicoId);
  if (!s || !s.foto) return iconeServico(servicoId, 16);
  return `<img class="mini-foto ${extra || ""}" src="${s.foto}" alt="${s.fotoAlt}" loading="lazy" decoding="async" />`;
}

/* Miniatura circular (retrato) do profissional. */
function miniProfissional(profissionalId, extra) {
  const p = PROFISSIONAIS.find((x) => x.id === profissionalId);
  if (!p || !p.foto) return ic("user", 16);
  return `<img class="mini-foto mini-foto--circ ${extra || ""}" src="${p.foto}" alt="${p.fotoAlt}" loading="lazy" decoding="async" />`;
}

/* Estado do agendamento em construção */
let reserva = {
  servicoId: null,
  profissionalId: null,
  data: null,
  hora: null,
  clienteNome: "",
  clienteTelefone: "",
};
let passoAtual = 1;

/* Estado do painel administrativo */
let adminPeriodo = "dia";        // "dia" | "semana"
let adminBusca = "";
let semanaCalendario = inicioDaSemana(new Date()); // segunda-feira exibida no calendário

/* ============================================================
 * Inicialização
 * ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  aplicarTemaSalvo();
  semearDadosSeNecessario();
  configurarNavegacao();
  configurarTema();
  configurarAssistente();
  configurarAdmin();
  renderServicos();
  irParaPasso(1);
  mostrarView("agendar");
});

/* ============================================================
 * Tema claro/escuro
 * ============================================================ */
function aplicarTemaSalvo() {
  const salvo = localStorage.getItem(STORAGE_TEMA);
  if (salvo === "claro" || salvo === "escuro") {
    document.documentElement.setAttribute("data-tema", salvo);
  }
  atualizarIconeTema();
}

function configurarTema() {
  el("btn-tema").addEventListener("click", () => {
    const atual = document.documentElement.getAttribute("data-tema");
    // Descobre o tema efetivo considerando a preferência do sistema.
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const efetivo = atual || (prefereEscuro ? "escuro" : "claro");
    const novo = efetivo === "escuro" ? "claro" : "escuro";
    document.documentElement.setAttribute("data-tema", novo);
    localStorage.setItem(STORAGE_TEMA, novo);
    atualizarIconeTema();
  });
}

function atualizarIconeTema() {
  const atual = document.documentElement.getAttribute("data-tema");
  const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const efetivo = atual || (prefereEscuro ? "escuro" : "claro");
  el("btn-tema").innerHTML = efetivo === "escuro" ? ic("sun", 20) : ic("moon", 20);
  el("btn-tema").setAttribute("aria-label", efetivo === "escuro" ? "Ativar tema claro" : "Ativar tema escuro");
}

/* ============================================================
 * Navegação entre as views (Agendar / Administração)
 * ============================================================ */
function configurarNavegacao() {
  $$(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => mostrarView(btn.dataset.view));
  });
}

function mostrarView(view) {
  $$(".nav-tab").forEach((btn) => {
    const ativo = btn.dataset.view === view;
    btn.classList.toggle("ativo", ativo);
    btn.setAttribute("aria-selected", ativo ? "true" : "false");
  });
  el("view-agendar").hidden = view !== "agendar";
  el("view-admin").hidden = view !== "admin";
  if (view === "admin") renderAdmin();
}

/* ============================================================
 * Assistente de agendamento (cliente)
 * ============================================================ */
function configurarAssistente() {
  // Botões "voltar" de cada passo
  $$("[data-voltar]").forEach((btn) => {
    btn.addEventListener("click", () => irParaPasso(Number(btn.dataset.voltar)));
  });

  // Seletor de data
  el("seletor-data").addEventListener("change", (e) => {
    if (e.target.value) selecionarData(e.target.value);
  });

  // Formulário do cliente
  el("form-cliente").addEventListener("submit", (e) => {
    e.preventDefault();
    confirmarAgendamento();
  });

  // Botão "novo agendamento" na tela de sucesso
  el("btn-novo").addEventListener("click", () => {
    reiniciarReserva();
  });
}

/* Move o assistente para o passo indicado e atualiza a barra de progresso. */
function irParaPasso(n) {
  passoAtual = n;
  ["passo-1", "passo-2", "passo-3", "passo-4", "passo-sucesso"].forEach((id) => {
    el(id).hidden = true;
  });
  if (n === 99) {
    el("passo-sucesso").hidden = false;
  } else {
    el("passo-" + n).hidden = false;
  }
  atualizarStepper(n);
  // Rola suavemente ao topo do cartão do assistente.
  const topo = el("assistente");
  if (topo) topo.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Atualiza os indicadores visuais de progresso (1..4). */
function atualizarStepper(n) {
  const passo = n === 99 ? 5 : n;
  $$("#stepper .step").forEach((s) => {
    const num = Number(s.dataset.step);
    s.classList.toggle("concluido", num < passo);
    s.classList.toggle("atual", num === passo);
  });
}

/* ----- Passo 1: escolher serviço ----- */
function renderServicos() {
  const cont = el("grade-servicos");
  cont.innerHTML = "";
  SERVICOS.forEach((s) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card-servico" + (reserva.servicoId === s.id ? " selecionado" : "");
    card.setAttribute("aria-pressed", reserva.servicoId === s.id ? "true" : "false");
    // Capa: foto real do serviço. Sem foto cadastrada, volta ao selo com ícone.
    const capa = s.foto
      ? `<span class="card-servico__capa">
           <img src="${s.foto}" alt="${s.fotoAlt}" loading="lazy" decoding="async" />
           <span class="card-servico__marca" aria-hidden="true">${ic("check", 15)}</span>
         </span>`
      : `<span class="card-servico__icone" aria-hidden="true">${iconeServico(s.id, 24)}</span>`;
    card.innerHTML = `
      ${capa}
      <span class="card-servico__info">
        <span class="card-servico__nome">${s.nome}</span>
        <span class="card-servico__desc">${s.desc}</span>
        <span class="card-servico__meta">
          <span class="tag">${ic("clock", 14)} ${s.duracao} min</span>
          <span class="preco">${formatarPreco(s.preco)}</span>
        </span>
      </span>`;
    card.addEventListener("click", () => selecionarServico(s.id));
    cont.appendChild(card);
  });
}

function selecionarServico(id) {
  reserva.servicoId = id;
  // Se o profissional atual não atende esse serviço, limpa a seleção.
  if (reserva.profissionalId) {
    const prof = PROFISSIONAIS.find((p) => p.id === reserva.profissionalId);
    if (!prof || !prof.servicos.includes(id)) reserva.profissionalId = null;
  }
  renderServicos();
  renderProfissionais();
  irParaPasso(2);
}

/* ----- Passo 2: escolher profissional ----- */
function renderProfissionais() {
  const servico = SERVICOS.find((s) => s.id === reserva.servicoId);
  el("resumo-servico-topo").innerHTML = servico
    ? `<span class="resumo-topo__capa">${miniServico(servico.id, "mini-foto--md")}</span>
       <span class="resumo-topo__txt"><strong>${servico.nome}</strong>
       <span class="mini-sep">•</span> ${servico.duracao} min
       <span class="mini-sep">•</span> ${formatarPreco(servico.preco)}</span>`
    : "";

  const cont = el("grade-profissionais");
  cont.innerHTML = "";
  const disponiveis = profissionaisDoServico(reserva.servicoId);
  disponiveis.forEach((p) => {
    const iniciais = p.nome.split(" ").slice(0, 2).map((n) => n[0]).join("");
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card-prof" + (reserva.profissionalId === p.id ? " selecionado" : "");
    card.setAttribute("aria-pressed", reserva.profissionalId === p.id ? "true" : "false");
    // Retrato circular real do profissional; sem foto, mantém as iniciais coloridas.
    const retrato = p.foto
      ? `<span class="card-prof__foto" style="--cor:${p.cor}">
           <img src="${p.foto}" alt="${p.fotoAlt}" loading="lazy" decoding="async" />
         </span>`
      : `<span class="avatar" style="--cor:${p.cor}" aria-hidden="true">${iniciais}</span>`;
    card.innerHTML = `
      ${retrato}
      <span class="card-prof__info">
        <span class="card-prof__nome">${p.nome}</span>
        <span class="card-prof__cargo">${p.cargo}</span>
      </span>`;
    card.addEventListener("click", () => selecionarProfissional(p.id));
    cont.appendChild(card);
  });
}

function selecionarProfissional(id) {
  reserva.profissionalId = id;
  renderProfissionais();
  // Define uma data inicial: hoje (ou o próximo dia aberto).
  const inputData = el("seletor-data");
  inputData.min = hojeIso();
  if (!reserva.data || dataDoIso(reserva.data) < dataDoIso(hojeIso())) {
    reserva.data = proximoDiaAberto(hojeIso());
  }
  inputData.value = reserva.data;
  renderPasso3();
  irParaPasso(3);
}

/* Retorna o próximo dia (a partir do ISO informado) em que há atendimento. */
function proximoDiaAberto(iso) {
  let d = dataDoIso(iso);
  for (let i = 0; i < 14; i++) {
    if (!diaFechado(isoDaData(d))) return isoDaData(d);
    d.setDate(d.getDate() + 1);
  }
  return iso;
}

/* ----- Passo 3: escolher data e horário ----- */
function renderPasso3() {
  renderDiasRapidos();
  renderHorarios();
}

/* Chips de acesso rápido para os próximos dias abertos. */
function renderDiasRapidos() {
  const cont = el("dias-rapidos");
  cont.innerHTML = "";
  const base = dataDoIso(hojeIso());
  let adicionados = 0;
  for (let i = 0; i < 21 && adicionados < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const iso = isoDaData(d);
    if (diaFechado(iso)) continue;
    adicionados++;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip-dia" + (reserva.data === iso ? " selecionado" : "");
    chip.innerHTML = `
      <span class="chip-dia__semana">${i === 0 ? "Hoje" : DIAS_SEMANA_CURTO[d.getDay()]}</span>
      <span class="chip-dia__num">${d.getDate()}</span>
      <span class="chip-dia__mes">${MESES[d.getMonth()].slice(0, 3)}</span>`;
    chip.addEventListener("click", () => selecionarData(iso));
    cont.appendChild(chip);
  }
}

function selecionarData(iso) {
  reserva.data = iso;
  reserva.hora = null;
  el("seletor-data").value = iso;
  renderDiasRapidos();
  renderHorarios();
}

/* Renderiza a grade de horários disponíveis para a data/profissional. */
function renderHorarios() {
  const cont = el("grade-horarios");
  const info = el("info-funcionamento");
  cont.innerHTML = "";

  const servico = SERVICOS.find((s) => s.id === reserva.servicoId);
  if (!reserva.data || !servico) return;

  if (diaFechado(reserva.data)) {
    info.textContent = "Estabelecimento fechado nesta data. Escolha outro dia.";
    cont.innerHTML = `<p class="aviso-vazio">${ic("calendar-off", 28)}Sem atendimento neste dia.</p>`;
    return;
  }

  const grade = gradeHorarios(reserva.profissionalId, reserva.data, servico.duracao);
  const disponiveis = grade.filter((g) => g.disponivel).length;
  info.innerHTML = `${ic("calendar", 16)} <strong>${formatarDataExtenso(reserva.data)}</strong> —
    ${disponiveis} horário${disponiveis === 1 ? "" : "s"} disponíve${disponiveis === 1 ? "l" : "is"}`;

  if (disponiveis === 0) {
    cont.innerHTML = `<p class="aviso-vazio">${ic("clock", 28)}Nenhum horário livre nesta data. Tente outro dia.</p>`;
    return;
  }

  grade.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot" + (reserva.hora === slot.hora ? " selecionado" : "");
    btn.disabled = !slot.disponivel;
    if (!slot.disponivel) btn.classList.add("indisponivel");
    btn.textContent = slot.hora;
    if (!slot.disponivel && slot.motivo === "ocupado") btn.title = "Horário já reservado";
    btn.addEventListener("click", () => selecionarHora(slot.hora));
    cont.appendChild(btn);
  });
}

function selecionarHora(hora) {
  reserva.hora = hora;
  renderHorarios();
  renderPasso4();
  irParaPasso(4);
}

/* ----- Passo 4: confirmação ----- */
function renderPasso4() {
  const servico = SERVICOS.find((s) => s.id === reserva.servicoId);
  const prof = PROFISSIONAIS.find((p) => p.id === reserva.profissionalId);
  const fim = minutosParaHora(horaParaMinutos(reserva.hora) + servico.duracao);

  el("resumo-agendamento").innerHTML = `
    <h3 class="resumo__titulo">Resumo do agendamento</h3>
    <dl class="resumo__lista">
      <div><dt>Serviço</dt><dd>${miniServico(servico.id)} ${servico.nome}</dd></div>
      <div><dt>Profissional</dt><dd>${miniProfissional(prof.id)} ${prof.nome}</dd></div>
      <div><dt>Data</dt><dd>${formatarDataExtenso(reserva.data)}</dd></div>
      <div><dt>Horário</dt><dd>${reserva.hora} às ${fim} (${servico.duracao} min)</dd></div>
      <div class="resumo__total"><dt>Valor</dt><dd>${formatarPreco(servico.preco)}</dd></div>
    </dl>`;

  // Preenche o formulário com dados já digitados (caso o usuário volte).
  el("cliente-nome").value = reserva.clienteNome;
  el("cliente-telefone").value = reserva.clienteTelefone;
}

function confirmarAgendamento() {
  const nome = el("cliente-nome").value.trim();
  const telefone = el("cliente-telefone").value.trim();
  if (nome.length < 2) {
    el("cliente-nome").focus();
    mostrarToast("Informe o nome do cliente.", "erro");
    return;
  }
  reserva.clienteNome = nome;
  reserva.clienteTelefone = telefone;

  const servico = SERVICOS.find((s) => s.id === reserva.servicoId);
  const prof = PROFISSIONAIS.find((p) => p.id === reserva.profissionalId);

  // Revalida o conflito no momento da confirmação (segurança extra).
  if (temConflito(reserva.profissionalId, reserva.data, reserva.hora, servico.duracao)) {
    mostrarToast("Ops! Esse horário acabou de ser ocupado. Escolha outro.", "erro");
    renderHorarios();
    irParaPasso(3);
    return;
  }

  const ag = {
    id: novoId(),
    servicoId: servico.id,
    servicoNome: servico.nome,
    duracao: servico.duracao,
    preco: servico.preco,
    profissionalId: prof.id,
    profissionalNome: prof.nome,
    data: reserva.data,
    hora: reserva.hora,
    clienteNome: nome,
    clienteTelefone: telefone,
    criadoEm: new Date().toISOString(),
  };
  adicionarAgendamento(ag);
  renderSucesso(ag);
  irParaPasso(99);
  mostrarToast("Agendamento confirmado!", "ok");
}

function renderSucesso(ag) {
  const servico = SERVICOS.find((s) => s.id === ag.servicoId);
  const fim = minutosParaHora(horaParaMinutos(ag.hora) + ag.duracao);
  el("detalhes-sucesso").innerHTML = `
    <dl class="resumo__lista">
      <div><dt>Cliente</dt><dd>${ag.clienteNome}</dd></div>
      <div><dt>Serviço</dt><dd>${miniServico(ag.servicoId)} ${ag.servicoNome}</dd></div>
      <div><dt>Profissional</dt><dd>${miniProfissional(ag.profissionalId)} ${ag.profissionalNome}</dd></div>
      <div><dt>Data</dt><dd>${formatarDataExtenso(ag.data)}</dd></div>
      <div><dt>Horário</dt><dd>${ag.hora} às ${fim}</dd></div>
      <div class="resumo__total"><dt>Valor</dt><dd>${formatarPreco(ag.preco)}</dd></div>
    </dl>`;
}

/* Reinicia o assistente para um novo agendamento (mantém o cliente vazio). */
function reiniciarReserva() {
  reserva = { servicoId: null, profissionalId: null, data: null, hora: null, clienteNome: "", clienteTelefone: "" };
  el("form-cliente").reset();
  renderServicos();
  irParaPasso(1);
}

/* ============================================================
 * Painel administrativo
 * ============================================================ */
function configurarAdmin() {
  $$("#filtro-periodo button").forEach((btn) => {
    btn.addEventListener("click", () => {
      adminPeriodo = btn.dataset.periodo;
      $$("#filtro-periodo button").forEach((b) => b.classList.toggle("ativo", b === btn));
      renderAdmin();
    });
  });

  el("busca-cliente").addEventListener("input", (e) => {
    adminBusca = e.target.value.trim().toLowerCase();
    renderListaAgendamentos();
  });

  el("cal-prev").addEventListener("click", () => moverSemana(-7));
  el("cal-next").addEventListener("click", () => moverSemana(7));
  el("cal-hoje").addEventListener("click", () => {
    semanaCalendario = inicioDaSemana(new Date());
    renderCalendario();
  });
}

function moverSemana(dias) {
  semanaCalendario.setDate(semanaCalendario.getDate() + dias);
  renderCalendario();
}

function renderAdmin() {
  renderEstatisticas();
  renderListaAgendamentos();
  renderCalendario();
}

/* Retorna os agendamentos do período ativo (dia atual ou semana atual). */
function agendamentosDoPeriodo() {
  const lista = carregarAgendamentos();
  if (adminPeriodo === "dia") {
    const hoje = hojeIso();
    return lista.filter((a) => a.data === hoje);
  }
  // semana atual (segunda a domingo contendo hoje)
  const ini = inicioDaSemana(new Date());
  const fim = new Date(ini);
  fim.setDate(fim.getDate() + 6);
  const iniIso = isoDaData(ini);
  const fimIso = isoDaData(fim);
  return lista.filter((a) => a.data >= iniIso && a.data <= fimIso);
}

function renderEstatisticas() {
  const lista = agendamentosDoPeriodo();
  const total = lista.length;
  const faturamento = lista.reduce((soma, a) => soma + a.preco, 0);

  // Serviço mais pedido no período
  let popular = "—";
  if (total > 0) {
    const contagem = {};
    lista.forEach((a) => { contagem[a.servicoNome] = (contagem[a.servicoNome] || 0) + 1; });
    let melhor = 0;
    for (const nome in contagem) {
      if (contagem[nome] > melhor) { melhor = contagem[nome]; popular = nome; }
    }
    popular += ` (${melhor}×)`;
  }

  const rotuloPeriodo = adminPeriodo === "dia" ? "hoje" : "nesta semana";
  el("stat-total").textContent = total;
  el("stat-total-rotulo").textContent = "Agendamentos " + rotuloPeriodo;
  el("stat-faturamento").textContent = formatarPreco(faturamento);
  el("stat-faturamento-rotulo").textContent = "Faturamento estimado " + rotuloPeriodo;
  el("stat-popular").textContent = popular;
}

function renderListaAgendamentos() {
  const cont = el("lista-agendamentos");
  let lista = agendamentosDoPeriodo();

  if (adminBusca) {
    lista = lista.filter((a) => a.clienteNome.toLowerCase().includes(adminBusca));
  }

  // Ordena por data e depois por horário.
  lista.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  el("lista-contador").textContent = lista.length + (lista.length === 1 ? " agendamento" : " agendamentos");

  if (lista.length === 0) {
    cont.innerHTML = `<p class="aviso-vazio">${ic("inbox", 28)}Nenhum agendamento encontrado${adminBusca ? " para \"" + adminBusca + "\"" : ""}.</p>`;
    return;
  }

  cont.innerHTML = "";
  lista.forEach((a) => {
    const prof = PROFISSIONAIS.find((p) => p.id === a.profissionalId);
    const cor = prof ? prof.cor : "#888";
    const fim = minutosParaHora(horaParaMinutos(a.hora) + a.duracao);
    const linha = document.createElement("article");
    linha.className = "ag-item";
    linha.style.setProperty("--cor", cor);
    linha.innerHTML = `
      <div class="ag-item__hora">
        <strong>${a.hora}</strong>
        <span>${fim}</span>
      </div>
      <div class="ag-item__corpo">
        <div class="ag-item__topo">
          <span class="ag-item__servico">${miniServico(a.servicoId, "mini-foto--sm")} ${a.servicoNome}</span>
          <span class="ag-item__preco">${formatarPreco(a.preco)}</span>
        </div>
        <div class="ag-item__meta">
          <span>${ic("user", 14)} ${a.clienteNome}</span>
          <span class="ag-item__prof">${miniProfissional(a.profissionalId, "mini-foto--xs")} ${a.profissionalNome}</span>
          ${adminPeriodo === "semana" ? `<span>${ic("calendar", 14)} ${formatarDataBR(a.data)}</span>` : ""}
          ${a.clienteTelefone ? `<span>${ic("phone", 14)} ${a.clienteTelefone}</span>` : ""}
        </div>
      </div>
      <button class="btn-cancelar" type="button" aria-label="Cancelar agendamento de ${a.clienteNome}">Cancelar</button>`;
    linha.querySelector(".btn-cancelar").addEventListener("click", () => cancelarAgendamento(a.id, a.clienteNome));
    cont.appendChild(linha);
  });
}

function cancelarAgendamento(id, nome) {
  const ok = window.confirm(`Cancelar o agendamento de ${nome}?`);
  if (!ok) return;
  removerAgendamento(id);
  renderAdmin();
  mostrarToast("Agendamento cancelado.", "ok");
}

/* ----- Calendário semanal ----- */
function renderCalendario() {
  const cont = el("calendario-semana");
  cont.innerHTML = "";

  const ini = new Date(semanaCalendario);
  const fim = new Date(ini);
  fim.setDate(fim.getDate() + 6);
  el("cal-titulo").textContent =
    `${ini.getDate()} de ${MESES[ini.getMonth()]} – ${fim.getDate()} de ${MESES[fim.getMonth()]}`;

  const lista = carregarAgendamentos();
  const hoje = hojeIso();

  // Mostra os 6 dias úteis (segunda a sábado); domingo é fechado.
  for (let i = 0; i < 6; i++) {
    const d = new Date(ini);
    d.setDate(d.getDate() + i);
    const iso = isoDaData(d);
    const doDia = lista
      .filter((a) => a.data === iso)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    const coluna = document.createElement("div");
    coluna.className = "cal-coluna" + (iso === hoje ? " cal-coluna--hoje" : "");
    let itens = doDia.map((a) => {
      const prof = PROFISSIONAIS.find((p) => p.id === a.profissionalId);
      const cor = prof ? prof.cor : "#888";
      return `<div class="cal-evento" style="--cor:${cor}" title="${a.hora} ${a.servicoNome} — ${a.clienteNome}">
                <span class="cal-evento__hora">${a.hora}</span>
                <span class="cal-evento__nome">${a.clienteNome.split(" ")[0]}</span>
              </div>`;
    }).join("");
    if (doDia.length === 0) itens = `<div class="cal-livre">livre</div>`;

    coluna.innerHTML = `
      <div class="cal-cabecalho">
        <span class="cal-dia-semana">${DIAS_SEMANA_CURTO[d.getDay()]}</span>
        <span class="cal-dia-num">${d.getDate()}</span>
        <span class="cal-dia-total">${doDia.length}</span>
      </div>
      <div class="cal-eventos">${itens}</div>`;
    cont.appendChild(coluna);
  }
}

/* ============================================================
 * Toast (notificação temporária)
 * ============================================================ */
let toastTimer = null;
function mostrarToast(mensagem, tipo) {
  const t = el("toast");
  t.textContent = mensagem;
  t.className = "toast visivel " + (tipo === "erro" ? "toast--erro" : "toast--ok");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = "toast"; }, 3200);
}
