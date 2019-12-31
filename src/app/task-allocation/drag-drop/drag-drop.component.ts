import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, MessageService, ConfirmationService } from 'primeng/api';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import * as shape from 'd3-shape';
import { TaskAllocationCommonService } from '../services/task-allocation-common.service';
import { CommonService } from 'src/app/Services/common.service';
declare var $: any;
@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],

})
// tslint:disable
export class DragDropComponent implements OnInit {
  batchContents = new Array();
  response: any[];
  step: number = 0;
  customCollapsedHeight: string = '30px';
  milestonesGraph = { nodes: [], links: [], nodeOrder: [] };
  milestoneIndex: number = -1;
  submilestoneIndex: number = -1;
  selectedMilestone;
  selectedSubMilestone;
  curve = shape.curveLinear;
  public Allmilestones: string[] = [];
  linkremove: boolean = false;
  subpreviousSource;
  previousSource;
  public task: Task;
  previouseventdd;
  previoussubeventdd;
  previoustaskeventdd;
  milestoneUp = null;
  milestoneDown = null;
  taskUp = null;
  taskDown = null;
  mileStonePreviousColor;
  subMilestoneWidth: number = 900;
  subMilestoneHeight: number = 150;
  subMilestoneMaxHeight: number = 350;
  taskWidth: number = 1200;
  taskHeight: number = 150;
  taskMaxHeight: number = 100;
  width: number = 700;
  height: number = 80;
  minWidth: number = 1200;
  minHeight: number = 150;
  tooltipDisabled: boolean = false;
  taskArray = [];
  data: any;
  tempSubmileArray = [];
  mainloaderenable: boolean = true;
  milestones: null;
  resizeGraph: string = '';
  initialLoad: boolean = true;
  grapLoading: boolean = false;
  subMilestoneHoritontal: boolean = true;
  tasksHoritontal: boolean = true;
  showSvg = false;
  alldbMilestones: any;
  AlldbRecords: any;
  enableZoom: boolean = false;
  enablePaan: boolean = false;
  recentEventNode = undefined;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  // tslint:enable
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public sharedObject: GlobalService,
    private spServices: SPOperationService,
    private constants: ConstantsService,
    private taskAllocationService: TaskAllocationConstantsService,
    private messageService: MessageService,
    private taskCommonService: TaskAllocationCommonService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.initialLoad = true;
    this.setInitialWidth();
    this.GetAllTasksMilestones();

    this.data = this.config.data.milestones;

