import { Platform } from '@angular/cdk/platform';
import { Optional, Provider, SkipSelf } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';

/** Returns the app's DateAdapter if it provides one, or a NativeDateAdapter otherwise. */
export function mdfDateAdapterFactory(parent: DateAdapter<any> | null, locale: string, platform: Platform): DateAdapter<any> {
  return parent ?? new NativeDateAdapter(locale, platform);
}

/** Returns the app's MAT_DATE_FORMATS if it provides them, or the native formats otherwise. */
export function mdfDateFormatsFactory(parent: MatDateFormats | null): MatDateFormats {
  return parent ?? MAT_NATIVE_DATE_FORMATS;
}

/**
 * Component-level date providers. Importing MatNativeDateModule in the library module would register the native
 * adapter in the app's root injector and, depending on the import order, replace the adapter the app configured
 * (for example MomentDateAdapter) for every datepicker of the app. Provided on the components instead, they only
 * fill the gap when the app has no adapter.
 */
export const DATE_FALLBACK_PROVIDERS: Provider[] = [
  {
    provide: DateAdapter,
    useFactory: mdfDateAdapterFactory,
    deps: [[new Optional(), new SkipSelf(), DateAdapter], MAT_DATE_LOCALE, Platform],
  },
  {
    provide: MAT_DATE_FORMATS,
    useFactory: mdfDateFormatsFactory,
    deps: [[new Optional(), new SkipSelf(), MAT_DATE_FORMATS]],
  },
];
