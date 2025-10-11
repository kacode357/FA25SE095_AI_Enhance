"use client";

import { GroupService } from "@/services/group.services";
import { CreateGroupPayload } from "@/types/group/group.payload";
import { CreateGroupResponse } from "@/types/group/group.response";
import { useCallback, useState } from "react";

export function useCreateGroup() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createGroup = useCallback(async (payload: CreateGroupPayload): Promise<CreateGroupResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const res = await GroupService.create(payload);
			return res;
		} catch (e: any) {
			setError(e?.message || "Failed to create group");
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return { createGroup, loading, error };
}

