import { QMSConstantsService } from './services/qmsconstants.service';
import { SPCommonService } from '../../Services/spcommon.service';
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../Services/global.service';
import { ConstantsService } from '../../Services/constants.service';
import { SPOperationService } from '../../Services/spoperation.service';

@Component({
  selector: 'app-qms',
  templateUrl: './qms.component.html',
  styleUrls: ['./qms.component.css']
})

export class QMSComponent implements OnInit {
  // Initialisation of current user
  public currentUser = this.global.currentUser;
  // Initialisation for show hide reviewer tab
  public hideReviewerTaskPending = false;
  public hideCD = false;
  public hideManager = false;
  public hideAdmin = false;
  public activeLinkIndex = 0;
  public navLinks = [{ routerLink: ['/qms/personalFeedback'], label: 'Personal Feedback', value: 'PersonalFeedback' },
  ];
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  constructor(private global: GlobalService, private globalConstant: ConstantsService,
              private spService: SPOperationService, private spcommon: SPCommonService, private qmsConstant: QMSConstantsService) { }

  ngOnInit() {
    this.initialize();
  }

  async initialize() {
    let resource = [];
    let batchUrl = [];
    // show hide reviewer tab
    // 1st Batch Request
    batchUrl = this.getAllResources();
    // 2nd Batch Request
    batchUrl = [...batchUrl, ...this.displayReviewerPendingTasks(1)];
    // // 3rd Batch Request
    // batchUrl = [...batchUrl, ...this.displayCDTab(1)];
    // 4th Batch Request
    batchUrl = [...batchUrl, ...this.getCurrentResourceGroups()];
    // 5th Batch Request
    let result = await this.spService.executeBatch(batchUrl);
    result = result.length > 0 ? result : [];
    this.global.allResources = result[0].retItems.length ? result[0].retItems : [];
    this.hideReviewerTaskPending = result[1].retItems.length ? false : true;
    // this.hideCD = result[2].retItems.length ? false : true;
    this.global.currentUser.groups = result[2].retItems ? result[2].retItems.Groups.results ? result[2].retItems.Groups.results : [] : [];
    this.hideCD = this.displayCFTab();
    this.displayManagerTab();
    this.displayAdminView();
    this.global.viewTabsPermission.hideAdmin = this.hideAdmin;   
    resource = this.global.allResources.length > 0 ?
      this.global.allResources.filter(u => u.UserName.ID === this.global.sharePointPageObject.userId) : [];
    if (resource && resource.length > 0) {
      this.global.currentUser.title = resource[0].UserName.Title;
      this.global.currentUser.email = resource[0].UserName.EMail;
      this.global.currentUser.timeZone = resource[0].TimeZone.Title;
      this.global.currentUser.designation = resource[0].Designation;
    }

    if (!this.hideReviewerTaskPending) {
      this.navLinks.push({ routerLink: ['/qms/pendingFeedback'], label: 'Pending Feedback', value: 'PendingFeedback' });
    }
    if (!this.hideCD) {
      this.navLinks.push({ routerLink: ['/qms/clientFeedback'], label: 'Client Feedback', value: 'clientFeedback' });
    }
  }
  /**
   * Get all resources from resource categorization list
   */
  getAllResources() {
    const batchURL = [];
    const getResourceData = Object.assign({}, this.options);
    // tslint:disable: max-line-length
    getResourceData.url = this.spService.getReadURL(this.globalConstant.listNames.ResourceCategorization.name, this.qmsConstant.common.getAllResource);
    getResourceData.listName = this.globalConstant.listNames.ResourceCategorization.name;
    getResourceData.type = 'GET';
    batchURL.push(getResourceData);
    return batchURL;
  }

  /**
   *  Display reviewer tab if atleast 1 task pending to rate
   */
  displayReviewerPendingTasks(itemCount) {
    const reviewerComponent = this.qmsConstant.reviewerComponent;
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    today.setHours(0, 0, 0, 0);
    // date for filter since last month
    const filterDate = new Date(today).toISOString();
    // REST API url in contants file

    const batchURL = [];
    const getResourceData = Object.assign({}, this.options);
    // tslint:disable: max-line-length
    getResourceData.url = this.spService.getReadURL(this.globalConstant.listNames.Schedules.name, reviewerComponent.reviewerPendingTaskURL);
    getResourceData.url = getResourceData.url.replace('{{PrevMonthDate}}', filterDate).replace('{{TopCount}}', '' + itemCount);
    getResourceData.listName = this.globalConstant.listNames.Schedules.name;
    getResourceData.type = 'GET';
    batchURL.push(getResourceData);
    return batchURL;
  }

  /**
   * Display manager tab if resources have current user as manager
   */
  displayManagerTab() {
    const resources = this.global.allResources.filter(u => u.Manager.ID === this.global.sharePointPageObject.userId);
    const isQMSLeader = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSLeaders);
    this.hideManager = resources.length > 0 || isQMSLeader.length > 0 ? false : true;
    if (!this.hideManager) {
      this.navLinks.push({ routerLink: ['/qms/managerView'], label: 'Manager View', value: 'ManagerView' });
    }
  }

  /**
   * Get current user detail from resource categorization list
   * Set current user - ID, Title, EMail, TimeZone.Title, Designation
   * @returns current user details
   */
  getCurrentResourceGroups() {
    const batchURL = [];
    const getResourceData = Object.assign({}, this.options);
    // tslint:disable: max-line-length
    getResourceData.url = this.spService.getUserURL(this.global.sharePointPageObject.userId);
    getResourceData.listName = 'UserInfo';
    getResourceData.type = 'GET';
    batchURL.push(getResourceData);
    return batchURL;
  }
  
  /**
   *  Display Client feedback tab if current user have atleast 1 CD as ASD/TL(Delivery Lead)
   */
  displayCFTab() {
    const isCDAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.CDAdmin);
    const isPFAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.PFAdmin);
    return isCDAdmin.length || isPFAdmin.length ? false : true;
    // const cdComponent = this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent;
    // const batchURL = [];
    // const previousYear = new Date().getFullYear() - 2;
    // const startDate = new Date(previousYear, 11, 31).toISOString();
    // const endDate = new Date().toISOString();
    // // REST API url in contants file

    // const getQCData = Object.assign({}, this.options);
    // getQCData.url = this.spService.getReadURL(this.globalConstant.listNames.QualityComplaints.name, cdComponent.getQC);
    // getQCData.url = getQCData.url.replace('{{startDate}}', startDate)
    //   .replace('{{endDate}}', endDate)
    //   .replace('{{TopCount}}', '' + itemCount)
    //   .replace('{{statusFilter}}', '');
    // getQCData.listName = this.globalConstant.listNames.QualityComplaints.name;
    // getQCData.type = 'GET';
    // batchURL.push(getQCData);
    // return batchURL;
  }

  /**
   * Display admin tab if user present in QMS_Admin(Retrospective Feedback) or QMS_ViewScorecard group(Scorecard)
   */
  displayAdminView() {
    // tslint:disable-next-line
    const isQMSAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSAdmin);
    const isQMSScorecardReader = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.QMSViewScorecard);
    this.hideAdmin = isQMSAdmin.length || isQMSScorecardReader.length ? false : true;
    if (!this.hideAdmin) {
      this.navLinks.push({ routerLink: ['/qms/adminView'], label: 'Admin View', value: 'AdminView' });
    }
  }
}
