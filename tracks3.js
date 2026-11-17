(function(){
var NAMES = ["Iniciante","Básico","Intermediário","Avançado","Desafio"];
var SUB = ["Primeiro contato: um conceito por vez.","Conceitos combinados em tarefas curtas.","Tarefas que pedem mais de um passo.","Problemas com casos especiais.","Tarefas completas, do tamanho das de um dev júnior."];
var COLORS = {py:"#4aa8ff", js:"#ffc53d", fe:"#ff6fae", be:"#3ee6a0", cpp:"#9a8cff", gam:"#ff8a4c", sec:"#35e0d0"};
function ids(p, list){ return list.map(function(n){ return p + n; }); }
var L = {
 py:[ids("PY-",["01","02","03","05"]), ids("PY-",["04","06","08","09","11"]), ids("PY-",["07","12","14"]), ids("PY-",["13","10","15"])],
 js:[ids("FAR-",["101","102","103","115"]), ids("FAR-",["104","111","105","112"]), ids("FAR-",["106","107","108"]), ids("FAR-",["109","113","114","110"])],
 fe:[ids("FE-",["01","03","02"]), ids("FE-",["04","05","07","13"]), ids("FE-",["06","08","11","14"]), ids("FE-",["12","09","15","10"])],
 be:[ids("BE-",["01","02","06"]), ids("BE-",["05","12","11","10"]), ids("BE-",["08","03","07","14"]), ids("BE-",["04","13","09","15"])],
 cpp:[ids("CPP-",["01","02","03"]), ids("CPP-",["04","05","11","14","15"]), ids("CPP-",["06","07","12","13"]), ids("CPP-",["08","09","10"])],
 gam:[ids("GAM-",["01","07","05"]), ids("GAM-",["08","09","12","03"]), ids("GAM-",["02","06","13","10"]), ids("GAM-",["04","11","14","15"])],
 sec:[ids("SEC-",["01","06","11","03"]), ids("SEC-",["07","14","04","12"]), ids("SEC-",["09","15","10","02"]), ids("SEC-",["05","08","13"])]
};
var N = {
py:[
 {id:"PY-16", title:"Contador de palavras", concept:"Dicionário como contador", type:"order",
  intro:[{text:"Dicionário serve para contar ocorrências. `get(chave, 0)` devolve o valor guardado ou 0 quando a chave ainda não existe, o que evita erro na primeira vez.", code:'estoque = {"uva": 2}\nestoque.get("uva", 0)   # 2\nestoque.get("kiwi", 0)  # 0'}],
  brief:"Monte a função `contar`, que recebe uma lista de palavras e devolve um dicionário com quantas vezes cada uma aparece.",
  lines:["def contar(palavras):","    contagem = {}","    for p in palavras:","        contagem[p] = contagem.get(p, 0) + 1","    return contagem"], distract:["        contagem[p] += 1"],
  why:"`contagem[p] += 1` quebraria na primeira vez que a palavra aparece, porque a chave ainda não existe. O `get` com valor padrão resolve.",
  review:"Aprovado. Esse padrão de contagem aparece em toda análise de dados."},
 {id:"PY-17", title:"Rastrear o código", concept:"Leitura de código", type:"choice",
  intro:[{text:"Ler código dos outros é metade do trabalho. `enumerate` entrega a posição e o valor de cada item ao mesmo tempo:", code:'for i, nome in enumerate(["Ana", "Leo"]):\n    print(i, nome)\n# 0 Ana\n# 1 Leo'}],
  brief:"Acompanhe a execução passo a passo. O que o programa mostra?",
  code:"def f(lista):\n    total = 0\n    for i, n in enumerate(lista):\n        if i % 2 == 0:\n            total += n\n    return total\n\nprint(f([5, 1, 4, 2, 3]))",
  options:["15","12","3","7"], answer:1,
  why:"Só entram os valores das posições pares (0, 2 e 4): 5 + 4 + 3 = 12. O teste é na posição `i`, não no valor `n`.",
  review:"Certo. Rastrear a execução no papel é a habilidade que mais acelera a depuração."}
],
js:[
 {id:"FAR-116", title:"Agrupar por categoria", concept:"Objeto como índice", type:"code", fn:"agruparPorCategoria",
  intro:[{text:"Um objeto pode ter chaves criadas em tempo de execução, com colchetes. É assim que se agrupa uma lista:", code:'const grupos = {};\ngrupos["doces"] = [];\ngrupos["doces"].push("Bolo");\n// { doces: ["Bolo"] }'}],
  brief:["Escreva `agruparPorCategoria(produtos)`. Cada produto tem `nome` e `categoria`. Devolva um objeto em que cada chave é uma categoria e o valor é o array de nomes daquela categoria, na ordem em que aparecem.", {code:'{ comida: ["Pizza", "Pastel"], bebida: ["Suco"] }'}],
  starter:"function agruparPorCategoria(produtos) {\n  const grupos = {};\n  // seu código aqui\n\n  return grupos;\n}\n",
  tests:[{args:[[{nome:"Pizza",categoria:"comida"},{nome:"Suco",categoria:"bebida"},{nome:"Pastel",categoria:"comida"}]],want:{comida:["Pizza","Pastel"],bebida:["Suco"]}},{args:[[]],want:{}}],
  hints:[{text:"Antes de dar `push`, confira se a chave já existe: `if (!grupos[p.categoria])`."},{text:"O laço:", code:"for (const p of produtos) {\n  if (!grupos[p.categoria]) {\n    grupos[p.categoria] = [];\n  }\n  grupos[p.categoria].push(p.nome);\n}"}],
  review:["Aprovado. Agrupar é a operação por trás de quase todo painel de relatório."]},
 {id:"FAR-117", title:"Melhores clientes", concept:"Somar, ordenar e cortar", type:"code", fn:"topClientes",
  intro:[{text:"Problema grande se resolve em etapas. Aqui são três: somar por cliente, ordenar do maior para o menor e pegar só os primeiros.", code:'const totais = { Ana: 70, Leo: 30 };\nObject.keys(totais);                     // ["Ana", "Leo"]\n[30, 70].sort((a, b) => b - a);          // [70, 30]\n["a", "b", "c"].slice(0, 2);             // ["a", "b"]'}],
  brief:"Escreva `topClientes(pedidos, n)`. Cada pedido tem `cliente` e `valor`. Some os valores por cliente e devolva um array com os nomes dos `n` clientes que mais gastaram, do maior para o menor.",
  starter:"function topClientes(pedidos, n) {\n  const totais = {};\n  // 1. some o valor de cada cliente\n  // 2. ordene os nomes pelo total, do maior para o menor\n  // 3. devolva só os n primeiros\n}\n",
  tests:[{args:[[{cliente:"Ana",valor:50},{cliente:"Leo",valor:30},{cliente:"Ana",valor:20},{cliente:"Bia",valor:60}],2],want:["Ana","Bia"]},{args:[[{cliente:"Ana",valor:50},{cliente:"Bia",valor:60}],1],want:["Bia"]},{args:[[],3],want:[]}],
  hints:[{text:"Para somar: `totais[p.cliente] = (totais[p.cliente] || 0) + p.valor`."},{text:"Ordenar e cortar:", code:"return Object.keys(totais)\n  .sort((a, b) => totais[b] - totais[a])\n  .slice(0, n);"}],
  review:["Aprovado. Três etapas pequenas resolveram um problema que parecia grande. É assim que se programa."]}
],
fe:[
 {id:"FE-16", title:"Vitrine responsiva", concept:"Grid, cartões e media query", type:"html",
  intro:["Tarefa de gente grande: uma vitrine de produtos que funciona no computador e no celular. Você vai juntar grid, classes e media query."],
  brief:"Monte uma `div` com a classe `grade` contendo pelo menos 3 elementos com a classe `card`, cada um com um `h2`. No CSS, a `.grade` usa `display: grid` com `grid-template-columns`, e um `@media` muda o layout em telas pequenas.",
  starter:'<style>\n.grade {\n  \n}\n.card {\n  padding: 16px;\n  background: #eef3f7;\n  border-radius: 12px;\n}\n</style>\n\n<div class="grade">\n  \n</div>\n',
  checks:[{q:".grade .card",min:3,desc:"3 cartões ou mais dentro da grade"},{q:".grade .card h2",min:3,filled:true,desc:"Cada cartão tem um h2 com texto"},{re:"\\.grade\\s*\\{[^}]*display\\s*:\\s*grid",desc:".grade com display: grid"},{re:"\\.grade\\s*\\{[^}]*grid-template-columns\\s*:\\s*[^;}\\s]",desc:"Colunas definidas com grid-template-columns"},{re:"@media[^{]*\\{[^}]*\\.grade\\s*\\{",desc:"Um @media que altera a .grade"}],
  hints:[{text:"O CSS da grade e a regra para telas pequenas:", code:".grade {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 12px;\n}\n@media (max-width: 600px) {\n  .grade { grid-template-columns: 1fr; }\n}"},{text:"Cada cartão:", code:'<div class="card"><h2>Pizza</h2></div>'}],
  review:"Aprovado. Isso já é um componente que entraria no nosso site."},
 {id:"FE-17", title:"Lista vinda da API", concept:"fetch e async/await", type:"order",
  intro:[{text:"Dados de verdade vêm do servidor. `fetch` faz o pedido e `await` espera a resposta chegar. Só dá para usar `await` dentro de uma função `async`.", code:'const resposta = await fetch("/api/status");\nconst dados = await resposta.json();'}],
  brief:"Monte a função que busca os produtos na API, converte a resposta e mostra os nomes numa lista da página.",
  lines:["async function carregar() {",'  const resposta = await fetch("/api/produtos");',"  const produtos = await resposta.json();",'  lista.innerHTML = produtos.map(p => `<li>${p.nome}</li>`).join("");',"}"], distract:["  const produtos = resposta.json;"],
  why:"Primeiro o pedido, depois a conversão para objeto e só então a tela. `json` é um método e também precisa de `await`.",
  review:"Aprovado. Buscar, converter e mostrar: o ciclo de toda tela com dados."}
],
be:[
 {id:"BE-16", title:"Controle de acesso", concept:"Papéis e permissões", type:"code", fn:"autorizar",
  intro:["Toda rota protegida passa por duas perguntas, nesta ordem: quem é você, e você pode fazer isso? A resposta sai como status: 401, 403 ou 200."],
  brief:["Escreva `autorizar(usuario, acao)` e devolva o status como número.", {code:'usuario null                -> 401\npapel "admin"               -> 200 para qualquer ação\npapel "editor"              -> 200 para "ler" e "editar"\npapel "leitor"              -> 200 só para "ler"\nação não permitida ao papel -> 403'}],
  starter:"function autorizar(usuario, acao) {\n  // seu código aqui\n}\n",
  tests:[{args:[null,"ler"],want:401},{args:[{papel:"leitor"},"ler"],want:200},{args:[{papel:"leitor"},"editar"],want:403},{args:[{papel:"editor"},"editar"],want:200},{args:[{papel:"editor"},"apagar"],want:403},{args:[{papel:"admin"},"apagar"],want:200}],
  hints:[{text:"Comece por `if (!usuario) return 401;`. Depois trate o admin, e deixe o 403 como último return."},{text:"Uma forma compacta: um objeto com as ações de cada papel.", code:'const permissoes = {\n  editor: ["ler", "editar"],\n  leitor: ["ler"]\n};\nconst lista = permissoes[usuario.papel] || [];\nreturn lista.includes(acao) ? 200 : 403;'}],
  review:"Aprovado. Negar por padrão e liberar só o que está na lista: essa é a postura certa."},
 {id:"BE-17", title:"Relatório de vendas", concept:"Agregação de dados", type:"code", fn:"relatorioVendas",
  intro:["O time de negócio quer números. Uma rota de relatório percorre os pedidos uma vez e sai com vários totais. Cuidado com a divisão quando não houver nenhum pedido pago."],
  brief:["Escreva `relatorioVendas(pedidos)`. Cada pedido tem `status` (`\"pago\"` ou `\"cancelado\"`) e `valor`. Devolva um objeto com:", {code:"pagos       -> quantidade de pedidos pagos\ncancelados  -> quantidade de cancelados\nfaturamento -> soma dos valores dos pagos\nticketMedio -> faturamento / pagos (0 se não houver pagos)"}],
  starter:"function relatorioVendas(pedidos) {\n  // seu código aqui\n}\n",
  tests:[{args:[[{status:"pago",valor:100},{status:"cancelado",valor:40},{status:"pago",valor:50}]],want:{pagos:2,cancelados:1,faturamento:150,ticketMedio:75}},{args:[[{status:"cancelado",valor:10}]],want:{pagos:0,cancelados:1,faturamento:0,ticketMedio:0}},{args:[[]],want:{pagos:0,cancelados:0,faturamento:0,ticketMedio:0}}],
  hints:[{text:"Crie três variáveis começando em 0 e atualize dentro de um laço, com um `if` pelo status."},{text:"O ticket médio protegido contra divisão por zero:", code:"const ticketMedio = pagos > 0 ? faturamento / pagos : 0;"}],
  review:"Aprovado. Dividir por zero daria NaN no painel da diretoria. Você evitou."}
],
cpp:[
 {id:"CPP-16", title:"Rastrear o laço", concept:"continue e leitura de código", type:"choice",
  intro:["`continue` pula o resto da volta atual e vai direto para a próxima. `break` encerra o laço inteiro. Os dois mudam o caminho da execução, então leia com calma."],
  brief:"Acompanhe a execução volta por volta. O que aparece na tela?",
  code:"int soma = 0;\nfor (int i = 1; i <= 5; i++) {\n    if (i % 2 == 0) continue;\n    soma += i;\n}\nstd::cout << soma;",
  options:["15","9","6","4"], answer:1,
  why:"Nos pares (2 e 4) o `continue` pula a soma. Entram só 1, 3 e 5, que somam 9.",
  review:"Certo. Com `continue` e `break`, rastrear no papel evita muito erro."},
 {id:"CPP-17", title:"Conta bancária", concept:"Classe em uso", type:"order",
  intro:[{text:"Uma classe só ganha vida quando você cria um objeto dela. Em C++, basta declarar a variável, sem `new`:", code:"Porta p;\np.abrir();"}],
  brief:"Monte o programa completo: a classe `Conta` (com o saldo declarado antes do método) e o `main`, que cria a conta, deposita 50 e mostra o saldo.",
  lines:["class Conta {","public:","    double saldo = 0;","    void depositar(double v) { saldo += v; }","};","int main() {","    Conta c;","    c.depositar(50);","    std::cout << c.saldo;","}"], distract:["    Conta c = new Conta();"],
  why:"A classe vem antes do `main`. Dentro dele, o objeto precisa existir antes de receber o depósito, e o saldo só é mostrado no fim.",
  review:"Aprovado. Você montou um programa orientado a objetos inteiro."}
],
gam:[
 {id:"GAM-16", title:"Cérebro do inimigo", concept:"IA com máquina de estados", type:"code", fn:"atualizarInimigo",
  intro:["A inteligência de um inimigo é uma máquina de estados guiada pela distância até o jogador: longe ele patrulha, perto ele persegue, colado ele ataca.", {text:"`Math.abs` devolve a distância sem sinal:", code:"Math.abs(30 - 100); // 70"}],
  brief:["Escreva `atualizarInimigo(inimigo, jogador)`. Os dois têm `x`. Calcule a distância entre eles e devolva um objeto com `x` e `estado`:", {code:'distância até 10   -> "atacando", x não muda\ndistância até 100  -> "perseguindo", x anda 2 na direção do jogador\nmais longe         -> "patrulhando", x não muda'}],
  starter:"function atualizarInimigo(inimigo, jogador) {\n  const dist = Math.abs(jogador.x - inimigo.x);\n  // seu código aqui\n}\n",
  tests:[{args:[{x:0,estado:"patrulhando"},{x:5}],want:{x:0,estado:"atacando"}},{args:[{x:0,estado:"patrulhando"},{x:50}],want:{x:2,estado:"perseguindo"}},{args:[{x:100,estado:"patrulhando"},{x:40}],want:{x:98,estado:"perseguindo"}},{args:[{x:0,estado:"perseguindo"},{x:500}],want:{x:0,estado:"patrulhando"}}],
  hints:[{text:"Teste a menor distância primeiro. Na perseguição, o passo é +2 se o jogador está à direita (`jogador.x > inimigo.x`) e -2 se está à esquerda."},{text:"O caso da perseguição:", code:'const passo = jogador.x > inimigo.x ? 2 : -2;\nreturn { x: inimigo.x + passo, estado: "perseguindo" };'}],
  review:"Aprovado. Esse é o esqueleto da IA de boa parte dos inimigos de jogos de ação."},
 {id:"GAM-17", title:"Subir de nível", concept:"Curva de progressão", type:"code", fn:"subirDeNivel",
  intro:["Progressão boa pede cada vez mais esforço. Aqui, passar do nível 1 custa 100 de XP, do nível 2 custa 200, do nível 3 custa 300, e assim por diante.", {text:"Quando não se sabe quantas voltas serão, o laço certo é o `while`:", code:"while (moedas >= preco) {\n  moedas = moedas - preco;\n  itens = itens + 1;\n}"}],
  brief:["Escreva `subirDeNivel(xp)`. O jogador começa no nível 1. Enquanto o XP for suficiente para o custo do nível atual (`nivel * 100`), ele paga o custo e sobe. Devolva um objeto com `nivel` e `xpRestante`.", {code:"subirDeNivel(250)  ->  { nivel: 2, xpRestante: 150 }"}],
  starter:"function subirDeNivel(xp) {\n  let nivel = 1;\n  // seu código aqui\n}\n",
  tests:[{args:[0],want:{nivel:1,xpRestante:0}},{args:[100],want:{nivel:2,xpRestante:0}},{args:[250],want:{nivel:2,xpRestante:150}},{args:[650],want:{nivel:4,xpRestante:50}}],
  hints:[{text:"A condição do laço é `xp >= nivel * 100`. Dentro dele, desconte o custo antes de aumentar o nível."},{text:"Solução:", code:"while (xp >= nivel * 100) {\n  xp = xp - nivel * 100;\n  nivel = nivel + 1;\n}\nreturn { nivel: nivel, xpRestante: xp };"}],
  review:"Aprovado. Você escreveu a mesma lógica que faz este app subir o seu cargo."}
],
sec:[
 {id:"SEC-16", title:"Auditoria de contas", concept:"Revisão de segurança", type:"code", fn:"auditarSenhas",
  intro:["Auditoria é passar um pente-fino nas contas procurando pontos fracos antes que um invasor ache. Três sinais clássicos: senha curta, senha que contém o próprio nome e conta sem segundo fator.", {text:"Para comparar sem diferenciar maiúsculas, converta os dois lados:", code:'"Ana2026".toLowerCase().includes("ana"); // true'}],
  brief:["Escreva `auditarSenhas(usuarios)`. Cada usuário tem `nome`, `senha` e `doisFatores`. Devolva um array com os nomes das contas que têm pelo menos um problema:", {code:"senha com menos de 12 caracteres\nsenha que contém o nome (sem diferenciar maiúsculas)\ndoisFatores igual a false"}],
  starter:"function auditarSenhas(usuarios) {\n  // seu código aqui\n}\n",
  tests:[{args:[[{nome:"ana",senha:"Girassol-Azul-42",doisFatores:true},{nome:"leo",senha:"Leo123456789012",doisFatores:true},{nome:"bia",senha:"curta",doisFatores:true},{nome:"caio",senha:"Montanha-Verde-77",doisFatores:false}]],want:["leo","bia","caio"]},{args:[[]],want:[]}],
  hints:[{text:"Use `filter` com as três condições ligadas por `||`, e depois `map` para ficar só com os nomes."},{text:"Solução:", code:"return usuarios\n  .filter(u =>\n    u.senha.length < 12 ||\n    u.senha.toLowerCase().includes(u.nome.toLowerCase()) ||\n    !u.doisFatores)\n  .map(u => u.nome);"}],
  review:"Aprovado. Esse relatório vai direto para os gestores de cada área."},
 {id:"SEC-17", title:"Detectar força bruta", concept:"Análise de registros", type:"code", fn:"detectarAtaque",
  intro:["Defesa também é observar. Muitas falhas de login vindas do mesmo endereço são o rastro típico de um ataque de força bruta, e os registros do sistema mostram isso."],
  brief:"Escreva `detectarAtaque(tentativas)`. Cada tentativa tem `ip` e `ok` (`true` para login certo). Devolva um array com os IPs que tiveram 3 ou mais falhas, na ordem em que cada IP apareceu pela primeira vez.",
  starter:"function detectarAtaque(tentativas) {\n  const falhas = {};\n  // 1. conte as falhas de cada ip\n  // 2. devolva os ips com 3 ou mais\n}\n",
  tests:[{args:[[{ip:"10.0.0.1",ok:false},{ip:"10.0.0.2",ok:false},{ip:"10.0.0.1",ok:false},{ip:"10.0.0.1",ok:false},{ip:"10.0.0.2",ok:true}]],want:["10.0.0.1"]},{args:[[{ip:"10.0.0.9",ok:false},{ip:"10.0.0.1",ok:false},{ip:"10.0.0.1",ok:false},{ip:"10.0.0.9",ok:false},{ip:"10.0.0.1",ok:false},{ip:"10.0.0.9",ok:false}]],want:["10.0.0.9","10.0.0.1"]},{args:[[]],want:[]}],
  hints:[{text:"Conte só quando `ok` for falso: `falhas[t.ip] = (falhas[t.ip] || 0) + 1`."},{text:"`Object.keys` devolve as chaves na ordem em que foram criadas:", code:"return Object.keys(falhas).filter(ip => falhas[ip] >= 3);"}],
  review:"Aprovado. Com isso o time bloqueia o endereço antes de o ataque dar certo."}
]};
(window.TRACKS || []).forEach(function(t){
  var by = {}; t.units.forEach(function(u){ u.ex.forEach(function(e){ by[e.id] = e; }); });
  var units = L[t.id].map(function(list){ return list.map(function(id){ return by[id]; }).filter(Boolean); });
  units.push(N[t.id]);
  t.units = units.map(function(ex, i){
    ex.forEach(function(e){ e.lvl = i + 1; e.xp = (i + 1) * 5 + (e.type === "code" || e.type === "html" ? 10 : 5); });
    return {title:"Nível " + (i + 1) + " · " + NAMES[i], sub:SUB[i], lvl:i + 1, ex:ex};
  });
  t.color = COLORS[t.id];
});
})();
