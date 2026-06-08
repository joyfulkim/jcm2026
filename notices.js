(function () {
  function formatDate(notice) {
    if (notice.createdAt && notice.createdAt.toDate) {
      return notice.createdAt.toDate().toLocaleDateString('ko-KR');
    }
    return notice.createdAtText || '';
  }

  function esc(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function render(notices) {
    const list = document.getElementById('notice-list');
    if (!list) return;
    if (!notices.length) {
      list.innerHTML = `
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-500">
          아직 등록된 행사 공지사항이 없습니다.
        </div>
      `;
      return;
    }
    list.innerHTML = notices.slice(0, 5).map((notice) => `
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          ${notice.pinned ? '<span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700">중요</span>' : ''}
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">${esc(notice.category || '공지')}</span>
          <span class="ml-auto text-xs font-bold text-slate-400">${esc(formatDate(notice))}</span>
        </div>
        <h3 class="text-lg font-extrabold text-slate-900">${esc(notice.title)}</h3>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">${esc(notice.body)}</p>
      </article>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('notice-list');
    if (!list || !window.JMCFirebase) return;
    window.JMCFirebase.watchNotices(render, () => render([]));
  });
})();
