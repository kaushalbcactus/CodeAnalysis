import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
} from "@angular/core";
import { SelectItem } from "primeng/api";
import {  DialogService } from "primeng/dynamicdialog";
import { FormBuilder, Validators } from "@angular/forms";
import { GlobalService } from "../Services/global.service";
import { SPOperationService } from "../Services/spoperation.service";
import { ConstantsService } from "../Services/constants.service";
import { CommonService } from "../Services/common.service";
import { UsercapacityComponent } from "../shared/usercapacity/usercapacity.component";
import { BlockResourceDialogComponent } from "./block-resource-dialog/block-resource-dialog.component";
import { DatePipe } from "@angular/common";
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: "app-capacity-dashboard",
  templateUrl: "./capacity-dashboard.component.html",
  styleUrls: ["./capacity-dashboard.component.css"],
})
export class CapacityDashboardComponent implements OnInit {
  rangeDates: Date[];
  @ViewChildren("cmp") components: QueryList<MultiSelect>;
  @ViewChild("InitialUserCapacity", { static: false })
  userCapacity: UsercapacityComponent;
  AlldbResources: any;
  Resources: [];
  ResourceType = [
    { label: "On Job", value: "OnJob" },
    { label: "Trainee", value: "Trainee" },
  ];
  Statuses = [
    { label: "All", value: "All" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Not Confirmed", value: "NotConfirmed" },
    { label: "Adhoc", value: "Adhoc" },
  ];
  capacityDisplayUsers: any;
  Skills: [];
  PracticeAreas: [];
  Buckets: [];
  userCapacityEnable = false;
  mainloaderenable = true;
  fetchDataloader = false;
  constructor(
    public fb: FormBuilder,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    private commonService: CommonService,
    private constants: ConstantsService,
    public dialogService: DialogService,
    public datepipe: DatePipe
  ) {}

  searchCapacityForm = this.fb.group({
    bucket: [""],
    practicearea: [""],
    skill: [""],
    resourcetype: ["OnJob"],
    status: ["All"],
    resources: ["", [Validators.required]],
    rangeDates: ["", [Validators.required]],
  });

  ngOnInit() {

    setTimeout(() => {
      this.sharedObject.currentTitle = "Capacity Dashboard";
    }, 200);
    

    this.GetResources();
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
        "ID,UserNamePG/Id,UserNamePG/Title,UserNamePG/EMail,PrimarySkill,Bucket,Practice_x0020_Area,MaxHrs,GoLiveDate,DateOfJoining,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName",
      expand:
        "UserNamePG/ID,UserNamePG/EMail,UserNamePG/Title,TimeZone/ID,TimeZone/Title,TimeZone/TimeZoneName",
      filter: "IsActiveCH eq 'Yes'",
      orderby: "UserNamePG/Title asc",
      top: 4500,
      // tslint:enable
    };
    const resourcesGet = Object.assign({}, options);
    const resourcesQuery = Object.assign({}, Resources);
    resourcesGet.url = this.spServices.getReadURL(
      "" + this.constants.listNames.ResourceCategorization.name + "",
      resourcesQuery
    );
    resourcesGet.type = this.constants.Method.GET;
    resourcesGet.listName = this.constants.listNames.ResourceCategorization.name;
    batchURL.push(resourcesGet);

    this.commonService.SetNewrelic(
      "CapacityDashboard",
      "capacity-dashboard",
      "GetResourceCategorization",
      "GET"
    );

    const arrResults = await this.spServices.executeBatch(batchURL);

    this.mainloaderenable = false;
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

        this.Skills = this.commonService.sortData(
          this.sharedObject.unique(
            this.AlldbResources.filter((c) => c.PrimarySkill !== null).map(
              (o) =>
                new Object({
                  label: o.PrimarySkill,
                  value: o.PrimarySkill,
                })
            ),
            ["label"]
          )
        );

        this.Resources = this.AlldbResources.map(
          (o) => new Object({ label: o.UserNamePG.Title, value: o })
        );

        this.searchCapacityForm.patchValue({
          skill: ["Writer", "Reviewer"],
        });
        this.onChange({ value: ["Writer", "Reviewer"] }, "skill");
      }
    }
  }

  filterData(callType, dataType) {
    const arrValue = this.AlldbResources;
    let bucket = this.searchCapacityForm.controls["bucket"].value;
    let practiceArea = this.searchCapacityForm.controls["practicearea"].value;
    let skill = this.searchCapacityForm.controls["skill"].value;
    bucket = bucket ? bucket : [];
    practiceArea = practiceArea ? practiceArea : [];
    skill = skill ? skill : [];
    let res;
    switch (callType) {
      case "bucket":
        res = bucket.length
          ? arrValue.filter((c) => bucket.includes(c.Bucket))
          : arrValue;
        switch (dataType) {
          case "skill":
            res = practiceArea.length
              ? res.filter((c) => practiceArea.includes(c.Practice_x0020_Area))
              : res;
            break;
          case "resource":
            res = practiceArea.length
              ? res.filter((c) => practiceArea.includes(c.Practice_x0020_Area))
              : res;
            res = skill.length
              ? res.filter((c) => skill.includes(c.PrimarySkill))
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
        switch (dataType) {
          case "resource":
            res = skill.length
              ? res.filter((c) => skill.includes(c.PrimarySkill))
              : res;
            break;
        }
        break;
      case "skill":
        res = bucket.length
          ? arrValue.filter((c) => bucket.includes(c.Bucket))
          : arrValue;
        res = practiceArea.length
          ? res.filter((c) => practiceArea.includes(c.Practice_x0020_Area))
          : res;
        res = skill.length
          ? res.filter((c) => skill.includes(c.PrimarySkill))
          : res;
        break;
    }

    return res;
  }

  onChange(event, arrayType) {
    this.fetchDataloader = false;
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

      const skills =
        event.value.length > 0
          ? Array.from(
              new Set(
                this.filterData("bucket", "skill")
                  .filter((c) => c.PrimarySkill !== null)
                  .map((o) => o.PrimarySkill)
              )
            )
          : [];

      const resources =
        event.value.length > 0
          ? this.commonService.sortData(
              this.filterData("bucket", "resource")
                .filter((c) => c.UserNamePG.Title !== null)
                .map((o) => new Object({ label: o.UserNamePG.Title, value: o }))
            )
          : [];

      const resValues = resources.map(({ value }) => value); // this.Resources.map(o => o.value);
     
      this.searchCapacityForm.patchValue({
        practicearea: practiceAreas,
        skill: skills,
        resources: resValues,
      });
    } else if (arrayType === "practicearea") {
      const skills =
        event.value.length > 0
          ? Array.from(
              new Set(
                this.filterData("practicearea", "skill")
                  .filter((c) => c.PrimarySkill !== null)
                  .map((o) => o.PrimarySkill)
              )
            )
          : [];

      const resources =
        event.value.length > 0
          ? this.commonService.sortData(
              this.filterData("practicearea", "resource")
                .filter((c) => c.UserNamePG.Title !== null)
                .map((o) => new Object({ label: o.UserNamePG.Title, value: o }))
            )
          : this.commonService.sortData(
              this.AlldbResources.filter(
                (c) => c.UserNamePG.Title !== null
              ).map((o) => new Object({ label: o.UserNamePG.Title, value: o }))
            );

      const resValues = resources.map(({ value }) => value);
      this.searchCapacityForm.patchValue({
        skill: skills,
        resources: resValues,
      });
    } else if (arrayType === "skill") {
      // tslint:disable-next-line: no-string-literal
      const resources =
        event.value.length > 0
          ? this.commonService.sortData(
              this.filterData("skill", "resource")
                .filter((c) => c.UserNamePG.Title !== null)
                .map((o) => new Object({ label: o.UserNamePG.Title, value: o }))
            )
          : this.commonService.sortData(
              this.AlldbResources.filter(
                (c) => c.UserNamePG.Title !== null
              ).map((o) => new Object({ label: o.UserNamePG.Title, value: o }))
            );

      //this.searchCapacityForm.controls['resources'].setValue(this.Resources);
      const resValues = resources.map(({ value }) => value);
      this.searchCapacityForm.patchValue({ resources: resValues });
    } else if (arrayType === "resource") {
    } else if (arrayType === "resourcetype") {
    } else if (arrayType === "taskType") {
    } else {
      this.searchCapacityForm.patchValue({
        bucket: [],
        practicearea: [],
        skill: [],
        resources: [],
        resourcetype: ["OnJob"],
        status: ["All"],
      });
    }
  }

  async onSubmit(type: string) {
    this.searchCapacityForm.value.resourcetype =
      this.searchCapacityForm.value.resourcetype === null
        ? "OnJob"
        : this.searchCapacityForm.value.resourcetype;

    this.searchCapacityForm.value.status =
      this.searchCapacityForm.value.status === null
        ? "All"
        : this.searchCapacityForm.value.status;

    if (!this.searchCapacityForm.valid) {
      if (this.searchCapacityForm.controls.resources.status === "INVALID") {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Please select Resource.",
          false,
          true
        );
      } else {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Please select dates.",
          false,
          true
        );
      }
      return false;
    } else {
      if (
        !this.searchCapacityForm.value.rangeDates[0] ||
        !this.searchCapacityForm.value.rangeDates[1]
      ) {
        this.commonService.showToastrMessage(
          this.constants.MessageType.warn,
          "Please select proper dates.",
          false,
          true
        );
        return false;
      }
      if (type === "search") {
        this.SearchRecords();
      } else {
        if (
          this.searchCapacityForm.value.rangeDates[1] <
          new Date(this.datepipe.transform(new Date(), "MM/dd/yyyy"))
        ) {
          this.commonService.showToastrMessage(
            this.constants.MessageType.warn,
            "Unable to block resource on past days.",
            false,
            true
          );
          return false;
        } else {
          if (this.fetchDataloader) {
            if (this.capacityDisplayUsers.length > 0) {
              this.EnableBlockResourceDialog();
            } else {
              this.commonService.showToastrMessage(
                this.constants.MessageType.warn,
                "Unable to block resouces as there is no data available for selected combination.",
                false,
                true
              );
            }
          } else {
            this.commonService.showToastrMessage(
              this.constants.MessageType.warn,
              "Need to search user capacity before blocking resource.",
              false,
              true
            );
          }
        }
      }
    }
  }
  
  EnableBlockResourceDialog() {
    const resources = this.AlldbResources.filter((c) =>
      this.searchCapacityForm.value.resources.includes(c)
    ).map((o) => new Object({ label: o.UserNamePG.Title, value: o }));

    const selectedUsersList = [];

    for (let i = 0; i < this.capacityDisplayUsers.length; i++) {
      if (
        resources.find(
          (c) =>
            c.label === this.capacityDisplayUsers[i].userName &&
            c.value.UserNamePG.Id === this.capacityDisplayUsers[i].Id
        )
      ) {
        selectedUsersList.push(
          resources.find(
            (c) =>
              c.label === this.capacityDisplayUsers[i].userName &&
              c.value.UserNamePG.Id === this.capacityDisplayUsers[i].Id
          )
        );
      }
    }

    const ref = this.dialogService.open(BlockResourceDialogComponent, {
      header: "Block Resources",
      width: "60vw",
      style:{'top':'-15%'},
      data: {
        type: "new",
        Resources: selectedUsersList,
        selectedMinDate: this.searchCapacityForm.value.rangeDates[0],
        selectedMaxDate: this.searchCapacityForm.value.rangeDates[1],
      },
      contentStyle: {"max-height": "80vh", "overflow-y": "auto" },
      closable: false,
    });
    ref.onClose.subscribe(async (blockResource: any) => {
      if (blockResource) {
        const data = {
          Title: blockResource.taskFullName,
          // StartDate:blockResource.pUserStart,
          // DueDateDT:blockResource.pUserEnd,
          StartDate: new Date(
            this.datepipe.transform(blockResource.pUserStart, "yyyy-MM-dd") +
              "T00:00:00.000"
          ),
          DueDateDT: new Date(
            this.datepipe.transform(blockResource.pUserEnd, "yyyy-MM-dd") +
              "T23:45:00.000"
          ),
          Status: this.constants.blockResStatus.Active,
          AssignedToId: blockResource.Resource.UserNamePG.Id,
          TimeZoneNM: parseFloat(blockResource.Resource.TimeZone.Title),
          ExpectedTime: blockResource.budgetHours.toString(),
          AllocationPerDay: blockResource.allocationPerDay,
        };
        console.log(blockResource);
        this.commonService.SetNewrelic(
          "CapacityDashboard",
          "capacity-dashboard",
          "CreateblockResource",
          "POST"
        );
        const result = await this.spServices.createItem(
          this.constants.listNames.Blocking.name,
          data,
          this.constants.listNames.Blocking.type
        );
        if (!result.hasOwnProperty("hasError") && !result.hasError) {
          this.commonService.clearToastrMessage();
          this.commonService.showToastrMessage(
            this.constants.MessageType.success,
            "Resource block successfully.",
            true,
            true
          );
          setTimeout(() => {
            this.commonService.clearToastrMessage();
            this.SearchRecords();
          }, 1000);
        }
      }
    });
  }

  SearchRecords() {
    this.fetchDataloader = true;
    let Resources = this.searchCapacityForm.value.resources;
    const startDate = new Date(this.searchCapacityForm.value.rangeDates[0]);
    if (this.searchCapacityForm.value.resourcetype === "OnJob") {
      if (this.searchCapacityForm.value.rangeDates[1]) {
        Resources = Resources.filter((c) => c.GoLiveDate !== null).filter(
          (c) =>
            new Date(c.GoLiveDate) <=
            this.searchCapacityForm.value.rangeDates[1]
        );
      } else {
        Resources = Resources.filter((c) => c.GoLiveDate !== null).filter(
          (c) => new Date(c.GoLiveDate) <= startDate
        );
      }
    } else {
      const nullResources = Resources.filter((c) => c.GoLiveDate === null);
      Resources = Resources.filter((c) => c.GoLiveDate !== null).filter(
        (c) => new Date(c.GoLiveDate) > startDate
      );
      Resources.push.apply(Resources, nullResources);
    }
    const data = {
      task: { resources: Resources },
      startTime: this.searchCapacityForm.value.rangeDates[0],
      endTime: this.searchCapacityForm.value.rangeDates[1]
        ? this.searchCapacityForm.value.rangeDates[1]
        : startDate,
      type: "CapacityDashboard",
      resourceType: this.searchCapacityForm.value.resourcetype,
      taskStatus: this.searchCapacityForm.value.status,
    };

    this.userCapacity.loaderenable = true;
    this.userCapacityEnable = true;
    this.userCapacity.Onload(data);
  }

  UpdateBlocking(event) {
    if (event.type === this.constants.STATUS.DELETED) {
      this.deleteBlockingResource(event);
    } else {
      this.updateBlockingResource(event.task);
    }
    console.log("eventprint");
    console.log(event);
  }

  //  ******************************************************************************************************
  //  Delete blocking resource data
  //  ******************************************************************************************************
  async deleteBlockingResource(event) {
    this.commonService.showToastrMessage(
      this.constants.MessageType.info,
      "Deleting...",
      true,
      true
    );
    const updateItem = {
      __metadata: { type: this.constants.listNames.Blocking.type },
      Status: this.constants.STATUS.DELETED,
    };
    this.commonService.SetNewrelic(
      "CapacityDashboard",
      "capacity-dashboard",
      "deleteBlocking",
      "POST"
    );
    const updateResult = await this.spServices.updateItem(
      this.constants.listNames.Blocking.name,
      event.task.taskID,
      updateItem,
      this.constants.listNames.Blocking.type
    );
    this.commonService.clearToastrMessage();
    this.commonService.showToastrMessage(
      this.constants.MessageType.success,
      "Blocking resource deleted successfully.",
      true,
      true
    );
    setTimeout(() => {
      this.commonService.clearToastrMessage();
      this.SearchRecords();
    }, 800);
  }

  //  ******************************************************************************************************
  //  update blocking resource data
  //  ******************************************************************************************************

  updateBlockingResource(data) {
    const ref = this.dialogService.open(BlockResourceDialogComponent, {
      header: "Edit Block Resources",
      width: "60vw",
      style:{'top':'-15%'},
      data: {
        Resources: this.AlldbResources.filter((c) =>
          this.searchCapacityForm.value.resources.includes(c)
        ).map((o) => new Object({ label: o.UserNamePG.Title, value: o })),
        type: "EditBlocking",
        data,
      },
      contentStyle: {   "max-height": "80vh", "overflow-y": "auto" },
      closable: false,
    });
    ref.onClose.subscribe(async (blockResource: any) => {
      if (blockResource) {
        const updateItem = {
          __metadata: { type: this.constants.listNames.Blocking.type },
          Title: blockResource.taskFullName,
          ExpectedTime: blockResource.budgetHours.toString(),
          AllocationPerDay: blockResource.allocationPerDay,
        };
        this.commonService.SetNewrelic(
          "CapacityDashboard",
          "capacity-dashboard",
          "updateBlocking",
          "POST"
        );
        const updateResult = await this.spServices.updateItem(
          this.constants.listNames.Blocking.name,
          blockResource.id,
          updateItem,
          this.constants.listNames.Blocking.type
        );
        this.commonService.clearToastrMessage();
        this.commonService.showToastrMessage(
          this.constants.MessageType.success,
          "Blocking resource updated successfully.",
          true,
          true
        );
        setTimeout(() => {
          this.commonService.clearToastrMessage();
          this.SearchRecords();
        }, 800);
      }
    });
  }

  receiveSelectedUser(event) {
    this.capacityDisplayUsers = [];
    this.capacityDisplayUsers = event;
  }
}
