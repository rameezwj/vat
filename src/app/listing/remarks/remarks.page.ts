import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ModalController, ToastController, AlertController, LoadingController, NavParams} from '@ionic/angular';
import {HttpClient, HttpParams} from '@angular/common/http';
import {NotificationService} from '../../services/notification.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-remarks',
  templateUrl: './remarks.page.html',
  styleUrls: ['./remarks.page.scss'],
})
export class RemarksPage implements OnInit {

	rejection_body: any;
	// rejection_remarks: any = '';

  constructor(public modalController: ModalController, private navParams: NavParams, private http: HttpClient, private NotificationService: NotificationService, private router: Router,) {
  	this.rejection_body = this.navParams.get('rejection_body');
  }

  ngOnInit() {
  }

  handleRejection = ()=>{
  	// console.log(this.rejection_body, 'sdsd');
  	/*console.log(this.rejection_body.P_REJECT_REMARKS)
  	return false;*/

  	// if(false){
  	if(!(this.rejection_body.P_REJECT_REMARKS) || this.rejection_body.P_REJECT_REMARKS == ''){
  	  this.NotificationService.alert('Alert', 'Please enter some remarks to proceed');
  	  return false;
  	}

  	this.NotificationService.presentLoading('Rejecting...');;;

  	this.http.post<any>(`${environment.base_url}/rejection`, this.rejection_body).subscribe(res => {

      setTimeout(()=>{
				this.close();
        this.NotificationService.dismissLoading();;;
      }, 1000);
			
			if(res.status=='Success'){

				setTimeout(()=>{
				  this.NotificationService.alert('Alert', res.data, ()=>{
				  	location.reload(true);	
				  });
				}, 1500);

        // console.log(res.data);
				// location.reload(true);
			}
			else{
				this.NotificationService.alert('Alert', res.status);
			}
  	});
  }

  updateRemarks = (event)=>{
  	// console.log(event.srcElement.value);
  	this.rejection_body.P_REJECT_REMARKS = event.srcElement.value;
  }

  close(){
    this.modalController.dismiss({qr: `done`});
  }

}
