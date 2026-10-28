import { SET } from '../state.js';

export const AUDIO_CHANNELS = [
  { key: 'music', label: 'MÚSICA', max: 0.42, default: 0.3 },
  { key: 'effects', label: 'EFEITOS', max: 0.6, default: 0.6 },
  { key: 'voice', label: 'VOZES', max: 1, default: 0.85 },
];
export function loadAudioSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('brb_audio') || '{}');
    for (const channel of AUDIO_CHANNELS)
      if (typeof saved[channel.key] === 'number' && Number.isFinite(saved[channel.key]))
        SET[channel.key] = Math.max(0, Math.min(channel.max, saved[channel.key]));
  } catch {}
}
export function saveAudioSettings() {
  try {
    localStorage.setItem(
      'brb_audio',
      JSON.stringify(Object.fromEntries(AUDIO_CHANNELS.map(({ key }) => [key, SET[key]]))),
    );
  } catch {}
}
export function audioPercent(key) {
  const channel = AUDIO_CHANNELS.find((c) => c.key === key);
  return Math.round((100 * SET[key]) / channel.max) + '%';
}
export function changeAudioLevel(key, direction) {
  const channel = AUDIO_CHANNELS.find((c) => c.key === key);
  SET[key] = Math.max(
    0,
    Math.min(channel.max, (Math.round((SET[key] / channel.max + direction * 0.1) * 10) / 10) * channel.max),
  );
  saveAudioSettings();
  return SET[key];
}
