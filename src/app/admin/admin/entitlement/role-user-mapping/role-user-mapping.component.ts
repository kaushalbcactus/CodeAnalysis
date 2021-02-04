import { Component, OnInit, ApplicationRef, NgZone } from "@angular/core";
import { SPOperationService } from "src/app/Services/spoperation.service";
import { Router } from "@angular/router";
import { AdminConstantService } from "src/app/admin/services/admin-constant.service";
import { CommonService } from "src/app/Services/common.service";
import { ConstantsService } from "src/app/Services/constants.service";
import { PlatformLocation } from "@angular/common";

@Component({
  selector: "app-role-user-mapping",
  templateUrl: "./role-user-mapping.component.html",
  styleUrls: ["./role-user-mapping.component.css"],
})
/**
 * A class that uses ngPrime to display the data in table.
 * It also have feature like paging, sorting and naviagation to different component.
 *
 * @description
 * This class is used to remove the users from group
 */
export class RoleUserMappingComponent implements OnInit {
  loaderenable: boolean = true;
  /**
   * Construct a method to create an instance of required component.
   *
   * @param spServices This is instance referance of `SPOperationService` component.
   * @param platformLocation This is instance referance of `PlatformLocation` component.
   * @param router This is instance referance of `Router` component.
   * @param applicationRef This is instance referance of `ApplicationRef` component.
   * @param zone This is instance referance of `NgZone` component.
   * @param adminConstants This is instance referance of `AdminConstantService` component.
   */
  constructor(
    private spServices: SPOperationService,
    private platformLocation: PlatformLocation,
    private router: Router,
    private applicationRef: ApplicationRef,
    private zone: NgZone,
    private common: CommonService,
    private adminConstants: AdminConstantService,
    private constants: ConstantsService
  ) {
    // Browser back button disabled & bookmark issue solution
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    router.events.subscribe((uri) => {
      zone.run(() => applicationRef.tick());
    });
  }
  roleUserColumns = [];
  roleUserRows = [];
  groupsArray = [];
  usersArray = [];
  selectedGroup: any;
  selectedUsers: any;
  showUsers: boolean = false;
  roleUserColArray = {
    User: [],
    Role: [],
    Action: [],
    By: [],
    Date: [],
  };
  /**
   * Construct a method to initialize all the data.
   *
   * @description
   *
   * This is the entry point in this class which jobs is to initialize and load the required data.
   *
   */
  async ngOnInit() {
    this.loaderenable = true;
    await this.loadGroups();
    this.loaderenable = false;
  }
  /**
   * Construct a request for calling the batches request and load the groups values.
   * @description
   * Once the batch request completed and returns the value.
   * It will iterate all the batch array to cater the request in group array.
   */
  async loadGroups() {
    const results = await this.getInitData();
    if (results && results.length) {
      this.groupsArray = [];
      // load Users dropdown.
      const groupResults = results[0].retItems;
      if (groupResults && groupResults.length) {
        groupResults.forEach((element) => {
          if (
            element.Description &&
            element.Description.indexOf(
              this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM
            ) > -1
          ) {
            element.Description = element.Description.replace(
              this.adminConstants.GROUP_CONSTANT_TEXT.SP_TEAM,
              ""
            );
            this.groupsArray.push({
              label: element.Title,
              value: element.Title,
            });
          }
        });
      }
    }
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
      url: "",
      type: "",
      listName: "",
    };
    // Get all Groups from sites list ##1
    const groupGet = Object.assign({}, options);
    groupGet.url = this.spServices.getAllGroupUrl();
    groupGet.type = "GET";
    groupGet.listName = "Groups";
    batchURL.push(groupGet);
    this.common.SetNewrelic(
      "admin",
      "admin-entitlement-RoleUserMapping",
      "GetAllsitegroups"
    );
    const result = await this.spServices.executeBatch(batchURL);
    console.log(result);
    return result;
  }
  /**
   * Construct a request to SharePoint based API using REST-CALL to provide the result based on query.
   *
   * @description
   *
   * This method will get all the users exist into the selected groups.
   */
  async onGroupsChange() {
    this.common.clearToastrMessage();
    this.constants.loader.isWaitDisable = false;
    const groupName = this.selectedGroup;
    this.common.SetNewrelic(
      "admin",
      "entitlement-role-user-mapping",
      "readGroupUsers"
    );
    if (groupName) {
      const usersArrayResult = await this.spServices.readGroupUsers(
        groupName,
        null
      );
      if (usersArrayResult && usersArrayResult.length) {
        console.log(usersArrayResult);
        this.usersArray = usersArrayResult;
        this.showUsers = true;
      } else {
        this.common.showToastrMessage(
          this.constants.MessageType.error,
          "Users does not exist in this group.",
          false
        );
        this.usersArray = [];
      }
    } else {
      this.showUsers = false;
    }
    this.constants.loader.isWaitDisable = true;
  }
  /**
   * construct a method to add/remove the user from the selected/unselected group.
   *
   * @description
   * This method will get all the information about user.
   * It will highlight the group in which user is already presents.
   *
   */
  async save() {
    const groupName = this.selectedGroup;
    const usersArray = this.selectedUsers;
    if (!groupName) {
      this.common.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select group.",
        true
      );
      return false;
    }
    if (!usersArray) {
      this.common.showToastrMessage(
        this.constants.MessageType.warn,
        "Please select atleast one user.",
        true
      );
      return false;
    }
    this.constants.loader.isWaitDisable = false;
    const batchURL = [];
    const options = {
      data: null,
      url: "",
      type: "",
      listName: "",
    };
    usersArray.forEach((element) => {
      const userData = {
        loginName: element,
      };
      const userRemove = Object.assign({}, options);
      userRemove.url = this.spServices.removeUserFromGroupByLoginName(
        groupName
      );
      userRemove.data = userData;
      userRemove.type = "POST";
      userRemove.listName = element;
      batchURL.push(userRemove);
    });
    if (batchURL.length) {
      this.common.SetNewrelic(
        "admin",
        "admin-entitlement-RoleUserMapping",
        "RemoveUserByLoginName"
      );
      const sResult = await this.spServices.executeBatch(batchURL);
      this.constants.loader.isWaitDisable = true;
      setTimeout(() => {
        this.common.showToastrMessage(
          this.constants.MessageType.success,
          "Selected User has been removed from '" +
            groupName +
            "' group  successfully.",
          true
        );
      }, 500);
      this.onGroupsChange();
    }
  }
}
