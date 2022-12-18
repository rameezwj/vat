import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {LocalStorageService} from '../services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginUserGuard implements CanActivate {
  
  constructor(private router: Router, private localStorageService: LocalStorageService,) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      
      let login_status = this.localStorageService.getItem('status_login'),
      		user_data = this.localStorageService.getItem('user_info');
      // console.log(login_status);

      if (login_status=='1') {
        
        if(user_data.userInfo.USER_TYPE=='SALES'){
          this.router.navigate(["/home"]);
        }
        else{
        	this.router.navigate(["/listing"]);
        }

        return true;
      }
      else{
        // console.log('loged in', login_status)
        return true;
      }
  }
  
}
