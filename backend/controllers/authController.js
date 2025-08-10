const { google } = require("googleapis");
const path = require("path");
const { getDayOrderAndMonth } = require("../utils/dayOrderHelper");
require("dotenv").config();

const loginSheetId = process.env.LOGIN_SHEET_ID;
const visitSheetId = process.env.VISIT_SHEET_ID;
const adminLoginSheetId = process.env.ADMIN_LOGIN_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

exports.loginAndCheckAudit = async (req, res) => {
  try {
    const facultyId = String(req.body.facultyId || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!facultyId || !email) {
      return res.status(400).json({ message: "Faculty ID and email are required." });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // 1. Validate user and get name
    const loginData = await sheets.spreadsheets.values.get({
      spreadsheetId: loginSheetId,
      range: "Sheet1!B:D",
    });
    
    const loginRows = loginData.data.values || [];
    const foundUserRow = loginRows.find(row => 
        String(row[0] || "").trim() === facultyId && 
        String(row[2] || "").trim().toLowerCase() === email
    );

    if (!foundUserRow) {
      return res.status(401).json({ message: "Invalid faculty ID or email." });
    }

    const facultyName = foundUserRow[1] || "Faculty";

    // 2. Get today's day order info
    const todayInfo = await getDayOrderAndMonth();

    // If todayInfo is null (no Day Order), log in successfully with no audit.
    if (!todayInfo) {
      return res.json({
        message: "Login successful",
        name: facultyName,
        facultyId,
        auditToday: false,
      });
    }

    // A Day Order exists, so check for an audit
    const { sheetName } = todayInfo;
    const visitData = await sheets.spreadsheets.values.get({
      spreadsheetId: visitSheetId,
      range: `${sheetName}!C:E`,
    });
    
    const visitRows = visitData.data.values || [];
    const matchingRow = visitRows.find(
      (row) => String(row[0] || "").trim() === facultyId
    );

    if (matchingRow) {
      return res.json({
        message: "Login successful",
        name: facultyName, facultyId, auditToday: true,
        sheetName: sheetName, slot: matchingRow[1] || null, venue: matchingRow[2] || null,
      });
    }

    // Day Order exists, but faculty isn't on the list
    return res.json({
      message: "Login successful",
      name: facultyName, facultyId, auditToday: false,
    });

  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};

// --- ALL OTHER FUNCTIONS (getAuditDatesForFaculty, adminLogin) remain the same ---
// (Your existing code for these is fine)

exports.getAuditDatesForFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId) {
      return res.status(400).json({ message: "Faculty ID is required." });
    }
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const dateSheetId = process.env.DATE_SHEET_ID;
    const dateRanges = ["DateSheet!A2:C", "DateSheet!D2:F", "DateSheet!G2:I", "DateSheet!J2:L", "DateSheet!M2:O"];
    const dateMap = new Map();
    const dateResponses = await sheets.spreadsheets.values.batchGet({ spreadsheetId: dateSheetId, ranges: dateRanges });
    if (dateResponses.data.valueRanges) {
      dateResponses.data.valueRanges.forEach(valueRange => {
        const rows = valueRange.values;
        if (rows) {
          rows.forEach(row => {
            if (row[0] && row[2]) {
              const doNumber = row[2].toString().trim();
              if (!dateMap.has(doNumber)) {
                dateMap.set(doNumber, []);
              }
              dateMap.get(doNumber).push(row[0].trim());
            }
          });
        }
      });
    }
    const visitSheetId = process.env.VISIT_SHEET_ID;
    const visitDayOrderSheets = ["'Day Order 1'!C:C", "'Day Order 2'!C:C", "'Day Order 3'!C:C", "'Day Order 4'!C:C", "'Day Order 5'!C:C"];
    const auditDayOrders = new Set();
    const visitResponses = await sheets.spreadsheets.values.batchGet({ spreadsheetId: visitSheetId, ranges: visitDayOrderSheets });
    if (visitResponses.data.valueRanges) {
      visitResponses.data.valueRanges.forEach((range, index) => {
        const rows = range.values || [];
        if (rows.some(row => row[0]?.toString().trim() === facultyId)) {
          auditDayOrders.add((index + 1).toString());
        }
      });
    }
    let allAuditDates = [];
    auditDayOrders.forEach(doNumber => {
      const datesForDO = dateMap.get(doNumber);
      if (datesForDO) {
        allAuditDates = allAuditDates.concat(datesForDO);
      }
    });
    res.json({ auditDates: allAuditDates });
  } catch (error) {
    console.error("Error fetching audit dates:", error);
    res.status(500).json({ message: "Server error while fetching audit dates." });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { adminId, email, password } = req.body;
    if (!adminId || !email || !password) {
      return res.status(400).json({ message: "Admin ID, email, and password are required." });
    }
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const adminSheetId = process.env.ADMIN_LOGIN_SHEET_ID;
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: adminSheetId, range: "Sheet1!A:C" });
    const rows = response.data.values || [];
    const foundAdmin = rows.find(row =>
      String(row[0] || "").trim() === adminId.trim() &&
      String(row[1] || "").trim().toLowerCase() === email.trim().toLowerCase() &&
      String(row[2] || "") === password
    );
    if (!foundAdmin) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }
    res.json({ message: "Admin login successful", user: { name: "Admin", id: adminId, email } });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error during admin login." });
  }
};