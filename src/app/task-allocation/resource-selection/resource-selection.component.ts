import { Component, OnInit, ViewChild } from '@angular/core';
import { UsercapacityComponent } from 'src/app/shared/usercapacity/usercapacity.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { GlobalService } from 'src/app/Services/global.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IResourceSelection, IResourceSelectionFilter } from '../interface/allocation';
import { sort } from 'gantt';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { IUserCapacity } from 'src/app/shared/usercapacity/interface/usercapacity';

@Component({
  selector: 'app-resource-selection',
  templateUrl: './resource-selection.component.html',
  styleUrls: ['./resource-selection.component.css'],
})
export class ResourceSelectionComponent implements OnInit {
  @ViewChild('userCapacity', { static: false })
  userCapacity: UsercapacityComponent;
  alldbResources = [];
  Buckets = [];
  PracticeAreas = [];
  filteredResources = [];
  header = '';
  resourceType = [
    { label: 'On Job', value: 'OnJob' },
    { label: 'Trainee', value: 'Trainee' },
  ];
  isfte = [
    { label: 'No', value: 'No' },
    { label: 'Yes', value: 'Yes' },
  ];
  selectedResourceType = { label: '', value: '' };
  selectedIsFTE = { label: '', value: '' };
  selectedDateRanges = [];
  constructor(private timeline: TimelineComponent, private commonService: CommonService, private constants: ConstantsService,
    private sharedObject: GlobalService, private fb: FormBuilder, private spService: SPOperationService) { }

  searchCapacityForm = this.fb.group({
    bucket: [''],
    practicearea: [''],
    resources: ['', [Validators.required]],
    rangeDates: ['', [Validators.required]],
    resourceType: ['', [Validators.required]],
    isfte: ['', [Validators.required]]
  });

  ngOnInit() {
    if (this.sharedObject.data) {
      const data = this.sharedObject.data;
      this.header = this.sharedObject.resourceHeader;
      this.alldbResources = this.getAllResources(data);
      this.initialize(data, this.alldbResources);
    }
  }

  getPrefResources(data) {
    const prefRes = [];
    const prefResItem = data.preferredResources ? data.preferredResources : {};
    const resources = prefResItem.Resources ? prefResItem.Resources.results ? prefResItem.Resources.results : [] : [];
    resources.forEach((res) => {
      const refRes = this.sharedObject.oTaskAllocation.oResources.find(r => r.UserNamePG.ID === res.ID);
      prefRes.push(refRes);
    });
    return prefRes;
  }

  getAllResources(data) {
    const prefRes = this.getPrefResources(data);
    let taskResources = [...this.sharedObject.data.task.resources, ...prefRes];
    taskResources = this.sharedObject.data.task.resources
      .map(obj => ({ ...obj, arrPracticeArea: obj.Practice_x0020_Area.split(';#') }));
    return taskResources;
  }

  initialize(data: IResourceSelection, taskResources) {
    this.bindFilterData(taskResources);
    const filters = this.getFilterValues(data);
    const selectedResources = this.filterResources(taskResources, filters, data);
    this.updateFilters(selectedResources, filters);
    this.showCapacity(filters, data.task);
  }

  getFilterValues(popupData: IResourceSelection) {
    // tslint:disable: max-line-length
    const formControl = this.searchCapacityForm.controls;
    const pa: string[] = popupData && popupData.projectDetails ? [popupData.projectDetails.practiceArea] : [];
    const startDate: Date = popupData && popupData.startTime ? popupData.startTime : new Date();
    const endDate: Date = popupData && popupData.endTime ? popupData.endTime : new Date();
    const objFilter: IResourceSelectionFilter = {
      bucketFilter: formControl.bucket.value.length ? formControl.bucket.value : [],
      fteFilter: formControl.isfte.value ? formControl.isfte.value : 'No',
      resourceTypeFilter: formControl.resourceType.value ? formControl.resourceType.value : 'OnJob',
      paFilter: formControl.practicearea.value.length ? Array.isArray([formControl.practicearea.value]) ? formControl.practicearea.value : [formControl.practicearea.value] : pa,
      startDateFilter: formControl.rangeDates.value ? formControl.rangeDates.value[0] : startDate,
      endDateFilter: formControl.rangeDates.value ? formControl.rangeDates.value[1] : endDate,
      resourceFilter: formControl.resources.value ? formControl.resources.value : []
    };
    return objFilter;
  }

