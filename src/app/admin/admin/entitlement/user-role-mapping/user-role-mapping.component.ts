import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-role-mapping',
  templateUrl: './user-role-mapping.component.html',
  styleUrls: ['./user-role-mapping.component.css']
})
export class UserRoleMappingComponent implements OnInit {
  userRoleColumns = [];
  userRoleRows = [];
  users = [{label: 'User' , value: 'User'},
  {label: 'User1' , value: 'User1'}];
  selectedUser: any;
  selectedRoles: string[] = [];
  userRoleColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: []
  };

  constructor(private datepipe: DatePipe) { }

  ngOnInit() {
    this.userRoleColumns = [
      { field: 'User', header: 'User' },
      { field: 'Role', header: 'Role' },
      { field: 'Action', header: 'Action' },
      { field: 'By', header: 'By' },
      { field: 'Date', header: 'Date' }
    ];

    this.userRoleRows = [
      {
        User: 'Test',
        Role: 'Task Feedback',
        Action: 'Kaushal Bagrodia',
        By: 'Kaushal Bagrodia',
        Date: 'Jul 3, 2019'
      }
    ];
    this.colFilters(this.userRoleRows);
  }


  colFilters(colData) {
    this.userRoleColArray.User = this.uniqueArrayObj(colData.map(a => { const b = { label: a.User, value: a.User }; return b; }));
    this.userRoleColArray.Role = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Role, value: a.Role }; return b; }));
    this.userRoleColArray.Action = this.uniqueArrayObj(colData.map(a => { const b = { label: a.Action, value: a.Action }; return b; }));
    this.userRoleColArray.By = this.uniqueArrayObj(colData.map(a => { const b = { label: a.By, value: a.By }; return b; }));
    this.userRoleColArray.Date = this.uniqueArrayObj(
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

  save() {
    console.log(this.selectedUser);
    console.log(this.selectedRoles);
  }

  downloadExcel(ur) {
    ur.exportCSV();
  }

}

