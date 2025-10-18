"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  Search,
  MoreVertical,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listMembersAction,
  removeMemberAction,
  updateMemberRoleAction
} from "@/server/actions/member-actions";
import type { MemberData, MemberRole } from "@/types/auth-organization";
import { getUserRoleColor, userRoleIcons, getInitials } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inviteMemberAction } from "@/server/actions/invitation-actions";
import { toast } from "sonner";
import { Loading } from "@/components/sheard/loading";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "guest"]),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface MemberManagementProps {
  organizationId: string;
  initialData?: MemberData[];
  initialPermissions?: {
    canManageMembers: boolean;
    canRemoveMembers: boolean;
    canUpdateRoles: boolean;
    canInviteMembers: boolean;
  };
  currentUserId?: string;
}

const DEFAULT_PERMISSIONS = {
  canManageMembers: false,
  canRemoveMembers: false,
  canUpdateRoles: false,
  canInviteMembers: false,
};

const ROLE_OPTIONS: { value: MemberRole; label: string; description: string }[] = [
  { value: "guest", label: "Guest", description: "View only access" },
  { value: "member", label: "Member", description: "Standard access" },
  { value: "admin", label: "Admin", description: "Full management access" },
  { value: "owner", label: "Owner", description: "Complete control" },
];

export function MemberManagement({
  organizationId,
  initialData = [],
  initialPermissions,
  currentUserId
}: MemberManagementProps) {
  const { data: session } = useSession();

  const [members, setMembers] = useState<MemberData[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<MemberData | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  const permissions = initialPermissions || DEFAULT_PERMISSIONS;
  const currentUser = currentUserId || session?.user?.id;

  const refreshMembers = useCallback(async () => {
    if (!organizationId) return;

    setIsLoading(true);
    try {
      const result = await listMembersAction({ organizationId });
      if (result.success && result.data) {
        setMembers(result.data.members);
      } else {
        throw new Error(result.error || "Failed to load members");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load members");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (initialData.length === 0) {
      refreshMembers();
    }
  }, [organizationId, initialData.length, refreshMembers]);

  const handleRemoveMember = async () => {
    if (!memberToRemove || !permissions.canRemoveMembers || !organizationId) return;

    try {
      const result = await removeMemberAction({
        organizationId,
        memberIdOrEmail: memberToRemove.id,
      });

      if (result.success) {
        setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
        toast.success(`${memberToRemove.user?.name} has been removed from the organization`);
      } else {
        throw new Error(result.error || "Failed to remove member");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: MemberRole) => {
    if (!permissions.canUpdateRoles || !organizationId) return;

    setUpdatingRoleId(memberId);
    try {
      const result = await updateMemberRoleAction({
        organizationId,
        memberId,
        role: newRole,
      });

      if (result.success) {
        setMembers(prev =>
          prev.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
        );
        toast.success(`Member role changed to ${newRole}`);
      } else {
        throw new Error(result.error || "Failed to update role");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const filteredMembers = members.filter(member =>
    member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members
                <Badge variant="secondary" className="ml-2">
                  {members.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage organization members and their roles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMembers}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {permissions.canInviteMembers && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  size="sm"
                  className="flex items-center gap-2 btn-brand-primary"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loading text="Loading members..." />
            </div>
          )}

          {/* Members List */}
          {!isLoading && (
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    {searchTerm ? "No members found" : "No members yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Invite members to get started"}
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const RoleIcon = userRoleIcons[member.role];
                  const isCurrentUser = member.userId === currentUser;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.user?.image} alt={member.user?.name} />
                          <AvatarFallback className="text-sm">
                            {member.user?.name ? getInitials(member.user.name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {member.user?.name || "Unknown User"}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {member.user?.email}
                            </p>
                            <div className="flex items-center gap-1">
                              {member.user?.emailVerified ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-amber-600" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {member.user?.emailVerified ? "Verified" : "Unverified"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Role Management */}
                        {permissions.canUpdateRoles && !isCurrentUser ? (
                          <Select
                            value={member.role}
                            onValueChange={(newRole: MemberRole) =>
                              handleRoleUpdate(member.id, newRole)
                            }
                            disabled={updatingRoleId === member.id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <RoleIcon className="h-3 w-3" />
                                  <span className="capitalize">{member.role}</span>
                                  {updatingRoleId === member.id && (
                                    <Loader2 className="h-3 w-3 animate-spin ml-1" />
                                  )}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((roleOption) => {
                                const OptionIcon = userRoleIcons[roleOption.value];
                                return (
                                  <SelectItem 
                                    key={roleOption.value} 
                                    value={roleOption.value}
                                    disabled={roleOption.value === member.role}
                                  >
                                    <div className="flex items-center gap-2">
                                      <OptionIcon className="h-3 w-3" />
                                      <div>
                                        <div className="font-medium">{roleOption.label}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {roleOption.description}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`${getUserRoleColor(member.role)} flex items-center gap-1`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {member.role}
                          </Badge>
                        )}

                        {/* Actions */}
                        {permissions.canRemoveMembers && !isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.user?.name}</strong> from this organization?
              They will lose access immediately and this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        organizationId={organizationId}
        onSuccess={() => refreshMembers()}
      />
    </>
  );
}

function InviteMemberDialog({
  open,
  onOpenChange,
  organizationId,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    if (!organizationId) return;

    setIsSubmitting(true);
    try {
      const result = await inviteMemberAction({
        organizationId,
        email: data.email,
        role: data.role,
      });

      if (result.success) {
        toast.success(`${data.email} will receive an invitation to join as ${data.role}`);
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="member@company.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((roleOption) => {
                          const RoleIcon = userRoleIcons[roleOption.value];
                          return (
                            <SelectItem key={roleOption.value} value={roleOption.value}>
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{roleOption.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {roleOption.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}