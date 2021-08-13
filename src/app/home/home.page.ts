import {Router, ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataService} from '../data.service';
import {Observable, Subscriber} from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';
import {NotificationService} from '../services/notification.service';
import {IonicSelectableComponent} from 'ionic-selectable';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

	loggedInUser: any;
	frmVat: FormGroup;
	customers: any = [];
	customer_info: any = {
		customer_name: '',
		customer_name_ar: ''
	}
	file_names: any = {'file_vat': '', 'file_maincr': '', 'file_branchcr': '', 'file_coc': '', 'file_baldiya': ''};

	constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService) {

		this.loggedInUser = this.localStorageService.getItem('user_info');

		console.log(this.loggedInUser);

		this.getCustomers();
	}

	ngOnInit() {
		setTimeout(()=>{

		}, 5000)

		this.initFrmVat();
	}

  frmVatSubmit = ()=>{
  	// const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
  		
  	// if(false){
		if(this.frmVat.status!='VALID'){
			this.NotificationService.alert('Alert', 'Please enter valid crendetials');
			return false;
		}

  	const body = {
  		P_USER_ID: this.loggedInUser.USER_ID,
  		P_CUST_NUMBER: this.frmVat.value.customer_number.cus_number, 
  		P_USER_TYPE: this.loggedInUser.USER_TYPE,
  		P_LATITUDE: 'Null', 
  		P_LONGITUDE: 'Null', 
  		P_VAT_NUM: this.frmVat.value.vat,
  		P_MAIN_CR_NUM: this.frmVat.value.maincr, 
  		P_BR_CR_NUM: 'N/A',
  		P_COC_NUM: this.frmVat.value.coc,
  		P_BALADIYA_NUM: this.frmVat.value.baldiya,
  		P_VAT_CERT_IMG: this.frmVat.value.file_vat,
  		P_MAIN_CR_CERT_IMG: this.frmVat.value.file_maincr, 
  		P_BR_CR_CERT_IMG: null,
  		P_COC_CERT_IMG: this.frmVat.value.file_coc,
  		P_BALADIYA_CERT_IMG: this.frmVat.value.file_baldiya, 
  		P_NATIONAL_ADD_IMG: this.frmVat.value.file_address,
  		P_CUS_NAME: 'english',
  		P_CUS_NAME_AR: 'arabic',
  	}

  	console.log(body);

  	// return false;
		this.NotificationService.presentLoading();

  	this.http.post<any>('http://localhost:12123/updateVat', body).subscribe(res => {

			this.NotificationService.dismissLoading();
			
			if(res.status=='Success'){
				console.log(res)
				this.resetfrmVat();
				this.NotificationService.alert('Alert', res.data);
			}
  	});
  }

	initFrmVat= ()=> {
	  this.frmVat = this.formBuilder.group({
	    customer_number: ['', Validators.required ],
	    vat: ['', Validators.required ],
	    file_vat: ['', Validators.required ],
	    maincr: ['', Validators.required ],
	    file_maincr: ['', Validators.required ],
	    /*branchcr: ['', valueidators.required ],
	    file_branchcr: ['', Validators.required ],*/
	    coc: ['', Validators.required ],
	    file_coc: ['', Validators.required ],
	    baldiya: ['', Validators.required ],
	    file_baldiya: ['', Validators.required ],
	    // address: [''],
	    file_address: ['', Validators.required ],
	  });
	}

  resetfrmVat = ()=>{
  	this.frmVat.patchValue({
  	  customer_number: '',
  	  vat: '',
  	  file_vat: '',
  	  maincr: '',
  	  file_maincr: '',
  	  /*branchcr: '',
  	  file_branchcr: '',*/
  	  coc: '',
  	  file_coc: '',
  	  baldiya: '',
  	  file_baldiya: '',
  	  // address: '',
  	  file_address: '',
  	});

  	this.customer_info.customer_name = '';
  	this.customer_info.customer_name_ar = '';
	}

	onFileChange = (event)=> {
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
		
		this.NotificationService.presentLoading();
		
		this.http.post<any>('http://localhost:12123/getSalesCustomers', body).subscribe(res => {
		   
		   this.NotificationService.dismissLoading();

		   if(res.status=='Success' && res.data.length > 0){
        
        this.localStorageService.setItem('sales_customers', res.data);

        res.data.map((i,v)=>{
        	this.customers.push({cus_id: i.CDC_CUS_ID, cus_number: i.CUST_NUMBER, cus_name: i.CUST_NAME, cus_name_ar: i.CUST_NAME_AR});
        });
        // console.log(this.customers, 'ssdsds');
		   }
		   else{
		   	this.NotificationService.alert('Alert', 'No Customer found');
		   }
		});
	}

	selectCustomer = (e)=>{
		console.log(e);
		this.customer_info.customer_name = e.value.cus_name;
		this.customer_info.customer_name_ar = e.value.cus_name_ar;
	}

  logout = ()=>{
		this.localStorageService.logout();
  }
}

1235414