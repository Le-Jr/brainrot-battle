/** Tiny event bus between the engine and the page (React shell). Events: 'voice' (narrator on/off changed in OPÇÕES). */
const handlers = new Map();
function on(type, fn) {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type).add(fn);
  return () => handlers.get(type).delete(fn);
}
function emit(type, payload) {
  const set = handlers.get(type);
  if (set) for (const fn of set) fn(payload);
}

export { emit, on };
