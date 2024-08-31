// this class is manager of all script properties.
// the script will automatically modify these properties itself. 
// Please DO NOT modify this file.
class Properties{
  static get ACTIVITY_FORM_ID(){return PropertiesService.getScriptProperties().getProperty('COURSE_FORM_ID')};
  static set ACTIVITY_FORM_ID(id){PropertiesService.getScriptProperties().setProperty('COURSE_FORM_ID', id)};
  static get FORM_ID(){return PropertiesService.getScriptProperties().getProperty('FORM_ID')};
  static set FORM_ID(id){PropertiesService.getScriptProperties().setProperty('FORM_ID', id)};
  static get TABLE_SHEET_ID(){return PropertiesService.getScriptProperties().getProperty('TABLE_SHEET_ID')};
  static set TABLE_SHEET_ID(id){PropertiesService.getScriptProperties().setProperty('TABLE_SHEET_ID', id)};
  static get LOG_SHEET_ID(){return PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID')};
  static set LOG_SHEET_ID(id){PropertiesService.getScriptProperties().setProperty('LOG_SHEET_ID', id)};
  static get MANAGER_EMAIL(){return PropertiesService.getScriptProperties().getProperty('MANAGER_EMAIL');}
  static get START_DATE(){return new Date(PropertiesService.getScriptProperties().getProperty('START_DATE'))};
  static set START_DATE(date){
    var start_date = `${date.getFullYear()}/${date.getMonth()+1}/1`;
    PropertiesService.getScriptProperties().setProperty('START_DATE', start_date)
  };
  static get END_DATE(){return new Date(PropertiesService.getScriptProperties().getProperty('END_DATE'))};
  static set END_DATE(date){
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    switch(month){
      case 9:
        var end_date = `${year+1}/2/1`;
        break;
      case 2:
        var end_date = `${year}/7/1`;
        break;
      case 7:
        var end_date = `${year}/9/1`;
        break;
    }
    PropertiesService.getScriptProperties().setProperty('END_DATE', end_date);
  };
  static get LOG_SHEET(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID'))};
  static get RESERVATION_LOG_SHEET(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID')).getSheetByName('預約紀錄')};
  static get CANCELLATION_LOG_SHEET(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID')).getSheetByName('已取消的預約')};
  static get INVALID_LOG_SHEET(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('LOG_SHEET_ID')).getSheetByName('無效的預約')};
  static get TABLE_SHEET(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('TABLE_SHEET_ID'))};
  static get SEMESTER_NAME(){return PropertiesService.getScriptProperties().getProperty('SEMESTER_NAME')};
  static set SEMESTER_NAME(date){
    var month = date.getMonth()+1;
    var academicYear = date.getFullYear() - 1911;
    var semesterName = { 9: '上學期', 2: '下學期', 7: '暑假' };
    if(month != 9){
      academicYear -= 1;
    }
    PropertiesService.getScriptProperties().setProperty('SEMESTER_NAME', `${academicYear}${semesterName[month]}`);
  }
  static get STAT_SHEET_URL(){return PropertiesService.getScriptProperties().getProperty('STAT_SHEET_URL')};
  static set STAT_SHEET_URL(url){PropertiesService.getScriptProperties().setProperty('STAT_SHEET_URL', url)};
}