class FormGenerator{
  constructor(){
    this.id = null;
  }
  createForm(){
    this.configMainPage()
      .configBandReservationPage()
      .configMemberPage()
      .configPersonalReservationPage()
      .configCancelPage()
      .setRouting()
      .setTrigger();
  }
  configMainPage(){
    this.form = FormApp.create('社辦租借表單');
    this.id = this.form.getId();
    this.form.setDescription(`1.租用社辦時間不得與社課時間衝突。
2.使用晚上10點後，須承擔被警衛阻止練習之風險。
3.如要練團請至少提前一天在此文底下留言，留言內容需包含欲借用之「日期、時間、所有團員姓名」
4.練鼓與個人借用社辦空間限當天登記。
5.預約社辦後，如臨時有事欲取消者，請於租借時間至少 12 小時之前取消。
6.為確保他人使用社辦之權益，預約社辦未取消而無故不到者，需支付租借時間之租金（100/hr），並暫停預約社辦之權利兩週。
7.練團費用:社員每人20/h，非社員每團300/h
8.租用完社辦請將器材電源關閉並物歸原位。`);
    this.mainPageItem = this.form.addMultipleChoiceItem().setTitle('預約類型');
    Logger.log(`new form created: ${this.form.getEditUrl()}`);
    return this;
  }
  configBandReservationPage(){
    this.mainPageBreakItem = this.form.addPageBreakItem().setTitle('預約練團');
    this.form.addDateItem()
      .setTitle('日期 1')
      .setIncludesYear(true)
      .setRequired(true);
    this.form.addListItem()
      .setTitle('開始時間')
      .setRequired(true)
      .setChoiceValues(Common.generateTimeArray());
    this.form.addListItem()
      .setTitle('持續時間')
      .setHelpText('單位是小時')
      .setRequired(true)
      .setChoiceValues(Common.generateDuration());
    for(var i = 2; i <= 3; i++){
      this.form.addDateItem()
        .setTitle(`日期 ${i}`)
        .setIncludesYear(true)
        .setHelpText(`只約一天的話不用填`);
      this.form.addListItem()
        .setTitle('開始時間')
        .setChoiceValues(Common.generateTimeArray())
      this.form.addListItem()
        .setTitle('持續時間')
        .setChoiceValues(Common.generateDuration());
    }
    return this;
  }
  configMemberPage(){
    this.bandReservationPageBreakItem = this.form.addPageBreakItem()
      .setTitle('團員的名字')
      .setHelpText(`其他人的名字記得填ㄛ\n不然要幫大家付`);
    this.form.addTextItem().setTitle('你的名字').setRequired(true);
    for(var i = 1; i <= 4; i++){
      this.form.addTextItem().setTitle(`團員 ${i} 的名字`);
    }
    this.form.addTextItem().setTitle('其他團員的名字').setHelpText('如有兩位以上請用空格分隔');
    return this;
  }
  configPersonalReservationPage(){
    this.memberPageBreakItem = this.form.addPageBreakItem()
      .setTitle('個人練習')
      .setHelpText('僅限當天借用');
    this.form.addListItem()
      .setTitle('開始時間')
      .setRequired(true)
      .setChoiceValues(Common.generateTimeArray());
    this.form.addListItem()
      .setTitle('持續時間')
      .setHelpText('單位是小時')
      .setRequired(true)
      .setChoiceValues(Common.generateDuration());
    this.form.addTextItem()
      .setTitle('你的名字')
      .setRequired(true);
    return this;
  }
  configCancelPage(){
    this.personalReservationPageBreakItem = this.form.addPageBreakItem()
      .setTitle('取消預約')
      .setHelpText('不要取消別人的預約ㄛ...');
    this.form.addDateItem()
      .setTitle('原本預約的日期')
      .setRequired(true);
    this.form.addListItem()
      .setTitle('開始時間')
      .setRequired(true)
      .setChoiceValues(Common.generateTimeArray());
    return this;
  }
  setRouting(){
    this.mainPageBreakItem.setGoToPage(FormApp.PageNavigationType.CONTINUE);
    this.bandReservationPageBreakItem.setGoToPage(FormApp.PageNavigationType.CONTINUE);
    this.memberPageBreakItem.setGoToPage(FormApp.PageNavigationType.SUBMIT);
    this.personalReservationPageBreakItem.setGoToPage(FormApp.PageNavigationType.SUBMIT);
    this.mainPageItem.setRequired(true)
      .setChoices([
        this.mainPageItem.createChoice('預約練團', this.mainPageBreakItem),
        this.mainPageItem.createChoice('個人練習', this.memberPageBreakItem),
        this.mainPageItem.createChoice('取消預約', this.personalReservationPageBreakItem)
      ])
    return this;
  }
  setTrigger(){
    Properties.FORM_ID = this.id;
    for(var t of ScriptApp.getProjectTriggers()){
      if(t.getHandlerFunction() == 'onFormSubmit'){
        ScriptApp.deleteTrigger(t);
      }
    }
    createOnFormSubmitTrigger();
    return this;
  }
}