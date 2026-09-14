# -*- coding: utf-8 -*-
u"""GERA O POTE E AS FALAS DO ARMAZÉM DO MESMO TANTO (multiplicação, 3º ano).

⚠️ REGRA DA CASA: o `falas.json` é a VERDADE. Texto escrito aqui = voz gravada;
   texto mudou = voz regravada. MP3 não se lê, então é este arquivo que permite
   conferir o que a criança OUVE.

⚠️ ESTE SCRIPT GERA TAMBÉM O POTE (`/*ITENS-INI*/`), e isso é de propósito: no
   caderno de alfabetização o pote era escrito à mão no `index.html` e as falas
   aqui, e os dois divergiram mais de uma vez (item no pote sem fala = a criança
   toca e o app fica mudo). Com um dono só, não há como divergir.

⚠️⚠️ O TETO DA REDE, E ELE É O CORAÇÃO DESTE ARQUIVO: Blumenau manda, para o 3º
   ano, *"problemas de multiplicação (por 2, 3, 4, 5 e 10)"*. Fatores 6, 7, 8 e 9
   estão FORA — e metade das quarenta folhas de papel colhidas os usa. Quem
   segura esse teto é a lista `FATORES` aqui embaixo; mexer nela é mexer no ano
   escolar da atividade.
"""
from __future__ import print_function

import io
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
CAM = os.path.join(AQUI, u"index.html")
PREFIXO = u"mu_"
VOZ = u"pt-BR-AntonioNeural"

# ⚠️ O TETO DA REDE (3º ano de Blumenau). Não ampliar sem mudar o ano.
FATORES = [2, 3, 4, 5, 10]

# ---- como a voz diz cada número (o Edge TTS lê algarismo solto sem problema,
#      mas dentro de frase o texto escrito por extenso soa melhor e nunca hesita)
DIZN = {0: u"zero", 1: u"um", 2: u"dois", 3: u"três", 4: u"quatro", 5: u"cinco",
        6: u"seis", 7: u"sete", 8: u"oito", 9: u"nove", 10: u"dez", 11: u"onze",
        12: u"doze", 13: u"treze", 14: u"catorze", 15: u"quinze",
        16: u"dezesseis", 17: u"dezessete", 18: u"dezoito", 19: u"dezenove",
        20: u"vinte", 21: u"vinte e um", 22: u"vinte e dois", 24: u"vinte e quatro",
        25: u"vinte e cinco", 27: u"vinte e sete", 28: u"vinte e oito",
        30: u"trinta", 32: u"trinta e dois", 33: u"trinta e três",
        35: u"trinta e cinco", 36: u"trinta e seis", 40: u"quarenta",
        42: u"quarenta e dois", 44: u"quarenta e quatro", 45: u"quarenta e cinco",
        48: u"quarenta e oito", 50: u"cinquenta", 54: u"cinquenta e quatro",
        55: u"cinquenta e cinco", 60: u"sessenta", 63: u"sessenta e três",
        70: u"setenta", 80: u"oitenta", 90: u"noventa", 100: u"cem",
        23: u"vinte e três", 26: u"vinte e seis", 29: u"vinte e nove",
        31: u"trinta e um", 34: u"trinta e quatro", 37: u"trinta e sete",
        38: u"trinta e oito", 39: u"trinta e nove", 41: u"quarenta e um",
        43: u"quarenta e três", 46: u"quarenta e seis", 47: u"quarenta e sete",
        49: u"quarenta e nove", 51: u"cinquenta e um", 52: u"cinquenta e dois",
        53: u"cinquenta e três", 56: u"cinquenta e seis", 57: u"cinquenta e sete",
        58: u"cinquenta e oito", 59: u"cinquenta e nove"}


def dz(v):
    return DIZN.get(v, u"%d" % v)


def dzf(v):
    u"""o numero no FEMININO — e ele nao e frescura de gramatica.

    ⚠️ LICAO PAGA na primeira rodada do pre-voo (14/set/2026): as falas saiam
       com *"dois fileiras"*, *"dois bandejas"* e *"repetido dois vezes"*. Numa
       atividade de 3o ano, em que a voz e o que a crianca que le devagar usa
       para entender o enunciado, isso nao e detalhe: e a professora ouvindo o
       app falar errado na frente da turma. `vezes`, `fileiras`, `bandejas`,
       `cestas`, `frutas`, `parcelas` e metade das figuras sao femininas."""
    return u"duas" if v == 2 else dz(v)


