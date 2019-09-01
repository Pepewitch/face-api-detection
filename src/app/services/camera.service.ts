import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private mediaStream: Observable<MediaStream>;
  constructor() {}
  private initMediaStream() {
    this.mediaStream = new Observable(observer => {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream: MediaStream) => {
          observer.next(stream);
        })
        .catch((error: MediaStreamError) => {
          observer.error(error);
        });
    });
  }
  stop(stream: MediaStream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  get stream() {
    if (!this.mediaStream) {
      this.initMediaStream();
    }
    return this.mediaStream;
  }
}
