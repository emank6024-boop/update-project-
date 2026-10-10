/**
 * Telemetry Client for PakLingo AI
 */

export const Telemetry = {
  syncUser: (user: { id: string; name: string; email: string; provider: string }) => {
    try {
      // In-browser telemetry / sync hook
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('paklingo:user-sync', { detail: user }));
      }
    } catch {
      // ignore
    }
  },

  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('paklingo:track-event', { detail: { eventName, properties } }));
      }
    } catch {
      // ignore
    }
  },
};
