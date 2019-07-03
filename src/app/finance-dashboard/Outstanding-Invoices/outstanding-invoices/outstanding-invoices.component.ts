import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Message, ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { NodeService } from 'src/app/node.service';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';

@Component({
    selector: 'app-outstanding-invoices',
    templateUrl: './outstanding-invoices.component.html',
    styleUrls: ['./outstanding-invoices.component.css']
})
export class OutstandingInvoicesComponent implements OnInit {

    outstandingInvoicesRes: any = [];
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
    sentToAPModal: boolean = false;

    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    }

    // Purchase Order Number
    purchaseOrders: any[];
    selectedPurchaseNumber: any;

    // Dispute Reasons
    reasons: any;
    CreditOrDebitNoteType: any;

    // Right side bar
    rightSideBar: boolean = false;

    // Loader
    isPSInnerLoaderHidden: boolean = false;
    @ViewChild('timelineRef', {static:true}) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', {static:true}) editorRef: EditorComponent;
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
        private nodeService: NodeService,
        private spOperations: SpOperationsService,
    ) { }

    ngOnInit() {
        //Get  User Info 
        this.currentUserInfo();

        // POC & PO Number
        // this.projectInfo();
        this.projectContacts();
        this.poInfo();
        this.cleInfo();
        // this.usStatesInfo();
        // this.currencyInfo();
        this.getReasons();
        this.getTypes();


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
        this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
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

    // US States
    usStatesData: any = [];
    usStatesInfo() {
        this.usStatesData = [];
        this.fdDataShareServie.defaultUSSData.subscribe((res) => {
            if (res) {
                this.usStatesData = res;
                console.log('US States Data ', this.usStatesData);
            }
        })
    }

    // US States
    currencyData: any = [];
    currencyInfo() {
        this.currencyData = [];
        this.fdDataShareServie.defaultCUData.subscribe((res) => {
            if (res) {
                this.currencyData = res;
                console.log('currency Data ', this.currencyData);
            }
        })
    }

    // Client Legal Entity
    cleData: any = [];
    cleInfo() {
        this.cleData = [];
        this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('CLE Data ', this.cleData);
            }
        })
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
            { field: 'InvoiceDate', header: 'Invoice Date', visibility: true },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POC', header: 'POC', visibility: true },
            { field: '', header: '', visibility: true },

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
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            console.log('REs in Outstanding Invoice ', res);
            arrResults = res;
            if (arrResults.length) {
                this.formatData(arrResults[0]);
                console.log(arrResults);
            }
        });
    }

    formatData(data: any[]) {
        this.outstandingInvoicesRes = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            this.outstandingInvoicesRes.push({
                Id: element.ID,
                Amount: element.Amount,
                AddressType: element.AddressType,
                ClientLegalEntity: element.ClientLegalEntity,
                Currency: element.Currency,
                FileURL: element.FileURL,
                FiscalYear: element.FiscalYear,
                InvoiceDate: this.datePipe.transform(element.InvoiceDate, 'MMM d, y, hh:mm a'),
                InvoiceNumber: element.InvoiceNumber,
                MainPOC: element.MainPOC,
                InvoiceStatus: element.Status,
                PONumber: this.getPONumber(element),
                POName: this.getPOName(element),
                POC: this.getPOCName(element),
                PO: element.PO,
                Title: element.Title,
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
                Modified: this.datePipe.transform(element.Modified, 'MMM d, y, hh:mm a'),
                AdditionalPOC: element.AdditionalPOC,
                Created: this.datePipe.transform(element.Created, 'MMM d, y, hh:mm a'),
            })
        }
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
        return found ? found.Number : ''
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
        InvoiceStatus: [],
        InvoiceNumber: [],
        PONumber: [],
        POName: [],
        InvoiceDate: [],
        Amount: [],
        POC: [],
        Currency: [],
    }

    createColFieldValues() {
        this.outInvoiceColArray.InvoiceStatus = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.InvoiceStatus, value: a.InvoiceStatus }; return b; }));
        this.outInvoiceColArray.InvoiceNumber = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.InvoiceNumber, value: a.InvoiceNumber }; return b; }));
        this.outInvoiceColArray.PONumber = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }));
        this.outInvoiceColArray.POName = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.POName, value: a.POName }; return b; }));
        this.outInvoiceColArray.InvoiceDate = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.InvoiceDate, value: a.InvoiceDate }; return b; }));
        this.outInvoiceColArray.Amount = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }));
        this.outInvoiceColArray.Currency = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }));
        this.outInvoiceColArray.POC = this.uniqueArrayObj(this.outstandingInvoicesRes.map(a => { let b = { label: a.POC, value: a.POC }; return b; }));
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
            { label: 'Show Timeline', command: (e) => this.openMenuContent(e, data) },
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
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
        } else if (this.confirmDialog.title.toLowerCase() === 'show timeline') {
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
                switch (data.Template) {
                    case 'US':
                        this.editorRef.USTemplateCopy = invObj.saveObj;
                        this.editorRef.displayUS = true;
                        break;
                    case 'Japan':
                        this.editorRef.JapanTemplateCopy = invObj.saveObj;
                        this.editorRef.displayJapan = true;
                        break;
                    case 'India':
                        this.editorRef.IndiaTemplateCopy = invObj.saveObj;
                        this.editorRef.displayIndia = true;
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
                let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity);
                this.filePathUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + cleListName + '' + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" +
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
        if (existingFile) {
            let file = existingFile[existingFile.length - 1];
            // let fileName = file.substr(0, file.indexOf('.'));
            console.log('fileName  ', file);
            if (file === event.target.files[0].name) {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'This file name already exit.Please select another file name.', detail: '', life: 4000 });
                this.replaceInvoice_form.reset();
                return;
            }
        }
        console.log((this.selectedRowItem.FileURL.split('/')))
        if (this.selectedRowItem.FileURL) {

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
                this.filePathUrl = this.spOperations.getFileUploadUrl(this.globalService.sharePointPageObject.webRelativeUrl + '/' + cleListName + folderPath, this.selectedFile.name, true);
            };

        }
    }

    async uploadFileData() {
        const res = await this.spOperations.uploadFile(this.filePathUrl, this.fileReader.result)
        console.log('selectedFile uploaded .', res.ServerRelativeUrl);
        if (res.ServerRelativeUrl) {
            let fileUrl = res.ServerRelativeUrl;
            let obj = {
                FileURL: fileUrl,
                // ProformaHtml: null
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
            this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
                if (res.d) {
                    console.log('selectedFile uploaded .', res.d);
                    let obj2 = {
                        Status: 'Paid',
                        FileURL: res.d.ServerRelativeUrl
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
                }
            });

            // this.submitForm();
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
                return
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
            if (type === "creditDebit") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 });
                this.creditOrDebitModal = false;
                this.reload();
            } else if (type === "sentToAP") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice Status Changed.', detail: '', life: 2000 })
                this.reload();
            } else if (type === "disputeInvoice") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Submitted.', detail: '', life: 2000 })
                this.disputeInvoiceModal = false;
                // this.reload();
            } else if (type === "paymentResoved") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 })
                this.paymentResovedModal = false;
                this.reload();
            } else if (type === "replaceInvoice") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 })
                this.replaceInvoiceModal = false;
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

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }


}
