import { Component, OnInit, NgZone, ViewEncapsulation, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { PmconstantService } from '../services/pmconstant.service';
import { PMObjectService } from '../services/pmobject.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PMCommonService } from '../services/pmcommon.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { CommonService } from 'src/app/Services/common.service';
@Component({
  selector: 'app-projectmanagement',
  templateUrl: './projectmanagement.component.html',
  styleUrls: ['./projectmanagement.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectmanagementComponent implements OnInit, OnDestroy {
  @ViewChild('myInput', { static: true })
  myInputVariable: ElementRef;
  isUserAllowed = true;
  private tabMenuItems: MenuItem[];
  buttons: MenuItem[];
  currClientLegalEntityObj = [];
  sowHeader = '';
  sowButton = '';
  fileReader = new FileReader();
  sowDropDown = {
    ClientLegalEntity: [],
    POC: [],
    POCOptional: [],
    BillingEntity: [],
    PracticeArea: [],
    Currency: [],
    CMLevel1: [],
    CMLevel2: [],
    Delivery: [],
    DeliveryOptional: [],
    SowOwner: []
  };
  addSowForm: FormGroup;
  addAdditionalBudgetForm: FormGroup;
  selectedFile: any;

  filePathUrl: any;
  subscription;
  constructor(
    public globalObject: GlobalService,
    public pmObject: PMObjectService,
    private constant: ConstantsService,
    private spServices: SPOperationService,
    private pmConstant: PmconstantService,
    private frmbuilder: FormBuilder,
    public messageService: MessageService,
    public pmService: PMCommonService,
    private router: Router,
    private dataService: DataService,
    private commonService: CommonService,
    private confirmationService: ConfirmationService
  ) { }
  ngOnInit() {
    this.globalObject.currentTitle = 'Project Management';
    this.loadProjectManagementInit();
  }
  /**
   * This method is used to load project management.
   */
  loadProjectManagementInit() {
    this.subscription = this.dataService.on('call-EditSOW').subscribe(() => this.getEditSOWData());
    this.subscription = this.dataService.on('call-Close-SOW').subscribe(() => this.closeSOW());
    this.pmObject.isAddSOWVisible = false;
    this.pmObject.isSOWFormSubmit = false;
    this.pmObject.isSOWRightViewVisible = false;
    this.pmObject.isSOWCloseVisible = false;
    this.initForm();
    this.bindMenuItems();
    this.setYearRange();
  }
  /**
   * This method is used to destroy the subscription.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  /**
   * This method is used to set the year range for calendar used into the project management.
   */
  setYearRange() {
    const currentYear = new Date().getFullYear();
    const next10Year = currentYear + 10;
    const prev5Year = currentYear - 5;
    this.pmObject.yearRange = '' + prev5Year + ' : ' + next10Year + '';
  }
  /***
   * This method is used to bind all the menu items.
   */
  bindMenuItems() {
    this.pmObject.tabMenuItems = [
      { label: 'All Projects', routerLink: 'allProjects' },
      { label: 'All SOW', routerLink: 'allSOW', routerLinkActiveOptions: { exact: true } },
      // tslint:disable-next-line:max-line-length
      { label: 'Send to Client', routerLink: 'sendToClient' },
      { label: 'Client Review', routerLink: 'clientReview' },
      // tslint:disable-next-line:max-line-length
      { label: 'Pending Allocation', routerLink: 'pendingAllocation' },
      { label: 'Inactive Projects', routerLink: 'inActive' }
    ];
    if (this.pmObject.userRights.isHaveSOWBudgetManager) {
      this.buttons = [
        {
          label: 'Add SOW', icon: 'pi pi-plus-circle', command: () => {
            this.showSOW();
          }
        }
      ];
    } else {
      const arrowButton: any = document.querySelector('.ui-splitbutton-menubutton');
      arrowButton.style.display = 'none';
    }
  }
  /**
   * This method will display the add project section.
   */
  displayAddProject() {
    this.pmService.resetAddProject();
    this.pmObject.isAddProjectVisible = true;
  }
  /**
   * This method is used to show the add sow section
   */
  showSOW() {
    this.addSowForm.reset();
    this.resetAddSOW();
    this.sowHeader = 'Add SOW';
    this.sowButton = 'Add SOW';
    this.setSOWDropDownValue();
    this.addSowForm.controls.sowCode.enable();
    this.addSowForm.controls.status.disable();
    this.addSowForm.controls.currency.enable();
    this.addSowForm.controls.net.enable();
    this.addSowForm.controls.oop.enable();
    this.addSowForm.controls.tax.enable();
    this.addSowForm.controls.clientLegalEntity.enable();
    this.addSowForm.controls.sowCreationDate.enable();
    this.pmObject.isAddSOWVisible = true;
    this.pmObject.isSOWFormSubmit = false;
  }
  /**
   * This method is used to set the dropdown value of add sow form.
   */
  setSOWDropDownValue() {
    // set the default value to status field.
    this.sowDropDown.ClientLegalEntity = [];
    this.sowDropDown.CMLevel1 = [];
    this.sowDropDown.BillingEntity = [];
    this.sowDropDown.CMLevel2 = [];
    this.sowDropDown.Delivery = [];
    this.sowDropDown.DeliveryOptional = [];
    this.sowDropDown.SowOwner = [];
    this.addSowForm.get('status').setValue(this.constant.SOW_STATUS.APPROVED);
    this.pmObject.addSOW.Status = this.constant.SOW_STATUS.APPROVED;
    const clientLegalEntity = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities;
    clientLegalEntity.forEach(element => {
      this.sowDropDown.ClientLegalEntity.push({ label: element.Title, value: element.Title });
    });
    this.sowDropDown.PracticeArea = this.pmObject.oProjectCreation.oProjectInfo.practiceArea;
    this.sowDropDown.Currency = this.pmObject.oProjectCreation.oProjectInfo.currency;
    this.pmObject.oProjectCreation.oProjectInfo.billingEntity.forEach(element => {
      this.sowDropDown.BillingEntity.push({ label: element.Title, value: element.Title });
    });
    this.pmObject.oProjectCreation.Resources.cmLevel1.forEach(element => {
      this.sowDropDown.CMLevel1.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.cmLevel2.forEach(element => {
      this.sowDropDown.CMLevel1.push({ label: element.Title, value: element.ID });
      this.sowDropDown.CMLevel2.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.deliveryLevel1.forEach(element => {
      this.sowDropDown.Delivery.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.deliveryLevel2.forEach(element => {
      this.sowDropDown.Delivery.push({ label: element.Title, value: element.ID });
      this.sowDropDown.DeliveryOptional.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.businessDevelopment.forEach(element => {
      this.sowDropDown.SowOwner.push({ label: element.Title, value: element.ID });
    });
    this.sowDropDown.CMLevel1.sort((a, b) => (a.label > b.label) ? 1 : -1);
    this.sowDropDown.Delivery.sort((a, b) => (a.label > b.label) ? 1 : -1);
  }
  /**
   * This method is called when client legal entity value is changed.
   */
  onChangeClientLegalEntity() {
    if (this.addSowForm.value.clientLegalEntity) {
    this.pmObject.addSOW.ClientLegalEntity = this.addSowForm.value.clientLegalEntity;
    }
    if (this.pmObject.addSOW.ClientLegalEntity) {
      this.sowDropDown.POC = [];
      this.sowDropDown.POCOptional = [];
      const poc = this.pmObject.projectContactsItems.filter((obj) =>
        obj.ClientLegalEntity === this.pmObject.addSOW.ClientLegalEntity);
      if (poc && poc.length) {
        // tslint:disable-next-line:no-shadowed-variable
        poc.forEach(element => {
          this.sowDropDown.POC.push({ label: element.FullNameCC, value: element.ID });
          this.sowDropDown.POCOptional.push({ label: element.FullNameCC, value: element.ID });
        });
      }
      const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
        x.Title === this.pmObject.addSOW.ClientLegalEntity);
      if (clientInfo && clientInfo.length) {
        this.currClientLegalEntityObj = clientInfo;
        this.addSowForm.get('cactusBillingEntity').setValue(clientInfo[0].BillingEntity);
        if (clientInfo[0].CMLevel1 && clientInfo[0].CMLevel1.results && clientInfo[0].CMLevel1.results.length) {
          const cm1 = this.pmService.getIds(clientInfo[0].CMLevel1.results);
          // const found = this.sowDropDown.CMLevel1.some(r => cm1.indexOf(r) >= 0); // Commented by kaushal on 12-07-2019
          const found = this.sowDropDown.CMLevel1.some(r => cm1.indexOf(r.value) >= 0);
          if (found) {
            this.addSowForm.get('cm').setValue(cm1);
          }
        }
        const cm2 = clientInfo[0].CMLevel2 && clientInfo[0].CMLevel2.hasOwnProperty('ID') ? clientInfo[0].CMLevel2.ID : 0;
        this.addSowForm.get('cm2').setValue(cm2);
        if (clientInfo[0].DeliveryLevel1 && clientInfo[0].DeliveryLevel1.results && clientInfo[0].DeliveryLevel1.results.length) {
          const del1 = this.pmService.getIds(clientInfo[0].DeliveryLevel1.results);
          const found = this.sowDropDown.Delivery.some(r => del1.indexOf(r.value) >= 0);
          if (found) {
            this.addSowForm.get('delivery').setValue(del1);
          }
        }
        const del2 = clientInfo[0].DeliveryLevel2 && clientInfo[0].DeliveryLevel2.hasOwnProperty('ID') ?
          clientInfo[0].DeliveryLevel2.ID : 0;
        this.addSowForm.get('deliveryOptional').setValue(del2);
      }
    }
  }
  /**
   * This method is used to initiaze the form.
   */
  initForm() {
    this.addSowForm = this.frmbuilder.group({
      clientLegalEntity: ['', Validators.required],
      poc: ['', Validators.required],
      pocOptional: [null],
      cactusBillingEntity: ['', Validators.required],
      practiceArea: ['', Validators.required],
      sowCode: [null, [Validators.required, Validators.maxLength(50)]],
      sowTitle: ['', [Validators.required, Validators.maxLength(255)]],
      sowCreationDate: ['', Validators.required],
      sowExpiryDate: ['', Validators.required],
      currency: ['', Validators.required],
      status: [null],
      sowDocuments: [],
      comments: [null],
      total: [0, [Validators.required, Validators.min(0)]],
      net: [0, [Validators.required, Validators.min(0)]],
      oop: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.required, Validators.min(0)]],
      cm: ['', Validators.required],
      cm2: ['', Validators.required],
      deliveryOptional: ['', Validators.required],
      delivery: [''],
      sowOwner: ['', Validators.required]
    });
    this.addAdditionalBudgetForm = this.frmbuilder.group({
      addTotal: [0, [Validators.required, Validators.min(0)]],
      addNet: [0, [Validators.required, Validators.min(0)]],
      addOOP: [0, [Validators.required, Validators.min(0)]],
      addTax: [0, [Validators.required, Validators.min(0)]],
      sowDocumentsAdd: ['', Validators.required],
    });
  }
  /**
   * This method is used to validate the form
   * @param formGroup pass the formGroup as a parameter.
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      // console.log(field);
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
        // console.log(control);
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  /**
   * This method is use to set the SOW total.
   */
  setSOWTotal() {
    this.pmObject.addSOW.Budget.Net = this.addSowForm.value.net ? this.addSowForm.value.net : 0;
    this.pmObject.addSOW.Budget.OOP = this.addSowForm.value.oop ? this.addSowForm.value.oop : 0;
    this.pmObject.addSOW.Budget.Tax = this.addSowForm.value.tax ? this.addSowForm.value.tax : 0;
    this.addSowForm.get('total').setValue(this.pmObject.addSOW.Budget.Net +
      this.pmObject.addSOW.Budget.OOP + this.pmObject.addSOW.Budget.Tax);

      if(!this.addSowForm.value.net) {
        this.addSowForm.get('net').setValue(0);
      }
      if(!this.addSowForm.value.oop) {
        this.addSowForm.get('oop').setValue(0);
      }
      if(!this.addSowForm.value.tax) {
        this.addSowForm.get('tax').setValue(0);
      }
  }
  /***
   * This method is used to add the sow
   */
  async createSOW() {

    this.pmObject.isSOWFormSubmit = true;
    if (this.addSowForm.valid) {
      this.pmObject.isSOWFormSubmit = false;
      if (!this.selectedFile && !this.pmObject.addSOW.ID) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Please select SOW document.'
        });
        return false;
      }
      // get all the value from form.
      this.pmObject.addSOW.ClientLegalEntity = this.addSowForm.value.clientLegalEntity ? this.addSowForm.value.clientLegalEntity :
        this.pmObject.addSOW.ClientLegalEntity;
      this.pmObject.addSOW.SOWCode = this.addSowForm.value.sowCode ? this.addSowForm.value.sowCode + '-SOW' : this.pmObject.addSOW.SOWCode;
      this.pmObject.addSOW.BillingEntity = this.addSowForm.value.cactusBillingEntity;
      this.pmObject.addSOW.PracticeArea = this.addSowForm.value.practiceArea;
      this.pmObject.addSOW.Poc = this.addSowForm.value.poc;
      this.pmObject.addSOW.PocOptional = this.addSowForm.value.pocOptional;
      this.pmObject.addSOW.SOWTitle = this.addSowForm.value.sowTitle;
      this.pmObject.addSOW.SOWCreationDate = this.addSowForm.value.sowCreationDate ? this.addSowForm.value.sowCreationDate :
        this.pmObject.addSOW.SOWCreationDate;
      this.pmObject.addSOW.SOWExpiryDate = this.addSowForm.value.sowExpiryDate;
      if (this.pmObject.addSOW.SOWCreationDate && this.pmObject.addSOW.SOWExpiryDate) {
        const creationDate = new Date(this.pmObject.addSOW.SOWCreationDate);
        const expirtyDate = new Date(this.pmObject.addSOW.SOWExpiryDate);
        if (expirtyDate <= creationDate) {
          this.messageService.add({
            key: 'custom', severity: 'error',
            summary: 'Error Message', detail: 'SOW expiry date should be greater than sow creation date.'
          });
          return;
        }
      }
      this.pmObject.isMainLoaderHidden = false;
      this.pmObject.addSOW.Status = this.addSowForm.value.status ? this.addSowForm.value.status : this.pmObject.addSOW.Status;
      this.pmObject.addSOW.Comments = this.addSowForm.value.comments;
      this.pmObject.addSOW.Currency = this.addSowForm.value.currency ? this.addSowForm.value.currency : this.pmObject.addSOW.Currency;
      this.pmObject.addSOW.Budget.Total = this.addSowForm.value.total;
      this.pmObject.addSOW.CM1 = this.addSowForm.value.cm;
      this.pmObject.addSOW.CM2 = this.addSowForm.value.cm2;
      this.pmObject.addSOW.DeliveryOptional = this.addSowForm.value.deliveryOptional;
      this.pmObject.addSOW.Delivery = this.addSowForm.value.delivery;
      this.pmObject.addSOW.SOWOwner = this.addSowForm.value.sowOwner;
      // Add user to all operation field.
      this.pmObject.addSOW.AllOperationId.push(this.pmObject.currLoginInfo.Id);
      if (this.pmObject.addSOW.CM1 && this.pmObject.addSOW.CM1.length) {
        this.pmObject.addSOW.CM1.forEach(element => {
          this.pmObject.addSOW.AllOperationId.push(element);
        });
      }
      if (this.pmObject.addSOW.Delivery && this.pmObject.addSOW.Delivery.length) {
        this.pmObject.addSOW.Delivery.forEach(element => {
          this.pmObject.addSOW.AllOperationId.push(element);
        });
      }
      this.pmObject.addSOW.AllOperationId.push(this.pmObject.addSOW.SOWOwner);
      this.pmObject.addSOW.AllOperationId.push(this.pmObject.addSOW.CM2);
      this.pmObject.addSOW.AllOperationId.push(this.pmObject.addSOW.DeliveryOptional);
      let fileUploadResult = {};
      if (this.selectedFile) {
        fileUploadResult = await this.submitFile();
      }
      this.pmObject.addSOW.isSOWCodeDisabled = false;
      this.pmObject.addSOW.isStatusDisabled = true;
      if (this.selectedFile && !fileUploadResult.hasOwnProperty('hasError')) {
        if (!this.pmObject.addSOW.ID) {
          await this.createUpdateSOW(false, this.pmObject.addSOW);
        }
        if (this.pmObject.addSOW.ID) {
          await this.createUpdateSOW(true, this.pmObject.addSOW);
        }
      } else {
        if (!this.pmObject.addSOW.ID) {
          await this.createUpdateSOW(false, this.pmObject.addSOW);
        }
        if (this.pmObject.addSOW.ID) {
          await this.createUpdateSOW(true, this.pmObject.addSOW);
        }
      }
      this.selectedFile = null;
    } else {
      this.validateAllFormFields(this.addSowForm);
    }
  }
  /**
   * This method is used to set the field properties.
   */
  setFieldProperties() {
    this.setSOWDropDownValue();
    this.onChangeClientLegalEntity();
    this.addSowForm.get('clientLegalEntity').setValue(this.pmObject.addSOW.ClientLegalEntity);
    this.addSowForm.get('sowCode').setValue(this.pmObject.addSOW.SOWCode);
    this.addSowForm.get('cactusBillingEntity').setValue(this.pmObject.addSOW.BillingEntity);
    this.addSowForm.get('practiceArea').setValue(this.pmObject.addSOW.PracticeArea);
    this.addSowForm.get('poc').setValue(this.pmObject.addSOW.Poc);
    this.addSowForm.get('pocOptional').setValue(this.pmObject.addSOW.PocOptional);
    this.addSowForm.get('sowTitle').setValue(this.pmObject.addSOW.SOWTitle);
    this.addSowForm.get('sowCreationDate').setValue(this.pmObject.addSOW.SOWCreationDate);
    this.addSowForm.get('sowExpiryDate').setValue(this.pmObject.addSOW.SOWExpiryDate);
    this.addSowForm.get('comments').setValue(this.pmObject.addSOW.Comments);
    this.addSowForm.get('currency').setValue(this.pmObject.addSOW.Currency);
    this.addSowForm.get('total').setValue(this.pmObject.addSOW.Budget.Total);
    this.addSowForm.get('net').setValue(this.pmObject.addSOW.Budget.Net);
    this.addSowForm.get('oop').setValue(this.pmObject.addSOW.Budget.OOP);
    this.addSowForm.get('tax').setValue(this.pmObject.addSOW.Budget.Tax);
    this.addSowForm.get('cm').setValue(this.pmObject.addSOW.CM1);

    this.addSowForm.get('cm2').setValue(this.pmObject.addSOW.CM2);
    this.addSowForm.get('deliveryOptional').setValue(this.pmObject.addSOW.DeliveryOptional);
    this.addSowForm.get('delivery').setValue(this.pmObject.addSOW.Delivery);
    this.addSowForm.get('sowOwner').setValue(this.pmObject.addSOW.SOWOwner);
    // if (this.pmObject.addSOW.SOWDocument) {
    //   if (this.pmObject.addSOW.SOWDocument.lastIndexOf('/') > -1) {
    //     this.addSowForm.get('sowDocuments').setValue(this.pmObject.addSOW.SOWDocument.substr(this.pmObject.addSOW.SOWDocument.lastIndexOf('/') + 1));
    //   } else {
    //     this.addSowForm.get('sowDocuments').setValue(this.pmObject.addSOW.SOWDocument);
    //   }
    // }
  }
  /**
   * This method is used to upload the file on finance/sow.
   */
  async submitFile() {
    const docFolder = 'Finance/SOW';
    let libraryName = '';
    const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
      x.Title === this.pmObject.addSOW.ClientLegalEntity);
    if (clientInfo && clientInfo.length) {
      this.currClientLegalEntityObj = clientInfo;
      libraryName = clientInfo[0].ListName;
    }
    const folderPath: string = this.globalObject.sharePointPageObject.webRelativeUrl + '/' + libraryName + '/' + docFolder;
    this.filePathUrl = await this.spServices.getFileUploadUrl(folderPath, this.selectedFile.name, true);
    this.commonService.SetNewrelic('ProjectManagement', 'projectmanagement-submitFile', 'uploadFile');
    const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result);
    console.log(res);
    // Added by kaushal on 12-07-2019
    if (res.hasOwnProperty('ServerRelativeUrl') && res.hasOwnProperty('Name')) { // && !res.hasOwnProperty('hasError')
      this.pmObject.addSOW.SOWFileURL = res.ServerRelativeUrl;
      this.pmObject.addSOW.SOWFileName = res.Name;
      this.pmObject.addSOW.SOWDocProperties = res;
    }
    return res;
  }
  /**
   * This method get called when we change the file.
   * @param event Pass the file properties as a parameter.
   */
  onFileChange(event) {
    this.selectedFile = null;
    this.fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileReader.readAsArrayBuffer(this.selectedFile);

      // this.addSowForm.patchValue({
      //   'sowDocuments': this.selectedFile ? this.selectedFile.name : ''
      // })
    }
  }
  /**
   * This method is used to upload the document and return the uploaded document properties.
   * @param event event parameter should be file properties.
   */
  async uploadDocuments(event) {
    const docFolder = 'Finance/SOW';
    let libraryName = '';
    const uploadedFiles = [];
    event.files.forEach(async element => {
      const filename = element.name;
      this.fileReader = new FileReader();
      this.fileReader.readAsArrayBuffer(element);
      // tslint:disable-next-line:max-line-length
      const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x => x.Title === this.pmObject.addSOW.ClientLegalEntity);
      if (clientInfo && clientInfo.length) {
        this.currClientLegalEntityObj = clientInfo;
        libraryName = clientInfo[0].ListName;
      }
      this.fileReader.onload = () => {
        const filePathUrl = this.globalObject.sharePointPageObject.webAbsoluteUrl
          // tslint:disable
          + "/_api/web/GetFolderByServerRelativeUrl('" + libraryName + "/" + docFolder + "')/Files/add(url=@TargetFileName,overwrite='false')?" +
          // tslint:disable-next-line:quotemark
          "&@TargetFileName='" + filename + "'&$expand=ListItemAllFields";
        // tslint:enable
        this.commonService.SetNewrelic('ProjectManagement', 'projectmanagement-uploadDocuments', 'uploadFile');
        const res: any = this.spServices.uploadFile(filePathUrl, this.fileReader.result);
        // .subscribe(res => {
        if (res) {
          // uploadedFiles.push(res);
          // if (uploadedFiles && uploadedFiles[0] && event.files.length === uploadedFiles.length) {
          this.pmObject.addSOW.SOWFileURL = res.ServerRelativeUrl;
          this.pmObject.addSOW.SOWFileName = res.Name;
          this.pmObject.addSOW.SOWDocProperties = res;
          // tslint:disable-next-line:max-line-length
          // }
        }
        // });
      };
    });
  }
  /**
   * This method is used to create or update the SOW.
   * @param isUpdate Pass true if want to update sow else true.
   * @param sowObj Pass the sowObj as parameter.
   */
  createUpdateSOW(isUpdate, sowObj) {
    if (!isUpdate) {
      this.addUpdateSOW(sowObj);
    } else {
      this.addUpdateSOW(sowObj);
    }
  }
  /**
   * This method is used to send e-mail based sow status.
   * @param sowObj Pass sowObj as a parameter.
   * @param sowStatus Pass the status as parameter.
   */
  addUpdateSOWsendEmail(sowObj, sowStatus) {
    const objEmailBody = [];
    let mailSubject = '';
    if (sowStatus === this.constant.SOW_STATUS.APPROVED) {
      mailSubject = sowObj.SOWCode + ' - SOW Created';
    }
    if (sowStatus === this.constant.SOW_STATUS.UPDATE) {
      mailSubject = sowObj.SOWCode + ' - SOW Updated';
    }
    if (sowStatus === this.constant.SOW_STATUS.CLOSED) {
      mailSubject = sowObj.SOWCode + ' - SOW Closed';
    }
    objEmailBody.push({
      key: '@@SowCode@@',
      value: sowObj.SOWCode
    });
    objEmailBody.push({
      key: '@@ClientName@@',
      value: sowObj.ClientLegalEntity
    });
    objEmailBody.push({
      key: '@@Title@@',
      value: sowObj.SOWTitle
    });
    objEmailBody.push({
      key: '@@POC@@',
      value: this.pmService.extractNamefromPOC([sowObj.Poc])
    });
    objEmailBody.push({
      key: '@@Currency@@',
      value: sowObj.Currency
    });
    objEmailBody.push({
      key: '@@Comments@@',
      value: sowObj.Comments
    });
    objEmailBody.push({
      key: '@@NewTotalBudget@@',
      value: sowObj.Budget.Total
    });
    objEmailBody.push({
      key: '@@NewNetBudget@@',
      value: sowObj.Budget.Net
    });
    objEmailBody.push({
      key: '@@NewOOPBudget@@',
      value: sowObj.Budget.OOP
    });
    objEmailBody.push({
      key: '@@NewTaxBudget@@',
      value: sowObj.Budget.Tax
    });
    objEmailBody.push({
      key: '@@SOWUrl@@',
      value: sowObj.SOWFileURL
    });
    let arrayTo = [];
    let tempArray = [];
    let ccArray = [];
    tempArray = tempArray.concat(sowObj.SOWOwner, sowObj.CM1, sowObj.CM2, sowObj.DeliveryOptional, sowObj.Delivery);
    arrayTo = this.pmService.getEmailId(tempArray);
    ccArray = this.pmService.getEmailId(sowObj.CM1);
    ccArray.push(this.pmObject.currLoginInfo.Email);
    this.pmService.getTemplate(this.constant.EMAIL_TEMPLATE_NAME.APPROVED_SOW, objEmailBody, mailSubject, arrayTo,
      ccArray); // Send Mail
  }
  /**
   * This method is used send email when budget will updated.
   * @param sowObj Pass sowObj as parameter.
   */
  updateBudgetEmail(sowObj) {
    const objEmailBody = [];
    const mailSubject = sowObj.SOWCode + ' - Budget Updated';
    objEmailBody.push({
      key: '@@SowCode@@',
      value: sowObj.SOWCode
    });
    objEmailBody.push({
      key: '@@ClientName@@',
      value: sowObj.ClientLegalEntity
    });
    objEmailBody.push({
      key: '@@Title@@',
      value: sowObj.SOWTitle
    });
    objEmailBody.push({
      key: '@@POC@@',
      value: this.pmService.extractNamefromPOC([sowObj.Poc])
    });
    objEmailBody.push({
      key: '@@Currency@@',
      value: sowObj.Currency
    });
    objEmailBody.push({
      key: '@@Comments@@',
      value: sowObj.Comments
    });
    objEmailBody.push({
      key: '@@TotalBudget@@',
      value: sowObj.Budget.Total
    });
    objEmailBody.push({
      key: '@@AddendumTotalvalue@@',
      value: sowObj.Addendum.TotalBudget
    });
    objEmailBody.push({
      key: '@@NewTotalBudget@@',
      value: parseFloat((sowObj.Budget.Total + sowObj.Addendum.TotalBudget).toFixed(2))
    });

    objEmailBody.push({
      key: '@@NetBudget@@',
      value: sowObj.Budget.Net
    });
    objEmailBody.push({
      key: '@@AddendumNetvalue@@',
      value: sowObj.Addendum.NetBudget
    });
    objEmailBody.push({
      key: '@@NewNetBudget@@',
      value: parseFloat((sowObj.Budget.Net + sowObj.Addendum.NetBudget).toFixed(2))
    });

    objEmailBody.push({
      key: '@@OOPBudget@@',
      value: sowObj.Budget.OOP
    });
    objEmailBody.push({
      key: '@@AddendumOOPvalue@@',
      value: sowObj.Addendum.OOPBudget
    });
    objEmailBody.push({
      key: '@@NewOOPBudget@@',
      value: parseFloat((sowObj.Budget.OOP + sowObj.Addendum.OOPBudget).toFixed(2))
    });

    objEmailBody.push({
      key: '@@TaxBudget@@',
      value: sowObj.Budget.Tax
    });
    objEmailBody.push({
      key: '@@AddendumTaxvalue@@',
      value: sowObj.Addendum.TaxBudget
    });
    objEmailBody.push({
      key: '@@NewTaxBudget@@',
      value: parseFloat((sowObj.Budget.Tax + sowObj.Addendum.TaxBudget).toFixed(2))
    });
    let arrayTo = [];
    let tempArray = [];
    tempArray = tempArray.concat(sowObj.SOWOwner, sowObj.CM1, sowObj.CM2, sowObj.DeliveryOptional, sowObj.Delivery);
    arrayTo = this.pmService.getEmailId(tempArray);
    this.pmService.getTemplate(this.constant.EMAIL_TEMPLATE_NAME.SOW_BUDGET_UPDATED, objEmailBody, mailSubject, arrayTo,
      [this.pmObject.currLoginInfo.Email]); // Send Mail
  }
  /**
   * This method is used to add or udpate the SOW.
   * @param sowObj The parameter shoudl be SOW list object.
   */
  async addUpdateSOW(sowObj) {
    if (!sowObj.ID) { // Create SOW
      const sowInfoOptions = this.getSOWDataObj(sowObj);
      this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'CreateSow');
      await this.spServices.createItem(this.constant.listNames.SOW.name, sowInfoOptions, this.constant.listNames.SOW.type);
      await this.addSOWBudgetBreakup(sowObj);
      const clientInfo = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
        x.Title === this.pmObject.addSOW.ClientLegalEntity);
      if (clientInfo && clientInfo.length) {
        this.currClientLegalEntityObj = clientInfo;
        const cID = this.currClientLegalEntityObj[0].ID;
        let counter = this.currClientLegalEntityObj[0].SOWCounter;
        if (!counter) {
          counter = 1;
        } else {
          counter = +counter + 1;
        }
        const clientLegalInfo = { SOWCounter: counter };
        this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'updateClientLegalEntity');
        const retResults = await this.spServices.updateItem(this.constant.listNames.ClientLegalEntity.name, cID, clientLegalInfo,
          this.constant.listNames.ClientLegalEntity.type);
        this.addUpdateSOWsendEmail(sowObj, this.constant.SOW_STATUS.APPROVED);
        this.pmObject.isMainLoaderHidden = true;
        this.messageService.add({
          key: 'custom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'SOW Created - ' + sowObj.SOWCode + ' Successfully.'
        });
        setTimeout(() => {
          this.pmObject.isAddSOWVisible = false;
          this.pmObject.isSOWFormSubmit = false;
          if (this.router.url === '/projectMgmt/allSOW') {
            this.dataService.publish('reload-EditSOW');
          } else {
            this.router.navigate(['/projectMgmt/allSOW']);
          }
        }, this.pmConstant.TIME_OUT);
      }
    } else { // Update SOW
      switch (sowObj.Status) {
        case this.constant.SOW_STATUS.APPROVED:
          sowObj.Status = this.constant.SOW_STATUS.APPROVED;
          break;
      }
      const data = this.getSOWDataObj(sowObj);
      this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'updateSow');
      await this.spServices.updateItem(this.constant.listNames.SOW.name, sowObj.ID, data, this.constant.listNames.SOW.type);
      this.addUpdateSOWsendEmail(sowObj, this.constant.SOW_STATUS.UPDATE);
      this.messageService.add({
        key: 'custom', severity: 'success', sticky: true,
        summary: 'Success Message', detail: 'SOW Updated - ' + sowObj.SOWCode + ' Successfully.'
      });
      this.pmObject.isMainLoaderHidden = true;
      setTimeout(() => {
        if (this.router.url === '/projectMgmt/allSOW') {
          this.dataService.publish('reload-EditSOW');
        } else {
          this.router.navigate(['/projectMgmt/allSOW']);
        }
      }, this.pmConstant.TIME_OUT);
    }
  }
  /**
   * This function is used to update the parent SOW budget.
   */
  async updateParentSOWBudget(obj, predecessor, budget) {
    const contentFilter = Object.assign({}, this.pmConstant.SOW_QUERY.PREDECESSOR);
    // tslint:disable-next-line:max-line-length
    contentFilter.filter = contentFilter.filter.replace(/{{predecessor}}/gi, predecessor);
    this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'GetSow');
    const sResult = await this.spServices.readItems(this.constant.listNames.SOW.name, contentFilter);
    if (sResult && sResult.length > 0) {
      const cID = sResult[0].Id;
      const strParentBudget = sResult[0].TotalLinked ? sResult[0].TotalLinked : 0;
      budget = budget ? budget : 0;
      const total = (parseFloat(budget) + parseFloat(strParentBudget)).toFixed(2);
      const data = {
        TotalLinked: total
      };
      this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'updateSow');
      await this.spServices.updateItem(this.constant.listNames.SOW.name, cID, data, this.constant.listNames.SOW.type);
    }
  }
  /**
   * This function is used to store the SOW object in key pair values.
   * @param sowObj The parameter should be SOW list object.
   */
  getSOWDataObj(sowObj) {
    // const d = new Date();
    // const year = d.getFullYear();
    const sowInfoOptions = {
      ClientLegalEntity: sowObj.ClientLegalEntity,
      SOWCode: sowObj.SOWCode,
      BillingEntity: sowObj.BillingEntity,
      Status: sowObj.Status,
      Title: sowObj.SOWTitle,
      CommentsMT: sowObj.Comments,
      Currency: sowObj.Currency,
      TotalBudget: sowObj.Budget.Total,
      NetBudget: sowObj.Budget.Net,
      OOPBudget: sowObj.Budget.OOP,
      TaxBudget: sowObj.Budget.Tax,
      BusinessVertical: sowObj.PracticeArea.join(';#'),
      //Year: year,
      CreatedDate: sowObj.SOWCreationDate,
      ExpiryDate: sowObj.SOWExpiryDate,
      SOWLink: sowObj.SOWFileURL ? sowObj.SOWFileURL : sowObj.SOWDocument,
      CMLevel1Id: {
        results: sowObj.CM1 ? sowObj.CM1 : [],
      },
      CMLevel2Id: sowObj.CM2,
      DeliveryLevel1Id: {
        results: sowObj.Delivery ? sowObj.Delivery : [],
      },
      DeliveryLevel2Id: sowObj.DeliveryOptional,
      BDId: sowObj.SOWOwner,
      PrimaryPOC: sowObj.Poc,
      AdditionalPOC: sowObj.PocOptional ? sowObj.PocOptional.join(';#') : '',
      AllResourcesId: {
        results: sowObj.AllOperationId
      }
    };
    return sowInfoOptions;
  }
  /**
   * This function is used to add the budget value into budget break up list.
   * @param sowObj The parameter should be SOW list object.
   */
  async addSOWBudgetBreakup(sowObj) {
    if (sowObj.Budget.Total || sowObj.Budget.Total === 0) {
      const data = this.getBudgetBreakupObj(sowObj);
      this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'createSowBudBreakup');
      await this.spServices.createItem(this.constant.listNames.SOWBudgetBreakup.name, data, this.constant.listNames.SOWBudgetBreakup.type);
    }
  }
  /**
   * This method is used to create the budget break up object
   * @param sowObj The parameter should be SOW list object.
   */
  getBudgetBreakupObj(sowObj) {
    const d = new Date();
    const today = this.pmService.toISODateString(d);
    const budgetBreakUpOptions = {
      Currency: sowObj.Currency,
      NetBudget: sowObj.Budget.Net,
      OOPBudget: sowObj.Budget.OOP,
      Status: sowObj.Status,
      TaxBudget: sowObj.Budget.Tax,
      TotalBudget: sowObj.Budget.Total,
      SOWCode: sowObj.SOWCode,
      AddendumNetBudget: sowObj.Addendum.NetBudget,
      AddendumOOPBudget: sowObj.Addendum.OOPBudget,
      AddendumTaxBudget: sowObj.Addendum.TaxBudget,
      AddendumTotalBudget: sowObj.Addendum.TotalBudget,
      InternalReviewStartDate: today,
      ClientReviewStartDate: today,
      ClientReviewCompletionDate: today,
      InternalReviewCompletionDate: today
    };
    return budgetBreakUpOptions;
  }
  /**
   * This method is used reset the SOW add/update field.
   */
  resetAddSOW() {
    this.pmObject.addSOW.ID = 0;
    this.pmObject.addSOW.ClientLegalEntity = '';
    this.pmObject.addSOW.SOWCode = '';
    this.pmObject.addSOW.BillingEntity = '';
    this.pmObject.addSOW.PracticeArea = '';
    this.pmObject.addSOW.Poc = '';
    this.pmObject.addSOW.PocOptional = [];
    this.pmObject.addSOW.SOWTitle = '';
    this.pmObject.addSOW.SOWCreationDate = null;
    this.pmObject.addSOW.SOWExpiryDate = null;
    this.pmObject.addSOW.Status = '';
    this.pmObject.addSOW.SOWFileURL = '';
    this.pmObject.addSOW.SOWFileName = '';
    this.pmObject.addSOW.SOWDocProperties = [];
    this.pmObject.addSOW.Comments = '';
    this.pmObject.addSOW.Currency = '';
    this.pmObject.addSOW.Budget.Total = +'';
    this.pmObject.addSOW.Budget.Net = +'';
    this.pmObject.addSOW.Budget.OOP = +'';
    this.pmObject.addSOW.Budget.Tax = +'';
    this.pmObject.addSOW.CM1 = [];
    this.pmObject.addSOW.CM2 = '';
    this.pmObject.addSOW.DeliveryOptional = '';
    this.pmObject.addSOW.Delivery = [];
    this.pmObject.addSOW.SOWOwner = '';
    this.pmObject.addSOW.Addendum.NetBudget = +'';
    this.pmObject.addSOW.Addendum.OOPBudget = +'';
    this.pmObject.addSOW.Addendum.TotalBudget = +'';
    this.pmObject.addSOW.Addendum.TaxBudget = +'';
    this.pmObject.isSOWFormSubmit = false;
    this.selectedFile = null;
    this.myInputVariable.nativeElement.value = '';
  }
  /**
   * This method is used to close the additional Popup.
   */
  closeAdditonalPop() {
    this.addAdditionalBudgetForm.reset();
    this.myInputVariable.nativeElement.value = '';
    this.pmObject.isSOWFormSubmit = false;
    this.pmObject.isAdditionalBudgetVisible = false;
    this.selectedFile = null;
    if (this.router.url === '/projectMgmt/allSOW') {
      this.dataService.publish('reload-EditSOW');
    }
  }
  /**
   * This method is used to add sow total.
   */
  setAddSOWTotal() {

    this.pmObject.addSOW.Additonal.NetBudget = this.addAdditionalBudgetForm.value.addNet;
    this.pmObject.addSOW.Additonal.OOPBudget = this.addAdditionalBudgetForm.value.addOOP ? this.addAdditionalBudgetForm.value.addOOP : 0;
    this.pmObject.addSOW.Additonal.TaxBudget = this.addAdditionalBudgetForm.value.addTax ? this.addAdditionalBudgetForm.value.addTax : 0;

    const AddBudgets = this.pmObject.addSOW.Additonal.NetBudget +
      this.pmObject.addSOW.Additonal.OOPBudget + this.pmObject.addSOW.Additonal.TaxBudget;
    this.addAdditionalBudgetForm.get('addTotal').setValue(parseFloat(AddBudgets.toFixed(2)));
  }
  /**
   * This method is used to add additional budget.
   */
  async addAdditionalBudget() {
    this.pmObject.isSOWFormSubmit = true;
    if (this.addAdditionalBudgetForm.valid) {
      this.pmObject.isSOWFormSubmit = false;
      // get the budget from SOW list based on SOWID.
      if (!this.selectedFile) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Please select SOW document.'
        });
        return;
      }
      this.pmObject.isMainLoaderHidden = false;
      const d = new Date();
      const today = this.pmService.toISODateString(d);
      let currSelectedSOW;
      let sowItemResult = [];
      if (this.pmObject.selectedSOWTask) {
        currSelectedSOW = this.pmObject.selectedSOWTask;
        const sowItemFilter = Object.assign({}, this.pmConstant.SOW_QUERY.SOW_BY_ID);
        sowItemFilter.filter = sowItemFilter.filter.replace(/{{Id}}/gi, currSelectedSOW.ID);
        this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'getSow');
        sowItemResult = await this.spServices.readItems(this.constant.listNames.SOW.name, sowItemFilter);
        if (sowItemResult && sowItemResult.length) {
          this.pmObject.addSOW.Budget.Total = sowItemResult[0].TotalBudget ? sowItemResult[0].TotalBudget : 0;
          this.pmObject.addSOW.Budget.Net = sowItemResult[0].NetBudget ? sowItemResult[0].NetBudget : 0;
          this.pmObject.addSOW.Budget.OOP = sowItemResult[0].OOPBudget ? sowItemResult[0].OOPBudget : 0;
          this.pmObject.addSOW.Budget.Tax = sowItemResult[0].TaxBudget ? sowItemResult[0].TaxBudget : 0;
          this.pmService.setGlobalVariable(sowItemResult[0]);
        }
      }
      if (this.pmObject.addSOW.SOWDocument.indexOf(this.selectedFile.name) > -1) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Addendum SOW document name same as original document name.'
        });
        this.pmObject.isMainLoaderHidden = true;
        return;
      }

      if (this.selectedFile) {
        await this.submitFile();
      }

      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };


      // Assign form value to global variable
      this.pmObject.addSOW.Addendum.TotalBudget = this.addAdditionalBudgetForm.value.addTotal;
      this.pmObject.addSOW.Addendum.NetBudget = this.addAdditionalBudgetForm.value.addNet;
      this.pmObject.addSOW.Addendum.OOPBudget = this.addAdditionalBudgetForm.value.addOOP ? this.addAdditionalBudgetForm.value.addOOP : 0;
      this.pmObject.addSOW.Addendum.TaxBudget = this.addAdditionalBudgetForm.value.addTax ? this.addAdditionalBudgetForm.value.addTax : 0;
      // create sow obj for update the sow list.
      const updateSOWObj = {
        TotalBudget: this.pmObject.addSOW.Addendum.TotalBudget + this.pmObject.addSOW.Budget.Total,
        NetBudget: this.pmObject.addSOW.Addendum.NetBudget + this.pmObject.addSOW.Budget.Net,
        OOPBudget: this.pmObject.addSOW.Addendum.OOPBudget + this.pmObject.addSOW.Budget.OOP,
        TaxBudget: this.pmObject.addSOW.Addendum.TaxBudget + this.pmObject.addSOW.Budget.Tax,
        SOWLink: this.pmObject.addSOW.SOWFileURL,
        __metadata: {
          type: this.constant.listNames.SOW.type
        }
      };
      // create budgetbreakup obj for create new item in SOWBudgetBreakup list.
      const newBudgetSOWObj = {
        TotalBudget: this.pmObject.addSOW.Addendum.TotalBudget + this.pmObject.addSOW.Budget.Total,
        NetBudget: this.pmObject.addSOW.Addendum.NetBudget + this.pmObject.addSOW.Budget.Net,
        OOPBudget: this.pmObject.addSOW.Addendum.OOPBudget + this.pmObject.addSOW.Budget.OOP,
        TaxBudget: this.pmObject.addSOW.Addendum.TaxBudget + this.pmObject.addSOW.Budget.Tax,
        AddendumTotalBudget: this.pmObject.addSOW.Addendum.TotalBudget,
        AddendumNetBudget: this.pmObject.addSOW.Addendum.NetBudget,
        AddendumOOPBudget: this.pmObject.addSOW.Addendum.OOPBudget,
        AddendumTaxBudget: this.pmObject.addSOW.Addendum.TaxBudget,
        Currency: this.pmObject.addSOW.Currency,
        SOWCode: this.pmObject.addSOW.SOWCode,
        Status: this.pmObject.addSOW.Status,
        InternalReviewStartDate: today,
        ClientReviewStartDate: today,
        ClientReviewCompletionDate: today,
        InternalReviewCompletionDate: today,
        __metadata: {
          type: this.constant.listNames.SOWBudgetBreakup.type
        }
      };
      const updateSowData = Object.assign({}, options);
      updateSowData.data = updateSOWObj;
      updateSowData.listName = this.constant.listNames.SOW.name;
      updateSowData.type = 'PATCH';
      updateSowData.url = this.spServices.getItemURL(this.constant.listNames.SOW.name, currSelectedSOW.ID);
      batchURL.push(updateSowData);

      const insertSOWBudgetBreakup = Object.assign({}, options);
      insertSOWBudgetBreakup.data = newBudgetSOWObj;
      insertSOWBudgetBreakup.listName = this.constant.listNames.SOWBudgetBreakup.name;
      insertSOWBudgetBreakup.type = 'POST';
      insertSOWBudgetBreakup.url = this.spServices.getReadURL(this.constant.listNames.SOWBudgetBreakup.name, null);
      batchURL.push(insertSOWBudgetBreakup);
      this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'GetSowSowBudBreakup');
      const res = await this.spServices.executeBatch(batchURL);
      if (sowItemResult && sowItemResult.length) {
        this.updateBudgetEmail(this.pmObject.addSOW);
        this.pmObject.isMainLoaderHidden = true;
        this.messageService.add({ key: 'custom', severity: 'success', summary: 'Success Message', detail: 'Budget updated Successfully.' });
        console.log(res);
        setTimeout(() => {
          this.closeAdditonalPop();
        }, this.pmConstant.TIME_OUT);
      }
      this.selectedFile = null;
    } else {
      this.validateAllFormFields(this.addAdditionalBudgetForm);
      if (!this.selectedFile) {
        this.messageService.add({
          key: 'custom', severity: 'error',
          summary: 'Error Message', detail: 'Please select SOW document.'
        });
        return false;
      }

    }
    
  }
  /**
   * This method is used to get the edit SOWObj value based on selected sow.
   */
  async getEditSOWData() {
    const currSelectedSOW = this.pmObject.selectedSOWTask;
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // get Budget Breakup based on clientLegalEntity.
    const sowItemGet = Object.assign({}, options);
    const sowEndPoint = this.spServices.getReadURL(this.constant.listNames.SOW.name,
      this.pmConstant.SOW_QUERY.SOW_BY_ID);
    sowItemGet.url = sowEndPoint.replace(/{{Id}}/gi, '' + currSelectedSOW.ID);
    sowItemGet.type = 'GET';
    sowItemGet.listName = this.constant.listNames.SOW.name;
    batchURL.push(sowItemGet);

    const budgetGet = Object.assign({}, options);
    const budgetEndPoint = this.spServices.getReadURL(this.constant.listNames.SOWBudgetBreakup.name,
      this.pmConstant.SOW_QUERY.COPY_AND_UPDATE_BUDGET_BREAKUP);
    budgetGet.url = budgetEndPoint.replace(/{{SOWCodeStr}}/gi, '' + currSelectedSOW.SOWCode);
    budgetGet.type = 'GET';
    budgetGet.listName = this.constant.listNames.SOWBudgetBreakup.name;
    batchURL.push(budgetGet);
    this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'GetSowSowBudBreakup');
    const arrResults = await this.spServices.executeBatch(batchURL);
    if (arrResults && arrResults.length) {
      const sowItem = arrResults[0].retItems[0];
      this.addSowForm.controls.sowCode.disable();
      this.addSowForm.controls.status.disable();
      this.addSowForm.controls.currency.disable();
      this.addSowForm.controls.net.disable();
      this.addSowForm.controls.oop.disable();
      this.addSowForm.controls.tax.disable();
      this.addSowForm.controls.clientLegalEntity.disable();
      this.addSowForm.controls.sowCreationDate.disable();
      this.addSowForm.controls.cactusBillingEntity.disable();
      // this.addSowForm.controls.sowDocuments
      this.pmService.setGlobalVariable(sowItem);
      this.pmObject.addSOW.isSOWCodeDisabled = true;
      this.pmObject.addSOW.isStatusDisabled = false;
      this.pmObject.addSOW.ID = currSelectedSOW.ID;
      this.sowHeader = 'Edit SOW';
      this.sowButton = 'Update SOW';
      this.setFieldProperties();
      this.pmObject.isAddSOWVisible = true;
      this.pmObject.isSOWFormSubmit = false;
    }
  }
  /**
   * This method is used to close the sow.
   */
  closeSOW() {
    this.pmObject.isSOWCloseVisible = true;
    this.confirmationService.confirm({
      header: 'Close SOW',
      icon: 'pi pi-exclamation-triangle',
      message: 'Are you sure you want to close the SOW ?',
      accept: () => {
        this.updateStatus();
      }
    });
  }
  /**
   * This method is used to update the sow status based on selected sow.
   */
  async updateStatus() {
    const currSelectedSOW = this.pmObject.selectedSOWTask;
    const sowUpdateOptions = {
      Status: this.constant.SOW_STATUS.CLOSED,
      __metadata: {
        type: this.constant.listNames.SOW.type
      }
    };
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // get SowItem base on Current SOWID.
    const sowItemGet = Object.assign({}, options);
    const sowEndPoint = this.spServices.getReadURL(this.constant.listNames.SOW.name,
      this.pmConstant.SOW_QUERY.SOW_BY_ID);
    sowItemGet.url = sowEndPoint.replace(/{{Id}}/gi, '' + currSelectedSOW.ID);
    sowItemGet.type = 'GET';
    sowItemGet.listName = this.constant.listNames.SOW.name;
    batchURL.push(sowItemGet);

    const updateSowData = Object.assign({}, options);
    updateSowData.data = sowUpdateOptions;
    updateSowData.listName = this.constant.listNames.SOW.name;
    updateSowData.type = 'PATCH';
    updateSowData.url = this.spServices.getItemURL(this.constant.listNames.SOW.name, currSelectedSOW.ID);
    batchURL.push(updateSowData);
    this.commonService.SetNewrelic('projectManagment', 'projectManagement', 'getSows');
    const arrResults = await this.spServices.executeBatch(batchURL);
    if (arrResults && arrResults.length) {
      const sowItem = arrResults[0].retItems[0];
      this.pmService.setGlobalVariable(sowItem);
      this.pmObject.addSOW.ID = currSelectedSOW.ID;
      this.messageService.add({
        key: 'custom', severity: 'success', sticky: true,
        summary: 'Success Message', detail: 'SOW ' + currSelectedSOW.SOWCode + ' Closed Successfully.'
      });
      setTimeout(() => {
        this.addUpdateSOWsendEmail(this.pmObject.addSOW, this.constant.SOW_STATUS.CLOSED);
        if (this.router.url === '/projectMgmt/allSOW') {
          this.dataService.publish('reload-EditSOW');
        } else {
          this.router.navigate(['/projectMgmt/allSOW']);
        }
      }, this.pmConstant.TIME_OUT);
    }
  }
}
