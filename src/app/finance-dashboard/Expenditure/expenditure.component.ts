import { Component, OnInit, ComponentFactoryResolver, ViewChild, ElementRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SharepointoperationService } from '../../Services/sharepoint-operation.service';
import { ConstantsService } from '../../Services/constants.service';
import { GlobalService } from '../../Services/global.service';
import { FdConstantsService } from '../fdServices/fd-constants.service';
import { SelectItem } from 'primeng/api';
import { FDDataShareService } from '../fdServices/fd-shareData.service';
import { NodeService } from 'src/app/node.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
    selector: 'app-expenditure',
    templateUrl: './expenditure.component.html',
    styleUrls: ['./expenditure.component.css']
})
export class ExpenditureComponent implements OnInit {

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
    minimumDate = new Date();

    rangeDates: Date[];
    // Currency DD
    currencyList: SelectItem[];

    // For Mail
    currentUserInfoData: any;
    groupInfo: any;
    groupITInfo: any;

    // MenuList
    expenditureMenuList: any = [];

    @ViewChild("target", {static:true}) MyProp: ElementRef;

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private spServices: SharepointoperationService,
        private constantService: ConstantsService,
        private globalService: GlobalService,
        public fdConstantsService: FdConstantsService,
        private resolver: ComponentFactoryResolver,
        public fdDataShareServie: FDDataShareService,
        private nodeService: NodeService,
        private datePipe: DatePipe,
        private router: Router,
        private spOperationsService: SpOperationsService,
        private commonService: CommonService,
    ) {}

    async ngOnInit() {

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
            { label: 'Vendor', value: 'Vendor' }
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

        // For Mail
        this.currentUserInfoData = await this.fdDataShareServie.getCurrentUserInfo();
        console.log('this.currentUserInfoData  ', this.currentUserInfoData);
        this.groupInfo = await this.fdDataShareServie.getGroupInfo();
        console.log('this.groupInfo  ', this.groupInfo);
        this.groupITInfo = await this.fdDataShareServie.getITInfo();
        console.log('this.groupITInfo  ', this.groupITInfo);
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
    projectInfo() {
        this.fdDataShareServie.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
            }
        })

        // this.projectInfoData = this.fdDataShareServie.piData;
    }

    // Billing ENtity Data 
    billingEntityData: any = [];
    biilingEntityInfo() {
        this.fdDataShareServie.defaultBEData.subscribe((res) => {
            if (res) {
                this.billingEntityData = res;
                console.log('BE Data ', this.billingEntityData);
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

    // Budget Rate Master
    brmData: any = [];
    brmInfo() {
        this.fdDataShareServie.defaultBRMData.subscribe((res) => {
            if (res) {
                this.brmData = res;
                console.log('Budget Rate Master ', this.brmData);
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
            Notes: ['', Validators.required],
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
            ContractEndDate: ['', Validators.required],
            BillingTerms: ['', Validators.required],
            WLA: ['', Validators.required],
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
        this.fdDataShareServie.DateRange = obj;
        this.fdDataShareServie.sendDateRange(obj);
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
            this.fdDataShareServie.DateRange = obj;
            this.fdDataShareServie.sendDateRange(obj);
            console.log('startDate ' + startDate + ' endDate' + endDate)
        }
    }

    selectedBillable() {
        if (this.addExpenditure_form.value.Billable === 'Yes') {
            this.addExpenditure_form.removeControl('ExpenseOn');
            this.addExpenditure_form.removeControl('ClientLegalEntity');
            this.addExpenditure_form.addControl('PO', new FormControl('', Validators.required));
        } else if (this.addExpenditure_form.value.Billable === 'No') {
            this.addExpenditure_form.get('ProjectCode').setValue('');
            this.expenditureFormField();
            console.log(this.addExpenditure_form.value.ProjectCode);
            this.addExpenditure_form.addControl('ExpenseOn', new FormControl('', Validators.required));
            this.addExpenditure_form.addControl('ClientLegalEntity', new FormControl('', Validators.required));
            this.addExpenditure_form.removeControl('PO');
        }
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

    requestExpense() {
        // Empty Selected Project & Client Array before push
        this.selectedPCArrays = [{ ProjectCode: '' }];

        this.biilingEntityInfo();
        this.projectInfo();
        this.resourceCInfo();
        this.cleInfo();
        this.brmInfo();
        this.gropDDData();
        this.getMailContent();
        // VFData & BRM

        this.getVendorFreelanceData();


        // Empty 
        this.cmLevelIdList = [];
    }

    scroll(el: HTMLElement) {
        this.showHideREModal = true;
        this.MyProp.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

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
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            // console.log('REs in Outstanding Invoice ', res);
            arrResults = res;
            if (arrResults.length) {
                // console.log(arrResults);
                this.freelancerVendersRes = arrResults[0];
                console.log('this.freelancerVendersRes ', this.freelancerVendersRes);
            }
        });
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
        const pidata = [{ label: 'Project Code', items: this.piCleData }];
        for (let i = 0; i < this.cleData.length; i++) {
            const element = this.cleData[i];
            this.datas.push({
                label: element.Title,
                value: element
            })
        }
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
            url: this.spOperationsService.getReadURL(this.constantService.listNames.MailContent.name, mailContentEndpoint),
            type: 'GET',
            listName: this.constantService.listNames.MailContent.name
        }]
        const res = await this.spOperationsService.executeBatch(obj);
        this.mailContentRes = res;
        console.log('Mail Content res ', this.mailContentRes);
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
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Your entered amount is equal to actual Amount. So you  cant asign further amount.', detail: '', life: 2000 });
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
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'You have already selected this project/client please select another one.', detail: '', life: 4000 });
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
        await this.spServices.getData(batchGuid, userBatchBody).subscribe(res => {
            arrResults = res;
            if (arrResults.length) {
                console.log(arrResults[0]);
                if (!arrResults[0].length) {
                    this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Currency not found for selected project / client.', detail: '', life: 4000 });
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
        });

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

    }

    get isValidExpenditureForm() {
        return this.addExpenditure_form.controls;
    }

    get isValidCreateFreelancerForm() {
        return this.createFreelancer_form.controls;
    }

    onlyNumberKey(event) {
        // return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
        let charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
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
            totalAmt += parseInt(element.AmountPerProject ? element.AmountPerProject : 0)
        }
        let expenditureAmt = parseInt(this.addExpenditure_form.value.Amount);
        // let amt = parseInt(val);
        this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
        if (totalAmt <= expenditureAmt) {
            // this.addSts = false;
            this.addSts = totalAmt === expenditureAmt ? true : false;
        } else {
            this.addSts = false;
            this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Your entered amount greater than actual Amount.', detail: '', life: 4000 });
            this.totalLineItems[index].AmountPerProject = 0;
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

    finalAddEArray: any = [];
    projectClientIsEmpty: boolean = false;
    onSubmit(type: string) {
        if (type === 'addExpenditure') {
            this.getResCatByCMLevel();
            this.formSubmit.isSubmit = true;
            this.projectClientIsEmpty = this.isEmpty(this.totalLineItems);
            if (this.addExpenditure_form.invalid || this.projectClientIsEmpty) {
                return;
            }
            this.submitBtn.isClicked = true;
            console.log('form is submitting ..... this.addExpenditure_form ', this.addExpenditure_form.value);
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            this.uploadFileData();
            this.uploadCAFileData();

        } else if (type === 'createFreelancer') {
            this.formSubmit.isSubmit = true;
            if (this.createFreelancer_form.invalid || this.isUniqueClientVendorEmailID()) {
                return;
            }
            this.submitBtn.isClicked = true;
            this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
            console.log('form is submitting ..... this.addExpenditure_form ', this.createFreelancer_form.value);
            this.createFreelancer_form.get('BilledTo').setValue(this.createFreelancer_form.value.BilledTo.Title);
            this.createFreelancer_form.get('RecordType').setValue(this.createFreelancer_form.value.RecordType.value);
            this.createFreelancer_form.value["__metadata"] = { type: 'SP.Data.VendorFreelancerListItem' };
            const endpoint = this.fdConstantsService.fdComponent.addUpdateFreelancer.create;
            let data = [
                {
                    objData: this.createFreelancer_form.value,
                    endpoint: endpoint,
                    requestPost: true
                }
            ]
            this.submitForm(data, type);
        }
    }

    submitExpediture() {
        if (this.fileUploadedUrl && this.caFileUploadedUrl) {
            this.finalAddEArray = [];
            for (let pi = 0; pi < this.totalLineItems.length; pi++) {
                const element = this.totalLineItems[pi];
                let finalAmt = element.AmountPerProject;
                if (this.addExpenditure_form.value.Currency != element.projectItem.Currency) {
                    let cc = this.getConversionRate(this.addExpenditure_form.value.Currency);
                    let pcurrency = this.getConversionRate(element.projectItem.Currency);
                    console.log('CC ', cc);
                    console.log('pcurrency ', pcurrency);
                    let amt = this.convertAmtToCC(parseFloat(cc), parseFloat(pcurrency), parseFloat(element.AmountPerProject));
                    console.log('amt ----- ', amt);
                    finalAmt = amt;
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
            this.fileReader.readAsArrayBuffer(this.selectedFile);
            this.fileReader.onload = () => {
                console.log('selectedFile ', this.selectedFile);
                console.log('this.fileReader  ', this.fileReader.result);
                let date = new Date();

                let folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/' + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';

                this.filePathUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" + "&@TargetFileName='" + this.selectedFile.name + "'";
                // this.uploadFileData('');
                // this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
                //     console.log('selectedFile uploaded .', res);
                // })
            };

        }
    }

    uploadFileData(): any {
        this.nodeService.uploadFIle(this.filePathUrl, this.fileReader.result).subscribe(res => {
            if (res.d) {
                console.log('selected File uploaded .', res.d.ServerRelativeUrl);
                this.fileUploadedUrl = res.d.ServerRelativeUrl ? res.d.ServerRelativeUrl : '';
                console.log('this.fileUploadedUrl ', this.fileUploadedUrl);
                this.uploadCAFileData();
            }
        });
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
            this.cafileReader.readAsArrayBuffer(this.selectedCAFile);
            this.cafileReader.onload = () => {
                console.log('selectedCAFile ', this.selectedCAFile);
                console.log('this.cafileReader  ', this.cafileReader.result);
                let date = new Date();

                let folderPath: string = this.globalService.sharePointPageObject.webRelativeUrl + '/SpendingInfoFiles/' + folderName + '/' + this.datePipe.transform(date, 'yyyy') + '/' + this.datePipe.transform(date, 'MMMM') + '/';

                this.cafilePathUrl = this.globalService.sharePointPageObject.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl(" + "'" + folderPath + "'" + ")/Files/add(url=@TargetFileName,overwrite='true')?" + "&@TargetFileName='" + this.selectedCAFile.name + "'";
                // this.uploadCAFileData();
                // this.nodeService.uploadFIle(this.cafilePathUrl, this.cafileReader.result).subscribe(res => {
                //     console.log('selectedCAFile uploaded .', res);
                // })
            };

        }
    }

    uploadCAFileData(): any {
        this.nodeService.uploadFIle(this.cafilePathUrl, this.cafileReader.result).subscribe(res => {
            if (res.d) {
                console.log('selected File uploaded .', res.d.ServerRelativeUrl);
                this.caFileUploadedUrl = res.d.ServerRelativeUrl ? res.d.ServerRelativeUrl : '';
                if (this.caFileUploadedUrl) {
                    this.submitExpediture();
                }
                console.log('this.caFileUploadedUrl ', this.caFileUploadedUrl);
            }
        });
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
        const res = await this.spServices.getFDData(batchGuid, sBatchData);
        console.log('res ', res);
        console.log('res 2 ', res);
        // .subscribe(res => {
        //     const arrResults = res;
        //     console.log('--oo ', arrResults);
        if (type === "addExpenditure") {
            this.messageService.add({ key: 'fdToast', severity: 'success', summary: 'Success.', detail: '', life: 2000 });
            this.showHideREModal = false;
            // this.reload();
            for (let k = 0; k < res.length; k++) {
                const element = res[k];
                this.sendCreateExpenseMail(element);
            }

        } else if (type === "createFreelancer") {
            this.messageService.add({ key: 'fdToast', severity: 'success', summary: 'Submitted.', detail: '', life: 2000 })
            this.cancelFormSub(type);
            this.getVendorFreelanceData();
            // this.reload();
        }
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        // });

        // });
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
        console.log('arrayTo ', arrayTo);
        return arrayTo;
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
            if (x.ID == ele.ID) {
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
        mailContent = this.replaceContent(mailContent, "@@Val10@@", expense.FileURL);
        mailContent = this.replaceContent(mailContent, "@@Val11@@", expense.ClientApprovalFileURL);
        mailContent = this.replaceContent(mailContent, "@@Val12@@", expense.RequestType);

        var ccUser = [];
        ccUser.push(this.currentUserInfoData.Email);
        let tos = this.getTosList();
        this.spOperationsService.sendMail(tos.join(','), this.currentUserInfoData.Email, mailSubject, mailContent, ccUser.join(','));
        this.reload();
    }



    reload() {
        setTimeout(() => {
            window.location.reload();
            // this.getRequiredData();
            // this.currentUserInfo();
        }, 3000);
    }

    // Tab Action
    onExpenditureTabs(event) {
        // this.messageService.add({ key: 'fdToast', severity: 'info', summary: 'Tab Expanded' });
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

    ngOnDestroy() {
        // avoid memory leaks here by cleaning up after ourselves. If we
        // don't then we will continue to run our initialiseInvites()
        // method on every navigationEnd event.
        // if (this.navigationSubscription) {
        //    this.navigationSubscription.unsubscribe();
        // }
        // this.projectInfoData.unsubscribe();
        this.fdDataShareServie.DateRange = {
            startDate: '',
            endDate: '',
        }
    }


}
