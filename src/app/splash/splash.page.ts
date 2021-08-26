import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, NavigationExtras} from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
	message = '';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
  }

  ionViewDidEnter(){

  	this.message = '';

  	// console.log(this.activatedRoute.snapshot.params.message);
  	this.message = this.activatedRoute.snapshot.params.message;

  	setTimeout(()=>{
  		this.router.navigate(['/login']);
  	}, 2000);
  }

}
