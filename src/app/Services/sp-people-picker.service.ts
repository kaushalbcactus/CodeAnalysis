import { Injectable } from '@angular/core';
declare var SP: any;
declare var SPClientPeoplePicker: any;
declare var SPClientPeoplePicker_InitStandaloneControlWrapper: any;
declare var $: any;
declare var _v_dictSod: any;
declare function RegisterSod(val: string, url: string): void;

@Injectable({
  providedIn: 'root'
})
export class SpPeoplePickerService {
  public _this = this;
  private initializePeoplePicker(eleId) {
    const schema = {};
    schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = true;
    schema['MaximumEntitySuggestions'] = 50;
    schema['Width'] = '160px';
    const arrFiles = ['sp.core.js', 'sp.runtime.js', 'sp.js', 'autofill.js',
    'clientpeoplepicker.js', 'clientforms.js', 'clienttemplates.js'];
    for (const val of arrFiles) {
      if (!_v_dictSod[val]) {
        RegisterSod(val, '\u002f_layouts\u002f15\u002f' + val);
    }
    }
    // $.each(['sp.core.js', 'sp.runtime.js', 'sp.js', 'autofill.js',
    //     'clientpeoplepicker.js', 'clientforms.js', 'clienttemplates.js'], function (idx, val) {
    //     if (!_v_dictSod[val]) {
    //         RegisterSod(val, '\u002f_layouts\u002f15\u002f' + val);
    //     }
    // });
  //  SP.SOD.loadMultiple(['sp.core.js', 'sp.runtime.js', 'sp.js', 'autofill.js',
  //      'clientpeoplepicker.js', 'clientforms.js', 'clienttemplates.js'], function () {
    SPClientPeoplePicker_InitStandaloneControlWrapper(eleId, null, schema);
  //  });
  }

  private initialise() {

  }
  private GetPeoplePicker(eleId) {
    if (eleId !== undefined) {
        const toSpanKey = eleId + '_TopSpan';
        let peoplePicker = null;
        const ClientPickerDict = SPClientPeoplePicker.SPClientPeoplePickerDict;
        for (const propertyName of Object.keys(ClientPickerDict)) {
            if (propertyName === toSpanKey) {
                peoplePicker = ClientPickerDict[propertyName];
                break;
            }
        }
        return peoplePicker;
    }
  }

  private GetPeoplePickerIds(eleId, arrUsers) {
    const peoplePicker = this.GetPeoplePicker(eleId);
    if (peoplePicker != null) {
        // Get information about all users.
        const users = peoplePicker.GetAllUserInfo();
        const userInfo = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.Resolved === true) {
            const objUser = arrUsers.filter(function(objt) {
               return objt.UserNamePG.EMail === users[i].EntityData.Email;
            });
            if (objUser.length > 0) {
                const userID = objUser[0].UserNamePG.ID;
                userInfo.push(userID);
            }
          }
        }
        return userInfo;
    } else {
        return [];
      }
  }

  getPeoplePickerNames(eleId, arrUsers) {
    const peoplePicker = this.GetPeoplePicker(eleId);
    const userInfo = [];
    if (peoplePicker != null) {
        // Get information about all users.
        const users = peoplePicker.GetAllUserInfo();
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.Resolved === true) {
                const objUser = arrUsers.filter(function(objt) {
                    return objt.UserNamePG.EMail === users[i].EntityData.Email;
                });
              if (objUser.length > 0) {
                userInfo.push(users[i].Key);
              }
            }
        }
    }
    return userInfo;
  }

  // private GetPeoplePickerNames(eleId) {
  //     const peoplePicker = this.GetPeoplePicker(eleId);
  //     if (peoplePicker != null) {
  //         // Get information about all users.
  //         const users = peoplePicker.GetAllUserInfo();
  //         let userInfo = '';
  //         for (let i = 0; i < users.length; i++) {
  //             const user = users[i];
  //             userInfo += user['Email'] + ';#';
  //         }
  //         return userInfo;
  //     } else {
  //         return '';
  //       }
  //   }

  public SetUserInPeoplePicker(eleId, results) {
      const peoplePicker = this.GetPeoplePicker(eleId);
      if (peoplePicker != null) {
          results.forEach(function (item) {
            if (item) {
                  peoplePicker.AddUserKeys(item.Name ? item.Name : item, false);
            }
          });
      }
    }

  public spPeoplePicker(controlsArray: string[]) {
    for (const i in controlsArray) {
      if (controlsArray.hasOwnProperty(i)) {
        this.initializePeoplePicker(controlsArray[i]);
      }
    }
  }

  public GetUserNames(arrayUsers, eleId) {
    const spUsersInfo = this.getPeoplePickerNames(eleId, arrayUsers);
    return spUsersInfo;
  }

  public GetUserIDs (arrayUsers, eleId) {
    const spUsersInfo = this.GetPeoplePickerIds(eleId, arrayUsers);
    return spUsersInfo;
  }

  public SetUserID(item, eleId) {
    if (item !== null) {
        this.SetUserInPeoplePicker(eleId, item);
    }
  }

  public SetUserIDs(obj) {
    return new Promise((resolve, reject) => {
    for (const property in obj) {
      if (obj.hasOwnProperty(property) && obj[property] && obj[property].results !== undefined) {
        const spUsersInfo = this.SetUserInPeoplePicker(property, obj[property].results);
      }
    }
    resolve();
  });
}
}


