import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatFormFieldAppearance } from "@angular/material/form-field";
import { ReferenceException } from "../exceptions/Exceptions";
import { DataSet } from "./DataSet";
import { Button, Dropdown, Node, RadioGroup, Validator, AsyncValidator } from "./Node";
import { ObjectBase } from "./base/ObjectBase";

export class FormStructure extends ObjectBase {
    maxParentHeight: string = "100vh";
    onlyScrollContent: boolean = false;
    title: string;
    nodes: Node[];
    _nodeGrid: number = 2;
    set nodeGrid(value: number) {
        if (value < 1) {
            this._nodeGrid = 1;
        } else {
            this._nodeGrid = value;
        }
        if (value > 4) {
            this._nodeGrid = 4;
        } else {
            this._nodeGrid = value;
        }
    };

    get nodeGrid() {
        return this._nodeGrid;
    };

    validateActions: Button[]
    appearance?: MatFormFieldAppearance = 'standard'
    showTitle?: boolean = true
    globalValidators?: ValidatorFn | ValidatorFn[] | null;
    validateEvenDisabled?: boolean = false;

    private formGroup?: FormGroup;

    constructor(title?: string, nodes?, validateActions?: Button[]) {
        super();
        if (validateActions?.length > 4)
            throw new Error("No more than 4 actions are allowed.");

        this.showTitle = true;
        this.title = title;
        this.nodes = nodes;
        this.validateActions = validateActions;

    }

    /**
     * This method sets the `formGroup` variable for the value sent from parameter.
     * 
     * @param formGroup The new instance that will be replace the old one.
     */
    setFromGroup(formGroup: FormGroup): void {
        this.formGroup = formGroup
    }

    /**
     * This method gets the `formGroup` value.
     * 
     * @returns The count of the controls that constains the `FormControl`
     */
    getFormGroup() {
        return this.formGroup;
    }

    /**
     * This method returns null if the `controlId` can't be found, otherwise returns
     * the instances of the control that matches with the `controlId`. 
     * 
     * @param controlId The identifier of the control.
     * @returns {AbstractControl | null} Based on `controlId` parameter.
     */
    getControlById(controlId: string): AbstractControl | null {
        return this.formGroup?.get(controlId);
    }

    /**
     * This method returns null if the `nodeId` can't be found, otherwise returns
     * the instances of the control that matches with the `nodeId`. 
     * 
     * @param nodeId The identifier of the control.
     * @returns {Node} Based on `nodeId` parameter.
     */
    getNodeById<T extends Node>(nodeId: string): T {
        const node = this.nodes.find(node => node.id === nodeId) as T;
        if (node instanceof Dropdown || node instanceof RadioGroup) return node;
        const control = this.getControlById(nodeId);
        if (control) {
            node.value = control.value;
        }
        return node;
    }

    /**
     * This method returns null if the `nodeId` can't be found, otherwise returns
     * the instances of the validate action that matches with the `nodeId`. 
     * 
     * @param nodeId The identifier of the validate action.
     * @returns {Button} Based on `nodeId` parameter.
     */
    getActionById<T extends Node>(nodeId: string): Button {
        return this.validateActions.find(node => node.id === nodeId);
    }

