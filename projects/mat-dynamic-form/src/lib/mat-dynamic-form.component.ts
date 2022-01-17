import { AfterViewInit, Component, DoCheck, Input, KeyValueDiffer, KeyValueDiffers, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormStructure } from './models/FormStructure';
import { Button, Node } from './models/Node';

@Component({
  selector: 'mat-dynamic-form',
  templateUrl: 'mat-dynamic-form.component.html',
  styleUrls: ['mat-dynamic-form.component.scss']
})
export class MatDynamicFormComponent implements OnInit, AfterViewInit, DoCheck {

  @Input()
  structure: FormStructure;
  viewInitialized = false;
  formGroup: FormGroup;
  hide = true;

  differ: KeyValueDiffer<Node[], any>;
  constructor(
    private _formBuilder: FormBuilder,
    private differs: KeyValueDiffers
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
          this.structure?.createFormControl(item.currentValue)
        });
      if (this.viewInitialized) this.addEvents()
    }
  }

  ngAfterViewInit(): void {
    this.addEvents();
    this.viewInitialized = true
  }

  addEvents() {
    this.structure.nodes.forEach(node => {
      if (node instanceof Button) return

      const item = document.getElementById(node.id);

      if (node.action?.type == 'change') {
        this.structure?.getControlById(node.id)?.valueChanges?.subscribe(value => {
          if (node.value != value) node.action?.callback?.onEvent(node.id, value);
        })
      } else {
        item?.addEventListener(node.action?.type?.toString(), () => {
          const value = this.structure?.getControlById(node.id).value;
          if (node.value != value) node.action?.callback?.onEvent(node.id, value);
        })
      }
    });
  }
}
