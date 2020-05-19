import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessLevelconstantService {
  constructor() { }

public resourceQueryOptions = {
    select: 'ID,UserNamePG/ID,UserNamePG/Title,RoleCH,SkillLevel/Title',
    expand: 'UserNamePG/ID,UserNamePG/Title,SkillLevel/Title',
    filter: 'UserNamePG/ID eq {0}',
    top: 4200
  };

}
