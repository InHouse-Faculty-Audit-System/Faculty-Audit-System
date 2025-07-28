const { google } = require("googleapis");
const path = require("path");
const dayjs = require("dayjs");
const { findSheetForToday } = require("../utils/dayOrderHelper");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

exports.addFeedbackForToday = async (req, res) => {
  try {
    const { facultyId, remarks } = req.body;
    if (!facultyId || !remarks) {
      return res
        .status(400)
        .json({ message: "facultyId and remarks are required." });
    }

    const today = dayjs().format("DD-MM-YYYY");

    const sheetName = await findSheetForToday();
    if (!sheetName) {
      return res.status(404).json({ message: "No audit scheduled for today." });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const resData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.VISIT_SHEET_ID,
      range: `${sheetName}!C:C`,
    });

    const ids = resData.data.values ? resData.data.values.flat() : [];

    const rowIndex = ids.findIndex(
      (id) => id && String(id).trim() === facultyId.trim()
    );
    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ message: "Faculty ID not found in today's audit sheet." });
    }

    const targetRow = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.VISIT_SHEET_ID,
      range: `${sheetName}!H${targetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[remarks]] },
    });

    return res.json({ message: "Remarks added successfully." });
  } catch (error) {
    console.error("Error adding remarks:", error);
    res.status(500).json({ message: "Server error." });
  }
};
