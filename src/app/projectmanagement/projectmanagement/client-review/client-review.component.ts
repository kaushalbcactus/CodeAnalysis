import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { DatePipe } from '@angular/common';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
import { PMCommonService } from '../../services/pmcommon.service';
import { Router } from '@angular/router';

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
    { field: 'shortTitle', header: 'Short Title', visibility: true },
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
    { field: 'shortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'DueDate' },
    { field: 'Milestone' },
    { field: 'DeliveryDate' }];
  @ViewChild('crTableRef', { static: true }) crRef: ElementRef;
  // tslint:disable-next-line:variable-name
  private _success = new Subject<string>();
  // tslint:disable-next-line:variable-name
  private _error = new Subject<string>();
  public crSuccessMessage: string;
  public crErrorMessage: string;
  public selectedCRTask;
  popItems: MenuItem[];
  public crContextMenuOptions = [];
  isCRInnerLoaderHidden = true;
  isCRFilterHidden = true;
  isCRTableHidden = true;
  crHideNoDataMessage = true;
  queryStartDate = new Date();
  queryEndDate = new Date();
  public crArrays = {
    taskItems: [],
    projectCodeArray: [],
    shortTitleArray: [],
    clientLegalEntityArray: [],
    POCArray: [],
    deliveryTypeArray: [],
    dueDateArray: [],
    milestoneArray: [],
    deliveryDateArray: [],
    nextTaskArray: [],
    previousTaskArray: []
  };
  constructor(
    public globalObject: GlobalService,
    private commonService: CommonService,
    private Constant: ConstantsService,
    private spServices: SPOperationService,
    private datePipe: DatePipe,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService,
    public spOperations: SPOperationService,
    public router: Router
  ) { }

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
      { label: 'Close', command: (event) => this.closeTask(this.selectedCRTask) }
    ];
    this.pmObject.sendToClientArray = [];
    this._success.subscribe((message) => this.crSuccessMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.crSuccessMessage = null);
    this._error.subscribe((message) => this.crErrorMessage = message);
    this._error.pipe(
      debounceTime(5000)
    ).subscribe(() => this.crErrorMessage = null);
    setTimeout(() => {
      this.crHideNoDataMessage = true;
      this.getCRClient();
    }, this.pmConstant.TIME_OUT);
  }
  getCRClient() {
    const filter = 'AssignedTo eq ' + this.globalObject.sharePointPageObject.userId
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
    const todayDelivery = $('#crTodayDelivery').is(':checked');
    const nextFiveDays = $('#crNextFiveDays').is(':checked');
    const pastFiveDays = $('#crOverdue').is(':checked');
    const todayFilterDate = this.commonService.calcBusinessDate('Today', 1);
    const nextFiveDate = this.commonService.calcBusinessDate('Next', 5);
    const pastFiveFilterDate = this.commonService.calcBusinessDate('Past', 5);
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
      + '\') and (DueDate ge \'' + startDateString + '\' and DueDate le \'' + endDateString
      + '\')) and (Status eq \'Not Started\') and (Task eq \'Client Review\')'
      + ' and PreviousTaskClosureDate ne null and AssignedTo eq ' + this.globalObject.sharePointPageObject.userId + '';
    this.getCR(currentFilter);
  }

  async getCR(currentFilter) {
    const queryOptions = {
      select: 'ID,Title,ProjectCode,StartDate,DueDate,PreviousTaskClosureDate,Milestone,PrevTasks,NextTasks',
      filter: currentFilter,
      top: 4200
    };
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

      for (const task of this.crArrays.taskItems) {
        const crObj: any = $.extend(true, {}, this.pmObject.clientReviewObj);

        crObj.ID = task.ID;
        crObj.Title = task.Title;
        crObj.ProjectCode = task.ProjectCode;

        crObj.NextTasks = task.NextTasks;
        crObj.PreviousTask = task.PrevTasks;
        // tslint:disable-next-line:only-arrow-functions
        const projectObj = this.pmObject.allProjectItems.filter((obj) => {
          return obj.ProjectCode === task.ProjectCode;
        });
        if (projectObj.length) {
          crObj.ClientLegalEntity = projectObj[0].ClientLegalEntity;
          crObj.shortTitle = projectObj[0].WBJID;
          crObj.DeliverableType = projectObj[0].DeliverableType;
          crObj.ProjectFolder = projectObj[0].ProjectFolder;
          // tslint:disable-next-line:only-arrow-functions
          const projecContObj = this.pmObject.projectContactsItems.filter((obj) => {
            return obj.ID === projectObj[0].PrimaryPOC;
          });

          if (projecContObj.length) {
            crObj.POC = projecContObj[0].FullName;
          }
        }
        crObj.DueDate = task.DueDate;
        crObj.DueDateFormat = this.datePipe.transform(new Date(crObj.DueDate), 'MMM dd yyyy hh:mm:ss aa');
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
        shortTitleTempArray.push({ label: crObj.shortTitle, value: crObj.shortTitle });
        clientLegalEntityTempArray.push({ label: crObj.ClientLegalEntity, value: crObj.ClientLegalEntity });
        POCTempArray.push({ label: crObj.POC, value: crObj.POC });
        deliveryTypeTempArray.push({ label: crObj.DeliverableType, value: crObj.DeliverableType });
        dueDateTempArray.push({ label: crObj.DueDate, value: crObj.DueDate });
        milestoneTempArray.push({ label: crObj.Milestone, value: crObj.Milestone });

        const preTaskObj = Object.assign({}, this.options);
        preTaskObj.url = this.spServices.getReadURL(this.Constant.listNames.Schedules.name, this.pmConstant.crTaskOptions);
        preTaskObj.url =  preTaskObj.url.replace('{0}', crObj.PreviousTask);
        preTaskObj.listName = this.Constant.listNames.Schedules.name;
        preTaskObj.type = 'GET';
        batchUrl.push(preTaskObj);
        // const previousTaskEndPoint = this.spServices.getReadURL('' + this.Constant.listNames.Schedules.name + '',
        //   this.pmConstant.crTaskOptions);
        // const previousTaskUpdatedEndPoint = previousTaskEndPoint.replace('{0}', crObj.PreviousTask);
        // this.spServices.getBatchBodyGet(batchContents, batchGuid, previousTaskUpdatedEndPoint);
        tempCRArray.push(crObj);
      }
      // batchContents.push('--batch_' + batchGuid + '--');
      // const userBatchBody = batchContents.join('\r\n');
      // const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
      let arrResults = await this.spServices.executeBatch(batchUrl);
      arrResults = arrResults.length > 0 ? arrResults.map(a => a.retItems) : [];
      for (const taskItem of tempCRArray) {
        // tslint:disable-next-line:only-arrow-functions
        const prevTask = arrResults.filter((previousTaskElement) => {
          return previousTaskElement[0].Title === taskItem.PreviousTask;
        });
        if (prevTask[0] && prevTask[0].length) {
          taskItem.PreviousTaskStatus = prevTask[0][0].Status;
          this.crArrays.previousTaskArray.push(prevTask[0]);
          taskItem.DeliveryDate = prevTask[0][0].DueDate;
          taskItem.DeliveryDateFormat = this.datePipe.transform(new Date(prevTask[0][0].DueDate), 'MMM dd yyyy hh:mm:ss aa');
          deliveryDateTempArray.push({ label: taskItem.DeliveryDate, value: taskItem.DeliveryDate });
        }
      }
      this.crArrays.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      this.crArrays.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      this.crArrays.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.crArrays.POCArray = this.commonService.unique(POCTempArray, 'value');
      this.crArrays.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      this.crArrays.dueDateArray = this.commonService.unique(dueDateTempArray, 'value');
      this.crArrays.milestoneArray = this.commonService.unique(milestoneTempArray, 'value');
      this.crArrays.deliveryDateArray = this.commonService.unique(deliveryDateTempArray, 'value');
      this.pmObject.clientReviewArray = tempCRArray;
      this.pmObject.countObj.crCount = tempCRArray.length;
      this.pmObject.clientReviewArray_copy = tempCRArray.slice(0, 5);
      this.isCRTableHidden = false;
      this.isCRInnerLoaderHidden = true;
      this.isCRTableHidden = false;
    } else {
      if (this.crArrays.taskItems.length !== this.pmObject.countObj.crCount) {
        this.pmObject.countObj.crCount = this.crArrays.taskItems.length;
      }
      this.pmObject.tabMenuItems[3].label = 'Client Review (' + this.pmObject.countObj.crCount + ')';
      this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
      this.crHideNoDataMessage = false;
      this.isCRInnerLoaderHidden = true;
      this.isCRTableHidden = true;
    }
    this.commonService.setIframeHeight();
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
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/allocation#/taskAllocation?ProjectCode=' + task.ProjectCode, '_blank');
  }
  goToProjectManagement(task) {
    this.pmObject.columnFilter.ProjectCode = [task.ProjectCode];
    this.router.navigate(['/projectMgmt/allProjects']);
  }
  closeTask(task) {
    if (task.PreviousTaskStatus === 'Completed') {
      const options = { Status: 'Completed' };
      this.closeTaskWithStatus(task, options, this.crRef);
    } else {
      this.changeErrorMessage('Previous task should be Completed or Auto Closed');
    }
  }
  async closeTaskWithStatus(task, options, unt) {
    const isActionRequired = await this.commonService.checkTaskStatus(task);
    if (isActionRequired) {
      await this.spOperations.updateItem(this.Constant.listNames.Schedules.name, task.ID, options, this.Constant.listNames.Schedules.type);
      const projectInfoOptions = { Status: 'Unallocated' };
      const projectID = this.pmObject.allProjectItems.filter(item => item.ProjectCode === task.ProjectCode);
      await this.spOperations.updateItem(this.Constant.listNames.ProjectInformation.name, projectID[0].ID,
        projectInfoOptions, this.Constant.listNames.ProjectInformation.type);
      this.changeSuccessMessage(task.Title + ' is completed Sucessfully');
      const index = this.pmObject.clientReviewArray.findIndex(item => item.ID === task.ID);
      this.pmObject.clientReviewArray.splice(index, 1);
      this.pmObject.loading.ClientReview = true;
      this.pmObject.countObj.crCount = this.pmObject.countObj.crCount - 1;
      this.commonService.filterAction(unt.sortField, unt.sortOrder,
        unt.filters.hasOwnProperty('global') ? unt.filters.global.value : null, unt.filters, unt.first, unt.rows,
        this.pmObject.clientReviewArray, this.filterColumns, this.pmConstant.filterAction.CLIENT_REVIEW);
    } else {
      this.changeSuccessMessage('' + task.Title + ' is already completed or closed or auto closed. Hence record is refreshed in 30 sec.');
      setTimeout(() => {
        this.ngOnInit();
      }, 3000);
    }
  }
  public changeSuccessMessage(message) {
    this._success.next(message);
  }
  public changeErrorMessage(message) {
    this._error.next(message);
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
  storeRowData(rowData) {
    this.selectedCRTask = rowData;
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
}
