import { AfterViewInit, Component, DoCheck, Input, KeyValueDiffer, KeyValueDiffers, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormStructure } from './models/FormStructure';
import { Button, Dropdown, Node, RadioGroup } from './models/Node';

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
    this.structure.setFromGroup(this.formGroup);
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
    console.log(nodes)
    this.nodeGroupedByPair = new Array<Array<Node>>(nodes.length)
    let pair = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.singleLine && !(node instanceof Button)) {
        console.log("Sinlge Not Button")
        this.pushPair(this.nodeGroupedByPair, [node])
      } else {
        pair.push(node)
        if (pair.length == 2) {
          console.log("Pair complete")
          this.pushPair(this.nodeGroupedByPair, pair)
          pair = []
        } else if (pair.length > 0 && i == nodes.length - 1 || nodes[i + 1 >= nodes.length ? i : i + 1].singleLine) {
          console.log("")
          this.pushPair(this.nodeGroupedByPair, pair)
        }
      }
    }
  }

  pushPair(array, item) {
    if(!array.includes(item)) array.push(item)
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
