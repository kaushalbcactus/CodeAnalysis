import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-inv-table-attribute',
  templateUrl: './inv-table-attribute.component.html',
  styleUrls: ['./inv-table-attribute.component.css']
})
export class InvTableAttributeComponent implements OnInit {

  @Input() rowItemData: string;

  constructor() { }

  ngOnInit() {
  }
  rowData: any = [];
  rowColums: any = [];
  ngOnChanges() {
    console.log('In ILITableAttributeComponent ', this.rowItemData);
    this.rowData.push(this.rowItemData);
  }

}
