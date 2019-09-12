import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminCommonService } from '../../services/admin-common.service';

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
  constructor(private datepipe: DatePipe, private adminCommonService: AdminCommonService) { }

  ngOnInit() {
    this.ruleColumns = [
      { field: 'Form', header: 'Form' , visibility: true},
      { field: 'LastUpdated', header: 'Last Updated' , visibility: true , exportable: false},
      { field: 'LastUpdatedBy', header: 'Last Updated By' , visibility: true},
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
      this.ruleColArray.Form = this.adminCommonService.uniqueArrayObj(
        colData.map(a => { const b = { label: a.Form, value: a.Form }; return b; }));
      this.ruleColArray.LastUpdated = this.adminCommonService.uniqueArrayObj(
        colData.map(a => { const b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'),
         // tslint:disable-next-line: align
         value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
      this.ruleColArray.LastUpdatedBy = this.adminCommonService.uniqueArrayObj(
        colData.map(a => { const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
    }

    colFilters1(colData) {
      this.auditTrailColArray.UpdatedOn = this.adminCommonService.uniqueArrayObj(
        colData.map(a => { const b = { label: a.UpdatedOn, value: a.UpdatedOn }; return b; }));
      this.auditTrailColArray.UpdatedBy = this.adminCommonService.uniqueArrayObj(
        colData.map(a => { const b = { label: this.datepipe.transform(a.UpdatedBy, 'MMM d, yyyy'),
         // tslint:disable-next-line: align
         value: this.datepipe.transform(a.UpdatedBy, 'MMM d, yyyy') }; return b; }));
      this.auditTrailColArray.UpdatedDetails = this.adminCommonService.uniqueArrayObj(
        colData.map(a => { const b = { label: a.UpdatedDetails, value: a.UpdatedDetails }; return b; }));
    }

  downloadExcel(rule) {
      // console.log(rule);
      rule.exportCSV();
    }

}
