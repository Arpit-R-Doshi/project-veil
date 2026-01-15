'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function FallingPattern({
	color = '#ef4444',
	backgroundColor = 'transparent',
	duration = 150,
	blurIntensity = '1em',
	density = 1,
	className,
}) {
	const generateBackgroundImage = () => {
		const patterns = [
			`radial-gradient(4px 100px at 0px 235px, ${color}, transparent)`,
			`radial-gradient(4px 100px at 300px 235px, ${color}, transparent)`,
			`radial-gradient(1.5px 1.5px at 150px 117.5px, ${color} 100%, transparent 150%)`,
			`radial-gradient(4px 100px at 0px 252px, ${color}, transparent)`,
			`radial-gradient(4px 100px at 300px 252px, ${color}, transparent)`,
			`radial-gradient(1.5px 1.5px at 150px 126px, ${color} 100%, transparent 150%)`,
			`radial-gradient(4px 100px at 0px 150px, ${color}, transparent)`,
			`radial-gradient(4px 100px at 300px 150px, ${color}, transparent)`,
			`radial-gradient(1.5px 1.5px at 150px 75px, ${color} 100%, transparent 150%)`,
            // Add more density if needed
            `radial-gradient(4px 100px at 100px 252px, ${color}, transparent)`,
            `radial-gradient(4px 100px at 200px 252px, ${color}, transparent)`,
		];
		return patterns.join(', ');
	};

	const backgroundSizes = '300px 235px, 300px 235px, 300px 235px, 300px 252px, 300px 252px, 300px 252px, 300px 150px, 300px 150px, 300px 150px, 300px 252px, 300px 252px';
	const startPositions = '0px 220px, 3px 220px, 151.5px 337.5px, 25px 24px, 28px 24px, 176.5px 150px, 50px 16px, 53px 16px, 201.5px 91px, 100px 24px, 200px 24px';
	const endPositions = '0px 6800px, 3px 6800px, 151.5px 6917.5px, 25px 13632px, 28px 13632px, 176.5px 13758px, 50px 5416px, 53px 5416px, 201.5px 5491px, 100px 13632px, 200px 13632px';

	return (
		<div className={cn('absolute inset-0 size-full pointer-events-none overflow-hidden', className)}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.75 }} // 🟢 VISIBILITY INCREASED
				transition={{ duration: 1 }}
				className="size-full"
			>
				<motion.div
					className="relative size-full z-0"
					style={{
						backgroundColor,
						backgroundImage: generateBackgroundImage(),
						backgroundSize: backgroundSizes,
                        // 🟢 THIS MAKES THE COLORS POP ON BLACK
                        mixBlendMode: "screen" 
					}}
					variants={{
						initial: { backgroundPosition: startPositions },
						animate: {
							backgroundPosition: [startPositions, endPositions],
							transition: {
								duration: duration,
								ease: 'linear',
								repeat: Number.POSITIVE_INFINITY,
							},
						},
					}}
					initial="initial"
					animate="animate"
				/>
			</motion.div>
			<div
				className="absolute inset-0 z-1"
				style={{
					backdropFilter: `blur(${blurIntensity})`,
					backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, ${backgroundColor} 2px)`,
					backgroundSize: `${8 * density}px ${8 * density}px`,
				}}
			/>
		</div>
	);
}