import { Directive, ElementRef, HostListener, OnInit } from "@angular/core";

@Directive({
  selector: "[waitLoader]",
})
export class WaitLoaderDirective {
  constructor(private el: ElementRef) {}

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }

  //   ngOnInit() {

  //     debugger;
  //       if(this.el.nativeElement.classList.hasOwnProperty('show')){
  //         this.el.nativeElement.classList.remove('show');
  //         this.el.nativeElement.classList.remove('show');
  //       } else {
  //         this.el.nativeElement.classList.add('show');
  //         this.el.nativeElement.classList.add('show');
  //       }

  //   }
}
