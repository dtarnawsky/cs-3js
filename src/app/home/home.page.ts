import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { init3D } from '../map/map';
import { MapModel } from '../map/map-model';

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
    const map: MapModel = {
      image: 'assets/map2.webp',
      width: 7942,
      height: 3966,
      defaultPinSize: 80
    }
    init3D(this.container.nativeElement, map);
  }
}
