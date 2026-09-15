"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";

import { CloseIcon, CrosshairIcon, PinIcon } from "./icons";

export interface Coordinates {
  lat: number;
  lng: number;
}

async function addressFor({ lat, lng }: Coordinates) {
  const response = await fetch(
    `/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
  );
  const data = (await response.json()) as { address?: string | null };
  return response.ok ? data.address ?? null : null;
}

export async function reverseGeocode(coords: Coordinates) {
  try {
    return await addressFor(coords);
  } catch {
    return null;
  }
}

export function MapPicker({
  open,
  initial,
  onPick,
  onClose,
}: {
  open: boolean;
  initial: Coordinates | null;
  onPick: (coords: Coordinates, address: string | null) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const centerRef = useRef<Coordinates>(
    initial ?? { lat: 41.311081, lng: 69.240562 },
  );
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (!open || !containerRef.current) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void import("leaflet").then((module) => {
      if (!active || !containerRef.current) return;
      const L = module.default;
      const start = initial ?? centerRef.current;
      const map = L.map(containerRef.current, { zoomControl: false }).setView(
        [start.lat, start.lng],
        16,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      mapRef.current = map;

      const resolveCenter = async () => {
        const center = map.getCenter();
        const next = { lat: center.lat, lng: center.lng };
        centerRef.current = next;
        setLoading(true);
        const nextAddress = await reverseGeocode(next);
        if (active) {
          setAddress(nextAddress);
          setLoading(false);
        }
      };

      map.on("moveend", () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => void resolveCenter(), 400);
      });
      window.setTimeout(() => {
        map.invalidateSize();
        void resolveCenter();
      }, 80);
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [open, initial]);

  if (!open) return null;

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationError("Qurilma joylashuvni qo'llamaydi");
      return;
    }
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.setView(
          [position.coords.latitude, position.coords.longitude],
          17,
        );
      },
      () => setLocationError("Joylashuvga ruxsat berilmadi"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="fixed inset-0 z-[70] bg-foreground" role="dialog" aria-modal="true" aria-label="Xaritadan manzil tanlash">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full text-sale drop-shadow-lg">
        <PinIcon size={40} />
      </div>
      <button onClick={onClose} aria-label="Xaritani yopish" className="absolute left-4 top-4 z-[600] flex h-11 w-11 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
        <CloseIcon size={19} />
      </button>
      <button onClick={locate} aria-label="Joylashuvimga o'tish" className="absolute bottom-52 right-4 z-[600] flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
        <CrosshairIcon size={21} />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-[600] rounded-t-3xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">Tanlangan joy</div>
        <div className="mt-2 min-h-16 rounded-xl bg-surface p-4 text-sm font-medium leading-relaxed">
          {loading ? "Manzil aniqlanmoqda…" : address || "Manzil topilmadi — koordinata baribir saqlanadi."}
        </div>
        {locationError && <p className="mt-2 text-xs text-sale">{locationError}</p>}
        <button onClick={() => onPick(centerRef.current, address)} className="mt-4 h-12 w-full rounded-full bg-accent text-sm font-semibold text-accent-contrast">
          Shu yerni tanlash
        </button>
      </div>
    </div>
  );
}