  filterResources(resources, filters: IResourceSelectionFilter, data?) {
    let filteredResources;

    if (filters.resourceFilter.length) {
      filteredResources = resources.filter(r => filters.resourceFilter.findIndex(u => u.UserNamePG.ID === r.UserNamePG.ID) > -1);
    } else {
      filteredResources = filters.bucketFilter.length ? resources.filter(r => filters.bucketFilter.includes(r.Bucket)) : [...resources];
      filteredResources = filteredResources.filter(r => r.arrPracticeArea.findIndex(p => filters.paFilter.includes(p)) > -1 && r.IsFTE === filters.fteFilter);
      if (filters.resourceTypeFilter === 'OnJob') {
        const dateFilter = filters.endDateFilter ? filters.endDateFilter : filters.startDateFilter;
        filteredResources = filteredResources.filter((c) => c.GoLiveDate && new Date(c.GoLiveDate) <= dateFilter);
      } else {
        filteredResources = filteredResources.filter((c) => (!c.GoLiveDate) || (c.GoLiveDate && new Date(c.GoLiveDate) > filters.startDateFilter));
      }
    }
    if (data) {
      let oldResIds = this.findOldResources(data);
      let oldResources;
      if (oldResIds.length) {
        let selectedIds = filteredResources.map(e => e.UserNamePG.ID);
        oldResIds = oldResIds.filter(e => selectedIds.indexOf(e) === -1);
        oldResources = resources.filter(r => oldResIds.indexOf(r.UserNamePG.ID) > -1);
        if (oldResources.length) {
          filteredResources = [...oldResources, ...filteredResources];
        }
      }
      if (data.task.AssignedTo && data.task.AssignedTo.ID) {
        let allocatedRes = filteredResources.find(e => e.UserNamePG.ID === data.task.AssignedTo.ID);
        if (!allocatedRes) {
          allocatedRes = resources.find(e => e.UserNamePG.ID === data.task.AssignedTo.ID);
        }
        if (allocatedRes) {
          filteredResources = [...[allocatedRes], ...filteredResources];
        }
      }
    }

    return [...new Set([...filteredResources])];
  }


  findOldResources(data) {
    let oldResources;
    let oldResIds = []
    switch (data.task.itemType) {
      case 'Write':
      case 'Inco':
      case 'Finalize':
        oldResources = data.projectDetails.writer.results ? data.projectDetails.writer.results : [];
        break;
      case 'Review-Write':
        oldResources = data.projectDetails.reviewer.results ? data.projectDetails.reviewer.results : [];
        break;
      default:
        oldResources = data.projectDetails.pubSupportMembers.results ? data.projectDetails.pubSupportMembers.results : [];
        break;
    }
    if (oldResources.length) {
      oldResIds = oldResources.map(e => e.ID);
    }
    return oldResIds;
  }
  bindFilterData(filteredResources) {
    const buckets = filteredResources.filter(Boolean).map(r => new Object({ label: r.Bucket, value: r.Bucket }));
    this.Buckets = this.commonService.sortData(this.commonService.unique(buckets, 'label'));
    const pa = [].concat(...[...new Set(filteredResources.filter(Boolean).map(r => r.arrPracticeArea))]);
    const practiceAreas = pa.map(r => new Object({ label: r, value: r }));
    this.PracticeAreas = this.commonService.sortData(this.commonService.unique(practiceAreas, 'label'));
    this.filteredResources = filteredResources.map(
      (o) => new Object({ label: o.UserNamePG.Title, value: o })
    );
  }

  updateFilters(resources, filters: IResourceSelectionFilter) {
    filters.resourceFilter = resources;
    this.searchCapacityForm.patchValue({
      resources,
      bucket: filters.bucketFilter,
      practicearea: filters.paFilter,
      isfte: filters.fteFilter,
      resourceType: filters.resourceTypeFilter,
      rangeDates: [filters.startDateFilter, filters.endDateFilter]
    });
  }

  sortResources(resources, prefRes, popupData, capacity) {
    let sortedRes = [];
    const resourcesCapacity = [...capacity.arrUserDetails];
    resourcesCapacity.map(res => {
      const resource = resources.find(u => u.UserNamePG.ID === res.uid);
      res.userType = resource ? resource.userType : 'Other';
    });
    const previousResId = popupData.task.AssignedTo ? popupData.task.AssignedTo.ID : 0;
    const oldResIds = this.findOldResources(popupData);
    const sortedPreAllocatedRes = this.sortByAvailibility(resourcesCapacity.filter(r => oldResIds.indexOf(r.uid) > -1));
    oldResIds.push(previousResId);
    const otherRes = resourcesCapacity.filter(r => oldResIds.indexOf(r.uid) === -1);
    const assignedUser = previousResId > 0 ? resourcesCapacity.filter(r => r.uid === previousResId) : [];
    const preferredRes = this.sortByAvailibility(resourcesCapacity.filter(r => prefRes.filter(pr => pr.UserNamePG.ID === r.uid).length));
    const others = this.sortByAvailibility([...otherRes]);
    if (previousResId > 0) {
      sortedRes = [...assignedUser, ...sortedPreAllocatedRes, ...others, ...preferredRes];
    } else {
      const mergedPrefOthers = this.sortByAvailibility([...preferredRes, ...others]);
      sortedRes = [...sortedPreAllocatedRes, ...mergedPrefOthers];
    }
    // const remainingResources = resourcesCapacity.filter(r => !sortedRes.filter(sr => sr.uid !== r.uid).length);
    const uniqueSorted = [...new Set([...sortedRes])];
    return uniqueSorted;
  }

  sortByAvailibility(arrResources) {
    const resources = arrResources.sort((a, b) => (
      this.commonService.convertFromHrsMins('' + a.totalUnAllocated) > this.commonService.convertFromHrsMins('' + b.totalUnAllocated))
      ? -1 : 1);
    return resources;
  }

