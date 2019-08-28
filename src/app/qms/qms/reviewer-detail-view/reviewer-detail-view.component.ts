import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { SPOperationService } from '../../../Services/spoperation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../../Services/common.service';
import { FeedbackPopupComponent } from './feedback-popup/feedback-popup.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SPCommonService } from '../../../Services/spcommon.service';
import { QMSConstantsService } from '../services/qmsconstants.service';
import { QMSCommonService } from '../services/qmscommon.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reviewer-detail-view',
  templateUrl: './reviewer-detail-view.component.html',
  styleUrls: ['./reviewer-detail-view.component.css']
})
export class ReviewerDetailViewComponent implements OnInit {
  //#region Initialisation
  ReviewerDetail: any = [];
  ReviewerDetailColumns: any[];
  public currentUser = this.global.currentUser;

  // For Reviewer pending tasks table
  @Output() myEvent = new EventEmitter<string>();
  @ViewChild(FeedbackPopupComponent, { static: true }) popup: FeedbackPopupComponent;
  public hideLoader = true;
  public hideTable = false;
  RDColArray = {
    Resource: [],
    TaskTitle: [],
    TaskCompletionDate: [],
    Drafts: [],
    MyDrafts: []
  };

  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  constructor(private spService: SPOperationService, private globalConstant: ConstantsService,
    public global: GlobalService, private datepipe: DatePipe, private qmsConstant: QMSConstantsService,
    private common: CommonService, private qmsCommon: QMSCommonService, private messageService: MessageService) { }
  //#endregion of Initialisation
  /**
   * Initial function
   *
   *
   */
  ngOnInit() {
    this.showLoader();
    this.ReviewerDetailColumns = [
      { field: 'resource', header: 'Resources' },
      { field: 'taskTitle', header: 'Pending Work Draft' },
      { field: 'taskCompletionDate', header: 'Submission Date' },
      { field: 'docUrlHtmlTag', header: 'Drafts' },
      { field: 'docReviewUrlHtmlTag', header: 'My Drafts' },
    ];
    setTimeout(async () => {
      // Initialize and subscribe for success and alert message
      // this.initializeMsg();
      const tasks = await this.getPendingRatedTasks(4500);
      this.bindReviewerTable(tasks);
      this.showTable();
    }, 500);
  }


