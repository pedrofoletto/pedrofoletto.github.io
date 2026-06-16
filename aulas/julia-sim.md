---
id: julia-sim
title: Simulação Fisiológica
language: Julia
order: 2
---
Modelamos o processo de difusão de oxigênio nos alvéolos capilares pulmonares. Esta simulação em malha fechada valida como o organismo regula o nível de saturação de oxigênio arterial (SaO2) sob variações barométricas.

#### Execução do Solver de Simulação
O script bash abaixo demonstra como instanciar o ambiente e executar a simulação a partir do terminal:

```bash
# Configurar dependências e baixar pacotes da simulação
$ julia --project=. -e 'using Pkg; Pkg.instantiate()'
Instantiating project... Done!

# Executar simulação de saturação capilar por 60 segundos
$ julia scripts/simular_pulmao.jl --tempo=60 --oxigenio=98
[SIMULAÇÃO] Carregando modelo pulmonar (malha fechada)... OK
[SIMULAÇÃO] Rodando passo de integração Runge-Kutta 4...
[SIMULAÇÃO] Simulação concluída com sucesso.
Salvando gráfico em saidas/pulmao_sim.png... OK
```
