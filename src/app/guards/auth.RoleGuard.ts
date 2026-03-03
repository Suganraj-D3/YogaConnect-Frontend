import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RoleGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {}
    private role: string[] = [];
    canActivate(): boolean {
        if(this.auth.isLoggedIn()) {
            if(this.auth.hasRole('admin')) {
                return true;
            }
            else if (this.auth.hasRole('student')) {
                this.router.navigate(['/student']);
            } else {
                this.router.navigate(['/']);
                return false;
            }

        }
        this.router.navigate(['/']);
        return false;
    }
}