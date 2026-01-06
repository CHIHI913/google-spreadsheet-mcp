// エラーメッセージを分かりやすく変換
export function formatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("not found")) {
    return "スプレッドシートが見つかりません。IDを確認してください";
  }
  if (message.includes("permission") || message.includes("403")) {
    return "アクセス権限がありません。スプレッドシートをService Accountに共有してください";
  }
  if (message.includes("invalid_grant") || message.includes("401")) {
    return "認証エラー: 認証情報が無効です";
  }
  if (message.includes("ENOTFOUND") || message.includes("network")) {
    return "ネットワークエラー: インターネット接続を確認してください";
  }
  return message;
}

// ツール実行結果の型
export type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

// ツール実行のラッパー
export async function handleToolCall<T>(fn: () => Promise<T>): Promise<ToolResult> {
  try {
    const result = await fn();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `エラー: ${formatError(error)}` }],
      isError: true,
    };
  }
}
