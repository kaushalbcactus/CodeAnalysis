import {
  Component, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, ViewContainerRef,
  ComponentFactoryResolver,
} from '@angular/core';
import { MenuItem, DialogService, MessageService } from 'primeng/api';
import { SPOperationService } from '../Services/spoperation.service';
import { GlobalService } from '../Services/global.service';
import { ConstantsService } from '../Services/constants.service';
import { MyDashboardConstantsService } from './services/my-dashboard-constants.service';
import { Router } from '@angular/router';
import { TimeBookingDialogComponent } from './time-booking-dialog/time-booking-dialog.component';
import { CreateTaskComponent } from './fte/create-task/create-task.component';
import { CommonService } from '../Services/common.service';

@Component({
  selector: 'app-my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrls: ['./my-dashboard.component.css'],

})
export class MyDashboardComponent implements OnInit {

  items: MenuItem[];
  activeItem: MenuItem;
  batchContents: any[];
  response: any[];

  firstload = true;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  isUserFTE = false;

  currentUserInfo: any;

  @ViewChild('createTaskcontainer', { read: ViewContainerRef, static: true }) createTaskcontainer: ViewContainerRef;

  constructor(
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private router: Router,
    public dialogService: DialogService,
    public messageService: MessageService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.items = [
      { label: 'My Open Tasks', routerLink: ['my-current-tasks'] },
      { label: 'My Timeline', routerLink: ['my-timeline'] },
      { label: 'My Projects', routerLink: ['my-projects'] },
      { label: 'My SOW', routerLink: ['my-sow'] },
      { label: 'My Completed Tasks', routerLink: ['my-completed-tasks'] },
      { label: 'Search Projects', routerLink: ['search-projects'] }
    ];
    this.GetCurrentUser();
  }

  async onActivate(componentRef) {
    if (this.firstload) {
      await this.executeCommonCalls();
    }
    if (this.router.url.includes('my-current-tasks') || this.router.url.includes('my-completed-tasks')) {
      this.myDashboardConstantsService.openTaskSelectedTab.event = 'Today';
      this.myDashboardConstantsService.openTaskSelectedTab.days = 0;
      componentRef.GetDatabyDateSelection('Today', 0);
    }
  }

  async GetCurrentUser() {

    this.commonService.SetNewrelic('MyDashboard', 'MyDashboard', 'GetCurrentUserDetails');
    const currentUser = await this.spServices.getUserInfo(this.sharedObject.currentUser.userId);
    this.sharedObject.currentUser.userId = currentUser.Id;
    this.sharedObject.currentUser.email = currentUser.Email;
    this.sharedObject.currentUser.title = currentUser.Title;
    this.currentUserInfo = currentUser;
  }
  // ********************************************************************************************************
  //  dialog for time booking
  // ********************************************************************************************************

  loadTimeBookingDialog() {

    const ref = this.dialogService.open(TimeBookingDialogComponent, {
      data: {
      },
      header: 'Time Booking',
      width: '100vw',
      height: '100vh',
      contentStyle: { height: '90vh', overflow: 'auto' },
      closable: false,
    });
    ref.onClose.subscribe(async (TimeBookingobjCount: any) => {
      if (TimeBookingobjCount > 0) {
        this.messageService.add({
          key: 'custom', severity: 'success', summary: 'Success Message',
          detail: 'Time booking updated successfully.'
        });
      }
    });
  }

  async executeCommonCalls() {

    this.commonService.SetNewrelic('MyDashboard', 'MyDashboard', 'GetCLERCPIPC');
    this.firstload = false;
    const batchUrl = [];
    // ****************************************************************************************************
    //  Get Client Legal Entities
    // ***************************************************************************************************
    const cleObj = Object.assign({}, this.queryConfig);
    cleObj.url = this.spServices.getReadURL(this.constants.listNames.ClientLegalEntity.name,
      this.myDashboardConstantsService.mydashboardComponent.ClientLegalEntitys);
    cleObj.listName = this.constants.listNames.ClientLegalEntity.name;
    cleObj.type = 'GET';
    batchUrl.push(cleObj);

    // ******************************************************************************************************
    //  Get All ResourceCategorization
    // ******************************************************************************************************
    const rcObj = Object.assign({}, this.queryConfig);
    rcObj.url = this.spServices.getReadURL(this.constants.listNames.ResourceCategorization.name,
      this.myDashboardConstantsService.mydashboardComponent.ResourceCategorization);
    rcObj.listName = this.constants.listNames.ResourceCategorization.name;
    rcObj.type = 'GET';
    batchUrl.push(rcObj);

    // *****************************************************************************************************
    //  Get All ProjectContacts
    // *****************************************************************************************************
    const prjContactsObj = Object.assign({}, this.queryConfig);
    prjContactsObj.url = this.spServices.getReadURL(this.constants.listNames.ProjectContacts.name,
      this.myDashboardConstantsService.mydashboardComponent.ProjectContacts);
    prjContactsObj.listName = this.constants.listNames.ProjectContacts.name;
    prjContactsObj.type = 'GET';
    batchUrl.push(prjContactsObj);

    // ******************************************************************************************************
    //  Get All ProjectInformation
    // ******************************************************************************************************
    const piObj = Object.assign({}, this.queryConfig);
    piObj.url = this.spServices.getReadURL(this.constants.listNames.ProjectInformation.name,
      this.myDashboardConstantsService.mydashboardComponent.ProjectInformations);
    piObj.listName = this.constants.listNames.ProjectInformation.name;
    piObj.type = 'GET';
    batchUrl.push(piObj);

    this.response = await this.spServices.executeBatch(batchUrl);
    this.sharedObject.DashboardData.ClientLegalEntity = this.response.length > 0 ? this.response[0].retItems : [];
    this.sharedObject.DashboardData.ResourceCategorization = this.response.length > 0 ? this.response[1].retItems : [];
    const currentUserResCat = this.sharedObject.DashboardData.ResourceCategorization.filter((item) =>
      item.UserName.ID === this.sharedObject.currentUser.userId);

    if (currentUserResCat.length) {
      this.isUserFTE = currentUserResCat[0].IsFTE && currentUserResCat[0].IsFTE === 'Yes' ? true : false;
      this.myDashboardConstantsService.mydashboardComponent.user.isUserFTE = this.isUserFTE;
    }
    console.log(this.isUserFTE);
    this.sharedObject.DashboardData.ProjectContacts = this.response.length > 0 ? this.response[2].retItems : [];
    this.sharedObject.DashboardData.ProjectCodes = this.response.length > 0 ? this.response[3].retItems : [];
  }

  createTask() {
    this.createTaskcontainer.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(CreateTaskComponent);
    const componentRef = this.createTaskcontainer.createComponent(factory);
    // componentRef.instance.events = this.selectedProject;
    componentRef.instance.formType = 'createTask';
    componentRef.instance.currentUserInfo = this.currentUserInfo;
    // this.ref = componentRef;
  }

}
