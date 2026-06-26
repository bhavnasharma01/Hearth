-- Hearth — geocoding columns (v1, "near me" feature)
-- Adds coordinates to events and practitioners so the app can show distance
-- from the visitor and sort/filter by "near me".
--   * events:        geocoded from location_text (a precise address)
--   * practitioners: geocoded from `area` (a neighbourhood/city — coarse on
--                    purpose, never a home address)
-- Coordinates are populated server-side (on submit + by scripts/geocode-events.mjs),
-- using the free OpenStreetMap Nominatim geocoder. The columns are readable under
-- the existing public-read RLS policies (location is public by design here).

alter table events add column if not exists latitude    double precision;
alter table events add column if not exists longitude   double precision;
alter table events add column if not exists geocoded_at timestamptz;

alter table practitioners add column if not exists latitude    double precision;
alter table practitioners add column if not exists longitude   double precision;
alter table practitioners add column if not exists geocoded_at timestamptz;
