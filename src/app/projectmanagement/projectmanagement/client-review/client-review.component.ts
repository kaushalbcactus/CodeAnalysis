import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { DatePipe } from '@angular/common';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
declare var $;
@Component({
  selector: 'app-client-review',
  templateUrl: './client-review.component.html',
  styleUrls: ['./client-review.component.css']
})
export class ClientReviewComponent implements OnInit {
  displayedColumns: any[] = [
    { field: 'SLA', header: 'SLA' },
    { field: 'ProjectCode', header: 'Project Code' },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity' },
    { field: 'POC', header: 'POC' },
    { field: 'DeliverableType', header: 'Deliverable Type' },
    { field: 'DueDate', header: 'Due Date' },
    { field: 'Milestone', header: 'Milestone' },
    { field: 'DeliveryDate', header: 'Delivery Date' }];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'DueDate' },
    { field: 'Milestone' },
    { field: 'DeliveryDate' }];
  @ViewChild('crTableRef', {static:true}) crRef: ElementRef;
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
    private spServices: SharepointoperationService,
    private datePipe: DatePipe,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService
  ) { }

  ngOnInit() {
    this.isCRInnerLoaderHidden = false;
    this.isCRFilterHidden = false;
    this.popItems = [
      {
        label: 'Go to Allocation', icon: 'pi pi-external-link', target: '_blank',
        command: (event) => this.goToAllocationPage(this.selectedCRTask)
      },
      {
        label: 'Go to Project', icon: 'pi pi-external-link', target: '_blank',
        command: (event) => this.goToProjectManagement(this.selectedCRTask)
      },
      { label: 'Close', icon: 'pi pi-times', command: (event) => this.closeTask(this.selectedCRTask) }
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
    }, 500);
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
    }, 500);
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
    this.crArrays.taskItems = await this.spServices.read('' + this.Constant.listNames.Schedules.name + '', queryOptions);
    const projectCodeTempArray = [];
    const clientLegalEntityTempArray = [];
    const POCTempArray = [];
    const deliveryTypeTempArray = [];
    const dueDateTempArray = [];
    const milestoneTempArray = [];
    const deliveryDateTempArray = [];
    if (this.crArrays.taskItems.length) {
      const tempCRArray = [];
      const batchContents = new Array();
      const batchGuid = this.spServices.generateUUID();
      // Iterate each CR Task
      for (const task of this.crArrays.taskItems) {
        const crObj: any = $.extend(true, {}, this.pmObject.clientReviewObj);
        crObj.ID = task.ID;
        crObj.Title = task.Title;
        crObj.ProjectCode = task.ProjectCode;
        crObj.NextTasks = task.NextTasks;
        crObj.PreviousTask = task.PrevTasks;
        // tslint:disable-next-line:only-arrow-functions
        const projectObj = this.pmObject.projectInformationItems.filter( (obj) => {
          return obj.ProjectCode === task.ProjectCode;
        });
        if (projectObj.length) {
          crObj.ClientLegalEntity = projectObj[0].ClientLegalEntity;
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
        crObj.DueDate = this.datePipe.transform(task.DueDate, 'MMM dd yyyy hh:mm:ss aa');
        crObj.Milestone = task.Milestone;

        // Check Task Due is greater or smaller than current date.
        if (new Date(new Date(crObj.DueDate).setHours(0, 0, 0, 0)).getTime() === new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
          crObj.isBlueIndicator = true;
          crObj.SLA = this.pmConstant.ColorIndicator.BLUE;
        } else if (new Date(new Date(crObj.DueDate).setHours(0, 0, 0, 0)) > new Date(new Date().setHours(0, 0, 0, 0))) {
          crObj.isGreenIndicator = true;
          crObj.SLA = this.pmConstant.ColorIndicator.GREEN;
        } else {
          crObj.isRedIndicator = true;
          crObj.SLA = this.pmConstant.ColorIndicator.RED;
        }
        projectCodeTempArray.push({ label: crObj.ProjectCode, value: crObj.ProjectCode });
        clientLegalEntityTempArray.push({ label: crObj.ClientLegalEntity, value: crObj.ClientLegalEntity });
        POCTempArray.push({ label: crObj.POC, value: crObj.POC });
        deliveryTypeTempArray.push({ label: crObj.DeliverableType, value: crObj.DeliverableType });
        dueDateTempArray.push({ label: crObj.DueDate, value: crObj.DueDate });
        milestoneTempArray.push({ label: crObj.Milestone, value: crObj.Milestone });
        const previousTaskEndPoint = this.spServices.getReadURL('' + this.Constant.listNames.Schedules.name + '',
          this.pmConstant.crTaskOptions);
        const previousTaskUpdatedEndPoint = previousTaskEndPoint.replace('{0}', crObj.PreviousTask);
        this.spServices.getBatchBodyGet(batchContents, batchGuid, previousTaskUpdatedEndPoint);
        tempCRArray.push(crObj);
      }
      batchContents.push('--batch_' + batchGuid + '--');
      const userBatchBody = batchContents.join('\r\n');
      const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
      for (const taskItem of tempCRArray) {
        // tslint:disable-next-line:only-arrow-functions
        const prevTask = arrResults.filter((previousTaskElement) => {
          return previousTaskElement[0].Title === taskItem.PreviousTask;
        });
        if (prevTask[0] && prevTask[0].length) {
          taskItem.PreviousTaskStatus = prevTask[0][0].Status;
          this.crArrays.previousTaskArray.push(prevTask[0]);
          taskItem.DeliveryDate = this.datePipe.transform(prevTask[0][0].DueDate, 'MMM dd yyyy hh:mm:ss aa');
          deliveryDateTempArray.push({ label: taskItem.DeliveryDate, value: taskItem.DeliveryDate });
        }
      }
      this.crArrays.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
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
      this.crHideNoDataMessage = false;
      this.isCRInnerLoaderHidden = true;
      this.isCRTableHidden = true;
    }
    this.commonService.setIframeHeight();
  }
  downloadTask(task) {
    console.log(task);
    const tempArray = [];
    const documentsUrl = '/Drafts/Internal/' + task.Milestone;
    const documents = this.commonService.getTaskDocument(task.ProjectFolder, documentsUrl, task.PreviousTask);
    for (const document in documents) {
      if (documents[document].visiblePrevTaskDoc === true) {
        const docObj = {
          url: '',
          fileName: ''
        };
        docObj.url = documents[document].fileUrl;
        docObj.fileName = documents[document].fileName;
        tempArray.push(docObj);
      }
    }
  }
  goToAllocationPage(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/Pages/TaskAllocation.aspx?ProjectCode=' + task.ProjectCode, '_blank');
  }
  goToProjectManagement(task) {
    window.open(this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/Pages/ProjectManagement.aspx?ProjectCode=' + task.ProjectCode, '_blank');
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
      await this.spServices.update(this.Constant.listNames.Schedules.name, task.ID, options, this.Constant.listNames.Schedules.type);
      const projectInfoOptions = { Status: 'Unallocated' };
      const projectID = this.pmObject.projectInformationItems.filter(item => item.ProjectCode === task.ProjectCode);
      await this.spServices.update(this.Constant.listNames.ProjectInformation.name, projectID[0].ID,
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
}
