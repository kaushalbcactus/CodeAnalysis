import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-tag-document',
  templateUrl: './tag-document.component.html',
  styleUrls: ['./tag-document.component.css']
})
export class TagDocumentComponent implements OnInit {
  public files = [];
  public milestones = [];
  constructor(public config: DynamicDialogConfig, public popupConfig: DynamicDialogRef) { }

  ngOnInit() {
    const data = this.config.data ? this.config.data : [];
    this.files = [...data.files];
    this.milestones = data.milestones.map(m => ({ label: m, value: m }));
  }

  tagMilestone() {
    this.popupConfig.close(this.files);
  }

  updateFileName(rowData) {
    rowData.Name = rowData.filenamewithoutExt + rowData.extension;
    // rowData.file.name = rowData.Name;
    Object.defineProperty(rowData.file, 'name', {
      value: rowData.Name,
      writable: false
    });
  }
}
