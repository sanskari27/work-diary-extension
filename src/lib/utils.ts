import { type ClassValue, clsx } from 'clsx';
import _ from 'lodash';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import type React from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getGreeting = () => {
	const hour = new Date().getHours();

	if (_.inRange(hour, 5, 12)) {
		return 'Good Morning';
	} else if (_.inRange(hour, 12, 17)) {
		return 'Good Afternoon';
	} else if (_.inRange(hour, 17, 21)) {
		return 'Good Evening';
	} else {
		return 'Good Night';
	}
};

export const getGreetingIcon = () => {
	const hour = new Date().getHours();

	if (_.inRange(hour, 5, 12)) {
		return Sunrise;
	} else if (_.inRange(hour, 12, 17)) {
		return Sun;
	} else if (_.inRange(hour, 17, 21)) {
		return Sunset;
	} else {
		return Moon;
	}
};

export const formatTime = () => {
	return new Date().toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	});
};

/**
 * Calculates the caret position in a textarea relative to its wrapper element.
 * @param textareaRef - React ref to the textarea element
 * @param wrapperRef - React ref to the wrapper element (should have position: relative)
 * @returns An object with top and left coordinates relative to the wrapper, or null if calculation fails
 */
export const getCaretPosition = (
	textareaRef: React.RefObject<HTMLTextAreaElement>,
	wrapperRef: React.RefObject<HTMLElement>
): { top: number; left: number } | null => {
	const textarea = textareaRef.current;
	const wrapper = wrapperRef.current;

	if (!textarea || !wrapper) {
		return null;
	}

	const selectionStart = textarea.selectionStart;
	const text = textarea.value.substring(0, selectionStart);

	// Get computed styles from textarea
	const computedStyle = window.getComputedStyle(textarea);
	const textareaRect = textarea.getBoundingClientRect();
	const wrapperRect = wrapper.getBoundingClientRect();

	// Create a temporary div to measure text dimensions
	const measureDiv = document.createElement('div');
	
	// Use try-finally to ensure cleanup
	try {
		measureDiv.style.position = 'absolute';
		measureDiv.style.visibility = 'hidden';
		measureDiv.style.whiteSpace = 'pre-wrap';
		measureDiv.style.wordWrap = 'break-word';
		measureDiv.style.overflowWrap = 'break-word';
		measureDiv.style.top = '-9999px';
		measureDiv.style.left = '-9999px';
		measureDiv.style.pointerEvents = 'none';
		
		// Get the content width (clientWidth accounts for padding but not scrollbar)
		const contentWidth = textarea.clientWidth;
		measureDiv.style.width = `${contentWidth}px`;
		
		// Copy all relevant font and text styles
		measureDiv.style.font = computedStyle.font;
		measureDiv.style.fontSize = computedStyle.fontSize;
		measureDiv.style.fontFamily = computedStyle.fontFamily;
		measureDiv.style.fontWeight = computedStyle.fontWeight;
		measureDiv.style.fontStyle = computedStyle.fontStyle;
		measureDiv.style.fontVariant = computedStyle.fontVariant;
		measureDiv.style.letterSpacing = computedStyle.letterSpacing;
		measureDiv.style.wordSpacing = computedStyle.wordSpacing;
		measureDiv.style.textTransform = computedStyle.textTransform;
		measureDiv.style.textIndent = computedStyle.textIndent;
		measureDiv.style.direction = computedStyle.direction;
		
		// Copy box model - use individual padding values
		measureDiv.style.paddingTop = computedStyle.paddingTop;
		measureDiv.style.paddingRight = computedStyle.paddingRight;
		measureDiv.style.paddingBottom = computedStyle.paddingBottom;
		measureDiv.style.paddingLeft = computedStyle.paddingLeft;
		
		// Don't copy border to measureDiv - we'll account for it separately
		measureDiv.style.border = 'none';
		measureDiv.style.boxSizing = 'border-box';
		measureDiv.style.lineHeight = computedStyle.lineHeight;
		measureDiv.style.overflow = 'hidden';
		
		// Handle tab size
		measureDiv.style.tabSize = computedStyle.tabSize || '8';

		// Split text into lines
		const lines = text.split('\n');
		const lastLine = lines[lines.length - 1] || '';

		// Build the text content
		if (lines.length > 1) {
			// Add all lines before the last one
			const textBeforeLastLine = lines.slice(0, -1).join('\n');
			measureDiv.appendChild(document.createTextNode(textBeforeLastLine + '\n'));
		}

		// Create a span for measuring the exact caret position
		const span = document.createElement('span');
		span.style.position = 'relative';
		
		if (lastLine) {
			// Add the text of the last line up to caret
			span.textContent = lastLine;
		} else {
			// Empty line - use zero-width character
			span.textContent = '\u200B';
		}
		
		measureDiv.appendChild(span);
		
		// Add marker at the end of span to get exact caret position
		const marker = document.createElement('span');
		marker.style.position = 'relative';
		marker.textContent = '\u200B'; // Zero-width space
		span.appendChild(marker);

		document.body.appendChild(measureDiv);

		// Get positions
		const markerRect = marker.getBoundingClientRect();
		const measureDivRect = measureDiv.getBoundingClientRect();

		// Extract padding and border from textarea
		const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
		const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
		const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
		const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;

		// Get scroll position
		const scrollLeft = textarea.scrollLeft || 0;
		const scrollTop = textarea.scrollTop || 0;

		// Calculate position of marker relative to measureDiv content area
		// The marker shows where the caret should be
		let relativeLeft = markerRect.left - measureDivRect.left;
		let relativeTop = markerRect.top - measureDivRect.top;

		// The measureDiv already has padding applied, so relativeLeft/Top 
		// are relative to the content area (inside padding)
		
		// Now calculate relative to textarea's content area
		// Add textarea's border (measureDiv has no border)
		// Subtract scroll position
		const textareaContentLeft = borderLeft + paddingLeft - scrollLeft;
		const textareaContentTop = borderTop + paddingTop - scrollTop;

		// Position of caret in textarea's coordinate system
		const caretInTextareaLeft = textareaContentLeft + relativeLeft;
		const caretInTextareaTop = textareaContentTop + relativeTop;

		// Convert to wrapper's coordinate system
		const left = (textareaRect.left - wrapperRect.left) + caretInTextareaLeft;
		const top = (textareaRect.top - wrapperRect.top) + caretInTextareaTop;

		console.log('Caret position calculation:', {
			textareaClientWidth: contentWidth,
			textareaBoundingWidth: textareaRect.width,
			markerRect,
			measureDivRect,
			scroll: { scrollLeft, scrollTop },
			padding: { paddingLeft, paddingTop },
			border: { borderLeft, borderTop },
			relative: { relativeLeft, relativeTop },
			textareaContent: { textareaContentLeft, textareaContentTop },
			caretInTextarea: { caretInTextareaLeft, caretInTextareaTop },
			final: { left, top },
			lastLine: `"${lastLine}"`,
			lastLineLength: lastLine.length
		});

		return { left, top };
	} catch (error) {
		console.error('Error calculating caret position:', error);
		return null;
	} finally {
		// Ensure cleanup happens even if there's an error
		if (measureDiv.parentNode) {
			document.body.removeChild(measureDiv);
		}
	}
};