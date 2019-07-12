import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DynamicDialogConfig, MessageService, MenuItem } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../../services/my-dashboard-constants.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { DatePipe } from '@angular/common';
import { NodeService } from 'src/app/node.service';

@Component({
  selector: 'app-project-drafts',
  templateUrl: './project-drafts.component.html',
  styleUrls: ['./project-drafts.component.css']
})
export class ProjectDraftsComponent implements OnInit, OnDestroy {

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

  @Input() milestoneData: any;
  menuItems: any = [];
  constructor(
    public config: DynamicDialogConfig,
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

    debugger;
    this.loaderenable = true;
    this.DocumentArray = [];
    this.data = this.milestoneData;

    console.log("data");
    console.log(this.data);

    if (this.milestoneData.Milestones) {
      this.milestoneData.Milestones.split(';#').filter(c => c !== "").forEach(element => {
        this.menuItems.push({ label: element, icon: 'pi pi-inbox', command: (e) => this.onChange(e) })
      });
      this.items = this.menuItems;
      this.activeItem = this.items[0];
      this.selectedTab = this.items[0].label
      this.getDocuments(this.data);
      // this.loadDraftDocs(this.selectedTab);
      this.loaderenable = true;
    }
    else {
      this.loaderenable = false;
    }


    this.dbcols = [
      { field: 'Name', header: 'Document Name' },
      { field: 'taskName', header: 'Task Name' },
      { field: 'status', header: 'Status' },
      { field: 'modifiedUserName', header: 'Uploaded By' },
      { field: 'ModifiedDateString', header: 'Uploaded Date' },
    ];

  }
  ngOnDestroy(): void {
    // ... some clean up logic

  }

  // **************************************************************************************************************************************
  //  Switch tab on click 
  // **************************************************************************************************************************************

  onChange(event) {

    this.loaderenable = true;
    this.selectedDocuments = [];
    this.DocumentArray = [];
    this.selectedTab = event.item.label;
    this.loadDraftDocs(this.selectedTab);
  }



  // **************************************************************************************************************************************
  //  Get Documents On tab switch
  // **************************************************************************************************************************************
  async getDocuments(projectDetails) {

    if (this.sharedObject.DashboardData.ProjectInformation.ProjectCode === projectDetails.ProjectCode) {
      this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
    }
    else {
      await this.getCurrentTaskProjectInformation(projectDetails.ProjectCode)
      this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
    }

    this.loadDraftDocs(this.selectedTab);
  };

  // **************************************************************************************************************************************
  //  Get  current project information
  // **************************************************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {
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

    this.DocumentArray = [];
    var documentsUrl = '';

    // if (selectedTab === 'Source Docs') {
    //   documentsUrl = "/Source Documents";
    // }
    // else if (selectedTab === 'References') {
    //   documentsUrl = "/References";
    // }
    // else if (selectedTab === 'Meeting Notes & Client Comments') {
    //   documentsUrl = "/Communications";
    // }
    // else if (selectedTab === 'Emails') {
    //   documentsUrl = "/Emails";
    // }
    // else {
    documentsUrl = "/Drafts/Internal/" + selectedTab;
    // }

    var completeFolderRelativeUrl = "";
    var folderUrl = this.ProjectInformation.ProjectFolder;
    completeFolderRelativeUrl = folderUrl + documentsUrl;
    var Url = this.sharedObject.sharePointPageObject.serverRelativeUrl + "/_api/web/getfolderbyserverrelativeurl('" + completeFolderRelativeUrl + "')/Files?$expand=ListItemAllFields";

    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();

    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, Url);
    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.allDocuments = this.response[0];

    this.DocumentArray = this.allDocuments;
    if (this.allDocuments.length > 0) {
      var Ids = this.DocumentArray.map(c => c.DocIds = c.ListItemAllFields.EditorId).filter((el, i, a) => i === a.indexOf(el));

      if (Ids.length > 0)
        var users = await this.getUsers(Ids);
      this.loaderenable = false;
      this.DocumentArray.map(c => c.taskName = c.ListItemAllFields.TaskName != null ? c.ListItemAllFields.TaskName : "");
      this.DocumentArray.map(c => c.modifiedUserName = users.find(d => d.Id === c.ListItemAllFields.EditorId) !== undefined ? users.find(d => d.Id === c.ListItemAllFields.EditorId).Title : '');
      this.DocumentArray.map(c => c.status = c.ListItemAllFields.Status !== null ? c.ListItemAllFields.Status : '');
      this.DocumentArray.map(c => c.isFileMarkedAsFinal = c.status.split(" ").splice(-1)[0] === "Complete" ? true : false);
      this.DocumentArray.map(c => c.ModifiedDateString = this.datePipe.transform(c.ListItemAllFields.Modified, 'MMM d, y, h:mm a'));

      this.DocumentArray = this.DocumentArray.filter(c => c.isFileMarkedAsFinal);

      if (this.DocumentArray.length) {

        this.DocumentArray = this.DocumentArray.sort((a, b) =>

          new Date(a.ModifiedDateString).getTime() < new Date(b.ModifiedDateString).getTime() ? 1 : -1
        );
      }
    }
    else {
      this.loaderenable = false;
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
  //   Download Files 
  // **************************************************************************************************************************************

  downloadFile() {

    if (this.selectedDocuments.length > 0) {

      this.nodeService.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTab);
    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 })
    }
  }


}
