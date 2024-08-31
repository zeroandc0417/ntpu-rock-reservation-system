// 這個 class 負責檢查專案的狀態，必要的時候會呼叫 statCalculator, tableGenerator 或 logGenerator 來生成新的表單 
class ScriptStatusManager{
  constructor(date){
    this.date = date;
    this.formStatus = null;
    this.tableStatus = null;
    this.logStatus = null;
  }
  isNewSemester(){
    var dateStr = `${this.date.getMonth()+1}/${this.date.getDate()}`;
    if(dateStr != '9/1' && dateStr != '2/1' && dateStr != '7/1'){
      Logger.log('Today is not new semester.');
    } else {
      Logger.log('New semester is coming!');
      this.onNewSemester();
    }
    return this;
  }
  isFormMissing(){
    try {
      FormApp.openById(Properties.FORM_ID);
    } catch {
      var formGenerator = new FormGenerator();
      formGenerator.createForm();
      this.formStatus = `找不到表單。已重新建立，連結：${FormApp.openById(Properties.FORM_ID).getEditUrl()}`;
      Logger.log('Form is missing. Created a new one.');
    }
    Logger.log('Form is OK');
    return this;
  }
  isActivityFormMissing(){
    try {
      FormApp.openById(Properties.ACTIVITY_FORM_ID);
    } catch {
      var activityFormGenerator = new ActivityFormGenerator();
      activityFormGenerator.createActivityForm();
      this.activityForm = `找不到社課表單。已重新建立，連結：${FormApp.openById(Properties.ACTIVITY_FORM_ID).getEditUrl()}`;
      Logger.log('Activity Form is missing. Created a new one.');
    }
    Logger.log('Activity Form is OK');
    return this;
  }
  isTableMissing(){
    try {
      Properties.TABLE_SHEET;
    } catch {
      Logger.log('Table sheet is missing. Created a new one.');
      Properties.TABLE_SHEET_ID = TableGenerator.createTableSheet();
      this.tableStatus = `找不到時間表。已重新建立，連結：${Properties.TABLE_SHEET.getUrl()}`;
    }
    Logger.log('Table is OK');
    return this;
  }
  isLogMissing(){
    try {
      Properties.LOG_SHEET;
    } catch {
      Logger.log('Log sheet is missing. Created a new one.');
      Properties.LOG_SHEET_ID = LogGenerator.createLogSheet();
      this.logStatus = `找不到紀錄表。已重新建立，連結：${Properties.LOG_SHEET.getUrl()}`;
    }
    Logger.log('Log is OK');
    return this;
  }
  isEverythingOK(){
    var message = [];
    if(this.formStatus != null) message.push(this.formStatus);
    if(this.tableStatus != null) message.push(this.tableStatus);
    if(this.logStatus != null) message.push(this.logStatus);
    if(message.length == 0)
      Logger.log('Everything is fine');
    else {
      MailApp.sendEmail(Properties.MANAGER_EMAIL, '專案狀態通知', message.join('\n'));
    }
    return this;
  }
  isFileInPlace(){
    var manager = new ProjectFilesManager();
    manager.getProjectFiles()
      .getDestFolder()
      .moveProjectFiles();
    return this;
  }
  onNewSemester(){
    // calcStat
    StatCalculator.createStatSheet();
    // setSemesterName
    var oldSemester = Properties.SEMESTER_NAME;
    Properties.SEMESTER_NAME = this.date;
    // set START_DATE, END_DATE
    Properties.START_DATE = this.date;
    Properties.END_DATE = this.date;
    // genTable
    Properties.TABLE_SHEET_ID = TableGenerator.createTableSheet();
    // genLog
    Properties.LOG_SHEET_ID = LogGenerator.createLogSheet();
    // sendEmail
    MailApp.sendEmail({
    to: `${Properties.MANAGER_EMAIL}`,
    subject: `${oldSemester}報告`,
    htmlBody: `本學期<a href=${Properties.STAT_SHEET_URL}>練團時數統計</a>已完成。
    新學期之社辦租借<a href=${Properties.TABLE_SHEET.getUrl()}>時間表</a>以及<a href=${Properties.LOG_SHEET.getUrl()}>紀錄表</a>已建立。
    請前往確認。`});
  }
}
