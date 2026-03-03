import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { LessonsService } from '../services/Lessons.service';

@Component({
  selector: 'app-topic-modal',
  templateUrl: './topic-modal.component.html',
  styleUrls: ['./topic-modal.component.css']
})
export class TopicModalComponent {
  constructor(
      private router: Router,
      private lessonService:LessonsService
   ) {}


  @Input() place:number =0;
  @Output() onClose = new EventEmitter<void>();
  oneline:string="This module covers advanced Yoga practice click start practice to learn more";
  close() {
    this.onClose.emit();
  }

  lessonData: any = null;
  serverMessage: string = '';
  showContent: boolean = false;
  GetLessonMessage(id: number) {
    this.lessonService.GetLessonContent(id + 1).subscribe({
      next: (response) => {
        if (response.message) {
          this.serverMessage = response.message;
          this.lessonData = null;
        } else {
          this.lessonData = {
            title: response.title,
            content: response.course_content || response.courseContent,
            progress: response.totalCount || response.total_count
          };
          this.serverMessage = '';
        }
        this.showContent = true;
      },
      error: (err) => {
        this.lessonService.ErrorCaller(err);
      }
    });
  }
}