import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../Services/global.service';
import { ConstantsService } from '../Services/constants.service';
import { SharepointoperationService } from '../Services/sharepoint-operation.service';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { TaskAllocationConstantsService } from './services/task-allocation-constants.service';
import { TimelineComponent } from './timeline/timeline.component';
import { CommonService } from '../Services/common.service';

@Component({
  selector: 'app-taskallocation',
  templateUrl: './task-allocation.component.html',
  styleUrls: ['./task-allocation.component.css'],
  animations: [trigger('openClose', [
    // ...
    state('open', style({
      height: '200px',
      opacity: 1,
      backgroundColor: 'yellow'
    })),
    state('closed', style({
      height: '100px',
      opacity: 0.5,
      backgroundColor: 'green'
    })),
    transition('open => closed', [
      animate('1s')
    ]),
    transition('closed => open', [
      animate('0.5s')
    ]),
  ]),
  ],

})
export class TaskAllocationComponent implements OnInit {

  @ViewChild(TimelineComponent, { static: true }) timelineChild: TimelineComponent;
  customCollapsedHeight = '30px';
  Searchenable = false;
  SearchView = true;
  loaderenable = false;
  isUserManager = false;
  timelineView = false;
  projectCode;
  errormessage = '';
  response;
  batchContents = new Array();

  searchFormControl = new FormControl('', [
    Validators.required,

  ]);
  public sharedTaskAllocateObj = this.globalObject.oTaskAllocation;
  public resources = [];
  public webImageURL = '/sites/medcomcdn/PublishingImages';
  constructor(
    private route: ActivatedRoute,
    private router: Router, public spServices: SharepointoperationService,
    public constants: ConstantsService,
    public globalObject: GlobalService,
    public taskAllocatinoService: TaskAllocationConstantsService,
    private commonService: CommonService,
    public taskAllocationService: TaskAllocationConstantsService) { }

  ngOnInit() {
    this.currentUserGroup();

    // this.route.snapshot.queryParams['ProjectCode'];
    // this.route.queryParams.subscribe(params => {

    //   this.projectCode = params['ProjectCode'];
    // })
    if (this.projectCode !== undefined) {
      this.SearchView = false;
      this.getProjectDetails();
    }

  }

  /*****************************************************************

   Enable Search button & call api on enter click.
  *******************************************************************/


  async currentUserGroup() {
    const currentUser = await this.spServices.getUserInfo(this.globalObject.sharePointPageObject.userId.toString());
    this.globalObject.currentUser.id = currentUser.Id;
    this.globalObject.currentUser.email = currentUser.Email;
    this.globalObject.currentUser.title = currentUser.Title;

    const curruentUsrInfo = await this.spServices.getCurrentUser();
    this.globalObject.currentUser.loggedInUserInfo = curruentUsrInfo.d.Groups.results;

    this.globalObject.currentUser.loggedInUserInfo.forEach(element => {
      if (element) {
        this.globalObject.currentUser.loggedInUserGroup.push(element.LoginName);
      }
    });
  }

  SearchProject(event: any) {
    this.errormessage = '';
    this.projectCode = undefined;
    if (event.keyCode === 13) { this.getProjectDetails(); }
    this.Searchenable = this.searchFormControl.value !== '' ? true : false;
  }
  /*****************************************************************

   Call Api to Get Project Details
  *******************************************************************/

  private async getProjectDetails() {
    this.errormessage = '';
    this.loaderenable = true;
    this.SearchView = false;
    this.isUserManager = this.globalObject.currentUser.loggedInUserGroup.
      findIndex(c => (c === 'Managers' || c === 'Project-FullAccess')) !== -1 ? true : false;

    const code = this.projectCode;
    const val = this.searchFormControl.value.trim();
    const textCode = val != null ? val.split(' - ')[0].trim() : '';
    if (code || textCode) {
      const projCode = code !== undefined ? code : textCode;
      this.projectCode = projCode;
      const project = await this.commonService.getProjectResources(this.projectCode, true, false);
      if (project.length <= 0) {
        this.errormessage = 'Project code doesn\'t exist. Please verify if it is correct.';
        this.loaderenable = false;
        this.SearchView = true;
        return false;
      } else if (project[0].Status === 'Cancelled') {
        this.errormessage = 'Task allocation not allowed for cancelled project.';
        this.loaderenable = false;
        this.SearchView = true;
        return false;
      } else if (project[0].Status === 'Awaiting Cancel Approval') {
        this.errormessage = 'Task allocation not allowed for Awaiting Cancel Approval project.';
        this.loaderenable = false;
        this.SearchView = true;
        return false;
      }

      const isUserAllowed = await this.checkIfAccessAllowedToUser(projCode);

      if (this.isUserManager || isUserAllowed) {
        this.errormessage = '';
        this.loaderenable = false;
        this.SearchView = false;
        this.timelineView = true;
        setTimeout(() => {
          this.timelineChild.getMilestones(true);
        }, 100);
      } else {
        this.errormessage = 'You dont have access to this project.';
        this.SearchView = true;
      }
    } else {
      this.loaderenable = false;
      this.SearchView = true;
      this.errormessage = 'Please Enter Project Code.';

    }
  }

  // ***********************************************************************************************************************************
  // Central Group
  // ***********************************************************************************************************************************
  public async checkIfAccessAllowedToUser(code) {
    this.batchContents = new Array();
    const batchGuid = this.spServices.generateUUID();
    const checkAccessCall = Object.assign({}, this.taskAllocationService.taskallocationComponent.checkAccess);
    checkAccessCall.filter = checkAccessCall.filter.replace(/{{code}}/gi, code);
    const checkAccessUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', checkAccessCall);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, checkAccessUrl);
    let arrayOperationResources;

    const project = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    if (project.length > 0) {
      arrayOperationResources = project[0][0].AllOperationresources.results != null ? project[0][0].AllOperationresources.results : '';
      const operationalResouce = arrayOperationResources.length > 0 ? (arrayOperationResources.find
        (c => c.ID === this.globalObject.sharePointPageObject.userId) !== undefined ?
        arrayOperationResources.find(c => c.ID === this.globalObject.sharePointPageObject.userId) : '') : '';
      if (operationalResouce.length > 0) {
        return true;
      } else {
        this.errormessage = 'You do not have access on the project.';
        this.loaderenable = false;
        this.SearchView = true;
      }
    } else {
      this.errormessage = 'Project code doesn&apos;t exist. Please verify if it is correct';
      this.loaderenable = false;
      this.SearchView = true;
    }
    return false;
  }


  public showSearchSection() {
    this.errormessage = '';
    this.loaderenable = false;
    this.timelineView = false;
    this.SearchView = true;
    this.projectCode = undefined;
    this.searchFormControl = new FormControl('', [
      Validators.required,

    ]);
  }
}
