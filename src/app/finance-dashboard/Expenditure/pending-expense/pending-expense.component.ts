import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SelectItem, MessageService } from 'primeng/api';
import { SPOperationService } from '../../../Services/spoperation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from '../../../Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataTable } from 'primeng/primeng';

@Component({
    selector: 'app-pending-expense',
    templateUrl: './pending-expense.component.html',
    styleUrls: ['./pending-expense.component.css']
})
export class PendingExpenseComponent implements OnInit, OnDestroy {
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
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        zone: NgZone,
    ) {
        this.subscription.add(this.fdDataShareServie.getAddExpenseSuccess().subscribe(date => {
            this.isExpenseCreate = true;
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

    get isValidApproveExpeseForm() {
        return this.approveExpense_form.controls;
    }
    get isValidCancelExpeseForm() {
        return this.cancelReject_form.controls;
    }
    tempClick: any;
    // Loadder
    isPSInnerLoaderHidden: boolean = true;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;
    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };

    // @ViewChild('dd') dropdown: Dropdown;
    selectedType: string = '';
    projectCodeRes: SelectItem[];

    // Currency DD
    currencyList: SelectItem[];

    // Expense Type DD
    expenseTypeList: SelectItem[];

    brands: SelectItem[];

    // Pending Expense Columns Name
    pendingExpeseCols: any[];

    // Approve Reject Modal
    displayModal: boolean = false;

    // Forms
    approveExpense_form: FormGroup;
    cancelReject_form: FormGroup;

    // Payment Mode array
    paymentModeArray: any = [];

    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;

    // Right side bar
    rightSideBar: boolean = false;

    freelancerVendersRes: any = [];
    sowRes: any = [];

    // Observable
    subscriptionPE: Subscription;

    showApproveReject: boolean = false;

    isExpenseCreate: boolean = false;

    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    // List of Subscribers
    private subscription: Subscription = new Subscription();
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    @ViewChild('pendingExpense', { static: false }) pendingEnpenseTable: DataTable;

    // Project Info
    projectInfoData: any = [];

    // Billing ENtity Data
    billingEntityData: any = [];

    // Client Legal Entity
    cleData: any = [];

    // Resource Categorization
    rcData: any = [];

    pendingExpenses: any = [];

    // getCreatedModifiedByFromRC(id) {
    //     let found = this.rcData.find((x) => {
    //         if (x.UserName.ID == id) {
    //             return x;
    //         }
    //     })
    //     return found ? found : ''
    // }

    pendinExpenseColArray = {
        ProjectCode: [],
        ClientLegalEntity: [],
        RequestType: [],
        SOWCode: [],
        Category: [],
        ExpenseType: [],
        ClientAmount: [],
        ClientCurrency: [],
        CreatedDate: [],
        CreatedBy: [],
        ModifiedBy: [],
        ModifiedDate: [],
        VendorName: [],
    };

    items: any[];
    cancelRejectDialog: any = {
        title: '',
        text: ''
    };

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    selectedRowItem: any;

    // Upload File

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    fileUploadedUrl: any;

    batchContents: any = [];

    // Send Mail // Mail Content
    mailContentRes: any;

    selectedProjectInfo: any;
    cleForselectedPI: any;

    selectedPI: any = [];

    cmLevelIdList: any = [];

    resCatEmails: any = [];

    isOptionFilter: boolean;

    async ngOnInit() {
        // let snapData = this.route.snapshot.data['fdData'];
        this.fdConstantsService.fdComponent.hideDatesSection = true;

        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('ExpenseApprovers') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('Invoice_Team') > -1) {
            this.showApproveReject = true;
        } else {
            this.showApproveReject = false;
        }

        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // Form Fields initialisation
        this.approveExpenseFormField();
        this.canRejExpenseFormField();

        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();

        // Get VendorFreelancer List
        this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();

        // Get Projects
        await this.projectInfo();
        this.cleInfo();
        this.resourceCInfo();

        // Create PendingExpense Columns
        this.createPECols();

        this.paymentModeArray = [
            { label: 'BankTransfer', value: 'Bank Transfer' },
            { label: 'CreditCard', value: 'Credit Card' },
            { label: 'Cheque', value: 'Cheque' },
        ];

        // For Mail
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        console.log('this.currentUserInfoData  ', this.currentUserInfoData);
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        console.log('this.groupInfo  ', this.groupInfo);
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
        console.log('this.groupITInfo  ', this.groupITInfo);

    }
    async projectInfo() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
                this.getRequiredData();
            }
        }));
    }
    biilingEntityInfo() {
        this.subscription.add(this.fdDataShareServie.defaultBEData.subscribe((res) => {
            if (res) {
                this.billingEntityData = res;
                console.log('BE Data ', this.billingEntityData);
            }
        }));
    }
    cleInfo() {
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('Client Legal Entity ', this.cleData);
            }
        }));
    }
    resourceCInfo() {
        this.subscription.add(this.fdDataShareServie.defaultRCData.subscribe((res) => {
            if (res) {
                this.rcData = res;
                console.log('Resource Categorization ', this.rcData);
            }
        }));
    }

    approveExpenseFormField() {
        this.approveExpense_form = this.fb.group({
            PayingEntity: ['', Validators.required],
            Number: ['', Validators.required],
            DateSpend: ['', Validators.required],
            PaymentMode: ['', Validators.required],
            ApproverComments: ['', Validators.required],
            ApproverFileUrl: ['', Validators.required]
        });
    }

    canRejExpenseFormField() {
        this.cancelReject_form = this.fb.group({
            isCancel: ['', Validators.required],
            ApproverComments: ['', Validators.required]
        });
    }

    createPECols() {
        this.pendingExpeseCols = [
            { field: 'RequestType', header: 'Request Type', visibility: true },
            { field: 'ProjectCode', header: 'Project', visibility: true },
            { field: 'VendorName', header: 'Vendor Freelancer', visibility: true },
            { field: 'ClientLegalEntity', header: 'Client', visibility: true },
            { field: 'Category', header: 'Category', visibility: true },
            // { field: 'PONumber', header: 'PO Number', visibility:true },
            { field: 'ExpenseType', header: 'Expense Type', visibility: true },
            { field: 'ClientAmount', header: 'Client Amount', visibility: true },
            { field: 'ClientCurrency', header: 'Client Currency', visibility: true },
            { field: 'CreatedDate', header: 'Date Created', visibility: true, exportable: false },
            { field: 'CreatedDateFormat', header: 'Date Created', visibility: false },
            { field: 'CreatedBy', header: 'Created By', visibility: true },
            { field: 'Modified', header: 'Modified Date', visibility: false, exportable: false },
            { field: 'ModifiedDateFormat', header: 'Modified Date', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },

            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'PaymentMode', header: 'Payment Mode', visibility: false },
            { field: 'Number', header: 'Number', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'DateSpend', header: 'Date Spend', visibility: false },
            { field: 'FileURL', header: 'File URL', visibility: false },
            { field: 'ClientApprovalFileURL', header: 'Client Approval File URL', visibility: false },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: false },
            { field: 'ApproverFileUrl', header: 'Approver File Url', visibility: false },
            { field: 'PayingEntity', header: 'Paying Entity', visibility: false },
            // { field: 'AuthorId', header: 'Author Id', visibility: false },

            // { field: 'DollarAmount', header: 'Dollar Amount', visibility: false },
            // { field: 'InvoiceID', header: 'Invoice ID', visibility: false },
            // { field: 'POLookup', header: 'PO Lookup', visibility: false },
            { field: '', header: '', visibility: true },
        ];
    }

    selectedProjectCode(projectCode, event) {
        console.log('Selected Project code ', projectCode);
    }

    OnChange(event) {
        console.log(event);
    }


    selectedExpenseType() {
        console.log('Selected Expense ', this.approveExpense_form.value.ExpenseType);
    }


    selectedClientFun() {
        console.log('Selected Client Legal Entity ', this.approveExpense_form.value);
    }

    selectCurrency(currency, event) {
        console.log('Selected Currency ', currency);
    }

    cancelFormSub(formType) {
        console.log('form Type ', this.cancelRejectDialog.title);
        if (this.cancelRejectDialog.title === 'Approve Expense') {
            this.showHideREModal = false;
            console.log(this.approveExpense_form.value);
            this.approveExpense_form.reset();
            // this.addExpenditure_form.reset();
            // this.expenditureFormField('Yes');
        } else if (this.cancelRejectDialog.title === 'Reject Expense') {
            this.cancelReject_form.reset();
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    isExpenseRej() {
        this.submitBtn.isClicked = this.cancelReject_form.value.isCancel === 'No' ? this.submitBtn.isClicked = true : this.submitBtn.isClicked = false;
    }
    // On load get Required Data
    async getRequiredData() {
        // Refetch vendor list if expense created
        if (this.isExpenseCreate) {
            this.fdDataShareServie.freelancerVendersRes = [];
            this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // const batchContents = new Array();
        // const batchGuid = this.spServices.generateUUID();

        let speInfoObj;
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('ExpenseApprovers') > -1) {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfo);
            speInfoObj.filter = speInfoObj.filter.replace('{{Status}}', 'Created');
            speInfoObj.orderby = speInfoObj.orderby.replace('{{Status}}', 'Created');
        } else {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoCS);
            speInfoObj.filter = speInfoObj.filter.replace('{{Status}}', 'Created')
                .replace('{{UserID}}', this.globalService.currentUser.userId.toString());
            speInfoObj.orderby = speInfoObj.orderby.replace('{{Status}}', 'Created');
        }
        const res = await this.spServices.readItems(this.constantService.listNames.SpendingInfo.name, speInfoObj);
        // const sinfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.SpendingInfo.name + '', speInfoObj);
        // let endPoints = [sinfoEndpoint];
        // let userBatchBody;
        // for (let i = 0; i < endPoints.length; i++) {
        //     const element = endPoints[i];
        //     this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        // }
        // batchContents.push('--batch_' + batchGuid + '--');
        // userBatchBody = batchContents.join('\r\n');

        // const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        const arrResults = res.length ? res : [];
        // console.log('--oo ', arrResults);
        this.formatData(arrResults);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });

    }

    async formatData(data: any[]) {
        this.pendingExpenses = [];
        this.selectedAllRowsItem = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const cleName = this.getPIFromPC(element);
            const cname = cleName ? ' / ' + cleName : '';

            // let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            // let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            const sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);

            this.pendingExpenses.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: sowCodeFromPI.SOWCode,
                SOWName: sowItem.Title,
                ClientLegalEntity: sowCodeFromPI.ClientLegalEntity,
                Category: element.Category,
                PONumber: element.PONumber,
                ExpenseType: element.SpendType,
                ClientAmount: parseFloat(element.ClientAmount ? element.ClientAmount : 0).toFixed(2),
                ClientCurrency: element.ClientCurrency,
                CreatedDate: new Date(this.datePipe.transform(element.Created, 'MMM dd, yyyy')),
                CreatedDateFormat: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                CreatedBy: element.Author ? element.Author.Title : '',
                ModifiedBy: element.Editor ? element.Editor.Title : '',

                Notes: element.Notes,
                Modified: new Date(this.datePipe.transform(element.Modified, 'MMM dd, yyyy')),
                ModifiedDateFormat: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                RequestType: element.RequestType,
                Number: element.Number,
                DateSpend: element.DateSpend,
                PaymentMode: element.PaymentMode,
                Currency: element.Currency,
                Amount: element.Amount,
                Status: element.Status,
                FileURL: element.FileURL,
                ClientApprovalFileURL: element.ClientApprovalFileURL,
                ApproverComments: element.ApproverComments,
                ApproverFileUrl: element.ApproverFileUrl,
                PayingEntity: element.PayingEntity,
                VendorName: this.getVendorNameById(element),
                AuthorId: element.Author.Id,
                AuthorEMail: element.Author.EMail,
                DollarAmount: element.DollarAmount,
                InvoiceID: element.InvoiceID,
                POLookup: element.POLookup,
                // PONumber: this.getPONumber(element),
                // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM dd, yyyy, hh:mm a')
            });
        }
        this.pendingExpenses = [...this.pendingExpenses];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues(this.pendingExpenses);
    }

    getSowTitle(pi: any) {
        const found = this.sowRes.find((x) => {
            if (x.SOWCode === pi.Title) {
                return x;
            }
        });
        return found ? found : '';
    }

    getPIFromPC(pc) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x;
            }
        });
        return found ? found.ClientLegalEntity : '';
    }

    getVendorNameById(ele) {
        const found = this.freelancerVendersRes.find((x) => {
            if (x.ID === ele.VendorFreelancer) {
                return x;
            }
        });
        return found ? found.Title : '';
    }

    createColFieldValues(resArray) {

        this.pendinExpenseColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.VendorName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.VendorName, value: a.VendorName }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.RequestType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.RequestType, value: a.RequestType }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.Category = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
        const ClientAmount = this.uniqueArrayObj(resArray.map(a => { const b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
        this.pendinExpenseColArray.ClientAmount = this.fdDataShareServie.customSort(ClientAmount, 1, 'label');
        this.pendinExpenseColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));
        const Created = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { const b = { label: this.datePipe.transform(a.CreatedDate, 'MMM dd, yyyy'), value: a.CreatedDate }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.CreatedDate = Created.map(a => { const b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        this.pendinExpenseColArray.CreatedBy = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.CreatedBy, value: a.CreatedBy }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ModifiedBy = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b; }).filter(ele => ele.label));
        this.pendinExpenseColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { const b = { label: this.datePipe.transform(a.Modified, 'MMM dd, yyyy'), value: a.Modified }; return b; }).filter(ele => ele.label));
    }

    uniqueArrayObj(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
            const keys = {
                label: label1,
                value: array.find(s => s.label === label1).value
            };
            return keys ? keys : '';
        });
    }

    // Open popups
    openPopup(data, popUpData) {
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('ExpenseApprovers') > -1 || groups.indexOf('Managers') > -1) {
            this.items = [
                { label: 'Approve Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Reject Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Cancel Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            ];
        } else {
            this.items = [
                { label: 'Cancel Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            ];
        }
    }

    // selectedRowItemPC: any;
    onRowSelect(event) {
        console.log(event);
        // this.selectedRowItemPC = event.data.ProjectCode;
        console.log(this.selectedAllRowsItem);
    }

    onRowUnselect(event) {
        console.log(this.selectedAllRowsItem);
    }

    selectAllRows() {
        console.log('in selectAllRows ', this.selectedAllRowsItem);
    }

    approveExpense(type: string) {
        // let uniqueRT = this.checkSameRT();
        // console.log('uniqueRT ', uniqueRT);
        if (!this.selectedAllRowsItem.length) {
            this.messageService.add({ key: 'pendingExpenseToast', severity: 'info', summary: 'Info message', detail: 'Please select at least one line item try agian.', life: 3000 });
            return false;
        }
        let uniqueRT = false;
        let selectedRT = '';
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            selectedRT = this.selectedAllRowsItem[0].RequestType;
            if (element.RequestType === selectedRT) {
                uniqueRT = true;
            } else {
                uniqueRT = false;
            }
        }
        if (uniqueRT && type === 'approve') {
            this.displayModal = true;
            this.cancelRejectDialog.title = 'Approve Expense';
            this.cancelRejectDialog.text = 'Approve';
            this.addRemoveFormFieldForAE(selectedRT);
            this.selectedRowItem = this.selectedAllRowsItem[0];
        } else if (uniqueRT && type === 'reject') {
            this.getApproveExpenseMailContent('RejectExpense');
            this.displayModal = true;
            this.cancelRejectDialog.title = 'Reject Expense';
            this.cancelRejectDialog.text = 'Reject';
            // this.addRemoveFormFieldForAE(selectedRT);
            this.selectedRowItem = this.selectedAllRowsItem[0];
        } else {
            this.displayModal = false;
            this.messageService.add({ key: 'pendingExpenseToast', severity: 'info', summary: 'Info message', detail: 'Please select same Request type & try agian.', life: 3000 });
        }
    }

    cancelExpense() {
    }
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        this.getPIorClient(this.selectedRowItem);
        console.log(event);
        this.selectedAllRowsItem = [];
        this.canRejExpenseFormField();
        this.selectedAllRowsItem.push(this.selectedRowItem);
        this.cancelRejectDialog.title = event.item.label;
        if (this.cancelRejectDialog.title.toLowerCase() === 'cancel expense' || this.cancelRejectDialog.title.toLowerCase() === 'reject expense') {

            this.cancelRejectDialog.title.toLowerCase() === 'cancel expense' ? this.getApproveExpenseMailContent('CancelExpense') : this.getApproveExpenseMailContent('RejectExpense');

            this.cancelRejectDialog.text = event.item.label.replace('Expense', '');
        } else if (this.cancelRejectDialog.title.toLowerCase() === 'approve expense') {
            this.cancelRejectDialog.text = event.item.label.replace('Expense', '');
            if (this.selectedRowItem.RequestType === 'Invoice Payment') {
                this.addRemoveFormFieldForAE('Invoice Payment');
            } else if (this.selectedRowItem.RequestType === 'Credit Card') {
                this.addRemoveFormFieldForAE('Credit Card');
            }

        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
        this.displayModal = true;
        // document.getElementById("openModalButton").click();
    }

    addRemoveFormFieldForAE(type: string) {
        if (type === 'Invoice Payment') {
            this.approveExpense_form.removeControl('Number');
            this.approveExpense_form.removeControl('DateSpend');
            this.approveExpense_form.removeControl('PaymentMode');
            // this.approveExpense_form.removeControl('ApproverComments');
            this.approveExpense_form.removeControl('ApproverFileUrl');
        } else if (type === 'Credit Card') {
            this.approveExpense_form.addControl('Number', new FormControl('', Validators.required));
            this.approveExpense_form.addControl('DateSpend', new FormControl('', Validators.required));
            this.approveExpense_form.addControl('PaymentMode', new FormControl('', Validators.required));
            this.approveExpense_form.addControl('ApproverComments', new FormControl('', Validators.required));
            this.approveExpense_form.addControl('ApproverFileUrl', new FormControl('', Validators.required));
        }
        this.biilingEntityInfo();
        // Get Mail Content
        this.getApproveExpenseMailContent('ApproveExpense');
    }

    // Get Selected BE
    selectedBE(be: any) {
        console.log('BE ', be);
    }

    selectedPaymentMode(val: any) {
        console.log('Payment Mode ', val);
    }

    onFileChange(event, folderName: string) {
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.approveExpense_form.get('ApproverFileUrl').setValue('');
                this.messageService.add({ key: 'pendingExpenseToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
                return false;
            }
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                const date = new Date();
                const folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/' + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';
                this.filePathUrl = this.globalService.sharePointPageObject.webRelativeUrl + '/_api/web/GetFolderByServerRelativeUrl(' + '\'' + folderPath + '\'' + ')/Files/add(url=@TargetFileName,overwrite=\'true\')?' + '&@TargetFileName=\'' + this.selectedFile.name + '\'';
            };
        }
    }

    async uploadFileData(type: string) {
        const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result);
        if (res.ServerRelativeUrl) {
            this.fileUploadedUrl = res.ServerRelativeUrl ? res.ServerRelativeUrl : '';
            // console.log('this.fileUploadedUrl ', this.fileUploadedUrl);
            if (this.fileUploadedUrl) {
                const batchUrl = [];
                const speInfoObj = {
                    PayingEntity: this.approveExpense_form.value.PayingEntity.Title,
                    Number: this.approveExpense_form.value.Number,
                    DateSpend: this.approveExpense_form.value.DateSpend,
                    PaymentMode: this.approveExpense_form.value.PaymentMode.value,
                    ApproverComments: this.approveExpense_form.value.ApproverComments,
                    ApproverFileUrl: this.fileUploadedUrl,
                    Status: 'Approved'
                };
                speInfoObj['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
                // let data = [];
                for (let inv = 0; inv < this.selectedAllRowsItem.length; inv++) {
                    const element = this.selectedAllRowsItem[inv];
                    // const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);
                    // data.push({
                    //     objData: speInfoObj,
                    //     endpoint: spEndpoint,
                    //     requestPost: false
                    // })

                    const expenseObj = Object.assign({}, this.queryConfig);
                    expenseObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, +element.Id);
                    expenseObj.listName = this.constantService.listNames.SpendingInfo.name;
                    expenseObj.type = 'PATCH';
                    expenseObj.data = speInfoObj;
                    batchUrl.push(expenseObj);
                }
                this.submitForm(batchUrl, type);
            }
        } else if (res.hasError) {
            this.isPSInnerLoaderHidden = true;
            this.submitBtn.isClicked = false;
            this.messageService.add({
                key: 'pendingExpenseToast', severity: 'error', summary: 'Error message',
                detail: 'File not uploaded,Folder / ' + res.message.value + '', life: 3000
            });
        }
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        const batchUrl = [];
        if (type === 'Cancel Expense') {
            if (this.cancelReject_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            // console.log('form is submitting ..... this.cancelReject_form ', this.cancelReject_form.value);
            const speInfoObj = {
                ApproverComments: this.cancelReject_form.value.ApproverComments,
                Status: 'Cancelled'
            };
            speInfoObj['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
            // const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}",
            //                       this.selectedRowItem.Id);
            // let data = [
            //     {
            //         objData: speInfoObj,
            //         endpoint: spEndpoint,
            //         requestPost: false
            //     }
            // ]
            const cancelExpenseObj = Object.assign({}, this.queryConfig);
            cancelExpenseObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, +this.selectedRowItem.Id);
            cancelExpenseObj.listName = this.constantService.listNames.SpendingInfo.name;
            cancelExpenseObj.type = 'PATCH';
            cancelExpenseObj.data = speInfoObj;
            batchUrl.push(cancelExpenseObj);
            this.submitForm(batchUrl, type);

        } else if (type === 'Reject Expense') {
            if (this.cancelReject_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            // console.log('form is submitting ..... this.cancelReject_form ', this.cancelReject_form.value);
            const speInfoObj = {
                ApproverComments: this.cancelReject_form.value.ApproverComments,
                Status: 'Rejected'
            };
            speInfoObj['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
            // let data = [];
            for (let inv = 0; inv < this.selectedAllRowsItem.length; inv++) {
                const element = this.selectedAllRowsItem[inv];
                // tslint:disable-next-line: max-line-length
                // const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);
                // data.push({
                //     objData: speInfoObj,
                //     endpoint: spEndpoint,
                //     requestPost: false
                // })
                const rejectExpenseObj = Object.assign({}, this.queryConfig);
                rejectExpenseObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, +element.Id);
                rejectExpenseObj.listName = this.constantService.listNames.SpendingInfo.name;
                rejectExpenseObj.type = 'PATCH';
                rejectExpenseObj.data = speInfoObj;
                batchUrl.push(rejectExpenseObj);
            }
            this.submitForm(batchUrl, type);
        } else if (type === 'Approve Expense') {
            if (this.approveExpense_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            // console.log('form is submitting ..... this.approveExpense_form ', this.approveExpense_form.value);
            if (this.selectedRowItem.RequestType === 'Invoice Payment') {
                const speInfoObj = {
                    PayingEntity: this.approveExpense_form.value.PayingEntity.Title,
                    ApproverComments: this.approveExpense_form.value.ApproverComments,
                    Status: 'Approved Payment Pending'
                };
                speInfoObj['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
                // let data = [];
                for (let inv = 0; inv < this.selectedAllRowsItem.length; inv++) {
                    const element = this.selectedAllRowsItem[inv];
                    // const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);;
                    // data.push({
                    //     objData: speInfoObj,
                    //     endpoint: spEndpoint,
                    //     requestPost: false
                    // })
                    const invPayObj = Object.assign({}, this.queryConfig);
                    invPayObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, +element.Id);
                    invPayObj.listName = this.constantService.listNames.SpendingInfo.name;
                    invPayObj.type = 'PATCH';
                    invPayObj.data = speInfoObj;
                    batchUrl.push(invPayObj);
                }
                this.submitForm(batchUrl, type);
                return;
            }
            this.uploadFileData(type);
        }
    }

    async submitForm(batchUrl, type: string) {
        await this.spServices.executeBatch(batchUrl);
        if (type === 'Approve Expense') {
            this.messageService.add({
                key: 'pendingExpenseToast', severity: 'success', summary: 'Success message',
                detail: 'Expense Approved.', life: 2000
            });
            this.displayModal = false;
            this.sendMailToSelectedLineItems(type);
        } else if (type === 'Cancel Expense' || type === 'Reject Expense') {
            this.messageService.add({
                key: 'pendingExpenseToast', severity: 'success', summary: 'Success message',
                detail: 'Submitted.', life: 2000
            });
            this.displayModal = false;
            this.sendMailToSelectedLineItems(type);
        }
        this.isPSInnerLoaderHidden = true;
    }

    sendMailToSelectedLineItems(type: string) {
        for (let m = 0; m < this.selectedAllRowsItem.length; m++) {
            const element = this.selectedAllRowsItem[m];
            this.getPIorClient(element);
            this.sendApproveCanRejExpMail(element, type);
        }
    }

    async getApproveExpenseMailContent(type) {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        const mailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace('{{MailType}}', type),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        };

        const obj = [{
            url: this.spServices.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }];
        const res = await this.spServices.executeBatch(obj);
        this.mailContentRes = res;
        console.log('Approve Mail Content res ', this.mailContentRes);
    }

    getPIorClient(rowItem) {
        if (rowItem.ProjectCode && rowItem.ClientLegalEntity) {
            const pc = rowItem.ProjectCode;
            console.log('Project Code is ', pc);
            this.selectedProjectInfo = this.getPIByTitle(pc);
            console.log('this.selectedProjectInfo ', this.selectedProjectInfo);
            this.getResCatByCMLevel();
            this.cleForselectedPI = this.getCleByPC(pc);
        } else {
            this.cleForselectedPI = this.getCleByPC(rowItem.ProjectCode);
            console.log('this.cleForselectedPI ', this.cleForselectedPI);
            this.getResCatByCMLevel();
        }
    }

    getCleByPC(title) {
        const found = this.cleData.find((x) => {
            if (x.Title === title) {
                if (x.CMLevel1.hasOwnProperty('results')) {
                    this.selectedPI = x.CMLevel1.results;
                }
                return x;
            }
        });
        return found ? found : '';
    }

    getPIByTitle(title) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === title) {
                if (x.CMLevel1.hasOwnProperty('results')) {
                    this.selectedPI = x.CMLevel1.results;
                }
                console.log('this.selectedPI ', this.selectedPI);
                return x;
            }
        });
        return found ? found : '';
    }

    getResCatByCMLevel() {
        this.cmLevelIdList = [];
        for (let l = 0; l < this.selectedPI.length; l++) {
            const elements = this.selectedPI[l];
            if (Array.isArray(elements)) {
                for (let e = 0; e < elements.length; e++) {
                    const ele = elements[e];
                    this.cmLevelIdList.push(ele);
                }
            } else {
                this.cmLevelIdList.push(elements);
            }
        }
        console.log('this.cmLevelIdList ', this.cmLevelIdList);
        this.resCatEmails = [];
        this.resourceCatData();
    }

    resourceCatData() {
        for (let c = 0; c < this.cmLevelIdList.length; c++) {
            const element = this.cmLevelIdList[c];
            // this.resCatEmails.push(this.getResourceData(element))
            const item = this.getResourceData(element);
            item ? this.resCatEmails.push(item) : '';
            // if (item) {
            //     this.resCatEmails.push(item);
            // }
        }
        console.log('resCatEmails ', this.resCatEmails);
    }

    getResourceData(ele) {
        const found = this.rcData.find((x) => {
            if (x.UserName.ID === ele.ID) {
                return x;
            }
        });
        return found ? found : '';
    }

    replaceContent(mailContent, key, value) {
        return mailContent.replace(new RegExp(key, 'g'), value);
    }

    getAuthor(id) {
        const found = this.rcData.find((x) => {
            if (x.UserName.ID === id) {
                return x;
            }
        });
        return found ? found : '';
    }

    sendApproveCanRejExpMail(expense, type: string) {
        // let isCleData = this.getCleByPC(expense.projectCode);
        const isCleData = this.cleForselectedPI;
        const author = this.getAuthor(expense.AuthorId);
        const val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.ProjectCode + ' (' + isCleData.ClientLegalEntity + ')' : expense.ProjectCode;

        // var mailTemplate =  data.Status === "Approved" ? "ApproveExpense" :  data.Status === "Cancelled" ? "CancelExpense" : "RejectExpense";
        const mailSubject = type === 'Approve Expense' ? expense.ProjectCode + ' : Expense Approved' : type === 'Cancel Expense' ? expense.ProjectCode + ' : Expense Cancelled' :
            expense.ProjectCode + ' : Expense Rejected';

        let mailContent = this.mailContentRes[0].retItems[0].Content;
        mailContent = this.replaceContent(mailContent, '@@Val1@@', val1);
        mailContent = this.replaceContent(mailContent, '@@Val2@@', expense.Category);
        mailContent = this.replaceContent(mailContent, '@@Val4@@', expense.ExpenseType);
        mailContent = this.replaceContent(mailContent, '@@Val5@@', expense.Currency + ' ' + parseFloat(expense.Amount).toFixed(2));
        mailContent = this.replaceContent(mailContent, '@@Val6@@', expense.ClientAmount ? expense.ClientCurrency + ' ' + parseFloat(expense.ClientAmount).toFixed(2) : '--');
        mailContent = this.replaceContent(mailContent, '@@Val7@@', expense.Notes);
        mailContent = this.replaceContent(mailContent, '@@Val10@@', this.approveExpense_form.value.ApproverComments ? this.approveExpense_form.value.ApproverComments : this.cancelReject_form.value.ApproverComments);

        mailContent = this.replaceContent(mailContent, '@@Val0@@', expense.Id);
        mailContent = this.replaceContent(mailContent, '@@Val13@@', author.hasOwnProperty('UserName') ? author.UserName.Title : 'Member');
        mailContent = this.replaceContent(mailContent, '@@Val14@@', this.currentUserInfoData.Title);
        if (type === 'Approve Expense') {
            mailContent = this.replaceContent(mailContent, '@@Val15@@', this.approveExpense_form.value.PayingEntity.Title);
            if (expense.RequestType !== 'Invoice Payment') {
                mailContent = this.replaceContent(mailContent, '@@Val8@@', this.approveExpense_form.value.PaymentMode.value);
                mailContent = this.replaceContent(mailContent, '@@Val9@@', this.datePipe.transform(this.approveExpense_form.value.DateSpend, 'dd MMMM yyyy, hh:mm a'));
                mailContent = this.replaceContent(mailContent, '@@Val11@@', this.approveExpense_form.value.Number);
                mailContent = this.replaceContent(mailContent, '@@Val12@@', this.globalService.sharePointPageObject.rootsite + '' + this.fileUploadedUrl);
            } else {
                mailContent = this.replaceContent(mailContent, '@@Val8@@', '');
                mailContent = this.replaceContent(mailContent, '@@Val9@@', '');
                mailContent = this.replaceContent(mailContent, '@@Val11@@', expense.Number);
                mailContent = this.replaceContent(mailContent, '@@Val12@@', '');
            }
        }

        const ccUser = this.getCCList(type);
        // ccUser.push(this.currentUserInfoData.Email);
        const tos = this.getTosList(type);
        this.spServices.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.isPSInnerLoaderHidden = false;
        this.reFetchData();
    }

    getTosList(type: string) {
        let arrayTo = [];
        const approvers = this.groupInfo.results;
        if (type === 'Reject Expense' || type === 'Approve Expense') {
            // Creator
            this.selectedAllRowsItem.forEach(element => {
                arrayTo.push(element.AuthorEMail);
            });

            // CS Team Member
            if (this.resCatEmails.length) {
                arrayTo.push(this.fdDataShareServie.getCSMember(this.resCatEmails));
            }

        } else if (type === 'Cancel Expense') {
            // Expense Approver Member
            if (approvers.length) {
                for (const i in approvers) {
                    if (approvers[i].Email !== undefined && approvers[i].Email !== '') {
                        arrayTo.push(approvers[i].Email);
                    }
                }
            }
        }
        // arrayTo.push(this.currentUserInfoData.Email);
        arrayTo = arrayTo.filter(this.onlyUnique);
        console.log('arrayTo ', arrayTo);
        return arrayTo;
    }

    getCCList(type: string) {
        let arrayCC = [];
        const itApprovers = this.groupITInfo.results;
        const approvers = this.groupInfo.results;
        if (type === 'Cancel Expense') {
            // CS Team Member
            if (this.resCatEmails.length) {
                arrayCC.push(this.fdDataShareServie.getCSMember(this.resCatEmails));
            }
            // Current User
            arrayCC.push(this.currentUserInfoData.Email);
            // Creator
            this.selectedAllRowsItem.forEach(element => {
                arrayCC.push(element.AuthorEMail);
            });
            // Invoice Team Member
            if (itApprovers.length) {
                arrayCC.push(this.fdDataShareServie.getITMember(itApprovers));
            }

        } else if (type === 'Reject Expense' || type === 'Approve Expense') {
            // Current User
            arrayCC.push(this.currentUserInfoData.Email);
            // Expense Approver Member
            if (approvers.length) {
                for (const i in approvers) {
                    if (approvers[i].Email !== undefined && approvers[i].Email !== '') {
                        arrayCC.push(approvers[i].Email);
                    }
                }
            }
            // Invoice Team Member
            if (itApprovers.length) {
                arrayCC.push(this.fdDataShareServie.getITMember(itApprovers));
            }
        }

        arrayCC = arrayCC.filter(this.onlyUnique);
        console.log('arrayCC ', arrayCC);
        return arrayCC;
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    reFetchData() {
        this.getRequiredData();
    }


    // Export to Excel
    convertToExcelFile(cnf1) {
        console.log('cnf ', cnf1);
        cnf1.exportCSV();
    }

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
        this.subscription.unsubscribe();
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (event.target.className === 'pi pi-ellipsis-v') {
            if (this.tempClick) {
                this.tempClick.style.display = 'none';
                if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
                    this.tempClick = event.target.parentElement.children[0].children[0];
                    this.tempClick.style.display = '';
                } else {
                    this.tempClick = undefined;
                }
            } else {
                this.tempClick = event.target.parentElement.children[0].children[0];
                this.tempClick.style.display = '';
            }

        } else {
            if (this.tempClick) {
                this.tempClick.style.display = 'none';
                this.tempClick = undefined;
            }
        }
    }
    optionFilter(event: any) {
        if (event.target.value) {
            this.isOptionFilter = false;
        }
    }

    ngAfterViewChecked() {
        if (this.pendingExpenses.length && this.isOptionFilter) {
            const obj = {
                tableData: this.pendingEnpenseTable,
                colFields: this.pendinExpenseColArray
            };
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
