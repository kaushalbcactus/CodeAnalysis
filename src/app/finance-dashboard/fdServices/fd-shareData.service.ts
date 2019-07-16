import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from './fd-constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SpOperationsService } from '../../Services/sp-operations.service';
import { DatePipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: "root"
})
export class FDDataShareService {
    private subject = new Subject<any>();
    private expenseCreate = new Subject<any>();
    private scheduledDate = new Subject<any>();

    sendExpenseDateRange(message: any) {
        this.subject.next(message);
    }

    clearDR() {
        this.subject.next();
    }

    getDateRange(): Observable<any> {
        return this.subject.asObservable();
    }

    // For Expense 
    setExpenseAddObj() {
        this.expenseCreate.next();
    }

    getAddExpenseSuccess(): Observable<any> {
        return this.expenseCreate.asObservable();
    }

    // For Scheduled 
    setScheduleAddObj(date: any) {
        this.scheduledDate.next(date);
    }

    getScheduleDateRange(): Observable<any> {
        return this.scheduledDate.asObservable();
    }

    public expenseDateRange: any = {
        startDate: '',
        endDate: '',
    };

    public scheduleDateRange: any = {
        startDate: '',
        endDate: '',
    };

    public piData = null;
    private projectInfoData = new BehaviorSubject('');
    // private projectInfoData: BehaviorSubject<any[]>
    defaultPIData = this.projectInfoData.asObservable();

    private projectContactData = new BehaviorSubject("");
    defaultPCData = this.projectContactData.asObservable();

    private clientLEntityData = new BehaviorSubject("");
    defaultCLEData = this.clientLEntityData.asObservable();

    private usStatesData = new BehaviorSubject("");
    defaultUSSData = this.usStatesData.asObservable();

    private currencyData = new BehaviorSubject("");
    defaultCUData = this.currencyData.asObservable();

    private poData = new BehaviorSubject("");
    defaultPoData = this.poData.asObservable();

    private resourceCateData = new BehaviorSubject("");
    defaultRCData = this.resourceCateData.asObservable();

    private billingEntityData = new BehaviorSubject("");
    defaultBEData = this.billingEntityData.asObservable();

    private budgetRateData = new BehaviorSubject("");
    defaultBRMData = this.budgetRateData.asObservable();

    constructor(
        private spServices: SharepointoperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        private globalObject: GlobalService,
        private spOperationsServices: SpOperationsService,
        private datePipe: DatePipe,
    ) { }

    async getCurrentUserInfo() {
        return await this.spOperationsServices.getUserInfo(this.globalObject.sharePointPageObject.userId.toString());
    }

    async getGroupInfo() {
        return await this.spOperationsServices.getGroupInfo('ExpenseApprovers');
    }

    async getITInfo() {
        return await this.spOperationsServices.getITGroupInfo('Invoice_Team');
    }

    // Export to Excel
    convertToExcelFile(cnf1) {
        console.log('cnf1 ', cnf1);

        if (Array.isArray(cnf1._selection)) {
            if (cnf1._selection.length) {
                cnf1.exportCSV({ selectionOnly: true });
            } else {
                cnf1.exportCSV();
            }
        } else {
            cnf1.exportCSV();
        }
    }

