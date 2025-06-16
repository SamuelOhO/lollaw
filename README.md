# Lollaw

법률 관련 커뮤니티 플랫폼

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
├── components/       # React 컴포넌트
│   ├── atoms/       # 기본 UI 컴포넌트
│   ├── molecules/   # 복합 UI 컴포넌트
│   ├── organisms/   # 큰 단위의 UI 컴포넌트
│   ├── templates/   # 페이지 템플릿
│   └── sections/    # 섹션 컴포넌트
├── hooks/           # 커스텀 훅
├── lib/            # 외부 서비스 연동
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수
└── styles/         # 전역 스타일
```

## 개발 환경 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음 변수들을 설정:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 개발 서버 실행:
```bash
npm run dev
```

## 주요 컨벤션

### 코드 스타일
- TypeScript 사용
- ESLint + Prettier로 코드 포맷팅
- 컴포넌트는 Atomic Design 패턴으로 구성

### Git 커밋 메시지
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드
- chore: 빌드 프로세스 또는 보조 도구 변경

## 배포

1. 프로덕션 빌드:
```bash
npm run build
```

2. 프로덕션 서버 실행:
```bash
npm start
```

## 테스트

```bash
npm test
```

## 라이선스

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 환경 변수 설정

아래 환경변수는 프로젝트 루트의 `.env.local` 파일에 반드시 설정해야 합니다.

| 변수명                        | 설명                  |
| ----------------------------- | --------------------- |
| NEXT_PUBLIC_SUPABASE_URL      | Supabase 프로젝트 URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 익명 키      |
| NEXT_PUBLIC_DOMAIN            | 서비스 도메인 (선택)  |

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하세요.
