import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListComponent } from './list/list.component';
// import { PeoplePickerComponent } from './people-picker/people-picker.component';
import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule } from '@angular/forms';
// import { SPService } from './services/sp.service';

@NgModule({
  declarations: [DashboardComponent, ListComponent ],
    //  ListComponent, PeoplePickerComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    PrimengModule,
    FormsModule
  ],
  // providers:[SPService]
  providers: []
})
export class DashboardModule { }
