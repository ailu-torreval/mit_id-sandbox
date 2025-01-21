import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppSwitchPage } from './app-switch.page';

const routes: Routes = [
  {
    path: '',
    component: AppSwitchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppSwitchPageRoutingModule {}
