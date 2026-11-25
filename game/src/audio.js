// Dapur Sizzle - audio.js
// Lightweight WebAudio sound effects. No audio files, no network.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    try {
      if (!ctx) {
        const AC =
          typeof window !== "undefined"
            ? window.AudioContext || window.webkitAudioContext
            : typeof AudioContext !== "undefined"
            ? AudioContext
            : null;
        if (!AC) return;
        ctx = new AC();
      }
      if (ctx && ctx.state === "suspended" && typeof ctx.resume === "function") {
        const p = ctx.resume();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    } catch (e) {
      ctx = null;
    }
  }

  function play(freq, dur, type, vol, delay) {
    if (muted || !ctx) return;
    try {
      const t0 = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const volume = typeof vol === "number" ? vol : 0.5;
      const length = typeof dur === "number" && dur > 0 ? dur : 0.1;

      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);

      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(volume, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0);
      osc.stop(t0 + length + 0.02);
      osc.onended = function () {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (e) {
          /* ignore */
        }
      };
    } catch (e) {
      /* never throw */
    }
  }

  function blip(freq, dur, type, vol) {
    play(freq, dur, type, vol, 0);
  }

  function chop() {
    blip(220, 0.08, "square", 0.25);
  }

  function sizzle() {
    blip(880, 0.12, "triangle", 0.2);
  }

  function serve() {
    blip(660, 0.12, "sine", 0.35);
    play(990, 0.18, "sine", 0.35, 0.12);
  }

  function error() {
    blip(140, 0.2, "square", 0.3);
  }

  function tick() {
    blip(1200, 0.05, "sine", 0.12);
  }

  function setMuted(m) {
    muted = !!m;
  }

  function isMuted() {
    return muted;
  }

  const api = {
    muted: false,
    ensure: ensure,
    blip: blip,
    chop: chop,
    sizzle: sizzle,
    serve: serve,
    error: error,
    tick: tick,
    setMuted: function (m) {
      setMuted(m);
      api.muted = muted;
    },
    toggleMuted: function () {
      setMuted(!muted);
      api.muted = muted;
      return muted;
    },
    isMuted: isMuted,
  };

  return api;
}