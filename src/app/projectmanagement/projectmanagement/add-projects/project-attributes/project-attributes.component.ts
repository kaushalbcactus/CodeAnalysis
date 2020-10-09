import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectItemGroup, DialogService } from 'primeng';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { SelectItem } from 'primeng';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { CommonService } from 'src/app/Services/common.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/Services/global.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-project-attributes',
  templateUrl: './project-attributes.component.html',
  styleUrls: ['./project-attributes.component.css']
})
export class ProjectAttributesComponent implements OnInit {
  groupedCars: SelectItemGroup[];
  addProjectAttributesForm: FormGroup;
  addMolecule: FormGroup;
  @Output() billedType = new EventEmitter<string>();
  isProjectAttributeLoaderHidden = false;
  isProjectAttributeTableHidden = true;
  billedBy: SelectItem[];
  priority: SelectItem[];
  subDivisionArray: SelectItem[];
  deliveryLevel1: SelectItem[];
  deliveryLevel2: SelectItem[];
  isPubSupportDisabled = true;
  showEditSave: boolean = false;
  selectedFile;
  fileReader;
  projObj;
  sowObj;
  showMoleculeAdd = false;
  formSubmit = false;
  enableCountFields = false;
  CountError = false;
  errorType = '';
  
  constructor(
    private frmbuilder: FormBuilder,
    public pmObject: PMObjectService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private pmConstant: PmconstantService,
    private config: DynamicDialogConfig,
    private pmCommonService: PMCommonService,
    private dynamicDialogRef: DynamicDialogRef,
    private router: Router,
    private dataService: DataService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private dialogService: DialogService,
    private globalObject: GlobalService
  ) { }
  async ngOnInit() {
    this.initForm();
    await this.pmCommonService.getAllRules('Project');
   
    await this.pmCommonService.setBilledBy();
    this.isProjectAttributeLoaderHidden = false;
    this.isProjectAttributeTableHidden = true;

    await this.pmCommonService.GetRuleParameters('Project');
    setTimeout(async () => {
      if (this.config && this.config.hasOwnProperty('data')) {
        this.projObj = this.config.data.projectObj;
        this.sowObj = this.config.data.sowObj;
      }
      this.addProjectAttributesForm.get('clientLeagalEntity').disable();
      this.addProjectAttributesForm.get('billingEntity').disable();
      this.addProjectAttributesForm.get('Currency').disable();
      if (this.projObj) {
        this.addProjectAttributesForm.get('billedBy').disable();
        this.editProject(this.projObj);
        this.showEditSave = true;

      } else {
        const sow = this.pmObject.allSOWItems.filter(objt => objt.SOWCode === this.pmObject.addProject.SOWSelect.SOWCode);
        if (sow && sow.length) {
          this.addProjectAttributesForm.get('billedBy').setValue(this.pmObject.addProject.FinanceManagement.BilledBy);
          this.addProjectAttributesForm.get('billedBy').disable();
          this.addProjectAttributesForm.get('selectedActiveCM1').disable();
          this.addProjectAttributesForm.get('selectedActiveCM2').disable();
          this.addProjectAttributesForm.get('selectedActiveAD1').disable();
          this.addProjectAttributesForm.get('selectedActiveAD2').disable();
          this.onBilledByChanged();
          const sowObj = {
            ClientLegalEntity: sow[0].ClientLegalEntity,
            BillingEntity: sow[0].BillingEntity,
            PrimaryPOC: sow[0].PrimaryPOC ? sow[0].PrimaryPOC : 0,
            // CMLevel1: sow[0].CMLevel1 && sow[0].CMLevel1.results && sow[0].CMLevel1.results.length ? [...sow[0].CMLevel1.results, sow[0].CMLevel2.ID] : [],
            // CMLevel2: sow[0].CMLevel2.ID,
            // DeliveryLevel1: sow[0].DeliveryLevel1 && sow[0].DeliveryLevel1.results &&
            //   sow[0].DeliveryLevel1.results.length ? [...sow[0].DeliveryLevel1.results, sow[0].DeliveryLevel2.ID] : [],
            // DeliveryLevel2: sow[0].DeliveryLevel2.ID,
            AdditionalPOC: sow[0].AdditionalPOC ? sow[0].AdditionalPOC.split(';#').map(x => parseInt(x, 10)) : []
          };
          await this.setFieldProperties(this.pmObject.addProject.ProjectAttributes, sowObj, true);
          this.showEditSave = false;

          this.constant.RuleParamterArray.forEach(element => {

            if(Object.keys(this.pmObject.addProject.FinanceManagement).includes(element.parameterName) && element.listName==='Current'){
              element.value = this.pmObject.addProject.FinanceManagement[element.parameterName];
            } else {
              element.value =  this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(c=>c.Title === this.pmObject.addProject.FinanceManagement[element.parameterName]) ? this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(c=>c.Title === this.pmObject.addProject.FinanceManagement[element.parameterName]).Bucket :'';
            } 
           });         
        }
      }
    }, this.pmConstant.TIME_OUT);

    this.addProjectAttributesForm.get('practiceArea').valueChanges.subscribe(val => {
      this.constant.RuleParamterArray.find(c=>c.parameterName === 'BusinessVertical').value = val;
      this.GetRulesOnChange();
    });
    this.addProjectAttributesForm.get('subDivision').valueChanges.subscribe(val => {
      this.constant.RuleParamterArray.find(c=>c.parameterName === 'SubDivision').value = val;
        this.GetRulesOnChange();
    });
  }
  /**
   * This method is to set the field properties for all project object.s
   * @param projObj Pass projectObj as parameter.
   * @param sowObj Pass sowObj as parameter.
   * @param isCreate pass isCreate as parameter.
   */
  async setFieldProperties(projObj, sowObj, isCreate) {
    if (isCreate) {
      await this.setDropDownValue(sowObj.ClientLegalEntity);
    } else {
      await this.setDropDownValue(projObj.ClientLegalEntity);
    }
    if (isCreate && sowObj) {
      this.addProjectAttributesForm.get('clientLeagalEntity').setValue(sowObj.ClientLegalEntity);
      this.addProjectAttributesForm.get('billingEntity').setValue(sowObj.BillingEntity);
      this.addProjectAttributesForm.get('poc').setValue(sowObj.PrimaryPOC);
      this.addProjectAttributesForm.get('poc2').setValue(sowObj.AdditionalPOC);
      // const cm1IdArray = this.pmCommonService.getIds(sowObj.CMLevel1);
      // const cm1found = this.cmLevel1.some(r => cm1IdArray.indexOf(r.value) >= 0);
      // if (cm1found) {
      //   this.addProjectAttributesForm.get('selectedActiveCM1').setValue(cm1IdArray);
      // }
      // this.addProjectAttributesForm.get('selectedActiveCM2').setValue(sowObj.CMLevel2);
      // const deliveryIdArray = this.pmCommonService.getIds(sowObj.DeliveryLevel1);
      // const devlivery1found = this.deliveryLevel1.some(r => deliveryIdArray.indexOf(r.value) >= 0);
      // if (devlivery1found) {
      //   this.addProjectAttributesForm.get('selectedActiveAD1').setValue(deliveryIdArray);
      // }
      // this.addProjectAttributesForm.get('selectedActiveAD2').setValue(sowObj.DeliveryLevel2);
      projObj.ClientLegalEntity = this.addProjectAttributesForm.get('clientLeagalEntity').value;
    } else {
      this.addProjectAttributesForm.get('clientLeagalEntity').setValue(projObj.ClientLegalEntity);
      this.addProjectAttributesForm.get('billingEntity').setValue(projObj.BillingEntity);
    }
    if (projObj.SubDivision) {
      this.addProjectAttributesForm.get('subDivision').setValue(projObj.SubDivision);
    }
    if (projObj.BilledBy) {
      this.addProjectAttributesForm.get('billedBy').setValue(projObj.BilledBy);
    }
    if (projObj.PracticeArea) {
      this.addProjectAttributesForm.get('practiceArea').setValue(projObj.PracticeArea);

      if (projObj.PracticeArea.toLowerCase() === 'medinfo' || projObj.PracticeArea.toLowerCase() === 'medcom' || projObj.PracticeArea.toLowerCase() === 'medcomm') {
        this.enableCountFields = true;
      }
      else {
        this.enableCountFields = false;
      }
    }
    if (projObj.Priority) {
      this.addProjectAttributesForm.get('priority').setValue(projObj.Priority);
    }
    if (projObj.ProjectCode) {
      this.addProjectAttributesForm.get('projectCode').setValue(projObj.ProjectCode);
    }
    this.addProjectAttributesForm.get('projectStatus').setValue(this.constant.projectStatus.InDiscussion);
    if (projObj.PointOfContact1) {
      this.addProjectAttributesForm.get('poc').setValue(projObj.PointOfContact1);
    }
    if (projObj.PointOfContact2.length) {
      this.addProjectAttributesForm.get('poc2').setValue(projObj.PointOfContact2);
    }
    if (projObj.Molecule) {
      this.addProjectAttributesForm.get('molecule').setValue(projObj.Molecule);
    }
    if (projObj.TherapeuticArea) {
      this.addProjectAttributesForm.get('therapeuticArea').setValue(projObj.TherapeuticArea);
    }
    if (projObj.Indication) {
      this.addProjectAttributesForm.get('indication').setValue(projObj.Indication);
    }
    if (projObj.PUBSupportRequired) {
      this.addProjectAttributesForm.get('pubSupport').setValue(projObj.PUBSupportRequired);
    }
    if (projObj.PUBSupportStatus) {
      this.addProjectAttributesForm.get('pubSupportStatus').setValue(projObj.PUBSupportStatus);
    }
    if (projObj.ActiveCM1.length) {
      this.addProjectAttributesForm.get('selectedActiveCM1').setValue(projObj.ActiveCM1);
    }
    if (projObj.ActiveCM2) {
      this.addProjectAttributesForm.get('selectedActiveCM2').setValue(projObj.ActiveCM2);
    }
    if (projObj.ActiveDelivery1.length) {
      this.addProjectAttributesForm.get('selectedActiveAD1').setValue(projObj.ActiveDelivery1);
    }
    if (projObj.ActiveDelivery2) {
      this.addProjectAttributesForm.get('selectedActiveAD2').setValue(projObj.ActiveDelivery2);
    }
    if (projObj.ProjectTitle) {
      this.addProjectAttributesForm.get('projectTitle').setValue(projObj.ProjectTitle);
    }
    if (projObj.AlternateShortTitle) {
      this.addProjectAttributesForm.get('shortTitle').setValue(projObj.AlternateShortTitle);
    }
    if (projObj.EndUseofDeliverable) {
      this.addProjectAttributesForm.get('endUseDeliverable').setValue(projObj.EndUseofDeliverable);
    }
    if (projObj.SOWBoxLink) {
      this.addProjectAttributesForm.get('sowBoxLink').setValue(projObj.SOWBoxLink);
    }
    if (projObj.ConferenceJournal) {
      this.addProjectAttributesForm.get('conference').setValue(projObj.ConferenceJournal);
    }
    if (projObj.Authors) {
      this.addProjectAttributesForm.get('authors').setValue(projObj.Authors);
    }
    if (projObj.Comments) {
      this.addProjectAttributesForm.get('comments').setValue(projObj.Comments);
    }
    if (projObj.PageCount) {
      this.addProjectAttributesForm.get('PageCount').setValue(projObj.PageCount);
    }
    if (projObj.ReferenceCount) {
      this.addProjectAttributesForm.get('ReferenceCount').setValue(projObj.ReferenceCount);
    }
    if (projObj.SlideCount) {
      this.addProjectAttributesForm.get('SlideCount').setValue(projObj.SlideCount);
    }
    if (projObj.AnnotationBinder) {
      this.addProjectAttributesForm.get('AnnotationBinder').setValue(projObj.AnnotationBinder);
    }

    this.isProjectAttributeTableHidden = false;
    this.isProjectAttributeLoaderHidden = true;
  }
  /**
   * This method is used to set dropdown values.
   * @param clientLeagalEntity Pass the clientlegalEntity as parameter.
   */
  async setDropDownValue(clientLeagalEntity) {
    this.subDivisionArray = [];
    this.priority = [
      { label: 'Pilot', value: 'Pilot' },
      { label: 'Pilot-low complexity', value: 'Pilot-low complexity' },
      { label: 'High-complexity', value: 'High-complexity' },
      { label: 'Normal', value: 'Normal' },
      { label: 'Critical', value: 'Critical' }
    ];
    // set POC
    this.pmObject.oProjectCreation.oProjectInfo.projectContact = [];
    this.pmObject.projectContactsItems.forEach(element => {
      if (element.ClientLegalEntity === clientLeagalEntity) {
        this.pmObject.oProjectCreation.oProjectInfo.projectContact.push({
          label: element.FullNameCC
          , value: element.ID
        });
      }
    });
    const queryOptions = {
      select: 'Title',
      filter: 'ClientLegalEntity eq \'' + clientLeagalEntity + '\'',
      top: 4900
    };
    // tslint:disable-next-line:max-line-length
    this.commonService.SetNewrelic('projectManagment', 'addproj-projectAttributes', 'GetClientSubdivision');
    const result = await this.spServices.readItems(this.constant.listNames.ClientSubdivision.name, queryOptions);
    if (result && result.length) {
      result.forEach(element => {
        this.subDivisionArray.push({ label: element.Title, value: element.Title });
      });
    }
    // set the CM1, CM2, AD1, AD2 dropdown value.
    this.pmObject.OwnerAccess.cmLevel1 = [];
    this.pmObject.OwnerAccess.cmLevel2 = [];
    this.pmObject.OwnerAccess.deliveryLevel1 = [];
    this.pmObject.OwnerAccess.deliveryLevel2 = [];
    this.pmObject.oProjectCreation.Resources.cmLevel1.forEach(element => {
      this.pmObject.OwnerAccess.cmLevel1.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.cmLevel2.forEach(element => {
      this.pmObject.OwnerAccess.cmLevel1.push({ label: element.Title, value: element.ID });
      this.pmObject.OwnerAccess.cmLevel2.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.deliveryLevel1.forEach(element => {
      this.pmObject.OwnerAccess.deliveryLevel1.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.deliveryLevel2.forEach(element => {
      this.pmObject.OwnerAccess.deliveryLevel1.push({ label: element.Title, value: element.ID });
      this.pmObject.OwnerAccess.deliveryLevel2.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.OwnerAccess.cmLevel1.sort((a, b) => (a.label > b.label) ? 1 : -1);
    this.pmObject.OwnerAccess.deliveryLevel1.sort((a, b) => (a.label > b.label) ? 1 : -1);
  }
  /**
   * This method is used to initiliaze the project attributes forms.
   */
  initForm() {
    this.addProjectAttributesForm = this.frmbuilder.group({
      clientLeagalEntity: [''],
      subDivision: [''],
      billingEntity: [''],
      billedBy: ['', Validators.required],
      practiceArea: ['', Validators.required],
      projectCode: [''],
      poc: ['', Validators.required],
      poc2: [null],
      therapeuticArea: ['', Validators.required],
      indication: ['', Validators.maxLength(100)],
      molecule: ['', Validators.required],
      priority: ['', Validators.required],
      projectStatus: [''],
      pubSupport: [''],
      pubSupportStatus: [''],
      selectedActiveCM1: ['', Validators.required],
      selectedActiveCM2: ['', Validators.required],
      selectedActiveAD1: [''],
      selectedActiveAD2: ['', Validators.required],
      projectTitle: ['', [Validators.required, Validators.maxLength(255)]],
      shortTitle: ['', [Validators.required, Validators.maxLength(20)]],
      endUseDeliverable: [''],
      sowBoxLink: ['', Validators.maxLength(255)],
      conference: [''],
      authors: [''],
      comments: [''],
      SlideCount: [0],
      ReferenceCount: [0],
      PageCount: [0],
      AnnotationBinder: [''],
      Currency:[this.pmObject.addProject.FinanceManagement.Currency],

    });

    this.addMolecule = this.frmbuilder.group({
      addMoleculeItem: ['', Validators.required]
    });
  }
  /**
   * This method is used to goto timeline page.
   */
  goToTimeline(data) {
    if (this.enableCountFields) {
      if (this.addProjectAttributesForm.value.ReferenceCount === null || this.addProjectAttributesForm.value.ReferenceCount < 0) {
        this.CountError = true;
        this.errorType = 'Reference';
      }
      else if (this.addProjectAttributesForm.value.SlideCount === null || this.addProjectAttributesForm.value.SlideCount < 0) {
        this.CountError = true;
        this.errorType = 'Slide';
      }
      else if (this.addProjectAttributesForm.value.PageCount === null || this.addProjectAttributesForm.value.PageCount < 0) {
        this.CountError = true;
        this.errorType = 'Page';
      }
      else {
        this.CountError = false;
        this.errorType = '';
        if (this.addProjectAttributesForm.valid) {
          this.setFormFieldValue();
          this.pmObject.activeIndex = 3;
        } else {
          this.validateAllFormFields(this.addProjectAttributesForm);
        }
      }
    }
    else {
      if (this.addProjectAttributesForm.valid) {
        this.setFormFieldValue();
        this.pmObject.activeIndex = 3;
      } else {
        this.validateAllFormFields(this.addProjectAttributesForm);
      }
    }


  }
  /**
   * This method is used to navigate to SOW page.
   */
  goToSow() {
    this.pmObject.activeIndex = 1;
  }


  /**
   * This method is used to Enable disable fields.
   */
  EnableDisableCountFields() {
    this.CountError = false;
    const practiceValue = this.addProjectAttributesForm.get('practiceArea').value.toLowerCase();
    if (practiceValue === 'medinfo' || practiceValue === 'medcomm' || practiceValue === 'medcom') {
      this.enableCountFields = true;

    }
    else {
      this.enableCountFields = false;
    }
  }

  /**
   * This method is used to validate project attributes field.
   * @param formGroup Pass the formGroup as parameter.
   */
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
  /**
   * This method is used to the form field value.
   */
  setFormFieldValue() {
    this.pmObject.addProject.ProjectAttributes.ClientLegalEntity = this.addProjectAttributesForm.get('clientLeagalEntity').value;
    this.pmObject.addProject.ProjectAttributes.SubDivision = this.addProjectAttributesForm.get('subDivision').value;
    this.pmObject.addProject.ProjectAttributes.BillingEntity = this.addProjectAttributesForm.get('billingEntity').value;
    this.pmObject.addProject.ProjectAttributes.BilledBy = this.addProjectAttributesForm.get('billedBy').value;
    this.pmObject.addProject.ProjectAttributes.PracticeArea = this.addProjectAttributesForm.get('practiceArea').value;
    this.pmObject.addProject.ProjectAttributes.Priority = this.addProjectAttributesForm.get('priority').value;
    this.pmObject.addProject.ProjectAttributes.ProjectCode = this.addProjectAttributesForm.get('projectCode').value;
    this.pmObject.addProject.ProjectAttributes.ProjectStatus = this.addProjectAttributesForm.get('projectStatus').value;
    this.pmObject.addProject.ProjectAttributes.PointOfContact1 = this.addProjectAttributesForm.get('poc').value;
    this.pmObject.addProject.ProjectAttributes.PointOfContact2 = this.addProjectAttributesForm.get('poc2').value;
    this.pmObject.addProject.ProjectAttributes.Molecule = this.addProjectAttributesForm.get('molecule').value;
    this.pmObject.addProject.ProjectAttributes.TherapeuticArea = this.addProjectAttributesForm.get('therapeuticArea').value;
    this.pmObject.addProject.ProjectAttributes.Indication = this.addProjectAttributesForm.get('indication').value;
    this.pmObject.addProject.ProjectAttributes.PUBSupportRequired = this.addProjectAttributesForm.get('pubSupport').value;
    this.pmObject.addProject.ProjectAttributes.PUBSupportStatus = this.addProjectAttributesForm.get('pubSupportStatus').value;
    this.pmObject.addProject.ProjectAttributes.ActiveCM1 = this.addProjectAttributesForm.get('selectedActiveCM1').value;
    this.pmObject.addProject.ProjectAttributes.ActiveCM2 = this.addProjectAttributesForm.get('selectedActiveCM2').value;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = this.addProjectAttributesForm.get('selectedActiveAD1').value;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = this.addProjectAttributesForm.get('selectedActiveAD2').value;
    this.pmObject.addProject.ProjectAttributes.ProjectTitle = this.addProjectAttributesForm.get('projectTitle').value;
    this.pmObject.addProject.ProjectAttributes.AlternateShortTitle = this.addProjectAttributesForm.get('shortTitle').value;
    this.pmObject.addProject.ProjectAttributes.EndUseofDeliverable = this.addProjectAttributesForm.get('endUseDeliverable').value;
    this.pmObject.addProject.ProjectAttributes.SOWBoxLink = this.addProjectAttributesForm.get('sowBoxLink').value;
    this.pmObject.addProject.ProjectAttributes.ConferenceJournal = this.addProjectAttributesForm.get('conference').value;
    this.pmObject.addProject.ProjectAttributes.Authors = this.addProjectAttributesForm.get('authors').value;
    this.pmObject.addProject.ProjectAttributes.Comments = this.addProjectAttributesForm.get('comments').value;

    if (this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase() === 'medcomm' ||
      this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase() === 'medcom' ||
      this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase() === 'medinfo') {

      this.enableCountFields = true;
      this.pmObject.addProject.ProjectAttributes.AnnotationBinder = this.addProjectAttributesForm.get('AnnotationBinder').value === null ?
        false : this.addProjectAttributesForm.get('AnnotationBinder').value;
      this.pmObject.addProject.ProjectAttributes.SlideCount = this.addProjectAttributesForm.get('SlideCount').value ?
        this.addProjectAttributesForm.get('SlideCount').value : 0;
      this.pmObject.addProject.ProjectAttributes.PageCount = this.addProjectAttributesForm.get('PageCount').value ?
        this.addProjectAttributesForm.get('PageCount').value : 0;
      this.pmObject.addProject.ProjectAttributes.ReferenceCount = this.addProjectAttributesForm.get('ReferenceCount').value ?
        this.addProjectAttributesForm.get('ReferenceCount').value : 0;
    } else {
      this.pmObject.addProject.ProjectAttributes.AnnotationBinder = false;
      this.pmObject.addProject.ProjectAttributes.SlideCount = 0;
      this.pmObject.addProject.ProjectAttributes.PageCount = 0;
      this.pmObject.addProject.ProjectAttributes.ReferenceCount = 0;
    }

  }
  /**
   * This method get called when user changed the billed by dropdonw value.
   */
  onBilledByChanged() {
    if (this.addProjectAttributesForm.get('billedBy').value === this.pmConstant.PROJECT_TYPE.HOURLY.value) {
      if (this.addProjectAttributesForm.get('pubSupport').value) {
        this.addProjectAttributesForm.get('pubSupport').setValue(false);
      }
      this.isPubSupportDisabled = true;
    } else {
      this.isPubSupportDisabled = false;
    }
  }
  /**
   * This method is used to the edit the project.
   * @param projObj Pass the projObj as parameter.
   */
  editProject(projObj) {

    if (projObj.ActualStartDate) {
      const actualStartDate = new Date(projObj.ActualStartDate);
      const allowedDate = this.commonService.CalculateminstartDateValue(new Date(), 3);
      if (actualStartDate.getFullYear() >= allowedDate.getFullYear() &&
        actualStartDate.getMonth() >= allowedDate.getMonth()) {
        this.addProjectAttributesForm.get('practiceArea').enable();
      } else {
        this.addProjectAttributesForm.get('practiceArea').disable();
      }
    }

    this.constant.RuleParamterArray.forEach(element => {
      if(Object.keys(projObj).includes(element.parameterName) && element.listName==='Current' ){
        element.value = projObj[element.parameterName];
      } else {
        element.value =  this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(c=>c.Title === projObj[element.listName]) ? this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.find(c=>c.Title === projObj[element.listName]).Bucket :'';
      }   
    });

    if(this.pmObject.RuleArray && this.pmObject.RuleArray.length > 0){

      if(projObj.CSRule){
        this.pmObject.RuleTypeArray.CM = this.pmObject.RuleArray.filter(c=> projObj.CSRule.split(';#').map(d=> +d).includes(c.ID)) ? this.pmObject.RuleArray.filter(c=> projObj.CSRule.split(';#').map(d=> +d).includes(c.ID)) : [];
      }

      if(projObj.DeliveryRule){
        this.pmObject.RuleTypeArray.Delivery = this.pmObject.RuleArray.filter(c=> projObj.DeliveryRule.split(';#').map(d=> +d).includes(c.ID)) ?  this.pmObject.RuleArray.filter(c=> projObj.DeliveryRule.split(';#').map(d=> +d).includes(c.ID)):[];
      }
      this.pmObject.TempRuleArray = [...this.pmObject.RuleTypeArray.Delivery,...this.pmObject.RuleTypeArray.CM]; 
    }

    this.pmObject.addProject.ProjectAttributes.ClientLegalEntity = projObj.ClientLegalEntity;
    this.pmObject.addProject.ProjectAttributes.SubDivision = projObj.SubDivision;
    this.pmObject.addProject.ProjectAttributes.BillingEntity = projObj.BillingEntity;
    this.pmObject.addProject.ProjectAttributes.BilledBy = projObj.ProjectType;
    this.pmObject.addProject.ProjectAttributes.PracticeArea = projObj.BusinessVertical;
    this.pmObject.addProject.ProjectAttributes.Priority = projObj.Priority;
    this.pmObject.addProject.ProjectAttributes.ProjectCode = projObj.ProjectCode;
    this.pmObject.addProject.ProjectAttributes.ProjectStatus = projObj.Status;
    this.pmObject.addProject.ProjectAttributes.PointOfContact1 = projObj.PrimaryPOC;

    this.pmObject.addProject.ProjectAttributes.Molecule = projObj.Molecule;
    this.pmObject.addProject.ProjectAttributes.TherapeuticArea = projObj.TA;
    this.pmObject.addProject.ProjectAttributes.Indication = projObj.Indication;
    this.pmObject.addProject.ProjectAttributes.PUBSupportRequired = projObj.IsPubSupport === 'Yes' ? true : false;
    this.pmObject.addProject.ProjectAttributes.PUBSupportStatus = projObj.PubSupportStatus;
    const poc2Array = [];
    if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.DELIVERABLE.value ||
      this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
      this.isPubSupportDisabled = false;
    } else {
      this.isPubSupportDisabled = true;
    }
    if (projObj.AdditionalPOC && projObj.AdditionalPOC.length) {
      projObj.AdditionalPOC.forEach(element => {
        poc2Array.push(+element);
      });
    }
    this.pmObject.addProject.ProjectAttributes.PointOfContact2 = poc2Array;
    const cm1IdArray = [];
    if (projObj.CMLevel1ID && projObj.CMLevel1ID.length) {
      projObj.CMLevel1ID.forEach(element => {
        cm1IdArray.push(element.ID);
      });
    }
    const deliveryIdArray = [];
    if (projObj.DeliveryLevel1ID && projObj.DeliveryLevel1ID.length) {
      projObj.DeliveryLevel1ID.forEach(element => {
        deliveryIdArray.push(element.ID);
      });
    }
    this.pmObject.addProject.ProjectAttributes.ActiveCM1 = cm1IdArray && cm1IdArray.length ? cm1IdArray : [];
    this.pmObject.addProject.ProjectAttributes.ActiveCM2 = projObj.CMLevel2ID;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = deliveryIdArray && deliveryIdArray.length ?
      deliveryIdArray : [];
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = projObj.DeliveryLevel2ID;

    this.pmObject.OwnerAccess.selectedCMAccess = this.pmObject.addProject.ProjectAttributes.ActiveCM1; 

    this.pmObject.OwnerAccess.selectedDeliveryAccess = this.pmObject.addProject.ProjectAttributes.ActiveDelivery1; 


    this.pmObject.addProject.ProjectAttributes.ProjectTitle = projObj.Title;
    this.pmObject.addProject.ProjectAttributes.AlternateShortTitle = projObj.ShortTitle;
    this.pmObject.addProject.ProjectAttributes.EndUseofDeliverable = projObj.DescriptionMT;
    this.pmObject.addProject.ProjectAttributes.SOWBoxLink = projObj.SOWBoxLink;
    this.pmObject.addProject.ProjectAttributes.ConferenceJournal = projObj.ConferenceJournal;
    this.pmObject.addProject.ProjectAttributes.Authors = projObj.Authors;
    this.pmObject.addProject.ProjectAttributes.Comments = projObj.Comments;
    this.pmObject.addProject.ProjectAttributes.SlideCount = projObj.SlideCount;
    // tslint:disable-next-line: max-line-length
    this.pmObject.addProject.ProjectAttributes.ReferenceCount = projObj.ReferenceCount; 
    this.pmObject.addProject.ProjectAttributes.PageCount = projObj.PageCount;
     this.pmObject.addProject.ProjectAttributes.AnnotationBinder = projObj.AnnotationBinder ? projObj.AnnotationBinder === 'Yes' ? true : false : false;

    this.enableCountFields = this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase()
      === 'medcomm' || this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase()
      === 'medcom' || this.pmObject.addProject.ProjectAttributes.PracticeArea.toLowerCase() === 'medinfo' ? true : false;
    this.setFieldProperties(this.pmObject.addProject.ProjectAttributes, null, false);
  }
  /**
   * This method is used to update the project.
   */
  async saveEditProject() {

    if (this.selectedFile && this.selectedFile.size === 0) {

      this.commonService.showToastrMessage(this.constant.MessageType.error,this.constant.Messages.ZeroKbFile.replace('{{fileName}}', this.selectedFile.name),true);
    }
    else {
      if (this.enableCountFields) {
        if (this.addProjectAttributesForm.value.ReferenceCount === null || this.addProjectAttributesForm.value.ReferenceCount < 0) {
          this.CountError = true;
          this.errorType = 'Reference';
        }
        else if (this.addProjectAttributesForm.value.SlideCount === null || this.addProjectAttributesForm.value.SlideCount < 0) {
          this.CountError = true;
          this.errorType = 'Slide';
        }
        else if (this.addProjectAttributesForm.value.PageCount === null || this.addProjectAttributesForm.value.PageCount < 0) {
          this.CountError = true;
          this.errorType = 'Page';
        }
        else {
          await this.SaveProject();
        }
      }
      else {
        await this.SaveProject();
      }

    }

  }


  //*************************************************************************************************
  // new File uplad function updated by Maxwell
  // ************************************************************************************************


  /**
* This method is called when file is selected
* @param event file
*/
  onFileChange(event) {
    this.selectedFile = null;
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }


  async SaveProject() {
    if (this.addProjectAttributesForm.valid) {
      this.pmObject.isMainLoaderHidden = false;
      this.setFormFieldValue();
      if (this.selectedFile) {
        let SelectedFile = [];

        const FolderName = await this.pmCommonService.getFolderName();
        SelectedFile.push(new Object({ name: this.selectedFile.name, file: this.selectedFile }));
        this.commonService.SetNewrelic('projectManagment', 'addproj-projectAttributes', 'UpdateProjectInformationfileupload');
        this.pmObject.isMainLoaderHidden = true;

        this.commonService.UploadFilesProgress(SelectedFile, FolderName, true).then(uploadedfile => {
          if (SelectedFile.length > 0 && SelectedFile.length === uploadedfile.length) {
            this.pmObject.isMainLoaderHidden = false;
            if (uploadedfile[0].ServerRelativeUrl && uploadedfile[0].hasOwnProperty('Name') && !uploadedfile[0].hasOwnProperty('odata.error')) {
              this.pmObject.addProject.FinanceManagement.SOWFileURL = uploadedfile[0].ServerRelativeUrl;
              this.pmObject.addProject.FinanceManagement.SOWFileName = uploadedfile[0].Name;
              this.pmObject.addProject.FinanceManagement.SOWFileProp = uploadedfile[0];
            }
          }
          this.continueSaveProject();
        })
      }
      else {
        this.continueSaveProject();
      }

    } else {
      this.validateAllFormFields(this.addProjectAttributesForm);
    }
  }

  async  continueSaveProject() {
    const projectInfo = this.pmCommonService.getProjectData(this.pmObject.addProject, false);
    this.commonService.SetNewrelic('projectManagment', 'addproj-projectAttributes', 'UpdateProjectInformation');
    await this.spServices.updateItem(this.constant.listNames.ProjectInformation.name, this.projObj.ID, projectInfo,
      this.constant.listNames.ProjectInformation.type);
    await this.updateFinanceData();
    this.pmObject.isMainLoaderHidden = true;

    this.commonService.showToastrMessage(this.constant.MessageType.success,'Project Updated Successfully for the projectcode - ' + this.projObj.ProjectCode,false);
    setTimeout(() => {
      this.dynamicDialogRef.close();
      if (this.router.url === '/projectMgmt/allProjects') {
        this.dataService.publish('reload-project');
      } else {
        this.router.navigate(['/projectMgmt/allProjects']);
      }
    }, this.pmConstant.TIME_OUT);
  }

  async getFinanceData(projectObj) {
    let batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const invoiceLineItemsGet = Object.assign({}, options);
    const invoiceLineItemsFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
    invoiceLineItemsFilter.filter = invoiceLineItemsFilter.filter.replace(/{{projectCode}}/gi,
      projectObj.ProjectCode);
    invoiceLineItemsGet.url = this.spServices.getReadURL(this.constant.listNames.InvoiceLineItems.name,
      invoiceLineItemsFilter);
    invoiceLineItemsGet.type = 'GET';
    invoiceLineItemsGet.listName = this.constant.listNames.InvoiceLineItems.name;
    batchURL.push(invoiceLineItemsGet);

    const spendingInfoGet = Object.assign({}, options);
    const spendingInfoFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.SPENDING_INFOByActive);
    spendingInfoFilter.filter = spendingInfoFilter.filter.replace(/{{Title}}/gi,
      projectObj.ProjectCode);
    spendingInfoGet.url = this.spServices.getReadURL(this.constant.listNames.SpendingInfo.name,
      spendingInfoFilter);
    spendingInfoGet.type = 'GET';
    spendingInfoGet.listName = this.constant.listNames.SpendingInfo.name;
    batchURL.push(spendingInfoGet);

    const result = await this.spServices.executeBatch(batchURL);
    return result;
  }

  async updateFinanceData() {
    const batchUrl = [];
    let financeData = await this.getFinanceData(this.pmObject.addProject.ProjectAttributes);
    console.log(financeData);
    let invData = financeData[0].retItems;
    let spendInfoData = financeData[1].retItems;
    const CSIdArray = [];
    this.pmObject.addProject.ProjectAttributes.ActiveCM1.forEach(cm => {
      CSIdArray.push(cm);
    });
    CSIdArray.push(this.pmObject.addProject.ProjectAttributes.ActiveCM2);
    if(invData.length) {
      for(let i=0;i<invData.length;i++) { 
        let element = invData[i];
        let invLineItem = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          AccessId: {
            results: CSIdArray
          },
        }
        await this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constant.listNames.InvoiceLineItems.name, element.Id), invLineItem, this.constant.Method.PATCH, this.constant.listNames.InvoiceLineItems.name);
      }
    } 
    if(spendInfoData.length) {
      for(let i=0;i<spendInfoData.length;i++) { 
          let element = spendInfoData[i];
        let spendInfo = {
          __metadata: { type: this.constant.listNames.SpendingInfo.type },
          AccessId: {
            results: CSIdArray
          },
        }
        await this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constant.listNames.SpendingInfo.name, element.Id), spendInfo, this.constant.Method.PATCH, this.constant.listNames.SpendingInfo.name);
      }
    }
    console.log(batchUrl);
    await this.spServices.executeBatch(batchUrl);
  }

  /**
   * This method is used open the molecule.
   */
  openMoleculeAdd() {
    this.formSubmit = false;
    this.showMoleculeAdd = true;
  }
  /**
   * This method is used to reset molecule.
   */
  resetMoleculeAdd() {
    this.showMoleculeAdd = false;
    this.addMolecule.get('addMoleculeItem').setValue('');
  }
  /**
   * This method is ued to add molecule to list.
   */
  async addMoleculeToList() {
    this.formSubmit = true;
    if (this.addMolecule.valid) {
      let val = this.addMolecule.get('addMoleculeItem').value;
      val = val.trim();
      const molecule = this.pmObject.oProjectCreation.oProjectInfo.molecule.find(e => e.label === val);
      if (molecule) {

        this.commonService.showToastrMessage(this.constant.MessageType.error,'Molecule already exists.',false);
        return;
      }
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };

      const data: any = {
        __metadata: { type: this.constant.listNames.Molecules.type },
        Title: val
      };
      const moleculeItemCreate = Object.assign({}, options);
      moleculeItemCreate.url = this.spServices.getReadURL(this.constant.listNames.Molecules.name);
      moleculeItemCreate.data = data;
      moleculeItemCreate.type = 'POST';
      moleculeItemCreate.listName = this.constant.listNames.Molecules.name;
      batchURL.push(moleculeItemCreate);
      this.commonService.SetNewrelic('projectManagment', 'addproj-projectAttributes', 'GetMolecules');
      await this.spServices.executeBatch(batchURL);


      this.commonService.showToastrMessage(this.constant.MessageType.success,'Molecule added successfully',true);

      this.showMoleculeAdd = false;
      this.addMolecule.get('addMoleculeItem').setValue('');
      this.pmObject.oProjectCreation.oProjectInfo.molecule.push({ label: val, value: val });
    } else {
      this.validateAllFormFields(this.addMolecule);
    }
  }


  cancel() {
    this.dynamicDialogRef.close();
  }




  async GetRulesOnChange(){
    if(this.showEditSave){
      await this.pmCommonService.FilterRules();
      this.addProjectAttributesForm.get('selectedActiveCM1').setValue(this.pmObject.OwnerAccess.selectedCMAccess);
      this.addProjectAttributesForm.get('selectedActiveAD1').setValue(this.pmObject.OwnerAccess.selectedDeliveryAccess);
      this.addProjectAttributesForm.get('selectedActiveCM2').setValue(this.pmObject.OwnerAccess.selectedCMOwner);
      this.addProjectAttributesForm.get('selectedActiveAD2').setValue(this.pmObject.OwnerAccess.selectedDeliveryOwner);
    }
  }


  

  
}
