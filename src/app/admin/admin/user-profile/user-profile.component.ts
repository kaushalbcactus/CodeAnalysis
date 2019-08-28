import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfileColumns = [];
  userProfileRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  showModal = false;
  items = [
    { label: 'Edit'},
    { label: 'Delete' },
];
  constructor(private datepipe:DatePipe) { }

  ngOnInit() {
    this.userProfileColumns = [
      { field: 'Sr', header: 'Sr.No.' },
      { field: 'User', header: 'User' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];
    
    this.userProfileRows = [
      {
        Sr: 1,
        User: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
    ]

    this.auditHistoryColumns = [
      { field: 'Sr', header: 'Sr.No.' },
      { field: 'User', header: 'User' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'ActionDate', header: 'Action Date' },
      { field: 'Details', header: 'Details' }
    ];
    
    this.auditHistoryRows = [
      {
        Sr: 1,
        User: 'User Created',
        ActionBy: '',
        ActionDate: '',
        Details: ''
      }
    ]
  this.colFilters(this.userProfileRows);
  this.colFilters1(this.auditHistoryRows);
  }


  userProfileColArray = {
    Sr: [],
    User: [],
    LastUpdated: [],
    LastUpdatedBy: []
  }

  auditHistoryArray = {
    Sr: [],
    User: [],
    ActionBy:[],
    ActionDate:[],
    Details:[]
  }

  colFilters(colData) {
    this.userProfileColArray.Sr = this.uniqueArrayObj(colData.map(a => { let b = { label: a.Sr, value: a.Sr }; return b; }));
    this.userProfileColArray.User = this.uniqueArrayObj(colData.map(a => { let b = { label: a.User, value: a.User }; return b; }));
    this.userProfileColArray.LastUpdated = this.uniqueArrayObj(colData.map(a => { let b = { label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'), value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy') }; return b; }));
    this.userProfileColArray.LastUpdatedBy = this.uniqueArrayObj(colData.map(a => { let b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b; }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.Sr = this.uniqueArrayObj(colData.map(a => { let b = { label: a.Sr, value: a.Sr }; return b; }));
    this.auditHistoryArray.User = this.uniqueArrayObj(colData.map(a => { let b = { label: a.User, value: a.User }; return b; }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(colData.map(a => { let b = { label: a.ActionBy, value: a.ActionBy }; return b; }));
    this.auditHistoryArray.ActionDate = this.uniqueArrayObj(colData.map(a => { let b = { label: this.datepipe.transform(a.ActionDate, 'MMM d, yyyy'), value: this.datepipe.transform(a.ActionDate, 'MMM d, yyyy') }; return b; }));
    this.auditHistoryArray.Details = this.uniqueArrayObj(colData.map(a => { let b = { label: a.Details, value: a.Details }; return b; }));

  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
        return {
            label: label1,
            value: array.find(s => s.label === label1).value
        }
    })
  }

  showAddUserModal() {
    this.showModal =  true;
  }

  
}
