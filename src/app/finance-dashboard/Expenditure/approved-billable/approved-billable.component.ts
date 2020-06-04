import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { SPOperationService } from '../../../Services/spoperation.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
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
import { ScheduleOopInvoiceDialogComponent } from './schedule-oop-invoice-dialog/schedule-oop-invoice-dialog.component';
import { MarkAsPaymentDialogComponent } from '../mark-as-payment-dialog/mark-as-payment-dialog.component';

@Component({
    selector: 'app-approved-billable',
    templateUrl: './approved-billable.component.html',
    styleUrls: ['./approved-billable.component.css']
})
export class ApprovedBillableComponent implements OnInit, OnDestroy {

    yearRange: string;
    invoice: any;
    SOW: any;

    constructor(
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

    tempClick: any;
    approvedBillableRes: any = [];
    approvedBillableCols: any[];


    // Lodder
    isLoaderenable: boolean = true;
    selectedRowData: any = [];

    // Date Range
    rangeDates: Date[];

    // subscription: Subscription;
    DateRange: any = {
        startDate: '',
        endDate: '',
    };

    freelancerVendersRes: any = [];
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    // List of Subscribers
    private subscription: Subscription = new Subscription();

    @ViewChild('ab', { static: false }) approvedBTable: Table;

    // Project Info
    projectInfoData: any = [];

    // Purchase Order Number
    purchaseOrdersList: any = [];

    // Project COntacts
    projectContactsData: any = [];

    // Billing ENtity Data
    billingEntityData: any = [];

    // Resource Categorization
    rcData: any = [];

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
    };

    selectedAllRows: boolean = false;
    selectedCategories: boolean = false;

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    rightSideBar: boolean = false;
    items: any[];

    rowItemDetails: any;
    listOfPOCs: any = [];


    // Project PO
    poNames: any = [];
    pcFound: boolean = false;
    vfUnique: boolean = false;
    poItem: any;
    pfListItem: any = [];
    pfbListItem: any = [];
    pbbListItem: any = [];
    hBQuery: any = [];
    projectInfoLineItem: any;
    pcmLevels: any = [];

    // Upload File
    updateSpeLineItems: any = [];

    isOptionFilter: boolean;

