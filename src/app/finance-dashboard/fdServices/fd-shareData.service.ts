import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { FdConstantsService } from './fd-constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { DatePipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { CommonService } from 'src/app/Services/common.service';

@Injectable({
    providedIn: 'root'
})
export class FDDataShareService {
    constructor(
        private spServices: SPOperationService,
        private constantService: ConstantsService,
        private fdConstantsService: FdConstantsService,
        private globalObject: GlobalService,
        private datePipe: DatePipe,
        private commonService: CommonService
    ) { }
    private subject = new Subject<any>();
    private expenseCreate = new Subject<any>();
    private scheduledDate = new Subject<any>();

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

    private projectContactData = new BehaviorSubject('');
    defaultPCData = this.projectContactData.asObservable();

    private clientLEntityData = new BehaviorSubject('');
    defaultCLEData = this.clientLEntityData.asObservable();

    private usStatesData = new BehaviorSubject('');
    defaultUSSData = this.usStatesData.asObservable();

    private currencyData = new BehaviorSubject('');
    defaultCUData = this.currencyData.asObservable();

    private poData = new BehaviorSubject('');
    defaultPoData = this.poData.asObservable();

    private resourceCateData = new BehaviorSubject('');
    defaultRCData = this.resourceCateData.asObservable();

    private billingEntityData = new BehaviorSubject('');
    defaultBEData = this.billingEntityData.asObservable();