def cap(t):
    u"""primeira letra maiuscula — a frase comeca com o numero em varias falas
    (*"dois grupos de tres..."*), e o revisor cobra isso com razao."""
    return t[:1].upper() + t[1:] if t else t


# ---- as figuras do armazém: (chave do arquivo, singular falado, plural falado)
#      ⚠️ O PLURAL VAI ESCRITO. O Edge TTS lê "3 maca" como "maca"; escrito
#         "maçãs" ele acerta. Figura nova = linha nova aqui.
FIGS = [
    (u"maca", u"maçã", u"maçãs"),
    (u"banana", u"banana", u"bananas"),
    (u"laranja", u"laranja", u"laranjas"),
    (u"uva", u"uva", u"uvas"),
    (u"ovo", u"ovo", u"ovos"),
    (u"bolacha", u"bolacha", u"bolachas"),
    (u"bolo", u"bolo", u"bolos"),
    (u"sorvete", u"sorvete", u"sorvetes"),
    (u"pipoca", u"pipoca", u"pipocas"),
    (u"bola", u"bola", u"bolas"),
    (u"caixa", u"caixa", u"caixas"),
    (u"estrela", u"estrela", u"estrelas"),
    (u"flor", u"flor", u"flores"),
    (u"peixe", u"peixe", u"peixes"),
    (u"pato", u"pato", u"patos"),
    (u"carro", u"carrinho", u"carrinhos"),
    (u"cadeira", u"cadeira", u"cadeiras"),
    (u"abelha", u"abelha", u"abelhas"),
    (u"borboleta", u"borboleta", u"borboletas"),
]
SING = dict((f[0], f[1]) for f in FIGS)
PLUR = dict((f[0], f[2]) for f in FIGS)
# ⚠️ o genero de cada figura — sem isto a voz diz "dois maçãs"
FEM = set(u"""maca banana laranja uva bolacha pipoca bola estrela flor cadeira
    abelha borboleta""".split())


def quantas(v, w):
    u"""`dois ovos` mas `duas maçãs`."""
    return (dzf(v) if w in FEM else dz(v))

FRUTAS = [u"maca", u"banana", u"laranja", u"uva"]
DOCES = [u"bolo", u"sorvete", u"bolacha", u"pipoca"]


def fig(i):
    return FIGS[i % len(FIGS)][0]


# ============================================================
#  O POTE — item por item, com os distratores calculados aqui
# ============================================================

def nums(*vs):
    u"""opções numéricas: sem repetir, em ordem, no máximo quatro."""
    fora = []
    for v in vs:
        if v > 0 and v not in fora:
            fora.append(v)
    return sorted(fora)[:4]


def contas(*ps):
    fora = []
    for p in ps:
        if p not in fora:
            fora.append(p)
    return fora[:4]


# pares visuais: cabem na tela e ficam dentro do teto
VIS = [(q, n) for q in (2, 3, 4, 5) for n in (2, 3, 4, 5) if q * n <= 20]

IT = {}

# --- 1 e 2: quantos grupos / quantos em cada
IT[u"p1"] = [{u"w": fig(i), u"q": q, u"n": n, u"op": nums(q, n, q + 1, q * n)}
             for i, (q, n) in enumerate(VIS)]
IT[u"p2"] = [{u"w": fig(i + 3), u"q": q, u"n": n, u"op": nums(n, q, n + 1, q * n)}
             for i, (q, n) in enumerate(VIS)]

# --- 3: montar a bandeja (poucas peças: a criança põe uma a uma)
MONTA = [(q, n) for q in (2, 3, 4) for n in (2, 3, 4, 5) if q * n <= 12]
IT[u"p3"] = [{u"w": fig(i + 7), u"rot": PLUR[fig(i + 7)], u"q": q, u"n": n,
              u"ordem": u" ".join(str(k) for k in range(q * n))}
             for i, (q, n) in enumerate(MONTA)]

# --- 4: qual SOMA conta a cena  (o distrator forte é a soma trocada)
IT[u"p4"] = [{u"w": fig(i + 11), u"q": q, u"n": n,
              u"op": contas([n, q], [q, n], [n, q + 1], [n + 1, q])}
             for i, (q, n) in enumerate(VIS)]

# --- 5: qual CONTA DE VEZES  (nunca a comutada como distrator — ver folha 20)
IT[u"p5"] = [{u"w": fig(i + 2), u"q": q, u"n": n,
              u"op": contas([q, n], [q, n + 1], [q + 1, n], [q + 1, n + 1])}
             for i, (q, n) in enumerate(VIS)]

