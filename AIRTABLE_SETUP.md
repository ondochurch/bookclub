# Airtable 설정 가이드

이 가이드는 온도교회 북클럽 웹사이트에 Airtable을 연동하는 방법을 안내합니다.

## 📋 목차
1. [Airtable이란?](#airtable이란)
2. [계정 생성](#계정-생성)
3. [Base 설정](#base-설정)
4. [웹사이트 연동](#웹사이트-연동)
5. [사용 사례](#사용-사례)

---

## Airtable이란?

**Airtable**은 스프레드시트와 데이터베이스의 장점을 결합한 클라우드 기반 협업 도구입니다.

### 장점:
- ✅ **무료 플랜** 사용 가능 (1,200 레코드까지)
- ✅ **쉬운 사용법** (엑셀/구글 시트와 유사)
- ✅ **실시간 협업** 여러 사람이 동시에 편집
- ✅ **다양한 뷰** Grid, Calendar, Kanban, Gallery
- ✅ **폼 기능** 외부에서 데이터 입력 가능
- ✅ **웹 임베딩** 웹사이트에 직접 삽입 가능

---

## 계정 생성

### 1단계: 회원가입
1. [airtable.com/signup](https://airtable.com/signup) 접속
2. 다음 중 하나로 가입:
   - 이메일 주소
   - Google 계정
   - Microsoft 계정
   - Apple 계정
3. 이메일 인증 완료

### 2단계: 첫 Workspace 만들기
- 무료 계정으로 시작
- Workspace 이름: "온도교회" 또는 원하는 이름

---

## Base 설정

### 참여자 현황 Base 만들기

#### 1. 새 Base 생성
- Workspace에서 "Create a base" 클릭
- "Start from scratch" 선택
- Base 이름: **"북클럽 참여자 현황"**

#### 2. 테이블 구조 설정

**추천 필드 구성:**

| 필드 이름 | 필드 타입 | 설명 |
|---------|---------|------|
| 이름 | Single line text | 참여자 이름 |
| 연락처 | Phone number | 전화번호 |
| 이메일 | Email | 이메일 주소 |
| 참여 회차 | Multiple select | 1회차, 2회차, 3회차... |
| 출석 여부 | Checkbox | 출석 체크 |
| 읽은 책 | Multiple select | 코스모스, 오늘이라는 예배... |
| 가입일 | Created time | 자동 입력 |
| 비고 | Long text | 메모 |

#### 3. 샘플 데이터 입력
몇 개의 샘플 데이터를 입력하여 테스트해보세요.

---

## 웹사이트 연동

### 방법 1: 공유 뷰 임베딩 (추천)

#### 1단계: 공유 링크 만들기
1. Base 우측 상단 **"Share"** 버튼 클릭
2. **"Create a shareable link"** 토글 켜기
3. 공유 권한 선택:
   - **Read only** (읽기 전용) - 추천
   - **Can edit** (편집 가능) - 주의 필요
   - **Can comment** (댓글 가능)

#### 2단계: 임베드 코드 가져오기
1. "Embed this base" 클릭
2. iframe 코드 복사

예시:
```html
<iframe
  class="airtable-embed"
  src="https://airtable.com/embed/shrXXXXXXXXXXXXX?backgroundColor=blue&viewControls=on"
  frameborder="0"
  onmousewheel=""
  width="100%"
  height="533">
</iframe>
```

#### 3단계: 웹사이트에 추가
1. `docs/participants.html` 파일 열기
2. 79-86번째 줄의 주석 제거:
   ```html
   <!--
   <div class="airtable-embed">
     <iframe src="YOUR_AIRTABLE_SHARE_LINK_HERE"...>
     </iframe>
   </div>
   -->
   ```
   아래와 같이 변경:
   ```html
   <div class="airtable-embed">
     <iframe src="복사한_Airtable_링크"...>
     </iframe>
   </div>
   ```

3. 88-176번째 줄 (설정 안내 섹션) 삭제
4. 저장 후 Git 커밋:
   ```bash
   git add docs/participants.html
   git commit -m "Add Airtable participant tracking"
   git push
   ```

### 방법 2: Airtable Form 사용

참여자가 직접 정보를 입력하게 하려면:

1. Airtable Base에서 **"Forms"** 탭 클릭
2. **"Create form"** 선택
3. 폼 필드 구성
4. 폼 링크 복사 및 웹사이트에 추가

---

## 사용 사례

### 1. 참여자 관리
- 북클럽 참여자 명단 관리
- 출석 체크
- 연락처 정보 보관

### 2. 책 목록 관리
Base 생성: **"북클럽 도서 목록"**
- 읽은 책 / 읽을 책 구분
- 투표 기능으로 다음 책 선정
- 독서 진행 상황 추적

### 3. 질문 답변 관리
Base 생성: **"신학 질문 답변"**
- Google Forms 응답을 Airtable로 자동 연동 (Zapier 사용)
- 질문 카테고리 분류
- 답변 상태 추적
- 담당자 배정

### 4. 모임 일정 관리
Base 생성: **"북클럽 일정"**
- Calendar 뷰로 일정 시각화
- 장소, 시간, 참석자 관리
- 다음 모임 책 표시

---

## 🔒 개인정보 보호 팁

1. **읽기 전용 공유**: 편집 권한은 관리자만
2. **민감 정보 숨기기**: 공유 뷰에서 특정 필드 숨기기 가능
3. **비공개 필드**: 내부용 메모는 공유하지 않기
4. **정기 검토**: 주기적으로 접근 권한 확인

---

## 📞 도움이 필요하면?

- Airtable 공식 가이드: [support.airtable.com](https://support.airtable.com)
- YouTube 튜토리얼: "Airtable 사용법" 검색
- 북클럽 관리자에게 문의

---

## 🎯 다음 단계

1. ✅ Airtable 계정 생성
2. ✅ Base 만들기
3. ✅ 샘플 데이터 입력
4. ✅ 공유 링크 생성
5. ✅ 웹사이트에 연동
6. 🎉 완료!
