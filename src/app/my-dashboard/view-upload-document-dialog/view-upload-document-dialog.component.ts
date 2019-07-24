import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { MenuItem, DynamicDialogConfig, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { NodeService } from 'src/app/node.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { GlobalService } from 'src/app/Services/global.service';


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
  @Input() taskData: any;
  constructor(public config: DynamicDialogConfig,
    public messageService: MessageService,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SharepointoperationService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private nodeService: NodeService) { }

  items: MenuItem[];
  activeItem: MenuItem;
  ngOnInit() {

    this.loaderenable = true;
    this.DocumentArray = [];
    this.data = this.config.data === undefined ? this.taskData : this.config.data;
    if (this.data !== undefined) {

      this.status = this.data.Status;
      this.selectedTask = this.config.data === undefined ? this.taskData : this.data.task;

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
    }
    else {
      if (this.selectedTask.IsSearchProject) {
        this.items = [
          { label: 'Source Docs', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
          { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
          { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
          { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
        this.activeItem = this.items[0];
        this.selectedTab = 'Source Docs';
      }
      else {
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

  //   
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
      }
      else {
        header.splice(1, 2);
      }


    }
    else {
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
      }
      else {
        await this.getCurrentTaskProjectInformation(task.ProjectCode, true)
        this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
      }

      this.loadDraftDocs(this.selectedTab);
    }

  };

  // **************************************************************************************************************************************
  //  Get  current project information
  // **************************************************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode, isLoadDraftDoc) {
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    let project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    const projectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', project);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectUrl);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.sharedObject.DashboardData.ProjectInformation = this.response[0][0];
  }

  // **************************************************************************************************************************************
  //  Get  draft documents
  // **************************************************************************************************************************************

  async loadDraftDocs(selectedTab) {

    debugger;
    this.DocumentArray = [];

    var documentsUrl = '';

    if (selectedTab === 'Source Docs') {
      documentsUrl = "/Source Documents";
    }
    else if (selectedTab === 'References') {
      documentsUrl = "/References";
    }
    else if (selectedTab === 'Meeting Notes & Client Comments') {
      documentsUrl = "/Communications";
    }
    else if (selectedTab === 'Emails') {
      documentsUrl = "/Emails";
    }
    else {
      documentsUrl = "/Drafts/Internal/" + this.selectedTask.Milestone;
    }

    var completeFolderRelativeUrl = "";
    var folderUrl = this.ProjectInformation.ProjectFolder;
    completeFolderRelativeUrl = folderUrl + documentsUrl;
    var Url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl + "')/Files?$expand=ListItemAllFields";

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, Url);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.allDocuments = this.response[0];

    if (this.selectedTab === 'My Drafts') {
      this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === this.selectedTask.Title);
    }
    else if (this.selectedTab === this.prevTask) {
      var previouTasks = this.selectedTask.PrevTasks.indexOf(";#") > -1 ? this.selectedTask.PrevTasks.split(";#") : this.selectedTask.PrevTasks;
      this.DocumentArray = this.allDocuments.filter(c => previouTasks.includes(c.ListItemAllFields.TaskName));
    }
    else {
      this.DocumentArray = this.allDocuments;
    }


    var Ids = this.DocumentArray.map(c => c.DocIds = c.ListItemAllFields.EditorId).filter((el, i, a) => i === a.indexOf(el));

    if (Ids.length > 0)
      var users = await this.getUsers(Ids);


    this.loaderenable = false;
    this.DocumentArray.map(c => c.taskName = c.ListItemAllFields.TaskName != null ? c.ListItemAllFields.TaskName : "");
    this.DocumentArray.map(c => c.modifiedUserName = users.find(d => d.Id === c.ListItemAllFields.EditorId) !== undefined ? users.find(d => d.Id === c.ListItemAllFields.EditorId).Title : '');
    this.DocumentArray.map(c => c.status = c.ListItemAllFields.Status !== null ? c.ListItemAllFields.Status : '');
    this.DocumentArray.map(c => c.isFileMarkedAsFinal = c.status.split(" ").splice(-1)[0] === "Complete" ? true : false);
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
  };

  // **************************************************************************************************************************************
  //  fetch  user data for Document
  // **************************************************************************************************************************************

  async getUsers(Ids) {

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    Ids.forEach(element => {
      var url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/Web/GetUserById(" + element + ")";
      this.spServices.getBatchBodyGet(this.batchContents, batchGuid, url);
    });

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    return this.response;
  }


  // **************************************************************************************************************************************
  //  Mark as final 
  // **************************************************************************************************************************************

  async markAsFinal() {

    if (this.selectedDocuments.length > 0) {

      var bSelectedNewFiles = false;
      const objPost = {
        __metadata: { type: 'SP.ListItem' },
        Status: this.selectedTask.Task + " Complete"
      }
      const batchGuid = this.spServices.generateUUID();
      const batchContents = new Array();
      const changeSetId = this.spServices.generateUUID();
      // var arrDocNames = this.selectedDocuments.map(c=> c = c.fileUrl.split('/')[7]);
      this.selectedDocuments.forEach(async element => {
        if (element.status.indexOf('Complete') === -1) {
          this.loaderenable = true;
          bSelectedNewFiles = true;
          const listName = element.ServerRelativeUrl.split('/')[3];
          const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + +(element.ListItemAllFields.ID) + ")";
          //var test = await  this.updateDocumentProperties(true,element);
          this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(objPost), false);

        }
      });
      if (bSelectedNewFiles) {

        const jsonData = {
          __metadata: { type: 'SP.Data.SchedulesListItem' },
          FinalDocSubmit: true
        }

        const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + this.constants.listNames.Schedules.name + "')/items(" + +(this.selectedTask.ID) + ")";
        this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(jsonData), false);
        this.selectedTask.FinalDocSubmit = true;
        batchContents.push('--changeset_' + changeSetId + '--');
        const batchBody = batchContents.join('\r\n');
        const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
        batchBodyContent.push('--batch_' + batchGuid + '--');
        const batchBodyContents = batchBodyContent.join('\r\n');

        const response = this.spServices.executeBatchPostRequestByRestAPI(batchGuid, batchBodyContents);
        const responseInLines = response.split('\n');
        this.selectedDocuments = [];
        this.loadDraftDocs(this.selectedTab);

      }
      if (!bSelectedNewFiles) {
        if (this.selectedDocuments.length > 1) {
          this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'All the selected files are already marked as final.' })
        }
        else {

          this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Selected file already marked as final.' })
        }
        return false;
      }

    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 })
    }
  }

  // **************************************************************************************************************************************
  //   Download Files 
  // **************************************************************************************************************************************

  downloadFile() {
    if (this.selectedDocuments.length > 0) {
      if (this.selectedTask.DisplayTitle) {
        this.nodeService.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTask.DisplayTitle);
      }
      else if (this.selectedTask.ProjectName) {
        this.nodeService.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTask.ProjectName + " " + this.selectedTask.Milestone + " " + this.selectedTask.Task);
      }
      else {
        var downloadName = this.selectedTask.WBJID ? this.selectedTask.ProjectCode + " (" + this.selectedTask.WBJID + " )" : this.selectedTask.ProjectCode;
        this.nodeService.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), downloadName);
      }

    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 })
    }
  }

  // **************************************************************************************************************************************
  //   upload documents
  // **************************************************************************************************************************************
  async uploadDocuments(event, type) {

    if (event.files.length) {
      var docFolder;
      this.messageService.add({ key: 'custom', severity: 'info', summary: 'Info Message', detail: 'Uploading....' });

      var existingFiles = this.allDocuments.map(c => c.Name.toLowerCase());
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
      var uploadedFiles = [];
      this.loaderenable = true;
      event.files.forEach(async element => {

        var filename = element.name;
        if (existingFiles.includes(element.name.toLowerCase())) {
          filename = filename.split(/\.(?=[^\.]+$)/)[0] + '.' + this.datePipe.transform(new Date(), "ddMMyyyyhhmmss") + "." + filename.split(/\.(?=[^\.]+$)/)[1];
        }

        this.fileReader = new FileReader();
        this.fileReader.readAsArrayBuffer(element);

        this.fileReader.onload = () => {

          var filePathUrl = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl('" + this.ProjectInformation.ProjectFolder + "/" + docFolder + "')/Files/add(url=@TargetFileName,overwrite='false')?" +
            "&@TargetFileName='" + filename + "'&$expand=ListItemAllFields";

          this.nodeService.uploadFIle(filePathUrl, this.fileReader.result).subscribe(res => {

            uploadedFiles.push(res.d);
            if (event.files.length === uploadedFiles.length) {
              if (this.selectedTab === 'My Drafts') {
                this.LinkDoumentToProject(uploadedFiles);
              }
              else {
                this.loadDraftDocs(this.selectedTab);
                this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Document updated successfully.' });
              }
            }

          });

        };
        existingFiles.push(filename.toLowerCase());
      });
    }

  };


  // **************************************************************************************************************************************
  //   link uploaded documents to projects 
  // **************************************************************************************************************************************

  LinkDoumentToProject(uploadedFiles) {
    const objPost = {
      __metadata: { type: 'SP.ListItem' },
      Status: "-",
      TaskName: this.selectedTask.Title
    }
    const batchGuid = this.spServices.generateUUID();
    const batchContents = new Array();
    const changeSetId = this.spServices.generateUUID();

    uploadedFiles.forEach(async element => {

      const listName = element.ServerRelativeUrl.split('/')[3];
      const endPoint = this.sharedObject.sharePointPageObject.webAbsoluteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + +(element.ListItemAllFields.ID) + ")";
      this.spServices.getChangeSetBodySC(batchContents, changeSetId, endPoint, JSON.stringify(objPost), false);


    });
    batchContents.push('--changeset_' + changeSetId + '--');
    //this.response = await this.spServices.getDataByApi(batchGuid, batchContents);
    const batchBody = batchContents.join('\r\n');
    const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
    batchBodyContent.push('--batch_' + batchGuid + '--');
    const batchBodyContents = batchBodyContent.join('\r\n');
    const response = this.spServices.executeBatchPostRequestByRestAPI(batchGuid, batchBodyContents);
    const responseInLines = response.split('\n');
    this.loadDraftDocs(this.selectedTab);
    this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Document updated successfully.' });
  }

}