# --- 6: ligar soma <-> multiplicação, três pares por item
IT[u"p6"] = []
for k in range(0, len(VIS) - 2, 3):
    g = [list(VIS[k]), list(VIS[k + 1]), list(VIS[k + 2])]
    if len(set(a * b for a, b in g)) == 3:      # três totais diferentes na mesma coluna
        IT[u"p6"].append({u"g": g})

# --- 7: como se lê
IT[u"p7"] = [{u"q": q, u"n": n,
              u"op": contas([q, n], [q, n + 1], [q + 1, n], [n, q])}
             for (q, n) in VIS]

# --- 8 e 9: escrever o total (soma e multiplicação)
IT[u"p8"] = [{u"w": fig(i + 5), u"q": q, u"n": n} for i, (q, n) in enumerate(VIS)]
IT[u"p9"] = [{u"w": fig(i + 9), u"q": q, u"n": n} for i, (q, n) in enumerate(VIS)]

# --- 10: a tabela (falta rodando entre soma, conta e total)
IT[u"p10"] = []
for i, (q, n) in enumerate(VIS):
    falta = i % 3
    if falta == 0:
        op = contas([n, q], [q, n], [n, q + 1], [n + 1, q])
    elif falta == 1:
        op = contas([q, n], [q, n + 1], [q + 1, n], [q + 2, n])
    else:
        op = nums(q * n, q * n + n, max(1, q * n - n), q + n)
    IT[u"p10"].append({u"w": fig(i), u"q": q, u"n": n, u"falta": falta, u"op": op})

# --- 11 a 15: as cinco máquinas da rede, na ordem de dificuldade real
MAQ = [(u"p11", 2), (u"p12", 5), (u"p13", 10), (u"p14", 3), (u"p15", 4)]
for pote, f in MAQ:
    IT[pote] = [{u"e": e, u"op": nums(f * e, f * e + f, max(1, f * e - f), f + e)}
                for e in range(2, 11)]

# --- 16 e 17: contar de tanto em tanto
IT[u"p16"] = [{u"passo": p, u"ini": p * k, u"n": 4}
              for p in (2, 3) for k in range(1, 6)]
IT[u"p17"] = [{u"passo": p, u"ini": p * k, u"n": 4}
              for p in (5, 10) for k in range(1, 6)]

# --- 18: o tapete (disposição retangular)
RET = [(li, co) for li in (2, 3, 4, 5) for co in (2, 3, 4, 5) if li * co <= 20]
IT[u"p18"] = [{u"w": fig(i + 4), u"li": li, u"co": co,
               u"op": contas([li, co], [li, co + 1], [li + 1, co], [li + 1, co + 1])}
              for i, (li, co) in enumerate(RET)]

# --- 19: pintar na malha (a malha tem 5 fileiras e 6 colunas)
IT[u"p19"] = [{u"li": li, u"co": co}
              for li in (2, 3, 4, 5) for co in (2, 3, 4, 5, 6) if li * co <= 20]

# --- 20: a virada (li != co, senão a pergunta não tem graça nenhuma)
IT[u"p20"] = [{u"w": fig(i + 6), u"li": li, u"co": co}
              for i, (li, co) in enumerate([(p, q) for p in (2, 3, 4) for q in (2, 3, 4, 5)
                                            if p != q and p * q <= 12])]

# --- 21: a cesta que falta (combinação de possibilidades)
IT[u"p21"] = []
for a in (2, 3):
    for b in (2, 3):
        for d in range(2):
            fr = FRUTAS[d:d + a]
            dc = DOCES[d:d + b]
            IT[u"p21"].append({u"fr": fr, u"dc": dc,
                               u"fi": d % a, u"di": (b - 1 - d) % b})

# --- 22: quantas cestas diferentes
IT[u"p22"] = [{u"a": a, u"b": b, u"fr": FRUTAS[:a], u"dc": DOCES[:b]}
              for a in (2, 3, 4) for b in (2, 3, 4) if a * b <= 20]

# --- 23 e 24: os problemas do armazém
#     ⚠️ O TEXTO AQUI É O MESMO QUE A VOZ LÊ (a fala se monta deste campo `t`,
#        limpo das marcas), senão a tela diz uma coisa e a voz diz outra.
IT[u"p23"] = [
    {u"t": u"O seu Antônio guardou 4 caixas de ovos. Em cada caixa cabem 5 ovos. Quantos ovos ele guardou?", u"q": 4, u"n": 5, u"w": u"ovo"},
    {u"t": u"Na prateleira há 3 bandejas. Cada bandeja tem 4 bolos. Quantos bolos há na prateleira?", u"q": 3, u"n": 4, u"w": u"bolo"},
    {u"t": u"A dona Rita fez 5 pacotes de bolachas. Em cada pacote pôs 10 bolachas. Quantas bolachas ela fez?", u"q": 5, u"n": 10, u"w": u"bolacha"},
    {u"t": u"O armazém recebeu 2 engradados de laranjas. Cada engradado tem 10 laranjas. Quantas laranjas chegaram?", u"q": 2, u"n": 10, u"w": u"laranja"},
    {u"t": u"São 5 cestas de maçãs, com 3 maçãs em cada cesta. Quantas maçãs são ao todo?", u"q": 5, u"n": 3, u"w": u"maca"},
    {u"t": u"Cada saquinho leva 4 bolachas. O Beto encheu 4 saquinhos. Quantas bolachas ele usou?", u"q": 4, u"n": 4, u"w": u"bolacha"},
    {u"t": u"Há 3 caixas de sorvete e cada caixa tem 10 sorvetes. Quantos sorvetes há no freezer?", u"q": 3, u"n": 10, u"w": u"sorvete"},
    {u"t": u"O armazém arrumou 2 fileiras de bolas, com 5 bolas em cada fileira. Quantas bolas arrumou?", u"q": 2, u"n": 5, u"w": u"bola"},
]
IT[u"p24"] = [
    {u"t": u"No pátio do armazém as cadeiras estão em 4 fileiras, com 3 cadeiras em cada fileira. Quantas cadeiras há?", u"q": 4, u"n": 3, u"w": u"cadeira"},
    {u"t": u"O piso da entrada tem 5 fileiras de 4 quadradinhos. Quantos quadradinhos tem o piso?", u"q": 5, u"n": 4, u"w": None},
    {u"t": u"A vitrine tem 3 prateleiras e cada uma cabe 5 potes de pipoca. Quantos potes cabem na vitrine?", u"q": 3, u"n": 5, u"w": u"pipoca"},
    {u"t": u"A cesta do armazém leva 1 fruta e 1 doce. Há 3 frutas e 4 doces. Quantas cestas diferentes dá para montar?", u"q": 3, u"n": 4, u"w": None},
    {u"t": u"O lanche tem 2 sucos e 5 salgados para escolher. Quantos lanches diferentes dá para montar, com 1 suco e 1 salgado?", u"q": 2, u"n": 5, u"w": None},
    {u"t": u"As caixas do depósito estão empilhadas em 4 fileiras de 5 caixas. Quantas caixas há no depósito?", u"q": 4, u"n": 5, u"w": None},
    {u"t": u"A festa terá 1 bolo e 1 suco por mesa. Há 4 sabores de bolo e 3 sabores de suco. Quantas combinações diferentes há?", u"q": 4, u"n": 3, u"w": None},
    {u"t": u"O mural tem 2 fileiras com 10 desenhos em cada fileira. Quantos desenhos há no mural?", u"q": 2, u"n": 10, u"w": None},
]

# --- 25: o cartaz do armazém
IT[u"p25"] = [{u"w": fig(i), u"q": q, u"n": n}
              for i, (q, n) in enumerate([(2, 3), (2, 5), (3, 3), (3, 4), (3, 10),
                                          (4, 2), (4, 5), (5, 2), (5, 4), (5, 10),
                                          (10, 2), (10, 3), (2, 10), (4, 4)])]


# ============================================================
#  AS FALAS
# ============================================================
F = {}

# ---- a casa
F[u"capa"] = (u"O Armazém do Mesmo Tanto. Vinte e cinco folhas para descobrir que "
              u"multiplicar é somar quantidades iguais. Escreva o seu nome ali "
              u"embaixo e toque em Começar.")
F[u"fim"] = (u"Você chegou ao fim do Armazém do Mesmo Tanto! Agora você sabe que "
             u"toda multiplicação é uma soma de parcelas iguais. Olhe o seu cartaz "
             u"ali embaixo.")
F[u"escreva"] = u"Escreva o número."
F[u"vozOn"] = u"Narração ligada!"
F[u"quase"] = u"Quase! Olhe de novo e tente outra vez."
F[u"ligue"] = u"Agora toque na conta de vezes que diz a mesma coisa."
F[u"folhaPronta"] = u"Folha pronta! Pode virar a página."
F[u"novoCaderno"] = u"Caderno novo! As contas mudaram."

