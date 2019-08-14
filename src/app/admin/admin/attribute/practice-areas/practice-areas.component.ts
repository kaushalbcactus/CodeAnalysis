import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-practice-areas',
  templateUrl: './practice-areas.component.html',
  styleUrls: ['./practice-areas.component.css']
})
export class PracticeAreasComponent implements OnInit {
  practiceArea: any;
  practiceAreaColumns = [];
  practiceAreaRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  practiceAreaColArray = {
    PracticeArea: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditHistoryArray = {
    Action: [],
    SubAction: [],
    ActionBy: [],
    Date: [],
  };
  items = [
    { label: 'Delete'}
  ];
  constructor(private datepipe: DatePipe,  private messageService: MessageService) { }

  ngOnInit() {
    this.practiceAreaColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'PracticeArea', header: 'Practice Area' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.practiceAreaRows = [
      {
        // Sr: 1,
        PracticeArea: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ];

    this.auditHistoryColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'Action', header: 'Action' },
      { field: 'SubAction', header: 'Sub Action' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'Date', header: 'Date' },
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

    this.colFilters(this.practiceAreaRows);
    this.colFilters1(this.auditHistoryRows);
  }

  colFilters(colData) {
    this.practiceAreaColArray.PracticeArea = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.PracticeArea, value: a.PracticeArea }; return b; }));
    this.practiceAreaColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
      // tslint:disable-next-line: align
      value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.practiceAreaColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.Action = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.auditHistoryArray.SubAction = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.SubAction, value: a.SubAction }; return b; }));
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

  addPracticeArea(practiceArea) {
    if (practiceArea.trim() !== '') {
    this.checkUniqueData(practiceArea);
    }
  }

  checkUniqueData(data) {
    const found = this.practiceAreaRows.find((item) => {
      if ((item.PracticeArea).toLowerCase() === data.trim().toLowerCase()) {
        return item;
      }
    });
    return found ? this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Data Already Exist in Table' })
     : this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Data Submitted' });
  }

  downloadExcel(pa) {
    pa.exportCSV();
  }

}

