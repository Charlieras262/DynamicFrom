import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  label: string;
  placeholder: string;
  control: FormControl;

  constructor() { }

  ngOnInit() {
  }
}
