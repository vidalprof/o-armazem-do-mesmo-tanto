/* ============================================================
   O ARMAZÉM DO MESMO TANTO — as vinte e cinco folhas (multiplicação, 3º ano).

   Cada folha nasceu de um VERBO impresso numa folha real de matemática — as 40
   colhidas em `_sequencias/folhas_mult/` e lidas uma a uma no crivo
   `_sequencias/POTE-MULT.md`, que diz de qual folha veio cada gesto e por que
   sete foram recusadas. Nenhuma mecânica foi escolhida do nosso cardápio: a
   folha de papel é que manda (regra do Marcos, 13/set/2026).

   ⚠️ As três coisas que este arquivo NÃO pode esquecer, e que estão medidas:
      · os fatores param em 2, 3, 4, 5 e 10 (teto da rede para o 3º ano);
      · `q grupos de n` escreve-se `q × n` — a virada é assunto da folha 20;
      · dado de folha (`var x = ...`) mora no TOPO, nunca no fim do arquivo.
   ============================================================ */

var livro = document.getElementById("livro"), PAGEL = [];

/* ⚠️ DADO DE FOLHA MORA NO TOPO, e esta é uma lição paga em 13/set/2026, no
   navegador. Eu escrevi as catorze folhas novas no FIM do arquivo, com os
   dados delas junto — e `function` sobe (hoisting), mas `var x = ...` NÃO: a
   declaração sobe vazia e a atribuição fica onde está. Resultado: `monta()`
   rodava, chamava a folha 2 e estourava em `POEMA.forEach` de um `undefined`,
   e o caderno morria na folha 2 sem nenhum erro de sintaxe. O `node --check`
   passou; quem pegou foi o `andar_folha.js`, abrindo no navegador. */
function faixa(d, i, titulo){ d.appendChild(el("div", "faixa", '<div class="num">' + i + '</div><h2>' + titulo + '</h2>')); }
function aoAbrir(d, fn){ if(!d._aoAbrir) d._aoAbrir = []; d._aoAbrir.push(fn); }
/* ---------- O ALTO-FALANTE (pedido do Marcos, set/2026) ----------
   Palavras dele: *"os enunciados podem ter o botão de som para a criança clicar
   e ouvir"* e *"assim como as palavras"*.

   É regra da casa e tem motivo: no 1º ano metade da turma ainda soletra. Tudo o
   que a criança PRECISA LER tem que poder ser OUVIDO, senão ela responde pelo
   desenho e a folha vira loteria.

   ⚠️ O desenho do alto-falante é CSS puro — caixinha + triângulo + duas ondas
   feitas com borda arredondada. Nada de emoji (vira quadradinho nos PCs da
   escola) e nada de SVG (ordem dele). */
function botaoSom(rot, aoTocar){
  var b = el("button", "som");
  b.innerHTML = '<i class="cone"></i><i class="onda o1"></i><i class="onda o2"></i>';
  b.setAttribute("aria-label", rot || "Ouvir");
  b.onclick = function(ev){ ev.stopPropagation(); sPasso(); aoTocar(); };
  return b;
}
function enunciado(d, pi, texto, chave){
  var cx = el("div", "enunlin");
  cx.appendChild(el("div", "enun", texto));
  cx.appendChild(botaoSom("Ouvir o que a folha pede", function(){ falar(chave); }));
  d.appendChild(cx);
}
function item(n){ return el("div", "item", n ? '<span class="n">' + n + '.</span>' : ""); }
/* fecha o item e o prega na folha — o padrão que o `_alfa1` repetia à mão em
   cada uma das onze folhas (marca o `feito`, o `data-qa` do jogador e anexa) */
function fechaItem(d, box, id){
  if(ST.resp[id]) box.className = "item feito";
  box.setAttribute("data-qa", "item-" + id);
  d.appendChild(box);
}

function monta(){
  livro.innerHTML = ""; PAGEL = []; RESP = {};
  var caps = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13,
              f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25], i;
  for(i = 0; i < caps.length; i++){
    var d = el("div", "pagina" + (i > 0 ? " " + CORES[i - 1] : "")); d.setAttribute("data-pag", i);
    caps[i](d, i);
    if(i > 0) d.appendChild(el("div", "carimbo", "FOLHA<br>PRONTA"));
    livro.appendChild(d); PAGEL.push(d);
  }
}

/* ---------- fileira de opções (usada em várias folhas) ----------
   `soltarEm` (opcional) liga o ARRASTAR: a criança pode puxar a figura até o
   quadro vazio em vez de só tocar nela. Pedido do Marcos, set/2026:
   *"da atividade o que vem depois a criança pode tanto clicar como arrastar a
   imagem até o local"*. As DUAS portas, sempre — no PC da escola ela usa o
   mouse e arrastar é o gesto natural; no celular, tocar é. */
function opcoes(pai, pi, id, lista, certa, cls, falaCerto, falaDica, aoAcertar, soltarEm){
  registra(id, pi, certa);
  var box = el("div", "ops"), feito = !!ST.resp[id];
  function responde(o, b){
    if(ST.resp[id]) return;
    sPasso(); if(o.fala) falar(o.fala);
    if(o.v === certa){
      b.className = "op" + (cls ? " " + cls : "") + " certa";
      if(aoAcertar) aoAcertar(b);
      setTimeout(function(){ acertou(id, falaCerto); }, aoAcertar ? 620 : 240);
    } else {
      b.className = "op" + (cls ? " " + cls : "") + " erro";
      setTimeout(function(){ b.className = "op" + (cls ? " " + cls : ""); }, 500);
      errou(id, falaDica);
    }
  }
  lista.forEach(function(o){
    var b = el("button", "op" + (cls ? " " + cls : "") + (feito && o.v === certa ? " certa" : ""), o.rot);
    b.setAttribute("data-qa", "op-" + id + "-" + o.v);
    b.setAttribute("aria-label", o.aria || o.v);
    b.onclick = function(){ if(b._arrastou){ b._arrastou = false; return; } responde(o, b); };
    if(soltarEm) puxavel(b, soltarEm, function(){ responde(o, b); });
    box.appendChild(b);
  });
  pai.appendChild(box);
}

/* ---------- PUXAR uma peça até um alvo (mouse, dedo e caneta) ----------
   ⚠️ Pointer Events e não mouse+touch separados: no celular o navegador dispara
   eventos de mouse FANTASMA depois do toque, e foi assim que o arrastar já
   quebrou duas vezes nesta casa. Aqui o `setPointerCapture` prende o ponteiro
   no botão e o mesmo código serve para os três.
   ⚠️ E nada de `preventDefault` no início: isso mataria o toque. Só depois de
   o dedo ANDAR 8 px é que vira arrasto — antes disso continua sendo um toque
   normal, e o `onclick` responde igual. */
var PUXA = null;   /* o arrasto em andamento (um de cada vez) */

function puxavel(bt, alvos, aoSoltar){
  if(!alvos.push) alvos = [alvos];
  bt.style.touchAction = "none";
  bt.addEventListener("pointerdown", function(ev){
    if(ev.button && ev.button !== 0) return;
    PUXA = {bt: bt, alvos: alvos, aoSoltar: aoSoltar,
            x0: ev.clientX, y0: ev.clientY,
            lx: ev.clientX, ly: ev.clientY,   /* último lugar onde o dedo esteve */
            andando: false, fantasma: null};
  });
}

/* ⚠️⚠️ DUAS LIÇÕES PAGAS AQUI (set/2026), as duas achadas por teste e nenhuma
   delas dava erro na tela — o arrasto simplesmente não acontecia:

   1. `setPointerCapture` no próprio botão + `pointermove` NELE: só o primeiro
      movimento chegava. O padrão certo é ouvir no DOCUMENTO — o dedo precisa
      poder SAIR de cima da peça, que é justamente o que ele faz ao levá-la.

   2. O navegador FUNDE os movimentos (coalescing). Num teste com 8 passos
      chegou UM `pointermove`, de 5 px. Se eu decidir "isto é um arrasto" pela
      contagem de movimentos, perco a jogada. Então quem MANDA é a SOLTURA:
      apertou na peça e soltou em cima do alvo = soltou ali, tenham chegado dez
      movimentos ou um. O fantasma que segue o dedo é enfeite útil; a resposta
      não depende dele.

   E um só par de ouvintes no documento, não um por peça: com 18 figuras numa
   folha eram 18 cópias do mesmo tratador rodando a cada movimento. */
function _puxaAnda(ev){
  var P = PUXA; if(!P) return;
  P.lx = ev.clientX; P.ly = ev.clientY;
  var dx = ev.clientX - P.x0, dy = ev.clientY - P.y0;
  if(!P.andando){
    if(dx * dx + dy * dy < 64) return;            /* menos de 8 px: ainda é toque */
    P.andando = true; P.bt._arrastou = true;
    var f = P.bt.cloneNode(true);
    f.className = "fantasma " + P.bt.className;
    var r = P.bt.getBoundingClientRect();
    f.style.width = r.width + "px"; f.style.height = r.height + "px";
    f._ox = r.left; f._oy = r.top;
    document.body.appendChild(f); P.fantasma = f;
    P.bt.className = P.bt.className + " puxada";
  }
  if(ev.cancelable) ev.preventDefault();
  P.fantasma.style.left = (P.fantasma._ox + dx) + "px";
  P.fantasma.style.top = (P.fantasma._oy + dy) + "px";
  P.alvos.forEach(function(a){
    a.className = a.className.replace(/ ?perto/, "") + (sobre(ev, a) ? " perto" : "");
  });
}
function _puxaSolta(ev){
  var P = PUXA; if(!P) return;
  PUXA = null;
  P.alvos.forEach(function(a){ a.className = a.className.replace(/ ?perto/, ""); });
  P.bt.className = P.bt.className.replace(/ ?puxada/, "");
  if(P.fantasma && P.fantasma.parentNode) P.fantasma.parentNode.removeChild(P.fantasma);
  /* ⚠️ TERCEIRA LIÇÃO PAGA: o `pointercancel` chega ANTES do `pointerup` e vem
     com clientX/clientY = 0,0. Quem usasse a coordenada dele concluiria que a
     criança soltou no canto superior esquerdo da tela — e a peça nunca cairia
     no lugar. Por isso o último ponto REAL fica guardado (`lx`,`ly`) e é ele
     que manda quando o evento chega sem posição. */
  var px = ev.clientX, py = ev.clientY;
  if(!px && !py){ px = P.lx; py = P.ly; }
  var onde = {clientX: px, clientY: py};
  var andou = (px - P.x0) * (px - P.x0) + (py - P.y0) * (py - P.y0) >= 64;
  if(!andou) return;                              /* foi toque, o onclick resolve */
  P.bt._arrastou = true;
  var i;
  for(i = 0; i < P.alvos.length; i++){
    if(sobre(onde, P.alvos[i])){ P.aoSoltar(P.alvos[i], i); break; }
  }
  setTimeout(function(){ P.bt._arrastou = false; }, 60);
}
/* e o arrasto NATIVO do navegador fica desligado na atividade inteira: era ele
   que disparava o `pointercancel` e matava o nosso. */
document.addEventListener("dragstart", function(ev){ ev.preventDefault(); });
document.addEventListener("pointermove", _puxaAnda);
document.addEventListener("pointerup", _puxaSolta);
document.addEventListener("pointercancel", _puxaSolta);

function sobre(ev, alvo){
  var r = alvo.getBoundingClientRect(), m = 14;
  return ev.clientX >= r.left - m && ev.clientX <= r.right + m &&
         ev.clientY >= r.top - m && ev.clientY <= r.bottom + m;
}

/* ============ 1 — A FILA DO ALFABETO (sequência alfabética) ============
   Da folha impressa: *"complete a sequência do alfabeto"* / *"que letra vem
   depois?"* — está em quase toda folha de 1º ano.

   ⚠️ POR QUE ELA É A FOLHA 1 (parecer pedagógico, set/2026): o currículo de
   Blumenau abre o 1º ano com *"nomear as letras do alfabeto e ordená-las"*, e a
   atividade não tinha nenhuma folha disso — o Marcos tinha pedido no encargo
   ("sequência alfabética") e escapou. Ordenar letra é o degrau anterior a tudo
   o que vem depois; por isso ela abre o caderno.

   O ANDAIME: mostra-se um pedacinho da fila (três letras) com um buraco no
   meio, nunca o alfabeto inteiro — carga cognitiva de uma ideia por vez
   (Sweller). A criança escolhe entre três letras VIZINHAS na fila, que é o que
   força olhar a ordem em vez de reconhecer a forma. *//* ============================================================
   O DESFILE DAS LETRAS — as dez folhas

   ⭐ Degrau 0 da sequência de alfabetização (`_sequencias/SD-MONTADA-DE-FOLHAS-SOLTAS.md`).
   Cada folha veio de uma FOLHA REAL de professor — as 45 em `_sequencias/folhas_d0/`
   — e é fiel ao comando impresso. O que muda é só o GESTO.

   ⚠️ O CRIVO DO PEDAGOGO CORTOU MAIS DA METADE, e o motivo importa: sete das 24
   folhas da primeira colheita pediam ORDENAR PALAVRAS alfabeticamente (BANANA,
   XÍCARA, CEBOLA…) e várias mandavam ESCREVER a lista inteira. Isso é 2º/3º ano:
   supõe que a criança já lê e escreve com fluência. No 1º ano ela ainda está
   NOMEANDO as letras. Ordenar palavra pela 1ª letra só faz sentido depois que a
   ordem das letras está automática — que é justamente o que este caderno constrói.

   ⚠️ E TUDO EM LETRA BASTÃO MAIÚSCULA. Foi uma professora que apontou isso nos
   comentários de uma das folhas: *"por que não usar as letras em bastão
   maiúsculas tanto no comando quanto nos exercícios?"*. Ela tem razão — a
   criança que está aprendendo o alfabeto lê bastão, não cursiva nem minúscula.
   Duas folhas da colheita foram descartadas por isso (uma em minúscula, uma com
   teclado QWERTY, que não é ordem alfabética coisa nenhuma).

   ⚠️ A ESCADA É DE DIFICULDADE, não a ordem das folhas de papel:
     reconhecer a letra → nomear → achar a que falta → DEPOIS (fácil: recita-se
     para frente) → ANTES (difícil: obriga a voltar) → as duas juntas →
     ordenar → achar o intruso → a letra da palavra → o mural.
   ============================================================ */

function riscoDeCircular(grade, botoes, alterna){
  var cv = document.createElement("canvas");
  cv.className = "riscocv"; grade.appendChild(cv);
  var ctx = cv.getContext("2d"), pts = [], riscando = false, ultRisco = 0;
  function tamanho(){
    var r = grade.getBoundingClientRect();
    if(!r.width) return;
    cv.width = r.width; cv.height = r.height;
    cv.style.width = r.width + "px"; cv.style.height = r.height + "px";
  }
  function pinta(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    if(pts.length < 2) return;
    ctx.strokeStyle = "#e0562f"; ctx.lineWidth = 5;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for(var k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
    ctx.stroke();
  }
  function ponto(ev){
    var r = cv.getBoundingClientRect();
    return {x: ev.clientX - r.left, y: ev.clientY - r.top};
  }
  grade.addEventListener("pointerdown", function(ev){
    /* ⚠️ no dedo o traço não começa (rolar a página é mais importante);
       quem atende o toque é o clique de cada botão, ligado lá embaixo. */
    if(ev.pointerType === "touch") return;
    tamanho(); riscando = true; pts = [ponto(ev)];
    cv.className = "riscocv ativo";
    try { grade.setPointerCapture(ev.pointerId); } catch(e){}
  });
  grade.addEventListener("pointermove", function(ev){
    if(!riscando) return;
    pts.push(ponto(ev)); pinta();
  });
  function fim(){
    if(!riscando) return;
    riscando = false; cv.className = "riscocv";
    var comp = 0, k;
    for(k = 1; k < pts.length; k++)
      comp += Math.abs(pts[k].x - pts[k-1].x) + Math.abs(pts[k].y - pts[k-1].y);
    if(comp > 60){
      var r0 = cv.getBoundingClientRect(), w;
      for(w in botoes){
        var rb = botoes[w].getBoundingClientRect();
        if(dentro(pts, rb.left - r0.left + rb.width / 2, rb.top - r0.top + rb.height / 2)){
          /* ⚠️ ARRAY dá ÍNDICE, OBJETO dá CHAVE — e a resposta de quem monta
             espera o BOTÃO quando passou um array. Sem esta linha, `alterna`
             recebia "0" no lugar do elemento, `b._w` era undefined e circular
             a resposta CERTA caía no ramo do erro. Sempre. */
          ultRisco = Date.now();
          alterna(botoes.length !== undefined ? botoes[w] : w);
        }
      }
    }
    pts = []; ctx.clearRect(0, 0, cv.width, cv.height);
  }
  grade.addEventListener("pointerup", fim);
  grade.addEventListener("pointercancel", fim);
  grade.addEventListener("pointerleave", fim);

  /* ⭐ A SEGUNDA PORTA (regra da casa: nunca só uma). Circular com o rato é o
     gesto que a folha de papel pede; tocar é o gesto que o celular tem. Este
     `click` atende os dois — o toque simples e o clique do rato do PC.
     ⚠️ O guarda de 400 ms existe porque soltar o traço EM CIMA de um botão
        também dispara `click`: sem ele, circular contaria duas vezes. */
  (function(){
    var k;
    for(k in botoes) (function(w){
      var e = botoes[w];
      if(!e || !e.addEventListener) return;
      e.addEventListener("click", function(){
        if(Date.now() - ultRisco < 400) return;
        alterna(botoes.length !== undefined ? e : w);
      });
    })(k);
  })();
}
/* ponto dentro do rabisco: conta quantas vezes uma reta para a direita cruza o
   traço (fechando o último ponto no primeiro). Ímpar = está dentro. */
function dentro(pts, x, y){
  var n = pts.length, cruz = false, i, j;
  if(n < 3) return false;
  for(i = 0, j = n - 1; i < n; j = i++){
    var yi = pts[i].y, yj = pts[j].y, xi = pts[i].x, xj = pts[j].x;
    if(((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) cruz = !cruz;
  }
  return cruz;
}

/* ============ 4 — CIRCULE QUEM COMEÇA IGUAL (sílaba inicial) ============
   Da folha: *"circule os desenhos que se iniciam com a sílaba CA"* (d12/d02). */var LAPIS = [
  {n: "roxo",    c: "#7c3aed", claro: "#ede9fe"},
  {n: "laranja", c: "#ea580c", claro: "#ffedd5"},
  {n: "verde",   c: "#0f9d58", claro: "#dcfce7"},
  {n: "rosa",    c: "#db2777", claro: "#fce7f3"}
];
var LAPIS_ESCOLHIDO = 0;

function estojo(pai){
  var cx = el("div", "estojo");
  cx.appendChild(el("span", "rot", "Escolha a cor:"));
  LAPIS.forEach(function(L, k){
    var b = el("button", "lapis" + (k === LAPIS_ESCOLHIDO ? " esc" : ""));
    b.style.background = L.c;
    b.setAttribute("aria-label", "Canetinha " + L.n);
    b.setAttribute("data-qa", "lapis-" + L.n);
    b.onclick = function(){
      LAPIS_ESCOLHIDO = k; sPasso();
      var ir = cx.childNodes, j;
      for(j = 1; j < ir.length; j++) ir[j].className = "lapis" + (j - 1 === k ? " esc" : "");
    };
    cx.appendChild(b);
  });
  pai.appendChild(cx);
}
function montaLigar(caixa, pi, tag, pares, pagina){
  var box = el("div", "ligar"), ce = el("div", "col"), cd = el("div", "col");
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "linhas");
  box.appendChild(ce); box.appendChild(cd); box.appendChild(svg); caixa.appendChild(box);
  var ordem = baralha(pares.map(function(_, i){ return i; }));
  var E = {}, D = {}, marcada = null;
  pares.forEach(function(P){ registra("l" + pi + tag + "_" + P.k, pi, P.k); });
  function centro(e, lado){
    var r = e.getBoundingClientRect(), b = box.getBoundingClientRect();
    return {x: (lado === "e" ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top};
  }
  /* ⭐ O TRAÇO (pedido do Marcos, set/2026: *"melhore o traço que liga para
     parecer mais profissional"*). Antes era um segmento reto de ponta a ponta.
     Agora é uma CURVA suave — sai na horizontal de cada caixa e vira no meio,
     como o cabo de um painel — com um halo branco por baixo (para o traço não
     sumir quando passa por cima de outra caixa) e um pontinho cheio em cada
     ponta, que é o que dá o acabamento de "ligado". */
  function linha(a, b2, cor){
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var dx = Math.max(28, Math.abs(b2.x - a.x) * 0.45);
    var d = "M" + a.x + "," + a.y +
            " C" + (a.x + dx) + "," + a.y +
            " " + (b2.x - dx) + "," + b2.y +
            " " + b2.x + "," + b2.y;
    var halo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    halo.setAttribute("d", d); halo.setAttribute("fill", "none");
    halo.setAttribute("stroke", "#ffffff"); halo.setAttribute("stroke-width", 11);
    halo.setAttribute("stroke-linecap", "round");
    var l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", d); l.setAttribute("fill", "none");
    l.setAttribute("stroke", cor); l.setAttribute("stroke-width", 6);
    l.setAttribute("stroke-linecap", "round");
    g.appendChild(halo); g.appendChild(l);
    [a, b2].forEach(function(p){
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 6);
      c.setAttribute("fill", cor); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", 2.5);
      g.appendChild(c);
    });
    svg.appendChild(g); return g;
  }
  function desmarca(){ if(marcada) marcada.el.className = marcada.el.className.replace(" marcada", ""); marcada = null; }
  function redesenha(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(var k in E) if(ST.lig["l" + pi + tag + "_" + k]) linha(centro(E[k].el, "e"), centro(D[k].el, "d"), "#15a34a");
  }
  aoAbrir(pagina, redesenha);
  window.addEventListener("resize", function(){ if(pagina.className.indexOf("viva") > -1) redesenha(); });
  function fecha(Re, Rd){
    var id = "l" + pi + tag + "_" + Re.k;
    if(Rd.k === Re.k){
      ST.lig[id] = 1; tentativa(id, true); ST.resp[id] = 1; salvar();
      Re.el.className += " feita"; Rd.el.className += " feita"; desmarca(); redesenha(); sCerto();
      falar(Re.fc); setTimeout(function(){ confereFolha(pi); }, 850);
    } else {
      tentativa(id, false); sErro();
      Rd.el.className += " treme";
      setTimeout(function(){ Rd.el.className = Rd.el.className.replace(" treme", ""); }, 500);
      falar(ST.tent[id].erros >= 2 ? Re.dica : "quase");
      if(ST.tent[id].erros >= 2 && D[Re.k].el.className.indexOf("feita") < 0) D[Re.k].el.className += " mostra";
    }
  }
  pares.forEach(function(P){
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.esq);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-e-" + P.k);
    e.setAttribute("aria-label", esc(P.w));
    var R = {k: P.k, el: e, fc: P.fc, dica: P.dica};
    E[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; sPasso(); falar(P.fe);
    });
    e.onkeydown = function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); desmarca(); marcada = R; e.className += " marcada"; falar(P.fe); } };
    ce.appendChild(e);
  });
  ordem.forEach(function(j){
    var P = pares[j];
    var e = el("div", "ponta" + (ST.lig["l" + pi + tag + "_" + P.k] ? " feita" : ""), P.dir);
    e.setAttribute("role", "button"); e.setAttribute("tabindex", "0");
    e.setAttribute("data-qa", "lig" + tag + "-d-" + P.k);
    e.setAttribute("aria-label", esc(P.wd || P.k));
    var R = {k: P.k, el: e}; D[P.k] = R;
    e.addEventListener("pointerdown", function(ev){
      if(e.className.indexOf("feita") > -1) return;
      ev.preventDefault();
      if(marcada) fecha(marcada, R); else { sPasso(); falar(P.fd); falarDepois("ligue", 900); }
    });
    e.onkeydown = function(ev){ if((ev.key === "Enter" || ev.key === " ") && marcada){ ev.preventDefault(); fecha(marcada, R); } };
    cd.appendChild(e);
  });
}

/* ---------- O TECLADO DE NÚMEROS ----------
   ⚠️ Veio do caderno de alfabetização, onde as teclas eram LETRAS. Num caderno
      de multiplicação a criança digita ALGARISMOS — e trocar as teclas não
      basta: o `document.onkeydown` (a segunda porta, o teclado de verdade do PC
      da escola) também tinha que passar a aceitar dígito. Deixar só um dos dois
      é o defeito que o Marcos já pegou duas vezes noutro lugar. */
/* ---------- ROLAR A PALAVRA PARA CIMA DO TECLADO ----------
   ⚠️⚠️ O TECLADO TAPAVA A ATIVIDADE, e o Marcos viu no celular (15/set/2026):
      *"ele preenche a tela e não dá para ver a atividade"*. Medido: na
      cruzadinha de 360x640 o teclado ocupava 368 px de 640 e a grade ficava
      INTEIRA por baixo dele — a criança escrevia às cegas.
   ⚠️ E A REGRA TEM DOIS DEGRAUS, porque medir só um não bastou:
      1. se a PALAVRA inteira cabe na faixa que sobra, ela sobe inteira;
      2. se não cabe (palavra em pé, tela de 320x568 — medido), sobe a CASINHA
         QUE ESTÁ SENDO ESCRITA, centrada na faixa. É o que um campo de texto
         faz: mantém à vista a letra que a pessoa está digitando.
   Por isso ela é chamada duas vezes: ao abrir o teclado e a cada letra.
   ⚠️⚠️ E ELA ATENDE OS DOIS TECLADOS DA CASA, o que é a lição paga aqui
      (15/set/2026): há dois desenhos de teclado nos cadernos de folha viva —
      o da CRUZADINHA, que escreve numa fila de casinhas (`CRUZ.E.cels`), e o
      da SÍLABA/PALAVRA, que escreve numa quadra só (`ATIVA.q`). Eu escrevi
      esta função ancorada no primeiro e a enfiei nos dezoito cadernos pelo
      `function abreCruz(` — que só existe em TRÊS. Nos outros quinze ficou a
      CHAMADA sem a função: `setTimeout(rolaParaCruz, 60)` estourava
      ReferenceError e matava o resto de `ativa()`, que era justamente quem
      escrevia a dica e falava com a criança. O teclado abria mudo.
      O `node --check` não vê isso (a sintaxe está perfeita); quem vê é o
      `_qa/funcoes.py`, o portão "função que não existe" — que eu não rodei. */
