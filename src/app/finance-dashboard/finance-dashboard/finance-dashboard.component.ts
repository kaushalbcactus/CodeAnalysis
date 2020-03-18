import { Component, OnInit, ViewEncapsulation, ElementRef, OnDestroy } from '@angular/core';
import { FdConstantsService } from '../fdServices/fd-constants.service';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
    selector: 'app-finance-dashboard',
    templateUrl: './finance-dashboard.component.html',
    styleUrls: ['./finance-dashboard.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {

    // Loadder
    isPSInnerLoaderHidden: boolean;

    tabMenuList: any = [];
    constructor(
        public fdConstantsService: FdConstantsService,
        public globalObject: GlobalService
    ) {
    }

    ngOnInit() {
        this.isPSInnerLoaderHidden = false;
        this.globalObject.currentTitle = 'Finance Dashboard';
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    ngOnDestroy() {
        console.log('in on destroy');
    }
}
