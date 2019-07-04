import { Component, OnInit, ViewChild } from '@angular/core';
import { Message, ConfirmationService, MessageService } from 'primeng/api';
import { Calendar } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { formatDate, DatePipe } from '@angular/common';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from './../../../timeline/timeline-history/timeline-history.component';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';

@Component({
    selector: 'app-hourly-based',
    templateUrl: './hourly-based.component.html',
    styleUrls: ['./hourly-based.component.css']
})
export class HourlyBasedComponent implements OnInit {

    hourlyBasedRes: any = [];

    hourlyBasedCols: any[];
    msgs: Message[] = [];

    // Edit hourly Form
    editHourly_form: FormGroup;
    confirmHourlybased_form: FormGroup;

    // loader
    isPSInnerLoaderHidden: boolean = false;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;

    // Right side bar
    rightSideBar: boolean = false;


    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    };
    projectInfoData: any = [];

    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;


    minScheduleDate: Date = new Date();
    @ViewChild('timelineRef', {static:true}) timeline: TimelineHistoryComponent;
    constructor(
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SharepointoperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private messageService: MessageService,
        private commonService: CommonService,
        private spOperationsService: SpOperationsService,
    ) { }

    async ngOnInit() {
        // Get Projects & PC
        this.projectInfo();
        this.poInfo();
        this.projectContacts();
        // GEt Client Legal Entity
        this.cleInfo();
        this.resourceCInfo();

        this.createHBCCols();
        // this.getHourlyBasedData();
        this.createHourlyFormField();
        this.createHourlyConfirmFormField();

        // For Mail
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        console.log('this.currentUserInfoData  ', this.currentUserInfoData);
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        console.log('this.groupInfo  ', this.groupInfo);
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
        console.log('this.groupITInfo  ', this.groupITInfo);

    }

    // Project Info
    projectInfo() {
        this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('this.projectInfoData ', this.projectInfoData);
                this.getPCForSentToAMForApproval();
            }
        })
    }
    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }
    // Purchase Order Number
    purchaseOrdersList: any = [];
    poInfo() {
        this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
            }
        })
    }

    // Project COntacts
    projectContactsData: any = [];
    projectContacts() {
        this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
            }
        })
    }

    // Client Legal Entity 
    cleData: any = [];
    cleInfo() {
        this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('Client Legal Entity ', this.cleData);
            }
        })
    }

    // Resource Categorization
    rcData: any = [];
    resourceCInfo() {
        this.fdDataShareServie.defaultRCData.subscribe((res) => {
            if (res) {
                this.rcData = res;
                console.log('Resource Categorization ', this.rcData);
            }
        })
    }

    createHourlyConfirmFormField() {
        this.confirmHourlybased_form = this.fb.group({
            approvalDate: [new Date(), [Validators.required]],
            HoursSpent: [''],
            BudgetHrs: [''],
        })
    }

    createHourlyFormField() {
        this.editHourly_form = this.fb.group({
            ProjectCode: [{ value: '', disabled: true }, Validators.required],
            // PONumber: [{ value: '', disabled: true }, Validators.required],
            POCName: [{ value: '', disabled: true }, Validators.required],
            Currency: [{ value: '', disabled: true }, Validators.required],
            Rate: ['', Validators.required],
            HoursSpent: ['', Validators.required],
            // ScheduledDate: ['', Validators.required],
            // AddressType: ['', Validators.required],
        })
    }

    createHBCCols() {
        this.hourlyBasedCols = [
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'SOWCode', header: 'SOW Code/ Name', visibility: true },
            { field: 'ProjectMileStone', header: 'Project Milestone', visibility: true },
            { field: 'ClientLegalEntity', header: 'Clent LE', visibility: true },
            { field: 'POCName', header: 'POC Name', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'Rate', header: 'Rate', visibility: true },
            { field: 'HoursSpent', header: 'Hrs', visibility: true },
            // { field: 'TotalInvoice', header: 'Total Invoice', visibility: true },
            { field: '', header: '', visibility: true },

            { field: 'ProposedEndDate', header: 'Proposed End Date', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'PONumber', header: 'PO Number', visibility: false },
            { field: 'POName', header: 'PO Name', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            // { field: 'ApprovedBudget', header: 'Approved Budget', visibility: false },
            // { field: 'RevenueBudget', header: 'Revenue Budget', visibility: false },
            // { field: 'OOPBudget', header: 'OOP Budget', visibility: false },
            // { field: 'TaxBudget', header: 'Tax Budget', visibility: false },
            // { field: 'InvoicesScheduled', header: 'Invoices Scheduled', visibility: false },
            // { field: 'ScheduledRevenue', header: 'Scheduled Revenue', visibility: false },
            // { field: 'ScheduledOOP', header: 'Scheduled OOP', visibility: false },
            { field: 'Invoiced', header: 'Invoiced', visibility: false },
            // { field: 'InvoicedRevenue', header: 'Invoiced Revenue', visibility: false },
            // { field: 'InvoicedOOP', header: 'Invoiced OOP', visibility: false },
            // { field: 'InvoicedTax', header: 'Invoiced Tax', visibility: false },
            // { field: 'BillableExpenses', header: 'Billable Expenses', visibility: false },
            // { field: 'NonBillableExpenses', header: 'NonBillable Expenses', visibility: false },
            // { field: 'Realization', header: 'Realization', visibility: false },
        ];
    }

    projectCodes: any = [];
    getPCForSentToAMForApproval() {
        this.projectCodes = [];
        for (let i = 0; i < this.projectInfoData.length; i++) {
            const element = this.projectInfoData[i];
            if (element.Status === this.constantService.projectStatus.SentToAMForApproval) {
                this.projectCodes.push(element);
                // this.projectForSentTOAMF(element);
            }
        }
        console.log('projectCodes ', this.projectCodes);
        if (this.projectCodes) {
            this.getRequiredData();
        }
    }

    // Push Project info data to HBRes
    projectForSentTOAMF(data: any[]) {
        for (let j = 0; j < data.length; j++) {
            const element = data[j];
            this.hourlyBasedRes.push({

            })
        }
    }

    hBQuery: any = [];
    async getRequiredData() {
        this.hourlyBasedRes = [];
        this.hBQuery = [];
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        for (let j = 0; j < this.projectCodes.length; j++) {
            const element = this.projectCodes[j];
            let obj = {
                filter: this.fdConstantsService.fdComponent.projectFinances.filter.replace("{{ProjectCode}}", element.ProjectCode),
                select: this.fdConstantsService.fdComponent.projectFinances.select,
                top: this.fdConstantsService.fdComponent.projectFinances.top,
                // orderby: this.fdConstantsService.fdComponent.projectFinances.orderby
            }
            this.hBQuery.push(this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinances.name + '', obj));
        }

        let endPoints = this.hBQuery;
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }

        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            arrResults = res;
            if (arrResults.length) {
                this.formatData(arrResults);
            }
        });

    }

    async formatData(data: any[]) {
        this.hourlyBasedRes = [];
        console.log('Project Finance Data ', data);
        for (let p = 0; p < this.projectCodes.length; p++) {
            for (let pf = 0; pf < data.length; pf++) {
                if (this.projectCodes[p].ProjectCode == data[pf][0].Title) {
                    let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(this.projectCodes[p].SOWCode);
                    this.hourlyBasedRes.push({
                        Id: this.projectCodes[p].ID,
                        ProjectCode: this.projectCodes[p].ProjectCode,
                        SOWCode: this.projectCodes[p].SOWCode,
                        SOWName: sowItem.Title,
                        ProjectMileStone: this.getMilestones(this.projectCodes[p]),
                        // ProjectMileStone: this.getMilestones(this.projectCodes[p]),
                        ClientLegalEntity: this.projectCodes[p].ClientLegalEntity,
                        ProposedEndDate: this.datePipe.transform(this.projectCodes[p].ProposedEndDate, 'MMM d, y, hh:mm a'),
                        POCName: this.getPOCName(this.projectCodes[p].PrimaryPOC),
                        PONumber: this.projectCodes[p].PrimaryPOC,
                        // ScheduledDate: this.datePipe.transform(element.ScheduledDate, 'MMM d, y, hh:mm a'),
                        PFID: data[pf][0].ID,
                        Currency: data[pf][0].Currency,
                        Rate: data[pf][0].Budget,
                        HoursSpent: data[pf][0].HoursSpent,
                        BudgetHrs: data[pf][0].BudgetHrs,
                        Template: data[pf][0].Template,
                        TotalInvoice: this.updateTotal(data[pf][0].Budget, data[pf][0].HoursSpent),

                        Modified: data[pf][0].Modified,
                        ApprovedBudget: data[pf][0].ApprovedBudget,
                        RevenueBudget: data[pf][0].RevenueBudget,
                        OOPBudget: data[pf][0].OOPBudget,
                        TaxBudget: data[pf][0].TaxBudget,
                        InvoicesScheduled: data[pf][0].InvoicesScheduled,
                        ScheduledRevenue: data[pf][0].ScheduledRevenue,
                        ScheduledOOP: data[pf][0].ScheduledOOP,
                        Invoiced: data[pf][0].Invoiced,
                        InvoicedRevenue: data[pf][0].InvoicedRevenue,
                        InvoicedOOP: data[pf][0].InvoicedOOP,
                        InvoicedTax: data[pf][0].InvoicedTax,
                        BillableExpenses: data[pf][0].BillableExpenses,
                        NonBillableExpenses: data[pf][0].NonBillableExpenses,
                        Realization: data[pf][0].Realization,

                    });
                }
            }
        }
        this.isPSInnerLoaderHidden = true;
        console.log('hourlyBasedRes data ', this.hourlyBasedRes);
        this.createColFieldValues();
    }

    updateTotal(rate, hrs) {
        return rate * hrs;
    }

    // Project Current Milestones
    getMilestones(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x;
            }
        })
        return found ? found.Milestone : '';
    }

    // Project Client
    getCLE(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x.ClientLegalEntity;
            }
        });
        return found ? found.ClientLegalEntity : '';
    }

    getPOCName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc) {
                return x;
            }
        })
        return found ? found.FName + ' ' + found.LName : ''
    }

    hourlyBasedColArray = {
        ProjectCode: [],
        SOWCode: [],
        ProjectMileStone: [],
        ClientLegalEntity: [],
        ProposedEndDate: [],
        POName: [],
        ScheduledDate: [],
        Rate: [],
        HoursSpent: [],
        TotalInvoice: [],
        Currency: [],
        POCName: [],
    }

    createColFieldValues() {
        this.hourlyBasedColArray.ProjectCode = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }));
        this.hourlyBasedColArray.SOWCode = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.SOWCode, value: a.SOWCode }; return b; }));
        this.hourlyBasedColArray.ProjectMileStone = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }));
        this.hourlyBasedColArray.ClientLegalEntity = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }));
        this.hourlyBasedColArray.ProposedEndDate = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.ProposedEndDate, value: a.ProposedEndDate }; return b; }));
        this.hourlyBasedColArray.ScheduledDate = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.ScheduledDate, value: a.ScheduledDate }; return b; }));
        this.hourlyBasedColArray.Rate = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.Rate, value: a.Rate }; return b; }));
        this.hourlyBasedColArray.HoursSpent = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.HoursSpent, value: a.HoursSpent }; return b; }));
        this.hourlyBasedColArray.TotalInvoice = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.TotalInvoice, value: a.TotalInvoice }; return b; }));
        this.hourlyBasedColArray.Currency = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }));
        this.hourlyBasedColArray.POCName = this.uniqueArrayObj(this.hourlyBasedRes.map(a => { let b = { label: a.POCName, value: a.POCName }; return b; }));
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

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];

    selectedRowItemData: any = [];
    selectedRowItemPC: any;
    onRowSelect(event) {
        console.log(event);
        this.selectedRowItemData.push(event.data);
        this.selectedRowItemPC = event.data.ProjectCode;
        console.log(this.selectedRowItemData);
    }

    onRowUnselect(event) {
        let rowUnselectIndex = this.selectedRowItemData.indexOf(event.data);
        this.selectedRowItemData.splice(rowUnselectIndex, 1);
        console.log(this.selectedRowItemData);
    }

    selectAllRows() {
        this.selectedAllRowsItem.length === 0 ? this.selectedRowItemData = [] : this.selectedRowItemData;
        if (this.selectedAllRowsItem.length === this.hourlyBasedRes.length) {
            this.selectedRowItemData = this.selectedAllRowsItem;
        }
        console.log('in selectAllRows ', this.selectedAllRowsItem);
        console.log('selectedRowItemData ', this.selectedRowItemData);

    }

    confirm1() {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to confirm the invoice scheduled for the project?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'You have Confirmed' }];
                // Call server service here
                this.onSubmit('confirmInvoice');
            },
            reject: () => {
                this.msgs = [{ severity: 'info', summary: 'Cancel', detail: 'You have canceled' }];
            }
        });
    }

    items: any[];
    hourlyDialog: any = {
        title: '',
        text: ''
    }
    // Open popups
    openPopup(data, popUpData) {
        console.log('Row data  ', data);
        // console.log('pubSupportSts  ', pubSupportSts);

        this.items = [
            { label: 'Confirm Invoice', command: (e) => this.openMenuContent(e, data) },
            { label: 'Edit Invoice', command: (e) => this.openMenuContent(e, data) },
            { label: 'View Project Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
        ];
    }

    hourlyModal: boolean = false;
    confirmationModal: boolean = false;
    selectedRowItem: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.hourlyDialog.title = event.item.label;
        if (this.hourlyDialog.title.toLowerCase() === 'confirm invoice') {
            // this.confirm1()
            // this.confirmationModal = true;
            this.isPSInnerLoaderHidden = false;
            this.updateConfirmModal();
            this.getConfirmMailContent('ConfirmInvoice');
            this.getPIByTitle(this.selectedRowItem);
        } else if (this.hourlyDialog.title.toLowerCase() === 'edit invoice') {
            // this.hourlyDialog.text = event.item.label.replace('Expense', '');
            this.hourlyModal = true;
            this.updateInvoice();
        } else if (this.hourlyDialog.title.toLowerCase() === 'view project details') {
            this.goToProjectDetails(this.selectedRowItem)
        } else if (this.hourlyDialog.title.toLowerCase() === 'show history') {
            this.timeline.showTimeline(data.Id, 'FD', 'Rolling');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    // Go to Project Details Page
    goToProjectDetails(data: any) {
        console.log(data);
        window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/project-mgmt?ProjectCode=' + data.ProjectCode);
        // this.router.navigate([this.globalObject.sharePointPageObject.webAbsoluteUrl + '//project-mgmt?ProjectCode=' + data.ProjectCode]);
    }

    updateInvoice() {
        this.editHourly_form.get('ProjectCode').setValue(this.selectedRowItem.ProjectCode);
        // this.editHourly_form.get('PONumber').setValue(this.selectedRowItem.PONumber);
        this.editHourly_form.get('POCName').setValue(this.selectedRowItem.POCName);
        this.editHourly_form.get('Currency').setValue(this.selectedRowItem.Currency);
        this.editHourly_form.get('Rate').setValue(this.selectedRowItem.Rate);
        this.editHourly_form.get('HoursSpent').setValue(this.selectedRowItem.HoursSpent);
    }

    // ProjectInfo line item by Selected Row Item
    projectInfoLineItem: any;
    poLineItem: any;
    updateConfirmModal() {
        this.projectInfoLineItem = '';
        //this.confirmHourlybased_form.get('BudgetHrs').setValue(this.selectedRowItem.BudgetHrs);
        //this.confirmHourlybased_form.get('HoursSpent').setValue(this.selectedRowItem.HoursSpent);
        const format = 'dd MMM , yyyy';
        const myDate = new Date();
        const locale = 'en-IN';
        const formattedDate = formatDate(myDate, format, locale);
        this.confirmHourlybased_form.patchValue({
            BudgetHrs: this.selectedRowItem.BudgetHrs,
            HoursSpent: this.selectedRowItem.HoursSpent,
            approvalDate: formattedDate
        })

        // Get Project Budget Brekup
        let obj = {
            filter: this.fdConstantsService.fdComponent.projectBudgetBreakup.filter.replace("{{ProjectCode}}", this.selectedRowItem.ProjectCode),
            select: this.fdConstantsService.fdComponent.projectBudgetBreakup.select,
        }
        let pbuUrl = this.spServices.getReadURL('' + this.constantService.listNames.ProjectBudgetBreakup.name + '', obj)

        // Get Finance Brekup List
        let obj1 = {
            filter: this.fdConstantsService.fdComponent.projectFinanceBreakup.filter.replace("{{ProjectCode}}", this.selectedRowItem.ProjectCode),
            select: this.fdConstantsService.fdComponent.projectFinanceBreakup.select,
        }
        let pfbUrl = this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinanceBreakup.name + '', obj1)

        // Get SOW
        let obj2 = {
            filter: this.fdConstantsService.fdComponent.sowByProjectCode.filter.replace("{{SOWCode}}", this.selectedRowItem.SOWCode),
            select: this.fdConstantsService.fdComponent.sowByProjectCode.select,
        }
        let sowUrl = this.spServices.getReadURL('' + this.constantService.listNames.SOW.name + '', obj2)

        let endPoints = [{ endPointsUrl: pbuUrl }, { endPointsUrl: pfbUrl }, { endPointsUrl: sowUrl }];

        this.getProjectBudgetBreakup(endPoints);
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        this.minScheduleDate = last3Days;
    }

    getProjectInfoLineItem() {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == this.selectedRowItem.ProjectCode) {
                return x;
            }
        })
        return found ? found : '';
    }

    async getProjectBudgetBreakup(endPoints) {
        this.hBQuery = [];
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element.endPointsUrl);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            arrResults = res;
            if (arrResults.length) {
                console.log('arrResults ', arrResults);
                this.setValue(arrResults);
            }
        });
    }

    projectBudgetBreakupData: any;
    ProjectFinanceBreakupData: any;
    sowData: any;
    sowObj: any = {};
    poLookupDataObj: any = {};
    setValue(data: any) {
        this.projectBudgetBreakupData = data[0][0];
        this.ProjectFinanceBreakupData = data[1][0];
        if (this.ProjectFinanceBreakupData) {
            this.poLookupDataObj = {};
            let poObj = this.getPODetails(this.ProjectFinanceBreakupData.POLookup ? this.ProjectFinanceBreakupData.POLookup : '');
            console.log('poobj ', poObj);
            this.getPOObj(poObj);
        }
        this.sowData = data[2][0];
        if (this.sowData) { this.getSOWObj(this.sowData) };

        this.updateRequiredItems();
    }

    getPODetails(polookup) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID == polookup) {
                return x;
            }
        })
        return found ? found : '';
    }

    getPOObj(poObj) {
        this.poLookupDataObj.ID = poObj.ID;
        this.poLookupDataObj.ExpiryDate = poObj.POExpiryDate;
        this.poLookupDataObj.TotalLinked = poObj.TotalLinked;
        this.poLookupDataObj.RevenueLinked = poObj.RevenueLinked;
        this.poLookupDataObj.AmountRevenue = poObj.AmountRevenue;
        this.poLookupDataObj.TotalScheduled = poObj.TotalScheduled;
        this.poLookupDataObj.ScheduledRevenue = poObj.ScheduledRevenue;
        this.poLookupDataObj.Number = poObj.Number;
        this.poLookupDataObj.availablePOBudget = parseFloat(poObj.AmountRevenue ? poObj.AmountRevenue : '') - parseFloat(poObj.RevenueLinked ? poObj.RevenueLinked : '');
        return this.poLookupDataObj;
    }

    getSOWObj(sow: any) {
        this.sowObj.availableSOWBudget = parseFloat(sow.NetBudget ? sow.NetBudget : 0) - parseFloat(sow.TotalLinked ? sow.TotalLinked : 0);
    }

    pcmLevels: any = [];
    updateRequiredItems() {
        if (new Date(this.poLookupDataObj.ExpiryDate) < (new Date())) {
            this.messageService.add({ key: 'bottomCenter', severity: 'info', summary: 'PO is expired.', detail: '', life: 4000 })
            this.isPSInnerLoaderHidden = true;
            return;
        }
        this.confirmationModal = true;
        this.isPSInnerLoaderHidden = true;
        if (this.submitBtn.isClicked) {
            this.isPSInnerLoaderHidden = false;
            let rate = this.selectedRowItem.Rate ? this.selectedRowItem.Rate : 0;
            let hrs = this.selectedRowItem.HoursSpent ? this.selectedRowItem.HoursSpent : 0;
            let totalVal = rate * hrs;

            if ((totalVal <= this.sowObj.availableSOWBudget) && (totalVal <= this.poLookupDataObj.availablePOBudget)) {


                // PI Id
                let piId = this.getProjectId(this.selectedRowItem);
                this.pcmLevels = [];
                if (piId) {
                    for (let i = 0; i < piId.CMLevel1.results.length; i++) {
                        const element = piId.CMLevel1.results[i];
                        this.pcmLevels.push(element);
                    }
                    this.pcmLevels.push(piId.CMLevel2);
                    console.log('this.pcmLevels ', this.pcmLevels);
                }

                //Update SOW Total Linked
                let updatedTotalLinkedValue = parseFloat(this.sowData.TotalLinked) + totalVal;
                let updatedSOWScheduledRevenue = parseFloat(this.sowData.ScheduledRevenue) + totalVal;
                let updatedSOWTotalScheduled = parseFloat(this.sowData.TotalScheduled) + totalVal;
                let updatedSOWRevenueLinked = parseFloat(this.sowData.RevenueLinked) + totalVal;

                //Update PO Linked
                let updatedPOTotalLinkedValue = parseFloat(this.poLookupDataObj.TotalLinked) + totalVal;
                let updatedPORevenueLinked = parseFloat(this.poLookupDataObj.RevenueLinked) + totalVal;
                let updatedPOTotalScheduled = parseFloat(this.poLookupDataObj.TotalScheduled) + totalVal;
                let updatedScheduledRevenue = parseFloat(this.poLookupDataObj.ScheduledRevenue) + totalVal;


                // Update ProjectInformation
                let piObj = {
                    Status: 'Audit In Progress',
                    ProposeClosureDate: new Date(),
                    IsApproved: 'Yes',

                }
                piObj['__metadata'] = { type: 'SP.Data.ProjectInformationListItem' };
                const piEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectInformation.update.replace("{{Id}}", piId.Id);

                ///update PO
                let poObj = {
                    TotalLinked: updatedPOTotalLinkedValue,
                    RevenueLinked: updatedPORevenueLinked,
                    TotalScheduled: updatedPOTotalScheduled,
                    ScheduledRevenue: updatedScheduledRevenue,
                }
                poObj['__metadata'] = { type: 'SP.Data.POListItem' };
                const poEndpoint = this.fdConstantsService.fdComponent.addUpdatePO.update.replace("{{Id}}", this.poLookupDataObj.ID);


                ///Update ProjectFinanceBreakup
                let pfbObj = {
                    Amount: totalVal,
                    AmountRevenue: totalVal,
                    TotalScheduled: totalVal,
                    ScheduledRevenue: totalVal,
                }
                pfbObj['__metadata'] = { type: 'SP.Data.ProjectFinanceBreakupListItem' };
                const pfbEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinanceBreakup.update.replace("{{Id}}", this.ProjectFinanceBreakupData.ID);

                ///Update ProjectBudgetBreakup
                let pbbObj = {
                    OriginalBudget: totalVal,
                    NetBudget: totalVal,
                    Status: 'Approved',
                    ApprovalDate: this.confirmHourlybased_form.value.approvalDate,
                    BudgetHours: this.confirmHourlybased_form.value.BudgetHrs
                }
                pbbObj['__metadata'] = { type: 'SP.Data.ProjectBudgetBreakupListItem' };
                const pbbEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectBudgetBreakup.update.replace("{{Id}}", this.projectBudgetBreakupData.ID);


                ///Update SOW
                let sowObj = {
                    TotalLinked: updatedTotalLinkedValue,
                    ScheduledRevenue: updatedSOWScheduledRevenue,
                    TotalScheduled: updatedSOWTotalScheduled,
                    RevenueLinked: updatedSOWRevenueLinked
                }
                sowObj['__metadata'] = { type: 'SP.Data.SOWListItem' };
                const sowEndpoint = this.fdConstantsService.fdComponent.addUpdateSow.update.replace("{{Id}}", this.sowData.ID);

                ///Add InvoiceLineItem
                let iliObj = {
                    Title: this.selectedRowItem.ProjectCode,
                    Status: 'Confirmed',
                    ScheduledDate: this.confirmHourlybased_form.value.approvalDate,
                    Amount: totalVal,
                    Currency: this.selectedRowItem.Currency,
                    PO: this.poLookupDataObj.ID,
                    MainPOC: piId.PrimaryPOC,
                    ScheduleType: 'revenue',
                    AddressType: 'Client',
                    Template: this.selectedRowItem.Template,
                    CSId: { results: this.pcmLevels.map(x => x.ID) },
                    SOWCode: this.selectedRowItem.SOWCode,
                }
                iliObj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
                const iliEndpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.create;

                // Project Finance
                let pfObj = {
                    ApprovedBudget: totalVal,
                    ScheduledRevenue: totalVal,
                    BudgetHrs: this.selectedRowItem.BudgetHrs,
                    InvoicesScheduled: totalVal
                }
                pfObj['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
                const pfEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", this.selectedRowItem.PFID);

                let data = [
                    { objData: piObj, endpoint: piEndpoint, requestPost: false },
                    { objData: poObj, endpoint: poEndpoint, requestPost: false },
                    { objData: pfbObj, endpoint: pfbEndpoint, requestPost: false },
                    { objData: pbbObj, endpoint: pbbEndpoint, requestPost: false },
                    { objData: sowObj, endpoint: sowEndpoint, requestPost: false },
                    { objData: pfObj, endpoint: pfEndpoint, requestPost: false },
                    { objData: iliObj, endpoint: iliEndpoint, requestPost: true },
                ];
                console.log('data ', data);


                let item = this.projectInfoData.find((x) => {
                    return x.ProjectCode == this.selectedRowItem.ProjectCode
                });

                let projIndex = this.projectInfoData.findIndex((x) => {
                    return x.ProjectCode == this.selectedRowItem.ProjectCode
                })
                item.Status = 'Audit In Progress'
                this.projectInfoData.splice(projIndex, 1, item);

                this.submitForm(data, 'confirmInvoice');
            } else {
                this.messageService.add({ key: 'bottomCenter', severity: 'info', summary: 'Project budget cannot be more than SOW available Budget.', detail: '', life: 4000 })
                this.isPSInnerLoaderHidden = true;
                this.confirmationModal = false;
                this.formSubmit.isSubmit = false;
                return;
            }
        }
    }

    getProjectId(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.ProjectCode) {
                return x;
            }
        })
        return found ? found : '';
    }



    get isValidEdithourlyForm() {
        return this.editHourly_form.controls;
    }

    get isValidConfirmForm() {
        return this.confirmHourlybased_form.controls;
    }

    cancelFormSub(formType) {
        if (formType === 'editHourly') {
            this.editHourly_form.reset();
            this.hourlyModal = false;
        } else if (formType === 'confirmationModal') {
            this.confirmHourlybased_form.reset();
            this.confirmationModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;

        if (type === 'confirmInvoice') {
            console.log('form is submitting ..... for selected row Item i.e ', this.selectedRowItem);
            if (this.confirmHourlybased_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            this.updateRequiredItems();
        } else if (type === 'editInvoice') {
            if (this.editHourly_form.invalid) {
                return
            }
            this.submitBtn.isClicked = true;
            this.updateHourlyData();
            let obj1 = {
                Budget: this.editHourly_form.value.Rate,
                HoursSpent: this.editHourly_form.value.HoursSpent
            }
            obj1['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", this.selectedRowItem.PFID);
            let data = [
                {
                    objData: obj1,
                    endpoint: endpoint,
                    requestPost: false
                }
            ]
            this.submitForm(data, type);
            this.cancelFormSub('editHourly');
        }
    }

    updateHourlyData() {
        let found = this.hourlyBasedRes.find((ele) => {
            if (ele.ProjectCode === this.selectedRowItem.ProjectCode) {
                this.selectedRowItem.Rate = ele.Rate = this.editHourly_form.value.Rate;
                this.selectedRowItem.HoursSpent = ele.HoursSpent = this.editHourly_form.value.HoursSpent;
                this.selectedRowItem.TotalInvoice = ele.TotalInvoice = ele.Rate * ele.HoursSpent;
            }
        });
        this.hourlyModal = false;
        return found;
    }

    batchContents: any = [];
    submitForm(dataEndpointArray, type: string) {
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
        this.spServices.getData(batchGuid, sBatchData).subscribe(res => {
            const arrResults = res;
            console.log('--oo ', arrResults);
            if (type === "confirmInvoice") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice is Confirmed.', detail: '', life: 2000 });
                // this.cancelFormSub('confirmationModal');
                // this.reload();
                this.sendCreateExpenseMail();
            } else if (type === "editInvoice") {
                this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice Updated.', detail: '', life: 2000 });
                this.cancelFormSub('editInvoice');
                this.reload();
            }
            this.isPSInnerLoaderHidden = true;

        });
    }


    // Send Mail

    // Mail Content
    mailContentRes: any;
    async getConfirmMailContent(type) {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        let mailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace("{{MailType}}", type),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        }

        let ProposeCMailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace("{{MailType}}", "AuditProject"),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        }

        let obj = [{
            url: this.spOperationsService.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        },
        {
            url: this.spOperationsService.getReadURL(this.constantService.listNames.MailContent.name, ProposeCMailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }]
        const res = await this.spOperationsService.executeBatch(obj);
        this.mailContentRes = res;
        console.log('Approve Mail Content res ', this.mailContentRes);
    }

    selectedProjectInof: any;
    cleForselectedPI: any;
    // getPIorClient(rowItem) {
    //     if (rowItem.ProjectCode.includes(' / ')) {
    //         let pc = rowItem.ProjectCode.substr(0, rowItem.ProjectCode.indexOf(' / '));
    //         console.log('Project Code is ', pc);
    //         this.selectedProjectInof = this.getPIByTitle(pc);
    //         console.log('this.selectedProjectInof ', this.selectedProjectInof);
    //         this.getResCatByCMLevel();
    //         this.cleForselectedPI = this.getCleByPC(rowItem.ProjectCode);
    //     } else {
    //         this.cleForselectedPI = this.getCleByPC(rowItem.ProjectCode);
    //         console.log('this.cleForselectedPI ', this.cleForselectedPI);
    //         this.getResCatByCMLevel();
    //     }
    // }

    // getCleByPC(title) {
    //     let found = this.cleData.find((x) => {
    //         if (x.Title == title) {
    //             if (x.CMLevel1.hasOwnProperty('results')) {
    //                 this.selectedPI = x.CMLevel1.results;
    //             }
    //             return x;
    //         }
    //     })
    //     return found ? found : ''
    // }

    selectedPI: any = [];
    getPIByTitle(title) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == title.ProjectCode) {
                if (x.CMLevel1.hasOwnProperty('results')) {
                    this.selectedPI = x.CMLevel1.results;
                }
                console.log('this.selectedPI ', this.selectedPI);
                this.getResCatByCMLevel();
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
            let item = this.getResourceData(element);
            item ? this.resCatEmails.push(item) : '';
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

    sendCreateExpenseMail() {
        // let isCleData = this.getCleByPC(expense.projectCode);
        // let isCleData = this.cleForselectedPI;
        // let author = this.getAuthor(expense.AuthorId);
        // let val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.ProjectCode + ' (' + isCleData.ClientLegalEntity + ')' : expense.ProjectCode;
        // var mailTemplate =  data.Status === "Approved" ? "ApproveExpense" :  data.Status === "Cancelled" ? "CancelExpense" : "RejectExpense";

        // Confirmation Mail 
        var mailSubject = this.selectedRowItem.ProjectCode + "/" + this.selectedRowItem.ClientLegalEntity + ": Confirmed line item for billing";
        let mailContent = this.mailContentRes[0].retItems[0].Content;
        mailContent = this.replaceContent(mailContent, "@@Val1@@", "Hello Invoice Team");
        mailContent = this.replaceContent(mailContent, "@@Val2@@", this.selectedRowItem.ProjectCode);
        mailContent = this.replaceContent(mailContent, "@@Val3@@", this.selectedRowItem.ClientLegalEntity);
        mailContent = this.replaceContent(mailContent, "@@Val4@@", this.selectedRowItem.PONumber);
        mailContent = this.replaceContent(mailContent, "@@Val5@@", this.datePipe.transform(this.confirmHourlybased_form.value.approvalDate, 'MMM d, y, hh:mm a'));
        mailContent = this.replaceContent(mailContent, "@@Val6@@", this.selectedRowItem.Currency + ' ' + (this.selectedRowItem.Rate * this.selectedRowItem.BudgetHrs));
        mailContent = this.replaceContent(mailContent, "@@Val7@@", this.selectedRowItem.SOWCode);

        // Propose Closure Mail Content
        var pcmailSubject = this.selectedRowItem.ProjectCode + "(" + this.selectedRowItem.Id + "): " + "Propose closure for project";
        let pcmailContent = this.mailContentRes[1].retItems[0].Content;
        pcmailContent = this.replaceContent(pcmailContent, "@@Val1@@", this.selectedRowItem.ProjectCode);
        pcmailContent = this.replaceContent(pcmailContent, "@@Val2@@", this.selectedRowItem.ClientLegalEntity);
        pcmailContent = this.replaceContent(pcmailContent, "@@Val3@@", "Project Manager");


        var ccUser = [];
        ccUser.push(this.currentUserInfoData.Email);
        // let tos = this.getTosList();
        this.spOperationsService.sendMail(this.getTosList('i').join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.spOperationsService.sendMail(this.getTosList('pc').join(','), this.currentUserInfoData.Email, pcmailSubject, pcmailContent, ccUser.join(','));
        this.isPSInnerLoaderHidden = true;
        this.reload();
    }

    getTosList(type: string) {
        var approvers = this.groupInfo.results;
        let itApprovers = this.groupITInfo.results;
        var arrayTo = [];
        if (type === 'pc' || type === 'i') {
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

        }
        if (type === 'i') {
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
        }

        console.log('arrayTo ', arrayTo);
        return arrayTo;
    }


    reload() {
        setTimeout(() => {
            window.location.reload();
            // this.getRequiredData();

            // this.getPCForSentToAMForApproval();
            // this.currentUserInfo();
        }, 3000);
    }

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

}