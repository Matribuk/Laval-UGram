import React, { useState } from 'react';
import { Field } from 'formik';
import { EyeIcon, EyeOffIcon } from '../../utils/SvgFile';
import './PasswordInput.css';

interface PasswordInputProps {
	name: string;
	label: string;
	placeholder?: string;
	error?: string;
	touched?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
	name,
	label,
	placeholder = 'Enter your password',
	error,
	touched,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="form-group">
			<label htmlFor={name}>{label}</label>
			<div className="password-input-container">
				<Field
					type={showPassword ? 'text' : 'password'}
					id={name}
					name={name}
					placeholder={placeholder}
					className={error && touched ? 'input-error' : ''}
				/>
				<button
					type="button"
					className="password-toggle"
					onClick={() => setShowPassword(!showPassword)}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{showPassword ? <EyeOffIcon /> : <EyeIcon />}
				</button>
			</div>
			{error && touched && <span className="error-message">{error}</span>}
		</div>
	);
};

export default PasswordInput;
