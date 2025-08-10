const { google } = require("googleapis");
const path = require("path");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "..", "credentials.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const getDayOrderAndMonth = async () => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const sheetId = process.env.DATE_SHEET_ID;

    const dateRanges = [
      "DateSheet!A2:C", "DateSheet!D2:F", "DateSheet!G2:I",
      "DateSheet!J2:L", "DateSheet!M2:O"
    ];

    const today = new Date();
    // Use a robust way to get today's date in M/D/YYYY format
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const monthName = today.toLocaleString("default", { month: "long" });

    const responses = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: sheetId,
        ranges: dateRanges
    });

    if (responses.data.valueRanges) {
        for (const range of responses.data.valueRanges) {
            const rows = range.values || [];
            for (const row of rows) {
                const dateInSheet = row[0]?.trim();
                // Check if the date matches
                if (dateInSheet === todayStr) {
                    const doValue = row[2]?.trim();
                    // If a Day Order value exists for this date, return it
                    if (doValue) {
                        return {
                            sheetName: `Day Order ${doValue}`,
                            month: monthName,
                            doNumber: doValue,
                            date: todayStr,
                        };
                    }
                    // If the date matches but DO is empty, we can stop and return null
                    console.log(`Date ${todayStr} found, but no Day Order is assigned.`);
                    return null;
                }
            }
        }
    }
    
    // If we finish all loops and never find the date
    console.log(`Today's date (${todayStr}) was not found in the DateSheet.`);
    return null;

  } catch (error) {
      console.error("Error in getDayOrderAndMonth:", error);
      return null; // Ensure it always returns null on error
  }
};

module.exports = { getDayOrderAndMonth };