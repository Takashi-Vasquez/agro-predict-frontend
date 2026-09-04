import { TestBed } from '@angular/core/testing';
import { LineChart } from './chart';

describe('LineChart', () => {
  it('ajusta la escala cuando los datos superan el máximo configurado', () => {
    const fixture = TestBed.createComponent(LineChart);
    fixture.componentRef.setInput('values', [80, 100, 120]);
    fixture.componentRef.setInput('comparison', [100, 100, 100]);
    fixture.detectChanges();

    const chart = fixture.componentInstance;
    const yCoordinates = chart
      .points()
      .split(' ')
      .map((point) => Number(point.split(',')[1]));

    expect(chart.scaleMax()).toBeGreaterThanOrEqual(120);
    expect(yCoordinates.every((value) => value >= 13 && value <= 177)).toBe(true);
  });

  it('recorta las series dentro del área visible del SVG', () => {
    const fixture = TestBed.createComponent(LineChart);
    fixture.componentRef.setInput('values', [100, 110]);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const group = element.querySelector('g[clip-path]');
    const clipPath = element.querySelector('clipPath');

    expect(group?.getAttribute('clip-path')).toContain(fixture.componentInstance.clipId);
    expect(clipPath?.id).toBe(fixture.componentInstance.clipId);
  });
});
