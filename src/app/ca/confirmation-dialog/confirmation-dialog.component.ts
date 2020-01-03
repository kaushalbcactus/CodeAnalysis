import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DialogService } from 'primeng';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],

})
export class ConfirmationDialogComponent implements OnInit {

  constructor(
    public confirmref: DynamicDialogRef,
  ) { }

  ngOnInit() {
  }



  Confirm(confimMessage) {
    if (confimMessage) {
      this.confirmref.close(true);
    } else {
      this.confirmref.close();
    }

  }

}
