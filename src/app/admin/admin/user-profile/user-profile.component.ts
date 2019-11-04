import { Component, OnInit, NgZone, ApplicationRef, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe, PlatformLocation } from '@angular/common';
import { PeoplePickerUser } from '../../peoplePickerModel/people-picker.response';
import { PeoplePickerQuery } from '../../peoplePickerModel/people-picker.query';
import { AdminCommonService } from '../../services/admin-common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from '../../services/admin-constant.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { MessageService } from 'primeng/api';
import { AdminObjectService } from '../../services/admin-object.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { GlobalService } from 'src/app/Services/global.service';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  encapsulation: ViewEncapsulation.None
})

/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 *
 * This class is used to add/update user into a `Resource Categorization` list.
 */
export class UserProfileComponent implements OnInit {
  userProfileColumns = [];
  userProfileData = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  userProfileViewDataArray = [];
  minPastMonth;
  yearRange: any;
  showModal = false;
  showeditUser = false;
  isUserProfileRightSideVisible = false;
  userFilterOptions = [];
  customLabel = '';
  showUserInput = false;
  providedUser = '';
  selectedOption = '';
  pMenuItems = [];
  upObject = {
    isFormSubmit: false,
    isEditFormSubmit: false
  };
  addUser: FormGroup;
  editUser: FormGroup;
  currUserObj: any;
  /**
   * This field contains an array for each drop down value which present on the form.
   */
  public adminDropDown = {
    bucketArray: [],
    practiceAreaArray: [],
    timeZoneArray: [],
    inCapacityArray: [],
    pooledArray: [],
    primarySkillArray: [],
    skillLevelArray: [],
    roleArray: [],
    taskArray: [],
    accountArray: [],
    deliverableArray: [],
    deliverableExclusionArray: [],
    taArray: [],
    taExclusionArray: [],
    isActiveArray: []
  };
  // This declaration is used to check which effective date is need to be shown when one
  // of the field is changed.
  public date = {
    isManagerEffectiveDateActive: false,
    isPracticeEffectiveDateActive: false,
    isTimeZoneEffectiveDateActive: false,
    isPrimarySkillEffectiveDateActive: false,
    isSkillLevelEffectiveDateActive: false,
    isDateExit: false
  };
  userProfileColArray = {
    User: [],
    LastUpdated: [],
    LastUpdatedBy: []
  };
  auditHistoryArray = {
    User: [],
    ActionBy: [],
    ActionDate: [],
    Details: []
  };
  public users: PeoplePickerUser[];
  public multipleUsers: PeoplePickerUser[];
  spuser: PeoplePickerUser;
  spusers: PeoplePickerUser[];
  /**
   * PrincipalSource: What sources you wish to search.
   * Choices are
   * 1. All - 15
   * 2. Membership Provider - 4
   * 3. RoleProvider - 8
   * 4. UserInfoList - 1
   * 5. Windows - 2.
   * These values can be combined.
   *
   * PrincipalType: Controls the type of entities that are returned in the results.
   * Choices are
   * 1. All - 15
   * 2. Distribution List - 2
   * 3. Security Groups - 4
   * 4. SharePoint Groups – 8
   * 5. User – 1. These values can be combined.
   * For more details - http://sharepointfieldnotes.blogspot.com/2014/06/sharepoint-2013-clientpeoplepicker.html
   */
  peoplePickerQuery: PeoplePickerQuery = {
    queryParams: {
      QueryString: '',
      MaximumEntitySuggestions: 10,
      AllowEmailAddresses: true,
      AllowOnlyEmailAddresses: false,
      PrincipalSource: 15,
      PrincipalType: 1,
      SharePointGroupID: 0
    }
  };
  filteredCountriesMultiple: any[];
  /**
   * Construct a method to create an instance of required component.
   *
   * @param datepipe This is instance referance of `DatePipe` component.
   * @param frmbuilder This is instance referance of `FormBuilder` component.
   * @param adminCommonService This is instance referance of `AdminCommonService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param messageService This is instance referance of `MessageService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @param common This is instance referance of `CommonService` component.
   */
  constructor(
    private datePipe: DatePipe,
    private frmbuilder: FormBuilder,
    private adminCommonService: AdminCommonService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private spServices: SPOperationService,
    private messageService: MessageService,
    private adminObject: AdminObjectService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private zone: NgZone,
    private applicationRef: ApplicationRef,
    private common: CommonService,
    private globalObject: GlobalService,
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
    });
    this.addUser = frmbuilder.group({
      username: ['', Validators.required],
      account: ['', null],
      bucket: ['', Validators.required],
      dateofexit: ['', null],
      dateofjoin: ['', Validators.required],
      deliverableExclusion: ['', null],
      deliverable: ['', null],
      designation: ['', Validators.required],
      liveDate: ['', Validators.required],
      inCapacity: ['', Validators.required],
      isActive: ['', null],
      manager: ['', Validators.required],
      maxHrs: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      pooled: ['', Validators.required],
      primarySkill: ['', Validators.required],
      readyTo: ['', null],
      role: ['', null],
      skillLevel: ['', Validators.required],
      ta: ['', null],
      taExclusion: ['', null],
      task: ['', Validators.required],
      timeZone: ['', Validators.required],
      practiceArea: ['', Validators.required],
      managerEffectiveDate: ['', null],
      practiceAreaEffectiveDate: ['', null],
      timeZoneEffectiveDate: ['', null],
      primarySkillEffectiveDate: ['', null],
      skillLevelEffectiveDate: ['', null],
      workSunday: ['', null],
      workMonday: ['', null],
      workTuesday: ['', null],
      workWednessday: ['', null],
      workThursday: ['', null],
      workFriday: ['', null],
      workSaturday: ['', null]
    });
  }
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  async ngOnInit() {
    this.minPastMonth = new Date(new Date().setDate(new Date().getDate() - 30));
    const currentYear = new Date();
    this.yearRange = (currentYear.getFullYear() - 10) + ':' + (currentYear.getFullYear() + 10);
    this.userProfileColumns = [
      { field: 'User', header: 'User', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: true, exportable: false },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false },
      { field: 'LastUpdatedBy', header: 'Last Updated By', visibility: true },
    ];
    this.auditHistoryColumns = [
      { field: 'User', header: 'User' },
      { field: 'ActionBy', header: 'Action By' },
      { field: 'ActionDate', header: 'Action Date' },
      { field: 'Details', header: 'Details' }
    ];

    this.auditHistoryRows = [
      {
        User: 'User Created',
        ActionBy: '',
        ActionDate: '',
        Details: ''
      }
    ];
    await this.loadUserTable();
    this.colFilters(this.userProfileData);
    this.colFilters1(this.auditHistoryRows);
    this.loadDropDownValue();
  }
  /**
   * Construct a method to set the conditional validators when form edited.
   * @description
   *
   * Conditional validation will check the following field while perform edit operation.
   * 1. If `Practice Area` field values changes then `Practive Area Effective Date` becomes compulsary field.
   * 2. If `Manager` field values changes then `Manager Effective Date` becomes compulsary field.
   * 3. If `TimeZone` field values changes then `TimeZone Effective Date` becomes compulsary field.
   * 4. If `Primary Skill` field values changes then `Primary Skill Effective Date` becomes compulsary field.
   * 5. If `Skill Level` field values changes then `Skill Level Effective Date` becomes compulsary field.
   * 6. If `Is Active` field values changes to `No` then `Date of Exit` becomes compulsary field.
   *
   */
  setUserCategoryValidators() {
    const managerEffectiveDateControl = this.addUser.get('managerEffectiveDate');
    const practiceAreaEffectiveDateControl = this.addUser.get('practiceAreaEffectiveDate');
    const timeZoneEffectiveDateControl = this.addUser.get('timeZoneEffectiveDate');
    const primarySkillEffectiveDateControl = this.addUser.get('primarySkillEffectiveDate');
    const skillLevelEffectiveDateControl = this.addUser.get('skillLevelEffectiveDate');
    const dateofexitControl = this.addUser.get('dateofexit');
    this.addUser.get('manager').valueChanges
      .subscribe(manager => {
        if (this.date.isManagerEffectiveDateActive) {
          managerEffectiveDateControl.setValidators([Validators.required]);
          managerEffectiveDateControl.updateValueAndValidity();
        }
      });
    this.addUser.get('practiceArea').valueChanges
      .subscribe(practiceArea => {
        if (this.date.isPracticeEffectiveDateActive) {
          practiceAreaEffectiveDateControl.setValidators([Validators.required]);
          practiceAreaEffectiveDateControl.updateValueAndValidity();
        }
      });
    this.addUser.get('timeZone').valueChanges
      .subscribe(practiceArea => {
        if (this.date.isTimeZoneEffectiveDateActive) {
          timeZoneEffectiveDateControl.setValidators([Validators.required]);
          timeZoneEffectiveDateControl.updateValueAndValidity();
        }
      });
    this.addUser.get('primarySkill').valueChanges
      .subscribe(practiceArea => {
        if (this.date.isPrimarySkillEffectiveDateActive) {
          primarySkillEffectiveDateControl.setValidators([Validators.required]);
          primarySkillEffectiveDateControl.updateValueAndValidity();
        }
      });
    this.addUser.get('skillLevel').valueChanges
      .subscribe(practiceArea => {
        if (this.date.isSkillLevelEffectiveDateActive) {
          skillLevelEffectiveDateControl.setValidators([Validators.required]);
          skillLevelEffectiveDateControl.updateValueAndValidity();
        }
      });
  }
  /**
   * Construct a REST_API Call request for getting data from `Resource Categerization` list
   * based on filter `IsActive ='Yes'`.
   * @description
   *
   * Once the response return from REST Call, Iterate through each item and store into the
   * `userProfileData` array to display the result into Ng Prime table.
   */
  isUserSPMUPA: boolean;
  async loadUserTable() {
    this.adminObject.isMainLoaderHidden = false;

    let resCatFilter: any = {};
    if (this.globalObject.userInfo.Groups.results.length) {
      const groups = this.globalObject.userInfo.Groups.results.map(x => x.LoginName);
      if (groups.indexOf('SPTeam') > -1 || groups.indexOf('Managers') > -1 || groups.indexOf('User_Profile_Admin') > -1) {
        this.isUserSPMUPA = true;
        resCatFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION);
        resCatFilter.filter = resCatFilter.filter.replace(/{{isActive}}/gi,
          this.adminConstants.LOGICAL_FIELD.YES);
      } else {
        this.isUserSPMUPA = false;
        resCatFilter = Object.assign({}, this.adminConstants.QUERY.GET_ACCESS_RESOURCE_CATEGERIZATION);
        resCatFilter.filter = resCatFilter.filter.replace(/{{isActive}}/gi,
          this.adminConstants.LOGICAL_FIELD.YES).replace(/{{UserId}}/gi,
            this.globalObject.currentUser.userId);
      }
    }

    // const resCatFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION);
    // resCatFilter.filter = resCatFilter.filter.replace(/{{isActive}}/gi,
    //   this.adminConstants.LOGICAL_FIELD.YES);

    const sResult = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, resCatFilter);
    const tempResult = [];
    if (sResult && sResult.length > 0) {
      // this.setValueInGlobalObject(sResult[0], false);
      for (const item of sResult) {
        const userObj = Object.assign({}, this.adminObject.addUser);
        userObj.UserNameEmail = item.UserName.EMail;
        userObj.UserId = item.UserName.ID;
        userObj.ManagerEmail = item.Manager.EMail;
        userObj.ManagerId = item.Manager.ID;
        userObj.Bucket = item.Bucket;
        userObj.PracticeArea = item.Practice_x0020_Area;
        userObj.TimeZone = item.TimeZone;
        userObj.DateOfJoining = item.DateOfJoining;
        userObj.GoLiveDate = item.GoLiveDate;
        userObj.Designation = item.Designation;
        userObj.InCapacity = item.InCapacity;
        userObj.Pooled = item.Pooled;
        userObj.MaxHrs = item.MaxHrs;
        userObj.PrimarySkill = item.PrimarySkill;
        userObj.SkillLevel = item.SkillLevel;
        userObj.Role = item.Role;
        userObj.ReadyTo = item.Ready_x0020_To;
        userObj.Task = item.Tasks;
        userObj.Account = item.Account;
        userObj.Deliverable = item.Deliverables;
        userObj.DeliverableExclusion = item.DeliverableExclusion;
        userObj.TA = item.TA;
        userObj.TAExclusion = item.TAExclusion;
        userObj.PracticeAreaEffectiveDate = item.PracticeAreaEffectiveDate;
        userObj.TimeZoneEffectiveDate = item.TimeZoneEffectiveDate;
        userObj.ManagerEffectiveDate = item.ManagerEffectiveDate;
        userObj.PrimarySkillEffectiveDate = item.PrimarySkillEffectiveDate;
        userObj.SkillLevelEffectiveDate = item.SkillLevelEffectiveDate;
        userObj.ID = item.ID;
        userObj.Manager = item.Manager.Title;
        userObj.User = item.UserName.Title;
        userObj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        userObj.LastUpdatedFormat = this.datePipe.transform(new Date(item.Modified), 'MMM dd yyyy hh:mm:ss aa');
        userObj.LastUpdatedBy = item.Editor.Title;
        userObj.IsActive = item.IsActive;
        userObj.DisplayText = item.Manager.Title;
        userObj.DateofExit = item.DateofExit;
        userObj.WorkingSunday = item.WorkingSunday;
        userObj.WorkingMonday = item.WorkingMonday;
        userObj.WorkingTuesday = item.WorkingTuesday;
        userObj.WorkingWednesday = item.WorkingWednesday;
        userObj.WorkingThursday = item.WorkingThursday;
        userObj.WorkingFriday = item.WorkingFriday;
        userObj.WorkingSaturday = item.WorkingSaturday;
        // Add the text of below item.
        if (userObj.Task) {
          const tasks: any = userObj.Task;
          if (tasks.results && tasks.results.length) {
            userObj.TaskText = tasks.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.Account) {
          const account: any = userObj.Account;
          if (account.results && account.results.length) {
            userObj.AccountText = account.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.Deliverable) {
          const deliverable: any = userObj.Deliverable;
          if (deliverable.results && deliverable.results.length) {
            userObj.DeliverableText = deliverable.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.DeliverableExclusion) {
          const deliverableEx: any = userObj.DeliverableExclusion;
          if (deliverableEx.results && deliverableEx.results.length) {
            userObj.DeliverableExclusionText = deliverableEx.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.TA) {
          const ta: any = userObj.TA;
          if (ta.results && ta.results.length) {
            userObj.TAText = ta.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.TAExclusion) {
          const taExclusion: any = userObj.TAExclusion;
          if (taExclusion.results && taExclusion.results.length) {
            userObj.TAExclusionText = taExclusion.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.Task) {
          const tasks: any = userObj.Task;
          if (tasks.results && tasks.results.length) {
            userObj.TaskText = tasks.results.map(x => x.Title).join(', ');
          }
        }
        tempResult.push(userObj);
      }
      this.addUser.get('isActive').enable();
    }
    this.userProfileData = tempResult;
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a request for getting single people picker value.
   * @param event The event parameters contains the query which required for fetching single people picker value.
   */
  filterSPUserSingle(event) {
    this.filterSPUsers(event.query, 'single');
  }
  /**
   * Construct a request for getting multiple people picker value.
   * @param event The event parameters contains the query which required for fetching multiple people picker value.
   */
  filterSPUserMultiple(event) {
    this.filterSPUsers(event.query, 'multiple');
  }
  /**
   * construct a request for getting the people picker data based on query and type.
   * @param query The query parameter contains the query which is required for fetching single/mutliple people picker value.
   * @param type The type parameter provides additional field whether you want to fetch single or multiple people picker value.
   *
   * @description
   * If type `single` is passed, only single people will be added.
   * If type `multiple` is passed, multiple people can be added.
   *
   * @return An `JSON` of the response, with the response body of type ClientPeoplePickerSearchUser will return.
   *
   */
  filterSPUsers(query, type) {
    this.peoplePickerQuery = Object.assign({
      queryParams: {
        QueryString: query,
        MaximumEntitySuggestions: 10,
        AllowEmailAddresses: true,
        AllowOnlyEmailAddresses: false,
        PrincipalSource: 15,
        PrincipalType: 1,
        SharePointGroupID: 0
      }
    });
    this.adminCommonService
      .getUserSuggestions(this.peoplePickerQuery)
      .subscribe((result: any) => {
        if (type === 'single') {
          this.users = [];
          const allUsers: PeoplePickerUser[] = JSON.parse(
            result.d.ClientPeoplePickerSearchUser
          );
          allUsers.forEach(user => {
            this.users = [...this.users, user];
          });
        } else {
          this.multipleUsers = [];
          const allUsers: PeoplePickerUser[] = JSON.parse(
            result.d.ClientPeoplePickerSearchUser
          );
          allUsers.forEach(user => {
            this.multipleUsers = [...this.multipleUsers, user];
          });
        }
      });
  }
  /**
   * Construct a request for calling the batches request and load the dropdown values.
   * @description
   * Once the batch request completed and returns the value.
   * It will iterate all the batch array to cater the request in dropdown format and
   * pushing the data to a particular dropdown array.
   */
  async loadDropDownValue() {
    const dropdownResults = await this.getInitData();
    if (dropdownResults && dropdownResults.length) {
      /**
       * call dropdown initialize method to make dropdown null.
       */
      this.initializeDropdownArray();
      // user filter dropdown
      this.userFilterOptions = [
        {
          label: this.adminConstants.LOGICAL_FIELD.ACTIVE,
          value: this.adminConstants.LOGICAL_FIELD.ACTIVE
        },
        {
          label: this.adminConstants.LOGICAL_FIELD.INACTIVE,
          value: this.adminConstants.LOGICAL_FIELD.INACTIVE
        }
      ];
      console.log(this.userFilterOptions);
      // load bucket dropdown.
      const bucketResults = dropdownResults[0].retItems;
      if (bucketResults && bucketResults.length) {
        bucketResults.forEach(element => {
          this.adminDropDown.bucketArray.push({ label: element.Title, value: element.Title });
        });
      }
      // load practice Area dropdown
      const practiceResults = dropdownResults[1].retItems;
      if (practiceResults && practiceResults.length) {
        practiceResults.forEach(element => {
          this.adminDropDown.practiceAreaArray.push({ label: element.Title, value: element.Title });
        });
      }
      // load Timezone dropdown
      const timeZoneResults = dropdownResults[2].retItems;
      if (timeZoneResults && timeZoneResults.length) {
        timeZoneResults.forEach(element => {
          this.adminDropDown.timeZoneArray.push({ label: element.TimeZoneName, value: element.ID });
        });
      }
      // load Incapacity dropdown
      let inCapacityResults = dropdownResults[3].retItems;
      if (inCapacityResults && inCapacityResults.length) {
        inCapacityResults = inCapacityResults[0].Choices.results;
        inCapacityResults.forEach(element => {
          this.adminDropDown.inCapacityArray.push({ label: element, value: element });
        });
      }
      // load pooled dropdown
      let pooledResults = dropdownResults[4].retItems;
      if (pooledResults && pooledResults.length) {
        pooledResults = pooledResults[0].Choices.results;
        pooledResults.forEach(element => {
          this.adminDropDown.pooledArray.push({ label: element, value: element });
        });
      }
      // load primary skill dropdown
      let primarySkillResults = dropdownResults[5].retItems;
      if (primarySkillResults && primarySkillResults.length) {
        primarySkillResults = primarySkillResults[0].Choices.results;
        primarySkillResults.forEach(element => {
          this.adminDropDown.primarySkillArray.push({ label: element, value: element });
        });
      }
      // load role dropdown
      let roleResults = dropdownResults[6].retItems;
      if (roleResults && roleResults.length) {
        roleResults = roleResults[0].Choices.results;
        roleResults.forEach(element => {
          this.adminDropDown.roleArray.push({ label: element, value: element });
        });
      }
      // load skill level dropdown
      const skillLevelResults = dropdownResults[7].retItems;
      if (skillLevelResults && skillLevelResults.length) {
        skillLevelResults.forEach(element => {
          this.adminDropDown.skillLevelArray.push({ label: element.Title, value: element.ID });
        });
      }
      // load task dropdown
      const taskResults = dropdownResults[8].retItems;
      if (taskResults && taskResults.length) {
        taskResults.forEach(element => {
          this.adminDropDown.taskArray.push({ label: element.Title, value: element.ID });
        });
      }
      // load account dropdown
      const accountResults = dropdownResults[9].retItems;
      if (accountResults && accountResults.length) {
        accountResults.forEach(element => {
          this.adminDropDown.accountArray.push({ label: element.Title, value: element.ID });
        });
      }
      // load deliverable && deliverableExclusion dropdown
      const deliverableResults = dropdownResults[10].retItems;
      if (deliverableResults && deliverableResults.length) {
        deliverableResults.forEach(element => {
          this.adminDropDown.deliverableArray.push({ label: element.Title, value: element.ID });
          this.adminDropDown.deliverableExclusionArray.push({ label: element.Title, value: element.ID });
        });
      }
      // load TA && TAExclusion dropdown
      const taResults = dropdownResults[11].retItems;
      if (taResults && taResults.length) {
        taResults.forEach(element => {
          this.adminDropDown.taArray.push({ label: element.Title, value: element.ID });
          this.adminDropDown.taExclusionArray.push({ label: element.Title, value: element.ID });
        });
      }
    }
  }
  onChangeSelect() {
    if (this.selectedOption === this.adminConstants.LOGICAL_FIELD.INACTIVE) {
      this.showUserInput = true;
      const emptyProjects = [];
      this.userProfileData = [...emptyProjects];
      this.providedUser = '';
    } else {
      this.showUserInput = false;
      this.loadUserTable();
    }
  }
  /**
   * Construct a method to search the user based on filter `IsActive=No`.
   *
   * @description
   *
   * This method is used to search the inactive user based on `IsActive` column and display in table.
   */
  async searchInactiveUser() {
    const resCatFilter = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION);
    resCatFilter.filter = resCatFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.NO);
    resCatFilter.filter = resCatFilter.filter + ' and startswith(UserNameText,\'' + this.providedUser + '\') ';
    const sResult = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, resCatFilter);
    const tempResult = [];
    if (sResult && sResult) {
      for (const item of sResult) {
        const userObj = Object.assign({}, this.adminObject.addUser);
        userObj.UserNameEmail = item.UserName.EMail;
        userObj.UserId = item.UserName.ID;
        userObj.ManagerEmail = item.Manager.EMail;
        userObj.ManagerId = item.Manager.ID;
        userObj.Bucket = item.Bucket;
        userObj.PracticeArea = item.Practice_x0020_Area;
        userObj.TimeZone = item.TimeZone;
        userObj.DateOfJoining = item.DateOfJoining;
        userObj.GoLiveDate = item.GoLiveDate;
        userObj.Designation = item.Designation;
        userObj.InCapacity = item.InCapacity;
        userObj.Pooled = item.Pooled;
        userObj.MaxHrs = item.MaxHrs;
        userObj.PrimarySkill = item.PrimarySkill;
        userObj.SkillLevel = item.SkillLevel;
        userObj.Role = item.Role;
        userObj.ReadyTo = item.Ready_x0020_To;
        userObj.Task = item.Tasks;
        userObj.Account = item.Account;
        userObj.Deliverable = item.Deliverables;
        userObj.DeliverableExclusion = item.DeliverableExclusion;
        userObj.TA = item.TA;
        userObj.TAExclusion = item.TAExclusion;
        userObj.PracticeAreaEffectiveDate = item.PracticeAreaEffectiveDate;
        userObj.TimeZoneEffectiveDate = item.TimeZoneEffectiveDate;
        userObj.ManagerEffectiveDate = item.ManagerEffectiveDate;
        userObj.PrimarySkillEffectiveDate = item.PrimarySkillEffectiveDate;
        userObj.SkillLevelEffectiveDate = item.SkillLevelEffectiveDate;
        userObj.ID = item.ID;
        userObj.Manager = item.Manager.Title;
        userObj.User = item.UserName.Title;
        userObj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        userObj.LastUpdatedFormat = this.datePipe.transform(new Date(item.Modified), 'MMM dd yyyy hh:mm:ss aa');
        userObj.LastUpdatedBy = item.Editor.Title;
        userObj.IsActive = item.IsActive;
        userObj.DisplayText = item.Manager.Title;
        userObj.DateofExit = item.DateofExit;
        userObj.WorkingSunday = item.WorkingSunday;
        userObj.WorkingMonday = item.WorkingMonday;
        userObj.WorkingTuesday = item.WorkingTuesday;
        userObj.WorkingWednesday = item.WorkingWednesday;
        userObj.WorkingThursday = item.WorkingThursday;
        userObj.WorkingFriday = item.WorkingFriday;
        userObj.WorkingSaturday = item.WorkingSaturday;
        // Add the text of below item.
        if (userObj.Task) {
          const tasks: any = userObj.Task;
          if (tasks.results && tasks.results.length) {
            userObj.TaskText = tasks.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.Account) {
          const account: any = userObj.Account;
          if (account.results && account.results.length) {
            userObj.AccountText = account.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.Deliverable) {
          const deliverable: any = userObj.Deliverable;
          if (deliverable.results && deliverable.results.length) {
            userObj.DeliverableText = deliverable.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.DeliverableExclusion) {
          const deliverableEx: any = userObj.DeliverableExclusion;
          if (deliverableEx.results && deliverableEx.results.length) {
            userObj.DeliverableExclusionText = deliverableEx.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.TA) {
          const ta: any = userObj.TA;
          if (ta.results && ta.results.length) {
            userObj.TAText = ta.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.TAExclusion) {
          const taExclusion: any = userObj.TAExclusion;
          if (taExclusion.results && taExclusion.results.length) {
            userObj.TAExclusionText = taExclusion.results.map(x => x.Title).join(', ');
          }
        }
        // Add the text of below item.
        if (userObj.Task) {
          const tasks: any = userObj.Task;
          if (tasks.results && tasks.results.length) {
            userObj.TaskText = tasks.results.map(x => x.Title).join(', ');
          }
        }
        if (userObj.IsActive === this.adminConstants.LOGICAL_FIELD.NO) {
          this.addUser.get('isActive').disable();
        }
        tempResult.push(userObj);
      }
    }
    this.userProfileData = tempResult;

  }
  /**
   * Construct a method to initialize the dropdown array to null.
   */
  initializeDropdownArray() {
    this.adminDropDown.accountArray = [];
    this.adminDropDown.bucketArray = [];
    this.adminDropDown.deliverableArray = [];
    this.adminDropDown.deliverableExclusionArray = [];
    this.adminDropDown.inCapacityArray = [];
    this.adminDropDown.pooledArray = [];
    this.adminDropDown.practiceAreaArray = [];
    this.adminDropDown.primarySkillArray = [];
    this.adminDropDown.roleArray = [];
    this.adminDropDown.skillLevelArray = [];
    this.adminDropDown.taArray = [];
    this.adminDropDown.taExclusionArray = [];
    this.adminDropDown.timeZoneArray = [];
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. Bucket          - Get data from `FocusGroup` list based on filter `IsActive='Yes'`.
   * 2. Practice Area   - Get data from `FocusGroup` list.
   * 3. TimeZones       - Get data from `TimeZones` list.
   * 4. InCapacity      - Get data for ChoiceField `InCapacity` from ResourceCategorization list.
   * 5. Pooled          - Get data for ChoiceField `Pooled` from ResourceCategorization list.
   * 6. Primary Skill   - Get data for ChoiceField `Primary Skill` from ResourceCategorization list.
   * 7. Role            - Get data for ChoiceField `Role` from ResourceCategorization list.
   * 8. Skill Level     - Get data from `SkillMaster` list.
   * 9. Task            - Get data from `MilestoneTasks` list based on filter `Status='Active'`.
   * 10. Account        - Get data from `ClientLegalEntity` list.
   * 11. Deliverable    - Get data from `DeliverableType` list based on filter `Active='Yes'`
   * 12. TA             - Get data from `TA` list based on filter `Active='Yes'`.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getInitData() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    // Get Bucket value  from FocusGroup list ##0;
    const bucketGet = Object.assign({}, options);
    const bucketFilter = Object.assign({}, this.adminConstants.QUERY.GET_BUCKET);
    bucketGet.url = this.spServices.getReadURL(this.constants.listNames.FocusGroup.name,
      bucketFilter);
    bucketGet.type = 'GET';
    bucketGet.listName = this.constants.listNames.FocusGroup.name;
    batchURL.push(bucketGet);

    // Get Practice Area from BusinessVerticals list ##1;
    const practiceAreaGet = Object.assign({}, options);
    const practiceAreaFilter = Object.assign({}, this.adminConstants.QUERY.GET_PRACTICE_AREA);
    practiceAreaGet.url = this.spServices.getReadURL(this.constants.listNames.BusinessVerticals.name,
      practiceAreaFilter);
    practiceAreaGet.type = 'GET';
    practiceAreaGet.listName = this.constants.listNames.BusinessVerticals.name;
    batchURL.push(practiceAreaGet);

    // Get TimeZones from TimeZones list ##2
    const timezonesGet = Object.assign({}, options);
    const timeZonesFilter = Object.assign({}, this.adminConstants.QUERY.GET_TIMEZONES);
    timezonesGet.url = this.spServices.getReadURL(this.constants.listNames.TimeZones.name,
      timeZonesFilter);
    timezonesGet.type = 'GET';
    timezonesGet.listName = this.constants.listNames.TimeZones.name;
    batchURL.push(timezonesGet);

    // Get InCapacity from ResourceCategorization list ##3
    const inCapacityGet = Object.assign({}, options);
    const inCapaCityFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    inCapaCityFilter.filter = inCapaCityFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.INCAPACITY);
    inCapacityGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      inCapaCityFilter);
    inCapacityGet.type = 'GET';
    inCapacityGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(inCapacityGet);

    // Get Pooled from ResourceCategorization list ##4
    const pooledGet = Object.assign({}, options);
    const pooledFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    pooledFilter.filter = pooledFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.POOLED);
    pooledGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      pooledFilter);
    pooledGet.type = 'GET';
    pooledGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(pooledGet);

    // Get Primary Skill from ResourceCategorization list ##5
    const primarySkillGet = Object.assign({}, options);
    const primarySkillFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    primarySkillFilter.filter = primarySkillFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.PRIMARYSKILL);
    primarySkillGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      primarySkillFilter);
    primarySkillGet.type = 'GET';
    primarySkillGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(primarySkillGet);

    // Get Roles from ResourceCategorization list ##6
    const rolesGet = Object.assign({}, options);
    const rolesFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    rolesFilter.filter = rolesFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.ROLE);
    rolesGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      rolesFilter);
    rolesGet.type = 'GET';
    rolesGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(rolesGet);

    // Get Skill Level from SkillMaster list ##7
    const skillMasterGet = Object.assign({}, options);
    const skillMasterFilter = Object.assign({}, this.adminConstants.QUERY.GET_SKILL_MASTER);
    skillMasterGet.url = this.spServices.getReadURL(this.constants.listNames.SkillMaster.name,
      skillMasterFilter);
    skillMasterGet.type = 'GET';
    skillMasterGet.listName = this.constants.listNames.SkillMaster.name;
    batchURL.push(skillMasterGet);

    // Get task from MilestoneTasks list ##8
    const taskGet = Object.assign({}, options);
    const taskFilter = Object.assign({}, this.adminConstants.QUERY.GET_TASK);
    taskFilter.filter = taskFilter.filter.replace(/{{status}}/gi,
      this.adminConstants.LOGICAL_FIELD.ACTIVE);
    taskGet.url = this.spServices.getReadURL(this.constants.listNames.MilestoneTasks.name,
      taskFilter);
    taskGet.type = 'GET';
    taskGet.listName = this.constants.listNames.MilestoneTasks.name;
    batchURL.push(taskGet);

    // Get account from ClientLegalEntity list ##9
    const accountGet = Object.assign({}, options);
    const accountFilter = Object.assign({}, this.adminConstants.QUERY.GET_ACCOUNT);
    accountGet.url = this.spServices.getReadURL(this.constants.listNames.ClientLegalEntity.name,
      accountFilter);
    accountGet.type = 'GET';
    accountGet.listName = this.constants.listNames.ClientLegalEntity.name;
    batchURL.push(accountGet);

    // Get Deliverable from DeliverableType list ##10
    const deliverableGet = Object.assign({}, options);
    const deliverableFilter = Object.assign({}, this.adminConstants.QUERY.GET_DELIVERABLE);
    deliverableFilter.filter = deliverableFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    deliverableGet.url = this.spServices.getReadURL(this.constants.listNames.DeliverableType.name,
      deliverableFilter);
    deliverableGet.type = 'GET';
    deliverableGet.listName = this.constants.listNames.DeliverableType.name;
    batchURL.push(deliverableGet);

    // Get TA from TA list ##11
    const taGet = Object.assign({}, options);
    const taFilter = Object.assign({}, this.adminConstants.QUERY.GET_TA);
    taFilter.filter = taFilter.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES);
    taGet.url = this.spServices.getReadURL(this.constants.listNames.TA.name,
      taFilter);
    taGet.type = 'GET';
    taGet.listName = this.constants.listNames.TA.name;
    batchURL.push(taGet);
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * construct a request to add value into multiselect dropdown in a table.
   *
   * @description
   *
   * It will filter the array with unique records and
   * add unique records into multiselect dropdown.
   *
   * @param colData The colData parameters contains table array which is required to prefill the multiselect dropdown with unique values.
   */
  colFilters(colData) {
    this.userProfileColArray.User = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.User, value: a.User
      };
      return b;
    })));
    const lastUpdatedArray = this.common.sortDateArray(this.adminCommonService.uniqueArrayObj(
      colData.map(a => {
        const b = {
          label: this.datePipe.transform(a.LastUpdated, 'MMM dd, yyyy'),
          value: a.LastUpdated
        };
        return b;
      })));
    this.userProfileColArray.LastUpdated = lastUpdatedArray.map(a => {
      const b = {
        label: this.datePipe.transform(a, 'MMM dd, yyyy'),
        value: new Date(new Date(a).toDateString())
      };
      return b;
    });
    this.userProfileColArray.LastUpdatedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b;
    })));
  }
  colFilters1(colData) {
    this.auditHistoryArray.User = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.User, value: a.User }; return b;
    }));
    this.auditHistoryArray.ActionBy = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.ActionBy, value: a.ActionBy }; return b;
    }));
    this.auditHistoryArray.ActionDate = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datePipe.transform(a.ActionDate, 'MMM dd, yyyy'),
        value: this.datePipe.transform(a.ActionDate, 'MMM dd, yyyy')
      };
      return b;
    }));
    this.auditHistoryArray.Details = this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Details, value: a.Details }; return b;
    }));

  }
  /**
   * Construct a method for saving and updating the user details to `Resource Categerization` List.
   *
   * @description
   *
   * There are couple of scenario need to check before adding or updating the user details to `Resource Categerization` list.
   *
   * // Adding Scenarios.
   * 1. We required User ID and Manager ID to add user.
   * 2. If User ID and Manager ID not found then display the error message. i.e Please contact SP support team
   * 3. If User is already present then display the error message. i.e User already Exist.
   * 4. If scenario 1-3 is false then we will add the user details.
   *
   * // Edit Scenarios.
   * 1. Updating the username is not allowed.
   * 2. We required manager ID when user updates the Manager.
   * 3. If manager ID not found when user updates the manager then display error message. i.e Please contact SP Support team.
   * 4. If scenario 1-3 is false then we will update the user details.
   *
   * @param addUserForm The addUserForm as parameters which is required for fetching the form value.
   */
  async saveUser(addUserForm) {
    if (addUserForm.valid) {
      console.log(addUserForm.value);
      /**
       * Need to validate if username and manager is properly selected or entered.
       */
      if (addUserForm.value.username && !addUserForm.value.username.hasOwnProperty('EntityData')) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'Please select proper username name.'
        });
        return false;
      }
      if (addUserForm.value.manager && !addUserForm.value.manager.hasOwnProperty('EntityData')) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'Please select proper manager name.'
        });
        return false;
      }
      if (new Date(addUserForm.value.dateofjoin) >
        new Date(addUserForm.value.liveDate)) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error',
          summary: 'Error Message', detail: 'Date of joining cannot be greater than go live date.'
        });
        return false;
      }
      this.adminObject.isMainLoaderHidden = false;
      // This method is used to save all the addform value into global object.
      this.setValueInGlobalObject(addUserForm.value, true);
      /**
       * @description
       * Add logic of save the data to Resource Categerization list.
       * In order to add username and manager name to `Resource Categerization list`, we should have
       * userId and manager Id.
       * To get the manager and userId we have to make rest call.
       */
      let IdResults = [];
      const batchURL = [];
      const options = {
        data: null,
        url: '',
        type: '',
        listName: ''
      };
      // Not required to get the username Id in case of Edit user
      if (!this.showeditUser) {
        const userEmailId = addUserForm.value.username.EntityData.Email;
        this.adminObject.addUser.UserNameEmail = userEmailId;
        // Get userId from  UserInformationList based on filter EMail eq \'{{emailId}}\' ##0;
        const userIdGet = Object.assign({}, options);
        const userIdFilter = Object.assign({}, this.adminConstants.QUERY.GET_USER_INFORMATION);
        userIdFilter.filter = userIdFilter.filter.replace(/{{emailId}}/gi,
          userEmailId);
        userIdGet.url = this.spServices.getReadURL(this.constants.listNames.UserInformationList.name,
          userIdFilter);
        userIdGet.type = 'GET';
        userIdGet.listName = this.constants.listNames.UserInformationList.name;
        batchURL.push(userIdGet);
      }
      // If Manager is not changed no need to get the ID of manager.
      if (!addUserForm.value.manager.EntityData.hasOwnProperty('ID')) {
        const managerEmailId = addUserForm.value.manager.EntityData.Email;
        // Get managerId from  UserInformationList based on filter EMail eq \'{{emailId}}\' ##1;
        const managerIdGet = Object.assign({}, options);
        const managerIdFilter = Object.assign({}, this.adminConstants.QUERY.GET_USER_INFORMATION);
        managerIdFilter.filter = managerIdFilter.filter.replace(/{{emailId}}/gi,
          managerEmailId);
        managerIdGet.url = this.spServices.getReadURL(this.constants.listNames.UserInformationList.name,
          managerIdFilter);
        managerIdGet.type = 'GET';
        managerIdGet.listName = this.constants.listNames.UserInformationList.name;
        batchURL.push(managerIdGet);
      }
      if (batchURL.length) {
        IdResults = await this.spServices.executeBatch(batchURL);
      }
      if (IdResults && IdResults.length) {
        if (!this.showeditUser) {
          // We need to check if UserNameId and ManagerId return from `User List Information`.
          // If we not add them to temporary group `SyncUserToUserInfomartionList` to get thier Id.
          if (IdResults[0] && IdResults[0].retItems.length && IdResults[1] && IdResults[1].retItems.length) {
            await this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser);
          } else {
            const sResult = await this.addUserToGroup(addUserForm.value.username.Key, addUserForm.value.manager.Key);
            if (sResult && sResult.length) {
              const userId = sResult[0].retItems.Id;
              const managerId = sResult[1].retItems.Id;
              addUserForm.value.username.EntityData.ID = userId;
              addUserForm.value.manager.EntityData.ID = managerId;
              await this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser);
            }
          }
        }
        // We need to check if ManagerId return from `User List Information`.
        // This will get called when user update the manager name.
        if (this.showeditUser) {
          if (IdResults[0] && IdResults[0].retItems.length) {
            this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser);
          } else {
            const sResult = await this.addUserToGroup(null, addUserForm.value.manager.Key);
            if (sResult && sResult.length) {
              const managerId = sResult[0].retItems.Id;
              addUserForm.value.manager.EntityData.ID = managerId;
              await this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser);
            }
          }
        }
      } else {
        // This will get called when user doesn't update the manager name.
        if (this.showeditUser) {
          this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser);
        }
      }
    } else {
      this.upObject.isFormSubmit = true;
    }
  }
  /**
   * Construct a method to add or update the item to `ResourceCategorization` list
   * @param formValue Pass the `formValue` as parameter of form.
   * @param IdResults Pass the `IdResults` an array which contains Id of user and manager.
   * @param isEdit Pass the `isEdit` as parameter to `true` if want to update or else `false` for create.
   */
  async createOrUpdateItem(formValue, IdResults, isEdit) {
    if (isEdit) {
      const data = await this.getResourceData(formValue, IdResults, this.showeditUser);
      await this.spServices.updateItem(this.constants.listNames.ResourceCategorization.name,
        this.currUserObj.ID, data, this.constants.listNames.ResourceCategorization.type);
      this.adminObject.isMainLoaderHidden = true;
      this.messageService.add({
        key: 'adminCustom', severity: 'success', sticky: true,
        summary: 'Success Message', detail: 'User - ' + this.currUserObj.User + ' has updated successfully'
      });
      await this.loadRecentRecords(this.currUserObj.ID, this.showeditUser);
      this.showModal = false;
    } else {
      const data = await this.getResourceData(formValue, IdResults, this.showeditUser);
      const result = await this.spServices.createItem(this.constants.listNames.ResourceCategorization.name,
        data, this.constants.listNames.ResourceCategorization.type);
      this.adminObject.isMainLoaderHidden = true;
      if (result.hasOwnProperty('hasError') && result.hasError && result.message.value.includes('duplicate')) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error', sticky: true,
          summary: 'Error Message', detail: 'User - ' + formValue.username.DisplayText + ' has already exist.'
        });
      } else {
        this.showModal = false;
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'User - ' + formValue.username.DisplayText + ' has added successfully'
        });
        await this.loadRecentRecords(result.ID, this.showeditUser);
      }
    }
  }
  /**
   * Construct a method to load the newly created item into the table without refreshing the whole page.
   * @param item ID the item which is created or updated recently.
   *
   * @param isUpdate Pass the isUpdate as true/false for update and create item respectively.
   *
   * @description
   *
   * This method will load newly created item or updated item as first row in the table;
   *  Pass `false` to add the new created item at position 0 in the array.
   *  Pass `true` to replace the item in the array
   */
  async loadRecentRecords(ID, isUpdate) {
    const resGet = Object.assign({}, this.adminConstants.QUERY.GET_RESOURCE_CATEGERIZATION_BY_ID);
    resGet.filter = resGet.filter.replace(/{{isActive}}/gi,
      this.adminConstants.LOGICAL_FIELD.YES).replace(/{{Id}}/gi, ID);
    const result = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, resGet);
    if (result && result.length) {
      const item = result[0];
      const userObj = Object.assign({}, this.adminObject.addUser);
      userObj.UserNameEmail = item.UserName.EMail;
      userObj.UserId = item.UserName.ID;
      userObj.ManagerEmail = item.Manager.EMail;
      userObj.ManagerId = item.Manager.ID;
      userObj.Bucket = item.Bucket;
      userObj.PracticeArea = item.Practice_x0020_Area;
      userObj.TimeZone = item.TimeZone;
      userObj.DateOfJoining = item.DateOfJoining;
      userObj.GoLiveDate = item.GoLiveDate;
      userObj.Designation = item.Designation;
      userObj.InCapacity = item.InCapacity;
      userObj.Pooled = item.Pooled;
      userObj.MaxHrs = item.MaxHrs;
      userObj.PrimarySkill = item.PrimarySkill;
      userObj.SkillLevel = item.SkillLevel;
      userObj.Role = item.Role;
      userObj.ReadyTo = item.Ready_x0020_To;
      userObj.Task = item.Tasks;
      userObj.Account = item.Account;
      userObj.Deliverable = item.Deliverables;
      userObj.DeliverableExclusion = item.DeliverableExclusion;
      userObj.TA = item.TA;
      userObj.TAExclusion = item.TAExclusion;
      userObj.PracticeAreaEffectiveDate = item.PracticeAreaEffectiveDate;
      userObj.TimeZoneEffectiveDate = item.TimeZoneEffectiveDate;
      userObj.ManagerEffectiveDate = item.ManagerEffectiveDate;
      userObj.PrimarySkillEffectiveDate = item.PrimarySkillEffectiveDate;
      userObj.SkillLevelEffectiveDate = item.SkillLevelEffectiveDate;
      userObj.ID = item.ID;
      userObj.Manager = item.Manager.Title;
      userObj.User = item.UserName.Title;
      userObj.LastUpdated = item.Modified;
      userObj.LastUpdatedBy = item.Editor.Title;
      userObj.IsActive = item.IsActive;
      userObj.DisplayText = item.Manager.Title;
      userObj.DateofExit = item.DateofExit;
      userObj.WorkingSunday = item.WorkingSunday;
      userObj.WorkingMonday = item.WorkingMonday;
      userObj.WorkingTuesday = item.WorkingTuesday;
      userObj.WorkingWednesday = item.WorkingWednesday;
      userObj.WorkingThursday = item.WorkingThursday;
      userObj.WorkingFriday = item.WorkingFriday;
      userObj.WorkingSaturday = item.WorkingSaturday;
      // Add the text of below item.
      if (userObj.Task) {
        const tasks: any = userObj.Task;
        if (tasks.results && tasks.results.length) {
          userObj.TaskText = tasks.results.map(x => x.Title).join(', ');
        }
      }
      // Add the text of below item.
      if (userObj.Account) {
        const account: any = userObj.Account;
        if (account.results && account.results.length) {
          userObj.AccountText = account.results.map(x => x.Title).join(', ');
        }
      }
      // Add the text of below item.
      if (userObj.Deliverable) {
        const deliverable: any = userObj.Deliverable;
        if (deliverable.results && deliverable.results.length) {
          userObj.DeliverableText = deliverable.results.map(x => x.Title).join(', ');
        }
      }
      // Add the text of below item.
      if (userObj.DeliverableExclusion) {
        const deliverableEx: any = userObj.DeliverableExclusion;
        if (deliverableEx.results && deliverableEx.results.length) {
          userObj.DeliverableExclusionText = deliverableEx.results.map(x => x.Title).join(', ');
        }
      }
      // Add the text of below item.
      if (userObj.TA) {
        const ta: any = userObj.TA;
        if (ta.results && ta.results.length) {
          userObj.TAText = ta.results.map(x => x.Title).join(', ');
        }
      }
      // Add the text of below item.
      if (userObj.TAExclusion) {
        const taExclusion: any = userObj.TAExclusion;
        if (taExclusion.results && taExclusion.results.length) {
          userObj.TAExclusionText = taExclusion.results.map(x => x.Title).join(', ');
        }
      }
      // Add the text of below item.
      if (userObj.Task) {
        const tasks: any = userObj.Task;
        if (tasks.results && tasks.results.length) {
          userObj.TaskText = tasks.results.map(x => x.Title).join(', ');
        }
      }
      this.addUser.get('isActive').enable();
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array and position at 0 in the array.
      if (isUpdate) {
        const index = this.userProfileData.findIndex(x => x.ID === userObj.ID);
        this.userProfileData.splice(index, 1);
        this.userProfileData.unshift(userObj);
      } else {
        this.userProfileData.unshift(userObj);
      }
    } else {
      if (isUpdate) {
        const index = this.userProfileData.findIndex(x => x.ID === ID);
        this.userProfileData.splice(index, 1);
      }
    }
    this.colFilters(this.userProfileData);
  }
  /**
   * Construct a method to execute a batch request for adding the user to Group`SyncUserToUserInformationList`
   * by using Login Name.
   *
   * @description
   * We have created the `temporary group` to add the user whose details are not available in `User Information List`
   * Basically we need ID of user or manager to add them into peoplepicker field or groups
   * So in order to have thier Id the user or manager must present in `UserInformationList`
   * If they will not present in the list `User Information List` we will add them to the group `SyncUserToUserInfomartionList`
   *
   * If want to add User to group provide the `userLogingName`.
   * If want to add Manager to group provide the `managerLogingName`
   *
   * @param userLoginName Pass the userLoginName as parameters to add user into group else pass `null`.
   * @param managerLoginName Pass the managerLoginName as parameters to add manager into group else pass `null`.
   *
   * @return The `sResults` as an array which containts the properties of currently added user or manager.
   *
   */
  async addUserToGroup(userLoginName, managerLoginName) {
    const userData = {
      __metadata: { type: 'SP.User' },
      LoginName: userLoginName
    };
    const managerData = {
      __metadata: { type: 'SP.User' },
      LoginName: managerLoginName
    };
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    if (userLoginName) {
      const userCreate = Object.assign({}, options);
      userCreate.url = this.spServices.getGroupUrl(this.constants.Groups.SYNC_USER_TO_USER_INFORMATION_LIST, null);
      userCreate.data = userData;
      userCreate.type = 'POST';
      userCreate.listName = this.constants.Groups.SYNC_USER_TO_USER_INFORMATION_LIST;
      batchURL.push(userCreate);
    }
    if (managerLoginName) {
      const managerCreate = Object.assign({}, options);
      managerCreate.url = this.spServices.getGroupUrl(this.constants.Groups.SYNC_USER_TO_USER_INFORMATION_LIST, null);
      managerCreate.data = managerData;
      managerCreate.type = 'POST';
      managerCreate.listName = this.constants.Groups.SYNC_USER_TO_USER_INFORMATION_LIST;
      batchURL.push(managerCreate);
    }
    const sResult = await this.spServices.executeBatch(batchURL);
    if (sResult && sResult.length) {
      console.log(sResult);
      return sResult;
    }
  }
  /**
   * Construct a method to set the form value to global variable and
   * resource categorization object value to global variable in case of edit form.
   *
   * @param resObject The resObject is form value in case of adding users into Resource Categerization list
   * and `Resource Categerization` object in case of showing the users into form for update.
   *
   * @param isCreate The isCreate parameter is boolean flag to check whether insert or update field set.
   *  Pass `true`  to set the form item to global object.
   *  Pass `false` to set  Resource Categerization list object to global object.
   */
  setValueInGlobalObject(resObject, isCreate) {
    this.adminObject.addUser.ManagerEmail = isCreate ? resObject.manager.EntityData.Email : '';
    this.adminObject.addUser.Bucket = isCreate ? resObject.bucket : resObject.Bucket;
    this.adminObject.addUser.PracticeArea = isCreate ? resObject.practiceArea : resObject.Practice_x0020_Area;
    this.adminObject.addUser.TimeZone = isCreate ? resObject.timeZone : resObject.TimeZone;
    this.adminObject.addUser.DateOfJoining = isCreate ? resObject.dateofjoin : resObject.DateOfJoining;
    this.adminObject.addUser.GoLiveDate = isCreate ? resObject.liveDate : resObject.GoLiveDate;
    this.adminObject.addUser.Designation = isCreate ? resObject.designation : resObject.Designation;
    this.adminObject.addUser.InCapacity = isCreate ? resObject.inCapacity : resObject.InCapacity;
    this.adminObject.addUser.Pooled = isCreate ? resObject.pooled : resObject.Pooled;
    this.adminObject.addUser.MaxHrs = isCreate ? resObject.maxHrs : resObject.MaxHrs;
    this.adminObject.addUser.PrimarySkill = isCreate ? resObject.primarySkill : resObject.PrimarySkill;
    this.adminObject.addUser.SkillLevel = isCreate ? resObject.skillLevel : resObject.SkillLevel;
    this.adminObject.addUser.Role = isCreate ? resObject.role : resObject.Role;
    this.adminObject.addUser.ReadyTo = isCreate ? resObject.readyTo : resObject.Ready_x0020_To;
    this.adminObject.addUser.Task = isCreate ? resObject.task : resObject.Tasks;
    this.adminObject.addUser.Account = isCreate ? resObject.account : resObject.Account;
    this.adminObject.addUser.Deliverable = isCreate ? resObject.deliverable : resObject.Deliverables;
    this.adminObject.addUser.DeliverableExclusion = isCreate ? resObject.deliverableExclusion : resObject.DeliverableExclusion;
    this.adminObject.addUser.TA = isCreate ? resObject.ta : resObject.TA;
    this.adminObject.addUser.TAExclusion = isCreate ? resObject.taExclusion : resObject.TAExclusion;
    this.adminObject.addUser.TimeZoneEffectiveDate = isCreate && resObject.timeZoneEffectiveDate ?
      resObject.timeZoneEffectiveDate : resObject.TimeZoneEffectiveDate;
    this.adminObject.addUser.SkillLevelEffectiveDate = isCreate && resObject.skillLevelEffectiveDate ?
      resObject.skillLevelEffectiveDate : resObject.SkillLevelEffectiveDate;
    this.adminObject.addUser.PrimarySkillEffectiveDate = isCreate && resObject.primarySkillEffectiveDate ?
      resObject.primarySkillEffectiveDate : resObject.PrimarySkillEffectiveDate;
    this.adminObject.addUser.PracticeAreaEffectiveDate = isCreate && resObject.practiceAreaEffectiveDate ?
      resObject.practiceAreaEffectiveDate : resObject.PracticeAreaEffectiveDate;
    this.adminObject.addUser.ManagerEffectiveDate = isCreate && resObject.managerEffectiveDate ?
      resObject.managerEffectiveDate : resObject.ManagerEffectiveDate;
    this.adminObject.addUser.ID = !isCreate ? resObject.ID : 0;
  }
  /**
   * Construct a method to get the proper object for `Resource Categerization list` to save the data.
   * @param formObj Pass the formObj as parameter which is required for fetching form value.
   * @param IdResults Pass IdResuslts as parameter which have userId and ManagerId
   * @param isEdit The isEdit is boolean parameter to check whether insert or update data required.
   *
   *  Pass `false` to add the item into `Resource Categerization list`.
   *  Pass `true`  to update the item into `Resource Categerization list`.
   *
   * @return An Object of `Resource Categerization list` required to insert and update item.
   */
  getResourceData(formObj, IdResults, isEdit) {
    // Extract userId and managerId
    let userId = 0;
    let managerId = 0;
    let managerText = '';
    let userText = '';
    if (isEdit) {
      managerId = formObj.manager.EntityData.hasOwnProperty('ID') ? formObj.manager.EntityData.ID : IdResults[0].retItems[0].ID;
      managerText = formObj.manager.hasOwnProperty('DisplayText') ? formObj.manager.DisplayText : IdResults[0].retItems[0].Title;
    } else {
      userId = formObj.username.EntityData.hasOwnProperty('ID') ? formObj.username.EntityData.ID : IdResults[0].retItems[0].ID;
      managerId = formObj.manager.EntityData.hasOwnProperty('ID') ? formObj.manager.EntityData.ID : IdResults[1].retItems[0].ID;
      userText = formObj.username.hasOwnProperty('DisplayText') ? formObj.username.DisplayText : IdResults[0].retItems[0].Title;
      managerText = formObj.manager.hasOwnProperty('DisplayText') ? formObj.manager.DisplayText : IdResults[0].retItems[0].Title;
    }
    const data: any = {
      __metadata: { type: this.constants.listNames.ResourceCategorization.type },
      ManagerId: managerId,
      ManagerText: managerText,
      Bucket: formObj.bucket,
      Practice_x0020_Area: formObj.practiceArea,
      TimeZoneId: formObj.timeZone,
      DateOfJoining: formObj.dateofjoin,
      GoLiveDate: formObj.liveDate,
      Designation: formObj.designation,
      InCapacity: formObj.inCapacity,
      Pooled: formObj.pooled,
      MaxHrs: +formObj.maxHrs,
      PrimarySkill: formObj.primarySkill,
      SkillLevelId: formObj.skillLevel,
      TasksId: {
        results: formObj.task
      },
      WorkingSunday: formObj.workSunday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
      WorkingMonday: formObj.workMonday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
      WorkingTuesday: formObj.workTuesday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
      WorkingWednesday: formObj.workWednessday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
      WorkingThursday: formObj.workThursday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
      WorkingFriday: formObj.workFriday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
      WorkingSaturday: formObj.workSaturday ? this.adminConstants.LOGICAL_FIELD.YES : this.adminConstants.LOGICAL_FIELD.NO,
    };
    if (formObj.role) {
      data.Role = formObj.role;
    }
    if (formObj.readyTo) {
      data.Ready_x0020_To = formObj.readyTo;
    }
    if (formObj.account && formObj.account.length) {
      data.AccountId = {
        results: formObj.account
      };
    }
    if (formObj.deliverable && formObj.deliverable.length) {
      data.DeliverablesId = {
        results: formObj.deliverable
      };
    }
    if (formObj.deliverableExclusion && formObj.deliverableExclusion.length) {
      data.DeliverableExclusionId = {
        results: formObj.deliverableExclusion
      };
    }
    if (formObj.ta && formObj.ta.length) {
      data.TAId = {
        results: formObj.ta
      };
    }
    if (formObj.taExclusion && formObj.taExclusion.length) {
      data.TAExclusionId = {
        results: formObj.taExclusion
      };
    }
    if (!isEdit) {
      data.UserNameId = userId;
      data.UserNameText = userText;
      if (formObj.isActive === this.adminConstants.LOGICAL_FIELD.NO) {
        data.IsActive = formObj.isActive;
        data.DateofExit = formObj.dateofexit;
      } else {
        if (formObj.dateofexit) {
          const dateOfExit = this.datePipe.transform(new Date(formObj.dateofexit), 'MMM dd yyyy');
          const todayDate = this.datePipe.transform(new Date(), 'MMM dd yyyy');
          if (dateOfExit <= todayDate) {
            data.IsActive = 'No';
          }
          data.DateofExit = formObj.dateofexit;
        }
      }
    }
    if (isEdit) {
      if (formObj.dateofexit) {
        const dateOfExit = formObj.dateofexit ? new Date(formObj.dateofexit) : null;
        const todayDate = new Date(new Date().setHours(0, 0, 0, 0));
        if ( dateOfExit !== null && dateOfExit.getTime() <= todayDate.getTime()) {
          data.IsActive = this.adminConstants.LOGICAL_FIELD.NO;
        } else {
          data.IsActive = this.adminConstants.LOGICAL_FIELD.YES;
        }
        data.DateofExit = formObj.dateofexit;
      }
      if (this.date.isTimeZoneEffectiveDateActive && formObj.timeZoneEffectiveDate) {
        data.TimeZoneEffectiveDate = formObj.timeZoneEffectiveDate;
      }
      if (this.date.isSkillLevelEffectiveDateActive && formObj.skillLevelEffectiveDate) {
        data.SkillLevelEffectiveDate = formObj.skillLevelEffectiveDate;
      }
      if (this.date.isPrimarySkillEffectiveDateActive && formObj.primarySkillEffectiveDate) {
        data.PrimarySkillEffectiveDate = formObj.primarySkillEffectiveDate;
      }
      if (this.date.isPracticeEffectiveDateActive && formObj.practiceAreaEffectiveDate) {
        data.PracticeAreaEffectiveDate = formObj.practiceAreaEffectiveDate;
      }
      if (this.date.isManagerEffectiveDateActive && formObj.managerEffectiveDate) {
        data.ManagerEffectiveDate = formObj.managerEffectiveDate;
      }
    }
    return data;
  }
  /**
   * Construct a method to trigger whenever `Manager` field value changes.
   *
   * @description
   *
   * If changed value in manger field is not same as previous value then
   * `Manager Effective Date` field will be visible and it's became mandatory field.
   */
  onManagerChange() {
    if (this.addUser.value.manager && !this.addUser.value.manager.hasOwnProperty('EntityData')) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please select proper manager name.'
      });
    } else {
      const managerEffectiveDateControl = this.addUser.get('managerEffectiveDate');
      if (this.showeditUser && this.currUserObj.ManagerEmail !== this.addUser.value.manager.EntityData.Email) {
        managerEffectiveDateControl.setValidators([Validators.required]);
        managerEffectiveDateControl.updateValueAndValidity();
        this.date.isManagerEffectiveDateActive = true;
        this.addUser.get('managerEffectiveDate').setValue(null);
        this.addUser.get('managerEffectiveDate').enable();
      } else if (this.showeditUser && this.currUserObj.ManagerEmail === this.addUser.value.manager.EntityData.Email) {
        this.date.isManagerEffectiveDateActive = true;
        const userObj = this.currUserObj;
        this.addUser.get('managerEffectiveDate').setValue(new Date(userObj.ManagerEffectiveDate));
        this.addUser.get('managerEffectiveDate').disable();
      } else {
        managerEffectiveDateControl.clearValidators();
        this.date.isManagerEffectiveDateActive = false;
      }
    }
  }
  /**
   * Construct a method to trigger whenever `Practice Area` field value changes.
   *
   * @description
   *
   * If changed value in Practice Area field is not same as previous value then
   * `Practice Area Effective Date` field will be visible and it's became mandatory field.
   */
  onPracticeAreaChange() {
    const practiceAreaEffectiveDateControl = this.addUser.get('practiceAreaEffectiveDate');
    if (this.showeditUser && this.currUserObj.PracticeArea !== this.addUser.value.practiceArea) {
      practiceAreaEffectiveDateControl.setValidators([Validators.required]);
      practiceAreaEffectiveDateControl.updateValueAndValidity();
      this.date.isPracticeEffectiveDateActive = true;
      this.addUser.get('practiceAreaEffectiveDate').setValue(null);
      this.addUser.get('practiceAreaEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.PracticeArea === this.addUser.value.practiceArea) {
      this.date.isPracticeEffectiveDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('practiceAreaEffectiveDate').setValue(new Date(userObj.PracticeAreaEffectiveDate));
      this.addUser.get('practiceAreaEffectiveDate').disable();
    } else {
      practiceAreaEffectiveDateControl.clearValidators();
      this.date.isPracticeEffectiveDateActive = false;
    }
  }
  /**
   * Construct a method to trigger whenever `Timezone` field value changes.
   *
   * @description
   *
   * If changed value in Timezone field is not same as previous value then
   * `Timezone Effective Date` field will be visible and it's became mandatory field.
   */
  onTimezoneChange() {
    const timeZoneEffectiveDateControl = this.addUser.get('timeZoneEffectiveDate');
    if (this.showeditUser && this.currUserObj.TimeZone.ID !== this.addUser.value.timeZone) {
      timeZoneEffectiveDateControl.setValidators([Validators.required]);
      timeZoneEffectiveDateControl.updateValueAndValidity();
      this.date.isTimeZoneEffectiveDateActive = true;
      this.addUser.get('timeZoneEffectiveDate').setValue(null);
      this.addUser.get('timeZoneEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.TimeZone.ID === this.addUser.value.timeZone) {
      this.date.isTimeZoneEffectiveDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('timeZoneEffectiveDate').setValue(new Date(userObj.TimeZoneEffectiveDate));
      this.addUser.get('timeZoneEffectiveDate').disable();
    } else {
      timeZoneEffectiveDateControl.clearValidators();
      this.date.isTimeZoneEffectiveDateActive = false;
    }
  }
  /**
   * Construct a method to trigger whenever `Primary Skill` field value changes.
   *
   * @description
   *
   * If changed value in Primary Skill field is not same as previous value then
   * `Primary Skill Effective Date` field will be visible and it's became mandatory field.
   */
  onPrimarySkillChange() {
    const primarySkillEffectiveDateControl = this.addUser.get('primarySkillEffectiveDate');
    if (this.showeditUser && this.currUserObj.PrimarySkill !== this.addUser.value.primarySkill) {
      primarySkillEffectiveDateControl.setValidators([Validators.required]);
      primarySkillEffectiveDateControl.updateValueAndValidity();
      this.date.isPrimarySkillEffectiveDateActive = true;
      this.addUser.get('primarySkillEffectiveDate').setValue(null);
      this.addUser.get('primarySkillEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.PrimarySkill === this.addUser.value.primarySkill) {
      this.date.isPrimarySkillEffectiveDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('primarySkillEffectiveDate').setValue(new Date(userObj.PrimarySkillEffectiveDate));
      this.addUser.get('primarySkillEffectiveDate').disable();
    } else {
      primarySkillEffectiveDateControl.clearValidators();
      this.date.isPrimarySkillEffectiveDateActive = false;
    }
  }
  /**
   * Construct a method to trigger whenever `Skill Level` field value changes.
   *
   * @description
   *
   * If changed value in Skill Level field is not same as previous value then
   * `Skill Level Effective Date` field will be visible and it's became mandatory field.
   */
  onSkillLevelChange() {
    const skillLevelEffectiveDateControl = this.addUser.get('skillLevelEffectiveDate');
    if (this.showeditUser && this.currUserObj.SkillLevel.ID !== this.addUser.value.skillLevel) {
      skillLevelEffectiveDateControl.setValidators([Validators.required]);
      skillLevelEffectiveDateControl.updateValueAndValidity();
      this.date.isSkillLevelEffectiveDateActive = true;
      this.addUser.get('skillLevelEffectiveDate').setValue(null);
      this.addUser.get('skillLevelEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.SkillLevel.ID === this.addUser.value.skillLevel) {
      this.date.isSkillLevelEffectiveDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('skillLevelEffectiveDate').setValue(new Date(userObj.SkillLevelEffectiveDate));
      this.addUser.get('skillLevelEffectiveDate').disable();
    } else {
      skillLevelEffectiveDateControl.clearValidators();
      this.date.isSkillLevelEffectiveDateActive = false;
    }
  }
  /**
   * Construct a method to trigger whenever `Is Active` field value changes.
   *
   * @description
   *
   * If changed value in Is Active field is `No` then
   * `Date of Exit` field will be visible and it's became mandatory field.
   */
  onIsActiveChange() {
    if (this.showeditUser) {
      const dateofexitControl = this.addUser.get('dateofexit');
      if (this.addUser.value.isActive === this.adminConstants.LOGICAL_FIELD.NO) {
        dateofexitControl.setValidators([Validators.required]);
        dateofexitControl.updateValueAndValidity();
      } else {
        dateofexitControl.clearValidators();
      }
    }
  }
  /**
   * Construct a method to trigger whenever `Deliverable` field value changes.
   *
   * @description
   *
   * The options selected in `Deliverable` field , that options will not in `Deliverable Exclusion` field.
   */
  onDeliverableChange() {
    const deliverableIdArray = this.addUser.value.deliverable;
    const filterdeliverableArray = this.adminDropDown.deliverableArray.filter(x => !deliverableIdArray.includes(x.value));
    this.adminDropDown.deliverableExclusionArray = filterdeliverableArray;
  }
  /**
   * Construct a method to trigger whenever `TA` field value changes.
   *
   * @description
   *
   * The options selected in `TA` field, that options will not available in `TA Exclusion` field.
   */
  onTAChange() {
    const taIdArray = this.addUser.value.ta;
    const filtertaArray = this.adminDropDown.taArray.filter(x => !taIdArray.includes(x.value));
    this.adminDropDown.taExclusionArray = filtertaArray;
  }
  /**
   * Construct a method to show the add user form.
   */
  showAddUserModal() {
    this.addUser.reset();
    this.date.isManagerEffectiveDateActive = false;
    this.date.isPracticeEffectiveDateActive = false;
    this.date.isPrimarySkillEffectiveDateActive = false;
    this.date.isSkillLevelEffectiveDateActive = false;
    this.date.isTimeZoneEffectiveDateActive = false;
    this.addUser.get('workMonday').setValue(true);
    this.addUser.get('workTuesday').setValue(true);
    this.addUser.get('workWednessday').setValue(true);
    this.addUser.get('workThursday').setValue(true);
    this.addUser.get('workFriday').setValue(true);
    this.upObject.isFormSubmit = false;
    this.showeditUser = false;
    this.customLabel = 'Submit';
    this.addUser.controls.username.enable();
    this.showModal = true;
  }
  /**
   * Construct a method to store current selected row data into variable `currUserObj`.
   *
   * @description
   *
   * This method will trigger when user click on menu option in the table.
   * It will store the current selected row value into the class variable `currUserObj`.
   *
   */
  storeRowData(rowData) {
    this.currUserObj = rowData;
    this.pMenuItems = [
      { label: 'Edit', command: (e) => this.showEditUserModal() },
      { label: 'View', command: (e) => this.showRightViewUserModal() }
    ];
    console.log(rowData);
  }
  /**
   * Construct a method to show the edit user form.
   *
   * @description
   * This method have following functionalies.
   *
   * 1. It will not allowed user to change the User Name.
   * 2. It will prepulate the field with value for editting the field.
   * 3. If user changes the value of `Manger`,` Practice Area`, `Time Zone`, `Primary Skill` and `Skill level` field then
   * `Manager Effective Date`, `Practice Area Effective Date`, `Time Zone Effective Date`, `Primary Skill Effective Date`
   * and `Skill Level Effective Date` will become mandatory field respectively.
   * 4. If user changes the value of `IsActive` field from `Yes` to `No` then `Date of Exit` field become mandatory.
   */
  async showEditUserModal() {
    this.addUser.reset();
    this.date.isManagerEffectiveDateActive = false;
    this.date.isPracticeEffectiveDateActive = false;
    this.date.isPrimarySkillEffectiveDateActive = false;
    this.date.isSkillLevelEffectiveDateActive = false;
    this.date.isTimeZoneEffectiveDateActive = false;
    const userObj = this.currUserObj;
    this.customLabel = 'Update';
    this.addUser.controls.username.disable();
    // set the value into the form.
    await this.setUserFormField(userObj);
    // this.setUserCategoryValidators();
    this.showModal = true;
    this.showeditUser = true;
    this.upObject.isFormSubmit = false;
  }
  /**
   * Construct a method to set the value into form field
   * load the dropdown value of `IsActive` field
   * @param userObj The userObj as paramater which is required for setting the form field value.
   */
  setUserFormField(userObj) {
    this.adminDropDown.isActiveArray = [
      { label: this.adminConstants.LOGICAL_FIELD.YES, value: this.adminConstants.LOGICAL_FIELD.YES },
      { label: this.adminConstants.LOGICAL_FIELD.NO, value: this.adminConstants.LOGICAL_FIELD.NO }
    ];
    this.addUser.get('username').patchValue({ DisplayText: userObj.User }, { emitEvent: false });
    this.addUser.get('manager').patchValue({
      DisplayText: userObj.Manager,
      EntityData: { Email: userObj.ManagerEmail, ID: userObj.ManagerId }
    }, { emitEvent: false });
    this.addUser.get('bucket').setValue(userObj.Bucket);
    this.addUser.get('practiceArea').setValue(userObj.PracticeArea);
    this.addUser.get('timeZone').setValue(userObj.TimeZone.ID);
    this.addUser.get('liveDate').setValue(new Date(userObj.GoLiveDate));
    this.addUser.get('dateofjoin').setValue(new Date(userObj.DateOfJoining));
    this.addUser.get('inCapacity').setValue(userObj.InCapacity);
    this.addUser.get('designation').setValue(userObj.Designation);
    this.addUser.get('pooled').setValue(userObj.Pooled);
    this.addUser.get('maxHrs').setValue(userObj.MaxHrs);
    this.addUser.get('primarySkill').setValue(userObj.PrimarySkill);
    this.addUser.get('skillLevel').setValue(userObj.SkillLevel.ID);
    this.addUser.get('role').setValue(userObj.Role);
    this.addUser.get('readyTo').setValue(userObj.ReadyTo);
    // Get the lookup Id's in order to display it in multiselect.
    // To get the Id's call getId from common services.
    if (userObj.Task.results && userObj.Task.results.length) {
      const tempTaskArray = this.adminCommonService.getIds(userObj.Task.results);
      this.addUser.get('task').setValue(tempTaskArray);
    }
    if (userObj.Account.results && userObj.Account.results.length) {
      const tempAccountArray = this.adminCommonService.getIds(userObj.Account.results);
      this.addUser.get('account').setValue(tempAccountArray);
    }
    if (userObj.Deliverable.results && userObj.Deliverable.results.length) {
      const tempDeliverableArray = this.adminCommonService.getIds(userObj.Deliverable.results);
      this.addUser.get('deliverable').setValue(tempDeliverableArray);
    }
    if (userObj.DeliverableExclusion.results && userObj.DeliverableExclusion.results.length) {
      const tempDeliverableExclusionArray = this.adminCommonService.getIds(userObj.DeliverableExclusion.results);
      this.addUser.get('deliverableExclusion').setValue(tempDeliverableExclusionArray);
    }
    if (userObj.TA.results && userObj.TA.results.length) {
      const tempTAArray = this.adminCommonService.getIds(userObj.TA.results);
      this.addUser.get('ta').setValue(tempTAArray);
    }
    if (userObj.TAExclusion.results && userObj.TAExclusion.results.length) {
      const tempTAExclusionArray = this.adminCommonService.getIds(userObj.TAExclusion.results);
      this.addUser.get('taExclusion').setValue(tempTAExclusionArray);
    }
    this.addUser.get('isActive').setValue(userObj.IsActive);
    if (userObj.ManagerEffectiveDate) {
      this.date.isManagerEffectiveDateActive = true;
      this.addUser.get('managerEffectiveDate').setValue(new Date(userObj.ManagerEffectiveDate));
      this.addUser.get('managerEffectiveDate').disable();
    }
    if (userObj.PracticeAreaEffectiveDate) {
      this.date.isPracticeEffectiveDateActive = true;
      this.addUser.get('practiceAreaEffectiveDate').setValue(new Date(userObj.PracticeAreaEffectiveDate));
      this.addUser.get('practiceAreaEffectiveDate').disable();
    }
    if (userObj.TimeZoneEffectiveDate) {
      this.date.isTimeZoneEffectiveDateActive = true;
      this.addUser.get('timeZoneEffectiveDate').setValue(new Date(userObj.TimeZoneEffectiveDate));
      this.addUser.get('timeZoneEffectiveDate').disable();
    }
    if (userObj.PrimarySkillEffectiveDate) {
      this.date.isPrimarySkillEffectiveDateActive = true;
      this.addUser.get('primarySkillEffectiveDate').setValue(new Date(userObj.PrimarySkillEffectiveDate));
      this.addUser.get('primarySkillEffectiveDate').disable();
    }
    if (userObj.SkillLevelEffectiveDate) {
      this.date.isSkillLevelEffectiveDateActive = true;
      this.addUser.get('skillLevelEffectiveDate').setValue(new Date(userObj.SkillLevelEffectiveDate));
      this.addUser.get('skillLevelEffectiveDate').disable();
    }
    if (userObj.DateofExit) {
      this.showeditUser = true;
      this.date.isDateExit = true;
      this.addUser.get('dateofexit').setValue(new Date(userObj.DateofExit));
    }
    if (userObj.WorkingSunday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workSunday').setValue(true);
    }
    if (userObj.WorkingMonday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workMonday').setValue(true);
    }
    if (userObj.WorkingTuesday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workTuesday').setValue(true);
    }
    if (userObj.WorkingWednesday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workWednessday').setValue(true);
    }
    if (userObj.WorkingThursday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workThursday').setValue(true);
    }
    if (userObj.WorkingFriday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workFriday').setValue(true);
    }
    if (userObj.WorkingSaturday === this.adminConstants.LOGICAL_FIELD.YES) {
      this.addUser.get('workSaturday').setValue(true);
    }
  }
  /**
   * Construct a method to show the user details in
   *  righ overlay panel.
   */
  showRightViewUserModal() {
    this.userProfileViewDataArray = [];
    this.addUser.reset();
    const userObj = this.currUserObj;
    console.log(userObj);
    this.userProfileViewDataArray.push(userObj);
    this.isUserProfileRightSideVisible = true;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: false });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  downloadExcel(up) {
    up.exportCSV();
  }
}
