"use client";

import { ActionMenu, type ActionMenuItem } from "@/app/components/admin/ActionMenu";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { useDialog } from "@/app/components/dialog/DialogProvider";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useListAdminTeamQuery,
  useRemoveAdminTeamMemberMutation,
  useResendAdminInviteMutation,
  useUpdateAdminTeamMemberStatusMutation,
} from "@/redux/slices/adminSettingsApi";
import type { AdminTeamMember } from "@/redux/types/adminSettings";
import { ConfirmAction } from "./ConfirmAction";
import { Avatar, SectionError, SectionSkeleton, SettingsCard } from "./Controls";
import { formatLastActive, TEAM_STATUS_LABELS, TEAM_STATUS_STYLES } from "./formatters";
import { InviteUserDialog } from "./InviteUserDialog";

const COLUMNS = ["Name", "Email Address", "Role", "Last Active", "Status", ""];

export type TeamRowProps = { member: AdminTeamMember };

function TeamRow({ member }: TeamRowProps) {
  const { openDialog } = useDialog();
  const [resend] = useResendAdminInviteMutation();
  const [updateStatus] = useUpdateAdminTeamMemberStatusMutation();
  const [remove] = useRemoveAdminTeamMemberMutation();

  async function handleResend() {
    try {
      await resend(member.id).unwrap();
      notify.success("Invite sent again", { message: `A new link was emailed to ${member.email}.` });
    } catch (err) {
      notify.error("Couldn't resend the invite", { message: getErrorMessage(err) });
    }
  }

  async function handleReactivate() {
    try {
      await updateStatus({ id: member.id, status: "active" }).unwrap();
      notify.success("Account reactivated", { message: `${member.fullName} can sign in again.` });
    } catch (err) {
      notify.error("Couldn't reactivate the account", { message: getErrorMessage(err) });
    }
  }

  function handleSuspend() {
    openDialog(
      ({ close }) => (
        <ConfirmAction
          title="Suspend this account?"
          description={`${member.fullName} won't be able to sign in until you reactivate the account.`}
          confirmLabel="Suspend"
          close={close}
          onConfirm={async () => {
            await updateStatus({ id: member.id, status: "suspended" }).unwrap();
            notify.success("Account suspended");
          }}
        />
      ),
      { title: "Suspend account", side: "center", width: "sm" },
    );
  }

  function handleRemove() {
    const invited = member.status === "invited";
    openDialog(
      ({ close }) => (
        <ConfirmAction
          title={invited ? "Cancel this invitation?" : "Remove this user?"}
          description={
            invited
              ? `The invitation sent to ${member.email} will stop working.`
              : `${member.fullName} will lose access to the admin portal. This can't be undone.`
          }
          confirmLabel={invited ? "Cancel invitation" : "Remove"}
          close={close}
          onConfirm={async () => {
            await remove(member.id).unwrap();
            notify.success(invited ? "Invitation cancelled" : "User removed");
          }}
        />
      ),
      { title: invited ? "Cancel invitation" : "Remove user", side: "center", width: "sm" },
    );
  }

  const items: ActionMenuItem[] = [];
  if (member.status === "invited") items.push({ label: "Resend invite", onClick: handleResend });
  if (member.status === "active") items.push({ label: "Suspend account", onClick: handleSuspend });
  if (member.status === "suspended") items.push({ label: "Reactivate account", onClick: handleReactivate });
  items.push({
    label: member.status === "invited" ? "Cancel invitation" : "Remove user",
    onClick: handleRemove,
    destructive: true,
  });

  return (
    <tr className="border-t border-neutral-100">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <Avatar name={member.fullName} src={member.avatar} className="size-11" />
          <span className="text-sm font-medium text-neutral-900">{member.fullName}</span>
        </div>
      </td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{member.email}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{member.roleLabel}</td>
      <td className="py-4 pr-4 text-sm text-neutral-900">{formatLastActive(member.lastActiveAt)}</td>
      <td className="py-4 pr-4">
        <span className={`inline-flex rounded-lg px-4 py-2 text-sm font-medium ${TEAM_STATUS_STYLES[member.status]}`}>
          {TEAM_STATUS_LABELS[member.status]}
        </span>
      </td>
      <td className="py-4 text-right">{member.canManage && <ActionMenu items={items} />}</td>
    </tr>
  );
}

/** Admin Users & Permissions tab: the team, and inviting new people. */
export function TeamTab() {
  const { openDialog } = useDialog();
  const { data, isLoading, isError, error, refetch } = useListAdminTeamQuery();

  function openInvite() {
    openDialog(({ close }) => <InviteUserDialog close={close} />, {
      title: "Add new admin user",
      side: "center",
      width: "xl",
    });
  }

  if (isLoading) return <SectionSkeleton rows={5} />;
  if (isError || !data) return <SectionError message={getErrorMessage(error)} onRetry={refetch} />;

  const members = data.data.items;

  return (
    <SettingsCard>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 px-6 py-7 sm:px-8">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Users Managements</h2>
          <p className="mt-1 text-sm text-neutral-400">Manage team members and their accounts here.</p>
        </div>
        <button
          type="button"
          onClick={openInvite}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#4a7c3a] px-5 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
        >
          <AdminIcon name="plus" className="size-4" />
          Add New User
        </button>
      </div>

      {members.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-neutral-500">
          No team members yet. Add the first one to give them access.
        </p>
      ) : (
        <div className="overflow-x-auto px-6 pb-6 pt-6 sm:px-8">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-neutral-500">
                {COLUMNS.map((col, i) => (
                  <th key={col || i} className="pb-4 pr-4 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <TeamRow key={member.id} member={member} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingsCard>
  );
}
