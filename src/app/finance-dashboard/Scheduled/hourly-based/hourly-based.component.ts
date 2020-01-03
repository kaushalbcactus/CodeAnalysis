import { Component, OnInit, ViewChild, OnDestroy, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { Message, ConfirmationService, MessageService } from 'primeng/api';
import { Calendar, Table } from 'primeng';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { formatDate, DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from './../../../timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-hourly-based',
    templateUrl: './hourly-based.component.html',
    styleUrls: ['./hourly-based.component.css']
})
export class HourlyBasedComponent implements OnInit, OnDestroy {
    constructor(
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private messageService: MessageService,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        zone: NgZone,
    ) {

        // Browser back button disabled & bookmark issue solution
        history.pushState(null, null, window.location.href);
        platformLocation.onPopState(() => {
            history.pushState(null, null, window.location.href);
        });

        _router.events.subscribe((uri) => {
            zone.run(() => _applicationRef.tick());
        });

    }



    get isValidEdithourlyForm() {
        return this.editHourly_form.controls;
    }

    get isValidConfirmForm() {
        return this.confirmHourlybased_form.controls;
    }
    tempClick: any;
    hourlyBasedRes: any = [];

    hourlyBasedCols: any[];
    msgs: Message[] = [];

    // Edit hourly Form
    editHourly_form: FormGroup;
    confirmHourlybased_form: FormGroup;

    // loader
    isPSInnerLoaderHidden: boolean = true;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;

