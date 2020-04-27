import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { InputPatterenDirective } from './directives/input-patteren.directive';

import { PrimengModule } from '../primeng/primeng.module';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';


@NgModule({
  declarations: [
    NumberOnlyDirective,
    InputPatterenDirective,
    ConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule
  ],
  exports: [
    ReactiveFormsModule,
    NumberOnlyDirective,
    InputPatterenDirective,
    CommonModule,
    FormsModule,
  ]
})
export class SharedModule {
}
