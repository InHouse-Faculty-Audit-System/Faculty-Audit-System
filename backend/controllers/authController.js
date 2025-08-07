const { google } = require("googleapis");
const path = require("path");
const { getDayOrderAndMonth } = require("../utils/dayOrderHelper");
require("dotenv").config();

const loginSheetId = process.env.LOGIN_SHEET_ID;
const visitSheetId = process.env.VISIT_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

exports.loginAndCheckAudit = async (req, res) => {
  try {
    // Ensure strings and clean input
    const facultyId = String(req.body.facultyId).trim();
    const email = String(req.body.email).trim().toLowerCase();

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

    const found = rows.find((row) => {
      const rowFacultyId = String(row[0] || "").trim();
      const rowEmail = String(row[1] || "").trim().toLowerCase();
      return rowFacultyId === facultyId && rowEmail === email;
    });

    if (!found) {
      return res.status(401).json({ message: "Invalid faculty ID or email." });
    }

    // Check if faculty has audit today
    const todayInfo = await getDayOrderAndMonth();
if (!todayInfo) {
  return res.status(404).json({ message: "Date not found in master sheet" });
}

const { sheetName, month } = todayInfo;
    let auditToday = false;
    let venue = null;
    let slot = null;

    if (sheetName) {
      const resData = await sheets.spreadsheets.values.get({
        spreadsheetId: visitSheetId,
        range: `${sheetName}!C:F`, // C: facultyId, D: slot, F: venue
      });
      const allRows = resData.data.values || [];

     const matchingRow = allRows.find((row) => {
  const rowFacultyId = String(row[0] || "").trim();
  const rowMonth = String(row[2] || "").toLowerCase(); // E column → Month
  return (
    rowFacultyId === facultyId &&
    rowMonth.includes(month.toLowerCase())
  );
});


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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
