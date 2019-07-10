import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
@Component({
  selector: 'app-finance-management',
  templateUrl: './finance-management.component.html',
  styleUrls: ['./finance-management.component.css']
})
export class FinanceManagementComponent implements OnInit, OnChanges {
  @Output() dataEvent = new EventEmitter<string>();
  @Input() manageData: any;
  po: any = [];
  poInfo: any = [];
  isPOTableHidden = true;
  budgetHoursSection = false;
  isManageFinanceLoaderHidden = false;
  budgetTotal = 0;
  budgetNet = 0;
  budgetOOP = 0;
  budgetTax = 0;
  poData = [];
  budgetData = [];
  milestoneArray = [];
  taskArray = [];
  public selectedActiveCM1;
  public selectedActiveCM2;
  public selectedActiveAD1;
  public selectedActiveAD2;
  public budgethours;
  public rate;
  selectedFile;
  fileReader;
  filePathUrl: any;
  constructor(
    public pmObject: PMObjectService,
    private pmConstant: PmconstantService,
    private constant: ConstantsService,
    private spServices: SPOperationService,
    private globalObject: GlobalService,
    private pmCommon: PMCommonService,
    public messageService: MessageService,
    private router: Router
  ) { }
  ngOnInit() {
    setTimeout(() => {
      this.setHeaderColumn();
      this.budgethours = this.pmObject.addProject.Timeline.Standard.IsStandard ?
        this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours :
        this.pmObject.addProject.Timeline.NonStandard.ProjectBudgetHours;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.budgethours;
    }, this.pmConstant.TIME_OUT);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.manageData && this.manageData.length) {
      this.isPOTableHidden = false;
      this.budgetHoursSection = true;
      this.budgetData = this.manageData[0].budget;
      this.poData = this.manageData[0].PO;
    }
  }
  setHeaderColumn() {
    this.po = [
      { field: 'total', header: 'Total' },
      { field: 'revenue', header: 'Revenue' },
      { field: 'oop', header: 'OOP' },
      { field: 'tax', header: 'Tax' },
    ];
    this.poInfo = [
      { field: 'inv_number', header: 'Inv Number' },
      { field: 'prf_number', header: 'Prf Number' },
      { field: 'date', header: 'Date' },
      { field: 'amount', header: 'Amount' },
      { field: 'type', header: 'Type' },
      { field: 'status', header: 'Status' },
      { field: 'poc', header: 'POC' },
      { field: 'address', header: 'Address' },
    ];
  }
  goToTimeline() {
    this.pmObject.activeIndex = 2;
  }
  showPOTable() {
    this.dataEvent.emit('true');
  }
  /**
   * This method is used to save project.
   */
  saveProject() {
    // verify the project code.
    this.pmObject.isMainLoaderHidden = false;
    setTimeout(() => {
      this.validateAndSave();
    }, this.pmConstant.TIME_OUT);

  }
  async validateAndSave() {
    const isFormValid = this.validateForm();
    if (isFormValid) {
      const newProjectCode = await this.verifyAndUpdateProjectCode();
      this.pmObject.addProject.ProjectAttributes.ProjectCode = newProjectCode;
      if (newProjectCode) {
        if (this.selectedFile) {
          const fileUploadResult = await this.pmCommon.submitFile(this.selectedFile, this.fileReader);
          if (fileUploadResult.hasOwnProperty('ServerRelativeUrl')) {
            this.pmObject.addSOW.isSOWCodeDisabled = false;
            this.pmObject.addSOW.isStatusDisabled = true;
          }
        }
        await this.addUpdateProject();
      }
    }
  }
  /**
   * This method is used to validate the form field
   */
  validateForm() {
    if (!this.pmObject.addProject.FinanceManagement.POArray.length) {
      this.messageService.add({
        key: 'custom', severity: 'error',
        summary: 'Error Message', detail: 'Please assign budget / rate for project'
      });
      return false;
    }
    return true;
  }
  /**
   * This method is used to verify the project code.
   */
  async verifyAndUpdateProjectCode() {
    let projectCode = this.pmObject.addProject.ProjectAttributes.ProjectCode;
    let currenValue = 0;
    let Id = -1;
    const codeSplit = projectCode.split('-');
    const codeValue = codeSplit[2];
    const year = codeValue.substring(0, 2);
    const oCurrentDate = new Date();
    let sYear = oCurrentDate.getFullYear();
    sYear = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;
    const contentFilter = Object.assign({}, this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR);
    // tslint:disable-next-line:max-line-length
    contentFilter.filter = contentFilter.filter.replace(/{{Id}}/gi, sYear.toString());
    const sResults = await this.spServices.readItems(this.constant.listNames.ProjectPerYear.name, contentFilter);
    if (sResults && sResults.length) {
      currenValue = parseInt(sResults[0].Count, 10);
      Id = sResults[0].ID;
      currenValue += 1;
      let currentCount = '000' + currenValue;
      currentCount = currentCount.substring(currentCount.length - 4);
      codeSplit[2] = year + currentCount;
      projectCode = codeSplit.join('-');
      const projectYearOptions = {
        Count: currenValue
      };
      await this.spServices.updateItem(this.constant.listNames.ProjectPerYear.name, Id, projectYearOptions,
        this.constant.listNames.ProjectPerYear.type);
      return projectCode;
    }
  }

  /**
   * This function is used to add and Update the project.
   */
  async addUpdateProject() {
    const batchURL = [];
    let counter = 0;
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Create Main Summary Call ## 15
    const summaryObj = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      Title: this.pmObject.addProject.ProjectAttributes.ProjectCode,
      FileSystemObjectType: 1,
      ContentTypeId: '0x0120'
    };
    const createSummaryObj = Object.assign({}, options);
    createSummaryObj.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
    createSummaryObj.data = summaryObj;
    createSummaryObj.type = 'POST';
    createSummaryObj.listName = this.constant.listNames.Schedules.name;
    batchURL.push(createSummaryObj);
    counter += 1;
    // Create Folder Call ## 1 - 14
    const folderArray = this.createFolderArray(this.pmObject.addProject.ProjectAttributes.ClientLegalEntity,
      this.pmObject.addProject.ProjectAttributes.ProjectCode);
    folderArray.forEach(element => {
      const data = {
        __metadata: { type: 'SP.Folder' },
        ServerRelativeUrl: element
      };
      const createForderObj = Object.assign({}, options);
      createForderObj.data = data;
      createForderObj.listName = element;
      createForderObj.type = 'POST';
      createForderObj.url = this.spServices.getFolderCreationURL();
      counter += 1;
      batchURL.push(createForderObj);
    });
    // Add data to ProjectInformation call ##16
    const projectInformationData = this.pmCommon.getProjectData(this.pmObject.addProject, true);
    const projectCreate = Object.assign({}, options);
    projectCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectInformation.name, null);
    projectCreate.data = projectInformationData;
    projectCreate.type = 'POST';
    projectCreate.listName = this.constant.listNames.ProjectInformation.name;
    batchURL.push(projectCreate);
    counter += 1;
    // Add data to ProjectFinances call ##17
    const projectFinanceData = this.getProjectFinancesData();
    const projectFinanceCreate = Object.assign({}, options);
    projectFinanceCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinances.name, null);
    projectFinanceCreate.data = projectFinanceData;
    projectFinanceCreate.type = 'POST';
    projectFinanceCreate.listName = this.constant.listNames.ProjectFinances.name;
    batchURL.push(projectFinanceCreate);
    counter += 1;
    // Add data to projectFinanceBreakup call ##18
    const projectFinanceBreakArray = this.getProjectFinanceBreakupData();
    projectFinanceBreakArray.forEach(element => {
      const projectFinanceBreakupCreate = Object.assign({}, options);
      projectFinanceBreakupCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectFinanceBreakup.name, null);
      projectFinanceBreakupCreate.data = element;
      projectFinanceBreakupCreate.type = 'POST';
      projectFinanceBreakupCreate.listName = this.constant.listNames.ProjectFinanceBreakup.name;
      batchURL.push(projectFinanceBreakupCreate);
      counter += 1;
    });
    if (this.pmObject.addProject.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.DELIVERABLE) {
      //  Add data to  InvoiceLineItem call ## 19
      const invoiceLineItemArray = this.getInvoiceLineItemData();
      invoiceLineItemArray.forEach(element => {
        const createForderObj: any = Object.assign({}, options);
        createForderObj.url = this.spServices.getReadURL(this.constant.listNames.InvoiceLineItems.name, null);
        createForderObj.data = element;
        createForderObj.listName = this.constant.listNames.InvoiceLineItems.name;
        createForderObj.type = 'POST';
        batchURL.push(createForderObj);
        counter += 1;
      });
      // Add data to  SOWItem call ## 20
      const sowItemData = this.getSowItemData(projectFinanceData);
      const selectSOWItem: any = this.pmObject.addProject.SOWSelect.SOWSelectedItem;
      const sowItemCreate = Object.assign({}, options);
      sowItemCreate.url = this.spServices.getItemURL(this.constant.listNames.SOW.name, selectSOWItem.ID);
      sowItemCreate.data = sowItemData;
      sowItemCreate.type = 'PATCH';
      sowItemCreate.listName = this.constant.listNames.SOW.name;
      batchURL.push(sowItemCreate);
      counter += 1;
      // Add data to POItem call ## 21
      const poItemArray = this.getPoItemData(projectFinanceBreakArray);
      poItemArray.forEach(element => {
        const poItemCreate = Object.assign({}, options);
        poItemCreate.url = this.spServices.getItemURL(this.constant.listNames.PO.name, element.ID);
        poItemCreate.data = element;
        poItemCreate.type = 'PATCH';
        poItemCreate.listName = this.constant.listNames.PO.name;
        batchURL.push(poItemCreate);
      });
    }
    const res = await this.spServices.executeBatch(batchURL);
    console.log(res);
    if (res && res.length) {
      await this.addItemToScheduleList(res);
    }
  }
  /**
   * This method is used to create the folder url based on clientlegal entity and projectcode.
   * @param ClientLegalEnity pass the clientlegalentity.
   * @param projectCode pass the project code.
   */
  createFolderArray(ClientLegalEnity, projectCode) {
    const arrFolders = [
      ClientLegalEnity + '/' + projectCode,
      ClientLegalEnity + '/' + projectCode + '/Communications',
      ClientLegalEnity + '/' + projectCode + '/Drafts',
      ClientLegalEnity + '/' + projectCode + '/Emails',
      ClientLegalEnity + '/' + projectCode + '/Graphics',
      ClientLegalEnity + '/' + projectCode + '/Miscellaneous',
      ClientLegalEnity + '/' + projectCode + '/Publication Support',
      ClientLegalEnity + '/' + projectCode + '/References',
      ClientLegalEnity + '/' + projectCode + '/Source Documents',
      ClientLegalEnity + '/' + projectCode + '/Drafts/Client',
      ClientLegalEnity + '/' + projectCode + '/Drafts/Internal',
      ClientLegalEnity + '/' + projectCode + '/Publication Support/Author List Emails',
      ClientLegalEnity + '/' + projectCode + '/Publication Support/Forms',
      ClientLegalEnity + '/' + projectCode + '/Publication Support/Published Papers'
    ];
    return arrFolders;
  }
  /**
   * This function is used to set the projectfinanaces object
   */
  getProjectFinancesData() {
    const addObj = this.pmObject.addProject;
    const billingEntitys = this.pmObject.oProjectCreation.oProjectInfo.billingEntity;
    const billingEntity = billingEntitys.filter(x => x.Title === this.pmObject.addProject.ProjectAttributes.BillingEntity);
    const budgetArray = this.pmObject.addProject.FinanceManagement.BudgetArray;
    const poArray = this.pmObject.addProject.FinanceManagement.POArray;
    let invoiceSc = 0;
    let scRevenue = 0;
    let invoice = 0;
    let invoiceRevenue = 0;
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.NOT_STARTED) {
          invoiceSc = element.amount;
          scRevenue = element.amount;
        }
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice = element.amount;
          invoiceRevenue = element.amount;
        }
      });
    });
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectFinances.type },
      Title: addObj.ProjectAttributes.ProjectCode,
      Realization: '50',
      Template: billingEntity && billingEntity.length ? billingEntity[0].InvoiceTemplate : '',
      Currency: addObj.FinanceManagement.Currency,
      BudgetHrs: addObj.FinanceManagement.BudgetHours
    };
    if (addObj.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY) {
      data.Budget = addObj.FinanceManagement.Rate;
      data.OOPBudget = 0;
      data.RevenueBudget = 0,
        data.TaxBudget = 0;
      data.InvoicesScheduled = 0;
      data.ScheduledRevenue = 0;
      data.Invoiced = 0;
      data.InvoicedRevenue = 0;
    } else {
      data.Budget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.RevenueBudget = budgetArray[0].revenue,
        data.TaxBudget = budgetArray[0].tax;
      data.InvoicesScheduled = invoiceSc;
      data.ScheduledRevenue = scRevenue;
      data.Invoiced = invoice;
      data.InvoicedRevenue = invoiceRevenue;
    }
    return data;
  }
  /**
   * This function is used to set the projectBudgetBreakup object
   */
  getProjectBudgetBreakupData(res) {
    const addObj = this.pmObject.addProject;
    const budgetArray = this.pmObject.addProject.FinanceManagement.BudgetArray;
    const data: any = {
      __metadata: { type: this.constant.listNames.ProjectBudgetBreakup.type },
      ProjectCode: addObj.ProjectAttributes.ProjectCode,
      ProjectLookup: res[15].retItems.ID,
      Status: this.constant.STATUS.APPROVAL_PENDING,
      BudgetHours: addObj.FinanceManagement.BudgetHours
    };
    if (addObj.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY) {
      data.OriginalBudget = 0;
      data.OOPBudget = 0;
      data.NetBudget = 0;
      data.TaxBudget = 0;
    } else {
      data.OriginalBudget = budgetArray[0].total;
      data.OOPBudget = budgetArray[0].oop;
      data.NetBudget = budgetArray[0].revenue;
      data.TaxBudget = budgetArray[0].tax;
    }
    return data;
  }
  /**
   * This function is used to set the projectFinanceBreakup object
   */
  getProjectFinanceBreakupData() {
    const addObj = this.pmObject.addProject;
    const poArray = this.pmObject.addProject.FinanceManagement.POArray;
    const pfbArray = [];
    poArray.forEach((poInfoObj) => {
      let totalScheduled = 0;
      let scRevenue = 0;
      let invoice = 0;
      let invoiceRevenue = 0;
      const po = poInfoObj.poInfo[0];
      poInfoObj.poInfoData.forEach(element => {
        if (element.status === this.constant.STATUS.NOT_STARTED) {
          totalScheduled += element.amount;
          scRevenue += element.amount;
        }
        if (element.status === this.constant.STATUS.APPROVED) {
          invoice += element.amount;
          invoiceRevenue += element.amount;
        }
      });
      const data: any = {
        __metadata: { type: this.constant.listNames.ProjectFinanceBreakup.type },
        ProjectNumber: addObj.ProjectAttributes.ProjectCode,
        POLookup: po.poId
      };
      if (addObj.ProjectAttributes.BilledBy === this.pmConstant.PROJECT_TYPE.HOURLY) {
        data.Amount = 0;
        data.AmountRevenue = 0;
        data.AmountOOP = 0;
        data.AmountTax = 0;
        data.TotalScheduled = 0;
        data.ScheduledRevenue = 0;
        data.TotalInvoiced = 0;
        data.InvoicedRevenue = 0;
      } else {
        data.Amount = po.total;
        data.AmountRevenue = po.revenue;
        data.AmountOOP = po.oop;
        data.AmountTax = po.tax;
        data.TotalScheduled = totalScheduled;
        data.ScheduledRevenue = scRevenue;
        data.TotalInvoiced = invoice;
        data.InvoicedRevenue = invoiceRevenue;
      }
      pfbArray.push(data);
    });
    return pfbArray;
  }
  /**
   * This method is used to get the Invoice line item object.
   */
  getInvoiceLineItemData() {
    const addObj = this.pmObject.addProject;
    const invoiceArray = [];
    const CSIdArray = [];
    addObj.ProjectAttributes.ActiveCM1.forEach(cm => {
      CSIdArray.push(cm);
    });
    CSIdArray.push(addObj.ProjectAttributes.ActiveCM2);
    const poArray = this.pmObject.addProject.FinanceManagement.POArray;
    const billingEntitys = this.pmObject.oProjectCreation.oProjectInfo.billingEntity;
    const billingEntity = billingEntitys.filter(x => x.Title === this.pmObject.addProject.ProjectAttributes.BillingEntity);
    poArray.forEach((poInfoObj) => {
      poInfoObj.poInfoData.forEach(element => {
        const data: any = {
          __metadata: { type: this.constant.listNames.InvoiceLineItems.type },
          Title: addObj.ProjectAttributes.ProjectCode,
          ScheduledDate: element.date,
          Amount: element.amount,
          Currency: addObj.FinanceManagement.Currency,
          PO: element.poId,
          Status: element.status === 'Not Saved' ? 'Sheduled' : element.status,
          ScheduleType: element.type,
          MainPOC: element.poc,
          AddressType: element.address,
          Template: billingEntity && billingEntity.length ? billingEntity[0].InvoiceTemplate : '',
          SOWCode: addObj.SOWSelect.SOWCode,
          CSId: {
            results: CSIdArray
          },
        };
        if (element.status === this.constant.STATUS.APPROVED) {
          data.ProformaLookup = element.proformaLookup;
          data.InvoiceLookup = element.invoiceLookup;
        }
        invoiceArray.push(data);
      });
    });
    return invoiceArray;
  }
  getSowItemData(projectfinaceObj) {
    const sowObj: any = this.pmObject.addProject.SOWSelect.SOWSelectedItem;
    const data = {
      __metadata: { type: this.constant.listNames.SOW.type },
      TotalLinked: sowObj.TotalLinked + projectfinaceObj.Budget,
      RevenueLinked: sowObj.RevenueLinked + projectfinaceObj.RevenueBudget,
      OOPLinked: sowObj.OOPLinked + projectfinaceObj.OOPBudget,
      TaxLinked: sowObj.TaxLinked + projectfinaceObj.TaxBudget,
      TotalScheduled: sowObj.TotalScheduled + projectfinaceObj.InvoicesScheduled,
      ScheduledRevenue: sowObj.ScheduledRevenue + projectfinaceObj.ScheduledRevenue,
      TotalInvoiced: sowObj.TotalInvoiced + projectfinaceObj.Invoiced,
      InvoicedRevenue: sowObj.InvoicedRevenue + projectfinaceObj.InvoicedRevenue,
    };
    return data;
  }
  getPoItemData(financeBreakupArray) {
    const porray = [];
    const poArray = this.pmObject.addProject.FinanceManagement.POListArray;
    financeBreakupArray.forEach(element => {
      const poItem = poArray.filter(poObj => poObj.ID === element.POLookup);
      if (poItem && poItem.length) {
        const data = {
          __metadata: { type: this.constant.listNames.PO.type },
          TotalLinked: poItem[0].TotalLinked + element.Amount,
          RevenueLinked: poItem[0].RevenueLinked + element.AmountRevenue,
          OOPLinked: poItem[0].OOPLinked + element.AmountOOP,
          TaxLinked: poItem[0].TaxLinked + element.AmountTax,
          TotalScheduled: poItem[0].TotalScheduled + element.TotalScheduled,
          ScheduledRevenue: poItem[0].ScheduledRevenue + element.ScheduledRevenue,
          ID: element.POLookup
        };
        porray.push(data);
      }
    });
    return porray;
  }
  /**
   * This method is called when file is selected
   * @param event file
   */
  onFileChange(event) {
    this.selectedFile = null;
    this.fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.fileReader.readAsArrayBuffer(this.selectedFile);
    }
  }
  async addItemToScheduleList(response) {
    let batchResults = [];
    this.milestoneArray = [];
    this.taskArray = [];
    let batchURL = [];
    let finalArray = [];
    let counter = 0;
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // create the projectBugetBreakup after project informations items created.
    const projectBudgetBreakupData = this.getProjectBudgetBreakupData(response);
    const projectBudgetBreakupCreate = Object.assign({}, options);
    projectBudgetBreakupCreate.url = this.spServices.getReadURL(this.constant.listNames.ProjectBudgetBreakup.name, null);
    projectBudgetBreakupCreate.data = projectBudgetBreakupData;
    projectBudgetBreakupCreate.type = 'POST';
    projectBudgetBreakupCreate.listName = this.constant.listNames.ProjectBudgetBreakup.name;
    batchURL.push(projectBudgetBreakupCreate);
    // This call is used to rename the ProjectCode.
    const projectCodeMoveUrl = this.globalObject.sharePointPageObject.webAbsoluteUrl +
      '/_api/Web/Lists/getByTitle(\'' + this.constant.listNames.Schedules.name + '\')/Items' +
      '(' + response[0].retItems.ID + ')';
    const projectCodeMoveData = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      FileLeafRef: response[0].retItems.Title
    };
    const moveMilewithDataObj = Object.assign({}, options);
    moveMilewithDataObj.url = projectCodeMoveUrl;
    moveMilewithDataObj.data = projectCodeMoveData;
    moveMilewithDataObj.type = 'PATCH';
    moveMilewithDataObj.listName = this.constant.listNames.Schedules.name;
    batchURL.push(moveMilewithDataObj);
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      const milestones = this.pmObject.addProject.Timeline.Standard.standardArray;
      const projectCode = this.pmObject.addProject.ProjectAttributes.ProjectCode;
      for (let milestoneIndex = 0; milestoneIndex < milestones.length; milestoneIndex = milestoneIndex + 2) {
        if (batchURL.length < 100) {
          const milestoneObj = milestones[milestoneIndex];
          this.milestoneArray.push(milestoneObj.data);
          const milestonedata = this.getMilestoneData(milestoneObj, projectCode);
          const milestoneCreate = Object.assign({}, options);
          milestoneCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
          milestoneCreate.data = milestonedata;
          milestoneCreate.type = 'POST';
          milestoneCreate.listName = this.constant.listNames.Schedules.name;
          counter += 1;
          batchURL.push(milestoneCreate);
          // create the milestone folder.
          const milestoneFolderBody = {
            __metadata: { type: 'SP.Folder' },
            ServerRelativeUrl: response[11].listName + '/' + milestoneObj.data.Name
          };
          const createForderObj = Object.assign({}, options);
          createForderObj.data = milestoneFolderBody;
          // createForderObj.listName = element;
          createForderObj.type = 'POST';
          createForderObj.url = this.spServices.getFolderCreationURL();
          counter += 1;
          batchURL.push(createForderObj);

          if (milestoneObj.SubMilestones) {
            // tslint:disable-next-line:prefer-for-of
            for (let subMilestoneIndex = 0; subMilestoneIndex < milestoneObj.children.length; subMilestoneIndex++) {
              const submilestone = milestoneObj.children[subMilestoneIndex];
              // tslint:disable-next-line:forin
              for (const taskIndex in submilestone.children) {
                const task = submilestone.children[taskIndex];
                this.taskArray.push(task.data);
                const taskdata = this.getTaskData(task, projectCode, milestoneObj, submilestone);
                const taskCreate = Object.assign({}, options);
                taskCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
                taskCreate.data = taskdata;
                taskCreate.type = 'POST';
                taskCreate.listName = this.constant.listNames.Schedules.name;
                counter += 1;
                batchURL.push(taskCreate);
              }
            }
          } else {
            // tslint:disable-next-line:forin
            for (const taskIndex in milestoneObj.children) {
              const task = milestoneObj.children[taskIndex];
              this.taskArray.push(task.data);
              const taskdata = this.getTaskData(task, projectCode, milestoneObj, null);
              const taskCreate = Object.assign({}, options);
              taskCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
              taskCreate.data = taskdata;
              taskCreate.type = 'POST';
              taskCreate.listName = this.constant.listNames.Schedules.name;
              counter += 1;
              batchURL.push(taskCreate);
            }
          }
          const taskObj = milestones[milestoneIndex + 1];
          taskObj.data.Hours = 0;
          taskObj.data.UseTaskDays = 'Yes';
          taskObj.data.TaskDays = taskObj.data.Days;
          taskObj.data.TaskName = taskObj.data.Name;
          taskObj.data.Task = taskObj.data.Name;
          taskObj.data.NextTasks = '';
          taskObj.data.PrevTasks = projectCode + ' ' + milestoneObj.MilestoneName + ' SC';
          taskObj.data.Skill = 'CS';
          taskObj.data.assignedUserTimeZone = (new Date()).getTimezoneOffset() / 60 * -1;
          taskObj.data.userId = this.globalObject.sharePointPageObject.userId;
          const crData = this.getTaskData(taskObj, projectCode, milestoneObj, null);
          const crCreate = Object.assign({}, options);
          crCreate.url = this.spServices.getReadURL(this.constant.listNames.Schedules.name, null);
          crCreate.data = crData;
          crCreate.type = 'POST';
          crCreate.listName = this.constant.listNames.Schedules.name;
          counter += 1;
          batchURL.push(crCreate);
          if (batchURL.length === 99) {
            batchResults = await this.spServices.executeBatch(batchURL);
            console.log(batchResults);
            finalArray = [...finalArray, ...batchResults];
            batchURL = [];
          }
        }
      }
    } else {
      batchResults = await this.spServices.executeBatch(batchURL);
      finalArray = [...finalArray, ...batchResults];
    }
    this.moveMilestoneAndTask(finalArray);
  }
  async moveMilestoneAndTask(results) {
    if (results && results.length && this.pmObject.addProject.Timeline.Standard.IsStandard) {
      let batchURL = [];
      let batchResults = [];
      let finalArray = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      for (const response of results) {
        if (batchURL.length < 100) {
          const fileUrl = this.globalObject.sharePointPageObject.webAbsoluteUrl +
            '/Lists/' + this.constant.listNames.Schedules.name + '/' + response.retItems.ID + '_.000';
          let moveFileUrl = this.globalObject.sharePointPageObject.webAbsoluteUrl +
            '/Lists/' + this.constant.listNames.Schedules.name + '/' +
            this.pmObject.addProject.ProjectAttributes.ProjectCode;
          if (response.retItems.Milestone === 'Select one') {
            moveFileUrl = moveFileUrl + '/' + response.retItems.ID + '_.000';
            const milestoneURL = this.globalObject.sharePointPageObject.webAbsoluteUrl +
              '/_api/Web/Lists/getByTitle(\'' + this.constant.listNames.Schedules.name + '\')/Items' +
              '(' + response.retItems.ID + ')';
            const moveData = {
              __metadata: { type: this.constant.listNames.Schedules.type },
              FileLeafRef: response.retItems.Title
            };
            const url = this.globalObject.sharePointPageObject.webAbsoluteUrl +
              '/_api/web/getfolderbyserverrelativeurl(\'' + fileUrl + '\')/moveto(newurl=\'' + moveFileUrl + '\')';
            const moveMileObj = Object.assign({}, options);
            moveMileObj.url = url;
            moveMileObj.type = 'POST';
            moveMileObj.listName = this.constant.listNames.Schedules.name;
            batchURL.push(moveMileObj);
            const moveMilewithDataObj = Object.assign({}, options);
            moveMilewithDataObj.url = milestoneURL;
            moveMilewithDataObj.data = moveData;
            moveMilewithDataObj.type = 'PATCH';
            moveMilewithDataObj.listName = this.constant.listNames.Schedules.name;
            batchURL.push(moveMilewithDataObj);
          } else {
            moveFileUrl = moveFileUrl + '/' + response.retItems.Milestone + '/' + response.retItems.ID + '_.000';
            const url = this.globalObject.sharePointPageObject.webAbsoluteUrl +
              '/_api/web/getfilebyserverrelativeurl(\'' + fileUrl + '\')/moveto(newurl=\'' + moveFileUrl + '\',flags=1)';
            const moveTaskObj = Object.assign({}, options);
            moveTaskObj.url = url;
            moveTaskObj.type = 'POST';
            moveTaskObj.listName = this.constant.listNames.Schedules.name;
            batchURL.push(moveTaskObj);
          }
          if (batchURL.length === 99) {
            batchResults = await this.spServices.executeBatch(batchURL);
            console.log(batchResults);
            finalArray = [...finalArray, ...batchResults];
            batchURL = [];
          }
        }
      }
    }
    this.pmObject.isMainLoaderHidden = true;
    this.messageService.add({
      key: 'custom', severity: 'success', summary: 'Success Message',
      detail: 'Project Created Successfully - ' + this.pmObject.addProject.ProjectAttributes.ProjectCode
    });
    setTimeout(() => {
      this.pmObject.isAddProjectVisible = false;
      this.router.navigate(['/projectMgmt/allProjects']);
    }, this.pmConstant.TIME_OUT);
  }
  /**
   * This function is used to get the milestone obj.
   * @param milestoneObj milestone object
   * @param projectCode projectcode.
   */
  getMilestoneData(mileobj, projectCode) {
    const milestoneObj = mileobj.data;
    const data = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      Actual_x0020_Start_x0020_Date: milestoneObj.StartDate,
      Actual_x0020_End_x0020_Date: milestoneObj.EndDate,
      StartDate: milestoneObj.StartDate,
      DueDate: milestoneObj.EndDate,
      ExpectedTime: '' + milestoneObj.Hours,
      Status: this.constant.STATUS.NOT_CONFIRMED,
      TATBusinessDays: milestoneObj.Days,
      ProjectCode: projectCode,
      Title: milestoneObj.Name,
      FileSystemObjectType: 1,
      ContentTypeId: '0x0120',
      SubMilestones: milestoneObj.strSubMilestone
    };
    return data;
  }
  /**
   * This function is ued to get the task obj.
   * @param task task object
   * @param projectCode projectcode.
   */
  getTaskData(milestoneTask, projectCode, milestoneObj, subMilestoneObj) {
    milestoneTask = milestoneTask.data;
    milestoneTask.taskExist = true;
    const startDate = this.pmCommon.calcTimeForDifferentTimeZone(milestoneTask.StartDate,
      milestoneTask.assignedUserTimeZone, (new Date()).getTimezoneOffset() / 60 * -1);
    const endDate = this.pmCommon.calcTimeForDifferentTimeZone(milestoneTask.EndDate,
      milestoneTask.assignedUserTimeZone, (new Date()).getTimezoneOffset() / 60 * -1);
    const data: any = {
      __metadata: { type: this.constant.listNames.Schedules.type },
      StartDate: startDate,
      DueDate: endDate,
      ExpectedTime: '' + milestoneTask.Hours,
      TimeZone: '' + milestoneTask.assignedUserTimeZone,
      AllowCompletion: 'No',
      TATStatus: milestoneTask.UseTaskDays,
      TATBusinessDays: milestoneTask.TaskDays,
      Status: this.constant.STATUS.NOT_CONFIRMED,
      SubMilestones: milestoneTask.SubMilestone,
      Title: projectCode + ' ' + milestoneObj.MilestoneName + ' ' + milestoneTask.TaskName.replace('Send to client', 'SC'),
      ProjectCode: projectCode,
      Task: milestoneTask.Task,
      Milestone: milestoneObj.MilestoneName,
      SkillLevel: milestoneTask.Skill,
    };
    if (milestoneTask.userId > 0) {
      data.AssignedToId = milestoneTask.userId;
    }
    if (milestoneTask.Task === 'Send to client') {
      data.AssignedToId = this.globalObject.sharePointPageObject.userId;
    }
    if (milestoneTask.hasOwnProperty('PreviousTask')) {
      let sNextTask = '';
      let sPrevTask = '';
      let arrTask;
      if (milestoneObj.SubMilestones) {
        arrTask = subMilestoneObj.children.filter((obj) => {
          return obj.data.PreviousTask.indexOf(milestoneTask.Title) > -1;
        });
      } else {
        arrTask = milestoneObj.children.filter((obj) => {
          return obj.data.PreviousTask.indexOf(milestoneTask.Title) > -1;
        });
      }
      if (arrTask.length) {
        for (const oTask of arrTask) {
          sNextTask = sNextTask ?
            sNextTask + ';#' + projectCode + ' ' + milestoneObj.MilestoneName + ' ' + oTask.data.TaskName.replace('Send to client', 'SC')
            : projectCode + ' ' + milestoneObj.MilestoneName + ' ' + oTask.data.TaskName.replace('Send to client', 'SC');
        }
      } else {
        if (milestoneTask.Task === 'Send to client') {
          sNextTask = projectCode + ' ' + milestoneObj.MilestoneName + ' ' + 'Client Review';
        }
      }
      const arrPrevTasks = milestoneTask.PreviousTask;
      for (const sPrev of arrPrevTasks) {
        let arrTasks;
        if (milestoneObj.SubMilestones) {
          arrTasks = subMilestoneObj.children.filter((obj) => {
            return obj.data.Title === sPrev;
          });
        } else {
          arrTasks = milestoneObj.children.filter((obj) => {
            return obj.data.Title === sPrev;
          });
        }
        if (arrTasks.length) {
          sPrevTask = sPrevTask ? sPrevTask + ';#' + projectCode + ' ' + milestoneObj.MilestoneName + ' ' + arrTasks[0].data.TaskName
            : projectCode + ' ' + milestoneObj.MilestoneName + ' ' + arrTasks[0].data.TaskName;
        }
      }
      data.NextTasks = sNextTask;
      data.PrevTasks = sPrevTask;
    } else {
      data.NextTasks = milestoneTask.NextTasks;
      data.PrevTasks = milestoneTask.PrevTasks;
    }
    if (milestoneTask.Skill === 'Editor' || milestoneTask.Skill === 'QC' || milestoneTask.Skill === 'Graphics') {
      const clientLegal = this.pmObject.oProjectCreation.oProjectInfo.clientLegalEntities.filter(x =>
        x.Title === this.pmObject.addProject.ProjectAttributes.ClientLegalEntity);
      if (clientLegal && clientLegal.length && clientLegal[0].IsCentrallyAllocated === 'Yes') {
        data.IsCentrallyAllocated = 'Yes';
      } else {
        data.IsCentrallyAllocated = 'No';
      }
    } else {
      data.IsCentrallyAllocated = 'No';
    }
    return data;
  }
}
