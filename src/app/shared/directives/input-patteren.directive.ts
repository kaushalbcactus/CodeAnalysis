import { Directive, ElementRef, HostListener, OnInit, Input, HostBinding } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NG_VALUE_ACCESSOR, NgControl, FormControlName } from '@angular/forms';

@Directive({
    selector: '[inputPatteren]'
})
export class InputPatterenDirective implements OnInit {

    @Input() pattern: string;

    @HostBinding('value') value: string;

    private element: HTMLInputElement;
    constructor(
        private el: ElementRef,
        private messageService: MessageService,
        public model: FormControlName
    ) {
        //elRef will get a reference to the element where
        //the directive is placed
        this.element = el.nativeElement;
    }

    ngOnInit() {
    }

    @HostListener('input', ['$event']) onInputChange(event) {
        const initialValue = this.el.nativeElement.value;
        // this.el.nativeElement.value = initialValue.replace(/[^a-zA-Z0-9\s_-]*/g, '');
        if (initialValue) {
            this.el.nativeElement.value = this.checkPatteren(initialValue);
            if (initialValue !== this.el.nativeElement.value) {
                this.messageService.add({ key: 'adminAuth1', severity: 'error', summary: 'Error message', detail: 'Allowed special characters are \'-\' and \'_\'.', life: 3000 });
                event.stopPropagation();
                this.value = initialValue.substring(0, initialValue.length - 1);
                this.model.control.setValue(this.value);
                return this.value;
            }
        }
    }

    checkPatteren(inputStr: string) {
        if (inputStr) {
            return inputStr.replace(/[^a-zA-Z0-9\s_-]*/g, '');
        }
    }

    // @HostListener('keypress', ['$event']) keypress(e) {
    //     let charCode = (e.which) ? e.which : e.keyCode;
    //     if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
    //         this.messageService.add({ key: 'fdToast', severity: 'error', summary: 'Error message', detail: 'Please enter only numbers.', life: 3000 });
    //         return false;
    //     }
    //     return true;
    // }

}
