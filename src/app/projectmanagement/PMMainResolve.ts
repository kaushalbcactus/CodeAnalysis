import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { PMCommonService } from './services/pmcommon.service';

@Injectable()
export class PMMainResolve implements Resolve<any> {
    constructor(
        private pmService: PMCommonService
    ) { }
    resolve(route: ActivatedRouteSnapshot) {
        const data = this.pmService.resolveMain();
        return data;
    }
}
