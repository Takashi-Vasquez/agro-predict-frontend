import { toCsv } from './csv';
describe('CSV seguro y compatible con hojas de cálculo', () => {
  it('preserva tildes, comas y comillas con BOM UTF-8', () => {
    expect(toCsv(['Cultivo', 'Parcela'], [['Maíz', 'El "Mirador", Ica']])).toBe(
      '\uFEFF"Cultivo","Parcela"\r\n"Maíz","El ""Mirador"", Ica"',
    );
  });
  it('neutraliza fórmulas en valores de texto', () => {
    const csv = toCsv(['Dato'], [['=1+1'], ['+SUM(A1)'], ['@cmd'], ['-formula'], [' \t=1'], [-12]]);
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"\'+SUM(A1)"');
    expect(csv).toContain('"\'@cmd"');
    expect(csv).toContain('"\'-formula"');
    expect(csv).toContain('"\' \t=1"');
    expect(csv).toContain('"-12"');
  });
});
