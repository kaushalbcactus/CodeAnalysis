import { Component, OnInit, ViewChild, Output, EventEmitter, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { SPOperationService } from '../../../Services/spoperation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { CommonService } from '../../../Services/common.service';
import { DatePipe } from '@angular/common';
import { QMSConstantsService } from '../services/qmsconstants.service';
import { QMSCommonService } from '../services/qmscommon.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.css']
})
export class UserFeedbackComponent implements OnInit, AfterViewChecked {
  // Initialize for sort
  UFColumns: any[];
  UFRows: any = [];
  originalScorecard = [];
  ref;
  // @ViewChild('uf', { static: false }) uf: Table;
  @Output() setAverageRating = new EventEmitter<string>();
  @Output() feedbackData = new EventEmitter<any>();
  @ViewChild('uf', { static: false }) userFeedbackTable: Table;

  isOptionFilter: boolean;
  public hideTable = false;
  public hideLoader = true;
  UFColArray = {
    Date: [],
    Task: [],
    Type: [],
    Feedbackby: [],
    EvaluatorSkill: [],
    Rating: [],
    Comments: []
  };

  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  // Initialize columns for table
  // tslint:disable-next-line
  public displayedColumns: string[] = ['Created', 'Title', 'FeedbackType', 'Author', 'EvalutorSkill', 'AverageRating', 'Comments', 'ParameterRating', 'Value'];
  constructor(private spService: SPOperationService, private globalConstant: ConstantsService, private qmsConstant: QMSConstantsService,
    public global: GlobalService, private datepipe: DatePipe, public commonService: CommonService,
    private qmsCommon: QMSCommonService, private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.UFColumns = [
      { field: 'Date', header: 'Date', visibility: true, exportable: true },
      { field: 'Task', header: 'Task', visibility: true, exportable: true },
      { field: 'Type', header: 'Type', visibility: true, exportable: true },
      { field: 'Feedbackby', header: 'Feedback By', visibility: true, exportable: true },
      { field: 'Rating', header: 'Rating', visibility: true, exportable: true },
      { field: 'EvaluatorSkill', header: 'Evaluator Skill', visibility: true, exportable: true },
      { field: 'Comments', header: 'Comments', visibility: true, exportable: true },
      { field: 'Parameters', header: 'Parameters', visibility: false, exportable: true },
      { field: 'Score', header: 'Score', visibility: false, exportable: true }
    ];
  }

