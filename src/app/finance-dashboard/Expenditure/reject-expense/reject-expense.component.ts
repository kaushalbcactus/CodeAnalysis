import { Component, OnInit, Input, OnDestroy, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { NodeService } from 'src/app/node.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-reject-expense',
    templateUrl: './reject-expense.component.html',
    styleUrls: ['./reject-expense.component.css']
})
export class RejectExpenseComponent implements OnInit, OnDestroy {
    tempClick: any;
    // Testing
    @Input() datas: string;

    isPSInnerLoaderHidden: boolean = true;

    rejectExpenses: any = [];
    rejectCancelExpenseCols: any[];

    // Date Range
    rangeDates: Date[];

    DateRange: any = {
        startDate: '',
        endDate: '',
    };

    sowRes: any = [];

    // List of Subscribers 
    private subscription: Subscription = new Subscription();

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private globalService: GlobalService,
        private fdConstantsService: FdConstantsService,
        private commonService: CommonService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private nodeService: NodeService) {
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

        this.createRCECols();
        await this.projectInfo();
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

    createRCECols() {
        this.rejectCancelExpenseCols = [
            { field: 'ProjectCode', header: 'Project', visibility: true },
            { field: 'ClientLegalEntity', header: 'Client', visibility: true },
            { field: 'Category', header: 'Category', visibility: true },
            // { field: 'PONumber', header: 'PO Number', visibility:true },
            { field: 'ExpenseType', header: 'Expense Type', visibility: true },
            { field: 'ClientAmount', header: 'Client Amount', visibility: true },
            { field: 'ClientCurrency', header: 'Client Currency', visibility: true },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: true },
            { field: 'ActionBy', header: 'Actioned By', visibility: true },
            { field: 'Modified', header: 'Actioned Date', visibility: true, exportable: false },
            { field: 'ModifiedDateFormat', header: 'Actioned Date', visibility: false },
            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'Created', header: 'Date Created', visibility: false },
            { field: 'CreatedBy', header: 'Created By', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'Number', header: 'Number', visibility: false },
            { field: 'Status', header: 'Status', visibility: false },
            { field: 'FileURL', header: 'File URL', visibility: false },
            { field: 'ClientApprovalFileURL', header: 'Client Approval File URL', visibility: false },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: false },
            { field: 'ApproverFileUrl', header: 'Approver File Url', visibility: false },
            { field: 'PayingEntity', header: 'Paying Entity', visibility: false },
            { field: 'VendorName', header: 'Vendor Freelancer', visibility: false },
            // { field: 'VendorFreelancer', header: 'Vendor Freelancer', visibility: false },
            // { field: 'AuthorId', header: 'Author Id', visibility: false },
            { field: 'RequestType', header: 'Request Type', visibility: false },
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
        // let obj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForRC);
        // obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        let speInfoObj
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('ExpenseApprovers') > -1) {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForRC);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        }
        else {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForRCCS);
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
        // });

    }

    async formatData(data: any[]) {
        this.rejectExpenses = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            let sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);
            this.rejectExpenses.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: sowCodeFromPI.SOWCode,
                SOWName: sowItem.Title,
                ClientLegalEntity: sowCodeFromPI.ClientLegalEntity,
                Category: element.Category,
                // PONumber: element.PONumber,
                ExpenseType: element.SpendType,
                ClientAmount: element.Amount,
                ClientCurrency: element.ClientCurrency,
                Created: this.datePipe.transform(element.Created, 'MMM dd, yyy, hh:mm a'),
                CreatedBy: rcCreatedItem ? rcCreatedItem.UserName.Title : '',
                ModifiedBy: rcModifiedItem ? rcModifiedItem.UserName.Title : '',
                Notes: element.Notes,
                ModifiedDateFormat: this.datePipe.transform(element.Modified, 'MMM dd, yyy, hh:mm a'),
                RequestType: element.RequestType,
                ApproverComments: element.ApproverComments,
                Status: element.Status,
                ActionBy: rcModifiedItem ? rcModifiedItem.UserName.Title : '',
                Modified: new Date(this.datePipe.transform(element.Modified, 'MMM dd, yyyy')),  // this.datePipe.transform(element.Modified, 'MMM dd, yyy, hh:mm a'),

                FileURL: element.FileURL,
                ClientApprovalFileURL: element.ClientApprovalFileURL,
                ApproverFileUrl: element.ApproverFileUrl,
                PayingEntity: element.PayingEntity,
                VendorFreelancer: element.VendorFreelancer,
                AuthorId: element.AuthorId,
                DollarAmount: element.DollarAmount,
                InvoiceID: element.InvoiceID,
                POLookup: element.POLookup,
                VendorName: this.getVendorNameById(element),
                // PONumber: this.getPONumber(element),
                // ProformaDate: this.datePipe.transform(element.ProformaDate, 'MMM dd, yyy, hh:mm a')


            })
        }
        this.rejectExpenses = [...this.rejectExpenses];
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

    getVendorNameById(ele) {
        let found = this.freelancerVendersRes.find((x) => {
            if (x.ID === ele.VendorFreelancer) {
                return x;
            }
        })
        return found ? found.Title : ''
    }

    pendinExpenseColArray = {
        ProjectCode: [],
        ClientLegalEntity: [],
        SOWCode: [],
        Category: [],
        ExpenseType: [],
        ClientAmount: [],
        ClientCurrency: [],
        Created: [],
        ModifiedBy: [],
        Modified: [],
        ActionBy: [],
        CreatedBy: []
    }

    createColFieldValues() {

        this.pendinExpenseColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.SOWCode = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; })));
        this.pendinExpenseColArray.Category = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
        const ClientAmount = this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
        this.pendinExpenseColArray.ClientAmount = this.fdDataShareServie.customSort(ClientAmount, 1, 'label');
        this.pendinExpenseColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.Created = this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.Created, value: a.Created }; return b; }).filter(ele => ele.label));

        const modified = this.commonService.sortDateArray(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: this.datePipe.transform(a.Modified, 'MMM d, y'), value: a.Modified }; return b; }).filter(ele => ele.label)));
        this.pendinExpenseColArray.Modified = modified.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);


        this.pendinExpenseColArray.ActionBy = this.commonService.sortData(this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.ActionBy, value: a.ActionBy }; return b; }).filter(ele => ele.label)));
        //this.pendinExpenseColArray.Modified = this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.Modified, value: a.Modified }; return b; }).filter(ele => ele.label));
        this.pendinExpenseColArray.CreatedBy = this.uniqueArrayObj(this.rejectExpenses.map(a => { let b = { label: a.CreatedBy, value: a.CreatedBy }; return b; }).filter(ele => ele.label));
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



    rightSideBar: boolean = false;
    freelancerVendersRes: any = [];
    items: any[];
    selectedRowItemData: any;
    openTableAtt(data, popUpData) {
        this.items = [];
        this.selectedRowItemData = data;
        console.log('this.selectedRowItemData ', this.selectedRowItemData);
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });
    }

    rowItemDetails: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.rowItemDetails = data;
        this.rightSideBar = !this.rightSideBar;
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
