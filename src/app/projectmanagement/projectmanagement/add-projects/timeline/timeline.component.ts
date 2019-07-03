import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PMObjectService } from 'src/app/projectmanagement/services/pmobject.service';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/Services/global.service';
import { debounceTime } from 'rxjs/operators';
declare var $;
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TimelineComponent implements OnInit {
  public timelineAlertMsg: string;
  // tslint:disable-next-line:variable-name
  private _timelineAlert = new Subject<string>();
  constructor(
    public pmObject: PMObjectService,
    public globalObject: GlobalService
  ) { }

  ngOnInit() {
    this._timelineAlert.subscribe((message) => this.timelineAlertMsg = message);
    this._timelineAlert.pipe(
      debounceTime(5000)
    ).subscribe(() => this.timelineAlertMsg = null);
    if (!this.pmObject.addProject.Timeline.NonStandard.IsRegisterButtonClicked) {
      this.pmObject.isStandardChecked = true;
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
