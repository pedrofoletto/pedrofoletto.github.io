---
id: python-arrhythmia
title: Detecção de Arritmias (CNN)
language: Python
subfolder: Aprendizado de Máquina
order: 2
---
Redes Neurais Convolucionais de uma dimensão (Conv1D) são excelentes para analisar séries temporais biológicas diretas, sem necessidade de extração manual de características. Elas capturam padrões morfológicos no sinal de ECG para identificar fibrilação atrial e outras arritmias.

#### Treinamento da Rede Convolucional
Abaixo está o feedback do console de treinamento do modelo escrito em TensorFlow / Keras:

```bash
# Iniciar script de treinamento usando aceleração de GPU
$ python3 src/train_cnn.py --epochs=50 --batch-size=32
Using TensorFlow/Keras backend with CUDA support.
GPU Device: NVIDIA Jetson Xavier NX - Initialized.
Carregando banco de dados de arritmias (MIT-BIH)... OK
Construindo arquitetura Conv1D -> MaxPool1D -> Dropout -> Dense.

Epoch 1/50 - loss: 0.4231 - accuracy: 0.8845 - 2s/epoch
Epoch 10/50 - loss: 0.1102 - accuracy: 0.9678 - 1s/epoch
Epoch 50/50 - loss: 0.0345 - accuracy: 0.9912 - 1s/epoch

[INFO] Treinamento Concluído. Acurácia de Validação: 98.94%
[INFO] Salvando pesos do modelo em modelos/arrhythmia_detector_v1.h5... OK
```
