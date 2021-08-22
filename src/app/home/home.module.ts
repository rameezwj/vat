import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { IonicSelectableModule } from 'ionic-selectable';
import {QrScannerPageModule} from './qr-scanner/qr-scanner.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HomePageRoutingModule,
    HttpClientModule,
    IonicSelectableModule,
    QrScannerPageModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
