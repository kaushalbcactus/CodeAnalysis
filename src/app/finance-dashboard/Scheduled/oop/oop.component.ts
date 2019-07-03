import { Component, OnInit, ViewChild } from '@angular/core';
import { Message, ConfirmationService, SelectItem, MessageService } from 'primeng/api';
import { Calendar } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { formatDate, DatePipe } from '@angular/common';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-oop',
    templateUrl: './oop.component.html',
    styleUrls: ['./oop.component.css']
})
export class OopComponent implements OnInit {

    oopBasedRes: any = [];
    oopBasedCols: any[];
    msgs: Message[] = [];

    // Edit Deliverable Form
    editOop_form: FormGroup;

    // Address Type
    addressTypes: any = [];

    // Loadder
    isPSInnerLoaderHidden: boolean = false;

    // Right side bar
    rightSideBar: boolean = false;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;
    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    };
    minScheduleDate: Date = new Date();

    // Date Range
    rangeDates: Date[];

    subscription: Subscription;
    DateRange: any = {
        startDate: '',
        endDate: '',
    };

    @ViewChild('timelineRef', {static:true}) timeline: TimelineHistoryComponent;
    constructor(
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SharepointoperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private messageService: MessageService,
        private commonService: CommonService,
    ) {
        this.subscription = this.fdDataShareServie.getDateRange().subscribe(date => {
            this.DateRange = date;
            console.log('this.DateRange ', this.DateRange);
            this.getRequiredData();
        });
    }

    ngOnInit() {
        // SetDefault Values
        if (this.fdDataShareServie.DateRange.startDate) {
            this.DateRange = this.fdDataShareServie.DateRange;
        } else {
            const next3Months = this.commonService.getNextWorkingDay(65, new Date());
            const last1Year = this.commonService.getLastWorkingDay(260, new Date());
            this.rangeDates = [last1Year, next3Months];
            this.DateRange.startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
            this.DateRange.endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
            this.fdDataShareServie.DateRange = this.DateRange;
        }

        // Get Projects
        this.projectInfo();
        this.poInfo();
        this.projectContacts();
        // GEt Client Legal Entity
        // this.cleInfo();

        this.createANBCols();
        // this.getApprovedNonBillable();
        this.createEditDeliverableFormField();

        // get OOP Invocies
        this.getRequiredData();

        // Load address type
        this.getAddressType();
    }
    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }

    // Project Info 
    projectInfoData: any = [];
    projectInfo() {
        this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('this.projectInfoData ', this.projectInfoData);
            }
        })
    }

    // Purchase Order Number
    purchaseOrdersList: any = [];
    poInfo() {
        this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
            }
        })
    }

    // Project COntacts
    projectContactsData: any = [];
    projectContacts() {
        this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
            }
        })
    }



    getAddressType() {
        this.addressTypes = [
            { label: 'Client', value: 'Client' },
            { label: 'POC', value: 'POC' },
        ]
    }

    createEditDeliverableFormField() {
        this.editOop_form = this.fb.group({
            ProjectCode: [{ value: '', disabled: true }, Validators.required],
            PONumber: [{ value: '', disabled: true }, Validators.required],
            ScheduledType: [{ value: '', disabled: true }, Validators.required],
            Amount: [{ value: '', disabled: true }, Validators.required],
            Currency: [{ value: '', disabled: true }, Validators.required],
            ScheduledDate: ['', Validators.required],
            POCName: ['', Validators.required],
            AddressType: ['', Validators.required],
        })
    }

    createANBCols() {
        this.oopBasedCols = [
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'SOWCode', header: 'SOW Code/ Name', visibility: true },
            { field: 'ProjectMileStone', header: 'Project Milestone', visibility: true },
            { field: 'PONumber', header: 'PO Number/ Name', visibility: true },
            { field: 'ClientName', header: 'Client LE', visibility: true },
            { field: 'ScheduledDate', header: 'Scheduled Date', visibility: true },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POCName', header: 'POC Name', visibility: true },

            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'POName', header: 'PO Name', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'AddressType', header: 'Address Type', visibility: false },
            { field: 'Status', header: 'Status', visibility: false },
            // { field: 'TaggedDate', header: 'Tagged Date', visibility: false },
            // { field: 'ProformaLookup', header: 'Proforma Lookup', visibility: false },
            { field: 'ScheduleType', header: 'Schedule Type', visibility: false },
            { field: 'InvoiceLookup', header: 'Invoice Lookup', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'Modified', header: 'Modified Date', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },
            { field: 'PracticeArea', header: 'Practice Area', visibility: false },
            { field: 'CS', header: 'CS', visibility: false },

            { field: '', header: '', visibility: true }
        ];
    }

    async getRequiredData() {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let obj = Object.assign({}, this.fdConstantsService.fdComponent.invoicesOOP);
        obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        const invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.InvoiceLineItems.name + '', obj);
        // this.spServices.getBatchBodyGet(batchContents, batchGuid, invoicesQuery);

        let endPoints = [invoicesQuery];
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            arrResults = res;
            if (arrResults.length) {
                for (let j = 0; j < arrResults.length; j++) {
                    const element = arrResults[j];
                    this.isPSInnerLoaderHidden = true;
                    this.formatData(element);
                }
            }
        });

    }
    showMenu(element) {
        const project = this.projectInfoData.find((x) => {
            if (x.ProjectCode == element.Title) {
                return x;
            }
        })

        if (project) {
            return true;
        } else {
            return false;
        }
    }
    async formatData(data: any[]) {
        this.oopBasedRes = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(element.SOWCode);
            this.oopBasedRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: element.SOWCode,
                SOWName: sowItem.Title,
                ProjectMileStone: this.getMilestones(element).Milestone,
                PONumber: this.getPONumber(element).Number,
                PO: element.PO,
                POCId: element.MainPOC,
                ClientName: this.getCLE(element),
                ScheduledDate: this.datePipe.transform(element.ScheduledDate, 'MMM d, y'),
                Amount: element.Amount,
                Currency: element.Currency,
                POCName: this.getPOCName(element),
                AddressType: element.AddressType,
                showMenu: this.showMenu(element),

                CS: this.getCSDetails(element.CS.results),
                PracticeArea: element.PracticeArea,
                POName: this.getPONumber(element).Name,
                TaggedDate: element.TaggedDate,
                Status: element.Status,
                ProformaLookup: element.ProformaLookup,
                ScheduleType: element.ScheduleType,
                InvoiceLookup: element.InvoiceLookup,
                Template: element.Template,
                Modified: this.datePipe.transform(element.Modified, 'MMM d, y'),
            })
        }
        this.createColFieldValues();
    }

    // Project Current Milestones
    getMilestones(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x;
            }
        })
        return found ? found : '';
    }

    // Project PO
    getPONumber(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        })
        return found ? found : '';
    }

    getPOCName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        // return found ? found.FName + ' ' + found.LName : ''
        return found ? found.FullName : ''
    }

    // Project Client
    getCLE(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x.ClientLegalEntity;
            }
        });
        return found ? found.ClientLegalEntity : '';
    }

    getCSDetails(res) {
        let title = [];
        for (let i = 0; i < res.length; i++) {
            const element = res[i];
            title.push(element.Title);
        }
        return title.toString();
    }


    oopColArray = {
        ProjectCode: [],
        SOWCode: [],
        ProjectMileStone: [],
        PONumber: [],
        ClientName: [],
        ScheduledDate: [],
        Amount: [],
        Currency: [],
        POC: [],
    }

    createColFieldValues() {
        this.oopColArray.ProjectCode = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }));
        this.oopColArray.SOWCode = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }));
        this.oopColArray.ProjectMileStone = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }));
        this.oopColArray.PONumber = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }));
        this.oopColArray.ClientName = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.ClientName, value: a.ClientName }; return b; }));
        this.oopColArray.ScheduledDate = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.ScheduledDate, value: a.ScheduledDate }; return b; }));
        this.oopColArray.Amount = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }));
        this.oopColArray.Currency = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }));
        this.oopColArray.POC = this.uniqueArrayObj(this.oopBasedRes.map(a => { let b = { label: a.POCName, value: a.POCName }; return b; }));
    }

    uniqueArrayObj(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
            return {
                label: label1,
                value: array.find(s => s.label === label1).value
            }
        })
    }

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    selectedRowItemData: any = [];
    selectedRowItemPC: any;
    onRowSelect(event) {
        console.log(event);
        this.selectedRowItemData.push(event.data);
        this.selectedRowItemPC = event.data.ProjectCode;
        console.log(this.selectedRowItemData);
    }

    onRowUnselect(event) {
        let rowUnselectIndex = this.selectedRowItemData.indexOf(event.data);
        this.selectedRowItemData.splice(rowUnselectIndex, 1);
        console.log(this.selectedRowItemData);
    }

    selectAllRows() {
        this.selectedAllRowsItem.length === 0 ? this.selectedRowItemData = [] : this.selectedRowItemData;
        if (this.selectedAllRowsItem.length === this.oopBasedRes.length) {
            this.selectedRowItemData = this.selectedAllRowsItem;
        }
        console.log('in selectAllRows ', this.selectedAllRowsItem);
        console.log('selectedRowItemData ', this.selectedRowItemData);

    }

    confirm1() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to confirm the invoice scheduled for the project?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            key: 'oopConfirm',
            accept: () => {
                // this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'You have Confirmed' }];
                // Call server service here
                this.onSubmit('confirmInvoice');
            },
            reject: () => {
                this.msgs = [{ severity: 'info', summary: 'Cancel', detail: 'You have canceled' }];
            }
        });
    }

    items: any[];
    deliverableDialog: any = {
        title: '',
        text: ''
    }

    getPO(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId) {
                return x;
            }
        })
        return found ? found : ''
    }
    // Open popups
    openPopup(data, popUpData) {
        this.items = [];
        console.log('Row data  ', data);
        const retPO = this.getPO(data.PO);
        const date = new Date(data.ScheduledDate);
        const currentDate = new Date();
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        if (date >= last3Days && date < lastDay && retPO && new Date(retPO.POExpiryDate) >= new Date()) {
            // if (date > last3Days && retPO && new Date(retPO.POExpiryDate) >= new Date()) {
            this.items.push({ label: 'Confirm Invoice', command: (e) => this.openMenuContent(e, data) });
        } else {
            if (!(date >= last3Days && date <= lastDay)) {
                this.messageService.add({ key: 'bottomCenter', severity: 'success', summary: 'To confirm the line item, scheduled Date should be between last 3 working days & last date of the current month.', detail: '', life: 4000 })
            } else if (!retPO) {
                this.messageService.add({ key: 'bottomCenter', severity: 'success', summary: 'PO not available for the selected line item.', detail: '', life: 4000 })
            } else if (!(new Date(retPO.POExpiryDate) >= new Date())) {
                this.messageService.add({ key: 'bottomCenter', severity: 'success', summary: 'PO expired on ' + this.datePipe.transform(retPO.POExpiryDate, 'MMM d, y'), detail: '', life: 4000 })
            }
        }
        this.items.push({ label: 'Edit Invoice', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'View Project Details', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'Show Timeline', command: (e) => this.openMenuContent(e, data) }); // Added by kaushal on 10.6.19
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });

    }

    deliverableModal: boolean = false;
    selectedRowItem: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.deliverableDialog.title = event.item.label;
        if (this.deliverableDialog.title.toLowerCase() === 'confirm invoice') {
            this.confirm1()
        } else if (this.deliverableDialog.title.toLowerCase() === 'edit invoice') {
            // this.deliverableDialog.text = event.item.label.replace('Expense', '');
            this.deliverableModal = true;
            this.updateInvoice();
            this.getPOCNamesForEditInv(data);
        } else if (this.deliverableDialog.title.toLowerCase() === 'view project details') {
            this.goToProjectDetails(this.selectedRowItem)
        } else if (this.deliverableDialog.title.toLowerCase() === 'show timeline') {
            // Added by kaushal on 10.6.19
            this.timeline.showTimeline(data.Id, 'FD', 'InvoiceLineItems');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    // Go to Project Details Page
    goToProjectDetails(data: any) {
        console.log(data);
        window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/project-mgmt?ProjectCode=' + data.ProjectCode);
        // this.router.navigate([this.globalObject.sharePointPageObject.webAbsoluteUrl + '//project-mgmt?ProjectCode=' + data.ProjectCode]);
    }

    // Update Form
    updateInvoice() {
        const format = 'dd MMM , yyyy';
        const myDate = new Date(this.selectedRowItem.ScheduledDate);
        const locale = 'en-IN';
        const formattedDate = formatDate(myDate, format, locale);
        console.log('formatted Date ', formattedDate);
        this.editOop_form.patchValue({
            ProjectCode: this.selectedRowItem.ProjectCode,
            PONumber: this.selectedRowItem.PONumber,
            ScheduledType: 'oop',
            Amount: this.selectedRowItem.Amount,
            Currency: this.selectedRowItem.Currency,
            ScheduledDate: formattedDate,
            AddressType: { label: this.selectedRowItem.AddressType, value: this.selectedRowItem.AddressType }
        });
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        this.minScheduleDate = last3Days;
    }

    listOfPOCNames: SelectItem[];
    getPOCNamesForEditInv(rowItem: any) {
        this.listOfPOCNames = [];
        var rowVal: any = {}
        this.projectContactsData.filter((item) => {
            if (item.ClientLegalEntity === rowItem.ClientName) {
                this.listOfPOCNames.push(item);
                if (item.ID === rowItem.POCId) {
                    rowVal = item;
                }
            }
        });
        console.log('this.listOfPOCNames ', this.listOfPOCNames);
        this.editOop_form.patchValue({
            POCName: rowVal
        });
    }

    getPOCItemByName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        // return found ? found.FName + ' ' + found.LName : ''
        return found ? found : ''
    }

    get isValidEditDeliverableForm() {
        return this.editOop_form.controls;
    }

    cancelFormSub(formType) {
        if (formType === 'editDeliverable') {
            this.editOop_form.reset();
            this.deliverableModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        if (type === 'confirmInvoice') {
            console.log('form is submitting .....');
            this.isPSInnerLoaderHidden = false;
            let obj = {
                Status: 'Confirmed'
            }
            obj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ]
            this.submitForm(data, type);
        } else if (type === 'editDeliverable') {
            console.log('form is submitting .....', this.editOop_form.value);
            if (this.editOop_form.invalid) {
                return
            }
            this.isPSInnerLoaderHidden = false;
            let obj1 = {
                AddressType: this.editOop_form.value.AddressType.value,
                ScheduledDate: this.editOop_form.value.ScheduledDate,
                MainPOC: this.editOop_form.value.POCName.ID
            }
            obj1['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.selectedRowItem.Id);;
            let data = [
                {
                    objData: obj1,
                    endpoint: endpoint,
                    requestPost: false
                }
            ]
            this.submitForm(data, type);
        }
    }

    batchContents: any = [];
    submitForm(dataEndpointArray, type: string) {
        console.log('Form is submitting');

        this.batchContents = [];
        const batchGuid = this.spServices.generateUUID();
        const changeSetId = this.spServices.generateUUID();

        // const batchContents = this.spServices.getChangeSetBody1(changeSetId, endpoint, JSON.stringify(obj), true);
        console.log(' dataEndpointArray ', dataEndpointArray);
        dataEndpointArray.forEach(element => {
            if (element)
                this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
        });

        console.log("this.batchContents ", JSON.stringify(this.batchContents));

        this.batchContents.push('--changeset_' + changeSetId + '--');
        const batchBody = this.batchContents.join('\r\n');
        const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
        batchBodyContent.push('--batch_' + batchGuid + '--');
        const sBatchData = batchBodyContent.join('\r\n');
        this.spServices.getData(batchGuid, sBatchData).subscribe(res => {
            const arrResults = res;
            console.log('--oo ', arrResults);
            if (type === "confirmInvoice") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice is Confirmed.', detail: '', life: 2000 })
                this.reload();
            } else if (type === "editDeliverable") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice Updated.', detail: '', life: 2000 })
                this.cancelFormSub('editDeliverable');
                this.reload();
            }
            this.isPSInnerLoaderHidden = true;

        });
    }

    reload() {
        setTimeout(() => {
            // window.location.reload();
            this.getRequiredData();
            // this.currentUserInfo();
        }, 3000);
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }
}
