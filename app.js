(function(){
"use strict";
var TRACKS = (window.TRACKS || []).slice(), EX = {}, TR = {}, TOTAL = 0;
TRACKS.sort(function(a, b){ return (a.id === "alg" ? 0 : 1) - (b.id === "alg" ? 0 : 1); });
function norm(a){ return (Array.isArray(a) ? a : (a == null ? [] : [a])).map(function(x){ return typeof x === "string" ? {text:x} : x; }); }
TRACKS.forEach(function(t){
  TR[t.id] = t; t.all = [];
  t.units.forEach(function(u){ u.ex.forEach(function(e){
    e.track = t.id; e.type = e.type || "code"; e.intro = norm(e.intro); e.brief = norm(e.brief); e.review = norm(e.review);
    EX[e.id] = e; t.all.push(e); TOTAL++;
  }); });
});
var DAILY = window.DAILY || {};
TRACKS.forEach(function(t){ (DAILY[t.id] || []).forEach(function(b, i){
  b.id = "BUG-" + t.id.toUpperCase() + "-" + (i + 1); b.track = t.id; b.type = b.fn ? "code" : "spot"; b.daily = true; b.concept = "Bug do dia"; b.xp = 15; b.lvl = 0;
  b.intro = []; b.review = []; b.brief = norm([b.msg, b.fn ? "Corrija o código no editor e rode os testes. O nome da função `" + b.fn + "` não pode mudar." : "Toque na linha que causa o problema."]);
  if (b.fn) b.hints = [{text:b.why}, {text:"A linha corrigida:", code:b.fix}]; EX[b.id] = b;
}); });
var STYLES = ["code","html","spot","fill","order","choice"];
var TDESC = {code:"Escreva a função e rode os testes de verdade.", html:"Monte a página e acompanhe a prévia.", fill:"Toque nas palavras para completar o código.", order:"Coloque as linhas na ordem certa.", choice:"Leia o código ou o caso e escolha a resposta.", spot:"Leia o código e toque na linha que está errada."};
var TYPE = {code:"Programar", html:"Construir página", choice:"Múltipla escolha", fill:"Completar código", order:"Ordenar linhas", spot:"Caçar o bug"};

/* ======================= estado ======================= */
var KEY = "estagio-dev-v2", OLD = "estagio-dev-v1";
var state, visible = 0, busy = false, anim = 0, confirmReset = false, saveT = null, curHash = null;
var optOrder = [], homeTab = "tri", passed = {}, ans = null, pool = [], fails = 0, shadow = null, prevT = null;
var $ = function(id){ return document.getElementById(id); };
var logEl = $("log"), composer = $("composer"), codeEl = $("code");
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function now(){ var d = new Date(); return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2); }
function day(off){ var d = new Date(); d.setDate(d.getDate() + (off || 0)); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function fresh(){ return {v:2, name:"", xp:0, done:{}, track:TRACKS[0].id, logs:{}, cur:{}, view:null, code:{}, hints:{}, streak:0, lastDay:"", mode:"mod"}; }
function load(){
  try { var raw = localStorage.getItem(KEY); if (raw){ var s = JSON.parse(raw); if (s && s.v === 2) return s; } } catch(e){}
  try { var o = JSON.parse(localStorage.getItem(OLD) || "null");
    if (o && typeof o === "object"){ var n = fresh(), js = TR.js.all; n.name = o.name || ""; n.track = "js";
      for (var i = 0; i < (o.done || 0) && i < js.length; i++){ n.done[js[i].id] = true; n.xp += js[i].xp; }
      Object.keys(o.code || {}).forEach(function(k){ if (js[k]) n.code[js[k].id] = o.code[k]; });
      return n; } } catch(e){}
  return null;
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
function saveSoon(){ clearTimeout(saveT); saveT = setTimeout(save, 400); }
function doneCount(t){ return (t ? t.all : Object.keys(EX).map(function(k){ return EX[k]; })).filter(function(e){ return state.done[e.id]; }).length; }
function nextOf(t){ for (var i = 0; i < t.all.length; i++) if (!state.done[t.all[i].id]) return t.all[i]; return null; }
function dayNum(){ var d = new Date(); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
function todayBugs(){ var n = dayNum(); return TRACKS.map(function(t, i){ var p = DAILY[t.id] || []; return p.length ? p[(n + i * 3) % p.length] : null; }).filter(Boolean); }
function bugState(){ if (!state.bugs || state.bugs.day !== day()){ state.bugs = {day:day(), solved:{}}; Object.keys(state.code).concat(Object.keys(state.hints)).forEach(function(k){ if (k.indexOf("BUG-") === 0){ delete state.code[k]; delete state.hints[k]; } }); } return state.bugs; }
function touchStreak(){ var d = day(); if (state.lastDay !== d){ state.streak = state.lastDay === day(-1) ? state.streak + 1 : 1; state.lastDay = d; } }
function calcXp(){ return Object.keys(state.done).reduce(function(a, id){ return a + (EX[id] && state.done[id] ? EX[id].xp : 0); }, 0) + (state.bonus || 0); }
function exportCode(){ var o = {v:2, name:state.name, done:state.done, bonus:state.bonus || 0, bugTotal:state.bugTotal || 0, streak:state.streak, lastDay:state.lastDay}; return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
function importCode(txt){
  try { var o = JSON.parse(decodeURIComponent(escape(atob(String(txt).replace(/\s+/g, "")))));
    if (!o || o.v !== 2 || !o.done || typeof o.done !== "object") return false;
    state.name = String(o.name || "").slice(0, 24); state.done = {};
    Object.keys(o.done).forEach(function(k){ if (EX[k] && !EX[k].daily && o.done[k]) state.done[k] = true; });
    state.bonus = +o.bonus || 0; state.bugTotal = +o.bugTotal || 0; state.streak = +o.streak || 0; state.lastDay = String(o.lastDay || "");
    state.cur = {}; state.seenIntro = true; state.xp = calcXp(); save(); return true;
  } catch(e){ return false; }
}
function streakNow(){ return (state.lastDay === day() || state.lastDay === day(-1)) ? state.streak : 0; }
var RANKS = [[0,"Estagiário"],[5,"Estagiário II"],[15,"Trainee"],[30,"Dev Júnior I"],[55,"Dev Júnior II"],[90,"Dev Pleno I"],[135,"Dev Pleno II"],[190,"Dev Sênior"],[260,"Especialista"],[TOTAL,"Tech Lead"]];
function rankIdx(d){ var k = 0; RANKS.forEach(function(r, i){ if (d >= r[0]) k = i; }); return k; }
function rankName(){ return RANKS[rankIdx(doneCount())][1]; }
function careerStrip(){
  var d = doneCount(), k = rankIdx(d), nx = RANKS[k + 1], box = el("div", "career");
  var top = el("div", "ctop"); top.appendChild(el("b", null, RANKS[k][1]));
  top.appendChild(el("small", null, nx ? "Próximo cargo: " + nx[1] + " · faltam " + (nx[0] - d) + (nx[0] - d === 1 ? " lição" : " lições") : "Você chegou ao topo da carreira"));
  box.appendChild(top);
  var bar = el("div", "cbar"), fi = el("i"); fi.style.width = (nx ? (d - RANKS[k][0]) / (nx[0] - RANKS[k][0]) * 100 : 100) + "%"; bar.appendChild(fi); box.appendChild(bar);
  return box;
}
function chatLog(){ var t = TR[state.track]; if (!state.logs[t.id]) state.logs[t.id] = [{from:"boss", text:"Oi! Sou " + t.boss.name.split(" ")[0] + ", " + t.boss.role.toLowerCase() + " na Farol Sistemas. Escolha uma tarefa no mapa da trilha e eu te passo o contexto.", t:now()}]; return state.logs[t.id]; }

/* ======================= utilidades de DOM ======================= */
function el(tag, cls, text){ var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
function btn(cls, text, fn){ var b = el("button", cls, text); b.type = "button"; if (fn) b.addEventListener("click", fn); return b; }
function rich(parent, text){
  String(text).split("`").forEach(function(part, i){ if (!part) return; parent.appendChild(i % 2 ? el("code", null, part) : document.createTextNode(part)); });
  return parent;
}
function fill(s){ return String(s).replace(/\{nome\}/g, state.name || "você"); }
function scrollEnd(){ logEl.scrollTop = logEl.scrollHeight; }

var REAL = window.REAL || {cards:{}, map:{}};
function realOf(ex){ return ex ? REAL.cards[ex.daily ? "depurar" : REAL.map[ex.id]] : null; }
function useCard(ex){
  var c = realOf(ex); if (!c) return null;
  var x = ex.daily ? null : (window.REALX || {})[ex.id];
  var box = el("div", "use");
  box.appendChild(el("span", "ulabel", "No dia a dia")); box.appendChild(el("h4", null, x ? ex.title : c.t));
  function list(items){ var u = el("ul"); items.forEach(function(i){ u.appendChild(rich(el("li"), i)); }); return u; }
  if (x){
    box.appendChild(el("b", "uh", "Onde este exercício aparece")); box.appendChild(rich(el("p"), x[0]));
    box.appendChild(el("b", "uh", "Como fazer do jeito certo")); box.appendChild(rich(el("p"), x[1]));
    box.appendChild(el("b", "uh", "Para que serve: " + c.t.toLowerCase())); box.appendChild(rich(el("p"), c.para));
    var d = el("details"); d.appendChild(el("summary", null, "Mais exemplos e cuidados sobre o assunto"));
    d.appendChild(list(c.ex)); if (c.code) d.appendChild(el("pre", null, c.code)); d.appendChild(list(c.certo)); box.appendChild(d);
  } else {
    box.appendChild(el("b", "uh", "Para que serve")); box.appendChild(rich(el("p"), c.para));
    box.appendChild(el("b", "uh", "Onde aparece no trabalho")); box.appendChild(list(c.ex));
    if (c.code) box.appendChild(el("pre", null, c.code));
    box.appendChild(el("b", "uh", "Como usar do jeito certo")); box.appendChild(list(c.certo));
  }
  return box;
}
function showUse(ex){ var c = useCard(ex); if (c) $("results").appendChild(c); }

/* ======================= rotas ======================= */
function flush(){ anim++; busy = false; }
function show(id){ ["home","chat","work"].forEach(function(v){ $(v).hidden = v !== id; }); }
function route(h){
  flush();
  if (h == null) h = location.hash;
  if (h === "#tarefa" && state.view && EX[state.view]){ show("work"); renderWork(); }
  else if (h === "#chat"){ show("chat"); var l = chatLog(); if (l.length > 80) state.logs[state.track] = l.slice(-60); renderChat(); }
  else { homeTab = h === "#mensagens" ? "msg" : h === "#perfil" ? "per" : "tri"; show("home"); renderHome(); }
}
function go(h){ curHash = "#" + h; try { location.hash = h; } catch(e){} route(curHash); }
window.addEventListener("hashchange", function(){ if (location.hash !== curHash){ curHash = location.hash; route(curHash); } });

/* ======================= mapa de trilhas ======================= */
function renderHome(){
  var t = TR[state.track], s = streakNow();
  $("hxp").textContent = state.xp + " XP";
  $("hrank").textContent = rankName();
  $("hstreak").textContent = s > 0 ? s + (s === 1 ? " dia seguido" : " dias seguidos") : "Faça uma tarefa hoje";
  $("hbar").style.width = (doneCount() / TOTAL * 100) + "%";
  if (document.activeElement !== $("nome")) $("nome").value = state.name;
  var bs = bugState(), bugs = todayBugs(), unread = bugs.filter(function(b){ return !bs.solved[b.id]; }).length;
  var nav = $("mainnav"); nav.textContent = "";
  [["tri","Trilhas","trilhas"],["msg","Mensagens" + (unread ? " (" + unread + ")" : ""),"mensagens"],["per","Perfil","perfil"]].forEach(function(m){
    var nb = btn(homeTab === m[0] ? "on" : "", m[1], function(){ go(m[2]); }); nb.setAttribute("aria-pressed", homeTab === m[0] ? "true" : "false"); nav.appendChild(nb);
  });
  $("tabs").hidden = homeTab !== "tri"; $("hfoot").hidden = $("namerow").hidden = homeTab !== "per";
  if (homeTab === "msg"){
    var ib = $("panel"); ib.textContent = "";
    ib.appendChild(el("p", "usub", "Todo dia cada chefe deixa um bug novo aqui. Hoje: " + (bugs.length - unread) + " de " + bugs.length + " resolvidos. No total, você já resolveu " + (state.bugTotal || 0) + "."));
    bugs.forEach(function(b, i){
      var bt = TR[b.track], ok = !!bs.solved[b.id];
      var row = btn("mail" + (ok ? " read" : ""), null, function(){ openTask(b.id); }); row.style.setProperty("--tc", bt.color);
      row.appendChild(el("span", "avatar", bt.boss.ini));
      var mb = el("span", "mbody"), top = el("span", "mtop");
      top.appendChild(el("b", null, bt.boss.name)); top.appendChild(el("small", null, "0" + (7 + (i % 3)) + ":" + ["12","40","05","31","48","19","56"][i])); mb.appendChild(top);
      mb.appendChild(el("span", "msub", b.title)); mb.appendChild(el("span", "mprev", b.msg));
      var tg = el("span", "tags"); tg.appendChild(el("span", "tag lvl", bt.name)); tg.appendChild(el("span", "tag", b.fn ? "Corrigir código" : "Achar a linha")); tg.appendChild(el("span", "tag", "+" + b.xp + " XP"));
      tg.appendChild(el("span", "tag " + (ok ? "done" : "open"), ok ? "Resolvido" : "Novo")); mb.appendChild(tg);
      row.appendChild(mb); ib.appendChild(row);
    });
    return;
  }
  if (homeTab === "per"){
    var pp = $("panel"); pp.textContent = "";
    var grid = el("div", "stats");
    [["Cargo", rankName()], ["XP total", String(state.xp)], ["Dias seguidos", String(s)], ["Exercícios", doneCount() + "/" + TOTAL], ["Bugs resolvidos", String(state.bugTotal || 0)]].forEach(function(x){
      var c = el("div", "stat"); c.appendChild(el("small", null, x[0])); c.appendChild(el("b", null, x[1])); grid.appendChild(c); });
    pp.appendChild(grid);
    pp.appendChild(careerStrip());
    var lad = el("section", "unit"); lad.appendChild(el("h3", null, "Plano de carreira"));
    var dn = doneCount(), ki = rankIdx(dn);
    RANKS.forEach(function(rk, i){
      var row = el("div", "lrow" + (i < ki ? " got" : i === ki ? " now" : ""));
      row.appendChild(el("span", "lmark", i < ki ? "✓" : String(i + 1)));
      row.appendChild(el("span", "lname", rk[1] + (i === ki ? " · cargo atual" : "")));
      row.appendChild(el("small", null, rk[0] === 0 ? "início" : rk[0] + " lições"));
      lad.appendChild(row);
    });
    pp.appendChild(lad);
    var sec = el("section", "unit"); sec.appendChild(el("h3", null, "Progresso por trilha"));
    TRACKS.forEach(function(x){
      var d = doneCount(x), row = btn("trow", null, function(){ state.track = x.id; save(); go("trilhas"); }); row.style.setProperty("--tc", x.color);
      row.appendChild(el("span", "tname", x.name)); var bar = el("span", "tbar"), fillEl = el("i"); fillEl.style.width = (d / x.all.length * 100) + "%"; bar.appendChild(fillEl); row.appendChild(bar);
      row.appendChild(el("small", null, d + "/" + x.all.length)); sec.appendChild(row);
    });
    pp.appendChild(sec);
    var bk = el("section", "unit"); bk.appendChild(el("h3", null, "Guardar meu progresso"));
    bk.appendChild(el("p", "usub", "O progresso fica salvo só neste navegador. Gere um código para guardar ou levar para outro aparelho, e cole aqui para restaurar."));
    var ta = el("textarea", "bk"); ta.id = "bk"; ta.rows = 3; ta.setAttribute("aria-label", "Código de progresso"); ta.placeholder = "Seu código aparece aqui. Para restaurar, cole um código e toque em Restaurar.";
    var msg = el("p", "usub");
    var acts = el("div", "actions");
    acts.appendChild(btn("chip primary", "Gerar e copiar código", function(){
      ta.value = exportCode(); msg.textContent = "Código gerado. Guarde num lugar seguro.";
      try { navigator.clipboard.writeText(ta.value).then(function(){ msg.textContent = "Código copiado. Guarde num lugar seguro."; }, function(){}); } catch(e){}
    }));
    acts.appendChild(btn("chip", "Restaurar", function(){
      if (!ta.value.trim()){ msg.textContent = "Cole um código antes de restaurar."; return; }
      if (importCode(ta.value)){ renderHome(); } else msg.textContent = "Código inválido. Confira se colou o código inteiro.";
    }));
    bk.appendChild(ta); bk.appendChild(acts); bk.appendChild(msg); pp.appendChild(bk);
    renderHFoot();
    return;
  }
  var tabs = $("tabs"); tabs.textContent = "";
  TRACKS.forEach(function(x){
    var b = btn("tab" + (x.id === t.id ? " on" : ""), null, function(){ state.track = x.id; save(); renderHome(); });
    b.style.setProperty("--tc", x.color); b.setAttribute("aria-pressed", x.id === t.id ? "true" : "false");
    b.appendChild(el("i")); b.appendChild(el("span", null, x.name)); b.appendChild(el("small", null, doneCount(x) + "/" + x.all.length));
    tabs.appendChild(b);
  });
  var p = $("panel"); p.textContent = ""; p.style.setProperty("--tc", t.color);
  p.appendChild(careerStrip());
  if (!state.seenIntro){
    var wc = el("div", "welcome"); wc.appendChild(el("h3", null, "Bem-vindo ao seu estágio"));
    var ol = el("ol");
    ["Escolha uma trilha e toque num exercício. O chefe da área explica o conceito no chat e abre a tarefa.","Resolva na tela do exercício e entregue. Você ganha XP, sobe de cargo e vê onde aquilo é usado no trabalho.","Na aba Mensagens, cada chefe deixa um bug novo por dia para você resolver."].forEach(function(x){ ol.appendChild(el("li", null, x)); });
    wc.appendChild(ol);
    wc.appendChild(btn("chip primary", "Entendi, começar", function(){ state.seenIntro = true; save(); renderHome(); }));
    p.appendChild(wc);
  }
  var bc = el("div", "bosscard");
  bc.appendChild(el("div", "avatar", t.boss.ini));
  var w = el("div", "who"); w.appendChild(el("b", null, t.boss.name)); w.appendChild(el("span", null, t.boss.role + " · trilha de " + t.name)); bc.appendChild(w);
  bc.appendChild(btn("mini", "Conversa", function(){ go("chat"); }));
  p.appendChild(bc);
  var seg = el("div", "seg"); seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "Como organizar os exercícios");
  [["mod","Por nível"],["sty","Por estilo"]].forEach(function(m){
    var b = btn(state.mode === m[0] ? "on" : "", m[1], function(){ state.mode = m[0]; save(); renderHome(); });
    b.setAttribute("aria-pressed", state.mode === m[0] ? "true" : "false"); seg.appendChild(b);
  });
  p.appendChild(seg);
  var cur = state.cur[t.id], off = [0, 30, 52, 30], k = 0, groups;
  if (state.mode === "sty") groups = STYLES.map(function(ty){ var list = t.all.filter(function(e){ return e.type === ty; });
      return {title:TYPE[ty], sub:TDESC[ty], ex:list}; }).filter(function(g){ return g.ex.length; });
  else groups = t.units.map(function(u, ui){ return {title:u.title, sub:u.sub, ex:u.ex}; });
  groups.forEach(function(u){
    var sec = el("section", "unit"), dn = u.ex.filter(function(e){ return state.done[e.id]; }).length;
    var h = el("h3", null, u.title + " "); h.appendChild(el("small", null, dn + "/" + u.ex.length)); sec.appendChild(h);
    if (u.sub) sec.appendChild(el("p", "usub", u.sub));
    var path = el("div", "path");
    u.ex.forEach(function(e){
      var isDone = !!state.done[e.id], isCur = cur && cur.ex === e.id && !isDone;
      var n = btn("node" + (isDone ? " done" : "") + (isCur ? " cur" : ""), null, function(){ pick(e.id); });
      n.style.marginLeft = off[k % off.length] + "px"; k++;
      n.appendChild(el("span", "dot", isDone ? "✓" : String(k)));
      var lab = el("span", "lab"); lab.appendChild(el("b", null, e.title));
      lab.appendChild(el("small", null, (isCur ? "Em andamento · " : "") + (state.mode === "sty" ? "Nível " + e.lvl + " · " + e.concept : TYPE[e.type] + " · " + e.concept) + " · " + e.xp + " XP"));
      n.appendChild(lab); path.appendChild(n);
    });
    sec.appendChild(path); p.appendChild(sec);
  });
  renderHFoot();
}
function renderHFoot(){
  var foot = $("hfoot"); foot.textContent = "";
  if (confirmReset){
    foot.appendChild(el("span", null, "Apagar todo o progresso de todas as trilhas?"));
    foot.appendChild(btn("chip danger", "Apagar tudo", function(){ confirmReset = false; try { localStorage.removeItem(KEY); localStorage.removeItem(OLD); } catch(e){} state = fresh(); passed = {}; save(); renderHome(); }));
    foot.appendChild(btn("chip", "Cancelar", function(){ confirmReset = false; renderHome(); }));
  } else foot.appendChild(btn("reset", "Reiniciar progresso", function(){ confirmReset = true; renderHome(); }));
}
$("nome").addEventListener("input", function(){ state.name = this.value.trim().slice(0, 24); saveSoon(); });

function pick(id){
  var ex = EX[id]; state.track = ex.track;
  if (state.done[id]){ openTask(id); return; }
  var c = state.cur[ex.track];
  if (c && c.ex === id){ save(); go("chat"); return; }
  state.cur[ex.track] = {ex:id, extra:false}; save();
  go("chat");
  pushMe("Quero pegar a " + id + ": " + ex.title + ".");
  bossSay(ex.intro.concat([{card:id}]));
}

/* ======================= chat ======================= */
function renderChatHead(){
  var t = TR[state.track];
  $("chat").style.setProperty("--tc", t.color);
  $("cav").textContent = t.boss.ini; $("cname").textContent = t.boss.name;
  $("status").textContent = busy ? "digitando…" : t.boss.role + " · " + t.name;
  $("cxp").textContent = state.xp + " XP"; $("ccount").textContent = doneCount(t) + "/" + t.all.length;
  $("bar").style.width = (doneCount(t) / t.all.length * 100) + "%";
}
function renderMsg(m){
  if (m.from === "sys") return el("div", "sys", m.text);
  var wrap = el("div", "msg " + (m.from === "me" ? "me" : "boss"));
  if (m.use != null){ var uc = useCard(EX[m.use]); if (!uc) return el("div"); wrap.className = "msg boss wide"; wrap.appendChild(uc); }
  else if (m.card != null){ if (!EX[m.card]) return el("div"); wrap.appendChild(renderTicket(m.card)); }
  else { var b = el("div", "bubble"); if (m.text) rich(b, m.text); if (m.code) b.appendChild(el("pre", null, m.code)); wrap.appendChild(b); }
  wrap.appendChild(el("span", "time", m.t || ""));
  return wrap;
}
function renderTicket(id){
  var ex = EX[id], delivered = !!state.done[id], c = state.cur[ex.track], current = c && c.ex === id && !delivered;
  var card = el("div", "ticket");
  var top = el("div", "tid"); top.appendChild(el("span", null, ex.id)); top.appendChild(el("span", null, ex.xp + " XP")); card.appendChild(top);
  card.appendChild(el("h3", null, ex.title));
  var tags = el("div", "tags");
  tags.appendChild(el("span", "tag lvl", "Nível " + ex.lvl)); tags.appendChild(el("span", "tag", ex.concept)); tags.appendChild(el("span", "tag", TYPE[ex.type]));
  tags.appendChild(el("span", "tag " + (delivered ? "done" : "open"), delivered ? "Entregue" : "Aberto"));
  card.appendChild(tags);
  card.appendChild(btn(delivered ? "ghost" : "", delivered ? "Praticar de novo" : current ? (state.code[id] != null ? "Continuar tarefa" : "Abrir tarefa") : "Retomar esta tarefa",
    function(){ if (busy) return; if (delivered || current) openTask(id); else pick(id); }));
  return card;
}
function renderLog(){ var l = chatLog(); logEl.textContent = ""; for (var i = 0; i < visible && i < l.length; i++) logEl.appendChild(renderMsg(l[i])); scrollEnd(); }
function renderComposer(){
  composer.textContent = "";
  if (busy){ composer.appendChild(el("div", "note", TR[state.track].boss.name.split(" ")[0] + " está digitando…")); return; }
  var t = TR[state.track], c = state.cur[t.id], ex = c && EX[c.ex];
  if (ex && !state.done[ex.id]){
    composer.appendChild(btn("chip primary", (state.code[ex.id] != null ? "Continuar " : "Abrir ") + ex.id, function(){ openTask(ex.id); }));
    if (ex.extra && !c.extra) composer.appendChild(btn("chip", "Me mostra mais um exemplo", function(){ c.extra = true; pushMe("Me mostra mais um exemplo?"); bossSay(norm(ex.extra)); }));
    composer.appendChild(btn("chip", "Trocar de tarefa", function(){ go("trilhas"); }));
  } else {
    var nx = nextOf(t);
    var last = EX[state.view], same = last && last.track === t.id ? t.all.filter(function(e){ return e.type === last.type && !state.done[e.id]; })[0] : null;
    if (nx) composer.appendChild(btn("chip primary", "Próxima: " + nx.title, function(){ pick(nx.id); }));
    if (same && same !== nx) composer.appendChild(btn("chip", "Outra de " + TYPE[same.type].toLowerCase(), function(){ pick(same.id); }));
    else composer.appendChild(el("div", "note", "Trilha de " + t.name + " concluída. Você pode praticar qualquer tarefa de novo."));
    composer.appendChild(btn("chip", "Escolher no mapa", function(){ go("trilhas"); }));
  }
}
function renderChat(){ visible = chatLog().length; renderChatHead(); renderLog(); renderComposer(); }
function pushMe(text){ var l = chatLog(); l.push({from:"me", text:text, t:now()}); visible = l.length; logEl.appendChild(renderMsg(l[l.length-1])); scrollEnd(); }
function bossSay(msgs){
  var l = chatLog(), start = l.length, my = ++anim;
  msgs.forEach(function(m){ l.push({from:m.from || "boss", text:m.text != null ? fill(m.text) : "", code:m.code, card:m.card, use:m.use, t:now()}); });
  save(); busy = true; renderChatHead(); renderComposer();
  var i = start;
  (function next(){
    if (my !== anim) return;
    if (i >= l.length){ busy = false; renderChat(); return; }
    var m = l[i], tip = null;
    if (m.from === "boss"){ tip = el("div", "typing"); tip.appendChild(el("i")); tip.appendChild(el("i")); tip.appendChild(el("i")); logEl.appendChild(tip); scrollEnd(); }
    var wait = reduce ? 120 : (m.from === "boss" ? Math.min(1300, 400 + (m.text || "").length * 8) : 350);
    setTimeout(function(){
      if (my !== anim) return;
      if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
      visible = i + 1; logEl.appendChild(renderMsg(m)); scrollEnd(); i++; next();
    }, wait);
  })();
}

/* ======================= bancada ======================= */
var worker = null, runT = null;
function openTask(id){ state.view = id; state.track = EX[id].track; save(); go("tarefa"); }
function canDeliver(id){ if (EX[id].daily) return !bugState().solved[id] && todayBugs().indexOf(EX[id]) >= 0; var c = state.cur[EX[id].track]; return !state.done[id] && c && c.ex === id; }
function grow(){ codeEl.style.height = "auto"; codeEl.style.height = Math.max(180, codeEl.scrollHeight + 4) + "px"; }
function unpass(){ var id = state.view; if (passed[id]){ passed[id] = false; renderFoot(); } }
function shuffle(a){ for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

function renderWork(){
  var id = state.view, ex = EX[id], ed = ex.type === "code" || ex.type === "html";
  $("work").style.setProperty("--tc", TR[ex.track].color);
  $("wid").textContent = ex.daily ? "Bug do dia · " + TR[ex.track].name : ex.id + " · Nível " + ex.lvl + " · " + ex.concept; $("wtitle").textContent = ex.title;
  var br = $("brief"); br.textContent = "";
  ex.brief.forEach(function(b){ if (b.text) br.appendChild(rich(el("p"), b.text)); if (b.code) br.appendChild(el("pre", null, b.code)); });
  if (ex.type === "choice" && ex.code) br.appendChild(el("pre", null, ex.code));
  var les = $("lesson"), boss = TR[ex.track].boss.name.split(" ")[0]; les.textContent = ""; les.open = false; les.hidden = !ex.intro.length;
  les.appendChild(el("summary", null, "Rever a explicação de " + boss));
  ex.intro.concat(norm(ex.extra)).forEach(function(m){ if (m.text) les.appendChild(rich(el("p"), fill(m.text))); if (m.code) les.appendChild(el("pre", null, m.code)); });
  $("edwrap").hidden = !ed; $("quiz").hidden = ed; $("prevwrap").hidden = ex.type !== "html";
  $("run").textContent = ex.type === "code" ? "Rodar testes" : "Verificar";
  $("hint").hidden = !(ex.hints && ex.hints.length);
  $("results").textContent = "";
  if (ed){
    $("edname").textContent = ex.type === "html" ? "index.html" : "solucao.js";
    codeEl.value = state.code[id] != null ? state.code[id] : ex.starter; grow(); buildKeys(ex.type);
    if (ex.type === "html") preview();
  } else {
    fails = 0;
    if (ex.type === "choice" || ex.type === "spot") ans = null;
    if (ex.type === "choice") optOrder = shuffle(ex.options.map(function(o, k){ return k; }));
    else if (ex.type === "fill") ans = ex.answer.map(function(){ return null; });
    else { ans = []; var base = ex.lines.concat(ex.distract || []), tries = 0; do { pool = shuffle(base.slice()); tries++; } while (tries < 6 && pool.slice(0, ex.lines.length).join("\n") === ex.lines.join("\n")); }
    renderQuiz();
  }
  renderHints(); renderFoot(); $("wbody").scrollTop = 0;
}
function touchQuiz(){ unpass(); $("results").textContent = ""; renderQuiz(); }
function renderQuiz(){
  var ex = EX[state.view], q = $("quiz"); q.textContent = "";
  if (ex.type === "choice"){
    optOrder.forEach(function(k, pos){
      var b = btn("opt" + (ans === k ? " on" : ""), null, function(){ ans = k; touchQuiz(); });
      b.setAttribute("aria-pressed", ans === k ? "true" : "false");
      b.appendChild(el("i", null, "ABCD".charAt(pos))); b.appendChild(el("span", null, ex.options[k])); q.appendChild(b);
    });
  } else if (ex.type === "spot"){
    q.appendChild(el("div", "qlabel", "Toque na linha com o problema"));
    var box = el("div", "slots poolbox");
    ex.lines.forEach(function(t, k){
      var b = btn("line spot" + (ans === k ? " on" : ""), null, function(){ ans = k; touchQuiz(); });
      b.setAttribute("aria-pressed", ans === k ? "true" : "false");
      b.appendChild(el("i", null, String(k + 1))); b.appendChild(document.createTextNode(t)); box.appendChild(b);
    });
    q.appendChild(box);
  } else if (ex.type === "fill"){
    var pre = el("pre", "fillcode");
    ex.code.split("___").forEach(function(part, b){
      if (b > 0){ var slot = btn("blank" + (ans[b-1] != null ? " set" : ""), ans[b-1] != null ? ex.bank[ans[b-1]] : "     ", function(){ ans[b-1] = null; touchQuiz(); });
        slot.setAttribute("aria-label", "Lacuna " + b); pre.appendChild(slot); }
      pre.appendChild(document.createTextNode(part));
    });
    q.appendChild(pre);
    q.appendChild(el("div", "qlabel", "Toque numa palavra para preencher a próxima lacuna"));
    var bank = el("div", "bank");
    ex.bank.forEach(function(w, k){
      var b = btn("word", w, function(){ var f = ans.indexOf(null); if (f < 0) return; ans[f] = k; touchQuiz(); });
      b.disabled = ans.indexOf(k) >= 0; bank.appendChild(b);
    });
    q.appendChild(bank);
  } else {
    q.appendChild(el("div", "qlabel", "Sua resposta"));
    var slots = el("div", "slots");
    if (!ans.length) slots.appendChild(el("div", "empty", "Toque nas linhas abaixo, na ordem certa."));
    ans.forEach(function(pi, pos){ slots.appendChild(btn("line", pool[pi], function(){ ans.splice(pos, 1); touchQuiz(); })); });
    q.appendChild(slots);
    q.appendChild(el("div", "qlabel", "Linhas disponíveis (uma delas não entra)"));
    var pl = el("div", "slots poolbox");
    pool.forEach(function(t, pi){ if (ans.indexOf(pi) < 0) pl.appendChild(btn("line", t, function(){ ans.push(pi); touchQuiz(); })); });
    q.appendChild(pl);
  }
}
function checkQuiz(){
  var ex = EX[state.view], id = ex.id, ok, r = $("results"); r.textContent = "";
  if (ex.type === "choice" || ex.type === "spot"){ if (ans == null){ note(ex.type === "spot" ? "Toque em uma linha primeiro." : "Escolha uma opção primeiro."); return; } ok = ans === ex.answer; }
  else if (ex.type === "fill"){ if (ans.indexOf(null) >= 0){ note("Preencha todas as lacunas primeiro."); return; } ok = ans.every(function(k, b){ return ex.bank[k] === ex.answer[b]; }); }
  else { if (!ans.length){ note("Monte sua resposta primeiro."); return; } ok = ans.map(function(pi){ return pool[pi]; }).join("\n") === ex.lines.join("\n"); }
  var box = el("div", "verdict " + (ok ? "ok" : "no"));
  box.appendChild(el("b", null, ok ? "Correto" : "Ainda não. Confira e tente de novo."));
  if (!ok) fails++;
  if (ex.why && (ok || fails >= 2)) box.appendChild(rich(el("p"), (ok ? "" : "Dica: ") + ex.why));
  r.appendChild(box);
  if (ok) showUse(ex);
  passed[id] = ok; renderFoot();
  (ok ? $("wfoot") : box).scrollIntoView({block:"nearest"});
}
function note(t){ $("results").appendChild(el("div", "verdict no", t)); }

function renderHints(){
  var id = state.view, ex = EX[id], hs = ex.hints || [], n = Math.min(state.hints[id] || 0, hs.length), box = $("hints");
  box.textContent = "";
  for (var k = 0; k < n; k++){
    var h = el("div", "hintbox"); h.appendChild(el("b", null, "Dica " + (k+1) + "/" + hs.length));
    if (hs[k].text) h.appendChild(rich(el("span"), hs[k].text));
    if (hs[k].code) h.appendChild(el("pre", null, hs[k].code));
    box.appendChild(h);
  }
  $("hint").disabled = n >= hs.length; $("hint").textContent = n >= hs.length ? "Sem mais dicas" : "Pedir dica";
}
function renderFoot(){
  var id = state.view, f = $("wfoot"), boss = TR[EX[id].track].boss.name.split(" ")[0]; f.textContent = "";
  if (!canDeliver(id)){ f.appendChild(el("span", null, EX[id].daily ? "Bug já resolvido. Amanhã chega outro." : state.done[id] ? "Tarefa já entregue. Fique à vontade para praticar." : "Escolha esta tarefa no mapa para poder entregar.")); return; }
  if (passed[id]) f.appendChild(btn("btn", "Entregar para " + boss, deliver));
  else f.appendChild(el("span", null, "Quando estiver tudo certo, o botão de entrega aparece aqui."));
}
function deliver(){
  var id = state.view, ex = EX[id], t = TR[ex.track];
  if (!canDeliver(id) || !passed[id]) return;
  if (ex.daily){ bugState().solved[id] = true; state.bonus = (state.bonus || 0) + ex.xp; state.xp += ex.xp; state.bugTotal = (state.bugTotal || 0) + 1; touchStreak(); passed[id] = false; save(); go("mensagens"); return; }
  var rankBefore = rankIdx(doneCount());
  state.done[id] = true; state.xp += ex.xp; state.cur[t.id] = null;
  touchStreak();
  go("chat");
  pushMe("Entreguei a " + id + ". Tudo conferido.");
  var msgs = ex.review.concat([{from:"sys", text:"+" + ex.xp + " XP · " + id + " entregue"}]);
  if (realOf(ex)) msgs = msgs.concat([{text:"Antes de seguir, guarda isto: onde você vai usar o que acabou de fazer."}, {use:id}]);
  var rankAfter = rankIdx(doneCount());
  if (rankAfter > rankBefore) msgs = msgs.concat([{text:"{nome}, tenho novidade: saiu a sua promoção. A partir de agora seu cargo é " + RANKS[rankAfter][1] + ". Parabéns!"}, {from:"sys", text:"Promoção: " + RANKS[rankAfter][1]}]);
  if (!nextOf(t)) msgs = msgs.concat([{text:"{nome}, com essa você fechou todas as tarefas de " + t.name + " comigo. Parabéns!"}, {from:"sys", text:"Trilha de " + t.name + " concluída"}]);
  bossSay(msgs);
}

function stopWorker(){ if (worker){ worker.terminate(); worker = null; } clearTimeout(runT); $("run").disabled = false; $("run").textContent = EX[state.view] && EX[state.view].type === "code" ? "Rodar testes" : "Verificar"; }
function errorBox(title, detail){ var r = $("results"); r.textContent = ""; var e = el("div", "errbox"); e.appendChild(el("b", null, title)); if (detail) e.appendChild(el("code", null, detail)); r.appendChild(e); e.scrollIntoView({block:"nearest"}); }
function runTests(){
  var id = state.view, T = EX[id], code = codeEl.value;
  stopWorker();
  var pre = 'var __logs=[];function __f(v){try{return typeof v==="string"?v:JSON.stringify(v)}catch(e){return String(v)}}var __c=function(){if(__logs.length<40)__logs.push(Array.prototype.map.call(arguments,__f).join(" "))};var console={log:__c,info:__c,warn:__c,error:__c};\n';
  var post = '\n;(function(){function eq(a,b){if(typeof a==="number"&&typeof b==="number")return Math.abs(a-b)<1e-9;if(a===b)return true;if(!a||!b||typeof a!=="object"||typeof b!=="object")return false;if(Array.isArray(a)!==Array.isArray(b))return false;var ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(var i=0;i<ka.length;i++){if(!eq(a[ka[i]],b[ka[i]]))return false}return true}' +
    'var T=' + JSON.stringify(T.tests) + ';var fn=(typeof ' + T.fn + '==="function")?' + T.fn + ':null;if(!fn){postMessage({missing:true,logs:__logs});return}var out=[];T.forEach(function(t){var r={ok:false};try{var got=fn.apply(null,JSON.parse(JSON.stringify(t.args)));r.got=got===undefined?"undefined":JSON.stringify(got);r.ok=eq(got,t.want)}catch(e){r.err=String((e&&e.message)||e)}out.push(r)});postMessage({results:out,logs:__logs})})();';
  var url;
  try { url = URL.createObjectURL(new Blob([pre + code + post], {type:"text/javascript"})); worker = new Worker(url); }
  catch(e){ errorBox("Não consegui rodar o código neste navegador.", String(e && e.message || e)); return; }
  $("run").disabled = true; $("run").textContent = "Rodando…";
  var lines = code.split("\n").length;
  worker.onmessage = function(ev){ stopWorker(); URL.revokeObjectURL(url); showResults(T, ev.data); };
  worker.onerror = function(ev){
    if (ev.preventDefault) ev.preventDefault();
    stopWorker(); URL.revokeObjectURL(url);
    var ln = (ev.lineno || 0) - 1, msg = String(ev.message || "Erro de sintaxe").replace(/^Uncaught\s+/, "");
    passed[id] = false; renderFoot();
    errorBox((ln >= 1 && ln <= lines ? "Erro na linha " + ln + " do seu código" : "Erro no seu código. Confira se todas as chaves { } e parênteses foram fechados") + ".", msg);
  };
  runT = setTimeout(function(){ stopWorker(); passed[id] = false; renderFoot(); errorBox("O código demorou demais e foi interrompido.", "Provável laço infinito: confira a condição de parada do seu for ou while."); }, 2500);
}
function showResults(T, data){
  var r = $("results"); r.textContent = "";
  if (data.missing){ passed[T.id] = false; renderFoot(); errorBox("Não encontrei a função " + T.fn + ".", "Mantenha o nome exatamente como está na tarefa: function " + T.fn + "(...) { }"); return; }
  var okN = data.results.filter(function(x){ return x.ok; }).length, all = okN === T.tests.length;
  r.appendChild(el("h4", null, all ? "Todos os " + okN + " testes passaram" : okN + " de " + T.tests.length + " testes passaram"));
  data.results.forEach(function(x, k){
    var t = T.tests[k], d = el("div", "test " + (x.ok ? "ok" : "no"));
    d.appendChild(el("span", "st", x.ok ? "✓ Passou" : "✗ Falhou"));
    d.appendChild(el("div", null, T.fn + "(" + t.args.map(function(a){ return JSON.stringify(a); }).join(", ") + ")"));
    if (!x.ok){
      var a = el("div"); a.appendChild(el("span", "lbl", "esperado: ")); a.appendChild(document.createTextNode(JSON.stringify(t.want))); d.appendChild(a);
      var b = el("div"); b.appendChild(el("span", "lbl", x.err ? "erro:     " : "recebido: ")); b.appendChild(document.createTextNode(x.err || x.got)); d.appendChild(b);
    }
    r.appendChild(d);
  });
  if (data.logs && data.logs.length){ var c = el("div", "console"); c.appendChild(el("b", null, "Saída do console.log")); c.appendChild(document.createTextNode(data.logs.join("\n"))); r.appendChild(c); }
  passed[T.id] = all; renderFoot();
  if (all) showUse(T);
  (all ? $("wfoot") : r).scrollIntoView({block:"nearest"});
}

/* páginas: prévia e conferência do HTML */
function parse(src){ return new DOMParser().parseFromString(src, "text/html"); }
function preview(){
  var host = $("preview");
  try {
    if (!shadow){ shadow = host.attachShadow({mode:"open"}); shadow.addEventListener("click", function(e){ e.preventDefault(); }); shadow.addEventListener("submit", function(e){ e.preventDefault(); }); }
    var doc = parse(codeEl.value), css = "";
    [].slice.call(doc.querySelectorAll("script,iframe,object,embed,link,meta,base")).forEach(function(n){ n.parentNode.removeChild(n); });
    [].slice.call(doc.querySelectorAll("*")).forEach(function(n){ [].slice.call(n.attributes).forEach(function(a){ if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); }); });
    [].slice.call(doc.querySelectorAll("style")).forEach(function(s){ css += s.textContent + "\n"; s.parentNode.removeChild(s); });
    shadow.innerHTML = "<style>:host{all:initial;display:block;font-family:system-ui,sans-serif;font-size:16px;line-height:1.4;color:#12262d;padding:14px}\n" + css.replace(/<\//g, "<\\/") + "</style>" + doc.body.innerHTML;
  } catch(e){ host.textContent = "Prévia indisponível neste navegador."; }
}
function checkHtml(){
  var ex = EX[state.view], src = codeEl.value, doc = parse(src), r = $("results"), okN = 0; r.textContent = "";
  var rows = ex.checks.map(function(c){
    var ok;
    if (c.q){ var ns = [].slice.call(doc.querySelectorAll(c.q)); if (c.filled) ns = ns.filter(function(n){ return n.textContent.trim() !== ""; }); ok = ns.length >= (c.min || 1); }
    else ok = new RegExp(c.re, "i").test(src);
    if (ok) okN++;
    var d = el("div", "test " + (ok ? "ok" : "no")); d.appendChild(el("span", "st", ok ? "✓ Feito" : "✗ Falta")); d.appendChild(el("div", "plain", c.desc)); return d;
  });
  var all = okN === ex.checks.length;
  r.appendChild(el("h4", null, all ? "Página conferida: tudo certo" : okN + " de " + ex.checks.length + " itens prontos"));
  rows.forEach(function(d){ r.appendChild(d); });
  passed[ex.id] = all; renderFoot();
  if (all) showUse(ex);
  (all ? $("wfoot") : r).scrollIntoView({block:"nearest"});
}

/* editor */
function insert(text){
  var s = codeEl.selectionStart, e = codeEl.selectionEnd, v = codeEl.value;
  codeEl.value = v.slice(0, s) + text + v.slice(e); codeEl.selectionStart = codeEl.selectionEnd = s + text.length; onEdit();
}
function onEdit(){
  var id = state.view; if (!id) return; state.code[id] = codeEl.value; unpass(); grow(); saveSoon();
  if (EX[id].type === "html"){ clearTimeout(prevT); prevT = setTimeout(preview, 250); }
}
var KEYS = {code:["tab","{","}","(",")","[","]",";","=","\"","`","$",".",",","+","-","*","/","<",">","!","&","|",":","'"],
            html:["tab","<",">","/","=","\"","{","}",":",";",".","#","-","(",")"]};
function buildKeys(type){
  var box = $("keys"); box.textContent = "";
  KEYS[type].forEach(function(k){
    var b = btn(null, k, function(){ codeEl.focus(); insert(k === "tab" ? "  " : k); });
    b.setAttribute("aria-label", k === "tab" ? "Indentar" : "Inserir " + k);
    b.addEventListener("pointerdown", function(e){ e.preventDefault(); }); box.appendChild(b);
  });
}
codeEl.addEventListener("input", onEdit);
codeEl.addEventListener("keydown", function(e){
  if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.metaKey){ e.preventDefault(); insert("  "); }
  else if (e.key === "Enter" && !e.isComposing){
    var s = codeEl.selectionStart, before = codeEl.value.slice(0, s), line = before.slice(before.lastIndexOf("\n") + 1);
    var ind = (line.match(/^\s*/) || [""])[0]; if (/[{>]\s*$/.test(line) && !/<\/[^>]+>\s*$/.test(line)) ind += "  ";
    if (ind){ e.preventDefault(); insert("\n" + ind); }
  }
});
$("run").addEventListener("click", function(){ var t = EX[state.view].type; if (t === "code") runTests(); else if (t === "html"){ preview(); checkHtml(); } else checkQuiz(); });
$("hint").addEventListener("click", function(){ var id = state.view; state.hints[id] = (state.hints[id] || 0) + 1; save(); renderHints(); $("hints").scrollIntoView({block:"nearest"}); });
$("restore").addEventListener("click", function(){ codeEl.value = EX[state.view].starter; onEdit(); $("results").textContent = ""; });
$("back").addEventListener("click", function(){ save(); go(EX[state.view].daily ? "mensagens" : canDeliver(state.view) ? "chat" : "trilhas"); });
$("tohome").addEventListener("click", function(){ go("trilhas"); });

/* ======================= partida ======================= */
function start(data){
  state = (data && data.v === 2) ? data : (load() || fresh());
  ["done","logs","cur","code","hints"].forEach(function(k){ if (!state[k] || typeof state[k] !== "object") state[k] = {}; });
  if (!TR[state.track]) state.track = TRACKS[0].id;
  if (state.mode !== "sty") state.mode = "mod";
  state.xp = calcXp();
  curHash = location.hash; route();
}
if (window.__TEST) window.__TEST({state:function(){ return state; }, EX:EX, TRACKS:TRACKS, DAILY:DAILY, pick:pick, openTask:openTask, checkQuiz:checkQuiz, deliver:deliver, go:go, passed:passed,
  setAns:function(a){ ans = a; }, pool:function(){ return pool; }, todayBugs:todayBugs, exportCode:exportCode, importCode:importCode, useCard:useCard});
var hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(function(){ return state; });
if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();
