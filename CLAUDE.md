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
│   └── book-today-worship.html # 오늘이라는 예배 discussion page
├── AIRTABLE_SETUP.md           # Detailed Airtable setup guide
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
  - Placeholder for Google Forms integration
  - Instructions for setting up the form
  - Information about question types
  - Can be configured with Google Form URL or embedded iframe
  - Note: GitHub Pages doesn't support databases; uses Google Forms for data collection

- **docs/participants.html**: Participant tracking page with Airtable integration. Features:
  - Embedded Airtable view (ready for iframe integration)
  - Detailed setup instructions included in the page
  - Can display participant lists, attendance, and progress
  - See AIRTABLE_SETUP.md for complete integration guide

- **docs/book-cosmos.html** & **docs/book-today-worship.html**: Individual book discussion pages. Features:
  - Book information section
  - Placeholder sections for discussion content, insights, and Q&A
  - Ready for content to be added later
  - Back navigation to summary page

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
  - 오늘이라는 예배 (Today's Worship) by 박제욱 - book-today-worship.html
- To add discussion content, edit the individual book pages and replace the placeholder sections
- **Important**: GitHub Pages is static-only and cannot run databases. External services used:
  - Google Forms for collecting registrations and questions
  - Google Spreadsheet for book suggestions
  - Airtable for participant tracking (requires manual setup - see AIRTABLE_SETUP.md)

## Airtable Integration

To set up Airtable for participant tracking:
1. Create a free account at [airtable.com/signup](https://airtable.com/signup)
2. Follow the detailed guide in `AIRTABLE_SETUP.md`
3. Create a Base for "북클럽 참여자 현황"
4. Get the shareable embed link
5. Update `docs/participants.html` with your Airtable iframe code

The participants page includes step-by-step instructions and is ready for integration.
- Book cover images in register.html are linked from external CDN (Kyobobook)
- The Google Form link in register.html should be updated when creating new book club sessions
- Current registration is for "5월 (요한복음 뒷조사)" (May - John's Gospel)

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
