import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pf-table-attribute',
  templateUrl: './pf-table-attribute.component.html',
  styleUrls: ['./pf-table-attribute.component.css']
})
export class PfTableAttributeComponent implements OnInit {

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
