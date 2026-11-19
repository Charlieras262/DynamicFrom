import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDynamicFormModule } from 'mat-dynamic-form';
import { AppComponent, CustomFieldComponent } from './app.component';

// ?adapter=moment configures moment for the whole app, like apps that use MomentDateAdapter.
const useMoment = typeof location !== 'undefined' && location.search.indexOf('adapter=moment') >= 0;

@NgModule({
  declarations: [AppComponent, CustomFieldComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatDynamicFormModule,
  ],
  providers: useMoment ? [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ] : [],
  bootstrap: [AppComponent],
})
export class AppModule { }
