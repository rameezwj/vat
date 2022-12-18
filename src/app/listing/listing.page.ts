import {
	Router,
	ActivatedRoute
  } from '@angular/router';
  import {
	Component,
	OnInit
  } from '@angular/core';
  import {
	FormBuilder,
	FormGroup,
	NgForm,
	Validators
  } from '@angular/forms';
  import {
	HttpClient,
	HttpParams
  } from '@angular/common/http';
  import {
	DataService
  } from '../data.service';
  import {
	Observable,
	Subscriber
  } from 'rxjs';
  import {
	LocalStorageService
  } from '../services/local-storage.service';
  import {
	NotificationService
  } from '../services/notification.service';
  // import {SearchByStringPipe} from '../pipes/search-by-string.pipe';
  import {
	IonicSelectableComponent
  } from 'ionic-selectable';
  import {
	map
  } from 'rxjs/operators';
  import {
	DomSanitizer,
	SafeResourceUrl,
	SafeUrl
  } from '@angular/platform-browser';
  import {
	environment
  } from '../../environments/environment';
  import * as moment from 'moment';
  
  // import dummy from './dummy.json';
  
  @Component({
	selector: 'app-listing',
	templateUrl: './listing.page.html',
	styleUrls: ['./listing.page.scss'],
  })
  export class ListingPage implements OnInit {
  
	moment: any = moment;
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
  
	provinces: any = [];
  
	constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService, public sanitizer: DomSanitizer) {
  
	  this.loggedInUser = this.localStorageService.getItem('user_info');
	  this.provinces = this.loggedInUser.province;
	}
  
	ngOnInit() {
	  this.initFrmVatUpdate();
	}
  
	ionViewDidEnter() {
  
	  this.initFrmVatUpdate();
  
	  setTimeout(() => {
		this.getCustomers();
	  }, 1000)
	}
  
	getCustomers = () => {
	  this.customers_raw = [],
		this.customersFilterData = [];
  
	  const body = {
		P_CUSTOMER_ID: "3866",
	  };
  
	  this.NotificationService.presentLoading('Fetching Customers...');;;
  
	  this.http.post < any > (`${environment.base_url}/getSupervisorCustomer`, body).subscribe(res => {
  
		setTimeout(() => {
		  this.NotificationService.dismissLoading();;;
		}, 1000);
  
		if (res.status == 'Success' && res.data.length > 0) {
		  console.log(res.data);
		  this.customers_raw = res.data;
		  this.customersFilterData = res.data;
  
		  this.customers_found_status = false;
		} else {
		  this.customers_found_status = true;
		}
	  });
	}
  
	initFrmVatUpdate = () => {
	  this.frmVatUpdate = this.formBuilder.group({
		customer_id: ['', Validators.required],
		customer_no: ['', Validators.required],
		cust_name: ['', Validators.required],
		cust_name_ar_vat: ['', Validators.required],
		vat: ['', Validators.required],
		maincr: ['', Validators.required],
		na_street_name: ['', Validators.required],
		na_building_number: ['', Validators.required],
		na_additional_number: ['', Validators.required],
		na_unit_number: ['', Validators.required],
		na_city: ['', Validators.required],
		na_postal_code: ['', Validators.required],
		na_district: ['', Validators.required],
		na_province: ['', Validators.required],
		remarks: ['', Validators.required],
	  });
	}
  
	resetFrmVatUpdate = () => {
	  this.frmVatUpdate.patchValue({
		customer_id: ['', Validators.required],
		customer_no: ['', Validators.required],
		cust_name: ['', Validators.required],
		cust_name_ar_vat: ['', Validators.required],
		vat: ['', Validators.required],
		maincr: ['', Validators.required],
		na_street_name: ['', Validators.required],
		na_building_number: ['', Validators.required],
		na_additional_number: ['', Validators.required],
		na_unit_number: ['', Validators.required],
		na_city: ['', Validators.required],
		na_postal_code: ['', Validators.required],
		na_district: ['', Validators.required],
		na_province: ['', Validators.required],
		remarks: ['', Validators.required],
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
  
	fetchSelectedCustomer = (customer) => {
  
	  this.selected_customer = customer;
  
	  let custRow = this.customers_raw.filter((i, v) => {
		return (i.CUST_NUMBER == customer.CUST_NUMBER);
	  });
  
  
	  custRow = custRow[0];
  
	  console.log(custRow);
  
	  this.frmVatUpdate.patchValue({
		customer_id: custRow.CDC_CUS_ID,
		customer_no: custRow.CUST_NUMBER,
		cust_name: custRow.CUST_NAME,
		cust_name_ar_vat: custRow.CUST_NAME_AR,
		vat: custRow.VAT_NUM,
		maincr: custRow.MAIN_CR_NUM,
		na_street_name: custRow.NA_STREET_NAME,
		na_building_number: custRow.NA_BUILDING_NUMBER,
		na_additional_number: custRow.NA_ADDITIONAL_NUMBER,
		na_unit_number: custRow.NA_UNIT_NUMBER,
		na_city: custRow.NA_CITY,
		na_postal_code: custRow.NA_POSTAL_CODE,
		na_district: custRow.NA_DISTRICT,
		na_province: custRow.NA_PROVINCE,
		remarks: custRow.REMARKS,
	  });
  
	  this.NotificationService.presentLoading();;;
  
	  const body = {
		P_CUST_ID: `${customer.CDC_CUS_ID}`,
	  };
  
	  this.http.post < any > (`${environment.base_url}/getCustomerImages`, body).subscribe(res => {
  
		setTimeout(() => {
		  this.NotificationService.dismissLoading();;;
		}, 1000)
		
		console.log(res)
		return;
		let images = res.data[0];
  
		if (res.status == 'Success' && res.data.length) {
  
		  this.selected_customer_images = true;
  
		  this.customer_info.images.MAIN_CR_CERT_IMG = (images.MAIN_CR_CERT_IMG) ? `${images.MAIN_CR_CERT_IMG}` : this.dummy_img;
		  this.customer_info.images.NATIONAL_ADD_IMG = (images.NATIONAL_ADD_IMG) ? `${images.NATIONAL_ADD_IMG}` : this.dummy_img;
		  this.customer_info.images.VAT_CERT_IMG = (images.VAT_CERT_IMG) ? `${images.VAT_CERT_IMG}` : this.dummy_img;
  
		  this.changeImg(1);
		} else {
		  this.NotificationService.alert('Alert', 'No images found');
  
		  this.selected_customer_images = false;
		  this.customer_info.images.MAIN_CR_CERT_IMG = this.dummy_img;
		  this.customer_info.images.NATIONAL_ADD_IMG = this.dummy_img;
		  this.customer_info.images.VAT_CERT_IMG = this.dummy_img;
		}
	  });
	}
  
	frmVatUpdateSubmit = () => {
	  if (this.selected_customer == '') {
		this.NotificationService.alert('Alert', 'Please select a customer to update');
		return false;
	  }
  
	  console.log(this.frmVatUpdate.value);
  
	  this.NotificationService.presentLoading();;;
  
	  const body = {
		P_USER_ID: this.loggedInUser.userInfo.USER_ID,
		P_CDC_CUS_ID: `${this.frmVatUpdate.value.customer_id}`,
		P_CUST_NUMBER: this.frmVatUpdate.value.customer_no,
		P_CUST_NAME_AR: this.frmVatUpdate.value.cust_name_ar_vat,
		P_VAT_NUM: this.frmVatUpdate.value.vat,
		P_MAIN_CR_NUM: this.frmVatUpdate.value.maincr,
		P_NA_STREET_NAME: this.frmVatUpdate.value.na_street_name,
		P_NA_BUILDING_NUMBER: this.frmVatUpdate.value.na_building_number,
		P_NA_ADDITIONAL_NUMBER: this.frmVatUpdate.value.na_additional_number,
		P_NA_UNIT_NUMBER: this.frmVatUpdate.value.na_unit_number,
		P_NA_CITY: this.frmVatUpdate.value.na_city,
		P_NA_POSTAL_CODE: this.frmVatUpdate.value.na_postal_code,
		P_NA_DISTRICT: this.frmVatUpdate.value.na_district,
		P_NA_PROVINCE: this.frmVatUpdate.value.na_province,
		P_REMARKS: this.frmVatUpdate.value.remarks,
	  }
  
	  console.table(body);
  
	  this.http.post < any > (`${environment.base_url}/approveVat`, body).subscribe(res => {
  
		setTimeout(() => {
		  this.NotificationService.dismissLoading();;;
		}, 500);
  
		if (res.status == 'Success') {
		  console.log(res)
		  this.resetFrmVatUpdate();
  
		  setTimeout(() => {
			this.router.navigate(['/splash', {
			  'message': `${res.data}`
			}]);
		  }, 600);
		}
	  });
	}
  
	frmVatRejectSubmit = () => {
	  if (this.selected_customer == '') {
		this.NotificationService.alert('Alert', 'Please select a customer to update');
		return false;
	  }
  
	  this.NotificationService.presentLoading();;;
  
	  const body = {
		P_USER_ID: this.loggedInUser.userInfo.USER_ID,
		P_CDC_CUS_ID: `${this.frmVatUpdate.value.customer_id}`,
	  }
  
	  console.table(body);
  
	  this.http.post < any > (`${environment.base_url}/rejctVat`, body).subscribe(res => {
  
		setTimeout(() => {
		  this.NotificationService.dismissLoading();;;
		}, 500);
  
		if (res.status == 'Success') {
		  console.log(res)
		  this.resetFrmVatUpdate();
  
		  setTimeout(() => {
			this.router.navigate(['/splash', {
			  'message': `${res.data}`
			}]);
		  }, 600);
		}
	  });
	}
  
	changeImg = (img_counter) => {
  
	  switch (img_counter) {
		case 1:
		  this.image_switcher.path = this.customer_info.images.MAIN_CR_CERT_IMG;
		  this.image_switcher.title = 'Main Cr_Certificate';
		  break;
  
		case 2:
		  this.image_switcher.path = this.customer_info.images.NATIONAL_ADD_IMG;
		  this.image_switcher.title = 'National Address';
		  break;
  
		case 3:
		  this.image_switcher.path = this.customer_info.images.VAT_CERT_IMG;
		  this.image_switcher.title = 'VAT Certificate';
		  break;
	  }
	}
  
	changeImgPrev = () => {
  
	  if (this.img_counter <= 1) {
		this.img_counter = 1;
	  } else {
		this.img_counter--;
	  }
	  this.changeImg(this.img_counter);
	}
  
	changeImgNext = () => {
	  if (this.img_counter >= 3) {
		this.img_counter = 3;
	  } else {
		this.img_counter++;
	  }
	  this.changeImg(this.img_counter);
	}
  
	filterPackets = (searchString) => {
  
	  let searchStringLength = searchString.length;
  
	  if (searchString == '') {
		this.customersFilterData = this.customers_raw;
	  } else {
		this.customersFilterData = this.customers_raw.filter((item) => {
		  if ((`${item.CUST_NUMBER}`).toLowerCase().includes(searchString)) {
			return item;
		  }
		})
	  }
	}
  
	logout = () => {
	  this.localStorageService.logout();
	}
  }