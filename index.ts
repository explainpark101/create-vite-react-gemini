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

const targetDir = process.argv[2] ?? "my-vite-react-app";
const cwd = process.cwd();
const projectDir = path.isAbsolute(targetDir)
  ? targetDir
  : path.join(cwd, targetDir);

async function main() {
  console.log("◇  create-vite-react-gemini\n");
  console.log(
    `│  Creating Vite + React project with Tailwind CSS & Lucide icons...\n`
  );

  // 1. create-vite로 react 템플릿 프로젝트 생성
  const createViteResult = await $`bunx create-vite@latest ${targetDir} --template react`.cwd(
    cwd
  ).quiet();

  if (createViteResult.exitCode !== 0) {
    console.error("Failed to create Vite project");
    process.exit(1);
  }

  if (!existsSync(projectDir)) {
    console.error(`Project directory not found: ${projectDir}`);
    process.exit(1);
  }

  // 2. lucide-react, tailwindcss, @tailwindcss/vite 설치 (최신 버전)
  console.log("│  Installing lucide-react, tailwindcss, @tailwindcss/vite...\n");
  await $`bun add lucide-react tailwindcss @tailwindcss/vite`.cwd(projectDir);

  // 3. vite.config.js 수정 - Tailwind 플러그인 추가
  const viteConfigPath = path.join(projectDir, "vite.config.js");
  const viteConfig = await Bun.file(viteConfigPath).text();
  const newViteConfig = viteConfig
    .replace(
      "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'",
      `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'`
    )
    .replace("plugins: [react()]", "plugins: [react(), tailwindcss()]");

  await Bun.write(viteConfigPath, newViteConfig);

  // 4. index.css 수정 - Tailwind import 추가
  const indexCssPath = path.join(projectDir, "src", "index.css");
  const indexCss = await Bun.file(indexCssPath).text();
  const newIndexCss = `@import "tailwindcss";

${indexCss}`;

  await Bun.write(indexCssPath, newIndexCss);

  // 5. github actions 설정 추가
  const githubActionsPath = path.join(projectDir, ".github", "workflows", "deploy.yml");
  // create directory if not exists
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

  console.log("└  Done! Run:\n");
  console.log(`   cd ${targetDir}`);
  console.log("   bun install");
  console.log("   bun dev\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
