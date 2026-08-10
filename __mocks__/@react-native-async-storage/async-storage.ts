// Minimal in-memory stand-in for @react-native-async-storage/async-storage, used only by the
// pure-logic gameStore test suite (item 67 in GAME_DESIGN.md). The real package is a native
// module with no meaningful behavior to test here — zustand's `persist` middleware only needs
// something that satisfies the getItem/setItem/removeItem contract.
let store: Record<string, string> = {};

export default {
  getItem: async (key: string): Promise<string | null> => (key in store ? store[key] : null),
  setItem: async (key: string, value: string): Promise<void> => {
    store[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete store[key];
  },
  clear: async (): Promise<void> => {
    store = {};
  },
};
