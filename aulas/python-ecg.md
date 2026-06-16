---
id: python-ecg
title: Classificação de ECG
language: Python
subfolder: Aprendizado de Máquina
order: 1
---
Utilizamos bibliotecas tradicionais de inteligência artificial em Python para extrair características temporais e de frequência (variabilidade da frequência cardíaca - HRV) dos sinais brutos obtidos por sensores de eletrocardiografia, classificando batimentos cardíacos normais e anômalos.

#### Algoritmo Random Forest Classifier
Script Python clássico usando Scikit-Learn para treinar e avaliar um classificador de batimentos cardíacos:

```python
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Carregar features extraídas do banco de dados MIT-BIH
features = np.load("data/ecg_features.npy")
labels = np.load("data/ecg_labels.npy")

# Dividir conjuntos em treino e teste (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)

# Inicializar classificador
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# Avaliar performance
acuracia = clf.score(X_test, y_test)
print(f"Acurácia Geral: {acuracia:.2%}\n")
print(classification_report(y_test, clf.predict(X_test)))
```
