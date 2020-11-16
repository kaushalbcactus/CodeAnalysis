import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';

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
  ) { }

  ngOnInit() {
    this.POList = this.config.data.POList;
    this.LineItems = this.config.data.LineItems;
  }


  saveDetails(){
    const Data ={
      selectedPO : this.selectedPo,
      LineItems : this.LineItems
    }
    this.dynamicDialogRef.close(Data);
  }

  cancel(){
    this.dynamicDialogRef.close();
  }



}
