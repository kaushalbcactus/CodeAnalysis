import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CAConstantService } from '../caservices/caconstant.service';
import { GlobalService } from 'src/app/Services/global.service';
import { DialogService, MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CACommonService } from '../caservices/cacommon.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { CAGlobalService } from '../caservices/caglobal.service';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-unallocated-allocated-tasks',
  templateUrl: './unallocated-allocated-tasks.component.html',
  styleUrls: ['./unallocated-allocated-tasks.component.css'],
  providers: [UsercapacityComponent]
})
export class UnallocatedAllocatedTasksComponent implements OnInit {
  cols: any[];
  allTasks: any[];
  tempClick: any;
  multiselectClick: any;
  loaderenable = true;
  @ViewChild('taskTable', { static: true }) taskTable: Table;
  TableBlock: Table;
  taskMenu: MenuItem[];
  selectedTab: string;
  taskTitle = '';
  displayCommentenable: boolean;
  selectedButton: any;
  selectedUser: any;
  constructor(
    private spServices: SPOperationService,
    private globalConstant: ConstantsService,
    private caConstant: CAConstantService,
    public globalService: GlobalService,
    public caGlobal: CAGlobalService,
    public dialogService: DialogService,
    private caCommonService: CACommonService,
    private route: ActivatedRoute,
    private usercapacityComponent: UsercapacityComponent,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
  ) { }

  public caArrays = {
    ClientLegalEntity: [],
    ProjectCode: [],
    Milestone: [],
    Task: [],
    DeliveryType: [],
    Allocated: [],
    StartTime: [],
    EndTime: []
  };

  private scheduleList = this.globalConstant.listNames.Schedules.name;
  private resourceCategorizationList = this.globalConstant.listNames.ResourceCategorization.name;
  private projectInformationList = this.globalConstant.listNames.ProjectInformation.name;
  public allocatedHideLoader = false;
  public allocatedHideTable = true;
  public allocatedHideNoDataMessage = true;
  public userDetails;
  public resourceList = [];
  public projects = [];
  public schedulesItems = [];
  public selectOpened = false;
  public openedSelect;
  public openedTask;
  public currentAllocatedTask;
  public taskAssignedTo = false;
  completeTaskArray = [];

  displayedColumns: any[] = [
    { field: 'ClientLegalEntity', header: 'Client' },
    { field: 'ProjectCode', header: 'Project' },
    { field: 'Milestone', header: 'Milestone' },
    { field: 'Task', header: 'Task' },
    { field: 'DeliveryType', header: 'Deliverable' },
    { field: 'Allocated', header: 'Hrs' },
    { field: 'StartTime', header: 'Start Time' },
    { field: 'EndTime', header: 'End Time' }];

  filterColumns: any[] = [
    { field: 'clientName' },
    { field: 'projectCode' },
    { field: 'projectName' },
    { field: 'milestone' },
    { field: 'taskName' },
    { field: 'deliveryType' },
    { field: 'estimatedTime' },
    { field: 'startDateText' },
    { field: 'dueDateText' },
    { field: 'nextTaskStartDateText' },
    { field: 'lastTaskEndDateText' },
    { field: 'sendToClientDateText' },
    { field: 'assignedTo' }
  ];
  ngOnInit() {
    this.caGlobal.loading = true;
    this.caGlobal.totalRecords = 0;
    this.selectedTab = this.route.snapshot.data.type;
    setTimeout(() => {
      this.getProperties();
    }, 100);

  }

  // ****************************************************************************************************
  // Get Data based on tab selection
  // *****************************************************************************************************


