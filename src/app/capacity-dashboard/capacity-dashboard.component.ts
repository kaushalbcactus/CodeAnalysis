import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { MultiSelect, MessageService } from 'primeng/primeng';
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
  @ViewChild('InitialUserCapacity', { static: true }) userCapacity: UsercapacityComponent;
  AlldbResources: any;
  Resources: [];
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
    resources: ['', [Validators.required]],
    rangeDates: ['', [Validators.required]]
  });

  ngOnInit() {
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
      select: "ID,UserName/Id,UserName/Title,UserName/EMail,PrimarySkill,Bucket,Practice_x0020_Area,MaxHrs",
      expand: "UserName/ID,UserName/EMail,UserName/Title",
      filter: "IsActive eq 'Yes'",
      orderby: "UserName/Title asc",
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

        this.Resources = this.AlldbResources.map(o => new Object({ label: o.UserName.Title, value: o }));
      }
    }
    console.log(arrResults);
  }


  onChange(event, arrayType) {
    this.fetchDataloader = false;
    if (arrayType === 'bucket') {

      this.PracticeAreas = event.value.length > 0 ? this.commonService.sortData(this.sharedObject.unique
        (this.AlldbResources.filter(c => event.value.includes(c.Bucket)).filter(c => c.Practice_x0020_Area !== null).map(o => new Object({
          label: o.Practice_x0020_Area,
          value: o.Practice_x0020_Area
        })), ['label'])) : this.commonService.sortData(this.sharedObject.unique
          (this.AlldbResources.filter(c => c.Practice_x0020_Area !== null).map(o => new Object({
            label: o.Practice_x0020_Area,
            value: o.Practice_x0020_Area
          })), ['label']));

      this.Skills = event.value.length > 0 ? this.commonService.sortData(this.sharedObject.unique(
        this.AlldbResources.filter(c => event.value.includes(c.Bucket)).filter(c => c.PrimarySkill !== null).map(o => new Object({
          label: o.PrimarySkill,
          value: o.PrimarySkill
        })), ['label'])) : this.commonService.sortData(this.sharedObject.unique(
          this.AlldbResources.filter(c => c.PrimarySkill !== null).map(o => new Object({
            label: o.PrimarySkill,
            value: o.PrimarySkill
          })), ['label']));

      this.Resources = event.value.length > 0 ? this.commonService.sortData(
        this.AlldbResources.filter(c => event.value.includes(c.Bucket)).filter(c => c.UserName.Title !== null).map(o =>
          new Object({ label: o.UserName.Title, value: o }))) : this.commonService.sortData
          (this.AlldbResources.filter(c => c.UserName.Title !== null).map(o =>
            new Object({ label: o.UserName.Title, value: o })));


      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.controls['practicearea'].setValue(null);
      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.controls['skill'].setValue(null);
      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.controls['resources'].setValue(null);


    } else if (arrayType === 'practicearea') {

      this.Skills = event.value.length > 0 ? this.commonService.sortData(this.sharedObject.unique(
        this.AlldbResources.filter(c => event.value.includes(c.Practice_x0020_Area)).filter(c =>
          c.PrimarySkill !== null).map(o => new Object({
            label: o.PrimarySkill,
            value: o.PrimarySkill
          })), ['label'])) : this.commonService.sortData(this.sharedObject.unique(
            this.AlldbResources.filter(c => c.PrimarySkill !== null).map(o => new Object({
              label: o.PrimarySkill,
              value: o.PrimarySkill
            })), ['label']));

      this.Resources = event.value.length > 0 ? this.commonService.sortData(
        this.AlldbResources.filter(c => event.value.includes(c.Practice_x0020_Area)).filter(c => c.UserName.Title !== null).map(o =>
          new Object({ label: o.UserName.Title, value: o }))) : this.commonService.sortData
          (this.AlldbResources.filter(c => c.UserName.Title !== null).map(o =>
            new Object({ label: o.UserName.Title, value: o })));

      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.controls['skill'].setValue(null);
      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.controls['resources'].setValue(null);

    } else if (arrayType === 'skill') {
      // tslint:disable-next-line: no-string-literal
      this.searchCapacityForm.controls['resources'].setValue(null);

      this.Resources = event.value.length > 0 ? this.commonService.sortData(
        this.AlldbResources.filter(c => event.value.includes(c.PrimarySkill)).filter(c => c.UserName.Title !== null).map(o =>
          new Object({ label: o.UserName.Title, value: o }))) : this.commonService.sortData
          (this.AlldbResources.filter(c => c.UserName.Title !== null).map(o =>
            new Object({ label: o.UserName.Title, value: o })));

    } else if (arrayType === 'resource') {

    } else {
      this.Buckets = this.commonService.sortData(this.sharedObject.unique(this.AlldbResources.filter(c => c.Bucket !== null).map(
        o => new Object({ label: o.Bucket, value: o.Bucket })), ['label']));

      this.PracticeAreas = this.commonService.sortData(this.sharedObject.unique
        (this.AlldbResources.filter(c => c.Practice_x0020_Area !== null).map(o => new Object({
          label: o.Practice_x0020_Area,
          value: o.Practice_x0020_Area,
        })), ['label']));

      this.Skills = this.commonService.sortData(this.sharedObject.unique
        (this.AlldbResources.filter(c => c.PrimarySkill !== null).map(o => new Object({
          label: o.PrimarySkill,
          value: o.PrimarySkill
        })), ['label']));

      this.Resources = this.AlldbResources.filter(c => c.UserName.Title !== null)
        .map(o => new Object({ label: o.UserName.Title, value: o }));
    }


  }


  async onSubmit() {
    if (!this.searchCapacityForm.valid) {
      if (!this.searchCapacityForm.value.resources) {
        this.messageService.add({ key: 'toastMessage', severity: 'warn', summary: 'Warn Message', detail: 'Please select Resource.' });
      } else {
        this.messageService.add({ key: 'toastMessage', severity: 'warn', summary: 'Warn Message', detail: 'Please select dates.' });
      }
      return false;

    } else {
      this.fetchDataloader = true;
      const data = {
        task: { resources: this.searchCapacityForm.value.resources },
        startTime: this.searchCapacityForm.value.rangeDates[0],
        endTime: this.searchCapacityForm.value.rangeDates[1] ?
          this.searchCapacityForm.value.rangeDates[1] : this.searchCapacityForm.value.rangeDates[0],
        type: 'CapacityDashboard'
      };

      this.userCapacity.loaderenable = true;
      this.userCapacityEnable = true;
      this.userCapacity.Onload(data);
    }

  }
}
