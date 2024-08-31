class CourseHandler{
  constructor(nextHandler){
    this.type = '社課';
    this.next = nextHandler;
  }
  dealWith(response){
    if(response['新增項目'][0] == this.type){
      this.handle(response);
    } else if(this.next != null){
      this.next.dealWith(response);
    } else{
      throw 'Error';
    }
  }
  handle(response){
    this.response = response;
    this.getCourseName()
      .getWeekday()
      .getStartTime()
      .getDuration()
      .getDates()
      .getRanges()
      .updateCourseTime();
    MailApp.sendEmail(Properties.MANAGER_EMAIL, '新增社課通知', `${this.courseName}已新增。
    時段：每周${this.response['每個禮拜幾'][0]}${Common.timeToString(this.startTime, this.duration)}`);
  }
  getCourseName(){
    this.courseName = this.response['社課名字'][0];
    return this;
  }
  getWeekday(){
    this.weekday = Common.weekdayLiteralToNumber(this.response['每個禮拜幾'][0]);
    return this;
  }
  getStartTime(){
    this.startTime = this.response['開始時間'][0];
    return this;
  }
  getDuration(){
    this.duration = this.response['持續時間'][0];
    return this;
  }
  getDates(){
    this.dateList = [];
    var date = Properties.START_DATE;
    while(date < Properties.END_DATE){
      if(date.getDay() == this.weekday){
        this.dateList.push(date);
      }
      date = new Date(date.getTime() + 86400000);
    }
    return this;
  }
  getRanges(){
    this.rangeList = [];
    for(var date of this.dateList){
      var coord = new Coord(date, this.startTime, this.duration);
      var range = Properties.TABLE_SHEET.getSheetByName(coord.sheetName).getRange(coord.row, coord.col, coord.numRows);
      this.rangeList.push(range);
    }
    return this;
  }
  updateCourseTime(){
    for(var r of this.rangeList){
      r.merge()
        .setVerticalAlignment("middle")
        .setHorizontalAlignment("center")
        .setValue(this.courseName)
        .setBackground('#8FBC8F')
        .setBorder(true, true, true, true, false, false, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    }
  }
}

class ActivityHandler{
  constructor(nextHandler){
    this.type = '活動';
    this.next = nextHandler;
  }
  dealWith(response){
    if(response['新增項目'][0] == this.type){
      this.handle(response);
    } else if(this.next != null){
      this.next.dealWith(response);
    } else{
      throw 'Error';
    }
  }
  handle(response){
    this.response = response;
    this.getActivityName()
      .getStartDate()
      .getEndDate()
      .getRange()
      .updateActivity();
    MailApp.sendEmail(Properties.MANAGER_EMAIL, '活動建立通知', `${this.activityName}已建立。
    開始時間：${this.startDate}
    結束時間：${this.endDate}`);
  }
  getActivityName(){
    this.activityName = this.response['活動名稱'][0];
    return this;
  }
  getStartDate(){
    this.startDate = new Date(`${this.response['開始日期'][0]} ${this.response['開始時間'][0]}`);
    Logger.log(`start: ${this.startDate}`);
    return this;
  }
  getEndDate(){
    this.endDate = new Date(`${this.response['結束日期'][0]} ${this.response['結束時間'][0]}`);
    Logger.log(`end: ${this.endDate}`);
    return this;
  }
  getRange(){
    this.rangeList = [];
    var duration = (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60);
    var date = this.startDate;
    Logger.log(`start at: ${date}, ${duration}(hours)`);
    while(duration > 0){
      var sheetName = `${date.getFullYear()}/${date.getMonth()+1}`;
      var row = date.getHours() * 2 + date.getMinutes() / 30 + 2;
      var col = date.getDate() + 1;
      var length = (date.getHours() * 60 + date.getMinutes() + duration * 60 > 1440) ? 50 - row : duration * 2;
      Logger.log(`${date}, ${sheetName}, ${row}, ${col}, ${length}`);
      this.rangeList.push(Properties.TABLE_SHEET.getSheetByName(sheetName).getRange(row, col, length));
      duration -= (length / 2);
      date = new Date(`${Utilities.formatDate(new Date(date.getTime() + 86400000), 'GMT+8', 'yyyy/MM/dd')} 00:00:00`);
    }
    return this;
  }
  updateActivity(){
    for(var r of this.rangeList){
      r.merge()
        .setVerticalAlignment("middle")
        .setHorizontalAlignment("center")
        .setValue(this.activityName)
        .setBackground('#BC8F8F')
        .setBorder(true, true, true, true, false, false, 'black', SpreadsheetApp.BorderStyle.DOUBLE);
    }
    return this;
  }
}

class Coord{
  constructor(date, startTime, duration){
    var [hour, min] = startTime.split(':');
    this.sheetName = `${date.getFullYear()}/${date.getMonth()+1}`;
    this.col = date.getDate() + 1;
    this.row = (Number(hour) * 2) + (Number(min) / 30) + 2;
    this.numRows = duration * 2;
  }
}