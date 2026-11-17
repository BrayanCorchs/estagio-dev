# Estágio Dev

Aplicativo web para aprender programação como estagiário: os chefes de cada área passam tarefas no chat, você resolve na tela do exercício e vai sendo promovido.

- 14 trilhas (Lógica e Algoritmos, Python, JavaScript, Front-end, Back-end, C++, Jogos, Cibersegurança, Banco de Dados, Java, C#, Mobile, Dados e IA, DevOps e Cloud)
- 350 exercícios em 5 níveis de dificuldade e 6 estilos
- Bug do dia de cada chefe na aba Mensagens
- Plano de carreira de Estagiário a Tech Lead
- Funciona sem internet depois do primeiro acesso e pode ser instalado no celular

O app é só HTML, CSS e JavaScript. Não tem servidor, banco de dados nem etapa de build.

## Testar no computador

Abra o `index.html` no navegador. Para testar como site de verdade, rode um servidor simples dentro da pasta:

```
npx serve .
```

## Publicar na Vercel

**Pelo site, sem GitHub**
1. Entre em vercel.com e clique em **Add New > Project**.
2. Arraste a pasta `estagio-dev` para a área de upload.
3. Em **Framework Preset**, deixe **Other**. Não há comando de build nem pasta de saída.
4. Clique em **Deploy**.

**Pelo GitHub (recomendado, publica sozinho a cada alteração)**
1. Crie um repositório, por exemplo `estagio-dev`, e envie o conteúdo desta pasta:
   ```
   git init
   git add .
   git commit -m "Primeira versão do Estágio Dev"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/estagio-dev.git
   git push -u origin main
   ```
2. Na Vercel, clique em **Add New > Project**, importe o repositório e clique em **Deploy**.

## Publicar no Netlify

Entre em app.netlify.com/drop e arraste a pasta `estagio-dev`. O site fica no ar na hora.

## Instalar no celular

Depois de publicado, abra o endereço no celular:
- **Android (Chrome):** menu de três pontos > **Instalar app** ou **Adicionar à tela inicial**.
- **iPhone (Safari):** botão de compartilhar > **Adicionar à Tela de Início**.

## Levar o progresso

O progresso fica salvo no navegador de cada pessoa, separado por endereço. Para levar o que você já fez em outra versão do app:
1. Na versão antiga, abra **Perfil > Gerar e copiar código**.
2. Na versão publicada, abra **Perfil**, cole o código e toque em **Restaurar**.

## Publicar uma atualização

Depois de alterar qualquer arquivo, abra o `sw.js` e aumente o número em `const CACHE = "estagio-dev-v1"` (por exemplo, para `v2`). Sem isso, quem já instalou o app pode continuar vendo a versão antiga.

## Estrutura dos arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Estrutura das telas e todo o visual (CSS) |
| `app.js` | Lógica do app: navegação, chat, exercícios, testes, progresso |
| `js-track.js`, `tracks.js` a `tracks6.js` | Trilhas e exercícios |
| `real.js`, `real2.js` | Textos do painel "No dia a dia" |
| `bugs.js` a `bugs3.js` | Bugs do dia de cada chefe |
| `manifest.json`, `icones/` | Nome, cores e ícones para instalar no celular |
| `sw.js` | Guarda os arquivos para o app funcionar sem internet |
