import { Component, OnInit , ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AttributeComponent implements OnInit {
  public navLinks = [ {routerLink: ['/admin/attribute/bucketMasterData'], label: 'Bucket Master Data', value: 'BucketMasterData'},
  {routerLink: ['/admin/attribute/projectTypes'], label: 'Project Types', value: 'ProjectTypes'},
  {routerLink: ['/admin/attribute/deliverableTypes'], label: 'Deliverable Types', value: 'DeliverableTypes'},
  {routerLink: ['/admin/attribute/therapeuticAreas'], label: 'Therapeutic Areas (TA)', value: 'TherapeuticAreas'},
  {routerLink: ['/admin/attribute/practiceAreas'], label: 'Practice Areas', value: 'PracticeAreas'}];

  constructor() { }

  ngOnInit() {
  }

}
