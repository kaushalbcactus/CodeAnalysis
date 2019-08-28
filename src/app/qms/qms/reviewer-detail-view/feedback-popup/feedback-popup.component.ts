import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from '../../../../Services/constants.service';
import { GlobalService } from '../../../../Services/global.service';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { QMSConstantsService } from '../../services/qmsconstants.service';
declare var qmsFeedback: any;
@Component({
  selector: 'app-feedback-popup',
  templateUrl: './feedback-popup.component.html',
  styleUrls: ['./feedback-popup.component.css']
})
export class FeedbackPopupComponent implements OnInit {

  @Output() bindTableEvent = new EventEmitter<{}>();
  @Output() setSuccessMessage = new EventEmitter<{}>();
  @ViewChild('popupContent', {static: true}) popupContent: ElementRef;
  public popupByJS = false;
  public deliveryDashboardSharedObj = {};
  public hidePopupLoader = true;
  public hidePopupTable = false;
  display = false;
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  constructor(private spService: SPOperationService, private globalConstant: ConstantsService, private qmsConstant: QMSConstantsService,
              public global: GlobalService) {
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
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.ScorecardTemplate.name,
      feedbackComponent.getTemplates);
    this.global.templateMatrix.templates = arrResult.length > 0 ? arrResult : [];
  }

  /**
   * Get Template questions based on selected template
   *
   */
  async getTemplateMatrix() {
    const templateMatrix = [];
    const selectedTemplate = this.global.templateMatrix.selectedTemplate.Title;
    // tslint:disable-next-line

    const feedbackComponent =  JSON.parse(JSON.stringify(this.qmsConstant.feedbackPopupComponent));
    feedbackComponent.getTemplateMatrix.top = feedbackComponent.getTemplateMatrix.top.replace('{{TopCount}}', '' + 100);
    // tslint:disable: max-line-length
    feedbackComponent.getTemplateMatrix.filter = feedbackComponent.getTemplateMatrix.filter.replace('{{selectedTemplate}}', selectedTemplate);
    let arrResults = await this.spService.readItems(this.globalConstant.listNames.ScorecardMatrix.name, feedbackComponent.getTemplateMatrix);
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
    this.global.templateMatrix.selectedTemplateDetails = templateMatrix;
  }

  /**
   * Updates rating on global array of templates
   *
   */
  updateRating(ratingElement, rating) {
    let ratingTotal = 0;
    let averageRating = 0;
    const ratingCount = this.global.templateMatrix.selectedTemplateDetails.filter(r => r.rating !== 0).length;
    if (ratingCount > 0) {
      this.global.templateMatrix.selectedTemplateDetails.forEach(element => {
        if (element.question === ratingElement.question) {
          element.rating = rating;
        }
        ratingTotal = ratingTotal + element.rating;
      });
    }
    averageRating = ratingTotal / ratingCount;
    this.global.templateMatrix.averageRating = +averageRating.toFixed(2);
  }

  /**
   * Function to show loading while retireving data
   *
   */
  saveRatingFeedback() {
    this.showLoader();
    setTimeout(async () => {
      await this.save();
      this.showTable();
    }, 300);
  }

  /**
   * Save feedback rating details to sharepoint list // Scorecard, ScorecardRatings, Schedules
   *
   */
  async save() {
    let firstBatchURL = [];
    const taskDetails = this.global.templateMatrix;
    // Insert new scorecard item to scorecard list
    const firstPostRequestContent = this.addScorecardItem(taskDetails);
    // Insert Scorecard questions rating in scorecard rating list
    const scorecardMatrixContent = this.addScorecardMatrixItem(taskDetails);
    // form single array of object eg:- {'endPoint': endpoint, 'data': scorecardDetails, 'isPostMethod': true}
    firstBatchURL = [...firstPostRequestContent, ...scorecardMatrixContent];
    const items = await this.spService.executeBatch(firstBatchURL);
    if (items && items.length > 0) {
      // splitting scorecard item and scorecard rating items as 1 scorecoard item is created
      let scorecardItem = items.slice(0, 1);
      scorecardItem = scorecardItem.length > 0 ? scorecardItem[0].retItems : {};
      const scorecardRatingItems = items.slice(1);
      if (scorecardItem && scorecardRatingItems.length > 0) {
        let secondPostRequestContent = [];
        // Update schedules list item
        const schedulesPostRequest = await this.updateSchedulesList(taskDetails);
        // Update scorecardMatrix list item with scorecard lookup id
        const scorecardMatrixItem = this.updateScorecardMatrixItem(scorecardItem, scorecardRatingItems);
        secondPostRequestContent = [...schedulesPostRequest, ...scorecardMatrixItem];
        const result = await this.spService.executeBatch(secondPostRequestContent);
        if (result) {
          this.closeFeedback();
          if (taskDetails.reviewTask) {
            const taskIndex = this.global.oReviewerPendingTasks.findIndex(item => item.taskTitle === taskDetails.task);
            this.global.oReviewerPendingTasks.splice(taskIndex, 1);
            const reviewerPendingTasks = JSON.parse(JSON.stringify(this.global.oReviewerPendingTasks));
            this.bindTableEvent.emit(reviewerPendingTasks);
          } else {
            this.bindTableEvent.emit(taskDetails);
          }
          this.setSuccessMessage.emit({type: 'success', msg: 'Success', detail: 'Rating updated for ' + taskDetails.task + '!'});
        }
      }
  }
}

  /**
   * Adds item to scorecard list
   *
   */
  addScorecardItem(taskDetails) {
    const batchURL = [];
    let scorecardDetails = {};
    if (taskDetails.taskCompletionDate) {
      scorecardDetails = {
        __metadata: { type: this.globalConstant.listNames.Scorecard.type },
        Title: taskDetails.task,
        SubMilestones: taskDetails.submilestones,
        FeedbackType: 'Task Feedback',
        Comments: taskDetails.feedback,
        AverageRating: taskDetails.averageRating,
        AssignedToId: taskDetails.assignedToID,
        DocumentsUrl: taskDetails.documentUrl,
        ReviewerDocsUrl: taskDetails.reviewTaskDocUrl,
        TemplateName: taskDetails.selectedTemplate.Title,
        SubmissionDate: taskDetails.taskCompletionDate
      };
    } else {
      scorecardDetails = {
        __metadata: { type: this.globalConstant.listNames.Scorecard.type },
        Title: taskDetails.task,
        SubMilestones: taskDetails.submilestones,
        FeedbackType: 'Task Feedback',
        Comments: taskDetails.feedback,
        AverageRating: taskDetails.averageRating,
        AssignedToId: taskDetails.assignedToID,
        DocumentsUrl: taskDetails.documentUrl,
        ReviewerDocsUrl: taskDetails.reviewTaskDocUrl,
        TemplateName: taskDetails.selectedTemplate.Title
      };
    }
    const scorecardItemData = Object.assign({}, this.options);
    scorecardItemData.url = this.spService.getReadURL(this.globalConstant.listNames.Scorecard.name);
    scorecardItemData.listName = this.globalConstant.listNames.Scorecard.name;
    scorecardItemData.data = scorecardDetails;
    scorecardItemData.type = 'POST';
    batchURL.push(scorecardItemData);
    return batchURL;
  }

  /**
   * Adds item to scorecard matrix
   *
   */
  addScorecardMatrixItem(taskDetail) {
    const batchURL = [];
    taskDetail.selectedTemplateDetails.forEach(element => {
      const scorecardRatingDetails = {
        __metadata: { type: this.globalConstant.listNames.ScorecardRatings.type },
        Title: taskDetail.task,
        Rating: element.rating,
        ScorecardTemplateId: taskDetail.selectedTemplate.ID,
        ParameterId: element.questionId,
      };
      const scorecardRatingItemData = Object.assign({}, this.options);
      scorecardRatingItemData.url = this.spService.getReadURL(this.globalConstant.listNames.ScorecardRatings.name);
      scorecardRatingItemData.listName = this.globalConstant.listNames.ScorecardRatings.name;
      scorecardRatingItemData.data = scorecardRatingDetails;
      scorecardRatingItemData.type = 'POST';
      batchURL.push(scorecardRatingItemData);
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
        __metadata: { type: this.globalConstant.listNames.ScorecardRatings.type },
        ScorecardId: scorecardID
      };

      const revTaskData = Object.assign({}, this.options);
      revTaskData.data = scorecardRatingDetails;
      revTaskData.listName = this.globalConstant.listNames.ScorecardRatings.name;
      revTaskData.type = 'PATCH';
      revTaskData.url = this.spService.getItemURL(this.globalConstant.listNames.ScorecardRatings.name, element.retItems.ID);
      batchURL.push(revTaskData);
    });
    return batchURL;
  }

  /**
   * Updates schedules list item
   *
   */
  async updateSchedulesList(taskDetail) {
    // update review task - Rated column true if all previous tasks are rated.
    const batchURL = [];
    // check if update done by QMS_Admin group user or reviewer
    // This will execute for reviewer
    const prevTasks = taskDetail.reviewTask.PrevTasks ? taskDetail.reviewTask.PrevTasks.split(';#') : [];
    const tasksReviewPending = await this.getPreviousTasks(prevTasks);
    let updateIsRatedDetail = {};
    const reviewPreNextTasks = tasksReviewPending.length > 0 ? tasksReviewPending[0].NextTasks.split(';#') : [];
    // Update review task rated 'yes' if this is last previous task not rated
    if (tasksReviewPending.length <= 1 && taskDetail.reviewTask) {
      const reviewTaskUpdateDetail = {
        __metadata: { type: this.globalConstant.listNames.Schedules.type },
        IsRated: true // for review task
      };
      const revTaskData = Object.assign({}, this.options);
      revTaskData.data = reviewTaskUpdateDetail;
      revTaskData.listName = this.globalConstant.listNames.Schedules.name;
      revTaskData.type = 'PATCH';
      revTaskData.url = this.spService.getItemURL(this.globalConstant.listNames.Schedules.name, taskDetail.reviewTask.ID);
      batchURL.push(revTaskData);
    }
    if (prevTasks.length > 1 || reviewPreNextTasks.length > 1) {
      const taskUpdateDetail = {
        __metadata: { type: this.globalConstant.listNames.Schedules.type },
        Rated: true, // for previous task
        // IsRated: true // for review task
      };
      // Update previous task of review task as Rated 'yes'
      const curTaskData = Object.assign({}, this.options);
      curTaskData.data = taskUpdateDetail;
      curTaskData.listName = this.globalConstant.listNames.Schedules.name;
      curTaskData.type = 'PATCH';
      curTaskData.url = this.spService.getItemURL(this.globalConstant.listNames.Schedules.name, taskDetail.taskID);
      batchURL.push(curTaskData);
      // below if will execute for admin view since review task will be '' for admin
    } else if (prevTasks.length === 1 && taskDetail.reviewTask) {
      updateIsRatedDetail = {
        __metadata: { type: this.globalConstant.listNames.Schedules.type },
         Rated: true,
        // IsRated: true
      };
    } else if (!taskDetail.reviewTask) {
      /// Below will be updated for Admin users
      updateIsRatedDetail = {
        __metadata: { type: this.globalConstant.listNames.Schedules.type },
        Rated: true
      };
    }
    // Update previous task of review task as Rated 'yes'
    const curTaskRatedData = Object.assign({}, this.options);
    curTaskRatedData.data = updateIsRatedDetail;
    curTaskRatedData.listName = this.globalConstant.listNames.Schedules.name;
    curTaskRatedData.type = 'PATCH';
    curTaskRatedData.url = this.spService.getItemURL(this.globalConstant.listNames.Schedules.name, taskDetail.taskID);
    batchURL.push(curTaskRatedData);
    return batchURL;
  }

  /**
   * fetch previous tasks which are not rated
   *
   * @returns true if rated 'No' previous tasks of review task present
   */
  async getPreviousTasks(prevTasks) {
    const batchURL = [];
    prevTasks.forEach(element => {
      const prevTaskData = Object.assign({}, this.options);
      prevTaskData.url = this.spService.getReadURL(this.globalConstant.listNames.Schedules.name,
        this.qmsConstant.feedbackPopupComponent.notRatedPrevTasks);
      prevTaskData.url = prevTaskData.url.replace('{{PrevTaskTitle}}', element);
      prevTaskData.listName = this.globalConstant.listNames.Schedules.name;
      prevTaskData.type = 'GET';
      batchURL.push(prevTaskData);
    });
    let arrResults = await this.spService.executeBatch(batchURL);
    arrResults = arrResults.length ? arrResults[0].retItems : [];
    const tasks = [].concat(...arrResults);
    return tasks;
  }
  /**
   * closing feedback popup and reset all entry
   *
   */
  closeFeedback() {
    if (this.popupByJS) {
      qmsFeedback.complete(this.deliveryDashboardSharedObj);
    } else {
      this.global.templateMatrix = JSON.parse(JSON.stringify(this.global.templateMatrix_copy));
      // this.modalService.dismissAll();
      this.display = false;
    }
  }

  /**
   * Open modal dialog with large size
   *
   * @param content - content dispalyed within popup which is defined in HTML
   */
  openPopup(element: any) {
    this.display = true;
    this.popupByJS = false;
    this.getTemplates();
    this.global.templateMatrix.task = element.taskTitle;
    this.global.templateMatrix.submilestones = element.subMilestones;
    this.global.templateMatrix.taskID = element.taskID;
    this.global.templateMatrix.assignedToID = element.resourceID;
    this.global.templateMatrix.assignedTo = element.resource;
    this.global.templateMatrix.taskCompletionDate = element.taskCompletionDate;
    this.global.templateMatrix.documentUrl = element.documentURL.length > 0 ? element.documentURL.join(';#') : '';
    this.global.templateMatrix.reviewTaskDocUrl = element.reviewTaskDocUrl.length > 0 ?
                                                  element.reviewTaskDocUrl.join(';#') : '';
    this.global.templateMatrix.reviewTask = element.reviewTask ? element.reviewTask : '';
  }

  // // /**
  // //  * Open modal dialog with large size with external JS
  // //  *
  // //  * @param  content - content dispalyed within popup which is defined in HTML
  // //  */
  // openPopupByJS(element: any) {
  //   this.popupByJS = true;
  //   this.deliveryDashboardSharedObj = element;
  //   this.getTemplates();
  //   this.global.templateMatrix.task = element.taskTitle;
  //   this.global.templateMatrix.submilestones = element.subMilestones;
  //   this.global.templateMatrix.taskID = element.taskID;
  //   this.global.templateMatrix.assignedToID = element.resourceID;
  //   this.global.templateMatrix.assignedTo = element.resource;
  //   this.global.templateMatrix.taskCompletionDate = element.taskCompletionDate;
  //   this.global.templateMatrix.documentUrl = element.documentURL.length > 0 ? element.documentURL.map(a => a.url).join(';#') : '';
  //   this.global.templateMatrix.reviewTaskDocUrl = element.reviewTaskDocUrl.length > 0 ?
  //                                                 element.reviewTaskDocUrl.map(a => a.url).join(';#') : '';
  //   this.global.templateMatrix.reviewTask = element.reviewTask;
  // }
// #endregion ForRatingPopup
  showTable() {
    this.hidePopupTable = false;
    this.hidePopupLoader = true;
  }

  showLoader() {
    this.hidePopupTable = true;
    this.hidePopupLoader = false;
  }
}
