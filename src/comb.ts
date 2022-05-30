export const factorial = (n: number): number => n === 0 ? 1 : n * factorial(n - 1);

export const choose = (total: number, groupSize: number): number => {
  if (groupSize > total) {
    return NaN;
  }

  if (total === groupSize || total === 0 || groupSize === 0) {
    return 1;
  }

  if (groupSize === 1) {
    return total;
  }

  if (groupSize > total/2) {
    return choose(total, total - groupSize);
  }

  return choose(total - 1, groupSize - 1) + choose(total - 1, groupSize);
};

export const getCombination = <T>(
  iter: IterableIterator<T>,
  val: T,
  ordinal: number,
  total: number,
  size: number
): T[] => {
  if (size === 0) {
    return [];
  }
  
  for (let i = total; i >= 1; i--) {
    const count = choose(i + size - 2, size - 1);
    if (ordinal < count) {
      return [val, ...getCombination(iter, val, ordinal, i, size - 1)];
    }
    ordinal -= count;
    val = iter.next().value;
  }

  return [];
}

export function* permutations<T>(elms: T[]): Generator<T[]> {
  if (elms.length === 0) {
    yield [];
  }

  for(let i = 0; i < elms.length; i++) {
    for (const rest of permutations([...elms.slice(0, i), ...elms.slice(i+1)])) {
      yield [elms[i], ...rest];
    }
  }
}

export const shuffle = <T>(values: T[]): T[] => {
  const result = [...values];

  for (let i = 0; i < result.length; i++) {
    const index = i + Math.floor(Math.random() * (result.length - i));
    const temp = result[i];
    result[i] = result[index];
    result[index] = temp;
  }

  return result;
};
