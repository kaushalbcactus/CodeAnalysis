import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
// import { SharepointOperationService } from '../../Services/sharepoint-operation.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { RatingModule } from 'primeng/primeng';
// import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';


declare var $: any;
declare var qmsFeedback: any;
@Component({
  selector: 'app-feedback-popup',
  templateUrl: './feedback-popup.component.html',
  styleUrls: ['./feedback-popup.component.css']
})
export class FeedbackPopupComponent implements OnInit {

  @Output() bindTableEvent = new EventEmitter<{}>();
  @Output() setSuccessMessage = new EventEmitter<string>();
  @ViewChild('popupContent', { static: true }) popupContent: ElementRef;
  public popupByJS = false;
  public deliveryDashboardSharedObj = {};
  public constantFeedbackComponent = this.constant.feedbackPopupComponent;
  public hidePopupLoader = true;
  public hidePopupTable = false;
  constructor(private spService: SharepointoperationService, private constant: ConstantsService,
    public global: GlobalService, private modalService: NgbModal, config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit() {
  }
  //#region ForRatingPopup

  /**
   * Get active scorecard templates on click of provide rating button
   *
   * @memberof ReviewerDetailViewComponent
   */
  getTemplates() {
    const batchGuid = this.spService.generateUUID();
    const batchContents = new Array();
    const templateUrl = this.constantFeedbackComponent.getTemplates.replace('{{TopCount}}', '' + 100);
    this.spService.getBatchBodyGet(batchContents, batchGuid, templateUrl);
    batchContents.push('--batch_' + batchGuid + '--');
    const sBatchData = batchContents.join('\r\n');
    const arrResults = this.spService.executeBatchRequest(batchGuid, sBatchData);
    this.global.templateMatrix.templates = arrResults.length > 0 ? arrResults[0] : [];
  }

  /**
   * Get Template questions based on selected template
   *
   * @memberof ReviewerDetailViewComponent
   */
  getTemplateMatrix() {
    const templateMatrix = [];
    const batchGuid = this.spService.generateUUID();
    const batchContents = new Array();
    const selectedTemplate = this.global.templateMatrix.selectedTemplate.Title;
    // tslint:disable-next-line
    const templateUrl = this.constantFeedbackComponent.getTemplateMatrix.replace('{{selectedTemplate}}', selectedTemplate).replace('{{TopCount}}', '' + 100);
    this.spService.getBatchBodyGet(batchContents, batchGuid, templateUrl);
    batchContents.push('--batch_' + batchGuid + '--');
    const sBatchData = batchContents.join('\r\n');
    let arrResults = this.spService.executeBatchRequest(batchGuid, sBatchData);
    arrResults = arrResults.length > 0 ? arrResults[0] : [];
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
   * @memberof ReviewerDetailViewComponent
   */
  updateRating(ratingElement, rating) {
    let ratingTotal = 0;
    let averageRating = 0;
    const ratingCount = this.global.templateMatrix.selectedTemplateDetails.filter(r => r.rating !== 0).length;
    if (ratingCount > 0) {
      this.global.templateMatrix.selectedTemplateDetails.forEach(element => {
        if (element.question === ratingElement.question) {
          element.rating = rating.value;
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
   * @memberof FeedbackPopupComponent
   */
  saveRatingFeedback() {
    this.showLoader();
    setTimeout(() => {
      this.save();
      this.showTable();
    }, 300);
  }

  /**
   * Save feedback rating details to sharepoint list // Scorecard, ScorecardRatings, Schedules
   *
   * @memberof FeedbackPopupComponent
   */
  save() {
    let firstPostRequestContent = [];
    const scorecardList = this.constant.listNames.Scorecard.name;
    const scorecardRatingsList = this.constant.listNames.ScorecardRatings.name;
    const taskDetails = this.global.templateMatrix;
    // Insert new scorecard item to scorecard list
    firstPostRequestContent.push(this.addScorecardItem(taskDetails));
    // Insert Scorecard questions rating in scorecard rating list
    const scorecardMatrixContent = this.addScorecardMatrixItem(taskDetails);
    // form single array of object eg:- {'endPoint': endpoint, 'data': scorecardDetails, 'isPostMethod': true}
    firstPostRequestContent = [...firstPostRequestContent, ...scorecardMatrixContent];
    const items = this.spService.executePostPatchRequest(firstPostRequestContent);
    if (items && items.length > 0) {
      // splitting scorecard item and scorecard rating items as 1 scorecoard item is created
      let scorecardItem = items.slice(0, 1);
      scorecardItem = scorecardItem.length > 0 ? scorecardItem[0] : {};
      const scorecardRatingItems = items.slice(1);
      if (scorecardItem && scorecardRatingItems.length > 0) {
        let secondPostRequestContent = [];
        // Move scorecardItem to current month folder
        secondPostRequestContent.push(this.spService.moveListItem(scorecardItem, scorecardList));
        scorecardRatingItems.forEach(element => {
          // Move scorecard Matrix to current month folder
          secondPostRequestContent.push(this.spService.moveListItem(element, scorecardRatingsList));
        });
        // Update schedules list item
        const schedulesPostRequest = this.updateSchedulesList(taskDetails);
        secondPostRequestContent = [...secondPostRequestContent, ...schedulesPostRequest];
        // Update scorecardMatrix list item with scorecard lookup id
        const scorecardMatrixItem = this.updateScorecardMatrixItem(scorecardItem, scorecardRatingItems);
        secondPostRequestContent = [...secondPostRequestContent, ...scorecardMatrixItem];
        const result = this.spService.executePostPatchRequest(secondPostRequestContent);
        if (result) {
          this.closeFeedback();
          if (this.popupByJS) {
            qmsFeedback.complete(this.deliveryDashboardSharedObj);
          } else if (taskDetails.reviewTask) {
            const taskIndex = this.global.oReviewerPendingTasks.findIndex(item => item.taskTitle === taskDetails.task);
            this.global.oReviewerPendingTasks.splice(taskIndex, 1);
            const reviewerPendingTasks = $.extend(true, [], this.global.oReviewerPendingTasks);
            this.bindTableEvent.emit(reviewerPendingTasks);
            this.setSuccessMessage.emit('Rating updated for ' + taskDetails.task + '!');
          } else {
            this.bindTableEvent.emit(taskDetails);
            this.setSuccessMessage.emit('Rating updated for ' + taskDetails.task + '!');
          }
        }
      }
    }
  }

  /**
   * Adds item to scorecard list
   *
   * @param {*} taskDetails
   * @returns
   * @memberof ReviewerDetailViewComponent
   */
  addScorecardItem(taskDetails) {
    let scorecardDetails = {};
    if (taskDetails.taskCompletionDate) {
      scorecardDetails = {
        __metadata: { type: this.constant.listNames.Scorecard.type },
        Title: taskDetails.task,
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
        __metadata: { type: this.constant.listNames.Scorecard.type },
        Title: taskDetails.task,
        FeedbackType: 'Task Feedback',
        Comments: taskDetails.feedback,
        AverageRating: taskDetails.averageRating,
        AssignedToId: taskDetails.assignedToID,
        DocumentsUrl: taskDetails.documentUrl,
        ReviewerDocsUrl: taskDetails.reviewTaskDocUrl,
        TemplateName: taskDetails.selectedTemplate.Title
      };
    }
    const endpoint = this.constant.feedbackPopupComponent.addScorecardItem;
    return ({ 'endPoint': endpoint, 'data': scorecardDetails, 'isPostMethod': true });
  }

  /**
   * Adds item to scorecard matrix
   *
   * @param {*} scorecard
   * @param {*} taskDetail
   * @returns Data to be pushed for execution in POST request
   * @memberof ReviewerDetailViewComponent
   */
  addScorecardMatrixItem(taskDetail) {
    const scorecardRatingData = [];
    taskDetail.selectedTemplateDetails.forEach(element => {
      const scorecardRatingDetails = {
        __metadata: { type: this.constant.listNames.ScorecardRatings.type },
        Title: taskDetail.task,
        Rating: element.rating,
        ScorecardTemplateId: taskDetail.selectedTemplate.ID,
        ParameterId: element.questionId,
      };
      const endpoint = this.constant.feedbackPopupComponent.addScorecardRatingItem;
      scorecardRatingData.push({ 'endPoint': endpoint, 'data': scorecardRatingDetails, 'isPostMethod': true });
    });
    return scorecardRatingData;
  }

  /**
   * update item of scorecard matrix
   *
   * @param {*} taskDetail
   * @returns Data to be pushed for execution in POST request
   * @memberof ReviewerDetailViewComponent
   */
  updateScorecardMatrixItem(scorecardItem, scorecardRatingItems) {
    const scorecardID = scorecardItem.ID;
    const scorecardRatingData = [];
    scorecardRatingItems.forEach(element => {
      const scorecardRatingDetails = {
        __metadata: { type: this.constant.listNames.ScorecardRatings.type },
        ScorecardId: scorecardID
      };
      const endpoint = this.constant.feedbackPopupComponent.updateScorecardRatingItem.replace('{{ID}}', element.ID);
      scorecardRatingData.push({ 'endPoint': endpoint, 'data': scorecardRatingDetails, 'isPostMethod': false });
    });
    return scorecardRatingData;
  }

  /**
   * Updates schedules list item
   *
   * @param {*} taskDetail
   * @returns Data to be pushed for execution in POST request
   * @memberof ReviewerDetailViewComponent
   */
  updateSchedulesList(taskDetail) {
    // update review task - Rated column true if all previous tasks are rated.
    const arrUpdateBody = [];
    // check if update done by QMS_Admin group user or reviewer
    // This will execute for reviewer
    const prevTasks = taskDetail.reviewTask.PrevTasks ? taskDetail.reviewTask.PrevTasks.split(';#') : [];
    const tasksReviewPending = this.getPreviousTasks(prevTasks);
    let updateIsRatedDetail = {};
    const taskUpdateDetail = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      Rated: true,
      IsRated: true
    };
    const reviewPreNextTasks = tasksReviewPending.length > 0 ? tasksReviewPending[0].NextTasks.split(';#') : [];
    // Update review task rated 'yes' if this is last previous task not rated
    if (tasksReviewPending.length <= 1 && taskDetail.reviewTask) {
      const endpoint = this.constant.feedbackPopupComponent.updateSchedulesListItem.replace('{{ID}}', taskDetail.reviewTask.ID);
      arrUpdateBody.push({ 'endPoint': endpoint, 'data': taskUpdateDetail, 'isPostMethod': false });
    }
    if (prevTasks.length > 1 || reviewPreNextTasks.length > 1) {
      // Update previous task of review task as Rated 'yes'
      const prevTaskEndpoint = this.constant.feedbackPopupComponent.updateSchedulesListItem.replace('{{ID}}', taskDetail.taskID);
      arrUpdateBody.push({ 'endPoint': prevTaskEndpoint, 'data': taskUpdateDetail, 'isPostMethod': false });
      // below if will execute for admin view since review task will be '' for admin
    } else if (prevTasks.length === 1 && taskDetail.reviewTask) {
      updateIsRatedDetail = {
        __metadata: { type: this.constant.listNames.Schedules.type },
        Rated: true,
        IsRated: true
      };
    } else if (!taskDetail.reviewTask) {
      /// Below will be updated for Admin users
      updateIsRatedDetail = {
        __metadata: { type: this.constant.listNames.Schedules.type },
        IsRated: true
      };
    }
    // Update previous task of review task as Rated 'yes'
    const taskEndpoint = this.constant.feedbackPopupComponent.updateSchedulesListItem.replace('{{ID}}', taskDetail.taskID);
    arrUpdateBody.push({ 'endPoint': taskEndpoint, 'data': updateIsRatedDetail, 'isPostMethod': false });
    return (arrUpdateBody);
  }

  /**
   * fetch previous tasks which are not rated
   *
   * @param {*} taskDetail
   * @returns true if rated 'No' previous tasks of review task present
   * @memberof FeedbackPopupComponent
   */
  getPreviousTasks(prevTasks) {
    const batchGuid = this.spService.generateUUID();
    let batchContents = new Array();
    // tslint:disable-next-line
    prevTasks.forEach(element => {
      const taskUrl = this.constant.feedbackPopupComponent.notRatedPrevTasks.replace('{{PrevTaskTitle}}', element);
      batchContents = this.spService.getBatchBodyGet(batchContents, batchGuid, taskUrl);
    });
    batchContents.push('--batch_' + batchGuid + '--');
    const sBatchData = batchContents.join('\r\n');
    const arrResults = this.spService.executeBatchRequest(batchGuid, sBatchData);
    const tasks = [].concat(...arrResults);
    return tasks;
  }
  /**
   * closing feedback popup and reset all entry
   *
   * @memberof ReviewerDetailViewComponent
   */
  closeFeedback() {
    if (this.popupByJS) {
      qmsFeedback.complete(this.deliveryDashboardSharedObj);
    } else {
      this.global.templateMatrix = $.extend(true, {}, this.global.templateMatrix_copy);
      this.modalService.dismissAll();
    }
  }

  /**
   * Open modal dialog with large size
   *
   * @param {*} content - content dispalyed within popup which is defined in HTML
   * @memberof ReviewerDetailViewComponent
   */
   public openPopup(element: any) {
    this.popupByJS = false;
    this.getTemplates();
    this.global.templateMatrix.task = element.taskTitle;
    this.global.templateMatrix.taskID = element.taskID;
    this.global.templateMatrix.assignedToID = element.resourceID;
    this.global.templateMatrix.assignedTo = element.resource;
    this.global.templateMatrix.taskCompletionDate = element.taskCompletionDate;
    this.global.templateMatrix.documentUrl = element.documentURL.length > 0 ? element.documentURL.join(';#') : '';
    this.global.templateMatrix.reviewTaskDocUrl = element.reviewTaskDocUrl.length > 0 ?
      element.reviewTaskDocUrl.join(';#') : '';
    this.global.templateMatrix.reviewTask = element.reviewTask ? element.reviewTask : '';
    this.modalService.open(this.popupContent, { size: 'lg' });
  }

  /**
   * Open modal dialog with large size with external JS
   *
   * @param {*} content - content dispalyed within popup which is defined in HTML
   * @memberof ReviewerDetailViewComponent
   */
  openPopupByJS(element: any) {
    this.popupByJS = true;
    this.deliveryDashboardSharedObj = element;
    this.getTemplates();
    this.global.templateMatrix.task = element.taskTitle;
    this.global.templateMatrix.taskID = element.taskID;
    this.global.templateMatrix.assignedToID = element.resourceID;
    this.global.templateMatrix.assignedTo = element.resource;
    this.global.templateMatrix.taskCompletionDate = element.taskCompletionDate;
    this.global.templateMatrix.documentUrl = element.documentURL.length > 0 ? element.documentURL.map(a => a.url).join(';#') : '';
    this.global.templateMatrix.reviewTaskDocUrl = element.reviewTaskDocUrl.length > 0 ?
      element.reviewTaskDocUrl.map(a => a.url).join(';#') : '';
    this.global.templateMatrix.reviewTask = element.reviewTask;
    this.modalService.open(this.popupContent, { size: 'lg' });
  }
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
