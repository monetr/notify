export function dampenValue(v: number) {
  return 8 * (Math.log(v + 1) - 2);
}
