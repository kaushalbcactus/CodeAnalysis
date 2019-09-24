import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, ApplicationRef, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SPOperationService } from '../../../Services/spoperation.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from '../../../Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { NodeService } from '../../../node.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-approved-billable',
    templateUrl: './approved-billable.component.html',
    styleUrls: ['./approved-billable.component.css']
})
export class ApprovedBillableComponent implements OnInit, OnDestroy {
    tempClick: any;
    approvedBillableRes: any = [];
    approvedBillableCols: any[];
    scheduleOopInvoice_form: FormGroup;
    markAsPayment_form: FormGroup;

    // Address Type
    addressTypes: any = [];

    // Payment Mode array
    paymentModeArray: any = [];

    // Lodder
    isPSInnerLoaderHidden: boolean = true;

    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    }

    selectedRowData: any = [];

    // Date Range
    rangeDates: Date[];

    // subscription: Subscription;
    DateRange: any = {
        startDate: '',
        endDate: '',
    };

    freelancerVendersRes: any = [];

    // List of Subscribers 
    private subscription: Subscription = new Subscription();

    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private spServices: SPOperationService,
        public constantService: ConstantsService,
        private globalService: GlobalService,
        private fdConstantsService: FdConstantsService,
        private commonService: CommonService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        zone: NgZone,
        ) {
        this.subscription.add(this.fdDataShareServie.getDateRange().subscribe(date => {
            this.DateRange = date;
            console.log('this.DateRange ', this.DateRange);
            this.getRequiredData();
        }));

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
        this.fdConstantsService.fdComponent.hideDatesSection = false;
        // SetDefault Values
        if (this.fdDataShareServie.expenseDateRange.startDate) {
            this.DateRange = this.fdDataShareServie.expenseDateRange;
        } else {
            const last3Days = this.commonService.getLastWorkingDay(65, new Date());
            this.rangeDates = [last3Days, new Date()];
            this.DateRange.startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
            this.DateRange.endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
            this.fdDataShareServie.expenseDateRange = this.DateRange;
        }

        this.createABCols();
        this.getAddressType();
        // Initialize Form Field
        this.initializeOOPInvoiceForm_field();
        this.initializeMarkAsPaymentForm_field();

        this.paymentModeArray = [
            { label: 'BankTransfer', value: 'Bank Transfer' },
            { label: 'CreditCard', value: 'Credit Card' },
            { label: 'Cheque', value: 'Cheque' },
        ];


        // Get Freelancer 
        this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();

        await this.projectInfo();
        this.poInfo();
        this.projectContacts();
        // GEt Client Legal Entity
        this.cleInfo();
        // Load Address Type 

        // Resource Categorization
        this.resourceCInfo();
    }

    // Project Info 
    projectInfoData: any = [];
    async projectInfo() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        await this.fdDataShareServie.checkProjectsAvailable();
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
                this.getRequiredData();
                this.isPSInnerLoaderHidden = false;
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

    // Billing ENtity Data 
    billingEntityData: any = [];
    biilingEntityInfo() {
        this.subscription.add(this.fdDataShareServie.defaultBEData.subscribe((res) => {
            if (res) {
                this.billingEntityData = res;
                console.log('BE Data ', this.billingEntityData);
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

    getAddressType() {
        this.addressTypes = [
            { label: 'Client', value: 'Client' },
            { label: 'POC', value: 'POC' },
        ]
    }

    createABCols() {
        this.approvedBillableCols = [
            // { field: '', header: '' },
            { field: 'Number', header: 'Ref. Number', visibility: true },
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'VendorName', header: 'Vendor Name', visibility: true },
            { field: 'ExpenseType', header: 'Expense Type', visibility: true },
            { field: 'ClientCurrency', header: 'Client Currency', visibility: true },
            { field: 'ClientAmount', header: 'Client Amount', visibility: true },
            { field: 'Status', header: 'Status', visibility: true },

            { field: 'Category', header: 'Category', visibility: false },
            { field: 'PaymentMode', header: 'Payment Mode', visibility: false },
            { field: 'RequestType', header: 'Request Type', visibility: false },
            { field: 'DateSpend', header: 'Date Spend', visibility: false },
            { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: false },
            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'FileURL', header: 'File URL', visibility: false },
            { field: 'ClientApprovalFileURL', header: 'Client Approval File URL', visibility: false },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: false },
            { field: 'ApproverFileUrl', header: 'Approver File Url', visibility: false },
            { field: 'PayingEntity', header: 'Paying Entity', visibility: false },
            // { field: 'VendorFreelancer', header: 'Vendor Freelancer', visibility: false },
            // { field: 'AuthorId', header: 'Author Id', visibility: false },
            // { field: 'RequestType', header: 'Request Type', visibility: false },
            // { field: 'DollarAmount', header: 'Dollar Amount', visibility: false },
            // { field: 'InvoiceID', header: 'Invoice ID', visibility: false },
            // { field: 'POLookup', header: 'PO Lookup', visibility: false },
            { field: '', header: '', visibility: true },

        ];
    }

    initializeOOPInvoiceForm_field() {
        this.scheduleOopInvoice_form = this.fb.group({
            // ProjectCode: new FormControl('')
            ProjectCode: [{ value: '', disabled: true }],
            PONumber: ['', Validators.required],
            ScheduledType: [{ value: 'oop', disabled: true }],
            Amount: [{ value: '', disabled: true }, Validators.required],
            Currency: [{ value: '', disabled: true }, Validators.required],
            ScheduledDate: ['', Validators.required],
            POCName: ['', Validators.required],
            AddressType: ['', Validators.required],
        })
    }

    initializeMarkAsPaymentForm_field() {
        this.markAsPayment_form = this.fb.group({
            Number: ['', Validators.required],
            DateSpend: ['', Validators.required],
            PaymentMode: ['', Validators.required],
            // ApproverComments: ['', Validators.required],
            ApproverFileUrl: ['', Validators.required]
        })
    }

    // On load get Required Data
    async getRequiredData() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();

        // let obj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForBillable);
        // obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);

        let speInfoObj
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('ExpenseApprovers') > -1) {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForBillable);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        }
        else {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForBillableCS);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate).replace("{{UserID}}", this.globalService.sharePointPageObject.userId.toString());
        }

        const sinfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.SpendingInfo.name + '', speInfoObj);
        let endPoints = [sinfoEndpoint];
        let userBatchBody;
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');

        const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        const arrResults = res;
        console.log('--oo ', arrResults);
        this.formatData(arrResults[0]);
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });

    }

    getVendorNameById(ele) {
        let found = this.freelancerVendersRes.find((x) => {
            if (x.ID === ele.VendorFreelancer) {
                return x;
            }
        })
        return found ? found.Title : ''
    }

    async formatData(data: any[]) {
        this.approvedBillableRes = [];
        this.selectedAllRowsItem = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            let sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);

            this.approvedBillableRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: sowCodeFromPI.SOWCode,
                SOWName: sowItem.Title,
                ClientLegalEntity: sowCodeFromPI.ClientLegalEntity,
                Category: element.Category,
                Number: element.Number,
                ExpenseType: element.SpendType,
                ClientAmount: parseFloat(element.ClientAmount).toFixed(2),
                ClientCurrency: element.ClientCurrency,
                VendorName: this.getVendorNameById(element),
                Notes: element.Notes,
                RequestType: element.RequestType,
                PaymentMode: element.PaymentMode,
                PayingEntity: element.PayingEntity,
                Status: element.Status,
                DateSpend: this.datePipe.transform(element.DateSpend, 'MMM d, y, hh:mm a'),
                Created: this.datePipe.transform(element.Created, 'MMM d, y, hh:mm a'),
                Modified: this.datePipe.transform(element.Modified, 'MMM d, y, hh:mm a'),
                CreatedBy: rcCreatedItem ? rcCreatedItem.UserName.Title : '',
                ModifiedBy: rcModifiedItem ? rcModifiedItem.UserName.Title : '',
                // ModifiedDate: this.datePipe.transform(element.Modified, 'MMM d, y, hh:mm a'),
                ApproverComments: element.ApproverComments,
                ApproverFileUrl: element.ApproverFileUrl,
                FileURL: element.FileURL,
                ClientApprovalFileURL: element.ClientApprovalFileURL,

                VendorFreelancer: element.VendorFreelancer,
                AuthorId: element.AuthorId,
                DollarAmount: element.DollarAmount,
                InvoiceID: element.InvoiceID,
                POLookup: element.POLookup,
                // Created: element.Created,
                // PONumber: this.getPONumber(element),
                // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM d, y, hh:mm a')
            })
        }
        this.approvedBillableRes = [...this.approvedBillableRes];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues();
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    getCreatedModifiedByFromRC(id) {
        let found = this.rcData.find((x) => {
            if (x.UserName.ID == id) {
                return x;
            }
        })
        return found ? found : ''
    }

    appBillableColArray = {
        ProjectCode: [],
        SOWCode: [],
        Category: [],
        ExpenseType: [],
        ClientAmount: [],
        ClientCurrency: [],
        VendorName: [],
        RequestType: [],
        DateCreated: [],
        ModifiedBy: [],
        ModifiedDate: [],
        Number: [],
        PaymentDate: [],
        Modified: [],
        Created: [],
        PaymentMode: [],
        PayingEntity: [],
        Status: [],
    }

    createColFieldValues() {

        this.appBillableColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.Category = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
        const clientAmount = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
        this.appBillableColArray.ClientAmount = this.fdDataShareServie.customSort(clientAmount, 1, 'label');
        this.appBillableColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));

        this.appBillableColArray.VendorName = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.VendorName, value: a.VendorName }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.RequestType = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.RequestType, value: a.RequestType }; return b; }).filter(ele => ele.label)));

        this.appBillableColArray.PaymentMode = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.PaymentMode, value: a.PaymentMode }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.PayingEntity = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.PayingEntity, value: a.PayingEntity }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.Status = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));

        this.appBillableColArray.Number = this.commonService.sortData(this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.Number, value: a.Number }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.PaymentDate = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.DateSpend, value: a.DateSpend }; return b; }).filter(ele => ele.label));
        this.appBillableColArray.Modified = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.Modified, value: a.Modified }; return b; }).filter(ele => ele.label));
        this.appBillableColArray.Created = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.Created, value: a.Created }; return b; }).filter(ele => ele.label));

        this.appBillableColArray.SOWCode = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label));
        // this.appBillableColArray.DateCreated = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.DateCreated, value: a.DateCreated }; return b; }).filter(ele => ele.label));
        // this.appBillableColArray.ModifiedDate = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
        // this.appBillableColArray.ModifiedDate = this.uniqueArrayObj(this.approvedBillableRes.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
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

    selectedAllRows: boolean = false;
    selectedCategories: boolean = false;
    selectAll(data) {
        console.log(data);
        this.selectedAllRows = !this.selectedAllRows;
        this.selectedCategories = !this.selectedCategories;
    }
    selectOneByOne(oneRow, isChecked) {
        // this.selectedCategories = !this.selectedCategories
        console.log('one Row ', oneRow);
        console.log('isChecked ', isChecked);
    }

    selectAllRows() {
        console.log('in selectAllRows ', this.selectedAllRowsItem);
    }

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    // selectedRowItemData: any = [];
    onRowSelect(event) {
        console.log(event);
        // this.selectedRowItemData.push(event.data);
        console.log('this.selectedAllRowsItem ', this.selectedAllRowsItem);
    }

    onRowUnselect(event) {
        console.log('this.selectedAllRowsItem ', this.selectedAllRowsItem);
        // let rowUnselectIndex = this.selectedRowItemData.indexOf(event.data);
        // this.selectedRowItemData.splice(rowUnselectIndex, 1);
    }

    setValInScheduleOop(selectedLineItems: any) {
        let amt = 0;
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            amt += parseFloat(element.ClientAmount);
        }
        if (selectedLineItems.length) {
            console.log('', this.selectedAllRowsItem[0].ProjectCode);
            this.scheduleOopInvoice_form.controls['ProjectCode'].setValue(this.selectedAllRowsItem[0].ProjectCode);
            this.scheduleOopInvoice_form.controls['ScheduledType'].setValue('oop');
            this.scheduleOopInvoice_form.controls['Currency'].setValue(this.selectedAllRowsItem[0].ClientCurrency);
            this.scheduleOopInvoice_form.controls['Amount'].setValue(amt);
            console.log('this.scheduleOopInvoice_form ', this.scheduleOopInvoice_form.getRawValue());
        }
    }

    rightSideBar: boolean = false;
    items: any[];
    openTableAtt(data, popUpData) {
        this.items = [];
        console.log('this.selectedAllRowsItem ', this.selectedAllRowsItem);
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });
    }

    rowItemDetails: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.rowItemDetails = data;
        this.rightSideBar = !this.rightSideBar;
    }

    scheduleOopModal: boolean = false;
    markAsPaymentModal: boolean = false;
    listOfPOCs: any = [];
    openPopup(modal: string) {
        console.log('selectedAllRowsItem ', this.selectedAllRowsItem);
        // console.log('this.selectedRowItemData ', this.selectedRowItemData);
        this.listOfPOCs = [];

        if (!this.selectedAllRowsItem.length) {
            this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'Please select at least 1 Projects & try again', life: 4000 });
            return;
        }
        // if (this.pcFound) {
        if (modal === 'scheduleOopModal') {
            this.checkUniquePC();
            if (this.pcFound) {
                let sts = this.checkApprovedStatus();
                console.log('Sts ', sts);
                // if (this.selectedAllRowsItem[0].Status.includes('Approved')) {
                if (sts) {
                    this.poNames = [];
                    let pInfo = this.getCleFromPC();
                    if (pInfo) {
                        this.getPONumberFromCLE(pInfo);
                        this.getPOCFromPCLE(pInfo);
                    }
                    console.log('this.listOfPOCs ', this.listOfPOCs);
                    this.setValInScheduleOop(this.selectedAllRowsItem);
                    this.scheduleOopModal = true;
                } else {
                    this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'Please select only those Projects whose scheduling is pending', life: 4000 });
                }

            } else {
                this.scheduleOopModal = false;
                this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'Please select same Projects', life: 4000 });
            }


        } else if (modal === 'markAsPaymentModal') {
            this.checkUniqueVF();
            if (this.vfUnique) {
                let sts = this.checkPPStatus();
                console.log('Sts ', sts);
                if (sts) {
                    this.markAsPaymentModal = true;
                } else {
                    this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'Please select only those Projects whose payment is pending', life: 4000 });
                }
            } else {
                this.scheduleOopModal = false;
                this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'Please select same Vendor/Freelance name', life: 4000 });
            }
        }

        // } else {
        //     this.scheduleOopModal = false;
        //     this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'Please select same Projects & try again', life: 4000 });
        // }
    }

    checkApprovedStatus() {
        let sts = true;
        for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
            const element = this.selectedAllRowsItem[j];
            if (!element.Status.includes('Approved')) {
                sts = false;
                break;
            } else {
                sts = true;
            }
        }
        return sts;
    }

    checkPPStatus() {
        let ppSts = true;
        for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
            const element = this.selectedAllRowsItem[j];
            if (!element.Status.includes('Payment Pending')) {
                ppSts = false;
                break;
            } else {
                ppSts = true;
            }
        }
        return ppSts;
    }

    getCleFromPC() {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === this.selectedAllRowsItem[0].ProjectCode) {
                return x;
            }
        })
        return found ? found : ''
    }

    getPOCFromPCLE(cle) {
        this.listOfPOCs = [];
        for (let i = 0; i < this.projectContactsData.length; i++) {
            const element = this.projectContactsData[i];
            if (element ? element.ClientLegalEntity : '') {
                if (element.ClientLegalEntity === cle.ClientLegalEntity) {
                    this.listOfPOCs.push(element)
                }
            }
        }
        console.log('listOfPOCs ', this.listOfPOCs);
    }


    // Project PO
    poNames: any = [];
    getPONumberFromCLE(cli) {

        this.purchaseOrdersList.map((x) => {
            if (x.ClientLegalEntity === cli.ClientLegalEntity) {
                if (this.matchCurrency(x)) {
                    this.poNames.push(x);
                }
            }
        });
        console.log(this.poNames);
    }

    matchCurrency(po) {
        let found = this.selectedAllRowsItem.find(item => {
            if (item.ClientCurrency === po.Currency) {
                return item;
            }
        })
        return found ? found : ''
    }

    pcFound: boolean = false;
    checkUniquePC() {
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            let selectedPC = this.selectedAllRowsItem[0].ProjectCode;
            // element.Status.includes('Approved')
            if (element.ProjectCode !== selectedPC) {
                this.pcFound = false;
                break;
            } else {
                this.pcFound = true;
            }
        }
    }

    vfUnique: boolean = false;
    checkUniqueVF() {
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            let vfId = this.selectedAllRowsItem[0].VendorFreelancer;
            if (element.VendorFreelancer !== vfId) {
                this.vfUnique = false;
                break;
            } else {
                this.vfUnique = true;
            }
        }
    }



    updateSchedulteOopInvoice() {
        // this.scheduleOopInvoice_form.get('ProjectCode').setValue(this.selectedRowItem.data.ProjectCode);
        // this.scheduleOopInvoice_form.get('PONumber').setValue(this.selectedRowItem.data.PONumber);
        // this.scheduleOopInvoice_form.get('ScheduledType').setValue('revenue');
        // this.scheduleOopInvoice_form.get('Amount').setValue(this.selectedRowItem.data.Amount);
        // this.scheduleOopInvoice_form.get('Currency').setValue(this.selectedRowItem.data.Currency);
        // const format = 'dd MMM , yyyy';
        // const myDate = new Date(this.selectedRowItem.data.ScheduledDate);
        // const locale = 'en-IN';
        // const formattedDate = formatDate(myDate, format, locale);
        // console.log('formatted Date ', formattedDate);
        // this.scheduleOopInvoice_form.get('ScheduledDate').setValue(formattedDate);
    }

    cancelFormSub(type) {
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        if (type === 'markAsPayment_form') {
            this.markAsPayment_form.reset();
        } else if (type === 'scheduleOopInvoice_form') {
            this.scheduleOopInvoice_form.reset();
        }
    }

    get isValidScheduleOOPInvoiceForm() {
        return this.scheduleOopInvoice_form.controls;
    }

    get isValidMarkAsPaymentForm() {
        return this.markAsPayment_form.controls;
    }

    oopBalance: number = 0;
    poItem: any;
    async poChange(event) {
        console.log('po event ', event.value);
        this.submitBtn.isClicked = false;
        this.poItem = event.value;
        this.oopBalance = 0;
        this.poItem.OOPLinked = this.poItem.OOPLinked ? this.poItem.OOPLinked : 0;
        if (this.poItem) {
            this.oopBalance = (this.poItem.AmountOOP ? this.poItem.AmountOOP - this.poItem.OOPLinked : 0 - (this.poItem.OOPLinked ? this.poItem.OOPLinked : 0));
            this.oopBalance = parseFloat(this.oopBalance.toFixed(2));
        }
        if (this.oopBalance >= this.scheduleOopInvoice_form.getRawValue().Amount) {
            await this.getPfPfb();
        }
        else {
            this.submitBtn.isClicked = true;
            this.messageService.add({ key: 'approvedToast', severity: 'info', summary: 'Info message', detail: 'OOP Balance must be greater than Scheduled oop Amount.', life: 4000 });
            return;
        }
    }
    pocItem: any;
    pocChange(event) {
        console.log('poc event ', event.value);
        this.pocItem = event.value;
    }

    pfListItem: any = [];
    pfbListItem: any = [];
    pbbListItem: any = [];
    hBQuery: any = [];
    projectInfoLineItem: any;
    pcmLevels: any = [];
    async getPfPfb() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        this.hBQuery = [];
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();

        this.projectInfoLineItem = this.getPInfoByPC();
        this.pcmLevels = [];
        if (this.projectInfoLineItem) {
            for (let i = 0; i < this.projectInfoLineItem.CMLevel1.results.length; i++) {
                const element = this.projectInfoLineItem.CMLevel1.results[i];
                this.pcmLevels.push(element);
            }
            this.pcmLevels.push(this.projectInfoLineItem.CMLevel2);
            console.log('this.pcmLevels ', this.pcmLevels);
        }

        // PF
        let obj = {
            filter: this.fdConstantsService.fdComponent.projectFinances.filter.replace("{{ProjectCode}}", this.scheduleOopInvoice_form.getRawValue().ProjectCode),
            select: this.fdConstantsService.fdComponent.projectFinances.select,
            top: this.fdConstantsService.fdComponent.projectFinances.top,
            // orderby: this.fdConstantsService.fdComponent.projectFinances.orderby
        }
        this.hBQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinances.name + '', obj));

        // PFB
        let pfbObj = {
            filter: this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO.filter.replace("{{ProjectCode}}", this.scheduleOopInvoice_form.getRawValue().ProjectCode).replace("{{PO}}", this.poItem.Id),
            select: this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO.select,
            top: this.fdConstantsService.fdComponent.projectFinanceBreakupFromPO.top,
        }
        this.hBQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinanceBreakup.name + '', pfbObj));

        // PBB
        let pbbObj = {
            filter: this.fdConstantsService.fdComponent.projectBudgetBreakup.filter.replace("{{ProjectCode}}", this.scheduleOopInvoice_form.getRawValue().ProjectCode),
            select: this.fdConstantsService.fdComponent.projectBudgetBreakup.select,
            // top: this.fdConstantsService.fdComponent.projectFinanceBreakup.top,
        }
        this.hBQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.ProjectBudgetBreakup.name + '', pbbObj));


        let endPoints = this.hBQuery;
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }

        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        arrResults = res;
        if (arrResults.length) {
            console.log('arrResults ', arrResults);
            this.pfListItem = arrResults[0];
            this.pfbListItem = arrResults[1];
            this.pbbListItem = arrResults[2];
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;

    }

    getPInfoByPC() {
        this.projectInfoData
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === this.scheduleOopInvoice_form.getRawValue().ProjectCode) {
                return x;
            }
        })
        return found ? found : '';
    }

    // PO 
    getPOData(expenseData, amt) {
        let poLinkedAmt = parseFloat(expenseData.OOPLinked ? expenseData.OOPLinked : 0) + parseFloat(amt);
        let poTotalLinkedAmt = parseFloat(expenseData.TotalLinked ? expenseData.TotalLinked : 0) + parseFloat(amt);
        let poScheduledOOP = parseFloat(expenseData.ScheduledOOP ? expenseData.ScheduledOOP : 0) + parseFloat(amt);
        let poTotalScheduled = parseFloat(expenseData.TotalScheduled ? expenseData.TotalScheduled : 0) + parseFloat(amt);
        let poData = {
            OOPLinked: poLinkedAmt.toFixed(2),
            TotalLinked: poTotalLinkedAmt.toFixed(2),
            ScheduledOOP: poScheduledOOP.toFixed(2),
            TotalScheduled: poTotalScheduled.toFixed(2)
        };
        poData['__metadata'] = { type: 'SP.Data.POListItem' };
        const poEndpoint = this.fdConstantsService.fdComponent.addUpdatePO.update.replace("{{Id}}", expenseData.ID);
        return {
            objData: poData,
            endpoint: poEndpoint,
            requestPost: false
        };
    }

    // PF
    getPFData() {
        let oldScheduledOOP = this.pfListItem[0].ScheduledOOP ? this.pfListItem[0].ScheduledOOP : 0;
        let oldTotalScheduled = this.pfListItem[0].InvoicesScheduled ? this.pfListItem[0].InvoicesScheduled : 0;
        let totalBudget = this.pfListItem[0].Budget ? parseFloat(this.pfListItem[0].Budget) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount) : 0 + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
        let oopBudget = this.pfListItem[0].OOPBudget ? parseFloat(this.pfListItem[0].OOPBudget) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount) : 0 + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
        let pfScheduledOOP = parseFloat(oldScheduledOOP) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
        let pfTotalScheduled = parseFloat(oldTotalScheduled) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
        let pfData = {
            ScheduledOOP: pfScheduledOOP,
            InvoicesScheduled: pfTotalScheduled,
            Budget: totalBudget,
            OOPBudget: oopBudget
        };
        pfData['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
        const pfEntpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", this.pfListItem[0].Id);
        return {
            objData: pfData,
            endpoint: pfEntpoint,
            requestPost: false
        };
    }

    // PFB

    getPFBData() {
        let pfbData = {
            ScheduledOOP: parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount),
            TotalScheduled: parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount),
        };
        let sts = 'POST';
        let pfbEntpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinanceBreakup.create;
        if (this.pfbListItem.length > 0) {
            var oldScheduledOOP = this.pfbListItem[0].ScheduledOOP ? this.pfbListItem[0].ScheduledOOP : 0;
            var oldTotalScheduled = this.pfbListItem[0].TotalScheduled ? this.pfbListItem[0].TotalScheduled : 0;
            var oldAmountOOP = this.pfbListItem[0].AmountOOP ? this.pfbListItem[0].AmountOOP : 0;
            var oldTotalAmount = this.pfbListItem[0].Amount ? this.pfbListItem[0].Amount : 0;
            var pfbScheduledOOP = parseFloat(oldScheduledOOP) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
            var pfbTotalScheduled = parseFloat(oldTotalScheduled) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
            var pfbAmountOOP = parseFloat(oldAmountOOP) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
            var pfbAmount = parseFloat(oldTotalAmount) + parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
            pfbData['Amount'] = pfbAmount;
            pfbData['AmountOOP'] = pfbAmountOOP;
            pfbData['ScheduledOOP'] = pfbScheduledOOP;
            pfbData['TotalScheduled'] = pfbTotalScheduled;
            pfbData['__metadata'] = { type: 'SP.Data.ProjectFinanceBreakupListItem' };
            pfbEntpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinanceBreakup.update.replace("{{Id}}", this.pfbListItem[0].Id);
            sts = 'PATCH';
        } else {
            pfbData['POLookup'] = this.scheduleOopInvoice_form.getRawValue().PONumber.Id;
            pfbData['ProjectNumber'] = this.scheduleOopInvoice_form.getRawValue().ProjectCode;
            pfbData['Amount'] = parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
            pfbData['AmountOOP'] = parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount);
            pfbData['Status'] = 'Active';
            pfbData['__metadata'] = { type: 'SP.Data.ProjectFinanceBreakupListItem' };
        }

        return {
            objData: pfbData,
            endpoint: pfbEntpoint,
            requestPost: sts
        };
    }

    // PBB
    getPBBData() {
        const pbbEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectBudgetBreakup.create;
        var pbbData = {
            ProjectLookup: this.projectInfoLineItem.Id,
            Status: 'Approved',
            ApprovalDate: new Date().toISOString(),
            OriginalBudget: parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount),
            OOPBudget: parseFloat(this.scheduleOopInvoice_form.getRawValue().Amount),
            ProjectCode: this.scheduleOopInvoice_form.getRawValue().ProjectCode,
        };
        pbbData['__metadata'] = { type: 'SP.Data.ProjectBudgetBreakupListItem' };

        return {
            objData: pbbData,
            endpoint: pbbEndpoint,
            requestPost: true
        };
    }

    selectedPaymentMode(val: any) {
        console.log('Payment Mode ', val);
    }

    // Upload File

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    fileUploadedUrl: any;
    onFileChange(event, folderName: string) {
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.markAsPayment_form.get('ApproverFileUrl').setValue('');
                this.messageService.add({ key: 'approvedToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
                return false;
            }
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                let date = new Date();
                let folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/' + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';
                this.filePathUrl = this.globalService.sharePointPageObject.webRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" + "&@TargetFileName='" + this.selectedFile.name + "'";
            };
        }
    }

    async uploadFileData(type: string) {
        // this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
        const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result);
        if (res) {
            this.fileUploadedUrl = res.ServerRelativeUrl ? res.ServerRelativeUrl : '';
            console.log('this.fileUploadedUrl ', this.fileUploadedUrl);
            if (this.fileUploadedUrl) {
                let data = [];
                for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
                    const element = this.selectedAllRowsItem[j];
                    let speInfoObj = {
                        // PayingEntity: this.markAsPayment_form.value.PayingEntity.Title,
                        Number: this.markAsPayment_form.value.Number,
                        DateSpend: this.markAsPayment_form.value.DateSpend,
                        PaymentMode: this.markAsPayment_form.value.PaymentMode.value,
                        // ApproverComments: this.markAsPayment_form.value.ApproverComments,
                        ApproverFileUrl: this.fileUploadedUrl,
                        Status: element.Status.replace(" Payment Pending", "")
                    }
                    speInfoObj["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
                    const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);;
                    data.push({
                        data: speInfoObj,
                        url: spEndpoint,
                        type: 'PATCH',
                        listName: this.constantService.listNames.SpendingInfo.name
                    })
                }
                this.submitForm(data, type);
            }
        }
        // });
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        if (type === 'scheduledOOP') {
            if (this.scheduleOopInvoice_form.invalid) {
                return;
            }
            console.log('form is submitting ..... for selected row Item i.e ', this.scheduleOopInvoice_form.getRawValue());
            let obj = {
                Title: this.scheduleOopInvoice_form.getRawValue().ProjectCode,
                PO: this.scheduleOopInvoice_form.getRawValue().PONumber.Id,
                ScheduleType: this.scheduleOopInvoice_form.getRawValue().ScheduledType,
                ScheduledDate: this.scheduleOopInvoice_form.getRawValue().ScheduledDate,
                Amount: this.scheduleOopInvoice_form.getRawValue().Amount,
                AddressType: this.scheduleOopInvoice_form.getRawValue().AddressType.value,
                Currency: this.scheduleOopInvoice_form.getRawValue().Currency,
                MainPOC: this.scheduleOopInvoice_form.getRawValue().POCName.Id,
                SOWCode: this.projectInfoLineItem.SOWCode,
                CSId: { results: this.pcmLevels.map(x => x.ID) },
                Template: this.pfListItem[0].Template,
                Status: 'Scheduled'
            }
            obj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.create;
            let data = [];
            data.push({
                data: obj,
                url: endpoint,
                type: 'POST',
                listName: this.constantService.listNames.InvoiceLineItems.name
            });
            let po = this.getPOData(this.poItem, this.scheduleOopInvoice_form.getRawValue().Amount);
            if (po) {
                data.push({
                    data: po.objData,
                    url: po.endpoint,
                    type: 'PATCH',
                    listName: this.constantService.listNames.PO
                });
            }
            console.log('po ', po);
            let pf = this.getPFData();
            if (pf) {
                data.push({
                    data: pf.objData,
                    url: pf.endpoint,
                    type: 'PATCH',
                    listName: this.constantService.listNames.ProjectFinances.name
                });
            }
            console.log('pf ', pf);
            let pfb = this.getPFBData();
            if (pfb) {
                data.push({
                    data: pfb.objData,
                    url: pfb.endpoint,
                    type: pfb.requestPost,
                    listName: this.constantService.listNames.ProjectFinanceBreakup.name
                });
            }
            console.log('pfb ', pfb);

            // PFBB
            let pfbb = this.getPBBData();
            if (pfbb) {
                data.push({
                    data: pfbb.objData,
                    url: pfbb.endpoint,
                    type: 'POST',
                    listName: this.constantService.listNames.ProjectBudgetBreakup.name
                });
            }
            console.log('pfbb ', pfbb);

            console.log('data ', data);

            this.isPSInnerLoaderHidden = false;
            this.submitForm(data, type);

        } else if (type === 'markAsPayment_form') {
            if (this.markAsPayment_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            console.log('form is submitting ..... for selected row Item i.e ', this.markAsPayment_form.value);
            this.uploadFileData(type);
        }
    }

    batchContents: any = [];
    async submitForm(dataEndpointArray, type: string) {
        console.log('Form is submitting');

        // this.batchContents = [];
        // const batchGuid = this.spServices.generateUUID();
        // const changeSetId = this.spServices.generateUUID();

        // // const batchContents = this.spServices.getChangeSetBody1(changeSetId, endpoint, JSON.stringify(obj), true);
        // console.log(' dataEndpointArray ', dataEndpointArray);
        // dataEndpointArray.forEach(element => {
        //     if (element)
        //         this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
        // });

        // console.log("this.batchContents ", JSON.stringify(this.batchContents));

        // this.batchContents.push('--changeset_' + changeSetId + '--');
        // const batchBody = this.batchContents.join('\r\n');
        // const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
        // batchBodyContent.push('--batch_' + batchGuid + '--');
        // const sBatchData = batchBodyContent.join('\r\n');
        var res = await this.spServices.executeBatch(dataEndpointArray);
        // await this.spServices.getData(batchGuid, sBatchData).subscribe(res => {


        // });
        const arrResults = res;
        console.log('--oo ', arrResults);
        if (type === "scheduledOOP") {
            this.updateStsToBilled(arrResults);
        } else if (type === 'updateScheduledOopLineItem') {
            this.messageService.add({ key: 'approvedToast', severity: 'success', summary: 'Success message', detail: 'OOP Invoice is Scheduled.', life: 2000 });
            this.scheduleOopModal = false;
            this.reFetchData();
        } else if (type === "markAsPayment_form") {
            this.messageService.add({ key: 'approvedToast', severity: 'success', summary: 'Success message', detail: 'Payment marked.', life: 2000 });
            this.isPSInnerLoaderHidden = true;
            this.markAsPaymentModal = false;
            this.reFetchData();
        }
    }

    updateSpeLineItems: any = [];
    updateStsToBilled(arrRet: any) {
        this.updateSpeLineItems = [];
        for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
            const element = this.selectedAllRowsItem[j];
            let spObj = {
                Status: element.Status.replace("Approved", "Billed"),
                InvoiceID: arrRet[0].retItems.ID.toString()
            }
            spObj['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
            const speEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);
            this.updateSpeLineItems.push({
                data: spObj,
                url: speEndpoint,
                type: 'PATCH',
                listName: this.constantService.listNames.SpendingInfo.name
            })
        }
        console.log('this.updateSpeLineItems ', this.updateSpeLineItems);
        this.submitForm(this.updateSpeLineItems, 'updateScheduledOopLineItem');
    }

    reFetchData() {
        setTimeout(async () => {
            // Refetch PO/CLE Data
            await this.fdDataShareServie.getClePO('approved');
            // Fetch latest PO & CLE
            this.poInfo();
            this.cleInfo();
            this.getRequiredData();
        }, 3000);
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

}
