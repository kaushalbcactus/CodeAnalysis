import { Component, OnInit, ComponentFactoryResolver, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SPOperationService } from '../../Services/spoperation.service';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
import { FdConstantsService } from '../fdServices/fd-constants.service';
import { SelectItem } from 'primeng/api';
import { FDDataShareService } from '../fdServices/fd-shareData.service';
import { NodeService } from 'src/app/node.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Subject, Observable, timer, Subscription } from 'rxjs';
import { FdAuthService } from '../fd-AuthGuard/fd-auth.service';

@Component({
    selector: 'app-expenditure',
    templateUrl: './expenditure.component.html',
    styleUrls: ['./expenditure.component.css']
})
export class ExpenditureComponent implements OnInit, OnDestroy {

    private eventsSubject: Subject<void> = new Subject<void>();


    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;
    formSubmit: any = {
        isSubmit: false
    }
    submitBtn: any = {
        isClicked: false

    }

    // Forms
    addExpenditure_form: FormGroup;
    createFreelancer_form: FormGroup;

    recordTypes: any = [];
    expenseTypeArray: any = [];
    selectedExpenseType: any = {};
    minimumDate: Date;

    rangeDates: Date[];
    // Currency DD
    currencyList: SelectItem[];

    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;

    // MenuList
    expenditureMenuList: any = [];
    // hideDatesSectiuon: boolean = false;


    @ViewChild("target", { static: true }) MyProp: ElementRef;
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    @ViewChild('caFileInput', { static: false }) caFileInput: ElementRef;

    everysec$: Observable<number> = timer(0, 1000);

    // List of Subscribers 
    private subscription: Subscription = new Subscription();

    constructor(
        public messageService: MessageService,
        private fb: FormBuilder,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private globalService: GlobalService,
        public fdConstantsService: FdConstantsService,
        private resolver: ComponentFactoryResolver,
        public fdDataShareServie: FDDataShareService,
        private nodeService: NodeService,
        private datePipe: DatePipe,
        private router: Router,
        private commonService: CommonService,
    ) { }