function rolaParaCruz(){
  /* de quem é a vez: a fila da cruzadinha, ou a quadra única do outro teclado */
  /* ⚠️⚠️ LÊ AS DUAS PELO `window`, e isto NÃO é preciosismo: escrito como
     `typeof CRUZ !== "undefined" && CRUZ && CRUZ.E`, o `CRUZ` nu depois do `&&`
     é acusado de `'CRUZ' is not defined` pelo ESLint nos cadernos que não têm
     cruzadinha (ele não faz análise de fluxo, e o `typeof` só protege a
     primeira ocorrência). E esse ESLint é o portão 0a2 que roda DENTRO do
     `entregar.yml`, antes de publicar: com ele vermelho, NADA sobe. Foi assim
     que quatro publicações minhas falharam seguidas hoje, sem eu entender por
     quê — e o pré-voo daqui não pega, porque o ESLint não está instalado no
     container. Como `CRUZ` e `ATIVA` são `var` globais, elas são propriedades
     de `window`, e ler por ali funciona igual e é declarado. */
  var cs = [], i, andando = 0;
  var _cruz = window.CRUZ, _ativa = window.ATIVA;
  if(_cruz && _cruz.E && _cruz.E.cels){
    for(i = 0; i < _cruz.E.cels.length; i++)
      if(_cruz.E.cels[i] && _cruz.E.cels[i].getBoundingClientRect) cs.push(_cruz.E.cels[i]);
    andando = _cruz.val ? _cruz.val.length : 0;
  } else if(_ativa && _ativa.q && _ativa.q.getBoundingClientRect){
    cs.push(_ativa.q);
  }
  if(!cs.length) return;
  var tkel = document.getElementById("teclado");
  if(!tkel || tkel.className.indexOf("aberto") < 0) return;
  var tk = tkel.getBoundingClientRect(), topo = 56, pe = tk.top - 10;
  /* ⚠️ A RESERVA DE ROLAGEM SAI DA ALTURA REAL DO TECLADO, e não de um
     número fixo. Ela nasceu como `padding-bottom:460px` no `comtec`, que
     é certo para o teclado de LETRAS (336 px medidos a 360x640, 41
     teclas) e exagerado para o de NÚMEROS (160 px, 12 teclas): sobravam
     300 px de vazio para a criança rolar à toa enquanto digita. Como o
     `comtec` sai da tag `body` ao fechar, a variável pode ficar guardada
     sem fazer mal nenhum. */
  document.documentElement.style.setProperty("--tech", Math.ceil(tk.height + 40) + "px");
  if(pe <= topo) return;
  var cima = 1e9, baixo = -1e9;
  for(i = 0; i < cs.length; i++){
    var r = cs[i].getBoundingClientRect();
    if(r.top < cima) cima = r.top;
    if(r.bottom > baixo) baixo = r.bottom;
  }
  var d = 0;
  if(baixo - cima <= pe - topo){
    if(baixo > pe) d = baixo - pe;
    if(cima - d < topo) d = cima - topo;
  } else {
    var at = cs[Math.min(andando, cs.length - 1)].getBoundingClientRect();
    d = at.top - (topo + (pe - topo) / 2 - at.height / 2);
  }
  if(Math.abs(d) > 2) window.scrollBy(0, d);
}
function ativa(q, certa, id, fc, fd){
  if(ATIVA) fechaAtiva();
  ATIVA = {q: q, val: "", certa: certa, id: id, fc: fc, fd: fd};
  q.className = "sq vaga ativa";
  q.innerHTML = '<span class="v"></span><span class="cursor"></span>';
  document.getElementById("teclado").className = "aberto";
  /* ⚠️ ROLAR A PALAVRA PARA CIMA DO TECLADO. Sem isto a criança escreve às
     cegas: o teclado é fixo no pé da tela e a grade fica embaixo dele (medido
     em 360x640: a grade inteira por baixo). O `comtec` dá chão para a página
     poder rolar; o resto é levar a primeira casinha para a faixa que sobra. */
  document.body.className = (document.body.className.replace(/ ?comtec/, "") + " comtec").replace(/^ /, "");
  setTimeout(rolaParaCruz, 60);
  document.getElementById("tkDica").textContent = "Escreva o número";
  falar("escreva");
}
function fechaAtiva(){
  if(!ATIVA) return;
  if(!ST.resp[ATIVA.id]){ ATIVA.q.className = "sq vaga"; ATIVA.q.textContent = ""; }
  ATIVA = null; document.getElementById("teclado").className = "";
  document.body.className = document.body.className.replace(/ ?comtec/, "");
}
function digita(ch){
  if(!ATIVA) return;
  sTecla();
  if(ch === "ap") ATIVA.val = ATIVA.val.slice(0, -1);
  else if(ch === "ok") return confereNum();
  else { if(ATIVA.val.length >= 3) return; ATIVA.val += ch; }
  var v = ATIVA.q.querySelector(".v"); if(v) v.textContent = ATIVA.val;
  if(ATIVA.val.length >= ATIVA.certa.length) setTimeout(confereNum, 380);
}
function confereNum(){
  if(!ATIVA || !ATIVA.val) return;
  var A = ATIVA;
  if(A.val === A.certa){
    A.q.className = "sq ok"; A.q.textContent = A.certa;
    ATIVA = null; document.getElementById("teclado").className = "";
    document.body.className = document.body.className.replace(/ ?comtec/, "");
    acertou(A.id, A.fc);
    var it = A.q.parentNode.parentNode; if(it) it.className = "item feito";
  } else {
    A.val = ""; var v = A.q.querySelector(".v"); if(v) v.textContent = "";
    errou(A.id, A.fd);
  }
}
(function(){
  var tk = document.getElementById("tk");
  /* 0 a 9, na ordem que a criança conhece do teclado e do celular */
  "0123456789".split("").forEach(function(D){
    var b = el("button", null, D);
    b.setAttribute("aria-label", "Número " + D);
    b.onclick = function(){ digita(D); };
    tk.appendChild(b);
  });
  var ap = el("button", "ap", "apagar"); ap.setAttribute("aria-label", "Apagar");
  ap.onclick = function(){ digita("ap"); }; tk.appendChild(ap);
  var ok = el("button", "ok", "OK"); ok.setAttribute("aria-label", "Confirmar");
  ok.onclick = function(){ digita("ok"); }; tk.appendChild(ok);
})();
document.addEventListener("keydown", function(ev){
  if(!ATIVA) return;
  if(document.activeElement && document.activeElement.id === "nomeIn") return;
  var k = (ev.key || "").toUpperCase();
  if(k.length === 1 && "0123456789".indexOf(k) > -1){ ev.preventDefault(); digita(k); }
  else if(ev.key === "Backspace"){ ev.preventDefault(); digita("ap"); }
  else if(ev.key === "Enter"){ ev.preventDefault(); digita("ok"); }
  else if(ev.key === "Escape"){ fechaAtiva(); }
});

/* ---------- folha pronta e navegação ---------- */
function idsDaPagina(pi){
  /* ⚠️ OS IDS TÊM QUE BATER COM O QUE AS FOLHAS GRAVAM (prefixo `n`, de número,
     deste caderno). Ver a lição no topo — este é o ponto onde um caderno clonado
     mente no relatório sem dar erro nenhum: o app abre, a criança responde, e o
     objetivo do currículo conta zero para sempre.
     ⚠️ A FOLHA 6 (ligar) NÃO grava `n6_<i>`: o `montaLigar` grava um id POR PAR,
        no formato `l6c<grupo>_<conta>`. Foi exatamente esta linha que, no caderno
        de alfabetização, deixou a folha 6 sem nunca ficar pronta. */
  var ids = [], i, q, F = ST.folha;
  for(i = 1; i <= 25; i++){
    if(i === 6) continue;
    if(pi === i){
      var L = F["p" + i];
      for(q = 0; q < L.length; q++) ids.push("n" + i + "_" + q);
    }
  }
  if(pi === 6) for(i = 0; i < F.p6.length; i++)
    for(q = 0; q < F.p6[i].g.length; q++)
      ids.push("l6c" + i + "_" + F.p6[i].g[q][0] + "x" + F.p6[i].g[q][1]);
  return ids;
}
function pendentes(pi){
  var ids = idsDaPagina(pi), n = 0, i;
  for(i = 0; i < ids.length; i++) if(!ST.resp[ids[i]]) n++;
  return n;
}
function confereFolha(pi){
  if(pendentes(pi) > 0 || ST.prontas[pi]) return;
  ST.prontas[pi] = 1; salvar();
  PAGEL[pi].className += " pronta"; sFesta(); confete(24);
  if(pi < PAGEL.length - 1){ falar("folhaPronta"); setTimeout(function(){ if(ST.pag === pi) vaiPara(pi + 1); }, 2400); }
  else setTimeout(fim, 1400);
  atualizaNav();
}
/* ⚠️ O nome NÃO se repete na capa (pedido do Marcos, set/2026: *"o nome ao
   digitar não precisa aparecer lá em cima na capa"*). Ele já aparece dentro do
   campo onde a criança digita; escrever de novo lá em cima era eco, e ainda
   empurrava a capa para baixo. Aqui só se mantém o campo em dia com o estado
   (importa ao retomar de onde parou). */
function espelhaNome(t){
  var i = document.getElementById("nomeIn"); if(i && i.value !== t) i.value = t;
}
function vaiPara(pi){
  calar(); fechaAtiva();
  document.getElementById("barraCapa").className = pi === 0 ? "aberta" : "";
  if(pi === 0) espelhaNome(ST.nome || "");
  document.getElementById("fim").style.display = "none";
  document.getElementById("retomar").style.display = "none";
  document.getElementById("nav").style.display = pi === 0 ? "none" : "flex";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  ST.pag = pi; salvar();
  var d = PAGEL[pi]; d.className += " viva";
  if(pi > 0) window.scrollTo(0, 0);
  if(d._aoAbrir) for(var z = 0; z < d._aoAbrir.length; z++) (function(fn){ setTimeout(fn, 60); })(d._aoAbrir[z]);
  atualizaNav();
  falarDepois(pi === 0 ? "capa" : "p" + pi + "enun", 280);
}
function atualizaNav(){
  var pi = ST.pag, total = PAGEL.length;
  document.getElementById("pg").textContent = pi === 0 ? "Capa" : "Folha " + pi + " de " + (total - 1);
  var feitas = 0, k; for(k in ST.prontas) feitas++;
  document.getElementById("progI").style.width = (feitas / (total - 1) * 100) + "%";
  document.getElementById("bAnt").disabled = pi === 0;
  var prox = document.getElementById("bProx");
  prox.style.visibility = pi === 0 ? "hidden" : "visible";
  var pend = pi > 0 ? pendentes(pi) : 0;
  prox.innerHTML = pi === total - 1 ? (pend ? "Faltam " + pend : "Ver o resultado")
    : (pend ? "Faltam " + pend + '<i class="seta dir"></i>' : 'Próxima<i class="seta dir"></i>');
  prox.className = pend ? "bt cinza" : "bt verde";
  document.getElementById("navTxt").textContent = pi === 0 ? "" : NOMES[pi - 1];
}

/* ---------- fim: boletim, medalha e relatório ---------- */
/* ⭐⭐ O FECHO A QUALQUER MOMENTO (12/set/2026).
   O Marcos fixou a sequência em no mínimo 25 folhas, e a medida deu razão a ele:
   é o que enche os 55 min da criança RÁPIDA. Só que a criança DEVAGAR leva ~85
   min nas mesmas 25 folhas — ela não termina. E até aqui o boletim, o parecer, a
   medalha e o relatório só existiam DEPOIS da última folha: quem mais precisa do
   elogio seria a única a nunca vê-lo.

   Agora a criança fecha o caderno quando quiser (botão "Terminar", na barra de
   baixo) e vê o boletim DO QUE ELA FEZ.

   ⚠️ E o boletim conta só o que ela TENTOU. Folha que ela não chegou a abrir
      aparece como "ainda não" — jamais como 0 de 8, que transformaria o fecho
      num boletim de defeitos justamente para quem foi mais devagar. */
