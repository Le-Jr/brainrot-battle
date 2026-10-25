/* Engine entry point. The React shell calls createGame() once the <canvas> is mounted. */
import { AU } from './audio/synth.js';
import { VO } from './audio/voice.js';
import { FONT, setFont } from './config.js';
import { ctx, initCanvas } from './core/canvas.js';
import { attachKeyboard, pressVirtual, pressedQ, releaseVirtual } from './core/input.js';
import { go, scene, startLoop, stopLoop } from './core/scene.js';
import { on } from './events.js';
import { XP } from './progression/xp.js';
import { Intro } from './scenes/intro.js';
import { Title } from './scenes/title.js';
import { loadHD } from './sprites/hd.js';
import { loadProjectileArt } from './sprites/projectile-art.js';
import { loadBonusArt } from './sprites/bonus-art.js';
import { artImage, loadStageArt } from './stages/art.js';
import { useMapArt } from './world/map.js';
import { buildStages } from './stages/index.js';
import { SET } from './state.js';
import { buildLogo } from './ui/logo.js';

let booting = null;
/**
 * One-time boot: web font, atlases, saved XP, narrator voices and the logo.
 * With the intro, the Tupinicode loading screen is up right away and paints the 13 stages one per frame;
 * without it (tests, tools) the stages are painted at once and the game starts on the title screen.
 */
function boot(assetBase, intro, stageBase) {
  if (booting) return booting;
  if (intro) go(Intro);
  const fontReady =
    document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load('8px ' + FONT), new Promise((r) => setTimeout(r, 2500))])
      : Promise.resolve();
  booting = Promise.all([
    fontReady.catch(() => {}),
    loadHD(assetBase),
    loadProjectileArt(assetBase),
    loadBonusArt(assetBase),
    loadStageArt(stageBase),
  ]).then(() => {
    const map = artImage('map', 'map');
    if (map) useMapArt(map);
    XP.load();
    VO.init();
    buildLogo();
    if (intro) Intro.assetsReady = true;
    else {
      buildStages();
      go(Title);
    }
  });
  return booting;
}

/**
 * Bind the engine to a 640x360 canvas and start it.
 * Returns a handle right away; `ready` resolves when the font and atlases are loaded (and, without the intro,
 * once the title screen is up).
 * The engine is a singleton: calling destroy() and createGame() again (React StrictMode, remounts) resumes the same run.
 */
function createGame({
  canvas,
  fontFamily,
  assetBase = '/atlases',
  stageBase = '/stages',
  autoStart = true,
  keyboardTarget = window,
  intro = true,
}) {
  initCanvas(canvas);
  if (fontFamily) setFont(fontFamily);
  ctx.fillStyle = '#0c0814';
  ctx.fillRect(0, 0, 640, 360);
  const detachKeyboard = keyboardTarget ? attachKeyboard(keyboardTarget) : () => {};
  const onPointer = () => {
    AU.init();
    if (canvas.focus) canvas.focus();
    if (scene && scene.tapStart) pressedQ.add('T_start');
  };
  if (canvas.addEventListener) canvas.addEventListener('pointerdown', onPointer);
  let alive = true;
  const ready = boot(assetBase, intro, stageBase).then(() => {
    if (alive && autoStart) startLoop();
  });
  // the intro animates its own loading screen, so the loop starts before the assets arrive
  if (intro && autoStart) startLoop();
  return {
    ready,
    destroy() {
      alive = false;
      stopLoop();
      detachKeyboard();
      if (canvas.removeEventListener) canvas.removeEventListener('pointerdown', onPointer);
      VO.stop();
    },
    setMusic(enabled) {
      AU.music = enabled;
      AU.init();
      if (AU.mg) AU.mg.gain.value = enabled ? SET.music : 0;
    },
    setNarrator(enabled) {
      VO.on = enabled;
      if (!enabled) VO.stop();
    },
    pressButton: pressVirtual,
    releaseButton: releaseVirtual,
    on,
  };
}

export { createGame };
