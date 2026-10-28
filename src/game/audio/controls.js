/** Shared by Options and the fight's audio submenu. */
import { AU } from './synth.js';
import { VO } from './voice.js';
import { AUDIO_CHANNELS, audioPercent, changeAudioLevel } from './settings.js';
export const audioItems = () => AUDIO_CHANNELS.map(({ key, label }) => [label, audioPercent(key)]);
export function adjustAudio(index, direction) {
  const channel = AUDIO_CHANNELS[index];
  if (!channel) return;
  changeAudioLevel(channel.key, direction);
  AU.applyLevels();
  VO.applyVolume();
  if (channel.key === 'effects') AU.sfx('blip');
}
