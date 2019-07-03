import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { PmconstantService } from '../../services/pmconstant.service';
import { PMObjectService } from '../../services/pmobject.service';
import { MenuItem, DialogService } from 'primeng/api';
import { DataService } from 'src/app/Services/data.service';
import { TimelineHistoryComponent } from 'src/app/timeline/timeline-history/timeline-history.component';
import { AddProjectsComponent } from '../add-projects/add-projects.component';
declare var $;
@Component({
  selector: 'app-sow',
  templateUrl: './sow.component.html',
  styleUrls: ['./sow.component.css']
})
export class SOWComponent implements OnInit {
  @Output() projectItem: EventEmitter<any> = new EventEmitter();
  displayedColumns: any[] = [
    { field: 'SOWCode', header: 'Sow Code' },
    { field: 'ShortTitle', header: 'Short Title' },
    { field: 'ClientLegalEntity', header: 'Client Legal Entity' },
    { field: 'POC', header: 'POC' },
    { field: 'CreatedBy', header: 'Created By' },
    { field: 'CreatedDate', header: 'Created Date' },
  ];
  filterColumns: any[] = [
    { field: 'SOWCode' },
    { field: 'ShortTitle' },
    { field: 'ClientLegalEntity' },
    { field: 'POC' },
    { field: 'CreatedBy' },
    { field: 'CreatedDate' }];
    projectsDisplayedColumns: any[] = [

    ];
  public allSOW = {
    sowCodeArray: [],
    shortTitleArray: [],
    clientLegalEntityArray: [],
    pocArray: [],
    createdByArray: [],
    createdDateArray: []
  };
  isAllSOWLoaderHidden = true;
  isAllSOWTableHidden = true;
  selectedSOWTask;
  popItems: MenuItem[];
  @ViewChild('timelineRef', {static: true}) timeline: TimelineHistoryComponent;
  constructor(
    public pmObject: PMObjectService,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private pmConstant: PmconstantService,
    private dataService: DataService,
    public dialogService: DialogService
  ) { }

  ngOnInit() {
    this.isAllSOWTableHidden = true;
    this.isAllSOWLoaderHidden = false;
    this.pmObject.isAddSOWVisible = false;
    this.pmObject.selectedSOWTask = '';
    // this.pmObject.tabMenuItems[0].label = 'All SOW (900)';
    // this.pmObject.tabMenuItems = [...this.pmObject.tabMenuItems];
    // this.pmObject.countObj.allSOWCount = 900;

    setTimeout(() => {
      this.getAllSOW();
    }, 500);
    this.popItems = [
      {
        label: 'View SOW', icon: 'pi pi-eye', target: '_blank',
        command: (event) => this.viewSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Edit SOW', icon: 'pi pi-pencil', target: '_blank',
        command: (event) => this.editSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Update Budget', icon: 'pi pi-pencil', target: '_blank',
        command: (event) => this.addBudgetSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'View Project', icon: 'pi pi-eye', target: '_blank',
        command: (event) => this.viewProjectSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Add Project', icon: 'pi pi-plus-circle', target: '_blank',
        command: (event) => this.addProjectSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Close SOW', icon: 'pi pi-times-circle', target: '_blank',
        command: (event) => this.closeSOW(this.pmObject.selectedSOWTask)
      },
      {
        label: 'Show History', icon: 'pi pi-download', target: '_blank',
        command: (task) =>  this.timeline.showTimeline(this.pmObject.selectedSOWTask.ID, 'ProjectMgmt', 'SOW')
      }
    ];
  }
  /**
   * This method is used to add additional Budget SOW.
   * @param task the parameter is selected sow obj.
   */
  addBudgetSOW(task) {
    this.pmObject.isAdditionalBudgetVisible = true;
  }
  /**
   * This method is used to add Edit SOW.
   * @param task the parameter is selected sow obj.
   */
  editSOW(task) {
    this.dataService.publish('call-EditSOW');
  }
  viewSOW(task) {
    this.dataService.publish('call-RightView-SOW');
  }
  closeSOW(task) {
    this.dataService.publish('call-Close-SOW');
  }
  addProjectSOW(task) {
    this.pmObject.isAddProjectVisible = true;
    this.pmObject.addProject.SOWSelect.SOWCode = task.SOWCode;
    this.pmObject.activeIndex = 1;
  }
  viewProjectSOW(task) {
    this.pmObject.isProjectVisible = true;
  }
  /**
   * This method is used to show all sow.
   */
  getAllSOW() {
    const sowCodeTempArray = [];
    const shortTitleTempArray = [];
    const clientLegalEntityTempArray = [];
    const pocTempArray = [];
    const createdByTempArray = [];
    const createDateTempArray = [];
    if (this.pmObject.allSOWItems && this.pmObject.allSOWItems.length) {
      const tempAllSOWArray = [];
      for (const task of this.pmObject.allSOWItems) {
        const sowObj = $.extend(true, {}, this.pmObject.allSOW);
        sowObj.ID = task.ID;
        sowObj.SOWCode = task.SOWCode;
        sowObj.ShortTitle = task.Title;
        sowObj.ClientLegalEntity = task.ClientLegalEntity;
        // tslint:disable-next-line:only-arrow-functions
        const poc = this.pmObject.projectContactsItems.filter((obj) => {
          return (obj.ID === task.PrimaryPOC);
        });
        sowObj.POC = poc.length > 0 ? poc[0].FullName : '';
        sowObj.CreatedBy = task.Author ? task.Author.Title : '';
        sowObj.CreatedDate = this.datePipe.transform(task.Created, 'MMM dd yyyy hh:mm:ss aa');
        sowCodeTempArray.push({ label: sowObj.SOWCode, value: sowObj.SOWCode });
        shortTitleTempArray.push({ label: sowObj.ShortTitle, value: sowObj.ShortTitle });
        clientLegalEntityTempArray.push({ label: sowObj.ClientLegalEntity, value: sowObj.ClientLegalEntity });
        pocTempArray.push({ label: sowObj.POC, value: sowObj.POC });
        createdByTempArray.push({ label: sowObj.CreatedBy, value: sowObj.CreatedBy });
        createDateTempArray.push({ label: sowObj.CreatedDate, value: sowObj.CreatedDate });
        tempAllSOWArray.push(sowObj);
      }
      this.allSOW.sowCodeArray = this.commonService.unique(sowCodeTempArray, 'value');
      this.allSOW.shortTitleArray = this.commonService.unique(shortTitleTempArray, 'value');
      this.allSOW.clientLegalEntityArray = this.commonService.unique(clientLegalEntityTempArray, 'value');
      this.allSOW.pocArray = this.commonService.unique(pocTempArray, 'value');
      this.allSOW.createdByArray = this.commonService.unique(createdByTempArray, 'value');
      this.allSOW.createdDateArray = this.commonService.unique(createDateTempArray, 'value');
      this.pmObject.allSOWArray = tempAllSOWArray;
      this.pmObject.totalRecords.AllSOW = tempAllSOWArray.length;
      this.pmObject.allSOWArrayCopy = tempAllSOWArray.splice(0, 5);
      this.isAllSOWLoaderHidden = true;
      this.isAllSOWTableHidden = false;
    }
  }
  lazyLoadTask(event) {
    const allSOWArray = this.pmObject.allSOWArray;
    this.commonService.lazyLoadTask(event, allSOWArray, this.filterColumns, this.pmConstant.filterAction.ALL_SOW);
  }
  storeRowData(rowData) {
    this.pmObject.selectedSOWTask = rowData;
  }
}
