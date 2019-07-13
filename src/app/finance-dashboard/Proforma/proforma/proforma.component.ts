import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Message, ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Calendar } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-proforma',
    templateUrl: './proforma.component.html',
    styleUrls: ['./proforma.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class ProformaComponent implements OnInit, OnDestroy {

    proformaRes: any = [];
    proformaCols: any[];
    msgs: Message[] = [];

    // Row Selection Array
    selectedRowData: any[];

    // Show Hide State
    isTemplate4US: boolean = false;

    // Edit Deliverable Form
    createProforma_form: FormGroup;
    replaceProforma_form: FormGroup;
    generateInvoice_form: FormGroup;

    // Show Hide Request Modal
    showHideREModal: boolean = false;
    selectedCurrency: string = '';

    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    }
    minProformDate: Date = new Date();

    // Purchase Order Number
    purchaseOrders: any[];
    selectedPurchaseNumber: any;

    // Loadder
    isPSInnerLoaderHidden: boolean = false;

    // Right side bar
    rightSideBar: boolean = false;

    // Proforma Templates
    proformatTemplates: any = [];
    proformaAddressType: any = [];
    proformaTypes: any = [];
    @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', { static: true }) editorRef: EditorComponent;

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
        private commonService: CommonService,
        private spOperations: SpOperationsService
    ) { }

    async ngOnInit() {

        // Create FOrm Field
        this.createProformaFormField();
        this.createRepProFormField()
        this.createInvoiceFormFiled();

        //Get  User Info 
        this.currentUserInfo();

        // POC & PO Number
        // this.projectInfo();
        this.projectContacts();
        await this.cleInfo();
        await this.poInfo();
        this.usStatesInfo();
        this.currencyInfo();
        this.resourceCInfo();

        // Get Required Proforma Data
        this.getRequiredData();

        this.createProformaCols();
        // this.getProformaData();

        // 
        this.getPurchaseOrderList();

        // Initialize Proforma Templates & Address Type
        this.getProformaTemplates();
        this.getAddressType();
        this.getProformaType();
    }
    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }
    // Project Info 
    projectInfoData: any = [];
    async projectInfo() {
        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();

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
    async cleInfo() {
        this.isPSInnerLoaderHidden = false;
        await this.fdDataShareServie.getClePO();
        this.isPSInnerLoaderHidden = true;

        this.cleData = [];
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('CLE Data ', this.cleData);
            }
        }))
    }

    getProformaTemplates() {
        this.proformatTemplates = [
            { label: 'US', value: 'US' },
            { label: 'Japan', value: 'Japan' },
            { label: 'India', value: 'India' },
            { label: 'Korea', value: 'Korea' },
            { label: 'China', value: 'China' },
            { label: 'ROW', value: 'ROW' }
        ]
    }

    getAddressType() {
        this.proformaAddressType = [
            { lable: 'POC', value: 'POC' },
            { lable: 'Client', value: 'Client' }
        ]
    }

    getProformaType() {
        this.proformaTypes = [
            { lable: 'OOP', value: 'oop' },
            { lable: 'Revenue', value: 'revenue' }
        ]
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
        } else {
        }
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

    createProformaFormField() {
        this.createProforma_form = this.fb.group({
            ClientLegalEntity: ['', Validators.required],
            POName: ['', Validators.required],
            POCName: ['', Validators.required],
            ProformaNumber: [{ value: '', disabled: true }],
            ProformaTitle: ['', Validators.required],
            Template: ['', Validators.required],
            State: ['', Validators.required],
            Amount: ['', Validators.required],
            Currency: [{ value: '', disabled: true }],
            AddressType: ['', Validators.required],
            ProformaType: ['', Validators.required],
            AdditionalComments: [''],
            ProformaDate: [new Date(), Validators.required],
        })
    }

    createRepProFormField() {
        this.replaceProforma_form = this.fb.group({
            file: ['', [Validators.required]]
        })
    }

    createInvoiceFormFiled() {
        this.generateInvoice_form = this.fb.group({
            InvoiceDate: [new Date(), [Validators.required]]
        })
    }

    createProformaCols() {
        this.proformaCols = [
            { field: 'ProformaNumber', header: 'Proforma Number', visibility: true },
            { field: 'PONumber', header: 'PO Number', visibility: true },
            { field: 'ProformaDateFormat', header: 'Proforma Date', visibility: false },
            { field: 'ProformaDate', header: 'Proforma Date', visibility: true },
            { field: 'ProformaType', header: 'Proforma Type', visibility: true },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POC', header: 'POC', visibility: true },
            { field: 'Status', header: 'Status', visibility: true },

            { field: 'AddressType', header: 'AddressType', visibility: false },
            { field: 'PO', header: 'PO Name', visibility: false },
            { field: 'MainPOC', header: 'MainPOC', visibility: false },
            { field: 'ClientLegalEntity', header: 'ClientLegalEntity', visibility: false },
            { field: 'AdditionalInfo', header: 'AdditionalInfo', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'FileURL', header: 'FileURL', visibility: false },
            { field: 'ProformaHtml', header: 'ProformaHtml', visibility: false },
            { field: 'ProformaTitle', header: 'ProformaTitle', visibility: false },
            // { field: 'InvoiceLookup', header: 'InvoiceLookup', visibility: false },
            // { field: 'LineItemsLookup', header: 'LineItemsLookup', visibility: false },
            { field: 'Reason', header: 'Reason', visibility: false },
            { field: 'State', header: 'State', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },
            { field: '', header: '', visibility: true },
        ];
    }

    // Get Proformas InvoiceItemList
    confirmedILIarray: any = [];
    async getRequiredData() {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let invoicesQuery = '';
        if (true) {
            invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.Proforma.name + '', this.fdConstantsService.fdComponent.proformaForMangerIT);
        } else {
            invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.Proforma.name + '', this.fdConstantsService.fdComponent.proformaForNonManger);
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
        console.log('REs in Confirmed Invoice ', res);
        arrResults = res;
        if (arrResults.length) {
            this.formatData(arrResults[0]);
            console.log(arrResults);
        }
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    async formatData(data: any[]) {
        this.proformaRes = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = this.getPONumber(element)
            let resCInfo = await this.fdDataShareServie.getResDetailById(this.rcData, element);
            if (resCInfo && resCInfo.hasOwnProperty('UserName') && resCInfo.UserName.hasOwnProperty('Title')) {
                resCInfo = resCInfo.UserName.Title
            }
            this.proformaRes.push({
                Id: element.ID,
                ProformaNumber: element.Title,
                PO: element.PO,
                PONumber: poItem.Number,
                POName: poItem.Name,
                ProformaDate: new Date(this.datePipe.transform(element.ProformaDate, 'MMM dd, yyyy')),
                ProformaDateFormat: this.datePipe.transform(element.ProformaDate, 'MMM dd, yyyy'),
                ProformaType: element.ProformaType,
                Amount: element.Amount,
                Currency: element.Currency,
                POC: this.getPOCName(element),
                Status: element.Status,
                AddressType: element.AddressType,
                MainPOC: element.MainPOC,
                ClientLegalEntity: element.ClientLegalEntity,
                AdditionalInfo: element.AdditionalInfo,
                Template: element.Template,
                FileURL: element.FileURL,
                ProformaHtml: element.ProformaHtml,

                ProformaTitle: element.ProformaTitle,
                InvoiceLookup: element.InvoiceLookup,
                LineItemsLookup: element.LineItemsLookup,
                Reason: element.Reason,
                State: element.State,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy'),
                ModifiedBy: resCInfo
            })
        }
        this.proformaRes = [...this.proformaRes];
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

    getPOCName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        return found ? found.FName + ' ' + found.LName : ''
    }

    proformaColArray = {
        ProformaNumber: [],
        PONumber: [],
        ProformaDate: [],
        ProformaType: [],
        Amount: [],
        Currency: [],
        POC: [],
        Status: []
    }

    createColFieldValues() {
        this.proformaColArray.ProformaNumber = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }));
        this.proformaColArray.PONumber = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }));
        this.proformaColArray.ProformaDate = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: this.datePipe.transform(a.ProformaDate, "MMM dd, yyyy"), value: a.ProformaDate }; return b; }));
        this.proformaColArray.ProformaType = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.ProformaType, value: a.ProformaType }; return b; }));
        this.proformaColArray.Status = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.Status, value: a.Status }; return b; }));
        this.proformaColArray.Amount = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }));
        this.proformaColArray.Currency = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }));
        this.proformaColArray.POC = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.POC, value: a.POC }; return b; }));
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

    confirm1(obj) {
        this.confirmationService.confirm({
            message: obj.msg,
            header: obj.title,
            icon: 'pi pi-exclamation-triangle',
            key: 'proforma',
            accept: () => {
                this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'You have Confirmed' }];
                // Call server service here
                console.log('obj ', obj);
                this.onSubmit(obj.type);
            },
            reject: () => {
                this.msgs = [{ severity: 'info', summary: 'Cancel', detail: 'You have canceled' }];
            }
        });
    }

    items: any[];
    confirmDialog: any = {
        title: '',
        text: ''
    }
    // Open popups
    openPopup(data, popUpData) {
        console.log('Row data  ', data);
        let proformaSts: string = '';
        this.items = [];
        if (data.Status) {
            proformaSts = data.Status.toLowerCase();
        }
        switch (proformaSts) {
            case 'created': {
                this.items = [
                    // { label: 'Export Proforma', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Mark as Sent to Client', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Reject Proforma', command: (e) => this.openMenuContent(e, data) },
                    // { label: 'Replace Proforma', command: (e) => this.openMenuContent(e, data) },
                ];
                break;
            }
            case 'sent': {
                this.items = [
                    // { label: 'Export Proforma', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Generate Invoice', command: (e) => this.openMenuContent(e, data) },
                    { label: 'Reject Proforma', command: (e) => this.openMenuContent(e, data) },
                    // { label: 'Replace Proforma', command: (e) => this.openMenuContent(e, data) },
                ];
                break;
            }
            default: {
            }

        }
        if (data.ProformaHtml) {
            this.items.push({ label: 'Edit Proforma', command: (e) => this.openMenuContent(e, data) });
        }
        this.items.push(
            { label: 'Replace Proforma', command: (e) => this.openMenuContent(e, data) },
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        )

        if (this.items.length === 0) {
            console.log('this.items ', this.items);
            popUpData.visible = false;
        }

    }

    proformaModal: boolean = false;
    replaceProformaModal: boolean = false;
    generateInvoiceModal: boolean = false;

    proformaConfirmationModal: any = {
        title: '',
        msg: '',
        type: ''
    }

    createReplaceProforma: any = {
        title: '',
        msg: '',
        type: ''
    }

    selectedRowItem: any;
    openMenuContent(event, data) {
        // console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.confirmDialog.title = event.item.label;
        this.submitBtn.isClicked = false;
        this.formSubmit.isSubmit = false;
        if (this.confirmDialog.title.toLowerCase() === 'mark as sent to client') {
            this.proformaConfirmationModal.type = this.confirmDialog.title;
            this.proformaConfirmationModal.msg = 'Are you sure you want to change proforma status to "Sent" ?';
            this.proformaConfirmationModal.title = 'Update Proforma';
            this.confirm1(this.proformaConfirmationModal);
        } else if (this.confirmDialog.title.toLowerCase() === 'reject proforma') {
            this.proformaConfirmationModal.type = this.confirmDialog.title;
            this.proformaConfirmationModal.msg = 'Are you sure you want to reject this proforma?';
            this.proformaConfirmationModal.title = 'Update Proforma';
            this.getILIByPID();
            this.confirm1(this.proformaConfirmationModal);
        } else if (this.confirmDialog.title.toLowerCase() === 'replace proforma') {
            this.replaceProformaModal = true;

        } else if (this.confirmDialog.title.toLowerCase() === 'generate invoice') {
            this.generateInvoiceModal = true;
            this.getILIByPID();

        } else if (this.confirmDialog.title.toLowerCase() === 'show history') {
            this.timeline.showTimeline(data.Id, 'FD', 'Proforma');
        } else if (this.confirmDialog.title.toLowerCase() === 'edit proforma') {
            const proformaObj = JSON.parse(data.ProformaHtml);
            if (proformaObj.hasOwnProperty('saveObj')) {
                this.fdConstantsService.fdComponent.selectedEditObject.Code = data.ProformaNumber;
                const oCLE = this.cleData.find(e => e.Title === data.ClientLegalEntity);
                this.fdConstantsService.fdComponent.selectedEditObject.ListName = oCLE.ListName;
                this.fdConstantsService.fdComponent.selectedEditObject.ID = data.Id;
                this.fdConstantsService.fdComponent.selectedEditObject.Type = 'Proforma';
                this.fdConstantsService.fdComponent.selectedComp = this;
                switch (data.Template) {
                    case 'US':
                        this.editorRef.JapanTemplateCopy = {};
                        this.editorRef.IndiaTemplateCopy = {};
                        this.editorRef.USTemplateCopy = proformaObj.saveObj;
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
                        this.editorRef.JapanTemplateCopy = proformaObj.saveObj;
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
                        this.editorRef.IndiaTemplateCopy = proformaObj.saveObj;
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
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    showHideState(val: any) {
        console.log('val ', val);
        this.isTemplate4US = val.value == "US" ? this.isTemplate4US = true : this.isTemplate4US = false;
        if (this.isTemplate4US) {
            this.createProforma_form.addControl('State', new FormControl('', Validators.required));
        } else {
            this.createProforma_form.removeControl('State');
        }
    }

    // Generate Invoice Data start
    iliByPidRes: any = [];
    addILIObj: any = {
        TaggedAmount: 0,
        IsTaggedFully: 'No'
    };
    async getILIByPID() {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let invoicesQuery = '';
        let obj = {
            filter: this.fdConstantsService.fdComponent.invoiceLineItem.filter.replace("{{ProformaLookup}}", this.selectedRowItem.Id),
            select: this.fdConstantsService.fdComponent.invoiceLineItem.select,
            top: this.fdConstantsService.fdComponent.invoiceLineItem.top,
            // orderby: this.fdConstantsService.fdComponent.projectFinances.orderby
        }
        invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.InvoiceLineItems.name + '', obj);
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
        const res = await this.spServices.getFDData(batchGuid, userBatchBody);// .subscribe(res => {
        console.log('REs in getILIByPID ', res);
        arrResults = res;
        if (arrResults.length) {
            console.log(arrResults[0]);
            this.iliByPidRes = arrResults[0] ? arrResults[0] : [];
            if (this.iliByPidRes) {
                this.addILIObj = {
                    TaggedAmount: this.selectedRowItem.Amount,
                    IsTaggedFully: 'Yes'
                }
            }
            this.getUniqueItem(arrResults[0]);
        }
        // });
    }

    getUniqueItem(data: any[]) {
        let uniqueitem = this.uniqueArrayObj1(data);
        console.log('uniqueitem ', uniqueitem);
        if (uniqueitem) {
            this.getPfPfbSow(uniqueitem);
        }
    }

    uniqueArrayObj1(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map(s => s.Title))).map(label1 => {
            return {
                Title: label1,
                item: array.find(s => s.Title === label1)
            }
        })
    }
    invoicesQuery: any = [];
    pfresp: any = [];
    pfbresp: any = [];
    sowresp: any = [];
    async getPfPfbSow(array: any) {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        this.invoicesQuery = [];
        for (let j = 0; j < array.length; j++) {
            const element = array[j];
            // PF
            let obj = {
                filter: this.fdConstantsService.fdComponent.projectFinances.filter.replace("{{ProjectCode}}", element.item.Title),
                select: this.fdConstantsService.fdComponent.projectFinances.select,
                top: this.fdConstantsService.fdComponent.projectFinances.top,
            }
            this.invoicesQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinances.name + '', obj));

            // PFB

            let pfbObj = {
                filter: this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO.filter.replace("{{ProjectCode}}", element.item.Title).replace("{{PO}}", element.item.PO),
                select: this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO.select,
                top: this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO.top,
            }
            this.invoicesQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinanceBreakup.name + '', pfbObj));

            // SOW

            let sowObj = {
                filter: this.fdConstantsService.fdComponent.sowForIG.filter.replace("{{SOWCode}}", element.item.SOWCode),
                select: this.fdConstantsService.fdComponent.sowForIG.select,
                top: this.fdConstantsService.fdComponent.sowForIG.top,
            }
            this.invoicesQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.SOW.name + '', sowObj));

            let endPoints = this.invoicesQuery;
            let userBatchBody = '';
            for (let i = 0; i < endPoints.length; i++) {
                const element = endPoints[i];
                this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
            }
            batchContents.push('--batch_' + batchGuid + '--');
            userBatchBody = batchContents.join('\r\n');
            let arrResults: any = [];
            const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
            console.log('REs in getPfPfbSow ', res);
            arrResults = res;
            if (arrResults.length) {
                this.pfresp = arrResults[0] ? arrResults[0] : [];
                this.pfbresp = arrResults[1] ? arrResults[1] : [];
                this.sowresp = arrResults[2] ? arrResults[2] : [];
                console.log('this.pfresp ', this.pfresp);
                console.log('this.pfbresp ', this.pfbresp);
                console.log('this.sowresp ', this.sowresp);
            }
            // });

        }
    }


    // Generate Invoice Number
    invoiceNumber: any;
    generateInvoiceNumber() {
        this.invoiceNumber = '';
        this.addUpdateRequired();
    }

    getPOItemByPOId(ppo) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === ppo.PO) {
                return x;
            }
        })
        return found ? found : ''
    }
    getClEItemByPNum(clename) {
        let found = this.cleData.find((x) => {
            if (x.Title === clename) {
                return x;
            }
        })
        return found ? found : ''
    }

    async addUpdateRequired() {
        let poItem = this.getPOItemByPOId(this.selectedRowItem);
        console.log('poItem ', poItem);
        let cleItem = this.getClEItemByPNum(this.selectedRowItem.ClientLegalEntity);
        let invDate = this.generateInvoice_form.value.InvoiceDate;
        let mmyy = this.datePipe.transform(new Date(invDate), 'MM') + this.datePipe.transform(new Date(invDate), 'yy');
        let invCounter = cleItem.InvoiceCounter ? parseInt(cleItem.InvoiceCounter) + 1 : 1;
        let sNum = '000' + invCounter;
        let sFinalNum = sNum.substr(sNum.length - 4);
        this.invoiceNumber = cleItem.Acronym + '-' + mmyy + '-' + sFinalNum;
        console.log('this.invoiceNumber ', this.invoiceNumber);

        // Final Array
        let data = [];

        // Add Invoice
        let iObj = {
            InvoiceNumber: this.invoiceNumber,
            Status: 'Generated',
            InvoiceDate: this.generateInvoice_form.value.InvoiceDate,
            Amount: this.selectedRowItem.Amount,
            Currency: this.selectedRowItem.Currency,
            PO: this.selectedRowItem.PO,
            MainPOC: this.selectedRowItem.MainPOC,
            AddressType: this.selectedRowItem.AddressType,
            Template: this.selectedRowItem.Template,
            AdditionalInfo: this.selectedRowItem.AdditionalInfo,
            ClientLegalEntity: this.selectedRowItem.ClientLegalEntity,
            InvoiceType: this.selectedRowItem.ProformaType,
            InvoiceTitle: this.selectedRowItem.ProformaTitle,
            TaggedAmount: this.addILIObj.TaggedAmount,
            IsTaggedFully: this.addILIObj.IsTaggedFully,
            State: this.selectedRowItem.State
        }
        iObj['__metadata'] = { type: 'SP.Data.InvoicesListItem' };
        const iEndpoint = this.fdConstantsService.fdComponent.addUpdateInvoice.create;
        let invobj = { objData: iObj, endpoint: iEndpoint, requestPost: true }
        data.push(invobj);


        // Get Cle
        let cleObj = {
            ID: cleItem.Id,
            InvoiceCounter: cleItem.InvoiceCounter ? cleItem.InvoiceCounter + 1 : 1
        }
        cleObj['__metadata'] = { type: 'SP.Data.ClientLegalEntityListItem' };
        const cleEndpoint = this.fdConstantsService.fdComponent.addUpdateClientLegalEntity.update.replace('{{Id}}', cleItem.Id);
        let updateCle = { objData: cleObj, endpoint: cleEndpoint, requestPost: false }
        data.push(updateCle);

        // // Update Proforma // ommited as it is called in call batch request
        // let pObj = {
        //     Status: 'Approved'
        // }
        // pObj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
        // const pEndpoint = this.fdConstantsService.fdComponent.addUpdateProforma.update.replace("{{Id}}", this.selectedRowItem.Id);
        // let updatePObj = { objData: pObj, endpoint: pEndpoint, requestPost: false }
        // data.push(updatePObj);

        let proformaType: any = '';
        ///update PO
        let poObj: any = {};
        if (this.selectedRowItem) {
            proformaType = this.selectedRowItem.ProformaType;
            if (proformaType === 'revenue') {
                poObj = {
                    InvoicedRevenue: (poItem.InvoicedRevenue ? poItem.InvoicedRevenue : 0 + this.selectedRowItem.Amount),
                    ScheduledRevenue: (poItem.ScheduledRevenue ? poItem.ScheduledRevenue : 0 - this.selectedRowItem.Amount),
                    TotalInvoiced: (poItem.TotalInvoiced ? poItem.TotalInvoiced : 0 + this.selectedRowItem.Amount),
                    TotalScheduled: (poItem.TotalScheduled ? poItem.TotalScheduled : 0 - this.selectedRowItem.Amount),
                }
            } else if (proformaType === 'oop') {
                poObj = {
                    ScheduledOOP: (poItem.ScheduledOOP ? poItem.ScheduledOOP : 0 - this.selectedRowItem.Amount),
                    InvoicedOOP: (poItem.InvoicedOOP ? poItem.InvoicedOOP : 0 + this.selectedRowItem.Amount),
                    TotalInvoiced: (poItem.TotalInvoiced ? poItem.TotalInvoiced : 0 + this.selectedRowItem.Amount),
                    TotalScheduled: (poItem.TotalScheduled ? poItem.TotalScheduled : 0 - this.selectedRowItem.Amount),
                }
            }
        }
        poObj['__metadata'] = { type: 'SP.Data.POListItem' };
        const poEndpoint = this.fdConstantsService.fdComponent.addUpdatePO.update.replace("{{Id}}", poItem.ID);

        let updatePOObj = { objData: poObj, endpoint: poEndpoint, requestPost: false }
        data.push(updatePOObj);



        let iliEndpoint = [];
        let pfs: any = [];
        let pfbs: any = [];
        let sows: any = [];
        for (let j = 0; j < this.iliByPidRes.length; j++) {
            const element = this.iliByPidRes[j];
            // iliEndpoint.push()

            // PF 
            let pfsItem = await this.findpfFrompfRes(element);
            if (pfsItem) {
                if (proformaType === 'revenue') {
                    pfs.push({
                        Id: pfsItem.Id,
                        InvoicedRevenue: (pfsItem.InvoicedRevenue ? pfsItem.InvoicedRevenue : 0 + element.Amount ? element.Amount : 0),
                        ScheduledRevenue: (pfsItem.ScheduledRevenue ? pfsItem.ScheduledRevenue : 0 - element.Amount ? element.Amount : 0),
                        Invoiced: (pfsItem.Invoiced ? pfsItem.Invoiced : 0 + element.Amount ? element.Amount : 0),
                        InvoicesScheduled: (pfsItem.InvoicesScheduled ? pfsItem.InvoicesScheduled : 0 - element.Amount ? element.Amount : 0),
                    })
                } else if (proformaType === 'oop') {
                    pfs.push({
                        Id: pfsItem.Id,
                        ScheduledOOP: (pfsItem.ScheduledOOP ? pfsItem.ScheduledOOP : 0 - element.Amount ? element.Amount : 0),
                        InvoicedOOP: (pfsItem.InvoicedOOP ? pfsItem.InvoicedOOP : 0 + element.Amount ? element.Amount : 0),
                        Invoiced: (pfsItem.Invoiced ? pfsItem.Invoiced : 0 + element.Amount ? element.Amount : 0),
                        InvoicesScheduled: (pfsItem.InvoicesScheduled ? pfsItem.InvoicesScheduled : 0 - element.Amount ? element.Amount : 0),
                    })
                }
                console.log('pfs ', pfs);
            }
            // PFB
            let pfbsItem = await this.findpfbFrompfbRes(element);
            if (pfbsItem) {
                if (proformaType === 'revenue') {
                    pfbs.push({
                        Id: pfbsItem.Id,
                        InvoicedRevenue: (pfbsItem.InvoicedRevenue ? pfbsItem.InvoicedRevenue : 0 + element.Amount ? element.Amount : 0),
                        ScheduledRevenue: (pfbsItem.ScheduledRevenue ? pfbsItem.ScheduledRevenue : 0 - element.Amount ? element.Amount : 0),
                        TotalInvoiced: (pfbsItem.TotalInvoiced ? pfbsItem.TotalInvoiced : 0 + element.Amount ? element.Amount : 0),
                        TotalScheduled: (pfbsItem.TotalScheduled ? pfbsItem.TotalScheduled : 0 - element.Amount ? element.Amount : 0),
                    })
                } else if (proformaType === 'oop') {
                    pfbs.push({
                        Id: pfbsItem.Id,
                        ScheduledOOP: (pfbsItem.ScheduledOOP ? pfbsItem.ScheduledOOP : 0 - element.Amount ? element.Amount : 0),
                        InvoicedOOP: (pfbsItem.InvoicedOOP ? pfbsItem.InvoicedOOP : 0 + element.Amount ? element.Amount : 0),
                        TotalInvoiced: (pfbsItem.TotalInvoiced ? pfbsItem.TotalInvoiced : 0 + element.Amount ? element.Amount : 0),
                        TotalScheduled: (pfbsItem.TotalScheduled ? pfbsItem.TotalScheduled : 0 - element.Amount ? element.Amount : 0),
                    })
                }
                console.log('pfbs ', pfbs);
            }
            // SOW
            let sowsItem = await this.findsowFromsowRes(element);
            if (sowsItem) {
                if (proformaType === 'revenue') {
                    sows.push({
                        Id: sowsItem.Id,
                        InvoicedRevenue: (sowsItem.InvoicedRevenue ? sowsItem.InvoicedRevenue : 0 + element.Amount ? element.Amount : 0),
                        ScheduledRevenue: (sowsItem.ScheduledRevenue ? sowsItem.ScheduledRevenue : 0 - element.Amount ? element.Amount : 0),
                        TotalInvoiced: (sowsItem.TotalInvoiced ? sowsItem.TotalInvoiced : 0 + element.Amount ? element.Amount : 0),
                        TotalScheduled: (sowsItem.TotalScheduled ? sowsItem.TotalScheduled : 0 - element.Amount ? element.Amount : 0),
                    })
                } else if (proformaType === 'oop') {
                    sows.push({
                        Id: sowsItem.Id,
                        ScheduledOOP: (sowsItem.ScheduledOOP ? sowsItem.ScheduledOOP : 0 - element.Amount ? element.Amount : 0),
                        InvoicedOOP: (sowsItem.InvoicedOOP ? sowsItem.InvoicedOOP : 0 + element.Amount ? element.Amount : 0),
                        TotalInvoiced: (sowsItem.TotalInvoiced ? sowsItem.TotalInvoiced : 0 + element.Amount ? element.Amount : 0),
                        TotalScheduled: (sowsItem.TotalScheduled ? sowsItem.TotalScheduled : 0 - element.Amount ? element.Amount : 0),
                    })
                }
                console.log('sows ', sows);
            }
        }
        console.log('iliEndpoint ', iliEndpoint);

        if (pfs.length) {
            for (let pf = 0; pf < pfs.length; pf++) {
                const element = pfs[pf];
                element['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
                data.push({
                    objData: element,
                    endpoint: this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", element.Id),
                    requestPost: false
                });
            }
        }

        if (pfbs.length) {
            for (let pfb = 0; pfb < pfbs.length; pfb++) {
                const element = pfbs[pfb];
                element['__metadata'] = { type: 'SP.Data.ProjectFinanceBreakupListItem' };
                data.push({
                    objData: element,
                    endpoint: this.fdConstantsService.fdComponent.addUpdateProjectFinanceBreakup.update.replace("{{Id}}", element.Id),
                    requestPost: false
                });
            }
        }

        if (sows.length) {
            for (let sow = 0; sow < sows.length; sow++) {
                const element = sows[sow];
                element['__metadata'] = { type: 'SP.Data.SOWListItem' };
                data.push({
                    objData: element,
                    endpoint: this.fdConstantsService.fdComponent.addUpdateSow.update.replace("{{Id}}", element.Id),
                    requestPost: false
                });
            }
        }

        console.log('data ', data);
        this.submitForm(data, 'generateInvoice');
    }

    findpfFrompfRes(ili) {
        let found = this.pfresp.find((x) => {
            if (x.Title === ili.Title) {
                return x;
            }
        })
        return found ? found : ''
    }
    findpfbFrompfbRes(ili) {
        let found = this.pfbresp.find((x) => {
            if (x.ProjectNumber === ili.Title) {
                return x;
            }
        })
        return found ? found : ''
    }
    findsowFromsowRes(ili) {
        let found = this.sowresp.find((x) => {
            if (x.SOWCode === ili.SOWCode) {
                return x;
            }
        })
        return found ? found : ''
    }

    //  Generate Invoice Data End

    get isValidCreateProformaForm() {
        return this.createProforma_form.controls;
    }
    get isValidReplaceProformaForm() {
        return this.replaceProforma_form.controls;
    }
    get isValidGenerateInvoiceForm() {
        return this.generateInvoice_form.controls;
    }

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    onFileChange(event, folderName) {
        let existingFile = this.selectedRowItem.FileURL ? this.selectedRowItem.FileURL.split('/') : [];
        if (existingFile) {
            let file = existingFile[existingFile.length - 1];
            // let fileName = file.substr(0, file.indexOf('.'));
            console.log('fileName  ', file);
            if (file === event.target.files[0].name) {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'This file name already exit.Please select another file name.', detail: '', life: 4000 });
                this.replaceProforma_form.reset();
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
                let folderPath: string = '/Finance/Proforma/';
                let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity);
                this.filePathUrl = this.spOperations.getFileUploadUrl(this.globalService.sharePointPageObject.webRelativeUrl + '/' + cleListName + folderPath, this.selectedFile.name, true);
                // this.filePathUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + cleListName + '' + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" +
                // "&@TargetFileName='" + this.selectedFile.name + "'";
                // this.uploadFileData('');
                // this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
                //     console.log('selectedFile uploaded .', res);
                // })
            };

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

    async uploadFileData() {
        const res = await this.spOperations.uploadFile(this.filePathUrl, this.fileReader.result)
        console.log('selectedFile uploaded .', res.ServerRelativeUrl);
        if (res.ServerRelativeUrl) {
            let fileUrl = res.ServerRelativeUrl;
            let obj = {
                FileURL: fileUrl,
                ProformaHtml: null
            }
            obj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateProforma.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ];
            this.submitForm(data, 'replaceProforma');
        }
    }

    createProforma() {
        this.minProformDate = this.commonService.getLastWorkingDay(3, new Date());
        this.proformaModal = true;
    }

    onCLIChange(data: any) {
        console.log(data);
        let cleItem = data.value;
        this.getPONumberFromCLE(data.value.Title);
        this.generateProformaNumber(cleItem);
        this.getPOCNamesForEditInv(data.value);
    }
    selectedPOItem: any;
    onPOChange(data: any) {
        console.log('Data ', data);
        this.selectedPOItem = data;
        this.createProforma_form.patchValue({
            Currency: data.value.Currency
        })
    }

    // Project PO
    poNames: any = [];
    getPONumberFromCLE(cli) {
        this.poNames = [];
        this.purchaseOrdersList.map((x) => {
            if (x.ClientLegalEntity === cli) {
                this.poNames.push(x);
            }
        });
        console.log(this.poNames);
    }

    generateProformaNumber(cle: any) {
        let cleAcronym = '';
        let proformaCounter: number = 0;
        let proformaDate = '';
        let sType: string = 'Proforma';
        let isOOP: boolean = false;
        if (this.createProforma_form.value.ProformaType) {
            isOOP = this.createProforma_form.value.ProformaType.value.toLowerCase() === 'oop' ? true : false;
        }
        if (cle) {
            cleAcronym = cle.Acronym ? cle.Acronym : '';
            // console.log('cleAcronym,', cleAcronym);
            proformaCounter = cle.ProformaCounter ? parseInt(cle.ProformaCounter) + 1 : 1;
            let sNum = '000' + proformaCounter;
            let sFinalNum = sNum.substr(sNum.length - 4);
            // console.log('proformaCounter,', proformaCounter);
            const date = this.createProforma_form.value.ProformaDate ? new Date(this.createProforma_form.value.ProformaDate) : new Date();
            proformaDate = this.datePipe.transform(date, 'MM') + this.datePipe.transform(date, 'yy');
            // console.log('proformaDate,', proformaDate);
            let finalVal = isOOP ? cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum + '-OOP' : cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum;
            this.createProforma_form.get('ProformaNumber').setValue(finalVal);
        }
    }

    updatePrformaNumFromPT(cle, ptVal: any) {
        // console.log(cle);
        // let pt = this.createProforma_form.value.ProformaType.value;
        this.generateProformaNumber(cle);
        // let isOOP = this.createProforma_form.value.ProformaType ? true : false;
    }

    listOfPOCNames: SelectItem[];
    getPOCNamesForEditInv(rowItem: any) {
        this.listOfPOCNames = [];
        this.projectContactsData.filter((item) => {
            if (item.ClientLegalEntity === rowItem.Title) {
                this.listOfPOCNames.push(item)
            }
        });
        console.log('this.listOfPOCNames ', this.listOfPOCNames);
    }

    pocChange(val) {
        console.log(val)
    }

    cancelFormSub(formType) {
        if (formType === 'editDeliverable') {
            this.createProforma_form.reset();
            this.proformaModal = false;
        } else if (formType === 'createProforma') {
            this.createProforma_form.reset();
            this.proformaModal = false;
        } else if (formType === 'replaceProforma') {
            this.replaceProforma_form.reset();
            this.replaceProformaModal = false;
        } else if (formType === 'generateInvoice') {
            this.generateInvoice_form.reset();
            this.generateInvoiceModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    // Project Client
    getCLEObj(cle: any) {
        let found = this.cleData.find((x) => { return x.Title == cle });
        return found ? found : '';
    }

    getILIById() {

    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        console.log('type ', type);
        if (type === 'Mark as Sent to Client') {
            let sts = '';
            sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            let obj = {
                Status: sts
            }
            obj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateProforma.update.replace("{{Id}}", this.selectedRowItem.Id);
            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ];
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            this.submitForm(data, type);
        }
        if (type === 'Reject Proforma') {
            let sts = '';
            sts = 'Rejected'
            let obj = {
                Status: sts
            }
            obj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateProforma.update.replace("{{Id}}", this.selectedRowItem.Id);
            // Get invoce line items & update sts  to all ids

            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: false
                }
            ];
            for (let j = 0; j < this.iliByPidRes.length; j++) {
                let invObj = {
                    Status: 'Confirmed',
                    ProformaLookup: null
                }
                invObj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
                const iliEndpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.iliByPidRes[j].Id);
                data.push(
                    {
                        objData: invObj,
                        endpoint: iliEndpoint,
                        requestPost: false
                    }
                )
            }


            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            this.submitForm(data, type);
        }
        if (type === 'createProforma') {
            if (this.createProforma_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            console.log('form is submitting ..... & Form data is ', this.createProforma_form.getRawValue());
            let obj: any = {};
            obj = {
                ClientLegalEntity: this.createProforma_form.value.ClientLegalEntity.Title,
                PO: this.createProforma_form.value.POName.Id,
                MainPOC: this.createProforma_form.value.POCName.ID,
                Title: this.createProforma_form.getRawValue().ProformaNumber,
                ProformaTitle: this.createProforma_form.value.ProformaTitle,
                Template: this.createProforma_form.value.Template.value,
                State: this.createProforma_form.value.State ? this.createProforma_form.value.State.Title : '',
                Amount: this.createProforma_form.value.Amount,
                Currency: this.createProforma_form.getRawValue().Currency,
                AddressType: this.createProforma_form.value.AddressType.value,
                ProformaType: this.createProforma_form.value.ProformaType.value,
                AdditionalInfo: this.createProforma_form.value.AdditionalComments,
                ProformaDate: this.createProforma_form.value.ProformaDate,
                Status: 'Created'
            }
            console.log('obj ', obj);
            obj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateProforma.createProforma;

            // Get Cle
            let currentCle = this.getCLEObj(obj.ClientLegalEntity);
            let cleObj = {
                ID: currentCle.Id,
                ProformaCounter: currentCle.ProformaCounter ? currentCle.ProformaCounter + 1 : 1
            }
            cleObj['__metadata'] = { type: 'SP.Data.ClientLegalEntityListItem' };
            const cleEndpoint = this.fdConstantsService.fdComponent.addUpdateClientLegalEntity.update.replace('{{Id}}', currentCle.Id);

            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: true
                },
                {
                    objData: cleObj,
                    endpoint: cleEndpoint,
                    requestPost: false
                }
            ];
            this.submitBtn.isClicked = true;

            this.submitForm(data, type);
        } else if (type === 'replaceProforma') {
            if (this.replaceProforma_form.invalid) {
                return
            }
            console.log('form is submitting ..... & Form data is ', this.replaceProforma_form.value);
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            this.uploadFileData();

        } else if (type === 'generateInvoice') {
            if (this.generateInvoice_form.invalid) {
                return
            }

            console.log('form is submitting ..... & Form data is ', this.generateInvoice_form.value);
            this.generateInvoiceNumber();
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
        }
    }

    async callBatchRequest(dataEndpointArray) {
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
        return await this.spServices.getFDData(batchGuid, sBatchData);
    }


    batchContents: any = [];
    async submitForm(dataEndpointArray, type: string) {
        const res = await this.callBatchRequest(dataEndpointArray);
        const arrResults = res;
        console.log('--oo ', arrResults);
        if (type === "Mark as Sent to Client" || type === "Reject Proforma") {
            let sts = '';
            sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Status changed to "' + sts + '" Successfully.', detail: '', life: 2000 })
            this.reFetchData();
        } else if (type === "createProforma") {
            this.proformaModal = false;
            await this.fdDataShareServie.callProformaCreation(arrResults[0], this.cleData, this.projectContactsData, this.purchaseOrdersList, this.editorRef, []);
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Proforma Created.', detail: '', life: 2000 })
            this.reFetchData();

        } else if (type === "generateInvoice") {
            const oInv = arrResults[0];
            let proformHtml = this.selectedRowItem.ProformaHtml;

            ////// Invoice line item update
            ///Update InvoiceLineItem
            let iliObj = {
                Status: 'Approved',
                InvoiceLookup: oInv.ID
            }
            let data = [];
            iliObj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            for (let j = 0; j < this.iliByPidRes.length; j++) {
                const element = this.iliByPidRes[j];
                data.push({
                    // Id: element.Id,
                    objData: iliObj,
                    endpoint: this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", element.Id),
                    requestPost: false
                });
            }
            // Update Proforma
            const pObj = {
                Status: 'Approved',
                InvoiceLookup: oInv.ID
            }
            pObj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            const pEndpoint = this.fdConstantsService.fdComponent.addUpdateProforma.update.replace("{{Id}}", this.selectedRowItem.Id);
            const updatePObj = { objData: pObj, endpoint: pEndpoint, requestPost: false }
            data.push(updatePObj);
            await this.callBatchRequest(data);
            ////// Replace date on specific sections only

            if (proformHtml) {
                const proformaDate = this.datePipe.transform(this.selectedRowItem.ProformaDate, 'MMM dd, yyyy');
                proformHtml = proformHtml.replace(new RegExp("Proforma", "g"), "Invoice");
                proformHtml = proformHtml.replace(new RegExp("PROFORMA", "g"), "INVOICE");
                proformHtml = proformHtml.replace(new RegExp("proforma", "g"), "invoice");
                proformHtml = proformHtml.replace(new RegExp(this.selectedRowItem.ProformaNumber, "g"), oInv.InvoiceNumber);
                proformHtml = proformHtml.replace(new RegExp(proformaDate, "g"), this.datePipe.transform(oInv.InvoiceDate, 'MMM dd, yyyy'));
                const invObject = JSON.parse(proformHtml);

                const pdfCall = invObject.pdf;
                pdfCall.Code = oInv.InvoiceNumber;
                pdfCall.WebUrl = this.globalService.sharePointPageObject.webRelativeUrl;
                pdfCall.ID = oInv.ID;
                pdfCall.Type = 'Invoice';
                const oCLE = this.cleData.find(e => e.Title === oInv.ClientLegalEntity);
                pdfCall.ListName = oCLE.ListName;
                pdfCall.HtmlContent = proformHtml;
                const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
                await this.spOperations.executeJS(pdfService, pdfCall);
            }
            this.generateInvoiceModal = false;
            // this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice Generated.', detail: '', life: 2000 });
            this.messageService.add({ key: 'custom', sticky: true, severity: 'success', summary: 'Invoice Generated', detail: 'Invoice Number: ' + oInv.InvoiceNumber });
            this.reFetchData();
        } else if (type === "replaceProforma") {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Success.', detail: '', life: 2000 });
            this.replaceProformaModal = false;
            this.reFetchData();
        }
        this.isPSInnerLoaderHidden = true;

    }

    reFetchData() {
        // this.getRequiredData();
        setTimeout(async () => {
            // Refetch PO/CLE Data
            await this.fdDataShareServie.getClePO();
            // Fetch latest PO & CLE
            this.poInfo();
            this.cleInfo();

            this.getRequiredData();
        }, 300);
    }
    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    enterPOAmtMsg: boolean = false;
    enteredPOAmt(val) {
        console.log('val ', val);
        let amt = parseInt(val);
        let poScheduled = parseFloat(this.selectedPOItem.value.TotalScheduled ? this.selectedPOItem.value.TotalScheduled : 0);
        let poInvoiced = parseFloat(this.selectedPOItem.value.TotalInvoiced ? this.selectedPOItem.value.TotalInvoiced : 0);
        let availableBudget = (this.selectedPOItem.value.Amount ? this.selectedPOItem.value.Amount : 0) - (poScheduled + poInvoiced);
        if (amt > availableBudget) {
            this.enterPOAmtMsg = true;
            this.createProforma_form.get('Amount').setValue('');
        } else {
            this.enterPOAmtMsg = false;
        }
    }

    //for Decimal you can use this as

    onlyDecimalNumberKey(event) {
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
        this.subscription.unsubscribe();
    }

}