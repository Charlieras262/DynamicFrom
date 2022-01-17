import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatFormFieldAppearance } from "@angular/material/form-field";
import { ReferenceException } from "../exceptions/Exceptions";
import { DataSet } from "./DataSet";
import { Button, Dropdown, Node, RadioGroup, Validator, AsyncValidator } from "./Node";
import { ObjectBase } from "./base/ObjectBase";

export class FormStructure extends ObjectBase {
    title: string;
    nodes: Node[];
    validateActions: Button[]
    appearance?: MatFormFieldAppearance = 'standard'
    showTitle?: boolean = true
    private formGroup?: FormGroup;
    globalValidators?: ValidatorFn | ValidatorFn[] | null;

    constructor();
    constructor(title?: string, nodes?, validateActions?: Button[]) {
        super();
        if (validateActions?.length > 4)
            throw new Error("No se permiten mas de 4 acciones de confirmación.");

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
     * This method returns null if the `controlName` can't be found, otherwise returns
     * the instances of the control that matches with the `controlName`. 
     * 
     * @param controlName The identifier of the control.
     * @returns {AbstractControl | null} Based on `controlName` parameter.
     */
    getControlById(controlName: string): AbstractControl | null {
        return this.formGroup.get(controlName);
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
     * @returns {JSON} A `JSON` object represntative of the `formGroup` values. 
     */
    getValue(): JSON {
        return this.formGroup?.value;
    }

    /**
     * Set to controls of form group the values sent form `newValue`.
     * 
     * @param newValue {DataSet} The array of {@link DataSet} objects.
     * @returns If the operation was success returns true, returns false otherwise.
     */
    setValue(newValue: DataSet[]): boolean {
        if (!this.formGroup) return false;
        newValue.map(item => {
            const control = this.getControlById(item.key);
            if (control) control.setValue(item.value)
            else throw new ReferenceException(`No se pudo encontrar el identificador: "${item.key}" en el formulario.`);
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
     * @see {@link AbstractControl.status}
     *
     * @returns True if this control has failed one or more of its validation checks,
     * false otherwise.
     */
    isInalid(): boolean {
        return this.formGroup?.invalid
    }

    /**
     * Add to the current node list all the `nodes` in the `from` postion.
     * 
     * @param from position where the nodes will be created.
     * @param nodes The nodes that will be created.
     */
    createNodes(from: number, nodes: Node[]) {
        nodes.map(node => {
            this.createNode(from, node)
        });
    }

    /**
     * Removes `nodes` from the current node list..
     * 
     * @param nodes The nodes that will be removed.
     */
    removeNodes(nodes: Node[]) {
        nodes.map(node => {
            this.removeNode(node)
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
        if (node instanceof Button) return;

        const value = node instanceof Dropdown || node instanceof RadioGroup ? node.selectedValue : node.value;


        if (this.formGroup?.contains(node.id)) {
            return this.getControlById(node.id).setValue(value ?? '');
        }

        const control = new FormControl(value ?? '', node.validator, node.asyncValidator);


        this.addControlValidators(control, this.globalValidators);
        this.formGroup?.addControl(node.id, control);
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