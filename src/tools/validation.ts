import { z } from "zod";
import { getSheetsClient } from "../client.js";

export const setDropdownSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startRowIndex: z.number().describe("開始行（0始まり）"),
  endRowIndex: z.number().describe("終了行（この行は含まない）"),
  startColumnIndex: z.number().describe("開始列（0始まり、A=0）"),
  endColumnIndex: z.number().describe("終了列（この列は含まない）"),
  values: z.array(z.string()).describe("ドロップダウンの選択肢（例: [\"承認\", \"却下\", \"保留\"]）"),
};

export const setCheckboxSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startRowIndex: z.number().describe("開始行（0始まり）"),
  endRowIndex: z.number().describe("終了行（この行は含まない）"),
  startColumnIndex: z.number().describe("開始列（0始まり、A=0）"),
  endColumnIndex: z.number().describe("終了列（この列は含まない）"),
};

export const setDropdownRangeSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startRowIndex: z.number().describe("開始行（0始まり）"),
  endRowIndex: z.number().describe("終了行（この行は含まない）"),
  startColumnIndex: z.number().describe("開始列（0始まり、A=0）"),
  endColumnIndex: z.number().describe("終了列（この列は含まない）"),
  sourceRange: z.string().describe("選択肢を取得するセル範囲（例: 'シート1!A1:A10'）"),
};

export const getValidationsSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
};

export const deleteValidationSchema = {
  spreadsheetId: z.string().describe("スプレッドシートのID"),
  sheetId: z.number().describe("シートのID（get_sheet_metadataで取得可能）"),
  startRowIndex: z.number().describe("開始行（0始まり）"),
  endRowIndex: z.number().describe("終了行（この行は含まない）"),
  startColumnIndex: z.number().describe("開始列（0始まり、A=0）"),
  endColumnIndex: z.number().describe("終了列（この列は含まない）"),
};

export async function setDropdown(
  spreadsheetId: string,
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  values: string[]
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex,
              endRowIndex,
              startColumnIndex,
              endColumnIndex,
            },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: values.map((v) => ({ userEnteredValue: v })),
              },
              showCustomUi: true,
              strict: true,
            },
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
    values,
  };
}

export async function setDropdownRange(
  spreadsheetId: string,
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  sourceRange: string
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex,
              endRowIndex,
              startColumnIndex,
              endColumnIndex,
            },
            rule: {
              condition: {
                type: "ONE_OF_RANGE",
                values: [{ userEnteredValue: `=${sourceRange}` }],
              },
              showCustomUi: true,
              strict: true,
            },
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
    sourceRange,
  };
}

export async function setCheckbox(
  spreadsheetId: string,
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex,
              endRowIndex,
              startColumnIndex,
              endColumnIndex,
            },
            rule: {
              condition: {
                type: "BOOLEAN",
              },
              showCustomUi: true,
            },
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
  };
}

export async function getValidations(
  spreadsheetId: string,
  sheetId: number
) {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties.sheetId,data.rowData.values.dataValidation)",
    includeGridData: true,
  });

  const sheet = response.data.sheets?.find(
    (s) => s.properties?.sheetId === sheetId
  );

  const validations: Array<{
    row: number;
    column: number;
    type: string | null | undefined;
    values: (string | null | undefined)[] | undefined;
  }> = [];

  sheet?.data?.[0]?.rowData?.forEach((row, rowIndex) => {
    row.values?.forEach((cell, colIndex) => {
      if (cell.dataValidation) {
        const dv = cell.dataValidation;
        validations.push({
          row: rowIndex,
          column: colIndex,
          type: dv.condition?.type,
          values: dv.condition?.values?.map((v) => v.userEnteredValue),
        });
      }
    });
  });

  return {
    sheetId,
    validations,
  };
}

export async function deleteValidation(
  spreadsheetId: string,
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number
) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex,
              endRowIndex,
              startColumnIndex,
              endColumnIndex,
            },
            rule: undefined,
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
  };
}
