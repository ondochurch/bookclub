# bookclub

온도교회 사명자반 북클럽 웹사이트.

https://ondochurch.github.io/bookclub/

빌드 과정이나 의존성이 없는 정적 사이트입니다. `docs/` 폴더가 GitHub Pages로 배포됩니다.

## 로컬에서 보기

```bash
python3 serve.py        # http://localhost:8000
```

`docs/`를 캐시 없이 서빙합니다. `python3 -m http.server`를 쓰면 브라우저가 `styles.css` /
`bookclub-data.js`의 옛 버전을 계속 물고 있어, 고친 내용이 반영이 안 된 것처럼 보입니다.

## 책 추가하기

HTML을 건드릴 필요 없이 **Google 스프레드시트에 행만 추가**하면 됩니다.

1. 책 메타데이터 시트에 행 추가 (`book_id`, `title`, `author`, `cover_url`, `date`, `semester` …)
2. 토론 내용 시트에 섹션별 행 추가 (같은 `책ID`, `주요토론` / `질문답변`)

`summary.html` 목록과 홈 책장에 자동으로 반영되고, `book.html?id=<책ID>`로 열립니다.

자세한 설정은 [SPREADSHEET_SETUP.md](SPREADSHEET_SETUP.md), 참여자·질문 관리는
[AIRTABLE_SETUP.md](AIRTABLE_SETUP.md)를 보세요.

## 수정 시 주의

`docs/styles.css`나 `docs/bookclub-data.js`를 고치면, **그 파일을 참조하는 모든 페이지에서
`?v=N` 숫자를 올려야** 합니다 (`styles.css`는 8개, 스크립트는 5개 페이지). 안 그러면 브라우저가
캐시된 옛 파일을 계속 씁니다. 개발 규칙 전반은 [CLAUDE.md](CLAUDE.md)에 정리돼 있습니다.
