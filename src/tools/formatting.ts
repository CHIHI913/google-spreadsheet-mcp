import { z } from "zod";
import { getSheetsClient } from "../client.js";

const colorSchema = z.object({
  red: z.number().min(0).max(1).optional().describe("赤（0-1）"),
  green: z.number().min(0).max(1).optional().describe("緑（0-1）"),
  blue: z.number().min(0).max(1).optional().describe("青（0-1）"),
}).describe("RGB色指定（各0-1、例: 赤={red:1,green:0,blue:0}）");

export const addConditionalFormatSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startRowIndex: z.number().describe("開始行（0始まり）"),
  endRowIndex: z.number().describe("終了行（この行は含まない）"),
  startColumnIndex: z.number().describe("開始列（0始まり、A=0）"),
  endColumnIndex: z.number().describe("終了列（この列は含まない）"),
  formula: z.string().describe("条件となるカスタム数式（例: '=$A1=\"承認\"'）"),
  backgroundColor: colorSchema.optional().describe("条件一致時の背景色"),
  textColor: colorSchema.optional().describe("条件一致時の文字色"),
};

export const getConditionalFormatsSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
};

export const deleteConditionalFormatSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  index: z.number().describe("削除するルールのインデックス（get_conditional_formatsで取得可能）"),
};

interface Color {
  red?: number;
  green?: number;
  blue?: number;
}

export async function addConditionalFormat(
  spreadsheetId: string,
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  formula: string,
  backgroundColor?: Color,
  textColor?: Color
) {
  const sheets = await getSheetsClient();

  const format: Record<string, unknown> = {};
  if (backgroundColor) {
    format.backgroundColor = backgroundColor;
  }
  if (textColor) {
    format.textFormat = { foregroundColor: textColor };
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [
                {
                  sheetId,
                  startRowIndex,
                  endRowIndex,
                  startColumnIndex,
                  endColumnIndex,
                },
              ],
              booleanRule: {
                condition: {
                  type: "CUSTOM_FORMULA",
                  values: [{ userEnteredValue: formula }],
                },
                format,
              },
            },
            index: 0,
          },
        },
      ],
    },
  });

  return {
    success: true,
    range: {
      sheetId,
      startRowIndex,
      endRowIndex,
      startColumnIndex,
      endColumnIndex,
    },
    formula,
    backgroundColor,
    textColor,
  };
}

export async function getConditionalFormats(
  spreadsheetId: string,
  sheetId: number
) {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties.sheetId,conditionalFormats)",
  });

  const sheet = response.data.sheets?.find(
    (s) => s.properties?.sheetId === sheetId
  );
  const formats = sheet?.conditionalFormats ?? [];

  return {
    sheetId,
    rules: formats.map((format, index) => ({
      index,
      ranges: format.ranges,
      formula: format.booleanRule?.condition?.values?.[0]?.userEnteredValue,
      backgroundColor: format.booleanRule?.format?.backgroundColor,
      textColor: format.booleanRule?.format?.textFormat?.foregroundColor,
    })),
  };
}

export async function deleteConditionalFormat(
  spreadsheetId: string,
  sheetId: number,
  index: number
) {
  const sheets = await getSheetsClient();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteConditionalFormatRule: {
            sheetId,
            index,
          },
        },
      ],
    },
  });

  return {
    success: true,
    sheetId,
    deletedIndex: index,
  };
}
