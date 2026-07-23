// ============================================================================
// GYM — Main Application
// ============================================================================
const STORE='gym-planner-v5';
let state=JSON.parse(localStorage.getItem(STORE)||'{"workouts":[],"logs":[],"volumeGoal":0,"username":"","friends":[],"exerciseNotes":{},"bodyMeasurements":[]}');
let chan='BroadcastChannel'in window?new BroadcastChannel('gym-planner'):null;
if(chan)chan.onmessage=e=>{state=e.data;save(false);render()};

const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const fmt=n=>new Intl.NumberFormat().format(n);
const uid=()=>`${Date.now()}${Math.random().toString(16).slice(2)}`;
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]));

// ── Custom exercises (user-created, stored in state) ──
function getCustomExercises(){
  return state.customExercises||[];
}
function addCustomExercise(name){
  if(!state.customExercises)state.customExercises=[];
  const id='custom_'+uid();
  state.customExercises.push({id,name,category:'Custom',muscles:['Other']});
  save();
  return id;
}
function getAllExercises(){
  return [...EX,...getCustomExercises()];
}
function findExercise(id){
  return byId(id)||getCustomExercises().find(e=>e.id===id);
}

function save(send=true){
  localStorage.setItem(STORE,JSON.stringify(state));
  if(send&&chan)chan.postMessage(state);
  updateSyncStatus();
}

function updateSyncStatus(){
  const el=$('#sync-status');
  if(!el)return;
  const syncStatus=GymSync.getSyncStatus();
  if(GymSync.isConfigured()&&GymSync.isSignedIn()){
    if(syncStatus&&syncStatus.ok&&syncStatus.time){
      el.textContent=`☁ Synced as ${GymSync.currentProfile().username}`;
      el.parentElement.querySelector('i').style.background='var(--mint)';
    } else if(syncStatus&&syncStatus.error){
      el.textContent=`⚠ Sync error: ${syncStatus.error}`;
      el.parentElement.querySelector('i').style.background='var(--orange)';
    } else {
      el.textContent=`⏳ Syncing as ${GymSync.currentProfile().username}...`;
      el.parentElement.querySelector('i').style.background='var(--sun)';
    }
  } else if(GymSync.isConfigured()){
    el.textContent='Cloud ready — pick a username';
    el.parentElement.querySelector('i').style.background='var(--sun)';
  } else {
    el.textContent='Saved locally';
    el.parentElement.querySelector('i').style.background='var(--mint)';
  }
}

function head(title,sub){
  return `<div class="eyebrow">SIMPLE GYM APP</div><h1>${title}</h1>${sub?`<p class="intro">${sub}</p>`:''}`;
}

// ── Program week tracking ──
function getProgramProgress(){
  if(!state.workouts.length)return null;
  // Find the source program
  const sourceWorkouts=state.workouts.filter(w=>w.source);
  if(!sourceWorkouts.length)return null;
  const sourceName=sourceWorkouts[0].source;
  const plan=PLANS.find(p=>p.name===sourceName);
  if(!plan)return null;
  // Parse duration like "8 weeks" or "12 weeks"
  const weeksMatch=plan.duration.match(/(\d+)\s*weeks?/i);
  if(!weeksMatch)return null;
  const totalWeeks=parseInt(weeksMatch[1]);
  // Count completed workouts that belong to this program
  const completedIds=new Set(state.logs.map(l=>l.workout));
  const completedWorkouts=sourceWorkouts.filter(w=>completedIds.has(w.id));
  // Each week has plan.sessionsPerWeek workouts (or days.length*2)
  const sessionsPerWeek=plan.sessionsPerWeek||Math.min(plan.days.length*2,6);
  const completedSessions=completedWorkouts.length;
  const currentWeek=Math.min(Math.floor(completedSessions/sessionsPerWeek)+1,totalWeeks);
  return {currentWeek,totalWeeks,completedSessions,totalSessions:totalWeeks*sessionsPerWeek,sessionsPerWeek};
}

function getProgramProgressBar(){
  const prog=getProgramProgress();
  if(!prog)return '';
  const pct=Math.round((prog.completedSessions/prog.totalSessions)*100);
  const filled=Math.round(pct/10);
  const empty=10-filled;
  return `<div class="program-progress"><div class="eyebrow">PROGRAM PROGRESS</div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:700">Week ${prog.currentWeek} of ${prog.totalWeeks}</span><span style="font:10px 'DM Mono',monospace">${pct}%</span></div><div class="prog-bar-track"><div class="prog-bar-fill" style="width:${pct}%"></div></div><div style="font:9px 'DM Mono',monospace;color:#666;margin-top:4px">${prog.completedSessions} / ${prog.totalSessions} sessions</div></div>`;
}

function getNextWorkout(){
  if(!state.workouts.length)return null;
  const completedIds=new Set(state.logs.map(l=>l.workout));
  for(const w of state.workouts){
    if(!completedIds.has(w.id))return w;
  }
  return state.workouts[0];
}

function getSimilarExercises(exerciseId){
  const ex=findExercise(exerciseId);
  if(!ex)return [];
  const exMuscles=new Set(ex.muscles);
  return getAllExercises().filter(e=>e.id!==ex.id&&
    e.muscles.length===ex.muscles.length&&
    e.muscles.every(m=>exMuscles.has(m))
  ).slice(0,5);
}

function getPreviousSets(exerciseId){
  const logsWithEx=state.logs.filter(l=>l.sets&&l.sets[exerciseId]);
  if(!logsWithEx.length)return null;
  const last=logsWithEx[logsWithEx.length-1];
  return {sets:last.sets[exerciseId],date:last.date,logId:last.id};
}

function getExerciseNote(exerciseId){
  return state.exerciseNotes?.[exerciseId]||'';
}

function getAutoProgression(exerciseId,weight,reps){
  const prev=GymAnalytics.getPreviousExerciseData(state.logs,exerciseId);
  if(!prev||!prev.weight||!prev.reps)return null;
  const targetReps=prev.reps;
  if(reps>=targetReps&&reps>=8){
    const increase=Math.max(2.5,Math.round(prev.weight*0.05*2)/2);
    return {suggestedWeight:prev.weight+increase,reason:`Hit ${reps} reps. Try +${increase} kg next time.`};
  } else if(reps<targetReps&&reps>0){
    return {suggestedWeight:prev.weight,suggestedReps:targetReps,reason:`Aim for ${targetReps} reps at ${prev.weight} kg first.`};
  }
  return null;
}

function home(){
  const nextW=getNextWorkout();
  const progBar=getProgramProgressBar();
  return `<section class="hero">${head('A plan that fits you.','Choose a guided plan for your level or build a simple workout from the gym movements you enjoy.')}</section>
  ${nextW?`<div style="border:var(--line);background:var(--sun);padding:18px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
    <div><div class="eyebrow">NEXT WORKOUT</div><h2 style="font-size:22px;letter-spacing:-1px;margin:4px 0 0">${esc(nextW.name)}</h2></div>
    <a class="button" href="#/log/${nextW.id}">Start next workout →</a>
  </div>`:''}
  ${progBar?`<div style="margin-bottom:24px">${progBar}</div>`:''}
  <section><div class="section-head"><div><div class="eyebrow">YOUR WORKOUTS</div><h2>My plan</h2></div><a class="button mint" href="#/templates">Choose a plan →</a></div>
  ${state.workouts.length?`<div class="workout-grid">${state.workouts.map((w,i)=>`<a href="#/workout/${w.id}" class="workout-card"><small>${String(i+1).padStart(2,'0')} / ${w.exercises.length} exercises</small><h2>${esc(w.name)}</h2><p>${w.exercises.slice(0,3).map(x=>{const e=findExercise(getExId(x));return e?e.name:'?'}).join(' · ')}${w.exercises.length>3?' · …':''}</p><div class="card-foot"><span>OPEN WORKOUT</span><span>↗</span></div></a>`).join('')}</div>`:`<div class="empty"><h2>Start with a plan, not a blank page.</h2><p>Pick a clear structure for your current experience level, or make your own workout in a few clicks.</p><a class="button white" href="#/templates">Browse pre-made plans →</a> <a class="button mint" href="#/builder">Build my own</a></div>`}</section>`;
}

let level='All';
let goalFilter='All';
function templates(){
  return `<section class="template-intro">${head('Find your starting point.','Choose the training style that matches your experience. Every plan creates editable workouts in your own planner.')}</section>
  <div class="level-filter" id="level-filter">${['All','Beginner','Intermediate','Advanced'].map(x=>`<button class="filter ${level===x?'active':''}" data-level="${x}">${x}</button>`).join('')}</div>
  <div class="level-filter" id="goal-filter">${['All',...getPlanGoals()].map(x=>`<button class="filter ${goalFilter===x?'active':''}" data-goal="${x}">${x}</button>`).join('')}</div>
  <div id="template-grid" class="template-grid"></div>`;
}

function renderTemplates(){
  let plans=PLANS.filter(p=>level==='All'||p.level===level).filter(p=>goalFilter==='All'||p.goal===goalFilter);
  document.querySelectorAll('#level-filter .filter').forEach(b=>b.classList.toggle('active',b.dataset.level===level));
  document.querySelectorAll('#goal-filter .filter').forEach(b=>b.classList.toggle('active',b.dataset.goal===goalFilter));
  $('#template-grid').innerHTML=plans.map(p=>{
    const sessionsPerWeek = p.sessionsPerWeek || Math.min(p.days.length * 2, 6);
    const getPlanExName = ex => byName(Array.isArray(ex) ? ex[0] : ex);
    return `<article class="template-card"><small>${p.level.toUpperCase()} / ${p.goal.toUpperCase()} / ${sessionsPerWeek} SESSIONS/WEEK</small><h2>${p.name}</h2><p>${p.desc}</p><div class="meta"><span class="chip">${p.duration}</span><span class="chip">${p.days.length} workouts</span><span class="chip">${p.goal}</span></div><div class="plan-list">${p.days.map(d=>`<b>${d[0]}</b> — ${d[1].slice(0,3).map(getPlanExName).filter(Boolean).map(id=>{const e=byId(id);return e?e.name:`?`}).join(', ')}${d[1].length>3?'…':''}<br>`).join('')}</div><div style="display:flex;gap:8px;margin-top:12px"><button class="button" data-choose="${p.id}">Add this plan →</button><button class="button white" data-seemore="${p.id}">See more</button></div></article>`;
  }).join('');
}

function addPlan(pid){
  let p=PLANS.find(x=>x.id===pid);
  p.days.forEach(d=>{
    const exercises = d[1].map(ex => {
      if(Array.isArray(ex)) return {id: byName(ex[0]), prescription: ex[1]};
      return {id: byName(ex)};
    });
    state.workouts.push({id:uid(),name:`${p.name} · ${d[0]}`,exercises,source:p.name});
  });
  save();location.hash='#/';
}

let selected=[],category='All',muscleFilter='All',searchQuery='';

function builder(){
  return `<div class="builder-head"><div>${head('Build your own.','Name the workout, then add the exercises you want to train.')}</div><a href="#/" class="back">← My plan</a></div>
  <div class="builder"><section class="builder-box">
    <label class="label" for="workout-name">Workout name</label>
    <input id="workout-name" class="text-input" maxlength="50" placeholder="e.g. Saturday upper body">
    <input id="search-exercises" class="search-input" placeholder="Search exercises..." value="${esc(searchQuery)}">
    <button class="button white small" id="custom-ex-builder" style="margin-bottom:8px">+ Custom Exercise</button>
    <div id="custom-ex-builder-input" style="display:none;margin-bottom:12px;border:2px solid var(--ink);padding:8px;background:var(--mint)">
      <input id="custom-ex-name" class="text-input" placeholder="Exercise name (e.g. Safety Bar Squat)" style="margin-bottom:6px">
      <button class="button small" id="save-custom-ex-builder">Add to selection →</button>
    </div>
    <div class="eyebrow" style="margin-bottom:6px">Muscle group</div>
    <div id="muscle-filters" class="filter-row compact"></div>
    <div class="eyebrow" style="margin-bottom:6px">Equipment</div>
    <div id="equip-filters" class="filter-row compact"></div>
    <div id="exercise-list" class="exercise-list"></div>
  </section><aside class="selection">
    <div class="eyebrow">YOUR SELECTION</div>
    <h2><span id="count">0</span> exercises</h2>
    <ol id="selected-list" class="selected-list"><li>Choose exercises to begin.</li></ol>
    <button id="save-workout" class="button">Save workout →</button>
    <p id="message" class="message"></p>
  </aside></div>`;
}

