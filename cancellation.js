class CancellationHandler extends Handler{
  constructor(response){
    super(response);
    this.type = '取消預約';
  }
  handle(response){
    this.info = new CancellationInfo(response);
    this.validator = new CancellationValidator();
    try {
      this.validator.verify(this.info);
      this.onSuccess();
    } catch(err){
      this.onError(err);
      return;
    }
  }
  onSuccess(){
    for(var r of this.validator.range){
      r.clear();
    }
    var row = this.validator.record;
    row.push(this.info.submitDate);
    Properties.RESERVATION_LOG_SHEET.deleteRow(this.validator.rowIndex);
    Properties.CANCELLATION_LOG_SHEET.appendRow(row);
    var dateStr = Common.dateToString(row[3], row[4]);
    var member = String(row[5]).split('\n')[0]
    MailApp.sendEmail(row[1], 
    '預約結果通知', 
    `To ${member}：
    已收到您的取消申請，資訊如下：
    欲取消之時間：${dateStr}
    結果：成功
    如有任何問題，請洽社團幹部。
    北大熱音社`);
    Logger.log(`Cancellation Success. info: ${JSON.stringify(this.info)}`);
  }
  onError(err){
    if(this.validator.record == null){
      var row = [this.info.submitDate, this.info.emailAddress, this.info.reserveType, this.info.reserveDate, '-', '-', err];
    } else {
      var row = [this.info.submitDate, this.info.emailAddress, this.info.reserveType, this.info.reserveDate, this.validator.record[4], this.validator.record[5], err];
    }
    var dateStr = Common.dateToString(this.info.reserveDate, 0);
    Properties.INVALID_LOG_SHEET.appendRow(row);
    MailApp.sendEmail(this.info.emailAddress, 
    '預約結果通知',
    `已收到您的取消申請，資訊如下：
    欲取消之時間：${dateStr}
    結果：失敗（${err}）
    如有任何問題，請洽社團幹部。
    北大熱音社`);
    Logger.log(`Cancellation Failed. info: ${JSON.stringify(this.info)}, message: ${err}`);
  }
}

class CancellationInfo extends Info{
  constructor(response){
    super(response);
    this.setReserveDate();
  }
  setReserveDate(){
    this.reserveDate = new Date(`${this.response['原本預約的日期'][0]} ${this.response['開始時間'][0]}`);
  }
}

class CancellationValidator extends Validator{
  constructor(){
    super();
    this.record = null;
  };
  verify(info){
    this.isCancellingPast(info.submitDate, info.reserveDate)
      .isLogExists(info.reserveDate)
      .isCrossDay(info.reserveDate, this.record[4])
      .setRange(info.reserveDate, this.record[4])
      .isRangeEmpty()
  }
  isCancellingPast(submitDate, reserveDate){
    if(submitDate.getTime() >= reserveDate.getTime()){
      throw '不能取消過去的預約';
    }
    return this;
  }
  isLogExists(reserveDate){
    var sheet = Properties.RESERVATION_LOG_SHEET;
    var dataGrid = sheet.getDataRange().getValues();
    for(var row of dataGrid){
      if(!(row[3] instanceof Date)) continue;
      if(reserveDate.getTime() == row[3].getTime()){
        this.rowIndex = dataGrid.indexOf(row) + 1;
        this.record = row;
        return this;
      }
    }
    throw '欲取消的預約不存在';
  }
  isCrossDay(reserveDate, duration){
    var minutes = reserveDate.getHours() * 60 + reserveDate.getMinutes() + duration * 60;
    if(minutes > 1440){
      this.nextDay = new Date(reserveDate.getTime() + 86400000);
    } else {
      this.nextDay = null;
    }
    return this;
  }
  setRange(reserveDate, duration){
    var date = reserveDate;
    var totalLength = duration * 2;
    var first_sheet_name = `${date.getFullYear()}/${date.getMonth()+1}`;
    var first_row = (date.getHours() * 2) + (date.getMinutes() / 30) + 2;
    var first_col = date.getDate() + 1;
    var first_length = (this.nextDay == null) ? totalLength : 50 - first_row;
    var first_range = Properties.TABLE_SHEET.getSheetByName(first_sheet_name).getRange(first_row, first_col, first_length);
    if(this.nextDay != null){
      var second_sheet_name = `${this.nextDay.getFullYear()}/${this.nextDay.getMonth()+1}`;
      var second_row = 2;
      var second_col = this.nextDay.getDate() + 1;
      var second_length = totalLength - first_length;
      var second_range = Properties.TABLE_SHEET.getSheetByName(second_sheet_name).getRange(second_row, second_col, second_length);
      this.range = [first_range, second_range];
      return this;
    } else {
      this.range = [first_range];
      return this;
    }
  }
  isRangeEmpty(){
    for(var r of this.range){
      if(r.isBlank() && !r.isPartOfMerge()){
        throw '欲取消的預約不存在';
      }
    }
    return this;
  }
}