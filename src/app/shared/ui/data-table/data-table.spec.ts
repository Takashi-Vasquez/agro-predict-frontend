import { TestBed } from '@angular/core/testing';
import { DataTable } from './data-table.component';
describe('DataTable', () => {
  it('pagina los registros y acota la página al cambiar el filtro', () => {
    const fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Nombre' }]);
    fixture.componentRef.setInput(
      'rows',
      Array.from({ length: 8 }, (_, id) => ({ id: String(id), name: `Parcela ${id}` })),
    );
    fixture.componentRef.setInput('paginate', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.visibleRows()).toHaveLength(6);
    fixture.componentInstance.page.set(1);
    expect(fixture.componentInstance.visibleRows()).toHaveLength(2);
    fixture.componentRef.setInput('rows', [{ id: '1', name: 'Parcela 1' }]);
    fixture.detectChanges();
    expect(fixture.componentInstance.currentPage()).toBe(0);
    expect(fixture.componentInstance.visibleRows()).toHaveLength(1);
  });
  it('muestra estado vacío sin filas', () => {
    const fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', [{ key: 'name', label: 'Nombre' }]);
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sin resultados');
  });
});
