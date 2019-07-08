import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectItemGroup } from 'primeng/components/common/selectitemgroup';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { SelectItem } from 'primeng/components/common/selectitem';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { DynamicDialogConfig, MessageService } from 'primeng/api';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
@Component({
  selector: 'app-project-attributes',
  templateUrl: './project-attributes.component.html',
  styleUrls: ['./project-attributes.component.css']
})
export class ProjectAttributesComponent implements OnInit {
  groupedCars: SelectItemGroup[];
  addProjectAttributesForm: FormGroup;
  @Output() billedType = new EventEmitter<string>();
  isProjectAttributeLoaderHidden = false;
  isProjectAttributeTableHidden = true;
  billedBy: SelectItem[];
  priority: SelectItem[];
  subDivisionArray: SelectItem[];
  cmLevel1: SelectItem[];
  cmLevel2: SelectItem[];
  deliveryLevel1: SelectItem[];
  deliveryLevel2: SelectItem[];
  isPubSupportDisabled = true;
  showEditSave: boolean;
  selectedFile;
  fileReader;
  projObj;
  sowObj;
  constructor(
    private frmbuilder: FormBuilder,
    public pmObject: PMObjectService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private pmConstant: PmconstantService,
    private config: DynamicDialogConfig,
    private pmCommonService: PMCommonService,
    private messageService: MessageService
  ) { }
  ngOnInit() {
    this.initForm();
    this.isProjectAttributeLoaderHidden = false;
    this.isProjectAttributeTableHidden = true;
    setTimeout(() => {
      if (this.config && this.config.hasOwnProperty('data')) {
        this.projObj = this.config.data.projectObj;
        this.sowObj = this.config.data.sowObj;
      }
      this.addProjectAttributesForm.get('clientLeagalEntity').disable();
      this.addProjectAttributesForm.get('billingEntity').disable();
      if (this.projObj) {
        this.editProject(this.projObj);
        this.showEditSave = true;
      } else {
        const sow = this.pmObject.allSOWItems.filter(objt => objt.SOWCode === this.pmObject.addProject.SOWSelect.SOWCode);
        if (sow && sow.length) {
          const sowObj = {
            ClientLegalEntity: sow[0].ClientLegalEntity,
            BillingEntity: sow[0].BillingEntity
          };
          this.setFieldProperties(this.pmObject.addProject.ProjectAttributes, sowObj, true);
          this.showEditSave = false;
        }
      }
    }, 500);
  }
  async setFieldProperties(projObj, sowObj, isCreate) {
    if (isCreate) {
      this.setDropDownValue(sowObj.ClientLegalEntity);
    } else {
      this.setDropDownValue(projObj.ClientLegalEntity);
    }
    if (isCreate && sowObj) {
      this.addProjectAttributesForm.get('clientLeagalEntity').setValue(sowObj.ClientLegalEntity);
      this.addProjectAttributesForm.get('billingEntity').setValue(sowObj.BillingEntity);
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
    if (projObj.PointOfContact2) {
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
    if (projObj.ActiveCM1) {
      this.addProjectAttributesForm.get('selectedActiveCM1').setValue(projObj.ActiveCM1);
    }
    if (projObj.ActiveCM2) {
      this.addProjectAttributesForm.get('selectedActiveCM2').setValue(projObj.ActiveCM2);
    }
    if (projObj.ActiveDelivery1) {
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
    // Setting the currency value.
    const currency = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter((obj) => {
      return obj.Title === projObj.ClientLegalEntity;
    });
    if (currency && currency.length) {
      this.pmObject.addProject.FinanceManagement.Currency = currency[0].Currency;
    }
    this.isProjectAttributeTableHidden = false;
    this.isProjectAttributeLoaderHidden = true;
  }
  async setDropDownValue(clientLeagalEntity) {
    this.subDivisionArray = [];
    this.billedBy = [
      { label: this.pmConstant.PROJECT_TYPE.DELIVERABLE, value: this.pmConstant.PROJECT_TYPE.DELIVERABLE },
      { label: this.pmConstant.PROJECT_TYPE.HOURLY, value: this.pmConstant.PROJECT_TYPE.HOURLY }
    ];
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
          label: element.FullName
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
    const result = await this.spServices.readItems(this.constant.listNames.ClientSubdivision.name, queryOptions);
    if (result && result.length) {
      result.forEach(element => {
        this.subDivisionArray.push({ label: element.Title, value: element.Title });
      });
    }
    // set the CM1, CM2, AD1, AD2 dropdown value.
    this.cmLevel1 = [];
    this.cmLevel2 = [];
    this.deliveryLevel1 = [];
    this.deliveryLevel2 = [];
    this.pmObject.oProjectCreation.Resources.cmLevel1.forEach(element => {
      this.cmLevel1.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.cmLevel2.forEach(element => {
      this.cmLevel2.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.deliveryLevel1.forEach(element => {
      this.deliveryLevel1.push({ label: element.Title, value: element.ID });
    });
    this.pmObject.oProjectCreation.Resources.deliveryLevel2.forEach(element => {
      this.deliveryLevel2.push({ label: element.Title, value: element.ID });
    });
  }
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
      indication: [''],
      molecule: ['', Validators.required],
      priority: ['', Validators.required],
      projectStatus: [''],
      pubSupport: [''],
      pubSupportStatus: [''],
      selectedActiveCM1: ['', Validators.required],
      selectedActiveCM2: ['', Validators.required],
      selectedActiveAD1: [''],
      selectedActiveAD2: ['', Validators.required],
      projectTitle: ['', Validators.required],
      shortTitle: ['', Validators.required],
      endUseDeliverable: [''],
      sowBoxLink: [''],
      conference: [''],
      authors: [''],
      comments: ['']
    });
  }

  goToTimeline(data) {
    if (this.addProjectAttributesForm.valid) {
      this.setFormFieldValue();
      this.pmObject.activeIndex = 2;
    } else {
      this.validateAllFormFields(this.addProjectAttributesForm);
    }
  }
  goToSow() {
    this.pmObject.activeIndex = 0;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
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
    this.pmObject.addProject.ProjectAttributes.ActiveCM1 = this.addProjectAttributesForm.get('selectedActiveCM1').value;
    this.pmObject.addProject.ProjectAttributes.ActiveCM2 = this.addProjectAttributesForm.get('selectedActiveCM2').value;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = this.addProjectAttributesForm.get('selectedActiveAD1').value;
    this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = this.addProjectAttributesForm.get('selectedActiveAD2').value;
  }
  onBilledByChanged() {
    if (this.addProjectAttributesForm.get('billedBy').value === this.pmConstant.PROJECT_TYPE.HOURLY) {
      if (this.addProjectAttributesForm.get('pubSupport').value) {
        this.addProjectAttributesForm.get('pubSupport').setValue(false);
      }
      this.isPubSupportDisabled = true;
    } else {
      this.isPubSupportDisabled = false;
    }
  }
  editProject(projObj) {
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
    this.pmObject.addProject.ProjectAttributes.PUBSupportRequired = projObj.IsPubSupport;
    this.pmObject.addProject.ProjectAttributes.PUBSupportStatus = projObj.PubSupportStatus;
    const poc2Array = [];
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
    this.pmObject.addProject.ProjectAttributes.ProjectTitle = projObj.Title;
    this.pmObject.addProject.ProjectAttributes.AlternateShortTitle = projObj.ShortTitle;
    this.pmObject.addProject.ProjectAttributes.EndUseofDeliverable = projObj.Description;
    this.pmObject.addProject.ProjectAttributes.SOWBoxLink = projObj.SOWBoxLink;
    this.pmObject.addProject.ProjectAttributes.ConferenceJournal = projObj.ConferenceJournal;
    this.pmObject.addProject.ProjectAttributes.Authors = projObj.Authors;
    this.pmObject.addProject.ProjectAttributes.Comments = projObj.Comments;
    this.setFieldProperties(this.pmObject.addProject.ProjectAttributes, null, false);
  }
  async saveEditProject() {
    this.setFormFieldValue();
    if (this.selectedFile) {
      await this.pmCommonService.submitFile(this.selectedFile, this.fileReader);
    }
    const projectInfo = this.pmCommonService.getProjectData(this.pmObject.addProject, false);
    await this.spServices.updateItem(this.constant.listNames.ProjectInformation.name, this.projObj.ID, projectInfo,
      this.constant.listNames.ProjectInformation.type);
    this.messageService.add({
      key: 'custom', severity: 'success', summary: 'Success Message',
      detail: 'Project Updated Successfully for the projectcode - ' + this.projObj.ProjectCode
    });
    this.isProjectAttributeTableHidden = true;
  }
  /**
   * This method is called when file is selected
   * @param event file
   */
  onFileChange(event) {
    this.selectedFile = null;
    this.fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileReader.readAsArrayBuffer(this.selectedFile);
    }
  }
}
