// ── JMC 2026 Registration Modal ──────────────────────────────────────────────

const STORAGE_KEY = 'jmc2026_registrations';

const SESSIONS = [
  { id: 's1', label: '첫째날 저녁 집회', sub: '9월 25일 (금) · 오후 7시 30분', icon: '🌙' },
  { id: 's2', label: '둘째날 오전 집회', sub: '9월 26일 (토) · 오전 10시 30분', icon: '☀️' },
  { id: 's3', label: '둘째날 오후 집회', sub: '9월 26일 (토) · 오후 2시',       icon: '🌤️' },
];

// ── Inject modal HTML ─────────────────────────────────────────────────────────
function buildModal() {
  const sessionCards = SESSIONS.map(s => `
    <label class="session-card flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-100 bg-white cursor-pointer hover:border-orange-400 transition-all has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
      <input type="checkbox" name="sessions" value="${s.id}" class="hidden">
      <span class="text-2xl">${s.icon}</span>
      <div class="flex-1">
        <div class="font-bold text-[#001F3F] text-sm">${s.label}</div>
        <div class="text-xs text-slate-500 mt-0.5">${s.sub}</div>
      </div>
      <span class="check-icon w-6 h-6 rounded-full border-2 border-orange-200 flex items-center justify-center text-white text-xs bg-white transition-all">✓</span>
    </label>`).join('');

  return `
<div id="reg-overlay" class="fixed inset-0 z-[200] hidden" aria-modal="true">
  <!-- Backdrop -->
  <div id="reg-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeRegModal()"></div>

  <!-- Modal -->
  <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
    <div id="reg-modal" class="relative pointer-events-auto w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-white" style="scrollbar-width:thin">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-orange-50/90 backdrop-blur-sm flex items-center justify-between px-7 pt-7 pb-4 border-b border-orange-100">
        <div class="flex items-center gap-3">
          <img src="logo.png" alt="JMC" class="h-9 w-auto">
          <div>
            <div class="font-extrabold text-[#001F3F] text-lg leading-tight">참석 신청</div>
            <div class="text-xs text-orange-500 font-semibold">Joyful Mission Conference 2026</div>
          </div>
        </div>
        <button onclick="closeRegModal()" class="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-orange-100 hover:text-slate-600 transition text-xl font-bold">&times;</button>
      </div>

      <!-- Form -->
      <form id="reg-form" onsubmit="submitReg(event)" novalidate class="px-7 py-6 space-y-5">

        <!-- 이름 -->
        <div>
          <label class="block text-xs font-extrabold text-[#001F3F] uppercase tracking-widest mb-1.5">이름 <span class="text-orange-500">*</span></label>
          <input type="text" name="name" placeholder="홍길동" required
            class="w-full px-4 py-3 rounded-xl bg-white border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition">
        </div>

        <!-- 연락처 -->
        <div>
          <label class="block text-xs font-extrabold text-[#001F3F] uppercase tracking-widest mb-1.5">휴대폰 번호 <span class="text-orange-500">*</span></label>
          <input type="tel" name="phone" placeholder="010-0000-0000" required
            class="w-full px-4 py-3 rounded-xl bg-white border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition">
        </div>

        <!-- 이메일 -->
        <div>
          <label class="block text-xs font-extrabold text-[#001F3F] uppercase tracking-widest mb-1.5">이메일</label>
          <input type="email" name="email" placeholder="example@email.com"
            class="w-full px-4 py-3 rounded-xl bg-white border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition">
        </div>

        <!-- 소속 -->
        <div>
          <label class="block text-xs font-extrabold text-[#001F3F] uppercase tracking-widest mb-1.5">소속 교회 / 단체 <span class="text-orange-500">*</span></label>
          <input type="text" name="church" placeholder="○○교회" required
            class="w-full px-4 py-3 rounded-xl bg-white border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition">
        </div>

        <!-- 집회 선택 -->
        <div>
          <label class="block text-xs font-extrabold text-[#001F3F] uppercase tracking-widest mb-2">참석 집회 선택 <span class="text-orange-500">*</span></label>
          <div class="space-y-2.5" id="session-cards">
            ${sessionCards}
          </div>
          <p id="session-err" class="text-red-500 text-xs mt-1 hidden">집회를 하나 이상 선택해주세요.</p>
        </div>

        <!-- 메모 -->
        <div>
          <label class="block text-xs font-extrabold text-[#001F3F] uppercase tracking-widest mb-1.5">기타 문의 / 메모</label>
          <textarea name="note" rows="2" placeholder="특이사항이 있으시면 입력해주세요."
            class="w-full px-4 py-3 rounded-xl bg-white border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm transition resize-none"></textarea>
        </div>

        <!-- Submit -->
        <button type="submit"
          class="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-extrabold text-base shadow-lg hover:from-orange-600 hover:to-orange-500 active:scale-95 transition-all">
          신청 완료하기 →
        </button>

        <p class="text-center text-xs text-slate-400">입력하신 개인정보는 컨퍼런스 운영 목적으로만 사용됩니다.</p>
      </form>

      <!-- Success Screen -->
      <div id="reg-success" class="hidden px-7 py-14 flex-col items-center text-center">
        <div class="text-6xl mb-5">🎉</div>
        <h3 class="text-2xl font-extrabold text-[#001F3F] mb-2">신청이 완료됐습니다!</h3>
        <p class="text-slate-500 text-sm leading-relaxed mb-8">조이플 미션 컨퍼런스 2026에<br>함께해 주셔서 감사합니다.<br>현장에서 만나요!</p>
        <button onclick="closeRegModal()" class="px-8 py-3 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition">확인</button>
      </div>

    </div>
  </div>
</div>

<style>
  .session-card input:checked ~ .check-icon { background:#f97316; border-color:#f97316; }
  #reg-modal { animation: slideUp .3s cubic-bezier(.16,1,.3,1); }
  @keyframes slideUp { from { opacity:0; transform:translateY(32px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
</style>`;
}

