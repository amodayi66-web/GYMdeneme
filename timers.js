// ============================================================================
// Timer Module — Workout duration timer + rest timer with beep
// Uses WakeLock API to keep screen on and Date.now() for accurate elapsed time
// ============================================================================
const GymTimers = (() => {
  'use strict';

  let wakeLock = null;

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) { /* silent fallback */ }
  }

  async function releaseWakeLock() {
    if (wakeLock) {
      try { await wakeLock.release(); } catch (e) { /* ignore */ }
      wakeLock = null;
    }
  }

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function playBeep(frequency = 880, duration = 200) {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  }
  function playCountdownBeep() { playBeep(660, 150); }
  function playGoBeep() { playBeep(1320, 400); }

  // ── Workout Duration Timer ─────────────────────────────────────────────
  // Guards against duplicate intervals via a module-level singleton pattern.
  // Each call to createWorkoutTimer first clears the previous timer if any.
  let _workoutTimerInstance = null; // singleton guard

  function createWorkoutTimer(onTick) {
    // If there's an existing instance, clear it first
    if (_workoutTimerInstance) {
      _workoutTimerInstance.stop();
      _workoutTimerInstance = null;
    }

    let startTime = null;
    let interval = null;

    function start() {
      if (startTime !== null) return;
      startTime = Date.now();
      requestWakeLock();
      if (onTick) onTick(formatDuration(0));
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (startTime === null) return;
        if (onTick) onTick(formatDuration(Date.now() - startTime));
      }, 1000);
    }

    function stop() {
      if (interval) { clearInterval(interval); interval = null; }
      releaseWakeLock();
      return startTime !== null ? Date.now() - startTime : 0;
    }

    function getElapsedMs() { return startTime !== null ? Date.now() - startTime : 0; }

    function reset() {
      stop();
      startTime = null;
      if (onTick) onTick('00:00');
    }

    function isRunning() { return startTime !== null; }

    const instance = { start, stop, reset, getElapsedMs, isRunning };
    _workoutTimerInstance = instance;
    return instance;
  }

  function formatDuration(ms) {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    return `${String(Math.floor(totalSec / 60)).padStart(2,'0')}:${String(totalSec % 60).padStart(2,'0')}`;
  }

  // ── Rest Timer ─────────────────────────────────────────────────────────
  let _restTimerInstance = null; // singleton guard

  function createRestTimer(onTick, onComplete) {
    // Clear existing instance first
    if (_restTimerInstance) {
      _restTimerInstance.stop();
      _restTimerInstance.reset();
      _restTimerInstance = null;
    }

    let duration = 90;
    let remaining = 0;
    let interval = null;
    let isRunning = false;
    let isCountdown = false;
    let countdownInterval = null;
    let restStartTime = null;
    let countdownStartTime = null;

    function setDuration(sec) {
      if (isRunning) {
        // Timer is running: adjust remaining proportionally.
        // e.g. 120s → 100s remaining, change to 60s → 50s remaining.
        const elapsed = Math.min(duration, (Date.now() - restStartTime) / 1000);
        const pctDone = duration > 0 ? elapsed / duration : 0;
        duration = sec;
        remaining = Math.max(0, sec * (1 - pctDone));
        // Adjust restStartTime so the interval recalc matches new remaining
        restStartTime = Date.now() - (duration - remaining) * 1000;
      } else {
        duration = sec;
        if (!isCountdown) remaining = sec;
      }
    }
    function getDuration() { return duration; }

    function start() {
      if (isRunning) return;
      remaining = duration;
      isRunning = true;
      isCountdown = false;
      restStartTime = Date.now();
      requestWakeLock();
      tick();
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        const realElapsed = Math.floor((Date.now() - restStartTime) / 1000);
        remaining = Math.max(0, duration - realElapsed);
        tick();
        if (remaining <= 0) {
          stop();
          countdownStartTime = Date.now();
          startCountdown();
        }
      }, 1000);
    }

    function tick() {
      if (onTick) onTick(formatDuration(remaining * 1000), remaining);
    }

    function stop() {
      isRunning = false;
      if (interval) { clearInterval(interval); interval = null; }
      releaseWakeLock();
    }

    function startCountdown() {
      isCountdown = true;
      playCountdownBeep();
      if (onTick) onTick('3!', 3);
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        const elapsedMs = countdownStartTime ? Date.now() - countdownStartTime : 0;
        const count = 3 - Math.floor(elapsedMs / 1000);
        if (count > 1) { playCountdownBeep(); if (onTick) onTick(`${count}!`, count); }
        else if (count === 1) { playCountdownBeep(); if (onTick) onTick('1!', 1); }
        else if (count <= 0) {
          playGoBeep();
          if (onTick) onTick('GO!', 0);
          clearInterval(countdownInterval); countdownInterval = null;
          isCountdown = false;
          if (onComplete) onComplete();
        }
      }, 1000);
    }

    function reset() {
      stop();
      if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
      remaining = 0; isRunning = false; isCountdown = false;
      if (onTick) onTick(formatDuration(duration * 1000), duration);
    }

    function getRemaining() { return remaining; }
    function isActive() { return isRunning || isCountdown; }

    const instance = { setDuration, getDuration, start, stop, reset, getRemaining, isActive };
    _restTimerInstance = instance;
    return instance;
  }

  return { createWorkoutTimer, createRestTimer, formatDuration, playBeep, playGoBeep };
})();