  showCapacity(filters: IResourceSelectionFilter, task) {
    setTimeout(async () => {
      this.userCapacity.loaderenable = true;
      const popupData = this.sharedObject.data;
      const prefRes = this.getPrefResources(popupData);
      const capacity: any = await this.userCapacity.afterResourceChange(
        task,
        filters.startDateFilter,
        filters.endDateFilter,
        filters.resourceFilter, // resources,
        [],
        false
      );
      capacity.arrUserDetails = this.sortResources(filters.resourceFilter, prefRes, popupData, capacity);
      this.userCapacity.showCapacity(capacity);
    }, 300);
  }

  onChange(filter, event) {
    if (event.value.length) {
      const taskResources = [...this.alldbResources];
      const objResourceSelection = { ...this.sharedObject.data };
      if (filter !== 'resourceFilter') {
        this.searchCapacityForm.controls.resources.reset();
      }
      const filters = this.getFilterValues(objResourceSelection);
      this.bindFilterData(taskResources);
      const resources = this.filterResources(taskResources, filters);
      this.updateFilters(resources, filters);
    }
  }

  async onSubmit() {
    const isValid: boolean = this.validate();
    if (isValid) {
      const task = this.sharedObject.data.task;
      const objResourceSelection = { ...this.sharedObject.data };
      const filters: IResourceSelectionFilter = this.getFilterValues(objResourceSelection);
      this.showCapacity(filters, task);
    }
  }

  validate(): boolean {
    const resources = this.searchCapacityForm.value.resources;
    const daterange = this.searchCapacityForm.value.rangeDates;
    const msg = !daterange ? 'Please select dates' : !resources ? 'Please select Resource.' : '';
    if (msg) {
      this.commonService.showToastrMessage(this.constants.MessageType.warn, msg, false);
      return false;
    }
    return true;
  }

  async confirmChangeResource(event: IUserCapacity) {
    const assignedTo = this.sharedObject.data.task.AssignedTo;
    if (assignedTo.ID === event.uid) {
      this.commonService.showToastrMessage(this.constants.MessageType.error, 'Please select different resource name to change the resource', false);
    } else {
      await this.commonService.confirmMessageDialog('Change Resource of Task', 'Are you sure you want to change the Resource of Task ?', null, ['Yes', 'No'], false).then(async Confirmation => {
        if (Confirmation === 'Yes') {
          this.timeline.displayBody = false;
          this.timeline.changeResource(event.uid);
          await this.addResourcePreference(event);
        }
      });
    }
  }

  async addResourcePreference(assignedTo): Promise<void> {
    let preferredResource = this.sharedObject.data.preferredResources;
    const projectDetails = this.sharedObject.oTaskAllocation.oProjectDetails;
    const prefResItem = preferredResource ? preferredResource : {};
    const resources = prefResItem.Resources ? prefResItem.Resources.results ? prefResItem.Resources.results : [] : [];
    const isEntryExists: boolean = resources.length ? true : false;
    const isResourceExists: boolean = isEntryExists ? resources.findIndex(res => res.ID === assignedTo.uid) > -1 ?
      true : false : false;
    if (!isResourceExists) {
      await this.commonService.confirmMessageDialog('Confirm', 'Do you want to add \'' + assignedTo.userName + '\' as preferred resource for practice area \'' + projectDetails.practiceArea + '\' ?', null, ['Yes', 'No'], false).then(async Confirmation => {
        if (Confirmation === 'Yes') {
          if (!isEntryExists) {
            const newPrefResItem = await this.createPrefResource(assignedTo.uid, projectDetails);
            preferredResource = this.formatPrefResData(newPrefResItem, assignedTo.uid);
          } else {
            const prefRes = resources.length ? resources.map(r => r.ID) : [];
            prefRes.push(assignedTo.uid);
            await this.addPrefResources(prefRes, prefResItem.ID);
            prefResItem.Resources.results.push({ ID: assignedTo.uid, Title: assignedTo.userName });
          }
        }
      });
    }
  }

  formatPrefResData(data, resource) {
    const obj = {
      ID: data.ID,
      Resources: {
        results: [resource]
      }
    };
    return [obj];
  }

  async createPrefResource(assignedTo, projectDetails) {
    const data = {
      Practice_x0020_Area: projectDetails.practiceArea,
      ActionById: this.sharedObject.currentUser.userId,
      ResourcesId: { results: [assignedTo] },
      IsActiveCH: 'Yes'
    };
    this.commonService.SetNewrelic('Allocation', 'timeline', 'Add Resource Preference - Creating Item');
    let item = await this.spService.createItem(this.constants.listNames.PreferredResources.name, data,
      this.constants.listNames.PreferredResources.type);
    item = item ? item : {};
    return item;
  }

  async addPrefResources(resources, itemID: number) {
    const updateItem = {
      ResourcesId: { results: resources }
    };
    this.commonService.SetNewrelic('Allocation', 'timeline', 'Add Resource Preference - Update Item');
    await this.spService.updateItem(this.constants.listNames.PreferredResources.name, itemID,
      updateItem, this.constants.listNames.PreferredResources.type);
  }
}
