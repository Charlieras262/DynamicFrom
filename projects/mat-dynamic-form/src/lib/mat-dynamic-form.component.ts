import { AfterViewInit, Component, DoCheck, Input, KeyValueDiffer, KeyValueDiffers, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormStructure } from './models/FormStructure';
import { Button, Dropdown, RadioGroup } from './models/Node';

@Component({
  selector: 'mat-dynamic-form',
  templateUrl: 'mat-dynamic-form.component.html',
  styleUrls: ['mat-dynamic-form.component.scss']
})
export class MatDynamicFormComponent implements OnInit, AfterViewInit, DoCheck {

  @Input()
  structure: FormStructure;
  nodeGroupedByPair: Array<Array<any>>;
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
    this.structure.setFromGroup(this.formGroup)
  }
  
  ngDoCheck() {
    const change = this.differ.diff(this.structure.nodes);
    if (change) {
      if (this.structure?.fromGroupSize() == 0)
        change.forEachAddedItem(item => {
          this.structure?.createFormControl(item.currentValue)
        });

      this.groupNodesByPair();
      if (this.viewInitialized) this.addEvents()
    }
  }

  groupNodesByPair() {
    const nodes = this.structure.nodes;
    this.nodeGroupedByPair = new Array<Array<Node>>(nodes.length)
    let pair = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.singleLine) {
        this.nodeGroupedByPair[i] = [node]
      } else {
        pair.push(node)
        if (pair.length == 2) {
          this.nodeGroupedByPair[i] = pair
          pair = []
        } else if (pair.length > 0 && i == nodes.length - 1 || pair.length == 1 && nodes[i + 1 >= nodes.length ? i : i + 1].singleLine) {
          this.nodeGroupedByPair[i] = pair
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.addEvents();
    this.viewInitialized = true
  }

  processEvent(node, value: any) {
    if (node instanceof RadioGroup || node instanceof Dropdown) {
      node.value?.map(item => {
        item.selected = value ? item.value == value || item.title == value : false;
      });
      node.action?.callback?.onEvent(node.id, value);
    } else {
      if (node.value != value) node.action?.callback?.onEvent(node.id, value);
    }
  }

  addEvents() {
    this.structure.nodes.forEach(node => {
      if (node instanceof Button) return

      const item = document.getElementById(node.id);

      if (node.action?.type == 'change') {
        this.structure?.getControlById(node.id)?.valueChanges?.subscribe(value => {
          this.processEvent(node, value);
        })
      } else {
        item?.addEventListener(node.action?.type?.toString(), () => {
          this.processEvent(node, this.structure?.getControlById(node.id).value);
        })
      }
    });
  }
}