  private async getProperties() {

    this.loaderenable = true;
    const taskCounter = 0;
    this.caGlobal.loading = true;
    const schedulesItemFetch = [];
    this.caGlobal.dataSource = [];
    this.completeTaskArray = [];
    this.caGlobal.totalRecords = 0;
    const acTempArrays = {
      clientLegalEntityTempArray: [],
      projectCodeTempArray: [],
      milestoneTempArray: [],
      taskTempArray: [],
      deliveryTypeTempArray: [],
      allocatedTempArray: [],
      startTimeTempArray: [],
      endTimeTempArray: []
    };
    const mainQuery = this.selectedTab === 'allocated' ?
      Object.assign({}, this.caConstant.scheduleAllocatedQueryOptions) : Object.assign({}, this.caConstant.scheduleQueryOptions);

    const arrResults = await this.caCommonService.getItems(mainQuery);
    this.resourceList = arrResults[0];
    this.projects = arrResults[1];
    this.schedulesItems = arrResults[2];
    if (this.schedulesItems && this.schedulesItems.length) {
      for (const task of this.schedulesItems) {
        this.caCommonService.getCaProperties(taskCounter, schedulesItemFetch, task, this.projects, this.resourceList, this.completeTaskArray, acTempArrays);
      }

      this.caCommonService.getScheduleItems(schedulesItemFetch, this.completeTaskArray);
      this.caArrays.ClientLegalEntity = this.caCommonService.sortByAttribute(this.commonService.unique(acTempArrays.clientLegalEntityTempArray, 'value'), 'value', 'label');
      this.caArrays.ProjectCode = this.caCommonService.sortByAttribute(this.commonService.unique(acTempArrays.projectCodeTempArray, 'value'), 'value', 'label');
      this.caArrays.Milestone = this.caCommonService.sortByAttribute(this.commonService.unique(acTempArrays.milestoneTempArray, 'value'), 'value', 'label');
      this.caArrays.Task = this.caCommonService.sortByAttribute(this.commonService.unique(acTempArrays.taskTempArray, 'value'), 'value', 'label');
      this.caArrays.DeliveryType = this.caCommonService.sortByAttribute(this.commonService.unique(acTempArrays.deliveryTypeTempArray, 'value'), 'value', 'label');
      this.caArrays.Allocated = this.caCommonService.sortByAttribute(this.commonService.unique(acTempArrays.allocatedTempArray, 'value'), 'value', 'label');
      this.caArrays.StartTime = this.caCommonService.sortByDate(this.commonService.unique(acTempArrays.startTimeTempArray, 'value'), 'value');
      this.caArrays.EndTime = this.caCommonService.sortByDate(this.commonService.unique(acTempArrays.endTimeTempArray, 'value'), 'value');

      this.caGlobal.totalRecords = this.completeTaskArray.length;
      this.caGlobal.dataSource = this.completeTaskArray.slice(0, 30);
      if (this.selectedTab !== 'allocated') {
        this.caGlobal.dataSource.map(c => c.allocatedResource = null);
      }

    }
    this.caGlobal.loading = false;
    this.loaderenable = false;
  }

