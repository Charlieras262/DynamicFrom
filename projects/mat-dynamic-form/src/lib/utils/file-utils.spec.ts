import { FileUtils } from './file-utils';

const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type });

describe('FileUtils', () => {

  it('maps mime types and extensions in both directions', () => {
    expect(FileUtils.getFileExtension('image/png')).toBe('png');
    expect(FileUtils.getFileExtension('image/jpeg')).toBe('jpg');
    expect(FileUtils.getMimeType('pdf')).toBe('application/pdf');
    expect(FileUtils.getFileExtension('application/unknown')).toBeUndefined();
  });

  it('returns an icon per extension with a generic fallback', () => {
    expect(FileUtils.getFileIcon('png')).toBe('image.png');
    expect(FileUtils.getFileIcon('xlsx')).toBe('xls.png');
    expect(FileUtils.getFileIcon('weird')).toBe('file.png');
  });

  describe('isValidFile', () => {
    it('fails when there is no file', () => {
      expect(FileUtils.isValidFile(null, [], 1)).toEqual(jasmine.objectContaining({ isValid: false, error: 'noFileFound' }));
    });

    it('fails when the file exceeds the max size in MB', () => {
      const big = file('a.png', 'image/png', 2 * 1024 * 1024);
      expect(FileUtils.isValidFile(big, ['png'], 1)).toEqual(jasmine.objectContaining({ isValid: false, error: 'maxFileSize' }));
    });

    it('ignores the size limit when maxSize is not set', () => {
      expect(FileUtils.isValidFile(file('a.png', 'image/png'), ['png'], undefined).isValid).toBeTrue();
    });

    it('fails when the type is not accepted', () => {
      expect(FileUtils.isValidFile(file('a.pdf', 'application/pdf'), ['png'], 1))
        .toEqual(jasmine.objectContaining({ isValid: false, error: 'badFileFormat' }));
    });

    it('fails when the extension does not match the mime type', () => {
      expect(FileUtils.isValidFile(file('a.jpg', 'image/png'), ['png'], 1))
        .toEqual(jasmine.objectContaining({ isValid: false, error: 'corruptFileFormat' }));
    });

    it('accepts any type when accept is empty or undefined', () => {
      expect(FileUtils.isValidFile(file('a.bin', 'application/octet-stream'), [], 1).isValid).toBeTrue();
      expect(FileUtils.isValidFile(file('a.bin', 'application/octet-stream'), undefined, 1).isValid).toBeTrue();
    });

    it('accepts a valid file', () => {
      expect(FileUtils.isValidFile(file('a.png', 'image/png'), ['png', 'jpg'], 1))
        .toEqual(jasmine.objectContaining({ isValid: true, error: null }));
    });
  });

  it('changeFileName keeps the file when no name is given and renames it otherwise', () => {
    const original = file('a.png', 'image/png');
    expect(FileUtils.changeFileName(original)).toBe(original);

    const renamed = FileUtils.changeFileName(original, 'avatar');
    expect(renamed.name).toBe('avatar.png');
    expect(renamed.type).toBe('image/png');
  });

  it('changeFileName keeps the original extension when the mime type is unknown', () => {
    const renamed = FileUtils.changeFileName(file('data.custom', 'application/x-custom'), 'renamed');
    expect(renamed.name).toBe('renamed.custom');
  });

  it('removeExtension strips only the last extension', () => {
    expect(FileUtils.removeExtension('my.file.tar.gz')).toBe('my.file.tar');
  });

  it('createFileList builds a FileList with the given files', () => {
    const list = FileUtils.createFileList([file('a.png', 'image/png'), file('b.png', 'image/png')]);
    expect(list.length).toBe(2);
    expect(list[1].name).toBe('b.png');
  });

  it('saveAs downloads through a temporary anchor', () => {
    const click = spyOn(HTMLAnchorElement.prototype, 'click');
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:x');
    const revoke = spyOn(window.URL, 'revokeObjectURL');

    FileUtils.saveAs(file('a.png', 'image/png'), 'download.png');

    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:x');
  });

  it('saveAsHeaders reads the file name from Content-Disposition (case insensitive)', () => {
    let downloaded = '';
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) { downloaded = this.download; });
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:x');
    spyOn(window.URL, 'revokeObjectURL');

    FileUtils.saveAsHeaders(file('a.png', 'image/png'), { 'content-disposition': 'attachment; filename="report.pdf"' });
    expect(downloaded).toBe('report.pdf');
  });
});
