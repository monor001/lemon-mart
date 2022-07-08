import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { InventoryHomeComponent } from './inventory-home/inventory-home.component'

const routes: Routes = [
  { path: '', redirectTo: '/inventory/home', pathMatch: 'full' },
  { path: 'home', component: InventoryHomeComponent },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