# ---- os enunciados das 25 folhas
# ⚠️ O texto aqui tem que dizer O MESMO que o `enunciado(...)` da folha em
#    `folhas.js`. Tela dizendo uma coisa e voz outra é o defeito que este arquivo
#    existe para impedir.
F[u"p1enun"] = u"Olhe a prateleira. Quantos grupos você vê?"
F[u"p2enun"] = u"Agora olhe dentro de um grupo. Quantos tem em cada um?"
F[u"p3enun"] = u"Ponha o mesmo tanto em cada bandeja. Puxe as figuras."
F[u"p4enun"] = u"Qual soma conta o que está na prateleira?"
F[u"p5enun"] = u"A mesma prateleira, agora em conta de vezes. Qual é?"
F[u"p6enun"] = u"Ligue cada soma à conta de vezes que diz a mesma coisa."
F[u"p7enun"] = u"Ouça e ache a conta que a voz leu."
F[u"p8enun"] = u"Some as parcelas iguais e escreva o total."
F[u"p9enun"] = u"A mesma cena. Agora escreva o total da conta de vezes."
F[u"p10enun"] = u"Preencha a tabela. Uma casinha de cada linha está vazia."
for pote, f in MAQ:
    F[pote + u"enun"] = (u"A máquina multiplica por %s. O que sai?" % dz(f))
F[u"p16enun"] = u"Toque nos números na ordem, do menor para o maior."
F[u"p17enun"] = F[u"p16enun"]
F[u"p18enun"] = u"Conte as fileiras e quantos tem em cada uma. Qual é a conta?"
F[u"p19enun"] = u"Pinte na malha o tapete que o pedido manda. Toque num quadradinho."
F[u"p20enun"] = u"Se eu girar o tapete, o total vai mudar? Aposte primeiro!"
F[u"p21enun"] = u"Cada cesta leva uma fruta e um doce. Ache a cesta que falta."
F[u"p22enun"] = u"Quantas cestas diferentes dá para montar? Escreva."
F[u"p23enun"] = u"Leia, ou ouça, o problema e escreva a resposta."
F[u"p24enun"] = F[u"p23enun"]
F[u"p25enun"] = u"Toque nas contas que você quer no seu cartaz. Ele fica guardado no fim."

# ---- os números soltos (o alto-falante de cada opção)
usados_num = set()
for pote in (u"p1", u"p2", u"p10"):
    for it in IT[pote]:
        if isinstance(it[u"op"][0], int):
            usados_num.update(it[u"op"])
for pote, f in MAQ:
    for it in IT[pote]:
        usados_num.update(it[u"op"])
for pote in (u"p16", u"p17"):
    for it in IT[pote]:
        usados_num.update(it[u"ini"] + k * it[u"passo"] for k in range(it[u"n"]))
for v in sorted(usados_num):
    F[u"num_%d" % v] = dz(v) + u"."

# ---- as contas e as somas (o alto-falante de cada opção escrita)
somas, cts, leituras = set(), set(), set()


def marca_conta(q, n):
    cts.add((q, n))
    leituras.add((q, n))


def marca_soma(n, q):
    somas.add((n, q))


for it in IT[u"p4"]:
    for p in it[u"op"]:
        marca_soma(p[0], p[1])
for it in IT[u"p5"] + IT[u"p7"] + IT[u"p18"]:
    for p in it[u"op"]:
        marca_conta(p[0], p[1])
for it in IT[u"p10"]:
    if it[u"falta"] == 0:
        for p in it[u"op"]:
            marca_soma(p[0], p[1])
    elif it[u"falta"] == 1:
        for p in it[u"op"]:
            marca_conta(p[0], p[1])
for it in IT[u"p6"]:
    for q, n in it[u"g"]:
        marca_conta(q, n)
        marca_soma(n, q)
for it in IT[u"p8"] + IT[u"p9"]:
    marca_soma(it[u"n"], it[u"q"])
    leituras.add((it[u"q"], it[u"n"]))
for it in IT[u"p20"]:
    leituras.add((it[u"li"], it[u"co"]))
    leituras.add((it[u"co"], it[u"li"]))

for (n, q) in sorted(somas):
    F[u"soma_%dx%d" % (n, q)] = u", mais ".join([dz(n)] * q) + u"."   # 4, mais 4, mais 4
for (q, n) in sorted(cts):
    F[u"conta_%dx%d" % (q, n)] = u"%s vezes %s." % (dz(q), dz(n))
for (q, n) in sorted(leituras):
    F[u"leitura_%dx%d" % (q, n)] = (u"%s vezes %s é igual a %s."
                               % (dz(q), dz(n), dz(q * n)))

