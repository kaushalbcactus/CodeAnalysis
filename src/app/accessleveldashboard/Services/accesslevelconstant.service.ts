import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessLevelconstantService {
  constructor() { }

public resourceQueryOptions = {
    select: 'ID,UserName/ID,UserName/Title,Role,SkillLevel/Title',
    expand: 'UserName/ID,UserName/Title,SkillLevel/Title',
    filter: 'UserName/ID eq {0}',
    top: 4200
  };

}
