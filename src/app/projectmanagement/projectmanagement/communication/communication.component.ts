import { Component, OnInit } from '@angular/core';
import { MenuItem, DynamicDialogRef, DynamicDialogConfig, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/Services/global.service';
import { NodeService } from 'src/app/node.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.css']
})
export class CommunicationComponent implements OnInit {
  items: MenuItem[];
  activeItem: MenuItem;
  loaderenable: boolean;
  selectedDocuments: any = [];
  documentArray: any = [];
  selectedTab: string;
  dbcols: { field: string; header: string; }[];
  cols: { field: string; header: string; }[];
  projObj;
  allDocuments: any;
  fileReader = new FileReader();
  constructor(
    public config: DynamicDialogConfig,
    private dynamicDiaglogRef: DynamicDialogRef,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private globalObject: GlobalService,
    private nodeService: NodeService,
    private spServices: SPOperationService,
    private constant: ConstantsService
  ) { }
  ngOnInit() {
    this.items = [
      { label: 'Source Documents', icon: 'fa fa-folder-open', command: (e) => this.onChange(e) },
      { label: 'References', icon: 'fa fa-fw fa-book', command: (e) => this.onChange(e) },
      { label: 'Meeting Notes & Client Comments', icon: 'fa fa-comments-o', command: (e) => this.onChange(e) },
      { label: 'Emails', icon: 'fa fa-envelope', command: (e) => this.onChange(e) }];
    this.activeItem = this.items[0];
    this.loaderenable = true;
    this.selectedTab = 'Source Documents';
    this.getDocuments(this.selectedTab);
    this.dbcols = [
      { field: 'Name', header: 'Document Name' },
      { field: 'modifiedUserName', header: 'Modified By' },
      { field: 'ModifiedDateString', header: 'Modified Date' },
    ];
  }
  onChange(event) {
    this.loaderenable = true;
    this.selectedDocuments = [];
    this.documentArray = [];
    this.selectedTab = event.item.label;
    this.getDocuments(this.selectedTab);
  }
  async getDocuments(type) {
    const selectedTab = type;
    this.projObj = this.config.data.projectObj;
    let documentsUrl = '';
    console.log(this.projObj);
    if (selectedTab === 'Source Documents') {
      documentsUrl = '/Source Documents';
    } else if (selectedTab === 'References') {
      documentsUrl = '/References';
    } else if (selectedTab === 'Meeting Notes & Client Comments') {
      documentsUrl = '/Communications';
    } else if (selectedTab === 'Emails') {
      documentsUrl = '/Emails';
    }
    const folderUrl = this.projObj.ProjectFolder + documentsUrl;
    const fileArray = await this.spServices.readFiles(folderUrl);
    if (fileArray && fileArray.length) {
      this.allDocuments = fileArray;
      this.documentArray = this.allDocuments;
      const Ids = this.documentArray.map(c => c.DocIds = c.ListItemAllFields.EditorId).filter((el, i, a) => i === a.indexOf(el));
      let userIds: any = {};
      userIds = await this.getUsers(Ids);
      this.documentArray.map(c => c.Name = c.Name ? c.Name : '');
      this.documentArray.map(c => c.modifiedUserName = userIds.find(d => d.retItems.Id === c.ListItemAllFields.EditorId) !== undefined ?
        userIds.find(d => d.retItems.Id === c.ListItemAllFields.EditorId).retItems.Title : '');
      this.documentArray.map(c => c.ModifiedDateString = this.datePipe.transform(c.ListItemAllFields.Modified, 'MMM d, y, h:mm a'));
      const header = this.dbcols.slice(0);
      this.cols = header;
      this.selectedDocuments = [];
    }
    this.loaderenable = false;
  }
  async getUsers(Ids) {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    Ids.forEach(element => {
      const userGet = Object.assign({}, options);
      userGet.url = this.spServices.getUserURL(element);
      userGet.type = 'GET';
      userGet.listName = element;
      batchURL.push(userGet);
    });
    const users = await this.spServices.executeBatch(batchURL);
    if (users && users.length) {
      return users;
    }
  }
  /**
   * This method is used to upload the document.
   */
  async uploadDocuments(event, type) {
    let docFolder;
    this.messageService.add({ key: 'custom', severity: 'info', summary: 'Info Message', detail: 'Uploading....' });
    const existingFiles = this.allDocuments.map(c => c.Name);
    switch (type) {
      case 'Source Documents':
        docFolder = '/Source Documents';
        break;
      case 'References':
        docFolder = '/References';
        break;
      case 'Meeting Notes & Client Comments':
        docFolder = '/Communications';
        break;
    }
    this.loaderenable = true;
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < event.files.length; index++) {
      const element = event.files[index];
      let filename = element.name;
      if (existingFiles.includes(filename)) {
        filename = filename.split(/\.(?=[^\.]+$)/)[0] + '.' +
          this.datePipe.transform(new Date(), 'ddMMyyyyhhmmss') + '.' + filename.split(/\.(?=[^\.]+$)/)[1];
      }
      this.fileReader = new FileReader();
      this.fileReader.readAsArrayBuffer(element);
      this.fileReader.onload = async () => {
        const folderURl = this.projObj.ProjectFolder + docFolder;
        const filePathUrl = this.spServices.getFileUploadUrl(folderURl, filename, false);
        // this.nodeService.uploadFIle(filePathUrl, this.fileReader.result).subscribe(res => {
        //   uploadedFiles.push(res.d);
        //   t
        //   if (event.files.length === uploadedFiles.length) {
        //     if (this.selectedTab === 'My Drafts') {
        //       // this.LinkDoumentToProject(uploadedFiles);
        //     } else {
        //       // this.loadDraftDocs(this.selectedTab);
        //       this.messageService.add({
        //         key: 'custom', severity: 'success', summary: 'Success Message',
        //         detail: 'Document updated sucessfully.'
        //       });
        //     }
        //   }
        // });
        await this.spServices.uploadFile(filePathUrl, this.fileReader.result);
      };
      existingFiles.push(filename);
    }
    this.getDocuments(type);
  }
  downloadFile() {
    if (this.selectedDocuments.length > 0) {
       this.nodeService.createZip(this.selectedDocuments.map(c => c.ServerRelativeUrl), this.selectedTab);
    } else {
      this.messageService.add({ key: 'custom', severity: 'warn', summary: 'Warning Message', detail: 'Please Select Files.', life: 4000 });
    }
    // this.dynamicDiaglogRef.close();
  }
}