// ── Open / Close ─────────────────────────────────────────────────────────────
function openRegModal() {
  const overlay = document.getElementById('reg-overlay');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // reset
  const form = document.getElementById('reg-form');
  const success = document.getElementById('reg-success');
  if (form) { form.reset(); form.classList.remove('hidden'); }
  if (success) success.classList.add('hidden');
}

function closeRegModal() {
  document.getElementById('reg-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ESC key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRegModal(); });

// ── Submit ────────────────────────────────────────────────────────────────────
function submitReg(e) {
  e.preventDefault();
  const form = e.target;

  // Validate sessions
  const checkedSessions = [...form.querySelectorAll('input[name="sessions"]:checked')];
  const sessionErr = document.getElementById('session-err');
  if (checkedSessions.length === 0) {
    sessionErr.classList.remove('hidden');
    return;
  }
  sessionErr.classList.add('hidden');

  const sessionLabels = SESSIONS.filter(s => checkedSessions.some(c => c.value === s.id)).map(s => s.label);

  const record = {
    id:        Date.now(),
    timestamp: new Date().toLocaleString('ko-KR'),
    name:      form.name.value.trim(),
    phone:     form.phone.value.trim(),
    email:     form.email.value.trim(),
    church:    form.church.value.trim(),
    sessions:  sessionLabels,
    note:      form.note.value.trim(),
  };

  // 1) localStorage 저장 (로컬 백업)
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  all.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  // 2) Google Sheets 전송 (GET 방식 — Apps Script CORS/redirect 이슈 우회)
  if (typeof SHEETS_URL !== 'undefined' && SHEETS_URL) {
    const params = new URLSearchParams({
      action:   'add',
      name:     record.name,
      phone:    record.phone,
      email:    record.email,
      church:   record.church,
      sessions: record.sessions.join(','),
      note:     record.note,
    });
    fetch(`${SHEETS_URL}?${params}`, { mode: 'no-cors' })
      .catch(() => {/* 조용히 실패 허용 — localStorage에는 저장됨 */});
  }

  // 성공 화면 표시
  form.classList.add('hidden');
  const success = document.getElementById('reg-success');
  success.classList.remove('hidden');
  success.classList.add('flex');
}

// ── Bind buttons after DOM ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', buildModal());

  // Bind ALL 등록하기 buttons
  document.querySelectorAll('button').forEach(btn => {
    const t = btn.textContent.trim();
    if (t.includes('등록하기') || t.includes('지금 등록하기')) {
      btn.addEventListener('click', openRegModal);
    }
  });
});
