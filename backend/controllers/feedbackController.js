const { google } = require('googleapis');
const path = require('path');
const dayjs = require('dayjs');
const { findSheetForToday } = require('../utils/dayOrderHelper');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

exports.addFeedbackForToday = async (req, res) => {
  try {
    const { facultyId, dateOfVisit, feedback } = req.body;
    if (!facultyId || !dateOfVisit || !feedback) {
      return res.status(400).json({ message: 'facultyId, dateOfVisit, and feedback required.' });
    }

    const today = dayjs().format('DD-MM-YYYY');
    if (today !== dateOfVisit) {
      return res.status(403).json({ message: 'You can only add feedback for today.' });
    }

    const sheetName = await findSheetForToday();
    if (!sheetName) {
      return res.status(404).json({ message: 'No sheet found for today.' });
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const resData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.VISIT_SHEET_ID,
      range: `${sheetName}!C:C`
    });
    const ids = resData.data.values ? resData.data.values.flat() : [];
    const rowIndex = ids.findIndex(id => id && String(id).trim() === facultyId.trim());
    if (rowIndex === -1) {
      return res.status(404).json({ message: 'Faculty ID not found for today.' });
    }

    const targetRow = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.VISIT_SHEET_ID,
      range: `${sheetName}!H${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[feedback]] }
    });

    return res.json({ message: 'Feedback added successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
