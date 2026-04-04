import { renderHook } from '@testing-library/react';
import { useIsMounted } from '../../hooks/useIsMounted';

describe('useIsMounted', () => {
	it('returns true when component is mounted', () => {
		const { result } = renderHook(() => useIsMounted());
		expect(result.current()).toBe(true);
	});

	it('returns false after component is unmounted', () => {
		const { result, unmount } = renderHook(() => useIsMounted());
		expect(result.current()).toBe(true);
		unmount();
		expect(result.current()).toBe(false);
	});

	it('returns stable function reference', () => {
		const { result, rerender } = renderHook(() => useIsMounted());
		const firstRef = result.current;
		rerender();
		expect(result.current).toBe(firstRef);
	});
});
