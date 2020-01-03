import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from 'src/app/my-dashboard/services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-task-details-dialog',
  templateUrl: './task-details-dialog.component.html',
  styleUrls: ['./task-details-dialog.component.css']
})
export class TaskDetailsDialogComponent implements OnInit {
  modalloaderenable = true;
  batchContents: any[];
  response: any[];
  currentTask: any;
  data: any;

  allDocuments: any;
  DocumentArray: any = [];
  loaderenable: boolean;
  dbcols: { field: string; header: string; }[];
  cols: { field: string; header: string; }[];
  selectedDocuments: any = [];
  uploadedFiles: any[] = [];
  fileReader = new FileReader();
  ProjectInformation: {
    ID: any; Id: any; IsPubSupport: string; Milestone: any; Milestones: any;
    ProjectCode: any; ProjectFolder: any; Title: any; WBJID: any;
  };
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    private datePipe: DatePipe,
    public sharedObject: GlobalService,
    public messageService: MessageService,
    public commonService: CommonService
  ) { }

  ngOnInit() {

    this.dbcols = [
      { field: 'Name', header: 'Document Name' },
      { field: 'status', header: 'Status' },
      { field: 'modifiedUserName', header: 'Uploaded By' },
      { field: 'ModifiedDateString', header: 'Uploaded Date' },
    ];
    this.data = this.config.data;
    this.DocumentArray = [];

    if (this.data !== undefined) {
      this.getComments(this.data.task.pID);
    }
  }
  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy(): void {
  }
  // **************************************************************************************************
  //  Get Comment on load
  // **************************************************************************************************
  async getComments(taskId) {

    this.commonService.SetNewrelic('TaskAllocation', 'task-detailsDialog', 'getCommentByTaskId');
    const response = await this.spServices.readItem(this.constants.listNames.Schedules.name, taskId);
    // const CommentUrl = this.spServices.getReadURL('' + this.constants.listNames.Schedules.name + '', Comment);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, CommentUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.currentTask = response;
    this.getDocuments(this.currentTask);
  }

  // *************************************************************************************************
  //  Get Documents On tab switch
  // **************************************************************************************************
  async getDocuments(task) {


    if (this.sharedObject.DashboardData.ProjectInformation.ProjectCode === task.ProjectCode) {
      this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
    } else {
      await this.getCurrentTaskProjectInformation(task.ProjectCode);
      this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
    }
    this.loadDraftDocs(this.currentTask.Milestone);
  }

  // **************************************************************************************************
  //  Get  current project information
  // *************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();
    const project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    this.commonService.SetNewrelic('TaskAllocation', 'task-detailsDialog', 'GetProjInfoByProjCode');
    const response = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, project);
    // const projectUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', project);
    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectUrl);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    this.sharedObject.DashboardData.ProjectInformation = response.length ? response[0] : [];
  }

  // **************************************************************************************************
  //  Get  draft documents
  // **************************************************************************************************

  async loadDraftDocs(selectedTab) {

    this.DocumentArray = [];
    let documentsUrl = '';


    documentsUrl = '/Drafts/Internal/' + selectedTab;
    let completeFolderRelativeUrl = '';
    const folderUrl = this.ProjectInformation.ProjectFolder;
    completeFolderRelativeUrl = folderUrl + documentsUrl;
    // const Url = this.sharedObject.sharePointPageObject.serverRelativeUrl +
    //   // tslint:disable-next-line: quotemark
    //   "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl
    //   // tslint:disable-next-line: quotemark
    //   + "')/Files?$expand=ListItemAllFields";

    // this.batchContents = new Array();
    // const batchGuid = this.spServices.generateUUID();

    // this.spServices.getBatchBodyGet(this.batchContents, batchGuid, Url);
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    // this.allDocuments = this.response[0];
    this.commonService.SetNewrelic('TaskAllocation', 'task-detailsDialog', 'GetDocumentsByType');
    const arrResult = await this.spServices.readFiles(completeFolderRelativeUrl);
    this.response = arrResult.length ? arrResult : [];
    this.allDocuments = this.response;
    this.DocumentArray = this.allDocuments.filter(c => c.ListItemAllFields.TaskName === this.currentTask.Title);

    const Ids = this.DocumentArray.map(c => c.DocIds = c.ListItemAllFields.EditorId).filter((el, i, a) => i === a.indexOf(el));
    let users;
    if (Ids.length > 0) {
      users = await this.getUsers(Ids);
    }
    this.modalloaderenable = false;


    this.DocumentArray.map(c => c.modifiedUserName =
      users.find(d => d.Id === c.ListItemAllFields.EditorId) !== undefined ?
        users.find(d => d.Id === c.ListItemAllFields.EditorId).Title : '');
    this.DocumentArray.map(c => c.status = c.ListItemAllFields.Status !== null ? c.ListItemAllFields.Status : '');
    // this.DocumentArray.map(c => c.isFileMarkedAsFinal = c.status.split(" ").splice(-1)[0] === "Complete" ? true : false);
    this.DocumentArray.map(c => c.ModifiedDateString = this.datePipe.transform(c.ListItemAllFields.Modified, 'MMM d, y, h:mm a'));

    if (this.DocumentArray.length) {

      this.DocumentArray = this.DocumentArray.sort((a, b) =>

        new Date(a.ModifiedDateString).getTime() < new Date(b.ModifiedDateString).getTime() ? 1 : -1
      );
    }
    this.selectedDocuments = [];
  }

  // **************************************************************************************************
  //  fetch  user data for Document
  // **************************************************************************************************

  // async getUsers(Ids) {
  //   this.batchContents = new Array();
  //   const batchGuid = this.spServices.generateUUID();
  //   Ids.forEach(element => {
  //     const url = this.sharedObject.sharePointPageObject.serverRelativeUrl +
  //       '/_api/Web/GetUserById(' + element + ')';
  //     this.spServices.getBatchBodyGet(this.batchContents, batchGuid, url);
  //   });
  //   this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
  //   return this.response;
  // }
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

    this.commonService.SetNewrelic('TaskAllocation', 'task-detailsDialog', 'GetUsrsbyIds');
    this.response = await this.spServices.executeBatch(batchUrl);
    this.response = this.response.length ? this.response.map(a => a.retItems) : [];
    // this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);
    return this.response;
  }
  // **************************************************************************************************
  //   Download Files
  // **************************************************************************************************

  downloadFile() {
    if (this.selectedDocuments.length > 0) {
      this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.currentTask.Title);
    } else {
      this.messageService.add({
        key: 'task-details', severity: 'warn', summary: 'Warning Message',
        detail: 'Please Select Files.', life: 4000
      });
    }
  }
}
