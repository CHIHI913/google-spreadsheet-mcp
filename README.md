# Google Spreadsheet MCP Server

Google スプレッドシートを操作するための MCP (Model Context Protocol) サーバーです。
Claude Code などの AI エージェントからスプレッドシートの読み書きが可能になります。

## 機能

### データ操作

| ツール | 説明 |
|--------|------|
| `get_sheet_metadata` | スプレッドシートのタイトルとシート（タブ）一覧を取得 |
| `read_values` | 指定範囲のデータを読み込み |
| `append_values` | 指定範囲の末尾にデータを追記 |
| `update_values` | 指定範囲のデータを上書き更新 |

### シート管理

| ツール | 説明 |
|--------|------|
| `add_sheet` | 新しいシート（タブ）を追加 |
| `delete_sheet` | シート（タブ）を削除 |
| `rename_sheet` | シート（タブ）の名前を変更 |

### 行列操作

| ツール | 説明 |
|--------|------|
| `insert_rows` | 指定位置に空の行を挿入 |
| `insert_columns` | 指定位置に空の列を挿入 |
| `delete_rows` | 指定範囲の行を削除 |
| `delete_columns` | 指定範囲の列を削除 |

### 入力規則

| ツール | 説明 |
|--------|------|
| `set_dropdown` | ドロップダウンリストを設定（固定値） |
| `set_dropdown_range` | ドロップダウンリストを設定（セル範囲参照） |
| `set_checkbox` | チェックボックスを設定 |
| `get_validations` | 入力規則一覧を取得 |
| `delete_validation` | 指定範囲の入力規則を削除 |

### 条件付き書式

| ツール | 説明 |
|--------|------|
| `add_conditional_format` | カスタム数式による条件付き書式を追加 |
| `get_conditional_formats` | 条件付き書式ルール一覧を取得 |
| `delete_conditional_format` | 指定したインデックスの条件付き書式を削除 |

## セットアップ

### 1. GCP プロジェクト設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **Google Sheets API** を有効化
   ```
   APIs & Services → Enable APIs → 「Google Sheets API」を検索 → 有効化
   ```

### 2. OAuth クライアント ID 作成

1. APIs & Services → Credentials → Create Credentials → OAuth client ID
2. アプリケーションの種類: **デスクトップアプリ**
3. 名前を入力（例: `sheets-mcp`）→ Create
4. JSON をダウンロード → `credentials/client_secret.json` として保存

### 3. ビルド

```bash
pnpm install
pnpm run build
```

### 4. Claude Code 設定

`.mcp.json` をプロジェクトルートに作成:

```json
{
  "mcpServers": {
    "google-spreadsheet": {
      "command": "node",
      "args": ["/path/to/google-spreadsheet-mcp/dist/index.js"],
      "env": {
        "CLIENT_SECRET_PATH": "/path/to/credentials/client_secret.json",
        "TOKEN_PATH": "/path/to/credentials/token.json"
      }
    }
  }
}
```

### 5. 初回認証

初回起動時にブラウザが開き、Google アカウントでの認証を求められます。
認証後、トークンが `TOKEN_PATH` に保存され、以降は自動的に認証されます。

> **Note**: 自分の Google アカウントで認証するため、既にアクセス権のあるスプレッドシートはすべて操作可能です。

## 使用例

### シート情報を取得

```
https://docs.google.com/spreadsheets/d/xxx/edit のシート情報を取得して
```

### データを読み込み

```
このスプレッドシートのシート1 A1:C10 を読み込んで
```

### データを追記

```
シート1 に以下のデータを追加して:
- 山田, 25, エンジニア
- 佐藤, 30, デザイナー
```

### データを更新

```
A1:B2 を以下に更新して:
- 名前, 年齢
- 田中, 28
```

### シートを追加

```
「売上データ」という名前のシートを追加して
```

### シートの名前を変更

```
シート1 を「顧客リスト」に名前変更して
```

### ドロップダウンを設定

```
D列にドロップダウンを設定して。選択肢は「承認」「却下」「保留」
```

### チェックボックスを設定

```
E列にチェックボックスを設定して
```

### 条件付き書式を追加

```
D列が「承認」の場合は行全体を緑色にして
```

## 制限事項

- 新規スプレッドシートの作成は非対応
- 書式設定はカスタム数式による条件付き書式のみ対応（フォント変更等は非対応）
