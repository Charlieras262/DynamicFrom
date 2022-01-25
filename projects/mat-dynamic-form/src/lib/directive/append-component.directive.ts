import { Directive, Input, ViewContainerRef } from '@angular/core';

export class CustomAppendable { }

@Directive({
  selector: '[adHost]'
})
export class AdDirective {
  @Input() nodeId: string;
  constructor(public viewContainerRef: ViewContainerRef) { }
}