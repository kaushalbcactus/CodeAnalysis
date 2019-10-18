import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Message, ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Calendar, DataTable } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { formatDate, DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-confirmed',
    templateUrl: './confirmed.component.html',
    styleUrls: ['./confirmed.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class ConfirmedComponent implements OnInit, OnDestroy {
    tempClick: any;
    confirmedRes: any = [];
    confirmCols: any[];
    msgs: Message[] = [];

    // Proforma Templates & Address Type
    proformatTemplates: any = [];
    addressTypes: any = [];
    listOfproformaType: any = [];

    // Show Hide State
    isTemplate4US: boolean = false;

    // Edit Deliverable Form
    addToProforma_form: FormGroup;

    // Show Hide Request Modal
    showHideREModal: boolean = false;

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
    isPSInnerLoaderHidden: boolean = true;

    // Right side bar
    rightSideBar: boolean = false;
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
    @ViewChild('timelineRef', { static: true }) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', { static: true }) editorRef: EditorComponent;

    @ViewChild('cnf', { static: false }) confirmTable: DataTable;
    // List of Subscribers 
    private subscription: Subscription = new Subscription();


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
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) { }

    async ngOnInit() {

        this.createANBCols();
        // this.getApprovedNonBillable();
        this.createAddToProformaFormField();

        // Address & Proforma type
        this.getAddressType();
        this.getProformaType();
        this.usStatesInfo();
        this.currencyInfo();
        this.getProformaTemplates();

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
    // Project Info 
    projectInfoData: any = [];
    async projectInfo() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // Check PI list
        await this.fdDataShareServie.checkProjectsAvailable();

        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
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

    // Set Address type
    getAddressType() {
        this.addressTypes = [
            { label: 'Client', value: 'Client' },
            { label: 'POC', value: 'POC' },
        ]
    }

    getProformaType() {
        this.listOfproformaType = [
            { label: 'OOP', value: 'oop' },
            { label: 'Revenue', value: 'revenue' },
        ]
    }

    // US States
   
    usStatesInfo() {
        this.usStatesData = [];
        this.subscription.add(this.fdDataShareServie.defaultUSSData.subscribe((res) => {
            if (res) {
                this.usStatesData = res;
                console.log('US States Data ', this.usStatesData);
            }
        }))
    }

    // US States
    currencyData: any = [];
    currencyInfo() {
        this.currencyData = [];
        this.subscription.add(this.fdDataShareServie.defaultCUData.subscribe((res) => {
            if (res) {
                this.currencyData = res;
                console.log('currency Data ', this.currencyData);
            }
        }))
    }

    // Client Legal Entity
    cleData: any = [];
    async cleInfo() {
        this.isPSInnerLoaderHidden = false;
        await this.fdDataShareServie.getClePO('confirm');
        this.isPSInnerLoaderHidden = true;
        this.cleData = [];
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('CLE Data ', this.cleData);
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

    getProformaTemplates() {
        this.proformatTemplates = [
            { label: 'US', value: 'US' },
            { label: 'India', value: 'India' },
            { label: 'China', value: 'China' },
            { label: 'Japan', value: 'Japan' },
            { label: 'Korea', value: 'Korea' },
            { label: 'ROW', value: 'ROW' }
        ]
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
        })
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
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        this.confirmedRes = [];
        this.po = {};
        this.selectedAllRowData = [];
        this.selectedTotalAmt = 0;
        // const batchContents = new Array();
        // const batchGuid = this.spServices.generateUUID();
        // const invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.InvoiceLineItems.name + '',
        // this.fdConstantsService.fdComponent.invoiceLineItems);
        // this.spServices.getBatchBodyGet(batchContents, batchGuid, invoicesQuery);
        const invoiceObj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItems);
        const res = await this.spServices.readItems(this.constantService.listNames.InvoiceLineItems.name, invoiceObj);
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
        // console.log('REs in Confirmed Invoice ', res);
        const arrResults = res.length ? res : [];
        if (arrResults.length) {
            // this.formatData(arrResults);
            this.getPOListItems(arrResults[0]);
            this.confirmedILIarray = arrResults[0];
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });
    }
    purchaseOrders: any = [];
    confirmedPOList: any = [];
    confirmedPOCList: any = [];
    getPOListItems(data) {
        this.purchaseOrders = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let poItem = this.searchPOId(element.PO, this.purchaseOrdersList);
            let pocItem = this.searchPOCName(element.MainPOC, this.projectContactsData);
            let pocName = '';
            if (pocItem) {
                pocName = pocItem.FullName ? ' - ' + pocItem.FullName : '';
                pocItem['pocName'] = pocName;
            }
            if (poItem) {
                this.purchaseOrders.push(poItem);
            }
        }
        console.log('this.purchaseOrders ', this.purchaseOrders);
        console.log('this.confirmedPOList ', this.confirmedPOList);
    }

    searchPOId(poId, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].ID === poId) {
                if (this.confirmedPOList.indexOf(myArray[i]) === -1) {
                    this.confirmedPOList.push(myArray[i]);
                    return myArray[i] ? myArray[i] : '';
                }
            }
        }
    }

    searchPOCName(rowItem: any, myArray) {
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].ID === rowItem) {
                if (this.confirmedPOCList.indexOf(myArray[i]) === -1) {
                    this.confirmedPOCList.push(myArray[i]);
                    return myArray[i] ? myArray[i] : '';
                }
            }
        }
    }

    matchedILIArray: any = [];
    onChange(data: any) {
        this.matchedILIArray = [];
        this.selectedAllRowData = [];
        this.selectedRowItemData = [];
        this.selectedTotalAmt = 0;
        // console.log(data.value);
        let po = data.value;
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
            var project: any = this.getProject(element);
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

            this.confirmedRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: element.SOWCode,
                SOWValue: sowcn,
                SOWName: sowItem.Title,
                ProjectMileStone: project ? project.Milestone : '', // this.getMilestones(element),
                POValues: POValues,
                PONumber: poItem.Number,
                POName: poItem.Name,
                ClientLegalEntity: this.selectedPurchaseNumber.ClientLegalEntity,
                ScheduledDate: new Date(this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy')), // this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                ScheduledDateFormat: this.datePipe.transform(element.ScheduledDate, 'MMM dd, yyyy'),
                ScheduleType: element.ScheduleType,
                Amount: element.Amount,
                Currency: element.Currency,
                POCName: this.getPOCName(element),
                AddressType: element.AddressType,
                ProjectTitle: project ? project.Title : '',
                CS: this.getCSDetails(element),
                PracticeArea: this.getPracticeArea(element).BusinessVertical,
                TaggedDate: element.TaggedDate,
                Status: element.Status,
                ProformaLookup: element.ProformaLookup,
                InvoiceLookup: element.InvoiceLookup,
                Template: element.Template,
                Modified: this.datePipe.transform(element.Modified, 'MMM dd, yyyy'),
                ModifiedBy: element.Editor ? element.Editor.Title : ''
            })
        }
        this.createColFieldValues(this.confirmedRes);
    }

    getProject(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x;
            }
        })
        return found ? found : '';
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

    // Project Current Milestones
    getPracticeArea(pc: any) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.Title) {
                return x;
            }
        })
        return found ? found : '';
    }

    // Project Client
    getCLEObj(cle: any) {
        const found = this.cleData.find((x) => x.Title === cle);
        return found ? found : '';
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
            if (x.ID === poc.MainPOC) {
                return x;
            }
        })
        return found ? found.FName + ' ' + found.LName : ''
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

    // Project PO
    getPONumber(poId) {
        let found = this.purchaseOrdersList.find((x) => {
            if (x.ID === poId.PO) {
                return x;
            }
        })
        return found ? found : ''
    }

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
    }

    createColFieldValues(resArray) {
        this.confirmedInColArray.ProjectCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.SOWCode = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.SOWValue, value: a.SOWValue }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.ProjectMileStone = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.POName = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POName, value: a.POName }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.ClientLegalEntity = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.PONumber = this.uniqueArrayObj(resArray.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }).filter(ele => ele.label));

        const scheduledDate = this.commonService.sortDateArray(this.uniqueArrayObj(resArray.map(a => { let b = { label: this.datePipe.transform(a.ScheduledDate, "MMM dd, yyyy"), value: a.ScheduledDate }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.ScheduledDate = scheduledDate.map(a => { let b = { label: this.datePipe.transform(a, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(a, 'MMM dd, yyyy')) }; return b; }).filter(ele => ele.label);

        this.confirmedInColArray.ScheduleType = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.ScheduleType, value: a.ScheduleType }; return b; }).filter(ele => ele.label)));
        const amount = this.uniqueArrayObj(resArray.map(a => { let b = { label: parseFloat(a.Amount), value: a.Amount }; return b; }).filter(ele => ele.label));
        this.confirmedInColArray.Amount = this.fdDataShareServie.customSort(amount, 1, 'label');
        this.confirmedInColArray.Currency = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }).filter(ele => ele.label)));
        this.confirmedInColArray.POCName = this.commonService.sortData(this.uniqueArrayObj(resArray.map(a => { let b = { label: a.POCName, value: a.POCName }; return b; }).filter(ele => ele.label)));
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


    // On Row Selection
    // Row Selection Array
    selectedTotalAmt: number = 0;
    selectedRowItemData: any = [];
    onRowSelect(event) {
        console.log('Event ', event);
        console.log('this.selectedAllRowData ', this.selectedAllRowData);
        //this.selectedRowItemData.push(event.data);
        this.calculateData();
    }
    uniqueST: boolean = true;
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
        console.log('Event ', this.selectedRowItemData);
    }

    onRowUnselect(event) {
        // console.log(event);
        console.log('this.selectedAllRowData ', this.selectedAllRowData);

        let rowUnselectIndex = this.selectedRowItemData.indexOf(event.data);
        this.selectedRowItemData.splice(rowUnselectIndex, 1);
        // console.log(this.selectedRowItemData);
        this.calculateData();
    }
    selectedAllRowData: any[] = [];

    handleData(event) {
        console.log('this.selectedAllRowData ', this.selectedAllRowData);
        if (this.selectedAllRowData.length && this.confirmedRes.length) {
            this.calculateData();
            this.selectedRowItemData = [];
        } else if (this.selectedAllRowData.length === 0) {
            this.calculateData();
        }
    }

    convertToExcelFile(cnf1) {
        console.log('cnf ', cnf1);
        cnf1.exportCSV();
    }

    confirm1() {
        let pInfo = this.getPIByPC(this.selectedRowItem);
        console.log('pInfo ', pInfo);
        this.confirmationService.confirm({
            message: 'Are you sure that you want to revert the invoice from confirmed to scheduled status?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            key: 'confirm',
            accept: () => {
                this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'You have Confirmed' }];
                // Call server service here
                this.onSubmit('revertInvoice');
            },
            reject: () => {
                this.msgs = [{ severity: 'info', summary: 'Cancel', detail: 'You have canceled' }];
            }
        });
    }

    items: any[];
    confirmDialog: any = {
        title: '',
        text: ''
    }
    // Open popups
    openPopup(data, popUpData) {
        console.log('Row data  ', data);
        // console.log('pubSupportSts  ', pubSupportSts);

        this.items = [
            { label: 'Revert Invoice', command: (e) => this.openMenuContent(e, data) },
            { label: 'Details', command: (e) => this.openMenuContent(e, data) },
            { label: 'Show History', command: (e) => this.openMenuContent(e, data) },
        ];

    }

    revertInvModal: boolean = false;
    isHourlyProject: boolean = false;
    selectedRowItem: any;
    openMenuContent(event, data) {
        this.isHourlyProject = false;
        console.log(JSON.stringify(data));
        this.selectedRowItem = data;
        console.log(event);
        this.confirmDialog.title = event.item.label;
        if (this.confirmDialog.title.toLowerCase() === 'revert invoice') {
            // this.confirm1();
            let pInfo = this.getPIByPC(this.selectedRowItem);
            if (pInfo.hasOwnProperty('ProjectType')) {
                if (pInfo.ProjectType.includes("Rolling")) {
                    this.isHourlyProject = true;
                }
            }

            console.log('pInfo ', pInfo);
            this.revertInvModal = true;
        } else if (this.confirmDialog.title.toLowerCase() === 'show history') {
            this.timeline.showTimeline(data.Id, 'FD', 'InvoiceLineItems');
        } else if (event.item.label === 'Details') {
            this.rightSideBar = !this.rightSideBar;
            return;
        }
    }

    proformaModal: boolean = false;
    addProforma() {
        if (!this.selectedPurchaseNumber) {
            this.messageService.add({ key: 'confirmInfoToast', severity: 'info', summary: 'Info message', detail: 'Please select Purchase order Number & try again.', life: 2000 });
        } else {
            if (this.selectedAllRowData.length) {
                for (let i = 0; i < this.selectedAllRowData.length; i++) {
                    const element = this.selectedAllRowData[i];

                    let scheduleType = this.selectedAllRowData[0].ScheduleType;
                    if (element.ScheduleType !== scheduleType) {
                        this.messageService.add({ key: 'confirmInfoToast', severity: 'info', summary: 'Info message', detail: 'Please select same Schedule type & try again.', life: 2000 });
                        return;
                    }
                }
                if (new Date(this.selectedPurchaseNumber.POExpiryDate) >= new Date()) {
                    const format = 'dd MMM , yyyy';
                    let myDate = new Date();
                    const locale = 'en-IN';
                    this.minProformaDate = new Date(Math.max.apply(null, this.selectedAllRowData.map(e => e.ScheduledDate)));
                    myDate = this.minProformaDate > myDate ? this.minProformaDate : myDate;
                    const formattedDate = formatDate(myDate, format, locale);
                    this.addToProforma_form.patchValue({
                        ClientLegalEntity: this.selectedPurchaseNumber.ClientLegalEntity,
                        POName: this.selectedPurchaseNumber.Number,
                        Currency: this.selectedPurchaseNumber.Currency,
                        Amount: this.selectedTotalAmt,
                        ProformaType: this.selectedAllRowData[0].ScheduleType,
                        ProformaTitle: this.selectedAllRowData.length > 1 ? '' : this.selectedAllRowData[0].ProjectTitle,
                        ProformaDate: formattedDate,
                        Template: { label: this.selectedAllRowData[0].Template, value: this.selectedAllRowData[0].Template },
                    });

                    this.minProformaDate = new Date(Math.max.apply(null, this.selectedAllRowData.map(e => e.ScheduledDate)));
                    this.proformaModal = true;
                    this.isTemplate4US = this.selectedAllRowData[0].Template === 'US' ? true : false;
                    if (this.isTemplate4US) {
                        this.addToProforma_form.addControl('State', new FormControl('', Validators.required));
                    } else {
                        this.addToProforma_form.removeControl('State');
                    }

                    var cle = this.getCLEObj(this.selectedPurchaseNumber.ClientLegalEntity);
                    this.generateProformaNumber(cle);
                    this.getPOCNamesForEditInv(cle);
                }
                else {
                    this.messageService.add({ key: 'confirmInfoToast', severity: 'info', summary: 'Info message', detail: 'Proforma cant be generated on Expired PO', life: 2000 });
                }

            } else {
                this.messageService.add({ key: 'confirmInfoToast', severity: 'info', summary: 'Info message', detail: 'Please select one of Row Item & try again.', life: 2000 });
            }
        }
    }

    showHideState(val: any) {
        console.log('val ', val);
        if (val) {
            this.isTemplate4US = val.value === "US" ? true : false;
            if (this.isTemplate4US) {
                this.addToProforma_form.addControl('State', new FormControl('', Validators.required));
            } else {
                this.addToProforma_form.removeControl('State');
            }
        }
    }



    get isValidAddToProformaForm() {
        return this.addToProforma_form.controls;
    }

    listOfPOCNames: SelectItem[];
    getPOCNamesForEditInv(rowItem: any) {
        this.listOfPOCNames = [];
        var pocROW: any = undefined;
        this.projectContactsData.filter((item) => {
            if (item.ClientLegalEntity === rowItem.Title) {
                this.listOfPOCNames.push(item);
                if (this.selectedPurchaseNumber.POCLookup === item.ID) {
                    pocROW = item;
                }
            }
        });
        console.log('this.listOfPOCNames ', this.listOfPOCNames);
        if (pocROW) {
            this.addToProforma_form.patchValue({
                POCName: pocROW
            })
        }

    }

    pocChange(val) {
        console.log(val)
    }

    cancelFormSub(formType) {
        if (formType === 'editDeliverable') {
            this.addToProforma_form.reset();
            this.proformaModal = false;
        } else if (formType === 'revertInvoice') {
            this.revertInvModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    onCLIChange(data: any) {

    }
    selectedPOItem: any;
    onPOChange(data: any) {
        console.log('Data ', data);
        this.selectedPOItem = data;
    }

    // Project PO
    poNames: any = [];
    getPONumberFromCLE(cli) {
        this.poNames = [];
        this.purchaseOrdersList.map((x) => {
            if (x.ClientLegalEntity === cli) {
                this.poNames.push(x);
            }
        });
        console.log(this.poNames);
    }

    generateProformaNumber(cle: any) {
        let cleAcronym = '';
        let proformaCounter: number = 0;
        let proformaDate = '';
        let isOOP: boolean = false;
        if (this.selectedAllRowData[0].ScheduleType) {
            isOOP = this.selectedAllRowData[0].ScheduleType.toLowerCase() === 'oop' ? true : false;
        }
        if (cle) {
            cleAcronym = cle.Acronym ? cle.Acronym : '';
            // console.log('cleAcronym,', cleAcronym);
            proformaCounter = cle.ProformaCounter ? parseInt(cle.ProformaCounter) + 1 : 1;
            let sNum = '000' + proformaCounter;
            let sFinalNum = sNum.substr(sNum.length - 4);
            // console.log('proformaCounter,', proformaCounter);
            const date = this.addToProforma_form.value.ProformaDate ? new Date(this.addToProforma_form.value.ProformaDate) : new Date();
            proformaDate = this.datePipe.transform(date, 'MM') + this.datePipe.transform(date, 'yy');
            // console.log('proformaDate,', proformaDate);
            let finalVal = isOOP ? (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum + '-OOP') :
                (cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum);
            this.addToProforma_form.get('ProformaNumber').setValue(finalVal);

        }
    }

    updatePrformaNumFromPT() {
        var cle = this.getCLEObj(this.selectedPurchaseNumber.ClientLegalEntity);
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
        let response = await this.spServices.readItems(this.constantService.listNames.ProjectFinances.name, pfobj);
        response = response.length ? response : [];
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
            this.revertInvModal = false;
            // console.log('form is submitting ..... for selected row Item i.e ', this.selectedRowItem);
            const iliData = {
                Status: 'Scheduled'
                };
            // obj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            // tslint:disable-next-line: max-line-length
            // const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.selectedRowItem.Id);
            const iliObj = Object.assign({}, this.queryConfig);
            iliObj.url = this.spServices.getReadURL(this.constantService.listNames.InvoiceLineItems.name,
                                                    this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem);
            iliObj.url =  iliObj.url.replace('{{Id}}', this.selectedRowItem.Id);
            iliObj.listName = this.constantService.listNames.InvoiceLineItems.name;
            iliObj.type = this.constantService.listNames.InvoiceLineItems.type;
            iliObj.data = iliData;
            batchUrl.push(iliObj);

            if (this.isHourlyProject) {
                const pInfo = this.getPIByPC(this.selectedRowItem);
                // Update PI
                const piData = {
                    ProjectType: 'Deliverable-Writing',
                    IsApproved: 'No'
                };
                // piObj['__metadata'] = { type: 'SP.Data.ProjectInformationListItem' };
                // const piEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectInformation.update.replace("{{Id}}", pInfo.Id);

                const piObj = Object.assign({}, this.queryConfig);
                piObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name,
                                                        this.fdConstantsService.fdComponent.addUpdateProjectInformation);
                piObj.url =  piObj.url.replace('{{Id}}', pInfo.Id);
                piObj.listName = this.constantService.listNames.ProjectInformation.name;
                piObj.type = this.constantService.listNames.ProjectInformation.type;
                piObj.data = piData;
                batchUrl.push(iliObj);

                // data.push({
                //     objData: piObj,
                //     endpoint: piEndpoint,
                //     requestPost: false
                // });

                // Update PF
                const pf = await this.getPFByPC();
                // console.log('pf ', pf);
                if (pf.length) {
                    const pfData = {
                        Budget: this.selectedRowItem.Amount,
                        RevenueBudget: this.selectedRowItem.Amount
                    };
                    // pfObj['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
                    // const pfEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace('{{Id}}', pf.Id);

                    const pfObj = Object.assign({}, this.queryConfig);
                    pfObj.url = this.spServices.getItemURL(this.constantService.listNames.ProjectFinances.name,  pf.Id);
                    pfObj.listName = this.constantService.listNames.ProjectFinances.name;
                    pfObj.type = this.constantService.listNames.ProjectFinances.type;
                    pfObj.data = pfData;

                    batchUrl.push(iliObj);
                    // data.push({
                    //     objData: pfObj,
                    //     endpoint: pfEndpoint,
                    //     requestPost: false
                    // });
                }

            }
            // data.push({
            //     objData: obj,
            //     endpoint: endpoint,
            //     requestPost: false
            // })
            this.submitForm(batchUrl, type);

        } else if (type === 'add2Proforma') {
            const batchUrl = [];
            if (this.addToProforma_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            // console.log('form is submitting ..... & Form data is ', this.addToProforma_form.getRawValue());
            // let obj: any = {};
            const prfData = {
                ClientLegalEntity: this.addToProforma_form.getRawValue().ClientLegalEntity,
                PO: this.selectedPurchaseNumber.ID, // this.addToProforma_form.value.POName.Id,
                MainPOC: this.addToProforma_form.value.POCName.ID,
                Title: this.addToProforma_form.getRawValue().ProformaNumber,
                ProformaTitle: this.addToProforma_form.value.ProformaTitle,
                Template: this.addToProforma_form.value.Template.value,
                State: this.addToProforma_form.value.State ? this.addToProforma_form.value.State.Title : '',
                Amount: this.addToProforma_form.getRawValue().Amount,
                Currency: this.addToProforma_form.getRawValue().Currency,
                AddressType: this.addToProforma_form.value.AddressType.value,
                ProformaType: this.addToProforma_form.getRawValue().ProformaType,
                AdditionalInfo: this.addToProforma_form.value.AdditionalComments,
                ProformaDate: this.addToProforma_form.value.ProformaDate,
                Status: 'Created'
            };
            // console.log('obj ', obj);
            // obj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            // const endpoint = this.fdConstantsService.fdComponent.addUpdateProforma.createProforma;
            const proformaObj = Object.assign({}, this.queryConfig);
            proformaObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectFinances.name);
            proformaObj.listName = this.constantService.listNames.ProjectFinances.name;
            proformaObj.type = this.constantService.listNames.ProjectFinances.type;
            proformaObj.data = prfData;
            batchUrl.push(proformaObj);
            // Get Cle
            const currentCle = this.getCLEObj(prfData.ClientLegalEntity);
            const cleData = {
                ID: currentCle.Id,
                ProformaCounter: currentCle.ProformaCounter ? currentCle.ProformaCounter + 1 : 1
            };
            // cleObj['__metadata'] = { type: 'SP.Data.ClientLegalEntityListItem' };
            // const cleEndpoint = this.fdConstantsService.fdComponent.addUpdateClientLegalEntity.update.replace('{{Id}}', currentCle.Id);

            const cleObj = Object.assign({}, this.queryConfig);
            cleObj.url = this.spServices.getItemURL(this.constantService.listNames.ClientLegalEntity.name, currentCle.Id);
            cleObj.listName = this.constantService.listNames.ClientLegalEntity.name;
            cleObj.type = this.constantService.listNames.ClientLegalEntity.type;
            cleObj.data = cleData;
            batchUrl.push(cleObj);
            // let data = [
            //     {
            //         objData: obj,
            //         endpoint: endpoint,
            //         requestPost: true
            //     },
            //     {
            //         objData: cleObj,
            //         endpoint: cleEndpoint,
            //         requestPost: false
            //     }
            // ];
            this.submitForm(batchUrl, type);
            // setInterval(() => {
            //     this.isPSInnerLoaderHidden = true;
            // }, 5000);
        }
    }

    batchContents: any = [];
    async submitForm(batchUrl, type: string) {
        console.log('Form is submitting');

        // this.batchContents = [];
        // const batchGuid = this.spServices.generateUUID();
        // const changeSetId = this.spServices.generateUUID();

        // const batchContents = this.spServices.getChangeSetBody1(changeSetId, endpoint, JSON.stringify(obj), true);
        // console.log(' dataEndpointArray ', dataEndpointArray);
        // dataEndpointArray.forEach(element => {
        //     if (element)
        //         this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
        // });

        // console.log("this.batchContents ", JSON.stringify(this.batchContents));

        // this.batchContents.push('--changeset_' + changeSetId + '--');
        // const batchBody = this.batchContents.join('\r\n');
        // const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
        // batchBodyContent.push('--batch_' + batchGuid + '--');
        // const sBatchData = batchBodyContent.join('\r\n');

        if (type === 'add2Proforma') {
            // var retCall = await this.spServices.getFDData(batchGuid, sBatchData);
            let retCall = await this.spServices.executeBatch(batchUrl);
            retCall = retCall.length ? retCall.map(a => a.retItems) : [];
            // const lineItemArray = [];
            const innerBatchUrl = [];
            this.selectedAllRowData.forEach(element => {
                
                const prfData = {
                    Status: 'Proforma Created',
                    ProformaLookup: retCall[0].ID
                };
                // obj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
                // const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", element.Id);
                // lineItemArray.push(
                //     {
                //         objData: obj,
                //         endpoint: endpoint,
                //         requestPost: false
                //     }
                // )
                const prfObj = Object.assign({}, this.queryConfig);
                prfObj.url = this.spServices.getItemURL(this.constantService.listNames.InvoiceLineItems.name, element.Id);
                prfObj.listName = this.constantService.listNames.InvoiceLineItems.name;
                prfObj.type = this.constantService.listNames.InvoiceLineItems.type;
                prfObj.data = prfData;
                innerBatchUrl.push(prfObj);
            });

            // this.batchContents = [];
            // const batchGuidNew = this.spServices.generateUUID();
            // const changeSetId = this.spServices.generateUUID();
            // lineItemArray.forEach(element => {
            //     if (element)
            //         this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
            // });

            // console.log("this.batchContents ", JSON.stringify(this.batchContents));

            // this.batchContents.push('--changeset_' + changeSetId + '--');
            // const batchBody = this.batchContents.join('\r\n');
            // const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuidNew, changeSetId);
            // batchBodyContent.push('--batch_' + batchGuidNew + '--');
            // const sBatchDataNew = batchBodyContent.join('\r\n');
            // await this.spServices.getFDData(batchGuidNew, sBatchDataNew);
            await this.spServices.executeBatch(innerBatchUrl);
            const projectAppendix = await this.createProjectAppendix(this.selectedAllRowData);
            await this.fdDataShareServie.callProformaCreation(retCall[0], this.cleData, this.projectContactsData,
                                                              this.purchaseOrdersList, this.editorRef, projectAppendix);
            this.proformaModal = false;
            this.isPSInnerLoaderHidden = true;
            this.reFetchData();
            this.messageService.add({ key: 'custom', sticky: true, severity: 'success', summary: 'Proforma Added',
                                      detail: 'Proforma Number: ' + this.addToProforma_form.getRawValue().ProformaNumber });

        } else {
            // const res = await this.spServices.getFDData(batchGuid, sBatchData); //.subscribe(res => {
            await this.spServices.executeBatch(batchUrl);
            // const arrResults = res;
            // console.log('--oo ', arrResults);
            if (type === 'revertInvoice') {
                this.messageService.add({ key: 'confirmSuccessToast', severity: 'success', summary: 'Success message',
                                          detail: 'Reverted the invoice from Confirmed to Scheduled.', life: 2000 });
                this.reFetchData();
            } else if (type === 'editInvoice') {
                this.messageService.add({ key: 'confirmSuccessToast', severity: 'success', summary: 'Success message',
                                          detail: 'Invoice Updated.', life: 2000 });
                this.reFetchData();
            }
            this.isPSInnerLoaderHidden = true;
            // });
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
            }

            callProjects.forEach(element => {
                var getPIData = Object.assign({}, options);
                getPIData.url = this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name,
                                                           this.fdConstantsService.fdComponent.projectInfoCode);
                getPIData.url = getPIData.url.replace('{{ProjectCode}}', element);
                getPIData.listName = this.constantService.listNames.ProjectInformation.name;
                getPIData.type = 'GET';
                batchURL.push(getPIData);
            });

            retProjects = await this.spServices.executeBatch(batchURL);
            const mappedProjects = retProjects.map(obj => obj.retItems.length ? obj.retItems[0] : []);
            projects = [...projects, ...mappedProjects];
            projects = [...projects, ...retProjects];
        }
        const appendixObj = { dvcode: '', cactusSpCode: '', title: '', amount: '', poc: '' };
        selectedProjects.forEach(element => {
            const project = projects.find(e => e.ProjectCode === element.ProjectCode);
            let appendix = Object.assign({}, appendixObj);
            if (project) {
                appendix.dvcode = project.WBJID ? project.WBJID : '';
                appendix.cactusSpCode = project.ProjectCode ? project.ProjectCode : '';
                appendix.title = project.Title ? project.Title : '';
            }
            console.log('element ----> ', element);
            appendix.poc = element.POCName;
            appendix.amount = element.Amount;
            projectAppendix.push(appendix);
        });

        return projectAppendix;
    }

    reFetchData() {
        setTimeout(async () => {
            // Refetch PO/CLE Data
            await this.fdDataShareServie.getClePO('confirm');
            // Fetch latest PO & CLE
            this.poInfo();
            this.cleInfo();

            this.getRequiredData();
        }, 300);
    }
    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    enterPOAmtMsg: boolean = false;
    enteredPOAmt(val) {
        console.log('val ', val);
        let amt = parseInt(val);
        let poScheduled = parseFloat(this.selectedPOItem.value.TotalScheduled ? this.selectedPOItem.value.TotalScheduled : 0);
        let poInvoiced = parseFloat(this.selectedPOItem.value.TotalInvoiced ? this.selectedPOItem.value.TotalInvoiced : 0);
        let poItemAmt = this.selectedPOItem.value.Amount ? this.selectedPOItem.value.Amount : 0;
        let availableBudget = poItemAmt - (poScheduled + poInvoiced);
        if (amt > availableBudget) {
            this.enterPOAmtMsg = true;
            this.addToProforma_form.get('Amount').setValue('');
        } else {
            this.enterPOAmtMsg = false;
        }
    }

    //for Decimal you can use this as

    onlyDecimalNumberKey(event) {
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    ngOnDestroy() {
        // this.subscriptionPE.unsubscribe();
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

    ngAfterViewChecked() {
        let obj = {
            tableData: this.confirmTable,
            colFields: this.confirmedInColArray,
            // colFieldsArray: this.createColFieldValues(this.proformaTable.value)
        }
        if (obj.tableData.filteredValue) {
            this.commonService.updateOptionValues(obj);
            this.cdr.detectChanges();
        } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
            this.createColFieldValues(obj.tableData.value);
            this.cdr.detectChanges();
        }
    }

}
