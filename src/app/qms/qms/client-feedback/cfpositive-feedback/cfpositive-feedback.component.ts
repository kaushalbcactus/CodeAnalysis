import { QMSCommonService } from './../../services/qmscommon.service';
import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ConstantsService } from '../../../../Services/constants.service';
import { Router, NavigationEnd } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { SPCommonService } from '../../../../Services/spcommon.service';
import { GlobalService } from '../../../../Services/global.service';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { FilterComponent } from '../filter/filter.component';
import { MenuItem, MessageService } from 'primeng/api';
import { PopupComponent } from './popup/popup.component'
import { QMSConstantsService } from '../../services/qmsconstants.service';
@Component({
  selector: 'app-cfpositive-feedback',
  templateUrl: './cfpositive-feedback.component.html',
  styleUrls: ['./cfpositive-feedback.component.css']
})
export class CFPositiveFeedbackComponent implements OnInit, OnDestroy {
  tempClick: any;
  CFColumns = [];
  CFRows = [];
  items: MenuItem[];
  private cfPFNavigationSubscription;
  
  @ViewChild('positveFilter', { static: true }) filter: FilterComponent;
  @ViewChild('PFPopup', { static: true }) PFPopup: PopupComponent;
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
  constructor(private router: Router, private globalConstant: ConstantsService, private spCommon: SPCommonService,
              private global: GlobalService, private datepipe: DatePipe, private spService: SPOperationService, private messageService: MessageService,
              private qmsConstant: QMSConstantsService, private qmsCommon: QMSCommonService) {
    this.cfPFNavigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseCFPositive();
      }
    });
  }

  async ngOnInit() {
  }


  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.cfPFNavigationSubscription) {
      this.cfPFNavigationSubscription.unsubscribe();
    }
  }

  protected initialiseCFPositive() {
    this.pfs = [];
    this.showLoader();
    this.CFColumns = [
      { field: 'ID', header: 'ID' },
      { field: 'Title', header: 'Project Code' },
      { field: 'Status', header: 'Status' },
      { field: 'SentDate', header: 'Sent Date' },
      { field: 'SentBy', header: 'Sent By' },
      { field: 'Resources', header: 'Resources' },
    ];
    setTimeout(async () => {
      this.pfs = await this.getPFItems();
      this.bindTable(this.pfs);
      this.showTable();
    }, 500);
  }

  colFilters(colData) {
    //
    // tslint:disable: max-line-length
    this.CFPositiveColArray.ID = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.ID, value: a.ID, filterValue: +a.ID  }; return b; }));
    this.CFPositiveColArray.Title = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Title, value: a.Title, filterValue: a.Title }; return b; }));
    this.CFPositiveColArray.Status = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Status, value: a.Status, filterValue: a.Status }; return b; }));
    this.CFPositiveColArray.SentDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
      label: this.datepipe.transform(a.SentDate, 'MMM d, yyyy'),
      value: this.datepipe.transform(a.SentDate, 'MMM d, yyyy') ? this.datepipe.transform(a.SentDate, 'MMM d, yyyy') : '' ,
      filterValue: new Date(a.SentDate) };
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
    const result = await this.spService.getGroupInfo(this.globalConstant.Groups.PFAdmin);
    this.global.pfAdmins = result.results ? result.results : [];
    this.global.currentUser.isPFAdmin = this.global.pfAdmins.find(t => t.Id === this.global.sharePointPageObject.userId) ? true : false;
    const lastMonthDate = new Date();
    const daysPrior = 30;
    lastMonthDate.setDate(lastMonthDate.getDate() - daysPrior);
    let startDate = new Date(new Date(lastMonthDate.setHours(0, 0, 0, 1))).toISOString();
    let endDate = new Date().toISOString();
    if (filterObj && filterObj.startDate) {
      startDate = new Date(new Date(filterObj.startDate).setHours(0, 0, 0, 1)).toISOString();
      endDate = new Date(new Date(filterObj.endDate).setHours(11, 59, 59, 59)).toISOString();
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
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.PositiveFeedbacks.name, pfUrl);
    const arrPFs = arrResult.length > 0 ? this.appendPropertyTOObject(arrResult) : [];
    return arrPFs;
  }

  /**
   * Append property to each object so it can be searchable in displayed format
   * @param arrResult
   */
  appendPropertyTOObject(arrResult) {
    const currentUserId = this.global.sharePointPageObject.userId;
    const datePipe = this.datepipe;
    arrResult.map((pf) => {
      const deliveryLeads = pf.DeliveryLeads.results ? pf.DeliveryLeads.results.filter(a => a.ID === currentUserId) : [];
      pf.isLoggedInDeliveryLead = deliveryLeads.length > 0 ? true : false;
      pf.formattedSentDate = datePipe.transform(pf.SentDate, 'd MMM, yyyy');
      pf.resources = pf.Resources.results ? pf.Resources.results.map(a => a.Title) : [];
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
    arrayItems.forEach(element => {
      this.CFRows.push({
        DeliveryLeads: element.DeliveryLeads,
        FileID: element.FileID,
        Modified: element.Modified,
        formattedSentDate: element.formattedSentDate,
        resources: element.Resources,
        ID: element.ID,
        Id: element.Id,
        Title: element.Title,
        Status: element.Status,
        SentDate: this.datepipe.transform(element.SentDate, 'MMM d, yyyy'),
        SentBy: element.SentBy.Title,
        Resources: element.resources,
        FileUrl: element.FileURL,
        IsActive: element.IsActive,
        isLoggedInDeliveryLead: element.isLoggedInDeliveryLead
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
    if (filterObj.startDate) {
      arrPFs = await this.getPFItems(filterObj);
    }
    this.bindTable(arrPFs);
  }

  /**
   * updates CD
   * @param cdDetails- detals that needs to be updated
   */
  savePF(pfDetails, pf) {
    this.spService.updateItem(this.globalConstant.listNames.PositiveFeedbacks.name, pf.ID, pfDetails);

    this.showToastMsg({type: 'success', msg: 'Success', detail: 'Positive Feedback sent by ' + pf.SentBy.Title + ' is ' + pf.Status + '.'});
  }

  showToastMsg(obj) {
    this.messageService.add({severity: obj.type, summary: obj.msg, detail: obj.detail});
  }

  showColumn(): string {
    return this.global.currentUser.isPFAdmin ? null : 'hidden-row';
  }

  /**
   * update PF table after accountable resource identified in actions popup component
   *
   */
  updatePFTable(pf) {
    const pfItem = this.pfs.filter(p => p.ID === +pf.pfID);
    if (pfItem.length > 0) {
      pfItem[0].Title = pf.projectCode ? pf.projectCode : pfItem[0].Title;
      pfItem[0].resources = pf.resources.results ? pf.resources.results.map(a => a.Title) : '';
      pfItem[0].Status = pf.Status ? pf.Status : pfItem[0].Status;
    }
    this.bindTable(this.pfs);
  }

  openMenuPopup(data) {
    this.items = [
      { label: 'Tag to Project / Client', title: 'Tag to Project / Client', id: 'tag', command: (e) => this.PFPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.pfStatus.Pending && data.Title === 'TBD' && this.global.currentUser.isPFAdmin },
      { label: 'Accept', title: 'Accept', id: 'accept', command: (e) => this.PFPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.pfStatus.Pending && data.Title !== 'TBD' && (data.isLoggedInDeliveryLead || this.global.currentUser.isPFAdmin) },
      { label: 'Reject', title: 'Reject', id: 'reject', command: (e) => this.PFPopup.openPopup(e.originalEvent, data), visible: data.Status === this.globalConstant.pfStatus.Pending && data.Title !== 'TBD' && (data.isLoggedInDeliveryLead || this.global.currentUser.isPFAdmin) }
    ];
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
}