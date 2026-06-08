// JMC 2026 shared service configuration.
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyi-lD8uUNW8Wtc9EkHp8xYwZ3eJBS5rdR1f085vF4jL1vz0OFdBOk34sNFIazL8pwvfA/exec';
const ADMIN_PW   = 'jmc2026';  // 관리자 비밀번호 (변경 가능)

const firebaseConfig = {
  apiKey: 'AIzaSyBGrca0FV-uIJuz66a5komvvxOG41Gt5ZA',
  authDomain: 'jmc2026-2b5e0.firebaseapp.com',
  projectId: 'jmc2026-2b5e0',
  storageBucket: 'jmc2026-2b5e0.firebasestorage.app',
  messagingSenderId: '426169427048',
  appId: '1:426169427048:web:9fd79b06b58c47a74cc7dd',
  measurementId: 'G-YQ6RX5MEVR'
};

window.JMC_FIREBASE_CONFIG = firebaseConfig;
window.JMC_ADMIN_EMAILS = ['kms@jfm.kr'];
