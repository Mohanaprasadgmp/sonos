import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAttributes } from './custom-attributes';

describe('CustomAttributes', () => {
  let component: CustomAttributes;
  let fixture: ComponentFixture<CustomAttributes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAttributes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomAttributes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
