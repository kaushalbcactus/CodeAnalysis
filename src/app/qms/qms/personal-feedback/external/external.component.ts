import { Component, OnDestroy, ViewChild, ApplicationRef, NgZone } from '@angular/core';
import { SPOperationService } from '../../../../Services/spoperation.service';
import { ConstantsService } from '../../../../Services/constants.service';
import { GlobalService } from '../../../../Services/global.service';
import { CommonService } from '../../../../Services/common.service';
import { DataService } from '../../../../Services/data.service';
import { Router, NavigationEnd } from '@angular/router';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { QMSCommonService } from '../../services/qmscommon.service';

@Component({
  selector: 'app-external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.css']
})
export class ExternalComponent implements OnDestroy {
  // @ViewChild(MatSort) eSort: MatSort;
  // public arrQCs = new MatTableDataSource([]);
  QCColumns: any[];
  QCRows: any = [];

  public displayedQCColumns: string[] = ['ID', 'Title', 'SentDate', 'SentBy', 'Status',
    'SeverityLevel', 'Accountable', 'Segregation', 'BusinessImpact'];
  // public filteredQCs =  new MatTableDataSource([]);
  public hideLoader = true;
  public hideTable = false;
  private filterObj = {};
  public cdNavigationSubscription;
  QCColArray = {
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
  constructor(private spService: SPOperationService, private datepipe: DatePipe, private globalConstant: ConstantsService,
    public global: GlobalService, public common: CommonService, public data: DataService, private router: Router,
    private qmsConstant: QMSConstantsService, private qmsCommon: QMSCommonService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {
    this.cdNavigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialisePFCD();
      }
    });

    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });

  }

  initialisePFCD() {
    this.showLoader();
    this.QCColumns = [
      { field: 'ID', header: 'ID' },
      { field: 'Title', header: 'Project Code' },
      { field: 'SentDate', header: 'Sent Date' },
      { field: 'SentBy', header: 'Sent By' },
      { field: 'Status', header: 'Status' },
      { field: 'SeverityLevel', header: 'CD Category' },
      { field: 'Accountable', header: 'Accountble' },
      { field: 'Segregation', header: 'Segregation' },
      { field: 'BusinessImpact', header: 'Business Imapact' }
    ];
    setTimeout(async () => {
      // Set default values and re-fetch any data you need.
      this.data.filterObj.subscribe(filter => this.filterObj = filter);
      await this.applyFilters(this.filterObj);
      this.showTable();
    }, 500);
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.cdNavigationSubscription) {
      this.cdNavigationSubscription.unsubscribe();
    }
  }

  colFilters(colData) {
    // tslint:disable: max-line-length
    this.QCColArray.ID = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.ID, value: a.ID, filterValue: +a.ID }; return b; }));
    this.QCColArray.Title = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Title, value: a.Title, filterValue: a.Title }; return b; }));
    this.QCColArray.SentDate = this.qmsCommon.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.SentDate, 'MMM d, yyyy') ? this.datepipe.transform(a.SentDate, 'MMM d, yyyy') : '',
        value: this.datepipe.transform(a.SentDate, 'MMM d, yyyy'),
        filterValue: new Date(a.SentDate)
      }; return b;
    }));
    this.QCColArray.SentBy = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.SentBy, value: a.SentBy, filterValue: a.SentBy }; return b; }));
    this.QCColArray.Status = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Status, value: a.Status, filterValue: a.Status }; return b; }));
    this.QCColArray.SeverityLevel = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.SeverityLevel, value: a.SeverityLevel, filterValue: a.SeverityLevel }; return b; }));
    this.QCColArray.Accountable = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Accountable, value: a.Accountable, filterValue: a.Accountable }; return b; }));
    this.QCColArray.Segregation = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.Segregation, value: a.Segregation, filterValue: a.Segregation }; return b; }));
    this.QCColArray.BusinessImpact = this.qmsCommon.uniqueArrayObj(colData.map(a => { const b = { label: a.BusinessImpact, value: a.BusinessImpact, filterValue: a.BusinessImpact }; return b; }));
  }

  /**
   * Get quality complaints fro tab under personal feedback
   *
   *
   *
   */
  async getQCItems(topCount, startDate, endDate) {
    // const previousYear = new Date().getFullYear() - 2;
    startDate = startDate ? startDate : new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
    endDate = endDate ? endDate : new Date().toISOString();
    // REST API url in contants file
    const qcComponent = JSON.parse(JSON.stringify(this.qmsConstant.personalFeedbackComponent.External));
    qcComponent.getQC.top = qcComponent.getQC.top.replace('{{TopCount}}', '' + topCount);
    qcComponent.getQC.filter = qcComponent.getQC.filter.replace('{{startDate}}', startDate)
      .replace('{{endDate}}', endDate);
    let qcs = await this.spService.readItems(this.globalConstant.listNames.QualityComplaints.name,
      qcComponent.getQC);
    qcs = qcs.length > 0 ? qcs.sort((a, b) => new Date(a.SentDate).getTime() - new Date(b.SentDate).getTime()) : [];
    return this.appendPropertyTOObject(qcs);
  }

  appendPropertyTOObject(arrResult) {
    arrResult.map((cd) => {
      let validity = this.globalConstant.cdStatus.Valid;
      validity = cd.IsActive === true ? this.globalConstant.cdStatus.Valid : this.globalConstant.cdStatus.InValid;
      cd.fullUrl = window.location.origin + '/' + cd.FileURL;
      cd.Status = cd.Status === this.globalConstant.cdStatus.Closed ? cd.Status + '-' + validity : cd.Status;
      return cd;
    });
    return arrResult;
  }

  async applyFilters(filterObj) {
    let arrQCs = [];
    if (filterObj.isDateFilter) {
      const startDate = new Date(filterObj.startDate).toISOString();
      const endDate = new Date(filterObj.endDate).toISOString();
      arrQCs = await this.getQCItems(4500, startDate, endDate);
    } else {
      arrQCs = await this.getQCItems(filterObj.count, '', '');
    }
    this.global.personalFeedback.external.qc = arrQCs;
    this.QCRows = [];
    arrQCs.forEach(element => {
      this.QCRows.push({
        ID: element.ID,
        Title: element.Title,
        SentDate: this.datepipe.transform(element.SentDate, 'MMM d, yyyy'),
        SentBy: element.SentBy.Title,
        Status: element.Status ? element.Status : '',
        SeverityLevel: element.SeverityLevel ? element.SeverityLevel : '',
        Accountable: element.Category ? element.Category : '',
        Segregation: element.Segregation ? element.Segregation : '',
        BusinessImpact: element.BusinessImpact ? element.BusinessImpact : '',
        fullUrl: element.fullUrl,
        Comments: element.Comments,
        CorrectiveActions: element.CorrectiveActions,
        FileID: element.FileID,
        FileURL: element.FileURL,
        Id: element.Id,
        IdentifiedResource: element.IdentifiedResource,
        IsActive: element.IsActive,
        Modified: element.Modified,
        PreventiveActions: element.PreventiveActions,
        Resources: element.Resources,
        RootCauseAnalysis: element.RootCauseAnalysis,
      });
    });
    this.colFilters(this.QCRows);
  }
  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideTable = true;
    this.hideLoader = false;
  }

  downloadExcel(qc) {
    qc.exportCSV();
  }
}
