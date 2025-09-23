// Enhanced types for Better Auth Organization plugin
export type MemberRole = "owner" | "admin" | "member" | "guest";
export type InvitationStatus = "pending" | "accepted" | "rejected" | "cancelled";

// Core Organization types
export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberData {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface InvitationData {
  id: string;
  email: string;
  inviterId: string;
  organizationId: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  inviter?: MemberData;
  organization?: OrganizationData;
}

export interface FullOrganization extends OrganizationData {
  members: MemberData[];
  invitations?: InvitationData[];
  memberCount: number;
  currentUserMember?: MemberData;
}

// API Response types
export interface OrganizationListResponse {
  organizations: OrganizationData[];
  count: number;
}

export interface MemberListResponse {
  members: MemberData[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface InvitationListResponse {
  invitations: InvitationData[];
  count: number;
}

// Server Action input types
export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, any>;
}

export interface UpdateOrganizationInput {
  id: string;
  name?: string;
  slug?: string;
  logo?: string;
  metadata?: Record<string, any>;
}

export interface InviteMemberInput {
  organizationId: string;
  email: string;
  role: MemberRole;
}

export interface UpdateMemberRoleInput {
  organizationId: string;
  memberId: string;
  role: MemberRole;
}

export interface RemoveMemberInput {
  organizationId: string;
  memberIdOrEmail: string;
}

// Server Action return types
export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface OrganizationPermissions {
  canUpdate: boolean;
  canDelete: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateMemberRoles: boolean;
  canManageInvitations: boolean;
}

// Organization Settings extension
export interface OrganizationSettings {
  allowPublicRegistration: boolean;
  defaultMemberRole: MemberRole;
  maxMembers?: number;
  requireEmailVerification: boolean;
  allowMemberInvites: boolean;
}

// Extended organization with custom fields
export interface ExtendedOrganization extends OrganizationData {
  settings?: OrganizationSettings;
  branding?: {
    primaryColor: string;
    themeMode: 'light' | 'dark' | 'auto';
    logoUrl?: string;
  };
  domain?: string;
  isActive: boolean;
}