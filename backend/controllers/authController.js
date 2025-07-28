const { google } = require("googleapis");
const path = require("path");
const { findSheetForToday } = require("../utils/dayOrderHelper");
require("dotenv").config();

const loginSheetId = process.env.LOGIN_SHEET_ID;
const visitSheetId = process.env.VISIT_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

exports.loginAndCheckAudit = async (req, res) => {
  try {
    const { facultyId, email } = req.body;
    if (!facultyId || !email) {
      return res.status(400).json({ message: "facultyId and email required." });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Fetch login sheet to validate user
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId: loginSheetId,
      range: "Sheet1!B:C",
    });
    const rows = data.data.values || [];

    const found = rows.find(
      (row) =>
        row[0] &&
        String(row[0]).trim() === facultyId.trim() &&
        row[1] &&
        String(row[1]).trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (!found) {
      return res.status(401).json({ message: "Invalid faculty ID or email." });
    }

    // Check if faculty has audit today
    const sheetName = await findSheetForToday();
    let auditToday = false;
    let venue = null;
    let slot = null;

    if (sheetName) {
      // Get facultyId (C) and venue (F)
      const resData = await sheets.spreadsheets.values.get({
        spreadsheetId: visitSheetId,
        range: `${sheetName}!C:F`,
      });
      const allRows = resData.data.values || [];

      // Find matching facultyId
      const matchingRow = allRows.find(
        (row) => row[0] && String(row[0]).trim() === facultyId.trim()
      );

      if (matchingRow) {
        auditToday = true;
        slot = matchingRow[1] || null;
        venue = matchingRow[3] || null;
      }
    }

    return res.json({
      message: "Login successful",
      facultyId,
      auditToday,
      sheetName: auditToday ? sheetName : null,
      venue: auditToday ? venue : null,
      slot: auditToday ? slot : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
