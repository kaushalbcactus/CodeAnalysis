import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  message = '';
  confirmButtonName: any;
  rejectButtonName: any;
  buttons: any;
  note: any;

  constructor(
    public confirmref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit() {
    this.message = this.config.data.message;
    this.note = this.config.data.note ? this.config.data.note : '';
    this.buttons = this.config.data.buttons;
  }



  Confirm(confimMessage) {
    this.confirmref.close(confimMessage);
  }

}