    async ngOnInit() {

        const currentYear = new Date();
        this.yearRange = (currentYear.getFullYear() - 10) + ':' + (currentYear.getFullYear() + 10);

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

        this.createABCols();
        this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();
        await this.projectInfo();
        this.resourceCInfo();

    }
    async projectInfo() {
        await this.fdDataShareServie.checkProjectsAvailable();
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
                this.getRequiredData();
            }
        }));
    }
    poInfo() {
        this.subscription.add(this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
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
            { field: '', header: '', visibility: true },

        ];
    }

    // On load get Required Data
    async getRequiredData() {

        let speInfoObj;
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('ExpenseApprovers') > -1) {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForBillable);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate)
                .replace('{{EndDate}}', this.DateRange.endDate);
        } else {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForBillableCS);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate)
                .replace('{{EndDate}}', this.DateRange.endDate)
                .replace('{{UserID}}', this.globalService.currentUser.userId.toString());
        }
        this.commonService.SetNewrelic('Finance-Dashboard', 'Expenditure-approvedBillable', 'GetSpendingInfo');
        const res = await this.spServices.readItems(this.constantService.listNames.SpendingInfo.name, speInfoObj);
        const arrResults = res.length ? res : [];
        this.formatData(arrResults);
    }

    getVendorNameById(ele) {
        const found = this.freelancerVendersRes.find((x) => {
            if (x.ID === ele.VendorFreelancer) {
                return x;
            }
        });
        return found ? found.Title : '';
    }

    async formatData(data: any[]) {
        this.approvedBillableRes = [];
        this.selectedAllRowsItem = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);

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
                SOW: sowItem,
                RequestType: element.RequestType,
                PaymentMode: element.PaymentMode,
                PayingEntity: element.PayingEntity,
                Status: element.Status,
                DateSpend: this.datePipe.transform(element.DateSpend, 'MMM d, y, hh:mm a'),
                Created: this.datePipe.transform(element.Created, 'MMM d, y, hh:mm a'),
                Modified: this.datePipe.transform(element.Modified, 'MMM d, y, hh:mm a'),
                CreatedBy: element.Author ? element.Author.Title : '',
                ModifiedBy: element.Editor ? element.Editor.Title : '',
                // ModifiedDate: this.datePipe.transform(element.Modified, 'MMM d, y, hh:mm a'),
                ApproverComments: element.ApproverComments,
                ApproverFileUrl: element.ApproverFileUrl,
                FileURL: element.FileURL,
                ClientApprovalFileURL: element.ClientApprovalFileURL,

                VendorFreelancer: element.VendorFreelancer,
                // AuthorId: element.AuthorId,
                DollarAmount: element.DollarAmount,
                InvoiceID: element.InvoiceID,
                POLookup: element.POLookup,
                // Created: element.Created,
                // PONumber: this.getPONumber(element),
                // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM d, y, hh:mm a')
            });
        }
        this.approvedBillableRes = [...this.approvedBillableRes];
        this.createColFieldValues(this.approvedBillableRes);
        this.isLoaderenable = false;
    }

    createColFieldValues(resArray) {

        this.appBillableColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.Category = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
        const clientAmount = this.uniqueArrayObj(resArray.map(a => { const b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
        this.appBillableColArray.ClientAmount = this.fdDataShareServie.customSort(clientAmount, 1, 'label');
        this.appBillableColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));

        this.appBillableColArray.VendorName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.VendorName, value: a.VendorName }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.RequestType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.RequestType, value: a.RequestType }; return b; }).filter(ele => ele.label)));

        this.appBillableColArray.PaymentMode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.PaymentMode, value: a.PaymentMode }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.PayingEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.PayingEntity, value: a.PayingEntity }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.Status = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));

        this.appBillableColArray.Number = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Number, value: a.Number }; return b; }).filter(ele => ele.label)));
        this.appBillableColArray.PaymentDate = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.DateSpend, value: a.DateSpend }; return b; }).filter(ele => ele.label));
        this.appBillableColArray.Modified = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Modified, value: a.Modified }; return b; }).filter(ele => ele.label));
        this.appBillableColArray.Created = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Created, value: a.Created }; return b; }).filter(ele => ele.label));

        this.appBillableColArray.SOWCode = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label));
        // this.appBillableColArray.DateCreated = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.DateCreated, value: a.DateCreated }; return b; }).filter(ele => ele.label));
        // this.appBillableColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
        // this.appBillableColArray.ModifiedDate = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
    }

    uniqueArrayObj(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
            return {
                label: label1,
                value: array.find(s => s.label === label1).value
            };
        });
    }

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

    // selectedRowItemData: any = [];
    onRowSelect(event) {
        console.log(event);
        // this.selectedRowItemData.push(event.data);
        console.log('this.selectedAllRowsItem ', this.selectedAllRowsItem);
    }

    onRowUnselect(event) {
        console.log('this.selectedAllRowsItem ', this.selectedAllRowsItem);
    }


    openTableAtt(data, popUpData) {
        this.items = [];
        console.log('this.selectedAllRowsItem ', this.selectedAllRowsItem);
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });
    }
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.rowItemDetails = data;
        this.rightSideBar = !this.rightSideBar;
    }

    openPopup(modal: string) {
        console.log('selectedAllRowsItem ', this.selectedAllRowsItem);
        if (!this.selectedAllRowsItem.length) {
            this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select at least 1 Projects & try again', false);
            return;
        }


        console.log(this.selectedAllRowsItem)
        // if (this.pcFound) {
        if (modal === 'scheduleOopModal') {
            this.checkUniquePC();
            if (this.pcFound) {
                const sts = this.checkApprovedStatus();
                if (sts) {
                    const ref = this.dialogService.open(ScheduleOopInvoiceDialogComponent, {
                        header: 'Schedule OOP Invoice',
                        width: '70vw',
                        data: {
                            type: 'approve-billable',
                            selectedAllRowsItem: this.selectedAllRowsItem,
                            projectInfoData: this.projectInfoData
                        },
                        contentStyle: { 'overflow-y': 'visible' },
                        closable: false,
                    });

                    ref.onClose.subscribe((scheduleInvoice: any) => {
                        if (scheduleInvoice) {
                            this.SOW = this.selectedAllRowsItem[0].SOW
                            this.poItem = scheduleInvoice.poItem;
                            this.pfListItem = scheduleInvoice.pfListItem;
                            this.pfbListItem = scheduleInvoice.pfbListItem;
                            this.projectInfoLineItem = scheduleInvoice.projectInfoLineItem;
                            this.pcmLevels = scheduleInvoice.pcmLevels;
                            this.invoice = scheduleInvoice.Invoice;
                            const ScheduleInvoiceForm = scheduleInvoice.ScheduleInvoiceForm
                            this.onSubmit(ScheduleInvoiceForm, ScheduleInvoiceForm.get('InvoiceType').value, 'scheduledOOP')
                        }
                    })
                }
                else {

                    this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select only those Projects whose scheduling is pending.', false);
                }
            } else {

                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select same Projects.', false);
            }

        } else if (modal === 'markAsPaymentModal') {
            this.checkUniqueVF();
            if (this.vfUnique) {
                const sts = this.checkPPStatus();
                console.log('Sts ', sts);
                if (sts) {
                    const ref = this.dialogService.open(MarkAsPaymentDialogComponent, {
                        header: 'Mark As Payment',
                        width: '70vw',
                        contentStyle: { 'overflow-y': 'visible' },
                        closable: false,
                    });
                    ref.onClose.subscribe((paymentDetails: any) => {
                        if (paymentDetails) {
                            this.isLoaderenable = true;
                            this.MarkAsPayment(paymentDetails.paymentForm, 'markAsPayment_form', paymentDetails.fileUrl);
                        }
                    });
                } else {

                    this.commonService.showToastrMessage(this.constantService.MessageType.warn, 'Please select only those Projects whose payment is pending.', false);
                }
            } else {
                this.commonService.showToastrMessage(this.constantService.MessageType.warn, 'Please select same Vendor/Freelance name.', false);
            }
        }
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

    checkUniquePC() {
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            const selectedPC = this.selectedAllRowsItem[0].ProjectCode;
            // element.Status.includes('Approved')
            if (element.ProjectCode !== selectedPC) {
                this.pcFound = false;
                break;
            } else {
                this.pcFound = true;
            }
        }
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

    // PO
    getPOData(expenseData, amt) {
        const poLinkedAmt = parseFloat(expenseData.OOPLinked ? expenseData.OOPLinked : 0) + parseFloat(amt);
        const poTotalLinkedAmt = parseFloat(expenseData.TotalLinked ? expenseData.TotalLinked : 0) + parseFloat(amt);
        const poScheduledOOP = parseFloat(expenseData.ScheduledOOP ? expenseData.ScheduledOOP : 0) + parseFloat(amt);
        const poTotalScheduled = parseFloat(expenseData.TotalScheduled ? expenseData.TotalScheduled : 0) + parseFloat(amt);
        return {
            __metadata: { type: this.constantService.listNames.PO.type },
            OOPLinked: poLinkedAmt.toFixed(2),
            TotalLinked: poTotalLinkedAmt.toFixed(2),
            ScheduledOOP: poScheduledOOP.toFixed(2),
            TotalScheduled: poTotalScheduled.toFixed(2)
        };
    }

    // PF
    getPFData(ScheduleInvoiceForm, InvoiceType: string) {
        const oldScheduledOOP = this.pfListItem[0].ScheduledOOP ? this.pfListItem[0].ScheduledOOP : 0;
        const oldTotalScheduled = this.pfListItem[0].InvoicesScheduled ? this.pfListItem[0].InvoicesScheduled : 0;
        const totalBudget = this.pfListItem[0].Budget ? parseFloat(this.pfListItem[0].Budget) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : 0 + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        const oopBudget = this.pfListItem[0].OOPBudget ? parseFloat(this.pfListItem[0].OOPBudget) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : 0 + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        const pfScheduledOOP = parseFloat(oldScheduledOOP) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        const pfTotalScheduled = parseFloat(oldTotalScheduled) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);

        const totalInvoiced = this.pfListItem[0].Invoiced ? parseFloat(this.pfListItem[0].Invoiced) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : 0 + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        const oopInvoiced = this.pfListItem[0].InvoicedOOP ? parseFloat(this.pfListItem[0].InvoicedOOP) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount) : 0 + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);

        if (InvoiceType === 'new') {
            return {
                __metadata: { type: this.constantService.listNames.ProjectFinances.type },
                ScheduledOOP: pfScheduledOOP,
                InvoicesScheduled: pfTotalScheduled,
                Budget: totalBudget,
                OOPBudget: oopBudget
            };
        }
        else {
            return {
                __metadata: { type: this.constantService.listNames.ProjectFinances.type },
                Invoiced: totalInvoiced,
                InvoicedOOP: oopInvoiced
            };
        }
    }

    // PFB
    getPFBData(ScheduleInvoiceForm, InvoiceType: string) {
        let pfbAmountOOP = parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        let pfbAmount = parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        let pfbScheduledOOP = parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        let pfbTotalScheduled = parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        let totalInvoiced = parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        let oopInvoiced = parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        if (this.pfbListItem.length > 0) {
            const oldScheduledOOP = this.pfbListItem[0].ScheduledOOP ? this.pfbListItem[0].ScheduledOOP : 0;
            const oldTotalScheduled = this.pfbListItem[0].TotalScheduled ? this.pfbListItem[0].TotalScheduled : 0;
            const oldAmountOOP = this.pfbListItem[0].AmountOOP ? this.pfbListItem[0].AmountOOP : 0;
            const oldTotalAmount = this.pfbListItem[0].Amount ? this.pfbListItem[0].Amount : 0;
            const oldtotalInvoiced = this.pfbListItem[0].TotalInvoiced ? this.pfbListItem[0].TotalInvoiced : 0;
            const oldoopInvoiced = this.pfbListItem[0].InvoicedOOP ? this.pfbListItem[0].InvoicedOOP : 0;
            pfbScheduledOOP = parseFloat(oldScheduledOOP) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
            pfbTotalScheduled = parseFloat(oldTotalScheduled) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
            pfbAmountOOP = parseFloat(oldAmountOOP) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
            pfbAmount = parseFloat(oldTotalAmount) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
            totalInvoiced = parseFloat(oldtotalInvoiced) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
            oopInvoiced = parseFloat(oldoopInvoiced) + parseFloat(ScheduleInvoiceForm.getRawValue().Amount);
        }

        let Data;
        if (InvoiceType === 'new') {
            Data = {
                ScheduledOOP: pfbScheduledOOP,
                TotalScheduled: pfbTotalScheduled,
            }
        } else {
            Data = {
                TotalInvoiced: totalInvoiced,
                InvoicedOOP: oopInvoiced
            }
        }
        Data['__metadata'] = { type: this.constantService.listNames.ProjectFinanceBreakup.type };
        Data['Amount'] = pfbAmount;
        Data['AmountOOP'] = pfbAmountOOP;
        if (!this.pfbListItem.length) {
            Data['POLookup'] = ScheduleInvoiceForm.getRawValue().PONumber.Id;
            Data['ProjectNumber'] = ScheduleInvoiceForm.getRawValue().ProjectCode;
            Data['Status'] = this.constantService.projectFinanceBreakupList.status.Active;
        }
        return Data;
    }

    // PBB
    getPBBData(ScheduleInvoiceForm) {

        return {
            __metadata: { type: this.constantService.listNames.ProjectBudgetBreakup.type },
            ProjectLookup: this.projectInfoLineItem.Id,
            Status: this.constantService.STATUS.APPROVED,
            ApprovalDate: new Date().toISOString(),
            OriginalBudget: parseFloat(ScheduleInvoiceForm.getRawValue().Amount),
            OOPBudget: parseFloat(ScheduleInvoiceForm.getRawValue().Amount),
            ProjectCode: ScheduleInvoiceForm.getRawValue().ProjectCode,
        };


    }

    selectedPaymentMode(val: any) {
        console.log('Payment Mode ', val);
    }

    MarkAsPayment(markAsPayment_form, type: string, fileUploadedUrl) {

        const batchURL = [];
        for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
            const element = this.selectedAllRowsItem[j];
            const speInfoObj = {
                __metadata: { type: this.constantService.listNames.SpendingInfo.type },
                Number: markAsPayment_form.value.Number,
                DateSpend: markAsPayment_form.value.DateSpend,
                PaymentMode: markAsPayment_form.value.PaymentMode.value,
                ApproverFileUrl: fileUploadedUrl,
                Status: element.Status.replace(' Payment Pending', '')
            };
            const url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, element.Id);
            this.commonService.setBatchObject(batchURL, url, speInfoObj, this.constantService.Method.PATCH, this.constantService.listNames.SpendingInfo.name)
        }
        this.submitForm(batchURL, type);
    }

    // batchContents: any = [];
    async submitForm(dataEndpointArray, type: string) {
        console.log('Form is submitting');

        this.commonService.SetNewrelic('Finance-Dashboard', 'approve-billable', 'formSubmitForSelectedRow');
        const res = await this.spServices.executeBatch(dataEndpointArray);

        const arrResults = res;
        console.log('--oo ', arrResults);
        if (type === 'scheduledOOP') {
            this.updateStsToBilled(arrResults);
        } else if (type === 'updateScheduledOopLineItem') {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'OOP Invoice is Scheduled.', false);
            this.reFetchData();
        } else if (type === 'markAsPayment_form') {

            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Payment marked.', true);
            this.reFetchData();
        }
    }
    updateStsToBilled(arrRet: any) {
        const batchURL = [];
        for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
            const element = this.selectedAllRowsItem[j];
            const spObj = {
                __metadata: { type: this.constantService.listNames.SpendingInfo.type },
                Status: element.Status.replace('Approved', 'Billed'),
                InvoiceID: arrRet[0].retItems.ID.toString()
            };

            const url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, element.Id);
            this.commonService.setBatchObject(batchURL, url, spObj, this.constantService.Method.PATCH, this.constantService.listNames.SpendingInfo.name)
        }
        console.log('this.updateSpeLineItems ', this.updateSpeLineItems);
        this.submitForm(batchURL, 'updateScheduledOopLineItem');
    }

    async reFetchData() {
        await this.fdDataShareServie.getClePO('approved');
        this.getRequiredData();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
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
        if (this.approvedBillableRes.length && this.isOptionFilter) {
            const obj = {
                tableData: this.approvedBTable,
                colFields: this.appBillableColArray
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


    onSubmit(scheduleOopInvoice_form, InvoiceType: string, type: string) {
        const batchURL = [];

        let url = this.spServices.getReadURL(this.constantService.listNames.InvoiceLineItems.name, null);
        this.commonService.setBatchObject(batchURL, url, this.getInvLineItemData(scheduleOopInvoice_form, InvoiceType), this.constantService.Method.POST, this.constantService.listNames.InvoiceLineItems.name)


        if (InvoiceType === 'new') {
            url = this.spServices.getItemURL(this.constantService.listNames.PO.name, this.poItem.ID);
            this.commonService.setBatchObject(batchURL, url, this.getPOData(this.poItem, scheduleOopInvoice_form.getRawValue().Amount), this.constantService.Method.PATCH, this.constantService.listNames.PO.name)
        }
        else {
            const TaggedAmount = parseFloat(this.invoice.TaggedAmount) + parseFloat(scheduleOopInvoice_form.getRawValue().Amount)
            const invoiceData = {
                __metadata: { type: this.constantService.listNames.Invoices.type },
                TaggedAmount: TaggedAmount,
                IsTaggedFully: this.invoice.Amount === TaggedAmount ? 'Yes' : 'No'
            }
            url = this.spServices.getItemURL(this.constantService.listNames.Invoices.name, scheduleOopInvoice_form.getRawValue().InvoiceId);
            this.commonService.setBatchObject(batchURL, url, invoiceData, this.constantService.Method.PATCH, this.constantService.listNames.Invoices.name)
        }

        // PFBB
        url = this.spServices.getReadURL(this.constantService.listNames.ProjectBudgetBreakup.name, null);
        this.commonService.setBatchObject(batchURL, url, this.getPBBData(scheduleOopInvoice_form), this.constantService.Method.POST, this.constantService.listNames.ProjectBudgetBreakup.name)

        //ProjectFinances update
        url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinances.name, this.pfListItem[0].Id);
        this.commonService.setBatchObject(batchURL, url, this.getPFData(scheduleOopInvoice_form, InvoiceType), this.constantService.Method.PATCH, this.constantService.listNames.ProjectFinances.name)


        // ProjectFinanceBreakup add/update

        url = this.pfbListItem.length > 0 ? this.spServices.getItemURL(this.constantService.listNames.ProjectFinanceBreakup.name, this.pfbListItem[0].Id) : this.spServices.getReadURL(this.constantService.listNames.ProjectFinanceBreakup.name, null);
        const Type = this.pfbListItem.length > 0 ? this.constantService.Method.PATCH : this.constantService.Method.POST;
        this.commonService.setBatchObject(batchURL, url, this.getPFBData(scheduleOopInvoice_form, InvoiceType), Type, this.constantService.listNames.ProjectFinances.name)


        // sowUpdate

        url = this.spServices.getItemURL(this.constantService.listNames.SOW.name, this.SOW.ID);
        this.commonService.setBatchObject(batchURL, url, this.getsowData(scheduleOopInvoice_form, InvoiceType), this.constantService.Method.PATCH, this.constantService.listNames.SOW.name)

        console.log(batchURL)
        this.submitForm(batchURL, type);

    }



    getsowData(scheduleOopInvoice_form, InvoiceType: string) {

        const Amount = parseFloat(scheduleOopInvoice_form.getRawValue().Amount);
        const Data = {
            __metadata: { type: this.constantService.listNames.SOW.type },
            TotalLinked: this.SOW.TotalLinked ? parseFloat(this.SOW.TotalLinked) + Amount : Amount,
            OOPLinked: this.SOW.OOPLinked ? parseFloat(this.SOW.OOPLinked) + Amount : Amount,
        }

        if (InvoiceType === 'new') {
            Data['TotalScheduled'] = this.SOW.TotalScheduled ? parseFloat(this.SOW.TotalScheduled) + Amount : Amount;
            Data['ScheduledOOP'] = this.SOW.ScheduledOOP ? parseFloat(this.SOW.ScheduledOOP) + Amount : Amount;
        }
        else {
            Data['TotalInvoiced'] = this.SOW.TotalInvoiced ? parseFloat(this.SOW.TotalInvoiced) + Amount : Amount;
            Data['InvoicedOOP'] = this.SOW.InvoicedOOP ? parseFloat(this.SOW.InvoicedOOP) + Amount : Amount;
        }
        return Data;
    }


    getInvLineItemData(scheduleOopInvoice_form, InvoiceType: string) {

        const Data = {
            __metadata: { type: this.constantService.listNames.InvoiceLineItems.type },
            Title: scheduleOopInvoice_form.getRawValue().ProjectCode,
            PO: scheduleOopInvoice_form.getRawValue().PONumber.Id,
            ScheduleType: scheduleOopInvoice_form.getRawValue().ScheduledType,
            ScheduledDate: InvoiceType === 'new' ? scheduleOopInvoice_form.getRawValue().ScheduledDate : this.invoice.InvoiceDate,
            Amount: scheduleOopInvoice_form.getRawValue().Amount,
            AddressType: InvoiceType === 'new' ? scheduleOopInvoice_form.getRawValue().AddressType.value : this.invoice.AddressType,
            Currency: scheduleOopInvoice_form.getRawValue().Currency,
            MainPOC: InvoiceType === 'new' ? scheduleOopInvoice_form.getRawValue().POCName.Id : this.invoice.MainPOC,
            SOWCode: this.projectInfoLineItem.SOWCode,
            CSId: { results: this.pcmLevels.map(x => x.ID) },
            Template: this.pfListItem[0].Template,
            Status: InvoiceType === 'new' ? this.constantService.STATUS.SCHEDUELD : this.constantService.STATUS.APPROVED
        };
        if (InvoiceType !== 'new') {
            Data['ProformaLookup'] = this.invoice.ProformaLookup;
            Data['InvoiceLookup'] = scheduleOopInvoice_form.getRawValue().InvoiceId;
        }
        return Data;

    }
}
