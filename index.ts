#!/usr/bin/env bun
/**
 * create-vite-react-gemini
 *
 * Bun create 스크립트로 실행 시:
 * 1. create-vite --template react 로 프로젝트 생성
 * 2. lucide-react, tailwindcss, @tailwindcss/vite 추가
 * 3. index.css와 vite.config.js에 Tailwind 설정
 */

import { $ } from "bun";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const targetDir = process.argv[2] ?? "my-gemini-react-app";
const cwd = process.cwd();
const projectDir = path.isAbsolute(targetDir)
  ? targetDir
  : path.join(cwd, targetDir);

async function main() {
  console.log("◇  create-vite-react-gemini");
  console.log(
    `│  Creating Vite + React project with Tailwind CSS & Lucide icons...`
  );

  // 1. create-vite로 react 템플릿 프로젝트 생성
  const createViteResult = await $`bun create vite ${targetDir} --no-interactive --template react`.cwd(
    cwd
  ).quiet();
  // .quiet();

  if (createViteResult.exitCode !== 0) {
    console.error("Failed to create Vite project");
    process.exit(1);
  }

  if (!existsSync(projectDir)) {
    console.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  // 2. lucide-react, tailwindcss, @tailwindcss/vite 설치 (최신 버전)
  console.log("│  Adding Dependencies: lucide-react, tailwindcss, @tailwindcss/vite...");
  await $`bun add lucide-react tailwindcss @tailwindcss/vite`.cwd(projectDir).quiet();

  // 3. vite.config.js 수정 - Tailwind 플러그인 추가
  console.log("│  Adding tailwind to vite.config.js...");
  const viteConfigPath = path.join(projectDir, "vite.config.js");
  const newViteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || '/',
})
  `.trim();

  await Bun.write(viteConfigPath, newViteConfig);

  // 4. index.css 수정 - Tailwind import 추가
  console.log("│  Adding Tailwind to index.css...");
  const indexCssPath = path.join(projectDir, "src", "index.css");
  const newIndexCss = `@import "tailwindcss";`;

  await Bun.write(indexCssPath, newIndexCss);

  // 5. github actions 설정 추가
  console.log("│  Adding GitHub Actions...");
  const githubActionsPath = path.join(projectDir, ".github", "workflows", "deploy.yml");
  // create directory if not exists
  if (!existsSync(path.join(projectDir, ".github"))) {
    mkdirSync(path.join(projectDir, ".github"));
  }
  if (!existsSync(path.join(projectDir, ".github", "workflows"))) {
    mkdirSync(path.join(projectDir, ".github", "workflows"));
  }
  const newGithubActions = `
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build
        env:
          VITE_BASE_PATH: /\${{ github.event.repository.name }}/

      - name: Verify build output
        run: |
          echo "Build output contents:"
          ls -la dist/ || echo "dist folder not found"
          if [ -f "dist/index.html" ]; then
            echo "✓ index.html found"
          else
            echo "✗ index.html not found. build failed"
            exit 1
          fi

      - name: Deploy to GitHub Pages
        id: deployment
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_branch: gh-pages
          publish_dir: dist
  `.trim()
  await Bun.write(githubActionsPath, newGithubActions);

  // 6. TypeScript 지원 추가 여부
  const addTs = prompt("Add TypeScript support? (y/n): ");
  const answers = ["y", "yes", "1", "ㅛ"];
  const wantTs = answers.includes(addTs?.toLowerCase()?.trim() ?? "");
  if (wantTs) {
    console.log("│  Adding TypeScript support...");
    await $`bun add -d typescript @types/react @types/react-dom`.cwd(
      projectDir
    ).quiet();
    await $`bunx tsc --init`.cwd(projectDir).quiet();
    const tsconfigPath = path.join(projectDir, "tsconfig.json");
    // check if tsconfig exists
    while (!existsSync(tsconfigPath)) {
      await $`bunx tsc --init`.cwd(projectDir).quiet();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    let tsconfigText = await Bun.file(tsconfigPath).text();
    // Strip comments and trailing commas so JSON.parse works
    tsconfigText = tsconfigText
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/,(\s*[}\]])/g, "$1");
    const tsconfig = JSON.parse(tsconfigText) as {
      compilerOptions?: Record<string, unknown>;
      [k: string]: unknown;
    };
    if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
    tsconfig.compilerOptions.jsx = "react-jsx";
    tsconfig.compilerOptions.allowJs = true;
    await Bun.write(
      tsconfigPath,
      JSON.stringify(tsconfig, null, 2)
    );
    console.log("│  TypeScript support added.");
  }

  console.log("└  Done!\n");
  console.log("  [1] 다음 명령으로 개발 서버 실행:\n");
  console.log(`   cd ${targetDir}`);
  console.log("   bun install");
  console.log("   bun dev\n");
  console.log("  [2] Gemini가 생성한 React 코드를 아래 파일에 붙여넣으세요:");
  console.log(`   ${targetDir}/src/App.jsx\n`);
  console.log("  [3] GitHub에 업로드 후 Pages 배포:");
  console.log("    (1) https://github.com/new 에 접속하여 새 레포지토리 생성");
  console.log("    (2) 생성된 레포지토리의 url을 복사");
  console.log("    (3) 아래 명령어를 실행하여 GitHub에 업로드 (복사한 url을 레포지토리 url로 대체)");
  console.log(`   git init
    git branch -M main
    git add .
    git commit -m \"Initial commit\"
    git remote add origin <복사한 url>
    git push -u origin main`);
  console.log("    (4) Github Actions가 완료된 이후 Repository 설정에서 Pages의 Branch를 gh-pages로 설정");
  console.log("    (5) Github Pages URL로 접속");
}
// When Deploy failed with branch protection rule
// https://stackoverflow.com/questions/76937061/branch-master-is-not-allowed-to-deploy-to-github-pages-due-to-environment-prot


main().catch((err) => {
  console.error(err);
  process.exit(1);
});