function renderBuilder(){
  let choices=getAllExercises().filter(e=>{
    if(searchQuery&&!e.name.toLowerCase().includes(searchQuery.toLowerCase()))return false;
    if(muscleFilter!=='All'&&!e.muscles.includes(muscleFilter))return false;
    if(category!=='All'&&e.category!==category)return false;
    return true;
  });
  const muscles=getMuscleGroups();
  $('#muscle-filters').innerHTML=['All',...muscles].map(x=>`<button class="filter ${x===muscleFilter?'active':''}" data-muscle="${x}">${x}</button>`).join('');
  const equip=getEquipmentTypes();
  $('#equip-filters').innerHTML=['All',...equip].map(x=>`<button class="filter ${x===category?'active':''}" data-category="${x}">${x}</button>`).join('');
  $('#exercise-list').innerHTML=choices.map(e=>`<button class="exercise-item ${selected.includes(e.id)?'selected':''}" data-exercise="${e.id}"><b>${e.name}</b><small>${e.category} · ${e.muscles.join(', ')}</small></button>`).join('');
  $('#count').textContent=selected.length;
  $('#selected-list').innerHTML=selected.length?selected.map((x,i)=>`<li><span class="reorder-btns"><button class="move-up" data-move-up="${x}" ${i===0?'disabled':''}>▲</button><button class="move-down" data-move-down="${x}" ${i===selected.length-1?'disabled':''}>▼</button></span>${findExercise(x)?.name||'?'}<button class="remove" data-remove="${x}">×</button></li>`).join(''):'<li>Choose exercises to begin.</li>';
}

function getExId(x){
  return typeof x === 'string' ? x : (x && x.id);
}
function getExPrescription(x){
  return (typeof x === 'object' && x && x.prescription) || '';
}

function workout(id){
  let w=state.workouts.find(x=>x.id===id);
  if(!w)return home();
  return `<a class="back" href="#/">← My plan</a>
  <div class="session-head"><div>${head(esc(w.name),`${w.exercises.length} movements. Keep the session simple and focused.`)}</div><a class="button" href="#/log/${w.id}">Start session →</a></div>
  <div class="workout-grid">${w.exercises.map(x=>{let e=findExercise(getExId(x));if(!e)return '';const pres=getExPrescription(x);return `<article class="workout-card"><small>${e.category.toUpperCase()}</small><h2>${e.name}</h2><p>${e.muscles.join(' · ')}</p>${pres?`<div class="prescription">${esc(pres)}</div>`:''}<div class="card-foot"><span>WORKING MUSCLES</span></div></article>`}).join('')}</div>
  <div style="display:flex;gap:12px;margin-top:30px;flex-wrap:wrap">
    <a class="button mint" href="#/edit/${w.id}">✎ Edit workout</a>
    <button class="button white" data-delete="${w.id}">Delete workout</button>
  </div>`;
}

// ── LOG PAGE ───────────────────────────────────────────────────────────
let workoutTimer=null;
let restTimer=null;
let restDuration=90;

function setRowHtml(n, prevReps='', prevWeight='', isWarmup=false){
  const prevStr=prevReps?`<small class="prev-data">${prevReps}×${prevWeight}</small>`:'';
  return `<div class="set-row ${isWarmup?'warmup':''}" data-set="${n}">
    <span>${String(n).padStart(2,'0')}</span>
    <input class="reps" placeholder="0" inputmode="numeric" value="${prevReps}">
    <input class="weight" placeholder="opt" inputmode="decimal" value="${prevWeight}">
    <span>kg</span>${prevStr}
  </div>`;
}

function log(id){
  let w=state.workouts.find(x=>x.id===id);
  if(!w)return home();
  const wid = id;
  
  workoutTimer=GymTimers.createWorkoutTimer(t=>{
    const el=$('#workout-timer');
    if(el)el.textContent=t;
    const sl=$('#sticky-workout-timer');
    if(sl)sl.textContent=t;
  });
  
  return `<div id="sticky-timer-bar" style="display:none;position:sticky;top:0;z-index:999;background:var(--ink);color:#fff;padding:8px 16px;font:10px 'DM Mono',monospace;text-align:center">
    <span id="sticky-workout-timer">00:00</span>
    <span id="sticky-rest-indicator" style="display:none;margin-left:12px;color:var(--sun)">REST: <span id="sticky-rest-timer">00:00</span></span>
  </div>
  <a class="back" href="#/workout/${wid}">← ${esc(w.name)}</a>
  <div class="session-head"><div>${head(esc(w.name),'Log the working sets that count.')}</div><span class="eyebrow">LIVE SESSION</span></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
    <button class="button white small" id="add-exercise-btn">+ Add exercise</button>
    <button class="button white small" id="toggle-reorder-btn">⇅ Reorder</button>
  </div>
  <div id="add-exercise-panel" style="display:none;border:var(--line);background:var(--mint);padding:16px;margin-bottom:16px">
    <div class="eyebrow" style="margin-bottom:8px">Search exercises to add</div>
    <input id="add-ex-search" class="search-input" placeholder="Search..." style="margin-bottom:8px">
    <div id="add-ex-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px;max-height:200px;overflow-y:auto"></div>
    <button class="button white small" id="custom-ex-add-btn" style="margin-top:6px">+ Custom Exercise</button>
    <div id="custom-ex-add-input" style="display:none;margin-top:6px;border:2px solid var(--ink);padding:8px;background:#fff">
      <input id="custom-ex-add-name" class="text-input" placeholder="Exercise name" style="margin-bottom:4px">
      <button class="button small" id="save-custom-ex-add">Add →</button>
    </div>
  </div>
  <div class="timer-section">
    <div class="timer-label">WORKOUT DURATION</div>
    <div class="timer-display" id="workout-timer">00:00</div>
  </div>
  <div class="timer-section" style="background:var(--lilac)">
    <div class="timer-label">REST TIMER</div>
    <div class="rest-options">
      <button data-rest="30">30s</button>
      <button data-rest="60">60s</button>
      <button data-rest="90" class="active">90s</button>
      <button data-rest="120">120s</button>
      <button data-rest="150">150s</button>
      <input id="custom-rest" type="number" placeholder="Custom" inputmode="numeric" style="width:60px;border:2px solid var(--ink);padding:4px;font:10px 'DM Mono',monospace;text-align:center">
    </div>
    <div class="rest-status ready" id="rest-status">Ready</div>
    <div class="timer-display" id="rest-timer" style="font-size:22px">01:30</div>
  </div>
  <div id="reorder-mode-hint" style="display:none;background:var(--sun);border:2px solid var(--ink);padding:8px 12px;font:10px 'DM Mono',monospace;margin-bottom:12px">Reorder mode: use ▲▼ to move exercises, then press Done.</div>
  <div class="log-layout"><section id="log-section">${w.exercises.map((x, exIndex)=>{
    const exId=getExId(x);
    let e=findExercise(exId);
    if(!e)return '';
    const pres=getExPrescription(x);
    const prev=GymAnalytics.getPreviousExerciseData(state.logs,exId);
    const prevHtml=prev?`<div class="prev-best ${prev?'pr':''}">Best: ${prev.reps} reps × ${prev.weight} kg (${prev.date})</div>`:'';
    const prevSets=getPreviousSets(exId);
    const prevSetsHtml=prevSets?`<div class="prev-sets-heading">LAST SESSION (${prevSets.date})</div><div class="prev-sets-grid">${prevSets.sets.map((s,i)=>`<span class="prev-set">Set ${i+1}: ${s.reps}×${s.weight} kg${s.rpe?' @'+s.rpe:''}</span>`).join('')}</div>`:'';
    const note=getExerciseNote(exId);
    const noteHtml=note?`<div class="exercise-note">📝 ${esc(note)}</div>`:'';
    const warmupSets=`<div class="warmup-section"><button class="toggle-warmup" data-exercise="${exId}">+ Warm-up sets</button><div class="warmup-sets" id="warmup-${exId}" style="display:none"></div></div>`;
    return `<article class="log-card" data-exercise="${exId}" data-ex-index="${exIndex}">
      <div class="log-card-header">
        <span class="reorder-handle" style="display:none;cursor:grab;font-size:12px;margin-right:4px">⠿</span>
        <h2>${e.name}</h2>
        <button class="superset-btn" data-exercise="${exId}" title="Superset" style="border:0;background:var(--lilac);padding:2px 6px;font:9px 'DM Mono',monospace;font-weight:700;cursor:pointer;border:1px solid var(--ink);margin-left:auto">⧉ SS</button>
        <button class="swap-btn" data-exercise="${exId}" title="Swap" style="border:0;background:var(--paper);padding:2px 6px;font:9px 'DM Mono',monospace;cursor:pointer;border:1px solid var(--ink);margin-left:4px">↔</button>
        <button class="delete-ex-btn" data-exercise="${exId}" title="Remove" style="border:0;background:none;font-size:16px;cursor:pointer;margin-left:4px;padding:0 4px;color:#c00">×</button>
      </div>
      <div class="swap-options" style="display:none;background:#fff;border:2px solid var(--ink);padding:8px;margin-top:4px;position:relative">
        <input class="swap-search" placeholder="Search exercises..." style="width:100%;border:1px solid #ccc;padding:6px;font-size:11px;margin-bottom:6px;box-sizing:border-box">
        <div class="swap-list" style="max-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:2px"></div>
        <button class="button white small" style="margin-top:4px;font-size:10px" id="custom-ex-swap-btn">+ Custom Exercise</button>
        <div id="custom-ex-swap-input" style="display:none;margin-top:4px;border:2px solid var(--ink);padding:6px;background:var(--mint)">
          <input id="custom-ex-swap-name" class="text-input" placeholder="Exercise name" style="margin-bottom:4px;font-size:11px">
          <button class="button small" style="font-size:10px" id="save-custom-ex-swap">Add →</button>
        </div>
      </div>
      <small>${e.muscles.join(' · ')}</small>
      ${pres?`<div class="prescription">${esc(pres)}</div>`:''}
      ${noteHtml}${prevHtml}${prevSetsHtml}${warmupSets}
      <div class="set-labels"><span>Set</span><span>Reps</span><span>Weight</span><span>kg</span></div>
      <div class="sets">${setRowHtml(1)}${setRowHtml(2)}${setRowHtml(3)}</div>
      <button class="add-set">+ add set</button>
      <div class="superset-group" style="display:none;margin-top:8px;padding:8px;background:var(--mint);border:1px solid var(--ink)"></div>
    </article>`;
  }).join('')}</section><aside class="totals">
    <div class="eyebrow">SESSION TOTAL</div>
    <h2>Today's work</h2>
    <div class="total-row"><span>Working sets</span><b id="sets-total">0</b></div>
    <div class="total-row"><span>Total reps</span><b id="reps-total">0</b></div>
    <div class="total-row"><span>Volume</span><b id="volume-total">0 kg</b></div>
    <div class="total-row"><span>Est. 1RM (best set)</span><b id="est-1rm">0 kg</b></div>
    <div id="auto-progression" class="auto-progression"></div>
    <button class="button" data-finish="${wid}">Finish session →</button>
  </aside></div>
  <div id="superset-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:rgba(0,0,0,0.4);align-items:center;justify-content:center" onclick="if(event.target===this)this.style.display='none'">
    <div style="background:#fff;border:3px solid var(--ink);box-shadow:var(--shadow);padding:24px;max-width:400px;width:90%" onclick="event.stopPropagation()">
      <h3 style="font-size:18px;margin:0 0 12px">Pair with superset</h3>
      <div id="superset-ex-list" style="display:flex;flex-direction:column;gap:6px"></div>
      <button class="button white" style="margin-top:12px" onclick="document.getElementById('superset-overlay').style.display='none'">Cancel</button>
    </div>
  </div>`;
}

