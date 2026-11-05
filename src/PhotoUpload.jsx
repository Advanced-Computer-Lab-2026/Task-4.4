import React, {useEffect, useRef, useState} from 'react';
import {PhotoIcon} from './ReportPhotos.jsx';
import {MAX_PHOTOS, preparePhoto, validatePhotoSelection} from './photos.js';

export default function PhotoUpload({photos, onChange, busy, onBusyChange}) {
  const [error, setError] = useState('');
  const operation = useRef(0);
  useEffect(()=>()=>{operation.current += 1;}, []);

  async function addPhotos(event) {
    const files = [...event.target.files];
    event.target.value = '';
    if (!files.length) return;
    const validation = validatePhotoSelection(files, photos.length);
    setError(validation);
    if (validation) return;
    const currentOperation = ++operation.current;
    onBusyChange(true);
    try {
      const prepared = await Promise.all(files.map(preparePhoto));
      if (currentOperation === operation.current) onChange([...photos, ...prepared]);
    } catch (failure) {
      if (currentOperation === operation.current) setError(failure.message);
    } finally {
      if (currentOperation === operation.current) onBusyChange(false);
    }
  }

  return <fieldset className="photo-upload">
    <legend>Photos <span>(optional)</span></legend>
    <p id="photo-help">Add up to {MAX_PHOTOS} photos to help identify your item. JPG, PNG or WebP, up to 10 MB each.</p>
    <div className="photo-upload-box"><PhotoIcon />
      <label htmlFor="report-photos">Add photos</label>
      <input id="report-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple
        disabled={busy || photos.length >= MAX_PHOTOS} aria-describedby="photo-help photo-upload-status"
        onChange={addPhotos} />
    </div>
    <p id="photo-upload-status" role="status">{busy ? 'Preparing photos…' : `${photos.length} of ${MAX_PHOTOS} photos added`}</p>
    {!!photos.length && <ul className="photo-previews">{photos.map((photo,index)=><li key={photo.id}>
      <img src={photo.dataUrl || photo.src} alt={`Selected photo ${index + 1}: ${photo.name}`} />
      <span title={photo.name}>{photo.name}</span>
      <button type="button" disabled={busy} aria-label={`Remove photo ${index + 1}: ${photo.name}`}
        onClick={()=>{onChange(photos.filter(item=>item.id!==photo.id));setError('');}}>Remove</button>
    </li>)}</ul>}
    {error && <div className="form-error" role="alert">{error}</div>}
  </fieldset>;
}
