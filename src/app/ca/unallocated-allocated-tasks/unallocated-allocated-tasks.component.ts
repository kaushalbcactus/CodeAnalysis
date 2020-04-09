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
import { DialogService, MessageService, MenuItem, SelectItem } from 'primeng';
import { CaDragdropComponent } from '../ca-dragdrop/ca-dragdrop.component';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';


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
  @ViewChild('taskTable', { static: false }) taskTable: Table;
  TableBlock: Table;
  taskMenu: MenuItem[];
  selectedTab = 'unallocated';
  taskTitle = '';
  displayCommentenable: boolean;
  selectedButton: any;
  selectedUser: any;
  modalloaderenable: boolean;
  loderenable: boolean = true;
  DropdownOptions: SelectItem[];
  disableSave = true;
  yearsRange = new Date().getFullYear() - 1 + ':' + (new Date().getFullYear() + 10);
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
  taskType: string;
  emailTemplate = undefined;
  BudgetHoursTask = [];
  BudgetHoursTaskenable = true;
  tempSlot: any;
  arrMilestoneTasks = [];
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
    // private confirmationService: ConfirmationService,
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
  public resetFilter = false;
  public resourceList = [];
  public projects = [];
  public schedulesItems = [];
  public selectOpened = false;
  // public dbRecords = [];
  public openedSelect;
  public openedTask;
  public currentAllocatedTask;
  public taskAssignedTo = false;
  completeTaskArray = [];
  subTaskloaderenable = false;
  displayedColumns: any[] = [
    { field: 'ClientName', header: 'Client' },
    { field: 'ProjectCode', header: 'Project' },
    { field: 'Milestone', header: 'Milestone' },
    { field: 'Task', header: 'Task' },
    { field: 'DeliveryType', header: 'Deliverable' },
    { field: 'EstimatedTime', header: 'Hrs' },
    { field: 'StartDateText', header: 'Start Time' },
    { field: 'DueDateText', header: 'End Time' }];

  filterColumns: any[] = [
    { field: 'ClientName' },
    { field: 'ProjectCode' },
    { field: 'ProjectName' },
    { field: 'Milestone' },
    { field: 'Task' },
    { field: 'DeliveryType' },
    { field: 'EstimatedTime' },
    { field: 'StartDateText' },
    { field: 'DueDateText' },
    { field: 'NextTaskStartDateText' },
    { field: 'LastTaskEndDateText' },
    { field: 'SendToClientDateText' },
    { field: 'AssignedTo' }
  ];
  ngOnInit() {
    this.globalService.currentTitle = 'Central Allocation';
    this.caGlobal.loading = true;
    this.caGlobal.totalRecords = 0;
    this.modalloaderenable = false;
    setTimeout(async () => {
      await this.getProperties();
    }, 100);

    this.globalService.currentUser.timeZone = this.commonService.getCurrentUserTimeZone();

  }

  // ****************************************************************************************************
  // Get Data based on tab selection
  // *****************************************************************************************************



  async getProperties() {

    this.expandedRows = {};
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

    if (!this.selectedTab) {
      mainQuery.filter += mainQuery.filterSlot;
    }

    this.commonService.SetNewrelic('caCommon', 'CA', 'GetRCPISchedules' + this.selectedTab);
    const arrResults = await this.caCommonService.getItems(mainQuery);
    this.resourceList = arrResults[0];
    this.projects = arrResults[1];
    this.schedulesItems = arrResults[2];

    if (this.schedulesItems && this.schedulesItems.length) {
      for (const task of this.schedulesItems) {
        this.caCommonService.getCaProperties(taskCounter, schedulesItemFetch, task, this.projects,
          this.resourceList, this.completeTaskArray, acTempArrays);
      }
      this.arrMilestoneTasks = await this.caCommonService.getMilestoneSchedules(this.globalConstant.listNames.Schedules.name, schedulesItemFetch);

      this.caCommonService.getScheduleItems(this.completeTaskArray, this.arrMilestoneTasks);
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
      // this.caGlobal.dataSource = this.completeTaskArray;
      this.caGlobal.totalRecords = this.completeTaskArray.length;
      this.caGlobal.dataSource = this.completeTaskArray.slice(0, 10);

      // this.caGlobal.dataSource = this.completeTaskArray.slice(0, 30);
      // this.dbRecords = JSON.parse(JSON.stringify(this.completeTaskArray));
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


  openPopup(data, Slot) {
    if (data.Type === 'Slot') {

      if (data.editMode) {
        this.taskMenu = [
          { label: 'Restructure', icon: 'pi pi-sitemap', command: (e) => this.showRestructureCA(data) },
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data, Slot) },
          { label: 'Cancel Changes', icon: 'pi pi-fw pi-times', command: (e) => this.cancelledAllchanges(data) },
        ];
      } else {
        this.taskMenu = [
          { label: 'Restructure', icon: 'pi pi-sitemap', command: (e) => this.showRestructureCA(data) },
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data, Slot) }
        ];
      }
    } else {
      if (data.editMode) {
        this.taskMenu = [
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data, Slot) }
        ];
      } else {
        this.taskMenu = [
          { label: 'Edit', icon: 'pi pi-pencil', command: (event) => this.editTask(data) },
          { label: 'View / Add Scope', icon: 'pi pi-fw pi-comment', command: (e) => this.getAllocateTaskScope(data, Slot) }
        ];
      }
    }
  }


  editTask(data) {
    data.editMode = true;
  }


  cancelledAllchanges(data) {

    delete data.SlotTasks;
    this.expandedRows[data.Id] = false;
    data.editMode = false;
    data.edited = false;
    // delete data.MilestoneAllTasks;

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

  getAllocateTaskScope(task, Slot) {
    this.tempSlot = Slot;
    this.displayCommentenable = true;
    this.taskTitle = task.Title;
    this.taskType = task.Type && task.Type === 'Slot' ? task.Type : 'Task';

    this.caGlobal.taskScope = task.TaskScope ? task.TaskScope : '';
    this.caGlobal.taskPreviousComment = task.PrevTaskComments ?
      task.PrevTaskComments : '';
    this.caGlobal.curTaskScope = task;
  }
  // ****************************************************************************************************
  // Save Task Scope
  // *****************************************************************************************************
  saveTaskScope(task, comments) {
    task.TaskScope = comments;
    task.editMode = true;
    task.edited = true;
    this.tempSlot.editMode = true;
    this.disableSave = false;
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
        const startTime = new Date(new Date(task.StartTime).setHours(0, 0, 0, 0));
        const endTime = new Date(new Date(task.EndTime).setHours(23, 59, 59, 0));

        this.commonService.SetNewrelic('unallocated-allocated', 'CA', 'checkUserCapacity');

        const oCapacity = await this.usercapacityComponent.applyFilterReturn(startTime, endTime,
          setResourcesExtn, []);
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

        if (task.PreviousAssignedUser && task.PreviousAssignedUser.ID > -1 && task.CentralAllocationDone === 'No') {

          const resourcesList = $.extend(true, [], this.resourceList);
          let ExistingUser = res.find(c => c.UserName.ID === task.PreviousAssignedUser.ID &&
            c.UserName.Title === task.PreviousAssignedUser.Title);
          if (ExistingUser) {
            ExistingUser.userType = 'Previously Assigned';
          } else {
            ExistingUser = resourcesList.find(c => c.UserName.ID === task.PreviousAssignedUser.ID &&
              c.UserName.Title === task.PreviousAssignedUser.Title);
            if (ExistingUser) {
              ExistingUser.userType = 'Previously Assigned';
              const retResource = oCapacity.arrUserDetails.filter(user => user.uid === ExistingUser.UserName.ID);
              this.setColorCode(retResource, ExistingUser, task);
              const dispTime = parseFloat(retResource[0].displayTotalUnAllocated.replace(':', '.'));
              ExistingUser.taskDetails = retResource[0];
              ExistingUser.timeAvailable = dispTime;
              res.push(ExistingUser);
            }
          }
        }
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

            // Items.sort((user1, user2) => {
            //   if (user1.value.timeAvailable > user2.value.timeAvailable) { return -1; }
            //   if (user1.value.timeAvailable < user2.value.timeAvailable) { return 1; }
            //   if (user1.value.Title > user2.value.Title) { return 1; }
            //   if (user1.value.Title < user2.value.Title) { return -1; }
            // });

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


        if (task.displayselectedResources.length > 1) {
          const response = await this.SortByGroupAssignTo(task.displayselectedResources);
          task.displayselectedResources = response;
        }

        if (task.displayselectedResources) {
          task.displayselectedResources.map(c => c.items).forEach(element => {
            task.allocatedResource = element.find(c => c.value.UserName.ID === task.AssignedTo.ID) ?
              element.find(c => c.value.UserName.ID === task.AssignedTo.ID).value : task.allocatedResource;
          });
        }
      }, 500);
    }
  }


  async SortByGroupAssignTo(displayselectedResources) {
    const resource = [];
    const GroupList = ['Previously Assigned', 'Best Fit', 'Recommended', 'Other'];
    GroupList.forEach(element => {
      const obj = displayselectedResources.find(c => c.label === element);
      if (obj) {
        resource.push(obj);
      }

    });
    return resource;
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


    const startTime = new Date(new Date(task.StartDate).setHours(0, 0, 0, 0));
    let endDate = new Date(new Date(task.DueDate).setDate(new Date(task.DueDate).getDate() + 2));
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

  async EditSlotEnable(rowData, Slot) {

    Slot.editMode = true;
    rowData.edited = true;
    this.disableSave = false;
  }

  assignedToUserChanged(rowData) {
    rowData.assignedUserChanged = true;
    // rowData.PreviousAssignedUser = rowData.AssignedTo;
  }


  // *************************************************************************************************
  //  Get Email Body
  // **************************************************************************************************

  async sendMail(task, slot) {
    if (task.allocatedResource && task.allocatedResource.UserName.hasOwnProperty('ID') && task.allocatedResource.UserName.ID !== -1) {
      const fromUser = this.globalService.currentUser.email;
      const user = task.allocatedResource.UserName;
      const mailSubject = task.ProjectCode + '(' + slot.ProjectName + ')' + ': Task created';
      const objEmailBody = await this.getsendEmailObjBody(task, slot, 'TaskCreation');
      const arrayTo = [];
      if (user !== 'SelectOne' && user !== '' && user != null) {
        const userEmail = user.EMail;
        arrayTo.push(userEmail);
      }
      this.commonService.SetNewrelic('CA', 'unallocated-allocated-tasks', 'SendMail');
      this.spServices.sendMail(arrayTo.join(','), fromUser, mailSubject, objEmailBody);
    }
  }


  async getsendEmailObjBody(milestoneTask, slot, templateName) {

    if (!this.emailTemplate) {
      this.emailTemplate = await this.GetEmailTemplate(templateName);
    }



    milestoneTask.Title = slot.ProjectCode + ' ' +
      slot.Milestone + ' ' + milestoneTask.TaskName

    let mailContent = this.emailTemplate;
    mailContent = this.replaceContent(mailContent, "@@Val3@@", milestoneTask.allocatedResource && milestoneTask.allocatedResource.UserName ? milestoneTask.allocatedResource.UserName.Title : milestoneTask.AssignedTo ? milestoneTask.AssignedTo.Title : undefined);
    mailContent = this.replaceContent(mailContent, "@@Val1@@", milestoneTask.ProjectCode);
    mailContent = this.replaceContent(mailContent, "@@Val2@@", slot.SubMilestones && slot.SubMilestones !== 'Default' ? milestoneTask.Title + ' - ' + slot.SubMilestones : milestoneTask.Title);
    mailContent = this.replaceContent(mailContent, "@@Val4@@", milestoneTask.Task);
    mailContent = this.replaceContent(mailContent, "@@Val5@@", slot.Milestone);
    mailContent = this.replaceContent(mailContent, "@@Val6@@", this.datepipe.transform(milestoneTask.StartDate, 'MMM dd yyyy hh:mm:ss a'));
    mailContent = this.replaceContent(mailContent, "@@Val7@@", this.datepipe.transform(milestoneTask.DueDate, 'MMM dd yyyy hh:mm:ss a'));
    mailContent = this.replaceContent(mailContent, "@@Val9@@", milestoneTask.TaskScope ? milestoneTask.TaskScope : '');
    return mailContent;
  }

  async GetEmailTemplate(templateName) {
    let mailContent = {};

    const mailObj = this.caConstant.getMailTemplate;
    mailObj.filter = mailObj.filter.replace('{{templateName}}', templateName);
    this.commonService.SetNewrelic('unallocated-allocated', 'CA-GetMailContent', 'readItems');
    const templateData = await this.spServices.readItems(this.globalConstant.listNames.MailContent.name,
      mailObj);
    mailContent = templateData.length > 0 ? templateData[0].Content : [];
    return mailContent;
  }

  replaceContent(mailContent, key, value) {
    return mailContent.replace(new RegExp(key, 'g'), value);
  }


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



  isOptionFilter: boolean;
  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  async showRestructureCA(RowData) {

    if (!RowData.MilestoneAllTasks) {
      RowData.MilestoneAllTasks = await this.getMilestoneTasks(RowData);
    }

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
      if (RestructureTasks) {
        this.expandedRows[RowData.Id] = true;
        RowData.subTaskloaderenable = true;
        let SlotTasks = [];

        if (RowData.SlotTasks) {
          SlotTasks = JSON.parse(JSON.stringify(RowData.SlotTasks));
        } else {
          SlotTasks = JSON.parse(JSON.stringify(RestructureTasks.dbSlots));
        }
        RowData.SlotTasks = [];
        if (!RowData.dbSlotTasks) {
          RowData.dbSlotTasks = JSON.parse(JSON.stringify(RestructureTasks.dbSlots));
        }

        const nodesNew = [];
        for (const nodeOrder of RestructureTasks.nodeOrder) {
          const node = RestructureTasks.nodes.find(e => e.id === nodeOrder);
          nodesNew.push(node);
        }
        RestructureTasks.nodes = nodesNew;

        for (let task of RestructureTasks.nodes) {

          const nextTasks = RestructureTasks.nodes.filter(c => RestructureTasks.links.filter(e => e.source ===
            task.id).map(d => d.target).includes(c.id)).map(c => c.label).join(';');

          const previousTasks = RestructureTasks.nodes.filter(c => RestructureTasks.links.filter(e => e.target ===
            task.id).map(d => d.source).includes(c.id)).map(c => c.label).join(';');

          task.StartDate = RowData.StartDate;
          task.DueDate = RowData.StartDate;
          if (SlotTasks.find(c => c.Id === task.dbId)) {
            task = SlotTasks.find(c => c.Id === task.dbId);
            task.taskType = task.Task;
          } else {
            task.Status = 'Not Saved';
          }

          if (task.Status === 'Not Saved') {
            task.projectCode = task.projectCode ? task.projectCode : task.ProjectCode;
            const projectItem = this.projects.find(proj => proj.ProjectCode === task.projectCode);

            if (projectItem.IsStandard === 'Yes') {
              if (this.BudgetHoursTaskenable) {
                const batchUrl = [];
                const tasksObj = Object.assign({}, this.queryConfig);
                tasksObj.url = this.spServices.getReadURL(this.globalConstant.listNames.MilestoneSubTaskMatrix.name,
                  this.caConstant.GetTaskBudgetHours);
                tasksObj.url = tasksObj.url.replace(/{{ClientLegalEntity}}/gi, projectItem.ClientLegalEntity)
                  .replace(/{{StandardService}}/gi, projectItem.StandardService)
                  .replace(/{{Milestone}}/gi, RowData.Milestone);
                tasksObj.listName = this.globalConstant.listNames.MilestoneSubTaskMatrix.name;
                tasksObj.type = 'GET';
                batchUrl.push(tasksObj);
                this.commonService.SetNewrelic('unallocated-allocated', 'CA', 'AddRowMilestoneSubTaskMatrix');
                const arrResult = await this.spServices.executeBatch(batchUrl);
                const response = arrResult.length ? arrResult[0].retItems : [];
                this.BudgetHoursTask = response;
                this.BudgetHoursTaskenable = false;
              }
              if (this.BudgetHoursTask.length > 0) {
                if (this.BudgetHoursTask.find(c => c.Title === task.taskType)) {
                  task.EstimatedTime = this.BudgetHoursTask.find(c => c.Title === task.taskType).Hours;
                }
              }
            }

          }
          if (task.previousTask !== previousTasks || task.nextTask !== nextTasks) {
            task.edited = true;
          }
          task.prevTasks = previousTasks === '' ? null : previousTasks;
          task.nextTasks = nextTasks === '' ? null : nextTasks;
          const obj = await this.GetTask(task, false);
          obj.editMode = true;
          obj.edited = task.edited ? task.edited : false;
          RowData.SlotTasks.push(obj);
          RowData.editMode = true;


          if (RowData.MilestoneAllTasks.length > 0 && RowData.MilestoneAllTasks.find(c => c.type ===
            task.taskType && c.milestone === RowData.Milestone)) {
            // tslint:disable: max-line-length
            if (!RowData.MilestoneAllTasks.find(c => c.type === task.taskType && c.milestone === RowData.Milestone).tasks.find(c => c === task.label)) {
              RowData.MilestoneAllTasks.find(c => c.type === task.taskType && c.milestone === RowData.Milestone).tasks.push(RowData.TaskName);
            }
          } else {
            RowData.MilestoneAllTasks.push({ type: task.taskType, milestone: RowData.Milestone, tasks: [RowData.TaskName] });
          }
        }

        if (this.completeTaskArray.filter(c => c.ProjectCode === RowData.ProjectCode && c.Milestone === RowData.Milestone)) {
          this.completeTaskArray.filter(c => c.ProjectCode === RowData.ProjectCode && c.Milestone ===
            RowData.Milestone).map(c => c.MilestoneAllTasks = RowData.MilestoneAllTasks);
        }
        RowData.subTaskloaderenable = false;
        this.disableSave = false;
      }

    });

  }


  // async getMilestoneTasks(task) {

  //   let alltasks = [];
  //   if (this.arrMilestoneTasks.find(c => c.projectCode === task.ProjectCode && c.milestone === task.Milestone)) {
  //     const dbMilestoneTasks = this.arrMilestoneTasks.find(c => c.projectCode === task.ProjectCode && c.milestone === task.Milestone).MilestoneTasks;

  //     for (let i = 0; i < dbMilestoneTasks.length; i++) {

  //       const TaskType = dbMilestoneTasks[i].Task;
  //       const TaskName = $.trim(dbMilestoneTasks[i].Title.replace(dbMilestoneTasks[i].ProjectCode + '', '').replace(dbMilestoneTasks[i].Milestone + '', ''));

  //       if (alltasks.length > 0 && alltasks.find(c => c.type === TaskType && c.milestone === dbMilestoneTasks[i].Milestone)) {
  //         alltasks.find(c => c.type === TaskType).tasks.push(TaskName);
  //       }
  //       else {
  //         alltasks.push({ type: TaskType, milestone: dbMilestoneTasks[i].Milestone, tasks: [TaskName] });
  //       }

  //     }
  //     return alltasks;
  //   }

  //   // const TaskType = milTasks[i].Task;
  //   // const TaskName = $.trim(milTasks[i].Title.replace(milTasks[i].ProjectCode + '', '').replace(milTasks[i].Milestone + '', ''));

  //   //   if (task.MilestoneAllTasks.length > 0 && task.MilestoneAllTasks.find(c => c.type === TaskType && c.milestone === milTasks[i].Milestone)) {
  //   //     task.MilestoneAllTasks.find(c => c.type === TaskType).tasks.push(TaskName);
  //   //   }
  //   //   else {
  //   //     task.MilestoneAllTasks.push({ type: TaskType, milestone: milTasks[i].Milestone, tasks: [TaskName] });
  //   //   }

  // }


  async getMilestoneTasks(task) {

    let alltasks = [];
    if (this.arrMilestoneTasks.find(c => c.projectCode === task.ProjectCode && c.milestone === task.Milestone)) {
      let dbMilestoneTasks = this.arrMilestoneTasks.find(c => c.projectCode === task.ProjectCode && c.milestone === task.Milestone).MilestoneTasks;
      dbMilestoneTasks = dbMilestoneTasks.filter(c => c.Milestone === task.Milestone);
      alltasks = Array.from(new Set(dbMilestoneTasks.map(s => s.Task))).map(task => {
        return {
          type: task,
          milestone: dbMilestoneTasks.find(s => s.Task === task).Milestone,
          //tasks: []
          tasks: dbMilestoneTasks.filter(s => s.Task === task).map(c => $.trim(c.Title.replace(c.ProjectCode + '', '').replace(c.Milestone + '', '')))
        };
      });

      return alltasks;
    }
  }





  async OnRowExpand(event) {
    event.data.subTaskloaderenable = true;

    if (!event.data.MilestoneAllTasks) {
      event.data.MilestoneAllTasks = await this.getMilestoneTasks(event.data);
    }

    if (event.data.SlotTasks) {
      if (event.data.SlotTasks.length === 1 && event.data.SlotTasks[0].Id === undefined) {
        event.data.SlotTasks[0].editMode = true;
        event.data.SlotTasks[0].edited = true;
      }
      event.data.subTaskloaderenable = false;
    } else {
      event.data.SlotTasks = [];
      event.data.dbSlotTasks = [];
      const response = await this.caCommonService.getSlotTasks(event);
      if (response.length > 0) {
        for (const element of response) {
          if (element.Status !== 'Deleted') {
            element.nextTasks = element.NextTasks;
            element.prevTasks = element.PrevTasks;
            const obj = await this.GetTask(element, true);
            event.data.SlotTasks.push(obj);
          }
          event.data.dbSlotTasks.push(element);
        }
        event.data.subTaskloaderenable = false;
      } else {

        const tasks = await this.GetAllConstantTasks(event.data.Task);
        let count = 0;
        const constTask = event.data.MilestoneAllTasks.find(c => c.type === tasks[0] && c.milestone === event.data.Milestone);

        if (constTask) {
          count = constTask.tasks.filter(task => new RegExp(tasks[0], 'g').test(task)).length > 0 ?
            constTask.tasks.filter(task => new RegExp(tasks[0], 'g').test(task)).filter((v) => {
              return v.replace(/.*\D/g, '');
            }).map((v) => {
              return v.replace(new RegExp(tasks[0], 'g'), '');
              // tslint:disable: radix
            }).map(c => (!isNaN(c) ? parseInt(c) : 0)).length > 0 ?
              Math.max.apply(null, constTask.tasks.filter((task) => {
                return new RegExp(tasks[0], 'g').test(task);
              }).filter((v) => v.replace(/.*\D/g, '')).map((v) => {
                return v.replace(new RegExp(tasks[0], 'g'), '');
              }).map(c => (!isNaN(c) ? parseInt(c) : 0))) : 1 : 0;
        }

        event.data.TaskName = tasks.length > 0 ? count > 0 ? tasks[0] + ' ' + (count + 1) : tasks[0] : event.data.TaskName;
        // event.data.nextTasks = event.data.NextTasks;
        // event.data.prevTasks = event.data.PrevTasks;
        const obj = await this.GetTask(event.data, false);
        obj.editMode = true;
        obj.edited = true;
        obj.Status = 'Not Saved';
        event.data.SlotTasks.push(obj);
        if (event.data.MilestoneAllTasks.length > 0 && event.data.MilestoneAllTasks.find(c => c.type ===
          tasks[0] && c.milestone === event.data.Milestone)) {
          event.data.MilestoneAllTasks.find(c => c.type === tasks[0] && c.milestone === event.data.Milestone)
            .tasks.push(event.data.TaskName);
        } else {
          event.data.MilestoneAllTasks.push({ type: tasks[0], milestone: event.data.Milestone, tasks: [event.data.TaskName] });
        }
        console.log(event.data);
        event.data.subTaskloaderenable = false;
      }

      if (this.completeTaskArray.filter(c => c.ProjectCode === event.data.ProjectCode && c.Milestone === event.data.Milestone)) {
        this.completeTaskArray.filter(c => c.ProjectCode === event.data.ProjectCode && c.Milestone ===
          event.data.Milestone).map(c => c.MilestoneAllTasks = event.data.MilestoneAllTasks);
      }
    }
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

  async GetTask(task, IsdbTask) {


    const taskObj = $.extend(true, {}, this.caGlobal.caObject);
    const hrsMinObject = {
      timeHrs: task.TimeSpent != null ? task.TimeSpent.indexOf('.') > -1 ?
        task.TimeSpent.split('.')[0] : task.TimeSpent : '00',
      timeMins: task.TimeSpent != null ?
        task.TimeSpent.indexOf('.') > -1 ? task.TimeSpent.split('.')[1] : '00' : 0
    };
    task.projectCode = task.projectCode ? task.projectCode : task.ProjectCode;
    const projectItem = this.projects.filter((proj) => proj.ProjectCode === task.projectCode);
    const resourcesList = $.extend(true, [], this.resourceList);
    if (!task.TaskName) {
      task.TaskName = $.trim(task.Title.replace(task.ProjectCode + '', '').replace(task.Milestone + '', ''));
    }
    const resPool = this.caCommonService.getResourceByMatrix(resourcesList, task.Task ? task.Task : task.taskType ? task.taskType : '', task.SkillLevel,
      projectItem[0].ClientLegalEntity, projectItem[0].TA, projectItem[0].DeliverableType);
    //  resPool = this.caCommonService.sortResources(resPool, task);
    // task.Type && task.Type === 'Slot' ? task.Task : task.Task && task.Task !== 'Select One' ?
    //   task.Task : task.Task
    if (task.PreviousAssignedUser && task.PreviousAssignedUser.ID > -1 && task.CentralAllocationDone === 'No') {

      let ExistingUser = resPool.find(c => c.UserName.ID === task.PreviousAssignedUser.ID && c.UserName.Title === task.PreviousAssignedUser.Title);
      if (ExistingUser) {
        ExistingUser.userType = 'Previously Assigned';
      } else {
        ExistingUser = resourcesList.find(c => c.UserName.ID === task.PreviousAssignedUser.ID &&
          c.UserName.Title === task.PreviousAssignedUser.Title);
        if (ExistingUser) {
          ExistingUser.userType = 'Previously Assigned';
          resPool.push(ExistingUser);
        }
      }
    }
    const AssignedUserTimeZone = task.AssignedTo ? resourcesList.filter((objt) => {
      return task.AssignedTo.ID === objt.UserName.ID;
    }) : [];
    task.AssignedUserTimeZone = AssignedUserTimeZone && AssignedUserTimeZone.length > 0
      ? AssignedUserTimeZone[0].TimeZone.Title ?
        AssignedUserTimeZone[0].TimeZone.Title : '+5.5' : '+5.5';

    const convertedStartDate = task.StartDate ? this.commonService.calcTimeForDifferentTimeZone(new Date(task.StartDate),
      this.globalService.currentUser.timeZone, task.AssignedUserTimeZone) :
      this.commonService.calcTimeForDifferentTimeZone(new Date(task.StartDate),
        this.globalService.currentUser.timeZone, task.AssignedUserTimeZone);
    task.jsLocalStartDate = this.commonService.calcTimeForDifferentTimeZone(convertedStartDate,
      task.AssignedUserTimeZone, this.globalService.currentUser.timeZone);
    const convertedEndDate = task.DueDate ? this.commonService.calcTimeForDifferentTimeZone(new Date(task.DueDate),
      this.globalService.currentUser.timeZone, task.AssignedUserTimeZone) :
      this.commonService.calcTimeForDifferentTimeZone(new Date(task.DueDate),
        this.globalService.currentUser.timeZone, task.AssignedUserTimeZone);
    task.jsLocalEndDate = this.commonService.calcTimeForDifferentTimeZone(convertedEndDate,
      task.AssignedUserTimeZone, this.globalService.currentUser.timeZone);

    const SelectedResources = [];
    const resExt = $.extend(true, [], resPool);
    for (const retRes of resExt) {
      retRes.timeAvailable = 0;
      retRes.Color = 'green';
      SelectedResources.push(retRes);
    }

    taskObj.Id = task.ID ? task.ID : task.Id;
    taskObj.Task = task.Type && task.Type === 'Slot' ? task.TaskName : task.Task ? task.Task : task.taskType;
    taskObj.Task = taskObj.Task.split(' ')[0];
    taskObj.Timezone = task.timezone ? task.timezone : task.TimeZone;
    taskObj.Title = task.Title;
    taskObj.ProjectCode = task.projectCode ? task.projectCode : task.ProjectCode;
    taskObj.NextTasks = task.Type && task.Type === 'Slot' ? '' : task.nextTasks;
    taskObj.PrevTasks = task.Type && task.Type === 'Slot' ? '' : task.prevTasks;
    taskObj.Milestone = task.milestone ? task.milestone : task.Milestone;
    taskObj.TaskName = task.TaskName;
    taskObj.EstimatedTime = task.estimatedTime ? task.estimatedTime : task.ExpectedTime ?
      task.ExpectedTime : task.EstimatedTime ? task.EstimatedTime : '0';
    taskObj.StartTime = task.startDate ? task.startDate : task.StartDate;
    taskObj.EndTime = task.dueDate ? task.dueDate : task.DueDate;
    taskObj.StartDate = task.startDate ? new Date(task.startDate) : new Date(task.StartDate);
    taskObj.DueDate = task.dueDate ? new Date(task.dueDate) : new Date(task.DueDate);
    taskObj.UserStart = task.startDate ? new Date(task.startDate) : new Date(task.StartDate);
    taskObj.UserEnd = task.dueDate ? new Date(task.dueDate) : new Date(task.DueDate);
    taskObj.ProjectName = task.ProjectName;
    taskObj.SpentTime = this.commonService.addHrsMins([hrsMinObject]);
    taskObj.UserStartDatePart = this.getDatePart(convertedStartDate);
    taskObj.UserStartTimePart = this.getTimePart(convertedStartDate);
    taskObj.UserEndDatePart = this.getDatePart(convertedEndDate);
    taskObj.UserEndTimePart = this.getTimePart(convertedEndDate);
    taskObj.TaskScope = task.Comments;
    taskObj.resources = $.extend(true, [], resPool);
    taskObj.AssignedTo = task.assignedTo ? task.assignedTo : task.AssignedTo ? task.AssignedTo : [];
    taskObj.allocatedResource = task.AssignedTo && task.AssignedTo.hasOwnProperty('ID') && task.AssignedTo.ID > -1 ?
      resPool.find(c => c.UserName.ID === task.AssignedTo.ID && c.Title === task.AssignedTo.Title) ?
        resPool.find(c => c.UserName.ID === task.AssignedTo.ID && c.Title === task.AssignedTo.Title) : '' : '';
    taskObj.selectedResources = [];
    taskObj.mileStoneTask = [];
    taskObj.projectTask = [];
    taskObj.Status = task.status ? task.status : task.Status;
    taskObj.CentralAllocationDone = task.CentralAllocationDone;
    taskObj.AssignedUserTimeZone = task.AssignedUserTimeZone;
    taskObj.allowStart = task.AllowCompletion === true || task.AllowCompletion === 'Yes' ? true : false;
    taskObj.DisableCascade = task.DisableCascade && task.DisableCascade === 'Yes' ? true : false;
    taskObj.PreviousAssignedUser = task.PreviousAssignedUser;
    taskObj.SubMilestones = task.SubMilestones;

    if (taskObj.allocatedResource !== '') {
      await this.GetResourceOnEdit(taskObj);
    }

    if (IsdbTask) {
      taskObj.NextTasks = taskObj.NextTasks ? taskObj.NextTasks.replace(new RegExp(taskObj.ProjectCode + ' ', 'g'), '')
        .replace(new RegExp(taskObj.Milestone + ' ', 'g'), '').replace(/#/gi, '') : null;

      taskObj.PrevTasks = taskObj.PrevTasks ? taskObj.PrevTasks.replace(new RegExp(taskObj.ProjectCode + ' ', 'g'), '')
        .replace(new RegExp(taskObj.Milestone + ' ', 'g'), '').replace(/#/gi, '') : null;
    }

    return taskObj;
  }

  async  GetResourceOnEdit(task) {

    const setResourcesExtn = $.extend(true, [], task.resources);
    const startTime = new Date(new Date(task.StartTime).setHours(0, 0, 0, 0));
    const endTime = new Date(new Date(task.EndTime).setHours(23, 59, 59, 0));
    this.commonService.SetNewrelic('unallocated-allocated', 'CA', 'fetchUserBasedOnCapacity');
    const oCapacity = await this.usercapacityComponent.applyFilterReturn(startTime, endTime,
      setResourcesExtn, []);
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

    if (task.PreviousAssignedUser && task.PreviousAssignedUser.ID > -1 && task.CentralAllocationDone === 'No') {
      const resourcesList = $.extend(true, [], this.resourceList);
      let ExistingUser = res.find(c => c.UserName.ID === task.PreviousAssignedUser.ID
        && c.UserName.Title === task.PreviousAssignedUser.Title);
      if (ExistingUser) {
        ExistingUser.userType = 'Previously Assigned';
      } else {
        ExistingUser = resourcesList.find(c => c.UserName.ID === task.PreviousAssignedUser.ID &&
          c.UserName.Title === task.PreviousAssignedUser.Title);
        if (ExistingUser) {
          ExistingUser.userType = 'Previously Assigned';
          res.push(ExistingUser);
        }
      }
    }

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
    if (task.displayselectedResources.length > 1) {
      const response = await this.SortByGroupAssignTo(task.displayselectedResources);
      task.displayselectedResources = response;
    }

    if (task.displayselectedResources) {
      task.displayselectedResources.map(c => c.items).forEach(element => {
        task.allocatedResource = element.find(c => c.value.UserName.ID === task.AssignedTo.ID) ?
          element.find(c => c.value.UserName.ID === task.AssignedTo.ID).value : task.allocatedResource;
      });
    }
  }

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

    Node.StartDate = Node.UserStart;
    Node.DueDate = Node.UserEnd;
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

      const nextNode = Slot.SlotTasks.find(c => c.TaskName === element);
      if (new Date(previousNode.UserEnd) > new Date(nextNode.StartDate) && !nextNode.DisableCascade) {
        this.cascadeNode(previousNode, Slot, nextNode);
      }
    });
  }


  async cascadeNode(previousNode, Slot, currentnode) {

    const startDate = currentnode.StartDate;
    const endDate = currentnode.DueDate;
    var workingHours = this.workingHoursBetweenDates(startDate, endDate);
    currentnode.StartDate = previousNode.DueDate;
    currentnode.UserStart = this.commonService.calcTimeForDifferentTimeZone(currentnode.StartDate,
      this.globalService.currentUser.timeZone, currentnode.AssignedUserTimeZone);
    currentnode.UserStart = currentnode.UserStart.getHours() >= 19 ?
      this.checkStartDate(new Date(currentnode.UserStart.getFullYear(), currentnode.UserStart.getMonth(), (currentnode.UserStart.getDate() + 1), 9, 0)) :
      currentnode.UserStart;
    currentnode.UserEnd = this.checkEndDate(currentnode.UserStart, workingHours);
    currentnode.UserStartDatePart = this.getDatePart(currentnode.UserStart);
    currentnode.UserStartTimePart = this.getTimePart(currentnode.UserStart);
    currentnode.UserEndDatePart = this.getDatePart(currentnode.UserEnd);
    currentnode.UserEndTimePart = this.getTimePart(currentnode.UserEnd);
    currentnode.StartDate = this.commonService.calcTimeForDifferentTimeZone(currentnode.UserStart,
      currentnode.AssignedUserTimeZone, this.globalService.currentUser.timeZone);
    currentnode.DueDate = this.commonService.calcTimeForDifferentTimeZone(currentnode.UserEnd,
      currentnode.AssignedUserTimeZone, this.globalService.currentUser.timeZone);
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
      node.AssignedUserTimeZone, this.globalService.currentUser.timeZone);
    node.dueDate = this.commonService.calcTimeForDifferentTimeZone(node.UserEnd,
      node.AssignedUserTimeZone, this.globalService.currentUser.timeZone);
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


  async saveTasks(unt) {

    this.disableSave = true;
    const isValid = await this.validate();

    if (isValid) {
      this.loaderenable = true;
      setTimeout(() => {

        this.messageService.add({
          key: 'tc', severity: 'warn', sticky: true,
          summary: 'Info Message', detail: 'Updating...'
        });
        this.generateSaveTasks(unt);
      }, 300);
    }
    else {
      this.disableSave = false;
    }

  }


  async validate() {

    const EditedSlots = this.completeTaskArray.filter(c => c.editMode === true);

    const batchUrl = [];
    let UniqueProjectCodeArray = [];
    let dbAllProjectTasks = [];
    const ProjectCodeArray = EditedSlots.map(c => c.ProjectCode);
    if (ProjectCodeArray) {
      UniqueProjectCodeArray = ProjectCodeArray.filter((item, index) => ProjectCodeArray.indexOf(item) === index);
    }
    if (UniqueProjectCodeArray.length) {
      UniqueProjectCodeArray.forEach(element => {
        const projectObj = Object.assign({}, this.queryConfig);
        projectObj.url = this.spServices.getReadURL(this.globalConstant.listNames.Schedules.name,
          this.caConstant.tasks);
        projectObj.url = projectObj.url.replace(/{{ProjectCode}}/gi, element);
        projectObj.listName = this.globalConstant.listNames.Schedules.name;
        projectObj.type = 'GET';
        batchUrl.push(projectObj);
      });

      if (batchUrl.length) {
        this.commonService.SetNewrelic('CA', 'unallocated-allocatedtask', 'getProjectTasks');
        const result = await this.spServices.executeBatch(batchUrl);
        if (result) {
          dbAllProjectTasks = [].concat(...result.map(c => c.retItems));
        }
      }
    }

    for (const slot of EditedSlots) {
      if (slot.SlotTasks) {
        const checkTaskAllocatedTime = slot.SlotTasks.filter(e => (e.EstimatedTime === '' || +e.EstimatedTime === 0)
          && e.Status !== 'Completed');
        // tslint:enable
        if (checkTaskAllocatedTime.length > 0) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Allocated time for task cannot be equal or less than 0 for '
              + slot.ProjectCode + '-' + slot.Milestone + ' - ' + checkTaskAllocatedTime[0].Task
          });
          return false;
        }

        const compareDates = slot.SlotTasks.filter(e => (e.UserEnd <= e.UserStart && e.Status !== 'Completed'));
        if (compareDates.length > 0) {


          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'End date should be greater than start date of ' + compareDates[0].TaskName + ' task of '
              + slot.ProjectCode + '-' + slot.Milestone + ' - ' + slot.Task
          });
          return false;
        }


        let validateAllocation = true;

        slot.SlotTasks.forEach(element => {
          if (element.edited) {
            const title = element.allocatedResource ? element.allocatedResource.UserName.Title : null;
            if (!title) {
              validateAllocation = false;
            }
          }

        });
        if (!validateAllocation) {
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'All tasks of ' + slot.ProjectCode + '-' + slot.Milestone + ' - ' + slot.Task + ' should be assigned to   resource.'
          });
          return false;
        }
        const errorPresnet = this.validateTaskDates(slot.SlotTasks, slot);
        if (errorPresnet) {
          return false;
        }

        const compareTaskDates = slot.SlotTasks.filter(e => (slot.StartDate > e.UserStart && e.Status !== 'Completed'));
        if (compareTaskDates.length > 0) {

          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            // tslint:disable-next-line: max-line-length
            detail: 'start date of ' + compareTaskDates[0].TaskName + ' task  should be greater than start date of ' + slot.ProjectCode + '-' + slot.Milestone + ' - ' + slot.Task
          });
          return false;
        }

        const compareTaskEndDates = slot.SlotTasks.filter(e => (e.UserEnd > slot.DueDate && e.Status !== 'Completed'));
        if (compareTaskEndDates.length > 0) {

          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            // tslint:disable-next-line: max-line-length
            detail: 'end date of ' + compareTaskEndDates[0].TaskName + ' task  should be less than end date of ' + slot.ProjectCode + '-' + slot.Milestone + ' - ' + slot.Task
          });
          return false;
        }

        // check for task already exists new (Maxwell)

        const dbProjectTasks = dbAllProjectTasks.filter(c => c.ProjectCode === slot.ProjectCode && c.Milestone === slot.Milestone).map(c => $.trim(c.Title.replace(c.ProjectCode + '', '').replace(c.Milestone + '', '')));
        if (slot.SlotTasks.filter(c => c.Id === undefined)) {
          const ExisitingTasks = slot.SlotTasks.filter(c => c.Status === 'Not Saved').map(c => c.TaskName).filter(c => dbProjectTasks.includes(c))

          if (ExisitingTasks.length > 0) {
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              // tslint:disable-next-line: max-line-length
              detail: ExisitingTasks.join(', ') + ' task of ' + slot.ProjectCode + '-' + slot.Milestone + ' is already exist.'
            });
            return false;
          }
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
        const AllNextTasks = AllTasks.filter(c => (nextTasks.indexOf(c.TaskName) > -1));

        const SDTask = AllNextTasks.find(c => c.StartDate < task.DueDate && c.Status !== 'Completed'
          && c.Status !== 'Auto Closed' && c.Status !== 'Deleted' && c.allowStart === false);
        if (SDTask) {
          // this.errorMessageCount++;
          this.messageService.add({
            key: 'custom', severity: 'warn', summary: 'Warning Message',
            detail: 'Start Date of ' + SDTask.TaskName + '  should be greater than end date of ' +
              task.TaskName + ' in ' + slot.ProjectCode + '-' + slot.Milestone + ' - ' + slot.Task,
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




  // tslint:enable


  public async generateSaveTasks(unt) {

    const dbAddTasks = [];
    const dbUpdateTasks = [];
    let addedTasks = [];
    let updatedTasks = [];
    const updateSlot = [];
    const ProjectInformationObj = [];

    const EditedSlots = this.completeTaskArray.filter(c => c.editMode === true);
    for (const slot of EditedSlots) {
      if (slot.SlotTasks) {
        addedTasks = slot.SlotTasks.filter(e => e.Status === 'Not Saved');
        updatedTasks = slot.SlotTasks.filter(e => e.Status !== 'Completed' && e.Status !== 'Not Saved' && e.edited);
        if (addedTasks.length > 0) {
          slot.edited = true;
        }
        updateSlot.push(slot);
        if (ProjectInformationObj) {
          const project = ProjectInformationObj.find(c => c.projectCode === slot.ProjectCode);
          if (!project) {

            const batchUrl = [];
            const tasksObj = Object.assign({}, this.queryConfig);
            tasksObj.url = this.spServices.getReadURL(this.globalConstant.listNames.projectInfo.name,
              this.caConstant.projectResources);
            tasksObj.url = tasksObj.url.replace(/{{ProjectCode}}/gi, slot.ProjectCode);
            tasksObj.listName = this.globalConstant.listNames.projectInfo.name;
            tasksObj.type = 'GET';
            batchUrl.push(tasksObj);
            this.commonService.SetNewrelic('unallocated-allocated', 'CA', 'GetProjectInfoByProjectCode');
            const arrResult = await this.spServices.executeBatch(batchUrl);
            const oProjectDetails = arrResult.length ? arrResult[0].retItems[0] : [];
            const arrEditorsIds = this.getIDFromItem(oProjectDetails.Editors);
            const arrQualityCheckerIds = this.getIDFromItem(oProjectDetails.QC);
            const arrGraphicsIds = this.getIDFromItem(oProjectDetails.GraphicsMembers);
            const arrPubSupportIds = this.getIDFromItem(oProjectDetails.PSMembers);
            const arrallDeliveryIds = this.getIDFromItem(oProjectDetails.AllDeliveryResources);
            ProjectInformationObj.push({
              projectCode: slot.ProjectCode,
              projectId: oProjectDetails.ID,
              items: {
                arrEditorsIds, arrQualityCheckerIds, arrGraphicsIds, arrPubSupportIds, arrallDeliveryIds,
                qualityChecker: [], editors: [], graphics: [], pubSupport: []
              }
            });
          }
        }

        const tempProject = ProjectInformationObj.find(c => c.projectCode === slot.ProjectCode).items;
        if (slot.dbSlotTasks) {
          this.getSlotDeletedTasks(slot.SlotTasks, updatedTasks, slot.dbSlotTasks);
        }
        addedTasks.forEach(task => {


          if (task.allocatedResource && task.allocatedResource.UserName.hasOwnProperty('ID') && task.allocatedResource.UserName.ID !== -1) {
            switch (task.Task) {
              case 'QC':
              case 'Review-QC':
              case 'Inco-QC':
                tempProject.qualityChecker.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrQualityCheckerIds.push(task.allocatedResource.UserName.ID);
                break;
              case 'Edit':
              case 'Review-Edit':
              case 'Inco-Edit':
                tempProject.editors.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrEditorsIds.push(task.allocatedResource.UserName.ID);
                break;
              case 'Graphics':
              case 'Review-Graphics':
              case 'Inco-Graphics':
                tempProject.graphics.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrGraphicsIds.push(task.allocatedResource.UserName.ID);
                break;
              case 'Submit':
              case 'Galley':
                tempProject.pubSupport.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrPubSupportIds.push(task.allocatedResource.UserName.ID);
                break;
            }
          }
          dbAddTasks.push(this.setSlotTaskForAddUpdate(task, slot, true));


        });
        updatedTasks.forEach(task => {

          if (task.allocatedResource && task.allocatedResource.UserName.hasOwnProperty('ID') && task.allocatedResource.UserName.ID !== -1) {
            switch (task.Task) {
              case 'QC':
              case 'Review-QC':
              case 'Inco-QC':
                tempProject.qualityChecker.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrQualityCheckerIds.push(task.allocatedResource.UserName.ID);
                break;
              case 'Edit':
              case 'Review-Edit':
              case 'Inco-Edit':
                tempProject.editors.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrEditorsIds.push(task.allocatedResource.UserName.ID);
                break;
              case 'Graphics':
              case 'Review-Graphics':
              case 'Inco-Graphics':
                tempProject.graphics.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrGraphicsIds.push(task.allocatedResource.UserName.ID);
                break;
              case 'Submit':
              case 'Galley':
                tempProject.pubSupport.push({ ID: task.allocatedResource.UserName.ID, Name: task.allocatedResource.UserName.Title });
                tempProject.arrPubSupportIds.push(task.allocatedResource.UserName.ID);
                break;

            }
          }

          dbUpdateTasks.push(this.setSlotTaskForAddUpdate(task, slot, false));


        });

      }
    }

    const UpdateProjectInfo = [];
    for (const project of ProjectInformationObj) {


      project.items.arrEditorsIds = project.items.arrEditorsIds.filter((el) => {
        return el != null;
      });
      project.items.arrGraphicsIds = project.items.arrGraphicsIds.filter((el) => {
        return el != null;
      });
      project.items.arrQualityCheckerIds = project.items.arrQualityCheckerIds.filter((el) => {
        return el != null;
      });

      project.items.arrPubSupportIds = project.items.arrPubSupportIds.filter((el) => {
        return el != null;
      });

      project.items.allDeliveryRes = project.items.arrallDeliveryIds.filter((el) => {
        return el != null;
      });

      const updatedResources = {

        editor: { results: [...project.items.arrEditorsIds] },
        graphicsMembers: { results: [...project.items.arrGraphicsIds] },
        qualityChecker: { results: [...project.items.arrQualityCheckerIds] },
        pubSupportMembers: { results: [...project.items.arrPubSupportIds] },
        allDeliveryRes: []
      };

      updatedResources.allDeliveryRes = [...updatedResources.editor.results,
      ...updatedResources.graphicsMembers.results, ...updatedResources.qualityChecker.results,
      ...updatedResources.pubSupportMembers.results, ...project.items.allDeliveryRes];
      UpdateProjectInfo.push({ projectID: project.projectId, updatedResources });
    }
    this.completeSaveTask(dbAddTasks, dbUpdateTasks, updateSlot, UpdateProjectInfo, unt);
  }

  getIDFromItem(objItem) {
    let arrData = [];
    if (objItem.hasOwnProperty('results')) {
      arrData = objItem.results.map(a => a.ID);
    }

    return arrData;
  }

  getSlotDeletedTasks(SlotTasks, updatedTasks, dbSlotTasks) {
    const UpdatesTaskIds = SlotTasks.filter(c => c.Id !== undefined && c.Id > 0).map(c => c.Id);
    const DeletedTask = dbSlotTasks.filter((item) => {
      return UpdatesTaskIds.indexOf(item.Id) === -1;
    });
    if (DeletedTask) {
      DeletedTask.forEach(task => {
        task.previousTask = '';
        task.nextTask = '';
        task.Status = 'Deleted';
        updatedTasks.push(task);
      });
    }
  }

  async completeSaveTask(addedTasks, updatedTasks, updateSlot, UpdateProjectInfo, unt) {
    const batchUrl = [];
    for (const tasks of addedTasks) {
      // this.spServices.getChangeSetBodySC(batchContents, changeSetId, tasks.url, tasks.body, true);
      const TaskObj = Object.assign({}, this.queryConfig);
      TaskObj.url = tasks.url;
      TaskObj.listName = this.globalConstant.listNames.Schedules.name;
      TaskObj.type = 'POST';
      TaskObj.data = tasks.body;
      batchUrl.push(TaskObj);
    }

    for (const tasks of updatedTasks) {
      const taskObj = Object.assign({}, this.queryConfig);
      taskObj.url = tasks.url;
      taskObj.listName = this.globalConstant.listNames.Schedules.name;
      taskObj.type = 'PATCH';
      taskObj.data = tasks.body;
      batchUrl.push(taskObj);
    }

    for (const slot of updateSlot) {
      if (slot.CentralAllocationDone !== 'Yes') {
        const updateProjectBody = {
          __metadata: { type: 'SP.Data.SchedulesListItem' },
          CentralAllocationDone: 'Yes',
        };
        if (!slot.Id) {
          slot.Id = slot.id;
        }
        const taskObj = Object.assign({}, this.queryConfig);
        taskObj.url = this.spServices.getItemURL(this.globalConstant.listNames.Schedules.name, +slot.Id);
        taskObj.data = updateProjectBody;
        taskObj.listName = this.globalConstant.listNames.Schedules.name;
        taskObj.type = 'PATCH';
        batchUrl.push(taskObj);
      }
    }
    this.commonService.SetNewrelic('unallocated-allocated', 'CA', 'SaveTasks');
    const responseInLines = await this.executeBulkRequests(UpdateProjectInfo, batchUrl);
    if (responseInLines.length > 0) {
      let counter = 0;
      const endIndex = addedTasks.length;
      const respBatchUrl = [];
      for (const resp of responseInLines) {

        // tslint:disable: max-line-length
        const fileUrl = this.globalService.sharePointPageObject.serverRelativeUrl + '/Lists/' + this.globalConstant.listNames.Schedules.name + '/' + resp.ID + '_.000';
        let moveFileUrl = this.globalService.sharePointPageObject.serverRelativeUrl + '/Lists/' + this.globalConstant.listNames.Schedules.name + '/' + resp.ProjectCode;
        if (counter < endIndex) {
          moveFileUrl = moveFileUrl + '/' + resp.Milestone + '/' + resp.ID + '_.000';
          const url = this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/getfilebyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "',flags=1)";
          // this.spServices.getChangeSetBodyMove(batchContents, changeSetId, url);
          const moveItemObj = Object.assign({}, this.queryConfig);
          moveItemObj.url = url; // this.spServices.getMoveURL(fileUrl, moveFileUrl);
          moveItemObj.listName = 'Move Item';
          moveItemObj.type = 'POST';

          respBatchUrl.push(moveItemObj);
        } else {
          break;
        }

        counter = counter + 1;
      }
      this.commonService.SetNewrelic('unallocated-allocated', 'CA', 'MoveSaveTask');
      await this.spServices.executeBatch(respBatchUrl);
    }
    this.messageService.clear();
    await this.getProperties();

    this.messageService.add({
      severity: 'success', summary: 'Success Message',
      detail: ' Slots updated Sucessfully '
    });

    if (unt) {
      this.caGlobal.loading = true;
      this.caCommonService.filterAction(unt.multiSortMeta, unt.sortOrder, unt.filters.hasOwnProperty('global') ?
        unt.filters.global.value : null, unt.filters, unt.first, unt.rows,
        this.completeTaskArray, this.filterColumns);
    }
  }

  async executeBulkRequests(UpdateProjectInfo, batchUrl) {

    for (const project of UpdateProjectInfo) {
      let updateProjectRes = {};
      const projectID = project.projectID;
      updateProjectRes = {
        __metadata: { type: 'SP.Data.ProjectInformationListItem' },

        EditorsId: { results: project.updatedResources.editor.results },
        AllDeliveryResourcesId: { results: project.updatedResources.allDeliveryRes },
        QCId: { results: project.updatedResources.qualityChecker.results },
        GraphicsMembersId: { results: project.updatedResources.graphicsMembers.results },
        PSMembersId: { results: project.updatedResources.pubSupportMembers.results },
      };
      const updatePrjObj = Object.assign({}, this.queryConfig);
      updatePrjObj.url = this.spServices.getItemURL(this.globalConstant.listNames.ProjectInformation.name, +projectID);
      updatePrjObj.listName = this.globalConstant.listNames.ProjectInformation.name;
      updatePrjObj.type = 'PATCH';
      updatePrjObj.data = updateProjectRes;
      batchUrl.push(updatePrjObj);
    }

    let response = await this.spServices.executeBatch(batchUrl);
    response = response.length ? response.map(a => a.retItems) : [];
    return response;
  }

  setSlotTaskForAddUpdate(task, slot, bAdd) {
    let url = '';
    let data = {};
    if (task.Status === 'Not Saved') {
      task.Status = 'Not Started';
    }

    if (task.assignedUserChanged && task.Status === 'Not Started') {
      this.sendMail(task, slot);
      task.assignedUserChanged = false;
    }



    if (bAdd) {

      const addData = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        StartDate: task.StartDate,
        DueDate: task.DueDate,
        ExpectedTime: '' + task.EstimatedTime,
        AllowCompletion: task.allowStart === true ? 'Yes' : 'No',
        AssignedToId: task.allocatedResource ? task.allocatedResource.UserName.hasOwnProperty('ID') ?
          task.allocatedResource.UserName.ID : -1 : -1,
        TimeZone: task.allocatedResource ? task.allocatedResource.TimeZone.hasOwnProperty('Title')
          ? task.allocatedResource.TimeZone.Title : '+5.5' : '+5.5',
        Comments: task.TaskScope,
        Status: task.Status,
        NextTasks: this.setPreviousAndNext(task.NextTasks, slot.Milestone, slot.ProjectCode),
        PrevTasks: this.setPreviousAndNext(task.PrevTasks, slot.Milestone, slot.ProjectCode),
        ParentSlot: slot.id ? slot.id : slot.Id,
        ProjectCode: slot.ProjectCode,
        Task: task.Task,
        Milestone: slot.Milestone,
        SubMilestones: slot.SubMilestones,
        Title: slot.ProjectCode + ' ' + slot.Milestone + ' ' + task.TaskName,
        CentralAllocationDone: 'Yes',
        IsCentrallyAllocated: 'No',
        DisableCascade: task.DisableCascade === true ? 'Yes' : 'No'
      };
      url = this.spServices.getReadURL(this.globalConstant.listNames.Schedules.name);
      data = addData;
    } else {
      const updateData = {
        __metadata: { type: 'SP.Data.SchedulesListItem' },
        ID: task.Id,
        StartDate: task.StartDate,
        DueDate: task.DueDate,
        Status: task.Status,
        ExpectedTime: task.EstimatedTime ? '' + task.EstimatedTime : '' + task.ExpectedTime,
        AllowCompletion: task.allowStart === true ? 'Yes' : 'No',
        AssignedToId: task.allocatedResource ? task.allocatedResource.UserName.hasOwnProperty('ID') ?
          task.allocatedResource.UserName.ID : -1 : -1,
        TimeZone: task.allocatedResource ? task.allocatedResource.TimeZone.hasOwnProperty('Title')
          ? task.allocatedResource.TimeZone.Title : '+5.5' : '+5.5',
        Comments: task.TaskScope ? task.TaskScope : '',
        NextTasks: task.Status !== 'Deleted' ? this.setPreviousAndNext(task.NextTasks, slot.Milestone, slot.ProjectCode) : '',
        PrevTasks: task.Status !== 'Deleted' ? this.setPreviousAndNext(task.PrevTasks, slot.Milestone, slot.ProjectCode) : '',
        CentralAllocationDone: 'Yes',
        IsCentrallyAllocated: 'No',
        DisableCascade: task.DisableCascade === true ? 'Yes' : 'No',
        PreviousAssignedUserId: task.PreviousAssignedUser ? task.PreviousAssignedUser.hasOwnProperty('ID') ?
          task.PreviousAssignedUser.ID : -1 : -1,
      };
      url = this.spServices.getItemURL(this.globalConstant.listNames.Schedules.name, +task.Id);
      data = updateData;
    }
    return {
      body: data,
      url
    };
  }

  setPreviousAndNext(sText, sMilestone, sProject) {
    let sVal = '';

    if (sText) {
      const arrVal = sText.split(';');
      const arrNewVal = [];
      for (let val of arrVal) {
        val = val.replace(sProject + ' ', '');
        val = val.replace(sMilestone + ' ', '');
        arrNewVal.push(sProject + ' ' + sMilestone + ' ' + val);
      }

      sVal = arrNewVal.join(';#');
    }

    return sVal;
  }


}
