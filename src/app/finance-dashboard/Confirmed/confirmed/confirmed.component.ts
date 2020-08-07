import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, HostListener, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { Message, SelectItem } from 'primeng/api';
import { Calendar, Table, DialogService } from 'primeng';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { formatDate, DatePipe, PlatformLocation, LocationStrategy } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EditInvoiceDialogComponent } from '../../edit-invoice-dialog/edit-invoice-dialog.component';
import { AddUpdateProformaDialogComponent } from '../../add-update-proforma-dialog/add-update-proforma-dialog.component';

@Component({
    selector: 'app-confirmed',
    templateUrl: './confirmed.component.html',
    styleUrls: ['./confirmed.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class ConfirmedComponent implements OnInit, OnDestroy {
    yearRange: any;


    constructor(
        private fb: FormBuilder,
        private globalService: GlobalService,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private commonService: CommonService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private dialogService: DialogService,
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



    get isValidAddToProformaForm() {
        return this.addToProforma_form.controls;
    }
    tempClick: any;
    confirmedRes: any = [];
    confirmCols: any[];
    msgs: Message[] = [];

    // Proforma Templates & Address Type
    proformatTemplates: any = [];
    addressTypes: any = [];
    listOfproformaType: any = [];

    // Show Hide State
    isTemplate4US = false;

    // Edit Deliverable Form
    addToProforma_form: FormGroup;

    // Show Hide Request Modal
    showHideREModal = false;

    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };

    // PoBalance Obj
    po: any = {
        oopBalance: '',
        revenuBalance: ''
    };

    // Loader
    isPSInnerLoaderHidden = true;

    // Right side bar
    rightSideBar = false;
    confirmedILIarray: any = [];
    usStatesData: any = [];
    selectedPurchaseNumber: any;
    minProformaDate: Date = new Date();
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    @ViewChild('timelineRef', { static: false }) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', { static: false }) editorRef: EditorComponent;

    @ViewChild('cnf', { static: false }) confirmTable: Table;
    // List of Subscribers
    private subscription: Subscription = new Subscription();
    // Project Info
    projectInfoData: any = [];

    // Purchase Order Number
    purchaseOrdersList: any = [];

    // Project COntacts
    projectContactsData: any = [];

    // US States
    currencyData: any = [];

    // Client Legal Entity
    cleData: any = [];

    // Resource Categorization
    rcData: any = [];
    purchaseOrders: any = [];
    confirmedPOList: any = [];
    confirmedPOCList: any = [];

    matchedILIArray: any = [];
    selectedDDPO: any = {};

    confirmedInColArray = {
        ProjectCode: [],
        SOWCode: [],
        ProjectMileStone: [],
        POName: [],
        PONumber: [],
        ClientLegalEntity: [],
        ScheduledDate: [],
        ScheduleType: [],
        Amount: [],
        Currency: [],
        POCName: []
    };

    // On Row Selection
    // Row Selection Array
    selectedTotalAmt = 0;
    selectedRowItemData: any = [];
    uniqueST = true;
    selectedAllRowData: any[] = [];

    items: any[];
    confirmDialog: any = {
        title: '',
        text: ''
    };

    isHourlyProject = false;
    selectedRowItem: any;

    proformaModal = false;

    listOfPOCNames: SelectItem[];
    selectedPOItem: any;

    // Project PO
    poNames: any = [];

    batchContents: any = [];
    enterPOAmtMsg = false;

    isOptionFilter: boolean;

    async ngOnInit() {
        this.proformatTemplates = this.fdConstantsService.fdComponent.ProformaTemplates;
        this.yearRange = this.commonService.getyearRange();
        this.addressTypes = this.fdConstantsService.fdComponent.addressTypes;
        this.createANBCols();
        // this.getApprovedNonBillable();
        this.createAddToProformaFormField();

        // Address & Proforma type

        this.getProformaType();
        this.usStatesInfo();
        this.currencyInfo();


        // Get Projects
        await this.projectInfo();
        await this.cleInfo();
        // GEt PO data
        await this.poInfo();
        this.projectContacts();
        this.resourceCInfo();
        // Get Confirmed IonvoiceLineItems
        this.getRequiredData();

    }
    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }
    async projectInfo() {
        this.isPSInnerLoaderHidden = false;
        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();

        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                // console.log('PI Data ', this.projectInfoData);
            }
        }));
    }
    poInfo() {
        this.subscription.add(this.fdDataShareServie.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                // console.log('PO Data ', this.purchaseOrdersList);
            }
        }));
    }
    projectContacts() {
        this.subscription.add(this.fdDataShareServie.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                // console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
            }
        }));
    }


    getProformaType() {
        this.listOfproformaType = [
            { label: 'OOP', value: 'oop' },
            { label: 'Revenue', value: 'revenue' },
        ];
    }

    // US States

    usStatesInfo() {
        this.usStatesData = [];
        this.subscription.add(this.fdDataShareServie.defaultUSSData.subscribe((res) => {
            if (res) {
                this.usStatesData = res;
                // console.log('US States Data ', this.usStatesData);
            }
        }));
    }
    currencyInfo() {
        this.currencyData = [];
        this.subscription.add(this.fdDataShareServie.defaultCUData.subscribe((res) => {
            if (res) {
                this.currencyData = res;
                // console.log('currency Data ', this.currencyData);
            }
        }));
    }
    async cleInfo() {
        this.isPSInnerLoaderHidden = false;
        await this.fdDataShareServie.getClePO('confirm');
        this.isPSInnerLoaderHidden = true;
        this.cleData = [];
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                // console.log('CLE Data ', this.cleData);
            }
        }));
    }
    resourceCInfo() {
        this.subscription.add(this.fdDataShareServie.defaultRCData.subscribe((res) => {
            if (res) {
                this.rcData = res;
                // console.log('Resource Categorization ', this.rcData);
            }
        }));
    }



    createAddToProformaFormField() {
        this.addToProforma_form = this.fb.group({
            ClientLegalEntity: [{ value: '', disabled: true }],
            POName: [{ value: '', disabled: true }],
            POCName: ['', Validators.required],
            ProformaNumber: [{ value: '', disabled: true }],
            ProformaTitle: ['', Validators.required],
            Template: ['', [Validators.required]],
            State: ['', [Validators.required]],
            Amount: [{ value: '', disabled: true }],
            Currency: [{ value: '', disabled: true }],
            AddressType: ['', Validators.required],
            ProformaType: [{ value: '', disabled: true }],
            ProformaDate: ['', Validators.required],
            AdditionalComments: [''],
        });
    }

    createANBCols() {
        this.confirmCols = [
            { field: 'ProjectCode', header: 'Project Code', visibility: true },
            { field: 'SOWValue', header: 'SOW Code/ Name', visibility: true },
            { field: 'ScheduledDate', header: 'Scheduled Date', visibility: true, exportable: false },
            { field: 'ScheduledDateFormat', header: 'Scheduled Date', visibility: false },
            { field: 'ScheduleType', header: 'Schedule Type', visibility: true },
            { field: 'Amount', header: 'Amount', visibility: true },
            { field: 'Currency', header: 'Currency', visibility: true },
            { field: 'POCName', header: 'POC Name', visibility: true },

            { field: 'ProjectMileStone', header: 'Project Milestone', visibility: false },
            { field: 'SOWName', header: 'SOW Name', visibility: false },
            { field: 'PONumber', header: 'PO Number', visibility: false },
            { field: 'POName', header: 'PO Name', visibility: false },
            { field: 'AddressType', header: 'Address Type', visibility: false },
            { field: 'ClientLegalEntity', header: 'Clent LE', visibility: false },
            // { field: 'TaggedDate', header: 'Tagged Date', visibility: false },
            { field: 'Status', header: 'Status', visibility: false },
            // { field: 'ProformaLookup', header: 'Proforma Lookup', visibility: false },
            { field: 'ScheduleType', header: 'Schedule Type', visibility: false },
            // { field: 'InvoiceLookup', header: 'Invoice Lookup', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'ModifiedBy', header: 'Modified By', visibility: false },
            { field: 'PracticeArea', header: 'Practice Area', visibility: false },
            { field: 'CS', header: 'CS', visibility: false },

            { field: '', header: '', visibility: true }


        ];
    }

    // Get Confirmed InvoiceItemList

    async getRequiredData() {
        this.isPSInnerLoaderHidden = false;
        this.confirmedRes = [];
        this.po = {};
        this.selectedAllRowData = [];
        this.selectedTotalAmt = 0;
        const invoiceObj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItems);
        this.commonService.SetNewrelic('Finance-Dashboard', 'confirmed-GetInvoiceLineItem', 'readItems');
        const res = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, invoiceObj);
        const arrResults = res.length ? res : [];
        if (arrResults.length) {
            // this.formatData(arrResults);
            this.confirmedILIarray = arrResults;
            this.getPOListItems(arrResults);
        }
        this.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });
    }
    getPOListItems(data) {
        this.purchaseOrders = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const poItem = this.searchPOId(element.PO, this.purchaseOrdersList);
            const pocItem = this.searchPOCName(element.MainPOC, this.projectContactsData);
            let pocName = '';
            if (pocItem) {
                pocName = pocItem.FullNameCC ? ' - ' + pocItem.FullNameCC : '';
                pocItem.pocName = pocName;
            }
            if (poItem) {
                this.purchaseOrders.push(poItem);
            }
        }

        if (this.selectedDDPO.hasOwnProperty('value')) {
            this.selectedPurchaseNumber = this.purchaseOrders ? this.purchaseOrders.find(item => item.Id ===
                this.selectedDDPO.value.ID) : '';
            this.onChange(this.selectedDDPO);
        }
    }

    searchPOId(poId, myArray) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < myArray.length; i++) {
            if (myArray[i].ID === poId) {
                if (this.confirmedPOList.indexOf(myArray[i]) === -1) {
                    this.confirmedPOList.push(myArray[i]);
                    return myArray[i] ? myArray[i] : '';
                }
            }
        }
    }

    searchPOCName(rowItem: any, myArray) {
        for (let i = 0; i < myArray.length; i++) {
            if (myArray[i].ID === rowItem) {
                if (this.confirmedPOCList.indexOf(myArray[i]) === -1) {
                    this.confirmedPOCList.push(myArray[i]);
                    return myArray[i] ? myArray[i] : '';
                }
            }
        }
    }
    onChange(data: any) {
        this.matchedILIArray = [];
        this.selectedAllRowData = [];
        this.selectedRowItemData = [];
        this.selectedTotalAmt = 0;
        // console.log(data.value);
        const po = data.value;
        this.selectedDDPO = data;
        console.log('po ', po);
        if (po) {
            if (po.hasOwnProperty('AmountRevenue') && po.hasOwnProperty('InvoicedRevenue')) {
                this.po.revenuBalance = (parseFloat(po.AmountRevenue ? po.AmountRevenue.toFixed(2) : 0) - parseFloat(po.InvoicedRevenue ? po.InvoicedRevenue.toFixed(2) : 0));
            } else {
                this.po.revenuBalance = 0;
            }
            if (po.hasOwnProperty('AmountOOP') && po.hasOwnProperty('InvoicedOOP')) {
                this.po.oopBalance = (parseFloat(po.AmountOOP ? po.AmountOOP.toFixed(2) : 0) - parseFloat(po.InvoicedOOP ? po.InvoicedOOP.toFixed(2) : 0));
            } else {
                this.po.oopBalance = 0;
            }
            this.po.revenuBalance = parseFloat(this.po.revenuBalance.toFixed(2));
            this.po.oopBalance = parseFloat(this.po.oopBalance.toFixed(2));
        }
        if (po) {
            for (let c = 0; c < this.confirmedILIarray.length; c++) {
                const element = this.confirmedILIarray[c];
                if (element.PO === po.Id) {
                    this.matchedILIArray.push(element);
                }
            }
            this.formatData(this.matchedILIArray);
        } else {
            this.confirmedRes = [];
            this.confirmedInColArray.ProjectCode = [];
            this.confirmedInColArray.SOWCode = [];
            this.confirmedInColArray.Amount = [];
            this.confirmedInColArray.ProjectMileStone = [];
            this.confirmedInColArray.POName = [];
            this.confirmedInColArray.ClientLegalEntity = [];
            this.confirmedInColArray.PONumber = [];
            this.po = {};
        }
    }

    // Get Project Milestone & Client LegalEntity & POC Name


    async formatData(data: any[]) {
        this.confirmedRes = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const project: any = this.getProject(element);
            const sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(element.SOWCode);
            const sowCode = element.SOWCode ? element.SOWCode : '';
            const sowName = sowItem.Title ? sowItem.Title : '';
            let sowcn = sowCode + ' ' + sowName;
            if (sowCode && sowName) {
                sowcn = sowCode + ' / ' + sowName;
            }
            const poItem = await this.getPONumber(element);
            // let pnumber = poItem.Number ? poItem.Number : '';
            // const pname = poItem.Name ? poItem.Name : '';
            // if (pnumber === 'NA') {
            //     pnumber = '';
            // }
            // let ponn = pnumber + ' ' + pname;
            // if (pname && pnumber) {
            //     ponn = pnumber + ' / ' + pname;
            // }
            // const POValues = ponn;

            this.confirmedRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: element.SOWCode,
                SOWValue: sowcn,
                SOWName: sowItem.Title,
                ProjectMileStone: project ? project.Milestone : '',
                PONumber: poItem.Number,
                POName: poItem.Name,
                ClientName: this.selectedPurchaseNumber.ClientLegalEntity,
                ClientLegalEntity: this.selectedPurchaseNumber.ClientLegalEntity,
                ScheduledDate: new Date(this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy')), // this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                ScheduledDateFormat: this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                ScheduleType: element.ScheduleType,
                Amount: element.Amount,
                Currency: element.Currency,
                POCName: this.getPOCName(element),
                POCId: element.MainPOC,
                AddressType: element.AddressType,
                ProjectTitle: project ? project.Title : '',
                CS: this.fdDataShareServie.getCSDetails(element),
                PracticeArea: this.getPracticeArea(element).BusinessVertical,
                TaggedDate: element.TaggedDate,
                Status: element.Status,
                ProformaLookup: element.ProformaLookup,
                InvoiceLookup: element.InvoiceLookup,
                Template: element.Template,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            });
        }
        this.createColFieldValues(this.confirmedRes);
    }

    getProject(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x;
            }
        });
        return found ? found : '';
    }

    // Project Current Milestones
    getMilestones(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x;
            }
        });
        return found ? found.Milestone : '';
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

    // Project Client
    getCLEObj(cle: any) {
        const found = this.cleData.find((x) => x.Title === cle);
        return found ? found : '';
    }

    // Project Client
    getCLE(pc: any) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.Title) {
                return x.ClientLegalEntity;
            }
        });
        return found ? found.ClientLegalEntity : '';
    }

    getPOCName(poc: any) {
        const found = this.projectContactsData.find((x) => {
            if (x.ID === poc.MainPOC) {
                return x;
            }
        });
        return found ? found.FName + ' ' + found.LName : '';
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

    createColFieldValues(resArray) {
        this.confirmedInColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.SOWValue, value: a.SOWValue }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.ProjectMileStone = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.POName = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.POName, value: a.POName }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.ClientLegalEntity = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.PONumber = this.uniqueArrayObj(resArray.map(a => { const b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label));

        const scheduledDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { const b = { label: this.datePipe.transform(a.ScheduledDate, 'MMM dd, yyyy'), value: a.ScheduledDate }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.ScheduledDate = scheduledDate.map(a => { const b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);

        this.confirmedInColArray.ScheduleType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.ScheduleType, value: a.ScheduleType }; return b; }).filter(ele => ele.label)));
        const amount = this.uniqueArrayObj(resArray.map(a => { const b = { label: parseFloat(a.Amount), value: a.Amount }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label');
        this.confirmedInColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.POCName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { const b = { label: a.POCName, value: a.POCName }; return b; }).filter(ele => ele.label)));
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
        // console.log('Event ', event);
        // console.log('this.selectedAllRowData ', this.selectedAllRowData);
        // this.selectedRowItemData.push(event.data);
        this.calculateData();
    }
    calculateData() {
        this.selectedTotalAmt = 0;
        this.uniqueST = true;
        for (let i = 0; i < this.selectedAllRowData.length; i++) {
            const element = this.selectedAllRowData[i];
            this.selectedTotalAmt += parseFloat(element.Amount.toFixed(2));
        }
        this.selectedTotalAmt = parseFloat(this.selectedTotalAmt.toFixed(2));
    }

    checkSelectedRowData() {
        // console.log('Event ', this.selectedRowItemData);
    }

    onRowUnselect(event) {
        // console.log(event);
        // console.log('this.selectedAllRowData ', this.selectedAllRowData);

        const rowUnselectIndex = this.selectedRowItemData.indexOf(event.data);
        this.selectedRowItemData.splice(rowUnselectIndex, 1);
        // console.log(this.selectedRowItemData);
        this.calculateData();
    }

    handleData(event) {
        // console.log('this.selectedAllRowData ', this.selectedAllRowData);
        if (this.selectedAllRowData.length && this.confirmedRes.length) {
            this.calculateData();
            this.selectedRowItemData = [];
        } else if (this.selectedAllRowData.length === 0) {
            this.calculateData();
        }
    }

    convertToExcelFile(cnf1) {
        // console.log('cnf ', cnf1);
        cnf1.exportCSV();
    }

    // Open popups
    openPopup(data, popUpData) {
        // console.log('Row data  ', data);
        // console.log('pubSupportSts  ', pubSupportSts);

        this.items = [
            { label: 'Edit Line item', command: (e) => this.openMenuContent(e, data) },
            { label: 'Revert Invoice', command: (e) => this.openMenuContent(e, data) },
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        ];

    }
    openMenuContent(event, data) {
        this.isHourlyProject = false;
        // console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        // console.log(event);
        this.confirmDialog.title = event.item.label;
        if (this.confirmDialog.title.toLowerCase() === 'revert invoice') {
            // this.confirm1();
            let additionalMessage = null;
            const pInfo = this.getPIByPC(this.selectedRowItem);
            if (pInfo.hasOwnProperty('ProjectType')) {
                if (pInfo.ProjectType.includes('Rolling')) {
                    this.isHourlyProject = true;
                    additionalMessage = 'Note: This hourly billed project will be converted to delivery based project with Budget' + this.selectedRowItem.Currency + ' ' + this.selectedRowItem.Amount
                }
            }
            this.commonService.confirmMessageDialog('Confirmation', ' Are you sure that you want to revert the invoice of ' + this.selectedRowItem.ProjectCode + ' from confirmed to scheduled status?', additionalMessage, ['Yes', 'No'], false).then(async Confirmation => {
                if (Confirmation === 'Yes') {
                    this.commonService.showToastrMessage(this.constantService.MessageType.info, 'You have Confirmed', false);
                    this.onSubmit('revertInvoice');
                }
                else if (Confirmation === 'No') {
                    this.commonService.showToastrMessage(this.constantService.MessageType.info, 'You have Cancelled.', false);
                }
            });
        } else if (this.confirmDialog.title.toLowerCase() === 'show history') {
            this.timeline.showTimeline(data.Id, 'FD', 'InvoiceLineItems');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
        else if (this.confirmDialog.title === 'Edit Line item') {

            const ref = this.dialogService.open(EditInvoiceDialogComponent, {
                header: 'Edit Line item',
                width: '75vw',
                data: {
                    InvoiceType: this.selectedRowItem.ScheduleType,
                    projectContactsData: this.projectContactsData,
                    selectedRowItem: this.selectedRowItem,
                },
                contentStyle: { 'max-height': '80vh', 'overflow-y': 'auto' },
                closable: false,
            });
            ref.onClose.subscribe((editInvoice: any) => {
                if (editInvoice) {
                    const batchURL = this.fdDataShareServie.EditInvoiceDialogProcess(this.selectedRowItem.ScheduleType,this.selectedRowItem, editInvoice)
                    this.commonService.SetNewrelic('Finance-Dashboard', 'confirmed', 'updateInvoiceLineItem');
                    this.submitForm(batchURL, 'editInvoice');
                }
            });
        }
    }
    addProforma() {
        if (!this.selectedPurchaseNumber) {

            this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select Purchase order Number & try again.', false);
        } else {
            if (this.selectedAllRowData.length) {
                for (let i = 0; i < this.selectedAllRowData.length; i++) {
                    const element = this.selectedAllRowData[i];

                    const scheduleType = this.selectedAllRowData[0].ScheduleType;
                    if (element.ScheduleType !== scheduleType) {

                        this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select same Schedule type & try again.', false);
                        return;
                    }
                }
                if (new Date(this.selectedPurchaseNumber.POExpiryDate) >= new Date()) {
                    const ref = this.dialogService.open(AddUpdateProformaDialogComponent, {
                        header: 'Add to Proforma Form',
                        width: '75vw',
                        data: {
                            Type: 'Add to proforma',
                            selectedTotalAmt: this.selectedTotalAmt,
                            cleData: this.cleData,
                            selectedCLEData: this.getCLEObj(this.selectedPurchaseNumber.ClientLegalEntity),
                            selectedPurchaseNumber: this.selectedPurchaseNumber,
                            selectedAllRowData: this.selectedAllRowData,
                            projectContactsData: this.projectContactsData,
                            purchaseOrdersList: this.purchaseOrdersList
                        },
                        contentStyle: { 'max-height': '80vh', 'overflow-y': 'auto' },
                        closable: false,
                    });
                    ref.onClose.subscribe((proformaForm: any) => {
                        if (proformaForm) {
                            this.isPSInnerLoaderHidden = false;
                            const batchUrl = this.fdDataShareServie.AddToProformaProcessData(proformaForm);
                            this.submitForm(batchUrl, 'add2Proforma');
                        }
                    });
                } else {

                    this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Proforma cant be generated on Expired PO', false);
                }

            } else {
                this.commonService.showToastrMessage(this.constantService.MessageType.info, 'Please select one of Row Item & try again.', false);
            }
        }
    }

    showHideState(val: any) {
        // console.log('val ', val);
        if (val) {
            this.isTemplate4US = val.value === 'US' ? true : false;
            if (this.isTemplate4US) {
                this.addToProforma_form.addControl('State', new FormControl('', Validators.required));
            } else {
                this.addToProforma_form.removeControl('State');
            }
        }
    }
    getPOCNamesForEditInv(rowItem: any) {
        this.listOfPOCNames = [];
        let pocROW: any;
        this.projectContactsData.filter((item) => {
            if (item.ClientLegalEntity === rowItem.Title) {
                this.listOfPOCNames.push(item);
                if (this.selectedPurchaseNumber.POCLookup === item.ID) {
                    pocROW = item;
                }
            }
        });
        // console.log('this.listOfPOCNames ', this.listOfPOCNames);
        if (pocROW) {
            this.addToProforma_form.patchValue({
                POCName: pocROW
            });
        }

    }

    pocChange(val) {
        // console.log(val)
    }

    cancelFormSub(formType) {
        if (formType === 'editDeliverable') {
            this.addToProforma_form.reset();
            this.proformaModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onCLIChange(data: any) {

    }
    onPOChange(data: any) {
        // console.log('Data ', data);
        this.selectedPOItem = data;
    }
    getPONumberFromCLE(cli) {
        this.poNames = [];
        this.purchaseOrdersList.map((x) => {
            if (x.ClientLegalEntity === cli) {
                this.poNames.push(x);
            }
        });
        // console.log(this.poNames);
    }

    generateProformaNumber(cle: any) {
        let cleAcronym = '';
        let proformaCounter = 0;
        let proformaDate = '';
        let isOOP = false;
        if (this.selectedAllRowData[0].ScheduleType) {
            isOOP = this.selectedAllRowData[0].ScheduleType.toLowerCase() === 'oop' ? true : false;
        }
        if (cle) {
            cleAcronym = cle.Acronym ? cle.Acronym : '';
            // console.log('cleAcronym,', cleAcronym);
            proformaCounter = cle.ProformaCounter ? parseInt(cle.ProformaCounter) + 1 : 1;
            const sNum = '000' + proformaCounter;
            const sFinalNum = sNum.substr(sNum.length - 4);
            // console.log('proformaCounter,', proformaCounter);
            const date = this.addToProforma_form.value.ProformaDate ? new Date(this.addToProforma_form.value.ProformaDate) : new Date();
            proformaDate = this.datePipe.transform(date, 'MM') + this.datePipe.transform(date, 'yy');
            // console.log('proformaDate,', proformaDate);
            const finalVal = isOOP ? (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum + '-OOP') :
                (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum);
            this.addToProforma_form.get('ProformaNumber').setValue(finalVal);

        }
    }

    updatePrformaNumFromPT() {
        const cle = this.getCLEObj(this.selectedPurchaseNumber.ClientLegalEntity);
        this.generateProformaNumber(cle);
    }

    getPIByPC(pc) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === pc.ProjectCode) {
                return x;
            }
        });
        return found ? found : '';
    }

    async getPFByPC() {
        const pfobj = Object.assign({}, this.fdConstantsService.fdComponent.projectFinances);
        pfobj.filter = pfobj.filter.replace('{{ProjectCode}}', this.selectedRowItem.ProjectCode);
        this.commonService.SetNewrelic('Finance-Dashboard', 'confirmed-GetPFbyPC', 'readItems');
        let response = await this.spServices.readItems(this.constantService.listNames.ProjectFinances.name, pfobj);
        response = response.length ? response[0] : {};
        // let obj = [{
        //     url: this.spServices.getReadURL(this.constantService.listNames.ProjectFinances.name, pfobj),
        //     type: 'GET',
        //     listName: this.constantService.listNames.ProjectFinances
        // }]
        // const res = await this.spServices.executeBatch(obj);
        return response;
    }

    async onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        if (type === 'revertInvoice') {
            // const data = [];
            const batchUrl = [];
            this.isPSInnerLoaderHidden = false;
            // console.log('form is submitting ..... for selected row Item i.e ', this.selectedRowItem);
            const iliData = {
                __metadata: {
                    type: this.constantService.listNames.InvoiceLineItems.type
                },
                Status: 'Scheduled'
            };
            const iliObj = Object.assign({}, this.queryConfig);
            iliObj.url = this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, this.selectedRowItem.Id);
            iliObj.listName = this.constantService.listNames.InvoiceLineItems.name;
            iliObj.type = 'PATCH';
            iliObj.data = iliData;
            batchUrl.push(iliObj);

            if (this.isHourlyProject) {
                const pInfo = this.getPIByPC(this.selectedRowItem);
                // Update PI
                const piData = {
                    __metadata: {
                        type: this.constantService.listNames.ProjectInformation.type
                    },
                    ProjectType: 'Deliverable-Writing',
                    IsApproved: 'No'
                };
                const piObj = Object.assign({}, this.queryConfig);
                piObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectInformation.name, pInfo.Id);
                piObj.listName = this.constantService.listNames.ProjectInformation.name;
                piObj.type = 'PATCH';
                piObj.data = piData;
                batchUrl.push(piObj);

                // Update PF
                const pf = await this.getPFByPC();
                // console.log('pf ', pf);
                if (pf) {
                    const pfData = {
                        __metadata: {
                            type: this.constantService.listNames.ProjectFinances.type
                        },
                        Budget: this.selectedRowItem.Amount,
                        RevenueBudget: this.selectedRowItem.Amount
                    };
                    const pfObj = Object.assign({}, this.queryConfig);
                    pfObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinances.name, pf.Id);
                    pfObj.listName = this.constantService.listNames.ProjectFinances.name;
                    pfObj.type = 'PATCH';
                    pfObj.data = pfData;

                    batchUrl.push(pfObj);
                }
            }
            this.submitForm(batchUrl, type);

        }
    }
    async submitForm(batchUrl, type: string) {
        if (type === 'add2Proforma') {
            // var retCall = await this.spServices.getFDData(batchGuid, sBatchData);
            let retCall = await this.spServices.executeBatch(batchUrl);
            retCall = retCall.length ? retCall.map(a => a.retItems) : [];
            // const lineItemArray = [];
            const innerBatchUrl = [];
            this.selectedAllRowData.forEach(element => {
                const prfData = {
                    __metadata: {
                        type: this.constantService.listNames.InvoiceLineItems.type
                    },
                    Status: 'Proforma Created',
                    ProformaLookup: retCall[0].ID
                };
                this.commonService.setBatchObject(innerBatchUrl, this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, element.Id),prfData,this.constantService.Method.PATCH,this.constantService.listNames.InvoiceLineItems.name);
            });

            this.commonService.SetNewrelic('Finance-Dashboard', 'confirmed', 'AddProforma');
            await this.spServices.executeBatch(innerBatchUrl);
            const projectAppendix = await this.createProjectAppendix(this.selectedAllRowData);
            await this.fdDataShareServie.callProformaCreation(retCall[0], this.cleData, this.projectContactsData,
                this.purchaseOrdersList, this.editorRef, projectAppendix);
            this.proformaModal = false;
            this.isPSInnerLoaderHidden = true;
            this.reFetchData();

            this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Proforma Number: ' + retCall[0].Title + ' - Added Sucessfully  ', false);
        } else {
            await this.spServices.executeBatch(batchUrl);
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
            if (type === 'revertInvoice') {

                this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Reverted the invoice of ' + this.selectedRowItem.ProjectCode + ' from Confirmed to Scheduled.', false);
                this.reFetchData();
            } else if (type === 'editInvoice') {

                this.commonService.showToastrMessage(this.constantService.MessageType.success, 'Invoice Updated.', false);
                this.reFetchData();
            }

        }
    }

    async createProjectAppendix(selectedProjects) {
        const projectAppendix = [];
        let retProjects = [];
        let projects = [];
        const projectProcessed = [];
        const callProjects = [];
        selectedProjects.forEach(element => {
            if (projectProcessed.indexOf(element.ProjectCode) === -1) {
                const project = this.projectInfoData.find(e => e.ProjectCode === element.ProjectCode);
                if (project) {
                    projects.push(project);
                    projectProcessed.push(project.ProjectCode);
                } else {
                    callProjects.push(element.ProjectCode);
                }
            }
        });

        if (callProjects.length) {
            const batchURL = [];
            const options = {
                data: null,
                url: '',
                type: '',
                listName: ''
            };

            callProjects.forEach(element => {
                const getPIData = Object.assign({}, options);
                getPIData.url = this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name,
                    this.fdConstantsService.fdComponent.projectInfoCode);
                getPIData.url = getPIData.url.replace('{{ProjectCode}}', element);
                getPIData.listName = this.constantService.listNames.ProjectInformation.name;
                getPIData.type = 'GET';
                batchURL.push(getPIData);
            });
            this.commonService.SetNewrelic('Finance-Dashboard', 'confirmed', 'GetPIbyProjectCode');

            retProjects = await this.spServices.executeBatch(batchURL);
            const mappedProjects = retProjects.map(obj => obj.retItems.length ? obj.retItems[0] : []);
            projects = [...projects, ...mappedProjects];
            projects = [...projects, ...retProjects];
        }
        const appendixObj = { dvcode: '', cactusSpCode: '', title: '', amount: '', poc: '' };
        selectedProjects.forEach(element => {
            const project = projects.find(e => e.ProjectCode === element.ProjectCode);
            const appendix = Object.assign({}, appendixObj);
            if (project) {
                appendix.dvcode = project.WBJID ? project.WBJID : '';
                appendix.cactusSpCode = project.ProjectCode ? project.ProjectCode : '';
                appendix.title = project.Title ? project.Title : '';
            }
            // console.log('element ----> ', element);
            appendix.poc = element.POCName;
            appendix.amount = element.Amount;
            projectAppendix.push(appendix);
        });

        return projectAppendix;
    }

    reFetchData() {


        setTimeout(async () => {
            // Refetch PO/CLE Data
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            await this.fdDataShareServie.getClePO('confirm');
            // Fetch latest PO & CLE
            this.poInfo();
            this.cleInfo();

            await this.getRequiredData();
        }, 300);
    }

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    enteredPOAmt(val) {
        // console.log('val ', val);
        const amt = parseInt(val);
        const poScheduled = parseFloat(this.selectedPOItem.value.TotalScheduled ? this.selectedPOItem.value.TotalScheduled : 0);
        const poInvoiced = parseFloat(this.selectedPOItem.value.TotalInvoiced ? this.selectedPOItem.value.TotalInvoiced : 0);
        const poItemAmt = this.selectedPOItem.value.Amount ? this.selectedPOItem.value.Amount : 0;
        const availableBudget = poItemAmt - (poScheduled + poInvoiced);
        if (amt > availableBudget) {
            this.enterPOAmtMsg = true;
            this.addToProforma_form.get('Amount').setValue('');
        } else {
            this.enterPOAmtMsg = false;
        }
    }

    // for Decimal you can use this as
    onlyDecimalNumberKey(event) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
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
        if (this.confirmedRes.length && this.isOptionFilter) {
            const obj = {
                tableData: this.confirmTable,
                colFields: this.confirmedInColArray
            };
            if (obj.tableData.filteredValue) {
                this.commonService.updateOptionValues(obj);
                this.cdr.detectChanges();
            } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
                this.createColFieldValues(obj.tableData.value);
                this.isOptionFilter = false;
            }
        }
        this.cdr.detectChanges();
    }
}
