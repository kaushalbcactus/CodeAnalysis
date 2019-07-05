import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Message, ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Calendar } from 'primeng/primeng';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { formatDate, DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { MAX_LENGTH_VALIDATOR, MaxLengthValidator } from '@angular/forms/src/directives/validators';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { EditorComponent } from 'src/app/finance-dashboard/PDFEditing/editor/editor.component';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-confirmed',
    templateUrl: './confirmed.component.html',
    styleUrls: ['./confirmed.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class ConfirmedComponent implements OnInit {

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
    }
    submitBtn: any = {
        isClicked: false
    }

    // PoBalance Obj
    po: any = {
        oopBalance: '',
        revenuBalance: ''
    }

    // Loader
    isPSInnerLoaderHidden: boolean = true;

    // Right side bar
    rightSideBar: boolean = false;

    selectedPurchaseNumber: any;
    minProformaDate: Date = new Date();
    @ViewChild('timelineRef', {static: true}) timeline: TimelineHistoryComponent;
    @ViewChild('editorRef', {static: true}) editorRef: EditorComponent;
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
        private router: Router
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
        this.projectInfo();
        await this.cleInfo();
        // GEt PO data
        await this.poInfo();
        this.projectContacts();

        // Get Confirmed IonvoiceLineItems
        this.getRequiredData();

    }
    updateCalendarUI(calendar: Calendar) {
        calendar.updateUI();
    }
    // Project Info 
    projectInfoData: any = [];
    projectInfo() {
        this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
            }
        })
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

    // Set Address type
    getAddressType() {
        this.addressTypes = [
            { label: 'Client', value: 'Client' },
            { label: 'POC', value: 'POC' },
        ]
    }

    getProformaType() {
        this.listOfproformaType = [
            { label: 'OOP', value: 'OOP' },
            { label: 'Revenue', value: 'Revenue' },
        ]
    }

    // US States
    usStatesData: any = [];
    usStatesInfo() {
        this.usStatesData = [];
        this.fdDataShareServie.defaultUSSData.subscribe((res) => {
            if (res) {
                this.usStatesData = res;
                console.log('US States Data ', this.usStatesData);
            }
        })
    }

    // US States
    currencyData: any = [];
    currencyInfo() {
        this.currencyData = [];
        this.fdDataShareServie.defaultCUData.subscribe((res) => {
            if (res) {
                this.currencyData = res;
                console.log('currency Data ', this.currencyData);
            }
        })
    }

    // Client Legal Entity
    cleData: any = [];
    async cleInfo() {
        this.isPSInnerLoaderHidden = false;
        await this.fdDataShareServie.getClePO();
        this.isPSInnerLoaderHidden = true;
        this.cleData = [];
        this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('CLE Data ', this.cleData);
            }
        })
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
            State: [''],
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
            { field: 'ScheduledDate', header: 'Scheduled Date', visibility: true },
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
            { field: 'InvoiceLookup', header: 'Invoice Lookup', visibility: false },
            { field: 'Template', header: 'Template', visibility: false },
            { field: 'Modified', header: 'Modified', visibility: false },
            { field: 'PracticeArea', header: 'Practice Area', visibility: false },
            { field: 'CS', header: 'CS', visibility: false },

            { field: '', header: '', visibility: true }


        ];
    }

    // Get Confirmed InvoiceItemList
    confirmedILIarray: any = [];
    async getRequiredData() {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        const invoicesQuery = this.spServices.getReadURL('' + this.constantService.listNames.InvoiceLineItems.name + '', this.fdConstantsService.fdComponent.invoiceLineItems);
        // this.spServices.getBatchBodyGet(batchContents, batchGuid, invoicesQuery);

        let endPoints = [invoicesQuery];
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            console.log('REs in Confirmed Invoice ', res);
            arrResults = res;
            if (arrResults.length) {
                // this.formatData(arrResults);
                this.getPOListItems(arrResults[0]);
                this.confirmedILIarray = arrResults[0];
            }
        });
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
            this.po.revenuBalance = (parseFloat(po.AmountRevenue ? po.AmountRevenue : 0) - parseFloat(po.InvoicedRevenue ? po.InvoicedRevenue : 0));
            this.po.oopBalance = (parseFloat(po.AmountOOP ? po.AmountOOP : 0) - parseFloat(po.InvoicedOOP ? po.InvoicedOOP : 0));
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
        }
    }

    // Get Project Milestone & Client LegalEntity & POC Name


    async formatData(data: any[]) {
        this.confirmedRes = [];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            var project: any = this.getProject(element);
            let sowItem = await this.fdDataShareServie.getSOWDetailBySOWCode(element.SOWCode);
            this.confirmedRes.push({
                Id: element.ID,
                ProjectCode: element.Title,
                SOWCode: element.SOWCode,
                SOWValue: element.SOWCode + ' / ' + sowItem.Title,
                SOWName: sowItem.Title,
                ProjectMileStone: project ? project.Milestone : '', // this.getMilestones(element),
                PONumber: element.PO,
                ClientLegalEntity: this.selectedPurchaseNumber.ClientLegalEntity,
                ScheduledDate: this.datePipe.transform(element.ScheduledDate, 'MMM d, y'),
                ScheduleType: element.ScheduleType,
                Amount: element.Amount,
                Currency: element.Currency,
                POCName: this.getPOCName(element),
                AddressType: element.AddressType,
                ProjectTitle: project ? project.Title : '',
                POName: element.POName,

                CS: this.getCSDetails(element.CS.results),
                TaggedDate: element.TaggedDate,
                Status: element.Status,
                ProformaLookup: element.ProformaLookup,
                InvoiceLookup: element.InvoiceLookup,
                Template: element.Template,
                Modified: element.Modified
            })
        }
        this.createColFieldValues();
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

    // Project Client
    getCLEObj(cle: any) {
        let found = this.cleData.find((x) => { return x.Title == cle });
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
        let title = [];
        for (let i = 0; i < res.length; i++) {
            const element = res[i];
            title.push(element.Title);
        }
        return title.toString();
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

    createColFieldValues() {
        this.confirmedInColArray.ProjectCode = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.ProjectCode, value: a.ProjectCode }; return b; }));
        this.confirmedInColArray.SOWCode = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.SOWValue, value: a.SOWValue }; return b; }));
        this.confirmedInColArray.ProjectMileStone = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.ProjectMileStone, value: a.ProjectMileStone }; return b; }));
        this.confirmedInColArray.POName = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.POName, value: a.POName }; return b; }));
        this.confirmedInColArray.ClientLegalEntity = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.ClientLegalEntity, value: a.ClientLegalEntity }; return b; }));
        this.confirmedInColArray.PONumber = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.PONumber, value: a.PONumber }; return b; }));
        this.confirmedInColArray.ScheduledDate = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.ScheduledDate, value: a.ScheduledDate }; return b; }));
        this.confirmedInColArray.ScheduleType = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.ScheduleType, value: a.ScheduleType }; return b; }));
        this.confirmedInColArray.Amount = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.Amount, value: a.Amount }; return b; }));
        this.confirmedInColArray.Currency = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.Currency, value: a.Currency }; return b; }));
        this.confirmedInColArray.POCName = this.uniqueArrayObj(this.confirmedRes.map(a => { let b = { label: a.POCName, value: a.POCName }; return b; }));
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
            this.selectedTotalAmt += element.Amount;
            let scheduleType = this.selectedAllRowData[0].ScheduleType;
            if (element.ScheduleType !== scheduleType) {
                this.uniqueST = false;
                this.selectedAllRowData.splice(element);
                this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Please select same Schedule type & try again.' });
                break;
            }

        }
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
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Please select Purchase order Number & try again.' });
        } else {
            if (this.selectedAllRowData.length) {
                if (new Date(this.selectedPurchaseNumber.POExpiryDate) >= new Date()) {
                    const format = 'dd MMM , yyyy';
                    const myDate = new Date();
                    const locale = 'en-IN';
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

                    var cle = this.getCLEObj(this.selectedPurchaseNumber.ClientLegalEntity);
                    this.generateProformaNumber(cle);
                    this.getPOCNamesForEditInv(cle);


                }
                else {
                    this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Proforma cant be generated on Expired PO' });
                }

            } else {
                this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Please select one of Row Item & try again.' });
            }
        }
    }

    showHideState(val: any) {
        console.log('val ', val);
        val.value == "US" ? this.isTemplate4US = true : this.isTemplate4US = false;
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
        let sType: string = 'Proforma';
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
            proformaDate = this.datePipe.transform(new Date(), 'MM') + this.datePipe.transform(new Date(), 'yy');
            // console.log('proformaDate,', proformaDate);
            let finalVal = isOOP ? cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum + '-OOP' : cleAcronym + '-PRF' + '-' + proformaDate + '-' + sFinalNum;
            this.addToProforma_form.get('ProformaNumber').setValue(finalVal);

        }
    }

    updatePrformaNumFromPT(cle, ptVal: any) {
        this.generateProformaNumber(cle);
    }

    getPIByPC(pc) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == pc.ProjectCode) {
                return x;
            }
        })
        return found ? found : '';
    }

    async getPFByPC() {
        let pfobj = Object.assign({}, this.fdConstantsService.fdComponent.projectFinances);
        pfobj.filter = pfobj.filter.replace('{{ProjectCode}}', this.selectedRowItem.ProjectCode);
        let obj = [{
            url: this.spOperationsService.getReadURL(this.constantService.listNames.ProjectFinances.name, pfobj),
            type: 'GET',
            listName: this.constantService.listNames.ProjectFinances
        }]
        const res = await this.spOperationsService.executeBatch(obj);
        return res[0].retItems[0];
    }

    async onSubmit(type: string) {
        this.formSubmit.isSubmit = true;
        if (type === 'revertInvoice') {
            let data = [];
            this.isPSInnerLoaderHidden = false;
            this.revertInvModal = false;
            console.log('form is submitting ..... for selected row Item i.e ', this.selectedRowItem);
            let obj = {
                Status: 'Scheduled'
            }
            obj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", this.selectedRowItem.Id);
            if (this.isHourlyProject) {
                let pInfo = this.getPIByPC(this.selectedRowItem);
                // Update PI
                let piObj = {
                    ProjectType: "Deliverable-Writing",
                    IsApproved: "No"
                }
                piObj['__metadata'] = { type: 'SP.Data.ProjectInformationListItem' };
                const piEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectInformation.update.replace("{{Id}}", pInfo.Id);
                data.push({
                    objData: piObj,
                    endpoint: piEndpoint,
                    requestPost: false
                });

                // Update PF
                let pf = await this.getPFByPC();
                console.log('pf ', pf);
                if (pf) {
                    let pfObj = {
                        Budget: this.selectedRowItem.Amount,
                        RevenueBudget: this.selectedRowItem.Amount
                    }
                    pfObj['__metadata'] = { type: 'SP.Data.ProjectFinancesListItem' };
                    const pfEndpoint = this.fdConstantsService.fdComponent.addUpdateProjectFinances.update.replace("{{Id}}", pf.Id);
                    data.push({
                        objData: pfObj,
                        endpoint: pfEndpoint,
                        requestPost: false
                    });
                }

            }
            data.push({
                objData: obj,
                endpoint: endpoint,
                requestPost: false
            })
            this.submitForm(data, type);

        } else if (type === 'add2Proforma') {
            if (this.addToProforma_form.invalid) {
                return;
            }
            this.isPSInnerLoaderHidden = false;
            this.submitBtn.isClicked = true;
            console.log('form is submitting ..... & Form data is ', this.addToProforma_form.getRawValue());
            let obj: any = {};
            obj = {
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
            }
            console.log('obj ', obj);
            obj['__metadata'] = { type: 'SP.Data.ProformaListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateProforma.createProforma;

            // Get Cle
            let currentCle = this.getCLEObj(obj.ClientLegalEntity);
            let cleObj = {
                ID: currentCle.Id,
                ProformaCounter: currentCle.ProformaCounter ? currentCle.ProformaCounter + 1 : 1
            }
            cleObj['__metadata'] = { type: 'SP.Data.ClientLegalEntityListItem' };
            const cleEndpoint = this.fdConstantsService.fdComponent.addUpdateClientLegalEntity.update.replace('{{Id}}', currentCle.Id);

            let data = [
                {
                    objData: obj,
                    endpoint: endpoint,
                    requestPost: true
                },
                {
                    objData: cleObj,
                    endpoint: cleEndpoint,
                    requestPost: false
                }
            ];
            this.submitForm(data, type);
            // setInterval(() => {
            //     this.isPSInnerLoaderHidden = true;
            // }, 5000);
        }
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

        if (type === 'add2Proforma') {
            var retCall = await this.spServices.getDataByApi(batchGuid, sBatchData);
            var lineItemArray = []
            this.selectedAllRowData.forEach(element => {
                let obj = {
                    Status: 'Proforma Created',
                    ProformaLookup: retCall[0].ID
                }
                obj['__metadata'] = { type: 'SP.Data.InvoiceLineItemsListItem' };
                const endpoint = this.fdConstantsService.fdComponent.addUpdateInvoiceLineItem.update.replace("{{Id}}", element.Id);
                lineItemArray.push(
                    {
                        objData: obj,
                        endpoint: endpoint,
                        requestPost: false
                    }
                )
            });

            this.batchContents = [];
            const batchGuidNew = this.spServices.generateUUID();
            const changeSetId = this.spServices.generateUUID();
            lineItemArray.forEach(element => {
                if (element)
                    this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
            });

            console.log("this.batchContents ", JSON.stringify(this.batchContents));

            this.batchContents.push('--changeset_' + changeSetId + '--');
            const batchBody = this.batchContents.join('\r\n');
            const batchBodyContent = this.spServices.getBatchBodyPost(batchBody, batchGuidNew, changeSetId);
            batchBodyContent.push('--batch_' + batchGuidNew + '--');
            const sBatchDataNew = batchBodyContent.join('\r\n');
            await this.spServices.getFDData(batchGuidNew, sBatchDataNew);
            const projectAppendix = await this.createProjectAppendix(this.selectedAllRowData);
            await this.fdDataShareServie.callProformaCreation(retCall[0], this.cleData, this.projectContactsData, this.purchaseOrdersList, this.editorRef, projectAppendix);
            this.proformaModal = false;
            this.isPSInnerLoaderHidden = true;
            this.reload();
            // this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Proforma added.', detail: '', life: 2000 });
            this.messageService.add({ key: 'custom', sticky: true, severity: 'success', summary: 'Proforma Added', detail: 'Proforma Number: ' + this.addToProforma_form.getRawValue().ProformaNumber });

        } else {
            this.spServices.getData(batchGuid, sBatchData).subscribe(res => {
                const arrResults = res;
                console.log('--oo ', arrResults);
                if (type === "revertInvoice") {
                    this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Reverted the invoice from Confirmed to Scheduled.', detail: '', life: 2000 })
                    this.reload();
                } else if (type === "editInvoice") {
                    this.messageService.add({ key: 'myKey1', severity: 'success', summary: 'Invoice Updated.', detail: '', life: 2000 })
                    this.reload();
                }
                this.isPSInnerLoaderHidden = true;
            });
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
                const project = this.projectInfoData.find(e => e.ProjectCode = element.ProjectCode);
                if (project) {
                    projects.push(project);
                    projectProcessed.push(project.ProjectCode);
                }
                else {
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
                getPIData.url = this.spOperationsService.getReadURL(this.constantService.listNames.ProjectInformation.name, this.fdConstantsService.fdComponent.projectInfoCode);
                getPIData.url = getPIData.url.replace("{{ProjectCode}}", element);
                getPIData.listName = this.constantService.listNames.ProjectInformation.name;
                getPIData.type = "GET";
                batchURL.push(getPIData);

            });

            retProjects = await this.spOperationsService.executeBatch(batchURL);
            projects = [...projects, ...retProjects];
        }
        const appendixObj = { dvcode: '', cactusSpCode: '', title: '', amount: '' };
        selectedProjects.forEach(element => {
            const project = projects.find(e => e.ProjectCode = element.ProjectCode);
            let appendix = Object.assign({}, appendixObj);
            appendix.dvcode = project.WBJID;
            appendix.cactusSpCode = project.ProjectCode;
            appendix.title = project.Title;
            appendix.amount = element.Amount;
            projectAppendix.push(appendix);
        });

        return projectAppendix;
    }

    reload() {
        setTimeout(() => {
            //// Implement refresh change 
            window.location.reload();
        }, 3000);
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
        let availableBudget = this.selectedPOItem.value.Amount - (poScheduled + poInvoiced);
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

}
