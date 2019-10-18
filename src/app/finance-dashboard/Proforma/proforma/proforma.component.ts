import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Message, ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Calendar } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-proforma',
    templateUrl: './proforma.component.html',
    styleUrls: ['./proforma.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class ProformaComponent implements OnInit, OnDestroy {
    tempClick: any;
    proformaRes: any = [];
    proformaCols: any[];
    msgs: Message[] = [];

    // Row Selection Array
    selectedRowData: any = [];

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
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

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
        private commonService: CommonService,
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
        await this.fdDataShareServie.getClePO('proforma');
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
            { field: 'ProformaDate', header: 'Proforma Date', visibility: true, exportable: false },
            { field: 'ProformaType', header: 'Proforma Type', visibility: true },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POC', header: 'POC', visibility: true },
            { field: 'Status', header: 'Status', visibility: true },

            { field: 'AddressType', header: 'AddressType', visibility: false },
            { field: 'POName', header: 'PO Name', visibility: false },
            { field: 'MainPOC', header: 'MainPOC', visibility: false, exportable: false },
            { field: 'ClientLegalEntity', header: 'ClientLegalEntity', visibility: false },
            { field: 'AdditionalInfo', header: 'AdditionalInfo', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'FileURL', header: 'FileURL', visibility: false },
            { field: 'ProformaHtml', header: 'ProformaHtml', visibility: false, exportable: false },
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
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
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
        this.selectedRowData = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = this.getPONumber(element)
            // let resCInfo = await this.fdDataShareServie.getResDetailById(this.rcData, element);
            // if (resCInfo && resCInfo.hasOwnProperty('UserName') && resCInfo.UserName.hasOwnProperty('Title')) {
            //     resCInfo = resCInfo.UserName.Title
            // }
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
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
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
        this.proformaColArray.ProformaNumber = this.commonService.sortData(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.PONumber = this.commonService.sortData(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
        const proformaDate = this.commonService.sortDateArray(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: this.datePipe.transform(a.ProformaDate, "MMM dd, yyyy"), value: a.ProformaDate }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.ProformaDate = proformaDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        this.proformaColArray.ProformaType = this.commonService.sortData(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.ProformaType, value: a.ProformaType }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.Status = this.commonService.sortData(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
        const amount = this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
        this.proformaColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label')
        this.proformaColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.POC = this.commonService.sortData(this.uniqueArrayObj(this.proformaRes.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
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
                //proformaObj.saveObj.serviceDetailHeader = 'PROFORMA DETAILS';
                this.editorRef.serviceDetailHeader = 'PROFORMA DETAILS';
                switch (data.Template) {
                    case 'US':
                        this.editorRef.JapanTemplateCopy = {};
                        this.editorRef.IndiaTemplateCopy = {};
                        this.editorRef.USTemplateCopy = proformaObj.saveObj;
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
                        this.editorRef.JapanTemplateCopy = proformaObj.saveObj;
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
                        this.editorRef.IndiaTemplateCopy = proformaObj.saveObj;
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
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
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
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let invoicesQuery = '';
        let obj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItem);
        obj.filter = obj.filter.replace("{{ProformaLookup}}", this.selectedRowItem.Id);
        invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.InvoiceLineItems.name + '', obj);
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
            if (this.iliByPidRes.length) {
                this.addILIObj = {
                    TaggedAmount: this.selectedRowItem.Amount,
                    IsTaggedFully: 'Yes'
                }
            }
            this.getUniqueItem(arrResults[0]);
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
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
        let cleItem = this.getClEItemByPNum(this.selectedRowItem.ClientLegalEntity);
        let invDate = this.generateInvoice_form.value.InvoiceDate;
        let mmyy = this.datePipe.transform(new Date(invDate), 'MM') + this.datePipe.transform(new Date(invDate), 'yy');
        let invCounter = cleItem.InvoiceCounter ? parseInt(cleItem.InvoiceCounter) + 1 : 1;
        let sNum = '000' + invCounter;
        let sFinalNum = sNum.substr(sNum.length - 4);
        this.invoiceNumber = cleItem.Acronym + '-' + mmyy + '-' + sFinalNum;
        if (this.selectedRowItem.ProformaType === 'oop') {
            this.invoiceNumber = this.invoiceNumber + '-OOP';
        }
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
            State: this.selectedRowItem.State,
            ProformaLookup: this.selectedRowItem.Id
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
            // tslint:disable
            this.selectedRowItem.Amount = parseFloat(this.selectedRowItem.Amount.toFixed(2));
            if (proformaType === 'revenue') {
                if (this.addILIObj.IsTaggedFully === 'Yes') {
                    poObj.ScheduledRevenue = (poItem.ScheduledRevenue ? parseFloat(poItem.ScheduledRevenue.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                    poObj.TotalScheduled = (poItem.TotalScheduled ? parseFloat(poItem.TotalScheduled.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                }
                poObj.InvoicedRevenue = (poItem.InvoicedRevenue ? parseFloat(poItem.InvoicedRevenue.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
                poObj.TotalInvoiced = (poItem.TotalInvoiced ? parseFloat(poItem.TotalInvoiced.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            } else if (proformaType === 'oop') {
                if (this.addILIObj.IsTaggedFully === 'Yes') {
                    poObj.ScheduledOOP = (poItem.ScheduledOOP ? parseFloat(poItem.ScheduledOOP.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                    poObj.TotalScheduled = (poItem.TotalScheduled ? parseFloat(poItem.TotalScheduled.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                }
                poObj.InvoicedOOP = (poItem.InvoicedOOP ? parseFloat(poItem.InvoicedOOP.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
                poObj.TotalInvoiced = (poItem.TotalInvoiced ? parseFloat(poItem.TotalInvoiced.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            }
            // tslint:disable
        }
        poObj['__metadata'] = { type: 'SP.Data.POListItem' };
        const poEndpoint = this.fdConstantsService.fdComponent.addUpdatePO.update.replace("{{Id}}", poItem.ID);

        let updatePOObj = { objData: poObj, endpoint: poEndpoint, requestPost: false }
        data.push(updatePOObj);



        let iliEndpoint = [];
        let pfs: any = [];
        let pfbs: any = [];
        let sows: any = [];
        // Modified by Kaushal on 15.07.2019 to avoid multipe batch request to update

        let pfsItem: any = {};
        let pfbsItems: any = [];
        let sowsItem: any = {};
        // for (let j = 0; j < this.iliByPidRes.length; j++) {
        //     const element = this.iliByPidRes[j];
        // PF 
        // pfsItem = await this.findpfFrompfRes(element);
        this.iliByPidRes.forEach(element => {
            const pfsItems = this.pfresp.filter(pf => pf.Title === element.Title);
            pfsItem = pfsItems.length > 0 ? pfsItems[0] : {};
            if (pfsItem) {
                element.Amount = parseFloat(element.Amount.toFixed(2));
                // InvoicedRevenue: (pfsItem.InvoicedRevenue ? pfsItem.InvoicedRevenue : 0 + element.Amount ? element.Amount : 0),
                if (proformaType === 'revenue') {
                    pfsItem.InvoicedRevenue = pfsItem.InvoicedRevenue ? parseFloat(pfsItem.InvoicedRevenue.toFixed(2)) + element.Amount : 0 + element.Amount;
                    pfsItem.ScheduledRevenue = pfsItem.ScheduledRevenue ? parseFloat(pfsItem.ScheduledRevenue.toFixed(2)) - element.Amount : 0 - element.Amount;
                    pfsItem.Invoiced = pfsItem.Invoiced ? parseFloat(pfsItem.Invoiced.toFixed(2)) + element.Amount : 0 + element.Amount;
                    pfsItem.InvoicesScheduled = pfsItem.InvoicesScheduled ? parseFloat(pfsItem.InvoicesScheduled.toFixed(2)) - element.Amount : 0 - element.Amount
                    pfs.push({
                        Id: pfsItem.Id,
                        InvoicedRevenue: (pfsItem.InvoicedRevenue),
                        ScheduledRevenue: (pfsItem.ScheduledRevenue),
                        Invoiced: (pfsItem.Invoiced),
                        InvoicesScheduled: (pfsItem.InvoicesScheduled),
                    });
                } else if (proformaType === 'oop') {
                    pfsItem.ScheduledOOP = pfsItem.ScheduledOOP ? parseFloat(pfsItem.ScheduledOOP.toFixed(2)) - element.Amount : 0 - element.Amount;
                    pfsItem.InvoicedOOP = pfsItem.InvoicedOOP ? parseFloat(pfsItem.InvoicedOOP.toFixed(2)) + element.Amount : 0 + element.Amount;
                    pfsItem.Invoiced = pfsItem.Invoiced ? parseFloat(pfsItem.Invoiced.toFixed(2)) + element.Amount : 0 + element.Amount;
                    pfsItem.InvoicesScheduled = pfsItem.InvoicesScheduled ? parseFloat(pfsItem.InvoicesScheduled.toFixed(2)) - element.Amount : 0 - element.Amount;
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
            // let pfbsItem = await this.findpfbFrompfbRes(element);
            pfbsItems = this.pfbresp.filter(pfb => pfb.ProjectNumber === element.Title && pfb.POLookup === element.PO);
            if (pfbsItems.length) {
                pfbsItems.forEach(pfbsItem => {
                    if (proformaType === 'revenue') {
                        pfbsItem.InvoicedRevenue = pfbsItem.InvoicedRevenue ? parseFloat(pfbsItem.InvoicedRevenue.toFixed(2)) + element.Amount : 0 + element.Amount;
                        pfbsItem.ScheduledRevenue = pfbsItem.ScheduledRevenue ? parseFloat(pfbsItem.ScheduledRevenue.toFixed(2)) - element.Amount : 0 - element.Amount;
                        pfbsItem.TotalInvoiced = pfbsItem.TotalInvoiced ? parseFloat(pfbsItem.TotalInvoiced.toFixed(2)) + element.Amount : 0 + element.Amount;
                        pfbsItem.TotalScheduled = pfbsItem.TotalScheduled ? parseFloat(pfbsItem.TotalScheduled.toFixed(2)) - element.Amount : 0 - element.Amount;
                        pfbs.push({
                            Id: pfbsItem.Id,
                            InvoicedRevenue: (pfbsItem.InvoicedRevenue),
                            ScheduledRevenue: (pfbsItem.ScheduledRevenue),
                            TotalInvoiced: (pfbsItem.TotalInvoiced),
                            TotalScheduled: (pfbsItem.TotalScheduled),
                        })
                    } else if (proformaType === 'oop') {
                        pfbsItem.ScheduledOOP = pfbsItem.ScheduledOOP ? parseFloat(pfbsItem.ScheduledOOP.toFixed(2)) - element.Amount : 0 - element.Amount;
                        pfbsItem.InvoicedOOP = pfbsItem.InvoicedOOP ? parseFloat(pfbsItem.InvoicedOOP.toFixed(2)) + element.Amount : 0 + element.Amount;
                        pfbsItem.TotalInvoiced = pfbsItem.TotalInvoiced ? parseFloat(pfbsItem.TotalInvoiced.toFixed(2)) + element.Amount : 0 + element.Amount;
                        pfbsItem.TotalScheduled = pfbsItem.TotalScheduled ? parseFloat(pfbsItem.TotalScheduled.toFixed(2)) - element.Amount : 0 - element.Amount;
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
            // SOW
            // let sowsItem = await this.findsowFromsowRes(element);
            const sowItems = this.sowresp.filter(pf => pf.SOWCode === element.SOWCode);
            sowsItem = sowItems.length > 0 ? sowItems[0] : {};
            if (sowsItem) {
                if (proformaType === 'revenue') {
                    sowsItem.InvoicedRevenue = sowsItem.InvoicedRevenue ? parseFloat(sowsItem.InvoicedRevenue.toFixed(2)) + element.Amount : 0 + element.Amount;
                    sowsItem.ScheduledRevenue = sowsItem.ScheduledRevenue ? parseFloat(sowsItem.ScheduledRevenue.toFixed(2)) - element.Amount : 0 - element.Amount;
                    sowsItem.TotalInvoiced = sowsItem.TotalInvoiced ? parseFloat(sowsItem.TotalInvoiced.toFixed(2)) + element.Amount : 0 + element.Amount;
                    sowsItem.TotalScheduled = sowsItem.TotalScheduled ? parseFloat(sowsItem.TotalScheduled.toFixed(2)) - element.Amount : 0 - element.Amount;
                    sows.push({
                        Id: sowsItem.Id,
                        InvoicedRevenue: (sowsItem.InvoicedRevenue),
                        ScheduledRevenue: (sowsItem.ScheduledRevenue),
                        TotalInvoiced: (sowsItem.TotalInvoiced),
                        TotalScheduled: (sowsItem.TotalScheduled),
                    })
                } else if (proformaType === 'oop') {
                    sowsItem.ScheduledOOP = sowsItem.ScheduledOOP ? parseFloat(sowsItem.ScheduledOOP.toFixed(2)) - element.Amount : 0 - element.Amount;
                    sowsItem.InvoicedOOP = sowsItem.InvoicedOOP ? parseFloat(sowsItem.InvoicedOOP.toFixed(2)) + element.Amount : 0 + element.Amount;
                    sowsItem.TotalInvoiced = sowsItem.TotalInvoiced ? parseFloat(sowsItem.TotalInvoiced.toFixed(2)) + element.Amount : 0 + element.Amount;
                    sowsItem.TotalScheduled = sowsItem.TotalScheduled ? parseFloat(sowsItem.TotalScheduled.toFixed(2)) - element.Amount : 0 - element.Amount;
                    sows.push({
                        Id: sowsItem.Id,
                        ScheduledOOP: (sowsItem.ScheduledOOP),
                        InvoicedOOP: (sowsItem.InvoicedOOP),
                        TotalInvoiced: (sowsItem.TotalInvoiced),
                        TotalScheduled: (sowsItem.TotalScheduled),
                    })
                }
            }
        });
        // }

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

        this.submitForm(data, 'generateInvoice');
    }

    // findpfFrompfRes(ili) {
    //     let found = this.pfresp.find((x) => {
    //         if (x.Title === ili.Title) {
    //             return x;
    //         }
    //     })
    //     return found ? found : ''
    // }
    // findpfbFrompfbRes(ili) {
    //     let found = this.pfbresp.find((x) => {
    //         if (x.ProjectNumber === ili.Title) {
    //             return x;
    //         }
    //     })
    //     return found ? found : ''
    // }
    // findsowFromsowRes(ili) {
    //     let found = this.sowresp.find((x) => {
    //         if (x.SOWCode === ili.SOWCode) {
    //             return x;
    //         }
    //     })
    //     return found ? found : ''
    // }

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
                this.messageService.add({ key: 'proformaInfoToast', severity: 'info', summary: 'Info message', detail: 'This file name already exit.Please select another file name.', life: 4000 });
                this.replaceProforma_form.reset();
                return;
            }
        }
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.replaceProforma_form.get('file').setValue('');
                this.messageService.add({ key: 'proformaInfoToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
                return false;
            }
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                console.log('selectedFile ', this.selectedFile);
                console.log('this.fileReader  ', this.fileReader.result);
                let folderPath: string = '/Finance/Proforma/';
                let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity);
                this.filePathUrl = this.spServices.getFileUploadUrl(this.globalService.sharePointPageObject.webRelativeUrl + '/' + cleListName + folderPath, this.selectedFile.name, true);
                // this.filePathUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + cleListName + '' + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" +
                // "&@TargetFileName='" + this.selectedFile.name + "'";
                // this.uploadFileData('');
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
        const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result)
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
        } else if (res.hasError) {
            this.isPSInnerLoaderHidden = true;
            this.messageService.add({ key: 'proformaInfoToast', severity: 'info', summary: 'Info message', detail: 'File not uploaded,Folder / ' + res.message.value + '', life: 3000 })
        }
    }

    createProforma() {
        this.minProformDate = this.commonService.getLastWorkingDay(3, new Date());
        this.proformaModal = true;
    }

    onCLIChange(data: any) {
        console.log(data);
        if (data) {
            let cleItem = data.value;
            this.getPONumberFromCLE(data.value.Title);
            this.generateProformaNumber(cleItem);
            this.getPOCNamesForEditInv(data.value);
        }
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
            let finalVal = isOOP ? (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum + '-OOP') :
                (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum);
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
        if (formType === 'createProforma') {
            this.createProforma_form.reset();
            this.enterPOAmtMsg = false;
            this.proformaModal = false;
        } else if (formType === 'replaceProforma') {
            this.replaceProforma_form.reset();
            this.replaceProformaModal = false;
        } else if (formType === 'generateInvoice') {
            // this.generateInvoice_form.reset();
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
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            let sts = '';
            sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected';
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
            this.submitForm(data, type);
        } else if (type === 'Reject Proforma') {
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
        } else if (type === 'createProforma') {
            if (this.createProforma_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
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
                return;
            }
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            console.log('form is submitting ..... & Form data is ', this.generateInvoice_form.value);
            this.generateInvoiceNumber();
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
        const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
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
            this.messageService.add({ key: 'proformaSuccessToast', severity: 'success', summary: 'Success message', detail: 'Status changed to "' + sts + '" Successfully.', life: 2000 });
            this.reFetchData(type);
        } else if (type === "createProforma") {
            this.proformaModal = false;
            await this.fdDataShareServie.callProformaCreation(arrResults[0], this.cleData, this.projectContactsData, this.purchaseOrdersList, this.editorRef, []);
            this.messageService.add({ key: 'proformaSuccessToast', severity: 'success', summary: 'Success message', detail: 'Proforma Created.', life: 2000 });
            this.reFetchData(type);

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
                const proformaDateSingle = this.datePipe.transform(this.selectedRowItem.ProformaDate, 'MMM d, yyyy');
                proformHtml = proformHtml.replace(new RegExp("Proforma", "g"), "Invoice");
                proformHtml = proformHtml.replace(new RegExp("PROFORMA", "g"), "INVOICE");
                proformHtml = proformHtml.replace(new RegExp("proforma", "g"), "invoice");
                proformHtml = proformHtml.replace(new RegExp(this.selectedRowItem.ProformaNumber, "g"), oInv.InvoiceNumber);
                proformHtml = proformHtml.replace(new RegExp(proformaDate, "g"), this.datePipe.transform(oInv.InvoiceDate, 'MMM dd, yyyy'));
                proformHtml = proformHtml.replace(new RegExp(proformaDateSingle, "g"), this.datePipe.transform(oInv.InvoiceDate, 'MMM dd, yyyy'));
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
                await this.spServices.executeJS(pdfService, pdfCall);
            }
            this.generateInvoiceModal = false;
            this.messageService.add({ key: 'custom', sticky: true, severity: 'success', summary: 'Invoice Generated', detail: 'Invoice Number: ' + oInv.InvoiceNumber });
            this.reFetchData(type);
        } else if (type === "replaceProforma") {
            this.messageService.add({ key: 'proformaSuccessToast', severity: 'success', summary: 'Success message', detail: 'Success.', life: 2000 });
            this.replaceProformaModal = false;
            this.reFetchData(type);
        }
        this.isPSInnerLoaderHidden = true;

    }

    reFetchData(type: string) {
        if (type === "Mark as Sent to Client" || type === "Reject Proforma" || type === "replaceProforma") {
            this.getRequiredData();
        } else if (type === 'createProforma' || type === 'generateInvoice') {
            setTimeout(async () => {
                // Refetch PO/CLE Data
                // this.fdDataShareServie.clePoPiRes = [];
                await this.fdDataShareServie.getClePO('proforma');
                // Fetch latest PO & CLE
                this.poInfo();
                this.cleInfo();
                this.getRequiredData();
            }, 300);
        }

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

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
        this.subscription.unsubscribe();
    }

}