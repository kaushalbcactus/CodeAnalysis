import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef, DialogService, MessageService } from 'primeng';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { GlobalService } from 'src/app/Services/global.service';
import { IDailyAllocationTask, IMilestoneTask } from '../interface/allocation';
import { DailyAllocationComponent } from '../daily-allocation/daily-allocation.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { DailyAllocationOverlayComponent } from '../daily-allocation-overlay/daily-allocation-overlay.component';

@Component({
  selector: 'app-gantt-edittask',
  templateUrl: './gantt-edittask.component.html',
  styleUrls: ['./gantt-edittask.component.css'],
  providers: [MessageService, DialogService],
  encapsulation: ViewEncapsulation.None
})
export class GanttEdittaskComponent implements OnInit {
  editTaskForm: FormGroup;
  task: any;
  assignedUsers: any;
  // @ViewChild('dailyAllocateOP', { static: false }) dailyAllocateOP: DailyAllocationOverlayComponent;


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
    private timeline: TimelineComponent) {

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

    this.assignedUsers = this.config.data.assignedUsers;
    this.task = this.config.data.task;
    this.onLoad(this.task);
  }

  onLoad(task) {
    
    this.editTaskForm.patchValue({
      budgetHrs: task.budgetHours,
      startDate: task.pUserStart,
      endDate: task.pUserEnd,
      tat: task.tat,
      disableCascade: task.DisableCascade,
      resource: task.AssignedTo,
      startDateTimePart: task.pUserStartTimePart,
      endDateTimePart: task.pUserEndTimePart,
    })
    console.log(this.editTaskForm.value)
  }

  saveTask(): void {
    if (this.editTaskForm.valid) {
      var obj = {
        updatedTask: this.editTaskForm,
        reset: false,
      }
      this.editTaskRef.close(obj)
    }
  }

  reset() {
    var obj = {
      updatedTask: this.editTaskForm,
      reset: true,
    }
    this.editTaskRef.close(obj)
  }

  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }

  showOverlayPanel(event, dailyAllocateOP) {
    this.timeline.showOverlayPanel(event, this.task, dailyAllocateOP)
  }

  viewAllocation(allocationType) { 
    this.task.resources = this.globalService.oTaskAllocation.oResources.filter((objt) => {
      return objt.UserName.ID === this.task.AssignedTo.ID;
    });

    const ref = this.dialogService.open(DailyAllocationComponent, {
      data: {
        ID: this.task.id,
        task: this.task.taskFullName,
        startDate: this.task.start_date,
        endDate: this.task.end_date,
        budgetHrs: this.task.budgetHours,
        resource: this.task.resources,
        strAllocation: this.task.allocationPerDay,
        allocationType
      } as IDailyAllocationTask,
      width: '90vw',

      header: this.task.submilestone ? this.task.milestone + ' ' + this.task.title
        + ' ( ' + this.task.submilestone + ' )' : this.task.milestone + ' ' + this.task.title,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      this.timeline.setAllocationPerDay(allocation, this.task);
      if (allocation.allocationAlert) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Resource is over allocated' });
      }
    });
  }
}
