class Common{
  static generateDuration(){
    var numList = [];
    var num = 0.5
    while(num <= 4){
      numList.push(`${num}`);
      num += 0.5;
    }
    return numList;
  }
  static generateTimeArray(){
    var timeList = [];
    var time = ['00', '30'];
    for(var i = 0; i < 24; i++){
      var hour = (i < 10) ? `0${i}` : `${i}`;
      for(var j = 0; j < 2; j++){
        timeList.push(`${hour}:${time[j]}`);
      }
    }
    return timeList;
  }
  static weekdayLiteralToNumber(weekday){
    var map = {
      '日': 0,
      '一': 1,
      '二': 2,
      '三': 3,
      '四': 4,
      '五': 5,
      '六': 6
    }
    return map[weekday];
  }
  static isNullString(element){
    return element != '';
  }
  static formResponseToDict(formResponse){
    var map = {};
    map['email'] = formResponse.getRespondentEmail();
    map['timestamp'] = formResponse.getTimestamp();
    for(var itemResponse of formResponse.getItemResponses()){
      var key = itemResponse.getItem().getTitle();
      var value = itemResponse.getResponse();
      if(map[key] == null){
        map[key] = [value];
      } else {
        map[key].push(value);
      }
    }
    return map;
  }
  static isBandReservation(row){
    return (row[2] == '預約練團');
  }
  static findTrigger(name){
    var triggers = ScriptApp.getProjectTriggers();
    for(var t of triggers){
      if(t.getHandlerFunction() == name){
        return t;
      }
    }
  }
  static convertListOfDictToRows(dictList){
    var dataGrid = [];
    for(const [member, hours] of Object.entries(dictList)){
      const row = [member, hours['預約練團'], hours['個人練習'], '=(B:B)*(F1)'];
      dataGrid.push(row);
      console.log(row);
    }
    return dataGrid;
  }
  static timeToString(startTime, duration){
    var [hour, min] = startTime.split(':');
    var endMin = Number(min) + duration * 60;
    var length = 0;
    while(endMin > 30){
      endMin -= 60;
      length += 1;
    }
    if(endMin == 0){
      endMin = '00';
    } else {
      endMin = '30';
    }
    var endHour = (Number(hour) + length < 10) ? `0${Number(hour)+length}` : `${Number(hour) + length}` ;
    return `${hour}:${min}-${endHour}:${endMin}`;
  }
  static dateToString(date, duration){
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var startHour = (date.getHours() < 10) ? `0${date.getHours()}` : `${date.getHours()}`;
    var startMin = (date.getMinutes() == 30) ? '30' : '00';
    var endMin = date.getMinutes() + duration * 60;
    var length = 0;
    while(endMin > 30){
      endMin -= 60;
      length += 1;
    }
    if(endMin == 0){
      endMin = '00';
    } else {
      endMin = '30';
    }
    var endHour = (date.getHours() + length < 10) ? `0${date.getHours()+length}` : `${date.getHours() + length}` ;
    if(duration == 0){
      var dateStr = `${year}/${month}/${day} ${startHour}:${startMin}`;
    } else {
      var dateStr = `${year}/${month}/${day} ${startHour}:${startMin}-${endHour}:${endMin}`;
    }
    return dateStr;
  }
  static clearAll() {
    for(var sheet of Properties.TABLE_SHEET.getSheets())
      sheet.getRange(2, 2, sheet.getLastRow()+1, sheet.getLastColumn()+1).clear();
    Properties.RESERVATION_LOG_SHEET.getRange(2, 1, Properties.RESERVATION_LOG_SHEET.getLastRow()+1, Properties.RESERVATION_LOG_SHEET.getLastColumn()+1).clear();
    Properties.INVALID_LOG_SHEET.getRange(2, 1, Properties.INVALID_LOG_SHEET.getLastRow()+1, Properties.INVALID_LOG_SHEET.getLastColumn()+1).clear();
    Properties.CANCELLATION_LOG_SHEET.getRange(2, 1, Properties.CANCELLATION_LOG_SHEET.getLastRow()+1, Properties.CANCELLATION_LOG_SHEET.getLastColumn()+1).clear();
  }
  static sendBandReservationSuccessEmail(validReservations, invalidReservations, info){
    var validDates = [];
    for (var v of validReservations){
      var dateStr = Common.dateToString(v['date'], v['duration']);
      validDates.push(dateStr);
    }
    if(invalidReservations.length == 0){
      var body = `To ${info.member[0]}：
      已收到您的預約，資訊如下：
      類型：預約練團
      成員：${info.member.join(', ')}
      預約時段：${validDates.join(', ')}
      結果：成功
      請記得準時前來！
      北大熱音社`;
    } else {
      var invalidDates = [];
      var invalidMessages = [];
      for (var v of invalidReservations){
        var dateStr = Common.dateToString(v['date'], v['duration']);
        var msg = v['message'];
        invalidDates.push(dateStr);
        invalidMessages.push(msg);
      }
      var body = `To ${info.member[0]}：
      已收到您的預約，資訊如下：
      類型：預約練團
      成員：${info.member.join(', ')}
      預約時段：${validDates.join(', ')}
      結果：成功
      預約時段：${invalidDates.join(', ')}
      結果：失敗（${invalidMessages.join(', ')}）
      如有任何問題，請洽社團幹部。
      北大熱音社`;
    }
    MailApp.sendEmail(info.emailAddress, '預約結果通知', body);
  }
  static sendBandReservationErrorEmail(invalidReservations, info){
    var invalidDates = [];
    var invalidMessages = [];
    for (var v of invalidReservations){
      var dateStr = Common.dateToString(v['date'], v['duration']);
      var msg = v['message'];
      invalidDates.push(dateStr);
      invalidMessages.push(msg);
    }
    var body = `To ${info.member[0]}：
      已收到您的預約，資訊如下：
      類型：預約練團
      預約時段：${invalidDates.join(', ')}
      結果：失敗（${invalidMessages.join(', ')}）
      如有任何問題，請洽社團幹部。
      北大熱音社`;
    MailApp.sendEmail(info.emailAddress, '預約失敗通知', body);
  }
}
