import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppSwitchPageRoutingModule } from './app-switch-routing.module';

import { AppSwitchPage } from './app-switch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppSwitchPageRoutingModule
  ],
  declarations: [AppSwitchPage]
})
export class AppSwitchPageModule {}
