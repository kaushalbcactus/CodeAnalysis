import { Component, OnInit } from '@angular/core';
import { SPOperationService } from 'src/app/Services/spoperation.service';
import { AdminObjectService } from 'src/app/admin/services/admin-object.service';
import { MessageService } from 'primeng/api';
import { AdminConstantService } from 'src/app/admin/services/admin-constant.service';
import { ConstantsService } from 'src/app/Services/constants.service';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-group-description',
  templateUrl: './group-description.component.html',
  styleUrls: ['./group-description.component.css']
})
/**
 * A class that uses to update the description of selected group.
 *
 * @description
 * This class is used to update the description of selected group.
 */
export class GroupDescriptionComponent implements OnInit {
  groupsArray = [];
  selectedGroup: any;
  description: any;
  /**
   * Construct a method to create an instance of required component.
   *
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param constants This is instance referance of `ConstantsService` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   * @param adminObject This is instance referance of `AdminObjectService` component.
   * @param messageService This is instance referance of `MessageService` component.
   */
  constructor(
    private spServices: SPOperationService,
    private adminObject: AdminObjectService,
    private messageService: MessageService,
    private adminConstants: AdminConstantService,
    private constants: ConstantsService,
    private common: CommonService
  ) { }
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  ngOnInit() {
    this.loadUsersAndGroups();
  }
  /**
   * construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   * This method will prepare the `Batch` request to get the data based on query.
   *
   * @description
   * It will prepare the request as per following Sequence.
   * 1. Groups          - Get data from Groups.
   *
   * @return An Array of the response in `JSON` format in above sequence.
   */
  async getInitData() {
    const batchURL = [];
    const options = {
      data: null,
      url: '',
      type: '',
      listName: ''
    };
    // Get all Groups from sites list ##2
    const groupGet = Object.assign({}, options);
    groupGet.url = this.spServices.getAllGroupUrl();
    groupGet.type = 'GET';
    groupGet.listName = 'Groups';
    batchURL.push(groupGet);
    this.common.SetNewrelic('admin', 'admin-entitlement-groupDescription', 'GetAllGroups');
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * Construct a request for calling the batches request and load the dropdown and groups values.
   * @description
   * Once the batch request completed and returns the value.
   * It will iterate all the batch array to cater the request in dropdown format and
   * pushing the data to a particular dropdown array and group array.
   */
  async loadUsersAndGroups() {
    this.adminObject.isMainLoaderHidden = false;
    const results = await this.getInitData();
    if (results && results.length) {
      this.groupsArray = [];
      const groupResults = results[0].retItems;
      if (groupResults && groupResults.length) {
        groupResults.forEach(element => {
          this.groupsArray.push({ label: element.Title, value: element.Title });
        });
      }
    }
    this.adminObject.isMainLoaderHidden = true;
  }
  /**
   * Construct a method to save the group description value.
   *
   * @description
   *
   * This method is used to save the description value.
   *
   */
  async saveDescription() {
    if (!this.selectedGroup) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please select the group.'
      });
      return false;
    }
    if (!this.description) {
      this.messageService.add({
        key: 'adminCustom', severity: 'error',
        summary: 'Error Message', detail: 'Please enter the group description.'
      });
      return false;
    }
    this.adminObject.isMainLoaderHidden = false;
    const data = {
      __metadata: { type: 'SP.Group' },
      Description: this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM + this.description
    };
    this.common.SetNewrelic('admin', 'admin-entitlement-groupDescription', 'updateGroupItem');
    await this.spServices.updateGroupItem(this.selectedGroup, data);
    this.messageService.add({
      key: 'adminCustom', severity: 'success',
      summary: 'Success Message', detail: 'Group description updated successfully.'
    });
    this.adminObject.isMainLoaderHidden = true;
  }
}
