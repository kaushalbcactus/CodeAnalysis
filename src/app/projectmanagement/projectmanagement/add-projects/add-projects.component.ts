import { Component, OnInit, ViewChild } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { PMObjectService } from '../../services/pmobject.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-add-projects',
  templateUrl: './add-projects.component.html',
  styleUrls: ['./add-projects.component.css']
})
export class AddProjectsComponent implements OnInit {
  public projStep: any = [];
  public steps: MenuItem[];
  isMangageFinanceVisible = false;
  financeManageData;
  @ViewChild('pfm', { static: false }) pfm: Dialog;
  constructor(
    public pmObject: PMObjectService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private pmConstant: PmconstantService
  ) { }

  ngOnInit() {
    this.setProjectSteps();
    this.projStep[0] = 0;
  }

  showDialogMaximized() {
    setTimeout(() => {
      this.pfm.maximize();
    }, 0);
  }

  /**
   * This method is used to set up the steps for project management.
   */
  async setProjectSteps() {
    this.steps = [{
      label: 'Select Sow',
      command: (event: any) => {
        this.pmObject.activeIndex = event.index;
      }
    },
    {
      label: 'Finance & Management',
      command: (event: any) => {
        this.pmObject.activeIndex = event.index;
      }
    },
    {
      label: 'Project Attributes',
      command: (event: any) => {
        this.pmObject.activeIndex = event.index;
      }
    },
    {
      label: 'Timeline',
      command: (event: any) => {
        this.pmObject.activeIndex = event.index;
      }
    }
    ];
  }
  /**
   * This method is used to show the manage finance component.
   * @param event The value is either true of false.
   */
  receiveData(event) {
    this.isMangageFinanceVisible = event;
  }
  getBudgetOutputData(event) {
    this.financeManageData = event;
    this.isMangageFinanceVisible = false;
  }
}
