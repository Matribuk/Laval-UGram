import React from 'react';
import './FormActions.css';

interface FormActionsProps {
	submitLabel?: string;
	cancelLabel?: string;
	onCancel: () => void;
	isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
	submitLabel = 'Save',
	cancelLabel = 'Cancel',
	onCancel,
	isSubmitting = false,
}) => {
	return (
		<div className="form-actions">
			<button type="button" className="btn btn-secondary" onClick={onCancel}>
				{cancelLabel}
			</button>
			<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
				{submitLabel}
			</button>
		</div>
	);
};

export default FormActions;
