import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ComponentRef, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PubsuportConstantsService } from 'src/app/pubsupport/Services/pubsuport-constants.service';
import { MessageService, SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { MyDashboardConstantsService } from '../../services/my-dashboard-constants.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { MyCurrentCompletedTasksComponent } from '../../my-current-completed-tasks/my-current-completed-tasks.component';
import { Subscription } from 'rxjs';

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
  subMilestonesList: SelectItem[];

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
  yearsRange = new Date().getFullYear() + ':' + (new Date().getFullYear() + 10);
  defaultStartTime: any;

  constructor(
    private fb: FormBuilder,
    private spOperationsService: SPOperationService,
    public constantsService: ConstantsService,
    public globalService: GlobalService,
    private myDashboardConstantsService: MyDashboardConstantsService,
    private messageService: MessageService,
    private router: Router,
    private datePipe: DatePipe,
    private commonService: CommonService
  ) {
  }

  async ngOnInit() {
    if (this.formType === 'createTask') {
      this.createTaskFormField();
      await this.getFTEProjects();
      this.createTaskModal = true;
    }
    this.selectedRowItem = this.events;

    this.defaultStartTime = '07:00 AM';
  }

  createTaskFormField() {
    this.create_task_form = this.fb.group({
      ProjectCode: ['', Validators.required],
      Milestones: ['', Validators.required],
      SubMilestones: ['', Validators.required],
      StartDate: [new Date(), Validators.required],
      StartTime: ['09:00 AM', Validators.required],
      EndDate: [new Date(), Validators.required],
      EndTime: ['07:00 PM', Validators.required],
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
    this.constantsService.loader.isPSInnerLoaderHidden = false;
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
    const res = await this.spOperationsService.executeBatch(batchUrl);
    this.fteProjectArrayList = res.length ? res[0].retItems : [];

    // this.fteProjectArrayList.push({
    //   ClientLegalEntity: 'KB_Test_Apr',
    //   ID: '894',
    //   Id: '894',
    //   Milestones: 'Draft 2',
    //   ProjectCode: 'KBT01-FTE-200151',
    //   ProjectFolder: '"/sites/medcomdev/KB_Test_Apr/KBT01-FTE-200150',
    //   Status: 'In Progress',
    //   Title: 'Test-Nov11',
    //   WBJID: 'Test-Nov11',
    // });

    this.fteProjectsList = this.fteProjectArrayList;
    this.setMilestones(this.fteProjectArrayList[0]);
    if (this.fteProjectArrayList.length === 1) {
      this.fteProjectArrayList[0]['Milestones'] = this.milestonesList;
      this.create_task_form.patchValue({
        ProjectCode: this.fteProjectsList[0],
        Milestones: this.milestonesList[0]
      });
      await this.getSubmilestones(this.create_task_form.value.ProjectCode.ProjectCode, this.create_task_form.value.Milestones.value);
    } else {
      this.milestonesList = [];
    }

    this.constantsService.loader.isPSInnerLoaderHidden = true;
  }

  onChangeDD(value: any, ddType: string) {
    if (ddType === 'ProjectCode') {
      console.log('Value ', value);
      this.setMilestones(value);
    } else if (ddType === 'Milestone') {
      console.log('Value ', value);
      this.getSubmilestones(this.create_task_form.value.ProjectCode.ProjectCode, this.create_task_form.value.Milestones.value);
    }
  }

  setMilestones(items: any) {
    const formatedMilestones = items.Milestones.split(';#');
    const array = [];
    formatedMilestones.forEach(element => {
      array.push({ label: element, value: element });
    });
    this.milestonesList = array;
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
    const res = await this.spOperationsService.executeBatch(batchUrl);
    this.subMilestonesList = res.length ? res[0].retItems : [];
    if (this.subMilestonesList.length) {
      this.setSubmilestones(this.subMilestonesList[0]);
    }
    console.log('this.subMilestonesList ', this.subMilestonesList);
  }

  setSubmilestones(items) {
    const formatedSubMilestones = items.SubMilestones.split(';#');
    const array = [];
    formatedSubMilestones.forEach(element => {
      array.push({ label: element.split(':')[0], value: element });
    });
    this.subMilestonesList = array;
  }

  SetTime(time, type: string) {
    let endTime;
    const startTime = type === 'startTime' ? time.split(':')[0] % 12 + ':' + time.split(':')[1]
      : endTime = time.split(':')[0] % 12 + ':' + time.split(':')[1];
    console.log('Start time: ', startTime + ' endTime ', endTime);
  }

  onFormSubmit(type: string) {
    this.formSubmit.isSubmit = true;
    this.submitBtn.isClicked = true;
    console.log('this.create_task_form.value ', this.create_task_form.value);
    if (type === 'createTask') {
      if (this.create_task_form.invalid) {
        this.submitBtn.isClicked = false;
        return false;
      }
      this.submitBtn.isClicked = true;
      const startTime = this.commonService.ConvertTimeformat(24, this.create_task_form.value.StartTime);
      // .replace(' AM', ':00.000').replace(' PM', ':00.000');
      const endTime = this.commonService.ConvertTimeformat(24, this.create_task_form.value.EndTime);
      let obj = {};
      obj = {
        Title: this.create_task_form.value.ProjectCode.ProjectCode + ' ' + this.create_task_form.value.Milestones.value + ' ' +
          this.create_task_form.value.ProjectCode.ServiceLevel,
        Entity: '',
        ProjectCode: this.create_task_form.value.ProjectCode.ProjectCode,
        Task: this.create_task_form.value.ProjectCode.ServiceLevel,
        StartDate: this.datePipe.transform(new Date(this.create_task_form.value.StartDate),
          'yyyy-MM-dd' + 'T' + startTime + ':00.000'),
        DueDate: this.datePipe.transform(this.create_task_form.value.EndDate,
          'yyyy-MM-dd' + 'T' + endTime + ':00.000'),
        ExpectedTime: '',
        TimeSpent: '',
        Comments: '',
        TaskComments: '',
        Status: 'Not Started',
        AssignedToId: this.currentUserInfo.Id.toString(),
        TimeZone: this.globalService.DashboardData.ResourceCategorization.find(c => c.ID ===
          this.globalService.currentUser.userId) !== undefined ?
          this.globalService.DashboardData.ResourceCategorization.find(c => c.ID ===
            this.globalService.currentUser.userId).TimeZone !== undefined ?
            this.globalService.DashboardData.ResourceCategorization.find(c => c.ID ===
              this.globalService.currentUser.userId).TimeZone.Title : '5.5' : '5.5',
        TATStatus: 'No',
        SubMilestones: this.create_task_form.value.SubMilestones.label ? this.create_task_form.value.SubMilestones.value :
          this.create_task_form.value.SubMilestones + ':1:In Progress',
        Milestone: this.create_task_form.value.Milestones.label ? this.create_task_form.value.Milestones.value : '',
        AllowCompletion: 'No',
        TATBusinessDays: this.commonService.calcBusinessDays(new Date(this.create_task_form.value.StartDate),
          new Date(this.create_task_form.value.EndDate)),
        IsCentrallyAllocated: 'No',
        ActiveCA: 'No',
        DisableCascade: 'Yes',
      };
      /* tslint:disable:no-string-literal */
      obj['__metadata'] = { type: 'SP.Data.SchedulesListItem' };
      /* tslint:enable:no-string-literal */
      console.log('final obj ', obj);

      const invObj = Object.assign({}, this.queryConfig);
      invObj.url = this.spOperationsService.getReadURL(this.constantsService.listNames.Schedules.name);
      invObj.listName = this.constantsService.listNames.Schedules.name;
      invObj.type = 'POST';
      invObj.data = obj;
      this.submit(invObj);
    }
  }

  async submit(data: any) {
    this.constantsService.loader.isPSInnerLoaderHidden = false;
    let batchUrl = [];
    batchUrl.push(data);
    if (batchUrl.length) {
      const res: any = await this.spOperationsService.executeBatch(batchUrl);
      console.log('res ', res);
      if (res.length) {
        if (res[0].retItems.hasError) {
          const errorMsg = res[0].retItems.message.value;
          this.messageService.add({ key: 'errorCT', severity: 'error', summary: 'Error message', detail: errorMsg });
          return false;
        }
        const response = res[0].retItems;
        const fileUrl = this.globalService.sharePointPageObject.serverRelativeUrl + '/Lists/'
          + this.constantsService.listNames.Schedules.name + '/' + response.ID + '_.000';
        let moveFileUrl = this.globalService.sharePointPageObject.serverRelativeUrl + '/Lists/'
          + this.constantsService.listNames.Schedules.name + '/' + this.create_task_form.value.ProjectCode.ProjectCode;
        moveFileUrl = moveFileUrl + '/' + response.Milestone + '/' + response.ID + '_.000';
        const url = this.globalService.sharePointPageObject.webAbsoluteUrl
          + "/_api/web/getfilebyserverrelativeurl('" + fileUrl + "')/moveto(newurl='" + moveFileUrl + "',flags=1)";
        // this.spServices.getChangeSetBodyMove(batchContents, changeSetId, url);
        const moveItemObj = Object.assign({}, this.queryConfig);
        moveItemObj.url = url; // this.spServices.getMoveURL(fileUrl, moveFileUrl);
        moveItemObj.listName = 'Move Item';
        moveItemObj.type = 'POST';
        batchUrl = [];
        batchUrl.push(moveItemObj);
        const moveToMilestoneRes: any = await this.spOperationsService.executeBatch(batchUrl);
        console.log('res ', moveToMilestoneRes);
        this.messageService.add({ key: 'successCT', severity: 'success', summary: 'Success message', detail: 'Task created.' });
        this.refetchTaskList();
        this.constantsService.loader.isPSInnerLoaderHidden = true;
        this.createTaskModal = false;
      }
    }
  }

  refetchTaskList() {
    this.myDashboardConstantsService.setOpenTaskTabValue(this.myDashboardConstantsService.openTaskSelectedTab);
  }


}
