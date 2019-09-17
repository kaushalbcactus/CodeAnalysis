import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { UsercapacityComponent } from '../usercapacity/usercapacity.component';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  @ViewChild('userCapacityTask', {static: true}) userCapacity: UsercapacityComponent;
  @Output() closeModalEmit = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
  }

  callUserCapacityModel(oCapacity) {
    this.userCapacity.oCapacity = oCapacity;
    this.userCapacity.calc(oCapacity);
  }

  closeModalPopup() {
    this.closeModalEmit.emit(null);
  }

}
