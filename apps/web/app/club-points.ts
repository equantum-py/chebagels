/** Preview-only estimate. Real CHE Club rules must come from the backend. */
export const DEMO_GUARANIES_PER_POINT = 1000;
export const estimatedClubPoints = (guaranies:number):number =>
 Number.isFinite(guaranies)&&guaranies>0 ? Math.floor(guaranies/DEMO_GUARANIES_PER_POINT) : 0;
export const pointsLabel = (guaranies:number):string =>
 "★ Podrías ganar "+estimatedClubPoints(guaranies).toLocaleString("es-PY")+" pts CHE Club";
