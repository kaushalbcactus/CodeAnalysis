import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConflictAllocationComponent } from './conflict-allocation.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CustomMaterialModule } from '../material.module';
import { UserCapacityModule } from '../usercapacity/usercapacity.module';




@NgModule({
  declarations: [ConflictAllocationComponent],
  imports: [
    CommonModule,
    PrimengModule,
    CustomMaterialModule,
    UserCapacityModule
  ],
  exports: [
    ConflictAllocationComponent
  ]
})
export class ConflictAllocationsModule { }
