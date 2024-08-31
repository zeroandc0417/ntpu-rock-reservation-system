class TableGenerator{
  static createTableSheet(){
    var sheet = SpreadsheetApp.create(`${Properties.SEMESTER_NAME}_社辦租借時間表`);
    var months = this.getMonthInterval();
    var dateList = this.getDateInterval();
    var timeList = this.getTimeInterval();
    for(var i = 0; i < months.length; i++){
      var wks = sheet.insertSheet()
        .setName(months[i]);
      wks.getRange(1, 2, 1, dateList[i].length)
        .setValues([dateList[i]])
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
      wks.getRange(2, 1, timeList.length, 1)
        .setValues(timeList)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
    }
    sheet.deleteSheet(sheet.getSheetByName('工作表1'));
    return sheet.getId();
  }
  static getMonthInterval(){
    var monthInterval = [];
    var date = Properties.START_DATE;
    while(date.getTime() < Properties.END_DATE.getTime()){
      monthInterval.push(`${date.getFullYear()}/${date.getMonth()+1}`);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      date = new Date(year, month, day);
    }
    return monthInterval;
  }
  static getDateInterval(){
    var dateList = [];
    var days = [];
    var date = Properties.START_DATE;
    while(date.getTime() < Properties.END_DATE.getTime()){
      days.push(`${date.getMonth()+1}/${date.getDate()}`);
      var nextDay = new Date(date.getTime() + 86400000);
      if(date.getMonth() != nextDay.getMonth()){
        dateList.push(days);
        days = [];
      }
      date = nextDay;
    }
    return dateList;
  }
  static getTimeInterval(){
    var timeInterval = [];
    var time = ['00', '30'];
    for(var i = 0; i < 24; i++){
      for(var j = 0; j < 2; j++){
        if(i < 10){
          timeInterval.push([`0${i}:${time[j]}`]);
        } else {
          timeInterval.push([`${i}:${time[j]}`]);
        }
      }
    }
    return timeInterval;
  }
}

class LogGenerator{
  static createLogSheet(){
    var sheet = SpreadsheetApp.create(`${Properties.SEMESTER_NAME}_社辦租借紀錄表`);
    sheet.insertSheet('預約紀錄').appendRow(['回覆時間',	'信箱',	'預約類型',	'預約日期',	'練習時數',	'成員']);
    sheet.insertSheet('已取消的預約').appendRow(['回覆時間',	'信箱',	'預約類型',	'預約日期',	'練習時數',	'成員',	'取消日期']);
    sheet.insertSheet('無效的預約').appendRow(['回覆時間',	'信箱',	'預約類型',	'預約日期',	'練習時數',	'成員',	'無效原因']);
    sheet.deleteSheet(sheet.getSheetByName('工作表1'));
    return sheet.getId();
  }
}