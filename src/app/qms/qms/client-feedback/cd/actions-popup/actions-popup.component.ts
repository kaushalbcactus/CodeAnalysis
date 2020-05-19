import { GlobalService } from './../../../../../Services/global.service';
import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, ApplicationRef, NgZone } from '@angular/core';
import { ConstantsService } from '../../../../../Services/constants.service';
import { SPOperationService } from '../../../../../Services/spoperation.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { QMSConstantsService } from '../../../services/qmsconstants.service';
import { MessageService } from 'primeng/api';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-actions-popup',
  templateUrl: './actions-popup.component.html',
  styleUrls: ['./actions-popup.component.css']
})
export class ActionsPopupComponent implements OnInit {
  // Html for popup
  @ViewChild('popupContent', { static: true }) popupContent: ElementRef;

  // This property emits data to parent (CD) component to reflect changes done in popup
  @Output() bindTableEvent = new EventEmitter<{}>();
  @Output() setSuccessMessage = new EventEmitter<{}>();
  display = false;
  // public successMessage: string;
  private success = new Subject<string>();
  public loading = false;
  public hidePopupLoader = true;
  public hidePopupTable = false;
  public qc = {
    qcID: '',
    projectCode: '',
    actionClicked: '',
    actionClickedTitle: '',
    otherResources: [],
    status: '',
    accountableGroup: [{ label: 'SS', value: 'SS' }, { label: 'CS / PM / RM / Others', value: 'CS / PM / RM / Others' }],
    // resources: [],
    businessImpact: [{ label: 'High', value: 'High' }, { label: 'Low', value: 'Low' }],
    cdCategories: [{ label: 'ATD issues', value: 'ATD issues' }, { label: 'Content issues', value: 'Content issues' },
    { label: 'Missed deadlines', value: 'Missed deadlines' }, { label: 'Communication issues', value: 'Communication issues' }],
    tagGroups: [{ label: 'Project', value: 'Project' }, { label: 'Client', value: 'Client' }],
    segregation: [{ label: 'Internal', value: 'Internal' }, { label: 'External', value: 'External' }],
    selectedSegregation: null,
    tagGroupItems: [],
    selectedGroup: null,
    selectedTaggedItem: null,
    selectedAccountableGroup: null,
    // selectedResource: null,
    selectedBusinessImpact: null,
    selectedCDCategory: null,
    resourceIdentifiedComments: '',
    rcaComments: '',
    caComments: '',
    paComments: '',
    rejectionComments: '',
    newRejectionComments: '',
    isActive: true,
    ASD: {
      results: []
    },
    CS: {
      results: []
    },
    TL: {
      results: []
    },
    deliveryLevel1: {
      emailIDs: [],
      ids: []
    },
    deliveryLevel2: {
      emailIDs: [],
      ids: []
    },
    cm: {
      emailIDs: [],
      ids: []
    },
    allDeliveryResources: {
      emailIDs: [],
      ids: []
    },
    primaryResources: {
      emailIDs: [],
      ids: []
    },
    bd: {
      ID: '',
      EMail: '',
      Title: ''
    }
  };
  public cdDelete = {
    reasons: [{ label: 'Duplicate Entry', value: 'Duplicate Entry' },
    { label: 'Incorrect CD', value: 'Incorrect CD' }],
    selectedReason: null
  };
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  public hideResourceLoader = true;
  constructor(private globalConstant: ConstantsService, private spService: SPOperationService,
    private global: GlobalService,
    private qmsConstant: QMSConstantsService,
    private messageService: MessageService,
    private commonService: CommonService,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {
  }

  ngOnInit() {
  }

  // initializeMsg() {
  //   // this.success.subscribe((message) => this.successMessage = message);
  //   // this.success.pipe(
  //   //   debounceTime(5000)
  //   // ).subscribe(() => this.successMessage = null);
  // }

  /**
   * Opens popup and initialize public variable with row clicked data
   * @param element - button clicked
   * @param content - CD row
   * @param popupSize - popup size
   */
  async openPopup(element: any, content: any) {
    const currentTarget = Object.assign(element.currentTarget);
    // this.initializeMsg();
    const resourceDetails = await this.getResourceDetails(content.Title);
    this.setQCObject(currentTarget, content, resourceDetails);
    this.display = true;
  }

  // setPopupSuccessMsg(message) {
  //   this.success.next(message);
  // }

  async getResourceDetails(code) {
    const batchURL = [];
    // REST API url to check if code is project code
    const getPrjItemData = Object.assign({}, this.options);
    getPrjItemData.url = this.spService.getReadURL(this.globalConstant.listNames.ProjectInformation.name,
      this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent.getProject);
    getPrjItemData.url = getPrjItemData.url.replace('{{projectCode}}', code);
    getPrjItemData.listName = this.globalConstant.listNames.ProjectInformation.name;
    getPrjItemData.type = 'GET';
    batchURL.push(getPrjItemData);

    // Rest API to check if code is client code
    const getClientItemData = Object.assign({}, this.options);
    getClientItemData.url = this.spService.getReadURL(this.globalConstant.listNames.ClientLegalEntity.name,
      this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent.getClient);
    getClientItemData.url = getClientItemData.url.replace('{{Title}}', code);
    getClientItemData.listName = this.globalConstant.listNames.ClientLegalEntity.name;
    getClientItemData.type = 'GET';
    batchURL.push(getClientItemData);
    let arrResult = await this.spService.executeBatch(batchURL);
    arrResult = arrResult.map(d => d.retItems);
    const detail = arrResult && arrResult.length > 0 && arrResult[0].length > 0 ? arrResult[0][0] : arrResult[1].length > 0 ?
      arrResult[1][0] : [];
    return detail;
  }

  /**
   * Initalize with CD row clicked
   * @param element-button clicked
   * @param content-cd row
   */
  setQCObject(currentTarget, content, codeDetails) {
    this.qc.qcID = '' + content.ID;
    this.qc.projectCode = content.Title;
    this.qc.actionClicked = currentTarget.id;
    this.qc.actionClickedTitle = currentTarget.title;
    this.qc.status = content.Status ? content.Status : '';
    // this.qc.selectedResource = content.IdentifiedResource && content.IdentifiedResource.Title ? content.IdentifiedResource : null;
    this.qc.selectedAccountableGroup = content.Category ? content.Category : null;
    this.qc.selectedBusinessImpact = content.BusinessImpact ? content.BusinessImpact : null;
    this.qc.selectedCDCategory = content.SeverityLevel ? content.SeverityLevel : null;
    this.qc.resourceIdentifiedComments = content.Comments ? content.Comments : '';
    this.qc.rcaComments = content.RootCauseAnalysis ? content.RootCauseAnalysis : '';
    this.qc.paComments = content.CorrectiveActions ? content.CorrectiveActions : '';
    this.qc.caComments = content.PreventiveActions ? content.PreventiveActions : '';
    this.qc.otherResources = content.Resources.results ? content.Resources.results : [];
    this.qc.rejectionComments = content.RejectionComments ? content.RejectionComments : '';
    this.qc.deliveryLevel2 = this.getResourceEmail(content.ASD);
    this.qc.deliveryLevel1 = this.getResourceEmail(content.TL);
    this.qc.cm = this.getResourceEmail(content.CS);
    if (this.qc.deliveryLevel2 && this.qc.deliveryLevel2.ids.length <= 0) {
      this.qc.deliveryLevel2 = codeDetails.DeliveryLevel2 ? this.getResourceEmail([codeDetails.DeliveryLevel2]) : this.qc.deliveryLevel2;
    }
    if (this.qc.deliveryLevel1 && this.qc.deliveryLevel1.ids.length <= 0) {
      this.qc.deliveryLevel1 = codeDetails.DeliveryLevel1 && codeDetails.DeliveryLevel1.results ?
        this.getResourceEmail(codeDetails.DeliveryLevel1.results) : this.qc.deliveryLevel1;
    }
    if (this.qc.cm && this.qc.cm.ids.length <= 0) {
      this.qc.cm = codeDetails.CMLevel1 && codeDetails.CMLevel1.results ?
        this.getResourceEmail([...codeDetails.CMLevel1.results, ...[codeDetails.CMLevel2]]) : this.qc.cm;
    }
    this.qc.selectedSegregation = content.Segregation ? content.Segregation : null;
    this.qc.allDeliveryResources = codeDetails.AllDeliveryResources && codeDetails.AllDeliveryResources.results ?
      this.getResourceEmail(codeDetails.AllDeliveryResources.results) : this.qc.allDeliveryResources;
    this.qc.primaryResources = codeDetails.PrimaryResMembers && codeDetails.PrimaryResMembers.results ?
      this.getResourceEmail(codeDetails.PrimaryResMembers.results) : this.qc.primaryResources;
    this.qc.bd = codeDetails.BD && codeDetails.BD.EMail ? codeDetails.BD : '';

  }

  /**
   * reset accountable resource and close popup
   */
  close() {
    this.resetAccountableResource();
    this.display = false;
  }

  /**
   * resets accountable resources
   */
  resetAccountableResource() {
    this.qc.selectedAccountableGroup = this.qc.selectedBusinessImpact = this.qc.selectedCDCategory = null;
    this.qc.rcaComments = this.qc.caComments = this.qc.paComments = this.qc.resourceIdentifiedComments = '';
    this.qc.selectedGroup = this.qc.selectedTaggedItem = this.qc.selectedSegregation = null;
    this.qc.deliveryLevel2 = this.qc.deliveryLevel1 = this.qc.cm = this.cdDelete.selectedReason = null;
  }


  /**
   * updates CD
   * @param cdDetails- detals that needs to be updated
   */
  updateCD(cdDetails) {
    this.spService.updateItem(this.globalConstant.listNames.QualityComplaints.name, this.qc.qcID, cdDetails);
  }

  /**
   * Rejectes CD
   */
  deleteCD() {
    this.hidePopupLoader = false;
    this.hidePopupTable = true;
    setTimeout(() => {
      const cdDetails = {
        __metadata: { type: this.globalConstant.listNames.QualityComplaints.type },
        RejectionReason: this.cdDelete.selectedReason.value,
        Status: this.globalConstant.cdStatus.Deleted
      };
      this.qc.status = this.globalConstant.cdStatus.Deleted;
      this.updateCD(cdDetails);
      // Send updated qc to CD component and update CD
      this.bindTableEvent.emit(this.qc);
      // tslint:disable-next-line
      this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'CD for "' + this.qc.projectCode + '" successfully marked deleted due to ' + this.cdDelete.selectedReason.value });
      this.close();
      this.hidePopupLoader = true;
      this.hidePopupTable = false;
    });
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, 'g'), value);
  }

  /**
   * update cd status to closed ones all comments are entered
   */
  closeCD(element) {
    const popupActionClicked = element.currentTarget.id;
    // tslint:disable
    const operationalResourceID = [...this.qc.deliveryLevel1.ids, ...this.qc.deliveryLevel2.ids, ...this.qc.cm.ids].filter(function (e) { return e }); // Included delivery 2 user ID as they have to be added in resources column
    const operationalResourceEmail = [...this.qc.deliveryLevel1.emailIDs, ...this.qc.deliveryLevel2.emailIDs, ...this.qc.cm.emailIDs].filter(function (e) { return e });; // Excluded delivery 2 Email ID as this activity will be performed by Delivery Level 2
    const otherResourcesID = [...this.qc.primaryResources.ids, ...[this.qc.bd ? this.qc.bd.ID : ''], ...this.qc.allDeliveryResources.ids].filter(function (e) { return e });;
    const otherResourcesEmail = [...this.qc.primaryResources.emailIDs, ...[this.qc.bd ? this.qc.bd.EMail : ''], ...this.qc.allDeliveryResources.emailIDs].filter(function (e) { return e });;
    // tslint:enable
    const cdAdminsEmail = this.global.cdAdmins.map(r => r.Email);
    const strCDdAdminsEmail = cdAdminsEmail.join(',');
    this.hidePopupLoader = false;
    this.hidePopupTable = true;
    const cd = {
      Internal: {
        resourcesEmail: operationalResourceEmail,
        resourcesID: operationalResourceID
      },
      External: {
        resourcesEmail: [...otherResourcesEmail, ...operationalResourceEmail],
        resourcesID: [...otherResourcesID, ...operationalResourceID]
      }
    };
    const cdDetails = {
      __metadata: { type: this.globalConstant.listNames.QualityComplaints.type },
      RootCauseAnalysis: this.qc.rcaComments ? this.qc.rcaComments : '',
      CorrectiveActions: this.qc.caComments ? this.qc.caComments : '',
      PreventiveActions: this.qc.paComments ? this.qc.paComments : '',
      Status: popupActionClicked === 'closeBtn' ? this.globalConstant.cdStatus.ValidationPending : this.qc.status,
      Comments: this.qc.resourceIdentifiedComments ? this.qc.resourceIdentifiedComments : '',
      Category: this.qc.selectedAccountableGroup ? this.qc.selectedAccountableGroup : '',
      BusinessImpact: this.qc.selectedBusinessImpact ? this.qc.selectedBusinessImpact : '',
      SeverityLevel: this.qc.selectedCDCategory ? this.qc.selectedCDCategory : '',
      Segregation: this.qc.selectedSegregation ? this.qc.selectedSegregation : '',
      ResourcesId: { 'results': this.qc.selectedSegregation === 'Internal' ? cd.Internal.resourcesID : cd.External.resourcesID }
    };
    setTimeout(async () => {
      this.updateCD(cdDetails);
      let oldStatus = this.qc.status;
      this.qc.status = popupActionClicked === 'closeBtn' ? this.globalConstant.cdStatus.ValidationPending : this.qc.status;
      this.bindTableEvent.emit(this.qc);
      if (popupActionClicked === 'closeBtn') {
        const mailTemplates = [this.qmsConstant.EmailTemplates.CD.ValidationPending,
        this.qmsConstant.EmailTemplates.CD.NotifyAllOtherResources];
        const arrResult = await this.getMailContent(mailTemplates);
        const validityPendingTemplate = arrResult.length > 0 ? arrResult[0].retItems : [];
        const notifyMailTemplate = arrResult.length > 1 ? arrResult[1].retItems : [];
        if (validityPendingTemplate.length > 0) {
          let validityMailContent = validityPendingTemplate[0].Content;
          const validityMailSubject = this.qc.projectCode + '(#' + this.qc.qcID + '): Dissatisfaction validation pending';
          validityMailContent = this.replaceContent(validityMailContent, '@@Val1@@',
            this.global.sharePointPageObject.webAbsoluteUrl + '/dashboard#/qms/clientFeedback/clientDissatisfaction');
          // tslint:disable: max-line-length
          this.commonService.SetNewrelic('QMS', 'CD-Popup-closeCD-Admin', 'SendMail');
          this.spService.sendMail(strCDdAdminsEmail, this.global.currentUser.email, validityMailSubject, validityMailContent, this.global.currentUser.email);
        }
        if (oldStatus === this.globalConstant.cdStatus.Created) {
          if (notifyMailTemplate.length > 0) {
            let notifyMailContent = notifyMailTemplate[0].Content;
            const notifyMailSubject = this.qc.projectCode + '(#' + this.qc.qcID + '): Dissatisfaction';
            const strTo = this.qc.selectedSegregation === 'Internal' ? cd.Internal.resourcesEmail.join(',') : cd.External.resourcesEmail.join(',');
            notifyMailContent = this.replaceContent(notifyMailContent, '@@Val1@@', this.global.sharePointPageObject.webAbsoluteUrl + '/dashboard#/qms/personalFeedback/externalFeedback');
            this.commonService.SetNewrelic('QMS', 'CD-Popup-closeCD', 'SendMail');
            this.spService.sendMail(strTo, this.global.currentUser.email, notifyMailSubject, notifyMailContent, this.global.currentUser.email);
          }
        }
        this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'CD status updated for ' + this.qc.projectCode + '.' });
        oldStatus = this.qc.status;
        this.resetAccountableResource();
      } else {
        // this.setPopupSuccessMsg('Data saved!');
        this.showToastMsg('success', 'Success', 'Data saved!');
      }
      this.hidePopupLoader = true;
      this.hidePopupTable = false;
      this.close();
    }, 300);
  }

  /**
   * Update CD as Valid, InValid, Rejection
   *
   */
  updateValidity(actionClicked) {
    this.hidePopupLoader = false;
    this.hidePopupTable = true;
    const metadata = {
      __metadata: { type: this.globalConstant.listNames.QualityComplaints.type }
    };
    let cdDetails = {
      Status: '',
      IsActive: true
    };
    switch (actionClicked) {
      case 'valid':
        cdDetails = {
          ...metadata,                                              // Appending metadata property object
          Status: this.globalConstant.cdStatus.Closed,
          IsActive: true
        };
        break;
      case 'invalid':
        cdDetails = {
          ...metadata,
          Status: this.globalConstant.cdStatus.Closed,
          IsActive: false
        };
        break;
      case 'reject':
        cdDetails = {
          ...metadata,
          Status: this.globalConstant.cdStatus.Rejected,
          IsActive: true,
          ...{ RejectionComments: this.qc.rejectionComments + '\n' + this.qc.newRejectionComments }           // Appending property to object since RejectionComments cant be declared
        };
        break;
    }
    setTimeout(async () => {
      this.updateCD(cdDetails);
      //tslint:disable

      this.qc.status = cdDetails.Status === this.globalConstant.cdStatus.Rejected ? cdDetails.Status : cdDetails.IsActive === true ?
        cdDetails.Status + ' - ' + this.globalConstant.cdStatus.Valid : cdDetails.Status + ' - ' + this.globalConstant.cdStatus.InValid;
      this.qc.isActive = cdDetails.IsActive;
      this.qc.rejectionComments = this.qc.rejectionComments + '\n' + this.qc.newRejectionComments;
      this.bindTableEvent.emit(this.qc);
      if (actionClicked === 'reject') {
        const rejectTemplate = await this.getMailContent(this.qmsConstant.EmailTemplates.CD.RejectQualityComplaint);
        if (rejectTemplate.length > 0) {
          let rejectMailContent = rejectTemplate[0].Content;
          const rejectMailSubject = this.qc.projectCode + '(#' + this.qc.qcID + '): Dissatisfaction rejected';
          const strTo = this.qc.deliveryLevel2.emailIDs.join(',');
          rejectMailContent = this.replaceContent(rejectMailContent, "@@Val1@@", this.global.sharePointPageObject.webAbsoluteUrl + '/dashboard#/qms/clientFeedback/clientDissatisfaction');
          this.commonService.SetNewrelic('QMS', 'CD-updateValidity', 'SendMail');
          this.spService.sendMail(strTo, this.global.currentUser.email, rejectMailSubject, rejectMailContent, this.global.currentUser.email);
        }
        this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'CD rejected for ' + this.qc.projectCode + '.' });
      } else if (actionClicked === 'valid') {
        this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'CD marked as valid and closed for ' + this.qc.projectCode + '.' });
      } else if (actionClicked === 'invalid') {
        this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'CD marked as invalid and closed for ' + this.qc.projectCode + '.' });
      }
      // emit success message to CD component
      this.resetAccountableResource();
      this.hidePopupLoader = true;
      this.hidePopupTable = false;
      this.close();
    }, 300);
  }

  /**
   * one way binding of rejection comments
   * @param event
   */
  updateRejectionComments(event) {
    this.qc.newRejectionComments = event.currentTarget.value;
  }

  /**
   * return array of emails
   * @param resources
   */
  getResourceEmail(resources) {
    const allResources = this.global.allResources;
    const emails = [];
    const ids = [];
    const arrResources = resources && resources.results ? resources.results : []
    arrResources.forEach(element => {
      const resourceDetail = allResources.filter(r => r.UserName.ID === element.ID);
      emails.push(resourceDetail.length > 0 ? resourceDetail[0].UserName.EMail : '');
      ids.push(resourceDetail.length > 0 ? resourceDetail[0].UserName.ID : '');
    });
    return {
      emailIDs: emails,
      ids: ids
    };
  }

  /**
   * tag CD to project or client
   */
  tag() {
    this.hidePopupLoader = false;
    this.hidePopupTable = true;
    setTimeout(async () => {
      const cm = [...this.qc.selectedTaggedItem.CMLevel1.results.map(u => u.ID), this.qc.selectedTaggedItem.CMLevel2.ID ? this.qc.selectedTaggedItem.CMLevel2.ID : ''];
      const delivery1 = this.qc.selectedTaggedItem.DeliveryLevel1.results ? this.qc.selectedTaggedItem.DeliveryLevel1.results : [];
      const delivery2 = [this.qc.selectedTaggedItem.DeliveryLevel2.ID ? this.qc.selectedTaggedItem.DeliveryLevel2.ID : ''];
      const delivery2EMail = [this.qc.selectedTaggedItem.DeliveryLevel2.EMail ? this.qc.selectedTaggedItem.DeliveryLevel2.EMail : ''];
      const primaryResources = this.qc.selectedTaggedItem.PrimaryResMembers && this.qc.selectedTaggedItem.PrimaryResMembers.results ?
        this.qc.selectedTaggedItem.PrimaryResMembers.results.map(u => u.ID) : [];
      // update quality complaint line item
      const cdDetails = {
        __metadata: { type: this.globalConstant.listNames.QualityComplaints.type },
        Title: this.qc.selectedTaggedItem.Title,
        TLId: { 'results': delivery1.map(u => u.ID) },
        ASDId: { 'results': delivery2 },
        PrimaryResId: { 'results': primaryResources },
        CSId: { 'results': cm },
        Milestone: this.qc.selectedTaggedItem.Milestone ? this.qc.selectedTaggedItem.Milestone : '',
        ResourcesId: { 'results': delivery2 }
      };
      // update projectcode property to bind cd component
      this.qc.projectCode = this.qc.selectedTaggedItem.Title;
      this.qc.ASD = this.qc.selectedTaggedItem.DeliveryLevel1;
      this.qc.TL.results.push(this.qc.selectedTaggedItem.DeliveryLevel2);
      const cm1 = this.qc.selectedTaggedItem.CMLevel1.results ? this.qc.selectedTaggedItem.CMLevel1.results : [];
      this.qc.CS.results = [...cm1, this.qc.selectedTaggedItem.CMLevel2];
      this.updateCD(cdDetails);
      // Send updated qc to CD component and update CD
      this.bindTableEvent.emit(this.qc);
      // send mail
      const createCDTemplate = await this.getMailContent(this.qmsConstant.EmailTemplates.CD.CreateQualityComplaint);
      if (createCDTemplate.length > 0) {
        let createMailContent = createCDTemplate[0].Content;
        const createMailSubject = this.qc.projectCode + '(#' + this.qc.qcID + '): Dissatisfaction';
        const strTo = delivery2EMail.toString();
        createMailContent = this.replaceContent(createMailContent, "@@Val1@@", this.global.sharePointPageObject.webAbsoluteUrl + '/dashboard#/qms/clientFeedback/clientDissatisfaction');
        this.commonService.SetNewrelic('QMS', 'CD-actions-popup-tag', 'SendMail');
        this.spService.sendMail(strTo, this.global.currentUser.email, createMailSubject, createMailContent, this.global.currentUser.email);
      }
      this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'CD Tagged Successfully!' });
      this.close();
      this.hidePopupLoader = true;
      this.hidePopupTable = false;
    });
  }

  async getMailContent(arrTemplateName) {
    const batchURL = [];
    let arrResult = [];
    if (arrTemplateName instanceof Array) {
      arrTemplateName.forEach(element => {
        const mailTemplate = Object.assign({}, this.options);
        mailTemplate.url = this.spService.getReadURL(this.globalConstant.listNames.MailContent.name,
          this.qmsConstant.common.getMailTemplate);
        mailTemplate.url = mailTemplate.url.replace('{{templateName}}', element);
        mailTemplate.listName = this.globalConstant.listNames.MailContent.name;
        mailTemplate.type = 'GET';
        batchURL.push(mailTemplate);
      });
      arrResult = await this.spService.executeBatch(batchURL);
    } else {
      const common = this.qmsConstant.common;
      common.getMailTemplate.filter = common.getMailTemplate.filter.replace('{{templateName}}', arrTemplateName);
      this.commonService.SetNewrelic('QMS', 'cd-actionpopup-getMailContent', 'readItems');
      const templateData = await this.spService.readItems(this.globalConstant.listNames.MailContent.name,
        common.getMailTemplate);
      arrResult = templateData.length > 0 ? templateData : [];
    }
    return arrResult.length > 0 ? arrResult : [];;
  }

  /**
   * fetches resources based on accountable group
   */
  getSelectedGroupItems() {
    this.qc.tagGroupItems = [];
    this.hideResourceLoader = false;
    setTimeout(async () => {
      const cdComponent = this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent;
      const group = this.qc.selectedGroup;
      const tagItemsUrl = group.value === 'Project' ? cdComponent.getOpenProjects : cdComponent.getClients;
      const tagListName = group.value === 'Project' ? this.globalConstant.listNames.ProjectInformation.name : this.globalConstant.listNames.ClientLegalEntity.name;
      this.commonService.SetNewrelic('QMS', 'cd-actionpopup-getSelectedGroupItems', 'readItems');
      let items = await this.spService.readItems(tagListName, tagItemsUrl);
      items = items.length > 0 ? items : [];
      this.qc.tagGroupItems = [...items];

      this.qc.tagGroupItems.map((obj) => {
        if (group.value === 'Project') {
          obj.Title = obj.ProjectCode;
          if (obj.AllDeliveryResources.results) {
            this.updateResourceEmail(obj.AllDeliveryResources.results);
          }
          if (obj.PrimaryResMembers.results) {
            this.updateResourceEmail(obj.PrimaryResMembers.results);
          }
        }
        if (obj.DeliveryLevel1.results) {
          this.updateResourceEmail(obj.DeliveryLevel1.results);
        }
        if (obj.CMLevel1.results) {
          this.updateResourceEmail(obj.CMLevel1.results);
        }
      });
      this.hideResourceLoader = true;
    }, 300);
  }

  /**
   *
   * @param obj - QC item
   * @param array - array of resources
   * @param includeInEMail - should resources email to be added in email
   */
  updateResourceEmail(array) {
    array = array.map(res => {
      var resource = this.global.allResources.filter(u => u.UserName.ID === res.ID);
      res.EMail = resource.length > 0 ? resource[0].UserName.EMail : '';
      return res;
    });
  }

  showToastMsg(type, msg, detail) {
    this.messageService.add({ severity: type, summary: msg, detail: detail });
  }
}
