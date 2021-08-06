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

	customers: any = [];
	frmVatUpdate: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService) {

		this.NotificationService.presentLoading();;

  	this.http.post<any>('http://localhost:12123/update_vat', {}).subscribe(res => {

			this.NotificationService.dismissLoading()
			console.log(res, 'listing');

			this.customers = res.data.map((i,v)=>{
				return {customer_number: i.CUST_NUMBER, customer_name: i.CUST_NAME, customer_name_ar: i.CUST_NAME_AR};
			})
			console.log(this.customers);
  	});
		
		// this.customers = dummy;
  }

  ngOnInit() {
  	this.initFrmVatUpdate();
  }

  initFrmVatUpdate= ()=> {
    this.frmVatUpdate = this.formBuilder.group({
      vat: ['', Validators.required ],
      /*file_vat: ['', Validators.required ],
      maincr: ['', Validators.required ],
      file_maincr: ['', Validators.required ],
      branchcr: ['', Validators.required ],
      file_branchcr: ['', Validators.required ],
      coc: ['', Validators.required ],
      file_coc: ['', Validators.required ],
      baldiya: ['', Validators.required ],
      file_baldiya: ['', Validators.required ],
      address: ['', Validators.required ],
      file_address: ['', Validators.required ],*/
    });
  }

  fetch_img = (customer_number)=>{
  	console.log(customer_number);
  	// alert('sdsd')
  }
}
