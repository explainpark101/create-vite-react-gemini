#!/usr/bin/env node
/**
 * create-vite-react-gemini
 *
 * 실행 환경(Bun/Node)을 감지하여 적절한 구현을 실행합니다.
 * - Bun: index.ts (Bun 네이티브 API 사용)
 * - Node: node.js (Node.js 호환 구현)
 */

async function main() {
  if (typeof Bun !== "undefined") {
    await import("./index.ts");
  } else {
    await import("./node.js");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
