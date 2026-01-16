import React from 'react';

/**
 * The Manager Professional Business Logo Component
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {string|number} props.width - Logo width (default: 32)
 * @param {string|number} props.height - Logo height (default: 32)
 * @param {Object} props.style - Inline styles
 * @returns {JSX.Element} Professional business logo SVG
 */
const TheManagerLogo = ({ 
	className = '', 
	width = 32, 
	height = 32, 
	style = {},
	...props 
}) => {
	// Generate unique IDs to prevent conflicts when multiple logos are on the same page
	const uniqueId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
	
	return (
		<svg 
			xmlns="http://www.w3.org/2000/svg" 
			viewBox="0 0 120 120" 
			width={width} 
			height={height}
			className={className}
			style={style}
			{...props}
		>
			{/* 
			REPLACE THIS SVG CONTENT WITH YOUR UPDATED LOGO 
			Copy and paste your new logo SVG content here, 
			making sure to update the gradient IDs with the uniqueId
			*/}
			<defs>
				{/* Golden Circle Gradient */}
				<linearGradient id={`goldGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{stopColor:"#FCD34D", stopOpacity:1}} />
					<stop offset="100%" style={{stopColor:"#F59E0B", stopOpacity:1}} />
				</linearGradient>
				
				{/* Purple Circle Gradient */}
				<linearGradient id={`purpleGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{stopColor:"#8B5CF6", stopOpacity:1}} />
					<stop offset="100%" style={{stopColor:"#7C3AED", stopOpacity:1}} />
				</linearGradient>
				
				{/* Suit Gradient */}
				<linearGradient id={`suitGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{stopColor:"#1E3A8A", stopOpacity:1}} />
					<stop offset="100%" style={{stopColor:"#3730A3", stopOpacity:1}} />
				</linearGradient>
			</defs>
			
			{/* Background Circles */}
			<ellipse cx="60" cy="60" rx="55" ry="25" fill={`url(#goldGradient-${uniqueId})`} opacity="0.8" transform="rotate(-15 60 60)"/>
			<ellipse cx="60" cy="60" rx="45" ry="20" fill={`url(#purpleGradient-${uniqueId})`} opacity="0.8" transform="rotate(15 60 60)"/>
			
			{/* Business Person */}
			<g transform="translate(60,35)">
				{/* Head */}
				<ellipse cx="0" cy="-10" rx="8" ry="10" fill="#2D3748"/>
				
				{/* Suit Body */}
				<path d="M-12,5 L-8,-5 L8,-5 L12,5 L12,35 L8,40 L-8,40 L-12,35 Z" fill={`url(#suitGradient-${uniqueId})`}/>
				
				{/* Shirt */}
				<rect x="-6" y="-2" width="12" height="25" fill="#FFFFFF"/>
				
				{/* Tie */}
				<path d="M-2,-2 L2,-2 L3,20 L0,25 L-3,20 Z" fill={`url(#goldGradient-${uniqueId})`}/>
				
				{/* Suit Lapels */}
				<path d="M-8,-5 L-4,5 L-6,10 L-10,0 Z" fill={`url(#suitGradient-${uniqueId})`} opacity="0.8"/>
				<path d="M8,-5 L4,5 L6,10 L10,0 Z" fill={`url(#suitGradient-${uniqueId})`} opacity="0.8"/>
			</g>
		</svg>
	);
};

export default TheManagerLogo;