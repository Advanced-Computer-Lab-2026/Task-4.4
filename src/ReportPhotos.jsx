import React, {useState} from 'react';

export function PhotoIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 3-3 5 5" />
  </svg>;
}

export default function ReportPhotos({photos = [], title}) {
  const [selected, setSelected] = useState(0);
  if (!photos.length) return <div className="photo-placeholder"><PhotoIcon /><span>No photos yet</span></div>;
  const index = Math.min(selected, photos.length - 1);
  return <div className="report-photos" role="group" aria-label={`Photos of ${title}`}>
    <img className="report-photo" src={photos[index].dataUrl} alt={`${title} — photo ${index + 1} of ${photos.length}`} />
    {photos.length > 1 && <div className="photo-navigation">
      <button type="button" aria-label={`Previous photo of ${title}`} onClick={()=>setSelected((index - 1 + photos.length) % photos.length)}>←</button>
      <span role="status">Photo {index + 1} of {photos.length}</span>
      <button type="button" aria-label={`Next photo of ${title}`} onClick={()=>setSelected((index + 1) % photos.length)}>→</button>
    </div>}
  </div>;
}