function readLog(){
  let r={};
  document.querySelectorAll('.log-card').forEach(c=>{
    const exId=c.dataset.exercise;
    const sets=[...c.querySelectorAll('.set-row:not(.warmup)')].map(x=>({
      reps:+x.querySelector('.reps').value||0,
      weight:+x.querySelector('.weight').value||0
    })).filter(x=>x.reps);
    const warmup=[...c.querySelectorAll('.set-row.warmup')].map(x=>({
      reps:+x.querySelector('.reps').value||0, weight:+x.querySelector('.weight').value||0, warmup:true
    })).filter(x=>x.reps);
    r[exId]=[...warmup,...sets];
  });
  return r;
}

function updateTotals(){
  let s=Object.values(readLog()).flat().filter(x=>!x.warmup);
  let r=s.reduce((a,x)=>a+x.reps,0);
  let v=s.reduce((a,x)=>a+x.reps*x.weight,0);
  $('#sets-total').textContent=s.length;
  $('#reps-total').textContent=fmt(r);
  $('#volume-total').textContent=`${fmt(v)} kg`;
  let bestSet=s.reduce((a,x)=>(x.reps*x.weight)>(a.reps*a.weight)?x:a,{reps:0,weight:0});
  let est1RM=GymAnalytics.estimate1RM(bestSet.reps,bestSet.weight);
  $('#est-1rm').textContent=est1RM?`${fmt(est1RM)} kg`:'0 kg';
  updateGoalProgress(v);
  updateAutoProgression();
}

function markCompletedInput(inp){
  if(inp.value&&parseFloat(inp.value)>0){
    inp.style.background='var(--mint)';
    inp.style.borderColor='var(--ink)';
  } else {
    inp.style.background='';
    inp.style.borderColor='';
  }
}

function markCompletedCard(card){
  const rows=card.querySelectorAll('.set-row:not(.warmup)');
  let allDone=true;
  rows.forEach(row=>{
    const reps=row.querySelector('.reps');
    const weight=row.querySelector('.weight');
    if(!reps.value||!weight.value||parseFloat(reps.value)<=0||parseFloat(weight.value)<=0) allDone=false;
  });
  if(allDone&&rows.length>0){
    card.style.borderLeft='6px solid var(--mint)';
    card.style.background='#f0faf0';
  } else {
    card.style.borderLeft='';
    card.style.background='';
  }
}

function updateAutoProgression(){
  const el=$('#auto-progression');
  if(!el)return;
  const data=readLog();
  let suggestions=[];
  Object.entries(data).forEach(([exId,sets])=>{
    const workingSets=sets.filter(s=>!s.warmup&&s.reps>0);
    if(!workingSets.length)return;
    const bestSet=workingSets.reduce((a,b)=>(b.reps*b.weight)>(a.reps*a.weight)?b:a);
    const prog=getAutoProgression(exId,bestSet.weight,bestSet.reps);
    if(prog){
      const ex=findExercise(exId);
      suggestions.push(`<div class="prog-item"><b>${ex?ex.name:'Unknown'}</b>: ${prog.reason}</div>`);
    }
  });
  el.innerHTML=suggestions.length?`<div class="prog-head">💡 NEXT SESSION SUGGESTIONS</div>${suggestions.join('')}`:'';
}

function updateGoalProgress(currentVolume){
  const goal=state.volumeGoal||0;
  const el=$('#goal-fill');
  const txt=$('#goal-text');
  if(!el||!txt)return;
  if(goal>0){
    const pct=Math.min(100,(currentVolume/goal)*100);
    el.style.width=pct+'%';
    txt.textContent=`${fmt(currentVolume)} / ${fmt(goal)} kg (${Math.round(pct)}%)`;
  } else {
    el.style.width='0%';
    txt.textContent=`${fmt(currentVolume)} / — kg`;
  }
}

function summary(id){
  let l=state.logs.find(x=>x.id===id);
  let w=state.workouts.find(x=>x.id===l?.workout);
  if(!l)return home();
  let s=Object.values(l.sets).flat().filter(x=>!x.warmup);
  let r=s.reduce((a,x)=>a+x.reps,0);
  let v=s.reduce((a,x)=>a+x.reps*x.weight,0);
  const durationStr=l.duration?` · ${l.duration}`:'';
  return `<a class="back" href="#/">← My plan</a>
  <section class="summary"><div class="eyebrow">SESSION COMPLETE / ${l.date}${durationStr}</div>
  <h1>Work done.</h1><p class="intro">${esc(w?.name||'Workout')} has been saved to this device.</p>
  <div class="summary-stats"><div><b>${fmt(r)}</b><span>TOTAL REPS</span></div><div><b>${fmt(v)} kg</b><span>VOLUME</span></div><div><b>${s.length}</b><span>WORKING SETS</span></div></div>
  ${Object.entries(l.sets).map(([x,a])=>{
    const ex=findExercise(x);
    const working=a.filter(s=>!s.warmup);
    if(!working.length)return '';
    const exVol=working.reduce((z,q)=>z+q.reps*q.weight,0);
    const exReps=working.reduce((z,q)=>z+q.reps,0);
    const prev=GymAnalytics.getPreviousExerciseData(state.logs.filter(l2=>l2.id!==id),x);
    let overload='';
    if(prev){
      const diff=exVol-prev.volume;
      if(diff>0)overload='<span class="overload-indicator up">↑ +'+fmt(diff)+' kg</span>';
      else if(diff<0)overload='<span class="overload-indicator down">↓ '+fmt(diff)+' kg</span>';
      else overload='<span class="overload-indicator equal">— same</span>';
    }
    const warmupCount=a.filter(s=>s.warmup).length;
    const warmupStr=warmupCount?` <span style="color:#999;font-size:10px">(+${warmupCount} warm-up)</span>`:'';
    return `<div class="break-row"><b>${ex?ex.name:'Unknown'}${overload}</b><span>${working.length} sets · ${exReps} reps · ${fmt(exVol)} kg${warmupStr}</span></div>`;
  }).join('')}
  <a class="button white" style="margin-top:24px" href="#/">Back to my plan</a></section>`;
}

let progressTab='overview';
function progress(){
  const isSignedIn=GymSync.isSignedIn();
  const isConfigured=GymSync.isConfigured();
  const syncStatus=GymSync.getSyncStatus();
  let syncBtnHtml='';
  let syncErrorHtml='';
  if(isConfigured&&isSignedIn){
    syncBtnHtml=`<button class="button small white" id="sync-now-btn">☁ Sync now</button>`;
    if(syncStatus&&syncStatus.error){
      syncErrorHtml=`<div style="background:var(--orange);border:2px solid var(--ink);padding:8px 12px;margin-top:8px;font:10px 'DM Mono',monospace;color:#fff">⚠ Sync error: ${esc(syncStatus.error)}</div>`;
    }
  }
  const progBar=getProgramProgressBar();
  return `<div class="progress-head" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">${head('Your progress.','Track your volume, records, and weekly trends.')}<div id="sync-progress-area">${syncBtnHtml}${syncErrorHtml}</div></div>
  ${progBar?`<div style="margin-bottom:16px">${progBar}</div>`:''}
  <div class="progress-tabs">
    <button class="progress-tab ${progressTab==='overview'?'active':''}" data-tab="overview">Overview</button>
    <button class="progress-tab ${progressTab==='weekly'?'active':''}" data-tab="weekly">Weekly Report</button>
    <button class="progress-tab ${progressTab==='measurements'?'active':''}" data-tab="measurements">Body Stats</button>
    <button class="progress-tab ${progressTab==='graphs'?'active':''}" data-tab="graphs">Graphs</button>
  </div>
  <div id="progress-content">${progressTab==='overview'?progressOverview():progressTab==='weekly'?progressWeekly():progressTab==='measurements'?progressMeasurements():progressGraphs()}</div>`;
}

