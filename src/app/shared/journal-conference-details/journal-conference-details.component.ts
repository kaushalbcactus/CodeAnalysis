import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from '../../Services/constants.service';
import { PubsuportConstantsService } from 'src/app/pubsupport/Services/pubsuport-constants.service';
import { SPOperationService } from '../../Services/spoperation.service';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { AuthorDetailsComponent } from 'src/app/pubsupport/pubsupport/author-details/author-details.component';
import { GlobalService } from 'src/app/Services/global.service';


@Component({
  selector: 'app-journal-conference-details',
  templateUrl: './journal-conference-details.component.html',
  styleUrls: ['./journal-conference-details.component.css']
})
export class JournalConferenceDetailsComponent implements OnInit {
  journal_Conf_data: any = [];
  // Show Hide Submission Details
  showHideSubDetailsData = false;
  showSubDetails = false;
  // Show Hide Submission Details
  showSubDetailsIndex = 0;
  submission_details_data: any = [];
  showJournalRowIndex = 0;
  state = false;
  parentRowIndex: number;
  journal_Conf_details: any = {};
  // View Galley Details
  showHideGalleyDetails = false;
  galleyDetailsData: any = [];

  galleyIndexChecked: number;
  galleyRowIndex = 0;

  galleyResponse: any = [];
  
  // ShowHide Galley
  showHideGalleyData = false;
  selectedProject: any = {};
  isUploadIcon: boolean = false;
  @Input() projectObj: any;
  @Output() fileReplace = new EventEmitter<string>();
  // @Output() authorDetails = new EventEmitter<string>();
  isPubSupportComponent:boolean = false;

  constructor(private spOperationsService : SPOperationService,
    private pubsupportService: PubsuportConstantsService,
    private constantService: ConstantsService,
    private common: CommonService,
    private config: DynamicDialogConfig, 
    public popupRef: DynamicDialogRef,
    private dialogService: DialogService,
    private globalObject: GlobalService) { }

  ngOnInit() {
    if(this.config.data) {
      this.selectedProject =  this.config.data.projectObj ? this.config.data.projectObj : '';
      if(this.selectedProject) {
        this.onLoad();
        this.isPubSupportComponent = true;
      }
    } else if(this.projectObj) {
      this.selectedProject =  this.projectObj;
      this.onLoad();
      this.isPubSupportComponent = true;
    } else {
      this.isUploadIcon = true;
      this.isPubSupportComponent = false;
    }
  }

  async onLoad() {
    await this.getJCDetails(this.selectedProject)
  }

