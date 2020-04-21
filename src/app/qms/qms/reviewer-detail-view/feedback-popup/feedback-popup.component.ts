import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from '../../../../Services/constants.service';
import { GlobalService } from '../../../../Services/global.service';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { CommonService } from 'src/app/Services/common.service';
import { IScorecard, IScorecardTemplate } from '../../../interfaces/qms';
import { MessageService } from 'primeng';
import { MyDashboardConstantsService } from 'src/app/my-dashboard/services/my-dashboard-constants.service';
import { DatePipe } from '@angular/common';
import { isArray } from 'util';

@Component({
  selector: 'app-feedback-popup',
  templateUrl: './feedback-popup.component.html',
  styleUrls: ['./feedback-popup.component.css']
})


export class FeedbackPopupComponent implements OnInit {

  @Output() bindTableEvent = new EventEmitter<{}>();
  @Output() setSuccessMessage = new EventEmitter<{}>();
  @Output() popupClosed = new EventEmitter<{}>();
  @ViewChild('popupContent', { static: true }) popupContent: ElementRef;
  public popupByJS = false;
  public hidePopupLoader = true;
  public hidePopupTable = false;
  public activeIndex = -1;
  display = false;
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  public popupParentComponent = '';
  public scorecardTemplates = {
    templates: [],
    templateMatrix: [],
  };
  public scorecardTasks = {
    tasks: [] as IScorecard[],
    currentTask: {} as any
  };
  constructor(
    private spService: SPOperationService,
    private constantsService: ConstantsService,
    private qmsConstant: QMSConstantsService,
    public global: GlobalService,
    private common: CommonService,
    private messageService: MessageService,
    private dashbaordService: MyDashboardConstantsService,
    private datePipe: DatePipe,
  ) {
  }

  ngOnInit() {
  }
  //#region ForRatingPopup

  /**
   * Get active scorecard templates on click of provide rating button
   *
   */
  async getTemplates() {
    const feedbackComponent = JSON.parse(JSON.stringify(this.qmsConstant.feedbackPopupComponent));
    feedbackComponent.getTemplates.top = feedbackComponent.getTemplates.top.replace('{{TopCount}}', '4500');
    this.common.SetNewrelic('QMS', 'ReviewDetails-View-Feedbackpopup', 'GetTemplate');
    // tslint:disable: max-line-length
    const arrResult = await this.spService.readItems(this.constantsService.listNames.ScorecardTemplate.name, feedbackComponent.getTemplates);
    const templates: IScorecardTemplate[] = arrResult.length > 0 ? arrResult : [];
    return templates;
  }

  /**
   * Get Template questions based on selected template
   *
   */
  async getTemplateMatrix(taskID) {
    const templateMatrix = [];
    const selectedTask = this.scorecardTasks.tasks.find(t => t.taskID === taskID);
    const selectedTemplate = selectedTask ? selectedTask.selectedTemplate.Title : '';
    const feedbackComponent = JSON.parse(JSON.stringify(this.qmsConstant.feedbackPopupComponent));
    feedbackComponent.getTemplateMatrix.top = feedbackComponent.getTemplateMatrix.top.replace('{{TopCount}}', '' + 100);
    // tslint:disable: max-line-length
    feedbackComponent.getTemplateMatrix.filter = feedbackComponent.getTemplateMatrix.filter.replace('{{selectedTemplate}}', selectedTemplate);
    this.common.SetNewrelic('QMS', 'ReviewDetails-View-Feedbackpopup', 'getTemplateMatrix');
    let arrResults = await this.spService.readItems(this.constantsService.listNames.ScorecardMatrix.name, feedbackComponent.getTemplateMatrix);
    arrResults = arrResults.length > 0 ? arrResults : [];
    arrResults.forEach(element => {
      const obj = {
        question: element.Title,
        questionId: element.ID,
        rating: 0,
        tooltip: element.Tooltip
      };
      templateMatrix.push(obj);
    });
    selectedTask.averageRating = 0;
    selectedTask.templateMatrix = [...templateMatrix];
  }

  /**
   * Updates rating on global array of templates
   *
   */
  updateRating(task) {
    const ratingTotal = task.templateMatrix.reduce((a, b) => a + b.rating, 0);
    const ratingCount = task.templateMatrix.filter(r => r.rating !== 0).length;
    const averageRating = ratingTotal / ratingCount;
    task.averageRating = +averageRating.toFixed(2);
  }