function progressOverview(){
  const logs=state.logs;
  const muscleStats=GymAnalytics.getMuscleGroupStats(logs);
  const prs=GymAnalytics.getPersonalRecords(logs);
  const weekly=GymAnalytics.getWeeklyStats(logs);
  const best1RM=GymAnalytics.getBestEstimated1RM(logs);
  const streak=GymAnalytics.getStreak(logs);
  const totalVolume=Object.values(muscleStats).reduce((a,b)=>a+b,0);
  const totalSessions=logs.length;
  return `<div class="streak-badge"><span>🔥</span> ${streak} week streak</div>
  <div class="progress-grid">
    <div class="progress-card"><h3>Overview</h3>
      <div class="stat"><span>Total sessions</span><b>${totalSessions}</b></div>
      <div class="stat"><span>Total volume</span><b>${fmt(totalVolume)} kg</b></div>
      <div class="stat"><span>Total sets logged</span><b>${logs.reduce((a,l)=>a+Object.values(l.sets||{}).flat().filter(s=>!s.warmup).length,0)}</b></div>
      <div class="stat"><span>Exercises in library</span><b>${EX.length}</b></div>
    </div>
    <div class="progress-card"><h3>Volume by Muscle Group</h3>
      ${Object.entries(muscleStats).slice(0,10).map(([muscle,vol])=>{
        const pct=totalVolume?Math.round((vol/totalVolume)*100):0;
        return `<div class="volume-bar"><span style="font:10px 'DM Mono',monospace;min-width:60px">${muscle}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-label">${fmt(vol)} kg</span></div>`;
      }).join('')}
      ${Object.keys(muscleStats).length===0?'<p style="color:#999;font-size:12px">Complete a session to see muscle stats.</p>':''}
    </div>
    <div class="progress-card"><h3>Personal Records</h3>
      ${prs.length?`<ul class="pr-list">${prs.slice(0,8).map(p=>`<li><span>${esc(p.exerciseName)}</span><b>${fmt(p.reps)} reps × ${fmt(p.weight)} kg <small>${p.date}</small></b></li>`).join('')}</ul>`:'<p style="color:#999;font-size:12px">Complete a session to see PRs.</p>'}
      ${prs.length>8?`<a class="button small white" style="margin-top:8px" id="show-all-prs">Show all (${prs.length})</a>`:''}
    </div>
    <div class="progress-card"><h3>Estimated 1RM</h3>
      ${best1RM.length?`<ul class="pr-list">${best1RM.slice(0,8).map(p=>`<li><span>${esc(p.exerciseName)}</span><b>${fmt(p.estimated1RM)} kg <small>${p.reps}×${p.weight}</small></b></li>`).join('')}</ul>`:'<p style="color:#999;font-size:12px">Log sets with weight to estimate 1RM.</p>'}
    </div>
    <div class="progress-card" style="grid-column:1/-1"><h3>Weekly Performance</h3>
      ${weekly.length?`<ul class="history-list">${weekly.slice(-8).reverse().map(w=>`<li><span class="date">Week of ${w.weekStart}</span><span class="vol">${fmt(w.volume)} kg</span><span class="sets-count">${w.sets} sets · ${w.count} sessions</span></li>`).join('')}</ul>`:'<p style="color:#999;font-size:12px">Complete sessions to see weekly stats.</p>'}
    </div>
    <div class="progress-card" style="grid-column:1/-1"><h3>Session History</h3>
      ${logs.length?`<ul class="history-list">${logs.slice().reverse().map(l=>{
        const w=state.workouts.find(x=>x.id===l.workout);
        const vol=Object.values(l.sets||{}).flat().filter(s=>!s.warmup).reduce((a,s)=>a+s.reps*s.weight,0);
        const sets=Object.values(l.sets||{}).flat().filter(s=>!s.warmup).length;
        return `<li><span class="date">${l.date}${l.duration?' · '+l.duration:''}</span><span class="vol">${fmt(vol)} kg</span><span class="sets-count">${sets} sets</span></li>`;
      }).join('')}</ul>`:'<p style="color:#999;font-size:12px">No sessions logged yet.</p>'}
    </div>
  </div>`;
}

function progressWeekly(){
  const logs=state.logs;
  const weekly=GymAnalytics.getWeeklyStats(logs);
  if(!weekly.length)return '<div class="empty"><h2>No sessions logged yet.</h2><p>Complete a workout to see your weekly report.</p></div>';
  const latest=weekly[weekly.length-1];
  const prev=weekly.length>1?weekly[weekly.length-2]:null;
  const volChange=prev?((latest.volume-prev.volume)/prev.volume*100).toFixed(1):null;
  const weekStart=latest.weekStart;
  const weekEnd=new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);
  const weekEndStr=weekEnd.toISOString().slice(0,10);
  const weekLogs=logs.filter(l=>{
    const d=new Date(l.date); if(isNaN(d.getTime()))return false;
    const day=d.getDay(); const diff=d.getDate()-day+(day===0?-6:1);
    const monday=new Date(d.setDate(diff)).toISOString().slice(0,10);
    return monday===weekStart;
  });
  const muscleStats=GymAnalytics.getMuscleGroupStats(weekLogs);
  const totalVolume=Object.values(muscleStats).reduce((a,b)=>a+b,0);
  return `<div class="weekly-report">
    <div class="report-header"><h2>📊 ${weekStart} — ${weekEndStr}</h2>${volChange!==null?`<div class="vol-change ${volChange>=0?'up':'down'}">${volChange>=0?'↑':'↓'} ${Math.abs(volChange)}% vs last week</div>`:''}</div>
    <div class="report-stats">
      <div class="report-stat"><b>${latest.count}</b><span>Sessions</span></div>
      <div class="report-stat"><b>${fmt(latest.volume)} kg</b><span>Volume</span></div>
      <div class="report-stat"><b>${fmt(latest.reps)}</b><span>Reps</span></div>
      <div class="report-stat"><b>${latest.sets}</b><span>Sets</span></div>
    </div>
    <h3 style="margin:20px 0 10px;font-size:18px">Volume by Muscle Group</h3>
    <div class="weekly-muscle-chart">${Object.entries(muscleStats).sort((a,b)=>b[1]-a[1]).map(([muscle,vol])=>{
      const pct=totalVolume?Math.round((vol/totalVolume)*100):0;
      return `<div class="volume-bar"><span style="font:10px 'DM Mono',monospace;min-width:60px">${muscle}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-label">${fmt(vol)} kg (${pct}%)</span></div>`;
    }).join('')}</div>
    <h3 style="margin:20px 0 10px;font-size:18px">Daily Breakdown</h3>
    <div class="daily-breakdown">${weekLogs.length?weekLogs.map(l=>{
      const w=state.workouts.find(x=>x.id===l.workout);
      const vol=Object.values(l.sets||{}).flat().filter(s=>!s.warmup).reduce((a,s)=>a+s.reps*s.weight,0);
      const sets=Object.values(l.sets||{}).flat().filter(s=>!s.warmup).length;
      return `<div class="daily-card"><div class="daily-date">${l.date}</div><div class="daily-name">${esc(w?.name||'Workout')}</div><div class="daily-stats"><span>${fmt(vol)} kg</span><span>${sets} sets</span>${l.duration?`<span>${l.duration}</span>`:''}</div></div>`;
    }).join(''):'<p style="color:#999">No sessions this week.</p>'}</div></div>`;
}

function progressMeasurements(){
  const measurements=state.bodyMeasurements||[];
  const latest=measurements.length?measurements[measurements.length-1]:null;
  const prev=measurements.length>1?measurements[measurements.length-2]:null;
  return `<div class="measurements-section">
    <div class="measurements-head"><h2>Body Measurements</h2><p style="color:#666;font-size:12px">Track your body stats over time.</p></div>
    ${latest?`<div class="latest-measurements"><h3>Latest (${latest.date})</h3><div class="measure-grid">${latest.weight?`<div class="measure-card"><span class="measure-label">Weight</span><span class="measure-value">${latest.weight} kg</span>${prev&&prev.weight?`<span class="measure-diff ${latest.weight>=prev.weight?'up':'down'}">${latest.weight>=prev.weight?'+':''}${(latest.weight-prev.weight).toFixed(1)}</span>`:''}</div>`:''}${latest.bodyFat?`<div class="measure-card"><span class="measure-label">Body Fat</span><span class="measure-value">${latest.bodyFat}%</span>${prev&&prev.bodyFat?`<span class="measure-diff ${latest.bodyFat<=prev.bodyFat?'down':'up'}">${latest.bodyFat<=prev.bodyFat?'-':'+'}${Math.abs(latest.bodyFat-prev.bodyFat).toFixed(1)}</span>`:''}</div>`:''}${latest.waist?`<div class="measure-card"><span class="measure-label">Waist</span><span class="measure-value">${latest.waist} cm</span></div>`:''}${latest.chest?`<div class="measure-card"><span class="measure-label">Chest</span><span class="measure-value">${latest.chest} cm</span></div>`:''}${latest.arms?`<div class="measure-card"><span class="measure-label">Arms</span><span class="measure-value">${latest.arms} cm</span></div>`:''}${latest.thighs?`<div class="measure-card"><span class="measure-label">Thighs</span><span class="measure-value">${latest.thighs} cm</span></div>`:''}</div></div>`:`<div class="empty"><h2>No measurements yet.</h2><p>Start tracking your body stats below.</p></div>`}
    <div class="add-measurements"><h3>Add Measurement</h3><div class="measure-form">
      <div class="measure-field"><label>Weight (kg)</label><input id="m-weight" type="number" step="0.1" placeholder="75"></div>
      <div class="measure-field"><label>Body Fat %</label><input id="m-bodyfat" type="number" step="0.1" placeholder="15"></div>
      <div class="measure-field"><label>Waist (cm)</label><input id="m-waist" type="number" step="0.5" placeholder="80"></div>
      <div class="measure-field"><label>Chest (cm)</label><input id="m-chest" type="number" step="0.5" placeholder="100"></div>
      <div class="measure-field"><label>Arms (cm)</label><input id="m-arms" type="number" step="0.5" placeholder="35"></div>
      <div class="measure-field"><label>Thighs (cm)</label><input id="m-thighs" type="number" step="0.5" placeholder="55"></div>
    </div><button class="button" id="save-measurements">Save measurements →</button><p id="measure-msg" class="message"></p></div>
    ${measurements.length>1?`<div class="measurement-history"><h3>History</h3><ul class="history-list">${measurements.slice().reverse().map(m=>{const vals=[m.weight?m.weight+' kg':'',m.bodyFat?m.bodyFat+'%':'',m.waist?m.waist+'cm':''].filter(Boolean).join(' · ');return `<li><span class="date">${m.date}</span><span class="vol">${vals||'—'}</span></li>`;}).join('')}</ul></div>`:''}
  </div>`;
}

function progressGraphs(){
  const logs=state.logs;
  const weekly=GymAnalytics.getWeeklyStats(logs);
  if(!weekly.length)return '<div class="empty"><h2>No data to chart yet.</h2><p>Complete a few workouts to see your trends.</p></div>';
  const maxVol=Math.max(...weekly.map(w=>w.volume));
  const chartHeight=200;
  return `<div class="graphs-section"><h2>Volume Over Time</h2>
    <div class="bar-chart" style="height:${chartHeight}px">${weekly.slice(-12).map(w=>{const pct=w.volume/maxVol;const height=Math.max(4,pct*chartHeight);return `<div class="bar-chart-col" title="Week of ${w.weekStart}: ${fmt(w.volume)} kg"><div class="bar-chart-bar" style="height:${height}px"></div><span class="bar-chart-label">${w.weekStart.slice(5)}</span></div>`;}).join('')}</div>
    <h2 style="margin-top:30px">Weekly Sessions</h2>
    <div class="bar-chart" style="height:${chartHeight}px">${weekly.slice(-12).map(w=>{const pct=w.count/Math.max(...weekly.map(x=>x.count));const height=Math.max(4,pct*chartHeight);return `<div class="bar-chart-col" title="Week of ${w.weekStart}: ${w.count} sessions"><div class="bar-chart-bar" style="height:${height}px;background:var(--lilac)"></div><span class="bar-chart-label">${w.weekStart.slice(5)}</span></div>`;}).join('')}</div>
    <h2 style="margin-top:30px">Volume by Muscle Group</h2><div class="muscle-pie" id="muscle-pie"></div>${renderMusclePie()}</div>`;
}

function renderMusclePie(){
  const muscleStats=GymAnalytics.getMuscleGroupStats(state.logs);
  const totalVolume=Object.values(muscleStats).reduce((a,b)=>a+b,0);
  if(!totalVolume)return '';
  const colors=['#fd6b43','#f8dc65','#bcebcf','#ddd7ff','#ffb3b3','#b3d9ff','#d4edda','#ffeeba','#c3e6cb','#f5c6cb'];
  const entries=Object.entries(muscleStats).sort((a,b)=>b[1]-a[1]);
  return `<div class="pie-chart">${entries.slice(0,8).map(([muscle,vol],i)=>{const pct=((vol/totalVolume)*100).toFixed(1);return `<div class="pie-row"><span class="pie-dot" style="background:${colors[i%colors.length]}"></span><span class="pie-label">${muscle}</span><span class="pie-bar"><div class="pie-bar-fill" style="width:${pct}%;background:${colors[i%colors.length]}"></div></span><span class="pie-pct">${pct}%</span></div>`;}).join('')}</div>`;
}

function social(){
  const profile=GymSync.currentProfile();
  const isSignedIn=GymSync.isSignedIn();
  const isConfigured=GymSync.isConfigured();
  const friendsList=state.friends||[];
  return `<section class="hero"><div class="eyebrow">TRAINING PLANNER</div><h1>Social.</h1><p class="intro">See what your friends are training and share your progress.</p></section>
  ${!isConfigured?`<div class="empty" style="margin-top:24px"><h3>Cloud sync not configured</h3><p>Set up Firebase to use social features.</p></div>`
  :`<section class="social-setup"><div class="builder-box">
    <label class="label" for="username-input">Your username</label>
    <div class="username-row"><input id="username-input" class="text-input" maxlength="30" placeholder="e.g. alex_lifter" value="${esc(state.username||'')}"><button class="button" id="set-username-btn">Set</button></div>
    <p class="message" id="username-msg">Set a username to sync across devices and let friends find your workouts.</p>
    <label class="label" style="margin-top:20px;display:block">Friends</label>
    <div class="username-row"><input id="friend-input" class="text-input" maxlength="30" placeholder="Add friend's username"><button class="button mint" id="add-friend-btn">Add</button></div>
    <div class="friends-list" id="friends-list">${friendsList.length?friendsList.map(f=>`<div class="friend-chip">${esc(f)} <button class="remove" data-remove-friend="${esc(f)}">×</button></div>`).join(''):'<p class="message">No friends added yet.</p>'}</div>
  </div></section>
  <section><div class="section-head"><div><div class="eyebrow">FRIENDS' PROGRESS</div><h2>Workout Feed</h2></div></div>
  ${!friendsList.length?`<div class="empty"><p>Add friends by their username to see their latest workouts here.</p></div>`:`<div id="friend-feed" class="friend-summary-grid"><p class="message">Loading…</p></div>`}</section>`}`;
}

function render(){
  let p=location.hash.slice(2).split('/'),r=p[0]||'';
  if(r!=='log'&&workoutTimer){workoutTimer.stop();workoutTimer=null;}
  if(r!=='log'&&restTimer){restTimer.stop();restTimer=null;}
  switch(r){
    case 'templates': $('#app').innerHTML=templates(); renderTemplates(); break;
    case 'builder': $('#app').innerHTML=builder(); renderBuilder(); break;
    case 'workout': $('#app').innerHTML=workout(p[1]); break;
    case 'edit': $('#app').innerHTML=editWorkout(p[1]); setTimeout(initEditWorkout,50); break;
    case 'log': $('#app').innerHTML=log(p[1]); setTimeout(initLog,50); break;
    case 'summary': $('#app').innerHTML=summary(p[1]); break;
    case 'progress': $('#app').innerHTML=progress(); setTimeout(initProgress,50); break;
    case 'social': $('#app').innerHTML=social(); setTimeout(initSocial,50); break;
    default: $('#app').innerHTML=home(); break;
  }
  document.querySelectorAll('.topbar nav a').forEach(a=>a.classList.toggle('active',a.hash===location.hash||(a.hash==='#/'&&!location.hash)));
  bind();
}

function bind(){
  if(location.hash==='#/templates'){
    $('#level-filter').onclick=e=>{if(e.target.dataset.level){level=e.target.dataset.level;renderTemplates();}};
    $('#goal-filter').onclick=e=>{if(e.target.dataset.goal){goalFilter=e.target.dataset.goal;renderTemplates();}};
    $('#template-grid').onclick=e=>{
      if(e.target.dataset.choose)addPlan(e.target.dataset.choose);
      if(e.target.dataset.seemore)showPlanDetails(e.target.dataset.seemore);
    };
    function showPlanDetails(pid){
      const p=PLANS.find(x=>x.id===pid);
      if(!p)return;
      const overlay=document.createElement('div');
      overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center';
      overlay.onclick=()=>overlay.remove();
      overlay.innerHTML=`<div style="background:#fff;border:3px solid var(--ink);box-shadow:var(--shadow);padding:24px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto" onclick="event.stopPropagation()"><h2 style="font-size:28px;letter-spacing:-1px;margin:0 0 4px">${esc(p.name)}</h2><p style="font:10px 'DM Mono',monospace;color:#666;margin:0 0 16px">${p.level} / ${p.goal} / ${p.duration}</p><p style="line-height:1.5;margin:0 0 16px">${p.desc}</p>${p.days.map(d=>`<div style="margin-bottom:12px;padding:12px;background:var(--lilac);border:2px solid var(--ink)"><b style="font-size:14px">${esc(d[0])}</b><div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">${d[1].map(ex=>{const en=Array.isArray(ex)?ex[0]:ex;return byName(en);}).filter(Boolean).map(id=>{const e=byId(id);return e?`<span style="background:#fff;border:1px solid var(--ink);padding:3px 6px;font:10px 'DM Mono',monospace">${esc(e.name)}</span>`:''}).join('')}</div></div>`).join('')}<button class="button" data-choose="${p.id}" style="margin-top:8px">Add this plan →</button><button class="button white" style="margin-top:8px;margin-left:8px" onclick="this.closest('div[style]').parentElement.remove()">Close</button></div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('[data-choose]').onclick=()=>{addPlan(pid);overlay.remove();};
    }
  }
  if(location.hash==='#/builder'){
    $('#search-exercises').oninput=e=>{searchQuery=e.target.value;renderBuilder();};
    $('#muscle-filters').onclick=e=>{if(e.target.dataset.muscle){muscleFilter=e.target.dataset.muscle;renderBuilder();}};
    $('#equip-filters').onclick=e=>{if(e.target.dataset.category){category=e.target.dataset.category;renderBuilder();}};
    $('#exercise-list').onclick=e=>{let b=e.target.closest('[data-exercise]');if(!b)return;let x=b.dataset.exercise;selected=selected.includes(x)?selected.filter(q=>q!==x):[...selected,x];renderBuilder();};
    $('#selected-list').onclick=e=>{
      if(e.target.dataset.remove){selected=selected.filter(x=>x!==e.target.dataset.remove);renderBuilder();}
      if(e.target.dataset.moveUp){const id=e.target.dataset.moveUp;const idx=selected.indexOf(id);if(idx>0){[selected[idx-1],selected[idx]]=[selected[idx],selected[idx-1]];renderBuilder();}}
      if(e.target.dataset.moveDown){const id=e.target.dataset.moveDown;const idx=selected.indexOf(id);if(idx<selected.length-1){[selected[idx],selected[idx+1]]=[selected[idx+1],selected[idx]];renderBuilder();}}
    };
    $('#save-workout').onclick=()=>{let n=$('#workout-name').value.trim(),m=$('#message');if(!n)return m.textContent='Give your workout a name.';if(!selected.length)return m.textContent='Choose at least one exercise.';let w={id:uid(),name:n,exercises:selected};state.workouts.push(w);save();selected=[];location.hash=`#/workout/${w.id}`;};
    // Custom exercise in builder
    const customExBtn=$('#custom-ex-builder');
    if(customExBtn)customExBtn.onclick=()=>{const inp=$('#custom-ex-builder-input');if(inp)inp.style.display=inp.style.display==='none'?'block':'none';};
    const saveCustomEx=$('#save-custom-ex-builder');
    if(saveCustomEx)saveCustomEx.onclick=()=>{const name=$('#custom-ex-name')?.value.trim();if(!name)return;const id=addCustomExercise(name);selected.push(id);renderBuilder();$('#custom-ex-name').value='';$('#custom-ex-builder-input').style.display='none';};
  }
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{state.workouts=state.workouts.filter(x=>x.id!==b.dataset.delete);save();location.hash='#/';});
  const showPrs=$('#show-all-prs');
  if(showPrs)showPrs.onclick=()=>{const prs=GymAnalytics.getPersonalRecords(state.logs);const card=showPrs.closest('.progress-card');const list=card.querySelector('.pr-list');if(list){list.innerHTML=prs.map(p=>`<li><span>${esc(p.exerciseName)}</span><b>${fmt(p.reps)} reps × ${fmt(p.weight)} kg <small>${p.date}</small></b></li>`).join('');showPrs.remove();}};
}

