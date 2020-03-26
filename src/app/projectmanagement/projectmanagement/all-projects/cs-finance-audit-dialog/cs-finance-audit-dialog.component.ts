import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService, Table, DialogService } from 'primeng';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { AuditProjectDialogComponent } from '../audit-project-dialog/audit-project-dialog.component';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-cs-finance-audit-dialog',
  templateUrl: './cs-finance-audit-dialog.component.html',
  styleUrls: ['./cs-finance-audit-dialog.component.css'],
  providers: [DialogService]

})
export class CsFinanceAuditDialogComponent implements OnInit {


  projectUpdated = false;
  @ViewChild('allProjectRef', { static: false }) allProjectRef: Table;
  projectList: any;
  public allProjects = {
    SOWCode: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    ProjectType: [],
    Status: [],
    TA: [],
    Molecule: [],
    PrimaryResources: [],
    POC: []
  };

  options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  selectedProjects = [];
  public columnFilter = {
    ProjectCode: [],
    SOWCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    ProjectType: [],
    POC: [],
    PrimaryResources: '',
    TA: [],
    Molecule: []

  };

  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'Sow Code', visibility: true },
    { field: 'ProjectCode', header: 'Project Code', visibility: true },
    { field: 'ShortTitle', header: 'Short Title', visibility: true },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
    { field: 'ProjectType', header: 'Project Type', visibility: true },
    { field: 'PrimaryResources', header: 'Primary Resources', visibility: true },
    { field: 'POC', header: 'POC', visibility: true },
    { field: 'TA', header: 'TA', visibility: true },
    { field: 'Molecule', header: 'Molecule', visibility: true },
  ];
  modalloaderenable = true;
  AuditType = '';
  EmailTemplate: any;
  dbProjectList: never[];
  buttonloader = false;
  constructor(public config: DynamicDialogConfig,
    public csref: DynamicDialogRef,
    public messageService: MessageService,
    public dialogService: DialogService,
    public pmObject: PMObjectService,
    private globalObject: GlobalService,
    private constants: ConstantsService,
    public pmCommonService: PMCommonService,
    private cdr: ChangeDetectorRef,
    private pmConstant: PmconstantService,
    private spServices: SPOperationService,
    private commonService: CommonService, ) { }

  async ngOnInit() {
    this.projectList = this.config.data.projectList;
    this.dbProjectList = this.projectList.slice(0);
    this.AuditType = this.config.data.AuditListType;
    this.createColFieldValues(this.projectList);
  }


  ngAfterViewInit() {

    if (this.config.data.tableData.filters.ProjectCode) {
      this.columnFilter.ProjectCode = this.allProjects.ProjectCode.map(c => c.value).filter(c => this.config.data.tableData.filters.ProjectCode.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ProjectCode, 'ProjectCode', 'in')
    }
    if (this.config.data.tableData.filters.SOWCode) {
      this.columnFilter.SOWCode = this.allProjects.SOWCode.map(c => c.value).filter(c => this.config.data.tableData.filters.SOWCode.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.SOWCode, 'SOWCode', 'in')
    }
    if (this.config.data.tableData.filters.ShortTitle) {
      this.columnFilter.ShortTitle = this.allProjects.ShortTitle.map(c => c.value).filter(c => this.config.data.tableData.filters.ShortTitle.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ShortTitle, 'ShortTitle', 'in')
    }
    if (this.config.data.tableData.filters.ClientLegalEntity) {
      this.columnFilter.ClientLegalEntity = this.allProjects.ClientLegalEntity.map(c => c.value).filter(c => this.config.data.tableData.filters.ClientLegalEntity.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ClientLegalEntity, 'ClientLegalEntity', 'in')
    }
    if (this.config.data.tableData.filters.ProjectType) {
      this.columnFilter.ProjectType = this.allProjects.ProjectType.map(c => c.value).filter(c => this.config.data.tableData.filters.ProjectType.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ProjectType, 'ProjectType', 'in')
    }
    if (this.config.data.tableData.filters.POC) {
      this.columnFilter.POC = this.allProjects.POC.map(c => c.value).filter(c => this.config.data.tableData.filters.POC.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.POC, 'POC', 'in');
    }
    if (this.config.data.tableData.filters.PrimaryResources) {
      this.columnFilter.PrimaryResources = this.config.data.tableData.filters.PrimaryResources.value;
      this.allProjectRef.filter(this.columnFilter.PrimaryResources, 'PrimaryResources', 'in')
    }
    if (this.config.data.tableData.filters.TA) {
      this.columnFilter.TA = this.allProjects.TA.map(c => c.value).filter(c => this.config.data.tableData.filters.TA.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.TA, 'TA', 'in')
    }
    if (this.config.data.tableData.filters.Molecule) {

      this.columnFilter.Molecule = this.allProjects.Molecule.map(c => c.value).filter(c => this.config.data.tableData.filters.Molecule.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.Molecule, 'Molecule', 'in')
    }
    this.modalloaderenable = false;
  }

  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {

    if (this.projectList.length && this.isOptionFilter) {
      let obj = {
        tableData: this.allProjectRef,
        colFields: this.allProjects,
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }

  createColFieldValues(resArray) {
    this.allProjects.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label)));
    this.allProjects.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    this.allProjects.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.allProjects.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.allProjects.ProjectType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectType, value: a.ProjectType }; return b; }).filter(ele => ele.label)));
    this.allProjects.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status === 'Audit In Progress' ? 'CS Audit' : a.Status === 'Pending Closure' ? 'Finance Audit' : a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
    this.allProjects.TA = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.TA, value: a.TA }; return b; }).filter(ele => ele.label)));
    this.allProjects.Molecule = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Molecule, value: a.Molecule }; return b; }).filter(ele => ele.label)));
    const poc1 = resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label);
    this.allProjects.POC = this.commonService.sortData(this.uniqueArrayObj(poc1));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      const keys = {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
      return keys ? keys : '';
    });
  }

  // **************************************************************************************
  // To Close dialog 
  // **************************************************************************************
  cancel() {
    if (this.projectUpdated) {
      this.csref.close(this.projectUpdated);
    }
    else {
      this.csref.close();
    }

  }



  // **************************************************************************************
  // On row checkbox select for finance (maximum 10 rows are allowed)
  // **************************************************************************************

  onRowSelect() {
    if (this.selectedProjects.length > 10 && this.AuditType === 'Finance') {
      this.messageService.add({
        key: 'custom', severity: 'error', summary: 'Error Message',
        detail: 'Maximum 10 projects allowed for audit.'
      });
    }
  }

  // **************************************************************************************
  // Audit project button click
  // **************************************************************************************

  async AuditProjects(AuditType) {
    if (AuditType === 'CS') {
      const addRollingProjectArray = [
        { checked: false, parameter: 'All project attributes are correct', comments: '' },
        { checked: false, parameter: 'Final documents uploaded for all the tasks', comments: '' },
        { checked: false, parameter: 'Is the project budget and budget hours correct?', comments: '' },
        { checked: false, parameter: 'Is the pub support status updated to submitted?', comments: '' },
        { checked: false, parameter: 'Has ER been fully accrued before proposing closure?', comments: '' },
      ];

      const ref = this.dialogService.open(AuditProjectDialogComponent, {
        header: ' Audit Projects',
        width: '60vw',
        data: addRollingProjectArray,
        closable: false,
      });

      ref.onClose.subscribe(async (Auditproj: any) => {
        if (Auditproj) {

          this.modalloaderenable = true;
          const piUdpate = {
            AuditCheckList: Auditproj,
            Status: this.constants.projectStatus.PendingClosure,
            PrevStatus: this.constants.projectStatus.AuditInProgress,
            __metadata: { type: this.constants.listNames.ProjectInformation.type }
          };

          await this.UpdateProjects(piUdpate);
          this.messageService.add({
            key: 'custom', severity: 'success', summary: 'Success Message',
            detail: 'Selected Projects Updated Successfully.'
          });
        }
      });
    } else {
      this.buttonloader = true;
      this.modalloaderenable = true;
      const dbExpenseInvoiceArray = await this.getInvoceExpense(this.selectedProjects);
      let dbInvoiceLineItems = [];
      let dbExpenseLineItems = [];
      if (dbExpenseInvoiceArray) {
        dbInvoiceLineItems = [].concat(...dbExpenseInvoiceArray.filter(c => c.listName === 'InvoiceLineItems').map(c => c.retItems));
        dbExpenseLineItems = [].concat(...dbExpenseInvoiceArray.filter(c => c.listName === 'SpendingInfo').map(c => c.retItems));
      }
      let UniqueInvalidInvoices = [];
      if (dbInvoiceLineItems) {
        if (dbInvoiceLineItems.filter(c => c.Status !== 'Approved')) {
          UniqueInvalidInvoices = dbInvoiceLineItems.filter(c => c.Status !== 'Approved').map(c => c.Title).filter((item, index) => dbInvoiceLineItems.filter(c => c.Status !== 'Approved').map(c => c.Title).indexOf(item) === index);
        }
      }
      let UniqueInvalidExpenses = [];
      if (dbExpenseLineItems) {
        const AllBillable = dbExpenseLineItems.filter(c => c.Category === 'Billable');
        let UniqueInvalidBilledExpenses = [];
        let UniqueInvalidNonBilledExpenses = [];
        if (AllBillable) {
          UniqueInvalidBilledExpenses = AllBillable.filter(c => c.Status.indexOf('Billed') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled') ? AllBillable.filter(c => c.Status.indexOf('Billed') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled').map(c => c.Title).filter((item, index) => AllBillable.filter(c => c.Status.indexOf('Billed') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled').map(c => c.Title).indexOf(item) === index) : [];
        }
        const AllNonBillable = dbExpenseLineItems.filter(c => c.Category === 'Non Billable');
        if (AllNonBillable) {
          UniqueInvalidNonBilledExpenses = AllNonBillable.filter(c => c.Status.indexOf('Approved') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled') ? AllNonBillable.filter(c => c.Status.indexOf('Approved') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled').map(c => c.Title).filter((item, index) => AllNonBillable.filter(c => c.Status.indexOf('Approved') === -1 && c.Status !== 'Rejected' && c.Status !== 'Cancelled').map(c => c.Title).indexOf(item) === index) : [];
        }

        UniqueInvalidExpenses = [].concat(UniqueInvalidBilledExpenses, UniqueInvalidNonBilledExpenses).filter((item, index) => [].concat(UniqueInvalidBilledExpenses, UniqueInvalidNonBilledExpenses).indexOf(item) === index);
      }
      const errorMessage = [];
      if (UniqueInvalidExpenses.length > 0 || UniqueInvalidInvoices.length > 0) {
        if (UniqueInvalidInvoices.length > 0) {
          errorMessage.push({
            key: 'custom', severity: 'error', summary: 'Error Message', sticky: true,
            detail: UniqueInvalidInvoices.join(', ') + ' line items are not invoiced.'
          });
        }

        if (UniqueInvalidExpenses.length > 0) {
          errorMessage.push({
            key: 'custom', severity: 'error', summary: 'Error Message', sticky: true,
            detail: UniqueInvalidExpenses.join(', ') + ' expense are not invoiced.'
          })
        }
        this.messageService.addAll(errorMessage);
        this.modalloaderenable = false;
        this.buttonloader = false;
      }
      else {

        const addRollingProjectArray = [
          { checked: false, parameter: 'All invoices are generated', comments: '' },
          { checked: false, parameter: 'All expenses are billed', comments: '' },
        ];
        this.modalloaderenable = false;
        this.buttonloader = false;
        const ref = this.dialogService.open(AuditProjectDialogComponent, {
          header: ' Audit Projects',
          width: '60vw',
          data: addRollingProjectArray,
          closable: false,
        });
        ref.onClose.subscribe(async (Auditproj: any) => {
          if (Auditproj) {
            this.modalloaderenable = true;
            const piUdpate = {
              FinanceAuditCheckList: Auditproj,
              Status: this.constants.projectStatus.Closed,
              ActualEndDate: new Date(),
              PrevStatus: this.constants.projectStatus.PendingClosure,
              __metadata: { type: this.constants.listNames.ProjectInformation.type }
            };
            await this.UpdateProjects(piUdpate);
            this.messageService.add({
              key: 'custom', severity: 'success', summary: 'Success Message',
              detail: 'Selected projects closed successfully.'
            });

          }
        });
      }

    }
  }
  // **************************************************************************************
  // Update project on audit comment dialog
  // **************************************************************************************

  async UpdateProjects(piUdpate) {

    let batchResults = [];
    let batchURL = [];
    let finalArray = [];
    debugger
    this.selectedProjects.forEach(async element => {
      const ProjectUpdate = Object.assign({}, this.options);
      ProjectUpdate.data = piUdpate;
      ProjectUpdate.listName = this.constants.listNames.ProjectInformation.name;
      ProjectUpdate.type = 'PATCH';
      ProjectUpdate.url = this.spServices.getItemURL(this.constants.listNames.ProjectInformation.name, element.ID);
      batchURL.push(ProjectUpdate);

      if (batchURL.length === 99) {
        this.commonService.SetNewrelic('projectManagment', 'cs-finance-auditdialog', 'UpdateProjectFinanceAuditToClosed');
        batchResults = await this.spServices.executeBatch(batchURL);

        finalArray = [...finalArray, ...batchResults];
        batchURL = [];
        this.projectUpdated = true;
      }
    });
    if (batchURL.length) {
      this.commonService.SetNewrelic('projectManagment', 'cs-finance-auditdialog', 'UpdateProjectFinanceAuditToClosed');
      batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
      this.projectUpdated = true;
    }


    this.projectList = this.projectList.filter(c => !this.selectedProjects.includes(c));

    this.createColFieldValues(this.projectList);

    if (this.allProjectRef.filteredValue) {
      this.updateTableFilterOption();
    }
    this.modalloaderenable = false;
    if (this.selectedProjects.length === this.dbProjectList.length || this.projectList.length === 0) {
      this.csref.close(this.projectUpdated);
    }
    this.selectedProjects = [];
  }

  // **************************************************************************************
  //  Get invoices of selected project for audit check
  // **************************************************************************************


  async getInvoceExpense(selectedProjects) {
    let batchURL = [];
    let batchResults = [];
    let finalArray = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    selectedProjects.forEach(async element => {

      const invoiceGet = Object.assign({}, options);
      const invoiceFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
      invoiceFilter.filter = invoiceFilter.filter.replace(/{{projectCode}}/gi,
        element.ProjectCode);
      invoiceGet.url = this.spServices.getReadURL(this.constants.listNames.InvoiceLineItems.name,
        invoiceFilter);
      invoiceGet.type = 'GET';
      invoiceGet.listName = this.constants.listNames.InvoiceLineItems.name;
      batchURL.push(invoiceGet);

      const expanseGet = Object.assign({}, options);
      const expanseQuery = Object.assign({}, this.pmConstant.FINANCE_QUERY.GET_OOP);
      expanseQuery.filter = expanseQuery.filterByProjectCode.replace(/{{projectCode}}/gi, element.ProjectCode);
      const expanseEndPoint = this.spServices.getReadURL('' + this.constants.listNames.SpendingInfo.name +
        '', expanseQuery);
      expanseGet.url = expanseEndPoint.replace('{0}', '' + this.globalObject.currentUser.userId);
      expanseGet.type = 'GET';
      expanseGet.listName = this.constants.listNames.SpendingInfo.name;
      batchURL.push(expanseGet);

      if (batchURL.length === 98) {
        this.commonService.SetNewrelic('projectManagment', 'cs-finance-auditdialog', 'UpdateProjectCSAuditToFinanceAudit');
        batchResults = await this.spServices.executeBatch(batchURL);

        finalArray = [...finalArray, ...batchResults];
        batchURL = [];
        this.projectUpdated = true;
      }
    });
    if (batchURL.length) {
      this.commonService.SetNewrelic('projectManagment', 'cs-finance-auditdialog', 'getProjectsExpenseInvoiceLineItem');
      batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
    }
    return finalArray;
  }

  // **************************************************************************************
  // header checkbox select for multiple select in  Finance Audit
  // **************************************************************************************


  MultipleSelectRows(AuditType) {
    setTimeout(() => {
      if (AuditType === 'Finance') {
        debugger
        if (this.allProjectRef.filteredValue) {
          if (this.allProjectRef.filteredValue.length > 10) {
            this.selectedProjects = this.allProjectRef.filteredValue.slice(this.allProjectRef.first, this.allProjectRef.first + 10)
          }
        }
        else {
          if (this.projectList.length > 10) {
            this.selectedProjects = this.projectList.slice(this.allProjectRef.first, this.allProjectRef.first + 10)
          }
        }

      }
    }, 100);
  }



  updateTableFilterOption() {
    if (this.allProjectRef.filters.ProjectCode) {
      this.columnFilter.ProjectCode = this.allProjects.ProjectCode.map(c => c.value).filter(c => this.allProjectRef.filters.ProjectCode.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ProjectCode, 'ProjectCode', 'in')
    }
    if (this.allProjectRef.filters.SOWCode) {
      this.columnFilter.SOWCode = this.allProjects.SOWCode.map(c => c.value).filter(c => this.allProjectRef.filters.SOWCode.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.SOWCode, 'SOWCode', 'in')
    }
    if (this.allProjectRef.filters.ShortTitle) {
      this.columnFilter.ShortTitle = this.allProjects.ShortTitle.map(c => c.value).filter(c => this.allProjectRef.filters.ShortTitle.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ShortTitle, 'ShortTitle', 'in')
    }
    if (this.allProjectRef.filters.ClientLegalEntity) {
      this.columnFilter.ClientLegalEntity = this.allProjects.ClientLegalEntity.map(c => c.value).filter(c => this.allProjectRef.filters.ClientLegalEntity.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ClientLegalEntity, 'ClientLegalEntity', 'in')
    }
    if (this.allProjectRef.filters.ProjectType) {
      this.columnFilter.ProjectType = this.allProjects.ProjectType.map(c => c.value).filter(c => this.allProjectRef.filters.ProjectType.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.ProjectType, 'ProjectType', 'in')
    }
    if (this.allProjectRef.filters.POC) {
      this.columnFilter.POC = this.allProjects.POC.map(c => c.value).filter(c => this.allProjectRef.filters.POC.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.POC, 'POC', 'in');
    }
    if (this.allProjectRef.filters.PrimaryResources) {
      this.columnFilter.PrimaryResources = this.allProjectRef.filters.PrimaryResources.value;
      this.allProjectRef.filter(this.columnFilter.PrimaryResources, 'PrimaryResources', 'in')
    }
    if (this.allProjectRef.filters.TA) {
      this.columnFilter.TA = this.allProjects.TA.map(c => c.value).filter(c => this.allProjectRef.filters.TA.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.TA, 'TA', 'in')
    }
    if (this.allProjectRef.filters.Molecule) {

      this.columnFilter.Molecule = this.allProjects.Molecule.map(c => c.value).filter(c => this.allProjectRef.filters.Molecule.value.includes(c));
      this.allProjectRef.filter(this.columnFilter.Molecule, 'Molecule', 'in')
    }

  }

}
