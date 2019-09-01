import { Injectable, OnInit } from '@angular/core';
import * as faceapi from 'face-api.js';
import { MtcnnOptions } from 'face-api.js';
import { Subject, from } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaceService {
  faceDetectSubject = new Subject();
  constructor() {
    faceapi.loadMtcnnModel('/assets/mtcnn').then(() => {
      console.log('Loaded');
    });
    this.faceDetectSubject
      .pipe(
        exhaustMap(({ el, drawEl }) => {
          return from(this.faceDetectAction(el, drawEl));
        })
      )
      .subscribe(e => {
        console.log(e);
      });
  }
  async faceDetectAction(el, drawEl?) {
    const mtcnnForwardParams = new MtcnnOptions({
      minFaceSize: 100
    });
    const mtcnnResults = await faceapi.mtcnn(el, mtcnnForwardParams);
    if (drawEl) {
      const ctx = drawEl.getContext('2d');
      ctx.drawImage(el, 0, 0);
    }
    faceapi.draw.drawDetections(
      drawEl || el,
      mtcnnResults.map(res => res.detection)
    );
    return mtcnnResults;
  }
  async faceDetect(el, drawEl?) {
    this.faceDetectSubject.next({ el, drawEl });
  }
}
