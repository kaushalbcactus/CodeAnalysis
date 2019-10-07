import { FeedbackBymeComponent } from './../../personal-feedback/feedback-byme/feedback-byme.component';
import { Component, OnInit, ViewChild, ApplicationRef, NgZone } from '@angular/core';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PlatformLocation, LocationStrategy } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scorecards',
  templateUrl: './scorecards.component.html',
  styleUrls: ['./scorecards.component.css']
})
export class ScorecardsComponent implements OnInit {
  scorecardsColumns = [];
  scorecardsRows = [];
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
    startDate: null,
    endDate: null,
    count: 10,
    clickedResourceID: '',
    isDateFilter: true,
    hideDateRange: true
  };
  public hideLoader = true;
  public hideTable = false;
  public resources = [];
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
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
  resourceRows: [];
  resourceColumns: [{}];
  navigationSubscription;
  value: Date[] = [new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date()];
  @ViewChild(FeedbackBymeComponent, { static: true }) feedbackTable: FeedbackBymeComponent;
  constructor(private qmsConstant: QMSConstantsService, private globalConstant: ConstantsService,
    private spService: SPOperationService, private global: GlobalService,
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

  async ngOnInit() {
    if (!this.global.currentUser.groups.length) {
      const result = await this.spService.getUserInfo(this.global.sharePointPageObject.userId);
      this.global.currentUser.groups = result.Groups.results ? result.Groups.results : [];
    }
    const isQMSScorecardReader = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSViewScorecard);
    this.global.viewTabsPermission.hideAdminScorecard = isQMSScorecardReader.length ? false : true;
    this.resourceColumns = [
      { field: 'userName', header: 'Resource', visibility: true },
    ];
    if (!this.global.viewTabsPermission.hideAdminScorecard) {
      this.showLoader();
      setTimeout(async () => {
        this.scorecardsRows = [];
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

  downloadExcel(sc) {
    sc.exportCSV();
  }

  filterResource() {
    if (!this.global.viewTabsPermission.hideAdminScorecard) {
      this.filterObj.filteredResources = [];
      // tslint:disable
      // Filter resource based on resource categorization list - Tasks column of resource
      let filteredResources = this.resources.filter(t => t.Tasks.results.filter(type => type.Title === this.filterObj.selectedTaskType.value).length > 0);
      filteredResources.forEach(element => {
        this.filterObj.filteredResources.push(element);
      });
    }
  }

  getResourceObject(arrResources) {
    const arrFormattedData: any = [];
    arrResources.forEach(async element => {
      const obj = JSON.parse(JSON.stringify(this.resource));
      obj.data.userName = element.UserName.Title;
      obj.data.userId = element.UserName.ID;
      obj.data.averageRating = element.averageRating;
      obj.data.ratingCount = element.ratingCount;
      // obj.expanded = true;
      arrFormattedData.push(obj);
    });
    return arrFormattedData;
  }

  async getDetail(filterObj) {
    const resources = this.filterObj.selectedResource;
    const updatedResources = await this.getResourceRatingDetail(resources, 4900, filterObj.startDate, filterObj.endDate);
    this.resourceRows = await this.getResourceObject(updatedResources);
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

  getScorecard(assignedToID, topCount, startDate, endDate) {
    const batchURL = [];
    const getScorecardURL = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.Internal.getScorecard));
    // const previousYear = new Date().getFullYear() - 2;
    this.filterObj.startDate = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    startDate = new Date(this.filterObj.startDate).toISOString();
    this.filterObj.endDate = endDate ? new Date(endDate) : new Date();
    endDate = new Date(this.filterObj.endDate).toISOString();

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

  getResourceScorecard(feedbackTableRef, feedback) {
    this.filterObj.clickedResourceID = feedback.userId;
    const filterObject = Object.assign({}, this.filterObj);
    // show hide inner table
    feedback.hideInnerTable = !feedback.hideInnerTable;
    // display inner table
    if (!feedback.hideInnerTable) {
      feedbackTableRef.applyFilters(filterObject);
      feedbackTableRef.hideDetail = true;
    }
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }

  filterByDateRange() {
    if (this.value) {
      const fromDate = new Date(this.value[0].setHours(0, 0, 0, 0));
      // tslint:disable: max-line-length
      const toDate = this.value[1] ? new Date(this.value[1].setHours(23, 59, 59, 0)) : fromDate ? new Date(this.value[0].setHours(23, 59, 59, 0)) : new Date();
      this.filterObj.startDate = fromDate;
      this.filterObj.endDate = toDate;
    } else {
      this.value = [new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date()];
      this.filterObj.startDate = null;
      this.filterObj.endDate = null;
    }
    this.getDetail(this.filterObj);
  }
}
