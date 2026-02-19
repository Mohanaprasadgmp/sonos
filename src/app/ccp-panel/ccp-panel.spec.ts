import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcpPanel } from './ccp-panel';

describe('CcpPanel', () => {
  let component: CcpPanel;
  let fixture: ComponentFixture<CcpPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcpPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CcpPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
