import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { DatePipe } from '@angular/common';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';

@Component({
  selector: 'app-gantt-edittask',
  templateUrl: './gantt-edittask.component.html',
  styleUrls: ['./gantt-edittask.component.css']
})
export class GanttEdittaskComponent implements OnInit {
  editTaskForm: FormGroup;
  task: any;
  assignedUsers: any;

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
    private taskAllocationCommonService: TaskAllocationCommonService) { 
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

}
