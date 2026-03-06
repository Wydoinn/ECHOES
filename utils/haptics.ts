const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* unsupported */ }
  }
};

export const haptics = {
  type: () => vibrate(10),
  heartbeat: () => vibrate([100, 50, 100, 50, 100]),
  transformation: () => vibrate([50, 30, 100, 30, 150, 30, 200, 30, 250]),
  release: () => vibrate([500, 100, 300, 100, 100]),
  complete: () => vibrate([50, 50, 50, 50, 200]),
};
