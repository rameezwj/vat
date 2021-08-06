import { Injectable } from '@angular/core';
import {ModalController, ToastController, AlertController, LoadingController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private modalController: ModalController, private alertController: AlertController, private toastController: ToastController, private loadingController: LoadingController) { }

  async alert(header, msg, action = null, requestBy = null) {
      if(requestBy !== 'auto-save') {
          const alert = await this.alertController.create({
              header,
              message: msg,
              buttons: [{
                  text: 'OK',
                  handler: data => {
                      if (action != null) {
                          action();
                      }
                  }
              }]
          });
          await alert.present();
      }
  }
  
  async presentLoading(requestBy = null) {
    const loading = await this.loadingController.create({
      cssClass: 'c_loader',
      message: 'Please wait...',
    });
    await loading.present();
  }

  dismissLoading(requestBy = null) {
    setTimeout(() => {
      this.loadingController.dismiss(null, undefined);
    }, 500)
  }
}