function initProgress(){
  document.querySelectorAll('.progress-tab').forEach(t=>t.onclick=()=>{progressTab=t.dataset.tab;render();});
  const saveMeas=$('#save-measurements');
  if(saveMeas)saveMeas.onclick=()=>{
    const weight=$('#m-weight')?.value,bodyFat=$('#m-bodyfat')?.value,waist=$('#m-waist')?.value,chest=$('#m-chest')?.value,arms=$('#m-arms')?.value,thighs=$('#m-thighs')?.value,msg=$('#measure-msg');
    if(!weight&&!bodyFat&&!waist&&!chest&&!arms&&!thighs)return msg.textContent='Fill at least one field.';
    if(!state.bodyMeasurements)state.bodyMeasurements=[];
    state.bodyMeasurements.push({date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),weight:weight?+weight:null,bodyFat:bodyFat?+bodyFat:null,waist:waist?+waist:null,chest:chest?+chest:null,arms:arms?+arms:null,thighs:thighs?+thighs:null});
    save();msg.textContent='Saved!';setTimeout(()=>render(),500);
  };
  // Sync now button
  const syncBtn=$('#sync-now-btn');
  if(syncBtn)syncBtn.onclick=async function(){
    this.textContent='☁ Syncing...';
    this.style.background='var(--sun)';
    try{
      await GymSync.pushState(state);
      this.textContent='☁ Synced!';
      this.style.background='var(--mint)';
      setTimeout(()=>{this.textContent='☁ Sync now';this.style.background='';},2000);
    }catch(e){
      this.textContent='☁ Failed!';
      this.style.background='var(--orange)';
      setTimeout(()=>{this.textContent='☁ Sync now';this.style.background='';},2000);
    }
    updateSyncStatus();
  };
}

