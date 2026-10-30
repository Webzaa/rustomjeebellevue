import { forwardRef, useImperativeHandle, useRef } from 'react';
import PopupForm from './PopupForm.jsx';

const BookingDialog = forwardRef(function BookingDialog(_, ref) {
  const dlgRef = useRef(null);
  const lastBtn = useRef(null);

  const open = (from) => {
    const dlg = dlgRef.current;
    if (dlg.open) return;
    lastBtn.current = from || document.activeElement;
    dlg.showModal();
    document.documentElement.style.overflow = 'hidden';
    const first = dlg.querySelector('input');
    first && first.focus();
  };

  const close = () => dlgRef.current.close();

  const onClose = () => {
    document.documentElement.style.overflow = '';
    lastBtn.current && lastBtn.current.focus && lastBtn.current.focus();
  };

  useImperativeHandle(ref, () => ({ open }));

  return (
    <dialog id="dlg" ref={dlgRef} aria-labelledby="dt" data-lenis-prevent onClick={(e) => e.target === dlgRef.current && close()} onClose={onClose}>
      <div className="dl">
        <button className="dx" type="button" id="dx" aria-label="Close form" onClick={close}>×</button>
        <h2 id="dt">BOOK A SITE VISIT</h2>
        <p>Villa Altura at Rustomjee Belle Vue, Kasara. Private villa previews by appointment.</p>
        <PopupForm onSuccess={() => setTimeout(close, 2500)} />
      </div>
    </dialog>
  );
});

export default BookingDialog;
