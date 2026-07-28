// ============================================================================
// Analytics Engine — Progress page calculations
// ============================================================================
const GymAnalytics = (() => {
  'use strict';

  const setVolume = s => (s.reps || 0) * (s.weight || 0);

  const allSets = logs => logs.flatMap(l => 
    Object.entries(l.sets || {}).flatMap(([exId, sets]) => 
      sets.map(s => ({ ...s, exerciseId: exId, date: l.date, logId: l.id, workoutId: l.workout }))
    )
  );

  // ── Muscle Group Stats ─────────────────────────────────────────────────
  function getMuscleGroupStats(logs) {
    const sets = allSets(logs).filter(s => !s.warmup);
    const stats = {};
    sets.forEach(s => {
      const ex = byId(s.exerciseId);
      if (!ex) return;
      const vol = setVolume(s);
      ex.muscles.forEach(m => {
        stats[m] = (stats[m] || 0) + vol;
      });
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
  }

  // ── Muscle Group Working Sets ──────────────────────────────────────────
  function getMuscleGroupSets(logs) {
    const sets = allSets(logs).filter(s => !s.warmup);
    const stats = {};
    sets.forEach(s => {
      const ex = byId(s.exerciseId);
      if (!ex) return;
      ex.muscles.forEach(m => {
        stats[m] = (stats[m] || 0) + 1;
      });
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
  }

  // ── Muscle Group Training Frequency (days per week) ────────────────────
  function getMuscleFrequency(logs, weekStart) {
    const weekLogs = logs.filter(l => {
      const d = new Date(l.date);
      if (isNaN(d.getTime())) return false;
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff)).toISOString().slice(0, 10);
      return monday === weekStart;
    });
    const freq = {};
    weekLogs.forEach(l => {
      Object.keys(l.sets || {}).forEach(exId => {
        const ex = byId(exId);
        if (!ex) return;
        ex.muscles.forEach(m => {
          if (!freq[m]) freq[m] = new Set();
          freq[m].add(l.date);
        });
      });
    });
    const result = {};
    Object.entries(freq).forEach(([m, dates]) => {
      result[m] = dates.size;
    });
    return result;
  }

  // ── Personal Records by Muscle Group ───────────────────────────────────
  function getPersonalRecordsByGroup(logs) {
    const sets = allSets(logs).filter(s => !s.warmup);
    const records = {};
    const groups = {};

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
          date: s.date,
          muscles: ex.muscles
        };
      }
    });

    // Group by primary muscle
    Object.values(records).forEach(r => {
      const primary = r.muscles[0] || 'Other';
      if (!groups[primary]) groups[primary] = [];
      groups[primary].push(r);
    });

    // Sort groups by muscle name, sort records by volume
    const sorted = {};
    Object.keys(groups).sort().forEach(m => {
      sorted[m] = groups[m].sort((a, b) => b.volume - a.volume);
    });
    return sorted;
  }

  // ── Estimated 1RM by Muscle Group ──────────────────────────────────────
  function estimate1RM(reps, weight) {
    if (!reps || !weight || reps < 1) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  function getBestEstimated1RMByGroup(logs) {
    const sets = allSets(logs).filter(s => !s.warmup);
    const best = {};
    const groups = {};

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
          date: s.date,
          muscles: ex.muscles
        };
      }
    });

    Object.values(best).forEach(r => {
      const primary = r.muscles[0] || 'Other';
      if (!groups[primary]) groups[primary] = [];
      groups[primary].push(r);
    });

    const sorted = {};
    Object.keys(groups).sort().forEach(m => {
      sorted[m] = groups[m].sort((a, b) => b.estimated1RM - a.estimated1RM);
    });
    return sorted;
  }

  // ── Weekly Stats ───────────────────────────────────────────────────────
  function getWeeklyStats(logs) {
    const weekMap = {};
    logs.forEach(l => {
      const d = new Date(l.date);
      if (isNaN(d.getTime())) return;
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const weekKey = monday.toISOString().slice(0, 10);
      
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = { weekStart: weekKey, volume: 0, reps: 0, sets: 0, count: 0, exercises: new Set(), muscleGroups: new Set() };
      }
      
      const entry = weekMap[weekKey];
      entry.count++;
      
      Object.entries(l.sets || {}).forEach(([exId, sets]) => {
        const ex = byId(exId);
        if (ex) {
          entry.exercises.add(ex.name);
          ex.muscles.forEach(m => entry.muscleGroups.add(m));
        }
        sets.forEach(s => {
          if (!s.warmup) {
            entry.reps += s.reps || 0;
            entry.volume += setVolume(s);
            entry.sets++;
          }
        });
      });
    });

    return Object.values(weekMap)
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map(w => ({
        ...w,
        exercises: [...w.exercises],
        muscleGroups: [...w.muscleGroups]
      }));
  }

  // ── Streak (weekly) ────────────────────────────────────────────────────
  function getStreak(logs) {
    if (!logs.length) return 0;
    
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

    // Get the most recent week that has a log
    const latestWeek = sortedWeeks[0];
    let streak = 0;
    let checkDate = new Date(latestWeek);
    
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
    const sets = allSets(logs).filter(s => s.exerciseId === exerciseId && !s.warmup);
    if (!sets.length) return null;
    const lastSet = sets[sets.length - 1];
    return {
      reps: lastSet.reps,
      weight: lastSet.weight,
      volume: setVolume(lastSet),
      date: lastSet.date
    };
  }

  // ── Get all previous sessions for an exercise (for history table) ──────
  function getExerciseHistory(logs, exerciseId) {
    const logEntries = logs.filter(l => l.sets && l.sets[exerciseId]);
    return logEntries.map(l => ({
      date: l.date,
      sets: l.sets[exerciseId].filter(s => !s.warmup),
      warmup: l.sets[exerciseId].filter(s => s.warmup),
      logId: l.id
    })).reverse();
  }

  // ── Session volume ─────────────────────────────────────────────────────
  function getSessionVolume(sets) {
    return Object.values(sets || {}).flat().reduce((sum, s) => sum + setVolume(s), 0);
  }

  // ── Get logs for a specific week ───────────────────────────────────────
  function getLogsForWeek(logs, weekStart) {
    return logs.filter(l => {
      const d = new Date(l.date);
      if (isNaN(d.getTime())) return false;
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff)).toISOString().slice(0, 10);
      return monday === weekStart;
    });
  }

  // ── Get week number for a program ──────────────────────────────────────
  function getWeekNumber(logs, workouts, plan) {
    if (!plan || !logs.length) return null;
    const sourceWorkouts = workouts.filter(w => w.source === plan.name);
    if (!sourceWorkouts.length) return null;
    const completedIds = new Set(logs.map(l => l.workout));
    const completedSessions = sourceWorkouts.filter(w => completedIds.has(w.id)).length;
    const sessionsPerWeek = plan.sessionsPerWeek || Math.min(plan.days.length * 2, 6);
    return Math.floor(completedSessions / sessionsPerWeek) + 1;
  }

  return {
    getMuscleGroupStats,
    getMuscleGroupSets,
    getMuscleFrequency,
    getPersonalRecordsByGroup,
    getBestEstimated1RMByGroup,
    estimate1RM,
    getWeeklyStats,
    getStreak,
    getPreviousExerciseData,
    getExerciseHistory,
    getSessionVolume,
    getLogsForWeek,
    getWeekNumber
  };
})();