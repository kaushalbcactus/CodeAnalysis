import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from '../..//Services/spoperation.service';

import { FdConstantsService } from '../fdServices/fd-constants.service';
import { Router } from '@angular/router';
import { PubsuportConstantsService } from 'src/app/pubsupport/Services/pubsuport-constants.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';

@Injectable({
    providedIn: 'root'
})
export class FdAuthService {

    public isUserManager: boolean;
    public isUserExpenseApprovers: boolean;

    constructor(
        private globalObject: GlobalService,
        private spOperationsServices: SPOperationService,
        private fdConstantsService: FdConstantsService,
        private router: Router,
        public pubsupportService: PubsuportConstantsService,
        public constantService: ConstantsService,
        public common: CommonService

    ) {

    }

    async getUserInfo() {
        this.isUserManager = false;
        this.isUserExpenseApprovers = false;
        this.constantService.userPermission.isFDUserAdmin = true;
        // this.constantsService.loader.isPSInnerLoaderHidden = false;
        this.fdConstantsService.fdComponent.tabs.topMenu = [
            { label: 'Expenditure', routerLink: ['expenditure'], command: (event) => {this.fdConstantsService.mainRouter = event.item}  },
            { label: 'Scheduled', routerLink: ['scheduled'], command: (event) => {this.fdConstantsService.mainRouter = event.item} }
        ];
        this.fdConstantsService.fdComponent.tabs.expenditureMenu = [
            { label: 'Pending Expense', routerLink: ['pending'], command: (event) => {this.fdConstantsService.internalRouter = event.item} },
            { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'], command: (event) => {this.fdConstantsService.internalRouter = event.item} },
            { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'], command: (event) => {this.fdConstantsService.internalRouter = event.item} },
            { label: 'Approved(Billable)', routerLink: ['approvedBillable'], command: (event) => {this.fdConstantsService.internalRouter = event.item}}
        ];
        // Scheduled Tabs
        this.fdConstantsService.fdComponent.tabs.scheduleMenu = [
            { label: 'Deliverable Based / FTE', routerLink: ['deliverablebased-fte'], command: (event) => {this.fdConstantsService.internalRouter = event.item} },
            { label: 'OOP', routerLink: ['oop'], command: (event) => {this.fdConstantsService.internalRouter = event.item} },
        ];
        this.common.SetNewrelic('Finance-Dashboard', 'fd-auth', 'getUserInfo');
        this.globalObject.userInfo = await this.spOperationsServices.getUserInfo(this.globalObject.currentUser.userId);
        console.log('this.globalObject.userInfo ', this.globalObject.userInfo);
        // this.constantsService.loader.isPSInnerLoaderHidden = true;
        if (this.globalObject.userInfo.Groups.results.length) {
            const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
            console.log('groups ', groups);
            if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1) {
                // All 
                this.fdConstantsService.fdComponent.tabs.topMenu.push(
                    { label: 'Confirmed', routerLink: ['confirmed'], command: (event) => {this.fdConstantsService.mainRouter = event.item} },
                    { label: 'Proforma', routerLink: ['proforma'], command: (event) => {this.fdConstantsService.mainRouter = event.item} },
                    { label: 'Outstanding Invoices', routerLink: ['outstanding-invoices'], command: (event) => {this.fdConstantsService.mainRouter = event.item} },
                    { label: 'Paid Invoices', routerLink: ['paid-invoices'], command: (event) => {this.fdConstantsService.mainRouter = event.item} },
                );

                // All Scheduled Tabs
                this.fdConstantsService.fdComponent.tabs.scheduleMenu.push(
                    { label: 'Hourly Based', routerLink: ['hourly-based'], command: (event) => {this.fdConstantsService.internalRouter = event.item} },
                )
                this.isUserManager = true;
                this.isUserExpenseApprovers = true;
            } else if (groups.indexOf('ExpenseApprovers') > -1) {
                this.isUserExpenseApprovers = true;
                this.isUserManager = false;
            } else if (groups.indexOf('ExpenseApprovers') == -1 && groups.indexOf('Invoice_Team') == -1 && groups.indexOf('Managers') == -1) {
                this.constantService.userPermission.isFDUserAdmin = false;
            }
            return groups;
        } else {
            this.isUserManager = false;
            this.isUserExpenseApprovers = false;
        }
    }

    async isUserAuthenticated() {
        const flag = await this.getUserInfo();
        console.log('flag');
    }

    async preloadUserAuthenticated() {
        const flag = await this.getUserInfo();
        console.log('flag');
    }
}
