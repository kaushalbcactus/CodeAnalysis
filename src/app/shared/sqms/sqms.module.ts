import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdsComponent } from './cds/cds.component';
import { PfsComponent } from './pfs/pfs.component';
import { CdpfComponent } from './cdpf/cdpf.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CddetailsComponent } from './cds/cddetails/cddetails.component';

@NgModule({
  declarations: [
    CdsComponent,
    PfsComponent,
    CdpfComponent,
    CddetailsComponent,
  ],
  imports: [
    CommonModule,
    PrimengModule,
    FlexLayoutModule,
    FormsModule
  ],
  exports: [
    CdsComponent,
    PfsComponent,
    CdpfComponent,
  ],
  entryComponents: [CddetailsComponent]
})
export class SqmsModule { }
