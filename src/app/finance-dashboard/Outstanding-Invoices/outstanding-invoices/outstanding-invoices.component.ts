import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, HostListener, ElementRef, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/Services/common.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-outstanding-invoices',
    templateUrl: './outstanding-invoices.component.html',
    styleUrls: ['./outstanding-invoices.component.css']
})
export class OutstandingInvoicesComponent implements OnInit, OnDestroy {
    tempClick: any;
    outstandingInvoicesRes: any = [];
    outstandingInCols: any[];
    invoiceCols: { field: string; header: string; }[];
    SelectedAuxInvoiceName = '';
    expandedRows: any = {};
    parentData: any;
    // Row Selection Array
    selectedRowData: any[] = [];

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
    sentToAPModal: boolean = false;

    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };
    outstandingInv: any = [];
    // Purchase Order Number
    selectedPurchaseNumber: any;

    // Dispute Reasons
    reasons: any;
    CreditOrDebitNoteType: any;

    // Right side bar
    rightSideBar: boolean = false;
    rightSideBarInvoice: boolean = false;

    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    pageNumber: number = 0;
    // Loader
    isPSInnerLoaderHidden: boolean = false;
    @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', { static: false }) editorRef: EditorComponent;
    @ViewChild('replaceInvoiceFile', { static: false }) replaceInvoiceFile: ElementRef;
    @ViewChild('paymentResolvedFile', { static: false }) paymentResolvedFile: ElementRef;
    @ViewChild('outi', { static: false }) outInvTable: Table;

    // List of Subscribers
    private subscription: Subscription = new Subscription();
    SelectedFile: any;
    FolderName: string;
    editAuxiliary = false;
    DisplayInvoiceWithAuxiliaryArray = [];
    iliByidRes: any = [];
    pfresp: any = [];
    pfbresp: any = [];
    proformaData: any = [];
    poItem: any = [];

    constructor(
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        public dialogService: DialogService,
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
        const currentUserId = this.globalService.currentUser.userId;
        //Get  User Info
        this.currentUserInfo(currentUserId);

        // POC & PO Number
        this.projectContacts();
        this.poInfo();
        this.cleInfo();
        this.getReasons();
        this.getTypes();
        this.resourceCInfo();

        this.createOutstandingInvoiceCols();
        // this.getOutstandingData();

        // Create FOrm Field
        this.createPaymentResovedFormField();
        this.createDisputeInvoiceFormField();
        this.createReplaceInvoiceFormField();
        this.createCreditDebitFormField();

        // Get details
        this.getRequiredData();
        //will set table to given page number
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

    //  Purchase Order Number
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
        this.subscription.add(this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
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

    setCurrentPage(n: number) {
        let paging = {
            first: ((n - 1) * this.outInvTable.rows),
            rows: this.outInvTable.rows
        };
        // this.outInvTable.paginate(paging)
        this.pageNumber = n;
    }
    currentPageNumber: number;
    paginate(event) {
        //event.first: Index of first record being displayed
        //event.rows: Number of rows to display in new page
        //event.page: Index of the new page
        //event.pageCount: Total number of pages
        this.currentPageNumber = event.first;
        let pageIndex = event.first / event.rows + 1 // Index of the new page if event.page not defined.
    }

    getReasons() {
        this.reasons = [
            { label: 'Incorrect Invoice', value: 'Incorrect Invoice' },
            { label: 'Quality Complaint', value: 'Quality Complaint' },
        ]
    }

    getTypes() {
        this.CreditOrDebitNoteType = [
            { label: 'Credit Note', value: 'Credit Note' },
            { label: 'Debit Note', value: 'Debit Note' },
        ]
    }

    createPaymentResovedFormField() {
        this.paymentResoved_form = this.fb.group({
            file: ['', [Validators.required]]
        })
    }

    createDisputeInvoiceFormField() {
        this.disputeInvoice_form = this.fb.group({
            DisputeReason: ['', [Validators.required]],
            DisputeComments: ['', [Validators.required]]
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
            Status: ['']
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


    createOutstandingInvoiceCols() {
        this.outstandingInCols = [
            { field: 'ClientLegalEntity', header: 'Client', visibility: true },
            { field: 'InvoiceStatus', header: 'Invoice Status', visibility: true },
            { field: 'DisplayInvoiceWithAuxiliary', header: 'Invoice Number', visibility: true },
            { field: 'POName', header: 'PO Name', visibility: true },
            { field: 'PONumber', header: 'PO Number', visibility: true },
            { field: 'InvoiceDate', header: 'Invoice Date', visibility: true, exportable: false },
            { field: 'InvoiceDateFormat', header: 'Invoice Date', visibility: false },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POC', header: 'POC', visibility: true },
            { field: 'ModifiedBy', header: 'Modified By', visibility: true },
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
        this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoice', 'getUserInfo');
        let currentUsrInfo = await this.spServices.getUserInfo(userId);
        this.loggedInUserInfo = currentUsrInfo.Groups.results;
        this.loggedInUserInfo.forEach(element => {
            if (element) {
                this.loggedInUserGroup.push(element.LoginName);
            }
        });
    }

    // Get Proformas InvoiceItemList

    async getRequiredData() {
        this.expandedRows = {};
        const outInvObj = Object.assign({}, this.fdConstantsService.fdComponent.invoicesForMangerIT);
        this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoices', 'invoicesForMangerIT');
        const res = await this.spServices.readItems(this.constantService.listNames.Invoices.name, outInvObj);
        const arrResults = res.length ? res : [];
        this.formatData(arrResults);
        this.setCurrentPage(0);

        setTimeout(() => {
            this.isPSInnerLoaderHidden = true;
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        }, 300);

    }

    async formatData(data: any[]) {
        this.outstandingInvoicesRes = [];
        this.selectedRowData = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = this.getPONumber(element);
            this.outstandingInvoicesRes.push({
                Id: element.ID,
                Amount: element.Amount,
                AddressType: element.AddressType,
                ClientLegalEntity: element.ClientLegalEntity,
                Currency: element.Currency,
                FileURL: element.FileURL,
                // FiscalYear: element.FiscalYear,
                InvoiceDate: new Date(this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyyy')),
                InvoiceDateFormat: this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyyy, hh:mm a'),
                InvoiceNumber: element.InvoiceNumber,
                AuxiliaryInvoiceName: element.AuxiliaryInvoiceName ? element.AuxiliaryInvoiceName : '',
                DisplayInvoiceWithAuxiliary: element.AuxiliaryInvoiceName ? element.InvoiceNumber + ' - ' + element.AuxiliaryInvoiceName : element.InvoiceNumber,
                MainPOC: element.MainPOC,
                InvoiceStatus: element.Status,
                PONumber: poItem.Number,
                POName: poItem.NameST,
                POC: this.getPOCName(element),
                PO: element.PO,
                Title: element.InvoiceTitle,
                Template: element.Template,
                InvoiceHtml: element.InvoiceHtml,
                showMenu: true, // (element.Status === 'Sent to AP' || element.Status === 'Generated') ?  true : false
                PaymentURL: element.PaymentURL,
                ProformaLookup: element.ProformaLookup,
                DisputeReason: element.DisputeReason,
                DisputeComments: element.DisputeComments,
                Reason: element.Reason,
                State: element.State,
                AdditionalInfo: element.AdditionalInfo,
                InvoiceType: element.InvoiceType,
                TaggedAmount: element.TaggedAmount,
                IsTaggedFully: element.IsTaggedFully,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                AdditionalPOC: element.AdditionalPOC,
                Created: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            });
        }
        this.outstandingInvoicesRes = [...this.outstandingInvoicesRes];
        this.createColFieldValues(this.outstandingInvoicesRes);
        if (this.outInvTable.filteredValue && this.outInvTable.filters.DisplayInvoiceWithAuxiliary) {
            this.DisplayInvoiceWithAuxiliaryArray = this.outstandingInvoicesRes.filter(c => this.outInvTable.filters.DisplayInvoiceWithAuxiliary.value.includes(c.DisplayInvoiceWithAuxiliary)) ? this.outstandingInvoicesRes.filter(c => this.outInvTable.filters.DisplayInvoiceWithAuxiliary.value.includes(c.DisplayInvoiceWithAuxiliary)).map(c => c.DisplayInvoiceWithAuxiliary) : [];
            this.outInvTable.filter(this.DisplayInvoiceWithAuxiliaryArray, 'DisplayInvoiceWithAuxiliary', 'in')
        }
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
        return found ? found.Title : ''
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
        ClientLegalEntity: [],
        InvoiceStatus: [],
        DisplayInvoiceWithAuxiliary: [],
        PONumber: [],
        POName: [],
        InvoiceDate: [],
        Amount: [],
        POC: [],
        Currency: [],
        ModifiedBy: [],
    }

    createColFieldValues(resArray) {
        this.outInvoiceColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.InvoiceStatus = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.InvoiceStatus, value: a.InvoiceStatus }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.DisplayInvoiceWithAuxiliary = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DisplayInvoiceWithAuxiliary, value: a.DisplayInvoiceWithAuxiliary }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.PONumber = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.POName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POName, value: a.POName }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.ModifiedBy = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b; }).filter(ele => ele.label)));
        const invoiceDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.InvoiceDate, 'MMM dd, yyyy'), value: a.InvoiceDate }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.InvoiceDate = invoiceDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        const amount = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
        this.outInvoiceColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label');
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
        cnf1.exportCSV();
    }

    items: any[];
    contextMenu: boolean = false;
    // Open popups
    openPopup(data, popUpData) {
        this.contextMenu = false;
        console.log('Row data  ', data);
        let invoiceSts: string = '';
        this.items = [];
        if (data.InvoiceStatus) {
            invoiceSts = data.InvoiceStatus.toLowerCase();
        }

        if(data.InvoiceType == 'oop' || data.InvoiceType == 'revenue') {
            switch (invoiceSts) {
                case 'sent to ap': {
                    this.items.push(
                        // { label: 'Export Invoice', command: (e) => this.openMenuContent(e, data) },
                        { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) },
                        // { label: 'Dispute Invoice', command: (e) => this.openMenuContent(e, data) },
                        // { label: 'Mark as Debit/Credit Note', command: (e) => this.openMenuContent(e, data) },
                        { label: 'Replace Invoice', command: (e) => this.openMenuContent(e, data) },
                    );
    
                    if (data.InvoiceHtml) {
                        this.items.push({ label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) });
                    }
                    break;
                }
                case 'generated': {
                    this.items.push(
                        { label: 'Sent to AP', command: (e) => this.openMenuContent(e, data) },
                        { label: 'Replace Invoice', command: (e) => this.openMenuContent(e, data) },
                    );
                    if (data.InvoiceHtml) {
                        this.items.push({ label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) });
                    }
                    break;
                }
                case 'dispute': {
                    this.items.push(
                        { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) });
                    break;
                }
                default: {
                    this.items = [];
                    break;
                }
            }
            if (!data.FileURL && data.ProformaLookup && (data.Template === 'US' || data.Template === 'India' || data.Template === 'Japan')) {
                this.items.push({ label: 'Regenerate Invoice', command: (e) => this.openMenuContent(e, data) });
            }
    
            if (data.InvoiceStatus === this.constantService.STATUS.GENERATED || data.InvoiceStatus === this.constantService.STATUS.SENTTOAP) {
                this.items.push({ label: 'Edit Invoice Number', command: (e) => this.openMenuContent(e, data) })
            }
        } else {
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
            popUpData.visible = false;
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
        this.selectedRowData = [data];
        console.log(event);
        this.confirmDialog.title = event.item.label;

        if(data.InvoiceType == 'oop' || data.InvoiceType == 'revenue') {
            if (this.confirmDialog.title.toLowerCase() === 'mark as payment resolved') {
                this.paymentResovedModal = true;
            } else if (this.confirmDialog.title.toLowerCase() === 'dispute invoice') {
                this.disputeInvoiceModal = true;
            } else if (this.confirmDialog.title.toLowerCase() === 'replace invoice') {
                this.replaceInvoiceModal = true;
            } else if (this.confirmDialog.title.includes("Debit/Credit Note")) {
                this.creditOrDebitModal = true;
            } else if (this.confirmDialog.title.toLowerCase() === 'sent to ap') {
                this.sentToAPModal = true;
            } else if (this.confirmDialog.title.toLowerCase() === 'show history') {
                this.timeline.showTimeline(data.Id, 'FD', this.constantService.listNames.Invoices.name);
            } else if (event.item.label === 'Details') {
                this.rightSideBar = !this.rightSideBar;
                return;
            } else if (this.confirmDialog.title === 'Edit Line item') {
                const invObj = JSON.parse(data.InvoiceHtml);
                if (invObj.hasOwnProperty('saveObj')) {
                    this.fdConstantsService.fdComponent.selectedEditObject.Code = data.InvoiceNumber;
                    const oCLE = this.cleData.find(e => e.Title === data.ClientLegalEntity);
                    this.fdConstantsService.fdComponent.selectedEditObject.ListName = oCLE.ListName;
                    this.fdConstantsService.fdComponent.selectedEditObject.ID = data.Id;
                    this.fdConstantsService.fdComponent.selectedEditObject.Type = 'Invoice';
                    this.fdConstantsService.fdComponent.selectedComp = this;
                    //invObj.saveObj.serviceDetailHeader = 'INVOICE DETAILS';
                    this.editorRef.serviceDetailHeader = 'INVOICE DETAILS';
                    switch (data.Template) {
                        case 'US':
                            this.editorRef.JapanTemplateCopy = {};
                            this.editorRef.IndiaTemplateCopy = {};
                            this.editorRef.USTemplateCopy = invObj.saveObj;
                            if (this.editorRef.USTemplateCopy.appendix) {
                                this.editorRef.showAppendix = true;
                                this.setAppendixCol(this.editorRef.USTemplateCopy.appendix);
                            } else {
                                this.editorRef.showAppendix = false;
                            }
                            this.editorRef.displayJapan = false;
                            this.editorRef.displayUS = true;
                            this.editorRef.displayIndia = false;
                            this.editorRef.enableButton();
                            break;
                        case 'Japan':
                            this.editorRef.USTemplateCopy = {};
                            this.editorRef.IndiaTemplateCopy = {};
                            this.editorRef.JapanTemplateCopy = invObj.saveObj;
                            if (this.editorRef.JapanTemplateCopy.appendix) {
                                this.editorRef.showAppendix = true;
                                this.setAppendixCol(this.editorRef.JapanTemplateCopy.appendix);
                            } else {
                                this.editorRef.showAppendix = false;
                            }
                            this.editorRef.displayJapan = true;
                            this.editorRef.displayUS = false;
                            this.editorRef.displayIndia = false;
                            this.editorRef.enableButton();
                            break;
                        case 'India':
    
                            this.editorRef.JapanTemplateCopy = {};
                            this.editorRef.USTemplateCopy = {};
                            this.editorRef.IndiaTemplateCopy = invObj.saveObj;
                            if (this.editorRef.IndiaTemplateCopy.appendix) {
                                this.editorRef.showAppendix = true;
                                this.setAppendixCol(this.editorRef.IndiaTemplateCopy.appendix);
                            } else {
                                this.editorRef.showAppendix = false;
                            }
                            this.editorRef.displayJapan = false;
                            this.editorRef.displayUS = false;
                            this.editorRef.displayIndia = true;
                            this.editorRef.enableButton();
                            break;
                    }
                }
                // this.pdfEditor.getInvoiceData(JSON.parse(data.ProformaHtml));
            }
            else if (this.confirmDialog.title === 'Edit Invoice Number') {
    
                this.SelectedAuxInvoiceName = this.selectedRowItem.AuxiliaryInvoiceName;
                this.editAuxiliary = true;
            } else if (this.confirmDialog.title === 'Regenerate Invoice') {
                this.generateExistingInvoice(data);
            } 
        } else {
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
                const pname = poItem.NameST ? poItem.NameST : '';
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
                    POName: poItem.NameST,
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

    // async getProforma(lineItem) {
    //     const prfObj = Object.assign({}, this.fdConstantsService.fdComponent.proformaForUser);
    //     prfObj.filter = prfObj.filter.replace('{{ItemID}}', lineItem.ProformaLookup);
    //     const res = await this.spServices.readItems(this.constantService.listNames.Proforma.name, prfObj);
    //     this.proformaData = res.length ? res[0] : [];
    // }

    // async getPOData(lineItem) {
    //     const poObj = Object.assign({}, this.fdConstantsService.fdComponent.GET_PO_BY_ID);
    //     poObj.filter = poObj.filter.replace('{{ItemID}}', lineItem.PO);
    //     const res = await this.spServices.readItems(this.constantService.listNames.PO.name, poObj);
    //     this.poItem = res.length ? res[0] : [];
    // }

    // async getInvoiceLineItemByID() {
    //     this.iliByidRes = [];
    //     // this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
    //     const iliObj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItemByInvoice);
    //     iliObj.filter = iliObj.filter.replace('{{itemId}}', this.selectedRowItem.InvoiceLookup);
    //     this.commonService.SetNewrelic('Finance-Dashboard', 'Invoices', 'GetInviceLineItem');
    //     const res = await this.spServices.readItems(this.constantService.listNames.Invoices.name, iliObj);
    //     const arrResults = res.length ? res : [];
    //     // if (arrResults.length) {
    //     // console.log(arrResults[0]);
    //     this.iliByidRes = arrResults;
    //     console.log('this.iliByidRes ', this.iliByidRes);

    //     this.getFinanceListData(this.iliByidRes[0]);
    //     // }
    //     // this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    // }

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

        // console.log(batchUrl);
        this.submitForm(batchUrl, 'Detag Project');
    }

    async detagInvoice() {
        await this.getFinanceListData();
    }
    
    setAppendixCol(sContent) {
        var oDiv = document.createElement('div');
        oDiv.innerHTML = sContent;
        var oTable = oDiv.querySelector('table');
        if (oTable) {
            let colNumber = '';
            const count = oTable.rows[0].cells.length;
            switch (count) {
                case 3:
                    colNumber = 'col3';
                    break;
                case 4:
                    colNumber = 'col4';
                    break;
                case 5:
                    colNumber = 'col5';
                    break;
                default:
                    break;
            }
            this.editorRef.setColumnClass(colNumber);
        }
        else {
            this.editorRef.setColumnClass('');
        }
    }

    getCLEListNameFromCLE(cleName) {
        let found = this.cleData.find((x) => {
            if (x.Title === cleName) {
                return x;
            }
        })
        return found ? found.ListName : ''
    }

    //*************************************************************************************************
    // new File uplad function updated by Maxwell
    // ************************************************************************************************


    // selectedFile: any;
    filePathUrl: any;
    // fileReader: any;
    onFilePaymentChange(event, folderName) {
        console.log("Event ", event);
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.replaceInvoiceFile.nativeElement.value = '';
                this.paymentResoved_form.get('file').setValue('');
                this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.SpecialCharMsg, false);
                return false;
            }
            let cleListName = this.getCLEListNameFromCLE(this.selectedRowData[0].ClientLegalEntity)
            this.FolderName = cleListName + '/Finance/' + folderName;
            this.SelectedFile.push(new Object({ name: this.selectedFile.name, file: this.selectedFile }));
        }
    }

    // Replace File
    selectedFile: any;
    FilePathUrl: any;
    fileReader: any;
    onFileChange(event) {
        let existingFile = this.selectedRowItem.FileURL ? this.selectedRowItem.FileURL.split('/') : [];
        if (existingFile.length) {
            let file = existingFile[existingFile.length - 1];
            // let fileName = file.substr(0, file.indexOf('.'));
            console.log('fileName  ', file);
            if (file === event.target.files[0].name) {

                this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.FileAlreadyExist, false);
                this.replaceInvoice_form.reset();
                return;
            }
        }
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.replaceInvoiceFile.nativeElement.value = '';
                this.replaceInvoice_form.get('file').setValue('');
                this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.SpecialCharMsg, false);
                return false;
            }
            let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity)
            this.FolderName = cleListName + '/Finance/Invoice/Client';
            this.SelectedFile.push(new Object({ name: this.selectedFile.name, file: this.selectedFile }));
        }
    }

    async uploadFileData(type) {
        const batchUrl = [];
        this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoices' + type, 'uploadFile');

        this.commonService.UploadFilesProgress(this.SelectedFile, this.FolderName, true).then(async uploadedfile => {
            if (this.SelectedFile.length > 0 && this.SelectedFile.length === uploadedfile.length) {
                if (uploadedfile[0].hasOwnProperty('odata.error') || uploadedfile[0].hasError) {
                    this.submitBtn.isClicked = false;
                    this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.FileNotUploaded, false);
                } else if (uploadedfile[0].ServerRelativeUrl) {
                    let invData;
                    this.isPSInnerLoaderHidden = false;
                    if (type === 'creditDebit') {
                        this.submitDebitCreditNoteForm(type, uploadedfile[0].ServerRelativeUrl);
                    }
                    else {
                        if (type === 'replaceInvoice') {
                            invData = {
                                FileURL: uploadedfile[0].ServerRelativeUrl ? uploadedfile[0].ServerRelativeUrl : '',
                                InvoiceHtml: null
                            }
                        }
                        else if (type === 'paymentResoved') {
                            invData = {
                                Status: 'Paid',
                                PaymentURL: uploadedfile[0].ServerRelativeUrl ? uploadedfile[0].ServerRelativeUrl : ''
                            };
                        }

                        for (let i = 0; i < this.selectedRowData.length; i++) {
                            const element = this.selectedRowData[i];
                            
                            // if(type === 'paymentResoved') {
                            //     invData = {
                            //         Status: 'Paid',
                            //         PaymentURL: uploadedfile[0].ServerRelativeUrl ? uploadedfile[0].ServerRelativeUrl : ''
                            //     };
                            // }
                            invData['__metadata'] = { type: this.constantService.listNames.Invoices.type };
                            const invObj = Object.assign({}, this.queryConfig);
                            invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +element.Id);
                            invObj.listName = this.constantService.listNames.Invoices.name;
                            invObj.type = 'PATCH';
                            invObj.data = invData;
                            batchUrl.push(invObj);
                        }

                        // console.log(batchUrl);

                        this.submitForm(batchUrl, type);
                    }
                }
            }
        });
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
        } else if (formType === 'sentToAP') {
            this.sentToAPModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onCorDChange(data: any) {
        console.log(data);
        let item = data.value;
        if (item.value === 'Credit Note') {
            this.creditOrDebitNote_form.controls['Status'].setValue(this.constantService.invoicesStatus.AwaitingClosedCreditNote);
        } else if (item.value === 'Debit Note') {
            this.creditOrDebitNote_form.controls['Status'].setValue(this.constantService.invoicesStatus.AwaitingClosedDebitNote);
        }
        // this.creditOrDebitNote_form.get('Status').setValue('');
        // this.getPONumberFromCLE(data.value.Title);
        // this.generateProformaNumber(cleItem);
        // this.getPOCNamesForEditInv(data.value);
    }

    async onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        const batchUrl = [];
        if (type === 'paymentResoved') {
            if (this.paymentResoved_form.invalid) {
                return;
            } else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }

            this.submitBtn.isClicked = true;
            this.uploadFileData(type);
            // console.log('form is submitting ..... & Form data is ', this.paymentResoved_form.value);
        } else if (type === 'disputeInvoice') {
            if (this.disputeInvoice_form.invalid) {
                return;
            }
            // console.log('form is submitting ..... & Form data is ', this.disputeInvoice_form.value);
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            const disputeData = {
                DisputeReason: this.disputeInvoice_form.value.DisputeReason.value,
                DisputeComments: this.disputeInvoice_form.value.DisputeComments
            };
            disputeData['__metadata'] = { type: this.constantService.listNames.Invoices.type };

            const invObj = Object.assign({}, this.queryConfig);
            invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.selectedRowItem.Id);
            invObj.listName = this.constantService.listNames.Invoices.name;
            invObj.type = 'PATCH';
            invObj.data = disputeData;
            batchUrl.push(invObj);
            this.submitForm(batchUrl, type);
        } else if (type === 'replaceInvoice') {
            if (this.replaceInvoice_form.invalid) {
                return;
            }
            else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            // console.log('form is submitting ..... & Form data is ', this.replaceInvoice_form.value);
            this.submitBtn.isClicked = true;
            this.uploadFileData(type);
        } else if (type === 'creditDebit') {
            if (this.creditOrDebitNote_form.invalid) {
                return;
            }
            else if (this.selectedFile && this.selectedFile.size === 0) {
                this.errorMessage();
                return;
            }
            this.uploadFileData(type);
        } else if (type === 'sentToAP') {
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            // this.selectedRowData = [this.selectedRowItem]

            for (let i = 0; i < this.selectedRowData.length; i++) {
                const element = this.selectedRowData[i];

                const sts = this.constantService.invoicesStatus.SentToAP;
                const invData = {
                    __metadata: {
                        type: this.constantService.listNames.Invoices.type
                    },
                    Status: sts
                };
                const invObj = Object.assign({}, this.queryConfig);
                invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, element.Id);
                invObj.listName = this.constantService.listNames.Invoices.name;
                invObj.type = 'PATCH';
                invObj.data = invData;
                batchUrl.push(invObj);
            }

            // const sts = this.constantService.invoicesStatus.SentToAP;
            // // sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            // const invData = {
            //     __metadata: {
            //         type: this.constantService.listNames.Invoices.type
            //     },
            //     Status: sts
            // };
            // const invObj = Object.assign({}, this.queryConfig);
            // invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.selectedRowItem.Id);
            // invObj.listName = this.constantService.listNames.Invoices.name;
            // invObj.type = 'PATCH';
            // invObj.data = invData;
            // batchUrl.push(invObj);
            console.log(batchUrl);
            this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoices', 'submitForm');
            this.submitForm(batchUrl, type);
        }
        else if (type === 'AuxiliaryUpdate') {

            if (this.SelectedAuxInvoiceName.trim() === '' || this.SelectedAuxInvoiceName.length > 30) {

                const errorMessage = this.SelectedAuxInvoiceName.trim() === '' ? 'Please enter Auxiliary Name' : 'Maximum 30 character allowed.'

                this.commonService.showToastrMessage(this.constantService.MessageType.error, errorMessage, false);
                return false;
            }
            else {
                this.editAuxiliary = false;
                this.isPSInnerLoaderHidden = false;
                this.submitBtn.isClicked = true;
                const invObj = Object.assign({}, this.queryConfig);
                invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.selectedRowItem.Id);
                invObj.listName = this.constantService.listNames.Invoices.name;
                invObj.type = 'PATCH';
                invObj.data = {
                    __metadata: {
                        type: this.constantService.listNames.Invoices.type
                    },
                    AuxiliaryInvoiceName: this.SelectedAuxInvoiceName
                };
                batchUrl.push(invObj);

                this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoices', 'submitForm');
                this.submitForm(batchUrl, type);
            }

        } else if(type === 'Detag Project') {
            this.detagInvoice();
        }
    }


    errorMessage() {
        this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.ZeroKbFile.replace('{{fileName}}', this.selectedFile.name), false);
    }

    submitDebitCreditNoteForm(type: string, pathURL) {
        const batchUrl = [];
        const debitCreditData = {
            Title: this.creditOrDebitNote_form.value.Number,
            Amount: this.creditOrDebitNote_form.value.Amount,
            Currency: this.selectedRowItem.Currency,
            PO: this.selectedRowItem.PO,
            FileURL: pathURL,
            CreditDebitType: this.creditOrDebitNote_form.value.Type,
            AdditionalInfo: this.creditOrDebitNote_form.value.Comments,
            Status: this.creditOrDebitNote_form.value.Status,
            OriginatedInvoiceLookup: this.selectedRowItem.Id,
            LinkedInvoiceLookup: this.selectedRowItem.Id
        }
        debitCreditData['__metadata'] = { type: this.constantService.listNames.CreditAndDebit.type };
        const debCreditObj = Object.assign({}, this.queryConfig);
        debCreditObj.url = this.spServices.getReadURL(this.constantService.listNames.CreditAndDebit.name);
        debCreditObj.listName = this.constantService.listNames.CreditAndDebit.name;
        debCreditObj.type = 'POST';
        debCreditObj.data = debitCreditData;
        batchUrl.push(debCreditObj);
        // const endpoint = this.fdConstantsService.fdComponent.addUpdateCreditDebit.createCD;
        const invData = {
            Status: this.creditOrDebitNote_form.value.Status
        };
        invData['__metadata'] = { type: this.constantService.listNames.Invoices.type };
        const invObj = Object.assign({}, this.queryConfig);
        invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.selectedRowItem.Id);
        invObj.listName = this.constantService.listNames.Invoices.name;
        invObj.type = 'PATCH';
        invObj.data = invData;
        batchUrl.push(invObj);
        // const endpoint2 = this.fdConstantsService.fdComponent.addUpdateInvoice.update.replace("{{Id}}", this.selectedRowItem.Id);
        // let data = [
        //     {
        //         objData: obj,
        //         endpoint: endpoint,
        //         requestPost: true
        //     },
        //     {
        //         objData: obj2,
        //         endpoint: endpoint2,
        //         requestPost: false
        //     },
        // ];
        this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoices', 'submitDebitCreditNoteForm');
        this.submitForm(batchUrl, type);
    }

    // batchContents: any = [];
    async submitForm(batchUrl, type: string) {
        await this.spServices.executeBatch(batchUrl);
        if (type === "creditDebit") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Success.', true);
            this.creditOrDebitModal = false;
            this.reFetchData();
        } else if (type === "sentToAP") {

            // this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Invoice Status Changed.', true);
            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Invoice Status Changed.', true);
            this.sentToAPModal = false;
            this.reFetchData();
        } else if (type === "disputeInvoice") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Submitted.', true);
            this.disputeInvoiceModal = false;
        } else if (type === "paymentResoved") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Payment receipts uploaded successfully.', true);
            this.paymentResovedModal = false;
            this.reFetchData();
        } else if (type === "replaceInvoice") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Success.', true);
            this.replaceInvoiceModal = false;
            this.reFetchData();
        }
        else if (type === "AuxiliaryUpdate") {


            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Auxiliary Name for ' + this.selectedRowItem.InvoiceNumber + ' ' + ' updated sucessfully.', true);
            this.formSubmit.isSubmit = false;
            this.submitBtn.isClicked = false;
            this.reFetchData();
        } else if(type === 'Detag Project') {
            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.ProjectCode + ' ' + ' Detached successfully from ' + this.parentData.InvoiceNumber , true);
            this.reFetchData();
        }

        // });
    }

    async reFetchData() {
        await this.getRequiredData();
        setTimeout(() => {
            this.setCurrentPage(this.currentPageNumber ? this.currentPageNumber : 0);
        }, 1000);
    }

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
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
        if (this.outstandingInvoicesRes.length && this.isOptionFilter) {
            let obj = {
                tableData: this.outInvTable,
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


    //*************************************************************************************************
    // regenerate invoice for line item
    // ************************************************************************************************


    async  generateExistingInvoice(lineItem) {

        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const prfObj = Object.assign({}, this.fdConstantsService.fdComponent.proformaForUser);
        prfObj.filter = prfObj.filter.replace('{{ItemID}}', lineItem.ProformaLookup);
        this.commonService.SetNewrelic('Finance-Dashboard', 'outstanding-invoices', 'generateExistingInvoice');
        const res = await this.spServices.readItems(this.constantService.listNames.Proforma.name, prfObj);
        const proforma = res.length ? res[0] : [];
        if (proforma.ProformaHtml) {
            proforma.ProformaNumber = proforma.Title;
            const response = await this.fdDataShareServie.createInvoice(proforma.ProformaHtml, proforma, lineItem, this.cleData);
            if (response) {
                this.reFetchData();
                this.commonService.showToastrMessage(this.constantService.MessageType.success, lineItem.InvoiceNumber + 'created sucessfully.', true);
            }
            else {
                console.log('Json parse Issue');
                this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
            }
        }
        else {

            this.commonService.showToastrMessage(this.constantService.MessageType.error, 'Unable to generate invoice for ' + lineItem.InvoiceNumber + ', proforma html not found.', true);
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        }

    }

    sentToAP() {
        if (this.selectedRowData.length) {
            const filterData = this.selectedRowData.filter(e=> e.InvoiceStatus !== 'Generated');
            if(!filterData.length) {
                this.sentToAPModal = true;
            } else {
                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select only those Row Item whose Invoices is Generated. ', false);
            }
        } else {
            this.isPSInnerLoaderHidden = true;
            this.submitBtn.isClicked = false;
            this.sentToAPModal = false;
            this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select one of Row Item & try again.', false);
        }
    }

    uploadReceipts() {
        if (this.selectedRowData.length) {
            const filterData = this.selectedRowData.filter(e=> e.InvoiceStatus !== 'Sent to AP');
            const cle = this.selectedRowData[0].ClientLegalEntity;
            const cleCheck = this.selectedRowData.filter(c=> c.ClientLegalEntity !== cle ); 
            if(!filterData.length && !cleCheck.length) {
                this.paymentResovedModal = true;
            } else {
                if(cleCheck.length) {
                    this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select only those Row Item whose Client is Similar. ', false);
                } else {
                    this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select only those Row Item whose Invoices is Sent to AP. ', false);
                }
            }
        } else {
            this.isPSInnerLoaderHidden = true;
            this.submitBtn.isClicked = false;
            this.paymentResovedModal = false;
            this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select one of Row Item & try again.', false);
        }
    }

}
