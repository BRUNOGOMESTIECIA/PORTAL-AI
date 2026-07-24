import { Injectable, NotFoundException } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';

@Injectable()
export class RolesService {
  async findAll() {
    const ds = getTenantDataSource();
    return ds.query(`SELECT r.*, COUNT(u.id) AS user_count
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      GROUP BY r.id ORDER BY r.name`);
  }

  async findOne(id: string) {
    const ds = getTenantDataSource();
    const rows = await ds.query(
      `SELECT r.*, json_agg(p.*) AS permissions
       FROM roles r
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE r.id = $1
       GROUP BY r.id`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('Perfil não encontrado');
    return rows[0];
  }

  async updatePermissions(roleId: string, permissionIds: string[]) {
    const ds = getTenantDataSource();
    await ds.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
    if (permissionIds.length > 0) {
      const values = permissionIds.map((_, i) => `($1, $${i + 2})`).join(', ');
      await ds.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`, [roleId, ...permissionIds]);
    }
    return this.findOne(roleId);
  }

  async findAllPermissions() {
    const ds = getTenantDataSource();
    return ds.query(`SELECT * FROM permissions ORDER BY module, code`);
  }
}
