// 북클럽 데이터 자동 로딩 스크립트
// Google Spreadsheet에서 책 토론 내용을 자동으로 가져옵니다

// ========================================
// 설정: Google Spreadsheet 정보
// ========================================
const SPREADSHEET_CONFIG = {
  // 여기에 Google Spreadsheet의 공개 CSV 링크를 입력하세요
  // 예시: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0'
  csvUrl: '', // TODO: Google Spreadsheet CSV URL을 여기에 입력

  // 또는 직접 스프레드시트 ID와 GID를 사용
  sheetId: '', // TODO: Spreadsheet ID (URL에서 /d/ 다음 부분)
  gid: '0'     // Sheet GID (여러 시트가 있을 경우)
};

// ========================================
// CSV 파싱 함수
// ========================================
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    data.push(row);
  }

  return data;
}

// ========================================
// 스프레드시트 데이터 로딩
// ========================================
async function loadBookData(bookId) {
  try {
    // CSV URL 생성
    let csvUrl = SPREADSHEET_CONFIG.csvUrl;

    if (!csvUrl && SPREADSHEET_CONFIG.sheetId) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_CONFIG.sheetId}/export?format=csv&gid=${SPREADSHEET_CONFIG.gid}`;
    }

    if (!csvUrl) {
      console.warn('스프레드시트 URL이 설정되지 않았습니다.');
      return null;
    }

    // 데이터 가져오기
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const data = parseCSV(csvText);

    // 해당 책의 데이터 필터링
    return data.filter(row => row['책ID'] === bookId || row['book_id'] === bookId);

  } catch (error) {
    console.error('데이터 로딩 실패:', error);
    return null;
  }
}

// ========================================
// HTML 업데이트 함수
// ========================================
function updateSection(sectionId, content) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const placeholder = section.querySelector('.placeholder');

  if (content && content.trim() !== '') {
    // 내용이 있으면 placeholder를 실제 콘텐츠로 교체
    if (placeholder) {
      placeholder.innerHTML = formatContent(content);
      placeholder.classList.remove('placeholder');
      placeholder.style.color = '#666';
      placeholder.style.fontStyle = 'normal';
      placeholder.style.background = 'transparent';
      placeholder.style.border = 'none';
      placeholder.style.padding = '0';
    }
  }
  // 내용이 없으면 placeholder 유지
}

function formatContent(content) {
  // 줄바꿈을 <br> 또는 <p>로 변환
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  if (paragraphs.length === 1) {
    return `<p>${paragraphs[0]}</p>`;
  }

  return paragraphs.map(p => {
    // 리스트 항목 감지 (-, *, 숫자. 로 시작)
    if (p.trim().match(/^[-*•]\s/) || p.trim().match(/^\d+\.\s/)) {
      return `<li>${p.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '')}</li>`;
    }
    return `<p>${p}</p>`;
  }).join('');
}

// ========================================
// 페이지 로드 시 데이터 자동 로딩
// ========================================
async function initializeBookPage(bookId) {
  // 페이지 로드 시 데이터 가져오기
  const bookData = await loadBookData(bookId);

  if (!bookData || bookData.length === 0) {
    console.log('스프레드시트에서 데이터를 찾을 수 없습니다. placeholder가 유지됩니다.');
    return;
  }

  // 데이터 구조 예시:
  // 책ID, 섹션, 내용
  // cosmos, 주요토론, "우주의 기원에 대한 과학적 설명..."
  // cosmos, 인사이트, "하나님의 창조 질서를 발견..."
  // cosmos, 질문답변, "Q: 빅뱅 이론과 창조론은?\nA: ..."

  bookData.forEach(row => {
    const section = row['섹션'] || row['section'];
    const content = row['내용'] || row['content'];

    if (section === '주요토론' || section === 'discussion') {
      updateSection('discussion', content);
    } else if (section === '인사이트' || section === 'insights') {
      updateSection('insights', content);
    } else if (section === '질문답변' || section === 'qa') {
      updateSection('qa', content);
    }
  });
}

// ========================================
// 전역 함수로 노출 (HTML에서 호출 가능)
// ========================================
window.loadBookClubData = initializeBookPage;
