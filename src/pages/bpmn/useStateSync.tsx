import { useEffect, useRef, useState } from 'react';

/**
 * 自定义 useState
 * @param state
 * @returns
 */
const useSyncState: any = (state: any) => {
  const cbRef: { current: any } = useRef();
  const [data, setData] = useState(state);

  useEffect(() => {
    cbRef.current && cbRef.current(data);
  }, [data]);

  return [
    data,
    (val: any, callback: any) => {
      cbRef.current = callback;
      setData(val);
    },
  ];
};

export default useSyncState;
