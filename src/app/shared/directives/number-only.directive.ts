import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Directive({
  selector: '[appNumberOnly]'
})
export class NumberOnlyDirective implements OnInit {

  private element: HTMLInputElement;
  constructor(
    private el: ElementRef,
    public common:CommonService,
    public constants:ConstantsService

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
      this.common.showToastrMessage(this.constants.MessageType.error,'Please enter only numbers.',false);
      return false;
    }
    return true;
  }

}
