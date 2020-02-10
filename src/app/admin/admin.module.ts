import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrimengModule } from '../primeng/primeng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin/admin.component';
import { UserProfileComponent } from './admin/user-profile/user-profile.component';
import { AttributeComponent } from './admin/attribute/attribute.component';
import { BucketMasterdataComponent } from './admin/attribute/bucket-masterdata/bucket-masterdata.component';
import { DeliverableTypesComponent } from './admin/attribute/deliverable-types/deliverable-types.component';
import { PracticeAreasComponent } from './admin/attribute/practice-areas/practice-areas.component';
import { ProjectTypesComponent } from './admin/attribute/project-types/project-types.component';
import { TherapeuticAreasComponent } from './admin/attribute/therapeutic-areas/therapeutic-areas.component';
import { ClientMasterdataComponent } from './admin/client-masterdata/client-masterdata.component';
import { EntitlementComponent } from './admin/entitlement/entitlement.component';
import { RoleUserMappingComponent } from './admin/entitlement/role-user-mapping/role-user-mapping.component';
import { UserRoleMappingComponent } from './admin/entitlement/user-role-mapping/user-role-mapping.component';
import { CopyPermissionComponent } from './admin/entitlement/copy-permission/copy-permission.component';
import { AddUserToSowComponent } from './admin/entitlement/add-user-to-sow/add-user-to-sow.component';
import { AddUserToProjectsComponent } from './admin/entitlement/add-user-to-projects/add-user-to-projects.component';
import { ReferenceDataComponent } from './admin/reference-data/reference-data.component';
import { RulesComponent } from './admin/rules/rules.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GroupDescriptionComponent } from './admin/entitlement/group-description/group-description.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AdminComponent,
    UserProfileComponent,
    AttributeComponent,
    BucketMasterdataComponent,
    DeliverableTypesComponent,
    PracticeAreasComponent,
    ProjectTypesComponent,
    TherapeuticAreasComponent,
    ClientMasterdataComponent,
    EntitlementComponent,
    RoleUserMappingComponent,
    UserRoleMappingComponent,
    ReferenceDataComponent,
    RulesComponent,
    CopyPermissionComponent,
    AddUserToSowComponent,
    AddUserToProjectsComponent,
    GroupDescriptionComponent],
  imports: [
    SharedModule,
    AdminRoutingModule,
    PrimengModule,
    NgbModule,
  ],
  providers: [
  ]
})
export class AdminModule { }
