import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'

const modules = [MatButtonModule, MatToolbarModule, MatIconModule, CommonModule]

@NgModule({
  declarations: [],
  imports: [modules],
  exports: [modules],
})
export class MaterialModule {}
