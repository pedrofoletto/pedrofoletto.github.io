# Product

## Register

brand

## Users

**Recrutadores e profissionais de tecnologia em saúde** que visitam o portfólio com pouco tempo disponível — geralmente chegando por um link no LinkedIn ou GitHub. O contexto de uso é uma triagem rápida: o recrutador precisa entender em menos de 30 segundos se Pedro tem o perfil técnico certo.

**Secundário:** colegas de engenharia e profissionais de automação industrial/médica interessados nos projetos e no blog técnico.

## Product Purpose

Vitrine técnica integrada ao GitHub que demonstra competência real em Engenharia de Controle e Automação voltada para a saúde — não para impressionar visualmente, mas para convencer pela clareza e qualidade do que está exposto. O portfólio funciona como um proxy do rigor técnico do engenheiro: se o site é preciso, direto e sem ruído, o trabalho do engenheiro provavelmente também é.

Sucesso significa: o recrutador consegue identificar o perfil, as tecnologias dominadas e ao menos um projeto relevante em uma única rolagem, sem fricção.

## Brand Personality

**Preciso. Calmo. Honesto.**

O portfólio não tenta vender um produto — expõe o trabalho e deixa ele falar. Tom de voz de ficha técnica, não de pitch. Não há hipérboles, não há animações que distraem. A personalidade é a de um engenheiro que sabe exatamente o que faz e não precisa convencer ninguém com barulho visual.

## Anti-references

- **Dark mode roxo + glassmorphism** — portfólio genérico de dev que parece template de Figma Community.
- **Hero animado em loop com partículas ou neon** — excesso de motion que grita "eu sei fazer CSS" mas não diz nada sobre o trabalho.
- **Tailwind + Inter + fundo cinza claro** — o portfólio "clean" que é indistinguível dos outros 10.000 portfólios "clean".
- **Linguagem de IA** — "revolucionário", "inovador", "apaixonado por transformar o futuro da saúde". Qualquer adjetivo genérico que poderia estar em qualquer perfil de LinkedIn é banido.
- **Kreativität über alles** — nunca sacrificar a legibilidade e a clareza técnica por um efeito visual.

## Design Principles

1. **O trabalho fala, o design serve.** Cada elemento visual existe para facilitar a leitura do conteúdo técnico, nunca para competir com ele. Se um elemento pode ser removido sem perda de informação, ele deve ser removido.

2. **Identidade de catálogo, não de startup.** A estética correta é a de um datasheet industrial ou publicação técnica — tipografia funcional, separadores precisos, zero decoração gratuita. A identidade vem da consistência, não da originalidade forçada.

3. **Confiança sem arrogância.** O portfólio é direto e não se desculpa pelo que ainda não está pronto. Protótipos são expostos como protótipos. Estudos são expostos como estudos. Isso é mais confiante do que fingir que tudo está finalizado.

4. **Integração GitHub como prova, não como enfeite.** Os links e dados do GitHub não são decoração — são a evidência principal. A aba de Repositórios e o gráfico de contribuições existem para mostrar atividade real, não para preencher espaço.

5. **Responsividade como respeito ao visitante.** O portfólio deve ser igualmente legível no celular de um recrutador em trânsito e no monitor de um engenheiro em casa.

## Accessibility & Inclusion

- **WCAG AA** como nível mínimo: contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande.
- Navegação completa por teclado (já implementada via `role="tab"`, `aria-selected`, `aria-controls`).
- `prefers-reduced-motion` deve ser respeitado em todas as animações — fallback para crossfade ou transição instantânea.
- `lang="pt-BR"` declarado no root (já implementado).
- `alt` descritivo em todas as imagens (especialmente na galeria acordeão).
