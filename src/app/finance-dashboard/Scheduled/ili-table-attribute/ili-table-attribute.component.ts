import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ili-table-attribute',
  templateUrl: './ili-table-attribute.component.html',
  styleUrls: ['./ili-table-attribute.component.css']
})
export class IliTableAttributeComponent implements OnInit {

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
