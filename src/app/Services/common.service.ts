import { Injectable } from '@angular/core';
import { GlobalService } from './global.service';
import { TaskAllocationConstantsService } from '../task-allocation/services/task-allocation-constants.service';
import { SPOperationService } from './spoperation.service';
import { ConstantsService } from './constants.service';
import { PmconstantService } from '../projectmanagement/services/pmconstant.service';
import { PMObjectService } from '../projectmanagement/services/pmobject.service';
import { DatePipe } from '@angular/common';
import { Table, DialogService } from 'primeng';
import { FileUploadProgressDialogComponent } from '../shared/file-upload-progress-dialog/file-upload-progress-dialog.component';
declare var $;

declare const newrelic;
@Injectable({
    providedIn: 'root'
})

// tslint:disable
export class CommonService {
    response;
    public queryConfig = {
        data: null,
        url: '',
        type: '',
        listName: ''
    };
    batchContents = new Array();
    public sharedTaskAllocateObj = this.sharedObject.oTaskAllocation;
    public tableObj: any;
    constructor(private pmObject: PMObjectService,
        private spServices: SPOperationService,
        private constants: ConstantsService,
        private pmConstant: PmconstantService, public sharedObject: GlobalService,
        public taskAllocationService: TaskAllocationConstantsService,
        private datePipe: DatePipe,
        public common: CommonService,
        public dialogService: DialogService
    ) { }

    tableToExcel = (function () {
        const uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
                'xmlns:x="urn:schemas-microsoft-com:office:excel"' +
                'xmlns="http://www.w3.org/TR/REC-html40">' +
                '<head><!--[if gte mso 9]>' +
                '<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name>' +
                '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets>' +
                '</x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
            , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
            , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };

        return function (table, name) {
            if (!table.nodeType) {
                table = document.getElementById(table);
            }
            const ctx = { worksheet: name || 'Worksheet', table: table.innerHTML };
            const link = document.createElement('a');
            link.href = uri + base64(format(template, ctx));
            link.download = name || 'Workbook.xls';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    })();

    getMonthName(date: Date): string {
        const d = new Date(date);
        const month = new Array();
        month[0] = 'January';
        month[1] = 'February';
        month[2] = 'March';
        month[3] = 'April';
        month[4] = 'May';
        month[5] = 'June';
        month[6] = 'July';
        month[7] = 'August';
        month[8] = 'September';
        month[9] = 'October';
        month[10] = 'November';
        month[11] = 'December';
        return month[d.getMonth()];
    }

    getQuarterDates(yearSelected, quarter) {
        const year = yearSelected;
        const monthStart = (quarter - 1) * 3;
        const monthEnd = (quarter * 3);
        const fromDate = new Date(new Date(year, monthStart, 1).setHours(0, 0, 0, 1));
        const toDate = new Date(new Date(year, monthEnd, 0).setHours(23, 59, 59, 0));
        return ({ fromDate: fromDate, toDate: toDate });
    }

    getQuartersByYear(year) {
        let counter = 1;
        const quarters = [];
        const months = Number.isInteger(new Date().getMonth()) ? new Date().getMonth() + 1 : new Date().getMonth();
        const Quarters = year.Year === 'Current' ? Math.ceil(months / 3) : 4;
        while (counter <= Quarters) {
            quarters.push({ label: 'Quarter ' + counter, value: counter });
            counter = counter + 1;
        }
        return quarters;
    }

    getYearDates(year) {
        const fromDate = new Date(new Date(year.value ? year.value : year, 0, 1).setHours(0, 0, 0, 1));
        const toDate = new Date(new Date(year.value ? year.value : year, 12, 0).setHours(23, 59, 59, 0));
        return ({ fromDate: fromDate, toDate: toDate });
    }

