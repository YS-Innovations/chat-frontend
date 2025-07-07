import { LoginHistory } from "../../login-history/login-history";

interface MemberDetailsTabContentProps {
  member: any;
  loginHistory: any[];
}

export function MemberDetailsTabContent({ member, loginHistory }: MemberDetailsTabContentProps) {
  return (
    <div className="flex-1 overflow-auto pt-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Member Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{member.email}</p>
          </div>
        </div>
      </div>
      <LoginHistory history={loginHistory} />
    </div>
  );
}