import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe} from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../primeng/primeng.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AttributeComponent } from './admin/attribute/attribute.component';
import { UserProfileComponent } from './admin/user-profile/user-profile.component';
import { EntitlementComponent } from './admin/entitlement/entitlement.component';
import { ClientMasterdataComponent } from './admin/client-masterdata/client-masterdata.component';
import { RulesComponent } from './admin/rules/rules.component';
import { ReferenceDataComponent } from './admin/reference-data/reference-data.component';
import { AdminComponent } from './admin/admin.component';
import { BucketMasterdataComponent } from './admin/attribute/bucket-masterdata/bucket-masterdata.component';
import { ProjectTypesComponent } from './admin/attribute/project-types/project-types.component';
import { DeliverableTypesComponent } from './admin/attribute/deliverable-types/deliverable-types.component';
import { TherapeuticAreasComponent } from './admin/attribute/therapeutic-areas/therapeutic-areas.component';
import { PracticeAreasComponent } from './admin/attribute/practice-areas/practice-areas.component';
import { UserRoleMappingComponent } from './admin/entitlement/user-role-mapping/user-role-mapping.component';
import { RoleUserMappingComponent } from './admin/entitlement/role-user-mapping/role-user-mapping.component';

@NgModule({
  declarations: [
    AttributeComponent,
    UserProfileComponent,
    EntitlementComponent,
    ClientMasterdataComponent,
    RulesComponent,
    ReferenceDataComponent,
    AdminComponent,
    BucketMasterdataComponent,
    ProjectTypesComponent,
    DeliverableTypesComponent,
    TherapeuticAreasComponent,
    PracticeAreasComponent,
    UserRoleMappingComponent,
    RoleUserMappingComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    FormsModule,
    PrimengModule
  ],
  providers: [DatePipe]
})
export class AdminModule { }
