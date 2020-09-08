import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng';
import { CommonService } from 'src/app/Services/common.service';

@Component({
  selector: 'app-rating-overlay',
  templateUrl: './rating-overlay.component.html',
  styleUrls: ['./rating-overlay.component.css']
})
export class RatingOverlayComponent implements OnInit {

 @ViewChild('op2', { static: false }) panel: OverlayPanel;
 public ratings = [];
 public cols = [];
 constructor(private common: CommonService) { }

 ngOnInit() {
   this.cols = [
     { field: 'Parameter.Title', header: 'Parameter' },
     { field: 'rating', header: 'Rating' },
   ];
 }

 /**
  * Display overlay popup
  */
 showOverlay(event, ratingsSplit, target?: string) {
     this.ratings = ratingsSplit;
     this.panel.show(event, target);
 }

 /**
  * Hide overlay popup
  */
 hideOverlay() {
   this.panel.hide();
 }
}
