import { QMSCommonService } from './../../services/qmscommon.service';
import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ConstantsService } from '../../../../Services/constants.service';
import { Router, NavigationEnd } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { SPCommonService } from '../../../../Services/spcommon.service';
import { GlobalService } from '../../../../Services/global.service';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';
import { CommonService } from '../../../../Services/common.service';
import { DataService } from '../../../../Services/data.service';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { DataTable } from 'primeng/primeng';

@Component({
  selector: 'app-positive-feedback',
  templateUrl: './positive-feedback.component.html',
  styleUrls: ['./positive-feedback.component.css']
})
export class PositiveFeedbackComponent implements OnInit, OnDestroy {

  public extPFNavigationSubscription;
  public successMessage: string;
  private success = new Subject<string>();
  public hideLoader = true;
  public hideTable = false;
  private filterObj = {};
  public pfs = [];
  PFColumns: any[];
  PFRows: any = [];
  PFColArray = {
    ID: [],
    Title: [],
    SentDate: [],
    SentBy: [],
    Resources: []
  };
  public displayedCDColumns: string[] = ['ID', 'Title', 'SentDate', 'SentBy', 'Resources'];
  @ViewChild('pf', { static: false }) pfTable: DataTable;
  // tslint:disable: max-line-length
  constructor(
    private router: Router,
    private globalConstant: ConstantsService,
    private spCommon: SPCommonService,
    private qmsConstant: QMSConstantsService,
    public global: GlobalService,
    private datepipe: DatePipe,
    private commonService: CommonService,
    public data: DataService,
    public spService: SPOperationService,
    private qmsCommon: QMSCommonService,
    private cdr: ChangeDetectorRef,
  ) {
    this.extPFNavigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialisePFPositive();
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.extPFNavigationSubscription) {
      this.extPFNavigationSubscription.unsubscribe();
    }
  }

  colFilters(colData) {
    this.PFColArray.ID = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.ID, value: a.ID, filterValue: +a.ID }; return b; }));
    this.PFColArray.Title = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Title, value: a.Title, filterValue: a.Title }; return b; }));
    this.PFColArray.SentDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.SentDate, 'MMM d, yyyy'),
        value: a.SentDate ? new Date(this.datepipe.transform(a.SentDate, 'MMM d, yyyy')) : '',
        filterValue: new Date(a.SentDate)
      }; return b;
    }));
    this.PFColArray.SentBy = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.SentBy, value: a.SentBy, filterValue: a.SentBy.Title }; return b; }));
  }

  protected initialisePFPositive() {
    this.pfs = [];
    this.PFColumns = [
      { field: 'ID', header: 'ID' },
      { field: 'Title', header: 'Project Code' },
      { field: 'SentDate', header: 'Sent Date' },
      { field: 'SentBy', header: 'Sent By' },
      { field: 'resources', header: 'Resources' },
    ];
    this.showLoader();
    this.initializeMsg();
    setTimeout(async () => {
      this.data.filterObj.subscribe(filter => this.filterObj = filter);
      await this.applyFilters(this.filterObj);
      this.showTable();
    }, 500);
  }

  protected async getPFItems(topCount, startDate, endDate): Promise<[]> {
    // const previousYear = new Date().getFullYear() - 2;
    startDate = startDate ? startDate : new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();
    // REST API url in contants file

    const pfComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.PositiveFeedbacks));
    pfComponent.getPF.top = pfComponent.getPF.top.replace('{{TopCount}}', '' + topCount);
    pfComponent.getPF.filter = pfComponent.getPF.filter.replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    const arrResult = await this.spService.readItems(this.globalConstant.listNames.PositiveFeedbacks.name, pfComponent.getPF);
    this.global.templateMatrix.templates = arrResult.length > 0 ? arrResult : [];
    const arrPFs = arrResult.length > 0 ? this.appendPropertyTOObject(arrResult) : [];
    return arrPFs;
  }

  appendPropertyTOObject(arrResult) {
    const currentUserId = this.global.currentUser.userId;
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
   * It subscribes success msg of angular bootstrap alert msg
   */
  initializeMsg() {
    this.success.subscribe((message) => this.successMessage = message);
    this.success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
  }

  /**
   * It binds table to html
   * @param arrayItems -  array of CD Items
   */
  bindTable(arrayItems) {
    this.PFRows = [];
    arrayItems.forEach(element => {
      this.PFRows.push({
        Id: element.Id,
        ID: element.ID,
        Title: element.Title,
        SentDate: element.SentDate ? new Date(this.datepipe.transform(element.SentDate, 'MMM d, yyyy')) : '',
        SentBy: element.SentBy.Title ? element.SentBy.Title : '',
        resources: element.resources,
        fileUrl: element.FileURL.Url,
        DeliveryLeads: element.DeliveryLeads,
        FileID: element.FileID,
        Modified: element.Modified,
        formattedSentDate: element.formattedSentDate,
        isLoggedInDeliveryLead: element.isLoggedInDeliveryLead
      });
    });
  }

  async applyFilters(filterObj) {
    let arrPFs = [];
    if (filterObj.isDateFilter) {
      const startDate = new Date(filterObj.startDate).toISOString();
      const endDate = new Date(filterObj.endDate).toISOString();
      arrPFs = await this.getPFItems(4500, startDate, endDate);
    } else {
      arrPFs = await this.getPFItems(filterObj.count, '', '');
    }
    this.global.personalFeedback.external.qc = arrPFs[0];
    this.bindTable(arrPFs);
    this.colFilters(arrPFs);
  }

  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.PFRows.length && this.isOptionFilter) {
      let obj = {
        tableData: this.pfTable,
        colFields: this.PFColArray,
        // colFieldsArray: this.createColFieldValues(this.proformaTable.value)
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
