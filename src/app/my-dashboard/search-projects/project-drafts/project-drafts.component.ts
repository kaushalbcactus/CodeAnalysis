import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MyDashboardConstantsService } from '../../services/my-dashboard-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { MenuItem } from 'primeng/api';

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
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  @Input() milestoneData: any;
  menuItems: any = [];
  constructor(
    public config: DynamicDialogConfig,
    private constants: ConstantsService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private spServices: SPOperationService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private commonService: CommonService
    ) { }

  items: MenuItem[];
  activeItem: MenuItem;
  ngOnInit() {


    this.loaderenable = true;
    this.DocumentArray = [];
    this.data = this.milestoneData;
    if (this.milestoneData.Milestones) {
      this.milestoneData.Milestones.split(';#').filter(c => c !== '').forEach(element => {
        this.menuItems.push({ label: element, icon: 'pi pi-inbox', command: (e) => this.onChange(e) });
      });
      this.items = this.menuItems;
      this.activeItem = this.items[0];
      this.selectedTab = this.items[0].label;
      this.getDocuments(this.data);
      // this.loadDraftDocs(this.selectedTab);
      this.loaderenable = true;
    } else {
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

  // **************************************************************************************************
  //  Switch tab on click
  // **************************************************************************************************

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
    } else {
      await this.getCurrentTaskProjectInformation(projectDetails.ProjectCode);
      this.ProjectInformation = this.sharedObject.DashboardData.ProjectInformation;
    }

    this.loadDraftDocs(this.selectedTab);
  }

  // *************************************************************************************************
  //  Get  current project information
  // *************************************************************************************************

  async getCurrentTaskProjectInformation(ProjectCode) {

    const project = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.projectInfo);
    project.filter = project.filter.replace(/{{projectCode}}/gi, ProjectCode);
    this.commonService.SetNewrelic('MyDashboard', 'SearchProjetc-ProjectDraft', 'GetProjectInfoByProjectCode');
    this.response = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, project);
    this.sharedObject.DashboardData.ProjectInformation = this.response.length > 0 ? this.response[0] : {};

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
  
    this.commonService.SetNewrelic('MyDashboard', 'SearchProjetc-ProjectDraft', 'GetDocumentsByTab');
    this.response = await this.spServices.readFiles(completeFolderRelativeUrl);

    this.allDocuments = this.response.length > 0 ? this.response : [];

    if (this.allDocuments.length > 0) {
      this.DocumentArray = this.allDocuments;

      if (this.allDocuments.length > 0) {
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

        this.DocumentArray = this.DocumentArray.filter(c => c.isFileMarkedAsFinal);

        if (this.DocumentArray.length) {

          this.DocumentArray = this.DocumentArray.sort((a, b) =>

            new Date(a.ModifiedDateString).getTime() < new Date(b.ModifiedDateString).getTime() ? 1 : -1
          );
        }
      } else {
        this.loaderenable = false;
      }
    } else {
      this.loaderenable = false;
    }
    this.selectedDocuments = [];
  }

  // *********************************************************************************************
  //  fetch  user data for Document
  // *********************************************************************************************

  async getUsers(Ids) {
    const batchURL = [];

    Ids.forEach(element => {
      const userDetailObj = Object.assign({}, this.queryConfig);
      userDetailObj.url = this.spServices.getUserURL(element);
      userDetailObj.listName = 'UserInfo';
      userDetailObj.type = 'GET';
      batchURL.push(userDetailObj);
    
    });
    this.commonService.SetNewrelic('MyDashboard', 'SearchProjetc-ProjectDraft', 'GetUsersByIds');
    this.response = await this.spServices.executeBatch(batchURL);
    this.response = this.response.length > 0 ? this.response.map(c => c.retItems) : [];
    return this.response;
  }


  // *************************************************************************************************
  //   Download Files
  // **************************************************************************************************

  downloadFile() {

    if (this.selectedDocuments.length > 0) {
      this.commonService.SetNewrelic('MyDashboard', 'searchproject-project-drafts', 'createZip');
      this.spServices.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTab);
    } else {

      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please Select Files.',false);
    }
  }
}
