import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-ngslider',
  templateUrl: './ngslider.component.html',
  styleUrls: ['./ngslider.component.css']
})
export class NgsliderComponent implements OnInit {
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
    this.options.step = this.type === 'hrs' ? 1 : 0.25;
    this.options.ceil = range;
    this.sliderValue = this.value;
  }

  // getHrsSliderRange(range): any[] {
  //   const sliderArray = [];
  //   const strRange = '' + range;
  //   const isMinsRange = strRange.indexOf('.') > -1 ? true : false;
  //   let counter = 0;
  //   while (counter <= range) {
  //     const obj = {
  //       value: counter
  //     };
  //     sliderArray.push(obj);
  //     counter = isMinsRange ? counter + 0.25 : counter + 1;
  //   }
  //   return sliderArray;
  // }

  emitValue(value) {
    this.changedValue.emit({
      type: this.type,
      value
    });
  }

}
