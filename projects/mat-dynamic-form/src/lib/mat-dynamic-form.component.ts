import { ReturnStatement } from '@angular/compiler';
import { AfterViewInit, Component, ComponentFactoryResolver, DoCheck, Input, KeyValueDiffer, KeyValueDiffers, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdDirective } from './directive/append-component.directive';
import { FormStructure } from './models/FormStructure';
import { Button, Node, CustomNode } from './models/Node';

@Component({
  selector: 'mat-dynamic-form',
  templateUrl: 'mat-dynamic-form.component.html',
  styleUrls: ['mat-dynamic-form.component.scss'],
})
export class MatDynamicFormComponent implements OnInit, AfterViewInit, DoCheck {

  @Input('structure') structure!: FormStructure;
  viewInitialized = false;
  formGroup: FormGroup;
  hide = true;

  differ: KeyValueDiffer<Node[], any>;

  @ViewChildren(AdDirective) containers!: QueryList<AdDirective>

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
  }

  ngDoCheck() {
    const change = this.differ.diff(this.structure.nodes);
    if (change) {
      if (this.structure?.fromGroupSize() == 0)
        change.forEachAddedItem(item => {
          this.structure?.createFormControl(item.currentValue);
        });
      if (this.viewInitialized) this.addEvents();
    }
  }

  ngAfterViewInit(): void {
    this.addEvents();
    this.viewInitialized = true
    this.createCustomNodes();
  }

  getControlLenght(id: string) {
    return this.structure.getControlById(id)?.value?.length ?? 0;
  }

  addEvents() {
    this.structure.nodes.forEach(node => {

      const item = document.getElementById(node.id);

      if (node instanceof Button) {
        return item.addEventListener(node?.action?.type, () => {
          node.action?.callback?.onClick?.(node.id);
          node.action?.onEvent?.({ event, structure: this.structure });
        });
      }

      if (node.action?.type == 'valueChange') {
        this.structure?.getControlById(node.id)?.valueChanges?.subscribe(value => {
          if (node.value != value) {
            /** TODO delete property in version 1.5.0 */
            node.action?.callback?.onEvent?.(node.id, value);
            node.action?.onEvent?.({ event: value, structure: this.structure });
          };
        })
      } else {
        item?.addEventListener(node.action?.type?.toString(), (event) => {
          const value = this.structure?.getControlById(node.id).value;
          if (node.value != value) {
            /** TODO delete property in version 1.5.0 */
            node.action?.callback?.onEvent?.(node.id, value);
            node.action?.onEvent?.({ event, structure: this.structure });
          };
        })
      }
    });
  }

  createCustomNodes() {
    this.containers.forEach(container => {
      setTimeout(() => {
        const node = this.structure.nodes.find(node => node.id == container.nodeId);
        if (node instanceof CustomNode) {
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
        }
      }, 10);
    });
  }
}
