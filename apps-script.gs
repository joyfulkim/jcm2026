// ══════════════════════════════════════════════════════════════
//  JMC 2026 · Google Apps Script
//  1. script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기
//  2. 저장 후 [배포] → [새 배포] → 유형: 웹 앱
//     - 다음 사용자로 실행: 나(Me)
//     - 액세스 권한: 모든 사용자(Anyone)
//  3. 배포 후 표시되는 URL을 config.js 의 SHEETS_URL 에 붙여넣기
// ══════════════════════════════════════════════════════════════

const SHEET_NAME = 'JMC2026_신청자';
const ADMIN_PW   = 'jmc2026';   // config.js 의 ADMIN_PW 와 동일하게

// ── 공통: 시트 초기화 헬퍼 ────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      '신청일시', '이름', '연락처', '이메일', '소속',
      '첫날 저녁(7:30)', '둘째날 오전(10:30)', '둘째날 오후(2:00)', '메모'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }
  return sheet;
}

// ── 신청 접수 + 목록 조회 (GET) ───────────────────────────────
// POST CORS 이슈 우회 — 브라우저는 GET으로 요청
function doGet(e) {
  const action = e.parameter.action || '';

  // ① 신청 저장
  if (action === 'add') {
    try {
      const sheet    = getSheet();
      const sessions = (e.parameter.sessions || '').split(',').filter(Boolean);
      sheet.appendRow([
        new Date().toLocaleString('ko-KR'),
        e.parameter.name   || '',
        e.parameter.phone  || '',
        e.parameter.email  || '',
        e.parameter.church || '',
        sessions.includes('첫째날 저녁 집회') ? 'O' : '',
        sessions.includes('둘째날 오전 집회') ? 'O' : '',
        sessions.includes('둘째날 오후 집회') ? 'O' : '',
        e.parameter.note   || ''
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ② 관리자 목록 조회
  if ((e.parameter.pw || '') !== ADMIN_PW) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = getSheet();
  if (sheet.getLastRow() <= 1) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const rows    = sheet.getDataRange().getValues();
  const headers = rows[0];
  const records = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify(records))
    .setMimeType(ContentService.MimeType.JSON);
}