    setData(data: any) {
        console.log(data.length);
        if (data[0]) {
            this.projectContactData.next(data[0]);
        }
        if (data[1]) {
            this.clientLEntityData.next(data[1]);
        }
        if (data[2]) {
            this.usStatesData.next(data[2]);
        }
        if (data[3]) {
            this.currencyData.next(data[3]);
        }
        if (data[4]) {
            this.poData.next(data[4]);
        }
        if (data[5]) {
            this.resourceCateData.next(data[5]);
        }
        if (data[6]) {
            this.billingEntityData.next(data[6]);
        }
        if (data[7]) {
            this.budgetRateData.next(data[7]);
        }
        if (data[8]) {
            this.projectInfoData.next(data[8]);
            // this.piData = data[0];
        }
        // this.dataSource.next(data)
    }
    freelancerVendersRes: any = [];
    async getVendorFreelanceData() {
        if (this.freelancerVendersRes.length) {
            return this.freelancerVendersRes;
        } else {
            let data = [
                { query: this.spServices.getReadURL('' + this.constantService.listNames.VendorFreelancer.name + '', this.fdConstantsService.fdComponent.addUpdateFreelancer) },
            ]
            const batchContents = new Array();
            const batchGuid = this.spServices.generateUUID();
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
                console.log('this.freelancerVendersRes ', arrResults[0]);
                this.freelancerVendersRes = arrResults[0];
                return this.freelancerVendersRes;
            } else {
                return '';
            }
        }
    }

    // SOWList

    sowListRes: any = [];
    async getSOWData() {
        if (this.sowListRes.length) {
            return this.sowListRes;
        } else {
            let obj = [{
                url: this.spOperationsServices.getReadURL(this.constantService.listNames.SOW.name, this.fdConstantsService.fdComponent.sowList),
                type: 'GET',
                listName: this.constantService.listNames.ProjectFinances
            }]
            const res = await this.spOperationsServices.executeBatch(obj);
            let arrResults: any = [];
            arrResults = res;
            if (arrResults.length) {
                console.log('this.sow ', arrResults[0]);
                this.sowListRes = arrResults[0].retItems;
                return this.sowListRes;
            } else {
                return '';
            }
        }
    }

    getSowCodeFromPI(pi: any[], element) {
        let found = pi.find((x) => {
            if (x.ProjectCode === element.Title) {
                return x;
            }
        })
        return found ? found : ''
    }

    async getSOWDetailBySOWCode(sowCode) {
        if (!this.sowListRes.length) {
            await this.getSOWData();
        }
        let found = this.sowListRes.find((x) => {
            if (x.SOWCode === sowCode) {
                return x;
            }
        })
        return found ? found : ''
    }

    requiredData: any = [];

    getResDetailById(data, ele) {
        let found = data.find((x) => {
            if (x.UserName.ID === ele.EditorId) {
                return x;
            }
        })
        return found ? found : ''
    }

    async getRequiredData(): Promise<any> {
        if (!this.requiredData.length) {

            this.globalObject.userInfo = await this.spOperationsServices.getUserInfo(this.globalObject.sharePointPageObject.userId.toString());
            // Default Tabs & sub Menus
            this.fdConstantsService.fdComponent.tabs.topMenu = [
                { label: 'Expenditure', routerLink: ['expenditure'] },
                { label: 'Scheduled', routerLink: ['scheduled'] }
            ];
            this.fdConstantsService.fdComponent.tabs.expenditureMenu = [
                { label: 'Pending Expense', routerLink: ['pending'] },
            ]
            // Scheduled Tabs
            this.fdConstantsService.fdComponent.tabs.scheduleMenu = [
                { label: 'Deliverable Based', routerLink: ['deliverable-based'] },
                // { label: 'Hourly Based', routerLink: ['hourly-based'] },
                { label: 'OOP', routerLink: ['oop'] },
            ]

            if (this.globalObject.userInfo.Groups.results.length) {
                const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
                if (groups.indexOf('Invoice_Team') > -1 || groups.indexOf('Managers') > -1) {
                    // All 
                    this.fdConstantsService.fdComponent.tabs.topMenu.push(
                        { label: 'Confirmed', routerLink: ['confirmed'] },
                        { label: 'Proforma', routerLink: ['proforma'] },
                        { label: 'Outstanding Invoices', routerLink: ['outstanding-invoices'] },
                        { label: 'Paid Invoices', routerLink: ['paid-invoices'] },
                    );
                    // All Expenditure Menus
                    this.fdConstantsService.fdComponent.tabs.expenditureMenu.push(
                        { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'] },
                        { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'] },
                        { label: 'Approved(Billable)', routerLink: ['approvedBillable'] }
                    );

                    // All Scheduled Tabs
                    this.fdConstantsService.fdComponent.tabs.scheduleMenu.push(
                        { label: 'Hourly Based', routerLink: ['hourly-based'] },
                    )

                } else if (groups.indexOf('ExpenseApprovers') > -1) {
                    // All Expenditure Menus
                    this.fdConstantsService.fdComponent.tabs.expenditureMenu.push(
                        { label: 'Cancelled/Rejected', routerLink: ['cancelled-reject'] },
                        { label: 'Approved(Non Billable)', routerLink: ['approvedNonBillable'] },
                        { label: 'Approved(Billable)', routerLink: ['approvedBillable'] }
                    );

                }
            }
            const batchContents = new Array();
            const batchGuid = this.spServices.generateUUID();
            const projectInfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.fdConstantsService.fdComponent.projectInfo);
            const projectContactEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectContacts.name + '', this.fdConstantsService.fdComponent.projectContacts);
            const clientLegalEntityEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ClientLegalEntity.name + '', this.fdConstantsService.fdComponent.clientLegalEntity);
            const usStates = this.spServices.getReadURL('' + this.constantService.listNames.UsState.name + '', this.fdConstantsService.fdComponent.usStates);
            const currnecy = this.spServices.getReadURL('' + this.constantService.listNames.Currency.name + '', this.fdConstantsService.fdComponent.currency);
            const projectPO = this.spServices.getReadURL('' + this.constantService.listNames.ProjectPO.name + '', this.fdConstantsService.fdComponent.projectPO);
            const resourceCateg = this.spServices.getReadURL('' + this.constantService.listNames.ResourceCategorization.name + '', this.fdConstantsService.fdComponent.resourceCategorization);
            const billingEntity = this.spServices.getReadURL('' + this.constantService.listNames.BillingEntity.name + '', this.fdConstantsService.fdComponent.billingEntity);
            const budgetRate = this.spServices.getReadURL('' + this.constantService.listNames.BudgetRateMaster.name + '', this.fdConstantsService.fdComponent.budgetRate);
            // const userGroup = this.spServices.getReadURL(''+this.constantService.listNames.ClientLegalEntity.name + '', this.fdConstantsService.fdComponent.clientLegalEntity);
            //projectInfoEndpoint,
            let endPoints = [projectContactEndpoint, clientLegalEntityEndpoint, usStates, currnecy, projectPO, resourceCateg, billingEntity, budgetRate];
            let userBatchBody;
            for (let i = 0; i < endPoints.length; i++) {
                const element = endPoints[i];
                this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
            }
            batchContents.push('--batch_' + batchGuid + '--');
            userBatchBody = batchContents.join('\r\n');

            const arrResults = await this.spServices.getFDData(batchGuid, userBatchBody);
            this.requiredData = arrResults;
            this.setData(arrResults);

            return "";
        } else {
            return "";
        }
    }

    // Check Projects list available
    projectsInfo: any = [];
    async checkProjectsAvailable() {
        if (this.projectsInfo.length) {
            return this.projectInfoData.next(this.projectsInfo);
        } else {
            let obj = [{
                url: this.spOperationsServices.getReadURL(this.constantService.listNames.ProjectInformation.name, this.fdConstantsService.fdComponent.projectInfo),
                type: 'GET',
                listName: this.constantService.listNames.ProjectFinances
            }]
            const res = await this.spOperationsServices.executeBatch(obj);
            if (res.length) {
                console.log('this.projectsInfo ', res[0]);
                this.projectsInfo = res[0].retItems;
                this.projectInfoData.next(this.projectsInfo);
                return this.projectsInfo;
            } else {
                return '';
            }
        }


    }
    // clePoPiRes: any = [];
    async getClePO(type: string) {
        // if (this.clePoPiRes.length) {
        //     return this.clePoPiRes;
        // } else {
            const batchContents = new Array();
            const batchGuid = this.spServices.generateUUID();
            const clientLegalEntityEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ClientLegalEntity.name + '', this.fdConstantsService.fdComponent.clientLegalEntity);
            const projectPO = this.spServices.getReadURL('' + this.constantService.listNames.ProjectPO.name + '', this.fdConstantsService.fdComponent.projectPO);
            let endPoints = [clientLegalEntityEndpoint, projectPO];
            if (type === 'hourly') {
                const projectInfoEndpoint = this.spServices.getReadURL('' + this.constantService.listNames.ProjectInformation.name + '', this.fdConstantsService.fdComponent.projectInfo);
                endPoints = [clientLegalEntityEndpoint, projectPO, projectInfoEndpoint];
            }
            let userBatchBody;
            for (let i = 0; i < endPoints.length; i++) {
                const element = endPoints[i];
                this.spServices.getBatchBodyGet(batchContents, batchGuid, element);
            }
            batchContents.push('--batch_' + batchGuid + '--');
            userBatchBody = batchContents.join('\r\n');

            const arrResults = await this.spServices.getFDData(batchGuid, userBatchBody);
            // this.clePoPiRes = arrResults;
            this.setClePOData(arrResults);
        // }
    }

    setClePOData(data) {
        if (data[0]) {
            this.clientLEntityData.next(data[0]);
        }
        if (data[1]) {
            this.poData.next(data[1]);
        } if (data[2]) {
            this.projectInfoData.next(data[2]);
        }
    }

    styleIndia(amount) {
        return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(amount)
    }

    styleUSJapan(amount) {
        return (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    async callProformaCreation(oProforma, cleData, projectContactsData, purchaseOrdersList, editorRef, projectAppendix) {
        ///// Generate Proforma structure
        const oProformaObj: any = this.getProformaPDFObject(oProforma, cleData, projectContactsData, purchaseOrdersList, projectAppendix);



        const objReturn: any = this.callInvoiceTemplate(oProformaObj, editorRef);
        if (objReturn) {
            const pdfContent: any = objReturn.pdf;
            pdfContent.Code = oProformaObj.invoice_no;
            pdfContent.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
            pdfContent.ID = oProformaObj.ID;
            pdfContent.Type = 'Proforma';
            const oCLE = cleData.find(e => e.Title === oProformaObj.ClientLegalEntity);
            pdfContent.ListName = oCLE.ListName;
            pdfContent.HtmlContent = JSON.stringify(objReturn);

            ///// Call service 
            const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
            await this.spOperationsServices.executeJS(pdfService, pdfContent);
        }
    }

    async callProformaInvoiceEdit(objReturn) {
        const pdfContent: any = objReturn.pdf;
        const refetchType = this.fdConstantsService.fdComponent.selectedEditObject.Type === 'Proforma' ? 'replaceProforma' : 'replaceInvoice';
        pdfContent.Code = this.fdConstantsService.fdComponent.selectedEditObject.Code;
        pdfContent.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
        pdfContent.ID = this.fdConstantsService.fdComponent.selectedEditObject.ID;
        pdfContent.Type = this.fdConstantsService.fdComponent.selectedEditObject.Type; // 'Proforma';
        pdfContent.ListName = this.fdConstantsService.fdComponent.selectedEditObject.ListName;
        pdfContent.HtmlContent = JSON.stringify(objReturn);

        ///// Call service 
        const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
        await this.spOperationsServices.executeJS(pdfService, pdfContent);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.selectedComp.reFetchData(refetchType);
    }
    bdtRate: any = [];
    getProformaPDFObject(oProformaObj, cleData, projectContactsData, purchaseOrdersList, projectAppendix) {
        const oCle = cleData.find(e => e.Title === oProformaObj.ClientLegalEntity);
        const oPOC = projectContactsData.find(e => e.ID === oProformaObj.MainPOC);
        const oPO = purchaseOrdersList.find(e => e.ID === oProformaObj.PO);
        let address: any;
        if (oProformaObj.AddressType === 'Client') {
            address = oCle.APAddress ? oCle.APAddress : '';
        }
        else {
            address = oPOC.Address ? oPOC.Address : '';
        }

        let addressArr = address.split(";#");
        if (addressArr.length <= 1) {
            addressArr = ['', '', '', ''];
        }
        let val = '';
        let tax1 = oProformaObj.Template === "India" ? (parseFloat(oProformaObj.Amount) * 18 / 100).toFixed(2) : (oProformaObj.Template === "Japan" ? (parseFloat(oProformaObj.Amount) * 8 / 100).toFixed(2) : '0');
        let tax = parseFloat(tax1.toString());
        let total = '';
        let taxString = '';

        switch (oProformaObj.Template) {
            case "US":
            case "Japan":
                val = this.styleUSJapan(oProformaObj.Amount);
                taxString = this.styleUSJapan(tax);
                total = this.styleUSJapan(oProformaObj.Amount + tax);
                break;
            case "India":
                val = this.styleIndia(oProformaObj.Amount);
                taxString = this.styleIndia(tax);
                total = this.styleIndia(oProformaObj.Amount + tax);
                break;
        }
        projectAppendix.forEach(element => {
            switch (oProformaObj.Template) {
                case "US":
                case "Japan":
                    element.Amount = this.styleUSJapan(element.amount);
                    break;
                case "India":
                    element.Amount = this.styleIndia(element.amount);
                    break;
            }

        });

        this.budgetRateData.subscribe((res) => {
            if (res) {
                this.bdtRate = res;
                console.log('this.bdtRate ', this.bdtRate);
            }
        })

        const currencyObj = this.bdtRate.find(e => e.Title === oProformaObj.Currency);

        return {
            Template: oProformaObj.Template,
            ID: oProformaObj.ID,
            ClientLegalEntity: oProformaObj.ClientLegalEntity,
            invoice: 'Proforma',
            invoice_no: oProformaObj.Title,
            invoice_date: this.datePipe.transform(oProformaObj.ProformaDate, 'MMM d, y'),
            usCurrencyName: oProformaObj.Currency, //'USD',
            usCurrencySymbol: currencyObj.Symbol, //'$',
            JpnCurrencyName: oProformaObj.Currency, //'JPY',
            JpnCurrencySymbol: currencyObj.Symbol, //'¥',
            IndCurrencyName: oProformaObj.Currency, //'INR',
            IndCurrencySymbol: currencyObj.Symbol, //'Rs',
            email: oPOC.EmailAddress ? oPOC.EmailAddress : '', // 'gordon.strachan@asstraZeneca.com',
            company: oCle.InvoiceName, // 'AstraZeneca UK Ltd',
            clientcontact1: oProformaObj.Template === "US" ? oPOC.LName + ', ' + oPOC.FName : oPOC.FName + ' ' + oPOC.LName, // 'Strachan , Gordon',
            clientcontact2: oPOC.Designation ? oPOC.Designation : '',// 'Global Publications Lead - Oncology',
            address1: addressArr[0], //'PO Box 30 , Slik Road Business Park',
            address2: addressArr[1], // 'Macclesfield , GB , SK10 2NA',
            address3: addressArr[2], //United Kingdom',
            address4: addressArr[3], //'United Kingdom',
            phone: oPOC.Phone ? oPOC.Phone : '', // '+44 (0) 16255170000',
            serviceDetails: oProformaObj.ProformaTitle,
            invoiceFees: val,
            total: total,
            purchaseOrderNumber: oPO.Number,
            tax: taxString,
            Appendix: projectAppendix

        };
    }

    callInvoiceTemplate(oProformaObj, editorRef) {
        let objReturn = null;
        switch (oProformaObj.Template) {
            case 'US':
                objReturn = editorRef.createUSInvoice(oProformaObj);
                break;
            case 'India':

                objReturn = editorRef.createIndiaInvoice(oProformaObj);
                break;
            case 'Japan':
                objReturn = editorRef.createJapanInvoice(oProformaObj);
                break;
        }

        return objReturn;
    }



}