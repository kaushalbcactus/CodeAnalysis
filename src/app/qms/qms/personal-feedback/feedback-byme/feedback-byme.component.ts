import { ConstantsService } from 'src/app/Services/constants.service';
import { QMSConstantsService } from 'src/app/qms/qms/services/qmsconstants.service';
import { Component, OnInit, ViewChild, OnDestroy, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { GlobalService } from '../../../../Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Router, NavigationEnd } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { QMSCommonService } from '../../services/qmscommon.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-feedback-byme',
  templateUrl: './feedback-byme.component.html',
  styleUrls: ['./feedback-byme.component.css']
})
export class FeedbackBymeComponent implements OnInit, OnDestroy {
  public feedbackByMeNavSubscription;
  feedbackColumns = [];
  feedbackRows = [];
  FBColArray = {
    Date: [],
    Task: [],
    Type: [],
    Feedbackfor: [],
    Rating: [],
    Comments: [],
    FeedbackBy: []
  };
  private filterObj = {};
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  public hideTable = false;
  public hideLoader = true;
  public hideDetail = false;
  ref;
  @ViewChild('fb', { static: true }) fb;
  @ViewChild('fb', { static: false }) feedbackbymeTable;
  constructor(
    private datepipe: DatePipe,
    private globalConstant: ConstantsService,
    private qmsConstant: QMSConstantsService,
    private router: Router,
    private spService: SPOperationService,
    public global: GlobalService,
    public data: DataService,
    private qmsCommon: QMSCommonService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    // private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // }
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    this.feedbackByMeNavSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });
    // _router.events.subscribe((uri) => {
    //   zone.run(() => _applicationRef.tick());
    // });

  }

  ngOnInit() {
    this.qmsCommon.selectedComponent = this;
    this.initialiseFeedback();
  }

  protected async initialiseFeedback() {
    this.feedbackColumns = [
      { field: 'Date', header: 'Date', visibility: false, Type: 'datetime', dbName: 'Created', options: [] },
      { field: 'Task', header: 'Task', visibility: false, Type: 'string', dbName: 'Title', options: [] },
      { field: 'Type', header: 'Type', visibility: false, Type: 'string', dbName: 'FeedbackType', options: [] },
      { field: 'Feedbackfor', header: 'Feedback For', visibility: false, Type: 'string', dbName: 'AssignedTo.Title', options: [] },
      { field: 'FeedbackBy', header: 'Feedback By', visibility: true, Type: 'string', dbName: 'FeedbackBy', options: [] },
      { field: 'Rating', header: 'Rating', visibility: false, Type: 'number', dbName: 'AverageRating', options: [] },
      { field: 'Comments', header: 'Comments', visibility: false, Type: 'string', dbName: 'Comments', options: [] },
      { field: 'Parameters', header: 'Parameters', visibility: true, Type: 'string', dbName: 'Parameters', options: [] },
      { field: 'Score', header: 'Score', visibility: true, Type: 'string', dbName: 'Score', options: [] }
    ];
    this.hideDetail = false;
    this.feedbackRows = [];
    this.showLoader();
    setTimeout(async () => {
      this.data.filterObj.subscribe(filter => this.filterObj = filter);
      this.applyFilters(this.filterObj);
    }, 500);
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.feedbackByMeNavSubscription) {
      this.feedbackByMeNavSubscription.unsubscribe();
    }
  }

  // colFilters(colData) {
  //   // tslint:disable: max-line-length
  //   this.FBColArray.Date = this.qmsCommon.uniqueArrayObj(colData.map(a => {
  //     const b = {
  //       label: this.datepipe.transform(a.Created, 'MMM d, yyyy'),
  //       value: a.Created ? new Date(this.datepipe.transform(a.Created, 'MMM d, yyyy')) : '',
  //       filterValue: new Date(a.Created)
  //     }; return b;
  //   }));
  //   this.FBColArray.Task = this.FBColArray.Task = this.qmsCommon.uniqueArrayObj(colData.map(a => {
  //     const b = {
  //       label: a.Title ? a.SubMilestones ? a.Title + ' - ' + a.SubMilestones : a.Title : '',
  //       value: a.Title ? a.SubMilestones ? a.Title + ' - ' + a.SubMilestones : a.Title : '',
  //       filterValue: a.Title
  //     };
  //     return b;
  //   }));
  //   this.FBColArray.Type = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.FeedbackType, value: a.FeedbackType, filterValue: a.FeedbackType }; return b; }));
  //   this.FBColArray.Feedbackfor = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.AssignedTo.Title, value: a.AssignedTo.Title, filterValue: a.AssignedTo.Title }; return b; }));
  //   this.FBColArray.FeedbackBy = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Author.Title, value: a.Author.Title, filterValue: a.Author.Title }; return b; }));
  //   this.FBColArray.Rating = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.AverageRating, value: a.AverageRating, filterValue: +a.AverageRating }; return b; }));
  //   this.FBColArray.Comments = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.CommentsMT, value: a.CommentsMT, filterValue: a.CommentsMT }; return b; }));
  // }

  downloadExcel(fb) {
    fb.exportFilename = this.feedbackRows.length > 0 ? this.feedbackRows[0].Feedbackfor + '-Feedback' : 'Feedback';
    fb.exportCSV();
  }

  /**
   * Get scorecard list items based on parameter passed
   *
   */
  async getScorecardItems(topCount, startDate, endDate, assignedToID) {
    // 1st  REST API request
    let batchURL = [];
    let i = 0;
    let tempScorecardData = [];
    // REST API url in contants file
    // const previousYear = new Date().getFullYear() - 2;
    startDate = startDate ? startDate : new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();

    const personalFeedbackComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.FeebackByMe));
    const getScorecardUrl = assignedToID ? JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.FeebackByMe.getResourceScorecard)) :
      JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.FeebackByMe.getScorecardByMe));
    getScorecardUrl.top = getScorecardUrl.top.replace('{{TopCount}}', topCount);
    getScorecardUrl.filter = assignedToID ? getScorecardUrl.filter.replace('{{AssignedTo}}', assignedToID) : getScorecardUrl.filter;
    getScorecardUrl.filter = getScorecardUrl.filter.replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    getScorecardUrl.filter = topCount < 4500 ?
      // tslint:disable-next-line: quotemark
      getScorecardUrl.filter.replace("{{FeedbackTypeFilter}}", "and FeedbackType eq '" + this.globalConstant.FeedbackType.taskRating + "'") :
      getScorecardUrl.filter.replace('{{FeedbackTypeFilter}}', '');
    this.commonService.SetNewrelic('QMS', 'personalfeedback-feedbackbyme', 'readItems-getScorecardItems', "GET");
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.Scorecard.name, getScorecardUrl);
    // If Last.. Filter used then fetch top Task Feedback only ( Rating) and Qualitative feedback based on rating item dates
    const arrScoreCards = arrResult.length > 0 ? arrResult : [];
    // 2nd REST API request
    // Get parameter of scorecard rating
    for (const scoreCard of arrScoreCards) {
      // 1st Query
      const getRatingData = Object.assign({}, this.options);
      getRatingData.url = this.spService.getReadURL(this.globalConstant.listNames.ScorecardRatings.name, personalFeedbackComponent.getRatings);
      getRatingData.url = getRatingData.url.replace('{{ID}}', scoreCard.ID);
      getRatingData.listName = this.globalConstant.listNames.ProjectInformation.name;
      getRatingData.type = 'GET';
      batchURL.push(getRatingData);
      i++;
      if (i % 100 === 0) {
        let bresult = await this.spService.executeBatch(batchURL);
        tempScorecardData = [...tempScorecardData, ...bresult];
        batchURL = [];
      }
    }

    // Fetch Qualitative feedback if filter is based on Last 10,20,... or it will fetch in date range filter itself
    if (topCount < 4500) {
      const past3MonthDate = new Date();
      past3MonthDate.setMonth(new Date().getMonth() - 3);
      const qfStartDate = arrScoreCards.length > 0 ? arrScoreCards[arrScoreCards.length - 1].Created :
        new Date(past3MonthDate.setHours(0, 0, 0, 1)).toISOString();
      const qfEndDate = new Date(new Date().setHours(23, 59, 59, 59)).toISOString();
      // 2nd Query
      const getScorecardData = Object.assign({}, this.options);
      const getScUrl = assignedToID ? JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.FeebackByMe.getResourceScorecard)) :
        JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.FeebackByMe.getScorecardByMe));
      getScorecardData.url = this.spService.getReadURL(this.globalConstant.listNames.Scorecard.name, getScUrl);
      getScorecardData.url = assignedToID ? getScorecardData.url.replace('{{AssignedTo}}', assignedToID) : getScorecardData.url;
      getScorecardData.url = getScorecardData.url
        .replace('{{TopCount}}', '4500')
        .replace('{{startDate}}', qfStartDate)
        .replace('{{endDate}}', qfEndDate)
        .replace('{{FeedbackTypeFilter}}', "and FeedbackType eq '" + this.globalConstant.FeedbackType.qualitative + "'");
      getScorecardData.listName = this.globalConstant.listNames.Scorecard.name;
      getScorecardData.type = 'GET';
      batchURL.push(getScorecardData);
    }
    this.commonService.SetNewrelic('QMS', 'personalfeedback-feedbackbyme', 'getScorecardItems', "GET-BATCH");
    let tempArrRatings = await this.spService.executeBatch(batchURL);
    tempArrRatings = tempArrRatings.length > 0 ? tempArrRatings : [];
    const arrRatings = [...tempScorecardData, ...tempArrRatings];
    for (const i in arrRatings) {
      // Feedback Type condition is added to avoid execution of below statement on Qualitative feedback
      if (arrRatings.hasOwnProperty(i)) {
        if (arrRatings[i].retItems.length > 0 && arrRatings[i].retItems[0].FeedbackType === this.globalConstant.FeedbackType.qualitative) {
          arrRatings[i].retItems.forEach(element => {
            arrScoreCards.push(element);
          });
        } else if (arrScoreCards[i]) {
          arrScoreCards[i].ParameterRating = '';
          arrScoreCards[i].Value = '';
          arrScoreCards[i].parameters = [];
          arrRatings[i].retItems.forEach(elem => {
            arrScoreCards[i].ParameterRating = arrScoreCards[i].ParameterRating + elem.Parameter.Title + '\n';
            arrScoreCards[i].Value = arrScoreCards[i].Value + elem.Rating + '\n';
            arrScoreCards[i].parameters.push({ property: elem.Parameter.Title, value: elem.Rating });
          });
        }
      }
    }
    arrScoreCards.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());
    return arrScoreCards;
  }

  /**
   * Table binding function
   *
   * @param  arrScoreCards - array of objects
   */
  bindTable(arrScoreCards) {
    this.feedbackRows = [];
    arrScoreCards.forEach(element => {
      this.feedbackRows.push({
        Id: element.Id,
        ID: element.ID,
        SubmissionDate: element.SubmissionDate ? element.SubmissionDate : '',
        FeedbackType: element.FeedbackType ? element.FeedbackType : '',
        DocumentsUrl: element.DocumentsUrl,
        Feedbackfor: element.AssignedTo.Title ? element.AssignedTo.Title : '',
        FeedbackBy: element.Author.Title ? element.Author.Title : '',
        Date: element.Created ? new Date(this.datepipe.transform(element.Created, 'MMM d, yyyy')) : '',
        SubMilestones: element.SubMilestones ? element.SubMilestones : '',
        Author: element.Author,
        AverageRating: element.AverageRatingNM,
        Created: element.Created ? new Date(this.datepipe.transform(element.Created, 'MMM d, yyyy')) : '',
        Task: element.Title ? element.SubMilestones ? element.Title + ' - ' + element.SubMilestones : element.Title : '',
        Title: element.Title ? element.Title : '',
        AssignedTo: element.AssignedTo ? element.AssignedTo : '',
        Type: element.FeedbackType,
        Feedbackby: element.Author.Title,
        Rating: element.AverageRatingNM ? element.AverageRatingNM : '',
        Comments: element.CommentsMT ? element.CommentsMT : '',
        Parameters: element.ParameterRating ? element.ParameterRating : '',
        Score: element.Value ? element.Value : '',
        ParameterRatings: element.parameters ? element.parameters : []
      });
    });
    this.ref = this.fb;
  }

  /**
   * Apply filter based on filter object received
   *
   * @param  filterObj - Emitted  from filter component => Internal => UserFeedbackComponent
   *
   */
  async applyFilters(filterObj) {
    this.showLoader();
    setTimeout(async () => {
      let arrScorecard = [];
      const resourceID = filterObj.clickedResourceID ? filterObj.clickedResourceID : null;
      if (resourceID) {
        const feedbackbyCol = this.feedbackColumns.find(r => r.field === 'FeedbackBy');
        const feedbackforCol = this.feedbackColumns.find(r => r.field === 'Feedbackfor');
        feedbackforCol.visibility = true;
        feedbackbyCol.visibility = false;
      }
      if (filterObj.isDateFilter) {
        const startDate = new Date(filterObj.startDate).toISOString();
        const endDate = new Date(filterObj.endDate).toISOString();
        arrScorecard = await this.getScorecardItems(4500, startDate, endDate, resourceID);
      } else {
        arrScorecard = await this.getScorecardItems(filterObj.count, '', '', resourceID);
      }
      this.bindTable(arrScorecard);
      this.feedbackColumns = this.commonService.MainfilterForTable(this.feedbackColumns, arrScorecard);
      // this.colFilters(arrScorecard);
      this.showTable();
    }, 500);

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
    if (this.feedbackRows.length && this.isOptionFilter) {
      let obj = {
        tableData: this.feedbackbymeTable,
        colFields: this.FBColArray
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.feedbackColumns = this.commonService.MainfilterForTable(this.feedbackColumns,obj.tableData)
        // this.colFilters(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }
  showOverlayPanel(event, rowData, ratingOP, target?) {
    ratingOP.showOverlay(event, rowData, target);
  }
}
