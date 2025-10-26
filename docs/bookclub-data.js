// 북클럽 데이터 자동 로딩 스크립트
// Google Spreadsheet에서 책 토론 내용을 자동으로 가져옵니다

// ========================================
// 설정: Google Spreadsheet 정보
// ========================================
const SPREADSHEET_CONFIG = {
  // 방법 1 (추천): "Publish to web" URL 사용
  // File → Share → Publish to web → CSV format
  // 이 방법이 쉼표와 따옴표를 더 안정적으로 처리합니다
  csvUrl: '', // 여기에 Publish to web URL 입력 (예: https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv)

  // 방법 2: Export URL 사용 (쉼표 처리가 불안정할 수 있음)
  // csvUrl: 'https://docs.google.com/spreadsheets/d/1skCDbZakZp7smLo7MP9kiN1HeYNgYhqhNi7zq020hNY/export?format=csv&gid=0',

  // 또는 직접 스프레드시트 ID와 GID를 사용
  sheetId: '1skCDbZakZp7smLo7MP9kiN1HeYNgYhqhNi7zq020hNY',
  gid: '0'
};

// ========================================
// CSV 파싱 함수 (PapaParse 사용)
// ========================================
function parseCSV(csvText) {
  // PapaParse가 로드되지 않은 경우 에러
  if (typeof Papa === 'undefined') {
    console.error('❌ PapaParse 라이브러리가 로드되지 않았습니다.');
    console.error('HTML 파일에 다음 스크립트를 추가하세요:');
    console.error('<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>');
    return [];
  }

  // PapaParse로 CSV 파싱
  const result = Papa.parse(csvText, {
    header: true,           // 첫 행을 헤더로 사용
    skipEmptyLines: true,   // 빈 줄 무시
    trimHeaders: true,      // 헤더 공백 제거
    dynamicTyping: false    // 모든 값을 문자열로 유지
  });

  if (result.errors.length > 0) {
    console.warn('⚠️ CSV 파싱 중 경고:');
    result.errors.forEach(error => {
      console.warn(`  - 행 ${error.row}: ${error.message}`);
    });
  }

  console.log(`📄 CSV 총 ${result.data.length}개 행 파싱 완료`);
  console.log('📋 헤더:', result.meta.fields);

  return result.data;
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
      console.warn('⚠️ 스프레드시트 URL이 설정되지 않았습니다.');
      return null;
    }

    console.log('📊 데이터 로딩 중:', csvUrl);

    // CORS 문제 해결을 위한 fetch 옵션
    const response = await fetch(csvUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'text/csv,text/plain,*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('✅ CSV 데이터 로드 완료');
    console.log('📄 원본 CSV (처음 500자):', csvText.substring(0, 500));

    const data = parseCSV(csvText);
    console.log('📋 파싱된 데이터:', data.length, '행');

    // 각 행의 내용 미리보기
    data.forEach((row, index) => {
      console.log(`행 ${index + 1}:`, {
        '책ID': row['책ID'] || row['book_id'],
        '섹션': row['섹션'] || row['section'],
        '내용 미리보기': (row['내용'] || row['content'] || '').substring(0, 100) + '...'
      });
    });

    // 해당 책의 데이터 필터링
    const filteredData = data.filter(row => {
      const rowBookId = row['책ID'] || row['book_id'] || '';
      return rowBookId.toLowerCase() === bookId.toLowerCase();
    });

    console.log(`📖 "${bookId}" 책 데이터:`, filteredData.length, '개 섹션');
    return filteredData;

  } catch (error) {
    console.error('❌ 데이터 로딩 실패:', error);

    // CORS 오류인 경우 도움말 표시
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.error(`
⚠️ CORS 오류 해결 방법:

1. 로컬 웹 서버 사용 (file:// 대신):
   cd docs
   python3 -m http.server 8000
   # 브라우저에서 http://localhost:8000 접속

2. 스프레드시트 공개 설정 확인:
   - Google Sheets에서 파일 → 공유 → "링크가 있는 모든 사용자" 선택
   - 또는 파일 → 공유 → 웹에 게시 → CSV 형식으로 게시

3. GitHub Pages에 배포:
   - git push 후 GitHub Pages URL에서 접속
   - https://YOUR-USERNAME.github.io/bookclub/

자세한 내용은 SPREADSHEET_SETUP.md 파일을 참조하세요.
      `);
    }

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
  // HTML 특수 문자 이스케이프 (보안)
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 줄바꿈을 <br> 또는 <p>로 변환
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  if (paragraphs.length === 0) {
    return '';
  }

  if (paragraphs.length === 1) {
    return `<p>${escapeHtml(paragraphs[0])}</p>`;
  }

  // 여러 문단 처리
  let html = '';
  let inList = false;
  let listItems = [];

  paragraphs.forEach((p, index) => {
    const trimmed = p.trim();

    // 리스트 항목 감지 (-, *, •, 숫자. 로 시작)
    const listMatch = trimmed.match(/^([-*•]|\d+\.)\s+(.+)$/);

    if (listMatch) {
      // 리스트 항목
      const content = listMatch[2];
      listItems.push(`<li>${escapeHtml(content)}</li>`);
      inList = true;
    } else {
      // 일반 문단
      // 이전에 리스트가 있었다면 먼저 닫기
      if (inList && listItems.length > 0) {
        html += '<ul>' + listItems.join('') + '</ul>';
        listItems = [];
        inList = false;
      }

      // 문단 추가
      html += `<p>${escapeHtml(trimmed)}</p>`;
    }
  });

  // 마지막에 남은 리스트 항목 처리
  if (inList && listItems.length > 0) {
    html += '<ul>' + listItems.join('') + '</ul>';
  }

  return html;
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

    console.log(`📝 섹션: "${section}", 내용 길이: ${content ? content.length : 0}자`);

    if (section === '주요토론' || section === 'discussion') {
      updateSection('discussion', content);
      console.log('✅ 주요토론 내용 업데이트 완료');
    } else if (section === '인사이트' || section === 'insights') {
      updateSection('insights', content);
      console.log('✅ 인사이트 내용 업데이트 완료');
    } else if (section === '질문답변' || section === 'qa') {
      updateSection('qa', content);
      console.log('✅ 질문답변 내용 업데이트 완료');
    } else {
      console.warn(`⚠️ 알 수 없는 섹션: "${section}"`);
    }
  });

  console.log('🎉 모든 섹션 업데이트 완료!');
}

// ========================================
// 전역 함수로 노출 (HTML에서 호출 가능)
// ========================================
window.loadBookClubData = initializeBookPage;
