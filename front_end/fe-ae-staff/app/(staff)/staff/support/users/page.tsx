import { StaffSectionHeader } from '@/components/staff';
import { TicketList } from '@/components/staff/support/TicketList';
export default function UserSupportPage(){
  return (
    <div className="space-y-6">
      <StaffSectionHeader title="User Support" description="Quản lý yêu cầu hỗ trợ, khóa/mở tài khoản, thay đổi email theo yêu cầu hợp lệ." />
      <TicketList />
    </div>
  );
}
