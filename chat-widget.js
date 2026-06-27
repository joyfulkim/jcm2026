// JMC 2026 floating inquiry chat widget
(function () {
  if (window.__JMC_CHAT_WIDGET__) return;
  window.__JMC_CHAT_WIDGET__ = true;

  const STORAGE_KEY = 'jmc2026_chat_inquiries';
  const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/saU5t2vi';

  const style = document.createElement('style');
  style.textContent = `
    .jmc-chat-root { position: fixed; right: 22px; bottom: 22px; z-index: 180; font-family: Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .jmc-chat-button { width: 66px; height: 66px; border: 0; border-radius: 9999px; background: linear-gradient(135deg, #ff6b00, #a04100); color: white; box-shadow: 0 18px 35px rgba(160,65,0,.32); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
    .jmc-chat-button:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 22px 42px rgba(160,65,0,.38); }
    .jmc-chat-button .material-symbols-outlined { font-size: 30px; }
    .jmc-chat-badge { position: absolute; right: 1px; top: 1px; width: 15px; height: 15px; border-radius: 9999px; background: #22c55e; border: 3px solid white; }
    .jmc-chat-label { position: absolute; right: 76px; top: 11px; white-space: nowrap; background: #191c1d; color: white; border-radius: 9999px; padding: 10px 14px; font-size: 13px; font-weight: 800; box-shadow: 0 10px 24px rgba(15,23,42,.2); }
    .jmc-chat-panel { position: absolute; right: 0; bottom: 82px; width: min(380px, calc(100vw - 32px)); max-height: min(680px, calc(100vh - 120px)); border-radius: 22px; overflow: hidden; background: #fff; border: 1px solid rgba(226,191,176,.75); box-shadow: 0 24px 70px rgba(15,23,42,.25); display: none; flex-direction: column; }
    .jmc-chat-panel.is-open { display: flex; animation: jmcChatUp .2s ease-out; }
    @keyframes jmcChatUp { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .jmc-chat-header { background: linear-gradient(135deg, #476083, #001c3a); color: white; padding: 18px 18px 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
    .jmc-chat-title { margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 0; }
    .jmc-chat-status { margin-top: 5px; font-size: 12px; color: rgba(255,255,255,.72); display: flex; align-items: center; gap: 6px; }
    .jmc-chat-status::before { content: ""; width: 8px; height: 8px; border-radius: 9999px; background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.16); }
    .jmc-chat-close { border: 0; width: 34px; height: 34px; border-radius: 9999px; background: rgba(255,255,255,.12); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .jmc-chat-body { padding: 18px; overflow-y: auto; background: #f8f9fa; }
    .jmc-chat-message { max-width: 88%; padding: 12px 14px; border-radius: 16px; font-size: 14px; line-height: 1.55; word-break: keep-all; }
    .jmc-chat-message.bot { background: white; color: #191c1d; border: 1px solid #e7e8e9; border-top-left-radius: 6px; }
    .jmc-chat-message.user { margin-left: auto; background: #ff6b00; color: white; border-top-right-radius: 6px; }
    .jmc-chat-stack { display: flex; flex-direction: column; gap: 10px; }
    .jmc-chat-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .jmc-chat-chip { border: 1px solid #e2bfb0; background: white; color: #7a3000; border-radius: 9999px; padding: 8px 11px; font-size: 12px; font-weight: 800; cursor: pointer; }
    .jmc-chat-chip:hover { background: #fff3ed; }
    .jmc-chat-form { padding: 16px 18px 18px; background: white; border-top: 1px solid #e7e8e9; display: grid; gap: 10px; }
    .jmc-chat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .jmc-chat-input, .jmc-chat-textarea { width: 100%; border: 1px solid #e2bfb0; border-radius: 12px; padding: 11px 12px; font: inherit; font-size: 13px; outline: none; background: #fff; color: #191c1d; box-sizing: border-box; }
    .jmc-chat-input:focus, .jmc-chat-textarea:focus { border-color: #ff6b00; box-shadow: 0 0 0 3px rgba(255,107,0,.12); }
    .jmc-chat-textarea { min-height: 78px; resize: vertical; }
    .jmc-chat-submit { border: 0; border-radius: 14px; padding: 13px 14px; background: #ff6b00; color: white; font-weight: 900; cursor: pointer; }
    .jmc-chat-submit:hover { background: #e97b32; }
    .jmc-chat-note { margin: 0; color: #5a4136; font-size: 11px; line-height: 1.45; text-align: center; }
    @media (max-width: 640px) {
      .jmc-chat-root { right: 16px; bottom: 16px; }
      .jmc-chat-button { width: 60px; height: 60px; }
      .jmc-chat-label { display: none; }
      .jmc-chat-panel { bottom: 76px; max-height: calc(100vh - 105px); }
      .jmc-chat-row { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  function buildWidget() {
    return `
      <div class="jmc-chat-panel" id="jmc-chat-panel" aria-live="polite">
        <div class="jmc-chat-header">
          <div>
            <h2 class="jmc-chat-title">JMC 실시간 문의</h2>
            <div class="jmc-chat-status">운영팀에 문의를 남길 수 있어요</div>
          </div>
          <button type="button" class="jmc-chat-close" id="jmc-chat-close" aria-label="문의 창 닫기">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="jmc-chat-body" id="jmc-chat-body">
          <div class="jmc-chat-stack" id="jmc-chat-stack">
            <div class="jmc-chat-message bot">안녕하세요. 지저스 미션 컨퍼런스 운영팀입니다. 궁금한 내용을 남겨주시면 확인 후 연락드리겠습니다.</div>
            <div class="jmc-chat-message bot">자주 묻는 항목을 먼저 선택해도 좋아요.</div>
          </div>
          <div class="jmc-chat-quick">
            <button type="button" class="jmc-chat-chip" data-message="등록 방법이 궁금합니다.">등록 문의</button>
            <button type="button" class="jmc-chat-chip" data-message="오시는 길과 주차가 궁금합니다.">오시는 길</button>
            <button type="button" class="jmc-chat-chip" data-message="동역기관 참여를 문의합니다.">동역 문의</button>
          </div>
        </div>
        <form class="jmc-chat-form" id="jmc-chat-form">
          <div class="jmc-chat-row">
            <input class="jmc-chat-input" name="name" placeholder="이름" required>
            <input class="jmc-chat-input" name="phone" placeholder="연락처" required>
          </div>
          <input class="jmc-chat-input" name="email" type="email" placeholder="이메일 선택">
          <textarea class="jmc-chat-textarea" name="message" placeholder="문의 내용을 입력해 주세요." required></textarea>
          <button class="jmc-chat-submit" type="submit">문의 남기기</button>
          <p class="jmc-chat-note">남겨주신 정보는 컨퍼런스 문의 응대 목적으로만 사용됩니다.</p>
        </form>
      </div>
      <span class="jmc-chat-label">실시간 문의</span>
      <a class="jmc-chat-button" id="jmc-chat-button" href="${KAKAO_OPEN_CHAT_URL}" target="_blank" rel="noopener" aria-label="카카오톡 실시간 문의 열기">
        <span class="material-symbols-outlined">chat_bubble</span>
        <span class="jmc-chat-badge" aria-hidden="true"></span>
      </a>
    `;
  }

  function appendMessage(text, type) {
    const stack = document.getElementById('jmc-chat-stack');
    if (!stack) return;
    const message = document.createElement('div');
    message.className = `jmc-chat-message ${type}`;
    message.textContent = text;
    stack.appendChild(message);
    const body = document.getElementById('jmc-chat-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  function submitInquiry(record) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    all.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    if (typeof SHEETS_URL !== 'undefined' && SHEETS_URL) {
      const params = new URLSearchParams({
        action: 'add',
        name: record.name,
        phone: record.phone,
        email: record.email,
        church: '채팅문의',
        sessions: '',
        note: `[채팅문의] ${record.message}`,
      });
      fetch(`${SHEETS_URL}?${params}`, { mode: 'no-cors' }).catch(() => {});
    }
  }

  function openChat(prefill) {
    const panel = document.getElementById('jmc-chat-panel');
    const button = document.getElementById('jmc-chat-button');
    if (!panel || !button) return;
    panel.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    if (prefill) {
      const textarea = document.querySelector('#jmc-chat-form textarea[name="message"]');
      if (textarea && !textarea.value.trim()) textarea.value = prefill;
    }
  }

  function closeChat() {
    const panel = document.getElementById('jmc-chat-panel');
    const button = document.getElementById('jmc-chat-button');
    if (!panel || !button) return;
    panel.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.createElement('div');
    root.className = 'jmc-chat-root';
    root.innerHTML = buildWidget();
    document.body.appendChild(root);

    document.getElementById('jmc-chat-close').addEventListener('click', closeChat);

    document.querySelectorAll('.jmc-chat-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.message || '';
        const textarea = document.querySelector('#jmc-chat-form textarea[name="message"]');
        appendMessage(text, 'user');
        appendMessage('네, 아래에 이름과 연락처를 남겨주시면 운영팀이 확인 후 안내드리겠습니다.', 'bot');
        if (textarea) textarea.value = text;
      });
    });

    document.getElementById('jmc-chat-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const record = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('ko-KR'),
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
      };
      submitInquiry(record);
      appendMessage(record.message, 'user');
      appendMessage('문의가 접수되었습니다. 운영팀이 확인 후 남겨주신 연락처로 답변드리겠습니다.', 'bot');
      form.reset();
    });

    document.querySelectorAll('a, button').forEach((el) => {
      if (el.closest('.jmc-chat-root')) return;
      const text = (el.textContent || '').trim();
      if (text === '문의하기' || text.includes('동역교회 문의')) {
        el.addEventListener('click', (event) => {
          event.preventDefault();
          openChat(text.includes('동역') ? '동역기관 참여를 문의합니다.' : '');
        });
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeChat();
    });
  });
})();
