import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
import { PMCommonService } from '../../services/pmcommon.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { ViewUploadDocumentDialogComponent } from 'src/app/shared/view-upload-document-dialog/view-upload-document-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';

declare var $;
@Component({
  selector: 'app-client-review',
  templateUrl: './client-review.component.html',
  styleUrls: ['./client-review.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ClientReviewComponent implements OnInit {
  tempClick: any;
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
    { field: 'Milestone', header: 'Milestone', visibility: true },
    { field: 'DeliveryDate', header: 'Delivery Date', visibility: true, exportable: false },
    { field: 'DeliveryDateFormat', header: 'Delivery Date', visibility: false },
    { field: 'DueDateFormat', header: 'Due Date', visibility: false }];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'DueDate' },
    { field: 'Milestone' },
    { field: 'DeliveryDate' }];
  @ViewChild('crTableRef', { static: true }) crRef: ElementRef;
  @ViewChild('crTableRef', { static: true }) crTableRef: Table;

  ClientReviewFilters: any[] = [{name: 'Today’s delivery', key: 'today', ColorIndicator : '#add8e6'}, {name: 'Next 5 days', key: 'next', ColorIndicator : '#90ee90'},
  {name: 'Overdue', key: 'Overdue', ColorIndicator : '#f08080'}];

  public selectedCRTask;
  popItems: MenuItem[];
  public crContextMenuOptions = [];
  isCRInnerLoaderHidden = true;
  isCRFilterHidden = true;
  isCRTableHidden = true;
  crHideNoDataMessage = true;
  queryStartDate = new Date();
  queryEndDate = new Date();
  selectedOption: any = '';
  overAllValues = [
    { name: 'Not Started', value: 'Not Started' },
    { name: 'Closed', value: 'Closed' }
  ];
  public crArrays = {
    taskItems: [],
    ProjectCode: [],
    ShortTitle: [],
    ClientLegalEntity: [],
    POC: [],
    DeliverableType: [],
    DueDate: [],
    Milestone: [],
    PreviousTaskUser: [],
    PreviousTaskStatus: [],
    DeliveryDate: [],
    nextTaskArray: [],
    previousTaskArray: []
  };
  constructor(
    public globalObject: GlobalService,
    private dialogService: DialogService,
    private commonService: CommonService,
    private Constant: ConstantsService,
    private spServices: SPOperationService,
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

  ngOnInit() {
    this.isCRInnerLoaderHidden = false;
    this.isCRFilterHidden = false;
    this.popItems = [
      {
        label: 'Go to Allocation', target: '_blank',
        command: (event) => this.goToAllocationPage(this.selectedCRTask)
      },
      {
        label: 'Go to Project', target: '_blank',
        command: (event) => this.goToProjectManagement(this.selectedCRTask)
      },
      { label: 'View / Upload Documents', command: (e) => this.getAddUpdateDocument(this.selectedCRTask) },
      { label: 'Close', command: (event) => this.closeTask(this.selectedCRTask) },

    ];
    this.pmObject.sendToClientArray = [];
    this.crHideNoDataMessage = true;
    this.getCRClient();
  }
  getCRClient() {
    const filter = 'AssignedTo eq ' + this.globalObject.currentUser.userId
      + ' and (Status eq \'Not Started\') and (Task eq \'Client Review\') and PreviousTaskClosureDate ne null';
    this.getCR(filter);
  }
  getCheckedCheckbox() {
    this.isCRInnerLoaderHidden = false;
    this.isCRTableHidden = true;
    this.crHideNoDataMessage = true;
    setTimeout(() => {
      this.isFilterchecked();
    }, this.pmConstant.TIME_OUT);
  }
  isFilterchecked() {
    this.pmObject.clientReviewArray = [];
    // const todayDelivery = $('#crTodayDelivery').is(':checked');
    // const nextFiveDays = $('#crNextFiveDays').is(':checked');
    // const pastFiveDays = $('#crOverdue').is(':checked');
    // const todayFilterDate = this.commonService.calcBusinessDate('Today', 1);
    const nextFiveDate = this.commonService.calcBusinessDate('Next', 5);
    const pastFiveFilterDate = this.commonService.calcBusinessDate('Past', 5);
    this.queryStartDate = pastFiveFilterDate.startDate;
    this.queryEndDate = nextFiveDate.endDate;
    // if (todayDelivery) {
    //   this.queryStartDate = todayFilterDate.startDate;
    //   this.queryEndDate = todayFilterDate.endDate;
    //   if (nextFiveDays && pastFiveDays) {
    //     this.queryStartDate = pastFiveFilterDate.startDate;
    //     this.queryEndDate = nextFiveDate.endDate;
    //   }
    //   if (nextFiveDays && !pastFiveDays) {
    //     this.queryEndDate = nextFiveDate.endDate;
    //   }
    //   if (!nextFiveDays && pastFiveDays) {
    //     this.queryStartDate = pastFiveFilterDate.startDate;
    //   }
    // }
    // if (!todayDelivery) {
    //   if (nextFiveDays && pastFiveDays) {
    //     this.queryStartDate = pastFiveFilterDate.startDate;
    //     this.queryEndDate = nextFiveDate.endDate;
    //   }
    //   if (nextFiveDays && !pastFiveDays) {
    //     this.queryStartDate = nextFiveDate.startDate;
    //     this.queryEndDate = nextFiveDate.endDate;
    //   }
    //   if (!nextFiveDays && pastFiveDays) {
    //     this.queryStartDate = pastFiveFilterDate.startDate;
    //     this.queryEndDate = pastFiveFilterDate.endDate;
    //   }
    //   if (!nextFiveDays && !pastFiveDays) {
    //     this.queryStartDate = null;
    //     this.queryEndDate = null;
    //   }
    // }
    if (this.queryStartDate && this.queryStartDate) {
      this.crFilter();
    } else {
      this.crHideNoDataMessage = false;
      this.isCRInnerLoaderHidden = true;
      this.isCRTableHidden = false;
    }
  }
  crFilter() {
    const startDate = new Date(this.queryStartDate.setHours(0, 0, 0, 0));
    const endDate = new Date(this.queryEndDate.setHours(23, 59, 59, 0));
    const startDateString = new Date(this.commonService.formatDate(startDate) + ' 00:00:00').toISOString();
    const endDateString = new Date(this.commonService.formatDate(endDate) + ' 23:59:00').toISOString();
    const currentFilter = '((StartDate ge \'' + startDateString + '\' or StartDate le \'' + endDateString
      + '\') and (DueDateDT ge \'' + startDateString + '\' and DueDateDT le \'' + endDateString
      + '\')) and (Status eq \'Not Started\') and (Task eq \'Client Review\')'
      + ' and PreviousTaskClosureDate ne null and AssignedTo eq ' + this.globalObject.currentUser.userId + '';
    this.getCR(currentFilter);
  }

  async getCR(currentFilter) {
    const queryOptions = {
      select: 'ID,Title,ProjectCode,StartDate,DueDateDT,PreviousTaskClosureDate,Milestone,PrevTasks,NextTasks',
      filter: currentFilter,
      top: 4200
    };
    this.commonService.SetNewrelic('projectManagment', 'client-review', 'GetSchedules');
    this.crArrays.taskItems = await this.spServices.readItems(this.Constant.listNames.Schedules.name, queryOptions);
    const projectCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    const POCTempArray = [];
    const deliveryTypeTempArray = [];
    const dueDateTempArray = [];
    const milestoneTempArray = [];
    const deliveryDateTempArray = [];
    if (this.crArrays.taskItems.length) {
      let arrResultsProj: any = [];
      if (!this.pmObject.allProjectItems.length) {
        // Get all project information based on current user.
        arrResultsProj = await this.pmCommonService.getProjects(true);
        this.pmObject.allProjectItems = arrResultsProj;
      }
      this.pmObject.countObj.crCount = this.crArrays.taskItems.length;
      this.pmObject.totalRecords.ClientReview = this.pmObject.countObj.crCount;
      this.pmObject.tabMenuItems[3].label = 'Client Review (' + this.pmObject.countObj.crCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      const tempCRArray = [];
      const batchUrl = [];
      // const batchContents = new Array();
      // const batchGuid = this.spServices.generateUUID();
      // Iterate each CR Task
      let taskCount = 0;
      let arrResults = [];
      for (const task of this.crArrays.taskItems) {
        const crObj: any = $.extend(true, {}, this.pmObject.clientReviewObj);

        crObj.ID = task.ID;
        crObj.Title = task.Title;
        crObj.ProjectCode = task.ProjectCode;
        crObj.Status = task.Status;
        crObj.NextTasks = task.NextTasks;
        crObj.PreviousTask = task.PrevTasks;
        // tslint:disable-next-line:only-arrow-functions
        const projectObj = this.pmObject.allProjectItems.filter((obj) => {
          return obj.ProjectCode === task.ProjectCode;
        });
        if (projectObj.length) {
          crObj.ClientLegalEntity = projectObj[0].ClientLegalEntity;
          crObj.ShortTitle = projectObj[0].WBJID;
          crObj.DeliverableType = projectObj[0].DeliverableType;
          crObj.ProjectFolder = projectObj[0].ProjectFolder;
          // tslint:disable-next-line:only-arrow-functions
          const projecContObj = this.pmObject.projectContactsItems.filter((obj) => {
            return obj.ID === projectObj[0].PrimaryPOC;
          });

          if (projecContObj.length) {
            crObj.POC = projecContObj[0].FullNameCC;
          }
        }
        crObj.DueDate = new Date(this.datePipe.transform(task.DueDateDT, 'MMM dd, yyyy, h:mm a'));
        crObj.DueDateFormat = new Date(this.datePipe.transform(crObj.DueDateDT, 'MMM dd, yyyy, h:mm a'));
        crObj.Milestone = task.Milestone;

        // Check Task Due is greater or smaller than current date.
        if (new Date(new Date(crObj.DueDate).setHours(0, 0, 0, 0)).getTime() === new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
          crObj.isBlueIndicator = true;
          crObj.backgroundColor = '#add8e6';
          crObj.SLA = this.pmConstant.ColorIndicator.BLUE;
        } else if (new Date(new Date(crObj.DueDate).setHours(0, 0, 0, 0)) > new Date(new Date().setHours(0, 0, 0, 0))) {
          crObj.isGreenIndicator = true;
          crObj.backgroundColor = '#90ee90';
          crObj.SLA = this.pmConstant.ColorIndicator.GREEN;
        } else {
          crObj.isRedIndicator = true;
          crObj.backgroundColor = '#f08080';
          crObj.SLA = this.pmConstant.ColorIndicator.RED;
        }
        projectCodeTempArray.push({ label: crObj.ProjectCode, value: crObj.ProjectCode });
        shortTitleTempArray.push({ label: crObj.ShortTitle, value: crObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: crObj.ClientLegalEntity, value: crObj.ClientLegalEntity });
        POCTempArray.push({ label: crObj.POC, value: crObj.POC });
        deliveryTypeTempArray.push({ label: crObj.DeliverableType, value: crObj.DeliverableType });
        dueDateTempArray.push({ label: crObj.DueDate, value: crObj.DueDate });
        milestoneTempArray.push({ label: crObj.Milestone, value: crObj.Milestone });
        const preTaskObj = Object.assign({}, this.options);
        preTaskObj.url = this.spServices.getReadURL(this.Constant.listNames.Schedules.name, this.pmConstant.crTaskOptions);
        preTaskObj.url = preTaskObj.url.replace('{0}', crObj.PreviousTask);
        preTaskObj.listName = this.Constant.listNames.Schedules.name;
        preTaskObj.type = 'GET';
        batchUrl.push(preTaskObj);
        tempCRArray.push(crObj);
        taskCount++;
        if (taskCount % 100 === 0) {
          const innerResults = await this.spServices.executeBatch(batchUrl);
          arrResults = [...arrResults, ...innerResults];
          batchUrl.length = 0;
        }
      }
      // batchContents.push('--batch_' + batchGuid + '--');
      // const userBatchBody = batchContents.join('\r\n');
      // const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
      this.commonService.SetNewrelic('projectManagment', 'client-review', 'GetSchedules');

      // let arrResults = await this.spServices.executeBatch(batchUrl);
      const remainingResults = await this.spServices.executeBatch(batchUrl);
      arrResults = [...arrResults, ...remainingResults];
      arrResults = arrResults.length > 0 ? arrResults.map(a => a.retItems) : [];
      for (const taskItem of tempCRArray) {
        // tslint:disable-next-line:only-arrow-functions
        const prevTask = arrResults.filter((previousTaskElement) => {
          if (previousTaskElement[0]) {
            return previousTaskElement[0].Title === taskItem.PreviousTask;
          }
        });
        if (prevTask[0] && prevTask[0].length) {
          taskItem.PreviousTaskStatus = prevTask[0][0].Status;
          this.crArrays.previousTaskArray.push(prevTask[0]);
          taskItem.DeliveryDate = prevTask[0][0].DueDateDT ? new Date(prevTask[0][0].DueDateDT) : null;
          taskItem.DeliveryDateFormat = this.datePipe.transform(new Date(prevTask[0][0].DueDateDT), 'MMM dd, yyyy, h:mm a');
          deliveryDateTempArray.push({ label: taskItem.DeliveryDate, value: taskItem.DeliveryDate });
        }
      }

      if (tempCRArray.length) {
        this.createColFieldValues(tempCRArray);
      }
      this.pmObject.clientReviewArray = tempCRArray;
      this.pmObject.countObj.crCount = tempCRArray.length;
      this.pmObject.clientReviewArray_copy = tempCRArray.slice(0, 5);
    
     
    } else {
      if (this.crArrays.taskItems.length !== this.pmObject.countObj.crCount) {
        this.pmObject.countObj.crCount = this.crArrays.taskItems.length;
      }
      this.pmObject.tabMenuItems[3].label = 'Client Review (' + this.pmObject.countObj.crCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
    }

    this.isCRTableHidden = false;
    this.isCRInnerLoaderHidden = true;
    const tabMenuInk: any = document.querySelector('.p-tabmenu-ink-bar');    
    tabMenuInk.style.width= this.pmObject.countObj.crCount && this.pmObject.countObj.crCount > 10 ? '167px' : '161px';
    this.commonService.setIframeHeight();
  }

  createColFieldValues(resArray) {
    this.crArrays.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    this.crArrays.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    this.crArrays.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    this.crArrays.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
    this.crArrays.DeliverableType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DeliverableType, value: a.DeliverableType }; return b; }).filter(ele => ele.label)));
    this.crArrays.DueDate = this.commonService.sortDataDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.DueDateFormat, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a.DueDateFormat, 'MMM dd, yyyy, h:mm a')) }; return b; }).filter(ele => ele.label)));
    this.crArrays.Milestone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Milestone, value: a.Milestone }; return b; }).filter(ele => ele.label)));
    this.crArrays.DeliveryDate = this.commonService.sortDataDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.DeliveryDate, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(a.DeliveryDate, 'MMM dd, yyyy, h:mm a')) }; return b; }).filter(ele => ele.label)));

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

  async downloadTask(task) {
    console.log(task);
    const tempArray = [];
    const documentsUrl = '/Drafts/Internal/' + task.Milestone;
    const documents = await this.commonService.getTaskDocument(task.ProjectFolder, documentsUrl);
    documents.forEach(document => {
      if (task.PreviousTask.indexOf(document.ListItemAllFields.TaskName) > -1 && document.ListItemAllFields.Status.indexOf('Complete') > -1) {
        const docObj = {
          url: '',
          fileName: ''
        };
        docObj.url = document.ServerRelativeUrl;
        docObj.fileName = document.Name;
        tempArray.push(docObj);
      }
    });
    // for (const document in documents) {
    //   // if (documents[document].visiblePrevTaskDoc === true) {

    // }
  }
  goToAllocationPage(task) {
    window.open(this.globalObject.url + '/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }

  goToProjectManagement(task) {
    this.pmObject.columnFilter.ProjectCode = [task.ProjectCode];
    this.router.navigate(['/projectMgmt/allProjects']);
  }
  closeTask(task) {
    if (task.PreviousTaskStatus === 'Completed') {
      this.Constant.loader.isWaitDisable = true;
      this.closeTaskWithStatus(task, this.crRef);
    } else {

      this.commonService.showToastrMessage(this.Constant.MessageType.warn, 'Previous task should be Completed or Auto Closed', false);
      // this.changeErrorMessage('Previous task should be Completed or Auto Closed');
    }
  }
  async closeTaskWithStatus(task, unt) {
    const isActionRequired = await this.commonService.checkTaskStatus(task);
    if (isActionRequired) {

      const ref = this.dialogService.open(ViewUploadDocumentDialogComponent, {
        data: {
          task,
          closeTaskEnable: true
        },
        header: task.Title,
        width: '60vw',
        contentStyle: { 'min-height': '30vh', 'max-height': '90vh', 'overflow-y': 'auto' }
      });
      ref.onClose.subscribe(async (documents: any) => {
        if (documents) {
          const batchUrl = [];
          // update Task
          const taskObj = Object.assign({}, this.options);
          taskObj.url = this.spServices.getItemURL(this.Constant.listNames.Schedules.name, task.ID);
          taskObj.data = {
            Status: 'Completed',
            Actual_x0020_Start_x0020_Date: new Date(),
            Actual_x0020_End_x0020_Date: new Date(),
            __metadata: { type: this.Constant.listNames.Schedules.type }
          };
          taskObj.listName = this.Constant.listNames.Schedules.name;
          taskObj.type = 'PATCH';
          batchUrl.push(taskObj);

          this.isCRInnerLoaderHidden = false;
          // const objMilestone = Object.assign({}, this.pmConstant.milestoneOptions);
          const objMilestone = Object.assign({}, this.pmConstant.milestoneTaskOptions);
          objMilestone.filter = objMilestone.filter.replace(/{{projectCode}}/gi, task.ProjectCode)
          .replace(/{{milestone}}/gi, task.Milestone);
          this.commonService.SetNewrelic('projectManagment', 'client-review', 'fetchMilestone');
          const response = await this.spServices.readItems(this.Constant.listNames.Schedules.name, objMilestone);
          const milestone = response.find(t => t.ContentTypeCH === 'Milestone');
          // update Milestone
          if (milestone) {
            const milestoneObj = Object.assign({}, this.options);
            milestoneObj.url = this.spServices.getItemURL(this.Constant.listNames.Schedules.name, milestone.Id);
            milestoneObj.data = { Status: 'Completed', __metadata: { type: this.Constant.listNames.Schedules.type } };
            milestoneObj.listName = this.Constant.listNames.Schedules.name;
            milestoneObj.type = 'PATCH';
            batchUrl.push(milestoneObj);
          }
          const otherMilTasks = response.filter(t => (t.Status === this.Constant.STATUS.NOT_STARTED
                                                     || t.Status === this.Constant.STATUS.IN_PROGRESS)
                                                     && t.Task !== 'Send to Client' && t.Task !== 'Client Review'
                                                     && t.ContentTypeCH !== 'Milestone');
          // update Tasks
          if (otherMilTasks.length) {
            for (const miltask of otherMilTasks) {
              const milestoneTaskObj = Object.assign({}, this.options);
              milestoneTaskObj.url = this.spServices.getItemURL(this.Constant.listNames.Schedules.name, miltask.Id);
              milestoneTaskObj.data = { Status: this.Constant.STATUS.AUTO_CLOSED,
                                   __metadata: { type: this.Constant.listNames.Schedules.type } };
              milestoneTaskObj.listName = this.Constant.listNames.Schedules.name;
              milestoneTaskObj.type = 'PATCH';
              batchUrl.push(milestoneTaskObj);
            }
          }

          //  update ProjectInformation
          const projectID = this.pmObject.allProjectItems.filter(item => item.ProjectCode === task.ProjectCode);
          const projectInfoObj = Object.assign({}, this.options);
          projectInfoObj.url = this.spServices.getItemURL(this.Constant.listNames.ProjectInformation.name, projectID[0].ID);
          projectInfoObj.data = { Status: this.Constant.STATUS.UNALLOCATED, __metadata: { type: this.Constant.listNames.ProjectInformation.type } };
          projectInfoObj.listName = this.Constant.listNames.ProjectInformation.name;
          projectInfoObj.type = 'PATCH';
          batchUrl.push(projectInfoObj);
          this.commonService.SetNewrelic('projectManagment', 'client-review', 'UpdateSchedules&PM');
          await this.spServices.executeBatch(batchUrl);

          this.isCRInnerLoaderHidden = true;

          this.commonService.showToastrMessage(this.Constant.MessageType.success, task.Title + ' is completed Sucessfully.', true);

          const index = this.pmObject.clientReviewArray.findIndex(item => item.ID === task.ID);
          this.pmObject.clientReviewArray.splice(index, 1);
          this.Constant.loader.isWaitDisable = false;
          this.pmObject.loading.ClientReview = true;
          this.pmObject.countObj.crCount = this.pmObject.countObj.crCount - 1;
          this.pmObject.clientReviewArray = [...this.pmObject.clientReviewArray];
        }
        else {
          this.Constant.loader.isWaitDisable = false;
        }
      });
    } else {
      this.Constant.loader.isWaitDisable = false;

      this.commonService.showToastrMessage(this.Constant.MessageType.info, task.Title + ' is already completed or closed or auto closed. Hence record is refreshed in 30 sec.', true);
      setTimeout(() => {
        this.ngOnInit();
      }, 3000);
    }
  }

  crContextMenuEvent(node, contextMenu) {
    if (node) {
      if (node.data.PreviousTaskStatus === 'Completed') {
        contextMenu.model[2].visible = true;
      } else {
        contextMenu.model[2].visible = false;
      }
    }
  }
  crLazyLoadTask(event) {
    const crArray = this.pmObject.clientReviewArray;
    this.commonService.lazyLoadTask(event, crArray, this.filterColumns, this.pmConstant.filterAction.CLIENT_REVIEW);
  }
  storeRowData(rowData, menu) {
    this.selectedCRTask = rowData;
    menu.model[3].visible = this.selectedOption.name === 'Closed' ? false : true;
  }
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === "pi pi-ellipsis-v") {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
        if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = "";
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = "";
      }

    } else {
      if (this.tempClick) {
        this.tempClick.style.display = "none";
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
    if (this.pmObject.clientReviewArray.length && this.isOptionFilter) {
      let obj = {
        tableData: this.crTableRef,
        colFields: this.crArrays,
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

  onChangeSelect(event) {
    this.isCRInnerLoaderHidden = false;
    if (this.selectedOption.name === 'Not Started') {
      this.getCRClient();
    } else {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date(this.queryEndDate.setHours(23, 59, 59, 0));
      const startDateString = new Date(this.commonService.formatDate(startDate) + ' 00:00:00').toISOString();
      const endDateString = new Date(this.commonService.formatDate(endDate) + ' 23:59:00').toISOString();
      const currentFilter = ' AssignedTo eq ' + this.globalObject.currentUser.userId + ' and (((StartDate ge \'' + startDateString + '\' or StartDate le \'' + endDateString
        + '\') and (DueDateDT ge \'' + startDateString + '\' and DueDateDT le \'' + endDateString
        + '\')) or  ((Actual_x0020_Start_x0020_Date ge \'' + startDateString + '\' or Actual_x0020_Start_x0020_Date le \'' + endDateString
        + '\') and (Actual_x0020_End_x0020_Date ge \'' + startDateString + '\' and Actual_x0020_End_x0020_Date le \'' + endDateString
        + '\')))  and (Status eq \'Completed\') and (Task eq \'Client Review\')'
        + ' and PreviousTaskClosureDate ne null';

      this.getCR(currentFilter);
    }
  }


  getAddUpdateDocument(task) {

    const ref = this.dialogService.open(ViewUploadDocumentDialogComponent, {
      data: {
        task,
        closeTaskEnable: false
      },
      header: task.Title,
      width: '60vw',
      contentStyle: { 'min-height': '30vh', 'max-height': '90vh', 'overflow-y': 'auto' }
    });
    ref.onClose.subscribe(async (documents: any) => {
      if (documents) {
      }
    });

  }

}
