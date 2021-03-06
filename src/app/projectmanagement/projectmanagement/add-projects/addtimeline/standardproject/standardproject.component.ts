import { Component, OnInit, NgZone, ViewEncapsulation, ViewChild } from '@angular/core';
import { TreeNode, SelectItemGroup, MenuItem } from 'primeng/api';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { GlobalService } from 'src/app/Services/global.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AddTimelineComponent } from '../addtimeline.component';
import { DatePipe } from '@angular/common';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
import { PMCommonService } from 'src/app/projectmanagement/services/pmcommon.service';
import { Router } from '@angular/router';
import { DataService } from 'src/app/Services/data.service';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { CommonService } from 'src/app/Services/common.service';
import { DialogService, DynamicDialogRef } from 'primeng';
import { IDailyAllocationTask } from 'src/app/shared/pre-stack-allocation/interface/prestack';
import { PreStackAllocationComponent } from 'src/app/shared/pre-stack-allocation/pre-stack-allocation.component';
import { AllocationOverlayComponent } from 'src/app/shared/pre-stack-allocation/allocation-overlay/allocation-overlay.component';
import { TaskAllocationCommonService } from 'src/app/task-allocation/services/task-allocation-common.service';
import { PreStackcommonService } from 'src/app/shared/pre-stack-allocation/service/pre-stackcommon.service';

declare var $;
@Component({
  selector: 'app-standardproject',
  templateUrl: './standardproject.component.html',
  styleUrls: ['./standardproject.component.css'],
  providers: [DialogService, UsercapacityComponent, DynamicDialogRef,
    PreStackAllocationComponent, AllocationOverlayComponent],
  encapsulation: ViewEncapsulation.None
})
export class StandardprojectComponent implements OnInit {
  public deliverableType: string;
  @ViewChild('InitialUserCapacity', { static: true }) userCapacity: UsercapacityComponent;
  public minProposedDate;
  public serviceId;
  public reviewerId;
  public resourceId;
  private sharedTaskAllocateObj = this.pmObject.oTaskAllocation;
  public standardServices = [];
  registerStandardServices = [];
  public skillTypes: SelectItemGroup[];
  registerSkillTypes = [];
  public skillTypesArray = [];
  public reviewerList: SelectItemGroup[];
  public reviewerListArray = [];
  registerReviewerList = [];
  public userProperties;
  public allMilestoneTask = [];
  public allTasks = [];
  public isStandardLoaderHidden = false;
  public isStandardTableHidden = true;
  public isStandardFetchTableHidden = true;
  public standardMilestone = {
    milestones: [],
  };
  public selectedSkillObject = {
    Title: '',
    value: {
      userType: '',
    },
    TimeZone: {
      Title: ''
    },
    SkillLevel: {
      Title: ''
    }
  };
  public selectedResourceObject = {
    Title: '',
    value: {
      userType: '',
    },
    TimeZone: {
      Title: ''
    },
    SkillLevel: {
      Title: ''
    }
  };
  public isServiceDisabled = false;
  public isResourceDisabled = false;
  public isReviewerDisabled = false;
  public isProposedStartDateDisabled = false;
  public StartDate;
  public successMessage: string;
  public infoMessage: string;
  public selectedService;
  public standardBudgetHrs;
  public standardProjectBudgetHrs;
  public OverallTATDays;
  public ngStandardProposedStartDate: any;
  public ngStandardProposedEndDate: any;
  public yearRange: any;
  standardFiles: TreeNode[];
  standardCol: any[];
  taskMenu: MenuItem[];
  public hideTable = true;
  public hideLoader = true;
  public confirmDisabled = true;
  public hideCapacity = true;
  constructor(
    private spService: SPOperationService,
    public pmObject: PMObjectService,
    private constants: ConstantsService,
    private timelineObject: AddTimelineComponent,
    public datepipe: DatePipe,
    private ngZone: NgZone,
    private pmConstant: PmconstantService,
    private pmCommonService: PMCommonService,
    private sharedObject: GlobalService,
    private router: Router,
    private commonService: CommonService,
    private dialogService: DialogService,
    private dataService: DataService,
    public dailyAllocation: PreStackAllocationComponent,
    private dailyAllocateOP: AllocationOverlayComponent,
    private allocationCommon: TaskAllocationCommonService,
    private prestackService: PreStackcommonService) {
  }

  getDatePart(date) {
    const newDate = new Date(date);
    return new Date(this.datepipe.transform(newDate, 'MMM d, y'));
  }
  getTimePart(date) {
    const newDate = new Date(date);
    return this.datepipe.transform(newDate, 'hh:mm a');
  }
  ngOnInit() {
    setTimeout(async () => {
      await this.loadStandardTimeline();
      this.setFieldProperties();
      this.isStandardLoaderHidden = true;
      this.isStandardTableHidden = false;
      this.getProjectRules();
    }, 100);
  }
  onSeviceClear() {
    // tslint:disable-next-line:no-
    this.selectedService = null;
  }
  onSkillClear() {
    this.selectedSkillObject = null;
  }
  onResourceClear() {
    this.selectedResourceObject = null;
  }
  async loadStandardTimeline() {
    this.confirmDisabled = true;
    this.hideCapacity = true;
    const currentYear = new Date().getFullYear();
    const next10Year = currentYear + 10;
    const prev5Year = currentYear - 5;
    this.yearRange = '' + prev5Year + ' : ' + next10Year + '';
    this.minProposedDate = new Date();
    if (this.pmObject.addProject.ProjectAttributes.ClientLegalEntity
      && !this.pmObject.addProject.Timeline.Standard.IsRegisterButtonClicked) {
      this.standardServices = [];
      await this.getProjectManagement();
      await this.getStandardTemplate();
      this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetUserInfo', "GET");
      this.userProperties = await this.spService.getUserInfo(this.sharedObject.currentUser.userId);
    } else {
      this.setDropdownField();
    }
  }
  public async getProjectManagement() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    const oCurrentDate = new Date();
    const sYear = oCurrentDate.getFullYear();
    // sYear = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;
    // Get ProjectPerYear
    const projectYearGet = Object.assign({}, options);
    const projectYearFilter = Object.assign({}, this.pmConstant.TIMELINE_QUERY.PROJECT_PER_YEAR);
    projectYearFilter.filter = projectYearFilter.filter.replace(/{{Id}}/gi, sYear.toString());
    projectYearGet.url = this.spService.getReadURL(this.constants.listNames.ProjectPerYear.name,
      projectYearFilter);
    projectYearGet.type = 'GET';
    projectYearGet.listName = this.constants.listNames.ProjectPerYear.name;
    batchURL.push(projectYearGet);
    // Get ClientLegalEntity.
    const clientLegalGet = Object.assign({}, options);
    clientLegalGet.url = this.spService.getReadURL(this.constants.listNames.ClientLegalEntity.name,
      this.pmConstant.TIMELINE_QUERY.CLIENT_LEGAL_ENTITY);
    clientLegalGet.type = 'GET';
    clientLegalGet.listName = this.constants.listNames.ClientLegalEntity.name;
    batchURL.push(clientLegalGet);
    // Get deliveryType.
    const deliveryTypeGet = Object.assign({}, options);
    deliveryTypeGet.url = this.spService.getReadURL(this.constants.listNames.DeliverableType.name,
      this.pmConstant.TIMELINE_QUERY.DELIVERY_TYPE);
    deliveryTypeGet.type = 'GET';
    deliveryTypeGet.listName = this.constants.listNames.DeliverableType.name;
    batchURL.push(deliveryTypeGet);

    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetProjPYearCLERCDelType', "GET-BATCH");
    this.pmObject.standardPMResponse = await this.spService.executeBatch(batchURL);

