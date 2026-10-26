/* Ladder encounters: arrival lines, hypnotized/freed dialogue, retorts, rivalries and the boss intro. */
import { PLAYABLE } from '../characters/roster.js';
import { S } from '../state.js';
import { STORY } from './character-arcs.js';
import { PRP, RDT, pnx } from './panels.js';

const ARR = [
  'Spiaggia Tralalà. O mar, antes azul, agora brilha em um roxo estranho...',
  'Piazza Pizzaiola. As luzes da praça piscam no ritmo do algoritmo.',
  'Selva Patapim. As árvores sussurram em uma língua que não é delas.',
  'Deserto Tic-Tac. Os relógios da areia giram ao contrário.',
  'Caffè Assassino. Ninguém pediu café. Mesmo assim, há uma xícara fumegando.',
  'Villaggio Sahur. Os tambores tocam sozinhos no meio da noite.',
  'Cielo Bombardiro. Um ronco de motor corta as nuvens.',
  'Teatro Cappuccina. A plateia está vazia, mas a música não para.',
  'Isola Bananini. Cascas de banana por toda parte. Mau sinal.',
  'Anelli di Saturno.',
  'Strada del Nonno.',
];
const OPP = {
  tralalero: {
    hyp: 'Tra-la-le-ro... o ALGORITMO manda. As ondas agora pertencem a Saturno. Você não passa!',
    free: 'Tralalá... onde eu tô? Uma vaca com anéis roubou minha maré! Leva este fragmento do sinal.',
  },
  tung: {
    hyp: 'Tung. Tung. Tung. O ALGORITMO disse que você está atrasado para o sahur. Atrasado para sempre.',
    free: 'Tung...? Eu batia sem parar e não sabia por quê. Saturno brilhava roxo dentro da minha cabeça.',
  },
  bombardiro: {
    hyp: 'Missione ricevuta: eliminar o intruso. Ordem direta de Saturno. Bombe pronte!',
    free: 'Radares de volta! Rastreei o sinal: ele vem dos anéis de Saturno. Vá até lá, piloto.',
  },
  ballerina: {
    hyp: 'A música do ALGORITMO não para... e eu não consigo parar de dançar. Dance comigo... para sempre.',
    free: 'Obrigada... meus pés finalmente pararam. Ouvi a vaca dizer que cada brainrot guarda um pedaço do sinal.',
  },
  patapim: {
    hyp: 'Brr... brr... a floresta agora é de Saturno. Suas raízes vão secar aqui mesmo.',
    free: 'Brr brr... as árvores voltaram a cantar. Siga as estrelas cadentes. Elas levam até a vaca.',
  },
  chimp: {
    hyp: 'Bananini... bananini... o ALGORITMO quer todas as bananas. Inclusive as suas!',
    free: 'Bananini! Desculpa, eu tava fora de mim. Toma uma banana pra viagem. E um fragmento.',
  },
  assassino: {
    hyp: '... O contrato foi assinado em Saturno. O alvo é você.',
    free: '... Contrato anulado. A cliente era uma vaca. Termine o serviço por mim.',
  },
  lirili: {
    hyp: 'Tic... tac... o ALGORITMO congelou o seu tempo. Você já perdeu e ainda não sabe.',
    free: 'Os ponteiros voltaram ao lugar. Faltam poucos minutos para o fim do algoritmo. Corra.',
  },
};
const RET = {
  tralalero: [
    'Tralalero não foge de briga! Prepara, que lá vem tênis!',
    'Hipnotizado ou não, eu corro mais que você!',
    'Acorda! Vou te trazer de volta com um chute de tubarão!',
  ],
  tung: [
    'Tung. Tung. Tung. Se você não acordar, eu acordo você.',
    'O taco resolve qualquer feitiço.',
    'Hora do sahur. E você vai acordar na marra!',
  ],
  bombardiro: [
    'Alvo travado. Vou te libertar com uma bomba de carinho!',
    'Ninguém controla o céu além de mim!',
    'Decolagem! Prepare-se para o impacto!',
  ],
  ballerina: [
    'Vou girar até esse feitiço sair de você!',
    'Uma pirueta e você volta ao normal. Prometo.',
    'O palco é meu, e a música agora é outra!',
  ],
  patapim: [
    'Brr brr! A terra vai tremer e o feitiço vai cair!',
    'Raízes fortes não se dobram ao algoritmo!',
    'Patapim! Vou te sacudir até você acordar!',
  ],
  chimp: [
    'Bananini! Nada separa um macaco das suas bananas!',
    'Vou te acordar com um bananarangue na testa!',
    'Banana na mão, coragem no coração!',
  ],
  assassino: ['...', '... Silêncio. Só o corte fala.', '... Um golpe. Um despertar.'],
  lirili: [
    'Tic-tac. O seu feitiço tem prazo de validade.',
    'Eu tenho todo o tempo do mundo. Você não.',
    'Vou atrasar o seu algoritmo em mil anos.',
  ],
};
const RIVAL = {
  'ballerina>assassino': 'Você de novo, Assassino?! Desta vez nem o algoritmo vai te proteger de mim!',
  'assassino>ballerina': '... Ballerina. Me perdoe. Mais uma vez.',
  'tralalero>bombardiro': 'Bombardiro, você já foi meu parceiro de céu e mar! Volta pra gente!',
  'chimp>tung': 'Tung, sou eu, o Bananini! A gente dividia banana no sahur, lembra?!',
};
function preFight(me, opp, li) {
  const s = opp.stage,
    mine =
      RIVAL[me.id + '>' + opp.id] ||
      (RET[me.id] || [
        'Bri Bri! Ninguém vai controlar você!',
        'Meu escudo vai romper esse sinal!',
        'Vamos lutar pela sua liberdade!',
      ])[li % 3];
  return [
    pnx([s, PRP, 100], [['O', 'idle', 200, 150, -1, 2, 0, 1]], ARR[s], null, 'zoom'),
    pnx([s, PRP, 100], [['O', 'win', 200, 150, -1, 2, 0, 1]], OPP[opp.id].hyp, 'O', 'glitch'),
    pnx(
      [s, null, 100],
      [
        ['P', 'idle', 96, 150, 1, 2],
        ['O', 'idle', 230, 150, -1, 2, 0, 1],
      ],
      mine,
      'P',
    ),
  ];
}
function freedScene(me, opp, n) {
  const s = opp.stage;
  return [
    pnx(
      [s, null, 100],
      [
        ['O', 'hit', 210, 150, -1, 2],
        ['P', 'idle', 96, 150, 1, 2],
      ],
      OPP[opp.id].free,
      'O',
    ),
    pnx(
      [s, PRP, 100],
      [['P', 'win', 160, 150, 1, 2]],
      'Fragmento do Algoritmo recuperado: ' + n + ' de 7. O sinal de Saturno ficou mais fraco.',
      null,
      'flash',
    ),
  ];
}
function bossIntro() {
  const id = PLAYABLE[S.p1].id;
  const a = [
    pnx(
      [9, 'rgba(0,0,0,.5)', 80],
      [],
      'Anelli di Saturno. O sinal nasce aqui. O ar vibra num zumbido roxo, grave, interminável...',
      null,
      'zoom',
    ),
    pnx(
      [9, null, 80],
      [['B', 'idle', 190, 150, -1, 2]],
      'Muuu... Então você libertou meus sete brinquedos. Eu sou LA VACCA SATURNO SATURNITA, dona do ALGORITMO!',
      'B',
      'flash',
    ),
    pnx(
      [9, RDT, 80],
      [['B', 'win', 190, 156, -1, 2.4]],
      'Sem o sinal, os memes envelhecem. Comigo, eles viralizam PARA SEMPRE! Ajoelhe-se diante da tendência eterna!',
      'B',
      'shake',
    ),
    pnx(
      [9, null, 80],
      [
        ['P', 'special', 110, 150, 1, 2],
        ['B', 'idle', 236, 150, -1, 2],
      ],
      STORY[id].retort,
      'P',
    ),
  ];
  a.music = 'boss';
  return a;
}

export { bossIntro, freedScene, preFight };