# ---- folha 1: quantos grupos
for it in IT[u"p1"]:
    q, n, w = it[u"q"], it[u"n"], it[u"w"]
    F[u"certo1_%s_%dx%d" % (w, q, n)] = (
        u"Isso! São %s grupos, e em cada um há %s %s."
        % (dz(q), quantas(n, w), PLUR[w] if n > 1 else SING[w]))
    F[u"dica1_%d" % q] = (u"Conte as bandejas, não as figuras. Uma bandeja é um grupo.")

# ---- folha 2: quantos em cada
for it in IT[u"p2"]:
    q, n, w = it[u"q"], it[u"n"], it[u"w"]
    F[u"certo2_%s_%dx%d" % (w, q, n)] = (
        u"Muito bem! Em cada grupo há %s %s, e todos têm o mesmo tanto."
        % (quantas(n, w), PLUR[w] if n > 1 else SING[w]))
    F[u"dica2_%d" % n] = (u"Escolha uma bandeja só e conte o que está dentro dela. "
                          u"As outras têm o mesmo tanto.")

# ---- folha 3: montar a bandeja
for it in IT[u"p3"]:
    q, n = it[u"q"], it[u"n"]
    F[u"certo3_%dx%d" % (q, n)] = (
        u"Pronto! São %s bandejas com %s em cada uma, e isso dá %s no total."
        % (dzf(q), dz(n), dz(q * n)))
    F[u"dica3_%d" % n] = (u"Essa bandeja já está cheia. Cada uma leva %s, nem mais "
                          u"nem menos — é isso que quer dizer mesmo tanto." % dz(n))
    F[u"certo3_%dx%d" % (q, n)] = cap(F[u"certo3_%dx%d" % (q, n)])

# ---- folha 4: a soma da cena
for it in IT[u"p4"]:
    q, n = it[u"q"], it[u"n"]
    F[u"certo4_%dx%d" % (q, n)] = (
        u"Isso! São %s grupos de %s. Então o número %s entra na soma uma vez para "
        u"cada grupo, e o total dá %s." % (dz(q), dz(n), dz(n), dz(q * n)))
    F[u"dica4_%dx%d" % (q, n)] = (
        u"Olhe quantas bandejas há: %s. Então o número %s tem que aparecer %s vezes "
        u"na soma." % (dzf(q), dz(n), dzf(q)))

# ---- folha 5: a conta de vezes
for it in IT[u"p5"]:
    q, n = it[u"q"], it[u"n"]
    F[u"certo5_%dx%d" % (q, n)] = (
        u"Muito bem! Quando são %s grupos de %s, escreve-se %s vezes %s."
        % (dz(q), dz(n), dz(q), dz(n)))
    F[u"dica5_%dx%d" % (q, n)] = (
        u"O primeiro número é quantos grupos há. O segundo é quanto tem em cada um.")

# ---- folha 6: ligar
for it in IT[u"p6"]:
    for q, n in it[u"g"]:
        F[u"certo6_%dx%d" % (q, n)] = (
            u"Isso! O %s repetido %s vezes é o mesmo que %s vezes %s."
            % (dz(n), dzf(q), dz(q), dz(n)))
        F[u"dica6_%dx%d" % (q, n)] = (
            u"Conte quantas parcelas a soma tem: são %s. Esse é o primeiro número da "
            u"conta de vezes." % dzf(q))

# ---- folha 7: como se lê
for (q, n) in sorted(set((it[u"q"], it[u"n"]) for it in IT[u"p7"])):
    F[u"certo7_%dx%d" % (q, n)] = (
        u"Isso! A voz leu %s vezes %s. É assim que se lê o sinal de vezes."
        % (dz(q), dz(n)))
    F[u"dica7_%dx%d" % (q, n)] = (
        u"Toque no alto-falante e escute de novo. O primeiro número que a voz diz é "
        u"o primeiro da conta.")

# ---- folhas 8 e 9: escrever o total
for it in IT[u"p8"] + IT[u"p9"]:
    q, n = it[u"q"], it[u"n"]
    F[u"certo8_%dx%d" % (q, n)] = (
        u"Você escreveu certo! O %s repetido %s vezes dá %s."
        % (dz(n), dzf(q), dz(q * n)))
    F[u"dica8_%dx%d" % (q, n)] = (
        u"Some devagar, um grupo de cada vez, e vá guardando o total na cabeça.")
    F[u"certo9_%dx%d" % (q, n)] = (
        u"Isso! A conta %s vezes %s é igual a %s, o mesmo resultado da soma."
        % (dz(q), dz(n), dz(q * n)))
    F[u"dica9_%dx%d" % (q, n)] = (
        u"É a mesma cena da folha de antes. Se a soma deu um número, a conta de vezes "
        u"dá o mesmo número.")