  createColFieldValues(acTempArrays) {
    this.caArrays.ClientLegalEntity = this.caCommonService.sortByAttribute(this.caCommonService.unique(acTempArrays.clientLegalEntityTempArray, 'value'), 'value', 'label');
    this.caArrays.ProjectCode = this.caCommonService.sortByAttribute(this.caCommonService.unique(acTempArrays.projectCodeTempArray, 'value'), 'value', 'label');
    this.caArrays.Milestone = this.caCommonService.sortByAttribute(this.caCommonService.unique(acTempArrays.milestoneTempArray, 'value'), 'value', 'label');
    this.caArrays.Task = this.caCommonService.sortByAttribute(this.caCommonService.unique(acTempArrays.taskTempArray, 'value'), 'value', 'label');
    this.caArrays.DeliveryType = this.caCommonService.sortByAttribute(this.caCommonService.unique(acTempArrays.deliveryTypeTempArray, 'value'), 'value', 'label');
    this.caArrays.Allocated = this.caCommonService.sortByAttribute(this.caCommonService.unique(acTempArrays.allocatedTempArray, 'value'), 'value', 'label');
    this.caArrays.StartTime = this.caCommonService.sortByDate(this.caCommonService.unique(acTempArrays.startTimeTempArray, 'value'), 'value');
    this.caArrays.EndTime = this.caCommonService.sortByDate(this.caCommonService.unique(acTempArrays.endTimeTempArray, 'value'), 'value');
    // this.caArrays.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
    // this.caArrays.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
    // this.caArrays.Milestone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
    // this.caArrays.Task = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
    // this.caArrays.DeliveryType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaType, value: a.ProformaType }; return b; }).filter(ele => ele.label)));
    // this.caArrays.Allocated = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
    // this.caArrays.StartTime = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
    // this.caArrays.EndTime = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));

    // this.proformaColArray.ProformaNumber = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
    // this.proformaColArray.PONumber = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
    // const proformaDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ProformaDate, "MMM dd, yyyy"), value: a.ProformaDate }; return b; }).filter(ele => ele.label)));
    // this.proformaColArray.ProformaDate = proformaDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
    // this.proformaColArray.ProformaType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaType, value: a.ProformaType }; return b; }).filter(ele => ele.label)));
    // this.proformaColArray.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
    // const amount = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
    // this.proformaColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label')
    // this.proformaColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
    // this.proformaColArray.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      }
    })
  }

  lazyLoadTask(event) {
    this.caCommonService.lazyLoadTask(event, this.completeTaskArray, this.filterColumns);
  }

  // ****************************************************************************************************
  // show menu option of task on 3 dots
  // *****************************************************************************************************


  openPopup(data) {
    if (this.selectedTab === 'allocated') {
      if (data.isEditEnabled) {
        this.taskMenu = [
          { label: 'Edit Assgined To', icon: 'pi pi-fwpi pi-pencil', command: (e) => this.enabledAllocateSelect(data) },
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }

        ];
      } else {
        this.taskMenu = [
          { label: 'Cancel Assgined To', icon: 'pi pi-fw pi-times', command: (e) => this.cancelledAllocatedSelect(data) },
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }

        ];
      }
    } else {
      if (data.task !== 'QC' && data.task !== 'Edit' && data.task !== 'Graphics') {
        this.taskMenu = [
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) },
          { label: 'Delete Task', icon: 'pi pi-fw pi-trash', command: (e) => this.deleteTask(data, 'unallocatedTable') }
        ];
      } else {
        this.taskMenu = [
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }
        ];
      }
    }

  }

  // ****************************************************************************************************
  // Enable Edit to reselect User on Allocated task
  // *****************************************************************************************************

  enabledAllocateSelect(task) {
    task.isAllocatedSelectHidden = false;
    task.isAssignedToHidden = true;
    task.isEditEnabled = false;
    task.editImageUrl = this.globalService.imageSrcURL.cancelImageURL;
    task.allocatedResource = null;
  }

  // ****************************************************************************************************
  // Cancel  Edit to reselect User on Allocated task
  // *****************************************************************************************************

  cancelledAllocatedSelect(task) {
    task.isAllocatedSelectHidden = true;
    task.isAssignedToHidden = false;
    task.isEditEnabled = true;
    task.editImageUrl = this.globalService.imageSrcURL.editImageURL;
  }

  getAllocateTaskScope(task) {

    this.displayCommentenable = true;
    this.taskTitle = task.title;
    const index = this.completeTaskArray.findIndex(item => item.id === task.id);
    this.caGlobal.taskScope = this.completeTaskArray[index].taskScope ? this.completeTaskArray[index].taskScope : '';
    this.caGlobal.taskPreviousComment = this.completeTaskArray[index].prevTaskComments ?
      this.completeTaskArray[index].prevTaskComments : '';
    this.caGlobal.curTaskScope = this.completeTaskArray[index];

  }
  // ****************************************************************************************************
  // Save Task Scope
  // *****************************************************************************************************


  saveTaskScope(task, comments) {

    this.messageService.add({
      key: 'tc', severity: 'warn', sticky: true,
      summary: 'Info Message', detail: 'updating...'
    });
    this.caCommonService.saveTaskScopeComments(task, comments);

    setTimeout(() => {
      this.getProperties();
      this.messageService.clear('tc');
      this.messageService.add({
        severity: 'success', summary: 'Success Message',
        detail: 'The comments - ' + comments + ' has saved Successfully'
      });
    }, 400);
  }
  onClear(task) {
    task.allocatedResource = null;
  }


  // ****************************************************************************************************
  //  fetch resources on select resource feild
  // *****************************************************************************************************

  fetchResources(task) {
    if (!this.selectOpened) {
      this.messageService.add({
        key: 'tc', severity: 'warn', sticky: true,
        summary: 'Info Message', detail: 'Fetching available resources...'
      });
      setTimeout(async () => {
        const setResourcesExtn = $.extend(true, [], task.resources);
        const startTime = new Date(new Date(task.startTime).setHours(0, 0, 0, 0));
        const endTime = new Date(new Date(task.endTime).setHours(23, 59, 59, 0));
        const oCapacity = await this.usercapacityComponent.applyFilterReturn(startTime, endTime,
          setResourcesExtn);
        task.capacity = oCapacity;
        const setResources = $.extend(true, [], task.resources);
        for (const resource of setResources) {
          const retResource = oCapacity.arrUserDetails.filter(user => user.uid === resource.UserName.ID);
          this.setColorCode(retResource, resource, task);
          const dispTime = parseFloat(retResource[0].displayTotalUnAllocated.replace(':', '.'));
          resource.taskDetails = retResource[0];
          resource.timeAvailable = dispTime;
        }
        task.selectedResources = [];
        task.displayselectedResources = [];
        const res = this.commonService.sortResources(setResources, task);
        const resExtn = $.extend(true, [], res);

        if (resExtn) {
          const UniqueUserType = resExtn.map(c => c.userType).filter((item, index) => resExtn.map(c => c.userType).indexOf(item) === index);


          for (const retRes of UniqueUserType) {

            const Users = resExtn.filter(c => c.userType === retRes);
            const Items = [];
            Users.forEach(user => {
              Items.push({ label: user.UserName.Title + ' (' + user.timeAvailable + ') ', value: user }
              );
              task.selectedResources.push(user);
            });

            task.displayselectedResources.push({ label: retRes, items: Items });
          }
        }
        this.messageService.clear();
        if (this.selectedUser) {
          this.selectedButton = Array.from(document.querySelectorAll('li'))
            .find(el => el.textContent.indexOf(this.selectedUser.UserName.Title) > -1);
          if (this.selectedButton) {
            this.selectedButton.scrollIntoViewIfNeeded();
            this.selectedButton = null;
          }
          this.selectedUser = null;
        }
      }, 500);
    }
  }


  // ****************************************************************************************************
  //  Set color to user name on user capacity dropdown
  // *****************************************************************************************************

  setColorCode(retResource, res, task) {
    const retRes = retResource[0];
    const retTask = retRes.tasks.filter((tsk) => {
      return (task.startDate <= tsk.DueDate && task.dueDate >= tsk.DueDate)
        || (task.startDate <= tsk.StartDate && task.dueDate >= tsk.StartDate)
        || (task.startDate >= tsk.StartDate && task.dueDate <= tsk.DueDate);
    });
    if (retTask.length) {
      res.Color = '#D7181F';
    } else {
      res.Color = 'green';
    }
  }

  // ****************************************************************************************************
  // show user capacity on user selection
  // *****************************************************************************************************


  async showCapacityPopup(task, item, allocateResource, selectedButton) {

    const startTime = new Date(new Date(task.startTime).setHours(0, 0, 0, 0));
    let endDate = new Date(new Date(task.endTime).setDate(new Date(task.endTime).getDate() + 2));
    if (endDate.getDay() === 6 || endDate.getDay() === 0) {
      endDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 2));
    }
    const endTime = new Date(new Date(endDate).setHours(23, 59, 59, 0));
    this.selectOpened = true;

    const ref = this.dialogService.open(UsercapacityComponent, {
      data: {
        task,
        startTime,
        endTime,
        item,

      },
      width: '90vw',
      header: task.title,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
    });
    // tslint:disable-next-line: no-shadowed-variable
    ref.onClose.subscribe((task: any) => {


      this.messageService.add({
        severity: 'info', summary: 'Info Message',
        detail: 'Please wait..'
      });
      this.selectedUser = item;
      this.openedTask.allocatedResource = '';
      this.messageService.clear();
      this.openedSelect.show();
      this.selectOpened = false;
    });

    this.openedSelect = allocateResource;
    task.allocatedResource = '';
    this.openedTask = task;
  }

  // ****************************************************************************************************
  // Save Task
  // *****************************************************************************************************


  async saveTask(task, unt) {
    if (!this.selectOpened && task.allocatedResource !== '') {
      if (!this.selectOpened && task.allocatedResource) {
        const currentScheduleTask = await this.spServices.readItem(this.scheduleList, task.id);
        if (currentScheduleTask) {
          if (new Date(task.startDate).getTime() === new Date(currentScheduleTask.StartDate).getTime() &&
            new Date(task.dueDate).getTime() === new Date(currentScheduleTask.DueDate).getTime()) {
            const indexRes = this.resourceList.findIndex(item => item.UserName.ID === task.allocatedResource.UserName.ID);
            let resourceTimeZone = this.resourceList[indexRes].TimeZone.Title;
            resourceTimeZone = resourceTimeZone ? resourceTimeZone : '5.5';
            if (parseFloat(task.timezone) === parseFloat(resourceTimeZone)) {
              this.messageService.add({
                severity: 'info', summary: 'Info Message',
                detail: 'Updating Task..'
              });
              setTimeout(() => {
                this.completeEqualTask(task, unt, false);
              }, 500);
            } else {
              const newStartTime = this.caCommonService.calcTimeForDifferentTimeZone(task.startDate, task.timezone, resourceTimeZone);
              const newEndTime = this.caCommonService.calcTimeForDifferentTimeZone(task.dueDate, task.timezone, resourceTimeZone);
              // tslint:disable-next-line: quotemark
              if (window.confirm("Task '" + task.title + "' will be allocated to " + this.resourceList
              // tslint:disable-next-line: max-line-length
              [indexRes].UserName.Title + 'from' + this.datePipe.transform(newStartTime, 'MMM dd yyyy hh:mm:ss aa') + ' to ' + this.datePipe.transform(newEndTime, 'MMM dd yyyy hh:mm:ss aa') + ' in his/her timezone. Do you want to continue ?')) {
                this.messageService.add({
                  severity: 'info', summary: 'Info Message',
                  detail: 'Updating Task..'
                });
                task.newStartDate = newStartTime;
                task.newDueDate = newEndTime;
                task.userTimeZone = resourceTimeZone;
                setTimeout(() => {
                  this.completeEqualTask(task, unt, true);
                }, 500);
              } else {
                this.onClear(task);
              }
            }
          } else {
            this.messageService.add({
              severity: 'info', summary: 'Info Message',
              detail: 'Start and EndDate is not matched for this ' + task.title + '. Hence page is refreshed in 30 sec.'
            });
            setTimeout(() => {
              location.reload();
            }, 3000);
          }
        }
      }
    }
  }
  // tslint:disable

  // ****************************************************************************************************
  //  Complete Task
  // *****************************************************************************************************


  async completeEqualTask(task, unt, istimeZoneUpdate) {
    // tslint:disable-next-line: object-literal-key-quotes
    const options = { 'AssignedToId': task.allocatedResource.UserName.ID, 'CentralAllocationDone': 'Yes' };
    // tslint:disable-next-line: object-literal-key-quotes
    const timezoneOptions = { 'AssignedToId': task.allocatedResource.UserName.ID, 'CentralAllocationDone': 'Yes', 'TimeZone': task.userTimeZone };
    //// Save task and remove task from list 
    if (istimeZoneUpdate) {
      await this.spServices.updateItem(this.scheduleList, task.id, timezoneOptions, this.globalConstant.listNames.Schedules.type)
      // this.spServices.update(this.scheduleList, task.id, timezoneOptions, 'SP.Data.SchedulesListItem');
    } else {
      await this.spServices.updateItem(this.scheduleList, task.id, options, this.globalConstant.listNames.Schedules.type)
      // this.spServices.update(this.scheduleList, task.id, options, 'SP.Data.SchedulesListItem');
    }

    await this.commonService.ResourceAllocation(task, this.projectInformationList);
    const indexRes = this.resourceList.findIndex(item => item.UserName.ID === task.allocatedResource.UserName.ID);
    const mailSubject = task.projectCode + '(' + task.projectName + ')' + ': Task created';
    const objEmailBody = [];
    objEmailBody.push({
      'key': '@@Val3@@',
      'value': this.resourceList[indexRes].UserName.Title
    });
    objEmailBody.push({
      'key': '@@Val1@@', // Project Code
      'value': task.projectCode
    });
    objEmailBody.push({
      'key': '@@Val2@@', // Task Name
      'value': task.SubMilestones && task.SubMilestones !== 'Default' ? task.title + ' - ' + task.SubMilestones : task.title
    });
    objEmailBody.push({
      'key': '@@Val4@@', // Task Type
      'value': task.task
    });
    objEmailBody.push({
      'key': '@@Val5@@', // Milestone
      'value': task.milestone
    });
    if (istimeZoneUpdate) {
      objEmailBody.push({
        'key': '@@Val6@@', // new Start Date
        'value': this.datePipe.transform(task.newStartDate, 'MMM dd yyyy hh:mm:ss aa')
      });
      objEmailBody.push({
        'key': '@@Val7@@', // new End Date
        'value': this.datePipe.transform(task.newDueDate, 'MMM dd yyyy hh:mm:ss aa')
      });
    } else {
      objEmailBody.push({
        'key': '@@Val6@@', // Start Date
        'value': this.datePipe.transform(task.startDate, 'MMM dd yyyy hh:mm:ss aa')
      });
      objEmailBody.push({
        'key': '@@Val7@@', // End Date
        'value': this.datePipe.transform(task.dueDate, 'MMM dd yyyy hh:mm:ss aa')
      });
    }
    objEmailBody.push({
      'key': '@@Val9@@', // Scope
      'value': task.taskScope ? task.taskScope : ''
    });
    //// Send allocation email
    this.caCommonService.triggerMail(this.resourceList[indexRes].UserName.EMail, this.globalService.currentUser.email,
      '', 'TaskCreation', objEmailBody, mailSubject);

    this.messageService.add({
      severity: 'success', summary: 'Success Message',
      detail: task.title + ' allocated to ' + this.resourceList[indexRes].UserName.Title
    });
    const index = this.completeTaskArray.findIndex(item => item.id === task.id);
    // this.completeTaskArray.splice(index,1);
    if (this.selectedTab === 'allocated') {
      this.completeTaskArray[index].isEditEnabled = true;
      this.completeTaskArray[index].assignedTo = this.resourceList[indexRes].UserName.Title;
      this.completeTaskArray[index].isAllocatedSelectHidden = true;
      this.completeTaskArray[index].isAssignedToHidden = false;
      this.completeTaskArray[index].editImageUrl = this.globalService.imageSrcURL.editImageURL;
    } else {
      this.completeTaskArray.splice(index, 1);
      this.caGlobal.loading = true;
    }
    if (unt) {
      this.caGlobal.loading = true;
      this.caCommonService.filterAction(unt.sortField, unt.sortOrder, unt.filters.hasOwnProperty('global') ?
        unt.filters.global.value : null, unt.filters, unt.first, unt.rows,
        this.completeTaskArray, this.filterColumns);
    }
  }


  // ****************************************************************************************************
  // Delete Task 
  // *****************************************************************************************************


  async deleteTask(task, unt) {

    this.confirmationService.confirm({
      message: 'Do you want to delete this task?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.messageService.add({
          key: 'tc', severity: 'warn', sticky: true,
          summary: 'Info Message', detail: 'Deleting Task...'
        });
        setTimeout(() => {
          const nextTasks = [];
          task.mileStoneTask.forEach(milTask => {
            let taskArr = [];
            taskArr = milTask.PrevTasks ? milTask.PrevTasks.split(";#") : [];
            if (taskArr.indexOf(task.title) > -1) {
              nextTasks.push(milTask);
            }
          });
          const prevTasks = [];
          task.mileStoneTask.forEach(milTask => {
            let taskArr = [];
            taskArr = milTask.NextTasks ? milTask.NextTasks.split(";#") : [];
            if (taskArr.indexOf(task.title) > -1) {
              prevTasks.push(milTask);
            }
          });
          //  this.performDelete(task, nextTasks, prevTasks, unt);
          this.messageService.clear('tc');
        }, 500);
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn', sticky: true,
          summary: 'Info Message', detail: 'You have rejected'
        });
      }
    });
  }


  // ****************************************************************************************************
  // This method will update the scheduled list which status Deleted.
  // This method will also updates the Next and previous task.
  // *****************************************************************************************************

  async performDelete(task, nextTasks, prevTasks, unt) {
    if (task) {
      const options = { 'NextTasks': '', 'PrevTasks': '', 'Status': 'Deleted' }
      await this.spServices.updateItem(this.scheduleList, task.id, options, this.globalConstant.listNames.Schedules.type);
    }
    if (prevTasks) {
      for (const tempTask of prevTasks) {
        let sUpdateVal = tempTask.NextTasks ? tempTask.NextTasks.replace(task.title, task.NextTasks) : '';
        sUpdateVal = this.caCommonService.getUniqueValues(sUpdateVal, ";#");
        const options = { 'NextTasks': sUpdateVal }
        await this.spServices.updateItem(this.scheduleList, tempTask.Id, options, this.globalConstant.listNames.Schedules.type);
      }
    }
    if (nextTasks) {
      for (const tempTask of nextTasks) {
        let sUpdateVal = tempTask.PrevTasks ? tempTask.PrevTasks.replace(task.title, task.PrevTasks) : '';
        sUpdateVal = this.caCommonService.getUniqueValues(sUpdateVal, ";#");
        const options = { 'PrevTasks': sUpdateVal }
        await this.spServices.updateItem(this.scheduleList, tempTask.Id, options, this.globalConstant.listNames.Schedules.type);
      }
    }

    this.messageService.add({
      severity: 'success', summary: 'Success Message',
      detail: task.title + ' deleted Sucessfully '
    });

    const index = this.completeTaskArray.findIndex(item => item.id === task.id);
    this.completeTaskArray.splice(index, 1);
    let tempTaskArray = [];
    const queryObj = {
      projectCode: task.projectCode,
      milestone: task.milestone
    }
    tempTaskArray.push(queryObj);
    const arrMilestoneTasks = await this.caCommonService.getMilestoneSchedules(this.scheduleList, tempTaskArray);
    for (const compTask of this.completeTaskArray) {
      const index = arrMilestoneTasks[0].MilestoneTasks.findIndex(item => item.ID === compTask.id);
      if (index > -1) {
        compTask.PrevTasks = arrMilestoneTasks[0].MilestoneTasks[index].PrevTasks ? arrMilestoneTasks[0].MilestoneTasks[index].PrevTasks : '';
        compTask.NextTasks = arrMilestoneTasks[0].MilestoneTasks[index].NextTasks ? arrMilestoneTasks[0].MilestoneTasks[index].NextTasks : '';
      }
      this.caCommonService.getMiscDates(compTask, arrMilestoneTasks);
    }
    this.caCommonService.filterAction(unt.sortField, unt.sortOrder, unt.filters.hasOwnProperty("global") ? unt.filters.global.value : null, unt.filters, unt.first, unt.rows
      , this.completeTaskArray, this.filterColumns);
  }
  // tslint:enable
  // ****************************************************************************************************
  // hide popup menu on production
  // *****************************************************************************************************

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === 'pi pi-ellipsis-v') {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = '';
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = '';
      }

    } else {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        this.tempClick = undefined;
      }
    }
  }


  // @HostListener('document:click', ['$event'])
  // clickoutmultiselect(event) {
  //   debugger;
  //   if (event.target.className === 'ui-multiselect-label ui-corner-all') {
  //     if (this.multiselectClick) {
  //       this.multiselectClick.style.display = 'none';
  //       if (this.multiselectClick !== event.target.parentElement.parentElement.children[3]) {
  //         this.multiselectClick = event.target.parentElement.parentElement.children[3];
  //         this.multiselectClick.style.display = '';
  //       } else {
  //         this.multiselectClick = undefined;
  //       }
  //     } else {
  //       this.multiselectClick = event.target.parentElement.parentElement.children[3];
  //       this.multiselectClick.style.display = '';
  //     }

  //   } else {
  //     if (this.multiselectClick) {
  //       this.multiselectClick.style.display = 'none';
  //       this.multiselectClick = undefined;
  //     }
  //   }
  // }

  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  // ngAfterViewChecked() {
  //   if (this.caGlobal.dataSource.length && this.isOptionFilter) {
  //     let obj = {
  //       tableData: this.taskTable,
  //       colFields: this.caArrays
  //     }
  //     if (obj.tableData.filteredValue) {
  //       this.commonService.updateOptionValues(obj);
  //     } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
  //       this.createColFieldValues(obj.tableData.value);
  //       this.isOptionFilter = false;
  //     }
  //     this.cdr.detectChanges();
  //   }
  // }
}
