class BandReservationHandler extends Handler{
  constructor(response){
    super(response);
    this.type = '預約練團';
  }
  handle(response){
    this.info = new BandReservationInfo(response);
    this.validator = new BandReservationValidator();
    try {
      this.validator.verify(this.info);
    } catch(err) {
      this.onError(err);
      return;
    }
    this.onSuccess();
  }
  onSuccess(){
    for(var reservation of this.validator.validReservations){
      for(var r of reservation['range']){
        r.merge()
        .setVerticalAlignment("middle")
        .setHorizontalAlignment("center")
        .setValue(this.info.member.join('\n'))
        .setBackground('#93E9BE')
        .setBorder(true, true, true, true, false, false, 'black', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      }
      Properties.RESERVATION_LOG_SHEET.appendRow([this.info.submitDate, this.info.emailAddress, this.info.reserveType, reservation['date'], reservation['duration'], this.info.member.join('\n')]);
    }
    for(var reservation of this.validator.invalidReservations){
      Properties.INVALID_LOG_SHEET.appendRow([this.info.submitDate, 
        this.info.emailAddress, 
        this.info.reserveType, 
        reservation['date'], 
        reservation['duration'], 
        this.info.member.join('\n'), 
        reservation['message']]);
    }
    Common.sendBandReservationSuccessEmail(this.validator.validReservations, this.validator.invalidReservations, this.info);
    Logger.log(`Band Reservation Success. info: ${JSON.stringify(this.info)}`);
  }
  onError(err){
    for(var reservation of this.validator.invalidReservations){
      Properties.INVALID_LOG_SHEET.appendRow([
        this.info.submitDate,
        this.info.emailAddress,
        this.info.reserveType,
        reservation['date'],
        reservation['duration'],
        this.info.member.join('\n'),
        reservation['message']
      ]);
    }
    Common.sendBandReservationErrorEmail(this.validator.invalidReservations, this.info);
    Logger.log(`Band Reservation Failed. info: ${JSON.stringify(this.info)}, message: ${err}`);
  }
}
class BandReservationInfo extends Info{
  constructor(response){
    super(response);
    this.setReserveDates()
      .setMember();
  }
  setReserveDates(){
    this.reservations = [];
    for(var i = 0; i < 3; i++){
      if(this.response[`日期 ${i+1}`][i] != ''){
        if(this.response[`開始時間`][i] == '' || this.response['持續時間'][i] == ''){
          continue;
        }
        var day = this.response[`日期 ${i+1}`][0];
        var time = this.response['開始時間'][i];
        var date = new Date(`${day} ${time}`);
        var duration = this.response['持續時間'][i];
        this.reservations.push({'date': date, 'duration': duration});
      }
    }
    return this;
  }
  setMember(){
    this.member = [String(this.response['你的名字'][0]).replace(/\s/g, '')];
    for(var i = 1; i <= 4; i++){
      this.member.push(String(this.response[`團員 ${i} 的名字`][0]).replace(/\s/g, ''));
    }
    var additionalMembers = String(this.response['其他團員的名字'][0]).split(' ');
    for(var i = 0; i < additionalMembers.length; i++){
      additionalMembers[i].replace(/\s/g, '');
    }
    this.member = this.member.concat(additionalMembers);
    this.member = this.member.filter(Common.isNullString);
    return this;
  }
}

class BandReservationValidator extends Validator{
  constructor(){
    super();
    this.validReservations = [];
    this.invalidReservations = [];
  }
  verify(info){
    for(var reservation of info.reservations){
      try {
        this.reservation = reservation;
        this.isReservingPast(info.submitDate, reservation['date'])
          .isDateOpen(reservation)
          .isCrossDay(reservation)
          .setRange(reservation)
          .isReservationOnDay(info.submitDate, reservation['date'])
          .isAlreadyReserved();
        this.validReservations.push({'range': this.range, 'date': reservation['date'], 'duration': reservation['duration']});
      } catch(err){
        this.invalidReservations.push({'date': reservation['date'], 'duration': reservation['duration'], 'message': err});
      }
    }
    if(this.validReservations[0] == null){
      throw '預約無效';
    }
  }
  isReservingPast(submitDate, reserveDate){
    if(submitDate.getTime() >= reserveDate.getTime() + 600000){
      throw '不能預約以前的時間';
    } else {
      return this;
    }
  }
  isDateOpen(reservation){
    var startTime = reservation['date'].getTime();
    var endTime = startTime + reservation['duration'] * 60 * 60 * 1000;
    if(Properties.START_DATE.getTime() <= startTime && endTime <= Properties.END_DATE.getTime()){
      return this;
    } else {
      throw '欲租借的時段尚未開放';
    }
  }
  isCrossDay(reservation){
    var minutes = reservation['date'].getHours() * 60 + reservation['date'].getMinutes() + reservation['duration'] * 60;
    if(minutes > 1440){
      this.nextDay = new Date(reservation['date'].getTime() + 86400000);
    } else {
      this.nextDay = null;
    }
    return this;
  }
  setRange(reservation){
    var date = reservation['date'];
    var totalLength = reservation['duration'] * 2;
    var first_sheet_name = `${date.getFullYear()}/${date.getMonth()+1}`;
    var first_row = (date.getHours() * 2) + (date.getMinutes() / 30) + 2;
    var first_col = date.getDate() + 1;
    var first_length = (this.nextDay == null) ? totalLength : 50 - first_row;
    var first_range = Properties.TABLE_SHEET.getSheetByName(first_sheet_name).getRange(first_row, first_col, first_length);
    if(this.nextDay != null){
      var second_sheet_name = `${this.nextDay.getFullYear()}/${this.nextDay.getMonth()+1}`;
      var second_row = 2
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
  isReservationOnDay(submitDate, reserveDate){
    var submitTime = new Date(Utilities.formatDate(submitDate, 'GMT+8', 'yyyy/MM/dd')).getTime();
    var reserveTime = new Date(Utilities.formatDate(reserveDate, 'GMT+8', 'yyyy/MM/dd')).getTime();
    if(submitTime == reserveTime){
      throw '練團不可以當天預約';
    }
    return this;
  }
  isAlreadyReserved(){
    for(var r of this.range){
      if(!r.isBlank() || r.isPartOfMerge()){
        throw '欲租借的時段已有人預約';
      }
    }
    return this;
  }
}


