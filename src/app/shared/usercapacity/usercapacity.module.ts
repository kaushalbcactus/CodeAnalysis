import { NgModule } from '@angular/core';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CommonModule } from '@angular/common';
import { UsercapacityComponent } from './usercapacity.component';

@NgModule({
  declarations: [UsercapacityComponent],
  imports: [
    CommonModule,
    PrimengModule,

  ],
  exports: [
    UsercapacityComponent
  ]
})
export class UserCapacityModule {
}
