import { Component, OnInit, Output, EventEmitter, OnDestroy, Input, HostListener } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {

  @Input() reloadResourcesEnable: boolean;
  @Output() reloadTimeline = new EventEmitter<string>();

  public allPrimaryResources: PeoplePickerUser[];
  primaryResoucesusers: PeoplePickerUser[] = [];
  writerusers: PeoplePickerUser[] = [];
  reviewerusers: PeoplePickerUser[] = [];
  qualityusers: PeoplePickerUser[] = [];
  editorusers: PeoplePickerUser[] = [];
  graphicsusers: PeoplePickerUser[] = [];
  pubsupportusers: PeoplePickerUser[] = [];
  filterPrimaryResources: PeoplePickerUser[];
  loaderEnable = true;
  public sharedTaskAllocateObj = this.sharedObject.oTaskAllocation;
  resources: any;
  navigationSubscription: any;
  tempClick: any;
  forFTE: boolean = false;
  constructor(
    public sharedObject: GlobalService,
    private spService: SPOperationService,
    private constants: ConstantsService,
    private commonService: CommonService) { }
  ngOnInit() {
    this.forFTE = this.sharedTaskAllocateObj.oProjectDetails.projectType === 'FTE-Writing' ? true : false;
    this.loadResources();
  }


  // *************************************************************************************************
  // Filter Users for dropdown based on keyup
  //  **************************************************************************************************

  filterUsers(event) {
    if (event.query) {
      const filtered: any[] = [];
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.allPrimaryResources.length; i++) {
        const user = this.allPrimaryResources[i];
        if (user.UserName.toLowerCase().indexOf(event.query.toLowerCase()) === 0) {
          filtered.push(user);
        }
      }
      this.filterPrimaryResources = [...filtered];
    } else {
      this.filterPrimaryResources = [...this.allPrimaryResources];
    }
  }

  // *************************************************************************************************
  //  load resources on init
  //  **************************************************************************************************

  loadResources() {

    this.loaderEnable = true;
    this.resources = this.sharedTaskAllocateObj.oResources;
    this.primaryResoucesusers = [];
    this.writerusers = [];
    this.reviewerusers = [];
    this.qualityusers = [];
    this.editorusers = [];
    this.graphicsusers = [];
    this.pubsupportusers = [];
    this.allPrimaryResources = this.sharedTaskAllocateObj.oProjectDetails.projectType === 'FTE-Writing' ? this.resources.filter(e=> e.IsFTE === 'Yes').map(o => new Object({ Id: o.UserNamePG.ID, UserName: o.UserNamePG.Title })) : this.resources.map(o => new Object({ Id: o.UserNamePG.ID, UserName: o.UserNamePG.Title }));
    this.filterPrimaryResources = this.allPrimaryResources;
    const projectDetails = this.sharedTaskAllocateObj.oProjectDetails;
    if (projectDetails.primaryResources.results) {
      projectDetails.primaryResources.results.forEach(resource => {
        // this.primaryResoucesusers.push({ Id: resource.ID, UserName: resource.Title });
        if(this.forFTE) {
          let resources:any = { Id: resource.ID, UserName: resource.Title };
          this.primaryResoucesusers = resources;
        } else {
          this.primaryResoucesusers.push({ Id: resource.ID, UserName: resource.Title });
        }
      });
    }
    if (projectDetails.writer.results) {
      projectDetails.writer.results.forEach(writer => {
        this.writerusers.push({ Id: writer.ID, UserName: writer.Title });
      });
    }
    if (projectDetails.reviewer.results) {
      projectDetails.reviewer.results.forEach(reviewer => {
        this.reviewerusers.push({ Id: reviewer.ID, UserName: reviewer.Title });
      });
    }
    if (projectDetails.qualityChecker.results) {
      projectDetails.qualityChecker.results.forEach(qualityChecker => {
        this.qualityusers.push({ Id: qualityChecker.ID, UserName: qualityChecker.Title });
      });
    }
    if (projectDetails.editor.results) {
      projectDetails.editor.results.forEach(editor => {
        this.editorusers.push({ Id: editor.ID, UserName: editor.Title });
      });
    }
    if (projectDetails.graphicsMembers.results) {
      projectDetails.graphicsMembers.results.forEach(graphicsMember => {
        this.graphicsusers.push({ Id: graphicsMember.ID, UserName: graphicsMember.Title });
      });
    }
    if (projectDetails.pubSupportMembers.results) {
      projectDetails.pubSupportMembers.results.forEach(pubSupport => {
        this.pubsupportusers.push({ Id: pubSupport.ID, UserName: pubSupport.Title });
      });
    }

    this.loaderEnable = false;
  }


  // *************************************************************************************************
  //  save all resources
  //  **************************************************************************************************


  async saveResources() {
    this.loaderEnable = true;

    const updateInformation = [];
    const project = this.sharedTaskAllocateObj.oProjectDetails;
    let scheduleTasks = await this.commonService.getScheduleTasks(project.projectCode);
    let resource:any = this.primaryResoucesusers;
    let primaryResource = this.forFTE ? [resource.Id] : this.primaryResoucesusers.map(o => o.Id);
    updateInformation.push(new Object({ key: 'WritersId', value: this.writerusers.map(o => o.Id) }));
    updateInformation.push(new Object({ key: 'ReviewersId', value: this.reviewerusers.map(o => o.Id) }));
    updateInformation.push(new Object({ key: 'QCId', value: this.qualityusers.map(o => o.Id) }));
    updateInformation.push(new Object({ key: 'EditorsId', value: this.editorusers.map(o => o.Id) }));
    updateInformation.push(new Object({ key: 'GraphicsMembersId', value: this.graphicsusers.map(o => o.Id) }));
    updateInformation.push(new Object({ key: 'PSMembersId', value: this.pubsupportusers.map(o => o.Id) }));
    updateInformation.push(new Object({ key: 'PrimaryResMembersId', value: primaryResource }));

    const AlluniqueUsersId = [];
    updateInformation.filter(c => c.value.length > 0).map(c => c.value).forEach(element => {
      element.forEach(id => {
        if (!AlluniqueUsersId.includes(id)) {
          AlluniqueUsersId.push(id);
        }
      });
    });
    updateInformation.push(new Object({ key: 'AllDeliveryResourcesId', value: AlluniqueUsersId.map(o => o) }));

    console.log(updateInformation);
    const oBj: any = {};

    for (const index in updateInformation) {
      if (updateInformation.hasOwnProperty(index)) {
        // tslint:disable-next-line: no-string-literal
        const oVal = updateInformation[index]['value'];
        if (oVal) {
          // tslint:disable-next-line: no-string-literal
          oBj[updateInformation[index]['key']] = { results: oVal };
        }
      }
    }
    this.commonService.SetNewrelic('TaskAllocation', 'resources', 'SaveResources');
    await this.spService.updateItem(this.constants.listNames.ProjectInformation.name, project.projectID,
      oBj, this.constants.listNames.ProjectInformation.type);
    this.commonService.SetNewrelic('TaskAllocation', 'resources-getProjectResources', 'saveResources');
    await this.commonService.updateTasks(scheduleTasks,this.primaryResoucesusers);
    await this.commonService.getProjectResources(project.projectCode, true, false);
    this.loaderEnable = false;
    this.commonService.showToastrMessage(this.constants.MessageType.success,'Resources updated successfully.',false);
    if(this.forFTE) {
      this.reloadTimeline.emit();
    }
  }


  // *************************************************************************************************************************************
  // hide dropdown option  on production
  // *************************************************************************************************************************************

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === 'ui-button-icon-left ui-clickable pi pi-caret-down') {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        if (this.tempClick !== event.target.parentElement.nextElementSibling) {
          this.tempClick = event.target.parentElement.nextElementSibling;
          this.tempClick.style.display = '';
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.nextElementSibling;
        this.tempClick.style.display = '';
      }

    } else if (event.target.className === 'user-name') {
      if (event.target.offsetParent) {
        event.target.offsetParent.style.display = 'none';
      }
    } else {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        this.tempClick = undefined;
      }
    }
  }

}


export class PeoplePickerUser {

  Id: number;
  UserName: string;
}
