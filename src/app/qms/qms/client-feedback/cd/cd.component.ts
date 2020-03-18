import { QMSCommonService } from './../../services/qmscommon.service';
import { QMSConstantsService } from './../../services/qmsconstants.service';
import { Component, OnInit, ViewChild, OnDestroy, ElementRef, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { ConstantsService } from '../../../../Services/constants.service';
import { GlobalService } from '../../../../Services/global.service';
import { CommonService } from '../../../../Services/common.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { DataService } from '../../../../Services/data.service';
import { Router, NavigationEnd } from '@angular/router';
// import { Subject } from 'rxjs';
// import { debounceTime } from 'rxjs/operators';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MenuItem, MessageService } from 'primeng/api';
import { ActionsPopupComponent } from './actions-popup/actions-popup.component';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-cd',
  templateUrl: './cd.component.html',
  styleUrls: ['./cd.component.css']
})
export class CDComponent implements OnInit, OnDestroy {
  // @ViewChild(MatSort) cdSort: MatSort;
  @ViewChild('popupLoader', { static: true }) popupLoader: ElementRef;
  @ViewChild('CDPopup', { static: false }) CDPopup: ActionsPopupComponent;
  @ViewChild('cd', { static: false }) cdTable: Table;

  // public successMessage: string;
  CDColumns = [];
  CDRows = [];
  tempClick: any;
  items: MenuItem[];
  // private success = new Subject<string>();
  public cdStatus = [];

