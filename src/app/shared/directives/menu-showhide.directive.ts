import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';


@Directive({
  selector: '[hideshowMenu]'
})
export class HideShowMenuDirective {
  tempClick: any;
  private element: HTMLInputElement;
  constructor(
    private el: ElementRef,
  ) {
    this.element = el.nativeElement;
  }


  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === 'pi pi-ellipsis-v') {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        if (this.tempClick !== event.target.parentElement.children[0].children[0]) {
          this.tempClick = event.target.parentElement.children[0].children[0];
          this.tempClick.style.display = '';
        } else {
          this.tempClick = undefined;
        }
      } else {
        this.tempClick = event.target.parentElement.children[0].children[0];
        this.tempClick.style.display = '';
      }

    } else {
      if (this.tempClick) {
        this.tempClick.style.display = 'none';
        this.tempClick = undefined;
      }
    }
  }
}
