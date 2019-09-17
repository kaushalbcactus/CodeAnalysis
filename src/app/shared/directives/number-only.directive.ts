import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Directive({
  selector: '[appNumberOnly]'
})
export class NumberOnlyDirective implements OnInit {

  private element: HTMLInputElement;
  constructor(
    private el: ElementRef,
    private messageService: MessageService
  ) {
    //elRef will get a reference to the element where
    //the directive is placed
    this.element = el.nativeElement;
  }

  ngOnInit() {
  }

  @HostListener('keypress', ['$event']) keypress(e) {
    let charCode = (e.which) ? e.which : e.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      this.messageService.add({ key: 'fdToast', severity: 'error', summary: 'Error message', detail: 'Please enter only numbers.', life: 3000 });
      return false;
    }
    return true;
  }

}
