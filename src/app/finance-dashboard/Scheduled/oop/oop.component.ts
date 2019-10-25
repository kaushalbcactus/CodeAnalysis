import { Component, OnInit, ViewChild, OnDestroy, HostListener, ApplicationRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { Message, ConfirmationService, SelectItem, MessageService } from 'primeng/api';
import { Calendar, DataTable } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { formatDate, DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-oop',
    templateUrl: './oop.component.html',
    styleUrls: ['./oop.component.css']
})
export class OopComponent implements OnInit, OnDestroy {
    tempClick: any;
    oopBasedRes: any = [];
    oopBasedCols: any[];
    msgs: Message[] = [];

    // Edit Deliverable Form
    editOop_form: FormGroup;

    // Address Type
    addressTypes: any = [];

    // Loadder
    isPSInnerLoaderHidden: boolean = false;

    // Right side bar
    rightSideBar: boolean = false;

    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;
    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false
    };
    minScheduleDate: Date = new Date();

    // Date Range
    rangeDates: Date[];

    // List of Subscribers 
    private subscription: Subscription = new Subscription();
    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;
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
    @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
    @ViewChild('oop', { static: false }) oopTable: DataTable;
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
        private spOperationsService: SPOperationService,
        private cdr: ChangeDetectorRef,
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

    async ngOnInit() {
        // SetDefault Values
        if (this.fdDataShareServie.scheduleDateRange.startDate) {
            this.DateRange = this.fdDataShareServie.scheduleDateRange;
        } else {
            const next3Months = this.commonService.getNextWorkingDay(65, new Date());
            const last1Year = this.commonService.getLastWorkingDay(260, new Date());
            this.rangeDates = [last1Year, next3Months];
            this.DateRange.startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
            this.DateRange.endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
            this.fdDataShareServie.scheduleDateRange = this.DateRange;
        }

        this.createANBCols();
        // this.getApprovedNonBillable();
        this.createEditDeliverableFormField();

        // Get Projects
        await this.projectInfo();
        this.poInfo();
        this.projectContacts();
        this.resourceCInfo();
        // GEt Client Legal Entity
        // this.cleInfo();

        // get OOP Invocies
        this.getRequiredData();

        // Load address type
        this.getAddressType();
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
    }
    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
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
                console.log('this.projectInfoData ', this.projectInfoData);
            }
        }))
    }

    // Purchase Order Number
    purchaseOrdersList: any = [];
    poInfo() {
        this.subscription.add(this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
            }
        }))
    }

    // Project COntacts
    projectContactsData: any = [];
    projectContacts() {
        this.subscription.add(this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
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



    getAddressType() {
        this.addressTypes = [
            { label: 'Client', value: 'Client' },
            { label: 'POC', value: 'POC' },
        ]
    }

    createEditDeliverableFormField() {
        this.editOop_form = this.fb.group({
            ProjectCode: [{ value: '', disabled: true }, Validators.required],
            PONumber: [{ value: '', disabled: true }, Validators.required],
            ScheduledType: [{ value: '', disabled: true }, Validators.required],
            Amount: [{ value: '', disabled: true }, Validators.required],
            Currency: [{ value: '', disabled: true }, Validators.required],
            ScheduledDate: ['', Validators.required],
            POCName: ['', Validators.required],
            AddressType: ['', Validators.required],
        })
    }

    createANBCols() {
        this.oopBasedCols = [
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'SOWValue', header: 'SOW Code/ Name', visibility: true },
            { field: 'ProjectMileStone', header: 'Project Milestone', visibility: true },
            { field: 'POValues', header: 'PO Number/ Name', visibility: true },
            { field: 'ClientName', header: 'Client LE', visibility: true },
            { field: 'ScheduledDateFormat', header: 'Scheduled Date', visibility: false },
            { field: 'ScheduledDate', header: 'Scheduled Date', visibility: true, exportable: false },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POCName', header: 'POC Name', visibility: true },

            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'SOWCode', header: 'SOW Code', visibility: false },
            { field: 'POName', header: 'PO Name', visibility: false },
            { field: 'PONumber', header: 'PO Number', visibility: false },
            { field: 'Notes', header: 'Notes', visibility: false },
            { field: 'AddressType', header: 'Address Type', visibility: false },
            { field: 'Status', header: 'Status', visibility: false },
            // { field: 'TaggedDate', header: 'Tagged Date', visibility: false },
            // { field: 'ProformaLookup', header: 'Proforma Lookup', visibility: false },
            { field: 'ScheduleType', header: 'Schedule Type', visibility: false },
            // { field: 'InvoiceLookup', header: 'Invoice Lookup', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'Modified', header: 'Modified Date', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },
            { field: 'PracticeArea', header: 'Practice Area', visibility: false },
            { field: 'CS', header: 'CS', visibility: false },

            { field: '', header: '', visibility: true }
        ];
    }

    async getRequiredData() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // const batchContents = new Array();
        // const batchGuid = this.spServices.generateUUID();

        const groups = this.globalService.userInfo.Groups.results.map(x => x.LoginName);
        let isManager = false;
        if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1) {
            isManager = true;
        }
        const obj = Object.assign({}, isManager ? this.fdConstantsService.fdComponent.invoicesOOP :
            this.fdConstantsService.fdComponent.invoicesOOPCS);
        obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        if (!isManager) {
            obj.filter = obj.filter.replace('{{UserID}}', this.globalService.currentUser.userId.toString());
        }
        const res = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, obj);
        // let obj = Object.assign({}, this.fdConstantsService.fdComponent.invoicesOOP);
        // obj.filter = obj.filter.replace('{{StartDate}}', this.DateRange.startDate).replace('{{EndDate}}', this.DateRange.endDate);
        // const invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.InvoiceLineItems.name + '', obj);
        // // this.spServices.getBatchBodyGet(batchContents, batchGuid, invoicesQuery);

        // let endPoints = [invoicesQuery];
        // let userBatchBody = '';
        // for (let i = 0; i < endPoints.length; i++) {
        //     const element = endPoints[i];
        //     this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        // }
        // batchContents.push('--batch_' + batchGuid + '--');
        // userBatchBody = batchContents.join('\r\n');
        // let arrResults: any = [];
        // const res = await this.spServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        const arrResults = res.length ? res : [];
        // if (arrResults.length) {
        // for (let j = 0; j < arrResults.length; j++) {
        //     const element = arrResults[j];
        this.isPSInnerLoaderHidden = true;
        this.formatData(arrResults);
        // }
        // }
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
        this.oopBasedRes = [];
        this.selectedAllRowsItem = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            // let resCInfo = await this.fdDataShareServie.getResDetailById(this.rcData, element);
            // if (resCInfo && resCInfo.hasOwnProperty('UserName') && resCInfo.UserName.hasOwnProperty('Title')) {
            //     resCInfo = resCInfo.UserName.Title
            // }
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(element.SOWCode);
            let sowCode = element.SOWCode ? element.SOWCode : '';
            let sowName = sowItem.Title ? sowItem.Title : '';
            let sowcn = sowCode + ' ' + sowName;
            if (sowCode && sowName) {
                sowcn = sowCode + ' / ' + sowName;
            }
            let poItem = await this.getPONumber(element);
            let pnumber = poItem.Number ? poItem.Number : '';
            let pname = poItem.Name ? poItem.Name : '';
            if (pnumber === 'NA') {
                pnumber = '';
            }
            let ponn = pnumber + ' ' + pname;
            if (pname && pnumber) {
                ponn = pnumber + ' / ' + pname;
            }
            let POValues = ponn;

            let piInfo = await this.getMilestones(element);
            this.oopBasedRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: element.SOWCode,
                SOWName: sowItem.Title,
                SOWValue: sowcn,
                ProjectMileStone: piInfo.Milestone,
                POValues: POValues,
                PONumber: poItem.Number,
                PO: element.PO,
                POCId: element.MainPOC,
                ClientName: piInfo.ClientLegalEntity,
                ScheduledDate: new Date(this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy')),// this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                ScheduledDateFormat: this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                Amount: element.Amount,
                Currency: element.Currency,
                POCName: this.getPOCName(element),
                AddressType: element.AddressType,
                showMenu: this.showMenu(element),

                CS: this.getCSDetails(element),
                PracticeArea: this.getPracticeArea(element).BusinessVertical,
                POName: poItem.Name,
                TaggedDate: element.TaggedDate,
                Status: element.Status,
                ProformaLookup: element.ProformaLookup,
                ScheduleType: element.ScheduleType,
                InvoiceLookup: element.InvoiceLookup,
                Template: element.Template,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            })
        }
        this.oopBasedRes = [...this.oopBasedRes];
        this.createColFieldValues(this.oopBasedRes);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    // Project Current Milestones
    getMilestones(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x;
            }
        })
        return found ? found : '';
    }

    // Project Current Milestones
    getPracticeArea(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x;
            }
        })
        return found ? found : '';
    }

    // Project PO
    getPONumber(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        })
        return found ? found : '';
    }

    getPOCName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        // return found ? found.FName + ' ' + found.LName : ''
        return found ? found.FullName : ''
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

    getCSDetails(res) {
        if (res.hasOwnProperty('CS') && res.CS.hasOwnProperty('results') && res.CS.results.length) {
            let title = [];
            for (let i = 0; i < res.CS.results.length; i++) {
                const element = res.CS.results[i];
                title.push(element.Title);
            }
            return title.toString();
        } else {
            return '';
        }
    }


    oopColArray = {
        ProjectCode: [],
        SOWValue: [],
        ProjectMileStone: [],
        POValues: [],
        ClientName: [],
        ScheduledDate: [],
        Amount: [],
        Currency: [],
        POC: [],
    }

    createColFieldValues(resArray) {
        this.oopColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.oopColArray.SOWValue = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWValue, value: a.SOWValue }; return b; }).filter(ele => ele.label)));
        this.oopColArray.ProjectMileStone = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }).filter(ele => ele.label)));
        this.oopColArray.POValues = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POValues, value: a.POValues }; return b; }).filter(ele => ele.label)));
        this.oopColArray.ClientName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientName, value: a.ClientName }; return b; }).filter(ele => ele.label)));
        this.oopColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.oopColArray.POC = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POCName, value: a.POCName }; return b; }).filter(ele => ele.label)));
        const scheduledDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ScheduledDate, "MMM dd, yyyy"), value: a.ScheduledDate }; return b; }).filter(ele => ele.label)));
        this.oopColArray.ScheduledDate = scheduledDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);
        const amount = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }).filter(ele => ele.label));
        this.oopColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label')
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
        this.confirmationService.confirm({
            message: 'Are you sure that you want to confirm the invoice scheduled for the project?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            key: 'oopConfirm',
            accept: () => {
                // this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'You have Confirmed' }];
                // Call server service here
                this.onSubmit('confirmInvoice');
            },
            reject: () => {
                this.msgs = [{ severity: 'info', summary: 'Cancel', detail: 'You have canceled' }];
            }
        });
    }

    items: any[];
    deliverableDialog: any = {
        title: '',
        text: ''
    }

    getPO(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId) {
                return x;
            }
        })
        return found ? found : ''
    }
    // Open popups
    openPopup(data, popUpData) {
        this.items = [];
        console.log('Row data  ', data);
        const retPO = this.getPO(data.PO);
        const date = new Date(data.ScheduledDate);
        const currentDate = new Date();
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        const currentDay = new Date(this.datePipe.transform(new Date(), "yyyyMMdd"));
        if (date >= last3Days && date < lastDay && retPO && new Date(retPO.POExpiryDate) >= new Date()) {
            // if (date > last3Days && retPO && new Date(retPO.POExpiryDate) >= new Date()) {
            this.items.push({ label: 'Confirm Invoice', command: (e) => this.openMenuContent(e, data) });
        } else {
            if (!(date >= last3Days && date <= lastDay)) {
                this.messageService.add({ key: 'oopInfoToast', severity: 'info', summary: 'Info message', detail: 'To confirm the line item, scheduled Date should be between last 3 working days & last date of the current month.', life: 4000 })
            } else if (!retPO) {
                this.messageService.add({ key: 'oopInfoToast', severity: 'info', summary: 'Info message', detail: 'PO not available for the selected line item.', life: 4000 })
            } else if (!(new Date(retPO.POExpiryDate) >= new Date())) {
                this.messageService.add({ key: 'oopInfoToast', severity: 'info', summary: 'Info message', detail: 'PO expired on' + this.datePipe.transform(retPO.POExpiryDate, 'MMM dd, yyyy'), life: 4000 })
            }
        }
        this.items.push({ label: 'Edit Invoice', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'View Project Details', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'Details', command: (e) => this.openMenuContent(e, data) });
        this.items.push({ label: 'Show History', command: (e) => this.openMenuContent(e, data) }); // Added by kaushal on 10.6.19

    }

    deliverableModal: boolean = false;
    selectedRowItem: any;
    openMenuContent(event, data) {
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.deliverableDialog.title = event.item.label;
        if (this.deliverableDialog.title.toLowerCase() === 'confirm invoice') {
            this.confirm1();
            this.getApproveExpenseMailContent('ConfirmInvoice');
            this.getPIByTitle(this.selectedRowItem);
        } else if (this.deliverableDialog.title.toLowerCase() === 'edit invoice') {
            // this.deliverableDialog.text = event.item.label.replace('Expense', '');
            this.deliverableModal = true;
            this.updateInvoice();
            this.getPOCNamesForEditInv(data);
        } else if (this.deliverableDialog.title.toLowerCase() === 'view project details') {
            this.goToProjectDetails(this.selectedRowItem)
        } else if (this.deliverableDialog.title.toLowerCase() === 'show history') {
            // Added by kaushal on 10.6.19
            this.timeline.showTimeline(data.Id, 'FD', 'InvoiceLineItems');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    // Go to Project Details Page
    goToProjectDetails(data: any) {
        console.log(data);
        window.open(this.globalService.sharePointPageObject.webAbsoluteUrl + '/projectmanagement#/projectMgmt/allProjects?ProjectCode=' + data.ProjectCode);

    }

    // Update Form
    updateInvoice() {
        const format = 'dd MMM , yyyy';
        const myDate = new Date(this.selectedRowItem.ScheduledDate);
        const locale = 'en-IN';
        const formattedDate = formatDate(myDate, format, locale);
        console.log('formatted Date ', formattedDate);
        this.editOop_form.patchValue({
            ProjectCode: this.selectedRowItem.ProjectCode,
            PONumber: this.selectedRowItem.PONumber,
            ScheduledType: 'oop',
            Amount: this.selectedRowItem.Amount,
            Currency: this.selectedRowItem.Currency,
            ScheduledDate: formattedDate,
            AddressType: { label: this.selectedRowItem.AddressType, value: this.selectedRowItem.AddressType }
        });
        const last3Days = this.commonService.getLastWorkingDay(3, new Date());
        this.minScheduleDate = last3Days;
    }

    listOfPOCNames: SelectItem[];
    getPOCNamesForEditInv(rowItem: any) {
        this.listOfPOCNames = [];
        var rowVal: any = {}
        this.projectContactsData.filter((item) => {
            if (item.ClientLegalEntity === rowItem.ClientName) {
                this.listOfPOCNames.push(item);
                if (item.ID === rowItem.POCId) {
                    rowVal = item;
                }
            }
        });
        console.log('this.listOfPOCNames ', this.listOfPOCNames);
        if (Object.keys(rowVal).length) {
            this.editOop_form.patchValue({
                POCName: rowVal
            });
        }
    }

    getPOCItemByName(poc: any) {
        let found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        // return found ? found.FName + ' ' + found.LName : ''
        return found ? found : ''
    }

    get isValidEditDeliverableForm() {
        return this.editOop_form.controls;
    }

    cancelFormSub(formType) {
        if (formType === 'editDeliverable') {
            this.editOop_form.reset();
            this.deliverableModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        const batchUrl = [];
        if (type === 'confirmInvoice') {
            // console.log('form is submitting .....');
            this.isPSInnerLoaderHidden = false;
            const iliData = {
                Status: 'Confirmed'
            };
            iliData['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            // const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.selectedRowItem.Id);
            // let data = [
            //     {
            //         objData: obj,
            //         endpoint: endpoint,
            //         requestPost: false
            //     }
            // ]
            const invObj = Object.assign({}, this.queryConfig);
            invObj.url = this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, +this.selectedRowItem.Id);
            invObj.listName = this.constantService.listNames.InvoiceLineItems.name;
            invObj.type = 'PATCH';
            invObj.data = iliData;
            batchUrl.push(invObj);
            this.submitForm(batchUrl, type);
        } else if (type === 'editDeliverable') {
            // console.log('form is submitting .....', this.editOop_form.value);
            if (this.editOop_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            const iliData = {
                AddressType: this.editOop_form.value.AddressType.value,
                ScheduledDate: this.editOop_form.value.ScheduledDate,
                MainPOC: this.editOop_form.value.POCName.ID
            };
            iliData['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            const invObj = Object.assign({}, this.queryConfig);
            invObj.url = this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, +this.selectedRowItem.Id);
            invObj.listName = this.constantService.listNames.InvoiceLineItems.name;
            invObj.type = 'PATCH';
            invObj.data = iliData;
            batchUrl.push(invObj);
            // const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.selectedRowItem.Id);;
            // let data = [
            //     {
            //         objData: obj1,
            //         endpoint: endpoint,
            //         requestPost: false
            //     }
            // ]
            this.submitForm(batchUrl, type);
        }
    }

    batchContents: any = [];
    async submitForm(batchUrl, type: string) {
        // console.log('Form is submitting');

        // this.batchContents = [];
        // const batchGuid = this.spServices.generateUUID();
        // const changeSetId = this.spServices.generateUUID();

        // // const batchContents = this.spServices.getChangeSetBody1(changeSetId, endpoint, JSON.stringify(obj), true);
        // console.log(' dataEndpointArray ', dataEndpointArray);
        // dataEndpointArray.forEach(element => {
        //     if (element)
        //         this.batchContents = [...this.batchContents,
        //  ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
        // });

        // console.log("this.batchContents ", JSON.stringify(this.batchContents));

        // this.batchContents.push('--changeset_' + changeSetId + '--');
        // const batchBody = this.batchContents.join('\r\n');
        // const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
        // batchBodyContent.push('--batch_' + batchGuid + '--');
        // const sBatchData = batchBodyContent.join('\r\n');
        // const res = this.spServices.getFDData(batchGuid, sBatchData); //.subscribe(res => {
        await this.spServices.executeBatch(batchUrl);
        // const arrResults = res;
        // console.log('--oo ', arrResults);
        if (type === 'confirmInvoice') {
            this.messageService.add({
                key: 'oopSuccessToast', severity: 'success',
                summary: 'Success message', detail: 'Invoice is Confirmed.', life: 2000
            });
            this.sendCreateExpenseMail();
            this.reFetchData();
        } else if (type === 'editDeliverable') {
            this.messageService.add({
                key: 'oopSuccessToast', severity: 'success',
                summary: 'Success message', detail: 'Invoice Updated.', life: 2000
            });
            this.cancelFormSub('editDeliverable');
            this.reFetchData();
        }
        this.isPSInnerLoaderHidden = true;

        // });
    }

    // Mail Content
    mailContentRes: any;
    async getApproveExpenseMailContent(type) {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        const objMailContent = Object.assign({}, this.fdConstantsService.fdComponent.mailContent);
        objMailContent.filter = objMailContent.filter.replace('{{MailType}}', type);
        const res = await this.spServices.readItems(this.constantService.listNames.MailContent.name, objMailContent);
        // let mailContentEndpoint = {
        //     filter: this.fdConstantsService.fdComponent.mailContent.filter.replace("{{MailType}}", type),
        //     select: this.fdConstantsService.fdComponent.mailContent.select,
        //     top: this.fdConstantsService.fdComponent.mailContent.top,
        // }
        // let obj = [{
        //     url: this.spOperationsService.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
        //     type: 'GET',
        //     listName: this.constantService.listNames.MailContent.name
        // }]
        // const res = await this.spOperationsService.executeBatch(obj);
        this.mailContentRes = res.length ? res[0] : {};
        // console.log('Approve Mail Content res ', this.mailContentRes);
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
        var mailSubject = this.selectedRowItem.ProjectCode + "/" + this.selectedRowItem.ClientName + ": Confirmed line item for billing";

        let mailContent = this.mailContentRes.Content;
        mailContent = this.replaceContent(mailContent, "@@Val1@@", "Hello Invoice Team");
        mailContent = this.replaceContent(mailContent, "@@Val2@@", this.selectedRowItem.ProjectCode);
        mailContent = this.replaceContent(mailContent, "@@Val3@@", this.selectedRowItem.ClientName);
        mailContent = this.replaceContent(mailContent, "@@Val4@@", this.selectedRowItem.PONumber);
        mailContent = this.replaceContent(mailContent, "@@Val5@@", this.datePipe.transform(this.selectedRowItem.ScheduledDate, 'MMM dd, yyyy'));
        mailContent = this.replaceContent(mailContent, "@@Val6@@", this.selectedRowItem.Currency + ' ' + this.selectedRowItem.Amount);
        mailContent = this.replaceContent(mailContent, "@@Val7@@", this.selectedRowItem.SOWCode);

        var ccUser = [];
        ccUser.push(this.currentUserInfoData.Email);
        let tos = this.getTosList();
        this.spOperationsService.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
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

    isOptionFilter: boolean;
    optionFilter(event: any) {
        if (event.target.value) {
            this.isOptionFilter = false;
        }
    }

    ngAfterViewChecked() {
        if (this.oopBasedRes.length && this.isOptionFilter) {
            let obj = {
                tableData: this.oopTable,
                colFields: this.oopColArray
            }
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
