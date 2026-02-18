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
  @Input() selectedValue: any = '';
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

    if (this.selectedValue) {
    this.myForm.get('seleccion')?.setValue(this.selectedValue, { emitEvent: false });
  }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['originalValues']) {
      this.values = this.originalValues;
      this.filterOptions();
    }

    if (changes['selectedValue'] && changes['selectedValue'].currentValue !== undefined) {
      this.myForm.get('seleccion')?.setValue(this.selectedValue, { emitEvent: false });
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

    if (!selectedValue) {
      return;
    }

    const seleccion = this.originalValues.find(
      o => o[this.key] == selectedValue
    );

    // 🔥 El hijo NO decide nada.
    // Solo informa al padre.
    this.valueChange.emit(seleccion);
  }

  public setValue(value: any) {
    this.selectedValue = value;
    this.myForm.get('seleccion')?.setValue(value, { emitEvent: false });
  }
}
