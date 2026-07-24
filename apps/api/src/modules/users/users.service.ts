import { Injectable, NotFoundException } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  async findAll(page = 1, limit = 25) {
    const ds = getTenantDataSource();
    const offset = (page - 1) * limit;
    const [rows, count] = await Promise.all([
      ds.query(
        `SELECT u.id, u.email, u.name, u.avatar_url, u.department, u.phone, u.is_active,
                u.sso_provider, u.last_login_at, u.created_at,
                r.name AS role_name, r.id AS role_id
         FROM users u LEFT JOIN roles r ON r.id = u.role_id
         ORDER BY u.name LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      ds.query(`SELECT COUNT(*) FROM users`),
    ]);
    return { data: rows, meta: { total: parseInt(count[0].count), page, limit, totalPages: Math.ceil(count[0].count / limit) } };
  }

  async findOne(id: string) {
    const ds = getTenantDataSource();
    const rows = await ds.query(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.department, u.phone, u.is_active,
              u.sso_provider, u.last_login_at, u.created_at,
              r.name AS role_name, r.id AS role_id
       FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('Usuário não encontrado');
    return rows[0];
  }

  async update(id: string, data: { name?: string; department?: string; phone?: string; roleId?: string; isActive?: boolean }) {
    const ds = getTenantDataSource();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (data.name !== undefined) { sets.push(`name = $${idx++}`); params.push(data.name); }
    if (data.department !== undefined) { sets.push(`department = $${idx++}`); params.push(data.department); }
    if (data.phone !== undefined) { sets.push(`phone = $${idx++}`); params.push(data.phone); }
    if (data.roleId !== undefined) { sets.push(`role_id = $${idx++}`); params.push(data.roleId); }
    if (data.isActive !== undefined) { sets.push(`is_active = $${idx++}`); params.push(data.isActive); }
    if (!sets.length) return this.findOne(id);
    sets.push(`updated_at = now()`);
    params.push(id);
    await ds.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}`, params);
    return this.findOne(id);
  }

  async anonymize(id: string) {
    const ds = getTenantDataSource();
    await ds.query(
      `UPDATE users 
       SET name = 'Usuário Anonimizado', 
           email = md5($1 || email || extract(epoch from now())::text), 
           phone = NULL, 
           department = NULL, 
           avatar_url = NULL, 
           password_hash = NULL, 
           is_active = false, 
           updated_at = now() 
       WHERE id = $1`,
      [id],
    );
  }
}
