import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { MenuItem, DynamicDialogConfig, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { ConstantsService } from 'src/app/Services/constants.service';

import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { MyDashboardConstantsService } from 'src/app/my-dashboard/services/my-dashboard-constants.service';



@Component({
  selector: 'app-view-upload-document-dialog',
  templateUrl: './view-upload-document-dialog.component.html',
  styleUrls: ['./view-upload-document-dialog.component.css']
})
export class ViewUploadDocumentDialogComponent implements OnInit, OnDestroy {
  selectedTab: string;
  data: any;
  status: any;
  selectedTask: any;
  response: any[];
  currentTask: any;
  batchContents: any;
  ProjectInformation: any;
  tempObject: any;
  allDocuments: any;
  DocumentArray: any = [];
  loaderenable: boolean;
  dbcols: { field: string; header: string; }[];
  cols: { field: string; header: string; }[];
  selectedDocuments: any = [];
  uploadedFiles: any[] = [];
  fileReader = new FileReader();
  prevTask: string;
  enableNotification = false;
  Emailtemplate: any;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  @Input() taskData: any;
  constructor(
    public config: DynamicDialogConfig,
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private spOperations: SPOperationService) { }

  items: MenuItem[];
  activeItem: MenuItem;
  async ngOnInit() {

    this.loaderenable = true;
    this.DocumentArray = [];
    this.data = this.config.data === undefined ? this.taskData : this.config.data;
    this.status = this.data.Status;
    this.enableNotification = this.data.emailNotificationEnable ? this.data.emailNotificationEnable : false;
    if (this.enableNotification) {
      this.getEmailTemplate();
    }
    this.selectedTask = this.config.data ? this.data.task ? this.data.task : this.data : this.taskData;
    if (this.selectedTask.ParentSlot) {
      const slotPNTask = await this.myDashboardConstantsService.getNextPreviousTask(this.selectedTask);
      const slotPTasks = slotPNTask.filter(ele => ele.TaskType === 'Previous Task');
      slotPTasks.forEach((element, i) => {
        this.selectedTask.PrevTasks = this.selectedTask.PrevTasks ? this.selectedTask.PrevTasks : '';
        this.selectedTask.PrevTasks += element.Title;
        this.selectedTask.PrevTasks += i < slotPTasks.length - 1 ? ';#' : '';
      });
    }

    if (this.selectedTask.PrevTasks) {
      this.items = [
        { label: 'For ' + this.selectedTask.Task, icon: 'fa fa-tasks', command: (e) => this.onChange(e) },
        { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) },
        { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
        { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
        { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
        { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
      this.activeItem = this.items[1];
      this.prevTask = this.items[0].label;
      this.selectedTab = 'My Drafts';
    } else {
      if (this.selectedTask.IsSearchProject) {
        this.items = [
          { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
          { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
          { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
          { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
        this.activeItem = this.items[0];
        this.selectedTab = 'Source Docs';
      } else {
        this.items = [

          { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) },
          { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
          { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
          { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
          { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
        this.activeItem = this.items[0];
        this.selectedTab = 'My Drafts';
      }
    }




    this.dbcols = [
      { field: 'Name', header: 'Document Name' },
      { field: 'taskName', header: 'Task Name' },
      { field: 'status', header: 'Status' },
      { field: 'modifiedUserName', header: 'Modified By' },
      { field: 'ModifiedDateString', header: 'Modified Date' },
    ];

    this.getDocuments(this.selectedTask);
    this.loaderenable = true;


  }

  ngOnDestroy() {
  }
  // *************************************************************************************************************************************
  //  onchange call when modal open
  // *************************************************************************************************************************************

  // ngOnChanges(changes: SimpleChanges) {
  //   this.loaderenable=true;
  //   this.DocumentArray = [];
  //   this.data = this.config.data === undefined ? this.taskData : this.config.data;
  //   if (this.data !== undefined) {

  //     this.status = this.data.status;
  //     this.selectedTask = this.config.data === undefined ? this.taskData :  this.data.task;

  //   }

  //   if (this.selectedTask.PrevTasks) {
  //     this.items = [
  //       { label: 'For ' + this.selectedTask.Task, icon: 'fa fa-tasks', command: (e) => this.onChange(e) },
  //       { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) },
  //       { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
  //       { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
  //       { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
  //       { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
  //     this.activeItem = this.items[1];
  //     this.prevTask = this.items[0].label;
  //     this.selectedTab = 'My Drafts';
  //   }
  //   else {
  //     this.items = [

  //       { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) },
  //       { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
  //       { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
  //       { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
  //       { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
  //     this.activeItem = this.items[0];

  //     this.selectedTab = 'My Drafts';
  //   }



  //   this.dbcols = [
  //     { field: 'Name', header: 'Document Name' },
  //     { field: 'taskName', header: 'Task Name' },
  //     { field: 'status', header: 'Status' },
  //     { field: 'modifiedUserName', header: 'Modified By' },
  //     { field: 'ModifiedDateString', header: 'Modified Date' },
  //   ];


  //   this.getDocuments(this.selectedTask);
  //   this.loaderenable = true;



  // }


  // **************************************************************************************************************************************
  //  Switch tab on click
  // **************************************************************************************************************************************

  onChange(event) {

    this.loaderenable = true;
    this.selectedDocuments = [];
    this.DocumentArray = [];
    this.selectedTab = event.item.label;
    const header = this.dbcols.slice(0);
    if (this.selectedTab !== 'My Drafts') {
      if (this.selectedTab === this.prevTask) {
        header.splice(2, 1);
      } else {
        header.splice(1, 2);
      }
    } else {
      header.splice(1, 1);
    }

    this.loadDraftDocs(this.selectedTab);

    this.cols = header;

  }



  // **************************************************************************************************************************************
  //  Get Documents On tab switch
  // **************************************************************************************************************************************
  async getDocuments(task) {
    const header = this.dbcols.slice(0);
    header.splice(1, 1);
    this.cols = header;

    if (task.Title) {
      if (this.sharedObject.DashboardData.ProjectInformation.ProjectCode === task.ProjectCode) {
        this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
      } else {
        await this.getCurrentTaskProjectInformation(task.ProjectCode);
        this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
      }
      this.loadDraftDocs(this.selectedTab);
    }
  }

  // **************************************************************************************************************************************
  //  Get  current project information
  // **************************************************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    const project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    const arrResult = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, project);
    this.sharedObject.DashboardData.ProjectInformation = arrResult.length ? arrResult[0] : {};
    // const projectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', project);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
  }

  // **************************************************************************************************************************************
  //  Get  draft documents
  // **************************************************************************************************************************************

  async loadDraftDocs(selectedTab) {


    this.DocumentArray = [];

    let documentsUrl = '';

    if (selectedTab === 'Source Docs') {
      documentsUrl = '/Source Documents';
    } else if (selectedTab === 'References') {
      documentsUrl = '/References';
    } else if (selectedTab === 'Meeting Notes & Client Comments') {
      documentsUrl = '/Communications';
    } else if (selectedTab === 'Emails') {
      documentsUrl = '/Emails';
    } else {
      documentsUrl = '/Drafts/Internal/' + this.selectedTask.Milestone;
    }

    let completeFolderRelativeUrl = '';
    const folderUrl = this.ProjectInformation.ProjectFolder;
    completeFolderRelativeUrl = folderUrl + documentsUrl;
    this.response = await this.spServices.readFiles(completeFolderRelativeUrl);
    // const Url = this.sharedObject.sharePointPageObject.serverRelativeUrl +
    //   // tslint:disable-next-line: quotemark
    //   "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl + "')/Files?$expand=ListItemAllFields";

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, Url);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.allDocuments = this.response.length ? this.response : [];

    if (this.selectedTab === 'My Drafts') {
      this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === this.selectedTask.Title);
    } else if (this.selectedTab === this.prevTask) {
      const previouTasks = this.selectedTask.PrevTasks.indexOf(';#') > -1 ?
        this.selectedTask.PrevTasks.split(';#') : [this.selectedTask.PrevTasks];
      this.DocumentArray = this.allDocuments.filter(c => (previouTasks.indexOf(c.ListItemAllFields.TaskName) > -1));
    } else {
      if (this.allDocuments) {
        this.DocumentArray = this.allDocuments;
      } else {
        this.DocumentArray = [];
      }

    }


    const Ids = this.DocumentArray.map(c => c.DocIds = c.ListItemAllFields.EditorId).filter((el, i, a) => i === a.indexOf(el));

    let users;
    if (Ids.length > 0) {
      users = await this.getUsers(Ids);
    }


    this.loaderenable = false;
    this.DocumentArray.map(c => c.taskName = c.ListItemAllFields.TaskName != null ? c.ListItemAllFields.TaskName : '');
    this.DocumentArray.map(c => c.modifiedUserName = users.find(d => d.Id ===
      c.ListItemAllFields.EditorId) !== undefined ? users.find(d => d.Id === c.ListItemAllFields.EditorId).Title : '');
    this.DocumentArray.map(c => c.status = c.ListItemAllFields.Status !== null ? c.ListItemAllFields.Status : '');
    this.DocumentArray.map(c => c.isFileMarkedAsFinal = c.status.split(' ').splice(-1)[0] === 'Complete' ? true : false);
    this.DocumentArray.map(c => c.ModifiedDateString = this.datePipe.transform(c.ListItemAllFields.Modified, 'MMM d, y, h:mm a'));

    if (this.DocumentArray.length) {

      if (this.selectedTab === this.prevTask) {
        this.DocumentArray = this.DocumentArray.filter(c => c.isFileMarkedAsFinal === true);
      }

      this.DocumentArray = this.DocumentArray.sort((a, b) =>
        new Date(a.ModifiedDateString).getTime() < new Date(b.ModifiedDateString).getTime() ? 1 : -1
      );
    }
    this.selectedDocuments = [];
  }

  // **************************************************************************************************************************************
  //  fetch  user data for Document
  // **************************************************************************************************************************************

  async getUsers(Ids) {

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    const batchUrl = [];
    Ids.forEach(element => {
      const userObj = Object.assign({}, this.queryConfig);
      userObj.url = this.spServices.getUserURL(element);
      batchUrl.push(userObj);
      // const url = this.sharedObject.sharePointPageObject.serverRelativeUrl + '/_api/Web/GetUserById(' + element + ')';
      // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, url);
    });
    this.response = await this.spServices.executeBatch(batchUrl);
    this.response = this.response.length ? this.response.map(a => a.retItems) : [];
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    return this.response;
  }


  // *************************************************************************************************
  //  Mark as final
  // *************************************************************************************************

  async markAsFinal() {

    if (this.selectedDocuments.length > 0) {

      let bSelectedNewFiles = false;
      const objPost = {
        __metadata: { type: 'SP.ListItem' },
        Status: this.selectedTask.Task + ' Complete'
      };
      // const batchGuid = this.spServices.generateUUID();
      // const batchContents = new Array();
      // const changeSetId = this.spServices.generateUUID();
      const batchUrl = [];
      // var arrDocNames = this.selectedDocuments.map(c=> c = c.fileUrl.split('/')[7]);
      this.selectedDocuments.forEach(async element => {
        if (element.status.indexOf('Complete') === -1) {
          this.loaderenable = true;
          bSelectedNewFiles = true;
          const listName = element.ServerRelativeUrl.split('/')[3];
          // const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl +
          //   // tslint:disable-next-line: quotemark
          //   "/_api/web/lists/getbytitle('" + listName + "')/items(" + +(element.ListItemAllFields.ID) +
          //   // tslint:disable-next-line: quotemark
          //   ")";
          // var test = await  this.updateDocumentProperties(true,element);
          const updateObj = Object.assign({}, this.queryConfig);
          updateObj.url = this.spServices.getItemURL(listName, +element.ListItemAllFields.ID);
          updateObj.data = objPost;
          updateObj.listName = listName;
          updateObj.type = 'PATCH';
          batchUrl.push(updateObj);
          // await this.spServices.updateItem(listName, +element.ListItemAllFields.ID, objPost);
          // this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(objPost), false);
        }
      });
      if (bSelectedNewFiles) {

        const jsonData = {
          __metadata: { type: 'SP.Data.SchedulesListItem' },
          FinalDocSubmit: true
        };
        const taskObj = Object.assign({}, this.queryConfig);
        taskObj.url = this.spServices.getItemURL(this.constants.listNames.Schedules.name, +this.selectedTask.ID);
        taskObj.data = jsonData;
        taskObj.listName = this.constants.listNames.Schedules.name;
        taskObj.type = 'PATCH';
        batchUrl.push(taskObj);

        // const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl +
        //   // tslint:disable-next-line: quotemark
        //   "/_api/web/lists/getbytitle('" + this.constants.listNames.Schedules.name +
        //   // tslint:disable-next-line: quotemark
        //   "')/items(" + (this.selectedTask.ID) + ')';
        // this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(jsonData), false);
        this.selectedTask.FinalDocSubmit = true;
        // batchContents.push('--changeset_' + changeSetId + '--');
        // const batchBody = batchContents.join('\r\n');
        // const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
        // batchBodyContent.push('--batch_' + batchGuid + '--');
        // const batchBodyContents = batchBodyContent.join('\r\n');

        // const response = this.spServices.executeBatchPostRequestByRestAPI(batchGuid, batchBodyContents);
        const response = await this.spServices.executeBatch(batchUrl);
        this.selectedDocuments = [];
        if (this.enableNotification) {
          this.SendEmailNotification(this.selectedTask);
        }
        this.loadDraftDocs(this.selectedTab);

      }
      if (!bSelectedNewFiles) {
        if (this.selectedDocuments.length > 1) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'All the selected files are already marked as final.'
          });
        } else {

          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Selected file already marked as final.'
          });
        }
        return false;
      }

    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 });
    }
  }

  // **************************************************************************************************
  //   Download Files
  // **************************************************************************************************

  downloadFile() {
    if (this.selectedDocuments.length > 0) {
      if (this.selectedTask.DisplayTitle) {
        this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTask.DisplayTitle);
      } else if (this.selectedTask.ProjectName) {
        this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl),
          this.selectedTask.ProjectName + ' ' + this.selectedTask.Milestone + ' ' + this.selectedTask.Task);
      } else {
        const downloadName = this.selectedTask.WBJID ? this.selectedTask.ProjectCode + ' (' +
          this.selectedTask.WBJID + ' )' : this.selectedTask.ProjectCode;
        this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), downloadName);
      }

    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 });
    }
  }

  // **************************************************************************************************************************************
  //   upload documents
  // **************************************************************************************************************************************
  async uploadDocuments(event, type) {

    if (event.files.length) {
      let docFolder;
      const existingFiles = this.allDocuments.map(c => c.Name.toLowerCase());
      switch (type) {
        case 'Source Docs':
          docFolder = 'Source Documents';
          //  sVal = 'source documents';
          break;
        case 'References':
          docFolder = 'References';
          //  sVal = 'references';
          break;
        case 'meetingNotes':
          docFolder = 'Communications';
          // sVal = 'meeting notes';
          break;
        case 'Meeting Notes & Client Comments':
          docFolder = 'Communications';
          // sVal = 'meeting notes & comments';
          break;
        default:
          docFolder = 'Drafts/Internal/' + this.selectedTask.Milestone;
          //  sVal = 'current task documents';
          break;
      }
      const uploadedFiles = [];
      const readers = [];
      let bUpload = true;
      event.files.forEach(async element => {

        let filename = element.name;
        const sNewFileName = filename.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
        if (filename !== sNewFileName) {
          bUpload = false;
          return;
        }
        if (existingFiles.includes(element.name.toLowerCase())) {
          filename = filename.split(/\.(?=[^\.]+$)/)[0] + '.' + this.datePipe.transform(new Date(),
            'ddMMyyyyhhmmss') + '.' + filename.split(/\.(?=[^\.]+$)/)[1];
        }


        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(element);
        const fileObj = {
          reader: fileReader,
          name: filename
        };

        readers.push(fileObj);

        existingFiles.push(filename.toLowerCase());
      });
      if (bUpload) {
        this.messageService.add({ key: 'custom', severity: 'info', summary: 'Info Message', detail: 'Uploading....' });
        this.loaderenable = true;
        readers.forEach(async element => {
          const fileObj = element;
          fileObj.reader.onload = async (readerEvt) => {

            const filePathUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl +
              // tslint:disable-next-line: quotemark
              "/_api/web/GetFolderByServerRelativeUrl('" + this.ProjectInformation.ProjectFolder + "/"
              // tslint:disable-next-line: quotemark
              + docFolder + "')/Files/add(url=@TargetFileName,overwrite='false')?" +
              // tslint:disable-next-line: quotemark
              "&@TargetFileName='" + fileObj.name + "'&$expand=ListItemAllFields";

            const res = await this.spOperations.uploadFile(filePathUrl, fileObj.reader.result);
            uploadedFiles.push(res);
            if (readers.length === uploadedFiles.length) {
              if (this.selectedTab === 'My Drafts') {
                this.LinkDocumentToProject(uploadedFiles);
              } else {
                this.loadDraftDocs(this.selectedTab);
                this.messageService.add({
                  key: 'custom', severity: 'success',
                  summary: 'Success Message', detail: 'Document updated successfully.'
                });
              }
            }
          };
        });
      } else {
        this.messageService.add({
          key: 'custom', severity: 'error', summary: 'Error Message', sticky: true,
          // tslint:disable-next-line: max-line-length
          detail: 'There are certain files with special characters. Please rename them. List of special characters ~ # % & * { } \ : / + < > ? " @ \''
        });
      }
    }
  }

  // ************************************************************************************************
  //   link uploaded documents to projects
  // ************************************************************************************************

  async LinkDocumentToProject(uploadedFiles) {
    const objPost = {
      __metadata: { type: 'SP.ListItem' },
      Status: '-',
      TaskName: this.selectedTask.Title
    };
    // const batchGuid = this.spServices.generateUUID();
    // const batchContents = new Array();
    // const changeSetId = this.spServices.generateUUID();
    const batchUrl = [];
    uploadedFiles.forEach(async element => {
      const listName = element.ServerRelativeUrl.split('/')[3];
      const taskObj = Object.assign({}, this.queryConfig);
      taskObj.url = this.spServices.getItemURL(listName, +element.ListItemAllFields.ID);
      taskObj.data = objPost;
      taskObj.listName = listName;
      taskObj.type = 'PATCH';
      batchUrl.push(taskObj);
      // const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl +
      //   // tslint:disable-next-line: quotemark
      //   "/_api/web/lists/getbytitle('" + listName + "')/items(" + +(element.ListItemAllFields.ID) + ")";
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(objPost), false);
    });
    // batchContents.push('--changeset_' + changeSetId + '--');
    // const batchBody = batchContents.join('\r\n');
    // const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
    // batchBodyContent.push('--batch_' + batchGuid + '--');
    // const batchBodyContents = batchBodyContent.join('\r\n');
    // const response = this.spServices.executeBatchPostRequestByRestAPI(batchGuid, batchBodyContents);
    // const responseInLines = response.split('\n');
    await this.spServices.executeBatch(batchUrl);
    this.loadDraftDocs(this.selectedTab);
    this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Document updated successfully.' });
  }



  SendEmailNotification(task) {

    const mailSubject = 'New File Uploaded.';

    // ClosedTaskNotification

    task.nextTasks.forEach(nextTask => {
      const ArrayTo = [];
      const objEmailBody = [];
      objEmailBody.push({
        'key': '@@Val1@@', //  Next  Task Assign To
        'value': nextTask.AssignedTo ? nextTask.AssignedTo.Title : ''
      });
      objEmailBody.push({
        'key': '@@Val2@@', // Current Task Name
        'value': task.Title
      });
      objEmailBody.push({
        'key': '@@Val21@@', // Current Task Assign To
        'value': task.AssignedTo ? task.AssignedTo.Title : ''
      });
      objEmailBody.push({
        'key': '@@Val3@@', // Next Task Name
        'value': nextTask.Title
      });
      objEmailBody.push({
        'key': '@@Val31@@', //  Next  Task Assign To
        'value': nextTask.AssignedTo ? nextTask.AssignedTo.Title : ''
      });

      let mailBody = this.Emailtemplate;

      for (const data of objEmailBody) {
        mailBody = mailBody.replace(RegExp(data.key, 'gi'), data.value);
      }

      // Send  email
      this.spServices.sendMail(nextTask.AssignedTo.EMail, task.AssignedTo.EMail, mailSubject, mailBody, task.AssignedTo.EMail);

    });

  }

  async getEmailTemplate() {

    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const mailQueryOptions = {
      select: 'Content',
      // tslint:disable-next-line: quotemark
      filter: "Title eq 'ClosedTaskNotification'",

    };
    const mailTemplateGet = Object.assign({}, options);
    mailTemplateGet.url = this.spServices.getReadURL('' + this.constants.listNames.MailContent.name + '', mailQueryOptions);
    mailTemplateGet.type = 'GET';
    mailTemplateGet.listName = this.constants.listNames.MailContent.name;
    batchURL.push(mailTemplateGet);

    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults[0].retItems) {
      this.Emailtemplate = arrResults[0].retItems[0].Content;
    }
  }
}
