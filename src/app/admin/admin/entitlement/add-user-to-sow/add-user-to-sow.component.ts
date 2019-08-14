import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-user-to-sow',
  templateUrl: './add-user-to-sow.component.html',
  styleUrls: ['./add-user-to-sow.component.css']
})
export class AddUserToSowComponent implements OnInit {
  users = [{ label: 'User 1', value: 'User 1' },
  { label: 'User 2', value: 'User 2' },
  { label: 'User 3', value: 'User 3' },
  { label: 'User 4', value: 'User 4' },
  { label: 'User 5', value: 'User 5' }];

  clients = [{ label: 'Client 1', value: 'Client 1' },
  { label: 'Client 2', value: 'Client 2' },
  { label: 'Client 3', value: 'Client 3' },
  { label: 'Client 4', value: 'Client 4' },
  { label: 'Client 5', value: 'Client 5' }];

  sowItems = [{ label: 'Sow 1', value: 'Sow 1' },
  { label: 'Sow 2', value: 'Sow 2' },
  { label: 'Sow 3', value: 'Sow 3' },
  { label: 'Sow 4', value: 'Sow 4' },
  { label: 'Sow 5', value: 'Sow 5' }];

  accessType = [{ label: 'Accountable', value: 'Accountable' },
  { label: 'Access', value: 'Access' }];

  selectedUsers: any;
  selectedClient: any;
  selectedSOW: [] = [];
  selectedValue: [] = [];
  positions = [];
  constructor() { }

  ngOnInit() {
  }

  userChange() {
    // console.log(index);
  }

  typeChange(val) {
    // this.positions.push(val);
    const index = this.positions.indexOf(val);
    if (index === -1) {
      // val not found, pushing onto array
      this.positions.push(val);
    } else {
      // val is found, removing from array
      this.positions.splice(index, 1);
    }
  }

  clientChange() {
  }

  save() {
    console.log(this.selectedSOW);
  }

}
