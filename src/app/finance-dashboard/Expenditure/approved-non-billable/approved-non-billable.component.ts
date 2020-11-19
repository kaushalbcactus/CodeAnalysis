import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
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
import { DialogService } from 'primeng/dynamicdialog';
import { MarkAsPaymentDialogComponent } from '../mark-as-payment-dialog/mark-as-payment-dialog.component';
import { ApproveRejectExpenseDialogComponent } from '../approve-reject-expense-dialog/approve-reject-expense-dialog.component';

@Component({
    selector: 'app-approved-non-billable',
    templateUrl: './approved-non-billable.component.html',
    styleUrls: ['./approved-non-billable.component.css']
})
export class ApprovedNonBillableComponent implements OnInit, OnDestroy {
  
    FolderName: string;
    SelectedFile = [];
    expenseForm: any;
    mailContentRes: any;
    selectedProjectInfo: any;
    cleForselectedPI: any;
    cmLevelIdList: any = [];
    selectedPI: any = [];
    cleData: any = [];
    currentUserInfoData: any;
    groupITInfo: any;
    groupInfo: any;
    resCatEmails: any = [];

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
    approvedNonBillableRes: any = [];
    approvedNonBillableCols: any[];

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

    cancelRejectDialog: any = {
        title: '',
        text: ''
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
    listOfPOCs: any = [];
    vfUnique: boolean = false;
    isOptionFilter: boolean;

    async ngOnInit() {
        this.fdConstantsService.fdComponent.hideDatesSection = false;

        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
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
        // Get VendorFreelancer List
        this.freelancerVendersRes = await this.fdDataShareServie.getVendorFreelanceData();
        await this.projectInfo();
        // Resource Categorization
        this.resourceCInfo();
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

    cleInfo() {
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('Client Legal Entity ', this.cleData);
            }
        }));
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
                Category: element.CategoryST,
                Number: element.Number,
                ExpenseType: element.SpendType,
                ClientAmount: parseFloat(element.ClientAmount).toFixed(2),
                ClientCurrency: element.ClientCurrency,
                DateCreated: this.datePipe.transform(element.Created, 'MMM dd, yyyy, hh:mm a'),
                Notes: element.NotesMT,
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
                this.commonService.showToastrMessage(this.constantService.MessageType.info,'Please select line item with status containing "Payment Pending" & try again.',false);
            }
        }
    }

    onRowUnselect(event: any) {
        console.log(this.selectedAllRowsItem);
    }
    openTableAtt(data: any, popUpData: any) {
        this.items = [];
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if(data.Status == 'Approved' || data.Status == 'Approved Payment Pending') {
            this.items = [
                { label: 'Reject Expense', command: (e) => this.openMenuContent(e, data) }
            ];
        }
        this.items.push({ label: 'Details', command: (e: any) => this.openMenuContent(e, data) });
    }
    openMenuContent(event: any, data: any) {
        console.log(JSON.stringify(data));
        this.rowItemDetails = data;
        if(event.item.label == 'Details'){
            this.rightSideBar = !this.rightSideBar;
        } else if(event.item.label == "Reject Expense") {
            this.cancelRejectDialog.title = event.item.label;
            this.cancelRejectDialog.text = event.item.label.replace(' Expense', '');
            this.approveRejectExpenseDialog();
        }
    }

    approveRejectExpenseDialog() {
        const ref = this.dialogService.open(ApproveRejectExpenseDialogComponent, {
            data: {
              expenseDialog: this.cancelRejectDialog,
              selectedRowItem:  this.rowItemDetails
            },
            header: this.cancelRejectDialog.title,
            contentStyle: { height: '450px !important' },
            width: '50%',
            closable: false,
          });
          ref.onClose.subscribe(async expense => {
              if(expense) {
                this.expenseForm = expense.form;
                this.mailContentRes = expense.mailContent;
                await this.onSubmit(expense.type, expense.form);
              }
          })
    }

    onSubmit(type: string,expenseForm) {
        this.formSubmit.isSubmit = true;
        const batchUrl = [];
        if (type === 'Reject Expense') {

            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            // console.log('form is submitting ..... expenseForm ', expenseForm.value);
            const speInfoObj = {
                ApproverComments: expenseForm.value.ApproverComments,
                Status: 'Rejected'
            };
            speInfoObj['__metadata'] = { type: this.constantService.listNames.SpendingInfo.type };
            // let data = [];
            const rejectExpenseObj = Object.assign({}, this.queryConfig);
            rejectExpenseObj.url = this.spServices.getItemURL(this.constantService.listNames.SpendingInfo.name, +this.rowItemDetails.Id);
            rejectExpenseObj.listName = this.constantService.listNames.SpendingInfo.name;
            rejectExpenseObj.type = 'PATCH';
            rejectExpenseObj.data = speInfoObj;
            batchUrl.push(rejectExpenseObj);
            this.submitForm(batchUrl, type);
        }
    }

    openPopup(modal: string) {
        console.log('selectedAllRowsItem ', this.selectedAllRowsItem);
        this.checkUniqueVF();
        if (!this.selectedAllRowsItem.length) {

            this.commonService.showToastrMessage(this.constantService.MessageType.info,'Please select at least 1 Projects & try again',false);
            return;
        }
        if (this.vfUnique) {
            if (modal === 'markAsPaymentModal') {
                // if (this.selectedRowItemData[0].Status.includes("Payment Pending")) {
                const sts = this.checkPPStatus();
                console.log('Sts ', sts);
                if (!this.approvedSts) {

                    this.commonService.showToastrMessage(this.constantService.MessageType.warn,'Please select line item with status containing "Payment Pending".',false);
                    return false;
                }
                if (sts) {
                    const ref = this.dialogService.open(MarkAsPaymentDialogComponent, {
                        header: 'Mark As Payment',
                        width: '70vw',
                        contentStyle: { 'overflow-y': 'visible' },
                        closable: false,
                    });
                    ref.onClose.subscribe((paymentDetails: any) => {
                        if (paymentDetails) {
                            this.MarkAsPayment( paymentDetails.paymentForm,'markAsPayment_form',paymentDetails.fileUrl);
                        }
                    });
                } else {

                    this.commonService.showToastrMessage(this.constantService.MessageType.info,'Please select line item with status containing "Payment Pending".',false);
                }
            }
        } else {
            this.commonService.showToastrMessage(this.constantService.MessageType.warn,'Please select same Vendor/Freelance name.',false);
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

    async MarkAsPayment(markAsPayment_form,type: string, fileUrl){
        if (fileUrl) {
            this.isPSInnerLoaderHidden = false;
            const batchUrl = [];
            const speInfoData = {
                __metadata: { type: this.constantService.listNames.SpendingInfo.type },
                Number: markAsPayment_form.value.Number,
                DateSpend: markAsPayment_form.value.DateSpend,
                PaymentMode: markAsPayment_form.value.PaymentMode.value,
                ApproverFileUrl: fileUrl,
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


    async submitForm(batchUrl: any[], type: string) {
        this.commonService.SetNewrelic('Finance-Dashboard', 'approve-nonbillable', 'submitForm');
        await this.spServices.executeBatch(batchUrl);
        if (type === 'markAsPayment_form') {

            this.commonService.showToastrMessage(this.constantService.MessageType.success,'Payment marked.',false);
            this.reFetchData();
        } else if (type === 'Reject Expense') {

            this.commonService.showToastrMessage(this.constantService.MessageType.success,'Submitted.',false);
            // this.displayModal = false;
            this.sendMailToSelectedLineItems(type);
        }
        this.submitBtn.isClicked = false;
    }

    sendMailToSelectedLineItems(type: string) {
        const element = this.rowItemDetails;
        this.getPIorClient(element);
        this.sendApproveCanRejExpMail(element, type);
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
            if (x.UserNamePG.ID === ele.ID) {
                return x;
            }
        });
        return found ? found : '';
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

    getAuthor(id) {
        const found = this.rcData.find((x) => {
            if (x.UserNamePG.ID === id) {
                return x;
            }
        });
        return found ? found : '';
    }

    replaceContent(mailContent, key, value) {
        return mailContent.replace(new RegExp(key, 'g'), value);
    }

    sendApproveCanRejExpMail(expense, type: string) {
        // let isCleData = this.getCleByPC(expense.projectCode);
        const isCleData = this.cleForselectedPI;
        const author = this.getAuthor(expense.AuthorId);
        const val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.ProjectCode + ' (' + isCleData.ClientLegalEntity + ')' : expense.ProjectCode;

        // var mailTemplate =  data.Status === "Approved" ? "ApproveExpense" :  data.Status === "Cancelled" ? "CancelExpense" : "RejectExpense";
        const mailSubject = expense.ProjectCode + ' : Expense Rejected';

        let mailContent = this.mailContentRes[0].retItems[0].ContentMT;
        mailContent = this.replaceContent(mailContent, '@@Val1@@', val1);
        mailContent = this.replaceContent(mailContent, '@@Val2@@', expense.Category);
        mailContent = this.replaceContent(mailContent, '@@Val4@@', expense.ExpenseType);
        mailContent = this.replaceContent(mailContent, '@@Val5@@', expense.Currency + ' ' + parseFloat(expense.Amount).toFixed(2));
        mailContent = this.replaceContent(mailContent, '@@Val6@@', expense.ClientAmount ? expense.ClientCurrency + ' ' + parseFloat(expense.ClientAmount).toFixed(2) : '--');
        mailContent = this.replaceContent(mailContent, '@@Val7@@', expense.Notes);
        mailContent = this.replaceContent(mailContent, '@@Val10@@', this.expenseForm.value.ApproverComments ? this.expenseForm.value.ApproverComments : this.expenseForm.value.ApproverComments);

        mailContent = this.replaceContent(mailContent, '@@Val0@@', expense.Id);
        mailContent = this.replaceContent(mailContent, '@@Val13@@', author.hasOwnProperty('UserNamePG') ? author.UserNamePG.Title : 'Member');
        mailContent = this.replaceContent(mailContent, '@@Val14@@', this.currentUserInfoData.Title);

        const ccUser = this.getCCList(type, expense);
        // ccUser.push(this.currentUserInfoData.Email);
        const tos = this.getTosList(type, expense);
        this.commonService.SetNewrelic('Finance-Dashboard', 'pending-expense', 'sendMail');
        this.spServices.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.isPSInnerLoaderHidden = false;
        this.reFetchData();
    }

    getCCList(type: string, expense) {
        let arrayCC = [];
        const itApprovers = this.groupITInfo.results;
        const approvers = this.groupInfo.results;
        if (type === 'Reject Expense') {
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
                arrayCC = arrayCC.concat(this.fdDataShareServie.getITMember(itApprovers));
            }
        }

        arrayCC = arrayCC.filter(this.onlyUnique);
        console.log('arrayCC ', arrayCC);
        return arrayCC;
    }

    getTosList(type: string, expense) {
        let arrayTo = [];
        const approvers = this.groupInfo.results;
        if (type === 'Reject Expense' || type === 'Approve Expense') {
            // Creator
            arrayTo.push(expense.AuthorEMail);

            // CS Team Member
            if (this.resCatEmails.length) {
                arrayTo = arrayTo.concat(this.fdDataShareServie.getCSMember(this.resCatEmails));
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

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
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
