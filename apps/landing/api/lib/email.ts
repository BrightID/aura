// Do not add the `g` flag to emailRegex.
// The module keeps emailRegex across requests. With `g`, a successful test() sets lastIndex past the match, so the next test() fails. That failure resets lastIndex. Valid emails then fail on every other call.
const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export function isLoginEmail(email: unknown): email is string {
  return typeof email === 'string' && emailRegex.test(email);
}
