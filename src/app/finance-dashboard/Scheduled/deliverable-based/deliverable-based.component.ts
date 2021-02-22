import { Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { formatDate, DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { TimelineHistoryComponent } from './../../../timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { EditInvoiceDialogComponent } from '../../edit-invoice-dialog/edit-invoice-dialog.component';
import { Table } from 'primeng/table';
import { Calendar } from 'primeng/calendar';

@Component({
    selector: 'app-deliverable-based',
    templateUrl: './deliverable-based.component.html',
    styleUrls: ['./deliverable-based.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DeliverableBasedComponent implements OnInit, OnDestroy {
    constructor(
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        public fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private commonService: CommonService,
        private cdr: ChangeDetectorRef,
        public dialogService: DialogService,
        private platformLocation: PlatformLocation,
        private locationStrategy: LocationStrategy,
        private readonly _router: Router,
        _applicationRef: ApplicationRef,
        zone: NgZone,
    ) {
        this.subscription.add(this.fdDataShareServie.getScheduleDateRange().subscribe(date => {
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
    deliverableBasedRes: any = [];
    deliverableBasedCols: any[];

    // Address Type
    addressTypes: any = [];

    // Edit Deliverable Form
    editDeliverable_form: FormGroup;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;

    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };
    minScheduleDate: Date = new Date();
    minimumDate = new Date();
    // Loadder

    // Right side bar
    rightSideBar: boolean = false;

    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;

    // Date Range
    rangeDates: Date[];

    DateRange: any = {
        startDate: '',
        endDate: '',
    };
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    // List of Subscribers
    private subscription: Subscription = new Subscription();

    @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
    @ViewChild('db', { static: false }) deliverableTable: Table;
    // Project Info
    projectInfoData: any = [];

    // Purchase Order Number
    purchaseOrdersList: any = [];

    // Project COntacts
    projectContactsData: any = [];

    // Client Legal Entity
    cleData: any = [];

    // Resource Categorization
    rcData: any = [];

    deliverableBasedColArray = {
        ProjectCode: [],
        ShortTitle: [],
        SOWValue: [],
        ProjectMileStone: [],
        POValues: [],
        ClientName: [],
        ScheduledDate: [],
        Amount: [],
        Currency: [],
        POCName: []
    };

    // CLick on Table Check box to Select All Row Item
    selectedAllRowsItem: any = [];
    items: any[];
    deliverableDialog: any = {
        title: '',
        text: ''
    };

    deliverableModal: boolean = false;
    selectedRowItem: any;

    listOfPOCNames: SelectItem[];

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

        this.addressTypes = this.fdConstantsService.fdComponent.addressTypes;
        // SetDefault Values
        if (this.fdDataShareServie.scheduleDateRange.startDate) {
            this.DateRange = this.fdDataShareServie.scheduleDateRange;
        } else {
            const next3Months = this.commonService.getNextWorkingDay(65, new Date());
            const last1Year = this.commonService.getLastWorkingDay(260, new Date());
            this.rangeDates = [last1Year, next3Months];
            this.DateRange.startDate = new Date(this.datePipe.transform(this.rangeDates[0], 'yyyy-MM-dd') + ' 00:00:00').toISOString();
            this.DateRange.endDate = new Date(this.datePipe.transform(this.rangeDates[1], 'yyyy-MM-dd') + ' 23:59:00').toISOString();
            this.fdDataShareServie.scheduleDateRange = this.DateRange;
        }

        this.createDBICols();
        // this.getApprovedNonBillable();
        // this.createEditDeliverableFormField();

        // Get Projects
        await this.projectInfo();
        // GEt Client Legal Entity
        this.cleInfo();
        this.poInfo();
        this.projectContacts();
        this.resourceCInfo();

        // Get Deliverable-based Invoices
        this.getRequiredData();
        // For Mail
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        console.log('this.currentUserInfoData  ', this.currentUserInfoData);
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        console.log('this.groupInfo  ', this.groupInfo);
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
        console.log('this.groupITInfo  ', this.groupITInfo);
    }


    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }
    async projectInfo() {
        // Check PI list
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        const data = await this.fdDataShareServie.checkProjectsAvailable();

        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
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

    createDBICols() {
        this.deliverableBasedCols = [
            { field: 'ProjectCode', header: 'Project Code', visibility: true, Type: 'string', dbName: 'ProjectCode', options: [] },
            { field: 'ProjectTitle', header: 'Project Title', visibility: false },
            { field: 'ShortTitle', header: 'Short Title', visibility: true, Type: 'string', dbName: 'ShortTitle', options: [] },
            { field: 'SOWValue', header: 'SOW Code/ Name', visibility: true, Type: 'string', dbName: 'SOWValue', options: [] },
            { field: 'ProjectMileStone', header: 'Project Milestone', visibility: true, Type: 'string', dbName: 'ProjectMileStone', options: [] },
            { field: 'POValues', header: 'PO Number/ Name', visibility: true, Type: 'string', dbName: 'POValues', options: [] },
            { field: 'ClientName', header: 'Client', visibility: true, Type: 'string', dbName: 'ClientName', options: [] },
            { field: 'ScheduledDateFormat', header: 'Scheduled Date', visibility: false },
            { field: 'ScheduledDate', header: 'Scheduled Date', visibility: true, exportable: false, Type: 'datetime', dbName: 'ScheduledDate', options: [] },
            { field: 'Amount', header: 'Amount', visibility: true, Type: 'number', dbName: 'Amount', options: [] },
            { field: 'Currency', header: 'Currency', visibility: true, Type: 'string', dbName: 'Currency', options: [] },
            { field: 'POCName', header: 'POC Name', visibility: true, Type: 'string', dbName: 'POCName', options: [] },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'POName', header: 'PO Name', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'AddressType', header: 'Address Type', visibility: false },
            // { field: 'TaggedDate', header: 'Tagged Date', visibility: false },
            { field: 'Status', header: 'Status', visibility: false },
            { field: 'ScheduleType', header: 'Schedule Type', visibility: false },
            // { field: 'InvoiceLookup', header: 'Invoice Lookup', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'Modified', header: 'Modified Date', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },
            { field: 'PracticeArea', header: 'Practice Area', visibility: false },
            { field: 'CS', header: 'CS', visibility: false },
        ];
    }

    async getRequiredData() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        this.deliverableBasedRes = [];
        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        let isManager = false;
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1) {
            isManager = true;
        }
        const obj = Object.assign({}, isManager ? this.fdConstantsService.fdComponent.invoicesDel :
            this.fdConstantsService.fdComponent.invoicesDelCS);
        obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        if (!isManager) {
            obj.filter = obj.filter.replace('{{UserID}}', this.globalService.currentUser.userId.toString());
        }
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-DeliverableBased', 'getRequiredData', 'GET');
        const res = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, obj);
        const arrResults = res.length ? res : [];
        this.formatData(arrResults);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    showMenu(element) {
        const project = this.projectInfoData.find((x) => {
            if (x.ProjectCode === element.Title) {
                return x;
            }
        });

        if (project) {
            return true;
        } else {
            return false;
        }
    }
    async formatData(data: any[]) {
        this.deliverableBasedRes = [];
        this.selectedAllRowsItem = [];
        for (const element of data) {
            const piInfo = await this.getMilestones(element);
            const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(element.SOWCode);
            const sowCode = element.SOWCode ? element.SOWCode : '';
            const sowName = sowItem.Title ? sowItem.Title : '';
            let sowcn = sowCode + ' ' + sowName;
            if (sowCode && sowName) {
                sowcn = sowCode + ' / ' + sowName;
            }
            const poItem = await this.getPONumber(element);
            let pnumber = poItem.Number ? poItem.Number : '';
            const pname = poItem.Name ? poItem.Name : '';
            if (pnumber === 'NA') {
                pnumber = '';
            }
            let ponn = pnumber + ' ' + pname;
            if (pname && pnumber) {
                ponn = pnumber + ' / ' + pname;
            }
            const POValues = ponn;

            this.deliverableBasedRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                ProjectTitle: piInfo.Title ? piInfo.Title : '',
                ShortTitle: piInfo && piInfo.WBJID ? piInfo.WBJID : '',
                SOWCode: element.SOWCode,
                SOWValue: sowcn,
                SOWName: sowItem.Title,
                ProjectMileStone: piInfo.Milestone,
                POValues: POValues,
                PONumber: poItem.Number,
                PO: element.PO,
                POCId: element.MainPOC,
                ClientName: piInfo.ClientLegalEntity, // this.getCLE(element),
                ScheduledDate: new Date(this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy')), //this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                ScheduledDateFormat: this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                Amount: element.Amount,
                Currency: element.Currency,
                POCName: this.getPOCName(element),
                AddressType: element.AddressType,
                showMenu: this.showMenu(element),

                CS: this.fdDataShareServie.getCSDetails(element),
                PracticeArea: this.getPracticeArea(element).BusinessVertical,
                POName: poItem.NameST,
                TaggedDate: element.TaggedDate,
                Status: element.Status,
                ProformaLookup: element.ProformaLookup,
                ScheduleType: element.ScheduleType,
                InvoiceLookup: element.InvoiceLookup,
                Template: element.Template,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            });
        }
        this.deliverableBasedRes = [...this.deliverableBasedRes];
        this.deliverableBasedCols = this.commonService.MainfilterForTable(this.deliverableBasedCols, this.deliverableBasedRes);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // this.createColFieldValues(this.deliverableBasedRes);
    }

    // Project PO
    getPONumber(poId) {
        const found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        });
        return found ? found : '';
    }

    getPO(poId) {
        const found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId) {
                return x;
            }
        });
        return found ? found : '';
    }

    getPOCName(poc: any) {
        const found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        });
        return found ? found.FName + ' ' + found.LName : '';
    }

    // Project Current Milestones
    getMilestones(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x;
            }
        });
        return found ? found : '';
    }

    // Project Current Milestones
    getPracticeArea(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x;
            }
        });
        return found ? found : '';
    }

    // createColFieldValues(resArray) {
    //     this.deliverableBasedColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.ShortTitle = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ShortTitle, value: a.ShortTitle }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.SOWValue = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.SOWValue, value: a.SOWValue }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.ProjectMileStone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.POCName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.POCName, value: a.POCName }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.ClientName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ClientName, value: a.ClientName }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.POValues = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.POValues, value: a.POValues }; return b; }).filter(ele => ele.label)));

    //     const scheduledDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { const b = { label: this.datePipe.transform(a.ScheduledDate, 'MMM dd, yyyy'), value: a.ScheduledDate }; return b; }).filter(ele => ele.label)));
    //     this.deliverableBasedColArray.ScheduledDate = scheduledDate.map(a => { const b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
    //     const amount = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
    //     this.deliverableBasedColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label');
    // }

    // uniqueArrayObj(array: any) {
    //     let sts: any = '';
    //     return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
    //         return {
    //             label: label1,
    //             value: array.find(s => s.label === label1).value
    //         };
    //     });
    // }

    onRowSelect(event) {
        console.log(this.selectedAllRowsItem);
    }

    onRowUnselect(event) {
        console.log(this.selectedAllRowsItem);
    }

    selectAllRows() {
        console.log('in selectAllRows ', this.selectedAllRowsItem);
    }

    confirm1() {
        this.commonService.confirmMessageDialog('Confirmation', 'Are you sure that you want to confirm the invoice scheduled for the project?', null, ['Yes', 'No'], false).then(async Confirmation => {
            if (Confirmation === 'Yes') {
                // Call server service here
                this.onSubmit('confirmInvoice');
            }
            else if (Confirmation === 'No') {
                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'You have Cancelled', false);
            }
        });
    }
    // Open popups
    openPopup(data, popUpData) {
        this.items = [];
        console.log('Row data  ', data);
        // console.log('ClientName   ', data.data.ClientName);
        const retPO = this.getPO(data.PO);
        const date = new Date(data.ScheduledDate);
        const currentDate = new Date();
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        const projectData = this.projectInfoData.find(e => e.ProjectCode === data.ProjectCode);
        const todaysDateTimeZero = new Date();
        todaysDateTimeZero.setHours(0, 0, 0, 0);
        if (date >= last3Days && date < lastDay && retPO && new Date(retPO.POExpiryDate) >= todaysDateTimeZero &&
            (projectData && projectData.Status !== this.constantService.projectList.status.InDiscussion &&
                projectData.Status !== this.constantService.projectList.status.AwaitingCancelApproval &&
                projectData.Status !== this.constantService.projectList.status.OnHold)) {
            this.items.push({ label: 'Confirm Invoice', command: (e) => this.openMenuContent(e, data) });
        } else {
            if (projectData && (projectData.Status === this.constantService.projectList.status.InDiscussion ||
                projectData.Status === this.constantService.projectList.status.AwaitingCancelApproval ||
                projectData.Status === this.constantService.projectList.status.OnHold)) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Project status is ' + projectData.Status + ', so can not confirm the line item.', false);
            } else if (!(date >= last3Days && date <= lastDay)) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'To confirm the line item, scheduled Date should be between last 3 working days & last date of the current month.', false);
            } else if (!retPO) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'PO not available for the selected line item.', false);
            } else if (!(new Date(retPO.POExpiryDate) >= todaysDateTimeZero)) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'PO expired on ' + this.datePipe.transform(retPO.POExpiryDate, 'MMM dd, yyyy'), false);
            }
        }
        this.items.push({ label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'View Project Details', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'Show History', command: (e) => this.openMenuContent(e, data) });
    }
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.deliverableDialog.title = event.item.label;
        if (this.deliverableDialog.title.toLowerCase() === 'confirm invoice') {
            this.confirm1();
            this.getApproveExpenseMailContent(this.constantService.EMAIL_TEMPLATE_NAME.INVOICE_CONFIRM);
            this.getPIByTitle(this.selectedRowItem);
        } else if (this.deliverableDialog.title === 'Edit Line item') {
            const ref = this.dialogService.open(EditInvoiceDialogComponent, {
                header: 'Edit Line item',
                width: '75vw',
                data: {
                    InvoiceType: 'revenue',
                    projectContactsData: this.projectContactsData,
                    selectedRowItem: this.selectedRowItem,
                },
                contentStyle: { 'max-height': '80vh', 'overflow-y': 'auto' },
                closable: false,
            });
            ref.onClose.subscribe((editInvoice: any) => {
                if (editInvoice) {
                    const batchURL = this.fdDataShareServie.EditInvoiceDialogProcess('revenue', this.selectedRowItem, editInvoice)
                    this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-DeliverableBased', 'updateInvoiceLineItem', 'POST');
                    this.submitForm(batchURL, 'editInvoice');
                }
            });
        } else if (this.deliverableDialog.title.toLowerCase() === 'view project details') {
            this.goToProjectDetails(this.selectedRowItem);
        } else if (this.deliverableDialog.title.toLowerCase() === 'show history') {
            this.timeline.showTimeline(data.Id, 'FD', this.constantService.listNames.InvoiceLineItems.name);
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    // Go to Project Details Page
    goToProjectDetails(data: any) {
        window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/dashboard#/projectMgmt?ProjectCode=' + data.ProjectCode);
    }


    async onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        const batchUrl = [];
        const invoiceNumber = await this.getInvoiceNumber();
        if (type === 'confirmInvoice') {
            // console.log('form is submitting ..... for selected row Item i.e ', this.selectedRowItem);
            const iliData = {
                Status: 'Confirmed',
                AdditionalInfo: ''+invoiceNumber
            };
            iliData['__metadata'] = { type: this.constantService.listNames.InvoiceLineItems.type };
            const iliObj = Object.assign({}, this.queryConfig);
            iliObj.url = this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, +this.selectedRowItem.Id);
            iliObj.listName = this.constantService.listNames.InvoiceLineItems.name;
            iliObj.type = 'PATCH';
            iliObj.data = iliData;
            batchUrl.push(iliObj);
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-DeliverableBased', 'updateInvoiceLineItem', 'POST');
            this.submitForm(batchUrl, type);

        }
    }
    async getInvoiceNumber() {
        console.log(this.selectedRowItem);
        //Get the number of invoices against this project code.
        //Sort the invoices in ascending order and save the invoice number.
        //Invoice number should be saved in AdditionalInfo column of InvoicelineItems list.
        const getInvoiceLineItems = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItemByProject);
        getInvoiceLineItems.filter = getInvoiceLineItems.filter.replace(/{{ProjectCode}}/gi, this.selectedRowItem.ProjectCode);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-DeliverableBased', 'getInvoiceNumber', 'GET');
        const invoiceLineItemsResults = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, getInvoiceLineItems);
        if (invoiceLineItemsResults && invoiceLineItemsResults.length) {
            const customSortData = invoiceLineItemsResults.slice().sort(function (a, b) {
                const dateA = new Date(a.ScheduledDate).getTime();
                const dateB = new Date(b.ScheduledDate).getTime();
                return dateA - dateB;
            });
            return customSortData.findIndex(a => a.Id == this.selectedRowItem.Id) + 1;
        }
    }

    // batchContents: any = [];
    async submitForm(batchUrl, type: string) {
        await this.spServices.executeBatch(batchUrl);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        if (type === 'confirmInvoice') {
            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Invoice is Confirmed.', false);

            this.invoiceConfirmMail();
        } else if (type === 'editInvoice') {
            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Invoice Updated.', false);
            this.reFetchData();
        }

    }

    async getApproveExpenseMailContent(type) {
        const objMail = Object.assign({}, this.fdConstantsService.fdComponent.mailContent);
        objMail.filter = objMail.filter.replace('{{MailType}}', type);
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-DeliverableBased', 'GetEmailTemplate', 'GET');
        const res = await this.spServices.readItems(this.constantService.listNames.MailContent.name, objMail);
        this.mailContentRes = res.length ? res : [];
    }

    getPIByTitle(title) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === title.ProjectCode) {
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
            if (x.UserNamePG.ID === ele.ID) {
                return x;
            }
        });
        return found ? found : '';
    }

    replaceContent(mailContent, key, value) {
        return mailContent.replace(new RegExp(key, 'g'), value);
    }

    invoiceConfirmMail() {
        const mailSubject = this.selectedRowItem.ProjectCode + '/' + this.selectedRowItem.ClientName + ': Confirmed line item for billing';

        let mailContent = this.mailContentRes[0].ContentMT;
        mailContent = this.replaceContent(mailContent, '@@Val1@@', 'Hello Invoice Team');
        mailContent = this.replaceContent(mailContent, '@@Val2@@', this.selectedRowItem.ProjectCode);
        mailContent = this.replaceContent(mailContent, '@@Val3@@', this.selectedRowItem.ClientName);
        mailContent = this.replaceContent(mailContent, '@@Val4@@', this.selectedRowItem.PONumber);
        mailContent = this.replaceContent(mailContent, '@@Val5@@', this.datePipe.transform(this.selectedRowItem.ScheduledDate, 'MMM dd, yyyy'));
        mailContent = this.replaceContent(mailContent, '@@Val6@@', this.selectedRowItem.Currency + ' ' + this.selectedRowItem.Amount);
        mailContent = this.replaceContent(mailContent, '@@Val7@@', this.selectedRowItem.SOWCode);

        const ccUser = this.getCCList();
        // ccUser.push(this.currentUserInfoData.Email);
        const tos = this.getTosList();
        this.commonService.SetNewrelic('Finance-Dashboard', 'Schedule-DeliverableBased', 'invoiceConfirmMail', 'POST');
        this.spServices.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.reFetchData();
    }

    getTosList() {
        const itApprovers = this.groupITInfo.results;
        let arrayTo = [];
        if (itApprovers.length) {
            for (const i in itApprovers) {
                if (itApprovers[i].Email !== undefined && itApprovers[i].Email !== '') {
                    arrayTo.push(itApprovers[i].Email);
                }
            }
        }
        arrayTo = arrayTo.filter(this.onlyUnique);
        console.log('arrayTo ', arrayTo);
        return arrayTo;
    }

    getCCList() {
        let arrayCC = [];
        arrayCC.push(this.currentUserInfoData.Email);

        if (this.resCatEmails.length) {
            arrayCC = arrayCC.concat(this.fdDataShareServie.getCSMember(this.resCatEmails));
        }

        arrayCC = arrayCC.filter(this.onlyUnique);
        console.log('arrayCC ', arrayCC);
        return arrayCC;
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

    // @HostListener('document:click', ['$event'])
    // clickout(event) {
    //     if (event.target.className === 'pi pi-ellipsis-v') {
    //         if (this.tempClick) {
    //             this.tempClick.style.display = 'none';
    //             if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
    //                 this.tempClick = event.target.parentElement.children[0].children[0];
    //                 this.tempClick.style.display = '';
    //             } else {
    //                 this.tempClick = undefined;
    //             }
    //         } else {
    //             this.tempClick = event.target.parentElement.children[0].children[0];
    //             this.tempClick.style.display = '';
    //         }

    //     } else {
    //         if (this.tempClick) {
    //             this.tempClick.style.display = 'none';
    //             this.tempClick = undefined;
    //         }
    //     }
    // }

    // optionFilter(event: any) {
    //     if (event.target.value) {
    //         this.isOptionFilter = false;
    //     }
    // }

    // ngAfterViewChecked() {
    //     if (this.deliverableBasedRes.length && this.isOptionFilter) {
    //         const obj = {
    //             tableData: this.deliverableTable,
    //             colFields: this.deliverableBasedColArray
    //         };
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
