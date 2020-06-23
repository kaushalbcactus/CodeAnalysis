import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { UsercapacityComponent } from "src/app/shared/usercapacity/usercapacity.component";
import { TimelineComponent } from "../timeline/timeline.component";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { GlobalService } from "src/app/Services/global.service";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-resource-selection",
  templateUrl: "./resource-selection.component.html",
  styleUrls: ["./resource-selection.component.css"],
})
export class ResourceSelectionComponent implements OnInit {
  @ViewChild("userCapacity", { static: false })
  userCapacity: UsercapacityComponent;
  AlldbResources = [];
  Buckets = [];
  PracticeAreas = [];
  Resources = [];
  header = "";
  constructor(
    private timeline: TimelineComponent,
    private commonService: CommonService,
    private constants: ConstantsService,
    private spServices: SPOperationService,
    private sharedObject: GlobalService,
    private fb: FormBuilder
  ) {}

  searchCapacityForm = this.fb.group({
    bucket: [""],
    practicearea: [""],
    resources: ["", [Validators.required]],
    rangeDates: ["", [Validators.required]],
  });

  async ngOnInit() {
    if (this.sharedObject.data) {
      let data = this.sharedObject.data;
      this.header = this.sharedObject.resourceHeader;
      console.log(data);
      await this.onLoad(data);
    }
  }

  // ngOnChanges(changes: SimpleChanges) {
  //  console.log(this.data);
  // }

  async onLoad(data: any) {
    await this.GetResources();
    let resArr = [];
    this.sharedObject.data.task.resources.forEach((e) => {
      resArr.push(
        this.Resources.find((r) => r.value.UserName.Id == e.UserNamePG.ID)
      );
    });
    this.Resources = resArr;
    resArr = resArr.map(({ value }) => value);

    let filterBuckets = [];
    let filterPracticeArea = [];

    let bucket = [
      ...new Map(
        resArr
          .filter((e) => e.Bucket)
          .map((t) => t.Bucket)
          .map((item) => [item, item])
      ).values(),
    ];
    bucket.forEach((e) => {
      filterBuckets.push(this.Buckets.find((r) => r.value == e));
    });
    this.Buckets = filterBuckets;

    let practiceArea = [
      ...new Map(
        resArr
          .filter((e) => e.Practice_x0020_Area)
          .map((t) => t.Practice_x0020_Area)
          .map((item) => [item, item])
      ).values(),
    ];
    practiceArea.forEach((e) => {
      filterPracticeArea.push(this.PracticeAreas.find((r) => r.value == e));
    });
    this.PracticeAreas = filterPracticeArea;

    this.searchCapacityForm.patchValue({
      bucket: bucket,
      practicearea: practiceArea,
      resources: resArr,
      rangeDates: [data.startTime, data.endTime],
    });
    this.userCapacity.loaderenable = true;
    // this.userCapacity.Onload(data)
    let capacity: any = await this.userCapacity.afterResourceChange(
      data.task,
      data.startTime,
      data.endTime,
      data.task.resources,
      [],
      false
    );
    // this.userCapacity.oCapacity = capacity;
    this.userCapacity.showCapacity(capacity);
  }

  async GetResources() {
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };

    const Resources = {
      // tslint:disable
      select:
        "ID,UserName/Id,UserName/Title,UserName/EMail,PrimarySkill,Bucket,Practice_x0020_Area,MaxHrs,GoLiveDate,DateOfJoining",
      expand: "UserName/ID,UserName/EMail,UserName/Title",
      filter: "IsActive eq 'Yes'",
      orderby: "UserName/Title asc",
      top: 4500,
      // tslint:enable
    };
    const resourcesGet = Object.assign({}, options);
    const resourcesQuery = Object.assign({}, Resources);
    resourcesGet.url = this.spServices.getReadURL(
      "" + this.constants.listNames.ResourceCategorization.name + "",
      resourcesQuery
    );
    resourcesGet.type = "GET";
    resourcesGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(resourcesGet);

    this.commonService.SetNewrelic(
      "CapacityDashboard",
      "CapacityDashboard",
      "GetResourceCategorization"
    );

    const arrResults = await this.spServices.executeBatch(batchURL);

