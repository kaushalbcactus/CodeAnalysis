import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PeoplePickerUser } from '../../peoplePickerModel/people-picker.response';
import { PeoplePickerQuery } from '../../peoplePickerModel/people-picker.query';
import { AdminCommonService } from '../../services/admin-common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { AdminConstantService } from '../../services/admin-constant.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})

/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 */
export class UserProfileComponent implements OnInit {
  userProfileColumns = [];
  userProfileRows = [];
  auditHistoryColumns = [];
  auditHistoryRows = [];
  showModal = false;
  showeditUser = false;
  /**
   * This item will be displayed as menu, while clicking on 3(...) dots in each rows.
   */
  items = [
    { label: 'Edit', command: (e) => this.showEditUserModal() }
  ];
  upObject = {
    isFormSubmit: false,
    isEditFormSubmit: false
  };
  addUser: FormGroup;
  editUser: FormGroup;
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
   * This method is used to create the object of all datePipe, formbuilder and all required object.
   */
  constructor(
    private datepipe: DatePipe,
    private frmbuilder: FormBuilder,
    private adminCommonService: AdminCommonService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private spServices: SPOperationService
  ) {
    this.addUser = frmbuilder.group({
      username: ['', Validators.required],
      account: ['', Validators.required],
      bucket: ['', Validators.required],
      dateofexit: ['', null],
      dateofjoin: ['', Validators.required],
      deliverableExclusion: ['', Validators.required],
      deliverable: ['', Validators.required],
      designation: ['', Validators.required],
      liveDate: ['', Validators.required],
      inCapacity: ['', Validators.required],
      isActive: ['', null],
      manager: ['', Validators.required],
      maxHrs: ['', Validators.required],
      pooled: ['', Validators.required],
      primarySkill: ['', Validators.required],
      readyTo: ['', Validators.required],
      role: ['', Validators.required],
      skillLevel: ['', Validators.required],
      ta: ['', Validators.required],
      taExclusion: ['', Validators.required],
      task: ['', Validators.required],
      timeZone: ['', Validators.required],
      practiceArea: ['', Validators.required]
    });
    // this.editUser = frmbuilder.group({
    //   username: ['', Validators.required],
    //   account: ['', Validators.required],
    //   bucket: ['', Validators.required],
    //   dateofexit: ['', Validators.required],
    //   dateofjoin: ['', Validators.required],
    //   deliverableExclusion: ['', Validators.required],
    //   deliverable: ['', Validators.required],
    //   designation: ['', Validators.required],
    //   liveDate: ['', Validators.required],
    //   inCapacity: ['', Validators.required],
    //   isActive: ['', null],
    //   manager: ['', Validators.required],
    //   maxHrs: ['', Validators.required],
    //   pooled: ['', Validators.required],
    //   primarySkill: ['', Validators.required],
    //   readyTo: ['', Validators.required],
    //   role: ['', Validators.required],
    //   skillLevel: ['', Validators.required],
    //   ta: ['', Validators.required],
    //   taExclusion: ['', Validators.required],
    //   task: ['', Validators.required],
    //   timeZone: ['', Validators.required],
    //   practiceArea: ['', Validators.required]
    // });
  }
  /**
   * Constructs a request that interprets the body as a text string and
   * returns a string value.
   *
   * @param method  The HTTP method.
   * @param url     The endpoint URL.
   * @param options The HTTP options to send with the request.
   *
   * @return An `Observable` of the response, with the response body of type string.
   */

  /**
   * This method is used to initialize all the default object.
   */

