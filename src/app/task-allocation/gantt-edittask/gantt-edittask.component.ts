import { Component, OnInit, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, DialogService, TreeNode } from 'primeng';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { GlobalService } from 'src/app/Services/global.service';
import { IDailyAllocationTask } from 'src/app/shared/pre-stack-allocation/interface/prestack';
import { PreStackAllocationComponent } from 'src/app/shared/pre-stack-allocation/pre-stack-allocation.component';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PreStackcommonService } from 'src/app/shared/pre-stack-allocation/service/pre-stackcommon.service';

@Component({
  selector: 'app-gantt-edittask',
  templateUrl: './gantt-edittask.component.html',
  styleUrls: ['./gantt-edittask.component.css'],
  providers: [DialogService],
  encapsulation: ViewEncapsulation.None
})
export class GanttEdittaskComponent implements OnInit {
  private cascadingObject = {
    node: {} as any,
    type: ''
  };
  editTaskForm: FormGroup;
  task: any;
  assignedUsers: any;
  editTaskObject = {
    isTat: true,
    isDisableCascade: true
  }
  isViewAllocation = false;
  milestoneData: TreeNode[] = [];
  milestoneDataCopy: any = [];
  allTasks = [];
  allRestructureTasks = [];
  startDate: any;
  endDate: any;
  maxBudgetHrs: any = '';
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
  disableSave = false;

