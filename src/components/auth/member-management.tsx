"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Mail, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Crown,
  Trash2,
  RefreshCw
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

interface MemberManagementProps {
  organizationId: string;
  currentUserRole: MemberRole;
  onInviteClick?: () => void;
}

const roleIcons = {
  owner: Crown,
  admin: ShieldCheck,
  member: Shield,
  guest: Users,
};

const roleColors = {
  owner: "bg-purple-100 text-purple-800 border-purple-300",
  admin: "bg-blue-100 text-blue-800 border-blue-300", 
  member: "bg-green-100 text-green-800 border-green-300",
  guest: "bg-gray-100 text-gray-800 border-gray-300",
};

export function MemberManagement({ 
  organizationId, 
  currentUserRole, 
  onInviteClick 
}: MemberManagementProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<MemberData | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      const result = await listMembersAction({ organizationId });
      if (result.success && result.data) {
        setMembers(result.data.members);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin";
  const canRemoveMembers = currentUserRole === "owner" || currentUserRole === "admin";
  const canUpdateRoles = currentUserRole === "owner";

  const handleRemoveMember = async () => {
    if (!memberToRemove || !canRemoveMembers) return;

    try {
      const result = await removeMemberAction({
        organizationId,
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
    } catch (error) {
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
    if (!canUpdateRoles) return;

    setUpdatingRole(memberId);
    try {
      const result = await updateMemberRoleAction({
        organizationId,
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
    } catch (error) {
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
    if (currentUserRole === "owner") {
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
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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
            {canManageMembers && (
              <Button onClick={onInviteClick} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Members
              </Button>
            )}
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
                  const RoleIcon = roleIcons[member.role];
                  const isCurrentUser = member.userId === member.user?.id; // This would need actual current user check

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
                        {canUpdateRoles && !isCurrentUser ? (
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
                                    <Badge variant="outline" className={roleColors[role]}>
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
                            className={`${roleColors[member.role]} flex items-center gap-1 w-fit`}
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
                        {canRemoveMembers && !isCurrentUser && (
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
    </>
  );
}