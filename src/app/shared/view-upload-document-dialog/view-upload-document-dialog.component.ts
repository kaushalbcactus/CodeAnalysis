import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { MenuItem, DynamicDialogConfig, MessageService, DynamicDialogRef, ConfirmationService, DialogService } from 'primeng';
import { DatePipe, CommonModule } from '@angular/common';
import { ConstantsService } from 'src/app/Services/constants.service';

import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { MyDashboardConstantsService } from 'src/app/my-dashboard/services/my-dashboard-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { FileUploadProgressDialogComponent } from '../file-upload-progress-dialog/file-upload-progress-dialog.component';



@Component({
  selector: 'app-view-upload-document-dialog',
  templateUrl: './view-upload-document-dialog.component.html',
  styleUrls: ['./view-upload-document-dialog.component.css'],
  providers: [DialogService],
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
  ModifiedSelectedTaskName = '';
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
  events: any;
  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    public dialogService: DialogService,
    private spOperations: SPOperationService,
    private commonService: CommonService) { }

  items: MenuItem[];
  activeItem: MenuItem;
  async ngOnInit() {

    this.loaderenable = true;
    this.DocumentArray = [];
    this.data = Object.keys(this.config.data ? this.config.data : this.config).length ? this.config.data : this.taskData;
    this.status = this.data.Status;
    this.enableNotification = this.data.emailNotificationEnable ? this.data.emailNotificationEnable : false;
    if (this.enableNotification) {
      this.getEmailTemplate();
    }
    this.selectedTask = this.config.data ? this.data.task ? this.data.task : this.data : this.taskData;
    // if (this.selectedTask.ParentSlot) {
    const slotPNTask = await this.myDashboardConstantsService.getNextPreviousTask(this.selectedTask);
    const slotPTasks = slotPNTask.filter(ele => ele.TaskType === 'Previous Task');
    this.selectedTask.PrevTasks = '';
    slotPTasks.forEach((element, i) => {
      this.selectedTask.PrevTasks += element.Title;
      this.selectedTask.PrevTasks += i < slotPTasks.length - 1 ? ';#' : '';


    });
    // }
    this.ModifiedSelectedTaskName = this.selectedTask.Title.replace(this.selectedTask.ProjectCode, '').replace(this.selectedTask.Milestone, '').trim();

    this.selectedTask.Task = this.ModifiedSelectedTaskName === 'Client Review' ? 'Client Review' : this.selectedTask.Task

    if (this.selectedTask.PrevTasks) {
      this.items = [
        { label: 'For ' + this.selectedTask.Task, icon: 'fa fa-tasks', command: (e) => this.onChange(e) },
        { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) },
        { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
        { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
        { label: 'Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
        { label: 'Meeting Notes', icon: 'fa fa-file-text-o', command: (e) => this.onChange(e) },
        { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
      this.activeItem = this.items[1];
      this.prevTask = this.items[0].label;
      this.selectedTab = 'My Drafts';
    } else {
      if (this.selectedTask.IsSearchProject) {
        this.items = [
          { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
          { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
          // { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
          { label: 'Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
          { label: 'Meeting Notes', icon: 'fa fa-file-text-o', command: (e) => this.onChange(e) },
          { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
        this.activeItem = this.items[0];
        this.selectedTab = 'Source Docs';
      } else {
        if (this.ModifiedSelectedTaskName === 'Client Review') {
          this.items = [
            { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) }];
        }
        else {
          this.items = [
            { label: 'My Drafts', icon: 'fa fa-envelope-open', command: (e) => this.onChange(e) },
            { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
            { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
            { label: 'Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
            { label: 'Meeting Notes', icon: 'fa fa-file-text-o', command: (e) => this.onChange(e) },
            { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
        }
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


  // *****************************************************************************************************
  //  Switch tab on click
  // *****************************************************************************************************

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



  // ****************************************************************************************************
  //  Get Documents On tab switch
  // ****************************************************************************************************
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

  // ***************************************************************************************************
  //  Get  current project information
  // ***************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {

    const project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'getProjInfobyProjectCode');
    const arrResult = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, project);
    this.sharedObject.DashboardData.ProjectInformation = arrResult.length ? arrResult[0] : {};

  }

  // **************************************************************************************************************************************
  //  Get  draft documents
  // **************************************************************************************************************************************

  async loadDraftDocs(selectedTab) {


    this.DocumentArray = [];
    let completedCRList = []
    let documentsUrl = '';

    // if (selectedTab === 'Source Docs') {
    //   documentsUrl = '/Source Documents';
    // } else if (selectedTab === 'References') {
    //   documentsUrl = '/References';
    // } else if (selectedTab === 'Meeting Notes') {
    //   documentsUrl = '/Communications';
    // } else if (selectedTab === 'Emails') {
    //   documentsUrl = '/Emails';
    // } else {
    //   documentsUrl = '/Drafts/Internal/' + this.selectedTask.Milestone;
    // }

    switch (selectedTab) {
      case 'Source Docs':
        documentsUrl = '/Source Documents';
        break;
      case 'References':
        documentsUrl = '/References';
        break;
      case 'Meeting Notes':
        documentsUrl = '/Communications';
        break;
      case 'Emails':
        documentsUrl = '/Emails';
        break;
      default:
        documentsUrl = '/Drafts/Internal/' + this.selectedTask.Milestone;
    }
    const folderUrl = this.ProjectInformation.ProjectFolder;
    let completeFolderRelativeUrl = '';
    if (selectedTab === 'Client Comments') {


      const schedulesInfo = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ClientReviewSchedules);
      schedulesInfo.filter = schedulesInfo.filter
        .replace(/{{projectCode}}/gi, this.selectedTask.ProjectCode);
      this.commonService.SetNewrelic('Shared', 'view-uploadDocumentDialog', 'GetCRDocuments');
      const results = await this.spServices.readItems(this.constants.listNames.Schedules.name, schedulesInfo);
      debugger;


      // const scheduleGet = Object.assign({}, options);
      // const scheduleFilter = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.ClientReviewSchedules);
      // scheduleFilter.filter = scheduleFilter.filter
      //   .replace(/{{projectCode}}/gi, this.selectedTask.ProjectCode);
      // scheduleGet.url = this.spServices.getReadURL(this.constants.listNames.Schedules.name,
      //   scheduleFilter);
      // scheduleGet.type = 'GET';
      // scheduleGet.listName = this.constants.listNames.Schedules.name;
      // batchURL.push(scheduleGet);
      // const completedCRArray = await this.spServices.executeBatch(batchURL);

      if (results) {
        completedCRList = results.length > 0 ? results : [];
        const dbMilestones = this.ProjectInformation.Milestones.split(';#');
        const Milestones = completedCRList.filter(c => dbMilestones.includes(c.Milestone)) ? completedCRList.filter(c => dbMilestones.includes(c.Milestone)).map(c => c.Milestone) : [];

        if (Milestones) {
          const options = {
            data: null,
            url: '',
            type: '',
            listName: ''
          };
          let batchURL = [];

          Milestones.forEach(element => {
            documentsUrl = '/Drafts/Internal/' + element;
            completeFolderRelativeUrl = folderUrl + documentsUrl;
            const documentGet = Object.assign({}, options);
            documentGet.url = this.spServices.getFilesFromFoldersURL(completeFolderRelativeUrl);
            documentGet.type = 'GET';
            documentGet.listName = 'TaskDocuments'
            batchURL.push(documentGet);
          });

          const FolderDocuments = await this.spServices.executeBatch(batchURL);

          if (FolderDocuments) {
            this.allDocuments = [].concat(...FolderDocuments.map(c => c.retItems));
          }
        }
      }
    }
    else {
      completeFolderRelativeUrl = folderUrl + documentsUrl;
      this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'getDocumentsByTabType');
      this.response = await this.spServices.readFiles(completeFolderRelativeUrl);
      this.allDocuments = this.response.length ? this.response : [];
    }



    if (this.selectedTab === 'My Drafts') {
      this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === this.selectedTask.Title);
    } else if (this.selectedTab === 'Client Comments' && completedCRList) {
      const CRTaskTitles = completedCRList.map(c => c.Title);
      this.DocumentArray = this.allDocuments.filter(c => CRTaskTitles.includes(c.ListItemAllFields.TaskName));
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
      userObj.type = 'GET';
      batchUrl.push(userObj);
      // const url = this.sharedObject.sharePointPageObject.serverRelativeUrl + '/_api/Web/GetUserById(' + element + ')';
      // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, url);
    });
    this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'getUsersById');
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
      const batchUrl = [];
      this.selectedDocuments.forEach(async element => {
        if (element.status.indexOf('Complete') === -1) {
          this.loaderenable = true;
          bSelectedNewFiles = true;
          const listName = element.ServerRelativeUrl.split('/')[3];
          const updateObj = Object.assign({}, this.queryConfig);
          updateObj.url = this.spServices.getItemURL(listName, +element.ListItemAllFields.ID);
          updateObj.data = objPost;
          updateObj.listName = listName;
          updateObj.type = 'PATCH';
          batchUrl.push(updateObj);
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
        this.selectedTask.FinalDocSubmit = true;
        this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'UpdateSchedules');
        const response = await this.spServices.executeBatch(batchUrl);
        this.selectedDocuments = [];
        if (this.enableNotification) {
          await this.SendEmailNotification(this.selectedTask);
        }
        if (this.ModifiedSelectedTaskName === 'Client Review' && this.selectedTab === 'My Drafts') {
          this.ref.close(true);
        }
        else {
          this.loadDraftDocs(this.selectedTab);
        }


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
        this.commonService.SetNewrelic('Shared', 'downloadFile-DisplayTitle', 'createZip');
        this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTask.DisplayTitle);
      } else if (this.selectedTask.ProjectName) {
        this.commonService.SetNewrelic('Shared', 'downloadFile-ProjectName', 'createZip');
        this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl),
          this.selectedTask.ProjectName + ' ' + this.selectedTask.Milestone + ' ' + this.selectedTask.Task);
      } else {
        const downloadName = this.selectedTask.WBJID ? this.selectedTask.ProjectCode + ' (' +
          this.selectedTask.WBJID + ' )' : this.selectedTask.ProjectCode;
        this.commonService.SetNewrelic('Shared', 'downloadFile', 'createZip');
        this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), downloadName);
      }

    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 });
    }
  }

  // **************************************************************************************************************************************
  //   upload documents
  // **************************************************************************************************************************************




  uploadDocs(event, type) {
    if (this.ModifiedSelectedTaskName === 'Client Review' && this.selectedTab === 'My Drafts') {
      const confirmref = this.dialogService.open(ConfirmationDialogComponent, {
        header: 'Confirmation',
        data: 'Are you sure that you want to close current task with selected documents?',
        closable: false
      });
      confirmref.onClose.subscribe((Confirmation: any) => {
        if (Confirmation) {
          this.uploadDocuments(event, type);
        }
      });
    }
    else {
      this.uploadDocuments(event, type);
    }
  }


  // async uploadDocuments(event, type) {

  //   if (event.files.length) {
  //     let docFolder;
  //     const existingFiles = this.allDocuments.map(c => c.Name.toLowerCase());
  //     switch (type) {
  //       case 'Source Docs':
  //         docFolder = 'Source Documents';
  //         //  sVal = 'source documents';
  //         break;
  //       case 'References':
  //         docFolder = 'References';
  //         //  sVal = 'references';
  //         break;
  //       case 'meetingNotes':
  //         docFolder = 'Communications';
  //         // sVal = 'meeting notes';
  //         break;
  //       case 'Meeting Notes':
  //         docFolder = 'Communications';
  //         // sVal = 'meeting notes & comments';
  //         break;
  //       default:
  //         docFolder = 'Drafts/Internal/' + this.selectedTask.Milestone;
  //         //  sVal = 'current task documents';
  //         break;
  //     }
  //     const readers = [];
  //     let bUpload = true;
  //     event.files.forEach(async element => {

  //       let file = element;
  //       let filename = element.name;
  //       const sNewFileName = filename.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
  //       if (filename !== sNewFileName) {
  //         bUpload = false;
  //         return;
  //       }
  //       if (existingFiles.includes(element.name.toLowerCase())) {
  //         filename = filename.split(/\.(?=[^\.]+$)/)[0] + '.' + this.datePipe.transform(new Date(),
  //           'ddMMyyyyhhmmss') + '.' + filename.split(/\.(?=[^\.]+$)/)[1];
  //       }
  //       const fileObj = {
  //         file: file,
  //         name: filename
  //       };

  //       readers.push(fileObj);
  //       existingFiles.push(filename.toLowerCase());
  //     });
  //     if (bUpload) {
  //       const ref = this.dialogService.open(FileUploadProgressDialogComponent, {
  //         header: 'File Uploading',
  //         width: '70vw',
  //         data: {
  //           Files: readers,
  //           libraryName: this.ProjectInformation.ProjectFolder + "/" +  docFolder,
  //           overwrite: false,
  //         },
  //         contentStyle: { 'max-height': '82vh', 'overflow-y': 'auto', 'background-color': '#f4f3ef' },
  //         closable: false,
  //       });

  //       return ref.onClose.subscribe(async (uploadedfiles: any) => {
  //         if (uploadedfiles) {
  //           if (event.files.length > 0 && event.files.length === uploadedfiles.length) {
  //             this.loaderenable = true;
  //             if (this.selectedTab === 'My Drafts') {
  //               this.LinkDocumentToProject(uploadedfiles);
  //             } else {
  //               this.loadDraftDocs(this.selectedTab);
  //               this.messageService.add({
  //                 key: 'custom', severity: 'success',
  //                 summary: 'Success Message', detail: 'Document updated successfully.'
  //               });
  //             }
  //           }
  //         }
  //       });
  //     } else {
  //       this.messageService.add({
  //         key: 'custom', severity: 'error', summary: 'Error Message', sticky: true,
  //         // tslint:disable-next-line: max-line-length
  //         detail: 'There are certain files with special characters. Please rename them. List of special characters ~ # % & * { } \ : / + < > ? " @ \''
  //       });
  //     }
  //   }
  // }

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

            this.commonService.SetNewrelic('Shared', 'viewUpladDocDialog', 'uploadDocuments');
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
    const batchUrl = [];
    uploadedFiles.forEach(async element => {
      const listName = element.ServerRelativeUrl.split('/')[3];
      const taskObj = Object.assign({}, this.queryConfig);
      taskObj.url = this.spServices.getItemURL(listName, +element.ListItemAllFields.ID);
      taskObj.data = objPost;
      taskObj.listName = listName;
      taskObj.type = 'PATCH';
      batchUrl.push(taskObj);

    });
    this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'linkDocToProject');
    await this.spServices.executeBatch(batchUrl);

    if (this.ModifiedSelectedTaskName === 'Client Review' && this.selectedTab === 'My Drafts') {
      this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Documents uploaded successfully.' });
      this.selectedDocuments = uploadedFiles;
      this.selectedDocuments.map(c => c.status = '-');
      this.markAsFinal();
    }
    else {
      this.loadDraftDocs(this.selectedTab);
      this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Document updated successfully.' });
    }

  }



  SendEmailNotification(task) {

    const mailSubject = 'New File Uploaded.';

    // ClosedTaskNotification
    if (task.NextTasks) {
      const nts = task.NextTasks.split(';#');
      nts.forEach(async nextTask => {
        const npInfo = await this.myDashboardConstantsService.getNextPreviousTask(task);
        const iterator = npInfo.find(item => item.Title === nextTask);
        const ArrayTo = [];
        const objEmailBody = [];
        objEmailBody.push({
          key: '@@Val1@@', //  Next  Task Assign To
          value: iterator.AssignedTo ? iterator.AssignedTo.Title : ''
        });
        objEmailBody.push({
          key: '@@Val2@@', // Current Task Name
          value: task.Title
        });
        objEmailBody.push({
          key: '@@Val21@@', // Current Task Assign To
          value: task.AssignedTo ? task.AssignedTo.Title : ''
        });
        objEmailBody.push({
          key: '@@Val3@@', // Next Task Name
          value: iterator.Title
        });
        objEmailBody.push({
          key: '@@Val31@@', //  Next  Task Assign To
          value: iterator.AssignedTo ? iterator.AssignedTo.Title : ''
        });

        let mailBody = this.Emailtemplate;

        for (const data of objEmailBody) {
          mailBody = mailBody.replace(RegExp(data.key, 'gi'), data.value);
        }
        this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'SendMails');
        // Send  email
        this.spServices.sendMail(iterator.AssignedTo.EMail, task.AssignedTo.EMail, mailSubject, mailBody, task.AssignedTo.EMail);

      });
    }

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

    this.commonService.SetNewrelic('Shared', 'viewUpladDoc', 'getEmailTemplate');
    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults[0].retItems) {
      this.Emailtemplate = arrResults[0].retItems[0].Content;
    }
  }
}
