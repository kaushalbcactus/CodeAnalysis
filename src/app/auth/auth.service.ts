import { Injectable } from '@angular/core';
import { GlobalService } from '../Services/global.service';
import { SPOperationService } from '../Services/spoperation.service';
import { FdConstantsService } from '../finance-dashboard/fdServices/fd-constants.service';
import { Router } from '@angular/router';
import { PubsuportConstantsService } from '../pubsupport/Services/pubsuport-constants.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    public isUserManager: boolean;
    public isUserExpenseApprovers: boolean;

    constructor(
        private globalObject: GlobalService,
        private spOperationsServices: SPOperationService,
        private fdConstantsService: FdConstantsService,
        private router: Router,
        public pubsupportService: PubsuportConstantsService,
    ) { }
}