    getLastWorkingDay(days, date) {
        var tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        while (days > 0) {
            tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
            if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
                days -= 1;
            }
        }
        return tempDate;
    }

    getNextWorkingDay(days, date) {
        var tempDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        let counter = 0;
        while (counter < days) {
            tempDate = new Date(tempDate.setDate(tempDate.getDate() + 1));
            if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
                counter += 1;
            }
        }
        return tempDate;
    }


    removeFileNameSpecialChar(fileName) {
        //// Check files if it contains special characters
        const sFileName = fileName;
        let sNewFileName = '';
        if (sFileName) {
            sNewFileName = sFileName.replace(/[~#%&*\{\}\\:<>?"+'@/]/gi, '');
        }
        return sNewFileName;
    }

    addDays(lastDate, num) {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + num);
        return new Date(date);
    }
    calcBusinessDate(nextLasts, number) {
        const filterDates = {
            startDate: new Date(),
            endDate: new Date()
        };
        let startDate, endDate = new Date();
        const nextLast = nextLasts;
        const days = number - 1;
        if (nextLast === 'Next') {
            const oCurrent = new Date();
            const oCurrentDay = oCurrent.getDay();
            switch (oCurrentDay) {
                case 5:
                    startDate = this.addDays(oCurrent, 3);
                    break;
                case 6:
                    startDate = this.addDays(oCurrent, 2);
                    break;
                case 0:
                    startDate = this.addDays(oCurrent, 1);
                    break;
                default:
                    startDate = this.addDays(oCurrent, 1);
                    break;
            }

            endDate = startDate;
            // tslint:disable-next-line:no-var-keyword
            for (var nCount = 0; nCount < days; nCount++) {
                if (endDate.getDay() === 5) {
                    endDate = this.addDays(endDate, 3);
                } else if (endDate.getDay() === 6) {
                    endDate = this.addDays(endDate, 2);
                } else if (endDate.getDay() === 0) {
                    endDate = this.addDays(endDate, 1);
                } else {
                    endDate = this.addDays(endDate, 1);
                }
            }

        } else if (nextLast === 'Past') {
            const oCurrent = new Date();
            const oCurrentDay = oCurrent.getDay();
            switch (oCurrentDay) {
                case 6:
                    endDate = this.addDays(oCurrent, -1);
                    break;
                case 0:
                    endDate = this.addDays(oCurrent, -2);
                    break;
                case 1:
                    endDate = this.addDays(oCurrent, -3);
                    break;
                default:
                    endDate = this.addDays(oCurrent, -1);
                    break;
            }
            startDate = endDate;
            // tslint:disable-next-line:no-var-keyword
            for (var nCount = 0; nCount < days; nCount++) {
                if (startDate.getDay() === 1) {
                    startDate = this.addDays(startDate, -3);
                } else if (startDate.getDay() === 0) {
                    startDate = this.addDays(startDate, -2);
                } else if (startDate.getDay() === 6) {
                    startDate = this.addDays(startDate, -1);
                } else {
                    startDate = this.addDays(startDate, -1);
                }
            }
        } else if (nextLast === 'Today') {
            startDate = new Date();
            endDate = new Date();
        }
        filterDates.startDate = startDate;
        filterDates.endDate = endDate;
        return filterDates;
    }

    formatDate(date) {
        // tslint:disable-next-line:prefer-const
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            // tslint:disable-next-line:prefer-const
            year = d.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return [year, month, day].join('-');
    }
    ///////// Refactor code -  Move inside project mgmt
    lazyLoadTask(event, sendToClient, filterColumns, action) {
        this.filterAction(event.sortField, event.sortOrder,
            event.globalFilter, event.filters, event.first, event.rows, sendToClient, filterColumns, action);
    }
    ///////// Refactor code -  Move inside project mgmt
    filterAction(sortField, sortOrder, globalFilter, localFilter, first, rows, sendToClient, filterColumns, action) {
        switch (action) {
            case this.pmConstant.filterAction.ALL_SOW:
                this.pmObject.loading.AllSOW = true;
                break;
            case this.pmConstant.filterAction.ALL_PROJECTS:
                this.pmObject.loading.AllProject = true;
                break;
            case this.pmConstant.filterAction.SEND_TO_CLIENT:
                this.pmObject.loading.SendToClient = true;
                break;
            case this.pmConstant.filterAction.CLIENT_REVIEW:
                this.pmObject.loading.ClientReview = true;
                break;
            case this.pmConstant.filterAction.PENDING_ALLOCATION:
                this.pmObject.loading.PendingAllocation = true;
                break;
            case this.pmConstant.filterAction.INACTIVE_PROJECTS:
                this.pmObject.loading.InactiveProject = true;
                break;
            case this.pmConstant.filterAction.SELECT_SOW:
                this.pmObject.loading.SelectSOW = true;
                break;
            case this.pmConstant.filterAction.ACTIVE_PROJECT:
                this.pmObject.loading.activeProject = true;
                break;
            case this.pmConstant.filterAction.PIPELINE_PROJECT:
                this.pmObject.loading.pipelineProject = true;
                break;
            case this.pmConstant.filterAction.INACTIVE_PROJECT:
                this.pmObject.loading.inActiveProject = true;
                break;
        }
        let data = $.extend(true, [], sendToClient);
        setTimeout(() => {
            if (data) {
                if (sortField) {
                    this.customSort(data, sortField, sortOrder);
                }
                if (globalFilter) {
                    data = data.filter(row => this.globalFilter(row, globalFilter, filterColumns));
                }
                if (!globalFilter && !$.isEmptyObject(localFilter)) {
                    data = data.filter(row => this.filterLocal(row, localFilter));
                }
                const items = data.slice(first, (first + rows));
                switch (action) {
                    case this.pmConstant.filterAction.ALL_SOW:
                        this.pmObject.totalRecords.AllSOW = data.length;
                        this.pmObject.allSOWArrayCopy = items;
                        this.pmObject.loading.AllSOW = false;
                        break;
                    case this.pmConstant.filterAction.ALL_PROJECTS:
                        this.pmObject.totalRecords.AllProject = data.length;
                        this.pmObject.allProjectsArray = items;
                        this.pmObject.loading.AllProject = false;
                        break
                    case this.pmConstant.filterAction.SEND_TO_CLIENT:
                        this.pmObject.totalRecords.SendToClient = data.length;
                        this.pmObject.sendToClientArray_copy = items;
                        this.pmObject.loading.SendToClient = false;
                        this.setIframeHeight();
                        break;
                    case this.pmConstant.filterAction.CLIENT_REVIEW:
                        this.pmObject.totalRecords.ClientReview = data.length;
                        this.pmObject.clientReviewArray_copy = items;
                        this.pmObject.loading.ClientReview = false;
                        this.setIframeHeight();
                        break;
                    case this.pmConstant.filterAction.PENDING_ALLOCATION:
                        this.pmObject.totalRecords.PendingAllocation = data.length;
                        this.pmObject.pendingAllocationArray_copy = items;
                        this.pmObject.loading.PendingAllocation = false;
                        this.setIframeHeight();
                        break;
                    case this.pmConstant.filterAction.INACTIVE_PROJECTS:
                        this.pmObject.totalRecords.InactiveProject = data.length;
                        this.pmObject.inActiveProjectArray_copy = items;
                        this.pmObject.loading.InactiveProject = false;
                        this.setIframeHeight();
                        break;
                    case this.pmConstant.filterAction.SELECT_SOW:
                        this.pmObject.totalRecords.SelectSOW = data.length;
                        this.pmObject.selectSOWArrayCopy = items;
                        this.pmObject.loading.SelectSOW = false;
                        break;
                    case this.pmConstant.filterAction.ACTIVE_PROJECT:
                        this.pmObject.totalRecords.activeProject = data.length;
                        this.pmObject.allProjects.activeProjectCopyArray = items;
                        this.pmObject.loading.activeProject = false;
                        break;
                    case this.pmConstant.filterAction.PIPELINE_PROJECT:
                        this.pmObject.totalRecords.pipelineProject = data.length;
                        this.pmObject.allProjects.pipelineProjectCopyArray = items;
                        this.pmObject.loading.pipelineProject = false;
                        break;
                    case this.pmConstant.filterAction.INACTIVE_PROJECT:
                        this.pmObject.totalRecords.inActiveProject = data.length;
                        this.pmObject.allProjects.inActiveProjectCopyArray = items;
                        this.pmObject.loading.inActiveProject = false;
                        break;
                }
            }
        }, 1000);
    }
    // tslint:disable
    filterLocal(row, filter) {
        let isInFilter = false;
        let noFilter = true;
        for (var columnName in filter) {
            if (row[columnName] == null) {
                return;
            }
            noFilter = false;
            let rowValue: String = row[columnName].toString().toLowerCase();
            let filterMatchMode: String = filter[columnName].matchMode;
            if (filterMatchMode.includes("contains") && rowValue.includes(filter[columnName].value.toLowerCase())) {
                isInFilter = true;
            } else if (filterMatchMode.includes("startsWith") && rowValue.startsWith(filter[columnName].value.toLowerCase())) {
                isInFilter = true;
            } else if (filterMatchMode.includes("in") && filter[columnName].value.includes(row[columnName])) {
                isInFilter = true;
            }
            else
                return false;
        }
        if (noFilter) { isInFilter = true; }
        return isInFilter;
    }
    globalFilter(row, value, filterColumns) {
        for (let i = 0; i < filterColumns.length; i++) {
            let column = filterColumns[i];
            if (row[column.field] == null) {
                continue;
            }
            let rowValue: String = row[column.field].toString().toLowerCase();
            if (rowValue.includes(value.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    customSort(data, fieldName: string, order: number) {
        data.sort((row1, row2) => {
            const val1 = row1[fieldName];
            const val2 = row2[fieldName];
            if (val1 === val2) {
                return 0;
            }
            let result = -1;
            if (val1 > val2) {
                result = 1;
            }
            if (order < 0) {
                result = -result;
            }
            return result;
        });
        return data;
    }
    async getTaskDocument(folderUrl, documentUrl) {
        let completeFolderRelativeUrl = folderUrl + documentUrl;
        this.SetNewrelic('Services', 'Common-getTaskDocuments', 'readFiles');
        let documents = await this.spServices.readFiles(completeFolderRelativeUrl);
        if (documents.length) {
            documents = documents.sort(function (a, b) {
                return new Date(a.modified) < new Date(b.modified) ? -1 : 1;
            });
        }
        return documents;
    }
    ////// Refactor end


    unique(array, param) {
        return array.filter(function (item, pos, array) {
            return array.map(function (mapItem) { return mapItem[param]; }).indexOf(item[param]) === pos;
        })
    }
    returnText(arrText) {
        let sReturn = '';
        let arrItem = [];
        if (arrText) {
            $.each(arrText, function (index, value1) {
                arrItem.push(value1.Title);
            });
        }

        if (arrItem.length) {
            sReturn = arrItem.join(", ");
        }
        return sReturn;
    }

    getResourceId(arr) {
        let sReturn = {};
        let arrItem = [];
        if (arr) {
            $.each(arr, function (index, value1) {
                sReturn = {
                    Id: value1.Id,
                    Title: value1.Title
                }
                arrItem.push(sReturn);
            });
        }
        return arrItem;
    }

    async checkTaskStatus(task) {
        this.SetNewrelic('Service', 'Common-Service', 'readItem');
        const currentTask = await this.spServices.readItem(this.constants.listNames.Schedules.name, task.ID);
        let isActionRequired: boolean;
        if (currentTask) {
            if (currentTask.Status === 'Completed' || currentTask.Status === 'Closed' || currentTask.Status === 'Auto Closed') {
                isActionRequired = false;
            } else {
                isActionRequired = true;
            }
        }
        return isActionRequired;
    }

    setIframeHeight() {
        setTimeout(() => {
            const height = $('.custom-table-container').height();
            window.parent.postMessage(["setHeight", height], "*");
        }, 200);
    }

    calcBusinessDays(dDate1, dDate2) {         // input given as Date objects
        let iWeeks, iDateDiff, iAdjust = 0;
        dDate1 = new Date(dDate1);
        dDate2 = new Date(dDate2);
        if (dDate2 < dDate1) {
            return -1;
        }                                               // error code if dates transposed
        let iWeekday1 = dDate1.getDay();                // day of week
        let iWeekday2 = dDate2.getDay();
        iWeekday1 = (iWeekday1 === 0) ? 7 : iWeekday1;   // change Sunday from 0 to 7
        iWeekday2 = (iWeekday2 === 0) ? 7 : iWeekday2;
        if ((iWeekday1 > 5) && (iWeekday2 > 5)) {
            iAdjust = 1;  // adjustment if both days on weekend
        }
        iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1;    // only count weekdays
        iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;
        // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
        iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000);
        if (iWeekday1 <= iWeekday2) {
            iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1);
        } else {
            iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2);
        }
        iDateDiff -= iAdjust;                            // take into account both days on weekend
        return (iDateDiff + 1);                         // add 1 because dates are inclusive
    }

    addHrsMins(arrayTotalTimeSpent): string {
        let totalTime = '';
        let totalHrs = 0;
        let totalMins = 0;
        for (const i in arrayTotalTimeSpent) {
            if (arrayTotalTimeSpent.hasOwnProperty(i)) {
                const hrsPart = arrayTotalTimeSpent[i].timeHrs ? +(arrayTotalTimeSpent[i].timeHrs) : +arrayTotalTimeSpent[i].split(':')[0];
                const minsPart = arrayTotalTimeSpent[i].timeMins !== undefined ? +(arrayTotalTimeSpent[i].timeMins) :
                    arrayTotalTimeSpent[i].indexOf(':') > -1 ? +arrayTotalTimeSpent[i].split(':')[1] : 0;
                totalHrs = +(totalHrs) + hrsPart;
                totalMins = +(totalMins) + minsPart;
                if (totalMins >= 60) {
                    totalHrs++;
                    totalMins = totalMins - 60;
                }
            }
        }
        const totalMinutes = totalMins < 10 ? '0' + totalMins : totalMins;
        totalTime = totalHrs + ':' + totalMinutes;
        return totalTime;
    }

    calculateTotalMins(hrsMins: string): number {
        let totalMinutes = 0;
        const negative: boolean = hrsMins.indexOf('-') > -1 ? true : false;
        if (hrsMins != null && hrsMins.indexOf(':') > -1) {
            const hrs = negative ? -(+(hrsMins.toString().split(':')[0]) * 60) : (+(hrsMins.toString().split(':')[0]) * 60);
            totalMinutes = hrs + +(hrsMins.toString().split(':')[1]);
        } else if (hrsMins != null && hrsMins.indexOf(':') === -1) {
            totalMinutes = +(hrsMins) * 60;
        }
        return negative ? -totalMinutes : totalMinutes;
    }

    convertFromHrsMins(hrsmins: string): number {
        const totalMins = this.calculateTotalMins(hrsmins);
        const h = Math.floor(totalMins / 60);
        let m = totalMins % 60;
        m = +(m / 60);
        const totalHrs = h < 10 ? '0' + h : h;
        return +totalHrs + +m;
    }

    calcTimeForDifferentTimeZone(date, prevOffset, currentOffset) {
        // convert to msec
        // subtract local time zone offset
        // get UTC time in msec
        const checkDate = date.jsdate;
        if (checkDate) {
            date = new Date(date.jsdate);
        } else {
            date = new Date(date);
        }
        const prevTimezone = parseFloat(prevOffset) * 60 * -1;
        const utc = date.getTime() + (prevTimezone * 60000);
        // create new Date object for different city
        // using supplied offset
        const newDate = new Date(utc + (3600000 * currentOffset));
        // return time as a string newDate.toLocaleString()
        return newDate;
    }

    getCurrentUserTimeZone() {
        const today = new Date();
        const currentsystemOffset = (today.getTimezoneOffset() / 60 * -1);
        return currentsystemOffset;
    }

    convertToHrsMins(hours) {
        if (hours != null) {
            hours = '' + hours;
            if (hours.indexOf(':') > -1 || hours.indexOf('.') > -1) {
                hours = parseFloat(hours).toFixed(2).toString();
                const hrs = hours.indexOf(':') > -1 ? hours.split(':')[0] : hours.split('.')[0];
                let mins = hours.indexOf(':') > -1 ? hours.split(':')[1] : hours.split('.')[1];
                mins = mins * (60 / 100);
                mins = mins < 10 && mins > 0 ? '0' + Math.round(mins) : Math.round(mins);
                return hrs + ':' + mins;
            } else if (hours.indexOf('.') === -1 || hours.indexOf(':') === -1) {
                return hours + ':0';
            }
        } else {
            return '0:0';
        }
    }

    ConvertTimeformat(format, time) {
        // var time = $("#starttime").val();
        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM.toLowerCase() === "pm" && hours < 12) hours = hours + 12;
        if (AMPM.toLowerCase() === "am" && hours == 12) hours = hours - 12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        // alert(sHours + ":" + sMinutes);
        return sHours + ":" + sMinutes;
    }

    subtractHrsMins(elem1: string, elem2: string, considerNegative: boolean): string {
        let result = 0;
        let negative = false;
        let total = 0;
        elem1 = elem1.indexOf('.') > -1 || elem1.indexOf(':') > -1 ? elem1 : elem1 + '.00';
        elem2 = elem2.indexOf('.') > -1 || elem2.indexOf(':') > -1 ? elem2 : elem2 + '.00';
        const totalMinsElem1 = elem1.indexOf('.') > -1 ? +(elem1.split('.')[0]) * 60 + +(elem1.split('.')[1]) :
            +(elem1.split(':')[0]) * 60 + +(elem1.split(':')[1]);
        const totalMinsElem2 = elem2.indexOf('.') > -1 ? +(elem2.split('.')[0]) * 60 + +(elem2.split('.')[1]) :
            +(elem2.split(':')[0]) * 60 + +(elem2.split(':')[1]);
        if (totalMinsElem2 > totalMinsElem1) {
            negative = considerNegative ? true : false;
            total = totalMinsElem2 - totalMinsElem1;
        } else {
            negative = false;
            total = totalMinsElem1 - totalMinsElem2;
        }
        if (negative) {
            result = -total / 60;
        } else {
            result = total / 60;
        }
        return this.convertToHrsMins('' + result);
    }


    //////////// Refactor code
    /*****************************************************************

    Call Api to Get Project Resources
   *******************************************************************/

    async getProjectResources(projectCode, bFirstCall, bSaveRes) {

        const batchUrl = [];

        // ***********************************************************************************************************************************
        // Project Information
        // ***********************************************************************************************************************************

        let prjResObj = Object.assign({}, this.queryConfig);
        prjResObj.url = this.spServices.getReadURL(this.constants.listNames.ProjectInformation.name, this.taskAllocationService.taskallocationComponent.projectResources);
        prjResObj.url = prjResObj.url.replace(/{{ProjectCode}}/gi, projectCode);
        prjResObj.listName = this.constants.listNames.ProjectInformation.name;
        prjResObj.type = 'GET';
        batchUrl.push(prjResObj);

        let budgetObj = Object.assign({}, this.queryConfig);
        budgetObj.url = this.spServices.getReadURL(this.constants.listNames.ProjectFinances.name, this.taskAllocationService.taskallocationComponent.Budgets);
        budgetObj.url = budgetObj.url.replace(/{{ProjectCode}}/gi, projectCode);
        budgetObj.listName = this.constants.listNames.ProjectFinances.name;
        budgetObj.type = 'GET';
        batchUrl.push(budgetObj);
        if (bFirstCall) {

            // ***********************************************************************************************************************************
            // Resources
            // ***********************************************************************************************************************************

            let resourceObj = Object.assign({}, this.queryConfig);
            resourceObj.url = this.spServices.getReadURL(this.constants.listNames.ResourceCategorization.name, this.taskAllocationService.taskallocationComponent.Resources);
            resourceObj.url = resourceObj.url.replace(/{{enable}}/gi, 'Yes');
            resourceObj.listName = this.constants.listNames.ResourceCategorization.name;
            resourceObj.type = 'GET';
            batchUrl.push(resourceObj);

            // ***********************************************************************************************************************************
            // Central Group
            // ***********************************************************************************************************************************

            let grpResourceObj = Object.assign({}, this.queryConfig);
            grpResourceObj.url = this.spServices.getGroupURL(this.constants.Groups.CAAdmin);
            grpResourceObj.listName = this.constants.Groups.CAAdmin;
            grpResourceObj.type = 'GET';
            batchUrl.push(grpResourceObj);
        }

        const arrResult = await this.spServices.executeBatch(batchUrl);
        this.response = arrResult.length > 0 ? arrResult.map(a => a.retItems) : [];
        if (this.response.length > 0) {
            this.sharedTaskAllocateObj.oResources = this.response.length > 2 ? this.response[2] : this.sharedTaskAllocateObj.oResources;
            this.sharedTaskAllocateObj.oCentralGroup = this.response.length > 2 ? this.response[3] : this.sharedTaskAllocateObj.oCentralGroup;
            const project = this.response[0] !== "" ? this.response[0].length > 0 ? this.setLevel1Email(this.response[0][0]) : [] : [];
            if (project.length > 0) {
                const returnedProject = project[0];
                const bBudgetHrs = bSaveRes ? this.sharedTaskAllocateObj.oProjectDetails.budgetHours : 0;
                const arrMilestones = bSaveRes ? this.sharedTaskAllocateObj.oProjectDetails.allMilestones : (returnedProject.Milestones ? returnedProject.Milestones.split(';#') : []);
                const currentMilestoneIndex = returnedProject.Milestone ? arrMilestones.indexOf(returnedProject.Milestone) : -1;
                this.sharedTaskAllocateObj.oProjectDetails = {
                    projectCode: returnedProject.ProjectCode,
                    projectID: returnedProject.ID,
                    writer: returnedProject.Writers,
                    reviewer: returnedProject.Reviewers,
                    editor: returnedProject.Editors,
                    qualityChecker: returnedProject.QC,
                    graphicsMembers: returnedProject.GraphicsMembers,
                    pubSupportMembers: returnedProject.PSMembers,
                    primaryResources: returnedProject.PrimaryResMembers,
                    allResources: returnedProject.AllDeliveryResources,
                    cmLevel1: returnedProject.CMLevel1,
                    cmLevel2: returnedProject.CMLevel2,
                    currentMilestone: returnedProject.Milestone ? returnedProject.Milestone : '',
                    nextMilestone: arrMilestones.length !== currentMilestoneIndex + 1 ? arrMilestones[currentMilestoneIndex + 1] : '',
                  //  futureMilestones: arrMilestones.slice(currentMilestoneIndex + 1, arrMilestones.length),
                    prevMilestone: arrMilestones.slice(currentMilestoneIndex - 1, currentMilestoneIndex),
                    allMilestones: arrMilestones,
                    allOldMilestones: arrMilestones,
                    budgetHours: bSaveRes ? bBudgetHrs : this.response.length > 1 ? this.response[1] !== "" ? this.response[1][0].BudgetHrs : 0 : 0,
                    ta: returnedProject.TA ? returnedProject.TA : [],
                    deliverable: returnedProject ? returnedProject.DeliverableType : [],
                    account: returnedProject ? returnedProject.ClientLegalEntity : [],
                    wbjid: returnedProject ? returnedProject.WBJID : '',
                    status: returnedProject ? returnedProject.Status : '',
                    prevstatus: returnedProject ? returnedProject.PrevStatus : '',
                    projectFolder: returnedProject ? returnedProject.ProjectFolder : '',
                    projectType: returnedProject ? returnedProject.ProjectType : ''
                };
                if (bFirstCall) {
                    this.batchContents = new Array();
                    let clCall = Object.assign({}, this.taskAllocationService.taskallocationComponent.ClientLegal);
                    clCall.filter = clCall.filter.replace(/{{ProjectDetailsaccount}}/gi, this.sharedTaskAllocateObj.oProjectDetails.account);
                    const data = await this.spServices.readItems(this.constants.listNames.ClientLegalEntity.name, clCall);
                    if (data.length > 0) {
                        this.sharedTaskAllocateObj.oLegalEntity = data;
                    }
                    return project;
                }
            }
            else {
                return [];
            }

        }
        else {
            return [];
        }
    }

    // ***********************************************************************************************************************************
    // Get Project Data
    // ***********************************************************************************************************************************

    public setLevel1Email(prjObj) {

        if (prjObj.CMLevel1.results) {
            prjObj.CMLevel1.results = prjObj.CMLevel1.results.map(cmL1 => {
                var cm = this.sharedTaskAllocateObj.oResources.filter(user => user.UserName.ID === cmL1.ID).map(u => u.UserName.EMail);
                cmL1.EMail = cm.length > 0 ? cm[0] : ''
                return cmL1;
            });
        }
        return [prjObj];
    }


    convertToHrs(hrMins) {
        let hrsMinsArr = hrMins.split(':');
        const hrs = parseInt(hrsMinsArr[0]);
        let mins = parseInt(hrsMinsArr[1]);
        mins = mins / 60;
        return hrs + mins;
    }

    // Sort array with property as label & value

    sortData(array: any) {
        return array.sort((a, b) => {
            if (a.label && a.label !== null && b.label && b.label !== null) {
                if (a.label.toLowerCase() < b.label.toLowerCase()) {
                    return -1;
                }
                if (a.label.toLowerCase() > b.label.toLowerCase()) {
                    return 1;
                }
            }
            return 0;
        })
    }

    sortDataDateArray(array: any) {

        return array.sort((a, b) => b.label - a.label)
    }

    sortNumberArray(array: any) {
        return array.sort((a, b) => {
            if (parseFloat(a.label) && parseFloat(b.label)) {
                return a.label - b.label;
            }
            return 0;
        })
    }

    sortDateArray(array: any) {
        const reverseDateRepresentation = date => {
            if (date) {
                let d1 = this.datePipe.transform(date.label ? date.label : date, 'dd-MM-yyyy');
                let parts = d1.split('-');
                let sortedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                return sortedDate;
            } else {
                return null;
            }
        };

        const sortedDates = array
            .map(reverseDateRepresentation)
            .sort()
            .map(reverseDateRepresentation);
        return sortedDates;
    }

    // Filter multiselct option
    updateOptionValues(obj) {
        this.tableObj = obj;
        if (obj.tableData.filteredValue) {
            if (Object.entries(obj.tableData.filters).length >= 1) {
                this.isEmpty(obj.colFields, obj.tableData.filters);
            }
        }
    }

    isEmpty(obj, firstColFilter) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && !firstColFilter[prop]) {
                this.firstFilterCol(this.tableObj.tableData.filteredValue, prop);
            }
        }
    }

    firstFilterCol(array, colName) {
        this.tableObj.colFields[colName] = [];
        let totalArr = array.map(item => item[colName]);
        if (colName.toLowerCase().includes("date")) {
            totalArr = this.uniqueArrayObj(totalArr.map(a => { let b = { label: this.datePipe.transform(a, "MMM dd, yyyy, h:mm a"), value: a }; return b; }).filter(ele => ele.label));
            // totalArr = this.uniqueArrayObj(totalArr.map(a => { let b = { label: this.datePipe.transform(a, "MMM dd, yyyy, h:mm a"), value: a }; return b; }).filter(ele => ele.label));
        }
        // const uniqueTotalArr = totalArr.filter((item, index) => totalArr.indexOf(item) === index);
        let uniqueTotalArr = [];
        uniqueTotalArr = Array.from(new Set(totalArr));
        let tempArr = [];
        for (let i = 0; i < uniqueTotalArr.length; i++) {
            const element = uniqueTotalArr[i];
            if (colName.toLowerCase().includes("date")) {
                if (element.label.includes("12:00 AM")) {
                    tempArr.push({ label: this.datePipe.transform(element.label, 'MMM dd, yyyy'), value: new Date(this.datePipe.transform(element.value, 'MMM dd, yyyy')) });
                } else {
                    tempArr.push({ label: this.datePipe.transform(element.label, 'MMM dd, yyyy, h:mm a'), value: new Date(this.datePipe.transform(element.value, 'MMM dd, yyyy, h:mm a')) });
                }
            } else {
                tempArr.push({ label: element, value: element });
            }
        }
        this.tableObj.colFields[colName] = [...tempArr];
    }

    uniqueArrayObj(array: any) {
        let sts: any = '';
        return sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
            return {
                label: label1,
                value: array.find(s => s.label === label1).value
            }
        })
    }


    SetNewrelic(moduleType, routeType, value) {
        if (typeof newrelic === 'object') {
            newrelic.setCustomAttribute('spModuleType', moduleType);
            newrelic.setCustomAttribute('spRouteType', routeType);
            newrelic.setCustomAttribute('spCallType', value);
        }
    }

    async goToProjectScope(task, Status) {
        let response = '';
        if (Status === 'Closed' || Status === 'Cancelled') {
            const res = await this.spServices.checkFileExist(task.ProjectFolder + '/Miscellaneous/' + task.ProjectCode + '_scope.docx')
            if (res.hasOwnProperty('status')) {
                if (res.status === 404) {
                    response = "No Document Found."
                }
                else {
                    response = task.ProjectFolder + '/Miscellaneous/' + task.ProjectCode + '_scope.docx', '_blank';
                }
            }
        }
        else {
            response = task.ProjectFolder + '/Miscellaneous/' + task.ProjectCode + '_scope.docx?web=1', '_blank';
        }
        return response;
    }

    CalculateminstartDateValue(date, days) {
        let tempminDateValue = null;
        const dayCount = days;
        let tempDate = new Date(date);
        while (days > 0) {
            tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
            if (tempDate.getDay() !== 6 && tempDate.getDay() !== 0) {
                days -= 1;
                if (dayCount - 3 <= days) {
                    tempminDateValue = tempDate;
                }
            }
        }
        return tempminDateValue;
    }

    UploadFilesProgress(tempFiles, libraryName, overwrite): Promise<any> {
        return new Promise((resolve, reject) => {
            const ref = this.dialogService.open(FileUploadProgressDialogComponent, {
                header: 'File Uploading',
                width: '70vw',
                data: {
                    Files: tempFiles,
                    libraryName: this.sharedObject.sharePointPageObject.webRelativeUrl + '/' + libraryName,
                    overwrite: overwrite,

                },
                contentStyle: { 'overflow-y': 'visible', 'background-color': '#f4f3ef' },
                closable: false,
            });
            ref.onClose.subscribe((uploadedfile: any) => {
                resolve(uploadedfile);
            });
        });
    }


    roundToPrecision(x, precision) {
      // const y = +x + (precision === undefined ? 0.5 : precision / 2);
      // return y - (y % (precision === undefined ? 1 : +precision));
     return  Math.ceil(x / precision) * precision;
    }

    convertTo24Hour(time) {
        time = time.replace(':', '.').toUpperCase();
        let hours = +(time.substr(0, 2));
        if (time.indexOf('AM') != -1 && hours == 12) {
            time = time.replace('12', '0');
        }
        if (time.indexOf('PM') != -1 && hours < 12) {
            const numTime = time.indexOf('0' + hours) > -1 ? time.replace('0' + hours, (hours + 12)) : time.replace(hours, (hours + 12));
            time = '' + numTime;
        }
        return time.replace(/(AM|PM)/, '').replace('.', ':');
    }
    getMinsValue(val) {
        return +val === 0 ? 0 : +val === 25 ? 15 : +val === 50 ? 30 : +val === 15 ? 25 : +val === 30 ? 50 : 75;
    }

    removeEmptyItems(array) {
        array = array.filter((el) => {
            return el != null;
        });

        return array;
    }

}
