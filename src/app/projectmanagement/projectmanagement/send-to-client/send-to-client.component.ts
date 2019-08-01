import { Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { CommonService } from 'src/app/Services/common.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem } from 'primeng/api';
import { PMCommonService } from '../../services/pmcommon.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';

declare var $;
@Component({
  selector: 'app-send-to-client',
  templateUrl: './send-to-client.component.html',
  styleUrls: ['./send-to-client.component.css']
})
export class SendToClientComponent implements OnInit {
  tempClick: any;
  displayedColumns: any[] = [
    { field: 'SLA', header: 'SLA', visibility: true },
    { field: 'ProjectCode', header: 'Project Code', visibility: true },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: true },
    { field: 'POC', header: 'POC', visibility: true },
    { field: 'DeliverableType', header: 'Deliverable Type', visibility: true },
    { field: 'DueDate', header: 'Due Date', visibility: true, exportable: false },
    { field: 'Milestone', header: 'Milestone', visibility: true },
    { field: 'PreviousTaskUser', header: 'Previous Task Owner', visibility: true },
    { field: 'PreviousTaskStatus', header: 'Previous Task Status', visibility: true },
    { field: 'DueDateFormat', header: 'Due Date', visibility: false}];
  filterColumns: any[] = [
    { field: 'ProjectCode' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'DeliverableType' },
    { field: 'DueDate' },
    { field: 'Milestone' },
    { field: 'PreviousTaskUser' },
    { field: 'PreviousTaskStatus' }];
  @ViewChild('sendToClientTableRef', { static: true }) sct: ElementRef;
  // tslint:disable-next-line:variable-name
  private _success = new Subject<string>();
  // tslint:disable-next-line:variable-name
  private _error = new Subject<string>();
  public successMessage: string;
  public errorMessage: string;
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
    projectCodeArray: [],
    clientLegalEntityArray: [],
    POCArray: [],
    deliveryTypeArray: [],
    dueDateArray: [],
    milestoneArray: [],
    previousTaskOwnerArray: [],
    previousTaskStatusArray: [],
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
    this._success.subscribe((message) => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
    this._error.subscribe((message) => this.errorMessage = message);
    this._error.pipe(
      debounceTime(5000)
    ).subscribe(() => this.errorMessage = null);
    setTimeout(() => {
      this.hideNoDataMessage = true;
      this.callSendToClient();
    }, this.pmConstant.TIME_OUT);
  }
  constructor(
    private spServices: SharepointoperationService,
    private Constant: ConstantsService,
    public globalObject: GlobalService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    public pmCommonService: PMCommonService,
    public spOperations: SPOperationService,
  ) {
  }
  public changeSuccessMessage(message) {
    this._success.next(message);
  }
  public changeErrorMessage(message) {
    this._error.next(message);
  }
  downloadTask(task) {
    // setTimeout(() => {
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
    const fileName = task.ProjectCode + ' - ' + task.Milestone;
    this.spServices.downloadMultipleFiles(tempArray, fileName);
    // }, 500);
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
    if (task.PreviousTaskStatus === 'Auto Closed' || task.PreviousTaskStatus === 'Completed') {
      const options = { Status: 'Completed', Actual_x0020_Start_x0020_Date: new Date(), Actual_x0020_End_x0020_Date: new Date() };
      this.closeTaskWithStatus(task, options, this.sct);
    } else {
      this.changeErrorMessage('Previous task should be Completed or Auto Closed');
    }
  }
  async closeTaskWithStatus(task, options, unt) {
    const isActionRequired = await this.commonService.checkTaskStatus(task);
    if (isActionRequired) {
      await this.spOperations.updateItem(this.Constant.listNames.Schedules.name, task.ID, options, this.Constant.listNames.Schedules.type);
      const projectInfoOptions = { Status: 'Author Review' };
      const projectID = this.pmObject.allProjectItems.filter(item => item.ProjectCode === task.ProjectCode);
      await this.spOperations.updateItem(this.Constant.listNames.ProjectInformation.name, projectID[0].ID, projectInfoOptions,
        this.Constant.listNames.ProjectInformation.type);
      // check whether next task is null or not.
      // Update the next task columnn PreviousTaskClosureDate with current date and time.
      if (task.NextTasks) {
        const nextOptions = { PreviousTaskClosureDate: new Date() };
        const nextTask = this.scArrays.nextTaskArray.filter(item => item.Title === task.NextTasks);
        if (nextTask && nextTask.length) {
          await this.spOperations.updateItem(this.Constant.listNames.Schedules.name, nextTask[0].ID, nextOptions,
            this.Constant.listNames.Schedules.type);
        }
      }
      this.changeSuccessMessage(task.Title + ' is completed Sucessfully');

      const index = this.pmObject.sendToClientArray.findIndex(item => item.ID === task.ID);
      this.pmObject.sendToClientArray.splice(index, 1);
      this.pmObject.loading.SendToClient = true;
      this.pmObject.countObj.scCount = this.pmObject.countObj.scCount - 1;
      this.commonService.filterAction(unt.sortField, unt.sortOrder,
        unt.filters.hasOwnProperty('global') ? unt.filters.global.value : null, unt.filters, unt.first, unt.rows,
        this.pmObject.sendToClientArray, this.filterColumns, this.pmConstant.filterAction.SEND_TO_CLIENT);
    } else {
      this.changeSuccessMessage('' + task.Title + ' is already completed or closed or auto closed. Hence record is refreshed in 30 sec.');
      setTimeout(() => {
        this.ngOnInit();
      }, 3000);
    }
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
    const currentFilter = 'AssignedTo eq ' + this.globalObject.sharePointPageObject.userId + ' and ' +
      '(Status eq \'Not Started\') and (Task eq \'Send to client\') and ' +
      '((StartDate ge \'' + startDateString + '\' or StartDate le \'' + endDateString + '\') and ' +
      ' (DueDate ge \'' + startDateString + '\' and DueDate le \'' + endDateString + '\'))';
    this.getSendToClient(currentFilter);
  }

  async getSendToClient(currentFilter) {
    const queryOptions = {
      select: 'ID,Title,ProjectCode,StartDate,DueDate,PreviousTaskClosureDate,Milestone,PrevTasks,NextTasks',
      filter: currentFilter,
      top: 4200
    };


    this.scArrays.taskItems = await this.spServices.read('' + this.Constant.listNames.Schedules.name + '', queryOptions);
    const projectCodeTempArray = [];
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
      const batchContents = new Array();
      const batchGuid = this.spServices.generateUUID();
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
          scObj.DeliverableType = projectObj[0].DeliverableType;
          scObj.ProjectFolder = projectObj[0].ProjectFolder;
          // tslint:disable-next-line:only-arrow-functions
          const projecContObj = this.pmObject.projectContactsItems.filter((obj) => {
            return obj.ID === projectObj[0].PrimaryPOC;
          });

          if (projecContObj.length) {
            scObj.POC = projecContObj[0].FullName;
          }
        }
        scObj.DueDate = task.DueDate;
        scObj.DueDateFormat = this.datePipe.transform(new Date(scObj.DueDate), 'MMM dd yyyy hh:mm:ss aa');
        scObj.Milestone = task.Milestone;
        if (new Date(new Date(scObj.DueDate).setHours(0, 0, 0, 0)).getTime() === new Date(new Date().setHours(0, 0, 0, 0)).getTime()) {
          scObj.isBlueIndicator = true;
          scObj.SLA = this.pmConstant.ColorIndicator.BLUE;
        } else if (new Date(new Date(scObj.DueDate).setHours(0, 0, 0, 0)) > new Date(new Date().setHours(0, 0, 0, 0))) {
          scObj.isGreenIndicator = true;
          scObj.SLA = this.pmConstant.ColorIndicator.GREEN;
        } else {
          scObj.isRedIndicator = true;
          scObj.SLA = this.pmConstant.ColorIndicator.RED;
        }
        projectCodeTempArray.push({ label: scObj.ProjectCode, value: scObj.ProjectCode });
        clientLegalEntityTempArray.push({ label: scObj.ClientLegalEntity, value: scObj.ClientLegalEntity });
        POCTempArray.push({ label: scObj.POC, value: scObj.POC });
        deliveryTypeTempArray.push({ label: scObj.DeliverableType, value: scObj.DeliverableType });
        dueDateTempArray.push({ label: scObj.DueDate, value: scObj.DueDate });
        milestoneTempArray.push({ label: scObj.Milestone, value: scObj.Milestone });
        const previousTaskEndPoint = this.spServices.getReadURL('' + this.Constant.listNames.Schedules.name + '',
          this.pmConstant.previousTaskOptions);
        const previousTaskUpdatedEndPoint = previousTaskEndPoint.replace('{0}', scObj.PreviousTask).replace('{1}', scObj.NextTasks);
        this.spServices.getBatchBodyGet(batchContents, batchGuid, previousTaskUpdatedEndPoint);
        tempSendToClientArray.push(scObj);
      }
      batchContents.push('--batch_' + batchGuid + '--');
      const userBatchBody = batchContents.join('\r\n');
      const arrResults = await this.spServices.executeGetBatchRequest(batchGuid, userBatchBody);
      let counter = 0;
      for (const taskItem of tempSendToClientArray) {
        const arrRes = arrResults[counter];
        counter = counter + 1;
        // tslint:disable-next-line:only-arrow-functions
        const prevTask = arrRes.filter((previousTaskElement) => {
          return previousTaskElement.Title === taskItem.PreviousTask;
        });
        // tslint:disable-next-line:only-arrow-functions
        const nextTask = arrRes.filter((nextTaskElement) => {
          return nextTaskElement.Title === taskItem.NextTasks;
        });
        if (prevTask.length) {
          this.scArrays.previousTaskArray.push(prevTask[0]);
          taskItem.PreviousTaskStatus = prevTask[0].Status;
          taskItem.PreviousTaskUser = prevTask[0].AssignedTo ? prevTask[0].AssignedTo.Title : '';
          previousTaskOwnerTempArray.push({ label: taskItem.PreviousTaskUser, value: taskItem.PreviousTaskUser });
          previousTaskStatusTempArray.push({ label: taskItem.PreviousTaskStatus, value: taskItem.PreviousTaskStatus });
        }
        if (nextTask.length) {
          this.scArrays.nextTaskArray.push(nextTask[0]);
        }
      }
      this.scArrays.projectCodeArray = this.commonService.unique(projectCodeTempArray, 'value');
      this.scArrays.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.scArrays.POCArray = this.commonService.unique(POCTempArray, 'value');
      this.scArrays.deliveryTypeArray = this.commonService.unique(deliveryTypeTempArray, 'value');
      this.scArrays.dueDateArray = this.commonService.unique(dueDateTempArray, 'value');
      this.scArrays.milestoneArray = this.commonService.unique(milestoneTempArray, 'value');
      this.scArrays.previousTaskOwnerArray = this.commonService.unique(previousTaskOwnerTempArray, 'value');
      this.scArrays.previousTaskStatusArray = this.commonService.unique(previousTaskStatusTempArray, 'value');
      this.pmObject.sendToClientArray = tempSendToClientArray;
      const tableRef: any = this.sct;
      tableRef.first = 0;
      // this.pmObject.totalRecords.SendToClient = this.pmObject.sendToClientArray.length;
      // this.pmObject.sendToClientArray_copy = tempSendToClientArray.slice(0, 5);
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
    //this.commonService.setIframeHeight();
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
      if (event.target.className === "pi pi-ellipsis-v") {
        if (this.tempClick) {
          this.tempClick.style.display = "none";
          if(this.tempClick !== event.target.parentElement.children[0].children[0]) {
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
          this.tempClick =  undefined;
        }
      }
    }
}
