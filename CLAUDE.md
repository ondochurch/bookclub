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
│   ├── summary.html            # Book club content summary list
│   ├── questions.html          # Theological questions submission page
│   ├── participants.html       # Participant tracking (Airtable integration)
│   ├── book-cosmos.html        # 코스모스 discussion page
│   ├── book-today-worship.html # 오늘이라는 예배 discussion page
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
    - Book suggestion page (새로운 책 제안) - placeholder
    - Content summary page (북클럽 내용 정리) - placeholder
    - Participant tracking (참여자 현황) - needs Airtable link

- **docs/register.html**: Book club registration page with embedded CSS. Features:
  - Purple/blue gradient header matching landing page
  - Book cover image hosted on Kyobobook CDN
  - External link to Google Forms for registration
  - Noto Sans KR font matching landing page

- **docs/summary.html**: Book club content summary page listing all books. Features:
  - Card-based grid layout for book entries
  - Links to individual book discussion pages
  - Back navigation to home page

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
  - Book information section
  - Three main content sections with IDs:
    - `#discussion` - 주요 토론 내용 (Main Discussion)
    - `#insights` - 인사이트 및 적용점 (Insights and Applications)
    - `#qa` - 질문과 답변 (Q&A)
  - Automatic content loading from Google Spreadsheet via `bookclub-data.js`
  - Placeholder sections shown if no data available
  - Back navigation to summary page

- **docs/bookclub-data.js**: JavaScript module for loading book discussion content. Features:
  - Fetches data from Google Spreadsheet (published as CSV)
  - Uses **PapaParse** library for robust CSV parsing (handles commas, quotes, newlines)
  - Automatically populates book page sections
  - Configurable spreadsheet URL
  - See SPREADSHEET_SETUP.md for setup instructions

  **Dependencies**: PapaParse 5.4.1 (loaded via CDN in book pages)

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
  - 참여자 현황 (Participant status) - links to participants.html (Airtable setup required)
  - 신학 질문 (Theological questions) - links to questions.html
- The summary page lists books with individual discussion pages:
  - 코스모스 (Cosmos) by 칼 세이건 - book-cosmos.html
  - 오늘이라는 예배 (Today's Worship) by 티시 해리슨 워런 - book-today-worship.html
- To add discussion content:
  - **Option 1 (Recommended)**: Update the Google Spreadsheet - content automatically loads on page refresh
  - **Option 2**: Directly edit the individual book pages and replace the placeholder sections
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

To add a new book with spreadsheet integration:

1. Create the book page HTML (copy from existing book page)
2. Add script tag: `<script src="bookclub-data.js"></script>`
3. Add section IDs: `#discussion`, `#insights`, `#qa`
4. Add initialization script:
   ```javascript
   document.addEventListener('DOMContentLoaded', function() {
     window.loadBookClubData('new-book-id');
   });
   ```
5. Add data to spreadsheet with the new book ID

**See SPREADSHEET_SETUP.md for complete step-by-step instructions.**

- Book cover images in register.html are linked from external CDN (Kyobobook)
- The Google Form link in register.html should be updated when creating new book club sessions
- Current registration is for "9월 (코스모스)" (September - Cosmos)

## Styling Notes

**Landing Page (index.html):**
- Modern gradient header: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Background: #f8f9fa (light gray)
- Text: #333 (dark gray), #2c3e50 (headings), #666 (secondary)
- Card-based layout with hover effects (translateY and shadow transitions)
- Responsive grid layout (auto-fit, minmax(280px, 1fr))

**Registration Page (register.html):**
- Matches landing page color scheme:
  - Purple/blue gradient header: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  - Background: #f8f9fa (light gray)
  - Text: #333 (dark gray), #2c3e50 (headings)
  - Button: Purple gradient matching header with hover lift effect
  - Noto Sans KR font matching landing page
