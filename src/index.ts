#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { validateCredentials } from "./client.js";
import { createServer } from "./server.js";

async function main() {
  // 認証情報の検証
  console.error("認証情報を検証中...");
  await validateCredentials();
  console.error("認証OK");

  // サーバー起動
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Sheets MCP Server 起動完了");

  // グレースフルシャットダウン
  const shutdown = async () => {
    console.error("シャットダウン中...");
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("起動エラー:", error.message || error);
  process.exit(1);
});
