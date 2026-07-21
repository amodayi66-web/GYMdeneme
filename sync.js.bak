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

  if (configured) {
    firebase.initializeApp(cfg);
    auth = firebase.auth();
    db = firebase.firestore();
  }

  function onAuth(cb) { listeners.auth.push(cb); if (user !== null) cb(user, profile); }
  function fireAuth() { listeners.auth.forEach(cb => cb(user, profile)); }

  async function ensureSignedIn() {
    if (!configured) return null;
    if (auth.currentUser) return auth.currentUser;
    const cred = await auth.signInAnonymously();
    return cred.user;
  }

  // Claim a display username (unique, case-insensitive) for the signed-in uid.
  async function claimUsername(username) {
    if (!configured) throw new Error('Sync is not configured yet.');
    const clean = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) throw new Error('Usernames are 3–20 letters, numbers, or _.');
    const authedUser = await ensureSignedIn();
    const key = clean.toLowerCase();
    const nameRef = db.collection('usernames').doc(key);
    await db.runTransaction(async tx => {
      const doc = await tx.get(nameRef);
      // Allow reclaim: if username exists, reassign uid to current user (sign-in)
      // This lets users sign back in on a new device by re-entering their username.
      tx.set(nameRef, { uid: authedUser.uid, username: clean });
      tx.set(db.collection('users').doc(authedUser.uid), {
        username: clean, usernameLower: key, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    user = authedUser;
    profile = { username: clean, uid: authedUser.uid };
    fireAuth();
    return profile;
  }

  async function restoreProfile() {
    if (!configured) return;
    auth.onAuthStateChanged(async u => {
      if (!u) { user = null; profile = null; fireAuth(); return; }
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
    user = null; profile = null; fireAuth();
  }

  // Push the whole local state up to the cloud (debounced by caller).
  async function pushState(state) {
    if (!configured || !user) return;
    await db.collection('users').doc(user.uid).collection('state').doc('data').set({
      workouts: state.workouts, logs: state.logs,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtMs: Date.now()
    });
  }

  async function pullState() {
    if (!configured || !user) return null;
    const doc = await db.collection('users').doc(user.uid).collection('state').doc('data').get();
    return doc.exists ? doc.data() : null;
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
    onAuth, claimUsername, signOut,
    pushState, pullState, subscribeState,
    addFriend, removeFriend, listFriends, friendsFeed
  };
})();
