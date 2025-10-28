import { AccessCodeService } from "@/services/access-code.services";
import { GetAccessCodeResponse } from "@/types/access-code/access-code.response";
import { useEffect, useState } from "react";

export const useGetAccessCodes = (courseId?: string) => {
  const [data, setData] = useState<GetAccessCodeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchAccessCode = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await AccessCodeService.getAccessCode({ courseId });
        setData(res);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch access code");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessCode();
  }, [courseId]);

  return { data, loading, error };
};
