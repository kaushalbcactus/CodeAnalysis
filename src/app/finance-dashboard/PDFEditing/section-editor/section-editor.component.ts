import { Component, OnInit, Input, OnChanges, SimpleChange, Output , EventEmitter, SimpleChanges } from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component({
  selector: 'app-section-editor',
  templateUrl: './section-editor.component.html',
  styleUrls: ['./section-editor.component.scss']
})
export class SectionEditorComponent implements OnInit , OnChanges {
editor;
data;
@Output() editdata = new EventEmitter<string>();
htmldata;
customClass;
obj;
@Input() editableData;
  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
    if (changes.editableData !== undefined) {
      this.data = changes.editableData.currentValue;
      // console.log(this.data);
      setTimeout(() => {
      DecoupledEditor
    .create( document.querySelector( '.document-editor__editable' ), {
    } )
    .then( editor => {
        this.editor = editor;
        this.editor.setData(this.data);
        const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );
        this.editor = editor;
    } )
    .catch( err => {
        console.error( err );
    } );
  }, 100);
    }
  }

  ngOnInit() {
  }

  save() {
    this.customClass = ' ';
    let count = 0;
    // document.getElementById('table1').rows[0].cells.length;
    if (document.getElementById('table1').childNodes[0].lastChild.childNodes[0] !== undefined &&
    document.getElementById('table1').childNodes[0].lastChild.childNodes[0].firstChild !== null) {
      const d1 = document.getElementById('table1').childNodes[0].lastChild.childNodes[0].firstChild.childNodes;
      for (let i = 1; i <= d1.length; i++) {
        count = i;
      }
    }
    // console.log(d1);
// tslint:disable-next-line: prefer-for-of
    // console.log(count);
    if (count === 3) {
      this.customClass = 'col3';
      // document.getElementById('table1').innerHTML.replace(/&nbsp;/g, '');
    }
    if (count === 4) {
      this.customClass = 'col4';
      // document.getElementById('table1').innerHTML.replace(/&nbsp;/g, '');
    }
    if (count === 6) {
      this.customClass = 'col6';
      // document.getElementById('table1').innerHTML.replace(/&nbsp;/g, '');
    }
    if (count === 10) {
      this.customClass = 'col10';
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
