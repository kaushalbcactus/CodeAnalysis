import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AttributeComponent } from './admin/attribute/attribute.component';
import { BucketMasterdataComponent } from './admin/attribute/bucket-masterdata/bucket-masterdata.component';
import { ProjectTypesComponent } from './admin/attribute/project-types/project-types.component';
import { DeliverableTypesComponent } from './admin/attribute/deliverable-types/deliverable-types.component';
import { TherapeuticAreasComponent } from './admin/attribute/therapeutic-areas/therapeutic-areas.component';
import { PracticeAreasComponent } from './admin/attribute/practice-areas/practice-areas.component';
import { UserProfileComponent } from './admin/user-profile/user-profile.component';
import { EntitlementComponent } from './admin/entitlement/entitlement.component';
import { UserRoleMappingComponent } from './admin/entitlement/user-role-mapping/user-role-mapping.component';
import { RoleUserMappingComponent } from './admin/entitlement/role-user-mapping/role-user-mapping.component';
import { ClientMasterdataComponent } from './admin/client-masterdata/client-masterdata.component';
import { RulesComponent } from './admin/rules/rules.component';
import { ReferenceDataComponent } from './admin/reference-data/reference-data.component';
import { CopyPermissionComponent } from './admin/entitlement/copy-permission/copy-permission.component';
import { AddUserToProjectsComponent } from './admin/entitlement/add-user-to-projects/add-user-to-projects.component';
import { AddUserToSowComponent } from './admin/entitlement/add-user-to-sow/add-user-to-sow.component';
import { GroupDescriptionComponent } from './admin/entitlement/group-description/group-description.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'clientMasterData', pathMatch: 'prefix' },
      {
        path: 'attribute',
        component: AttributeComponent,
        children: [
          { path: '', redirectTo: 'bucketMasterData', pathMatch: 'prefix' },
          { path: 'bucketMasterData', component: BucketMasterdataComponent },
          { path: 'projectTypes', component: ProjectTypesComponent },
          { path: 'deliverableTypes', component: DeliverableTypesComponent },
          { path: 'therapeuticAreas', component: TherapeuticAreasComponent },
          { path: 'practiceAreas', component: PracticeAreasComponent }
        ]
      },
      { path: 'userProfile', component: UserProfileComponent },
      {
        path: 'entitlement',
        component: EntitlementComponent,
        children: [
          { path: '', redirectTo: 'userRoleMapping', pathMatch: 'prefix' },
          { path: 'userRoleMapping', component: UserRoleMappingComponent },
          { path: 'roleUserMapping', component: RoleUserMappingComponent },
          { path: 'copyPermission', component: CopyPermissionComponent },
          { path: 'addUserToSow', component: AddUserToSowComponent },
          { path: 'addUserToProjects', component: AddUserToProjectsComponent },
          { path: 'addGroupDescription', component: GroupDescriptionComponent }
        ]
      },
      { path: 'clientMasterData', component: ClientMasterdataComponent },
      { path: 'rules', component: RulesComponent },
      { path: 'referenceData', component: ReferenceDataComponent }
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
