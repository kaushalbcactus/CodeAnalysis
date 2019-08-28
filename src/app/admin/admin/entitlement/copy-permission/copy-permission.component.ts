import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-copy-permission',
  templateUrl: './copy-permission.component.html',
  styleUrls: ['./copy-permission.component.css']
})
export class CopyPermissionComponent implements OnInit {
  Users = [{ label: 'User 1', value: 'User 1' , disabled: false},
  { label: 'User 2', value: 'User 2' , disabled: false},
  { label: 'User 3', value: 'User 3' , disabled: false},
  { label: 'User 4', value: 'User 4' , disabled: false},
  { label: 'User 5', value: 'User 5' , disabled: false}];

  permissions1: any;
  permissions2: any;
  selectedUsers: any;
  selectedCopyUsers: any;

  constructor() { }

  ngOnInit() {
  }

  userChange(val) {
    console.log(val);
    this.selectedUsers.disabled = true;
    this.permissions1 = 'p1 , p2, p3';
  }

  userCopyChange(data) {
    console.log(data);
    if (data.label !== this.selectedUsers.label) {
      this.permissions2 = 'p1';
    } else {

    }
  }

  save() {
    console.log(this.permissions1);
    console.log(this.permissions2);
  }
}
