import { Injectable } from '@angular/core';
import {ModalController, ToastController, AlertController, LoadingController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private modalController: ModalController, private alertController: AlertController, private toastController: ToastController, private loadingController: LoadingController) { }

  async toast(msg, header = 'success', duration = 2000) {
    const toast = await this.toastController.create({
        message: msg,
        duration: duration,
        color: header === 'Error' ? 'danger' : 'success',
        position: 'middle',
    });
    toast.present();
  }

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
  
  async presentLoading(message='Please wait...') {
    const loading = await this.loadingController.create({
      cssClass: 'c_loader',
      message: message,
    });
    await loading.present();
  }

  dismissLoading(requestBy = null) {
    setTimeout(() => {
      this.loadingController.dismiss(null, undefined);
    }, 500)
  }
}
