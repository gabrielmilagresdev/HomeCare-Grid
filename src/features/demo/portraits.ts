import type { ImageSourcePropType } from 'react-native';

/** Generated portraits for the synthetic professional profiles. */
const portraits: Record<string, ImageSourcePropType> = {
  'demo-professional-a': require('../../../assets/professionals/marina.png'),
  'demo-professional-b': require('../../../assets/professionals/caio.png'),
  'demo-professional-c': require('../../../assets/professionals/lia.png'),
  'demo-professional-d': require('../../../assets/professionals/nina.png')
};

export const portraitFor = (professionalId: string | undefined): ImageSourcePropType | undefined => professionalId ? portraits[professionalId] : undefined;
