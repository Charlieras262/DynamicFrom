import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { Button, Checkbox, DatePicker, Dropdown, FormListener, FormStructure, Input, InputFile, InputPassword, OptionChild, RadioGroup, TextArea } from 'projects/mat-dynamic-form/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, FormListener {

  formStructure: FormStructure;

  constructor() {
    this.createFormStructure();
  }

  createFormStructure() {
    this.formStructure = new FormStructure();

    this.formStructure.title = 'Registro de Usuarios';
    this.formStructure.appearance = 'legacy';
    this.formStructure.globalValidators = Validators.required;
    this.formStructure.nodes = [
      new Input('nombre', 'Nombre').apply({ icon: 'person' }).apply({ action: { callback: this, type: 'change' } }),
      new Input('tel', 'Telefono').apply({ icon: 'person' }),
      new DatePicker('fNac', 'Fecha de Nacimiento'),
      new Dropdown('estadoCivil', 'Estado Civil', [new OptionChild('No especifica', 'NE'), new OptionChild('Soltero', 'ES', true), new OptionChild('Casado', 'EC')]).apply({ disabled: true }),
      new InputFile('imagenPerfil', 'Imagen de Perfil').apply({ accept: '.png, .jpg, .jpeg' }),
      new RadioGroup('tieneMascota', 'Tiene Mascota', [new OptionChild('Si', 'y'), new OptionChild('No', 'n', true)]).apply({ action: { type: 'change', callback: this } }),
      new InputPassword('pass', 'Contraseña'),
      new TextArea('comentarios', 'Comentarios').apply({ singleLine: true, validator: Validators.maxLength(100), maxCharCount: 100 }),
      new Checkbox('terms', `Terminos y condiciones, <strong><a href='https://www.google.com'>mas.<a></strong>`).apply({ singleLine: true, validator: Validators.requiredTrue })
    ]
    this.formStructure.confirmActions = [
      new Button('guardar', 'Guardar', { callback: this, style: 'primary' }).apply({ validateForm: false }),
      new Button('cancelar', 'Cancelar', { callback: this, style: 'warn' })
    ]
  }

  ngOnInit(): void {
  }

  onEvent(id: string, value: any): void {
    console.log(id, value)
    if (id == 'tieneMascota') {
      const nodes = [
        new Dropdown('tipoMascota', 'Tipo de Mascota', [{ title: 'Perro', value: 'MP' }, { title: 'Gato', value: 'MG' }]),
        new Input('raza', 'Raza de la Mascota'),
        new Input('nombreMascota', 'Nombre de la Mascota')
      ]
      if (value == 'y') {
        this.formStructure.createNodes(6, nodes)
      } else this.formStructure.removeNodes(nodes)
    }
  }

  onClick(actionId: string): void {
    switch (actionId) {
      case 'guardar':
        this.formStructure?.setValue([{ key: 'nombre', value: 'Carlos' }, { key: 'tieneMascota', value: 'y' }])
        console.log(this.formStructure?.getValue());
        break;
      case 'cancelar':
        console.log('From: ', this.formStructure?.getValue())
        this.formStructure?.reset();
        console.log('cancelar');
        break;
    }
  }

  changeTheme(event) {
    this.formStructure.appearance = event.value;
  }
}
