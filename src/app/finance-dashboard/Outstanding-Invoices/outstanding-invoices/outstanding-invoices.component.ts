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
import { DialogService } from 'primeng';

@Component({
    selector: 'app-outstanding-invoices',
    templateUrl: './outstanding-invoices.component.html',
    styleUrls: ['./outstanding-invoices.component.css']
})
export class OutstandingInvoicesComponent implements OnInit, OnDestroy {
    tempClick: any;
    outstandingInvoicesRes: any = [];
    outstandingInCols: any[];
    SelectedAuxInvoiceName = '';
    // Row Selection Array
    selectedRowData: any = [];

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

        switch (invoiceSts) {
            case 'sent to ap': {
                this.items = [
                    // { label: 'Export Invoice', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) },
                    // { label: 'Dispute Invoice', command: (e) => this.openMenuContent(e, data) },
                    // { label: 'Mark as Debit/Credit Note', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Replace Invoice', command: (e) => this.openMenuContent(e, data) },
                ];

                if (data.InvoiceHtml) {
                    this.items.push({ label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) });
                }
                break;
            }
            case 'generated': {
                this.items = [
                    { label: 'Sent to AP', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Replace Invoice', command: (e) => this.openMenuContent(e, data) },
                ];
                if (data.InvoiceHtml) {
                    this.items.push({ label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) });
                }
                break;
            }
            case 'dispute': {
                this.items = [
                    { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) }]
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
        console.log(event);
        this.confirmDialog.title = event.item.label;
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
            let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity)
            this.FolderName = cleListName + '/Finance/Invoice/' + folderName;
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
                        invData['__metadata'] = { type: this.constantService.listNames.Invoices.type };
                        const invObj = Object.assign({}, this.queryConfig);
                        invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.selectedRowItem.Id);
                        invObj.listName = this.constantService.listNames.Invoices.name;
                        invObj.type = 'PATCH';
                        invObj.data = invData;
                        batchUrl.push(invObj);
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
            const sts = this.constantService.invoicesStatus.SentToAP;
            // sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            const invData = {
                __metadata: {
                    type: this.constantService.listNames.Invoices.type
                },
                Status: sts
            };
            const invObj = Object.assign({}, this.queryConfig);
            invObj.url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, +this.selectedRowItem.Id);
            invObj.listName = this.constantService.listNames.Invoices.name;
            invObj.type = 'PATCH';
            invObj.data = invData;
            batchUrl.push(invObj);

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

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Invoice Status Changed.', true);
            this.sentToAPModal = false;
            this.reFetchData();
        } else if (type === "disputeInvoice") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Submitted.', true);
            this.disputeInvoiceModal = false;
        } else if (type === "paymentResoved") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.InvoiceNumber + ' ' + 'Success.', true);
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



}
