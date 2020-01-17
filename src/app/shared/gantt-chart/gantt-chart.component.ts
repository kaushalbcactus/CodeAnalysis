import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input } from '@angular/core';
import { gantt, Gantt } from '../../dhtmlx-gantt/codebase/source/dhtmlxgantt';
import '../../dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip';

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.css']
})
export class GanttChartComponent implements OnInit {
  @ViewChild('ganttchart', { static: true }) ganttContainer: ElementRef;
  resourcePanelConfig: any;
  gridConfig: any;
  ganttParseObject = {};
  isLoaderHidden: any;
  constructor() { }

  user = "res_id" //"user"
  key = "key"
  label = "label"
  resource = []

  // tasks = {
  //   "data": [
  //     {
  //       "id": "10", "text": "Pre Kick-Off", "start_date": new Date("2019-12-05 00:00:00"), "end_date": new Date("2019-12-16 11:00:00")
  //       , "order": 10, "progress": 0.4, "type": gantt.config.types.completed, "user": 2, 'b_hrs': 3.5, 's_hrs': 1.0
  //     },
  //     { "id": "1", "text": "Write", "start_date": new Date("2019-12-05 09:00:00"), "end_date": new Date("2019-12-05 19:15:00"), "order": 10, "progress": 0.6, "type": gantt.config.types.onhold, "parent": "10", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 0 },

  //     { "id": "2", "text": "Edit Slot", "start_date": new Date("2019-12-06 09:15:00"), "end_date": new Date("2019-12-11 17:15:00"), "order": 20, "progress": 0.6, "type": gantt.config.types.onhold, "parent": "10", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 3 },
  //     { "id": "20", "text": "Edit", "start_date": new Date("2019-12-05 09:15:00"), "end_date": new Date("2019-12-05 17:15:00"), "order": 10, "progress": 0.4, "type": gantt.config.types.onhold, "parent": "2", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 1 },
  //     { "id": "3", "text": "Review-Edit", "start_date": new Date("2019-12-09 09:15:00"), "end_date": new Date("2019-12-09 17:15:00"), "order": 10, "progress": 0.6, "type": gantt.config.types.onhold, "parent": "2", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 1 },
  //     { "id": "4", "text": "Inco-Edit", "start_date": new Date("2019-12-11 09:15:00"), "end_date": new Date("2019-12-11 17:15:00"), "order": 20, "progress": 0.6, "type": gantt.config.types.onhold, "parent": "2", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 0 },
  //     { "id": "6", "text": "Abc", "start_date": new Date("2019-12-05 09:15:00"), "end_date": new Date("2019-12-05 17:15:00"), "order": 10, "progress": 0.4, "type": gantt.config.types.onhold, "parent": "20", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 1 },

  //     { "id": "5", "text": "Data Vision", "start_date": new Date("2019-12-11 17:15:00"), "end_date": new Date("2019-12-12 15:00:00"), "duration": 0, "order": 10, "progress": 0.6, "type": gantt.config.types.onhold, "parent": "10", 'b_hrs': 0.0, 's_hrs': 0.0, "user": 3 },
  //   ],
  //   "links": [
  //     { "id": 10, "source": 1, "target": 2, "type": "1" },
  //     { "id": 2, "source": 2, "target": 5, "type": "0" },
  //     { "id": 3, "source": 3, "target": 4, "type": "0" },
  //     { "id": 4, "source": 4, "target": 6, "type": "2" }
  //   ],
  // };
  tasks: any