    /**
     * This method as its name says it resets the values of the form group.
     */
    reset(): boolean {
        try {
            this.formGroup?.reset();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * This methods set the default value sent in form structure.
     */
    remapValues() {
        this.nodes.map(node => {
            this.createFormControl(node);
        })
    }

    /**
     * This method return the `formGroup` value
     * 
     * @template T The type of the `formGroup` value.
     * @returns `T` object represntative of the `formGroup` values. 
     */
    getValue<T>(): T {
        return this.formGroup?.value;
    }

    /**
     * This method return the `formGroup` value even if the control is disabled.
     * 
     * @template T The type of the `formGroup` value.
     * @returns `T` object represntative of the `formGroup` values. 
     */
    getRawValue<T>(): T {
        return this.formGroup?.getRawValue();
    }

    /**
     * Set to controls of form group the values sent form `newValue`.
     * 
     * @deprecated Since version 1.4.0. Will be deleted in version 1.5.0. Use {@link FormStructure.patchValue} instead.
     * 
     * @template T The type of the `newValue` parameter.
     * @param newValue {DataSet} The array of {@link DataSet} objects.
     * @returns If the operation was success returns true, returns false otherwise.
     */
    pathValue<T>(newValue: DataSet<T>): boolean {
        if (!this.formGroup) return false;
        Object.keys(newValue).map(item => {
            const control = this.getControlById(item);
            if (control) control.setValue(newValue[item]);
            else throw new ReferenceException(`Could not find identifier: "${item}" in formgroup.`);
        })
        return true;
    }

    /**
     * Set to controls of form group the values sent form `newValue`.
     * 
     * @template T The type of the `newValue` parameter.
     * @param newValue {DataSet} The array of {@link DataSet} objects.
     * @returns If the operation was success returns true, returns false otherwise.
     */
    patchValue<T>(newValue: DataSet<T>): boolean {
        if (!this.formGroup) return false;
        Object.keys(newValue).map(item => {
            const control = this.getControlById(item);
            if (control) control.setValue(newValue[item]);
            else throw new ReferenceException(`Could not find identifier: "${item}" in formgroup.`);
        })
        return true;
    }

    /**
     * A control is `valid` when its `status` is `VALID`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if the control has passed all of its validation tests,
     * false otherwise.
     */
    isValid(): boolean {
        return this.formGroup?.valid
    }

    /**
     * A control is `invalid` when its `status` is `INVALID`.
     *
     * @deprecated Since version 1.4.0. Will be deleted in version 1.5.0. Use {@link FormStructure.isInvalid} instead.
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control has failed one or more of its validation checks,
     * false otherwise.
     */
    isInalid(): boolean {
        return this.formGroup?.invalid
    }

    /**
     * A control is `invalid` when its `status` is `INVALID`.
     *
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control has failed one or more of its validation checks,
     * false otherwise.
     */
    isInvalid(): boolean {
        return this.formGroup?.invalid
    }

    /**
     * Add to the current node list all the `nodes` in the `from` postion.
     * 
     * @param from position where the nodes will be created.
     * @param nodes The nodes that will be created.
     */
    createNodes(from: number, nodes: Node[]) {
        nodes.forEach(node => {
            this.createNode(from, node)
        });
    }

    /**
     * Removes `nodes` from the current node list..
     * 
     * @param nodes The nodes that will be removed.
     */
    removeNodes(nodes: Node[]) {
        nodes.forEach(node => {
            this.removeNode(node)
        });
    }

    /**
     * Add to the current node list all the `nodes` in the `from` postion.
     * 
     * @param from position where the nodes will be created.
     * @param nodes The nodes that will be created.
     */
    createValidateActions(from: number, nodes: Button[]) {
        nodes.forEach(node => {
            this.createValidateAction(from, node)
        });
    }

    /**
     * Removes `nodes` from the current node list..
     * 
     * @param nodes The nodes that will be removed.
     */
    removeValidateActions(nodes: Button[]) {
        nodes.forEach(node => {
            this.removeValidateAction(node)
        });
    }

    /**
     * @returns The count of the controls that constains the `FormControl`
     */
    fromGroupSize(): number {
        return this.countControls(this.formGroup)
    }

    /**
     * Remove a control from the `FormGroup`.
     *
     * @param node The node instace to remove from the collection
     */
    removeFormControl(node: Node) {
        this.formGroup?.removeControl(node.id);
    }

    /**
     * Add a control to the `FromGroup`
     * 
     * @param node The node instance to create in the formgroup control collection.
     */
    createFormControl(node: Node) {
        if (node instanceof Button) return this.addNodeEvent(node);

        const value = node instanceof Dropdown || node instanceof RadioGroup ? node.selectedValue : node.value;

        if (this.formGroup?.contains(node.id)) {
            const control = this.getControlById(node.id);
            if (node.disabled) control.disable(); else control.enable();
            return control.setValue(value ?? '');
        }

        const control = new FormControl({ value: value ?? '', disabled: node.disabled }, node.validator, node.asyncValidator);

        this.addControlValidators(control, this.globalValidators);
        this.formGroup?.addControl(node.id, control);

        this.addNodeEvent(node);
    }

    /**
     * Add the synchronous validators that are active on this control. Calling
     * this method does not overwrite any existing sync validators.
     */
    addValidators(id: string, validators: Validator) {
        const control = this.getControlById(id);
        this.addControlValidators(control, validators);
    }

    /**
     * Add the asynchronous validators that are active on this control. Calling
     * this method does not overwrite any existing async validators.
     */
    addAsyncValidators(id: string, validators: AsyncValidator) {
        const control = this.getControlById(id);
        this.addAsyncControlValidators(control, validators);
    }

    /**
     * Sets the synchronous validators that are active on this control. Calling
     * this method overwrites any existing sync validators.
     */
    setValidator(id: string, validators: Validator) {
        const control = this.getControlById(id);
        control.setValidators(validators);

        control.updateValueAndValidity();
    }

    /**
     * Sets the asynchronous validators that are active on this control. Calling
     * this method overwrites any existing async validators.
     */
    setAsyncValidator(id: string, validators: AsyncValidator) {
        const control = this.getControlById(id);
        control.setAsyncValidators(validators);

        control.updateValueAndValidity();
    }


    /**
     * Add event to the node.
     * 
     * @param node The node instance to add event.
     */
    addNodeEvent(node: Node) {
        setTimeout(() => {
            const item = document.getElementById(node.id);
            const actions = node.action instanceof Array ? node.action : [node.action];

            if (node instanceof Button) {
                return actions.forEach(action => {
                    item?.addEventListener(action?.type ?? 'click', event => {
                        /** TODO delete property in version 1.5.0 */
                        action?.callback?.onClick?.(node.id);
                        action?.onEvent?.({ event: event, structure: this });
                    });
                });
            }

            actions.forEach(action => {
                if (action?.type == 'valueChange') {
                    this.getControlById(node.id)?.valueChanges?.subscribe(value => {
                        if (node.value != value) {
                            /** TODO delete property in version 1.5.0 */
                            action?.callback?.onEvent?.(node.id, value);
                            action?.onEvent?.({ event: value, structure: this });
                        };
                    })
                } else {
                    item?.addEventListener(action?.type?.toString(), event => {
                        const value = this.getControlById(node.id).value;
                        if (node.value != value) {
                            /** TODO delete property in version 1.5.0 */
                            action?.callback?.onEvent?.(node.id, value);
                            action?.onEvent?.({ event, structure: this });
                        };
                    });
                }
            });
        });
    }

    private createNode(position: number, node: Node) {
        this.createFormControl(node)
        if (this.nodes.find(item => item.id == node.id)) return;
        if (position >= 0)
            this.nodes.splice(position, 0, node);
    }

    private removeNode(node: Node) {
        this.removeFormControl(node)
        const index = this.nodes.indexOf(this.nodes.find(item => item.id == node.id));

        if (index >= 0)
            this.nodes.splice(index, 1);
    }

    private createValidateAction(position: number, node: Button) {
        if (!this.validateActions) this.validateActions = [];
        if (this.validateActions.find(item => item.id == node.id)) return;
        if (position >= 0)
            this.validateActions.splice(position, 0, node);
        this.addNodeEvent(node);
    }

    private removeValidateAction(node: Button) {
        if (!this.validateActions) return;
        const index = this.validateActions.indexOf(this.validateActions.find(item => item.id == node.id));
        if (index >= 0)
            this.validateActions.splice(index, 1);
    }

    private addControlValidators(control: AbstractControl, validators: Validator) {
        const oldValidator = control.validator;
        control.setValidators(validators)
        const newValidator = control.validator;

        control.setValidators(Validators.compose([oldValidator, newValidator]));

        control.updateValueAndValidity();
    }

    private addAsyncControlValidators(control: AbstractControl, validators: AsyncValidator) {
        const oldValidator = control.asyncValidator;
        control.setAsyncValidators(validators)
        const newValidator = control.asyncValidator;

        control.setAsyncValidators([oldValidator, newValidator]);

        control.updateValueAndValidity()
    }

    private countControls(control: AbstractControl): number {
        if (control instanceof FormControl) {
            return 1;
        }

        if (control instanceof FormArray) {
            return control.controls.reduce((acc, curr) => acc + this.countControls(curr), 0)
        }

        if (control instanceof FormGroup) {
            return Object.keys(control.controls)
                .map(key => control.controls[key])
                .reduce((acc, curr) => acc + this.countControls(curr), 0);
        }
    }
}