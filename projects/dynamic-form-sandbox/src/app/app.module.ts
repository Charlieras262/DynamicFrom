import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormModule } from 'mat-dynamic-form';
import { InputComponent } from './input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'projects/mat-dynamic-form/src/lib/material-module';

@NgModule({
  declarations: [
    AppComponent,
    InputComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDynamicFormModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  providers: [
    //{ provide: MAT_DATE_LOCALE, useValue: 'es-GT' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
