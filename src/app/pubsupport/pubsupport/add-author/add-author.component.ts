import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
    selector: 'app-add-author',
    templateUrl: './add-author.component.html',
    styleUrls: ['./add-author.component.css']
})
export class AddAuthorComponent implements OnInit {

    @Input() formType: string;
    @Input() events: any;
    @Output() messageEvent: EventEmitter<any> = new EventEmitter();

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
        private spOperationsService: SPOperationService,
        public constantService: ConstantsService,
        public globalObject: GlobalService,
        public pubsupportService: PubsuportConstantsService,
        private router: Router,
        private common: CommonService
    ) { }

    ngOnInit() {
        if (this.formType === 'addAuthor') {
            this.addAuthorFormField();
            this.addAuthorModal = true;
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

    keyPress(event: any) {
        const pattern = /[0-9\+\-()+\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode !== 8 && !pattern.test(inputChar)) {
            event.preventDefault();
        }
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
        // const endpoint = this.pubsupportService.pubsupportComponent.addAuthor.addAuthorDetails;
        const endpoint = this.spOperationsService.getReadURL(this.constantService.listNames.addAuthor.name);
        const data = [{
            data: this.add_author_form.value,
            url: endpoint,
            type: 'POST',
            listName: this.constantService.listNames.addAuthor.name
        }];
        this.submit(data, type);
    }

    async submit(dataEndpointArray, type: string) {

        this.common.SetNewrelic('PubSupport', 'add-author', 'AddAuthor');
        const result = await this.spOperationsService.executeBatch(dataEndpointArray);
        let res: any = {};
        if (result.length) {
            res = result[0].retItems;
        }
        if (res.hasOwnProperty('hasError')) {
            this.common.showToastrMessage(this.constantService.MessageType.error,res.message.value,false);
        } else if (type === 'addAuthor') {
            this.common.showToastrMessage(this.constantService.MessageType.success,'Author Created.',false);
            this.addAuthorModal = false;
            this.add_author_form.reset();
            this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
        }
    }

    // tslint:disable-next-line: use-life-cycle-interface
    ngOnDestroy() {
    }

}
