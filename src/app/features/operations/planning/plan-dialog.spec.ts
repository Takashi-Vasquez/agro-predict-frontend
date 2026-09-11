import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator } from './plan-dialog';
describe('Validación de fechas del plan', () => {
  const form = (startDate: string, endDate: string) =>
    new FormGroup({ startDate: new FormControl(startDate), endDate: new FormControl(endDate) });
  it('acepta cosecha posterior a siembra', () => {
    expect(dateRangeValidator(form('2026-09-01', '2026-12-01'))).toBeNull();
  });
  it('rechaza fechas invertidas o iguales', () => {
    expect(dateRangeValidator(form('2026-12-01', '2026-09-01'))).toEqual({ dateRange: true });
    expect(dateRangeValidator(form('2026-09-01', '2026-09-01'))).toEqual({ dateRange: true });
  });
});