function initLog(){
  const getWid = () => location.hash.split('/')[2];
  
  function isLastSetOfExercise(setRow){
    const card=setRow.closest('.log-card');
    if(!card)return false;
    const allSets=card.querySelectorAll('.set-row:not(.warmup)');
    return allSets.length>0 && setRow === allSets[allSets.length-1];
  }
  
  function autoFillWeight(firstWeightInput){
    const card=firstWeightInput.closest('.log-card');
    if(!card)return;
    const val=firstWeightInput.value;
    if(!val||parseFloat(val)<=0)return;
    const allWeights=card.querySelectorAll('.set-row:not(.warmup) .weight');
    const setIdx=[...allWeights].indexOf(firstWeightInput);
    if(setIdx!==0)return;
    allWeights.forEach((w,i)=>{if(i>0&&!w.value)w.value=val;});
  }
  
  function maybeStartRest(setRow){
    if(isLastSetOfExercise(setRow))return;
    if(restTimer){
      restTimer.reset(); restTimer.setDuration(restDuration); restTimer.start(); updateRestUI();
    }
  }
  
  function updateRestUI(){
    const el=$('#rest-timer'), status=$('#rest-status'), stickyRest=$('#sticky-rest-indicator'), stickyRestTimer=$('#sticky-rest-timer'), bar=$('#sticky-timer-bar');
    if(!el||!status)return;
    if(restTimer&&restTimer.isActive()){
      status.textContent='Resting...'; status.className='rest-status resting';
      if(stickyRest){stickyRest.style.display='inline';}
      if(stickyRestTimer)stickyRestTimer.textContent=el.textContent;
      if(bar)bar.style.display='block';
    } else {
      status.textContent='Ready'; status.className='rest-status ready';
      if(stickyRest)stickyRest.style.display='none';
      if(bar)bar.style.display='none';
    }
  }
  
  restTimer=GymTimers.createRestTimer(
    (display,remaining)=>{
      const el=$('#rest-timer'), status=$('#rest-status'), stickyRestTimer=$('#sticky-rest-timer'), bar=$('#sticky-timer-bar');
      if(el)el.textContent=display;
      if(stickyRestTimer)stickyRestTimer.textContent=display;
      if(status){if(remaining>0)status.textContent='Resting...';else if(remaining===0)status.textContent='GO!';else status.textContent='Ready';}
      if(bar)bar.style.display=(restTimer&&restTimer.isActive())?'block':'none';
    },
    ()=>{const status=$('#rest-status');if(status)status.textContent='Ready';const bar=$('#sticky-timer-bar');if(bar)bar.style.display='none';}
  );
  restTimer.setDuration(restDuration); restTimer.reset();
  if(workoutTimer)workoutTimer.start();
  
  function bindSetRowEvents(row){
    const reps=row.querySelector('.reps'), weight=row.querySelector('.weight');
    const setRowEl=row;
    const setIndex=[...row.parentElement.querySelectorAll('.set-row:not(.warmup)')].indexOf(row);
    if(reps)reps.oninput=function(){
      markCompletedInput(this);
      if(this.value&&parseFloat(this.value)>0)maybeStartRest(setRowEl);
      updateTotals(); updateCardState(this.closest('.log-card'));
    };
    // ── Fix: use onchange instead of oninput for weight auto-fill ──
    if(weight)weight.onchange=function(){
      markCompletedInput(this);
      if(setIndex===0)autoFillWeight(this);
      updateTotals(); updateCardState(this.closest('.log-card'));
    };
    // Also keep oninput for real-time totals update but without auto-fill
    if(weight)weight.oninput=function(){
      markCompletedInput(this);
      updateTotals(); updateCardState(this.closest('.log-card'));
    };
  }
  
  function updateCardState(card){markCompletedCard(card);}
  
  function renderSwapOptions(card, exId, query){
    const list=card.querySelector('.swap-list');
    if(!list)return;
    const choices=getAllExercises().filter(e=>{if(e.id===exId)return false;if(query&&!e.name.toLowerCase().includes(query.toLowerCase()))return false;return true;}).slice(0,20);
    list.innerHTML=choices.map(e=>`<button class="swap-option" data-swap-from="${exId}" data-swap-to="${e.id}" style="text-align:left;padding:4px 6px;font:10px 'DM Mono',monospace;border:0;border-bottom:1px solid #eee;cursor:pointer">${esc(e.name)}</button>`).join('')||'<span style="font-size:10px;color:#999">No exercises found.</span>';
    list.querySelectorAll('.swap-option').forEach(btn=>{btn.onclick=function(){
      const from=this.dataset.swapFrom, to=this.dataset.swapTo;
      const wid=getWid(); const w=state.workouts.find(x=>x.id===wid);
      if(w){const idx=w.exercises.findIndex(x=>getExId(x)===from);if(idx!==-1){w.exercises[idx]=to;save();render();}}
    };});}
  
  document.querySelectorAll('.log-card').forEach(card=>{
    const exId=card.dataset.exercise;
    
    card.querySelector('.add-set').onclick=function(){
      const setsContainer=this.previousElementSibling;
      const setNum=setsContainer.querySelectorAll('.set-row').length+1;
      setsContainer.insertAdjacentHTML('beforeend',setRowHtml(setNum));
      bindSetRowEvents(setsContainer.lastElementChild);
      updateTotals(); updateCardState(card);
    };
    
    card.querySelectorAll('.set-row').forEach(row=>bindSetRowEvents(row));
    
    card.querySelector('.delete-ex-btn').onclick=function(e){
      e.stopPropagation();
      if(!confirm('Remove this exercise from the workout?'))return;
      const wid=getWid(); const w=state.workouts.find(x=>x.id===wid);
      if(!w)return;
      w.exercises=w.exercises.filter(x=>getExId(x)!==exId); save();
      card.remove(); updateTotals();
    };
    
    card.querySelector('.superset-btn').onclick=function(){
      const overlay=$('#superset-overlay'), list=$('#superset-ex-list');
      if(!overlay||!list)return;
      const wid=getWid(); const w=state.workouts.find(x=>x.id===wid);
      if(!w)return;
      list.innerHTML=w.exercises.filter(x=>getExId(x)!==exId).map(x=>{const e=findExercise(getExId(x));return e?`<button class="filter" data-superset-pair="${exId}" data-superset-with="${getExId(x)}" style="text-align:left">${esc(e.name)}</button>`:'';}).join('')||'<p style="font-size:12px;color:#666">No other exercises available.</p>';
      overlay.style.display='flex';
      list.querySelectorAll('[data-superset-pair]').forEach(btn=>{btn.onclick=function(){
        const from=this.dataset.supersetPair, to=this.dataset.supersetWith;
        const fromCard=document.querySelector(`.log-card[data-exercise="${from}"]`), toCard=document.querySelector(`.log-card[data-exercise="${to}"]`);
        if(fromCard&&toCard){
          fromCard.style.borderRight='6px solid var(--orange)'; toCard.style.borderRight='6px solid var(--orange)';
          fromCard.querySelector('.superset-group').style.display='block'; toCard.querySelector('.superset-group').style.display='block';
          const fromName=fromCard.querySelector('h2')?.textContent||'', toName=toCard.querySelector('h2')?.textContent||'';
          fromCard.querySelector('.superset-group').innerHTML=`<span style="font:9px 'DM Mono',monospace">⧉ Superset with <b>${esc(toName)}</b> <button class="remove-superset" data-exercise="${from}" style="border:0;background:none;cursor:pointer;font-size:12px;color:#c00;margin-left:4px">✕</button></span>`;
          toCard.querySelector('.superset-group').innerHTML=`<span style="font:9px 'DM Mono',monospace">⧉ Superset with <b>${esc(fromName)}</b> <button class="remove-superset" data-exercise="${to}" style="border:0;background:none;cursor:pointer;font-size:12px;color:#c00;margin-left:4px">✕</button></span>`;
        }
        overlay.style.display='none';
      };});};
    
    card.querySelector('.swap-btn').onclick=function(e){
      e.stopPropagation();
      const options=card.querySelector('.swap-options');
      if(!options)return;
      const shown=options.style.display!=='none';
      options.style.display=shown?'none':'block';
      if(!shown)renderSwapOptions(card, exId, '');
    };
    
    document.addEventListener('click', function closeSwap(e){
      const swapOptions=card.querySelector('.swap-options');
      if(!swapOptions||swapOptions.style.display==='none')return;
      if(!swapOptions.contains(e.target)&&!card.querySelector('.swap-btn').contains(e.target))swapOptions.style.display='none';
    }, {once:false});
  });
  
  document.querySelectorAll('.swap-search').forEach(inp=>{inp.oninput=function(){const card=this.closest('.log-card');if(!card)return;renderSwapOptions(card, card.dataset.exercise, this.value);};});
  
  // ── Custom exercise in swap ──
  const customSwapBtn=$('#custom-ex-swap-btn');
  if(customSwapBtn)customSwapBtn.onclick=()=>{const inp=$('#custom-ex-swap-input');if(inp)inp.style.display=inp.style.display==='none'?'block':'none';};
  const saveCustomSwap=$('#save-custom-ex-swap');
  if(saveCustomSwap)saveCustomSwap.onclick=()=>{
    const name=$('#custom-ex-swap-name')?.value.trim();
    if(!name)return;
    const id=addCustomExercise(name);
    // Find the card that has this swap panel open
    const card=document.querySelector('.swap-options[style*="block"]')?.closest('.log-card');
    if(card){
      const exId=card.dataset.exercise;
      const wid=getWid(); const w=state.workouts.find(x=>x.id===wid);
      if(w){const idx=w.exercises.findIndex(x=>getExId(x)===exId);if(idx!==-1){w.exercises[idx]=id;save();render();}}
    }
  };
  
  // ── Custom exercise in add panel ──
  const customAddBtn=$('#custom-ex-add-btn');
  if(customAddBtn)customAddBtn.onclick=()=>{const inp=$('#custom-ex-add-input');if(inp)inp.style.display=inp.style.display==='none'?'block':'none';};
  const saveCustomAdd=$('#save-custom-ex-add');
  if(saveCustomAdd)saveCustomAdd.onclick=()=>{
    const name=$('#custom-ex-add-name')?.value.trim();
    if(!name)return;
    const id=addCustomExercise(name);
    const wid=getWid(); const w=state.workouts.find(x=>x.id===wid);
    if(w){w.exercises.push(id);save();render();}
  };
  
  // ── Fix: use event delegation for remove-superset (dynamic elements) ──
  document.querySelector('#log-section')?.addEventListener('click', function(e){
    const btn=e.target.closest('.remove-superset');
    if(!btn)return;
    const exId=btn.dataset.exercise;
    const card=document.querySelector(`.log-card[data-exercise="${exId}"]`);
    if(card){card.style.borderRight='';card.querySelector('.superset-group').style.display='none';}
  });
  
  document.querySelectorAll('[data-rest]').forEach(b=>b.onclick=function(){restDuration=+this.dataset.rest;document.querySelectorAll('[data-rest]').forEach(x=>x.classList.remove('active'));this.classList.add('active');if(restTimer){restTimer.setDuration(restDuration);restTimer.reset();updateRestUI();}});
  
  const customRest=$('#custom-rest');
  if(customRest)customRest.onchange=function(){const val=+this.value;if(val>0){restDuration=val;document.querySelectorAll('[data-rest]').forEach(x=>x.classList.remove('active'));if(restTimer){restTimer.setDuration(restDuration);restTimer.reset();updateRestUI();}}};
  
  document.querySelectorAll('.toggle-warmup').forEach(b=>b.onclick=function(){
    const exId=this.dataset.exercise, container=$(`#warmup-${exId}`);
    if(!container)return;
    if(container.style.display!=='none'){container.style.display='none';this.textContent='+ Warm-up sets';return;}
    container.style.display='block'; this.textContent='− Warm-up sets';
    const prev=getPreviousSets(exId), prevWarmup=prev?prev.sets.filter(s=>s.warmup):[];
    const mainSet=document.querySelector(`[data-exercise="${exId}"] .set-row:not(.warmup) .weight`);
    const mainWeight=mainSet?+mainSet.value||0:0; let html='';
    for(let i=1;i<=3;i++){const warmWeight=mainWeight?Math.round((mainWeight*(0.4+i*0.15))/2.5)*2.5:0;const prevW=prevWarmup[i-1];html+=setRowHtml(i,prevW?prevW.reps:'',warmWeight||prevW?.weight||'',true);}
    container.innerHTML=html; updateTotals();
  });
  
  let reorderMode=false;
  const reorderBtn=$('#toggle-reorder-btn'), hint=$('#reorder-mode-hint');
  if(reorderBtn&&hint){reorderBtn.onclick=function(){
    reorderMode=!reorderMode; this.textContent=reorderMode?'Done reordering':'⇅ Reorder';
    hint.style.display=reorderMode?'block':'none';
    document.querySelectorAll('.reorder-handle').forEach(h=>h.style.display=reorderMode?'inline':'none');
    if(!reorderMode){const wid=getWid();const w=state.workouts.find(x=>x.id===wid);if(w){const section=$('#log-section');const newOrder=[...section.querySelectorAll('.log-card')].map(c=>c.dataset.exercise);w.exercises=newOrder;save();}}
  };}
  
  document.querySelectorAll('.reorder-handle').forEach(h=>{h.onclick=function(){const card=this.closest('.log-card'),section=card.parentElement,prev=card.previousElementSibling;if(prev&&prev.classList.contains('log-card'))section.insertBefore(card,prev);};});
  
  document.querySelectorAll('.log-card-header h2').forEach(h2=>h2.onclick=function(){
    const card=this.closest('.log-card'); if(!card)return;
    const exId=card.dataset.exercise, ex=findExercise(exId); if(!ex)return;
    const allLogs=state.logs.filter(l=>l.sets&&l.sets[exId]), allSets=allLogs.flatMap(l=>l.sets[exId].filter(s=>!s.warmup));
    const bestVolume=allSets.reduce((a,b)=>(b.reps*b.weight)>(a.reps*a.weight)?b:a,{reps:0,weight:0});
    let html=`<div style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:999;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center" onclick="this.remove()"><div style="background:#fff;border:3px solid var(--ink);box-shadow:var(--shadow);padding:24px;max-width:440px;width:90%;max-height:85vh;overflow-y:auto" onclick="event.stopPropagation()"><h2 style="font-size:24px;letter-spacing:-1px;margin:0 0 4px">${esc(ex.name)}</h2><p style="font:10px 'DM Mono',monospace;color:#666;margin:0 0 16px">${ex.muscles.join(' · ')}</p>`;
    if(bestVolume.reps>0)html+=`<div style="background:var(--sun);border:2px solid var(--ink);padding:12px;margin-bottom:16px"><b style="font-size:14px">🏆 Personal Record</b><br><span style="font-size:18px;font-weight:800">${bestVolume.reps} reps × ${bestVolume.weight} kg</span></div>`;
    if(allLogs.length>0){allLogs.slice().reverse().slice(0,10).forEach(l=>{const sets=l.sets[exId].filter(s=>!s.warmup);if(!sets.length)return;html+=`<div style="margin-bottom:10px;padding:8px;background:#f9f9f9;border:1px solid #eee"><b style="font:9px 'DM Mono',monospace">${l.date}</b><div style="margin-top:4px">${sets.map(s=>`<span style="display:inline-block;background:var(--sun);padding:2px 6px;margin:2px;border:1px solid var(--ink);font:9px 'DM Mono',monospace">${s.reps}×${s.weight} kg</span>`).join('')}</div></div>`;});}
    html+=`<button style="margin-top:8px;border:2px solid var(--ink);background:var(--paper);padding:8px 16px;font-weight:700;cursor:pointer" onclick="this.closest('div[style]').parentElement.remove()">Close</button></div></div>`;
    const div=document.createElement('div'); div.innerHTML=html; document.body.appendChild(div);
  });
  
  // ── Fix: only add note buttons if not already present ──
  document.querySelectorAll('.log-card').forEach(card=>{
    const exId=card.dataset.exercise, header=card.querySelector('.log-card-header');
    if(!header||!exId)return;
    if(header.querySelector('.note-btn'))return;
    const note=getExerciseNote(exId);
    const noteBtn=document.createElement('button'); noteBtn.className='note-btn'; noteBtn.textContent='📝'; noteBtn.title=note||'Add note';
    noteBtn.style.cssText='border:0;background:none;font-size:16px;cursor:pointer;padding:0 2px;margin-left:2px';
    header.appendChild(noteBtn);
    const noteInput=document.createElement('div'); noteInput.className='note-input-popup';
    noteInput.style.cssText='display:none;position:absolute;background:#fff;border:2px solid var(--ink);padding:10px;z-index:100;margin-top:4px;right:0';
    noteInput.innerHTML=`<textarea id="note-${exId}" rows="2" style="width:180px;border:2px solid var(--ink);padding:6px;font-size:12px">${esc(note)}</textarea><button class="button small" data-save-note="${exId}" style="margin-top:4px">Save</button>`;
    noteBtn.parentElement.style.position='relative'; noteBtn.parentElement.appendChild(noteInput);
    noteBtn.onclick=()=>{noteInput.style.display=noteInput.style.display==='none'?'block':'none';};
    noteInput.querySelector('[data-save-note]').onclick=()=>{const val=document.getElementById(`note-${exId}`)?.value||'';if(!state.exerciseNotes)state.exerciseNotes={};state.exerciseNotes[exId]=val;save();noteInput.style.display='none';noteBtn.title=val||'Add note';};
  });
  
  const addExBtn=$('#add-exercise-btn'), addExPanel=$('#add-exercise-panel');
  if(addExBtn&&addExPanel){addExBtn.onclick=()=>{const shown=addExPanel.style.display!=='none';addExPanel.style.display=shown?'none':'block';if(!shown)renderAddExerciseList('');};}
  const addExSearch=$('#add-ex-search'); if(addExSearch)addExSearch.oninput=function(){renderAddExerciseList(this.value);};
  const addExList=$('#add-ex-list'); if(addExList){addExList.onclick=function(e){const btn=e.target.closest('[data-add-ex]');if(!btn)return;const exId=btn.dataset.addEx;if(!findExercise(exId))return;const wid=getWid();const w=state.workouts.find(x=>x.id===wid);if(w){w.exercises.push(exId);save();render();}};}
  
  const finish=$('[data-finish]');
  if(finish)finish.onclick=()=>{
    let sets=readLog(); if(!Object.values(sets).some(x=>x.length))return alert('Add at least one working set first.');
    const duration=workoutTimer?workoutTimer.stop():0; const durationStr=GymTimers.formatDuration(duration);
    let l={id:uid(), workout:finish.dataset.finish, date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), duration:durationStr, sets};
    state.logs.push(l); save();
    if(GymSync.isConfigured()&&GymSync.isSignedIn()){try{GymSync.pushState(state)}catch(e){console.error('Sync error:',e)}}
    location.hash=`#/summary/${l.id}`;
  };
  
  updateTotals();
  document.querySelectorAll('.log-card').forEach(c=>markCompletedCard(c));
}

