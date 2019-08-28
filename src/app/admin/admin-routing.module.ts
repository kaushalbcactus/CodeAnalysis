import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'attribute', pathMatch: 'prefix' },
      {
        path: 'attribute',
        component: AttributeComponent,
        children: [
          { path: '', redirectTo: 'bucketMasterData', pathMatch: 'prefix'},
          { path: 'bucketMasterData', component: BucketMasterdataComponent,  runGuardsAndResolvers: 'always' },
          { path: 'projectTypes', component: ProjectTypesComponent, runGuardsAndResolvers: 'always' },
          { path: 'deliverableTypes', component: DeliverableTypesComponent, runGuardsAndResolvers: 'always' },
          { path: 'therapeuticAreas', component: TherapeuticAreasComponent, runGuardsAndResolvers: 'always' },
          { path: 'practiceAreas', component: PracticeAreasComponent, runGuardsAndResolvers: 'always' }
        ]
      },
      { path: 'userProfile', component: UserProfileComponent },
      {
        path: 'entitlement',
        component: EntitlementComponent,
        children: [
          { path: '', redirectTo: 'userRoleMapping', pathMatch: 'prefix'},
          { path: 'userRoleMapping', component: UserRoleMappingComponent,  runGuardsAndResolvers: 'always' },
          { path: 'roleUserMapping', component: RoleUserMappingComponent, runGuardsAndResolvers: 'always' }
        ]
      },
      { path: 'clientMasterData', component: ClientMasterdataComponent, runGuardsAndResolvers: 'always' },
      { path: 'rules', component: RulesComponent, runGuardsAndResolvers: 'always' },
      { path: 'referenceData', component: ReferenceDataComponent, runGuardsAndResolvers: 'always' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
