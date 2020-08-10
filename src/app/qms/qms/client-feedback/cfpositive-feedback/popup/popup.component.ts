import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../../../../Services/global.service';
import { ConstantsService } from '../../../../../Services/constants.service';
import { SPOperationService } from '../../../../../Services/spoperation.service';
import { SPCommonService } from '../../../../../Services/spcommon.service';
import { QMSConstantsService } from '../../../services/qmsconstants.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
  @ViewChild('pfPopupContent', { static: true }) popupContent: ElementRef;

  display = false;
  @Output() bindTableEvent = new EventEmitter<{}>();
  @Output() setSuccessMessage = new EventEmitter<{}>();
  public hidePopupLoader = true;
  public hidePopupTable = false;
  public pf = {
    pfID: '',
    projectCode: '',
    actionClicked: '',
    actionClickedTitle: '',
    tagGroups: [{ label: 'Project', value: 'Project' }, { label: 'Client', value: 'Client' }],
    tagGroupItems: [],
    selectedGroup: null,
    selectedTaggedItem: null,
    deliveryLeads: {
      emailIDs: [],
      ids: []
    },
    resources: [],
    Status: '',
    allDeliveryResources: {
      emailIDs: [],
      ids: []
    },
    primaryResources: {
      emailIDs: [],
      ids: []
    },
    deliveryLevel1: {
      emailIDs: [],
      ids: []
    },
    cmLevel1: {
      emailIDs: [],
      ids: []
    },
    cmLevel2: {
      ID: '',
      EMail: '',
      Title: ''
    },
    deliveryLevel2: {
      ID: '',
      EMail: '',
      Title: ''
    },
    bd: {
      ID: '',
      EMail: '',
      Title: ''
    }
  };

  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  // tslint:disable: max-line-length
  constructor(
    private global: GlobalService,
    private globalConstant: ConstantsService,
    private commonService: CommonService,
    private spService: SPOperationService,
    private qmsConstant: QMSConstantsService) {
  }

  ngOnInit() {
  }

  async openPopup(element: any, content: any) {
    this.display = true;
    const currentElement = {
      currentTarget: element.currentTarget,
      Status: element.Status
    };
    const resourceDetails = await this.getResourceDetails(content.Title);
    this.setPFObject(currentElement, content, resourceDetails);
  }

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
    this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition-popup', 'GetResourceDetails');
    const arrResult = await this.spService.executeBatch(batchURL);
    const detail = arrResult && arrResult.length > 0 && arrResult[0].length > 0 ? arrResult[0][0] : arrResult[1].length > 0 ?
      arrResult[1][0] : [];
    return detail;
  }

  /**
   * Initalize with CD row clicked
   * @param element-button clicked
   * @param content-cd row
   */
  setPFObject(element, content, resourceDetails) {
    this.pf.pfID = '' + content.ID;
    this.pf.projectCode = content.Title;
    this.pf.actionClicked = element.currentTarget.id;
    this.pf.Status = element.Status ? element.Status : '';
    this.pf.actionClickedTitle = element.currentTarget.title;
    this.pf.deliveryLeads = content.DeliveryLeads && content.DeliveryLeads.results ? this.getResourceEmail(content.DeliveryLeads.results) : this.pf.deliveryLeads;
    this.pf.allDeliveryResources = resourceDetails.AllDeliveryResources && resourceDetails.AllDeliveryResources.results ? this.getResourceEmail(resourceDetails.AllDeliveryResources.results) : this.pf.allDeliveryResources;
    this.pf.primaryResources = resourceDetails.PrimaryResMembers && resourceDetails.PrimaryResMembers.results ? this.getResourceEmail(resourceDetails.PrimaryResMembers.results) : this.pf.primaryResources;
    this.pf.bd = resourceDetails.BD && resourceDetails.BD.EMail ? resourceDetails.BD : '';
    this.pf.deliveryLevel1 = resourceDetails.DeliveryLevel1 && resourceDetails.DeliveryLevel1.results ? this.getResourceEmail(resourceDetails.DeliveryLevel1.results) : this.pf.deliveryLevel1;
    this.pf.cmLevel1 = resourceDetails.CMLevel1 && resourceDetails.CMLevel1.results ? this.getResourceEmail(resourceDetails.CMLevel1.results) : this.pf.cmLevel1;
    this.pf.cmLevel2 = resourceDetails.CMLevel2 && resourceDetails.CMLevel2.EMail ? resourceDetails.CMLevel2 : '';
    this.pf.deliveryLevel2 = resourceDetails.DeliveryLevel2 && resourceDetails.DeliveryLevel2.EMail ? resourceDetails.DeliveryLevel2 : '';
    this.pf.resources = Array.isArray(content.Resources) ? content.Resources.length ? content.Resources : '' : content.resources ? content.resources : '';
  }

  /**
   * reset accountable resource and close popup
   */
  close() {
    this.resetAccountableResource();
    this.display = false;
  }

  resetAccountableResource() {
    this.pf.selectedGroup = null;
    this.pf.selectedTaggedItem = null;
  }

  /**
   * updates CD
   * @param pfDetails- detals that needs to be updated
   */
  update(pfDetails) {

    this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition', 'updatepf');
    this.spService.updateItem(this.globalConstant.listNames.PositiveFeedbacks.name, this.pf.pfID, pfDetails);
  }

  getResourceEmail(resources) {
    const allResources = this.global.allResources;
    const emails = [];
    const ids = [];
    resources.forEach(element => {
      const resourceDetail = allResources.filter(r => r.UserNamePG.ID === element.ID);
      emails.push(resourceDetail.length > 0 ? resourceDetail[0].UserNamePG.EMail : '');
      ids.push(resourceDetail.length > 0 ? resourceDetail[0].UserNamePG.ID : '');
    });
    return {
      emailIDs: emails,
      ids
    };
  }

  tag() {
    this.hidePopupLoader = false;
    this.hidePopupTable = true;
    setTimeout(async () => {
      const delivery1 = this.pf.selectedTaggedItem.DeliveryLevel1.results ? this.pf.selectedTaggedItem.DeliveryLevel1.results : [];
      const delivery2 = [this.pf.selectedTaggedItem.DeliveryLevel2.ID ? this.pf.selectedTaggedItem.DeliveryLevel2.ID : ''];
      const delivery2Email = [this.pf.selectedTaggedItem.DeliveryLevel2.EMail ? this.pf.selectedTaggedItem.DeliveryLevel2.EMail : ''];
      const allDeliveryEmails = [...delivery2Email];
      const pfDetails = {
        __metadata: { type: this.globalConstant.listNames.PositiveFeedbacks.type },
        Title: this.pf.selectedTaggedItem.Title,
        // tslint:disable: object-literal-key-quotes
        DeliveryLeadsId: { 'results': [...delivery2] },
        ResourcesId: { 'results': this.pf.selectedTaggedItem.allResourcesID }
      };
      this.pf.projectCode = this.pf.selectedTaggedItem.Title;
      this.pf.resources = this.pf.selectedTaggedItem.allResourcesTitle.filter((v, i, a) => a.indexOf(v) === i);

      this.update(pfDetails);
      // Send updated pf to PF component and update CD
      this.bindTableEvent.emit(this.pf);
      // tslint:disable-next-line
      this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'PF Tagged Successfully!' });
      const createPFTemplate = await this.getMailContent(this.qmsConstant.EmailTemplates.PF.CreatePositiveFeedback);
      if (createPFTemplate.length > 0) {
        let createMailContent = createPFTemplate[0].ContentMT;
        const createMailSubject = this.pf.projectCode + '(#' + this.pf.pfID + '): Positive Feedback';
        const strTo = allDeliveryEmails.join(',');
        createMailContent = this.replaceContent(createMailContent, '@@Val1@@', this.global.sharePointPageObject.webAbsoluteUrl + '/dashboard#/qms/clientFeedback/cfpositiveFeedback');
        this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition', 'sendMail');
        this.spService.sendMail(strTo, this.global.currentUser.email, createMailSubject, createMailContent, this.global.currentUser.email);
      }
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

      this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition-popup', 'GetMailContent');
      arrResult = await this.spService.executeBatch(batchURL);
    } else {
      const common = this.qmsConstant.common;
      common.getMailTemplate.filter = common.getMailTemplate.filter.replace('{{templateName}}', arrTemplateName);

      this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition-popup', 'GetMailContent');
      const templateData = await this.spService.readItems(this.globalConstant.listNames.MailContent.name,
        common.getMailTemplate);
      arrResult = templateData.length > 0 ? templateData : [];
    }
    return arrResult.length > 0 ? arrResult : [];
  }
  /**
   * fetches resources based on accountable group
   */
  getSelectedGroupItems() {
    this.globalConstant.loader.isPSInnerLoaderHidden = false;
    setTimeout(async () => {
      const group = this.pf.selectedGroup;
      const cdComponent = JSON.parse(JSON.stringify(this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent));
      const tagItemsUrl = group === 'Project' ? cdComponent.getOpenProjects : cdComponent.getClients;
      const tagListName = group === 'Project' ? this.globalConstant.listNames.ProjectInformation.name : this.globalConstant.listNames.ClientLegalEntity.name;
      this.commonService.SetNewrelic('QMS', 'ClientFeedBack-cfposition-popup', 'GetSelectedGroupItems');
      let items = await this.spService.readItems(tagListName, tagItemsUrl);
      items = items.length > 0 ? items : [];
      this.pf.tagGroupItems = [...items];

      this.pf.tagGroupItems.map((obj) => {
        obj.allResourcesEmail = [];
        obj.allResourcesID = [];
        obj.allResourcesTitle = [];
        if (group === 'Project') {
          obj.Title = obj.ProjectCode;
          if (obj.AllDeliveryResources.results) {
            this.updateResourceEmail(obj, obj.AllDeliveryResources.results, true);
          }
          if (obj.PrimaryResMembers.results) {
            this.updateResourceEmail(obj, obj.PrimaryResMembers.results, true);
          }
          if (obj.BD && obj.BD.EMail) {
            obj.allResourcesEmail.push(obj.BD.EMail);
            obj.allResourcesID.push(obj.BD.ID);
            if (obj.BD.Title) {
              obj.allResourcesTitle.push(obj.BD.Title);
            }
          }
        }
        if (obj.DeliveryLevel1.results) {
          this.updateResourceEmail(obj, obj.DeliveryLevel1.results, false);
        }
        if (obj.CMLevel1.results) {
          this.updateResourceEmail(obj, obj.CMLevel1.results, true);
        }
        if (obj.DeliveryLevel2.EMail) {
          obj.allResourcesID.push(obj.DeliveryLevel2.ID);
          if (obj.DeliveryLevel2.Title) {
            obj.allResourcesTitle.push(obj.DeliveryLevel2.Title);
          }
        }
        if (obj.CMLevel2.EMail) {
          obj.allResourcesEmail.push(obj.CMLevel2.EMail);
          obj.allResourcesID.push(obj.CMLevel2.ID);
          if (obj.CMLevel2.Title) {
            obj.allResourcesTitle.push(obj.CMLevel2.Title);
          }
        }
      });
      this.globalConstant.loader.isPSInnerLoaderHidden = true;
    }, 300);
  }

  updateResourceEmail(obj, array, includeInEMail) {
    array = array.map(dl1 => {
      const resource = this.global.allResources.filter(u => u.UserNamePG.ID === dl1.ID);
      dl1.EMail = resource.length > 0 ? resource[0].UserNamePG.EMail : '';
      obj.allResourcesID.push(dl1 !== '' ? dl1.ID : '');
      if (dl1.Title) {
        obj.allResourcesTitle.push(dl1.Title);
      }
      if (includeInEMail) {
        obj.allResourcesEmail.push(dl1.EMail);
      }
      return dl1;
    });
  }

  /**
   *  Update positive feedback if it is accepted aor rejected
   */
  updatePF() {
    this.hidePopupLoader = false;
    this.hidePopupTable = true;
    setTimeout(async () => {
      let pfDetails = {};
      const allResourcesEmails = [...this.pf.allDeliveryResources.emailIDs, ...this.pf.cmLevel1.emailIDs, ...[this.pf.cmLevel2.EMail], ...this.pf.deliveryLevel1.emailIDs,
      ...this.pf.deliveryLeads.emailIDs, ...[this.pf.deliveryLevel2.EMail], ...[this.pf.bd ? this.pf.bd.EMail : '']].filter((v, i, a) => a.indexOf(v) === i);
      if (this.pf.actionClicked === 'reject') {
        pfDetails = {
          __metadata: { type: this.globalConstant.listNames.PositiveFeedbacks.type },
          Status: this.globalConstant.pfStatus.Rejected
        };
        this.pf.Status = this.globalConstant.pfStatus.Rejected;
      } else {
        pfDetails = {
          __metadata: { type: this.globalConstant.listNames.PositiveFeedbacks.type },
          Status: this.globalConstant.pfStatus.Accepted
        };
        this.pf.Status = this.globalConstant.pfStatus.Accepted;
        const notifyPFTemplate = await this.getMailContent(this.qmsConstant.EmailTemplates.PF.NotifyAllOtherResources);
        if (notifyPFTemplate.length > 0) {
          let notifyMailContent = notifyPFTemplate[0].ContentMT;
          const notifyMailSubject = this.pf.projectCode + '(#' + this.pf.pfID + '): Positive Feedback';
          const strTo = allResourcesEmails.join(',');
          notifyMailContent = this.replaceContent(notifyMailContent, '@@Val1@@', this.global.sharePointPageObject.webAbsoluteUrl + '/dashboard#/qms/personalFeedback/positiveFeedback');
          this.commonService.SetNewrelic('cfpositive-feedback-popup', 'updatePF', 'PositveFeedbackMail');
          this.spService.sendMail(strTo, this.global.currentUser.email, notifyMailSubject, notifyMailContent, this.global.currentUser.email);
        }
      }
      this.update(pfDetails);
      await this.bindTableEvent.emit(this.pf);
      this.setSuccessMessage.emit({ type: 'success', msg: 'Success', detail: 'Positive feedback ' + this.pf.Status + '!' });
      this.close();
      this.hidePopupLoader = true;
      this.hidePopupTable = false;
    });
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, 'g'), value);
  }
}
