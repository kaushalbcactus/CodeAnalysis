import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter, SimpleChanges } from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
// import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/base64uploadadapter';
import MyCustomUploadAdapterPlugin from './Base64Upload';
@Component({
  selector: 'app-section-editor',
  templateUrl: './section-editor.component.html',
  styleUrls: ['./section-editor.component.scss']
})
export class SectionEditorComponent implements OnInit {
  editor;
  data;
  @Output() editdata = new EventEmitter<string>();
  htmldata;
  customClass;
  obj;
  @Input() editableData;
  public Editor = DecoupledEditor;
  public config = { extraPlugins: [MyCustomUploadAdapterPlugin] }
  constructor() { }


  public onReady(editor) {
    //console.log(editor);

    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
    editor.setData(this.data);
    this.editor = editor;
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    if (changes.editableData !== undefined) {
      this.data = changes.editableData.currentValue;
    }
  }

  ngOnInit() {
  }

  save() {
    this.customClass = ' ';
    let count = 0;
    // if (document.getElementById('ckeditorSection').childNodes[0].lastChild.childNodes[0] !== undefined &&
    //   document.getElementById('ckeditorSection').childNodes[0].lastChild.childNodes[0].firstChild !== null) {
    //   const d1 = document.getElementById('ckeditorSection').childNodes[0].lastChild.childNodes[0].firstChild.childNodes;
    //   for (let i = 1; i <= d1.length; i++) {
    //     count = i;
    //   }
    // }
    const table = document.getElementById('ckeditorSection').querySelector('table');
    if(table) {
      count = table.rows[0].cells.length;
    }
    if (count === 3) {
      this.customClass = 'col3';
    }
    if (count === 4) {
      this.customClass = 'col4';
    }
    if (count === 5) {
      this.customClass = 'col5';
    }
    
    this.htmldata = this.editor.getData();
    this.obj = {
      htmldata: this.htmldata,
      class: this.customClass
    };
    console.log(this.htmldata);
    this.editdata.emit(this.obj);

  }
}
