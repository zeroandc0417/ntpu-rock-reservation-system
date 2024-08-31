// 以 CoR pattern 實作
class Handler{
  constructor(nextHandler){
    this.nextHandler = nextHandler;
  }
  dealWith(response){
    if(response['預約類型'][0] == this.type){
      this.handle(response);
    } else if(this.nextHandler != undefined){
      this.nextHandler.dealWith(response);
    } else {
      throw '未知的預約類型';
    };
  };
  handle(){};
  onSuccess(){};
  onError(){};
}
/*
檢查條件：
1.不能預約/取消以前的日期 isReservingPast
2.必須是開放預約的日期 isAcceptedDate
3.不能預約已經被預約走的時段 isAlreadyReserved
4.當日租用不能跨日 isCrossDay
5.預約練團不能當天 isReservingOnDay
6.取消預約必須早於練團時間 24 小時以上
*/
class Validator{
  constructor(){}
  verify(){};
}

class Info{
  constructor(response){
    this.response = response;
    this.setSubmitDate()
      .setEmailAddress()
      .setReserveType();
  }
  setSubmitDate(){
    this.submitDate = this.response['timestamp'];
    return this;
  }
  setEmailAddress(){
    this.emailAddress = this.response['email'];
    return this;
  }
  setReserveType(){
    this.reserveType = this.response['預約類型'][0];
    return this;
  }
  setDuration(){};
  setReserveDate(){};
  setMember(){};
}
