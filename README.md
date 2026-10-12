# Trono Carmesim: Medo

Barra de Medo do Daggerheart com o tema da campanha *Maldição do Trono Carmesim*: uma fileira de **olhos de Groetus** que se abrem conforme o Medo do mestre sobe.

- Sincroniza com o Medo do sistema (a ficha e a barra mostram o mesmo valor).
- **Só o mestre altera**: clique num olho (define o Medo até ele) ou use os botões + e −. Os jogadores só veem.
- **Cada usuário escolhe o seu tamanho** em Configurações > Módulos: tamanho dos olhos, espaço entre eles, brilho, travar posição.
- **Sussurro grave e distante** quando o Medo sobe (3 trechos curtos de 2,6 s, sorteados; liga/desliga e volume nas configuracoes, so para quem muda).
- Arraste a barra para onde quiser. Ela nunca sai da tela, e se não couber na largura os olhos diminuem sozinhos.
- **Dano só quando o ataque acerta** (opção do mundo, ligada por padrão): se o sistema já sabe que o ataque errou, a etapa de dano é pulada; o Medo, os custos e o resto da ação continuam normais. Precisa de alvo selecionado antes do ataque. Use com *Rolagem de Dano/Cura* em "Sempre". Usa o `libWrapper` se estiver instalado.
- Macro de emergência: `TCMedo.reset()` volta a barra para o topo, centralizada.
- Não use junto com o módulo "Daggerheart: Fear Tracker" (as duas barras apareceriam).

Instalação manual: copiar a pasta `trono-carmesim-medo` para `Data/modules/` e ativar no mundo.