    if (this.pmObject.standardPMResponse && this.pmObject.standardPMResponse.length) {
      const projectResult = this.pmObject.standardPMResponse[0].retItems;
      if (projectResult && projectResult.length > 0) {
        this.pmObject.oProjectManagement.oProjectPerYear = projectResult[0].Count + 1;
      }
      const clientlegalResult = this.pmObject.standardPMResponse[1].retItems;
      if (clientlegalResult && clientlegalResult.length > 0) {
        this.pmObject.oProjectManagement.oClientLegalEntity = clientlegalResult;
      }
      const deliveryType = this.pmObject.standardPMResponse[2].retItems;
      if (deliveryType && deliveryType.length > 0) {
        this.pmObject.oProjectManagement.oDeliverableType = deliveryType;
      }
    }
  }
  /**
   * This method is used to get all the Resources from ResourceCategorization list.
   */
  public getResources(skill) {
    let resources = [];
    if (skill.length) {
      resources = this.pmObject.oProjectManagement.oResourcesCat.filter(element => {
        let tempSkill = element.SkillLevel.Title;
        tempSkill = tempSkill.replace(' Offsite', '').replace(' Onsite', '').replace('Jr ', '').replace('Sr ', '').replace('Medium ', '');
        // tslint:disable-next-line:max-line-length
        return tempSkill === skill[0].Title && element.Account.results.findIndex(x => x.Title === this.pmObject.addProject.ProjectAttributes.ClientLegalEntity) > -1;
      });
    }
    return resources;
  }
  /**
   * This method is used to get the budget hours based on project code.
   * @param projectCode Provide the project code.
   */
  public async getBudgetHours(projectCode) {
    const prjFinanceOptions = {
      select: 'BudgetHrs',
      filter: 'Title eq \'' + projectCode + '\''
    };
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetBudgetHours', "GET");
    const result = await this.spService.readItems(this.constants.listNames.ProjectFinances.name, prjFinanceOptions);
    return result.length ? result : [];
  }
  /**
   * This method is used to get the Project Resource based on project code.
   * @param projectCode Provide the project code.
   */
  public async getProjectResources(projectCode) {
    const projectResourceOptions = {
      // tslint:disable-next-line:max-line-length
      select: 'ID,Milestone,Milestones,TA,DeliverableType,ClientLegalEntity,Writers/ID,Writers/Name,Writers/Title,Reviewers/ID,Reviewers/Name,Reviewers/Title,QC/ID,QC/Name,QC/Title,Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title,GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title,PrimaryResMembers/ID,PrimaryResMembers/Name,PrimaryResMembers/Title,AllDeliveryResources/ID, AllDeliveryResources/Name, AllDeliveryResources/Title,CMLevel1/ID,CMLevel1/Title',
      // tslint:disable-next-line:max-line-length
      expand: 'Writers/ID,Writers/Name,Writers/Title,Reviewers/ID,Reviewers/Name,Reviewers/Title,QC/ID,QC/Name,QC/Title,Editors/ID,Editors/Name,Editors/Title,PSMembers/ID,PSMembers/Name,PSMembers/Title,GraphicsMembers/ID,GraphicsMembers/Name,GraphicsMembers/Title,PrimaryResMembers/ID,PrimaryResMembers/Name,PrimaryResMembers/Title,CMLevel1/ID,CMLevel1/Title,AllDeliveryResources/ID,AllDeliveryResources/Name,AllDeliveryResources/Title',
      filter: 'ProjectCode eq \'' + projectCode + '\''
    };
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetProjectInfo', "GET");
    const project = await this.spService.readItems(this.constants.listNames.ProjectInformation.name, projectResourceOptions);
    // const project = this.spService.getListItem(projectResourceUrl);
    const oPrjFinance = await this.getBudgetHours(projectCode);
    if (project.length > 0) {
      const arrMilestones = project[0].Milestones.split(';#');
      const currentMilestoneIndex = arrMilestones.indexOf(project[0].Milestone);
      const prj = this.sharedTaskAllocateObj.oProjectDetails = {
        // tslint:disable-next-line:object-literal-shorthand
        projectCode: projectCode,
        projectID: project[0].ID,
        writer: project[0].Writers,
        reviewer: project[0].Reviewers,
        editor: project[0].Editors,
        qualityChecker: project[0].QC,
        graphicsMembers: project[0].GraphicsMembers,
        pubSupportMembers: project[0].PSMembers,
        primaryResources: project[0].PrimaryResMembers,
        allResources: project[0].AllDeliveryResources,
        cmLevel1: project[0].CMLevel1,
        currentMilestone: project[0].Milestone,
        nextMilestone: arrMilestones.length !== currentMilestoneIndex + 1 ? arrMilestones[currentMilestoneIndex + 1] : '',
        //  futureMilestones: arrMilestones.slice(currentMilestoneIndex + 1, arrMilestones.length),
        prevMilestone: arrMilestones.slice(currentMilestoneIndex - 1, currentMilestoneIndex),
        allMilestones: arrMilestones,
        budgetHours: oPrjFinance.length > 0 ? oPrjFinance[0].BudgetHrs : 0,
        ta: project[0].TA ? project[0].TA : [],
        deliverable: project[0] ? project[0].DeliverableType : [],
        account: project[0] ? project[0].ClientLegalEntity : []
      };
    }
  }
  //tslint:disable
  private async getStandardTemplateBasedOnDeliverable(selectedServices) {
    let clientLegalEntity = this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    let standardTemplate = [];
    const standardTemplateOptions = {
      select: 'ID,Title,Skill,IsActiveCH,TotalHours,StandardService/ID,StandardService/Title,LegalEntity/ID,LegalEntity/Title',
      expand: 'StandardService/ID,StandardService/Title,LegalEntity/ID,LegalEntity/Title',
      filter: 'StandardService/Title eq \'' + selectedServices + '\' and LegalEntity/Title eq \'' + clientLegalEntity + '\' and IsActiveCH eq \'Yes\''
    };
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetStdTemplateBasedOnDeliverables', "GET");
    standardTemplate = await this.spService.readItems(this.constants.listNames.StandardTemplates.name, standardTemplateOptions)
    if (standardTemplate.length > 0) {
      return standardTemplate;
    }
  }
  /**
     * This method is used to get the Standard template based on selected services.
     * @param selectedServices Provide the services.
     */
  private async getStandardTemplate() {
    let clientLegalEntity = this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    let standardTemplate = [];
    const standardTemplateOptions = {
      select: 'ID,Title,Skill,IsActiveCH,TotalHours,StandardService/ID,StandardService/Title,LegalEntity/ID,LegalEntity/Title',
      expand: 'StandardService/ID,StandardService/Title,LegalEntity/ID,LegalEntity/Title',
      filter: 'LegalEntity/Title eq \'' + clientLegalEntity + '\' and IsActiveCH eq \'Yes \''
    };
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetStdTemplate', "GET");
    standardTemplate = await this.spService.readItems(this.constants.listNames.StandardTemplates.name, standardTemplateOptions);
    if (standardTemplate && standardTemplate.length) {
      this.loadServiceDropDown(standardTemplate);
    }
  }
  /**
   * This method is used to fetch the milestone for standard project.
   */
  private async getStandardMilestone() {
    let standardMilestone = [];
    let selectedSkill = this.getSkill(this.selectedSkillObject);
    let selectedService = this.selectedService;
    let templateName;
    const matchingStandard = this.sharedTaskAllocateObj.oStandardTemplateForDeliverable.filter(function (obj) {
      return (obj.Skill === selectedSkill) && (obj.StandardService.Title === selectedService);
    })
    matchingStandard.length > 0 ? templateName = matchingStandard[0].Title : templateName = '';
    const standardMilestoneOptions = {
      select: 'ID,Title,ClientReviewDays,Hours,MilestoneName,DisplayOrder,MilestoneDays,Template/ID,Template/Title,SubMilestones',
      expand: 'Template/ID,Template/Title',
      filter: 'Template/Title eq \'' + templateName + '\''
    }
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetMilestonMatrix', "GET");
    standardMilestone = await this.spService.readItems(this.constants.listNames.MilestoneMatrix.name, standardMilestoneOptions);
    if (standardMilestone.length > 0) {
      standardMilestone = standardMilestone.sort(function (a, b) {
        return a.DisplayOrder < b.DisplayOrder ? -1 : 1
      })
      return standardMilestone;
    }
  }

  /**
   * This function is used to get the standard milestone based on milestone name.
   * @param MileStoneName
   */
  private filterTask(milestoneName, subMilestoneName) {
    const tempArray = [];
    if (this.allMilestoneTask && this.allMilestoneTask.length) {
      const allTaskArray = this.allMilestoneTask;
      allTaskArray.filter(subMilestone => {
        subMilestone.retItems.filter(task => {
          if (subMilestoneName) {
            if (task.Milestones.Title === milestoneName && task.SubMilestones.Title === subMilestoneName) {
              tempArray.push(task);
              task.Skill = task.Skill ? task.Skill : '';
              let previousTaskArray = [];
              if (task.PreviousTask && task.PreviousTask.results && task.PreviousTask.results.length > 0) {
                for (const prevTask of task.PreviousTask.results) {
                  previousTaskArray.push(prevTask.Title);
                }
              } else {
                previousTaskArray.push("");
              }
              task.PreviousTask = previousTaskArray;
            }
          }
          if (!subMilestoneName) {
            if (task.Milestones.Title === milestoneName) {
              tempArray.push(task);
              task.Skill = task.Skill ? task.Skill : '';
              let previousTaskArray = [];
              if (task.PreviousTask && task.PreviousTask.results && task.PreviousTask.results.length > 0) {
                for (const prevTask of task.PreviousTask.results) {
                  previousTaskArray.push(prevTask.Title);
                }
              } else {
                previousTaskArray.push("");
              }
              task.PreviousTask = previousTaskArray;
            }
          }

        });
      });
    }
    return tempArray;
  }
  private async getMilestoneTask(milestoneArray) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    for (const milestone of milestoneArray) {
      const standardMilestoneTaskOptions = {
        select: 'ID,Title,Skill,Hours,TaskDays,UseTaskDays,Milestones/ID,Milestones/Title,TaskName/ID,TaskName/Title,PreviousTask/ID,PreviousTask/Title,SubMilestones/ID,SubMilestones/Title',
        expand: 'Milestones/ID,Milestones/Title,TaskName/ID,TaskName/Title,PreviousTask/ID,PreviousTask/Title,SubMilestones/ID,SubMilestones/Title',
        filter: 'Milestones/Title eq \'' + milestone.Title + '\'',
        top: 4900
      };
      // getMilestone Task
      const milestoneTaskGet = Object.assign({}, options);
      milestoneTaskGet.url = this.spService.getReadURL(this.constants.listNames.MilestoneTaskMatrix.name,
        standardMilestoneTaskOptions);
      milestoneTaskGet.type = 'GET';
      milestoneTaskGet.listName = this.constants.listNames.MilestoneTaskMatrix.name;
      batchURL.push(milestoneTaskGet);
    }
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetMilestoneTasks', "GET-BATCH");
    this.allMilestoneTask = await this.spService.executeBatch(batchURL);
  }
  /**
   * This function is used to load Services from standard Service list.
   *
   */
  async loadServiceDropDown(standardTemplate) {
    const templates = [];
    if (standardTemplate.length > 0) {
      for (const val of standardTemplate) {
        templates.push(val.StandardService.Title);
      }
    }
    const standardServiceOptions = {
      select: 'ID,Title,BaseSkill,IsActiveCH,Deliverable/ID,Deliverable/Title,SubDeliverable/ID,SubDeliverable/Title,Services/ID,Services/Title',
      expand: 'Deliverable/ID,Deliverable/Title,SubDeliverable/ID,SubDeliverable/Title,Services/ID,Services/Title',
      filter: 'IsActiveCH eq \'Yes\'',
      orderby: 'Title',
      top: 4900
    };
    this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetStandardServiceName', 'GET');
    const result = await this.spService.readItems(this.constants.listNames.StandardServices.name, standardServiceOptions);
    if (result && result.length) {
      for (const element of result) {
        if (templates.indexOf(element.Title) > -1) {
          this.standardServices.push({ label: element.Title, value: element });
        }
      }
    }
  }
  /**
   * This method get called when user changes the services
   * @param event It provides tahe Skill and services
   * @param userCapacityRef Provides the usercapacity reference for showing the user capacity.
   */
  async onServiceChange(event, serviceId) {
    if (event !== undefined) {
      this.onChangeResetField();
      this.serviceId = serviceId;
      // $('.standardMilestoneByType').hide();
      // this.hideTable = false;
      this.isStandardFetchTableHidden = true;
      let tempskillTypes = {};
      let temSkillArray = [];
      let tempReviewArray = [];
      let selectedVal = event.value ? event.value.BaseSkill : null;
      let selectedService = event.value ? event.value.Title: null;
      this.sharedTaskAllocateObj.oStandardTemplateForDeliverable = await this.getStandardTemplateBasedOnDeliverable(selectedService);
      this.deliverableType =event.value ?  event.value.Deliverable.Title : null;
      this.selectedService = selectedService;


      this.constants.RuleParamterArray.find(
        (c) => c.parameterName === "DeliverableType"
      ).value = this.deliverableType ? this.deliverableType:'';
  
   
      this.getProjectRules();


      this.changedProjectCode(this.deliverableType);
      // save the deliverable type and subDeliverable in global variable to save the project.
      this.pmObject.addProject.Timeline.Standard.DeliverableType = this.deliverableType;
      this.pmObject.addProject.Timeline.Standard.SubDeliverable = event.value.SubDeliverable.Title;
      this.pmObject.addProject.Timeline.Standard.ServiceLevel = this.selectedService;
      const skillMasterOptions = {
        select: 'ID,Title,CategoryCH,NameCH,LocationCH,Tasks/ID,Tasks/Title',
        expand: 'Tasks/ID,Tasks/Title',
        filter: 'NameCH eq \'' + selectedVal + '\''
      };
      this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'GetSkillMaster', "GET");
      let skillMaster = await this.spService.readItems(this.constants.listNames.SkillMaster.name, skillMasterOptions);
      for (const skill of skillMaster) {
        let tempSkill = skill.NameCH;
        if (tempSkill) {
          const matchingSkill = this.sharedTaskAllocateObj.oStandardTemplateForDeliverable.filter(function (obj) {
            return obj.Skill === tempSkill;
          })
          tempskillTypes = { Title: matchingSkill[0].Skill, userType: "Type" };
          temSkillArray.push(tempskillTypes);
        }
      }
      temSkillArray = this.removeDuplicates(temSkillArray, 'Title')
      let userResource = this.pmCommonService.getResourceByMatrix(await this.getResources(temSkillArray), this.deliverableType);
      if (userResource && userResource.length) {
        this.skillTypesArray = $.merge(temSkillArray, userResource);
      } else {
        this.skillTypesArray = temSkillArray;
      }
      this.skillTypes = this.pmCommonService.bindGroupDropdown(this.skillTypesArray);
      // Adding Reviewer
      let tempReviewer = { Title: "Reviewer", userType: "Type" };
      tempReviewArray.push(tempReviewer);
      let reviewResource = this.pmCommonService.getResourceByMatrix(await this.getResources(tempReviewArray), this.deliverableType);
      if (reviewResource && reviewResource.length) {
        this.reviewerListArray = $.merge(tempReviewArray, reviewResource);
        this.sharedTaskAllocateObj.oAllResource = $.merge(userResource, reviewResource);
      } else {
        this.reviewerListArray = tempReviewArray;
      }
      this.reviewerList = this.pmCommonService.bindGroupDropdown(this.reviewerListArray);
    }
  }


  /**
   * This method is used to show the initial User capacity for next 14 days.
   * @param oResources Provide all the resource from skill and reviewer.
   * @param userCapacityRef Provide the user capacity refernce.
   */
  getInitialUserCapactiy(userCapacityRef) {
    if (this.selectedService === undefined) {

      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select the service.', false);
    } else {
      // $('.initialUserCapacity-section').hide();
      this.hideCapacity = true;
      // $('.standard-spinner-section').show();
      this.hideLoader = false;
      let oCapacityStartDate = {};
      oCapacityStartDate = this.calcBusinessNextDate(new Date(), 1);
      if (this.ngStandardProposedStartDate) {
        oCapacityStartDate = this.ngStandardProposedStartDate;
      }
      let oCapacityEndDate = this.calcBusinessNextDate(oCapacityStartDate, 10);
      setTimeout(async () => {

        const Resources = { resources: this.sharedTaskAllocateObj.oAllResource };
        const data = { task: Resources, startTime: oCapacityStartDate, endTime: oCapacityEndDate, Module: 'PM' }

        await userCapacityRef.Onload(data)


        // userCapacityRef.applyFilterLocal(oCapacityStartDate, oCapacityEndDate, this.sharedTaskAllocateObj.oAllResource);
        // $('.standard-spinner-section').hide();
        this.hideLoader = true;
        // $('.initialUserCapacity-section').show();
        this.hideCapacity = false;
      }, 100);
    }
  }
  /**
   * This method get call when user changes the skill value.
   * @param event It provides the skill.
   */
  onSkillChange(event, skillId) {
    if (event.value) {
      this.reviewerList = [];
      this.resourceId = skillId;
      this.selectedSkillObject = event;
      let selectedSkill = this.getSkill(event);
      let selectedService = this.selectedService;
      const matchingStandard = this.sharedTaskAllocateObj.oStandardTemplateForDeliverable.filter(function (obj) {
        return (obj.Skill === selectedSkill) && (obj.StandardService.Title === selectedService);
      });
      let reviewerList_copy = this.reviewerListArray;
      const reviewer = reviewerList_copy.filter(function (obj) {
        if (event.value.userType === 'Type') {
          return obj.userType === event.value.userType;
        } else {
          return obj.userType !== 'Type';
        }
      });
      this.reviewerList = this.pmCommonService.bindGroupDropdown(reviewer);
      matchingStandard.length > 0 ? this.standardBudgetHrs = matchingStandard[0].TotalHours : this.standardBudgetHrs = 0;
      matchingStandard.length > 0 ? this.standardProjectBudgetHrs = matchingStandard[0].TotalHours : this.standardProjectBudgetHrs = 0;
    }
  }
  /**
   * This method get called when resource will get changed.
   * @param event It provide the attributes of resources.
   */
  onResourceChange(event, reviewerId) {
    this.reviewerId = reviewerId;
    this.selectedResourceObject = event;
  }
  /**
   * This method is used to change the project code based on services.
   * @param deliverableType Provide the delivery type.
   */
  private changedProjectCode(deliverableType) {
    let clientLegalEntity = this.pmObject.addProject.ProjectAttributes.ClientLegalEntity;
    let clientLegalEntityObject = this.pmObject.oProjectManagement.oClientLegalEntity.filter(function (obj) {
      return clientLegalEntity === obj.Title;
    });
    let deliveryObject = this.pmObject.oProjectManagement.oDeliverableType.filter(function (obj) {
      return deliverableType === obj.Title;
    });
    let sClientAcronym = clientLegalEntityObject[0].Acronym;
    let sDeliverableTypeCode = deliveryObject[0].Acronym;
    let oCurrentDate = new Date();
    let sProjCode = oCurrentDate.getFullYear();
    // let sProjCode = oCurrentDate.getMonth() > 2 ? sYear + 1 : sYear;
    let sProjCount = this.pmObject.oProjectManagement.oProjectPerYear.toString();
    sProjCount = ("000" + sProjCount).slice(-4);
    if (sProjCode) {
      let sYear = sProjCode.toString().substr(2, 2);
      let sProjectCode = sClientAcronym + "-" + sDeliverableTypeCode + "-" + sYear + sProjCount;
      this.pmObject.addProject.ProjectAttributes.ProjectCode = sProjectCode;
    }
  }
  /**
   * This method is used to remove the prefix from particular skill. i.e Jr & Sr.
   * @param event Provide the attributes of skill.
   */
  private getSkill(event) {
    if (event && event.value) {
      let selectedSkill;
      if (event.value.userType == 'Type') {
        selectedSkill = event.value.Title;
      } else {
        let tempSkill = event.value.SkillLevel.Title;
        tempSkill = tempSkill.replace(' Offsite', '').replace(' Onsite', '').replace('Jr ', '').replace('Sr ', '').replace('Medium ', '');
        selectedSkill = tempSkill;
      }
      return selectedSkill;
    }
  }
  /**
   * This method is used to add the number of days to previous date and return the new date.
   * @param lastDate Provide the date.
   * @param days Provide the number of days.
   */
  private addDays(date, days) {
    let checkDate = date.hasOwnProperty("jsdate");
    let convertedDate;
    if (checkDate) {
      convertedDate = new Date(date);
    } else {
      convertedDate = new Date(date);
    }
    convertedDate.setDate(convertedDate.getDate() + days);
    return new Date(convertedDate);
  }
  /**
   * This method generate the milestone.
   */
  public async generateSkillMilestones() {
    this.pmObject.addProject.Timeline.Standard.Milestones = [];
    this.allTasks = [];
    // let startDate = this.calcBusinessNextDate(new Date(), 1);
    let startDate: Date;
    if (this.ngStandardProposedStartDate) {
      startDate = this.ngStandardProposedStartDate;
    }
    if (this.selectedSkillObject.value.userType != 'Type') {
      let endDate = this.calcBusinessNextDate(startDate, 30);
      let resource = [];
      resource.push(this.selectedSkillObject.value, this.selectedResourceObject.value);
      const currentUser = this.pmObject.oProjectManagement.oResourcesCat.find(u => u.UserNamePG.ID === this.userProperties.Id);
      if (currentUser) {
        resource.push(currentUser);
      }
      this.pmObject.oTaskAllocation.oAllSelectedResource = resource;
      this.sharedObject.oCapacity = await this.userCapacity.applyFilterReturn(startDate, endDate, resource, []);
    }
    this.standardFiles = [];
    await this.createMilestone(0, true, new Date(startDate));
    if (this.selectedSkillObject.value.userType != 'Type') {
      this.ngStandardProposedStartDate = this.standardFiles[0].data.StartDate;
    }
    this.ngStandardProposedEndDate = this.standardFiles[this.standardFiles.length - 1].data.EndDate;
    this.OverallTATDays = this.pmCommonService.calcBusinessDays(this.standardFiles[0].data.StartDate, this.standardFiles[this.standardFiles.length - 1].data.EndDate);
    this.standardFiles = [... this.standardFiles];
    this.overAllocationAlert();
  }
  /**
   * This method is used to get submilestone for particular milestone
   * @param milestones
   */
  private getSubMilestones(milestones: string) {
    let subMilestonesArray = [];
    if (milestones) {
      let subMilestonesArrayTemp = milestones.split(";#");
      if (subMilestonesArrayTemp && subMilestonesArrayTemp.length) {
        for (let submileObj of subMilestonesArrayTemp) {
          let obj = {
            subMilestoneName: '',
            displayOrder: 0
          }
          obj.subMilestoneName = submileObj.split(":")[0];
          obj.displayOrder = parseInt(submileObj.split(":")[1]);
          subMilestonesArray.push(obj);
        }
      }
      return subMilestonesArray;
    }
  }

  /**
   * This method is used to create the milestone.
   * @param index
   * @param isCreate
   * @param StartDate
   */
  public async createMilestone(index, isCreate, StartDate) {
    if (isCreate && index < this.sharedTaskAllocateObj.oMilestones.length) {
      let orginalMilestone = this.sharedTaskAllocateObj.oMilestones;
      let milestoneObj: any = $.extend(true, {}, this.pmObject.ngPrimeMilestoneGlobalObj);
      milestoneObj.TemplateMileStone = orginalMilestone[index].Title;
      milestoneObj.MilestoneName = orginalMilestone[index].MilestoneName;
      milestoneObj.data.Name = orginalMilestone[index].MilestoneName;
      // milestoneObj.data.isEndDateDisabled = false;
      milestoneObj.data.type = 'milestone';
      milestoneObj.data.MileId = milestoneObj.data.Name;
      milestoneObj.data.Hours = orginalMilestone[index].Hours;
      milestoneObj.data.Days = orginalMilestone[index].MilestoneDays;
      milestoneObj.data.StartDate = this.setDefaultAMHours(StartDate);
      milestoneObj.data.StartDatePart = this.getDatePart(milestoneObj.data.StartDate);
      milestoneObj.data.StartTimePart = this.getTimePart(milestoneObj.data.StartDate);
      milestoneObj.data.minStartDateValue = this.ngStandardProposedStartDate;
      milestoneObj.data.EndDate = this.calcBusinessNextDate(this.setDefaultPMHours(milestoneObj.data.StartDate), milestoneObj.data.Days === 1 ? 0 : milestoneObj.data.Days);
      milestoneObj.data.EndDatePart = this.getDatePart(milestoneObj.data.EndDate);
      milestoneObj.data.EndTimePart = this.getTimePart(milestoneObj.data.EndDate);
      milestoneObj.data.minEndDateValue = milestoneObj.data.StartDate;
      milestoneObj.data.ClientReviewDays = orginalMilestone[index].ClientReviewDays;
      milestoneObj.data.strSubMilestone = orginalMilestone[index].SubMilestones;
      milestoneObj.data.allocationColor = '';
      milestoneObj.data.showAllocationSplit = false;
      milestoneObj.SubMilestones = this.getSubMilestones(orginalMilestone[index].SubMilestones);
      // check If submilestones is present or not
      if (milestoneObj.SubMilestones) {
        // We passed 0 as parameter when all the submilestone task need to change.
        await this.createSubMilestones(milestoneObj.data.StartDate, milestoneObj, true, 0);
      } else {
        this.sharedTaskAllocateObj.oTasks = this.filterTask(milestoneObj.TemplateMileStone, null);
        await this.createTask(milestoneObj.data.StartDate, true, "", "", "", milestoneObj, null);
      }
      this.calculateMilestoneDeviationDays(milestoneObj);
      milestoneObj.data.clientReviewStartDate = this.setDefaultAMHours(this.calcBusinessNextDate(milestoneObj.data.EndDate, 1));
      milestoneObj.data.clientReviewEndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestoneObj.data.clientReviewStartDate, milestoneObj.data.ClientReviewDays === 1 ? 0 : milestoneObj.data.ClientReviewDays));
      this.standardFiles.push(milestoneObj);
      this.pmObject.addProject.Timeline.Standard.Milestones.push(milestoneObj.MilestoneName);
      // if (index < orginalMilestone.length - 1) {
      //   this.pmObject.addProject.Timeline.Standard.Milestones += ';#';
      // }


      StartDate = this.setClientReview(milestoneObj, true);
      if (index < orginalMilestone.length) {
        index++;
        await this.createMilestone(index, isCreate, StartDate);
      }
    }
    if (!isCreate && index < this.sharedTaskAllocateObj.oMilestones.length) {
      let milestones_copy: any = this.standardFiles;
      const milestoneName = this.sharedTaskAllocateObj.oMilestones[index].MilestoneName;
      let milestoneIndex = milestones_copy.findIndex(function (obj) {
        return obj.data.Name === milestoneName
      });
      if (milestoneIndex > -1) {
        let milestoneObj = milestones_copy[milestoneIndex];
        milestoneObj.data.StartDate = StartDate;
        milestoneObj.data.StartDatePart = this.getDatePart(milestoneObj.data.StartDate);
        milestoneObj.data.StartTimePart = this.getTimePart(milestoneObj.data.StartDate);
        milestoneObj.data.EndDate = this.calcBusinessNextDate(this.setDefaultPMHours(milestoneObj.data.StartDate), milestoneObj.data.Days === 1 ? 0 : milestoneObj.data.Days);
        milestoneObj.data.EndDatePart = this.getDatePart(milestoneObj.data.EndDate);
        milestoneObj.data.EndTimePart = this.getTimePart(milestoneObj.data.EndDate);
        milestoneObj.data.minEndDateValue = milestoneObj.data.StartDate;
        milestoneObj.data.allocationColor = '';
        // We passed 0 as parameter when all the submilestone task need to change.
        if (milestoneObj.SubMilestones) {
          await this.createSubMilestones(StartDate, milestoneObj, false, 0);
        } else {
          this.sharedTaskAllocateObj.oTasks = milestoneObj.children;
          await this.createTask(StartDate, false, "", "", "", milestoneObj, null);
        }
        this.calculateMilestoneDeviationDays(milestoneObj);
        milestones_copy[milestoneIndex + 1].clientReviewStartDate = this.setDefaultAMHours(this.calcBusinessNextDate(milestoneObj.data.EndDate, 1));
        milestones_copy[milestoneIndex + 1].clientReviewEndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex + 1].clientReviewStartDate, milestoneObj.data.Days === 1 ? 0 : milestoneObj.data.Days));
        StartDate = this.setClientReview(this.standardFiles[milestoneIndex + 1], false);
        this.standardFiles.splice(milestoneIndex, 1, milestoneObj);
        index++;
        await this.createMilestone(index, isCreate, StartDate);
      }
    }
  }

  /**
   * This function is used to create the submilestone.
   * @param StartDate
   * @param ngPrimemilestoneObj
   */
  public async createSubMilestones(StartDate, milestoneObj, isCreate, index) {
    let displayOrder: Number = 0;
    if (isCreate && milestoneObj.SubMilestones && milestoneObj.SubMilestones.length) {
      for (let submilestoneObj of milestoneObj.SubMilestones) {
        let ngPrimeSubmilestoneObj: any = $.extend(true, {}, this.pmObject.ngPrimeSubMilestoneGlobalObj);
        if (displayOrder !== submilestoneObj.displayOrder) {
          if (displayOrder !== 0) {
            // get the length of ngPrimemilestoneObj.children to get submilestone task
            StartDate = this.changeSubMilestoneStartDate(milestoneObj, displayOrder, StartDate);
          }
          displayOrder = submilestoneObj.displayOrder;
        }
        ngPrimeSubmilestoneObj.data.Name = submilestoneObj.subMilestoneName;
        ngPrimeSubmilestoneObj.data.MileId = milestoneObj.data.MileId + ";#" + ngPrimeSubmilestoneObj.data.Name;
        ngPrimeSubmilestoneObj.data.Hours = 0;
        ngPrimeSubmilestoneObj.data.Days = 0;
        ngPrimeSubmilestoneObj.data.type = 'submilestone';
        ngPrimeSubmilestoneObj.data.Deviation = 0;
        ngPrimeSubmilestoneObj.subMilestoneName = submilestoneObj.subMilestoneName;
        ngPrimeSubmilestoneObj.displayOrder = submilestoneObj.displayOrder;
        ngPrimeSubmilestoneObj.data.StartDate = this.setDefaultAMHours(StartDate);
        ngPrimeSubmilestoneObj.data.StartDatePart = this.getDatePart(ngPrimeSubmilestoneObj.data.StartDate);
        ngPrimeSubmilestoneObj.data.StartTimePart = this.getTimePart(ngPrimeSubmilestoneObj.data.StartDate);
        ngPrimeSubmilestoneObj.data.allocationColor = '';
        ngPrimeSubmilestoneObj.data.showAllocationSplit = false;
        this.sharedTaskAllocateObj.oTasks = this.filterTask(milestoneObj.TemplateMileStone, ngPrimeSubmilestoneObj.data.Name);
        await this.createTask(ngPrimeSubmilestoneObj.data.StartDate, true, "", "", "", milestoneObj, ngPrimeSubmilestoneObj);
        if (ngPrimeSubmilestoneObj.children.length) {
          ngPrimeSubmilestoneObj.data.EndDate = ngPrimeSubmilestoneObj.children[ngPrimeSubmilestoneObj.children.length - 1].data.EndDate;
          ngPrimeSubmilestoneObj.data.EndDatePart = this.getDatePart(ngPrimeSubmilestoneObj.data.EndDate);
          ngPrimeSubmilestoneObj.data.EndTimePart = this.getTimePart(ngPrimeSubmilestoneObj.data.EndDate);
        } else {
          ngPrimeSubmilestoneObj.data.EndDate = milestoneObj.data.EndDate;
          ngPrimeSubmilestoneObj.data.EndDatePart = this.getDatePart(ngPrimeSubmilestoneObj.data.EndDate);
          ngPrimeSubmilestoneObj.data.EndTimePart = this.getTimePart(ngPrimeSubmilestoneObj.data.EndDate);
        }
        milestoneObj.children.push(ngPrimeSubmilestoneObj);
      }
      milestoneObj.children.sort(function (a, b) {
        return a.displayOrder - b.displayOrder;
      })
    }
    if (!isCreate && milestoneObj.children && milestoneObj.children.length) {
      for (let i = index; i < milestoneObj.children.length; i++) {
        let submilestoneObj = milestoneObj.children[i];
        if (displayOrder !== submilestoneObj.displayOrder) {
          if (displayOrder !== 0) {
            // get the length of ngPrimemilestoneObj.children to get submilestone task
            StartDate = this.changeSubMilestoneStartDate(milestoneObj, displayOrder, StartDate);
          }
          displayOrder = submilestoneObj.displayOrder;
        }
        submilestoneObj.data.StartDate = this.setDefaultAMHours(StartDate);
        submilestoneObj.data.StartDatePart = this.getDatePart(submilestoneObj.data.StartDate);
        submilestoneObj.data.StartTimePart = this.getTimePart(submilestoneObj.data.StartDate);
        this.sharedTaskAllocateObj.oTasks = submilestoneObj.children;
        await this.createTask(submilestoneObj.data.StartDate, false, "", "", "", milestoneObj, submilestoneObj);
        if (submilestoneObj.children.length) {
          submilestoneObj.data.EndDate = submilestoneObj.children[submilestoneObj.children.length - 1].data.EndDate;
          submilestoneObj.data.EndDatePart = this.getDatePart(submilestoneObj.data.EndDate);
          submilestoneObj.data.EndTimePart = this.getTimePart(submilestoneObj.data.EndDate);
        } else {
          submilestoneObj.data.EndDate = milestoneObj.data.EndDate;
          submilestoneObj.data.EndDatePart = this.getDatePart(submilestoneObj.data.EndDate);
          submilestoneObj.data.EndTimePart = this.getTimePart(submilestoneObj.data.EndDate);
        }
        milestoneObj.children.splice(i, 1, submilestoneObj);
      }
    }
  }
  /**
   * This fuction is used to change the subMilestone Start date.
   * @param ngPrimeSubmilestoneObj
   * @param displayOrder
   * @param newStartDate
   */
  private changeSubMilestoneStartDate(ngPrimeSubmilestoneObj, displayOrder, newStartDate) {
    let subMilestoneArray = ngPrimeSubmilestoneObj.children.filter(function (obj) {
      return obj.displayOrder === displayOrder;
    });
    let maxDate = new Date(newStartDate);
    if (subMilestoneArray && subMilestoneArray.length) {
      for (let submilestoneObj of subMilestoneArray) {
        if (submilestoneObj.children && submilestoneObj.children.length) {
          if (submilestoneObj.children[submilestoneObj.children.length - 1].EndDate > maxDate) {
            maxDate = submilestoneObj.children[submilestoneObj.children.length - 1].EndDate;
          } else {
            maxDate = maxDate;
          }
        }
      }
    }
    maxDate = this.calcBusinessNextDate(maxDate, 1);
    return maxDate;
  }
  /**
   * create the client review task
   * @param ngPrimemilestoneObj
   */
  private setClientReview(ngPrimemilestoneObj, isCreate) {
    let date = new Date();
    if (isCreate) {
      if (ngPrimemilestoneObj.data.clientReviewStartDate && ngPrimemilestoneObj.data.clientReviewEndDate) {
        let ngPrimetaskObj: any = $.extend(true, {}, this.pmObject.ngPrimeTaskGlobalObj);
        ngPrimetaskObj.data.Name = this.pmConstant.task.CLIENT_REVIEW;
        ngPrimetaskObj.data.Hours = 0;
        ngPrimetaskObj.data.isEndDateDisabled = false;
        ngPrimetaskObj.data.Days = ngPrimemilestoneObj.data.ClientReviewDays;
        ngPrimetaskObj.data.StartDate = ngPrimemilestoneObj.data.clientReviewStartDate;
        ngPrimetaskObj.data.StartDatePart = this.getDatePart(ngPrimetaskObj.data.StartDate);
        ngPrimetaskObj.data.StartTimePart = this.getTimePart(ngPrimetaskObj.data.StartDate);
        ngPrimetaskObj.data.minStartDateValue = this.ngStandardProposedStartDate;
        ngPrimetaskObj.data.EndDate = ngPrimemilestoneObj.data.clientReviewEndDate;
        ngPrimetaskObj.data.EndDatePart = this.getDatePart(ngPrimetaskObj.data.EndDate);
        ngPrimetaskObj.data.EndTimePart = this.getTimePart(ngPrimetaskObj.data.EndDate);
        ngPrimetaskObj.data.showTime = true;
        ngPrimetaskObj.data.minEndDateValue = ngPrimetaskObj.data.StartDate;
        ngPrimetaskObj.data.MileId = ngPrimemilestoneObj.data.MileId + ';#' + this.pmConstant.task.CLIENT_REVIEW;
        ngPrimetaskObj.data.AssignedTo = this.userProperties.Title;
        ngPrimetaskObj.data.showHyperLink = false;
        this.standardFiles.push(ngPrimetaskObj);
        date = this.calcBusinessNextDate(ngPrimetaskObj.data.EndDate, 1);
      }
    }
    if (!isCreate) {
      ngPrimemilestoneObj.data.StartDate = ngPrimemilestoneObj.clientReviewStartDate;
      ngPrimemilestoneObj.data.StartDatePart = this.getDatePart(ngPrimemilestoneObj.data.StartDate);
      ngPrimemilestoneObj.data.StartTimePart = this.getTimePart(ngPrimemilestoneObj.data.StartDate);
      ngPrimemilestoneObj.data.EndDate = ngPrimemilestoneObj.clientReviewEndDate;
      ngPrimemilestoneObj.data.EndDatePart = this.getDatePart(ngPrimemilestoneObj.data.EndDate);
      ngPrimemilestoneObj.data.EndTimePart = this.getTimePart(ngPrimemilestoneObj.data.EndDate);
      ngPrimemilestoneObj.data.minEndDateValue = ngPrimemilestoneObj.data.StartDate;
      date = this.setDefaultAMHours(this.calcBusinessNextDate(ngPrimemilestoneObj.data.EndDate, 1));
    }

    return date;
  }
  /**
   * This method is used to compare SC date and milestone end date.
   * @param ngPrimemilestoneObj
   */
  private compareMilestoneAndSCEndDate(ngPrimemilestoneObj) {
    if (ngPrimemilestoneObj && ngPrimemilestoneObj.children && ngPrimemilestoneObj.children.length) {
      if (ngPrimemilestoneObj.children[ngPrimemilestoneObj.children.length - 1].data.EndDate > ngPrimemilestoneObj.data.EndDate) {
        ngPrimemilestoneObj.data.EndDate = ngPrimemilestoneObj.children[ngPrimemilestoneObj.children.length - 1].data.EndDate;
        ngPrimemilestoneObj.data.EndDatePart = this.getDatePart(ngPrimemilestoneObj.data.EndDate);
        ngPrimemilestoneObj.data.EndTimePart = this.getTimePart(ngPrimemilestoneObj.data.EndDate);
        ngPrimemilestoneObj.data.minEndDateValue = ngPrimemilestoneObj.data.StartDate;
      }
    }
  }
  /**
   * This method is used to create task for milestone and submilestone.
   * If submilestone is present - It will create the task for all submilestones.
   * If Submilestone is absent - It will create the task for all milestones
   * @param startdate
   * @param isCreate
   * @param previousTask
   * @param daysHours
   * @param milestoneObj
   * @param submilestoneObj
   */
  public async createTask(startdate, isCreate, previousTask, daysHours, timezone, milestoneObj, submilestoneObj) {
    let newStartDate = new Date(startdate);
    let milestoneTask = this.sharedTaskAllocateObj.oTasks;
    if (milestoneTask && milestoneTask.length) {
      milestoneTask = milestoneTask.filter(function (obj) {
        return obj.PreviousTask.indexOf(previousTask) > -1;
      });
    }
    let tempTaskArray = [];
    let endateArray = [];
    if (milestoneTask && milestoneTask.length) {
      for (let index in milestoneTask) {
        let allPresent = false;
        ///// Check if both the end dates are present
        if (milestoneTask[index].PreviousTask.length === 1) {
          allPresent = true;
        }
        else {
          for (let i = 0; i < milestoneTask[index].PreviousTask.length; i++) {
            let addedTasks;
            if (submilestoneObj) {
              addedTasks = submilestoneObj.children.filter(function (obj) {
                return obj.data.Title === milestoneTask[index].PreviousTask[i];
              });
            } else {
              addedTasks = milestoneObj.children.filter(function (obj) {
                return obj.data.Title === milestoneTask[index].PreviousTask[i];
              });
            }
            if (addedTasks.length === 0) {
              allPresent = false;
              break;
            }
            else {
              let newStartDateForTask = new Date(addedTasks[0].EndDate);
              if (newStartDateForTask > newStartDate) {
                newStartDate = newStartDateForTask;
              }
              allPresent = true;
            }
          }
        }
        if (!allPresent) {
          return false;
        }

        ///// Check if already added
        let addedTasks

        if (submilestoneObj) {
          addedTasks = submilestoneObj.children.filter(function (obj) {
            return obj.data.Title === milestoneTask[index].Title;
          });
        } else {
          addedTasks = milestoneObj.children.filter(function (obj) {
            return obj.data.Title === milestoneTask[index].Title;
          });
        }

        if (addedTasks.length) {
          return false;
        }
        if (isCreate) {
          let taskObj: any = $.extend(true, {}, this.pmObject.ngPrimeTaskGlobalObj);
          taskObj.data.Title = milestoneTask[index].Title;
          taskObj.Milestones = milestoneTask[index].Milestones.Title;
          taskObj.data.Milestone = milestoneObj.MilestoneName;
          taskObj.data.Task = milestoneTask[index].TaskName.Title;
          taskObj.data.type = 'task';
          taskObj.data.allocationColor = '';
          let addedTaskArray = [];
          if (submilestoneObj) {
            if (milestoneObj.children.length) {
              for (let subMileIndex = 0; subMileIndex < milestoneObj.children.length; subMileIndex++) {
                milestoneObj.children[subMileIndex].children.filter(function (obj) {
                  if (obj.data.Task === taskObj.data.Task) {
                    addedTaskArray.push(obj);
                  }
                });
              }
            }
            const subAddedTaskArray = submilestoneObj.children.filter(function (obj) {
              return obj.data.Task === taskObj.data.Task;
            });
            addedTaskArray = addedTaskArray.concat(subAddedTaskArray);
          } else {
            addedTaskArray = milestoneObj.children.filter(function (obj) {
              return obj.data.Task === taskObj.data.Task;
            });
          }
          taskObj.data.TaskName = taskObj.data.Task + (addedTaskArray && addedTaskArray.length > 0 ? (" " + (addedTaskArray.length + 1)) : "");
          taskObj.data.PreviousTask = milestoneTask[index].PreviousTask;
          taskObj.PreviousTask = milestoneTask[index].PreviousTask;
          taskObj.data.Skill = milestoneTask[index].Skill;
          taskObj.data.TaskDays = milestoneTask[index].TaskDays;
          taskObj.data.UseTaskDays = milestoneTask[index].TaskName.Title === 'Send to client' ? 'No' : milestoneTask[index].UseTaskDays;
          taskObj.data.Title = milestoneTask[index].Title;
          taskObj.data.Name = taskObj.data.TaskName;
          taskObj.data.taskFullName = this.pmObject.addProject.ProjectAttributes.ProjectCode + ' ' + milestoneObj.MilestoneName + ' ' + taskObj.data.TaskName;
          taskObj.data.isStartDateDisabled = false;
          taskObj.data.isEndDateDisabled = false;
          taskObj.data.Hours = milestoneTask[index].Hours;
          taskObj.data.showHyperLink = true;
          taskObj.data.Days = taskObj.data.UseTaskDays + "(" + taskObj.data.TaskDays + ")";
          if (this.selectedSkillObject.value.userType === 'Type') {
            taskObj.data.AssignedTo = milestoneTask[index].Skill;
            taskObj.data.showHyperLink = false;
            if (submilestoneObj) {
              taskObj.data.MileId = submilestoneObj.data.MileId + ";#" + taskObj.data.Name;
              taskObj.data.SubMilestone = submilestoneObj.data.Name;
            } else {
              taskObj.data.MileId = milestoneObj.data.MileId + ";#" + ";#" + taskObj.data.Name;
              taskObj.data.SubMilestone = '';
            }
            if (taskObj.data.Task === this.pmConstant.task.SEND_TO_CLIENT) {
              taskObj.AssignedTo = this.userProperties.Title;
              taskObj.data.AssignedTo = this.userProperties.Title;
              startdate = this.setDefaultAMHours(milestoneObj.data.StartDate);
              taskObj.data.isEndDateDisabled = true;
            }
            if (taskObj.data.UseTaskDays !== this.pmConstant.task.USE_TASK_DAYS || milestoneTask[index].TaskName.Title === 'Send to client') {
              taskObj.data.showTime = true;
              if (milestoneTask[index].TaskName.Title === 'Send to client') {
                taskObj.data.Days = taskObj.data.TaskDays;
              }

            }
            if (daysHours !== "") {
              startdate = this.changeStartDate(newStartDate, taskObj, "+5.5");
              startdate = this.commonTaskProperties(taskObj, startdate);
            } else {
              startdate = this.commonTaskProperties(taskObj, newStartDate);
            }
          }
          if (this.selectedSkillObject.value.userType !== 'Type') {
            let selectedSkillObj = this.pmObject.oTaskAllocation.oAllSelectedResource;
            let filterResource = selectedSkillObj.filter(function (obj) {
              let skill = obj.SkillLevel.Title.replace(' Offsite', '').replace(' Onsite', '').replace('Jr ', '').replace('Sr ', '').replace('Medium ', '');
              return taskObj.data.Skill === skill;
            });
            taskObj.data.assignedUserTimeZone = filterResource.length > 0 ? filterResource[0].TimeZone.Title ?
              filterResource[0].TimeZone.Title : +5.5 : +5.5;
            if (daysHours !== "") {
              startdate = this.changeStartDate(newStartDate, taskObj, timezone);
            }
            else {
              startdate = new Date(newStartDate);
            }
            if (filterResource && filterResource.length) {
              taskObj.data.AssignedTo = filterResource[0].UserNamePG.Title;
              taskObj.data.userId = filterResource[0].UserNamePG.ID;
              // startdate = this.checkUserAvailability(startdate, taskObj);
            } else {
              taskObj.data.AssignedTo = milestoneTask[index].Skill;
              taskObj.data.showHyperLink = false;
            }
            startdate = this.commonUserTaskProperties(taskObj, startdate);
            if (submilestoneObj) {
              taskObj.data.MileId = submilestoneObj.data.MileId + ";#" + taskObj.data.Name;
              taskObj.data.SubMilestone = submilestoneObj.data.Name;
            } else {
              taskObj.data.MileId = milestoneObj.data.MileId + ";#" + ";#" + taskObj.data.Name;
              taskObj.data.SubMilestone = '';
            }
            if (taskObj.data.Task === this.pmConstant.task.SEND_TO_CLIENT) {
              taskObj.data.AssignedTo = this.userProperties.Title;
              taskObj.isHoursDisabled = true;
              taskObj.data.showHyperLink = false;
            }
            if (taskObj.data.UseTaskDays !== this.pmConstant.task.USE_TASK_DAYS || milestoneTask[index].TaskName.Title === 'Send to client') {
              if (milestoneTask[index].TaskName.Title === 'Send to client') {
                taskObj.data.Days = taskObj.data.TaskDays;
              }
              taskObj.data.showTime = true;
            }
          }
          const resource = this.sharedTaskAllocateObj.oAllResource.filter((objt) => {
            return taskObj.data.userId === objt.UserNamePG.ID;
          });
          await this.prestackService.calcPrestackAllocation(resource, taskObj.data);
          tempTaskArray.push(taskObj);
          endateArray.push(taskObj);
          this.allTasks.push(taskObj);
          if (submilestoneObj) {
            submilestoneObj.children.push(taskObj);
          } else {
            milestoneObj.children.push(taskObj);
          }
        }
        if (!isCreate) {
          let taskObj = milestoneTask[index];
          taskObj.data.allocationColor = '';
          for (let taskTitle of taskObj.PreviousTask) {
            let arrTasks;
            if (submilestoneObj && submilestoneObj.children) {
              arrTasks = submilestoneObj.children.filter(function (obj) {
                return obj.data.Title === taskTitle;
              });
            } else {
              arrTasks = milestoneObj.children.filter(function (obj) {
                return obj.data.Title === taskTitle;
              });
            }
            if (arrTasks.length) {
              let oNewTask = arrTasks[0];
              if (newStartDate <= oNewTask.EndDate) {
                newStartDate = oNewTask.EndDate;
              }
            }
          }
          if (this.selectedSkillObject.value.userType === 'Type') {
            if (daysHours !== "") {
              startdate = this.changeStartDate(newStartDate, taskObj, "+5.5");
              startdate = this.commonTaskProperties(taskObj, startdate);
            } else {
              startdate = this.commonTaskProperties(taskObj, newStartDate);
            }
          }
          if (this.selectedSkillObject.value.userType !== 'Type') {
            let selectedSkillObj = this.pmObject.oTaskAllocation.oAllSelectedResource;
            let filterResource = selectedSkillObj.filter(function (obj) {
              let skill = obj.SkillLevel.Title.replace(' Onsite', '').replace(' Offsite', '').replace('Jr ', '').replace('Sr ', '').replace('Medium ', '');
              return taskObj.data.Skill === skill;
            });
            if (daysHours !== "") {
              startdate = this.changeStartDate(newStartDate, taskObj, timezone);
            }
            else {
              startdate = new Date(newStartDate);
            }
            if (filterResource.length) {
              taskObj.data.AssignedTo = filterResource[0].UserNamePG.Title;
              taskObj.data.userId = filterResource[0].UserNamePG.ID;
              // startdate = this.checkUserAvailability(startdate, taskObj);
            } else {
              taskObj.data.AssignedTo = milestoneTask[index].Skill;
              taskObj.data.showHyperLink = false;
            }
            if (previousTask == "") {
              milestoneObj.proposedStartDate = startdate;
            }
            startdate = this.commonUserTaskProperties(taskObj, startdate);
          }
          const resource = this.sharedTaskAllocateObj.oAllResource.filter((objt) => {
            return taskObj.data.userId === objt.UserNamePG.ID;
          });
          await this.prestackService.calcPrestackAllocation(resource, taskObj.data);
          endateArray.push(taskObj);
          tempTaskArray.push(taskObj);
          this.allTasks.push(taskObj);
          let taskIndex;
          if (submilestoneObj && submilestoneObj.children) {
            taskIndex = submilestoneObj.children.findIndex(function (obj) {
              return obj.data.TaskName === taskObj.data.TaskName;
            });
            submilestoneObj.children.splice(taskIndex, 1, taskObj);
          } else {
            taskIndex = milestoneObj.children.findIndex(function (obj) {
              return obj.data.TaskName === taskObj.data.TaskName;
            });
            milestoneObj.children.splice(taskIndex, 1, taskObj);
          }
        }
      }
      endateArray.sort(function (a, b) {
        return new Date(b.EndDate).getTime() - new Date(a.EndDate).getTime();
      });
      startdate = endateArray[0].EndDate;
      for (const element of endateArray) {
        await this.createTask(element.EndDate, isCreate, element.data.Title, element.data.UseTaskDays, element.data.assignedUserTimeZone, milestoneObj, submilestoneObj);
      }
    }

  }

  overAllocationAlert() {
    let overAllocatedTasks = this.allTasks.filter(t => t.data.allocationAlert);
    overAllocatedTasks = [...new Set(overAllocatedTasks)];
    // const resources = overAllocatedTasks.map(t => t.data.AssignedTo);
    const errorMsg = [];
    for (const resource of overAllocatedTasks) {
      const msg = resource.data.AssignedTo + ' is over allocated for task \'' + resource.data.Milestone + '-' + resource.data.SubMilestone + '-' + resource.data.TaskName + '\'';
      errorMsg.push(msg);
    }
    if (errorMsg.length) {
      this.commonService.showToastrMessage(this.constants.MessageType.warn, errorMsg.join('\n'), true, true);
    }
  }
  /**
   * This function is used to calculate the deviation between taskend date and milestone end date.
   * @param milestoneObj
   */
  private calculateMilestoneDeviationDays(ngPrimemilestoneObj) {
    if (ngPrimemilestoneObj.SubMilestones) {

      for (let index = 0; index < ngPrimemilestoneObj.children.length - 1; index++) {
        ngPrimemilestoneObj.children[index].children.sort(function (a, b) {
          return new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime(); // - new Date(a.EndDate.jsdate).getTime();
        });
      }
    } else {
      ngPrimemilestoneObj.children.sort(function (a, b) {
        return new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime(); // - new Date(a.EndDate.jsdate).getTime();
      });
    }
    this.compareMilestoneAndSCEndDate(ngPrimemilestoneObj);
    ngPrimemilestoneObj.data.Deviation = (this.pmCommonService.calcBusinessDays(ngPrimemilestoneObj.data.StartDate, ngPrimemilestoneObj.data.EndDate)) - ngPrimemilestoneObj.data.Days;// -1 because it calculate the including dates.
    this.compareMilestoneEndDate(ngPrimemilestoneObj);
  }
  /**
   * This function is used to compare the milestone end date with task end date.
   * @param milestoneObj Provide the milestoneObj
   * @param milestoneTaskObj Provide the milestoneTaskObj
   */
  private compareMilestoneEndDate(ngPrimeSubmilestoneObj) {
    if (ngPrimeSubmilestoneObj && ngPrimeSubmilestoneObj.children && ngPrimeSubmilestoneObj.children.children && ngPrimeSubmilestoneObj.children.children.tasks.length) {
      for (let milestoneTaskObj of ngPrimeSubmilestoneObj.children.children.tasks) {
        if (milestoneTaskObj.data.Task !== this.pmConstant.task.SEND_TO_CLIENT && milestoneTaskObj.data.EndDate > ngPrimeSubmilestoneObj.data.EndDate) {

          this.commonService.showToastrMessage(this.constants.MessageType.error, 'Task end date cannot be greater than milestone end date.', false);
          milestoneTaskObj.isClassErrorRedVisible = true;
        }
      }
    }
  }
  /**
   * This function create all the common properties for task.
   * @param milestoneTaskObj Provide the milestonTaskobj
   * @param startdate Provide the startdate
   */
  private commonTaskProperties(milestoneTaskObj, startdate) {
    startdate = this.calculateTaskDate(milestoneTaskObj, startdate);
    return startdate;
  }
  /**
   * This function is used to calculate the taskEnd date and next task start date.
   * @param milestoneTaskObj Provide the milestonetaskobj.
   * @param startDate Provide the date to start the task.
   */
  private calculateTaskDate(milestoneTaskObj, startDate) {
    if (startDate.getHours() === 0) {
      startDate = this.setDefaultAMHours(startDate);
    }
    milestoneTaskObj.StartDate = startDate;
    milestoneTaskObj.data.StartDate = milestoneTaskObj.StartDate;
    milestoneTaskObj.data.StartDatePart = this.getDatePart(milestoneTaskObj.data.StartDate);
    milestoneTaskObj.data.StartTimePart = this.getTimePart(milestoneTaskObj.data.StartDate);
    milestoneTaskObj.data.minStartDateValue = this.ngStandardProposedStartDate;
    if (milestoneTaskObj.data.UseTaskDays === this.pmConstant.task.USE_TASK_DAYS) {
      milestoneTaskObj.EndDate = this.calcBusinessNextDate(this.setDefaultPMHours(startDate), milestoneTaskObj.data.TaskDays === 1 ? 0 : milestoneTaskObj.data.TaskDays);
      milestoneTaskObj.data.EndDate = milestoneTaskObj.EndDate;
      milestoneTaskObj.data.EndDatePart = this.getDatePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.EndTimePart = this.getTimePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.minEndDateValue = milestoneTaskObj.data.StartDate;
      startDate = this.calcBusinessNextDate(this.setDefaultAMHours(milestoneTaskObj.EndDate), 1);
    } else {
      milestoneTaskObj.EndDate = this.pmCommonService.addTime(startDate, milestoneTaskObj.data.Hours.toString().split(".")[0], milestoneTaskObj.data.Hours.toString().split(".")[1]);
      milestoneTaskObj.data.EndDate = milestoneTaskObj.EndDate;
      milestoneTaskObj.data.EndDatePart = this.getDatePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.EndTimePart = this.getTimePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.minEndDateValue = milestoneTaskObj.data.StartDate;
      startDate = this.checkEndDay(milestoneTaskObj.EndDate, milestoneTaskObj.data.Hours);
    }
    return startDate;
  }
  /**
   * This method is used to cascade the task when start date is changed.
   * @param curObj
   */
  async cascadeStartDate(curObj) {
    if (curObj) {
      // check whether Milestone, ClientReview or Task End date Changed
      const str = this.checkStartDateChanged(curObj.MileId);
      let milestones_copy: any = this.standardFiles;
      let mileStoneArrayIndex = this.sharedTaskAllocateObj.oMilestones.findIndex(function (obj) {
        return curObj.MileId.split(';#')[0] === obj.MilestoneName;
      });
      let stardate = new Date();
      switch (str) {
        case this.pmConstant.startDate.TASK_START_DATE_CHANGED:
          let uniqueId = curObj.MileId.split(';#');
          if (uniqueId.length === 3) {
            let milestoneIndex = milestones_copy.findIndex(function (obj) {
              return uniqueId[0] === obj.data.Name;
            });
            if (milestones_copy[milestoneIndex].SubMilestones) {
              stardate = await this.subMilestoneTaskStartDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj);
            } else {
              stardate = await this.onTaskStartDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj)
            }
            this.calculateMilestoneDeviationDays(milestones_copy[milestoneIndex]);
            await this.createMilestone(mileStoneArrayIndex + 1, false, stardate);
          }
          break;
      }
      this.ngStandardProposedEndDate = this.standardFiles[this.standardFiles.length - 1].data.EndDate;
      this.OverallTATDays = this.pmCommonService.calcBusinessDays(this.standardFiles[0].data.StartDate, this.standardFiles[this.standardFiles.length - 1].data.EndDate);
    }
  }

  /**
   * This method is called when task start date changed.
   * @param milestones_copy
   * @param milestoneIndex
   * @param uniqueId
   * @param stardate
   * @param curObj
   */
  private async onTaskStartDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj) {
    let taskIndex = milestones_copy[milestoneIndex].children.findIndex(function (obj) {
      return uniqueId[2] === obj.data.Name;
    });
    if (milestoneIndex !== -1 && taskIndex !== -1) {
      stardate = curObj.StartDate;
      let taskObj = milestones_copy[milestoneIndex].children[taskIndex];
      this.sharedTaskAllocateObj.oTasks = milestones_copy[milestoneIndex].children;
      // It will cascade the remaining task in current submilestone
      if (taskIndex == 0) {
        milestones_copy[milestoneIndex].data.StartDate = stardate;
        milestones_copy[milestoneIndex].data.StartDatePart = this.getDatePart(milestones_copy[milestoneIndex].data.StartDate);
        milestones_copy[milestoneIndex].data.StartTimePart = this.getTimePart(milestones_copy[milestoneIndex].data.StartDate);
        await this.createTask(stardate, false, "", taskObj.data.TaskDays, taskObj.data.assignedUserTimeZone, milestones_copy[milestoneIndex], null);
      }
      if (taskIndex > 0) {
        let updatedStartdate = this.commonTaskProperties(taskObj, stardate);
        await this.createTask(updatedStartdate, false, taskObj.data.Title, taskObj.data.TaskDays, taskObj.data.assignedUserTimeZone, milestones_copy[milestoneIndex], null);
      }
      const taskEndDate = milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate;
      milestones_copy[milestoneIndex].data.EndDate = taskEndDate;
      milestones_copy[milestoneIndex].data.EndDatePart = this.getDatePart(milestones_copy[milestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].data.EndTimePart = this.getTimePart(milestones_copy[milestoneIndex].data.EndDate);
      // Increase the start date for next sub milestone.
      stardate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      // change the client review start date and end date after cascade.
      milestones_copy[milestoneIndex + 1].clientReviewStartDate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      milestones_copy[milestoneIndex + 1].clientReviewEndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex + 1].clientReviewStartDate, milestones_copy[milestoneIndex].data.ClientReviewDays === 1 ? 0 : milestones_copy[milestoneIndex].data.ClientReviewDays));
      stardate = this.setClientReview(this.standardFiles[milestoneIndex + 1], false);
      return stardate;
    }
  }
  /**
   * This function is used to cascade the submilestone task when start date changed.
   * @param milestones_copy
   * @param milestoneIndex
   * @param uniqueId
   * @param stardate
   * @param curObj
   */
  private async subMilestoneTaskStartDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj) {
    let subMilestoneIndex = milestones_copy[milestoneIndex].children.findIndex(function (obj) {
      return uniqueId[1] === obj.data.Name;
    });
    let taskIndex = milestones_copy[milestoneIndex].children[subMilestoneIndex].children.findIndex(function (obj) {
      return uniqueId[2] === obj.data.Name;
    });
    if (milestoneIndex !== -1 && subMilestoneIndex !== -1 && taskIndex !== -1) {
      stardate = curObj.StartDate;
      let taskObj = milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex];
      this.sharedTaskAllocateObj.oTasks = milestones_copy[milestoneIndex].children[subMilestoneIndex].children;
      // It will cascade the remaining task in current submilestone
      if (taskIndex == 0) {
        milestones_copy[milestoneIndex].data.StartDate = stardate;
        milestones_copy[milestoneIndex].data.StartDatePart = this.getDatePart(milestones_copy[milestoneIndex].data.StartDate);
        milestones_copy[milestoneIndex].data.StartTimePart = this.getTimePart(milestones_copy[milestoneIndex].data.StartDate);
        milestones_copy[milestoneIndex].children[subMilestoneIndex].data.StartDate = stardate;
        milestones_copy[milestoneIndex].children[subMilestoneIndex].data.StartDatePart = this.getDatePart(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.StartDate);
        milestones_copy[milestoneIndex].children[subMilestoneIndex].data.StartTimePart = this.getTimePart(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.StartDate);
        await this.createTask(milestones_copy[milestoneIndex].data.StartDate, false, "", taskObj.data.TaskDays, taskObj.data.assignedUserTimeZone, milestones_copy[milestoneIndex], milestones_copy[milestoneIndex].children[subMilestoneIndex]);
      }
      if (taskIndex > 0) {
        let updatedStartdate = this.commonTaskProperties(taskObj, milestones_copy[milestoneIndex].data.StartDate);
        await this.createTask(updatedStartdate, false, taskObj.data.Title, taskObj.data.TaskDays, taskObj.data.assignedUserTimeZone, milestones_copy[milestoneIndex], milestones_copy[milestoneIndex].children[subMilestoneIndex]);
      }
      const resource = this.sharedTaskAllocateObj.oAllResource.filter((objt) => {
        return taskObj.data.userId === objt.UserNamePG.ID;
      });
      await this.prestackService.calcPrestackAllocation(resource, taskObj.data);
      const taskEndDate = milestones_copy[milestoneIndex].children[subMilestoneIndex].children[milestones_copy[milestoneIndex].children[subMilestoneIndex].children.length - 1].data.EndDate;
      const subMilestoneEndDate = milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate;
      // check whether submilestone end date is greater than last task end date.
      // milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate = taskEndDate > subMilestoneEndDate ? taskEndDate : subMilestoneEndDate;
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate = taskEndDate;
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDatePart = this.getDatePart(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndTimePart = this.getTimePart(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate);
      // Increase the start date for next sub milestone.
      stardate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate, 1));
      await this.createSubMilestones(stardate, milestones_copy[milestoneIndex], false, subMilestoneIndex + 1);
      // check whether milestone end date is greater than last milestones last task.
      // milestones_copy[milestoneIndex].data.EndDate = milestones_copy[milestoneIndex].data.EndDate > milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate ? milestones_copy[milestoneIndex].data.EndDate : milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate;
      milestones_copy[milestoneIndex].data.EndDate = milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate;
      milestones_copy[milestoneIndex].data.EndDatePart = this.getDatePart(milestones_copy[milestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].data.EndTimePart = this.getTimePart(milestones_copy[milestoneIndex].data.EndDate);
      // Increase the start date for next Milestone.
      stardate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      // change the client review start date and end date after cascade.
      milestones_copy[milestoneIndex + 1].clientReviewStartDate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      milestones_copy[milestoneIndex + 1].clientReviewEndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex + 1].clientReviewStartDate, milestones_copy[milestoneIndex].data.ClientReviewDays === 1 ? 0 : milestones_copy[milestoneIndex].data.ClientReviewDays));
      stardate = this.setClientReview(this.standardFiles[milestoneIndex + 1], false);
      return stardate;

    }
  }
  /**
   * This method is cascade the task, milestone and submilestone when task end date changed.
   * @param curObj
   */
  async cascadeEndDate(curObj) {
    if (curObj) {
      // check whether Milestone, ClientReview or Task End date Changed
      const str = this.checkEndDateChanged(curObj.MileId);
      let milestones_copy: any = this.standardFiles;
      let objIndex = milestones_copy.findIndex(function (obj) {
        return curObj.MileId === obj.data.MileId;
      });
      let mileStoneArrayIndex = this.sharedTaskAllocateObj.oMilestones.findIndex(function (obj) {
        return curObj.MileId.split(';#')[0] === obj.MilestoneName;
      });
      let stardate = new Date();
      switch (str) {
        case this.pmConstant.endDate.MILESTONE_END_DATE_CHANGED:
          this.calculateMilestoneDeviationDays(milestones_copy[objIndex]);
          milestones_copy[objIndex + 1].clientReviewStartDate = this.calcBusinessNextDate(this.setDefaultAMHours(curObj.EndDate), 1);
          milestones_copy[objIndex + 1].clientReviewEndDate = this.calcBusinessNextDate(this.setDefaultPMHours(milestones_copy[objIndex + 1].clientReviewStartDate), milestones_copy[objIndex + 1].data.Days == 1 ? 0 : milestones_copy[objIndex + 1].data.Days);
          stardate = this.setClientReview(milestones_copy[objIndex + 1], false);
          await this.createMilestone(mileStoneArrayIndex + 1, false, stardate);
          break;
        case this.pmConstant.endDate.CLIENT_REVIEW_END_DATE_CHANGED:
          stardate = this.setDefaultAMHours(this.calcBusinessNextDate(curObj.EndDate, 1));
          await this.createMilestone(mileStoneArrayIndex + 1, false, stardate);
          break;
        case this.pmConstant.endDate.TASK_END_DATE_CHANGED:
          let uniqueId = curObj.MileId.split(';#');
          if (uniqueId.length === 3) {
            let milestoneIndex = milestones_copy.findIndex(function (obj) {
              return uniqueId[0] === obj.data.Name;
            });
            if (milestones_copy[milestoneIndex].SubMilestones) {
              stardate = await this.subMilestoneTaskEndDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj);
            } else {
              stardate = await this.taskEndDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj)
            }
            this.calculateMilestoneDeviationDays(milestones_copy[milestoneIndex]);
            await this.createMilestone(mileStoneArrayIndex + 1, false, stardate);
          }
          break
      }
      this.ngStandardProposedEndDate = this.standardFiles[this.standardFiles.length - 1].data.EndDate;
      this.OverallTATDays = this.pmCommonService.calcBusinessDays(this.standardFiles[0].data.StartDate, this.standardFiles[this.standardFiles.length - 1].data.EndDate);
    }
  }
  /**
   * This function is used to cascade the submilestone and task when task end date changed.
   * @param milestones_copy
   * @param milestoneIndex
   * @param uniqueId
   * @param stardate
   * @param curObj
   */
  private async subMilestoneTaskEndDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj) {
    let subMilestoneIndex = milestones_copy[milestoneIndex].children.findIndex(function (obj) {
      return uniqueId[1] === obj.data.Name;
    });
    let taskIndex = milestones_copy[milestoneIndex].children[subMilestoneIndex].children.findIndex(function (obj) {
      return uniqueId[2] === obj.data.Name;
    });
    if (milestoneIndex !== -1 && subMilestoneIndex !== -1 && taskIndex !== -1) {
      let taskObj = milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex];
      taskObj.data.EndDate = this.setDefaultPMHours(taskObj.data.EndDate);
      taskObj.data.EndDatePart = this.getDatePart(taskObj.data.EndDate);
      taskObj.data.EndTimePart = this.getTimePart(taskObj.data.EndDate);
      const resource = this.sharedTaskAllocateObj.oAllResource.filter((objt) => {
        return taskObj.data.userId === objt.UserNamePG.ID;
      });
      await this.prestackService.calcPrestackAllocation(resource, taskObj.data);
      stardate = this.setDefaultPMHours(curObj.EndDate);
      this.sharedTaskAllocateObj.oTasks = milestones_copy[milestoneIndex].children[subMilestoneIndex].children;
      // It will cascade the remaining task in current submilestone
      await this.createTask(stardate, false, taskObj.data.Title, taskObj.data.TaskDays, taskObj.data.assignedUserTimeZone, milestones_copy[milestoneIndex], milestones_copy[milestoneIndex].children[subMilestoneIndex]);
      const taskEndDate = milestones_copy[milestoneIndex].children[subMilestoneIndex].children[milestones_copy[milestoneIndex].children[subMilestoneIndex].children.length - 1].data.EndDate;
      const subMilestoneEndDate = milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate;
      // check whether submilestone end date is greater than last task end date.
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate = taskEndDate > subMilestoneEndDate ? taskEndDate : subMilestoneEndDate;
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDatePart = this.getDatePart(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndTimePart = this.getTimePart(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].children[subMilestoneIndex].data.minEndDateValue = milestones_copy[milestoneIndex].children[subMilestoneIndex].data.StartDate;
      // Increase the start date for next sub milestone.
      stardate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].children[subMilestoneIndex].data.EndDate, 1));
      await this.createSubMilestones(stardate, milestones_copy[milestoneIndex], false, subMilestoneIndex + 1);
      // check whether milestone end date is greater than last milestones last task.
      milestones_copy[milestoneIndex].data.EndDate = milestones_copy[milestoneIndex].data.EndDate > milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate ? milestones_copy[milestoneIndex].data.EndDate : milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate;
      milestones_copy[milestoneIndex].data.EndDatePart = this.getDatePart(milestones_copy[milestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].data.EndTimePart = this.getTimePart(milestones_copy[milestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].data.minEndDateValue = milestones_copy[milestoneIndex].data.StartDate;
      // Increase the start date for next Milestone.
      stardate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      // change the client review start date and end date after cascade.
      milestones_copy[milestoneIndex + 1].clientReviewStartDate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      milestones_copy[milestoneIndex + 1].clientReviewEndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex + 1].clientReviewStartDate, milestones_copy[milestoneIndex].data.ClientReviewDays === 1 ? 0 : milestones_copy[milestoneIndex].data.ClientReviewDays));
      stardate = this.setClientReview(this.standardFiles[milestoneIndex + 1], false);
      return stardate;
    }
  }
  /**
   * This function is used to cascade the task when task end date changed.
   * @param milestones_copy
   * @param milestoneIndex
   * @param uniqueId
   * @param stardate
   * @param curObj
   */
  private async taskEndDate(milestones_copy, milestoneIndex, uniqueId, stardate, curObj) {
    let taskIndex = milestones_copy[milestoneIndex].children.findIndex(function (obj) {
      return uniqueId[2] === obj.data.Name;
    });
    if (milestoneIndex !== -1 && taskIndex !== -1) {
      let taskObj = milestones_copy[milestoneIndex].children[taskIndex];
      taskObj.data.EndDate = this.setDefaultPMHours(curObj.EndDate);
      taskObj.data.EndDatePart = this.getDatePart(curObj.EndDate);
      taskObj.data.EndTimePart = this.getTimePart(curObj.EndDate);
      stardate = this.setDefaultPMHours(curObj.EndDate);
      const resource = this.sharedTaskAllocateObj.oAllResource.filter((objt) => {
        return taskObj.data.userId === objt.UserNamePG.ID;
      });
      await this.prestackService.calcPrestackAllocation(resource, taskObj.data);
      this.sharedTaskAllocateObj.oTasks = milestones_copy[milestoneIndex].children;
      // It will cascade the remaining task in current submilestone
      await this.createTask(stardate, false, taskObj.data.Title, taskObj.data.TaskDays, taskObj.data.assignedUserTimeZone, milestones_copy[milestoneIndex], null);
      milestones_copy[milestoneIndex].data.EndDate = milestones_copy[milestoneIndex].data.EndDate > milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate ? milestones_copy[milestoneIndex].data.EndDate : milestones_copy[milestoneIndex].children[milestones_copy[milestoneIndex].children.length - 1].data.EndDate;
      milestones_copy[milestoneIndex].data.EndDatePart = this.getDatePart(milestones_copy[milestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].data.EndTimePart = this.getTimePart(milestones_copy[milestoneIndex].data.EndDate);
      milestones_copy[milestoneIndex].data.minEndDateValue = milestones_copy[milestoneIndex].data.StartDate;
      // Increase the start date for next Milestone.
      stardate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      // change the client review start date and end date after cascade.
      milestones_copy[milestoneIndex + 1].clientReviewStartDate = this.setDefaultAMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex].data.EndDate, 1));
      milestones_copy[milestoneIndex + 1].clientReviewEndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestones_copy[milestoneIndex + 1].clientReviewStartDate, milestones_copy[milestoneIndex].data.ClientReviewDays === 1 ? 0 : milestones_copy[milestoneIndex].data.ClientReviewDays));
      stardate = this.setClientReview(this.standardFiles[milestoneIndex + 1], false);
      return stardate;
    }
  }

  public onStartDatePartChanged(curObj) {
    curObj.StartDate = new Date(this.datepipe.transform(curObj.StartDatePart, 'MMM d, y') + ' ' + curObj.StartTimePart);
    this.onStartDateChanged(curObj);
  }

  public onEndDatePartChanged(curObj) {
    curObj.EndDate = new Date(this.datepipe.transform(curObj.EndDatePart, 'MMM d, y') + ' ' + curObj.EndTimePart);
    this.onEndDateChanged(curObj);
  }

  /**
   * This method called the respective method when start date changed.
   * @param curObj
   */
  async onStartDateChanged(curObj) {
    this.showLoader();
    setTimeout(async () => {
      await this.cascadeStartDate(curObj);
      this.overAllocationAlert();
      let tempstand = this.standardFiles;
      this.standardFiles = [...tempstand];
      this.showTable();
    }, 100);
  }
  /**
   * This method will called respective method when end date is changed.
   * @param curObj
   */
  async onEndDateChanged(curObj) {
    this.showLoader();
    setTimeout(async () => {
      await this.cascadeEndDate(curObj);
      this.overAllocationAlert();
      let tempstand = this.standardFiles;
      this.standardFiles = [...tempstand];
      this.showTable();
    }, 100);
  }

  showTable() {
    this.hideTable = false;
    this.hideLoader = true;
  }

  showLoader() {
    this.hideLoader = false;
    this.hideTable = true;
  }
  /**
   * This function is used to check whether milestone, clientreview, submilestone or task end date is changed.
   * @param mileId
   */
  private checkEndDateChanged(mileId: string) {
    let changedString = '';
    let tempString = mileId.split(';#');
    if (tempString && tempString.length == 1) {
      changedString = this.pmConstant.endDate.MILESTONE_END_DATE_CHANGED;
    } else if (tempString && tempString.length == 3) {
      changedString = this.pmConstant.endDate.TASK_END_DATE_CHANGED;
    } else if (tempString && tempString.length == 2 && tempString[1] === this.pmConstant.task.CLIENT_REVIEW) {
      changedString = this.pmConstant.endDate.CLIENT_REVIEW_END_DATE_CHANGED;
    } else {
      changedString = this.pmConstant.endDate.SUB_MILESTONE_END_DATE_CHANGED;
    }
    return changedString;
  }
  /**
   * This method is used to check whether milestone, submilestone or task start date is changed based on mileId.
   * @param mileId
   */
  private checkStartDateChanged(mileId: string) {
    let changedString = '';
    let tempString = mileId.split(';#');
    if (tempString && tempString.length == 1) {
      changedString = this.pmConstant.startDate.MILESTONE_START_DATE_CHANGED;
    } else if (tempString && tempString.length == 3) {
      changedString = this.pmConstant.startDate.TASK_START_DATE_CHANGED;
    } else if (tempString && tempString.length == 2 && tempString[1] === this.pmConstant.task.CLIENT_REVIEW) {
      changedString = this.pmConstant.startDate.CLIENT_REVIEW_START_DATE_CHANGED;
    } else {
      changedString = this.pmConstant.startDate.SUB_MILESTONE_START_DATE_CHANGED;
    }
    return changedString;
  }
  /**
   * This method is used to change the start date based on business scenarios.
   * @param startdate
   * @param milestoneTaskObj
   * @param timezone
   */
  private changeStartDate(startdate, milestoneTaskObj, timezone) {
    startdate = this.pmCommonService.calcTimeForDifferentTimeZone(startdate, timezone, milestoneTaskObj.data.assignedUserTimeZone);
    if (milestoneTaskObj.data.UseTaskDays === this.pmConstant.task.USE_TASK_DAYS) {
      if (startdate.getHours() < 9 || (startdate.getHours() == 9 && startdate.getMinutes() == 0)) {
        startdate = this.setDefaultAMHours(startdate);
      }
      else {
        startdate = this.calcBusinessNextDate(this.setDefaultAMHours(startdate), 1);
      }
    }
    else {
      startdate = this.checkEndDay(startdate, 0);
      if (startdate.getHours() < 9 || (startdate.getHours() == 9 && startdate.getMinutes() == 0)) {
        startdate = this.setDefaultAMHours(startdate);
      }
    }
    return startdate;
  }

  /**
   * This function is used to check the user availabity on particular date.
   * @param startdate Provide the startdate.
   * @param milestoneTaskObj Provide the task object
   */
  // private checkUserAvailability(startdate, milestoneTaskObj) {
  //   let userCapacity = this.sharedObject.oCapacity.arrUserDetails;
  //   let filterUser;
  //   if (userCapacity.length > 0) {
  //     filterUser = userCapacity.filter(function (obj) {
  //       return milestoneTaskObj.data.userId === obj.uid;
  //     });
  //   }
  //   if (filterUser.length) {
  //     if (milestoneTaskObj.data.UseTaskDays === this.pmConstant.task.USE_TASK_DAYS) {
  //       startdate = this.calcTaskDays(startdate, milestoneTaskObj, filterUser);
  //     } else {
  //       startdate = this.calHoursDays(startdate, milestoneTaskObj, filterUser);
  //     }
  //   }
  //   return startdate;
  // }

  /**
   * This method is called to calculate the task days.
   * @param startdate
   * @param milestoneTaskObj
   * @param filterUser
   */
  private calcTaskDays(startdate, milestoneTaskObj, filterUser) {
    let taskTotalHours = 0;
    let tempStartDate = this.calculatePreviousBusinessDate(startdate, 1);
    let tempEndDate = this.calcBusinessNextDate(startdate, milestoneTaskObj.data.TaskDays == 1 ? 0 : milestoneTaskObj.data.TaskDays);
    while (milestoneTaskObj.data.Hours > taskTotalHours) {
      taskTotalHours = 0;
      tempStartDate = this.setZeroHours(this.calcBusinessNextDate(tempStartDate, 1));
      tempEndDate = this.setZeroHours(this.calcBusinessNextDate(tempStartDate, milestoneTaskObj.data.TaskDays == 1 ? 0 : milestoneTaskObj.data.TaskDays));
      let user = filterUser[0].dates.filter(function (obj) {
        return obj.date >= tempStartDate && obj.date <= tempEndDate;
      });
      if (user.length !== 0) {
        for (let j = 0; j < user.length; j++) {
          if (user[j].userCapacity === this.pmConstant.task.USER_AVAILABLE) {
            let availableHrs = parseFloat(user[j].availableHrs.replace(":", "."));
            taskTotalHours = taskTotalHours + availableHrs;
          }
        }
      } else {
        taskTotalHours = milestoneTaskObj.data.Hours;
      }
    }
    milestoneTaskObj.data.minEndDateValue = milestoneTaskObj.data.StartDate;
    if (milestoneTaskObj.data.Hours !== 0) {
      tempStartDate.setHours(startdate.getHours(), startdate.getMinutes(), 0, 0);
      startdate = tempStartDate;
    }
    return startdate;
  }

  /**
   * This method is to calculate the hours days.
   * @param startdate
   * @param milestoneTaskObj
   * @param filterUser
   */
  private calHoursDays(startdate, milestoneTaskObj, filterUser) {
    let hours = milestoneTaskObj.data.Hours;
    let tempStartDate = this.setZeroHours(startdate);
    let dateObj = {
      startDate: new Date(),
      endDate: new Date()
    }
    let user = filterUser[0].dates.filter(function (obj) {
      return obj.date >= tempStartDate;
    });
    let isStarDateFound = true;
    for (let i = 0; i < user.length; i++) {
      if (user[i].userCapacity === this.pmConstant.task.USER_AVAILABLE) {
        let availableHrs = parseFloat(user[i].availableHrs.replace(":", "."));
        if (availableHrs <= hours) {
          hours = hours - availableHrs;
        } else {
          hours = 0;
        }
        if (isStarDateFound && hours < milestoneTaskObj.data.Hours) {
          dateObj.startDate = user[i].date;
          isStarDateFound = false;
        }
        if (hours === 0) {
          dateObj.endDate = user[i].date;
          milestoneTaskObj.data.minEndDateValue = milestoneTaskObj.data.StartDate;
          let newStartdate = dateObj.startDate;
          newStartdate.setHours(startdate.getHours(), startdate.getMinutes(), 0, 0);
          startdate = newStartdate;
        }
      }
    }
    return startdate;
  }
  /**
   * This method is used to set the common properties for task.
   * @param milestoneTaskObj Provide the taks object
   * @param milestoneTask Provide the milestoneTask
   * @param startdate Provide the startdate
   * @param daysHours daysHours Provide the daysHours.If value is 'Yes' task will be created based on date, If value is 'No' task will be created based on hours.
   * @param index Provide the index
   * @param maxDate Provide the max date.
   */
  private commonUserTaskProperties(milestoneTaskObj, startdate) {
    startdate = this.calculateUserTaskDate(milestoneTaskObj, startdate);
    return startdate;
  }
  /**
   * This method is used to toggle the milestone by clicking on '+' sign on milestone
   * @param event Provide the event.
   */
  public toggleMilestoneTask(event) {
    const toggleElement = event.target;
    $('.standardMilestoneTaskRow').slideUp();
    $('.toggle').attr('src', '' + this.sharedObject.sharePointPageObject.publicCdn + '/expand-black.png');
    this.successMessage = null;
    this.infoMessage = null;
    if ($(toggleElement).parent().parent().next().is(':visible')) {
      $(toggleElement).parent().parent().next().slideUp();
      $(toggleElement).attr('src', '' + this.sharedObject.sharePointPageObject.publicCdn + '/expand-black.png');
    } else {
      $(toggleElement).parent().parent().next().slideDown();
      $(toggleElement).attr('src', '' + this.sharedObject.sharePointPageObject.publicCdn + '/collapse-black.png');
    }
  }
  /**
   * This method is called when the generate button clicked.
   */
  getMilestones() {
    // $('.initialUserCapacity-section').hide();
    this.hideCapacity = true;
    this.confirmDisabled = true;
    this.isStandardFetchTableHidden = true;
    let val = this.validateRequiredField(false);
    if (val) {
      // $('.standardMilestoneByType').hide();
      // $('.standard-spinner-section').show();
      this.showLoader();
      setTimeout(async () => {
        await this.getMilestoneByType();
        this.confirmDisabled = false;
      }, 100);
      // $('#standardTimelineConfirm').attr('disabled', false);
    }
  }
  /**
   * This method called another method based on skill.
   * @param skill Provide the skill
   */
  private async getMilestoneByType() {
    this.sharedTaskAllocateObj.oMilestones = await this.getStandardMilestone();
    await this.getMilestoneTask(this.sharedTaskAllocateObj.oMilestones);
    await this.generateSkillMilestones();
    this.showTable();

    // $('.standard-spinner-section').hide();
    // $('.standardMilestoneByType').show();
  }

  /**
   * This method is used to get the particular user capacity based on task start and end date.
   * @param milestoneName Provide the milestone.
   * @param taskName Provide the task name.
   * @param userCapacityRef Provide the usercapacity ref.
   */
  getUserCapacity(curObj, userCapacityRef) {

    if (curObj) {
      let milestones_copy: any = this.standardFiles;
      let uniqueId = curObj.MileId.split(';#');
      if (uniqueId.length === 3) {
        let milestoneIndex = milestones_copy.findIndex(function (obj) {
          return uniqueId[0] === obj.data.Name;
        });
        if (milestones_copy[milestoneIndex].SubMilestones) {
          let subMilestoneIndex = milestones_copy[milestoneIndex].children.findIndex(function (obj) {
            return uniqueId[1] === obj.data.Name;
          });
          let taskIndex = milestones_copy[milestoneIndex].children[subMilestoneIndex].children.findIndex(function (obj) {
            return uniqueId[2] === obj.data.Name;
          });
          if (milestoneIndex !== -1 && subMilestoneIndex !== -1 && taskIndex !== -1) {
            let selectedSkillObj = this.pmObject.oTaskAllocation.oAllSelectedResource;
            let filterResource = selectedSkillObj.filter(function (obj) {
              return milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.userId === obj.UserNamePG.ID;
            });
            if (milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.toggleCapacity) {
              setTimeout(async () => {
                milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.toggleCapacity = false;
                await userCapacityRef.applyFilterLocal(milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.StartDate, milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.EndDate, filterResource, 'PM', []);

                // const Resources = { resources: filterResource };
                // const data = { task: Resources, startTime: milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.StartDate, endTime:  milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.EndDate,Module:'PM' }

                // await userCapacityRef.Onload(data)



                // data.task.resources
                // const data = { task: Resources, startTime: oCapacityStartDate, endTime: oCapacityEndDate,Module:'PM' }

                // await userCapacityRef.Onload(data)

              }, 100);
            } else {
              milestones_copy[milestoneIndex].children[subMilestoneIndex].children[taskIndex].data.toggleCapacity = true;
            }
          }
        } else {
          let taskIndex = milestones_copy[milestoneIndex].children.findIndex(function (obj) {
            return uniqueId[2] === obj.data.Name;
          });
          if (milestoneIndex !== -1 && taskIndex !== -1) {
            let selectedSkillObj = this.pmObject.oTaskAllocation.oAllSelectedResource;
            let filterResource = selectedSkillObj.filter(function (obj) {
              return milestones_copy[milestoneIndex].children[taskIndex].data.userId === obj.UserNamePG.ID;
            });
            if (milestones_copy[milestoneIndex].children[taskIndex].data.toggleCapacity) {
              setTimeout(async () => {
                milestones_copy[milestoneIndex].children[taskIndex].data.toggleCapacity = false;
                await userCapacityRef.applyFilterLocal(milestones_copy[milestoneIndex].children[taskIndex].data.StartDate, milestones_copy[milestoneIndex].children[taskIndex].data.EndDate, filterResource, 'PM', []);

                // const Resources = { resources: filterResource };
                // const data = { task: Resources, startTime: milestones_copy[milestoneIndex].children[taskIndex].data.StartDate, endTime:  milestones_copy[milestoneIndex].children[taskIndex].data.EndDate,Module:'PM' }

                // await userCapacityRef.Onload(data)

              }, 100);
            } else {
              milestones_copy[milestoneIndex].children[taskIndex].data.toggleCapacity = true;
            }
          }
        }
      }
    }
  }
  /**
   * This method is used to calculate the next business date based on number.
   * @param lastDate Provide the current date.
   * @param number Provide the number.
   */
  private calcBusinessNextDate(lastDate, number) {
    let endDate = lastDate;
    number = number - 1;
    number = number === 0 ? 1 : number;
    for (var nCount = 1; nCount <= number; nCount++) {
      if (endDate.getDay() === 5) {
        endDate = this.addDays(endDate, 3);
      }
      else if (endDate.getDay() === 6) {
        endDate = this.addDays(endDate, 2);
      }
      else if (endDate.getDay() === 0) {
        endDate = this.addDays(endDate, 1);
      }
      else
        endDate = this.addDays(endDate, 1);
    }
    return new Date(endDate);
  }
  /**
   * This method is used to set the time for 9 am on date.
   * @param date Provide the date.
   */
  private setDefaultAMHours(date) {
    let convertedDate = new Date(date)
    convertedDate.setHours(9, 0, 0, 0);
    return new Date(convertedDate)
  }
  /**
   * This method is used to set the time on date i.e 6 PM.
   * @param date Provide the date
   */
  private setDefaultPMHours(date) {
    let convertedDate = new Date(date);
    convertedDate.setHours(this.pmConstant.task.PER_DAY_MAX_HOURS, 0, 0, 0);
    // return this.convertDatePickerFormat(convertedDate);
    return new Date(convertedDate);
  }
  /**
   * This method is used to set the 12 AM on date.
   * @param date provide the date.
   */
  private setZeroHours(date) {
    let convertedDate = new Date(date)
    convertedDate.setHours(0, 0, 0, 0);
    // return this.convertDatePickerFormat(convertedDate);
    return new Date(convertedDate);
  }

  /**
   * This method is used to check the validation.
   */
  private validateRequiredField(isRegisterClick) {
    if (!this.selectedService) {
      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select the service.', false);
      return false;
    }
    if (!this.selectedSkillObject || !this.selectedSkillObject.value.userType) {

      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select the resource.', false);
      return false;
    }
    if (!this.selectedResourceObject || !this.selectedResourceObject.value.userType) {

      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select the reviewer.', false);
      return false;
    }
    // if (this.selectedSkillObject.value.userType === 'Type') {
    if (!this.ngStandardProposedStartDate) {
      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please select the proposed start date.', false);
      return false;
    }
    // }
    if (!this.standardProjectBudgetHrs) {

      this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Please enter the project Budget Hrs.', false);
      return false;
    }
    if (this.standardProjectBudgetHrs) {
      // tslint:disable
      if (parseFloat(this.standardProjectBudgetHrs) <= 0) {

        this.commonService.showToastrMessage(this.constants.MessageType.error, 'Please enter the valid Budget Hrs.', false);
        return false;
      }
      if (isNaN(parseFloat(this.standardProjectBudgetHrs))) {

        this.commonService.showToastrMessage(this.constants.MessageType.error, 'Please enter the Budget Hrs in number.', false);
        return false;
      }
    }

    if (!this.pmObject.OwnerAccess.selectedDeliveryOwner || !this.pmObject.OwnerAccess.selectedCMOwner
    ) {
      const Message = !this.pmObject.OwnerAccess.selectedCMOwner ? 'CM' : 'Delivery';
        this.commonService.showToastrMessage(this.constants.MessageType.warn,Message + ' Owner is required.Project rule not defined for '+Message+'. Please define at-least one '+ Message +' rule to create project.',false);
      return false;
    }


    if (
      this.pmObject.OwnerAccess.selectedCMAccess &&
      this.pmObject.OwnerAccess.selectedCMAccess.length === 0
    ) {
      this.commonService.showToastrMessage(
        this.constants.MessageType.error,
        " CM Access is required.",
        false
      );
      return false;
    }
    if (isRegisterClick && this.standardMilestone.milestones && this.standardMilestone.milestones.length) {
      for (const milestone of this.standardMilestone.milestones) {
        if (milestone.MilestoneDeviation > 0) {
          let retVal = confirm("There are some milestone having deviation more than 1. Do you want to continue ?");
          if (retVal == true) {
            return true;
          }
          else {
            return false;
          }
        }
      }
    }
    return true;
  }
  /**
   * This function is used to check for end of the day.
   * @param date Provide the date.
   * @param workHours Provide the workHours.
   */
  private checkEndDay(date, workHours) {
    date = new Date(date);
    if (date.getHours() >= this.pmConstant.task.PER_DAY_MAX_END_HOURS || workHours == this.pmConstant.task.PER_DAY_MAX_HOURS) {
      date = this.setDefaultAMHours(date.setDate(date.getDate() + 1));
      date.setDate(date.getDay() === 6 ? date.getDate() + 2 : date.getDate() + 0);
    }
    return new Date(date);
  }
  /**
   * This function is used to remove the duplicate from array based on object property.
   * @param myArr Provide the array
   * @param prop Provide the object property to remove the duplicate from array.
   */
  private removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }
  /**
   * This method is used to calculate the previous business date.
   * @param endDate Provide the date.
   * @param days Provide the date.
   */
  private calculatePreviousBusinessDate(endDate, days) {
    for (var nCount = 0; nCount < days; nCount++) {
      let checkDate = endDate;
      if (checkDate) {
        endDate = new Date(endDate);
      } else {
        endDate = new Date(endDate);
      }
      if (endDate.getDay() === 1) {
        endDate = this.addDays(endDate, -3);
      }
      else if (endDate.getDay() === 0) {
        endDate = this.addDays(endDate, -2);
      }
      else if (endDate.getDay() === 6) {
        endDate = this.addDays(endDate, -1);
      }
      else
        endDate = this.addDays(endDate, -1);
    }
    // return this.convertDatePickerFormat(endDate);
    return new Date(endDate);
  }
  /**
   * This method get called when register button is clicked.
   * This set all the milestone and other object so that it will directly available on angular 1 or js file.
   */
  async saveTimelineData() {
    let isTrue = this.validateRequiredField(true);

    if (this.pmObject.addProject.FinanceManagement.selectedFile && this.pmObject.addProject.FinanceManagement.selectedFile.size === 0) {

      this.commonService.showToastrMessage(this.constants.MessageType.error, this.constants.Messages.ZeroKbFile.replace('{{fileName}}', this.pmObject.addProject.FinanceManagement.selectedFile.name), false);
    }

    if (isTrue) {
      this.disableField();
      // $('.standardMilestoneByType').hide();
      // $('.standardMilestone-fetch').show();
      this.hideTable = true;
      this.isStandardFetchTableHidden = false;
      this.isStandardFetchTableHidden = false;
      this.pmObject.addProject.Timeline.Standard.IsStandard = true;
      this.pmObject.addProject.Timeline.Standard.IsRegisterButtonClicked = true;
      this.pmObject.addProject.Timeline.Standard.Service = this.selectedService;
      this.pmObject.addProject.Timeline.Standard.Reviewer = this.selectedSkillObject.value;
      this.pmObject.addProject.Timeline.Standard.Resource = this.selectedResourceObject.value;
      this.setDropdownField();
      this.pmObject.addProject.Timeline.Standard.ProposedStartDate = this.ngStandardProposedStartDate;
      this.pmObject.addProject.Timeline.Standard.ProposedEndDate = this.ngStandardProposedEndDate;
      this.pmObject.addProject.Timeline.Standard.OverallTat = this.OverallTATDays;
      this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours = this.standardProjectBudgetHrs;
      this.pmObject.addProject.Timeline.Standard.StandardBudgetHrs = this.standardBudgetHrs;
      this.pmObject.addProject.Timeline.Standard.standardArray = this.standardFiles;
      this.pmObject.addProject.FinanceManagement.BudgetHours = this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours;
      this.pmObject.addProject.ProjectAttributes.ActiveCM1 = this.pmObject.OwnerAccess.selectedCMAccess;
      this.pmObject.addProject.ProjectAttributes.ActiveCM2 = this.pmObject.OwnerAccess.selectedCMOwner;

      this.pmObject.addProject.ProjectAttributes.ActiveDelivery1 = this.pmObject.OwnerAccess.selectedDeliveryAccess;
      this.pmObject.addProject.ProjectAttributes.ActiveDelivery2 = this.pmObject.OwnerAccess.selectedDeliveryOwner;
     
      if(this.pmObject.addProject.ProjectAttributes.ActiveCM1.find(c=> c !== this.sharedObject.currentUser.userId) && this.pmObject.OwnerAccess.cmLevel1.find(c=>c.value === this.sharedObject.currentUser.userId)){

        this.pmObject.addProject.ProjectAttributes.ActiveCM1.push(this.sharedObject.currentUser.userId);
      }

      if(this.pmObject.addProject.ProjectAttributes.ActiveDelivery1.find(c=> c !== this.sharedObject.currentUser.userId) && this.pmObject.OwnerAccess.deliveryLevel1.find(c=>c.value === this.sharedObject.currentUser.userId)){

        this.pmObject.addProject.ProjectAttributes.ActiveDelivery1.push(this.sharedObject.currentUser.userId);
      }


      // await this.pmCommonService.validateAndSave();
      // new code by maxwell file upload progress bar

      this.pmObject.isMainLoaderHidden = false;
      const newProjectCode = await this.pmCommonService.verifyAndUpdateProjectCode();
      this.pmObject.addProject.ProjectAttributes.ProjectCode = newProjectCode;
      if (newProjectCode) {
        if (this.pmObject.addProject.FinanceManagement.selectedFile) {
          let SelectedFile = [];
          this.pmObject.isMainLoaderHidden = true;
          this.commonService.SetNewrelic('projectManagment', 'addproj-addtimeline-Std', 'UploadFiles', "POST-BATCH");

          const FolderName = await this.pmCommonService.getFolderName();
          SelectedFile.push(new Object({ name: this.pmObject.addProject.FinanceManagement.selectedFile.name, file: this.pmObject.addProject.FinanceManagement.selectedFile }));
          this.commonService.UploadFilesProgress(SelectedFile, FolderName, true).then(async uploadedfile => {
            if (SelectedFile.length > 0 && SelectedFile.length === uploadedfile.length) {
              if (uploadedfile[0].ServerRelativeUrl) {
                this.pmObject.addProject.FinanceManagement.SOWFileURL = uploadedfile[0].ServerRelativeUrl;
                this.pmObject.addProject.FinanceManagement.SOWFileName = uploadedfile[0].Name;
                this.pmObject.addProject.FinanceManagement.SOWFileProp = uploadedfile[0];
                this.pmObject.addSOW.isSOWCodeDisabled = false;
                this.pmObject.addSOW.isStatusDisabled = true;
              }
            }
            this.CallAddUpdateProject();
          });
        }
        else {
          this.CallAddUpdateProject();
        }
      }
    }
  }

  async CallAddUpdateProject() {
    this.pmObject.isMainLoaderHidden = false;
    await this.pmCommonService.addUpdateProject();
    this.commonService.showToastrMessage(this.constants.MessageType.success, 'Project Created Successfully - ' + this.pmObject.addProject.ProjectAttributes.ProjectCode, true);
    this.pmCommonService.reloadPMPage();
  }


  setFieldProperties() {
    if (this.pmObject.addProject.Timeline.Standard.IsStandard) {
      this.pmObject.isStandardChecked = true;
    }
    if (this.pmObject.addProject.Timeline.Standard.IsRegisterButtonClicked) {
      this.disableField();
    }
    if (this.pmObject.addProject.Timeline.Standard.ProposedStartDate) {
      this.ngStandardProposedStartDate = this.pmObject.addProject.Timeline.Standard.ProposedStartDate
    }
    if (this.pmObject.addProject.Timeline.Standard.ProposedEndDate) {
      this.ngStandardProposedEndDate = this.pmObject.addProject.Timeline.Standard.ProposedEndDate
    }
    if (this.pmObject.addProject.Timeline.Standard.OverallTat) {
      this.OverallTATDays = this.pmObject.addProject.Timeline.Standard.OverallTat
    }
    if (this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours) {
      this.standardProjectBudgetHrs = this.pmObject.addProject.Timeline.Standard.StandardProjectBugetHours
    }
    if (this.pmObject.addProject.Timeline.Standard.StandardBudgetHrs) {
      this.standardBudgetHrs = this.pmObject.addProject.Timeline.Standard.StandardBudgetHrs
    }
    if (this.pmObject.addProject.Timeline.Standard.standardArray && this.pmObject.addProject.Timeline.Standard.standardArray.length) {
      this.standardFiles = this.pmObject.addProject.Timeline.Standard.standardArray
      // this.showTable();
      // $('.standardMilestoneByType').hide();
      // $('.standardMilestone-fetch').show();
      this.hideTable = false;
      this.isStandardFetchTableHidden = false;
    }
  }
  setDropdownField() {
    if (this.pmObject.addProject.Timeline.Standard.Service) {
      this.registerStandardServices = [{ label: this.pmObject.addProject.Timeline.Standard.Service, value: this.pmObject.addProject.Timeline.Standard.Service }];
    }
    if (this.pmObject.addProject.Timeline.Standard.Reviewer) {
      const reviewer: any = this.pmObject.addProject.Timeline.Standard.Reviewer;
      if (reviewer) {
        this.registerSkillTypes = [{ label: reviewer.Title, value: reviewer.Title }];
      }
    }
    if (this.pmObject.addProject.Timeline.Standard.Resource) {
      const resource: any = this.pmObject.addProject.Timeline.Standard.Resource;
      if (resource) {
        this.registerReviewerList = [{ label: resource.Title, value: resource.Title }];
      }
    }
  }
  /**
   * This method is used to disable multiple field
   */
  disableField() {
    this.isServiceDisabled = true;
    this.isResourceDisabled = true;
    this.isReviewerDisabled = true;
    this.isProposedStartDateDisabled = true;
    $('#standardProjectBudgetHrs').attr("disabled", 'true');
    $('#standardTimeline').attr("disabled", 'true');
    $('#nonStandardTimeline').attr("disabled", 'true');
    $('#standardTimelineCapacity').attr("disabled", 'true');
    // $('#standardTimelineConfirm').attr("disabled", 'true');
    this.confirmDisabled = true;
    $('#standardTimelineGenerate').attr("disabled", 'true');
  }
  /**
   * This method is used to enable the disabled field.
   */
  // enabledField() {
  //   this.resetField();
  //   // $('.standardMilestone-fetch').hide();
  //   this.isStandardFetchTableHidden = true;
  //   this.isServiceDisabled = false;
  //   this.isResourceDisabled = false;
  //   this.isReviewerDisabled = false;
  //   this.isProposedStartDateDisabled = false;
  //   $('#standardProjectBudgetHrs').attr("disabled", 'false');
  //   $('#standardTimeline').attr("disabled", 'false');
  //   $('#nonStandardTimeline').attr("disabled", 'false');
  //   $('#standardTimelineCapacity').attr("disabled", 'false');
  //   $('#standardTimelineGenerate').attr("disabled", 'false');
  //   this.loadStandardTimeline();
  // }
  /**
   * This method is used to rese the field.
   */
  private resetField() {
    this.standardBudgetHrs = '';
    this.standardProjectBudgetHrs = '';
    this.OverallTATDays = '';
    if (this.serviceId !== undefined)
      this.serviceId.handleClearClick();
    if (this.resourceId !== undefined)
      this.resourceId.handleClearClick();
    if (this.reviewerId !== undefined)
      this.reviewerId.handleClearClick();
    this.ngStandardProposedStartDate = '';
    this.ngStandardProposedEndDate = '';
    this.skillTypes = [];
    this.reviewerList = [];
  }

  onChangeResetField() {
    this.standardBudgetHrs = '';
    this.standardProjectBudgetHrs = '';
    this.OverallTATDays = '';
    this.ngStandardProposedStartDate = '';
    this.ngStandardProposedEndDate = '';
    this.skillTypes = [];
    this.reviewerList = [];
  }
  private calculateUserTaskDate(milestoneTaskObj, startDate) {
    milestoneTaskObj.StartDate = startDate; //this.convertDatePickerFormat(this.commonservice.calcTimeForDifferentTimeZone(startDate,timezone,milestoneTaskObj.assignedUserTimeZone));
    milestoneTaskObj.data.StartDate = milestoneTaskObj.StartDate;
    milestoneTaskObj.data.StartDatePart = this.getDatePart(milestoneTaskObj.data.StartDate);
    milestoneTaskObj.data.StartTimePart = this.getTimePart(milestoneTaskObj.data.StartDate);
    milestoneTaskObj.data.minStartDateValue = this.ngStandardProposedStartDate;
    if (milestoneTaskObj.data.UseTaskDays === this.pmConstant.task.USE_TASK_DAYS) {
      milestoneTaskObj.EndDate = this.setDefaultPMHours(this.calcBusinessNextDate(milestoneTaskObj.StartDate, milestoneTaskObj.data.TaskDays == 1 ? 0 : milestoneTaskObj.data.TaskDays));
      milestoneTaskObj.data.EndDate = milestoneTaskObj.EndDate;
      milestoneTaskObj.data.EndDatePart = this.getDatePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.EndTimePart = this.getTimePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.minEndDateValue = milestoneTaskObj.data.StartDate;
      startDate = this.calcBusinessNextDate(this.setDefaultAMHours(milestoneTaskObj.EndDate), 1);
    } else {
      milestoneTaskObj.EndDate = this.pmCommonService.addTime(startDate, milestoneTaskObj.data.Hours.toString().split(".")[0], milestoneTaskObj.data.Hours.toString().split(".")[1]);
      milestoneTaskObj.data.EndDate = milestoneTaskObj.EndDate;
      milestoneTaskObj.data.EndDatePart = this.getDatePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.EndTimePart = this.getTimePart(milestoneTaskObj.data.EndDate);
      milestoneTaskObj.data.minEndDateValue = milestoneTaskObj.data.StartDate;
      startDate = this.checkEndDay(milestoneTaskObj.data.EndDate, milestoneTaskObj.data.Hours);
    }
    return startDate;
  }
  goToProjectAttributes() {
    this.pmObject.activeIndex = 2;
  }

  openPopup(data) {
    this.taskMenu = [];
    this.taskMenu.push(
      { label: 'Edit Allocation', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, '') },
      { label: 'Equal Allocation', icon: 'pi pi-sliders-h', command: (event) => this.editAllocation(data, 'Equal') }
    );
  }

  editAllocation(milestoneTask, allocationType): void {
    milestoneTask.resources = this.sharedTaskAllocateObj.oAllResource.filter((objt) => {
      return objt.UserNamePG.ID === milestoneTask.userId;
    });

    const ref = this.dialogService.open(PreStackAllocationComponent, {
      data: {
        ID: milestoneTask.id,
        task: milestoneTask.taskFullName,
        startDate: milestoneTask.StartDatePart,
        endDate: milestoneTask.EndDatePart,
        startTime: milestoneTask.StartTimePart,
        endTime: milestoneTask.EndTimePart,
        budgetHrs: milestoneTask.Hours,
        resource: milestoneTask.resources,
        strAllocation: milestoneTask.allocationPerDay,
        strTimeSpent: '',
        allocationType
      } as IDailyAllocationTask,
      width: '90vw',

      header: milestoneTask.SubMilestone ? milestoneTask.Milestone + ' ' + milestoneTask.TaskName
        + ' ( ' + milestoneTask.SubMilestone + ' )' : milestoneTask.Milestone + ' ' + milestoneTask.TaskName,
      contentStyle: { 'max-height': '90vh', 'overflow-y': 'auto' },
      closable: false
    });
    ref.onClose.subscribe((allocation: any) => {
      this.prestackService.setAllocationPerDay(allocation, milestoneTask);
      if (allocation.allocationAlert) {

        this.commonService.showToastrMessage(this.constants.MessageType.warn, 'Resource is over allocated', false);
      }
    });
  }

  showOverlayPanel(event, rowData, dailyAllocateOP, target?) {
    const allocationPerDay = rowData.allocationPerDay ? rowData.allocationPerDay : '';
    dailyAllocateOP.showOverlay(event, allocationPerDay, target);
    setTimeout(() => {
      let panel: any = document.querySelector(
        '.dailyAllocationOverlayComp > div'
      );
      let leftAdjest = 0;
      let topAdjest = 0;
      let container: any = document.querySelector('.ui-dialog.ui-widget.ui-widget-content');
      let container2: any = document.querySelector('.ui-dialog-content.ui-widget-content');
      if (container) {
        leftAdjest = parseInt(container.style.left.split('.')[0]);
      }
      if (container2) {
        topAdjest = container2.scrollTop;
      }
      if (topAdjest) {
        panel.style.top = topAdjest + 'px';

      } else {
        panel.style.top = Math.abs(event.screenY - 100) + 'px';
      }
      panel.style.left = (event.screenX - leftAdjest) + 'px';
    }, 50);
  }

  hideOverlayPanel() {
    this.dailyAllocateOP.hideOverlay();
  }


  async getProjectRules(){
    await this.pmCommonService.FilterRules();   
  }
}
