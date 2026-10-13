# 3. Mapas

**Estado:** o PDF de 16 MB não pôde ser baixado pelo conector do Drive (limite de 10 MB). Este arquivo é o **inventário** (de legendas e texto). As imagens precisam ser recortadas do PDF.

## Mapas de batalha (grade de combate)
| # | Mapa | Escala | Áreas | Onde está no livro | Uso |
|---|---|---|---|---|---|
| M1 | **Câmara do Conselho** (Evento 1: O Chamado por Heróis) | 1 quadrado = 1,5 m | Sala em auditório, púlpito, bancos (terreno difícil), portas sul/oeste/norte | p. 8 | Cena de incêndio/resgate |
| M2 | **Cidadela Altaerein, térreo** | 1 quadrado = 1,5 m | A1 a A22 | p. 14 | Exploração/combate do Cap. 2 |
| M3 | **Cidadela Altaerein, ameias** | 1 quadrado = 3 m (no mapa) | A22 | p. 14 | Impasse com Calmont/goblins; torres nos 4 cantos, ~7,5 m acima do pátio |
| M4 | **Nível inferior da Cidadela Altaerein** | 1 quadrado = 1,5 m | B1 a B17 | página não confirmada (após o Cap. 3 começar, ~p. 32) | Masmorra do Cap. 3 |
| M5 | **Caminho do Guardião** | 1 quadrado = 1,5 m | C1 a C8 (3 plataformas em árvores, cabana, entrada de caverna, covil, acampamento) | página não confirmada (~p. 47 a 49) | Cap. 4, posto avançado dos Lâminas Sangrentas |
| M6 | **Cavernas de Sangue Goblin** | 1 quadrado = 1,5 m | D1 a D8 | página não confirmada (~p. 54 a 55) | Cap. 4, descida final ao Anel |

**Elementos de terreno importantes para a conversão:**
- M2: espinheiros ao redor (terreno difícil até 3 m), muralhas desabadas (Escalar CD 20), portas secretas (A8↔A9, A9 → exterior, saída oeste), poça no pátio (A12), poça-covil dos cascotúmulos (A13), tetos de 6 m.
- M4: arsenal com prateleiras caídas (terreno difícil), poça de 1,5 m em B10, corredores de 3 a 4,5 m de altura, porta secreta em B15, túnel de fuga em B17.
- M5: plataformas elevadas com escadas de corda (3 ações para recolher, 1 para baixar), sino de alarme, cabana com frestas de vigia.
- M6: chão de barro e teias (terreno difícil, Reflexos CD 16/18), fosso de 6 m em D5 (escalar de volta CD 35), trono de ossos (3 m de altura) em D3.

## Mapas de outros tipos
| # | Mapa | Onde | Conteúdo |
|---|---|---|---|
| O1 | **Mapa de Colina Fenda** | verso da capa (e no Guia do Jogador) | 17 locais numerados: Arquivos (1), Madeireira (2), Prefeitura (3), Barril de Cayden (4), Pelagens da Mata Carmesim (5), Grande Casa dos Sonhos (6), Lamento de Lamond (7), Monumento Circular com estátua de Lamond e 6 poços (8), Mortuário de Morta (9), **Orelha em Conserva** (10, saída do túnel), Irmãos Posandi (11), Coisas e Quartéis (12), **Confiável Companhia de Livros** (13), Sorriso de Shelyn (14), Alvenaria Cabeça de Presa (15), Rodas & Carroças do Vusker (16), Graça do Mago (17) |
| O2 | **Ilustração da cidadela no alto da colina** | p. 3 (página inteira) | Visual da Colina dos Cavaleiros Infernais |
| O3 | **Layout do Anel de Alseta** (Sala D7) | descrito em D7 | 6 portais em círculo com estátuas, fonte seca no centro; NE (Lótus) destruído |
| O4 | **Mapa regional** | descrito em texto | Cidade → Cidadela (1,5 km NE); túnel de fuga B17 → Orelha em Conserva (1,5 km); Caminho do Guardião (9 km NO); cavernas de C8 até D1 (10 km) |
| O5 | **Mapa do país / Golarion** | descrito em texto | Colina Fenda no leste de Isger, perto da fronteira com Druma (75 km), aos pés das Montanhas dos Cinco Reis |

## Roteiro para extrair as imagens (no seu computador)
```
# Cada página do PDF como PNG (poppler)
pdftoppm -r 200 -png "pdf-pathfinder-2e-era-das-cinzas-01-colina-dos-cavaleiros-infernais_compress.pdf" pag

# Ou extrair só as imagens embutidas (mapas costumam ser imagens grandes)
pdfimages -png -list "<arquivo>.pdf"     # lista tamanhos e páginas
pdfimages -png "<arquivo>.pdf" img
```
Páginas-alvo (numeração do livro): 3 (ilustração), 8 (M1), 14 (M2/M3), verso da capa (O1). Para M4, M5 e M6 procure as legendas "Nível Inferior da Cidadela Altaerein", "Caminho do Guardião" e "Cavernas de Sangue Goblin" (as páginas exatas não puderam ser confirmadas no texto). Os números de página podem variar ±1 do índice do PDF por causa das capas.

Se mandar o PDF por aqui (por exemplo, subindo-o ao repositório), eu mesmo extraio e corto os mapas.
