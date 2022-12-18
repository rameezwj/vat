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
import {
    IonicSelectableComponent
} from 'ionic-selectable';
import {
    environment
} from '../../environments/environment';
import {
    ModalController,
    ToastController,
    AlertController,
    LoadingController
} from '@ionic/angular';
import {
    QrScannerPage
} from './qr-scanner/qr-scanner.page';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    loggedInUser: any;
    frmVat: FormGroup;
    customers: any = [];
	cities: any = [];
	provinces: any = [];
    allowed_file_types = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG'];

    file_names: any = {
        'file_vat': '',
        'file_maincr': '',
        'file_branchcr': '',
        'file_coc': '',
        'file_baldiya': ''
    };

    constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService, public modalController: ModalController) {

        this.loggedInUser = this.localStorageService.getItem('user_info');
		this.provinces = this.loggedInUser.province;
		console.log(this.loggedInUser);
    }

    ngOnInit() {
		this.customers = this.loggedInUser.customer;
        this.initFrmVat();
    }

    ionViewDidEnter() {
		this.customers = this.loggedInUser.customer;
        this.initFrmVat();
    }

    frmVatSubmit = () => {
        // const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };

        if (this.frmVat.status != 'VALID') {
		    this.NotificationService.alert('Alert', 'All fields are mandatory');
            return false;
        }

        this.NotificationService.presentLoading();;;

        const body = {
            P_USER_ID: this.loggedInUser.userInfo.USER_ID,
			P_CDC_CUS_ID: `${this.frmVat.value.customer_dd.CUSTOMER_ID}`,
			P_CUST_NUMBER: this.frmVat.value.customer_dd.CUST_NUMBER,
			P_CUST_NAME_AR: this.frmVat.value.cust_name_ar_vat,
			P_VAT_NUM: this.frmVat.value.vat,
			P_MAIN_CR_NUM: this.frmVat.value.maincr,
			P_NA_STREET_NAME: this.frmVat.value.na_street_name,
			P_NA_BUILDING_NUMBER: this.frmVat.value.na_building_number,
			P_NA_ADDITIONAL_NUMBER: this.frmVat.value.na_additional_number,
			P_NA_UNIT_NUMBER: this.frmVat.value.na_unit_number,
			P_NA_CITY: this.frmVat.value.na_city.CITY,
			P_NA_POSTAL_CODE: this.frmVat.value.na_postal_code,
			P_NA_DISTRICT: this.frmVat.value.na_district,
			P_NA_PROVINCE: this.frmVat.value.na_province.PROVINCE,
			P_REMARKS: this.frmVat.value.remarks,
			P_VAT_CERTIFICATE: this.frmVat.value.file_vat,
			P_CR_CERTIFICATE: this.frmVat.value.file_maincr,
			P_NA_CERTIFICATE: this.frmVat.value.file_address,
        }

		// console.log(body);
		// return;
		
        this.http.post < any > (`${environment.base_url}/updateVat`, body).subscribe(res => {

            setTimeout(() => {
                this.NotificationService.dismissLoading();;;
            }, 500);

            if (res.status == 'Success') {
                console.log(res)
                
				this.customers = this.loggedInUser.customer.filter((v,i)=>{
					return v.CUST_NUMBER != this.frmVat.value.customer_dd.CUST_NUMBER 
				})
				
                this.customers = this.loggedInUser.customer;
				this.localStorageService.setItem('user_info', {...this.loggedInUser, 'customer': [...this.customers]});
				this.resetfrmVat();
				
                setTimeout(() => {
                    this.router.navigate(['/splash', {
                        'message': `${res.data}`
                    }]);
                }, 800);
            }
        });
    }

    initFrmVat = () => {
        this.frmVat = this.formBuilder.group({
            customer_dd: ['', Validators.required],
			cust_name: ['', Validators.required],
            cust_name_ar_vat: ['', Validators.required],
            vat: ['', Validators.required],
            file_vat: ['', Validators.required],
            maincr: ['', Validators.required],
            file_maincr: ['', Validators.required],
			na_street_name: ['', Validators.required],
			na_building_number: ['', Validators.required],
			na_additional_number: ['', Validators.required],
			na_unit_number: ['', Validators.required],
			na_city: ['', Validators.required],
			na_postal_code: ['', Validators.required],
			na_district: ['', Validators.required],
			na_province: ['', Validators.required],
            file_address: ['', Validators.required],
			remarks: ['', Validators.required],
        });
    }

    resetfrmVat = () => {
        this.frmVat.patchValue({
            customer_dd: '',
			cust_name: '',
            cust_name_ar_vat: '',
            vat: '',
            file_vat: '',
            maincr: '',
            file_maincr: '',
			na_street_name: '',
			na_building_number: '',
			na_additional_number: '',
			na_unit_number: '',
			na_city: '',
			na_postal_code: '',
			na_district: '',
			na_province: '',
            file_address: '',
			remarks: '',
        });
    }

    onFileChange = (event) => {
        // validation
        const name = event.target.files[0].name;
        const lastDot = name.lastIndexOf('.');
        const ext = name.substring(lastDot + 1);

        if (!(this.allowed_file_types.includes(ext))) {

            if (event.target.name == 'file_vat') {
                this.frmVat.patchValue({
                    file_vat: ''
                });
            } else if (event.target.name == 'file_maincr') {
                this.frmVat.patchValue({
                    file_maincr: ''
                });
            } else if (event.target.name == 'file_address') {
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

    convertToBase64 = (file: File, name) => {

        const observable = new Observable((subscriber: Subscriber < any > ) => {
            this.readFile(file, name, subscriber);
        });

        // console.log(file, name);

        observable.subscribe((data) => {

            switch (data.name) {
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

    readFile = (file: File, name, subscriber: Subscriber < any > ) => {
        const fileReader = new FileReader();

        fileReader.readAsDataURL(file);

        fileReader.onload = () => {
            subscriber.next({
                base64: fileReader.result,
                name: name
            });

            setTimeout(() => {
                this.NotificationService.dismissLoading();;;
            }, 1000)

            subscriber.complete();
        }

        fileReader.onerror = (error) => {
            subscriber.error(error);
            subscriber.complete();
        }
    }

    getCustomerInfo = (customer) => {
		console.log(customer)
        const body = {
            P_CUSTOMER_ID: `${customer.CUSTOMER_ID}`
        };

        this.NotificationService.presentLoading('Fetching Customer');;;

        this.http.post < any > (`${environment.base_url}/getCustomerInfo`, body).subscribe(res => {

            setTimeout(() => {
                this.NotificationService.dismissLoading();;;
            }, 1000);

			// console.log(res);
			// return;

            if (res.status == 'Success') {

                this.localStorageService.setItem('sales_customers', res.data);

                this.frmVat.patchValue({
					customer_dd: customer,
					cust_name: res.data.CUST_NAME,
					cust_name_ar_vat: res.data.CUST_NAME_AR,
					vat: res.data.VAT_NUM,
					maincr: res.data.MAIN_CR_NUM,
					na_street_name: res.data.NA_STREET_NAME,
					na_building_number: res.data.NA_BUILDING_NUMBER,
					na_additional_number: res.data.NA_ADDITIONAL_NUMBER,
					na_unit_number: res.data.NA_UNIT_NUMBER,
					na_city: res.data.NA_CITY,
					na_postal_code: res.data.NA_POSTAL_CODE,
					na_district: res.data.NA_DISTRICT,
					na_province: res.data.NA_PROVINCE,
					remarks: res.data.REMARKS,
				});

                console.log(this.frmVat, 'ssdsds');
            } else {
                setTimeout(() => {
                    this.NotificationService.alert('Alert', 'No Customer found');
                }, 1500);
            }
        });
    }

    selectCustomer = (e) => {
        console.log(e, 'ion selectable');
    	this.getCustomerInfo(e.value);
    }

	selectProvince = (e) => {
        console.log(e, 'ion selectable');
		this.cities = this.loggedInUser.city.filter((v,i)=>{
			return v.PROVINCE == e.value.PROVINCE
		})
    }


    logout = () => {
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