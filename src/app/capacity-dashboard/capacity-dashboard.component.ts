import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { MultiSelect, MessageService } from 'primeng';
import { FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from '../Services/global.service';
import { SPOperationService } from '../Services/spoperation.service';
import { ConstantsService } from '../Services/constants.service';
import { CommonService } from '../Services/common.service';
import { UsercapacityComponent } from '../shared/usercapacity/usercapacity.component';



@Component({
  selector: 'app-capacity-dashboard',
  templateUrl: './capacity-dashboard.component.html',
  styleUrls: ['./capacity-dashboard.component.css'],

})
export class CapacityDashboardComponent implements OnInit {
  rangeDates: Date[];
  @ViewChildren('cmp') components: QueryList<MultiSelect>;
  @ViewChild('InitialUserCapacity', { static: false }) userCapacity: UsercapacityComponent;
  AlldbResources: any;
  Resources: [];
  ResourceType = [{ label: 'On Job Resource', value: 'OnJob' }, { label: 'Trainee', value: 'Trainee' }];
  Statuses = [{ label: 'All', value: 'All' }, { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Not Confirmed', value: 'NotConfirmed' }];
  Skills: [];
  PracticeAreas: [];
  Buckets: [];
  userCapacityEnable = false;
  mainloaderenable = true;
  fetchDataloader = false;
  constructor(
    public fb: FormBuilder,
    public messageService: MessageService,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private constants: ConstantsService) {
  }

  searchCapacityForm = this.fb.group({
    bucket: [''],
    practicearea: [''],
    skill: [''],
    resourcetype: ['OnJob'],
    status: ['All'],
    resources: ['', [Validators.required]],
    rangeDates: ['', [Validators.required]]
  });

  ngOnInit() {
    this.sharedObject.currentTitle = 'Capacity Dashboard';

    this.GetResources();
  }




  async GetResources() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };

    const Resources = {
      // tslint:disable 
      select: "ID,UserNamePG/Id,UserNamePG/Title,UserNamePG/EMail,PrimarySkill,Bucket,Practice_x0020_Area,MaxHrs,GoLiveDate,DateOfJoining",
      expand: "UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title",
      filter: "IsActiveCH eq 'Yes'",
      orderby: "UserNamePG/Title asc",
      top: 4500
      // tslint:enable
    };
    const resourcesGet = Object.assign({}, options);
    const resourcesQuery = Object.assign({}, Resources);
    resourcesGet.url = this.spServices.getReadURL('' + this.constants.listNames.ResourceCategorization.name +
      '', resourcesQuery);
    resourcesGet.type = 'GET';
    resourcesGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(resourcesGet);

    this.commonService.SetNewrelic('CapacityDashboard', 'CapacityDashboard', 'GetResourceCategorization');

    const arrResults = await this.spServices.executeBatch(batchURL);

    this.mainloaderenable = false;
    if (arrResults) {
      if (arrResults[0].retItems.length > 0) {
        this.AlldbResources = arrResults[0].retItems;

        this.Buckets = this.commonService.sortData(this.sharedObject.unique(this.AlldbResources.filter(c => c.Bucket !== null).map(
          o => new Object({ label: o.Bucket, value: o.Bucket })), ['label']));

        this.PracticeAreas = this.commonService.sortData(this.sharedObject.unique
          (this.AlldbResources.filter(c => c.Practice_x0020_Area !== null).map(o => new Object({
            label: o.Practice_x0020_Area,
            value: o.Practice_x0020_Area,
          })), ['label']));

        this.Skills = this.commonService.sortData(this.sharedObject.unique(
          this.AlldbResources.filter(c => c.PrimarySkill !== null).map(o => new Object({
            label: o.PrimarySkill,
            value: o.PrimarySkill
          })), ['label']));

        this.Resources = this.AlldbResources.map(o => new Object({ label: o.UserNamePG.Title, value: o }));
      }
    }
  }

  filterData(callType, dataType) {

    const arrValue = this.AlldbResources;
    let bucket = this.searchCapacityForm.controls['bucket'].value;
    let practiceArea = this.searchCapacityForm.controls['practicearea'].value;
    let skill = this.searchCapacityForm.controls['skill'].value;
    bucket = bucket ? bucket : [];
    practiceArea = practiceArea ? practiceArea : [];
    skill = skill ? skill : [];
    let res;
    switch (callType) {
      case 'bucket':
        res = bucket.length ? arrValue.filter(c => bucket.includes(c.Bucket)) : arrValue;
        switch (dataType) {
          case 'skill':
            res = practiceArea.length ? res.filter(c => practiceArea.includes(c.Practice_x0020_Area)) : res;
            break;
          case 'resource':
            res = practiceArea.length ? res.filter(c => practiceArea.includes(c.Practice_x0020_Area)) : res;
            res = skill.length ? res.filter(c => skill.includes(c.PrimarySkill)) : res;
            break;
        }
        break;
      case 'practicearea':
        res = bucket.length ? arrValue.filter(c => bucket.includes(c.Bucket)) : arrValue;
        res = practiceArea.length ? res.filter(c => practiceArea.includes(c.Practice_x0020_Area)) : res;
        switch (dataType) {
          case 'resource':
            res = skill.length ? res.filter(c => skill.includes(c.PrimarySkill)) : res;
            break;
        }
        break;
      case 'skill':
        res = bucket.length ? arrValue.filter(c => bucket.includes(c.Bucket)) : arrValue;
        res = practiceArea.length ? res.filter(c => practiceArea.includes(c.Practice_x0020_Area)) : res;
        res = skill.length ? res.filter(c => skill.includes(c.PrimarySkill)) : res;
        break;
    }

    return res;
  }

  onChange(event, arrayType) {
    this.fetchDataloader = false;
    if (arrayType === 'bucket') {

      const practiceAreas = event.value.length > 0 ? Array.from(new Set(this.filterData('bucket', 'practicearea')
        .filter(c => c.Practice_x0020_Area !== null).map(o => o.Practice_x0020_Area))) : [];

      const skills = event.value.length > 0 ? Array.from(new Set(this.filterData('bucket', 'skill')
        .filter(c => c.PrimarySkill !== null).map(o => o.PrimarySkill))) : [];

      const resources = event.value.length > 0 ? this.commonService.sortData(
        this.filterData('bucket', 'resource').filter(c => c.UserNamePG.Title !== null).map(o =>
          new Object({ label: o.UserNamePG.Title, value: o }))) : [];

      const resValues = resources.map(({ value }) => value); // this.Resources.map(o => o.value);
      // tslint:disable-next-line: no-string-literal
      //this.searchCapacityForm.controls['practicearea'].setValue(null);
      // tslint:disable-next-line: no-string-literal
      //this.searchCapacityForm.controls['skill'].setValue(null);
      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.patchValue({ practicearea: practiceAreas, skill: skills, resources: resValues });


    } else if (arrayType === 'practicearea') {

      const skills = event.value.length > 0 ? Array.from(new Set(this.filterData('practicearea', 'skill')
        .filter(c => c.PrimarySkill !== null).map(o => o.PrimarySkill))) : [];

      const resources = event.value.length > 0 ? this.commonService.sortData(
        this.filterData('practicearea', 'resource').filter(c => c.UserNamePG.Title !== null).map(o =>
          new Object({ label: o.UserNamePG.Title, value: o }))) : this.commonService.sortData
          (this.AlldbResources.filter(c => c.UserNamePG.Title !== null).map(o =>
            new Object({ label: o.UserNamePG.Title, value: o })));

      // tslint:disable-next-line: no-string-literal
      //this.searchCapacityForm.controls['skill'].setValue(null);
      // tslint:disable-next-line: no-string-literal
      //this.searchCapacityForm.controls['resources'].setValue(this.Resources);

      const resValues = resources.map(({ value }) => value);
      this.searchCapacityForm.patchValue({ skill: skills, resources: resValues });
    } else if (arrayType === 'skill') {
      // tslint:disable-next-line: no-string-literal
      const resources = event.value.length > 0 ? this.commonService.sortData(
        this.filterData('skill', 'resource').filter(c => c.UserNamePG.Title !== null).map(o =>
          new Object({ label: o.UserNamePG.Title, value: o }))) : this.commonService.sortData
          (this.AlldbResources.filter(c => c.UserNamePG.Title !== null).map(o =>
            new Object({ label: o.UserNamePG.Title, value: o })));

      //this.searchCapacityForm.controls['resources'].setValue(this.Resources);
      const resValues = resources.map(({ value }) => value);
      this.searchCapacityForm.patchValue({ resources: resValues });

    } else if (arrayType === 'resource') { } else if (arrayType === 'resourcetype') {
    } else if (arrayType === 'taskType') { } else {

      this.searchCapacityForm.patchValue({
        bucket: [], practicearea: [], skill: [], resources: [],
        resourcetype: ['OnJob'], status: ['All'],
      });
    }

  }


  async onSubmit() {

    this.searchCapacityForm.value.resourcetype = this.searchCapacityForm.value.resourcetype === null ?
      'OnJob' : this.searchCapacityForm.value.resourcetype;

    this.searchCapacityForm.value.status = this.searchCapacityForm.value.status === null ? 'All' : this.searchCapacityForm.value.status;


    if (!this.searchCapacityForm.valid) {
      if (!this.searchCapacityForm.value.resources) {
        this.messageService.add({ key: 'toastMessage', severity: 'warn', summary: 'Warn Message', detail: 'Please select Resource.' });
      } else {
        this.messageService.add({ key: 'toastMessage', severity: 'warn', summary: 'Warn Message', detail: 'Please select dates.' });
      }
      return false;

    } else {
      this.fetchDataloader = true;

      let Resources = this.searchCapacityForm.value.resources;

      const startDate =  new Date(this.searchCapacityForm.value.rangeDates[0]);
      if (this.searchCapacityForm.value.resourcetype === 'OnJob') {
        if (this.searchCapacityForm.value.rangeDates[1]) {
          Resources = Resources.filter(c => c.GoLiveDate !== null).filter(c => new Date(c.GoLiveDate)
            <= this.searchCapacityForm.value.rangeDates[1]);
        } else {
          Resources = Resources.filter(c => c.GoLiveDate !== null).filter(c => new Date
            (c.GoLiveDate) <= startDate);
        }

      } else {
        // if (this.searchCapacityForm.value.rangeDates[1]) {
        const nullResources = Resources.filter(c => c.GoLiveDate === null);
        Resources = Resources.filter(c => c.GoLiveDate !== null).filter(c => new Date(c.GoLiveDate)
          > startDate);
        Resources.push.apply(Resources, nullResources);
        // } else {
        //   Resources = Resources.filter(c => this.searchCapacityForm.value.rangeDates[0] > new Date
        //     (c.GoLiveDate));
        // }
      }
      const data = {
        task: { resources: Resources },
        startTime: this.searchCapacityForm.value.rangeDates[0],
        endTime: this.searchCapacityForm.value.rangeDates[1] ?
          this.searchCapacityForm.value.rangeDates[1] : startDate,
        type: 'CapacityDashboard',
        resourceType: this.searchCapacityForm.value.resourcetype,
        taskStatus: this.searchCapacityForm.value.status
      };

      this.userCapacity.loaderenable = true;
      this.userCapacityEnable = true;
      this.userCapacity.Onload(data);
    }

  }
}
