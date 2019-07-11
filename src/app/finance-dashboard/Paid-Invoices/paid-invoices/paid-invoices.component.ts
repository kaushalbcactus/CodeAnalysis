import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Message, ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/Services/common.service';


@Component({
    selector: 'app-paid-invoices',
    templateUrl: './paid-invoices.component.html',
    styleUrls: ['./paid-invoices.component.css']
})
export class PaidInvoicesComponent implements OnInit, OnDestroy {

    paidInvoicesRes: any = [];
    outstandingInCols: any[];
    msgs: Message[] = [];

    // Row Selection Array
    selectedRowData: any[];

    // Forms
    paymentResoved_form: FormGroup;
    disputeInvoice_form: FormGroup;
    replaceInvoice_form: FormGroup;
    creditOrDebitNote_form: FormGroup;

    // Show Hide Request Modal
    paymentResovedModal: boolean = false;
    disputeInvoiceModal: boolean = false;
    replaceInvoiceModal: boolean = false;
    creditOrDebitModal: boolean = false;

    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    }

    // Purchase Order Number
    purchaseOrders: any[];
    selectedPurchaseNumber: any;

    // Loader
    isPSInnerLoaderHidden: boolean = false;

    // Right side bar
    rightSideBar: boolean = false;

    // Calendar
    invalidDates: Array<Date>;
    minimumDate = new Date();

    // Date Range
    rangeDates: Date[];

    DateRange: any = {
        startDate: '',
        endDate: '',
    };

    @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;

    // List of Subscribers 
    private subscription: Subscription = new Subscription();

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
        private commonService: CommonService
    ) { }

    ngOnInit() {

        let today = new Date();
        let invalidDate = new Date();
        invalidDate.setDate(today.getDate() - 1);
        this.invalidDates = [today, invalidDate];

        // SetDefault Values
        const last3Days = this.commonService.getLastWorkingDay(65, new Date());
        this.rangeDates = [last3Days, new Date()];
        this.DateRange.startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
        this.DateRange.endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
        // this.fdDataShareServie.DateRange = this.DateRange;

        //Get  User Info 
        this.currentUserInfo();

        // POC & PO Number
        // this.projectInfo();
        this.projectContacts();
        this.poInfo();
        this.cleInfo();
        this.usStatesInfo();
        this.currencyInfo();

        this.createOutstandingInvoiceCols();
        // this.getOutstandingData();

        // Create FOrm Field
        this.createPaymentResovedFormField();
        this.createDisputeInvoiceFormField();
        this.createReplaceInvoiceFormField();
        this.createCreditDebitFormField();


        // Dummy
        this.getPurchaseOrderList();

        // Get details
        this.getRequiredData();
    }

    // Project Info 
    projectInfoData: any = [];
    projectInfo() {
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
            }
        }))
    }

    // Purchase Order Number
    purchaseOrdersList: any = [];
    poInfo() {
        this.subscription.add(this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
            }
        }))
    }

    // Project COntacts
    projectContactsData: any = [];
    projectContacts() {
        this.subscription.add(this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
            }
        }))
    }

    // US States
    usStatesData: any = [];
    usStatesInfo() {
        this.usStatesData = [];
        this.subscription.add(this.fdDataShareServie.defaultUSSData.subscribe((res) => {
            if (res) {
                this.usStatesData = res;
                console.log('US States Data ', this.usStatesData);
            }
        }))
    }

    // US States
    currencyData: any = [];
    currencyInfo() {
        this.currencyData = [];
        this.subscription.add(this.fdDataShareServie.defaultCUData.subscribe((res) => {
            if (res) {
                this.currencyData = res;
                console.log('currency Data ', this.currencyData);
            }
        }))
    }

    // Client Legal Entity
    cleData: any = [];
    cleInfo() {
        this.cleData = [];
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('CLE Data ', this.cleData);
            }
        }))
    }

    // Purchase Order List
    getPurchaseOrderList() {
        this.purchaseOrders = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ]
    }

    createPaymentResovedFormField() {
        this.paymentResoved_form = this.fb.group({
            file: ['', [Validators.required]]
        })
    }

    createDisputeInvoiceFormField() {
        this.disputeInvoice_form = this.fb.group({
            Reason: ['', [Validators.required]],
            Comments: ['', [Validators.required]]
        })
    }
    createReplaceInvoiceFormField() {
        this.replaceInvoice_form = this.fb.group({
            file: ['', [Validators.required]]
        })
    }

    createCreditDebitFormField() {
        this.creditOrDebitNote_form = this.fb.group({
            Number: ['', Validators.required],
            file: ['', Validators.required],
            Amount: ['', Validators.required],
            Type: ['', Validators.required],
            Comments: ['', Validators.required],
        })
    }

    // Valid Forms
    get isValidPaymentResovedForm() {
        return this.paymentResoved_form.controls;
    }

    get isValidDisputeInvoiceForm() {
        return this.disputeInvoice_form.controls;
    }

    get isValidReplaceInvoiceForm() {
        return this.replaceInvoice_form.controls;
    }

    get isValidCreditDebitNoteForm() {
        return this.creditOrDebitNote_form.controls;
    }

    // Date Range
    SelectedDateRange() {
        console.log('Selected Date Range ', this.rangeDates);
        if (this.rangeDates) {
            this.setDefaultDateRange();
        }
    }

    setDefault() {
        const last3Days = this.commonService.getLastWorkingDay(65, new Date());
        const dates = [last3Days, new Date()];
        let startDate = new Date(this.datePipe.transform(dates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
        let endDate = new Date(this.datePipe.transform(dates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
        let obj = {
            startDate: startDate,
            endDate: endDate
        }
        this.DateRange = obj;
        // this.fdDataShareServie.sendDateRange(obj);
        this.getRequiredData();
    }

    setDefaultDateRange() {
        // SetDefault Values
        if (this.rangeDates) {
            let startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
            let endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
            let obj = {
                startDate: startDate,
                endDate: endDate
            }
            this.DateRange = obj;
            // this.fdDataShareServie.sendDateRange(obj);
            this.getRequiredData();
            console.log('startDate ' + startDate + ' endDate' + endDate)
        }
    }


    createOutstandingInvoiceCols() {
        this.outstandingInCols = [
            // { field: 'InvoiceStatus', header: 'Invoice Status', visibility: true },
            { field: 'InvoiceNumber', header: 'Invoice Number', visibility: true },
            { field: 'POValues', header: 'PO Name/ Number', visibility: true },
            { field: 'ClientLegalEntity', header: 'Client LE', visibility: true },
            { field: 'InvoiceDate', header: 'Invoice Date', visibility: true },
            { field: 'InvoiceDateFormat', header: 'Invoice Date', visibility: false },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POC', header: 'POC', visibility: true },
            
            { field: 'PONNumber', header: 'PO Number', visibility: false },
            { field: 'PaymentURL', header: 'Payment URL', visibility: false },
            { field: 'MainPOC', header: 'Main POC', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'ProformaLookup', header: 'Proforma Lookup', visibility: false },
            { field: 'LineItemsLookup', header: 'LineItems Lookup', visibility: false },
            { field: 'DisputeReason', header: 'Dispute Reason', visibility: false },
            { field: 'DisputeComments', header: 'Dispute Comments', visibility: false },
            { field: 'Reason', header: 'Reason', visibility: false },
            { field: 'State', header: 'State', visibility: false },
            { field: 'AdditionalInfo', header: 'Additional Info', visibility: false },
            { field: 'InvoiceType', header: 'Invoice Type', visibility: false },
            { field: 'TaggedAmount', header: 'Tagged Amount', visibility: false },
            { field: 'IsTaggedFully', header: 'Is Tagged Fully', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'AdditionalPOC', header: 'Additional POC', visibility: false },
            { field: 'Created', header: 'Created', visibility: false },
            { field: '', header: '', visibility: true },

        ];
    }

    // Logged In user Info
    loggedInUserInfo: any = [];
    loggedInUserGroup: any = [];
    async currentUserInfo() {
        this.loggedInUserInfo = [];
        this.loggedInUserGroup = [];
        let curruentUsrInfo = await this.spServices.getCurrentUser();
        this.loggedInUserInfo = curruentUsrInfo.d.Groups.results;
        console.log('loggedInUserInfo ', this.loggedInUserInfo);

        this.loggedInUserInfo.forEach(element => {
            if (element) {
                this.loggedInUserGroup.push(element.LoginName);
            }
        });
        if (this.loggedInUserGroup.findIndex(c => (c === "Managers" || c === 'Project-FullAccess')) != -1) {
            // this.getProjectInfoData(true);
        } else {
            // this.getProjectInfoData(false);
        }
    }

    // Get Proformas InvoiceItemList
    outstandingInv: any = [];
    async getRequiredData() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let invoicesQuery = '';
        let obj = Object.assign({}, this.fdConstantsService.fdComponent.paidInvoices);
        obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.OutInvoices.name + '', obj);

        let endPoints = [invoicesQuery];
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        console.log('REs in Paid Invoice ', res);
        arrResults = res;
        if (arrResults.length) {
            this.formatData(arrResults[0]);
            console.log(arrResults);
        }
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    async formatData(data: any[]) {
        this.paidInvoicesRes = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = await this.getPONumber(element);
            let pnumber = poItem.Number ? poItem.Number : '';
            let pname = poItem.Name ? poItem.Name : '';
            if (pnumber === 'NA') {
                pnumber = '';
            }
            let ponn = pnumber + ' ' + pname;
            if (pname && pnumber) {
                ponn = pnumber + ' / ' + pname;
            }
            let POValues = ponn;

            this.paidInvoicesRes.push({
                Id: element.ID,
                InvoiceStatus: element.Status,
                InvoiceNumber: element.InvoiceNumber,
                POValues:POValues,
                PONumber: poItem.Number,
                POName: poItem.Name,
                ClientLegalEntity: element.ClientLegalEntity,
                InvoiceDate: element.InvoiceDate,
                InvoiceDateFormat: this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyy, hh:mm a'),
                Amount: element.Amount,
                Currency: element.Currency,
                POC: this.getPOCName(element),
                FileURL: element.FileURL,
                FiscalYear: element.FiscalYear,
                Title: element.Title,
                AddressType: element.AddressType,

                PaymentURL: element.PaymentURL,
                MainPOC: element.MainPOC,
                Template: element.Template,
                ProformaLookup: element.ProformaLookup,
                LineItemsLookup: element.LineItemsLookup,
                DisputeReason: element.DisputeReason,
                DisputeComments: element.DisputeComments,
                Reason: element.Reason,
                State: element.State,
                AdditionalInfo: element.AdditionalInfo,
                InvoiceType: element.InvoiceType,
                TaggedAmount: element.TaggedAmount,
                IsTaggedFully: element.IsTaggedFully,
                Modified: element.Modified,
                AdditionalPOC: element.AdditionalPOC,
                Created: element.Created
            })
        }
        this.paidInvoicesRes = [...this.paidInvoicesRes];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues();
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    // Project PO
    getPONumber(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        })
        return found ? found : ''
    }
    getPOName(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        })
        return found ? found : ''
    }

    getPOCName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        return found ? found.FName + ' ' + found.LName : ''
    }

    getOutstandingData() {
        this.paidInvoicesRes = [
            {
                id: 1,
                InvoiceStatus: 'Status',
                InvoiceNumber: 11233,
                PONumber: '11223344',
                POName: 'Ashish P',
                ClientLegalEntity: 'ASDFRED2-23-1SSS',
                InvoiceDate: '12/1/2018 ',
                Amount: '556.71',
                Currency: 'INR',
                POC: 'Test',
            },
            {
                id: 1,
                InvoiceStatus: 'Status -1',
                InvoiceNumber: 11345,
                PONumber: '2233455',
                POName: 'PO Name',
                ClientLegalEntity: 'TURYD63-S-A23-1SSS',
                InvoiceDate: '14/09/2019',
                Amount: '123.71',
                Currency: 'INR',
                POC: 'Test poc',
            }
        ]
        this.createColFieldValues();
    }

    outInvoiceColArray = {
        InvoiceStatus: [],
        InvoiceNumber: [],
        PONumber: [],
        POValues: [],
        ClientLegalEntity: [],
        InvoiceDate: [],
        Amount: [],
        POC: [],
        Currency: [],
    }

    createColFieldValues() {
        this.outInvoiceColArray.InvoiceStatus = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.InvoiceStatus, value: a.InvoiceStatus }; return b; }));
        this.outInvoiceColArray.InvoiceNumber = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.InvoiceNumber, value: a.InvoiceNumber }; return b; }));
        // this.outInvoiceColArray.PONumber = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }));
        this.outInvoiceColArray.POValues = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.POValues, value: a.POValues }; return b; }));
        this.outInvoiceColArray.ClientLegalEntity = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }));
        this.outInvoiceColArray.InvoiceDate = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: this.datePipe.transform(a.InvoiceDate, "MMM dd, yyyy"), value: a.InvoiceDate }; return b; }));
        this.outInvoiceColArray.Amount = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }));
        this.outInvoiceColArray.Currency = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }));
        this.outInvoiceColArray.POC = this.uniqueArrayObj(this.paidInvoicesRes.map(a => { let b = { label: a.POC, value: a.POC }; return b; }));
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


    // On Row Selection
    onRowSelect(event) {
        console.log('Event ', this.selectedRowData);
    }

    checkSelectedRowData() {
        console.log('Event ', this.selectedRowData);
    }

    convertToExcelFile(cnf1) {
        console.log('cnf ', cnf1);
        // cnf1.columns = [
        //   {
        //     field: 'id',
        //     header: 'id'
        //   }
        // ]
        cnf1.exportCSV();
    }

    items: any[];
    contextMenu: boolean = false;
    // Open popups
    openPopup(data, popUpData) {
        this.contextMenu = false;
        // console.log('Row data  ', data);
        // let invoiceSts: string = '';
        this.items = [];
        // if (data.data.InvoiceStatus) {
        //     invoiceSts = data.data.InvoiceStatus.toLowerCase();
        // }

        // switch (invoiceSts) {
        //     case 'status -1': {
        //         this.items = [
        //             // { label: 'Export Invoice', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Dispute Invoice', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Mark as Debit/Credit Note', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Replace Invoice', command: (e) => this.openMenuContent(e, data) },
        //         ];
        //         break;
        //     }
        //     case 'status': {
        //         this.items = [
        //             // { label: 'Export Invoice', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Dispute Invoice', command: (e) => this.openMenuContent(e, data) },
        //             { label: 'Mark as Debit/Credit Note', command: (e) => this.openMenuContent(e, data) },
        //         ]
        //     }
        //     default: {
        //         this.items = [];
        //     }
        // }
        this.items.push(
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        )
        if (this.items.length === 0) {
            console.log('this.items ', this.items);
            this.contextMenu = true;
        }

    }

    confirmDialog: any = {
        title: '',
        text: ''
    }
    selectedRowItem: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.confirmDialog.title = event.item.label;
        // if (this.confirmDialog.title.toLowerCase() === 'mark as payment resolved') {
        //     this.paymentResovedModal = true;
        // } else if (this.confirmDialog.title.toLowerCase() === 'dispute invoice') {
        //     this.disputeInvoiceModal = true;
        // } else if (this.confirmDialog.title.toLowerCase() === 'replace invoice') {
        //     this.replaceInvoiceModal = true;
        // } else if (this.confirmDialog.title.includes("Debit/Credit Note")) {
        //     this.creditOrDebitModal = true;
        // } else
        if (this.confirmDialog.title.toLowerCase() === 'show history') {
            this.timeline.showTimeline(data.Id, 'FD', 'Invoices');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    onFileChange(fileData) {
        console.log('File data ', fileData);
    }

    cancelFormSub(formType) {
        if (formType === 'paymentResoved') {
            this.paymentResoved_form.reset();
            this.paymentResovedModal = false;
        } else if (formType === 'disputeInvoice') {
            this.disputeInvoice_form.reset();
            this.disputeInvoiceModal = false;
        } else if (formType === 'replaceInvoice') {
            this.replaceInvoice_form.reset();
            this.replaceInvoiceModal = false;
        } else if (formType === 'creditDebit') {
            this.creditOrDebitNote_form.reset();
            this.creditOrDebitModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        console.log()
        if (type === 'paymentResoved') {
            if (this.paymentResoved_form.invalid) {
                return;
            }
            this.submitForm();
            console.log('form is submitting ..... & Form data is ', this.paymentResoved_form.value);
        } else if (type === 'disputeInvoice') {
            if (this.disputeInvoice_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.disputeInvoice_form.value);
            this.submitForm();
        } else if (type === 'replaceInvoice') {
            if (this.replaceInvoice_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.replaceInvoice_form.value);
            this.submitForm();
        } else if (type === 'creditDebit') {
            if (this.creditOrDebitNote_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.creditOrDebitNote_form.value);
            this.submitForm();
        }
    }

    submitForm() {
        console.log('Form data in submitForm fun ');
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

}
