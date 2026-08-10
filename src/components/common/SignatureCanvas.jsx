import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function SignatureCanvas({
  initialSignature,
  onSignatureChange,
  error,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!initialSignature);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    if (initialSignature) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = initialSignature;
    }
  };

  useEffect(() => {
    setupCanvas();
  }, [initialSignature]);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPosition(e);

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPosition(e);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;

    setIsDrawing(false);

    const canvas = canvasRef.current;

    if (hasSigned) {
      onSignatureChange(canvas.toDataURL('image/png'));
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSignatureChange('');
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-900">
          E-Signature
        </h3>
        <p className="text-sm text-slate-600">
          Sign inside the box below.
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        className="w-full max-w-2xl rounded-lg border-2 border-slate-300 bg-white touch-none cursor-crosshair"
      />

      <button
        type="button"
        onClick={clear}
        className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
      >
        Clear Signature
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

SignatureCanvas.propTypes = {
  initialSignature: PropTypes.string,
  onSignatureChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

