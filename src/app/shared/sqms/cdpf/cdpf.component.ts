import { Component, OnInit, Input } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-cdpf',
  templateUrl: './cdpf.component.html',
  styleUrls: ['./cdpf.component.css']
})
export class CdpfComponent implements OnInit {
  @Input() prjCode: string;
  public filterObj = {
    projectCode: ''
  };
  public navLinks = [
    { label: 'Client Dissatisfaction' },
    { label: 'Positive Feedback' }
  ];
  constructor(private popupData: DynamicDialogConfig, public popupConfig: DynamicDialogRef) { }

  ngOnInit() {
    const projectCode: string = this.popupData.data ? this.popupData.data.projectCode : this.prjCode ? this.prjCode : '';
    this.filterObj.projectCode = projectCode ? projectCode : '';
  }

}
