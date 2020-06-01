import { Component, OnInit, ComponentFactoryResolver, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SPOperationService } from '../../Services/spoperation.service';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
import { FdConstantsService } from '../fdServices/fd-constants.service';
import { SelectItem } from 'primeng/api';
import { FDDataShareService } from '../fdServices/fd-shareData.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { Subject, Observable, timer, Subscription } from 'rxjs';
import { DynamicDialogRef, DialogService } from 'primeng';

@Component({
    selector: 'app-expenditure',
    templateUrl: './expenditure.component.html',
    styleUrls: ['./expenditure.component.css'],
    providers: [DynamicDialogRef]
})
export class ExpenditureComponent implements OnInit, OnDestroy {
    caFolderName: any;
    FolderName: any;

    constructor(
        private fb: FormBuilder,
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private globalService: GlobalService,
        public fdConstantsService: FdConstantsService,
        private resolver: ComponentFactoryResolver,
        public fdDataShareServie: FDDataShareService,
        private datePipe: DatePipe,
        private router: Router,
        private commonService: CommonService,
        public ref: DynamicDialogRef,
        public dialogService: DialogService,
    ) { }

    get isValidExpenditureForm() {
        return this.addExpenditure_form.controls;
    }

    get isValidCreateFreelancerForm() {
        return this.createFreelancer_form.controls;
    }

    private eventsSubject: Subject<void> = new Subject<void>();


