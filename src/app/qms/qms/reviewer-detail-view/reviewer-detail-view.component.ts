import { Component, OnInit, ViewChild, Output, EventEmitter, NgZone, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { SPOperationService } from '../../../Services/spoperation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { DatePipe, LocationStrategy, PlatformLocation } from '@angular/common';
import { CommonService } from '../../../Services/common.service';
import { FeedbackPopupComponent } from './feedback-popup/feedback-popup.component';
import { QMSConstantsService } from '../services/qmsconstants.service';
import { QMSCommonService } from '../services/qmscommon.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { DialogService } from 'primeng';

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
  public milestoneTasks = [];
  // For Reviewer pending tasks table
  @Output() myEvent = new EventEmitter<string>();
  @ViewChild(FeedbackPopupComponent, { static: false }) popup: FeedbackPopupComponent;
  @ViewChild('rd', { static: false }) rdTable: Table;

  public hideLoader = true;
  public hideTable = false;
  RDColArray = {
    resource: [],
    taskTitle: [],
    taskCompletionDate: [],
    Drafts: [],
    MyDrafts: []
  };

  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  navigationSubscription;
  constructor(
    private spService: SPOperationService,
    private globalConstant: ConstantsService,
    public global: GlobalService,
    private datepipe: DatePipe,
    private qmsConstant: QMSConstantsService,
    private commonService: CommonService,
    private qmsCommon: QMSCommonService,
    private cdr: ChangeDetectorRef,
    private dialogService : DialogService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.navigationSubscription = _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });

  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

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
    this.RDColArray.resource = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.resource, value: a.resource, filterValue: a.resource }; return b; }));
    this.RDColArray.taskTitle = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.taskTitle,
        value: a.taskTitle,
        filterValue: a.taskTitle
      };
      return b;
    }).filter(ele => ele.label));
    this.RDColArray.taskCompletionDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.taskCompletionDate ? this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy') : "",
        value: a.taskCompletionDate ? new Date(this.datepipe.transform(a.taskCompletionDate, 'MMM d, yyyy')) : "",
        filterValue: a.taskCompletionDate ? new Date(a.taskCompletionDate) : ""
      }; return b;
    }).filter(ele => ele.label));
  }

  /**
   * Retrieve previous tasks of review tasks completed by current user and pending for rating
   *
   *
   */
  async getPendingRatedTasks(itemCount: number) {
    const batchURL = [];
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setHours(0, 0, 0, 0);
    // date for filter since last month
    const filterDate = new Date(today);
    today.setDate(today.getDate() - 1);
    const lastMonthDateString = this.datepipe.transform(today, 'yyyy-MM-ddTHH:mm:ss.000') + 'Z';
    // Get Current user review tasks for past 30 days - 1st Query
    const getMilestoneTasks = Object.assign({}, this.options);
    getMilestoneTasks.url = this.spService.getReadURL(this.globalConstant.listNames.MilestoneTasks.name,
      this.qmsConstant.common.getMilestoneTasks);
    getMilestoneTasks.listName = this.globalConstant.listNames.MilestoneTasks.name;
    getMilestoneTasks.type = 'GET';
    batchURL.push(getMilestoneTasks);

    const getReviewerTasks = Object.assign({}, this.options);
    getReviewerTasks.url = this.spService.getReadURL(this.globalConstant.listNames.Schedules.name,
      this.qmsConstant.reviewerComponent.reviewerPendingTaskURL);
    getReviewerTasks.url = getReviewerTasks.url.replace('{{TopCount}}', '' + itemCount)
      .replace('{{PrevMonthDate}}', lastMonthDateString);
    getReviewerTasks.listName = this.globalConstant.listNames.Schedules.name;
    getReviewerTasks.type = 'GET';
    batchURL.push(getReviewerTasks);
    // const reviewerComponent = JSON.parse(JSON.stringify(this.qmsConstant.reviewerComponent));
    // reviewerComponent.reviewerPendingTaskURL.top = reviewerComponent.reviewerPendingTaskURL.top.replace('{{TopCount}}', '' + itemCount);
    // reviewerComponent.reviewerPendingTaskURL.filter = reviewerComponent.reviewerPendingTaskURL.filter.replace('{{PrevMonthDate}}', lastMonthDateString);
    this.commonService.SetNewrelic('QMS', 'ReviewDetails-View', 'getPendingRatedTasks');
    const arrResult = await this.spService.executeBatch(batchURL);
    this.milestoneTasks = arrResult.length > 0 ? arrResult[0].retItems : [];
    const reviewerTasks = arrResult.length > 1 ? arrResult[1].retItems : [];
    // let arrReviewTasks = await this.spService.readItems(this.globalConstant.listNames.Schedules.name, reviewerComponent.reviewerPendingTaskURL);
    let arrReviewTasks = reviewerTasks.length > 0 ? reviewerTasks.filter(t => new Date(t.DueDate).getTime() >= filterDate.getTime()) : [];
    arrReviewTasks = arrReviewTasks.map(t => {
      const obj = Object.assign({}, t);
      obj.defaultSkill = t.Task.indexOf('Review-') > -1 ? 'Review' : t.Task
      return obj;
    });
    // Get previous task project information - 2nd Query
    let projectInformation = await this.getProjectInformation(arrReviewTasks);
    projectInformation = [].concat(...projectInformation);
    // Get previous task of above tasks and not rated - 3rd Query
    const prevTasksDetail = await this.getPreviousTasksDetails(arrReviewTasks, this.milestoneTasks);
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
          milestone: element.Milestone ? element.Milestone : '',
          SubMilestones: element.SubMilestones ? element.SubMilestones : '',
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
    this.commonService.SetNewrelic('QMS', 'ReviewDetails-View', 'updateTask');
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

    this.commonService.SetNewrelic('QMS', 'ReviewDetails-View', 'getProjectInfo');
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
    this.commonService.SetNewrelic('QMS', 'ReviewDetails-View', 'getPreviousTasks');
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
  async getPreviousTasksDetails(arrReviewTasks, milestoneTasks) {
    let prevTasksDetails = [];
    const tasks = await this.getPreviousTasks(arrReviewTasks);
    arrReviewTasks.forEach(task => {
      const prevTasks = task.PrevTasks ? task.PrevTasks.split(';#') : [];
      let identifyMultipleTasksFlag = false;
      let ratedFlag = true;
      for (const prevTaskTitle of prevTasks) {
        let preTasks = tasks.prevTasksDetail.filter(t => t[0] && t[0].Title === prevTaskTitle);
        // check if there are multiple next task of prev tasks
        preTasks = preTasks.length > 0 ? preTasks[0].length > 0 ?  preTasks[0][0].NextTasks ? preTasks[0][0].NextTasks.split(';#') : []: []: [];
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
          const milestoneTask = milestoneTasks.find(t => t.Title === tasks.reviewTasks[index].Task);
          tasks.prevTasksDetail[index][0].reviewTask.defaultSkill = tasks.reviewTasks[index].Task.indexOf('Review-') > -1 ?
            'Review' : milestoneTask.DefaulSkill ? milestoneTask.DefaulSkill : '';
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
      const subMilestones = element.SubMilestones ? element.SubMilestones : '';
      this.ReviewerDetail.push({
        resource: element.resource ? element.resource : '',
        taskTitle: element.taskTitle ? subMilestones ? element.taskTitle + ' - ' + subMilestones : element.taskTitle : '',
        title: element.taskTitle,
        subMilestones,
        taskCompletionDate: element.taskCompletionDate ? new Date(this.datepipe.transform(element.taskCompletionDate, 'MMM d, yyyy')) : '',
        docUrlHtmlTag: element.docUrlHtmlTag ? element.docUrlHtmlTag : '',
        docReviewUrlHtmlTag: element.docReviewUrlHtmlTag ? element.docReviewUrlHtmlTag : '',
        documentURL: element.documentURL,
        reviewTaskDocUrl: element.reviewTaskDocUrl,
        formattedCompletionDate: element.formattedCompletionDate ? element.formattedCompletionDate : '',
        resourceID: element.resourceID,
        taskID: element.taskID,
        reviewTask: element.reviewTask,
        defaultSkill: element.defaultSkill
      });
    });
    this.colFilters(this.ReviewerDetail);
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
    this.commonService.showToastrMessage(type,detail,false);
  }


  exportToExcel(table, sheetname) {
    this.commonService.tableToExcel(table, sheetname);
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }


  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.ReviewerDetail.length && this.isOptionFilter) {
      let obj = {
        tableData: this.rdTable,
        colFields: this.RDColArray
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.colFilters(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }


  openfeedbackpopup(qmsTasks,task){
    const ref = this.dialogService.open(FeedbackPopupComponent, {
      data: {
        qmsTasks,
        task
      },
      header: 'Rate Work',
      width: '70vw',
      contentStyle: { 'min-height': '30vh', 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe((feedbackdata: any) => {
      if(feedbackdata){
        this.bindReviewerTable(feedbackdata.task);
        this.callParentSuccessMsg(feedbackdata.message);
      }
     });
  }

}

