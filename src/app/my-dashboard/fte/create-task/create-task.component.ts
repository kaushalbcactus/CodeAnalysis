import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ComponentRef, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { Router, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { MyDashboardConstantsService } from '../../services/my-dashboard-constants.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent implements OnInit {

  @Input() formType: string;
  @Input() currentUserInfo: any;
  @Input() events: any;
  @Output() messageEvent: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line: variable-name
  create_task_form: FormGroup;
  createTaskModal: boolean;
  selectedRowItem: any;

  fteProjectsList: any = [];
  milestonesList: any = [];
  subMilestonesList: any = [];
  subMilestonesArrayList: any[];
  taskArrayList: any[];

  submitBtn: any = {
    isClicked: false
  };

  formSubmit: any = {
    isSubmit: false
  };

  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  fteProjectArrayList: any = [];
  maxDate: Date;
  minDateValue: Date;

  yearsRange = new Date().getFullYear() - 1 + ':' + (new Date().getFullYear() + 10);
  defaultStartTime: any;

  subMilestonesArrayFormat: any = [];
  createSubMilestone: boolean;
  enteredSubMile: string;

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

  constructor(
    private fb: FormBuilder,
    private spOperationsService: SPOperationService,
    public constantsService: ConstantsService,
    public globalService: GlobalService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private router: Router,
    private datePipe: DatePipe,
    private commonService: CommonService,
  ) {
  }

  MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  async ngOnInit() {
    if (this.formType === 'createTask') {
      this.createTaskFormField();
      await this.getFTEProjects();
      this.createTaskModal = true;
    }
    this.selectedRowItem = this.events;

    this.defaultStartTime = '07:00 AM';
    this.minDateValue = this.commonService.getLastWorkingDay(3, new Date());
  }

  createTaskFormField() {
    this.create_task_form = this.fb.group({
      ProjectCode: ['', Validators.required],
      Milestones: ['', Validators.required],
      SubMilestones: ['', [Validators.required, Validators.maxLength(30)]],
      StartDate: [new Date(), Validators.required],
      StartTime: ['09:00 AM', Validators.required],
      EndDate: [new Date(), Validators.required],
      EndTime: ['07:00 PM', Validators.required],
      Comments: [''],
    });
  }

  cancelFormSub(formtype: string) {
    this.formSubmit.isSubmit = false;
    this.submitBtn.isClicked = false;
    if (formtype === 'createTask') {
      this.createTaskModal = false;
    }
  }

  get isValidCreateTaskForm() {
    return this.create_task_form.controls;
  }

  async getFTEProjects() {
    this.constantsService.loader.isWaitDisable = false;
    this.fteProjectsList = [];
    this.milestonesList = [];
    const batchUrl = [];
    const pInfoObj = Object.assign({}, this.queryConfig);
    const pinfoQuery = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.FTEProjectInformations);
    pinfoQuery.filter = pinfoQuery.filter.replace('{{userId}}', this.currentUserInfo.Id.toString());
    pInfoObj.url = this.spOperationsService.getReadURL(this.constantsService.listNames.ProjectInformation.name, pinfoQuery
    );
    pInfoObj.listName = this.constantsService.listNames.ProjectInformation.name;
    pInfoObj.type = 'GET';
    batchUrl.push(pInfoObj);
    this.commonService.SetNewrelic('MyDashboard', 'fteCreateTask', 'getFTEProjects', 'GET');
    const res = await this.spOperationsService.executeBatch(batchUrl);
    this.fteProjectArrayList = res.length ? res[0].retItems : [];

    this.fteProjectsList = this.fteProjectArrayList;
    if (this.fteProjectArrayList.length === 1) {
      this.setMilestones(this.fteProjectArrayList[0]);
      this.fteProjectArrayList[0]['FormatedMilestones'] = this.milestonesList;
      this.create_task_form.patchValue({
        ProjectCode: this.fteProjectsList[0]
      });
      await this.getSubmilestones(this.create_task_form.value.ProjectCode.ProjectCode, this.create_task_form.value.Milestones.value);
    } else {
      this.milestonesList = [];
    }

    this.constantsService.loader.isWaitDisable = true;
  }
  onChangeDD(value: any, ddType: string) {
    if (value) {
      if (ddType === 'ProjectCode') {
        console.log('Value ', value);
        this.milestonesList = [];
        this.create_task_form.patchValue({
          SubMilestones: ''
        });
        if (this.fteProjectsList.length >= 2) {
          this.setMilestones(value);
          this.getSubmilestones(this.create_task_form.value.ProjectCode.ProjectCode, this.create_task_form.value.Milestones.value);
        }
      } else if (ddType === 'Milestone') {
        this.updateSDate();
      } else if (ddType === 'SubMilestone') {
        this.createSubMilestone = false;
        this.enteredSubMile = '';
      }
    }
  }

  clearFilter(dropdown: Dropdown) {
    // if (dropdown.clearClick) {
      this.create_task_form.value.SubMilestones = '';
      dropdown.resetFilter();
      dropdown.focus();
    // }
  }

  onSearchChange(val) {
    this.enteredSubMile = val;
    this.createSubMilestone = true;
  }

  setMilestones(items: any) {
    const formatedMilestones = items.Milestones ? items.Milestones.split(';#') : [];
    if (items.Milestone) {
      const milestone = items.Milestone;
      const milestoneInd = formatedMilestones.indexOf(milestone);
      const array = [];
      if (milestoneInd) {
        array.push({ label: formatedMilestones[milestoneInd - 1], value: formatedMilestones[milestoneInd - 1] });
        array.push({ label: formatedMilestones[milestoneInd], value: formatedMilestones[milestoneInd] });
      } else {
        const element = formatedMilestones[milestoneInd];
        array.push({ label: element, value: element });
      }
      this.milestonesList = array;
      this.create_task_form.patchValue({
        Milestones: this.milestonesList[milestoneInd ? 1 : 0]
      });
      this.updateSDate();
    }
    // this.getTaskList(this.create_task_form.value.ProjectCode, this.create_task_form.value.Milestones);
  }

  updateSDate() {
    const mindex = this.MONTH_NAMES.indexOf(this.create_task_form.value.Milestones.value);
    const cmIndex = new Date().getMonth();
    const year = new Date().getFullYear();
    const month = this.create_task_form.value.Milestones.value;
    if (mindex <= cmIndex) {
      const date = (this.MONTH_NAMES.indexOf(month) + 1) + '-' + new Date().getDate() + '-' + year;
      this.minDateValue = this.commonService.getLastWorkingDay(3, new Date(date));
    } else {
      const date = (this.MONTH_NAMES.indexOf(month) + 1) + '-' + new Date().getDate() + '-' + (year - 1);
      this.minDateValue = this.commonService.getLastWorkingDay(3, new Date(date));
    }
  }

  async getSubmilestones(projectCode, milestone) {
    const batchUrl = [];
    const dataObj = Object.assign({}, this.queryConfig);
    const schedulesQuery = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.FTESchedulesSubMilestones);
    schedulesQuery.filter = schedulesQuery.filter.replace('{{ProjectCode}}', projectCode).replace('{{Milestone}}', milestone);
    dataObj.url = this.spOperationsService.getReadURL(this.constantsService.listNames.Schedules.name, schedulesQuery);
    dataObj.listName = this.constantsService.listNames.Schedules.name;
    dataObj.type = 'GET';
    batchUrl.push(dataObj);

    // Task list
    const taskObj = Object.assign({}, this.queryConfig);
    const taskQuery = Object.assign({}, this.myDashboardConstantsService.mydashboardComponent.FTESchedulesTask);
    taskQuery.filter = taskQuery.filter.replace('{{ProjectCode}}', projectCode).replace('{{Milestone}}', milestone);
    taskObj.url = this.spOperationsService.getReadURL(this.constantsService.listNames.Schedules.name, taskQuery);
    taskObj.listName = this.constantsService.listNames.Schedules.name;
    taskObj.type = 'GET';
    batchUrl.push(taskObj);
    this.commonService.SetNewrelic('MyDashboard', 'fteCreateTask', 'getSubmilestones', 'GET-BATCH');
    const res = await this.spOperationsService.executeBatch(batchUrl);
    this.subMilestonesArrayList = res.length ? res[0].retItems : [];
    this.taskArrayList = res.length ? res[1].retItems : [];
    console.log('this.taskArrayList ', this.taskArrayList);
    if (this.subMilestonesArrayList.length) {
      this.setSubmilestones(this.subMilestonesArrayList[0]);
    }
    console.log('this.subMilestonesArrayList ', this.subMilestonesArrayList);
  }

  setSubmilestones(items) {
    this.subMilestonesArrayFormat = [];
    this.subMilestonesArrayFormat = items.SubMilestones ? items.SubMilestones.split(';#') : [];
    this.subMilestonesArrayFormat = this.subMilestonesArrayFormat.filter(value => Object.keys(value).length !== 0);
    const array = [];
    this.subMilestonesArrayFormat.forEach(element => {
      element ? array.push({ label: element.split(':')[0], value: element }) : '';
    });
    this.subMilestonesList = array;
  }

  onCloseStartDate() {
    if (this.create_task_form.value.StartDate > this.create_task_form.value.EndDate) {
      this.create_task_form.patchValue({
        EndDate: this.create_task_form.value.StartDate
      });
    }
  }

  validateTask(): string {
    const task = {
      pUserStart: this.create_task_form.value.StartDate,
      pUserEnd: this.create_task_form.value.EndDate,
    };
    const errorMsgs = this.commonService.validateTaskDuration([task], 50);
    return errorMsgs;
  }

  SetTime(time, type: string) {
    let endTime;
    const startTime = type === 'startTime' ? time.split(':')[0] % 12 + ':' + time.split(':')[1]
      : endTime = time.split(':')[0] % 12 + ':' + time.split(':')[1];
    console.log('Start time: ', startTime + ' endTime ', endTime);
  }

  checkSubMilestone(val) {
    if (val) {
      const alphaExp = new RegExp(this.constantsService.REG_EXPRESSION.ALPHA_SPECIAL);
      if (!alphaExp.test(val)) {
        return false;
      }
      const item = val + ':1:In Progress';
      const lowerCaseSubMile = this.subMilestonesArrayFormat && this.subMilestonesArrayFormat.length ?
        this.subMilestonesArrayFormat.map((ele) => ele.toLowerCase()) : [];
      const found = lowerCaseSubMile.indexOf(item.toLowerCase());
      if (found === -1) {
        this.createSubMilestone = true;
        this.subMilestonesArrayFormat.push(item);
      } else {
        this.createSubMilestone = false;
      }
      return true;
    }
  }

  onFormSubmit(type: string) {
    const batchUrl = [];
    this.formSubmit.isSubmit = true;
    this.submitBtn.isClicked = true;
    if (type === 'createTask') {
      if(!this.checkSubMilestone(this.enteredSubMile)) {
        this.commonService.showToastrMessage(this.constantsService.MessageType.error,
          'Special characters are not allowed for submilestone', true);
        this.submitBtn.isClicked = false;
        return false;
      }
      if (this.create_task_form.invalid) {
        this.submitBtn.isClicked = false;
        return false;
      }
      const errorMsgs = this.validateTask();
      if (errorMsgs) {
        this.submitBtn.isClicked = false;
        this.commonService.showToastrMessage(this.constantsService.MessageType.error, errorMsgs, true);
        return false;
      }
      this.submitBtn.isClicked = true;
      const startTime = this.commonService.ConvertTimeformat(24, this.create_task_form.value.StartTime);
      const endTime = this.commonService.ConvertTimeformat(24, this.create_task_form.value.EndTime);

      if (this.createSubMilestone) {
        const array = [];
        this.subMilestonesArrayFormat.forEach(ele => {
          if (!ele.includes(';#')) {
            array.push(ele);
          } else {
            array.push(ele);
          }
        });

        let milestoneDataObj = {};
        milestoneDataObj = {
          SubMilestones: array.join(';#')
        };

        /* tslint:disable:no-string-literal */
        milestoneDataObj['__metadata'] = { type: this.constantsService.listNames.Schedules.type };
        /* tslint:enable:no-string-literal */

        const milestoneObj = Object.assign({}, this.queryConfig);
        milestoneObj.url = this.spOperationsService.getItemURL(
          this.constantsService.listNames.Schedules.name, this.subMilestonesArrayList[0].ID);
        milestoneObj.listName = this.constantsService.listNames.Schedules.name;
        milestoneObj.type = 'PATCH';
        milestoneObj.data = milestoneDataObj;
        batchUrl.push(milestoneObj);
      }

      let taskObj = {};
      const taskLength = this.taskArrayList.length ? this.taskArrayList.length + 1 : '';
      taskObj = {
        Title: this.create_task_form.value.ProjectCode.ProjectCode + ' ' + this.create_task_form.value.Milestones.value + ' ' +
          this.create_task_form.value.ProjectCode.ServiceLevel + ' ' + taskLength.toString(),
        Entity: '',
        ProjectCode: this.create_task_form.value.ProjectCode.ProjectCode,
        Task: this.create_task_form.value.ProjectCode.ServiceLevel,
        StartDate: this.datePipe.transform(new Date(this.create_task_form.value.StartDate),
          'yyyy-MM-dd' + 'T' + startTime + ':00.000'),
        DueDateDT: this.datePipe.transform(this.create_task_form.value.EndDate,
          'yyyy-MM-dd' + 'T' + endTime + ':00.000'),
        ExpectedTime: '0',
        TimeSpent: '',
        CommentsMT: this.create_task_form.value.Comments,
        TaskComments: '',
        Status: 'Not Started',
        AssignedToId: this.currentUserInfo.Id.toString(),
        TimeZoneNM: this.globalService.DashboardData.ResourceCategorization.find(c => c.ID ===
          this.globalService.currentUser.userId) !== undefined ?
          this.globalService.DashboardData.ResourceCategorization.find(c => c.ID ===
            this.globalService.currentUser.userId).TimeZone !== undefined ?
            this.globalService.DashboardData.ResourceCategorization.find(c => c.ID ===
              this.globalService.currentUser.userId).TimeZone.Title : 5.5 : 5.5,
        TATStatus: 'No',
        SubMilestones: this.create_task_form.value.SubMilestones.label ? this.create_task_form.value.SubMilestones.label :
          this.create_task_form.value.SubMilestones,
        Milestone: this.create_task_form.value.Milestones.label ? this.create_task_form.value.Milestones.value : '',
        AllowCompletion: 'No',
        TATBusinessDays: this.commonService.calcBusinessDays(new Date(this.create_task_form.value.StartDate),
          new Date(this.create_task_form.value.EndDate)),
        IsCentrallyAllocated: 'No',
        ActiveCA: 'No',
        DisableCascade: 'Yes',
        ContentTypeCH: this.constantsService.CONTENT_TYPE.TASK,
      };
      /* tslint:disable:no-string-literal */
      taskObj['__metadata'] = { type: this.constantsService.listNames.Schedules.type };
      /* tslint:enable:no-string-literal */

      const invObj = Object.assign({}, this.queryConfig);
      invObj.url = this.spOperationsService.getReadURL(this.constantsService.listNames.Schedules.name);
      invObj.listName = this.constantsService.listNames.Schedules.name;
      invObj.type = 'POST';
      invObj.data = taskObj;
      this.getNumberOfDays(this.create_task_form.value.StartDate);
      batchUrl.push(invObj);
      console.log('final batchUrl ', batchUrl);

      this.submit(batchUrl);
    }
  }

  async submit(batchUrl: any) {
    this.constantsService.loader.isWaitDisable = false;
    // let batchUrl = [];
    // batchUrl.push(data);
    if (batchUrl.length) {
      this.commonService.SetNewrelic('MyDashboard', 'fteCreateTask', 'CreateTask', 'POST-BATCH');
      const res: any = await this.spOperationsService.executeBatch(batchUrl);
      console.log('res ', res);
      if (res.length) {
        if (res[0].retItems.hasError) {
          const errorMsg = res[0].retItems.message.value;
          this.commonService.showToastrMessage(this.constantsService.MessageType.error,errorMsg,false);
          return false;
        }
        // const response = res[0].retItems;
        // const fileUrl = this.globalService.sharePointPageObject.serverRelativeUrl + '/Lists/'
        //   + this.constantsService.listNames.Schedules.name + '/' + response.ID + '_.000';
        // let moveFileUrl = this.globalService.sharePointPageObject.serverRelativeUrl + '/Lists/'
        //   + this.constantsService.listNames.Schedules.name + '/' + this.create_task_form.value.ProjectCode.ProjectCode;
        // moveFileUrl = moveFileUrl + '/' + response.Milestone + '/' + response.ID + '_.000';
        // const url = this.globalService.sharePointPageObject.webAbsoluteUrl
        //   + "/_api/web/getfilebyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "',flags=1)";
        // // this.spServices.getChangeSetBodyMove(batchContents, changeSetId, url);
        // const moveItemObj = Object.assign({}, this.queryConfig);
        // moveItemObj.url = url; // this.spServices.getMoveURL(fileUrl, moveFileUrl);
        // moveItemObj.listName = 'Move Item';
        // moveItemObj.type = 'POST';
        // batchUrl = [];
        // batchUrl.push(moveItemObj);

        // const moveToMilestoneRes: any = await this.spOperationsService.executeBatch(batchUrl);
        // console.log('res ', moveToMilestoneRes);

        this.commonService.showToastrMessage(this.constantsService.MessageType.success,'Task Created',false);
        this.refetchTaskList();
        this.constantsService.loader.isWaitDisable = true;
        this.createTaskModal = false;
      }
    }
  }

  refetchTaskList() {
    if (this.router.url.includes('my-current-tasks')) {
      this.myDashboardConstantsService.setOpenTaskTabValue(this.myDashboardConstantsService.openTaskSelectedTab);
    } else if (this.router.url.includes('my-timeline')) {
      const s = this.datePipe.transform(new Date(this.create_task_form.value.StartDate), 'EEE MMM dd yyyy');
      const s1 = new Date(new Date().setDate((new Date(s).getDate() - new Date(s).getDay())));
      const e = this.datePipe.transform(new Date(this.create_task_form.value.EndDate), 'EEE MMM dd yyyy');
      const e1 = new Date(new Date().setDate((new Date(e).getDate() - new Date(e).getDay()) + 6));
      const obj = {
        isFirstLoad: false,
        gotoDate: this.datePipe.transform(new Date(this.create_task_form.value.StartDate), 'yyyy-MM-dd'),
        startDate: s1,
        endDate: e1,
      };
      this.myDashboardConstantsService.setTimelineTabValue(obj);
    } else {
      this.router.navigate(['myDashboard/my-current-tasks']);
    }
  }

  // tslint:disable-next-line: variable-name
  compare_dates = (date1, date2) => {
    if (date1 > date2) {
      return ('2daysDate > startDate');
    } else if (date1 < date2) {
      return ('startDate > 2daysDate');
    } else { return ('2daysDate = startDate'); }
  }

  getNumberOfDays(sDate) {
    const as = this.datePipe.transform(new Date(sDate), 'dd MMM yyyy');
    const as1 = this.datePipe.transform(new Date(), 'dd MMM yyyy');
    const todayDate: any = new Date(as1);
    const startDate: any = new Date(as);
    const diffTime = Math.abs(startDate - todayDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffDays);
    let nextDays = false;
    let pastdays = false;
    let todays = false;
    const a = this.compare_dates(todayDate, startDate);
    if (a === '2daysDate > startDate') {
      pastdays = true;
    } else if (a === 'startDate > 2daysDate') {
      nextDays = true;
    } else if ('2daysDate = startDate') {
      todays = true;
    }

    const days = diffDays;
    if (todays) {
      this.myDashboardConstantsService.openTaskSelectedTab.event = 'Today';
      this.myDashboardConstantsService.openTaskSelectedTab.days = 0;
      return;
    } else if (nextDays) {
      switch (true) {
        case (days <= 7): {
          this.myDashboardConstantsService.openTaskSelectedTab.event = 'Next';
          this.myDashboardConstantsService.openTaskSelectedTab.days = 7;
          break;
        }
        case (days <= 14): {
          this.myDashboardConstantsService.openTaskSelectedTab.event = 'Next';
          this.myDashboardConstantsService.openTaskSelectedTab.days = 14;
          break;
        }
        default: {
          this.myDashboardConstantsService.openTaskSelectedTab.event = 'Custom';
          this.myDashboardConstantsService.openTaskSelectedTab.days = 0;
          break;
        }
      }

    } else if (pastdays) {
      switch (true) {
        case (days <= 7): {
          this.myDashboardConstantsService.openTaskSelectedTab.event = 'Past';
          this.myDashboardConstantsService.openTaskSelectedTab.days = 7;
          break;
        }
      }

    }
  }


}
