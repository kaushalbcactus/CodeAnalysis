import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent implements OnInit {
  message ='';

  constructor(
    public confirmref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit() {

    this.message =this.config.data;
  }



  Confirm(confimMessage) {
    if (confimMessage) {
      this.confirmref.close(true);
    } else {
      this.confirmref.close();
    }

  }

}