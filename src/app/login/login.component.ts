import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  title = 'YogaConnect';
    username: string = '';
    password: string = '';
    errorMessage: string = '';
    role: string[] = [];
  
    constructor(
      public auth: AuthService,
      private router: Router
    ) {}

    ngOnInit() {
      if (this.auth.isLoggedIn()) {
        this.role = this.auth.getUserRoles();
        if(this.role.includes('admin')){
          this.router.navigate(['/dashboard']);
        }
        else if(this.role.includes('student')){
          this.router.navigate(['/student']);
        }        
        else{
          this.auth.logout();
          this.router.navigate(['/']);
        }
      }
    }
    
    onLogin() {
  
      this.auth.login(this.username, this.password)
        .subscribe({
          next: () => {
            this.role = this.auth.getUserRoles();
        if(this.role.includes('admin')){
          this.router.navigate(['/dashboard']);
        }
        else if(this.role.includes('student')){
          this.router.navigate(['/student']);
        }        
        else{
          alert('Unknown role, cannot navigate');
          this.auth.logout();
          this.router.navigate(['/']);
        }
          },
          error: () => {
            this.errorMessage = 'Invalid username or password';
          }
        });
    }
}
