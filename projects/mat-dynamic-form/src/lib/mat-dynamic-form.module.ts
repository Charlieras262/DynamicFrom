import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDynamicFormComponent } from './mat-dynamic-form.component';
import { MaterialModule } from './material-module';
import { AdDirective } from './directive/append-component.directive';
import { SinitizeHtmlPipe } from './pipes/sinitize-html.pipe';
import { UploadFileComponent } from './components/upload-file/upload-file.component';

@NgModule({
  declarations: [MatDynamicFormComponent, AdDirective, SinitizeHtmlPipe, UploadFileComponent],
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
