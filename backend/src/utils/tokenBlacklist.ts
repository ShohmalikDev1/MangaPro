const blacklist = new Set<string>();

export function addToBlacklist(token: string) {
  blacklist.add(token);
}

export function isBlacklisted(token: string) {
  return blacklist.has(token);
}
