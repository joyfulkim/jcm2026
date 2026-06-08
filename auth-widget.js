(function () {
  if (window.__JMC_AUTH_WIDGET__) return;
  window.__JMC_AUTH_WIDGET__ = true;

  function buildModal() {
    return `
      <div id="auth-modal" class="fixed inset-0 z-[210] hidden items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
        <div class="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-100 px-7 py-5">
            <div>
              <h2 class="text-xl font-extrabold text-slate-900">회원 로그인</h2>
              <p class="mt-1 text-sm text-slate-500">등록 확인과 컨퍼런스 소식을 받아보세요.</p>
            </div>
            <button id="auth-close" class="h-10 w-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" type="button">×</button>
          </div>
          <div class="px-7 py-6">
            <div class="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-extrabold">
              <button id="auth-login-tab" class="rounded-xl bg-white py-2 text-slate-900 shadow-sm" type="button">로그인</button>
              <button id="auth-signup-tab" class="rounded-xl py-2 text-slate-500" type="button">회원가입</button>
            </div>
            <form id="auth-form" class="space-y-3">
              <input id="auth-name" class="hidden w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="이름">
              <input id="auth-email" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="email" placeholder="이메일" required>
              <input id="auth-password" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" type="password" placeholder="비밀번호" required minlength="6">
              <p id="auth-error" class="hidden rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"></p>
              <button id="auth-submit" class="w-full rounded-2xl bg-orange-500 py-3.5 font-extrabold text-white hover:bg-orange-600" type="submit">로그인</button>
            </form>
            <div class="my-5 flex items-center gap-3 text-xs font-bold text-slate-400">
              <span class="h-px flex-1 bg-slate-200"></span>또는<span class="h-px flex-1 bg-slate-200"></span>
            </div>
            <button id="auth-google" class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 font-extrabold text-slate-800 hover:bg-slate-50" type="button">
              <span class="material-symbols-outlined text-base">account_circle</span>
              Google로 계속하기
            </button>
          </div>
        </div>
      </div>
    `;
  }

  let mode = 'login';

  function setMode(nextMode) {
    mode = nextMode;
    const isSignup = mode === 'signup';
    document.getElementById('auth-name').classList.toggle('hidden', !isSignup);
    document.getElementById('auth-submit').textContent = isSignup ? '회원가입' : '로그인';
    document.getElementById('auth-login-tab').className = isSignup
      ? 'rounded-xl py-2 text-slate-500'
      : 'rounded-xl bg-white py-2 text-slate-900 shadow-sm';
    document.getElementById('auth-signup-tab').className = isSignup
      ? 'rounded-xl bg-white py-2 text-slate-900 shadow-sm'
      : 'rounded-xl py-2 text-slate-500';
  }

  function showError(message) {
    const error = document.getElementById('auth-error');
    error.textContent = message;
    error.classList.remove('hidden');
  }

  function clearError() {
    const error = document.getElementById('auth-error');
    error.textContent = '';
    error.classList.add('hidden');
  }

  function openAuth() {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('flex');
    clearError();
  }

  function closeAuth() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-modal').classList.remove('flex');
  }

  function updateButtons(user) {
    document.querySelectorAll('[data-auth-open]').forEach((button) => {
      button.textContent = user ? (user.displayName || user.email || '내 계정') : '로그인';
      button.onclick = user ? () => window.JMCFirebase.signOut() : openAuth;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', buildModal());

    document.querySelectorAll('[data-auth-open]').forEach((button) => {
      button.onclick = openAuth;
    });
    document.getElementById('auth-close').addEventListener('click', closeAuth);
    document.getElementById('auth-modal').addEventListener('click', (event) => {
      if (event.target.id === 'auth-modal') closeAuth();
    });
    document.getElementById('auth-login-tab').addEventListener('click', () => setMode('login'));
    document.getElementById('auth-signup-tab').addEventListener('click', () => setMode('signup'));
    document.getElementById('auth-google').addEventListener('click', async () => {
      clearError();
      try {
        await window.JMCFirebase.signInGoogle();
        closeAuth();
      } catch (err) {
        showError(err.message || 'Google 로그인을 완료하지 못했습니다.');
      }
    });
    document.getElementById('auth-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      clearError();
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;
      const name = document.getElementById('auth-name').value.trim();
      try {
        if (mode === 'signup') {
          await window.JMCFirebase.signUp(email, password, name);
        } else {
          await window.JMCFirebase.signIn(email, password);
        }
        closeAuth();
      } catch (err) {
        showError(err.message || '로그인 처리 중 문제가 발생했습니다.');
      }
    });

    if (window.JMCFirebase) {
      window.JMCFirebase.onAuth(updateButtons);
    }
  });
})();
