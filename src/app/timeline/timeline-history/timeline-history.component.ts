import { GlobalService } from '../../Services/global.service';
import { ConstantsService } from '../../Services/constants.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { SPCommonService } from '../../Services/spcommon.service';
import { TimelineConstantsService } from './../services/timeline-constants.service';
import { DatePipe } from '@angular/common';
import { LazyLoadEvent } from 'primeng/primeng';
import { SPOperationService } from '../../Services/spoperation.service';

@Component({
  selector: 'app-timeline-history',
  templateUrl: './timeline-history.component.html',
  styleUrls: ['./timeline-history.component.css']
})
export class TimelineHistoryComponent implements OnInit {
  public top = 6;
  public buffer = 10;
  public timelineData = [];
  public timelineDataCopy = [];
  public arrProjectContacts = [];
  public projectCodes = [];
  public arrPO = [];
  public arrCle = [];
  public objTimelineData = {
    date_time: '',
    activity_type: '',
    activity_sub_type: '',
    activity_by: '',
    activity_description: '',
    file_uploaded: ''
  };
  public loading: boolean;
  public displayBody = false;
  public timelineHeader = [
    { field: 'date_time', header: 'Date & Time', width: '14%' },
    { field: 'activity_type', header: 'Activity Type', width: '14%'},
    { field: 'activity_sub_type', header: 'Activity Sub-Type', width: '' },
    { field: 'activity_by', header: 'Activity By' , width: ''},
    { field: 'activity_description', header: 'Activity Description', width: '20%' },
    { field: 'file_uploaded', header: 'File Uploaded', width: '' }
  ];
  public filter = {
    dates: [],
    activityType: [],
    activitySubType: [],
    activityBy: []
  };
  public ObjTimeline = {
    ID: '',
    moduleName: '',
    entityType: '',
    versionUrl: '',
    status: 'Pending',
    counter: 0,
    versions: [],
    verDifference: [],
    propertiesRequired: [],
    data: [],
  };
  public requestType = '';
  public timelineBaseObj: any = {};
  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  public totalCounter = 0;
  public actualRecords = 0;
  public totalRecords = 0;
  public initialRequest = [];
  public initialRequestOngoing = false;
  public tableCSSTop = 0;
  public filterEnabled = false;
  public hideLoader = true;
  constructor(private spStandardService: SPOperationService, private constant: TimelineConstantsService,
    private globalConstant: ConstantsService, private spcommon: SPCommonService, private datePipe: DatePipe,
    public elemRef: ElementRef, public global: GlobalService) { }

  ngOnInit() {
    /**
     * fetches project contacts and po on page load
     */
  
      this.initialize();
   
  }

  // #region component initialization
  async initialize() {
    const result = await this.getCommonData();
    this.arrProjectContacts = result.projectContacts;
    this.arrPO = result.po;
    this.arrCle = result.cle;
  }

  /**
   * fetches project contacts and po on page load
   */
  async getCommonData() {
    const batchURL = [];

    const getPrjContactItemData = Object.assign({}, this.options);
    getPrjContactItemData.url = this.spStandardService.getReadURL(this.globalConstant.listNames.ProjectContacts.name,
      this.constant.common.getProjectContacts);
    getPrjContactItemData.listName = this.globalConstant.listNames.ProjectContacts.name;
    getPrjContactItemData.type = 'GET';
    batchURL.push(getPrjContactItemData);

    const getPOItemData = Object.assign({}, this.options);
    getPOItemData.url = this.spStandardService.getReadURL(this.globalConstant.listNames.PO.name,
      this.constant.common.getPO);
    getPOItemData.listName = this.globalConstant.listNames.PO.name;
    getPOItemData.type = 'GET';
    batchURL.push(getPOItemData);

    const getCLEItemData = Object.assign({}, this.options);
    getCLEItemData.url = this.spStandardService.getReadURL(this.globalConstant.listNames.ClientLegalEntity.name,
      this.constant.common.getClientLegalEntity);
    getCLEItemData.listName = this.globalConstant.listNames.ClientLegalEntity.name;
    getCLEItemData.type = 'GET';
    batchURL.push(getCLEItemData);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    const arrProjectContacts = arrResult.length > 0 ? arrResult[0] : [];
    const arrPOs = arrResult.length > 1 ? arrResult[1] : [];
    const arrCLEs = arrResult.length > 2 ? arrResult[2] : [];
    return {
      projectContacts: arrProjectContacts.retItems,
      po: arrPOs.retItems,
      cle: arrCLEs.retItems
    };
  }
  // #endregion

  // #region timeline initialization
  showTimeline(id, moduleName, type) {
    this.reset();
    this.initialRequestOngoing = true;
   // this.loading = true;
   this.hideLoader = false;
    this.displayBody = true;
    this.timelineBaseObj = JSON.parse(JSON.stringify(this.ObjTimeline));
    this.requestType = type;
    setTimeout(() => {
      this.initializeTimeline(id, moduleName, type);
    }, 500);
  }

  async initializeTimeline(clickedInvItemId, moduleName, type) {
    const requestType = moduleName + '_' + type;
    this.createStructure(this.timelineBaseObj, moduleName, requestType, clickedInvItemId);
    await this.intialRequestCreation(moduleName, requestType, clickedInvItemId);
    this.differenceProcessing(this.timelineBaseObj, this.initialRequest[0]);
    this.initialRequest.splice(0, 1);
    this.responseCreation(this.timelineBaseObj.entityType, this.timelineBaseObj);
    this.assimilation();
    this.updateInitialStruture(this.timelineBaseObj);
    await this.creationComplete(moduleName);
   
    // this.loading = false;
  }

  // #endregion

  // #region Finance Dashboard

  // #region progressive scroll processing
  createStructure(obj, moduleName, type, timelineProcessObjID) {
    obj.ID = timelineProcessObjID.ID ? timelineProcessObjID.ID : timelineProcessObjID;
    switch (type) {
      case 'ProjectMgmt_Invoices':
      case 'FD_Invoices':
        obj.versionUrl = this.constant.financeDashboard.invoice.getInvoiceVersion;
        obj.propertiesRequired = this.constant.financeDashboard.invoice.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.Invoices.name;
        break;
      case 'ProjectMgmt_Proforma':
      case 'FD_Proforma':
        obj.versionUrl = this.constant.financeDashboard.proforma.getProformaVersion;
        obj.propertiesRequired = this.constant.financeDashboard.proforma.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.Proforma.name;
        break;
      case 'ProjectMgmt_InvoiceLineItems':
      case 'FD_InvoiceLineItems':
        obj.versionUrl = this.constant.financeDashboard.invoiceLineItem.getInvoiceLineItemsVersion;
        obj.propertiesRequired = this.constant.financeDashboard.invoiceLineItem.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.InvoiceLineItems.name;
        break;
      case 'FD_Rolling':
        obj.versionUrl = this.constant.financeDashboard.project.getProjectVersions;
        obj.propertiesRequired = this.constant.financeDashboard.project.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.ProjectInformation.name;
        break;
      case 'FD_ProjectFinances':
        obj.versionUrl = this.constant.financeDashboard.projectFinance.getProjectFinanceVersions;
        obj.propertiesRequired = this.constant.financeDashboard.projectFinance.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.ProjectFinances.name;
        break;
      case 'ProjectMgmt_ProjectFinances':
        obj.versionUrl = this.constant.projectManagement.projectFinance.getProjectFinanceVersions;
        obj.propertiesRequired = this.constant.projectManagement.projectFinance.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.ProjectFinances.name;
        break;
      case 'ProjectMgmt_Project':
        obj.versionUrl = this.constant.projectManagement.projectInformation.getVersions;
        obj.propertiesRequired = this.constant.projectManagement.projectInformation.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.ProjectInformation.name;
        break;
      case 'ProjectMgmt_Documents':
        obj.versionUrl = '';
        obj.propertiesRequired = '';
        obj.entityType = moduleName + '_Documents';
        obj.status = 'Pending';
        obj.data = timelineProcessObjID;
        break;
      case 'ProjectMgmt_ProjectBudgetBreakup':
        obj.versionUrl = this.constant.projectManagement.projectBudgetBreakup.getVersions;
        obj.propertiesRequired = this.constant.projectManagement.projectBudgetBreakup.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.ProjectBudgetBreakup.name;
        break;
      case 'ProjectMgmt_ProjectFinanceBreakup':
        obj.versionUrl = this.constant.projectManagement.projectFinanceBreakup.getVersions;
        obj.propertiesRequired = this.constant.projectManagement.projectFinanceBreakup.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.ProjectFinanceBreakup.name;
        break;
      case 'ProjectMgmt_SOW':
        obj.versionUrl = this.constant.projectManagement.sow.getVersions;
        obj.propertiesRequired = this.constant.projectManagement.sow.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.SOW.name;
        break;
      case 'ProjectMgmt_SOWBudgetBreakup':
        obj.versionUrl = this.constant.projectManagement.sowBudgetBreakup.getVersions;
        obj.propertiesRequired = this.constant.projectManagement.sowBudgetBreakup.propertiesRequired;
        obj.entityType = moduleName + '_' + this.globalConstant.listNames.SOWBudgetBreakup.name;
        break;
    }
  }

