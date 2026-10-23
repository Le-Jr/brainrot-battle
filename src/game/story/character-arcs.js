/* Per-character story: 3-panel prologue, 3-panel ending and the retort to the boss. */
import { DK, pn, solo, vsBoss } from './panels.js';

const STORY = {
  tralalero: {
    retort: 'Vaca espacial, devolve a minha maré! Os meus tênis chutam até planetas!',
    pro: [
      pn(
        [0, null, 90],
        solo('idle'),
        'Na praia de Tralalero, as ondas cantavam tralalá todos os dias. Até que, numa manhã, o mar simplesmente... parou.',
      ),
      pn(
        [0, DK, 90],
        solo('hit'),
        'Sem ondas, sem tralalá. Um bilhete caiu do céu: "O Torneio Furioso decidirá o dono da maré. Ass: S."',
      ),
      pn(
        [0, null, 150],
        solo('special'),
        '"Ninguém rouba o meu mar!" Tralalero amarrou os tênis dos três pés. Tralalero, tralalá... e partiu correndo!',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'Com um último chute, Saturnita saiu rodando pelos anéis. Na Terra, a maré voltou a subir.',
      ),
      pn(
        [0, null, 90],
        solo('win'),
        'De volta à praia, as ondas cantaram mais alto do que nunca. Tralalá, tralalá!',
      ),
      pn(
        [0, null, 40],
        [
          ['P', 'idle', 110, 128, 1, 2],
          ['chimp', 'idle', 222, 128, -1, 1],
          ['tung', 'idle', 262, 128, -1, 1],
        ],
        'Tralalero abriu a primeira escola de surfe para tubarões de tênis. As aulas lotaram no primeiro dia.',
      ),
    ],
  },
  tung: {
    retort: 'Tung. Tung. Tung. Se você não responder até o terceiro, eu entro.',
    pro: [
      pn(
        [5, null, 80],
        solo('idle'),
        'Toda madrugada, Tung Tung Tung Sahur bate o taco para acordar a aldeia para o sahur. Tung, tung, tung!',
      ),
      pn(
        [5, DK, 80],
        solo('hit'),
        'Mas nesta noite ninguém acordou. Nem com nove tungs. Um sono cósmico tinha caído sobre o mundo inteiro.',
      ),
      pn(
        [5, null, 140],
        solo('special'),
        '"Se o mundo não acorda, eu vou até quem o fez dormir." Ele apertou o taco e sumiu na escuridão.',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'O último TUNG ecoou pelos anéis. Saturnita acordou do próprio feitiço e fugiu para a Via Láctea.',
      ),
      pn(
        [5, null, 80],
        solo('win'),
        'Na Terra, bilhões de pessoas acordaram ao mesmo tempo, famintas. O sahur nunca foi tão animado.',
      ),
      pn(
        [5, null, 150],
        solo('idle'),
        'Tung foi nomeado Despertador Oficial do Universo. Ele aceitou com um aceno. E com o taco.',
      ),
    ],
  },
  bombardiro: {
    retort: 'Vaca orbital, eu já bombardeei coisas maiores. Prepare o pouso de emergência!',
    pro: [
      pn(
        [6, null, 80],
        solo('idle'),
        'Bombardiro Crocodilo era o piloto mais temido dos céus da Itália. Talvez temido demais.',
      ),
      pn(
        [6, DK, 80],
        solo('hit'),
        'A força aérea o afastou por "barulho excessivo". Ele passou meses voando sozinho, sem missão.',
      ),
      pn(
        [6, null, 140],
        solo('special'),
        '"Um convite de Saturno? Decolagem autorizada!" Ele sorriu com todos os dentes e ligou os motores.',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'A bomba final acertou em cheio. Saturnita perdeu o controle do algoritmo e caiu em órbita baixa.',
      ),
      pn(
        [1, null, 80],
        solo('win'),
        'Na volta, Bombardiro cruzou a Itália soltando fumaça verde, branca e vermelha. Todo mundo aplaudiu.',
      ),
      pn(
        [6, null, 80],
        solo('idle'),
        'Recebeu uma medalha de ouro e virou líder da esquadrilha. Agora o barulho é oficial.',
      ),
    ],
  },
  ballerina: {
    retort: 'Você apagou o meu palco. Agora vai assistir de perto à minha pirueta final!',
    pro: [
      pn(
        [7, null, 80],
        solo('idle'),
        'Ballerina Cappuccina ensaiou um ano inteiro para o grande recital no Teatro. Faltava só uma noite.',
      ),
      pn(
        [7, 'rgba(0,0,0,.66)', 80],
        solo('hit'),
        'Mas as luzes do palco se apagaram sozinhas. No escuro, ecoou uma risada distante: "Muuu..."',
      ),
      pn(
        [7, null, 80],
        solo('special'),
        '"Sem luz, sem dança? Então eu danço até as estrelas!" Ela calçou as sapatilhas e girou porta afora.',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'Rodopiando entre os anéis, Ballerina derrubou a vaca. As estrelas se acenderam como holofotes.',
      ),
      pn(
        [7, null, 80],
        solo('win'),
        'Na noite seguinte, o recital aconteceu sob um céu cheio de estrelas. A plateia aplaudiu de pé.',
      ),
      pn(
        [7, null, 80],
        [
          ['P', 'idle', 110, 128, 1, 2],
          ['assassino', 'idle', 240, 128, -1, 1],
        ],
        'Na última fila, um certo Cappuccino Assassino enxugava uma lágrima. Ele jura que era só vapor.',
      ),
    ],
  },
  patapim: {
    retort: 'Brr brr! Até em Saturno as raízes chegam. Prepare-se para o terremoto!',
    pro: [
      pn(
        [2, null, 80],
        solo('idle'),
        'Na floresta, Brr Brr Patapim cuida de cada folha com seus pés enormes. Brr brr, patapim!',
      ),
      pn(
        [2, DK, 80],
        solo('hit'),
        'Mas as folhas começaram a cair fora de época. Um inverno cósmico estava secando a floresta.',
      ),
      pn(
        [2, null, 140],
        solo('special'),
        '"A floresta vai comigo!" Patapim bateu os pés no chão três vezes, e a terra inteira tremeu.',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'O tremor final rachou o chão de Saturno. Do buraco, nasceu um brotinho verde.',
      ),
      pn(
        [2, null, 80],
        solo('win'),
        'Na Terra, a floresta voltou mais verde do que nunca. Os pássaros fizeram uma festa.',
      ),
      pn(
        [2, null, 150],
        solo('idle'),
        'Patapim plantou uma árvore em cada planeta. Dizem que em Saturno já tem sombra.',
      ),
    ],
  },
  chimp: {
    retort: 'Você comeu TODAS as bananas?! Prepare-se para o bananarangue da vingança!',
    pro: [
      pn(
        [8, null, 80],
        solo('idle'),
        'Chimpanzini Bananini vive dentro de uma banana. Literalmente. E a vida era doce.',
      ),
      pn(
        [8, DK, 80],
        solo('hit'),
        'Até que todas as bananas do mundo sumiram em uma noite. Inclusive as de reserva.',
      ),
      pn(
        [8, null, 140],
        solo('special'),
        'Uma casca caiu do céu com um bilhete: "Lanche delicioso. Ass: S." "Isso é guerra!", gritou Chimpanzini.',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'O bananarangue voltou trazendo uma montanha de bananas. A vaca ficou sem lanche e sem algoritmo.',
      ),
      pn(
        [8, null, 80],
        solo('win'),
        'As bananas voltaram aos cachos do mundo todo. Chimpanzini chorou de alegria. E comeu duas.',
      ),
      pn(
        [8, null, 150],
        solo('idle'),
        'Ele abriu a Bananini Express: bananas entregues em dez minutos, em qualquer planeta.',
      ),
    ],
  },
  assassino: {
    retort: '... O contrato é com você.',
    pro: [
      pn(
        [4, null, 80],
        solo('idle'),
        'Cappuccino Assassino não fala. Ele toma espresso, afia as katanas e espera o próximo contrato.',
      ),
      pn(
        [4, DK, 80],
        solo('idle'),
        'O envelope chegou sem nome. Só uma frase: "Elimine quem está por trás do Torneio Furioso."',
      ),
      pn(
        [4, null, 140],
        solo('special'),
        'Ele terminou o café em um gole e deixou uma moeda no balcão. Quando o barista olhou, ele já tinha sumido.',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'Um corte. Silêncio. A vaca caiu antes mesmo de entender de onde veio o golpe.',
      ),
      pn(
        [9, DK, 80],
        solo('idle'),
        'Saturnita ofereceu o Desejo Cósmico. Ele recusou com um gesto. Contrato cumprido, e só.',
      ),
      pn(
        [4, null, 80],
        solo('idle'),
        'De volta ao caffè, outro espresso. Sob a xícara, um novo envelope. Desta vez, com um nome.',
      ),
    ],
  },
  lirili: {
    retort: 'Tic-tac, vaca. O seu tempo acabou antes mesmo de começar.',
    pro: [
      pn(
        [3, null, 80],
        solo('idle'),
        'Lirilì Larilà caminha pelo deserto com seu relógio. Ele sempre sabe que horas são. Sempre.',
      ),
      pn(
        [3, DK, 80],
        solo('hit'),
        'Até que os ponteiros começaram a girar ao contrário. Alguém queria parar o tempo para sempre.',
      ),
      pn(
        [3, null, 140],
        solo('special'),
        '"O tempo é meu. Ninguém atrasa o universo sem falar comigo." Ele ajustou as sandálias e partiu.',
        'P',
      ),
    ],
    end: [
      pn(
        [9, null, 80],
        vsBoss,
        'Com o tempo congelado, Lirilì deu o golpe final. Os ponteiros do universo voltaram a andar.',
      ),
      pn(
        [3, null, 80],
        solo('win'),
        'O sol nasceu na hora certa pela primeira vez em semanas. O deserto inteiro suspirou aliviado.',
      ),
      pn(
        [3, null, 150],
        solo('idle'),
        'Havia uma festa em sua homenagem às oito. Ele chegou às oito e quinze. Ninguém teve coragem de reclamar.',
      ),
    ],
  },
};

export { STORY };
