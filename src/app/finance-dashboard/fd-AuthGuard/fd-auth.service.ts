import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from '../..//Services/spoperation.service';

import { FdConstantsService } from '../fdServices/fd-constants.service';
import { Router } from '@angular/router';
import { PubsuportConstantsService } from 'src/app/pubsupport/Services/pubsuport-constants.service';
import { ConstantsService } from 'src/app/Services/constants.service';

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

    ) {

    }

    async getUserInfo() {
        this.isUserManager = false;
        this.isUserExpenseApprovers = false;
        this.constantService.userPermission.isFDUserAdmin = true;
        // this.constantsService.loader.isPSInnerLoaderHidden = false;
        this.fdConstantsService.fdComponent.tabs.topMenu = [
            { label: 'Expenditure', routerLink: ['expenditure'] },
            { label: 'Scheduled', routerLink: ['scheduled'] }
        ];
        this.fdConstantsService.fdComponent.tabs.expenditureMenu = [
            { label: 'Pending Expense', routerLink: ['pending'] },
            { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'] },
            { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'] },
            { label: 'Approved(Billable)', routerLink: ['approvedBillable'] }
        ];
        // Scheduled Tabs
        this.fdConstantsService.fdComponent.tabs.scheduleMenu = [
            { label: 'Deliverable Based / FTE', routerLink: ['deliverablebased-fte'] },
            { label: 'OOP', routerLink: ['oop'] },
        ];

        this.globalObject.userInfo = await this.spOperationsServices.getUserInfo(this.globalObject.currentUser.userId);
        console.log('this.globalObject.userInfo ', this.globalObject.userInfo);
        // this.constantsService.loader.isPSInnerLoaderHidden = true;
        if (this.globalObject.userInfo.Groups.results.length) {
            const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
            console.log('groups ', groups);
            if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1) {
                // All 
                this.fdConstantsService.fdComponent.tabs.topMenu.push(
                    { label: 'Confirmed', routerLink: ['confirmed'] },
                    { label: 'Proforma', routerLink: ['proforma'] },
                    { label: 'Outstanding Invoices', routerLink: ['outstanding-invoices'] },
                    { label: 'Paid Invoices', routerLink: ['paid-invoices'] },
                );
                // All Expenditure Menus
                // this.fdConstantsService.fdComponent.tabs.expenditureMenu.push(
                //     { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'] },
                //     { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'] },
                //     { label: 'Approved(Billable)', routerLink: ['approvedBillable'] }
                // );

                // All Scheduled Tabs
                this.fdConstantsService.fdComponent.tabs.scheduleMenu.push(
                    { label: 'Hourly Based', routerLink: ['hourly-based'] },
                )
                this.isUserManager = true;
                this.isUserExpenseApprovers = true;
            } else if (groups.indexOf('ExpenseApprovers') > -1) {
                // All Expenditure Menus
                // this.fdConstantsService.fdComponent.tabs.expenditureMenu.push(
                //     { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'] },
                //     { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'] },
                //     { label: 'Approved(Billable)', routerLink: ['approvedBillable'] }
                // );
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
