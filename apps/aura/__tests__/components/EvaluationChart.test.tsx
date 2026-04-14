import {
  generateMockedProfile,
  generateRandomBrightId,
  generateRoleData,
} from '../utils/api/profile';

describe('Activity Chart Render', () => {
  it('Should render the activity chart', async () => {});

  it('Chart should represent the correct data', async () => {
    const randomBrightIds = Array.from({ length: 5 }).map(() =>
      generateMockedProfile(generateRandomBrightId(), [
        generateRoleData('subject', 5, 3),
        generateRoleData('player', 5, 3),
      ]),
    );
  });

  it('Chart Zoom in / Zoom out buttons should work', async () => {});

  it('Chart Panning left and right', async () => {});

  it('Chart Reset button', async () => {});
});
