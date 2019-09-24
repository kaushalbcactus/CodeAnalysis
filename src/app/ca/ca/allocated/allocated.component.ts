import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { Subject } from 'rxjs';
// import { debounceTime } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { CAGlobalService } from '../caservices/caglobal.service';
import { CACommonService } from '../caservices/cacommon.service';
import { UsercapacityComponent } from '../usercapacity/usercapacity.component';
import { ModelComponent } from '../model/model.component';
import { CAConstantService } from '../caservices/caconstant.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { MessageService, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-allocated',
  templateUrl: './allocated.component.html',
  styleUrls: ['./allocated.component.css'],
  providers: [UsercapacityComponent]
})
export class AllocatedComponent implements OnInit {
  // tslint:disable
  taskMenu: MenuItem[];
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

  completeTaskArray = [];

  @ViewChild('popupContent', { static: true }) popupContent: ElementRef;
  @ViewChild('popupUpdatingTaskContext', { static: true }) popupUpdatingTaskContext: ElementRef;
  @ViewChild('popupContentCapacity', { static: true }) popupContentCapacity: ElementRef;
  @ViewChild('popupTaskScopeContent', { static: true }) popupTaskScopeContent: ElementRef;
  @ViewChild('userCapacityTask', { static: true }) userCapacity: UsercapacityComponent;
  // private _success = new Subject<string>();
  // private _popSuccess = new Subject<string>();
  public acArrays = {
    clientLegalEntityArray: [],
    projectCodeArray: [],
    milestoneArray: [],
    taskArray: [],
    deliveryTypeArray: [],
    allocatedArray: [],
    startTimeArray: [],
    endTimeArray: []
  };
  // public successMessage: string;
  // public popupSuccessMessage: string;
  public isTaskScopeButtonDisabled = false;
  tempClick: any;
  constructor(private spServices: SPOperationService,
    private globalConstant: ConstantsService,
    private caConstant: CAConstantService,
    public globalService: GlobalService,
    public caGlobal: CAGlobalService,
    private commonService: CACommonService,
    public userCapacityRef: UsercapacityComponent,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private messageService: MessageService) {
  }
 /**
   * This method is used to initialize the angular component.
   */
  ngOnInit(){ 
    $('#allocatedTableDiv').resize(this.commonService.setHeader);
    this.caGlobal.loading = true;
    this.caGlobal.dataSource = [];
    this.caGlobal.totalRecords = 0;

    this.caGlobal.isAllocatedChecked = true;
    // this._success.subscribe((message) => this.successMessage = message);
    //   this._success.pipe(
    //     debounceTime(5000)
    //   ).subscribe(() => this.successMessage = null);
    // this._popSuccess.subscribe((message) => this.popupSuccessMessage = message);
    // this._popSuccess.pipe(
    //   debounceTime(5000)
    // ).subscribe(() => this.popupSuccessMessage = null);
      setTimeout(() => {
        this.getAllocatedProperties();
      }, 500);
  }
  /**
   * This method is used to display the message on page.
   * @param message 
   */
  // public changeSuccessMessage(message) {
  //   this._success.next(message);
  // }
  /**
   * This method is used to display the message on popup.
   * @param message 
   */
  // public changePopupSuccessMessage(message) {
  //   this._popSuccess.next(message);
  // }
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

