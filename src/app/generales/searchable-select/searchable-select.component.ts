import { NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule],
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.css'],
})
export class SearchableSelectComponent implements OnInit, OnChanges {
  @Input() searchAttribute: string = '';
  @Input() key: string = '';
  @Input() selectedValue: string = '';
  @Input() placeHolder: string = '';
  @Input() originalValues: any[] = [];
  @Output() valueChange = new EventEmitter<any>();
  myForm: FormGroup;

  searchTerm: string = '';
  values: any[] = [];

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      nombre: '',
      seleccion: '',
    });
  }

  ngOnInit(): void {
    this.values = this.originalValues;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['originalValues']) {
      this.values = this.originalValues;
      this.filterOptions();
    }
  }

  filterOptions(): void {
    const term = this.myForm.value.nombre.toLowerCase();
    this.values = this.originalValues.filter((value) =>
      value[this.searchAttribute].toLowerCase().includes(term)
    );
  }

  onSelect(): void {
    const selectedValue = this.myForm.get('seleccion')?.value;
    this.selectedValue = selectedValue;
    if (selectedValue) {
      const seleccion = this.originalValues.find(o => o[this.key] == selectedValue);
      this.valueChange.emit(seleccion);
    }
  }
}