    // Right side bar
    rightSideBar: boolean = false;


    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };
    projectInfoData: any = [];

    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    hBQuery: any = [];
    // List of Subscribers 
    private subscription: Subscription = new Subscription();

    minScheduleDate: Date = new Date();
    @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
    @ViewChild('hb', { static: false }) hourlyTable: Table;
    // Purchase Order Number
    purchaseOrdersList: any = [];

    // Project COntacts
    projectContactsData: any = [];

    // Client Legal Entity 
    cleData: any = [];

    // Resource Categorization
    rcData: any = [];

    projectCodes: any = [];

    hourlyBasedColArray = {
        ProjectCode: [],
        SOWValue: [],
        ProjectMileStone: [],
        ClientLegalEntity: [],
        PONumber: [],
        POName: [],
        Rate: [],
        HoursSpent: [],
        Currency: [],
        POCName: [],
        TotalInvoice: []
    };

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];
    selectedRowItemPC: any;

    items: any[];
    hourlyDialog: any = {
        title: '',
        text: ''
    };

    hourlyModal: boolean = false;
    confirmationModal: boolean = false;
    selectedRowItem: any;

    // ProjectInfo line item by Selected Row Item
    projectInfoLineItem: any;
    poLineItem: any;

    projectBudgetBreakupData: any;
    ProjectFinanceBreakupData: any;
    sowData: any;
    sowObj: any = {};
    poLookupDataObj: any = {};
    pcmLevels: any = [];
    batchContents: any = [];
    // Send Mail

    // Mail Content
    mailContentRes: any;

    selectedProjectInof: any;
    cleForselectedPI: any;

    selectedPI: any = [];
    cmLevelIdList: any = [];
    resCatEmails: any = [];
    isOptionFilter: boolean;

    async ngOnInit() {
        this.createHBCCols();
        // this.getHourlyBasedData();
        this.createHourlyFormField();
        this.createHourlyConfirmFormField();

        // Get Projects & PC
        await this.projectInfo();
        this.poInfo();
        this.projectContacts();
        // GEt Client Legal Entity
        this.cleInfo();
        this.resourceCInfo();

        // For Mail
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        console.log('this.currentUserInfoData  ', this.currentUserInfoData);
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        console.log('this.groupInfo  ', this.groupInfo);
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
        console.log('this.groupITInfo  ', this.groupITInfo);

    }

    // Project Info
    async projectInfo() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('this.projectInfoData ', this.projectInfoData);
                this.getPCForSentToAMForApproval();
            }
        }));
    }

    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }

    poInfo() {
        this.subscription.add(this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
            }
        }));
    }

    projectContacts() {
        this.subscription.add(this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
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

    createHourlyConfirmFormField() {
        this.confirmHourlybased_form = this.fb.group({
            approvalDate: [new Date(), [Validators.required]],
            HoursSpent: [''],
            BudgetHrs: [''],
        });
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
        });
    }

    createHBCCols() {
        this.hourlyBasedCols = [
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'ProjectTitle', header: 'Project Title', visibility: false },
            { field: 'SOWValue', header: 'SOW Code/ Name', visibility: true },
            { field: 'ProjectMileStone', header: 'Project Milestone', visibility: true },
            { field: 'ClientLegalEntity', header: 'Clent LE', visibility: true },
            { field: 'PONumber', header: 'PO Number', visibility: true },
            { field: 'POName', header: 'PO Name', visibility: true },
            { field: 'POCName', header: 'POC Name', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'Rate', header: 'Rate', visibility: true },
            { field: 'HoursSpent', header: 'Hrs', visibility: true },
            { field: 'TotalInvoice', header: 'Total Invoice', visibility: true },

            { field: 'ProposedEndDate', header: 'Proposed End Date', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'Invoiced', header: 'Invoiced', visibility: false },
            { field: '', header: '', visibility: true },
        ];
    }

    getPCForSentToAMForApproval() {
        this.projectCodes = [];
        for (let i = 0; i < this.projectInfoData.length; i++) {
            const element = this.projectInfoData[i];
            if (element.Status === this.constantService.projectStatus.SentToAMForApproval) {
                this.projectCodes.push(element);
            }
        }
        console.log('projectCodes ', this.projectCodes);
        if (this.projectCodes) {
            this.getRequiredData();
        }
    }

    async getRequiredData() {
        this.hourlyBasedRes = [];
        this.hBQuery = [];
        const batchUrl = [];
        this.projectCodes.forEach(element => {
            const prjObj = Object.assign({}, this.queryConfig);
            prjObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinances.name,
                this.fdConstantsService.fdComponent.projectFinances);
            prjObj.url = prjObj.url.replace('{{ProjectCode}}', element.ProjectCode);
            prjObj.listName = this.constantService.listNames.ProjectFinances.name;
            prjObj.type = 'GET';
            batchUrl.push(prjObj);
        });
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-hourlyBased', 'getPFbyProjectCode');
        const res = await this.spServices.executeBatch(batchUrl);
        const arrResults = res.length ? res.map(a => a.retItems) : [];
        this.formatData(arrResults);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    async formatData(data: any[]) {
        this.hourlyBasedRes = [];
        console.log('Project Finance Data ', data);
        for (let p = 0; p < this.projectCodes.length; p++) {
            for (let pf = 0; pf < data.length; pf++) {
                if (this.projectCodes[p].ProjectCode === data[pf][0].Title) {
                    const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(this.projectCodes[p].SOWCode);
                    const poDetail = await this.getPONumber(this.projectCodes[p]);
                    const piInfo = await this.getMilestones(this.projectCodes[p]);
                    this.hourlyBasedRes.push({
                        Id: this.projectCodes[p].ID,
                        ProjectCode: this.projectCodes[p].ProjectCode,
                        ProjectTitle: piInfo.Title ? piInfo.Title : '',
                        SOWCode: this.projectCodes[p].SOWCode,
                        SOWValue: this.projectCodes[p].SOWCode + ' / ' + sowItem.Title,
                        SOWName: sowItem.Title,
                        ProjectMileStone: piInfo.Milestone ? piInfo.Milestone : '',
                        ClientLegalEntity: this.projectCodes[p].ClientLegalEntity,
                        ProposedEndDate: this.datePipe.transform(this.projectCodes[p].ProposedEndDate, 'MMM dd, yyyy, hh:mm a'),
                        POCName: this.getPOCName(this.projectCodes[p].PrimaryPOC),
                        // PONumber: this.projectCodes[p].PrimaryPOC,
                        POName: poDetail.Name,
                        PONumber: poDetail.Number,
                        // ScheduledDate: this.datePipe.transform(element.ScheduledDate, 'MMM d, y, hh:mm a'),
                        PFID: data[pf][0].ID,
                        Currency: data[pf][0].Currency,
                        Rate: parseFloat(data[pf][0].Budget).toFixed(2),
                        HoursSpent: parseFloat(data[pf][0].HoursSpent.toFixed(2)),
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
        this.hourlyBasedRes = [...this.hourlyBasedRes];
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // console.log('hourlyBasedRes data ', this.hourlyBasedRes);
        this.createColFieldValues(this.hourlyBasedRes);
    }

    updateTotal(rate, hrs) {
        return (rate * hrs).toFixed(2);
    }

    // Project Current Milestones
    getMilestones(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.ProjectCode) {
                return x;
            }
        });
        return found ? found : '';
    }

    // Project Client
    getCLE(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x.ClientLegalEntity;
            }
        });
        return found ? found.ClientLegalEntity : '';
    }

    // Project PO
    async getPONumber(pf) {
        // Get Finance Brekup List
        const pfbObj = Object.assign({}, this.fdConstantsService.fdComponent.projectFinanceBreakupForPO);
        pfbObj.filter = pfbObj.filter.replace('{{ProjectCode}}', pf.ProjectCode);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-hourlyBased', 'GetPoNO');
        const res = await this.spServices.readItems(this.constantService.listNames.ProjectFinanceBreakup.name, pfbObj);
        // const res = await this.getProjectBudgetBreakup(endPoints, 'poDetails');
        const poByPfb = res.length ? res[0] : { POLookup: '' };
        const found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poByPfb.POLookup) {
                return x;
            }
        });
        return found ? found : '';
    }

    getPODetailsByPF(poId) {
        const found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        });
        return found ? found : '';
    }

    getPOCName(poc: any) {
        const found = this.projectContactsData.find((x) => {
            if (x.ID === poc) {
                return x;
            }
        });
        return found ? found.FName + ' ' + found.LName : '';
    }

    createColFieldValues(resArray) {
        this.hourlyBasedColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.SOWValue = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.SOWValue, value: a.SOWValue }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.ProjectMileStone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.ClientLegalEntity = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.PONumber = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.POName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.POName, value: a.POName }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.hourlyBasedColArray.POCName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.POCName, value: a.POCName }; return b; }).filter(ele => ele.label)));

        const rate = this.uniqueArrayObj(resArray.map(a => { const b = { label: parseFloat(a.Rate), value: a.Rate }; return b; }).filter(ele => ele.label));
        this.hourlyBasedColArray.Rate = this.fdDataShareServie.customSort(rate, 1, 'label');
        const hoursSpent = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.HoursSpent, value: a.HoursSpent }; return b; }).filter(ele => ele.label));
        this.hourlyBasedColArray.HoursSpent = this.fdDataShareServie.customSort(hoursSpent, 1, 'label');
        const totalInvoice = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.TotalInvoice, value: a.TotalInvoice }; return b; }).filter(ele => ele.label));
        this.hourlyBasedColArray.TotalInvoice = this.fdDataShareServie.customSort(totalInvoice, 1, 'label');
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
    onRowSelect(event) {
        console.log(event);
        console.log(this.selectedAllRowsItem);
    }

    onRowUnselect(event) {
        console.log(this.selectedAllRowsItem);
    }

    selectAllRows() {
        if (this.selectedAllRowsItem.length === this.hourlyBasedRes.length) {
            //this.selectedRowItemData = this.selectedAllRowsItem;
        }
        console.log('in selectAllRows ', this.selectedAllRowsItem);
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

    // Open popups
    openPopup(data, popUpData) {
        console.log('Row data  ', data);
        // console.log('pubSupportSts  ', pubSupportSts);

        this.items = [
            { label: 'Confirm Invoice', command: (e) => this.openMenuContent(e, data) },
            { label: 'Edit Invoice', command: (e) => this.openMenuContent(e, data) },
            { label: 'View Project Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        ];
    }

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
            this.goToProjectDetails(this.selectedRowItem);
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
        window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/projectMgmt/allProjects?ProjectCode=' + data.ProjectCode);
    }

    updateInvoice() {
        this.editHourly_form.get('ProjectCode').setValue(this.selectedRowItem.ProjectCode);
        // this.editHourly_form.get('PONumber').setValue(this.selectedRowItem.PONumber);
        this.editHourly_form.get('POCName').setValue(this.selectedRowItem.POCName);
        this.editHourly_form.get('Currency').setValue(this.selectedRowItem.Currency);
        this.editHourly_form.get('Rate').setValue(this.selectedRowItem.Rate);
        this.editHourly_form.get('HoursSpent').setValue(this.selectedRowItem.HoursSpent);
    }
    updateConfirmModal() {
        const batchUrl = [];
        this.projectInfoLineItem = '';
        // this.confirmHourlybased_form.get('BudgetHrs').setValue(this.selectedRowItem.BudgetHrs);
        // this.confirmHourlybased_form.get('HoursSpent').setValue(this.selectedRowItem.HoursSpent);
        const format = 'dd MMM , yyyy';
        const myDate = new Date();
        const locale = 'en-IN';
        const formattedDate = formatDate(myDate, format, locale);
        this.confirmHourlybased_form.patchValue({
            BudgetHrs: this.selectedRowItem.BudgetHrs,
            HoursSpent: this.selectedRowItem.HoursSpent,
            approvalDate: formattedDate
        });

        // Get Project Budget Brekup
        const pbbObj = Object.assign({}, this.queryConfig);
        pbbObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectBudgetBreakup.name,
            this.fdConstantsService.fdComponent.projectBudgetBreakup);
        pbbObj.url = pbbObj.url.replace('{{ProjectCode}}', this.selectedRowItem.ProjectCode);
        pbbObj.listName = this.constantService.listNames.ProjectBudgetBreakup.name;
        pbbObj.type = 'GET';
        batchUrl.push(pbbObj);
        // Get Finance Brekup List
        const pfbObj = Object.assign({}, this.queryConfig);
        pfbObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinanceBreakup.name,
            this.fdConstantsService.fdComponent.projectFinanceBreakup);
        pfbObj.url = pfbObj.url.replace('{{ProjectCode}}', this.selectedRowItem.ProjectCode);
        pfbObj.listName = this.constantService.listNames.ProjectFinanceBreakup.name;
        pfbObj.type = 'GET';
        batchUrl.push(pfbObj);
        // Get SOW
        const sowObj = Object.assign({}, this.queryConfig);
        sowObj.url = this.spServices.getReadURL(this.constantService.listNames.SOW.name,
            this.fdConstantsService.fdComponent.sowByProjectCode);
        sowObj.url = sowObj.url.replace('{{SOWCode}}', this.selectedRowItem.SOWCode);
        sowObj.listName = this.constantService.listNames.SOW.name;
        sowObj.type = 'GET';
        batchUrl.push(sowObj);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-hourlyBased', 'getPFBPFBBSow');
        this.getProjectBudgetBreakup(batchUrl);
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        this.minScheduleDate = last3Days;
    }

    getProjectInfoLineItem() {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == this.selectedRowItem.ProjectCode) {
                return x;
            }
        });
        return found ? found : '';
    }

    async getProjectBudgetBreakup(batchUrl) {
        const res = await this.spServices.executeBatch(batchUrl);
        const arrResults = res.length ? res.map(a => a.retItems) : [];
        if (arrResults.length) {
            console.log('arrResults ', arrResults);
            this.setValue(arrResults);
        }
    }
    setValue(data: any) {
        this.projectBudgetBreakupData = data[0][0];
        this.ProjectFinanceBreakupData = data[1][0];
        if (this.ProjectFinanceBreakupData) {
            this.poLookupDataObj = {};
            const poObj = this.getPODetails(this.ProjectFinanceBreakupData.POLookup ? this.ProjectFinanceBreakupData.POLookup : '');
            console.log('poobj ', poObj);
            this.getPOObj(poObj);
        }
        this.sowData = data[2][0];
        if (this.sowData) { this.getSOWObj(this.sowData); }
        this.updateRequiredItems();
    }

    getPODetails(polookup) {
        const found = this.purchaseOrdersList.find((x) => {
            if (x.ID === polookup) {
                return x;
            }
        });
        return found ? found : '';
    }

    getPOObj(poObj) {
        this.poLookupDataObj.ID = poObj.ID;
        this.poLookupDataObj.ExpiryDate = poObj.POExpiryDate;
        this.poLookupDataObj.TotalLinked = poObj.TotalLinked ? poObj.TotalLinked : 0;
        this.poLookupDataObj.RevenueLinked = poObj.RevenueLinked ? poObj.RevenueLinked : 0;
        this.poLookupDataObj.AmountRevenue = poObj.AmountRevenue ? poObj.AmountRevenue : 0;
        this.poLookupDataObj.TotalScheduled = poObj.TotalScheduled ? poObj.TotalScheduled : 0;
        this.poLookupDataObj.ScheduledRevenue = poObj.ScheduledRevenue ? poObj.ScheduledRevenue : 0;
        this.poLookupDataObj.Number = poObj.Number;
        this.poLookupDataObj.availablePOBudget = parseFloat(poObj.AmountRevenue ? poObj.AmountRevenue : 0) - parseFloat(poObj.RevenueLinked ? poObj.RevenueLinked : 0);
        return this.poLookupDataObj;
    }

    getSOWObj(sow: any) {
        this.sowObj.availableSOWBudget = parseFloat(sow.NetBudget ? sow.NetBudget : 0) - parseFloat(sow.RevenueLinked ? sow.RevenueLinked : 0);
        this.sowData.TotalLinked = sow.TotalLinked ? sow.TotalLinked : 0;
        this.sowData.ScheduledRevenue = sow.ScheduledRevenue ? sow.ScheduledRevenue : 0;
        this.sowData.TotalScheduled = sow.TotalScheduled = sow.TotalScheduled ? sow.TotalScheduled : 0;
        this.sowData.RevenueLinked = sow.RevenueLinked ? sow.RevenueLinked : 0;
    }
    updateRequiredItems() {
        if (new Date(this.poLookupDataObj.ExpiryDate) < (new Date())) {
            this.messageService.add({ key: 'hourlyInfoToast', severity: 'info', summary: 'Info message', detail: 'PO is expired.', life: 4000 });
            this.isPSInnerLoaderHidden = true;
            return;
        }
        this.confirmationModal = true;
        this.isPSInnerLoaderHidden = true;
        if (this.submitBtn.isClicked) {
            this.isPSInnerLoaderHidden = false;
            const batchUrl = [];
            const rate = this.selectedRowItem.Rate ? this.selectedRowItem.Rate : 0;
            const hrs = this.selectedRowItem.HoursSpent ? this.selectedRowItem.HoursSpent : 0;
            const totalVal = rate * hrs;

            if ((totalVal <= this.sowObj.availableSOWBudget) && (totalVal <= this.poLookupDataObj.availablePOBudget)) {

                // PI Id
                const piId = this.getProjectId(this.selectedRowItem);
                this.pcmLevels = [];
                if (piId) {
                    for (let i = 0; i < piId.CMLevel1.results.length; i++) {
                        const element = piId.CMLevel1.results[i];
                        this.pcmLevels.push(element);
                    }
                    this.pcmLevels.push(piId.CMLevel2);
                    // console.log('this.pcmLevels ', this.pcmLevels);
                }

                // Update SOW Total Linked
                const updatedTotalLinkedValue = parseFloat(this.sowData.TotalLinked) + totalVal;
                const updatedSOWScheduledRevenue = parseFloat(this.sowData.ScheduledRevenue) + totalVal;
                const updatedSOWTotalScheduled = parseFloat(this.sowData.TotalScheduled) + totalVal;
                const updatedSOWRevenueLinked = parseFloat(this.sowData.RevenueLinked) + totalVal;

                // Update PO Linked
                const updatedPOTotalLinkedValue = parseFloat(this.poLookupDataObj.TotalLinked) + totalVal;
                const updatedPORevenueLinked = parseFloat(this.poLookupDataObj.RevenueLinked) + totalVal;
                const updatedPOTotalScheduled = parseFloat(this.poLookupDataObj.TotalScheduled) + totalVal;
                const updatedScheduledRevenue = parseFloat(this.poLookupDataObj.ScheduledRevenue) + totalVal;


                // Update ProjectInformation
                const piData = {
                    Status: 'Audit In Progress',
                    ProposeClosureDate: new Date(),
                    IsApproved: 'Yes',

                };
                piData['__metadata'] = { type: 'SP.Data.ProjectInformationListItem' };
                const piObj = Object.assign({}, this.queryConfig);
                piObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectInformation.name, +piId.Id);
                piObj.listName = this.constantService.listNames.ProjectInformation.name;
                piObj.type = 'PATCH';
                piObj.data = piData;
                batchUrl.push(piObj);
                // const piEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectInformation.update.replace("{{Id}}", piId.Id);

                // update PO
                const poData = {
                    TotalLinked: updatedPOTotalLinkedValue,
                    RevenueLinked: updatedPORevenueLinked,
                    TotalScheduled: updatedPOTotalScheduled,
                    ScheduledRevenue: updatedScheduledRevenue,
                };
                poData['__metadata'] = { type: 'SP.Data.POListItem' };
                // const poEndpoint = this.fdConstantsService.fdComponent.addUpdatePO.update.replace("{{Id}}", this.poLookupDataObj.ID);
                const poObj = Object.assign({}, this.queryConfig);
                poObj.url = this.spServices.getItemURL(this.constantService.listNames.PO.name, +this.poLookupDataObj.ID);
                poObj.listName = this.constantService.listNames.PO.name;
                poObj.type = 'PATCH';
                poObj.data = poData;
                batchUrl.push(poObj);

                // Update ProjectFinanceBreakup
                const pfbData = {
                    Amount: totalVal,
                    AmountRevenue: totalVal,
                    TotalScheduled: totalVal,
                    ScheduledRevenue: totalVal,
                };
                pfbData['__metadata'] = { type: 'SP.Data.ProjectFinanceBreakupListItem' };
                // const pfbEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinanceBreakup.update.replace("{{Id}}", this.ProjectFinanceBreakupData.ID);
                const pfbObj = Object.assign({}, this.queryConfig);
                pfbObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinanceBreakup.name,
                    +this.ProjectFinanceBreakupData.ID);
                pfbObj.listName = this.constantService.listNames.ProjectFinanceBreakup.name;
                pfbObj.type = 'PATCH';
                pfbObj.data = pfbData;
                batchUrl.push(pfbObj);
                ///Update ProjectBudgetBreakup
                let pbbData = {
                    OriginalBudget: totalVal,
                    NetBudget: totalVal,
                    Status: 'Approved',
                    ApprovalDate: this.confirmHourlybased_form.value.approvalDate,
                    BudgetHours: hrs
                };
                pbbData['__metadata'] = { type: 'SP.Data.ProjectBudgetBreakupListItem' };
                // const pbbEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectBudgetBreakup.update.replace("{{Id}}", this.projectBudgetBreakupData.ID);
                const pbbObj = Object.assign({}, this.queryConfig);
                pbbObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectBudgetBreakup.name,
                    +this.projectBudgetBreakupData.ID);
                pbbObj.listName = this.constantService.listNames.ProjectBudgetBreakup.name;
                pbbObj.type = 'PATCH';
                pbbObj.data = pbbData;
                batchUrl.push(pbbObj);

                // Update SOW
                const sowData = {
                    TotalLinked: updatedTotalLinkedValue,
                    ScheduledRevenue: updatedSOWScheduledRevenue,
                    TotalScheduled: updatedSOWTotalScheduled,
                    RevenueLinked: updatedSOWRevenueLinked
                };
                sowData['__metadata'] = { type: 'SP.Data.SOWListItem' };
                // const sowEndpoint = this.fdConstantsService.fdComponent.addUpdateSow.update.replace("{{Id}}", this.sowData.ID);
                const sowObj = Object.assign({}, this.queryConfig);
                sowObj.url = this.spServices.getItemURL(this.constantService.listNames.SOW.name,
                    +this.sowData.ID);
                sowObj.listName = this.constantService.listNames.SOW.name;
                sowObj.type = 'PATCH';
                sowObj.data = sowData;
                batchUrl.push(sowObj);

                // Add InvoiceLineItem
                const iliData = {
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
                };
                iliData['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
                // const iliEndpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.create;
                const iliObj = Object.assign({}, this.queryConfig);
                iliObj.url = this.spServices.getReadURL(this.constantService.listNames.InvoiceLineItems.name);
                iliObj.listName = this.constantService.listNames.InvoiceLineItems.name;
                iliObj.type = 'POST';
                iliObj.data = iliData;
                batchUrl.push(iliObj);

                // Project Finance
                const pfData = {
                    ApprovedBudget: totalVal,
                    ScheduledRevenue: totalVal,
                    BudgetHrs: hrs,
                    InvoicesScheduled: totalVal
                };
                pfData['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
                // const pfEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", this.selectedRowItem.PFID);
                const pfObj = Object.assign({}, this.queryConfig);
                pfObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinances.name, +this.selectedRowItem.PFID);
                pfObj.listName = this.constantService.listNames.ProjectFinances.name;
                pfObj.type = 'PATCH';
                pfObj.data = pfData;
                batchUrl.push(pfObj);

                const item = this.projectInfoData.find((x) => {
                    return x.ProjectCode === this.selectedRowItem.ProjectCode;
                });

                const projIndex = this.projectInfoData.findIndex((x) => {
                    return x.ProjectCode === this.selectedRowItem.ProjectCode;
                });
                item.Status = 'Audit In Progress';
                this.projectInfoData.splice(projIndex, 1, item);
                this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-hourlyBased', 'updatePOPBBPFBSow');
                this.submitForm(batchUrl, 'confirmInvoice');
            } else {
                this.messageService.add({
                    key: 'hourlyInfoToast', severity: 'info',
                    summary: 'Info message',
                    detail: 'Project budget cannot be more than SOW available budget or PO available budget.',
                    life: 4000
                });
                this.isPSInnerLoaderHidden = true;
                this.confirmationModal = false;
                this.formSubmit.isSubmit = false;
                return;
            }
        }
    }

    getProjectId(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.ProjectCode) {
                return x;
            }
        });
        return found ? found : '';
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

    async onSubmit(type: string) {
        this.formSubmit.isSubmit = true;

        if (type === 'confirmInvoice') {
            // console.log('form is submitting ..... for selected row Item i.e ', this.selectedRowItem);
            if (this.confirmHourlybased_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            this.updateRequiredItems();
        } else if (type === 'editInvoice') {
            if (this.editHourly_form.invalid) {
                return;
            }
            this.submitBtn.isClicked = true;
            this.isPSInnerLoaderHidden = false;
            this.updateHourlyData();
            const pfData = {
                Budget: this.editHourly_form.value.Rate,
                HoursSpent: this.editHourly_form.value.HoursSpent
            };
            pfData['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
            this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-hourlyBased', 'updatePFLItem');
            await this.spServices.updateItem(this.constantService.listNames.ProjectFinances.name, +this.selectedRowItem.PFID,
                pfData, this.constantService.listNames.ProjectFinances.type);
            // this.submitForm(data, type);
            this.messageService.add({
                key: 'hourlySuccessToast', severity: 'success',
                summary: 'Success message', detail: 'Invoice Updated.', life: 2000
            });
            this.cancelFormSub('editInvoice');
            this.reFetchData('edit');
        }
    }

    updateHourlyData() {
        const found = this.hourlyBasedRes.find((ele) => {
            if (ele.ProjectCode === this.selectedRowItem.ProjectCode) {
                this.selectedRowItem.Rate = ele.Rate = this.editHourly_form.value.Rate;
                this.selectedRowItem.HoursSpent = ele.HoursSpent = this.editHourly_form.value.HoursSpent;
                this.selectedRowItem.TotalInvoice = ele.TotalInvoice = ele.Rate * ele.HoursSpent;
            }
        });
        this.hourlyModal = false;
        return found;
    }

    async submitForm(batchUrl, type: string) {
        const res = await this.spServices.executeBatch(batchUrl);
        const arrResults = res.length ? res.map(a => a.retItems) : [];
        console.log('--oo ', arrResults);
        if (type === 'confirmInvoice') {
            this.messageService.add({
                key: 'hourlySuccessToast', severity: 'success',
                summary: 'Success message', detail: 'Invoice is Confirmed.', life: 2000
            });
            // this.cancelFormSub('confirmationModal');
            this.sendConfirmInvoiceMail();
        } else if (type === 'editInvoice') {
            // this.messageService.add({ key: 'hourlySuccessToast', severity: 'success',
            //                          summary: 'Success message', detail: 'Invoice Updated.', life: 2000 });
            // this.cancelFormSub('editInvoice');
            // this.reFetchData('edit');
        }

        // });
    }
    async getConfirmMailContent(type) {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        const mailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace('{{MailType}}', type),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        };

        const ProposeCMailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace('{{MailType}}', 'AuditProject'),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        };

        const obj = [{
            url: this.spServices.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        },
        {
            url: this.spServices.getReadURL(this.constantService.listNames.MailContent.name, ProposeCMailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }];
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-hourlyBased', 'getEmailTemplates');
        const res = await this.spServices.executeBatch(obj);
        this.mailContentRes = res;
        console.log('Approve Mail Content res ', this.mailContentRes);
    }

    getPIByTitle(title) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == title.ProjectCode) {
                if (x.CMLevel1.hasOwnProperty('results')) {
                    this.selectedPI = x.CMLevel1.results;
                }
                console.log('this.selectedPI ', this.selectedPI);
                this.getResCatByCMLevel();
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
            const item = this.getResourceData(element);
            item ? this.resCatEmails.push(item) : '';
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

    sendConfirmInvoiceMail() {
        const sharepointPageObject = this.globalService.sharePointPageObject;
        // Confirmation Mail 
        const mailSubject = this.selectedRowItem.ProjectCode + '/' + this.selectedRowItem.ClientLegalEntity + ': Confirmed line item for billing';
        let mailContent = this.mailContentRes[0].retItems[0].Content;
        mailContent = this.replaceContent(mailContent, "@@Val1@@", "Hello Invoice Team");
        mailContent = this.replaceContent(mailContent, "@@Val2@@", this.selectedRowItem.ProjectCode);
        mailContent = this.replaceContent(mailContent, "@@Val3@@", this.selectedRowItem.ClientLegalEntity);
        mailContent = this.replaceContent(mailContent, "@@Val4@@", this.selectedRowItem.PONumber);
        mailContent = this.replaceContent(mailContent, "@@Val5@@", this.datePipe.transform(this.confirmHourlybased_form.value.approvalDate, 'MMM dd, yyyy'));
        mailContent = this.replaceContent(mailContent, "@@Val6@@", this.selectedRowItem.Currency + ' ' + (this.selectedRowItem.Rate * this.selectedRowItem.HoursSpent));
        mailContent = this.replaceContent(mailContent, "@@Val7@@", this.selectedRowItem.SOWCode);

        // Propose Closure Mail Content
        const pcmailSubject = this.selectedRowItem.ProjectCode + '(' + this.selectedRowItem.Id + '): ' + 'Propose closure for project';
        let pcmailContent = this.mailContentRes[1].retItems[0].Content;
        pcmailContent = this.replaceContent(pcmailContent, "@@Val3@@", 'All');
        pcmailContent = this.replaceContent(pcmailContent, "@@Val1@@", this.selectedRowItem.ProjectCode);
        pcmailContent = this.replaceContent(pcmailContent, "@@Val2@@", this.selectedRowItem.ClientLegalEntity);
        pcmailContent = this.replaceContent(pcmailContent, "@@Val5@@", this.selectedRowItem.HoursSpent);
        pcmailContent = this.replaceContent(pcmailContent, "@@Val6@@", sharepointPageObject.webAbsoluteUrl + '/fd');

        // var ccUser = [];
        // ccUser.push(this.currentUserInfoData.Email);
        // let tos = this.getTosList();
        this.spServices.sendMail(this.getTosList('i').join(','), this.currentUserInfoData.Email, mailSubject, mailContent, this.getCCList('i').join(','));
        this.spServices.sendMail(this.getTosList('pc').join(','), this.currentUserInfoData.Email, pcmailSubject, pcmailContent, this.getCCList('pc').join(','));
        this.confirmationModal = false;
        this.reFetchData('confirm');
    }


    getTosList(type: string) {
        const itApprovers = this.groupITInfo.results;
        let arrayTo = [];
        if (type === 'i') {
            if (itApprovers.length) {
                for (const i in itApprovers) {
                    if (itApprovers[i].Email !== undefined && itApprovers[i].Email !== '') {
                        arrayTo.push(itApprovers[i].Email);
                    }
                }
            }
        } else if (type === 'pc') {
            // CS Member
            arrayTo = arrayTo.concat(this.fdDataShareServie.getCSMember(this.resCatEmails));
        }

        arrayTo = arrayTo.filter(this.onlyUnique);
        console.log('arrayTo ', arrayTo);
        return arrayTo;
    }

    getCCList(type: string) {
        let arrayCC = [];
        if (type === 'i') {
            // Current User
            arrayCC.push(this.currentUserInfoData.Email);
            // CS Member
            arrayCC = arrayCC.concat(this.fdDataShareServie.getCSMember(this.resCatEmails));
        } else if (type === 'pc') {
            // Current User
            arrayCC.push(this.currentUserInfoData.Email);
        }
        arrayCC = arrayCC.filter(this.onlyUnique);
        console.log('arrayCC ', arrayCC);
        return arrayCC;
    }

    onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    reFetchData(type: string) {
        setTimeout(async () => {
            if (type !== 'edit') {
                this.purchaseOrdersList = [];
                this.cleData = [];
                this.projectInfoData = [];
                // Refetch PO/CLE Data
                await this.fdDataShareServie.getClePO('hourly');
                // Fetch latest PO & CLE
                // this.poInfo();
                // this.cleInfo();
                // this.projectInfo();
                // this.getPCForSentToAMForApproval();
            } else {
                this.getPCForSentToAMForApproval();
            }
            this.isPSInnerLoaderHidden = true;
        }, 300);
    }

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
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
        if (this.hourlyBasedRes.length && this.isOptionFilter) {
            const obj = {
                tableData: this.hourlyTable,
                colFields: this.hourlyBasedColArray
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
