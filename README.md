# create-vite-react-gemini

Vite + React + Tailwind CSS + Lucide React 프로젝트를 빠르게 생성하는 Bun 전용 스크립트입니다.

---

## ⚠️ Bun 전용 — Node.js 미지원

> **이 패키지는 Bun 전용입니다. Node.js에서는 동작하지 않습니다.**

- ✅ **Bun** — 공식 지원
- ❌ **Node.js** — 미지원 (설치 및 실행 불가)

`npx` 또는 `npm create`로 실행하면 오류가 발생합니다. 반드시 **Bun**이 설치된 환경에서 `bun create`로 실행하세요.

### Bun 설치

Bun이 없다면 먼저 설치하세요:

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

[Bun 공식 문서](https://bun.sh/docs/installation)에서 자세한 설치 방법을 확인할 수 있습니다.

---

## 사용법

```bash
bun create vite-react-gemini@latest <프로젝트명>
```

또는 현재 디렉터리에 생성:

```bash
bun create vite-react-gemini@latest .
```

## 포함 사항

- **Vite** - React (JavaScript) 템플릿
- **Tailwind CSS** - `tailwindcss`, `@tailwindcss/vite` (최신 버전)
- **Lucide React** - 아이콘 라이브러리
- **GitHub Actions** - GitHub Pages 배포 워크플로우

## 생성 후 실행

```bash
cd <프로젝트명>
bun install
bun dev
```

## 로컬 개발/테스트

```bash
bun install
bun run index.ts my-app
```

## 기술 스택

- [Vite](https://vite.dev/) - 빌드 도구
- [React](https://react.dev/) - UI 라이브러리
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 CSS
- [Lucide React](https://lucide.dev/) - 아이콘
