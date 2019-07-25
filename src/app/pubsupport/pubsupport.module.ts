import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PubsupportRoutingModule } from './pubsupport-routing.module';
import { PubsupportComponent } from './pubsupport/pubsupport.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PocDetailsPipe } from './Pipes/poc-details.pipe';
// FIle upload
import { FileUploadModule } from 'ng2-file-upload';

import { SharedModule } from '../shared/shared.module';
import { CreateConferenceComponent } from './pubsupport/create-conference/create-conference.component';

@NgModule({
  declarations: [PubsupportComponent, PocDetailsPipe, CreateConferenceComponent],
  imports: [
    CommonModule,
    PubsupportRoutingModule,
    PrimengModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    FileUploadModule
  ],
  entryComponents: [CreateConferenceComponent]
})
export class PubsupportModule { }
