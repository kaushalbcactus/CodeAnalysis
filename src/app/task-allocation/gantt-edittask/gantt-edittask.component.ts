import { Component, OnInit, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, DialogService, TreeNode } from 'primeng';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { GlobalService } from 'src/app/Services/global.service';
import { IMilestoneTask } from '../interface/allocation';
import { IDailyAllocationTask } from 'src/app/shared/pre-stack-allocation/interface/prestack';
// import { DailyAllocationComponent } from '../daily-allocation/daily-allocation.component';
import { PreStackAllocationComponent } from 'src/app/shared/pre-stack-allocation/pre-stack-allocation.component';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';

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

  constructor(private fb: FormBuilder,
    private config: DynamicDialogConfig,
    public datepipe: DatePipe,
    public editTaskRef: DynamicDialogRef,
    private globalService: GlobalService,
    private dialogService: DialogService,
    private dailyAllocation: PreStackAllocationComponent,
    private taskAllocateCommonService: TaskAllocationCommonService,
    private commonService: CommonService,
    private constants:ConstantsService) {

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
    this.editTaskForm.controls['startDate'].disable();
    this.editTaskForm.controls['startDateTimePart'].disable();
    this.editTaskForm.controls['endDate'].disable();
    this.editTaskForm.controls['endDateTimePart'].disable();
    this.assignedUsers = this.config.data.assignedUsers;
    this.task = this.config.data.task;
    this.milestoneData = this.config.data.milestoneData;
    this.milestoneDataCopy = this.config.data.milestoneDataCopy;
    this.allRestructureTasks = this.config.data.allRestructureTasks;
    this.allTasks = this.allTasks;
    const clickedInputType = this.config.data.clickedInputType;
    this.startDate = this.config.data.startDate;
    this.endDate = this.config.data.endDate;
    this.onLoad(this.task, clickedInputType);
  }

  updateDates(task) {
    task.pUserStart = this.commonService.calcTimeForDifferentTimeZone(task.start_date,
      this.globalService.currentUser.timeZone, task.assignedUserTimeZone);
    task.pUserStartDatePart = this.getDatePart(task.pUserStart);
    task.pUserStartTimePart = this.getTimePart(task.pUserStart);

    task.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(task.end_date,
      this.globalService.currentUser.timeZone, task.assignedUserTimeZone);
    task.pUserEndDatePart = this.getDatePart(task.pUserEnd);
    task.pUserEndTimePart = this.getTimePart(task.pUserEnd);
  }

  async onLoad(task, clickedInputType) {
    let sTime = this.getTimePart(this.startDate);
    let eTime = this.getTimePart(this.endDate);

    this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(task);

    if (task.itemType === 'Client Review' || task.itemType === 'Send to client') {
      let bHrs = 0 || task.budgetHours;
      this.maxBudgetHrs = '';
      this.editTaskForm.get('budgetHrs').setValue(bHrs);
      this.editTaskForm.controls['budgetHrs'].disable();
    }
    if (task.itemType === 'Client Review') {
      this.editTaskObject.isDisableCascade = false;
      this.editTaskObject.isTat = false;
      this.editTaskForm.controls['startDate'].disable();
      this.editTaskForm.controls['startDateTimePart'].disable();
      // this.editTaskForm.get('startDate').setValue(this.startDate);
      // this.editTaskForm.get('startDateTimePart').setValue(sTime);
      task.start_date = this.startDate;
    } else if (task.itemType === 'Send to client') {
      this.editTaskObject.isDisableCascade = true;
      this.editTaskObject.isTat = false;
      this.editTaskForm.controls['endDate'].disable();
      this.editTaskForm.controls['endDateTimePart'].disable();
      // this.editTaskForm.get('endDate').setValue(this.endDate);
      // this.editTaskForm.get('endDateTimePart').setValue(eTime);
      // task.start_date = this.startDate;
      task.end_date = task.start_date;
    } else if (task.slotType === 'Slot') {
      this.maxBudgetHrs = '';
      this.editTaskObject.isDisableCascade = true;
      this.editTaskObject.isTat = false;
    }

    if (task.status == 'Not Confirmed' || task.status == "Not Started" || task.status == "Not Saved") {
      if (task.itemType !== 'Client Review') {
        this.editTaskForm.controls['startDate'].enable();
        this.editTaskForm.controls['startDateTimePart'].enable();
      }
      if (task.itemType !== 'Send to client') {
        this.editTaskForm.controls['endDate'].enable();
        this.editTaskForm.controls['endDateTimePart'].enable();
      }
    } else if (task.status == "In Progress") {
      this.editTaskForm.controls['startDate'].disable();
      this.editTaskForm.controls['startDateTimePart'].disable();
      // this.editTaskForm.get('startDate').setValue(this.startDate);
      // this.editTaskForm.get('startDateTimePart').setValue(sTime);
      task.start_date = this.startDate;
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
    // this.task.showAllocationSplit = this.task.type === 'task' && this.task.itemType !== 'Client Review' && this.task.itemType !== 'Send to client'
    // && this.task.IsCentrallyAllocated === 'No' && +this.task.budgetHours &&
    // new Date(this.task.pUserStartDatePart).getTime() !== new Date(this.task.pUserEndDatePart).getTime() ? true : false;
    this.task.showAllocationSplit = this.task.AllocationPerDay ? true : false;
    this.cascadingObject.node = clickedInputType ? task : '';
    this.cascadingObject.type = clickedInputType;
    this.isViewAllocationBtn(task);
    this.editTaskForm.patchValue({
      budgetHrs: task.budgetHours,
      startDate: task.start_date,
      endDate: task.end_date,
      tat: task.tat,
      disableCascade: task.DisableCascade,
      resource: task.AssignedTo.ID ? task.AssignedTo : null,
      startDateTimePart: startTime,
      endDateTimePart: endTime,
    });

    if (task.tat) {
      this.isTaskTAT(task);
    }

    this.editTaskForm.get('tat').valueChanges.subscribe(tat => {
      if (tat) {
        this.isTaskTAT(task);
      }
    });

    this.editTaskForm.get('resource').valueChanges.subscribe(async resource => {
      this.task.AssignedTo = resource;
      this.task.res_id = resource;
      this.task.user = resource ? resource.Title : '';
      if (resource) {
        const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return this.task.AssignedTo.ID === objt.UserNamePG.ID;
        });
        await this.dailyAllocation.calcPrestackAllocation(resources, this.task);
        let task = await this.assignedToUserChanged();

        let startDate = task.pUserStart;
        let endDate = task.pUserEnd;
        this.editTaskForm.patchValue({
          startDate: startDate,
          endDate: endDate,
          startDateTimePart: this.getTimePart(task.pUserStart),
          endDateTimePart: this.getTimePart(task.pUserEnd),
        });
      }
    });


    this.editTaskForm.get('budgetHrs').valueChanges.subscribe(async budgetHrs => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserNamePG.ID;
      });


      this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(this.task);
      this.task.budgetHours = budgetHrs;

      this.isViewAllocationBtn(task)

      if (budgetHrs > 0) {
        await this.dailyAllocation.calcPrestackAllocation(resources, this.task);
      }
    });

    this.editTaskForm.get('startDate').valueChanges.subscribe(async startDate => {
      if (!startDate) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please select Start Date.',false);
      } else {
        const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return this.task.AssignedTo.ID === objt.UserNamePG.ID;
        });

        const start_date = new Date(this.datepipe.transform(startDate, 'MMM d, y') + ' ' + this.editTaskForm.get('startDateTimePart').value);
        this.task.start_date = this.commonService.calcTimeForDifferentTimeZone(start_date, task.assignedUserTimeZone,
          this.globalService.currentUser.timeZone);
        this.task.pUserStart = start_date;
        this.task.pUserStartDatePart = this.getDatePart(start_date);
        this.task.pUserStartTimePart = this.getTimePart(start_date);
        if(this.task.itemType == 'Send to client') {
          this.editTaskForm.controls.endDate.setValue(this.task.start_date);
          this.editTaskForm.controls.endDateTimePart.setValue(this.getTimePart(this.task.start_date));
          this.task.pUserEnd = this.task.pUserStart;
          this.task.pUserEndDatePart = this.getDatePart(this.task.pUserStart);
          this.task.pUserEndTimePart = this.getTimePart(this.task.pUserStart);
        }
        this.cascadingObject.node = this.task;
        this.cascadingObject.type = 'start';
        this.validateBudgetHours(this.task);
        this.isViewAllocationBtn(task);
        await this.dailyAllocation.calcPrestackAllocation(resources, this.task);
      }
    });

    this.editTaskForm.get('endDate').valueChanges.subscribe(async endDate => {
      if (!endDate) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please select End Date.',false);
      } else {
        const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return this.task.AssignedTo.ID === objt.UserNamePG.ID;
        });

        const end_date = new Date(this.datepipe.transform(endDate, 'MMM d, y') + ' ' + this.editTaskForm.get('endDateTimePart').value);;
        this.task.end_date = this.commonService.calcTimeForDifferentTimeZone(end_date, task.assignedUserTimeZone,
          this.globalService.currentUser.timeZone);
        this.task.pUserEnd = end_date;
        this.task.pUserEndDatePart = this.getDatePart(end_date);
        this.task.pUserEndTimePart = this.getTimePart(end_date);
        this.cascadingObject.node = this.task;
        this.cascadingObject.type = 'end';
        this.validateBudgetHours(this.task);
        this.isViewAllocationBtn(task);
        await this.dailyAllocation.calcPrestackAllocation(resources, this.task);
      }
    });

    this.editTaskForm.get('startDateTimePart').valueChanges.subscribe(async startTime => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserNamePG.ID;
      });

      let start_date = new Date(this.datepipe.transform(this.editTaskForm.get('startDate').value, 'MMM d, y') + ' ' + startTime);;
      this.task.start_date = this.commonService.calcTimeForDifferentTimeZone(start_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.task.pUserStart = start_date;
      this.task.pUserStartDatePart = this.getDatePart(start_date);
      this.task.pUserStartTimePart = this.getTimePart(start_date);
      if(this.task.itemType == 'Send to client') {
        this.editTaskForm.controls.endDate.setValue(this.task.start_date);
        this.editTaskForm.controls.endDateTimePart.setValue(this.getTimePart(this.task.start_date));
        this.task.pUserEnd = this.task.pUserStart;
        this.task.pUserEndDatePart = this.getDatePart(this.task.pUserStart);
        this.task.pUserEndTimePart = this.getTimePart(this.task.pUserStart);
      }
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'start';
      this.validateBudgetHours(this.task);
      await this.dailyAllocation.calcPrestackAllocation(resources, this.task);
    });

    this.editTaskForm.get('endDateTimePart').valueChanges.subscribe(async endTime => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserNamePG.ID;
      });

      let end_date = new Date(this.datepipe.transform(this.editTaskForm.get('endDate').value, 'MMM d, y') + ' ' + endTime);;
      this.task.end_date = this.commonService.calcTimeForDifferentTimeZone(end_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.task.pUserEnd = end_date;
      this.task.pUserEndDatePart = this.getDatePart(end_date);
      this.task.pUserEndTimePart = this.getTimePart(end_date);
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'end';
      this.validateBudgetHours(this.task);
      await this.dailyAllocation.calcPrestackAllocation(resources, this.task);
    });

  }

  validateBudgetHours(task: any) {
    let time: any = this.commonService.getHrsAndMins(task.pUserStart, task.pUserEnd)
    let bhrs = this.commonService.convertToHrsMins('' + task.budgetHours).replace('.', ':')

    this.maxBudgetHrs = this.taskAllocateCommonService.setMaxBudgetHrs(task);

    let hrs = parseInt(bhrs.split(':')[0]);
    let min = parseInt(bhrs.split(':')[1]);

    let bHrsTime: any = new Date();
    bHrsTime = bHrsTime.setHours(hrs, min, 0, 0);

    if (bHrsTime > time.maxTime) {
      let budgetHrs: number = 0;
      this.editTaskForm.get('budgetHrs').setValue(budgetHrs);
      this.commonService.showToastrMessage(this.constants.MessageType.error,'Budget hours is set to zero because given budget hours is greater than task time period.',false);
    }
  }

  isViewAllocationBtn(task) {
    if (task.itemType !== 'Client Review' && task.itemType !== 'Send to client' && task.slotType !== 'Slot') {
      if (task.budgetHours && task.pUserStartDatePart.getTime() !== task.pUserEndDatePart.getTime()) {
        this.isViewAllocation = true;
      } else {
        this.isViewAllocation = false;
      }
    }
  }

  isTaskTAT(task) {
    const startDate = new Date(task.start_date.getFullYear(), task.start_date.getMonth(), task.start_date.getDate(), 9, 0)
    const endDate = new Date(task.end_date.getFullYear(), task.end_date.getMonth(), task.end_date.getDate(), 19, 0);
    this.editTaskForm.patchValue({
      startDate,
      endDate,
      startDateTimePart: this.getTimePart(startDate),
      endDateTimePart: this.getTimePart(endDate),
    })
  }

  saveTask(): void {
    if (this.editTaskForm.valid) {
      if (this.editTaskForm.value.budgetHrs == 0) {

        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please Add Budget Hours.',false);
      } else {
        const obj = {
          updatedTask: this.editTaskForm,
          reset: false,
          cascadingObject: this.cascadingObject
        };
        this.editTaskRef.close(obj);
      }
    } else {
      if (!this.editTaskForm.value.resource) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please select Resource.',false);
      } else if (!this.editTaskForm.value.budgetHrs) {
       this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please Add Budget Hours.',false);
      } else if (!this.editTaskForm.value.startDate) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please select Start Date.',false);
      } else if (!this.editTaskForm.value.endDate) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Please select End Date.',false);
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

  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }

  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, 'hh:mm a');
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
        startDate: milestoneTask.pUserStart,
        endDate: milestoneTask.pUserEnd,
        startTime: milestoneTask.pUserStartTimePart,
        endTime: milestoneTask.pUserEndTimePart,
        budgetHrs: milestoneTask.budgetHours,
        resource: milestoneTask.resources,
        status: milestoneTask.status,
        strAllocation: milestoneTask.allocationPerDay,
        allocationType
      } as IDailyAllocationTask,
      width: '90vw',

      header,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      this.dailyAllocation.setAllocationPerDay(allocation, milestoneTask);
      if (allocation.allocationAlert) {
        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Resource is over allocated.',false);
      }
    });
  }

  // async dailyAllocateTask(resource, milestoneTask) {
  //   const eqgTasks = ['Edit', 'Quality', 'Graphics', 'Client Review', 'Send to client'];
  //   if (!eqgTasks.find(t => t === milestoneTask.itemType) && milestoneTask.pUserStartDatePart &&
  //     resource.length && milestoneTask.pUserEndDatePart && milestoneTask.budgetHours &&
  //     milestoneTask.pUserEnd > milestoneTask.pUserStart) {
  //     const allocationData: IDailyAllocationTask = {
  //       ID: milestoneTask.id,
  //       task: milestoneTask.taskFullName,
  //       startDate: milestoneTask.pUserStartDatePart,
  //       endDate: milestoneTask.pUserEndDatePart,
  //       startTime: milestoneTask.pUserStartTimePart,
  //       endTime: milestoneTask.pUserEndTimePart,
  //       budgetHrs: milestoneTask.budgetHours,
  //       resource,
  //       status: milestoneTask.status,
  //       strAllocation: '',
  //       allocationType: ''
  //     };
  //     const resourceCapacity = await this.dailyAllocation.getResourceCapacity(allocationData);
  //     const objDailyAllocation = await this.dailyAllocation.initialize(resourceCapacity, allocationData);
  //     this.setAllocationPerDay(objDailyAllocation, milestoneTask);
  //     if (objDailyAllocation.allocationAlert) {
  //       this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Resource is over allocated' });
  //     }
  //   } else {
  //     milestoneTask.allocationColor = '';
  //   }
  // }

  // setAllocationPerDay(allocation, milestoneTask: IMilestoneTask) {
  //   let task: any;
  //   if (milestoneTask.type === 'Milestone') {
  //     const milestoneData: MilestoneTreeNode = this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
  //     const milestoneTasks: any[] = this.getTasksFromMilestones(milestoneData, false, true);
  //     milestoneData.data.edited = true;
  //     task = milestoneTasks.find(t => t.id === milestoneTask.id);
  //   } else {
  //     task = milestoneTask;
  //   }
  //   task.allocationPerDay = allocation.allocationPerDay;
  //   task.showAllocationSplit = true;
  //   task.ganttOverlay = task.showAllocationSplit ? this.taskAllocateCommonService.allocationSplitColumn : '';
  //   task.edited = true;
  //   if (allocation.allocationType === 'Equal allocation per day') {
  //     task.allocationColor = 'indianred';
  //   } else if (allocation.allocationType === 'Daily Allocation') {
  //     task.allocationColor = '';
  //   }
  // }

  // getTasksFromMilestones(milestone, bOld, includeSubTasks) {
  //   let tasks = [];
  //   if (milestone.children !== undefined) {
  //     for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
  //       let submilestone = milestone.children[nCountSub];
  //       if (submilestone.data.type === 'task') {
  //         tasks.push(submilestone.data);
  //         if (includeSubTasks && submilestone.children) {
  //           for (let nCountSubTask = 0; nCountSubTask < submilestone.children.length; nCountSubTask = nCountSubTask + 1) {
  //             let subtask = submilestone.children[nCountSubTask];
  //             tasks.push(subtask.data);
  //           }
  //         }
  //       } else if (submilestone.children !== undefined) {
  //         for (let nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
  //           let task = submilestone.children[nCountTask];
  //           tasks.push(task.data);
  //           if (includeSubTasks && task.children) {
  //             for (let nCountSubTask = 0; nCountSubTask < task.children.length; nCountSubTask = nCountSubTask + 1) {
  //               let subtask = task.children[nCountSubTask];
  //               tasks.push(subtask.data);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   const milData = bOld ? this.milestoneDataCopy : this.milestoneData
  //   const clTask = milestone.data.type === 'milestone' || milestone.data.type === 'task' ? milData.filter(function (obj) {
  //     return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.data.title.split(' (')[0]
  //   }) : milestone.parent ? milData.filter(function (obj) {
  //     return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.parent.data.title.split(' (')[0]
  //   }) : [];



  //   if (clTask.length)
  //     tasks.push(clTask[0].data);

  //   return tasks;
  // }

  async assignedToUserChanged() {
    let milestoneTask = this.task;
    if (milestoneTask.AssignedTo) {
      this.updateNextPreviousTasks(milestoneTask);
      milestoneTask.assignedUserChanged = true;
      if (milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID) {
        milestoneTask.skillLevel = this.taskAllocateCommonService.getSkillName(milestoneTask.AssignedTo.SkillText);
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        const resource = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return milestoneTask.AssignedTo.ID === objt.UserNamePG.ID;
        });
        await this.dailyAllocation.calcPrestackAllocation(resource, this.task);
        milestoneTask.assignedUserTimeZone = resource && resource.length > 0
          ? resource[0].TimeZone.Title ?
            resource[0].TimeZone.Title : '+5.5' : '+5.5';

        milestoneTask.start_date = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        milestoneTask.end_date = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);

        milestoneTask.pUserStartDatePart = this.getDatePart(milestoneTask.pUserStart);
        milestoneTask.pUserStartTimePart = this.getTimePart(milestoneTask.pUserStart);
        milestoneTask.pUserEndDatePart = this.getDatePart(milestoneTask.pUserEnd);
        milestoneTask.pUserEndTimePart = this.getTimePart(milestoneTask.pUserEnd);
        /// Change date as user changed in AssignedTo dropdown
      } else {
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        milestoneTask.assignedUserTimeZone = '+5.5';
        milestoneTask.pUserStart = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserStart,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);
        milestoneTask.pUserEnd = this.commonService.calcTimeForDifferentTimeZone(milestoneTask.pUserEnd,
          previousUserTimeZone, milestoneTask.assignedUserTimeZone);

        milestoneTask.pUserStartDatePart = this.getDatePart(milestoneTask.pUserStart);
        milestoneTask.pUserStartTimePart = this.getTimePart(milestoneTask.pUserStart);
        milestoneTask.pUserEndDatePart = this.getDatePart(milestoneTask.pUserEnd);
        milestoneTask.pUserEndTimePart = this.getTimePart(milestoneTask.pUserEnd);
        milestoneTask.skillLevel = milestoneTask.AssignedTo.SkillText;
        milestoneTask.edited = true;
        milestoneTask.user = milestoneTask.skillLevel;
      }
      return milestoneTask;
    }
  }

  async updateNextPreviousTasks(milestoneTask) {
    const currentTask = milestoneTask;
    const milestone = this.globalService.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ?
      // tslint:disable: max-line-length
      this.milestoneData.find(m => m.data.title === milestoneTask.milestone + ' (Current)') : this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
    let subMilestone: TreeNode;
    subMilestone = currentTask.submilestone ? milestone.children.find(t => t.data.title === currentTask.submilestone) : milestone;
    if (milestoneTask.slotType === 'Both' && milestoneTask.AssignedTo.ID) {

      milestoneTask.ActiveCA = this.globalService.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'No' : milestoneTask.ActiveCA;
      milestoneTask.itemType = milestoneTask.itemType.replace(/Slot/g, '');
      let newName = '';
      if (milestoneTask.IsCentrallyAllocated === 'Yes') {
        newName = milestoneTask.itemType;
        newName = this.getNewTaskName(milestoneTask, newName);
        milestoneTask.IsCentrallyAllocated = 'No';
      } else {
        newName = milestoneTask.title;
      }
      if (milestoneTask.nextTask) {
        const nextTasks = milestoneTask.nextTask.split(';');
        nextTasks.forEach(task => {
          const nextTask = subMilestone.children.find(t => t.data.title === task);
          const previousOfNextTask = nextTask.data.previousTask.split(';');
          const currentTaskIndex = previousOfNextTask.indexOf(currentTask.title);
          previousOfNextTask[currentTaskIndex] = newName;
          const prevNextTaskString = previousOfNextTask.join(';');
          nextTask.data.previousTask = prevNextTaskString;
        });
      }
      if (milestoneTask.previousTask) {
        const previousTasks = milestoneTask.previousTask.split(';');
        previousTasks.forEach(task => {
          const previousTask = subMilestone.children.find(t => t.data.title === task);
          const nextOfPrevTask = previousTask.data.nextTask.split(';');
          const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.title);
          nextOfPrevTask[currentTaskIndex] = newName;
          const nextPrevTaskString = nextOfPrevTask.join(';');
          previousTask.data.nextTask = nextPrevTaskString;
        });
      }
      milestoneTask.title = newName;
    } else if (milestoneTask.slotType === 'Both' && !milestoneTask.AssignedTo.ID) {
      milestoneTask.IsCentrallyAllocated = 'Yes';
      milestoneTask.ActiveCA = this.globalService.oTaskAllocation.oProjectDetails.currentMilestone === milestoneTask.milestone ? 'Yes' : milestoneTask.ActiveCA;
      milestoneTask.itemType = milestoneTask.itemType + 'Slot';
      let newName = milestoneTask.itemType;
      newName = this.getNewTaskName(milestoneTask, newName);
      if (milestoneTask.nextTask) {
        const nextTasks = milestoneTask.nextTask.split(';');
        nextTasks.forEach(task => {
          const nextTask = subMilestone.children.find(t => t.data.title === task);
          const previousOfNextTask = nextTask.data.previousTask.split(';');
          const currentTaskIndex = previousOfNextTask.indexOf(currentTask.title);
          previousOfNextTask[currentTaskIndex] = newName;
          const prevNextTaskString = previousOfNextTask.join(';');
          nextTask.data.previousTask = prevNextTaskString;
        });
      }
      if (milestoneTask.previousTask) {
        const previousTasks = milestoneTask.previousTask.split(';');
        previousTasks.forEach(task => {
          const previousTask = subMilestone.children.find(t => t.data.title === task);
          const nextOfPrevTask = previousTask.data.nextTask.split(';');
          const currentTaskIndex = nextOfPrevTask.indexOf(currentTask.title);
          nextOfPrevTask[currentTaskIndex] = newName;
          const nextPrevTaskString = nextOfPrevTask.join(';');
          previousTask.data.nextTask = nextPrevTaskString;
        });
      }
      milestoneTask.title = newName;
    }
  }

  getNewTaskName(milestoneTask, originalName) {
    let counter = 1;
    // let getItem = this.allRestructureTasks.filter(e => e.pName === originalName && e.milestone === milestoneTask.milestone);
    // if (!getItem.length) {
    //   getItem = this.allTasks.filter(e => {
    //     const taskName = e.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + e.Milestone + ' ', '');
    //     return e.FileSystemObjectType === 0 && taskName === originalName && e.Milestone === milestoneTask.milestone;
    //   });
    // }
    let tasks = this.checkNameExists([], milestoneTask, originalName);
    while (tasks.length) {
      counter++;
      originalName = milestoneTask.itemType + ' ' + counter;
      tasks = this.checkNameExists(tasks, milestoneTask, originalName);
      // getItem = this.allRestructureTasks.filter(e => e.pName === originalName && e.milestone === milestoneTask.milestone);
      // if (!getItem.length) {
      //   getItem = this.allTasks.filter(e => {
      //     const taskName = e.Title.replace(this.sharedObject.oTaskAllocation.oProjectDetails.projectCode + ' ' + e.Milestone + ' ', '');
      //     return e.FileSystemObjectType === 0 && taskName === originalName && e.Milestone === milestoneTask.milestone;
      //   });
      // }
    }

    return originalName;
  }

  checkNameExists(tasks, milestoneTask, originalName) {
    tasks = this.allRestructureTasks.filter(e => e.pName === originalName && e.milestone === milestoneTask.milestone);
    if (!tasks.length) {
      tasks = this.allTasks.filter(e => {
        const taskName = e.Title.replace(this.globalService.oTaskAllocation.oProjectDetails.projectCode + ' ' + e.Milestone + ' ', '');
        return e.FileSystemObjectType === 0 && taskName === originalName && e.Milestone === milestoneTask.milestone;
      });
    }
    return tasks;
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