# ---- folha 10: a tabela
for it in IT[u"p10"]:
    q, n = it[u"q"], it[u"n"]
    F[u"certo10_%dx%d" % (q, n)] = (
        u"A linha ficou pronta: o %s repetido %s vezes, %s vezes %s, total %s."
        % (dz(n), dzf(q), dz(q), dz(n), dz(q * n)))
F[u"dica10_0"] = u"Olhe a conta de vezes da linha: ela diz quantas parcelas a soma tem."
F[u"dica10_1"] = u"Conte quantas parcelas a soma tem. Esse é o primeiro número da conta."
F[u"dica10_2"] = u"Some as parcelas da linha, uma de cada vez, e veja onde você chega."

# ---- folhas 11 a 15: as máquinas
for pote, f in MAQ:
    for it in IT[pote]:
        e = it[u"e"]
        F[u"certomaq_%dx%d" % (f, e)] = (
            u"Certo! A conta %s vezes %s é igual a %s." % (dz(f), dz(e), dz(f * e)))
        F[u"dicamaq_%dx%d" % (f, e)] = (
            u"Se ficar difícil, some: o %s repetido %s vezes." % (dz(f), dzf(e)))

# ---- folhas 16 e 17: contar de tanto em tanto
for pote in (u"p16", u"p17"):
    for it in IT[pote]:
        p, ini = it[u"passo"], it[u"ini"]
        seq = [ini + k * p for k in range(it[u"n"])]
        F[u"certoseq_%d_%d" % (p, ini)] = (
            u"Muito bem! A fila é assim: %s. De %s em %s."
            % (u", ".join(dz(v) for v in seq), dz(p), dz(p)))
        F[u"dicaseq_%d" % p] = (
            u"Comece pelo menor e vá somando %s a cada passo." % dz(p))

# ---- folha 18: o tapete
for it in IT[u"p18"]:
    li, co = it[u"li"], it[u"co"]
    F[u"certo18_%dx%d" % (li, co)] = (
        u"Isso! São %s fileiras com %s em cada uma, ou seja, %s vezes %s, igual a %s."
        % (dzf(li), dz(co), dz(li), dz(co), dz(li * co)))
    F[u"dica18_%dx%d" % (li, co)] = (
        u"Conte primeiro quantas fileiras há, de cima para baixo. Depois conte uma "
        u"fileira só, da esquerda para a direita.")

# ---- folha 19: pintar na malha
for it in IT[u"p19"]:
    li, co = it[u"li"], it[u"co"]
    F[u"certo19_%dx%d" % (li, co)] = (
        u"Que tapete bonito! São %s fileiras de %s, e isso dá %s quadradinhos."
        % (dzf(li), dz(co), dz(li * co)))
    F[u"dica19_%dx%d" % (li, co)] = (
        u"Desça %s fileiras e ande %s quadradinhos para o lado. Toque no quadradinho "
        u"do cantinho de baixo." % (dzf(li), dz(co)))

# ---- folha 20: a virada
for it in IT[u"p20"]:
    li, co = it[u"li"], it[u"co"]
    F[u"certo20_%dx%d" % (li, co)] = (
        u"Você acertou a aposta! Olhe: %s vezes %s e %s vezes %s dão os mesmos %s. "
        u"Girar o tapete não tira nem põe figura nenhuma."
        % (dz(li), dz(co), dz(co), dz(li), dz(li * co)))
F[u"dica20"] = (u"Pense assim: girar o tapete não tira nem põe nenhuma figura. "
                u"Então o total pode mudar?")
F[u"op_mesmo"] = u"Fica o mesmo tanto."
F[u"op_mais"] = u"Fica com mais."
F[u"op_menos"] = u"Fica com menos."

# ---- folha 21: a cesta que falta
for it in IT[u"p21"]:
    a, b = len(it[u"fr"]), len(it[u"dc"])
    F[u"certo21_%dx%d" % (a, b)] = (
        u"Achou! Agora cada fruta está com cada doce: são %s cestas diferentes."
        % dzf(a * b))
F[u"dica21"] = (u"Essa cesta já está pronta. Procure o quadrado que ainda está vazio: "
                u"é a fruta que ainda não encontrou aquele doce.")

