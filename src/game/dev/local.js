/** Loopback only, including a production build served locally. No query parameter bypass. */
export const isLocalHost = (hostname) => ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
