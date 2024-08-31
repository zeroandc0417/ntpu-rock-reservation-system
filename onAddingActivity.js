function onAddingActivity(e){
  var response = Common.formResponseToDict(e.response);
  var handler = new CourseHandler(new ActivityHandler());
  handler.dealWith(response);
}

function createAddingActivityTrigger(){
  var form = FormApp.openById(Properties.ACTIVITY_FORM_ID);
  ScriptApp.newTrigger('onAddingActivity')
    .forForm(form)
    .onFormSubmit()
    .create();
}