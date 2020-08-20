import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, SelectItem } from 'primeng';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { FdConstantsService } from '../fdServices/fd-constants.service';
import { Subscription } from 'rxjs';
import { FDDataShareService } from '../fdServices/fd-shareData.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-add-update-proforma-dialog',
  templateUrl: './add-update-proforma-dialog.component.html',
  styleUrls: ['./add-update-proforma-dialog.component.css']
})
export class AddUpdateProformaDialogComponent implements OnInit {
  isProformaFormSubmit: boolean = false;
  ProformaForm: FormGroup;
  projectContactsData: any;
  purchaseOrdersList: any;
  cleData: any;
  modalloaderenable: boolean = true;
  proformaAddressType: { label: string; value: string; }[];
  private subscription: Subscription = new Subscription();
  proformaTemplates: { label: string; value: string; }[];
  proformaTypes = [
    { label: 'OOP', value: 'oop' },
    { label: 'Revenue', value: 'revenue' }
  ];
  isTemplate4US: boolean = false;
  minProformaDate: any;
  selectedPurchaseNumber: any;
  listOfPOCNames: any[];
  yearRange: string;
  Type: any;

  constructor(
    public fdConstantsService: FdConstantsService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    public formbuilder: FormBuilder,
    public datePipe: DatePipe,
    private fdDataShareServie: FDDataShareService,
    private commonService: CommonService
  ) {

  }

  ngOnInit() {
    this.Type = this.config.data.Type;
    this.yearRange = this.commonService.getyearRange();
    this.proformaAddressType = this.fdConstantsService.fdComponent.addressTypes;
    this.proformaTemplates = this.fdConstantsService.fdComponent.ProformaTemplates;
    this.projectContactsData = this.config.data.projectContactsData;
    this.purchaseOrdersList = this.config.data.purchaseOrdersList;
    this.cleData = this.config.data.cleData;
    this.InitializeForm();
    this.usStatesInfo();
    if (this.Type === 'create proforma') {
      this.minProformaDate = this.commonService.getLastWorkingDay(3, new Date());
      this.modalloaderenable = false;
    }
    else {
      this.updateFormValueEdit();
    }
  }

  InitializeForm() {
    this.ProformaForm = this.formbuilder.group({
      ClientLegalEntity: ['', Validators.required],
      POName: ['', Validators.required],
      POCName: ['', Validators.required],
      ProformaNumber: [''],
      ProformaTitle: ['', [Validators.required, Validators.maxLength(255)]],
      Template: ['', Validators.required],
      State: ['', Validators.required],
      Amount: ['', Validators.required],
      Currency: [''],
      AddressType: ['', Validators.required],
      ProformaType: ['', Validators.required],
      AdditionalComments: [''],
      ProformaDate: [new Date(), Validators.required],
    })
  }

  updateFormValueEdit() {
    this.selectedPurchaseNumber = this.config.data.selectedPurchaseNumber;
    delete this.selectedPurchaseNumber.__metadata;
    this.minProformaDate = new Date(Math.max.apply(null, this.config.data.selectedAllRowData.map(e => e.ScheduledDate)));
    this.showHideState({ value: this.config.data.selectedAllRowData[0].Template })
    const prfType = this.config.data.selectedAllRowData[0].ScheduleType;
    this.generateProformaNumber(this.config.data.selectedCLEData, prfType);
    this.getPOCNamesForEditInv(this.config.data.selectedCLEData);
    this.getPONumberFromCLE(this.config.data.selectedCLEData.Title);
    this.ProformaForm.get('POCName').setValue(this.listOfPOCNames.find(c => c.ID === this.selectedPurchaseNumber.POCLookup))
    this.ProformaForm.patchValue({
      ClientLegalEntity: this.config.data.selectedCLEData,
      POName: this.selectedPurchaseNumber,
      Currency: this.selectedPurchaseNumber.Currency,
      Amount: this.config.data.selectedTotalAmt,
      ProformaType: this.proformaTypes.find(c => c.value === this.config.data.selectedAllRowData[0].ScheduleType) ? this.proformaTypes.find(c => c.value === this.config.data.selectedAllRowData[0].ScheduleType) : '',
      ProformaTitle: this.config.data.selectedAllRowData.length > 1 ? '' : this.config.data.selectedAllRowData[0].ProjectTitle,
      ProformaDate: new Date(),
      Template: { label: this.config.data.selectedAllRowData[0].Template, value: this.config.data.selectedAllRowData[0].Template },
    });
    this.modalloaderenable = false;
  }


