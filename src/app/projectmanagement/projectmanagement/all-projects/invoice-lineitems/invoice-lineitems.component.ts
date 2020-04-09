import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef , DynamicDialogConfig} from 'primeng';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { DatePipe } from '@angular/common';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';

@Component({
  selector: 'app-invoice-lineitems',
  templateUrl: './invoice-lineitems.component.html',
  styleUrls: ['./invoice-lineitems.component.css']
})
export class InvoiceLineitemsComponent implements OnInit {
  data;
  status;
  poData = [];
  lineItemsUpdate: any = {}
  poAddObj:any = {
    poId: 0,
    date: new Date(),
    amount: 0,
    type: '',
    status: '',
    poc: '',
    address: '',
    pocText: '',
    Id: 0,
  };
  minDateValue = new Date();
  constructor(private dialogService: DialogService,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private pmConstant: PmconstantService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private datePipe: DatePipe,
    private pmCommonService: PMCommonService,
    public pmObject: PMObjectService) { }

  ngOnInit() {
    this.data = this.config.data.projectObj;
    this.status = this.config.data.Status;
    this.getInvoiceLineItems(this.data)
  }

  async getInvoiceLineItems(projObj) {
    const invoiceLineItemsFilter = Object.assign({}, this.pmConstant.FINANCE_QUERY.INVOICE_LINE_ITEMS_BY_PROJECTCODE);
    invoiceLineItemsFilter.filter = invoiceLineItemsFilter.filter.replace(/{{projectCode}}/gi,
      projObj.ProjectCode);
    const invoiceLineItems = await this.spServices.readItems(this.constant.listNames.InvoiceLineItems.name, invoiceLineItemsFilter);
    const filterInvoiceLineItems = invoiceLineItems.filter(e=> e.Status == "Scheduled")

    filterInvoiceLineItems.forEach(invoiceItem => {
      const invoiceObj = $.extend(true, {}, this.poAddObj);
      invoiceObj.date = new Date(this.datePipe.transform(invoiceItem.ScheduledDate, 'MMM d, y'));
      invoiceObj.amount = invoiceItem.Amount;
      invoiceObj.type = invoiceItem.ScheduleType;
      invoiceObj.status = invoiceItem.Status;
      invoiceObj.poc = invoiceItem.MainPOC;
      invoiceObj.pocText = invoiceItem.MainPOC ? this.pmCommonService.extractNamefromPOC([invoiceItem.MainPOC]) : '';
      invoiceObj.address = invoiceItem.AddressType;
      invoiceObj.Id = invoiceItem.Id;

      this.poData.push(invoiceObj);
    });
  }

  saveInvoiceLineItems(poData) {
    this.lineItemsUpdate.invoiceLineItems = poData;
    this.lineItemsUpdate.status = this.status 
    this.ref.close(this.lineItemsUpdate)
  }

}
