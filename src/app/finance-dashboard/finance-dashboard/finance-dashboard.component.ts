import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FdConstantsService } from '../fdServices/fd-constants.service';

@Component({
    selector: 'app-finance-dashboard',
    templateUrl: './finance-dashboard.component.html',
    styleUrls: ['./finance-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class FinanceDashboardComponent implements OnInit {

    // Loadder
    isPSInnerLoaderHidden: boolean = false;

    tabMenuList: any = [];
    constructor(
        public fdConstantsService: FdConstantsService) {
    }

    ngOnInit() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // Tabs list
        
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        console.log("destroy");
    }
}
