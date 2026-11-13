import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileChange } from '../../interfaces/FileChange.interface';
import { MaterialModule } from '../../material-module';
import { SinitizeHtmlPipe } from '../../pipes/sinitize-html.pipe';
import { InputFile } from '../../models/Node';
import { FileUtils } from '../../utils/file-utils';
import { InputFileComponent } from './input-file.component';

@Component({
  template: `
    <form [formGroup]="form">
      <input-file id="avatar" formControlName="avatar" [data]="node" (onStatusChange)="changes.push($event)"></input-file>
    </form>`
})
class HostComponent {
  form = new FormGroup({ avatar: new FormControl('') });
  node = new InputFile('avatar', 'Avatar').apply({
    accept: ['png', 'jpg'], maxSize: 1, hint: 'Pick an image', errorMessage: 'Invalid file'
  });
  changes: FileChange[] = [];
}

const png = (name = 'photo.png', size = 10) => new File([new Uint8Array(size)], name, { type: 'image/png' });

describe('InputFileComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let component: InputFileComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [HostComponent, InputFileComponent, SinitizeHtmlPipe]
    }).compileComponents();
  });

  function create(configure?: (host: HostComponent) => void) {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    configure?.(hostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(InputFileComponent)).componentInstance;
    element = fixture.nativeElement;
  }

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  function fileInput(): HTMLInputElement {
    return element.querySelector('input[type=file]');
  }

  function select(file: File) {
    const input = fileInput();
    input.files = FileUtils.createFileList([file]);
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('shows the label with the accepted types and the hint', () => {
    create();
    expect(element.textContent).toContain('Avatar (png, jpg)');
    expect(element.textContent).toContain('Pick an image');
    expect(fileInput().accept).toBe('.png,.jpg');
  });

  it('accepts any file when accept is not configured', () => {
    create(host => host.node.accept = undefined);
    expect(element.textContent).toContain('Todos los archivos');
    expect(fileInput().accept).toBe('*/*');
  });

  it('uses unique ids based on the control name', () => {
    create();
    expect(fileInput().id).toBe('innerFileavatar');
    expect(element.querySelector('#avatar-parent')).not.toBeNull();
  });

  it('stores a valid file in the control and emits preparing then valid', () => {
    create();
    const file = png();
    select(file);

    expect(hostComponent.form.value.avatar).toEqual(file);
    expect(component.getState()).toBe('valid');
    expect(hostComponent.changes.map(c => c.state)).toEqual(['preparing', 'valid']);
    expect(element.textContent).toContain('photo.png');
  });

  it('renames the file when filename is configured', () => {
    create(host => host.node.filename = 'profile');
    select(png());
    expect((hostComponent.form.value.avatar as File).name).toBe('profile.png');
  });

  it('rejects a file with a type that is not accepted', () => {
    create();
    select(new File(['x'], 'doc.pdf', { type: 'application/pdf' }));

    const control = hostComponent.form.get('avatar');
    expect(control.value).toBeNull();
    expect(control.hasError('error')).toBeTrue();
    expect(component.getState()).toBe('error');
    expect(hostComponent.changes[hostComponent.changes.length - 1])
      .toEqual(jasmine.objectContaining({ state: 'error', error: 'badFileFormat' }));
    expect(element.querySelector('mat-error').textContent).toContain('Invalid file');
  });

  it('rejects a file bigger than maxSize', () => {
    create();
    select(png('big.png', 2 * 1024 * 1024));
    expect(hostComponent.changes[hostComponent.changes.length - 1].error).toBe('maxFileSize');
  });

  it('retry opens the file selector again instead of failing', () => {
    create();
    select(new File(['x'], 'doc.pdf', { type: 'application/pdf' }));
    const click = spyOn(fileInput(), 'click');

    const retry = element.querySelector('#retry') as HTMLElement;
    expect(() => retry.click()).not.toThrow();
    expect(click).toHaveBeenCalled();
  });

  it('removeFile clears the control and goes back to the initial state', () => {
    create();
    select(png());
    (element.querySelector('button.close') as HTMLElement).click();
    fixture.detectChanges();

    expect(hostComponent.form.value.avatar).toBeNull();
    expect(component.getState()).toBe('none');
    expect(fileInput().value).toBe('');
    expect(hostComponent.changes[hostComponent.changes.length - 1]).toEqual({ state: 'none' });
    expect(element.textContent).toContain('Seleccionar');
  });

  it('goes back to the initial state when the form is reset', () => {
    create();
    select(png());
    hostComponent.form.reset();
    fixture.detectChanges();

    expect(component.getState()).toBe('none');
    expect(component.getFileIcon()).toBe('upload.png');
  });

  it('shows the icon of the selected file type', () => {
    create();
    select(png());
    expect(component.getFileIcon()).toBe('image.png');
  });

  it('accepts dropped files', () => {
    create();
    const parent = element.querySelector('#avatar-parent') as HTMLElement;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(png('dropped.png'));

    parent.dispatchEvent(new DragEvent('dragover', { dataTransfer, bubbles: true }));
    expect(parent.classList).toContain('dragover');

    parent.dispatchEvent(new DragEvent('drop', { dataTransfer, bubbles: true }));
    fixture.detectChanges();

    expect(parent.classList).not.toContain('dragover');
    expect((hostComponent.form.value.avatar as File).name).toBe('dropped.png');
    expect(component.getState()).toBe('valid');
  });

  it('downloads the current file', () => {
    create();
    const saveAs = spyOn(FileUtils, 'saveAs');
    select(png());
    component.downloadFile();
    expect(saveAs).toHaveBeenCalledWith(jasmine.any(File), 'photo.png');
  });

  it('does not download when there is no file', () => {
    create();
    const saveAs = spyOn(FileUtils, 'saveAs');
    component.downloadFile();
    expect(saveAs).not.toHaveBeenCalled();
  });

  it('setFile loads a file programmatically', () => {
    create();
    component.setFile(png('programmatic.png'));
    fixture.detectChanges();
    expect((hostComponent.form.value.avatar as File).name).toBe('programmatic.png');
    expect(component.getState()).toBe('valid');
  });
});
