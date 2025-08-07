const { google } = require("googleapis");
const path = require("path");
const { getDayOrderAndMonth } = require("../utils/dayOrderHelper");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "..", "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const addFeedbackForToday = async (req, res) => {
  const { faculty_id, feedback, visitTime } = req.body;

  if (!faculty_id || !feedback || !visitTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { sheetName, date, error } = await getDayOrderAndMonth();
    if (error) {
      return res.status(404).json({ error });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const visitSheetId = process.env.VISIT_SHEET_ID;
    const readRange = `${sheetName}!A2:H`; // Still read full row

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: visitSheetId,
      range: readRange,
    });

    const rows = response.data.values || [];

    // ✅ Match faculty_id in Column C (index 2)
    const rowIndex = rows.findIndex(
      row => row[2]?.toString().trim().toLowerCase() === faculty_id.trim().toLowerCase()
    );

    if (rowIndex === -1) {
      return res.status(200).json({ message: "No audit today for this faculty." });
    }

    const targetRow = rowIndex + 2; // Adjust for header and 0-index
    const updateRange = `${sheetName}!F${targetRow}:H${targetRow}`; // Date, Time, Feedback

    await sheets.spreadsheets.values.update({
      spreadsheetId: visitSheetId,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[date, visitTime, feedback]],
      },
    });

    res.status(200).json({ message: "Feedback submitted successfully." });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  addFeedbackForToday,
};
