import { Component, OnInit, ViewChild, ElementRef, OnChanges, Input, NgZone } from '@angular/core';
import { gantt, Gantt } from '../../dhtmlx-gantt/codebase/source/dhtmlxgantt';
// import { gantt, Gantt } from '../../dhtmlx-gantt/codebase/dhtmlxganttmin';
import '../../dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip';
import '../../dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker';

import '../../dhtmlx-gantt/codebase/ext/api';

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
  isTableHidden: boolean;
  user = "AssignedTo";
  key = "key";
  label = "label";
  resource = [];
  tasks = {};

  constructor() { }

  ngOnInit() {

  }

  onLoad(data, resource) {

    var zoomConfig = {
      levels: [
        {
          name: "0",
          scale_height: 75,
          min_column_width: 60,
          scales: [
            { unit: "day", step: 1, format: "%j %F, %l" },
            { unit: "hour", step: 1, format: "%g %a" },
            { unit: "minute", step: 30, format: "%i" }
          ],
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
          scale_height: 60,
          min_column_width: 90,
          scales: [
            { unit: "year", step: 1, format: "%Y" },
            {
              unit: "quarter", step: 1, format: function quarterLabel(date) {
                var month = date.getMonth();
                var q_num;

                if (month >= 9) {
                  q_num = 4;
                } else if (month >= 6) {
                  q_num = 3;
                } else if (month >= 3) {
                  q_num = 2;
                } else {
                  q_num = 1;
                }

                return "Q" + q_num;
              }
            },
            { unit: "month", step: 1, format: "%M" }
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

    var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
    var today = new Date();
    gantt.addMarker({
      start_date: today,
      css: "today",
      text: "Today",
      title: "Today: " + date_to_str(today)
    });



    function calculateResourceLoad(tasks, scale) {
      var step = scale.unit;
      var timegrid = {};

      for (let i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (task.duration > 0) {
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
      var tasks = gantt.getTaskBy("AssignedTo", resource.id);
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

    var mainGridConfig = {
      columns: [
        { name: "text", label: 'Task name', tree: true, width: 250 },
        {
          name: "user", label: "Resource", width: 150, template: function (task) {
            if (!task.user) return "";
            return task.user
          }
        },
        { name: "budgetHours", label: 'B Hrs', width: 50 },
        { name: "spentTime", label: 'S Hrs', width: 50 },
        { name: "ganttOverlay", align: 'right', width: 35 },
        { name: "ganttMenu", align: 'right', width: 45 }
        // {name: "buttons" ,align: 'right' , width: 75,template: colContent}
        // { name: "start_date", width: 150 },
        // { name: "end_date", width: 150 },
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
            var tasks = gantt.getTaskBy("AssignedTo", resource.id);
            var totalDuration = 0;
            tasks.forEach(function (task) {
              totalDuration += task.duration;
            });

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
            { view: "grid", group: "grids", config: mainGridConfig, scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollVer", group: "vertical" }
          ]
        },
        { view: "scrollbar", id: "scrollHor" }
      ]
    };

    this.resourcePanelConfig = {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", group: "grids", config: mainGridConfig, scrollY: "scrollVer" },
            { view: "timeline", id: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollVer", group: "vertical" }
          ]
        },
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


    var tasksStore = gantt.getDatastore("task");
    tasksStore.attachEvent("onStoreUpdated", function (id, item, mode) {
      resourcesStore.refresh();
    });

    function getResource(task) {
      if (!task.user) return "";
      return task.user
    }


    gantt.templates.tooltip_text = function (start, end, task) {
      gantt.templates.tooltip_date_format = task.type == 'milestone' || task.type == 'submilestone' ? gantt.date.date_to_str("%d-%M-%Y") : gantt.date.date_to_str("%d-%M-%Y %h:%i %A");

      this.singleTask = task
      return "<h3>" + task.title + "</h3>" +
        "<b>Start date:</b> " + gantt.templates.tooltip_date_format(task.start_date) +
        "<br/><b>End date:</b> " + gantt.templates.tooltip_date_format(task.end_date) +
        "<br/><b>Resource start date:</b> " + gantt.templates.tooltip_date_format(new Date(task.pUserStart)) +
        "<br/><b>Resource end date:</b> " + gantt.templates.tooltip_date_format(new Date(task.pUserEnd)) +
        "<br/><b>Duration:</b> " + gantt.calculateDuration(task) + "<br/><b>Status:</b> " + task.status +
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

    });


    gantt.templates.task_class = function (start, end, task) {
      if (task.status == gantt.config.types.meeting) {
        return "meeting_task";
      }
      else if (task.status == gantt.config.types.planned || task.status == gantt.config.types.notsaved) {
        return "planned_task";
      }
      else if (task.status == gantt.config.types.notstarted) {
        return "notstarted_task";
      }
      else if (task.status == gantt.config.types.inprogress) {
        return "inprogress_task";
      }
      else if (task.status == gantt.config.types.completed) {
        return "completed_task";
      }
      else if (task.status == gantt.config.types.autoclosed) {
        return "autoclosed_task";
      }
      else if (task.status == gantt.config.types.onhold) {
        return "onhold_task";
      }
      return "";
    }

    resourcesStore.parse(resource);

    gantt.config.layout = this.gridConfig;

    gantt.config.fit_tasks = true;

    this.ganttParseObject = data;

    gantt.config.skip_off_time = true;

    gantt.config.show_progress = false;

    gantt.config.smart_scales = true;


    gantt.ignore_time = function (date) {
      if (date.getDay() == 0 || date.getDay() == 6)
        return true;
    };



    gantt.init(this.ganttContainer.nativeElement)
    gantt.config.branch_loading = true;
    gantt.parse(data);

  }


  setScaleConfig(value) {
    // this.showLoader();
    gantt.ext.zoom.setLevel(value);
    setTimeout(() => {
      gantt.init(this.ganttContainer.nativeElement);
      gantt.parse(this.ganttParseObject);
      // this.showTable();
    }, 300);
  }

  showResourceView() {
    gantt._groups.group_tasks(gantt, this.resource, this.user, this.key, this.label)
  }

  showProjectView() {
    gantt.parse(this.ganttParseObject);
  }

  zoomIn() {
    gantt.ext.zoom.zoomIn();
    if (gantt.ext.zoom.getCurrentLevel() === 0) {
      // this.showLoader();
      gantt.init(this.ganttContainer.nativeElement);
      setTimeout(() => {
        gantt.parse(this.ganttParseObject);
        // this.showTable();
      }, 300);
    }
  }

  zoomOut() {
    gantt.ext.zoom.zoomOut();
    if (gantt.ext.zoom.getCurrentLevel() >= 1 && gantt.ext.zoom.getCurrentLevel() <= 5) {
      // this.showLoader();
      setTimeout(() => {
        gantt.init(this.ganttContainer.nativeElement)
        gantt.parse(this.ganttParseObject);
        // this.showTable();
      }, 300);
    }
  }
}