    async ngOnInit() {

        // Testing for observable
        // this.subscription = this.everysec$.subscribe(sec => console.log(sec));

        // SetDefault Values
        const last3Days = this.commonService.getLastWorkingDay(65, new Date());
        this.rangeDates = [last3Days, new Date()];

        // Tabs list
        this.expenditureMenuList = [
            { label: 'Pending Expense', routerLink: ['pending'] },
            { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'] },
            { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'] },
            { label: 'Approved(Billable)', routerLink: ['approvedBillable'] }
        ];
        // if(this.router.url === '/financeDashboard/expenditure/pending') {
        //     this.fdConstantsService.fdComponent.hideDatesSection = true;
        // }
        // else {
        //     this.fdConstantsService.fdComponent.hideDatesSection = false;
        // }
        this.expenditureFormField();

        // Freelancer Form Field
        this.createFreelancerFormFiled();

        this.getCurrencyListItem();


        this.recordTypes = [
            { label: 'Freelancer', value: 'Freelancer' },
            { label: 'Vendor', value: 'Vendor' },
            { label: 'Contractor', value: 'Contractor' },
        ];

        this.expenseTypeArray = [
            { label: 'Submission Fee', value: 'Submission Fee' },
            { label: 'Page Charges', value: 'Page Charges' },
            { label: 'Open Access', value: 'Open Access' },
            { label: 'Printing', value: 'Printing' },
            { label: 'Permission And Copyrights', value: 'Permission and Copyrights' },
            { label: 'Full Text Purchases', value: 'Full Text Purchases' },
            { label: 'Vendor', value: 'Vendor' },
            { label: 'Freelancer', value: 'Freelancer' },
            { label: 'Travelling', value: 'Travelling' },
            { label: 'Shipping / Logistic', value: 'Shipping / Logistic' },
            { label: 'Others', value: 'Others' }
        ]

        this.selectedExpenseType = { label: 'SubmissionFee', value: 'Submission Fee' };
    }

    getCurrencyListItem() {
        this.currencyList = [
            { label: 'AUD', value: 'AUD' },
            { label: 'CNY', value: 'CNY' },
            { label: 'BRL', value: 'BRL' },
            { label: 'DKK', value: 'DKK' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
            { label: 'INR', value: 'INR' },
            { label: 'JPY', value: 'JPY' },
            { label: 'KRW', value: 'KRW' },
            { label: 'USD', value: 'USD' },
            { label: 'SGD', value: 'SGD' },
            { label: 'NTD', value: 'NTD' }
        ]
    }

    // Project Info 
    projectInfoData: any = [];
    async projectInfo() {
        // Check PI list
        // const res = await this.fdDataShareServie.checkProjectsAvailable();
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
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

    // Client Legal Entity 
    cleData: any = [];
    cleInfo() {
        this.subscription.add(this.fdDataShareServie.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('Client Legal Entity ', this.cleData);
            }
        }))
    }

    // Budget Rate Master
    brmData: any = [];
    brmInfo() {
        this.subscription.add(this.fdDataShareServie.defaultBRMData.subscribe((res) => {
            if (res) {
                this.brmData = res;
                console.log('Budget Rate Master ', this.brmData);
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

    expenditureFormField() {
        this.addExpenditure_form = this.fb.group({
            PaymentRequest: new FormControl('', Validators.required),
            Billable: ['', Validators.required],
            FreelancerVenderName: new FormControl('', Validators.required),
            // PayingEntity: new FormControl('', Validators.required),
            InvoiceNo: ['', Validators.required],
            Currency: ['', Validators.required],
            Amount: ['', Validators.required],
            // PaymentMode: new FormControl('', Validators.required),
            SpendType: ['', Validators.required],
            Notes: [''],
            FileURL: ['', Validators.required],
            CAFileURL: ['', Validators.required],
            // ProjectCode: ['', Validators.required],
        })
    }

    createFreelancerFormFiled() {
        this.createFreelancer_form = this.fb.group({
            Title: ['', [Validators.required, Validators.maxLength(50)]],
            RecordType: ['', [Validators.required]],
            PhoneNo: ['', [Validators.required, Validators.maxLength(15)]],
            Email: ['', [Validators.required, Validators.email]],
            Address: ['', Validators.required],
            BilledTo: ['', Validators.required],
            CreditPeriod: ['', Validators.required],
            ContractStartDate: ['', Validators.required],
            ContractEndDate: [''],
            BillingTerms: ['', Validators.required],
            WLA: ['', Validators.required],
            NDA: ['', Validators.required],
            // File: new FormControl('', Validators.required),
        })
    }

    // Date Range
    SelectedDateRange() {
        console.log('Selected Date Range ', this.rangeDates);
        if (this.rangeDates) {
            this.setDefaultDateRange();
        }
    }

    setDefault() {
        const last3Days = this.commonService.getLastWorkingDay(65, new Date());
        const dates = [last3Days, new Date()];
        let startDate = new Date(this.datePipe.transform(dates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
        let endDate = new Date(this.datePipe.transform(dates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
        let obj = {
            startDate: startDate,
            endDate: endDate
        }
        this.fdDataShareServie.expenseDateRange = obj;
        this.fdDataShareServie.sendExpenseDateRange(obj);
    }

    setDefaultDateRange() {
        // SetDefault Values
        if (this.rangeDates) {
            let startDate = new Date(this.datePipe.transform(this.rangeDates[0], "yyyy-MM-dd") + " 00:00:00").toISOString();
            let endDate = new Date(this.datePipe.transform(this.rangeDates[1], "yyyy-MM-dd") + " 23:59:00").toISOString();
            let obj = {
                startDate: startDate,
                endDate: endDate
            }
            this.fdDataShareServie.expenseDateRange = obj;
            this.fdDataShareServie.sendExpenseDateRange(obj);
            console.log('startDate ' + startDate + ' endDate' + endDate)
        }
    }
    cleList: any = {};
    selectedBillable() {
        if (this.addExpenditure_form.value.Billable === 'Billable') {
            if (this.isPICleEmpty(this.piCleData[1])) {
                this.cleList = this.piCleData[1];
                this.piCleData[1] = {};
            }
        } else if (this.addExpenditure_form.value.Billable === 'Non Billable') {
            if (this.cleList.hasOwnProperty('label')) {
                this.piCleData[1] = this.cleList;
            }
        }
    }

    isPICleEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return true;
        }
        return false;
    }


    selectedRequest() {
        console.log('selected Request ', this.addExpenditure_form.value.PaymentRequest);
        if (this.addExpenditure_form.value.PaymentRequest === 'Credit Card') {
            // this.addExpenditure_form.removeControl('InvoiceNo');
            this.addExpenditure_form.addControl('InvoiceNo', new FormControl(''));
            this.addExpenditure_form.controls['InvoiceNo'].disable();
        } else if (this.addExpenditure_form.value.PaymentRequest === 'Invoice Payment') {
            this.addExpenditure_form.addControl('InvoiceNo', new FormControl('', Validators.required));
            this.addExpenditure_form.controls['InvoiceNo'].enable();
        }
    }

    // Initialize methods
    async initialize() {
        // For Mail
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        console.log('this.currentUserInfoData  ', this.currentUserInfoData);
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
        this.getVendorFreelanceData();
        await this.getMailContent();
        this.showHideREModal = true;
    }

    requestExpense() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        this.initialize();
        this.biilingEntityInfo();
        this.projectInfo();
        this.resourceCInfo();
        // Empty Selected Project & Client Array before push
        // this.eventsSubject.next()
        this.selectedPCArrays = [{ ProjectCode: '' }];
        this.cleInfo();
        this.brmInfo();
        this.gropDDData();
        this.cmLevelIdList = [];
    }

    freeLancerModal: boolean = false;
    openFreelancerModal() {
        this.freeLancerModal = !this.freeLancerModal;
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }

    freelancerVendersRes: any = [];
    async getVendorFreelanceData() {
        let data = [
            { query: this.spServices.getReadURL('' + this.constantService.listNames.VendorFreelancer.name + '', this.fdConstantsService.fdComponent.addUpdateFreelancer) },
        ]
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        // let vfQuery = this.spServices.getReadURL('' + this.constantService.listNames.VendorFreelancer.name + '', this.fdConstantsService.fdComponent.addUpdateFreelancer);

        let endPoints = data;
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element.query);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        const res = await this.spServices.getFDData(batchGuid, userBatchBody);
        arrResults = res;
        if (arrResults.length) {
            // console.log(arrResults);
            this.freelancerVendersRes = arrResults[0];
            console.log('this.freelancerVendersRes ', this.freelancerVendersRes);
        }
    }

    piCleData: any = [];
    datas: any = [];
    gropDDData() {
        this.piCleData = [];
        this.datas = [];
        // this.piCleData = this.projectInfoData.concat(this.cleData);
        // this.piCleData = [...this.projectInfoData, ...this.cleData];
        for (let i = 0; i < this.projectInfoData.length; i++) {
            const element = this.projectInfoData[i];
            let projectType = element.ProjectType.toLowerCase();
            if (projectType.indexOf("writing") > -1) {
                this.piCleData.push({
                    label: element.ProjectCode,
                    value: element
                })
            }
        }
        this.piCleData = [...this.piCleData];
        const pidata = [{ label: 'Project Code', items: this.piCleData }];
        for (let i = 0; i < this.cleData.length; i++) {
            const element = this.cleData[i];
            this.datas.push({
                label: element.Title,
                value: element
            })
        }
        this.datas = [...this.datas];
        const cledata = [{ label: 'Client', items: this.datas }];
        this.piCleData = [...pidata, ...cledata];
        console.log('this.piCleData ', this.piCleData);
    }

    // Mail Contetn
    mailContentRes: any;
    async getMailContent() {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        let mailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace("{{MailType}}", 'CreateExpense'),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        }

        let obj = [{
            url: this.spServices.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }]
        const res = await this.spServices.executeBatch(obj);
        this.mailContentRes = res;
        console.log('Mail Content res ', this.mailContentRes);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }


    totalLineItems: any = [
        {
            ProjectCode: '',
            AmountPerProject: '',
            projectItem: '',
        }
    ];
    initializeProjectClient() {
        this.totalLineItems = [
            {
                ProjectCode: '',
                AmountPerProject: '',
                projectItem: '',
            }
        ];
    }

    addProjectAmtItem() {
        if (!this.addSts) {
            this.totalLineItems.push({
                ProjectCode: '',
                AmountPerProject: ''
            });
            this.selectedPCArrays.push({ ProjectCode: '' });
            console.log('this.totalLineItems ', this.totalLineItems);
        } else {
            this.messageService.add({ key: 'expenseInfoToast', severity: 'info', summary: 'Info message', detail: 'Your entered amount is equal to actual Amount. So you  cant asign further amount.', life: 2000 });
        }
    }

    selectedPCArrays: any = [{ ProjectCode: '' }];
    selectedProjectCode(pItem: any, index: number) {
        console.log('Selected Project code ', pItem);
        let isPCPresent = pItem.hasOwnProperty('ProjectCode');
        let found = this.checkUniqueValue(isPCPresent ? pItem.ProjectCode : pItem.Title);
        if (found) {
            // console.log('this.totalLineItems ', this.totalLineItems);
            // console.log('this.selectedPCArrays ', this.selectedPCArrays);
            this.messageService.add({ key: 'expenseInfoToast', severity: 'info', summary: 'Info message', detail: 'You have already selected this project/client please select another one.', life: 4000 });
            this.totalLineItems[index] = {};
            this.selectedPCArrays[index].ProjectCode = '';

        } else {
            if (pItem.hasOwnProperty('Currency')) {
                this.selectedPCArrays[index].ProjectCode = pItem.Title;
                this.totalLineItems[index].projectItem = pItem;
                this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
                this.selectedPI[index] = pItem.CMLevel1.results;
                return;
            }
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            this.getPFByTitle(pItem.ProjectCode, index);
            this.getPIByTitle(pItem.ProjectCode, index);
            this.selectedPCArrays[index].ProjectCode = pItem.ProjectCode;
        }
        console.log('this.selectedPCArrays ', this.selectedPCArrays);
    }

    selectedPI: any = [];
    getPIByTitle(title, index) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == title) {
                this.selectedPI[index] = x.CMLevel1.results;
                console.log('this.selectedPI ', this.selectedPI);
                return x;

            }
        })
        return found ? found : ''
    }

    // Check Duplicate Value
    checkUniqueValue(pc: any) {
        let found = this.selectedPCArrays.find((x) => {
            if (x.ProjectCode == pc) {
                return x;
            }
        })
        return found ? found : ''
    }


    hBQuery: any = [];
    async getPFByTitle(ProjectCode: any, index: number) {
        const batchContents = new Array();
        const batchGuid = this.spServices.generateUUID();
        let obj = {
            filter: this.fdConstantsService.fdComponent.projectFinances.filter.replace("{{ProjectCode}}", ProjectCode),
            select: this.fdConstantsService.fdComponent.projectFinances.select,
            top: this.fdConstantsService.fdComponent.projectFinances.top,
            // orderby: this.fdConstantsService.fdComponent.projectFinances.orderby
        }
        const pfQuery = this.spServices.getReadURL('' + this.constantService.listNames.ProjectFinances.name + '', obj);

        let endPoints = [pfQuery];
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
        }

        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        const res = await this.spServices.getFDData(batchGuid, userBatchBody) //.subscribe(res => {
        arrResults = res;
        if (arrResults.length) {
            console.log(arrResults[0]);
            if (!arrResults[0].length) {
                this.messageService.add({ key: 'expenseInfoToast', severity: 'info', summary: 'Info message', detail: 'Currency not found for selected project / client.', life: 4000 });
                this.totalLineItems[index] = {};
                this.selectedPCArrays[index].ProjectCode = '';
                this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
                return;
            }
            this.totalLineItems[index].projectItem = arrResults[0][0];
            // Check Is proejct code & amount are Enter
            this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });

    }

    cancelFormSub(formType) {
        if (formType === 'addExpenditure') {
            this.showHideREModal = false;
            this.expenditureFormField();
            this.addExpenditure_form.reset();
            this.totalLineItems = [];
            this.addSts = false;
            this.initializeProjectClient();
        } else if (formType === 'createFreelancer') {
            this.createFreelancer_form.reset();
            this.freeLancerModal = false;
        }
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
        this.subscription.unsubscribe();
    }

    get isValidExpenditureForm() {
        return this.addExpenditure_form.controls;
    }

    get isValidCreateFreelancerForm() {
        return this.createFreelancer_form.controls;
    }

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        // let charCode = (event.which) ? event.which : event.keyCode;
        // if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
        //     return false;
        // return true;
    }

    refAmt(e) {
        this.addSts = false;
    }

    addSts: boolean = false;
    enteredAmt(val, index) {
        console.log('val ', val, 'index  ', index);
        let totalAmt = 0;
        for (let j = 0; j < this.totalLineItems.length; j++) {
            const element = this.totalLineItems[j];
            totalAmt += parseFloat(element.AmountPerProject ? element.AmountPerProject : 0)
        }
        let expenditureAmt = parseFloat(this.addExpenditure_form.value.Amount);
        // let amt = parseInt(val);
        this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
        if (totalAmt <= expenditureAmt) {
            // this.addSts = false;
            this.addSts = totalAmt === expenditureAmt ? true : false;
        } else {
            this.addSts = false;
            val = 0;
            // this.totalLineItems[index].AmountPerProject = '';
            this.messageService.add({ key: 'expenseInfoToast', severity: 'info', summary: 'Info message', detail: 'Your entered amount greater than actual Amount.', life: 4000 });
            let obj: any = this.totalLineItems[index];
            obj.AmountPerProject = val;
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            this.totalLineItems[index] = obj;
            const arrItems = this.totalLineItems;
            this.totalLineItems = [...[]];

            setTimeout(async () => {
                this.totalLineItems = [...arrItems];
                this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
            }, 300);
        }


        // Currency Conversion
        // for (let pi = 0; pi < this.totalLineItems.length; pi++) {
        //     const element = this.totalLineItems[pi];
        //     if (this.addExpenditure_form.value.Currency != element.projectItem.Currency) {
        //         let cc = this.getConversionRate(this.addExpenditure_form.value.Currency);
        //         let pcurrency = this.getConversionRate(element.projectItem.Currency);
        //         console.log('CC ', cc);
        //         console.log('pcurrency ', pcurrency);
        //         let amt = this.convertAmtToCC(parseFloat(cc), parseFloat(pcurrency), parseFloat(element.AmountPerProject));
        //         console.log('amt ----- ', amt);
        //     }
        // }
    }

    convertAmtToCC(cc, pcurrency, amt) {
        console.log('brmData ', this.brmData);
        let convertedAmt = (cc * amt) / pcurrency;
        console.log('convertedAmt ', convertedAmt);
        return convertedAmt;
    }


    // Get Conversion Rate
    getConversionRate(currency: any) {
        let found = this.brmData.find((x) => {
            if (x.Title === currency) {
                return x;
            }
        })
        return found ? found.ConversionRate : ''
    }

    isEmpty(obj) {
        for (var key in obj) {
            let value = obj[key];
            let amtVal = value.AmountPerProject ? false : true;

            if (!value.ProjectCode || amtVal || !value.projectItem)
                return true;
        }
        return false;
    }

    cvEmailIdFound: boolean = false;
    isUniqueClientVendorEmailID() {
        let enteredEmailId = this.createFreelancer_form.value.Email;
        var found = this.freelancerVendersRes.find(function (ele: any) {
            return ele.Email === enteredEmailId;
        });
        this.cvEmailIdFound = found ? true : false;
        return found ? true : false;
    }

    contractSDate() {
        if (this.createFreelancer_form.value.ContractStartDate) {
            this.minimumDate = new Date(this.datePipe.transform(this.createFreelancer_form.value.ContractStartDate, "M dd, yy"));
            this.minimumDate.setDate(this.minimumDate.getDate() + 1);
        }
    }

    contractEDate() {
        if (!this.createFreelancer_form.value.ContractStartDate) {
            this.messageService.add({ key: 'expenseErrorToast', severity: 'error', summary: 'Error message', detail: 'Please select Contract start date first & try again.', life: 3000 });
            this.createFreelancer_form.get('ContractEndDate').setValue('');
        }
    }

    finalAddEArray: any = [];
    projectClientIsEmpty: boolean = false;
    onSubmit(type: string) {
        if (type === 'addExpenditure') {
            this.submitBtn.isClicked = true;
            this.getResCatByCMLevel();
            this.formSubmit.isSubmit = true;
            this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
            if (this.addExpenditure_form.invalid || this.projectClientIsEmpty) {
                this.submitBtn.isClicked = false;
                return;
            }

            if (!this.addSts) {
                // this.totalLineItems[index].AmountPerProject = '';
                this.messageService.add({ key: 'expenseInfoToast', severity: 'info', summary: 'Info message', detail: 'Your entered amount is less than actual Amount.', life: 4000 });
                return;
            }
            console.log('form is submitting ..... this.addExpenditure_form ', this.addExpenditure_form.value);
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            this.uploadFileData();

        } else if (type === 'createFreelancer') {
            this.formSubmit.isSubmit = true;
            if (this.createFreelancer_form.invalid || this.cvEmailIdFound) {
                return;
            }
            this.submitBtn.isClicked = true;
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            console.log('form is submitting ..... this.addExpenditure_form ', this.createFreelancer_form.value);
            this.createFreelancer_form.get('BilledTo').setValue(this.createFreelancer_form.value.BilledTo.Title);
            this.createFreelancer_form.get('RecordType').setValue(this.createFreelancer_form.value.RecordType.value);
            this.createFreelancer_form.value["__metadata"] = { type: 'SP.Data.VendorFreelancerListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateFreelancer.create;
            let formValue: any = this.createFreelancer_form.value;
            if (!formValue.ContractEndDate) {
                formValue.ContractEndDate = null;
            }
            let data = [
                {
                    objData: formValue,
                    endpoint: endpoint,
                    requestPost: true
                }
            ]
            this.submitForm(data, type);
        }
    }
    pcmLevels: any = [];

    submitExpediture() {
        if (this.fileUploadedUrl && this.caFileUploadedUrl) {
            this.finalAddEArray = [];
            for (let pi = 0; pi < this.totalLineItems.length; pi++) {
                const element = this.totalLineItems[pi];
                this.pcmLevels = [];
                if (element) {
                    for (let i = 0; i < element.ProjectCode.CMLevel1.results.length; i++) {
                        const ele = element.ProjectCode.CMLevel1.results[i];
                        this.pcmLevels.push(ele);
                    }
                    this.pcmLevels.push(element.ProjectCode.CMLevel2);
                }
                let finalAmt = element.AmountPerProject;
                if (this.addExpenditure_form.value.Currency != element.projectItem.Currency) {
                    let cc = this.getConversionRate(this.addExpenditure_form.value.Currency);
                    let pcurrency = this.getConversionRate(element.projectItem.Currency);
                    console.log('CC ', cc);
                    console.log('pcurrency ', pcurrency);
                    let amt = this.convertAmtToCC(parseFloat(cc), parseFloat(pcurrency), parseFloat(element.AmountPerProject));
                    console.log('amt ----- ', amt);
                    finalAmt = parseFloat(amt.toFixed(2));
                }
                this.finalAddEArray.push({
                    Title: element.ProjectCode.ProjectCode ? element.ProjectCode.ProjectCode : element.projectItem.Title,
                    Number: this.addExpenditure_form.value.InvoiceNo,
                    SpendType: this.addExpenditure_form.value.SpendType.value,
                    // PaymentMode: this.addExpenditure_form.value.PaymentMode.value,
                    Currency: this.addExpenditure_form.value.Currency,
                    Amount: element.AmountPerProject,
                    ClientCurrency: element.projectItem.Currency,
                    ClientAmount: finalAmt.toString(),
                    Status: 'Created',
                    FileURL: this.fileUploadedUrl,
                    ClientApprovalFileURL: this.caFileUploadedUrl,
                    Notes: this.addExpenditure_form.value.Notes,
                    Category: this.addExpenditure_form.value.Billable,
                    CSId: { results: this.pcmLevels.map(x => x.ID) },
                    // ApproverFileUrl: '',
                    // PayingEntity: this.addExpenditure_form.value.PayingEntity.Title,
                    RequestType: this.addExpenditure_form.value.PaymentRequest,
                    VendorFreelancer: this.addExpenditure_form.value.FreelancerVenderName.Id,
                })
            }

            let data = [];
            const endpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.create;
            for (let j = 0; j < this.finalAddEArray.length; j++) {
                const element = this.finalAddEArray[j];
                element["__metadata"] = { type: 'SP.Data.SpendingInfoListItem' };
                data.push({
                    objData: element,
                    endpoint: endpoint,
                    requestPost: true,
                })
            }
            this.submitForm(data, 'addExpenditure');
        }
        console.log('finalAddEArray ', this.finalAddEArray);
    }

    // Upload File

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    fileUploadedUrl: any;
    onFileChange(event, folderName) {
        console.log("Event ", event);
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.addExpenditure_form.get('FileURL').setValue('');
                this.messageService.add({ key: 'expenseErrorToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
                return false;
            }
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                console.log('selectedFile ', this.selectedFile);
                console.log('this.fileReader  ', this.fileReader.result);
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

    async uploadFileData() {
        const res = await this.spServices.uploadFile(this.filePathUrl, this.fileReader.result);
        if (res.ServerRelativeUrl) {
            this.fileUploadedUrl = res.ServerRelativeUrl;
            this.uploadCAFileData();
        } else if (res.hasError) {
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
            this.submitBtn.isClicked = false;
            this.messageService.add({ key: 'expenseErrorToast', severity: 'error', summary: 'Error message', detail: 'File not uploaded,Folder / ' + res.message.value + '', life: 3000 })
        }
    }

    // Upload Client Approval File
    selectedCAFile: any;
    cafilePathUrl: any;
    cafileReader: any;
    caFileUploadedUrl: any;
    caOnFileChange(event, folderName) {
        console.log("Event ", event);
        this.cafileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.selectedCAFile = event.target.files[0];
            const fileName = this.selectedCAFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.caFileInput.nativeElement.value = '';
                this.addExpenditure_form.get('CAFileURL').setValue('');
                this.messageService.add({ key: 'expenseErrorToast', severity: 'error', summary: 'Error message', detail: 'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'', life: 3000 });
                return false;
            }
            this.cafileReader.readAsArrayBuffer(this.selectedCAFile);
            this.cafileReader.onload = () => {
                let date = new Date();
                let folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/' + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';
                this.cafilePathUrl = this.globalService.sharePointPageObject.webRelativeUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" + "&@TargetFileName='" + this.selectedCAFile.name + "'";
            };
        }
    }

    async uploadCAFileData() {
        const res = await this.spServices.uploadFile(this.cafilePathUrl, this.cafileReader.result);
        if (res.ServerRelativeUrl) {
            this.caFileUploadedUrl = res.ServerRelativeUrl;
            this.submitExpediture();
        } else if (res.hasError) {
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
            this.submitBtn.isClicked = false;
            this.messageService.add({ key: 'expenseErrorToast', severity: 'error', summary: 'Error message', detail: 'File not uploaded,Folder / ' + res.message.value + '', life: 3000 })
        }
    }

    batchContents: any = [];
    async submitForm(dataEndpointArray, type: string) {
        this.batchContents = [];
        const batchGuid = this.spServices.generateUUID();
        const changeSetId = this.spServices.generateUUID();
        // const batchContents = this.spServices.getChangeSetBody1(changeSetId, endpoint, JSON.stringify(obj), true);
        dataEndpointArray.forEach(element => {
            if (element)
                this.batchContents = [...this.batchContents, ...this.spServices.getChangeSetBody1(changeSetId, element.endpoint, JSON.stringify(element.objData), element.requestPost)];
        });
        this.batchContents.push('--changeset_' + changeSetId + '--');
        const batchBody = this.batchContents.join('\r\n');
        const batchBodyContent = this.spServices.getBatchBodyPost1(batchBody, batchGuid, changeSetId);
        batchBodyContent.push('--batch_' + batchGuid + '--');
        const sBatchData = batchBodyContent.join('\r\n');
        const res = await this.spServices.getFDData(batchGuid, sBatchData);
        // const res = await this.spServices.executeBatch(dataEndpointArray);
        console.log('res ', res);
        if (type === "addExpenditure") {
            this.messageService.add({ key: 'expenseSuccessToast', severity: 'success', summary: 'Success message', detail: 'Expense created.', life: 2000 });
            this.showHideREModal = false;
            for (let k = 0; k < res.length; k++) {
                const element = res[k];
                this.sendCreateExpenseMail(element);
            }

        } else if (type === "createFreelancer") {
            this.messageService.add({ key: 'expenseSuccessToast', severity: 'success', summary: 'Success message', detail: this.createFreelancer_form.value.RecordType + ' created.', life: 3000 })
            this.cancelFormSub(type);
            this.getVendorFreelanceData();
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    replaceContent(mailContent, key, value) {
        return mailContent.replace(new RegExp(key, 'g'), value);
    }

    getCleByPC(item) {
        let found = this.projectInfoData.find((x) => {
            if (x.ProjectCode == item.Title) {
                return x;
            }
        })
        return found ? found : ''
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
        // for (let i = 0; i < this.rcData.length; i++) {
        //     const element = this.rcData[i];
        for (let c = 0; c < this.cmLevelIdList.length; c++) {
            const element = this.cmLevelIdList[c];
            this.resCatEmails.push(this.getResourceData(element))
        }
        console.log('resCatEmails ', this.resCatEmails);
        // }
    }

    getResourceData(ele) {
        let found = this.rcData.find((x) => {
            if (x.UserName.ID == ele.ID) {
                return x;
            }
        })
        return found ? found : ''
    }

    sendCreateExpenseMail(expense) {
        let isCleData = this.getCleByPC(expense);
        let val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.Title + ' (' + isCleData.ClientLegalEntity + ')' : expense.Title;


        var mailSubject = expense.Title + ": Expense Created";
        let mailContent = this.mailContentRes[0].retItems[0].Content;
        mailContent = this.replaceContent(mailContent, "@@Val9@@", this.currentUserInfoData.Title);
        mailContent = this.replaceContent(mailContent, "@@Val8@@", !isCleData.hasOwnProperty('ClientLegalEntity') ? "Client legal entity" : "Project");
        mailContent = this.replaceContent(mailContent, "@@Val0@@", expense.ID);
        mailContent = this.replaceContent(mailContent, "@@Val1@@", val1);
        mailContent = this.replaceContent(mailContent, "@@Val2@@", expense.Category);
        mailContent = this.replaceContent(mailContent, "@@Val4@@", expense.SpendType);
        mailContent = this.replaceContent(mailContent, "@@Val5@@", expense.Currency + ' ' + parseFloat(expense.Amount).toFixed(2));
        mailContent = this.replaceContent(mailContent, "@@Val6@@", expense.ClientAmount ? expense.ClientCurrency + ' ' + parseFloat(expense.ClientAmount).toFixed(2) : '--');
        mailContent = this.replaceContent(mailContent, "@@Val7@@", expense.Notes);
        mailContent = this.replaceContent(mailContent, "@@Val10@@", this.globalService.sharePointPageObject.rootsite + '' + expense.FileURL);
        mailContent = this.replaceContent(mailContent, "@@Val11@@", this.globalService.sharePointPageObject.rootsite + '' + expense.ClientApprovalFileURL);
        mailContent = this.replaceContent(mailContent, "@@Val12@@", expense.RequestType);

        var ccUser = [];
        ccUser.push(this.currentUserInfoData.Email);
        let tos = this.getTosList();
        this.spServices.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.reFetchData();
    }

    reFetchData() {
        this.fdDataShareServie.setExpenseAddObj();

        // Unscribe all subscribtion
        this.subscription.unsubscribe();
    }

    // Tab Action
    onExpenditureTabs(event) {
        // this.messageService.add({ key: 'expenseInfoToast', severity: 'info', summary: 'Tab Expanded' });
        console.log('Expenditure Tabs event ', event);
        if (event.index === 0) {
            // this.loadComponent('pec');
            this.router.navigate(['/financeDashboard/expenditure/pending']);
        } else if (event.index === 1) {
            // this.loadComponent('crc');
            this.router.navigate(['/financeDashboard/expenditure/cancelled-reject']);
        } else if (event.index === 2) {
            // this.loadComponent('anbc');
            this.router.navigate(['/financeDashboard/expenditure/approvedNonBillable']);
        } else if (event.index === 3) {
            // this.loadComponent('abc');
            this.router.navigate(['/financeDashboard/expenditure/approvedBillable']);
        }
    }

    ngAfterContentInit() {
        if (this.constantService.userPermission.userPermissionMsg) {
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Info message', detail: 'You don\'t have access to the url. Please contact SP team.', sticky: true });
            this.constantService.userPermission.userPermissionMsg = false;
        }
    }

    ngOnDestroy() {
        // avoid memory leaks here by cleaning up after ourselves. If we
        // don't then we will continue to run our initialiseInvites()
        // method on every navigationEnd event.
        // if (this.navigationSubscription) {
        //    this.navigationSubscription.unsubscribe();
        // }
        // this.projectInfoData.unsubscribe();
        this.fdDataShareServie.expenseDateRange = {
            startDate: '',
            endDate: '',
        }
        console.log('this.subscription ', this.subscription);
        this.subscription.unsubscribe();
    }


}