  onCLIChange(data: any) {
    // console.log(data);
    if (data) {
      let cleItem = data.value;
      this.getPONumberFromCLE(data.value.Title);
      this.generateProformaNumber(cleItem, '');
      this.getPOCNamesForEditInv(data.value);
    }
  }

  getPOCNamesForEditInv(rowItem: any) {
    this.listOfPOCNames = [];
    this.projectContactsData.filter((item) => {
      if (item.ClientLegalEntity === rowItem.Title) {
        this.listOfPOCNames.push(item)
      }
    });
    // console.log('this.listOfPOCNames ', this.listOfPOCNames);
  }


  // Project PO
  poNames: any = [];
  getPONumberFromCLE(cli) {
    this.poNames = [];
    this.purchaseOrdersList.map((x) => {
      if (x.ClientLegalEntity === cli) {
        delete x.__metadata;
        this.poNames.push(x);
      }
    });
    // console.log(this.poNames);
  }

  selectedPOItem: any;
  onPOChange(data: any) {
    // console.log('Data ', data);
    this.selectedPOItem = data;
    if (this.selectedPOItem.value) {
      let poScheduled = parseFloat(this.selectedPOItem.value.TotalScheduled ? this.selectedPOItem.value.TotalScheduled : 0);
      let poInvoiced = parseFloat(this.selectedPOItem.value.TotalInvoiced ? this.selectedPOItem.value.TotalInvoiced : 0);
      let availableBudget = (this.selectedPOItem.value.Amount ? this.selectedPOItem.value.Amount : 0) - (poScheduled + poInvoiced);
      this.ProformaForm.get('Amount').setValidators([Validators.required, Validators.max(availableBudget)]);
      this.ProformaForm.get('Amount').updateValueAndValidity();
    }
    this.ProformaForm.patchValue({
      Currency: data.value.Currency
    })
  }
  showHideState(val: any) {
    // console.log('val ', val);
    this.isTemplate4US = val.value == "US" ? true : false;
    this.ProformaForm.get('State').setValidators([Validators.required]);
    if (!this.isTemplate4US) {
      this.ProformaForm.get('State').clearValidators();
    }
    this.ProformaForm.get('State').updateValueAndValidity();
  }

  // US States
  usStatesData: any = [];
  usStatesInfo() {
    this.usStatesData = [];
    this.subscription.add(this.fdDataShareServie.defaultUSSData.subscribe((res) => {
      if (res) {
        this.usStatesData = res;
      }
    }))
  }

  generateProformaNumber(cle: any, prfData: string) {
    let cleAcronym = '';
    let proformaCounter: number = 0;
    let proformaDate = '';
    let isOOP: boolean = false;
    if (prfData) {
      isOOP = prfData.toLowerCase() === 'oop' ? true : false;
    }
    else if (this.ProformaForm.value.ProformaType) {
      isOOP = this.ProformaForm.value.ProformaType.value.toLowerCase() === 'oop' ? true : false;
    } 
    if (cle) {
      cleAcronym = cle.Acronym ? cle.Acronym : '';
      // console.log('cleAcronym,', cleAcronym);
      proformaCounter = cle.ProformaCounter ? parseInt(cle.ProformaCounter) + 1 : 1;
      let sNum = '000' + proformaCounter;
      let sFinalNum = sNum.substr(sNum.length - 4);
      // console.log('proformaCounter,', proformaCounter);
      const date = this.ProformaForm.value.ProformaDate ? new Date(this.ProformaForm.value.ProformaDate) : new Date();
      proformaDate = this.datePipe.transform(date, 'MM') + this.datePipe.transform(date, 'yy');
      // console.log('proformaDate,', proformaDate);
      let finalVal = isOOP ? (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum + '-OOP') :
        (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum);
      this.ProformaForm.get('ProformaNumber').setValue(finalVal);
    }
  }


  SaveDetails() {
    if (this.ProformaForm.valid) {
      this.ref.close(this.ProformaForm);
    } else {
      this.isProformaFormSubmit = true;
    }
  }

  cancel() {
    this.ref.close();
  }
}
