// 북클럽 데이터 자동 로딩 스크립트
// Google Spreadsheet에서 책 토론 내용을 자동으로 가져옵니다

// ========================================
// 설정: Google Spreadsheet 정보
// ========================================

// 스프레드시트 1: 책 메타데이터 (summary.html에서 사용)
// 필드: 책ID, 제목, 저자, 설명, 표지, 상태, 날짜, 페이지
// Fields: book_id, title, author, description, cover_url, status, date, page
const BOOK_METADATA_CONFIG = {
  // 방법 1 (추천): "Publish to web" URL 사용
  // File → Share → Publish to web → CSV format
  csvUrl: '', // 여기에 책 메타데이터 스프레드시트의 Publish to web URL 입력

  // 방법 2: 스프레드시트 ID와 GID 사용
  sheetId: '1skCDbZakZp7smLo7MP9kiN1HeYNgYhqhNi7zq020hNY', // 책 메타데이터 스프레드시트 ID
  gid: '573247402'      // 시트 GID (기본값: 0)
};

// 스프레드시트 2: 토론 내용 (book-*.html 페이지에서 사용)
// 필드: 책ID, 섹션, 내용
// Fields: book_id, section, content
const DISCUSSION_CONTENT_CONFIG = {
  // 방법 1 (추천): "Publish to web" URL 사용
  csvUrl: '',

  // 방법 2: 스프레드시트 ID와 GID 사용
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
    // CSV URL 생성 (토론 내용 스프레드시트)
    let csvUrl = DISCUSSION_CONTENT_CONFIG.csvUrl;

    if (!csvUrl && DISCUSSION_CONTENT_CONFIG.sheetId) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${DISCUSSION_CONTENT_CONFIG.sheetId}/export?format=csv&gid=${DISCUSSION_CONTENT_CONFIG.gid}`;
    }

    if (!csvUrl) {
      console.warn('⚠️ 토론 내용 스프레드시트 URL이 설정되지 않았습니다.');
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
  // markdown-it가 로드되어 있는지 확인
  if (typeof markdownit === 'undefined') {
    console.warn('⚠️ markdown-it 라이브러리가 로드되지 않았습니다. 일반 텍스트로 표시됩니다.');
    // 폴백: HTML 특수 문자만 이스케이프하고 줄바꿈 처리
    const div = document.createElement('div');
    div.textContent = content;
    return `<p>${div.innerHTML.replace(/\n/g, '<br>')}</p>`;
  }

  try {
    // markdown-it 인스턴스 생성 및 설정
    const md = markdownit({
      html: false,            // HTML 태그 허용 안 함 (보안)
      breaks: true,           // 줄바꿈을 <br>로 변환
      linkify: true,          // URL을 자동으로 링크로 변환
      typographer: true       // 더 나은 타이포그래피
    });

    // Markdown을 HTML로 변환
    const html = md.render(content);
    return html;
  } catch (error) {
    console.error('❌ Markdown 파싱 오류:', error);
    // 오류 발생 시 원본 텍스트 반환
    const div = document.createElement('div');
    div.textContent = content;
    return `<p>${div.innerHTML}</p>`;
  }
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

// ========================================
// 요약 페이지: 책 목록 로딩
// ========================================
async function loadBookList() {
  try {
    console.log('📚 책 목록 로딩 중...');

    // CSV URL 생성 (책 메타데이터 스프레드시트)
    let csvUrl = BOOK_METADATA_CONFIG.csvUrl;

    if (!csvUrl && BOOK_METADATA_CONFIG.sheetId) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${BOOK_METADATA_CONFIG.sheetId}/export?format=csv&gid=${BOOK_METADATA_CONFIG.gid}`;
    }

    if (!csvUrl) {
      console.warn('⚠️ 책 메타데이터 스프레드시트 URL이 설정되지 않았습니다.');
      return;
    }

    // 데이터 가져오기
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
    console.log('✅ 책 목록 CSV 데이터 로드 완료');

    const books = parseCSV(csvText);
    console.log(`📖 총 ${books.length}권의 책 발견`);

    // 책 목록 렌더링
    renderBookList(books);

  } catch (error) {
    console.error('❌ 책 목록 로딩 실패:', error);
  }
}

function extractYear(dateString) {
  if (!dateString) return '기타';

  // 날짜 형식에서 연도 추출 (예: "2024-09", "2024.09", "2024년 9월", "2024/09/15")
  const yearMatch = dateString.match(/(\d{4})/);
  if (yearMatch) {
    return yearMatch[1];
  }

  return '기타';
}

