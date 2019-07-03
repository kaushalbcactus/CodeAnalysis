import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PMObjectService } from '../../services/pmobject.service';

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
  constructor(
    public pmObject: PMObjectService
  ) { }

  ngOnInit() {
    this.setProjectSteps();
    this.projStep[0] = 0;
  }
  /**
   * This method is used to set up the steps for project management.
   */
  setProjectSteps() {
    this.steps = [{
      label: 'Select Sow',
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
    },
    {
      label: 'Finance & Management',
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
