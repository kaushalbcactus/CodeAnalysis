import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConstantsService } from 'src/app/Services/constants.service';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AttributeComponent implements OnInit {
  public navLinks = [{ routerLink: 'bucketMasterData', label: 'Bucket', value: 'BucketMasterData' , command: (event) => {
    this.internalRouter = event.item;
  } },
  { routerLink: 'projectTypes', label: 'Project Types', value: 'ProjectTypes' , command: (event) => {
    this.internalRouter = event.item;
  }},
  { routerLink: 'deliverableTypes', label: 'Deliverable Types', value: 'DeliverableTypes', command: (event) => {
    this.internalRouter = event.item;
  } },
  { routerLink: 'therapeuticAreas', label: 'Therapeutic Areas (TA)', value: 'TherapeuticAreas', command: (event) => {
    this.internalRouter = event.item;
  } },
  { routerLink: 'practiceAreas', label: 'Practice Areas', value: 'PracticeAreas', command: (event) => {
    this.internalRouter = event.item;
  } }];
  internalRouter: MenuItem;

  constructor(
    private constants: ConstantsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.constants.loader.isPSInnerLoaderHidden = true;

    this.internalRouter = this.navLinks.find((c) =>
    this.router.url.includes(c.routerLink)
  )
    ? this.navLinks.find((c) => this.router.url.includes(c.routerLink))
    : this.navLinks[0];

  }

}
