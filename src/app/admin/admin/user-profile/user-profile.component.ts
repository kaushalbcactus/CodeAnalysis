import { Component, OnInit, NgZone, ApplicationRef, ViewEncapsulation, ViewChild, ChangeDetectorRef, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe, PlatformLocation } from '@angular/common';
import { AdminCommonService } from '../../services/admin-common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from '../../services/admin-constant.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { MessageService } from 'primeng/api';
import { AdminObjectService } from '../../services/admin-object.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/Services/common.service';
import { GlobalService } from 'src/app/Services/global.service';
import { Table } from 'primeng/table';
import { AddEditUserProfileComponent } from './add-edit-user-profile/add-edit-user-profile.component';
import { DialogService } from 'primeng';
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
  isUserSPMUPA: boolean;
  editUser: FormGroup;
  userProfileColumns = [];
  userProfileData = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  userProfileViewDataArray = [];

  showModal = false;
  showeditUser = false;
  isUserProfileRightSideVisible = false;
  userFilterOptions = [];
  customLabel = '';
  showUserInput = false;
  providedUser = '';
  selectedOption = '';
  pMenuItems = [];
  addUser: FormGroup;
  upObject = {
    isFormSubmit: false,
    isEditFormSubmit: false
  };

  currUserObj: any;

  // This declaration is used to check which effective date is need to be shown when one
  // of the field is changed.
  userProfileColArray = {
    User: [],
    LastUpdated: [],
    LastModifiedBy: [],
    PrimarySkill: [],
    Bucket: [],
    PracticeArea: [],
    InCapacity: [],
    DateOfJoining: [],
    GoLiveDate: [],
  };
  auditHistoryArray = {
    User: [],
    ActionBy: [],
    ActionDate: [],
    Details: []
  };
  minEffectiveDate = new Date();

  filteredCountriesMultiple: any[];
  showTable = true;

  isOptionFilter: boolean;
  @ViewChild('up', { static: false }) userProfileTable: Table;
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
    private cdr: ChangeDetectorRef,
    public dialogService: DialogService
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
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
    this.showTable = true;
    this.constants.loader.isPSInnerLoaderHidden = true;


    this.userProfileColumns = [
      { field: 'User', header: 'User', visibility: true },
      { field: 'PrimarySkill', header: 'Primary Skill', visibility: true },
      { field: 'Bucket', header: 'Bucket', visibility: true },
      { field: 'PracticeArea', header: 'Practice Area', visibility: true },
      { field: 'InCapacity', header: 'In Capacity', visibility: true },
      { field: 'DateOfJoining', header: 'Date Of Joining', visibility: true },
      { field: 'GoLiveDate', header: 'Go Live Date', visibility: true },
      { field: 'LastUpdated', header: 'Last Updated', visibility: false, exportable: false },
      { field: 'LastUpdatedFormat', header: 'Last Updated Date', visibility: false },
      { field: 'LastModifiedBy', header: 'Last Updated By', visibility: false },
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
    await this.loadUserTable();
    this.colFilters1(this.auditHistoryRows);

  }


  /**
   * Construct a REST_API Call request for getting data from `Resource Categerization` list
   * based on filter `IsActive ='Yes'`.
   * @description
   *
   * Once the response return from REST Call, Iterate through each item and store into the
   * `userProfileData` array to display the result into Ng Prime table.
   */
  async loadUserTable() {
    this.showTable = false;
    this.adminObject.isMainLoaderHidden = false;
    this.selectedOption = this.adminConstants.LOGICAL_FIELD.ACTIVE;
    this.showUserInput = false;
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

    this.common.SetNewrelic('admin', 'admin-UserProfile', 'GetResourceCategorization');
    const sResult = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, resCatFilter);
    const tempResult = [];
    this.showTable = true;
    if (sResult && sResult.length > 0) {
      // this.setValueInGlobalObject(sResult[0], false);
      for (const item of sResult) {
        const userObj = Object.assign({}, this.adminObject.addUser);
        userObj.UserNameEmail = item.UserName.EMail;
        userObj.UserId = item.UserName.ID;
        userObj.ManagerEmail = item.Manager.EMail;
        userObj.ManagerId = item.Manager.ID;
        userObj.Bucket = item.Bucket;
        userObj.PracticeArea = item.Practice_x0020_Area ? item.Practice_x0020_Area.replace(/;#/g, ',') : '';
        userObj.TimeZone = item.TimeZone;
        userObj.DateOfJoining = this.datePipe.transform(item.DateOfJoining, 'MMM dd, yyyy');
        userObj.GoLiveDate = this.datePipe.transform(item.GoLiveDate, 'MMM dd, yyyy');
        userObj.Designation = item.Designation;
        userObj.InCapacity = item.InCapacity;
        userObj.TAVisibility = item.TAVisibility;
        userObj.CAVisibility = item.CAVisibility;
        userObj.IsFTE = item.IsFTE;
        userObj.FTEEffectiveDate = item.FTEEffectiveDate;
        userObj.Pooled = item.Pooled;
        userObj.MaxHrs = item.MaxHrs;
        userObj.MaxHrsEffectiveDate = item.MaxHrsEffectiveDate;
        userObj.BucketEffectiveDate = item.BucketEffectiveDate;
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
        userObj.LastUpdatedFormat = this.datePipe.transform(new Date(item.Modified), 'MMM dd, yyyy');
        userObj.LastModifiedBy = item.Editor.Title;
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
      // this.addUser.get('isActive').enable();
    }
    this.userProfileData = tempResult;
    this.adminObject.isMainLoaderHidden = true;
    this.colFilters(this.userProfileData);
  }


  updateOptionValues(obj) {
    if (obj.filteredValue.length) {
      const filterCol = Object.entries(obj.filters);
      if (filterCol.length >= 1) {
        this.userProfileTable.restoringFilter;
        obj.filter('', filterCol[0][0], 'contains')
      }
    }
  }

  onChangeSelect() {
    // this.updateOptionValues(this.userProfileTable);
    // console.log('this.userProfileTable ', this.userProfileTable);
    this.colFilters([]);
    if (this.selectedOption === this.adminConstants.LOGICAL_FIELD.INACTIVE) {
      this.showTable = false;
      this.showUserInput = true;
      const emptyProjects = [];
      this.userProfileData = [...emptyProjects];
      this.providedUser = '';
      this.colFilters([]);
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
    this.common.SetNewrelic('admin', 'admin-UserProfile', 'GetResourceCategorization');
    const sResult = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, resCatFilter);
    const tempResult = [];
    if (sResult && sResult.length) {
      this.showTable = true;
      for (const item of sResult) {
        const userObj = Object.assign({}, this.adminObject.addUser);
        userObj.UserNameEmail = item.UserName.EMail;
        userObj.UserId = item.UserName.ID;
        userObj.ManagerEmail = item.Manager.EMail;
        userObj.ManagerId = item.Manager.ID;
        userObj.Bucket = item.Bucket;
        userObj.PracticeArea = item.Practice_x0020_Area ? item.Practice_x0020_Area.replace(/;#/g, ',') : '';
        userObj.TimeZone = item.TimeZone;
        userObj.DateOfJoining = this.datePipe.transform(item.DateOfJoining, 'MMM dd, yyyy');
        userObj.GoLiveDate = this.datePipe.transform(item.GoLiveDate, 'MMM dd, yyyy');
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
        userObj.MaxHrsEffectiveDate = item.MaxHrsEffectiveDate;
        userObj.BucketEffectiveDate = item.BucketEffectiveDate;
        userObj.ID = item.ID;
        userObj.Manager = item.Manager.Title;
        userObj.User = item.UserName.Title;
        userObj.LastUpdated = new Date(new Date(item.Modified).toDateString());
        userObj.LastUpdatedFormat = this.datePipe.transform(new Date(item.Modified), 'MMM dd, yyyy');
        userObj.LastModifiedBy = item.Editor.Title;
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
          //  this.addUser.get('isActive').disable();
        }
        tempResult.push(userObj);
      }
    }
    this.userProfileData = tempResult;
    this.colFilters(this.userProfileData);
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
      const b = { label: a.User, value: a.User }; return b;
    })));

    this.userProfileColArray.PrimarySkill = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.PrimarySkill, value: a.PrimarySkill }; return b;
    })));

    this.userProfileColArray.Bucket = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Bucket, value: a.Bucket }; return b;
    })));

    this.userProfileColArray.PracticeArea = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.PracticeArea, value: a.PracticeArea }; return b;
    })));


    this.userProfileColArray.InCapacity = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.InCapacity, value: a.InCapacity }; return b;
    }).filter(ele => ele)));

    this.userProfileColArray.DateOfJoining = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datePipe.transform(a.DateOfJoining, 'MMM dd, yyyy'),
        value: a.DateOfJoining
      };
      return b;
    })));

    this.userProfileColArray.GoLiveDate = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datePipe.transform(a.GoLiveDate, 'MMM dd, yyyy'),
        value: a.GoLiveDate
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
    this.userProfileColArray.LastModifiedBy = this.common.sortData(this.adminCommonService.uniqueArrayObj(colData.map(a => {
      const b = { label: a.LastModifiedBy, value: a.LastModifiedBy }; return b;
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

  // Reset when p-dialog close reset form value
  cancelFormSub() {
    // this.addUser.reset();
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
  async saveUser(addUserForm, date) {

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
      this.common.SetNewrelic('admin', 'admin-UserProfile', 'GetUserInformation');
      IdResults = await this.spServices.executeBatch(batchURL);
    }
    if (IdResults && IdResults.length) {
      if (!this.showeditUser) {
        // We need to check if UserNameId and ManagerId return from `User List Information`.
        // If we not add them to temporary group `SyncUserToUserInfomartionList` to get thier Id.
        if (IdResults[0] && IdResults[0].retItems.length && IdResults[1] && IdResults[1].retItems.length) {
          await this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser, date);
        } else {
          const sResult = await this.addUserToGroup(addUserForm.value.username.Key, addUserForm.value.manager.Key);
          if (sResult && sResult.length) {
            const userId = sResult[0].retItems.Id;
            const managerId = sResult[1].retItems.Id;
            addUserForm.value.username.EntityData.ID = userId;
            addUserForm.value.manager.EntityData.ID = managerId;
            await this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser, date);
          }
        }
      }
      // We need to check if ManagerId return from `User List Information`.
      // This will get called when user update the manager name.
      if (this.showeditUser) {
        if (IdResults[0] && IdResults[0].retItems.length) {
          this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser, date);
        } else {
          const sResult = await this.addUserToGroup(null, addUserForm.value.manager.Key);
          if (sResult && sResult.length) {
            const managerId = sResult[0].retItems.Id;
            addUserForm.value.manager.EntityData.ID = managerId;
            await this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser, date);
          }
        }
      }
    } else {
      // This will get called when user doesn't update the manager name.
      if (this.showeditUser) {
        this.createOrUpdateItem(addUserForm.value, IdResults, this.showeditUser, date);
      }
    }

  }
  /**
   * Construct a method to add or update the item to `ResourceCategorization` list
   * @param formValue Pass the `formValue` as parameter of form.
   * @param IdResults Pass the `IdResults` an array which contains Id of user and manager.
   * @param isEdit Pass the `isEdit` as parameter to `true` if want to update or else `false` for create.
   */
  async createOrUpdateItem(formValue, IdResults, isEdit, date) {
    if (isEdit) {
      const data = await this.getResourceData(formValue, IdResults, this.showeditUser, date);
      this.common.SetNewrelic('admin', 'admin-UserProfile', 'updateResourceCategorization');
      await this.spServices.updateItem(this.constants.listNames.ResourceCategorization.name,
        this.currUserObj.ID, data, this.constants.listNames.ResourceCategorization.type);
     
     
      this.messageService.add({
        key: 'adminCustom', severity: 'success', sticky: true,
        summary: 'Success Message', detail: 'User - ' + this.currUserObj.User + ' is updated successfully'
      });
      await this.loadRecentRecords(this.currUserObj.ID, this.showeditUser);
     
    } else {
      const data = await this.getResourceData(formValue, IdResults, this.showeditUser, date);
      this.common.SetNewrelic('admin', 'admin-UserProfile', 'CreateResourceCategorization');
      const result = await this.spServices.createItem(this.constants.listNames.ResourceCategorization.name,
        data, this.constants.listNames.ResourceCategorization.type);

      if (result.hasOwnProperty('hasError') && result.hasError && result.message.value.includes('duplicate')) {
        this.messageService.add({
          key: 'adminCustom', severity: 'error', sticky: true,
          summary: 'Error Message', detail: 'User - ' + formValue.username.DisplayText + ' is already exist.'
        });
      } else {
     
        this.messageService.add({
          key: 'adminCustom', severity: 'success', sticky: true,
          summary: 'Success Message', detail: 'User - ' + formValue.username.DisplayText + ' is added successfully'
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
    this.common.SetNewrelic('admin', 'admin-UserProfile', 'GetResourceCategorization');
    const result = await this.spServices.readItems(this.constants.listNames.ResourceCategorization.name, resGet);
    if (result && result.length) {
      const item = result[0];
      const userObj = Object.assign({}, this.adminObject.addUser);
      userObj.UserNameEmail = item.UserName.EMail;
      userObj.UserId = item.UserName.ID;
      userObj.ManagerEmail = item.Manager.EMail;
      userObj.ManagerId = item.Manager.ID;
      userObj.Bucket = item.Bucket;
      userObj.PracticeArea = item.Practice_x0020_Area ? item.Practice_x0020_Area.replace(/;#/g, ',') : '';
      userObj.TimeZone = item.TimeZone;
      userObj.DateOfJoining = this.datePipe.transform(item.DateOfJoining, 'MMM dd, yyyy');
      userObj.GoLiveDate = this.datePipe.transform(item.GoLiveDate, 'MMM dd, yyyy');
      userObj.Designation = item.Designation;
      userObj.InCapacity = item.InCapacity;
      userObj.IsFTE = item.IsFTE;
      userObj.FTEEffectiveDate = item.FTEEffectiveDate;
      userObj.MaxHrsEffectiveDate = item.MaxHrsEffectiveDate;
      userObj.BucketEffectiveDate = item.BucketEffectiveDate;
      userObj.TAVisibility = item.TAVisibility;
      userObj.CAVisibility = item.CAVisibility;
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
      userObj.LastModifiedBy = item.Editor.Title;
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
      // this.addUser.get('isActive').enable();
      // If Create - add the new created item at position 0 in the array.
      // If Edit - Replace the item in the array and position at 0 in the array.
      if (isUpdate) {
        const index = this.userProfileData.findIndex(x => x.ID === userObj.ID);
        this.userProfileData.splice(index, 1);
        this.userProfileData.unshift(userObj);
      } else {
        this.userProfileData.unshift(userObj);
      }
      this.adminObject.isMainLoaderHidden = false;
    } else {
      if (isUpdate) {
        const index = this.userProfileData.findIndex(x => x.ID === ID);
        this.userProfileData.splice(index, 1);
      }
    }
    this.adminObject.isMainLoaderHidden = false;
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
    this.common.SetNewrelic('admin', 'admin-UserProfile', 'GetUserInformation');
    const sResult = await this.spServices.executeBatch(batchURL);
    if (sResult && sResult.length) {
      // console.log(sResult);
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
    this.adminObject.addUser.BucketEffectiveDate = isCreate && resObject.bucketEffectiveDate ?
      resObject.bucketEffectiveDate : resObject.BucketEffectiveDate;
    this.adminObject.addUser.MaxHrsEffectiveDate = isCreate && resObject.maxHrsEffectiveDate ?
      resObject.maxHrsEffectiveDate : resObject.MaxHrsEffectiveDate;
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
  getResourceData(formObj, IdResults, isEdit, date) {
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
      // Practice_x0020_Area: formObj.practiceArea,
      Practice_x0020_Area: formObj.practiceArea.join(';#'),
      TimeZoneId: formObj.timeZone,
      DateOfJoining: this.datePipe.transform(formObj.dateofjoin, 'MMM dd, yyyy'),
      GoLiveDate: formObj.liveDate,
      Designation: formObj.designation,
      IsFTE: formObj.isFTE,
      TAVisibility: formObj.taVisibility,
      CAVisibility: formObj.caVisibility,
      InCapacity: formObj.inCapacity,
      Pooled: formObj.pooled,
      MaxHrs: +formObj.maxHrs,
      PrimarySkill: formObj.primarySkill,
      SkillLevelId: formObj.skillLevel,
      TasksId: { results: formObj.task },
      DeliverablesId: formObj.deliverable && formObj.deliverable.length > 0 ? { results: formObj.deliverable } : { results: [] },
      DeliverableExclusionId: formObj.deliverableExclusion && formObj.deliverableExclusion.length > 0 ?
        { results: formObj.deliverableExclusion } : { results: [] },
      TAId: formObj.ta && formObj.ta.length > 0 ? { results: formObj.ta } : { results: [] },
      TAExclusionId: formObj.taExclusion && formObj.taExclusion.length > 0 ? { results: formObj.taExclusion } : { results: [] },
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
    } else if (formObj.account && formObj.isFTE === 'Yes') {
      data.AccountId = {
        results: [formObj.account]
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
        if (dateOfExit !== null && dateOfExit.getTime() <= todayDate.getTime()) {
          data.IsActive = this.adminConstants.LOGICAL_FIELD.NO;
        } else {
          data.IsActive = this.adminConstants.LOGICAL_FIELD.YES;
        }
        data.DateofExit = formObj.dateofexit;
      }
      if (date.isTimeZoneEffectiveDateActive && formObj.timeZoneEffectiveDate) {
        data.TimeZoneEffectiveDate = formObj.timeZoneEffectiveDate;
      }
      if (date.isSkillLevelEffectiveDateActive && formObj.skillLevelEffectiveDate) {
        data.SkillLevelEffectiveDate = formObj.skillLevelEffectiveDate;
      }
      if (date.isPrimarySkillEffectiveDateActive && formObj.primarySkillEffectiveDate) {
        data.PrimarySkillEffectiveDate = formObj.primarySkillEffectiveDate;
      }
      if (date.isPracticeEffectiveDateActive && formObj.practiceAreaEffectiveDate) {
        data.PracticeAreaEffectiveDate = formObj.practiceAreaEffectiveDate;
      }
      if (date.isManagerEffectiveDateActive && formObj.managerEffectiveDate) {
        data.ManagerEffectiveDate = formObj.managerEffectiveDate;
      }
      if (date.isBucketDateActive && formObj.bucketEffectiveDate) {
        data.BucketEffectiveDate = formObj.bucketEffectiveDate;
      }
      if (date.isMaxHrsDateActive && formObj.maxHrsEffectiveDate) {
        data.MaxHrsEffectiveDate = formObj.maxHrsEffectiveDate;
      }

      if (date.isFTEEffectiveDateActive && formObj.fTEEffectiveDate && formObj.isFTE === 'Yes') {
        data.FTEEffectiveDate = formObj.fTEEffectiveDate;
      } else if (formObj.isFTE === 'No') {
        data.FTEEffectiveDate = null;
      }
    }
    return data;
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
      { label: 'Edit', command: (e) => this.addEditUserProfile('Edit User', rowData) },
      { label: 'View', command: (e) => this.showRightViewUserModal() }
    ];
    // Remove Edit User option from Menu item
    if (this.selectedOption === this.adminConstants.LOGICAL_FIELD.INACTIVE) {
      this.pMenuItems.shift();
    }
  }

  /**
   * Construct a method to show the user details in
   *  righ overlay panel.
   */
  showRightViewUserModal() {
    this.userProfileViewDataArray = [];
    // this.addUser.reset();
    const userObj = this.currUserObj;
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

  downloadExcel() {
    this.userProfileTable.exportCSV();
  }

  optionFilter(event: any) {
    if (event.target.value) {
      this.isOptionFilter = false;
    }
  }

  ngAfterViewChecked() {
    if (this.userProfileData.length && this.isOptionFilter) {
      const obj = {
        tableData: this.userProfileTable,
        colFields: this.userProfileColArray
      };
      if (obj.tableData.filteredValue) {
        this.common.updateOptionValues(obj);
      } else if (obj.tableData.filteredValue === null || obj.tableData.filteredValue === undefined) {
        this.colFilters(obj.tableData.value);
        this.isOptionFilter = false;
      }
      this.cdr.detectChanges();
    }
  }


  addEditUserProfile(title, UserObject) {

    this.showeditUser = UserObject ? true : false;
    const ref = this.dialogService.open(AddEditUserProfileComponent, {
      header: title,
      width: '92vw',
      data: UserObject,
      contentStyle: { 'max-height': '72vh', 'overflow-y': 'auto' },
      closable: false,
    });

    ref.onClose.subscribe((userDetailsObj: any) => {
      if (userDetailsObj) {
        if (!this.showeditUser) {
          userDetailsObj.userDetails.get('isActive').setValue('Yes');
        }
        this.saveUser(userDetailsObj.userDetails, userDetailsObj.date);
      }
    });
  }
}
