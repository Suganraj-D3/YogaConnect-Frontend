import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, switchMap, tap, of, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloakUrl = 'http://localhost:8080';
  private realm = 'yoga-realm';
  private clientId = 'yoga-client';
  private clientSecret = 'tdhh2FORuYh31Z9IG0t2H1Xa8jui6nf9';
  private tokenUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  private adminBaseUrl = `${this.keycloakUrl}/admin/realms/${this.realm}`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', username)
      .set('password', password);

    return this.http.post(this.tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap((tokens: any) => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
      })
    );
  }

  getToken(): string | null { return localStorage.getItem('access_token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  logout(): void { localStorage.clear(); }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes('admin') || roles.includes(role);
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded: any = jwtDecode(token);
      return decoded.realm_access?.roles || [];
    } catch (e) { return []; }
  }

  getUserDetails() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return {
        name: decoded.name || decoded.preferred_username,
        email: decoded.email
      };
    } catch (error) { return null; }
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminBaseUrl}/users`);
  }

  updateUser(userId: string, updatedData: any): Observable<any> {
    return this.http.put(`${this.adminBaseUrl}/users/${userId}`, updatedData);
  }

  getRoleByName(roleName: string): Observable<any> {
    return this.http.get<any>(`${this.adminBaseUrl}/roles/${roleName}`);
  }

  getUserAssignedRoles(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminBaseUrl}/users/${userId}/role-mappings/realm`);
  }

  deleteUserRole(userId: string, roles: any[]): Observable<any> {
    return this.http.delete(`${this.adminBaseUrl}/users/${userId}/role-mappings/realm`, { body: roles });
  }

  assignRoleToUser(userId: string, roles: any[]): Observable<any> {
    return this.http.post(`${this.adminBaseUrl}/users/${userId}/role-mappings/realm`, roles);
  }

  getClientIdByInternalName(clientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminBaseUrl}/clients`).pipe(
      map(clients => clients.filter(c => c.clientId === clientId))
    );
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.preferred_username || decoded.sub || null;
    } catch (error) {
      return null;
    }
  }

  getClientRoles(clientUuid: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminBaseUrl}/clients/${clientUuid}/roles`);
  }

  assignClientRolesToUser(userId: string, clientUuid: string, roles: any[]): Observable<any> {
    return this.http.post(`${this.adminBaseUrl}/users/${userId}/role-mappings/clients/${clientUuid}`, roles);
  }

  createUserWithFullPermissions(userData: any, selectedRole: string): Observable<any> {
    const userPayload = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: true,
      emailVerified: true,
      requiredActions: [],
      credentials: [{ type: "password", value: userData.password, temporary: false }]
    };

    return this.http.post(`${this.adminBaseUrl}/users`, userPayload, { observe: 'response' }).pipe(
      switchMap((response: HttpResponse<any>) => {
        const userId = response.headers.get('Location')?.split('/').pop() || '';
        return this.getRoleByName(selectedRole).pipe(
          switchMap(roleObj => this.assignRoleToUser(userId, [roleObj])),
          switchMap(() => {
            if (selectedRole !== 'admin') return of(null);
            return this.elevateToAdminPrivileges(userId);
          })
        );
      })
    );
  }

  elevateToAdminPrivileges(userId: string): Observable<any> {
    return this.getClientIdByInternalName('realm-management').pipe(
      switchMap(clients => {
        if (!clients || clients.length === 0) {
          throw new Error("Client 'realm-management' not found.");
        }
        const clientUuid = clients[0].id;
        return this.getClientRoles(clientUuid).pipe(
          switchMap(allRoles => {
            const privs = [
              'manage-users', 'view-users', 'query-groups', 
              'query-users', 'view-realm', 'assign-roles',
              'view-clients', 'query-clients'
            ];
            const rolesToAssign = allRoles.filter(r => privs.includes(r.name));
            return this.assignClientRolesToUser(userId, clientUuid, rolesToAssign);
          })
        );
      })
    );
  }


  refreshToken(): Observable<any> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return of(null);

  const body = new HttpParams()
    .set('grant_type', 'refresh_token')
    .set('client_id', this.clientId)
    .set('client_secret', this.clientSecret)
    .set('refresh_token', refreshToken);

  return this.http.post(this.tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).pipe(
    tap((tokens: any) => {
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
    })
  );
}

}