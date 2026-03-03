import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-live-streaming',
  templateUrl: './live-streaming.component.html',
  styleUrls: ['./live-streaming.component.css']
})
export class LiveStreamingComponent {
    user: any;
    constructor(
      private auth: AuthService,
      private router: Router
    ) {}
  
    ngOnInit() {
      this.user = this.auth.getUserDetails();
    }
    videos = [
      { title: 'Morning Yoga Flow', url: 'assets/videos/dummy.mp4', poster: 'assets/images/image1.jpg' },
      { title: 'Meditation Basics', url: 'assets/videos/dummy.mp4', poster: 'assets/images/image2.jpg' },
      { title: 'Strength Training', url: 'assets/videos/dummy.mp4', poster: 'assets/images/image3.jpg' }
    ];

    toggleVideo(videoElement: HTMLVideoElement) {
      if (videoElement.paused) {
        videoElement.play();
        if (videoElement.requestFullscreen) {
          videoElement.requestFullscreen();
        } else if ((videoElement as any).webkitRequestFullscreen) {
          (videoElement as any).webkitRequestFullscreen();
        }
      } else {
        videoElement.pause();
      }
    }
}
