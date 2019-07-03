import { Component, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, } from '@angular/core';
import { MenuItem, DialogService } from 'primeng/api';
import { SharepointoperationService } from '../Services/sharepoint-operation.service';
import { GlobalService } from '../Services/global.service';
import { ConstantsService } from '../Services/constants.service';
import { MyDashboardConstantsService } from './services/my-dashboard-constants.service';
import { Router } from '@angular/router';
import { TimeBookingDialogComponent } from './time-booking-dialog/time-booking-dialog.component';



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

  firstload: boolean = true;


  constructor(private constants: ConstantsService,
    public sharedObject: GlobalService,
    private spServices: SharepointoperationService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private router: Router,
    public dialogService: DialogService,
    // private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.items = [
      { label: 'My Current Tasks', icon: 'fa fa-fw fa-tasks', routerLink: ['my-current-tasks'] },
      { label: 'My Timeline', icon: 'fa fa-fw fa-line-chart', routerLink: ['my-timeline'] },
      { label: 'My Projects', icon: 'fa fa-fw fa-folder-open', routerLink: ['my-projects'] },
      { label: 'My SOW', icon: 'fa fa-fw fa-file-text-o', routerLink: ['my-sow'] },
      { label: 'My Completed Task', icon: 'fa fa-fw fa-list-alt', routerLink: ['my-completed-tasks'] },
      { label: 'Search Projects', icon: 'fa fa-fw fa-search', routerLink: ['search-projects'] }
    ];

    this.GetCurrentUser();
  }


  async onActivate(componentRef) {

    if (this.firstload) {

      await this.executeCommonCalls();
    }
    if (this.router.url.includes('my-current-tasks') || this.router.url.includes('my-completed-tasks')) {
      componentRef.GetDatabyDateSelection('Today', 0);
    }
  }

  async GetCurrentUser() {
    var currentUser = await this.spServices.getUserInfo(this.sharedObject.currentUser.id.toString());
    debugger;

    //currentUser = JSON.parse(currentUser);
    this.sharedObject.currentUser.id = currentUser.Id;
    this.sharedObject.currentUser.email = currentUser.Email;
    this.sharedObject.currentUser.title = currentUser.Title;
  }
  // *************************************************************************************************************************************
  //  dialog for time booking 
  // *************************************************************************************************************************************

  loadTimeBookingDialog() {

    const ref = this.dialogService.open(TimeBookingDialogComponent, {
      data: {

      },
      header: 'Time Booking',
      width: '100vw',
      height: '100vh',
      contentStyle: { "height": "90vh", "overflow": "auto" },
      closable: false,
    });
    ref.onClose.subscribe(async (TimeBookingobj: any) => {
      if (TimeBookingobj) {
      }

    });

  }

  async executeCommonCalls() {


    this.firstload = false;

    const batchGuid = this.spServices.generateUUID();
    this.batchContents = new Array();


    // **************************************************************************************************************************************
    //  Get Client Legal Entities
    // **************************************************************************************************************************************

    const clientLegalEntityUrl = this.spServices.getReadURL('' + this.constants.listNames.ClientLegalEntity.name + '', this.myDashboardConstantsService.mydashboardComponent.ClientLegalEntitys);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, clientLegalEntityUrl);

    // **************************************************************************************************************************************
    //  Get All ResourceCategorization
    // **************************************************************************************************************************************

    const resourceCategorizationUrl = this.spServices.getReadURL('' + this.constants.listNames.ResourceCategorization.name + '', this.myDashboardConstantsService.mydashboardComponent.ResourceCategorization);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, resourceCategorizationUrl);


    //**************************************************************************************************************************************

    //  Get All ProjectContacts
    // **************************************************************************************************************************************
    const projectContactsUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectContacts.name + '', this.myDashboardConstantsService.mydashboardComponent.ProjectContacts);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectContactsUrl);


    //**************************************************************************************************************************************

    //  Get All ProjectInformation
    // **************************************************************************************************************************************
    const projectInformationUrl = this.spServices.getReadURL('' + this.constants.listNames.ProjectInformation.name + '', this.myDashboardConstantsService.mydashboardComponent.ProjectInformations);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, projectInformationUrl);

    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.sharedObject.DashboardData.ClientLegalEntity = this.response[0];
    this.sharedObject.DashboardData.ResourceCategorization = this.response[1];
    this.sharedObject.DashboardData.ProjectContacts = this.response[2];
    this.sharedObject.DashboardData.ProjectCodes = this.response[3];

  }

}
