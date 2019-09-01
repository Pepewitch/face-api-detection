import { FaceService } from './../../services/face.service';
import { CameraService } from './../../services/camera.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('videoNative', { static: true }) videoNative: ElementRef<
    HTMLVideoElement
  >;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('bufferCanvas', { static: true }) bufferCanvas: ElementRef<
    HTMLCanvasElement
  >;
  play = false;
  stream: MediaStream;
  streamSubscription: Subscription;
  private videoEl: HTMLVideoElement;
  constructor(
    private cameraService: CameraService,
    private faceService: FaceService
  ) {}

  ngOnInit() {}
  ngOnDestroy() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }
  get video() {
    if (this.videoEl) {
      return this.videoEl;
    }
    const el = document.createElement('video');
    el.setAttribute('playsinline', 'true');
    el.setAttribute('autoplay', 'true');
    this.videoEl = el;
    return this.videoEl;
  }
  toggle() {
    if (!this.stream) {
      const video = this.video;
      let isFirst = true;
      this.streamSubscription = this.cameraService.stream.subscribe(stream => {
        video.srcObject = stream;
        this.videoNative.nativeElement.srcObject = stream;
        this.stream = stream;
        if (isFirst) {
          isFirst = false;
          this.videoToCanvasLoop();
        }
      });
    } else {
      this.videoEl = null;
      this.streamSubscription.unsubscribe();
      this.cameraService.stop(this.stream);
    }
  }
  detect() {
    this.faceService.faceDetect(
      this.bufferCanvas.nativeElement,
      this.canvas.nativeElement
    );
  }
  renderVideoToCanvas() {
    const ctx = this.bufferCanvas.nativeElement.getContext('2d');
    ctx.drawImage(
      this.video,
      0,
      0,
      this.bufferCanvas.nativeElement.width,
      this.bufferCanvas.nativeElement.height
    );
  }
  setupCanvas() {
    if (
      this.videoEl &&
      this.videoEl.videoWidth > 0 &&
      this.canvas.nativeElement.width !== this.videoEl.videoWidth
    ) {
      this.canvas.nativeElement.setAttribute(
        'width',
        `${this.videoEl.videoWidth}`
      );
      this.canvas.nativeElement.setAttribute(
        'height',
        `${this.videoEl.videoHeight}`
      );
      this.bufferCanvas.nativeElement.setAttribute(
        'width',
        `${this.videoEl.videoWidth}`
      );
      this.bufferCanvas.nativeElement.setAttribute(
        'height',
        `${this.videoEl.videoHeight}`
      );
    }
  }
  videoToCanvasLoop() {
    requestAnimationFrame(() => {
      if (this.videoEl) {
        this.setupCanvas();
        this.renderVideoToCanvas();
        this.detect();
      }
      this.videoToCanvasLoop();
    });
  }
}
