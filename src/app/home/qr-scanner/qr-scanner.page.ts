import { Component, OnInit } from '@angular/core';
import {ModalController, ToastController, AlertController, LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
})
export class QrScannerPage implements OnInit {

	scanResult: any = '';
  
  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }

  onCodeResult(result:string){
	  this.scanResult = result;
	  console.log(this.scanResult);

    this.close();
  }

  close(){
    this.modalController.dismiss({qr: `${this.scanResult}`});
  }
}
