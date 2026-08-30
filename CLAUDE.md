# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for 온도교회 사명자반 북클럽 (Ondo Church Mission Class Book Club). The site serves as a hub for book club activities, including registration, book suggestions, content summaries, and participant tracking.

## Repository Structure

```
bookclub/
├── docs/
│   ├── index.html              # Main landing page with navigation
│   ├── register.html           # Book club registration page
│   ├── summary.html            # Book list, grouped into year tabs (dynamic)
│   ├── book.html                # Dynamic per-book page, reads ?id=<bookId> from URL
│   ├── book-cosmos.html        # Legacy static discussion page (superseded by book.html)
│   ├── book-today-worship.html # Legacy static discussion page (superseded by book.html)
│   ├── resources.html          # Links out to external reference spreadsheets
│   ├── questions.html          # Theological questions submission page
│   ├── participants.html       # Participant tracking (Airtable integration)
│   ├── styles.css              # Shared design system (all pages except the legacy book-*.html)
│   └── bookclub-data.js        # Google Spreadsheet data loader script
├── AIRTABLE_SETUP.md           # Detailed Airtable setup guide
├── SPREADSHEET_SETUP.md        # Google Spreadsheet integration guide
└── README.md
```

The website is hosted from the `docs/` directory, likely using GitHub Pages.

## Architecture

This is a multi-page static website with no build process, dependencies, or framework. The site consists of:

