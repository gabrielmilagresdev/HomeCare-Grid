let sequence = 0;
export function createDemoKey(): string { sequence += 1; return `demo-send-${Date.now()}-${sequence}`; }