# ---- folha 22: quantas cestas
for it in IT[u"p22"]:
    a, b = it[u"a"], it[u"b"]
    F[u"certo22_%dx%d" % (a, b)] = (
        u"Isso! Cada uma das %s frutas pode ir com qualquer um dos %s doces: %s vezes "
        u"%s, igual a %s cestas." % (dzf(a), dz(b), dz(a), dz(b), dzf(a * b)))
    F[u"dica22_%dx%d" % (a, b)] = (
        u"Pense numa fruta só: ela pode ir com %s doces. E há %s frutas."
        % (dz(b), dzf(a)))

# ---- folhas 23 e 24: os problemas
#     ⚠️ A fala do problema é o PRÓPRIO texto da tela, sem nada acrescentado. A
#        voz aqui não resolve nada: ela lê, para a criança que lê devagar não
#        perder o problema por causa da leitura.
for pote, tag in ((u"p23", u"prob23"), (u"p24", u"prob24")):
    for i, it in enumerate(IT[pote]):
        q, n = it[u"q"], it[u"n"]
        F[u"%s_%d_%dx%d" % (tag, i, q, n)] = it[u"t"]
        F[u"certoprob_%dx%d" % (q, n)] = (
            u"Resposta certa! A conta %s vezes %s é igual a %s."
            % (dz(q), dz(n), dz(q * n)))
        F[u"dicaprob_%dx%d" % (q, n)] = (
            u"Procure no problema os dois números: quantos grupos e quanto tem em cada "
            u"um. Depois multiplique os dois.")

# ---- folha 25: o cartaz
for it in IT[u"p25"]:
    q, n = it[u"q"], it[u"n"]
    F[u"certo25_%dx%d" % (q, n)] = (
        u"A conta %s vezes %s, igual a %s, foi para o seu cartaz!"
        % (dz(q), dz(n), dz(q * n)))


# ============================================================
#  GRAVAR
# ============================================================
def chave(s):
    s = re.sub(r"\s+", u" ", s or u"").strip().lower()
    hh = 5381
    for ch in s:
        hh = ((hh * 33) ^ ord(ch)) & 0xFFFFFFFF
    d, out = hh, u""
    if d == 0:
        return u"0"
    while d:
        out = u"0123456789abcdefghijklmnopqrstuvwxyz"[d % 36] + out
        d //= 36
    return out


falas, vistos = [], {}
for k in sorted(F.keys()):
    t = F[k]
    if not t:
        continue
    c = chave(t)
    if c in vistos:
        continue
    vistos[c] = 1
    falas.append({u"id": PREFIXO + c, u"texto": t, u"voz": VOZ})

io.open(os.path.join(AQUI, u"falas.json"), u"w", encoding=u"utf-8").write(
    json.dumps(falas, ensure_ascii=False, indent=1))
io.open(os.path.join(AQUI, u"voz.txt"), u"w", encoding=u"utf-8").write(VOZ + u"\n")

html = io.open(CAM, encoding=u"utf-8").read()
blocoI = (u"/*ITENS-INI*/\nvar ITENS = "
          + json.dumps(IT, ensure_ascii=False, indent=1, sort_keys=True) + u";\n/*ITENS-FIM*/")
blocoF = (u"/*FALAS-INI*/\nvar FALAS = "
          + json.dumps(F, ensure_ascii=False, indent=1, sort_keys=True) + u";\n/*FALAS-FIM*/")
blocoV = (u"/*VOZOK-INI*/var VOZOK = "
          + json.dumps(dict((c, 1) for c in vistos), ensure_ascii=False) + u";/*VOZOK-FIM*/")
novo = re.sub(r"/\*ITENS-INI\*/.*?/\*ITENS-FIM\*/", lambda m: blocoI, html, flags=re.S)
novo = re.sub(r"/\*FALAS-INI\*/.*?/\*FALAS-FIM\*/", lambda m: blocoF, novo, flags=re.S)
novo = re.sub(r"/\*VOZOK-INI\*/.*?/\*VOZOK-FIM\*/", lambda m: blocoV, novo, flags=re.S)
novo = re.sub(r"/\*SILMAP-INI\*/.*?/\*SILMAP-FIM\*/",
              lambda m: u"/*SILMAP-INI*/var SILMAP = {};/*SILMAP-FIM*/", novo, flags=re.S)
io.open(CAM, u"w", encoding=u"utf-8").write(novo)

itens = sum(len(v) for v in IT.values())
print(u"ITENS: %d item(ns) em %d potes; FALAS: %d chaves; falas.json: %d fala(s)"
      % (itens, len(IT), len(F), len(falas)))
