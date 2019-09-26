import { Component, OnInit, ViewChild } from '@angular/core';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { ConstantsService } from '../../../../Services/constants.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../../Services/common.service';
import { GlobalService } from '../../../../Services/global.service';
import { SPCommonService } from '../../../../Services/spcommon.service';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { QMSCommonService } from '../../services/qmscommon.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  public navLinks = [{ routerLink: ['/qms/adminView/retrospectiveFeedback'], label: 'Retrospective Feedback' },
  { routerLink: ['/qms/adminView/scorecards'], label: 'Scorecards' }
  ];
  ReviewerDetailColumns = [];
  ReviewerDetail = [];
  // public successMessage: string;
  // public alertMessage: string;
  // private success = new Subject<string>();
  // private alert = new Subject<string>();
  public filterObj = {
    taskType: [
      { type: 'Write', value: 'Write' },
      { type: 'Edit', value: 'Edit' },
      { type: 'QC', value: 'QC' },
      { type: 'Graphics', value: 'Graphics' },
      { type: 'Review-Write', value: 'Review-Write' },
      { type: 'Review-Edit', value: 'Review-Edit' },
      { type: 'Review-QC', value: 'Review-QC' },
      { type: 'Review-Graphics', value: 'Review-Graphics' },
    ],
    filteredResources: [],
    selectedTaskType: null,
    selectedResource: null,
    startDate: new Date(),
    endDate: new Date()
  };
  public tasks = {
    // matFormatTasks: new MatTableDataSource([]),
    arrTasks: []
  };
  public hideLoader = true;
  public hideTable = false;
  public displayedColumns: string[] = ['taskTitle', 'taskCompletionDate', 'rated', 'Draft', 'rating'];
  public resources = [];
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  public AdminColArray = {
    TaskTitle: [],
    TaskCompletionDate: [],
    Rated: [],
    Drafts: [],
  };
  constructor(private spService: SPOperationService, private globalConstant: ConstantsService,
    public datepipe: DatePipe, private global: GlobalService, private qmsConstant: QMSConstantsService,
    private qmsCommon: QMSCommonService, private messageService: MessageService) { }

  async ngOnInit() {
    if (!this.global.currentUser.groups.length) {
      const result = await this.spService.getUserInfo(this.global.sharePointPageObject.userId);
      this.global.currentUser.groups = result.Groups.results ? result.Groups.results : [];
    }
    const isQMSAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSAdmin);
    this.global.viewTabsPermission.hideAdmin = isQMSAdmin.length ? false : true;
    this.ReviewerDetailColumns = [
      { field: 'taskTitle', header: 'Pending Work Draft' },
      { field: 'taskCompletionDate', header: 'Date of submission' },
      { field: 'rated', header: 'Rated' },
      { field: 'docUrlHtmlTag', header: 'Drafts' },
    ];
    if (!this.global.viewTabsPermission.hideAdmin) {
      this.showLoader();
      setTimeout(async () => {
        this.filterObj.startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        // Fetch all active resources
        const adminComponent = JSON.parse(JSON.stringify(this.qmsConstant.AdminViewComponent));
        adminComponent.getResources.top = adminComponent.getResources.top.replace('{{TopCount}}', '4500');
        const arrResult = await this.spService.readItems(this.globalConstant.listNames.ResourceCategorization.name,
          adminComponent.getResources);
        this.resources = arrResult.length > 0 ? arrResult : [];
        this.showTable();
      }, 500);
    }
  }

  colFilters(colData) {
    this.AdminColArray.TaskTitle = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.taskTitle,
        value: a.taskTitle,
        filterValue: a.taskTitle};
      return b; }));
    this.AdminColArray.TaskCompletionDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy'),
        // tslint:disable-next-line: max-line-length
        value: this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy') ? this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy') : '',
        filterValue: a.taskCompletionDate ? new Date(a.taskCompletionDate) : ''
      };
      return b;
    }));
    // tslint:disable: max-line-length
    this.AdminColArray.Rated = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.rated, value: a.rated, filterValue: +a.rated }; return b; }));
  }

  /**
   * Updates Admin view Rated column after admin provides rating
   *
   * @param task - Value emitted from FeedbackPopupComponent after adding scorecard from admin view
   *
   */
  updateReviewerTable(task) {
    const updatedTask = this.tasks.arrTasks.filter(t => t.taskID === task.taskID);
    updatedTask[0].rated = 'Yes';
    this.bindAdminView(this.tasks.arrTasks);
  }

  /**
   * Convert data table to MatTable and bind to HTML
   *
   *
   */
  bindAdminView(tasks) {
    // Bind results of tasks to Admin table
    this.ReviewerDetail = [];
    tasks.forEach(element => {
      this.ReviewerDetail.push({
        taskTitle: element.taskTitle ? element.subMilestones ? element.taskTitle + ' - ' +  element.subMilestones: element.taskTitle : '',
        title: element.taskTitle,
        subMilestones: element.subMilestones,
        taskCompletionDate: this.datepipe.transform(element.taskCompletionDate, 'MMM d, yyyy') ? this.datepipe.transform(element.taskCompletionDate, 'MMM d, yyyy') : '',
        rated: element.rated ? element.rated : '',
        docUrlHtmlTag: element.docUrlHtmlTag ? element.docUrlHtmlTag : '',
        documentURL: element.documentURL ? element.documentURL : '',
        reviewTaskDocUrl: element.reviewTaskDocUrl ? element.reviewTaskDocUrl : '',
        formattedCompletionDate: element.formattedCompletionDate ? element.formattedCompletionDate : '',
        resource: element.resource,
        resourceID: element.resourceID,
        taskID: element.taskID
      });
    });
    this.colFilters(this.ReviewerDetail);
    this.tasks.arrTasks = tasks;
  }

  /**
   * Fetch resource tasks
   *
   * @param element - task
   *
   */
  fetchResourcesTasks(element) {
    if (element && !this.global.viewTabsPermission.hideAdmin) {
      this.showLoader();
      setTimeout(async () => {
        const tasks = await this.getResourceTasks(4500, element.value.UserName.ID);
        this.bindAdminView(tasks);
        this.showTable();
      }, 500);
    }
  }

  /**
   * fetch selected resources tasks
   *
   *
   */
  async getResourceTasks(itemCount, userID) {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setHours(0, 0, 0, 0);
    // date for filter since last month
    const filterDate = new Date(today).toISOString();
    // REST API url in contants file

    const adminComponent = JSON.parse(JSON.stringify(this.qmsConstant.AdminViewComponent));
    adminComponent.resourceTaskUrl.top = adminComponent.resourceTaskUrl.top.replace('{{TopCount}}', '' + itemCount);
    adminComponent.resourceTaskUrl.filter = adminComponent.resourceTaskUrl.filter.replace('{{PrevMonthDate}}', filterDate)
      .replace('{{resourceID}}', userID)
      .replace('{{TaskType}}', this.filterObj.selectedTaskType.value);
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.Schedules.name,
      adminComponent.resourceTaskUrl);
    const arrTasks = arrResult.length > 0 ? arrResult : [];
    // Get previous task project information - 2nd Query
    let projectInformation = await this.getProjectInformation(arrTasks);
    projectInformation = [].concat(...projectInformation);
    // Get all tasks documents from tasks milestone - 3rd Query
    const documents = await this.qmsCommon.getAllTaskDocuments(arrTasks, projectInformation);
    const tasks = [];
    arrTasks.forEach(task => {
      const taskDocuments = this.qmsCommon.getTaskDocuments(documents, task.Title);
      const taskDate = task.Actual_x0020_End_x0020_Date ? new Date(task.Actual_x0020_End_x0020_Date) : '';
      const subMilestones = task.SubMilestones ? task.SubMilestones : '';
      const obj = {
        resource: task.AssignedTo ? task.AssignedTo.Title : '',
        resourceID: task.AssignedTo ? task.AssignedTo.ID : '',
        taskTitle: task.Title ? task.Title : '',
        subMilestones,
        taskID: task.ID ? task.ID : '',
        rated: task.Rated ? 'Yes' : 'No',
        taskCompletionDate: task.Actual_x0020_End_x0020_Date ? new Date(task.Actual_x0020_End_x0020_Date) : '',
        formattedCompletionDate: this.datepipe.transform(taskDate, 'MMM d, y'),
        reviewTaskDocUrl: '',
        documentURL: taskDocuments.documentUrl,
        docUrlHtmlTag: taskDocuments.documentUrlHtmlTag
      };
      tasks.push(obj);
    });
    return tasks;
  }

  /**
   * Fetch project information for task
   *
   * @returns [] project information
   *
   */
  async getProjectInformation(task) {
    const projcode = [];
    const batchURL = [];
    // Fetch project information for each tasks
    task.forEach(element => {
      // Fetch proj info if it fetched for first time
      if (projcode.indexOf(element.ProjectCode) < 0) {
        const getPrjItemData = Object.assign({}, this.options);
        getPrjItemData.url = this.spService.getReadURL(this.globalConstant.listNames.ProjectInformation.name,
          this.qmsConstant.AdminViewComponent.projectInformationUrl);
        getPrjItemData.url = getPrjItemData.url.replace('{{projectCode}}', element.ProjectCode);
        getPrjItemData.listName = this.globalConstant.listNames.ProjectInformation.name;
        getPrjItemData.type = 'GET';
        batchURL.push(getPrjItemData);
        projcode.push(element.ProjectCode);
      }
    });
    let arrResult = await this.spService.executeBatch(batchURL);
    arrResult = arrResult.length > 0 ? arrResult.map(p => p.retItems.length ? p.retItems[0] : {}) : [];
    return arrResult;
  }

  /**
   * Filter resource based on task type selected ( Write, Edit, QC, Graphics )
   *
   */
  filterResource() {
    this.filterObj.selectedResource = null;
    this.filterObj.filteredResources = [];
    // tslint:disable
    // Filter resource based on resource categorization list - Tasks column of resource
    let filteredResources = this.resources.filter(t => t.Tasks.results.filter(type => type.Title === this.filterObj.selectedTaskType.value).length > 0);
    filteredResources.forEach(element => {
      this.filterObj.filteredResources.push(element);
    });
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }

  showToastMsg(objMsg) {
    this.messageService.add({severity: objMsg.type, summary: objMsg.msg, detail: objMsg.detail});
  }
}
