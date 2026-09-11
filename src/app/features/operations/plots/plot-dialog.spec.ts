import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { MOCK_WORKSPACE } from '../../../core/data/mock-data';
import { AgroRepository } from '../../../core/services/agro.repository';
import { WorkspaceStore } from '../../../core/services/workspace.store';
import { PlotDialog } from './plot-dialog';

describe('Formulario de parcelas', () => {
  const close = vi.fn();
  beforeEach(() => {
    close.mockClear();
    TestBed.configureTestingModule({
      providers: [
        WorkspaceStore,
        {
          provide: AgroRepository,
          useValue: { loadWorkspace: () => of(structuredClone(MOCK_WORKSPACE)) },
        },
        { provide: MAT_DIALOG_DATA, useFactory: () => TestBed.inject(WorkspaceStore) },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
  });
  it('valida nombres recortados y superficies positivas', () => {
    const fixture = TestBed.createComponent(PlotDialog);
    fixture.componentInstance.form.patchValue({ name: ' A ', location: 'Ica', area: -1 });
    fixture.componentInstance.save();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });
  it('registra los valores validados y cierra el diálogo', () => {
    const fixture = TestBed.createComponent(PlotDialog);
    fixture.componentInstance.form.patchValue({
      name: ' La Arboleda ',
      location: ' Ica ',
      area: 5,
    });
    fixture.componentInstance.save();
    expect(TestBed.inject(WorkspaceStore).plots().at(-1)?.name).toBe('La Arboleda');
    expect(close).toHaveBeenCalledWith(true);
  });
});
