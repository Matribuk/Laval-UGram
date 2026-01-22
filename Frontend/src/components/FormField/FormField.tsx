import React from 'react';
import { Field } from 'formik';
import './FormField.css';

interface FormFieldProps {
	name: string;
	label: string;
	type?: string;
	placeholder?: string;
	error?: string;
	touched?: boolean;
	required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
	name,
	label,
	type = 'text',
	placeholder,
	error,
	touched,
	required = false,
}) => {
	return (
		<div className="form-group">
			<label htmlFor={name}>
				{label}
				{required && ' *'}
			</label>
			<Field
				type={type}
				id={name}
				name={name}
				placeholder={placeholder}
				className={error && touched ? 'input-error' : ''}
			/>
			{error && touched && <span className="error-message">{error}</span>}
		</div>
	);
};

export default FormField;
