import { Component, OnInit } from '@angular/core';
import { QMSConstantsService } from './services/qmsconstants.service';

@Component({
  selector: 'app-qms',
  templateUrl: './qms.component.html',
  styleUrls: ['./qms.component.css']
})

export class QMSComponent implements OnInit {
  // Initialisation of current user
  // public currentUser = this.global.currentUser;
  // // Initialisation for show hide reviewer tab
  // public hideReviewerTaskPending = false;
  // public hideCD = false;
  // public hideManager = false;
  // public hideAdmin = false;
  // public activeLinkIndex = 0;
  // public navLinks = [{ routerLink: ['/qms/personalFeedback'], label: 'Personal Feedback', value: 'PersonalFeedback' },
  // ];

  constructor(
    public qmsConstantsService: QMSConstantsService
  ) { }

  ngOnInit() {
    // this.initialize();
  }
  /**
   *  Display Client feedback tab if current user have atleast 1 CD as ASD/TL(Delivery Lead)
   */
  // displayCFTab() {
  //   const isCDAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.CDAdmin);
  //   const isPFAdmin = this.global.currentUser.groups.filter(u => u.Title === this.globalConstant.Groups.PFAdmin);
  //   return isCDAdmin.length || isPFAdmin.length ? false : true;
  //   // const cdComponent = this.qmsConstant.ClientFeedback.ClientDissatisfactionComponent;
  //   // const batchURL = [];
  //   // const previousYear = new Date().getFullYear() - 2;
  //   // const startDate = new Date(previousYear, 11, 31).toISOString();
  //   // const endDate = new Date().toISOString();
  //   // // REST API url in contants file

  //   // const getQCData = Object.assign({}, this.options);
  //   // getQCData.url = this.spService.getReadURL(this.globalConstant.listNames.QualityComplaints.name, cdComponent.getQC);
  //   // getQCData.url = getQCData.url.replace('{{startDate}}', startDate)
  //   //   .replace('{{endDate}}', endDate)
  //   //   .replace('{{TopCount}}', '' + itemCount)
  //   //   .replace('{{statusFilter}}', '');
  //   // getQCData.listName = this.globalConstant.listNames.QualityComplaints.name;
  //   // getQCData.type = 'GET';
  //   // batchURL.push(getQCData);
  //   // return batchURL;
  // }
}
