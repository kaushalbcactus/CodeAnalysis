import { Component, OnInit, Input, ComponentFactoryResolver } from '@angular/core';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';

@Component({
    selector: 'app-author-details',
    templateUrl: './author-details.component.html',
    styleUrls: ['./author-details.component.css']
})
export class AuthorDetailsComponent implements OnInit {

    @Input() events: any;
    authorsData: any = [];
    authorsFiles: any = [];
    authorDetailModal: boolean;
    constructor(
        private spOperationsService: SPOperationService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
    ) { }

    async ngOnInit() {
        this.authorDetailModal = true;
        await this.openAuthorModal(this.events);
    }

    async openAuthorModal(data: any) {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.authors);
        obj.filter = obj.filter.replace('{{ProjectCode}}', data.ProjectCode);
        const authEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.addAuthor.name + '', obj);
        const authorsObj = [{
            url: authEndpoint,
            type: 'GET',
            listName: this.constantService.listNames.addAuthor.name
        }];
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
        const fileEndPoint = this.events.ProjectFolder + '/Publication Support/Forms/';
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
