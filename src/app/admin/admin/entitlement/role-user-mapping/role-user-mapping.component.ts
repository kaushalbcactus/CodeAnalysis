import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-role-user-mapping',
  templateUrl: './role-user-mapping.component.html',
  styleUrls: ['./role-user-mapping.component.css']
})
export class RoleUserMappingComponent implements OnInit {
  roleUserColumns = [];
  roleUserRows = [];
  roles = [{label: 'Role 1' , value: 'Role 1'},
  {label: 'Role 2' , value: 'Role 2'}]
  selectedRole:any;
  selectedUsers: string[] = [];

  constructor(private datepipe:DatePipe) { }

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
    ]
  this.colFilters(this.roleUserRows);
  }

  roleUserColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: []
  }

  colFilters(colData) {
    this.roleUserColArray.User = this.uniqueArrayObj(colData.map(a => { let b = { label: a.User, value: a.User }; return b; }));
    this.roleUserColArray.Role = this.uniqueArrayObj(colData.map(a => { let b = { label: a.Role, value: a.Role }; return b; }));
    this.roleUserColArray.Action = this.uniqueArrayObj(colData.map(a => { let b = { label: a.Action, value: a.Action }; return b; }));
    this.roleUserColArray.By = this.uniqueArrayObj(colData.map(a => { let b = { label: a.By, value: a.By }; return b; }));
    this.roleUserColArray.Date = this.uniqueArrayObj(colData.map(a => { let b = { label: this.datepipe.transform(a.Date,'MMM d, yyyy'), value: this.datepipe.transform(a.Date,'MMM d, yyyy') }; return b; }));
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

  downloadExcel(ru) {
    ru.exportCSV();
  }

}
