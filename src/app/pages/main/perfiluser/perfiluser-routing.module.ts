import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilUserPage } from './perfiluser.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfiluserPageRoutingModule {}
