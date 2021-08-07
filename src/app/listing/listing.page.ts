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

	customers_raw: any;
	customer_info: any = {
		classification: '',
		city: '',
		salesRepName: '',
		salesRepNumber: '',
		agencyCat: '',
		division: '',
		images: {
			BALADIYA_CERT_IMG: 'https://rbsqa.tcscourier.com/assets/images/logo.png',
			BR_CR_CERT_IMG: 'https://rbsqa.tcscourier.com/assets/images/logo.png',
			COC_CERT_IMG: 'https://rbsqa.tcscourier.com/assets/images/logo.png',
			MAIN_CR_CERT_IMG: 'https://rbsqa.tcscourier.com/assets/images/logo.png',
			NATIONAL_ADD_IMG: 'https://rbsqa.tcscourier.com/assets/images/logo.png',
			VAT_CERT_IMG: 'https://rbsqa.tcscourier.com/assets/images/logo.png',
		}
	};

	frmVatUpdate: FormGroup;
	
  constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService) {

		this.NotificationService.presentLoading();;

  	this.http.post<any>('http://localhost:12123/getCustomers', {}).subscribe(res => {

			this.NotificationService.dismissLoading()
			
			if(res.status=='Success'){
				this.customers_raw = res.data;
				
				/*this.customers = res.data.map((i,v)=>{
					return {customer_number: i.CUST_NUMBER, customer_name: i.CUST_NAME, customer_name_ar: i.CUST_NAME_AR};
				})*/

			}

			// console.log(res);
			console.log(this.customers_raw);
  	});
  }

  ngOnInit() {
  	this.initFrmVatUpdate();
  }

  initFrmVatUpdate= ()=> {
    this.frmVatUpdate = this.formBuilder.group({
      vat: ['', Validators.required ],
      maincr: ['', Validators.required ],
      branchcr: ['', Validators.required ],
      coc: ['', Validators.required ],
      baldiya: ['', Validators.required ],
      address: ['', Validators.required ],
    });

    setTimeout(()=>{
    	this.frmVatUpdate.patchValue({vat: 8910});

    	// console.log(this.frmVatUpdate)
    }, 5000);
  }

  fetch_img = (customer_number)=>{

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
  
		this.NotificationService.presentLoading();;

		const body = {customerNumber: customer_number};

  	this.http.post<any>('http://localhost:12123/getCustomerImages', body).subscribe(res => {

			this.NotificationService.dismissLoading();
			
			let images = res.data[0],
					img_placeholder = 'https://upload.wikimedia.org/wikipedia/en/2/21/Link_of_the_Wild.png';

			if(res.status=='Success'){
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
}
