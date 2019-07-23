import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, MessageService } from 'primeng/api';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { SpOperationsService } from '../../../Services/sp-operations.service';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';

@Component({
    selector: 'app-create-conference',
    templateUrl: './create-conference.component.html',
    styleUrls: ['./create-conference.component.css'],
    encapsulation: ViewEncapsulation.Emulated
})
export class CreateConferenceComponent implements OnInit {

    createConference_form: FormGroup;

    submitBtn: any = {
        isClicked: false
    };

    formSubmit: any = {
        isSubmit: false
    }

    yearsRange = new Date().getFullYear() + ':' + (new Date().getFullYear() + 10);

    constructor(
        private fb: FormBuilder,
        public ref: DynamicDialogRef,
        public psConstantService: PubsuportConstantsService,
        private spOperationsService: SpOperationsService,
        private constantService: ConstantsService,
        private GlobalService: GlobalService,
        private messageService: MessageService,
    ) { }

    ngOnInit() {
        this.createConferenceFormField();
    }

    // Create Conference Form Field 
    createConferenceFormField() {
        this.createConference_form = this.fb.group({
            ConferenceDate: ['', Validators.required],
            submissionDeadline: ['', Validators.required],
            ConferenceName: ['', Validators.required],
            Comments: ['', Validators.required],
        })
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
            console.log('createConference_form ', this.createConference_form.value);
            let obj = this.createConference_form.value;
            obj['__metadata'] = { type: this.constantService.listNames.Conference.type }
            const endpoint = this.constantService.listNames.Conference.name
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: true
                }
            ];
            this.submitForm();
        }
    }

    async submitForm() {
        this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = false;
        let obj = [{
            url: this.spOperationsService.getReadURL(this.constantService.listNames.Conference.name, this.createConference_form.value),
            type: 'POST',
            listName: this.constantService.listNames.ProjectFinances
        }]
        const res = await this.spOperationsService.executeBatch(obj);
        if (res) {
            this.messageService.add({ key: 'myKey1', severity: 'info', summary: 'Success.', detail: '', life: 4000 });
        }
        this.ref.close();
    }

}
