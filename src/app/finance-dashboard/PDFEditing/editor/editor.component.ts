import { Component, OnInit, ViewChild } from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { CommonService } from '../services/common.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { MessageService } from 'primeng/api';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { Subscription } from 'rxjs';
import { SPOperationService } from 'src/app/Services/spoperation.service';


declare var $: any;
@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
    public Editor = DecoupledEditor;
    myEditor: any;
    public model = {
        editorData: '<p>Hello, world!</p>'
    };
    elementId: string;
    data: string;
    displayUS = false;
    displayJapan = false;
    displayIndia = false;
    editor = false;
    USTemplate: any = {};
    USTemplateCopy: any = {};
    JapanTemplate: any = {};
    JapanTemplateCopy: any = {};
    IndiaTemplate: any = {};
    IndiaTemplateCopy: any = {};
    invoicedata: any = {};
    address = '';
    clientContact = '';
    indAddress = '';
    headerstyle: any;
    footerStyle: any;
    contentStyle: string;
    heading: any;
    modifiedInvoice: any = {};
    originalInvoice: any = {};
    saveObject: any = {};
    invoiceObject: any = {};
    japanHtmlObject: any = {};
    indiaHtmlObject: any = {};
    USHtmlObject: any = {};
    showAppendix = false;
    serviceDetailHeader = '';
    private subscription: Subscription = new Subscription();
    constructor(
        private common: CommonService,
        private fdConstantsService: FdConstantsService,
        private fdShareDataService: FDDataShareService,
        private messageService: MessageService,
        private globalObject: GlobalService,
        private spOperationsServices: SPOperationService,
        private constantsService: ConstantsService,
    ) { }

    ngOnInit() {

        this.invoicedata = {
            invoice: 'PROFORMA',
            invoice_no: 'ASZ01-0519-0317',
            invoice_date: 'May 15, 2019',
            usCurrencyName: 'USD',
            usCurrencySymbol: '$',
            JpnCurrencyName: 'JPY',
            JpnCurrencySymbol: '¥',
            IndCurrencyName: 'INR',
            IndCurrencySymbol: 'Rs',
            email: 'gordon.strachan@asstraZeneca.com',
            company: 'AstraZeneca UK Ltd',
            clientcontact1: 'Strachan , Gordon',
            clientcontact2: 'Global Publications Lead - Oncology',
            address1: 'PO Box 30 , Slik Road Business Park',
            address2: 'Macclesfield , GB , SK10 2NA',
            address3: 'United Kingdom',
            address4: 'United Kingdom',
            phone: '+44 (0) 16255170000',
            // designation: 'Medical Editorial Reviewer',
            purchaseOrderNumber: '8300324481',
            //Appendix: [],
            Appendix: [{ dvcode: '150833', cactusSpCode: 'ASZ01-MSS-193242', title: 'MOFFITT Resubmission 2', amount: 4125.24 },
            { dvcode: '150833', cactusSpCode: 'ASZ01-MSS-193242', title: 'MOFFITT Resubmission 2', amount: 4125 },

            ],
            tax: '39,564.45',
            // centralTax : '39,564.45',
            // stateTax : '19,782.22',
            // consumptionTax : '43,200.00',
            serviceDetails: 'April',
            invoiceFees: '30,687.50',
            total: '30,687.50'
        };

        this.USTemplate = {
            headerCreate: `<header id="header">
        <div>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background-color: #c5d3e5;">
        <td class="header-left">
        <span>Proforma No</span> : [[InvoiceNumber]] <br />
        <span>Proforma Date</span> : [[InvoiceDate]] <br />
        <span>Currency</span> : [[CurrencyName]] ([[CurrencySymbol]]) <br />
          <label>[[Invoice]]</label>
        </td>
        <td class="header-right">
          <span>
              <img class="logo-img"
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZ77yE3cAxlHgtyyoYl2TKUBN352fZbTRrUbfG9IIj7vLA">
          </span>
        </td>
        </tr>
            </tbody>
        </table>
        </div>
        </header>`,
            footerCreate: ` <footer id="footer"">
        <div>
            <table>
                <tr>
                    <td style="font-size: 14px;text-align: center;">
                        This is a computer generated proforma and does not require any stamp or signature 
                    </td>
                </tr>
            </table>
            <table class="footer-table">
        <tr>
          <td>
            Cactus Communications Inc.
          </td>
        </tr>
        <tr>
          <td>214 Carnegie Center, Suite 102, Princeton, NJ 08540, USA</td>
        </tr>
        <tr>
          <td>T: +1(267)-332-0051 F: +1(267) 332-0052</td>
        </tr>
        <tr>
          <td>
            <a href="http://www.cactusglobal.com/">www.cactusglobal.com</a>
          </td>
        </tr>
        </table>
        </div>
        </footer>`,
            maincontent: `    <div id="main_content" class="usContact">
        <div style='height:1250px;'>
        <table style="margin: 15px 0">
            <tbody>
                <tr>
                    <td class="table-heading">
                        CONTACT DETAILS</td>
                </tr>
            </tbody>
        </table>
        <div class="contact_details-table">
            <div id="contact_details">
                <figure class="table"><table>
                <tbody>
                <tr>
                    <td>
                        <p><strong>Company : </strong>[[Company]]</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p><strong>Client Contact : </strong>[[ClientContact1]]</p>
                        [[ClientContact]]
                    </td>
                </tr>
                <tr>
                    <td>
                        <p><strong>Email : </strong><a href="#">[[Email]]</a>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p><strong>Phone : </strong>[[Phone]]
                        </p>
                    </td>
                </tr>
                </tbody>
                </table></figure>
                <figure class="table"><table>
                <tbody>
                <tr>
                    <td>
                        <p><strong>Address : </strong>[[Address1]]</p>
                        [[AddressMulti]]
                    </td>
                </tr>
                </tbody>
                </table></figure>
            </div>
        </div>
        <table style="margin: 15px 0">
        <tbody>
            <tr>
                <td class="table-heading">
                    PURCHASE ORDER DETAIL</td>
            </tr>
        </tbody>
        </table>
        <p id="purchaseOrder" class="purchaseOrder">
            <tr>
                <td>
                    <p>
                        <strong>Purchase Order number : </strong>[[PurchaseOrderNumber]]
                    </p>
                </td>
            </tr>
        </p>
        <table style="margin: 15px 0">
            <tbody>
                <tr>
                    <td class="table-heading">
                        PROFORMA DETAIL
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="invoice-table proformaDetail">
    
        <div id="invoiceDetail" style="margin-bottom: 20px;">
            <table border="0" cellspacing="0" cellpadding="0">
            <thead>
            <tr>
                <th>
                    Date
                </th>
                <th>
                    Service Details
                </th>
                <th>
                    Fees
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    [[InvoiceDate]]
                </td>
                <td>
                    [[InvoiceServiceDetails]]
                </td>
                <td>
                    [[CurrencySymbol]] [[InvoiceFees]]<span style="display: [[ShowAsterisk]]">*</span>
                </td>
            </tr>
            <tr>
                <td></td>
                <td>
                    Total
                </td>
                <td>
                    [[CurrencySymbol]] [[Total]]
                </td>
            </tr>
        </tbody>
            </table>
            <p style="font-size: 15px;font-weight: 600; display: [[ShowAsteriskMessage]]">* Please refer to Appendix 1 for additional details</p>
        </div>
        </div>
        <tbody>
            <tr>
                <td>
                    <label style="font-size: 18px;font-weight: bold;margin-left: 0;">
                        PAYMENT INSTRUCTIONS
                    </label>
                </td>
            </tr>
        </tbody>
        <tbody>
            <tr>
                <td style="font-size:14px">
                    <div id="paymentInstructions">
                    <ul>
                    <li>Please make your payment within 60 days of receiving this proforma. For any questions
                        regarding your
                        account<br />
                        contact <a href="#">payments@cactusglobal.com</a></li>
                    </ul>
                    </div>
                    <div>
                    <ul>
                    <li>
                        <strong>Payment by bank transfer:</strong><br />
                        Bank name: Citibank NA, 785 Fifth Avenue, New York, NY 10022<br />
                        Account #: 9943387205<br />
                        Account name: Cactus Communications Inc.<br />
                        ABA/Routing #: 021 0000 89<br />
                        Purpose: Payment for Invoice – [[InvoiceNumber]]<br />
                        Recipient Address: 214 Carnegie Center, Suite 102, Princeton, NJ 08540, USA<br />
                        Recipient Phone: 267-332-0051
                    </li>
                    </ul>
                    </div>
                </td>
            </tr>
        </tbody>
        </div>
        [[Appendix]]
        </div>`,
            appendixCreate: `<table style="margin: 15px 0">
        <tbody>
            <tr>
                <td class="table-heading">
                    APPENDIX 1</td>
            </tr>
        </tbody>
        </table>
        <div class="invoice-table">
        <div class="col4">
        <div id="appendix">
        <figure>
        <table>
            <thead>
                <tr>
                    <th>
                        DV code
                    </th>
                    <th>
                        Cactus SP Code
                    </th>
                    <th>
                        Project Title
                    </th>
                    <th>
                        POC
                    </th>
                    <th>
                        Amount
                    </th>
                </tr>
            </thead>
            <tbody>
                [[Appendix]]
                <tr>
                    <td colspan="4">
                        Total
                    </td>
                    <td>
                        [[CurrencySymbol]] [[Total]]
                    </td>
                </tr>
            </tbody>
        </table>
        </figure>
        </div>
        </div>
        </div>`,
            header: `<div>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background-color: #c5d3e5;">
        <td class="header-left">
        <span>Proforma No</span> : [[InvoiceNumber]] <br />
        <span>Proforma Date</span> : [[InvoiceDate]] <br />
        <span>Currency</span> : [[CurrencyName]] ([[CurrencySymbol]]) <br />
          <label>[[Invoice]]</label>
      </td>
      <td class="header-right">
          <span>
              <img class="logo-img"
               src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZ77yE3cAxlHgtyyoYl2TKUBN352fZbTRrUbfG9IIj7vLA">
          </span>
      </td>
      </tr>
            </tbody>
        </table>
    </div>`,
            footer: `<div>
        <table>
            <tr>
                <td style="font-size: 14px;text-align: center;">
                This is a computer generated proforma and does not require any stamp or signature
                </td>
            </tr>
        </table>
        <table class="footer-table">
        <tr>
          <td>
            Cactus Communications Inc.
          </td>
        </tr>
        <tr>
          <td>214 Carnegie Center, Suite 102, Princeton, NJ 08540, USA</td>
        </tr>
        <tr>
          <td>T: +1(267)-332-0051 F: +1(267) 332-0052</td>
        </tr>
        <tr>
          <td>
            <a href="http://www.cactusglobal.com/">www.cactusglobal.com</a>
          </td>
        </tr>
        </table>
        </div>`,
            contactDetails: `<figure class="table"><table> <tbody>
        <tr>
            <td>
                <p><strong>Company : </strong>[[Company]]</p>
            </td>
        </tr>
        <tr>
            <td>
                <p><strong>Client Contact : </strong>[[ClientContact1]]</p>
                [[ClientContact]]
            </td>
        </tr>
        <tr>
            <td>
                <p><strong>Email : </strong><a href="#">[[Email]]</a>
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <p><strong>Phone : </strong>[[Phone]]
                </p>
            </td>
        </tr>
        </tbody> </table> </figure> <figure class="table">
        <table >  <tbody>
        <tr>
            <td>
                <p><strong>Address : </strong>[[Address1]]</p>
                [[AddressMulti]]
            </td>
        </tr>
        </tbody> </table> </figure>`,

            address2: `<p>[[Address2]]</p>`,
            address3: `<p>[[Address3]]</p>`,
            address4: `<p>[[Address4]]</p>`,
            clientcontact2: `<p>[[ClientContact2]]</p>`,
            purchaseOrder: `<strong>Purchase Order number : </strong>[[PurchaseOrderNumber]]`,
            invoiceDetail: `<thead>
            <tr>
                <th>
                    Date
                </th>
                <th>
                    Service Details
                </th>
                <th>
                    Fees
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    [[InvoiceDate]]
                </td>
                <td>
                    [[InvoiceServiceDetails]]
                </td>
                <td>
                    [[CurrencySymbol]] [[InvoiceFees]]<span>*</span>
                </td>
            </tr>
            <tr>
                <td></td>
                <td>
                    Total
                </td>
                <td>
                    [[CurrencySymbol]] [[Total]]
                </td>
            </tr>
        </tbody>`,
            paymentInstructions: `<ul>
        <li>Please make your payment within 60 days of receiving this proforma. For any questions
            regarding your
            account<br />
            contact <a href="#">payments@cactusglobal.com</a></li>
        </ul>`,
            paymentDetails: `
            <li>
                <strong>Payment by bank transfer:</strong><br />
                Bank name: Citibank NA, 785 Fifth Avenue, New York, NY 10022<br />
                Account #: 9943387205<br />
                Account name: Cactus Communications Inc.<br />
                ABA/Routing #: 021 0000 89<br />
                Purpose: Payment for Invoice – [[InvoiceNumber]]<br />
                Recipient Address: 214 Carnegie Center, Suite 102, Princeton, NJ 08540, USA<br />
                Recipient Phone: 267-332-0051
            </li>
        `,
            appendix: `<figure>
        <table>
            <thead>
                <tr>
                    <th>
                        DV code
                    </th>
                    <th>
                        Cactus SP Code
                    </th>
                    <th>
                        Project Title
                    </th>
                    <th>
                        POC
                    </th>
                    <th>
                        Amount
                    </th>
                </tr>
            </thead>
            <tbody>
                [[Appendix]]
                <tr>
                    <td colspan="4">
                        Total
                    </td>
                    <td>
                        [[CurrencySymbol]] [[Total]]
                    </td>
                </tr>
            </tbody>
        </table>
        </figure>`,
            appendixRow: `<tr>
        <td>
            [[DvCode]]
        </td>
        <td>
            [[CactusSpCode]]
        </td>
        <td>
            [[ProjectTitle]]
        </td>
        <td>
            [[POCName]]
        </td>
        <td>
            [[CurrencySymbol]] [[Amount]]
        </td>
        </tr>`
        };

        this.JapanTemplate = {
            headerCreate: `<header id="header">
        <div>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background: #c5d3e5;">
        <td class="header-left">
        <span>Proforma No</span> : [[InvoiceNumber]] <br />
        <span>Proforma Date</span> : [[InvoiceDate]] <br />
        <span>Currency</span> : [[CurrencyName]] ([[CurrencySymbol]]) <br />
          <label>[[Invoice]]</label>
        </td>
        <td class="header-right">
          <span>
              <img class="logo-img"
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZ77yE3cAxlHgtyyoYl2TKUBN352fZbTRrUbfG9IIj7vLA">
          </span>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        </header>`,
            footerCreate: `<footer id="footer">
        <div>
        <table>
            <tr>
                <td style="font-size: 14px;text-align: center;">
                This is a computer generated proforma
                </td>
            </tr>
        </table>
        <table class="footer-table">
        <tr>
        <td>
            <P>カクタス・コミュニケーションズ株式会社</P>
        </td>
        </tr>
        <tr>
            <td><p>〒101-0061 東京都千代田区神田三崎町2-4-1 TUG-Iビル4階 </p></td>
        </tr>
        <tr>
            <td><p>T: 03-6261-2290 F: 03-4496-4557</p></td>
        </tr>
        <tr><td>
            <a href="http://www.cactusglobal.com/">www.cactusglobal.com</a>
        </td></tr>
        </table>
        </div>
        </footer>`,
            maincontent: `    <div id="main_content">
        <div style="height:1250px;">
        <table style="margin: 15px 0">
            <tbody>
                <tr>
                    <td class="table-heading">
                        CONTACT DETAILS</td>
                </tr>
            </tbody>
        </table>
        <div class="contact_details_japan">
        <div id="contact_details">
        <p><strong>Company : </strong>[[Company]]</p>
        <p><strong>Client Contact : </strong>[[ClientContact1]]</p>
        </div>
        </div>
        <table style="margin: 15px 0">
        <tbody>
            <tr>
                <td class="table-heading">
                    PURCHASE ORDER DETAIL</td>
            </tr>
        </tbody>
        </table>
        <p id="purchaseOrder" class="purchaseOrder">
            <tr>
                <td>
                    <p>
                        <strong> Purchase Order number : </strong> [[PurchaseOrderNumber]] 
                    </p>
                </td>
            </tr>
        </p>
        <table style="margin: 15px 0">
            <tbody>
                <tr>
                    <td class="table-heading">
                    PROFORMA DETAIL
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="invoice-table proformaDetail">
            <div id="invoiceDetail" style="margin-bottom: 10px;">
                <table border="0" cellspacing="0" cellpadding="0">
                <thead>
                <tr>
                    <th>
                        Date
                    </th>
                    <th>
                        Service Details
                    </th>
                    <th>
                        Fees
                    </th>
                </tr>
            </thead>
            <tbody>
            <tr>
            <td>
                <p>[[InvoiceDate]]</p>
            </td>
            <td>
                <p>[[InvoiceServiceDetails]]</p>
            </td>
            <td>
                <p>[[CurrencySymbol]] [[InvoiceFees]]<span style="display: [[ShowAsterisk]]">*</span></p>
            </td>
            </tr>
            <tr>
                <td>
                    <p>[[InvoiceDate]]</p>
                </td>
                <td>
                    <p>Consumption Tax @ 8%</p>
                </td>
                <td>
                    <p>[[CurrencySymbol]] [[ConsumptionTax]]</p>
                </td>
            </tr>
            <tr>
                <td></td>
                <td>
                    <p>Total</p>
                </td>
                <td>
                    <p>[[CurrencySymbol]] [[Total]]</p>
                </td>
            </tr>
            </tbody>
                </table>
                <p style="font-size: 15px;font-weight: 600; display: [[ShowAsteriskMessage]]">* Please refer to Appendix 1 for additional details</p>
            </div>
        </div>
        <tbody>
            <tr>
                <td>
                    <label style="font-size: 18px;font-weight: bold;margin-left: 0;">
                        PAYMENT INSTRUCTIONS
                    </label>
                </td>
            </tr>
        </tbody>
        <tbody class="paymentDetails">
            <tr>
                <td style="font-size:14px">
                    <div class="paymentInstructions" id="paymentInstructions1">
                    <label>
                    振込先銀行：三菱UFJ銀行 品川駅前支店(店番588) 普通預金 2406331<br/>
                    口座名義：カクタスコミュニケーションズカブシキガイシャ
                    </label>
                    <label>振込先銀行：三井住友銀行 新橋支店(店番216) 普通預金 2168965<br/>
                    口座名義：カクタスコミュニケーションズカブシキガイシャ
                    </label>
                    </div>
                    <ul id="paymentInstructions2">
                    <li>
                        振込手数料はお客様ご負担でお願いいたします
                    </li>
                    <li>
                    この請求書が届いてから60日以内にお支払いをお願いいたします
                    </li>
                    <li>
                        正式な書類として弊社の電子押印で発行しております
                    </li>
                    </ul>
                </td>
            </tr>
        </tbody>
        <table class="signature-table">
            <!-- <tr>
                <td>
                    <img src="stamp.png">
                </td>
            </tr> -->
    
            <tr>
                <td>
                    <p style="font-size:15px;margin-top: 60px">
                        カクタス・コミュニケーションズ株式会社</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p style="font-size:15px">
                        〒101-0061 東京都千代田区神田三崎町2-4-1</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p style="font-size:15px">
                        TUG-Iビル4階</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p style="font-size:15px">
                        代表取締役 湯浅 誠</p>
                </td>
            </tr>
    
        </table>
        </div>
        [[Appendix]]
        </div>`,
            appendixCreate: `<table style="margin: 15px 0">
        <tbody>
            <tr>
                <td class="table-heading">
                    APPENDIX 1</td>
            </tr>
        </tbody>
    </table>
    <div class="invoice-table">
        <div class="col3">
        <div id="appendix" >
        <figure>
        <table>
        <thead>
            <tr style="text-align: center; font-size: 16px; font-weight: bold;">
                <th>
                    Project Code
                </th>
                <th>
                    Title
                </th>
                <th>
                    Amount
                </th>
            </tr>
        </thead>
        <tbody>
            [[Appendix]]
        </tbody>
        </table>
        </figure>
        </div>
        </div>
    </div>`,
            header: `<div>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background: #c5d3e5;">
        <td class="header-left">
        <span>Proforma No</span> : [[InvoiceNumber]] <br />
        <span>Proforma Date</span> : [[InvoiceDate]] <br />
        <span>Currency</span> : [[CurrencyName]] ([[CurrencySymbol]]) <br />
          <label>[[Invoice]]</label>
        </td>
        <td class="header-right">
          <span>
              <img class="logo-img"
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZ77yE3cAxlHgtyyoYl2TKUBN352fZbTRrUbfG9IIj7vLA">
          </span>
        </td>
        </tr>
        </tbody>
        </table>
        </div>`,
            footer: `<div>
      <table>
          <tr>
              <td style="font-size: 14px;text-align: center;">
                  This is a computer generated proforma
              </td>
          </tr>
      </table>
      <table class="footer-table">
        <tr>
        <td>
            <P>カクタス・コミュニケーションズ株式会社</P>
        </td>
        </tr>
        <tr>
            <td><p>〒101-0061 東京都千代田区神田三崎町2-4-1 TUG-Iビル4階 </p></td>
        </tr>
        <tr>
            <td><p>T: 03-6261-2290 F: 03-4496-4557</p></td>
        </tr>
        <tr><td>
            <a href="http://www.cactusglobal.com/">www.cactusglobal.com</a>
        </td></tr>
        </table>
        </div>`,
            contactDetails: `<p><strong>Company : </strong>[[Company]]</p>
        <p><strong>Client Contact : </strong>[[ClientContact1]]</p>`,
            purchaseOrder: `<strong> Purchase Order number : </strong> [[PurchaseOrderNumber]] `,
            invoiceDetail: `<thead>
            <tr>
                <th>
                    Date
                </th>
                <th>
                    Service Details
                </th>
                <th>
                    Fees
                </th>
            </tr>
        </thead>
        <tbody>
        <tr>
        <td>
            <p>[[InvoiceDate]]</p>
        </td>
        <td>
            <p>[[InvoiceServiceDetails]]</p>
        </td>
        <td>
            <p>[[CurrencySymbol]] [[InvoiceFees]]<span>*</span></p>
        </td>
        </tr>
        <tr>
            <td>
                <p style="text-align: center;font-size: 16px;margin: 15px 0;">[[InvoiceDate]]</p>
            </td>
            <td>
                <p style="padding-left: 15px;font-size: 16px;">Consumption Tax @ 8%</p>
            </td>
            <td>
                <p style="font-size: 16px;text-align: center;font-weight: bold;">[[CurrencySymbol]] [[ConsumptionTax]]</p>
            </td>
        </tr>
        <tr>
            <td></td>
            <td style="text-align: center;font-weight: bold; font-size: 16px;">
                <p>Total</p>
            </td>
            <td>
                <p style="text-align: center;font-weight: bold; font-size: 16px;">[[CurrencySymbol]] [[Total]]</p>
            </td>
        </tr>
        </tbody>`,
            paymentInstructions: `<label>
        振込先銀行：三菱UFJ銀行 品川駅前支店(店番588) 普通預金 2406331<br/>
        口座名義：カクタスコミュニケーションズカブシキガイシャ
        </label>
        <label>振込先銀行：三井住友銀行 新橋支店(店番216) 普通預金 2168965<br/>
        口座名義：カクタスコミュニケーションズカブシキガイシャ
        </label>`,
            paymentDetails: `<li>
            振込手数料はお客様ご負担でお願いいたします
        </li>
        <li>
        この請求書が届いてから<span id="paymentInstructions">60</span>日以内にお支払いをお願いいたします
        </li>
        <li>
            正式な書類として弊社の電子押印で発行しております
        </li>`,
            appendix: `<table>
        <thead>
            <tr style="text-align: center; font-size: 16px; font-weight: bold;">
                <th>
                    Project Code
                </th>
                <th>
                    Title
                </th>
                <th>
                    Amount
                </th>
            </tr>
        </thead>
        <tbody>
            [[Appendix]]
        </tbody>
    </table>`,
            appendixRow: `<tr>
        <td style="font-weight:normal;">
            [[ProjectCode]]
        </td>
        <td style="font-weight:normal;">
            [[Title]]
        </td>
        <td>
            [[CurrencySymbol]] [[Amount]]
        </td>
        </tr>`
        };

        this.headerstyle = `<!DOCTYPE html>
        <html>
            <head>
                <title></title>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <style>
                    #header {
                        font-family: Verdana !important;
                    }
                    
                    #header p {
                        margin: 0;
                        line-height: 1.5;
                    }
                    
                    #header table {
                        border-collapse: collapse;
                        background: #fff;
                        width: 100%;
                        margin: 0px;
                    }
                    
                    #header .logo-img {
                        width: 200px; 
                        height: auto; 
                        margin: auto
                    }
                    
                    .header-left {
                        width: 50%;
                        padding-left: 40px;
                        font-size: 15px;
                        line-height: 2;
                        font-weight: 500;
                        margin: 0;
                        text-align: left;
                    }
                    
                    .header-left label {
                        font-size: 26px;
                        font-weight: 500
                    }
                    
                    .header-right {
                        width: 10%;
                        text-align: right;
                        display: table-cell;
                    }
                    
                    .header-right-label {
                        margin-right: 40px;
                        float: right;
                    }
                    
                    .header-right p,
                    .header-right-label p {
                        font-weight: bold;
                    }
                    
                    .header-center {
                        font-size: 22px;
                        font-weight: 500;
                    }
                    
                    #header div table tbody tr {
                        background: #c5d3e5
                    }
                    
                    #header label {
                        text-transform: uppercase;
                    }
                    
                    #header .header-left span {
                        width: 115px !important;
                        display: inline-block;
                    }
                    
                    #header .header-left.indHeader span {
                        width: 145px !important;
                    }
                </style>
            </head>
            <body>
            [[HeaderContent]]
            </body>
            </html>`;

        this.footerStyle = `<!DOCTYPE html>
    <html>
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <style>
                #footer {
                    font-size: 16px;
                    color: #333;
                    background-color: #fff;
                    font-family: Verdana !important;
                }
                
                #footer {
                    font-family: Verdana !important;
                }
                
                #footer p {
                    margin: 0;
                    line-height: 1.5;
                }
                
                #footer table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 0px;
                }
                
                .footer-table {
                    background: #c5d3e5;
                    text-align: center;
                    font-size: 15px;
                    line-height: 24px;
                }
                
                .footer-table a {
                    text-decoration: none;
                    color: blue;
                }
                
                footer table:first-child {
                    margin-top: 10px
                }
                
                footer table:first-child tr td {
                    font-size: 14px;
                    text-align: center;
                }
                footer {
                    height:175px;
                    background-color:#c5d3e5
                }
                footer table:last-child {
                    margin-top: 8px !important;
                } 
                footer table:last-child tr td {
                    padding: 5px;
                }
            </style>
    </head>
    <body>
    [[FooterContent]]
    </body>
    </html>`;
        this.contentStyle = `<!DOCTYPE html>
        <html>
            <head>
                <title></title>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <style>
                    #main_content {
                        font-size: 16px;
                        color: #333;
                        background-color: #fff;
                        font-family: Verdana !important;
                    }
                    
                    #main_content table {
                        border-collapse: collapse;
                        background: #fff;
                        width: 100%;
                        margin: 0px;
                    }
                    
                    #main_content p {
                        margin: 0;
                        line-height: 1.5;
                    }
                    
                    .table-heading {
                        width: 100%;
                        text-align: center;
                        font-weight: bold;
                        background: #d8d8d8;
                        font-size: 16px;
                        color: #000;
                        padding: 10px;
                    }
                    
                    .contact_details p,
                    .contact_details_japan p {
                        padding-top: 3px;
                        padding-bottom: 3px;
                    }
                    
                    .contact_details-table figure:first-child {
                        width: 47%;
                        margin: 0px !important;
                        display: inline-block;
                        vertical-align: top;
                    }
                    
                    ;
                    .contact_details-table figure:nth-child(3) table {
                        width: 100%;
                    }
                    
                    .referenceDetail figure,
                    .appendix figure,
                    .contact_details-table figure,
                    figure {
                        display: contents;
                    }
                    
                    .contact_details-table table:first-child p {
                        margin: 0;
                        line-height: 24px;
                        font-size: 16px;
                    }
                    
                    .contact_details-table table:first-child tr td {
                        margin: 0;
                        line-height: 24px;
                        font-size: 16px;
                        border: none !important;
                        padding: 5px;
                    }
                    
                    #main_content p span {
                        display: inline-flex;
                    }
                    
                    .contact-detail-table-left {
                        width: 50%;
                        float: left;
                        margin-bottom: 20px;
                    }
                    
                    .contact-detail-table-left p,
                    .contact-detail-table-right p {
                        margin: 0;
                        line-height: 24px;
                        font-size: 15px;
                    }
                    
                    .contact-detail-table-right {
                        float: right;
                        text-align: left;
                        width: 50%;
                    }
                    
                    .purchaseOrder p {
                        height: 25px;
                        font-size: 16px;
                    }
                    
                    .referenceDetail {
                        height: 50px;
                        font-size: 16px;
                    }
                    
                    .referenceDetail table {
                        width: 94%;
                    }
                    
                    .contact-detail-table {
                        padding-left: 30px;
                    }
                    
                    .contact-detail-table p {
                        margin: 0;
                        line-height: 24px;
                        font-size: 16px;
                    }
                    
                    #main_content ul {
                        line-height: 26px;
                        padding-left: 20px;
                        list-style: unset;
                    }
                    
                    .paymentDetails,
                    .column-flex {
                        display: inline-flex;
                    }
                    
                    .invoice-table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    
                    .invoice-table td {
                        border: 1px solid #000 !important;
                        padding: 0;
                        vertical-align: middle;
                    }
                    
                    .invoice-table th {
                        border: 1px solid #000 !important;
                        padding: 0;
                        vertical-align: middle;
                    }
                    
                    .invoice-table table thead tr {
                        text-align: center;
                        font-size: 16px;
                        font-weight: bold;
                    }
                    
                    .invoice-table table thead tr th {
                        padding: 10px 12px;
                        text-align: center
                    }
                    
                    .invoice-table table tbody tr td {
                        text-align: left;
                        font-size: 16px;
                        padding: 16px 10px;
                        border: 1px solid #000 !important;
                        vertical-align: middle;
                    }
                    
                    .invoice-table table tfoot tr td {
                        text-align: center;
                        font-size: 16px;
                        padding: 16px 10px;
                        font-weight: bold;
                    }
                    
                    .invoice-table table tbody tr:last-child td:last-child {
                        font-weight: bold;
                    }
                    
                    .invoice-table table tbody tr td:last-child {
                        font-weight: bold;
                        width: 17%;
                        text-align: right;
                    }
                    
                    .invoice-table table tbody tr td:first-child {
                        text-align: left;
                        width: 15%
                    }
                    
                    .appendix table tbody tr:last-child td {
                        font-weight: normal;
                    }
                    
                    .appendix table tbody tr td:last-child {
                        font-weight: bold;
                    }
                    
                    .signature-table {
                        float: right;
                        text-align: right;
                        margin-right: 10px !important;
                        background-image: url(https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZNP0M5U1nFCgVaguRgo4S0B3-L67nYrXIgtxcYoJEba9w) !important;
                        background-repeat: no-repeat !important;
                        background-position: right !important;
                    }
                    
                    .signature-table p {
                        margin: 0;
                        line-height: 24px;
                    }
                    
                    .paymentInstructions label {
                        font-size: 16px;
                        font-weight: bold;
                        display: table;
                        margin-top: 20px;
                    }
                    
                    .proformaDetail table tbody tr td {
                        text-align: left;
                        padding: 16px 10px;
                    }
                    
                    .proformaDetail table tbody tr:last-child td:nth-child(2) {
                        text-align: center;
                        font-weight: bold;
                    }
                    
                    .indiaPurchase td:first-child p strong {
                        width: 235px;
                        display: inline-block;
                    }
                    
                    #contact_details table tbody tr td p strong,
                    #contact_details p strong,
                    #contact_details table tbody tr td strong,
                    #contact_details strong {
                        display: inline-block;
                        width: 150px;
                        font-size: 16px;
                    }
                    
                    #contact_details table tbody tr td p+p {
                        padding-left: 150px;
                    }
                    
                    .indContact #contact_details figure:first-child table tbody tr td p strong,
                    .indContact #contact_details figure:last-child table tbody tr td p strong,
                    .indContact #contact_details figure:first-child table tbody tr td strong,
                    .indContact #contact_details figure:last-child table tbody tr td strong {
                        width: 160px;
                    }
                    
                    .indContact #contact_details figure:nth-child(2) table tbody tr td p strong,
                    .indContact #contact_details figure:nth-child(2) table tbody tr td strong {
                        width: 125px;
                    }
                    
                    .indContact #contact_details figure:nth-child(2) table tbody tr td a {
                        margin-left: -5px;
                    }
                    
                    .indContact #contact_details figure:last-child {
                        margin-left: 3px !important;
                    }
                    
                    .indContact #contact_details figure:last-child table tbody tr td p+p {
                        padding-left: 160px;
                    }
                    
                    .indContact figure {
                        margin: 0px !important;
                        vertical-align: top;
                        display: inline-block;
                    }
                    
                    .usContact figure:last-child {
                        width: 44% !important;
                        display: inline-block;
                        margin: 0px;
                        vertical-align: top;
                    }
                    
                    .indContact figure:first-child {
                        width: 50% !important;
                    }
                    
                    .indContact figure:nth-child(2) {
                        width: 44% !important;
                    }
                    
                    .indContact figure:last-child {
                        width: 100% !important;
                    }
                    
                    .invoice-table table,
                    #appendix figure {
                        width: 100% !important;
                        margin: 0px !important;
                    }
                    
                    #appendix.col4 table tr th:first-child,
                    #appendix.col4 table tr td:first-child,
                    .col4 #appendix table tr th:first-child,
                    .col4 #appendix table tr td:first-child  {
                        width: 18%;
                    }
                    
                    #appendix.col4 table tr th:nth-child(2),
                    #appendix.col4 table tr td:nth-child(2),
                    .col4 #appendix table tr th:nth-child(2),
                    .col4 #appendix table tr td:nth-child(2) {
                        width: 17%;
                    }
                    #appendix.col4 table tr th:last-child,
                    #appendix.col4 table tr td:last-child,
                    .col4 #appendix table tr th:last-child,
                    .col4 #appendix table tr td:last-child {
                        width: 17%;
                    }
                    
                    #appendix.col3 table tr th:first-child,
                    #appendix.col3 table tr td:first-child,
                    .col3 #appendix table tr th:first-child,
                    .col3 #appendix table tr td:first-child {
                        width: 17%;
                    }
                    
                    #appendix.col3 table tr th:last-child,
                    #appendix.col3 table tr td:last-child,
                    .col3 #appendix table tr th:last-child,
                    .col3 #appendix table tr td:last-child {
                        width: 17%;
                    }

                    #appendix.col5 table tr th:first-child,
                    #appendix.col5 table tr td:first-child,
                    .col5 #appendix table tr th:first-child,
                    .col5 #appendix table tr td:first-child  {
                        width: 18%;
                    }

                    #appendix.col5 table tr th:nth-child(2),
                    #appendix.col5 table tr td:nth-child(2),
                    .col5 #appendix table tr th:nth-child(2),
                    .col5 #appendix table tr td:nth-child(2) {
                        width: 17%;
                    }

                    #appendix.col5 table tr th:nth-child(4),
                    #appendix.col5 table tr td:nth-child(4),
                    .col5 #appendix table tr th:nth-child(4),
                    .col5 #appendix table tr td:nth-child(4) {
                        width: 20%;
                    }

                    #appendix.col5 table tr th:last-child,
                    #appendix.col5 table tr td:last-child,
                    .col5 #appendix table tr th:last-child,
                    .col5 #appendix table tr td:last-child {
                        width: 17%;
                    }

                    
                    #appendix figure img {
                        width: 100%;
                    }
                </style>
            </head>
        <body>
        `;

        this.IndiaTemplate = {
            headerCreate: `<header id=header>
        <div>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background: #c5d3e5;">
        <td class="header-left indHeader">
        <span>
              <img style="margin-bottom: 20px;" class="logo-img"
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZ77yE3cAxlHgtyyoYl2TKUBN352fZbTRrUbfG9IIj7vLA">
        </span>
        <p>
            <span>GST Proforma No</span> : <br />
            <span>Proforma No</span> : [[InvoiceNumber]] <br />
            <span>Proforma Date</span> : [[InvoiceDate]]<br />
            <span>Currency</span> : [[CurrencyName]] ([[CurrencySymbol]])</p>
        </td>
        <td class="header-center">
            <label>TAX Proforma</label>
        </td>
        <td class="header-right-label">
            <p>Original for Recipient</p>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        </header>`,
            footerCreate: `<footer id="footer">
        <div>
      <table>
          <tr>
              <td style="font-size: 14px;text-align: center;">
                  This is a computer generated proforma
              </td>
          </tr>
      </table>
      <table class="footer-table">
      <tr>
            <td>
                <P>Cactus Communications Pvt. Ltd. (CIN U64200MH2002PTC137488)</P>
            </td>
        </tr>
        <tr>
            <td>
                <p>A/603, 6th Floor, Satellite Gazebo, Guru Hargovind Singh Marg, Andheri (East), Mumbai 400093, India</p>
            </td>
        </tr>
        <tr>
            <td>
                <p>T: +91 22 67148888 F: +91 22 67148889 </p>
            </td>
        </tr>
        <tr>
            <td>
                <a href="http://www.cactusglobal.com/">www.cactusglobal.com</a>
            </td>
        </tr>
        </table>
        </div>
        </footer>`,
            maincontent: `<div id="main_content" class="indContact">
        <div style="height:1250px;">
        <table style="margin: 15px 0;">
            <tbody>
                <tr>
                    <td class="table-heading">
                        CONTACT DETAILS</td>
                </tr>
            </tbody>
        </table>
    
        <div class="contact_details-table">
            <div id="contact_details">
            <figure class="table"><table>
                <tbody>
            <tr>
                <td>
                    <p><strong>Company : </strong>[[Company]]</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Client Contact : </strong>[[ClientContact]]</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Place of Supply : </strong>
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Client GST no : </strong>
    
                </td>
            </tr>
            </tbody>
            </table></figure>
            <figure class="table"><table>
            <tbody>
            <tr>
                <td>
                    <p><strong>Phone : </strong>[[Phone]]
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Designation : </strong>[[Designation]]
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Email : </strong>
                    <a href="#">[[Email]]</a>
                    </p>
                </td>
            </tr>
            </tbody>
            </table></figure>
            <figure class="table"><table>
            <tbody>
            <tr>
            <td>
                <p><strong>Address : </strong>[[Address1]]</p>[[AddressMulti]]
            </td>
            </tr>
            </tbody>
            </table></figure>
            </div>
        </div>
    
        <table style="margin: 15px 0">
            <tbody>
                <tr>
                    <td class="table-heading">REFERENCE DETAILS</td>
                </tr>
            </tbody>
        </table>
    
        <div id="referenceDetail" class="referenceDetail">
            <table >
                <tbody>
                <tr class="indiaPurchase">
                    <td style="width: 40%; float: left;text-align: left;">
                        <p style="font-size:15px">
                        <strong> Purchase Order number : </strong>  [[PurchaseOrderNumber]]  </p>
                    </td>
                    <td style="width: 40%; float: left;text-align: left;">
                        <p style="font-size:15px">
                        <strong> GST no : </strong> 27AACCC1194L1ZI  </p>
                    </td>
                </tr>
                <tr class="indiaPurchase">
                    <td style="width: 40%; float: left;text-align: left;">
                        <p style="font-size:15px;margin: 0;">
                        <strong> PAN No : </strong> AACCC1194L  </p>
                    </td>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </div>
    
    
        <table style="margin: 15px 0">
            <tbody>
                <tr>
                    <td class="table-heading">
                    PROFORMA DETAIL
                    </td>
                </tr>
            </tbody>
        </table>
    
        <div class="invoice-table proformaDetail">
            <div id="invoiceDetail" style="margin-bottom: 20px;">
                <table border="0" cellspacing="0" cellpadding="0">
                <thead>
        <tr style="text-align: center; font-size: 16px; font-weight: bold;">
            <th>
                Date
            </th>
            <th>
                Service
            </th>
            <th>
                Service Accounting Code
            </th>
            <th>
                Fees
            </th>
        </tr>
        </thead>
            <tbody>
            <tr>
            <td style="width:12%;">
                [[InvoiceDate]]
            </td>
            <td>
                [[InvoiceServiceDetails]]
            </td>
            <td>998399 (Other Professional, Technical and Business Services n. e. c.)</td>
            <td>
                [[CurrencySymbol]] [[InvoiceFees]]<span style="display: [[ShowAsterisk]]">*</span>
            </td>
            </tr>
            <tr>
            <td>
            [[InvoiceDate]]
            </td>
            <td>
                Integrated Tax @ 18.00%
            </td>
            <td></td>
            <td>
                [[CurrencySymbol]] [[CentralTax]]
            </td>
            </tr>
            <tr>
            <td></td>
            <td></td>
            <td style="text-align: center;">
                Total
            </td>
            <td>
                [[CurrencySymbol]] [[Total]]
            </td>
            </tr>
            </tbody>
            </table>
                <p style="font-size: 15px;font-weight: 600; display: [[ShowAsteriskMessage]]">* Please refer to Appendix 1 for additional details</p>
            </div>
        </div>
    
        <tbody>
            <tr>
                <td>
                    <label style="font-size: 18px;font-weight: bold;margin-left: 0;">
                        PAYMENT INSTRUCTIONS
                    </label>
                </td>
            </tr>
        </tbody>
    
        <tbody>
            <tr>
                <td style="font-size:14px">
                    <div id="paymentInstructions">
                    <ul>
                    <li>Please make your payment within 60 days of receiving this proforma. For any questions regarding your account<br />
                    contact <a href="#">payments@cactusglobal.com</a></li>
                    </ul>
                    </div>
                    <div class="paymentDetails">
                        <ul>
                        <li>
                            <strong>Payment by NEFT/RTGS
                            (Please note the transfer charges will be borne by you):</strong>
                            <p>Bank name:  Citibank NA</p>
                            <p style="display: inline-flex">Bank address: <span> Citibank N.A. Times Square IT Park branch, Wing B,
                            Unit No. 1, Andheri-Kurla Road,Marol, Andheri (E), Mumbai – 400 059.</span></p>
                            <p>Branch name: Andheri (E), Mumbai, India</p>
                            <p>IFSC: CITI0100000</p>
                            <p>Account #:  0256594118</p>
                            <p>Beneficiary Name : Cactus Communications Pvt. Ltd.</p>
                            <p>Beneficiary Address : A/603, 6th Floor, Satellite Gazebo, Guru Hargovind Singh Marg, Andheri (East), Mumbai 400093, India </p>
                            <p>Recipient Phone : +91 22 67148888 </p>
                        </li>
                        </ul>
                    </div>
                </td>
            </tr>
        </tbody>
        </div>
        [[Appendix]]
        </div>`,
            appendixCreate: `<table style="margin: 15px 0">
        <tbody>
            <tr>
                <td class="table-heading">
                    APPENDIX 1</td>
            </tr>
        </tbody>
        </table>
    
        <div class="invoice-table appendix">
            <div class="col4">
            <div id="appendix"> <figure>
            <table>
        <thead>
            <tr style="text-align: center; font-size: 16px; font-weight: bold;">
                <th>
                    Short Title
                </th>
                <th>
                    Project Code
                </th>
                <th>
                    Title
                </th>
                <th>
                    Amount
                </th>
             </tr>
        </thead>
        <tbody>
            [[Appendix]]
        </tbody>
        </table></figure>
            </div>
            </div>
        </div>`,
            header: `<div id=header>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background: #c5d3e5;">
        <td class="header-left indHeader">
        <span>
              <img style="margin-bottom: 20px;" class="logo-img"
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZ77yE3cAxlHgtyyoYl2TKUBN352fZbTRrUbfG9IIj7vLA">
        </span>
        <p>
            <span>GST Proforma No</span> : <br />
            <span>Proforma No</span> : [[InvoiceNumber]] <br />
            <span>Proforma Date</span> : [[InvoiceDate]]<br />
            <span>Currency</span> : [[CurrencyName]] ([[CurrencySymbol]])</p>
        </td>
        <td class="header-center">
            <label>TAX Proforma</label>
        </td>
        <td class="header-right-label">
            <p>Original for Recipient</p>
        </td>
        </tr>
        </tbody>
        </table>
        </div>`,
            footer: `<div>
      <table>
          <tr>
              <td style="font-size: 14px;text-align: center;">
                  This is a computer generated proforma
              </td>
          </tr>
      </table>
      <table class="footer-table">
      <tr>
            <td>
                <P>Cactus Communications Pvt. Ltd. (CIN U64200MH2002PTC137488)</P>
            </td>
        </tr>
        <tr>
            <td>
                <p>A/603, 6th Floor, Satellite Gazebo, Guru Hargovind Singh Marg, Andheri (East), Mumbai 400093, India</p>
            </td>
        </tr>
        <tr>
            <td>
                <p>T: +91 22 67148888 F: +91 22 67148889 </p>
            </td>
        </tr>
        <tr>
            <td>
                <a href="http://www.cactusglobal.com/">www.cactusglobal.com</a>
            </td>
        </tr>
        </table>
        </div>`,
            contactDetails1: `<figure class="table"><table><tbody>
            <tr>
                <td>
                    <p><strong>Company : </strong>[[Company]]</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Client Contact : </strong>[[ClientContact]]</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Place of Supply : </strong>
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Client GST no : </strong>
    
                </td>
            </tr>
        </tbody>  </table></figure>
        <figure class="table"><table>
        
        <tbody>
            <tr>
                <td>
                    <p><strong>Phone : </strong>[[Phone]]
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Designation : </strong>[[Designation]]
                </td>
            </tr>
            <tr>
                <td>
                    <p><strong>Email : </strong>
                    <a href="#">[[Email]]</a>
                    </p>
                </td>
            </tr>
        </tbody> </table></figure>
        <figure class="table"><table>
        <tbody>
        <tr>
        <td>
            <p><strong>Address : </strong>[[Address1]]</p>[[AddressMulti]]
        </td>
        </tr>
        </tbody> </table></figure>
        `,
            address2: `<p>[[Address2]]</p>`,
            address3: `<p>[[Address3]],</p>`,
            address4: `<p>[[Address4]]</p>`,
            //     contactDetails2: `<tbody>
            //     <tr>
            //         <td>
            //             <p><strong>Phone : </strong>[[Phone]]
            //         </td>
            //     </tr>
            //     <tr>
            //         <td>
            //             <p><strong>Designation : </strong>[[Designation]]
            //         </td>
            //     </tr>
            //     <tr>
            //         <td>
            //             <p><strong>Email : </strong>
            //             <a href="#">[[Email]]</a>
            //             </p>
            //         </td>
            //     </tr>
            // </tbody>`,
            //     address: `<tbody>
            // <tr>
            // <td>
            //     <p><strong>Address : </strong>[[Address1]]</p>[[AddressMulti]]
            // </td>
            // </tr>
            // </tbody>`,
            purchaseOrder: `<tr class=indiaPurchase>
                <td style="width: 40%; float: left;text-align: left;">
                    <p style="font-size:15px">
                    <strong> Purchase Order number : </strong>[[PurchaseOrderNumber]]</p>
                </td>
                <td style="width: 40%; float: left;text-align: left;">
                    <p style="font-size:15px">
                    <strong> GST no : </strong>27AACCC1194L1ZI</p>
                </td>
            </tr>
            <tr class=indiaPurchase>
                <td style="width: 40%; float: left;text-align: left;">
                    <p style="font-size:15px;margin: 0;">
                    <strong> PAN No : </strong>AACCC1194L</p>
                </td>
                <td></td>
            </tr>`,
            invoiceDetail: `<thead>
        <tr style="text-align: center; font-size: 16px; font-weight: bold;">
            <th>
                Date
            </th>
            <th>
                Service
            </th>
            <th>
                Service Accounting Code
            </th>
            <th>
                Fees
            </th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td style="width:12%;">
                [[InvoiceDate]]
            </td>
            <td>
                [[InvoiceServiceDetails]]
            </td>
            <td>998399 (Other Professional, Technical and Business Services n. e. c.)</td>
            <td>
                [[CurrencySymbol]] [[InvoiceFees]]<span>*</span>
            </td>
        </tr>
        <tr>
            <td>
            [[InvoiceDate]]
            </td>
            <td>
                Integrated Tax @ 18.00%
            </td>
            <td></td>
            <td>
                [[CurrencySymbol]] [[CentralTax]]
            </td>
        </tr>
        
        <tr>
            <td></td>
            <td colspan="2" style="text-align: center;font-weight: bold; font-size: 16px;">
                Total
            </td>
            <td>
                [[CurrencySymbol]] [[Total]]
            </td>
        </tr>
    </tbody>`,
            paymentInstructions: `<ul>
        <li>Please make your payment within 60 days of receiving this proforma. For any questions regarding your account<br />
        contact <a href="#">payments@cactusglobal.com</a></li>
        </ul>`,
            paymentDetails: `
            <li>
                <strong>Payment by NEFT/RTGS
                (Please note the transfer charges will be borne by you):</strong>
                <p>Bank name:  Citibank NA</p>
                <p style="display: inline-flex">Bank address: <span> Citibank N.A. Times Square IT Park branch, Wing B,
                Unit No. 1, Andheri-Kurla Road,Marol, Andheri (E), Mumbai – 400 059.</span></p>
                <p>Branch name: Andheri (E), Mumbai, India</p>
                <p>IFSC: CITI0100000</p>
                <p>Account #:  0256594118</p>
                <p>Beneficiary Name : Cactus Communications Pvt. Ltd.</p>
                <p>Beneficiary Address : A/603, 6th Floor, Satellite Gazebo, Guru Hargovind Singh Marg, Andheri (East), Mumbai 400093, India</p>
                <p>Recipient Phone : +91 22 67148888 </p>
            </li>
        `,
            appendix: `<table>
        <thead>
            <tr style="text-align: center; font-size: 16px; font-weight: bold;">
                <th>
                    Short Title
                </th>
                
                <th>
                    Project Code
                </th>
                <th style="width: 50%;">
                    Title
                </th>
                <th>
                    Amount
                </th>
             </tr>
        </thead>
        <tbody>
            [[Appendix]]
        </tbody>
    </table>`,
            appendixRow: `<tr>
    <td>
        [[DVCode]]
    </td>
    <td>
        [[ProjectCode]]
    </td>
    <td>
        [[Title]]
    </td>
    
    <td style="font-weight: bold;">
        [[CurrencySymbol]] [[Amount]]
    </td>
    </tr>`
        };

    }

    showDialog() {
        this.USTemplateCopy = {};
        this.JapanTemplateCopy = {};
        this.IndiaTemplateCopy = {};
        this.displayUS = true;
        this.USTemplateCopy = this.USHtmlObject;

    }

    showDialog1() {
        this.USTemplateCopy = {};
        this.JapanTemplateCopy = {};
        this.IndiaTemplateCopy = {};
        this.displayJapan = true;
        this.JapanTemplateCopy = this.japanHtmlObject;
    }

    showDialog2() {
        this.USTemplateCopy = {};
        this.JapanTemplateCopy = {};
        this.IndiaTemplateCopy = {};
        this.displayIndia = true;
        this.IndiaTemplateCopy = this.indiaHtmlObject;
    }

    editable(id: string) {
        this.elementId = id;
        if (id === 'contact_details') {
            this.heading = 'Contact Details';
        }
        if (id === 'paymentInstructions') {
            this.heading = 'Payment Instructions';
        }
        if (id === 'appendix') {
            this.heading = 'Appendix';
        }
        this.editor = true;
        const mainUl = document.getElementById(id);
        const getLi = mainUl.getElementsByTagName('li')[1];
        if (getLi === null || getLi === undefined) {
            this.data = document.getElementById(id).innerHTML;
        } else {
            console.log(getLi.firstElementChild.innerHTML);
            this.data = getLi.firstElementChild.innerHTML;
        }
    }

    close() {
        this.editor = false;
    }

    createUSInvoice(invoiceData) {
        // originalTemplate
        // console.log(this.invoicedata);
        // invoiceData = this.invoicedata;
        this.address = '';
        this.clientContact = '';
        const newArr: any = [];
        const USInvoice: any = Object.assign({}, this.USTemplate);
        USInvoice.headerCreate = USInvoice.headerCreate.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        USInvoice.headerCreate = USInvoice.headerCreate.replace('[[InvoiceDate]]', invoiceData.invoice_date);
        USInvoice.headerCreate = USInvoice.headerCreate.replace('[[CurrencyName]]', invoiceData.usCurrencyName);
        USInvoice.headerCreate = USInvoice.headerCreate.replace('[[CurrencySymbol]]', invoiceData.usCurrencySymbol);
        USInvoice.headerCreate = USInvoice.headerCreate.replace('[[Invoice]]', invoiceData.invoice);

        USInvoice.maincontent = USInvoice.maincontent.replace('[[Company]]', invoiceData.company);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[ClientContact1]]', invoiceData.clientcontact1);
        USInvoice.clientcontact2 = USInvoice.clientcontact2.replace('[[ClientContact2]]', invoiceData.clientcontact2);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[Email]]', invoiceData.email);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[Phone]]', invoiceData.phone);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[Address1]]', invoiceData.address1);
        USInvoice.address2 = USInvoice.address2.replace('[[Address2]]', invoiceData.address2);
        USInvoice.address3 = USInvoice.address3.replace('[[Address3]]', invoiceData.address3);
        USInvoice.address4 = USInvoice.address4.replace('[[Address4]]', invoiceData.address4);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[PurchaseOrderNumber]]', invoiceData.purchaseOrderNumber);
        // console.log(USInvoice.maincontent);

        if (invoiceData.address2 != null && invoiceData.address2.trim() !== '' && invoiceData.address2 !== undefined) {
            this.address = this.address + USInvoice.address2;
            // console.log(this.address);
        }
        if (invoiceData.address3 != null && invoiceData.address3.trim() !== '' && invoiceData.address3 !== undefined) {
            this.address = this.address + USInvoice.address3;
            // console.log(this.address);
        }
        if (invoiceData.address4 != null && invoiceData.address4.trim() !== '' && invoiceData.address4 !== undefined) {
            this.address = this.address + USInvoice.address4;
            // console.log(this.address);
        }
        if (this.address !== null && this.address.trim() !== '' && this.address !== undefined) {
            USInvoice.maincontent = USInvoice.maincontent.replace('[[AddressMulti]]', this.address);
            // console.log(this.address);
        } else {
            USInvoice.maincontent = USInvoice.maincontent.replace('[[AddressMulti]]', this.address);
        }

        if (invoiceData.clientcontact2 != null && invoiceData.clientcontact2.trim() !== ''
            && invoiceData.clientcontact2 !== undefined) {
            this.clientContact = this.clientContact + USInvoice.clientcontact2;
        }

        if (this.clientContact !== null && this.clientContact.trim() !== '' && this.clientContact !== undefined) {
            USInvoice.maincontent = USInvoice.maincontent.replace('[[ClientContact]]', this.clientContact);
            // console.log(this.clientContact);
        } else {
            USInvoice.maincontent = USInvoice.maincontent.replace('[[ClientContact]]', this.clientContact);
        }

        USInvoice.maincontent = USInvoice.maincontent.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[InvoiceDate]]', invoiceData.invoice_date);

        USInvoice.maincontent = USInvoice.maincontent.replace('[[InvoiceServiceDetails]]', invoiceData.serviceDetails);

        USInvoice.maincontent = USInvoice.maincontent.replace('[[InvoiceFees]]', invoiceData.invoiceFees);
        USInvoice.maincontent = USInvoice.maincontent.replace('[[Total]]', invoiceData.total);
        USInvoice.maincontent = USInvoice.maincontent.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
            invoiceData.usCurrencySymbol);
        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            USInvoice.maincontent = USInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'inline-block');
            USInvoice.maincontent = USInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsteriskMessage\\]\\]', 'gi'), 'block');
            for (let i = 0; i < invoiceData.Appendix.length; i++) {
                let appendixRow = USInvoice.appendixRow;
                appendixRow = appendixRow.replace('[[DvCode]]', invoiceData.Appendix[i].dvcode);
                appendixRow = appendixRow.replace('[[CactusSpCode]]', invoiceData.Appendix[i].cactusSpCode);
                appendixRow = appendixRow.replace('[[ProjectTitle]]', invoiceData.Appendix[i].title);
                appendixRow = appendixRow.replace('[[POCName]]', invoiceData.Appendix[i].poc);
                appendixRow = appendixRow.replace('[[Amount]]', this.fdShareDataService.styleUSJapan(invoiceData.Appendix[i].amount));
                appendixRow = appendixRow.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                    invoiceData.usCurrencySymbol);
                newArr.push(appendixRow);
            }
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace('[[Appendix]]', newArr.join(''));
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace('[[Total]]', invoiceData.invoiceFees);
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.usCurrencySymbol);
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace('<figure>', '');
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace('</figure>', '');
        } else {
            USInvoice.maincontent = USInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'none');
            USInvoice.maincontent = USInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsteriskMessage\\]\\]', 'gi'), 'none');
            this.showAppendix = false;
        }
        console.log(newArr);

        // const header = document.getElementById('header');
        let headerObj: any = this.headerstyle;
        headerObj = headerObj.replace('[[HeaderContent]]', USInvoice.headerCreate);
        console.log('Header Html', headerObj);

        // const content = document.getElementById('main_content');
        let contentObj: string = this.contentStyle;
        let outerData: string = USInvoice.maincontent;
        const appendix: string = USInvoice.appendixCreate;
        if (!this.showAppendix) {
            outerData = USInvoice.maincontent.replace('[[Appendix]]', '');
            contentObj = contentObj + outerData + '</body></html>';
        } else {
            outerData = USInvoice.maincontent.replace('[[Appendix]]', appendix);
            contentObj = contentObj + outerData + '</body></html>';
            console.log('Main Content Html', contentObj);

        }
        console.log('Main Content Html', contentObj);


        const footer = document.getElementById('footer');
        let footerObj: any = this.footerStyle;
        footerObj = footerObj.replace('[[FooterContent]]', USInvoice.footerCreate);
        console.log('Footer Html', footerObj);

        this.originalInvoice = {};
        this.originalInvoice.Header = headerObj;
        this.originalInvoice.Content = contentObj;
        this.originalInvoice.Footer = footerObj;

        console.log(this.originalInvoice.Content);

        this.address = '';
        this.clientContact = '';

        // Replaced US Invoice Template
        const USObject: any = Object.assign({}, this.USTemplate);
        USObject.header = USObject.header.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        USObject.header = USObject.header.replace('[[InvoiceDate]]', invoiceData.invoice_date);
        USObject.header = USObject.header.replace('[[CurrencyName]]', invoiceData.usCurrencyName);
        USObject.header = USObject.header.replace('[[CurrencySymbol]]', invoiceData.usCurrencySymbol);
        USObject.header = USObject.header.replace('[[Invoice]]', invoiceData.invoice);
        //USObject.serviceDetailHeader = (invoiceData.invoice + ' DETAILS').toUpperCase();
        USObject.contactDetails = USObject.contactDetails.replace('[[Company]]', invoiceData.company);
        USObject.contactDetails = USObject.contactDetails.replace('[[ClientContact1]]', invoiceData.clientcontact1);
        USObject.clientcontact2 = USObject.clientcontact2.replace('[[ClientContact2]]', invoiceData.clientcontact2);
        USObject.contactDetails = USObject.contactDetails.replace('[[Email]]', invoiceData.email);
        USObject.contactDetails = USObject.contactDetails.replace('[[Phone]]', invoiceData.phone);
        USObject.contactDetails = USObject.contactDetails.replace('[[Address1]]', invoiceData.address1);
        USObject.address2 = USObject.address2.replace('[[Address2]]', invoiceData.address2);
        USObject.address3 = USObject.address3.replace('[[Address3]]', invoiceData.address3);
        USObject.address4 = USObject.address4.replace('[[Address4]]', invoiceData.address4);
        USObject.purchaseOrder = USObject.purchaseOrder.replace('[[PurchaseOrderNumber]]', invoiceData.purchaseOrderNumber);
        if (invoiceData.address2 != null && invoiceData.address2.trim() !== '' && invoiceData.address2 !== undefined) {
            this.address = this.address + USObject.address2;
            // console.log(this.address);
        }
        if (invoiceData.address3 != null && invoiceData.address3.trim() !== '' && invoiceData.address3 !== undefined) {
            this.address = this.address + USObject.address3;
            // console.log(this.address);
        }
        if (invoiceData.address4 != null && invoiceData.address4.trim() !== '' && invoiceData.address4 !== undefined) {
            this.address = this.address + USObject.address4;
            // console.log(this.address);
        }
        if (this.address !== null && this.address.trim() !== '' && this.address !== undefined) {
            USObject.contactDetails = USObject.contactDetails.replace('[[AddressMulti]]', this.address);
            // console.log(this.address);
        } else {
            USObject.contactDetails = USObject.contactDetails.replace('[[AddressMulti]]', this.address);
            //console.log(USObject.contactDetails2);
        }

        if (invoiceData.clientcontact2 != null && invoiceData.clientcontact2.trim() !== ''
            && invoiceData.clientcontact2 !== undefined) {
            this.clientContact = this.clientContact + USObject.clientcontact2;
        }

        if (this.clientContact !== null && this.clientContact.trim() !== '' && this.clientContact !== undefined) {
            USObject.contactDetails = USObject.contactDetails.replace('[[ClientContact]]', this.clientContact);
            // console.log(this.clientContact);
        } else {
            USObject.contactDetails = USObject.contactDetails.replace('[[ClientContact]]', this.clientContact);
        }

        USObject.paymentDetails = USObject.paymentDetails.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        USObject.invoiceDetail = USObject.invoiceDetail.replace('[[InvoiceDate]]', invoiceData.invoice_date);

        USObject.invoiceDetail = USObject.invoiceDetail.replace('[[InvoiceServiceDetails]]', invoiceData.serviceDetails);

        USObject.invoiceDetail = USObject.invoiceDetail.replace('[[InvoiceFees]]', invoiceData.invoiceFees);
        USObject.invoiceDetail = USObject.invoiceDetail.replace('[[Total]]', invoiceData.total);
        USObject.invoiceDetail = USObject.invoiceDetail.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
            invoiceData.usCurrencySymbol);
        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            //USObject.invoiceDetail = USObject.invoiceDetail.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'inline-block');
            USObject.appendix = USObject.appendix.replace('[[Appendix]]', newArr.join(''));
            USObject.appendix = USObject.appendix.replace('[[Total]]', invoiceData.invoiceFees);
            USObject.appendix = USObject.appendix.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.usCurrencySymbol);
            delete USObject.appendixCreate;
            delete USObject.appendixRow;
        } else {
            this.showAppendix = false;
            USObject.invoiceDetail = USObject.invoiceDetail.replace('<span>*</span>', '');
            delete USObject.appendix;
            delete USObject.appendixCreate;
            delete USObject.appendixRow;
        }

        this.USHtmlObject = USObject;
        console.log(this.USHtmlObject);

        delete this.USHtmlObject.maincontent;
        delete this.USHtmlObject.headerCreate;
        delete this.USHtmlObject.footerCreate;
        delete this.USHtmlObject.address2;
        delete this.USHtmlObject.address3;
        delete this.USHtmlObject.address4;

        const obj: any = {};
        obj.pdf = this.originalInvoice;
        obj.saveObj = this.USHtmlObject;

        console.log(obj);

        return obj;

    }

    createJapanInvoice(invoiceData) {
        const newArr = [];
        // invoiceData = this.invoicedata;
        const JapanInvoice: any = Object.assign({}, this.JapanTemplate);
        JapanInvoice.headerCreate = JapanInvoice.headerCreate.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        JapanInvoice.headerCreate = JapanInvoice.headerCreate.replace('[[InvoiceDate]]', invoiceData.invoice_date);
        JapanInvoice.headerCreate = JapanInvoice.headerCreate.replace('[[Invoice]]', invoiceData.invoice);
        JapanInvoice.headerCreate = JapanInvoice.headerCreate.replace('[[CurrencyName]]', invoiceData.JpnCurrencyName);
        JapanInvoice.headerCreate = JapanInvoice.headerCreate.replace('[[CurrencySymbol]]', invoiceData.JpnCurrencySymbol);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[Company]]', invoiceData.company);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[ClientContact1]]', invoiceData.clientcontact1);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[PurchaseOrderNumber]]', invoiceData.purchaseOrderNumber);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace(new RegExp('\\[\\[InvoiceDate\\]\\]', 'gi'),
            invoiceData.invoice_date);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[InvoiceServiceDetails]]', invoiceData.serviceDetails);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[InvoiceFees]]', invoiceData.invoiceFees);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[ConsumptionTax]]', invoiceData.tax);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace('[[Total]]', invoiceData.total);
        JapanInvoice.maincontent = JapanInvoice.maincontent.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
            invoiceData.JpnCurrencySymbol);
        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            JapanInvoice.maincontent = JapanInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'inline-block');
            JapanInvoice.maincontent = JapanInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsteriskMessage\\]\\]', 'gi'), 'block');
            for (let i = 0; i < invoiceData.Appendix.length; i++) {
                let appendixRow = JapanInvoice.appendixRow;
                appendixRow = appendixRow.replace('[[ProjectCode]]', invoiceData.Appendix[i].cactusSpCode);
                appendixRow = appendixRow.replace('[[Title]]', invoiceData.Appendix[i].title);
                appendixRow = appendixRow.replace('[[Amount]]', this.fdShareDataService.styleUSJapan(invoiceData.Appendix[i].amount));
                appendixRow = appendixRow.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                    invoiceData.JpnCurrencySymbol);
                newArr.push(appendixRow);
            }
            JapanInvoice.appendixCreate = JapanInvoice.appendixCreate.replace('[[Appendix]]', newArr.join(''));
            JapanInvoice.appendixCreate = JapanInvoice.appendixCreate.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.JpnCurrencySymbol);
            JapanInvoice.appendixCreate = JapanInvoice.appendixCreate.replace('<figure>', '');
            JapanInvoice.appendixCreate = JapanInvoice.appendixCreate.replace('</figure>', '');

        } else {
            this.showAppendix = false;
            JapanInvoice.maincontent = JapanInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'none');
            JapanInvoice.maincontent = JapanInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsteriskMessage\\]\\]', 'gi'), 'none');
        }

        // const header = document.getElementById('header');
        let headerObj: any = this.headerstyle;
        headerObj = headerObj.replace('[[HeaderContent]]', JapanInvoice.headerCreate);
        console.log('Header Html', headerObj);

        // const content = document.getElementById('main_content');
        let contentObj: string = this.contentStyle;
        let outerData: string = JapanInvoice.maincontent;
        const appendix: string = JapanInvoice.appendixCreate;
        if (!this.showAppendix) {
            outerData = JapanInvoice.maincontent.replace('[[Appendix]]', '');
            contentObj = contentObj + outerData + '</body></html>';
        } else {
            outerData = JapanInvoice.maincontent.replace('[[Appendix]]', appendix);
            contentObj = contentObj + outerData + '</body></html>';
            console.log('Main Content Html', contentObj);

        }


        const footer = document.getElementById('footer');
        let footerObj: any = this.footerStyle;
        footerObj = footerObj.replace('[[FooterContent]]', JapanInvoice.footerCreate);
        console.log('Footer Html', footerObj);

        this.originalInvoice = {};
        this.originalInvoice.Header = headerObj;
        this.originalInvoice.Content = contentObj;
        this.originalInvoice.Footer = footerObj;
        // console.log(this.originalInvoice.Header);


        const JapanObject: any = Object.assign({}, this.JapanTemplate);
        // const JapanInvoice: any = Object.assign({}, this.JapanTemplate);
        JapanObject.header = JapanObject.header.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        JapanObject.header = JapanObject.header.replace('[[InvoiceDate]]', invoiceData.invoice_date);
        JapanObject.header = JapanObject.header.replace('[[Invoice]]', invoiceData.invoice);
        JapanObject.header = JapanObject.header.replace('[[CurrencyName]]', invoiceData.JpnCurrencyName);
        JapanObject.header = JapanObject.header.replace('[[CurrencySymbol]]', invoiceData.JpnCurrencySymbol);
        //JapanObject.serviceDetailHeader = (invoiceData.invoice + ' DETAILS').toUpperCase();
        JapanObject.contactDetails = JapanObject.contactDetails.replace('[[Company]]', invoiceData.company);
        JapanObject.contactDetails = JapanObject.contactDetails.replace('[[ClientContact1]]',
            invoiceData.clientcontact1);
        JapanObject.purchaseOrder = JapanObject.purchaseOrder.replace('[[PurchaseOrderNumber]]',
            invoiceData.purchaseOrderNumber);
        JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace(new RegExp('\\[\\[InvoiceDate\\]\\]', 'gi'),
            invoiceData.invoice_date);
        JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace('[[InvoiceServiceDetails]]',
            invoiceData.serviceDetails);
        JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace('[[InvoiceFees]]', invoiceData.invoiceFees);
        JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace('[[ConsumptionTax]]', invoiceData.tax);
        JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace('[[Total]]', invoiceData.total);
        JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
            invoiceData.JpnCurrencySymbol);

        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            //JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'inline-block');
            JapanObject.appendix = JapanObject.appendix.replace('[[Appendix]]', newArr.join(''));
            // JapanObject.appendix = JapanObject.appendix.replace('[[Amount]]', invoiceData.invoiceFees);
            JapanObject.appendix = JapanObject.appendix.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.JpnCurrencySymbol);
            delete JapanObject.appendixCreate;
            delete JapanObject.appendixRow;
        } else {
            this.showAppendix = false;
            JapanObject.invoiceDetail = JapanObject.invoiceDetail.replace('<span>*</span>', '');
            delete JapanObject.appendix;
            delete JapanObject.appendixCreate;
            delete JapanObject.appendixRow;
        }
        this.japanHtmlObject = JapanObject;

        // console.log(JapanObject);
        delete this.japanHtmlObject.maincontent;
        delete this.japanHtmlObject.headerCreate;
        delete this.japanHtmlObject.footerCreate;

        const obj: any = {};
        obj.pdf = this.originalInvoice;
        obj.saveObj = this.japanHtmlObject;

        console.log(obj);
        return obj;
    }

    createIndiaInvoice(invoiceData) {
        this.indAddress = '';
        const newArr = [];
        // invoiceData = this.invoicedata;
        const IndiaInvoice: any = Object.assign({}, this.IndiaTemplate);
        IndiaInvoice.headerCreate = IndiaInvoice.headerCreate.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        IndiaInvoice.headerCreate = IndiaInvoice.headerCreate.replace('[[InvoiceDate]]', invoiceData.invoice_date);
        IndiaInvoice.headerCreate = IndiaInvoice.headerCreate.replace('[[CurrencyName]]', invoiceData.IndCurrencyName);
        IndiaInvoice.headerCreate = IndiaInvoice.headerCreate.replace('[[CurrencySymbol]]', invoiceData.IndCurrencySymbol);

        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[PurchaseOrderNumber]]', invoiceData.purchaseOrderNumber);

        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[Company]]', invoiceData.company);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[ClientContact]]', invoiceData.clientcontact1);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[Address1]]', invoiceData.address1);
        IndiaInvoice.address2 = IndiaInvoice.address2.replace('[[Address2]]', invoiceData.address2);
        IndiaInvoice.address3 = IndiaInvoice.address3.replace('[[Address3]]', invoiceData.address3);
        IndiaInvoice.address4 = IndiaInvoice.address4.replace('[[Address4]]', invoiceData.address4);


        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[Phone]]', invoiceData.phone);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[Designation]]', invoiceData.clientcontact2);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[Email]]', invoiceData.email);

        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace(new RegExp('\\[\\[InvoiceDate\\]\\]', 'gi'),
            invoiceData.invoice_date);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[InvoiceServiceDetails]]', invoiceData.serviceDetails);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
            invoiceData.IndCurrencySymbol);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[InvoiceFees]]', invoiceData.invoiceFees);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[CentralTax]]', invoiceData.tax);
        // IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[StateTax]]', invoiceData.stateTax);
        IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[Total]]', invoiceData.total);

        if (invoiceData.address2 != null && invoiceData.address2.trim() !== ''
            && invoiceData.address2 !== undefined) {
            this.indAddress = this.indAddress + IndiaInvoice.address2;
            console.log(this.indAddress);
        }
        if (invoiceData.address3 != null && invoiceData.address3.trim() !== ''
            && invoiceData.address3 !== undefined) {
            this.indAddress = this.indAddress + IndiaInvoice.address3;
            console.log(this.indAddress);
        }
        if (invoiceData.address4 != null && invoiceData.address4.trim() !== ''
            && invoiceData.address4 !== undefined) {
            this.indAddress = this.indAddress + IndiaInvoice.address4;
            console.log(this.indAddress);
        }

        if (this.indAddress !== null && this.indAddress.trim() !== '' && this.indAddress !== undefined) {
            IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[AddressMulti]]', this.indAddress);
            console.log(this.indAddress);
        } else {
            IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace('[[AddressMulti]]', this.indAddress);
        }
        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'inline-block');
            IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsteriskMessage\\]\\]', 'gi'), 'block');
            for (let i = 0; i < invoiceData.Appendix.length; i++) {
                let appendixRow = IndiaInvoice.appendixRow;
                appendixRow = appendixRow.replace('[[ProjectCode]]', invoiceData.Appendix[i].cactusSpCode);
                appendixRow = appendixRow.replace('[[Title]]', invoiceData.Appendix[i].title);
                appendixRow = appendixRow.replace('[[DVCode]]', invoiceData.Appendix[i].dvcode);
                appendixRow = appendixRow.replace('[[Amount]]', this.fdShareDataService.styleIndia(invoiceData.Appendix[i].amount));
                newArr.push(appendixRow);
            }
            IndiaInvoice.appendixCreate = IndiaInvoice.appendixCreate.replace('[[Appendix]]', newArr.join(''));
            IndiaInvoice.appendixCreate = IndiaInvoice.appendixCreate.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.IndCurrencySymbol);
            IndiaInvoice.appendixCreate = IndiaInvoice.appendixCreate.replace('<figure>', '');
            IndiaInvoice.appendixCreate = IndiaInvoice.appendixCreate.replace('</figure>', '');

        } else {
            this.showAppendix = false;
            IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'none');
            IndiaInvoice.maincontent = IndiaInvoice.maincontent.replace(new RegExp('\\[\\[ShowAsteriskMessage\\]\\]', 'gi'), 'none');
        }

        let headerObj: any = this.headerstyle;
        headerObj = headerObj.replace('[[HeaderContent]]', IndiaInvoice.headerCreate);
        console.log('Header Html', headerObj);

        // const content = document.getElementById('main_content');
        let contentObj: string = this.contentStyle;
        let outerData: string = IndiaInvoice.maincontent;
        const appendix: string = IndiaInvoice.appendixCreate;
        if (!this.showAppendix) {
            outerData = IndiaInvoice.maincontent.replace('[[Appendix]]', '');
            contentObj = contentObj + outerData + '</body></html>';
        } else {
            outerData = IndiaInvoice.maincontent.replace('[[Appendix]]', appendix);
            contentObj = contentObj + outerData + '</body></html>';
            console.log('Main Content Html', contentObj);
        }

        const footer = document.getElementById('footer');
        let footerObj: any = this.footerStyle;
        footerObj = footerObj.replace('[[FooterContent]]', IndiaInvoice.footerCreate);
        console.log('Footer Html', footerObj);

        this.originalInvoice = {};
        this.originalInvoice.Header = headerObj;
        this.originalInvoice.Content = contentObj;
        this.originalInvoice.Footer = footerObj;

        console.log(headerObj);

        this.indAddress = '';
        const IndiaObject: any = Object.assign({}, this.IndiaTemplate);
        IndiaObject.header = IndiaObject.header.replace('[[InvoiceNumber]]', invoiceData.invoice_no);
        IndiaObject.header = IndiaObject.header.replace('[[InvoiceDate]]', invoiceData.invoice_date);
        IndiaObject.header = IndiaObject.header.replace('[[CurrencyName]]', invoiceData.IndCurrencyName);
        IndiaObject.header = IndiaObject.header.replace('[[CurrencySymbol]]', invoiceData.IndCurrencySymbol);
        //IndiaObject.serviceDetailHeader = (invoiceData.invoice + ' DETAILS').toUpperCase();
        IndiaObject.purchaseOrder = IndiaObject.purchaseOrder.replace('[[PurchaseOrderNumber]]',
            invoiceData.purchaseOrderNumber);

        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[Company]]', invoiceData.company);
        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[ClientContact]]',
            invoiceData.clientcontact1);
        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[Address1]]', invoiceData.address1);
        IndiaObject.address2 = IndiaObject.address2.replace('[[Address2]]', invoiceData.address2);
        IndiaObject.address3 = IndiaObject.address3.replace('[[Address3]]', invoiceData.address3);
        IndiaObject.address4 = IndiaObject.address4.replace('[[Address4]]', invoiceData.address4);

        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[Phone]]', invoiceData.phone);
        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[Designation]]',
            invoiceData.clientcontact2);
        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[Email]]', invoiceData.email);

        IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace(new RegExp('\\[\\[InvoiceDate\\]\\]', 'gi'),
            invoiceData.invoice_date);
        IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace('[[InvoiceServiceDetails]]',
            invoiceData.serviceDetails);
        IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
            invoiceData.IndCurrencySymbol);
        IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace('[[InvoiceFees]]', invoiceData.invoiceFees);
        IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace('[[CentralTax]]', invoiceData.tax);
        // IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace('[[StateTax]]', invoiceData.stateTax);
        IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace('[[Total]]', invoiceData.total);

        if (invoiceData.address2 != null && invoiceData.address2.trim() !== ''
            && invoiceData.address2 !== undefined) {
            this.indAddress = this.indAddress + IndiaObject.address2;
            console.log(this.indAddress);
        }
        if (invoiceData.address3 != null && invoiceData.address3.trim() !== ''
            && invoiceData.address3 !== undefined) {
            this.indAddress = this.indAddress + IndiaObject.address3;
            console.log(this.indAddress);
        }
        if (invoiceData.address4 != null && invoiceData.address4.trim() !== ''
            && invoiceData.address4 !== undefined) {
            this.indAddress = this.indAddress + IndiaObject.address4;
            console.log(this.indAddress);
        }

        if (this.indAddress !== null && this.indAddress.trim() !== '' && this.indAddress !== undefined) {
            IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[AddressMulti]]', this.indAddress);
            console.log(this.indAddress);
        } else {
            IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[AddressMulti]]', this.indAddress);
        }

        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            //IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace(new RegExp('\\[\\[ShowAsterisk\\]\\]', 'gi'), 'inline-block');
            IndiaObject.appendix = IndiaObject.appendix.replace('[[Appendix]]', newArr.join(''));
            IndiaObject.appendix = IndiaObject.appendix.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.IndCurrencySymbol);
            delete IndiaObject.appendixCreate;
            delete IndiaObject.appendixRow;
        } else {
            this.showAppendix = false;
            IndiaObject.invoiceDetail = IndiaObject.invoiceDetail.replace('<span>*</span>', '');
            delete IndiaObject.appendix;
            delete IndiaObject.appendixCreate;
            delete IndiaObject.appendixRow;
        }

        this.indiaHtmlObject = IndiaObject;

        delete this.indiaHtmlObject.maincontent;
        delete this.indiaHtmlObject.headerCreate;
        delete this.indiaHtmlObject.footerCreate;
        delete this.indiaHtmlObject.address2;
        delete this.indiaHtmlObject.address3;
        delete this.indiaHtmlObject.address4;

        const obj: any = {};
        obj.pdf = this.originalInvoice;
        obj.saveObj = this.indiaHtmlObject;

        console.log(obj);
        return obj;
    }
    widthDefineModal: boolean;
    getData(data: { htmldata: string; class: string; }) {
        console.log(data);
        this.editor = false;
        const mainUl = document.getElementById(this.elementId);
        const getLi = mainUl.getElementsByTagName('li')[1];
        console.log('data.htmldata ', data.htmldata);
        console.log('data.class ', data.class);
        if (this.elementId === 'appendix') {
            document.getElementById(this.elementId).innerHTML = data.htmldata;
            this.widthDefineModal = true;
            this.extractData(data.htmldata);
            document.getElementById('appendix').parentElement.className = data.class;
        } else if (getLi === null || getLi === undefined) {
            document.getElementById(this.elementId).innerHTML = data.htmldata;
        } else {
            getLi.firstElementChild.innerHTML = data.htmldata;
        }
    }
    appendixEditTbHeader: any = [];
    appendixEditTbbody: any = [];
    appendixTableTh: any = [];
    extractData(table) {
        this.errMsg = '';
        this.appendixEditTbHeader = [];
        this.appendixEditTbbody = [];
        var oDiv = document.createElement('div');
        oDiv.innerHTML = table;
        var oTable = oDiv.querySelector('table');
        this.appendixTableTh = oTable.rows[0].cells;
        const tableHeader = [];
        const tableRowData = [];

        if (oTable.rows[0].cells.length) {
            for (let i = 0; i < oTable.rows[0].cells.length; i++) {
                const element = oTable.rows[0].cells[i].innerText;
                tableHeader.push(element);
            }
        }
        if (oTable.rows[1].cells.length) {
            for (let j = 0; j < oTable.rows[1].cells.length; j++) {
                const element = oTable.rows[1].cells[j].innerText;
                tableRowData.push({ element, width: '' });
            }
        }
        this.appendixEditTbHeader = tableHeader;
        this.appendixEditTbbody = tableRowData;
    }
    errMsg: string;
    definedColWidth: number = 0;
    setWidth(type: string) {
        this.errMsg = '';
        let sum = 0;
        this.appendixEditTbbody.forEach((ele) => {
            if (!ele.width) {
                this.errMsg = "Please define width of APPENDIX table coulumn equal to 100";
                return;
            }
            if (ele.width.includes('%')) {
                let newVal = ele.width.slice('%', -1);
                ele.width = newVal;
            }
            sum += parseInt(ele.width);
            if (sum !== 100) {
                this.errMsg = "Please define width of APPENDIX table coulumn equal to 100";
                return;
            }
        });
        if (sum === 100) {
            const th = document.getElementById(this.elementId).querySelector('table').querySelectorAll('th');
            this.appendixEditTbbody.forEach((ele, i) => {
                th[i].style.width = ele.width + '%';
                if (sum === 100) {
                    this.errMsg = '';
                    if (type === "close") {
                        this.widthDefineModal = false;
                        this.definedColWidth = 0;
                    }
                }
            });
        }
    }

    enterValue(e) {
        let charCode = (e.which) ? e.which : e.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            this.errMsg = 'Please enter only integer numbers.';
            return false;
        }
        this.errMsg = '';
        return true;
    }

    getVal() {
        this.definedColWidth = 0;
        this.appendixEditTbbody.forEach((ele) => {
            if (ele.width.includes('%')) {
                let newVal = ele.width.slice('%', -1);
                ele.width = newVal;
            }
            if (parseInt(ele.width)) {
                this.definedColWidth += parseInt(ele.width);
            }
        });

    }

    cancel() {
        const th = document.getElementById(this.elementId).querySelector('table').querySelectorAll('th');
        this.appendixEditTbbody.forEach((ele, i) => {
            th[i].style.width = 0 + '%';
        });
        this.definedColWidth = 0;
        this.widthDefineModal = false;
    }

    disableButton() {
        const items: any = document.querySelectorAll('.invButton');
        let i = 0;
        const l = items.length;

        for (i; i < l; i++) {
            items[i].style.display = 'none';
        }
    }
    enableButton() {
        setTimeout(() => {
            const items: any = document.querySelectorAll('.invButton');
            let i = 0;
            const l = items.length;

            for (i; i < l; i++) {
                items[i].style.display = 'inline-block';
            }
        }, 1000);
    }

    setColumnClass(sClassName) {
        setTimeout(() => {
            const appendix: any = document.querySelector('#appendix').parentElement;
            appendix.className = sClassName;
        }, 1000);
    }

    remove_last_occurrence(str, searchstr) {
        var index = str.lastIndexOf(searchstr);
        if (index === -1) {
            return str;
        }
        return str.slice(0, index) + str.slice(index + searchstr.length);
    }


    confirm() {
        this.disableButton();
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;

        const header = document.getElementById('header');
        let headerObj: any = this.headerstyle;
        headerObj = headerObj.replace('[[HeaderContent]]', header.outerHTML);
        // console.log('Header Html', headerObj);

        const content = document.getElementById('main_content');
        let contentObj: string = this.contentStyle;
        const outerData: string = content.outerHTML;
        contentObj = contentObj + outerData + '</body></html>';
        // console.log('Main Content Html', contentObj);

        const figureContent1 = 'id="appendix"><figure class="table">';
        const figureContent2 = 'id="appendix"><figure>';
        const figureContent = 'id="appendix">';
        if (contentObj.indexOf(figureContent1) > -1 || contentObj.indexOf(figureContent2) > -1) {
            if (contentObj.indexOf(figureContent1) > -1) {
                contentObj = contentObj.replace(figureContent1, figureContent);
            }
            else {
                contentObj = contentObj.replace(figureContent2, figureContent);
            }

            contentObj = this.remove_last_occurrence(contentObj, '</figure>');
        }

        const footer = document.getElementById('footer');
        let footerObj: any = this.footerStyle;
        footerObj = footerObj.replace('[[FooterContent]]', footer.outerHTML);
        // console.log('Footer Html', footerObj);

        this.modifiedInvoice = {};

        this.modifiedInvoice.Header = headerObj;
        this.modifiedInvoice.Content = contentObj;
        this.modifiedInvoice.Footer = footerObj;

        console.log(this.modifiedInvoice);

        const obj: any = {};
        obj.pdf = this.modifiedInvoice;
        if (Object.keys(this.USTemplateCopy).length > 0) {
            this.USHtmlObject.header = document.getElementById('header').innerHTML;
            this.USHtmlObject.footer = document.getElementById('footer').innerHTML;
            this.USHtmlObject.contactDetails = document.getElementById('contact_details').innerHTML;
            this.USHtmlObject.purchaseOrder = document.getElementById('purchaseOrderDetails').innerHTML;
            this.USHtmlObject.invoiceDetail = document.getElementById('invoiceDetails').innerHTML;
            this.USHtmlObject.paymentInstructions = document.getElementById('paymentInstructions').innerHTML;
            this.USHtmlObject.paymentDetails = document.getElementById('paymentDetails').innerHTML;
            //this.USHtmlObject.serviceDetailHeader = document.getElementById('serviceDetailHeader').innerHTML;
            if (this.showAppendix) {
                this.USHtmlObject.appendix = document.getElementById('appendix').innerHTML;
            }
            obj.saveObj = this.USHtmlObject;
        } else if (Object.keys(this.JapanTemplateCopy).length > 0) {
            this.japanHtmlObject.header = document.getElementById('header').innerHTML;
            this.japanHtmlObject.footer = document.getElementById('footer').innerHTML;
            this.japanHtmlObject.contactDetails = document.getElementById('contact_details').innerHTML;
            this.japanHtmlObject.purchaseOrder = document.getElementById('purchaseOrderDetails').innerHTML;
            this.japanHtmlObject.invoiceDetail = document.getElementById('invoiceDetails').innerHTML;
            this.japanHtmlObject.paymentInstructions = document.getElementById('paymentInstructions1').innerHTML;
            this.japanHtmlObject.paymentDetails = document.getElementById('paymentInstructions2').innerHTML;
            //this.japanHtmlObject.serviceDetailHeader = document.getElementById('serviceDetailHeader').innerHTML;
            if (this.showAppendix) {
                this.japanHtmlObject.appendix = document.getElementById('appendix').innerHTML;
            }
            obj.saveObj = this.japanHtmlObject;
        } else if (Object.keys(this.IndiaTemplateCopy).length > 0) {
            this.indiaHtmlObject.header = document.getElementById('header').innerHTML;
            this.indiaHtmlObject.footer = document.getElementById('footer').innerHTML;
            this.indiaHtmlObject.contactDetails1 = document.getElementById('contact_details').innerHTML;
            // this.indiaHtmlObject.contactDetails2 = document.getElementById('contactDetails2').innerHTML;
            // this.indiaHtmlObject.address = document.getElementById('address').innerHTML;
            this.indiaHtmlObject.purchaseOrder = document.getElementById('purchaseOrderDetails').innerHTML;
            this.indiaHtmlObject.invoiceDetail = document.getElementById('invoiceDetails').innerHTML;
            this.indiaHtmlObject.paymentInstructions = document.getElementById('paymentInstructions').innerHTML;
            this.indiaHtmlObject.paymentDetails = document.getElementById('paymentInstructions2').innerHTML;
            //this.indiaHtmlObject.serviceDetailHeader = document.getElementById('serviceDetailHeader').innerHTML;
            if (this.showAppendix) {
                this.indiaHtmlObject.appendix = document.getElementById('appendix').innerHTML;
            }
            obj.saveObj = this.indiaHtmlObject;
        }

        console.log(obj);

        setTimeout(async () => {
            await this.fdShareDataService.callProformaInvoiceEdit(obj);
            this.displayJapan = false;
            this.displayUS = false;
            this.displayIndia = false;
            this.messageService.add({ key: 'editToast', severity: 'success', summary: 'Success message', detail: this.fdConstantsService.fdComponent.selectedEditObject.Type + ' edited successfully.', life: 2000 });
        }, 300);
    }

    async createUSProforma() {

        const objReturn: any = this.createUSInvoice(this.invoicedata);
        const pdfContent: any = objReturn.pdf;
        pdfContent.Code = "TestingOnQAUS";
        pdfContent.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
        pdfContent.ID = '';
        pdfContent.Type = 'Proforma';
        pdfContent.ListName = 'AAA01';
        pdfContent.HtmlContent = JSON.stringify(objReturn);
        this.fdConstantsService.fdComponent.selectedEditObject.Code = "TestingOnQAUS";
        this.fdConstantsService.fdComponent.selectedEditObject.ListName = "AAA01";
        this.fdConstantsService.fdComponent.selectedEditObject.Type = "Proforma";
        ///// Call service 
        const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
        await this.spOperationsServices.executeJS(pdfService, pdfContent);
    }

    async createJapanProforma() {

        const objReturn: any = this.createJapanInvoice(this.invoicedata);
        const pdfContent: any = objReturn.pdf;
        pdfContent.Code = "TestingOnQAJapan";
        pdfContent.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
        pdfContent.ID = '';
        pdfContent.Type = 'Proforma';
        pdfContent.ListName = 'AAA01';
        pdfContent.HtmlContent = JSON.stringify(objReturn);
        this.fdConstantsService.fdComponent.selectedEditObject.Code = "TestingOnQAJapan";
        this.fdConstantsService.fdComponent.selectedEditObject.ListName = "AAA01";
        this.fdConstantsService.fdComponent.selectedEditObject.Type = "Proforma";
        ///// Call service 
        const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
        await this.spOperationsServices.executeJS(pdfService, pdfContent);
    }

    async createIndiaProforma() {
        const objReturn: any = this.createIndiaInvoice(this.invoicedata);
        const pdfContent: any = objReturn.pdf;
        pdfContent.Code = "TestingOnQAIndia";
        pdfContent.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
        pdfContent.ID = '';
        pdfContent.Type = 'Proforma';
        pdfContent.ListName = 'AAA01';
        pdfContent.HtmlContent = JSON.stringify(objReturn);
        this.fdConstantsService.fdComponent.selectedEditObject.Code = "TestingOnQAIndia";
        this.fdConstantsService.fdComponent.selectedEditObject.ListName = "AAA01";
        this.fdConstantsService.fdComponent.selectedEditObject.Type = "Proforma";
        ///// Call service 
        const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
        await this.spOperationsServices.executeJS(pdfService, pdfContent);
    }


    async generateExistingProforma() {
        await this.projectInfo();
        await this.cleInfo();
        this.poInfo();
        this.projectContacts();
        const id = "2393";
        const batchContents = new Array();
        const batchGuid = this.spOperationsServices.generateUUID();
        let invoicesQuery = this.spOperationsServices.getReadURL('' + this.constantsService.listNames.Proforma.name + '', this.fdConstantsService.fdComponent.proformaForUser);
        invoicesQuery = invoicesQuery.replace('{{ItemID}}', id);
        let endPoints = [invoicesQuery];
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spOperationsServices.getBatchBodyGet(batchContents, batchGuid, element);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        const res = await this.spOperationsServices.getFDData(batchGuid, userBatchBody); //.subscribe(res => {
        //console.log('REs in Confirmed Invoice ', res);
        arrResults = res;
        if (arrResults.length) {
            const prf = arrResults[0][0];
            console.log(prf);
            await this.getILIByPID(id);
            console.log(this.iliByPidRes);

            const projectAppendix = await this.createProjectAppendix(this.iliByPidRes);
            await this.fdShareDataService.callProformaCreation(prf, this.cleData, this.projectContactsData, this.purchaseOrdersList, this, projectAppendix);

        }
    }


    // Purchase Order Number
    purchaseOrdersList: any = [];
    poInfo() {
        this.subscription.add(this.fdShareDataService.defaultPoData.subscribe((res) => {
            if (res) {
                this.purchaseOrdersList = res;
                console.log('PO Data ', this.purchaseOrdersList);
            }
        }))
    }

    // Project COntacts
    projectContactsData: any = [];
    projectContacts() {
        this.subscription.add(this.fdShareDataService.defaultPCData.subscribe((res) => {
            if (res) {
                this.projectContactsData = res;
                console.log('this.projectContactsData ', this.projectContactsData);
                // this.getPCForSentToAMForApproval();
            }
        }))
    }

    // Client Legal Entity
    cleData: any = [];
    async cleInfo() {

        await this.fdShareDataService.getClePO('confirm');

        this.cleData = [];
        this.subscription.add(this.fdShareDataService.defaultCLEData.subscribe((res) => {
            if (res) {
                this.cleData = res;
                console.log('CLE Data ', this.cleData);
            }
        }))
    }

    // Generate Invoice Data start
    iliByPidRes: any = [];

    async getILIByPID(id) {

        const batchContents = new Array();
        const batchGuid = this.spOperationsServices.generateUUID();
        let invoicesQuery = '';
        let obj = Object.assign({}, this.fdConstantsService.fdComponent.invoiceLineItem);
        obj.filter = obj.filter.replace("{{ProformaLookup}}", id);
        invoicesQuery = this.spOperationsServices.getReadURL('' + this.constantsService.listNames.InvoiceLineItems.name + '', obj);
        // this.spServices.getBatchBodyGet(batchContents, batchGuid, invoicesQuery);

        let endPoints = [invoicesQuery];
        let userBatchBody = '';
        for (let i = 0; i < endPoints.length; i++) {
            const element = endPoints[i];
            this.spOperationsServices.getBatchBodyGet(batchContents, batchGuid, element);
        }
        batchContents.push('--batch_' + batchGuid + '--');
        userBatchBody = batchContents.join('\r\n');
        let arrResults: any = [];
        const res = await this.spOperationsServices.getFDData(batchGuid, userBatchBody);// .subscribe(res => {
        arrResults = res;
        if (arrResults.length) {
            console.log(arrResults[0]);
            this.iliByPidRes = arrResults[0] ? arrResults[0] : [];
        }

    }

    // Project Info 
    projectInfoData: any = [];
    async projectInfo() {
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        // Check PI list
        await this.fdShareDataService.checkProjectsAvailable();

        this.subscription.add(this.fdShareDataService.defaultPIData.subscribe((res) => {
            if (res) {
                this.projectInfoData = res;
                console.log('PI Data ', this.projectInfoData);
            }
        }))
    }

    async createProjectAppendix(selectedProjects) {

        const projectAppendix = [];
        let retProjects = [];
        let projects = [];
        const projectProcessed = [];
        const callProjects = [];
        selectedProjects.forEach(element => {
            if (projectProcessed.indexOf(element.Title) === -1) {
                const project = this.projectInfoData.find(e => e.ProjectCode === element.Title);
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
                getPIData.url = this.spOperationsServices.getReadURL(this.constantsService.listNames.ProjectInformation.name, this.fdConstantsService.fdComponent.projectInfoCode);
                getPIData.url = getPIData.url.replace("{{ProjectCode}}", element);
                getPIData.listName = this.constantsService.listNames.ProjectInformation.name;
                getPIData.type = "GET";
                batchURL.push(getPIData);

            });

            retProjects = await this.spOperationsServices.executeBatch(batchURL);
            const mappedProjects = retProjects.map(obj => obj.retItems.length ? obj.retItems[0] : []);
            projects = [...projects, ...mappedProjects];
        }
        const appendixObj = { dvcode: '', cactusSpCode: '', title: '', amount: '' };
        selectedProjects.forEach(element => {
            const project = projects.find(e => e.ProjectCode === element.Title);
            let appendix = Object.assign({}, appendixObj);
            if (project) {
                appendix.dvcode = project.WBJID ? project.WBJID : '';
                appendix.cactusSpCode = project.ProjectCode ? project.ProjectCode : '';
                appendix.title = project.Title ? project.Title : '';
            }
            appendix.amount = element.Amount;
            projectAppendix.push(appendix);
        });

        return projectAppendix;
    }
}

