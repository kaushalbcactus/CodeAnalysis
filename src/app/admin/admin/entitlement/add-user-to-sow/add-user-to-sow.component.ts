import { Component, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-user-to-sow',
  templateUrl: './add-user-to-sow.component.html',
  styleUrls: ['./add-user-to-sow.component.css']
})
export class AddUserToSowComponent implements OnInit {
  isTypeDisabled: any = [];
  users = [{ label: 'User 1', value: 'User 1' },
  { label: 'User 2', value: 'User 2' },
  { label: 'User 3', value: 'User 3' },
  { label: 'User 4', value: 'User 4' },
  { label: 'User 5', value: 'User 5' }];

  clients: any;

  accessType = [{ label: 'Accountable', type: 'Accountable' },
  { label: 'Access', type: 'Access' }];

  sowTable = true;
  sowList: any;
  cols: any;
  selectedSow: any = [];
  selectedUser: any;
  selectedClient: any;
  selectedRowItems: any;
  selectedType = { label: 'Access', type: 'Access' };
  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.cols = [
      { field: 'sow', header: 'SOW' },
      // { field: 'color', header: '' }
    ];
    this.sowList = [{ sow: 'Sow 1', type: { label: 'Accountable', type: 'Accountable' } },
    { sow: 'Sow 2', type: { label: 'Accountable', type: 'Accountable' } },
    { sow: 'Sow 3', type: this.selectedType },
    { sow: 'Sow 4', type: this.selectedType },
    { sow: 'Sow 5', type: { label: 'Access', type: 'Access' } },
    { sow: 'Sow 6', type: this.selectedType },
    { sow: 'Sow 7', type: this.selectedType },
    { sow: 'Sow 8', type: { label: 'Accountable', type: 'Accountable' } },
    { sow: 'Sow 9', type: { label: 'Access', type: 'Access' } },
    { sow: 'Sow 10', type: this.selectedType },
    { sow: 'Sow 11', type: this.selectedType },
    { sow: 'Sow 12', type: { label: 'Accountable', type: 'Accountable' } },
    { sow: 'Sow 13', type: this.selectedType },
    { sow: 'Sow 14', type: this.selectedType }];
  }

  ngOnChagnes(changes: SimpleChange) {
    console.log(changes);
  }

  userChange() {
    this.clients = [{ label: 'Client 1', value: 'Client 1' },
    { label: 'Client 2', value: 'Client 2' },
    { label: 'Client 3', value: 'Client 3' },
    { label: 'Client 4', value: 'Client 4' },
    { label: 'Client 5', value: 'Client 5' }];
  }

  typeChange(value) {
    console.log(value);
  }

  sowCheck(event) {
    console.log(event);
    console.log(this.selectedSow);
  }

  uncheck(event) {
    console.log(event);
    // event.data.type = '';
  }

  headerCheck(event) {
    console.log(event);
    if (this.selectedSow.length === 0) {
      this.selectedSow = this.selectedRowItems;
    }
  }

  getData() {
    this.selectedSow = [
      { sow: 'Sow 1', type: { label: 'Accountable', type: 'Accountable' } },
      { sow: 'Sow 2', type: { label: 'Accountable', type: 'Accountable' } },
      { sow: 'Sow 5', type: { label: 'Access', type: 'Access' } },
      { sow: 'Sow 8', type: { label: 'Accountable', type: 'Accountable' } },
      { sow: 'Sow 9', type: { label: 'Access', type: 'Access' } },
      { sow: 'Sow 12', type: { label: 'Accountable', type: 'Accountable' } },
    ];
    this.selectedRowItems = this.selectedSow;
  }

  clientChange() {
    this.getData();
    this.sowList.forEach((e, i) => {
      // console.log(e, i);
      if (e.type.type === 'Accountable') {
        this.isTypeDisabled[i] = true;
      } else {
        this.isTypeDisabled[i] = false;
      }
    });
    this.sowTable = false;
  }

  save() {
    // this.selectedSow.forEach((e) => {
    //   if (e.type === '') {
    //     this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'please select value' });
    //   } else {
    //   }
    // });
    console.log(this.selectedUser);
    console.log(this.selectedClient);
    console.log(this.selectedSow);
  }

}
