import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, MessageService, ConfirmationService } from 'primeng/api';
import { GlobalService } from 'src/app/Services/global.service';
import { SharepointoperationService } from 'src/app/Services/sharepoint-operation.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { TaskAllocationConstantsService } from '../services/task-allocation-constants.service';
import * as shape from 'd3-shape';
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
  previousevent;
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
  taskMaxHeight: number = 300;
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
  // tslint:enable
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public sharedObject: GlobalService,
    private spServices: SharepointoperationService,
    private constants: ConstantsService,
    private taskAllocationService: TaskAllocationConstantsService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.initialLoad = true;
    this.setInitialWidth();
    this.GetAllTasksMilestones();

    this.data = this.config.data;
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
                status: element.data.status,
              };

              if (element.children === undefined) {
                this.submilestoneIndex = 0;
                this.onPageLoad(temp1);
              } else {
                if (temp1.position !== undefined) {
                  this.tempSubmileArray.push(temp1);
                }
                // tslint:disable-next-line: no-shadowed-variable
                element.children.forEach(element => {
                  if (temp1.status === undefined || temp1.status !== 'Not Confirmed' || temp1.status !== 'Not Started') {
                    temp1.status = element.data.status;
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
                    status: element.data.status,
                  };
                  this.onPageLoad(temp2);
                });
                // tslint:disable-next-line: no-shadowed-variable
                element.children.forEach(element => {
                  links = this.loadLinks(element.data, links).splice(0);
                });
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...links];

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
  }


  // **************************************************************************************************************************************
  // Save Graph
  // **************************************************************************************************************************************

  SaveGraph() {
    let errorM = 0;
    let ScPresent = false;
    if (this.milestonesGraph.nodes.length > 0) {
      this.milestonesGraph.nodes.forEach(milestone => {

        if (milestone.status !== 'Completed') {
          milestone.submilestone.nodes.forEach(submilestone => {
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
                filter(c => !submilestone.task.nodes.filter(d => (d.taskType === 'Client Review'
                ) || (c.taskType !== 'Adhoc' && c.taskType !== 'TB')).map(d => d.id).includes(c));

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
              submilestone.task.links.forEach(link => {
                if (circularPresent === false) {
                  const currentPath = link.source;
                  const target = link.target;
                  circularPresent = this.getNextTarget(link.source, target, submilestone, currentPath, circularPresent);
                }
              });
              if (circularPresent) {
                errorM++;
                this.messageService.add({
                  key: 'custom', severity: 'warn', summary: 'Warning Message',
                  detail: 'Circular links present. Please delete the circular links in ' + submilestone.label + '-' + milestone.label
                });
                return false;
              }
            }
          });

          if (ScPresent === false && errorM === 0) {
            errorM++;
            this.messageService.add({
              key: 'custom', severity: 'warn', summary: 'Warning Message',
              detail: 'Please add Send to Client in ' + milestone.label
            });
            return false;
          }
        }

        ScPresent = false;
      });

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
    if (miletype === 'milestone' ? this.milestonesGraph.nodes.length > 0 : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 0) {
      var previousnode = null;
      if (miletype === 'milestone' ? this.milestonesGraph.nodes.length > 0 : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 0) {
        previousnode = miletype === 'milestone' ? this.milestonesGraph.nodes.map(c => c.id).filter(c => !this.milestonesGraph.links.map(c => c.source).includes(c)) : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.map(c => c.id).filter(c => !this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.map(c => c.source).includes(c));
      }

      var count = 0;

      if (miletype === 'milestone') {
        count = this.milestonesGraph.nodes.map(c => c.label).filter(function (node) { return new RegExp(event.data, 'g').test(node) }).length > 0 ? this.milestonesGraph.nodes.map(c => c.label).filter(function (node) { return new RegExp(event.data, 'g').test(node) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c)).length > 0 ? Math.max.apply(null, this.milestonesGraph.nodes.map(c => c.label).filter(function (node) { return new RegExp(event.data, 'g').test(node) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c))) : 1 : 0;
      }
      else {
        count = this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).length > 0 ? this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c)).length > 0 ? Math.max.apply(null, this.milestonesGraph.nodes[this.milestoneIndex].allsubmilestones.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => parseInt(c))) : 1 : 0;
      }
      let nodeLabel = count > 0 ? (event.data === 'Draft' ? event.data + ' ' + (count + 1) : event.data + ' ' + (count + 1)) : event.data === 'Draft' ? event.data + ' ' + (count + 1) : event.data;
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
        allTasks: []
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
      let nodeLabel = event.data
      if (nodeLabel === 'Draft') {
        nodeLabel = nodeLabel + ' 1';
      }
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
        allTasks: []
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
      this.milestonesGraph.nodes = [...this.milestonesGraph.nodes];
      this.milestonesGraph.links = [...this.milestonesGraph.links];

      // var elmnt = document.getElementById('MilestoneChart');
      // elmnt.scrollLeft = (elmnt.scrollWidth);
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
        //this.selectedSubMilestone= node.label;
        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes = [...this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes];
        this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [...this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links];


        if (!this.initialLoad)
          this.GraphResize();
      }
    }
  }
  // tslint:enable

  async GetAllTasksMilestones() {

    const batchGuid = this.spServices.generateUUID();
    this.batchContents = new Array();


    // ************************************************************************************************
    //  Get All milestones
    // ****************************************************     ***************************************

    this.taskAllocationService.taskallocationComponent.milestoneList.filter =
      this.taskAllocationService.taskallocationComponent.milestoneList.filter.replace(/{{status}}/gi, 'Active');
    const milestoneListUrl =
      this.spServices.getReadURL('' + this.constants.listNames.Milestones.name
        + '', this.taskAllocationService.taskallocationComponent.milestoneList);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, milestoneListUrl);

    // ******************************************************************************************
    //  Get All Submilestones
    // ******************************************************************************************

    this.taskAllocationService.taskallocationComponent.submilestonesList.filter
      = this.taskAllocationService.taskallocationComponent.submilestonesList.filter.replace
        (/{{status}}/gi, 'Yes');
    const submilestoneListUrl = this.spServices.getReadURL
      ('' + this.constants.listNames.SubMilestones.name + '', this.taskAllocationService.taskallocationComponent.submilestonesList);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, submilestoneListUrl);


    // ************************************************************************************************
    //  Get All Submilestones
    // ************************************************************************************************

    this.taskAllocationService.taskallocationComponent.taskList.filter
      = this.taskAllocationService.taskallocationComponent.taskList.filter.replace(/{{status}}/gi, 'Active');
    const taskListUrl = this.spServices.getReadURL
      ('' + this.constants.listNames.MilestoneTasks.name + '', this.taskAllocationService.taskallocationComponent.taskList);
    this.spServices.getBatchBodyGet(this.batchContents, batchGuid, taskListUrl);


    this.response = await this.spServices.getDataByApi(batchGuid, this.batchContents);

    this.sharedObject.oTaskAllocation.arrMilestones = this.response[0].map(c => c.Title);
    this.sharedObject.oTaskAllocation.arrSubMilestones = this.response[1].map(c => c.Title);
    this.sharedObject.oTaskAllocation.arrTasks = this.response[2].map(c => c.Title);

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



      //comment old
      // this.NodePosition();


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
    this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: type + ' can  not be deleted' });
    event.preventDefault();
  }

  RemoveNode(event, node, mileType) {

    if (node.label !== 'Default') {
      //var result = confirm('Want to delete?');
      //if (result) {

      var index = mileType === 'milestone' ? this.milestonesGraph.nodes.indexOf(this.milestonesGraph.nodes.find(c => c.label === node.label && c.id === node.id)) : mileType === 'submilestone' ? this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.find(c => c.label === node.label && c.id === node.id)) : this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.find(c => c.label === node.label && c.id === node.id));
      if (index > -1) {

        if (mileType === 'milestone') {
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
          }
          else {
            if (this.milestonesGraph.nodes.find(c => c.color === '#d26767') !== undefined) {
              this.milestoneIndex = this.milestonesGraph.nodes.indexOf(this.milestonesGraph.nodes.find(c => c.color === '#d26767'));
            }
          }

          this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Milestone Deleted' });
        }
        else if (mileType === 'submilestone') {
          if (this.submilestoneIndex === index) {
            this.submilestoneIndex = -1;
            this.selectedSubMilestone = null;
          }

          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.splice(index, 1);
          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodeOrder.splice(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.indexOf(node.id), 1);
          RemoveLinks = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(c => c.source === node.id || c.target === node.id);

          if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.source === node.id) !== undefined && this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.target === node.id) !== undefined) {
            //  var target =  RemoveLinks.filter(c=>c.target === node.id).map(c=>c.source); 
            var target = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
            if (target.length > 0) {
              target.forEach(element => {
                var link = {
                  source: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.target === node.id).source,
                  target: element,

                  // source: element,
                  // target: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.source === node.id).target,
                };
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.push(link);
              });
            }
          }

          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.filter(value => !RemoveLinks.includes(value));
          this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links]
          this.messageService.add({ key: 'custom', severity: 'error', summary: 'Deleted', detail: 'Sub Milestone Deleted' });
        }
        else {
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
                    // source: element,
                    // target: this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.source === node.id).target,
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
              // source;
            }
          }
          //comment old
          // this.NodePosition();
        }
      }
      this.milestonesGraph.nodes = [...  this.milestonesGraph.nodes];
      this.milestonesGraph.links = [...  this.milestonesGraph.links];
      //}
    }
    event.preventDefault();
    this.resizeGraph = mileType;
    this.GraphResize();
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
      this.linkremove = true;
      var RemoveLinkindex = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.indexOf(this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.find(c => c.source === event.source && c.target === event.target));
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links.splice(RemoveLinkindex, 1);
      this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links = [... this.milestonesGraph.nodes[this.milestoneIndex].submilestone.links]
    }
    else {
      var nodes = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes;
      this.previousSource = nodes.find(e => e.id === event.source);
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


    const originalType = event.data;
    event.data = event.data === 'Send to client' ? 'SC' : event.data;

    if (this.selectedSubMilestone !== 'Default' && event.data === 'Client Review') {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Drop Client Review only in Default submilestone.' });
      return false;
    }
    else if ((this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 1 && this.selectedSubMilestone !== 'Default') || this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length === 1 || (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes.length > 1 && this.selectedSubMilestone === 'Default' && event.data === 'Client Review')) {
      var subMilestone = this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex];

      var clPresnet = subMilestone.task.nodes.find(e => (e.taskType === 'Client Review' && event.data === 'Client Review'));
      if (clPresnet) {
        this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Client Review already present' });
        return false;
      }

      var count = this.milestonesGraph.nodes[this.milestoneIndex].allTasks.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).length > 0 ?
        this.milestonesGraph.nodes[this.milestoneIndex].allTasks.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0)).length > 0 ?
          Math.max.apply(null, this.milestonesGraph.nodes[this.milestoneIndex].allTasks.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0))) : 1 : 0;
      const MilTask = this.sharedObject.oTaskAllocation.arrTasks.find(c => c.Title === originalType);
      const CentrallyAllocated = MilTask !== undefined ? MilTask.IsCentrallyAllocated !== null ? MilTask.IsCentrallyAllocated : 'No' : 'No';
      var node = null;

      if (subMilestone.task.nodes.length) {
        node = {
          id: (this.getMaxNodeID() + 1).toString(),
          dbId: event.id !== undefined ? event.id : 0,
          label: count > 0 ? event.data + ' ' + (count + 1) : event.data,
          //position: this.previoustaskeventdd !== null ? 'x' + (parseInt(this.previoustaskeventdd.id) + 1) : previoustasknode !== undefined ?   'x'+(parseInt(previoustasknode[previoustasknode.length-1]) + 1).toString():'x100',
          color: '#e2e2e2',
          taskType: originalType,
          top: 0,
          left: 0,
          status: 'Not Saved',
          IsCentrallyAllocated: this.sharedObject.oTaskAllocation.oLegalEntity.length > 0 ? this.sharedObject.oTaskAllocation.oLegalEntity[0].IsCentrallyAllocated === 'Yes' && CentrallyAllocated === 'Yes' ? 'Yes' : 'No' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : ''
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
          IsCentrallyAllocated: this.sharedObject.oTaskAllocation.oLegalEntity.length > 0 ? this.sharedObject.oTaskAllocation.oLegalEntity[0].IsCentrallyAllocated === 'Yes' && CentrallyAllocated === 'Yes' ? 'Yes' : 'No' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : ''
        };
      }

      node.label = node.label.replace(/[0-9]/g, '').trim() === 'Client Review' ? node.label.replace(/[0-9]/g, '').trim() : node.label;
      this.milestonesGraph.nodes[this.milestoneIndex].allTasks.push(node.label);
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
        //position: previoustasknode === null ? 'x' + (parseInt(this.previoustaskeventdd.id) + 1) : 'x' + (parseInt(previoustasknode[0]) + 1) ,
        color: '#e2e2e2',
        taskType: event.taskType,
        top: 0,
        left: 0,
        status: event.status,
        IsCentrallyAllocated: event.IsCentrallyAllocated,
        skillLevel: MilTask !== undefined ? MilTask !== null ? MilTask : '' : ''
      };
    }
    else {
      node = {
        id: '1',
        dbId: event.id !== undefined ? event.id : 0,
        label: event.data,
        //position: 'x1',
        color: '#e2e2e2',
        taskType: event.taskType,
        status: event.status,
        top: 0,
        left: 0,
        IsCentrallyAllocated: event.IsCentrallyAllocated,
        skillLevel: MilTask !== undefined ? MilTask !== null ? MilTask : '' : ''
      };
    }
    this.previoustaskeventdd = node;
    this.milestonesGraph.nodes[this.milestoneIndex].allTasks.push(node.label);
    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes.push(node);
    this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes = [...this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.nodes];
  }


  // **************************************************************************************************
  // To  link   task
  // *************************************************************************************************

  ontaskDown(event, node) {
    this.taskDown = node;
  }

  ontaskUp(event, node) {
    if (this.taskDown != null) {
      if (this.taskDown !== node) {
        this.taskUp = node;

        if (this.taskDown.taskType !== 'Client Review' &&
          (this.taskDown.taskType !== 'Send to client' &&
            this.taskUp.taskType !== 'Client Review')) {
          var link = {
            source: (parseInt(this.taskDown.id)).toString(),
            target: (parseInt(this.taskUp.id)).toString(),
          };

          if (this.taskDown.type === this.taskUp.type) {

            link = {
              source: this.taskDown.id,
              target: this.taskUp.id,
            };
            if (this.taskUp.taskType === 'Send to client') {
              if (this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.find(c => c.target === link.target) === undefined) {
                if (link.source !== link.target) {
                  this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
                }
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...  this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links];
              }
            }
            else {
              if (link.source !== link.target) {
                this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
              }
              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...  this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links];
            }
          }
        }
        else if (this.taskDown.taskType === 'Send to client' && this.taskUp.taskType === 'Client Review') {
          var link = {
            source: (parseInt(this.taskDown.id)).toString(),
            target: (parseInt(this.taskUp.id)).toString(),
          };

          if (this.taskDown.type === this.taskUp.type) {

            link = {
              source: this.taskDown.id,
              target: this.taskUp.id,
            };
            if (link.source !== link.target) {
              this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links.push(link);
            }
            this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links = [...  this.milestonesGraph.nodes[this.milestoneIndex].submilestone.nodes[this.submilestoneIndex].task.links];
          }
        }
      }
      this.taskUp = null;
      this.taskDown = null;
      this.resizeGraph = 'task';
      this.GraphResize();
    }
  }

  ontaskClick(node) {

    if (this.taskDown != null) {
      if (this.taskDown !== node) {
        this.taskUp = node;
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
          if (submilestone.task.links.find(c => c.source === link.source) === undefined) {
            if (this.taskUp.taskType === 'Client Review') {
              submilestone.task.links.push(link);
            }
            else {
              this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Send to client can have only connect to Clint Review' });
            }
          }
          else {
            if (submilestone.task.links.filter(c => c.source === link.source).length > 1)
              this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Send to client can have only one outgoing path' });
          }
        }
        else if (this.taskUp.taskType === 'Client Review') {
          if (this.taskDown.taskType !== 'Send to client') {
            this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Client Review can only have Send to client as previous task' });
          }
          else if (submilestone.task.links.find(c => c.target === link.target) !== undefined) {
            this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warn Message', detail: 'Client Review can only have one previous task' });
          }
          else {
            submilestone.task.links.push(link);
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
      if (node.taskType !== 'Client Review') {
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
  GraphResize() {
    this.grapLoading = true;
    setTimeout(() => {

      switch (this.resizeGraph) {
        case 'milestone':
          var outerHtmlElement: any = document.querySelector('.milestonesDropArea .ngx-charts .nodes');
          var nodeWidth = Math.ceil(outerHtmlElement.getBBox().width);
          if (nodeWidth > this.minWidth) {
            this.width = nodeWidth + 150;
            setTimeout(() => {
              var elmnt = document.getElementById('MilestoneChart');
              if (elmnt !== null) {
                elmnt.scrollLeft = this.width - this.minWidth;
              }
              this.grapLoading = false;
            }, 500);
          }
          else {
            this.width = this.minWidth;
            this.grapLoading = false;
          }
          break;
        case 'submilestone':
          let changeGraph = false;
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
            changeGraph = true;
          }
          else {
            this.subMilestoneWidth = this.minWidth;
          }
          if (nodeHeight > this.subMilestoneMaxHeight) {
            this.subMilestoneHeight = nodeHeight + 150;
            changeGraph = true;
          } else {
            if (nodeHeight < this.minHeight) {
              this.subMilestoneHeight = this.minHeight;
            }
            else {
              this.subMilestoneHeight = nodeHeight + 150;
            }
          }
          if (changeGraph) {
            setTimeout(() => {
              var elmnt = document.getElementById('SubMilestoneChart');
              if (elmnt !== null) {
                elmnt.scrollLeft = this.subMilestoneWidth - this.minWidth;
                elmnt.scrollTop = this.subMilestoneHeight - this.subMilestoneMaxHeight;
              }
              this.grapLoading = false;
            }, 500);
          }
          else {
            this.grapLoading = false;
          }
          break;
        case 'task':
          let changeTaskGraph = false;
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
            changeTaskGraph = true;
          }
          else {
            this.taskWidth = this.minWidth;
          }
          if (nodeHeight > this.taskMaxHeight) {
            this.taskHeight = nodeHeight + 200;
            changeTaskGraph = true;
          }
          else {
            if (nodeHeight < this.minHeight) {
              this.taskHeight = this.minHeight;
            }
            else {
              this.taskHeight = nodeHeight + 200;
            }
          }
          if (changeTaskGraph) {
            setTimeout(() => {
              var elmnt = document.getElementById('taskChart');
              if (elmnt !== null) {
                elmnt.scrollLeft = this.subMilestoneWidth - this.minWidth;
                elmnt.scrollTop = this.subMilestoneHeight - this.subMilestoneMaxHeight;
              }
              this.grapLoading = false;
            }, 500);
          }
          else {
            this.grapLoading = false;
          }
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

      var count = this.milestonesGraph.nodes[milestoneIndex].allTasks.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).length > 0 ?
        this.milestonesGraph.nodes[milestoneIndex].allTasks.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0)).length > 0 ?
          Math.max.apply(null, this.milestonesGraph.nodes[milestoneIndex].allTasks.filter(function (task) { return new RegExp(event.data, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(event.data, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0))) : 1 : 0;
      const MilTask = this.sharedObject.oTaskAllocation.arrTasks.find(c => c.Title === originalType);
      const CentrallyAllocated = MilTask !== undefined ? MilTask.IsCentrallyAllocated !== null ? MilTask.IsCentrallyAllocated : 'No' : 'No';
      var node = null;

      if (subMilestone.task.nodes.length) {
        node = {
          id: (this.getMaxNodeID() + 1).toString(),
          dbId: event.id !== undefined ? event.id : 0,
          label: count > 0 ? event.data + ' ' + (count + 1) : event.data,
          //position: this.previoustaskeventdd !== null ? 'x' + (parseInt(this.previoustaskeventdd.id) + 1) : previoustasknode !== undefined ?   'x'+(parseInt(previoustasknode[previoustasknode.length-1]) + 1).toString():'x100',
          color: '#e2e2e2',
          taskType: originalType,
          top: 0,
          left: 0,
          status: 'Not Saved',
          IsCentrallyAllocated: this.sharedObject.oTaskAllocation.oLegalEntity.length > 0 ? this.sharedObject.oTaskAllocation.oLegalEntity[0].IsCentrallyAllocated === 'Yes' && CentrallyAllocated === 'Yes' ? 'Yes' : 'No' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : ''
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
          IsCentrallyAllocated: this.sharedObject.oTaskAllocation.oLegalEntity.length > 0 ? this.sharedObject.oTaskAllocation.oLegalEntity[0].IsCentrallyAllocated === 'Yes' && CentrallyAllocated === 'Yes' ? 'Yes' : 'No' : 'No',
          skillLevel: MilTask !== undefined ? MilTask.DefaultSkill !== null ? MilTask.DefaultSkill : '' : ''
        };
      }

      node.label = node.label.replace(/[0-9]/g, '').trim() === 'Client Review' ? node.label.replace(/[0-9]/g, '').trim() : node.label;
      this.milestonesGraph.nodes[milestoneIndex].allTasks.push(node.label);
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
