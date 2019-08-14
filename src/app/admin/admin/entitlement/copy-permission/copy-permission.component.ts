import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-copy-permission',
  templateUrl: './copy-permission.component.html',
  styleUrls: ['./copy-permission.component.css']
})
export class CopyPermissionComponent implements OnInit {
  Users = [{ label: 'User 1', value: 'User 1' },
  { label: 'User 2', value: 'User 2' },
  { label: 'User 3', value: 'User 3' },
  { label: 'User 4', value: 'User 4' },
  { label: 'User 5', value: 'User 5' }];

  permissions1: any;
  permissions2: any;
  selectedUsers: any;
  selectedCopyUsers: any;

  constructor() { }

  ngOnInit() {
  }

  userChange() {
    this.permissions1 = 'p1 , p2, p3';
  }

  userCopyChange() {
    this.permissions2 = 'p1';
  }

  save() {
    console.log(this.permissions1);
    console.log(this.permissions2);
  }
}
