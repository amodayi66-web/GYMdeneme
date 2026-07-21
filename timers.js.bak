// ============================================================================
// Timer Module — Workout duration timer + rest timer with beep
// Uses WakeLock API to keep screen on and Date.now() for accurate elapsed time
// ============================================================================
const GymTimers = (() => {
  'use strict';

  // ── Wake Lock ──────────────────────────────────────────────────────────
  let wakeLock = null;

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
        });
      }
    } catch (e) {
      // Wake lock not supported or denied — silently fall back
    }
  }

  async function releaseWakeLock() {
    if (wakeLock) {
      try {
        await wakeLock.release();
      } catch (e) { /* ignore */ }
      wakeLock = null;
    }
  }

  // ── Audio Context for beep ─────────────────────────────────────────────
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playBeep(frequency = 880, duration = 200) {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // Audio not available, fallback silently
    }
  }

  function playCountdownBeep() {
    playBeep(660, 150);
  }

  function playGoBeep() {
    playBeep(1320, 400);
  }

  // ── Workout Duration Timer ─────────────────────────────────────────────
  function createWorkoutTimer(onTick) {
    let startTime = null;
    let interval = null;
    let elapsed = 0;

    function start() {
      if (interval) return;
      startTime = Date.now() - elapsed;
      // Request wake lock to keep screen on
      requestWakeLock();
      interval = setInterval(() => {
        elapsed = Date.now() - startTime;
        if (onTick) onTick(formatDuration(elapsed));
      }, 1000);
    }

    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      releaseWakeLock();
      return elapsed;
    }

    function reset() {
      stop();
      elapsed = 0;
      if (onTick) onTick('00:00');
    }

    function getElapsed() {
      return elapsed;
    }

    function getFormatted() {
      return formatDuration(elapsed);
    }

    return { start, stop, reset, getElapsed, getFormatted };
  }

  function formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  // ── Rest Timer ─────────────────────────────────────────────────────────
  function createRestTimer(onTick, onComplete) {
    let duration = 90; // default 90 seconds
    let remaining = 0;
    let interval = null;
    let isRunning = false;
    let isCountdown = false;
    let countdownInterval = null;
    let restStartTime = null;

    function setDuration(sec) {
      duration = sec;
    }

    function start() {
      if (isRunning) return;
      remaining = duration;
      isRunning = true;
      isCountdown = false;
      restStartTime = Date.now();
      // Request wake lock to keep screen on during rest
      requestWakeLock();
      tick();
      interval = setInterval(() => {
        // Calculate remaining based on real elapsed time, not just decrementing
        const realElapsed = Math.floor((Date.now() - restStartTime) / 1000);
        remaining = Math.max(0, duration - realElapsed);
        tick();
        if (remaining <= 0) {
          stop();
          startCountdown();
        }
      }, 1000);
    }

    function tick() {
      if (onTick) onTick(formatDuration(remaining * 1000), remaining);
    }

    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      isRunning = false;
      releaseWakeLock();
    }

    function startCountdown() {
      isCountdown = true;
      let count = 3;
      playCountdownBeep();
      if (onTick) onTick('3!', 3);
      
      countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          playCountdownBeep();
          if (onTick) onTick(`${count}!`, count);
        } else if (count === 0) {
          playGoBeep();
          if (onTick) onTick('GO!', 0);
          clearInterval(countdownInterval);
          countdownInterval = null;
          isCountdown = false;
          if (onComplete) onComplete();
        }
      }, 1000);
    }

    function reset() {
      stop();
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      remaining = 0;
      isRunning = false;
      isCountdown = false;
      if (onTick) onTick(formatDuration(duration * 1000), duration);
    }

    function getRemaining() {
      return remaining;
    }

    function isActive() {
      return isRunning || isCountdown;
    }

    return { setDuration, start, stop, reset, getRemaining, isActive };
  }

  return {
    createWorkoutTimer,
    createRestTimer,
    formatDuration,
    playBeep,
    playGoBeep
  };
})();