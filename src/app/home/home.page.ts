import {Router, ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataService} from '../data.service';
import {Observable, Subscriber} from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';
import {NotificationService} from '../services/notification.service';
import {IonicSelectableComponent} from 'ionic-selectable';
import {environment} from '../../environments/environment';
import {ModalController, ToastController, AlertController, LoadingController} from '@ionic/angular';
import {QrScannerPage} from './qr-scanner/qr-scanner.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

	loggedInUser: any;
	frmVat: FormGroup;
	customers: any = [];
	allowed_file_types = ['jpg', 'JPG', 'png' ,'PNG' ,'jpeg' ,'JPEG'];

	file_names: any = {'file_vat': '', 'file_maincr': '', 'file_branchcr': '', 'file_coc': '', 'file_baldiya': ''};

	constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService, public modalController: ModalController) {

		this.loggedInUser = this.localStorageService.getItem('user_info');

		// console.log(this.loggedInUser);
	}

	ngOnInit() {
		this.initFrmVat();
	}

	ionViewDidEnter(){

		this.initFrmVat();
		
		setTimeout(()=>{
			this.getCustomers();
		},1000)
	}

  frmVatSubmit = ()=>{
  	// const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
  	
		// if(false){
		if(this.frmVat.status!='VALID'){
			this.NotificationService.alert('Alert', 'All fields are mandatory');
			return false;
		}

		this.NotificationService.presentLoading();;;

  	const body = {
  		P_USER_ID: this.loggedInUser.USER_ID,
  		P_CUST_ID: this.frmVat.value.customer_dd.cus_id, 
  		P_CUST_NUMBER: this.frmVat.value.customer_dd.cus_number, 
  		P_USER_TYPE: this.loggedInUser.USER_TYPE,
  		P_LATITUDE: 'Null', 
  		P_LONGITUDE: 'Null', 
  		P_VAT_NUM: this.frmVat.value.vat,
  		P_MAIN_CR_NUM: this.frmVat.value.maincr, 
  		P_ADDRESS: this.frmVat.value.address,
  		P_BUSNIESS_NAME: this.frmVat.value.cust_business_name_vat,
  		P_CUS_NAME_AR_VAT: this.frmVat.value.cust_name_ar_vat,
  		P_VAT_CERT_IMG: this.frmVat.value.file_vat,
  		P_MAIN_CR_CERT_IMG: this.frmVat.value.file_maincr, 
  		P_NATIONAL_ADD_IMG: this.frmVat.value.file_address,
  		P_CUS_NAME: this.frmVat.value.customer_dd.cus_name,
  	}

  	console.log(body);

  	this.http.post<any>(`${environment.base_url}/updateVat`, body).subscribe(res => {

  		setTimeout(()=>{
				this.NotificationService.dismissLoading();;;
  		}, 500);
			
			if(res.status=='Success'){
				console.log(res)
				this.resetfrmVat();

				setTimeout(()=>{
					this.router.navigate(['/splash', {'message': `${res.data}`}]);
					// this.NotificationService.toast(`${res.data}`);
				}, 800);

				/*setTimeout(()=>{
					location.reload(true);
				}, 2000);*/
			}
  	});
  }

	initFrmVat= ()=> {
	  this.frmVat = this.formBuilder.group({
	    customer_dd: ['', Validators.required ],
	    cust_name_ar_vat: ['', Validators.required ],
	    cust_business_name_vat: ['', Validators.required ],
	    vat: ['', Validators.required ],
	    file_vat: ['', Validators.required ],
	    maincr: ['', Validators.required ],
	    file_maincr: ['', Validators.required ],
	    file_address: ['', Validators.required ],
	    address: ['', Validators.required ],
	  });
	}

  resetfrmVat = ()=>{
  	this.frmVat.patchValue({
  	  customer_dd: '',
  	  cust_name_ar_vat: '',
  	  cust_business_name_vat: '',
  	  vat: '',
  	  file_vat: '',
  	  maincr: '',
  	  file_maincr: '',
  	  file_address: '',
  	  address: '',
  	});

  	this.customers.customer_name = '';
  	this.customers.customer_name_ar = '';
	}

	onFileChange = (event)=> {
		// validation
			const name = event.target.files[0].name;
		  const lastDot = name.lastIndexOf('.');
		  const ext = name.substring(lastDot + 1);

		  if(!(this.allowed_file_types.includes(ext))){

		  	if(event.target.name=='file_vat'){
			  	this.frmVat.patchValue({
			  		file_vat: ''
			  	});
			  }
			  else if(event.target.name=='file_maincr'){
			  	this.frmVat.patchValue({
			  		file_maincr: ''
			  	});
				}
			  else if(event.target.name=='file_address'){
			  	this.frmVat.patchValue({
			  		file_address: ''
			  	});
				}

		  	this.NotificationService.alert('Alert', 'Please upload an image file');
		  	return false;
		  }
		// validation

		this.NotificationService.presentLoading();
		
		const file = (event.target as HTMLInputElement).files[0];
		const imgBase64 = this.convertToBase64(file, event.target.name);
		
		// console.log(file);
		// console.log(this.file_names)
	}
	
	convertToBase64 = (file: File, name)=> {

		const observable = new Observable((subscriber: Subscriber<any>)=>{
			this.readFile(file, name, subscriber);
		});

		// console.log(file, name);

		observable.subscribe((data)=> {
			
			switch(data.name) {
			  case 'file_vat':
					this.frmVat.patchValue({
						file_vat: data.base64
					})
			  	break;

			  case 'file_maincr':
					this.frmVat.patchValue({
						file_maincr: data.base64
					})
			  	break;
			  
			  case 'file_branchcr':
					this.frmVat.patchValue({
						file_branchcr: data.base64
					})
			  	break;
			  
			  case 'file_coc':
					this.frmVat.patchValue({
						file_coc: data.base64
					})
			  	break;
			  
			  case 'file_baldiya':
					this.frmVat.patchValue({
						file_baldiya: data.base64
					})
			  	break;

		    case 'file_address':
		  		this.frmVat.patchValue({
		  			file_address: data.base64
		  		})
		    	break;
			}
		});
	}

	readFile = (file: File, name, subscriber: Subscriber<any>)=>{
		const fileReader = new FileReader();

		fileReader.readAsDataURL(file);

		fileReader.onload=()=>{
			subscriber.next({base64: fileReader.result, name: name});

			setTimeout(()=>{
 				this.NotificationService.dismissLoading();;;
   		}, 1000)

			subscriber.complete();
		}

		fileReader.onerror=(error)=>{
			subscriber.error(error);
			subscriber.complete();
		}
	}

	getCustomers = ()=>{
		
		const body = {
			USER_ID: this.loggedInUser.USER_ID
		};
		
		this.NotificationService.presentLoading('Fetching Customers...');;;
		
		this.http.post<any>(`${environment.base_url}/getSalesCustomers`, body).subscribe(res => {
		   
   		setTimeout(()=>{
 				this.NotificationService.dismissLoading();;;
   		}, 1000);
		  
		  if(res.status=='Success' && res.data.length > 0){
        
        this.localStorageService.setItem('sales_customers', res.data);

        res.data.map((i,v)=>{
        	this.customers.push({cus_id: i.CDC_CUS_ID, cus_number: i.CUST_NUMBER, cus_name: i.CUST_NAME, cus_name_ar: i.CUST_NAME_AR});
        });

        // this.NotificationService.toast('getting data');

        // console.log(this.customers, 'ssdsds');
		   }
		   else{
 	  		setTimeout(()=>{
		   		this.NotificationService.alert('Alert', 'No Customer found');
 				}, 1500);
		   }
		});
	}

	selectCustomer = (e)=>{
		console.log(e, 'ion selectable');
		this.customers.customer_name = e.value.cus_name;
		this.customers.customer_name_ar = e.value.cus_name_ar;
	}

  logout = ()=>{
		this.localStorageService.logout();
  }

  async openModal() {
			const modal = await this.modalController.create({
			component: QrScannerPage,
			cssClass: 'qr-modal',
		});

		await modal.present();
		modal.onDidDismiss().then((res) => {

			this.frmVat.patchValue({
			  vat: res.data.qr,
			});

		  console.log(res.data.qr)
		});
  }
}