- **docs/index.html**: Modern landing page with card-based navigation. Features:
  - Responsive grid layout with 4 navigation cards
  - Modern gradient header (purple/blue gradient: #667eea to #764ba2)
  - Noto Sans KR font from Google Fonts
  - Clean, professional design with hover animations
  - Links to:
    - register.html (북클럽 신청)
    - Book suggestion page (새로운 책 제안) - external Google Sheet link
    - Content summary page (북클럽 내용 정리) - summary.html
    - Other resources (기타 자료) - resources.html
    - Participant tracking (참여자 현황) - **href is currently empty; needs Airtable link**
    - Theological questions (신학 질문) - questions.html

- **docs/register.html**: Book club registration page with embedded CSS. Features:
  - Purple/blue gradient header matching landing page
  - Book cover image hosted on Kyobobook CDN
  - External link to Google Forms for registration
  - Noto Sans KR font matching landing page

- **docs/summary.html**: Book club content summary page listing all books. Features:
  - Books are grouped into year tabs, generated dynamically from the metadata spreadsheet (`extractYear()` / `renderBookList()` in `bookclub-data.js`)
  - Card-based grid layout for book entries within each year tab
  - Book cover images with hover effects
  - Each card links to `book.html?id=<bookId>` (the dynamic per-book page), not a static file
  - Back navigation to home page

- **docs/book.html**: Dynamic per-book discussion page (replaces the old one-static-page-per-book pattern). Features:
  - Reads the book id from the `?id=` query parameter (`getBookIdFromURL()`)
  - Loads book metadata (title, author, cover, date, description) from the metadata spreadsheet and populates the header/hero via `populateBookPage()`
  - Loads discussion content (`#discussion`, `#qa` sections) from the discussion-content spreadsheet, same as the legacy static pages
  - Single template serves every book — no new HTML file is needed per book anymore

- **docs/book-cosmos.html** & **docs/book-today-worship.html**: Legacy static discussion pages, superseded by `book.html`. Kept for any existing inbound links; new books should not get a new static page — just add a row to the metadata spreadsheet and link to `book.html?id=<bookId>`.

- **docs/resources.html**: Static page of curated external links (Google Sheets) useful to the book club — e.g. 과신대 북클럽 리스트, 도서 분류, 리뷰 모음. Card grid, no dynamic data loading.

- **docs/questions.html**: Theological questions submission page. Features:
  - Support for both Airtable Forms (recommended) and Google Forms
  - Detailed setup instructions for both options
  - Information about question types
  - Airtable option provides better question management and tracking
  - Can be configured with Airtable Form iframe or Google Form URL
  - Note: GitHub Pages doesn't support databases; uses external services

- **docs/participants.html**: Participant tracking page with Airtable integration. Features:
  - Embedded Airtable view (ready for iframe integration)
  - Detailed setup instructions included in the page
  - Can display participant lists, attendance, and progress
  - See AIRTABLE_SETUP.md for complete integration guide

- **docs/book-cosmos.html** & **docs/book-today-worship.html**: Individual book discussion pages. Features:
  - Book information section with cover image
  - Two main content sections with IDs:
    - `#discussion` - 주요 토론 내용 (Main Discussion)
    - `#qa` - 질문과 답변 (Q&A)
  - Automatic content loading from Google Spreadsheet via `bookclub-data.js`
  - Placeholder sections shown if no data available
  - Back navigation to summary page

- **docs/bookclub-data.js**: JavaScript module for loading book metadata and discussion content, and for driving the dynamic pages. Features:
  - Fetches data from **two** Google Spreadsheet tabs (published as CSV):
    - Book metadata tab (`BOOK_METADATA_CONFIG`) — used by `summary.html` (book list) and `book.html` (per-book header)
    - Discussion content tab (`DISCUSSION_CONTENT_CONFIG`) — used by `book.html` and the legacy static book pages
  - Uses **PapaParse** library for robust CSV parsing (handles commas, quotes, newlines)
  - Uses **markdown-it** library for Markdown rendering (`formatContent()`)
  - **Automatic initialization** on `DOMContentLoaded`, branching on what's present in the page:
    - `?id=` URL param present → dynamic book page (`initializeDynamicBookPage()`), used by `book.html`
    - `data-book-id` attribute on `<body>` → static legacy book page (`initializeBookPage()`)
    - `data-page-type="summary"` attribute on `<body>` → book list page (`loadBookList()`), used by `summary.html`
  - Falls back to placeholder text if no data is found for a section/book
  - See SPREADSHEET_SETUP.md for setup instructions

  **Dependencies**:
  - PapaParse 5.4.1 (CSV parsing)
  - markdown-it 14.0.0 (Markdown rendering)
  - Both loaded via CDN in pages that use `bookclub-data.js`

  **Usage in HTML** (dynamic per-book page, e.g. `book.html`):
  ```html
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js"></script>
    <script src="bookclub-data.js"></script>
  </head>
  <body>
    <!-- No manual initialization needed - reads ?id= from the URL -->
  </body>
  ```
  Visit as `book.html?id=cosmos`.

  **Markdown Support**:
  Content in Google Spreadsheet can use Markdown syntax:
  - `**bold**`, `*italic*`, `~~strikethrough~~`
  - Lists, links, headings, blockquotes
  - GitHub Flavored Markdown features
  - Falls back to plain text if markdown-it not loaded

## Development

### Viewing the Site Locally

Since this is a static HTML file with no dependencies, simply open the file in a browser:

```bash
open docs/index.html
```

Or use any local web server, such as Python's built-in server:

```bash
cd docs
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Deployment

Changes pushed to the `main` branch in the `docs/` directory will be automatically deployed if GitHub Pages is configured to serve from the `docs/` folder.

## Content Updates

When updating the site content, note:

- The site is in Korean - maintain Korean text for all user-facing content
- The landing page (index.html) links:
  - 북클럽 신청 (Book club registration) - links to register.html
  - 새로운 책 제안 (New book suggestion) - links to Google Spreadsheet
  - 북클럽 내용 정리 (Book club content summary) - links to summary.html
  - 기타 자료 (Other resources) - links to resources.html
  - 참여자 현황 (Participant status) - **`href` is currently empty**; needs to link to participants.html or an Airtable view once set up
  - 신학 질문 (Theological questions) - links to questions.html
- The summary page lists every book from the metadata spreadsheet, grouped by year; each card links to `book.html?id=<bookId>` (there is no longer a static HTML file per book — `book-cosmos.html` and `book-today-worship.html` are legacy pages kept only for old inbound links)
- To add a new book:
  - **Recommended**: Add a row to the book metadata spreadsheet (책ID, 제목, 저자, 설명, 표지, 상태, 날짜) and a row per section to the discussion content spreadsheet — it will automatically appear in `summary.html` and be viewable at `book.html?id=<bookId>`, no HTML changes needed
  - Do not create a new static `book-*.html` file for new books; that pattern is deprecated in favor of `book.html`
- **Important**: GitHub Pages is static-only and cannot run databases. External services used:
  - Google Forms for collecting registrations and questions
  - Google Spreadsheet for book suggestions AND book discussion content (auto-loaded via JavaScript)
  - Airtable for participant tracking and theological questions (requires manual setup - see AIRTABLE_SETUP.md)

## Airtable Integration

Airtable can be used for two purposes in this website:

### 1. Participant Tracking (participants.html)
1. Create a free account at [airtable.com/signup](https://airtable.com/signup)
2. Follow the detailed guide in `AIRTABLE_SETUP.md`
3. Create a Base for "북클럽 참여자 현황"
4. Get the shareable embed link
5. Update `docs/participants.html` with your Airtable iframe code

### 2. Theological Questions (questions.html) - Recommended
1. Use the same Airtable account
2. Create a new Base for "신학 질문"
3. Set up fields for questions, categories, answers, status
4. Create an Airtable Form (Forms tab)
5. Get the form share link
6. Update `docs/questions.html` with the Airtable form iframe

**Why Airtable for questions?**
- Better organization and categorization
- Track answer status
- Assign responders
- Build FAQ database
- More powerful than Google Forms

Both pages include step-by-step instructions and are ready for integration.

## Google Spreadsheet Integration

The website uses Google Spreadsheet as a simple database for managing book discussion content. This allows non-technical users to easily update the book summaries without editing HTML files.

### How It Works

1. **Data Source**: Google Spreadsheet (published as CSV or with public access)
2. **Data Loader**: `docs/bookclub-data.js` fetches and parses the spreadsheet
3. **Auto-Population**: Content is automatically injected into book pages on load
4. **Fallback**: If no data found, placeholder text remains visible

### Setup Process

1. Create a Google Spreadsheet with the following structure:
   - Column A: `책ID` (book ID) - e.g., "cosmos", "today-worship"
   - Column B: `섹션` (section) - "주요토론", "인사이트", "질문답변"
   - Column C: `내용` (content) - the actual discussion text

2. Publish the spreadsheet:
   - **Option 1**: File → Share → Publish to web → CSV format
   - **Option 2**: Share → Anyone with the link → Viewer

3. Update `docs/bookclub-data.js`:
   ```javascript
   const SPREADSHEET_CONFIG = {
     csvUrl: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0',
     sheetId: 'YOUR_SHEET_ID',
     gid: '0'
   };
   ```

4. The script automatically loads data when book pages are visited

### Adding New Books

New books no longer need a new HTML file — `book.html` is a shared template driven entirely by spreadsheet data:

1. Add a row to the metadata spreadsheet with the new `책ID` (책ID, 제목, 저자, 설명, 표지, 상태, 날짜)
2. Add one row per section (주요토론, 질문답변) to the discussion content spreadsheet with the same `책ID`
3. Link to it as `book.html?id=<bookId>` from `summary.html` (this happens automatically since the summary page is generated from the metadata spreadsheet)

**See SPREADSHEET_SETUP.md for complete step-by-step instructions.**

- Book cover images in register.html are linked from external CDN (Kyobobook)
- The Google Form link in register.html should be updated when creating new book club sessions
- Current registration is for "2026년 봄학기" (2026 Spring Semester)

## Styling Notes

The site uses a shared stylesheet, **`docs/styles.css`**, loaded by every page except the legacy static book pages (`book-cosmos.html`, `book-today-worship.html`, which keep their old embedded styles since they're deprecated and not being maintained). Do not add new per-page `<style>` blocks — add shared classes to `styles.css` instead so pages stay visually consistent.

**Design direction — book covers are the main character.** The site's only real visual asset is the book cover art (Kyobobook CDN), so pages lead with covers rather than with text or decorative graphics: the landing page opens with the current semester's covers in a 4-up grid, and `summary.html` lists past books cover-first. Deliberately avoids common AI-generated-site patterns (purple/blue gradient headers, emoji-as-icons, rounded-corner cards with shadow-lift hover).

> An earlier pass styled the site after Edward Tufte's data-ink aesthetic. It was abandoned: that recipe suits dense analytical documents, and applying "minimize non-data ink" to a 6-link navigation hub with no data produced a near-empty page. Don't reach for it again here.

- **Color** (CSS vars in `styles.css`) — two accents, both semantic rather than decorative, since the covers already supply the page's color:
  - `--paper` (#faf8f3 light / #16140f dark) — background; `--paper-2` — hover/raised surfaces
  - `--ink` (#1c1a17 / #f0ece2) — body text; `--muted` — secondary text and labels
  - `--rule` (#d5cdbc / #3a352b) — dividers
  - `--accent` (#a6300e / #e8836a) — "act now": the signup CTA, current semester, "진행 중" status, 준비 중 flags, hover
  - `--accent-2` (#3e4a5c / #9db2cc) — "settled / informational": kickers, "완료" status
  - Dark mode follows the OS via `prefers-color-scheme`; `[data-theme="dark"/"light"]` on the root overrides it if a toggle is ever added.
- **Typography** — two Korean faces, split by role (both from Google Fonts, one request):
  - `Noto Serif KR` for headings, book titles, and the wordmark (`--serif`)
  - `Noto Sans KR` for body copy, descriptions, labels, nav, and buttons (`--sans`)
  - **Never apply `font-style: italic` to Korean text.** Korean fonts ship no true italic, so browsers synthesize a faux oblique that looks broken. (An earlier revision had this bug in five places.)
  - Sizing is rem-based off `html { font-size: 100% }` so the reader's own text-size setting is respected — no fixed px type.
- **Layout**: a single centered column (`.frame`, max-width 62rem). Covers use `aspect-ratio: 2/3` with a soft shadow so they read as physical objects. Navigation and resource links are full-width rows (`.index-row`) with a hover background tying the label to its trailing arrow; the book list (`.book-entry`) is cover + stacked title/meta/description, avoiding fixed-width columns that break on long Korean names.
- **Motion**: short color/background transitions only (~0.12s), no entrance animations or hover-lift. All transitions are disabled under `prefers-reduced-motion`.
- No emoji used as icons or section markers anywhere in the redesigned pages.
- **Copy is not to be invented.** All user-facing text traces to the original pages or the spreadsheet. Where a fact isn't known (e.g. whether the semester's listed books are candidates or a confirmed reading list), use a neutral label rather than asserting one — don't write claims about how the club operates.
