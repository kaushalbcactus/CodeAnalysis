import { Component, OnInit, ViewChild } from '@angular/core';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { CommonService } from 'src/app/Services/common.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { SpOperationsService } from 'src/app/Services/sp-operations.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { DataService } from 'src/app/Services/data.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';

declare var $;
@Component({
  selector: 'app-select-sow',
  templateUrl: './select-sow.component.html',
  styleUrls: ['./select-sow.component.css']
})
export class SelectSOWComponent implements OnInit {
  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'SOW Code' },
    { field: 'ShortTitle', header: 'SOW Title' },
    { field: 'SOWOwner', header: 'SOW Owner' }
  ];
  filterColumns: any[] = [
    { field: 'SOWCode' },
    { field: 'ShortTitle' },
    { field: 'SOWOwner' }
  ];
  public selectSOW = {
    sowCodeArray: [],
    shortTitleArray: [],
    sowOwnerArray: []
  };
  errorMsg = '';
  isSelectSOWLoaderHidden = false;
  isSelectSOWTableHidden = true;
  subscription;
  constructor(
    public pmObject: PMObjectService,
    private commonService: CommonService,
    private pmConstant: PmconstantService,
    private spServices: SpOperationsService,
    private constants: ConstantsService,
    private dataService: DataService,
    private pmCommonService: PMCommonService) { }

  ngOnInit() {
    this.isSelectSOWLoaderHidden = false;
    this.isSelectSOWTableHidden = true;
    setTimeout(() => {
      this.getSelectSOW();
    }, this.pmConstant.TIME_OUT);
    if (this.pmObject.addProject.SOWSelect.GlobalFilterValue) {
      this.lazyLoadTask(this.pmObject.addProject.SOWSelect.GlobalFilterEvent);
    }
  }
  callReloadSOW() {
    this.getSelectSOW();
  }
  async getSelectSOW() {
    const sowCodeTempArray = [];
    const shortTitleTempArray = [];
    const sowOwnerTempArray = [];
    if (this.pmObject.allSOWItems.length === 0) {
      let arrResults = [];
      if (this.pmObject.userRights.isMangers
        || this.pmObject.userRights.isHaveSOWFullAccess
        || this.pmObject.userRights.isHaveSOWBudgetManager) {
        const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.ALL_SOW);
        arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
      } else {
        const sowFilter = Object.assign({}, this.pmConstant.SOW_QUERY.USER_SPECIFIC_SOW);
        arrResults = await this.spServices.readItems(this.constants.listNames.SOW.name, sowFilter);
      }
      if (arrResults && arrResults.length) {
        this.pmObject.allSOWItems = arrResults;
      }
    }
    if (this.pmObject.allSOWItems && this.pmObject.allSOWItems.length) {
      const tempAllSOWArray = [];
      for (const task of this.pmObject.allSOWItems) {
        const sowObj = $.extend(true, {}, this.pmObject.selectSOW);
        sowObj.ID = task.ID;
        sowObj.Title = task.Title;
        sowObj.SOWCode = task.SOWCode;
        sowObj.ShortTitle = task.Title;
        sowObj.TotalBudget = task.TotalBudget ? task.TotalBudget : 0;
        sowObj.NetBudget = task.NetBudget ? task.NetBudget : 0;
        sowObj.OOPBudget = task.OOPBudget ? task.OOPBudget : 0;
        sowObj.TaxBudget = task.TaxBudget ? task.TaxBudget : 0;
        sowObj.RevenueLinked = task.RevenueLinked ? task.RevenueLinked : 0;
        sowObj.OOPLinked = task.OOPLinked ? task.OOPLinked : 0;
        sowObj.TaxLinked = task.TaxLinked ? task.TaxLinked : 0;
        sowObj.TotalScheduled = task.TotalScheduled ? task.TotalScheduled : 0;
        sowObj.TotalLinked = task.TotalLinked ? task.TotalLinked : 0;
        sowObj.ScheduledRevenue = task.ScheduledRevenue ? task.ScheduledRevenue : 0;
        sowObj.TotalInvoiced = task.TotalInvoiced ? task.TotalInvoiced : 0;
        sowObj.InvoicedRevenue = task.InvoicedRevenue ? task.InvoicedRevenue : 0;
        sowObj.ClientLegalEntity = task.ClientLegalEntity;
        sowObj.SOWOwner = task.BD ? task.BD.hasOwnProperty('ID') ?
          this.pmCommonService.extractNameFromId([task.BD.ID]).join(', ') : '' : '';
        sowCodeTempArray.push({ label: sowObj.SOWCode, value: sowObj.SOWCode });
        shortTitleTempArray.push({ label: sowObj.ShortTitle, value: sowObj.ShortTitle });
        sowOwnerTempArray.push({ label: sowObj.SOWOwner, value: sowObj.SOWOwner });
        tempAllSOWArray.push(sowObj);
      }
      this.selectSOW.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      this.selectSOW.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      this.selectSOW.sowOwnerArray = this.commonService.unique(sowOwnerTempArray, 'value');
      this.pmObject.selectSOWArray = Object.assign([], tempAllSOWArray);
      this.isSelectSOWLoaderHidden = true;
      this.isSelectSOWTableHidden = false;
    }
  }
  lazyLoadTask(event) {
    this.pmObject.addProject.SOWSelect.GlobalFilterEvent = event;
    const selectSOWArray = this.pmObject.selectSOWArray;
    this.commonService.lazyLoadTask(event, selectSOWArray, this.filterColumns, this.pmConstant.filterAction.SELECT_SOW);
  }
  goToProjectAttributes() {
    if (this.pmObject.addProject.SOWSelect.SOWCode) {
      this.pmObject.activeIndex = 1;
    } else {
      this.errorMsg = this.pmConstant.ERROR.SELECT_SOW;
    }
  }
  setSelectedSOWObject(task) {
    this.pmObject.addProject.SOWSelect.SOWSelectedItem = {};
    if (task) {
      this.pmObject.addProject.SOWSelect.SOWSelectedItem = task;
    }
  }
}
