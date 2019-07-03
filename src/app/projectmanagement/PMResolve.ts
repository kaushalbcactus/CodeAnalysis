import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { PMCommonService } from './services/pmcommon.service';

@Injectable()
export class PMResolve implements Resolve<any> {
    constructor(
        private pmService: PMCommonService
    ) { }
    resolve(route: ActivatedRouteSnapshot) {
        const data = this.pmService.getUserProperties();
        return data;
    }
}
