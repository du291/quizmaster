import { useCallback, useEffect, useRef } from 'react'

export const useApi = <T>(
    id: string | undefined,
    fetch: (id: string, queryParam?: { name: string; value: string }) => Promise<T>,
    setData: (data: T) => void,
    queryParam?: { name: string; value: string },
) => {
    const fetchRef = useRef(fetch)
    const setDataRef = useRef(setData)
    fetchRef.current = fetch
    setDataRef.current = setData

    const fetchData = useCallback(async () => {
        if (id) {
            const data = await fetchRef.current(id, queryParam)
            setDataRef.current(data)
        }
    }, [id, queryParam])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return fetchData
}
