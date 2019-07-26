import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { PubsuportConstantsService } from '../../Services/pubsuport-constants.service';
import { DynamicDialogRef, MessageService, DynamicDialogConfig } from 'primeng/api';
// import { Journal } from "./journal-interface";

@Component({
    selector: 'app-create-journal',
    templateUrl: './create-journal.component.html',
    styleUrls: ['./create-journal.component.css']
})
export class CreateJournalComponent implements OnInit {

    createJournal_form: FormGroup;
    journalListArray: any = [];

    submitBtn: any = {
        isClicked: false
    };

    formSubmit: any = {
        isSubmit: false
    }

    constructor(
        private fb: FormBuilder,
        public ref: DynamicDialogRef,
        public psConstantService: PubsuportConstantsService,
        private spOperationsService: SpOperationsService,
        private spServices: SharepointoperationService,
        private constantService: ConstantsService,
        private messageService: MessageService,
        public config: DynamicDialogConfig,

    ) { }

    async ngOnInit() {
        this.createJournalFormField();
        this.journalListArray = this.config.data;
        if (!this.journalListArray.length) {
            await this.getJournalList();
        }
    }

    // Create Journal Form Field 
    createJournalFormField() {
        this.createJournal_form = this.fb.group({
            JournalName: ['', Validators.required],
            ExpectedReviewPeriod: ['', Validators.required],
            ImpactFactor: ['', Validators.required],
            RejectionRate: ['', Validators.required],
            Comments: ['', Validators.required],
            JournalEditorInfo: ['', Validators.required],
        })
    }


    async getJournalList() {
        this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = false;
        let data = [{
            url: this.spOperationsService.getReadURL(this.constantService.listNames.Journal.name, this.psConstantService.pubsupportComponent.journal),
            type: 'GET',
            listName: this.constantService.listNames.Journal.name
        }];

        const result = await this.spOperationsService.executeBatch(data);
        const res = result[0].retItems;
        if (res.hasError) {
            this.messageService.add({ key: 'myKey1', severity: 'error', summary: 'Error', detail: res.message.value, life: 4000 });
        } else {
            this.journalListArray = res;
            console.log('journalListArray ', this.journalListArray);
        }
        this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = true;
    }

    onKey(val: string) {
        this.uniqueJName = this.uniqueJName ? this.uniqueJName = false : false;
    }

    uniqueJName: boolean = false;
    checkUniqueName() {
        let found = this.journalListArray.find(item => {
            if (item.JournalName.toLowerCase().replace(/\s/g, '') === this.createJournal_form.value.JournalName.toLowerCase().replace(/\s/g, '')) {
                this.uniqueJName = true;
                return item;
            }
        })
        return found ? found : '';
    }

    get isValidCreateJournalForm() {
        return this.createJournal_form.controls;
    }

    cancelFormSub() {
        this.createJournal_form.reset();
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        this.ref.close();
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        this.submitBtn.isClicked = true;
        if (type === 'createJournal') {
            if (this.createJournal_form.invalid || this.uniqueJName) {
                this.submitBtn.isClicked = false;
                return;
            }
            this.submitBtn.isClicked = true;
            this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = false;
            let obj = this.createJournal_form.value;
            obj['__metadata'] = { type: this.constantService.listNames.Journal.type }
            const endpoint = this.psConstantService.pubsupportComponent.addUpdateJournal.add;
            let data = [{
                data: obj,
                url: endpoint,
                type: 'POST',
                listName: this.constantService.listNames.Journal.name
            }];
            this.submitForm(data);
        }
    }

    batchContents: any = [];
    async submitForm(data) {
        const res = await this.spOperationsService.executeBatch(data);
        if (res) {
            this.psConstantService.pubsupportComponent.isPSInnerLoaderHidden = true;
            this.ref.close(res);
        }
    }

}
