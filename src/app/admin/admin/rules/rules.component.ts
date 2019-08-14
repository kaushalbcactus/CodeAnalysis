import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {
  ruleColumns = [];
  ruleRows = [];
  auditTrailColumns = [];
  auditTrailRows = [];
  ruleColArray = {
    Form: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditTrailColArray = {
    UpdatedOn: [],
    UpdatedBy: [],
    UpdatedDetails: []
  };
  constructor(private datepipe: DatePipe) { }

  ngOnInit() {
    this.ruleColumns = [
      { field: 'Form', header: 'Form' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.ruleRows = [
      {
        Form: 'Vendor Detail',
        LastUpdated: '',
        LastUpdatedBy: ''
      }
    ];

    this.auditTrailColumns = [
      { field: 'UpdatedOn', header: 'Client Legal Entry' },
      { field: 'UpdatedBy', header: 'Updated By' },
      { field: 'UpdatedDetails', header: 'Updated Details' },
    ];

    this.auditTrailRows = [
      {
        UpdatedOn: '',
        UpdatedBy: '',
        UpdatedDetails: ''
      }
    ];
    this.colFilters(this.ruleRows);
    this.colFilters1(this.auditTrailRows);
  }

  colFilters(colData) {
      this.ruleColArray.Form = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Form, value: a.Form }; return b; }));
      this.ruleColArray.LastUpdated = this.uniqueArrayObj(
        colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
         // tslint:disable-next-line: align
         value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
      this.ruleColArray.LastUpdatedBy = this.uniqueArrayObj(
        colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
    }

    colFilters1(colData) {
      this.auditTrailColArray.UpdatedOn = this.uniqueArrayObj(
        colData.map(a => { const b = { label: a.UpdatedOn, value: a.UpdatedOn }; return b; }));
      this.auditTrailColArray.UpdatedBy = this.uniqueArrayObj(
        colData.map(a => { const b = { label: this.datepipe.transform(a.UpdatedBy, 'MMM d, yyyy'),
         // tslint:disable-next-line: align
         value: this.datepipe.transform(a.UpdatedBy, 'MMM d, yyyy') }; return b; }));
      this.auditTrailColArray.UpdatedDetails = this.uniqueArrayObj(
        colData.map(a => { const b = { label: a.UpdatedDetails, value: a.UpdatedDetails }; return b; }));
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

  downloadExcel(rule) {
      // console.log(rule);
      rule.exportCSV();
    }

}
