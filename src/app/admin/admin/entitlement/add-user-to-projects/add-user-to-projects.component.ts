import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-user-to-projects',
  templateUrl: './add-user-to-projects.component.html',
  styleUrls: ['./add-user-to-projects.component.css']
})
export class AddUserToProjectsComponent implements OnInit {
  isTypeDisabled: any = [];
  users = [{ label: 'User 1', value: 'User 1' },
  { label: 'User 2', value: 'User 2' },
  { label: 'User 3', value: 'User 3' },
  { label: 'User 4', value: 'User 4' },
  { label: 'User 5', value: 'User 5' }];

  clients: any;

  accessType = [{ label: 'Accountable', type: 'Accountable' },
  { label: 'Access', type: 'Access' }];

  projectList: any;

  index = [];
  selectedRowData = [];
  selectedUsers: any;
  selectedClient: any;
  constructor() { }

  ngOnInit() {
  }

  userChange() {
    this.clients = [{ label: 'Client 1', value: 'Client 1' },
    { label: 'Client 2', value: 'Client 2' },
    { label: 'Client 3', value: 'Client 3' },
    { label: 'Client 4', value: 'Client 4' },
    { label: 'Client 5', value: 'Client 5' }];
  }

  typeChange(val) {
    console.log(val);
  }

  projectCheck(i, rowData) {
    if (rowData.status) {
      if (rowData.type.type === 'Access') {
        this.isTypeDisabled[i] = false;
      }
      this.index.push(i);
      this.selectedRowData.push(rowData);
    } else {
      // this.isTypeDisabled[i] = true;
      const index = this.index.findIndex(x => x === i);
      this.index.splice(index, 1);
      const index1 = this.selectedRowData.findIndex(x => x === rowData);
      this.selectedRowData.splice(index1, 1);
    }
  }

  clientChange() {
    this.projectList = [{ project: 'Project 1', type: { label: 'Accountable', type: 'Accountable' }, status: true },
    { project: 'Project 2', type: { label: 'Accountable', type: 'Accountable' }, status: true },
    { project: 'Project 3', type: { label: 'Access', type: 'Access' }, status: true },
    { project: 'Project 4', type: { label: 'Access', type: 'Access' }, status: false },
    { project: 'Project 5', type: { label: 'Accountable', type: 'Accountable' }, status: false }];

    this.projectList.forEach((e, i) => {
      if (e.status) {
        if (e.type.type === 'Accountable') {
          this.isTypeDisabled[i] = true;
        } else {
          this.isTypeDisabled[i] = false;
        }
        this.selectedRowData.push(e);
      }
    });
  }

  save() {
    console.log(this.selectedRowData);
  }

}