function initSocial(){
  const setBtn=$('#set-username-btn');
  if(setBtn)setBtn.onclick=async()=>{
    const input=$('#username-input'), msg=$('#username-msg');
    if(!input||!msg)return;
    const name=input.value.trim();
    if(!name)return msg.textContent='Enter a username.';
    try{
      const result=await GymSync.claimUsername(name);
      state.username=result.profile.username;
      save();
      msg.textContent=`Signed in as ${result.profile.username}!`;
      msg.style.color='var(--ink)';
      
      // Merge cloud data: merge intelligently, never remove workouts or logs.
      // Cloud adds what local doesn't have; local keeps what cloud doesn't.
      // This prevents data loss when cloud snapshot is incomplete.
      function mergeCloudData(cd){
        if(!cd)return;
        if(cd.workouts&&cd.workouts.length){
          // Merge: add cloud workouts not already in local
          const localIds=new Set(state.workouts.map(w=>w.id));
          const newWorkouts=[...state.workouts];
          cd.workouts.forEach(cw=>{
            if(!localIds.has(cw.id))newWorkouts.push(cw);
          });
          state.workouts=newWorkouts;
        }
        if(cd.logs&&cd.logs.length){
          // Merge logs similarly (avoid duplicate IDs)
          const localLogIds=new Set(state.logs.map(l=>l.id));
          const newLogs=[...state.logs];
          cd.logs.forEach(cl=>{
            if(!localLogIds.has(cl.id))newLogs.push(cl);
          });
          state.logs=newLogs;
        }
        if(cd.exerciseNotes&&Object.keys(cd.exerciseNotes).length)state.exerciseNotes={...cd.exerciseNotes,...state.exerciseNotes};
        if(cd.bodyMeasurements&&cd.bodyMeasurements.length){
          const localMeasDates=new Set(state.bodyMeasurements.map(m=>m.date));
          cd.bodyMeasurements.forEach(cm=>{
            if(!localMeasDates.has(cm.date))state.bodyMeasurements.push(cm);
          });
        }
        if(cd.friends&&cd.friends.length){
          cd.friends.forEach(f=>{if(!state.friends.includes(f))state.friends.push(f);});
        }
        if(cd.volumeGoal&&!state.volumeGoal)state.volumeGoal=cd.volumeGoal;
        if(cd.customExercises&&cd.customExercises.length){
          const localCustomIds=new Set(state.customExercises?.map(e=>e.id)||[]);
          cd.customExercises.forEach(ce=>{
            if(!localCustomIds.has(ce.id)){
              if(!state.customExercises)state.customExercises=[];
              state.customExercises.push(ce);
            }
          });
        }
        save();
      }
      
      // ── Repair: if workouts from a plan are missing, regenerate them ──
      function repairMissingPlanWorkouts(){
        // Find workouts that came from a plan
        const sourceWorkouts=state.workouts.filter(w=>w.source);
        if(!sourceWorkouts.length)return;
        const sourceName=sourceWorkouts[0].source;
        const plan=PLANS.find(p=>p.name===sourceName);
        if(!plan)return;
        // Check which plan days are missing from our workouts
        const existingNames=new Set(sourceWorkouts.map(w=>w.name));
        let added=false;
        plan.days.forEach(d=>{
          const expectedName=`${plan.name} · ${d[0]}`;
          if(!existingNames.has(expectedName)){
            // This workout is missing — regenerate it
            const exercises=d[1].map(ex=>{
              if(Array.isArray(ex)) return {id:byName(ex[0]),prescription:ex[1]};
              return {id:byName(ex)};
            });
            state.workouts.push({id:uid(),name:expectedName,exercises,source:plan.name});
            added=true;
          }
        });
        if(added)save();
      }
      
      // Run repair after merge
      repairMissingPlanWorkouts();
      
      // Always merge cloud data first (username-based path)
      if(result.cloudData){
        mergeCloudData(result.cloudData);
      } else {
        // Try pull from username-based path
        const cloudData=await GymSync.pullState();
        mergeCloudData(cloudData);
      }
      
      // Push current state to cloud
      await GymSync.pushState(state);
      updateSyncStatus();
      setTimeout(()=>render(),800);
    }catch(e){
      msg.textContent=e.message;
      msg.style.color='#c00';
    }
  };
  const addBtn=$('#add-friend-btn');
  if(addBtn)addBtn.onclick=async()=>{const input=$('#friend-input');if(!input)return;const name=input.value.trim();if(!name)return;if(!state.friends)state.friends=[];if(state.friends.includes(name))return;try{await GymSync.addFriend(name);state.friends.push(name);save();input.value='';render();setTimeout(loadFriendFeed,50);}catch(e){const msg=$('#username-msg');if(msg){msg.textContent=e.message;msg.style.color='#c00';}}};
  const friendsList=$('#friends-list');
  if(friendsList)friendsList.onclick=async e=>{if(!e.target.dataset.removeFriend)return;const name=e.target.dataset.removeFriend;if(state.friends)state.friends=state.friends.filter(f=>f!==name);save();render();setTimeout(loadFriendFeed,50);};
  loadFriendFeed();
}