    if (arrResults) {
      if (arrResults[0].retItems.length > 0) {
        this.AlldbResources = arrResults[0].retItems;

        this.Buckets = this.commonService.sortData(
          this.sharedObject.unique(
            this.AlldbResources.filter((c) => c.Bucket !== null).map(
              (o) => new Object({ label: o.Bucket, value: o.Bucket })
            ),
            ["label"]
          )
        );

        this.PracticeAreas = this.commonService.sortData(
          this.sharedObject.unique(
            this.AlldbResources.filter(
              (c) => c.Practice_x0020_Area !== null
            ).map(
              (o) =>
                new Object({
                  label: o.Practice_x0020_Area,
                  value: o.Practice_x0020_Area,
                })
            ),
            ["label"]
          )
        );

        this.Resources = this.AlldbResources.map(
          (o) => new Object({ label: o.UserName.Title, value: o })
        );
      }
    }
  }

  filterData(callType, dataType) {
    // const arrValue = this.AlldbResources;
    let arrValue = [];
    this.sharedObject.data.task.resources.forEach((e) => {
      arrValue.push(
        this.Resources.find((r) => r.value.UserName.Id == e.UserNamePG.ID)
      );
    });
    // this.Resources = arrValue;
    arrValue = arrValue.map(({ value }) => value);
    let bucket = this.searchCapacityForm.controls["bucket"].value;
    let practiceArea = this.searchCapacityForm.controls["practicearea"].value;
    bucket = bucket ? bucket : [];
    practiceArea = practiceArea ? practiceArea : [];
    let res;
    switch (callType) {
      case "bucket":
        res = bucket.length
          ? arrValue.filter((c) => bucket.includes(c.Bucket))
          : arrValue;
        switch (dataType) {
          case "resource":
            res = practiceArea.length
              ? res.filter((c) => practiceArea.includes(c.Practice_x0020_Area))
              : res;
            break;
        }
        break;
      case "practicearea":
        res = bucket.length
          ? arrValue.filter((c) => bucket.includes(c.Bucket))
          : arrValue;
        res = practiceArea.length
          ? res.filter((c) => practiceArea.includes(c.Practice_x0020_Area))
          : res;
        break;
    }

    return res;
  }

  onChange(event, arrayType) {
    if (arrayType === "bucket") {
      const practiceAreas =
        event.value.length > 0
          ? Array.from(
              new Set(
                this.filterData("bucket", "practicearea")
                  .filter((c) => c.Practice_x0020_Area !== null)
                  .map((o) => o.Practice_x0020_Area)
              )
            )
          : [];

      const resources =
        event.value.length > 0
          ? this.commonService.sortData(
              this.filterData("bucket", "resource")
                .filter((c) => c.UserName.Title !== null)
                .map((o) => new Object({ label: o.UserName.Title, value: o }))
            )
          : [];

      const resValues = resources.map(({ value }) => value); // this.Resources.map(o => o.value);

      this.searchCapacityForm.patchValue({
        practicearea: practiceAreas,
        resources: resValues,
      });
    } else if (arrayType === "practicearea") {
      const resources =
        event.value.length > 0
          ? this.commonService.sortData(
              this.filterData("practicearea", "resource")
                .filter((c) => c.UserName.Title !== null)
                .map((o) => new Object({ label: o.UserName.Title, value: o }))
            )
          : this.commonService.sortData(
              this.AlldbResources.filter((c) => c.UserName.Title !== null).map(
                (o) => new Object({ label: o.UserName.Title, value: o })
              )
            );

      const resValues = resources.map(({ value }) => value);
      this.searchCapacityForm.patchValue({ resources: resValues });
    } else if (arrayType === "resource") {
    } else if (arrayType === "resourcetype") {
    } else if (arrayType === "taskType") {
    } else {
      this.searchCapacityForm.patchValue({
        bucket: [],
        practicearea: [],
        resources: [],
      });
    }
  }

  async onSubmit() {
    if (!this.searchCapacityForm.valid) {
      let Message = "Please select dates.";
      if (!this.searchCapacityForm.value.resources) {
        Message = "Please select Resource.";
      }
      this.commonService.showToastrMessage(
        this.constants.MessageType.warn,
        Message,
        false
      );
      return false;
    } else {
      let Resources = this.searchCapacityForm.value.resources;

      const startDate = new Date(this.searchCapacityForm.value.rangeDates[0]);
      // if (this.searchCapacityForm.value.resourcetype === 'OnJob') {
      //   if (this.searchCapacityForm.value.rangeDates[1]) {
      //     Resources = Resources.filter(c => c.GoLiveDate !== null).filter(c => new Date(c.GoLiveDate)
      //       <= this.searchCapacityForm.value.rangeDates[1]);
      //   } else {
      //     Resources = Resources.filter(c => c.GoLiveDate !== null).filter(c => new Date
      //       (c.GoLiveDate) <= startDate);
      //   }

      // } else
      // {
      // if (this.searchCapacityForm.value.rangeDates[1]) {
      // const nullResources = Resources.filter(c => c.GoLiveDate === null);
      // Resources = Resources.filter(c => c.GoLiveDate !== null).filter(c => new Date(c.GoLiveDate)
      //   > startDate);
      // Resources.push.apply(Resources, nullResources);
      // } else {
      //   Resources = Resources.filter(c => this.searchCapacityForm.value.rangeDates[0] > new Date
      //     (c.GoLiveDate));
      // }
      // }
      let taskObj = this.sharedObject.data.task;
      const data = {
        task: taskObj,
        startTime: this.searchCapacityForm.value.rangeDates[0],
        endTime: this.searchCapacityForm.value.rangeDates[1]
          ? this.searchCapacityForm.value.rangeDates[1]
          : startDate,
      };

      this.userCapacity.loaderenable = true;

      let capacity: any = await this.userCapacity.afterResourceChange(
        data.task,
        data.startTime,
        data.endTime,
        Resources,
        [],
        false
      );

      this.userCapacity.showCapacity(capacity);
      // this.userCapacity.loaderenable = true;
      // this.userCapacity.Onload(data);
      // this.onLoad(data);
    }
  }

  confirmChangeResource(event: Event) {
    if (this.sharedObject.data.task.AssignedTo.ID == event) {
      this.commonService.showToastrMessage(this.constants.MessageType.error,"Please select different resource name to change the resource",false);
    } else {
      this.timeline.confirmChangeResource(event);
    }
  }
}