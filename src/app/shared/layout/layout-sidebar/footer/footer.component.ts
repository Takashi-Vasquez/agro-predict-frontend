import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    DatePipe,
  ]
})
export class FooterComponent implements OnInit {

  readonly today = new Date();

  constructor() { }

  ngOnInit() {
  }

}
