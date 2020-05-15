import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreStackAllocationComponent } from './pre-stack-allocation.component';
import { AllocationSliderComponent } from './allocation-slider/allocation-slider.component';
import { UserCapacityModule } from '../usercapacity/usercapacity.module';
import { Ng5SliderModule } from 'ng5-slider';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { UsercapacityComponent } from '../usercapacity/usercapacity.component';
import { AllocationOverlayComponent } from './allocation-overlay/allocation-overlay.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
@NgModule({
  declarations: [PreStackAllocationComponent, AllocationSliderComponent, AllocationOverlayComponent],
  imports: [
    CommonModule,
    UserCapacityModule,
    Ng5SliderModule,
    PrimengModule,
    FlexLayoutModule,
    NgxMaterialTimepickerModule
  ],
  exports: [
    PreStackAllocationComponent,
    AllocationSliderComponent,
    AllocationOverlayComponent
  ],
  entryComponents: [
    UsercapacityComponent
  ]
})
export class PreStackAllocationModule { }
