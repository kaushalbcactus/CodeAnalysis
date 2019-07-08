import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-table-attribute',
  templateUrl: './table-attribute.component.html',
  styleUrls: ['./table-attribute.component.css'],
})

export class TableAttributeComponent implements OnInit {

  @Input() rowItemData: string;
  constructor() { }

  ngOnInit() {
  }

  rowData: any = [];
  rowColums: any = [];
  ngOnChanges() {
    console.log('In TableAttributeComponent ', this.rowItemData);
    // For Dynamic Object
    // this.rowColums = Object.keys(this.rowItemData);
    // this.rowData = Object.values(this.rowItemData);
    this.rowData.push(this.rowItemData);
  }

}
