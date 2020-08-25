import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, HostListener, ElementRef, ApplicationRef, NgZone, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Calendar, Table, DialogService } from 'primeng';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AddUpdateProformaDialogComponent } from '../../add-update-proforma-dialog/add-update-proforma-dialog.component';
import { EditInvoiceDialogComponent } from '../../edit-invoice-dialog/edit-invoice-dialog.component';


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

    // Row Selection Array
    selectedRowData: any = [];

    // Show Hide State
    isTemplate4US: boolean = false;

    // Edit Deliverable Form
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
    rightSideBarProforma: boolean = false;
    rightSideBarInvoice: boolean = false;

    // Proforma Templates
    proformatTemplates: any = [];
    proformaAddressType: any = [];
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    pageNumber: number = 0;
    generateInvoiceInProgress: boolean = false;
    expandedRows: any = {};
    editPOC_form:FormGroup;
    editPOCModal:boolean = false;

    @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', { static: false }) editorRef: EditorComponent;
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

    @ViewChild('pfc', { static: false }) proformaTable;

    // List of Subscribers
    private subscription: Subscription = new Subscription();
    FolderName: string;
    SelectedFile: any;
    invoiceCols: { field: string; header: string; }[];
    selectedProforma: any;
    listOfPOCNames: any = [];
    selectedOption: any;


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

    async ngOnInit() {
        // Create FOrm Field
        this.proformaAddressType = this.fdConstantsService.fdComponent.addressTypes;
        this.proformatTemplates = this.fdConstantsService.fdComponent.ProformaTemplates;
        this.createRepProFormField()
        this.createInvoiceFormFiled();
        this.createPocFormField();

        //Get  User Info
        const currentUserId = this.globalService.currentUser.userId;
        this.currentUserInfo(currentUserId);

        // POC & PO Number
        // this.projectInfo();
        this.projectContacts();
        await this.cleInfo();
        await this.poInfo();
        this.currencyInfo();
        this.resourceCInfo();

        // Get Required Proforma Data
        this.getRequiredData();

        this.createProformaCols();
        this.getPurchaseOrderList();
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
                // console.log('PO Data ', this.purchaseOrdersList);
            }
        }))
    }

    // Project COntacts
    projectContactsData: any = [];
    projectContacts() {
        this.subscription.add(this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                // console.log('this.projectContactsData ', this.projectContactsData);
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
                // console.log('US States Data ', this.usStatesData);
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
                // console.log('currency Data ', this.currencyData);
            }
        }))
    }

    setCurrentPage(n: number) {
        let paging = {
            first: ((n - 1) * this.proformaTable.rows),
            rows: this.proformaTable.rows
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
                // console.log('CLE Data ', this.cleData);
            }
        }))
    }

    // Resource Categorization
    rcData: any = [];
    resourceCInfo() {
        this.subscription.add(this.fdDataShareServie.defaultRCData.subscribe((res) => {
            if (res) {
                this.rcData = res;
                // console.log('Resource Categorization ', this.rcData);
            }
        }))
    }

    // Logged In user Info
    loggedInUserInfo: any = [];
    loggedInUserGroup: any = [];
    async currentUserInfo(userId) {
        this.loggedInUserInfo = [];
        this.loggedInUserGroup = [];
        //let curruentUsrInfo = await this.spServices.getCurrentUser();
        this.commonService.SetNewrelic('Finance-Dashboard', 'proforma', 'getUserInfo');
        let currentUsrInfo = await this.spServices.getUserInfo(userId);
        this.loggedInUserInfo = currentUsrInfo.Groups.results;
        this.loggedInUserInfo.forEach(element => {
            if (element) {
                this.loggedInUserGroup.push(element.LoginName);
            }
        });
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

    createPocFormField() {
        this.editPOC_form= this.fb.group({
            POCName: ["" , Validators.required]
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
            { field: 'Reason', header: 'Reason', visibility: false },
            { field: 'State', header: 'State', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },
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


    // Get Proformas InvoiceItemList
    confirmedILIarray: any = [];
    async getRequiredData() {
        this.expandedRows = {};
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const prfObj = Object.assign({}, this.fdConstantsService.fdComponent.proformaForMangerIT);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma-proforma', 'performaForManager');
        const res = await this.spServices.readItems(this.constantService.listNames.Proforma.name, prfObj);
        const arrResults = res.length ? res : [];
        // if (arrResults.length) {
        this.formatData(arrResults);
        // console.log(arrResults);
        // }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    async formatData(data: any[]) {
        this.proformaRes = [];
        this.selectedRowData = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = this.getPONumber(element)
            this.proformaRes.push({
                Id: element.ID,
                ProformaNumber: element.Title,
                PO: element.PO,
                PONumber: poItem.Number,
                POName: poItem.NameST,
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
                Reason: element.Reason,
                State: element.State,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                ModifiedBy: element.Editor ? element.Editor.Title : '',
                type: 'Proforma'
            })
        }
        this.proformaRes = [...this.proformaRes];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues(this.proformaRes);

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

    createColFieldValues(resArray) {
        this.proformaColArray.ProformaNumber = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaNumber, value: a.ProformaNumber }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.PONumber = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
        const proformaDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ProformaDate, "MMM dd, yyyy"), value: a.ProformaDate }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.ProformaDate = proformaDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        this.proformaColArray.ProformaType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProformaType, value: a.ProformaType }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));
        const amount = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
        this.proformaColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label')
        this.proformaColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.proformaColArray.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POC, value: a.POC }; return b; }).filter(ele => ele.label)));
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


    checkSelectedRowData() {
        // console.log('Event ', this.selectedRowData);
    }

    convertToExcelFile(cnf1) {
        cnf1.exportCSV();
    }

    confirm1(obj) {

        this.commonService.confirmMessageDialog(obj.title, obj.msg, null, ['Yes', 'No'], false).then(async Confirmation => {
            if (Confirmation === 'Yes') {
                this.onSubmit(obj.type);
            }
            else if (Confirmation === 'No') {

                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'You have canceled', false);
            }
        });

    }

    items: any[];
    confirmDialog: any = {
        title: '',
        text: ''
    }
    // Open popups
    openPopup(data, popUpData, proforma) {
        // console.log('Row data  ', data);

        this.selectedProforma = proforma ? proforma : undefined;
        this.selectedOption = data;
        let proformaSts: string = '';
        this.items = [];

        if (data.type === 'Proforma') {
            if (data.Status) {
                proformaSts = data.Status.toLowerCase();
            }

            this.items = proformaSts === 'created' ? [
                { label: 'Mark as Sent to Client', command: (e) => this.openMenuContent(e, data) },
            ] : [
                    { label: 'Generate Invoice', command: (e) => this.openMenuContent(e, data) },
                ];

            if (data.ProformaHtml) {
                this.items.push({ label: 'Edit Proforma', command: (e) => this.openMenuContent(e, data) });

            }

            if (!data.FileURL && (data.Template === 'US' || data.Template === 'India' || data.Template === 'Japan')) {
                this.items.push({ label: 'Regenerate Proforma', command: (e) => this.openMenuContent(e, data) });
            }

            this.items.push({ label: 'Edit Poc', command: (e) => this.openMenuContent(e, data) },{ label: 'Reject Proforma', command: (e) => this.openMenuContent(e, data) }, { label: 'Replace Proforma', command: (e) => this.openMenuContent(e, data) })
        }
        else {
            this.items.push(
                { label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) },
                { label: 'View Project Details', command: (e) => this.openMenuContent(e, data) },
            )
        }

        this.items.push(
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        )

        if (this.items.length === 0) {
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


        this.confirmDialog.title = event.item.label;
        this.submitBtn.isClicked = false;
        this.formSubmit.isSubmit = false;
        this.selectedRowItem = data;
        if (data.type === 'Proforma') {

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
                this.timeline.showTimeline(data.Id, 'FD', this.constantService.listNames.Proforma.name);
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
                this.rightSideBarProforma = !this.rightSideBarProforma;
                return;
            }
            else if (this.confirmDialog.title === 'Regenerate Proforma') {
                this.generateExistingProforma(data);
            } else if (this.confirmDialog.title === 'Edit Poc') {
                this.editPOCModal = true;
                this.getPOCNames(data);
            }
        } else {
            if (this.confirmDialog.title.toLowerCase() === 'show history') {
                this.timeline.showTimeline(data.Id, 'FD', this.constantService.listNames.InvoiceLineItems.name);

            } else if (event.item.label === 'Details') {
                this.rightSideBarInvoice = !this.rightSideBarInvoice;
                return;
            }
            else if (event.item.label === 'Edit Line item') {
                this.selectedRowItem.ProformaDate = this.selectedProforma.ProformaDate;
                const ref = this.dialogService.open(EditInvoiceDialogComponent, {
                    header: 'Edit Line item',
                    width: '75vw',
                    data: {
                        InvoiceType: this.selectedRowItem.ScheduleType,
                        projectContactsData: this.projectContactsData,
                        selectedRowItem: this.selectedRowItem,
                    },
                    contentStyle: { 'max-height': '80vh', 'overflow-y': 'auto' },
                    closable: false,
                });
                ref.onClose.subscribe((editInvoice: any) => {
                    if (editInvoice) {
                        const batchURL = this.fdDataShareServie.EditInvoiceDialogProcess(this.selectedRowItem.ScheduleType,this.selectedRowItem, editInvoice)
                        this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma', 'updateInvoiceLineItem');

                        if (this.selectedProforma) {
                            const proformaData = {
                                __metadata: { type: this.constantService.listNames.Proforma.type },
                                FileURL: null,
                                ProformaHtml: null
                            }
                            const url = this.spServices.getItemURL(this.constantService.listNames.Proforma.name, +this.selectedProforma.Id);
                            this.commonService.setBatchObject(batchURL, url, proformaData, this.constantService.Method.PATCH, this.constantService.listNames.Proforma.name);
                        }
                        this.submitForm(batchURL, 'editInvoice');
                    }
                });
            } else if (event.item.label === 'View Project Details') {
                window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/projectMgmt?ProjectCode=' + data.ProjectCode);
            }

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



    // Generate Invoice Data start
    iliByPidRes: any = [];
    addILIObj: any = {
        TaggedAmount: 0,
        IsTaggedFully: 'No'
    };
    async getILIByPID() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const iliObj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItem);
        iliObj.filter = iliObj.filter.replace('{{ProformaLookup}}', this.selectedRowItem.Id);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma-proforma', 'GetInviceLineItem');
        const res = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, iliObj);
        const arrResults = res.length ? res : [];
        // if (arrResults.length) {
        // console.log(arrResults[0]);
        this.iliByPidRes = arrResults;
        if (this.iliByPidRes.length) {
            this.addILIObj = {
                TaggedAmount: this.selectedRowItem.Amount,
                IsTaggedFully: 'Yes'
            };
        } else {
            this.addILIObj = {
                TaggedAmount: 0,
                IsTaggedFully: 'No'
            };
        }
        this.getUniqueItem(arrResults);
        // }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    getUniqueItem(data: any[]) {
        let uniqueitem = this.uniqueArrayObj1(data);
        // console.log('uniqueitem ', uniqueitem);
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
        // const batchContents = new Array();
        // const batchGuid = this.spServices.generateUUID();
        const batchUrl = [];
        this.invoicesQuery = [];
        for (let j = 0; j < array.length; j++) {
            const element = array[j];
            // PF
            const pfObj = Object.assign({}, this.queryConfig);
            pfObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinances.name,
                this.fdConstantsService.fdComponent.projectFinances);
            pfObj.url = pfObj.url.replace('{{ProjectCode}}', element.item.Title);
            pfObj.listName = this.constantService.listNames.ProjectFinances.name;
            pfObj.type = 'GET';
            batchUrl.push(pfObj);
            // PFB
            const pfbObj = Object.assign({}, this.queryConfig);
            pfbObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinanceBreakup.name,
                this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO);
            pfbObj.url = pfbObj.url.replace('{{ProjectCode}}', element.item.Title).replace('{{PO}}', element.item.PO);
            pfbObj.listName = this.constantService.listNames.ProjectFinanceBreakup.name;
            pfbObj.type = 'GET';
            batchUrl.push(pfbObj);
            // SOW
            const sowObj = Object.assign({}, this.queryConfig);
            sowObj.url = this.spServices.getReadURL(this.constantService.listNames.SOW.name,
                this.fdConstantsService.fdComponent.sowForIG);
            sowObj.url = sowObj.url.replace('{{SOWCode}}', element.item.SOWCode);
            sowObj.listName = this.constantService.listNames.SOW.name;
            sowObj.type = 'GET';
            batchUrl.push(sowObj);
            this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma-proforma', 'GetPFPFBForPOSow');
            const res = await this.spServices.executeBatch(batchUrl);

            const arrResults = res.length ? res.map(a => a.retItems) : [];
            if (arrResults.length) {
                this.pfresp = arrResults[0] ? arrResults[0] : [];
                this.pfbresp = arrResults[1] ? arrResults[1] : [];
                this.sowresp = arrResults[2] ? arrResults[2] : [];
                // console.log('this.pfresp ', this.pfresp);
                // console.log('this.pfbresp ', this.pfbresp);
                // console.log('this.sowresp ', this.sowresp);
            }
            // });

        }
    }


    // Generate Invoice Number
    invoiceNumber: any;
    generateInvoiceNumber() {
        if (!this.generateInvoiceInProgress) {
            this.generateInvoiceInProgress = true;
            this.invoiceNumber = '';
            this.addUpdateRequired();
            this.generateInvoiceInProgress = false;
        }
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
        const poItem = this.getPOItemByPOId(this.selectedRowItem);
        const cleItem = this.getClEItemByPNum(this.selectedRowItem.ClientLegalEntity);
        const invDate = this.generateInvoice_form.value.InvoiceDate;
        const mmyy = this.datePipe.transform(new Date(invDate), 'MM') + this.datePipe.transform(new Date(invDate), 'yy');
        const invCounter = cleItem.InvoiceCounter ? +(cleItem.InvoiceCounter) + 1 : 1;
        const sNum = '000' + invCounter;
        const sFinalNum = sNum.substr(sNum.length - 4);
        this.invoiceNumber = cleItem.Acronym + '-' + mmyy + '-' + sFinalNum;
        if (this.selectedRowItem.ProformaType === 'oop') {
            this.invoiceNumber = this.invoiceNumber + '-OOP';
        }
        // console.log('this.invoiceNumber ', this.invoiceNumber);

        // Final Array
        const data = [];
        const batchUrl = [];
        // Add Invoice
        const invData = {
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
        };
        invData['__metadata'] = { type: this.constantService.listNames.Invoices.type };

        const invObj = Object.assign({}, this.queryConfig);
        invObj.url = this.spServices.getReadURL(this.constantService.listNames.Invoices.name);
        invObj.listName = this.constantService.listNames.Invoices.name;
        invObj.type = 'POST';
        invObj.data = invData;
        batchUrl.push(invObj);

        // const iEndpoint = this.fdConstantsService.fdComponent.addUpdateInvoice.create;
        // let invobj = { objData: invData, endpoint: iEndpoint, requestPost: true }
        // data.push(invobj);


        // Get Cle
        const cleData = {
            ID: cleItem.Id,
            InvoiceCounter: cleItem.InvoiceCounter ? cleItem.InvoiceCounter + 1 : 1
        };
        cleData['__metadata'] = { type: this.constantService.listNames.ClientLegalEntity.type };

        const cleObj = Object.assign({}, this.queryConfig);
        cleObj.url = this.spServices.getItemURL(this.constantService.listNames.ClientLegalEntity.name, +cleItem.Id);
        cleObj.listName = this.constantService.listNames.ClientLegalEntity.name;
        cleObj.type = 'PATCH';
        cleObj.data = cleData;
        batchUrl.push(cleObj);
        // const cleEndpoint = this.fdConstantsService.fdComponent.addUpdateClientLegalEntity.update.replace('{{Id}}', cleItem.Id);
        // let updateCle = { objData: cleObj, endpoint: cleEndpoint, requestPost: false }
        // data.push(updateCle);

        // // Update Proforma // ommited as it is called in call batch request
        // let pObj = {
        //     Status: 'Approved'
        // }
        // const pEndpoint = this.fdConstantsService.fdComponent.addUpdateProforma.update.replace("{{Id}}", this.selectedRowItem.Id);
        // let updatePObj = { objData: pObj, endpoint: pEndpoint, requestPost: false }
        // data.push(updatePObj);

        let proformaType: any = '';
        /// update PO
        const poData: any = {};
        if (this.selectedRowItem) {
            proformaType = this.selectedRowItem.ProformaType;
            // tslint:disable
            this.selectedRowItem.Amount = parseFloat(this.selectedRowItem.Amount.toFixed(2));
            if (proformaType === 'revenue') {
                if (this.addILIObj.IsTaggedFully === 'Yes') {
                    poData.ScheduledRevenue = (poItem.ScheduledRevenue ? parseFloat(poItem.ScheduledRevenue.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                    poData.TotalScheduled = (poItem.TotalScheduled ? parseFloat(poItem.TotalScheduled.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                }
                poData.InvoicedRevenue = (poItem.InvoicedRevenue ? parseFloat(poItem.InvoicedRevenue.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
                poData.TotalInvoiced = (poItem.TotalInvoiced ? parseFloat(poItem.TotalInvoiced.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            } else if (proformaType === 'oop') {
                if (this.addILIObj.IsTaggedFully === 'Yes') {
                    poData.ScheduledOOP = (poItem.ScheduledOOP ? parseFloat(poItem.ScheduledOOP.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                    poData.TotalScheduled = (poItem.TotalScheduled ? parseFloat(poItem.TotalScheduled.toFixed(2)) - this.selectedRowItem.Amount : 0 - this.selectedRowItem.Amount);
                }
                poData.InvoicedOOP = (poItem.InvoicedOOP ? parseFloat(poItem.InvoicedOOP.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
                poData.TotalInvoiced = (poItem.TotalInvoiced ? parseFloat(poItem.TotalInvoiced.toFixed(2)) + this.selectedRowItem.Amount : 0 + this.selectedRowItem.Amount);
            }
            // tslint:disable
        }
        poData['__metadata'] = { type: this.constantService.listNames.PO.type };

        const poObj = Object.assign({}, this.queryConfig);
        poObj.url = this.spServices.getItemURL(this.constantService.listNames.PO.name, +poItem.ID);
        poObj.listName = this.constantService.listNames.PO.name;
        poObj.type = 'PATCH';
        poObj.data = poData;
        batchUrl.push(poObj);

        // const poEndpoint = this.fdConstantsService.fdComponent.addUpdatePO.update.replace("{{Id}}", poItem.ID);

        // let updatePOObj = { objData: poObj, endpoint: poEndpoint, requestPost: false }
        // data.push(updatePOObj);



        // let iliEndpoint = [];
        let pfs: any = [];
        let pfbs: any = [];
        let sows: any = [];
        let pfsItem: any = {};
        let pfbsItems: any = [];
        let sowsItem: any = {};
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
                element['__metadata'] = { type: this.constantService.listNames.ProjectFinances.type };
                const pfObj = Object.assign({}, this.queryConfig);
                pfObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinances.name, +element.Id);
                pfObj.listName = this.constantService.listNames.ProjectFinances.name;
                pfObj.type = 'PATCH';
                pfObj.data = element;
                batchUrl.push(pfObj);
                // data.push({
                //     objData: element,
                //     endpoint: this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", element.Id),
                //     requestPost: false
                // });
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
                // data.push({
                //     objData: element,
                //     endpoint: this.fdConstantsService.fdComponent.addUpdateProjectFinanceBreakup.update.replace("{{Id}}", element.Id),
                //     requestPost: false
                // });
            }
        }

        if (sows.length) {
            for (let sow = 0; sow < sows.length; sow++) {
                const element = sows[sow];
                element['__metadata'] = { type: this.constantService.listNames.SOW.type };

                const sowObj = Object.assign({}, this.queryConfig);
                sowObj.url = this.spServices.getItemURL(this.constantService.listNames.SOW.name, +element.Id);
                sowObj.listName = this.constantService.listNames.SOW.name;
                sowObj.type = 'PATCH';
                sowObj.data = element;
                batchUrl.push(sowObj);

                // data.push({
                //     objData: element,
                //     endpoint: this.fdConstantsService.fdComponent.addUpdateSow.update.replace("{{Id}}", element.Id),
                //     requestPost: false
                // });
            }
        }

        this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma-proforma', 'submitingForm');
        this.submitForm(batchUrl, 'generateInvoice');
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

    get isValidReplaceProformaForm() {
        return this.replaceProforma_form.controls;
    }
    get isValidGenerateInvoiceForm() {
        return this.generateInvoice_form.controls;
    }

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;

    //*************************************************************************************************
    // new File uplad function updated by Maxwell
    // ************************************************************************************************


    onFileChange(event, folderName) {
        let existingFile = this.selectedRowItem.FileURL ? this.selectedRowItem.FileURL.split('/') : [];
        if (existingFile) {
            let file = existingFile[existingFile.length - 1];
            // let fileName = file.substr(0, file.indexOf('.'));
            // console.log('fileName  ', file);
            if (file === event.target.files[0].name) {

                this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.FileAlreadyExist, false);
                this.replaceProforma_form.reset();
                return;
            }
        }
        // this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.replaceProforma_form.get('file').setValue('');

                this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.SpecialCharMsg, false);
                return false;
            }
            let cleListName = this.getCLEListNameFromCLE(this.selectedRowItem.ClientLegalEntity)
            this.FolderName = cleListName + '/Finance/Proforma';
            this.SelectedFile.push(new Object({ name: this.selectedFile.name, file: this.selectedFile }));
        }
    }


    async uploadFileData() {
        const batchUrl = [];
        this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma', 'uploadFile');


        this.commonService.UploadFilesProgress(this.SelectedFile, this.FolderName, true).then(async uploadedfile => {
            if (this.SelectedFile.length > 0 && this.SelectedFile.length === uploadedfile.length) {
                if (uploadedfile[0].hasOwnProperty('odata.error') || uploadedfile[0].hasError) {
                    this.submitBtn.isClicked = false;

                    this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.FileNotUploaded, false);
                } else if (uploadedfile[0].ServerRelativeUrl) {
                    this.isPSInnerLoaderHidden = false;
                    let prfData = {
                        FileURL: uploadedfile[0].ServerRelativeUrl ? uploadedfile[0].ServerRelativeUrl : '',
                        ProformaHtml: null
                    }
                    prfData['__metadata'] = { type: this.constantService.listNames.Proforma.type };
                    const invObj = Object.assign({}, this.queryConfig);
                    invObj.url = this.spServices.getItemURL(this.constantService.listNames.Proforma.name, +this.selectedRowItem.Id);
                    invObj.listName = this.constantService.listNames.Proforma.name;
                    invObj.type = 'PATCH';
                    invObj.data = prfData;
                    batchUrl.push(invObj);
                    this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma-proforma', 'uploadFileUpdateProforma');
                    this.submitForm(batchUrl, 'replaceProforma');
                }
            }
        });
    }

    getCLEListNameFromCLE(cleName) {
        let found = this.cleData.find((x) => {
            if (x.Title === cleName) {
                return x;
            }
        })
        return found ? found.ListName : ''
    }


    createProforma() {
        this.minProformDate = this.commonService.getLastWorkingDay(3, new Date());
        this.proformaModal = true;
    }








    // updatePrformaNumFromPT(cle, ptVal: any) {
    //     // console.log(cle);
    //     // let pt = this.createProforma_form.value.ProformaType.value;
    //     this.generateProformaNumber(cle);
    //     // let isOOP = this.createProforma_form.value.ProformaType ? true : false;
    // }



    pocChange(val) {
        // console.log(val)
    }

    cancelFormSub(formType) {
        if (formType === 'createProforma') {
            // this.createProforma_form.reset();
            // this.enterPOAmtMsg = false;
            this.proformaModal = false;
        } else if (formType === 'replaceProforma') {
            this.replaceProforma_form.reset();
            this.replaceProformaModal = false;
        } else if (formType === 'generateInvoice') {
            // this.generateInvoice_form.reset();
            this.generateInvoiceModal = false;
        } else if (formType === 'editPOC') {
            // this.generateInvoice_form.reset();
            this.editPOCModal = false;
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
        // console.log('type ', type);
        const batchUrl = [];
        if (type === 'Mark as Sent to Client') {
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            let prfData = {
                __metadata: { type: this.constantService.listNames.Proforma.type },
                Status: type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'
            }
            this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.Proforma.name, +this.selectedRowItem.Id), prfData, this.constantService.Method.PATCH, this.constantService.listNames.Proforma.name);

            this.submitForm(batchUrl, type);
        } else if (type === 'Reject Proforma') {
            let prfData = {
                __metadata: { type: this.constantService.listNames.Proforma.type },
                Status: 'Rejected'
            }

            this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.Proforma.name, +this.selectedRowItem.Id), prfData, this.constantService.Method.PATCH, this.constantService.listNames.Proforma.name);

            for (let j = 0; j < this.iliByPidRes.length; j++) {
                let invData = {
                    __metadata: { type: this.constantService.listNames.InvoiceLineItems.type },
                    Status: 'Confirmed',
                    ProformaLookup: null
                }
                this.commonService.setBatchObject(batchUrl, this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, + this.iliByPidRes[j].Id), invData, this.constantService.Method.PATCH, this.constantService.listNames.InvoiceLineItems.name);
            }
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            this.submitForm(batchUrl, type);
        } else if (type === 'replaceProforma') {
            if (this.replaceProforma_form.invalid) {
                return;
            }
            else if (this.selectedFile && this.selectedFile.size === 0) {

                this.commonService.showToastrMessage(this.constantService.MessageType.error, this.constantService.Messages.ZeroKbFile.replace('{{fileName}}', this.selectedFile.name), false);
                return;
            }
            this.submitBtn.isClicked = true;
            this.uploadFileData();
        } else if (type === 'generateInvoice') {
            if (this.generateInvoice_form.invalid) {
                return;
            }
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            // console.log('form is submitting ..... & Form data is ', this.generateInvoice_form.value);
            this.generateInvoiceNumber();
        } else if(type == 'editPOC') {
            if(this.editPOC_form.invalid) {
                return;
            }
            this.setPOC();
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
        }
    }

    batchContents: any = [];
    async submitForm(dataEndpointArray, type: string) {

        const res = await this.spServices.executeBatch(dataEndpointArray);
        const arrResults = res.length ? res.map(a => a.retItems) : [];
        // console.log('--oo ', arrResults);
        if (type === "Mark as Sent to Client" || type === "Reject Proforma") {
            let sts = '';
            sts = type === 'Mark as Sent to Client' ? 'Sent' : 'Rejected'

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.ProformaNumber + ' ' + 'Status changed to "' + sts + '" Successfully.', true);
            this.reFetchData(type);
        } else if (type === "createProforma") {
            await this.fdDataShareServie.callProformaCreation(arrResults[0], this.cleData, this.projectContactsData, this.purchaseOrdersList, this.editorRef, []);

            this.commonService.showToastrMessage(this.constantService.MessageType.success, arrResults[0].Title + ' ' + 'Proforma Created.', true);
            this.reFetchData(type);

        } else if (type === "generateInvoice") {
            const oInv = arrResults[0];
            let proformHtml = this.selectedRowItem.ProformaHtml;
            const batchUrl = [];
            ////// Invoice line item update
            ///Update InvoiceLineItem
            let iliData = {
                Status: 'Approved',
                InvoiceLookup: oInv.ID
            }
            // let data = [];
            iliData['__metadata'] = { type: this.constantService.listNames.InvoiceLineItems.type };
            for (let j = 0; j < this.iliByPidRes.length; j++) {
                const element = this.iliByPidRes[j];
                const iliObj = Object.assign({}, this.queryConfig);
                iliObj.url = this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, +element.Id);
                iliObj.listName = this.constantService.listNames.InvoiceLineItems.name;
                iliObj.type = 'PATCH';
                iliObj.data = iliData;
                batchUrl.push(iliObj);
            }
            // Update Proforma
            const proformaData = {
                Status: this.constantService.STATUS.APPROVED,
                InvoiceLookup: oInv.ID
            }
            proformaData['__metadata'] = { type: this.constantService.listNames.Proforma.type };
            const prfObj = Object.assign({}, this.queryConfig);
            prfObj.url = this.spServices.getItemURL(this.constantService.listNames.Proforma.name, +this.selectedRowItem.Id);
            prfObj.listName = this.constantService.listNames.Proforma.name;
            prfObj.type = 'PATCH';
            prfObj.data = proformaData;
            batchUrl.push(prfObj);
            this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma-proforma', 'UpdateProforma');
            await this.spServices.executeBatch(batchUrl);
            ////// Replace date on specific sections only
            if (proformHtml) {
                await this.fdDataShareServie.createInvoice(proformHtml, this.selectedRowItem, oInv, this.cleData)
            }
            this.generateInvoiceModal = false;
            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Invoice Number: ' + oInv.InvoiceNumber, true);
            this.reFetchData(type);
        } else if (type === "replaceProforma") {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, this.selectedRowItem.ProformaNumber + ' ' + 'Success.', true);
            this.replaceProformaModal = false;
            this.reFetchData(type);
        }
        else if (type === 'editInvoice') {
            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Invoice Updated.', false);
            this.reFetchData(type);
        } else if (type === 'editPOC') {
            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Proforma POC Updated.', false);
            this.editPOCModal = false;
            this.reFetchData(type);
        }
        this.isPSInnerLoaderHidden = true;

    }

    async reFetchData(type: string) {
        if (type === "Mark as Sent to Client" || type === "Reject Proforma" || type === "replaceProforma" || type === 'editInvoice' || type === 'editPOC') {
            await this.getRequiredData();
        } else if (type === 'createProforma' || type === 'generateInvoice') {
            // Refetch PO/CLE Data
            // this.fdDataShareServie.clePoPiRes = [];
            await this.fdDataShareServie.getClePO('proforma');
            // Fetch latest PO & CLE
            this.poInfo();
            this.cleInfo();
            await this.getRequiredData();
        }
        this.cdr.detectChanges();
        setTimeout(() => {
            this.setCurrentPage(this.currentPageNumber ? this.currentPageNumber : 0);
            console.log('this.pageNumber ', this.pageNumber);
        }, 1000);

    }
    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
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

    isOptionFilter: boolean;
    optionFilter(event: any) {
        if (event.target.value) {
            this.isOptionFilter = false;
        }
    }

    ngAfterViewChecked() {
        if (this.proformaRes.length && this.isOptionFilter) {
            let obj = {
                tableData: this.proformaTable,
                colFields: this.proformaColArray
            }
            // console.log('obj.tableData.filteredValue ', obj.tableData.filteredValue);
            if (obj.tableData.filteredValue) {
                this.commonService.updateOptionValues(obj);
            } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
                this.createColFieldValues(obj.tableData.value);
                this.isOptionFilter = false;
            }
            this.cdr.detectChanges();
        }
    }

    isEmpty(obj, firstColFilter) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && firstColFilter[prop]) {
                // console.log(this.proformaColArray[prop]);
            } else {
                this.firstFilterCol(this.proformaTable.filteredValue, prop);
            }
        }
    }

    firstFilterCol(array, colName) {
        this.proformaColArray[colName] = [];
        let totalArr = array.map(item => item[colName]);
        if (colName.toLowerCase().includes("date")) {
            totalArr = this.commonService.sortDateArray(this.uniqueArrayObj(totalArr.map(a => { let b = { label: this.datePipe.transform(a, "MMM dd, yyyy"), value: a }; return b; }).filter(ele => ele.label)));
        }

        // const uniqueTotalArr = totalArr.filter((item, index) => totalArr.indexOf(item) === index);
        const uniqueTotalArr = Array.from(new Set(totalArr));
        let tempArr = [];
        for (let i = 0; i < uniqueTotalArr.length; i++) {
            const element = uniqueTotalArr[i];
            if (colName.toLowerCase().includes("date")) {
                tempArr.push({ label: this.datePipe.transform(element, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(element, 'MMM dd, yyyy')) });
            } else {
                tempArr.push({ label: element, value: element });
            }
        }
        // console.log(tempArr);
        this.proformaColArray[colName] = [...tempArr];
    }

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
        this.subscription.unsubscribe();
    }



    async generateExistingProforma(rowItem) {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        if (this.projectInfoData.length === 0) {
            await this.projectInfo();
        }
        if (this.cleData.find(c => c.Title === rowItem.ClientLegalEntity)) {
            const res = await this.spServices.checkFileExist(this.globalService.sharePointPageObject.webAbsoluteUrl + '/' + this.cleData.find(c => c.Title === rowItem.ClientLegalEntity).ListName);
            if (res.hasOwnProperty('status')) {
                if (res.status === 404) {

                    this.commonService.showToastrMessage(this.constantService.MessageType.error, rowItem.ProformaNumber + ' Proforma not created. Folder Not Found.', true);
                    this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
                }
                else {
                    const response = await this.getILIByPIDForProforma(rowItem.Id);
                    const projectAppendix = await this.createProjectAppendix(this.projectContactsData, response);
                    // tslint:disable-next-line: max-line-length
                    await this.fdDataShareServie.callProformaCreation(rowItem, this.cleData, this.projectContactsData, this.purchaseOrdersList, this.editorRef, projectAppendix);
                    this.reFetchData('createProforma');

                    setTimeout(() => {
                        this.commonService.showToastrMessage(this.constantService.MessageType.success, rowItem.ProformaNumber + ' Proforma Created.', false);
                    }, 500);

                }
            }
        }
        else {
            this.commonService.showToastrMessage(this.constantService.MessageType.error, rowItem.ProformaNumber + ' Proforma not created. Client Not Found.', true);
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        }
    }


    async createProjectAppendix(prjContacts, selectedProjects) {

        const projectAppendix = [];
        let projects = [];
        const projectProcessed = [];
        const callProjects = [];
        selectedProjects.forEach(element => {
            if (projectProcessed.indexOf(element.Title) === -1) {
                const project = this.projectInfoData.find(e => e.ProjectCode === element.Title);
                if (project) {
                    projects.push(project);
                    projectProcessed.push(project.ProjectCode);
                } else {
                    callProjects.push(element.Title);
                }
            }
        });
        if (callProjects.length) {
            const batchURL = [];
            const options = {
                data: null,
                url: '',
                type: '',
                listName: ''
            };
            let callCount = 0;
            let retProjects = [];
            for (const element of callProjects) {
                const getPIData = Object.assign({}, options);
                getPIData.url = this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name,
                    this.fdConstantsService.fdComponent.projectInfoCode);
                getPIData.url = getPIData.url.replace('{{ProjectCode}}', element);
                getPIData.listName = this.constantService.listNames.ProjectInformation.name;
                getPIData.type = 'GET';
                batchURL.push(getPIData);
                callCount++;
                if (callCount % 100 === 0) {
                    const innerResults = await this.spServices.executeBatch(batchURL);
                    retProjects = [...retProjects, ...innerResults];
                    batchURL.length = 0;
                }
            }
            const remainingResults = await this.spServices.executeBatch(batchURL);
            retProjects = [...retProjects, ...remainingResults];
            const mappedProjects = retProjects.map(obj => obj.retItems.length ? obj.retItems[0] : []);
            projects = [...projects, ...mappedProjects];
        }
        const appendixObj = { dvcode: '', cactusSpCode: '', title: '', poc: '', amount: '' };
        selectedProjects.forEach(element => {
            const project = projects.find(e => e.ProjectCode === element.Title);
            const appendix = Object.assign({}, appendixObj);
            if (project) {
                const projectContact = prjContacts.find(pc => pc.ID === project.PrimaryPOC);
                appendix.dvcode = project.WBJID ? project.WBJID : '';
                appendix.cactusSpCode = project.ProjectCode ? project.ProjectCode : '';
                appendix.title = project.Title ? project.Title : '';
                appendix.poc = projectContact ? projectContact.FullNameCC : '';
            }
            appendix.amount = element.Amount;
            projectAppendix.push(appendix);
        });

        return projectAppendix;
    }


    async getILIByPIDForProforma(id) {


        const iliObj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItem);
        iliObj.filter = iliObj.filter.replace('{{ProformaLookup}}', id);
        this.commonService.SetNewrelic('Finance-Dashboard', 'PDFEditing-editor', 'readInviceLineItem');
        const res = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, iliObj);
        const arrResults = res.length ? res : [];
        return arrResults;
    }

    async OnRowExpand(event) {
        event.data.loaderenable = true;
        event.data.invoices = [];
        let batchUrl = [];
        const url = this.spServices.getReadURL(this.constantService.listNames.InvoiceLineItems.name,
            this.fdConstantsService.fdComponent.invoiceLineItemProforma).replace('{{ProformaLookup}}', event.data.Id);
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
                const pname = poItem.Name ? poItem.Name : '';
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
                event.data.invoices.push({
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
    showProformaDialog() {

        const ref = this.dialogService.open(AddUpdateProformaDialogComponent, {
            header: 'Create Proforma Form',
            width: '75vw',
            data: {
                Type:'create proforma',
                cleData: this.cleData,
                purchaseOrdersList: this.purchaseOrdersList,
                projectContactsData: this.projectContactsData
            },
            contentStyle: { 'max-height': '80vh', 'overflow-y': 'auto' },
            closable: false,
        });
        ref.onClose.subscribe((proformaForm: any) => {
            if (proformaForm) {
                this.isPSInnerLoaderHidden = false;
                const batchUrl = this.fdDataShareServie.AddToProformaProcessData(proformaForm)
                this.submitForm(batchUrl, 'createProforma');
            }
        });
    }

    getPOCNames(rowItem: any) {
        this.listOfPOCNames = [];
        let rowVal: any = {};
        this.projectContactsData.filter((item) => {
          if (item.ClientLegalEntity === rowItem.ClientLegalEntity) {
            this.listOfPOCNames.push(item);
            if (item.ID === rowItem.MainPOC) {
              rowVal = item;
            }
          }
        });
        if (Object.keys(rowVal).length) {
          this.editPOC_form.patchValue({
            POCName: rowVal,
          });
        }
      }
    
    setPOC() {
        const  batchUrl = []
        const proformaData = {
            __metadata: { type: this.constantService.listNames.Proforma.type },
            MainPOC: this.editPOC_form.controls.POCName.value.Id,
            FileURL: null,
        }
        const url = this.spServices.getItemURL(this.constantService.listNames.Proforma.name, this.selectedOption.Id);
        this.commonService.setBatchObject(batchUrl, url, proformaData, this.constantService.Method.PATCH, this.constantService.listNames.Proforma.name);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Proforma', 'POCUpdated');
        this.submitForm(batchUrl, 'editPOC');
    }
}
