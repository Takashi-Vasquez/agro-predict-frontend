import { AgronomicInputs } from '../../core/models/agro.models';
import { simulateYield } from './simulation';

describe('Contrato predictivo de demostración', () => {
  const favorable: AgronomicInputs = {
    soilType: 'Arenoso',
    temperature: 20,
    soilHumidity: 67,
    soilPh: 5.2,
    nitrogen: 160,
    rainfall: 10,
  };

  it('es determinista y compara el rendimiento con la meta', () => {
    const first = simulateYield('Arándano', favorable, 13);
    expect(first).toEqual(simulateYield('Arándano', favorable, 13));
    expect(first.yield).toBe(12.8);
    expect(first.gap).toBe(-0.2);
    expect(first.meetsExpectation).toBe(false);
  });

  it('reduce la proyección con condiciones alejadas del histórico favorable', () => {
    const unfavorable: AgronomicInputs = {
      ...favorable,
      soilType: 'Arcilloso',
      temperature: 38,
      soilHumidity: 30,
      soilPh: 7.8,
      nitrogen: 80,
    };
    expect(simulateYield('Arándano', favorable, 12).yield).toBeGreaterThan(
      simulateYield('Arándano', unfavorable, 12).yield,
    );
  });

  it('propone acciones cuando las variables se alejan del perfil demo', () => {
    const result = simulateYield('Palta', { ...favorable, soilHumidity: 45, nitrogen: 90 }, 16);
    expect(result.recommendations.join(' ')).toContain('humedad');
    expect(result.recommendations.join(' ')).toContain('nitrógeno');
  });
});
