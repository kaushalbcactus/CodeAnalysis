import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/Services/global.service';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {

  @Output() reloadResources = new EventEmitter<string>();
  constructor(public sharedObject: GlobalService) { }


  ngOnInit() {
    this.sharedObject.resSectionShow = true;
   // this.loadResources();
  }

  public callReloadRes() {
    this.reloadResources.next('callRes');
  }

}
