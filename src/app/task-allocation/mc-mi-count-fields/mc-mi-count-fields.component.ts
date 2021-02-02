import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-mc-mi-count-fields',
  templateUrl: './mc-mi-count-fields.component.html',
  styleUrls: ['./mc-mi-count-fields.component.css']
})
export class MCMICountFieldsComponent implements OnInit {
  countFieldsForm: FormGroup;
  loaderEnable: boolean = true;
  projectDetails: any;
  CountError: boolean = false;
  errorType: string = '';
  constructor(private frmbuilder: FormBuilder,
  private taskAllocationService: TaskAllocationConstantsService,
  private taskAllocateCommonService: TaskAllocationCommonService,
  public sharedObject: GlobalService,
  private spService: SPOperationService,
  private constants: ConstantsService,
  private commonService: CommonService) { }

  public sharedTaskAllocateObj = this.sharedObject.oTaskAllocation;

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loaderEnable = true;
    this.projectDetails = this.sharedTaskAllocateObj.oProjectDetails;
    this.countFieldsForm = this.frmbuilder.group({
      SlideCount: [0],
      ReferenceCount: [0],
      PageCount: [0],
      AnnotationBinder: [""],
    });
    const projectFilter = Object.assign({}, this.taskAllocationService.taskallocationComponent.PROJECT_INFORMATION_BY_PROJECTCODE);
    projectFilter.filter = projectFilter.filter.replace(/{{ProjectCode}}/gi, this.sharedTaskAllocateObj.oProjectDetails.projectCode);
    const project = await this.spService.readItems(this.constants.listNames.ProjectInformation.name, projectFilter);
    // console.log(project);
     this.countFieldsForm.patchValue({
      SlideCount: project[0].SlideCount,
      ReferenceCount: project[0].ReferenceCount,
      PageCount: project[0].PageCount,
      AnnotationBinder: project[0].AnnotationBinder === 'Yes' ? true : false,
    });
    this.loaderEnable = false;
  }

  async saveCounts() {
    if (
      this.countFieldsForm.value.ReferenceCount === null ||
      this.countFieldsForm.value.ReferenceCount < 0
    ) {
      this.CountError = true;
      this.errorType = "Reference";
    } else if (
      this.countFieldsForm.value.SlideCount === null ||
      this.countFieldsForm.value.SlideCount < 0
    ) {
      this.CountError = true;
      this.errorType = "Slide";
    } else if (
      this.countFieldsForm.value.PageCount === null ||
      this.countFieldsForm.value.PageCount < 0
    ) {
      this.CountError = true;
      this.errorType = "Page";
    } else {
      this.loaderEnable = true;
      this.CountError = false;
      this.errorType = "";

      const projectData: any = {
        __metadata: { type: this.constants.listNames.ProjectInformation.type },
        SlideCount: this.countFieldsForm.get('SlideCount').value,
        PageCount: this.countFieldsForm.get('PageCount').value,
        ReferenceCount: this.countFieldsForm.get('ReferenceCount').value,
        AnnotationBinder: this.countFieldsForm.get('AnnotationBinder').value ? 'Yes' : 'No'
      };
  
      // console.log(projectData);
  
      await this.spService.updateItem(
        this.constants.listNames.ProjectInformation.name,
        this.sharedTaskAllocateObj.oProjectDetails.projectID,
        projectData,
        this.constants.listNames.ProjectInformation.type
      );
  
      this.loaderEnable = false;
      this.commonService.showToastrMessage(
        this.constants.MessageType.success,
        "Project Updated Successfully for the projectcode - " +
        this.sharedTaskAllocateObj.oProjectDetails.projectCode,
        false
      );
  
    }
  }

}
