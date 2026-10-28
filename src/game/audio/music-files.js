/** Rendered locally by npm run music:render. Keep synth fallback for every cue. */
import { IMPORTED_MUSIC } from './imported-music.js';
const IDS = [
  'beach',
  'piazza',
  'jungle',
  'desert',
  'cafe',
  'sahur',
  'march',
  'waltz',
  'banana',
  'boss',
  'bonus',
  'cyber',
  'byd',
  'ascension',
  'laststand',
];
export const MUSIC_FILES = {
  ...Object.fromEntries(IDS.map((id) => [id, `/audio/music/${id}.ogg`])),
  ...Object.fromEntries(Object.entries(IMPORTED_MUSIC).map(([id, track]) => [id, track.url])),
};
