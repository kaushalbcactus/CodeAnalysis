import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { FDDataShareService } from './fdServices/fd-shareData.service';
@Injectable()
export class FDResolve implements Resolve<any> {

    constructor(private fdDataShareService: FDDataShareService) { }

    resolve(route: ActivatedRouteSnapshot) {
        let data = this.fdDataShareService.getRequiredData();
        return data;
    }
}