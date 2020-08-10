import { Directive, ElementRef, HostListener, OnInit, Input, HostBinding } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgControl, FormControlName } from '@angular/forms';
import { CommonService } from 'src/app/Services/common.service';
import { ConstantsService } from 'src/app/Services/constants.service';

@Directive({
    selector: '[inputPatteren]'
})
export class InputPatterenDirective implements OnInit {

    @Input() pattern: string;

    @HostBinding('value') value: string;

    private element: HTMLInputElement;
    constructor(
        private el: ElementRef,
        public model: FormControlName,
        private common:CommonService,
        private constants:ConstantsService
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
                this.common.showToastrMessage(this.constants.MessageType.error,'Allowed special characters are \'-\' and \'_\'.',false);
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
}
