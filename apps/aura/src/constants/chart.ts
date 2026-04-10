export type AuraColorRating = {
  [key: string]: string;
}


export const valueColorMap: AuraColorRating = {
  '-4': '#924848', 
  '-3': '#DA6A6A',
  '-2': '#EE9D9D',
  '-1': '#F5BFBF',
  '1': '#D5ECDA',
  '2': '#B4E6C0',
  '3': '#72BF83',
  '4': '#5B9969',
};

export const valueLineColorMap: AuraColorRating = {
  '-4': '#723838', 
  '-3': '#B85757',
  '-2': '#CC8585',
  '-1': '#D3A3A3',
  '1': '#B4CCBA',
  '2': '#95C6A1',
  '3': '#5EA36D',
  '4': '#487D54',
};

export const userRatingColorMap: AuraColorRating = {
  '-4': '#D9C7F9',
  '-3': '#C2A8F3',
  '-2': '#AC89ED',
  '-1': '#956AE6',
  '1': '#8341DE',
  '2': '#6C34B3',
  '3': '#572988',
  '4': '#451F6D',
};

export const ratingToText: Record<string, string> = {
  '-4': 'Very High (Negative)',
  '-3': 'High (Negative)',
  '-2': 'Medium (Negative)',
  '-1': 'Low (Negative)',
  '1': 'Low',
  '2': 'Medium',
  '3': 'High',
  '4': 'Very High',
};

export const subjectRatingColorMap: AuraColorRating = {
  '-4': '#FAD7A0',
  '-3': '#F8C471',
  '-2': '#F5B041',
  '-1': '#F39C12',
  '1': '#E67E22',
  '2': '#CA6A1A',
  '3': '#AF5714',
  '4': '#91450F',
};

export const findNearestColor = (value: any, colorMap: any) => {
  const nearestValue = Object.keys(colorMap).reduce((prev, curr) =>
    Math.abs(Number(curr) - value) < Math.abs(Number(prev) - value)
      ? curr
      : prev,
  );
  return colorMap[nearestValue];
};
