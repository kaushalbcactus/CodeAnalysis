import { Component, OnInit, Input, OnDestroy, HostListener, ApplicationRef, NgZone, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { Subscription } from 'rxjs';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';

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
    @ViewChild('rc', { static: false }) canRejExpenseTable: Table;

    constructor( 
        private fb: FormBuilder,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
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
            { field: 'ProjectCode', header: 'Project', visibility: true, Type: 'string', dbName: 'ProjectCode', options: [] },
            { field: 'ClientLegalEntity', header: 'Client', visibility: true, Type: 'string', dbName: 'ClientLegalEntity', options: [] },
            { field: 'Category', header: 'Category', visibility: true, Type: 'string', dbName: 'Category', options: [] },
            // { field: 'PONumber', header: 'PO Number', visibility:true },
            { field: 'ExpenseType', header: 'Expense Type', visibility: true, Type: 'string', dbName: 'ExpenseType', options: [] },
            { field: 'ClientAmount', header: 'Client Amount', visibility: true, Type: 'number', dbName: 'ClientAmount', options: [] },
            { field: 'ClientCurrency', header: 'Client Currency', visibility: true, Type: 'number', dbName: 'ClientCurrency', options: [] },
            { field: 'ApproverComments', header: 'Approver Comments', visibility: true, Type: 'string', dbName: 'ApproverComments', options: [] },
            { field: 'ActionBy', header: 'Actioned By', visibility: true, Type: 'string', dbName: 'ActionBy', options: [] },
            { field: 'ModifiedDate', header: 'Actioned Date', visibility: true, exportable: false, Type: 'date', dbName: 'ModifiedDate', options: [] },
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
            // { field: '', header: '', visibility: true },
        ];
    }

    // On load get Required Data
    async getRequiredData() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        
        let speInfoObj;
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('ExpenseApprovers') > -1) {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForRC);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate)
                                                 .replace('{{EndDate}}', this.DateRange.endDate);
        } else {
            speInfoObj = Object.assign({}, this.fdConstantsService.fdComponent.spendingInfoForRCCS);
            speInfoObj.filter = speInfoObj.filter.replace('{{StartDate}}', this.DateRange.startDate)
                                                 .replace('{{EndDate}}', this.DateRange.endDate)
                                                 .replace('{{UserID}}', this.globalService.currentUser.userId.toString());
        }
        this.commonService.SetNewrelic('Finance-Dashboard', 'reject-expense', 'getSpendingInfo', 'GET');
        const res = await this.spServices.readItems(this.constantService.listNames.SpendingInfo.name, speInfoObj);
        const arrResults = res.length ? res : [];
        this.formatData(arrResults);
        this.isPSInnerLoaderHidden = true;
    }

    async formatData(data: any[]) {
        this.rejectExpenses = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // let rcCreatedItem = this.getCreatedModifiedByFromRC(element.AuthorId);
            // let rcModifiedItem = this.getCreatedModifiedByFromRC(element.EditorId);
            let sowCodeFromPI = await this.fdDataShareServie.getSowCodeFromPI(this.projectInfoData, element);
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(sowCodeFromPI.SOWCode);
            this.rejectExpenses.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: sowCodeFromPI.SOWCode,
                SOWName: sowItem.Title,
                ClientLegalEntity: sowCodeFromPI.ClientLegalEntity,
                Category: element.CategoryST,
                // PONumber: element.PONumber,
                ExpenseType: element.SpendType,
                ClientAmount: element.Amount,
                ClientCurrency: element.ClientCurrency,
                Created: this.datePipe.transform(element.Created, 'MMM dd, yyy, hh:mm a'),
                CreatedBy: element.Author ? element.Author.Title : '',
                ModifiedBy: element.Editor ? element.Editor.Title : '',
                Notes: element.NotesMT,
                ModifiedDateFormat: this.datePipe.transform(element.Modified, 'MMM dd, yyy, hh:mm a'),
                RequestType: element.RequestType,
                ApproverComments: element.ApproverComments,
                Status: element.Status,
                ActionBy: element.Editor ? element.Editor.Title : '',
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
        //this.createColFieldValues(this.rejectExpenses);
        this.rejectCancelExpenseCols = this.commonService.MainfilterForTable(this.rejectCancelExpenseCols, this.rejectExpenses);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }


    getCreatedModifiedByFromRC(id) {
        let found = this.rcData.find((x) => {
            if (x.UserNamePG.ID == id) {
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
        ModifiedDate: [],
        ActionBy: [],
        CreatedBy: []
    }

    // createColFieldValues(resArray) {

    //     this.pendinExpenseColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    //     this.pendinExpenseColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
    //     this.pendinExpenseColArray.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; })));
    //     this.pendinExpenseColArray.Category = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Category, value: a.Category }; return b; }).filter(ele => ele.label)));
    //     this.pendinExpenseColArray.ExpenseType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ExpenseType, value: a.ExpenseType }; return b; }).filter(ele => ele.label)));
    //     const ClientAmount = this.uniqueArrayObj(resArray.map(a => { let b = { label: parseFloat(a.ClientAmount), value: a.ClientAmount }; return b; }).filter(ele => ele.label));
    //     this.pendinExpenseColArray.ClientAmount = this.fdDataShareServie.customSort(ClientAmount, 1, 'label');
    //     this.pendinExpenseColArray.ClientCurrency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientCurrency, value: a.ClientCurrency }; return b; }).filter(ele => ele.label)));
    //     this.pendinExpenseColArray.Created = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Created, value: a.Created }; return b; }).filter(ele => ele.label));

    //     const modified = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ModifiedDate, 'MMM d, y'), value: a.ModifiedDate }; return b; }).filter(ele => ele.label)));
    //     this.pendinExpenseColArray.ModifiedDate = modified.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);


    //     this.pendinExpenseColArray.ActionBy = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ActionBy, value: a.ActionBy }; return b; }).filter(ele => ele.label)));
    //     //this.pendinExpenseColArray.Modified = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Modified, value: a.Modified }; return b; }).filter(ele => ele.label));
    //     this.pendinExpenseColArray.CreatedBy = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.CreatedBy, value: a.CreatedBy }; return b; }).filter(ele => ele.label));
    // }

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

    // @HostListener('document:click', ['$event'])
    // clickout(event) {
    //     if (event.target.className === "pi pi-ellipsis-v") {
    //         if (this.tempClick) {
    //             this.tempClick.style.display = "none";
    //             if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
    //                 this.tempClick = event.target.parentElement.children[0].children[0];
    //                 this.tempClick.style.display = "";
    //             } else {
    //                 this.tempClick = undefined;
    //             }
    //         } else {
    //             this.tempClick = event.target.parentElement.children[0].children[0];
    //             this.tempClick.style.display = "";
    //         }

    //     } else {
    //         if (this.tempClick) {
    //             this.tempClick.style.display = "none";
    //             this.tempClick = undefined;
    //         }
    //     }
    // }

    // isOptionFilter: boolean;
    // optionFilter(event: any) {
    //     if (event.target.value) {
    //         this.isOptionFilter = false;
    //     }
    // }

    // ngAfterViewChecked() {
    //     if (this.rejectExpenses.length && this.isOptionFilter) {
    //         let obj = {
    //             tableData: this.canRejExpenseTable,
    //             colFields: this.pendinExpenseColArray,
    //         }
    //         if (obj.tableData.filteredValue) {
    //             this.commonService.updateOptionValues(obj);
    //         } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
    //             this.createColFieldValues(obj.tableData.value);
    //             this.isOptionFilter = false;
    //         }
    //     }
    //     this.cdr.detectChanges();
    // }

}
