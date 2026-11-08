/** Synthetic addresses used only inside this session-scoped demonstration. */
export const demoLocations = [
  { regionCode: 'DEMO-CENTRO', neighborhood: 'Centro', city: 'São Paulo', label: 'Casa · Centro', fullAddress: 'Rua Exemplo, 100 · Centro, São Paulo (endereço fictício)', travelCents: 0 },
  { regionCode: 'DEMO-ZONA-SUL', neighborhood: 'Zona Sul', city: 'São Paulo', label: 'Casa · Zona Sul', fullAddress: 'Rua Exemplo, 200 · Zona Sul, São Paulo (endereço fictício)', travelCents: 0 },
  { regionCode: 'DEMO-ZONA-OESTE', neighborhood: 'Zona Oeste', city: 'São Paulo', label: 'Casa · Zona Oeste', fullAddress: 'Rua Exemplo, 300 · Zona Oeste, São Paulo (endereço fictício)', travelCents: 0 },
  { regionCode: 'DEMO-ZONA-NORTE', neighborhood: 'Zona Norte', city: 'São Paulo', label: 'Casa · Zona Norte', fullAddress: 'Rua Exemplo, 400 · Zona Norte, São Paulo (endereço fictício)', travelCents: 0 }
] as const;

export function demoLocationForRegion(regionCode: string) {
  return demoLocations.find(location => location.regionCode === regionCode) ?? demoLocations[0];
}
