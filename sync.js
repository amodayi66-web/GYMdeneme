// ============================================================================
// GymSync — cross-device sync + friends feed, built on Firebase.
// Degrades gracefully: if firebase-config.js still has placeholder values,
// every method below becomes a harmless no-op and the app stays local-only.
// ============================================================================
const GymSync = (() => {
  const cfg = window.FIREBASE_CONFIG || {};
  const configured = cfg.apiKey && cfg.apiKey !== 'YOUR_API_KEY' && typeof firebase !== 'undefined';
  let db = null, auth = null, user = null, profile = null;
  let stateUnsub = null;
  const listeners = { auth: [], state: [] };
  let lastSyncResult = null; // {ok:bool, time:number, error:string}

  if (configured) {
    firebase.initializeApp(cfg);
    auth = firebase.auth();
    db = firebase.firestore();
    // Enable offline persistence so writes queue up even if offline
    db.enablePersistence().catch(() => {});
  }

  function onAuth(cb) { listeners.auth.push(cb); if (user !== null) cb(user, profile); }
  function fireAuth() { listeners.auth.forEach(cb => cb(user, profile)); }

  function getSyncStatus() { return lastSyncResult; }

  async function ensureSignedIn() {
    if (!configured) return null;
    if (auth.currentUser) return auth.currentUser;
    const cred = await auth.signInAnonymously();
    return cred.user;
  }

  // Claim a display username. If the username already exists, we do NOT
  // reassign it — instead we read the existing data and return it so the
  // caller can merge it locally. This prevents data loss when switching devices.
  async function claimUsername(username) {
    if (!configured) throw new Error('Sync is not configured yet.');
    const clean = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) throw new Error('Usernames are 3–20 letters, numbers, or _.');
    const authedUser = await ensureSignedIn();
    const key = clean.toLowerCase();
    const nameRef = db.collection('usernames').doc(key);
    
    let existingUid = null;
    let cloudData = null;
    
    // Check if username already exists
    const existingDoc = await nameRef.get();
    
    if (existingDoc.exists) {
      // Username is taken — read data from the existing UID
      existingUid = existingDoc.data().uid;
      
      // Try to read state data from the existing UID
      try {
        const stateDoc = await db.collection('users').doc(existingUid).collection('state').doc('data').get();
        if (stateDoc.exists) {
          const d = stateDoc.data();
          cloudData = {
            workouts: d.workouts || [],
            logs: d.logs || [],
            username: d.username || clean,
            friends: d.friends || [],
            volumeGoal: d.volumeGoal || 0,
            exerciseNotes: d.exerciseNotes || {},
            bodyMeasurements: d.bodyMeasurements || []
          };
        }
      } catch (e) {
        console.error('Failed to read existing data:', e);
      }
      
      // Also write our UID to the username doc so the username
      // can be found from any device (multi-device support)
      // We keep the original uid as the "primary" but add our uid
      await nameRef.set({
        uid: existingUid,  // Keep original as primary
        uids: firebase.firestore.FieldValue.arrayUnion(authedUser.uid),
        username: clean,
        lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      // Write our profile
      await db.collection('users').doc(authedUser.uid).set({
        username: clean,
        usernameLower: key,
        linkedTo: existingUid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } else {
      // Username is free — claim it
      await nameRef.set({
        uid: authedUser.uid,
        uids: [authedUser.uid],
        username: clean,
        lastAccessed: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      await db.collection('users').doc(authedUser.uid).set({
        username: clean,
        usernameLower: key,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
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
      const doc = await db.collection('users').doc(u.uid).get();
      profile = doc.exists ? { username: doc.data().username, uid: u.uid } : null;
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

  // Push the WHOLE local state up to the cloud.
  async function pushState(state) {
    if (!configured || !user) {
      lastSyncResult = { ok: false, time: Date.now(), error: 'Not signed in' };
      return;
    }
    try {
      const data = {
        workouts: state.workouts || [],
        logs: state.logs || [],
        username: state.username || '',
        friends: state.friends || [],
        volumeGoal: state.volumeGoal || 0,
        exerciseNotes: state.exerciseNotes || {},
        bodyMeasurements: state.bodyMeasurements || [],
        customExercises: state.customExercises || [],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtMs: Date.now()
      };
      await db.collection('users').doc(user.uid).collection('state').doc('data').set(data);
      lastSyncResult = { ok: true, time: Date.now() };
    } catch (e) {
      lastSyncResult = { ok: false, time: Date.now(), error: e.message };
      throw e;
    }
  }

  async function pullState() {
    if (!configured || !user) return null;
    try {
      const doc = await db.collection('users').doc(user.uid).collection('state').doc('data').get();
      if (!doc.exists) return null;
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
    } catch (e) {
      lastSyncResult = { ok: false, time: Date.now(), error: e.message };
      return null;
    }
  }

  // Realtime: keeps every open device in sync automatically.
  function subscribeState(cb) {
    if (!configured || !user) return () => {};
    if (stateUnsub) stateUnsub();
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
        const doc = await db.collection('users').doc(f.uid).collection('state').doc('data').get();
        if (!doc.exists) return { ...f, workouts: [], logs: [] };
        const d = doc.data();
        return { ...f, workouts: d.workouts || [], logs: d.logs || [] };
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