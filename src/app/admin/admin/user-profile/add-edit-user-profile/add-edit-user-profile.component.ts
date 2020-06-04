import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { AdminCommonService } from 'src/app/admin/services/admin-common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { CommonService } from 'src/app/Services/common.service';
import { PeoplePickerQuery } from 'src/app/admin/peoplePickerModel/people-picker.query';
import { PeoplePickerUser } from 'src/app/admin/peoplePickerModel/people-picker.response';
@Component({
  selector: 'app-add-edit-user-profile',
  templateUrl: './add-edit-user-profile.component.html',
  styleUrls: ['./add-edit-user-profile.component.css']
})
export class AddEditUserProfileComponent implements OnInit {

  addUser: FormGroup;
  editUser: FormGroup;
  modalloaderenable = true;
  showeditUser = false;
  upObject = {
    isFormSubmit: false,
    isEditFormSubmit: false
  };
  userFilterOptions = [];
  minEffectiveDate = new Date();
  minPastMonth;
  yearRange: any;
  currUserObj: any;
  customLabel = '';

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
  constructor(
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    private adminCommonService: AdminCommonService,
    private constants: ConstantsService,
    private adminConstants: AdminConstantService,
    private spServices: SPOperationService,
    private common: CommonService, ) { }

  ngOnInit() {
    this.minPastMonth = new Date(new Date().setDate(new Date().getDate() - 30));
    const currentYear = new Date();
    this.yearRange = this.common.getyearRange();
    this.initialAddUserForm();
    this.loadDropDownValue();
    if (this.config.data) {
      this.currUserObj = this.config.data;
      this.showEditUserModal();
    }
    else {
      this.addUser.get('workMonday').setValue(true);
      this.addUser.get('workTuesday').setValue(true);
      this.addUser.get('workWednessday').setValue(true);
      this.addUser.get('workThursday').setValue(true);
      this.addUser.get('workFriday').setValue(true);

    }



  }

  // tslint:disable-next-line: member-ordering
  public date = {
    isManagerEffectiveDateActive: false,
    isPracticeEffectiveDateActive: false,
    isTimeZoneEffectiveDateActive: false,
    isPrimarySkillEffectiveDateActive: false,
    isSkillLevelEffectiveDateActive: false,
    isDateExit: false,
    isBucketDateActive: false,
    isMaxHrsDateActive: false,
    isFTEEffectiveDateActive: false
  };

  cancel() {
    this.ref.close();
  }

  // Initial form Fields
  initialAddUserForm() {
    this.addUser = this.fb.group({
      username: ['', Validators.required],
      account: ['', null],
      bucket: ['', Validators.required],
      dateofexit: ['', null],
      dateofjoin: [new Date(), Validators.required],
      deliverableExclusion: ['', null],
      deliverable: ['', null],
      designation: ['', Validators.required],
      liveDate: [new Date(), Validators.required],
      inCapacity: ['', Validators.required],
      taVisibility: ['Yes', Validators.required],
      caVisibility: ['No', Validators.required],
      isActive: ['', null],
      isFTE: ['No', null],
      manager: ['', Validators.required],
      maxHrs: ['', [Validators.required, Validators.max(12), Validators.min(1)]],
      // '^((?:[1-9]|1[0-9]|2[0-3])(?:\.\d[05]0?)(?:\.\d{1,2})?|24?)$'
      // maxHrs: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.max(24)]],
      pooled: ['', Validators.required],
      primarySkill: ['', Validators.required],
      readyTo: ['', null],
      role: ['', Validators.required],
      skillLevel: ['', Validators.required],
      ta: ['', null],
      taExclusion: ['', null],
      task: ['', Validators.required],
      timeZone: ['', Validators.required],
      practiceArea: ['', Validators.required],
      bucketEffectiveDate: [new Date(), null],
      maxHrsEffectiveDate: [new Date(), null],
      managerEffectiveDate: [new Date(), null],
      practiceAreaEffectiveDate: [new Date(), null],
      timeZoneEffectiveDate: [new Date(), null],
      primarySkillEffectiveDate: [new Date(), null],
      skillLevelEffectiveDate: [new Date(), null],
      fTEEffectiveDate: [new Date(), null],
      workSunday: [{ value: '', disabled: true }, null],
      workMonday: ['', null],
      workTuesday: ['', null],
      workWednessday: ['', null],
      workThursday: ['', null],
      workFriday: ['', null],
      workSaturday: [{ value: '', disabled: true }, null],
    });
  }



