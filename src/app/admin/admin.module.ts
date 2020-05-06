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
import { AddEditUserProfileComponent } from './admin/user-profile/add-edit-user-profile/add-edit-user-profile.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AddEditClientlegalentityDialogComponent } from './admin/client-masterdata/add-edit-clientlegalentity-dialog/add-edit-clientlegalentity-dialog.component';
import { AddEditSubdivisionComponent } from './admin/client-masterdata/add-edit-subdivision/add-edit-subdivision.component';
import { AddEditPocComponent } from './admin/client-masterdata/add-edit-poc/add-edit-poc.component';
import { AddEditPoDialogComponent } from './admin/client-masterdata/add-edit-po-dialog/add-edit-po-dialog.component';
import { ChangeBudgetDialogComponent } from './admin/client-masterdata/change-budget-dialog/change-budget-dialog.component';
import { CustomMaterialModule } from '../shared/material.module';


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
    GroupDescriptionComponent,
    AddEditUserProfileComponent,
    AddEditClientlegalentityDialogComponent,
    AddEditSubdivisionComponent,
    AddEditPocComponent,
    AddEditPoDialogComponent,
    ChangeBudgetDialogComponent],
  imports: [
    SharedModule,
    AdminRoutingModule,
    PrimengModule,
    NgbModule,
    FlexLayoutModule,
    CustomMaterialModule
  ],
  providers: [
  ],
  entryComponents : [AddEditUserProfileComponent, AddEditClientlegalentityDialogComponent,AddEditSubdivisionComponent, AddEditPocComponent,AddEditPoDialogComponent,ChangeBudgetDialogComponent]

})
export class AdminModule { }
