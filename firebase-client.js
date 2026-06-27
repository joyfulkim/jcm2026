(function () {
  if (window.JMCFirebase) return;

  const localNoticeKey = 'jmc2026_notices';
  const localStaffNoticeKey = 'jmc2026_staff_notices';
  let app = null;
  let auth = null;
  let db = null;
  let storage = null;
  let googleProvider = null;

  function escValue(value) {
    return value == null ? '' : String(value);
  }

  function normalizeEmail(value) {
    return escValue(value).trim().toLowerCase();
  }

  function normalizeDoc(doc) {
    const data = doc.data ? doc.data() : {};
    return { id: doc.id, ...data };
  }

  function explicitBoolean(value) {
    return typeof value === 'boolean' ? value : null;
  }

  function mergeUserRecords(records) {
    const merged = {};
    records.filter(Boolean).forEach((record) => {
      const staffValue = explicitBoolean(record.staff);
      const executiveValue = explicitBoolean(record.executive);
      const isExecutiveValue = explicitBoolean(record.isExecutive);
      const subAdminValue = explicitBoolean(record.subAdmin);
      const isSubAdminValue = explicitBoolean(record.isSubAdmin);
      const recordRole = String(record.teamRole || record.role || record.staffRole || '').toLowerCase();
      const recordAdminRole = String(record.adminRole || record.accessRole || '').toLowerCase();
      Object.assign(merged, record);
      if (staffValue != null) merged.staff = staffValue;
      const nextExecutive = executiveValue != null
        ? executiveValue
        : (isExecutiveValue != null ? isExecutiveValue : (recordRole === 'executive' || recordRole === 'chair' ? true : null));
      if (nextExecutive != null) {
        merged.executive = nextExecutive;
        merged.isExecutive = nextExecutive;
        if (!nextExecutive && (merged.teamRole === 'executive' || merged.teamRole === 'chair')) merged.teamRole = '';
      }
      const nextSubAdmin = subAdminValue != null
        ? subAdminValue
        : (isSubAdminValue != null ? isSubAdminValue : (recordAdminRole === 'subadmin' || recordAdminRole === 'sub-admin' ? true : null));
      if (nextSubAdmin != null) {
        merged.subAdmin = nextSubAdmin;
        merged.isSubAdmin = nextSubAdmin;
        if (!nextSubAdmin && (merged.adminRole === 'subadmin' || merged.adminRole === 'sub-admin')) merged.adminRole = '';
      }
      if (nextExecutive !== false) merged.teamRole = merged.teamRole || record.teamRole || record.role || record.staffRole || '';
      if (nextSubAdmin !== false) merged.adminRole = merged.adminRole || record.adminRole || record.accessRole || '';
    });
    return merged;
  }

  function timestampToMs(value) {
    if (!value) return 0;
    if (value.toMillis) return value.toMillis();
    if (value.toDate) return value.toDate().getTime();
    const parsed = Date.parse(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function sortUsers(users) {
    return users.sort((a, b) => {
      const aTime = timestampToMs(a.updatedAt) || timestampToMs(a.createdAt) || timestampToMs(a.updatedAtText) || timestampToMs(a.createdAtText);
      const bTime = timestampToMs(b.updatedAt) || timestampToMs(b.createdAt) || timestampToMs(b.updatedAtText) || timestampToMs(b.createdAtText);
      if (bTime !== aTime) return bTime - aTime;
      return escValue(a.email || a.displayName || a.id).localeCompare(escValue(b.email || b.displayName || b.id));
    });
  }

  function mergeUserList(users) {
    const byEmail = new Map();
    const noEmail = [];
    users.forEach((user) => {
      const email = normalizeEmail(user.email || (String(user.id || '').includes('@') ? user.id : ''));
      const isEmailDoc = email && user.id === email;
      const record = { ...user, email: user.email || email };
      if (!email) {
        noEmail.push(record);
        return;
      }
      const prev = byEmail.get(email);
      if (!prev) {
        byEmail.set(email, record);
        return;
      }
      const preferredId = prev.id === email || isEmailDoc ? email : record.id || prev.id;
      byEmail.set(email, {
        ...mergeUserRecords([prev, record]),
        id: preferredId,
        uid: record.uid || prev.uid || (isEmailDoc ? prev.uid : record.id) || '',
        email
      });
    });
    return sortUsers([...byEmail.values(), ...noEmail]);
  }

  function normalizeLocalNotices() {
    return JSON.parse(localStorage.getItem(localNoticeKey) || '[]')
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return Number(!!b.pinned) - Number(!!a.pinned);
        return (b.createdAtMs || 0) - (a.createdAtMs || 0);
      });
  }

  function normalizeLocalStaffNotices() {
    return JSON.parse(localStorage.getItem(localStaffNoticeKey) || '[]')
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

  function saveLocalStaffNotice(record) {
    const notices = normalizeLocalStaffNotices();
    notices.unshift(record);
    localStorage.setItem(localStaffNoticeKey, JSON.stringify(notices));
  }

  function normalizeNoticeImage(image) {
    if (!image || typeof image.dataUrl !== 'string') return null;
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(image.dataUrl)) return null;
    if (image.dataUrl.length > 700000) {
      throw new Error('이미지 용량이 큽니다. 더 작은 이미지를 첨부해 주세요.');
    }
    return {
      dataUrl: image.dataUrl,
      name: escValue(image.name).slice(0, 120),
      type: escValue(image.type) || 'image/jpeg',
      width: Number(image.width) || 0,
      height: Number(image.height) || 0,
      size: Number(image.size) || 0
    };
  }

  function init() {
    if (!window.firebase || !window.JMC_FIREBASE_CONFIG) {
      return false;
    }
    if (!app) {
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.JMC_FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();
      storage = firebase.storage ? firebase.storage() : null;
      googleProvider = new firebase.auth.GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
    }
    return true;
  }

  function providerFromUser(user, fallback) {
    const providerId = user && user.providerData && user.providerData[0] ? user.providerData[0].providerId : '';
    if (providerId === 'google.com') return 'google';
    if (providerId === 'password') return 'password';
    return fallback || providerId || '';
  }

  async function ensureUserDocument(user, provider) {
    if (!init() || !user) return null;
    const ref = db.collection('users').doc(user.uid);
    let existing = null;
    try {
      const snap = await ref.get();
      existing = snap.exists ? snap.data() : null;
    } catch (err) {
      existing = null;
    }
    const record = {
      displayName: user.displayName || (existing && existing.displayName) || '',
      email: user.email || (existing && existing.email) || '',
      provider: providerFromUser(user, provider || (existing && existing.provider)),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    };
    if (!existing) {
      record.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      record.createdAtText = new Date().toLocaleString('ko-KR');
    }
    await ref.set(record, { merge: true });
    return record;
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
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR'),
      updatedAtText: new Date().toLocaleString('ko-KR')
    }, { merge: true });
    return result.user;
  }

  async function signIn(email, password) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signInGoogle() {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    let result;
    try {
      result = await auth.signInWithPopup(googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        await auth.signInWithRedirect(googleProvider);
        return null;
      }
      throw err;
    }
    if (!result || !result.user) return null;
    await ensureUserDocument(result.user, 'google');
    return result.user;
  }

  async function finishRedirectSignIn() {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const result = await auth.getRedirectResult();
    if (!result || !result.user) return null;
    await ensureUserDocument(result.user, 'google');
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
    return auth.onAuthStateChanged((user) => {
      if (!user) {
        callback(null);
        return;
      }
      ensureUserDocument(user).then(() => {
        callback(user);
      }).catch(() => {
        callback(user);
      });
    });
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

  async function createNotice({ title, body, category, pinned, image }) {
    const record = {
      title: escValue(title).trim(),
      body: escValue(body).trim(),
      category: escValue(category).trim() || '공지',
      pinned: !!pinned,
      image: normalizeNoticeImage(image),
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

  function watchStaffNotices(callback, onError) {
    if (!init()) {
      callback(normalizeLocalStaffNotices());
      return function () {};
    }
    return db.collection('staffNotices')
      .orderBy('createdAt', 'desc')
      .limit(40)
      .onSnapshot((snapshot) => {
        const notices = snapshot.docs.map(normalizeDoc).sort((a, b) => {
          if (!!b.pinned !== !!a.pinned) return Number(!!b.pinned) - Number(!!a.pinned);
          const at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
          const bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
          return bt - at;
        });
        callback(notices);
      }, onError || function () {
        callback(normalizeLocalStaffNotices());
      });
  }

  async function createStaffNotice({ title, body, category, pinned, image }) {
    const record = {
      title: escValue(title).trim(),
      body: escValue(body).trim(),
      category: escValue(category).trim() || '스탭 공지',
      pinned: !!pinned,
      image: normalizeNoticeImage(image),
      createdAtText: new Date().toLocaleString('ko-KR'),
      createdAtMs: Date.now()
    };
    if (!record.title || !record.body) {
      throw new Error('제목과 내용을 입력해 주세요.');
    }
    if (!init()) {
      record.id = String(Date.now());
      saveLocalStaffNotice(record);
      return record;
    }
    const user = currentUser();
    return db.collection('staffNotices').add({
      ...record,
      authorId: user ? user.uid : '',
      authorEmail: user ? user.email || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  async function deleteStaffNotice(id) {
    if (!init()) {
      const notices = normalizeLocalStaffNotices().filter((notice) => notice.id !== id);
      localStorage.setItem(localStaffNoticeKey, JSON.stringify(notices));
      return;
    }
    return db.collection('staffNotices').doc(id).delete();
  }

  function isAdminEmail(email) {
    return String(email || '').toLowerCase() === 'kms@jfm.kr';
  }

  async function getCurrentUserProfile() {
    if (!init()) return null;
    const user = currentUser();
    if (!user) return null;
    const emailId = normalizeEmail(user.email);
    const doc = await db.collection('users').doc(user.uid).get();
    const emailDoc = emailId && emailId !== user.uid
      ? await db.collection('users').doc(emailId).get()
      : null;
    const merged = mergeUserRecords([
      emailDoc && emailDoc.exists ? emailDoc.data() : null,
      doc.exists ? doc.data() : null
    ]);
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      isAdmin: isAdminEmail(user.email),
      ...merged
    };
  }

  function watchUsers(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('users')
      .onSnapshot((snapshot) => {
        callback(mergeUserList(snapshot.docs.map(normalizeDoc)));
      }, onError || function () {});
  }

  async function setUserStaff(userId, staff) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    return db.collection('users').doc(userId).set({
      staff: !!staff,
      staffUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      staffUpdatedBy: user ? user.email || user.uid : '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    }, { merge: true });
  }

  async function setUserExecutive(userId, executive) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    const enabled = !!executive;
    const record = {
      executive: enabled,
      isExecutive: enabled ? true : firebase.firestore.FieldValue.delete(),
      teamRole: enabled ? 'executive' : firebase.firestore.FieldValue.delete(),
      roleLabel: enabled ? '실행위원' : firebase.firestore.FieldValue.delete(),
      executiveUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      executiveUpdatedBy: user ? user.email || user.uid : '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    };
    if (enabled) {
      record.staff = true;
      record.staffUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
      record.staffUpdatedBy = user ? user.email || user.uid : '';
    }
    return db.collection('users').doc(userId).set(record, { merge: true });
  }

  async function setUserSubAdmin(userId, subAdmin) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    const enabled = !!subAdmin;
    const record = {
      subAdmin: enabled,
      adminRole: enabled ? 'subadmin' : firebase.firestore.FieldValue.delete(),
      subAdminUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      subAdminUpdatedBy: user ? user.email || user.uid : '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    };
    if (enabled) {
      record.staff = true;
      record.staffUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
      record.staffUpdatedBy = user ? user.email || user.uid : '';
    }
    return db.collection('users').doc(userId).set(record, { merge: true });
  }

  function sanitizeFileName(fileName) {
    return escValue(fileName || 'staff-resource')
      .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
      .replace(/\s+/g, '_')
      .slice(0, 140) || 'staff-resource';
  }

  function formatBytes(size) {
    const value = Number(size) || 0;
    if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(1)}GB`;
    if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)}MB`;
    if (value >= 1024) return `${Math.round(value / 1024)}KB`;
    return `${value}B`;
  }

  function assertStaffUploadFile(file) {
    if (!file) throw new Error('업로드할 파일을 선택해 주세요.');
    if (file.size > 500 * 1024 * 1024) {
      throw new Error('500MB 이하 파일만 업로드할 수 있습니다.');
    }
  }

  function assertStaffBodyImage(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type || '')) {
      throw new Error('본문 이미지는 JPG, PNG, WebP, GIF 형식만 업로드할 수 있습니다.');
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('본문 이미지는 20MB 이하로 업로드해 주세요.');
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
      reader.readAsDataURL(file);
    });
  }

  function normalizeFallbackFile(file, dataUrl) {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      throw new Error('파일 형식을 확인해 주세요.');
    }
    return {
      dataUrl,
      name: escValue(file.name || 'staff-resource').slice(0, 160),
      type: escValue(file.type || 'application/octet-stream'),
      size: Number(file.size) || 0
    };
  }

  function makeStoragePath(kind, file, uid) {
    const safeName = sanitizeFileName(file && file.name);
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `staff-resources/${uid || 'admin'}/${kind}/${stamp}-${safeName}`;
  }

  function uploadStorageFile(file, path, onProgress, progressStart, progressSpan) {
    if (!storage) throw new Error('Firebase Storage가 아직 준비되지 않았습니다. Firebase Console에서 Storage를 먼저 활성화해 주세요.');
    const uploadTask = storage.ref().child(path).put(file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: escValue(file.name || '')
      }
    });
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', (snapshot) => {
        const itemPercent = snapshot.totalBytes
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          : 0;
        if (typeof onProgress === 'function') {
          onProgress(Math.min(99, Math.round(progressStart + (itemPercent * progressSpan))));
        }
      }, reject, async () => {
        try {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          resolve({
            path,
            downloadURL,
            name: escValue(file.name || '').slice(0, 160),
            type: escValue(file.type || 'application/octet-stream'),
            size: Number(file.size) || 0
          });
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async function createFallbackStaffResource({ cleanTitle, description, file, bodyImage, user, onProgress }) {
    if (file.size > 650 * 1024) {
      throw new Error('500MB 업로드는 Firebase Storage 활성화 후 사용할 수 있습니다. 현재 프로젝트에서 Storage가 아직 설정되지 않아 650KB 이하 파일만 임시 업로드할 수 있습니다.');
    }
    if (bodyImage && bodyImage.size > 250 * 1024) {
      throw new Error('Firebase Storage 활성화 전에는 본문 이미지를 250KB 이하로 첨부해 주세요.');
    }
    const fileDataUrl = await readFileAsDataUrl(file);
    const bodyImageDataUrl = bodyImage ? await readFileAsDataUrl(bodyImage) : '';
    if (fileDataUrl.length + bodyImageDataUrl.length > 900000) {
      throw new Error('Firebase Storage 활성화 전에는 파일과 본문 이미지 합계가 너무 크면 업로드할 수 없습니다.');
    }
    if (typeof onProgress === 'function') onProgress(98);
    return db.collection('staffResources').add({
      title: cleanTitle,
      description: escValue(description).trim(),
      fileName: file.name || 'staff-resource',
      fileType: file.type || 'application/octet-stream',
      fileSize: Number(file.size) || 0,
      fileSizeText: formatBytes(file.size),
      file: normalizeFallbackFile(file, fileDataUrl),
      bodyImage: bodyImage ? {
        downloadURL: bodyImageDataUrl,
        fileName: bodyImage.name || 'body-image',
        fileType: bodyImage.type || 'image/jpeg',
        fileSize: Number(bodyImage.size) || 0,
        fileSizeText: formatBytes(bodyImage.size)
      } : null,
      storageFallback: true,
      uploaderId: user ? user.uid : '',
      uploaderEmail: user ? user.email || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR')
    }).then((docRef) => {
      if (typeof onProgress === 'function') onProgress(100);
      return docRef;
    });
  }

  async function createStaffResource({ title, description, file, bodyImage, onProgress }) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    assertStaffUploadFile(file);
    assertStaffBodyImage(bodyImage);
    const cleanTitle = escValue(title).trim() || file.name || '스탭 자료';
    const user = currentUser();
    const uid = user ? user.uid : 'admin';
    if (typeof onProgress === 'function') onProgress(0);
    let fileUpload = null;
    let bodyImageUpload = null;
    try {
      fileUpload = await uploadStorageFile(file, makeStoragePath('files', file, uid), onProgress, 0, bodyImage ? 82 : 96);
      if (bodyImage) {
        bodyImageUpload = await uploadStorageFile(bodyImage, makeStoragePath('body-images', bodyImage, uid), onProgress, 82, 14);
      }
    } catch (err) {
      if (typeof onProgress === 'function') onProgress(0);
      return createFallbackStaffResource({ cleanTitle, description, file, bodyImage, user, onProgress });
    }
    return db.collection('staffResources').add({
      title: cleanTitle,
      description: escValue(description).trim(),
      fileName: file.name || fileUpload.name || 'staff-resource',
      fileType: file.type || 'application/octet-stream',
      fileSize: Number(file.size) || 0,
      fileSizeText: formatBytes(file.size),
      storagePath: fileUpload.path,
      downloadURL: fileUpload.downloadURL,
      bodyImage: bodyImageUpload ? {
        storagePath: bodyImageUpload.path,
        downloadURL: bodyImageUpload.downloadURL,
        fileName: bodyImageUpload.name,
        fileType: bodyImageUpload.type,
        fileSize: bodyImageUpload.size,
        fileSizeText: formatBytes(bodyImageUpload.size)
      } : null,
      uploaderId: user ? user.uid : '',
      uploaderEmail: user ? user.email || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR')
    }).then((docRef) => {
      if (typeof onProgress === 'function') onProgress(100);
      return docRef;
    });
  }

  function watchStaffResources(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('staffResources')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  async function getStaffResourceDownloadURL(resource) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    if (resource && resource.file && typeof resource.file.dataUrl === 'string') {
      return resource.file.dataUrl;
    }
    if (resource && resource.downloadURL) {
      return resource.downloadURL;
    }
    const storagePath = typeof resource === 'string' ? resource : resource && resource.storagePath;
    if (!storage) throw new Error('Firebase Storage가 아직 준비되지 않았습니다.');
    return storage.ref().child(storagePath).getDownloadURL();
  }

  async function deleteStaffResource(resource) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const id = typeof resource === 'string' ? resource : resource && resource.id;
    const storagePath = typeof resource === 'object' ? resource.storagePath : '';
    const bodyImagePath = typeof resource === 'object' && resource.bodyImage ? resource.bodyImage.storagePath : '';
    if (storage && storagePath) {
      await storage.ref().child(storagePath).delete().catch(() => {});
    }
    if (storage && bodyImagePath) {
      await storage.ref().child(bodyImagePath).delete().catch(() => {});
    }
    return db.collection('staffResources').doc(id).delete();
  }

  function assertReceiptImage(file) {
    if (!file) throw new Error('영수증 사진을 선택해 주세요.');
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type || '')) {
      throw new Error('영수증 사진은 JPG, PNG, WebP, GIF 형식만 업로드할 수 있습니다.');
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('영수증 사진은 25MB 이하로 업로드해 주세요.');
    }
  }

  function makeExpenseProofStoragePath(file, uid) {
    const safeName = sanitizeFileName(file && file.name);
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `expense-proofs/${uid || 'staff'}/${stamp}-${safeName}`;
  }

  function cleanExpenseProof(record) {
    const clean = {
      title: escValue(record.title).trim(),
      teamName: escValue(record.teamName).trim(),
      spenderName: escValue(record.spenderName).trim(),
      expenseDate: escValue(record.expenseDate).trim(),
      amount: escValue(record.amount).replace(/[^\d]/g, '').slice(0, 14),
      category: escValue(record.category).trim(),
      vendor: escValue(record.vendor).trim(),
      paymentMethod: escValue(record.paymentMethod).trim(),
      purpose: escValue(record.purpose).trim(),
      budgetRef: escValue(record.budgetRef).trim(),
      note: escValue(record.note).trim()
    };
    if (!clean.title || !clean.teamName || !clean.spenderName || !clean.amount || !clean.purpose) {
      throw new Error('제목, 팀명, 지출자, 금액, 사용 목적은 반드시 입력해 주세요.');
    }
    return clean;
  }

  async function createFallbackExpenseProof({ clean, receiptFile, user, onProgress }) {
    if (receiptFile.size > 650 * 1024) {
      throw new Error('Firebase Storage 활성화 전에는 650KB 이하 영수증 사진만 임시 업로드할 수 있습니다.');
    }
    const dataUrl = await readFileAsDataUrl(receiptFile);
    if (typeof onProgress === 'function') onProgress(98);
    return db.collection('expenseProofs').add({
      ...clean,
      amountNumber: Number(clean.amount) || 0,
      receiptImage: {
        downloadURL: dataUrl,
        dataUrl,
        fileName: receiptFile.name || 'receipt',
        fileType: receiptFile.type || 'image/jpeg',
        fileSize: Number(receiptFile.size) || 0,
        fileSizeText: formatBytes(receiptFile.size)
      },
      storageFallback: true,
      status: 'submitted',
      statusLabel: '제출됨',
      comments: [],
      uploaderId: user ? user.uid : '',
      uploaderEmail: user ? user.email || '' : '',
      uploaderName: user ? user.displayName || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR'),
      updatedAtText: new Date().toLocaleString('ko-KR')
    }).then((docRef) => {
      if (typeof onProgress === 'function') onProgress(100);
      return docRef;
    });
  }

  async function createExpenseProof({ title, teamName, spenderName, expenseDate, amount, category, vendor, paymentMethod, purpose, budgetRef, note, receiptFile, onProgress }) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    assertReceiptImage(receiptFile);
    const clean = cleanExpenseProof({ title, teamName, spenderName, expenseDate, amount, category, vendor, paymentMethod, purpose, budgetRef, note });
    const user = currentUser();
    const uid = user ? user.uid : 'staff';
    if (typeof onProgress === 'function') onProgress(0);
    let upload = null;
    try {
      upload = await uploadStorageFile(receiptFile, makeExpenseProofStoragePath(receiptFile, uid), onProgress, 0, 96);
    } catch (err) {
      if (typeof onProgress === 'function') onProgress(0);
      return createFallbackExpenseProof({ clean, receiptFile, user, onProgress });
    }
    return db.collection('expenseProofs').add({
      ...clean,
      amountNumber: Number(clean.amount) || 0,
      receiptImage: {
        storagePath: upload.path,
        downloadURL: upload.downloadURL,
        fileName: upload.name,
        fileType: upload.type,
        fileSize: upload.size,
        fileSizeText: formatBytes(upload.size)
      },
      storageFallback: false,
      status: 'submitted',
      statusLabel: '제출됨',
      comments: [],
      uploaderId: user ? user.uid : '',
      uploaderEmail: user ? user.email || '' : '',
      uploaderName: user ? user.displayName || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR'),
      updatedAtText: new Date().toLocaleString('ko-KR')
    }).then((docRef) => {
      if (typeof onProgress === 'function') onProgress(100);
      return docRef;
    });
  }

  function watchExpenseProofs(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('expenseProofs')
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  function expenseProofComment(body, status) {
    const cleanBody = escValue(body).trim();
    if (!cleanBody) throw new Error('댓글 내용을 입력해 주세요.');
    const cleanStatus = escValue(status).trim();
    const labels = {
      comment: '댓글',
      verified: '확인 완료',
      revision_requested: '보완 요청'
    };
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      status: labels[cleanStatus] ? cleanStatus : 'comment',
      label: labels[cleanStatus] || '댓글',
      body: cleanBody.slice(0, 3000),
      atMs: Date.now(),
      atText: new Date().toLocaleString('ko-KR'),
      actorId: currentUser() ? currentUser().uid : '',
      actorEmail: currentUser() ? currentUser().email || '' : '',
      actorName: currentUser() ? currentUser().displayName || '' : ''
    };
  }

  async function addExpenseProofComment(id, { body, status }) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const ref = db.collection('expenseProofs').doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new Error('지출 증빙을 찾지 못했습니다.');
    const current = snapshot.data() || {};
    const entry = expenseProofComment(body, status);
    const comments = Array.isArray(current.comments) ? current.comments.slice(-119) : [];
    comments.push(entry);
    const updates = {
      comments,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    };
    if (entry.status === 'verified' || entry.status === 'revision_requested') {
      updates.status = entry.status;
      updates.statusLabel = entry.label;
      updates.verifiedAtText = entry.status === 'verified' ? entry.atText : current.verifiedAtText || '';
      updates.verifiedByEmail = entry.status === 'verified' ? entry.actorEmail : current.verifiedByEmail || '';
    }
    return ref.update(updates);
  }

  function cleanConferenceBudgetRow(record) {
    const clean = {
      category: escValue(record.category).trim().slice(0, 80),
      item: escValue(record.item).trim().slice(0, 160),
      detail: escValue(record.detail).trim().slice(0, 1000),
      budgetAmount: Number(cleanMoney(record.budgetAmount)) || 0,
      executedAmount: Number(cleanMoney(record.executedAmount)) || 0,
      settlementAmount: Number(cleanMoney(record.settlementAmount)) || 0,
      note: escValue(record.note).trim().slice(0, 1000),
      sortOrder: Number(record.sortOrder) || 0
    };
    if (!clean.category || !clean.item) {
      throw new Error('구분과 지출항목은 반드시 입력해 주세요.');
    }
    clean.balanceAmount = clean.budgetAmount - (clean.settlementAmount || clean.executedAmount);
    return clean;
  }

  function cleanConferenceBudgetRowId(id) {
    return escValue(id).trim().replace(/[^\w-]/g, '').slice(0, 90);
  }

  async function saveConferenceBudgetRow(record) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const clean = cleanConferenceBudgetRow(record || {});
    const cleanId = cleanConferenceBudgetRowId(record && record.id);
    const ref = cleanId ? db.collection('conferenceBudgetRows').doc(cleanId) : db.collection('conferenceBudgetRows').doc();
    const snapshot = await ref.get();
    const user = currentUser();
    return ref.set({
      ...clean,
      ...(snapshot.exists ? {} : {
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdAtText: new Date().toLocaleString('ko-KR')
      }),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR'),
      updatedById: user ? user.uid : '',
      updatedByEmail: user ? user.email || '' : '',
      updatedByName: user ? user.displayName || '' : ''
    }, { merge: true });
  }

  async function seedConferenceBudgetRows(rows) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    const batch = db.batch();
    (Array.isArray(rows) ? rows : []).forEach((row, index) => {
      const clean = cleanConferenceBudgetRow({
        ...row,
        sortOrder: row.sortOrder || (index + 1) * 10
      });
      const cleanId = cleanConferenceBudgetRowId(row.id) || db.collection('conferenceBudgetRows').doc().id;
      const ref = db.collection('conferenceBudgetRows').doc(cleanId);
      batch.set(ref, {
        ...clean,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdAtText: new Date().toLocaleString('ko-KR'),
        updatedAtText: new Date().toLocaleString('ko-KR'),
        updatedById: user ? user.uid : '',
        updatedByEmail: user ? user.email || '' : '',
        updatedByName: user ? user.displayName || '' : ''
      }, { merge: true });
    });
    return batch.commit();
  }

  function watchConferenceBudgetRows(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('conferenceBudgetRows')
      .orderBy('sortOrder', 'asc')
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  async function deleteConferenceBudgetRow(id) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const cleanId = cleanConferenceBudgetRowId(id);
    if (!cleanId) throw new Error('삭제할 예산 항목을 찾지 못했습니다.');
    return db.collection('conferenceBudgetRows').doc(cleanId).delete();
  }

  function cleanEventCueSheetId(id) {
    return escValue(id).trim().replace(/[^a-z0-9-]/gi, '').slice(0, 60);
  }

  function cleanEventCueSheetRows(rows) {
    return (Array.isArray(rows) ? rows : []).slice(0, 80).map((row) => ({
      time: escValue(row.time).trim().slice(0, 30),
      cue: escValue(row.cue).trim().slice(0, 160),
      action: escValue(row.action).trim().slice(0, 1200)
    })).filter((row) => row.time || row.cue || row.action);
  }

  function watchEventCueSheets(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('eventCueSheets')
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  async function saveEventCueSheet(id, record) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const cleanId = cleanEventCueSheetId(id);
    if (!cleanId) throw new Error('저장할 큐시트 행사를 찾지 못했습니다.');
    const user = currentUser();
    const rows = cleanEventCueSheetRows(record && record.rows);
    if (!rows.length) throw new Error('저장할 큐시트 내용이 없습니다.');
    return db.collection('eventCueSheets').doc(cleanId).set({
      title: escValue(record && record.title).trim().slice(0, 120),
      rows,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR'),
      updatedById: user ? user.uid : '',
      updatedByEmail: user ? user.email || '' : '',
      updatedByName: user ? user.displayName || '' : ''
    }, { merge: true });
  }

  function approvalActor() {
    const user = currentUser();
    return {
      actorId: user ? user.uid : '',
      actorEmail: user ? user.email || '' : '',
      actorName: user ? user.displayName || '' : ''
    };
  }

  function approvalHistoryEntry(action, label, note) {
    return {
      action: escValue(action),
      label: escValue(label),
      note: escValue(note).trim(),
      atMs: Date.now(),
      atText: new Date().toLocaleString('ko-KR'),
      ...approvalActor()
    };
  }

  function cleanApprovalRequest(record) {
    const clean = {
      documentType: escValue(record.documentType || 'report').trim() || 'report',
      teamName: escValue(record.teamName).trim(),
      teamLeadName: escValue(record.teamLeadName).trim(),
      teamLeadEmail: escValue(record.teamLeadEmail).trim(),
      title: escValue(record.title).trim(),
      reportType: escValue(record.reportType).trim() || '운영 보고',
      reportDate: escValue(record.reportDate || record.dueDate).trim(),
      reportFindings: escValue(record.reportFindings || record.budgetBreakdown).trim(),
      reportSummary: escValue(record.reportSummary || record.workPlan).trim(),
      reportNextSteps: escValue(record.reportNextSteps).trim(),
      reportAttachmentUrl: escValue(record.reportAttachmentUrl).trim(),
      assignedExecutive: escValue(record.assignedExecutive).trim(),
      note: escValue(record.note).trim()
    };
    if (!clean.teamName || !clean.teamLeadName || !clean.title || !clean.reportSummary) {
      throw new Error('팀명, 작성자, 보고서 제목, 보고 요약은 반드시 입력해 주세요.');
    }
    return clean;
  }

  async function createApprovalRequest(record) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    const clean = cleanApprovalRequest(record || {});
    const history = [approvalHistoryEntry('created', '보고서 결재 요청', clean.note)];
    return db.collection('approvalRequests').add({
      ...clean,
      status: 'executive_review',
      statusLabel: '담당 실행위원 검토',
      chairRequested: false,
      finalApproved: false,
      requesterId: user ? user.uid : '',
      requesterEmail: user ? user.email || '' : clean.teamLeadEmail,
      requesterName: user ? user.displayName || '' : clean.teamLeadName,
      history,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR'),
      updatedAtText: new Date().toLocaleString('ko-KR')
    });
  }

  function watchApprovalRequests(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('approvalRequests')
      .orderBy('updatedAt', 'desc')
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  async function updateApprovalRequestStatus(id, status, note) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const labels = {
      executive_review: '담당 실행위원 검토',
      revision_requested: '보완 요청',
      chair_review: '실행위원장 승인 요청',
      final_approved: '최종 승인',
      rejected: '반려'
    };
    const actions = {
      executive_review: 'resubmitted',
      revision_requested: 'revision_requested',
      chair_review: 'executive_approved',
      final_approved: 'chair_approved',
      rejected: 'rejected'
    };
    const cleanStatus = escValue(status);
    if (!labels[cleanStatus]) throw new Error('알 수 없는 결재 상태입니다.');
    const ref = db.collection('approvalRequests').doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new Error('결재 문서를 찾지 못했습니다.');
    const current = snapshot.data() || {};
    const history = Array.isArray(current.history) ? current.history.slice(0, 80) : [];
    history.push(approvalHistoryEntry(actions[cleanStatus], labels[cleanStatus], note));
    return ref.update({
      status: cleanStatus,
      statusLabel: labels[cleanStatus],
      chairRequested: cleanStatus === 'chair_review' || cleanStatus === 'final_approved',
      finalApproved: cleanStatus === 'final_approved',
      history,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    });
  }

  async function deleteApprovalRequest(id) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    return db.collection('approvalRequests').doc(id).delete();
  }

  const teamReportConfirmationLabels = {
    leader: '팀장 확인',
    executive: '실행위원 확인',
    chair: '실행위원장 확인'
  };

  function emptyTeamReportConfirmations() {
    return {
      leader: { checked: false, label: teamReportConfirmationLabels.leader },
      executive: { checked: false, label: teamReportConfirmationLabels.executive },
      chair: { checked: false, label: teamReportConfirmationLabels.chair }
    };
  }

  function normalizeTeamReportConfirmations(confirmations) {
    const base = emptyTeamReportConfirmations();
    Object.keys(base).forEach((key) => {
      if (confirmations && confirmations[key]) {
        base[key] = {
          ...base[key],
          ...confirmations[key],
          checked: !!confirmations[key].checked
        };
      }
    });
    return base;
  }

  function teamReportActor() {
    const user = currentUser();
    return {
      actorId: user ? user.uid : '',
      actorEmail: user ? user.email || '' : '',
      actorName: user ? user.displayName || '' : ''
    };
  }

  function cleanTeamReport(record) {
    const clean = {
      title: escValue(record.title).trim(),
      teamName: escValue(record.teamName).trim(),
      assignedExecutive: escValue(record.assignedExecutive).trim(),
      teamLeaderName: escValue(record.teamLeaderName).trim(),
      reportDate: escValue(record.reportDate).trim(),
      progressStatus: escValue(record.progressStatus).trim(),
      supportNeeded: escValue(record.supportNeeded).trim(),
      issues: escValue(record.issues).trim(),
      nextSchedule: escValue(record.nextSchedule).trim()
    };
    if (!clean.title || !clean.teamName || !clean.teamLeaderName || !clean.progressStatus) {
      throw new Error('제목, 팀명, 팀장, 현재 진행 상황은 반드시 입력해 주세요.');
    }
    return clean;
  }

  function makeTeamReportComment(body, reviewRole) {
    const cleanBody = escValue(body).trim();
    if (!cleanBody) throw new Error('댓글 내용을 입력해 주세요.');
    const cleanRole = escValue(reviewRole).trim();
    const role = teamReportConfirmationLabels[cleanRole] ? cleanRole : 'comment';
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      body: cleanBody.slice(0, 3000),
      reviewRole: role,
      reviewLabel: teamReportConfirmationLabels[role] || '댓글',
      atMs: Date.now(),
      atText: new Date().toLocaleString('ko-KR'),
      ...teamReportActor()
    };
  }

  async function createTeamReport(record) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    const clean = cleanTeamReport(record || {});
    return db.collection('teamReports').add({
      ...clean,
      authorId: user ? user.uid : '',
      authorEmail: user ? user.email || '' : '',
      authorName: user ? user.displayName || '' : '',
      confirmations: emptyTeamReportConfirmations(),
      comments: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR'),
      updatedAtText: new Date().toLocaleString('ko-KR')
    });
  }

  function watchTeamReports(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('teamReports')
      .orderBy('updatedAt', 'desc')
      .limit(80)
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  async function addTeamReportComment(id, { body, reviewRole }) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const ref = db.collection('teamReports').doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new Error('팀보고서를 찾지 못했습니다.');
    const current = snapshot.data() || {};
    const entry = makeTeamReportComment(body, reviewRole);
    const comments = Array.isArray(current.comments) ? current.comments.slice(-119) : [];
    const confirmations = normalizeTeamReportConfirmations(current.confirmations);
    comments.push(entry);
    if (teamReportConfirmationLabels[entry.reviewRole]) {
      confirmations[entry.reviewRole] = {
        checked: true,
        label: teamReportConfirmationLabels[entry.reviewRole],
        commentId: entry.id,
        body: entry.body,
        atMs: entry.atMs,
        atText: entry.atText,
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        actorName: entry.actorName
      };
    }
    return ref.update({
      comments,
      confirmations,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    });
  }

  const teamBudgetStatusLabels = {
    leader_requested: '팀장 청구',
    executive_approved: '실행위원 승인',
    chair_approved: '실행위원장 결재',
    executed: '집행 완료',
    revision_requested: '보완 요청',
    rejected: '반려'
  };

  const teamBudgetActionLabels = {
    comment: '댓글',
    leader_requested: '팀장 청구',
    executive_approved: '실행위원 승인',
    chair_approved: '실행위원장 결재',
    executed: '집행 완료',
    revision_requested: '보완 요청',
    rejected: '반려'
  };

  function budgetActor() {
    const user = currentUser();
    return {
      actorId: user ? user.uid : '',
      actorEmail: user ? user.email || '' : '',
      actorName: user ? user.displayName || '' : ''
    };
  }

  function emptyTeamBudgetWorkflow(requestEntry) {
    return {
      leader_requested: {
        checked: true,
        label: teamBudgetStatusLabels.leader_requested,
        ...(requestEntry || {})
      },
      executive_approved: { checked: false, label: teamBudgetStatusLabels.executive_approved },
      chair_approved: { checked: false, label: teamBudgetStatusLabels.chair_approved },
      executed: { checked: false, label: teamBudgetStatusLabels.executed }
    };
  }

  function normalizeTeamBudgetWorkflow(workflow, requestEntry) {
    const base = emptyTeamBudgetWorkflow(requestEntry);
    Object.keys(base).forEach((key) => {
      if (workflow && workflow[key]) {
        base[key] = {
          ...base[key],
          ...workflow[key],
          checked: !!workflow[key].checked
        };
      }
    });
    return base;
  }

  function cleanMoney(value) {
    return escValue(value).replace(/[^\d]/g, '').slice(0, 14);
  }

  function cleanTeamBudgetRequest(record) {
    const clean = {
      title: escValue(record.title).trim(),
      teamName: escValue(record.teamName).trim(),
      assignedExecutive: escValue(record.assignedExecutive).trim(),
      teamLeaderName: escValue(record.teamLeaderName).trim(),
      requestDate: escValue(record.requestDate).trim(),
      requiredDate: escValue(record.requiredDate).trim(),
      amount: cleanMoney(record.amount),
      category: escValue(record.category).trim(),
      payee: escValue(record.payee).trim(),
      paymentMethod: escValue(record.paymentMethod).trim(),
      accountInfo: escValue(record.accountInfo).trim(),
      requestReason: escValue(record.requestReason).trim(),
      budgetBreakdown: escValue(record.budgetBreakdown).trim(),
      attachmentUrl: escValue(record.attachmentUrl).trim()
    };
    if (!clean.title || !clean.teamName || !clean.teamLeaderName || !clean.amount || !clean.requestReason) {
      throw new Error('제목, 팀명, 팀장, 청구 금액, 청구 사유는 반드시 입력해 주세요.');
    }
    return clean;
  }

  function makeTeamBudgetEntry(body, action) {
    const cleanBody = escValue(body).trim();
    if (!cleanBody) throw new Error('처리 메모 또는 댓글 내용을 입력해 주세요.');
    const cleanAction = escValue(action).trim();
    const normalizedAction = teamBudgetActionLabels[cleanAction] ? cleanAction : 'comment';
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      action: normalizedAction,
      label: teamBudgetActionLabels[normalizedAction],
      body: cleanBody.slice(0, 3000),
      atMs: Date.now(),
      atText: new Date().toLocaleString('ko-KR'),
      ...budgetActor()
    };
  }

  async function createTeamBudgetRequest(record) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const user = currentUser();
    const clean = cleanTeamBudgetRequest(record || {});
    const entry = makeTeamBudgetEntry(clean.requestReason, 'leader_requested');
    entry.label = teamBudgetStatusLabels.leader_requested;
    const requestEntry = {
      checked: true,
      label: teamBudgetStatusLabels.leader_requested,
      commentId: entry.id,
      body: entry.body,
      atMs: entry.atMs,
      atText: entry.atText,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorName: entry.actorName
    };
    return db.collection('teamBudgets').add({
      ...clean,
      amountNumber: Number(clean.amount) || 0,
      status: 'leader_requested',
      statusLabel: teamBudgetStatusLabels.leader_requested,
      workflow: emptyTeamBudgetWorkflow(requestEntry),
      history: [entry],
      authorId: user ? user.uid : '',
      authorEmail: user ? user.email || '' : '',
      authorName: user ? user.displayName || '' : '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtText: new Date().toLocaleString('ko-KR'),
      updatedAtText: new Date().toLocaleString('ko-KR')
    });
  }

  function watchTeamBudgetRequests(callback, onError) {
    if (!init()) {
      callback([]);
      return function () {};
    }
    return db.collection('teamBudgets')
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .onSnapshot((snapshot) => {
        callback(snapshot.docs.map(normalizeDoc));
      }, onError || function () {});
  }

  async function updateTeamBudgetRequest(id, { action, body }) {
    if (!init()) throw new Error('Firebase가 아직 준비되지 않았습니다.');
    const ref = db.collection('teamBudgets').doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new Error('예산 청구서를 찾지 못했습니다.');
    const current = snapshot.data() || {};
    const entry = makeTeamBudgetEntry(body, action);
    const history = Array.isArray(current.history) ? current.history.slice(-119) : [];
    const workflow = normalizeTeamBudgetWorkflow(current.workflow);
    const updates = {
      history: history.concat(entry),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAtText: new Date().toLocaleString('ko-KR')
    };
    if (teamBudgetStatusLabels[entry.action]) {
      updates.status = entry.action;
      updates.statusLabel = teamBudgetStatusLabels[entry.action];
    }
    if (workflow[entry.action]) {
      workflow[entry.action] = {
        checked: true,
        label: teamBudgetStatusLabels[entry.action],
        commentId: entry.id,
        body: entry.body,
        atMs: entry.atMs,
        atText: entry.atText,
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        actorName: entry.actorName
      };
      updates.workflow = workflow;
    } else {
      updates.workflow = workflow;
    }
    return ref.update(updates);
  }

  window.JMCFirebase = {
    init,
    signUp,
    signIn,
    signInGoogle,
    finishRedirectSignIn,
    signOut,
    onAuth,
    currentUser,
    addRegistration,
    watchRegistrations,
    watchNotices,
    createNotice,
    deleteNotice,
    watchStaffNotices,
    createStaffNotice,
    deleteStaffNotice,
    isAdminEmail,
    getCurrentUserProfile,
    watchUsers,
    setUserStaff,
    setUserExecutive,
    setUserSubAdmin,
    createStaffResource,
    watchStaffResources,
    getStaffResourceDownloadURL,
    deleteStaffResource,
    createApprovalRequest,
    watchApprovalRequests,
    updateApprovalRequestStatus,
    deleteApprovalRequest,
    createTeamReport,
    watchTeamReports,
    addTeamReportComment,
    createTeamBudgetRequest,
    watchTeamBudgetRequests,
    updateTeamBudgetRequest,
    createExpenseProof,
    watchExpenseProofs,
    addExpenseProofComment,
    saveConferenceBudgetRow,
    seedConferenceBudgetRows,
    watchConferenceBudgetRows,
    deleteConferenceBudgetRow,
    watchEventCueSheets,
    saveEventCueSheet
  };

  init();
})();
