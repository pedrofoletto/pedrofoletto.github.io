---
id: julia-intro
title: Computação Científica na Saúde
language: Julia
order: 1
---
A bioengenharia exige modelagem de sistemas dinâmicos complexos (como circulação sanguínea, ventilação e dinâmica cardíaca). A linguagem Julia se destaca por resolver o problema das duas linguagens (two-language problem): oferece a velocidade de execução do C com a facilidade e expressividade matemática do Python.

#### Resolvendo Equações Diferenciais em Julia
Abaixo está um script em Julia demonstrando a definição do sistema clássico de FitzHugh-Nagumo, utilizado para modelar o potencial de ação em neurônios e células cardíacas:

```julia
# Exemplo de potencial de ação (FitzHugh-Nagumo) em Julia
using DifferentialEquations
using Plots

function fitzhugh_nagumo!(du, u, p, t)
    v, w = u
    a, b, i = p
    du[1] = v - (v^3)/3 - w + i
    du[2] = 0.08 * (v + a - b * w)
end

# Condições iniciais e parâmetros [a, b, estímulo]
u0 = [-1.0, -0.5]
tspan = (0.0, 100.0)
p = [0.7, 0.8, 0.5]

prob = ODEProblem(fitzhugh_nagumo!, u0, tspan, p)
sol = solve(prob)
plot(sol, vars=(1, 2), title="Trajetória de Fase Cardíaca")
```
