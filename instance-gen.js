const shuffle = (values) => {
  const result = [...values];

  for (let i = 0; i < result.length; i++) {
    const index = i + Math.floor(Math.random() * (result.length - i));
    const temp = result[i];
    result[i] = result[index];
    result[index] = temp;
  }

  return result;
};

export const generate = (size) => {
  const side1 = [];
  const side2 = [];

  for(let i = 0; i < size; i++) {
    side1.push(String.fromCharCode(65 + i));
    side2.push(String.fromCharCode(90 - size + i + 1));
  }

  const prefs1 = side1.map(() => shuffle(side2).join(''));
  const prefs2 = side2.map(() => shuffle(side1).join(''));

  return {
    side1: side1.join(''), 
    side2: side2.join(''), 
    prefs1,
    prefs2,
  };
}
