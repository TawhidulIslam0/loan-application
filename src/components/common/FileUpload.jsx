import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import { compressImage } from '../../utils/imageCompression';
import { ErrorMessage } from './ErrorMessage';

export default function FileUpload({
  label,
  accept,
  maxSizeMB = 5,
  onFileUploaded,
  error,
  initialFile,
}) {
  const [file, setFile] = useState(initialFile || null);
  const [preview, setPreview] = useState(null);
  const [originalSize, setOriginalSize] = useState(initialFile?.size || null);
  const [compressedSize, setCompressedSize] = useState(initialFile?.size || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Restore uploaded file when navigating back to Step 7.
  useEffect(() => {
    setFile(initialFile || null);
    setOriginalSize(initialFile?.size || null);
    setCompressedSize(initialFile?.size || null);

    if (initialFile?.type?.startsWith('image/')) {
      const url = URL.createObjectURL(initialFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    setPreview(null);
  }, [initialFile]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setFileError(null);

      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      setOriginalSize(selectedFile.size);

      try {
        setIsCompressing(true);

        let processedFile = selectedFile;

        // Compress images only. PDFs remain unchanged.
        if (
          selectedFile.type === 'image/jpeg' ||
          selectedFile.type === 'image/png'
        ) {
          processedFile = await compressImage(selectedFile);
        }

        // Validate the final file size.
        if (processedFile.size > maxSizeMB * 1024 * 1024) {
          setFileError(`File size exceeds ${maxSizeMB}MB limit.`);
          return;
        }

        setFile(processedFile);
        setCompressedSize(processedFile.size);

        if (processedFile.type.startsWith('image/')) {
          const url = URL.createObjectURL(processedFile);
          setPreview(url);
        } else {
          setPreview(null);
        }

        onFileUploaded?.(processedFile);
      } catch (err) {
        console.error('File processing error:', err);
        setFileError('Failed to process the file. Please try again.');
      } finally {
        setIsCompressing(false);
      }
    },
    [maxSizeMB, onFileUploaded]
  );

  const onDropRejected = useCallback(
    (rejections) => {
      const message =
        rejections[0]?.errors?.[0]?.message ||
        `File must be within the allowed ${maxSizeMB}MB limit.`;

      setFileError(message);
    },
    [maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: parseAccept(accept),
    maxFiles: 1,
  });

  function parseAccept(value) {
    if (!value) {
      return {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
      };
    }

    return value.split(',').reduce((result, type) => {
      const mime = type.trim();

      if (mime === 'image/jpeg') result[mime] = ['.jpg', '.jpeg'];
      else if (mime === 'image/png') result[mime] = ['.png'];
      else if (mime === 'application/pdf') result[mime] = ['.pdf'];

      return result;
    }, {});
  }

  const formatSize = (bytes) =>
    bytes ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : '0 MB';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed p-5 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input {...getInputProps()} />

        {isCompressing ? (
          <p className="text-sm text-blue-600 animate-pulse">
            Compressing image...
          </p>
        ) : file ? (
          <div className="space-y-2">
            {preview ? (
              <img
                src={preview}
                alt="Document preview"
                className="mx-auto h-20 w-20 rounded object-cover shadow"
              />
            ) : (
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded bg-slate-200 font-bold text-slate-500">
                PDF
              </div>
            )}

            <p className="text-sm font-medium text-slate-900">
              {file.name}
            </p>

            <div className="text-xs text-slate-500">
              {originalSize !== compressedSize ? (
                <span>
                  Original: {formatSize(originalSize)} · Compressed:{' '}
                  <strong className="text-green-600">
                    {formatSize(compressedSize)}
                  </strong>
                </span>
              ) : (
                <span>Size: {formatSize(file.size)}</span>
              )}
            </div>

            <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
              Uploaded
            </span>

            <p className="text-xs text-slate-400">
              Click or drag to replace this file
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600">
              Drag & drop your file here, or{' '}
              <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PDF, JPG, PNG · Maximum {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {(fileError || error) && (
        <ErrorMessage message={fileError || error} />
      )}
    </div>
  );
}

FileUpload.propTypes = {
  label: PropTypes.string.isRequired,
  accept: PropTypes.string,
  maxSizeMB: PropTypes.number,
  onFileUploaded: PropTypes.func,
  error: PropTypes.string,
  initialFile: PropTypes.object,
};

