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
  }

  function onAuth(cb) { listeners.auth.push(cb); if (user !== null) cb(user, profile); }
  function fireAuth() { listeners.auth.forEach(cb => cb(user, profile)); }

  function getSyncStatus() { return lastSyncResult; }
  function onSyncStatusChange(cb) { /* caller can poll or listen */ }

  async function ensureSignedIn() {
    if (!configured) return null;
    if (auth.currentUser) return auth.currentUser;
    const cred = await auth.signInAnonymously();
    return cred.user;
  }

  // Claim a display username (unique, case-insensitive) for the signed-in uid.
  // Returns { profile, cloudData } — cloudData is the old data if this username
  // was previously used on another device, so the caller can merge it.
  async function claimUsername(username) {
    if (!configured) throw new Error('Sync is not configured yet.');
    const clean = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) throw new Error('Usernames are 3–20 letters, numbers, or _.');
    const authedUser = await ensureSignedIn();
    const key = clean.toLowerCase();
    const nameRef = db.collection('usernames').doc(key);
    
    let oldUid = null;
    let cloudData = null;
    
    await db.runTransaction(async tx => {
      const doc = await tx.get(nameRef);
      if (doc.exists) {
        oldUid = doc.data().uid;
        // If the username is already claimed by a different UID, we need to
        // migrate the data from the old UID to the new UID.
        if (oldUid !== authedUser.uid) {
          // Read old data outside transaction (Firestore doesn't allow reads
          // from arbitrary docs inside a transaction)
        }
      }
      tx.set(nameRef, { uid: authedUser.uid, username: clean });
      tx.set(db.collection('users').doc(authedUser.uid), {
        username: clean, usernameLower: key, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    
    // If the username was previously used by a different UID, migrate the data
    if (oldUid && oldUid !== authedUser.uid) {
      try {
        const oldDoc = await db.collection('users').doc(oldUid).collection('state').doc('data').get();
        if (oldDoc.exists) {
          cloudData = oldDoc.data();
          // Copy old data to new UID
          await db.collection('users').doc(authedUser.uid).collection('state').doc('data').set(cloudData);
        }
      } catch (e) {
        console.error('Failed to migrate old data:', e);
      }
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
      // Save ALL state fields, not just workouts+logs
      const data = {
        workouts: state.workouts || [],
        logs: state.logs || [],
        username: state.username || '',
        friends: state.friends || [],
        volumeGoal: state.volumeGoal || 0,
        exerciseNotes: state.exerciseNotes || {},
        bodyMeasurements: state.bodyMeasurements || [],
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
      // Filter out server-only fields
      return {
        workouts: d.workouts || [],
        logs: d.logs || [],
        username: d.username || '',
        friends: d.friends || [],
        volumeGoal: d.volumeGoal || 0,
        exerciseNotes: d.exerciseNotes || {},
        bodyMeasurements: d.bodyMeasurements || []
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

  // Latest completed session for each friend, for the Friends feed page.
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