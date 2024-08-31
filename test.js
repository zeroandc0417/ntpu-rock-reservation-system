function testCalc(){
    var sheet = StatCalculator.createSheet();
    console.log(`url: ${sheet.getUrl()}`);
    var log_sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1EtFOgVXQevUkEEW3dEH2RAzXpGo9zCR15zvXxGt6N1c/edit?gid=1719860115#gid=1719860115');
    var stats = StatCalculator.calcStats(log_sheet.getDataRange().getValues());
    sheet.getSheetByName('時數統計')
      .getRange(2, 1, stats.length, stats[0].length)
      .setVerticalAlignment('center')
      .setHorizontalAlignment('middle')
      .setValues(stats);
    sheet.getSheetByName('時數統計')
      .getDataRange()
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');
}