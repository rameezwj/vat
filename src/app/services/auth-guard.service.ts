import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import {Observable} from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private localStorageService: LocalStorageService,) {}
​
  canActivate(route: ActivatedRouteSnapshot): boolean {
​
    let login_status = this.localStorageService.getItem('status_login');
    // console.log(login_status);

    if (login_status!='1') {
      // console.log('logged out', login_status)
      this.router.navigate(["login"]);
      return true;
    }
    else{
      // console.log('loged in', login_status)
      return true;
    }
  }
}