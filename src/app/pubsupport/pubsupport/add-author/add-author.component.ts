import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { MessageService, DialogService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-add-author',
    templateUrl: './add-author.component.html',
    styleUrls: ['./add-author.component.css']
})
export class AddAuthorComponent implements OnInit {

    @Input() formType: string;
    @Input() events: any;

    // tslint:disable-next-line: variable-name
    add_author_form: FormGroup;
    // tslint:disable-next-line: variable-name
    update_author_form: FormGroup;
    addAuthorModal: boolean;

    selectedRowItem: any;

    submitBtn: any = {
        isClicked: false
    };

    formSubmit: any = {
        isSubmit: false
    };

    constructor(
        private fb: FormBuilder,
        private spOperationsService: SpOperationsService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
        private messageService: MessageService,
        private router: Router,
        private dialogService: DialogService,
        private datePipe: DatePipe,
        private confirmationService: ConfirmationService,
    ) { }

    ngOnInit() {
        if (this.formType === 'addAuthor') {
            this.addAuthorFormField();
            this.addAuthorModal = true;
        } else if (this.formType === 'updateAuthor') {
            this.updateAuthorFormField();
        }
        this.selectedRowItem = this.events;
        console.log('this.selectedRowItem ', this.selectedRowItem);
    }

    addAuthorFormField() {
        this.add_author_form = this.fb.group({
            FirstName: ['', Validators.required],
            LastName: ['', Validators.required],
            Comments: ['', Validators.required],
            HighestDegree: ['', Validators.required],
            EmailAddress: ['', [Validators.required, Validators.email]],
            Address: ['', Validators.required],
            Affiliation: ['', Validators.required],
            Phone_x0020_No: ['', Validators.required],
            Fax: ['', Validators.required],
            AuthorType: ['', Validators.required],
        });
    }

    updateAuthorFormField() {
        this.update_author_form = this.fb.group({
            file: ['', Validators.required],
            existingAuthorList: ['', Validators.required]
        });
    }

    cancelFormSub(formtype: string) {
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        if (formtype === 'addAuthor') {
            this.addAuthorModal = false;
        }
    }

    get isValidAddAuthorForm() {
        return this.add_author_form.controls;
    }

    async onSubmit(type: string) {
        // stop here if form is invalid
        this.formSubmit.isSubmit = true;
        this.submitBtn.isClicked = true;
        if (this.add_author_form.invalid) {
            this.submitBtn.isClicked = false;
            return;
        }
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.add_author_form.value.Title = this.selectedRowItem.ProjectCode;
        this.add_author_form.value.__metadata = { type: this.constantService.listNames.addAuthor.type };
        const endpoint = this.pubsupportService.pubsupportComponent.addAuthor.addAuthorDetails;
        const data = [{
            data: this.add_author_form.value,
            url: endpoint,
            type: 'POST',
            listName: this.constantService.listNames.addAuthor.name
        }];
        this.submit(data, type);
    }

    async submit(dataEndpointArray, type: string) {
        const result = await this.spOperationsService.executeBatch(dataEndpointArray);
        let res: any = {};
        if (result.length) {
            res = result[0].retItems;
        }
        if (res.hasOwnProperty('hasError')) {
            this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error message', detail: res.message.value, life: 4000 });
        } else if (type === 'addAuthor') {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success message',
             detail: 'Author Created.', life: 4000 });
            this.addAuthorModal = false;
            this.add_author_form.reset();
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
            this.reload();
        }
    }

    reload() {
        setTimeout(() => {
            this.router.navigated = false;
            this.router.navigate([this.router.url]);
        }, 200);
    }

    // tslint:disable-next-line: use-life-cycle-interface
    ngOnDestroy() {
    }

}
