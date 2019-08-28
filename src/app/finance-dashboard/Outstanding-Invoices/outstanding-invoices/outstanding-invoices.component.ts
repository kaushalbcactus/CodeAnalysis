import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
import { Message, ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { NodeService } from 'src/app/node.service';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/Services/common.service';

@Component({
    selector: 'app-outstanding-invoices',
    templateUrl: './outstanding-invoices.component.html',
    styleUrls: ['./outstanding-invoices.component.css']
})
export class OutstandingInvoicesComponent implements OnInit, OnDestroy {
    tempClick: any;
    outstandingInvoicesRes: any = [];
    outstandingInCols: any[];
    msgs: Message[] = [];

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
    }
    submitBtn: any = {
        isClicked: false
    }

    // Purchase Order Number
    selectedPurchaseNumber: any;

    // Dispute Reasons
    reasons: any;
    CreditOrDebitNoteType: any;

    // Right side bar
    rightSideBar: boolean = false;

    // Loader
    isPSInnerLoaderHidden: boolean = false;
    @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', { static: true }) editorRef: EditorComponent;

    // List of Subscribers 
    private subscription: Subscription = new Subscription();

    constructor(
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private messageService: MessageService,
        private nodeService: NodeService,
        private commonService: CommonService,
    ) { }

    ngOnInit() {
        //Get  User Info 
        this.currentUserInfo();

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
            { field: 'ClientLegalEntity', header: 'Client LE', visibility: true },
            { field: 'InvoiceStatus', header: 'Invoice Status', visibility: true },
            { field: 'InvoiceNumber', header: 'Invoice Number', visibility: true },
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
            // { field: 'ProformaLookup', header: 'Proforma Lookup', visibility: false },
            // { field: 'LineItemsLookup', header: 'LineItems Lookup', visibility: false },
            { field: 'DisputeReason', header: 'Dispute Reason', visibility: false },
            { field: 'DisputeComments', header: 'Dispute Comments', visibility: false },
            { field: 'Reason', header: 'Reason', visibility: false },
            { field: 'State', header: 'State', visibility: false },
            { field: 'AdditionalInfo', header: 'Additional Info', visibility: false },
            { field: 'InvoiceType', header: 'Invoice Type', visibility: false },
            { field: 'TaggedAmount', header: 'Tagged Amount', visibility: false },
            { field: 'IsTaggedFully', header: 'Is Tagged Fully', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            // { field: 'AdditionalPOC', header: 'Additional POC', visibility: false },
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
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let invoicesQuery = '';
        if (true) {
            invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.OutInvoices.name + '', this.fdConstantsService.fdComponent.invoicesForMangerIT);
        } else {
            invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.OutInvoices.name + '', this.fdConstantsService.fdComponent.invoicesForNonManger);
        }
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
        const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        console.log('REs in Outstanding Invoice ', res);
        arrResults = res;
        if (arrResults.length) {
            this.formatData(arrResults[0]);
            console.log(arrResults);
        }
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });
    }

    async formatData(data: any[]) {
        this.outstandingInvoicesRes = [];
        this.selectedRowData = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = this.getPONumber(element);
            // let resCInfo = await this.fdDataShareServie.getResDetailById(this.rcData, element);
            // if (resCInfo && resCInfo.hasOwnProperty('UserName') && resCInfo.UserName.hasOwnProperty('Title')) {
            //     resCInfo = resCInfo.UserName.Title
            // }
            this.outstandingInvoicesRes.push({
                Id: element.ID,
                Amount: element.Amount,
                AddressType: element.AddressType,
                ClientLegalEntity: element.ClientLegalEntity,
                Currency: element.Currency,
                FileURL: element.FileURL,
                FiscalYear: element.FiscalYear,
                InvoiceDate: new Date(this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyyy')),
                InvoiceDateFormat: this.datePipe.transform(element.InvoiceDate, 'MMM dd, yyyy, hh:mm a'),
                InvoiceNumber: element.InvoiceNumber,
                MainPOC: element.MainPOC,
                InvoiceStatus: element.Status,
                PONumber: poItem.Number,
                POName: poItem.Name,
                POC: this.getPOCName(element),
                PO: element.PO,
                Title: element.InvoiceTitle,
                Template: element.Template,
                InvoiceHtml: element.InvoiceHtml,
                showMenu: true, // (element.Status === 'Sent to AP' || element.Status === 'Generated') ?  true : false
                PaymentURL: element.PaymentURL,
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
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                AdditionalPOC: element.AdditionalPOC,
                Created: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            });
        }
        this.outstandingInvoicesRes = [...this.outstandingInvoicesRes];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues();
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

    getOutstandingData() {
        this.outstandingInvoicesRes = [
            {
                id: 1,
                InvoiceStatus: 'Status',
                InvoiceNumber: 11233,
                PONumber: '11223344',
                POName: 'Ashish P',
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
                InvoiceDate: '14/09/2019',
                Amount: '123.71',
                Currency: 'INR',
                POC: 'Test poc',
            }
        ]
        this.createColFieldValues();
    }

    outInvoiceColArray = {
        ClientLegalEntity: [],
        InvoiceStatus: [],
        InvoiceNumber: [],
        PONumber: [],
        POName: [],
        InvoiceDate: [],
        Amount: [],
        POC: [],
        Currency: [],
        ModifiedBy: [],
    }

    createColFieldValues() {
        this.outInvoiceColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.InvoiceStatus = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.InvoiceStatus, value: a.InvoiceStatus }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.InvoiceNumber = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.InvoiceNumber, value: a.InvoiceNumber }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.PONumber = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.POName = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.POName, value: a.POName }; return b; }).filter(ele => ele.label)));
        console.log(this.outInvoiceColArray.POName);
        this.outInvoiceColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.POC = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.ModifiedBy = this.commonService.sortData(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b; }).filter(ele => ele.label)));
        const invoiceDate = this.commonService.sortDateArray(this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: this.datePipe.transform(a.InvoiceDate, 'MMM dd, yyyy'), value: a.InvoiceDate }; return b; }).filter(ele => ele.label)));
        this.outInvoiceColArray.InvoiceDate = invoiceDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        const amount = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
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
                    this.items.push({ label: 'Edit Invoice', command: (e) => this.openMenuContent(e, data) });
                }
                break;
            }
            case 'generated': {
                this.items = [
                    { label: 'Sent to AP', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Replace Invoice', command: (e) => this.openMenuContent(e, data) },
                ];
                if (data.InvoiceHtml) {
                    this.items.push({ label: 'Edit Invoice', command: (e) => this.openMenuContent(e, data) });
                }
                break;
            }
            case 'dispute': {
                this.items = [
                    // { label: 'Export Invoice', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Mark as Payment Resolved', command: (e) => this.openMenuContent(e, data) },
                    // { label: 'Dispute Invoice', command: (e) => this.openMenuContent(e, data) },
                    // { label: 'Mark as Debit/Credit Note', command: (e) => this.openMenuContent(e, data) },
                ]
                break;
            }
            default: {
                this.items = [];
                break;
            }
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
            this.timeline.showTimeline(data.Id, 'FD', 'Invoices');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        } else if (this.confirmDialog.title.toLowerCase() === 'edit invoice') {
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
    }

    getCLEListNameFromCLE(cleName) {
        let found = this.cleData.find((x) => {
            if (x.Title === cleName) {
                return x;
            }
        })
        return found ? found.ListName : ''
    }

    // selectedFile: any;
    filePathUrl: any;
    // fileReader: any;
    onFilePaymentChange(event, folderName) {
        console.log("Event ", event);
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                console.log('selectedFile ', this.selectedFile);
                console.log('this.fileReader  ', this.fileReader.result);
                let folderPath: string = '/Finance/Invoice/' + folderName + '/';
                let cleListName = this.globalService.sharePointPageObject.webRelativeUrl + '/' + this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity);
                this.filePathUrl = this.globalService.sharePointPageObject.webRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + cleListName + '' + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" +
                    "&@TargetFileName='" + this.selectedFile.name + "'";
                // this.uploadFileData('');
                // this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
                //     console.log('selectedFile uploaded .', res);
                // })
            };

        }
    }

    // uploadFileData(type: string) {
    //     this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
    //         console.log('selectedFile uploaded .', res.d.ServerRelativeUrl);
    //         if (res.d) {

    //         }
    //     });
    // }

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
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'This file name already exit.Please select another file name.', detail: '', life: 4000 });
                this.replaceInvoice_form.reset();
                return;
            }
        }
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                console.log('selectedFile ', this.selectedFile);
                console.log('this.fileReader  ', this.fileReader.result);
                let folderPath: string = '/Finance/Invoice/Client/';
                let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity);
                this.filePathUrl = this.spServices.getFileUploadUrl(this.globalService.sharePointPageObject.webRelativeUrl + '/' + cleListName + folderPath, this.selectedFile.name, true);
            };

        }
    }

    async uploadFileData() {
        const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result)
        console.log('selectedFile uploaded .', res.ServerRelativeUrl);
        if (res.ServerRelativeUrl) {
            let fileUrl = res.ServerRelativeUrl;
            let obj = {
                FileURL: fileUrl,
                InvoiceHtml: null
            }
            obj['__metadata'] = { type: 'SP.Data.InvoicesListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoice.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ];
            this.submitForm(data, 'replaceInvoice');
        } else if (res.hasError) {
            this.isPSInnerLoaderHidden = true;
            this.messageService.add({ key: 'myKey1', severity: 'info', summary: 'File not uploaded.', detail: 'Folder / ' + res.message.value + '', life: 3000 })
        }
    }

    async uploadPaymentFileData(type: string) {
        const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result)
        console.log('selectedFile uploaded .', res.ServerRelativeUrl);
        if (res.ServerRelativeUrl) {
            console.log('selectedFile uploaded .', res.ServerRelativeUrl);
            let obj2 = {
                Status: 'Paid',
                PaymentURL: res.ServerRelativeUrl
            }
            obj2['__metadata'] = { type: 'SP.Data.InvoicesListItem' };
            const endpoint2 = this.fdConstantsService.fdComponent.addUpdateInvoice.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj2,
                    endpoint: endpoint2,
                    requestPost: false
                }]
            this.submitForm(data, type);
        } else if (res.hasError) {
            this.isPSInnerLoaderHidden = true;
            this.messageService.add({ key: 'myKey1', severity: 'info', summary: 'File not uploaded.', detail: 'Folder / ' + res.message.value + '', life: 3000 })
        }
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

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        console.log()
        if (type === 'paymentResoved') {
            if (this.paymentResoved_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            this.uploadPaymentFileData(type);
            console.log('form is submitting ..... & Form data is ', this.paymentResoved_form.value);
        } else if (type === 'disputeInvoice') {
            if (this.disputeInvoice_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.disputeInvoice_form.value);
            let obj = {
                DisputeReason: this.disputeInvoice_form.value.DisputeReason.value,
                DisputeComments: this.disputeInvoice_form.value.DisputeComments
            }
            obj['__metadata'] = { type: 'SP.Data.InvoicesListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoice.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ]
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;;
            this.submitForm(data, type);
        } else if (type === 'replaceInvoice') {
            if (this.replaceInvoice_form.invalid) {
                return;
            }
            console.log('form is submitting ..... & Form data is ', this.replaceInvoice_form.value);
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            this.uploadFileData();
        } else if (type === 'creditDebit') {
            if (this.creditOrDebitNote_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.creditOrDebitNote_form.value);
            // sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            this.isPSInnerLoaderHidden = false;
            this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
                if (res.d) {
                    console.log('selectedFile uploaded .', res.d);
                    this.submitDebitCreditNoteForm(type, res.d.ServerRelativeUrl);
                }
            });

        } else if (type === 'sentToAP') {
            this.isPSInnerLoaderHidden = false;
            let sts = this.constantService.invoicesStatus.SentToAP;
            // sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            let obj = {
                Status: sts
            }
            obj['__metadata'] = { type: 'SP.Data.InvoicesListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoice.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ]
            this.sentToAPModal = false;
            this.submitForm(data, type);
        }
    }

    submitDebitCreditNoteForm(type: string, pathURL) {
        let obj = {
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
        obj['__metadata'] = { type: 'SP.Data.CreditAndDebitNoteListItem' };
        const endpoint = this.fdConstantsService.fdComponent.addUpdateCreditDebit.createCD;
        let obj2 = {
            Status: this.creditOrDebitNote_form.value.Status
        }
        obj2['__metadata'] = { type: 'SP.Data.InvoicesListItem' };
        const endpoint2 = this.fdConstantsService.fdComponent.addUpdateInvoice.update.replace("{{Id}}", this.selectedRowItem.Id);
        let data = [
            {
                objData: obj,
                endpoint: endpoint,
                requestPost: true
            },
            {
                objData: obj2,
                endpoint: endpoint2,
                requestPost: false
            },
        ];

        this.submitForm(data, type);
    }

    batchContents: any = [];
    async submitForm(dataEndpointArray, type: string) {
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
        const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
        batchBodyContent.push('--batch_' + batchGuid + '--');
        const sBatchData = batchBodyContent.join('\r\n');
        const res = await this.spServices.getFDData(batchGuid, sBatchData);//.subscribe(res => {
        const arrResults = res;
        console.log('--oo ', arrResults);
        if (type === "creditDebit") {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 });
            this.creditOrDebitModal = false;
            this.reFetchData();
        } else if (type === "sentToAP") {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice Status Changed.', detail: '', life: 2000 })
            this.reFetchData();
        } else if (type === "disputeInvoice") {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Submitted.', detail: '', life: 2000 })
            this.disputeInvoiceModal = false;
        } else if (type === "paymentResoved") {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 })
            this.paymentResovedModal = false;
            this.reFetchData();
        } else if (type === "replaceInvoice") {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 })
            this.replaceInvoiceModal = false;
            this.reFetchData();
        }
        this.isPSInnerLoaderHidden = true;
        // });
    }

    reFetchData() {
        setTimeout(() => {
            this.getRequiredData();
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

}
