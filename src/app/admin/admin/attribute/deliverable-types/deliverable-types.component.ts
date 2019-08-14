import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { CommonService } from '../../../../Services/common.service';

@Component({
  selector: 'app-deliverable-types',
  templateUrl: './deliverable-types.component.html',
  styleUrls: ['./deliverable-types.component.css']
})
export class DeliverableTypesComponent implements OnInit {
  deliverableTypes: any;
  deliverableTypesColumns = [];
  deliverableTypesRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  deliverableTypesColArray = {
    DeliverableType: [],
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
  constructor(private datepipe: DatePipe,  private messageService: MessageService,  private common: CommonService) { }

  ngOnInit() {
    this.deliverableTypesColumns = [
      // { field: 'Sr', header: 'Sr.No.' },
      { field: 'DeliverableType', header: 'Deliverable Type' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.deliverableTypesRows = [
      {
        // Sr: 1,
        DeliverableType: 'Test',
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

    this.colFilters(this.deliverableTypesRows);
    this.colFilters1(this.auditHistoryRows);
  }

  colFilters(colData) {
    this.deliverableTypesColArray.DeliverableType = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.DeliverableType, value: a.DeliverableType }; return b; }));
    this.deliverableTypesColArray.LastUpdated = this.uniqueArrayObj(
      colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
       // tslint:disable-next-line: align
       value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.deliverableTypesColArray.LastUpdatedBy = this.uniqueArrayObj(
      colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.Action = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
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

  addDeliverableData(deliverableTypes) {
    // this.common.checkUniqueData(this.deliverableTypesRows, deliverableTypes);
    if (deliverableTypes.trim() !== '') {
    this.checkUniqueData(deliverableTypes);
    }
  }

  checkUniqueData(data) {
    const found = this.deliverableTypesRows.find((item) => {
      if ((item.DeliverableType).toLowerCase() === data.trim().toLowerCase()) {
        return item;
      }
    });
    return found ? this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Data Already Exist in Table' })
     : this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Data Submitted' });
  }

  downloadExcel(dt) {
    dt.exportCSV();
  }

}