function renderBookList(books) {
  const tabsContainer = document.getElementById('year-tabs');
  const contentsContainer = document.getElementById('tab-contents');

  if (!tabsContainer || !contentsContainer) {
    console.warn('⚠️ year-tabs 또는 tab-contents 요소를 찾을 수 없습니다.');
    return;
  }

  // 컨테이너 비우기
  tabsContainer.innerHTML = '';
  contentsContainer.innerHTML = '';

  // 연도별로 책 그룹화
  const booksByYear = {};
  books.forEach(book => {
    const date = book['날짜'] || book['date'] || '';
    const year = extractYear(date);

    if (!booksByYear[year]) {
      booksByYear[year] = [];
    }
    booksByYear[year].push(book);
  });

  // 연도를 정렬 (최신순)
  const years = Object.keys(booksByYear).sort((a, b) => {
    if (a === '기타') return 1;
    if (b === '기타') return -1;
    return b.localeCompare(a); // 내림차순 정렬
  });

  console.log(`📅 발견된 연도: ${years.join(', ')}`);

  // 각 연도별로 탭과 콘텐츠 생성
  years.forEach((year, index) => {
    // 탭 버튼 생성
    const tabButton = document.createElement('button');
    tabButton.className = 'tab-button';
    tabButton.setAttribute('data-year', year);
    tabButton.textContent = year === '기타' ? year : `${year}년`;
    if (index === 0) {
      tabButton.classList.add('active');
    }
    tabButton.addEventListener('click', () => switchTab(year));
    tabsContainer.appendChild(tabButton);

    // 탭 콘텐츠 생성
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content year-section';
    tabContent.setAttribute('data-year', year);
    if (index === 0) {
      tabContent.classList.add('active');
    }

    // 책 그리드 생성
    const booksGrid = document.createElement('div');
    booksGrid.className = 'books-grid';

    // 해당 연도의 책들 렌더링
    booksByYear[year].forEach(book => {
      const bookId = book['책ID'] || book['book_id'] || '';
      const title = book['제목'] || book['title'] || '';
      const author = book['저자'] || book['author'] || '';
      const description = book['설명'] || book['description'] || '';
      const coverUrl = book['표지'] || book['cover'] || book['cover_url'] || '';
      const status = book['상태'] || book['status'] || '토론 완료';
      const date = book['날짜'] || book['date'] || '';

      // 필수 필드 확인
      if (!bookId || !title) {
        console.warn('⚠️ 책ID 또는 제목이 없는 항목 무시:', book);
        return;
      }

      // 책 카드 HTML 생성 (동적 페이지 링크 사용)
      const bookCard = document.createElement('a');
      bookCard.href = `book.html?id=${bookId}`;
      bookCard.className = 'book-card';

      let coverHTML = '';
      if (coverUrl) {
        coverHTML = `
          <div class="book-cover">
            <img src="${coverUrl}" alt="${title}">
          </div>
        `;
      }

      let dateHTML = '';
      if (date) {
        dateHTML = `<div class="date">${date}</div>`;
      }

      bookCard.innerHTML = `
        ${coverHTML}
        <h3>${title}</h3>
        <div class="author">${author}</div>
        ${dateHTML}
        <p>${description}</p>
        <span class="status">${status}</span>
      `;

      booksGrid.appendChild(bookCard);
    });

    tabContent.appendChild(booksGrid);
    contentsContainer.appendChild(tabContent);
  });

  console.log(`✅ ${books.length}권의 책을 ${years.length}개 연도로 분류하여 렌더링 완료`);
}

function switchTab(year) {
  // 모든 탭 버튼의 active 클래스 제거
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });

  // 모든 탭 콘텐츠 숨기기
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // 선택된 탭 활성화
  const selectedButton = document.querySelector(`.tab-button[data-year="${year}"]`);
  const selectedContent = document.querySelector(`.tab-content[data-year="${year}"]`);

  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  if (selectedContent) {
    selectedContent.classList.add('active');
  }

  console.log(`📑 탭 전환: ${year}년`);
}

// 전역 함수로 노출
window.loadBookList = loadBookList;

