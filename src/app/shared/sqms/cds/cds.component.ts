import { Component, OnInit, HostListener, ViewChild, Input, ChangeDetectorRef, AfterViewChecked, DoCheck } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { QMSCommonService } from 'src/app/qms/qms/services/qmscommon.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { QMSConstantsService } from 'src/app/qms/qms/services/qmsconstants.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { CddetailsComponent } from './cddetails/cddetails.component';
import { DataService } from 'src/app/Services/data.service';
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-cds',
  templateUrl: './cds.component.html',
  styleUrls: ['./cds.component.css']
})
export class CdsComponent implements OnInit, AfterViewChecked, DoCheck {
  isOptionFilter: boolean;
  @Input() filterObj: any;
  @Input() cdStatus;
  @Input() readOnly;
  @ViewChild('cd', { static: false }) cdTable: Table;
  CDColumns = [];
  CDRows = [];
  tempClick: any;
  items: MenuItem[];

  // tslint:disable: max-line-length
  public hideLoader = true;
  public hideTable = false;
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
    private qmsConstant: QMSConstantsService,
    private qmsCommon: QMSCommonService,
    private cdr: ChangeDetectorRef,
    public dialogService: DialogService,
    public common: CommonService,
    public constants: ConstantsService
  ) {
  }
  ngOnInit() {
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
    setTimeout(async () => {
      await this.applyFilters(this.filterObj);
      this.showTable();
    }, 500);
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

  ngDoCheck() {
    this.cdr.markForCheck();
  }

  /**
   *  Fetches CD for past 30 days by default where current user is part of resource in CD line item
   *  return array of CD
   */
  protected async getQCItems(filterObj?): Promise<[]> {
    const qcComponent = JSON.parse(JSON.stringify(this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent));
    this.commonService.SetNewrelic('QMS', 'SQMS-CD', 'getGroupInfo', "GET");
    const result = await this.spService.getGroupInfo(this.globalConstant.Groups.CDAdmin);
    this.global.cdAdmins = result.results ? result.results : [];
    this.global.currentUser.isCDAdmin = this.global.cdAdmins.find(t => t.Id === this.global.currentUser.userId) ? true : false;
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
        const validityStatus = filterObj.selectedStatus.type.indexOf('Closed') > -1 ? filterObj.selectedStatus.type.split(' - ')[1] === 'Valid' ? 'Yes' : 'No' : '';
        qcComponent.getQCAdmin.filter = validityStatus ? qcComponent.getQCAdmin.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type.split(' - ')[0] + "' and IsActiveCH eq '" + validityStatus + "' and ") :
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
        const validityStatus = filterObj.selectedStatus.type.indexOf('Closed') > -1 ? filterObj.selectedStatus.type.split(' - ')[1] === 'Valid' ? 'Yes' : 'No' : '';
        qcComponent.getQC.filter = validityStatus ? qcComponent.getQC.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type.split(' - ')[0] + "' and IsActiveCH eq '" + validityStatus + "' and ") :
          qcComponent.getQC.filter.replace('{{statusFilter}}', "Status eq '" + filterObj.selectedStatus.type + "' and ");
      } else {
        qcComponent.getQC.filter = qcComponent.getQC.filter.replace('{{statusFilter}}', "Status ne 'Deleted' and ");
      }
      qcUrl = qcComponent.getQC;
    }
    this.commonService.SetNewrelic('QMS', 'SQMS-CD', 'ClientFeedback-cd-getQCItems', "GET");
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.QualityComplaints.name, qcUrl);
    const arrQCs = arrResult.length > 0 ? this.appendPropertyTOObject(arrResult) : [];
    return arrQCs;
  }

  async getCDItemsByProject(topCount, projectCode) {
    // REST API url in contants file
    const qcComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.External));
    qcComponent.getQCByProject.top = qcComponent.getQCByProject.top.replace('{{TopCount}}', '' + topCount);
    qcComponent.getQCByProject.filter = qcComponent.getQCByProject.filter.replace('{{projectCode}}', projectCode);
    this.commonService.SetNewrelic('QMS', 'SQMS-CD', 'personalfeedback-getCDItemsByProject', "GET");
    let qcs = await this.spService.readItems(this.globalConstant.listNames.QualityComplaints.name,
      qcComponent.getQCByProject);
    qcs = qcs.length > 0 ? qcs.sort((a, b) => new Date(a.SentDate).getTime() - new Date(b.SentDate).getTime()) : [];
    return this.appendPropertyTOObject(qcs);
  }

  async getMyQCItems(filterObj) {
    const topCount = filterObj.isDateFilter ? 4500 : filterObj.count;
    let startDate = filterObj.isDateFilter ? new Date(filterObj.startDate).toISOString() : '';
    let endDate = filterObj.isDateFilter ? new Date(filterObj.endDate).toISOString() : '';
    startDate = startDate ? startDate : new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();
    // REST API url in contants file
    const qcComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.External));
    qcComponent.getQC.top = qcComponent.getQC.top.replace('{{TopCount}}', '' + topCount);
    qcComponent.getQC.filter = qcComponent.getQC.filter.replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    this.commonService.SetNewrelic('QMS', 'SQMS-CD', 'personalfeedback-external-getQCItems', "GET");
    let qcs = await this.spService.readItems(this.globalConstant.listNames.QualityComplaints.name,
      qcComponent.getQC);
    qcs = qcs.length > 0 ? qcs.sort((a, b) => new Date(a.SentDate).getTime() - new Date(b.SentDate).getTime()) : [];
    return this.appendPropertyTOObject(qcs);
  }

  /**
   * Appends property to array of CD line items (Logged in user is ASD or TL)
   * @param arrResult - returns new array
   */
  appendPropertyTOObject(arrResult) {
    const currentUserId = this.global.currentUser.userId;
    const datePipe = this.datepipe;
    arrResult.map((cd) => {
      let validity = this.globalConstant.cdStatus.Valid;
      const asd = cd.ASD && cd.ASD.results ? cd.ASD.results.filter(qc => qc.ID === currentUserId) : [];
      const tl = cd.TL && cd.TL.results ? cd.TL.results.filter(qc => qc.ID === currentUserId) : [];
      cd.isLoggedInASD = asd.length > 0 ? true : false;
      cd.isLoggedInTL = tl.length > 0 ? true : false;
      cd.formattedSentDate = datePipe.transform(cd.SentDate, 'd MMM, yyyy');
      cd.fullUrl = window.location.origin + '/' + cd.FileURL;
      validity = cd.IsActiveCH === 'Yes' ? this.globalConstant.cdStatus.Valid : this.globalConstant.cdStatus.InValid;
      cd.Status = cd.Status === this.globalConstant.cdStatus.Closed ? cd.Status + ' - ' + validity : cd.Status;
      return cd;
    });
    return arrResult;
  }

  async applyFilters(filterObj) {
    let arrQCs = [];
    if (filterObj && filterObj.projectCode) {
      // used at mytimeline tab
      arrQCs = await this.getCDItemsByProject(4500, filterObj.projectCode);
    } else if (this.cdStatus) {
      arrQCs = await this.getQCItems(filterObj);
    } else {
      arrQCs = await this.getMyQCItems(filterObj);
    }
    this.bindTable(arrQCs);
    this.qcs = arrQCs;
  }

  /**
   * It binds table to html
   * @param arrayItems -  array of CD Items
   */
  bindTable(arrayItems) {
    this.CDRows = [];
    arrayItems.forEach(async element => {
      this.CDRows.push({
        ASD: element.ASD,
        CS: element.CS,
        Category: element.CategoryST ? element.CategoryST : '',
        Comments: element.CommentsMT,
        CorrectiveActions: element.CorrectiveActions,
        FileID: element.FileID,
        FileURL: element.FileURL,
        Id: element.Id,
        IsActive: element.IsActiveCH,
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
        SentBy:  element.SurveyResponse.ID  ?  await this.getNameFromPOC(element.EmailAddress)    : element.SentBy.Title ? element.SentBy.Title : '',
        Status: element.Status ? element.Status : '',
        Accountable: element.CategoryST ? element.CategoryST : '',
        SeverityLevel: element.SeverityLevel ? element.SeverityLevel : '',
        Segregation: element.Segregation ? element.Segregation : '',
        BusinessImpact: element.BusinessImpact ? element.BusinessImpact : '',
        FullUrl: element.fullUrl,
        IdentifiedResource: element.IdentifiedResource ? element.IdentifiedResource : '',
        SurveyResponse : element.SurveyResponse.ID,
        EmailAddress : element.EmailAddress 
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

  showToastMsg(obj) {
    this.commonService.showToastrMessage(obj.type, obj.detail, false);
  }

  /**
   * Search value from input text
   * @param filterValue - typed value
   */
  search(filterValue) {
    this.CDRows.filter = filterValue.trim().toLowerCase();
  }

  /**
   * update CD table after accountable resource identified in actions popup component
   *
   */
  updateCDTable(cd) {
    const qcItem = this.qcs.filter(qc => qc.ID === +cd.qcID);
    if (qcItem.length > 0) {
      // update tabe row columns
      qcItem[0].Status = cd.status;
      qcItem[0].CategoryST = cd.selectedAccountableGroup ? cd.selectedAccountableGroup : null;
      qcItem[0].BusinessImpact = cd.selectedBusinessImpact ? cd.selectedBusinessImpact : null;
      qcItem[0].SeverityLevel = cd.selectedCDCategory ? cd.selectedCDCategory : null;
      qcItem[0].CommentsMT = cd.resourceIdentifiedComments ? cd.resourceIdentifiedComments : null;
      qcItem[0].RootCauseAnalysis = cd.rcaComments ? cd.rcaComments : null;
      qcItem[0].CorrectiveActions = cd.caComments ? cd.caComments : null;
      qcItem[0].PreventiveActions = cd.paComments ? cd.paComments : null;
      qcItem[0].IsActiveCH = cd.isActive;
      qcItem[0].RejectionComments = cd.rejectionComments ? cd.rejectionComments : null;
      qcItem[0].Segregation = cd.selectedSegregation ? cd.selectedSegregation : null;
      qcItem[0].Title = cd.projectCode ? cd.projectCode : qcItem[0].Title;
      qcItem[0].TL = cd.TL ? cd.TL : qcItem[0].TL;
      qcItem[0].ASD = cd.ASD ? cd.ASD : qcItem[0].ASD;
      qcItem[0].CS = cd.CS ? cd.CS : qcItem[0].CS;
    }
    this.bindTable(this.qcs);
  }

  openMenuPopup(data, popUpData) {
    this.items = [
      { label: 'Update and close CD', title: 'Update and close CD', id: 'close', command: (e) => this.openPopup(e.originalEvent, data), visible: ((data.Status === this.globalConstant.cdStatus.Created && data.Title !== 'TBD') || data.Status === this.globalConstant.cdStatus.Rejected) && (data.isLoggedInASD || this.global.currentUser.isCDAdmin) && !this.readOnly },
      { label: 'Delete CD', title: 'Delete CD', id: 'delete', command: (e) => this.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.Created && data.Title !== 'TBD' && this.global.currentUser.isCDAdmin && !this.readOnly },
      { label: 'Mark as valid CD', title: 'Mark as valid CD', id: 'valid', command: (e) => this.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.ValidationPending && this.global.currentUser.isCDAdmin && !this.readOnly },
      { label: 'Mark as invalid CD', title: 'Mark as invalid CD', id: 'invalid', command: (e) => this.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.ValidationPending && this.global.currentUser.isCDAdmin && !this.readOnly },
      { label: 'Reject and send for correction', title: 'Reject and send for correction', id: 'reject', command: (e) => this.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.cdStatus.ValidationPending && this.global.currentUser.isCDAdmin && !this.readOnly },
      { label: 'View Comments', title: 'View Comments', id: 'viewComments', command: (e) => this.openPopup(e.originalEvent, data), visible: (data.Status !== this.globalConstant.cdStatus.Created && data.Status !== this.globalConstant.cdStatus.Deleted) || data.SurveyResponse ? true : false }
    ];
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


  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.CDRows.length && this.isOptionFilter) {
      const obj = {
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

  async openPopup(event, data) {

    const actionClicked = event.currentTarget.id;
    const actionClickedTitle = event.currentTarget.title; 
    if(data.SurveyResponse && event.currentTarget.id === 'viewComments')
    {
      const getSurveyResInfo = Object.assign({}, this.qmsConstant.ClientFeedback.GET_SURVEYRESPONSE_BY_ID);
      getSurveyResInfo.filter = getSurveyResInfo.filter.replace(/{{ID}}/gi,
        data.SurveyResponse);
      this.common.SetNewrelic('cds', 'shared-module', 'getSurveyResInfo');
      const results = await this.spService.readItems(this.constants.listNames.SurveyResponse.name, getSurveyResInfo);

      data.ClientComments = results && results.length > 0 ? results[0].CommentsMT : '';
    }
   
    const ref = this.dialogService.open(CddetailsComponent, {
      data: {
        ...data,
        allResources: this.common.sharedObject.allResources,
        actionClicked: actionClicked,
        actionClickedTitle: actionClickedTitle
      },
      width: "75vw",
      header: actionClickedTitle,
      contentStyle: { "max-height": "82vh", "overflow-y": "auto" },
      closable: false
    });
    ref.onClose.subscribe((qcObj) => {
      if (qcObj.action !== 'Cancel') {
        this.updateCDTable(qcObj.qc);
        this.common.showToastrMessage(qcObj.msgType, qcObj.msg, false);
      }
    });
  }

  async getNameFromPOC(email){

    let response = email;
    const getPOCInfo = Object.assign({}, this.qmsConstant.ClientFeedback.GET_POC_By_Email);
    getPOCInfo.filter = getPOCInfo.filter.replace(/{{emailaddress}}/gi,
      email);
    this.common.SetNewrelic('cds', 'shared-module', 'getPOCinfo');
    const results = await this.spService.readItems(this.constants.listNames.ProjectContacts.name, getPOCInfo);

    if(results && results.length > 0 ){
       response = results[0].FName + ' ' + results[0].LName;
    }
    return response;
  }
}
