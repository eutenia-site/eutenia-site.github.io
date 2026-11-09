/**
 * Material Symbols ligatures the code renders. The font request asks Google Fonts for only
 * these plus the `icone` values in the data files (press, fanKit), so the icon font is a
 * few KB instead of ~1 MB (QUAL-04). A dist test fails when a page uses an icon missing here.
 */
export const CODE_ICONS = [
  'account_box',
  'album',
  'arrow_forward',
  'arrow_outward',
  'campaign',
  'check_circle',
  'close',
  'confirmation_number',
  'description',
  'download',
  'event_available',
  'event_busy',
  'expand_more',
  'folder_open',
  'folder_zip',
  'format_quote',
  'groups',
  'home',
  'image',
  'info',
  'layers',
  'local_mall',
  'location_on',
  'mail',
  'menu',
  'military_tech',
  'newspaper',
  'notifications',
  'open_in_new',
  'photo_camera',
  'photo_size_select_actual',
  'play_arrow',
  'play_circle',
  'queue_music',
  'send',
  'share',
  'shield',
  'shopping_bag',
  'stadium',
  'stars',
  'support_agent',
  'verified',
  'wallpaper',
];

/** Google Fonts CSS URL for Material Symbols Outlined limited to `names` (sorted, unique). */
export function iconFontUrl(names: readonly string[]): string {
  const list = [...new Set(names)].sort().join(',');
  return `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..24,400,0..1,0&icon_names=${list}&display=block`;
}
