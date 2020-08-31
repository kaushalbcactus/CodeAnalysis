import { Component, OnInit, ViewChild, ElementRef, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { debounceTime } from 'rxjs/operators';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
import { PMCommonService } from '../../services/pmcommon.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';

declare var $;
@Component({
  selector: 'app-send-to-client',
  templateUrl: './send-to-client.component.html',
  styleUrls: ['./send-to-client.component.css']
})
export class SendToClientComponent implements OnInit {
  tempClick: any;
  @ViewChild("loader", { static: false }) loaderView: ElementRef;
  @ViewChild("spanner", { static: false }) spannerView: ElementRef;
  private options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  displayedColumns: any[] = [
    { field: 'SLA', header: 'SLA', visibility: true },
    { field: 'ProjectCode', header: 'Project Code', visibility: true },
    { field: 'ShortTitle', header: 'Short Title', visibility: true },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
    { field: 'POC', header: 'POC', visibility: true },
    { field: 'DeliverableType', header: 'Deliverable Type', visibility: true },
    { field: 'DueDate', header: 'Due Date', visibility: true, exportable: false },
    { field: 'displayMilestone', header: 'Milestone', visibility: true },
    { field: 'PreviousTaskUser', header: 'Previous Task Owner', visibility: true },
    { field: 'PreviousTaskStatus', header: 'Previous Task Status', visibility: true },
    { field: 'DueDateFormat', header: 'Due Date', visibility: false }];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'DueDate' },
    { field: 'displayMilestone' },
    { field: 'PreviousTaskUser' },
    { field: 'PreviousTaskStatus' }];
  @ViewChild('sendToClientTableRef', { static: true }) sct: ElementRef;
  @ViewChild('sendToClientTableRef', { static: false }) sendToClientTableRef: Table;
  // tslint:disable-next-line:variable-name
  public selectedSendToClientTask;
  public contextMenuOptions = [];
  isSCInnerLoaderHidden = true;
  isSCFilterHidden = true;
  isSCTableHidden = true;
  hideNoDataMessage = true;
  queryStartDate = new Date();
  queryEndDate = new Date();
  popItems: MenuItem[];
  public scArrays = {
    taskItems: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    POC: [],
    DeliverableType: [],
    DueDate: [],
    displayMilestone: [],
    PreviousTaskUser: [],
    PreviousTaskStatus: [],
    nextTaskArray: [],
    previousTaskArray: []
  };
  ngOnInit() {
    this.isSCInnerLoaderHidden = false;
    this.isSCFilterHidden = true;
    this.popItems = [
      { label: 'Download', command: (event) => this.downloadTask(this.selectedSendToClientTask) },
      {
        label: 'Go to Allocation', target: '_blank',
        command: (event) => this.goToAllocationPage(this.selectedSendToClientTask)
      },
      {
        label: 'Go to Project', target: '_blank',
        command: (event) => this.goToProjectManagement(this.selectedSendToClientTask)
      },
      { label: 'Close', command: (event) => this.closeTask(this.selectedSendToClientTask) }
    ];
    this.pmObject.sendToClientArray = [];
    this.callSendToClient();
  }
  constructor(
    private spServices: SPOperationService,
    private Constant: ConstantsService,
    public globalObject: GlobalService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService,
    public spOperations: SPOperationService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    _applicationRef: ApplicationRef,
    zone: NgZone,
  ) {

    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    router.events.subscribe((uri) => {
      zone.run(() => _applicationRef.tick());
    });

  }

  async downloadTask(task) {
    // setTimeout(() => {
    const tempArray = [];
    const documentsUrl = '/Drafts/Internal/' + task.Milestone;
    const documents = await this.commonService.getTaskDocument(task.ProjectFolder, documentsUrl);
    const prevTask = task.PreviousTask.split(';#');
    documents.forEach(document => {

      if (prevTask.indexOf(document.ListItemAllFields.TaskName) > -1 && document.ListItemAllFields.Status.indexOf('Complete') > -1) {
        const docObj = {
          url: '',
          fileName: ''
        };
        docObj.url = document.ServerRelativeUrl;
        docObj.fileName = document.Name;
        tempArray.push(docObj);
      }
    });

    const fileName = task.ProjectCode + ' - ' + task.displayMilestone;
    // this.spServices.downloadMultipleFiles(tempArray, fileName);
    this.commonService.SetNewrelic('projectmanagement', 'sendtoclient', 'createZip');
    this.spServices.createZip(tempArray.map(c => c.url), fileName);

    // }, 500);
  }
  goToAllocationPage(task) {
    window.open(this.globalObject.url + '/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }

  goToProjectManagement(task) {
    this.pmObject.columnFilter.ProjectCode = [task.ProjectCode];
    this.router.navigate(['/projectMgmt/allProjects']);
  }
  closeTask(task) {
    if (task.PreviousTaskStatus === 'Auto Closed' || task.PreviousTaskStatus === 'Completed') {

      this.loaderView.nativeElement.classList.add('show');
      this.spannerView.nativeElement.classList.add('show');


      const options = { Status: 'Completed', Actual_x0020_Start_x0020_Date: new Date(), Actual_x0020_End_x0020_Date: new Date(), __metadata: { type: this.Constant.listNames.Schedules.type } };
      this.closeTaskWithStatus(task, options, this.sct);
    } else {

      this.commonService.showToastrMessage(this.Constant.MessageType.error,'Previous task should be Completed or Auto Closed',false);
    }
  }
  async closeTaskWithStatus(task, options, unt) {
    const isActionRequired = await this.commonService.checkTaskStatus(task);
    if (isActionRequired) {
      const project = this.pmObject.allProjectItems.find(item => item.ProjectCode === task.ProjectCode);
      let projectStatus = project.Status;
      let batchUrl = [];
      if (task.NextTasks) {
        projectStatus = this.Constant.STATUS.AUTHOR_REVIEW;
        const nextTask = this.scArrays.nextTaskArray.filter(item => item.Title === task.NextTasks);
        if (nextTask && nextTask.length) {

          const taskObj = Object.assign({}, this.options);
          taskObj.url = this.spServices.getItemURL(this.Constant.listNames.Schedules.name, nextTask[0].ID);
          taskObj.data = { PreviousTaskClosureDate: new Date(), __metadata: { type: this.Constant.listNames.Schedules.type } };;
          taskObj.listName = this.Constant.listNames.Schedules.name;
          taskObj.type = 'PATCH';
          batchUrl.push(taskObj);
        }
        await this.ContinoueCloseTaskWithStatus(task, project, options, projectStatus, batchUrl);
      } else {
        this.loaderView.nativeElement.classList.remove('show');
        this.spannerView.nativeElement.classList.remove('show');
        this.commonService.confirmMessageDialog('Confirmation', "Do you want to change project status from '" + project.Status + "' to '" + this.Constant.STATUS.AUTHOR_REVIEW + "' or '" + this.Constant.STATUS.IN_PROGRESS + "' ?", null, [this.Constant.STATUS.AUTHOR_REVIEW, this.Constant.STATUS.IN_PROGRESS], true).then(async projectstatus => {
          if (projectstatus) {
            this.loaderView.nativeElement.classList.add('show');
            this.spannerView.nativeElement.classList.add('show');
            projectStatus = projectstatus;
            await this.ContinoueCloseTaskWithStatus(task, project, options, projectStatus, batchUrl);
          }
        });
      }
    } else {

      this.loaderView.nativeElement.classList.remove('show');
      this.spannerView.nativeElement.classList.remove('show');

      this.commonService.showToastrMessage(this.Constant.MessageType.info,task.Title + ' is already completed or closed or auto closed. Hence record is refreshed in 30 sec.',true);
      setTimeout(() => {
        this.ngOnInit();
      }, 3000);
    }
  }

  async ContinoueCloseTaskWithStatus(task, project, options, projectStatus, batchUrl) {
    const projectObj = Object.assign({}, this.options);
    projectObj.url = this.spServices.getItemURL(this.Constant.listNames.ProjectInformation.name, project.ID);
    projectObj.data = { Status: projectStatus, __metadata: { type: this.Constant.listNames.ProjectInformation.type } };
    projectObj.listName = this.Constant.listNames.ProjectInformation.name;
    projectObj.type = 'PATCH';
    batchUrl.push(projectObj);

    if (task.SubMilestones) {
      const objMilestone = Object.assign({}, this.pmConstant.milestoneOptions);
      objMilestone.filter = objMilestone.filter.replace(/{{projectCode}}/gi,
        task.ProjectCode).replace(/{{milestone}}/gi,
          task.Milestone);
      this.commonService.SetNewrelic('projectManagment', 'send to Client', 'fetchMilestone');
      const response = await this.spServices.readItems(this.Constant.listNames.Schedules.name, objMilestone);

      if (response.length > 0) {

        const SubMilestonesObj = [];
        let modifiedSubMilestones = null;
        const SubMilestones = response[0].SubMilestones.split(';#');
        if (SubMilestones) {
          SubMilestones.forEach(element => {
            if (element.split(':')[0] === task.SubMilestones) {
              SubMilestonesObj.push(element.split(':')[0] + ':' + element.split(':')[1] + ':Completed');
            }
            else {
              SubMilestonesObj.push(element);
            }
          });
          modifiedSubMilestones = SubMilestonesObj.length > 1 ? SubMilestonesObj.join(';#') : SubMilestonesObj.toString();
        }
        const milestoneObj = Object.assign({}, this.options);
        milestoneObj.url = this.spServices.getItemURL(this.Constant.listNames.Schedules.name, response[0].Id);
        milestoneObj.data = { SubMilestones: modifiedSubMilestones, __metadata: { type: this.Constant.listNames.Schedules.type } };
        milestoneObj.listName = this.Constant.listNames.Schedules.name;
        milestoneObj.type = 'PATCH';
        batchUrl.push(milestoneObj);
      }
    }

    // update Task
    const taskObj = Object.assign({}, this.options);
    taskObj.url = this.spServices.getItemURL(this.Constant.listNames.Schedules.name, task.ID);
    taskObj.data = options;
    taskObj.listName = this.Constant.listNames.Schedules.name;
    taskObj.type = 'PATCH';
    batchUrl.push(taskObj);


    await this.spServices.executeBatch(batchUrl);

    this.commonService.showToastrMessage(this.Constant.MessageType.success, task.Title + ' is completed Sucessfully',true);
    this.loaderView.nativeElement.classList.remove('show');
    this.spannerView.nativeElement.classList.remove('show');
    const index = this.pmObject.sendToClientArray.findIndex(item => item.ID === task.ID);
    this.pmObject.sendToClientArray.splice(index, 1);
    this.pmObject.sendToClientArray = [...this.pmObject.sendToClientArray];
    this.pmObject.countObj.scCount = this.pmObject.countObj.scCount - 1;
  }

  async callSendToClient() {
    this.getCheckedCheckbox();
  }
  getCheckedCheckbox() {
    this.isSCInnerLoaderHidden = false;
    this.isSCTableHidden = true;
    this.isSCFilterHidden = true;
    this.hideNoDataMessage = true;
    setTimeout(() => {
      this.isFilterchecked();
    }, this.pmConstant.TIME_OUT);
  }
  isFilterchecked() {
    this.pmObject.sendToClientArray = [];
    const todayDelivery = $('#todayDelivery').is(':checked');
    const nextFiveDays = $('#nextFiveDays').is(':checked');
    const pastFiveDays = $('#overdue').is(':checked');
    const todayFilterDate = this.commonService.calcBusinessDate('Today', 1);
    const nextFiveDate = this.commonService.calcBusinessDate('Next', 5);
    const pastFiveFilterDate = this.commonService.calcBusinessDate('Past', 10);
    if (todayDelivery) {
      this.queryStartDate = todayFilterDate.startDate;
      this.queryEndDate = todayFilterDate.endDate;
      if (nextFiveDays && pastFiveDays) {
        this.queryStartDate = pastFiveFilterDate.startDate;
        this.queryEndDate = nextFiveDate.endDate;
      }
      if (nextFiveDays && !pastFiveDays) {
        this.queryEndDate = nextFiveDate.endDate;
      }
      if (!nextFiveDays && pastFiveDays) {
        this.queryStartDate = pastFiveFilterDate.startDate;
      }
    }
    if (!todayDelivery) {
      if (nextFiveDays && pastFiveDays) {
        this.queryStartDate = pastFiveFilterDate.startDate;
        this.queryEndDate = nextFiveDate.endDate;
      }
      if (nextFiveDays && !pastFiveDays) {
        this.queryStartDate = nextFiveDate.startDate;
        this.queryEndDate = nextFiveDate.endDate;
      }
      if (!nextFiveDays && pastFiveDays) {
        this.queryStartDate = pastFiveFilterDate.startDate;
        this.queryEndDate = pastFiveFilterDate.endDate;
      }
      if (!nextFiveDays && !pastFiveDays) {
        this.queryStartDate = null;
        this.queryEndDate = null;
      }
    }
    if (this.queryStartDate && this.queryStartDate) {
      this.sendToClientFilter();
    } else {
      this.hideNoDataMessage = false;
      this.isSCInnerLoaderHidden = true;
      this.isSCFilterHidden = false;
    }
  }
  sendToClientFilter() {
    const startDate = new Date(this.queryStartDate.setHours(0, 0, 0, 0));
    const endDate = new Date(this.queryEndDate.setHours(23, 59, 59, 0));
    const startDateString = new Date(this.commonService.formatDate(startDate) + ' 00:00:00').toISOString();
    const endDateString = new Date(this.commonService.formatDate(endDate) + ' 23:59:00').toISOString();
    const currentFilter = 'AssignedTo eq ' + this.globalObject.currentUser.userId + ' and ' +
      '(Status eq \'Not Started\') and (Task eq \'Send to client\') and ' +
      '((StartDate ge \'' + startDateString + '\' and StartDate le \'' + endDateString + '\') and ' +
      ' (DueDateDT ge \'' + startDateString + '\' and DueDateDT le \'' + endDateString + '\'))';
    this.getSendToClient(currentFilter);
  }

  async getSendToClient(currentFilter) {
    const queryOptions = {
      select: 'ID,Title,ProjectCode,StartDate,DueDateDT,PreviousTaskClosureDate,Milestone,PrevTasks,SubMilestones, NextTasks, ResourceID',
      filter: currentFilter,
      top: 4200
    };

    this.commonService.SetNewrelic('projectManagment', 'sendToClient', 'GetSchedules');
    this.scArrays.taskItems = await this.spServices.readItems(this.Constant.listNames.Schedules.name, queryOptions);
    const projectCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    const POCTempArray = [];
    const deliveryTypeTempArray = [];
    const dueDateTempArray = [];
    const milestoneTempArray = [];
    const previousTaskOwnerTempArray = [];
    const previousTaskStatusTempArray = [];
    if (this.scArrays.taskItems && this.scArrays.taskItems.length) {
      let arrResultsProj: any = [];
      if (!this.pmObject.allProjectItems.length) {
        // Get all project information based on current user.
        arrResultsProj = await this.pmCommonService.getProjects(true);
        this.pmObject.allProjectItems = arrResultsProj;
      }
      this.pmObject.countObj.scCount = this.scArrays.taskItems.length;
      this.pmObject.totalRecords.ClientReview = this.pmObject.countObj.scCount;
      this.pmObject.tabMenuItems[2].label = 'Send to Client (' + this.pmObject.countObj.scCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      const tempSendToClientArray = [];
      // const batchContents = new Array();
      // const batchGuid = this.spServices.generateUUID();
      const batchUrl = [];
      for (const task of this.scArrays.taskItems) {
        const scObj: any = $.extend(true, {}, this.pmObject.sendToClient);
        scObj.ID = task.ID;
        scObj.Title = task.Title;
        scObj.ProjectCode = task.ProjectCode;
        scObj.NextTasks = task.NextTasks;
        scObj.PreviousTask = task.PrevTasks;
        // tslint:disable-next-line:only-arrow-functions
        const projectObj = this.pmObject.allProjectItems.filter((obj) => {
          return obj.ProjectCode === task.ProjectCode;
        });
        if (projectObj.length) {
          scObj.ClientLegalEntity = projectObj[0].ClientLegalEntity;
          scObj.ShortTitle = projectObj[0].WBJID;
          scObj.DeliverableType = projectObj[0].DeliverableType;
          scObj.ProjectFolder = projectObj[0].ProjectFolder;
          // tslint:disable-next-line:only-arrow-functions
          const projecContObj = this.pmObject.projectContactsItems.filter((obj) => {
            return obj.ID === projectObj[0].PrimaryPOC;
          });

          if (projecContObj.length) {
            scObj.POC = projecContObj[0].FullNameCC;
          }
        }
        scObj.DueDate = new Date(this.datePipe.transform(task.DueDateDT, 'MMM dd, yyyy, h:mm a'));
        scObj.DueDateFormat = this.datePipe.transform(new Date(scObj.DueDate), 'MMM dd, yyyy, h:mm a');
        scObj.Milestone = task.Milestone;
        scObj.displayMilestone = task.SubMilestones ?
          task.Milestone + ' - ' + task.SubMilestones : task.Milestone;
        scObj.SubMilestones = task.SubMilestones
        if (new Date(new Date(scObj.DueDate).setHours(0, 0, 0, 0)).getTime() === new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
          scObj.isBlueIndicator = true;
          scObj.backgroundColor = '#add8e6';
          scObj.SLA = this.pmConstant.ColorIndicator.BLUE;
        } else if (new Date(new Date(scObj.DueDate).setHours(0, 0, 0, 0)) > new Date(new Date().setHours(0, 0, 0, 0))) {
          scObj.isGreenIndicator = true;
          scObj.backgroundColor = '#90ee90';
          scObj.SLA = this.pmConstant.ColorIndicator.GREEN;
        } else {
          scObj.isRedIndicator = true;
          scObj.backgroundColor = '#f08080';
          scObj.SLA = this.pmConstant.ColorIndicator.RED;
        }
        projectCodeTempArray.push({ label: scObj.ProjectCode, value: scObj.ProjectCode });
        shortTitleTempArray.push({ label: scObj.ShortTitle, value: scObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: scObj.ClientLegalEntity, value: scObj.ClientLegalEntity });
        POCTempArray.push({ label: scObj.POC, value: scObj.POC });
        deliveryTypeTempArray.push({ label: scObj.DeliverableType, value: scObj.DeliverableType });
        dueDateTempArray.push({ label: scObj.DueDate, value: scObj.DueDate });
        milestoneTempArray.push({ label: scObj.displayMilestone, value: scObj.displayMilestone });

        const preTaskObj = Object.assign({}, this.options);
        preTaskObj.url = this.spServices.getReadURL(this.Constant.listNames.Schedules.name, this.pmConstant.previousTaskOptions);
        preTaskObj.url = preTaskObj.url.replace('{0}', scObj.PreviousTask).replace('{1}', scObj.NextTasks);
        preTaskObj.listName = this.Constant.listNames.Schedules.name;
        preTaskObj.type = 'GET';
        batchUrl.push(preTaskObj);
        tempSendToClientArray.push(scObj);
      }
      let counter = 0;
      this.commonService.SetNewrelic('projectManagment', 'sendToClient', 'GetSchedules');
      let arrResults = await this.spServices.executeBatch(batchUrl);
      arrResults = arrResults.length > 0 ? arrResults.map(a => a.retItems) : [];
      for (const taskItem of tempSendToClientArray) {
        const arrRes = arrResults[counter];

        // tslint:disable-next-line:only-arrow-functions
        let prevTask = arrRes.filter((previousTaskElement) => {
          return previousTaskElement.Title === taskItem.PreviousTask;
        });
        // tslint:disable-next-line:only-arrow-functions
        const nextTask = arrRes.filter((nextTaskElement) => {
          return nextTaskElement.Title === taskItem.NextTasks;
        });
        counter++;
        if (prevTask.length) {
          if (prevTask[0].IsCentrallyAllocated === 'Yes') {
            const preTaskObj = Object.assign({}, this.pmConstant.subtaskOptions);
            preTaskObj.filter = preTaskObj.filter.replace('{0}', prevTask[0].ID);
            const previousTask = await this.spServices.readItems(this.Constant.listNames.Schedules.name, preTaskObj);
            prevTask = previousTask.length ? previousTask : prevTask;
          }
          this.scArrays.previousTaskArray.push(prevTask[0]);
          taskItem.PreviousTaskStatus = prevTask[0].Status;
          taskItem.PreviousTask = prevTask[0].Title;
          taskItem.PreviousTaskUser = prevTask[0].AssignedTo ? prevTask[0].AssignedTo.Title : '';
          previousTaskOwnerTempArray.push({ label: taskItem.PreviousTaskUser, value: taskItem.PreviousTaskUser });
          previousTaskStatusTempArray.push({ label: taskItem.PreviousTaskStatus, value: taskItem.PreviousTaskStatus });
        }
        if (nextTask.length) {
          this.scArrays.nextTaskArray.push(nextTask[0]);
        }
      }

      if (tempSendToClientArray.length) {
        this.createColFieldValues(tempSendToClientArray);
      }
      this.pmObject.sendToClientArray = tempSendToClientArray;
      const tableRef: any = this.sct;
      tableRef.first = 0;
      this.isSCTableHidden = false;
      this.isSCInnerLoaderHidden = true;
      this.isSCFilterHidden = false;
    } else {
      if (this.scArrays.taskItems.length !== this.pmObject.countObj.scCount) {
        this.pmObject.countObj.scCount = this.scArrays.taskItems.length;
      }
      this.pmObject.tabMenuItems[2].label = 'Send to Client (' + this.pmObject.countObj.scCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      this.hideNoDataMessage = false;
      this.isSCInnerLoaderHidden = true;
      this.isSCFilterHidden = false;
    }
    // this.commonService.setIframeHeight();
  }

  createColFieldValues(resArray) {
    this.scArrays.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    this.scArrays.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.scArrays.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.scArrays.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
    this.scArrays.DeliverableType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DeliverableType, value: a.DeliverableType }; return b; }).filter(ele => ele.label)));

    // this.scArrays.DueDate = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DueDateFormat, value: a.DueDateFormat }; return b; }).filter(ele => ele.label)));
    this.scArrays.DueDate = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.DueDateFormat, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a.DueDateFormat, 'MMM dd, yyyy, h:mm a')) }; return b; }).filter(ele => ele.label)));

    this.scArrays.displayMilestone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.displayMilestone, value: a.displayMilestone }; return b; }).filter(ele => ele.label)));
    this.scArrays.PreviousTaskUser = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PreviousTaskUser, value: a.PreviousTaskUser }; return b; }).filter(ele => ele.label)));
    this.scArrays.PreviousTaskStatus = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PreviousTaskStatus, value: a.PreviousTaskStatus }; return b; }).filter(ele => ele.label)));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      const keys = {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
      return keys ? keys : '';
    });
  }


  myFunction() {
    document.getElementById('myDropdown').classList.toggle('show');
  }
  lazyLoadTask(event) {
    const sendToClientArray = this.pmObject.sendToClientArray;
    this.commonService.lazyLoadTask(event, sendToClientArray, this.filterColumns, this.pmConstant.filterAction.SEND_TO_CLIENT);
  }
  storeRowData(rowData, menu) {
    this.selectedSendToClientTask = rowData;
    if (rowData.PreviousTaskStatus === 'Auto Closed' || rowData.PreviousTaskStatus === 'Completed') {
      menu.model[3].visible = true;
      menu.model[0].visible = true;
    } else {
      menu.model[3].visible = false;
      menu.model[0].visible = false;
    }
  }
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

  ngAfterViewChecked() {
    if (this.pmObject.sendToClientArray.length && this.isOptionFilter) {
      let obj = {
        tableData: this.sendToClientTableRef,
        colFields: this.scArrays,
        // colFieldsArray: this.createColFieldValues(this.proformaTable.value)
      }
      if (obj.tableData.filteredValue) {
        this.commonService.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.createColFieldValues(obj.tableData.value);
        this.isOptionFilter = false;
      }
    }
    this.cdr.detectChanges();
  }
}
