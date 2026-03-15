import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	onCancel,
	isDangerous = false,
}) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="confirm-modal-overlay">
			<div className="confirm-modal">
				<h3>{title}</h3>
				<p>{message}</p>
				<div className="confirm-modal-actions">
					<button type="button" className="btn btn-secondary" onClick={onCancel}>
						{cancelLabel}
					</button>
					<button type="button" className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
