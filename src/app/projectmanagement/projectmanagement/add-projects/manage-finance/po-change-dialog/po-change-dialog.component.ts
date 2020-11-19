import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-po-change-dialog',
  templateUrl: './po-change-dialog.component.html',
  styleUrls: ['./po-change-dialog.component.css']
})
export class PoChangeDialogComponent implements OnInit {

  POList:any=[];
  LineItems: any =[];
  selectedPo;
  constructor(
    private config: DynamicDialogConfig,
    private dynamicDialogRef: DynamicDialogRef,
    private common: CommonService,
    private constant : ConstantsService
  ) { }

  ngOnInit() {
    this.POList = this.config.data.POList;
    this.LineItems = this.config.data.LineItems;
  }


  saveDetails(){
    if(this.selectedPo){
      const Data ={
        selectedPO : this.selectedPo,
        LineItems : this.LineItems
      }
      this.dynamicDialogRef.close(Data);
    } else{
        this.common.showToastrMessage(this.constant.MessageType.warn,'Please select PO.',false);
    }
  }

  cancel(){
    this.dynamicDialogRef.close();
  }



}
