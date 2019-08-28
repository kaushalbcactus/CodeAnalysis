import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { SPOperationService } from '../../../Services/spoperation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { CommonService } from '../../../Services/common.service';
import { DataService } from '../../../Services/data.service';
import { Router, NavigationEnd } from '@angular/router';
import { GlobalService } from '../../../Services/global.service';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SPCommonService } from '../../../Services/spcommon.service';
import { TreeNode, MessageService } from 'primeng/api';
import { UserFeedbackComponent } from '../user-feedback/user-feedback.component';
import { QMSConstantsService } from '../services/qmsconstants.service';

@Component({
  selector: 'app-manager-view',
  templateUrl: './manager-view.component.html',
  styleUrls: ['./manager-view.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ManagerViewComponent implements OnInit, OnDestroy {
  @ViewChild('userFeedbackRef', { static: true }) userFeedbackRef: UserFeedbackComponent;
  feedbacksColumns = [];
  feedbacksTableColumns = [];
  innerTable = [];
  hidden = true;
  public resource = {
    data: {
      userName: '',
      userId: -1,
      averageRating: '0',
      ratingCount: '0',
      hideFeedbackForm: true,
      hideInnerTable: true,
      hideFeedBackSubmitted: true,
    },
    children: []
  };
  feedbacksRows: any = [];
  feedbackTable: any = [];
  public feedbacks = [];
  public resources = [];
  public hideLoader = true;
  public hideTable = false;
  public internalFeedbacks = [];
  public alertMessage: string;
  private alert = new Subject<string>();
  private filterObj: any = {
    isDateFilter: false,
    startDate: new Date(),
    endDate: new Date(),
    count: 10,
    dateRange: {},
    userId: this.global.currentUser.id,
    hideQuarters: true,
    hideDateRange: true,
    hideYears: true,
    yearSelected: { label: new Date().getFullYear(), value: new Date().getFullYear() },
    quarterSelected: '',
    filterSelectedValue: { type: 'Last 10', value: 10 },
    years: [{ label: 'Current', value: new Date().getFullYear() },
    { label: 'Previous', value: new Date().getFullYear() - 1 }
    ],
    quarters: [],
    filterBy: [
      { type: 'Date Range', value: 'DateRange' },
      { type: 'Year', value: 'Quarter' },
      { type: 'Last 10', value: 10 },
      { type: 'Last 20', value: 20 },
      { type: 'Last 30', value: 30 }
    ]
  };
  private root: TreeNode;
  public sub; navigationSubscription;
  @ViewChild('popupContent', { static: true }) popupContent: ElementRef;
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  constructor(private spService: SPOperationService, private globalConstant: ConstantsService, private messageService: MessageService,
    private common: CommonService, private data: DataService, private router: Router, private global: GlobalService,
    private qmsConstant: QMSConstantsService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseManagerView();
      }
    });
  }


  initialiseManagerView() {
    // Set default values and re-fetch any data you need.
    this.showLoader();
    setTimeout(async () => {
      this.data.filterObj.subscribe(filter => this.filterObj = filter);
      this.alert.subscribe((message) => this.alertMessage = message);
      this.alert.pipe(
        debounceTime(5000),
      ).subscribe(() => this.alertMessage = null);
      // fetching manager resources only once page loads
      const filterObject = Object.assign({}, this.filterObj);
      const resources = await this.getAllResources(this.global.sharePointPageObject.userId);
      this.feedbacksRows = await this.applyFilters(filterObject, resources);
      this.feedbackTable = [];
      this.feedbacksRows.forEach(row => {
        this.feedbackTable.push(row.data);
        row.children.forEach(item => {
          this.feedbackTable.push(item.data);
        });
      });
      this.feedbackTable.forEach(element => {
        element.userFeedback = [];
      });
      this.showTable();
    }, 500);
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  async getManagerResources(managerID) {
    const managerComponent = JSON.parse(JSON.stringify(this.qmsConstant.ManagerComponent));
    managerComponent.getManagerResources.top = managerComponent.getManagerResources.top.replace('{{TopCount}}', '4500');
    managerComponent.getManagerResources.filter = managerComponent.getManagerResources.filter.replace('{{ManagerID}}', managerID);
    // tslint:disable: max-line-length
    let resources = await this.spService.readItems(this.globalConstant.listNames.ResourceCategorization.name, managerComponent.getManagerResources);
    resources = resources.length > 0 ? resources : [];
    resources = resources.map(item => item)
      .filter((value, index, self) => self.findIndex(s => s.UserName.ID === value.UserName.ID) === index);
    return resources;
  }

  async getAllResources(managerID) {
    const batchURL = [];
    // tslint:disable: max-line-length
    const managerComponent = JSON.parse(JSON.stringify(this.qmsConstant.ManagerComponent));
    const getUserDetail = Object.assign({}, this.options);
    getUserDetail.url = this.spService.getReadURL(this.globalConstant.listNames.ResourceCategorization.name, managerComponent.getManagerResources);
    getUserDetail.url = getUserDetail.url.replace('{{TopCount}}', '4500')
      .replace('{{ManagerID}}', managerID);
    getUserDetail.listName = this.globalConstant.listNames.ResourceCategorization.name;
    getUserDetail.type = 'GET';
    batchURL.push(getUserDetail);

    const getResourceData = Object.assign({}, this.options);
    getResourceData.url = this.spService.getGroupURL(this.globalConstant.Groups.QMSLeaders);
    getResourceData.listName = 'UserInfo';
    getResourceData.type = 'GET';
    batchURL.push(getResourceData);
    const arrResult = await this.spService.executeBatch(batchURL);
    let resources = arrResult.length > 0 ? arrResult[0].retItems : [];
    const managerInResourceIndex = resources.findIndex(r => r.UserName.ID === managerID);
    if (managerInResourceIndex > -1) {
      resources.splice(managerInResourceIndex, 1);
    }
    let leaders = arrResult.length > 0 ? arrResult[1].retItems : [];
    leaders = leaders.map(obj => ({
      ...obj, UserName: { ID: obj.Id, Title: obj.Title }
    }));
    const currentUserIndex = leaders.findIndex(u => u.UserName.ID === this.global.sharePointPageObject.userId);
    if (currentUserIndex > -1) {
      leaders.splice(currentUserIndex, 1);
      resources = [...resources, ...leaders].map(item => item)
        .filter((value, index, self) => self.findIndex(s => s.UserName.ID === value.UserName.ID) === index);
    }
    return resources;
  }

  getResourceObject(arrResources) {
    const arrFormattedData: any = [];
    arrResources.forEach(async element => {
      const obj = JSON.parse(JSON.stringify(this.resource));
      obj.data.userName = element.UserName.Title;
      obj.data.userId = element.UserName.ID;
      obj.data.averageRating = element.averageRating;
      obj.data.ratingCount = element.ratingCount;
      arrFormattedData.push(obj);
    });
    return arrFormattedData;
  }

  async getResourceDetail(rowdata, rowNode) {
    this.showLoader();
    rowNode.node.children = [];
    if (!rowNode.node.expanded) {
      const filterObject = Object.assign({}, this.filterObj);
      const resources = await this.getManagerResources(rowdata.userId);
      if (resources.length) {
        const childrenObj = await this.applyFilters(filterObject, resources);
        rowNode.node.children = [...childrenObj];
      } else {
        this.showSuccessMsg();
      }
      await this.expandCollapseTab(rowNode, resources);
    }
  }

  async expandCollapseTab(rowNode, resources) {
    setTimeout(() => {
      if (resources.length) {
        rowNode.node.expanded = rowNode.node.expanded ? false : true;
        const temp = [...this.feedbacksRows];
        this.feedbacksRows = [];
        this.feedbacksRows = [...temp];
        this.feedbackTable = [];
        this.feedbacksRows.forEach(row => {
          this.feedbackTable.push(row.data);
          row.children.forEach(item => {
            this.feedbackTable.push(item.data);
          });
        });
        this.feedbackTable.forEach(element => {
          element.userFeedback = [];
        });
      }
      this.showTable();
    }, 200);
  }

  async applyFilters(filterObj, resources) {
    let updatedResources = [];
    if (filterObj.isDateFilter) {
      const startDate = new Date(filterObj.startDate).toISOString();
      const endDate = new Date(filterObj.endDate).toISOString();
      updatedResources = await this.getResourceRatingDetail(resources, 4500, startDate, endDate);
    } else {
      updatedResources = await this.getResourceRatingDetail(resources, filterObj.count, '', '');
    }
    return await this.getResourceObject(updatedResources);
  }

  async ngOnInit() {
    this.feedbacksColumns = [
      { field: 'userName', header: 'Resource', visibility: true },
    ];
    this.feedbacksTableColumns = [
      { field: 'userName', header: 'Resource', visibility: true, exportable: true },
      { field: 'averageRating', header: 'Average Rating', visibility: true, exportable: true },
    ];

    this.innerTable = [
      { field: 'userFeedback', header: 'Date', subfield: 'Date', exportable: true },
      { field: 'userFeedback', header: 'Task', subfield: 'Task', exportable: true },
      { field: 'userFeedback', header: 'Type', subfield: 'Type', exportable: true },
      { field: 'userFeedback', header: 'Feedback By', subfield: 'Feedbackby', exportable: true },
      { field: 'userFeedback', header: 'Rating', subfield: 'Rating', exportable: true },
      { field: 'userFeedback', header: 'Comments', subfield: 'Comments', exportable: true },
      { field: 'Parameters', header: 'Parameters', visibility: false, exportable: true },
      { field: 'Score', header: 'Score', visibility: false, exportable: true }
    ];
  }

  getScorecard(assignedToID, topCount, startDate, endDate) {
    const batchURL = [];
    const getScorecardURL = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.Internal.getScorecard));
    const previousYear = new Date().getFullYear() - 2;
    startDate = startDate ? startDate : new Date(previousYear, 11, 31).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();

    const getScorecardData = Object.assign({}, this.options);
    getScorecardData.url = this.spService.getReadURL(this.globalConstant.listNames.Scorecard.name, getScorecardURL);
    getScorecardData.url = getScorecardData.url.replace('{{AssignedTo}}', assignedToID)
      .replace('{{TopCount}}', '' + topCount)
      .replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    // tslint:disable: max-line-length
    // tslint:disable-next-line: quotemark
    getScorecardData.url = topCount < 4500 ? getScorecardData.url.replace("{{FeedbackTypeFilter}}", "and FeedbackType eq '" + this.globalConstant.FeedbackType.taskRating + "'") :
      getScorecardData.url.replace('{{FeedbackTypeFilter}}', '');
    getScorecardData.listName = this.globalConstant.listNames.Scorecard.name;
    getScorecardData.type = 'GET';
    batchURL.push(getScorecardData);
    return batchURL;
  }

  async getResourceRatingDetail(resources, topCount, startDate, endDate) {
    let arrResourceScoreCards = [];
    let batchURL = [];
    resources.forEach(element => {
      batchURL = [...batchURL, ...this.getScorecard(element.UserName.ID, topCount, startDate, endDate)];
    });
    arrResourceScoreCards = await this.spService.executeBatch(batchURL);
    arrResourceScoreCards = arrResourceScoreCards.length > 0 ? arrResourceScoreCards.map(s => s.retItems) : [];
    for (const key in arrResourceScoreCards) {
      if (arrResourceScoreCards.hasOwnProperty(key)) {
        const element = arrResourceScoreCards[key];
        const averageRating = this.getAverageRating(element);
        resources[key].averageRating = averageRating.rating;
        resources[key].ratingCount = averageRating.count;
      }
    }
    return resources;
  }

  async saveFeedback(feedback) {
    if (feedback.comments) {
      const result = await this.addScorecardItem(feedback);
      if (result) {
        feedback.hideFeedbackForm = true;
        feedback.hideFeedBackSubmitted = false;
        feedback.comments = '';
        setTimeout(() => {
          feedback.hideFeedBackSubmitted = true;
        }, 4000);
      }
    } else {
      this.alert.next('Please share your feedback.');
    }
  }

  async addScorecardItem(feedback) {
    const scorecardDetails = {
      FeedbackType: 'Qualitative',
      Comments: feedback.comments,
      AssignedToId: feedback.userId
    };
    const resp = await this.spService.createItem(this.globalConstant.listNames.Scorecard.name, scorecardDetails,
      this.globalConstant.listNames.Scorecard.type);
    return resp;
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }

  getResourceScorecard(feedbackTableRef, feedback) {
    const filterObject = Object.assign({}, this.filterObj);
    filterObject.userId = feedback.userId;
    filterObject.managerView = true;
    // show hide inner table
    feedback.hideInnerTable = !feedback.hideInnerTable;
    filterObject.collapseMangerView = feedback.hideInnerTable ? true : false;
    feedbackTableRef.applyFilters(filterObject);
    filterObject.manager = false;
  }

  getFeedbackData(event, feedback) {
    this.feedbackTable.forEach(element => {
      if (feedback.userId === element.userId) {
        element.userFeedback = event;
      }
    });
  }

  getAverageRating(itemsArray) {
    const arrTaskFeedback = itemsArray.filter((t) => t.FeedbackType && t.FeedbackType === this.globalConstant.FeedbackType.taskRating);
    const totalRating = arrTaskFeedback.reduce((a, b) => a + +b.AverageRating, 0);
    const averageRating = +(totalRating / arrTaskFeedback.length).toFixed(2);
    const ratingObj = {
      rating: isNaN(averageRating) ? '0' : '' + averageRating,
      count: arrTaskFeedback.length
    };
    return ratingObj;
  }

  reloadPage(filterObj) {
    this.data.changeFilterObj(filterObj);
    this.router.navigate([this.router.url]);
  }



  /// Download Manager View
  downloadExcel() {
    this.common.tableToExcel('managerTable', 'Feedback');
  }

  showSuccessMsg() {
    this.messageService.add({ severity: 'success', summary: 'No Reportees present', detail: '' });
  }
}
