import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackArrowIcon } from '../../utils/SvgFile';
import './PageHeader.css';

interface PageHeaderProps {
	title: string;
	showBackButton?: boolean;
	onBackClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBackButton = true, onBackClick }) => {
	const navigate = useNavigate();

	const handleBack = () => {
		if (onBackClick) {
			onBackClick();
		} else {
			navigate(-1);
		}
	};

	return (
		<div className="page-header">
			{showBackButton && (
				<button type="button" className="back-button" onClick={handleBack}>
					<BackArrowIcon />
				</button>
			)}
			<h1 className="page-title">{title}</h1>
		</div>
	);
};

export default PageHeader;
