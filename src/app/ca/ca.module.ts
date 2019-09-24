import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllocatedComponent } from './ca/allocated/allocated.component';
import { ModelComponent } from './ca/model/model.component';
import { UnallocatedComponent } from './ca/unallocated/unallocated.component';
import { UsercapacityComponent } from './ca/usercapacity/usercapacity.component';

import { PrimengModule } from '../primeng/primeng.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CaRoutingModule } from './ca-routing.module';
import { CaComponent } from './ca/ca.component';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

@NgModule({
  declarations: [AllocatedComponent, ModelComponent, UnallocatedComponent, UsercapacityComponent, CaComponent],
  imports: [
    CommonModule,
    PrimengModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    CaRoutingModule
  ],
  providers: [ DynamicDialogConfig, DynamicDialogRef],
  entryComponents: [UsercapacityComponent, ModelComponent],
})
export class CAModule { }
