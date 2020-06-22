import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Options } from 'ng5-slider';
@Component({
  selector: 'app-allocation-slider',
  templateUrl: './allocation-slider.component.html',
  styleUrls: ['./allocation-slider.component.css']
})
export class AllocationSliderComponent implements OnInit {
  // tslint:disable: no-input-rename
  @Input('range') rangeSlider: any;
  @Input('value') value: any;
  @Input('type') type: any;
  @Output() changedValue = new EventEmitter<any>();
  sliderValue = 0;
  options: Options = {
    floor: 0,
    ceil: 1,
    step: 1,
    showTicks: true,
    showTicksValues: true,
  };
  constructor() { }

  ngOnInit() {
    const range = this.rangeSlider;
    this.options.step = this.type === 'hrs' ? 1 : 15;
    this.options.ceil = range;
    this.sliderValue = this.value;
  }

  /**
   * Emits value changed from slider on edit allocation
   */
  emitValue(value) {
    this.changedValue.emit({
      type: this.type,
      value
    });
  }

  /**
   * Retrieves hrs and mins from string
   */
  getHrsMinsObj(hrs: number, isSliderRange: boolean): any {
    const strhrs = '' + hrs;
    const hours: number = strhrs.indexOf('.') > -1 ? +strhrs.split('.')[0] : +strhrs;
    const mins: number = strhrs.indexOf('.') > 0 ? +strhrs.split('.')[1] : isSliderRange ? 45 : 0;
    return {
      hours, mins
    };
  }
}
