import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { CommonService } from 'src/app/Services/common.service';
// import {Subject} from 'rxjs';
// import {debounceTime} from 'rxjs/operators';
import { SpPeoplePickerService } from 'src/app/Services/sp-people-picker.service';
declare var $: any;

@Component({
  selector: 'app-resource-section',
  templateUrl: './resource-section.component.html',
  styleUrls: ['./resource-section.component.css']
})
export class ResourceSectionComponent implements OnInit {
  @Output() reloadResources = new EventEmitter<string>();
  public webURL = this.sharedObject.sharePointPageObject.serverRelativeUrl;
  public webImageURL = '/sites/medcomcdn/PublishingImages';
  public resources = [];
  public customCollapsedHeight = '30px';
  // private _resourceSuccess = new Subject<string>();
  // public resourceSuccessMessage: string;
  private projectInformationList = this.constants.listNames.ProjectInformation.name;
  public sharedTaskAllocateObj = this.sharedObject.oTaskAllocation;
  constructor(
    private spService: SharepointoperationService,
    private commonService: CommonService,
    private peoplePickerService: SpPeoplePickerService,
    private constants: ConstantsService,
    public sharedObject: GlobalService) { }

  ngOnInit() {
    this.sharedObject.resSectionShow = true;
    // this._resourceSuccess.subscribe((message) => this.resourceSuccessMessage = message);
    // this._resourceSuccess.pipe(
    //   debounceTime(5000)
    // ).subscribe(() => this.resourceSuccessMessage = null);
    this.loadResources();
  }

  public callReloadRes() {
    this.reloadResources.next('callRes');
  }

  public setPeoplePicker() {
    return new Promise((resolve, reject) => {
      this.peoplePickerService.spPeoplePicker(['writer', 'reviewer', 'editor',
        'qualityChecker', 'graphicsMembers', 'pubSupportMembers', 'primaryResources']);
      resolve();
    });
  }

  public setPeoplePickerItems(items) {
    return new Promise((resolve, reject) => {
      this.peoplePickerService.spPeoplePicker(items);
      resolve();
    });
  }

  public setPrimaryResource(event, selectControl) {
    if (event) {

      const primaryResources = this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'primaryResources');

      const obj = {
        ID: event.UserName.ID,
        Name: event.UserName.Title
      };
      if (primaryResources.indexOf(event.UserName.ID) < 0) {
        const primaryResourceNames = this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'primaryResources');
        primaryResourceNames.push(event.UserName.Name);
        this.setPeoplePickerItems(['primaryResources']);
        this.peoplePickerService.SetUserInPeoplePicker('primaryResources', primaryResourceNames);
        // this.peoplePickerService.SetUserID([obj], 'primaryResources');
      }
      // this.changeSuccessMessage(event.UserName.Title + ' added as Primary resource!');
    }
  }

  //  public changeSuccessMessage(message) {
  //    this._resourceSuccess.next(message);
  //  }

  public async saveResources() {
    $('.resources #resp-table').hide();
    $('.loading').show();
    setTimeout(() => {
      this.saveDeliveryResources();
      this.commonService.getProjectResources(this.sharedTaskAllocateObj.oProjectDetails.projectCode, false, true);
    }, 300);
  }
  // tslint:disable
  private saveDeliveryResources() {
    const updateInformation = [];
    const allDeliveryResources = [];
    const project = this.sharedTaskAllocateObj.oProjectDetails;
    project.resources = this.getPeoplePickerResourcesID();
    updateInformation.push({ 'key': 'WritersId', 'value': project.resources.WritersID });
    updateInformation.push({ 'key': 'ReviewersId', 'value': project.resources.reviewersID });
    updateInformation.push({ 'key': 'QCId', 'value': project.resources.qcersID });
    updateInformation.push({ 'key': 'EditorsId', 'value': project.resources.editorsID });
    updateInformation.push({
      'key': 'GraphicsMembersId', 'value': project.resources.graphicsMembersID !== '' ?
        project.resources.graphicsMembersID : []
    });
    updateInformation.push({
      'key': 'PSMembersId', 'value': project.resources.pubSupportMembersID !== '' ?
        project.resources.pubSupportMembersID : []
    });
    updateInformation.push({
      'key': 'PrimaryResMembersId', 'value': project.resources.primaryResources !== '' ?
        project.resources.primaryResources : []
    });
    updateInformation.push({
      'key': 'AllDeliveryResourcesId', 'value': project.resources.allDeliveryResources !== '' ?
        project.allDeliveryResources : []
    });
    // tslint:disable-next-line:max-line-length
    this.spService.updateListItemRestApi(this.projectInformationList, updateInformation, project.projectID,
      'SP.Data.ProjectInformationListItem', false, function () {
        $('.loading').hide();
        $('.resources #resp-table').show();
        $('#primaryResourcesSelect').prop('selectedIndex', 0);

      }, function () { });
  }

  // tslint:enable

  getPeoplePickerResourcesID() {
    const resources = {
      WritersID: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'writer').filter(e => e !== undefined),
      reviewersID: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'reviewer').filter(e => e !== undefined),
      qcersID: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'qualityChecker').filter(e => e !== undefined),
      editorsID: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'editor').filter(e => e !== undefined),
      // tslint:disable
      graphicsMembersID: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'graphicsMembers').filter(e => e !== undefined),
      pubSupportMembersID: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'pubSupportMembers').filter(e => e !== undefined),
      primaryResources: this.peoplePickerService.GetUserIDs(this.sharedTaskAllocateObj.oResources, 'primaryResources').filter(e => e !== undefined),
      // tslint:enable
      allDeliveryResources: []
    };
    resources.allDeliveryResources = [...resources.WritersID, ...resources.reviewersID, ...resources.qcersID,
    ...resources.editorsID, ...resources.graphicsMembersID, ...resources.pubSupportMembersID,
    ...resources.primaryResources];
    return resources;
  }

  getPeoplePickerResourcesNames() {
    const resources = {
      WritersName: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'writer'),
      reviewersName: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'reviewer'),
      qcersName: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'qualityChecker'),
      editorsName: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'editor'),
      graphicsMembersName: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'graphics'),
      pubSupportMembersName: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'publicationSupport'),
      primaryResources: this.peoplePickerService.GetUserNames(this.sharedTaskAllocateObj.oResources, 'primaryResources')
    };
    return resources;
  }

  public loadResources() {
    this.resources = this.sharedTaskAllocateObj.oResources;
    this.setPeoplePicker();
    this.peoplePickerService.SetUserIDs(this.sharedTaskAllocateObj.oProjectDetails)
      .then(res => {
        $('.sp-peoplepicker-editorInput').attr('readonly', true);
      });
  }

  public toggleResourcesTimeline(event, expansionPanel) {
    const toggleElement = event.target;
    if (expansionPanel.expanded) {
      this.loadResources();
    }
    //  const toggleNext = $(toggleElement).next();
    //  if (!toggleNext.is(':visible')) {
    //    $('.timelineSection').slideUp(500, () => {
    //      $('.timeline').removeClass('selectedTabSection');
    //      toggleNext.slideDown(500, () =>{
    //        this.setPeoplePicker();
    //        this.peoplePickerService.SetUserIDs(this.sharedTaskAllocateObj.oProjectDetails)
    //        .then(res => {
    //          $('.sp-peoplepicker-editorInput').attr('readonly', true);
    //        });
    //      });
    //      $('.resourceHeader').addClass('selectedTabSection');
    //    });
    //  }
  }

}
