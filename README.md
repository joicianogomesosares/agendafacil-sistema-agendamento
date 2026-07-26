# 🗓️ AgendaFácil

Sistema web de **agendamento online** para clínicas e salões de beleza. O cliente
escolhe o serviço, o profissional e o horário; o estabelecimento acompanha tudo
por um painel administrativo com faturamento, estatísticas e calendário da semana.

100% estático (HTML + CSS + JavaScript puro). **Não precisa de servidor, build,
npm ou internet** — basta abrir o `index.html` no navegador.

---

## ✨ Recursos

### Para o cliente
- **Catálogo com 8 serviços reais** (corte, barba, coloração, escova, manicure,
  limpeza de pele, massagem e design de sobrancelhas), cada um com duração e preço.
- **Escolha do profissional** — só aparecem os que atendem o serviço selecionado.
- **Grade de horários inteligente**: respeita o horário de funcionamento, esconde
  horários que já passaram e **bloqueia horários ocupados** (verificados contra os
  agendamentos salvos, considerando a duração de cada serviço).
- **Assistente em 4 passos** com barra de progresso e resumo final.
- **Confirmação** com serviço, profissional, data, horário e valor, salva no navegador.

### Para o administrador
- **Estatísticas do dia/semana**: total de agendamentos, faturamento estimado
  (soma dos preços) e serviço mais pedido.
- **Lista de agendamentos** com filtro por período (hoje / semana atual).
- **Busca por nome do cliente** em tempo real.
- **Cancelamento** de agendamentos com confirmação.
- **Calendário semanal** mostrando os horários ocupados por dia, com navegação
  entre semanas.

### Geral
- **Dados de exemplo** carregados na primeira visita, para o painel não começar vazio.
- **Persistência em `localStorage`** — o estado sobrevive ao recarregar a página.
- **Tema claro/escuro** automático (respeita o `prefers-color-scheme`) e com botão
  de alternância manual.
- **Responsivo** — funciona bem no celular e no desktop.
- **Acessibilidade básica**: rótulos nos campos, `aria-*` na navegação e bom contraste.

---

## ▶️ Como rodar

Não há nada para instalar. Escolha uma das opções:

1. **Abrir direto**: dê um duplo clique em `index.html` (funciona via `file://`).
2. **GitHub Pages**: envie os arquivos para um repositório e ative o GitHub Pages
   apontando para a branch principal — o site funciona sem ajustes.
3. **Servidor local (opcional)**: se preferir, rode `python -m http.server` na pasta
   do projeto e acesse `http://localhost:8000`.

> Dica: para recarregar os dados de exemplo, limpe o `localStorage` do site
> (ferramentas do desenvolvedor → Application → Local Storage).

---

## 📁 Estrutura

```
agendafacil-sistema-agendamento/
├── index.html          # Estrutura da página e das duas views (Agendar / Admin)
├── assets/
│   └── img/            # Fotos reais: hero.jpg, salon1–5.jpg,
│       ├── servicos/   #   capas dos serviços
│       └── equipe/     #   retratos dos profissionais
├── css/
│   └── style.css       # Estilos, tema claro/escuro e responsividade
├── js/
│   ├── data.js         # Serviços, profissionais, funcionamento e dados de exemplo
│   ├── store.js        # Persistência (localStorage), datas e regras de disponibilidade
│   └── app.js          # Interface: assistente de agendamento e painel administrativo
└── README.md
```

---

## 🛠️ Tecnologias

- **HTML5** semântico.
- **CSS3** com variáveis (custom properties), Grid, Flexbox e `prefers-color-scheme`.
- **JavaScript (ES) puro**, sem frameworks nem dependências externas.
- **localStorage** para persistência dos dados.

Sem CDN, sem bibliotecas e sem imagens externas por URL: os ícones da interface são
**SVG inline** (estilo traço fino), as fotos do salão ficam em `assets/img/` (arquivos
locais) e o restante do visual é feito com CSS (gradientes, sombras e cantos arredondados).

### Fotos x ícones

Tudo que é **conteúdo** aparece como foto real: capa dos serviços, retrato dos
profissionais, miniaturas dos resumos/painel e a galeria "Nosso espaço". Continuam
em **SVG** apenas os controles e indicadores: abas, alternador de tema, busca, setas
do calendário, botões de voltar, o stepper de 4 passos e os selos dos cartões de
estatística (são números, não conteúdo visual).

O par foto↔serviço está em `js/data.js` (campos `foto` e `fotoAlt`). **Atenção:** alguns
arquivos em `assets/img/servicos/` têm nome trocado em relação ao que a imagem mostra
(por exemplo, `corte.jpg` mostra o aparo de uma barba e `barba.jpg` mostra um corte de
cabelo). O mapeamento segue o **conteúdo real** de cada foto, não o nome do arquivo —
os desvios estão comentados no topo de `data.js`.

---

## 🧠 Como a disponibilidade é calculada

Cada agendamento guarda o horário de início e a duração do serviço. Ao montar a
grade de horários, o sistema marca um slot como **indisponível** quando o intervalo
`[início, início + duração)` do novo agendamento se sobrepõe ao de outro agendamento
do mesmo profissional na mesma data. Também são bloqueados os horários que não cabem
antes do fechamento e os que já passaram (no dia atual).

---

## 👤 Feito por Joiciano Gomes

Projeto desenvolvido por **Joiciano Gomes** como um sistema de agendamento completo,
funcional e sem dependências — pronto para abrir e usar.
