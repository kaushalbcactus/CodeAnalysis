import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-client-masterdata',
  templateUrl: './client-masterdata.component.html',
  styleUrls: ['./client-masterdata.component.css']
})
export class ClientMasterdataComponent implements OnInit {
  clientMasterDataColumns = [];
  clientMasterDataRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  auditHistorySelectedColumns = [];
  auditHistorySelectedRows = [];
  subDivisionDetailsColumns = [];
  subDivisionDetailsRows = [];
  POCColumns = [];
  POCRows = [];
  POColumns = [];
  PORows = [];
  items = [];
  items1 = [];

  poValue;
  selectedValue: any;
  buttonLabel;

  showaddClientModal = false;
  showEditClient = false;
  showSubDivisionDetails = false;
  showaddSubDivision = false;
  showeditSubDivision = false;

  showPointofContact = false;
  showaddPOC = false;
  showeditPOC = false;

  showPurchaseOrder = false;
  showaddPO = false;
  showeditPO = false;
  showaddBudget = false;

  budgetType = [
    { label: 'Add', value: 'Add' },
    { label: 'Reduce', value: 'Reduce' },
    { label: 'Restructure', value: 'Restructure' }
  ];
  options = [
    { label: 'option1', value: 'option1' },
    { label: 'option2', value: 'option2' },
    { label: 'option3', value: 'option3' }
  ];
  cmObject = {
    isClientFormSubmit: false,
    isSubDivisionFormSubmit: false,
    isPOCFormSubmit: false,
    isBudgetFormSubmit: false,
    isPOFormSubmit: false,
  };
  addClient: FormGroup;
  subDivisionform: FormGroup;
  pocForm: FormGroup;
  PoForm: FormGroup;
  addBudgetForm: FormGroup;

  clientMasterDataColArray = {
    ClientLegalEntry: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };

