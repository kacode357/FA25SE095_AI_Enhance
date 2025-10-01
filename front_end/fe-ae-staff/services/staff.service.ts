// Placeholder StaffService (UI only phase) - simulate async responses
import { GetUsersParams } from "../types/staff/user.payload";
import { PendingApprovalResponse, ReactivateUserResponse, StaffGetUsersResponse, StaffUserDetailResponse } from "../types/staff/user.response";

function delay(ms:number){ return new Promise(r=>setTimeout(r, ms)); }

export const StaffService = {
  async getUsers(params: GetUsersParams = {}): Promise<StaffGetUsersResponse> {
    await delay(300);
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    return {
      page,
      pageSize,
      total: 42,
      users: Array.from({ length: pageSize }).map((_,i)=>({
        id: `${page}-${i}`,
        email: `user${(page-1)*pageSize+i}@example.com`,
        fullName: `User ${(page-1)*pageSize+i}`,
        role: i % 5 ===0 ? 'Lecturer' : 'Student',
        status: i % 7 ===0 ? 'LOCKED' : 'ACTIVE',
        lastLoginAt: new Date(Date.now()- i*3600*1000).toISOString()
      }))
    };
  },
  async getUserById(id: string): Promise<StaffUserDetailResponse> {
    await delay(200);
    return {
      id,
      email: `user${id}@example.com`,
      fullName: `User ${id}`,
      role: 'Student',
      status: 'ACTIVE',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date(Date.now()-86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      institution: 'IDC LMS'
    };
  },
  async reactivateUser(id: string): Promise<ReactivateUserResponse>{
    await delay(250);
    return { success:true, message:`User ${id} reactivated` };
  },
  async getPendingApprovalUsers(): Promise<PendingApprovalResponse>{
    await delay(250);
    return { total: 3, users: [1,2,3].map(n=>({
      id: `${n}`,
      email: `pending${n}@example.com`,
      fullName: `Pending User ${n}`,
      role: 'Student',
      status: 'PENDING'
    })) };
  }
};
