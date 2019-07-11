import { Component, OnInit, ViewChild } from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { CommonService } from '../services/common.service';
import { FdConstantsService } from '../../fdServices/fd-constants.service';
import { FDDataShareService } from '../../fdServices/fd-shareData.service';
import { MessageService } from 'primeng/api';
import { GlobalService } from 'src/app/Services/global.service';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';


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
    constructor(
        private common: CommonService,
        private fdConstantsService: FdConstantsService,
        private fdShareDataService: FDDataShareService,
        private messageService: MessageService,
        private globalObject: GlobalService,
        private spOperationsServices: SpOperationsService
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
            Appendix: [{ dvcode: '150833', cactusSpCode: 'ASZ01-MSS-193242', title: 'MOFFITT Resubmission 2', amount: '4,125.00' },
            { dvcode: '150833', cactusSpCode: 'ASZ01-MSS-193242', title: 'MOFFITT Resubmission 2', amount: '4,125.00' },
            { dvcode: '150833', cactusSpCode: 'ASZ01-MSS-193242', title: 'MOFFITT Resubmission 2', amount: '4,125.00' }],
            tax: '39,564.45',
            // centralTax : '39,564.45',
            // stateTax : '19,782.22',
            // consumptionTax : '43,200.00',
            serviceDetails: 'April',
            invoiceFees: '30,687.50',
            total: '30,687.50'
        };

        this.USTemplate = {
            headerCreate: `<header id=header>
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
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EWR1GHbosaFDvGM_F_SztpwBdGEOEaYmMAnQ38DJfzQAvA">
          </span>
        </td>
        </tr>
            </tbody>
        </table>
        </div>
        </header>`,
            footerCreate: ` <footer id="footer">
        <div>
            <table style="margin-top:10px;">
                <tr>
                    <td style="font-size: 14px;text-align: center;">
                        This is a computer generated proforma and does not require any signature
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
            maincontent: `    <div id="main_content">
        <div style='height:1300px;'>
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
                <table>
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
                </table>
                <table style="width:44%;">
                <tbody>
                <tr>
                    <td>
                        <p><strong>Address : </strong>[[Address1]]</p>
                        [[AddressMulti]]
                    </td>
                </tr>
                </tbody>
                </table>
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
        </tbody>
            </table>
            <p style="font-size: 15px;font-weight: 600;">* Please refer to Appendix 1 for additional details</p>
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
                    <li>Please make your payment within 75 days of receiving this proforma. For any questions
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
                        Recipient Address: 2 Neshaminy Interplex, Suite 100, Trevose, PA 19053<br />
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
                        Amount
                    </th>
                </tr>
            </thead>
            <tbody>
                [[Appendix]]
                <tr>
                    <td colspan="3">
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
               src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EWR1GHbosaFDvGM_F_SztpwBdGEOEaYmMAnQ38DJfzQAvA">
          </span>
      </td>
      </tr>
            </tbody>
        </table>
    </div>`,
            footer: `<div>
        <table style="margin-top:10px;">
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
            contactDetails: `<tbody>
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
        </tbody>`,
            contactDetails2: `<tbody>
        <tr>
            <td>
                <p><strong>Address : </strong>[[Address1]]</p>
                [[AddressMulti]]
            </td>
        </tr>
        </tbody>`,
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
        <li>Please make your payment within 75 days of receiving this proforma. For any questions
            regarding your
            account<br />
            contact <a href="#">payments@cactusglobal.com</a></li>
        </ul>`,
            paymentDetails: `<ul>
            <li>
                <strong>Payment by bank transfer:</strong><br />
                Bank name: Citibank NA, 785 Fifth Avenue, New York, NY 10022<br />
                Account #: 9943387205<br />
                Account name: Cactus Communications Inc.<br />
                ABA/Routing #: 021 0000 89<br />
                Purpose: Payment for Invoice – [[InvoiceNumber]]<br />
                Recipient Address: 2 Neshaminy Interplex, Suite 100, Trevose, PA 19053<br />
                Recipient Phone: 267-332-0051
            </li>
        </ul>`,
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
                        Amount
                    </th>
                </tr>
            </thead>
            <tbody>
                [[Appendix]]
                <tr>
                    <td colspan="3">
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
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EWR1GHbosaFDvGM_F_SztpwBdGEOEaYmMAnQ38DJfzQAvA">
          </span>
        </td>
        </tr>
        </tbody>
        </table>
        </div>
        </header>`,
            footerCreate: `<footer id="footer">
        <div>
        <table style="margin-top:10px;">
            <tr>
                <td style="font-size: 14px;text-align: center;">
                    This is a computer generated proforma and does not require any signature
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
        <div style="height:1300px;">
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
                        Proforma DETAIL
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
                <p>[[CurrencySymbol]] [[InvoiceFees]]<span>*</span></p>
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
                <p style="font-size: 15px;font-weight: 600;">* Please refer to Appendix 1 for additional details</p>
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
                    <label>振込先銀行：三菱UFJ銀行 品川駅前支店(店番588) 普通預金 2406331<br/>
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
        <div id="appendix" class="col3">
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
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EWR1GHbosaFDvGM_F_SztpwBdGEOEaYmMAnQ38DJfzQAvA">
          </span>
        </td>
        </tr>
        </tbody>
        </table>
        </div>`,
            footer: `<div>
      <table style="margin-top:10px;">
          <tr>
              <td style="font-size: 14px;text-align: center;">
                  This is a computer generated proforma and does not require any signature
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
        <label>振込先銀行：三菱UFJ銀行 品川駅前支店(店番588) 普通預金 2406331<br/>
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
                    body .ui-widget {font-family: Verdana !important;}
                    body .ui-widget-content p {font-size: 16px;}
                    body p {margin:0;line-height:1.5;}
                    table{border-collapse: collapse;background: #fff; width:100%; margin: 0px;}
                    .logo-img{width: auto; margin: auto;margin-bottom: 20px;}
                    .header-left{width: 50%;padding-left: 40px;font-size: 15px;line-height: 2;font-weight: 500;margin: 0;text-align: left;}
                    .header-left label{font-size: 26px; font-weight: 500}
                    .header-right{width:10%; text-align:right; display:table-cell;}
                    .header-right-label {margin-right: 40px;float: right;}
                    .header-right p, .header-right-label p{font-weight: bold;}
                    .header-center {font-size: 22px;font-weight: 500;}
                    header div table tbody tr{background: #c5d3e5}
                    #header label {text-transform: uppercase;}
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
                body {font-size: 16px; color: #333;background-color: #fff;font-family: Verdana !important;}
                body .ui-widget {font-family: Verdana !important;}
                body .ui-widget-content p {font-size: 16px;}
                body p {margin:0;line-height:1.5;}
                table{border-collapse: collapse;background: #fff; width:100%; margin: 0px;}
                .footer-table{background: #c5d3e5;text-align: center;font-size: 15px;line-height: 24px;}
                .footer-table a{text-decoration: none;color: blue;}
                footer table:first-child{margin-top:10px}
                footer table:first-child tr td{font-size: 14px;text-align: center;}
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
                    body {font-size: 16px; color: #333;background-color: #fff;font-family: Verdana !important;}
                    table{border-collapse: collapse;background: #fff; width:100%; margin: 0px;}
                    body p {margin:0;line-height:1.5;}
                    .table-heading{width: 100%;  text-align: center;font-weight: bold;background: #d8d8d8; font-size: 16px;
                    color: #000; padding: 10px;}
                    .contact_details_japan{height:60px;}
                    .contact_details p,.contact_details_japan p{padding-top: 3px;padding-bottom: 3px;}
                    .contact_details-table table:first-child{width: 47%;float: left;margin-bottom: 20px;}
                    .contact_details-table table:nth-child(2){float: right;text-align: left;width: 44%;display: grid}
                    .contact_details-table figure:nth-child(3) table{width: 100%;}
                    .referenceDetail figure,.appendix figure,.contact_details-table figure,figure{display: contents;}
                    .contact_details-table table:first-child p{margin: 0;line-height: 24px;font-size: 16px;}
                    .contact_details-table table:first-child tr td{margin: 0;line-height: 24px;font-size: 16px;
                    border: none !important;
                    padding: 5px;}
                    p span{display: inline-flex;}
                    .contact-detail-table-left {width: 50%;float: left;margin-bottom: 20px;}
                    .contact-detail-table-left p,
                    .contact-detail-table-right p {margin: 0;line-height: 24px;font-size: 15px;}
                    .contact-detail-table-right {float: right;text-align: left;width: 50%;}
                    .purchaseOrder p{height:25px;font-size: 16px;}
                    .referenceDetail {height: 50px; font-size: 16px;}
                    .referenceDetail table {width: 94%;}
                    .contact-detail-table{padding-left: 30px;}
                    .contact-detail-table p{margin: 0;line-height: 24px;font-size: 16px;}
                    ul{line-height: 26px;padding-left:20px;list-style: unset;}
                    .paymentDetails,.column-flex{display: inline-flex;}
                    .paymentDetails ul{padding-left: 10px;}
                    .invoice-table{border-collapse: collapse;width: 100%;}
                    .invoice-table table {width: 100%};
                    .invoice-table td{border:1px solid #000;padding: 0}
                    .invoice-table th{border:1px solid #000;padding: 0}
                    .invoice-table table thead tr{text-align: center; font-size: 16px; font-weight: bold;}
                    .invoice-table table thead tr th{padding: 10px 12px; text-align: center}
                    .invoice-table table tbody tr td{text-align: left;font-size: 16px;padding: 16px 10px;border:1px solid #000;}
                    .invoice-table table tfoot tr td{text-align: center;font-size: 16px;padding: 16px 10px;font-weight: bold;}
                    .invoice-table table tbody tr:last-child td:last-child{font-weight: bold;}
                    .invoice-table table tbody tr td:last-child{font-weight: bold;width: 14%;text-align: right;}
                    .invoice-table table tbody tr td:first-child{text-align: left;width: 14%;}
                    .appendix table tbody tr:last-child td{font-weight: normal;}
                    .appendix table tbody tr td:last-child{font-weight: bold;}
                    .signature-table{float: right;text-align: right;margin-right: 10px;
                    background-image: url(https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EZNP0M5U1nFCgVaguRgo4S0B3-L67nYrXIgtxcYoJEba9w);
                    background-repeat: no-repeat;background-position: right;}
                    .signature-table p{margin:0;line-height: 24px;}
                    .paymentInstructions label {font-size: 16px;font-weight: bold;display: table;margin-top: 20px;}
                    .col3 table tr:first-child td:first-child{width:10%;}
                    .col3 table tr:first-child td:nth-child(2){width:34%;}
                    .col4 table tr:first-child td:first-child{width:16%;}
                    .col10 figure table tr:first-child td{font-weight: bold;}
                    .col10 figure table tr:first-child td:first-child{width:5%;}
                    .col10 figure table tr:first-child td:nth-child(2){width:13%;}
                    .col10 figure table tr:first-child td:nth-child(3){width:8%;}
                    .col10 figure table tr:first-child td:nth-child(4){width:10%;}
                    .col10 figure table tr:first-child td:nth-child(5){width:12%;}
                    .col10 figure table tr:first-child td:nth-child(6){width:10%;}
                    .col10 figure table tr:first-child td:nth-child(7){width:9%;}
                    .col10 figure table tr:first-child td:nth-child(8){width:11%;}
                    .col10 figure table tr:first-child td:nth-child(9){width:9%;}
                    .col10 figure table tr:first-child td:nth-child(10){width:13%;}
                    .proformaDetail table tbody tr td{text-align: left;padding: 16px 10px;}
                    .proformaDetail table tbody tr:last-child td:nth-child(2){text-align: center; font-weight: bold;}
                    .indiaPurchase td:first-child p strong {
                        width: 235px;
                        display: inline-block;
                    }
                    #contact_details table tbody tr td p strong, #contact_details p strong {
                    display:inline-block;
                    width: 150px;
                    }
                    #contact_details table tbody tr td p + p {
                    padding-left: 150px;
                    }
                    .indContact #contact_details table:first-child tbody tr td p strong,
                    .indContact #contact_details table:last-child tbody tr td p strong {
                    width: 160px;
                    }
                    .indContact #contact_details table:nth-child(2) tbody tr td p strong {
                    width: 125px;
                    }
                    .indContact #contact_details table:nth-child(2) tbody tr td a {
                    margin-left: -5px;
                    }
                    .indContact #contact_details table:last-child#address {
                    margin-left: 5px;
                    }
                    .indContact #contact_details table:last-child tbody tr td p + p {
                    padding-left: 160px;
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
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EWR1GHbosaFDvGM_F_SztpwBdGEOEaYmMAnQ38DJfzQAvA">
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
      <table style="margin-top:10px;">
          <tr>
              <td style="font-size: 14px;text-align: center;">
                  This is a computer generated proforma and does not require any stamp or signature
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
                <p>510 Shalimar Morya Park, Off Link Road, Andheri (W), Mumbai 400053, India </p>
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
        <div style="height:1300px;">
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
                <table id="contactDetails1" style="width:54%;">
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
            </table>
            <table id="contactDetails2" style="width:40%;">
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
            </table>
            <table id="address">
            <tbody>
            <tr>
            <td>
                <p><strong>Address : </strong>[[Address1]]</p>[[AddressMulti]]
            </td>
            </tr>
            </tbody>
            </table>
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
                    Proforma DETAIL
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
                <p style="font-size: 15px;font-weight: 600;">* Please refer to Appendix 1 for additional details</p>
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
                            <p>Beneficiary Address : 510 Shalimar Morya Park, Off Link Road, Andheri (W), Mumbai 400053, India</p>
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
            <div id="appendix">
            <table>
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
        </table>
            </div>
        </div>`,
            header: `<div id=header>
        <table cellpadding="15" cellspacing="0">
            <tbody>
                <tr style="background: #c5d3e5;">
        <td class="header-left indHeader">
        <span>
              <img style="margin-bottom: 20px;" class="logo-img"
              src="https://cactusglobal.sharepoint.com/:i:/s/medcomcdn/EWR1GHbosaFDvGM_F_SztpwBdGEOEaYmMAnQ38DJfzQAvA">
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
      <table style="margin-top:10px;">
          <tr>
              <td style="font-size: 14px;text-align: center;">
                  This is a computer generated proforma and does not require any stamp or signature
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
                <p>510 Shalimar Morya Park, Off Link Road, Andheri (W), Mumbai 400053, India </p>
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
            contactDetails1: `<tbody>
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
        </tbody>`,
            address2: `<p>[[Address2]]</p>`,
            address3: `<p>[[Address3]],</p>`,
            address4: `<p>[[Address4]]</p>`,
            contactDetails2: `<tbody>
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
        </tbody>`,
            address: `<tbody>
        <tr>
        <td>
            <p><strong>Address : </strong>[[Address1]]</p>[[AddressMulti]]
        </td>
        </tr>
        </tbody>`,
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
            paymentDetails: `<ul>
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
                <p>Beneficiary Address : 510 Shalimar Morya Park, Off Link Road, Andheri (W), Mumbai 400053, India</p>
                <p>Recipient Phone : +91 22 67148888 </p>
            </li>
        </ul>`,
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
        this.displayUS = true;
        this.USTemplateCopy = this.USHtmlObject;
    }

    showDialog1() {
        this.displayJapan = true;
        this.JapanTemplateCopy = this.japanHtmlObject;
    }

    showDialog2() {
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
            for (let i = 0; i < invoiceData.Appendix.length; i++) {
                USInvoice.appendixRow = USInvoice.appendixRow.replace('[[DvCode]]', invoiceData.Appendix[i].dvcode);
                USInvoice.appendixRow = USInvoice.appendixRow.replace('[[CactusSpCode]]', invoiceData.Appendix[i].cactusSpCode);
                USInvoice.appendixRow = USInvoice.appendixRow.replace('[[ProjectTitle]]', invoiceData.Appendix[i].title);
                USInvoice.appendixRow = USInvoice.appendixRow.replace('[[Amount]]', invoiceData.Appendix[i].amount);
                USInvoice.appendixRow = USInvoice.appendixRow.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                    invoiceData.usCurrencySymbol);
                newArr.push(USInvoice.appendixRow);
            }
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace('[[Appendix]]', newArr.join(''));
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace('[[Total]]', invoiceData.Appendix[0].amount);
            USInvoice.appendixCreate = USInvoice.appendixCreate.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.usCurrencySymbol);
        } else {
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
        USObject.contactDetails = USObject.contactDetails.replace('[[Company]]', invoiceData.company);
        USObject.contactDetails = USObject.contactDetails.replace('[[ClientContact1]]', invoiceData.clientcontact1);
        USObject.clientcontact2 = USObject.clientcontact2.replace('[[ClientContact2]]', invoiceData.clientcontact2);
        USObject.contactDetails = USObject.contactDetails.replace('[[Email]]', invoiceData.email);
        USObject.contactDetails = USObject.contactDetails.replace('[[Phone]]', invoiceData.phone);
        USObject.contactDetails2 = USObject.contactDetails2.replace('[[Address1]]', invoiceData.address1);
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
            USObject.contactDetails2 = USObject.contactDetails2.replace('[[AddressMulti]]', this.address);
            // console.log(this.address);
        } else {
            USObject.contactDetails2 = USObject.contactDetails2.replace('[[AddressMulti]]', this.address);
            console.log(USObject.contactDetails2);
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
            USObject.appendix = USObject.appendix.replace('[[Appendix]]', newArr.join(''));
            USObject.appendix = USObject.appendix.replace('[[Total]]', invoiceData.Appendix[0].amount);
            USObject.appendix = USObject.appendix.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.usCurrencySymbol);
            delete USObject.appendixCreate;
            delete USObject.appendixRow;
        } else {
            this.showAppendix = false;
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
            for (let i = 0; i < invoiceData.Appendix.length; i++) {
                JapanInvoice.appendixRow = JapanInvoice.appendixRow.replace('[[ProjectCode]]', invoiceData.Appendix[i].cactusSpCode);
                JapanInvoice.appendixRow = JapanInvoice.appendixRow.replace('[[Title]]', invoiceData.Appendix[i].title);
                JapanInvoice.appendixRow = JapanInvoice.appendixRow.replace('[[Amount]]', invoiceData.Appendix[i].amount);
                JapanInvoice.appendixRow = JapanInvoice.appendixRow.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                    invoiceData.JpnCurrencySymbol);
                newArr.push(JapanInvoice.appendixRow);
            }
            JapanInvoice.appendixCreate = JapanInvoice.appendixCreate.replace('[[Appendix]]', newArr.join(''));
            JapanInvoice.appendixCreate = JapanInvoice.appendixCreate.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.JpnCurrencySymbol);
        } else {
            this.showAppendix = false;
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
            JapanObject.appendix = JapanObject.appendix.replace('[[Appendix]]', newArr.join(''));
            JapanObject.appendix = JapanObject.appendix.replace('[[Amount]]', invoiceData.Appendix[0].amount);
            JapanObject.appendix = JapanObject.appendix.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.JpnCurrencySymbol);
            delete JapanObject.appendixCreate;
            delete JapanObject.appendixRow;
        } else {
            this.showAppendix = false;
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
            for (let i = 0; i < invoiceData.Appendix.length; i++) {
                IndiaInvoice.appendixRow = IndiaInvoice.appendixRow.replace('[[ProjectCode]]', invoiceData.Appendix[i].cactusSpCode);
                IndiaInvoice.appendixRow = IndiaInvoice.appendixRow.replace('[[Title]]', invoiceData.Appendix[i].title);
                IndiaInvoice.appendixRow = IndiaInvoice.appendixRow.replace('[[DVCode]]', invoiceData.Appendix[i].dvcode);
                IndiaInvoice.appendixRow = IndiaInvoice.appendixRow.replace('[[Amount]]', invoiceData.Appendix[i].amount);
                newArr.push(IndiaInvoice.appendixRow);
            }
            IndiaInvoice.appendixCreate = IndiaInvoice.appendixCreate.replace('[[Appendix]]', newArr.join(''));
            IndiaInvoice.appendixCreate = IndiaInvoice.appendixCreate.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.IndCurrencySymbol);
            
        } else {
            this.showAppendix = false;
            
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

        IndiaObject.purchaseOrder = IndiaObject.purchaseOrder.replace('[[PurchaseOrderNumber]]',
            invoiceData.purchaseOrderNumber);

        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[Company]]', invoiceData.company);
        IndiaObject.contactDetails1 = IndiaObject.contactDetails1.replace('[[ClientContact]]',
            invoiceData.clientcontact1);
        IndiaObject.address = IndiaObject.address.replace('[[Address1]]', invoiceData.address1);
        IndiaObject.address2 = IndiaObject.address2.replace('[[Address2]]', invoiceData.address2);
        IndiaObject.address3 = IndiaObject.address3.replace('[[Address3]]', invoiceData.address3);
        IndiaObject.address4 = IndiaObject.address4.replace('[[Address4]]', invoiceData.address4);

        IndiaObject.contactDetails2 = IndiaObject.contactDetails2.replace('[[Phone]]', invoiceData.phone);
        IndiaObject.contactDetails2 = IndiaObject.contactDetails2.replace('[[Designation]]',
            invoiceData.clientcontact2);
        IndiaObject.contactDetails2 = IndiaObject.contactDetails2.replace('[[Email]]', invoiceData.email);

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
            IndiaObject.address = IndiaObject.address.replace('[[AddressMulti]]', this.indAddress);
            console.log(this.indAddress);
        } else {
            IndiaObject.address = IndiaObject.address.replace('[[AddressMulti]]', this.indAddress);
        }

        if (invoiceData.Appendix.length > 0) {
            this.showAppendix = true;
            IndiaObject.appendix = IndiaObject.appendix.replace('[[Appendix]]', newArr.join(''));
            IndiaObject.appendix = IndiaObject.appendix.replace(new RegExp('\\[\\[CurrencySymbol\\]\\]', 'gi'),
                invoiceData.IndCurrencySymbol);
            delete IndiaInvoice.appendixCreate;
            delete IndiaInvoice.appendixRow;
        } else {
            this.showAppendix = false;
            delete IndiaInvoice.appendix;
            delete IndiaInvoice.appendixCreate;
            delete IndiaInvoice.appendixRow;
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

    getData(data: { htmldata: string; class: string; }) {
        console.log(data);
        this.editor = false;
        const mainUl = document.getElementById(this.elementId);
        const getLi = mainUl.getElementsByTagName('li')[1];
        console.log(data.htmldata);
        if (this.elementId === 'appendix') {
            document.getElementById(this.elementId).innerHTML = data.htmldata.replace(/&nbsp;/g, '');
        } else if (getLi === null || getLi === undefined) {
            document.getElementById(this.elementId).innerHTML = data.htmldata;
        } else {
            getLi.firstElementChild.innerHTML = data.htmldata;
        }
        document.getElementById('appendix').className = data.class;
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

    confirm() {
        this.disableButton();
        this.fdConstantsService.fdComponent.isPSInnerLoaderHidden = false;
        if (document.querySelector('.col10') !== null) {
            const el = document.querySelector('.col10');
            el.innerHTML = el.innerHTML.replace(/&nbsp;/g, '');
        }

        const header = document.getElementById('header');
        let headerObj: any = this.headerstyle;
        headerObj = headerObj.replace('[[HeaderContent]]', header.outerHTML);
        // console.log('Header Html', headerObj);

        const content = document.getElementById('main_content');
        let contentObj: string = this.contentStyle;
        const outerData: string = content.outerHTML;
        contentObj = contentObj + outerData + '</body></html>';
        // console.log('Main Content Html', contentObj);


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
            this.USHtmlObject.contactDetails = document.getElementById('contactDetails1').innerHTML;
            this.USHtmlObject.contactDetails2 = document.getElementById('contactDetails2').innerHTML;
            this.USHtmlObject.purchaseOrder = document.getElementById('purchaseOrderDetails').innerHTML;
            this.USHtmlObject.invoiceDetail = document.getElementById('invoiceDetails').innerHTML;
            this.USHtmlObject.paymentInstructions = document.getElementById('paymentInstructions').innerHTML;
            this.USHtmlObject.paymentDetails = document.getElementById('paymentDetails').innerHTML;
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
            if (this.showAppendix) {
                this.japanHtmlObject.appendix = document.getElementById('appendix').innerHTML;
            }
            obj.saveObj = this.japanHtmlObject;
        } else if (Object.keys(this.IndiaTemplateCopy).length > 0) {
            this.indiaHtmlObject.header = document.getElementById('header').innerHTML;
            this.indiaHtmlObject.footer = document.getElementById('footer').innerHTML;
            this.indiaHtmlObject.contactDetails1 = document.getElementById('contactDetails1').innerHTML;
            this.indiaHtmlObject.contactDetails2 = document.getElementById('contactDetails2').innerHTML;
            this.indiaHtmlObject.address = document.getElementById('address').innerHTML;
            this.indiaHtmlObject.purchaseOrder = document.getElementById('purchaseOrderDetails').innerHTML;
            this.indiaHtmlObject.invoiceDetail = document.getElementById('invoiceDetails').innerHTML;
            this.indiaHtmlObject.paymentInstructions = document.getElementById('paymentInstructions').innerHTML;
            this.indiaHtmlObject.paymentDetails = document.getElementById('paymentInstructions2').innerHTML;
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
            this.messageService.add({ key: 'editToast', severity: 'success', summary: this.fdConstantsService.fdComponent.selectedEditObject.Type + ' edited successfully.' });
        }, 300);
    }

    async createUSProforma() {
        
        const objReturn: any = this.createUSInvoice(this.invoicedata);
        const pdfContent: any = objReturn.pdf;
        pdfContent.Code = "TestingOnQAUS";
        pdfContent.WebUrl = this.globalObject.sharePointPageObject.webRelativeUrl;
        pdfContent.ID = '';
        pdfContent.Type = 'Proforma';
        pdfContent.ListName = 'ADFC';
        pdfContent.HtmlContent = JSON.stringify(objReturn);
        this.fdConstantsService.fdComponent.selectedEditObject.Code = "TestingOnQAUS";
        this.fdConstantsService.fdComponent.selectedEditObject.ListName = "Flip";
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
        pdfContent.ListName = 'ADFC';
        pdfContent.HtmlContent = JSON.stringify(objReturn);
        this.fdConstantsService.fdComponent.selectedEditObject.Code = "TestingOnQAJapan";
        this.fdConstantsService.fdComponent.selectedEditObject.ListName = "Flip";
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
        pdfContent.ListName = 'ADFC';
        pdfContent.HtmlContent = JSON.stringify(objReturn);
        this.fdConstantsService.fdComponent.selectedEditObject.Code = "TestingOnQAIndia";
        this.fdConstantsService.fdComponent.selectedEditObject.ListName = "Flip";
         ///// Call service 
         const pdfService = 'https://cactusspofinance.cactusglobal.com/pdfservice2/PDFService.svc/GeneratePDF';
         await this.spOperationsServices.executeJS(pdfService, pdfContent);
    }
}

