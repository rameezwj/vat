import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
})
export class QrScannerPage implements OnInit {

	scanResult: any='';
  
  constructor() { }

  ngOnInit() {
  }

  onCodeResult(result:string){
	  this.scanResult = result;
	  console.log(this.scanResult);
  }
}
