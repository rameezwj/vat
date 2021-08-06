import {Router, ActivatedRoute} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataService} from '../data.service';
import {Observable} from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';
import {NotificationService} from '../services/notification.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  frmLogin: FormGroup;
  
  constructor(private router: Router, private formBuilder: FormBuilder, data: DataService, private http: HttpClient, private localStorageService: LocalStorageService, private NotificationService: NotificationService,) {
  }

  ngOnInit() {
  	setTimeout(()=>{
  		// this.router.navigate(['/home']);
  	}, 2000)

  	this.initFrmLogin();

  	/*let obs = new Observable((observer)=>{
  		observer.next('1');

  		setTimeout(()=>{
  			observer.next('2');
  		}, 5000)
  	});*/

		/*this.data.print().subscribe((data)=>{
			console.log(data);
		})*/
  }

  initFrmLogin= ()=> {
    this.frmLogin = this.formBuilder.group({
      username: ['', Validators.required ],
      password: ['', Validators.required ]
    });
  }

  frmLoginSubmit = ()=>{

  	if(this.frmLogin.status!='VALID'){
  		this.NotificationService.alert('Alert', 'Please enter valid crendetials');
  		return false;
  	}

    /*this.router.navigate(["/home"]);
    return false;*/

  	this.NotificationService.presentLoading();

  	// const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
		const body = { username: this.frmLogin.value.username, password: this.frmLogin.value.password };
		
		this.http.post<any>('http://localhost:12123/login', body).subscribe(res => {
		   
		   this.NotificationService.dismissLoading();

		   console.log(res);

		   if(res.status=='Success'){
        this.localStorageService.setItem('status_login', '1');
		   	this.localStorageService.setItem('user_info', res.data);

      	this.router.navigate(["/home"]);
		   }
		   else{
		   	this.NotificationService.alert('Alert', 'Please enter valid crendetials');
		   }
		});
  }
}
