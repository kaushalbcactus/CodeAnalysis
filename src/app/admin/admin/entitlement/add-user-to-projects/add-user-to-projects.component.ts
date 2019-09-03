import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-user-to-projects',
  templateUrl: './add-user-to-projects.component.html',
  styleUrls: ['./add-user-to-projects.component.css']
})
export class AddUserToProjectsComponent implements OnInit {
  clients: any;
  cols;
  isTypeDisabled: any = [];
  users = [{ label: 'User 1', value: 'User 1' },
  { label: 'User 2', value: 'User 2' },
  { label: 'User 3', value: 'User 3' },
  { label: 'User 4', value: 'User 4' },
  { label: 'User 5', value: 'User 5' }];
  accessType = [{ label: 'Accountable', type: 'Accountable' },
  { label: 'Access', type: 'Access' }];

  selectedType = { label: 'Access', type: 'Access' };
  projectList: any;
  projectTable = true;
  selectedUser: any;
  selectedClient: any;
  selectedProject: any;
  selectedRowItems: any;
  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.cols = [
      { field: 'project', header: 'Project' },
      // { field: 'color', header: '' }
    ];
    this.projectList = [{ project: 'Project 1', type: { label: 'Accountable', type: 'Accountable' }, },
    { project: 'Project 2', type: this.selectedType },
    { project: 'Project 3', type: { label: 'Access', type: 'Access' }, },
    { project: 'Project 4', type: { label: 'Accountable', type: 'Accountable' }, },
    { project: 'Project 5', type: this.selectedType, },
    { project: 'Project 6', type: this.selectedType, },
    { project: 'Project 7', type: this.selectedType, },
    { project: 'Project 8', type: { label: 'Access', type: 'Access' }, },
    { project: 'Project 9', type: this.selectedType },
    { project: 'Project 10', type: { label: 'Accountable', type: 'Accountable' }, }];
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

  projectCheck(event) {
    console.log(event);
    console.log(this.selectedProject);
  }

  uncheck(event) {
    console.log(event);
    event.data.type = '';
  }

  headerCheck(event) {
    console.log(event);
    if (this.selectedProject.length === 0) {
      this.selectedProject = this.selectedRowItems;
    }
  }

  getData() {
    this.selectedProject = [{ project: 'Project 1', type: { label: 'Accountable', type: 'Accountable' }, },
    { project: 'Project 3', type: { label: 'Access', type: 'Access' }, },
    { project: 'Project 4', type: { label: 'Accountable', type: 'Accountable' }, },
    { project: 'Project 8', type: { label: 'Access', type: 'Access' }, },
    { project: 'Project 10', type: { label: 'Accountable', type: 'Accountable' }, }];

    this.selectedRowItems = this.selectedProject;
  }

  clientChange() {
    this.getData();
    this.projectList.forEach((e, i) => {
      // console.log(e, i);
      if (e.type.type === 'Accountable') {
        this.isTypeDisabled[i] = true;
      } else {
        this.isTypeDisabled[i] = false;
      }
    });
    this.projectTable = false;
  }

  save() {
    this.selectedProject.forEach((e) => {
      if (e.type === '') {
        this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'please select value' });
      } else {
      }
    });
    console.log(this.selectedUser);
    console.log(this.selectedClient);
    console.log(this.selectedProject);
  }

}
