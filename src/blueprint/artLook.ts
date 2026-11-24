/**
 * Which look Art mode shows: the painted art (default, where it exists) or the code-drawn placeholders,
 * so each new painting can be judged in place against what it replaces. Add ?look=code to the web URL
 * to start on the code look, or flip it in the Art inspector.
 */
import { useEffect, useState } from 'react';

let showCode =
  typeof window !== 'undefined' && typeof window.location !== 'undefined' && /[?&]look=code/.test(window.location.search ?? '');
const subs = new Set<(v: boolean) => void>();

export function artShowsCode() {
  return showCode;
}

export function setArtShowsCode(v: boolean) {
  showCode = v;
  subs.forEach((f) => f(v));
}

export function useArtShowsCode() {
  const [v, setV] = useState(showCode);
  useEffect(() => {
    subs.add(setV);
    return () => {
      subs.delete(setV);
    };
  }, []);
  return v;
}
