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
    getTickColor: (value: number): string => {
      if ((value > this.rangeSlider - 4) && (this.type === 'hrs')) {
        return 'orange';
      }
    }
  };
  constructor() { }

  ngOnInit() {
    const range = this.rangeSlider;
    this.options.step = this.type === 'hrs' ? 1 : 25;
    this.options.ceil = range;
    this.options.getTickColor(this.value);
    this.sliderValue = this.value;
  }

  emitValue(value) {
    this.changedValue.emit({
      type: this.type,
      value: this.type === 'hrs' ? value : value / 100
    });
  }

}
