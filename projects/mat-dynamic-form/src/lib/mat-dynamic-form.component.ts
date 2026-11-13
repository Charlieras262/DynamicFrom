import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, DoCheck, Input, KeyValueDiffer, KeyValueDiffers, OnDestroy, OnInit, QueryList, Type, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OptionChild } from './models/OptionChild';
import { AdDirective } from './directive/append-component.directive';
import { FormStructure } from './models/FormStructure';
import { Node, CustomNode, InputNumber, Button } from './models/Node';

@Component({
  selector: 'mat-dynamic-form',
  templateUrl: 'mat-dynamic-form.component.html',
  styleUrls: ['mat-dynamic-form.component.scss'],
})
export class MatDynamicFormComponent implements OnInit, DoCheck, AfterViewInit, OnDestroy {

  @Input('structure') structure!: FormStructure;
  formGroup!: FormGroup;
  hide = true;
  differ: KeyValueDiffer<Node[], any>;

  private readonly onResize = () => this.addInsets();

  @ViewChildren(AdDirective)
  set containers(value: QueryList<AdDirective>) {
    this.createCustomNodes(value);
  }

  constructor(
    private _formBuilder: FormBuilder,
    private differs: KeyValueDiffers,
    private resolver: ComponentFactoryResolver
  ) {
    this.differ = this.differs.find({}).create();
  }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({})
    this.structure.setFromGroup(this.formGroup);
    this.structure.validateActions?.forEach(node => this.structure.addNodeEvent(node));
    setTimeout(() => this.addInsets())
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  ngDoCheck() {
    const nodesChange = this.differ.diff(this.structure.nodes);
    if (nodesChange) {
      if (this.structure?.fromGroupSize() == 0)
        nodesChange.forEachAddedItem(item => {
          this.structure?.createFormControl(item.currentValue);
        });
    }
  }

  ngAfterViewInit(): void {
    // Request focus to first element with autoFocus
    setTimeout(() => {
      const nodes = this.structure.nodes ?? [];
      const autoFocusNode = nodes.find(node => node.autoFocus) ?? nodes[0];
      if (autoFocusNode) {
        const element = document.getElementById(autoFocusNode.id);
        element?.focus();
      }
    });
  }

  getControlLenght(id: string) {
    return this.structure.getControlById(id)?.value?.toString()?.length ?? 0;
  }

  normilizeValue(value: number) {
    return ~~value;
  }

  input(event: Event, node: InputNumber) {
    const input = node.getNativeElement() as HTMLInputElement;
    const decimalCount = node.decimalCount ?? 2;
    const regex = new RegExp(`^-?([0-9]+)(\\.[0-9]{0,${decimalCount == 0 ? '' : decimalCount}})?`, 'gi');
    const test = regex.exec(input.value);
    const control = this.structure.getControlById(node.id);

    if (!(event instanceof InputEvent) || event.inputType == 'deleteContentBackward') return;

    if (test?.[0] != input.value) {
      control.setValue(test?.[0] ?? '');
    }

    if (node.maxCharCount != null && input.value.length >= node.maxCharCount) {
      control.setValue(input.value.slice(0, node.maxCharCount));
    }

    if (node.max != null && parseFloat(input.value) > node.max) {
      control.setValue(node.max.toString());
    }

    if (node.min != null && parseFloat(input.value) < node.min) {
      control.setValue(node.min.toString());
    }

    if (test?.[2]?.length > decimalCount) {
      control.setValue(test?.[0] ?? '');
    }

    if (decimalCount == 0) {
      control.setValue(this.normilizeValue(parseFloat(input.value)).toString());
    }
  }

  change(event: Event, node: InputNumber) {
    this.input(event, node);
    const decimalCount = node.decimalCount ?? 2;
    const regex = new RegExp(`^-?([0-9]+)(\\.[0-9]{0,${decimalCount == 0 ? '' : decimalCount}})?`, 'gi');
    const input = node.getNativeElement() as HTMLInputElement;

    if (input.value.length > 0) {
      const test = regex.exec(input.value);
      if (test[2]?.length == 1) {
        this.structure.getControlById(node.id).setValue(test?.[0]?.split('.')?.[0] ?? '');
      }
    }
  }

  shouldDisable(action: Button): boolean {
    const isDisabled = action.disabled;
    const isInvalidByValidation = !action.validation?.({ event: action, structure: this.structure });

    const shouldValidateForm = action.validateForm;
    const hasStructureErrors = this.structure.isInvalid();
    const hasDisabledErrors = this.structure.validateEvenDisabled && this.hasError();

    return isDisabled || isInvalidByValidation || (shouldValidateForm && (hasStructureErrors || hasDisabledErrors));
  }

  displayFn(option?: OptionChild): string {
    return option?.title ?? '';
  }

  /**
   * Runs the sync validators of disabled controls without enabling them. Mutating the controls here
   * (enable/markAsTouched/disable) runs during change detection and throws ExpressionChangedAfterItHasBeenChecked.
   */
  private hasError(): boolean {
    return (this.structure.nodes ?? []).some(node => {
      if (!node.disabled) return false;
      const control = this.structure.getControlById(node.id);
      return !!control?.validator?.(control);
    });
  }

  private createCustomNodes(containers: QueryList<AdDirective>) {
    containers.forEach(container => {
      setTimeout(() => {
        const node = this.structure.nodes.find(node => node.id == container.nodeId);
        if (node instanceof CustomNode) {
          container.viewContainerRef.clear();
          const factory = this.resolver.resolveComponentFactory<typeof node.component>(node.component,);
          const componentRef = container.viewContainerRef.createComponent<typeof node.component>(factory, 0, container.viewContainerRef.injector);
          node.instance = componentRef.instance;
          if (node.properties) {
            node.properties.control = this.structure.getControlById(node.id);
          } else {
            node.properties = { control: this.structure.getControlById(node.id) };
          }
          Object.keys(node.properties).forEach(key => {
            componentRef.instance[key] = node.properties[key];
          });

          this.addClassesToCustomNodeContainer(componentRef);
        }
      });
    });
  }

  private addInsets() {
    if (!this.structure.onlyScrollContent) return;
    const titleHeight = document.getElementById('mdf_title')?.clientHeight ?? 0;
    const buttonsHeight = document.getElementById('mdf_buttons')?.clientHeight ?? 0;
    const content = document.getElementById('mdf_content');

    if (!content) return;

    content.style.maxHeight = `calc(${this.structure?.maxParentHeight} - ${titleHeight + buttonsHeight}px)`;
    content.style.overflowY = 'auto';
    content.style.overflowX = 'hidden';
  }

  private addClassesToCustomNodeContainer(componentRef: ComponentRef<Type<any>>) {
    const element = componentRef?.location.nativeElement as HTMLElement;
    if (element) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children.item(i) as HTMLElement;
        if (child) {
          child.style.width = '100%';
        }
      }
    }
  }
}