    private budgetRateData = new BehaviorSubject('');
    defaultBRMData = this.budgetRateData.asObservable();
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };

    freelancerVendersRes: any = [];

    // SOWList

    sowListRes: any = [];

    requiredData: any = [];

    // Check Projects list available
    projectsInfo: any = [];
    bdtRate: any = [];

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

    async getCurrentUserInfo() {
        this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'getUserInfo');
        return await this.spServices.getUserInfo(this.globalObject.currentUser.userId);
    }

    async getGroupInfo() {
        this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'getGroupInfo');
        return await this.spServices.getGroupInfo('ExpenseApprovers');
    }

    async getITInfo() {
        this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'getGroupInfo');
        return await this.spServices.getGroupInfo('Invoice_Team');
    }

    // CS Member
    getCSMember(resCatEmails) {
        const csMember = [];
        if (resCatEmails.length) {
            // tslint:disable-next-line: prefer-for-of
            for (let e = 0; e < resCatEmails.length; e++) {
                const element = resCatEmails[e];
                if (element.UserName) {
                    if (element.UserName.EMail) {
                        csMember.push(element.UserName.EMail);
                    }
                } else if (element) {
                    csMember.push(element.EMail);
                }
            }
        }
        return csMember;
    }

    // Invoice Team Member
    getITMember(itApprovers) {
        const itMember = [];
        if (itApprovers.length) {
            for (const i in itApprovers) {
                if (itApprovers[i].Email !== undefined && itApprovers[i].Email !== '') {
                    itMember.push(itApprovers[i].Email);
                }
            }
        }
        return itMember;
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
    async getVendorFreelanceData() {
        const vendorObj = Object.assign({}, this.fdConstantsService.fdComponent.addUpdateFreelancer);
        this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'GetVendorFreelancerData');
        const res = await this.spServices.readItems(this.constantService.listNames.VendorFreelancer.name, vendorObj);
        const arrResults = res.length ? res : [];
        if (arrResults.length) {
            this.freelancerVendersRes = arrResults;
        }
        return arrResults;
    }
    async getSOWData() {
        if (this.sowListRes.length) {
            return this.sowListRes;
        } else {
            const obj = [{
                url: this.spServices.getReadURL(this.constantService.listNames.SOW.name, this.fdConstantsService.fdComponent.sowList),
                type: 'GET',
                listName: this.constantService.listNames.SOW
            }];
            this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'GetSowData');
            const res = await this.spServices.executeBatch(obj);
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
        const found = pi.find((x) => {
            if (x.ProjectCode === element.Title) {
                return x;
            }
        });
        return found ? found : '';
    }

    async getSOWDetailBySOWCode(sowCode) {
        if (!this.sowListRes.length) {
            await this.getSOWData();
        }
        const found = this.sowListRes.find((x) => {
            if (x.SOWCode === sowCode) {
                return x;
            }
        });
        return found ? found : '';
    }

    getResDetailById(data, ele) {
        const found = data.find((x) => {
            if (x.UserName.ID === ele.EditorId) {
                return x;
            }
        });
        return found ? found : '';
    }

    async getRequiredData(): Promise<any> {
        if (!this.requiredData.length) {
            this.constantService.loader.isPSInnerLoaderHidden = false;
            this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'GetUserInfo');
            this.globalObject.userInfo = await this.spServices.getUserInfo(this.globalObject.currentUser.userId);
            // const batchContents = new Array();
            // const batchGuid = this.spServices.generateUUID();
            const batchUrl = [];
            // tslint:disable:max-line-length
            const prjContactsObj = Object.assign({}, this.queryConfig);
            prjContactsObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectContacts.name, this.fdConstantsService.fdComponent.projectContacts);
            prjContactsObj.listName = this.constantService.listNames.ProjectContacts.name;
            prjContactsObj.type = 'GET';
            batchUrl.push(prjContactsObj);

            const cleObj = Object.assign({}, this.queryConfig);
            cleObj.url = this.spServices.getReadURL(this.constantService.listNames.ClientLegalEntity.name, this.fdConstantsService.fdComponent.clientLegalEntity);
            cleObj.listName = this.constantService.listNames.ClientLegalEntity.name;
            cleObj.type = 'GET';
            batchUrl.push(cleObj);

            const usStatesObj = Object.assign({}, this.queryConfig);
            usStatesObj.url = this.spServices.getReadURL(this.constantService.listNames.UsState.name, this.fdConstantsService.fdComponent.usStates);
            usStatesObj.listName = this.constantService.listNames.UsState.name;
            usStatesObj.type = 'GET';
            batchUrl.push(usStatesObj);

            const currencyObj = Object.assign({}, this.queryConfig);
            currencyObj.url = this.spServices.getReadURL(this.constantService.listNames.Currency.name, this.fdConstantsService.fdComponent.currency);
            currencyObj.listName = this.constantService.listNames.Currency.name;
            currencyObj.type = 'GET';
            batchUrl.push(currencyObj);

            const projectPOObj = Object.assign({}, this.queryConfig);
            projectPOObj.url = this.spServices.getReadURL(this.constantService.listNames.PO.name, this.fdConstantsService.fdComponent.projectPO);
            projectPOObj.listName = this.constantService.listNames.PO.name;
            projectPOObj.type = 'GET';
            batchUrl.push(projectPOObj);

            const resCatObj = Object.assign({}, this.queryConfig);
            resCatObj.url = this.spServices.getReadURL(this.constantService.listNames.ResourceCategorization.name, this.fdConstantsService.fdComponent.resourceCategorization);
            resCatObj.listName = this.constantService.listNames.ResourceCategorization.name;
            resCatObj.type = 'GET';
            batchUrl.push(resCatObj);

            const billingEntObj = Object.assign({}, this.queryConfig);
            billingEntObj.url = this.spServices.getReadURL(this.constantService.listNames.BillingEntity.name, this.fdConstantsService.fdComponent.billingEntity);
            billingEntObj.listName = this.constantService.listNames.BillingEntity.name;
            billingEntObj.type = 'GET';
            batchUrl.push(billingEntObj);

            const budgetRateObj = Object.assign({}, this.queryConfig);
            budgetRateObj.url = this.spServices.getReadURL(this.constantService.listNames.BudgetRateMaster.name, this.fdConstantsService.fdComponent.budgetRate);
            budgetRateObj.listName = this.constantService.listNames.BudgetRateMaster.name;
            budgetRateObj.type = 'GET';
            batchUrl.push(budgetRateObj);

            const prjInfoObj = Object.assign({}, this.queryConfig);
            prjInfoObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name, this.fdConstantsService.fdComponent.projectInfo);
            prjInfoObj.listName = this.constantService.listNames.ProjectInformation.name;
            prjInfoObj.type = 'GET';
            batchUrl.push(prjInfoObj);
            this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'GetPICLEBRMasterBE');
            let arrResults = await this.spServices.executeBatch(batchUrl);
            this.requiredData = arrResults = arrResults.length ? arrResults.map(a => a.retItems) : [];
            this.setData(arrResults);
            this.constantService.loader.isPSInnerLoaderHidden = true;
            return '';
        } else {
            return '';
        }
    }
    async checkProjectsAvailable() {
        if (this.projectsInfo.length) {
            return this.projectInfoData.next(this.projectsInfo);
        } else {
            const obj = [{
                url: this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name, this.fdConstantsService.fdComponent.projectInfo),
                type: 'GET',
                listName: this.constantService.listNames.ProjectFinances
            }];
            this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'checkProjectAvailability');
            const res = await this.spServices.executeBatch(obj);
            if (res.length) {
                // console.log('this.projectsInfo ', res[0]);
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
        const batchUrl = [];
        const cleObj = Object.assign({}, this.queryConfig);
        cleObj.url = this.spServices.getReadURL(this.constantService.listNames.ClientLegalEntity.name, this.fdConstantsService.fdComponent.clientLegalEntity);
        cleObj.listName = this.constantService.listNames.ClientLegalEntity.name;
        cleObj.type = 'GET';
        batchUrl.push(cleObj);

        const projectPOObj = Object.assign({}, this.queryConfig);
        projectPOObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectPO.name, this.fdConstantsService.fdComponent.projectPO);
        projectPOObj.listName = this.constantService.listNames.ProjectPO.name;
        projectPOObj.type = 'GET';
        batchUrl.push(projectPOObj);
        if (type === 'hourly') {
            const hourlyObj = Object.assign({}, this.queryConfig);
            hourlyObj.url = this.spServices.getReadURL(this.constantService.listNames.ProjectInformation.name, this.fdConstantsService.fdComponent.projectInfo);
            hourlyObj.listName = this.constantService.listNames.ProjectInformation.name;
            hourlyObj.type = 'GET';
            batchUrl.push(hourlyObj);
        }
        this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData', 'GetPIProPOCLE');
        let arrResults = await this.spServices.executeBatch(batchUrl);
        arrResults = arrResults.length ? arrResults.map(a => a.retItems) : [];
        this.setClePOData(arrResults);
    }

    setClePOData(data) {
        if (data[0]) {
            this.clientLEntityData.next(data[0]);
        }
        if (data[1]) {
            this.poData.next(data[1]);
        }
        if (data[2]) {
            this.projectInfoData.next(data[2]);
        }
    }

    styleIndia(amount) {
        // return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(amount.toFixed(2))
        let x = amount.toString();
        x = x.indexOf('.') > -1 ? x : x + '.00';
        let afterPoint = '';
        if (x.indexOf('.') > 0) {
            afterPoint = x.substring(x.indexOf('.'), x.length);
        }
        afterPoint = afterPoint.substring(0, 3); x = Math.floor(x);
        x = x.toString();
        let lastThree = x.substring(x.length - 3);
        const otherNumbers = x.substring(0, x.length - 3);
        if (otherNumbers !== '') {
            lastThree = ',' + lastThree;
        }
        const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + afterPoint;
        return res;
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
            this.commonService.SetNewrelic('Finance-Dashboard', 'fdsharedata-CallProformaCreation', 'executeJS');
            const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
            await this.spServices.executeJS(pdfService, pdfContent);
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
        this.commonService.SetNewrelic('Finance-Dashboard', 'fd-shareData-callProformaInvoiceEdit', 'executeJS');
        const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
        await this.spServices.executeJS(pdfService, pdfContent);
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = true;
        this.fdConstantsService.fdComponent.selectedComp.reFetchData(refetchType);
    }
    getProformaPDFObject(oProformaObj, cleData, projectContactsData, purchaseOrdersList, projectAppendix) {
        const oCle = cleData.find(e => e.Title === oProformaObj.ClientLegalEntity);
        const oPOC = projectContactsData.find(e => e.ID === oProformaObj.MainPOC);
        const oPO = purchaseOrdersList.find(e => e.ID === oProformaObj.PO);
        let address: any;
        if (oProformaObj.AddressType === 'Client') {
            address = oCle.APAddress ? oCle.APAddress : '';
        } else {
            address = oPOC.Address ? oPOC.Address : '';
        }

        let addressArr = address.split(';#');
        if (addressArr.length <= 1) {
            addressArr = ['', '', '', ''];
        }
        let val = '';
        const tax1 = oProformaObj.Template === 'India' ? (parseFloat(oProformaObj.Amount) * 18 / 100).toFixed(2) : (oProformaObj.Template === 'Japan' ? (parseFloat(oProformaObj.Amount) * 10 / 100).toFixed(2) : '0');
        const tax = parseFloat(tax1.toString());
        let total = '';
        let taxString = '';

        switch (oProformaObj.Template) {
            case 'US':
            case 'Japan':
                val = this.styleUSJapan(oProformaObj.Amount);
                taxString = this.styleUSJapan(tax);
                total = this.styleUSJapan(oProformaObj.Amount + tax);
                break;
            case 'India':
                val = this.styleIndia(oProformaObj.Amount);
                taxString = this.styleIndia(tax);
                total = this.styleIndia(oProformaObj.Amount + tax);
                break;
        }
        projectAppendix.forEach(element => {
            switch (oProformaObj.Template) {
                case 'US':
                case 'Japan':
                    element.Amount = this.styleUSJapan(element.amount);
                    break;
                case 'India':
                    element.Amount = this.styleIndia(element.amount);
                    break;
            }

        });

        this.budgetRateData.subscribe((res) => {
            if (res) {
                this.bdtRate = res;
                console.log('this.bdtRate ', this.bdtRate);
            }
        });

        const currencyObj = this.bdtRate.find(e => e.Title === oProformaObj.Currency);

        return {
            Template: oProformaObj.Template,
            ID: oProformaObj.ID ? oProformaObj.ID : oProformaObj.Id,
            ClientLegalEntity: oProformaObj.ClientLegalEntity,
            invoice: 'Proforma',
            invoice_no: oProformaObj.Title ? oProformaObj.Title : oProformaObj.ProformaNumber,
            invoice_date: this.datePipe.transform(oProformaObj.ProformaDate, 'MMM d, y'),
            usCurrencyName: oProformaObj.Currency, // 'USD',
            usCurrencySymbol: currencyObj.Symbol, // '$',
            JpnCurrencyName: oProformaObj.Currency, // 'JPY',
            JpnCurrencySymbol: currencyObj.Symbol, // '¥',
            IndCurrencyName: oProformaObj.Currency, // 'INR',
            IndCurrencySymbol: currencyObj.Symbol, // 'Rs',
            email: oPOC.EmailAddress ? oPOC.EmailAddress : '', // 'gordon.strachan@asstraZeneca.com',
            company: oCle.InvoiceName, // 'AstraZeneca UK Ltd',
            clientcontact1: oProformaObj.Template === 'US' ? oPOC.LName + ', ' + oPOC.FName : oPOC.FName + ' ' + oPOC.LName, // 'Strachan , Gordon',
            clientcontact2: oPOC.Designation ? oPOC.Designation : '', // 'Global Publications Lead - Oncology',
            address1: addressArr[0], // 'PO Box 30 , Slik Road Business Park',
            address2: addressArr[1], // 'Macclesfield , GB , SK10 2NA',
            address3: addressArr[2], // United Kingdom',
            address4: addressArr[3], // 'United Kingdom',
            phone: oPOC.Phone ? oPOC.Phone : '', // '+44 (0) 16255170000',
            serviceDetails: oProformaObj.ProformaTitle,
            invoiceFees: val,
            total,
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

    customSort(data, order: number, fieldName?: string) {
        data.sort((row1, row2) => {
            const val1 = fieldName ? row1[fieldName] : row1;
            const val2 = fieldName ? row2[fieldName] : row2;
            if (val1 === val2) {
                return 0;
            }
            let result = -1;
            if (val1 > val2) {
                result = 1;
            }
            if (order < 0) {
                result = -result;
            }
            return result;
        });
        return data;
    }


    async  createInvoice(proformHtml, selectedRowItem, oInv, cleData) {
        let response = true;
        const proformaDate = this.datePipe.transform(selectedRowItem.ProformaDate, 'MMM dd, yyyy');
        const proformaDateSingle = this.datePipe.transform(selectedRowItem.ProformaDate, 'MMM d, yyyy');
        proformHtml = proformHtml.replace(new RegExp("Proforma", "g"), "Invoice");
        proformHtml = proformHtml.replace(new RegExp("PROFORMA", "g"), "INVOICE");
        proformHtml = proformHtml.replace(new RegExp("proforma", "g"), "invoice");
        proformHtml = proformHtml.replace(new RegExp(selectedRowItem.ProformaNumber, "g"), oInv.InvoiceNumber);
        proformHtml = proformHtml.replace(new RegExp(proformaDate, "g"), this.datePipe.transform(oInv.InvoiceDate, 'MMM dd, yyyy'));
        proformHtml = proformHtml.replace(new RegExp(proformaDateSingle, "g"), this.datePipe.transform(oInv.InvoiceDate, 'MMM dd, yyyy'));

        try {
            const invObject = JSON.parse(proformHtml);
            const pdfCall = invObject.pdf;
            pdfCall.Code = oInv.InvoiceNumber;
            pdfCall.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
            pdfCall.ID = oInv.ID ? oInv.ID : oInv.Id;
            pdfCall.Type = 'Invoice';
            const oCLE = cleData.find(e => e.Title === oInv.ClientLegalEntity);
            pdfCall.ListName = oCLE.ListName;
            pdfCall.HtmlContent = proformHtml;
            this.commonService.SetNewrelic('Finance-Dashboard', 'proforma', 'executeJS');
            const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
            await this.spServices.executeJS(pdfService, pdfCall);
        } catch (e) {
            response = false; // error in the above string (in this case, yes)!
        }
        return response;
    }



}
