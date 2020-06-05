import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  message ='';
  confirmButtonName: any;
  rejectButtonName: any;

  constructor(
    public confirmref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit() {

    this.message =this.config.data.message;
    this.confirmButtonName = this.config.data.buttons[0];
    this.rejectButtonName = this.config.data.buttons[1];
  }



  Confirm(confimMessage) {  
      this.confirmref.close(confimMessage);
  }

}
