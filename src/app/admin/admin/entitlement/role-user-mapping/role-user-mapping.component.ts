import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-role-user-mapping',
  templateUrl: './role-user-mapping.component.html',
  styleUrls: ['./role-user-mapping.component.css']
})
export class RoleUserMappingComponent implements OnInit {

  constructor(private datepipe: DatePipe) { }
  roleUserColumns = [];
  roleUserRows = [];

  groups = [{ label: 'Group 1', value: 'Group 1' },
  { label: 'Group 2', value: 'Group 2' },
  { label: 'Group 3', value: 'Group 3' },
  { label: 'Group 4', value: 'Group 4' },
  { label: 'Group 5', value: 'Group 5' }];

  Users = [{ label: 'User 1', value: 'User 1' },
  { label: 'User 2', value: 'User 2' },
  { label: 'User 3', value: 'User 3' },
  { label: 'User 4', value: 'User 4' },
  { label: 'User 5', value: 'User 5' }];
  selectedGroup: any;
  selectedUsers: any;

  roleUserColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: []
  };

  ngOnInit() {
    this.roleUserColumns = [
      { field: 'User', header: 'User' },
      { field: 'Role', header: 'Role' },
      { field: 'Action', header: 'Action' },
      { field: 'By', header: 'By' },
      { field: 'Date', header: 'Date' }
    ];

    this.roleUserRows = [
      {
        User: 'Test',
        Role: 'Task Feedback',
        Action: 'Kaushal Bagrodia',
        By: 'Kaushal Bagrodia',
        Date: 'Jul 3, 2019'
      }
    ];
    this.colFilters(this.roleUserRows);
  }

  colFilters(colData) {
    this.roleUserColArray.User = this.uniqueArrayObj(colData.map(a => { const b = { label: a.User, value: a.User }; return b; }));
    this.roleUserColArray.Role = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Role, value: a.Role }; return b; }));
    this.roleUserColArray.Action = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.roleUserColArray.By = this.uniqueArrayObj(colData.map(a => { const b = { label: a.By, value: a.By }; return b; }));
    this.roleUserColArray.Date = this.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datepipe.transform(a.Date, 'MMM d, yyyy'),
          // tslint:disable-next-line: align
          value: this.datepipe.transform(a.Date, 'MMM d, yyyy')
        };
        return b;
      }));
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

  groupChange() {
    this.selectedUsers = ['User 1',
      'User 2',
      'User 4'];
  }

  userChange() {
    // console.log(this.selectedUsers);
  }

  save() {
    console.log(this.selectedGroup);
    console.log(this.selectedUsers);
  }

  downloadExcel(ru) {
    ru.exportCSV();
  }

}

