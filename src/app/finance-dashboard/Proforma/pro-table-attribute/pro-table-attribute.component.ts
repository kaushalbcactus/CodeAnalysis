import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-pro-table-attribute',
    templateUrl: './pro-table-attribute.component.html',
    styleUrls: ['./pro-table-attribute.component.css']
})
export class ProTableAttributeComponent implements OnInit {

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