function fim(){
  /* ⭐⭐ AVISA O CONTROLE DA SALA QUE ESTA CRIANÇA TERMINOU.
     Pedido do Marcos (15/set/2026): *"preciso que essas atividades sequências
     didáticas me avisem quando termino no painel de atividades, aquele que tem
     o controle da sala, assim como as atividades que fazíamos antes"*.

     ⚠️ E ELAS NÃO AVISAVAM POR CAMINHO NENHUM — conferido no código do
     laboratório antes de escrever isto. A tela do aluno (`_lab/index.html`)
     reconhece o fim de DOIS jeitos, e a folha viva escapava dos dois:
       1. A ESPIADA — ela olha dentro do quadro e procura a MEDALHA do fim pela
          CLASSE `.medal`. A folha viva chama a dela de `#medalha`, por id, e
          portanto a espiada nunca a via;
       2. O AVISO — o motor manda `postMessage({eduverse:"terminou"})` ao chegar
          no fim. A folha viva não mandava nada, porque nasceu sem essa peça.
     Agora ela manda o aviso aqui, e a medalha ganhou também a classe `medal`
     no HTML: dois caminhos, um cobrindo o buraco do outro, que é a razão pela
     qual o laboratório tem os dois.

     ⚠️ FORA DO LABORATÓRIO NÃO HÁ PAI NENHUM ESCUTANDO e a linha não faz nada —
     por isso ela é segura em qualquer lugar (em casa, no celular, aberta
     direto pelo link). O `try` existe para o caso de a janela de cima ser de
     outro domínio, quando o navegador recusa a leitura de `window.parent`. */
  try{ if(window.parent && window.parent !== window)
         window.parent.postMessage({eduverse: "terminou"}, "*"); }catch(e){}
  calar();
  /* quantas folhas ela chegou a tocar, e quantas ficaram para depois */
  var abertas = 0, naoAbertas = [], pp;
  for(pp = 1; pp <= NOMES.length; pp++){
    var idp = idsDaPagina(pp), algum = false, z;
    for(z = 0; z < idp.length; z++) if(ST.tent[idp[z]]) { algum = true; break; }
    if(algum) abertas++; else naoAbertas.push(pp);
  }
  var completo = naoAbertas.length === 0;
  var tf = document.getElementById("fimTit");
  if(tf) tf.textContent = completo ? "Caderno completo!" : "O seu boletim de hoje";
  var bv = document.getElementById("bVoltar");
  if(bv) bv.style.display = completo ? "none" : "";
  for(var i = 0; i < PAGEL.length; i++) PAGEL[i].className = PAGEL[i].className.replace(" viva", "");
  document.getElementById("nav").style.display = "none";
  var f = document.getElementById("fim"); f.style.display = "block";
  /* ⚠️ o denominador é o que ela TENTOU, não o caderno inteiro: a estrela tem
     de falar do trabalho dela, não do tempo que a aula tinha. */
  var tot = 0, prim = 0, pi;
  for(pi = 1; pi <= NOMES.length; pi++){
    var ids = idsDaPagina(pi);
    for(var j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(!t) continue;
      tot++;
      if(t.erros === 0 && t.ok) prim++;
    }
  }
  var pc = tot ? prim / tot : 0;
  var cheias = pc >= .85 ? 3 : pc >= .6 ? 2 : 1, est = "", ke;
  for(ke = 0; ke < 3; ke++)
    est += '<img src="img/mu_estrela' + (ke < cheias ? "" : "_off") + '.png?v=' + VIMG + '" alt="" draggable="false">';
  document.getElementById("estrelas").innerHTML = est;
  document.getElementById("estrelas").setAttribute("aria-label", cheias + " de 3 estrelas");
  var bar = document.getElementById("barras"); bar.innerHTML = "";
  for(pi = 1; pi <= NOMES.length; pi++){
    (function(pi){
      var ids = idsDaPagina(pi), t = ids.length, p = 0, nt = 0, j;
      for(j = 0; j < ids.length; j++){
        var tt = ST.tent[ids[j]];
        if(tt) nt++;
        if(tt && tt.erros === 0 && tt.ok) p++;
      }
      /* folha que ela não abriu não vira zero: vira "ainda não" */
      if(nt === 0){
        bar.appendChild(el("div", "barra naoabriu",
          "<span>" + NOMES[pi - 1] + "</span><div class='tr'></div><b>ainda não</b>"));
        return;
      }
      var b = el("div", "barra", "<span>" + NOMES[pi - 1] + "</span><div class='tr'><i></i></div><b>" + p + "/" + nt + "</b>");
      bar.appendChild(b);
      setTimeout(function(){ b.querySelector("i").style.width = (nt ? p / nt * 100 : 0) + "%"; }, 400);
    })(pi);
  }
  /* ⭐⭐ O CARTAZ DO ARMAZÉM, montado por ela na folha 25.
     A folha promete "ele fica guardado no fim" e a voz do fecho repete isso; se
     o fim não mostrasse o cartaz, a promessa seria só texto. É a regra 11 da
     casa: a tela final mostra o que a criança FEZ, não só a nota dela. */
  (function(){
    var cx = document.getElementById("cartazFim");
    if(!cx) return;
    var L = ST.folha.p25 || [], escolhidas = [], k;
    for(k = 0; k < L.length; k++) if(ST.resp["n25_" + k]) escolhidas.push(L[k]);
    if(!escolhidas.length){
      cx.innerHTML = '<h3>O seu cartaz</h3><div class="quadro">' +
        '<span class="vazio">A última folha é o cartaz: escolha ali as contas que você já sabe.</span></div>';
      return;
    }
    var dentro = "";
    escolhidas.forEach(function(it){
      dentro += '<span class="cc">' + it.q + " &times; " + it.n + " = " + (it.q * it.n) +
                img(it.w, "figgr") + "</span>";
    });
    cx.innerHTML = "<h3>O cartaz de " + esch(ST.nome || "hoje") + "</h3>" +
                   '<div class="quadro">' + dentro + "</div>";
  })();

  /* ⭐ O PARECER DA CRIANÇA (mudança de set/2026 — ver o bloco dos OBJETIVOS).
     O currículo de Blumenau diz que a avaliação orienta *"o professor E O
     ESTUDANTE acerca de quais objetivos foram alcançados"*, e que *"mostrar o
     que sabe ou o que não sabe é pertinente, faz parte do crescimento e não da
     exclusão"*. Então ela vê o que já sabe — na linguagem dela, sem número,
     sem a palavra "errou" e sem porcentagem.
     ⚠️ A ORDEM IMPORTA: primeiro o que ela JÁ SABE, sempre; o "vale treinar" vem
     depois e no máximo dois, senão a lista vira boletim de defeitos. */
  var jaSabe = [], treinar = [], q;
  for(q = 0; q < OBJETIVOS.length; q++){
    var Oq = OBJETIVOS[q], mq = mede(Oq.f);
    /* ⚠️ objetivo que ela NÃO CHEGOU a tentar não entra no "vale treinar":
       seria cobrar dela a folha que a aula não deu tempo de alcançar. */
    if(mq.tot === 0 || !mq.tent) continue;
    var pcq = Math.round(100 * mq.prim / mq.tent);
    (pcq >= 75 ? jaSabe : treinar).push(pcq >= 75 ? Oq.ok : Oq.n.toLowerCase());
  }
  var txt = "";
  /* ⚠️ "Você JÁ ..." e não "Você já SABE ..." (set/2026, achado na leitura da
     tela de fim). Os textos dos OBJETIVOS estão escritos em terceira pessoa
     ("junta os dois pedaços", "conta as palmas") — que em português é a MESMA
     forma de "você". Com o "sabe" no meio saía "Você já sabe junta os dois
     pedaços", e era a PRIMEIRA frase que a criança lia no fim do caderno. */
  if(jaSabe.length) txt = "Você já " + jaSabe.slice(0, 3).join("; ") + ".";
  else txt = "Você começou a conhecer a fila das letras — e ela é comprida!";
  if(treinar.length) txt += " Vale treinar mais: " + treinar.slice(0, 2).join(" e ") + ".";
  /* ⭐ o quanto ela andou é FATO e entra celebrado, nunca como cobrança */
  if(!completo)
    txt = "você fez " + abertas + " de " + NOMES.length + " folhas hoje — e olhe o "
        + "que já dá para ver: " + txt.charAt(0).toLowerCase() + txt.slice(1);
  /* ⚠️ DEFEITO ANTIGO, achado ao testar o fecho (12/set/2026): sem nome digitado
     a linha saía **"Você, você já entende…"** — o prefixo caía no "Você" e o
     texto do parecer também começa com "Você". Só aparecia para a criança que
     não escreve o nome na capa, que é justamente a que mais precisa que a tela
     fale direito com ela. Sem nome, não há prefixo. */
  var quem = (ST.nome || "").replace(/^\s+|\s+$/g, "");
  document.getElementById("resumo").innerHTML = quem
    ? "<b>" + esch(quem) + "</b>, " + txt.charAt(0).toLowerCase() + txt.slice(1)
    : txt.charAt(0).toUpperCase() + txt.slice(1);
  sFesta(); confete(40); falar("fim");
}
(function(){
  var m = document.getElementById("medalha"), t = null;
  function segura(){ t = setTimeout(function(){ abreRelatorio(); }, 2000); }
  function larga(){ if(t){ clearTimeout(t); t = null; } }
  m.addEventListener("pointerdown", segura);
  m.addEventListener("pointerup", larga);
  m.addEventListener("pointerleave", larga);
  m.addEventListener("pointercancel", larga);
})();
/* ============================================================
   O QUE A ATIVIDADE MEDE — e como isso vira PARECER e NOTA

   ⭐ PEDIDO DO MARCOS (set/2026): *"acho interessante ter um relatório, tipo uma
   avaliação descritiva sobre o que o aluno conseguiu dominar nesses objetivos
   das atividades"* e *"algo que dê para converter em nota"*.

   ⭐⭐ E A REGRA DA CASA MUDOU AQUI — o Marcos mandou conferir e ele tinha razão:
   *"essa regra pode ser alterada, consulta do pedagogo e do currículo seria
   interessante"*. Fui ao currículo de Blumenau e ele diz, com todas as letras:

     · a avaliação *"está a serviço de orientar o professor E O ESTUDANTE acerca
       de quais objetivos de aprendizagem foram alcançados"* — o estudante é
       destinatário da avaliação, não só o professor;
     · e, citado com aprovação (Pinto, 2016, p. 120): *"na perspectiva do sujeito
       histórico-cultural, MOSTRAR O QUE SABE OU O QUE NÃO SABE É PERTINENTE,
       faz parte do crescimento e NÃO DA EXCLUSÃO"*.

   Ou seja: esconder da criança o que ela domina não era exigência pedagógica —
   era escolha nossa, e o currículo aponta para o contrário. Então a criança
   PASSA A VER o parecer dela, na linguagem dela.

   ⚠️ O QUE NÃO MUDA É O NÚMERO. A Instrução Normativa SEMED nº 1/2017, art. 3º,
   citada no currículo, manda avaliar *"com PREPONDERÂNCIA DOS ASPECTOS
   QUALITATIVOS SOBRE OS QUANTITATIVOS"*. Então o parecer vai para a criança e a
   NOTA fica com o professor: não por medo do número, mas porque o currículo diz
   qual dos dois deve pesar na frente dela.

   ⚠️ E O CRITÉRIO DA NOTA É EXPOSTO POR EXIGÊNCIA, não por capricho: a mesma
   Instrução manda *"a exposição de critérios utilizados em cada um dos
   instrumentos avaliativos"*. Por isso a linha "1,0 de primeira, 0,6 com ajuda"
   aparece impressa no relatório.

   ⚠️ E NÃO SE CONTA TUDO IGUAL. Quem acerta de primeira e quem acerta depois de
   duas dicas não sabem a mesma coisa. Acerto de primeira vale 1,0; acerto com
   ajuda vale 0,6. O relatório mostra os dois números lado a lado, para o
   professor ver a nota E o esforço que ela custou.
   ============================================================ */
var PESO_PRIMEIRA = 1.0, PESO_COM_AJUDA = 0.6;

/* OS OBJETIVOS — e quais folhas medem cada um.
   ⚠️ Isto NÃO é a lista de folhas: é a lista do que a criança tem que SABER.
   Duas folhas podem medir a mesma coisa com gestos diferentes, e para o
   professor interessa o que ela domina, não em qual tela. */
var OBJETIVOS = [
  {n: "Ver a cena como grupos iguais", f: [1, 2, 3],
   ok: "enxerga quantos grupos há e quantos tem em cada um, e monta grupos iguais com a própria mão",
   nao: "ainda conta tudo de uma vez, sem separar a cena em grupos do mesmo tanto"},
  {n: "Somar parcelas iguais e escrever a multiplicação", f: [4, 5, 6, 7],
   ok: "traduz a mesma cena nos dois sentidos: a soma de parcelas iguais e a conta de vezes",
   nao: "ainda não vê que a soma de parcelas iguais e a multiplicação dizem a mesma coisa"},
  {n: "Achar o total de parcelas iguais", f: [8, 9, 10],
   ok: "escreve o total de próprio punho, pela soma e pela multiplicação",
   nao: "ainda reconhece a conta certa, mas não produz o resultado sozinha"},
  {n: "Os fatos básicos do 2, 5, 10, 3 e 4", f: [11, 12, 13, 14, 15],
   ok: "responde as cinco tabuadas da rede sem precisar recomeçar a soma toda vez",
   nao: "ainda soma de novo a cada pergunta, sem os fatos na memória"},
  {n: "Contar de tanto em tanto", f: [16, 17],
   ok: "conta de 2 em 2, de 3 em 3, de 5 em 5 e de 10 em 10 sem perder a fila",
   nao: "ainda conta de um em um para chegar ao próximo número da sequência"},
  {n: "A disposição retangular (fileiras e colunas)", f: [18, 19],
   ok: "lê um retângulo de figuras como fileiras vezes colunas e o desenha na malha",
   nao: "ainda não usa as fileiras como grupos iguais"},
  {n: "A ordem dos fatores não muda o total", f: [20],
   ok: "prevê que girar o tapete não muda o total, e confirma com a conta",
   nao: "ainda acha que trocar a ordem muda o resultado"},
  {n: "Combinação de possibilidades", f: [21, 22],
   ok: "cruza cada fruta com cada doce sem repetir nem faltar, e escreve quantas são",
   nao: "ainda lista as combinações no vai e vem, sem um método"},
  {n: "Resolver problemas de multiplicação", f: [23, 24],
   ok: "lê o problema, escolhe a multiplicação e escreve a resposta",
   nao: "ainda depende da figura para decidir que conta fazer"},
  {n: "Registrar o que aprendeu", f: [25],
   ok: "monta o cartaz do armazém com as contas que já domina",
   nao: "ainda não montou o cartaz dela"}
];

/* mede um objetivo: devolve acertos de primeira, com ajuda, total e pontos */
function mede(folhas){
  var prim = 0, ajuda = 0, tot = 0, tentados = 0, k, j;
  for(k = 0; k < folhas.length; k++){
    var ids = idsDaPagina(folhas[k]);
    tot += ids.length;
    for(j = 0; j < ids.length; j++){
      var t = ST.tent[ids[j]];
      if(t) tentados++;      /* ⭐ o que ela chegou a tocar */
      if(!t || !t.ok) continue;
      if(t.erros === 0) prim++; else ajuda++;
    }
  }
  return {prim: prim, ajuda: ajuda, tot: tot, tent: tentados,
          pontos: prim * PESO_PRIMEIRA + ajuda * PESO_COM_AJUDA,
          pc: tot ? Math.round(100 * prim / tot) : 0};
}