    this.alldbMilestones = this.config.data.dbmilestones ? this.config.data.dbmilestones.map(c => c.milestone.Title) : [];
    this.AlldbRecords = this.config.data.dbmilestones ? this.config.data.dbmilestones : [];
    let links = [];
    if (this.data.length > 0) {
      this.data.forEach(element => {
        const temp = {
          data: element.data.pName.includes('(Current)') ? element.data.pName.replace('(Current)', '').trim() : element.data.pName,
          id: element.data.pID,
          position: element.data.position,
          preTask: element.data.previousTask,
          nextTask: element.data.nextTask,
          taskType: element.data.pName.toLowerCase().indexOf('adhoc') > -1 ? 'Adhoc' :
            element.data.pName.toLowerCase().indexOf('tb') > -1 ? 'TB' : element.data.itemType,
          status: element.data.status,
        };
        this.submilestoneIndex = 0;
        this.tempSubmileArray = [];
        if (element.data.type === 'milestone') {
          this.onDrop(temp, element.data.type, true);
        } else {
          this.onPageLoad(temp);
          links = this.loadLinks(element.data, links).splice(0);
          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...links];
        }
        if (element.children !== undefined) {
          if (element.children.length > 0) {
            this.milestoneIndex++;
            // tslint:disable-next-line: no-shadowed-variable
            element.children.forEach(element => {
              const temp1 = {
                data: element.data.pName,
                id: element.data.pID,
                position: element.data.position,
                preTask: element.data.previousTask,
                nextTask: element.data.nextTask,
                taskType: element.data.pName.toLowerCase().indexOf('adhoc') > -1 ? 'Adhoc' :
                  element.data.pName.toLowerCase().indexOf('tb') > -1 ? 'TB' : element.data.itemType,
                IsCentrallyAllocated: element.data.IsCentrallyAllocated,
                CentralAllocationDone: element.data.CentralAllocationDone,
                ActiveCA: element.data.ActiveCA,
                status: element.data.status,
              };
              element.children = element.children ? element.children.filter(t => !t.data.parentSlot) : [];
              if (element.children.length) {
                if (temp1.position !== undefined) {
                  this.tempSubmileArray.push(temp1);
                }
                // tslint:disable-next-line: no-shadowed-variable
                element.children.forEach(obj => {
                  if (temp1.status === undefined || temp1.status !== 'Not Confirmed' || temp1.status !== 'Not Started') {
                    temp1.status = obj.data.status;
                  }
                });
                this.onDrop(temp1, element.data.type, true);
                this.submilestoneIndex++;
                links = [];
                // tslint:disable-next-line: no-shadowed-variable
                element.children.forEach(element => {
                  const temp2 = {
                    data: element.data.pName,
                    id: element.data.pID,
                    position: element.data.position,
                    preTask: element.data.previousTask,
                    nextTask: element.data.nextTask,
                    taskType: element.data.pName.toLowerCase().indexOf('adhoc') > -1 ? 'Adhoc' :
                      element.data.pName.toLowerCase().indexOf('tb') > -1 ? 'TB' : element.data.itemType,
                    IsCentrallyAllocated: element.data.IsCentrallyAllocated,
                    CentralAllocationDone: element.data.CentralAllocationDone,
                    ActiveCA: element.data.ActiveCA,
                    status: element.data.status,
                  };
                  this.onPageLoad(temp2);
                });
                // tslint:disable-next-line: no-shadowed-variable
                element.children.forEach(element => {
                  links = this.loadLinks(element.data, links).splice(0);
                });
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...links];
              } else {
                this.submilestoneIndex = 0;
                this.onPageLoad(temp1);
              }

            });
            if (this.submilestoneIndex === 0) {
              links = [];
              // tslint:disable-next-line: no-shadowed-variable
              element.children.forEach(element => {
                links = this.loadLinks(element.data, links).splice(0);
              });
              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...links];
            }
          }
        }
      });
      this.milestoneIndex = -1;
      this.submilestoneIndex = -1;
      this.previoustaskeventdd = null;
      this.initialLoad = false;
      this.resizeGraph = 'milestone';
      this.GraphResize();
    } else {
      this.initialLoad = false;
    }
  }

  setInitialWidth() {
    const areaWidth = document.getElementsByClassName('milestonesDropArea')[0].clientWidth;
    this.width = areaWidth;
    this.subMilestoneWidth = areaWidth;
    this.taskWidth = areaWidth;
    this.minWidth = areaWidth;
  }

  setStep(index: number) {
    this.step = index;
    switch (this.step) {
      case 0:
        this.resizeGraph = 'milestone';
        this.GraphResize();
        break;
      case 1:
        this.resizeGraph = 'submilestone';
        this.GraphResize();
        break;
      case 2:
        this.resizeGraph = 'task';
        this.GraphResize();
        break;
    }
  }


  // **************************************************************************************************************************************
  // Save Graph
  // **************************************************************************************************************************************

  SaveGraph() {
    let errorM = 0;
    let ScPresent = false;
    let scPrevTaskPresent = false;
    if (this.milestonesGraph.nodes.length > 0) {
      for (const milestone of this.milestonesGraph.nodes) {
        if (milestone.status !== 'Completed') {
          milestone.submilestone.nodes.forEach(async submilestone => {
            if (submilestone.task.nodes.length === 0) {
              if (errorM <= 0) {
                errorM++;
                if (this.milestoneIndex === -1) {
                  this.messageService.add({
                    key: 'custom', severity: 'warn',
                    summary: 'Warning Message', detail: 'Please click on Milestone to add Sub Milestone/Tasks.'
                  });
                  return false;
                } else if (this.submilestoneIndex === -1) {
                  this.messageService.add({
                    key: 'custom', severity: 'warn',
                    summary: 'Warning Message', detail: 'Please click on ' + submilestone.label + ' Sub Milestone to add Tasks.'
                  });
                  return false;
                } else {
                  this.messageService.add({
                    key: 'custom', severity: 'warn',
                    summary: 'Warning Message', detail: 'Please add Tasks in ' + submilestone.label + ' of ' + milestone.label + '.'
                  });
                  return false;
                }
              }
            } else {
              ScPresent = ScPresent === false ? (submilestone.task.nodes.find(c => c.taskType ===
                'Send to client') !== undefined ? true : false) : true;
              const allSCTasks = submilestone.task.nodes.filter(c => c.taskType === 'Send to client');
              allSCTasks.forEach(task => {
                scPrevTaskPresent = submilestone.task.links.find(l => l.target === task.id) ? true : false;
              });
              if (submilestone.label === 'Default' && submilestone.task.nodes.find(c => c.taskType === 'Client Review') === undefined) {
                errorM++;
                this.messageService.add({
                  key: 'custom', severity: 'warn', summary: 'Warning Message',
                  detail: 'Please add Client Review Task in ' + submilestone.label + ' of ' + milestone.label
                });
                return false;
              }

              if (milestone.submilestone.nodes.length > 1 && submilestone.label === 'Default' &&
                submilestone.task.nodes.filter(c => c.taskType !== 'Adhoc' && c.taskType !== 'TB').length > 1) {
                errorM++;
                this.messageService.add({
                  key: 'custom', severity: 'warn', summary: 'Warning Message',
                  detail: 'Please remove Task in ' + submilestone.label + ' of ' + milestone.label + ' only Client Review is Required.'
                });
                return false;
              }
              const tempnodes = submilestone.task.nodes.map(c => c.id).filter(c =>
                !submilestone.task.links.map(d => d.source).includes(c) &&
                !submilestone.task.links.map(d => d.target).includes(c)).
                filter(c => !submilestone.task.nodes.filter(d => (d.taskType === 'Client Review')
                  || (c.taskType !== 'Adhoc' && c.taskType !== 'TB')).map(d => d.id).includes(c));

              if (tempnodes.length > 0 && errorM === 0) {
                const missingLinkTasks = submilestone.task.nodes.filter(c => tempnodes.includes(c.id))
                  .map(c => submilestone.label + ' - ' + c.label);
                errorM++;
                this.messageService.add({
                  key: 'custom', severity: 'warn',
                  summary: 'Warning Message', detail: 'Paths missing for following tasks ' + missingLinkTasks + ' of ' + milestone.label
                });
                return false;
              }
            }

            let circularPresent = false;
            if (submilestone.task.links.length > 0) {
              let individualTask = false;
              submilestone.task.nodes.forEach(node => {
                if (!individualTask && node.taskType !== 'Client Review' && node.taskType !== 'Send to client' && node.taskType !== 'Adhoc' && node.taskType !== 'TB') {
                  const linkPresent = submilestone.task.links.filter(st => st.source === node.id || st.target === node.id);
                  individualTask = linkPresent.length ? false : true;
                }
              });


              const allUniqueLinkPath = [];
              for (const link of submilestone.task.links) {
                const TargetLinks = submilestone.task.links.filter(c => c.target === link.source);
                if (TargetLinks.length === 0) {
                  const curPath = submilestone.task.nodes.find(node => node.id === link.source).taskType;
                  this.getNextTargetSC(link.source, link.target, submilestone, curPath, allUniqueLinkPath);
                }

                if (!circularPresent) {
                  const currentPath = link.source;
                  const target = link.target;
                  circularPresent = this.getNextTarget(link.source, target, submilestone, currentPath, circularPresent);
                }
              }
              if (circularPresent) {
                errorM++;
                this.messageService.add({
                  key: 'custom', severity: 'warn', summary: 'Warning Message',
                  detail: 'Circular links present. Please delete the circular links in ' + submilestone.label + '-' + milestone.label
                });
                return false;
              }
              const missingSCInPath = allUniqueLinkPath.filter(t => t !== 'Send to client');
              if ((missingSCInPath.length > 0 || individualTask) && milestone.allsubmilestones.length <= 1 && errorM === 0) {
                errorM++;
                this.messageService.add({
                  key: 'custom', severity: 'warn', summary: 'Warning Message',
                  detail: 'Send to client task missing for parallel task in ' + submilestone.label + '-' + milestone.label
                });
                return false;
              }
            }
          });
          if (ScPresent === false && milestone.allsubmilestones.length <= 1 && errorM === 0) {
            errorM++;
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'Please add Send to Client in ' + milestone.label
            });
            return false;
          }
          if (scPrevTaskPresent === false && errorM === 0) {
            errorM++;
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'Send to Client task must have incoming task link in ' + milestone.label
            });
            return false;
          }
        }

        ScPresent = false;
      }

      if (errorM <= 0) {
        this.NodePosition();
        this.milestonesGraph.nodes.forEach(milestone => {

          if (milestone.submilestone.nodes.length > 1) {
            const DefaultObj = milestone.submilestone.nodes.find(c => c.label === 'Default');
            const index = milestone.submilestone.nodes.indexOf(DefaultObj);
            if (index > -1) {
              milestone.submilestone.nodes.splice(index, 1);
              milestone.submilestone.nodes.push(DefaultObj);
            }
          }

          milestone.submilestone.nodes.forEach(submilestone => {
            submilestone.task.nodes.sort((a, b) => {
              return parseInt(a.left, 10) - parseInt(b.left, 10);
            });
          });
        });

        this.ref.close(this.milestonesGraph);

        // this.messageService.add({key: 'custom', severity:'Warn', summary: 'Success Message', detail:'Updating...' });
      }
    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please add Milestone' });
      return false;
    }
  }

  getNextTarget(source, target, submilestone, currentPath, circularPresent) {

    currentPath = currentPath + ',' + target;

    const TargetLinks = submilestone.task.links.filter(c => c.source === target).map(c => c.target);

    const allPaths = currentPath.split(',');
    let newTargets = allPaths.slice(0);
    newTargets = newTargets.filter((el, i, a) => i === a.indexOf(el));
    if (newTargets.length !== allPaths.length) {
      circularPresent = true;
    }
    TargetLinks.forEach(newTarget => {
      if (circularPresent === false) {
        circularPresent = this.getNextTarget(source, newTarget, submilestone, currentPath, circularPresent);
      }
    });

    return circularPresent;
  }

  getNextTargetSC(source, target, submilestone, currentPath, allPaths) {
    const currentTaskStatus = submilestone.task.nodes.find(node => node.id === target).status;
    currentPath = submilestone.task.nodes.find(node => node.id === target).taskType;
    const TargetLinks = submilestone.task.links.filter(c => c.source === target).map(c => c.target);
    if (TargetLinks.length) {
      TargetLinks.forEach(newTarget => {
        this.getNextTargetSC(source, newTarget, submilestone, currentPath, allPaths);
      });
    } else {
      if (currentTaskStatus !== 'Completed') {
        allPaths.push(currentPath);
      }
    }

  }


  // **************************************************************************************************************************************
  // Discard  Graph changes
  // **************************************************************************************************************************************

  cancelGraph() {

    const result = confirm('Are you sure that you want to discard all changes?');
    if (result) {
      this.ref.close();
    }

  }


  // *************************************************************************************************************************************
  // To Add milestone / submilestone To milestonesGraph
  // *************************************************************************************************************************************
  // tslint:disable
  onDrop(event, miletype, Restructureenable) {


    this.resizeGraph = miletype;
    let prvnode = [];

    var count = 0;

    if (miletype === 'milestone') {
      count = this.alldbMilestones.filter(function (node) { return new RegExp(event.data, 'g').test(node) }).length > 0 ? this.alldbMilestones.filter(function (node) { return new RegExp(event.data, 'g').test(node) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c)).length > 0 ? Math.max.apply(null, this.alldbMilestones.filter(function (node) { return new RegExp(event.data, 'g').test(node) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c))) : 1 : 0;
    }
    else {
      count = this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).length > 0 ? this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c)).length > 0 ? Math.max.apply(null, this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c))) : 1 : 0;
    }
    let nodeLabel = count >= 1 ? (event.data === 'Draft' ? event.data + ' ' + (count + 1) : event.data + ' ' + (count + 1)) : event.data === 'Draft' ? event.data + ' ' + (count + 1) : event.data;

    if (Restructureenable) {
      nodeLabel = count > 1 ? (event.data === 'Draft' ? event.data + ' ' + (count - 1) : event.data + ' ' + (count - 1)) : count === 1 ? event.data === 'Draft' ? event.data + ' ' + (count) : event.data : event.data;
    }

    this.alldbMilestones.push(nodeLabel);

    const milestoneTasks = this.AlldbRecords.find(c => c.milestone.Title === nodeLabel) ? this.AlldbRecords.find(c => c.milestone.Title === nodeLabel).tasks : []
    let milestoneTaskProcess = [];
    milestoneTasks.forEach(task => {
      const TaskType = task.replace(/[0-9]/g, '').replace(/\s+$/, '');
      if (milestoneTaskProcess.length > 0 && milestoneTaskProcess.find(c => c.type === TaskType)) {
        milestoneTaskProcess.find(c => c.type === TaskType).tasks.push(task);
      }
      else {
        milestoneTaskProcess.push({ type: TaskType, tasks: [task] });
      }
    });

    if (miletype === 'milestone' ? this.milestonesGraph.nodes.length > 0 : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 0) {
      var previousnode = null;
      if (miletype === 'milestone' ? this.milestonesGraph.nodes.length > 0 : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 0) {
        previousnode = miletype === 'milestone' ? this.milestonesGraph.nodes.map(c => c.id).filter(c => !this.milestonesGraph.links.map(c => c.source).includes(c)) : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.map(c => c.id).filter(c => !this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.map(c => c.source).includes(c));
      }


      var node = {
        id: previousnode === null ? '1' : (parseInt(previousnode[previousnode.length - 1]) + 1).toString(),
        dbId: event.id !== undefined ? event.id : 0,
        label: nodeLabel,
        position: previousnode === null ? 'x1' : 'x' + (parseInt(previousnode[previousnode.length - 1]) + 1),
        color: '#e2e2e2',
        type: miletype,
        status: event.status !== undefined ? event.status : 'Not Saved',

        task: miletype === 'milestone' ? null : { nodes: [], links: [], taskWidth: 1200 },
        submilestone: miletype === 'milestone' ? {
          nodes: [{
            id: '1',
            label: 'Default',
            position: 'x1',
            color: '#e2e2e2',
            type: 'submilestone',
            task: { nodes: [], links: [], taskWidth: 1200 }
          }], links: [], nodeOrder: ['1'], taskWidth: 1200
        } : null,
        allsubmilestones: miletype === 'milestone' ? ['Default'] : null,
        allTasks: milestoneTaskProcess
      };
      const tempprvnode = this.tempSubmileArray.filter(function (node) {
        return node.data === event.data;
      });

      if (tempprvnode.length > 0) {
        prvnode = this.tempSubmileArray.filter(function (node) {
          return parseInt(node.position) === parseInt(tempprvnode[0].position) - 1;
        });
      }

      if (event.position) {
        var link = {
          source: miletype === 'milestone' ? (previousnode !== null ? (parseInt(previousnode[0])).toString() : '1') : prvnode.length > 0 && this.tempSubmileArray.length > 1 ? this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === prvnode[0].data).id : this.subpreviousSource !== undefined ? this.subpreviousSource : (previousnode !== null && event.position !== '1' ? (parseInt(previousnode[previousnode.length - 1])).toString() : '0'),
          target: previousnode !== null && event.position.toString() !== '1' ? (parseInt(previousnode[previousnode.length - 1]) + 1).toString() : '0'
        };
      }
      else {
        var link = {
          source: miletype === 'milestone' ? (previousnode !== null ? (parseInt(previousnode[0])).toString() : '1') : prvnode.length > 0 && this.tempSubmileArray.length > 1 ? this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === prvnode[0].data).id : this.subpreviousSource !== undefined ? this.subpreviousSource : (previousnode !== null && event.position !== '1' ? (parseInt(previousnode[previousnode.length - 1])).toString() : '0'),
          target: previousnode !== null && event.position !== '1' ? (parseInt(previousnode[previousnode.length - 1]) + 1).toString() : '0'
        };
      }
    }
    else {

      node = {
        id: '1',
        dbId: event.id !== undefined ? event.id : 0,
        label: nodeLabel,
        position: 'x1',
        color: '#e2e2e2',
        type: miletype,
        status: event.status !== undefined ? event.status : 'Not Saved',
        task: miletype === 'milestone' ? null : { nodes: [], links: [], taskWidth: 1200 },
        submilestone: miletype === 'milestone' ? {
          nodes: [{
            id: '1',
            label: 'Default',
            position: 'x1',
            color: '#e2e2e2',
            type: 'submilestone',
            task: { nodes: [], links: [], taskWidth: 1200 }
          }], links: [], nodeOrder: ['1'], taskWidth: 1200
        } : null,
        allsubmilestones: miletype === 'milestone' ? ['Default'] : null,
        allTasks: milestoneTaskProcess
      };

      link = {
        source: '1',
        target: '2',
      };
    }

    if (miletype === 'milestone') {
      this.milestonesGraph.nodes.push(node);
      this.milestonesGraph.nodeOrder.push(node.id);

      if (this.milestonesGraph.nodes.length > 1) {
        if (link.target !== link.source) {
          this.milestonesGraph.links.push(link);
        }

      }

      if (!Restructureenable) {
        if (!event.id) {
          const e = {
            data: 'Client Review',
            type: 'Client Review'
          }
          this.DropCRDefault(e, this.milestonesGraph.nodes.length - 1, 0);
        }


      }

      this.previoussubeventdd = node.submilestone.nodes[0];
      this.previouseventdd = node;
      this.recentEventNode = this.previouseventdd.id;
      this.milestonesGraph.nodes = [...this.milestonesGraph.nodes];
      this.milestonesGraph.links = [...this.milestonesGraph.links];

      this.Allmilestones.push(event.data);

      if (!this.initialLoad)
        this.GraphResize();
    }
    else {

      const submilestone = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === 'Default');

      if (submilestone.task.nodes.length > 1 || submilestone.task.nodes.filter(c => c.taskType !== 'Client Review').length > 0) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Please remove Task in Default, only Client Review is Required.' });
      }
      else {

        if (miletype !== 'milestone') {
          this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.push(node.label);
        }

        this.subpreviousSource = miletype === 'submilestone' ? undefined : this.subpreviousSource;
        var DefaultObj = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === 'Default');

        const id = DefaultObj.id;

        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === 'Default').id = (parseInt(node.id) + 1).toString();

        if (this.linkremove) {
          var DefaultList = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(c => c.source === id || c.target === id);
          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(value => !DefaultList.includes(value));
          if (DefaultList.length > 0) {
            this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(value => !DefaultList.includes(value));

            for (var i = 0; i < DefaultList.length; i++) {
              DefaultList[i].source === id ? DefaultList[i].source = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === 'Default').id : DefaultList[i].source;

              DefaultList[i].target === id ? DefaultList[i].target = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === 'Default').id : DefaultList[i].target;
            }

            this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push.apply(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links, DefaultList);
          }
        }

        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.push(node);
        if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 1) {

          if (parseInt(link.source) !== (parseInt(node.id) - 1) || parseInt(link.target) !== parseInt(node.id) - 1) {
            if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.filter(c => c.id === link.source).length > 0 && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.filter(c => c.id === link.target).length > 0) {
              if (link.source !== link.target) {
                if (link.source !== '0' && link.target !== '0') {
                  if (link.source !== link.target) {
                    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push(link);
                  }
                }
              }
            }
          }

          if (prvnode.length > 1 && miletype !== 'milestone') {
            for (var i = 1; i < prvnode.length; i++) {
              var link = {
                source: miletype === 'milestone' ? (previousnode !== null ? (parseInt(previousnode[0])).toString() : '1') : this.tempSubmileArray.length > 1 ? this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === prvnode[i].data).id : this.subpreviousSource !== undefined ? this.subpreviousSource : (previousnode !== null ? (parseInt(previousnode[previousnode.length - 1])).toString() : '0'),
                target: previousnode !== null ? (parseInt(previousnode[previousnode.length - 1]) + 1).toString() : '0'
              };

              if (parseInt(link.source) !== (parseInt(node.id) - 1) || parseInt(link.target) !== parseInt(node.id) - 1) {
                if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.filter(c => c.id === link.source).length > 0 && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.filter(c => c.id === link.target).length > 0) {
                  if (link.source !== link.target) {
                    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push(link);
                  }
                }
              }
            }
          }
        }
        this.previoussubeventdd = node;
        this.recentEventNode = this.previoussubeventdd.id;;
        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes = [...this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes];
        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [...this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links];


        if (!this.initialLoad)
          this.GraphResize();
      }
    }
  }
  // tslint:enable

  async GetAllTasksMilestones() {
    const batchUrl = [];
    const milestoneObj = Object.assign({}, this.queryConfig);
    milestoneObj.url = this.spServices.getReadURL(this.constants.listNames.Milestones.name,
      this.taskAllocationService.taskallocationComponent.milestoneList);
    milestoneObj.url = milestoneObj.url.replace(/{{status}}/gi, 'Active');
    milestoneObj.listName = this.constants.listNames.Milestones.name;
    milestoneObj.type = 'GET';
    batchUrl.push(milestoneObj);
    const submilestoneObj = Object.assign({}, this.queryConfig);
    submilestoneObj.url = this.spServices.getReadURL(this.constants.listNames.SubMilestones.name,
      this.taskAllocationService.taskallocationComponent.submilestonesList);
    submilestoneObj.url = submilestoneObj.url.replace(/{{status}}/gi, 'Yes');
    submilestoneObj.listName = this.constants.listNames.SubMilestones.name;
    submilestoneObj.type = 'GET';
    batchUrl.push(submilestoneObj);
    const tasksObj = Object.assign({}, this.queryConfig);
    tasksObj.url = this.spServices.getReadURL(this.constants.listNames.MilestoneTasks.name,
      this.taskAllocationService.taskallocationComponent.taskList);
    tasksObj.url = tasksObj.url.replace(/{{status}}/gi, 'Active').replace(/{{TaskType}}/gi, 'SubTask');
    tasksObj.listName = this.constants.listNames.MilestoneTasks.name;
    tasksObj.type = 'GET';
    batchUrl.push(tasksObj);
    this.commonService.SetNewrelic('TaskAllocation', 'Drag-Drop', 'GetMilestoneSubmilestoneAndTasks');
    const arrResult = await this.spServices.executeBatch(batchUrl);
    this.response = arrResult.length ? arrResult.map(a => a.retItems) : [];
    this.sharedObject.oTaskAllocation.arrMilestones = this.response[0].map(c => c.Title);
    this.sharedObject.oTaskAllocation.arrSubMilestones = this.response[1].map(c => c.Title);
    this.sharedObject.oTaskAllocation.arrTasks = this.response[2].map(c => c.Title);
    this.sharedObject.oTaskAllocation.allTasks = this.response[2];

    this.mainloaderenable = false;

  }


  // *************************************************************************************************************************************
  //  To Select particlar  milestone / submilestone
  // *************************************************************************************************************************************
  // tslint:disable
  SelectMilestone(event, mileType) {

    this.taskUp = null;
    this.taskDown = null;
    this.NodePosition();

    if (mileType === 'milestone') {
      if (this.milestonesGraph.nodes.find(c => c.color === '#d26767') !== undefined) {
        this.milestonesGraph.nodes.find(c => c.color === '#d26767').color = '#e2e2e2';
      }

      this.milestonesGraph.nodes.find(c => c.id === event.id).color = '#d26767';
      this.selectedMilestone = event.label;

      this.milestoneIndex = this.milestonesGraph.nodes.indexOf(this.milestonesGraph.nodes.find(c => c.id === event.id));
      this.submilestoneIndex = -1;
      this.selectedSubMilestone = null;
      if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.color === '#d26767') !== undefined) {
        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.color === '#d26767').color = '#e2e2e2';
      }

    }
    else if (mileType === 'submilestone') {


      if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.color === '#d26767') !== undefined) {
        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.color === '#d26767').color = '#e2e2e2';
      }
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.id === event.id).color = '#d26767';
      this.submilestoneIndex = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.id === event.id));
      this.selectedSubMilestone = event.label;

      if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.length > 0) {

        var nodeId = Math.max.apply(null, this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.map(c => parseInt(c.id)))
        this.previousSource = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.id === nodeId.toString());
      }
      else {
        this.previousSource = undefined;
      }
    }
    this.step++;
    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes];
    this.milestonesGraph.nodes = [...  this.milestonesGraph.nodes];
    this.previoustaskeventdd = null;
    this.resizeGraph = mileType === 'submilestone' ? 'task' : 'submilestone';
    this.GraphResize();

  }


  // *************************************************************************************************************************************
  // To Remove milestone / submilestone from milestonesGraph
  // *************************************************************************************************************************************


  ErrorMessage(event, type) {
    this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: type + ' cannot be deleted' });
    event.preventDefault();
  }

  RemoveNode(event, node, mileType) {

    if (node.label !== 'Default') {

      var index = mileType === 'milestone' ? this.milestonesGraph.nodes.indexOf(this.milestonesGraph.nodes.find(c => c.label === node.label && c.id === node.id)) : mileType === 'submilestone' ? this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === node.label && c.id === node.id)) : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.label === node.label && c.id === node.id));
      if (index > -1) {
        switch (mileType) {
          case 'milestone':
            const tasks = this.milestonesGraph.nodes[index].submilestone.nodes.length === 1 ? this.milestonesGraph.nodes[index].submilestone.nodes[0].task.nodes : [];
            const scCRTasks = tasks.length <= 2 ? tasks.filter(t => t.taskType === "Send to client" || t.taskType === "Client Review") : [];
            if ((node.status === 'Not Confirmed' || node.status === 'Not Saved') || (node.status === 'In Progress' && (scCRTasks.length === 1 || scCRTasks.length === 2))) {
              this.milestonesGraph.nodes.splice(index, 1);
              this.milestonesGraph.nodeOrder.splice(this.milestonesGraph.nodeOrder.indexOf(node.id), 1);
              var RemoveLinks = this.milestonesGraph.links.filter(c => c.source === node.id || c.target === node.id);
              if (this.milestonesGraph.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.links.find(c => c.target === node.id) !== undefined) {
                var link = {
                  source: this.milestonesGraph.links.find(c => c.target === node.id).source,
                  target: this.milestonesGraph.links.find(c => c.source === node.id).target,
                };
                if (link.source !== link.target) {
                  this.milestonesGraph.links.push(link);
                }
              }
              this.milestonesGraph.links = this.milestonesGraph.links.filter(value => !RemoveLinks.includes(value));
              if (this.milestoneIndex === index) {
                this.milestoneIndex = -1;
                this.submilestoneIndex = -1;
                this.selectedMilestone = null;
                this.selectedSubMilestone = null;
              } else {
                if (this.milestonesGraph.nodes.find(c => c.color === '#d26767') !== undefined) {
                  this.milestoneIndex = this.milestonesGraph.nodes.indexOf(this.milestonesGraph.nodes.find(c => c.color === '#d26767'));
                }
              }
              this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Milestone Deleted' });
            } else {
              this.ErrorMessage(event, 'Milestone');
            }
            break;
          case 'submilestone':
            if (node.status === 'Not Confirmed' || node.status === 'Not Saved' || node.status === 'Not Started') {
              if (this.submilestoneIndex === index) {
                this.submilestoneIndex = -1;
                this.selectedSubMilestone = null;
              }

              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.splice(index, 1);
              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodeOrder.splice(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.indexOf(node.id), 1);
              RemoveLinks = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(c => c.source === node.id || c.target === node.id);

              if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.target === node.id) !== undefined) {
                var target = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
                if (target.length > 0) {
                  target.forEach(element => {
                    var link = {
                      source: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.target === node.id).source,
                      target: element,
                    };
                    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push(link);
                  });
                }
              }

              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(value => !RemoveLinks.includes(value));
              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links]
              this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Sub Milestone Deleted' });
            } else {
              this.ErrorMessage(event, 'SubMilestone');
            }
            break;
          case 'task':
            if ((node.status === 'Not Confirmed' || node.status === 'Not Saved' || node.status === 'Not Started')) {
              if (node.label === 'Client Review') {
                this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Cant remove Client Review.' });
              }
              else {
                var source = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(c => c.target === node.id).map(c => c.source);
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.splice(index, 1);
                RemoveLinks = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(c => c.source === node.id || c.target === node.id);
                if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.target === node.id) !== undefined) {

                  var target = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
                  if (target.length > 0) {
                    target.forEach(element => {
                      var link = {
                        source: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.target === node.id).source,
                        target: element,
                      };
                      if (target.length > 1) {
                        if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.id === link.target).label.replace(/[0-9]/g, '') !== 'SC') {
                          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
                        }
                      }
                      else {
                        if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.id === link.target).label.replace(/[0-9]/g, '') !== 'Client Review') {
                          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
                        }
                      }
                    });
                  }
                }

                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(value => !RemoveLinks.includes(value));
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links]
                this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Task Deleted' });

                if (RemoveLinks.filter(c => c.source === node.id).length > 0) {
                  this.previousSource = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
                  if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(c => this.previousSource.includes(c.source)).length > 0) {
                    this.previousSource = undefined;
                  }
                  else {
                    this.previousSource = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(e => e.id === this.previousSource[0]);
                  }
                }
                else {
                  this.previousSource = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(e => e.id === source[0]);
                }
              }
            } else {
              this.ErrorMessage(event, 'Task')
            }
            break;
        }
        this.milestonesGraph.nodes = [...  this.milestonesGraph.nodes];
        this.milestonesGraph.links = [...  this.milestonesGraph.links];
      }
      event.preventDefault();
      this.resizeGraph = mileType;
      this.GraphResize();
      // if (mileType === 'milestone') {
      //   this.milestonesGraph.nodes.splice(index, 1);
      //   this.milestonesGraph.nodeOrder.splice(this.milestonesGraph.nodeOrder.indexOf(node.id), 1);
      //   var RemoveLinks = this.milestonesGraph.links.filter(c => c.source === node.id || c.target === node.id);
      //   if (this.milestonesGraph.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.links.find(c => c.target === node.id) !== undefined) {
      //     var link = {
      //       source: this.milestonesGraph.links.find(c => c.target === node.id).source,
      //       target: this.milestonesGraph.links.find(c => c.source === node.id).target,
      //     };

      //     if (link.source !== link.target) {
      //       this.milestonesGraph.links.push(link);
      //     }

      //   }
      //   this.milestonesGraph.links = this.milestonesGraph.links.filter(value => !RemoveLinks.includes(value));

      //   if (this.milestoneIndex === index) {
      //     this.milestoneIndex = -1;
      //     this.submilestoneIndex = -1;
      //     this.selectedMilestone = null;
      //     this.selectedSubMilestone = null;
      //   }
      //   else {
      //     if (this.milestonesGraph.nodes.find(c => c.color === '#d26767') !== undefined) {
      //       this.milestoneIndex = this.milestonesGraph.nodes.indexOf(this.milestonesGraph.nodes.find(c => c.color === '#d26767'));
      //     }
      //   }

      //   this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Milestone Deleted' });
      // }
      // else if (mileType === 'submilestone') {
      //   if (this.submilestoneIndex === index) {
      //     this.submilestoneIndex = -1;
      //     this.selectedSubMilestone = null;
      //   }

      //   this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.splice(index, 1);
      //   this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodeOrder.splice(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.indexOf(node.id), 1);
      //   RemoveLinks = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(c => c.source === node.id || c.target === node.id);

      //   if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.target === node.id) !== undefined) {
      //     var target = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
      //     if (target.length > 0) {
      //       target.forEach(element => {
      //         var link = {
      //           source: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.target === node.id).source,
      //           target: element,
      //         };
      //         this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push(link);
      //       });
      //     }
      //   }

      //   this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(value => !RemoveLinks.includes(value));
      //   this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links]
      //   this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Sub Milestone Deleted' });
      // }
      // else {
      //   if (node.label === 'Client Review') {
      //     this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Cant remove Client Review.' });
      //   }
      //   else {
      //     var source = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(c => c.target === node.id).map(c => c.source);
      //     this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.splice(index, 1);
      //     RemoveLinks = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(c => c.source === node.id || c.target === node.id);
      //     if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.target === node.id) !== undefined) {

      //       var target = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
      //       if (target.length > 0) {
      //         target.forEach(element => {
      //           var link = {
      //             source: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.target === node.id).source,
      //             target: element,
      //           };
      //           if (target.length > 1) {
      //             if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.id === link.target).label.replace(/[0-9]/g, '') !== 'SC') {
      //               this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
      //             }
      //           }
      //           else {
      //             if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.id === link.target).label.replace(/[0-9]/g, '') !== 'Client Review') {
      //               this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
      //             }
      //           }
      //         });
      //       }
      //     }

      //     this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(value => !RemoveLinks.includes(value));
      //     this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links]
      //     this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Task Deleted' });

      //     if (RemoveLinks.filter(c => c.source === node.id).length > 0) {
      //       this.previousSource = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
      //       if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.filter(c => this.previousSource.includes(c.source)).length > 0) {
      //         this.previousSource = undefined;
      //       }
      //       else {
      //         this.previousSource = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(e => e.id === this.previousSource[0]);
      //       }
      //     }
      //     else {
      //       this.previousSource = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(e => e.id === source[0]);
      //     }
      //   }
    }

  }

  // *************************************************************************************************************************************
  // To Switch  milestone / submilestone 
  // *************************************************************************************************************************************

  onMilestoneDown(event, node) {
    this.milestoneDown = node;
  }

  onMilestoneUp(event, node) {

    if (this.milestoneDown != null) {
      if (this.milestoneDown !== node) {
        this.recentEventNode = node.id;
        this.milestoneUp = node;

        var link = {
          source: (parseInt(this.milestoneDown.id)).toString(),
          target: (parseInt(this.milestoneUp.id)).toString(),
        };
        this.linkremove = false;
        if (this.milestoneDown.type === this.milestoneUp.type) {

          if (this.milestoneDown.type === 'milestone') {
            this.milestonesGraph.links = [];
            if (this.milestoneDown.x < this.milestoneUp.x) {
              this.milestonesGraph.nodeOrder.splice(this.milestonesGraph.nodeOrder.indexOf(this.milestoneUp.id), 1);
              this.milestonesGraph.nodeOrder.splice(this.milestonesGraph.nodeOrder.indexOf(this.milestoneDown.id) + 1, 0, this.milestoneUp.id);
            }
            else {
              this.milestonesGraph.nodeOrder.splice(this.milestonesGraph.nodeOrder.indexOf(this.milestoneDown.id), 1);
              this.milestonesGraph.nodeOrder.splice(this.milestonesGraph.nodeOrder.indexOf(this.milestoneUp.id), 0, this.milestoneDown.id);
            }

            for (var i = 1; i < this.milestonesGraph.nodeOrder.length; i++) {
              link = {
                source: this.milestonesGraph.nodeOrder[i - 1],
                target: this.milestonesGraph.nodeOrder[i],
              };

              if (link.source !== link.target) {
                this.milestonesGraph.links.push(link);
              }
            }
            this.milestonesGraph.links = [...  this.milestonesGraph.links];
          }
          else {
            link = {
              source: this.milestoneDown.id,
              target: this.milestoneUp.id,
            };

            if (this.milestoneDown.label !== 'Default') {
              if (link.source !== link.target) {
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push(link);
              }
            }
            this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [...  this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links];
          }
        }
      }
      this.milestoneUp = null;
      this.milestoneDown = null;
    }
  }
  // *************************************************************************************************************************************
  // To Remove Link from submilestones / tasks 
  // *************************************************************************************************************************************
  RemoveMilestoneLink(event, mileType) {
    if (mileType === 'submilestone') {
      this.subpreviousSource = event.source;
      this.recentEventNode = this.subpreviousSource;
      this.linkremove = true;
      var RemoveLinkindex = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.source === event.source && c.target === event.target));
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.splice(RemoveLinkindex, 1);
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links]
    }
    else {
      var nodes = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes;
      this.previousSource = nodes.find(e => e.id === event.source);
      this.recentEventNode = this.previousSource.id;
      var RemoveLinkindex = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.source === event.source && c.target === event.target));
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.splice(RemoveLinkindex, 1);
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links]
    }

    this.resizeGraph = mileType;
    this.GraphResize();
  }


  // *************************************************************************************************************************************
  // To Add Task To milestonesGraph
  // *************************************************************************************************************************************

  generatePathMatrix() {
    const links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links;
    var outerHtmlElementLinks: any = document.querySelector('.taskDropArea .ngx-charts .links');
    let arrLinksCoord = [];
    let counter = 0;
    const linksSVG = outerHtmlElementLinks.children;
    const linksLength = linksSVG.length;
    for (let count = 0; count < linksLength; count++) {
      var element: any = linksSVG[count];
      var coord = element.getBoundingClientRect();
      var linkLocation = links[counter];
      counter++;
      coord.element = element;
      coord.source = linkLocation.source;
      coord.target = linkLocation.target;
      arrLinksCoord.push(coord);
    }

    return arrLinksCoord;
  }

  getMaxNodeID() {
    let itemID: number = 0;
    var outerHtmlElement: any = document.querySelector('.taskDropArea .ngx-charts .nodes');

    var nodeChildren = outerHtmlElement.children;
    for (var count = 0; count < nodeChildren.length; count++) {
      var element = nodeChildren[count];
      var nodeId = parseInt(element.getAttribute('id'));
      if (nodeId > itemID) {
        itemID = nodeId;
      }
    }
    return itemID;
  }

  onTaskDrop(event) {
    const MilTask = this.sharedObject.oTaskAllocation.allTasks.find(c => c.Title === event.data);
    const originalType = event.data;
    event.data = event.data === 'Send to client' ? 'SC' : event.data;
    if (this.selectedSubMilestone !== 'Default' && event.data === 'Client Review') {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Drop Client Review only in Default submilestone.' });
      return false;
    }
    else if ((this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 1 && this.selectedSubMilestone !== 'Default') || this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length === 1 || (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 1 && this.selectedSubMilestone === 'Default' && event.data === 'Client Review')) {
      var subMilestone = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex];
      const centrallyAllocated = MilTask !== undefined ? MilTask.IsCentrallyAllocated !== null ? MilTask.IsCentrallyAllocated : 'No' : 'No';
      const centralAllocationDone = MilTask !== undefined ? MilTask.CentralAllocationDone !== null ? MilTask.CentralAllocationDone : 'No' : 'No';
      const activeCA = MilTask !== undefined ? MilTask.ActiveCA !== null ? MilTask.ActiveCA : 'No' : 'No';
      var clPresnet = subMilestone.task.nodes.find(e => (e.taskType === 'Client Review' && event.data === 'Client Review'));
      if (clPresnet) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Client Review already present' });
        return false;
      }

      if (!this.milestonesGraph.nodes[this.milestoneIndex].allTasks.find(c => c.type === originalType)) {
        this.milestonesGraph.nodes[this.milestoneIndex].allTasks.push({ type: originalType, tasks: [], slotType: MilTask.TaskType })
      }

      const TaskOfType = this.milestonesGraph.nodes[this.milestoneIndex].allTasks.find(c => c.type === originalType).tasks;
      var count = TaskOfType.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).length > 0 ?
        TaskOfType.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0)).length > 0 ?
          Math.max.apply(null, TaskOfType.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0))) : 1 : 0;
      let node = null;
      const label = count > 0 ? event.data + ' ' + (count + 1) : event.data
      if (subMilestone.task.nodes.length) {
        node = {
          id: (this.getMaxNodeID() + 1).toString(),
          dbId: event.id !== undefined ? event.id : 0,
          label: label,
          color: '#e2e2e2',
          taskType: originalType,
          top: 0,
          left: 0,
          status: 'Not Saved',
          IsCentrallyAllocated: centrallyAllocated === 'Yes' ? 'Yes' : 'No',
          CentralAllocationDone: centralAllocationDone === 'Yes' ? 'Yes' : 'No',
          ActiveCA: activeCA === 'Yes' ? 'Yes' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : '',
          slotType: MilTask.TaskType ? MilTask.TaskType : ''
        };
      }
      else {
        node = {
          id: '1',
          dbId: event.id !== undefined ? event.id : 0,
          label: label,
          color: '#e2e2e2',
          taskType: originalType,
          top: 0,
          left: 0,
          status: 'Not Saved',
          IsCentrallyAllocated: centrallyAllocated === 'Yes' ? 'Yes' : 'No',
          CentralAllocationDone: centralAllocationDone === 'Yes' ? 'Yes' : 'No',
          ActiveCA: activeCA === 'Yes' ? 'Yes' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : '',
          slotType: MilTask.TaskType ? MilTask.TaskType : ''
        };
      }
      this.recentEventNode = node.id;
      node.label = node.label.replace(/[0-9]/g, '').trim() === 'Client Review' ? node.label.replace(/[0-9]/g, '').trim() : node.label;
      let existObject = this.milestonesGraph.nodes[this.milestoneIndex].allTasks.find(c => c.type === node.taskType);
      existObject = this.milestonesGraph.nodes[this.milestoneIndex].allTasks.find(c => c.type === node.taskType);
      if (existObject) {
        existObject.tasks.push(node.label);
      }
      else {
        this.milestonesGraph.nodes[this.milestoneIndex].allTasks.push({ type: node.taskType, tasks: [node.label], slotType: MilTask.TaskType })
      }

      subMilestone.task.nodes.push(node);

      subMilestone.task.nodes = [...subMilestone.task.nodes];
      ////// Works on links 
      if (subMilestone.task.nodes.length) {
        const coord = this.generatePathMatrix();
        var eventCoord = event.event;
        var pathLocation = null;
        if (!this.tasksHoritontal) {
          pathLocation = coord.find(e =>
            (
              ((e.left - 10) <= eventCoord.clientX) && ((e.right + 10) >= eventCoord.clientX) &&
              (e.top <= eventCoord.clientY) && (e.bottom >= eventCoord.clientY)
            )
          );
        }
        else {
          pathLocation = coord.find(e =>
            (
              (e.left <= eventCoord.clientX) && (e.right >= eventCoord.clientX) &&
              ((e.top - 10) <= eventCoord.clientY) && ((e.bottom + 10) >= eventCoord.clientY)
            )
          );
        }

        if (pathLocation) {
          var findPreNode = subMilestone.task.nodes.find(e => e.id === pathLocation.source);
          var findNextNode = subMilestone.task.nodes.find(e => e.id === pathLocation.target);
          if (node.taskType === 'Send to client') {
            this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Send to client cant be dropped two tasks so dropped at the end' });
          }
          else if (findPreNode.taskType !== 'Send to client' && findNextNode.taskType !== 'Client Review') {
            var linkRemoveLink = subMilestone.task.links.findIndex(e => (e.source === pathLocation.source && e.target === pathLocation.target))
            subMilestone.task.links.splice(linkRemoveLink, 1);
            subMilestone.task.links.push({
              source: pathLocation.source,
              target: node.id
            });
            subMilestone.task.links.push({
              source: node.id,
              target: pathLocation.target
            });
            this.previousSource = undefined;
          }
          else {
            this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Task cant be added between Send to client and Client Review so dropped at the end' });
          }
          this.previousSource = undefined;
        }
        else {
          if (this.previousSource) {
            if (this.previousSource.taskType === 'Client Review') {

            }
            else if (this.previousSource.taskType === 'Send to client' && node.taskType === 'Client Review') {
              subMilestone.task.links.push({
                source: this.previousSource.id,
                target: node.id
              });
            }

            else if (this.previousSource.taskType !== 'Send to client' && node.taskType !== 'Client Review') {
              subMilestone.task.links.push({
                source: this.previousSource.id,
                target: node.id
              });
            }
          }

          this.previousSource = node;
        }
      }

      subMilestone.task.links = [...subMilestone.task.links];
    }
    else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Only Client Review  can be added to default sub milestone.' });
    }

    this.resizeGraph = 'task';
    this.GraphResize();

  }
  // *************************************************************************************************************************************
  // To Add Task To milestonesGraph On Restructure
  // *************************************************************************************************************************************


  loadLinks(event, links) {

    if (event.itemType !== "Client Review") {
      var preTasks = event.previousTask !== undefined && event.previousTask !== null ? event.previousTask.split(';') : [];
      var nextTasks = event.nextTask !== undefined && event.nextTask !== null ? event.nextTask.split(';') : [];

      var nodes = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes;

      var currentNode = nodes.find(e => e.label === event.pName);
      preTasks.forEach(element => {
        var prevNode = nodes.find(e => e.label === element);
        if (prevNode) {
          links.push({
            source: prevNode.id,
            target: currentNode.id
          })
        }
      });
      nextTasks.forEach(element => {
        var nextNode = nodes.find(e => e.label === element);
        if (nextNode) {
          links.push({
            source: currentNode.id,
            target: nextNode.id
          })
        }
      });

      var resArr = [];
      if (nodes.length > 1) {
        links.filter(function (item) {
          var i = resArr.findIndex(x => (x.source === item.source && x.target === item.target));
          if (i <= -1) {
            resArr.push({ source: item.source, target: item.target });
          }
          return null;
        });

        links = resArr.splice(0);
      }
      else {
        links = [];
      }
    }
    return links;
  }
  onPageLoad(event) {

    var MilTask = undefined;

    if (this.sharedObject.oTaskAllocation.arrTasks !== undefined) {
      MilTask = this.sharedObject.oTaskAllocation.arrTasks.find(c => c === event.taskType);
    }
    if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.length > 0) {
      var node = {
        id: this.previoustaskeventdd !== undefined ? (parseInt(this.previoustaskeventdd.id) + 1).toString() : '1',
        dbId: event.id !== undefined ? event.id : 0,
        label: event.data,
        color: '#e2e2e2',
        taskType: event.taskType,
        top: 0,
        left: 0,
        status: event.status,
        IsCentrallyAllocated: event.IsCentrallyAllocated,
        CentralAllocationDone: event.CentralAllocationDone,
        ActiveCA: event.ActiveCA,
        skillLevel: MilTask !== undefined ? MilTask !== null ? MilTask : '' : ''
      };
    }
    else {
      node = {
        id: '1',
        dbId: event.id !== undefined ? event.id : 0,
        label: event.data,
        color: '#e2e2e2',
        taskType: event.taskType,
        status: event.status,
        top: 0,
        left: 0,
        IsCentrallyAllocated: event.IsCentrallyAllocated,
        CentralAllocationDone: event.CentralAllocationDone,
        ActiveCA: event.ActiveCA,
        skillLevel: MilTask !== undefined ? MilTask !== null ? MilTask : '' : ''
      };
    }
    this.previoustaskeventdd = node;
    this.recentEventNode = node.id;
    const existObject = this.milestonesGraph.nodes[this.milestoneIndex].allTasks.find(c => c.type === node.taskType);
    if (existObject) {
      existObject.tasks.push(node.label);
    }
    else {
      this.milestonesGraph.nodes[this.milestoneIndex].allTasks.push({ type: node.taskType, tasks: [node.label] })
    }
    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.push(node);
    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes = [...this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes];
  }


  // **************************************************************************************************
  // To  link   task
  // *************************************************************************************************

  ontaskClick(node) {

    if (this.taskDown != null) {
      if (this.taskDown !== node) {
        this.taskUp = node;
        this.recentEventNode = node.id;
        var link = {
          source: (parseInt(this.taskDown.id)).toString(),
          target: (parseInt(this.taskUp.id)).toString(),
        };
        var submilestone = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex];
        if (this.taskUp.taskType === 'Send to client') {
          if (submilestone.task.links.find(c => c.target === link.target) === undefined) {
            submilestone.task.links.push(link);
          }
          else {
            this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Send to client can have only one incoming path' });
          }
        }
        else if (this.taskDown.taskType !== 'Client Review') {
          submilestone.task.links.push(link);
        }
        else {
          this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Client Review cant be start node' });
        }
      }
      else {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Start and end node cant be same.' });
      }
      this.taskDown.color = '#e2e2e2';
      if (this.taskUp !== null) {
        this.taskUp.color = '#e2e2e2';
      }
      this.previousSource = this.taskUp;
      this.taskUp = null;
      this.taskDown = null;

      submilestone.task.links = [...submilestone.task.links];
      this.resizeGraph = 'task';
      this.GraphResize();
    }
    else {
      if (node.taskType !== 'Client Review' && node.taskType !== 'Send to client') {
        this.NodePosition();
        node.color = '#d26767';
        this.taskDown = node;
        this.previousSource = this.taskDown;
      }

    }
  }

  NodePosition() {
    var Count = 0;
    if (this.milestoneIndex > -1 && this.submilestoneIndex > -1) {
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.forEach(element => {
        var position = $($('.task-drop .nodes').children()[Count]).position();
        element.top = position.top;
        element.left = position.left;
        Count++;
      });
    }
  }


  onDragged(event) {
    this.NodePosition();
  }

  ReloadGraph(sType) {
    this.resizeGraph = sType;
    this.GraphResize();
  }

  EnableZoom(bVal) {
    this.enableZoom = bVal;
  }

  EnablePaan(bVal) {
    this.enablePaan = bVal;
  }

  ChangeOrientation(sType) {
    switch (sType) {
      case 'submilestone':
        this.subMilestoneHoritontal = this.subMilestoneHoritontal ? false : true;
        break;
      case 'task':
        this.tasksHoritontal = this.tasksHoritontal ? false : true;
        break;
    }

    this.resizeGraph = sType;
    this.GraphResize();
  }
  moveToScrollView(milType) {
    if (this.recentEventNode) {
      setTimeout(() => {
        let areaKey = '';
        switch (milType) {
          case 'milestone':
            areaKey = 'milestonesDropArea';
            break;
          case 'submilestone':
            areaKey = 'submilestonesDropArea';
            break;
          case 'task':
            areaKey = 'taskDropArea';
            break;
        }
        const nodeKey = '.' + areaKey + ' g[id="' + this.recentEventNode + '"]';

        const getNode: any = document.querySelector(nodeKey);
        if (getNode) {
          getNode.scrollIntoViewIfNeeded();
        }
        this.recentEventNode = undefined;
      }, 500);
    }
  }

  GraphResize() {
    this.grapLoading = true;
    setTimeout(() => {
      let uiDialog: any = document.querySelector('.ui-dialog-content');
      switch (this.resizeGraph) {
        case 'milestone':
          var milestoneAreaWidth: any = document.querySelector('.milestonesDropArea');
          this.minWidth = milestoneAreaWidth.clientWidth;
          var outerHtmlElement: any = document.querySelector('.milestonesDropArea .ngx-charts .nodes');
          var nodeWidth = Math.ceil(outerHtmlElement.getBBox().width);
          if (nodeWidth > this.minWidth) {
            this.width = nodeWidth + 150;

          }
          else {
            this.width = this.minWidth;

          }

          this.grapLoading = false;
          this.moveToScrollView(this.resizeGraph);

          break;
        case 'submilestone':
          // let changeGraph = false;
          var milestoneAreaWidth: any = document.querySelector('.submilestonesDropArea');
          this.minWidth = milestoneAreaWidth.clientWidth;
          this.subMilestoneMaxHeight = uiDialog.clientHeight - milestoneAreaWidth.offsetTop - 150;
          var outerHtmlElement: any = document.querySelector('.submilestonesDropArea .ngx-charts .nodes');
          var outerHtmlElementLinks: any = document.querySelector('.submilestonesDropArea .ngx-charts .links');
          var nodeWidth = Math.ceil(outerHtmlElement.getBBox().width);
          var nodeLinksWidth = Math.ceil(outerHtmlElementLinks.getBBox().width);
          nodeWidth = nodeWidth > nodeLinksWidth ? nodeWidth : nodeLinksWidth;
          var nodeHeight = Math.ceil(outerHtmlElement.getBBox().height);
          var nodeLinksHeight = Math.ceil(outerHtmlElementLinks.getBBox().height);
          nodeHeight = nodeHeight > nodeLinksHeight ? nodeHeight : nodeLinksHeight;
          if (nodeWidth > this.minWidth) {
            this.subMilestoneWidth = nodeWidth + 150;
            //changeGraph = true;
          }
          else {
            this.subMilestoneWidth = this.minWidth;
          }
          if (nodeHeight > this.subMilestoneMaxHeight) {
            this.subMilestoneHeight = nodeHeight + 150;
            // changeGraph = true;
          } else {
            if (nodeHeight < this.minHeight) {
              this.subMilestoneHeight = this.minHeight;
            }
            else {
              this.subMilestoneHeight = nodeHeight + 150;
            }
          }

          this.grapLoading = false;
          this.moveToScrollView(this.resizeGraph);
          // }
          break;
        case 'task':
          // let changeTaskGraph = false;
          var milestoneAreaWidth: any = document.querySelector('.taskDropArea');
          this.minWidth = milestoneAreaWidth.clientWidth;
          this.taskMaxHeight = uiDialog.clientHeight - milestoneAreaWidth.offsetTop - 60;

          var outerHtmlElement: any = document.querySelector('.taskDropArea .ngx-charts .nodes');
          var outerHtmlElementLinks: any = document.querySelector('.taskDropArea .ngx-charts .links');
          var nodeWidth = Math.ceil(outerHtmlElement.getBBox().width);
          var nodeLinksWidth = Math.ceil(outerHtmlElementLinks.getBBox().width);
          nodeWidth = nodeWidth > nodeLinksWidth ? nodeWidth : nodeLinksWidth;
          var nodeHeight = Math.ceil(outerHtmlElement.getBBox().height);
          var nodeLinksHeight = Math.ceil(outerHtmlElementLinks.getBBox().height);
          nodeHeight = nodeHeight > nodeLinksHeight ? nodeHeight : nodeLinksHeight;


          if (nodeWidth > this.minWidth) {
            this.taskWidth = nodeWidth + 150;
            // changeTaskGraph = true;
          }
          else {
            this.taskWidth = this.minWidth;
          }
          if (nodeHeight > this.taskMaxHeight) {
            this.taskHeight = nodeHeight + 200;
            // changeTaskGraph = true;
          }
          else {
            if (nodeHeight < this.minHeight) {
              this.taskHeight = this.minHeight;
            }
            else {
              this.taskHeight = nodeHeight + 200;
            }
          }

          this.grapLoading = false;
          this.moveToScrollView(this.resizeGraph);
          //  }
          break;
      }
    }, 500);
  }


  // **************************************************************************************************
  // To  Drop client Review By default
  // *************************************************************************************************

  DropCRDefault(event, milestoneIndex, submilestoneIndex) {

    const selectedSubMilestone = 'Default';
    const originalType = event.data;
    event.data = event.data === 'Send to client' ? 'SC' : event.data;

    if (selectedSubMilestone !== 'Default' && event.data === 'Client Review') {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Drop Client Review only in Default submilestone.' });
      return false;
    }
    else if ((this.milestonesGraph.nodes[milestoneIndex].submilestone.nodes.length > 1 && selectedSubMilestone !== 'Default') || this.milestonesGraph.nodes[milestoneIndex].submilestone.nodes.length === 1 || (this.milestonesGraph.nodes[milestoneIndex].submilestone.nodes.length > 1 && selectedSubMilestone === 'Default' && event.data === 'Client Review')) {
      var subMilestone = this.milestonesGraph.nodes[milestoneIndex].submilestone.nodes[submilestoneIndex];

      var clPresnet = subMilestone.task.nodes.find(e => (e.taskType === 'Client Review' && event.data === 'Client Review'));
      if (clPresnet) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Client Review already present' });
        return false;
      }

      if (!this.milestonesGraph.nodes[milestoneIndex].allTasks.find(c => c.type === originalType)) {
        this.milestonesGraph.nodes[milestoneIndex].allTasks.push({ type: originalType, tasks: [] })
      }

      const TaskOfType = this.milestonesGraph.nodes[milestoneIndex].allTasks.find(c => c.type === originalType).tasks;

      var count = TaskOfType.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).length > 0 ?
        TaskOfType.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0)).length > 0 ?
          Math.max.apply(null, TaskOfType.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0))) : 1 : 0;
      const MilTask = this.sharedObject.oTaskAllocation.allTasks.find(c => c.Title === originalType);
      const CentrallyAllocated = MilTask !== undefined ? MilTask.IsCentrallyAllocated !== null ? MilTask.IsCentrallyAllocated : 'No' : 'No';
      const CentralAllocationDone = MilTask !== undefined ? MilTask.CentralAllocationDone !== null ? MilTask.CentralAllocationDone : 'No' : 'No';
      const ActiveCA = MilTask !== undefined ? MilTask.ActiveCA !== null ? MilTask.ActiveCA : 'No' : 'No';
      var node = null;

      if (subMilestone.task.nodes.length) {
        node = {
          id: (this.getMaxNodeID() + 1).toString(),
          dbId: event.id !== undefined ? event.id : 0,
          label: count > 0 ? event.data + ' ' + (count + 1) : event.data,
          color: '#e2e2e2',
          taskType: originalType,
          top: 0,
          left: 0,
          status: 'Not Saved',
          IsCentrallyAllocated: CentrallyAllocated === 'Yes' ? 'Yes' : 'No',
          CentralAllocationDone: CentralAllocationDone === 'Yes' ? 'Yes' : 'No',
          ActiveCA: ActiveCA === 'Yes' ? 'Yes' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : '',
          slotType: MilTask.TaskType ? MilTask.TaskType : ''
        };
      }
      else {
        node = {
          id: '1',
          dbId: event.id !== undefined ? event.id : 0,
          label: count > 0 ? event.data + ' ' + (count + 1) : event.data,
          //position: 'x1',
          color: '#e2e2e2',
          taskType: originalType,
          top: 0,
          left: 0,
          status: 'Not Saved',
          IsCentrallyAllocated: CentrallyAllocated === 'Yes' ? 'Yes' : 'No',
          CentralAllocationDone: CentralAllocationDone === 'Yes' ? 'Yes' : 'No',
          ActiveCA: ActiveCA === 'Yes' ? 'Yes' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : '',
          slotType: MilTask.TaskType ? MilTask.TaskType : ''
        };
      }

      node.label = node.label.replace(/[0-9]/g, '').trim() === 'Client Review' ? node.label.replace(/[0-9]/g, '').trim() : node.label;
      const existObject = this.milestonesGraph.nodes[milestoneIndex].allTasks.find(c => c.type === node.taskType);
      if (existObject) {
        existObject.tasks.push(node.label);
      }
      else {
        this.milestonesGraph.nodes[milestoneIndex].allTasks.push({ type: node.taskType, tasks: node.label })
      }

      subMilestone.task.nodes.push(node);

      subMilestone.task.nodes = [...subMilestone.task.nodes];
      ////// Works on links 
    }
    else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Only Client Review  can be added to default sub milestone.' });
    }
  }
}

// tslint:enable
export class Task {
  constructor(milestone: string, submilestone: string, nodes: [], links: [], status: string) {
    this.milestoneId = milestone;
    this.submilestoneId = submilestone;
    this.nodes = nodes;
    this.links = links;
    this.status = status;
  }
  milestoneId: string;
  submilestoneId: string;
  status: string;
  nodes: [];
  links: [];
}
