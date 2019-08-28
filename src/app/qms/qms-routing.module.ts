import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QMSComponent } from './qms/qms.component';
import { PersonalFeedbackComponent } from './qms/personal-feedback/personal-feedback.component';
import { InternalComponent } from './qms/personal-feedback/internal/internal.component';
import { ExternalComponent } from './qms/personal-feedback/external/external.component';
import { PositiveFeedbackComponent } from './qms/personal-feedback/positive-feedback/positive-feedback.component';
import { FeedbackBymeComponent } from './qms/personal-feedback/feedback-byme/feedback-byme.component';
import { ReviewerDetailViewComponent } from './qms/reviewer-detail-view/reviewer-detail-view.component';
import { ManagerViewComponent } from './qms/manager-view/manager-view.component';
import { ClientFeedbackComponent } from './qms/client-feedback/client-feedback.component';
import { CDComponent } from './qms/client-feedback/cd/cd.component';
import { CFPositiveFeedbackComponent } from './qms/client-feedback/cfpositive-feedback/cfpositive-feedback.component';
import { AdminComponent } from './qms/admin/admin.component';
import { AdminViewComponent } from './qms/admin/admin-view/admin-view.component';
import { ScorecardsComponent } from './qms/admin/scorecards/scorecards.component';

const routes: Routes = [
  {
    path: '',
    component: QMSComponent,
    children: [
      { path: '', redirectTo: 'personalFeedback', pathMatch: 'prefix' },
      {
        path: 'personalFeedback',
        component: PersonalFeedbackComponent,
        children: [
          { path: '', redirectTo: 'internalFeedback', pathMatch: 'prefix'},
          { path: 'internalFeedback', component: InternalComponent,  runGuardsAndResolvers: 'always' },
          { path: 'externalFeedback', component: ExternalComponent, runGuardsAndResolvers: 'always' },
          { path: 'positiveFeedback', component: PositiveFeedbackComponent, runGuardsAndResolvers: 'always' },
          { path: 'feedbackByMe', component: FeedbackBymeComponent, runGuardsAndResolvers: 'always' }
        ]
      },
      { path: 'pendingFeedback', component: ReviewerDetailViewComponent },
      { path: 'managerView', component: ManagerViewComponent, runGuardsAndResolvers: 'always' },
      {
        path: 'clientFeedback',
        component: ClientFeedbackComponent,
        children: [
          { path: '', redirectTo: 'cfpositiveFeedback', pathMatch: 'prefix'},
          { path: 'clientDissatisfaction', component: CDComponent,  runGuardsAndResolvers: 'always' },
          { path: 'cfpositiveFeedback', component: CFPositiveFeedbackComponent, runGuardsAndResolvers: 'always' }
        ]
      },
      
      { path: 'adminView', 
        component: AdminComponent,
        children: [
          { path: '', redirectTo: 'retrospectiveFeedback', pathMatch: 'prefix'},
          { path: 'retrospectiveFeedback', component: AdminViewComponent,  runGuardsAndResolvers: 'always' },
          { path: 'scorecards', component: ScorecardsComponent, runGuardsAndResolvers: 'always' }
        ]
      }
    ]
  },
  // {
  //   path: 'qmsFeedbackPopup',
  //   component: ExternalPopupCallComponent
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QmsRoutingModule { }
