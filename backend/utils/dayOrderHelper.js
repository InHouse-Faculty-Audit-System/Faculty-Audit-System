const { google } = require('googleapis');
const path = require('path');
const dayjs = require('dayjs');
require('dotenv').config();

const spreadsheetId = process.env.VISIT_SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function findSheetForToday() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const today = dayjs().format('DD-MM-YYYY');
  

  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetTitles = metadata.data.sheets.map(s => s.properties.title);
  

  for (const title of sheetTitles) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${title}!G:G`
    });
    const dates = res.data.values ? res.data.values.flat() : [];
    

    for (const date of dates.slice(1)) {
      const cleanDate = date ? String(date).trim() : '';
      

      if (cleanDate === today) {
       
        return title;
      }
    }
  }

  console.log('No matching date found in any sheet.');
  return null;
}

module.exports = { findSheetForToday };
