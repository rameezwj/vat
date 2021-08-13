import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ListingPageRoutingModule } from './listing-routing.module';
import { ListingPage } from './listing.page';
import { DataTablesModule } from "angular-datatables";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ListingPageRoutingModule,
    HttpClientModule,
    DataTablesModule,
  ],
  declarations: [ListingPage]
})
export class ListingPageModule {}
