import React from 'react';

// Match the object, rather than reusing a category emoji for unrelated reports.
const drawings = {
  backpack: <><path d="M16 15v-3a8 8 0 0 1 16 0v3M12 19a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v21H12Z"/><rect x="17" y="26" width="14" height="10" rx="2"/><path d="M19 19h10M36 25h4v12h-4M12 25H8v12h4"/></>,
  satchel: <><path d="M18 12V9a6 6 0 0 1 12 0v3M11 20a9 9 0 0 1 9-9h8a9 9 0 0 1 9 9v22H11ZM11 22h26M8 27h3M37 27h3"/><rect x="17" y="27" width="14" height="10" rx="4"/><path d="M27 22v4"/></>,
  id: <><rect x="6" y="11" width="36" height="27" rx="4"/><circle cx="17" cy="21" r="4"/><path d="M11 32c0-7 12-7 12 0M28 20h8M28 26h8M28 32h5"/></>,
  headphones: <><path d="M10 9c-4 0-6 3-6 7s3 7 7 7h2v14a3 3 0 0 0 6 0V16a7 7 0 0 0-7-7ZM38 9c4 0 6 3 6 7s-3 7-7 7h-2v14a3 3 0 0 1-6 0V16a7 7 0 0 1 7-7ZM9 14v4M39 14v4"/></>,
  earbuds: <><rect x="7" y="23" width="34" height="18" rx="7"/><path d="M7 29h34M17 12v7M31 12v7"/><circle cx="17" cy="9" r="4"/><circle cx="31" cy="9" r="4"/><path d="M21 35h6"/></>,
  sportsBottle: <><path d="M19 6h10v7l5 6v22H14V19l5-6ZM19 11h10M14 25h20M14 34h20M24 6V3h7"/></>,
  flask: <><path d="M20 6h8v9c5 2 7 5 7 10v16H13V25c0-5 2-8 7-10ZM19 6V3h10v3M18 25h12M18 30h12"/></>,
  coat: <><path d="m16 8 8 5 8-5 10 10-6 7-4-4v20H16V21l-4 4-6-7ZM24 13v28M16 8l2 12 6-7 6 7 2-12M28 28h4"/></>,
  notebook: <><rect x="11" y="6" width="28" height="36" rx="3"/><path d="M17 6v36M7 13h8M7 22h8M7 31h8M23 16h10M23 22h10M23 28h7"/></>,
  scientific: <><rect x="11" y="4" width="26" height="40" rx="4"/><path d="M16 10h16v9H16ZM17 25h1M24 25h1M31 25h1M17 31h1M24 31h1M31 31h1M17 37h1M24 37h1M31 37h1"/></>,
  calculator: <><rect x="8" y="8" width="32" height="33" rx="4"/><path d="M14 14h20v7H14ZM15 28h3M15 34h3M24 28h3M24 34h3M33 28v6"/></>,
  tote: <><path d="M16 18v-6a8 8 0 0 1 16 0v6M9 16h30l-3 25H12ZM17 28h14M20 33h8"/></>,
  usb: <><path d="M18 17V5h12v12M22 9v3M26 9v3"/><rect x="14" y="17" width="20" height="26" rx="4"/><circle cx="24" cy="35" r="2"/></>,
  clothing: <path d="m16 7 8 5 8-5 11 10-7 8-5-4v21H17V21l-5 4-7-8Z"/>,
  accessories: <><rect x="8" y="16" width="32" height="25" rx="4"/><path d="M17 16v-5a7 7 0 0 1 14 0v5M8 25h32"/></>,
  electronics: <><rect x="12" y="12" width="24" height="24" rx="3"/><path d="M18 18h12v12H18ZM18 6v6M24 6v6M30 6v6M18 36v6M24 36v6M30 36v6M6 18h6M6 24h6M6 30h6M36 18h6M36 24h6M36 30h6"/></>,
  other: <><path d="m6 15 18-9 18 9v23l-18 8-18-8ZM6 15l18 9 18-9M24 24v22M15 11l18 9"/></>,
};

function iconFor(item) {
  const title = item.title.toLowerCase();
  if (/dark backpack/.test(title)) return 'satchel';
  if (/backpack/.test(title)) return 'backpack';
  if (/\bid\b|student card/.test(title)) return 'id';
  if (/earbuds.*case/.test(title)) return 'earbuds';
  if (/earbuds|headphones/.test(title)) return 'headphones';
  if (/sports bottle/.test(title)) return 'sportsBottle';
  if (/bottle|flask/.test(title)) return 'flask';
  if (/coat/.test(title)) return 'coat';
  if (/notebook/.test(title)) return 'notebook';
  if (/scientific calculator/.test(title)) return 'scientific';
  if (/calculator/.test(title)) return 'calculator';
  if (/tote/.test(title)) return 'tote';
  if (/usb|flash drive/.test(title)) return 'usb';
  return ({ electronics: 'electronics', documents: 'notebook', clothing: 'clothing', accessories: 'accessories' })[item.category] || 'other';
}

export default function ItemIcon({ item }) {
  const name = iconFor(item);
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-icon={name}>{drawings[name]}</svg>;
}
