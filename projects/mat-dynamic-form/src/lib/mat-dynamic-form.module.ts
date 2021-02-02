import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDynamicFormComponent } from './mat-dynamic-form.component';
import { MaterialModule } from './material-module';
import { MaterialFileInputModule } from 'ngx-material-file-input';

@NgModule({
  declarations: [MatDynamicFormComponent],
  imports: [
    CommonModule,
    BrowserModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialFileInputModule
  ],
  exports: [MatDynamicFormComponent]
})
export class MatDynamicFormModule { }
