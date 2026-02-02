
export const haptics = {
  // Gentle pulse for typing
  type: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch {
        // Ignore vibration errors
      }
    }
  },

  // Heartbeat for emotional moments
  heartbeat: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([100, 50, 100, 50, 100]); } catch {
        // Ignore vibration errors
      } // lub-dub-lub-dub-lub
    }
  },

  // Rising intensity for transformation
  transformation: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([50, 30, 100, 30, 150, 30, 200, 30, 250]); } catch {
        // Ignore vibration errors
      }
    }
  },

  // Long release for final letting go
  release: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([500, 100, 300, 100, 100]); } catch {
        // Ignore vibration errors
      } // Fading away
    }
  },

  // Completion celebration
  complete: () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([50, 50, 50, 50, 200]); } catch {
        // Ignore vibration errors
      } // Ta-ta-ta-ta-DONE
    }
  }
};
