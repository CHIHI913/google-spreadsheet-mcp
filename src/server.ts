import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "./handler.js";
import {
  getSheetMetadata,
  getSheetMetadataSchema,
  readValues,
  readValuesSchema,
  appendValues,
  appendValuesSchema,
  updateValues,
  updateValuesSchema,
  addSheet,
  addSheetSchema,
  deleteSheet,
  deleteSheetSchema,
  renameSheet,
  renameSheetSchema,
  deleteRows,
  deleteRowsSchema,
  deleteColumns,
  deleteColumnsSchema,
  insertRows,
  insertRowsSchema,
  insertColumns,
  insertColumnsSchema,
  setDropdown,
  setDropdownSchema,
  setDropdownRange,
  setDropdownRangeSchema,
  setCheckbox,
  setCheckboxSchema,
  getValidations,
  getValidationsSchema,
  deleteValidation,
  deleteValidationSchema,
  addConditionalFormat,
  addConditionalFormatSchema,
  getConditionalFormats,
  getConditionalFormatsSchema,
  deleteConditionalFormat,
  deleteConditionalFormatSchema,
} from "./tools/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "google-spreadsheet-mcp",
    version: "1.0.0",
    description: "Googleスプレッドシートの読み書き・シート管理を行う",
  });

  registerTools(server);

  return server;
}

function registerTools(server: McpServer): void {
  server.registerTool(
    "get_sheet_metadata",
    {
      description: "スプレッドシートのタイトルとシート（タブ）一覧を取得",
      inputSchema: getSheetMetadataSchema,
    },
    async ({ spreadsheetId }) => handleToolCall(() => getSheetMetadata(spreadsheetId))
  );

  server.registerTool(
    "read_values",
    {
      description: "指定範囲のデータを読み込み（計算結果を取得、数式は取得しない）",
      inputSchema: readValuesSchema,
    },
    async ({ spreadsheetId, range }) => handleToolCall(() => readValues(spreadsheetId, range))
  );

  server.registerTool(
    "append_values",
    {
      description: "指定範囲の末尾にデータを追記",
      inputSchema: appendValuesSchema,
    },
    async ({ spreadsheetId, range, values }) =>
      handleToolCall(() => appendValues(spreadsheetId, range, values))
  );

  server.registerTool(
    "update_values",
    {
      description: "指定範囲のデータを上書き更新",
      inputSchema: updateValuesSchema,
    },
    async ({ spreadsheetId, range, values }) =>
      handleToolCall(() => updateValues(spreadsheetId, range, values))
  );

  server.registerTool(
    "add_sheet",
    {
      description: "新しいシート（タブ）を追加",
      inputSchema: addSheetSchema,
    },
    async ({ spreadsheetId, title }) => handleToolCall(() => addSheet(spreadsheetId, title))
  );

  server.registerTool(
    "delete_sheet",
    {
      description: "シート（タブ）を削除",
      inputSchema: deleteSheetSchema,
    },
    async ({ spreadsheetId, sheetId }) => handleToolCall(() => deleteSheet(spreadsheetId, sheetId))
  );

  server.registerTool(
    "rename_sheet",
    {
      description: "シート（タブ）の名前を変更",
      inputSchema: renameSheetSchema,
    },
    async ({ spreadsheetId, sheetId, newTitle }) =>
      handleToolCall(() => renameSheet(spreadsheetId, sheetId, newTitle))
  );

  server.registerTool(
    "delete_rows",
    {
      description: "指定範囲の行を削除",
      inputSchema: deleteRowsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, endIndex }) =>
      handleToolCall(() => deleteRows(spreadsheetId, sheetId, startIndex, endIndex))
  );

  server.registerTool(
    "delete_columns",
    {
      description: "指定範囲の列を削除",
      inputSchema: deleteColumnsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, endIndex }) =>
      handleToolCall(() => deleteColumns(spreadsheetId, sheetId, startIndex, endIndex))
  );

  server.registerTool(
    "insert_rows",
    {
      description: "指定位置に空の行を挿入",
      inputSchema: insertRowsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, numRows }) =>
      handleToolCall(() => insertRows(spreadsheetId, sheetId, startIndex, numRows))
  );

  server.registerTool(
    "insert_columns",
    {
      description: "指定位置に空の列を挿入",
      inputSchema: insertColumnsSchema,
    },
    async ({ spreadsheetId, sheetId, startIndex, numColumns }) =>
      handleToolCall(() => insertColumns(spreadsheetId, sheetId, startIndex, numColumns))
  );

  server.registerTool(
    "set_dropdown",
    {
      description: "指定範囲にドロップダウンリスト（入力規則）を設定",
      inputSchema: setDropdownSchema,
    },
    async ({ spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, values }) =>
      handleToolCall(() => setDropdown(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, values))
  );

  server.registerTool(
    "set_dropdown_range",
    {
      description: "指定範囲にセル範囲参照のドロップダウンリスト（入力規則）を設定",
      inputSchema: setDropdownRangeSchema,
    },
    async ({ spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, sourceRange }) =>
      handleToolCall(() => setDropdownRange(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, sourceRange))
  );

  server.registerTool(
    "set_checkbox",
    {
      description: "指定範囲にチェックボックス（入力規則）を設定",
      inputSchema: setCheckboxSchema,
    },
    async ({ spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex }) =>
      handleToolCall(() => setCheckbox(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex))
  );

  server.registerTool(
    "get_validations",
    {
      description: "シートの入力規則一覧を取得",
      inputSchema: getValidationsSchema,
    },
    async ({ spreadsheetId, sheetId }) =>
      handleToolCall(() => getValidations(spreadsheetId, sheetId))
  );

  server.registerTool(
    "delete_validation",
    {
      description: "指定範囲の入力規則を削除",
      inputSchema: deleteValidationSchema,
    },
    async ({ spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex }) =>
      handleToolCall(() => deleteValidation(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex))
  );

  server.registerTool(
    "add_conditional_format",
    {
      description: "カスタム数式による条件付き書式を追加（数式がtrueの場合に書式を適用）",
      inputSchema: addConditionalFormatSchema,
    },
    async ({ spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, formula, backgroundColor, textColor }) =>
      handleToolCall(() => addConditionalFormat(spreadsheetId, sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, formula, backgroundColor, textColor))
  );

  server.registerTool(
    "get_conditional_formats",
    {
      description: "シートの条件付き書式ルール一覧を取得",
      inputSchema: getConditionalFormatsSchema,
    },
    async ({ spreadsheetId, sheetId }) =>
      handleToolCall(() => getConditionalFormats(spreadsheetId, sheetId))
  );

  server.registerTool(
    "delete_conditional_format",
    {
      description: "指定したインデックスの条件付き書式を削除",
      inputSchema: deleteConditionalFormatSchema,
    },
    async ({ spreadsheetId, sheetId, index }) =>
      handleToolCall(() => deleteConditionalFormat(spreadsheetId, sheetId, index))
  );
}
