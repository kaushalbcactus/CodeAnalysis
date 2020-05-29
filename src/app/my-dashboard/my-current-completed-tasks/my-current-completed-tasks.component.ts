import {
  Component, OnInit, OnDestroy, 
  ViewChild, HostListener, ApplicationRef, NgZone,
} from '@angular/core';
import { MyDashboardConstantsService } from '../services/my-dashboard-constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { SelectItem, MenuItem, DialogService } from 'primeng';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CurrentCompletedTasksTableComponent } from '../current-completed-tasks-table/current-completed-tasks-table.component';


interface DateObj {
  label: string;
  value: string;
}

@Component({
  selector: 'app-my-current-completed-tasks',
  templateUrl: './my-current-completed-tasks.component.html',
  styleUrls: ['./my-current-completed-tasks.component.css'],
  providers: [DatePipe, MessageService],

})

export class MyCurrentCompletedTasksComponent implements OnInit, OnDestroy {


  @ViewChild('TasksTable', { static: false })
  TasksTable: CurrentCompletedTasksTableComponent;
  enableTableView: boolean=false;
  thenBlock: CurrentCompletedTasksTableComponent;
  constructor(
    public myDashboardConstantsService: MyDashboardConstantsService,
    private constants: ConstantsService,
    public sharedObject: GlobalService,
    private datePipe: DatePipe,
    private spServices: SPOperationService,
    private commonService: CommonService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    public dialogService: DialogService,
    public spOperations: SPOperationService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone,
  ) {

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    _router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });
    const obj = this.myDashboardConstantsService.openTaskSelectedTab;
    console.log(obj);

    this.subscription.add(this.myDashboardConstantsService.getOpenTaskTabValue().subscribe(data => {
      console.log('in subscription ', data);
      this.GetDatabyDateSelection(data.event, data.days);
    }));

  }

  // List of Subscribers
  private subscription: Subscription = new Subscription();

  selectedDueDate: DateObj;
  selectedStartDate: DateObj;

  public loderenable = false;



  showCalender: boolean;
  selectedDate: any;
  rangeDates: Date[];
 
 
  batchContents = new Array();
  public allTasks = [];
  response: any[];
  brands: SelectItem[];
  selectedStatus = 'Not Completed';
  loaderenable = true;
  display = false;
  tasks = [];

  timeSpentObject = { taskDay: null, taskHrs: null, taskMins: null };
  editor: any;
  currentTaskTimeSpent: any;
  dateArray = [];
  selectedTab: any;
  days: any;
  selectedUrl: string;
  TabName: any;
  displayComment: boolean;
  DocumentArray: any[];
  allDocuments: any;
  projectInfo: any;
  NextPreviousTask: any;
  Emailtemplate: any;
  currentUser: any;

  jcSubId: any;
  jcId: any;

  tempselectedDate: string;


  previousNextTaskChildRes: any = [];

  ngOnInit() {
  
    this.commonService.SetNewrelic('MyCurrentCompletedTask', this.route.snapshot.data.type, 'GetEmailTemplate');
    this.myDashboardConstantsService.getEmailTemplate();
  }


 

  // *****************************************************************************************
  // Get data by dates on button switch
  // *****************************************************************************************

  async GetDatabyDateSelection(event, days) {
    this.loaderenable = true;
    this.enableTableView = false;
    this.commonService.SetNewrelic('MyCurrentCompletedTask', this.route.snapshot.data.type, 'GetTasks');
    this.TabName = this.route.snapshot.data.type;
    this.days = days;
    this.selectedTab = event;
    this.selectedDate = days > 0 ? event + days : event;
    this.rangeDates = event === 'Custom' ? this.rangeDates : null;
    if (event === 'Custom' && this.rangeDates !== null) {
      this.allTasks = [];
      this.loaderenable = true;
      this.rangeDates[1] = this.rangeDates[1] === null ? this.rangeDates[0] : this.rangeDates[1];
      const dates = await this.myDashboardConstantsService.CalculateDatesDiffernce(event, days, this.rangeDates);
      this.getStatusFilterDropDownValue(this.TabName, dates);
    } else if (event !== 'Custom') {
      this.allTasks = [];
      this.loaderenable = true;
      const dates = await this.myDashboardConstantsService.CalculateDatesDiffernce(event, days,null);
      this.getStatusFilterDropDownValue(this.TabName, dates);
    }
    else{
      this.messageService.add({
        key: 'mydashboard', severity: 'error', summary: 'Error Message',
        detail: 'Please select proper dates for custom search'
      });
      this.loaderenable = false;
      this.enableTableView = true;
    }
  }


 




  // *********************************************************************************************************
  // Get Data based on date selected
  // *********************************************************************************************************

  async getStatusFilterDropDownValue(status, filterDates) {

    this.commonService.SetNewrelic('MyCurrentCompletedTask', status, 'GetTasks');
    const mytasks = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.MyTasks);
    mytasks.filter = mytasks.filter.replace(/{{userId}}/gi, this.sharedObject.currentUser.userId.toString());
    mytasks.filter += status === 'MyCompletedTask' ? mytasks.filterCompleted : mytasks.filterStatus;
    // mytasks.filter += mytasks.filterStatus;
    mytasks.filter += mytasks.filterDate.replace(/{{startDateString}}/gi, filterDates[0]).replace(/{{endDateString}}/gi, filterDates[1]);
    this.response = await this.spServices.readItems(this.constants.listNames.Schedules.name, mytasks);
    const res = this.response.length ? this.response : [];
    this.loaderenable = false;
    if (res.length > 0) {
      this.allTasks = res;
      this.enableTableView = true;
      this.thenBlock = this.TasksTable;
    } else if (this.allTasks.length === 0) {
      this.enableTableView = true;
      this.thenBlock = this.TasksTable;
    }
  }


  updateTableDetail(event){
    this.GetDatabyDateSelection(this.selectedTab, this.days);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
