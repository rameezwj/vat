import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RemarksPageRoutingModule } from './remarks-routing.module';

import { RemarksPage } from './remarks.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RemarksPageRoutingModule
  ],
  declarations: [RemarksPage]
})
export class RemarksPageModule {}