function abreRelatorio(){
  var r = document.getElementById("relatorio");
  var linhas = "", domina = [], retomar = [], k;
  var pontos = 0, total = 0, primG = 0, ajudaG = 0, tentG = 0;
  var naoAlcancou = [];
  /* ⭐ ATÉ ONDE ELA CHEGOU — o professor precisa saber disto ANTES de ler
     qualquer porcentagem (ver a coluna "do que fez", logo abaixo). */
  var folhasFeitas = 0, fz;
  for(fz = 1; fz <= NOMES.length; fz++){
    var idf = idsDaPagina(fz), tocou = false, y;
    for(y = 0; y < idf.length; y++) if(ST.tent[idf[y]]) { tocou = true; break; }
    if(tocou) folhasFeitas++;
  }
  var inteiro = folhasFeitas >= NOMES.length;

  for(k = 0; k < OBJETIVOS.length; k++){
    var O = OBJETIVOS[k], m = mede(O.f);
    pontos += m.pontos; total += m.tot; primG += m.prim; ajudaG += m.ajuda;
    tentG += m.tent;
    /* ⚠️ 75% é a ÚNICA linha que decide, e as duas listas são complementares:
       um objetivo não pode aparecer em "domina" e em "retomar" ao mesmo tempo —
       para o professor isso não é informação, é ruído. */
    /* ⚠️⚠️ O QUE DECIDE É O QUE ELA FEZ (12/set/2026). Antes, num caderno não
       terminado, o objetivo cujas folhas ela nem alcançou entrava em "retomar"
       com 0% — e o parecer do professor dizia "precisa retomar" de uma criança
       que tinha ido bem no que deu tempo de fazer. Isso é pior que não ter
       parecer: é um julgamento errado com cara de medida.
       Objetivo que ela NÃO TOCOU não entra em lista nenhuma; os que ela tocou
       são julgados pelo desempenho DELES. */
    var pcObj = m.tent ? Math.round(100 * m.prim / m.tent) : -1;
    if(pcObj < 0) naoAlcancou.push(O.n.toLowerCase());
    else if(pcObj >= 75) domina.push(O.ok);
    else retomar.push(O.n.toLowerCase() + " (" + pcObj + "%)");
    /* ⭐ A COLUNA "DO QUE FEZ" (12/set/2026) — nasceu junto com o fecho a
       qualquer momento. Sem ela o relatório MENTE num caderno não terminado: a
       criança que fez 4 folhas de 15, e as fez bem, aparecia com 27% — o
       professor leria "precisa retomar" de quem na verdade só ficou sem tempo.
       A coluna da direita mostra o desempenho SÓ no que ela chegou a responder. */
    var pcf = m.tent ? Math.round(100 * m.prim / m.tent) : 0;
    linhas += "<tr><td>" + esch(O.n) + "</td><td>" + m.prim + "/" + m.tot +
      "</td><td><b>" + m.pc + "%</b></td><td>" +
      (m.tent ? "<b>" + pcf + "%</b> <small>(" + m.prim + "/" + m.tent + ")</small>"
              : "<small>não fez</small>") + "</td><td>" + m.ajuda + "</td></tr>";
  }

  /* ⭐ A NOTA. É de 0 a 10, com um decimal, e sai dos PONTOS — não dos acertos
     crus: 1,0 de primeira, 0,6 com ajuda. */
  /* ⚠️ A NOTA DE UM CADERNO NÃO TERMINADO SE MEDE NO QUE FOI FEITO. Dividir
     pelos itens que ela nunca viu dá uma nota que não fala dela — fala do
     relógio. Quando o caderno está completo, os dois denominadores são o
     mesmo número e nada muda. */
  var baseNota = inteiro ? total : tentG;
  var nota = baseNota ? Math.round(100 * pontos / baseNota) / 10 : 0;
  var pc = baseNota ? Math.round(100 * primG / baseNota) : 0;
  var conceito = !baseNota ? "Sem dados" :
    nota >= 8.5 ? "Dominou" : nota >= 6 ? "Está construindo" : "Precisa retomar";
  if(!inteiro) conceito += " (parcial)";

  /* ⭐ O PARECER EM PALAVRAS — a "avaliação descritiva" que o Marcos pediu.
     Não é uma frase de efeito: é a lista do que ela SABE FAZER, escrita como o
     professor escreveria no parecer bimestral. */
  var nome = esch(ST.nome || "O aluno");
  var parecer = nome + " ";
  if(domina.length && !retomar.length && !naoAlcancou.length)
    parecer += "domina a ordem do alfabeto em todos os degraus avaliados: " +
      domina.join("; ") + ".";
  else if(domina.length)
    parecer += "já " + domina.join("; ") + ". Ainda precisa retomar: " + retomar.join(", ") + ".";
  else
    parecer += "está começando a construir a ordem do alfabeto. Nenhum objetivo chegou a " +
      "75% de acerto de primeira — vale retomar oralmente, cantando o alfabeto e apontando " +
      "as letras no varal da sala, antes de voltar à tela.";


  /* ⚠️ o que a aula não deu tempo de alcançar é INFORMAÇÃO para o professor,
     nunca falha da criança — por isso frase própria, e no fim. */
  if(naoAlcancou.length)
    parecer += " Ainda não chegou a fazer (a aula acabou antes): " +
               naoAlcancou.join(", ") + ".";

  var h = "<b>Relatório do professor</b> &mdash; " + nome + " &middot; " +
    Math.round((Date.now() - (ST.inicio || Date.now())) / 60000) + " min" +
    "<div class='notao'><span class='nn'>" + nota.toFixed(1).replace(".", ",") + "</span>" +
    "<span class='nl'><b>" + conceito + "</b><br>" + primG + " de " + baseNota +
    " de primeira (" + pc + "%)<br>" + ajudaG + " com ajuda</span></div>" +
    "<p class='parecer'>" + parecer + "</p>" +
    (inteiro ? "" :
      "<p class='avisoparcial'><b>Caderno não terminado:</b> " + folhasFeitas +
      " de " + NOMES.length + " folhas. A coluna <b>%</b> conta o caderno inteiro; " +
      "a coluna <b>do que fez</b> conta só o que a criança chegou a responder — " +
      "é esta que diz como ela foi.</p>") +
    "<table><tr><th>Objetivo</th><th>De primeira</th><th>%</th>" +
    "<th>do que fez</th><th>Com ajuda</th></tr>" +
    linhas + "</table>" +
    "<p class='comonota'>Nota de 0 a 10: acerto de primeira vale 1,0 e acerto com ajuda vale 0,6. " +
    "A criança não vê este número — ele fica só aqui.</p>";
  r.innerHTML = h; r.style.display = "block"; sPasso();
}
function esch(t){
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- retomar, chave mestra e a partida ---------- */
var CHAVE_MESTRA = "1275";
function abreMenuProf(){
  var cx = document.getElementById("mpFolhas");
  if(!cx.childNodes.length){
    var mk = function(rot, alvo){
      var b = el("button", null, rot);
      b.onclick = function(){ fechaMenuProf(); vaiPara(alvo); };
      cx.appendChild(b);
    };
    mk("Capa", 0);
/* ⚠️ ERA `k <= 10` FIXO, e isso mentia sobre o tamanho do caderno.
       O Marcos abriu o menu do professor da Horta do Vovô (21 folhas),
       viu dez e perguntou: *"a horta só tem 10 páginas?"*. O caderno
       inteiro funciona — MEDIDO, o jogador fecha as 21 de 21 —, mas
       quem confere pelo menu não tem como saber disso. O dez é resto de
       quando os cadernos desta casa tinham dez folhas; o piso hoje é 20.
       Quem manda no menu é o NOMES, que é a lista de verdade. */
    for(var k = 1; k <= NOMES.length; k++) mk(k + ". " + NOMES[k - 1], k);
  }
  calar(); document.getElementById("menuProf").className = "aberto";
}
function fechaMenuProf(){ document.getElementById("menuProf").className = ""; }
document.getElementById("mpFechar").onclick = fechaMenuProf;
document.getElementById("menuProf").onclick = function(ev){ if(ev.target === this) fechaMenuProf(); };
document.getElementById("nomeIn").oninput = function(){
  if(this.value.indexOf(CHAVE_MESTRA) > -1){ this.value = ST.nome || ""; abreMenuProf(); return; }
  ST.nome = this.value.slice(0, 24); espelhaNome(ST.nome); salvar();
};
document.getElementById("nomeIn").onkeydown = function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); this.blur(); } };
document.getElementById("bComecar").onclick = function(){ ac(); sPasso(); if(!ST.inicio) ST.inicio = Date.now(); vaiPara(1); };
document.getElementById("bAnt").onclick = function(){ sPasso(); vaiPara(Math.max(0, ST.pag - 1)); };
document.getElementById("bProx").onclick = function(){
  sPasso();
  if(ST.pag === PAGEL.length - 1 && pendentes(ST.pag) === 0) return fim();
  vaiPara(Math.min(PAGEL.length - 1, ST.pag + 1));
};
document.getElementById("bOuvir").onclick = function(){ ac(); if(ultimaFala) falar(ultimaFala); };
document.getElementById("bVoz").onclick = function(){
  vozLigada = !vozLigada; this.className = vozLigada ? "zap" : "zap off";
  if(!vozLigada) calar(); else falar("vozOn");
};
document.getElementById("bRever").onclick = function(){ sPasso(); vaiPara(1); };
document.getElementById("bRecomecar").onclick = function(){
  sPasso(); try{ localStorage.removeItem(CHAVE_LS); }catch(e){}
  ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
  monta(); vaiPara(0); falarDepois("novoCaderno", 400);
};
document.getElementById("bContinuar").onclick = function(){ ac(); sPasso(); vaiPara(ST.pag || 1); };
document.getElementById("bZerar").onclick = function(){ document.getElementById("bRecomecar").onclick(); };

(function boot(){
  var velho = carregar();
  if(velho && velho.folha){
    ST = velho;
    if(!ST.resp) ST.resp = {}; if(!ST.lig) ST.lig = {}; if(!ST.tent) ST.tent = {}; if(!ST.prontas) ST.prontas = {};
    /* ⚠️ TRAVA 2 — A REDE DE SEGURANÇA. Se montar a partir da memória estourar
       por qualquer motivo que eu não previ, o caderno joga a memória fora e
       abre LIMPO. Perder o "continuar de onde parou" é ruim; ficar com uma tela
       morta a aula toda é muito pior. */
    try{ monta(); }
    catch(erroMemoria){
      try{ localStorage.removeItem(CHAVE_LS); }catch(e3){}
      ST = {pag: 0, nome: ST.nome, folha: novaFolha(), resp: {}, lig: {}, tent: {}, prontas: {}, inicio: 0};
      monta(); vaiPara(0); return;
    }
    document.getElementById("retomar").style.display = "block";
    document.getElementById("retTxt").textContent =
      (ST.nome ? ST.nome + ", você" : "Você") + " parou na folha " + (ST.pag || 1) + ": " + NOMES[(ST.pag || 1) - 1] + ".";
    document.getElementById("nav").style.display = "none";
  } else {
    ST.folha = novaFolha(); monta(); vaiPara(0);
  }
})();

/*<dossie-js>*/
/* ============================================================
   DOSSIÊ PEDAGÓGICO — o que o PROFESSOR vê quando abre a atividade

   ⭐ PEDIDO DO MARCOS (set/2026): *"preciso que quando um professor olhe e
      analise a atividade ele veja que está ótima"*.

   O buraco que isto fecha: o parecer pedagógico de cada caderno existia — mas
   morava num arquivo `.md` DENTRO DO REPOSITÓRIO, que nenhum professor abre.
   Quem olhava a atividade via um joguinho bonito e não tinha como saber se
   aquilo estava alinhado ao currículo da rede. Agora o alinhamento está DENTRO
   da atividade, a um toque — e a qualquer momento, não só no fim.

   ⚠️ E não é texto solto: cada habilidade citada aqui vem do
   `<pasta>/curriculo.json`, e o portão `_qa/pedagogo_curriculo.py` reprova se a frase
   citada não existir, palavra por palavra, no `_curriculo/blumenau.txt`, ou se
   os objetivos do relatório e os do currículo não baterem um a um. Citação de
   currículo é a única coisa que o professor NÃO tem como conferir sozinho sem
   abrir 440 páginas de PDF — por isso ela é medida.

   Abre por dois caminhos: o botão no menu do professor (chave mestra 1275@,
   vale a qualquer hora) e o botão dentro do relatório, no fim.

   Este arquivo é a FONTE: `python3 _padrao/dossie_professor.py <pasta>` injeta o CSS, o
   trecho de tela e este código no caderno. Não editar a cópia injetada.
   ============================================================ */
function dossieCita(s){
  var m = String(s || "").match(/[“"]([^”"]+)[”"]/);
  return m ? m[1] : String(s || "");
}
function dossieHTML(){
  var C = (typeof CURRICULO === "object" && CURRICULO) ? CURRICULO : null;
  if(!C) return "<p>Este caderno ainda não declarou o currículo.</p>";
  var h = "", k, o;
  h += "<p class='dfonte'><b>" + esch(C.componente) + " &middot; " + C.ano +
       "º ano.</b> " + esch(C.rede) + ". As habilidades abaixo estão " +
       "<b>copiadas do documento oficial, palavra por palavra</b> &mdash; nenhuma " +
       "foi reescrita nem resumida.</p>";
  h += "<table><tr><th>O que a atividade mede</th><th>Folhas</th>" +
       "<th>Habilidade do currículo da rede</th></tr>";
  for(k = 0; k < C.objetivos.length; k++){
    o = C.objetivos[k];
    h += "<tr><td>" + esch(o.objetivo) + "</td><td>" + o.folhas.join(", ") +
         "</td><td>&ldquo;" + esch(dossieCita(o.habilidade)) + "&rdquo;" +
         "<span class='dobj'>" + esch(o.pratica) + " &middot; " +
         esch(o.objeto) + "</span></td></tr>";
  }
  h += "</table>";

  h += "<p class='dsub'><b>A escada didática</b> &mdash; uma folha por degrau, e " +
       "nenhuma repete o gesto da anterior:</p><ol class='descada'>";
  for(k = 0; k < NOMES.length; k++) h += "<li>" + esch(NOMES[k]) + "</li>";
  h += "</ol>";

  h += "<p class='dsub'><b>Como a criança é avaliada</b></p>" +
       "<p class='dtxt'>O relatório do professor (no fim, segurando a medalha por " +
       "2 segundos) traz, por objetivo: quantos itens ela acertou <b>de primeira</b>, " +
       "quantos precisou de ajuda e a porcentagem. A partir de 75% de acerto de " +
       "primeira o objetivo conta como dominado. Sai também um parecer em palavras " +
       "&mdash; do jeito que se escreve no bimestral &mdash; e uma nota de 0 a 10 " +
       "que <b>a criança não vê</b>. Dentro da atividade não há nota, nem ranking, " +
       "nem a palavra &ldquo;errou&rdquo;: o erro responde na hora e diz o que " +
       "olhar, e a ajuda cresce a cada tentativa (dica &rarr; apoio concreto &rarr; " +
       "revelar).</p>";

  if(C.evidencia && C.evidencia.length){
    h += "<p class='dsub'><b>O que foi medido antes de publicar</b></p><ul class='dev'>";
    for(k = 0; k < C.evidencia.length; k++) h += "<li>" + esch(C.evidencia[k]) + "</li>";
    h += "</ul>";
  }
  return h;
}
function abreDossie(){
  var cx = document.getElementById("dsCorpo");
  if(!cx) return;
  if(typeof calar === "function") calar();
  cx.innerHTML = dossieHTML();
  document.getElementById("dossie").className = "aberto";
  cx.scrollTop = 0;
}
function fechaDossie(){ document.getElementById("dossie").className = ""; }
(function(){
  var b = document.getElementById("bDossie"), f = document.getElementById("dsFechar"),
      cx = document.getElementById("dossie");
  if(b) b.onclick = function(){ fechaMenuProf(); abreDossie(); };
  if(f) f.onclick = fechaDossie;
  if(cx) cx.onclick = function(ev){ if(ev.target === this) fechaDossie(); };

  /* o segundo caminho: o botão nasce DENTRO do relatório, quando ele abre.
     Fica ali e não na tela final porque o relatório é a parte que a criança
     não vê — e o dossiê é conversa de adulto. */
  if(typeof abreRelatorio === "function"){
    var antes = abreRelatorio;
    abreRelatorio = function(){
      antes.apply(this, arguments);
      var r = document.getElementById("relatorio");
      if(r && !r.querySelector(".bdossie")){
        var bt = document.createElement("button");
        bt.className = "bt bdossie";
        bt.textContent = "Dossiê pedagógico (currículo da rede)";
        bt.onclick = abreDossie;
        r.appendChild(bt);
      }
    };
  }
}());
/*</dossie-js>*/

/* ⭐ o botão "Terminar" e o "Voltar para o caderno" — ver o comentário do fim() */
(function(){
  var bt = document.getElementById("bTerminar");
  if(bt) bt.onclick = function(){
    var falta = 0, pz;
    for(pz = 1; pz <= NOMES.length; pz++) falta += pendentes(pz);
    if(falta && !confirm("Quer fechar o caderno e ver o seu boletim?\n\nVocê pode voltar depois e continuar de onde parou."))
      return;
    fim();
  };
  var bv = document.getElementById("bVoltar");
  if(bv) bv.onclick = function(){
    document.getElementById("fim").style.display = "none";
    vaiPara(ST.pag || 1);
  };
})();

/* ============================================================
   AS 25 FOLHAS DO ARMAZÉM DO MESMO TANTO — multiplicação, 3º ano

   ⭐ Pedido do Marcos (13/set/2026): *"uma atividade de multiplicação para o
      terceiro ano. Objetivo: fazer o aluno entender que multiplicar é o mesmo
      que somar quantidades iguais"*.

   ⚠️ CADA FOLHA VEIO DO COMANDO IMPRESSO de uma folha de papel — as 40 colhidas
      e lidas uma a uma em `_sequencias/POTE-MULT.md`, que diz de qual folha veio
      cada gesto e por que sete foram recusadas. Nenhuma saiu do meu cardápio.

   ⚠️ O TETO DA REDE: fatores **2, 3, 4, 5 e 10**, e nada mais. Blumenau é
      explícita — *"problemas de multiplicação (por 2, 3, 4, 5 e 10)"* — e
      METADE das folhas colhidas usa 6, 7, 8 e 9. A mecânica delas entrou; os
      números, não. Este é o filtro que eu erraria de memória.

   ⚠️ E O QUE O 3º ANO ACRESCENTA AO 2º: o 10, a **disposição retangular**, a
      **combinação de possibilidades** e o **registro** (escrever a sentença, não
      só achar o total). Um caderno que só fizesse 3+3+3 = 3×3 entregaria 2º ano
      com capa de 3º.

   ⚠️ DADO DE FOLHA MORA NO TOPO (lição paga em 13/set/2026, ver o comentário do
      começo do arquivo): `function` sobe, `var x = ...` não.
   ============================================================ */

/* o nome de cada quantidade, escrito como se fala — para a voz não soletrar */
var DIZN = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete",
            "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze",
            "dezesseis", "dezessete", "dezoito", "dezenove", "vinte"];

/* ---------- ajudantes deste caderno ---------- */

/* uma bandeja/caixa com N figuras iguais dentro — a imagem do "mesmo tanto" */
function grupo(w, n, cls){
  var g = el("div", "grupo" + (cls ? " " + cls : "")), k;
  for(k = 0; k < n; k++) g.innerHTML += img(w, "figgr");
  return g;
}
/* a prateleira: `q` grupos de `n` figuras */
function prateleira(w, q, n, cls){
  var p = el("div", "prateleira"), k;
  for(k = 0; k < q; k++) p.appendChild(grupo(w, n, cls));
  return p;
}
/* o tapete: uma malha retangular de figuras — a DISPOSIÇÃO RETANGULAR, que é
   uma das três ideias que o 3º ano acrescenta ao 2º */
function tapete(w, li, co){
  var t = el("div", "tapete"), r, c;
  for(r = 0; r < li; r++){
    var f = el("div", "fileira");
    for(c = 0; c < co; c++) f.innerHTML += img(w, "figgr");
    t.appendChild(f);
  }
  return t;
}
/* o alto-falante que lê a conta inteira ("três vezes quatro é igual a doze") */
function contaComSom(txt, chave){
  var cx = el("div", "contalin");
  cx.appendChild(el("span", "conta", txt));
  cx.appendChild(botaoSom("Ouvir a conta", function(){ falar(chave); }));
  return cx;
}
function vezes(q, n){ return q + " &times; " + n; }
/* soma escrita: 4 + 4 + 4 (n repetido q vezes) */
function somaDe(n, q){
  var p = [], k;
  for(k = 0; k < q; k++) p.push(n);
  return p.join(" + ");
}
/* as três fábricas de opção deste caderno. A `v` é CURTA e sem espaço de
   propósito: ela vira `data-qa` e é por ela que o jogador (`_qa/joga_folha.js`)
   acha a resposta declarada. Espaço em `data-qa` vira dor de cabeça. */
function opsNum(lista){
  return lista.map(function(v){
    return {v: String(v), rot: '<span class="numop">' + v + "</span>",
            aria: "número " + v, fala: "num_" + v};
  });
}
function opsConta(lista){          /* lista de [q, n] */
  return lista.map(function(p){
    return {v: "c" + p[0] + "x" + p[1],
            rot: '<span class="contaop">' + vezes(p[0], p[1]) + "</span>",
            aria: p[0] + " vezes " + p[1], fala: "conta_" + p[0] + "x" + p[1]};
  });
}
function opsSoma(lista){           /* lista de [n, q] — n repetido q vezes */
  return lista.map(function(p){
    return {v: "s" + p[0] + "x" + p[1],
            rot: '<span class="somaop">' + somaDe(p[0], p[1]) + "</span>",
            aria: somaDe(p[0], p[1]), fala: "soma_" + p[0] + "x" + p[1]};
  });
}

/* ============ A CAPA ============
   ⚠️ CAPA CLONADA = TROCAR A CENA, SEMPRE (lição paga no Bando das Rimas). A
      cena tem que contar a atividade: aqui são BANDEJAS IGUAIS chegando na
      esteira do armazém, uma depois da outra — que é exatamente o que a criança
      vai aprender a ver. */
function f0(d){
  /* CAPA COM IDENTIDADE PRÓPRIA — gerada por _padrao/identidade_capa.py (editar lá).
     Cena: o armazém: prateleira com grupos do mesmo tanto e o foco de luz varrendo. O título entra letra a letra (cai), palavra por palavra
     (nowrap, para não quebrar no meio); as figuras são as do próprio caderno. */
  var c = el("div", "capa"), nome = "O ARMAZÉM DO MESMO TANTO", k, letras = "", pos = 0;
  var V = typeof VIMG !== "undefined" ? VIMG : 2;
  nome.split(" ").forEach(function(pal, w){
    var s = "";
    for(k = 0; k < pal.length; k++, pos++){
      s += '<span class="lt" style="animation-delay:' + (0.05 * pos).toFixed(2) + 's">' + pal.charAt(k) + '</span>';
    }
    pos++;
    letras += (w ? '<span class="cpesp"></span>' : '') + '<span class="cptpal">' + s + '</span>';
  });
  c.innerHTML =
    '<div class="ceu"></div>' + '<h1 class="titu">' + letras + '</h1>' +
    '<div class="sub">Matemática &middot; 3º ano &middot; vinte e cinco folhas de multiplicação</div>' +
    '<div class="cena"><i class="foco"></i>' + '<div class="it" style="animation-delay:0.00s">' + '<img class="capfig" draggable="false" src="img/mu_maca.png?v=' + V + '" alt="">' + '<span class="rt">3</span>' + '</div>' + '<div class="it" style="animation-delay:0.35s">' + '<img class="capfig" draggable="false" src="img/mu_laranja.png?v=' + V + '" alt="">' + '<span class="rt">3</span>' + '</div>' + '<div class="it" style="animation-delay:0.70s">' + '<img class="capfig" draggable="false" src="img/mu_bolo.png?v=' + V + '" alt="">' + '<span class="rt">3</span>' + '</div>' + '<div class="it" style="animation-delay:1.05s">' + '<img class="capfig" draggable="false" src="img/mu_sorvete.png?v=' + V + '" alt="">' + '<span class="rt">3</span>' + '</div>' + '</div><div class="prat"></div>' +
    '<div class="chamada">Escreva o seu nome ali embaixo e toque em <b>Começar</b>.</div>';
  d.appendChild(c);
}

/* 1 — AS CAIXAS DO ARMAZÉM (papel d29: "QUANTOS SÃO OS GRUPOS? QUANTOS EM CADA
   GRUPO?"). O degrau mais baixo, e ele não é a conta: é APRENDER A VER a cena
   como grupos iguais. Sem isso, todo o resto é decoreba. */
