import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  title:string = '';
  user: any;
  isDropdownOpen = false;
  constructor(
      private auth: AuthService,
      private router: Router
    ) {}

  ngOnInit() {
    this.user = this.auth.getUserDetails();
    this.setUserRoleTitle();
  }

  setUserRoleTitle() {
    const roles = this.auth.getUserRoles();
    
    if (roles.includes('admin')) {
      this.title = 'Admin Dashboard';
    } else if (roles.includes('student')) {
      this.title = 'Student Dashboard';
    } else if(roles.includes('instructor')) {
      this.title = 'Instructor Dashboard';
    } 
    else {
      this.title = 'Guest';
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