  constructor(private fb: FormBuilder,
    private config: DynamicDialogConfig,
    public datepipe: DatePipe,
    public editTaskRef: DynamicDialogRef,
    private globalService: GlobalService,
    private dialogService: DialogService,
    private dailyAllocation: PreStackAllocationComponent,
    private taskAllocateCommonService: TaskAllocationCommonService,
    private commonService: CommonService,
    private constants: ConstantsService,
    private prestackService: PreStackcommonService) {

    this.editTaskForm = this.fb.group({
      budgetHrs: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      tat: ['', Validators.required],
      disableCascade: ['', Validators.required],
      resource: ['', Validators.required],
      startDateTimePart: ['', Validators.required],
      endDateTimePart: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.editTaskForm.get('tat').setValue(false);
    this.editTaskForm.get('disableCascade').setValue(false);
    this.editTaskForm.controls['budgetHrs'].enable();
    // this.editTaskForm.controls['startDate'].disable();
    // this.editTaskForm.controls['startDateTimePart'].disable();
    // this.editTaskForm.controls['endDate'].disable();
    // this.editTaskForm.controls['endDateTimePart'].disable();
    this.assignedUsers = this.config.data.assignedUsers;
    this.task = this.config.data.task;
    this.milestoneData = this.config.data.milestoneData;
    this.milestoneDataCopy = this.config.data.milestoneDataCopy;
    this.allRestructureTasks = this.config.data.allRestructureTasks;
    this.allTasks = this.config.data.allTasks;
    const clickedInputType = this.config.data.clickedInputType;
    this.onLoad(this.task, clickedInputType);
  }

  updateDates(task) {
    task.pUserStart = this.commonService.calcTimeForDifferentTimeZone(task.start_date,
      this.globalService.currentUser.timeZone, task.assignedUserTimeZone);

    task.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(task.end_date,
      this.globalService.currentUser.timeZone, task.assignedUserTimeZone);
    this.taskAllocateCommonService.setDatePartAndTimePart(task);
  }

  async onLoad(task, clickedInputType) {
    this.maxBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(task);
    if (task.itemType === 'Client Review' || task.itemType === 'Send to client') {
      let bHrs = 0 || task.budgetHours;
      this.maxBudgetHrs = '';
      this.editTaskForm.get('budgetHrs').setValue(bHrs);
      this.editTaskForm.controls['budgetHrs'].disable();
    }
    if (task.status == 'Not Confirmed' || task.status == "Not Started" || task.status == "Not Saved") {
    if (task.itemType === 'Client Review') {
      this.editTaskObject.isDisableCascade = false;
      this.editTaskObject.isTat = false;
      this.editTaskForm.controls['startDate'].disable();
      this.editTaskForm.controls['startDateTimePart'].disable();
    } else if (task.itemType === 'Send to client') {
      this.editTaskObject.isDisableCascade = true;
      this.editTaskObject.isTat = false;
      this.editTaskForm.controls['endDate'].disable();
      this.editTaskForm.controls['endDateTimePart'].disable();
      task.end_date = task.start_date;
    } else if (task.slotType === 'Slot') {
      this.maxBudgetHrs = '';
      this.editTaskObject.isDisableCascade = true;
      this.editTaskObject.isTat = false;
    } else {
      this.editTaskForm.controls['startDate'].enable();
      this.editTaskForm.controls['startDateTimePart'].enable();
      this.editTaskForm.controls['endDate'].enable();
      this.editTaskForm.controls['endDateTimePart'].enable();
      this.isTaskTAT(task);
    }
    } else if (task.status == "In Progress") {
      this.editTaskForm.controls['startDate'].disable();
      this.editTaskForm.controls['startDateTimePart'].disable();
      this.editTaskForm.controls['resource'].disable();
      if (task.itemType !== 'Send to client') {
        this.editTaskForm.controls['endDate'].enable();
        this.editTaskForm.controls['endDateTimePart'].enable();
      }
    }

    const startTime = this.taskAllocateCommonService.setMinutesAfterDrag(task.start_date);
    task.start_date = new Date(this.datepipe.transform(task.start_date, 'MMM d, y') + ' ' + startTime);
    const endTime = this.taskAllocateCommonService.setMinutesAfterDrag(task.end_date);
    task.end_date = new Date(this.datepipe.transform(task.end_date, 'MMM d, y') + ' ' + endTime);
    this.updateDates(task);
    this.task = task;
    this.task.showAllocationSplit = this.task.allocationPerDay ? true : false;
    this.cascadingObject.node = clickedInputType ? task : '';
    this.cascadingObject.type = clickedInputType;
    this.isViewAllocationBtn(task);
    this.editTaskForm.patchValue({
      budgetHrs: task.budgetHours,
      startDate: task.start_date,
      endDate: task.end_date,
      tat: task.tat,
      disableCascade: task.DisableCascade,
      resource: task.AssignedTo.ID ? task.AssignedTo : (task.slotType === 'Slot' ? { ID: undefined, Email: undefined, Title:  task.skillLevel, SkillText: task.skillLevel } : task.AssignedTo),
      startDateTimePart: startTime,
      endDateTimePart: endTime,
    });


    this.editTaskForm.get('tat').valueChanges.subscribe(tat => {
      task.tat = tat;
        this.isTaskTAT(task);
    });

    this.editTaskForm.get('disableCascade').valueChanges.subscribe(disableCascade => {
      task.DisableCascade = disableCascade;
    });

    this.editTaskForm.get('resource').valueChanges.subscribe(async resource => {
      this.task.res_id = resource;
      this.task.user = resource ? resource.Title : '';
      if (resource) {
        this.task.AssignedTo = resource;
        const newtask = await this.assignedToUserChanged();
        this.patchEditForm(newtask.pUserStart, newtask.pUserEnd);
      } else {
        this.task.AssignedTo = {
          Title: '',
          ID: -1
        }
        this.taskAllocateCommonService.resetDailyAllocation(this.task);
      }
    });

    this.editTaskForm.get('budgetHrs').valueChanges.subscribe(async budgetHrs => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserNamePG.ID;
      });
      this.maxBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(this.task);
      this.task.budgetHours = budgetHrs;
      if (budgetHrs > 0) {
        await this.prestackService.calcPrestackAllocation(resources, this.task);
      } else {
        this.taskAllocateCommonService.resetDailyAllocation(this.task);
      }
    });

    this.editTaskForm.get('startDate').valueChanges.subscribe(async startDate => {
      if (!startDate) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select Start Date.', false);
      } else {
        const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return this.task.AssignedTo.ID === objt.UserNamePG.ID;
        });