  async intialRequestCreation(moduleName, type, clickedItemId) {
    switch (type) {
      case 'ProjectMgmt_Invoices':
      case 'FD_Invoices':
        this.initialRequest = await this.getInvoiceVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_Proforma':
      case 'FD_Proforma':
        this.initialRequest = await this.getProforma(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_InvoiceLineItems':
      case 'FD_InvoiceLineItems':
        this.initialRequest = await this.getInvoiceLineItems(moduleName, clickedItemId, '0', this.top);
        break;
      case 'FD_Rolling':
        this.initialRequest = await this.getFDProjectVersions(moduleName, clickedItemId, '0', '1');
        break;
      case 'FD_ProjectFinances':
        this.initialRequest = await this.getFDProjectFinanceVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_ProjectFinances':
        this.initialRequest = await this.getProjectFinanceVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_Project':
        this.initialRequest = await this.getProjectVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_ProjectBudgetBreakup':
        this.initialRequest = await this.getProjectBudgetVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_ProjectFinanceBreakup':
        this.initialRequest = await this.getProjectFinanceBreakupVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_SOW':
        this.initialRequest = await this.getSowVersions(moduleName, clickedItemId, '0', this.top);
        break;
      case 'ProjectMgmt_SOWBudgetBreakup':
        this.initialRequest = await this.getSowBudgetBreakupVersions(moduleName, clickedItemId, '0', this.top);
        break;
    }
  }

  differenceProcessing(obj, versions) {
    obj.verDifference = this.getVerDifference(versions, obj);
  }

  getVerDifference(versions, obj) {
    obj.versions = versions;
    const buffer = obj.versions.length > this.top - 1 ? true : false;
    obj.counter = buffer ? obj.counter + versions.length - 1 : obj.counter + versions.length;
    obj.verDifference = this.spcommon.findVersionDifference(obj.versions, obj.propertiesRequired, buffer);
    return obj.verDifference;
  }

  responseCreation(type, obj) {
    switch (type) {
      case 'ProjectMgmt_Invoices':
      case 'FD_Invoices':
        obj.data = this.setInvoiceVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_Proforma':
      case 'FD_Proforma':
        obj.data = this.setProformaVersion(obj.versions, obj.verDifference);
        break;
      case 'FD_ProjectInformation':
      case 'FD_ProjectFinances':
        obj.data = this.setFDPrjVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_ProjectFinances':
        obj.data = this.setPrjFinanceVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_InvoiceLineItems':
      case 'FD_InvoiceLineItems':
        obj.data = this.setInvLineItemsVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_ProjectInformation':
        obj.data = this.setPrjVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_ProjectBudgetBreakup':
        obj.data = this.setPrjBudgetBreakupVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_ProjectFinanceBreakup':
        obj.data = this.setPrjFinanceBreakupVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_SOW':
        obj.data = this.setSowVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_SOWBudgetBreakup':
        obj.data = this.setSowBudgetBreakupVersion(obj.versions, obj.verDifference);
        break;
      case 'ProjectMgmt_Documents':
        obj.data = this.setPrjDocuments(obj.ID);
        break;
    }
  }

  assimilation() {
    let arrData = [];
    const assimilateObj = JSON.parse(JSON.stringify(this.timelineBaseObj));
    arrData = this.getDataFromObj(assimilateObj, arrData);
    const finalData = [...this.timelineData, ...arrData];
    this.timelineData = this.customSort(finalData, -1, 'date_time');
    this.timelineDataCopy = JSON.parse(JSON.stringify(this.timelineData));
    this.filter = this.getFilterData(this.timelineData);
    this.hideLoader = true;
  }

  updateInitialStruture(obj) {
    if (obj.counter < this.top - 1) {
      obj.status = 'Done';
    }
  }

  async creationComplete(moduleName) {
    if (this.initialRequest.length > 0) {
      this.initialRequest.forEach(returnTypes => {
        if (returnTypes.retItems.length > 0) {
          this.timelineBaseObj['timelineprocess_' + returnTypes.listName] = [];
          returnTypes.retItems.forEach(element => {
            const childObj = JSON.parse(JSON.stringify(this.ObjTimeline));
            this.createStructure(childObj, moduleName, returnTypes.listName, element);
            this.timelineBaseObj['timelineprocess_' + returnTypes.listName].push(childObj);
          });
        }
      });
    }
    await this.checkStructure();
  }
  // #endregion

  // #region fetch next set of data
  loadData(event: LazyLoadEvent) {
    this.loading = true;
    setTimeout(() => {
      if (this.checkIfEmptyObject(event.filters) && !this.filterEnabled) {
        if (event.first > this.tableCSSTop) {
          this.tableCSSTop = event.first;
          this.loadNextDataSet(event);
        } else if (!event.sortField) {
          this.setTableHeight('up', 0);
        } else {
          this.sortData(event, this.timelineData);
        }
      } else {
        this.filterEnabled = true;
        const filteredData = this.filterAction(event.sortField, event.sortOrder, event.filters, this.timelineDataCopy);
        this.timelineData = JSON.parse(JSON.stringify(filteredData));
        this.sortData(event, this.timelineData);
        if (!event.sortField) {
          setTimeout(() => {
            this.setTableHeight('up', 20);
          }, 500);
        }
      }
      this.loading = false;
    }, 500);
  }

  async loadNextDataSet(event) {
    await this.processPendingRequests();
    this.filter = this.getFilterData(this.timelineData);
    this.sortData(event, this.timelineData);
  }

  async processPendingRequests() {
    const retVersions = await this.processStructure();
    let processingObjs = [];
    processingObjs = this.updateStructure(this.timelineBaseObj, retVersions, processingObjs);
    processingObjs.forEach(element => {
      this.differenceProcessing(element, element.versions);
      this.markDone(element);
      this.responseCreation(element.entityType, element);
    });
    this.assimilation();
    await this.checkStructure();
  }

  async processStructure() {
    let batchURL = [];
    batchURL = this.parseStructure(this.timelineBaseObj, batchURL);
    const retVersions = await this.spStandardService.executeBatch(batchURL);
    return retVersions;
  }

  parseStructure(obj, batchURL) {
    obj.versions = [];
    obj.verDifference = [];
    obj.data = [];
    if (obj.entityType === 'ProjectMgmt_Documents' && obj.status === 'Pending') {
      this.responseCreation(obj.entityType, obj);
      obj.status = 'Done';
    }
    if (obj.status === 'Pending') {
      const getDataVer = Object.assign({}, this.options);
      const listName = obj.entityType ? obj.entityType.split('_')[1] : '';
      getDataVer.url = this.spStandardService.getItemVersionsURL(listName, obj.ID,
        obj.versionUrl);
      getDataVer.url = getDataVer.url.replace('{{skipCount}}', obj.counter).replace('{{top}}', this.top.toString());
      getDataVer.listName = obj.entityType + ';#' + obj.ID;
      getDataVer.type = 'GET';
      batchURL.push(getDataVer);
    }
    for (const propt in obj) {
      if (propt.indexOf('timelineprocess_') > -1) {
        const arrItemProp = obj[propt];
        arrItemProp.forEach(element => {
          batchURL = this.parseStructure(element, batchURL);
        });
      }
    }
    return batchURL;
  }

  updateStructure(obj, retVersions, callObject) {
    const retVal = retVersions.filter(t => (t.listName === obj.entityType + ';#' + obj.ID));
    if (retVal.length) {
      const timelineObj = obj;
      timelineObj.versions = retVal[0].retItems;
      callObject.push(timelineObj);
    }
    for (const propt in obj) {
      if (propt.indexOf('timelineprocess_') > -1) {
        const arrItemProp = obj[propt];
        arrItemProp.forEach(element => {
          callObject = this.updateStructure(element, retVersions, callObject);
        });
      }
    }
    return callObject;
  }

  markDone(element) {
    if (element.versions.length < this.top - 1) {
      element.status = 'Done';
    }
  }

  async checkStructure() {
    if (this.initialRequestOngoing) {
      this.initialRequestOngoing = false;
      // this will run for hierarchy objects and top object completed fetching all versions
      if (this.initialRequest.length > 0) {
        await this.processPendingRequests();
      } else {
        this.checkIfDone();
      }
      this.initialRequest = [];
    } else {
      this.checkIfDone();
    }
  }

  async checkIfDone() {
    const ifDone = this.checkifAllDone(this.timelineBaseObj);
    if (ifDone) {
      this.totalRecords = this.timelineData.length;
      setTimeout(() => {
        this.setTableHeight('down', 0);
      }, 500);
    } else {
      if (this.timelineBaseObj.data.length < 1) {
        await this.processPendingRequests();
      } else {
        setTimeout(() => {
          this.totalRecords = this.timelineData.length + this.buffer;
          this.setTableHeight('down', this.buffer);
        }, 500);
      }
    }
  }

  // #endregion

  // #region fetch/get data versions

  getBatchRequest(listName, serviceCall, query, arrReplaceObject, moduleName, id?) {
    const obj = Object.assign({}, this.options);
    switch (serviceCall) {
      case 'versions':
        obj.url = this.spStandardService.getItemVersionsURL(listName, id, query);
        break;
      case 'filterItem':
        obj.url = this.spStandardService.getReadURL(listName, query);
        break;
    }

    Object.keys(arrReplaceObject).forEach((key) => {
      obj.url = obj.url.replace(key, arrReplaceObject[key]);
    });
    obj.listName = moduleName + '_' + listName;
    obj.type = 'GET';
    return obj;
  }

  /**
   * fetches invoices versions
   * fetches proforma item id
   * fetches invoicelineitems id and title to display inovice line item
   * @param clickedItemId clicked invoice item id
   * @param skipCount skips number of items for query
   * @param top number of items to fetch
   */
  async getInvoiceVersions(moduleName, invoiceId, skipCount, top) {
    const batchURL = [];
    // Fetch invoice versions
    const arrInvReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getInvDataVer = this.getBatchRequest(this.globalConstant.listNames.Invoices.name, 'versions',
      this.constant.financeDashboard.invoice.getInvoiceVersion, arrInvReplace, moduleName, invoiceId);
    batchURL.push(getInvDataVer);
    // Fetch proforma
    const arrPrfReplace = { '{{itemID}}': invoiceId };
    const getPrfDataVer = this.getBatchRequest(this.globalConstant.listNames.Proforma.name, 'filterItem',
      this.constant.financeDashboard.proforma.getProforma, arrPrfReplace, moduleName);
    batchURL.push(getPrfDataVer);
    // Fetch invoice line items
    const arrInvLineItemReplace = { '{{itemID}}': invoiceId };
    const getInvLineItemDataVer = this.getBatchRequest(this.globalConstant.listNames.InvoiceLineItems.name, 'filterItem',
      this.constant.financeDashboard.invoice.getInvoiceLineItems, arrInvLineItemReplace, moduleName);
    batchURL.push(getInvLineItemDataVer);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    let invoiceVersions = arrResult.length > 0 ? arrResult[0].retItems : [];
    const proforma = arrResult.length > 1 ? arrResult[1] : [];
    // fetch project title from invoice line items
    const invoiceLineItems = arrResult.length > 2 ? arrResult[2] : [];
    this.projectCodes = invoiceLineItems.retItems.map(i => i.Title);
    invoiceVersions = invoiceVersions.map(version => ({ ...version, projects: this.projectCodes }));
    return [
      invoiceVersions,
      proforma,
      invoiceLineItems
    ];
  }

  /**
   * fetches proforma based on proforma item id
   */
  async getProforma(moduleName, PrfItemId, skipCount, top) {
    const batchURL = [];
    // Fetch proforma versions
    const arrPrfReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPrfDataVer = this.getBatchRequest(this.globalConstant.listNames.Proforma.name, 'versions',
      this.constant.financeDashboard.proforma.getProformaVersion, arrPrfReplace, moduleName, PrfItemId);
    batchURL.push(getPrfDataVer);
    // Fetch invoice line items
    const arrInvLineItemReplace = { '{{itemID}}': PrfItemId };
    const getInvLineItemDataVer = this.getBatchRequest(this.globalConstant.listNames.InvoiceLineItems.name, 'filterItem',
      this.constant.financeDashboard.proforma.getInvoiceLineItems, arrInvLineItemReplace, moduleName);
    batchURL.push(getInvLineItemDataVer);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    let proformaVersions = arrResult.length > 0 ? arrResult[0].retItems : [];
    const invoiceLineItems = arrResult.length > 1 ? arrResult[1] : [];
    const projectCodes = arrResult.length > 1 ? arrResult[1].retItems.map(i => i.Title) : [];
    // return unique set of project codes from array
    this.projectCodes = projectCodes.filter((x, i, a) => a.indexOf(x) === i);
    proformaVersions = proformaVersions.map(version => ({ ...version, projects: this.projectCodes }));
    return [proformaVersions, invoiceLineItems];
  }

  /**
   *  Fetches invoice line items version items based on skip and top
   * @param invLineItemId -invoice line item id
   * @param skipCount - skipcount
   * @param top - top
   */
  async getInvoiceLineItems(moduleName, invLineItemId, skipCount, top) {
    const batchURL = [];
    // Fetch Invoice line items
    const arrInvLineItemReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getInvLineItemDataVer = this.getBatchRequest(this.globalConstant.listNames.InvoiceLineItems.name, 'versions',
      this.constant.financeDashboard.invoiceLineItem.getInvoiceLineItemsVersion, arrInvLineItemReplace, moduleName, invLineItemId);
    batchURL.push(getInvLineItemDataVer);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    let invLineItemVersions = arrResult.length > 0 ? arrResult[0].retItems : [];
    invLineItemVersions = invLineItemVersions.map(version => ({ ...version, projects: this.projectCodes }));
    return [invLineItemVersions];
  }

  /**
   * fetches project versions
   */
  async getFDProjectVersions(moduleName, itemID, skipCount, top) {
    const batchURL = [];
    let prjFinance = [];
    const arrPrjReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPrjDataVer = this.getBatchRequest(this.globalConstant.listNames.ProjectInformation.name, 'versions',
      this.constant.financeDashboard.project.getProjectVersions, arrPrjReplace, moduleName, itemID);
    batchURL.push(getPrjDataVer);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    let projectVersions = arrResult.length > 0 ? arrResult[0].retItems : [];
    // copy project code value from Project code to title property for standard use across code
    projectVersions = projectVersions.map(version => ({ ...version, Title: version.ProjectCode }));
    if (projectVersions.length > 0) {
      const batchPFURL = [];
      const arrPrjFinanceReplace = { '{{projectCode}}': projectVersions[0].Title };
      const getPrjFinanceData = this.getBatchRequest(this.globalConstant.listNames.ProjectFinances.name, 'filterItem',
        this.constant.financeDashboard.projectFinance.getProjFinanceInfo, arrPrjFinanceReplace, moduleName);
      batchPFURL.push(getPrjFinanceData);

      const arrPFResult = await this.spStandardService.executeBatch(batchPFURL);
      prjFinance = arrPFResult.length > 0 ? arrPFResult[0] : [];
    }
    return [projectVersions, prjFinance];
  }

  /**
   * fetches project finance list item id and then versions
   */
  async getFDProjectFinanceVersions(moduleName, itemID, skipCount, top) {
    const batchURL = [];
    const arrPrjFinanceReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPFDataVer = this.getBatchRequest(this.globalConstant.listNames.ProjectFinances.name, 'versions',
      this.constant.financeDashboard.projectFinance.getProjectFinanceVersions, arrPrjFinanceReplace, moduleName, itemID);
    batchURL.push(getPFDataVer);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    const projectFinanceVersions = arrResult.length > 0 ? arrResult[0].retItems : [];
    return [projectFinanceVersions];
  }
  // #endregion

  // #region process/set data for display data
  /**
   * Process data based on columns and status and update table accordingly
   * @param arrVersions - invoice versions
   * @param arrVersionDifference - properties of version differences
   */
  setInvoiceVersion(arrVersions, arrVersionDifference) {
    const items = [];
    arrVersionDifference.forEach(element => {
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      // loops through each changed property based on versions difference and add items to timelineData
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.invoiceList.columns.FileURL:
              if (properties[key] && !versionDetail.InvoiceHtml) {
                obj.activity_type = 'Attachment';
                obj.activity_description = 'File Replaced';
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + properties[key];
              }
              break;
            case this.globalConstant.invoiceList.columns.PaymentURL:
              if (properties[key]) {
                obj.activity_type = 'Payment resolved attachment';
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + properties[key];
              }
              break;
            case this.globalConstant.invoiceList.columns.InvoiceHtml:
              if (versionDetail.FileURL && versionDetail.InvoiceHtml) {
                obj.activity_type = 'Invoice Edited';
                obj.activity_description = 'Invoice format updated';
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + versionDetail.FileURL;
              }
              break;
            case this.globalConstant.invoiceList.columns.Status:
              switch (properties[key]) {
                case this.globalConstant.invoiceList.status.Paid:
                  obj.activity_type = 'Marked as Payment Resolved';
                  obj.activity_description = 'Payment resolved';
                  break;
                case this.globalConstant.invoiceList.status.Generated:
                  obj.activity_type = 'Invoice Generated';
                  obj.activity_description = 'Invoice generated';
                  break;
                case this.globalConstant.invoiceList.status.SenttoAP:
                  obj.activity_type = 'Sent to client';
                  obj.activity_description = 'Invoice sent to client';
                  break;
                case this.globalConstant.invoiceList.status.Dispute:
                  obj.activity_type = 'Dispute Invoice';
                  obj.activity_description = 'Invoice raised for dispute';
                  break;
                case this.globalConstant.invoiceList.status.AwaitingWriteOff:
                  obj.activity_type = 'Sent to client';
                  obj.activity_description = 'Invoice is awaiting Write Off!';
                  break;
                case this.globalConstant.invoiceList.status.ClosedwithCredit:
                  obj.activity_type = 'Sent to client';
                  obj.activity_description = 'Invoice closed with Credit Note!';
                  break;
                case this.globalConstant.invoiceList.status.AwaitingClosedDebit:
                  obj.activity_type = 'Sent to client';
                  obj.activity_description = 'Invoice is awaiting Closed Debit Note!';
                  break;
                case this.globalConstant.invoiceList.status.AwaitingClosedCredit:
                  obj.activity_type = 'Sent to client';
                  obj.activity_description = 'Invoice is awaiting Closed Credit Note!';
                  break;
              }
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  /**
   * Process data based on columns and status and update table accordingly
   */
  setProformaVersion(arrVersions, arrVersionDifference) {
    const items = [];
    arrVersionDifference.forEach(element => {
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      // loops through each changed property based on versions difference and add items to timelineData
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key) && properties.Status !== this.globalConstant.proformaList.status.Approved
          && properties.Status !== this.globalConstant.proformaList.status.Invoiced) {
          // creating deep copy of timeline object and add to table list
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.proformaList.columns.FileURL:
              if (properties[key] && !versionDetail.ProformaHtml) {
                obj.activity_type = 'Attachment';
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + properties[key];
                obj.activity_description = 'File Replaced';
              }
              break;
            case this.globalConstant.proformaList.columns.ProformaHtml:
              if (versionDetail.FileURL && versionDetail.ProformaHtml) {
                obj.activity_type = 'Proforma Edited';
                obj.activity_description = 'Proforma format updated.';
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + versionDetail.FileURL;
              }
              break;
            case this.globalConstant.proformaList.columns.Status:
              switch (properties[key]) {
                case this.globalConstant.proformaList.status.Rejected:
                  obj.activity_type = 'Proforma Rejected';
                  obj.activity_description = 'Proforma for project.';
                  break;
                case this.globalConstant.proformaList.status.Sent:
                  obj.activity_type = 'Sent to client';
                  obj.activity_description = 'Proforma sent to client.';
                  break;
                case this.globalConstant.proformaList.status.Created:
                  obj.activity_type = 'Proforma Created';
                  obj.activity_description = 'Proforma created.';
                  break;
              }
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  /**
   * Process data based on columns and status and update table accordingly
   * @param arrVersions - invoice versions
   * @param arrVersionDifference - properties of version differences
   */
  setInvLineItemsVersion(arrVersions, arrVersionDifference) {
    const items = [];
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : { Title: '', ScheduledDate: '', AddressType: '' };
      // fetch previous version number based on version label - needed for revert case
      const prevVersionNo = +element.VersionLabel - 1;
      // fetch previous version detail based on previous version label
      const prevVersion = arrVersions.filter(v => +v.VersionLabel === prevVersionNo);
      const prevVersionDetail = prevVersion.length > 0 ? prevVersion[0] : { Title: '', ScheduledDate: '', AddressType: '' };
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          let proformaRejObj = JSON.parse(JSON.stringify(obj));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.invoiceLineItemsList.columns.ScheduledDate:
              const toDate = this.datePipe.transform(new Date(new Date(versionDetail.ScheduledDate).toISOString()), 'dd/MM/yy');
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Date updated';
              obj.activity_description = 'Scheduled date updated to ' + toDate;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.MainPOC:
              const currentPOC = this.arrProjectContacts.filter(pc => pc.Id === versionDetail.MainPOC);
              const currentPOCDetail = currentPOC.length > 0 ? currentPOC[0] : { FullName: '' };
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'POC updated';
              obj.activity_description = 'POC updated to ' + currentPOCDetail.FullName;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.PO:
              const currentPO = this.arrPO.filter(po => po.Id === versionDetail.PO);
              const currentPODetail = currentPO.length > 0 ? currentPO[0] : { Number: '' };
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'PO updated';
              obj.activity_description = 'PO ' + currentPODetail.Number + ' tagged';
              break;
            case this.globalConstant.invoiceLineItemsList.columns.AddressType:
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Address type updated';
              obj.activity_description = 'Address type updated to ' + versionDetail.AddressType;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.Budget:
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Project rate Edited/Updated';
              obj.activity_description = 'Rate updated to ' + versionDetail.Budget + ' for project ' + versionDetail.Title;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.HoursSpent:
              const hours = versionDetail.HoursSpent ? versionDetail.HoursSpent : 0;
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Project hours Edited/Updated';
              obj.activity_description = 'Hours updated to ' + hours + ' for project ' + versionDetail.Title;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.Amount:
              const amount = versionDetail.Amount ? versionDetail.Amount : 0;
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Amount Updated';
              obj.activity_description = 'Scheduled amount updated to ' + amount;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.Status:
              switch (properties[key]) {
                case this.globalConstant.invoiceLineItemsList.status.Scheduled:
                  if (prevVersionDetail.Status === 'Confirmed') {
                    // if status changed from confirmed to scheduled then it is reverted
                    obj.activity_type = 'Invoice reverted';
                    obj.activity_description = 'Invoice reverted for project ' + versionDetail.Title;
                  } else {
                    obj.activity_type = 'Invoice Scheduled';
                    obj.activity_description = 'Invoice scheduled for project ' + versionDetail.Title;
                  }
                  break;
                case this.globalConstant.invoiceLineItemsList.status.Confirmed:
                  if (prevVersionDetail.Status === 'Proforma Created') {
                    // if proforma was created and rejected in previous version
                    proformaRejObj = {
                      activity_type: 'Proforma Rejected',
                      activity_description: 'Proforma for project ' + versionDetail.Title + ' Rejected',
                      date_time: obj.date_time,
                      activity_by: obj.activity_by
                    };
                    obj.activity_type = 'Invoice Confirmed';
                    obj.activity_description = 'Invoice confirmed for project ' + versionDetail.Title;
                  } else {
                    obj.activity_type = 'Invoice Confirmed';
                    obj.activity_description = 'Invoice confirmed for project ' + versionDetail.Title;
                  }
                  break;
                case this.globalConstant.invoiceLineItemsList.status.ProformaCreated:
                  obj.activity_type = 'Project added to Proforma';
                  obj.activity_description = 'Project ' + versionDetail.Title + ' added to Proforma';
                  break;
                case this.globalConstant.projectList.status.SentToAMForApproval:
                  obj.activity_type = 'Proposed closure';
                  obj.activity_sub_type = 'Project status updated to "Sent to AM for Approval"';
                  obj.activity_description = 'Proposed closure for project ' + versionDetail.Title;
                  break;

              }
          }
          if (obj.activity_type) {
            items.push(obj);
            if (proformaRejObj.activity_type) {
              items.push(proformaRejObj);
            }
          }
        }
      }
    });
    return items;
  }

  setFDPrjVersion(arrVersions, arrVersionDifference) {
    const items = [];
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.projectFinancesList.columns.Budget:
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Project rate Edited/Updated';
              obj.activity_description = 'Rate updated to ' + versionDetail.Budget + ' for project ' + versionDetail.Title;
              break;
            case this.globalConstant.projectFinancesList.columns.HoursSpent:
              const hours = versionDetail.HoursSpent ? versionDetail.HoursSpent : 0;
              obj.activity_type = 'Invoice Edited';
              obj.activity_sub_type = 'Project hours Edited/Updated';
              obj.activity_description = 'Hours updated to ' + hours + ' for project ' + versionDetail.Title;
              break;
            case this.globalConstant.invoiceLineItemsList.columns.Status:
              if (properties[key] === this.globalConstant.projectList.status.SentToAMForApproval) {
                obj.activity_type = 'Proposed closure';
                obj.activity_sub_type = 'Project status updated to "Sent to AM for Approval"';
                obj.activity_description = 'Proposed closure for project ' + versionDetail.Title;
              }
              break;
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }
  // #endregion

  // #region common function
  /**
   * returns array for filters
   * @param data - array of objects
   */
  getFilterData(data) {
    const objFilter = {
      dates: [],
      activityType: [],
      activitySubType: [],
      activityBy: []
    };
    data.forEach(element => {
      // formats modified date time of item to display in filter
      const formattedDateTimeLabel = this.datePipe.transform(new Date(new Date(element.date_time).toISOString()), 'MMM d, y');
      // formats modified date time of item to filter items based on filter action
      const formattedDateTimeValue = this.datePipe.transform(new Date(new Date(element.date_time).toISOString()), 'yyyy-MM-dd');
      if (element.date_time && objFilter.dates.filter(d => d.label === element.date_time).length < 1) {
        const objDateTime = {
          label: formattedDateTimeLabel,
          value: formattedDateTimeValue
        };
        // check if date item exists to avoid repitition
        if (objFilter.dates.filter(o => o.label === formattedDateTimeLabel).length < 1) {
          objFilter.dates.push(objDateTime);
        }
      }
      if (element.activity_type && objFilter.activityType.filter(d => d.label === element.activity_type).length < 1) {
        const objActivityType = {
          label: element.activity_type,
          value: element.activity_type
        };
        objFilter.activityType.push(objActivityType);
      }
      if (element.activity_sub_type && objFilter.activitySubType.filter(d => d.label === element.activity_sub_type).length < 1) {
        const objActivitySubType = {
          label: element.activity_sub_type,
          value: element.activity_sub_type
        };
        objFilter.activitySubType.push(objActivitySubType);
      }
      if (element.activity_by && objFilter.activityBy.filter(d => d.label === element.activity_by).length < 1) {
        const objActivityBy = {
          label: element.activity_by,
          value: element.activity_by
        };
        objFilter.activityBy.push(objActivityBy);
      }
    });
    Object.values(objFilter).forEach(arrColumn => {
      arrColumn = this.customSort(arrColumn, 1, 'value');
    });
    return objFilter;
  }

  /**
   * sorts data based on LazyLoadEvent order
   */
  sortData(event, data) {
    if (event.sortField) {
      const filteredData = this.filterAction(event.sortField, event.sortOrder, event.filters, data);
      this.timelineData = JSON.parse(JSON.stringify(filteredData));
    }
  }

  /**
   * This method is used filter based on selected filter.
   */
  filterAction(sortField, sortOrder, localFilter, originalData) {
    this.loading = true;
    let temp = JSON.parse(JSON.stringify(originalData));
    if (temp) {
      if (!this.checkIfEmptyObject(localFilter)) {
        temp = temp.filter(row => this.filterLocal(row, localFilter));
        temp = temp.length > 0 ? temp : [];
      } else {
        this.filterEnabled = false;
        temp = JSON.parse(JSON.stringify(originalData));
      }
      if (sortField) {
        temp = this.customSort(temp, sortOrder, sortField);
      }
      setTimeout(() => {
        this.setHeader();
        this.loading = false;
      }, 500);
    }
    return temp;
  }

  /**
   * This method is used to filter the data on column basis.
   */
  filterLocal(row, filter) {
    let isInFilter = false;
    let noFilter = true;
    for (const columnName in filter) {
      if (columnName !== 'global') {
        if (row[columnName] == null) {
          return;
        }
        noFilter = false;
        const rowValue: string = row[columnName].toString().toLowerCase();
        const filterMatchMode: string = filter[columnName].matchMode;
        if (filterMatchMode.includes('contains') && rowValue.includes(filter[columnName].value)) {
          isInFilter = true;
        } else if (filterMatchMode.includes('startsWith') && rowValue.startsWith(filter[columnName].value.toLowerCase())) {
          isInFilter = true;
        } else if (filterMatchMode.includes('in') && filter[columnName].value.includes(row[columnName])) {
          isInFilter = true;
        } else {
          return false;
        }
      }
    }
    if (noFilter) { isInFilter = true; }
    return isInFilter;
  }

  /**
   * This method is used to sort the column data either ascending or descending.
   */
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

  checkIfEmptyObject(obj) {
    if (Object.keys(obj).length === 0 && obj.constructor === Object) {
      return true;
    }
    return false;
  }

  /**
   * Resets table height and scroll position based on direction
   * @param scrollDirection - up/down
   */
  setTableHeight(scrollDirection, buffer) {
    const ifDone = this.checkifAllDone(this.timelineBaseObj);
    // It is used to remove empty whitespace from top by setting it to 0
    const table: any = this.elemRef.nativeElement.querySelector('#tblTimeline .ui-table-scrollable-body-table');
    if (ifDone) {
      // It is used to reset height of table based on data to remove empty white space when all data received
      const table1: any = this.elemRef.nativeElement.querySelector('#tblTimeline .ui-table-virtual-scroller');
      table1.style.height = table.clientHeight + 1 + buffer + 'px';
    }
    // It is used to set scroller to top position
    const table2: any = this.elemRef.nativeElement.querySelector('#tblTimeline .ui-table-scrollable-body');
    if (scrollDirection === 'up') {
      table.style.top = '0px';
      table2.scrollTo(0, 0);
    }
  }

  getDataFromObj(obj, arrData) {
    arrData = [...arrData, ...obj.data];
    for (const propt in obj) {
      if (propt.indexOf('timelineprocess_') > -1) {
        const arrItemProp = obj[propt];
        arrItemProp.forEach(element => {
          arrData = this.getDataFromObj(element, arrData);
        });
      }
    }
    return arrData;
  }

  checkifAllDone(obj) {
    if (obj.status === 'Pending') {
      return false;
    }
    let ifDone = true;
    if (ifDone) {
      for (const propt in obj) {
        if (propt.indexOf('timelineprocess_') > -1) {
          const arrItemProp = obj[propt];
          arrItemProp.forEach(element => {
            if (ifDone) {
              ifDone = this.checkifAllDone(element);
            }
          });
        }
      }
    }
    return ifDone;
  }

  setHeader() {
    const headerMaxHeight = this.elemRef.nativeElement.querySelector('.ui-table-scrollable-header').clientHeight;
    const headertableHeight = this.elemRef.nativeElement.querySelector('.ui-table-scrollable-header-box').clientHeight;
    const diffHeight = headerMaxHeight - headertableHeight;
    this.elemRef.nativeElement.querySelector('.ui-table-scrollable-body').style.marginTop = -diffHeight + 'px';
  }

  reset() {
    this.requestType = '';
    this.timelineBaseObj = {};
    this.totalCounter = 0;
    this.actualRecords = 0;
    this.totalRecords = 0;
    this.initialRequest = [];
    this.initialRequestOngoing = false;
    this.tableCSSTop = 0;
    this.filterEnabled = false;
    this.timelineData = [];
    this.filter = {
      dates: [],
      activityType: [],
      activitySubType: [],
      activityBy: []
    };
  }

  rowTrackBy(index: number, row: any) { return row.id; }
  // #endregion

  // #endregion

  // #region project

  // #region fetch/get data versions
  /**
   * fetches project versions
   */
  async getProjectVersions(moduleName, itemID, skipCount, top) {
    const batchProjectURL = [];
    let prjBudgetBreakup = {};
    let prjFinanceBreakup = {};
    let prjFinance = {};
    let prjInvoiceLineItems = {};
    let invoicePrfVersions = [];
    let prjDocuments = {};

    const arrPrjReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPrjDataVer = this.getBatchRequest(this.globalConstant.listNames.ProjectInformation.name, 'versions',
      this.constant.projectManagement.projectInformation.getVersions, arrPrjReplace, moduleName, itemID);
    batchProjectURL.push(getPrjDataVer);
    const arrPrjResult = await this.spStandardService.executeBatch(batchProjectURL);
    const projectVersions = arrPrjResult.length > 0 ? arrPrjResult[0].retItems : {};

    if (projectVersions.length > 0) {
      const batchURL = [];

      const arrPBBReplace = { '{{projectCode}}': projectVersions[0].ProjectCode };
      const getPrjBudgetBreakupData = this.getBatchRequest(this.globalConstant.listNames.ProjectBudgetBreakup.name, 'filterItem',
        this.constant.projectManagement.projectBudgetBreakup.getProjBreakupInfo, arrPBBReplace, moduleName);
      batchURL.push(getPrjBudgetBreakupData);

      const arrPFBReplace = { '{{projectCode}}': projectVersions[0].ProjectCode };
      const getPrjFinanceBreakupData = this.getBatchRequest(this.globalConstant.listNames.ProjectFinanceBreakup.name, 'filterItem',
        this.constant.projectManagement.projectFinanceBreakup.getProjFinanceBreakupInfo, arrPFBReplace, moduleName);
      batchURL.push(getPrjFinanceBreakupData);

      const arrInvLineItemReplace = { '{{projectCode}}': projectVersions[0].ProjectCode };
      const getInvLineItemDataVer = this.getBatchRequest(this.globalConstant.listNames.InvoiceLineItems.name, 'filterItem',
        this.constant.projectManagement.invoiceLineItems.getInvoiceLineItems, arrInvLineItemReplace, moduleName);
      batchURL.push(getInvLineItemDataVer);

      const arrPFReplace = { '{{projectCode}}': projectVersions[0].ProjectCode };
      const getPrjFinanceData = this.getBatchRequest(this.globalConstant.listNames.ProjectFinances.name, 'filterItem',
        this.constant.financeDashboard.projectFinance.getProjFinanceInfo, arrPFReplace, moduleName);
      batchURL.push(getPrjFinanceData);

      const getDocuments = Object.assign({}, this.options);
      getDocuments.url = this.spStandardService.getSubFolderFilesURL(projectVersions[0].ProjectFolder, 3);
      getDocuments.listName = moduleName + '_Documents';
      getDocuments.type = 'GET';
      batchURL.push(getDocuments);

      const arrResult = await this.spStandardService.executeBatch(batchURL);
      prjBudgetBreakup = arrResult.length > 0 ? arrResult[0] : {};
      prjFinanceBreakup = arrResult.length > 1 ? arrResult[1] : {};
      prjInvoiceLineItems = arrResult.length > 2 ? arrResult[2] : {};
      prjFinance = arrResult.length > 3 ? arrResult[3] : {};
      invoicePrfVersions = this.getProjectProformaInvoices(prjInvoiceLineItems, moduleName);
      prjDocuments = arrResult.length > 4 ? {
        listName: arrResult[4].listName,
        retItems: [arrResult[4].retItems]
      } : {};
    }
    const arrReturnResult = [projectVersions, prjBudgetBreakup, prjFinanceBreakup, prjFinance,
      prjInvoiceLineItems, ...invoicePrfVersions, prjDocuments];

    return arrReturnResult;
  }

  /**
   * fetches project finance list item id and then versions
   */
  async getProjectFinanceVersions(moduleName, itemID, skipCount, top) {
    const batchURL = [];
    const arrPrjFinanceReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPFDataVer = this.getBatchRequest(this.globalConstant.listNames.ProjectFinances.name, 'versions',
      this.constant.projectManagement.projectFinance.getProjectFinanceVersions, arrPrjFinanceReplace, moduleName, itemID);
    batchURL.push(getPFDataVer);

    const arrResult = await this.spStandardService.executeBatch(batchURL);
    const projectFinanceVersions = arrResult.length > 0 ? arrResult[0].retItems : [];
    return [projectFinanceVersions];
  }

  getProjectProformaInvoices(invoiceLineItems, moduleName) {
    const lineItems = [];
    invoiceLineItems.retItems.forEach(element => {
      if (element.InvoiceLookup) {
        const obj = {
          listName: moduleName + '_' + this.globalConstant.listNames.Invoices.name,
          retItems: [{
            ID: element.InvoiceLookup,
            Id: element.InvoiceLookup
          }]
        };
        lineItems.push(obj);
      }
      if (element.ProformaLookup) {
        const obj = {
          listName: moduleName + '_' + this.globalConstant.listNames.Proforma.name,
          retItems: [{
            ID: element.ProformaLookup,
            Id: element.ProformaLookup
          }]
        };
        lineItems.push(obj);
      }
    });
    return lineItems;
  }

  async getProjectBudgetVersions(moduleName, itemID, skipCount, top) {
    const batchProjectURL = [];
    const arrPBBReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPBBDataVer = this.getBatchRequest(this.globalConstant.listNames.ProjectBudgetBreakup.name, 'versions',
      this.constant.projectManagement.projectBudgetBreakup.getVersions, arrPBBReplace, moduleName, itemID);
    batchProjectURL.push(getPBBDataVer);

    const arrPrjResult = await this.spStandardService.executeBatch(batchProjectURL);
    const prjBreakupVersions = arrPrjResult.length > 0 ? arrPrjResult[0].retItems : [];
    return [prjBreakupVersions];
  }

  async getProjectFinanceBreakupVersions(moduleName, itemID, skipCount, top) {
    const batchProjectURL = [];

    const arrPFBReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getPFBDataVer = this.getBatchRequest(this.globalConstant.listNames.ProjectFinanceBreakup.name, 'versions',
      this.constant.projectManagement.projectFinanceBreakup.getVersions, arrPFBReplace, moduleName, itemID);
    batchProjectURL.push(getPFBDataVer);
    const arrPrjResult = await this.spStandardService.executeBatch(batchProjectURL);
    const prjFinanceBreakupVersions = arrPrjResult.length > 0 ? arrPrjResult[0].retItems : [];
    return [prjFinanceBreakupVersions];
  }
  // #endregion

  // #region process/set data for display data
  setPrjVersion(arrVersions, arrVersionDifference) {
    const items = [];

    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.projectList.columns.BusinessVertical:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Practice area updated';
              obj.activity_description = 'Practice area updated to ' + versionDetail.BusinessVertical;
              break;
            case this.globalConstant.projectList.columns.Indication:
              if (versionDetail.Indication) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Project indication updated';
                obj.activity_description = 'Indication updated to ' + versionDetail.Indication;
              }
              break;
            case this.globalConstant.projectList.columns.IsPubSupport:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Pubsupport status updated';
              obj.activity_description = versionDetail.IsPubSupport === 'Yes' ? 'Project updated as pubsupport' :
                'Project updated as Non pubsupport';
              break;
            case this.globalConstant.projectList.columns.Milestone:
              if (versionDetail.Milestone) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Current milestone updated';
                obj.activity_description = 'Current milestone updated to ' + versionDetail.Milestone;
              }
              break;
            case this.globalConstant.projectList.columns.Molecule:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Molecule updated';
              obj.activity_description = 'Molecule Updated to ' + versionDetail.Molecule;
              break;
            case this.globalConstant.projectList.columns.Description:
              if (versionDetail.Description) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Description updated';
                obj.activity_description = 'Description Updated to ' + versionDetail.Description;
              }
              break;
            case this.globalConstant.projectList.columns.ConferenceJournal:
              if (versionDetail.ConferenceJournal) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Conference / Journal updated';
                obj.activity_description = 'Conference / Journal Updated to ' + versionDetail.ConferenceJournal;
              }
              break;
            case this.globalConstant.projectList.columns.Authors:
              if (versionDetail.Authors) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Authors updated';
                obj.activity_description = 'Authors Updated to ' + versionDetail.Authors;
              }
              break;
            case this.globalConstant.projectList.columns.Comments:
              if (versionDetail.Comments) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Comments updated';
                obj.activity_description = 'Comments Updated to ' + versionDetail.Comments;
              }
              break;
            case this.globalConstant.projectList.columns.SOWCode:
              if (versionDetail.SOWCode) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'SOW code updated';
                obj.activity_description = 'SOW code Updated to ' + versionDetail.SOWCode;
              }
              break;
            case this.globalConstant.projectList.columns.PrimaryPOC:
              const currentPOC = this.arrProjectContacts.filter(pc => pc.Id === versionDetail.PrimaryPOC);
              const currentPOCDetail = currentPOC.length > 0 ? currentPOC[0] : { FullName: '' };
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'POC updated';
              obj.activity_description = 'POC updated to ' + currentPOCDetail.FullName;
              break;
            case this.globalConstant.projectList.columns.Priority:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Priority updated';
              obj.activity_description = 'Priority Updated to ' + versionDetail.Priority;
              break;
            case this.globalConstant.projectList.columns.ProjectType:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Project type updated';
              obj.activity_description = 'Project type Updated to ' + versionDetail.ProjectType;
              break;
            case this.globalConstant.projectList.columns.ProposedEndDate:
              // tslint:disable
              if (versionDetail.ProposedEndDate) {
                const ProposedEndDate = this.datePipe.transform(new Date(new Date(versionDetail.ProposedEndDate).toISOString()), 'dd/MM/yy');
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Proposed end date updated';
                obj.activity_description = 'Proposed end date Updated to ' + ProposedEndDate;
              }
              break;
            case this.globalConstant.projectList.columns.ProposedStartDate:
              // tslint:disable
              if (versionDetail.ProposedStartDate) {
                const ProposedStartDate = this.datePipe.transform(new Date(new Date(versionDetail.ProposedStartDate).toISOString()), 'dd/MM/yy');
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Proposed start date updated';
                obj.activity_description = 'Proposed start date updated to ' + ProposedStartDate;
              }
              break;
            case this.globalConstant.projectList.columns.SOWBoxLink:
              if (versionDetail.SOWBoxLink) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Sow box link updated';
                obj.activity_description = 'Sow box link updated to ' + versionDetail.SOWBoxLink;
              }
              break;
            case this.globalConstant.projectList.columns.SOWLink:
              if (versionDetail.SOWLink) {
                obj.activity_type = 'Attachment';
                obj.activity_sub_type = 'Sow document updated';
                obj.activity_description = 'Sow document updated to ' + versionDetail.SOWLink;
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + versionDetail.ProjectFolder + 'Finance/SOW/' + versionDetail.SOWLink;
              }
              break;
            case this.globalConstant.projectList.columns.Status:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Status updated';
              obj.activity_description = 'Status Updated to ' + versionDetail.Status;
              break;
            case this.globalConstant.projectList.columns.TA:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'TA updated';
              obj.activity_description = 'TA updated to ' + versionDetail.TA;
              break;
            case this.globalConstant.projectList.columns.WBJID:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Short title Updated';
              obj.activity_description = 'Short title Updated to ' + versionDetail.WBJID;
              break;
            case this.globalConstant.projectList.columns.BD:
              if (properties.BD) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'BD Updated';
                obj.activity_description = 'BD Updated to ' + properties.BD;
              }
              break;
            case this.globalConstant.projectList.columns.CMLevel1:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'CM Level 1 Updated';
              obj.activity_description = 'CM Level 1 Updated to ' + properties.CMLevel1;
              break;
            case this.globalConstant.projectList.columns.CMLevel2:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'CM Level 2 Updated';
              obj.activity_description = 'CM Level 2 Updated to ' + properties.CMLevel2;
              break;
            case this.globalConstant.projectList.columns.DeliveryLevel1:
              if (properties.DeliveryLevel1) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Delivery Level 1 Updated';
                obj.activity_description = 'Delivery Level 1 Updated to ' + properties.DeliveryLevel1;
              }
              break;
            case this.globalConstant.projectList.columns.DeliveryLevel2:
              obj.activity_type = 'Project updated';
              obj.activity_sub_type = 'Delivery Level 2 Updated';
              obj.activity_description = 'Delivery Level 2 Updated to ' + properties.DeliveryLevel2;
              break;
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  setPrjFinanceBreakupVersion(arrVersions, arrVersionDifference) {
    const items = [];
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.projectFinanceBreakupList.columns.AmountRevenue:
              if (versionDetail.AmountRevenue) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Revenue amount updated';
                obj.activity_description = 'Revenue amount booked for PO ' + versionDetail.POLookup + ' updated to ' + versionDetail.AmountRevenue;
              }
              break;
            case this.globalConstant.projectFinanceBreakupList.columns.AmountOOP:
              if (versionDetail.AmountOOP) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'OOP amount updated';
                obj.activity_description = 'OOP amount booked for PO ' + versionDetail.POLookup + ' updated to ' + versionDetail.AmountOOP;
              }
              break;
            case this.globalConstant.projectFinanceBreakupList.columns.ScheduledRevenue:
              if (versionDetail.ScheduledRevenue) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Scheduled revenue amount updated';
                obj.activity_description = 'Scheduled revenue amount booked for PO ' + versionDetail.POLookup + ' updated to ' + versionDetail.ScheduledRevenue;
              }
              break;
            case this.globalConstant.projectFinanceBreakupList.columns.ScheduledOOP:
              if (versionDetail.ScheduledOOP) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Scheduled OOP amount updated';
                obj.activity_description = 'Scheduled oop amount booked for PO ' + versionDetail.POLookup + ' updated to ' + versionDetail.ScheduledOOP;
              }
              break;
            case this.globalConstant.projectFinanceBreakupList.columns.InvoicedRevenue:
              if (versionDetail.InvoicedRevenue) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Invoiced revenue amount updated';
                obj.activity_description = 'Invoiced revenue amount booked for PO ' + versionDetail.POLookup + ' updated to ' + versionDetail.InvoicedRevenue;
              }
              break;
            case this.globalConstant.projectFinanceBreakupList.columns.InvoicedOOP:
              if (versionDetail.InvoicedOOP) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Invoiced OOP amount updated';
                obj.activity_description = 'Invoiced oop amount booked for PO ' + versionDetail.POLookup + ' updated to ' + versionDetail.InvoicedOOP;
              }
              break;
            case this.globalConstant.projectFinanceBreakupList.columns.Status:
              if (versionDetail.Status === this.globalConstant.projectFinanceBreakupList.status.Deleted) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Invoice delinked';
                obj.activity_description = 'Scheduled invoice delinked for PO ' + versionDetail.POLookup;
              }
              break;
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  setPrjBudgetBreakupVersion(arrVersions, arrVersionDifference) {
    const items = [];
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.projectBudgetBreakupList.columns.BudgetHours:
              if (versionDetail.BudgetHours && versionDetail.Status === this.globalConstant.projectBudgetBreakupList.status.Approved) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Budget hours updated';
                obj.activity_description = 'Budget hours updated with ' + versionDetail.BudgetHours;
              }
              break;
            case this.globalConstant.projectBudgetBreakupList.columns.NetBudget:
              if (versionDetail.NetBudget && versionDetail.Status === this.globalConstant.projectBudgetBreakupList.status.Approved) {
                const action = (+versionDetail.NetBudget) < 0 ? 'reduced' : 'added';
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Revenue Budget updated';
                obj.activity_description = 'Revenue Budget ' + action + ' with ' + versionDetail.NetBudget + ' due to ' + versionDetail.Reason;
              }
              break;
            case this.globalConstant.projectBudgetBreakupList.columns.OOPBudget:
              if (versionDetail.OOPBudget && versionDetail.Status === this.globalConstant.projectBudgetBreakupList.status.Approved) {
                const action = (+versionDetail.OOPBudget) < 0 ? 'reduced' : 'added';
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'OOP Budget updated';
                obj.activity_description = 'OOP Budget ' + action + ' with ' + versionDetail.OOPBudget;
              }
              break;
            case this.globalConstant.projectBudgetBreakupList.columns.Status:
              switch (properties[key]) {
                case this.globalConstant.projectBudgetBreakupList.status.Approved:
                  if (+versionDetail.NetBudget !== 0) {
                    const approvalDate = this.datePipe.transform(new Date(new Date(versionDetail.ApprovalDate).toISOString()), 'dd/MM/yy');
                    obj.activity_type = 'Project updated';
                    obj.activity_sub_type = 'Budget Approved';
                    obj.activity_description = 'Budget of ' + versionDetail.NetBudget + ' approved on ' + approvalDate;
                  }
                  break;
                case this.globalConstant.projectBudgetBreakupList.status.ApprovalPending:
                  if (+versionDetail.NetBudget !== 0) {
                    const action = (+versionDetail.NetBudget) < 0 ? 'reduction' : 'addition';
                    obj.activity_type = 'Project updated';
                    obj.activity_sub_type = 'Budget approval pending';
                    obj.activity_description = 'Request for budget ' + action + ' of ' + +versionDetail.NetBudget + ' is raised.';
                  }
                  break;
              }
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  setPrjFinanceVersion(arrVersions, arrVersionDifference) {
    const items = [];
    const topVersionDetail = arrVersions.length > 0 ? arrVersions[0] : {};
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.projectFinancesList.columns.BudgetHrs:
              if (versionDetail.BudgetHrs) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Budget hours updated';
                obj.activity_description = 'Budget hours updated with ' + versionDetail.BudgetHrs;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.ScheduledOOP:
              if (versionDetail.ScheduledOOP) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Scheduled amount updated';
                obj.activity_description = 'Total scheduled oop amount updated to ' + versionDetail.ScheduledOOP;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.ScheduledRevenue:
              if (versionDetail.ScheduledRevenue) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Scheduled amount updated';
                obj.activity_description = 'Total scheduled revenue amount updated to ' + versionDetail.ScheduledRevenue;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.OOPBudget:
              if (versionDetail.OOPBudget) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'OOP Budget updated';
                obj.activity_description = 'Project oop budget updated to ' + versionDetail.OOPBudget;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.RevenueBudget:
              if (versionDetail.RevenueBudget) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Revenue budget updated';
                obj.activity_description = 'Project revenue budget updated to ' + versionDetail.RevenueBudget;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.InvoicedOOP:
              if (versionDetail.InvoicedOOP) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Invoiced amount updated';
                obj.activity_description = 'Total invoiced oop amount updated to ' + versionDetail.InvoicedOOP;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.InvoicedRevenue:
              if (versionDetail.InvoicedRevenue) {
                obj.activity_type = 'Project updated';
                obj.activity_sub_type = 'Invoiced amount updated';
                obj.activity_description = 'Total invoiced revenue amount updated to ' + versionDetail.InvoicedRevenue;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.Budget:
              if (versionDetail.Budget && topVersionDetail.HoursSpent) {
                obj.activity_type = 'Invoice Edited';
                obj.activity_sub_type = 'Project rate Edited/Updated';
                obj.activity_description = 'Rate updated to ' + versionDetail.Budget + ' for project ' + versionDetail.Title;
              }
              break;
            case this.globalConstant.projectFinancesList.columns.HoursSpent:
              if (versionDetail.HoursSpent) {
                obj.activity_type = 'Invoice Edited';
                obj.activity_sub_type = 'Project hours Edited/Updated';
                obj.activity_description = 'Hours updated to ' + versionDetail.HoursSpent + ' for project ' + versionDetail.Title;
              }
              break;
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  setPrjDocuments(objDocuments) {
    const items = [];
    const filteredFolders = objDocuments.Folders.results.filter(f => ['Communications', 'Emails', 'References', 'Source Documents'].indexOf(f.Name) > -1);
      filteredFolders.forEach(folder => {
      if (folder.ItemCount > 0) {
        const obj = JSON.parse(JSON.stringify(this.objTimelineData));       
          folder.Files.results.forEach(file => {
            obj.date_time = new Date(file.TimeLastModified).toISOString();
            obj.activity_by = file.ModifiedBy.Title ? file.ModifiedBy.Title : file.ModifiedBy;
            obj.activity_type = 'Attachment';
            obj.activity_sub_type = 'Document added';
            obj.activity_description = 'Document added to ' + folder.Name;
            obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + file.ServerRelativeUrl;
            items.push(obj);
        
        });
      }
    });
    return items;
  }
  // #endregion

  // #endregion

  // #region sow
  // #region fetch/get data versions
  /**
   * fetches project versions
   */
  async getSowVersions(moduleName, itemID, skipCount, top) {
    const batchSowURL = [];
    let sowBudgetBreakup = [];
    const arrSowReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getSowDataVer = this.getBatchRequest(this.globalConstant.listNames.SOW.name, 'versions',
      this.constant.projectManagement.sow.getVersions, arrSowReplace, moduleName, itemID);
    batchSowURL.push(getSowDataVer);
    const arrSowResult = await this.spStandardService.executeBatch(batchSowURL);
    const sowVersions = arrSowResult.length > 0 ? arrSowResult[0].retItems : [];

    if (sowVersions.length > 0) {
      const batchURL = [];
      const arrSowBBReplace = { '{{SOWCode}}': sowVersions[0].SOWCode };
      const getSOWBudgetBreakupData = this.getBatchRequest(this.globalConstant.listNames.SOWBudgetBreakup.name, 'filterItem',
        this.constant.projectManagement.sowBudgetBreakup.getSOWBudgetBreakupInfo, arrSowBBReplace, moduleName);
      batchURL.push(getSOWBudgetBreakupData);

      const arrResult = await this.spStandardService.executeBatch(batchURL);
      sowBudgetBreakup = arrResult.length > 0 ? arrResult[0] : [];
    }
    const arrReturnResult = [sowVersions, sowBudgetBreakup];
    return arrReturnResult;
  }

  async getSowBudgetBreakupVersions(moduleName, itemID, skipCount, top) {
    const batchSowBBURL = [];
    const arrSowReplace = { '{{skipCount}}': skipCount, '{{top}}': top };
    const getSowDataVer = this.getBatchRequest(this.globalConstant.listNames.SOWBudgetBreakup.name, 'versions',
      this.constant.projectManagement.sowBudgetBreakup.getVersions, arrSowReplace, moduleName, itemID);
    batchSowBBURL.push(getSowDataVer);
    const arrSowResult = await this.spStandardService.executeBatch(batchSowBBURL);
    const sowBBVersions = arrSowResult.length > 0 ? arrSowResult[0].retItems : [];
    const arrReturnResult = [sowBBVersions];
    return arrReturnResult;
  }

  // #endregion

  // #region process/set data for display data
  setSowVersion(arrVersions, arrVersionDifference) {
    const items = [];
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.sowList.columns.PrimaryPOC:
              const currentPOC = this.arrProjectContacts.filter(pc => pc.Id === versionDetail.PrimaryPOC);
              const currentPOCDetail = currentPOC.length > 0 ? currentPOC[0] : { FullName: '' };
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'POC updated';
              obj.activity_description = 'POC updated to ' + currentPOCDetail.FullName;
              break;
            case this.globalConstant.sowList.columns.Title:
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'SOW title updated';
              obj.activity_description = 'SOW title updated to ' + versionDetail.Title;
              break;
            case this.globalConstant.sowList.columns.BusinessVertical:
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'Business vertical updated';
              obj.activity_description = 'Business vertical updated to ' + versionDetail.BusinessVertical;
              break;
            case this.globalConstant.sowList.columns.CreatedDate:
              if (versionDetail.CreatedDate) {
                const createdDate = this.datePipe.transform(new Date(new Date(versionDetail.CreatedDate).toISOString()), 'dd/MM/yy');
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW creation date updated';
                obj.activity_description = 'SOW creation date updated to ' + createdDate;
              }
              break;
            case this.globalConstant.sowList.columns.ExpiryDate:
              if (versionDetail.ExpiryDate) {
                const expiryDate = this.datePipe.transform(new Date(new Date(versionDetail.ExpiryDate).toISOString()), 'dd/MM/yy');
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW expiry date updated';
                obj.activity_description = 'SOW expiry date updated to ' + expiryDate;
              }
              break;
            case this.globalConstant.sowList.columns.Status:
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'SOW Status updated';
              obj.activity_description = 'SOW status Updated to ' + versionDetail.Status;
              break;
            case this.globalConstant.sowList.columns.SOWLink:
              if (versionDetail.SOWLink) {
                let sowListName = this.arrCle.filter(c => c.ClientLegalEntity === versionDetail.ClientLegalEntity);
                sowListName = sowListName.length > 0 ? sowListName[0].ListName : [];
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW updated';
                obj.activity_description = 'SOW document Updated to ' + versionDetail.SOWLink;
                obj.file_uploaded = this.global.sharePointPageObject.serverRelativeUrl + sowListName + '/Finance/SOW/' + versionDetail.SOWLink
              }
              break;
            case this.globalConstant.sowList.columns.BD:
              if (properties.BD) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'BD Updated';
                obj.activity_description = 'BD Updated to ' + properties.BD;
              }
              break;
            case this.globalConstant.sowList.columns.CMLevel1:
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'CM Level 1 Updated';
              obj.activity_description = 'CM Level 1 Updated to ' + properties.CMLevel1;
              break;
            case this.globalConstant.sowList.columns.CMLevel2:
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'CM Level 2 Updated';
              obj.activity_description = 'CM Level 2 Updated to ' + properties.CMLevel2;
              break;
            case this.globalConstant.sowList.columns.DeliveryLevel1:
              if (properties.DeliveryLevel1) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'Delivery Level 1 Updated';
                obj.activity_description = 'Delivery Level 1 Updated to ' + properties.DeliveryLevel1;
              }
              break;
            case this.globalConstant.sowList.columns.DeliveryLevel2:
              obj.activity_type = 'SOW updated';
              obj.activity_sub_type = 'Delivery Level 2 Updated';
              obj.activity_description = 'Delivery Level 2 Updated to ' + properties.DeliveryLevel2;
              break;
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }

  setSowBudgetBreakupVersion(arrVersions, arrVersionDifference) {
    const items = [];
    // fetches top version in an array
    arrVersionDifference.forEach(element => {
      // fetch version detail based on version ID
      const version = arrVersions.filter(v => v.VersionId === element.VersionId);
      const versionDetail = version.length > 0 ? version[0] : {};
      const properties = element.changedProperties;
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const obj = JSON.parse(JSON.stringify(this.objTimelineData));
          obj.date_time = new Date(element.Modified).toISOString();
          obj.activity_by = element.Editor.LookupValue ? element.Editor.LookupValue : element.Editor;
          switch (key) {
            case this.globalConstant.sowBudgetBreakupList.columns.AddendumNetBudget:
              if (versionDetail.AddendumNetBudget) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW net budget added';
                obj.activity_description = 'SOW net budget added with ' + versionDetail.AddendumNetBudget;
              }
              break;
            case this.globalConstant.sowBudgetBreakupList.columns.AddendumOOPBudget:
              if (versionDetail.AddendumOOPBudget) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW oop budget added';
                obj.activity_description = 'SOW oop budget added with ' + versionDetail.AddendumOOPBudget;
              }
              break;
            case this.globalConstant.sowBudgetBreakupList.columns.AddendumTaxBudget:
              if (versionDetail.AddendumTaxBudget) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW tax budget added';
                obj.activity_description = 'SOW tax budget added with ' + versionDetail.AddendumTaxBudget;
              }
              break;
            case this.globalConstant.sowBudgetBreakupList.columns.NetBudget:
              if (versionDetail.NetBudget) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'SOW net budget updated';
                obj.activity_description = 'Updated sow net budget is ' + versionDetail.NetBudget;
              }
              break;
            case this.globalConstant.sowBudgetBreakupList.columns.OOPBudget:
              if (versionDetail.OOPBudget) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'Business vertical updated';
                obj.activity_description = 'Updated sow oop budget is ' + versionDetail.OOPBudget;
              }
              break;
            case this.globalConstant.sowBudgetBreakupList.columns.TaxBudget:
              if (versionDetail.TaxBudget) {
                obj.activity_type = 'SOW updated';
                obj.activity_sub_type = 'Business vertical updated';
                obj.activity_description = 'Updated sow tax budget is ' + versionDetail.TaxBudget;
              }
              break;
          }
          if (obj.activity_type) {
            items.push(obj);
          }
        }
      }
    });
    return items;
  }
  // #endregion

  // #endregion

}
