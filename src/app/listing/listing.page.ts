import {Router, ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataService} from '../data.service';
import {Observable, Subscriber} from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';
import {NotificationService} from '../services/notification.service';
import {IonicSelectableComponent} from 'ionic-selectable';
import { map } from 'rxjs/operators';
// import dummy from './dummy.json';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.page.html',
  styleUrls: ['./listing.page.scss'],
})
export class ListingPage implements OnInit {

	// 
		dmmy_img = "data:image/jpeg;base64,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";
	// 

	selected_customer: any = '';
	loggedInUser: any;
	customers_raw: any;
	customer_info: any = {
		classification: 'N/A',
		city: 'N/A',
		salesRepName: 'N/A',
		salesRepNumber: 'N/A',
		agencyCat: 'N/A',
		division: 'N/A',
		images: {
			BALADIYA_CERT_IMG: this.dmmy_img,
			BR_CR_CERT_IMG: this.dmmy_img,
			COC_CERT_IMG: this.dmmy_img,
			MAIN_CR_CERT_IMG: this.dmmy_img,
			NATIONAL_ADD_IMG: this.dmmy_img,
			VAT_CERT_IMG: this.dmmy_img,
		}
	};

	frmVatUpdate: FormGroup;
	
  constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService) {

  	this.loggedInUser = this.localStorageService.getItem('user_info');

		this.NotificationService.presentLoading();;

  	this.http.post<any>('http://localhost:12123/getCustomers', {}).subscribe(res => {

			this.NotificationService.dismissLoading()
			
			if(res.status=='Success'){
				this.customers_raw = res.data;
			}
  	});
  }

  ngOnInit() {
  	this.initFrmVatUpdate();
  }

  initFrmVatUpdate= ()=> {
    this.frmVatUpdate = this.formBuilder.group({
      vat: ['N/A', Validators.required ],
      maincr: ['N/A', Validators.required ],
      branchcr: ['N/A', Validators.required ],
      coc: ['N/A', Validators.required ],
      baldiya: ['N/A', Validators.required ],
      address: ['N/A', Validators.required ],
    });
  }

  fetchSelectedCustomer = (customer_number)=>{

  	this.selected_customer = customer_number;

  	let custRow = this.customers_raw.filter((i,v)=>{
  		return (i.CUST_NUMBER == customer_number);
  	});

  	console.log(customer_number, 'cn');
  	
  	custRow = custRow[0];

  	this.frmVatUpdate.patchValue({
  	  vat: (custRow.VAT_NUM) ? custRow.VAT_NUM : 'N/A',
  	  maincr: (custRow.MAIN_CR_NUM) ? custRow.MAIN_CR_NUM : 'N/A',
  	  branchcr: (custRow.BR_CR_NUM) ? custRow.BR_CR_NUM : 'N/A',
  	  coc: (custRow.COC_NUM) ? custRow.COC_NUM : 'N/A',
  	  baldiya: (custRow.BALADIYA_NUM) ? custRow.BALADIYA_NUM : 'N/A',
  	  address: (custRow.CITY) ? custRow.CITY : 'N/A',
  	});

		this.customer_info.classification = (custRow.CLASSIFICATION) ? custRow.CLASSIFICATION : 'N/A',
		this.customer_info.city = (custRow.CITY) ? custRow.CITY : 'N/A',
		this.customer_info.salesRepName = (custRow.SALESREP_NAME) ? custRow.SALESREP_NAME : 'N/A',
		this.customer_info.salesRepNumber = (custRow.SALESREP_NUMBER) ? custRow.SALESREP_NUMBER : 'N/A',
		this.customer_info.agencyCat = (custRow.AGENCY_CATEGORY) ? custRow.AGENCY_CATEGORY : 'N/A',
		this.customer_info.division = (custRow.DIVISION) ? custRow.DIVISION : 'N/A',
  
		this.NotificationService.presentLoading();

		const body = {customerNumber: customer_number};

  	this.http.post<any>('http://localhost:12123/getCustomerImages', body).subscribe(res => {

			this.NotificationService.dismissLoading();
			
			let images = res.data[0],
					img_placeholder = 'https://upload.wikimedia.org/wikipedia/en/2/21/Link_of_the_Wild.png';

			if(res.status=='Success' && res.data.length){
				this.customer_info.images.BALADIYA_CERT_IMG = (images.BALADIYA_CERT_IMG) ? `data:image/png;base64,${images.BALADIYA_CERT_IMG}` : img_placeholder;
				this.customer_info.images.BR_CR_CERT_IMG = (images.BR_CR_CERT_IMG) ? `data:image/png;base64,${images.BR_CR_CERT_IMG}` : img_placeholder;
				this.customer_info.images.COC_CERT_IMG = (images.COC_CERT_IMG) ? `data:image/png;base64,${images.COC_CERT_IMG}` : img_placeholder;
				this.customer_info.images.MAIN_CR_CERT_IMG = (images.MAIN_CR_CERT_IMG) ? `data:image/png;base64,${images.MAIN_CR_CERT_IMG}` : img_placeholder;
				this.customer_info.images.NATIONAL_ADD_IMG = (images.NATIONAL_ADD_IMG) ? `data:image/png;base64,${images.NATIONAL_ADD_IMG}` : img_placeholder;
				this.customer_info.images.VAT_CERT_IMG = (images.VAT_CERT_IMG) ? `data:image/png;base64,${images.VAT_CERT_IMG}` : img_placeholder;
				console.log(res);
			}

			// console.log(res);
			// console.log(this.customers_raw);

			/*var image = new Image();
			image.onload = function(){
			   console.log(image.width); // image is loaded and we have image width 
			}
			image.src = res.data[0].BALADIYA_CERT_IMG;
			document.body.appendChild(image);*/
  	});
  }

  frmVatUpdateSubmit = ()=>{

  	if(this.selected_customer==''){
  		this.NotificationService.alert('Alert', 'Please select a customer to update');
  		return false;
  	}
  	console.log(this.frmVatUpdate);

  	const body = {
  		P_USER_ID: this.loggedInUser.USER_ID,
  		P_CUST_NUMBER: this.selected_customer, 
  		P_USER_TYPE: this.loggedInUser.USER_TYPE,
  		P_LATITUDE: 'Null', 
  		P_LONGITUDE: 'Null', 
  		P_VAT_NUM: this.frmVatUpdate.value.vat,
  		P_MAIN_CR_NUM: this.frmVatUpdate.value.maincr, 
  		P_BR_CR_NUM: this.frmVatUpdate.value.branchcr,
  		P_COC_NUM: this.frmVatUpdate.value.coc,
  		P_BALADIYA_NUM: this.frmVatUpdate.value.baldiya,
  		P_VAT_CERT_IMG: 'Null',
  		P_MAIN_CR_CERT_IMG: 'Null', 
  		P_BR_CR_CERT_IMG: 'Null',
  		P_COC_CERT_IMG: 'Null',
  		P_BALADIYA_CERT_IMG: 'Null', 
  		P_NATIONAL_ADD_IMG: 'Null',
  	}

		this.NotificationService.presentLoading();;

  	this.http.post<any>('http://localhost:12123/updateVat', body).subscribe(res => {

			this.NotificationService.dismissLoading()
			
			if(res.status=='Success'){
				console.log(res)
			}

			// console.log(res);
			// console.log(this.customers_raw);
  	});

  	// console.log(payload);
  }

  logout = ()=>{
		this.localStorageService.logout();
  }
}