  ngOnInit() {
    this.isLoaderHidden = false;

    gantt.serverList("res_id", this.resource);

    var zoomConfig = {
      levels: [
        {
          name: "0",
          scale_height: 75,
          min_column_width: 60,
          scales: [
            { unit: "day", step: 1, format: "%j %F, %l" },
            { unit: "hour", step: 1, format: "%g %a" },
            { unit: "minute", step: 15, format: "%i" }
          ],
          // date_scale: "%j %F, %l",
          // duration_unit: "minute",
          // duration_step: 60,
        },
        {
          name: "1",
          scale_height: 27,
          min_column_width: 80,
          scales: [
            { unit: "day", step: 1, format: "%d %M" }
          ]
        },
        {
          name: "2",
          scale_height: 50,
          min_column_width: 50,
          scales: [
            {
              unit: "week", step: 1, format: function (date) {
                var dateToStr = gantt.date.date_to_str("%d %M");
                var endDate = gantt.date.add(date, -6, "day");
                var weekNum = gantt.date.date_to_str("%W")(date);
                return "#" + weekNum + ", " + dateToStr(date) + " - " + dateToStr(endDate);
              }
            },
            { unit: "day", step: 1, format: "%j %D" }
          ]
        },
        {
          name: "3",
          scale_height: 50,
          min_column_width: 120,
          scales: [
            { unit: "month", format: "%F, %Y" },
            { unit: "week", format: "Week #%W" }
          ]
        },
        {
          name: "4",
          height: 50,
          min_column_width: 90,
          scales: [
            { unit: "month", step: 1, format: "%M" },
            {
              unit: "quarter", step: 1, format: function (date) {
                var dateToStr = gantt.date.date_to_str("%M");
                var endDate = gantt.date.add(gantt.date.add(date, 3, "month"), -1, "day");
                return dateToStr(date) + " - " + dateToStr(endDate);
              }
            }
          ]
        },
        {
          name: "5",
          scale_height: 50,
          min_column_width: 30,
          scales: [
            { unit: "year", step: 1, format: "%Y" }
          ]
        }
      ]
    };

    gantt.ext.zoom.init(zoomConfig);

    function calculateResourceLoad(tasks, scale) {
      var step = scale.unit;
      var timegrid = {};

      for (let i = 0; i < tasks.length; i++) {
        var task = tasks[i];

        var currDate = gantt.date[step + "_start"](new Date(task.start_date));

        while (currDate < task.end_date) {

          var date = currDate;
          currDate = gantt.date.add(currDate, 1, step);

          if (!gantt.isWorkTime({ date: date, task: task })) {
            continue;
          }

          var timestamp = date.valueOf();
          if (!timegrid[timestamp])
            timegrid[timestamp] = 0;

          timegrid[timestamp] += 8;
        }
      }

      var timetable = [];
      var start, end;
      let i: any
      for (i in timegrid) {
        start = new Date(i * 1);
        end = gantt.date.add(start, 1, step);
        timetable.push({
          start_date: start,
          end_date: end,
          value: timegrid[i]
        });
      }

      return timetable;
    }


    var renderResourceLine = function (resource, timeline) {
      var tasks = gantt.getTaskBy("res_id", resource.id);
      var timetable = calculateResourceLoad(tasks, timeline.getScale());

      var row = document.createElement("div");

      for (var i = 0; i < timetable.length; i++) {

        var day = timetable[i];

        var css = "";
        if (day.value <= 8) {
          css = "gantt_resource_marker gantt_resource_marker_ok";
        } else {
          css = "gantt_resource_marker gantt_resource_marker_overtime";
        }

        var sizes = timeline.getItemPosition(resource, day.start_date, day.end_date);
        var el = document.createElement('div');
        el.className = css;

        el.style.cssText = [
          'left:' + sizes.left + 'px',
          'width:' + sizes.width + 'px',
          'position:absolute',
          'height:' + (gantt.config.row_height - 1) + 'px',
          'line-height:' + sizes.height + 'px',
          'top:' + sizes.top + 'px'
        ].join(";");

        el.innerHTML = day.value;
        row.appendChild(el);
      }
      return row;
    };

    var resourceLayers = [
      renderResourceLine,
      "taskBg"
    ];

    function byId(list, id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].key == id)
          return list[i].label || "";
      }
      return "";
    }

    var mainGridConfig = {
      columns: [
        { name: "text", tree: true, width: 150, resize: true },
        {
          name: "owner", width: 150, label: "Owner", template: function (task) {
            if (!task.user) return "";
            return task.user
            
            //return byId(gantt.serverList('user'), task.user)
            //return getResource(task);
          }
        },
        { name: "start_date", width: 150 , resize: true },
        { name: "end_date" , width: 150},
      ]
    };

    var resourceGridConfig = {
      columns: [
        {
          name: "name", label: "Name", template: function (resource) {
            return resource.label;
          }
        },
        {
          name: "workload", label: "Workload", template: function (resource) {
            var tasks = gantt.getTaskBy("res_id", resource.id);

            var totalDuration = 0;
            for (var i = 0; i < tasks.length; i++) {
              totalDuration += tasks[i].duration;
            }

            return (totalDuration || 0) * 8 + "h";
          }
        }
      ]
    };


    this.gridConfig = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", group: "grids", config: mainGridConfig, scrollY: "scrollVer" },
            { resizer: true, width: 1, group: "vertical" },
            { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollVer", group: "vertical" }
          ]
        },
        { resizer: true, width: 1 },
        { view: "scrollbar", id: "scrollHor" }
      ]
    };

    this.resourcePanelConfig = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", group: "grids", config: mainGridConfig, scrollY: "scrollVer" },
            { resizer: true, width: 1, group: "vertical" },
            { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollVer", group: "vertical" }
          ]
        },
        { resizer: true, width: 1 },

        {
          cols: [
            {
              view: "grid",
              id: "resourceGrid",
              group: "grids",
              bind: "resources",
              config: resourceGridConfig,
              scrollY: "resourceVScroll"
            },
            { resizer: true, width: 1, group: "vertical" },
            {
              view: "timeline",
              id: "resourceTimeline",
              bind: "resources",
              bindLinks: null,
              layers: resourceLayers,
              scrollX: "scrollHor",
              scrollY: "resourceVScroll"
            },
            { view: "scrollbar", id: "resourceVScroll", group: "vertical" }
          ]
        },
        { view: "scrollbar", id: "scrollHor" }
      ]
    }

    var resourcesStore: any = gantt.createDatastore({
      name: "resources",
      // type: 'treeDatastore',
      initItem: function (item) {
        item.id = item.key || gantt.uid();
        return item;
      }
    });

    gantt.templates.resource_cell_class = function (start_date, end_date, resource, tasks) {
      var css = [];
      css.push("resource_marker");
      if (tasks.length <= 1) {
        css.push("workday_ok");
      } else {
        css.push("workday_over");
      }
      return css.join(" ");
    };

    gantt.templates.resource_cell_value = function (start_date, end_date, resource, tasks) {
      // return "<div>" + tasks.length * 8 + "</div>";
    };

    var tasksStore = gantt.getDatastore("task");
    tasksStore.attachEvent("onStoreUpdated", function (id, item, mode) {
      resourcesStore.refresh();
    });

    gantt.templates.tooltip_text = function (start, end, task) {
      gantt.templates.tooltip_date_format = gantt.date.date_to_str("%d-%M-%Y %h:%i %A");
      this.singleTask = task
      return "<h2>" + task.text + "</h2>" +
        "<b>Start date:</b> " +
        gantt.templates.tooltip_date_format(task.start_date) +
        "<br/><b>End date:</b> " + gantt.templates.tooltip_date_format(task.end_date) +
        "<br/><b>Duration:</b> " + gantt.calculateDuration(task) + "<br/><b>Status:</b> " + getTaskType(task) +
        "<br/><b>Resource:</b> " + getResource(task) + "<br/><b>Budget Hrs:</b> " + task.budgetHours +
        "<br/><b>Spent Hrs:</b> " + task.spentTime;
    }

    var tooltips = gantt.ext.tooltips;

    gantt.attachEvent("onGanttReady", function () {
    tooltips.tooltipFor({
      selector: ".gantt_row_project",
      html: function (event, node) {
          return false;
      }
    });

    tooltips.tooltipFor({
      selector: ".gantt_project",
      html: function (event, node) {
          return false;
      }
    });

    // tooltips.tooltipFor({
    //   selector: ".gantt_resource_marker",
    //   html: function (event, node) {
    //     var dataElement = node.querySelector("[data-recource-tasks]");
    //     var ids = JSON.parse(dataElement.getAttribute("data-recource-tasks"));

    //     var date = gantt.templates.xml_date(dataElement.getAttribute("data-cell-date"));
    //     var resourceId = dataElement.getAttribute("data-resource-id");

    //     var relativePosition = gantt.utils.dom.getRelativeEventPosition(event, gantt.$task_scale);

    //     var store = gantt.getDatastore("resource");

    //     var html = [
    //       "<b>" + store.getItem(resourceId).text + "</b>" + ", " + gantt.templates.tooltip_date_format(date),
    //       "",
    //       ids.map(function (id, index) {
    //         var task = gantt.getTask(id);
    //         var assignenment = gantt.getResourceAssignments(resourceId, task.id);
    //         var amount = "";
    //         var taskIndex = (index + 1);
    //         if (assignenment[0]) {
    //           amount = " (" + assignenment[0].value + "h) ";
    //         }
    //         return "Task #" + taskIndex + ": " + amount + task.text;
    //       }).join("<br>")
    //     ].join("<br>");

    //     return html;
    //   }
    // });

  });
    function getResource(task) {
      if (!task.user) return "";
      return task.user
      var store = gantt.getDatastore("resources");
      var owner = store.getItem(task.user);
      var owners = [];
      if (owner) {
        return owner.label;
      } else {
        return "Unassigned";
      }
    }


    function getTaskType(task) {
      if (task.type == gantt.config.types.meeting) {
        return "Meeting";
      }
      else if (task.type == gantt.config.types.planned) {
        return "Planned";
      }
      else if (task.type == gantt.config.types.notstarted) {
        return "Not Started";
      }
      else if (task.type == gantt.config.types.inprogress) {
        return "In Progress";
      }
      else if (task.type == gantt.config.types.completed) {
        return "Completed";
      }
      else if (task.type == gantt.config.types.autoclosed) {
        return "Auto Closed";
      }
      else if (task.type == gantt.config.types.onhold) {
        return "On Hold";
      }
    }

    gantt.templates.task_class = function (start, end, task) {
      if(task.type == gantt.config.types.meeting){
          return "meeting_task";
      }
      else if(task.type == gantt.config.types.planned){
          return "planned_task";
      }
      else if(task.type == gantt.config.types.notstarted){
          return "notstarted_task";
      }
      else if(task.type == gantt.config.types.inprogress){
          return "inprogress_task";
      }
      else if(task.type == gantt.config.types.completed){
          return "completed_task";
      }
      else if(task.type == gantt.config.types.autoclosed){
          return "autoclosed_task";
      }
      else if(task.type == gantt.config.types.onhold){
          return "onhold_task";
      }
    return "";
    }

    resourcesStore.parse(this.resource);

    this.ganttParseObject = this.tasks;
    gantt.config.sort = true;

    this.setScaleConfig('0');
    gantt.init(this.ganttContainer.nativeElement)
    gantt.parse(this.ganttParseObject)   

    gantt.attachEvent("onTaskDrag", function(id, mode, task, original){
      console.log(id, mode, task, original)
    });

  }

  setScaleConfig(value) {
    this.isLoaderHidden = false;
    if (value == '0') {
      gantt.config.layout = this.gridConfig;
    } else {
      gantt.config.layout = this.resourcePanelConfig;
    }
    gantt.ext.zoom.setLevel(value);
    setTimeout(() => {
      gantt.config.sort = true;
      gantt.init(this.ganttContainer.nativeElement)
      gantt.parse(this.ganttParseObject);
      this.isLoaderHidden = true;
    }, 1000);
  }

  showResourceView() {
    gantt._groups.group_tasks(gantt, this.resource, this.user, this.key, this.label)
  }

  showProjectView() {
    gantt.parse(this.ganttParseObject);
  }

  zoomIn() {
    gantt.ext.zoom.zoomIn();
    if (gantt.ext.zoom.getCurrentLevel() == 0) {
      this.isLoaderHidden = false;
      gantt.config.layout = this.gridConfig;
      gantt.config.sort = true;
      gantt.init(this.ganttContainer.nativeElement)
      setTimeout(() => {
        gantt.parse(this.ganttParseObject);
        this.isLoaderHidden = true;
      }, 1000);
    }
  }

  zoomOut() {
    gantt.ext.zoom.zoomOut();
    if (gantt.ext.zoom.getCurrentLevel() >= 1 && gantt.ext.zoom.getCurrentLevel() <= 5) {
      this.isLoaderHidden = false;
      gantt.config.layout = this.resourcePanelConfig;
      setTimeout(() => {
        gantt.config.sort = true;
        gantt.init(this.ganttContainer.nativeElement)
        gantt.parse(this.ganttParseObject);
        this.isLoaderHidden = true;
      }, 1000);
    }
  }

  

}
