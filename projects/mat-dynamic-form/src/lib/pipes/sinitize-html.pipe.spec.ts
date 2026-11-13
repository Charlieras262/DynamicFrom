import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SinitizeHtmlPipe } from './sinitize-html.pipe';

describe('SinitizeHtmlPipe', () => {
  let pipe: SinitizeHtmlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SinitizeHtmlPipe(sanitizer);
  });

  it('marks the html as trusted so links and markup are rendered', () => {
    const spy = spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    const result = pipe.transform('<strong>hi</strong>');

    expect(spy).toHaveBeenCalledWith('<strong>hi</strong>');
    expect(result).toBeTruthy();
  });
});