  /**
   * This field contains an array for each drop down value which present on the form.
   */
  public adminDropDown = {
    bucketArray: [],
    practiceAreaArray: [],
    timeZoneArray: [],
    inCapacityArray: [],
    isFTEArray: [],
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
    isActiveArray: [],
    taVisibilityArray: [],
    caVisibilityArray: [],

  };
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
    this.adminDropDown.caVisibilityArray = [];
    this.adminDropDown.taVisibilityArray = [];
    this.adminDropDown.isFTEArray = [];
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
      this.common.showToastrMessage(this.constants.MessageType.warn,'Please select proper manager name.',false);
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
        managerEffectiveDateControl.updateValueAndValidity();
        this.date.isManagerEffectiveDateActive = false;
      }
    }
  }

  onBucketChange() {
    const bucketDateControl = this.addUser.get('bucketEffectiveDate');
    if (this.showeditUser && this.currUserObj.Bucket !== this.addUser.value.bucket) {
      bucketDateControl.setValidators([Validators.required]);
      bucketDateControl.updateValueAndValidity();
      this.date.isBucketDateActive = true;
      this.addUser.get('bucketEffectiveDate').setValue(new Date());
      this.addUser.get('bucketEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.Bucket === this.addUser.value.bucket) {
      this.date.isBucketDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('bucketEffectiveDate').setValue(this.currUserObj.BucketEffectiveDate ? new Date(this.currUserObj.BucketEffectiveDate) : new Date());
      this.addUser.get('bucketEffectiveDate').disable();
    } else {
      bucketDateControl.clearValidators();
      bucketDateControl.updateValueAndValidity();
      this.date.isBucketDateActive = false;
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
    // console.log('this.addUser.value.practiceArea ', this.addUser.value.practiceArea);
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
      this.addUser.get('practiceAreaEffectiveDate').setValue(userObj.PracticeAreaEffectiveDate ? new Date(userObj.PracticeAreaEffectiveDate) : new Date());
      this.addUser.get('practiceAreaEffectiveDate').disable();
    } else {
      practiceAreaEffectiveDateControl.clearValidators();
      practiceAreaEffectiveDateControl.updateValueAndValidity();
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
    this.minEffectiveDate = this.addUser.value.dateofjoin ? new Date(this.addUser.value.dateofjoin) : new Date();
    if (this.showeditUser && this.currUserObj.TimeZone.ID !== this.addUser.value.timeZone) {
      timeZoneEffectiveDateControl.setValidators([Validators.required]);
      timeZoneEffectiveDateControl.updateValueAndValidity();
      this.date.isTimeZoneEffectiveDateActive = true;
      this.addUser.get('timeZoneEffectiveDate').setValue(null);
      this.addUser.get('timeZoneEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.TimeZone.ID === this.addUser.value.timeZone) {
      this.date.isTimeZoneEffectiveDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('timeZoneEffectiveDate').setValue(userObj.TimeZoneEffectiveDate ? new Date(userObj.TimeZoneEffectiveDate) : new Date());
      this.addUser.get('timeZoneEffectiveDate').disable();
    } else {
      timeZoneEffectiveDateControl.clearValidators();
      timeZoneEffectiveDateControl.updateValueAndValidity();
      this.date.isTimeZoneEffectiveDateActive = false;
    }
  }

  onCloseDateOfJoining() {
    if (this.editUser) {
      if (this.addUser.value.dateofjoin > this.addUser.value.BucketDate) {
        this.addUser.patchValue({ BucketDate: this.addUser.value.dateofjoin });
      }
      if (this.addUser.value.dateofjoin > this.addUser.value.timeZoneEffectiveDate) {
        this.addUser.patchValue({ timeZoneEffectiveDate: this.addUser.value.dateofjoin });
      }
      if (this.addUser.value.dateofjoin > this.addUser.value.liveDate) {
        this.addUser.patchValue({ liveDate: this.addUser.value.dateofjoin });
      }
      if (this.addUser.value.dateofjoin > this.addUser.value.MaxHrsDate) {
        this.addUser.patchValue({ MaxHrsDate: this.addUser.value.dateofjoin });
      }
      if (this.addUser.value.dateofjoin > this.addUser.value.primarySkillEffectiveDate) {
        this.addUser.patchValue({ primarySkillEffectiveDate: this.addUser.value.dateofjoin });
      }

      if (this.addUser.value.dateofjoin > this.addUser.value.dateofexit) {
        this.addUser.patchValue({ dateofexit: this.addUser.value.dateofjoin });
      }
    }
  }


  onFTEChange() {
    const isFTEEffectiveDateControl = this.addUser.get('fTEEffectiveDate');
    const accountControl = this.addUser.get('account');
    if (this.showeditUser && this.addUser.value.isFTE === 'Yes') {
      isFTEEffectiveDateControl.setValidators([Validators.required]);
      isFTEEffectiveDateControl.updateValueAndValidity();
      this.date.isFTEEffectiveDateActive = true;
      this.addUser.get('fTEEffectiveDate').setValue(null);
      this.addUser.get('fTEEffectiveDate').enable();
      accountControl.setValidators([Validators.required]);
      accountControl.updateValueAndValidity();
      this.addUser.get('account').setValue(null);

    } else if (this.showeditUser && this.addUser.value.isFTE === 'No') {
      const userObj = this.currUserObj;
      this.addUser.get('fTEEffectiveDate').setValue(null);
      isFTEEffectiveDateControl.clearValidators();
      isFTEEffectiveDateControl.updateValueAndValidity();
      this.date.isFTEEffectiveDateActive = false;
      accountControl.clearValidators();
      accountControl.updateValueAndValidity();
      this.addUser.get('account').setValue(null);
    }  else if (!this.showeditUser && this.addUser.value.isFTE === 'Yes') {
      isFTEEffectiveDateControl.setValidators([Validators.required]);
      isFTEEffectiveDateControl.updateValueAndValidity();
      this.date.isFTEEffectiveDateActive = true;
      this.addUser.get('fTEEffectiveDate').setValue(null);
      this.addUser.get('fTEEffectiveDate').enable();
      this.addUser.get('account').setValue(null);
      accountControl.setValidators([Validators.required]);
      accountControl.updateValueAndValidity();
    }
    else {
      this.addUser.get('fTEEffectiveDate').setValue(null);
      isFTEEffectiveDateControl.clearValidators();
      isFTEEffectiveDateControl.updateValueAndValidity();
      this.date.isFTEEffectiveDateActive = false;
      this.addUser.get('account').setValue(null);
      accountControl.clearValidators();
      accountControl.updateValueAndValidity();
    }

  }

  onMaxHrsChange() {
    const maxHrsDateControl = this.addUser.get('maxHrsEffectiveDate');
    if (this.showeditUser && this.currUserObj.MaxHrs !== this.addUser.value.maxHrs) {
      maxHrsDateControl.setValidators([Validators.required]);
      maxHrsDateControl.updateValueAndValidity();
      this.date.isMaxHrsDateActive = true;
      this.addUser.get('maxHrsEffectiveDate').setValue(new Date());
      this.addUser.get('maxHrsEffectiveDate').enable();
    } else if (this.showeditUser && this.currUserObj.MaxHrs === this.addUser.value.maxHrs) {
      this.date.isMaxHrsDateActive = true;
      const userObj = this.currUserObj;
      this.addUser.get('maxHrsEffectiveDate').setValue(this.currUserObj.MaxHrsEffectiveDate ? new Date(this.currUserObj.MaxHrsEffectiveDate) : new Date());
      this.addUser.get('maxHrsEffectiveDate').disable();
    } else {
      maxHrsDateControl.clearValidators();
      this.date.isMaxHrsDateActive = false;
      maxHrsDateControl.updateValueAndValidity();
    }
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
    this.date.isFTEEffectiveDateActive = false;
    this.date.isBucketDateActive = false;
    this.date.isMaxHrsDateActive = false;
    const userObj = this.currUserObj;
    this.customLabel = 'Update';
    this.addUser.controls.username.disable();
    // set the value into the form.
    await this.setUserFormField(userObj);
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

    this.addUser.patchValue({
      bucket: userObj.Bucket,
      // practiceArea: userObj.PracticeArea,
      timeZone: userObj.TimeZone.ID,
      liveDate: userObj.GoLiveDate ? new Date(userObj.GoLiveDate) : new Date(),
      dateofjoin: userObj.DateOfJoining ? new Date(userObj.DateOfJoining) : new Date(),
      inCapacity: userObj.InCapacity,
      taVisibility: userObj.TAVisibility ? userObj.TAVisibility : 'No',
      caVisibility: userObj.CAVisibility ? userObj.CAVisibility : 'No',
      designation: userObj.Designation,
      pooled: userObj.Pooled,
      maxHrs: userObj.MaxHrs,
      isFTE: userObj.IsFTE ? userObj.IsFTE : 'No',
      primarySkill: userObj.PrimarySkill,
      skillLevel: userObj.SkillLevel.ID,
      role: userObj.Role,
      readyTo: userObj.ReadyTo,
    });

    // Convert Practice area(;#) to array
    const paArray = userObj.PracticeArea ? userObj.PracticeArea.split(',') : [];
    if (paArray.length) {
      const val = [];
      paArray.forEach(element => {
        val.push(element);
      });

      this.addUser.patchValue({
        practiceArea: val
      });
      // this.addUser.get('practiceArea').setValue(val);
      // this.addUser.value.practiceArea.updateValueAndValidity();
    }

    if (userObj.Task.results && userObj.Task.results.length) {
      const tempTaskArray = this.adminCommonService.getIds(userObj.Task.results);
      // this.addUser.get('task').setValue(tempTaskArray);
      this.addUser.patchValue({
        task: tempTaskArray
      });
    }
    if (userObj.Account.results && userObj.Account.results.length && this.addUser.value.isFTE === 'No') {
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
      this.addUser.get('managerEffectiveDate').setValue(userObj.ManagerEffectiveDate ? new Date(userObj.ManagerEffectiveDate) : new Date());
      this.addUser.get('managerEffectiveDate').disable();
    }


    if (this.addUser.value.isFTE === 'Yes') {
      if (userObj.FTEEffectiveDate) {
        this.date.isFTEEffectiveDateActive = true;
        this.addUser.get('fTEEffectiveDate').setValue(userObj.FTEEffectiveDate ?
          new Date(userObj.FTEEffectiveDate) : new Date());
        this.addUser.get('fTEEffectiveDate').disable();
      } else {
        const isFTEEffectiveDateControl = this.addUser.get('fTEEffectiveDate');
        isFTEEffectiveDateControl.setValidators([Validators.required]);
        isFTEEffectiveDateControl.updateValueAndValidity();
        this.date.isFTEEffectiveDateActive = true;
        this.addUser.get('fTEEffectiveDate').setValue(null);
        this.addUser.get('fTEEffectiveDate').enable();

      }
      const accountControl = this.addUser.get('account');
      accountControl.setValidators([Validators.required]);
      accountControl.updateValueAndValidity();
      if (userObj.Account.results && userObj.Account.results.length > 1) {
        this.addUser.get('account').setValue(null);
      } else if (userObj.Account.results && userObj.Account.results.length === 1) {
        this.addUser.get('account').setValue(userObj.Account.results[0].ID);
      }
    }

    if (userObj.PracticeAreaEffectiveDate) {
      this.date.isPracticeEffectiveDateActive = true;
      this.addUser.get('practiceAreaEffectiveDate').setValue(userObj.PracticeAreaEffectiveDate ?
        new Date(userObj.PracticeAreaEffectiveDate) : new Date());
      this.addUser.get('practiceAreaEffectiveDate').disable();
    }
    if (userObj.TimeZoneEffectiveDate) {
      this.date.isTimeZoneEffectiveDateActive = true;
      this.addUser.get('timeZoneEffectiveDate').setValue(userObj.TimeZoneEffectiveDate ?
        new Date(userObj.TimeZoneEffectiveDate) : new Date());
      this.addUser.get('timeZoneEffectiveDate').disable();
    }
    if (userObj.PrimarySkillEffectiveDate) {
      this.date.isPrimarySkillEffectiveDateActive = true;
      this.addUser.get('primarySkillEffectiveDate').setValue(userObj.PrimarySkillEffectiveDate ?
        new Date(userObj.PrimarySkillEffectiveDate) : new Date());
      this.addUser.get('primarySkillEffectiveDate').disable();
    }
    if (userObj.SkillLevelEffectiveDate) {
      this.date.isSkillLevelEffectiveDateActive = true;
      this.addUser.get('skillLevelEffectiveDate').setValue(userObj.SkillLevelEffectiveDate ?
        new Date(userObj.SkillLevelEffectiveDate) : new Date());
      this.addUser.get('skillLevelEffectiveDate').disable();
    }

    if (userObj.BucketEffectiveDate) {
      this.date.isBucketDateActive = true;
      this.addUser.get('bucketEffectiveDate').setValue(userObj.BucketEffectiveDate ?
        new Date(userObj.BucketEffectiveDate) : new Date());
      this.addUser.get('bucketEffectiveDate').disable();
    }


    if (userObj.MaxHrsEffectiveDate) {
      this.date.isMaxHrsDateActive = true;
      this.addUser.get('maxHrsEffectiveDate').setValue(userObj.MaxHrsEffectiveDate ?
        new Date(userObj.MaxHrsEffectiveDate) : new Date());
      this.addUser.get('maxHrsEffectiveDate').disable();
    }


    if (userObj.DateofExit) {
      this.showeditUser = true;
      this.date.isDateExit = true;
      this.addUser.get('dateofexit').setValue(userObj.DateofExit ? new Date(userObj.DateofExit) : new Date());
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

    this.modalloaderenable = true;
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
      primarySkillEffectiveDateControl.updateValueAndValidity();
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
      skillLevelEffectiveDateControl.updateValueAndValidity();
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
        dateofexitControl.updateValueAndValidity();
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

      // console.log(this.userFilterOptions);
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

      // load TAVisibility dropdown
      let taVisibilityResults = dropdownResults[12].retItems;
      if (taVisibilityResults && taVisibilityResults.length) {
        taVisibilityResults = taVisibilityResults[0].Choices.results;
        taVisibilityResults.forEach(element => {
          this.adminDropDown.taVisibilityArray.push({ label: element, value: element });
        });
      }

      // load CAVisibility dropdown
      let caVisibilityResults = dropdownResults[13].retItems;
      if (caVisibilityResults && caVisibilityResults.length) {
        caVisibilityResults = caVisibilityResults[0].Choices.results;
        caVisibilityResults.forEach(element => {
          this.adminDropDown.caVisibilityArray.push({ label: element, value: element });
        });
      }

      // load IsFTE dropdown
      let isFTEResults = dropdownResults[14].retItems;
      if (isFTEResults && isFTEResults.length) {
        isFTEResults = isFTEResults[0].Choices.results;
        isFTEResults.forEach(element => {
          this.adminDropDown.isFTEArray.push({ label: element, value: element });
        });
      }

      this.modalloaderenable = false;
    }
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


    // Get TAVisibility from ResourceCategorization list ##12
    const taVisibilityGet = Object.assign({}, options);
    const taVisibilityFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    taVisibilityFilter.filter = taVisibilityFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.TAVISIBILITY);
    taVisibilityGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      taVisibilityFilter);
    taVisibilityGet.type = 'GET';
    taVisibilityGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(taVisibilityGet);



    // Get CAVisibility from ResourceCategorization list ##13
    const caVisibilityGet = Object.assign({}, options);
    const caVisibilityFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    caVisibilityFilter.filter = caVisibilityFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.CAVISIBILITY);
    caVisibilityGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      caVisibilityFilter);
    caVisibilityGet.type = 'GET';
    caVisibilityGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(caVisibilityGet);

    // Get IsFTE from ResourceCategorization list ##14
    const isFTEGet = Object.assign({}, options);
    const isFTEFilter = Object.assign({}, this.adminConstants.QUERY.GET_CHOICEFIELD);
    isFTEFilter.filter = isFTEFilter.filter.replace(/{{choiceField}}/gi,
      this.adminConstants.CHOICE_FIELD_NAME.ISFTE);
    isFTEGet.url = this.spServices.getChoiceFieldUrl(this.constants.listNames.ResourceCategorization.name,
      isFTEFilter);
    isFTEGet.type = 'GET';
    isFTEGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(isFTEGet);




    this.common.SetNewrelic('admin', 'admin-UserProfile', 'GetTADeliverableTypeCLEMilestoneTasksSkillMasterRCTimeZoneBusinessVerticle');
    const result = await this.spServices.executeBatch(batchURL);
    // console.log(result);
    return result;
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

  SaveUserDetails(UserDetails) {
    if (UserDetails.valid) {
      // console.log(addUserForm.value);
      /**
       * Need to validate if username and manager is properly selected or entered.
       */
      if (UserDetails.value.username && !UserDetails.value.username.hasOwnProperty('EntityData')) {

        this.common.showToastrMessage(this.constants.MessageType.warn,'Please select proper username name.',false);
        return false;
      }
      if (UserDetails.value.manager && !UserDetails.value.manager.hasOwnProperty('EntityData')) {

        this.common.showToastrMessage(this.constants.MessageType.warn,'Please select proper manager name.',false);
        return false;
      }
      if (new Date(UserDetails.value.dateofjoin) > new Date(UserDetails.value.liveDate)) {

        this.common.showToastrMessage(this.constants.MessageType.warn,'Date of joining cannot be greater than go live date.',false);
        return false;
      }

      const UserDetailsObj = {
        userDetails: UserDetails,
        date: this.date
      };
      this.ref.close(UserDetailsObj);
    } else {
      this.upObject.isFormSubmit = true;
    }
  }


}
