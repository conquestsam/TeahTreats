import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { permissions } from '@snacks/shared';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator.js';
import { CsrfGuard } from '../../../common/guards/csrf.guard.js';
import { JwtAccessAuthGuard } from '../../../common/guards/jwt-access-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { TenantScopeGuard } from '../../../common/guards/tenant-scope.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-request.js';
import { AdminIamService } from '../application/admin-iam.service.js';
import {
  AssignUserRoleDto,
  CreateAdminRoleDto,
  CreateAdminUserDto,
  RejectApprovalDto,
  UpdateAdminUserDto
} from './dto/admin-iam.dto.js';

@ApiTags('admin/iam')
@ApiCookieAuth('access_token')
@ApiHeader({
  name: 'x-tenant-id',
  required: false,
  description: 'Development fallback only. Protected routes prefer authenticated tenant context.'
})
@UseGuards(JwtAccessAuthGuard, CsrfGuard, TenantScopeGuard, PermissionsGuard)
@Controller('admin/iam')
export class AdminIamController {
  constructor(private readonly iam: AdminIamService) {}

  @Get('users')
  @RequirePermissions(permissions.usersManage)
  @ApiOperation({ summary: 'List admin and vendor users for the current tenant.' })
  async listUsers(@CurrentTenant() tenantId: string) {
    return { data: await this.iam.listUsers(tenantId) };
  }

  @Post('users')
  @RequirePermissions(permissions.usersManage)
  @ApiOperation({ summary: 'Create an admin, vendor, or support user.' })
  async createUser(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAdminUserDto,
  ) {
    return { data: await this.iam.createUser(actor, tenantId, dto) };
  }

  @Patch('users/:userId')
  @RequirePermissions(permissions.usersManage)
  @ApiOperation({ summary: 'Update a managed user profile.' })
  async updateUser(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return { data: await this.iam.updateUser(actor, tenantId, userId, dto) };
  }

  @Post('users/:userId/roles')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'Assign a role or create an approval request.' })
  async assignRole(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: AssignUserRoleDto,
  ) {
    return { data: await this.iam.assignUserRole(actor, tenantId, userId, dto) };
  }

  @Delete('users/:userId/roles/:userRoleId')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'Remove a user role assignment.' })
  async removeRole(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('userRoleId') userRoleId: string,
  ) {
    return { data: await this.iam.removeUserRole(actor, tenantId, userRoleId) };
  }

  @Get('roles')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'List assignable roles.' })
  async listRoles(@CurrentTenant() tenantId: string) {
    return { data: await this.iam.listRoles(tenantId) };
  }

  @Post('roles')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'Create a tenant role.' })
  async createRole(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAdminRoleDto,
  ) {
    return { data: await this.iam.createRole(actor, tenantId, dto) };
  }

  @Get('permissions')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'List known permissions.' })
  listPermissions() {
    return { data: this.iam.listPermissions() };
  }

  @Get('tenants')
  @RequirePermissions(permissions.tenantsManage)
  @ApiOperation({ summary: 'List tenants visible to the current actor.' })
  async listTenants(@CurrentUser() actor: AuthenticatedUser) {
    return { data: await this.iam.listTenants(actor) };
  }

  @Get('approvals')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'List pending role change approvals.' })
  async listApprovals(@CurrentTenant() tenantId: string) {
    return { data: await this.iam.listApprovals(tenantId) };
  }

  @Post('approvals/:approvalId/approve')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'Approve a delegated role change.' })
  async approve(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('approvalId') approvalId: string,
  ) {
    return { data: await this.iam.approveRoleChange(actor, tenantId, approvalId) };
  }

  @Post('approvals/:approvalId/reject')
  @RequirePermissions(permissions.rolesManage)
  @ApiOperation({ summary: 'Reject a delegated role change.' })
  async reject(
    @CurrentUser() actor: AuthenticatedUser,
    @CurrentTenant() tenantId: string,
    @Param('approvalId') approvalId: string,
    @Body() dto: RejectApprovalDto,
  ) {
    return { data: await this.iam.rejectRoleChange(actor, tenantId, approvalId, dto) };
  }
}
