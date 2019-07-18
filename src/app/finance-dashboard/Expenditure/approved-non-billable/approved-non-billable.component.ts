import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SharepointoperationService } from '../../../Services/sharepoint-operation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConstantsService } from '../../../Services/constants.service';
import { GlobalService } from '../../../Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from '../../../Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { NodeService } from '../../../node.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-approved-non-billable',
    templateUrl: './approved-non-billable.component.html',
    styleUrls: ['./approved-non-billable.component.css']
})
export class ApprovedNonBillableComponent implements OnInit, OnDestroy {

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
    }
    submitBtn: any = {
        isClicked: false
    }

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
        private nodeService: NodeService
    ) {
        this.subscription.add(this.fdDataShareServie.getDateRange().subscribe(date => {
            this.DateRange = date;
            console.log('this.DateRange ', this.DateRange);
            this.getRequiredData();
        }));
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

    initializeMarkAsPaymentForm_field() {
        this.markAsPayment_form = this.fb.group({
            Number: ['', Validators.required],
            DateSpend: ['', Validators.required],
            PaymentMode: ['', Validators.required],
            ApproverComments: ['', Validators.required],
            ApproverFileUrl: ['', Validators.required]
        })
    }

    createANBCols() {
        this.approvedNonBillableCols = [
            { field: 'Number', header: 'Ref. Number', visibility: true },
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'ExpenseType', header: 'Expense Type', visibility: true },
            { field: 'PaymentMode', header: 'Payment Mode', visibility: true },
            { field: 'ClientAmount', header: 'Client Amount', visibility: true },
            { field: 'ClientCurrency', header: 'Client Currency', visibility: true },
            { field: 'PayingEntity', header: 'Paying Entity', visibility: true },
            { field: 'Status', header: 'Status', visibility: true },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: true },
            { field: 'ModifiedDateFormat', header: 'Approval / Billable Date', visibility: false },
            { field: 'Modified', header: 'Approval / Billable Date', visibility: true },

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
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        // let speInfoObj = {
        //     filter: this.fdConstantsService.fdComponent.spendingInfoForNonBillable.filter.replace("{{Status}}", "Approved Payment Pending").replace("{{Category}}", "Non Billable"),
        //     select: this.fdConstantsService.fdComponent.spendingInfoForNonBillable.select,
        //     top: this.fdConstantsService.fdComponent.spendingInfoForNonBillable.top,
        //     // orderby: this.fdConstantsService.fdComponent.spendingInfoForBnNB.orderby.replace("{{Category}}", "Non Billable")
        // }

        let obj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForNonBillable);
        obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);

        const sinfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.SpendingInfo.name + '', obj);
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
        // });

    }

    async formatData(data: any[]) {
        this.approvedNonBillableRes = [];
        this.selectedAllRowsItem = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            let sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);

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
                Modified: new Date(this.datePipe.transform(element.Modified, 'MMM dd, yyyy')), // 
                ModifiedDateFormat: this.datePipe.transform(element.Modified, 'MMM dd, yyyy, hh:mm a'),
                CreatedBy: rcCreatedItem ? rcCreatedItem.UserName.Title : '',
                ModifiedBy: rcModifiedItem ? rcModifiedItem.UserName.Title : '',
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
            })
        }
        this.approvedNonBillableRes = [...this.approvedNonBillableRes];
        this.isPSInnerLoaderHidden = true;
        this.createColFieldValues();
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
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

    anonBillableColArray = {
        ProjectCode: [],
        SOWCode: [],
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
    }

    createColFieldValues() {

        this.anonBillableColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.anonBillableColArray.Category = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
        this.anonBillableColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
        const clientAmount = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
        this.anonBillableColArray.ClientAmount = this.fdDataShareServie.customSort(clientAmount, 1, 'label');
        this.anonBillableColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));

        this.anonBillableColArray.PaymentMode = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.PaymentMode, value: a.PaymentMode }; return b; }).filter(ele => ele.label)));
        this.anonBillableColArray.PayingEntity = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.PayingEntity, value: a.PayingEntity }; return b; }).filter(ele => ele.label)));
        this.anonBillableColArray.Status = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.Status, value: a.Status }; return b; }).filter(ele => ele.label)));

        this.anonBillableColArray.Number = this.commonService.sortData(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.Number, value: a.Number }; return b; }).filter(ele => ele.label)));
        
        this.anonBillableColArray.PaymentDate = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.DateSpend, value: a.DateSpend }; return b; }).filter(ele => ele.label));

        const modified = this.commonService.sortDateArray(this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: this.datePipe.transform(a.Modified, 'MMM dd, yyyy'), value: a.Modified }; return b; }).filter(ele => ele.label)));
        this.anonBillableColArray.Modified = modified.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);


        this.anonBillableColArray.Created = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.Created, value: a.Created }; return b; }).filter(ele => ele.label));

        // this.anonBillableColArray.SOWCode = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }).filter(ele => ele.label));
        // this.anonBillableColArray.DateCreated = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.DateCreated, value: a.DateCreated }; return b; }).filter(ele => ele.label));
        // this.anonBillableColArray.ModifiedDate = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
        // this.anonBillableColArray.ModifiedDate = this.uniqueArrayObj(this.approvedNonBillableRes.map(a => { let b = { label: a.ModifiedDate, value: a.ModifiedDate }; return b; }).filter(ele => ele.label));
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

    selectAllRows() {
        this.selectedAllRowsItem.length === 0 ? this.selectedRowItemData = [] : this.selectedRowItemData;
        if (this.selectedAllRowsItem.length === this.approvedNonBillableRes.length) {
            this.selectedRowItemData = this.selectedAllRowsItem;
        }
        console.log('in selectAllRows ', this.selectedAllRowsItem);
    }

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    selectedRowItemData: any = [];
    selectedRowItemPC: any;
    approvedSts: boolean = true;
    onRowSelect(event) {
        console.log(this.selectedAllRowsItem);
        this.approvedSts = true;
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            let sts = this.selectedAllRowsItem[0].Status;
            if (element.Status !== sts) {
                this.approvedSts = false;
                this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Please select line item with status containing "Payment Pending" & try again.', detail: '', life: 4000 });
            }

        }
    }

    onRowUnselect(event) {
        console.log(this.selectedAllRowsItem);
    }

    rightSideBar: boolean = false;
    items: any[];
    openTableAtt(data, popUpData) {
        this.items = [];
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });
    }

    rowItemDetails: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.rowItemDetails = data;
        this.rightSideBar = !this.rightSideBar;
    }

    // Modal
    markAsPaymentModal: boolean = false;
    listOfPOCs: any = [];
    openPopup(modal: string) {
        console.log('selectedAllRowsItem ', this.selectedAllRowsItem);
        this.checkUniquePC();
        if (!this.selectedAllRowsItem.length) {
            this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Please select at least 1 Projects & try again', detail: '', life: 4000 });
            return;
        }
        if (this.pcFound) {
            if (modal === 'markAsPaymentModal') {
                // if (this.selectedRowItemData[0].Status.includes("Payment Pending")) {
                let sts = this.checkPPStatus();
                console.log('Sts ', sts);
                if (!this.approvedSts) {
                    this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Please select line item with status containing "Payment Pending" & try again.', detail: '', life: 4000 });
                    return false;
                }
                if (sts) {
                    this.markAsPaymentModal = true;
                } else {
                    this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Payment already marked', detail: '', life: 4000 });
                }
            }
        } else {
            this.messageService.add({ key: 'approvedNonBToast', severity: 'info', summary: 'Please select same project & try again.', detail: '', life: 4000 });
        }
    }

    checkPPStatus() {
        let ppSts = true;
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            let sts = this.selectedAllRowsItem[0].Status;
            if (element.Status !== sts) {
                return 'Please select same Status & try again.';
            }
            if (!element.Status.includes('Payment Pending')) {
                ppSts = false;
                break;
            } else {
                ppSts = true;
            }
        }
        return ppSts;

    }

    pcFound: boolean = false;
    checkUniquePC() {
        for (let i = 0; i < this.selectedAllRowsItem.length; i++) {
            const element = this.selectedAllRowsItem[i];
            let pc = this.selectedAllRowsItem[0].ProjectCode;
            if (element.ProjectCode !== pc) {
                this.pcFound = false;
                break;
            } else {
                this.pcFound = true;
            }
        }
    }

    get isValidMarkAsPaymentForm() {
        return this.markAsPayment_form.controls;
    }

    cancelFormSub(type) {
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
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            console.log('form is submitting ..... for selected row Item i.e ', this.markAsPayment_form.value);
            this.uploadFileData(type);
        }
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
                        // PayingEntity: this.markAsPayment_form.value.PayingEntity.Title,
                        Number: this.markAsPayment_form.value.Number,
                        DateSpend: this.markAsPayment_form.value.DateSpend,
                        PaymentMode: this.markAsPayment_form.value.PaymentMode.value,
                        ApproverComments: this.markAsPayment_form.value.ApproverComments,
                        ApproverFileUrl: this.fileUploadedUrl,
                        Status: 'Approved'
                    }
                    speInfoObj["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
                    let data = [];
                    for (let j = 0; j < this.selectedAllRowsItem.length; j++) {
                        const element = this.selectedAllRowsItem[j];
                        const spEndpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.update.replace("{{Id}}", element.Id);;
                        data.push({
                            objData: speInfoObj,
                            endpoint: spEndpoint,
                            requestPost: false
                        })
                    }
                    this.submitForm(data, type);
                }
            } else {
                this.isPSInnerLoaderHidden = true;
                this.submitBtn.isClicked = false;
            }
        });
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
        const res = await this.spServices.getFDData(batchGuid, sBatchData); //.subscribe(res => {
        const arrResults = res;
        console.log('--oo ', arrResults);
        if (type === 'markAsPayment_form') {
            this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Payment marked.', detail: '', life: 2000 });
            this.markAsPaymentModal = false;
            this.reFetchData();
        }
        this.isPSInnerLoaderHidden = true;
        this.submitBtn.isClicked = false;

        // });
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

}
