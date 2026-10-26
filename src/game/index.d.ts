/** Virtual buttons fed by the touch pad. */
export type VirtualButton = 'T_left' | 'T_right' | 'T_up' | 'T_down' | 'T_p' | 'T_k' | 'T_s' | 'T_start';

export interface GameEvents {
  /** Narrator switched on/off from the in-game OPÇÕES screen. */
  voice: boolean;
}

export interface CreateGameOptions {
  /** The 640x360 backbuffer canvas. */
  canvas: HTMLCanvasElement;
  /** CSS font-family of the pixel font (the self-hosted next/font family). */
  fontFamily?: string;
  /** URL folder holding the character atlases. Defaults to "/atlases". */
  assetBase?: string;
  /** URL folder holding the stage art layers (public/stages). Defaults to "/stages". */
  stageBase?: string;
  /** Start the requestAnimationFrame loop once assets are loaded. Defaults to true. */
  autoStart?: boolean;
  /** Where keyboard listeners are attached. Defaults to window; null disables them. */
  keyboardTarget?: EventTarget | null;
  /** Play the Tupinicode loading screen and studio intro before the title. Defaults to true. */
  intro?: boolean;
}

export interface GameHandle {
  /** Resolves when the font and atlases are loaded (and, with `intro: false`, the title screen is up). */
  ready: Promise<void>;
  /** Stops the loop and removes listeners. The run state is kept for the next createGame(). */
  destroy(): void;
  setMusic(on: boolean): void;
  setNarrator(on: boolean): void;
  /** Local loopback only: opens/closes the F2 test cabinet after ready. */
  openTests(): void;
  readonly localTestsAvailable: boolean;
  pressButton(code: VirtualButton): void;
  releaseButton(code: VirtualButton): void;
  on<K extends keyof GameEvents>(type: K, fn: (payload: GameEvents[K]) => void): () => void;
}

export function createGame(options: CreateGameOptions): GameHandle;
