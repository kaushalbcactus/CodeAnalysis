import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';

@Component({
  selector: 'app-reference-data',
  templateUrl: './reference-data.component.html',
  styleUrls: ['./reference-data.component.css']
})
export class ReferenceDataComponent implements OnInit {
  vendorDetailsColumns = [];
  vendorDetailsRows = [];
  qmsTemplateColumns = [];
  qmsTemplateRows = [];
  standardTemplateColumns = [];
  standardTemplateRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  auditHistorySelectedColumns = [];
  auditHistorySelectedRows = [];
  auditHistoryQmsSelectedColumns = [];
  auditHistoryQmsSelectedRows = [];
  auditHistoryStandardSelectedColumns = [];
  auditHistoryStandardSelectedRows = [];
  vendorDetailsColArray = {
    VendorName: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  qmsTemplateColArray = {
    QmsTemplate: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  standardTemplateColArray = {
    StandardTemplate: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };

  items = [
    { label: 'Edit' },
    { label: 'Delete' }
  ];

  isVendorDetailsVisible = false;
  isQmsTemplateVisible = false;
  isStandardTemplateVisible = false;

  showAddVendorModal = false;
  showAddQmsTemplateModal = false;
  showAddStandardTemplateModal = false;
  addVendor: FormGroup;
  addQmsTemplate: FormGroup;
  addStandardTemplate: FormGroup;
  auditHistoryArray = {
    Action: [],
    ActionBy: [],
    Date: [],
    Details: []
  };

  auditHistorySelectedArray = {
    VendorName: [],
    // Action:[],
    ActionBy: [],
    Date: [],
    Details: []
  };
  auditHistoryQmsSelectedArray = {
    QmsTemplate: [],
    // Action:[],
    ActionBy: [],
    Date: [],
    Details: []
  };
  auditHistoryStandardSelectedArray = {
    StandardTemplate: [],
    // Action:[],
    ActionBy: [],
    Date: [],
    Details: []
  };
  reference = [{ label: 'Vendor Details', value: 'Vendor Details' },
  { label: 'QMS Template', value: 'QMS Template' },
  { label: 'Standard Template', value: 'Standard Template' }];
  referenceDataObject = {
    isVendorFormSubmit: false,
    isQmsTemplateFormSubmit: false,
    isStandardTemplateFormSubmit: false
  };
  constructor(private datepipe: DatePipe, private frmbuilder: FormBuilder) {
    this.initForm();
  }

  ngOnInit() {
    this.vendorDetailsColumns = [
      { field: 'VendorName', header: 'Vendor Name' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.vendorDetailsRows = [
      {
        VendorName: 'Vendor Name',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];
    this.qmsTemplateColumns = [
      { field: 'QmsTemplate', header: 'QMS Template' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.qmsTemplateRows = [
      {
        QmsTemplate: 'QMS Template',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];
    this.standardTemplateColumns = [
      { field: 'StandardTemplate', header: 'Standard Template' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.standardTemplateRows = [
      {
        StandardTemplate: 'Standard Template',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];
    this.auditHistoryColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Action', header: 'Action' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistoryRows = [
      {
        // Sr: 1,
        Action: '',
        ActionBy: '',
        Date: '',
        Details: ''
      }
    ];

    this.auditHistorySelectedColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'VendorName', header: 'Vendor Name' },
      // { field: 'Action', header: 'Action' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistorySelectedRows = [
      {
        // Sr: 1,
        VendorName: '',
        // Action: '',
        ActionBy: '',
        Date: '',
        Details: ''
      }
    ];

    this.auditHistoryQmsSelectedColumns = [
      { field: 'QmsTemplate', header: 'QMS Template' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistoryQmsSelectedRows = [
      {
        // Sr: 1,
        QmsTemplate: '',
        // Action: '',
        ActionBy: '',
        Date: '',
        Details: ''
      }
    ];

    this.auditHistoryStandardSelectedColumns = [
      { field: 'StandardTemplate', header: 'Standard Template' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistoryStandardSelectedRows = [
      {
        StandardTemplate: '',
        ActionBy: '',
        Date: '',
        Details: ''
      }
    ];

    this.vendorTableFilters(this.vendorDetailsRows);
    this.qmsTemplateTableFilters(this.qmsTemplateRows);
    this.standardTemplateTableFilters(this.standardTemplateRows);
    this.colFilters(this.auditHistoryRows);
    this.colFilters1(this.auditHistorySelectedRows);
    this.colFilters2(this.auditHistoryQmsSelectedRows);
    this.colFilters3(this.auditHistoryStandardSelectedRows);
  }

  filterBy(value) {
    // console.log(value);
    switch (value) {
      case 'Vendor Details':
      this.isVendorDetailsVisible = true;
      this.isQmsTemplateVisible = false;
      this.isStandardTemplateVisible = false;
      break;
      case 'QMS Template':
      this.isVendorDetailsVisible = false;
      this.isQmsTemplateVisible = true;
      this.isStandardTemplateVisible = false;
      break;
      case 'Standard Template':
      this.isVendorDetailsVisible = false;
      this.isQmsTemplateVisible = false;
      this.isStandardTemplateVisible = true;
      break;
    }
  }

  initForm() {
    this.addVendor = this.frmbuilder.group({
      // vendorName: ['', Validators.required],
      // reasonforEngagement: ['', Validators.required],
      // projectCode: ['', Validators.required],
      // projectType: ['', Validators.required],
      // scope: ['', Validators.required],
      // costDetails: ['', Validators.required],
      // contract: ['', Validators.required],
      Title: ['', [Validators.required, Validators.maxLength(50)]],
      RecordType: ['', [Validators.required]],
      PhoneNo: ['', [Validators.required, Validators.maxLength(15)]],
      Email: ['', [Validators.required, Validators.email]],
      Address: ['', Validators.required],
      BilledTo: ['', Validators.required],
      CreditPeriod: ['', Validators.required],
      ContractStartDate: ['', Validators.required],
      ContractEndDate: [''],
      BillingTerms: ['', Validators.required],
      WLA: ['', Validators.required],
    });
    this.addQmsTemplate = this.frmbuilder.group({
      templateName: ['', Validators.required],
      tooltip: ['', Validators.required],
      parameter1: ['', Validators.required],
      parameter2: ['', Validators.required],
      parameter3: ['', Validators.required],
      parameter4: ['', Validators.required],
      parameter5: ['', Validators.required],
      parameter6: ['', Validators.required],
      parameter7: ['', Validators.required],
      parameter8: ['', Validators.required],
      parameter9: ['', Validators.required],
      parameter10: ['', Validators.required],
    });
    this.addStandardTemplate = this.frmbuilder.group({
      vendorName: ['', Validators.required],
      plan: ['', Validators.required]
    });
  }

  vendorTableFilters(colData) {
    this.vendorDetailsColArray.VendorName = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.VendorName, value: a.VendorName }; return b; }));
    this.vendorDetailsColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.vendorDetailsColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  qmsTemplateTableFilters(colData) {
    this.qmsTemplateColArray.QmsTemplate = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.QmsTemplate, value: a.QmsTemplate }; return b; }));
    this.qmsTemplateColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.qmsTemplateColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  standardTemplateTableFilters(colData) {
    this.standardTemplateColArray.StandardTemplate = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.StandardTemplate, value: a.StandardTemplate }; return b; }));
    this.standardTemplateColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.standardTemplateColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters(colData) {
    this.auditHistoryArray.Action = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryArray.Date = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
      // tslint:disable-next-line: align
      value: this.datepipe.transform(a.Date, 'MMM d, yyyy') }; return b; }));
    this.auditHistoryArray.Details = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));

  }

  colFilters1(colData) {
    this.auditHistorySelectedArray.VendorName = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.VendorName, value: a.VendorName }; return b; }));
    this.auditHistorySelectedArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistorySelectedArray.Date = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.Date, 'MMM d, yyyy') }; return b; }));
    this.auditHistorySelectedArray.Details = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));
  }

  colFilters2(colData) {
    this.auditHistoryQmsSelectedArray.QmsTemplate = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.QmsTemplate, value: a.QmsTemplate }; return b; }));
    this.auditHistoryQmsSelectedArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryQmsSelectedArray.Date = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.Date, 'MMM d, yyyy') }; return b; }));
    this.auditHistoryQmsSelectedArray.Details = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Details, value: a.Details }; return b; }));
  }

  colFilters3(colData) {
    this.auditHistoryStandardSelectedArray.StandardTemplate = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.StandardTemplate, value: a.StandardTemplate }; return b; }));
    this.auditHistoryStandardSelectedArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryStandardSelectedArray.Date = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.Date, 'MMM d, yyyy') }; return b; }));
    this.auditHistoryStandardSelectedArray.Details = this.uniqueArrayObj(
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

  saveVendor(addVendorForm) {
    console.log(addVendorForm);
    if (addVendorForm.valid) {
      console.log(addVendorForm.value);
    } else {
      this.referenceDataObject.isVendorFormSubmit = true;
    }
  }

  saveQmsTemplate(addQmsTemplateForm) {
    console.log(addQmsTemplateForm);
    if (addQmsTemplateForm.valid) {
      console.log(addQmsTemplateForm.value);
    } else {
      this.referenceDataObject.isQmsTemplateFormSubmit = true;
    }
  }

  saveStandardTemplate(addStandardTemplateForm) {
    console.log(addStandardTemplateForm);
    if (addStandardTemplateForm.valid) {
      console.log(addStandardTemplateForm.value);
    } else {
      this.referenceDataObject.isStandardTemplateFormSubmit = true;
    }
  }

  showAddVendor() {
    this.showAddVendorModal = true;
    this.referenceDataObject.isVendorFormSubmit = false;
  }

  showAddQmsTemplate() {
    this.showAddQmsTemplateModal = true;
    this.referenceDataObject.isQmsTemplateFormSubmit = false;
  }

  showAddStandardTemplate() {
    this.showAddStandardTemplateModal = true;
    this.referenceDataObject.isStandardTemplateFormSubmit = false;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: false });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  downloadExcel(rule) {
    // console.log(rule);
    rule.exportCSV();
  }
}
