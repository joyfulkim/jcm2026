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

// ── 신청 접수 (POST) ──────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        '신청일시', '이름', '연락처', '이메일', '소속',
        '첫날 저녁(7:30)', '둘째날 오전(10:30)', '둘째날 오후(2:00)', '메모'
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    }

    const sessions = data.sessions || [];
    sheet.appendRow([
      new Date().toLocaleString('ko-KR'),
      data.name   || '',
      data.phone  || '',
      data.email  || '',
      data.church || '',
      sessions.includes('첫째날 저녁 집회') ? 'O' : '',
      sessions.includes('둘째날 오전 집회') ? 'O' : '',
      sessions.includes('둘째날 오후 집회') ? 'O' : '',
      data.note   || ''
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

// ── 신청 목록 조회 (GET · 관리자용) ───────────────────────────
function doGet(e) {
  if ((e.parameter.pw || '') !== ADMIN_PW) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1) {
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