  async getJCDetails(project) {
    this.selectedProject = project;
    const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.journalConf);
      obj.filter = obj.filter.replace('{{ProjectCode}}', this.selectedProject.ProjectCode);
      const jcEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JournalConf.name + '', obj);
      const jcObj = [{
          url: jcEndpoint,
          type: 'GET',
          listName: this.constantService.listNames.JournalConf.name
      }];
      this.common.SetNewrelic('PubSupport', 'pubsupport', 'GetJCDetailsbyProjectCode');
      const res = await this.spOperationsService.executeBatch(jcObj);
      const jsData = res[0].retItems;
      this.journal_Conf_data = [];
      // tslint:disable-next-line:prefer-for-of
      for (let jc = 0; jc < jsData.length; jc++) {
          const element = jsData[jc];
          this.journal_Conf_data.push({
              element,
              project: this.selectedProject
          });
      }
      this.journal_Conf_data = [...this.journal_Conf_data];
      console.log('this.journal_Conf_data ', this.journal_Conf_data);
  }

  jcViewDetails = (index: number) => {
    this.showJournalRowIndex = index;
    this.journal_Conf_details = this.journal_Conf_data[index].element;
    this.state = !this.state;
  }

  downloadFile(file: string, fileName: string) {
    console.log('File ', fileName);
    // console.log('File ', JSON.stringify(fileName));
    if (file) {
        this.common.showToastrMessage(this.constantService.MessageType.success, 'Files are downloading...', false);
        const fileArray = file.split(';#');
        this.common.SetNewrelic('pubsupport', 'downloadFile', 'createZip');
        this.spOperationsService.createZip(fileArray, fileName);
    } else {

        this.common.showToastrMessage(this.constantService.MessageType.warn, 'No file avaliable.', false);
    }
  }
  
  async getSubmissionDetails(index: any, selectedJC: any) {
    const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.jcSubmission);
    obj.filter = obj.filter.replace('{{ProjectCode}}', selectedJC.Title).replace('{{JCID}}', selectedJC.ID);
    const jsEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JCSubmission.name + '', obj);
    const data = [{
        url: jsEndpoint,
        type: 'GET',
        listName: this.constantService.listNames.JCSubmission.name
    }];
    this.common.SetNewrelic('PubSupport', 'pubsupport', 'getSubDetailsByProjectCodeAndJCID');
    const res = await this.spOperationsService.executeBatch(data);
    this.submission_details_data = res[0].retItems;
    // Hide Loader
    this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
}

  replaceFile(type,id?) {
    let obj: any = { type:type, project:this.selectedProject , milestone: this.journal_Conf_data[0].element.Milestone}
    if(id) {
      obj.id = id;
      this.fileReplace.emit(obj);
    } else {
      this.fileReplace.emit(obj);
    }
    // // this.getJC_JCSubID();
    // this.folderPath = '';
    // this.type = type;
    // switch(type) {
    //     case 'JournalRequirementResponse' :
    //     case 'Decision' :
    //     this.folderPath = this.selectedProject.ProjectFolder.replace(this.globalObject.sharePointPageObject.webRelativeUrl + '/', '') + '/Publication Support/Published Papers';
    //     break;
    //     default:
    //     this.folderPath = this.selectedProject.ProjectFolder.replace(this.globalObject.sharePointPageObject.webRelativeUrl + '/', '') + '/Drafts/Internal/' + this.selectedProject.Milestones;
    //     break;
    // }
    // this.replaceDocument = true;
  }

  showHideSubDetails(index: number, SelectedProj: any) {
    this.showHideSubDetailsData = false;
    this.showSubDetailsIndex = index;
    this.showSubDetails = !this.showSubDetails;
    if (this.showSubDetails) {
        // Galley Index reset
        this.showHideGalleyData = false;
        // Show Loadder
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;

        // submission_details_data
        this.getSubmissionDetails(index, SelectedProj.element);
        this.showHideSubDetailsData = true;
        this.showHideGalleyDetails = false;
    }
  }

  viewGalleyDetails(index: number, jcSubData: any) {
    this.galleyRowIndex = index;
    this.showHideGalleyDetails = !this.showHideGalleyDetails;
    this.galleyIndexChecked = index;
    this.showHideGalleyData = false;
    // this.galleyDetailsData
    if (this.showHideGalleyDetails) {
        this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = false;
        this.getGalleyDetails(index, jcSubData);
        this.showHideGalleyData = true;
    }
  }

  async getGalleyDetails(index: any, selectedJC: any) {
    // this.selectedProject = selectedJC;
    this.galleyDetailsData = [];
    const obj = Object.assign({}, this.pubsupportService.pubsupportComponent.jcGalley);
    obj.filter = obj.filter.replace('{{ProjectCode}}', selectedJC.Title).replace('{{JCSubID}}', selectedJC.ID);
    const jsEndpoint = this.spOperationsService.getReadURL('' + this.constantService.listNames.JCGalley.name + '', obj);
    const data = [{
        url: jsEndpoint,
        type: 'GET',
        listName: this.constantService.listNames.JCGalley.name
    }];
    this.common.SetNewrelic('PubSupport', 'pubsupport', 'getGallyDetailsByProjectCodeAndJCSubID');
    const res = await this.spOperationsService.executeBatch(data);
    this.galleyDetailsData = res[0].retItems;
    this.pubsupportService.pubsupportComponent.isPSInnerLoaderHidden = true;
  }

  AuthorDetails(projectObj) {
    const ref = this.dialogService.open(AuthorDetailsComponent, {
      header: 'Authors & Authors Form - ' + projectObj.ProjectCode,
      width: '80%',
      data: {
        projectObj
      },
      contentStyle: { 'max-height': '450px', 'overflow-y': 'auto' },
      closable: true
    });
    ref.onClose.subscribe(element => {
  });
  }

  goToPubSupport(ProjectCode) {
    window.open(this.globalObject.url + '/pubSupport?ProjectCode=' + ProjectCode, '_blank')
  }

}