  colFilters(colData) {
    // tslint:disable: max-line-length
    this.UFColArray.Date = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.Created, 'MMM d, yyyy'),
        value: a.Created ? new Date(this.datepipe.transform(a.Created, 'MMM d, yyyy')) : '',
        filterValue: new Date(a.Created)
      };
      return b;
    }));
    this.UFColArray.Task = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.Title ? a.SubMilestones ? a.Title + ' - ' + a.SubMilestones : a.Title : '',
        value: a.Title ? a.SubMilestones ? a.Title + ' - ' + a.SubMilestones : a.Title : '',
        filterValue: a.Title
      };
      return b;
    }));
    this.UFColArray.Type = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.FeedbackType, value: a.FeedbackType, filterValue: a.FeedbackType }; return b; }));
    this.UFColArray.EvaluatorSkill = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.EvaluatorSkill, value: a.EvaluatorSkill, filterValue: a.EvaluatorSkill }; return b; }));
    this.UFColArray.Feedbackby = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Author.Title, value: a.Author.Title, filterValue: a.Author.Title }; return b; }));
    this.UFColArray.Rating = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.AverageRating, value: +a.AverageRating, filterValue: a.AverageRating }; return b; }));
    this.UFColArray.Comments = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.CommentsMT, value: a.CommentsMT, filterValue: a.CommentsMT }; return b; }));
    console.log('this.UFColArray ', this.UFColArray);
  }

  /**
   * Get scorecard list items based on parameter passed
   *
   */
  async getScorecardItems(filterObj, startDate, endDate) {
    const assignedToID = filterObj.userId;
    const topCount = filterObj.count;
    // 1st  REST API request
    const batchURL = [];
    // REST API url in contants file
    // const previousYear = new Date().getFullYear() - 2;
    startDate = startDate ? startDate : new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();

    const personalFeedbackComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.Internal));
    personalFeedbackComponent.getScorecard.top = personalFeedbackComponent.getScorecard.top.replace('{{TopCount}}', topCount);
    personalFeedbackComponent.getScorecard.filter = personalFeedbackComponent.getScorecard.filter.replace('{{AssignedTo}}', assignedToID)
      .replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    // tslint:disable: quotemark
    personalFeedbackComponent.getScorecard.filter = filterObj.ratingType !== undefined ? filterObj.ratingType === '' ?
    personalFeedbackComponent.getScorecard.filter.replace("{{RatingType}}", "and (EvaluatorSkill eq null or EvaluatorSkill eq 'Review')") :
      personalFeedbackComponent.getScorecard.filter.replace("{{RatingType}}", "and EvaluatorSkill eq '" + filterObj.ratingType + "'") :
      personalFeedbackComponent.getScorecard.filter.replace("{{RatingType}}", "");
    personalFeedbackComponent.getScorecard.filter = topCount < 4500 ?
      // tslint:disable-next-line: quotemark
      personalFeedbackComponent.getScorecard.filter.replace("{{FeedbackTypeFilter}}", "and FeedbackType eq '" + this.globalConstant.FeedbackType.taskRating + "'") :
      personalFeedbackComponent.getScorecard.filter.replace('{{FeedbackTypeFilter}}', '');
    this.commonService.SetNewrelic('QMS', 'Userfeedback', 'readItems-getScorecardItems', "GET");
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.Scorecard.name, personalFeedbackComponent.getScorecard);
    // If Last.. Filter used then fetch top Task Feedback only ( Rating) and Qualitative feedback based on rating item dates
    const arrScoreCards = arrResult.length > 0 ? arrResult : [];
    // 2nd REST API request
    // Get parameter of scorecard rating
    arrScoreCards.forEach(element => {
      // 1st Query
      const getRatingData = Object.assign({}, this.options);
      getRatingData.url = this.spService.getReadURL(this.globalConstant.listNames.ScorecardRatings.name, personalFeedbackComponent.getRatings);
      getRatingData.url = getRatingData.url.replace('{{ID}}', element.ID);
      getRatingData.listName = this.globalConstant.listNames.ProjectInformation.name;
      getRatingData.type = 'GET';
      batchURL.push(getRatingData);
    });
    // Fetch Qualitative feedback if filter is based on Last 10,20,... or it will fetch in date range filter itself
    if (topCount < 4500) {
      const past3MonthDate = new Date();
      past3MonthDate.setMonth(new Date().getMonth() - 3);
      const qfStartDate = arrScoreCards.length > 0 ? arrScoreCards[arrScoreCards.length - 1].Created :
        new Date(past3MonthDate.setHours(0, 0, 0, 1)).toISOString();
      const qfEndDate = new Date(new Date().setHours(23, 59, 59, 59)).toISOString();
      // 2nd Query
      const getScorecardData = Object.assign({}, this.options);
      getScorecardData.url = this.spService.getReadURL(this.globalConstant.listNames.Scorecard.name, personalFeedbackComponent.getScorecard);
      getScorecardData.url = getScorecardData.url.replace('{{AssignedTo}}', assignedToID)
        .replace('{{TopCount}}', '4500')
        .replace('{{startDate}}', qfStartDate)
        .replace('{{endDate}}', qfEndDate)
        .replace('{{FeedbackTypeFilter}}', 'and FeedbackType eq "' + this.globalConstant.FeedbackType.qualitative + '"');
      getScorecardData.listName = this.globalConstant.listNames.ProjectInformation.name;
      getScorecardData.type = 'GET';
      batchURL.push(getScorecardData);
    }
    let arrRatings = await this.spService.executeBatch(batchURL);
    arrRatings = arrRatings.length > 0 ? arrRatings : [];
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
            arrScoreCards[i].ParameterRating = filterObj.managerView ? arrScoreCards[i].ParameterRating + elem.Parameter.Title + '<br style="mso-data-placement:same-cell;" />' :
              arrScoreCards[i].ParameterRating + elem.Parameter.Title + '\n';
            arrScoreCards[i].Value = filterObj.managerView ? arrScoreCards[i].Value + elem.Rating + '<br style="mso-data-placement:same-cell;" />' :
              arrScoreCards[i].Value + elem.Rating + '\n';
            arrScoreCards[i].parameters.push({property: elem.Parameter.Title, value: elem.Rating});
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
  getFeebacks(arrScoreCards) {
    // Display average rating and bind to internal component
    const averageRating = this.getAverageRating(arrScoreCards);
    this.setAverageRating.emit(averageRating);
    this.UFRows = [];
    arrScoreCards.forEach(element => {
      this.UFRows.push({
        Id: element.Id,
        ID: element.ID,
        SubmissionDate: element.SubmissionDate ? element.SubmissionDate : '',
        FeedbackType: element.FeedbackType ? element.FeedbackType : '',
        DocumentsUrl: element.DocumentsUrl ? element.DocumentsUrl : '',
        AssignedTo: element.AssignedTo,
        Date: element.Created ? new Date(this.datepipe.transform(element.Created, 'MMM d, yyyy')) : '',
        SubMilestones: element.SubMilestones ? element.SubMilestones : '',
        Author: element.Author,
        AverageRating: element.AverageRatingNM,
        Created: element.Created ? new Date(this.datepipe.transform(element.Created, 'MMM d, yyyy')) : '',
        Task: element.Title ? element.SubMilestones ? element.Title + ' - ' + element.SubMilestones : element.Title : '',
        Title: element.Title ? element.Title : '',
        Type: element.FeedbackType ? element.FeedbackType : '',
        Feedbackby: element.Author.Title ? element.Author.Title : '',
        EvaluatorSkill: element.EvaluatorSkill !== undefined || element.EvaluatorSkill !== null ? element.EvaluatorSkill === '' ? 'Reviewer' : element.EvaluatorSkill : '',
        Rating: element.AverageRatingNM ? element.AverageRatingNM : '',
        Comments: element.CommentsMT ? element.CommentsMT : '',
        Parameters: element.ParameterRating ? element.ParameterRating : '',
        Score: element.Value ? element.Value : '',
        ParameterRatings: element.parameters ? element.parameters : []
      });
    });
    this.ref = this.userFeedbackTable;
    return this.UFRows;
  }

  getAverageRating(itemsArray) {
    const arrTaskFeedback = itemsArray.filter(t => t.FeedbackType === this.globalConstant.FeedbackType.taskRating);
    const totalRating = arrTaskFeedback.reduce((a, b) => a + +b.AverageRating, 0);
    const averageRating = +(totalRating / arrTaskFeedback.length).toFixed(2);
    return isNaN(averageRating) ? '0' : '' + averageRating;
  }

  /**
   * Apply filter based on filter object received
   *
   * @param  filterObj - Emitted  from filter component => Internal => UserFeedbackComponent
   *
   */
  async applyFilters(filterObj) {
    this.hideTable = true;
    this.hideLoader = false;
    // setTimeout(async () => {
    let arrScorecard = [];
    if (!filterObj.collapseMangerView) {
      if (filterObj.isDateFilter) {
        const startDate = new Date(filterObj.startDate).toISOString();
        const endDate = new Date(filterObj.endDate).toISOString();
        filterObj.count = 4500;
        arrScorecard = await this.getScorecardItems(filterObj, startDate, endDate);
      } else {
        arrScorecard = await this.getScorecardItems(filterObj, '', '');
      }
    }
    const feedbacks = this.getFeebacks(arrScorecard);
    this.UFRows = [...feedbacks];
    this.originalScorecard = [...this.UFRows];
    this.feedbackData.emit(this.UFRows);
    this.colFilters(arrScorecard);
    this.hideTable = false;
    this.hideLoader = true;
    // }, 500);
  }

  async applyArrayFilter(filter, scorecard?) {
    let newScorecard = [];
    const score = scorecard && scorecard.length ? scorecard : this.originalScorecard;
    if (filter === '') {
      newScorecard = score.filter(sc => sc.EvaluatorSkill === null || sc.EvaluatorSkill === '' || sc.EvaluatorSkill === 'Review');
    } else {
      newScorecard = score.filter(sc => sc.EvaluatorSkill === filter);
    }
    const feedbacks = this.getFeebacks(newScorecard);
    this.UFRows = [...feedbacks];
    // this.originalScorecard = [...this.UFRows];
    this.feedbackData.emit(this.UFRows);
    this.colFilters(newScorecard);
  }

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  changeDDValue(val, colField, type) {
    console.log('val ', val + 'colFiled ', colField + 'type ', type);
  }

  ngAfterViewChecked() {
    // console.log('In after view checked ', this.UFColArray);
    if (this.UFRows.length && this.isOptionFilter) {
      const obj = {
        tableData: this.userFeedbackTable,
        colFields: this.UFColArray,
        // colFieldsArray: this.createColFieldValues(this.proformaTable.value)
      };
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
        // this.colFilters(obj.tableData.filteredValue);
        console.log('this.UFColArray ', this.UFColArray)
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.colFilters(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }

  showOverlayPanel(event, rowData, ratingOP, target?) {
    ratingOP.showOverlay(event, rowData, event.target.parentElement);
    setTimeout(() => {
      let panel: any = document.querySelector(
        ".ratingOverlayComp > div"
      );
      let panelContainer: any = document.getElementById("s4-workspace");
      let topAdject = -250;
      if (panelContainer) {
        topAdject =
          panelContainer.scrollTop > 0
            ? panelContainer.scrollTop - panel.clientHeight
            : 0;
        if (topAdject < 0) {
          topAdject = panelContainer.scrollTop;
        }
      }
      panel.style.top = event.pageY + topAdject + "px";
      // panel.style.left = event.pageX + "px";
    }, 50);
  }

}
