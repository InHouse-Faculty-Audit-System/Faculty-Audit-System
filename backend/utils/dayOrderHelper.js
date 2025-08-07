const { google } = require("googleapis");
const path = require("path");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "..", "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const getDayOrderAndMonth = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const sheetId = process.env.DATE_SHEET_ID;

  const dateRanges = [
    { range: "DateSheet!A2:C100" }, // July
    { range: "DateSheet!D2:F100" }, // August
    { range: "DateSheet!G2:I100" }, // September
    { range: "DateSheet!J2:L100" }, // October
    { range: "DateSheet!M2:O100" }, // November
  ];

  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const monthName = today.toLocaleString("default", { month: "long" });

  for (let { range } of dateRanges) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = res.data.values || [];
    for (let row of rows) {
      const dateInSheet = row[0]?.trim();
      if (dateInSheet === todayStr) {
        const doValue = row[2];
        return {
          sheetName: `Day Order ${doValue}`,
          month: monthName,
          doNumber: doValue,
          date: todayStr,
        };
      }
    }
  }

  console.error(`Today's date (${todayStr}) not found in DateSheet`);
  return { error: "Today's date not found in the DateSheet." };
};

module.exports = { getDayOrderAndMonth };
