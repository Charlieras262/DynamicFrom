import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDynamicFormComponent } from './mat-dynamic-form.component';
import { MaterialModule } from './material-module';
import { AdDirective } from './directive/append-component.directive';
import { SinitizeHtmlPipe } from './pipes/sinitize-html.pipe';
import { InputFileComponent } from './components/input-file/input-file.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';

@NgModule({
  declarations: [MatDynamicFormComponent, AdDirective, SinitizeHtmlPipe, InputFileComponent, DateTimePickerComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    MatDynamicFormComponent
  ]
})
export class MatDynamicFormModule { }
