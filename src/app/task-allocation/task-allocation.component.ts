import { Component, OnInit, ViewChild, ApplicationRef, NgZone } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../Services/global.service';
import { ConstantsService } from '../Services/constants.service';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { TaskAllocationConstantsService } from './services/task-allocation-constants.service';
import { TimelineComponent } from './timeline/timeline.component';
import { CommonService } from '../Services/common.service';
import { SPOperationService } from '../Services/spoperation.service';
import { ResourcesComponent } from './resources/resources.component';
import { PlatformLocation, LocationStrategy } from '@angular/common';

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

  @ViewChild(TimelineComponent, { static: false }) timelineChild: TimelineComponent;
  @ViewChild(ResourcesComponent, { static: false }) resourcesComponentChild: ResourcesComponent;
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
    private router: Router, public spServices: SPOperationService,
    private sPOperationService: SPOperationService,
    public constants: ConstantsService,
    public globalObject: GlobalService,
    public taskAllocatinoService: TaskAllocationConstantsService,
    private commonService: CommonService,
    public taskAllocationService: TaskAllocationConstantsService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });

  }

  async ngOnInit() {
    this.globalObject.currentTitle = 'Task Allocation';
    await this.currentUserGroup();
    // tslint:disable-next-line: no-string-literal
    this.projectCode = this.route.snapshot.queryParams['ProjectCode'];
    if (this.projectCode !== undefined) {
      this.SearchView = false;
      this.getProjectDetails();
    }

  }

  /*****************************************************************
   Enable Search button & call api on enter click.
  *******************************************************************/
  async currentUserGroup() {

    this.commonService.SetNewrelic('TaskAllocation', 'task-allocation', 'CurrentUser');
    const currentUser = await this.sPOperationService.getUserInfo(this.globalObject.currentUser.userId);

    this.globalObject.currentUser.loggedInUserInfo = currentUser.Groups.results;

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
      this.commonService.SetNewrelic('TaskAllocation', 'task-allocation', 'getProjectDetails');
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
    const checkAccessCall = Object.assign({}, this.taskAllocationService.taskallocationComponent.checkAccess);
    checkAccessCall.filter = checkAccessCall.filter.replace(/{{code}}/gi, code);
    this.commonService.SetNewrelic('TaskAllocation', 'task-allocation', 'checkIfAccessAllowedToUser');
    const project = await this.spServices.readItems(this.constants.listNames.ProjectInformation.name, checkAccessCall);
    let arrayOperationResources;
    if (project.length > 0) {
      arrayOperationResources = project[0].AllOperationresources.results != null ? project[0].AllOperationresources.results : '';
      const operationalResouce = arrayOperationResources.length > 0 ? (arrayOperationResources.find
        (c => c.ID === this.globalObject.currentUser.userId) !== undefined ?
        arrayOperationResources.find(c => c.ID === this.globalObject.currentUser.userId) : '') : '';
      if (operationalResouce) {
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


  reloadResourceArray() {

    this.resourcesComponentChild.loadResources();
  }

  reloadTimelineData(){
    // this.getProjectDetails();
    setTimeout(() => {
      this.timelineChild.getMilestones(true);
    }, 100);
  }
}
