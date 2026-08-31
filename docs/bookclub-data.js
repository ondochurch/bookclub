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

    // 데이터 가져오기
    const response = await fetch(csvUrl);

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
// 공통 유틸
// ========================================

// 시트 값은 그대로 innerHTML에 넣으므로 escape 한다.
// (제목에 <, & 같은 문자가 섞이면 마크업이 깨진다)
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// 시트는 항목마다 한국판과 영문판 두 벌을 가질 수 있다 (title/title_en 등).
// 어느 쪽을 쓸지는 페이지 언어(<html lang>)가 정한다 — 나중에 만들 영어 페이지는
// lang="en"이므로 영문 표기가 먼저 나온다. 한쪽이 비어 있으면 있는 쪽으로 넘어간다.
function prefersEnglish() {
  return (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
}

function pick(row, keys) {
  for (const k of keys) {
    const v = (row[k] || '').trim();
    if (v) return v;
  }
  return '';
}

// 두 벌 다 필요한 경우 (hover로 뒤집을 항목) — 우선판과 나머지를 함께 돌려준다.
function localizedPair(row, koKeys, enKeys) {
  const ko = pick(row, koKeys);
  const en = pick(row, enKeys);

  const primary = prefersEnglish() ? (en || ko) : (ko || en);
  const other = primary === ko ? en : ko;

  return { primary: primary, alt: other && other !== primary ? other : '' };
}

// 한 벌만 필요한 경우 (뒤집지 않는 자리)
function localized(row, koKeys, enKeys) {
  return localizedPair(row, koKeys, enKeys).primary;
}

// 목록·표지 카드처럼 좁은 자리에서는 부제를 뺀다.
// 영문 제목은 "Prayer: Experiencing Awe and..." 처럼 부제가 길어서
// 그대로 두면 한국어 제목 자리를 넘어 저자 줄까지 덮는다.
function stripSubtitle(value) {
  return String(value || '').split(/[:：]/)[0].trim();
}

// 좁은 자리용 (부제 없음). 책 상세 페이지는 bookTitle()로 전체 제목을 쓴다.
function titlePair(row) {
  const pair = localizedPair(row, ['제목', 'title'], ['title_en']);
  return { primary: stripSubtitle(pair.primary), alt: stripSubtitle(pair.alt) };
}
function authorPair(row) { return localizedPair(row, ['저자', 'author'], ['author_en']); }
function coverPair(row)  { return localizedPair(row, ['표지', 'cover', 'cover_url'], ['cover_url_en']); }

function bookTitle(row)  { return localized(row, ['제목', 'title'],       ['title_en']); }
function bookAuthor(row) { return localized(row, ['저자', 'author'],      ['author_en']); }
function bookDesc(row)   { return localized(row, ['설명', 'description'], ['description_en']); }

// 다른 판이 있으면 두 벌을 겹쳐 두고 CSS가 hover에서 바꿔 보여준다.
function swapText(pair) {
  const primary = escapeHtml(pair.primary);
  if (!pair.alt) return primary;
  return `<span class="txt-primary">${primary}</span>` +
         `<span class="txt-alt">${escapeHtml(pair.alt)}</span>`;
}

// "2026년 3월", "2026-03", "2026.3" 등에서 정렬용 숫자(YYYYMM)를 뽑는다.
// 월이 없으면 연도만으로 비교한다.
function dateKey(value) {
  const m = String(value || '').match(/(\d{4})\D+(\d{1,2})/) || String(value || '').match(/(\d{4})/);
  if (!m) return 0;
  return Number(m[1]) * 100 + (m[2] ? Number(m[2]) : 0);
}

// 표지 영역 마크업. 두 판이 다 있으면 <img class="alt-cover">를 겹쳐 두고
// CSS가 hover에서 바꿔 보여준다. 표지가 아예 없으면 제목 첫 글자로 대체한다.
function coverMarkup(row, rawTitle) {
  const { primary, alt } = coverPair(row);
  const title = escapeHtml(rawTitle);

  if (!primary) {
    return `<span class="no-cover">${escapeHtml(rawTitle.charAt(0))}</span>`;
  }

  if (!alt) {
    return `<img src="${escapeHtml(primary)}" alt="${title}" loading="lazy">`;
  }

  // 두 판이 있을 때만 겹쳐 둔다. 뒷장(다른 판)이 먼저, 앞장(우선판)이 그 위에.
  // 앞장이 왼쪽 모서리를 축으로 열리는 연출은 styles.css의 .primary-cover가 담당.
  return `<img class="alt-cover" src="${escapeHtml(alt)}" alt="" aria-hidden="true" loading="lazy">` +
         `<img class="primary-cover" src="${escapeHtml(primary)}" alt="${title}" loading="lazy">`;
}

function metadataCsvUrl() {
  if (BOOK_METADATA_CONFIG.csvUrl) return BOOK_METADATA_CONFIG.csvUrl;
  if (!BOOK_METADATA_CONFIG.sheetId) return '';
  return `https://docs.google.com/spreadsheets/d/${BOOK_METADATA_CONFIG.sheetId}/export?format=csv&gid=${BOOK_METADATA_CONFIG.gid}`;
}

// 책 메타데이터 시트를 한 번만 받아 재사용한다 (한 페이지에서 여러 번 쓰임)
let metadataPromise = null;
function fetchBookMetadata() {
  if (metadataPromise) return metadataPromise;

  const csvUrl = metadataCsvUrl();
  if (!csvUrl) {
    console.warn('⚠️ 책 메타데이터 스프레드시트 URL이 설정되지 않았습니다.');
    return Promise.resolve([]);
  }

  metadataPromise = fetch(csvUrl)
    .then(function (res) {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(parseCSV)
    .catch(function (err) {
      console.error('❌ 책 메타데이터 로딩 실패:', err);
      metadataPromise = null;   // 다음 시도에서 재요청할 수 있게
      return [];
    });

  return metadataPromise;
}

// ========================================
// HTML 업데이트 함수
// ========================================
function updateSection(sectionId, content) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // 내용이 없으면 placeholder 유지
  if (!content || content.trim() === '') return;

  // 마크다운은 <p>/<ul> 같은 블록 요소를 만들므로 placeholder <p> 안이 아니라
  // 컨테이너 자체를 통째로 교체한다. 색·여백은 styles.css의 .prose가 담당.
  section.innerHTML = formatContent(content);
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
  console.log('📚 책 목록 로딩 중...');

  const books = await fetchBookMetadata();
  if (!books.length) return;

  console.log(`📖 총 ${books.length}권의 책 발견`);
  renderBookList(books);
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
    tabContent.className = 'tab-content';
    tabContent.setAttribute('data-year', year);
    if (index === 0) {
      tabContent.classList.add('active');
    }

    // 책 목록 생성
    const booksGrid = document.createElement('div');
    booksGrid.className = 'books';

    // 연도 안에서는 최신 날짜가 위로 (연도 탭도 최신순이라 방향을 맞춘다)
    booksByYear[year].sort(function (a, b) {
      return dateKey(b['날짜'] || b['date']) - dateKey(a['날짜'] || a['date']);
    });

    // 해당 연도의 책들 렌더링
    booksByYear[year].forEach(book => {
      const bookId = book['책ID'] || book['book_id'] || '';
      const title = titlePair(book);
      const author = authorPair(book);
      const description = bookDesc(book);
      const status = book['상태'] || book['status'] || '토론 완료';
      const date = book['날짜'] || book['date'] || '';

      // 필수 필드 확인
      if (!bookId || !title.primary) {
        console.warn('⚠️ 책ID 또는 제목이 없는 항목 무시:', book);
        return;
      }

      // 책 항목 HTML 생성 (동적 페이지 링크 사용)
      const bookCard = document.createElement('a');
      bookCard.href = `book.html?id=${encodeURIComponent(bookId)}`;
      bookCard.className = 'book-entry';

      // 상태 문구에 "완료"가 있으면 정보색, 아니면 강조색(진행 중)으로 매핑
      const statusClass = status.includes('완료') ? 'status-done' : 'status-active';

      // 저자 · 날짜는 제목 아래 한 줄로 (한글 이름이 길어도 깨지지 않도록).
      // 날짜는 판본과 무관하지만, 두 벌을 같은 칸에 포개려면 한쪽에만 텍스트 노드를
      // 남기면 안 되므로 양쪽 문구에 모두 넣는다.
      const withDate = (who) => [who, date].filter(Boolean).join(' · ');
      const metaLine = swapText({
        primary: withDate(author.primary),
        alt: author.alt ? withDate(author.alt) : '',
      });

      bookCard.innerHTML = `
        <div class="book-cover">${coverMarkup(book, title.primary)}</div>
        <div class="book-main">
          <h3>${swapText(title)}</h3>
          ${metaLine ? `<p class="book-meta">${metaLine}</p>` : ''}
          ${description ? `<p class="desc">${escapeHtml(description)}</p>` : ''}
          <span class="status ${statusClass}">${escapeHtml(status)}</span>
        </div>
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
// 표지 목록 (index.html 홈, register.html 신청 페이지)
// ========================================
// <div class="cover-grid" data-semester="2026-봄"> 또는 data-year="2025" 안의
// 하드코딩된 표지를 시트 내용으로 교체한다.
//   - data-semester: semester 컬럼 값이 정확히 같은 행만 (학기 라인업)
//   - data-year:     날짜의 연도가 같은 행만 (지난 연도 아카이브)
//
// 시트를 못 불러오거나 조건에 맞는 행이 하나도 없으면 HTML에 있던 표지를 그대로 둔다
// (예전에 CORS로 로딩이 막힌 적이 있어, 실패 시 빈 화면이 되지 않도록 폴백을 남긴다).
// 폴백도 없는 그리드(예: 아직 확정 안 된 학기)는 그대로 비었다가, 아래에서 섹션째 감춘다.
function cardsForShelfHTML(rows) {
  return rows.map(function (row) {
    const title = titlePair(row);
    const author = authorPair(row);
    const bookId = row['책ID'] || row['book_id'] || '';

    // 책ID가 있으면 토론 기록 페이지로 넘어가는 링크로 만든다
    const open = bookId
      ? `<a class="cover-card" href="book.html?id=${encodeURIComponent(bookId)}">`
      : '<div class="cover-card">';
    const close = bookId ? '</a>' : '</div>';

    // 제목과 저자를 한 덩어리로 묶어 통째로 전환한다.
    // 따로 전환하면 영문 제목이 한 줄 더 길 때 그 여유가 제목과 저자 "사이"에
    // 벌어진다. 묶어 두면 남는 공간이 카드 맨 아래로 가서 눈에 띄지 않는다.
    const block = (t, a) =>
      `<span class="t">${escapeHtml(t)}</span>` +
      (a ? `<span class="a">${escapeHtml(a)}</span>` : '');

    const hasAlt = title.alt || author.alt;
    const meta = hasAlt
      ? `<span class="txt-primary">${block(title.primary, author.primary)}</span>` +
        `<span class="txt-alt">${block(title.alt || title.primary, author.alt || author.primary)}</span>`
      : block(title.primary, author.primary);

    return `
      ${open}
        <div class="shot">${coverMarkup(row, title.primary)}</div>
        <div class="meta">${meta}</div>
      ${close}`;
  }).join('');
}

// semester(정확히 같은 학기, 읽는 순서) 또는 year(그 해 전체, 최신순)로 시트 행을 골라낸다
function matchShelfRows(books, semester, year) {
  if (semester) {
    const rows = books.filter(function (row) {
      return (row['학기'] || row['semester'] || '').trim() === semester;
    });
    rows.sort(function (a, b) { return dateKey(a['날짜'] || a['date']) - dateKey(b['날짜'] || b['date']); });
    return rows;
  }
  const rows = books.filter(function (row) { return extractYear(row['날짜'] || row['date']) === year; });
  rows.sort(function (a, b) { return dateKey(b['날짜'] || b['date']) - dateKey(a['날짜'] || a['date']); });
  return rows;
}

async function loadShelves() {
  const grids = document.querySelectorAll('[data-semester], [data-year]');
  if (!grids.length) return;

  const books = await fetchBookMetadata();
  if (!books.length) {
    console.warn('⚠️ 시트를 불러오지 못해 HTML의 기존 표지를 유지합니다.');
    return;
  }

  grids.forEach(function (grid) {
    const semester = (grid.getAttribute('data-semester') || '').trim();
    const year = (grid.getAttribute('data-year') || '').trim();
    if (!semester && !year) return;

    const label = semester || `${year}년`;
    const matched = matchShelfRows(books, semester, year);

    if (!matched.length) {
      console.warn(`⚠️ "${label}"에 해당하는 행이 없어 기존 표지를 유지합니다.`);
    } else {
      grid.innerHTML = cardsForShelfHTML(matched);
      console.log(`✅ "${label}" ${matched.length}권 렌더링 완료`);
    }

    // 시트에서도 못 채우고 폴백 표지도 없으면 섹션째로 감춘다
    // (제목만 덩그러니 남은 빈 섹션이 보이지 않도록)
    if (!grid.children.length) {
      const section = grid.closest('section');
      if (section) section.hidden = true;
      console.warn(`⚠️ "${label}": 표시할 책이 없어 섹션을 감춥니다.`);
    }
  });
}

window.loadShelves = loadShelves;

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
  console.log(`📖 책 메타데이터 로딩 중: "${bookId}"`);

  const books = await fetchBookMetadata();

  const book = books.find(row => {
    const rowBookId = row['책ID'] || row['book_id'] || '';
    return rowBookId.toLowerCase() === bookId.toLowerCase();
  });

  if (book) {
    console.log(`✅ 책 메타데이터 찾음: "${book['제목'] || book['title']}"`);
    return book;
  }

  console.warn(`⚠️ 책ID "${bookId}"에 해당하는 메타데이터를 찾을 수 없습니다.`);
  return null;
}

// ========================================
// 동적 책 페이지: 페이지 내용 채우기
// ========================================
function populateBookPage(bookMetadata) {
  if (!bookMetadata) {
    console.warn('⚠️ 메타데이터가 없어 기본값을 사용합니다.');
    return;
  }

  const title = bookTitle(bookMetadata) || '북클럽';
  const author = bookAuthor(bookMetadata);
  const description = bookDesc(bookMetadata);
  const date = bookMetadata['날짜'] || bookMetadata['date'] || '';

  // 페이지 제목 업데이트
  document.title = `${title} - 온도교회 사명자반 북클럽`;

  // 헤더 업데이트
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  if (pageTitle) pageTitle.textContent = title;
  if (pageSubtitle) pageSubtitle.textContent = author || '';

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

  // 책 표지 업데이트 (한/영 두 판이 있으면 hover로 전환)
  const coverContainer = document.getElementById('book-cover-container');
  if (coverContainer) {
    coverContainer.innerHTML = coverMarkup(bookMetadata, title);
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
  // 표지 목록(학기·연도)은 다른 초기화와 독립적으로 동작한다
  // (홈·신청 페이지에 있고, 없으면 아무것도 하지 않음)
  loadShelves();

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
  }
});
