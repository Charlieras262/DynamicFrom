import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatFormFieldAppearance } from "@angular/material/form-field";
import { ReferenceException } from "../exceptions/Exceptions";
import { DataSet } from "./DataSet";
import { Button, Dropdown, Node, RadioGroup, Validator, AsyncValidator } from "./Node";

export class FormStructure {
    title: string;
    nodes: Node[];
    confirmActions: Button[]
    appearance?: MatFormFieldAppearance = 'standard'
    showTittle?: boolean = true
    private formGroup?: FormGroup;
    globalValidators?: ValidatorFn | ValidatorFn[] | null;

    constructor();
    constructor(title?: string, nodes?, confirmActions?: Button[]) {
        if (confirmActions?.length > 4)
            throw new Error("No se permiten mas de 4 acciones de confirmación.");

        this.showTittle = true;
        this.title = title;
        this.nodes = nodes;
        this.confirmActions = confirmActions;
    }

    setFromGroup(formGroup: FormGroup): void {
        this.formGroup = formGroup
    }

    getControlById(controlName: string): AbstractControl {
        return this.formGroup.get(controlName)
    }

    reset(): boolean {
        try {
            this.formGroup?.reset();
            this.remapNodes();
        } catch (error) {
            return false;
        }
        return true;
    }

    getValue(): JSON {
        return this.formGroup?.value;
    }

    setValue(newValue: DataSet[]): boolean {
        if (!this.formGroup) return false;
        newValue.map(item => {
            const control = this.getControlById(item.key);
            if (control) control.setValue(item.value)
            else throw new ReferenceException(`No se pudo encontrar el identificador: "${item.key}" en el formulario.`);
        })
        return true;
    }

    isValid(): boolean {
        return this.formGroup?.valid
    }

    isInalid(): boolean {
        return this.formGroup?.invalid
    }

    createNodes(from: number, nodes: Node[]) {
        nodes.map(node => {
            this.createNode(from++, node)
        });
    }

    createNode(position: number, node: Node) {
        this.createFormControl(node)
        if (this.nodes.find(item => item.id == node.id)) return;
        if (position >= 0)
            this.nodes.splice(position, 0, node);
    }

    removeNodes(nodes: Node[]) {
        nodes.map(node => {
            this.removeNode(node)
        });
    }

    removeNode(node: Node) {
        this.removeFormControl(node)
        const index = this.nodes.indexOf(this.nodes.find(item => item.id == node.id));

        console.log(index)
        if (index >= 0)
            this.nodes.splice(index, 1);
    }

    fromGroupSize(): number {
        return this.countControls(this.formGroup)
    }

    removeFormControl(node: Node) {
        this.formGroup?.removeControl(node.id)
    }

    createFormControl(node: Node) {
        let value;

        if (node instanceof Button) return;

        if (node instanceof Dropdown || node instanceof RadioGroup) {
            value = this.getSelectedChild(node);
        } else {
            value = node.value;
        }

        if (this.formGroup?.contains(node.id)) {
            console.log(node.id)
            console.log(this.getControlById(node.id))
            return this.getControlById(node.id).setValue(value ?? '');
        }

        const control = new FormControl(value ?? '', node.validator, node.asyncValidator);
        if (node.disabled) {
            control.disable();
        }

        this.addControlValidators(control, this.globalValidators);
        this.formGroup?.addControl(node.id, control);
    }

    addValidators(id: string, validators: Validator) {
        const control = this.getControlById(id);
        this.addControlValidators(control, validators);
    }

    addAsyncValidators(id: string, validators: AsyncValidator) {
        const control = this.getControlById(id);
        this.addAsyncControlValidators(control, validators);
    }

    setValidator(id: string, validators: Validator) {
        const control = this.getControlById(id);
        control.setValidators(validators)
    }

    private remapNodes(){
        this.nodes.map(node => {
            this.createFormControl(node);
        })
    }

    private addControlValidators(control: AbstractControl, validators: Validator) {
        const oldValidator = control.validator;
        control.setValidators(validators)
        const newValidator = control.validator;
        control.updateValueAndValidity()

        control.setValidators(Validators.compose([oldValidator, newValidator]))
    }

    private addAsyncControlValidators(control: AbstractControl, validators: AsyncValidator) {
        const oldValidator = control.asyncValidator;
        control.setAsyncValidators(validators)
        const newValidator = control.asyncValidator;
        control.updateValueAndValidity()

        control.setAsyncValidators([oldValidator, newValidator])
    }

    private getSelectedChild(node: Dropdown | RadioGroup): string {
        const child = node.value.find(item => item.selected);

        return child?.value
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