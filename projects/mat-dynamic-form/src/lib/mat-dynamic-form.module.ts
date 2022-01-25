import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDynamicFormComponent } from './mat-dynamic-form.component';
import { MaterialModule } from './material-module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { AdDirective } from './directive/append-component.directive';

@NgModule({
  declarations: [MatDynamicFormComponent, AdDirective],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialFileInputModule
  ],
  exports: [
    MatDynamicFormComponent
  ]
})
export class MatDynamicFormModule { }
