
import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked, Input, HostListener } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Table } from 'primeng/table';
import { ConstantsService } from 'src/app/Services/constants.service';
import { QMSConstantsService } from 'src/app/qms/qms/services/qmsconstants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { QMSCommonService } from 'src/app/qms/qms/services/qmscommon.service';
import { MenuItem} from 'primeng';

@Component({
  selector: 'app-pfs',
  templateUrl: './pfs.component.html',
  styleUrls: ['./pfs.component.css']
})
export class PfsComponent implements OnInit, AfterViewChecked {
  @Input() filterObj;
  @Input() parentComponent;
  isOptionFilter: boolean;
  viewComments: boolean = false;
  comments: any = null;
  constructor(
    private globalConstant: ConstantsService,
    private global: GlobalService,
    private datepipe: DatePipe,
    private spService: SPOperationService,
    private qmsConstant: QMSConstantsService,
    private qmsCommon: QMSCommonService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    public common: CommonService,
    public constants: ConstantsService
  ) {
  }
  tempClick: any;
  CFColumns = [];
  CFRows = [];
  items: MenuItem[];
  @ViewChild('cfp', { static: false }) cfpositiveTable: Table;

  public hideLoader = true;
  public hideTable = false;
  public pfs = [];
  public CFPositiveColArray = {
    ID: [],
    Title: [],
    SentDate: [],
    SentBy: [],
    Status: [],
    Resources: []
  };
  async ngOnInit() {
    this.initialiseCFPositive();
  }


  protected initialiseCFPositive() {
    this.pfs = [];
    this.showLoader();
    this.CFColumns = [
      { field: 'ID', header: 'ID' },
      { field: 'Title', header: 'Project Code' },
      { field: 'SentDate', header: 'Sent Date' },
      { field: 'SentBy', header: 'Sent By' },
      { field: 'Resources', header: 'Resources' },
      { field: '', header: '' },
    ];
    if (this.parentComponent === 'clientFeedback') {
      this.CFColumns.splice(2, 0, { field: 'Status', header: 'Status' });
    }
    setTimeout(async () => {
      await this.applyFilters(this.filterObj);
      this.showTable();
    }, 500);
  }

