import { google, sheets_v4 } from "googleapis";
import { getAuthClient } from "./auth.js";

let sheetsClient: sheets_v4.Sheets | null = null;

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (!sheetsClient) {
    const auth = await getAuthClient();
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}
