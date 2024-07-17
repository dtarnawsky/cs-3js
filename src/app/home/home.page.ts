import { AfterViewInit, Component, effect, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { init3D } from '../map/map';
import { MapModel, MapPin, MapResult } from '../map/map-model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef;
  click = signal('');
  mapResult: MapResult | undefined;
  constructor() {
    effect(() => {
      const clicked = this.click();
      console.log('clicked', clicked);
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
  }

  async ionViewDidEnter() {
    const pins: MapPin[] = [];
    const map: MapModel = {
      image: 'assets/map2.webp',
      width: 7942,
      height: 3966,
      defaultPinSize: 80,
      pins: [],
      compass: { uuid: 'compass', x: 1000, z: 1000, color: 'tertiary', size: 80, label: '' },
      click: this.click
    }

    for (let i = 0; i < 200; i++) {
      pins.push({
        uuid: `pin-${i % 99}`,
        x: Math.random() * map.width - (map.width / 2),
        z: Math.random() * map.height - (map.height / 2),
        color: Math.random() > 0.5 ? 'primary' : 'secondary',
        animated: Math.random() > 0.5,
        size: map.defaultPinSize,
        label: `${i % 99}`
      });
    }

    map.pins = pins;
    this.mapResult = await init3D(this.container.nativeElement, map);

    setInterval(() => {
      const rotation = Math.random() * Math.PI * 2;
      if (this.mapResult) {
        this.mapResult.rotateCompass(rotation);
      }
    }, 100);
  }
}
