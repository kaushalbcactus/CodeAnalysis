import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng';
import { GlobalService } from 'src/app/Services/global.service';
import * as shape from 'd3-shape';
import { CACommonService } from '../caservices/cacommon.service';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';


@Component({
  selector: 'app-ca-dragdrop',
  templateUrl: './ca-dragdrop.component.html',
  styleUrls: ['./ca-dragdrop.component.css'],
  providers: [DialogService]
})
export class CaDragdropComponent implements OnInit {
  initialLoad: boolean;
  data: any;
  public queryConfig = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };
  response: any;
  mainloaderenable: boolean;
  curve = shape.curveLinear;
  previousSource;
  allConstantTasks: any;
  arrConstantTasks: any;
  draggedTask: any;
  nodes = [];
  tempTaskarray = [];
  links = [];
  tasksHoritontal = true;
  recentEventNode = undefined;
  taskWidth = 1200;
  taskHeight = 150;
  taskMaxHeight = 150;
  width = 700;
  height = 80;
  minWidth = 1200;
  minHeight = 150;
  enableZoom = false;
  enablePaan = false;
  resizeGraph = '';
  grapLoading = false;
  taskUp = null;
  taskDown = null;
  TempMilestoneAllTasks = [];
  nodeOrder = [];
  slotTasks: any;
  display: boolean;
  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public sharedObject: GlobalService,
    private caCommonService: CACommonService,
    public dialogService: DialogService,
    private commonService: CommonService,
    private constants : ConstantsService) { }

  async ngOnInit() {

    this.initialLoad = true;
    this.data = this.config.data.slot;
    this.TempMilestoneAllTasks = JSON.parse(JSON.stringify(this.data.MilestoneAllTasks));

    this.setInitialWidth();
    await this.GetAllConstantTasks();
    this.getSlotTasks();
  }

  setInitialWidth() {
    const areaWidth = document.getElementsByClassName('taskDropArea')[0].clientWidth;
    this.width = areaWidth;
    this.taskWidth = areaWidth;
    this.minWidth = areaWidth;
  }


  async GetAllConstantTasks() {

    this.allConstantTasks = await this.caCommonService.GetAllTasksMilestones(this.data.Task);
    this.arrConstantTasks = this.allConstantTasks.map(c => c.Title);
    this.mainloaderenable = false;
  }

  async getSlotTasks() {
    let links = [];
    if (this.data.SlotTasks) {

      this.data.SlotTasks.forEach(async task => {
        await this.onPageLoad(task);
        links = this.loadLinks(task, links).splice(0);
        this.links = [...links];
      });

      if (this.data.SlotTasks.length === 1) {
        this.previousSource = this.nodes[0];
      }
      this.initialLoad = false;
      this.GraphResize();

    } else {
      this.response = await this.caCommonService.getSlotTasks(this.data);

      this.slotTasks = this.response;
      if (this.response.length > 0) {
        this.response.forEach(async element => {
          if (element.Status !== 'Deleted') {
            this.draggedTask = element.taskType;
            await this.onPageLoad(element);
            this.draggedTask = null;

            element.NextTasks = element.NextTasks ? element.NextTasks.replace(new RegExp(element.ProjectCode + ' ', 'g'), '')
              .replace(new RegExp(element.Milestone + ' ', 'g'), '').replace(/#/gi, '') : null;

            element.PrevTasks = element.PrevTasks ? element.PrevTasks.replace(new RegExp(element.ProjectCode + ' ', 'g'), '')
              .replace(new RegExp(element.Milestone + ' ', 'g'), '').replace(/#/gi, '') : null;

            links = this.loadLinks(element, links).splice(0);
            this.links = [...links];
          }
        });
        if (this.response.filter(c => c.Status !== 'Deleted').length === 0) {
          this.draggedTask = this.arrConstantTasks[0];
          await this.onTaskDrop(this.draggedTask);
          this.draggedTask = null;

        }
        this.initialLoad = false;
      } else {
        this.draggedTask = this.arrConstantTasks[0];
        await this.onTaskDrop(this.draggedTask);
        this.draggedTask = null;
        this.initialLoad = false;
      }
    }
  }

  // *********************************************************************************************************
  // Discard  Graph changes
  // *********************************************************************************************************

  cancelGraph() {

    const result = confirm('Are you sure that you want to discard all changes?');
    if (result) {
      this.ref.close();
    }

  }

  onDragged(event, task) {

  }

  dragStart(event, task) {
    this.draggedTask = task;
    this.NodePosition();
  }

  dragEnd(event) {
    this.draggedTask = null;
  }

  NodePosition() {
    let Count = 0;
    this.nodes.forEach(element => {
      const position = $($('.task-drop .nodes').children()[Count]).position();
      element.top = position.top;
      element.left = position.left;
      Count++;
    });

  }

  onTaskDrop(event) {

    let count = 0;
    const Task = this.allConstantTasks.find(c => c.Title === this.draggedTask);
    const originalType = Task.Title;

    const TaskOfType = this.TempMilestoneAllTasks.find(c => c.type === originalType && c.milestone === this.data.Milestone) ?
      this.TempMilestoneAllTasks.find(c => c.type === originalType && c.milestone === this.data.Milestone).tasks : [];
    // tslint:disable 
    count = TaskOfType.filter((task) => { return new RegExp(Task.Title, 'g').test(task); }).length > 0 ?
      TaskOfType.filter(function (task) { return new RegExp(Task.Title, 'g').test(task) }).filter((v) => { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(Task.Title, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0)).length > 0 ?
        Math.max.apply(null, TaskOfType.filter(function (task) { return new RegExp(Task.Title, 'g').test(task) }).filter(function (v) { return v.replace(/.*\D/g, '') }).map(function (v) { return v.replace(new RegExp(Task.Title, 'g'), '') }).map(c => (!isNaN(c) ? parseInt(c) : 0))) : 1 : 0;

    let node = null;
    // tslint:enable
    if (this.nodes.length) {
      node = {
        id: (this.getMaxNodeID() + 1).toString(),
        dbId: event && event.id !== undefined ? event.id : 0,
        label: count > 0 ? Task.Title + ' ' + (count + 1) : Task.Title,
        TaskName: count > 0 ? Task.Title + ' ' + (count + 1) : Task.Title,
        color: '#e2e2e2',
        taskType: originalType,
        top: 0,
        left: 0,
        Status: 'Not Saved',
        IsCentrallyAllocated: 'Yes',
        SkillLevel: Task !== undefined ? Task.DefaultSkill !== null ? Task.DefaultSkill : '' : '',
        projectCode: this.data.ProjectCode
      };
    } else {
      node = {
        id: '1',
        dbId: event && event.id !== undefined ? event.id : 0,
        label: count > 0 ? Task.Title + ' ' + (count + 1) : Task.Title,
        TaskName: count > 0 ? Task.Title + ' ' + (count + 1) : Task.Title,
        color: '#e2e2e2',
        taskType: originalType,
        top: 0,
        left: 0,
        Status: 'Not Saved',
        IsCentrallyAllocated: 'Yes',
        SkillLevel: Task !== undefined ? Task.DefaultSkill !== null ? Task.DefaultSkill : '' : '',
        projectCode: this.data.ProjectCode
      };
    }
    this.recentEventNode = node.id;
    this.tempTaskarray.push(node.label);
    this.nodes.push(node);
    this.nodeOrder.push(node.id);
    if (this.TempMilestoneAllTasks.length > 0 && this.TempMilestoneAllTasks.find(c => c.type === originalType
      && c.milestone === this.data.Milestone)) {
      this.TempMilestoneAllTasks.find(c => c.type === originalType && c.milestone === this.data.Milestone).tasks.push(node.label);
    } else {
      this.TempMilestoneAllTasks.push({ type: originalType, milestone: this.data.Milestone, tasks: [node.label] });
    }
    this.nodes = [...this.nodes];
    ////// Works on links
    if (this.nodes.length) {
      const coord = this.generatePathMatrix();
      const eventCoord = event;
      let pathLocation = null;
      if (!this.tasksHoritontal) {
        pathLocation = coord.find(e =>
          (
            ((e.left - 10) <= eventCoord.clientX) && ((e.right + 10) >= eventCoord.clientX) &&
            (e.top <= eventCoord.clientY) && (e.bottom >= eventCoord.clientY)
          )
        );
      } else {
        pathLocation = coord.find(e =>
          (
            (e.left <= eventCoord.clientX) && (e.right >= eventCoord.clientX) &&
            ((e.top - 10) <= eventCoord.clientY) && ((e.bottom + 10) >= eventCoord.clientY)
          )
        );
      }

      if (event) {
        if (pathLocation) {
          const linkRemoveLink = this.links.findIndex(e => (e.source === pathLocation.source && e.target === pathLocation.target));
          this.links.splice(linkRemoveLink, 1);
          this.links.push({
            source: pathLocation.source,
            target: node.id
          });
          this.links.push({
            source: node.id,
            target: pathLocation.target
          });
          this.previousSource = undefined;
        } else {
          if (this.previousSource) {
            this.links.push({
              source: this.previousSource.id,
              target: node.id
            });
          }
          this.previousSource = node;
        }
        this.links = [...this.links];
      }
    }

    this.GraphResize();
  }

  // *************************************************************************************************************************************
  // To Add Task To milestonesGraph On Restructure
  // *************************************************************************************************************************************

  onPageLoad(event) {
    if (!event.TaskName) {
      event.TaskName = $.trim(event.Title.replace(event.ProjectCode + '', '').replace(event.Milestone + '', ''));
    }
    const Task = this.allConstantTasks.find(c => c.Title === event.TaskName.replace(/[0-9]/g, '')
      .replace(/\s+$/, ''));
    const originalType = Task.Title;
    let node = null;
    // tslint:enable

    node = {
      // tslint:disable-next-line: radix
      id: this.nodes.length > 0 ? (parseInt(this.recentEventNode) + 1).toString() : '1',
      dbId: event && event.Id !== undefined ? event.Id : 0,
      label: event.TaskName,
      TaskName: event.TaskName,
      color: '#e2e2e2',
      taskType: originalType,
      top: 0,
      left: 0,
      Status: event.Status ? event.Status : 'Not Saved',
      projectCode: this.data.ProjectCode
    };

    this.recentEventNode = node.id;
    this.tempTaskarray.push(node.label);
    this.nodes.push(node);
    this.nodeOrder.push(node.id);
    if (this.TempMilestoneAllTasks.length > 0 && this.TempMilestoneAllTasks.find(c => c.type === originalType
      && c.milestone === this.data.Milestone)) {
      this.TempMilestoneAllTasks.find(c => c.type === originalType && c.milestone === this.data.Milestone).tasks.push(node.label);
    } else {
      this.TempMilestoneAllTasks.push({ type: originalType, milestone: this.data.Milestone, tasks: [node.label] });
    }
    this.nodes = [...this.nodes];
  }

  loadLinks(event, links) {
    const preTasks = event.PrevTasks !== undefined && event.PrevTasks !== null ? event.PrevTasks.split(';') : [];
    const nextTasks = event.NextTasks !== undefined && event.NextTasks !== null ? event.NextTasks.split(';') : [];

    const nodes = this.nodes;

    const currentNode = nodes.find(e => e.label === event.TaskName);
    preTasks.forEach(element => {
      const prevNode = nodes.find(e => e.label === element);
      if (prevNode) {
        links.push({
          source: prevNode.id,
          target: currentNode.id
        });
      }
    });
    nextTasks.forEach(element => {
      const nextNode = nodes.find(e => e.label === element);
      if (nextNode) {
        links.push({
          source: currentNode.id,
          target: nextNode.id
        });
      }
    });

    const resArr = [];
    if (nodes.length > 1) {
      links.filter((item) => {
        const i = resArr.findIndex(x => (x.source === item.source && x.target === item.target));
        if (i <= -1) {
          resArr.push({ source: item.source, target: item.target });
        }
        return null;
      });

      links = resArr.splice(0);
    } else {
      links = [];
    }
    return links;
  }


  getMaxNodeID() {
    let itemID = 0;
    const outerHtmlElement: any = document.querySelector('.taskDropArea .ngx-charts .nodes');
    const nodeChildren = outerHtmlElement.children;
    // tslint:disable-next-line: prefer-for-of
    for (let count = 0; count < nodeChildren.length; count++) {
      const element = nodeChildren[count];
      // tslint:disable-next-line: radix
      const nodeId = parseInt(element.getAttribute('id'));
      if (nodeId > itemID) {
        itemID = nodeId;
      }
    }
    return itemID;
  }

  generatePathMatrix() {
    const links = this.links;
    const outerHtmlElementLinks: any = document.querySelector('.taskDropArea .ngx-charts .links');
    const arrLinksCoord = [];
    let counter = 0;
    const linksSVG = outerHtmlElementLinks.children;
    const linksLength = linksSVG.length;
    for (let count = 0; count < linksLength; count++) {
      const element: any = linksSVG[count];
      const coord = element.getBoundingClientRect();
      const linkLocation = links[counter];
      counter++;
      coord.element = element;
      coord.source = linkLocation.source;
      coord.target = linkLocation.target;
      arrLinksCoord.push(coord);
    }

    return arrLinksCoord;
  }


  GraphResize() {

    this.grapLoading = true;
    setTimeout(() => {
      const uiDialog: any = document.querySelector('.ui-dialog-content');
      const milestoneAreaWidth: any = document.querySelector('.taskDropArea');
      this.minWidth = milestoneAreaWidth.clientWidth;
      this.taskMaxHeight = uiDialog.clientHeight - milestoneAreaWidth.offsetTop - 60;

      const outerHtmlElement: any = document.querySelector('.taskDropArea .ngx-charts .nodes');
      const outerHtmlElementLinks: any = document.querySelector('.taskDropArea .ngx-charts .links');
      let nodeWidth = Math.ceil(outerHtmlElement.getBBox().width);
      const nodeLinksWidth = Math.ceil(outerHtmlElementLinks.getBBox().width);
      nodeWidth = nodeWidth > nodeLinksWidth ? nodeWidth : nodeLinksWidth;
      let nodeHeight = Math.ceil(outerHtmlElement.getBBox().height);
      const nodeLinksHeight = Math.ceil(outerHtmlElementLinks.getBBox().height);
      nodeHeight = nodeHeight > nodeLinksHeight ? nodeHeight : nodeLinksHeight;


      if (nodeWidth > this.minWidth) {
        this.taskWidth = nodeWidth + 150;
        // changeTaskGraph = true;
      } else {
        this.taskWidth = this.minWidth;
      }
      if (nodeHeight > this.taskMaxHeight) {
        this.taskHeight = nodeHeight + 200;
        // changeTaskGraph = true;
      } else {
        if (nodeHeight < this.minHeight) {
          this.taskHeight = this.minHeight;
        } else {
          this.taskHeight = nodeHeight + 200;
        }
      }

      this.grapLoading = false;
      this.moveToScrollView();

    }, 500);
  }

  moveToScrollView() {
    if (this.recentEventNode) {
      setTimeout(() => {

        const nodeKey = '.taskDropArea g[id="' + this.recentEventNode + '"]';

        const getNode: any = document.querySelector(nodeKey);
        if (getNode) {
          getNode.scrollIntoViewIfNeeded();
        }
        this.recentEventNode = undefined;
      }, 500);
    }
  }

  // ********************************************************************************************************
  // To Remove Link from tasks
  // *********************************************************************************************************
  RemoveLink(event) {
    this.previousSource = this.nodes.find(e => e.id === event.source);
    this.recentEventNode = this.previousSource.id;
    const RemoveLinkindex = this.links.indexOf(this.links.find(c => c.source === event.source && c.target === event.target));
    this.links.splice(RemoveLinkindex, 1);
    this.links = [... this.links];
    this.GraphResize();
  }

  ReloadGraph() {
    this.GraphResize();
  }

  EnableZoom(bVal) {
    this.enableZoom = bVal;
  }

  EnablePaan(bVal) {
    this.enablePaan = bVal;
  }

  ChangeOrientation() {
    this.tasksHoritontal = this.tasksHoritontal ? false : true;
    this.GraphResize();
  }

  // **************************************************************************************************
  // To  link   task
  // *************************************************************************************************

  ontaskClick(node) {

    if (this.taskDown != null) {
      if (this.taskDown !== node) {
        this.taskUp = node;
        this.recentEventNode = node.id;
        const link = {
          // tslint:disable-next-line: radix
          source: (parseInt(this.taskDown.id)).toString(),
          // tslint:disable-next-line: radix
          target: (parseInt(this.taskUp.id)).toString(),
        };

        this.links.push(link);
      } else {

        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Start and end node cant be same.',false);
      }
      this.taskDown.color = '#e2e2e2';
      if (this.taskUp !== null) {
        this.taskUp.color = '#e2e2e2';
      }
      this.previousSource = this.taskUp;
      this.taskUp = null;
      this.taskDown = null;
      this.links = [...this.links];
      this.GraphResize();
    } else {

      this.NodePosition();
      node.color = '#d26767';
      this.taskDown = node;
      this.previousSource = this.taskDown;
    }
  }


  // **************************************************************************************************
  // To  Remove   task
  // *************************************************************************************************

  RemoveNode(event, node) {

    if (this.nodes.length > 1) {
      const index = this.nodes.indexOf(this.nodes.find(c => c.label === node.label && c.id === node.id));
      if (index > -1) {
        const source = this.links.filter(c => c.target === node.id).map(c => c.source);
        this.nodes.splice(index, 1);
        this.nodeOrder.splice(this.nodeOrder.indexOf(node.id), 1);
        const RemoveLinks = this.links.filter(c => c.source === node.id || c.target === node.id);
        if (this.links.find(c => c.source === node.id) !== undefined && this.links.find(c => c.target === node.id) !== undefined) {

          const target = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
          if (target.length > 0) {
            target.forEach(element => {
              const link = {
                source: this.links.find(c => c.target === node.id).source,
                target: element,
              };
              this.links.push(link);
            });
          }
        }
        this.links = this.links.filter(value => !RemoveLinks.includes(value));
        this.links = [... this.links];

        this.commonService.showToastrMessage(this.constants.MessageType.info,'Task Deleted',false);
        if (RemoveLinks.filter(c => c.source === node.id).length > 0) {
          this.previousSource = RemoveLinks.filter(c => c.source === node.id).map(c => c.target);
          if (this.links.filter(c => this.previousSource.includes(c.source)).length > 0) {
            this.previousSource = undefined;
          } else {
            this.previousSource = this.nodes.find(e => e.id === this.previousSource[0]);
          }
        } else {
          this.previousSource = this.nodes.find(e => e.id === source[0]);
        }
      }
      this.nodes = [...  this.nodes];
      this.links = [...  this.links];
      event.preventDefault();
      this.GraphResize();
    } else {

      this.commonService.showToastrMessage(this.constants.MessageType.warn,'Task can  not be deleted',false);
      event.preventDefault();
    }

  }


  ErrorMessage(event, type) {
    this.commonService.showToastrMessage(this.constants.MessageType.warn,type + ' can  not be deleted',false);
    event.preventDefault();
  }

  SaveGraph() {
    let errorM = 0;
    let circularPresent = false;

    if (this.links.length > 0) {
      this.links.forEach(link => {
        if (circularPresent === false) {
          const currentPath = link.source;
          const target = link.target;
          circularPresent = this.getNextTarget(link.source, target, currentPath, circularPresent);
        }
      });
      if (circularPresent) {
        errorM++;

        this.commonService.showToastrMessage(this.constants.MessageType.warn,'Circular links present. Please delete the circular links.',false);
        return false;
      }
    }

    let sourceArray = this.links.length > 0 ? this.links.map(c => c.source) : [];
    const NodeIds = this.nodes.map(c => c.id);
    sourceArray = NodeIds.filter((el) => !sourceArray.includes(el));

    if (sourceArray.length > 1 || (this.links.length === 0 && this.nodes.length > 1)) {

      const message = 'There are multiple end tasks for current slot. Are you sure that you want to continue?';
      this.commonService.confirmMessageDialog('Confirmation', message, null, ['Yes', 'No'], false).then(async Confirmation => {
        if (Confirmation === 'Yes') {
          this.NodePosition();
          this.nodes.sort((a, b) => {
            return parseInt(a.left, 10) - parseInt(b.left, 10);
          });
          const obj = {
            nodes: this.nodes,
            links: this.links,
            nodeOrder: this.nodeOrder,
            dbSlots: this.response
          };
          this.data.MilestoneAllTasks = JSON.parse(JSON.stringify(this.TempMilestoneAllTasks));
          this.ref.close(obj);
        }
      });
    } else {
      if (errorM <= 0) {

        this.NodePosition();

        this.nodes.sort((a, b) => {
          return parseInt(a.left, 10) - parseInt(b.left, 10);
        });
        const obj = {
          nodes: this.nodes,
          links: this.links,
          nodeOrder: this.nodeOrder,
          dbSlots: this.response
        };
        this.data.MilestoneAllTasks = JSON.parse(JSON.stringify(this.TempMilestoneAllTasks));
        this.ref.close(obj);
      }
    }
  }

  getNextTarget(source, target, currentPath, circularPresent) {

    currentPath = currentPath + ',' + target;

    const TargetLinks = this.links.filter(c => c.source === target).map(c => c.target);

    const allPaths = currentPath.split(',');
    let newTargets = allPaths.slice(0);
    newTargets = newTargets.filter((el, i, a) => i === a.indexOf(el));
    if (newTargets.length !== allPaths.length) {
      circularPresent = true;
    }
    TargetLinks.forEach(newTarget => {
      if (circularPresent === false) {
        circularPresent = this.getNextTarget(source, newTarget, currentPath, circularPresent);
      }
    });

    return circularPresent;
  }

}
