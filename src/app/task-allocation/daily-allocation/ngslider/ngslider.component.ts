import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Options } from 'ng5-slider';
import { TaskAllocationCommonService } from '../../services/task-allocation-common.service';

@Component({
  selector: 'app-ngslider',
  templateUrl: './ngslider.component.html',
  styleUrls: ['./ngslider.component.css']
})
export class NgsliderComponent implements OnInit {
  @Input('range') rangeSlider: any;
  @Input('value') value: any;
  @Input('type') type: any;
  @Input('maxLimit') limit: any;
  @Output() changedValue = new EventEmitter<any>();
  sliderValue = 0;
  options: Options = {
    floor: 0,
    ceil: 1,
    step: 1,
    showTicks: true,
    showTicksValues: true,
    // getTickColor: (value: number): string => {
    //   if ((value > this.rangeSlider - 3) && (this.type === 'hrs')) {
    //     return 'orange';
    //   }
    // }
  };
  constructor(private taskCommonService: TaskAllocationCommonService) { }

  ngOnInit() {
    const range = this.rangeSlider;
    this.options.step = this.type === 'hrs' ? 1 : 15;
    this.options.ceil = range;
    // this.options.getTickColor(this.value);
    this.sliderValue = this.value;
    this.limit = this.getHrsMinsObj(this.limit, true);
  }

  emitValue(value) {
    this.changedValue.emit({
      type: this.type,
      value // this.type === 'hrs' ? value : this.taskCommonService.getMinsValue(value) // value / 100
    });
  }

  getHrsMinsObj(hrs: number, isSliderRange: boolean): any {
    const strhrs = '' + hrs;
    const hours = strhrs.indexOf('.') > -1 ? +strhrs.split('.')[0] : +strhrs;
    const mins = strhrs.indexOf('.') > 0 ? +strhrs.split('.')[1] : isSliderRange ? 45 : 0;
    return {
      hours, mins
    };
  }
}