  ngOnInit() {
    this.userProfileColumns = [
      { field: 'User', header: 'User' },
      { field: 'LastUpdated', header: 'Last Updated' },
      { field: 'LastUpdatedBy', header: 'Last Updated By' },
    ];

    this.userProfileRows = [
      {
        User: 'Test',
        LastUpdated: 'Jul 3, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      },
      {
        User: 'Test1',
        LastUpdated: 'Aug 2, 2019',
        LastUpdatedBy: 'Kaushal Bagrodia'
      }
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

    this.colFilters(this.userProfileRows);
    this.colFilters1(this.auditHistoryRows);
    this.loadDropDownValue();
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
          this.adminDropDown.timeZoneArray.push({ label: element.TimeZoneName, value: element.Title });
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
          this.adminDropDown.skillLevelArray.push({ label: element.Title, value: element.Title });
        });
      }
      // load task dropdown
      const taskResults = dropdownResults[8].retItems;
      if (taskResults && taskResults.length) {
        taskResults.forEach(element => {
          this.adminDropDown.taskArray.push({ label: element.Title, value: element.Title });
        });
      }
      // load account dropdown
      const accountResults = dropdownResults[9].retItems;
      if (accountResults && accountResults.length) {
        accountResults.forEach(element => {
          this.adminDropDown.accountArray.push({ label: element.Title, value: element.Title });
        });
      }
      // load deliverable && deliverableExclusion dropdown
      const deliverableResults = dropdownResults[10].retItems;
      if (deliverableResults && deliverableResults.length) {
        deliverableResults.forEach(element => {
          this.adminDropDown.deliverableArray.push({ label: element.Title, value: element.Title });
          this.adminDropDown.deliverableExclusionArray.push({ label: element.Title, value: element.Title });
        });
      }
      // load TA && TAExclusion dropdown
      const taResults = dropdownResults[11].retItems;
      if (taResults && taResults.length) {
        taResults.forEach(element => {
          this.adminDropDown.taArray.push({ label: element.Title, value: element.Title });
          this.adminDropDown.taExclusionArray.push({ label: element.Title, value: element.Title });
        });
      }
    }
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
  colFilters(colData) {
    this.userProfileColArray.User = this.uniqueArrayObj(colData.map(a => {
      const b = {
        label: a.User, value: a.User
      };
      return b;
    }));
    this.userProfileColArray.LastUpdated = this.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy'), value: this.datepipe.transform(a.LastUpdated, 'MMM d, yyyy')
      };
      return b;
    }));
    this.userProfileColArray.LastUpdatedBy = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.LastUpdatedBy, value: a.LastUpdatedBy }; return b;
    }));
  }

  colFilters1(colData) {
    this.auditHistoryArray.User = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.User, value: a.User }; return b;
    }));
    this.auditHistoryArray.ActionBy = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.ActionBy, value: a.ActionBy }; return b;
    }));
    this.auditHistoryArray.ActionDate = this.uniqueArrayObj(colData.map(a => {
      const b = {
        label: this.datepipe.transform(a.ActionDate, 'MMM d, yyyy'),
        value: this.datepipe.transform(a.ActionDate, 'MMM d, yyyy')
      };
      return b;
    }));
    this.auditHistoryArray.Details = this.uniqueArrayObj(colData.map(a => {
      const b = { label: a.Details, value: a.Details }; return b;
    }));

  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value
      };
    });
  }

  saveUser(addUserForm) {
    if (addUserForm.valid) {
      console.log(addUserForm.value);
    } else {
      this.upObject.isFormSubmit = true;
      this.upObject.isEditFormSubmit = true;
    }
  }

  showAddUserModal() {
    this.showModal = true;
    this.upObject.isFormSubmit = false;
    this.showeditUser = false;
  }

  showEditUserModal() {
    this.showeditUser = true;
    this.editUser.patchValue({
      username: 'Test',
      account: 'option1',
      bucket: ['option1'],
      dateofexit: new Date(),
      dateofjoin: new Date(),
      deliverableExclusion: ['option1'],
      deliverable: ['option1'],
      designation: 'Test',
      liveDate: new Date(),
      inCapacity: 'option1',
      isActive: 'option1',
      manager: 'Test',
      maxHrs: 'Test',
      pooled: 'option1',
      primarySkill: 'option1',
      readyTo: 'Test',
      role: 'option1',
      skillLevel: 'option1',
      ta: ['option1'],
      taExclusion: ['option1'],
      task: 'option1',
      timeZone: 'option1',
      practiceArea: 'option1'
    });
    this.upObject.isEditFormSubmit = false;
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
