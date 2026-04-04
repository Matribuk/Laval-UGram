import { useEffect, useRef, useCallback } from 'react';

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