  colFilters(colData) {
    // tslint:disable
    this.RDColArray.Resource = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.resource, value: a.resource, filterValue: a.resource  }; return b; }));
    this.RDColArray.TaskTitle = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.taskTitle + '-' + a.SubMilestones, value: a.taskTitle + '-' + a.SubMilestones, filterValue: a.taskTitle + '-' + a.SubMilestones }; return b; }));
    this.RDColArray.TaskCompletionDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = { label: this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy'),
      value: this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy') ? this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy') : '',
      filterValue: new Date(a.taskCompletionDate) }; return b;
    }));
  }

  /**
   * Retrieve previous tasks of review tasks completed by current user and pending for rating
   *
   *
   */
  async getPendingRatedTasks(itemCount: number) {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setHours(0, 0, 0, 0);
    // date for filter since last month
    const filterDate = new Date(today);
    today.setDate(today.getDate() - 1);
    const lastMonthDateString = this.datepipe.transform(today, 'yyyy-MM-ddTHH:mm:ss.000') + 'Z';
    // Get Current user review tasks for past 30 days - 1st Query
    const reviewerComponent = JSON.parse(JSON.stringify(this.qmsConstant.reviewerComponent));
    reviewerComponent.reviewerPendingTaskURL.top = reviewerComponent.reviewerPendingTaskURL.top.replace('{{TopCount}}', '' + itemCount);
    reviewerComponent.reviewerPendingTaskURL.filter = reviewerComponent.reviewerPendingTaskURL.filter.replace('{{PrevMonthDate}}', lastMonthDateString);
    let arrReviewTasks = await this.spService.readItems(this.globalConstant.listNames.Schedules.name, reviewerComponent.reviewerPendingTaskURL);
    arrReviewTasks = arrReviewTasks.length > 0 ? arrReviewTasks.filter(t => new Date(t.DueDate).getTime() >= filterDate.getTime()) : [];
    // Get previous task project information - 2nd Query
    let projectInformation = await this.getProjectInformation(arrReviewTasks);
    projectInformation = [].concat(...projectInformation);
    // Get previous task of above tasks and not rated - 3rd Query
    const prevTasksDetail = await this.getPreviousTasksDetails(arrReviewTasks);
    // Get all tasks documents from tasks milestone - 4th Query
    const allTasksDocuments = await this.qmsCommon.getAllTaskDocuments(prevTasksDetail, projectInformation);
    const reviewerPendingTasks = [];
    prevTasksDetail.forEach(element => {
      if (!element.reviewTask.Rated) {
        const taskDate = element.Actual_x0020_End_x0020_Date ?
          new Date(element.Actual_x0020_End_x0020_Date) : '';
        const reviewTaskDoc = this.qmsCommon.getTaskDocuments(allTasksDocuments, element.reviewTask.Title);
        const previousTaskDoc = this.qmsCommon.getTaskDocuments(allTasksDocuments, element.Title);
        const obj = {
          resource: element.AssignedTo ? element.AssignedTo.Title : '',
          resourceID: element.AssignedTo ? element.AssignedTo.ID : '',
          taskTitle: element.Title ? element.Title : '',
          SubMilestones: element.SubMilestones ? element.SubMilestones : 'Default',
          taskID: element.ID ? element.ID : '',
          taskCompletionDate: taskDate,
          formattedCompletionDate: this.datepipe.transform(taskDate, 'd MMM, y'),
          reviewTaskDocUrl: reviewTaskDoc.documentUrl,
          documentURL: previousTaskDoc.documentUrl,
          reviewTask: element.reviewTask,
          docReviewUrlHtmlTag: reviewTaskDoc.documentUrlHtmlTag,
          docUrlHtmlTag: previousTaskDoc.documentUrlHtmlTag
        };
        reviewerPendingTasks.push(obj);
      }
    });
    return reviewerPendingTasks;
  }

  /**
   * Update schedules list rated column of review tasks(multiple previous tasks or multiple next task of previous)
   * whose all previous tasks are marked as 'Yes'
   */
  updateSchedulesList(taskDetail) {
    // update review task - Rated column true if all previous tasks are rated.
    const arrUpdateBody = [];
    const taskUpdateDetail = {
      __metadata: { type: this.globalConstant.listNames.Schedules.type },
      IsRated: true
    };
    // Update review task rated 'yes' if this is last previous task not rated
    this.spService.updateItem(this.globalConstant.listNames.Schedules.name, taskDetail.ID, taskUpdateDetail);
  }

  /**
   * Fetch project information for task
   *
   * @returns [] project information
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

  async getPreviousTasks(arrReviewTasks) {
    const batchURL = [];
    let sBatchData = '';
    let i = 0;
    let prevTasksDetail = [];
    const reviewTasks = [];
    const returnObj: any = {};
    const reviewerComponent = JSON.parse(JSON.stringify(this.qmsConstant.reviewerComponent));
    arrReviewTasks.forEach(task => {
      const prevTasks = task.PrevTasks ? task.PrevTasks.split(';#') : [];
      if (prevTasks.length > 0) {
        prevTasks.forEach(async prevTaskTitle => {
          // Bind reviewTask to respective previous task
          reviewTasks.push(task);
          // REST API url to check if code is project code
          const getPrevTaskData = Object.assign({}, this.options);
          getPrevTaskData.url = this.spService.getReadURL(this.globalConstant.listNames.Schedules.name, reviewerComponent.prevOfReviewTasksUrl);
          getPrevTaskData.url = getPrevTaskData.url.replace('{{PrevTaskTitle}}', prevTaskTitle);
          getPrevTaskData.listName = this.globalConstant.listNames.Schedules.name;
          getPrevTaskData.type = 'GET';
          batchURL.push(getPrevTaskData);
          i++;
          if (i % 100 === 0) {
            let bresult = await this.spService.executeBatch(batchURL);
            bresult = bresult.map(t => t.retItems);
            prevTasksDetail = [...prevTasksDetail, ...bresult];
            sBatchData = '';
          }
        });
      }
    });
    let result = await this.spService.executeBatch(batchURL);
    result = result.map(t => t.retItems);
    prevTasksDetail = [...prevTasksDetail, ...result];
    returnObj.prevTasksDetail = prevTasksDetail;
    // Bind reviewTask to respective previous task
    returnObj.reviewTasks = reviewTasks;
    return returnObj;
  }

  /**
   * Fetch pevious tasks of review tasks
   *
   * @returns [] of previous tasks review tasks which are not rated
   */
  async getPreviousTasksDetails(arrReviewTasks) {
    let prevTasksDetails = [];
    const tasks = await this.getPreviousTasks(arrReviewTasks);
    arrReviewTasks.forEach(task => {
      const prevTasks = task.PrevTasks ? task.PrevTasks.split(';#') : [];
      let identifyMultipleTasksFlag = false;
      let ratedFlag = true;
      for (const prevTaskTitle of prevTasks) {
        let preTasks = tasks.prevTasksDetail.filter(t => t[0] && t[0].Title === prevTaskTitle);
        // check if there are multiple next task of prev tasks
        preTasks = preTasks.length > 0 ? preTasks[0][0].NextTasks.split(';#') : [];
        if (preTasks.length !== 1) {
          identifyMultipleTasksFlag = true;
        }
        // On load check if prevTasks of review tasks are rated then mark review task as 'Yes'
        if (ratedFlag && tasks.prevTasksDetail.filter(pt => pt[0] && pt[0].Title === prevTaskTitle && !pt[0].Rated).length > 0) {
          ratedFlag = false;
        }
      }
      // update review task if not rated previous tasks is 0
      if (ratedFlag && identifyMultipleTasksFlag) {
        task.Rated = true;
        // update review task as rated 'Yes'
        this.updateSchedulesList(task);
      }
      // Bind reviewTask to respective previous task
      for (let index = 0; index < tasks.prevTasksDetail.length; index++) {
        if (tasks.prevTasksDetail[index].length > 0) {
          tasks.prevTasksDetail[index][0].reviewTask = tasks.reviewTasks[index];
        }
      }
    });
    prevTasksDetails = tasks.prevTasksDetail.length > 0 ? [].concat(...tasks.prevTasksDetail) : [];
    return prevTasksDetails;
  }

  /**
   * Convert data table to MatTable and bind to HTML
   *
   */
  bindReviewerTable(reviewerPendingTasks) {
    // Bind results of tasks to reviewer table
    // Storing array on a global copy
    this.global.oReviewerPendingTasks = JSON.parse(JSON.stringify(reviewerPendingTasks));
    this.ReviewerDetail = [];
    reviewerPendingTasks.forEach(element => {
      const subMilestones = element.SubMilestones ? element.SubMilestones : 'Default';
      this.ReviewerDetail.push({
        resource: element.resource ? element.resource : '',
        taskTitle: element.taskTitle ? element.taskTitle : '',
        subMilestones,
        taskCompletionDate: this.datepipe.transform(element.taskCompletionDate, 'MMM d, yyyy'),
        docUrlHtmlTag: element.docUrlHtmlTag ? element.docUrlHtmlTag : '',
        docReviewUrlHtmlTag: element.docReviewUrlHtmlTag ? element.docReviewUrlHtmlTag : '',
        documentURL: element.documentURL,
        reviewTaskDocUrl: element.reviewTaskDocUrl,
        formattedCompletionDate: element.formattedCompletionDate ? element.formattedCompletionDate : '',
        resourceID: element.resourceID,
        taskID: element.taskID,
        reviewTask: element.reviewTask
      });
    });
    this.colFilters( this.ReviewerDetail);
  }

  //#endregion ForReviewer

  /**
   * Listens to child component success message
   *
   */
  callParentSuccessMsg(objMsg) {
    this.showToastMsg(objMsg.type, objMsg.msg, objMsg.detail);
  }

  showToastMsg(type, msg, detail) {
    this.messageService.add({severity: type, summary: msg, detail: detail});
  }

  
  exportToExcel(table, sheetname) {
    this.common.tableToExcel(table, sheetname);
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }
}
