import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe} from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../primeng/primeng.module';
import { QmsRoutingModule } from './qms-routing.module';
import { PersonalFeedbackComponent } from './qms/personal-feedback/personal-feedback.component';
import { FeedbackPopupComponent } from './qms/reviewer-detail-view/feedback-popup/feedback-popup.component';
import { InternalComponent } from './qms/personal-feedback/internal/internal.component';
import { ExternalComponent } from './qms/personal-feedback/external/external.component';
import { FiltersComponent } from './qms/filters/filters.component';
import { ReviewerDetailViewComponent} from './qms/reviewer-detail-view/reviewer-detail-view.component';
import { UserFeedbackComponent } from './qms/user-feedback/user-feedback.component';
import { ManagerViewComponent } from './qms/manager-view/manager-view.component';
import { QMSComponent } from './qms/qms.component';
import { AdminViewComponent } from './qms/admin/admin-view/admin-view.component';
import { CDComponent } from './qms/client-feedback/cd/cd.component';
import {ActionsPopupComponent} from './qms/client-feedback/cd/actions-popup/actions-popup.component';
import { FilterComponent } from './qms/client-feedback/filter/filter.component';
import { ClientFeedbackComponent } from './qms/client-feedback/client-feedback.component';
import { CFPositiveFeedbackComponent } from './qms/client-feedback/cfpositive-feedback/cfpositive-feedback.component';
import {PositiveFeedbackComponent} from './qms/personal-feedback/positive-feedback/positive-feedback.component';
import { PopupComponent } from './qms/client-feedback/cfpositive-feedback/popup/popup.component';
import { FeedbackBymeComponent } from './qms/personal-feedback/feedback-byme/feedback-byme.component';
import { ScorecardsComponent } from './qms/admin/scorecards/scorecards.component';
import { AdminComponent } from './qms/admin/admin.component';

@NgModule({
  declarations: [
    PersonalFeedbackComponent,
    FeedbackPopupComponent,
    InternalComponent,
    ExternalComponent,
    FiltersComponent,
    UserFeedbackComponent,
    ManagerViewComponent,
    QMSComponent,
    AdminViewComponent,
    CDComponent,
    ActionsPopupComponent,
    FilterComponent,
    ClientFeedbackComponent,
    CFPositiveFeedbackComponent,
    PositiveFeedbackComponent,
    PopupComponent,
    FeedbackBymeComponent,
    ScorecardsComponent,
    AdminComponent,
    ReviewerDetailViewComponent
  ],
  imports: [
    CommonModule,
    QmsRoutingModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    NgbModule,
    PrimengModule
  ],
  exports: [
    FeedbackPopupComponent
  ],
  providers: [DatePipe]
})
export class QmsModule { }
