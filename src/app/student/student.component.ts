import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {LessonsService} from '../services/Lessons.service'
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent {
  
  user: any;
  studentProfile: any;

  isModalOpen:boolean = false;
  selectedTopic:string = "";
  indexing:number=0;

  greeting: string = '';
  status:string='';
  
  subjects:string[]=[];
  numbers:number=this.subjects.length;
  visitedLesson:number=0;
  
  //MOCK DATA
  streakValue:number=5;

  learningProgress = {
    completedLessons: this.visitedLesson,
    totalLessons: this.numbers,
    currentLevel: this.status,
    streak: this.streakValue
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private lessonService:LessonsService
  ) {}

  ngOnInit() {
    this.user = this.auth.getUserDetails();
    this.studentProfile = this.auth.getUserDetails();
    this.updateGreeting();

    this.lessonService.ensureUserSynced().pipe(
      switchMap((syncData) => {
        this.loadLessons();
        this.loadProgress();
        return of(syncData);
      })
    ).subscribe({
      next: (response) => {
        // console.log(`Message: ${response?.message}`);
        // console.log(`Username: ${response?.username}`);
        // console.log(`Count: ${response?.currentLearningCount}`);
      },
      error: (err) => this.lessonService.ErrorCaller(err)
    });
  }


  loadLessons() {
    this.lessonService.GetLessonsList()
      .subscribe(
        {
          next: (data) => {
            this.subjects = data;
            this.learningProgress.totalLessons = this.subjects.length;
            this.updateStatus(); 
            // console.log('Data arrived and UI updated');
          },
          error: (err) => {
            this.lessonService.ErrorCaller(err);
          }
        }
      );
  }

  loadProgress(){
    this.lessonService.GetProgressCount().subscribe(
      {
        next:(data)=>
        {
          this.visitedLesson=data;
          this.learningProgress = {
            ...this.learningProgress,
            completedLessons: data.learningCount
          };
          this.updateStatus();
        },
        error:(err)=>{this.lessonService.ErrorCaller(err)}
      }
    )
  }

  
  GetLessons(){
    alert("The output will be diplayed in the console...to watch press (F12)");
    this.lessonService.GetLessonsList()
      .subscribe({
        next:(data)=>{console.log(data)},
        error:(err)=>{this.lessonService.ErrorCaller(err)}
      }
    );
  }


  get progressPercentage(): number {
    return (this.learningProgress.completedLessons / this.learningProgress.totalLessons) * 100;
  }

  updateGreeting(): void {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  updateStatus(){
    let value=this.learningProgress.completedLessons;
    let tot=this.learningProgress.totalLessons;
    if(value<=tot/4){
      this.status="Low";
    }
    else if(value<=tot/2){
      this.status="Average";
    }
    else if(value<=(tot*(3/4))){
      this.status="Good";
    }
    else{
      this.status="Excellent";
    }
  }

  reset(){
    if(confirm("Are you sure it will delete all your progress....")){
    console.log("Reseting your Learning progress...");
    this.lessonService.DeleteAllProgressCount()
      .subscribe(
        {
          next:(response)=>
          {
            console.log(response.message);
            this.loadProgress();
          },
          error:(err)=>{this.lessonService.ErrorCaller(err)} 
        }
      );
    this.loadProgress();
    }

  }

  openTopic(topic: string) {
    this.indexing=this.subjects.indexOf(topic);
    this.selectedTopic = (topic);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.loadProgress();
    this.updateStatus();
  }

}
