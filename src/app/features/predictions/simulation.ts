import { AgronomicInputs } from '../../core/models/agro.models';

interface CropProfile {
  baseline: number;
  temperature: number;
  humidity: number;
  ph: number;
  nitrogen: number;
  rainfall: number;
  soils: string[];
}

export interface YieldSimulation {
  yield: number;
  confidence: number;
  expectedYield: number;
  gap: number;
  meetsExpectation: boolean;
  recommendations: string[];
  inputs: AgronomicInputs;
}

const PROFILES: Record<string, CropProfile> = {
  Arándano: {
    baseline: 12.4,
    temperature: 20,
    humidity: 67,
    ph: 5.2,
    nitrogen: 160,
    rainfall: 10,
    soils: ['Arenoso', 'Franco arenoso'],
  },
  Espárrago: {
    baseline: 11.4,
    temperature: 22,
    humidity: 58,
    ph: 6.8,
    nitrogen: 170,
    rainfall: 7,
    soils: ['Arenoso', 'Franco arenoso'],
  },
  Palta: {
    baseline: 15.5,
    temperature: 21,
    humidity: 65,
    ph: 6.4,
    nitrogen: 175,
    rainfall: 9,
    soils: ['Franco', 'Franco arenoso'],
  },
  'Caña de azúcar': {
    baseline: 116,
    temperature: 25,
    humidity: 70,
    ph: 6.6,
    nitrogen: 210,
    rainfall: 18,
    soils: ['Franco', 'Arcilloso'],
  },
  Arroz: {
    baseline: 10,
    temperature: 25,
    humidity: 82,
    ph: 6.4,
    nitrogen: 185,
    rainfall: 24,
    soils: ['Arcilloso', 'Franco'],
  },
  Uva: {
    baseline: 22,
    temperature: 23,
    humidity: 60,
    ph: 6.7,
    nitrogen: 145,
    rainfall: 7,
    soils: ['Franco arenoso', 'Franco'],
  },
};

const FALLBACK = PROFILES['Arándano'];

function score(value: number, ideal: number, tolerance: number): number {
  return Math.max(0, 1 - Math.abs(value - ideal) / tolerance);
}

/**
 * Fórmula determinista para demostrar el contrato del futuro modelo.
 * No sustituye un modelo entrenado ni una recomendación agronómica.
 */
export function simulateYield(
  crop: string,
  inputs: AgronomicInputs,
  expectedYield: number,
): YieldSimulation {
  const profile = PROFILES[crop] ?? FALLBACK;
  const soilScore = profile.soils.includes(inputs.soilType) ? 1 : 0.7;
  const quality =
    score(inputs.temperature, profile.temperature, 12) * 0.18 +
    score(inputs.soilHumidity, profile.humidity, 35) * 0.24 +
    score(inputs.soilPh, profile.ph, 2.2) * 0.2 +
    score(inputs.nitrogen, profile.nitrogen, 110) * 0.2 +
    score(inputs.rainfall, profile.rainfall, 35) * 0.08 +
    soilScore * 0.1;
  const predictedYield = Number((profile.baseline * (0.58 + quality * 0.45)).toFixed(1));
  const gap = Number((predictedYield - expectedYield).toFixed(1));
  const recommendations: string[] = [];

  if (inputs.soilHumidity < profile.humidity - 3)
    recommendations.push(
      `Aumentar gradualmente la humedad del suelo hacia ${profile.humidity}% y revisar la uniformidad del riego.`,
    );
  else if (inputs.soilHumidity > profile.humidity + 5)
    recommendations.push(
      `Reducir el exceso de humedad y verificar drenaje; el rango de referencia demo está cerca de ${profile.humidity}%.`,
    );

  if (inputs.nitrogen < profile.nitrogen - 15)
    recommendations.push(
      `Evaluar elevar el nitrógeno hacia ${profile.nitrogen} kg/ha, únicamente después de un análisis de suelo o foliar.`,
    );
  else if (inputs.nitrogen > profile.nitrogen + 20)
    recommendations.push(
      `Revisar la dosis de nitrógeno; el escenario supera la referencia demo de ${profile.nitrogen} kg/ha.`,
    );

  if (Math.abs(inputs.soilPh - profile.ph) > 0.4)
    recommendations.push(
      `Corregir el pH de forma progresiva hacia ${profile.ph}, con validación de laboratorio y asesoría agronómica.`,
    );
  if (Math.abs(inputs.temperature - profile.temperature) > 4)
    recommendations.push(
      `Revisar manejo y fecha de campaña: la temperatura de referencia demo es ${profile.temperature} °C.`,
    );
  if (!profile.soils.includes(inputs.soilType))
    recommendations.push(
      `Validar drenaje y manejo para suelo ${inputs.soilType.toLowerCase()}; el histórico favorable usa ${profile.soils.join(' o ').toLowerCase()}.`,
    );
  if (!recommendations.length)
    recommendations.push(
      'Mantener las condiciones actuales y continuar el monitoreo durante la campaña.',
    );
  if (gap >= 0)
    recommendations.push(
      'La proyección alcanza la meta; prioriza conservar la estabilidad del manejo.',
    );

  return {
    yield: predictedYield,
    confidence: Number((88 + quality * 6).toFixed(1)),
    expectedYield,
    gap,
    meetsExpectation: gap >= 0,
    recommendations: recommendations.slice(0, 3),
    inputs,
  };
}
