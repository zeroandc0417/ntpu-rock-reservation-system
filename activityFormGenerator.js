class ActivityFormGenerator{
  constructor(){
    this.id = null;
  }
  createActivityForm(){
    this.configMainPage()
      .configCoursePage()
      .configActivityPage()
      .setRouting()
      .setTrigger();
  }
  configMainPage(){
    this.form = FormApp.create('社課/活動表單').setDescription(`這個是方便教學們在時間表上新增社課/活動時間的表單，不是給社員填的，請勿外流
要取消的話直接手動去改時間表就好`);
    this.id = this.form.getId();
    this.mainItem = this.form.addMultipleChoiceItem()
      .setRequired(true)
      .setTitle('新增項目');
    Logger.log(`url: ${this.form.getEditUrl()}`);
    return this;
  }
  configCoursePage(){
    this.coursePage = this.form.addPageBreakItem().setTitle('社課');
    this.form.addTextItem()
      .setRequired(true)
      .setTitle('社課名字');
    this.form.addListItem()
      .setRequired(true)
      .setTitle('每個禮拜幾')
      .setChoiceValues(['一', '二', '三', '四', '五', '六', '日']);
    this.form.addListItem()
      .setRequired(true)
      .setTitle('開始時間')
      .setChoiceValues(Common.generateTimeArray());
    this.form.addListItem()
      .setRequired(true)
      .setTitle('持續時間')
      .setHelpText('單位: 小時')
      .setChoiceValues(Common.generateDuration());
    return this;
  }
  configActivityPage(){
    this.activityPage = this.form.addPageBreakItem().setTitle('活動');
    this.form.addTextItem()
      .setRequired(true)
      .setTitle('活動名稱');
    this.form.addDateItem()
      .setRequired(true)
      .setIncludesYear(true)
      .setTitle('開始日期');
    this.form.addListItem()
      .setRequired(true)
      .setTitle('開始時間')
      .setChoiceValues(Common.generateTimeArray());
    this.form.addDateItem()
      .setRequired(true)
      .setIncludesYear(true)
      .setTitle('結束日期');
    this.form.addListItem()
      .setRequired(true)
      .setTitle('結束時間')
      .setChoiceValues(Common.generateTimeArray());
    return this;
  }
  setRouting(){
    this.mainItem.setChoices([
      this.mainItem.createChoice('社課', this.coursePage),
      this.mainItem.createChoice('活動', this.activityPage)
    ])
    this.activityPage.setGoToPage(FormApp.PageNavigationType.SUBMIT);
    return this;
  }
  setTrigger(){
    Logger.log(`current activity form: ${Properties.ACTIVITY_FORM_ID}`);
    Properties.ACTIVITY_FORM_ID = this.id;
    Logger.log(`new id: ${Properties.ACTIVITY_FORM_ID}`);
    for(var t of ScriptApp.getProjectTriggers()){
      if(t.getHandlerFunction() == 'onAddingActivity'){
        ScriptApp.deleteTrigger(t);
      }
    }
    createAddingActivityTrigger();
    return this;
  }
}