async function loadFriendFeed(){
  const feed=$('#friend-feed'); if(!feed)return;
  feed.innerHTML='<p class="message">Loading…</p>';
  try{
    const data=await GymSync.friendsFeed(); const friendsState=state.friends||[];
    if(!friendsState.length){feed.innerHTML='';return;} feed.innerHTML='';
    friendsState.forEach(friendName=>{
      const friendData=data.find(d=>d.username&&d.username.toLowerCase()===friendName.toLowerCase());
      const logs=friendData?.logs||[], workouts=friendData?.workouts||[];
      const workingLogs=logs.filter(l=>Object.values(l.sets||{}).some(sets=>sets.some(s=>!s.warmup)));
      const totalVol=workingLogs.reduce((a,l)=>a+Object.values(l.sets||{}).flat().filter(s=>!s.warmup).reduce((v,s)=>v+s.reps*s.weight,0),0);
      const totalSets=workingLogs.reduce((a,l)=>a+Object.values(l.sets||{}).flat().filter(s=>!s.warmup).length,0);
      const totalReps=workingLogs.reduce((a,l)=>a+Object.values(l.sets||{}).flat().filter(s=>!s.warmup).reduce((r,s)=>r+s.reps,0),0);
      const sessionCount=workingLogs.length;
      const allExIds=new Set(); workingLogs.forEach(l=>Object.keys(l.sets||{}).forEach(exId=>allExIds.add(exId)));
      const muscleTags=[...new Set([...allExIds].flatMap(exId=>{const e=findExercise(exId);return e?e.muscles:[]}))].slice(0,5);
      const sortedLogs=workingLogs.slice().reverse(); const latest=sortedLogs[0]; const restLogs=sortedLogs.slice(1);
      const latestWName=latest?workouts.find(w=>w.id===latest.workout)?.name||'Workout':'';
      const latestSets=latest?Object.entries(latest.sets||{}).flatMap(([exId,sets])=>sets.filter(s=>!s.warmup).map(s=>({...s,exId}))):[];
      const latestVol=latestSets.reduce((a,s)=>a+s.reps*s.weight,0), latestReps=latestSets.reduce((a,s)=>a+s.reps,0);
      const grouped={}; latestSets.forEach(s=>{const ex=findExercise(s.exId);const name=ex?ex.name:'Unknown';if(!grouped[name])grouped[name]=[];grouped[name].push(s);});
      let html=`<div class="friend-card"><div class="card-header"><div class="username">@${esc(friendName)}</div><div class="total-sessions"><strong>${sessionCount}</strong> sessions</div></div>`;
      if(latest){
        html+=`<div class="routine-title-row"><h2 class="routine-name">${esc(latestWName)}</h2><div class="total-weight"><strong>${fmt(totalVol)}</strong> kg total</div></div><div class="workout-date">${latest.date}</div><hr class="divider"><div class="overview-metrics"><div class="metric-box"><div class="metric-value">${fmt(latestVol)}</div><div class="metric-label">kg vol</div></div><div class="metric-box"><div class="metric-value">${fmt(latestReps)}</div><div class="metric-label">reps</div></div><div class="metric-box"><div class="metric-value">${latestSets.length}</div><div class="metric-label">sets</div></div></div>`;
        if(muscleTags.length)html+=`<div class="tags-container">${muscleTags.map(m=>`<span class="tag">${esc(m)}</span>`).join('')}</div>`;
        html+=`<div class="section-label">Last Session</div><div class="exercise-list">${Object.entries(grouped).map(([name,sets])=>{const exVol=sets.reduce((a,s)=>a+s.reps*s.weight,0);return `<div class="exercise-item"><div class="exercise-header"><span class="exercise-name">${esc(name)}</span><span class="exercise-total-weight">${fmt(exVol)} kg</span></div><div class="exercise-sets">${sets.map(s=>`${s.reps}×${s.weight}kg`).join(' · ')}</div></div>`;}).join('')}</div>`;
        html+=`<button class="toggle-btn" data-fc-toggle="${friendName.replace(/[^a-zA-Z0-9]/g,'')}">▲ Hide workouts</button>`;
        if(restLogs.length){html+=`<div class="fc-other-sessions" style="display:none">`;restLogs.forEach(l=>{const wName=workouts.find(w=>w.id===l.workout)?.name||'Workout';const sets=Object.entries(l.sets||{}).flatMap(([exId,sets])=>sets.filter(s=>!s.warmup).map(s=>({...s,exId})));const vol=sets.reduce((a,s)=>a+s.reps*s.weight,0);const reps=sets.reduce((a,s)=>a+s.reps,0);html+=`<div class="minimal-routine"><div class="minimal-header"><h2 class="routine-name" style="font-size:16px">${esc(wName)}</h2><span class="workout-date" style="margin-bottom:0">${l.date}</span></div><div class="minimal-stats">${fmt(vol)} kg · ${fmt(reps)} reps · ${sets.length} sets</div></div>`;});html+=`</div><button class="toggle-btn show-more-btn" data-fc-more="${friendName.replace(/[^a-zA-Z0-9]/g,'')}">▼ Show ${restLogs.length} more session${restLogs.length>1?'s':''}</button>`;}
      } else html+=`<div class="empty" style="margin:12px 0"><p>No workouts synced yet.</p></div>`;
      html+=`</div>`; feed.innerHTML+=html;
    });
    feed.querySelectorAll('.toggle-btn[data-fc-toggle]').forEach(btn=>{btn.onclick=function(e){e.stopPropagation();const card=this.closest('.friend-card');if(!card)return;const body=card.querySelector('.exercise-list'), metrics=card.querySelector('.overview-metrics'), tags=card.querySelector('.tags-container'), label=card.querySelector('.section-label'), divider=card.querySelector('.divider'), date=card.querySelector('.workout-date'), routineRow=card.querySelector('.routine-title-row'), header=card.querySelector('.card-header'), otherSessions=card.querySelector('.fc-other-sessions'), showMore=card.querySelector('.show-more-btn');const items=[body,metrics,tags,label,divider,date,routineRow,header,otherSessions,showMore].filter(Boolean);const hidden=body&&body.style.display==='none';items.forEach(el=>el.style.display=hidden?'':'none');this.textContent=hidden?'▲ Hide workouts':'▼ Show workouts';};});
    feed.querySelectorAll('.show-more-btn').forEach(btn=>{btn.onclick=function(e){e.stopPropagation();const card=this.closest('.friend-card');if(!card)return;const other=card.querySelector('.fc-other-sessions');if(other){const hidden=other.style.display==='none';other.style.display=hidden?'block':'none';this.textContent=hidden?'▲ Hide older sessions':'▼ Show more sessions';}};});
  } catch(e){ feed.innerHTML=`<p class="message" style="color:#c00">Error loading feed: ${esc(e.message)}</p>`; }
}

function renderAddExerciseList(query){
  const container=$('#add-ex-list'); if(!container)return;
  const choices=getAllExercises().filter(e=>!query||e.name.toLowerCase().includes(query.toLowerCase())).slice(0,30);
  container.innerHTML=choices.map(e=>`<button class="filter" data-add-ex="${e.id}" style="text-align:left;font-size:11px">${esc(e.name)}</button>`).join('');
}

function editWorkout(id){
  let w=state.workouts.find(x=>x.id===id); if(!w)return home();
  const allExIds=w.exercises;
  return `<a class="back" href="#/workout/${id}">← Back to workout</a>
  <div class="builder-head"><div>${head('Edit workout.','Add or remove exercises from this workout.')}</div></div>
  <div class="builder"><section class="builder-box">
    <label class="label" for="edit-workout-name">Workout name</label>
    <input id="edit-workout-name" class="text-input" maxlength="50" value="${esc(w.name)}">
    <input id="edit-search-exercises" class="search-input" placeholder="Search exercises...">
    <div class="eyebrow" style="margin-bottom:6px">Muscle group</div><div id="edit-muscle-filters" class="filter-row compact"></div>
    <div class="eyebrow" style="margin-bottom:6px">Equipment</div><div id="edit-equip-filters" class="filter-row compact"></div>
    <div id="edit-exercise-list" class="exercise-list"></div>
    <button class="button white small" id="edit-custom-ex-btn" style="margin-top:8px">+ Custom Exercise</button>
    <div id="edit-custom-ex-input" style="display:none;margin-top:8px;border:2px solid var(--ink);padding:8px;background:var(--mint)">
      <input id="edit-custom-ex-name" class="text-input" placeholder="Exercise name" style="margin-bottom:6px">
      <button class="button small" id="save-edit-custom-ex">Add →</button>
    </div>
  </section><aside class="selection">
    <div class="eyebrow">EXERCISES IN WORKOUT</div><h2><span id="edit-count">${allExIds.length}</span> exercises</h2>
    <ol id="edit-selected-list" class="selected-list">${allExIds.map((x,i)=>`<li><span class="reorder-btns"><button class="move-up" data-edit-up="${x}" ${i===0?'disabled':''}>▲</button><button class="move-down" data-edit-down="${x}" ${i===allExIds.length-1?'disabled':''}>▼</button></span>${findExercise(x)?.name||'?'}<button class="remove" data-edit-remove="${x}">×</button></li>`).join('')}</ol>
    <button id="save-edit-workout" class="button">Save changes →</button><p id="edit-message" class="message"></p>
  </aside></div>`;
}

let editSelected=[],editCategory='All',editMuscleFilter='All',editSearchQuery='';
function renderEditBuilder(){
  let wId=location.hash.split('/')[2], w=state.workouts.find(x=>x.id===wId); if(!w)return;
  editSelected=[...w.exercises];
  let choices=getAllExercises().filter(e=>{if(editSearchQuery&&!e.name.toLowerCase().includes(editSearchQuery.toLowerCase()))return false;if(editMuscleFilter!=='All'&&!e.muscles.includes(editMuscleFilter))return false;if(editCategory!=='All'&&e.category!==editCategory)return false;return true;});
  const muscles=getMuscleGroups(); const mf=$('#edit-muscle-filters'); if(mf)mf.innerHTML=['All',...muscles].map(x=>`<button class="filter ${x===editMuscleFilter?'active':''}" data-edit-muscle="${x}">${x}</button>`).join('');
  const equip=getEquipmentTypes(); const ef=$('#edit-equip-filters'); if(ef)ef.innerHTML=['All',...equip].map(x=>`<button class="filter ${x===editCategory?'active':''}" data-edit-category="${x}">${x}</button>`).join('');
  const el=$('#edit-exercise-list'); if(el)el.innerHTML=choices.map(e=>`<button class="exercise-item ${editSelected.includes(e.id)?'selected':''}" data-edit-exercise="${e.id}"><b>${e.name}</b><small>${e.category} · ${e.muscles.join(', ')}</small></button>`).join('');
  const ec=$('#edit-count'); if(ec)ec.textContent=editSelected.length;
  const sl=$('#edit-selected-list'); if(sl)sl.innerHTML=editSelected.map((x,i)=>`<li><span class="reorder-btns"><button class="move-up" data-edit-up="${x}" ${i===0?'disabled':''}>▲</button><button class="move-down" data-edit-down="${x}" ${i===editSelected.length-1?'disabled':''}>▼</button></span>${String(i+1).padStart(2,'0')} · ${findExercise(x)?.name||'?'}<button class="remove" data-edit-remove="${x}">×</button></li>`).join('');
}
function initEditWorkout(){
  renderEditBuilder();
  const search=$('#edit-search-exercises'); if(search)search.oninput=function(){editSearchQuery=this.value;renderEditBuilder();};
  const mf=$('#edit-muscle-filters'); if(mf)mf.onclick=e=>{if(e.target.dataset.editMuscle){editMuscleFilter=e.target.dataset.editMuscle;renderEditBuilder();}};
  const ef=$('#edit-equip-filters'); if(ef)ef.onclick=e=>{if(e.target.dataset.editCategory){editCategory=e.target.dataset.editCategory;renderEditBuilder();}};
  const el=$('#edit-exercise-list'); if(el)el.onclick=e=>{let b=e.target.closest('[data-edit-exercise]');if(!b)return;let x=b.dataset.editExercise;editSelected=editSelected.includes(x)?editSelected.filter(q=>q!==x):[...editSelected,x];renderEditBuilder();};
  const sl=$('#edit-selected-list'); if(sl)sl.onclick=e=>{
    if(e.target.dataset.editRemove){editSelected=editSelected.filter(x=>x!==e.target.dataset.editRemove);renderEditBuilder();}
    if(e.target.dataset.editUp){const id=e.target.dataset.editUp;const idx=editSelected.indexOf(id);if(idx>0){[editSelected[idx-1],editSelected[idx]]=[editSelected[idx],editSelected[idx-1]];renderEditBuilder();}}
    if(e.target.dataset.editDown){const id=e.target.dataset.editDown;const idx=editSelected.indexOf(id);if(idx<editSelected.length-1){[editSelected[idx],editSelected[idx+1]]=[editSelected[idx+1],editSelected[idx]];renderEditBuilder();}}
  };
  const saveBtn=$('#save-edit-workout'); if(saveBtn)saveBtn.onclick=()=>{const name=$('#edit-workout-name')?.value.trim(),msg=$('#edit-message');if(!name)return msg.textContent='Give your workout a name.';if(!editSelected.length)return msg.textContent='Choose at least one exercise.';const wId=location.hash.split('/')[2];const w=state.workouts.find(x=>x.id===wId);if(w){w.name=name;w.exercises=editSelected;save();location.hash=`#/workout/${wId}`;}};
  // Custom exercise in edit
  const customEditBtn=$('#edit-custom-ex-btn');
  if(customEditBtn)customEditBtn.onclick=()=>{const inp=$('#edit-custom-ex-input');if(inp)inp.style.display=inp.style.display==='none'?'block':'none';};
  const saveEditCustom=$('#save-edit-custom-ex');
  if(saveEditCustom)saveEditCustom.onclick=()=>{const name=$('#edit-custom-ex-name')?.value.trim();if(!name)return;const id=addCustomExercise(name);editSelected.push(id);renderEditBuilder();$('#edit-custom-ex-name').value='';$('#edit-custom-ex-input').style.display='none';};
}

window.onhashchange=render;
render();
updateSyncStatus();

const origSave=save;
save=async function(send=true){
  origSave(send);
  if(GymSync.isConfigured()&&GymSync.isSignedIn()){
    try {
      await GymSync.pushState(state);
    } catch(e){
      console.error('Sync failed:', e);
    }
    updateSyncStatus();
  }
};

// ── Auto-sync: push to cloud every 30s when signed in ──
setInterval(() => {
  if(GymSync.isConfigured() && GymSync.isSignedIn()){
    GymSync.pushState(state).catch(() => {});
    updateSyncStatus();
  }
}, 30000);
