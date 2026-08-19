// ============================================================================
// GymSync — cross-device sync + friends feed, built on Firebase.
// Degrades gracefully: if firebase-config.js still has placeholder values,
// every method below becomes a harmless no-op and the app stays local-only.
// ============================================================================
const GymSync = (() => {
  const cfg = window.FIREBASE_CONFIG || {};
  const _uid = () => `${Date.now()}${Math.random().toString(16).slice(2)}`;
  const configured = cfg.apiKey && cfg.apiKey !== 'YOUR_API_KEY' && typeof firebase !== 'undefined';
  let db = null, auth = null, user = null, profile = null;
  let stateUnsub = null;
  const listeners = { auth: [], state: [] };
  let lastSyncResult = null; // {ok:bool, time:number, error:string}

  if (configured) {
    firebase.initializeApp(cfg);
    auth = firebase.auth();
    db = firebase.firestore();
    db.enablePersistence().catch(() => {});
  }

  function onAuth(cb) { listeners.auth.push(cb); if (user !== null) cb(user, profile); }
  function fireAuth() { listeners.auth.forEach(cb => cb(user, profile)); }
  function getSyncStatus() { return lastSyncResult; }

  // ── Helper: get the username-based data path ──
  function getUsernameDataRef(username) {
    const key = username.toLowerCase().trim();
    return db.collection('usernames').doc(key).collection('data').doc('state');
  }

  // ── Helper: read data from a given doc ref ──
  function extractData(doc) {
    if (!doc || !doc.exists) return null;
    const d = doc.data();
    return {
      workouts: d.workouts || [],
      logs: d.logs || [],
      username: d.username || '',
      friends: d.friends || [],
      volumeGoal: d.volumeGoal || 0,
      exerciseNotes: d.exerciseNotes || {},
      bodyMeasurements: d.bodyMeasurements || [],
      customExercises: d.customExercises || []
    };
  }

  async function ensureSignedIn() {
    if (!configured) return null;
    if (auth.currentUser) return auth.currentUser;
    try {
      const cred = await auth.signInAnonymously();
      return cred.user;
    } catch (e) {
      console.error('Auth sign-in failed:', e);
      lastSyncResult = { ok: false, time: Date.now(), error: e.message };
      throw e;
    }
  }

  // ── Claim a username. Data is stored by USERNAME, not by UID. ──
  // This means every device using the same username reads/writes the same data.
  // Gracefully handles Firestore failures: login still works, sync is best-effort.
  async function claimUsername(username) {
    if (!configured) throw new Error('Sync is not configured yet.');
    const clean = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) throw new Error('Usernames are 3–20 letters, numbers, or _.');
    let authedUser = null;
    try {
      authedUser = await ensureSignedIn();
    } catch (e) {
      // Auth failed — still allow local login
      console.error('Auth failed:', e);
      user = null;
      profile = { username: clean, uid: 'local-' + _uid() };
      fireAuth();
      return { profile, cloudData: null };
    }
    
    const key = clean.toLowerCase();
    const nameRef = db.collection('usernames').doc(key);
    
    let cloudData = null;
    let existingDoc = null;
    
    try {
      existingDoc = await nameRef.get();
    } catch (e) {
      // Firestore unavailable — proceed with local-only mode
      console.warn('Firestore unavailable, proceeding locally:', e.message);
      lastSyncResult = { ok: false, time: Date.now(), error: 'Cloud sync unavailable — working offline' };
    }
    
    // Try to read any existing cloud data (best-effort)
    if (existingDoc && existingDoc.exists) {
      try {
        const stateDoc = await getUsernameDataRef(key).get();
        if (stateDoc.exists) cloudData = extractData(stateDoc);
      } catch (e) {}
      if (!cloudData) {
        const oldUid = existingDoc.data().uid;
        if (oldUid) {
          try {
            const oldDoc = await db.collection('users').doc(oldUid).collection('state').doc('data').get();
            if (oldDoc.exists) cloudData = extractData(oldDoc);
          } catch (e) {}
        }
      }
    }
    
    // Try to write to Firestore (best-effort, don't fail login if it doesn't work)
    try {
      if (existingDoc && existingDoc.exists) {
        await nameRef.set({
          uid: existingDoc.data().uid || authedUser.uid,
          uids: firebase.firestore.FieldValue.arrayUnion(authedUser.uid),
          username: clean,
          lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } else {
        await nameRef.set({
          uid: authedUser.uid,
          uids: [authedUser.uid],
          username: clean,
          lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (e) {
      console.warn('Firestore write failed, continuing offline:', e.message);
      lastSyncResult = { ok: false, time: Date.now(), error: 'Cloud sync unavailable — working offline' };
    }
    
    user = authedUser;
    profile = { username: clean, uid: authedUser.uid };
    fireAuth();
    return { profile, cloudData };
  }

  async function restoreProfile() {
    if (!configured) return;
    auth.onAuthStateChanged(async u => {
      if (!u) { user = null; profile = null; lastSyncResult = null; fireAuth(); return; }
      user = u;
      try {
        const doc = await db.collection('users').doc(u.uid).get();
        profile = doc.exists ? { username: doc.data().username, uid: u.uid } : null;
      } catch (e) {
        profile = null;
      }
      fireAuth();
    });
  }
  if (configured) restoreProfile();

  function signOut() {
    if (!configured) return;
    if (stateUnsub) { stateUnsub(); stateUnsub = null; }
    auth.signOut();
    user = null; profile = null; lastSyncResult = null; fireAuth();
  }

  // ── Push state to the username-based path (always the same location) ──
  async function pushState(state) {
    if (!configured || !user || !profile || !profile.username) {
      lastSyncResult = { ok: false, time: Date.now(), error: 'Not signed in' };
      return;
    }
    try {
      const data = {
        workouts: state.workouts || [],
        logs: state.logs || [],
        username: state.username || profile.username,
        friends: state.friends || [],
        volumeGoal: state.volumeGoal || 0,
        exerciseNotes: state.exerciseNotes || {},
        bodyMeasurements: state.bodyMeasurements || [],
        customExercises: state.customExercises || [],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs: Date.now()
      };
      // Write to username-based path (shared across devices)
      await getUsernameDataRef(profile.username).set(data);
      // Also write to UID-based path for backward compatibility
      await db.collection('users').doc(user.uid).collection('state').doc('data').set(data);
      lastSyncResult = { ok: true, time: Date.now() };
    } catch (e) {
      lastSyncResult = { ok: false, time: Date.now(), error: e.message };
      throw e;
    }
  }

  // ── Pull state from username-based path ──
  async function pullState() {
    if (!configured || !user) return null;
    try {
      // Try username-based path first
      if (profile && profile.username) {
        const doc = await getUsernameDataRef(profile.username).get();
        const data = extractData(doc);
        if (data) return data;
      }
      // Fall back to UID-based path
      const doc = await db.collection('users').doc(user.uid).collection('state').doc('data').get();
      return extractData(doc);
    } catch (e) {
      lastSyncResult = { ok: false, time: Date.now(), error: e.message };
      return null;
    }
  }

  // ── Realtime subscription ──
  function subscribeState(cb) {
    if (!configured || !user) return () => {};
    if (stateUnsub) stateUnsub();
    // Subscribe to UID-based path (Firebase Realtime doesn't work well with
    // username-based paths because the user might not own that path)
    stateUnsub = db.collection('users').doc(user.uid).collection('state').doc('data')
      .onSnapshot(doc => { if (doc.exists) cb(doc.data()); });
    return stateUnsub;
  }

  async function addFriend(username) {
    if (!configured || !user) throw new Error('Sign in first.');
    const key = username.trim().toLowerCase();
    const nameDoc = await db.collection('usernames').doc(key).get();
    if (!nameDoc.exists) throw new Error('No user with that username.');
    const friendUid = nameDoc.data().uid;
    if (friendUid === user.uid) throw new Error("That's your own username.");
    await db.collection('users').doc(user.uid).collection('friends').doc(friendUid).set({
      username: nameDoc.data().username, addedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { uid: friendUid, username: nameDoc.data().username };
  }

  async function removeFriend(friendUid) {
    if (!configured || !user) return;
    await db.collection('users').doc(user.uid).collection('friends').doc(friendUid).delete();
  }

  async function listFriends() {
    if (!configured || !user) return [];
    const snap = await db.collection('users').doc(user.uid).collection('friends').get();
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }

  async function friendsFeed() {
    if (!configured || !user) return [];
    const friends = await listFriends();
    const results = await Promise.all(friends.map(async f => {
      try {
        // Try reading from friend's username path first
        if (f.username) {
          const doc = await getUsernameDataRef(f.username).get();
          const d = extractData(doc);
          if (d) return { ...f, ...d };
        }
        // Fall back to UID path
        const doc = await db.collection('users').doc(f.uid).collection('state').doc('data').get();
        const d = extractData(doc);
        return { ...f, ...(d || { workouts: [], logs: [] }) };
      } catch { return { ...f, workouts: [], logs: [], error: true }; }
    }));
    return results;
  }

  return {
    isConfigured: () => configured,
    isSignedIn: () => !!profile,
    currentProfile: () => profile,
    getSyncStatus,
    onAuth, claimUsername, signOut,
    pushState, pullState, subscribeState,
    addFriend, removeFriend, listFriends, friendsFeed
  };
})();