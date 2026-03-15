import React, { useRef } from 'react';
import { CameraIcon } from '../../utils/SvgFile';
import './ImageUpload.css';

interface ImageUploadProps {
	preview: string | null;
	onFileSelect: (file: File | null) => void;
	error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ preview, onFileSelect, error }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		onFileSelect(file);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0] || null;
		if (file && file.type.startsWith('image/')) {
			onFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	return (
		<div className="image-upload-container">
			<div
				className={`image-upload-zone ${preview ? 'has-preview' : ''} ${error ? 'has-error' : ''}`}
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				{preview ? (
					<img src={preview} alt="Preview" className="image-preview" />
				) : (
					<div className="upload-placeholder">
						<CameraIcon width={48} height={48} />
						<p>Click or drag an image here</p>
					</div>
				)}
				<input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="file-input-hidden" />
			</div>
			{error && <span className="image-upload-error">{error}</span>}
		</div>
	);
};

export default ImageUpload;
