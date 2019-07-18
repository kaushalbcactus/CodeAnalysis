import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SelectItem, MessageService } from 'primeng/api';
import { SharepointoperationService } from '../../../Services/sharepoint-operation.service';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from '../../../Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { NodeService } from '../../../node.service';
import { ActivatedRoute } from '@angular/router';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-pending-expense',
    templateUrl: './pending-expense.component.html',
    styleUrls: ['./pending-expense.component.css']
})
export class PendingExpenseComponent implements OnInit, OnDestroy {

    // Loadder
    isPSInnerLoaderHidden: boolean = true;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;
    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    }

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

    // List of Subscribers 
    private subscription: Subscription = new Subscription();

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private spServices: SharepointoperationService,
        private constantService: ConstantsService,
        private globalService: GlobalService,
        private fdConstantsService: FdConstantsService,
        private commonService: CommonService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private nodeService: NodeService,
        private route: ActivatedRoute,
        private spOperationsService: SpOperationsService,
    ) {
        this.subscription.add(this.fdDataShareServie.getAddExpenseSuccess().subscribe(date => {
            console.log('I called when expense created success...... ');
            this.isExpenseCreate = true;
            console.log('this.isExpenseCreate ', this.isExpenseCreate);
            this.getRequiredData();
        }));
    }

    async ngOnInit() {
        let snapData = this.route.snapshot.data['fdData'];
        this.fdConstantsService.fdComponent.hideDatesSection = true;

        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('ExpenseApprovers') > -1) {
            this.showApproveReject = true;
        }
        else {
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

    // Project Info 
    projectInfoData: any = [];
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

    // Client Legal Entity 
    cleData: any = [];
    cleInfo() {
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('Client Legal Entity ', this.cleData);
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

    approveExpenseFormField() {
        this.approveExpense_form = this.fb.group({
            PayingEntity: ['', Validators.required],
            Number: ['', Validators.required],
            DateSpend: ['', Validators.required],
            PaymentMode: ['', Validators.required],
            ApproverComments: ['', Validators.required],
            ApproverFileUrl: ['', Validators.required]
        })
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
            { field: 'Created', header: 'Date Created', visibility: true },
            { field: 'CreatedDateFormat', header: 'Date Created', visibility: false },
            { field: 'CreatedBy', header: 'Created By', visibility: true },
            { field: 'Modified', header: 'Modified Date', visibility: false },
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

    onTabChange(event) {
        this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Tab Expanded' });
    }

    get isValidApproveExpeseForm() {
        return this.approveExpense_form.controls;
    }
    get isValidCancelExpeseForm() {
        return this.cancelReject_form.controls;
    }

    selectedProjectCode(projectCode, event) {
        console.log('Selected Project code ', projectCode);
    }

    OnChange(event) {
        console.log(event)
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
        // if (this.cancelReject_form.value.isCancel === 'No') {
        //     this.submitBtn.isClicked = true;
        // } else {
        //     this.submitBtn.isClicked = false;
        // }
    }

    pendingExpenses: any = [];
    // On load get Required Data
    async getRequiredData() {

        // Refetch vendor list if expense created
        if (this.isExpenseCreate) {
            this.fdDataShareServie.freelancerVendersRes = [];
            this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();

        let speInfoObj
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1) {
            speInfoObj = {
                filter: this.fdConstantsService.fdComponent.spendingInfo.filter.replace("{{Status}}", "Created"),
                select: this.fdConstantsService.fdComponent.spendingInfo.select,
                top: this.fdConstantsService.fdComponent.spendingInfo.top,
                orderby: this.fdConstantsService.fdComponent.spendingInfo.orderby.replace("{{Status}}", "Created")
            }
        }
        else {
            speInfoObj = {
                filter: this.fdConstantsService.fdComponent.spendingInfoCS.filter.replace("{{Status}}", "Created").replace("{{UserID}}"
                    , this.globalService.sharePointPageObject.userId.toString()),
                select: this.fdConstantsService.fdComponent.spendingInfoCS.select,
                top: this.fdConstantsService.fdComponent.spendingInfoCS.top,
                orderby: this.fdConstantsService.fdComponent.spendingInfoCS.orderby.replace("{{Status}}", "Created")
            }
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
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });

    }

    async formatData(data: any[]) {
        this.pendingExpenses = [];
        this.selectedAllRowsItem = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let cleName = this.getPIFromPC(element);
            let cname = cleName ? ' / ' + cleName : '';

            let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            let sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);

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
                Created: new Date(this.datePipe.transform(element.Created, 'MMM dd, yyyy')),
                CreatedDateFormat: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                CreatedBy: rcCreatedItem ? rcCreatedItem.UserName.Title : '',
                ModifiedBy: rcModifiedItem ? rcModifiedItem.UserName.Title : '',
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
                AuthorId: element.AuthorId,
                DollarAmount: element.DollarAmount,
                InvoiceID: element.InvoiceID,
                POLookup: element.POLookup,
                // PONumber: this.getPONumber(element),
                // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM dd, yyyy, hh:mm a')
            })
        }
        this.pendingExpenses = [...this.pendingExpenses];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues();
    }

    getSowTitle(pi: any) {
        let found = this.sowRes.find((x) => {
            if (x.SOWCode === pi.Title) {
                return x;
            }
        })
        return found ? found : ''
    }



    getPIFromPC(pc) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x;
            }
        })
        return found ? found.ClientLegalEntity : ''
    }


    getVendorNameById(ele) {
        let found = this.freelancerVendersRes.find((x) => {
            if (x.ID === ele.VendorFreelancer) {
                return x;
            }
        })
        return found ? found.Title : ''
    }

    getCreatedModifiedByFromRC(id) {
        let found = this.rcData.find((x) => {
            if (x.UserName.ID == id) {
                return x;
            }
        })
        return found ? found : ''
    }

    pendinExpenseColArray = {
        ProjectCode: [],
        ClientLegalEntity: [],
        RequestType: [],
        SOWCode: [],
        Category: [],
        ExpenseType: [],
        ClientAmount: [],
        ClientCurrency: [],
        Created: [],
        CreatedBy: [],
        ModifiedBy: [],
        ModifiedDate: [],
        VendorName: [],
    }

    createColFieldValues() {

        this.pendinExpenseColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.VendorName = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.VendorName, value: a.VendorName }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.RequestType = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.RequestType, value: a.RequestType }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.SOWCode = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.Category = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
        const ClientAmount = this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
        this.pendinExpenseColArray.ClientAmount = this.fdDataShareServie.customSort(ClientAmount, 1, 'label');
        this.pendinExpenseColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));
        const Created = this.commonService.sortDateArray(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: this.datePipe.transform(a.Created, 'MMM dd, yyyy'), value: a.Created }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.Created = Created.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        this.pendinExpenseColArray.CreatedBy = this.commonService.sortData(this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.CreatedBy, value: a.CreatedBy }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ModifiedBy = this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: a.ModifiedBy, value: a.ModifiedBy }; return b; }).filter(ele => ele.label));
        this.pendinExpenseColArray.ModifiedDate = this.uniqueArrayObj(this.pendingExpenses.map(a => { let b = { label: this.datePipe.transform(a.Modified, 'MMM dd, yyyy'), value: a.Modified }; return b; }).filter(ele => ele.label));
    }

    uniqueArrayObj(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
            let keys = {
                label: label1,
                value: array.find(s => s.label === label1).value
            }
            return keys ? keys : '';
        })
    }

    items: any[];
    cancelRejectDialog: any = {
        title: '',
        text: ''
    }
    // Open popups
    openPopup(data, popUpData) {
        console.log('Row data  ', data);
        // console.log('pubSupportSts  ', pubSupportSts);

        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('ExpenseApprovers') > -1) {
            this.items = [
                { label: 'Approve Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Reject Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Cancel Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            ];
        }
        else {
            this.items = [
                { label: 'Cancel Expense', command: (e) => this.openMenuContent(e, data) },
                { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            ];
        }

    }

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    selectedRowItemData: any = [];
    // selectedRowItemPC: any;
    onRowSelect(event) {
        console.log(event);
        // this.selectedRowItemData.push(event.data);
        // this.selectedRowItemPC = event.data.ProjectCode;
        console.log(this.selectedAllRowsItem);
    }

    onRowUnselect(event) {
        // let rowUnselectIndex = this.selectedRowItemData.indexOf(event.data);
        // this.selectedRowItemData.splice(rowUnselectIndex, 1);
        console.log(this.selectedAllRowsItem);
    }

    selectAllRows() {
        this.selectedAllRowsItem.length === 0 ? this.selectedRowItemData = [] : this.selectedRowItemData;
        if (this.selectedAllRowsItem.length === this.pendingExpenses.length) {
            this.selectedRowItemData = this.selectedAllRowsItem;
        }
        console.log('in selectAllRows ', this.selectedAllRowsItem);
        console.log('selectedRowItemData ', this.selectedRowItemData);

    }

    // By Selecting Multiple Row Item Approve Or Cancel Expense

    checkSameRT() {
        // let found = this.selectedAllRowsItem.find(x => {
        //     let selectedRT = this.selectedAllRowsItem[0].RequestType;
        //     if (x.RequestType === selectedRT) {
        //         return true;
        //     }
        // });
        // return found ? found : false;
        const arr = this.selectedAllRowsItem.map(x => {
            let selectedRT = this.selectedAllRowsItem[0].RequestType;
            if (x.RequestType !== selectedRT) {
                console.log('Different ');
            } else {
                console.log('same ');

            }
        })
    }

    approveExpense(type: string) {
        // let uniqueRT = this.checkSameRT();
        // console.log('uniqueRT ', uniqueRT);
        if (!this.selectedAllRowsItem.length) {
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Please select at least one line item try agian.', detail: '', life: 3000 });
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
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Please select same Request type & try agian.', detail: '', life: 3000 });
        }
    }

    cancelExpense() {

    }

    selectedRowItem: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        this.getPIorClient(this.selectedRowItem);
        console.log(event);
        this.selectedAllRowsItem = [];
        this.selectedAllRowsItem.push(this.selectedRowItem);
        this.cancelRejectDialog.title = event.item.label;
        if (this.cancelRejectDialog.title.toLowerCase() === 'cancel expense' || this.cancelRejectDialog.title.toLowerCase() === 'reject expense') {

            this.cancelRejectDialog.title.toLowerCase() === 'cancel expense' ? this.getApproveExpenseMailContent('CancelExpense') : this.getApproveExpenseMailContent('RejectExpense');

            this.cancelRejectDialog.text = event.item.label.replace('Expense', '');
        } else if (this.cancelRejectDialog.title.toLowerCase() === 'approve expense') {
            this.cancelRejectDialog.text = event.item.label.replace('Expense', '');
            if (this.selectedRowItem.RequestType === "Invoice Payment") {
                this.addRemoveFormFieldForAE('Invoice Payment');
            } else if (this.selectedRowItem.RequestType === "Credit Card") {
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
            this.approveExpense_form.removeControl('ApproverComments');
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

    // Upload File

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    fileUploadedUrl: any;
    onFileChange(event, folderName: string) {
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                let date = new Date();
                let folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/' + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';
                this.filePathUrl = this.globalService.sharePointPageObject.webRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" + "&@TargetFileName='" + this.selectedFile.name + "'";
                // this.uploadFileData('');
                // this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
                //     console.log('selectedFile uploaded .', res);
                // })
            };
        }
    }

    uploadFileData(type: string) {
        this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
            if (res.d) {
                this.fileUploadedUrl = res.d.ServerRelativeUrl ? res.d.ServerRelativeUrl : '';
                console.log('this.fileUploadedUrl ', this.fileUploadedUrl);
                if (this.fileUploadedUrl) {
                    let speInfoObj = {
                        PayingEntity: this.approveExpense_form.value.PayingEntity.Title,
                        Number: this.approveExpense_form.value.Number,
                        DateSpend: this.approveExpense_form.value.DateSpend,
                        PaymentMode: this.approveExpense_form.value.PaymentMode.value,
                        ApproverComments: this.approveExpense_form.value.ApproverComments,
                        ApproverFileUrl: this.fileUploadedUrl,
                        Status: 'Approved'
                    }
                    speInfoObj["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
                    let data = [];
                    for (let inv = 0; inv < this.selectedAllRowsItem.length; inv++) {
                        const element = this.selectedAllRowsItem[inv];
                        const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);
                        data.push({
                            objData: speInfoObj,
                            endpoint: spEndpoint,
                            requestPost: false
                        })
                    }
                    this.submitForm(data, type);
                }
            }
        });
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        if (type === 'Cancel Expense') {
            if (this.cancelReject_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            console.log('form is submitting ..... this.cancelReject_form ', this.cancelReject_form.value);
            let speInfoObj = {
                ApproverComments: this.cancelReject_form.value.ApproverComments,
                Status: 'Cancelled'
            }
            const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", this.selectedRowItem.Id);;
            speInfoObj["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
            let data = [
                {
                    objData: speInfoObj,
                    endpoint: spEndpoint,
                    requestPost: false
                }
            ]
            this.submitForm(data, type);

        } else if (type === 'Reject Expense') {
            if (this.cancelReject_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            console.log('form is submitting ..... this.cancelReject_form ', this.cancelReject_form.value);
            let speInfoObj = {
                ApproverComments: this.cancelReject_form.value.ApproverComments,
                Status: 'Rejected'
            }
            speInfoObj["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
            let data = [];
            for (let inv = 0; inv < this.selectedAllRowsItem.length; inv++) {
                const element = this.selectedAllRowsItem[inv];
                const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);
                // const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", this.selectedRowItem.Id);
                data.push({
                    objData: speInfoObj,
                    endpoint: spEndpoint,
                    requestPost: false
                })
            }
            this.submitForm(data, type);
        } else if (type === 'Approve Expense') {
            if (this.approveExpense_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            console.log('form is submitting ..... this.approveExpense_form ', this.approveExpense_form.value);
            if (this.selectedRowItem.RequestType === "Invoice Payment") {
                let speInfoObj = {
                    PayingEntity: this.approveExpense_form.value.PayingEntity.Title,
                    Status: 'Approved Payment Pending'
                }
                speInfoObj["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
                let data = [];
                for (let inv = 0; inv < this.selectedAllRowsItem.length; inv++) {
                    const element = this.selectedAllRowsItem[inv];
                    const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);;
                    data.push({
                        objData: speInfoObj,
                        endpoint: spEndpoint,
                        requestPost: false
                    })
                }
                this.submitForm(data, type);
                return;
            }
            this.uploadFileData(type);
        }
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
        const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuid, changeSetId);
        batchBodyContent.push('--batch_' + batchGuid + '--');
        const sBatchData = batchBodyContent.join('\r\n');
        const res = await this.spServices.getFDData(batchGuid, sBatchData);
        const arrResults = res;
        console.log('--oo ', arrResults);
        // .subscribe(res => {

        if (type === "Approve Expense") {
            this.messageService.add({ key: 'fdToast', severity: 'success', summary: 'Expense Approved.', detail: '', life: 2000 });
            this.displayModal = false;
            // this.sendCreateExpenseMail(this.selectedRowItem, type);
            this.sendMailToSelectedLineItems(type);
        } else if (type === "Cancel Expense" || type === "Reject Expense") {
            this.messageService.add({ key: 'fdToast', severity: 'success', summary: 'Submitted.', detail: '', life: 2000 })
            this.displayModal = false;
            // this.sendCreateExpenseMail(this.selectedRowItem, type);
            this.sendMailToSelectedLineItems(type);
        }
        this.isPSInnerLoaderHidden = true;
        // });

    }

    sendMailToSelectedLineItems(type: string) {
        for (let m = 0; m < this.selectedAllRowsItem.length; m++) {
            const element = this.selectedAllRowsItem[m];
            this.getPIorClient(element);
            this.sendCreateExpenseMail(element, type);
        }
    }


    // Send Mail

    // Mail Content
    mailContentRes: any;
    async getApproveExpenseMailContent(type) {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        let mailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace("{{MailType}}", type),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        }

        let obj = [{
            url: this.spOperationsService.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }]
        const res = await this.spOperationsService.executeBatch(obj);
        this.mailContentRes = res;
        console.log('Approve Mail Content res ', this.mailContentRes);
    }

    selectedProjectInfo: any;
    cleForselectedPI: any;
    getPIorClient(rowItem) {
        if (rowItem.ProjectCode.includes(' / ')) {
            let pc = rowItem.ProjectCode.substr(0, rowItem.ProjectCode.indexOf(' / '));
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
        let found = this.cleData.find((x) => {
            if (x.Title == title) {
                if (x.CMLevel1.hasOwnProperty('results')) {
                    this.selectedPI = x.CMLevel1.results;
                }
                return x;
            }
        })
        return found ? found : ''
    }

    selectedPI: any = [];
    getPIByTitle(title) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == title) {
                if (x.CMLevel1.hasOwnProperty('results')) {
                    this.selectedPI = x.CMLevel1.results;
                }
                console.log('this.selectedPI ', this.selectedPI);
                return x;
            }
        })
        return found ? found : ''
    }

    cmLevelIdList: any = [];
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

    resCatEmails: any = [];
    resourceCatData() {
        for (let c = 0; c < this.cmLevelIdList.length; c++) {
            const element = this.cmLevelIdList[c];
            // this.resCatEmails.push(this.getResourceData(element))
            let item = this.getResourceData(element);
            item ? this.resCatEmails.push(item) : ''
            // if (item) {
            //     this.resCatEmails.push(item);
            // }
        }
        console.log('resCatEmails ', this.resCatEmails);
    }

    getResourceData(ele) {
        let found = this.rcData.find((x) => {
            if (x.UserName.ID == ele.ID) {
                return x;
            }
        })
        return found ? found : ''
    }

    replaceContent(mailContent, key, value) {
        return mailContent.replace(new RegExp(key, 'g'), value);
    }

    getAuthor(id) {
        let found = this.rcData.find((x) => {
            if (x.UserName.ID == id) {
                return x;
            }
        })
        return found ? found : ''
    }

    sendCreateExpenseMail(expense, type: string) {
        // let isCleData = this.getCleByPC(expense.projectCode);
        let isCleData = this.cleForselectedPI;
        let author = this.getAuthor(expense.AuthorId);
        let val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.ProjectCode + ' (' + isCleData.ClientLegalEntity + ')' : expense.ProjectCode;

        // var mailTemplate =  data.Status === "Approved" ? "ApproveExpense" :  data.Status === "Cancelled" ? "CancelExpense" : "RejectExpense";
        var mailSubject = type === "Approve Expense" ? expense.ProjectCode + " : Expense Approved" : type === "Cancel Expense" ? expense.ProjectCode + " : Expense Cancelled" :
            expense.ProjectCode + " : Expense Rejected";

        let mailContent = this.mailContentRes[0].retItems[0].Content;
        mailContent = this.replaceContent(mailContent, "@@Val1@@", val1);
        mailContent = this.replaceContent(mailContent, "@@Val2@@", expense.Category);
        mailContent = this.replaceContent(mailContent, "@@Val4@@", expense.ExpenseType);
        mailContent = this.replaceContent(mailContent, "@@Val5@@", expense.Currency + ' ' + parseFloat(expense.Amount).toFixed(2));
        mailContent = this.replaceContent(mailContent, "@@Val6@@", expense.ClientAmount ? expense.ClientCurrency + ' ' + parseFloat(expense.ClientAmount).toFixed(2) : '--');
        mailContent = this.replaceContent(mailContent, "@@Val7@@", expense.Notes);
        mailContent = this.replaceContent(mailContent, "@@Val10@@", this.approveExpense_form.value.ApproverComments ? this.approveExpense_form.value.ApproverComments : this.cancelReject_form.value.ApproverComments);

        mailContent = this.replaceContent(mailContent, "@@Val0@@", expense.Id);
        mailContent = this.replaceContent(mailContent, "@@Val13@@", author.hasOwnProperty('UserName') ? author.UserName.Title : 'Member');
        mailContent = this.replaceContent(mailContent, "@@Val14@@", this.currentUserInfoData.Title);
        if (type === "Approve Expense") {
            mailContent = this.replaceContent(mailContent, "@@Val15@@", this.approveExpense_form.value.PayingEntity.Title);
            if (expense.RequestType !== "Invoice Payment") {
                mailContent = this.replaceContent(mailContent, "@@Val8@@", this.approveExpense_form.value.PaymentMode.value);
                mailContent = this.replaceContent(mailContent, "@@Val9@@", this.datePipe.transform(this.approveExpense_form.value.DateSpend, 'dd MMMM yyyy, hh:mm a'));
                mailContent = this.replaceContent(mailContent, "@@Val11@@", this.approveExpense_form.value.Number);
                mailContent = this.replaceContent(mailContent, "@@Val12@@", this.globalService.sharePointPageObject.rootsite + '' + this.fileUploadedUrl);
            } else {
                mailContent = this.replaceContent(mailContent, "@@Val8@@", '');
                mailContent = this.replaceContent(mailContent, "@@Val9@@", '');
                mailContent = this.replaceContent(mailContent, "@@Val11@@", '');
                mailContent = this.replaceContent(mailContent, "@@Val12@@", '');

            }
        }

        var ccUser = [];
        ccUser.push(this.currentUserInfoData.Email);
        let tos = this.getTosList();
        this.spOperationsService.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.isPSInnerLoaderHidden = false;
        this.reFetchData();
    }

    getTosList() {
        var approvers = this.groupInfo.results;
        let itApprovers = this.groupITInfo.results;
        var arrayTo = [];
        if (approvers.length) {
            for (var i in approvers) {
                if (approvers[i].Email != undefined && approvers[i].Email != "") {
                    arrayTo.push(approvers[i].Email);
                }
            }
        }

        if (itApprovers.length) {
            for (var i in itApprovers) {
                if (itApprovers[i].Email != undefined && itApprovers[i].Email != "") {
                    arrayTo.push(itApprovers[i].Email);
                }
            }
        }

        if (this.resCatEmails.length) {
            for (let e = 0; e < this.resCatEmails.length; e++) {
                const element = this.resCatEmails[e];
                if (element.UserName) {
                    if (element.UserName.EMail)
                        arrayTo.push(element.UserName.EMail);
                } else if (element) {
                    arrayTo.push(element.EMail);
                }
            }
        }
        arrayTo = arrayTo.filter(this.onlyUnique);
        console.log('arrayTo ', arrayTo);
        return arrayTo;
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

}
