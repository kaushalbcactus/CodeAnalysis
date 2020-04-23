import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import { OverlayPanel } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-daily-allocation-overlay',
  templateUrl: './daily-allocation-overlay.component.html',
  styleUrls: ['./daily-allocation-overlay.component.css']
})
export class DailyAllocationOverlayComponent implements OnInit {
  // @Input() allocationPerDay: string;
  @ViewChild('op2', { static: false }) panel: OverlayPanel;
  public allocation = [];
  public cols = [];
  constructor(private common: CommonService) { }

  ngOnInit() {
    this.cols = [
      { field: 'date', header: 'Date' },
      { field: 'allocation', header: 'Allocation' },
    ];
  }

  showOverlay(event, allocationPerDay, target?) {
    if (allocationPerDay) {
      this.setAllocation(allocationPerDay);
      this.panel.show(event, target);
    }
  }

  hideOverlay() {
    this.panel.hide();
  }

  setAllocation(strAllocation: string): void {
    const allocation = [];
    this.allocation.length = 0;
    const allocationDays = strAllocation.split(/\n/);
    allocationDays.forEach(day => {
      if (day) {
        const arrDateTime: string[] = day.indexOf(':') > -1 ? day.split(':') : [];
        const date: Date = arrDateTime.length ? new Date(arrDateTime[0]) : new Date();
        const time: string = arrDateTime.length > 1 ? arrDateTime[1] + ':' + arrDateTime[2] : '';
        const hrsMins = this.common.convertFromHrsMins(time);
        const obj = {
          date,
          allocation: hrsMins
        };
        allocation.push(obj);
      }
    });
    this.allocation = [...allocation];
  }
}
