import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginUserGuard implements CanActivate {
  
  constructor(private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      const currentUser = true;
      
      // When user already logged in prevent to access login route
      if (currentUser) {
        // this.router.navigateByUrl('/listing');
        return true;
      }
      return true;
  }
  
}
