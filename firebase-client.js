(function () {
  if (window.JMCFirebase) return;

  const localNoticeKey = 'jmc2026_notices';
  let app = null;
  let auth = null;
  let db = null;
  let googleProvider = null;

  function escValue(value) {
    return value == null ? '' : String(value);
  }

  function normalizeDoc(doc) {
    const data = doc.data ? doc.data() : {};
    return { id: doc.id, ...data };
  }

  function normalizeLocalNotices() {
    return JSON.parse(localStorage.getItem(localNoticeKey) || '[]')
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return Number(!!b.pinned) - Number(!!a.pinned);
        return (b.createdAtMs || 0) - (a.createdAtMs || 0);
      });
  }

  function saveLocalNotice(record) {
    const notices = normalizeLocalNotices();
    notices.unshift(record);
    localStorage.setItem(localNoticeKey, JSON.stringify(notices));
  }

  function init() {
    if (!window.firebase || !window.JMC_FIREBASE_CONFIG) {
      return false;
    }
    if (!app) {
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.JMC_FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();
      googleProvider = new firebase.auth.GoogleAuthProvider();
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
    }
    return true;
  }

  async function signUp(email, password, displayName) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const result = await auth.createUserWithEmailAndPassword(email, password);
    if (displayName) await result.user.updateProfile({ displayName });
    await db.collection('users').doc(result.user.uid).set({
      displayName: displayName || '',
      email: result.user.email || email,
      provider: 'password',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return result.user;
  }

  async function signIn(email, password) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signInGoogle() {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const result = await auth.signInWithPopup(googleProvider);
    await db.collection('users').doc(result.user.uid).set({
      displayName: result.user.displayName || '',
      email: result.user.email || '',
      provider: 'google',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return result.user;
  }

  function signOut() {
    if (!init()) return Promise.resolve();
    return auth.signOut();
  }

  function onAuth(callback) {
    if (!init()) {
      callback(null);
      return function () {};
    }
    return auth.onAuthStateChanged(callback);
  }

  function currentUser() {
    return auth ? auth.currentUser : null;
  }

  async function addRegistration(record) {
    if (!init()) {
      return null;
    }
    const user = currentUser();
    return db.collection('registrations').add({
      name: escValue(record.name),
      phone: escValue(record.phone),
      email: escValue(record.email),
      church: escValue(record.church),
      sessions: record.sessions || [],
      note: escValue(record.note),
      userId: user ? user.uid : '',
      userEmail: user ? user.email || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: record.timestamp || new Date().toLocaleString('ko-KR')
    });
  }

  function watchRegistrations(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('registrations')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  function watchNotices(callback, onError) {
    if (!init()) {
      callback(normalizeLocalNotices());
      return function () {};
    }
    return db.collection('notices')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot((snapshot) => {
        const notices = snapshot.docs.map(normalizeDoc).sort((a, b) => {
          if (!!b.pinned !== !!a.pinned) return Number(!!b.pinned) - Number(!!a.pinned);
          const at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
          const bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
          return bt - at;
        });
        callback(notices);
      }, onError || function () {
        callback(normalizeLocalNotices());
      });
  }

  async function createNotice({ title, body, category, pinned }) {
    const record = {
      title: escValue(title).trim(),
      body: escValue(body).trim(),
      category: escValue(category).trim() || '공지',
      pinned: !!pinned,
      createdAtText: new Date().toLocaleString('ko-KR'),
      createdAtMs: Date.now()
    };
    if (!record.title || !record.body) {
      throw new Error('제목과 내용을 입력해 주세요.');
    }
    if (!init()) {
      record.id = String(Date.now());
      saveLocalNotice(record);
      return record;
    }
    const user = currentUser();
    return db.collection('notices').add({
      ...record,
      authorId: user ? user.uid : '',
      authorEmail: user ? user.email || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  async function deleteNotice(id) {
    if (!init()) {
      const notices = normalizeLocalNotices().filter((notice) => notice.id !== id);
      localStorage.setItem(localNoticeKey, JSON.stringify(notices));
      return;
    }
    return db.collection('notices').doc(id).delete();
  }

  window.JMCFirebase = {
    init,
    signUp,
    signIn,
    signInGoogle,
    signOut,
    onAuth,
    currentUser,
    addRegistration,
    watchRegistrations,
    watchNotices,
    createNotice,
    deleteNotice
  };

  init();
})();
