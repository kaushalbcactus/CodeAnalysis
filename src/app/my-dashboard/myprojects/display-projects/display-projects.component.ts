import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchProjectsComponent } from '../../search-projects/search-projects.component';
import { AllProjectsComponent } from 'src/app/projectmanagement/projectmanagement/all-projects/all-projects.component';
@Component({
  selector: 'app-display-projects',
  templateUrl: './display-projects.component.html',
  styleUrls: ['./display-projects.component.css'],
  providers:[AllProjectsComponent, SearchProjectsComponent]
})
export class DisplayProjectsComponent implements OnInit {
  @ViewChild('searchProject', {static:true}) searchProject: SearchProjectsComponent;
  constructor( 
    public allProject: AllProjectsComponent) { }

  ngOnInit() {
  }

  callOutput(event) {
    alert('Call');
    this.searchProject.getProjectDetails(event);
  }

}
