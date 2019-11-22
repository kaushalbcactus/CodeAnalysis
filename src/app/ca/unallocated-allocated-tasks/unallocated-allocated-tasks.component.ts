import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CAConstantService } from '../caservices/caconstant.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CACommonService } from '../caservices/cacommon.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { CAGlobalService } from '../caservices/caglobal.service';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { DialogService, ConfirmationService, MessageService, MenuItem, SelectItem } from 'primeng/primeng';
import { CaDragdropComponent } from '../ca-dragdrop/ca-dragdrop.component';
import { async } from '@angular/core/testing';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';

@Component({
  selector: 'app-unallocated-allocated-tasks',
  templateUrl: './unallocated-allocated-tasks.component.html',
  styleUrls: ['./unallocated-allocated-tasks.component.css'],
  //   animations: [
  //     trigger('rowExpansionTrigger', [
  //         state('void', style({
  //             transform: 'translateX(-10%)',
  //             opacity: 0
  //         })),
  //         state('active', style({
  //             transform: 'translateX(0)',
  //             opacity: 1
  //         })),
  //         transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
  //     ])
  // ],
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
  selectedTab = 'unallocated';
  taskTitle = '';
  displayCommentenable: boolean;
  selectedButton: any;
  selectedUser: any;
  modalloaderenable: boolean;
  loderenable: boolean;
  DropdownOptions: SelectItem[];
  disableSave = true;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  darkTheme: NgxMaterialTimepickerTheme = {
    container: {
      bodyBackgroundColor: '#424242',
      buttonColor: '#fff'
    },
    dial: {
      dialBackgroundColor: '#555',
    },
    clockFace: {
      clockFaceBackgroundColor: '#555',
      clockHandColor: '#C53E3E ',
      clockFaceTimeInactiveColor: '#fff'
    }
  };
  response: any[];
  SlotTasks: any;
  allConstantTasks: any[];
  expandedRows: any = {};
  storeTask: any;
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
    public datepipe: DatePipe,
  ) {
    this.DropdownOptions = [{ label: 'All', value: 'All' },
    { label: 'Unallocated', value: 'unallocated' },
    { label: 'Allocated', value: 'allocated' }];
  }

  public caArrays = {
    clientLegalEntityArray: [],
    projectCodeArray: [],
    milestoneArray: [],
    taskArray: [],
    deliveryTypeArray: [],
    allocatedArray: [],
    startTimeArray: [],
    endTimeArray: []
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
  public dbRecords = [];
  public openedSelect;
  public openedTask;
  public currentAllocatedTask;
  public taskAssignedTo = false;
  completeTaskArray = [];
  subTaskloaderenable = false;
  displayedColumns: any[] = [
    { field: 'clientName', header: 'Client' },
    { field: 'projectCode', header: 'Project' },
    { field: 'milestone', header: 'Milestone' },
    { field: 'taskName', header: 'Task' },
    { field: 'deliveryType', header: 'Deliverable' },
    { field: 'estimatedTime', header: 'Hrs' },
    { field: 'startDateText', header: 'Start Time' },
    { field: 'dueDateText', header: 'End Time' }];

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
    this.modalloaderenable = false;
    this.loderenable = false;
    setTimeout(async () => {
      await this.getProperties();
    }, 100);

    this.globalService.currentUser.timeZone = this.commonService.getCurrentUserTimeZone();

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
      Object.assign({}, this.caConstant.scheduleAllocatedQueryOptions) : this.selectedTab === 'unallocated' ?
        Object.assign({}, this.caConstant.scheduleUnAllocatedQueryOptions) : Object.assign({}, this.caConstant.scheduleQueryOptions);

    const arrResults = await this.caCommonService.getItems(mainQuery);
    this.resourceList = arrResults[0];
    this.projects = arrResults[1];
    this.schedulesItems = arrResults[2];

    if (this.schedulesItems && this.schedulesItems.length) {
      for (const task of this.schedulesItems) {
        this.caCommonService.getCaProperties(taskCounter, schedulesItemFetch, task, this.projects,
          this.resourceList, this.completeTaskArray, acTempArrays);
      }

      this.caCommonService.getScheduleItems(schedulesItemFetch, this.completeTaskArray);
      this.caArrays.clientLegalEntityArray = this.caCommonService.sortByAttribute(this.commonService.unique
        (acTempArrays.clientLegalEntityTempArray, 'value'), 'value', 'label');
      this.caArrays.projectCodeArray = this.caCommonService.sortByAttribute(this.commonService.unique
        (acTempArrays.projectCodeTempArray, 'value'), 'value', 'label');
      this.caArrays.milestoneArray = this.caCommonService.sortByAttribute(this.commonService.unique
        (acTempArrays.milestoneTempArray, 'value'), 'value', 'label');
      this.caArrays.taskArray = this.caCommonService.sortByAttribute(this.commonService.unique
        (acTempArrays.taskTempArray, 'value'), 'value', 'label');
      this.caArrays.deliveryTypeArray = this.caCommonService.sortByAttribute(this.commonService.unique
        (acTempArrays.deliveryTypeTempArray, 'value'), 'value', 'label');
      this.caArrays.allocatedArray = this.caCommonService.sortByAttribute(this.commonService.unique
        (acTempArrays.allocatedTempArray, 'value'), 'value', 'label');
      this.caArrays.startTimeArray = this.caCommonService.sortByDate(this.commonService.unique
        (acTempArrays.startTimeTempArray, 'value'), 'value');
      this.caArrays.endTimeArray = this.caCommonService.sortByDate(this.commonService.unique
        (acTempArrays.endTimeTempArray, 'value'), 'value');
      this.caGlobal.totalRecords = this.completeTaskArray.length;
      this.caGlobal.dataSource = this.completeTaskArray.slice(0, 30);
      if (this.selectedTab !== 'allocated') {
        this.caGlobal.dataSource.map(c => c.allocatedResource = null);
      }

      this.dbRecords = JSON.parse(JSON.stringify(this.caGlobal.dataSource));
    }
    this.caGlobal.loading = false;
    this.loaderenable = false;
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    });
  }

  lazyLoadTask(event) {
    this.caCommonService.lazyLoadTask(event, this.completeTaskArray, this.filterColumns);
  }

  // ****************************************************************************************************
  // show menu option of task on 3 dots
  // *****************************************************************************************************


  openPopup(data) {
    console.log(data);
    if (data.Type === 'Slot') {
      if (data.editMode) {
        this.taskMenu = [
          { label: 'Restructure', icon: 'pi pi-sitemap', command: (e) => this.showRestructureCA(data) },
          { label: 'Cancel Changes', icon: 'pi pi-fw pi-times', command: (e) => this.cancelledAllchanges(data) },
        ];
      } else {

        this.taskMenu = [
          { label: 'Restructure', icon: 'pi pi-sitemap', command: (e) => this.showRestructureCA(data) }
        ];
      }
    } else {
      if (data.editMode) {
        this.taskMenu = [
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }
        ];
      } else {
        this.taskMenu = [
          { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editTask(data) },
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }
        ];
      }
    }
    // if (data.CentralAllocationDone === 'No') {
    //   if (data.isEditEnabled) {
    //     this.taskMenu = [
    //       // { label: 'Edit Assgined To', icon: 'pi pi-fwpi pi-pencil', command: (e) => this.enabledAllocateSelect(data) },
    //       // { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }
    //       { label: 'Restructure', icon: 'pi pi-sitemap', command: (e) => this.showRestructureCA(data) },
    //     ];
    //   } else {
    //     this.taskMenu = [
    //       { label: 'Cancel Assgined To', icon: 'pi pi-fw pi-times', command: (e) => this.cancelledAllocatedSelect(data) },
    //       { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }

    //     ];
    //   }
    // } else if (data.CentralAllocationDone === 'Yes') {
    //   if (data.task !== 'QC' && data.task !== 'Edit' && data.task !== 'Graphics') {
    //     this.taskMenu = [
    //       { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) },
    //       { label: 'Delete Task', icon: 'pi pi-fw pi-trash', command: (e) => this.deleteTask(data, this.taskTable) }
    //     ];
    //   } else {
    //     this.taskMenu = [
    //       { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data) }
    //     ];
    //   }
    // }
  }


  editTask(data) {
    data.editMode = true;
  }


  cancelledAllchanges(data) {

    delete data.SlotTasks;
    this.expandedRows[data.id] = false;
    data.editMode = false;
    // const index = this.dbRecords.indexOf(this.dbRecords.find(c => c.id === data.id));
    // if (index > -1) {

    //   const Slot = this.dbRecords.find(c => c.id === data.id);
    //   this.caGlobal.dataSource.splice(index, 1, Slot);
    //   this.expandedRows[data.id] = false;
    // }
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
    this.storeTask = task;
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
    this.storeTask.Comments = comments;

    // this.messageService.add({
    //   key: 'tc', severity: 'warn', sticky: true,
    //   summary: 'Info Message', detail: 'updating...'
    // });
    // this.caCommonService.saveTaskScopeComments(task, comments);

    // setTimeout(() => {
    //   this.getProperties();
    //   this.messageService.clear('tc');
    //   this.messageService.add({
    //     severity: 'success', summary: 'Success Message',
    //     detail: 'The comments - ' + comments + ' has saved Successfully'
    //   });
    // }, 400);
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
        const res = this.caCommonService.sortResources(setResources, task);
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

  EditSlotEnable(rowData, Slot) {

    debugger;
    Slot.editMode = true;
    Slot.edited = true;
    rowData.edited = true;
    this.disableSave = false;

  }

  // ****************************************************************************************************
  // Save Task
  // *****************************************************************************************************


  // async saveTask(task, unt) {
  //   if (!this.selectOpened && task.allocatedResource !== '') {
  //     if (!this.selectOpened && task.allocatedResource) {
  //       const currentScheduleTask = await this.spServices.readItem(this.scheduleList, task.id);
  //       if (currentScheduleTask) {
  //         if (new Date(task.startDate).getTime() === new Date(currentScheduleTask.StartDate).getTime() &&
  //           new Date(task.dueDate).getTime() === new Date(currentScheduleTask.DueDate).getTime()) {
  //           const indexRes = this.resourceList.findIndex(item => item.UserName.ID === task.allocatedResource.UserName.ID);
  //           let resourceTimeZone = this.resourceList[indexRes].TimeZone.Title;
  //           resourceTimeZone = resourceTimeZone ? resourceTimeZone : '5.5';
  //           if (parseFloat(task.timezone) === parseFloat(resourceTimeZone)) {
  //             this.messageService.add({
  //               severity: 'info', summary: 'Info Message',
  //               detail: 'Updating Task..'
  //             });
  //             setTimeout(() => {
  //               this.completeEqualTask(task, unt, false);
  //             }, 500);
  //           } else {
  //             const newStartTime = this.caCommonService.calcTimeForDifferentTimeZone(task.startDate, task.timezone, resourceTimeZone);
  //             const newEndTime = this.caCommonService.calcTimeForDifferentTimeZone(task.dueDate, task.timezone, resourceTimeZone);
  //             // tslint:disable-next-line: quotemark
  //             if (window.confirm("Task '" + task.title + "' will be allocated to " + this.resourceList
  //             // tslint:disable-next-line: max-line-length
  //             [indexRes].UserName.Title + 'from' + this.datePipe.transform(newStartTime, 'MMM dd yyyy hh:mm:ss aa') + ' to ' + this.datePipe.transform(newEndTime, 'MMM dd yyyy hh:mm:ss aa') + ' in his/her timezone. Do you want to continue ?')) {
  //               this.messageService.add({
  //                 severity: 'info', summary: 'Info Message',
  //                 detail: 'Updating Task..'
  //               });
  //               task.newStartDate = newStartTime;
  //               task.newDueDate = newEndTime;
  //               task.userTimeZone = resourceTimeZone;
  //               setTimeout(() => {
  //                 this.completeEqualTask(task, unt, true);
  //               }, 500);
  //             } else {
  //               this.onClear(task);
  //             }
  //           }
  //         } else {
  //           this.messageService.add({
  //             severity: 'info', summary: 'Info Message',
  //             detail: 'Start and EndDate is not matched for this ' + task.title + '. Hence page is refreshed in 30 sec.'
  //           });
  //           setTimeout(() => {
  //             location.reload();
  //           }, 3000);
  //         }
  //       }
  //     }
  //   }
  // }
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

    await this.caCommonService.ResourceAllocation(task, this.projectInformationList);
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
          this.performDelete(task, nextTasks, prevTasks, unt);
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

  showRestructureCA(RowData) {
    this.loaderenable = true;
    const ref = this.dialogService.open(CaDragdropComponent, {

      data: {
        slot: RowData,
      },
      header: 'Central Allocation',
      width: '100vw',
      height: '100vh',
      contentStyle: { height: '90vh', overflow: 'auto' },
      closable: false,
    });
    ref.onClose.subscribe(async (RestructureTasks: any) => {
      debugger
      if (RestructureTasks) {

        let SlotTasks = [];
        if (RowData.SlotTasks) {
          SlotTasks = JSON.parse(JSON.stringify(RowData.SlotTasks));
        }
        RowData.SlotTasks = [];
        const nodesNew = [];
        debugger;
        for (const nodeOrder of RestructureTasks.nodeOrder) {
          const node = RestructureTasks.nodes.find(e => e.id === nodeOrder);
          nodesNew.push(node);
        }
        RestructureTasks.nodes = nodesNew;
        RestructureTasks.nodes.forEach(async task => {

          const nextTasks = RestructureTasks.nodes.filter(c => RestructureTasks.links.filter(e => e.source ===
            task.id).map(d => d.target).includes(c.id)).map(c => c.label).join(';');

          const previousTasks = RestructureTasks.nodes.filter(c => RestructureTasks.links.filter(e => e.target ===
            task.id).map(d => d.source).includes(c.id)).map(c => c.label).join(';');

          task.startDate = RowData.startDate;
          task.dueDate = RowData.startDate;
          if (SlotTasks.find(c => c.taskName === task.taskName)) {
            task = SlotTasks.find(c => c.taskName === task.taskName);
          } else {
            task.Status = 'Not Saved';
          }
          task.previousTasks = previousTasks === '' ? null : previousTasks;
          task.nextTasks = nextTasks === '' ? null : nextTasks;
          const obj = this.GetTask(task);
          obj.editMode = true;
          RowData.SlotTasks.push(obj);
          RowData.subTaskloaderenable = false;
        });

        this.expandedRows[RowData.id] = true;
      } else {

        if (!RowData.SlotTasks) {

          RowData.SlotTasks = [];
          const obj = this.GetTask(RowData);
          const tasks = await this.GetAllConstantTasks(obj.task);
          obj.taskName = tasks.length > 0 ? tasks[0] : obj.taskName;
          obj.isEditEnabled = true;
          obj.edited = true;
          RowData.SlotTasks.push(obj);
          RowData.subTaskloaderenable = false;
        }
      }
    });

  }





  async OnRowExpand(event) {

    debugger
    event.data.subTaskloaderenable = true;
    if (event.data.SlotTasks) {
      if (event.data.SlotTasks.length === 1 && event.data.SlotTasks[0].id === undefined) {
        event.data.SlotTasks[0].editMode = true;
        event.data.SlotTasks[0].edited = true;
      }
      event.data.subTaskloaderenable = false;
    } else {
      event.data.SlotTasks = [];
      const response = await this.caCommonService.getSlotTasks(event);
      if (response.length > 0) {
        event.data.subTaskloaderenable = false;
      } else {
        const tasks = await this.GetAllConstantTasks(event.data.task);
        event.data.taskName = tasks.length > 0 ? tasks[0] : event.data.taskName;
        const obj = this.GetTask(event.data);
        obj.editMode = true;
        obj.edited = true;
        obj.Status = 'Not Saved';
        event.data.SlotTasks.push(obj);
        event.data.subTaskloaderenable = false;
      }
    }

    console.log(event.data.SlotTasks);

  }

  modelChanged(event, Slot) {
    event.editMode = true;
    event.edited = true;
    Slot.editMode = true;
    this.disableSave = false;
  }

  async GetAllConstantTasks(taskName) {
    let allConstantTasks = [];
    allConstantTasks = await this.caCommonService.GetAllTasksMilestones(taskName);
    return allConstantTasks.map(c => c.Title);
  }


  GetTask(task) {



    const taskObj = $.extend(true, {}, this.caGlobal.caObject);

    const hrsMinObject = {
      timeHrs: task.TimeSpent != null ? task.TimeSpent.indexOf('.') > -1 ?
        task.TimeSpent.split('.')[0] : task.TimeSpent : '00',
      timeMins: task.TimeSpent != null ?
        task.TimeSpent.indexOf('.') > -1 ? task.TimeSpent.split('.')[1] : '00' : 0
    };

    const projectItem = this.projects.filter((proj) => proj.ProjectCode === task.projectCode);
    const resourcesList = $.extend(true, [], this.resourceList);

    const resPool = this.caCommonService.getResourceByMatrix(resourcesList, task.taskName ? task.taskName : task.label, task.SkillLevel,
      projectItem[0].ClientLegalEntity, projectItem[0].TA, projectItem[0].DeliverableType);


    const AssignedUserTimeZone = task.AssignedTo ? resourcesList.filter((objt) => {
      return task.AssignedTo.ID === objt.UserName.ID;
    }) : [];
    task.assignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
      ? AssignedUserTimeZone[0].TimeZone.Title ?
        AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

    const convertedStartDate = this.commonService.calcTimeForDifferentTimeZone(new Date(task.startDate),
      this.globalService.currentUser.timeZone, task.assignedUserTimeZone);
    task.jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(convertedStartDate,
      task.assignedUserTimeZone, this.globalService.currentUser.timeZone);
    const convertedEndDate = this.commonService.calcTimeForDifferentTimeZone(new Date(task.dueDate),
      this.globalService.currentUser.timeZone, task.assignedUserTimeZone);
    task.jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(convertedEndDate,
      task.assignedUserTimeZone, this.globalService.currentUser.timeZone);

    const SelectedResources = [];
    const resExt = $.extend(true, [], resPool);
    for (const retRes of resExt) {
      retRes.timeAvailable = 0;
      retRes.Color = 'green';
      SelectedResources.push(retRes);

    }


    taskObj.id = task.ID;
    taskObj.task = task.task;
    taskObj.timezone = task.timezone;
    taskObj.title = task.Title;
    taskObj.projectCode = task.projectCode;
    taskObj.NextTasks = task.nextTasks;
    taskObj.PrevTasks = task.PrevTasks;
    taskObj.milestone = task.milestone;
    taskObj.taskName = task.taskName;
    taskObj.estimatedTime = task.estimatedTime ? task.estimatedTime : '0';
    taskObj.startTime = task.startDate;
    taskObj.endTime = task.dueDate;
    taskObj.startDate = new Date(task.startDate);
    taskObj.dueDate = new Date(task.dueDate);
    taskObj.UserStart = new Date(task.startDate);
    taskObj.UserEnd = new Date(task.dueDate);
    taskObj.spentTime = this.commonService.ajax_addHrsMins([hrsMinObject]);
    taskObj.UserStartDatePart = this.getDatePart(convertedStartDate);
    taskObj.UserStartTimePart = this.getTimePart(convertedStartDate);
    taskObj.UserEndDatePart = this.getDatePart(convertedEndDate);
    taskObj.UserEndTimePart = this.getTimePart(convertedEndDate);
    taskObj.taskScope = task.Comments;
    taskObj.allocatedResource = '';
    taskObj.assignedTo = task.assignedTo ? task.assignedTo.Title : '';
    taskObj.resources = $.extend(true, [], resPool);
    taskObj.selectedResources = [];
    taskObj.mileStoneTask = [];
    taskObj.projectTask = [];
    taskObj.Status = task.status;
    taskObj.CentralAllocationDone = task.CentralAllocationDone;
    taskObj.assignedUserTimeZone = task.assignedUserTimeZone;
    taskObj.allowStart = task.AllowCompletion === true || task.AllowCompletion === 'Yes' ? true : false;
    taskObj.DisableCascade = task.DisableCascade && task.DisableCascade === 'Yes' ? true : false;
    taskObj.displayselectedResources = [];
    return taskObj;
  }



  // scObj.id = task.ID;
  // scObj.clientName = projectItem[0].ClientLegalEntity;
  // scObj.projectCode = task.projectCode;
  // scObj.projectManagementURL = scObj.projectName = projectItem[0].WBJID;
  // scObj.milestone = task.milestone;
  // scObj.SubMilestones = task.SubMilestones;
  // scObj.task = task.task;
  // scObj.timezone = task.timezone;
  // scObj.title = task.Title;
  // scObj.taskName = $.trim(task.title.replace(scObj.projectCode + '', '').replace(scObj.milestone + '', ''));
  // scObj.deliveryType = projectItem[0].DeliverableType;
  // scObj.estimatedTime = task.estimatedTime;
  // scObj.startTime = task.startDate;
  // scObj.endTime = task.dueDate;
  // scObj.startDate = new Date(task.startDate);
  // scObj.dueDate = new Date(task.dueDate);
  // scObj.spentTime = this.commonService.ajax_addHrsMins([hrsMinObject]);
  // scObj.startDateText = this.datePipe.transform(scObj.startDate, 'd MMM, yyyy, hh:mm a');
  // scObj.dueDateText = this.datePipe.transform(scObj.dueDate, 'd MMM, yyyy, hh:mm a');
  // scObj.nextTaskStartDate = new Date(); // nextTaskItem[0].StartDate;
  // scObj.lastTaskEndDate = new Date(); // prevTaskItem[0].StartDate;
  // scObj.sendToClientDate = new Date(); // sentToClientItem[0].StartDate;
  // scObj.nextTaskStartDateText = '';
  // scObj.lastTaskEndDateText = '';
  // scObj.sendToClientDateText = '';
  // scObj.UserStartDatePart = this.getDatePart(convertedStartDate),
  //   scObj.UserStartTimePart = this.getTimePart(convertedStartDate),
  //   scObj.UserEndDatePart = this.getDatePart(convertedEndDate),
  //   scObj.UserEndTimePart = this.getTimePart(convertedEndDate),
  //   scObj.NextTasks = task.NextTasks ? task.NextTasks : '';
  // scObj.PrevTasks = task.PrevTasks ? task.PrevTasks : '';
  // scObj.taskScope = task.Comments;
  // scObj.prevTaskComments = '';
  // scObj.allocatedResource = '';
  // scObj.assignedTo = task.assignedTo ? task.assignedTo.Title : '';
  // scObj.isAllocatedSelectHidden = true;
  // scObj.isAssignedToHidden = false;
  // scObj.isEditEnabled = true;
  // scObj.editImageUrl = this.globalService.imageSrcURL.editImageURL;
  // scObj.taskScopeImageUrl = this.globalService.imageSrcURL.scopeImageURL;
  // scObj.taskDeleteImageUrl = this.globalService.imageSrcURL.cancelImageURL;
  // scObj.resources = $.extend(true, [], resPool);
  // scObj.selectedResources = [];
  // scObj.mileStoneTask = [];
  // scObj.projectTask = [];
  // scObj.CentralAllocationDone = task.CentralAllocationDone;
  // scObj.assignedUserTimeZone = task.assignedUserTimeZone;
  // const resExt = $.extend(true, [], resPool);
  // for (const retRes of resExt) {
  //   retRes.timeAvailable = 0;
  //   retRes.Color = 'green';
  //   scObj.selectedResources.push(retRes);
  // }
  // return scObj;


  // const taskObj = {
  //   __metadata: { type: 'SP.Data.SchedulesListItem' },
  //   StartDate: task.pStart,
  //   DueDate: task.pEnd,
  //   ExpectedTime: '' + task.budgetHours,
  //   AllowCompletion: task.allowStart === true ? 'Yes' : 'No',
  //   TATStatus: task.tat === true || task.tat === 'Yes' ? 'Yes' : 'No',
  //   TATBusinessDays: task.tatVal,
  //   AssignedToId: task.AssignedTo ? task.AssignedTo.hasOwnProperty('ID') ?
  //     task.AssignedTo.ID : -1 : -1,
  //   TimeZone: task.assignedUserTimeZone.toString(),
  //   Comments: task.scope,
  //   Status: task.status,
  //   NextTasks: task.nextTasks,
  //   PrevTasks: task.previousTasks,
  //   ProjectCode: projectItem[0].projectCode,
  //   Task: task.itemType ? task.itemType : $.trim(task.title.replace(task.projectCode + '', '').replace(task.milestone + '', '')),
  //   Milestone: task.milestone,
  //   SubMilestones: task.submilestone,
  //   Title: projectItem[0].projectCode + ' ' + task.milestone + ' ' + task.pName,
  //   SkillLevel: task.skillLevel,
  //   IsCentrallyAllocated: task.IsCentrallyAllocated,
  //   CentralAllocationDone: task.CentralAllocationDone,
  //   ActiveCA: task.ActiveCA,
  //   DisableCascade: task.DisableCascade === true ? 'Yes' : 'No',
  //   resources: $.extend(true, [], resPool),
  //   selectedResources: SelectedResources,
  //   mileStoneTask: [],
  //   projectTask: [],
  // };

  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }

  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, 'hh:mm a');
  }


  DateChangePart(Node, Slot, type) {
    Node.UserStart = new Date(this.datepipe.transform(Node.UserStartDatePart, 'MMM d, y') + ' ' + Node.UserStartTimePart);
    Node.UserEnd = new Date(this.datepipe.transform(Node.UserEndDatePart, 'MMM d, y') + ' ' + Node.UserEndTimePart);
    Slot.editMode = true;
    this.DateChange(Node, Slot, type);
    this.disableSave = false;
  }
  //tslint:disable
  DateChange(Node, Slot, type) {
    let previousNode = undefined;
    Slot.SlotTasks.forEach(task => {
      if (Node === task) {
        this.changeDateOfEditedTask(task, type);
        previousNode = task;
        const nextTasks = previousNode.NextTasks ? previousNode.NextTasks.split(';') : [];
        if (nextTasks) {
          this.cascadeNextTask(nextTasks, Slot, previousNode);
        }

      }
    });
  }

  async cascadeNextTask(nextTasks, Slot, previousNode) {

    nextTasks.forEach(element => {

      const nextNode = Slot.SlotTasks.find(c => c.taskName === element);
      if (new Date(previousNode.UserEnd) > new Date(nextNode.UserStart) && !nextNode.DisableCascade) {
        this.cascadeNode(previousNode, Slot, nextNode);
      }
    });
  }


  async cascadeNode(previousNode, Slot, currentnode) {

    const startDate = currentnode.startDate;
    const endDate = currentnode.dueDate;
    var workingHours = this.workingHoursBetweenDates(startDate, endDate);
    currentnode.startDate = previousNode.dueDate;
    currentnode.UserStart = this.commonService.calcTimeForDifferentTimeZone(currentnode.startDate,
      this.globalService.currentUser.timeZone, currentnode.assignedUserTimeZone);
    currentnode.UserStart = currentnode.UserStart.getHours() >= 19 ?
      this.checkStartDate(new Date(currentnode.UserStart.getFullYear(), currentnode.UserStart.getMonth(), (currentnode.UserStart.getDate() + 1), 9, 0)) :
      currentnode.UserStart;
    currentnode.UserEnd = this.checkEndDate(currentnode.UserStart, workingHours);
    currentnode.UserStartDatePart = this.getDatePart(currentnode.UserStart);
    currentnode.UserStartTimePart = this.getTimePart(currentnode.UserStart);
    currentnode.UserEndDatePart = this.getDatePart(currentnode.UserEnd);
    currentnode.UserEndTimePart = this.getTimePart(currentnode.UserEnd);
    currentnode.startDate = this.commonService.calcTimeForDifferentTimeZone(currentnode.UserStart,
      currentnode.assignedUserTimeZone, this.globalService.currentUser.timeZone);
    currentnode.dueDate = this.commonService.calcTimeForDifferentTimeZone(currentnode.UserEnd,
      currentnode.assignedUserTimeZone, this.globalService.currentUser.timeZone);
    currentnode.edited = true;
    currentnode.pRes = currentnode.skillLevel;
    const nextTasks = currentnode.NextTasks ? currentnode.NextTasks.split(';') : [];
    if (nextTasks) {
      this.cascadeNextTask(nextTasks, Slot, currentnode);
    }
  }

  changeDateOfEditedTask(node, type) {
    node.UserStart = node.UserStart;
    node.UserEnd = type === 'start' && node.UserStart > node.UserEnd ? node.UserStart : node.UserEnd;
    node.UserStartDatePart = this.getDatePart(node.UserStart);
    node.UserStartTimePart = this.getTimePart(node.UserStart);
    node.UserEndDatePart = this.getDatePart(node.UserEnd);
    node.UserEndTimePart = this.getTimePart(node.UserEnd);

    node.startDate = this.commonService.calcTimeForDifferentTimeZone(node.UserStart,
      node.assignedUserTimeZone, this.globalService.currentUser.timeZone);
    node.dueDate = this.commonService.calcTimeForDifferentTimeZone(node.UserEnd,
      node.assignedUserTimeZone, this.globalService.currentUser.timeZone);
    node.edited = true;
    node.pRes = node.skillLevel;


    //node.tatVal = this.commonService.calcBusinessDays(new Date(node.pStart), new Date(node.pEnd));
  }
  workingHoursBetweenDates(start, end) {
    let count = 0;
    for (let i = start.valueOf(); i < end.valueOf(); i = (start.setMinutes(start.getMinutes() + 1)).valueOf()) {
      if (start.getDay() !== 0 && start.getDay() !== 6 && start.getHours() >= 9 && start.getHours() < 19) {
        count++;
      }
    }
    return count / 60;
  }

  // **************************************************************************************************
  // Check Start Date
  // *************************************************************************************************


  private checkStartDate(date) {
    date.setDate(date.getDay() === 6 ? date.getDate() + 2 : date.getDay() === 0 ? date.getDate() + 1 : date.getDate() + 0);
    return new Date(date);
  }


  // *************************************************************************************************************************************
  // Calculate  End  Date  after working hours difference
  // *************************************************************************************************************************************


  checkEndDate(start, workingHours) {
    let count = 0;
    let EndDate = new Date(start);
    let CaculateDate = new Date(start);
    const workHours = workingHours * 60;
    while (count < workHours) {

      if (EndDate.getDay() !== 0 && EndDate.getDay() !== 6 && EndDate.getHours() >= 9 && EndDate.getHours() < 19) {
        EndDate = new Date(EndDate.setMinutes(EndDate.getMinutes() + 1));
        CaculateDate = new Date(EndDate);
      } else if (EndDate.getHours() === 19 && EndDate.getMinutes() === 0) {

        CaculateDate = new Date(EndDate);
        EndDate = new Date(EndDate.setMinutes(EndDate.getMinutes() + 1));
        count--;
      } else {
        EndDate = new Date(EndDate.getFullYear(), EndDate.getMonth(), (EndDate.getDate() + 1), 9, 0);
        CaculateDate = new Date(EndDate);
        count--;
      }

      if (EndDate.getHours() >= 9 && EndDate.getHours() <= 19) { count++; }
    }
    return CaculateDate;
  }


  async saveTasks() {

    this.disableSave = true;
    const isValid = await this.validate();

    if (isValid) {
    }
    else {
      this.disableSave = false;
    }

  }


  async validate() {
    const EditedSlots = this.caGlobal.dataSource.filter(c => c.editMode === true);

    for (const slot of EditedSlots) {
      if (slot.SlotTasks) {
        const checkTaskAllocatedTime = slot.SlotTasks.filter(e => (e.estimatedTime === '' || +e.estimatedTime === 0)
          && e.status !== 'Completed');
        // tslint:enable
        if (checkTaskAllocatedTime.length > 0) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Allocated time for task cannot be equal or less than 0 for '
              + slot.milestone + ' - ' + checkTaskAllocatedTime[0].task
          });
          return false;
        }

        const compareDates = slot.SlotTasks.filter(e => (e.UserEnd <= e.UserStart && e.status !== 'Completed'));
        if (compareDates.length > 0) {

          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'End date should be less than start date of ' + compareDates[0].taskName + ' task of ' +
              slot.milestone + ' - ' + slot.task
          });
          return false;
        }


        let validateAllocation = true;
        slot.SlotTasks.forEach(element => {
          const title = element.allocatedResource ? element.allocatedResource.Title : null;
          if (!title) {
            validateAllocation = false;
          }
        });
        if (!validateAllocation) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'All tasks of ' + slot.milestone + ' - ' + slot.task + ' should be assigned to   resource.'
          });
          return false;
        }
        const errorPresnet = this.validateTaskDates(slot.SlotTasks, slot);
        if (errorPresnet) {
          return false;
        }
      }
    }
    return true;
  }





  validateTaskDates(AllTasks, slot) {
    let errorPresnet = false;
    const taskCount = AllTasks.length;
    for (let i = 0; i < taskCount; i = i + 1) {
      // AllTasks.forEach(task => {
      const task = AllTasks[i];
      if (task.NextTasks && task.Status !== 'Completed'
        && task.Status !== 'Auto Closed' && task.Status !== 'Deleted') {
        const nextTasks = task.NextTasks.split(';');
        const AllNextTasks = AllTasks.filter(c => (nextTasks.indexOf(c.taskName) > -1));

        const SDTask = AllNextTasks.find(c => c.startDate < task.dueDate && c.Status !== 'Completed'
          && c.Status !== 'Auto Closed' && c.Status !== 'Deleted' && c.allowStart === false);
        if (SDTask) {
          // this.errorMessageCount++;
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Start Date of ' + SDTask.taskName + '  should be greater than end date of ' +
              task.taskName + ' in ' + slot.milestone + ' - ' + slot.task,
          });
          errorPresnet = true;
          break;
          // this.taskerrorMessage = 'Start Date of ' + SDTask.pName + '  should be greater than end date of ' + task.pName;
        }
      }
    }
    return errorPresnet;
    // });
  }

}
