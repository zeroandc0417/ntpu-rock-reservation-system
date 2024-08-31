class PersonalReservationHandler extends Handler{
  constructor(response){
    super(response);
    this.type = '個人練習';
  }
  handle(response){
    this.info = new PersonalReservationInfo(response);
    this.validator = new PersonalReservationValidator();
    try {
      this.validator.verify(this.info);
      this.onSuccess();
    } catch(err){
      this.onError(err);
      return;
    }
  }
  onSuccess(){
    this.validator.range.merge()
        .setVerticalAlignment("middle")
        .setHorizontalAlignment("center")
        .setValue(this.info.member)
        .setBackground('#9370DB')
        .setBorder(true, true, true, true, false, false, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    Properties.RESERVATION_LOG_SHEET.appendRow([this.info.submitDate, 
      this.info.emailAddress, 
      this.info.reserveType, 
      this.info.reserveDate,
      this.info.duration, 
      this.info.member])
    var dateStr = Common.dateToString(this.info.reserveDate, this.info.duration);
    MailApp.sendEmail(this.info.emailAddress, 
    '預約結果通知', 
    `To ${this.info.member}：
    已收到您的預約，資訊如下：
    類型：個人練習
    預約時間：${dateStr}
    結果：成功
    請記得準時前來。
    北大熱音社`);
    Logger.log(`Personal Reservation Success. info: ${JSON.stringify(this.info)}`);
  }
  onError(err){
    Properties.INVALID_LOG_SHEET.appendRow([this.info.submitDate, 
      this.info.emailAddress, 
      this.info.reserveType, 
      this.info.reserveDate,
      this.info.duration, 
      this.info.member,
      err]);
    var dateStr = Common.dateToString(this.info.reserveDate, this.info.duration);
    MailApp.sendEmail(this.info.emailAddress, 
    '預約失敗通知', 
    `To ${this.info.member}：
    已收到您的預約，資訊如下：
    類型：個人練習
    預約時間：${dateStr}
    結果：失敗（${err}）
    如有任何問題，請洽社團幹部。
    北大熱音社`);
    Logger.log(`Personal Reservation Failed. info: ${JSON.stringify(this.info)}, message: ${err}`);
  }
}

class PersonalReservationInfo extends Info{
  constructor(response){
    super(response);
    this.setReserveDate()
      .setMember();
  }
  setReserveDate(){
    var day = `${Utilities.formatDate(this.submitDate, 'GMT+8', 'yyyy/MM/dd')}`;
    var time = this.response['開始時間'][0];
    var date = new Date(`${day} ${time}`);
    this.duration = this.response['持續時間'][0];
    this.reserveDate = date;
    return this;
  }
  setMember(){
    this.member = this.response['你的名字'][0];
  }
}

class PersonalReservationValidator extends Validator{
  constructor(){
    super();
  }
  verify(info){
    this.isReservingPast(info.submitDate, info.reserveDate)
      .isCrossDay(info.reserveDate, info.duration)
      .setRange(info.reserveDate, info.duration)
      .isAlreadyReserved();
  }
  isReservingPast(submitDate, reserveDate){
    if(submitDate.getTime() >= reserveDate.getTime() + 600000){
      throw '不能預約以前的時間';
    } else {
      return this;
    }
  }
  isCrossDay(reserveDate, duration){
    var minutes = reserveDate.getHours() * 60 + reserveDate.getMinutes() + duration * 60;
    if(minutes > 1440){
      throw '個人練習不可以跨日';
    }
    return this;
  }
  setRange(reserveDate, duration){
    var sheet_name = `${reserveDate.getFullYear()}/${reserveDate.getMonth()+1}`;
    var row = (reserveDate.getHours() * 2) + (reserveDate.getMinutes() / 30) + 2;
    var col = reserveDate.getDate() + 1;
    var length = duration * 2;
    this.range = Properties.TABLE_SHEET.getSheetByName(sheet_name).getRange(row, col, length);
    return this;
  }
  isAlreadyReserved(){
    if(!this.range.isBlank() || this.range.isPartOfMerge()){
      throw '欲租借的時段已有人預約';
    }
    return this;
  }
}