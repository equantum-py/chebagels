/** Presentation-only estimates. Never use to credit a real account. */
export const demoPoints=(amount:number):number=>Math.max(0,Math.floor(amount/1000));
export const demoPointsLabel=(amount:number):string=>`★ Ganarías ${demoPoints(amount)} pts · Demo CHE Club`;
