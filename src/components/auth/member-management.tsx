"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  MoreHorizontal, 
  UserPlus, 
  Trash2,
  RefreshCw,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useToast } from "@/hooks/use-toast";
import { getUserRoleColor, userRoleIcons } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { Loading } from "../sheard/loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inviteMemberAction } from "@/server/actions/invitation-actions";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["owner", "admin", "member", "guest"]),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface MemberPermissions {
  canManageMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateRoles: boolean;
  canInviteMembers: boolean;
}

interface MemberManagementProps {
  organizationId: string;
  initialData?: MemberData[];
  initialPermissions?: MemberPermissions;
  currentUserId?: string;
}


// Default permissions object to prevent re-renders
const DEFAULT_PERMISSIONS = {
  canManageMembers: false,
  canRemoveMembers: false,
  canUpdateRoles: false,
  canInviteMembers: false,
};

export function MemberManagement({ 
  organizationId, 
  initialData = [],
  initialPermissions,
  currentUserId
}: MemberManagementProps) {
  const { toast } = useToast();
  const { data: session } = useSession();
  
  // Simple state - start with initial data if provided
  const [members, setMembers] = useState<MemberData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<MemberData | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [permissions] = useState(initialPermissions || DEFAULT_PERMISSIONS);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Simple refresh function
  const refreshMembers = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const result = await listMembersAction({ organizationId });
      if (result.success && result.data) {
        setMembers(result.data.members);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  // Load data only if we don't have initial data
  useEffect(() => {
    if (initialData?.length === 0) {
      refreshMembers();
    }
  }, [initialData?.length, refreshMembers]); // Include dependencies

  // Handle successful invitation
  const handleInviteSuccess = () => {
    // Refresh members list to show any new data
    refreshMembers();
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !permissions.canRemoveMembers || !organizationId) return;

    try {
      const result = await removeMemberAction({
        organizationId: organizationId,
        memberIdOrEmail: memberToRemove.id,
      });

      if (result.success) {
        setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
        toast({
          title: "Success",
          description: "Member removed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to remove member",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error", 
        description: "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: MemberRole) => {
    if (!permissions.canUpdateRoles || !organizationId) return;

    setUpdatingRole(memberId);
    try {
      const result = await updateMemberRoleAction({
        organizationId: organizationId,
        memberId,
        role: newRole,
      });

      if (result.success) {
        setMembers(prev => 
          prev.map(m => 
            m.id === memberId ? { ...m, role: newRole } : m
          )
        );
        toast({
          title: "Success",
          description: "Member role updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update member role",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update member role", 
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMembers = members.filter(member =>
    member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleSelectItems = (currentRole: MemberRole) => {
    const roles: MemberRole[] = ["guest", "member", "admin"];
    // Only owners can assign owner role
    if (permissions.canUpdateRoles) {
      roles.push("owner");
    }
    return roles.filter(role => role !== currentRole);
  };



  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loading />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshMembers}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {permissions.canInviteMembers && (
                <Button 
                  onClick={() => setShowInviteDialog(true)} 
                  className="flex items-center gap-2 btn-brand-primary"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Members
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const RoleIcon = userRoleIcons[member.role];
                  const isCurrentUser = member.userId === (currentUserId || session?.user?.id);

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user?.image} />
                            <AvatarFallback>
                              {member.user?.name ? getInitials(member.user.name) : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.user?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {permissions.canUpdateRoles && !isCurrentUser ? (
                          <Select
                            value={member.role}
                            onValueChange={(newRole: MemberRole) => 
                              handleRoleUpdate(member.id, newRole)
                            }
                            disabled={updatingRole === member.id}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getRoleSelectItems(member.role).map((role) => (
                                <SelectItem key={role} value={role}>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={getUserRoleColor(role)}>
                                      {role}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`${getUserRoleColor(member.role)} flex items-center gap-1 w-fit`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {permissions.canRemoveMembers && !isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No members found matching your search." : "No members yet."}
              </div>
            )}
          </div>
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
              Are you sure you want to remove {memberToRemove?.user?.name} from this organization?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
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
        onSuccess={handleInviteSuccess}
      />
    </>
  );
}

// Inline Invite Dialog Component
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
  const { toast } = useToast();
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
        organizationId: organizationId,
        email: data.email,
        role: data.role,
      });

      if (result.success) {
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${data.email}`,
        });
        form.reset();
        onSuccess?.();
        onOpenChange(false);
      } else {
        form.setError("root", {
          message: result.error || "Failed to send invitation",
        });
      }
    } catch {
      form.setError("root", {
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
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
                      placeholder="Enter email address"
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {form.formState.errors.root.message}
              </div>
            )}

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
                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}