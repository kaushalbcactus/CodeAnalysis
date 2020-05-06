import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SPOperationService } from '../../../Services/spoperation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from '../../../Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { Subscription } from 'rxjs';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { DialogService } from 'primeng';

@Component({
    selector: 'app-approved-non-billable',
    templateUrl: './approved-non-billable.component.html',
    styleUrls: ['./approved-non-billable.component.css']
})
export class ApprovedNonBillableComponent implements OnInit, OnDestroy {
    FolderName: string;
    SelectedFile = [];

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
        private cdr: ChangeDetectorRef,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        public dialogService: DialogService,
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

    get isValidMarkAsPaymentForm() {
        return this.markAsPayment_form.controls;
    }
    tempClick: any;
    approvedNonBillableRes: any = [];
    approvedNonBillableCols: any[];

    // Mark As Paymen
    markAsPayment_form: FormGroup;

    // Payment Mode array
    paymentModeArray: any = [];

    // Lodder
    isPSInnerLoaderHidden: boolean = true;

    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };

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
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    @ViewChild('anb', { static: false }) approvedNBTable: Table;

    // Project Info
    projectInfoData: any = [];

    // Billing ENtity Data
    billingEntityData: any = [];

    // Resource Categorization
    rcData: any = [];

    anonBillableColArray = {
        ProjectCode: [],
        SOWCode: [],
        VendorName: [],
        Category: [],
        ExpenseType: [],
        ClientAmount: [],
        ClientCurrency: [],
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
    };

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    selectedRowItemData: any = [];
    selectedRowItemPC: any;
    approvedSts: boolean = true;

    rightSideBar: boolean = false;
    items: any[];

    rowItemDetails: any;

    // Modal
    markAsPaymentModal: boolean = false;
    listOfPOCs: any = [];

    vfUnique: boolean = false;

    // Upload File
    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    fileUploadedUrl = '';

    isOptionFilter: boolean;

    async ngOnInit() {
        this.fdConstantsService.fdComponent.hideDatesSection = false;
        // SetDefault Values
        if (this.fdDataShareServie.expenseDateRange.startDate) {
            this.DateRange = this.fdDataShareServie.expenseDateRange;
        } else {
            const last3Days = this.commonService.getLastWorkingDay(65, new Date());
            this.rangeDates = [last3Days, new Date()];
            this.DateRange.startDate = new Date(this.datePipe.transform(this.rangeDates[0], 'yyyy-MM-dd') + ' 00:00:00').toISOString();
            this.DateRange.endDate = new Date(this.datePipe.transform(this.rangeDates[1], 'yyyy-MM-dd') + ' 23:59:00').toISOString();
            this.fdDataShareServie.expenseDateRange = this.DateRange;
        }
        this.createANBCols();
        this.initializeMarkAsPaymentForm_field();
        // Get VendorFreelancer List
        this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();
        await this.projectInfo();
        // Resource Categorization
        this.resourceCInfo();

        this.paymentModeArray = [
            { label: 'BankTransfer', value: 'Bank Transfer' },
            { label: 'CreditCard', value: 'Credit Card' },
            { label: 'Cheque', value: 'Cheque' },
        ];

    }
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
    resourceCInfo() {
        this.subscription.add(this.fdDataShareServie.defaultRCData.subscribe((res) => {
            if (res) {
                this.rcData = res;
                console.log('Resource Categorization ', this.rcData);
            }
        }));
    }

    initializeMarkAsPaymentForm_field() {
        this.markAsPayment_form = this.fb.group({
            Number: ['', Validators.required],
            DateSpend: ['', Validators.required],
            PaymentMode: ['', Validators.required],
            // ApproverComments: ['', Validators.required],
            ApproverFileUrl: ['', Validators.required]
        });
    }

    createANBCols() {
        this.approvedNonBillableCols = [
            { field: 'Number', header: 'Ref. Number', visibility: true },
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'VendorName', header: 'Vendor Name', visibility: true },
            { field: 'ExpenseType', header: 'Expense Type', visibility: true },
            { field: 'PaymentMode', header: 'Payment Mode', visibility: true },
            { field: 'ClientAmount', header: 'Client Amount', visibility: true },
            { field: 'ClientCurrency', header: 'Client Currency', visibility: true },
            { field: 'PayingEntity', header: 'Paying Entity', visibility: true },
            { field: 'Status', header: 'Status', visibility: true },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: true },
            { field: 'ModifiedDateFormat', header: 'Approval / Billable Date', visibility: false },
            { field: 'ModifiedDate', header: 'Approval / Billable Date', visibility: true, exportable: false },

            { field: 'Category', header: 'Category', visibility: false },
            { field: 'RequestType', header: 'Request Type', visibility: false },
            { field: 'DateSpend', header: 'Date Spend', visibility: false },
            { field: 'ClientLegalEntity', header: 'Client Legal Entity', visibility: false },
            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'Created', header: 'Creation Date', visibility: false },
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

    // On load get Required Data
    async getRequiredData() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        let speInfoObj: { filter: any; select?: string; expand?: string; top?: number; };
        const groups = this.globalService.userInfo.Groups.results.map((x: { LoginName: any; }) => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('ExpenseApprovers') > -1) {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForNonBillable);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate)
                .replace('{{EndDate}}', this.DateRange.endDate);
        } else {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForNonBillableCS);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate)
                .replace('{{EndDate}}', this.DateRange.endDate)
                .replace('{{UserID}}', this.globalService.currentUser.userId.toString());
        }
        this.commonService.SetNewrelic('Finance-Dashboard', 'approve-nonbillable', 'spendingInfo');
        const res = await this.spServices.readItems(this.constantService.listNames.SpendingInfo.name, speInfoObj);
        const arrResults = res.length ? res : [];
        this.formatData(arrResults);
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        this.isPSInnerLoaderHidden = true;
        // });

    }

    async formatData(data: any[]) {
        this.approvedNonBillableRes = [];
        this.selectedAllRowsItem = [];
        for (const element of data) {

            // }
            // for (let i = 0; i < data.length; i++) {
            //     const element = data[i];
            // let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            // let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            const sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);

            this.approvedNonBillableRes.push({
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
                DateCreated: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                Notes: element.Notes,
                Created: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                ModifiedDate: new Date(this.datePipe.transform(element.Modified, 'MMM dd, yyyy')), //
                ModifiedDateFormat: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                CreatedBy: element.Author ? element.Author.Title : '',
                ModifiedBy: element.Editor ? element.Editor.Title : '',
                // ModifiedDate: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                RequestType: element.RequestType,
                PaymentMode: element.PaymentMode,
                PayingEntity: element.PayingEntity,
                Status: element.Status,
                DateSpend: this.datePipe.transform(element.DateSpend, 'MMM dd, yyyy, hh:mm a'),
                ApproverComments: element.ApproverComments,
                VendorName: this.getVendorNameById(element),
                FileURL: element.FileURL,
                ClientApprovalFileURL: element.ClientApprovalFileURL,
                ApproverFileUrl: element.ApproverFileUrl,
                VendorFreelancer: element.VendorFreelancer,
                AuthorId: element.AuthorId,
                DollarAmount: element.DollarAmount,
                InvoiceID: element.InvoiceID,
                POLookup: element.POLookup,
                // Created: element.Created,
                // PONumber: this.getPONumber(element),
                // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM dd, yyyy, hh:mm a')
            });
        }
        this.approvedNonBillableRes = [...this.approvedNonBillableRes];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues(this.approvedNonBillableRes);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    getVendorNameById(ele: { VendorFreelancer: any; }) {
        const found = this.freelancerVendersRes.find((x: { ID: any; }) => {
            if (x.ID === ele.VendorFreelancer) {
                return x;
            }
        });
        return found ? found.Title : '';
    }

    createColFieldValues(resArray: any[]) {
        this.anonBillableColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { ProjectCode: any; }) => { const b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.Category = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { Category: any; }) => { const b = { label: a.Category, value: a.Category }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { ExpenseType: any; }) => { const b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter((ele: { label: any; }) => ele.label)));
        const clientAmount = this.uniqueArrayObj(resArray.map((a: { ClientAmount: string; }) => { const b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter((ele: { label: any; }) => ele.label));
        this.anonBillableColArray.ClientAmount = this.fdDataShareServie.customSort(clientAmount, 1, 'label');
        this.anonBillableColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { ClientCurrency: any; }) => { const b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.PaymentMode = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { PaymentMode: any; }) => { const b = { label: a.PaymentMode, value: a.PaymentMode }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.PayingEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { PayingEntity: any; }) => { const b = { label: a.PayingEntity, value: a.PayingEntity }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { Status: any; }) => { const b = { label: a.Status, value: a.Status }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.Number = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { Number: any; }) => { const b = { label: a.Number, value: a.Number }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.VendorName = this.commonService.sortData(this.uniqueArrayObj(resArray.map((a: { VendorName: any; }) => { const b = { label: a.VendorName, value: a.VendorName }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.PaymentDate = this.uniqueArrayObj(resArray.map((a: { DateSpend: any; }) => { const b = { label: a.DateSpend, value: a.DateSpend }; return b; }).filter((ele: { label: any; }) => ele.label));
        const modified = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map((a: { ModifiedDate: any; }) => { const b = { label: this.datePipe.transform(a.ModifiedDate, 'MMM dd, yyyy'), value: a.ModifiedDate }; return b; }).filter((ele: { label: any; }) => ele.label)));
        this.anonBillableColArray.ModifiedDate = modified.map((a: any) => { const b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter((ele: { label: any; }) => ele.label);
        this.anonBillableColArray.Created = this.uniqueArrayObj(resArray.map((a: { Created: any; }) => { const b = { label: a.Created, value: a.Created }; return b; }).filter((ele: { label: any; }) => ele.label));
        // this.anonBillableColArray.SOWCode = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label));
        // this.anonBillableColArray.DateCreated = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DateCreated, value: a.DateCreated }; return b; }).filter(ele => ele.label));
        // this.anonBillableColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
        // this.anonBillableColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
    }

    uniqueArrayObj(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map((s: { label: any; }) => s.label))).map(label1 => {
            return {
                label: label1,
                value: array.find((s: { label: unknown; }) => s.label === label1).value
            };
        });
    }

    selectAllRows() {
        this.selectedAllRowsItem.length === 0 ? this.selectedRowItemData = [] : this.selectedRowItemData;
        if (this.selectedAllRowsItem.length === this.approvedNonBillableRes.length) {
            this.selectedRowItemData = this.selectedAllRowsItem;
        }
        console.log('in selectAllRows ', this.selectedAllRowsItem);
    }
    onRowSelect(event: any) {
        console.log(this.selectedAllRowsItem);
        this.approvedSts = true;
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            const sts = this.selectedAllRowsItem[0].Status;
            if (element.Status !== sts) {
                this.approvedSts = false;
                this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Info message', detail: 'Please select line item with status containing "Payment Pending" & try again.', life: 4000 });
            }
        }
    }

    onRowUnselect(event: any) {
        console.log(this.selectedAllRowsItem);
    }
    openTableAtt(data: any, popUpData: any) {
        this.items = [];
        this.items.push({ label: 'Details', command: (e: any) => this.openMenuContent(e, data) });
    }
    openMenuContent(event: any, data: any) {
        console.log(JSON.stringify(data));
        this.rowItemDetails = data;
        this.rightSideBar = !this.rightSideBar;
    }
    openPopup(modal: string) {
        console.log('selectedAllRowsItem ', this.selectedAllRowsItem);
        this.checkUniqueVF();
        if (!this.selectedAllRowsItem.length) {
            this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Info message', detail: 'Please select at least 1 Projects & try again', life: 4000 });
            return;
        }
        if (this.vfUnique) {
            if (modal === 'markAsPaymentModal') {
                // if (this.selectedRowItemData[0].Status.includes("Payment Pending")) {
                const sts = this.checkPPStatus();
                console.log('Sts ', sts);
                if (!this.approvedSts) {
                    this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Info message', detail: 'Please select line item with status containing "Payment Pending".', life: 4000 });
                    return false;
                }
                if (sts) {
                    this.markAsPaymentModal = true;
                } else {
                    this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Info message', detail: 'Please select line item with status containing "Payment Pending".', life: 4000 });
                }
            }
        } else {
            this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Info message', detail: 'Please select same Vendor/Freelance name', life: 4000 });
        }
    }

    checkPPStatus() {
        let ppSts = true;
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            const sts = this.selectedAllRowsItem[0].Status;
            if (element.Status !== sts) {
                return 'Please select same Status & try again.';
            }
            if (!element.Status.includes('Payment Pending')) {
                ppSts = false;
                break;
            } else {
                this.approvedSts = true;
                ppSts = true;
            }
        }
        return ppSts;

    }
    checkUniqueVF() {
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            const vfId = this.selectedAllRowsItem[0].VendorFreelancer;
            if (element.VendorFreelancer !== vfId) {
                this.vfUnique = false;
                break;
            } else {
                this.vfUnique = true;
            }
        }
    }

    cancelFormSub(type: string) {
        this.formSubmit.isSubmit = false;
        if (type === 'markAsPayment_form') {
            this.markAsPayment_form.reset();
        }
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        if (type === 'markAsPayment_form') {
            if (this.markAsPayment_form.invalid) {
                return;
            }
            // this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            console.log('form is submitting ..... for selected row Item i.e ', this.markAsPayment_form.value);
            this.uploadFileData(type);
        }
    }

    //*************************************************************************************************
    // new File uplad function updated by Maxwell
    // ************************************************************************************************
    onFileChange(event: { target: { files: string | any[]; }; }, folderName: string) {
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.markAsPayment_form.get('ApproverFileUrl').setValue('');
                this.messageService.add({ key: 'approvedNonBToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
                return false;
            }
            this.FolderName = folderName;
            this.SelectedFile.push(new Object({ name: sNewFileName, file: this.selectedFile }));

        }
    }

    async uploadFileData(type: string) {
        const date = new Date();
        this.commonService.SetNewrelic('Finance-Dashboard', 'approve-nonbillable', 'UploadFile');
        this.commonService.UploadFilesProgress(this.SelectedFile, 'SpendingInfoFiles/' + this.FolderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM'), true).then(async uploadedfile => {
            if (this.SelectedFile.length > 0 && this.SelectedFile.length === uploadedfile.length) {
                if (uploadedfile[0].hasOwnProperty('odata.error')) {
                    this.submitBtn.isClicked = false;
                    this.messageService.add({
                        key: 'approvedToast', severity: 'error', summary: 'Error message',
                        detail: 'File not uploaded,Folder / File Not Found', life: 3000
                    });
                } else if (uploadedfile[0].ServerRelativeUrl) {
                    this.fileUploadedUrl = uploadedfile[0].ServerRelativeUrl;
                    if (this.fileUploadedUrl) {
                        this.isPSInnerLoaderHidden = false;
                        const batchUrl = [];
                        const speInfoData = {
                            __metadata: { type: this.constantService.listNames.SpendingInfo.type },
                            Number: this.markAsPayment_form.value.Number,
                            DateSpend: this.markAsPayment_form.value.DateSpend,
                            PaymentMode: this.markAsPayment_form.value.PaymentMode.value,
                            ApproverFileUrl: this.fileUploadedUrl,
                            Status: 'Approved'
                        };

                        this.selectedAllRowsItem.forEach((element: { Id: any; }) => {
                            const spendingInfoObj = Object.assign({}, this.queryConfig);
                            spendingInfoObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, element.Id);
                            spendingInfoObj.listName = this.constantService.listNames.SpendingInfo.name;
                            spendingInfoObj.type = 'PATCH';
                            spendingInfoObj.data = speInfoData;
                            batchUrl.push(spendingInfoObj);
                        });
                        this.submitForm(batchUrl, type);
                    }
                }
            }
        });
    }


    //*************************************************************************************************
    // commented old file upload function
    // ************************************************************************************************


    // onFileChange(event: { target: { files: string | any[]; }; }, folderName: string) {
    //     this.fileReader = new FileReader();
    //     if (event.target.files && event.target.files.length > 0) {
    //         this.selectedFile = event.target.files[0];
    //         const fileName = this.selectedFile.name;
    //         const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
    //         if (fileName !== sNewFileName) {
    //             this.fileInput.nativeElement.value = '';
    //             this.markAsPayment_form.get('ApproverFileUrl').setValue('');
    //             this.messageService.add({ key: 'approvedNonBToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
    //             return false;
    //         }
    //         this.fileReader.readAsArrayBuffer(this.selectedFile);
    //         this.fileReader.onload = () => {
    //             const date = new Date();
    //             const folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/'
    //                 + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';
    //             this.filePathUrl = this.globalService.sharePointPageObject.webRelativeUrl
    //                 + '/_api/web/GetFolderByServerRelativeUrl(' + '\'' + folderPath + '\'' + ')/Files/add(url=@TargetFileName,overwrite=\'true\')?' + '&@TargetFileName=\'' + this.selectedFile.name + '\'';
    //         };
    //     }
    // }

    // async uploadFileData(type: string) {

    //     // this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
    //     this.commonService.SetNewrelic('Finance-Dashboard', 'approve-nonbillable', 'UploadFile');
    //     const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result);
    //     if (res) {
    //         this.fileUploadedUrl = res.ServerRelativeUrl ? res.ServerRelativeUrl : '';
    //         // console.log('this.fileUploadedUrl ', this.fileUploadedUrl);
    //         if (this.fileUploadedUrl) {
    //             const batchUrl = [];
    //             const speInfoData = {
    //                 __metadata: { type: this.constantService.listNames.SpendingInfo.type },
    //                 // PayingEntity: this.markAsPayment_form.value.PayingEntity.Title,
    //                 Number: this.markAsPayment_form.value.Number,
    //                 DateSpend: this.markAsPayment_form.value.DateSpend,
    //                 PaymentMode: this.markAsPayment_form.value.PaymentMode.value,
    //                 // ApproverComments: this.markAsPayment_form.value.ApproverComments,
    //                 ApproverFileUrl: this.fileUploadedUrl,
    //                 Status: 'Approved'
    //             };
    //             // speInfoData['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
    //             // let data = [];
    //             this.selectedAllRowsItem.forEach((element: { Id: any; }) => {
    //                 const spendingInfoObj = Object.assign({}, this.queryConfig);
    //                 spendingInfoObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, element.Id);
    //                 spendingInfoObj.listName = this.constantService.listNames.SpendingInfo.name;
    //                 spendingInfoObj.type = 'PATCH';
    //                 spendingInfoObj.data = speInfoData;
    //                 batchUrl.push(spendingInfoObj);
    //             });
    //             // for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
    //             //     const element = this.selectedAllRowsItem[j];
    //             //     const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);
    //             //     data.push({
    //             //         objData: speInfoObj,
    //             //         endpoint: spEndpoint,
    //             //         requestPost: false
    //             //     })
    //             // }
    //             this.submitForm(batchUrl, type);
    //         }
    //     } else if (res.hasError) {
    //         this.isPSInnerLoaderHidden = true;
    //         this.submitBtn.isClicked = false;
    //         this.messageService.add({ key: 'approvedToast', severity: 'error', summary: 'Error message', detail: 'File not uploaded,Folder / ' + res.message.value + '', life: 3000 });
    //     }
    // }

    // batchContents: any = [];
    async submitForm(batchUrl: any[], type: string) {
        this.commonService.SetNewrelic('Finance-Dashboard', 'approve-nonbillable', 'submitForm');
        await this.spServices.executeBatch(batchUrl);
        if (type === 'markAsPayment_form') {
            this.messageService.add({
                key: 'approvedNonBToast', severity: 'success', summary: 'Success message',
                detail: 'Payment marked.', life: 2000
            });
            this.markAsPaymentModal = false;
            this.reFetchData();
        }
        this.isPSInnerLoaderHidden = true;
        this.submitBtn.isClicked = false;
    }

    reFetchData() {
        setTimeout(() => {
            this.getRequiredData();
        }, 3000);
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    @HostListener('document:click', ['$event'])
    clickout(event: { target: { className: string; parentElement: { children: { children: any[]; }[]; }; }; }) {
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

    // tslint:disable-next-line: use-lifecycle-interface
    ngAfterViewChecked() {
        if (this.approvedNonBillableRes.length && this.isOptionFilter) {
            const obj = {
                tableData: this.approvedNBTable,
                colFields: this.anonBillableColArray
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