        const start_date = new Date(this.datepipe.transform(startDate, 'MMM d, y') + ' ' + this.editTaskForm.get('startDateTimePart').value);
        this.task.start_date = this.commonService.calcTimeForDifferentTimeZone(start_date, task.assignedUserTimeZone,
          this.globalService.currentUser.timeZone);
        this.associateStartEndDates('start', start_date);
        if (this.task.itemType == 'Send to client') {
          this.editTaskForm.controls.endDate.setValue(this.task.start_date);
          this.editTaskForm.controls.endDateTimePart.setValue(this.taskAllocateCommonService.getTimePart(this.task.start_date));
          this.associateStartEndDates('end', this.task.pUserStart);
        }
        await this.startDateChanged(this.task, 'start')
        this.cascadingObject.node = this.task;
        this.cascadingObject.type = 'start';
        await this.validateBudgetHours(this.task);
        if (this.task.budgetHours) {
          await this.prestackService.calcPrestackAllocation(resources, this.task);
        }
      }
    });

    this.editTaskForm.get('endDate').valueChanges.subscribe(async endDate => {
      if (!endDate) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select End Date.', false);
      } else {
        const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return this.task.AssignedTo.ID === objt.UserNamePG.ID;
        });

        const end_date = new Date(this.datepipe.transform(endDate, 'MMM d, y') + ' ' + this.editTaskForm.get('endDateTimePart').value);;
        this.task.end_date = this.commonService.calcTimeForDifferentTimeZone(end_date, task.assignedUserTimeZone,
          this.globalService.currentUser.timeZone);
        this.associateStartEndDates('end', end_date);
        this.cascadingObject.node = this.task;
        this.cascadingObject.type = 'end';
        await this.validateBudgetHours(this.task);
        if (this.task.budgetHours) {
          await this.prestackService.calcPrestackAllocation(resources, this.task);
        }
      }
    });

    this.editTaskForm.get('startDateTimePart').valueChanges.subscribe(async startTime => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserNamePG.ID;
      });

      let start_date = new Date(this.datepipe.transform(this.editTaskForm.get('startDate').value, 'MMM d, y') + ' ' + startTime);;
      this.task.start_date = this.commonService.calcTimeForDifferentTimeZone(start_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.associateStartEndDates('start', start_date);
      if (this.task.itemType == 'Send to client') {
        this.editTaskForm.controls.endDate.setValue(this.task.start_date);
        this.editTaskForm.controls.endDateTimePart.setValue(this.taskAllocateCommonService.getTimePart(this.task.start_date));
        this.associateStartEndDates('end', this.task.pUserStart);
      }
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'start';
      await this.validateBudgetHours(this.task);
      if (this.task.budgetHours) {
        await this.prestackService.calcPrestackAllocation(resources, this.task);
      }
    });

    this.editTaskForm.get('endDateTimePart').valueChanges.subscribe(async endTime => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserNamePG.ID;
      });

      let end_date = new Date(this.datepipe.transform(this.editTaskForm.get('endDate').value, 'MMM d, y') + ' ' + endTime);;
      this.task.end_date = this.commonService.calcTimeForDifferentTimeZone(end_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.associateStartEndDates('end', end_date);
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'end';
      await this.validateBudgetHours(this.task);
      if (this.task.budgetHours) {
        await this.prestackService.calcPrestackAllocation(resources, this.task);
      }
    });

  }

  async validateBudgetHours(task: any) {
    let time: any = this.commonService.getHrsAndMins(task.start_date, task.end_date)
    let bhrs = this.commonService.convertToHrsMins('' + task.budgetHours).replace('.', ':')
    this.maxBudgetHrs = await this.taskAllocateCommonService.setMaxBudgetHrs(task);

    let hrs = parseInt(bhrs.split(':')[0]);
    let min = parseInt(bhrs.split(':')[1]);

    let bHrsTime: any = new Date();
    bHrsTime = bHrsTime.setHours(hrs, min, 0, 0);

    if (bHrsTime > time.maxTime) {
      let ogBudgetHrs = this.editTaskForm.get('budgetHrs').value;
      let budgetHrs: number = 0;
      this.editTaskForm.get('budgetHrs').setValue(budgetHrs);
      this.taskAllocateCommonService.resetDailyAllocation(task);
      task.budgetHours = 0;
      this.commonService.showToastrMessage(this.constants.MessageType.error, 'Budget hours is set to zero because given budget hours is greater than task time period. Original budget hrs of task is ' + ogBudgetHrs, false);
    }
  }

  isViewAllocationBtn(task) {
    if (task.itemType !== 'Client Review' && task.itemType !== 'Send to client' && task.slotType !== 'Slot') {
      this.isViewAllocation = true;
    } else {
      this.isViewAllocation = false;
    }
  }

  isTaskTAT(task) {
    if (task.tat) {
      const startDate = new Date(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate(), 9, 0)
      const endDate = new Date(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate(), 19, 0);
      this.patchEditForm(startDate, endDate);
      this.editTaskForm.controls['startDateTimePart'].disable();
      this.editTaskForm.controls['endDateTimePart'].disable();
    } else {
      this.editTaskForm.controls['startDateTimePart'].enable();
      this.editTaskForm.controls['endDateTimePart'].enable();
    }
  }

  patchEditForm(startDate, endDate) {
    this.editTaskForm.patchValue({
      startDate,
      endDate,
      startDateTimePart: this.taskAllocateCommonService.getTimePart(startDate),
      endDateTimePart: this.taskAllocateCommonService.getTimePart(endDate),
    })
  }

  startDateChanged(node, type) {
    if (type == 'start' && node.pUserStart > node.pUserEnd && node.budgetHours) {
      let endDate = new Date(node.pUserStart);
      endDate.setHours(endDate.getHours() + parseInt(node.budgetHours.split('.')[0]));
      node.budgetHours.split('.')[1] ? endDate.setMinutes(endDate.getMinutes() + parseInt(node.budgetHours.split('.')[1])) : endDate;
      node.end_date = new Date(endDate);
      this.editTaskForm.controls.endDate.setValue(endDate);
      this.editTaskForm.controls.endDateTimePart.setValue(this.taskAllocateCommonService.getTimePart(endDate));
    }
  }

  saveTask(): void {
    let allowStatus = ['Not Confirmed', 'Not Saved'];
    if (this.editTaskForm.valid || allowStatus.includes(this.task.status)) {
      if (this.cascadingObject.node.pUserEnd < this.cascadingObject.node.pUserStart) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'End date time should be greater than start date time.', false);
      }
      else if (this.editTaskForm.value.budgetHrs == 0 && !allowStatus.includes(this.task.status)) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please Add Budget Hours.', false);
      } else {
        const obj = {
          updatedTask: this.editTaskForm,
          reset: false,
          cascadingObject: this.cascadingObject
        };
        this.editTaskRef.close(obj);
      }
    } else {
      if (!allowStatus.includes(this.task.status)) {
        if (!this.editTaskForm.value.resource) {
          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select Resource.', false);
        } else if (!this.editTaskForm.value.budgetHrs) {
          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please Add Budget Hours.', false);
        } else if (!this.editTaskForm.value.startDate) {
          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select Start Date.', false);
        } else if (!this.editTaskForm.value.endDate) {
          this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select End Date.', false);
        }
      }
    }
  }

  reset() {
    const obj = {
      updatedTask: this.editTaskForm,
      reset: true,
      cascadingObject: {}
    };
    this.editTaskRef.close(obj);
  }

  viewAllocation(allocationType) {
    const milestoneTask = this.task;
    milestoneTask.resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserNamePG.ID === this.task.AssignedTo.ID;
    });
    let header = milestoneTask.submilestone ? milestoneTask.milestone + ' ' + milestoneTask.title
      + ' ( ' + milestoneTask.submilestone + ' )' : milestoneTask.milestone + ' ' + milestoneTask.title;
    header = header + ' - ' + milestoneTask.AssignedTo.Title;
    const ref = this.dialogService.open(PreStackAllocationComponent, {
      data: {
        ID: milestoneTask.id,
        task: milestoneTask.taskFullName,
        startDate: milestoneTask.pUserStartDatePart,
        endDate: milestoneTask.pUserEndDatePart,
        startTime: milestoneTask.pUserStartTimePart,
        endTime: milestoneTask.pUserEndTimePart,
        budgetHrs: milestoneTask.budgetHours,
        resource: milestoneTask.resources,
        status: milestoneTask.status,
        strAllocation: milestoneTask.allocationPerDay,
        strTimeSpent: milestoneTask.timeSpentPerDay,
        allocationType
      } as IDailyAllocationTask,
      width: '90vw',

      header,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      this.prestackService.setAllocationPerDay(allocation, milestoneTask);
      if (allocation.allocationAlert) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Resource is over allocated.', false);
      }
    });
  }

  async assignedToUserChanged() {
    this.disableSave = true;
    await this.taskAllocateCommonService.assignedToUserChanged(this.task, this.milestoneData, this.allRestructureTasks, this.allTasks);
    this.disableSave = false;
    return this.task;

    // let milestoneTask = this.task;
    // if (milestoneTask.AssignedTo) {
    //   this.updateNextPreviousTasks(milestoneTask);
    //   milestoneTask.assignedUserChanged = true;
    //   if (milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID) {
    //     milestoneTask.skillLevel = this.taskAllocateCommonService.getSkillName(milestoneTask.AssignedTo.SkillText);
    //     const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
    //     const resource = this.globalService.oTaskAllocation.oResources.filter((objt) => {
    //       return milestoneTask.AssignedTo.ID === objt.UserNamePG.ID;
    //     });
    //     await this.dailyAllocation.calcPrestackAllocation(resource, this.task);
    //     milestoneTask.assignedUserTimeZone = resource && resource.length > 0
    //       ? resource[0].TimeZone.Title ?
    //         resource[0].TimeZone.Title : '+5.5' : '+5.5';

    //     milestoneTask.start_date = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
    //       previousUserTimeZone, milestoneTask.assignedUserTimeZone);
    //     milestoneTask.end_date = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
    //       previousUserTimeZone, milestoneTask.assignedUserTimeZone);
    //     milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
    //       previousUserTimeZone, milestoneTask.assignedUserTimeZone);
    //     milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
    //       previousUserTimeZone, milestoneTask.assignedUserTimeZone);

    //     milestoneTask.pUserStartDatePart = this.taskAllocateCommonService.getDatePart(milestoneTask.pUserStart);
    //     milestoneTask.pUserStartTimePart = this.taskAllocateCommonService.getTimePart(milestoneTask.pUserStart);
    //     milestoneTask.pUserEndDatePart = this.taskAllocateCommonService.getDatePart(milestoneTask.pUserEnd);
    //     milestoneTask.pUserEndTimePart = this.taskAllocateCommonService.getTimePart(milestoneTask.pUserEnd);
    //     /// Change date as user changed in AssignedTo dropdown
    //   } else {
    //     const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
    //     milestoneTask.assignedUserTimeZone = '+5.5';
    //     milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
    //       previousUserTimeZone, milestoneTask.assignedUserTimeZone);
    //     milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
    //       previousUserTimeZone, milestoneTask.assignedUserTimeZone);

    //     milestoneTask.pUserStartDatePart = this.taskAllocateCommonService.getDatePart(milestoneTask.pUserStart);
    //     milestoneTask.pUserStartTimePart = this.taskAllocateCommonService.getTimePart(milestoneTask.pUserStart);
    //     milestoneTask.pUserEndDatePart = this.taskAllocateCommonService.getDatePart(milestoneTask.pUserEnd);
    //     milestoneTask.pUserEndTimePart = this.taskAllocateCommonService.getTimePart(milestoneTask.pUserEnd);
    //     milestoneTask.skillLevel = milestoneTask.AssignedTo.SkillText;
    //     milestoneTask.edited = true;
    //     milestoneTask.user = milestoneTask.skillLevel;
    //   }
    //   return milestoneTask;
    // }
  }

  // async updateNextPreviousTasks(milestoneTask) {
  //   const currentTask = milestoneTask;
  //   const milestone = this.globalService.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ?
  //     // tslint:disable: max-line-length
  //     this.milestoneData.find(m => m.data.title === milestoneTask.milestone + ' (Current)') : this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
  //   let subMilestone: TreeNode;
  //   subMilestone = currentTask.submilestone ? milestone.children.find(t => t.data.title === currentTask.submilestone) : milestone;
  //   if (milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID) {

  //     milestoneTask.ActiveCA = this.globalService.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'No' : milestoneTask.ActiveCA;
  //     milestoneTask.itemType = milestoneTask.itemType.replace(/Slot/g, '');
  //     let newName = '';
  //     if (milestoneTask.IsCentrallyAllocated === 'Yes') {
  //       newName = milestoneTask.itemType;
  //       newName = this.getNewTaskName(milestoneTask, newName);
  //       milestoneTask.IsCentrallyAllocated = 'No';
  //     } else {
  //       newName = milestoneTask.title;
  //     }
  //     if (milestoneTask.nextTask) {
  //       const nextTasks = milestoneTask.nextTask.split(';');
  //       nextTasks.forEach(task => {
  //         const nextTask = subMilestone.children.find(t => t.data.title === task);
  //         const previousOfNextTask = nextTask.data.previousTask.split(';');
  //         const currentTaskIndex = previousOfNextTask.indexOf(currentTask.title);
  //         previousOfNextTask[currentTaskIndex] = newName;
  //         const prevNextTaskString = previousOfNextTask.join(';');
  //         nextTask.data.previousTask = prevNextTaskString;
  //       });
  //     }
  //     if (milestoneTask.previousTask) {
  //       const previousTasks = milestoneTask.previousTask.split(';');
  //       previousTasks.forEach(task => {
  //         const previousTask = subMilestone.children.find(t => t.data.title === task);
  //         const nextOfPrevTask = previousTask.data.nextTask.split(';');
  //         const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.title);
  //         nextOfPrevTask[currentTaskIndex] = newName;
  //         const nextPrevTaskString = nextOfPrevTask.join(';');
  //         previousTask.data.nextTask = nextPrevTaskString;
  //       });
  //     }
  //     milestoneTask.title = newName;
  //   } else if (milestoneTask.slotType === 'Both' && !milestoneTask.AssignedTo.ID) {
  //     milestoneTask.IsCentrallyAllocated = 'Yes';
  //     milestoneTask.ActiveCA = this.globalService.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'Yes' : milestoneTask.ActiveCA;
  //     milestoneTask.itemType = milestoneTask.itemType + 'Slot';
  //     let newName = milestoneTask.itemType;
  //     newName = this.getNewTaskName(milestoneTask, newName);
  //     if (milestoneTask.nextTask) {
  //       const nextTasks = milestoneTask.nextTask.split(';');
  //       nextTasks.forEach(task => {
  //         const nextTask = subMilestone.children.find(t => t.data.title === task);
  //         const previousOfNextTask = nextTask.data.previousTask.split(';');
  //         const currentTaskIndex = previousOfNextTask.indexOf(currentTask.title);
  //         previousOfNextTask[currentTaskIndex] = newName;
  //         const prevNextTaskString = previousOfNextTask.join(';');
  //         nextTask.data.previousTask = prevNextTaskString;
  //       });
  //     }
  //     if (milestoneTask.previousTask) {
  //       const previousTasks = milestoneTask.previousTask.split(';');
  //       previousTasks.forEach(task => {
  //         const previousTask = subMilestone.children.find(t => t.data.title === task);
  //         const nextOfPrevTask = previousTask.data.nextTask.split(';');
  //         const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.title);
  //         nextOfPrevTask[currentTaskIndex] = newName;
  //         const nextPrevTaskString = nextOfPrevTask.join(';');
  //         previousTask.data.nextTask = nextPrevTaskString;
  //       });
  //     }
  //     milestoneTask.title = newName;
  //   }
  // }

  // getNewTaskName(milestoneTask, originalName) {
  //   let counter = 1;
  //   let tasks = this.checkNameExists([], milestoneTask, originalName);
  //   while (tasks.length) {
  //     counter++;
  //     originalName = milestoneTask.itemType + ' ' + counter;
  //     tasks = this.checkNameExists(tasks, milestoneTask, originalName);
  //   }

  //   return originalName;
  // }

  // checkNameExists(tasks, milestoneTask, originalName) {
  //   tasks = this.allRestructureTasks.filter(e => e.pName === originalName && e.milestone === milestoneTask.milestone);
  //   if (!tasks.length) {
  //     tasks = this.allTasks.filter(e => {
  //       const taskName = e.Title.replace(this.globalService.oTaskAllocation.oProjectDetails.projectCode + ' ' + e.Milestone + ' ', '');
  //       return e.FileSystemObjectType === 0 && taskName === originalName && e.Milestone === milestoneTask.milestone;
  //     });
  //   }
  //   return tasks;
  // }


  associateStartEndDates(sType, date) {
    if (sType === 'start') {
      this.task.pUserStart = date;
      this.task.pUserStartDatePart = this.taskAllocateCommonService.getDatePart(date);
      this.task.pUserStartTimePart = this.taskAllocateCommonService.getTimePart(date);
    } else {
      this.task.pUserEnd = date;
      this.task.pUserEndDatePart = this.taskAllocateCommonService.getDatePart(date);
      this.task.pUserEndTimePart = this.taskAllocateCommonService.getTimePart(date);
    }

  }
  showOverlayPanel(event, dailyAllocateOP) {
    const target = event.target;
    const allocationPerDay = this.task.allocationPerDay ? this.task.allocationPerDay : '';
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
  }

  hideOverlayPanel(dailyAllocateOP) {
    dailyAllocateOP.hideOverlay();
  }
}

export interface MilestoneTreeNode {
  data?: any;
  children?: MilestoneTreeNode[];
  leaf?: boolean;
  expanded?: boolean;
}
