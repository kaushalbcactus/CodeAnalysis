import { Component, OnInit, ViewChild} from '@angular/core';
import { OverlayPanel } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';
@Component({
  selector: 'app-allocation-overlay',
  templateUrl: './allocation-overlay.component.html',
  styleUrls: ['./allocation-overlay.component.css']
})
export class AllocationOverlayComponent implements OnInit {

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

 /**
  * Display overlay popup
  */
 showOverlay(event, allocationPerDay: string, target?: string) {
   // code commented for phase 2
   if (allocationPerDay) {
     this.setAllocation(allocationPerDay);
     this.panel.show(event, target);
   }
 }

 /**
  * Hide overlay popup
  */
 hideOverlay() {
   this.panel.hide();
 }

 /**
  * Split string of allocationperday and push in to array to generate table
  */
 setAllocation(strAllocation: string): void {
   const allocation = [];
   this.allocation.length = 0;
   const allocationDays = strAllocation.split(/\n/);
   allocationDays.forEach(day => {
     if (day) {
       const arrDateTime: string[] = day.indexOf(':') > -1 ? day.split(':') : [];
       const date: Date = arrDateTime.length ? new Date(arrDateTime[0]) : new Date();
       const time: string = arrDateTime.length > 1 ? (+arrDateTime[1]).toFixed(2) + ':' + (+arrDateTime[2]).toFixed(2) : '';
       const hrsMins: number = this.common.convertFromHrsMins(time);
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
