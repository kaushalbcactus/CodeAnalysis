import { Component, OnInit, ViewChild, OnDestroy, ApplicationRef, NgZone, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { GlobalService } from '../../../../Services/global.service';
import { UserFeedbackComponent } from '../../user-feedback/user-feedback.component';
import { CommonService } from '../../../../Services/common.service';
import { DataService } from '../../../../Services/data.service';
import { Router, NavigationEnd } from '@angular/router';
import { PlatformLocation, LocationStrategy } from '@angular/common';
import { QMSConstantsService } from '../../services/qmsconstants.service';
import { MessageService } from 'primeng/api';
import { QMSCommonService } from '../../services/qmscommon.service';


@Component({
  selector: 'app-internal',
  templateUrl: './internal.component.html',
  styleUrls: ['./internal.component.css']
})
export class InternalComponent implements OnInit, OnDestroy {
  // Initialize UserFeedComponent as child component
  // @Output() feedbackForMe = new EventEmitter<any[]>();
  public feedbackForMe;
  @ViewChild(UserFeedbackComponent, { static: true }) feedbackTable: UserFeedbackComponent;
  public globalInternalFeedback = this.global.personalFeedback.internal;
  public internalTasks = [];
  private filterObj = {};
  public sub; navigationSubscription;
  public ratingHeaderLength = 'Long';
  constructor(
    public global: GlobalService,
    public common: CommonService,
    private data: DataService,
    private router: Router,
    private qmsConstatsService: QMSConstantsService,
    private qmsCommon: QMSCommonService,
    private messageService: MessageService,
    private platformLocation: PlatformLocation,
    private locationStrategy: LocationStrategy,
    private readonly _router: Router,
    _applicationRef: ApplicationRef,
    zone: NgZone
  ) {
    history.pushState(null, null, window.location.href);
    platformLocation.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      zone.run(() => _applicationRef.tick());
    });
    // tslint:disable: max-line-length
    if ((this.qmsConstatsService.qmsToastMsg.hideManager || this.qmsConstatsService.qmsToastMsg.hideAdmin || this.qmsConstatsService.qmsToastMsg.hideReviewerTaskPending)) {
      this.showToastMsg();
    }
  }

  async initialisePFInternal() {
    // Set default values and re-fetch any data you need.
    this.data.filterObj.subscribe(filter => this.filterObj = filter);
    await this.feedbackTable.applyFilters(this.filterObj);
    this.internalTasks = this.feedbackTable.UFRows;
    this.feedbackForMe = this.internalTasks;
    this.global.personalFeedback.internal.assignedTo = {
      ID: this.global.currentUser.userId,
      title: this.global.currentUser.title,
      designation: this.global.currentUser.designation
    };
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.qmsCommon.selectedComponent = this;
    this.initialisePFInternal();

  }

  showToastMsg() {
    setTimeout(() => {
      this.messageService.add({
        key: 'qmsAuth', severity: 'info', life: 3000,
        summary: 'Info Message', detail: 'You don\'\t have permission'
      });
      // this.qmsConstatsService.qmsToastMsg.hideManager = false;
      this.qmsConstatsService.qmsToastMsg.hideManager = false;
      this.qmsConstatsService.qmsToastMsg.hideAdmin = false;
      this.qmsConstatsService.qmsToastMsg.hideReviewerTaskPending = false;
    }, 300);
  }

  /**
   * This event is called when filter component emits callApplyFilter and pass object to userFeedback table
   *
   * @param obj - Filter Object
   *
   */
    callUserFeedbackTable(obj) {
    if (obj === 'All') {
      this.initialisePFInternal();
    } else {
      this.feedbackTable.applyArrayFilter(obj);
    }

  }

  /**
   * It recieves average rating property emitted by child component userFeedback
   *
   * @param  averageRating - Emitted Property
   *
   */
  setAverageRating(averageRating) {
    this.globalInternalFeedback.averageRating = averageRating;
  }

  // setTask(event) {
  //   this.internalTasks = event;
  //   this.feedbackForMe.emit(this.internalTasks);
  // }
  downloadExcel(uf) {
    uf.exportCSV();
  }
}
