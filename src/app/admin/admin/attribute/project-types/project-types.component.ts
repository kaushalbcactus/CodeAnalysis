import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService, ConfirmationService, Message } from 'primeng/api';

@Component({
  selector: 'app-project-types',
  templateUrl: './project-types.component.html',
  styleUrls: ['./project-types.component.css']
})
export class ProjectTypesComponent implements OnInit {
  projectType: any;
  projectTypeColumns = [];
  projectTypeRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  projectTypeColArray = {
    ProjectType: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditHistoryArray = {
    Action: [],
    ActionBy: [],
    Date: [],
  };
  items = [
    { label: 'Delete' , command: (e) => this.delete()}
  ];
  msgs: Message[] = [];
  constructor(private datepipe: DatePipe, private messageService: MessageService,private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.projectTypeColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'ProjectType', header: 'Project Type' , visibility: true},
      { field: 'LastUpdated', header: 'Last Updated' , visibility: true , exportable: false},
      { field: 'LastUpdatedBy', header: 'Last Updated By' , visibility: true},
    ];

    this.projectTypeRows = [
      {
        // Sr: 1,
        ProjectType: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ];

    this.auditHistoryColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Action', header: 'Action' },
      // { field: 'SubAction', header: 'Sub Action' },
      { field: 'Date', header: 'Date' },
      { field: 'ActionBy', header: 'Action By' },
    ];

    this.auditHistoryRows = [
      {
        // Sr: 1,
        Action: '',
        SubAction: '',
        ActionBy: '',
        ActionDate: '',
      }
    ];

    this.colFilters(this.projectTypeRows);
    this.colFilters1(this.auditHistoryRows);
  }

  colFilters(colData) {
    this.projectTypeColArray.ProjectType = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ProjectType, value: a.ProjectType }; return b; }));
    this.projectTypeColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.projectTypeColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.Action = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryArray.Date = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.Date, 'MMM d, yyyy') }; return b; }));
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
        return {
            label: label1,
            value: array.find(s => s.label === label1).value
        };
    });
  }

  addProjectType(projectType) {
    if (projectType.trim() !== '') {
    this.checkUniqueData(projectType);
    }
  }

  checkUniqueData(data) {
    const found = this.projectTypeRows.find((item) => {
      if ((item.ProjectType).toLowerCase() === data.trim().toLowerCase()) {
        return item;
      }
    });
    return found ? this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Data Already Exist in Table' })
     : this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Data Submitted' });
  }

  delete() {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' }];
      },
      reject: () => {
        this.msgs = [{ severity: 'info', summary: 'Rejected', detail: 'You have rejected' }];
      }
    });
  }

  downloadExcel(pt) {
    pt.exportCSV();
  }

}