  auditHistoryArray = {
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  auditHistorySelectedArray = {
    ClientLegalEntry: [],
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  subDivisionDetailsColArray = {
    SubDivision: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  POCColArray = {
    POC: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  POColArray = {
    PO: [],
    PoValues: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  constructor(private datepipe: DatePipe, private frmbuilder: FormBuilder, private messageService: MessageService) {
    this.addClient = frmbuilder.group({
      name: ['', Validators.required],
      acronym: ['', Validators.required],
      group: ['', Validators.required],
      distributionList: [''],
      invoiceName: ['', Validators.required],
      realization: ['', Validators.required],
      market: ['', Validators.required],
      billingEntry: ['', Validators.required],
      poRequired: ['', Validators.required],
      timeZone: ['', Validators.required],
      cmLevel1: ['', Validators.required],
      cmLevel2: ['', Validators.required],
      deliveryLevel1: [''],
      deliveryLevel2: ['', Validators.required],
      currency: ['', Validators.required],
      APEmail: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      address4: [''],
      notes: [''],
      bucket: ['', Validators.required]
    });
    this.subDivisionform = frmbuilder.group({
      subDivision_Name: ['', Validators.required],
      distributionList: [''],
      cmLevel1: [''],
      deliveryLevel1: [''],
    });
    this.pocForm = frmbuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      address4: [''],
      department: [''],
      referralSource: ['', Validators.required],
      status: ['', Validators.required],
      relationshipStrength: [''],
      engagementPlan: [''],
      comments: [''],
      contactsType: ['', Validators.required],
    });
    this.initAddPOForm();
    this.initAddBudgetForm();
  }

  initAddPOForm() {
    this.PoForm = this.frmbuilder.group({
      poNumber: ['', Validators.required],
      poName: ['', Validators.required],
      currency: ['', Validators.required],
      poExpiryDate: ['', Validators.required],
      poc: ['', Validators.required],
      poFile: ['', Validators.required],
      ta: ['', Validators.required],
      molecule: ['', Validators.required],
      cmLevel2: ['', Validators.required],
      poBuyingEntity: ['', Validators.required]
    });
  }

  initAddBudgetForm() {
    this.addBudgetForm = this.frmbuilder.group({
      total: [{ value: 0, disabled: true }, Validators.required],
      revenue: [0, Validators.required],
      oop: [0, Validators.required],
      tax: [0, Validators.required],
    });
  }

  ngOnInit() {
    this.clientMasterDataColumns = [
      { field: 'ClientLegalEntry', header: 'Client Legal Entry', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];

    this.clientMasterDataRows = [
      {
        // Sr: 1,
        ClientLegalEntry: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ];

    this.auditHistoryColumns = [
      { field: 'Action', header: 'Action' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistoryRows = [
      {
        Action: '',
        ActionBy: '',
        Date: '',
        Details: ''
      }
    ];

    this.auditHistorySelectedColumns = [
      { field: 'ClientLegalEntry', header: 'Client Legal Entry' },
      { field: 'Action', header: 'Action' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistorySelectedRows = [
      {
        // Sr: 1,
        ClientLegalEntry: 'User Created',
        Action: '',
        ActionBy: '',
        Date: '',
        Details: ''
      }
    ];

    this.subDivisionDetailsColumns = [
      { field: 'SubDivision', header: 'Sub-Division', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];

    this.subDivisionDetailsRows = [
      {
        SubDivision: 'Sub-Division',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];
    this.POCColumns = [
      { field: 'POC', header: 'POC', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];

    this.POCRows = [
      {
        POC: 'POC',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];
    this.POColumns = [
      { field: 'PO', header: 'PO' },
      { field: 'PoValues', header: 'PO Values', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];

    this.PORows = [
      {
        PO: 'PO',
        PoValues: '1000',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];

    this.colFilters(this.clientMasterDataRows);
    this.colFilters1(this.auditHistoryRows);
    this.colFilters2(this.auditHistorySelectedRows);
    this.subDivisionFilters(this.subDivisionDetailsRows);
    this.POCFilters(this.POCRows);
    this.POFilters(this.PORows);
  }

  subDivisionFilters(colData) {
    this.subDivisionDetailsColArray.SubDivision = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.SubDivision, value: a.SubDivision }; return b; }));
    this.subDivisionDetailsColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        }; return b;
      }));
    this.subDivisionDetailsColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  POCFilters(colData) {
    this.POCColArray.POC = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.POC, value: a.POC }; return b; }));
    this.POCColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        }; return b;
      }));
    this.POCColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }
  POFilters(colData) {
    this.POColArray.PO = this.uniqueArrayObj(colData.map(a => { const b = { label: a.PO, value: a.PO }; return b; }));
    this.POColArray.PoValues = this.uniqueArrayObj(colData.map(a => { const b = { label: a.PoValues, value: a.PoValues }; return b; }));
    this.POColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        }; return b;
      }));
    this.POColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }


  colFilters(colData) {
    this.clientMasterDataColArray.ClientLegalEntry = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ClientLegalEntry, value: a.ClientLegalEntry }; return b; }));
    this.clientMasterDataColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
        }; return b;
      }));
    this.clientMasterDataColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.Action = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryArray.Date = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.Date, 'MMM d, yyyy')
        }; return b;
      }));
    this.auditHistoryArray.Details = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));

  }

  colFilters2(colData) {
    this.auditHistorySelectedArray.ClientLegalEntry = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ClientLegalEntry, value: a.ClientLegalEntry }; return b; }));
    this.auditHistorySelectedArray.Action = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistorySelectedArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistorySelectedArray.Date = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.Date, 'MMM d, yyyy')
        }; return b;
      }));
    this.auditHistorySelectedArray.Details = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    });
  }

  openMenuPopup(data) {
    this.items = [
      { label: 'Edit', command: (e) => this.showEditCLientModal(data) },
      { label: 'Delete' },
      { label: 'Sub-Division Details', command: (e) => this.showSubDivision(data) },
      { label: 'Point of Contact', command: (e) => this.showPOC(data) },
      { label: 'Purchase Order', command: (e) => this.showPO(data) }
    ];
  }

  subDivisionMenu(data) {
    this.items1 = [{ label: 'Edit', command: (e) => this.showEditSubDivision(data) },
    { label: 'Delete' }];
  }

  pocMenu(data) {
    this.items1 = [{ label: 'Edit', command: (e) => this.showEditPOC(data) },
    { label: 'Delete' }];
  }

  poMenu(data) {
    this.items1 = [{ label: 'Add Budget', command: (e) => this.showaddBudgetModal(data) },
    { label: 'Edit', command: (e) => this.showEditPOModal() },
    { label: 'Delete' }];
  }

  saveClient(clientData) {
    // console.log(clientData);
    if (clientData.valid) {
      console.log(clientData.value);
    } else {
      this.cmObject.isClientFormSubmit = true;
    }
  }

  saveSubdivision(subDivisionData) {
    if (subDivisionData.valid) {
      console.log(subDivisionData.value);
    } else {
      this.cmObject.isSubDivisionFormSubmit = true;
    }
  }

  savePOC(pocData) {
    if (pocData.valid) {
      console.log(pocData.value);
    } else {
      this.cmObject.isPOCFormSubmit = true;
    }
  }

  savePO(poData) {
    if (poData.valid) {
      console.log(poData.value);
    } else {
      this.cmObject.isPOFormSubmit = true;
    }
  }

  saveBudget(budgetData) {
    if (budgetData.valid) {
      switch (this.selectedValue) {
        case 'Add':
          this.addBudget();
          break;
        case 'Reduce':
          this.reduceBudget();
          break;
        case 'Restructure':
          this.restructureBudget();
          break;
      }
    } else {
      this.cmObject.isBudgetFormSubmit = true;
    }
  }


  addBudget() {
    if (this.addBudgetForm.controls.revenue.value < 0 ||
      this.addBudgetForm.controls.oop.value < 0 || this.addBudgetForm.controls.tax.value < 0) {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Values should be Positve Number' });
    } else {
      if (this.addBudgetForm.controls.total.value < 0) {
        this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Total should be in Positve Number' });
      } else {
        console.log(this.addBudgetForm.getRawValue());
      }
    }
  }

  reduceBudget() {
    const value = Math.abs(this.addBudgetForm.controls.total.value);
    if (this.addBudgetForm.controls.revenue.value > 0 ||
      this.addBudgetForm.controls.oop.value > 0 || this.addBudgetForm.controls.tax.value > 0) {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Values should be Negative Number' });
    } else {
      if (this.addBudgetForm.controls.total.value > 0) {
        this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Total should be in Negative Number' });
      } else if (value > this.poValue.PoValues) {
        this.messageService.add({
          severity: 'error', summary: 'Error Message',
          detail: 'Total Amount must be less than or equal to existing PO Value'
        });
      } else {
        console.log(this.addBudgetForm.getRawValue());
      }
    }
  }

  restructureBudget() {
    if (this.addBudgetForm.controls.total.value !== 0) {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Total Should be Zero' });
    } else {
      console.log(this.addBudgetForm.getRawValue());
    }
  }


  onChange() {
    let total = 0;
    total = this.addBudgetForm.get('revenue').value + this.addBudgetForm.get('oop').value + this.addBudgetForm.get('tax').value;
    this.addBudgetForm.controls.total.setValue(total);
  }

  showAddClientModal() {
    this.addClient.reset();
    this.addClient.controls.name.enable();
    this.addClient.controls.acronym.enable();
    this.addClient.controls.currency.enable();
    this.addClient.controls.billingEntry.enable();
    this.addClient.controls.timeZone.enable();
    this.showEditClient = false;
    this.buttonLabel = 'Submit';
    this.showaddClientModal = true;
    this.cmObject.isClientFormSubmit = false;
  }

  showEditCLientModal(data) {
    this.showEditClient = true;
    this.buttonLabel = 'Update';
    this.addClient.controls.name.disable();
    this.addClient.controls.acronym.disable();
    this.addClient.controls.currency.disable();
    this.addClient.controls.billingEntry.disable();
    this.addClient.controls.timeZone.disable();
    this.addClient.patchValue({
      name: 'Test',
      acronym: 'test',
      group: 'option1',
      distributionList: 'Test',
      invoiceName: 'Invoice',
      realization: 'Test',
      market: 'option1',
      billingEntry: 'option1',
      poRequired: 'option1',
      timeZone: 'option1',
      cmLevel1: ['option1'],
      cmLevel2: 'option1',
      deliveryLevel1: ['option1', 'option2'],
      deliveryLevel2: 'option1',
      currency: 'option1',
      APEmail: 'test',
      address1: 'hfgsdjgfjsg',
      address2: 'sdgfasgd',
      address3: '',
      address4: '',
      notes: 'Test',
      bucket: 'option1'
    });
    this.showaddClientModal = true;
  }

  showSubDivision(data) {
    this.showSubDivisionDetails = true;
  }

  showPOC(data) {
    this.showPointofContact = true;
  }

  showPO(data) {
    this.showPurchaseOrder = true;
  }

  showAddSubDivision() {
    this.subDivisionform.reset();
    this.showeditSubDivision = false;
    this.buttonLabel = 'Submit';
    this.showaddSubDivision = true;
    this.subDivisionform.controls.subDivision_Name.enable();
  }

  showEditSubDivision(data) {
    this.showeditSubDivision = true;
    this.buttonLabel = 'Update';
    this.showaddSubDivision = true;
    this.subDivisionform.controls.subDivision_Name.disable();
    this.subDivisionform.patchValue({
      subDivision_Name: 'Test',
      distributionList: 'Test',
      cmLevel1: ['option1', 'option2'],
      deliveryLevel1: ['option1'],
    });
  }

  showAddPOC() {
    this.pocForm.reset();
    this.showeditPOC = false;
    this.buttonLabel = 'Submit';
    this.showaddPOC = true;
    this.cmObject.isPOCFormSubmit = false;
  }

  showEditPOC(data) {
    this.showeditPOC = true;
    this.buttonLabel = 'Update';
    this.showaddPOC = true;
    this.pocForm.patchValue({
      fname: 'Test',
      lname: 'Test',
      designation: 'Test',
      email: 'Test',
      phone: 'Test',
      address1: 'Test',
      address2: 'Test',
      address3: 'Test',
      address4: 'Test',
      department: 'Test',
      referralSource: 'option1',
      status: 'option1',
      relationshipStrength: 'Test',
      engagementPlan: 'Test',
      comments: 'Test',
      contactsType: 'option2',
    });
  }

  showAddPO() {
    this.showaddPO = true;
    this.initAddPOForm();
    this.cmObject.isPOFormSubmit = false;
  }

  showEditPOModal() {
    this.showeditPO = true;
    //   this.editPoForm.patchValue({
    //     poNumber: 'Test',
    //     poName: 'Test',
    //     currency: 'option2',
    //     poExpiryDate: new Date(),
    //     poc: 'option2',
    //     // poFile: 'Bucket Master Data.csv',
    //     ta: 'option2',
    //     molecule: 'option2',
    //     cmLevel2: 'option2',
    //     poBuyingEntity: 'option2'
    // });
  }

  showaddBudgetModal(data) {
    this.poValue = data;
    this.initAddBudgetForm();
    this.showaddBudget = true;
    this.cmObject.isBudgetFormSubmit = false;
  }

  downloadExcel(cmd) {
    // console.log(cmd);
    cmd.exportCSV();
  }

}

