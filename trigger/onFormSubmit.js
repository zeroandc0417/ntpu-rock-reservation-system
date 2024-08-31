// Copyright © 2024 Han-Hsin Lin. All rights reserved.
// For any questions, please contact: oscar83155@gmail.com

function onFormSubmit(e){
  var response = Common.formResponseToDict(e.response);
  var handler = new BandReservationHandler(new PersonalReservationHandler(new CancellationHandler()));
  handler.dealWith(response);
}

function createOnFormSubmitTrigger() {
  const form = FormApp.openById(Properties.FORM_ID);
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}