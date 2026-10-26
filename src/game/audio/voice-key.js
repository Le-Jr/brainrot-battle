/** Shared between the offline voice catalog and browser playback. */
export function voiceKey(text, role = 'pt') {
  return (
    role +
    ':' +
    text
      .normalize('NFC')
      .toLowerCase()
      .replace(/[.!?,:;…"“”]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}
