import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that returns a function to check if the component is still mounted.
 * Useful to prevent state updates on unmounted components in async operations.
 */
export const useIsMounted = (): (() => boolean) => {
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return useCallback(() => isMountedRef.current, []);
};
