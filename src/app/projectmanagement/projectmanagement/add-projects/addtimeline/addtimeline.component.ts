import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/Services/global.service';
import { debounceTime } from 'rxjs/operators';
import { PmconstantService } from 'src/app/projectmanagement/services/pmconstant.service';
declare var $;
@Component({
  selector: 'app-addtimeline',
  templateUrl: './addtimeline.component.html',
  styleUrls: ['./addtimeline.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddTimelineComponent implements OnInit {
  public timelineAlertMsg: string;
  // tslint:disable-next-line:variable-name
  private _timelineAlert = new Subject<string>();
  constructor(
    public pmObject: PMObjectService,
    public pmConstant: PmconstantService,
    public globalObject: GlobalService
  ) { }

  ngOnInit() {
    this._timelineAlert.subscribe((message) => this.timelineAlertMsg = message);
    this._timelineAlert.pipe(
      debounceTime(5000)
    ).subscribe(() => this.timelineAlertMsg = null);

    if (this.pmObject.addProject.FinanceManagement.BilledBy === this.pmConstant.PROJECT_TYPE.FTE.value) {
      $('#nonStandardTimeline').attr('checked', 'checked');
      $('#standardTimeline').attr('disabled', 'true');
      this.pmObject.isStandardChecked = false;
    } else if (!this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked) {
      this.pmObject.isStandardChecked = true;
      $('#standardTimeline').attr('disabled', 'false');
    }
  }
  goToProjectAttributes() {
    this.pmObject.activeIndex = 1;
  }

  goToFinanceMang() {
    this.pmObject.activeIndex = 3;
  }
  isTimelineChecked(radioName: string) {
    $('#tabProjAttr .formContent').hide();
    if (radioName === 'standard') {
      this.pmObject.isStandardChecked = true;
    } else {
      this.pmObject.isStandardChecked = false;
    }
  }
  public setAlertMessage(message) {
    this._timelineAlert.next(message);
  }
}
