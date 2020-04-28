import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng';

@Component({
  selector: 'app-audit-project-dialog',
  templateUrl: './audit-project-dialog.component.html',
  styleUrls: ['./audit-project-dialog.component.css']
})
export class AuditProjectDialogComponent implements OnInit {
  @ViewChild('printDialog', { static: false }) printDialog: ElementRef;
  elRef: ElementRef
  addRollingProjectArray: any[];
  selectedOptions = [];
  public checkList = {
    addRollingProjectError: false,
    addRollingProjectErrorMsg: ''
  };
  enableConfirm = false;
  constructor(public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public messageService: MessageService,
    elRef: ElementRef) {
    this.elRef = elRef;
  }

  ngOnInit() {
    this.addRollingProjectArray = this.config.data;
  }

  
  close() {
    this.ref.close();
  }                                                                             

  onRowSelect(event) {
    event.data.checked = true;
    this.enableDisableConfirmButton();
  }

  onRowUnselect(event) {
    event.data.checked = false;
    this.enableDisableConfirmButton();
  }

  keyPress(event: any) {
    this.enableDisableConfirmButton();
  }
                                             


  enableDisableConfirmButton() {

    //const AuditArray = JSON.parse(JSON.stringify(this.addRollingProjectArray))

    //const unselectedArray = AuditArray.filter(c=> this.selectedOptions.includes(c))
    if (this.selectedOptions.length === this.addRollingProjectArray.length) {
      this.addRollingProjectArray.map(c => c.checked = true);
      //this.enableConfirm = true;
    }
    // else {

    if (this.selectedOptions.length === 0) {
      this.addRollingProjectArray.map(c => c.checked = false);
    
    }
    let tempObj = this.addRollingProjectArray.filter(c =>c.comments === 'Select One');
    if (tempObj.length) {
      this.enableConfirm = false;
    }
    else {
      tempObj = this.addRollingProjectArray.filter(c => c.comments === '');
      if (tempObj.length) {
        this.enableConfirm = tempObj.filter(c => c.checked === false).length > 0 ? false : true;
      } else {
        this.enableConfirm = true;
      }
    }
     
    // }
  }

  ConfirmAudit() {
    this.ref.close(this.printDialog.nativeElement.innerHTML);
  }






}
