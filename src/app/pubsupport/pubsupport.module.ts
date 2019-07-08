import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PubsupportRoutingModule } from './pubsupport-routing.module';
import { PubsupportComponent } from './pubsupport/pubsupport.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PocDetailsPipe } from './Pipes/poc-details.pipe';
// FIle upload
import { FileUploadModule  } from 'ng2-file-upload';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PubsupportComponent, PocDetailsPipe],
  imports: [
    CommonModule,
    PubsupportRoutingModule,
    PrimengModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    FileUploadModule
  ],
})
export class PubsupportModule { }
