/* Arcade announcer lines ("Round one!", "K.O.!", combo calls) with crowd and air-horn stingers. */
import { pick } from '../core/math.js';
import { AU } from './synth.js';
import { ANN, VO } from './voice.js';

const HYPE = {
  round: ['Round one! Get ready!', 'Round two! Here we go!'],
  final: ['Final round! Everything on the line!', 'Final round! Show me what you got!'],
  fight: ['Fight!', 'Fight!', "Let's go!"],
  ko: ['K.O.!', 'Knockout!', 'Down goes the brainrot!'],
  perfect: ['Perfect!', 'Flawless!'],
  combo3: ['Combo!', 'Nice combo!'],
  combo5: ['Super combo!', 'Incredible!'],
  combo7: ['Ultra combo!', 'Unbelievable!'],
  time: ['Time over!'],
  win: ['You win!', 'What a fight!'],
  challenger: ['Here comes a new challenger!'],
  ex: ['E X!'],
};
function hype(k, q) {
  AU.sfx(k === 'fight' ? 'horn' : 'crowd');
  (q ? VO.queue : VO.say).call(VO, pick(HYPE[k]), ANN);
}

export { HYPE, hype };
