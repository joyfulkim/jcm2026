(function () {
  const feeNotice = {
    id: 'fee-free-20260609',
    pinned: true,
    category: '등록 안내',
    createdAtText: '2026.06.09',
    title: '등록비 무료 안내',
    body: '지저스 미션 컨퍼런스 2026은 등록비가 무료입니다.\n숙소는 별도 신청 및 비용 부담으로 안내됩니다.'
  };

  function formatDate(notice) {
    if (notice.createdAt && notice.createdAt.toDate) {
      return notice.createdAt.toDate().toLocaleDateString('ko-KR');
    }
    return notice.createdAtText || '';
  }

  function esc(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escAttr(value) {
    return esc(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function isNoticeImage(image) {
    return !!image
      && typeof image.dataUrl === 'string'
      && /^data:image\/(jpeg|png|webp);base64,/.test(image.dataUrl)
      && image.dataUrl.length <= 700000;
  }

  function noticeId(notice) {
    return notice.id || String(notice.createdAtMs || notice.title || 'notice');
  }

  function noticeHref(notice) {
    return `notices.html?id=${encodeURIComponent(noticeId(notice))}`;
  }

  function renderNoticeRow(notice) {
    return `
      <article class="grid grid-cols-[1fr_auto] gap-5 border-b border-slate-100 pb-4">
        <div class="min-w-0">
          <a href="${escAttr(noticeHref(notice))}" class="block truncate text-base font-extrabold text-slate-900 transition hover:text-orange-600">${esc(notice.title)}</a>
        </div>
        <time class="whitespace-nowrap text-sm font-bold text-slate-400">${esc(formatDate(notice))}</time>
      </article>
    `;
  }

  function render(notices) {
    const list = document.getElementById('notice-list');
    if (!list) return;
    const visibleNotices = [feeNotice, ...notices];
    if (!visibleNotices.length) {
      list.innerHTML = `
        <div class="py-8 text-sm font-bold text-slate-400">
          아직 등록된 행사 공지사항이 없습니다.
        </div>
      `;
      return;
    }
    list.innerHTML = `<div class="space-y-4">${visibleNotices.slice(0, 4).map(renderNoticeRow).join('')}</div>`;
  }

  function renderDetailList(notices, activeId) {
    const list = document.getElementById('notice-detail-list');
    if (!list) return;
    list.innerHTML = notices.slice(0, 8).map((notice) => {
      const isActive = noticeId(notice) === activeId;
      return `
        <a href="${escAttr(noticeHref(notice))}" class="block border-b border-slate-100 py-4 transition ${isActive ? 'text-orange-600' : 'text-slate-700 hover:text-orange-600'}">
          <span class="block truncate text-sm font-extrabold">${esc(notice.title)}</span>
          <span class="mt-1 block text-xs font-bold text-slate-400">${esc(formatDate(notice))}</span>
        </a>
      `;
    }).join('');
  }

  function renderNoticeBoardList(notices) {
    if (!notices.length) {
      return `
        <div class="board-card editorial-shadow border border-dashed border-outline-variant/70 bg-surface-container-lowest p-10 text-center text-sm font-bold text-on-surface-variant">
          등록된 공지사항이 없습니다.
        </div>
      `;
    }

    return `
      <div class="board-card editorial-shadow overflow-hidden border border-outline-variant/50 bg-surface-container-lowest">
        <div class="hidden grid-cols-[150px_1fr_150px] border-b border-outline-variant/60 bg-surface-container-low px-6 py-4 text-sm font-black text-on-surface-variant md:grid">
          <span>구분</span>
          <span>제목</span>
          <span class="text-right">작성일</span>
        </div>
        <div>
          ${notices.map((notice) => `
            <a href="${escAttr(noticeHref(notice))}" class="grid gap-2 border-b border-outline-variant/45 px-5 py-5 transition last:border-b-0 hover:bg-secondary-fixed/45 md:grid-cols-[150px_1fr_150px] md:items-center md:px-6">
              <span class="w-fit rounded-full ${notice.pinned ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'} px-3 py-1 text-xs font-extrabold">${notice.pinned ? '중요' : esc(notice.category || '공지')}</span>
              <span class="min-w-0 text-base font-extrabold text-on-surface md:truncate">${esc(notice.title)}</span>
              <time class="text-sm font-bold text-on-surface-variant md:text-right">${esc(formatDate(notice))}</time>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderNoticeBoardDetail(notice) {
    return `
      <article class="board-card editorial-shadow border border-outline-variant/50 bg-surface-container-lowest p-6 md:p-8">
        <div class="mb-6 flex flex-wrap items-center gap-3">
          ${notice.pinned ? '<span class="rounded-full bg-primary-fixed px-3 py-1 text-xs font-extrabold text-on-primary-fixed-variant">중요</span>' : ''}
          <span class="rounded-full bg-surface-container-high px-3 py-1 text-xs font-extrabold text-on-surface-variant">${esc(notice.category || '공지')}</span>
          <time class="ml-auto text-sm font-bold text-on-surface-variant">${esc(formatDate(notice))}</time>
        </div>
        <h1 class="text-2xl font-black leading-tight text-on-surface md:text-4xl">${esc(notice.title)}</h1>
        ${isNoticeImage(notice.image) ? `<img src="${escAttr(notice.image.dataUrl)}" alt="${escAttr(notice.title)} 첨부 이미지" class="mt-8 max-h-[520px] w-full rounded-xl border border-outline-variant/50 bg-surface-container-low object-contain">` : ''}
        <div class="mt-8 whitespace-pre-line text-base leading-8 text-on-surface-variant">${esc(notice.body)}</div>
        <div class="mt-10 border-t border-outline-variant/60 pt-6">
          <a href="notices.html" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-extrabold text-white hover:bg-secondary/90">
            <span class="material-symbols-outlined text-base">list</span>
            목록으로
          </a>
        </div>
      </article>
    `;
  }

  function renderNoticeBoard(notices) {
    const board = document.getElementById('notice-board');
    if (!board) return;

    const visibleNotices = [feeNotice, ...notices];
    const params = new URLSearchParams(window.location.search);
    const activeId = params.get('id');

    if (!activeId) {
      board.innerHTML = renderNoticeBoardList(visibleNotices);
      return;
    }

    const notice = visibleNotices.find((item) => noticeId(item) === activeId);
    if (!notice) {
      board.innerHTML = `
        <div class="board-card editorial-shadow border border-dashed border-outline-variant/70 bg-surface-container-lowest p-10 text-center">
          <p class="text-sm font-bold text-on-surface-variant">요청하신 공지사항을 찾을 수 없습니다.</p>
          <a href="notices.html" class="mt-6 inline-flex rounded-xl bg-secondary px-5 py-3 text-sm font-extrabold text-white hover:bg-secondary/90">목록으로</a>
        </div>
      `;
      return;
    }

    board.innerHTML = renderNoticeBoardDetail(notice);
  }

  function renderDetail(notices) {
    const detail = document.getElementById('notice-detail');
    if (!detail) return;
    const visibleNotices = [feeNotice, ...notices];
    const params = new URLSearchParams(window.location.search);
    const activeId = params.get('id') || noticeId(visibleNotices[0] || {});
    const notice = visibleNotices.find((item) => noticeId(item) === activeId) || visibleNotices[0];

    renderDetailList(visibleNotices, notice ? noticeId(notice) : '');

    if (!notice) {
      detail.innerHTML = `
        <div class="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-400">
          등록된 공지사항이 없습니다.
        </div>
      `;
      return;
    }

    detail.innerHTML = `
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div class="mb-5 flex flex-wrap items-center gap-3">
          ${notice.pinned ? '<span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">중요</span>' : ''}
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">${esc(notice.category || '공지')}</span>
          <time class="ml-auto text-sm font-bold text-slate-400">${esc(formatDate(notice))}</time>
        </div>
        <h1 class="text-2xl font-black leading-tight text-slate-950 md:text-4xl">${esc(notice.title)}</h1>
        ${isNoticeImage(notice.image) ? `<img src="${escAttr(notice.image.dataUrl)}" alt="${escAttr(notice.title)} 첨부 이미지" class="mt-8 max-h-[520px] w-full rounded-2xl border border-slate-100 bg-slate-50 object-contain">` : ''}
        <div class="mt-8 whitespace-pre-line text-base leading-8 text-slate-700">${esc(notice.body)}</div>
      </article>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('notice-list');
    const detail = document.getElementById('notice-detail');
    const board = document.getElementById('notice-board');
    if (list) render([]);
    if (detail) renderDetail([]);
    if (board) renderNoticeBoard([]);
    if (window.JMCFirebase) {
      window.JMCFirebase.watchNotices((notices) => {
        render(notices);
        renderDetail(notices);
        renderNoticeBoard(notices);
      }, () => {
        render([]);
        renderDetail([]);
        renderNoticeBoard([]);
      });
    }
  });
})();
