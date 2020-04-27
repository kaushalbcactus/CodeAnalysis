import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { InputPatterenDirective } from './directives/input-patteren.directive';

@NgModule({
  declarations: [
    NumberOnlyDirective,
    InputPatterenDirective
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
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
