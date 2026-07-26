/*
 * store.js — Camada de dados e regras de negócio do AgendaFácil
 * Persistência em localStorage, utilidades de data e cálculo de disponibilidade.
 */

/* ---------- Utilidades de data ---------- */

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/* Converte um objeto Date em string ISO local (YYYY-MM-DD), sem fuso UTC. */
function isoDaData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/* Converte string ISO (YYYY-MM-DD) em objeto Date local (meia-noite). */
function dataDoIso(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/* Formata ISO como "sexta, 25 de julho" (sem ano). */
function formatarDataExtenso(iso) {
  const d = dataDoIso(iso);
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/* Formata ISO como "25/07/2026". */
function formatarDataBR(iso) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* Converte "HH:MM" em minutos desde a meia-noite. */
function horaParaMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/* Converte minutos desde a meia-noite em "HH:MM". */
function minutosParaHora(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/* Data ISO de hoje (meia-noite local). */
function hojeIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return isoDaData(d);
}

/* Retorna a segunda-feira da semana que contém a data informada. */
function inicioDaSemana(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();                 // 0 = domingo
  const diff = dow === 0 ? -6 : 1 - dow;  // recua até segunda
  d.setDate(d.getDate() + diff);
  return d;
}

/* Formata preço em reais: 60 -> "R$ 60,00". */
function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

/* ---------- Persistência (localStorage) ---------- */

/* Carrega a lista de agendamentos. Retorna [] se vazio ou indisponível. */
function carregarAgendamentos() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? JSON.parse(bruto) : [];
  } catch (e) {
    console.warn("Não foi possível ler os agendamentos:", e);
    return [];
  }
}

/* Salva a lista completa de agendamentos. */
function salvarAgendamentos(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (e) {
    console.warn("Não foi possível salvar os agendamentos:", e);
  }
}

/* Adiciona um agendamento e persiste. Retorna o objeto salvo. */
function adicionarAgendamento(ag) {
  const lista = carregarAgendamentos();
  lista.push(ag);
  salvarAgendamentos(lista);
  return ag;
}

/* Remove um agendamento pelo id e persiste. */
function removerAgendamento(id) {
  const lista = carregarAgendamentos().filter((a) => a.id !== id);
  salvarAgendamentos(lista);
}

/*
 * Carrega os dados de exemplo apenas na primeira visita.
 * Usa uma flag separada para não recriar se o usuário apagar tudo depois.
 */
function semearDadosSeNecessario() {
  const jaSemeado = localStorage.getItem(STORAGE_SEED);
  const temAgendamentos = carregarAgendamentos().length > 0;
  if (!jaSemeado && !temAgendamentos) {
    salvarAgendamentos(gerarDadosExemplo());
    localStorage.setItem(STORAGE_SEED, "1");
  }
}

/* ---------- Regras de disponibilidade ---------- */

/* Retorna os profissionais que atendem um determinado serviço. */
function profissionaisDoServico(servicoId) {
  return PROFISSIONAIS.filter((p) => p.servicos.includes(servicoId));
}

/* Gera todos os slots de início possíveis para uma data (ignora ocupação). */
function slotsDoDia(iso) {
  const d = dataDoIso(iso);
  const regra = FUNCIONAMENTO[d.getDay()];
  if (!regra || regra.fechado) return [];
  const slots = [];
  for (let m = regra.inicio; m < regra.fim; m += INTERVALO_SLOT) {
    slots.push(minutosParaHora(m));
  }
  return slots;
}

/* Verifica se a data está fechada (sem funcionamento). */
function diaFechado(iso) {
  const regra = FUNCIONAMENTO[dataDoIso(iso).getDay()];
  return !regra || regra.fechado;
}

/*
 * Retorna os agendamentos de um profissional em uma data específica.
 */
function agendamentosDoProfissional(profissionalId, iso, lista) {
  const base = lista || carregarAgendamentos();
  return base.filter((a) => a.profissionalId === profissionalId && a.data === iso);
}

/*
 * Verifica se um intervalo [inicio, inicio+duracao) conflita com algum
 * agendamento existente do profissional naquela data.
 */
function temConflito(profissionalId, iso, horaInicio, duracao, lista) {
  const inicio = horaParaMinutos(horaInicio);
  const fim = inicio + duracao;
  const existentes = agendamentosDoProfissional(profissionalId, iso, lista);
  return existentes.some((a) => {
    const ai = horaParaMinutos(a.hora);
    const af = ai + a.duracao;
    return inicio < af && ai < fim; // sobreposição de intervalos
  });
}

/*
 * Retorna a grade de horários de uma data para um profissional/serviço,
 * marcando cada slot como disponível ou não. Um slot só é disponível se:
 *  - o serviço cabe dentro do horário de funcionamento;
 *  - não há conflito com outro agendamento;
 *  - o horário ainda não passou (para a data de hoje).
 */
function gradeHorarios(profissionalId, iso, duracao) {
  const d = dataDoIso(iso);
  const regra = FUNCIONAMENTO[d.getDay()];
  if (!regra || regra.fechado) return [];

  const lista = carregarAgendamentos();
  const agora = new Date();
  const ehHoje = iso === hojeIso();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  const grade = [];
  for (let m = regra.inicio; m < regra.fim; m += INTERVALO_SLOT) {
    const hora = minutosParaHora(m);
    const cabeNoExpediente = m + duracao <= regra.fim;
    const jaPassou = ehHoje && m <= minutosAgora;
    const conflito = temConflito(profissionalId, iso, hora, duracao, lista);
    grade.push({
      hora,
      disponivel: cabeNoExpediente && !conflito && !jaPassou,
      motivo: !cabeNoExpediente ? "fecha" : jaPassou ? "passou" : conflito ? "ocupado" : "",
    });
  }
  return grade;
}

/* Gera um id único simples para novos agendamentos. */
function novoId() {
  return "ag-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}
