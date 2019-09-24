import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../Services/global.service';
import { SPOperationService } from '../Services/spoperation.service';
import { ConstantsService } from '../Services/constants.service';
import { AccessLevelconstantService } from './Services/accesslevelconstant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accessleveldashboard',
  templateUrl: './accessleveldashboard.component.html',
  styleUrls: ['./accessleveldashboard.component.css']
})
export class AccessleveldashboardComponent implements OnInit {

 
  constructor(
    private globalObject: GlobalService,
    private spServices: SPOperationService,
    private constant: ConstantsService,
    private accessLevelconstantService: AccessLevelconstantService,
    private router: Router) { }

  ngOnInit() {
    this.constant.loader.isPSInnerLoaderHidden = false;
    this.checkAccessLevel();
  }

  async checkAccessLevel() {

    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get the all the Resources  ##0
    const resourceGet = Object.assign({}, options);
    const resourceEndPoint = this.spServices.getReadURL('' + this.constant.listNames.ResourceCategorization.name + '',
      this.accessLevelconstantService.resourceQueryOptions);
    resourceGet.url = resourceEndPoint.replace('{0}', '' + this.globalObject.sharePointPageObject.userId);
    resourceGet.type = 'GET';
    resourceGet.listName = this.constant.listNames.ResourceCategorization.name;
    batchURL.push(resourceGet);
    const arrResults = await this.spServices.executeBatch(batchURL);
    if (arrResults) {
      if (arrResults[0].retItems.length > 0) {
        this.constant.loader.isPSInnerLoaderHidden = true;
        if (arrResults[0].retItems[0].Role === 'CM L1' || arrResults[0].retItems[0].Role === 'CM L2') {
          if (arrResults[0].retItems[0].SkillLevel.Title.includes('Offsite')) {
            this.router.navigate(['/projectMgmt']);
          } else {
            this.router.navigate(['/projectMgmt/sendToClient']);
          }
        } else if (arrResults[0].retItems[0].Role === 'Delivery L1' ||
          arrResults[0].retItems[0].Role === 'Delivery L2' || arrResults[0].retItems[0].Role
          === 'Delivery' || arrResults[0].retItems[0].Role === 'Others') {
          this.router.navigate(['/myDashboard']);
        } else if (arrResults[0].retItems[0].Role === 'Finance') {

          this.router.navigate(['/financeDashboard']);
        } else {
          this.router.navigate(['/myDashboard']);
        }

      } else {
        this.constant.loader.isPSInnerLoaderHidden = true;
        this.router.navigate(['/404']);
      }
    } else {
      this.constant.loader.isPSInnerLoaderHidden = true;
      this.router.navigate(['/myDashboard']);
    }
  }
}



