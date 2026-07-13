// ============================================================================
// Analytics Engine — Progress page calculations
// ============================================================================
const GymAnalytics = (() => {
  'use strict';

  // Get total volume (reps × weight) for a set
  const setVolume = s => (s.reps || 0) * (s.weight || 0);

  // Get all sets from logs
  const allSets = logs => logs.flatMap(l => 
    Object.entries(l.sets || {}).flatMap(([exId, sets]) => 
      sets.map(s => ({ ...s, exerciseId: exId, date: l.date, logId: l.id }))
    )
  );

  // ── Muscle Group Stats ─────────────────────────────────────────────────
  // Returns { muscleName: totalVolume, ... }
  function getMuscleGroupStats(logs) {
    const sets = allSets(logs);
    const stats = {};
    
    sets.forEach(s => {
      const ex = byId(s.exerciseId);
      if (!ex) return;
      const vol = setVolume(s);
      ex.muscles.forEach(m => {
        stats[m] = (stats[m] || 0) + vol;
      });
    });

    // Sort by volume descending
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
  }

  // ── Personal Records ───────────────────────────────────────────────────
  // Returns [{ exerciseId, exerciseName, reps, weight, volume, date }, ...]
  function getPersonalRecords(logs) {
    const sets = allSets(logs);
    const records = {};

    sets.forEach(s => {
      const ex = byId(s.exerciseId);
      if (!ex) return;
      const vol = setVolume(s);
      const key = s.exerciseId;
      
      if (!records[key] || vol > records[key].volume) {
        records[key] = {
          exerciseId: s.exerciseId,
          exerciseName: ex.name,
          reps: s.reps,
          weight: s.weight,
          volume: vol,
          date: s.date
        };
      }
    });

    return Object.values(records).sort((a, b) => b.volume - a.volume);
  }

  // ── Weekly Stats ───────────────────────────────────────────────────────
  // Returns [{ weekStart, volume, reps, sets, count }, ...]
  function getWeeklyStats(logs) {
    const weekMap = {};

    logs.forEach(l => {
      // Parse date or use current
      const d = new Date(l.date);
      if (isNaN(d.getTime())) return;
      
      // Get Monday of the week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const weekKey = monday.toISOString().slice(0, 10);
      
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { weekStart: weekKey, volume: 0, reps: 0, sets: 0, count: 0 };
      }
      
      const entry = weekMap[weekKey];
      entry.count++;
      
      Object.values(l.sets || {}).forEach(sets => {
        sets.forEach(s => {
          entry.reps += s.reps || 0;
          entry.volume += setVolume(s);
          entry.sets++;
        });
      });
    });

    return Object.values(weekMap).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }

  // ── Muscle Radar Data ──────────────────────────────────────────────────
  // Returns [{ muscle, volume }, ...] sorted for radar/spider charts
  function getMuscleRadarData(logs) {
    const stats = getMuscleGroupStats(logs);
    return Object.entries(stats).map(([muscle, volume]) => ({
      muscle,
      volume
    }));
  }

  // ── Estimated 1RM (Epley formula) ──────────────────────────────────────
  function estimate1RM(reps, weight) {
    if (!reps || !weight || reps < 1) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  // ── Best 1RM per exercise ──────────────────────────────────────────────
  function getBestEstimated1RM(logs) {
    const sets = allSets(logs);
    const best = {};

    sets.forEach(s => {
      const ex = byId(s.exerciseId);
      if (!ex || !s.reps || !s.weight) return;
      const est = estimate1RM(s.reps, s.weight);
      const key = s.exerciseId;
      if (!best[key] || est > best[key].estimated1RM) {
        best[key] = {
          exerciseId: s.exerciseId,
          exerciseName: ex.name,
          estimated1RM: est,
          reps: s.reps,
          weight: s.weight,
          date: s.date
        };
      }
    });

    return Object.values(best).sort((a, b) => b.estimated1RM - a.estimated1RM);
  }

  // ── Streak (weekly) ────────────────────────────────────────────────────
  function getStreak(logs) {
    if (!logs.length) return 0;
    
    // Get unique weeks from logs
    const weeks = new Set();
    logs.forEach(l => {
      const d = new Date(l.date);
      if (isNaN(d.getTime())) return;
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      weeks.add(monday.toISOString().slice(0, 10));
    });

    const sortedWeeks = [...weeks].sort().reverse();
    if (!sortedWeeks.length) return 0;

    // Check if current week is included
    const now = new Date();
    const todayDay = now.getDay();
    const todayDiff = now.getDate() - todayDay + (todayDay === 0 ? -6 : 1);
    const thisMonday = new Date(now.setDate(todayDiff)).toISOString().slice(0, 10);
    
    let streak = 0;
    let checkDate = new Date(thisMonday);
    
    for (let i = 0; i < sortedWeeks.length; i++) {
      const expected = checkDate.toISOString().slice(0, 10);
      if (sortedWeeks.includes(expected)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        break;
      }
    }
    
    return streak;
  }

  // ── Previous workout data for a specific exercise ──────────────────────
  function getPreviousExerciseData(logs, exerciseId) {
    const sets = allSets(logs).filter(s => s.exerciseId === exerciseId);
    if (!sets.length) return null;
    
    // Get the most recent log's sets for this exercise
    const lastSet = sets[sets.length - 1];
    return {
      reps: lastSet.reps,
      weight: lastSet.weight,
      volume: setVolume(lastSet),
      date: lastSet.date
    };
  }

  // ── Session volume goal progress ───────────────────────────────────────
  function getSessionVolume(sets) {
    return Object.values(sets || {}).flat().reduce((sum, s) => sum + setVolume(s), 0);
  }

  return {
    getMuscleGroupStats,
    getPersonalRecords,
    getWeeklyStats,
    getMuscleRadarData,
    estimate1RM,
    getBestEstimated1RM,
    getStreak,
    getPreviousExerciseData,
    getSessionVolume
  };
})();