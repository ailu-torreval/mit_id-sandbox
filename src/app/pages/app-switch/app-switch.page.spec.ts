import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppSwitchPage } from './app-switch.page';

describe('AppSwitchPage', () => {
  let component: AppSwitchPage;
  let fixture: ComponentFixture<AppSwitchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppSwitchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
