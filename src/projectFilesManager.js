class ProjectFilesManager{
  constructor(){}
  getProjectFiles(){
    this.projectFiles = [];
    var files = DriveApp.getFiles();
    while(files.hasNext()){
      var file = files.next();
      if((file.getName().indexOf('社辦租借') > -1) || file.getName() == '社課/活動表單' || file.getName() == 'README' || file.getName() == 'ntpurockhelper'){
        Logger.log(`Project file found: ${file.getName()}`);
        this.projectFiles.push(file);
      }
    }
    return this;
  }
  getDestFolder(){
    var folders = DriveApp.getFolders();
    while(folders.hasNext()){
      var folder = folders.next();
      if(folder.getName() == 'ntpurockhelper'){
        Logger.log(`Project Folder Detected: ${folder.getName()}`);
        this.folder = folder;
        return this;
      }
    }
    Logger.log(`Project folder is missing. Created a new one.`);
    this.folder = DriveApp.createFolder('ntpurockhelper');
    return this;
  }
  moveProjectFiles(){
    for(var file of this.projectFiles){
      var path = [];
      var parents = file.getParents();
      while(parents.hasNext()){
        var parent = parents.next();
        path.push(parent.getName());
      }
      Logger.log(`${file.getName()} is current at directory: ${path.reverse().join('/')}`);
      file.moveTo(this.folder);
    }
    return this;
  }
}

function test(){
  var h = new ProjectFilesManager();
  h.getProjectFiles()
    .getDestFolder()
    .moveProjectFiles();
}