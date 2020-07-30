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
import { QmsAuthGuard } from './auth/qms-auth.guard';

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
          { path: '', redirectTo: 'internalFeedback', pathMatch: 'prefix' },
          { path: 'internalFeedback', component: InternalComponent },
          { path: 'externalFeedback', component: ExternalComponent },
          { path: 'positiveFeedback', component: PositiveFeedbackComponent },
          { path: 'feedbackByMe', component: FeedbackBymeComponent }
        ]
      },
      { path: 'pendingFeedback', component: ReviewerDetailViewComponent, canActivate: [QmsAuthGuard] },
      { path: 'managerView', component: ManagerViewComponent, canActivate: [QmsAuthGuard] },
      {
        path: 'clientFeedback',
        component: ClientFeedbackComponent,
        children: [
          { path: '', redirectTo: 'clientDissatisfaction', pathMatch: 'prefix' },
          { path: 'clientDissatisfaction', component: CDComponent },
          { path: 'cfpositiveFeedback', component: CFPositiveFeedbackComponent }
        ]
      },
      {
        path: 'adminView',
        component: AdminComponent,
        canActivate: [QmsAuthGuard],
        children: [
          { path: '', redirectTo: 'retrospectiveFeedback', pathMatch: 'prefix' },
          { path: 'retrospectiveFeedback', component: AdminViewComponent },
          { path: 'scorecards', component: ScorecardsComponent }
        ]
      }
    ],
    runGuardsAndResolvers: 'always'
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
