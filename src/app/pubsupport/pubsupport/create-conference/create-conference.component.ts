import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { SPOperationService } from '../../../Services/spoperation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
    selector: 'app-create-conference',
    templateUrl: './create-conference.component.html',
    styleUrls: ['./create-conference.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class CreateConferenceComponent implements OnInit {

    createConference_form: FormGroup;
    conferenceListArray: any = [];
    batchContents: any = [];
    uniqueJName: boolean;
    submitBtn: any = {
        isClicked: false
    };

    formSubmit: any = {
        isSubmit: false
    }

    yearsRange = new Date().getFullYear() - 1 + ':' + (new Date().getFullYear() + 10);

    constructor(
        private fb: FormBuilder,
        public ref: DynamicDialogRef,
        public psConstantService: PubsuportConstantsService,
        private spOperationsService: SPOperationService,
        private constantService: ConstantsService,
        public config: DynamicDialogConfig,
        private common: CommonService

    ) { }

    async ngOnInit() {
        this.createConferenceFormField();
        this.conferenceListArray = this.config.data;
        if (!this.conferenceListArray.length) {
            await this.getConferenceList();
        }
    }

    // Create Conference Form Field 
    createConferenceFormField() {
        this.createConference_form = this.fb.group({
            ConferenceDate: ['', Validators.required],
            SubmissionDeadline: ['', Validators.required],
            ConferenceName: ['', Validators.required],
            Comments: [''],
            IsActive: ['Yes']
        })
    }

    async getConferenceList() {
        this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = false;
        const data = [{
            // tslint:disable-next-line: max-line-length
            url: this.spOperationsService.getReadURL(this.constantService.listNames.Journal.name, this.psConstantService.pubsupportComponent.journal),
            type: 'GET',
            listName: this.constantService.listNames.Journal.name
        }];
        this.common.SetNewrelic('PubSupport', 'create-conference', 'getConferenceList');
        const result = await this.spOperationsService.executeBatch(data);
        const res = result[0].retItems;
        if (res.hasError) {
            this.common.showToastrMessage(this.constantService.MessageType.error,res.message.value,false);
        } else {
            this.conferenceListArray = res;
            console.log('conferenceListArray ', this.conferenceListArray);
        }
        this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    onKey(val: string) {
        this.uniqueJName = this.uniqueJName ? this.uniqueJName = false : false;
    }

    checkUniqueName() {
        const found = this.conferenceListArray.find(item => {
            if (item.ConferenceName.toLowerCase().replace(/\s/g, '') === this.createConference_form.value.ConferenceName.toLowerCase().replace(/\s/g, '')) {
                this.uniqueJName = true;
                return item;
            }
        })
        return found ? found : '';
    }

    get isValidAddConferenceDetailsForm() {
        return this.createConference_form.controls;
    }

    cancelFormSub() {
        this.createConference_form.reset();
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        this.ref.close();
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        this.submitBtn.isClicked = true;
        if (type === 'createConference') {
            if (this.createConference_form.invalid) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = false;
            console.log('createConference_form ', this.createConference_form.value);
            let obj = this.createConference_form.value;
            obj['__metadata'] = { type: this.constantService.listNames.Conference.type };
            // Added code by Arvind.
            obj['CommentsMT'] = obj['Comments'];
            delete obj['Comments'];
            obj['IsActiveCH'] = obj['IsActive'];
            delete obj['IsActive'];
            
            const endpoint = this.spOperationsService.getReadURL(this.constantService.listNames.Conference.name);
            const data = [{
                data: obj,
                url: endpoint,
                type: 'POST',
                listName: this.constantService.listNames.Conference.name
            }];
            this.submitForm(data);
        }
    }

    async submitForm(data) {

        this.common.SetNewrelic('PubSupport', 'create-conference', 'CreateConference');
        const res = await this.spOperationsService.executeBatch(data);
        if (res) {
            this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = true;
            this.ref.close(res);
        }
    }

    

}
