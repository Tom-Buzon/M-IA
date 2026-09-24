// The three documents occupy distinct parts of the same attic.
// Every entry is [camera x,y,z, look-at x,y,z]. Curved approaches orbit the exhibits from clear aisles.
export const tourRoutes = {
  home: [
    [6.5,4.5,12, .4,2.4,-1], [4.8,3.5,6.4, 1,2.3,-.7],
    [-1.8,3.6,2.8, 1.1,2.3,-.7], [-4.8,4,-9, 1.5,3,-14],
    [-4.8,4,-19, 1.1,3,-28], [4.8,4,-22, 1.1,3,-28],
    [5.3,4.1,-36, 1.1,3.1,-42], [5.3,4.2,-48, 1,2.8,-54],
    [-3.6,4.2,-49, 1,2.8,-54],
  ],
  agency: [
    [-5,3.6,0, -13.8,2,-4.8], [-9.5,3.5,-2, -14.5,2,-4.8],
    [-13.4,3.5,1.8, -15.4,2,-4.8], [-20,3.2,-1, -15.4,2,-4.8],
    [-20,3.8,-7, -15.4,2,-4.3], [-16.2,4,2.8, -15,2,-5],
  ],
  portfolio: [
    [6,3.5,-8, 16,3,-18], [12,3.5,-12, 16,3,-18],
    [20,3.8,-14, 16,3,-18], [21,3.8,-23, 16,2.8,-27],
    [20.5,3.9,-30, 16,2.8,-27], [12,4,-31, 16.5,3,-37],
    [11.7,4,-40, 16.5,3,-37], [14,4.3,-41, 16,2.4,-45],
    [21,4.4,-41.8, 16,2.4,-45],
  ],
};

export function measureTour(elements, viewportHeight) {
  const stops = [];
  for (const { top, height, from, to } of elements) {
    if (to === undefined) stops.push({ y: Math.max(0, top - viewportHeight * .22), p: from });
    else {
      // Travel for the whole visible crossing; arrive as the real case study enters.
      stops.push({ y: Math.max(0, top - viewportHeight * .72), p: from });
      stops.push({ y: Math.max(1, top + height - viewportHeight * .32), p: to });
    }
  }
  stops.sort((a,b)=>a.y-b.y);
  return stops.filter((stop,i)=>!i || stop.y !== stops[i-1].y);
}

export function sampleTour(stops, y) {
  if (!stops.length) return 0;
  if (y <= stops[0].y) return stops[0].p;
  for (let i=1;i<stops.length;i++) {
    if (y <= stops[i].y) {
      const a=stops[i-1],b=stops[i];
      return a.p+(b.p-a.p)*(y-a.y)/(b.y-a.y);
    }
  }
  return stops.at(-1).p;
}
