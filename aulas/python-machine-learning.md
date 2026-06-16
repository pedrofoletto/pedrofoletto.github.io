---
id: python-machine-learning
title: "Conceitos de Aprendizado de Máquina"
language: Python
subfolder: "Machine Learning"
order: 1
summary: "Linguagem usada na área principalmente para Machine Learning"
subjectTitle: "Python"
---
# Principais Desafios no Aprendizado de Máquina

Para construir um bom modelo de Machine Learning, o algoritmo precisa de dados de qualidade. Nesta seção, vamos explorar os principais problemas que enfrentamos na preparação desses dados e como eles afetam o resultado final.

---

## 1. Quantidade Insuficiente de Dados de Treinamento
Para uma criança aprender o que é um cachorro, bastam alguns exemplos. Para uma máquina, precisamos de milhares ou milhões de registros.

* **O problema:** Se o volume de dados for muito pequeno, o algoritmo não conseguirá encontrar padrões estatísticos confiáveis.
* **Exemplo:** Tentar ensinar um robô a reconhecer uma fruta mostrando apenas uma única foto de uma maçã verde. Se ele vir uma maçã vermelha na vida real, ele não vai reconhecer.

---

## 2. Dados de Treinamento Não Representativos (Viés de Amostragem)
Para que um modelo generalize bem, os dados de treinamento devem ser representativos dos novos casos que ele irá encontrar no mundo real. Se a sua amostra for tendenciosa, a previsão também será.

### 📌 O Caso Histórico: Eleições Americanas de 1936
A revista *Literary Digest* realizou uma das maiores pesquisas de opinião da época para a eleição presidencial entre Alf Landon e Franklin D. Roosevelt. Eles enviaram 10 milhões de questionários por correio e obtiveram 2,4 milhões de respostas.

* **A Previsão:** Landon venceria com folga (57% dos votos).
* **O Resultado Real:** Roosevelt esmagou a votação com 62% dos votos.

**Onde esteve o erro?**
1. **Viés de Seleção:** As listas de endereços foram retiradas de catálogos telefônicos e registros de clubes de automóveis. Em 1936 (auge da Grande Depressão), quem tinha carro e telefone fixo era a parcela mais rica da população, que tendia a votar nos Republicanos.
2. **Viés de Não-Resposta:** Menos de 25% das pessoas responderam. Pessoas politicamente mais motivadas ou insatisfeitas tendem a responder mais, distorcendo o resultado real da população.

---

## 3. Dados de Baixa Qualidade (Garbage In, Garbage Out)
Se você alimentar o algoritmo com lixo, ele vai prever lixo. Erros, valores ausentes (*NaNs*) e *outliers* (valores discrepantes) barulhentos destroem o aprendizado do modelo.

* **A Solução:** Limpe os dados!
* **Estratégias comuns:**
    * Remover ou preencher valores faltantes usando a média, mediana ou moda.
    * Identificar e tratar discrepâncias gritantes (ex: uma idade preenchida como 200 anos).
    * Remover registros duplicados.

---

## 4. Características Irrelevantes (Engenharia de Recursos)
Nem todo dado que você tem em mãos é útil para resolver o seu problema. O excesso de informações inúteis faz o modelo se perder em "padrões fantasmas" que não existem na realidade.

* **Exemplo:** Se estamos prevendo o preço de uma casa, o tamanho do terreno e o número de quartos importam; a cor do carro do proprietário atual não tem nenhuma influência.
* **O Processo:** Chamamos isso de **Seleção de Características (Feature Selection)** ou **Extração de Características (Feature Extraction)**. É o ato de selecionar apenas as variáveis que realmente têm poder explicativo sobre o nosso alvo.
#Sobreajuste (Overfitting) vs. Subajuste (Underfitting)

O maior desafio ao treinar um modelo é garantir que ele funcione bem com dados que ele nunca viu antes (capacidade de generalização).

---

## 5. Cuidado com o Sobreajuste dos Dados (Overfitting)
Ocorre quando o modelo se ajusta exageradamente aos dados de treinamento. Ele aprende não apenas a lógica do problema, mas também todo o ruído, os erros e as particularidades daquela amostra específica.

* **Sinal de alerta:** O algoritmo tem uma acertividade (precisão) absurdamente alta nos dados de treino, mas não é funcional quando recebe dados novos de teste.

---

## 6. E com o Subajuste dos Dados (Underfitting)
É o oposto do sobreajuste. Ocorre quando o modelo é simples demais para aprender a estrutura subjacente e os padrões dos dados.

* **Exemplo:** Tentar traçar uma linha reta (modelo linear) para prever um comportamento de dados que é nitidamente curvo ou complexo. Ele vai errar na base de treino e vai continuar errando na base de teste.
* **Como resolver:** * Escolher um modelo mais poderoso/complexo (ex: trocar uma regressão linear por uma árvore de decisão, veremos isso mais tarde!).
    * Fornecer melhores características (*features*) para o algoritmo.
    * Reduzir as restrições de regularização do modelo.