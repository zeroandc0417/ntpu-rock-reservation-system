function onDayBegin() {
  var manager = new ScriptStatusManager(new Date());
  manager.isFormMissing()
    .isActivityFormMissing()
    .isLogMissing()
    .isTableMissing()
    .isEverythingOK()
    .isFileInPlace()
    .isNewSemester();
}
