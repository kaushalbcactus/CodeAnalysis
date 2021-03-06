import { Component, OnInit, ViewChild, OnDestroy, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/Services/common.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';


@Component({
    selector: 'app-paid-invoices',
    templateUrl: './paid-invoices.component.html',
    styleUrls: ['./paid-invoices.component.css']
})
export class PaidInvoicesComponent implements OnInit, OnDestroy {
    tempClick: any;
    paidInvoicesRes: any = [];
    outstandingInCols: any[];
    iliByidRes: any = [];
    pfresp: any = [];
    pfbresp: any = [];
    proformaData: any = [];
    poItem: any = [];
    invoiceCols: { field: string; header: string; }[];
    currentPageNumber: number;
    pageNumber: number = 0;
    expandedRows: any = {};
    parentData: any;

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

    min2Years = new Date();
    rightSideBarInvoice: boolean = false;
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };

    @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
    @ViewChild('popupMenu', { static: false }) popupMenu;
    @ViewChild('pi', { static: false }) paidInvTable: Table;

    // List of Subscribers
    private subscription: Subscription = new Subscription();


    constructor(
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private commonService: CommonService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        zone: NgZone,
    ) {

        // Browser back button disabled & bookmark issue solution
        history.pushState(null, null, window.location.href);
        platformLocation.onPopState(() => {
            history.pushState(null, null, window.location.href);
        });

        _router.events.subscribe((uri) => {
            zone.run(() => _applicationRef.tick());
        });

    }

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
        const currentUserId = this.globalService.currentUser.userId;
        this.currentUserInfo(currentUserId);

        // POC & PO Number
        // this.projectInfo();
        this.projectContacts();
        this.poInfo();
        this.cleInfo();
        this.usStatesInfo();
        this.currencyInfo();
        this.resourceCInfo();
        this.createOutstandingInvoiceCols();

        // Create FOrm Field
        this.createPaymentResovedFormField();
        this.createDisputeInvoiceFormField();
        this.createReplaceInvoiceFormField();
        this.createCreditDebitFormField();

        // Get details
        this.getRequiredData();
    }

    projectInfoData: any = [];

    async projectInfo() {
        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();

        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                // console.log('PI Data ', this.projectInfoData);
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

    // Resource Categorization
    rcData: any = [];
    resourceCInfo() {
        this.subscription.add(this.fdDataShareServie.defaultRCData.subscribe((res) => {
            if (res) {
                this.rcData = res;
                console.log('Resource Categorization ', this.rcData);
            }
        }))
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
            { field: 'DisplayInvoiceWithAuxiliary', header: 'Invoice Number', visibility: true },
            { field: 'POValues', header: 'PO Name/ Number', visibility: true },
            { field: 'ClientLegalEntity', header: 'Client', visibility: true },
            { field: 'InvoiceDate', header: 'Invoice Date', visibility: true, exportable: false },
            { field: 'InvoiceDateFormat', header: 'Invoice Date', visibility: false },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POC', header: 'POC', visibility: true },
            { field: 'ModifiedBy', header: 'Modified By', visibility: true },
            { field: 'PONNumber', header: 'PO Number', visibility: false },
            { field: 'PaymentURL', header: 'Payment URL', visibility: false },
            { field: 'MainPOC', header: 'Main POC', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'DisputeReason', header: 'Dispute Reason', visibility: false },
            { field: 'DisputeComments', header: 'Dispute Comments', visibility: false },
            { field: 'Reason', header: 'Reason', visibility: false },
            { field: 'State', header: 'State', visibility: false },
            { field: 'AdditionalInfo', header: 'Additional Info', visibility: false },
            { field: 'InvoiceType', header: 'Invoice Type', visibility: false },
            { field: 'TaggedAmount', header: 'Tagged Amount', visibility: false },
            { field: 'IsTaggedFully', header: 'Is Tagged Fully', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'Created', header: 'Created', visibility: false },
            { field: '', header: '', visibility: true },
        ];

        this.invoiceCols = [
            { field: 'ProjectCode', header: 'Project Code', },
            { field: 'ShortTitle', header: 'Short Title', },
            { field: 'SOWValue', header: 'SOW Code / Name', },
            { field: 'ProjectMileStone', header: 'Milestone', },
            { field: 'POValues', header: 'PO No / Name', },
            { field: 'ClientName', header: 'Client', },
            { field: 'ScheduledDateFormat', header: 'Schedule Date', },
            { field: 'Amount', header: 'Amount', },
            { field: 'Currency', header: 'Currency', },
            { field: 'POCName', header: 'POC Name', },
        ]
    }

    // Logged In user Info
    loggedInUserInfo: any = [];
    loggedInUserGroup: any = [];
    async currentUserInfo(userId) {
        this.loggedInUserInfo = [];
        this.loggedInUserGroup = [];
        //let curruentUsrInfo = await this.spServices.getCurrentUser();
        this.commonService.SetNewrelic('Finance-Dashboard', 'paid-invoices', 'getUserInfo', 'GET');
        let currentUsrInfo = await this.spServices.getUserInfo(userId);
        this.loggedInUserInfo = currentUsrInfo.Groups.results;
        this.loggedInUserInfo.forEach(element => {
            if (element) {
                this.loggedInUserGroup.push(element.LoginName);
            }
        });
    }

    // Get Proformas InvoiceItemList
    outstandingInv: any = [];
    async getRequiredData() {
        this.expandedRows = {};
        this.min2Years = new Date(new Date().setFullYear(new Date().getFullYear() - 2));
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const obj = Object.assign({}, this.fdConstantsService.fdComponent.paidInvoices);
        obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        this.commonService.SetNewrelic('Finance-Dashboard', 'paid-invoices', 'getPaidInvoices', 'GET');
        const res = await this.spServices.readItems(this.constantService.listNames.Invoices.name, obj);
        const arrResults = res.length ? res : [];
        this.formatData(arrResults);
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    async formatData(data: any[]) {
        this.paidInvoicesRes = [];
        this.selectedRowData = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = await this.getPONumber(element);
            let pnumber = poItem.Number ? poItem.Number : '';
            let pname = poItem.NameST ? poItem.NameST : '';
            if (pnumber === 'NA') {
                pnumber = '';
            }
            let ponn = pnumber + ' ' + pname;
            if (pname && pnumber) {
                ponn = pnumber + ' / ' + pname;
            }
            let POValues = ponn;

            // let resCInfo = await this.fdDataShareServie.getResDetailById(this.rcData, element);
            // if (resCInfo && resCInfo.hasOwnProperty('UserName') && resCInfo.UserName.hasOwnProperty('Title')) {
            //     resCInfo = resCInfo.UserName.Title
            // }

            this.paidInvoicesRes.push({
                Id: element.ID,
                InvoiceStatus: element.Status,
                InvoiceNumber: element.InvoiceNumber,
                DisplayInvoiceWithAuxiliary: element.AuxiliaryInvoiceName ?  element.InvoiceNumber + ' - ' + element.AuxiliaryInvoiceName : element.InvoiceNumber,
                POValues: POValues,
                PONumber: poItem.Number,
                POName: poItem.NameST,
                ClientLegalEntity: element.ClientLegalEntity,
                InvoiceDate: new Date(this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyyy')),
                InvoiceDateFormat: this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyy, hh:mm a'),
                Amount: element.Amount,
                Currency: element.Currency,
                POC: this.getPOCName(element),
                FileURL: element.FileURL,
                // FiscalYear: element.FiscalYear,
                Title: element.InvoiceTitle,
                AddressType: element.AddressType,

                PaymentURL: element.PaymentURL,
                MainPOC: element.MainPOC,
                Template: element.Template,
                ProformaLookup: element.ProformaLookup,
                //LineItemsLookup: element.LineItemsLookup,
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
                Created: element.Created,
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            })
        }
        this.paidInvoicesRes = [...this.paidInvoicesRes];
        this.isPSInnerLoaderHidden = true;
        console.log('this.paidInvoicesRes ', this.paidInvoicesRes);
        this.createColFieldValues(this.paidInvoicesRes);
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

    outInvoiceColArray = {
        InvoiceStatus: [],
        DisplayInvoiceWithAuxiliary: [],
        PONumber: [],
        POValues: [],
        ClientLegalEntity: [],
        InvoiceDate: [],
        Amount: [],
        POC: [],
        Currency: [],
        ModifiedBy: []
    }

    createColFieldValues(resArray) {
        // this.outInvoiceColArray.InvoiceStatus = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.InvoiceStatus, value: a.InvoiceStatus }; return b; }).filter(ele => ele.label));
        this.outInvoiceColArray.DisplayInvoiceWithAuxiliary = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DisplayInvoiceWithAuxiliary, value: a.DisplayInvoiceWithAuxiliary }; return b; }).filter(ele => ele.label)));
        // this.outInvoiceColArray.PONumber this.commonService.sortData(= this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.POValues = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POValues, value: a.POValues }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        const invoiceDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.InvoiceDate, "MMM dd, yyyy"), value: a.InvoiceDate }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.ModifiedBy = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.InvoiceDate = invoiceDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        const amount = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
        this.outInvoiceColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label');
        this.outInvoiceColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
        console.log('this.outInvoiceColArray ', this.outInvoiceColArray);
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
    onTableClick() {


        this.commonService.showToastrMessage(this.constantService.MessageType.success,'Detail Text',false);
        this.commonService.clearToastrMessage();
        if (this.pMenu && !this.popupMenu.visible) {
            console.log('in menuOnHide function');
            this.popupMenu.visible = false;
        }
    }

    pmenuonShow() {
        this.pMenu = true;
    }

    pmenuOnHide() {
        this.pMenu = false;
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

    items: any = [];
    pMenu: boolean = false;
    // Open popups
    openPopup(data, popupMenu) {
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
        if(data.ScheduleType == 'oop' || data.ScheduleType == 'revenue') {
            this.items = [
                { label: 'Detag Project', command: (e) => this.openMenuContent(e, data) },
                { label: 'View Project Details', command: (e) => this.openMenuContent(e, data) }
            ]
        } 

        this.items.push(
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        )

        if (this.items.length === 0) {
            console.log('this.items ', this.items);
            this.pMenu = true;
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
        if(data.InvoiceType == 'oop' || data.InvoiceType == 'revenue') {
            if (this.confirmDialog.title.toLowerCase() === 'show history') {
                this.timeline.showTimeline(data.Id, 'FD', this.constantService.listNames.Invoices.name);
            } else if (event.item.label === 'Details') {
                this.rightSideBar = !this.rightSideBar;
                return;
            }
        }
        else {
            if(this.confirmDialog.title === 'Detag Project') {
                this.commonService.confirmMessageDialog("Detag Project", "Are you sure you want to detag project", null, ['Yes', 'No'], false).then(async Confirmation => {
                    if (Confirmation === 'Yes') {
                        this.onSubmit("Detag Project");
                    }
                    else if (Confirmation === 'No') {
                        this.commonService.showToastrMessage(this.constantService.MessageType.info, 'You have cancelled', false);
                    }
                });
            } else if (this.confirmDialog.title.toLowerCase() === 'show history') {
                this.timeline.showTimeline(data.Id, 'FD', this.constantService.listNames.InvoiceLineItems.name);
            } else if (this.confirmDialog.title === 'Details') {
                this.rightSideBarInvoice = !this.rightSideBarInvoice;
                return;
            } else if (this.confirmDialog.title === 'View Project Details') {
                window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/projectMgmt?ProjectCode=' + data.ProjectCode);
            }
        }
    }

    onFileChange(fileData) {
        console.log('File data ', fileData);
    }

    async OnRowExpand(event) {
        event.data.loaderenable = true;
        event.data.invoiceDetails = [];
        this.parentData = event.data;
        let batchUrl = [];
        const url = this.spServices.getReadURL(this.constantService.listNames.InvoiceLineItems.name,
            this.fdConstantsService.fdComponent.invoiceLineItemByInvoice).replace('{{InvoiceLookup}}', event.data.Id);
        this.commonService.setBatchObject(batchUrl, url, null, this.constantService.Method.GET, this.constantService.listNames.InvoiceLineItems.type)
        const response = await this.spServices.executeBatch(batchUrl);
        const Invoices = response.length > 0 ? response[0].retItems : [];
        if (Invoices.length > 0) {
            if (this.projectInfoData.length === 0) {
                await this.projectInfo();
            }
            for (let i = 0; i < Invoices.length; i++) {
                let poItem = this.getPONumber(Invoices[i]);
                let pnumber = poItem.Number ? poItem.Number : '';
                const pname = poItem.NameST ? poItem.Name : '';
                if (pnumber === 'NA') {
                    pnumber = '';
                }
                let ponn = pnumber + ' ' + pname;
                if (pname && pnumber) {
                    ponn = pnumber + ' / ' + pname;
                }
                const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(Invoices[i].SOWCode);
                const sowCode = Invoices[i].SOWCode ? Invoices[i].SOWCode : '';
                const sowName = sowItem.Title ? sowItem.Title : '';
                let sowcn = sowCode + ' ' + sowName;
                if (sowCode && sowName) {
                    sowcn = sowCode + ' / ' + sowName;
                }
                const projcd = this.projectContactsData.find(c => c.ID === Invoices[i].MainPOC);
                const piInfo = this.projectInfoData.find(c => c.ProjectCode === Invoices[i].Title);
                event.data.invoiceDetails.push({
                    Id: Invoices[i].ID,
                    ProjectCode: Invoices[i].Title,
                    ProjectTitle: piInfo && piInfo.Title ? piInfo.Title : '',
                    ShortTitle: piInfo && piInfo.WBJID ? piInfo.WBJID : '',
                    SOWCode: Invoices[i].SOWCode,
                    SOWValue: sowcn,
                    SOWName: sowItem.Title,
                    ProjectMileStone: piInfo && piInfo.Milestone ? piInfo.Milestone : '',
                    POValues: ponn,
                    PONumber: poItem.Number,
                    PO: Invoices[i].PO,
                    POCId: Invoices[i].MainPOC,
                    ClientName: piInfo && piInfo.ClientLegalEntity ? piInfo.ClientLegalEntity : '',
                    ScheduledDate: new Date(this.datePipe.transform(Invoices[i].ScheduledDate, 'MMM dd, yyyy')),
                    ScheduledDateFormat: this.datePipe.transform(Invoices[i].ScheduledDate, 'MMM dd, yyyy'),
                    Amount: Invoices[i].Amount,
                    Currency: Invoices[i].Currency,
                    POCName: projcd ? projcd.FName + ' ' + projcd.LName : '',
                    AddressType: Invoices[i].AddressType,
                    CS: this.fdDataShareServie.getCSDetails(Invoices[i]),
                    PracticeArea: piInfo && piInfo.BusinessVertical ? piInfo.BusinessVertical : '',
                    POName: poItem.Name,
                    TaggedDate: Invoices[i].TaggedDate,
                    Status: Invoices[i].Status,
                    ProformaLookup: Invoices[i].ProformaLookup,
                    ScheduleType: Invoices[i].ScheduleType,
                    InvoiceLookup: Invoices[i].InvoiceLookup,
                    Template: Invoices[i].Template,
                    Modified: this.datePipe.transform(Invoices[i].Modified, 'MMM dd, yyyy'),
                    ModifiedBy: Invoices[i].Editor ? Invoices[i].Editor.Title : ''
                })
            }
        }
        event.data.loaderenable = false;
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
            // this.submitForm();
            console.log('form is submitting ..... & Form data is ', this.paymentResoved_form.value);
        } else if (type === 'disputeInvoice') {
            if (this.disputeInvoice_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.disputeInvoice_form.value);
            // this.submitForm();
        } else if (type === 'replaceInvoice') {
            if (this.replaceInvoice_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.replaceInvoice_form.value);
            // this.submitForm();
        } else if (type === 'creditDebit') {
            if (this.creditOrDebitNote_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.creditOrDebitNote_form.value);
            // this.submitForm();
        } else if(type === 'Detag Project') {
            this.detagInvoice();
        }
    }

    async detagInvoice() {
        await this.getFinanceListData();
    }

    async getFinanceListData() {
        const batchUrl = [];
        this.pfresp = [];
        this.pfbresp = [];
        const pfObj = Object.assign({}, this.queryConfig);
        pfObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinances.name,
            this.fdConstantsService.fdComponent.projectFinances);
        pfObj.url = pfObj.url.replace('{{ProjectCode}}', this.selectedRowItem.ProjectCode);
        pfObj.listName = this.constantService.listNames.ProjectFinances.name;
        pfObj.type = 'GET';
        batchUrl.push(pfObj);

        const pfbObj = Object.assign({}, this.queryConfig);
        pfbObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinanceBreakup.name,
            this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO);
        pfbObj.url = pfbObj.url.replace('{{ProjectCode}}', this.selectedRowItem.ProjectCode).replace('{{PO}}', this.selectedRowItem.PO);
        pfbObj.listName = this.constantService.listNames.ProjectFinanceBreakup.name;
        pfbObj.type = 'GET';
        batchUrl.push(pfbObj);

        const res = await this.spServices.executeBatch(batchUrl);

        const arrResults = res.length ? res.map(a => a.retItems) : [];
        if (arrResults.length) {
            this.pfresp = arrResults[0] ? arrResults[0] : [];
            this.pfbresp = arrResults[1] ? arrResults[1] : [];
            console.log('this.pfresp ', this.pfresp);
            console.log('this.pfbresp ', this.pfbresp);

        }
        // await this.getPOData(data)
        // await this.getProforma(data);
        await this.updateFinanceListData();
    }

    updateFinanceListData() {
        const batchUrl = [];
        let pfs: any = [];
        let pfbs: any = [];
        let pfsItem: any = {};
        let pfbsItems: any = [];

        // this.iliByidRes.forEach(element => {

            let invData = {
                __metadata: { type: this.constantService.listNames.InvoiceLineItems.type },
                Status: 'Scheduled',
                ScheduledDate: new Date(),
                TaggedDate : null,
                ProformaLookup: null,
                InvoiceLookup: null
            }
            this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, +this.selectedRowItem.Id), invData, this.constantService.Method.PATCH, this.constantService.listNames.InvoiceLineItems.name);

            let invoiceData = {
                __metadata: { type: this.constantService.listNames.Invoices.type },
                IsTaggedFully: 'No',
                TaggedAmount: this.parentData.TaggedAmount ? this.parentData.TaggedAmount - this.selectedRowItem.Amount : 0 
            }
            this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.parentData.Id), invoiceData, this.constantService.Method.PATCH, this.constantService.listNames.Invoices.name);

            // let proformaData = {
            //     __metadata: { type: this.constantService.listNames.Proforma.type },
            //     Status: 'Deleted',
            // }
            // this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.Proforma.name, +this.proformaData.Id), proformaData, this.constantService.Method.PATCH, this.constantService.listNames.Proforma.name);
            // let poData: any = {};
            // if (this.selectedRowItem.InvoiceType === 'revenue') {
            //     // if (this.addILIObj.IsTaggedFully === 'Yes') {
            //         poData.ScheduledRevenue = (this.poItem.ScheduledRevenue ? parseFloat(this.poItem.ScheduledRevenue.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            //         poData.TotalScheduled = (this.poItem.TotalScheduled ? parseFloat(this.poItem.TotalScheduled.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            //     // }
            //     poData.InvoicedRevenue = (this.poItem.InvoicedRevenue ? parseFloat(this.poItem.InvoicedRevenue.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
            //     poData.TotalInvoiced = (this.poItem.TotalInvoiced ? parseFloat(this.poItem.TotalInvoiced.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
            // } else if (this.selectedRowItem.InvoiceType === 'oop') {
            //     // if (this.addILIObj.IsTaggedFully === 'Yes') {
            //         poData.ScheduledOOP = (this.poItem.ScheduledOOP ? parseFloat(this.poItem.ScheduledOOP.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            //         poData.TotalScheduled = (this.poItem.TotalScheduled ? parseFloat(this.poItem.TotalScheduled.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            //     // }
            //     poData.InvoicedOOP = (this.poItem.InvoicedOOP ? parseFloat(this.poItem.InvoicedOOP.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
            //     poData.TotalInvoiced = (this.poItem.TotalInvoiced ? parseFloat(this.poItem.TotalInvoiced.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
            // }

            // poData['__metadata'] = { type: this.constantService.listNames.PO.type };

            // this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.PO.name, +this.poItem.Id), proformaData, this.constantService.Method.PATCH, this.constantService.listNames.PO.name);


            const pfsItems = this.pfresp.filter(pf => pf.Title === this.selectedRowItem.ProjectCode);
            pfsItem = pfsItems.length > 0 ? pfsItems[0] : {};
            if (pfsItem) {
                const amount = parseFloat(this.selectedRowItem.Amount.toFixed(2));
                if (this.selectedRowItem.ScheduleType === 'revenue') {
                    pfsItem.InvoicedRevenue = pfsItem.InvoicedRevenue ? parseFloat(pfsItem.InvoicedRevenue.toFixed(2)) - amount : 0;
                    pfsItem.ScheduledRevenue = pfsItem.ScheduledRevenue ? parseFloat(pfsItem.ScheduledRevenue.toFixed(2)) + amount : 0 + amount;
                    pfsItem.Invoiced = pfsItem.Invoiced ? parseFloat(pfsItem.Invoiced.toFixed(2)) - amount : 0;
                    pfsItem.InvoicesScheduled = pfsItem.InvoicesScheduled ? parseFloat(pfsItem.InvoicesScheduled.toFixed(2)) + amount : 0 + amount
                    pfs.push({
                        Id: pfsItem.Id,
                        InvoicedRevenue: (pfsItem.InvoicedRevenue),
                        ScheduledRevenue: (pfsItem.ScheduledRevenue),
                        Invoiced: (pfsItem.Invoiced),
                        InvoicesScheduled: (pfsItem.InvoicesScheduled),
                    });
                } else if (this.selectedRowItem.ScheduleType === 'oop') {
                    pfsItem.ScheduledOOP = pfsItem.ScheduledOOP ? parseFloat(pfsItem.ScheduledOOP.toFixed(2)) + amount : 0 + amount;
                    pfsItem.InvoicedOOP = pfsItem.InvoicedOOP ? parseFloat(pfsItem.InvoicedOOP.toFixed(2)) - amount : 0;
                    pfsItem.Invoiced = pfsItem.Invoiced ? parseFloat(pfsItem.Invoiced.toFixed(2)) - amount : 0;
                    pfsItem.InvoicesScheduled = pfsItem.InvoicesScheduled ? parseFloat(pfsItem.InvoicesScheduled.toFixed(2)) + amount : 0 + amount;
                    pfs.push({
                        Id: pfsItem.Id,
                        ScheduledOOP: (pfsItem.ScheduledOOP),
                        InvoicedOOP: (pfsItem.InvoicedOOP),
                        Invoiced: (pfsItem.Invoiced),
                        InvoicesScheduled: (pfsItem.InvoicesScheduled),
                    });
                }
            }
            // PFB
            pfbsItems = this.pfbresp.filter(pfb => pfb.ProjectNumber === this.selectedRowItem.ProjectCode && pfb.POLookup === this.selectedRowItem.PO);
            if (pfbsItems.length) {
                const amount = parseFloat(this.selectedRowItem.Amount.toFixed(2));
                pfbsItems.forEach(pfbsItem => {
                    if (this.selectedRowItem.ScheduleType === 'revenue') {
                        pfbsItem.InvoicedRevenue = pfbsItem.InvoicedRevenue ? parseFloat(pfbsItem.InvoicedRevenue.toFixed(2)) - amount : 0;
                        pfbsItem.ScheduledRevenue = pfbsItem.ScheduledRevenue ? parseFloat(pfbsItem.ScheduledRevenue.toFixed(2)) + amount : 0 + amount;
                        pfbsItem.TotalInvoiced = pfbsItem.TotalInvoiced ? parseFloat(pfbsItem.TotalInvoiced.toFixed(2)) - amount : 0;
                        pfbsItem.TotalScheduled = pfbsItem.TotalScheduled ? parseFloat(pfbsItem.TotalScheduled.toFixed(2)) + amount : 0 + amount;
                        pfbs.push({
                            Id: pfbsItem.Id,
                            InvoicedRevenue: (pfbsItem.InvoicedRevenue),
                            ScheduledRevenue: (pfbsItem.ScheduledRevenue),
                            TotalInvoiced: (pfbsItem.TotalInvoiced),
                            TotalScheduled: (pfbsItem.TotalScheduled),
                        })
                    } else if (this.selectedRowItem.ScheduleType === 'oop') {
                        pfbsItem.ScheduledOOP = pfbsItem.ScheduledOOP ? parseFloat(pfbsItem.ScheduledOOP.toFixed(2)) + amount : 0 + amount;
                        pfbsItem.InvoicedOOP = pfbsItem.InvoicedOOP ? parseFloat(pfbsItem.InvoicedOOP.toFixed(2)) - amount : 0;
                        pfbsItem.TotalInvoiced = pfbsItem.TotalInvoiced ? parseFloat(pfbsItem.TotalInvoiced.toFixed(2)) - amount : 0;
                        pfbsItem.TotalScheduled = pfbsItem.TotalScheduled ? parseFloat(pfbsItem.TotalScheduled.toFixed(2)) + amount : 0 + amount;
                        pfbs.push({
                            Id: pfbsItem.Id,
                            ScheduledOOP: (pfbsItem.ScheduledOOP),
                            InvoicedOOP: (pfbsItem.InvoicedOOP),
                            TotalInvoiced: (pfbsItem.TotalInvoiced),
                            TotalScheduled: (pfbsItem.TotalScheduled),
                        })
                    }
                });
            }
        // });

        if (pfs.length) {
            for (let pf = 0; pf < pfs.length; pf++) {
                const element = pfs[pf];
                element['__metadata'] = { type: this.constantService.listNames.ProjectFinances.type };
                const pfObj = Object.assign({}, this.queryConfig);
                pfObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinances.name, +element.Id);
                pfObj.listName = this.constantService.listNames.ProjectFinances.name;
                pfObj.type = 'PATCH';
                pfObj.data = element;
                batchUrl.push(pfObj);
            }
        }

        if (pfbs.length) {
            for (let pfb = 0; pfb < pfbs.length; pfb++) {
                const element = pfbs[pfb];
                element['__metadata'] = { type: this.constantService.listNames.ProjectFinanceBreakup.type };
                const pfbObj = Object.assign({}, this.queryConfig);
                pfbObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinanceBreakup.name, +element.Id);
                pfbObj.listName = this.constantService.listNames.ProjectFinanceBreakup.name;
                pfbObj.type = 'PATCH';
                pfbObj.data = element;
                batchUrl.push(pfbObj);
            }
        }

        console.log(batchUrl);
        this.submitForm(batchUrl, 'Detag Project');
    }

    async submitForm(batchUrl, type: string) {
        await this.spServices.executeBatch(batchUrl);
        if(type === 'Detag Project') {
            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.ProjectCode + ' ' + ' Detached successfully from ' + this.parentData.InvoiceNumber , true);
            this.reFetchData();
        }
    }

    async reFetchData() {
        await this.getRequiredData();
        setTimeout(() => {
            this.setCurrentPage(this.currentPageNumber ? this.currentPageNumber : 0);
        }, 1000);
    }

    setCurrentPage(n: number) {
        let paging = {
            first: ((n - 1) * this.paidInvTable.rows),
            rows: this.paidInvTable.rows
        };
        // this.paidInvTable.paginate(paging)
        this.pageNumber = n;
    }

    paginate(event) {
        //event.first: Index of first record being displayed
        //event.rows: Number of rows to display in new page
        //event.page: Index of the new page
        //event.pageCount: Total number of pages
        this.currentPageNumber = event.first;
        let pageIndex = event.first / event.rows + 1 // Index of the new page if event.page not defined.
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (event.target.className === "pi pi-ellipsis-v") {
            if (this.tempClick) {
                this.tempClick.style.display = "none";
                if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
                    this.tempClick = event.target.parentElement.children[0].children[0];
                    this.tempClick.style.display = "";
                } else {
                    this.tempClick = undefined;
                }
            } else {
                this.tempClick = event.target.parentElement.children[0].children[0];
                this.tempClick.style.display = "";
            }

        } else {
            if (this.tempClick) {
                this.tempClick.style.display = "none";
                this.tempClick = undefined;
            }
        }
    }

    isOptionFilter: boolean;
    optionFilter(event: any) {
        if (event.target.value) {
            this.isOptionFilter = false;
        }
    }

    ngAfterViewChecked() {
        if (this.paidInvoicesRes.length && this.isOptionFilter) {
            let obj = {
                tableData: this.paidInvTable,
                colFields: this.outInvoiceColArray
            }
            if (obj.tableData.filteredValue) {
                this.commonService.updateOptionValues(obj);
            } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
                this.createColFieldValues(obj.tableData.value);
                this.isOptionFilter = false;
            }
        }
        this.cdr.detectChanges();
    }



}
