import {Router, ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataService} from '../data.service';
import {Observable, Subscriber} from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';
import {NotificationService} from '../services/notification.service';
// import {SearchByStringPipe} from '../pipes/search-by-string.pipe';
import {IonicSelectableComponent} from 'ionic-selectable';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {environment} from '../../environments/environment';

// import dummy from './dummy.json';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnInit {

	// 
		dummy_img = '../../assets/placeholder-image.png';
	// 

	selected_customer: any = '';
	selected_customer_images: any = false;
	customers_found_status = false;
	loggedInUser: any;
	customers_raw: any;
	customersFilterData: any;
	customer_info: any = {
		division: 'N/A',
    subdivision: 'N/A',
    region: 'N/A',
		city: 'N/A',
		classification: 'N/A',
		salesRepName: 'N/A',
		salesRepNumber: 'N/A',
		agencyCat: 'N/A',
		images: {
			MAIN_CR_CERT_IMG: this.dummy_img,
			NATIONAL_ADD_IMG: this.dummy_img,
			VAT_CERT_IMG: this.dummy_img,
		}
	};

  img_counter = 1;
	image_switcher = {
		path: this.dummy_img,
		title: ''
	}

	frmVatUpdate: FormGroup;
	
  constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService, public sanitizer: DomSanitizer) {

  	this.loggedInUser = this.localStorageService.getItem('user_info');

  	this.getCustomers();
  }

  ngOnInit() {
  	this.initFrmVatUpdate();
  }

  getCustomers = ()=>{
  	const body = {
  		USER_ID: this.loggedInUser.USER_ID,
      USER_TYPE: this.loggedInUser.USER_TYPE,
  		REGION: this.loggedInUser.USER_REGION
  	};

  	this.NotificationService.presentLoading();

  	this.http.post<any>(`${environment.base_url}/getCustomers`, body).subscribe(res => {

			this.NotificationService.dismissLoading()
			
			if(res.status=='Success' && res.data.length > 0){
				this.customers_raw = res.data;
				this.customersFilterData = res.data;

				this.customers_found_status = false;
			}
			else{
				// this.NotificationService.alert('Alert', 'No Customer found');
				this.customers_found_status = true;
			}
  	});
  }

  initFrmVatUpdate= ()=> {
    this.frmVatUpdate = this.formBuilder.group({
      cust_name_ar_vat: ['N/A', Validators.required ],
      cust_business_name_vat: ['N/A', Validators.required ],
      vat: ['N/A', Validators.required ],
      maincr: ['N/A', Validators.required ],
      address: ['N/A', Validators.required ],
    });    
  }

  resetFrmVatUpdate = ()=>{
  	this.frmVatUpdate.patchValue({
  	  cust_name_ar_vat: 'N/A',
      cust_business_name_vat: 'N/A',
      vat: 'N/A',
      maincr: 'N/A',
      address: 'N/A',
  	});

  	// reset selected customer
  	this.selected_customer = '';
  	this.selected_customer_images = false;

  	// reset select customer images
  	this.image_switcher.path = this.dummy_img;
  	this.image_switcher.title = '';

  	// reset select customer info
    this.customer_info.division = 'N/A';
    this.customer_info.subdivision = 'N/A';
		this.customer_info.region = 'N/A';
		this.customer_info.city = 'N/A';
		this.customer_info.classification = 'N/A';
		this.customer_info.salesRepName = 'N/A';
		this.customer_info.salesRepNumber = 'N/A';
		this.customer_info.agencyCat = 'N/A';
	}

  fetchSelectedCustomer = (customer)=>{
    // console.log(customer_number);

  	this.selected_customer = customer;

  	let custRow = this.customers_raw.filter((i,v)=>{
  		return (i.CUST_NUMBER == customer.CUST_NUMBER);
  	});

  	
  	custRow = custRow[0];
    
    this.frmVatUpdate.patchValue({
      cust_name_ar_vat: (custRow.CUST_NAME_AR_AS_VAT) ? custRow.CUST_NAME_AR_AS_VAT : 'N/A',
      cust_business_name_vat: (custRow.CUST_BUSSINESS_NAME) ? custRow.CUST_BUSSINESS_NAME : 'N/A',
      vat: (custRow.VAT_NUM) ? custRow.VAT_NUM : 'N/A',
      maincr: (custRow.MAIN_CR_NUM) ? custRow.MAIN_CR_NUM : 'N/A',
      address: (custRow.CUST_ADDRESS) ? custRow.CUST_ADDRESS : 'N/A',
  	});

    this.customer_info.division = (custRow.DIVISION) ? custRow.DIVISION : 'N/A';
		this.customer_info.subdivision = (custRow.SUB_DIVISION) ? custRow.SUB_DIVISION : 'N/A';
		this.customer_info.region = (custRow.REGION) ? custRow.REGION : 'N/A';
		this.customer_info.city = (custRow.CITY) ? custRow.CITY : 'N/A';
    this.customer_info.classification = (custRow.CLASSIFICATION) ? custRow.CLASSIFICATION : 'N/A';
		this.customer_info.salesRepName = (custRow.SALESREP_NAME) ? custRow.SALESREP_NAME : 'N/A';
		this.customer_info.salesRepNumber = (custRow.SALESREP_NUMBER) ? custRow.SALESREP_NUMBER : 'N/A';
		this.customer_info.agencyCat = (custRow.AGENCY_CATEGORY) ? custRow.AGENCY_CATEGORY : 'N/A';
    
      /*console.log(customer, 'cn');
      return false;*/

		this.NotificationService.presentLoading();

    const body = {
      P_CUST_ID: customer.CDC_CUS_ID,
    };

  	this.http.post<any>(`${environment.base_url}/getCustomerImages`, body).subscribe(res => {

			this.NotificationService.dismissLoading();
			
			let images = res.data[0];
      /*console.log(res);
      return false;*/

			if(res.status=='Success' && res.data.length){

				this.selected_customer_images = true;

				this.customer_info.images.MAIN_CR_CERT_IMG = (images.MAIN_CR_CERT_IMG) ? `${images.MAIN_CR_CERT_IMG}` : this.dummy_img;
				this.customer_info.images.NATIONAL_ADD_IMG = (images.NATIONAL_ADD_IMG) ? `${images.NATIONAL_ADD_IMG}` : this.dummy_img;
				this.customer_info.images.VAT_CERT_IMG = (images.VAT_CERT_IMG) ? `${images.VAT_CERT_IMG}` : this.dummy_img;

				this.changeImg(1);
				// console.log(res);
			}
			else{
				this.NotificationService.alert('Alert', 'No images found');

				this.selected_customer_images = false;
				this.customer_info.images.MAIN_CR_CERT_IMG = this.dummy_img;
				this.customer_info.images.NATIONAL_ADD_IMG = this.dummy_img;
				this.customer_info.images.VAT_CERT_IMG = this.dummy_img;
			}
  	});
  }

  frmVatUpdateSubmit = ()=>{
  	// const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
  	
    console.log(this.selected_customer);
    // return false;

		if(this.selected_customer==''){
			this.NotificationService.alert('Alert', 'Please select a customer to update');
			return false;
		}

    const body = {
      P_USER_ID: this.loggedInUser.USER_ID,
      P_CUST_ID: this.selected_customer.CDC_CUS_ID, 
      P_CUST_NUMBER: this.selected_customer.CUST_NUMBER, 
      P_USER_TYPE: this.loggedInUser.USER_TYPE,
      P_LATITUDE: null, 
      P_LONGITUDE: null, 
      P_VAT_NUM: this.frmVatUpdate.value.vat,
      P_MAIN_CR_NUM: this.frmVatUpdate.value.maincr, 
      P_ADDRESS: this.frmVatUpdate.value.address,
      P_BUSNIESS_NAME: this.frmVatUpdate.value.cust_business_name_vat,
      P_CUS_NAME_AR_VAT: this.frmVatUpdate.value.cust_name_ar_vat,
      P_VAT_CERT_IMG: null,
      P_MAIN_CR_CERT_IMG: null, 
      P_NATIONAL_ADD_IMG: null,
      P_CUS_NAME: this.selected_customer.CUST_NAME,
    }

    // console.table(body);
  	// return false;

		this.NotificationService.presentLoading();

  	this.http.post<any>(`${environment.base_url}/updateVat`, body).subscribe(res => {

			this.NotificationService.dismissLoading();
			
			if(res.status=='Success'){
				console.log(res)
				this.getCustomers();
				this.NotificationService.alert('Alert', res.data);

				this.resetFrmVatUpdate();
			}
  	});
  }

  changeImg = (img_counter)=>{
 		
 		switch(img_counter) {
  	  case 1:
  	  	this.image_switcher.path =	this.customer_info.images.MAIN_CR_CERT_IMG;
  	  	this.image_switcher.title = 'Main Cr_Certificate';
  			break;
  	  
  	  case 2:
  	  	this.image_switcher.path =	this.customer_info.images.NATIONAL_ADD_IMG;
  	  	this.image_switcher.title = 'National Address';
  			break;
  	  
  	  case 3:
  	  	this.image_switcher.path =	this.customer_info.images.VAT_CERT_IMG;
  	  	this.image_switcher.title = 'VAT Certificate';
				break;
  	}
  }

  changeImgPrev = ()=>{

  	if(this.img_counter <= 1){
  		this.img_counter = 1;
  	}
  	else{
  		this.img_counter--;
  	}
  	this.changeImg(this.img_counter);
  }

  changeImgNext = ()=>{
  	if(this.img_counter >= 3){
  		this.img_counter = 3;
  	}
  	else{
  		this.img_counter++;
  	}
  	this.changeImg(this.img_counter);
  }

  /*changeImg = (image='', image_title='')=>{
 		console.log(image, image_title);
   	switch(image) {
  	  case 'baldiya':
  	  	this.image_switcher.path =	this.customer_info.images.BALADIYA_CERT_IMG;
  	  	this.image_switcher.title = image_title;
  			break;

  	  case 'branch_cr':
  	  	this.image_switcher.path =	this.customer_info.images.BR_CR_CERT_IMG;
  	  	this.image_switcher.title = image_title;
  			break;
  	  
  	  case 'main_cr':
  	  	this.image_switcher.path =	this.customer_info.images.MAIN_CR_CERT_IMG;
  	  	this.image_switcher.title = image_title;
  			break;
  	  
  	  case 'address':
  	  	this.image_switcher.path =	this.customer_info.images.NATIONAL_ADD_IMG;
  	  	this.image_switcher.title = image_title;
  			break;
  	  
  	  case 'vat':
  	  	this.image_switcher.path =	this.customer_info.images.VAT_CERT_IMG;
  	  	this.image_switcher.title = image_title;
				break;
  			
		  case 'coc':
		  	this.image_switcher.path =	this.customer_info.images.COC_CERT_IMG;
		  	this.image_switcher.title = image_title;
				break;
  	}
  }*/

  filterPackets = (searchString)=>{

  	let searchStringLength = searchString.length;
  	
  	if(searchString==''){
  		this.customersFilterData = this.customers_raw;
  	}
  	else{
  		this.customersFilterData = this.customers_raw.filter((item)=>{
  			if((`${item.CUST_NUMBER}`).toLowerCase().includes(searchString)){
  				return item;
  			}
  		})
  	}

  	// console.log(this.customersFilterData);
  }

  logout = ()=>{
		this.localStorageService.logout();
  }
}
