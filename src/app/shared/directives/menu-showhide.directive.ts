import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';


@Directive({
  selector: '[hideshowMenu]'
})
export class HideShowMenuDirective {
  MenuClick: any;
  filterClick: any;
  private element: HTMLInputElement;
  constructor(
    private el: ElementRef,
  ) {
    this.element = el.nativeElement;
  }


  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className === 'pi pi-ellipsis-v') {
      if (this.MenuClick) {
        this.MenuClick.style.display = 'none';
        if (this.MenuClick !== event.target.parentElement.children[0].children[0]) {
          this.MenuClick = event.target.parentElement.children[0].children[0];
          this.MenuClick.style.display = '';
        } else {
          this.MenuClick = undefined;
        }
      } else {
        this.MenuClick = event.target.parentElement.children[0].children[0];
        this.MenuClick.style.display = '';
      }
      if (this.filterClick) {
        this.filterClick.style.display = 'none';
        this.filterClick = undefined;
      }
     
    }
    //  else  if (event.target.className.includes('pi pi-filter-icon pi-filter') || event.target.className.includes('p-column-filter-menu-button p-link')) {
    //   if (this.filterClick && this.filterClick !== $('.p-column-filter-overlay')[0]) {
    //     this.filterClick.style.display = 'none';
    //     if (this.filterClick !== $('.p-column-filter-overlay')[0]) {
    //       this.filterClick = $('.p-column-filter-overlay')[0];
    //       this.filterClick.style.display = '';
    //     } else {
    //       this.filterClick = undefined;
    //     }
    //   } else {
    //     this.filterClick = $('.p-column-filter-overlay')[0];
    //     this.filterClick.style.display = '';
    //   }
    //   if (this.MenuClick) {
    //     this.MenuClick.style.display = 'none';
    //     this.MenuClick = undefined;
    //   }
    // }
     else {
      // if (this.filterClick) {
      //   this.filterClick.style.display = 'none';
      //   this.filterClick = undefined;
      // }
      if (this.MenuClick) {
        this.MenuClick.style.display = 'none';
        this.MenuClick = undefined;
      }
     
    }
  }
}