  /**
   * This method is used to get all allocated task.
   */
  private async getAllocatedProperties(){
    // this.userDetails = this.spServices.getUserPropertiesById();
    let taskCounter = 0;
    const schedulesItemFetch = [];
    let acTempArrays = {
      clientLegalEntityTempArray :[],
      projectCodeTempArray :[],
      milestoneTempArray :[],
      taskTempArray :[],
      deliveryTypeTempArray :[],
      allocatedTempArray :[],
      startTimeTempArray :[],
      endTimeTempArray :[]
    };
    // let currDate = new Date();
    // currDate.setDate(currDate.getDate() - 3);

    // const dateText = this.datePipe.transform(currDate,'yyyy-MM-ddT00:00:00');
    let allocatedQuery = Object.assign({}, this.caConstant.scheduleAllocatedQueryOptions);
    // allocatedQuery.filter = allocatedQuery.filter.replace('{0}',dateText);
    const arrResults = await this.commonService.getItems(this.resourceCategorizationList,this.projectInformationList, this.scheduleList, allocatedQuery);
    this.resourceList = arrResults[0];
    this.projects = arrResults[1];
    this.schedulesItems = arrResults[2];
      if(this.schedulesItems && this.schedulesItems.length) {
        for(let task of this.schedulesItems) {
          this.commonService.getCaProperties(taskCounter, schedulesItemFetch, task, this.projects, this.resourceList, this.completeTaskArray,acTempArrays);
        }
        this.commonService.getScheduleItems(schedulesItemFetch, this.completeTaskArray);
        this.acArrays.clientLegalEntityArray = this.commonService.sortByAttribute(this.commonService.unique(acTempArrays.clientLegalEntityTempArray, 'value'),'value','label');
        this.acArrays.projectCodeArray = this.commonService.sortByAttribute(this.commonService.unique(acTempArrays.projectCodeTempArray, 'value'),'value','label');
        this.acArrays.milestoneArray = this.commonService.sortByAttribute(this.commonService.unique(acTempArrays.milestoneTempArray, 'value'),'value','label');
        this.acArrays.taskArray = this.commonService.sortByAttribute(this.commonService.unique(acTempArrays.taskTempArray, 'value'),'value','label');
        this.acArrays.deliveryTypeArray = this.commonService.sortByAttribute(this.commonService.unique(acTempArrays.deliveryTypeTempArray, 'value'),'value','label');
        this.acArrays.allocatedArray = this.commonService.sortByAttribute(this.commonService.unique(acTempArrays.allocatedTempArray, 'value'),'value','label');
        this.acArrays.startTimeArray = this.commonService.sortByDate(this.commonService.unique(acTempArrays.startTimeTempArray, 'value'),'value');
        this.acArrays.endTimeArray = this.commonService.sortByDate(this.commonService.unique(acTempArrays.endTimeTempArray, 'value'),'value');
        this.caGlobal.totalRecords = this.completeTaskArray.length;
        this.caGlobal.dataSource = this.completeTaskArray.slice(0,30);
        this.caGlobal.loading = false;
        this.allocatedHideTable = false;
        setTimeout(() => {
          this.commonService.setHeader();
        }, 500);
    }
    else {
      this.allocatedHideNoDataMessage = false;
    }
    this.allocatedHideLoader = true;
  }
  /**
   * This method will fire when sorting or paging action performed.
   * @param event 
   */
  lazyLoadTask(event) {
    this.commonService.lazyLoadTask(event, this.completeTaskArray, this.filterColumns);
  }
  onEnterKey(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }  
  }
  /**
   * This method will fetch all the resource whose role matches with task.
   * @param task 
   */
  fetchResources(task) {
    if(!this.selectOpened) {
      this.modalService.open(this.popupContent, { size: 'sm', centered: true, backdrop: 'static', keyboard: false });
      setTimeout(() => {
        let setResourcesExtn = $.extend(true, [],task.resources);
        const startTime = new Date(new Date(task.startTime).setHours(0, 0, 0, 0));
        const endTime = new Date(new Date(task.endTime).setHours(23, 59, 59, 0));
        const oCapacity = this.userCapacityRef.applyFilterReturn(startTime, endTime, setResourcesExtn);
        task.capacity = oCapacity;
        let setResources = $.extend(true, [],task.resources);
        for(const res of setResources) {
          const retResource = oCapacity.arrUserDetails.filter(function(user){return user.uid === res.UserName.ID})
          this.setColorCode(retResource, res, task);
          const dispTime = parseFloat(retResource[0].displayTotalUnAllocated.replace(':','.'));
          res.taskDetails = retResource[0];
          res.timeAvailable = dispTime;
        }
        task.selectedResources = [];
        const res = this.commonService.sortResources(setResources,task);
        const resExtn = $.extend(true, [],res);
        for(const retRes of resExtn) {
          task.selectedResources.push(retRes);
        }
  
        this.modalService.dismissAll();
      }, 500);
    }
  }
  /**
   * This method will set the color code for resources.
   * @param retResource 
   * @param res 
   * @param task 
   */
  setColorCode(retResource, res, task) {
    const retRes = retResource[0];
    const retTask = retRes.tasks.filter(function(tsk){
      return (task.startDate <= tsk.DueDate && task.dueDate>= tsk.DueDate)
      || (task.startDate <= tsk.StartDate && task.dueDate >= tsk.StartDate)
      || (task.startDate >= tsk.StartDate && task.dueDate <= tsk.DueDate)
    })
    if(retTask.length) {
      res.Color = '#D7181F';
    }
    else {
      res.Color = 'green';
    }
  }
  /*showCapacityPopup(task, item, allocateResource) {
    const oCapacity = task.capacity;
    oCapacity.arrUserDetails = [];
    oCapacity.arrUserDetails.push(item.taskDetails);
    // This step added to show the capacity for best fit and recommend users.
    for(let user of task.selectedResources){
      if((user.userType === this.constantService.userType.BEST_FIT || 
        user.userType === this.constantService.userType.RECOMMENDED) && 
        (item.taskDetails.uid !== user.taskDetails.uid)){
          oCapacity.arrUserDetails.push(user.taskDetails);
        }
    }
    this.selectOpened = true;
    task.allocatedResource = '';
    setTimeout(() => {
     this.modalService.open(this.popupContentCapacity, {windowClass : "capacityModal", backdrop: 'static',  centered: true,  keyboard: false });
      const modalRef = this.modalService.open(ModelComponent, {windowClass : "capacityModal", backdrop: 'static',  centered: true,  keyboard: false});
      modalRef.componentInstance.callUserCapacityModel(oCapacity);
      modalRef.componentInstance.closeModalEmit.subscribe(($event) => {
        this.closeModal();
      });
      allocateResource.open(); 
      this.openedSelect = allocateResource;
      task.allocatedResource = '';
      this.openedTask = task;
    }, 500);
    
  }*/

  /**
   * This method will fire when view schedule is clicked.
   * This method will fetch Best Fit, Recommended resources along with their capacity and task.
   * @param task 
   * @param item 
   * @param allocateResource 
   */
  async showCapacityPopup(task, item, allocateResource) {
    const startTime = new Date(new Date(task.startTime).setHours(0, 0, 0, 0));
    let endDate = new Date(new Date(task.endTime).setDate(new Date(task.endTime).getDate()+2));
    if(endDate.getDay() == 6 || endDate.getDay() ==0){
      endDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate()+2))
    }
    const endTime = new Date(new Date(endDate).setHours(23, 59, 59, 0));
    const oCapacity = await this.fetchResourceByDate(task,startTime, endTime);
    // This step added to show the capacity for best fit and recommend users.
    debugger;
    const tempUserDetailsArray = [];
    for(let user of task.selectedResources){
      if((user.userType === this.globalConstant.userType.BEST_FIT || 
        user.userType === this.globalConstant.userType.RECOMMENDED) && 
        (item.taskDetails.uid !== user.taskDetails.uid)){
          const retResource = oCapacity.arrUserDetails.filter(function(arrdt){return arrdt.uid === user.taskDetails.uid});
          tempUserDetailsArray.push(retResource[0]);
        }
        if(item.taskDetails.uid === user.taskDetails.uid){
          const retResource = oCapacity.arrUserDetails.filter(function(arrdt){return arrdt.uid === user.taskDetails.uid});
          tempUserDetailsArray.splice(0,0,retResource[0]);
        }
    }
    oCapacity.arrUserDetails = tempUserDetailsArray;
    this.selectOpened = true;
    task.allocatedResource = '';
    setTimeout(() => {
     this.modalService.open(this.popupContentCapacity, {windowClass : "capacityModal", backdrop: 'static',  centered: true,  keyboard: false });
      const modalRef = this.modalService.open(ModelComponent, {windowClass : "capacityModal", backdrop: 'static',  centered: true,  keyboard: false});
      modalRef.componentInstance.callUserCapacityModel(oCapacity);
      modalRef.componentInstance.closeModalEmit.subscribe(($event) => {
        this.closeModal();
      });
      allocateResource.open(); 
      this.openedSelect = allocateResource;
      task.allocatedResource = '';
      this.openedTask = task;
      $('.innerTableLoader').hide();
    }, 500);
    
  }
  /**
   * This method will fetch task based on start time and endtime.
   * @param task 
   * @param startTime 
   * @param endTime 
   */
  fetchResourceByDate(task, startTime,endTime){
    if (!this.selectOpened) {
      this.modalService.open(this.popupContent, { size: 'sm', centered: true, backdrop: 'static', keyboard: false });
      let setResourcesExtn = $.extend(true, [],task.resources);
      const oCapacity = this.userCapacityRef.applyFilterReturn(startTime,endTime , setResourcesExtn);
      return oCapacity;
    }
  }
  /**
   * This method is used to closed the Pop-up modal.
   */
  closeModal() {
    this.modalService.dismissAll();
    this.openedTask.allocatedResource = '';
    this.openedSelect.open();
    this.selectOpened = false;
  }
  /**
 * This method is fired when user allocated the task to particular user.
 * 
 * If the allocated resource in different timezone then the system will propmt for particular time period task is 
 * getting allocated. If confirmation given then the system will allocate the task in his/her timezone.
 * 
 * If the task stardate and endate don't matches with backend start date and end date then the system 
 * will reload after 30 sec. 
 * 
 * @param $event 
 * @param task 
 * @param unt 
 */
  async saveTask($event, task, unt) {
    if(!this.selectOpened && task.allocatedResource !== '') {
      if(!this.selectOpened && task.allocatedResource) {
        const currentScheduleTask = await this.spServices.readItem(this.scheduleList,task.id);
        if(currentScheduleTask){
          if(new Date(task.startDate).getTime() === new Date(currentScheduleTask.StartDate).getTime() && 
            new Date(task.dueDate).getTime() === new Date(currentScheduleTask.DueDate).getTime()){
              const indexRes = this.resourceList.findIndex(item => item.UserName.ID === task.allocatedResource);
              let resourceTimeZone = this.resourceList[indexRes].TimeZone.Title;
              resourceTimeZone = resourceTimeZone ? resourceTimeZone : '5.5';
              if(parseFloat(task.timezone) === parseFloat(resourceTimeZone)){
                this.modalService.open(this.popupUpdatingTaskContext, { size: 'sm', centered: true, backdrop: 'static', keyboard: false });
                setTimeout(() => {
                  this.completeEqualTask(task, unt , false);
                  this.modalService.dismissAll();
                }, 500);
              }else{
                const newStartTime = this.commonService.calcTimeForDifferentTimeZone(task.startDate, task.timezone, resourceTimeZone);
                const newEndTime = this.commonService.calcTimeForDifferentTimeZone(task.dueDate, task.timezone, resourceTimeZone);
                if(window.confirm("Task '"+task.title+"' will be allocated to "+this.resourceList[indexRes].UserName.Title+" from "+this.datePipe.transform(newStartTime,'MMM dd yyyy hh:mm:ss aa')+" to "+ this.datePipe.transform(newEndTime,'MMM dd yyyy hh:mm:ss aa') + " in his/her timezone. Do you want to continue ?")){
                  this.modalService.open(this.popupUpdatingTaskContext, { size: 'sm', centered: true, backdrop: 'static', keyboard: false });
                  task.newStartDate = newStartTime;
                  task.newDueDate = newEndTime;
                  task.userTimeZone = resourceTimeZone;
                  setTimeout(() => {
                    this.completeEqualTask(task, unt , true);
                    this.modalService.dismissAll();
                  }, 500);
                }else{
                  this.onClear(task);
                }
              }
          }else{
            this.showToastMsg('info', 'Info', 'Start and EndDate is not matched for this '+task.title +'. Hence page is refreshed in 30 sec.');
            // this.changeSuccessMessage('Start and EndDate is not matched for this '+task.title +'. Hence page is refreshed in 30 sec.');
            setTimeout(() => {
              location.reload();
            }, 3000);
          }
        }
      }
    }
  }

  
  /**
   * This method will update the Assigned To field with selected user and CentralallocationDone with Yes option.
   * 
   * @param task 
   * @param unt 
   * @param istimeZoneUpdate 
   */
   async completeEqualTask(task, unt,istimeZoneUpdate){
    const options = {'AssignedToId' : task.allocatedResource, 'CentralAllocationDone' : 'Yes'}
    const timezoneOptions = {'AssignedToId' : task.allocatedResource, 'CentralAllocationDone' : 'Yes', 'TimeZone': task.userTimeZone}
      //// Save task and remove task from list 
      if(istimeZoneUpdate){
        this.spServices.update(this.scheduleList, task.id, timezoneOptions, 'SP.Data.SchedulesListItem');
      }else{
        this.spServices.update(this.scheduleList, task.id, options, 'SP.Data.SchedulesListItem');
      }

      await this.commonService.ResourceAllocation(task,this.projectInformationList);
      const indexRes = this.resourceList.findIndex(item => item.UserName.ID === task.allocatedResource);
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
          'value':  task.SubMilestones && task.SubMilestones !== 'Default' ?  task.title + ' - ' +  task.SubMilestones : task.title
      });
      objEmailBody.push({
          'key': '@@Val4@@', // Task Type
          'value': task.task
      });
      objEmailBody.push({
          'key': '@@Val5@@', // Milestone
          'value': task.milestone
      });
      if(istimeZoneUpdate){
        objEmailBody.push({
          'key': '@@Val6@@', // new Start Date
          'value': this.datePipe.transform(task.newStartDate,'MMM dd yyyy hh:mm:ss aa')
        });
        objEmailBody.push({
            'key': '@@Val7@@', // new End Date
            'value': this.datePipe.transform(task.newDueDate,'MMM dd yyyy hh:mm:ss aa')
        });
      }else{
        objEmailBody.push({
          'key': '@@Val6@@', // Start Date
          'value': this.datePipe.transform(task.startDate,'MMM dd yyyy hh:mm:ss aa')
        });
        objEmailBody.push({
            'key': '@@Val7@@', // End Date
            'value': this.datePipe.transform(task.dueDate,'MMM dd yyyy hh:mm:ss aa')
        });
      }
      objEmailBody.push({
          'key': '@@Val9@@', // Scope
          'value': task.taskScope ? task.taskScope : ''
      });
      //// Send allocation email
      this.commonService.triggerMail(this.resourceList[indexRes].UserName.EMail, this.globalService.sharePointPageObject.email,
        '', 'TaskCreation', objEmailBody, mailSubject);

      this.showToastMsg('success', 'Success', task.title + ' allocated to ' + this.resourceList[indexRes].UserName.Title);
      // this.changeSuccessMessage(task.title + ' allocated to ' + this.resourceList[indexRes].UserName.Title);
      const index = this.completeTaskArray.findIndex(item => item.id === task.id);
      // this.completeTaskArray.splice(index,1);
      this.completeTaskArray[index].isEditEnabled = true;
      this.completeTaskArray[index].assignedTo = this.resourceList[indexRes].UserName.Title;
      this.completeTaskArray[index].isAllocatedSelectHidden = true;
      this.completeTaskArray[index].isAssignedToHidden = false;
      this.completeTaskArray[index].editImageUrl = this.globalService.imageSrcURL.editImageURL;
      if(unt){
        this.caGlobal.loading = true;
        this.commonService.filterAction(unt.sortField, unt.sortOrder, unt.filters.hasOwnProperty("global") ? unt.filters.global.value : null,unt.filters, unt.first, unt.rows, 
        this.completeTaskArray, this.filterColumns);
      }
  }
  /**
   * This method allows to reassign the task to different user.
   * @param element 
   * @param task 
   */
  enabledAllocateSelect(task){
    task.isAllocatedSelectHidden = false;
    task.isAssignedToHidden = true;
    task.isEditEnabled = false;
    task.editImageUrl = this.globalService.imageSrcURL.cancelImageURL;
    task.allocatedResource = null;
  }
  /**
   * This method is used to undo the selected resource.
   * @param element 
   * @param task 
   */
  cancelledAllocatedSelect(task){
    task.isAllocatedSelectHidden = true;;
    task.isAssignedToHidden = false;
    task.isEditEnabled = true;
    task.editImageUrl = this.globalService.imageSrcURL.editImageURL;
  }
  /**
   * This method is used to clear the selected resource.
   * @param task 
   */
  onClear(task) {
    task.allocatedResource = null;
  }
  /**
   * This method will fired when task scope is clicked.
   * This method will fetch the comment and show in text area.
   * @param task 
   */
  getAllocateTaskScope(task){
    this.commonService.getAllocateTaskScope(task,this.popupTaskScopeContent, this.completeTaskArray, this.modalService);
  }
  /**
   * This method will update the comments field in schedules list with updated comments.
   * @param task 
   * @param comments 
   */
  saveTaskScope(task, comments){
    this.isTaskScopeButtonDisabled = true;
    this.commonService.saveTaskScopeComments(task, comments);
    this.showToastMsg('success', 'Success', 'The comments - '+comments +' has saved Successfully');
    // this.changePopupSuccessMessage('The comments - '+comments +' has saved Successfully');
      setTimeout(() => {
        location.reload();
      }, 400);
  }

  showToastMsg(type, msg, detail) {
    this.messageService.add({severity: type, summary: msg, detail: detail});
  }



  openPopup(data) {
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
  }


   // *************************************************************************************************************************************
  // hide popup menu on production
  // *************************************************************************************************************************************

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
}