    // Show Hide Requesr Expense Modal
    showHideREModal: boolean = false;
    formSubmit: any = {
        isSubmit: false
    };
    submitBtn: any = {
        isClicked: false
    };

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
    hBQuery: any = [];
    // hideDatesSectiuon: boolean = false;
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };

    @ViewChild('target', { static: true }) MyProp: ElementRef;
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    @ViewChild('caFileInput', { static: false }) caFileInput: ElementRef;

    everysec$: Observable<number> = timer(0, 1000);

    // List of Subscribers
    private subscription: Subscription = new Subscription();

    // Project Info
    projectInfoData: any = [];

    // Billing ENtity Data
    billingEntityData: any = [];

    // Client Legal Entity
    cleData: any = [];

    // Budget Rate Master
    brmData: any = [];

    // Resource Categorization
    rcData: any = [];
    cleList: any = {};

    freeLancerModal: boolean = false;

    freelancerVendersRes: any = [];

    piCleData: any = [];
    datas: any = [];

    // Mail Contetn
    mailContentRes: any;


    totalLineItems: any = [
        {
            ProjectCode: '',
            AmountPerProject: '',
            projectItem: '',
        }
    ];

    selectedPCArrays: any = [{ ProjectCode: '' }];

    selectedPI: any = [];

    addSts: boolean = false;

    cvEmailIdFound: boolean = false;

    finalAddEArray: any = [];
    projectClientIsEmpty: boolean = false;
    pcmLevels: any = [];

    // Upload File

    selectedFile: any;
    filePathUrl: any;
    fileReader: any;
    fileUploadedUrl: any;
    SelectedFile = [];
    // Upload Client Approval File
    selectedCAFile: any;
    cafilePathUrl: any;
    caSelectedFile: any;
    cafileReader: any;
    caFileUploadedUrl: any;

    batchContents: any = [];

    cmLevelIdList: any = [];

    resCatEmails: any = [];

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
        ];
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
        ];
    }
    async projectInfo() {
        // Check PI list
        // const res = await this.fdDataShareServie.checkProjectsAvailable();
        this.subscription.add(this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
            }
        }));
    }

    biilingEntityInfo() {
        this.subscription.add(this.fdDataShareServie.defaultBEData.subscribe((res) => {
            if (res) {
                this.billingEntityData = res;
                console.log('BE Data ', this.billingEntityData);
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

    brmInfo() {
        this.subscription.add(this.fdDataShareServie.defaultBRMData.subscribe((res) => {
            if (res) {
                this.brmData = res;
                console.log('Budget Rate Master ', this.brmData);
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
        });
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
        });
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
        const startDate = new Date(this.datePipe.transform(dates[0], 'yyyy-MM-dd') + ' 00:00:00').toISOString();
        const endDate = new Date(this.datePipe.transform(dates[1], 'yyyy-MM-dd') + ' 23:59:00').toISOString();
        const obj = {
            startDate: startDate,
            endDate: endDate
        };
        this.fdDataShareServie.expenseDateRange = obj;
        this.fdDataShareServie.sendExpenseDateRange(obj);
    }

    setDefaultDateRange() {
        // SetDefault Values
        if (this.rangeDates) {
            const startDate = new Date(this.datePipe.transform(this.rangeDates[0], 'yyyy-MM-dd') + ' 00:00:00').toISOString();
            const endDate = new Date(this.datePipe.transform(this.rangeDates[1], 'yyyy-MM-dd') + ' 23:59:00').toISOString();
            const obj = {
                startDate: startDate,
                endDate: endDate
            };
            this.fdDataShareServie.expenseDateRange = obj;
            this.fdDataShareServie.sendExpenseDateRange(obj);
            console.log('startDate ' + startDate + ' endDate' + endDate);
        }
    }

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
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return true;
            }
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
        await this.getVendorFreelanceData();
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
    openFreelancerModal() {
        this.freeLancerModal = !this.freeLancerModal;
        this.formSubmit.isSubmit = false;
        this.submitBtn.isClicked = false;
    }
    async getVendorFreelanceData() {
        // let data = [
        //     { query: this.spServices.getReadURL('' + this.constantService.listNames.VendorFreelancer.name +
        //     '', this.fdConstantsService.fdComponent.addUpdateFreelancer) },
        // ]
        // const batchContents = new Array();
        // const batchGuid = this.spServices.generateUUID();
        // // let vfQuery = this.spServices.getReadURL('' + this.constantService.listNames.VendorFreelancer.name +
        //    '', this.fdConstantsService.fdComponent.addUpdateFreelancer);

        // let endPoints = data;
        // let userBatchBody = '';
        // for (let i = 0; i < endPoints.length; i++) {
        //     const element = endPoints[i];
        //     this.spServices.getBatchBodyGet(batchContents, batchGuid, element.query);
        // }
        // batchContents.push('--batch_' + batchGuid + '--');
        // userBatchBody = batchContents.join('\r\n');
        // let arrResults: any = [];
        // const res = await this.spServices.getFDData(batchGuid, userBatchBody);
        const vendorObj = Object.assign({}, this.fdConstantsService.fdComponent.addUpdateFreelancer);
        this.commonService.SetNewrelic('Finance-Dashboard', 'expenditure', 'GetVendorFreelancerData');
        const res = await this.spServices.readItems(this.constantService.listNames.VendorFreelancer.name, vendorObj);
        const arrResults = res.length ? res : [];
        // if (arrResults.length) {
        // console.log(arrResults);
        this.freelancerVendersRes = arrResults;
        // console.log('this.freelancerVendersRes ', this.freelancerVendersRes);
        // }
    }
    gropDDData() {
        this.piCleData = [];
        this.datas = [];
        // this.piCleData = this.projectInfoData.concat(this.cleData);
        // this.piCleData = [...this.projectInfoData, ...this.cleData];
        for (let i = 0; i < this.projectInfoData.length; i++) {
            const element = this.projectInfoData[i];
            const projectType = element.ProjectType ? element.ProjectType.toLowerCase() : '';
            if (projectType.indexOf('writing') > -1) {
                this.piCleData.push({
                    label: element.ProjectCode,
                    value: element
                });
            }
        }
        this.piCleData = [...this.piCleData];
        const pidata = [{ label: 'Project Code', items: this.piCleData }];
        for (let i = 0; i < this.cleData.length; i++) {
            const element = this.cleData[i];
            this.datas.push({
                label: element.Title,
                value: element
            });
        }
        this.datas = [...this.datas];
        const cledata = [{ label: 'Client', items: this.datas }];
        this.piCleData = [...pidata, ...cledata];
        console.log('this.piCleData ', this.piCleData);
    }

    async getMailContent() {
        // const mailContentEndpoint = this.fdConstantsService.fdComponent.mailContent;
        const mailContentEndpoint = {
            filter: this.fdConstantsService.fdComponent.mailContent.filter.replace('{{MailType}}', 'CreateExpense'),
            select: this.fdConstantsService.fdComponent.mailContent.select,
            top: this.fdConstantsService.fdComponent.mailContent.top,
        };

        const obj = [{
            url: this.spServices.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }];
        this.commonService.SetNewrelic('Finance-Dashboard', 'expenditure', 'GetMailContent');
        const res = await this.spServices.executeBatch(obj);
        this.mailContentRes = res.length ? res[0].retItems : [];
        // console.log('Mail Content res ', this.mailContentRes);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

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

            this.commonService.showToastrMessage(this.constantService.MessageType.info,'Your entered amount is equal to actual Amount. So you  cant asign further amount.',false);
        }
    }
    selectedProjectCode(pItem: any, index: number) {
        console.log('Selected Project code ', pItem);
        const isPCPresent = pItem.hasOwnProperty('ProjectCode');
        const found = this.checkUniqueValue(isPCPresent ? pItem.ProjectCode : pItem.Title);
        if (found) {
            // console.log('this.totalLineItems ', this.totalLineItems);
            // console.log('this.selectedPCArrays ', this.selectedPCArrays);
            this.commonService.showToastrMessage(this.constantService.MessageType.info,'You have already selected this project/client please select another one.',false);
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

    getPIByTitle(title, index) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === title) {
                this.selectedPI[index] = x.CMLevel1.results;
                console.log('this.selectedPI ', this.selectedPI);
                return x;

            }
        });
        return found ? found : '';
    }

    // Check Duplicate Value
    checkUniqueValue(pc: any) {
        const found = this.selectedPCArrays.find((x) => {
            if (x.ProjectCode === pc) {
                return x;
            }
        });
        return found ? found : '';
    }



    async getPFByTitle(ProjectCode: any, index: number) {
        // const batchContents = new Array();
        // const batchGuid = this.spServices.generateUUID();
        const pfObj = Object.assign({}, this.fdConstantsService.fdComponent.projectFinances);
        pfObj.filter = pfObj.filter.replace('{{ProjectCode}}', ProjectCode);
        this.commonService.SetNewrelic('Finance-Dashboard', 'expenditure', 'GetPFByProjectCode');
        const res = await this.spServices.readItems(this.constantService.listNames.ProjectFinances.name, pfObj);
        const arrResults = res.length ? res : [];
        if (arrResults.length) {
            // console.log(arrResults[0]);
            if (!arrResults.length) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info,'Currency not found for selected project / client.',false);
                this.totalLineItems[index] = {};
                this.selectedPCArrays[index].ProjectCode = '';
                this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
                return;
            }
            this.totalLineItems[index].projectItem = arrResults[0];
            // Check Is proejct code & amount are Enter
            this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
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
    enteredAmt(val, index) {
        console.log('val ', val, 'index  ', index);
        let totalAmt = 0;
        for (let j = 0; j < this.totalLineItems.length; j++) {
            const element = this.totalLineItems[j];
            totalAmt += parseFloat(element.AmountPerProject ? element.AmountPerProject : 0);
        }
        const expenditureAmt = parseFloat(this.addExpenditure_form.value.Amount);
        // let amt = parseInt(val);
        this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
        if (totalAmt <= expenditureAmt) {
            // this.addSts = false;
            this.submitBtn.isClicked = false;
            this.addSts = totalAmt === expenditureAmt ? true : false;
        } else {
            this.addSts = false;
            val = 0;
            // this.totalLineItems[index].AmountPerProject = '';

            this.commonService.showToastrMessage(this.constantService.MessageType.info,'Your entered amount greater than actual Amount.',false);
            const obj: any = this.totalLineItems[index];
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
    }

    convertAmtToCC(cc, pcurrency, amt) {
        console.log('brmData ', this.brmData);
        const convertedAmt = (cc * amt) / pcurrency;
        console.log('convertedAmt ', convertedAmt);
        return convertedAmt;
    }


    // Get Conversion Rate
    getConversionRate(currency: any) {
        const found = this.brmData.find((x) => {
            if (x.Title === currency) {
                return x;
            }
        });
        return found ? found.ConversionRate : '';
    }

    isEmpty(obj) {
        for (const key in obj) {
            const value = obj[key];
            const amtVal = value.AmountPerProject ? false : true;

            if (!value.ProjectCode || amtVal || !value.projectItem)
                return true;
        }
        return false;
    }
    isUniqueClientVendorEmailID() {
        const enteredEmailId = this.createFreelancer_form.value.Email;
        const found = this.freelancerVendersRes.find(function (ele: any) {
            return ele.Email === enteredEmailId;
        });
        this.cvEmailIdFound = found ? true : false;
        return found ? true : false;
    }

    contractSDate() {
        if (this.createFreelancer_form.value.ContractStartDate) {
            this.minimumDate = new Date(this.datePipe.transform(this.createFreelancer_form.value.ContractStartDate, 'M dd, yy'));
            this.minimumDate.setDate(this.minimumDate.getDate() + 1);
        }
    }

    contractEDate() {
        if (!this.createFreelancer_form.value.ContractStartDate) {

            this.commonService.showToastrMessage(this.constantService.MessageType.error,'Please select Contract start date first & try again.',false);
            this.createFreelancer_form.get('ContractEndDate').setValue('');
        }
    }

    onSubmit(type: string) {
        if (type === 'addExpenditure') {

            if (this.addExpenditure_form.invalid || this.projectClientIsEmpty) {
                return;
            }
            if (!this.addSts) {
                // this.totalLineItems[index].AmountPerProject = '';
                this.commonService.showToastrMessage(this.constantService.MessageType.info,'Your entered amount is less than actual Amount.',false);
                return;
            }
            if (this.SelectedFile[0].file.size === 0) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info,'Unable to upload file, size of ' + this.SelectedFile[0].file.name + ' is 0 KB.',false);
                return;
            }
            else if (this.caSelectedFile[0].file.size === 0) {

                this.commonService.showToastrMessage(this.constantService.MessageType.info,'Unable to upload file, size of ' + this.caSelectedFile[0].file.name + ' is 0 KB.',false);
                return;
            }
            this.submitBtn.isClicked = true;
            this.getResCatByCMLevel();
            this.formSubmit.isSubmit = true;
            this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
            this.uploadFileData();

        } else if (type === 'createFreelancer') {
            const batchUrl = [];
            this.formSubmit.isSubmit = true;
            if (this.createFreelancer_form.invalid || this.cvEmailIdFound) {
                return;
            }
            this.submitBtn.isClicked = true;
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            this.createFreelancer_form.get('BilledTo').setValue(this.createFreelancer_form.value.BilledTo.Title);
            this.createFreelancer_form.get('RecordType').setValue(this.createFreelancer_form.value.RecordType.value);
            this.createFreelancer_form.value['__metadata'] = { type: 'SP.Data.VendorFreelancerListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateFreelancer.create;
            const formValue: any = this.createFreelancer_form.value;
            if (!formValue.ContractEndDate) {
                formValue.ContractEndDate = null;
            }

            const getPrjContactItemData = Object.assign({}, this.queryConfig);
            getPrjContactItemData.url = this.spServices.getReadURL(this.constantService.listNames.VendorFreelancer.name);
            getPrjContactItemData.listName = this.constantService.listNames.VendorFreelancer.name;
            getPrjContactItemData.type = 'POST';
            getPrjContactItemData.data = formValue;
            batchUrl.push(getPrjContactItemData);
            this.submitForm(batchUrl, type);
        }
    }

    submitExpediture() {
        if (this.fileUploadedUrl && this.caFileUploadedUrl) {
            this.finalAddEArray = [];
            const batchUrl = [];
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
                if (this.addExpenditure_form.value.Currency !== element.projectItem.Currency) {
                    const cc = this.getConversionRate(this.addExpenditure_form.value.Currency);
                    const pcurrency = this.getConversionRate(element.projectItem.Currency);
                    // console.log('CC ', cc);
                    // console.log('pcurrency ', pcurrency);
                    const amt = this.convertAmtToCC(parseFloat(cc), parseFloat(pcurrency), parseFloat(element.AmountPerProject));
                    // console.log('amt ----- ', amt);
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
                });
            }

            // let data = [];
            // const endpoint = this.fdConstantsService.fdComponent.addUpdateSpendingInfo.create;
            for (let j = 0; j < this.finalAddEArray.length; j++) {
                const element = this.finalAddEArray[j];
                element['__metadata'] = { type: 'SP.Data.SpendingInfoListItem' };
                // data.push({
                //     objData: element,
                //     endpoint: endpoint,
                //     requestPost: true,
                // })
                const addExpenseObj = Object.assign({}, this.queryConfig);
                addExpenseObj.url = this.spServices.getReadURL(this.constantService.listNames.SpendingInfo.name);
                addExpenseObj.listName = this.constantService.listNames.SpendingInfo.name;
                addExpenseObj.type = 'POST';
                addExpenseObj.data = element;
                batchUrl.push(addExpenseObj);
            }
            this.submitForm(batchUrl, 'addExpenditure');
        }
        console.log('finalAddEArray ', this.finalAddEArray);
    }

    onFileChange(event, folderName) {
        console.log('Event ', event);
        this.fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.SelectedFile = [];
            this.selectedFile = event.target.files[0];
            const fileName = this.selectedFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.fileInput.nativeElement.value = '';
                this.addExpenditure_form.get('FileURL').setValue('');
                this.commonService.showToastrMessage(this.constantService.MessageType.error,'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'',false);
                return false;
            }
            this.FolderName = folderName;
            this.SelectedFile.push(new Object({ name: sNewFileName, file: this.selectedFile }));

        }
    }



    async uploadFileData() {
        const date = new Date();
        this.commonService.SetNewrelic('Finance-Dashboard', 'expenditure', 'FileUpolad');
        this.commonService.UploadFilesProgress(this.SelectedFile, 'SpendingInfoFiles/' + this.FolderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM'), true).then(async uploadedfile => {
            if (this.SelectedFile.length > 0 && this.SelectedFile.length === uploadedfile.length) {
                if (uploadedfile[0].hasOwnProperty('odata.error') || uploadedfile[0].hasError) {
                    this.submitBtn.isClicked = false;
                    this.commonService.showToastrMessage(this.constantService.MessageType.error,'File not uploaded, Folder / File Not Found',false);
                } else if (uploadedfile[0].ServerRelativeUrl) {
                    this.fileUploadedUrl = uploadedfile[0].ServerRelativeUrl;
                    this.uploadCAFileData();
                }
            }
        });
    }


    caOnFileChange(event, folderName) {
        // console.log('Event ', event);
        // this.cafileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            this.caSelectedFile = [];
            this.selectedCAFile = event.target.files[0];
            const fileName = this.selectedCAFile.name;
            const sNewFileName = fileName.replace(/[~#%&*\{\}\\:/\+<>?"'@/]/gi, '');
            if (fileName !== sNewFileName) {
                this.caFileInput.nativeElement.value = '';
                this.addExpenditure_form.get('CAFileURL').setValue('');

                this.commonService.showToastrMessage(this.constantService.MessageType.error,'Special characters are found in file name. Please rename it. List of special characters ~ # % & * { } \ : / + < > ? " @ \'',false);
                return false;
            }
            this.caFolderName = folderName;
            this.caSelectedFile.push(new Object({ name: sNewFileName, file: this.selectedCAFile }));
        }
    }

    async uploadCAFileData() {
        const date = new Date();
        this.commonService.SetNewrelic('Finance-Dashboard', 'expenditure', 'UploadCAFiles');
        this.commonService.UploadFilesProgress(this.caSelectedFile, 'SpendingInfoFiles/' + this.caFolderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM'), true).then(async uploadedfile => {
            if (this.caSelectedFile.length > 0 && this.caSelectedFile.length === uploadedfile.length) {
                if (uploadedfile[0].hasOwnProperty('odata.error') || uploadedfile[0].hasError) {
                    this.submitBtn.isClicked = false;

                    this.commonService.showToastrMessage(this.constantService.MessageType.error,'Approve File not uploaded, Folder / File Not Found',false);
                } else if (uploadedfile[0].ServerRelativeUrl) {
                    this.caFileUploadedUrl = uploadedfile[0].ServerRelativeUrl;
                    this.submitExpediture();
                }
            }
        });
    }
    async submitForm(batchUrl, type: string) {
        let res = await this.spServices.executeBatch(batchUrl);
        res = res.length ? res.map(a => a.retItems) : [];
        if (type === 'addExpenditure') {

            this.commonService.showToastrMessage(this.constantService.MessageType.success,'Expense created.',false);
            this.showHideREModal = false;
            for (let k = 0; k < res.length; k++) {
                const element = res[k];
                this.sendCreateExpenseMail(element);
            }

        } else if (type === 'createFreelancer') {

            this.commonService.showToastrMessage(this.constantService.MessageType.success,this.createFreelancer_form.value.RecordType + ' created.',true);
            this.cancelFormSub(type);
            this.getVendorFreelanceData();
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
    }

    replaceContent(mailContent, key, value) {
        return mailContent.replace(new RegExp(key, 'g'), value);
    }

    getCleByPC(item) {
        const found = this.projectInfoData.find((x) => {
            if (x.ProjectCode === item.Title) {
                return x;
            }
        });
        return found ? found : '';
    }

    getTosList() {
        const approvers = this.groupInfo.results;
        let arrayTo = [];
        if (approvers.length) {
            for (const a in approvers) {
                if (approvers[a].Email !== undefined && approvers[a].Email !== '') {
                    arrayTo.push(approvers[a].Email);
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

        const itApprovers = this.groupITInfo.results;
        // Invoice Team Member
        if (itApprovers.length) {
            arrayCC = arrayCC.concat(this.fdDataShareServie.getITMember(itApprovers));
        }

        // CS Team Member
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
        // for (let i = 0; i < this.rcData.length; i++) {
        //     const element = this.rcData[i];
        for (const c of this.cmLevelIdList) {
            this.resCatEmails.push(this.getResourceData(c));
        }
        // for (let c = 0; c < this.cmLevelIdList.length; c++) {
        //     const element = this.cmLevelIdList[c];
        //     this.resCatEmails.push(this.getResourceData(element))
        // }
        console.log('resCatEmails ', this.resCatEmails);
        // }
    }

    getResourceData(ele) {
        const found = this.rcData.find((x) => {
            if (x.UserName.ID === ele.ID) {
                return x;
            }
        });
        return found ? found : '';
    }

    sendCreateExpenseMail(expense) {
        const isCleData = this.getCleByPC(expense);
        const val1 = isCleData.hasOwnProperty('ClientLegalEntity') ? expense.Title + ' (' + isCleData.ClientLegalEntity + ')' :
            expense.Title;

        if (this.mailContentRes.length) {
            const mailSubject = expense.Title + ': Expense Created';
            let mailContent = this.mailContentRes[0].Content;
            mailContent = this.replaceContent(mailContent, '@@Val9@@', this.currentUserInfoData.Title);
            mailContent = this.replaceContent(mailContent, '@@Val8@@', !isCleData.hasOwnProperty('ClientLegalEntity') ?
                'Client legal entity' : 'Project');
            mailContent = this.replaceContent(mailContent, '@@Val0@@', expense.ID);
            mailContent = this.replaceContent(mailContent, '@@Val1@@', val1);
            mailContent = this.replaceContent(mailContent, '@@Val2@@', expense.Category);
            mailContent = this.replaceContent(mailContent, '@@Val4@@', expense.SpendType);
            mailContent = this.replaceContent(mailContent, '@@Val5@@', expense.Currency + ' ' + parseFloat(expense.Amount).toFixed(2));
            mailContent = this.replaceContent(mailContent, '@@Val6@@', expense.ClientAmount ? expense.ClientCurrency +
                ' ' + parseFloat(expense.ClientAmount).toFixed(2) : '--');
            mailContent = this.replaceContent(mailContent, '@@Val7@@', expense.Notes);
            mailContent = this.replaceContent(mailContent, '@@Val10@@', this.globalService.sharePointPageObject.rootsite +
                '' + expense.FileURL);
            mailContent = this.replaceContent(mailContent, '@@Val11@@', this.globalService.sharePointPageObject.rootsite +
                '' + expense.ClientApprovalFileURL);
            mailContent = this.replaceContent(mailContent, '@@Val12@@', expense.RequestType);

            const ccUser = this.getCCList();
            const tos = this.getTosList();
            this.commonService.SetNewrelic('Finance-Dashboard', 'expenditure', 'SendMail');
            this.spServices.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        }
        this.reFetchData();
    }

    reFetchData() {
        this.fdDataShareServie.setExpenseAddObj();

        // Unscribe all subscribtion
        this.subscription.unsubscribe();
    }

    // Tab Action
    onExpenditureTabs(event) {
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

            this.commonService.showToastrMessage(this.constantService.MessageType.warn,'You don\'t have access to the url. Please contact SP team.',true);
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
        };
        this.subscription.unsubscribe();
    }

}