  // tslint:disable: max-line-length
  public displayedCDColumns: string[] = ['ID', 'Title', 'SentDate', 'SentBy', 'Status', 'CDCategory',
    'Accountable', 'Segregation', 'BusinessImpact', 'actions'];
  public hideLoader = true;
  public hideTable = false;
  private extNavigationSubscription;
  private qcs = [];
  public CDColArray = {
    ID: [],
    Title: [],
    SentDate: [],
    SentBy: [],
    Status: [],
    SeverityLevel: [],
    Accountable: [],
    Segregation: [],
    BusinessImpact: []
  };
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  constructor(
    private spService: SPOperationService,
    private globalConstant: ConstantsService,
    private datepipe: DatePipe,
    public global: GlobalService,
    public commonService: CommonService,
    public data: DataService,
    private router: Router,
    private messageService: MessageService,
    private qmsConstant: QMSConstantsService,
    private qmsCommon: QMSCommonService,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
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
    this.extNavigationSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });
  }
  async ngOnInit() {
    this.initialiseCFDissatisfaction();
  }

  protected initialiseCFDissatisfaction() {
    this.qcs = [];
    this.showLoader();
    this.CDColumns = [
      { field: 'ID', header: 'ID' },
      { field: 'Title', header: 'Project Code' },
      { field: 'SentDate', header: 'Sent Date' },
      { field: 'SentBy', header: 'Sent By' },
      { field: 'Status', header: 'Status' },
      { field: 'SeverityLevel', header: 'CD Category' },
      { field: 'Accountable', header: 'Accountble' },
      { field: 'Segregation', header: 'Segregation' },
      { field: 'BusinessImpact', header: 'Business Imapact' },
      { field: '', header: '' },
    ];
    // this.initializeMsg();
    setTimeout(async () => {
      this.qcs = await this.getQCItems();
      this.bindTable(this.qcs);
      this.showTable();
    }, 500);
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.extNavigationSubscription) {
      this.extNavigationSubscription.unsubscribe();
    }
  }

  colFilters(colData) {
    this.CDColArray.ID = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.ID, value: a.ID, filterValue: +a.ID }; return b; }));
    this.CDColArray.Title = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Title, value: a.Title, filterValue: a.Title }; return b; }));
    this.CDColArray.SentDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.SentDate, 'MMM d, yyyy'),
        value: a.SentDate ? new Date(this.datepipe.transform(a.SentDate, 'MMM d, yyyy')) : '',
        filterValue: new Date(a.SentDate)
      };
      return b;
    }));
    this.CDColArray.SentBy = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.SentBy, value: a.SentBy, filterValue: a.SentBy }; return b; }));
    this.CDColArray.Status = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Status, value: a.Status, filterValue: a.Status }; return b; }));
    this.CDColArray.SeverityLevel = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.SeverityLevel, value: a.SeverityLevel, filterValue: a.SeverityLevel }; return b; }));
    this.CDColArray.Accountable = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Accountable, value: a.Accountable, filterValue: a.Accountable }; return b; }));
    this.CDColArray.Segregation = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Segregation, value: a.Segregation, filterValue: a.Segregation }; return b; }));
    this.CDColArray.BusinessImpact = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.BusinessImpact, value: a.BusinessImpact, filterValue: a.BusinessImpact }; return b; }));
  }

  /**
   *  Fetches CD for past 30 days by default where current user is part of resource in CD line item
   *  return array of CD
   */
  protected async getQCItems(filterObj?): Promise<[]> {
    const qcComponent = JSON.parse(JSON.stringify(this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent));
    this.commonService.SetNewrelic('QMS', 'CD', 'getGroupInfo');
    const result = await this.spService.getGroupInfo(this.globalConstant.Groups.CDAdmin);
    this.global.cdAdmins = result.results ? result.results : [];
    this.global.currentUser.isCDAdmin = this.global.cdAdmins.find(t => t.Id === this.global.currentUser.userId) ? true : false;
    // const lastMonthDate = new Date();
    // const daysPrior = 180;
    // lastMonthDate.setDate(lastMonthDate.getDate() - daysPrior);
    //let startDate = new Date(new Date(lastMonthDate.setHours(0, 0, 0, 0))).toISOString();
    let startDate = new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)).toISOString();
    let endDate = new Date().toISOString();
    if (filterObj && filterObj.startDate) {
      startDate = new Date(new Date(filterObj.startDate).setHours(0, 0, 0, 1)).toISOString();
      endDate = new Date(new Date(filterObj.endDate).setHours(23, 59, 59, 59)).toISOString();
    }

    let qcUrl = {};
    if (this.global.currentUser.isCDAdmin) {
      qcComponent.getQCAdmin.top = qcComponent.getQCAdmin.top.replace('{{TopCount}}', '4900');
      qcComponent.getQCAdmin.filter = qcComponent.getQCAdmin.filter.replace('{{startDate}}', startDate)
        .replace('{{endDate}}', endDate);
      if (filterObj && filterObj.selectedStatus && filterObj.selectedStatus.type !== 'All') {
        // tslint:disable: quotemark
        const validityStatus = filterObj.selectedStatus.type.indexOf('Closed') > -1 ? filterObj.selectedStatus.type.split(' - ')[1] === 'Valid' ? '1' : '0' : '';
        qcComponent.getQCAdmin.filter = validityStatus ? qcComponent.getQCAdmin.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type.split(' - ')[0] + "' and IsActive eq " + validityStatus + " and ") :
          qcComponent.getQCAdmin.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type + "' and ");
      } else {
        qcComponent.getQCAdmin.filter = qcComponent.getQCAdmin.filter.replace('{{statusFilter}}', '');
      }
      qcUrl = qcComponent.getQCAdmin;
    } else {
      // REST API url in contants file
      qcComponent.getQC.top = qcComponent.getQC.top.replace('{{TopCount}}', '4900');
      qcComponent.getQC.filter = qcComponent.getQC.filter.replace('{{startDate}}', startDate)
        .replace('{{endDate}}', endDate);
      if (filterObj && filterObj.selectedStatus && filterObj.selectedStatus.type !== 'All') {
        const validityStatus = filterObj.selectedStatus.type.indexOf('Closed') > -1 ? filterObj.selectedStatus.type.split(' - ')[1] === 'Valid' ? '1' : '0' : '';
        qcComponent.getQC.filter = validityStatus ? qcComponent.getQC.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type.split(' - ')[0] + "' and IsActive eq " + validityStatus + " and ") :
          qcComponent.getQC.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type + "' and ");
      } else {
        qcComponent.getQC.filter = qcComponent.getQC.filter.replace('{{statusFilter}}', "Status ne 'Deleted' and ");
      }
      qcUrl = qcComponent.getQC;
    }
    this.commonService.SetNewrelic('QMS', 'ClientFeedback-cd-getQCItems', 'readItems');
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.QualityComplaints.name, qcUrl);
    const arrQCs = arrResult.length > 0 ? this.appendPropertyTOObject(arrResult) : [];
    return arrQCs;
  }

  /**
   * Appends property to array of CD line items (Logged in user is ASD or TL)
   * @param arrResult - returns new array
   */
  appendPropertyTOObject(arrResult) {
    const currentUserId = this.global.currentUser.userId;
    const datePipe = this.datepipe;
    arrResult.map((cd) => {
      let validity = 'valid';
      const asd = cd.ASD.results ? cd.ASD.results.filter(qc => qc.ID === currentUserId) : [];
      const tl = cd.TL.results ? cd.TL.results.filter(qc => qc.ID === currentUserId) : [];
      cd.isLoggedInASD = asd.length > 0 ? true : false;
      cd.isLoggedInTL = tl.length > 0 ? true : false;
      cd.formattedSentDate = datePipe.transform(cd.SentDate, 'd MMM, yyyy');
      cd.fullUrl = window.location.origin + '/' + cd.FileURL;
      validity = cd.IsActive === true ? this.globalConstant.cdStatus.Valid : this.globalConstant.cdStatus.InValid;
      cd.Status = cd.Status === this.globalConstant.cdStatus.Closed ? cd.Status + ' - ' + validity : cd.Status;
      return cd;
    });
    return arrResult;
  }

  /**
   * called when filter is applied to CD Tab
   */
  // filterObj = {
  //   cdStatus: ['All', 'Created', 'Accountable Resource Identified', 'Closure Awaited', 'Closed'],
  //   selectedStatus: null,
  //   dateRange: null,
  //   startDate: null,
  //   endDate: null
  // };

  async applyFilters(filterObj) {
    let arrQCs = [];
    arrQCs = await this.getQCItems(filterObj);
    this.bindTable(arrQCs);
  }

  /**
   * It binds table to html
   * @param arrayItems -  array of CD Items
   */
  bindTable(arrayItems) {
    this.CDRows = [];
    arrayItems.forEach(element => {
      this.CDRows.push({
        ASD: element.ASD,
        CS: element.CS,
        Category: element.Category ? element.Category : '',
        Comments: element.Comments,
        CorrectiveActions: element.CorrectiveActions,
        FileID: element.FileID,
        FileURL: element.FileURL,
        Id: element.Id,
        IdentifiedResource: element.IdentifiedResource ? element.IdentifiedResource : '',
        IsActive: element.IsActive,
        Modified: element.Modified,
        PreventiveActions: element.PreventiveActions,
        RejectionComments: element.RejectionComments,
        Resources: element.Resources,
        RootCauseAnalysis: element.RootCauseAnalysis,
        TL: element.TL,
        formattedSentDate: element.formattedSentDate,
        isLoggedInASD: element.isLoggedInASD,
        isLoggedInTL: element.isLoggedInTL,
        ID: element.ID,
        Title: element.Title,
        SentDate: element.SentDate ? new Date(this.datepipe.transform(element.SentDate, 'MMM d, yyyy')) : '',
        SentBy: element.SentBy.Title ? element.SentBy.Title : '',
        Status: element.Status ? element.Status : '',
        Accountable: element.Category ? element.Category : '',
        SeverityLevel: element.SeverityLevel ? element.SeverityLevel : '',
        Segregation: element.Segregation ? element.Segregation : '',
        BusinessImpact: element.BusinessImpact ? element.BusinessImpact : '',
        FullUrl: element.fullUrl
      });
    });
    this.colFilters(this.CDRows);
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }

  // /**
  //  * Listens to child component success message
  //  *
  //  *
  //  */
  // callParentSuccessMsg(message) {
  //   this.success.next(message);
  // }

  showToastMsg(obj) {
    this.messageService.add({ severity: obj.type, summary: obj.msg, detail: obj.detail });
  }

  /**
   * It subscribes success msg of angular bootstrap alert msg
   */
  // initializeMsg() {
  //   this.success.subscribe((message) => this.successMessage = message);
  //   this.success.pipe(
  //     debounceTime(5000)
  //   ).subscribe(() => this.successMessage = null);
  // }

  /**
   * Fetches all RCA and ClientSatisfaction url for CD clicked
   * @param event - button clicked
   * @param popupComponentRef popup component reference
   * @param cdRow - CD row
   */

  viewCDFiles(event, popupComponentRef, cdRow) {
    popupComponentRef.openPopup(event, cdRow, 'lg');
  }
  /**
   * Search value from input text
   * @param filterValue - typed value
   */
  search(filterValue) {
    this.CDRows.filter = filterValue.trim().toLowerCase();
  }

  // /**
  //  * Dismiss popup
  //  */
  // close() {
  //   this.modalService.dismissAll();
  // }

  /**
   * update CD table after accountable resource identified in actions popup component
   *
   */
  updateCDTable(cd) {
    const qcItem = this.qcs.filter(qc => qc.ID === +cd.qcID);
    if (qcItem.length > 0) {
      // update tabe row columns
      qcItem[0].Status = cd.status;
      qcItem[0].Category = cd.selectedAccountableGroup ? cd.selectedAccountableGroup : null;
      qcItem[0].BusinessImpact = cd.selectedBusinessImpact ? cd.selectedBusinessImpact : null;
      qcItem[0].SeverityLevel = cd.selectedCDCategory ? cd.selectedCDCategory : null;
      qcItem[0].Comments = cd.resourceIdentifiedComments ? cd.resourceIdentifiedComments : null;
      qcItem[0].RootCauseAnalysis = cd.rcaComments ? cd.rcaComments : null;
      qcItem[0].CorrectiveActions = cd.caComments ? cd.caComments : null;
      qcItem[0].PreventiveActions = cd.paComments ? cd.paComments : null;
      qcItem[0].IsActive = cd.isActive;
      qcItem[0].RejectionComments = cd.rejectionComments ? cd.rejectionComments : null;
      qcItem[0].Segregation = cd.selectedSegregation ? cd.selectedSegregation : null;
      qcItem[0].Title = cd.projectCode ? cd.projectCode : qcItem[0].Title;
    }
    this.bindTable(this.qcs);
  }

  /**
   * Dynamically hide columns based on permission( used in html)
   */
  // hideColumn(): string {
  //   return this.global.currentUser.isCDAdmin ? null : 'hidden-column';
  // }

  openMenuPopup(data, popUpData) {
    this.items = [
      { label: 'Update and close CD', title: 'Update and close CD', id: 'close', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: ((data.Status === this.globalConstant.cdStatus.Created && data.Title !== 'TBD') || data.Status === this.globalConstant.cdStatus.Rejected) && (data.isLoggedInASD || this.global.currentUser.isCDAdmin) },
      { label: 'Delete CD', title: 'Delete CD', id: 'delete', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.Created && data.Title !== 'TBD' && this.global.currentUser.isCDAdmin },
      { label: 'Mark as valid CD', title: 'Mark as valid CD', id: 'valid', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.ValidationPending && this.global.currentUser.isCDAdmin },
      { label: 'Mark as invalid CD', title: 'Mark as invalid CD', id: 'invalid', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.ValidationPending && this.global.currentUser.isCDAdmin },
      { label: 'Reject and send for correction', title: 'Reject and send for correction', id: 'reject', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.ValidationPending && this.global.currentUser.isCDAdmin },
      { label: 'Tag to Project / Client', title: 'Tag to Project / Client', id: 'tag', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.Created && data.Title === 'TBD' && this.global.currentUser.isCDAdmin },
      { label: 'View Comments', title: 'View Comments', id: 'viewComments', command: (e) => this.CDPopup.openPopup(e.originalEvent, data), visible: data.Status !== this.globalConstant.cdStatus.Created && data.Status !== this.globalConstant.cdStatus.Deleted }
    ];
  }

  downloadExcel(cd) {
    cd.exportCSV();
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className.indexOf('pi pi-ellipsis-v') > -1) {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = '';
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = '';
      }

    } else {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        this.tempClick = undefined;
      }
    }
  }



  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.CDRows.length && this.isOptionFilter) {
      let obj = {
        tableData: this.cdTable,
        colFields: this.CDColArray
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
}
