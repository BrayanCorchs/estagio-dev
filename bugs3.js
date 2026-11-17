(function(){
var D = window.DAILY = window.DAILY || {};
function f(title, msg, fn, starter, fix, tests, why){ return {title:title, msg:msg, fn:fn, starter:starter + "\n", fix:fix, tests:tests, why:why}; }
function s(title, msg, lines, answer, why){ return {title:title, msg:msg, lines:lines, answer:answer, why:why}; }

D.alg = [
 f("Soma que para antes","Olá! A soma de 1 até 5 está dando 10, e o certo é 15. O laço parece parar uma volta antes.","somaAte",
   "function somaAte(n) {\n  let soma = 0;\n  for (let i = 1; i < n; i++) {\n    soma += i;\n  }\n  return soma;\n}","  for (let i = 1; i <= n; i++) {",
   [{args:[5],want:15},{args:[1],want:1}],"Com `<`, o último número fica de fora. O certo é `<=`."),
 f("Texto invertido com sujeira","A função de inverter texto devolve \"undefinedcba\" em vez de \"cba\".","inverter",
   "function inverter(texto) {\n  let saida = \"\";\n  for (let i = texto.length; i >= 0; i--) {\n    saida += texto[i];\n  }\n  return saida;\n}","  for (let i = texto.length - 1; i >= 0; i--) {",
   [{args:["abc"],want:"cba"},{args:[""],want:""}],"A última posição válida é `length - 1`. Em `length` não há caractere."),
 f("Contagem de pares errada","A função devia contar os números pares da lista e está contando os ímpares.","contarPares",
   "function contarPares(lista) {\n  let total = 0;\n  for (const n of lista) {\n    if (n % 2 === 1) total++;\n  }\n  return total;\n}","    if (n % 2 === 0) total++;",
   [{args:[[1,2,4]],want:2},{args:[[3,5]],want:0}],"Par é quando o resto da divisão por 2 é zero."),
 f("Maior de três","A função que devolve o maior de três números erra quando o maior é o terceiro.","maiorDeTres",
   "function maiorDeTres(a, b, c) {\n  if (a > b) return a;\n  if (b > c) return b;\n  return c;\n}","  if (a > b && a > c) return a;",
   [{args:[3,1,9],want:9},{args:[9,1,3],want:9},{args:[1,9,3],want:9}],"O primeiro teste compara `a` só com `b` e esquece o `c`."),
 f("Fatorial sempre zero","O fatorial de qualquer número está dando 0.","fatorial",
   "function fatorial(n) {\n  let r = 0;\n  for (let i = 1; i <= n; i++) {\n    r = r * i;\n  }\n  return r;\n}","  let r = 1;",
   [{args:[5],want:120},{args:[0],want:1}],"Multiplicação acumulada começa em 1. Começando em 0, tudo dá zero."),
 f("Busca que mente","Quando o valor não está na lista, a busca devolve 0, como se estivesse na primeira posição. O combinado é devolver -1.","buscar",
   "function buscar(lista, alvo) {\n  for (let i = 0; i < lista.length; i++) {\n    if (lista[i] === alvo) return i;\n  }\n  return 0;\n}","  return -1;",
   [{args:[[4,7],7],want:1},{args:[[4,7],9],want:-1}],"0 é uma posição válida. Para dizer que não achou, a convenção é -1."),
 f("Palíndromo nunca reconhecido","A função diz que arara não é palíndromo. Ela nunca devolve verdadeiro.","ehPalindromo",
   "function ehPalindromo(texto) {\n  return texto === texto.split(\"\").reverse();\n}",'  return texto === texto.split("").reverse().join("");',
   [{args:["arara"],want:true},{args:["farol"],want:false}],"`reverse` devolve um array. Falta juntar de volta em texto com `join`.")
];
D.sql = [
 s("Coluna grudada","Bom dia. Esta consulta devolve uma coluna só, com nome estranho, em vez de nome e preço.",["SELECT nome preco","FROM produtos;"],0,"Falta a vírgula entre as colunas. Sem ela, o banco entende `preco` como apelido de `nome`."),
 s("Filtro depois da ordem","A consulta dos produtos em estoque dá erro de sintaxe. Qual linha está fora do lugar?",["SELECT nome FROM produtos","ORDER BY preco","WHERE estoque > 0;"],2,"O `WHERE` vem antes do `ORDER BY`."),
 s("Clientes sem telefone","A busca por clientes sem telefone não devolve ninguém, e sabemos que existem vários.",["SELECT nome FROM clientes","WHERE telefone = NULL;"],1,"Nada é igual a NULL. A comparação certa é `telefone IS NULL`."),
 s("Junção explosiva","Esta consulta devolveu milhões de linhas: cada pedido combinado com todos os clientes.",["SELECT pedidos.id, clientes.nome","FROM pedidos","JOIN clientes;"],2,"Falta a condição da junção: `ON pedidos.cliente_id = clientes.id`."),
 s("Cadastro recusado","O cadastro de produto falha dizendo que a quantidade de valores não bate com a de colunas.",["INSERT INTO produtos (nome, preco)","VALUES ('Suco');"],1,"Foram listadas duas colunas e passado um valor só. Falta o preço."),
 s("Agrupamento errado","O relatório de clientes por cidade dá erro no agrupamento.",["SELECT cidade, COUNT(*)","FROM clientes","GROUP BY estado;"],2,"A coluna mostrada no SELECT é `cidade`, então o agrupamento precisa ser por `cidade`."),
 s("Busca pelo começo do nome","A busca devia trazer todos os nomes que começam com Ana, como Ana Paula e Anabela. Só traz quem se chama exatamente Ana.",["SELECT nome FROM clientes","WHERE nome LIKE 'Ana';"],1,"Sem curinga, `LIKE` funciona como igualdade. O certo é `'Ana%'`.")
];
D.java = [
 s("Texto num inteiro","O código não compila logo na primeira linha.",['int quantidade = "10";',"int total = quantidade * 2;"],0,"Um `int` não recebe texto. Escreva `10` sem aspas, ou converta com `Integer.parseInt`."),
 s("Método sem retorno","O compilador diz que o método não pode devolver um valor.",["public static void dobro(int n) {","    return n * 2;","}"],0,"`void` significa que o método não devolve nada. O tipo de retorno deve ser `int`."),
 s("Posição inexistente","O programa quebra com ArrayIndexOutOfBoundsException.",["int[] notas = {7, 8, 9};","System.out.println(notas[3]);"],1,"O array tem as posições 0, 1 e 2. A última é `notas[2]`."),
 s("Bloqueio para todos","Todas as contas estão sendo bloqueadas, até as com saldo positivo.",["if (saldo < 0);","{","    bloquearConta();","}"],0,"O ponto e vírgula encerra o `if` ali mesmo. O bloco de baixo roda sempre."),
 s("Média sem decimais","A média de 15 dividido por 2 sai como 7.0, e deveria ser 7.5.",["int soma = 15;","int qtd = 2;","double media = soma / qtd;"],2,"A divisão acontece entre dois inteiros. Converta um lado: `(double) soma / qtd`."),
 s("Lista que não existe","Adicionar o primeiro nome à lista derruba o programa com NullPointerException.",["List<String> nomes = null;",'nomes.add("Ana");'],0,"A lista nunca foi criada. O certo é `new ArrayList<>()`."),
 s("Sempre liberado","Usuários inativos estão sendo liberados. O if parece comparar, mas não compara.",["boolean ativo = false;","if (ativo = true) {","    liberar();","}"],1,"Um `=` sozinho atribui `true` à variável. Basta `if (ativo)`.")
];
D.cs = [
 s("Aspas erradas","O compilador recusa a declaração do nome.",["string nome = 'Ana';","Console.WriteLine(nome);"],0,"Aspas simples são para um único caractere. Texto usa aspas duplas."),
 s("Fora do array","O programa lança IndexOutOfRangeException.",["int[] v = new int[3];","v[3] = 10;"],1,"Um array de 3 posições vai de 0 a 2."),
 s("Lista não criada","O código não compila: uso de variável não atribuída.",["List<int> lista;","lista.Add(5);"],0,"A lista foi declarada, mas não criada. Falta `= new List<int>();`."),
 s("Chaves na tela","A mensagem aparece como \"Oi, {nome}!\", com as chaves e tudo.",['string nome = "Ana";','Console.WriteLine("Oi, {nome}!");'],1,"Falta o cifrão antes das aspas para ligar a interpolação: `$\"Oi, {nome}!\"`."),
 s("Média truncada","A média devia ser 3.5 e sai 3.",["double media = 7 / 2;","Console.WriteLine(media);"],0,"7 e 2 são inteiros, então a divisão é inteira. Escreva `7 / 2.0`."),
 s("Tarefa em vez de texto","O código não compila ao tentar ler o tamanho do texto baixado.",["var dados = cliente.GetStringAsync(url);","Console.WriteLine(dados.Length);"],0,"Sem `await`, a variável guarda a tarefa em andamento, não o texto."),
 s("Coleção alterada","O programa quebra dizendo que a coleção foi modificada durante a enumeração.",["foreach (var p in produtos)","{","    produtos.Remove(p);","}"],2,"Não se remove de uma lista enquanto ela é percorrida com `foreach`. Use `RemoveAll` ou percorra uma cópia.")
];
D.mob = [
 s("Sair sem tocar","Fala! O usuário é deslogado assim que a tela abre, sem tocar em nada.",["<Button",'  title="Sair"',"  onPress={sair()} />"],2,"Com os parênteses, a função roda na hora em que a tela é montada. O certo é passar a função: `onPress={sair}`."),
 s("Texto solto","O app fecha com o erro de que textos precisam estar dentro de um componente Text.",["<View>","  Bem-vindo","  <Text>Farol</Text>","</View>"],1,"Em React Native, todo texto fica dentro de `<Text>`."),
 s("Lista que não atualiza","O item é adicionado, mas a lista na tela não muda.",["const [itens, setItens] = useState([]);","function adicionar(item) {","  itens.push(item);","}"],2,"`push` altera o estado direto e a tela não é avisada. O certo é `setItens([...itens, item])`."),
 s("Aviso de chave","O console avisa que cada item de uma lista precisa de uma `key` única.",["{produtos.map(p => (","  <Text>{p.nome}</Text>","))}"],1,"Falta a chave no item: `<Text key={p.id}>`."),
 s("Toque sem efeito","O botão personalizado não responde ao toque.",["<TouchableOpacity onClick={abrir}>","  <Text>Abrir</Text>","</TouchableOpacity>"],0,"No celular o evento é `onPress`. `onClick` é da web."),
 s("Contador travado","O contador devia subir a cada toque, mas dá erro ao tentar alterar a variável.",["const [contador, setContador] = useState(0);","setContador(contador++);"],1,"`contador++` tenta alterar o estado direto. O certo é `setContador(contador + 1)`."),
 s("Resposta que não é resposta","A tela quebra dizendo que `resposta.json` não é uma função.",["async function carregar() {","  const resposta = fetch(url);","  const dados = await resposta.json();","}"],1,"Falta o `await` no `fetch`. Sem ele, a variável guarda a promessa, não a resposta.")
];
D.ia = [
 s("Arquivo sem aspas","Oi! O script não roda: o Python diz que o nome vendas não está definido.",["import pandas as pd","df = pd.read_csv(vendas.csv)","print(df.head())"],1,"O nome do arquivo é um texto e precisa de aspas: `\"vendas.csv\"`."),
 s("Método sem parênteses","A conta dá erro ao somar 10 à média.",['media = df["preco"].mean',"print(media + 10)"],0,"Sem os parênteses, a variável guarda o método em vez do resultado. O certo é `.mean()`."),
 s("Coluna inexistente","O script quebra com KeyError ao somar os preços.",['df = pd.read_csv("vendas.csv")','total = df["Preco"].sum()',"# as colunas são: produto, preco, quantidade"],1,"Nomes de coluna diferenciam maiúsculas. A coluna é `\"preco\"`."),
 s("Treino com a prova","O modelo teve resultado perfeito na avaliação. Bom demais para ser verdade.",["modelo.fit(X_teste, y_teste)","previsoes = modelo.predict(X_teste)"],0,"O modelo foi treinado com os dados de teste. O treino deve usar `X_treino` e `y_treino`."),
 s("Filtro que atribui","O filtro dos produtos acima de 100 dá erro de sintaxe.",['caros = df[df["preco"] = 100]',"print(len(caros))"],0,"Um `=` sozinho é atribuição. Para filtrar acima de 100, use `>`."),
 s("Resposta entre as pistas","O modelo acerta 100% ao prever quem comprou. Olhe com atenção as colunas usadas como entrada.",['X = df[["idade", "renda", "comprou"]]','y = df["comprou"]',"modelo.fit(X, y)"],0,"A coluna `comprou` é a resposta e está entre as entradas. Isso é vazamento de dados."),
 s("Porcentagem trocada","O relatório mostra \"Acurácia: 87%\" quando o cálculo dá 43,5.",["acuracia = acertos / total * 100",'print(f"Acurácia: {acertos}%")'],1,"O print mostra `acertos` em vez de `acuracia`.")
];
D.ops = [
 s("Comando digitado errado","Bom dia. O envio do rodapé novo parou no meio com \"não é um comando git\".",["git add .",'git comit -m "Ajusta rodapé"',"git push"],1,"O comando é `commit`, com dois m."),
 s("Pasta errada apagada","Era para apagar só a pasta temp. O código-fonte sumiu.",["cd projeto","rm -r src","# era para apagar só a pasta temp"],1,"O comando apagou `src`. O certo era `rm -r temp`. Confira o alvo antes de apagar."),
 s("Instalação sem arquivos","A construção da imagem falha no `npm install`, dizendo que não encontra o package.json.",["FROM node:20","RUN npm install","COPY . .",'CMD ["node", "servidor.js"]'],1,"A instalação roda antes de os arquivos serem copiados. O `COPY` precisa vir antes do `RUN`."),
 s("Segredo no repositório","O time de segurança avisou que a senha do banco está no repositório.",["git add .env",'git commit -m "Configuração"',"git push"],0,"O arquivo `.env` guarda segredos e nunca deve ser adicionado. Ele vai no `.gitignore`."),
 s("Porta desencontrada","O contêiner sobe, mas o site não abre. O app escuta na porta 8080.",["services:","  web:","    ports:",'      - "80:3000"'],3,"O mapeamento aponta para a porta 3000 do contêiner. O certo é `\"80:8080\"`."),
 s("Teste que nunca falha","Uma versão com testes quebrados foi publicada, e a esteira ficou verde.",["etapas:","  - npm test || true","  - npm run deploy"],1,"O `|| true` faz a etapa passar mesmo quando os testes falham."),
 s("Histórico sobrescrito","Os commits de dois colegas sumiram da branch principal depois deste envio.",["git checkout main","git merge nova-tela","git push --force"],2,"`--force` sobrescreve o histórico do servidor. Na branch principal, use o `git push` normal.")
];
})();