function f1(d, pi){
  faixa(d, pi, NOMES[0]);
  enunciado(d, pi, "Olhe a prateleira. <b>Quantos grupos</b> você vê?", "p1enun");
  var L = ST.folha.p1;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n1_" + i, box = item(i + 1);
      box.appendChild(prateleira(it.w, it.q, it.n));
      opcoes(box, pi, id, opsNum(it.op), String(it.q), "figbt",
             "certo1_" + it.w + "_" + it.q + "x" + it.n, "dica1_" + it.q);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 2 — QUANTOS EM CADA GRUPO (o par da folha 1: agora o outro número da conta) */
function f2(d, pi){
  faixa(d, pi, NOMES[1]);
  enunciado(d, pi, "Agora olhe <b>dentro</b> de um grupo. Quantos tem em <b>cada</b> um?", "p2enun");
  var L = ST.folha.p2;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n2_" + i, box = item(i + 1);
      box.appendChild(prateleira(it.w, it.q, it.n));
      opcoes(box, pi, id, opsNum(it.op), String(it.n), "figbt",
             "certo2_" + it.w + "_" + it.q + "x" + it.n, "dica2_" + it.n);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 3 — MONTE A BANDEJA (papel d16: "DESENHE 5 lápis em cada quadro")
   ⭐ Aqui a criança CONSTRÓI os grupos iguais em vez de só olhar. É o degrau
      concreto de Bruner, e é o que faz "mesmo tanto" virar uma coisa que ela
      fez com a mão, não uma frase que ela ouviu. */
function f3(d, pi){
  faixa(d, pi, NOMES[2]);
  enunciado(d, pi, "Ponha <b>o mesmo tanto</b> em cada bandeja. Puxe as figuras.", "p3enun");
  var L = ST.folha.p3;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n3_" + i, box = item(i + 1);
      /* ⚠️ a resposta declarada é a LISTA das peças, na ordem — é assim que o
         jogador do `_qa/joga_folha.js` consegue resolver uma folha de muitos
         toques em vez de dizer "não sei". */
      registra(id, pi, it.ordem);
      var lin = el("div", "pedido");
      lin.innerHTML = "<b>" + it.q + "</b> bandejas com <b>" + it.n + "</b> " + it.rot + " em cada";
      box.appendChild(lin);
      var pr = el("div", "prateleira"), caixas = [], faltam = it.q * it.n, k;
      for(k = 0; k < it.q; k++){
        var g = el("div", "grupo vazio"); g._tem = 0; pr.appendChild(g); caixas.push(g);
      }
      box.appendChild(pr);
      var banco = el("div", "ops");
      for(k = 0; k < it.q * it.n; k++){
        (function(k){
          var b = el("button", "op pecafig", img(it.w, "figop"));
          b.setAttribute("data-qa", "peca-" + id + "-" + k);
          b.setAttribute("aria-label", "figura para pôr na bandeja");
          function poe(alvo){
            if(ST.resp[id] || b.className.indexOf("usada") > -1) return;
            /* ⚠️ a bandeja CHEIA não aceita mais: é o "mesmo tanto" ensinando
               sozinho, sem a palavra "errou" */
            var g = alvo && alvo._tem !== undefined ? alvo : null;
            if(!g) for(var j = 0; j < caixas.length; j++) if(caixas[j]._tem < it.n){ g = caixas[j]; break; }
            if(!g || g._tem >= it.n){
              sErro(); if(alvo){ alvo.className = "grupo cheio";
                setTimeout(function(){ alvo.className = "grupo" + (alvo._tem ? "" : " vazio"); }, 480); }
              errou(id, "dica3_" + it.n); return;
            }
            sPasso();
            g.innerHTML += img(it.w, "figgr"); g._tem++;
            g.className = "grupo" + (g._tem >= it.n ? " completo" : "");
            b.className = "op pecafig usada"; faltam--;
            if(faltam === 0) setTimeout(function(){ acertou(id, "certo3_" + it.q + "x" + it.n); }, 420);
          }
          b.onclick = function(){ if(b._arrastou){ b._arrastou = false; return; } poe(null); };
          puxavel(b, caixas, poe);
          banco.appendChild(b);
        })(k);
      }
      box.appendChild(banco);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 4 — QUAL SOMA CONTA ESTA CENA (papel d09: "REALIZE A SOMA DAS PARCELAS
   IGUAIS"). O coração do pedido do Marcos: a cena vira uma SOMA DE PARCELAS
   IGUAIS antes de virar conta de vezes. O distrator forte é a soma trocada
   (4+4+4 contra 3+3+3+3): as duas dão doze, mas só uma conta ESTA cena. */
function f4(d, pi){
  faixa(d, pi, NOMES[3]);
  enunciado(d, pi, "Qual <b>soma</b> conta o que está na prateleira?", "p4enun");
  var L = ST.folha.p4;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n4_" + i, box = item(i + 1);
      box.appendChild(prateleira(it.w, it.q, it.n));
      opcoes(box, pi, id, opsSoma(it.op), "s" + it.n + "x" + it.q, "contabt",
             "certo4_" + it.q + "x" + it.n, "dica4_" + it.q + "x" + it.n);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 5 — E AGORA A CONTA DE VEZES (papel d01: "5 vezes o 2 =")
   ⚠️ A ORDEM DA CASA: `q grupos de n` escreve-se `q × n`. Por isso os distratores
      NUNCA são `n × q` — trocar a ordem dá o mesmo total (é a folha 20 que ensina
      isso) e marcar como erro confundiria a criança de propósito. */
function f5(d, pi){
  faixa(d, pi, NOMES[4]);
  enunciado(d, pi, "A mesma prateleira, agora em <b>conta de vezes</b>. Qual é?", "p5enun");
  var L = ST.folha.p5;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n5_" + i, box = item(i + 1);
      /* ⚠️ AQUI HAVIA UMA LINHA "4 grupos de 3" — e ela ENTREGAVA a resposta.
         Com ela na tela, a criança casava os dois números da frase com os dois
         números do botão e acertava sem olhar a prateleira uma única vez. A
         folha de vezes tem que ser resolvida na prateleira; quem explica a
         ordem dos números é a dica que cresce a cada erro. */
      box.appendChild(prateleira(it.w, it.q, it.n));
      opcoes(box, pi, id, opsConta(it.op), "c" + it.q + "x" + it.n, "contabt",
             "certo5_" + it.q + "x" + it.n, "dica5_" + it.q + "x" + it.n);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 6 — LIGUE A SOMA À MULTIPLICAÇÃO (papel d02: "Transforma as adições em
   multiplicações"). O gesto que mais aparece na colheita inteira. */
function f6(d, pi){
  faixa(d, pi, NOMES[5]);
  enunciado(d, pi, "Ligue cada <b>soma</b> à conta de <b>vezes</b> que diz a mesma coisa.", "p6enun");
  var L = ST.folha.p6;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var box = item(0), pares = it.g.map(function(p){
        var k = p[0] + "x" + p[1];
        return {k: k,
                esq: '<span class="somaop">' + somaDe(p[1], p[0]) + "</span>",
                dir: '<span class="contaop">' + vezes(p[0], p[1]) + "</span>",
                w: somaDe(p[1], p[0]), wd: p[0] + " vezes " + p[1],
                fe: "soma_" + p[1] + "x" + p[0], fd: "conta_" + k,
                fc: "certo6_" + k, dica: "dica6_" + k};
      });
      montaLigar(box, pi, "c" + i, pares, d);
      d.appendChild(box);
    })(L[i], i);
  }
}

/* 7 — COMO SE LÊ (papel d10: "4 X 2 lê-se: quatro vezes o dois").
   ⭐ Folha de OUVIR E ACHAR: quem fala é a voz, e a criança só encontra. É o
      degrau que falta em quase toda folha de papel — no papel ninguém lê a
      conta em voz alta para a criança, e é assim que "x" vira um risco sem nome. */
function f7(d, pi){
  faixa(d, pi, NOMES[6]);
  enunciado(d, pi, "Ouça e ache a conta que a voz leu.", "p7enun");
  var L = ST.folha.p7;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n7_" + i, box = item(i + 1), lin = el("div", "ouvirlin");
      lin.appendChild(botaoSom("Ouvir a conta de novo", function(){ falar("leitura_" + it.q + "x" + it.n); }));
      lin.appendChild(el("span", "pedido", "toque aqui para ouvir"));
      box.appendChild(lin);
      aoAbrir(d, function(){ if(!ST.resp[id] && i === 0) falarDepois("leitura_" + it.q + "x" + it.n, 900); });
      opcoes(box, pi, id, opsConta(it.op), "c" + it.q + "x" + it.n, "contabt",
             "certo7_" + it.q + "x" + it.n, "dica7_" + it.q + "x" + it.n);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 8 — ESCREVA O TOTAL DA SOMA (papel d05: "adição: ____")
   ⭐ Aqui a criança PRODUZ o número em vez de escolher entre três. É o "registro"
      que o currículo do 3º ano pede — e é o degrau que separa reconhecer de saber. */
function f8(d, pi){
  faixa(d, pi, NOMES[7]);
  enunciado(d, pi, "Some as parcelas iguais e <b>escreva</b> o total.", "p8enun");
  var L = ST.folha.p8;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n8_" + i, box = item(i + 1), tot = String(it.q * it.n);
      registra(id, pi, tot);
      box.appendChild(prateleira(it.w, it.q, it.n));
      var lin = el("div", "contalin");
      lin.appendChild(el("span", "conta", somaDe(it.n, it.q) + " ="));
      var q = el("div", "sq vaga" + (ST.resp[id] ? " ok" : ""), ST.resp[id] ? tot : "");
      q.setAttribute("data-qa", "esc-" + id);
      q.setAttribute("role", "button"); q.setAttribute("tabindex", "0");
      q.setAttribute("aria-label", "escrever o total da soma");
      q.onclick = function(){
        if(ST.resp[id]) return;
        ativa(q, tot, id, "certo8_" + it.q + "x" + it.n, "dica8_" + it.q + "x" + it.n);
      };
      lin.appendChild(q);
      lin.appendChild(botaoSom("Ouvir a soma", function(){ falar("soma_" + it.n + "x" + it.q); }));
      box.appendChild(lin);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 9 — E AGORA O TOTAL DA MULTIPLICAÇÃO (papel d04: "__ X __ = __")
   A MESMA cena da folha 8, a MESMA resposta, outro registro: é aqui que a
   criança vê com os próprios olhos que as duas contas são a mesma coisa. */
function f9(d, pi){
  faixa(d, pi, NOMES[8]);
  enunciado(d, pi, "A mesma cena. Agora <b>escreva</b> o total da conta de vezes.", "p9enun");
  var L = ST.folha.p9;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n9_" + i, box = item(i + 1), tot = String(it.q * it.n);
      registra(id, pi, tot);
      box.appendChild(prateleira(it.w, it.q, it.n));
      var lin = el("div", "contalin");
      lin.appendChild(el("span", "conta gr", vezes(it.q, it.n) + " ="));
      var q = el("div", "sq vaga" + (ST.resp[id] ? " ok" : ""), ST.resp[id] ? tot : "");
      q.setAttribute("data-qa", "esc-" + id);
      q.setAttribute("role", "button"); q.setAttribute("tabindex", "0");
      q.setAttribute("aria-label", "escrever o total de " + it.q + " vezes " + it.n);
      q.onclick = function(){
        if(ST.resp[id]) return;
        ativa(q, tot, id, "certo9_" + it.q + "x" + it.n, "dica9_" + it.q + "x" + it.n);
      };
      lin.appendChild(q);
      lin.appendChild(botaoSom("Ouvir a conta", function(){ falar("leitura_" + it.q + "x" + it.n); }));
      box.appendChild(lin);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 10 — COMPLETE A TABELA (papel d07: "adição | multiplicação | resultado")
   ⭐ A tabela é a folha que MAIS aparece na colheita, e tem um motivo: ela põe
      as três escritas lado a lado, e a criança vê que são a mesma coisa dita de
      três jeitos. Aqui falta uma casinha de cada linha, sorteada. */
function f10(d, pi){
  faixa(d, pi, NOMES[9]);
  enunciado(d, pi, "Preencha a tabela. Uma casinha de cada linha está vazia.", "p10enun");
  var L = ST.folha.p10;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n10_" + i, box = item(i + 1), tot = it.q * it.n;
      var tab = el("div", "tabmult");
      var cel = [somaDe(it.n, it.q), vezes(it.q, it.n), String(tot)];
      var rot = ["soma de parcelas iguais", "multiplicação", "total"];
      var certo = it.falta === 0 ? "s" + it.n + "x" + it.q
                : it.falta === 1 ? "c" + it.q + "x" + it.n : String(tot);
      for(var c = 0; c < 3; c++){
        var cx = el("div", "tcel" + (c === it.falta ? " vaga" : ""));
        cx.appendChild(el("span", "trot", rot[c]));
        cx.appendChild(el("span", "tval", c === it.falta ? "?" : cel[c]));
        tab.appendChild(cx);
      }
      box.appendChild(tab);
      var lista = it.falta === 2 ? opsNum(it.op)
                : it.falta === 1 ? opsConta(it.op) : opsSoma(it.op);
      opcoes(box, pi, id, lista, certo, "contabt",
             "certo10_" + it.q + "x" + it.n, "dica10_" + it.falta);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 11 a 15 — AS CINCO MÁQUINAS (papel d06: "2 X" ligado a 12, 7, 15, 6, 9; e a
   máquina do d03).
   ⭐ EM BLOCO, E DE PROPÓSITO (regra do Marcos, ago/2026: *"as repetições das
      interatividades têm que ser seguidas e não espaçadas"*). A máquina é a
      mesma tela cinco vezes — mas cada uma é uma tabuada diferente, e é assim
      que a criança percebe que mudou o QUE ela faz e não só o número.
   ⚠️ São exatamente as cinco da rede: 2, 5, 10, 3 e 4 — e nesta ordem, que é a
      ordem de dificuldade real (dobro, a mão, o zero, e por último as duas que
      não têm truque). */
function maquina(d, pi, L, fator, pote){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "A máquina multiplica por <b>" + fator + "</b>. O que sai?", "p" + pi + "enun");
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n" + pi + "_" + i, box = item(i + 1), tot = fator * it.e;
      var m = el("div", "maq");
      m.appendChild(el("div", "mentra", String(it.e)));
      m.appendChild(el("div", "mcorpo", "&times; " + fator));
      m.appendChild(el("div", "msai", "?"));
      box.appendChild(m);
      opcoes(box, pi, id, opsNum(it.op), String(tot), "figbt",
             "certomaq_" + fator + "x" + it.e, "dicamaq_" + fator + "x" + it.e,
             function(){ var s = m.querySelector(".msai"); if(s){ s.textContent = tot; s.className = "msai ok"; } });
      fechaItem(d, box, id);
    })(L[i], i);
  }
}
function f11(d, pi){ maquina(d, pi, ST.folha.p11, 2,  "p11"); }
function f12(d, pi){ maquina(d, pi, ST.folha.p12, 5,  "p12"); }
function f13(d, pi){ maquina(d, pi, ST.folha.p13, 10, "p13"); }
function f14(d, pi){ maquina(d, pi, ST.folha.p14, 3,  "p14"); }
function f15(d, pi){ maquina(d, pi, ST.folha.p15, 4,  "p15"); }

/* 16 e 17 — CONTAR DE TANTO EM TANTO (papel d28, segunda metade: "Descubra o
   segredo e complete as sequências numéricas" — e as cinco filas impressas ali
   são justamente de 2 em 2, 3 em 3, 4 em 4, 5 em 5 e 10 em 10, os cinco fatores
   da rede; também no d22: "Complete na sequência: 5×1, 5×2, 5×3…"). É a ponte entre contar e multiplicar: a criança que conta de 5 em 5
   já tem a tabuada do 5 na boca antes de decorar coisa nenhuma. */
function sequencia(d, pi, L){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Toque nos números <b>na ordem</b>, do menor para o maior.", "p" + pi + "enun");
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n" + pi + "_" + i, box = item(i + 1);
      var nums = [], k;
      for(k = 0; k < it.n; k++) nums.push(it.ini + k * it.passo);
      registra(id, pi, nums.join(" "));
      box.appendChild(el("div", "pedido", "de <b>" + it.passo + "</b> em <b>" + it.passo + "</b>"));
      var fila = el("div", "ops"), pos = 0, bts = {};
      baralha(nums).forEach(function(v){
        var b = el("button", "op numop seqbt" + (ST.resp[id] ? " certa" : ""), String(v));
        b.setAttribute("data-qa", "seq-" + id + "-" + v);
        b.setAttribute("aria-label", "número " + v);
        bts[v] = b;
        b.onclick = function(){
          if(ST.resp[id] || b.className.indexOf("certa") > -1) return;
          sPasso(); falar("num_" + v);
          if(v === nums[pos]){
            b.className = "op numop seqbt certa"; pos++;
            if(pos >= nums.length) setTimeout(function(){ acertou(id, "certoseq_" + it.passo + "_" + it.ini); }, 380);
          } else {
            b.className = "op numop seqbt erro";
            setTimeout(function(){ b.className = "op numop seqbt"; }, 480);
            errou(id, "dicaseq_" + it.passo);
          }
        };
        fila.appendChild(b);
      });
      box.appendChild(fila);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}
function f16(d, pi){ sequencia(d, pi, ST.folha.p16); }
function f17(d, pi){ sequencia(d, pi, ST.folha.p17); }

/* 18 — O TAPETE (papel d19: "OBSERVE OS TAPETES. CONTE A QUANTIDADE DE
   QUADRADINHOS NA VERTICAL E NA HORIZONTAL… ESCREVA A MULTIPLICAÇÃO"; e o d21,
   que dá nome à ideia: "ORGANIZAÇÃO RETANGULAR — 2 LINHAS COM 4 COLUNAS = 8").
   ⚠️ A DISPOSIÇÃO RETANGULAR aparece em só 3 das 40 folhas colhidas (d19, d21
      e d28) — bem menos do que o peso que a rede lhe dá. Por isso ela ocupa
      DUAS folhas aqui: é reforço decidido pelo currículo, sobre material que o
      papel deu. */
function f18(d, pi){
  faixa(d, pi, NOMES[17]);
  enunciado(d, pi, "Conte as <b>fileiras</b> e quantos tem em cada uma. Qual é a conta?", "p18enun");
  var L = ST.folha.p18;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n18_" + i, box = item(i + 1);
      box.appendChild(tapete(it.w, it.li, it.co));
      opcoes(box, pi, id, opsConta(it.op), "c" + it.li + "x" + it.co, "contabt",
             "certo18_" + it.li + "x" + it.co, "dica18_" + it.li + "x" + it.co);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 19 — PINTE O TAPETE NA MALHA (papel d28: "Utilize a malha para representar
   as seguintes multiplicações", com dez malhas de 5×3, 4×4, 2×5, 5×5, 3×3…)
   ⭐ Tocar num quadradinho pinta o RETÂNGULO inteiro do canto até ele — a
      criança desenha o tapete de uma vez e vê a forma nascer. É o gesto que a
      folha de papel pede com o lápis, e o único jeito de a malha não virar
      cinquenta toques. */
function f19(d, pi){
  faixa(d, pi, NOMES[18]);
  enunciado(d, pi, "Pinte na malha o tapete que o pedido manda. Toque num quadradinho.", "p19enun");
  var L = ST.folha.p19;
  estojo(d);
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n19_" + i, box = item(i + 1);
      registra(id, pi, "r" + (it.li - 1) + "c" + (it.co - 1));
      box.appendChild(el("div", "pedido",
        "<b>" + it.li + "</b> fileiras com <b>" + it.co + "</b> quadradinhos em cada"));
      var g = el("div", "malha"), cels = [], r, c;
      for(r = 0; r < 5; r++){
        var lin = el("div", "mlin");
        for(c = 0; c < 6; c++){
          (function(r, c){
            var cel = el("button", "mcel");
            cel.setAttribute("data-qa", "cel-" + id + "-r" + r + "c" + c);
            cel.setAttribute("aria-label", "quadradinho da fileira " + (r + 1) + ", coluna " + (c + 1));
            cel.onclick = function(){
              if(ST.resp[id]) return;
              sPasso();
              var cor = LAPIS[LAPIS_ESCOLHIDO];
              cels.forEach(function(o){
                var pinta = o.r <= r && o.c <= c;
                o.el.className = "mcel" + (pinta ? " pinta" : "");
                o.el.style.background = pinta ? cor.c : "";
              });
              if(r === it.li - 1 && c === it.co - 1)
                setTimeout(function(){ acertou(id, "certo19_" + it.li + "x" + it.co); }, 420);
              else errou(id, "dica19_" + it.li + "x" + it.co);
            };
            cels.push({r: r, c: c, el: cel});
            lin.appendChild(cel);
          })(r, c);
        }
        g.appendChild(lin);
      }
      box.appendChild(g);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 20 — A VIRADA (⚠️ NÃO veio do papel: é decisão minha, e fica declarada)
   ⚠️ Das 40 folhas colhidas, NENHUMA pede a comutativa. Esta folha nasce do
      degrau que a folha 18 abriu (o tapete): girar o retângulo é a maneira de
      VER que a ordem dos fatores não muda o total, e o currículo põe a
      disposição retangular no 3º ano. Dizer que veio da colheita seria mentir
      no lugar mais fácil de mentir.
   ⭐ A CRIANÇA PREVÊ ANTES DE VER — e é essa a diferença entre a folha de papel
      e esta. No papel ela lê que a ordem não muda o total; aqui ela APOSTA e
      depois o tapete gira na frente dela. É a lacuna de curiosidade do
      Loewenstein: só se aprende o que se quis saber. */
function f20(d, pi){
  faixa(d, pi, NOMES[19]);
  enunciado(d, pi, "Se eu <b>girar</b> o tapete, o total vai mudar? Aposte primeiro!", "p20enun");
  var L = ST.folha.p20;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n20_" + i, box = item(i + 1);
      var cx = el("div", "girabox");
      var tp = tapete(it.w, it.li, it.co);
      cx.appendChild(tp);
      box.appendChild(cx);
      box.appendChild(contaComSom(vezes(it.li, it.co) + " = " + (it.li * it.co),
                                  "leitura_" + it.li + "x" + it.co));
      /* ⚠️ BARALHADAS, e por um motivo: nesta folha a resposta é SEMPRE "fica o
         mesmo tanto" (é essa a descoberta). Na mesma ordem, a criança decorava a
         posição no primeiro item e tocava no mesmo lugar nos outros três sem ler
         nada — o contrário de uma folha que pede aposta. */
      opcoes(box, pi, id, baralha([
        {v: "mesmo", rot: "fica o <b>mesmo tanto</b>", aria: "fica o mesmo tanto", fala: "op_mesmo"},
        {v: "mais",  rot: "fica com <b>mais</b>",      aria: "fica com mais",      fala: "op_mais"},
        {v: "menos", rot: "fica com <b>menos</b>",     aria: "fica com menos",     fala: "op_menos"}
      ]), "mesmo", "palbt", "certo20_" + it.li + "x" + it.co, "dica20",
      function(){
        cx.innerHTML = "";
        cx.appendChild(tapete(it.w, it.co, it.li));
        cx.className = "girabox girou";
        box.appendChild(contaComSom(vezes(it.co, it.li) + " = " + (it.li * it.co),
                                    "leitura_" + it.co + "x" + it.li));
      });
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 21 — A CESTA QUE FALTA (combinação de possibilidades)
   ⚠️ ESTA IDEIA NÃO ESTAVA EM NENHUMA DAS 40 FOLHAS COLHIDAS — nem uma. Ela
      entra porque o currículo de Blumenau a pede com todas as letras no 3º ano
      (*"combinação de possibilidades"*), e está DECLARADO aqui que ela veio do
      currículo e não do pote. Inventar que veio da colheita seria mentir no
      lugar mais fácil de mentir.
   A tabela mostra todas as cestas possíveis, menos uma: a criança vê o método
   (cruzar cada fruta com cada doce) e acha o buraco. */
function f21(d, pi){
  faixa(d, pi, NOMES[20]);
  enunciado(d, pi, "Cada cesta leva <b>uma fruta</b> e <b>um doce</b>. Ache a cesta que falta.", "p21enun");
  var L = ST.folha.p21;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n21_" + i, box = item(i + 1);
      registra(id, pi, "f" + it.fi + "d" + it.di);
      var g = el("div", "cestas"), r, c;
      var cab = el("div", "clin");
      cab.appendChild(el("div", "ccanto", ""));
      for(c = 0; c < it.dc.length; c++) cab.appendChild(el("div", "ccab", img(it.dc[c], "figgr")));
      g.appendChild(cab);
      for(r = 0; r < it.fr.length; r++){
        (function(r){
          var lin = el("div", "clin");
          lin.appendChild(el("div", "ccab", img(it.fr[r], "figgr")));
          for(var c2 = 0; c2 < it.dc.length; c2++){
            (function(c2){
              var vazia = (r === it.fi && c2 === it.di);
              var cel = el("button", "ccel" + (vazia ? " vazia" : " cheia"));
              cel.setAttribute("data-qa", "cmb-" + id + "-f" + r + "d" + c2);
              cel.setAttribute("aria-label", vazia ? "cesta vazia" : "cesta pronta");
              if(!vazia) cel.innerHTML = img(it.fr[r], "figmini") + img(it.dc[c2], "figmini");
              cel.onclick = function(){
                if(ST.resp[id]) return;
                sPasso();
                if(vazia){
                  cel.innerHTML = img(it.fr[r], "figmini") + img(it.dc[c2], "figmini");
                  cel.className = "ccel cheia nova";
                  setTimeout(function(){ acertou(id, "certo21_" + it.fr.length + "x" + it.dc.length); }, 420);
                } else {
                  cel.className = "ccel cheia treme";
                  setTimeout(function(){ cel.className = "ccel cheia"; }, 480);
                  errou(id, "dica21");
                }
              };
              lin.appendChild(cel);
            })(c2);
          }
          g.appendChild(lin);
        })(r);
      }
      box.appendChild(g);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 22 — QUANTAS CESTAS DIFERENTES (o registro da combinação)
   A criança já montou a tabela na folha 21; aqui ela ESCREVE quantas são e
   descobre que também isso é uma multiplicação. */
function f22(d, pi){
  faixa(d, pi, NOMES[21]);
  enunciado(d, pi, "Quantas cestas <b>diferentes</b> dá para montar? Escreva.", "p22enun");
  var L = ST.folha.p22;
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n22_" + i, box = item(i + 1), tot = String(it.a * it.b);
      registra(id, pi, tot);
      var lin = el("div", "pedido");
      lin.innerHTML = "<b>" + it.a + "</b> frutas &nbsp;&bull;&nbsp; <b>" + it.b + "</b> doces";
      box.appendChild(lin);
      var fl = el("div", "prateleira");
      for(var k = 0; k < it.a; k++) fl.innerHTML += img(it.fr[k], "figgr");
      for(k = 0; k < it.b; k++) fl.innerHTML += img(it.dc[k], "figgr");
      box.appendChild(fl);
      var cl = el("div", "contalin");
      cl.appendChild(el("span", "conta gr", vezes(it.a, it.b) + " ="));
      var q = el("div", "sq vaga" + (ST.resp[id] ? " ok" : ""), ST.resp[id] ? tot : "");
      q.setAttribute("data-qa", "esc-" + id);
      q.setAttribute("role", "button"); q.setAttribute("tabindex", "0");
      q.setAttribute("aria-label", "escrever quantas cestas diferentes");
      q.onclick = function(){
        if(ST.resp[id]) return;
        ativa(q, tot, id, "certo22_" + it.a + "x" + it.b, "dica22_" + it.a + "x" + it.b);
      };
      cl.appendChild(q);
      box.appendChild(cl);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}

/* 23 e 24 — OS PROBLEMAS DO ARMAZÉM (papel d31: "Resolva os problemas")
   ⚠️ O ENUNCIADO É FALADO, sempre. No 3º ano ainda tem criança que lê devagar, e
      problema é a hora em que ler devagar vira "não sei matemática". A voz não
      dá a resposta: ela lê o que está escrito, palavra por palavra. */
function problemas(d, pi, L, chave){
  faixa(d, pi, NOMES[pi - 1]);
  enunciado(d, pi, "Leia (ou ouça) o problema e <b>escreva</b> a resposta.", "p" + pi + "enun");
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n" + pi + "_" + i, box = item(i + 1), tot = String(it.q * it.n);
      registra(id, pi, tot);
      var cx = el("div", "problin");
      cx.appendChild(el("p", "prob", it.t));
      cx.appendChild(botaoSom("Ouvir o problema", function(){ falar(chave + "_" + i + "_" + it.q + "x" + it.n); }));
      box.appendChild(cx);
      if(it.w) box.appendChild(prateleira(it.w, it.q, Math.min(it.n, 5), "peq"));
      var cl = el("div", "contalin");
      cl.appendChild(el("span", "conta gr", "Resposta:"));
      var q = el("div", "sq vaga" + (ST.resp[id] ? " ok" : ""), ST.resp[id] ? tot : "");
      q.setAttribute("data-qa", "esc-" + id);
      q.setAttribute("role", "button"); q.setAttribute("tabindex", "0");
      q.setAttribute("aria-label", "escrever a resposta do problema");
      q.onclick = function(){
        if(ST.resp[id]) return;
        ativa(q, tot, id, "certoprob_" + it.q + "x" + it.n, "dicaprob_" + it.q + "x" + it.n);
      };
      cl.appendChild(q);
      box.appendChild(cl);
      fechaItem(d, box, id);
    })(L[i], i);
  }
}
function f23(d, pi){ problemas(d, pi, ST.folha.p23, "prob23"); }
function f24(d, pi){ problemas(d, pi, ST.folha.p24, "prob24"); }

/* 25 — O CARTAZ DO ARMAZÉM (o fecho com gancho)
   ⭐ A criança escolhe as contas que ela quer pendurar no cartaz do armazém, e
      o cartaz fica guardado no fim, com o nome dela. Nada de prova: é o mural
      do que ela aprendeu, que é como toda folha de papel boa termina — e é o
      "quero mais" do padrão da casa. */
function f25(d, pi){
  faixa(d, pi, NOMES[24]);
  enunciado(d, pi, "Toque nas contas que você quer no <b>seu cartaz</b>. Ele fica guardado no fim.", "p25enun");
  var L = ST.folha.p25;
  var mural = el("div", "mural");
  for(var i = 0; i < L.length; i++){
    (function(it, i){
      var id = "n25_" + i, box = item(0), k = "c" + it.q + "x" + it.n;
      registra(id, pi, k);
      var b = el("button", "op palbt cartazbt" + (ST.resp[id] ? " certa" : ""));
      b.innerHTML = '<span class="contaop">' + vezes(it.q, it.n) + " = " + (it.q * it.n) + "</span>" +
                    '<span class="cartazfig">' + img(it.w, "figgr") + "</span>";
      b.setAttribute("data-qa", "mur-" + id + "-" + k);
      b.setAttribute("aria-label", it.q + " vezes " + it.n + " é igual a " + (it.q * it.n));
      b.onclick = function(){
        if(ST.resp[id]) return;
        sPasso(); b.className = "op palbt cartazbt certa";
        acertou(id, "certo25_" + it.q + "x" + it.n);
      };
      box.className = "item solto";
      box.appendChild(b);
      mural.appendChild(box);
      if(ST.resp[id]) box.className = "item solto feito";
      box.setAttribute("data-qa", "item-" + id);
    })(L[i], i);
  }
  d.appendChild(mural);
}
