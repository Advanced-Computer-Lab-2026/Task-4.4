const backpackFront = {id: 'demo-backpack-front', name: 'Example backpack — front', src: '/demo-photos/backpack-front.svg'};
const backpackBack = {id: 'demo-backpack-back', name: 'Example backpack — back', src: '/demo-photos/backpack-back.svg'};

const examplePhotos = {
  f1: [backpackFront, backpackBack],
  f2: [backpackFront],
  f5: [{id: 'demo-earbuds', name: 'Example earbuds and blue case', src: '/demo-photos/earbuds.svg'}],
  f7: [{id: 'demo-bottle', name: 'Example blue bottle', src: '/demo-photos/bottle.svg'}],
};

// Upgrade old demo records without replacing a student's own images or removals.
export function withExamplePhotos(reports) {
  return reports.map(report => report.photos === undefined
    ? {...report, photos: examplePhotos[report.id] || []}
    : report);
}
