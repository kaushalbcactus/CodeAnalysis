import { Component, OnInit, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, DialogService, MessageService, TreeNode } from 'primeng';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { GlobalService } from 'src/app/Services/global.service';
import { IMilestoneTask } from '../interface/allocation';
import { DailyAllocationTask } from 'src/app/shared/pre-stack-allocation/interface/prestack';
// import { DailyAllocationComponent } from '../daily-allocation/daily-allocation.component';
import { PreStackAllocationComponent } from 'src/app/shared/pre-stack-allocation/pre-stack-allocation.component';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-gantt-edittask',
  templateUrl: './gantt-edittask.component.html',
  styleUrls: ['./gantt-edittask.component.css'],
  providers: [MessageService, DialogService],
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
    private messageService: MessageService,
    private dailyAllocation: PreStackAllocationComponent,
    private taskAllocateCommonService: TaskAllocationCommonService,
    private commonService: CommonService) {

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
    this.assignedUsers = this.config.data.assignedUsers;
    this.task = this.config.data.task;
    this.milestoneData = this.config.data.milestoneData;
    this.milestoneDataCopy = this.config.data.milestoneDataCopy;
    this.allRestructureTasks = this.config.data.allRestructureTasks;
    this.allTasks = this.allTasks;
    const clickedInputType = this.config.data.clickedInputType;
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
    if (task.itemType === 'Client Review' || task.itemType === 'Send to client') {
      let bHrs = 0 || task.budgetHours;
      this.editTaskForm.get('budgetHrs').setValue(bHrs);
      this.editTaskForm.controls['budgetHrs'].disable();
    }
    if (task.itemType === 'Client Review') {
      this.editTaskObject.isDisableCascade = false;
      this.editTaskObject.isTat = false;
    } else if (task.itemType === 'Send to client') {
      this.editTaskObject.isDisableCascade = true;
      this.editTaskObject.isTat = false;
    } else if (task.slotType === 'Slot') {
      this.editTaskObject.isDisableCascade = true;
      this.editTaskObject.isTat = false;
    }

    const startTime = this.setMinutesAfterDrag(task.start_date);
    task.start_date = new Date(this.datepipe.transform(task.start_date, 'MMM d, y') + ' ' + startTime);
    const endTime = this.setMinutesAfterDrag(task.end_date);
    task.end_date = new Date(this.datepipe.transform(task.end_date, 'MMM d, y') + ' ' + endTime);
    this.updateDates(task);
    this.task = task;
    this.task.showAllocationSplit = this.task.type === 'task' && this.task.itemType !== 'Client Review' && this.task.itemType !== 'Send to client'
    && this.task.IsCentrallyAllocated === 'No' && +this.task.budgetHours &&
    new Date(this.task.pUserStartDatePart).getTime() !== new Date(this.task.pUserEndDatePart).getTime() ? true : false;
    this.cascadingObject.node = clickedInputType ? task : '';
    this.cascadingObject.type = clickedInputType;
    this.isViewAllocationBtn(task);
    this.editTaskForm.patchValue({
      budgetHrs: task.budgetHours,
      startDate: task.pUserStart,
      endDate: task.pUserEnd,
      tat: task.tat,
      disableCascade: task.DisableCascade,
      resource: task.AssignedTo,
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
      this.task.user = resource.Title;
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserName.ID;
      });
      await this.dailyAllocateTask(resources, this.task);
      let task = await this.assignedToUserChanged();

      let startDate = task.pUserStart;
      let endDate = task.pUserEnd;
      this.editTaskForm.patchValue({
        startDate: startDate,
        endDate: endDate,
        startDateTimePart: this.getTimePart(task.pUserStart),
        endDateTimePart: this.getTimePart(task.pUserEnd),
      });
    });


    this.editTaskForm.get('budgetHrs').valueChanges.subscribe(async budgetHrs => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserName.ID;
      });

      this.task.budgetHours = budgetHrs;

      this.isViewAllocationBtn(task)

      await this.dailyAllocateTask(resources, this.task);
    });

    this.editTaskForm.get('startDate').valueChanges.subscribe(async startDate => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserName.ID;
      });

      const start_date = new Date(this.datepipe.transform(startDate, 'MMM d, y') + ' ' + this.editTaskForm.get('startDateTimePart').value);
      this.task.start_date = this.commonService.calcTimeForDifferentTimeZone(start_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.task.pUserStart = start_date;
      this.task.pUserStartDatePart = this.getDatePart(start_date);
      this.task.pUserStartTimePart = this.getTimePart(start_date);
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'start';
      this.isViewAllocationBtn(task);
      await this.dailyAllocateTask(resources, this.task);
    });

    this.editTaskForm.get('endDate').valueChanges.subscribe(async endDate => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserName.ID;
      });

      const end_date = new Date(this.datepipe.transform(endDate, 'MMM d, y') + ' ' + this.editTaskForm.get('endDateTimePart').value);;
      this.task.end_date = this.commonService.calcTimeForDifferentTimeZone(end_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.task.pUserEnd = end_date;
      this.task.pUserEndDatePart = this.getDatePart(end_date);
      this.task.pUserEndTimePart = this.getTimePart(end_date);
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'end';
      this.isViewAllocationBtn(task);

      await this.dailyAllocateTask(resources, this.task);
    });

    this.editTaskForm.get('startDateTimePart').valueChanges.subscribe(async startTime => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserName.ID;
      });

      let start_date = new Date(this.datepipe.transform(this.editTaskForm.get('startDate').value, 'MMM d, y') + ' ' + startTime);;
      this.task.start_date = this.commonService.calcTimeForDifferentTimeZone(start_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.task.pUserStart = start_date;
      this.task.pUserStartDatePart = this.getDatePart(start_date);
      this.task.pUserStartTimePart = this.getTimePart(start_date);
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'start';
      await this.dailyAllocateTask(resources, this.task);
    });

    this.editTaskForm.get('endDateTimePart').valueChanges.subscribe(async endTime => {
      const resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
        return this.task.AssignedTo.ID === objt.UserName.ID;
      });

      let end_date = new Date(this.datepipe.transform(this.editTaskForm.get('endDate').value, 'MMM d, y') + ' ' + endTime);;
      this.task.end_date = this.commonService.calcTimeForDifferentTimeZone(end_date, task.assignedUserTimeZone,
        this.globalService.currentUser.timeZone);
      this.task.pUserEnd = end_date;
      this.task.pUserEndDatePart = this.getDatePart(end_date);
      this.task.pUserEndTimePart = this.getTimePart(end_date);
      this.cascadingObject.node = this.task;
      this.cascadingObject.type = 'end';
      await this.dailyAllocateTask(resources, this.task);
    });

  }

  setMinutesAfterDrag(date) {
    let time: any = this.getTimePart(date);
    time = time.split(':')
    let h = parseInt(time[0])
    let m = parseInt(time[1].split(' ')[0])
    let ampm = time[1].split(' ')[1]
    let minutes = (Math.round(m / 15) * 15) % 60;
    return h + ':' + minutes + ' ' + ampm;
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
      const obj = {
        updatedTask: this.editTaskForm,
        reset: false,
        cascadingObject: this.cascadingObject
      };
      this.editTaskRef.close(obj);
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
    this.task.resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserName.ID === this.task.AssignedTo.ID;
    });

    const ref = this.dialogService.open(PreStackAllocationComponent, {
      data: {
        ID: this.task.id,
        task: this.task.taskFullName,
        startDate: this.task.pUserStart,
        endDate: this.task.pUserEnd,
        budgetHrs: this.task.budgetHours,
        resource: this.task.resources,
        status: this.task.status,
        strAllocation: this.task.allocationPerDay,
        allocationType
      } as DailyAllocationTask,
      width: '90vw',

      header: this.task.submilestone ? this.task.milestone + ' ' + this.task.title
        + ' ( ' + this.task.submilestone + ' )' : this.task.milestone + ' ' + this.task.title,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      this.setAllocationPerDay(allocation, this.task);
      if (allocation.allocationAlert) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Resource is over allocated' });
      }
    });
  }

  async dailyAllocateTask(resource, milestoneTask) {
    const eqgTasks = ['Edit', 'Quality', 'Graphics', 'Client Review', 'Send to client'];
    if (!eqgTasks.find(t => t === milestoneTask.itemType) && milestoneTask.pUserStartDatePart &&
      resource.length && milestoneTask.pUserEndDatePart && milestoneTask.budgetHours &&
      milestoneTask.pUserEnd > milestoneTask.pUserStart) {
      const allocationData: DailyAllocationTask = {
        ID: milestoneTask.id,
        task: milestoneTask.taskFullName,
        startDate: milestoneTask.pUserStartDatePart,
        endDate: milestoneTask.pUserEndDatePart,
        startTime: milestoneTask.pUserStartTimePart,
        endTime: milestoneTask.pUserEndTimePart,
        budgetHrs: milestoneTask.budgetHours,
        resource,
        status: milestoneTask.status,
        strAllocation: '',
        allocationType: ''
      };
      const resourceCapacity = await this.dailyAllocation.getResourceCapacity(allocationData);
      const objDailyAllocation = await this.dailyAllocation.initialize(resourceCapacity, allocationData);
      this.setAllocationPerDay(objDailyAllocation, milestoneTask);
      if (objDailyAllocation.allocationAlert) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Resource is over allocated' });
      }
    } else {
      milestoneTask.allocationColor = '';
    }
  }

  setAllocationPerDay(allocation, milestoneTask: IMilestoneTask) {
    let task: any;
    if (milestoneTask.type === 'Milestone') {
      const milestoneData: MilestoneTreeNode = this.milestoneData.find(m => m.data.title === milestoneTask.milestone);
      const milestoneTasks: any[] = this.getTasksFromMilestones(milestoneData, false, true);
      milestoneData.data.edited = true;
      task = milestoneTasks.find(t => t.id === milestoneTask.id);
    } else {
      task = milestoneTask;
    }
    task.allocationPerDay = allocation.allocationPerDay;
    task.edited = true;
    if (allocation.allocationType === 'Equal Split') {
      task.allocationColor = 'indianred';
    } else if (allocation.allocationType === 'Daily Allocation') {
      task.allocationColor = 'rgb(160, 247, 142)';
    }
  }

  getTasksFromMilestones(milestone, bOld, includeSubTasks) {
    let tasks = [];
    if (milestone.children !== undefined) {
      for (let nCountSub = 0; nCountSub < milestone.children.length; nCountSub = nCountSub + 1) {
        let submilestone = milestone.children[nCountSub];
        if (submilestone.data.type === 'task') {
          tasks.push(submilestone.data);
          if (includeSubTasks && submilestone.children) {
            for (let nCountSubTask = 0; nCountSubTask < submilestone.children.length; nCountSubTask = nCountSubTask + 1) {
              let subtask = submilestone.children[nCountSubTask];
              tasks.push(subtask.data);
            }
          }
        } else if (submilestone.children !== undefined) {
          for (let nCountTask = 0; nCountTask < submilestone.children.length; nCountTask = nCountTask + 1) {
            let task = submilestone.children[nCountTask];
            tasks.push(task.data);
            if (includeSubTasks && task.children) {
              for (let nCountSubTask = 0; nCountSubTask < task.children.length; nCountSubTask = nCountSubTask + 1) {
                let subtask = task.children[nCountSubTask];
                tasks.push(subtask.data);
              }
            }
          }
        }
      }
    }
    const milData = bOld ? this.milestoneDataCopy : this.milestoneData
    const clTask = milestone.data.type === 'milestone' || milestone.data.type === 'task' ? milData.filter(function (obj) {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.data.title.split(' (')[0]
    }) : milestone.parent ? milData.filter(function (obj) {
      return obj.data.type === 'task' && obj.data.itemType === 'Client Review' && obj.data.milestone === milestone.parent.data.title.split(' (')[0]
    }) : [];



    if (clTask.length)
      tasks.push(clTask[0].data);

    return tasks;
  }

  async assignedToUserChanged() {
    let milestoneTask = this.task;
    if (milestoneTask.AssignedTo) {
      this.updateNextPreviousTasks(milestoneTask);
      milestoneTask.assignedUserChanged = true;
      if (milestoneTask.AssignedTo.hasOwnProperty('ID') && milestoneTask.AssignedTo.ID) {
        milestoneTask.skillLevel = this.taskAllocateCommonService.getSkillName(milestoneTask.AssignedTo.SkillText);
        const previousUserTimeZone = milestoneTask.assignedUserTimeZone;
        const resource = this.globalService.oTaskAllocation.oResources.filter((objt) => {
          return milestoneTask.AssignedTo.ID === objt.UserName.ID;
        });
        await this.dailyAllocateTask(resource, milestoneTask);
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
