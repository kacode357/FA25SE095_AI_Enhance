"use client";

import { GroupService } from "@/services/group.services";
import { GetGroupsByCourseIdResponse, GroupDetail } from "@/types/group/group.response";
import { useCallback, useEffect, useRef, useState } from "react";

const cache = new Map<string, GetGroupsByCourseIdResponse>();
// in-flight dedupe map
const inflight = new Map<string, Promise<GetGroupsByCourseIdResponse | null>>();

// subscribers per courseId so multiple hook instances can be notified when cache updates
const subscribers = new Map<string, Set<(groups: GroupDetail[]) => void>>();

export function useGroupsByCourseId() {
  const [listData, setListData] = useState<GroupDetail[]>([]);
  const [loading, setLoading] = useState(false);
  // track callbacks this hook instance registered so we can unsubscribe on unmount
  const callbacksRef = useRef<Map<string, (groups: GroupDetail[]) => void>>(new Map());

  const fetchByCourseId = useCallback(async (courseId: string, force = false) => {
    if (!courseId) return null;
    const key = courseId;
    // register a subscriber callback for this hook instance (so it receives updates when cache changes)
    if (!callbacksRef.current.has(key)) {
      const cb = (groups: GroupDetail[]) => setListData(groups || []);
      callbacksRef.current.set(key, cb);
      if (!subscribers.has(key)) subscribers.set(key, new Set());
      subscribers.get(key)!.add(cb);
    }

    if (!force && cache.has(key)) {
      const cached = cache.get(key)!;
      setListData(cached.groups || []);
      return cached;
    }

    // reuse inflight requests
    if (inflight.has(key)) {
      return inflight.get(key)!;
    }

    setLoading(true);

    const req = (async (): Promise<GetGroupsByCourseIdResponse | null> => {
      try {
        const res = await GroupService.getByCourseId(courseId);
        cache.set(key, res);
        setListData(res.groups || []);

        // notify other subscribers (other hook instances) about the updated groups
        const subs = subscribers.get(key);
        if (subs) {
          const groups = res.groups || [];
          subs.forEach((fn) => {
            try {
              fn(groups);
            } catch (e) {
              // ignore subscriber errors
            }
          });
        }

        return res;
      } finally {
        setLoading(false);
        inflight.delete(key);
      }
    })();

    inflight.set(key, req);
    return req;
  }, []);

  const refetch = (courseId: string) => fetchByCourseId(courseId, true);

  // cleanup subscribers on unmount
  useEffect(() => {
    return () => {
      callbacksRef.current.forEach((cb, key) => {
        const subs = subscribers.get(key);
        if (subs) {
          subs.delete(cb);
          if (subs.size === 0) subscribers.delete(key);
        }
      });
      callbacksRef.current.clear();
    };
  }, []);

  return { listData, loading, fetchByCourseId, refetch };
}