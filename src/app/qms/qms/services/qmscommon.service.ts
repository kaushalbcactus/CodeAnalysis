import { SPOperationService } from './../../../Services/spoperation.service';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/primeng';
import { CommonService } from 'src/app/Services/common.service';

@Injectable({
  providedIn: 'root'
})
export class QMSCommonService {

  public options = {
    data: null,
    url: '',
    type: '',
    listName: ''
  };

  public selectedComponent: any;

  constructor(private spService: SPOperationService, private messageService: MessageService, private common:CommonService) { }
  /**
   * Fetch tasks documents
   */
  async getAllTaskDocuments(arrTasks, arrProjects) {
    const batchURL = [];
    let tasksDoc = [];
    let i = 0;
    const arrProjectFolderUrl = [];
    arrTasks.forEach(async task => {
      const getDocItemData = Object.assign({}, this.options);
      const project = arrProjects.filter(p => p.ProjectCode === task.ProjectCode);
      const projectFolderUrl = project.length > 0 ? project[0].ProjectFolder : [];
      const milestoneUrl = projectFolderUrl + '/Drafts/Internal/' + task.Milestone;
      if (arrProjectFolderUrl.indexOf(milestoneUrl) < 0) {
        getDocItemData.url = this.spService.getFilesFromFoldersURL(milestoneUrl);
        getDocItemData.listName = milestoneUrl;
        getDocItemData.type = 'GET';
        batchURL.push(getDocItemData);
        arrProjectFolderUrl.push(milestoneUrl);
        i++;
        // Eg: - 132 requests
        // Loop 100 document fetch request for each batch
        if (i % 100 === 0) {
          const arrInnerResult = await this.spService.executeBatch(batchURL);
          let bresult = arrInnerResult.length > 0 ? arrInnerResult : [];
          bresult = bresult.map(t => t.retItems);
          tasksDoc = [].concat(...tasksDoc, ...bresult);
        }
      }
    });
    // Execute remaining 32 requests less than multiple of 100

    this.common.SetNewrelic('QMS', 'qmscommonService', 'GetDocuments');
    let arrResult = await this.spService.executeBatch(batchURL);
    arrResult = arrResult.map(t => t.retItems);
    const result = arrResult.length > 0 ? arrResult : [];
    tasksDoc = [].concat(...tasksDoc, ...result);
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
    const reviewTaskDoc = this.getDocumentUrl(reviewTaskDocuments);
    return reviewTaskDoc;
  }

  /**
   * Generates anchor tag of document url
   *
   * @returns [] of document urls
   */
  getDocumentUrl(array) {
    const document = {
      documentUrl: [],
      documentUrlHtmlTag: ''
    };
    array.forEach(element => {
      document.documentUrl.push(element.ServerRelativeUrl);
      document.documentUrlHtmlTag = document.documentUrlHtmlTag + '<div class="ellipsis"><a href="'
        + element.ServerRelativeUrl + '" download>' + element.Name + '</a></div>';
    });
    return document;
  }

  uniqueArrayObj(array: any) {
    let sts: any = '';
    sts = Array.from(new Set(array.map(s => s.label))).map(label1 => {
      return {
        label: label1,
        value: array.find(s => s.label === label1).value ? array.find(s => s.label === label1).value : '',
        filterValue: array.find(s => s.label === label1).filterValue ? array.find(s => s.label === label1).filterValue : ''
      };
    });
    sts = this.customSort(sts, 1, 'filterValue');
    return sts;
  }

  customSort(data, order: number, fieldName?: string) {
    data.sort((row1, row2) => {
      const val1 = fieldName ? row1[fieldName] : row1;
      const val2 = fieldName ? row2[fieldName] : row2;
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
  
 
}
