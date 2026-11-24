/**
 * Ambient sound helpers (expo-audio): looping beds whose volume follows the scene, and footsteps
 * that tick while Scally walks. Sounds are procedural (tools/audio/make_ambience.py).
 * Browsers only allow audio after the first tap, so loops simply start once that happens.
 */
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AudioSource, useAudioPlayer } from 'expo-audio';

// Browsers reject play() before the first user gesture (as an unhandled promise expo-audio doesn't
// surface), so on web nothing plays until a tap/drag/key has happened.
let unlocked = Platform.OS !== 'web';
if (!unlocked && typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true;
    ['pointerdown', 'touchstart', 'keydown'].forEach((e) => window.removeEventListener(e, unlock, true));
  };
  ['pointerdown', 'touchstart', 'keydown'].forEach((e) => window.addEventListener(e, unlock, true));
}
export const audioUnlocked = () => unlocked;

export const SFX = {
  stepWood: [require('../../assets/sfx/step_wood_0.wav'), require('../../assets/sfx/step_wood_1.wav')],
  stepCobble: [require('../../assets/sfx/step_cobble_0.wav'), require('../../assets/sfx/step_cobble_1.wav')],
  stepSoft: [require('../../assets/sfx/step_soft_0.wav'), require('../../assets/sfx/step_soft_1.wav')],
  fire: require('../../assets/sfx/fire_loop.wav'),
  harbour: require('../../assets/sfx/harbour_loop.wav'),
  murmur: require('../../assets/sfx/tavern_murmur.wav'),
  gull: require('../../assets/sfx/gull.wav'),
  sea: require('../../assets/sfx/sea_loop.wav'),
  creak: [require('../../assets/sfx/creak_0.wav'), require('../../assets/sfx/creak_1.wav'), require('../../assets/sfx/creak_2.wav')],
  flap: require('../../assets/sfx/canvas_flap.wav'),
};

/** A looping bed at `volume` (0..1); paused when silent. Volume is quantised to avoid churn. */
export function useAmbientLoop(source: AudioSource, volume: number) {
  const player = useAudioPlayer(source);
  const v = Math.round(Math.max(0, Math.min(1, volume)) * 20) / 20;
  useEffect(() => {
    player.loop = true;
  }, [player]);
  useEffect(() => {
    const apply = () => {
      try {
        player.volume = v;
        if (v > 0 && !player.playing && unlocked) player.play();
        else if (v === 0 && player.playing) player.pause();
      } catch {
        // not loaded yet — the retry below picks it up
      }
    };
    apply();
    // Retry until it's actually playing (first tap on web, or the file still loading).
    const id = v > 0 ? setInterval(() => !player.playing && apply(), 1000) : undefined;
    return () => id && clearInterval(id);
  }, [player, v]);
}

/** Footsteps every `stepMs` while `moving`, alternating two takes so they don't sound stamped. */
export function useFootsteps(moving: boolean, surface: 'wood' | 'cobble' | 'soft', stepMs = 300, volume = 0.5) {
  const wood0 = useAudioPlayer(SFX.stepWood[0]);
  const wood1 = useAudioPlayer(SFX.stepWood[1]);
  const cob0 = useAudioPlayer(SFX.stepCobble[0]);
  const cob1 = useAudioPlayer(SFX.stepCobble[1]);
  const soft0 = useAudioPlayer(SFX.stepSoft[0]);
  const soft1 = useAudioPlayer(SFX.stepSoft[1]);
  const surfaceRef = useRef(surface);
  surfaceRef.current = surface;
  useEffect(() => {
    if (!moving) return;
    let n = 0;
    const id = setInterval(() => {
      const pair = surfaceRef.current === 'wood' ? [wood0, wood1] : surfaceRef.current === 'soft' ? [soft0, soft1] : [cob0, cob1];
      const p = pair[n++ % 2];
      if (!unlocked) return;
      try {
        p.volume = volume * (0.85 + Math.random() * 0.3);
        p.seekTo(0);
        p.play();
      } catch {
        // ignore — audio not unlocked yet
      }
    }, stepMs);
    return () => clearInterval(id);
  }, [moving, stepMs, volume, wood0, wood1, cob0, cob1, soft0, soft1]);
}

/** A one-shot that fires every `minS..maxS` seconds while `active` (gull cries). */
export function useRandomCalls(source: AudioSource, active: boolean, minS: number, maxS: number, volume = 0.4) {
  const player = useAudioPlayer(source);
  useEffect(() => {
    if (!active) return;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        if (unlocked) try {
          player.volume = volume * (0.6 + Math.random() * 0.4);
          player.seekTo(0);
          player.play();
        } catch {
          // ignore
        }
        next();
      }, (minS + Math.random() * (maxS - minS)) * 1000);
    };
    next();
    return () => clearTimeout(t);
  }, [active, player, minS, maxS, volume]);
}

/** A one-shot you fire yourself (e.g. a sail flap on a hard turn): returns play(volume). */
export function useOneShot(source: AudioSource) {
  const player = useAudioPlayer(source);
  return (volume = 0.5) => {
    if (!unlocked) return;
    try {
      player.volume = volume;
      player.seekTo(0);
      player.play();
    } catch {
      // not loaded yet
    }
  };
}
