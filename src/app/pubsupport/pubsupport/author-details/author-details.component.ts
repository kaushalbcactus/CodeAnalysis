import { Component, OnInit, Input, ComponentFactoryResolver, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-author-details',
    templateUrl: './author-details.component.html',
    styleUrls: ['./author-details.component.css']
})
export class AuthorDetailsComponent implements OnInit, AfterViewChecked, OnDestroy {

    // @Input() events: any;
    authorsData: any = [];
    authorsFiles: any = [];
    selectedProj: any;
    constructor(
        private spOperationsService: SPOperationService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
        public common : CommonService,
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private cdRef: ChangeDetectorRef
    ) { }

    async ngOnInit() {
        if(this.config.data) {
            this.selectedProj = this.config.data.projectObj
            await this.openAuthorModal(this.selectedProj);
        }
    }

    ngOnDestroy() {
        // if (this.ref) {
        //     this.ref.close();
        //     this.authorsFiles = [];
        // }
    }

    ngAfterViewChecked()
    {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
        this.cdRef.detectChanges();
    }

    async openAuthorModal(data: any) {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.authors);
        obj.filter = obj.filter.replace('{{ProjectCode}}', data.ProjectCode);
        const authEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.Authors.name + '', obj);
        const authorsObj = [{
            url: authEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.Authors.name
        }];
        this.common.SetNewrelic('PubSupport', 'author-details', 'getAuthorByProjectCode');
        const res = await this.spOperationsService.executeBatch(authorsObj);
        this.authorsData = res[0].retItems;
        console.log('this.authorsData ', this.authorsData);
        this.onTabChange();
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    cancelFormSub() {
        this.authorsFiles = [];
    }

    async onTabChange() {
        this.authorsFiles = [];
        const fileEndPoint = this.selectedProj.ProjectFolder + '/Publication Support/Forms/';
        this.common.SetNewrelic('PubSupport', 'add-author', 'GetDocumnts');
        const authorFilesGet = await this.spOperationsService.readFiles(fileEndPoint);
        // tslint:disable-next-line:only-arrow-functions
        authorFilesGet.sort((a, b) => {
            a = new Date(a.TimeLastModified);
            b = new Date(b.TimeLastModified);
            return a < b ? -1 : a > b ? 1 : 0;
        });
        this.authorsFiles = authorFilesGet;
    }

}
