/** Parse only explicitly displayed numbers; never estimate missing metrics. */
export function publicCount(text) {
  if (typeof text !== 'string') throw new Error('Missing public count');
  const match =
    /^(\d+(?:[.,\u00a0\u202f ]\d+)*)\s*(billion|million|milhões|milhão|mil|mi|k|m|b)?(?=\s|$)/i.exec(
      text.trim(),
    );
  if (!match) throw new Error('Invalid public count');
  const suffix = match[2]?.toLowerCase();
  const numeric = match[1].replace(/\s/g, '');
  if (!suffix && !/^(?:\d+|\d{1,3}(?:[.,]\d{3})+)$/.test(numeric))
    throw new Error('Ambiguous public count');
  const divisor = /^(b|billion)$/.test(suffix)
    ? 1e9
    : /^(m|mi|million|milhões|milhão)$/.test(suffix)
      ? 1e6
      : suffix
        ? 1e3
        : 1;
  const value = suffix
    ? Number(numeric.replace(',', '.')) * divisor
    : Number(numeric.replace(/[.,]/g, ''));
  const rounded = Math.round(value);
  if (!Number.isFinite(value) || !Number.isSafeInteger(rounded) || rounded < 0)
    throw new Error('Invalid public count');
  return rounded;
}

function aboutChannel(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.aboutChannelViewModel) return node.aboutChannelViewModel;
  for (const value of Object.values(node)) {
    const found = aboutChannel(value);
    if (found) return found;
  }
}

export function youtubeStatistics(html, channelId = '') {
  const match = /<script\b[^>]*>\s*(?:var\s+)?ytInitialData\s*=\s*([\s\S]*?)\s*;\s*<\/script>/.exec(
    html,
  );
  if (!match) throw new Error('YouTube public data unavailable');
  const about = aboutChannel(JSON.parse(match[1]));
  // Scope the metrics to the band's About section, never recommended channels or videos.
  const expectedId = channelId || 'UCbQwsKt8apfT9Nuq8GE35Nw';
  if (!about || about.channelId !== expectedId) throw new Error('Unexpected YouTube channel');
  return {
    viewCount: String(publicCount(about.viewCountText)),
    subscriberCount: String(publicCount(about.subscriberCountText)),
    hiddenSubscriberCount: false,
  };
}

function decodeEntities(text) {
  return text
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, value) =>
      String.fromCodePoint(
        value[0].toLowerCase() === 'x' ? parseInt(value.slice(1), 16) : Number(value),
      ),
    )
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&nbsp;', ' ');
}

export function instagramFollowers(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const tag = tags.find((tag) => /\bproperty\s*=\s*["']og:description["']/i.test(tag));
  const encoded = tag && /\bcontent\s*=\s*(["'])([\s\S]*?)\1/i.exec(tag)?.[2];
  if (!encoded) throw new Error('Instagram public metadata unavailable');
  const description = decodeEntities(encoded);
  if (!/@euteniaoficial\b/i.test(description)) throw new Error('Unexpected Instagram profile');
  const match = /^(.+?)\s+(?:followers|seguidores)\b/i.exec(description.trim());
  if (!match) throw new Error('Instagram follower count unavailable');
  return publicCount(match[1]);
}

export function spotifyMonthlyListeners(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const content = (property) => {
    const tag = tags.find((tag) => /\bproperty\s*=\s*(["'])(.*?)\1/i.exec(tag)?.[2] === property);
    const value = tag && /\bcontent\s*=\s*(["'])([\s\S]*?)\1/i.exec(tag)?.[2];
    if (!value) throw new Error('Spotify public metadata unavailable');
    return decodeEntities(value);
  };
  const profile = new URL(content('og:url'));
  if (
    profile.hostname !== 'open.spotify.com' ||
    profile.pathname.replace(/\/$/, '') !== '/artist/1b1VNVxpK917LlNACwCIKM'
  )
    throw new Error('Unexpected Spotify artist');
  const match =
    /(\d[\d.,\u00a0\u202f ]*(?:milhões|mil|mi|k|m|b)?)\s+(?:monthly listeners|ouvintes mensais)\b/i.exec(
      content('og:description'),
    );
  if (!match) throw new Error('Spotify monthly listeners unavailable');
  return publicCount(match[1]);
}
