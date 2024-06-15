import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { init3D } from '../map/map';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef;
  constructor() { }

  ngAfterViewInit() {
    init3D(this.container.nativeElement);
  }
}
