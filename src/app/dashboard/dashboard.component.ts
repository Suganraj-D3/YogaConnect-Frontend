import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any;
  newUser = { username: '', email: '', firstName: '', lastName: '', password: '' };
  selectedRole = 'student';
  message = '';
  isError = false;
  allUsers: any[] = [];
  selectedUser: any = null;
  editData: any = {};

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getUserDetails();
    this.loadUsers();
  }

  loadUsers() {
    this.auth.getUsers().subscribe(data => this.allUsers = data);
  }

  onAddUser() {
    this.auth.createUserWithFullPermissions(this.newUser, this.selectedRole).subscribe({
      next: () => {
        this.message = `Successfully created ${this.selectedRole}: ${this.newUser.username}`;
        this.isError = false;
        this.loadUsers();
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.message = err.message || "Registration failed.";
        this.isError = true;
      }
    });
  }

  resetForm() {
    this.newUser = { username: '', email: '', firstName: '', lastName: '', password: '' };
  }

  @ViewChild('editSection') editSection!: ElementRef;
  
  selectUserForEdit(user: any) {
    this.selectedUser = user;
    this.editData = { 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email 
    };

    setTimeout(() => {
      if (this.editSection) {
        this.editSection.nativeElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    }, 100);
  }

  onUpdate() {
    if (!this.selectedUser) return;
    const userId = this.selectedUser.id;
    const isAdmin = this.selectedRole === 'admin';

    this.auth.updateUser(userId, this.editData).pipe(
      switchMap(() => this.auth.getUserAssignedRoles(userId)),
      switchMap((currentRoles) => this.auth.deleteUserRole(userId, currentRoles)),
      switchMap(() => this.auth.getRoleByName(this.selectedRole)),
      switchMap((roleObj) => this.auth.assignRoleToUser(userId, [roleObj])),
      switchMap(() => {
        if (!isAdmin) return of(null);
        return this.auth.elevateToAdminPrivileges(userId);
      })
    ).subscribe({
      next: () => {
        this.message = isAdmin ? "Admin updated with full privileges!" : "Member updated.";
        this.loadUsers();
        this.selectedUser = null;
        this.isError = false;
      },
      error: (err) => {
        console.error(err);
        this.message = err.message || "Update failed.";
        this.isError = true;
      }
    });
  }

}