/*
 * data.js — Dados de configuração do AgendaFácil
 * Serviços, profissionais, horário de funcionamento e dados de exemplo.
 * Tudo em escopo global (sem módulos ES) para funcionar em file:// e GitHub Pages.
 */

/* Catálogo de serviços (duração em minutos, preço em reais) */
const SERVICOS = [
  { id: "corte",        nome: "Corte de Cabelo",         duracao: 45, preco: 60,  icone: "✂️", desc: "Corte personalizado com lavagem e finalização." },
  { id: "barba",        nome: "Barba",                   duracao: 30, preco: 40,  icone: "🧔", desc: "Modelagem e aparo de barba com toalha quente." },
  { id: "coloracao",    nome: "Coloração",               duracao: 90, preco: 180, icone: "🎨", desc: "Coloração completa com produtos profissionais." },
  { id: "escova",       nome: "Escova & Hidratação",     duracao: 40, preco: 70,  icone: "💆", desc: "Escova modelada com tratamento hidratante." },
  { id: "manicure",     nome: "Manicure",                duracao: 40, preco: 45,  icone: "💅", desc: "Cuidado completo das unhas das mãos." },
  { id: "limpeza",      nome: "Limpeza de Pele",         duracao: 60, preco: 120, icone: "🧖", desc: "Limpeza profunda com extração e máscara." },
  { id: "massagem",     nome: "Massagem Relaxante",      duracao: 50, preco: 150, icone: "🌿", desc: "Massagem corporal para alívio de tensões." },
  { id: "sobrancelha",  nome: "Design de Sobrancelhas",  duracao: 20, preco: 35,  icone: "👁️", desc: "Design e correção com henna opcional." },
];

/* Equipe de profissionais. Cada um atende uma lista de serviços (por id). */
const PROFISSIONAIS = [
  { id: "ana",      nome: "Ana Beatriz Costa",     cargo: "Cabeleireira",         cor: "#7c3aed", servicos: ["corte", "coloracao", "escova"] },
  { id: "carlos",   nome: "Carlos Henrique Souza", cargo: "Barbeiro",             cor: "#0d9488", servicos: ["corte", "barba"] },
  { id: "juliana",  nome: "Juliana Ferreira",      cargo: "Manicure & Designer",  cor: "#db2777", servicos: ["manicure", "sobrancelha"] },
  { id: "patricia", nome: "Patrícia Almeida",      cargo: "Esteticista",          cor: "#ea580c", servicos: ["limpeza", "massagem", "sobrancelha"] },
  { id: "rafael",   nome: "Rafael Oliveira",       cargo: "Cabeleireiro",         cor: "#2563eb", servicos: ["corte", "coloracao", "barba", "escova"] },
];

/*
 * Horário de funcionamento por dia da semana (0 = domingo ... 6 = sábado).
 * inicio/fim em minutos desde a meia-noite. Intervalo entre slots em minutos.
 * fechado: true significa que não há atendimento nesse dia.
 */
const FUNCIONAMENTO = {
  0: { fechado: true },                       // Domingo
  1: { inicio: 9 * 60, fim: 19 * 60 },        // Segunda 09:00–19:00
  2: { inicio: 9 * 60, fim: 19 * 60 },        // Terça
  3: { inicio: 9 * 60, fim: 19 * 60 },        // Quarta
  4: { inicio: 9 * 60, fim: 19 * 60 },        // Quinta
  5: { inicio: 9 * 60, fim: 20 * 60 },        // Sexta 09:00–20:00
  6: { inicio: 9 * 60, fim: 17 * 60 },        // Sábado 09:00–17:00
};

/* Passo da grade de horários (em minutos) */
const INTERVALO_SLOT = 30;

/* Chave usada no localStorage */
const STORAGE_KEY = "agendafacil.agendamentos.v1";
const STORAGE_TEMA = "agendafacil.tema";
const STORAGE_SEED = "agendafacil.seed.v1";

/*
 * Gera agendamentos de exemplo relativos à data atual, para o painel não
 * começar vazio. Distribui alguns atendimentos entre hoje e os próximos dias.
 */
function gerarDadosExemplo() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Monta os dias ABERTOS (segunda a sábado) da SEMANA ATUAL — a mesma exibida
  // por padrão no calendário e no filtro "Esta semana". Assim os exemplos sempre
  // aparecem, independentemente do dia em que o sistema é aberto.
  const inicio = inicioDaSemana(hoje);       // segunda-feira da semana corrente
  const diasSemana = [];                     // índices 0..5 = seg, ter, qua, qui, sex, sáb
  const cursor = new Date(inicio);
  for (let i = 0; i < 6; i++) {
    diasSemana.push(isoDaData(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  // Retorna o ISO do dia útil pela posição na semana (0 = segunda).
  const emDias = (n) => diasSemana[Math.min(n, diasSemana.length - 1)];

  // 'd' é o índice do dia na semana (0 = segunda ... 5 = sábado). A distribuição
  // cobre todos os dias úteis para o calendário ficar bem preenchido.
  const exemplos = [
    { s: "coloracao",   p: "ana",      d: 0, h: "09:00", cli: "Mariana Lopes",       tel: "(11) 98812-4571" },
    { s: "barba",       p: "carlos",   d: 0, h: "10:00", cli: "João Pedro Martins",  tel: "(11) 99123-8890" },
    { s: "limpeza",     p: "patricia", d: 1, h: "09:30", cli: "Carla Mendes",        tel: "(11) 99880-7712" },
    { s: "corte",       p: "rafael",   d: 1, h: "10:00", cli: "Lucas Almeida",       tel: "(11) 99001-4432" },
    { s: "escova",      p: "ana",      d: 2, h: "13:30", cli: "Patrícia Gomes",      tel: "(11) 98555-6677" },
    { s: "sobrancelha", p: "juliana",  d: 2, h: "16:00", cli: "Amanda Rocha",        tel: "(11) 99432-1188" },
    { s: "corte",       p: "carlos",   d: 3, h: "11:30", cli: "Diego Fernandes",     tel: "(11) 98123-9900" },
    { s: "massagem",    p: "patricia", d: 3, h: "15:00", cli: "Roberto Dias",        tel: "(11) 98234-0091" },
    { s: "coloracao",   p: "rafael",   d: 4, h: "14:00", cli: "Fernanda Ribeiro",    tel: "(11) 99640-1123" },
    { s: "manicure",    p: "juliana",  d: 5, h: "10:00", cli: "Beatriz Nunes",       tel: "(11) 98700-2245" },
  ];

  return exemplos.map((e, i) => {
    const servico = SERVICOS.find((sv) => sv.id === e.s);
    const prof = PROFISSIONAIS.find((pr) => pr.id === e.p);
    return {
      id: "seed-" + (i + 1) + "-" + Date.now().toString(36),
      servicoId: servico.id,
      servicoNome: servico.nome,
      duracao: servico.duracao,
      preco: servico.preco,
      profissionalId: prof.id,
      profissionalNome: prof.nome,
      data: emDias(e.d),
      hora: e.h,
      clienteNome: e.cli,
      clienteTelefone: e.tel,
      criadoEm: new Date().toISOString(),
    };
  });
}