  /**
   * Function to show loading while retireving data
   *
   */
  saveRatingFeedback() {
    const result = this.validateScorecard();
    if (result) {
      this.showLoader();
      const prevTasks = this.scorecardTasks.tasks.filter(t => !t.ignoreFeedback);
      setTimeout(async () => {
        await this.save(prevTasks);
        this.constantsService.loader.isPSInnerLoaderHidden = true;
      }, 300);
    }
  }

  validateScorecard() {
    const emptyScorecard = this.scorecardTasks.tasks.filter(t => !t.ignoreFeedback && t.averageRating <= 0);
    const milestone = this.scorecardTasks.currentTask.Milestone ? this.scorecardTasks.currentTask.Milestone : this.scorecardTasks.currentTask.milestone;
    if (milestone === 'Draft 1' && emptyScorecard.length) {
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message', life: 10000,
        detail: 'Rating Draft 1 milestone task is mandatory.'
      });
      return false;
    }
    if (emptyScorecard.length) {
      const tasksNames = emptyScorecard.map(s => s.task);
      const taskString = tasksNames.join(',');
      this.messageService.add({
        key: 'custom', severity: 'warn', summary: 'Warning Message', life: 10000,
        detail: 'Please mark ignore to scorecard of task ' + taskString
      });
      return false;
    }
    return true;
  }

  /**
   * Save feedback rating details to sharepoint list // Scorecard, ScorecardRatings, Schedules
   *
   */
  async save(previousTasks) {
    let firstBatchURL = [];
    // Insert new scorecard item to scorecard list
    const firstPostRequestContent = this.addScorecardItem(previousTasks);
    // Insert Scorecard questions rating in scorecard rating list
    firstBatchURL = [...firstPostRequestContent];
    this.common.SetNewrelic('QMS', 'ReviewDetails-View-Feedbackpopup', 'SaveFeedbackRating');
    const items = await this.spService.executeBatch(firstBatchURL);
    if (items && items.length > 0) {
      const scorecardMatrixContent = this.addScorecardMatrixItem(previousTasks, items);
      let secondPostRequestContent = [];
      const schedulesPostRequest = await this.updateSchedulesList(previousTasks);
      secondPostRequestContent = [...schedulesPostRequest, ...scorecardMatrixContent];
      this.common.SetNewrelic('QMS', 'ReviewDetails-View-Feedbackpopup', 'SaveFeedbackRating');
      const result = await this.spService.executeBatch(secondPostRequestContent);
      if (result) {
        this.closeFeedback(previousTasks);
        if (Object.keys(this.scorecardTasks.currentTask).length > 0) {
          switch (this.scorecardTasks.currentTask.parent) {
            // case 'Dashboard':
            //   this.popupClosed.emit(this.scorecardTasks.currentTask);
            //   break;
            case 'Retrospective':
              this.bindTableEvent.emit(this.global.oReviewerPendingTasks);
              break;
            case 'Reviewer':
              previousTasks.forEach(task => {
                const taskIndex = this.global.oReviewerPendingTasks.findIndex(item => item.taskTitle === task.task);
                this.global.oReviewerPendingTasks.splice(taskIndex, 1);
              });
              const reviewerPendingTasks = JSON.parse(JSON.stringify(this.global.oReviewerPendingTasks));
              this.bindTableEvent.emit(reviewerPendingTasks);
              break;
          }
        }
        this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'Rating updated!' });
      }
    }
    if (this.scorecardTasks.currentTask.parent === 'Dashboard') {
      this.popupClosed.emit(this.scorecardTasks.currentTask);
    }
  }

  /**
   * Adds item to scorecard list
   *
   */
  addScorecardItem(previousTasks) {
    const batchURL = [];
    let scorecardDetails: {};
    previousTasks.forEach(taskDetail => {
      scorecardDetails = {
        __metadata: { type: this.constantsService.listNames.Scorecard.type },
        Title: taskDetail.task,
        SubMilestones: taskDetail.submilestones,
        FeedbackType: 'Task Feedback',
        CommentsMT: taskDetail.feedbackComment,
        AverageRatingNM: taskDetail.averageRating,
        AssignedToId: taskDetail.assignedToID,
        DocumentsUrl: taskDetail.documentUrl,
        ReviewerDocsUrl: taskDetail.reviewTaskDocUrl,
        TemplateName: taskDetail.selectedTemplate.Title,
        EvaluatorSkill: taskDetail.reviewTask ? taskDetail.reviewTask.defaultSkill ? taskDetail.reviewTask.defaultSkill : '' : ''
      };
      if (taskDetail.taskCompletionDate) {
        scorecardDetails = {
          ...scorecardDetails,
          SubmissionDate: taskDetail.taskCompletionDate
        };
      }
      const scorecardItemData = Object.assign({}, this.options);
      scorecardItemData.url = this.spService.getReadURL(this.constantsService.listNames.Scorecard.name);
      scorecardItemData.listName = this.constantsService.listNames.Scorecard.name;
      scorecardItemData.data = scorecardDetails;
      scorecardItemData.type = 'POST';
      batchURL.push(scorecardItemData);
    });
    return batchURL;
  }

  /**
   * Adds item to scorecard matrix
   *
   */
  addScorecardMatrixItem(previousTasks, scorecardResponse) {
    const batchURL = [];
    previousTasks.forEach(taskDetail => {
      const scorecardItem = scorecardResponse.find(scorecard => scorecard.retItems.Title === taskDetail.task);
      const scorecardID = scorecardItem ? scorecardItem.retItems.ID : -1;
      taskDetail.templateMatrix.forEach(element => {
        const scorecardRatingDetails = {
          __metadata: { type: this.constantsService.listNames.ScorecardRatings.type },
          Title: taskDetail.task,
          Rating: element.rating,
          ScorecardTemplateId: taskDetail.selectedTemplate.ID,
          ParameterId: element.questionId,
          ScorecardId: scorecardID
        };
        const scorecardRatingItemData = Object.assign({}, this.options);
        scorecardRatingItemData.url = this.spService.getReadURL(this.constantsService.listNames.ScorecardRatings.name);
        scorecardRatingItemData.listName = this.constantsService.listNames.ScorecardRatings.name;
        scorecardRatingItemData.data = scorecardRatingDetails;
        scorecardRatingItemData.type = 'POST';
        batchURL.push(scorecardRatingItemData);
      });
    });
    return batchURL;
  }

  /**
   * update item of scorecard matrix
   *
   * @returns Data to be pushed for execution in POST request
   */
  updateScorecardMatrixItem(scorecardItem, scorecardRatingItems) {
    const scorecardID = scorecardItem.ID;
    const batchURL = [];
    scorecardRatingItems.forEach(element => {
      const scorecardRatingDetails = {
        __metadata: { type: this.constantsService.listNames.ScorecardRatings.type },
        ScorecardId: scorecardID
      };

      const revTaskData = Object.assign({}, this.options);
      revTaskData.data = scorecardRatingDetails;
      revTaskData.listName = this.constantsService.listNames.ScorecardRatings.name;
      revTaskData.type = 'PATCH';
      revTaskData.url = this.spService.getItemURL(this.constantsService.listNames.ScorecardRatings.name, element.retItems.ID);
      batchURL.push(revTaskData);
    });
    return batchURL;
  }

  /**
   * Updates schedules list item
   *
   */
  async updateSchedulesList(previousTasks) {
    const batchURL = [];
    for (const taskDetail of previousTasks) {
      // update review task - Rated column true if all previous tasks are rated.
      // check if update done by QMS_Admin group user or reviewer
      // This will execute for reviewer
      const prevTasks = Array.isArray(taskDetail.reviewTask.PrevTasks) ? taskDetail.reviewTask.PrevTasks : taskDetail.reviewTask.PrevTasks ? taskDetail.reviewTask.PrevTasks.split(';#') : [];
      const tasksReviewPending = taskDetail.reviewTask.defaultSkill === 'Review' ? await this.getPrevTask(prevTasks) : [taskDetail];
      let updateIsRatedDetail = {};
      // Update review task rated 'yes' if this is last previous task not rated
      if (tasksReviewPending.length <= 1 && taskDetail.reviewTask) {
        const reviewTaskUpdateDetail = {
          __metadata: { type: this.constantsService.listNames.Schedules.type },
          IsRated: true // for review task
        };
        const revTaskData = Object.assign({}, this.options);
        revTaskData.data = reviewTaskUpdateDetail;
        revTaskData.listName = this.constantsService.listNames.Schedules.name;
        revTaskData.type = 'PATCH';
        revTaskData.url = this.spService.getItemURL(this.constantsService.listNames.Schedules.name, taskDetail.reviewTask.ID);
        batchURL.push(revTaskData);
      }
      const reviewPreNextTasks = tasksReviewPending.length > 0 ? tasksReviewPending[0].NextTasks ? tasksReviewPending[0].NextTasks.split(';#') : [] : [];
      if (prevTasks.length > 1 || reviewPreNextTasks.length > 1) {
        const taskUpdateDetail = {
          __metadata: { type: this.constantsService.listNames.Schedules.type },
          Rated: true, // for previous task
          // IsRated: true // for review task
        };
        // Update previous task of review task as Rated 'yes'
        const curTaskData = Object.assign({}, this.options);
        curTaskData.data = taskUpdateDetail;
        curTaskData.listName = this.constantsService.listNames.Schedules.name;
        curTaskData.type = 'PATCH';
        curTaskData.url = this.spService.getItemURL(this.constantsService.listNames.Schedules.name, taskDetail.taskID);
        batchURL.push(curTaskData);
        // below if will execute for admin view since review task will be '' for admin
      } else if (prevTasks.length === 1 && taskDetail.reviewTask) {
        updateIsRatedDetail = {
          __metadata: { type: this.constantsService.listNames.Schedules.type },
          Rated: true,
          // IsRated: true
        };
      } else if (!taskDetail.reviewTask) {
        /// Below will be updated for Admin users
        updateIsRatedDetail = {
          __metadata: { type: this.constantsService.listNames.Schedules.type },
          Rated: true
        };
      }
      if (Object.keys(updateIsRatedDetail).length) {
        // Update previous task of review task as Rated 'yes'
        const curTaskRatedData = Object.assign({}, this.options);
        curTaskRatedData.data = updateIsRatedDetail;
        curTaskRatedData.listName = this.constantsService.listNames.Schedules.name;
        curTaskRatedData.type = 'PATCH';
        curTaskRatedData.url = this.spService.getItemURL(this.constantsService.listNames.Schedules.name, taskDetail.taskID);
        batchURL.push(curTaskRatedData);
      }
    }
    return batchURL;
  }

  async getPreviousTasks(task) {
    let tasks = [];
    // let nextTaskFilter = '';
    let previousTaskFilter = '';
    // let nextTasks;
    let previousTasks;
    // let currentTaskNextTask = task.NextTasks;
    let currentTaskPrevTask = task.PrevTasks;

    if (task.ParentSlot) {
      const parentPreviousNextTask = Object.assign({}, this.dashbaordService.mydashboardComponent.previousNextTaskParent);
      parentPreviousNextTask.filter = parentPreviousNextTask.filter.replace('{{ParentSlotId}}', task.ParentSlot);
      this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasks');
      let parentTask = await this.spService.readItems(this.constantsService.listNames.Schedules.name, parentPreviousNextTask);
      parentTask = parentTask.length ? parentTask[0] : [];
      if (!currentTaskPrevTask) {
        currentTaskPrevTask = parentTask.PrevTasks;
      }
    }
    if (currentTaskPrevTask) {
      previousTasks = currentTaskPrevTask.split(';#');
      previousTasks.forEach((value, i) => {
        previousTaskFilter += '(Title eq \'' + value + '\')';
        previousTaskFilter += i < previousTasks.length - 1 ? ' or ' : '';
      });
    }

    const taskFilter = previousTaskFilter !== '' ? previousTaskFilter : '';

    if (!taskFilter) {
      return [];
    }
    const previousNextTask = Object.assign({}, this.dashbaordService.mydashboardComponent.previousNextTask);
    previousNextTask.filter = taskFilter;
    this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasksFromSchedules');
    const response = await this.spService.readItems(this.constantsService.listNames.Schedules.name, previousNextTask);

    tasks = response.length ? response : [];
    if (currentTaskPrevTask) {
      tasks.filter(c => !c.Rated && previousTasks.includes(c.Title)).map(c => c.TaskType = 'Previous Task');
    }

    let previousNextTaskChildRes = [];
    for (const ele of tasks) {
      if (ele.IsCentrallyAllocated === 'Yes') {
        let previousNextTaskChild: any = [];
        previousNextTaskChild = Object.assign({}, this.dashbaordService.mydashboardComponent.nextPreviousTaskChild);
        previousNextTaskChild.filter = previousNextTaskChild.filter.replace('{{ParentSlotId}}', ele.ID.toString());
        this.common.SetNewrelic('MyDashboardConstantService', 'MyDashboard', 'GetNextPreviousTasksFromParentSlot');
        let res: any = await this.spService.readItems(this.constantsService.listNames.Schedules.name, previousNextTaskChild);
        if (res.hasError) {
          this.messageService.add({ key: 'custom', severity: 'error', summary: 'Error Message', detail: res.message.value });
          return;
        }
        res = res.length ? res : [];
        const taskBreak = [];
        res.forEach(element => {
          if (ele.TaskType === 'Previous Task' && !ele.Rated) {
            if (!element.NextTasks) {
              element.TaskType = ele.TaskType;
              taskBreak.push(element);
            }
          }

        });
        if (!taskBreak.length) {
          previousNextTaskChildRes.push(ele);
        } else {
          previousNextTaskChildRes = previousNextTaskChildRes.concat(taskBreak);
        }

      } else if (ele.IsCentrallyAllocated === 'No') {
        previousNextTaskChildRes.push(ele);
      }
    }

    tasks = previousNextTaskChildRes.length ? previousNextTaskChildRes : tasks;
    tasks.map(c => c.StartDate = c.StartDate !== null ? this.datePipe.transform(c.StartDate, 'MMM d, y h:mm a') : '-');
    tasks.map(c => c.DueDate = c.DueDateDT !== null ? this.datePipe.transform(c.DueDateDT, 'MMM d, y h:mm a') : '-');

    return tasks;
  }

  /**
   * fetch previous tasks which are not rated
   *
   * @returns true if rated 'No' previous tasks of review task present
   */
  async getPrevTask(prevTasks) {
    const batchURL = [];
    prevTasks.forEach(element => {
      const prevTaskData = Object.assign({}, this.options);
      prevTaskData.url = this.spService.getReadURL(this.constantsService.listNames.Schedules.name,
        this.qmsConstant.feedbackPopupComponent.notRatedPrevTasks);
      prevTaskData.url = prevTaskData.url.replace('{{PrevTaskTitle}}', element);
      prevTaskData.listName = this.constantsService.listNames.Schedules.name;
      prevTaskData.type = 'GET';
      batchURL.push(prevTaskData);
    });
    this.common.SetNewrelic('QMS', 'ReviewDetails-View-Feedbackpopup', 'GetPreviousTasks');
    let arrResults = await this.spService.executeBatch(batchURL);
    arrResults = arrResults.length ? arrResults[0].retItems : [];
    const tasks = [].concat(...arrResults);
    return tasks;
  }
  /**
   * closing feedback popup and reset all entry
   *
   */
  closeFeedback(tasks) {
    this.scorecardTemplates.templates = [];
    tasks.forEach(task => {
      task.averageRating = 0;
      task.templateMatrix = [];
      task.selectedTemplate = {
        ID: 0 as number,
        Title: '' as string,
        tooltip: '' as string
      };
    });
    this.display = false;
  }

  cancel() {
    if (Object.keys(this.scorecardTasks.currentTask).length > 0) {
      this.popupClosed.emit(this.scorecardTasks.currentTask);
    }
    this.closeFeedback(this.scorecardTasks.tasks);
  }
  /**
   * Open modal dialog with large size
   *
   * @param content - content dispalyed within popup which is defined in HTML
   */
  async openPopup(tasks: any, reviewTask: {}) {
    this.showLoader();
    setTimeout(async () => {
      const previousTasks = [];
      this.display = true;
      this.scorecardTasks.currentTask = reviewTask;
      this.scorecardTemplates.templates = await this.getTemplates();
      for (const element of tasks) {
        const scorecard: IScorecard = {
          task: element.title ? element.title : element.taskTitle,
          milestone: element.milestone,
          submilestones: element.subMilestones,
          taskID: element.taskID,
          assignedToID: element.resourceID,
          assignedTo: element.resource,
          taskCompletionDate: element.taskCompletionDate,
          documentUrl: element.documentURL.length > 0 ? element.documentURL.join(';#') : '',
          reviewTaskDocUrl: element.reviewTaskDocUrl.length > 0 ? element.reviewTaskDocUrl.join(';#') : '',
          reviewTask: element.reviewTask ? element.reviewTask : '',
          feedbackComment: '',
          ignoreFeedback: false,
          selectedTemplate: {
            ID: 0 as number,
            Title: '' as string,
            tooltip: '' as string,
          },
          templateMatrix: [] as Array<{
            question: string,
            questionId: number,
            rating: number,
            tooltip: string
          }>,
          averageRating: 0,
        };
        previousTasks.push(scorecard);
      }
      this.scorecardTasks.tasks = [...previousTasks];
      this.showTable();
    }, 300);
    this.activeIndex = 0;
  }

  // #endregion ForRatingPopup
  showTable() {
    this.constantsService.loader.isPSInnerLoaderHidden = true;
    this.display = true;
  }

  showLoader() {
    this.display = false;
    this.constantsService.loader.isPSInnerLoaderHidden = false;
  }

  onIgnoreClicked(task, e) {
    e.originalEvent.stopPropagation();
    task.ignoreFeedback = e.checked;
  }
}
