import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { SharepointoperationService } from './sharepoint-operation.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
//tslint:disable
export class SPCommonService {

  constructor(private spService: SharepointoperationService, private datePipe: DatePipe,
    private common: CommonService) { }

   /**
   * Fetch all resources when clicked on Admin view
   *
   * @returns
   * @memberof AdminViewComponent
   */
  fetchData(url) {
    const batchGuid = this.spService.generateUUID();
    const batchContents = new Array();
    // REST API url in contants file
    this.spService.getBatchBodyGet(batchContents, batchGuid, url);
    batchContents.push('--batch_' + batchGuid + '--');
    const sCUserBatchData = batchContents.join('\r\n');
    let resources = this.spService.executeBatchRequest(batchGuid, sCUserBatchData);
    resources = resources.length > 0 ? resources[0] : [];
    return resources;
  }

  checkIfFileExists(docUrl, fileName) {
      let newfileName = fileName;
      // tslint:disable-next-line
      const url =  "/_api/web/getfilebyserverrelativeurl('/MedicalWriting/" + docUrl + "/" + fileName + "')";
      const file = this.spService.fetchListItemsByRestAPI(url);
      if (file && file.length > 0) {
          const date = new Date();
          newfileName = fileName.split('.');
          newfileName = newfileName[0] + '-' + this.datePipe.transform(date, 'ddMMyyyyhhmmss') + '.' + newfileName[1];
      }
      return newfileName;
  }

  /**
   * Fetch tasks documents
   *
   * @param {*} arrTasks
   * @param {*} arrProjects
   * @returns
   * @memberof AdminViewComponent
   */
  getAllTaskDocuments(arrTasks, arrProjects, taskUrl) {
    const batchTaskDocGuid = this.spService.generateUUID();
    let batchTaskDocContents = new Array();
    let tasksDoc = [];
    let sBatchData = '';
    let i = 0;
    const arrProjectFolderUrl = [];
    arrTasks.forEach(task => {
      const project = arrProjects.filter(p => p.ProjectCode === task.ProjectCode);
      const projectFolderUrl = project.length > 0 ? project[0].ProjectFolder : [];
      const milestoneUrl =  projectFolderUrl + '/Drafts/Internal/' + task.Milestone;
      if (arrProjectFolderUrl.indexOf(milestoneUrl) < 0) {
        // const taskUrl = this.constant.AdminViewComponent.fetchDocuments.replace('{{documentLibrary}}', milestoneUrl);
        const updatedtaskUrl = taskUrl.replace('{{documentLibrary}}', milestoneUrl);
        arrProjectFolderUrl.push(milestoneUrl);
        batchTaskDocContents = this.spService.getBatchBodyGet(batchTaskDocContents, batchTaskDocGuid, updatedtaskUrl);
        i++;
        // Eg: - 132 requests
        // Loop 100 document fetch request for each batch
        if (i % 100 === 0) {
          batchTaskDocContents.push('--batch_' + batchTaskDocGuid + '--');
          sBatchData = batchTaskDocContents.join('\r\n');
          const bresult = this.spService.executeBatchRequest(batchTaskDocGuid, sBatchData);
          tasksDoc = [...tasksDoc , ...bresult];
          sBatchData = '';
          batchTaskDocContents = [];
        }
      }
    });
    // Execute remaining 32 requests less than multiplle of 100
    batchTaskDocContents.push('--batch_' + batchTaskDocGuid + '--');
    sBatchData = batchTaskDocContents.join('\r\n');
    const result = this.spService.executeBatchRequest(batchTaskDocGuid, sBatchData);
    tasksDoc = [].concat(...tasksDoc , ...result);
    return tasksDoc;
  }

   /**
   * filter task marked as final documents
   * @param documents - all tasks documents
   * @param taskName  - filter title
   * @return documents
   */
  getTaskDocuments(documents, taskName) {
    const reviewTaskDocuments = documents.filter(d => d && d.ListItemAllFields.TaskName === taskName
      && d.ListItemAllFields.Status.indexOf('Complete') > -1);
    const reviewTaskDoc = this.common.getDocumentUrl(reviewTaskDocuments);
    return reviewTaskDoc;
  }
  findVersionDifference(items, properties?: any, lastElementBuffer?: boolean) {
    const arrVersions = [];
    const length = items.length;
    const commonProperties = ['VersionId', 'VersionLabel', 'Modified', 'Editor'];
    if (length > 0) {
      properties = properties ? properties : 'All';
      if (properties.indexOf('VersionId') < 0 || properties.indexOf('All') > -1) {
        properties = [...properties, ...commonProperties];
      }
      for (let i = 0; i < length - 1; i++) {
        const obj = {
          VersionId: '',
          VersionLabel: '',
          Modified: '',
          Editor: '',
          changedProperties: {}
        };
        const item = this.filterObjectProperties(items[i], properties);
        const nextItem = this.filterObjectProperties(items[i + 1], properties);
        for (const prop in item) {
          // Check if property is required by matching with passed properties or display all properties difference
          if (item.hasOwnProperty(prop) && nextItem.hasOwnProperty(prop)) {
            if (commonProperties.indexOf(prop) > -1) {
              obj[prop] = item[prop];
            } else if (this.isObject(item[prop]) && commonProperties.indexOf(prop) < 0) {
              let currentItemUsers = '';
              let nextItemUsers = '';
              if (item[prop].hasOwnProperty('results')) {
                currentItemUsers = item[prop].results.length ? item[prop].results.map(u => u.LookupValue).join(',') : '';
                nextItemUsers = nextItem[prop].results.map(u => u.LookupValue).join(',');
              } else {
                currentItemUsers = item[prop].LookupValue;
                nextItemUsers = nextItem[prop].LookupValue;
              }
              if (currentItemUsers !== nextItemUsers) {
                obj.changedProperties[prop] = currentItemUsers;
              }
              // tslint:disable-next-line: max-line-length
            } else if (item[prop] !== nextItem[prop] && commonProperties.indexOf(prop) < 0) {
              // if current version property value is different from lower version item then add property of object
              obj.changedProperties[prop] = item[prop];
            }
          }
        }
        // push difference object in array
        arrVersions.push(obj);
      }
      if (!lastElementBuffer) {
        const lastItemAllowedProperties = properties.filter((p: string) => commonProperties.indexOf(p) < 0);
        const firstVersion = {
          VersionId: items[length - 1].VersionId,
          VersionLabel: items[length - 1].VersionLabel,
          Modified: items[length - 1].Modified,
          Editor: items[length - 1].Editor,
          changedProperties: this.filterObjectProperties(items[length - 1], lastItemAllowedProperties)
        };
        arrVersions.push(firstVersion);
      }
    }
    return arrVersions;
  }

  isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }

  filterObjectProperties(raw, allowed) {
    let filtered = raw;
    if (allowed !== 'All') {
      filtered = Object.keys(raw)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => {
          if (this.isObject(raw[key])) {
            const result = raw[key].hasOwnProperty('results') ?
                           raw[key].results.length ? raw[key].results.map(u => u.LookupValue).join(',') : '' : raw[key].LookupValue;
            obj[key] = result;
          } else {
            obj[key] = raw[key];
          }
          return obj;
        }, {});
    }
    return filtered;
  }

}
