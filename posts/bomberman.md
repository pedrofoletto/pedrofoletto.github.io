---
id: 'bomberman'
tipo: 'artigo'
titulo: 'Mini Bomberman em C'
data: '26 JUN 2025'
resumo: 'Recriação do clássico jogo Bomberman desenvolvida em linguagem C com renderização em Raylib.'
tags: ['projeto', 'jogos', 'c', 'raylib']
github: 'https://github.com/pedrofoletto/bomberman'
---

Este projeto é um clone funcional do clássico jogo Bomberman, desenvolvido em C com a biblioteca Raylib para consolidar lógica de jogos 2D, colisões e controle de estados em tempo real.

### Principais Mecânicas e Funcionalidades:
- **Movimentação do Personagem**: Controle dinâmico do herói utilizando o teclado (`W`, `A`, `S`, `D`).
- **Mecânica de Bombas**: Inserção de bombas pressionando a `Barra de Espaço` para explodir obstáculos e derrotar inimigos.
- **Estruturação de Fases**: Ferramenta inclusa na pasta `tools/` para converter mapas em formato texto (`.txt`) para formato binário (`.bin`) legível pelo jogo.
- **Interface e Navegação**: Telas de menu principal, configurações e pausa dinâmica (`ESC`).

O foco do projeto foi trabalhar com manipulação direta de arquivos binários para carregamento de mapas e gerência de loops de eventos clássicos.

### Arquitetura do Sistema (UML)

```text
+------------------+         1         +--------------+
|    GameLoop      | ----------------> |  InputSystem |
| - running: bool  |                   +--------------+
| + update()       |                          |
| + render()       |                          v
+------------------+         1         +--------------+
         | --------------------------> |    Player    |
         |                             | - x, y: int  |
         |                             | + move()     |
         |                             | + dropBomb() |
         |                             +--------------+
         |                                    |
         |                                    | posiciona
         |                                    v
         |                 1..*        +--------------+
         +---------------------------> |     Bomb     |
                                       | - timer: int |
                                       | + explode()  |
                                       +--------------+
```

### Como Compilar e Executar

Certifique-se de ter a biblioteca **Raylib** instalada em seu sistema e execute os seguintes comandos no terminal:

```bash
# Compilar o projeto linkando a Raylib
gcc -o bomberman src/*.c -lraylib -lGL -lm -lpthread -ldl -lrt -lX11

# Executar o jogo
./bomberman
```
