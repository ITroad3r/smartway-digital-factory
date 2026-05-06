ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text;

UPDATE public.site_settings SET
  linkedin_url = COALESCE(linkedin_url, 'https://www.linkedin.com/company/itsmartway'),
  facebook_url = COALESCE(facebook_url, 'https://www.facebook.com/share/1En55DVnso/?mibextid=wwXIfr'),
  twitter_url  = COALESCE(twitter_url,  'https://x.com/_SmartWay'),
  instagram_url= COALESCE(instagram_url,'https://www.instagram.com/itsmartway/'),
  tiktok_url   = COALESCE(tiktok_url,   'https://www.tiktok.com/@smartwayinside'),
  youtube_url  = COALESCE(youtube_url,  'https://www.youtube.com/channel/UCNSUrBPHWnqLCKEdsUQhz0Q');