// ========================================
// 동적 책 페이지: URL에서 책 ID 가져오기
// ========================================
function getBookIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// ========================================
// 동적 책 페이지: 단일 책 메타데이터 로딩
// ========================================
async function loadSingleBookMetadata(bookId) {
  try {
    console.log(`📖 책 메타데이터 로딩 중: "${bookId}"`);

    // CSV URL 생성 (책 메타데이터 스프레드시트)
    let csvUrl = BOOK_METADATA_CONFIG.csvUrl;

    if (!csvUrl && BOOK_METADATA_CONFIG.sheetId) {
      csvUrl = `https://docs.google.com/spreadsheets/d/${BOOK_METADATA_CONFIG.sheetId}/export?format=csv&gid=${BOOK_METADATA_CONFIG.gid}`;
    }

    if (!csvUrl) {
      console.warn('⚠️ 책 메타데이터 스프레드시트 URL이 설정되지 않았습니다.');
      return null;
    }

    // 데이터 가져오기
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
    const books = parseCSV(csvText);

    // 해당 책 찾기
    const book = books.find(row => {
      const rowBookId = row['책ID'] || row['book_id'] || '';
      return rowBookId.toLowerCase() === bookId.toLowerCase();
    });

    if (book) {
      console.log(`✅ 책 메타데이터 찾음: "${book['제목'] || book['title']}"`);
      return book;
    } else {
      console.warn(`⚠️ 책ID "${bookId}"에 해당하는 메타데이터를 찾을 수 없습니다.`);
      return null;
    }

  } catch (error) {
    console.error('❌ 책 메타데이터 로딩 실패:', error);
    return null;
  }
}

// ========================================
// 동적 책 페이지: 페이지 내용 채우기
// ========================================
function populateBookPage(bookMetadata) {
  if (!bookMetadata) {
    console.warn('⚠️ 메타데이터가 없어 기본값을 사용합니다.');
    return;
  }

  const title = bookMetadata['제목'] || bookMetadata['title'] || '북클럽';
  const author = bookMetadata['저자'] || bookMetadata['author'] || '';
  const description = bookMetadata['설명'] || bookMetadata['description'] || '';
  const coverUrl = bookMetadata['표지'] || bookMetadata['cover'] || bookMetadata['cover_url'] || '';
  const date = bookMetadata['날짜'] || bookMetadata['date'] || '';

  // 페이지 제목 업데이트
  document.title = `${title} - 온도교회 사명자반 북클럽`;

  // 헤더 업데이트
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  if (pageTitle) pageTitle.textContent = title;
  if (pageSubtitle) pageSubtitle.textContent = author || '';

  // 저자 정보 업데이트
  const authorElement = document.getElementById('book-author');
  if (authorElement && author) {
    authorElement.textContent = `저자: ${author}`;
  }

  // 날짜 정보 업데이트
  const dateElement = document.getElementById('book-date');
  if (dateElement && date) {
    dateElement.textContent = `토론일: ${date}`;
    dateElement.style.display = 'block';
  } else if (dateElement) {
    dateElement.style.display = 'none';
  }

  // 책 설명 업데이트
  const descriptionElement = document.getElementById('book-description');
  if (descriptionElement && description) {
    descriptionElement.textContent = description;
  }

  // 책 표지 업데이트
  const coverContainer = document.getElementById('book-cover-container');
  if (coverContainer && coverUrl) {
    coverContainer.innerHTML = `<img src="${coverUrl}" alt="${title}">`;
  }

  console.log('✅ 페이지 메타데이터 업데이트 완료');
}

// ========================================
// 동적 책 페이지: 초기화
// ========================================
async function initializeDynamicBookPage() {
  const bookId = getBookIdFromURL();

  if (!bookId) {
    console.error('❌ URL에 책 ID가 없습니다. 예: book.html?id=cosmos');
    document.getElementById('page-subtitle').textContent = 'URL에 책 ID가 필요합니다 (예: ?id=cosmos)';
    return;
  }

  console.log(`🚀 동적 책 페이지 초기화: "${bookId}"`);

  // 책 메타데이터 로드 및 페이지 채우기
  const bookMetadata = await loadSingleBookMetadata(bookId);
  populateBookPage(bookMetadata);

  // 토론 내용 로드
  await initializeBookPage(bookId);
}

// 전역 함수로 노출
window.initializeDynamicBookPage = initializeDynamicBookPage;

// ========================================
// 자동 초기화 (페이지 로드 시)
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // URL 파라미터에서 책 ID 확인 (동적 페이지)
  const urlBookId = getBookIdFromURL();

  if (urlBookId) {
    console.log(`🚀 자동 초기화: 동적 책 페이지 감지됨 (ID: "${urlBookId}")`);
    initializeDynamicBookPage();
    return;
  }

  // body 태그에서 data-book-id 속성 읽기 (정적 페이지)
  const bookId = document.body.getAttribute('data-book-id');

  if (bookId) {
    console.log(`🚀 자동 초기화: "${bookId}" 페이지 감지됨`);
    initializeBookPage(bookId);
  } else if (document.body.getAttribute('data-page-type') === 'summary') {
    console.log('🚀 자동 초기화: 요약 페이지 감지됨');
    loadBookList();
  } else {
    console.log('ℹ️ data-book-id 또는 data-page-type 속성이 없습니다.');
  }
});
