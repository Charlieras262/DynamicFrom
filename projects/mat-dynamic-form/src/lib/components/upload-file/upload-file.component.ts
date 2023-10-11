import { AfterViewInit, Component, EventEmitter, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { FileChange, FileState } from '../../interfaces/FileChange.interface';
import { FileUtils } from '../../utils/file-utils';

@Component({
  selector: 'upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  /**
   * @description Nombre del archivo sin extensión con el que se cargará y se mostrara en el input (Ej.: Documento).
   */
  @Input("filename") filename?: string;
  /**
   * @description Extensiones de archivos permitidos para cargar (Ej.: ['pdf', 'doc']) (Requerido).
   */
  @Input("accept") accept: string[] = [];
  /**
   * @description Tamaño del archivo en megabytes  no mayor a 10.
   */
  @Input("maxSize") maxSize: number = 10
  /**
   * @description Texto que se muestra como nombre del input file.
   */
  @Input("label") label: string = "Documento";
  /**
   * @description Texto que se muestra como nota del input file.
   */
  @Input("hint") hint?: string;
  /**
   * @description Texto que se muestra cuando existe un error en el input file.
   */
  @Input("error") error?: string;
  /**
   * @description Se ejecuta cuando el estado de la carga cambia.
   */
  @Output() onStatusChange: EventEmitter<FileChange> = new EventEmitter();
  private fileState: FileState;
  set emiter(emiter: (value: FileChange) => void) {
    this.onStatusChange.emit = emiter;
  }

  fileType: string = 'upload';
  controlName: string = "file";
  currentFile?: File;
  control!: FormControl;

  constructor(
    @Self() @Optional() private ngControl: NgControl
  ) {
    this.fileState = 'none';

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    if (!this.control) {
      this.control = this.ngControl.control as FormControl;
    }

    if (!this.control && this.ngControl.control) {
      this.control = this.ngControl.control as FormControl;
    }

    this.controlName = this.ngControl?.name as string ?? Date.now().toString();
    this.getControl().valueChanges.subscribe(value => {
      if (!value || value.length == 0) {
        this.fileState = 'none';
        this.fileType = 'upload';
      }
    });
  }

  ngAfterViewInit() {
    const parent = document.getElementById(`${this.controlName}-parent`);
    if (!parent) return;

    this.addListener(parent, 'dragover dragenter', _ => parent.classList.add('dragover'));
    this.addListener(parent, 'dragleave dragend drop', _ => parent.classList.remove('dragover'));
    this.addListener(parent, 'drag dragstart dragend dragover dragenter dragleave drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    parent.addEventListener('drop', (event) => {
      const file = document.getElementById(`innerFile${this.controlName}`) as HTMLInputElement;

      file.files = event.dataTransfer?.files as FileList;
      this.getControl().setValue(file.files);
      file.dispatchEvent(new Event('change'));
    });
  }

  handleFile(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList) {
      this.handleInputFile(fileList[0]);
    }
  }

  removeFile() {
    this.getControl().setValue(null);
    const input = document.querySelector(`#innerFile${this.controlName}`) as HTMLInputElement;

    input.value = '';
    input.files = null;

    this.currentFile = undefined;
    this.fileState = 'none';
    this.fileType = 'upload';
    return this.onStatusChange.emit({ state: this.fileState })
  }

  getState() {
    return this.fileState;
  }

  getControl(): FormControl {
    return this.control;
  }

  getAccept(): string {
    return this.accept.length == 0 ? '*/*' : this.accept.map(item => '.' + item).join(',');
  }

  downloadFile() {
    if (this.fileState != 'none') {
      FileUtils.saveAs(this.currentFile!, this.filename ?? this.currentFile!.name)
    }
  }

  setFile(file: File) {
    const files = FileUtils.createFileList([file]);
    console.log(files);

    const innerFile = document.getElementById(`innerFile${this.controlName}`) as HTMLInputElement;

    innerFile.files = files as FileList;
    this.getControl().setValue(file);
    innerFile.dispatchEvent(new Event('change'));
  }

  getAcceptedTypes(): string {
    if (!this.accept || this.accept.length == 0) {
      this.accept = [];
      return 'Todos los archivos';
    }
    const types = this.accept.slice(0, 4);
    return types.map(item => item).join(', ');
  }

  getFileIcon(): string {
    if (this.fileType == 'upload') return 'upload.png';
    return FileUtils.getFileIcon(this.fileType);
  }

  private handleInputFile(file: File) {
    this.currentFile = FileUtils.changeFileName(file, this.filename);
    this.fileState = 'preparing';
    this.onStatusChange.emit({ state: this.fileState });
    const fileStatus = FileUtils.isValidFile(this.currentFile, this.accept, this.maxSize);
    if (!fileStatus.isValid) {
      this.fileState = 'error';
      this.getControl().setValue(null);
      this.getControl().setErrors({ 'error': true });
      this.onStatusChange.emit({ state: this.fileState, error: fileStatus.error?.toString() });
      return;
    }

    this.getControl().setErrors(null);
    this.fileType = FileUtils.getFileExtension(this.currentFile.type);
    this.fileState = 'valid';
  }

  private addListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, events: string, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
    events.split(' ').forEach(event => element.addEventListener(event as K, listener, options));
  }

  registerOnChange(_: any): void { }
  writeValue(_: any) { }
  registerOnTouched(_: any) { }
}
