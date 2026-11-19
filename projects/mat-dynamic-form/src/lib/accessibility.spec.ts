import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDynamicFormModule } from './mat-dynamic-form.module';
import { FormStructure } from './models/FormStructure';
import { Button, DateTimePicker, InputFile, InputPassword } from './models/Node';
import { FileUtils } from './utils/file-utils';

@Component({ template: `<mat-dynamic-form [structure]="structure"></mat-dynamic-form>` })
class HostComponent {
  structure: FormStructure;
}

describe('Accessibility and buttons', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDynamicFormModule, NoopAnimationsModule],
      declarations: [HostComponent]
    }).compileComponents();
  });

  afterEach(() => {
    fixture.destroy();
    element.remove();
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  function render(structure: FormStructure) {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.structure = structure;
    element = fixture.nativeElement;
    document.body.appendChild(element);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  it('no button of the form or its panels submits a form', fakeAsync(() => {
    render(new FormStructure('Form', [
      new InputPassword('pass', 'Password'),
      new InputFile('file', 'File').apply({ accept: ['png'] }),
      new DateTimePicker('when', 'When').apply({ showClockPicker: true }),
    ], [new Button('save', 'Save', {})]));

    const input = element.querySelector('input[type=file]') as HTMLInputElement;
    input.files = FileUtils.createFileList([new File([new Uint8Array(4)], 'a.pdf', { type: 'application/pdf' })]);
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    (element.querySelector('button[id="whenTodayIcon"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    tick();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    (overlay.querySelector('.mat-calendar-body-cell') as HTMLElement).click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const buttons = [...Array.from(element.querySelectorAll('button')), ...Array.from(overlay.querySelectorAll('button'))];
    const submitting = buttons.filter(b => b.type === 'submit').map(b => b.outerHTML.slice(0, 90));
    expect(buttons.length).toBeGreaterThan(8);
    expect(submitting).toEqual([]);
    flush();
  }));

  it('the password toggle says what it will do and can be translated', fakeAsync(() => {
    render(new FormStructure('Form', [
      new InputPassword('pass', 'Password'),
      new InputPassword('pin', 'PIN').apply({ showPasswordLabel: 'Mostrar', hidePasswordLabel: 'Ocultar' } as any),
    ]));
    const toggle = (id: string) => (element.querySelector(`input#${id}`) as HTMLElement)
      .closest('mat-form-field').querySelector('button') as HTMLButtonElement;

    expect(toggle('pass').getAttribute('aria-label')).toBe('Show password');
    toggle('pass').click();
    fixture.detectChanges();
    expect(toggle('pass').getAttribute('aria-label')).toBe('Hide password');
    expect((element.querySelector('input#pass') as HTMLInputElement).type).toBe('text');

    expect(toggle('pin').getAttribute('aria-label')).toBe('Mostrar');
    flush();
  }));

  it('each password toggle only shows its own field', fakeAsync(() => {
    render(new FormStructure('Form', [new InputPassword('pass', 'Password'), new InputPassword('confirm', 'Confirm')]));
    const passToggle = (element.querySelector('input#pass') as HTMLElement).closest('mat-form-field').querySelector('button') as HTMLButtonElement;
    passToggle.click();
    fixture.detectChanges();
    expect((element.querySelector('input#pass') as HTMLInputElement).type).toBe('text');
    expect((element.querySelector('input#confirm') as HTMLInputElement).type).toBe('password');
    flush();
  }));

  it('the remove file button has an accessible name', fakeAsync(() => {
    render(new FormStructure('Form', [new InputFile('file', 'File').apply({ removeHint: 'Quitar archivo' })]));
    const input = element.querySelector('input[type=file]') as HTMLInputElement;
    input.files = FileUtils.createFileList([new File([new Uint8Array(4)], 'a.png', { type: 'image/png' })]);
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelector('button.close').getAttribute('aria-label')).toBe('Quitar archivo');
    flush();
  }));
});
