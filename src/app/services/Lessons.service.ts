import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { StudentComponent } from '../student/student.component';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LessonsService{

    errorMessage: string = '';
    url:string="https://localhost:7205/api/Lessons";
    constructor(private http: HttpClient,private auth:AuthService) {}
    
    ErrorCaller(err:HttpErrorResponse){
        console.log("Backend Message:", err.error?.message); 
        this.errorMessage = err.error?.message || "Lesson not found";
    }

    GetLessonsList(): Observable<string[]> {
        return this.http.get<string[]>(this.url);
    }

    GetLessonContent(id:number):Observable<any>{
        const username = this.auth.getUserName();
        if (!username) {
            console.error("Cannot fetch progress: User is not logged in.");
            return of(0); 
        }
        return this.http.post<any>(`${this.url}/${username}/${id}`,'');
    }

    GetProgressCount():Observable<any>{
        const username = this.auth.getUserName();
        if (!username) {
            console.error("Cannot fetch progress : User is not logged in.");
            return of(0); 
        }
        return this.http.get<any>(`${this.url}/${username}/learning-count`);
    }

    DeleteAllProgressCount(): Observable<any>{
        const username = this.auth.getUserName();
        if (!username) {
            console.error("Cannot fetch progress : User is not logged in.");
        }
        return this.http.delete<any>(`${this.url}/${username}/learning-count`);
    }


    ensureUserSynced(): Observable<any> {
    const username = this.auth.getUserName();
    if (!username) return of(null);
    return this.http.get<any>(`${this.url}/${username}`);
}

}