  colFilters(colData) {
    //
    // tslint:disable: max-line-length
    this.CFPositiveColArray.ID = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.ID, value: a.ID, filterValue: +a.ID }; return b; }));
    this.CFPositiveColArray.Title = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Title, value: a.Title, filterValue: a.Title }; return b; }));
    this.CFPositiveColArray.Status = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Status, value: a.Status, filterValue: a.Status }; return b; }));
    this.CFPositiveColArray.SentDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.SentDate, 'MMM d, yyyy'),
        value: a.SentDate ? new Date(this.datepipe.transform(a.SentDate, 'MMM d, yyyy')) : '',
        filterValue: new Date(a.SentDate)
      };
      return b;
    }));
    this.CFPositiveColArray.SentBy = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.SentBy, value: a.SentBy, filterValue: a.SentBy }; return b; }));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    }).sort((a, b) => (a.value > b.value) ? 1 : -1);
  }

  /**
   * Get positive feedback items from POsitiveFeedbacks list
   */
  protected async getPFItems(filterObj?): Promise<[]> {
    const pfComponent = JSON.parse(JSON.stringify(this.qmsConstant.ClientFeedback.PositiveFeedbackComponent));
    this.commonService.SetNewrelic('QMS', 'cfpositive-feedback', 'getGroupInfo');
    const result = await this.spService.getGroupInfo(this.globalConstant.Groups.PFAdmin);
    this.global.pfAdmins = result.results ? result.results : [];
    this.global.currentUser.isPFAdmin = this.global.pfAdmins.find(t => t.Id === this.global.currentUser.userId) ? true : false;
    let startDate = new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)).toISOString();
    let endDate = new Date().toISOString();
    if (filterObj && filterObj.startDate) {
      startDate = new Date(new Date(filterObj.startDate).setHours(0, 0, 0, 1)).toISOString();
      endDate = new Date(new Date(filterObj.endDate).setHours(23, 59, 59, 59)).toISOString();
    }
    // REST API url in contants file
    let pfUrl = {};
    if (this.global.currentUser.isPFAdmin) {
      pfComponent.getPFAdmin.top = pfComponent.getPFAdmin.top.replace('{{TopCount}}', '4900');
      pfComponent.getPFAdmin.filter = pfComponent.getPFAdmin.filter
        .replace('{{startDate}}', startDate)
        .replace('{{endDate}}', endDate);
      pfUrl = pfComponent.getPFAdmin;
    } else {
      pfComponent.getPFAdmin.top = pfComponent.getPFAdmin.top.replace('{{TopCount}}', '4900');
      pfComponent.getPF.filter = pfComponent.getPF.filter
        .replace('{{startDate}}', startDate)
        .replace('{{endDate}}', endDate);
      pfUrl = pfComponent.getPF;
    }

    this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition', 'getPFItems');
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.PositiveFeedbacks.name, pfUrl);
    const arrPFs = arrResult.length > 0 ? this.appendPropertyTOObject(arrResult) : [];
    return arrPFs;
  }

  protected async getMyPFItems(filterObj): Promise<[]> {
    const topCount = filterObj.isDateFilter ? 4500 : filterObj.count;
    let startDate = filterObj.isDateFilter ? new Date(filterObj.startDate).toISOString() : '';
    let endDate = filterObj.isDateFilter ? new Date(filterObj.endDate).toISOString() : '';
    startDate = startDate ? startDate : new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();
    // REST API url in contants file

    const pfComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.PositiveFeedbacks));
    pfComponent.getPF.top = pfComponent.getPF.top.replace('{{TopCount}}', '' + topCount);
    pfComponent.getPF.filter = pfComponent.getPF.filter.replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    this.commonService.SetNewrelic('QMS', 'personalFeedback-positiveFeedback', 'getPFItems');
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.PositiveFeedbacks.name, pfComponent.getPF);
    this.global.templateMatrix.templates = arrResult.length > 0 ? arrResult : [];
    const arrPFs = arrResult.length > 0 ? this.appendPropertyTOObject(arrResult) : [];
    return arrPFs;
  }
  /**
   * Append property to each object so it can be searchable in displayed format
   * @param arrResult
   */
  appendPropertyTOObject(arrResult) {
    const currentUserId = this.global.currentUser.userId;
    const datePipe = this.datepipe;
    arrResult.map((pf) => {
      const deliveryLeads = pf.DeliveryLeads.results ? pf.DeliveryLeads.results.filter(a => a.ID === currentUserId) : [];
      pf.isLoggedInDeliveryLead = deliveryLeads.length > 0 ? true : false;
      pf.formattedSentDate = datePipe.transform(pf.SentDate, 'd MMM, yyyy');
      pf.resources = pf.Resources.results ? pf.Resources.results.map(a => a.Title) : [];
      pf.fullUrl = window.location.origin + '/' + pf.FileURL;
      return pf;
    });
    return arrResult;
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }


  /**
   * It binds table to html
   * @param arrayItems -  array of PF Items
   */
  bindTable(arrayItems) {
    this.CFRows = [];
    arrayItems.forEach(async element => {
      this.CFRows.push({
        DeliveryLeads: element.DeliveryLeads,
        FileID: element.FileID,
        Modified: element.Modified,
        formattedSentDate: element.formattedSentDate,
        resources: element.Resources,
        ID: element.ID,
        Id: element.Id,
        Status: element.Status,
        SentDate: element.SentDate ? new Date(this.datepipe.transform(element.SentDate, 'MMM d, yyyy')) : '',
        Title: element.Title ? element.Title : '',
        AssignedTo: element.AssignedTo ? element.AssignedTo : '',
        SentBy:  element.SurveyResponse.ID  ?  await this.getNameFromPOC(element.EmailAddress)    : element.SentBy.Title ? element.SentBy.Title : '',
        Resources: element.resources,
        FileUrl: element.FileURL,
        IsActive: element.IsActiveCH,
        isLoggedInDeliveryLead: element.isLoggedInDeliveryLead,
        fullUrl: element.fullUrl,
        EmailAddress: element.EmailAddress,
        SurveyResponse : element.SurveyResponse.ID
      });
    });
    this.colFilters(this.CFRows);
  }

  /**
   * Filter applied of date range to positive feedback
   *
   */
  async applyFilters(filterObj) {
    let arrPFs = this.pfs;
    if (filterObj && filterObj.projectCode) {
      arrPFs = await this.getPFItemsByProject(4500, filterObj.projectCode);
    } else if (this.parentComponent === 'clientFeedback') {
      arrPFs = await this.getPFItems(filterObj);
    } else {
      arrPFs = await this.getMyPFItems(filterObj);
    }
    this.bindTable(arrPFs);
    this.pfs = arrPFs;
  }

  /**
   * updates CD
   * @param cdDetails- detals that needs to be updated
   */
  savePF(pfDetails, pf) {

    this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition', 'savePF');
    this.spService.updateItem(this.globalConstant.listNames.PositiveFeedbacks.name, pf.ID, pfDetails);
    this.showToastMsg({ type: 'success', msg: 'Success', detail: 'Positive Feedback sent by ' + pf.SentBy.Title + ' is ' + pf.Status + '.' });
  }

  showToastMsg(obj) {
    this.commonService.showToastrMessage(obj.type, obj.detail, false);
  }

  showColumn(): string {
    return this.global.currentUser.isPFAdmin ? null : 'hidden-row';
  }

  openMenuPopup(data) {
    this.items = [
      { label: 'Reject', title: 'Reject', id: 'reject', command: (e) => this.rejectPF(data), visible: data.Status === this.globalConstant.pfStatus.Accepted && (data.isLoggedInDeliveryLead || this.global.currentUser.isPFAdmin) },
      { label: 'View Comments', title: 'View Comments', id: 'viewComments', command: (e) => this.showComments(data), visible: data.SurveyResponse ? true : false }

    ];
  }

  async showComments(data){

    const getSurveyResInfo = Object.assign({}, this.qmsConstant.ClientFeedback.GET_SURVEYRESPONSE_BY_ID);
    getSurveyResInfo.filter = getSurveyResInfo.filter.replace(/{{ID}}/gi,
      data.SurveyResponse);
    this.common.SetNewrelic('pfs', 'shared-module', 'getSurveyResInfo');
    const results = await this.spService.readItems(this.constants.listNames.SurveyResponse.name, getSurveyResInfo);

    if(results && results.length > 0 ){
      this.comments = results[0].CommentsMT;
    }
    this.viewComments = this.comments ? true : false;

    if(!this.viewComments){
      this.commonService.showToastrMessage(this.constants.MessageType.info,'Comments not added.',false);
    }
  }

  downloadExcel(cfp) {
    cfp.exportCSV();
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
    if (this.CFRows.length && this.isOptionFilter) {
      const obj = {
        tableData: this.cfpositiveTable,
        colFields: this.CFPositiveColArray,
      };
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.colFilters(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }
  async getPFItemsByProject(topCount, projectCode) {
    // REST API url in contants file
    const qcComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.PositiveFeedbacks));
    qcComponent.getPFByProject.top = qcComponent.getPFByProject.top.replace('{{TopCount}}', '' + topCount);
    qcComponent.getPFByProject.filter = qcComponent.getPFByProject.filter.replace('{{projectCode}}', projectCode);
    this.commonService.SetNewrelic('QMS', 'personalfeedback-getPFItemsByProject', 'readItems');
    let qcs = await this.spService.readItems(this.globalConstant.listNames.PositiveFeedbacks.name,
      qcComponent.getPFByProject);
    qcs = qcs.length > 0 ? qcs.sort((a, b) => new Date(a.SentDate).getTime() - new Date(b.SentDate).getTime()) : [];
    return this.appendPropertyTOObject(qcs);
  }

  rejectPF(data) {
    this.commonService.confirmMessageDialog('Confirmation', 'Are you sure you want to reject positive feedback ?', null, ['Yes', 'No'], false).then(async Confirmation => {
      if (Confirmation === 'Yes') {
        let pfDetails = {};
        pfDetails = {
          __metadata: { type: this.globalConstant.listNames.PositiveFeedbacks.type },
          Status: this.globalConstant.pfStatus.Rejected
        };
        this.update(pfDetails, data.ID);
        data.Status = this.globalConstant.pfStatus.Rejected;
        const msg = 'Positive feedback rejected.';
      }
    });
  }

  update(pfDetails, pfID) {
    this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition', 'updatepf');
    this.spService.updateItem(this.globalConstant.listNames.PositiveFeedbacks.name, pfID, pfDetails);
  }


  async getNameFromPOC(email){

    let response = email;
    const getPOCInfo = Object.assign({}, this.qmsConstant.ClientFeedback.GET_POC_By_Email);
    getPOCInfo.filter = getPOCInfo.filter.replace(/{{emailaddress}}/gi,
      email);
    this.common.SetNewrelic('pfs', 'shared-module', 'getPOCinfo');
    const results = await this.spService.readItems(this.constants.listNames.ProjectContacts.name, getPOCInfo);

    if(results && results.length > 0 ){
       response = results[0].FName + ' ' + results[0].LName;
    }
    return response;
  }


}
