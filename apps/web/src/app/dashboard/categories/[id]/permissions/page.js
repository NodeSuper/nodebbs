'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { Loading } from '@/components/common/Loading';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { categoryApi, rbacApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CategoryPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id);

  const [category, setCategory] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        rbacApi.admin.getRoles(),
        rbacApi.admin.getCategoryPermissions(categoryId),
      ]);

      setCategory(permsData.category);
      setRoles(rolesData);

      // 构建权限矩阵
      const permMap = {};
      permsData.permissions.forEach(p => {
        permMap[p.roleId] = {
          canView: p.canView,
          canCreate: p.canCreate,
          canReply: p.canReply,
          canModerate: p.canModerate,
        };
      });

      // 为所有角色初始化权限（默认为 true，除了 canModerate 默认 false）
      const allPerms = rolesData.map(role => ({
        roleId: role.id,
        roleName: role.name,
        roleSlug: role.slug,
        canView: permMap[role.id]?.canView ?? true,
        canCreate: permMap[role.id]?.canCreate ?? true,
        canReply: permMap[role.id]?.canReply ?? true,
        canModerate: permMap[role.id]?.canModerate ?? false,
      }));

      setPermissions(allPerms);
    } catch (err) {
      console.error('获取数据失败:', err);
      toast.error('获取数据失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (roleId, field, value) => {
    setPermissions(prev =>
      prev.map(p => {
        if (p.roleId === roleId) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rbacApi.admin.setCategoryPermissions(
        categoryId,
        permissions.map(p => ({
          roleId: p.roleId,
          canView: p.canView,
          canCreate: p.canCreate,
          canReply: p.canReply,
          canModerate: p.canModerate,
        }))
      );
      toast.success('权限配置已保存');
    } catch (err) {
      console.error('保存失败:', err);
      toast.error('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="加载中..." className="py-12" />;
  }

  if (!category) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        分类不存在
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link href="/dashboard/categories">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span>权限配置 - {category.name}</span>
          </div>
        }
        description="配置各角色在该分类下的操作权限"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存配置'}
          </Button>
        }
      />

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">角色</th>
                <th className="text-center p-4 font-medium w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <span>查看</span>
                    <span className="text-xs text-muted-foreground font-normal">canView</span>
                  </div>
                </th>
                <th className="text-center p-4 font-medium w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <span>发帖</span>
                    <span className="text-xs text-muted-foreground font-normal">canCreate</span>
                  </div>
                </th>
                <th className="text-center p-4 font-medium w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <span>回复</span>
                    <span className="text-xs text-muted-foreground font-normal">canReply</span>
                  </div>
                </th>
                <th className="text-center p-4 font-medium w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <span>管理</span>
                    <span className="text-xs text-muted-foreground font-normal">canModerate</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, index) => (
                <tr
                  key={perm.roleId}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{perm.roleName}</span>
                      <Badge variant="outline" className="text-xs">
                        {perm.roleSlug}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-center p-4">
                    <Switch
                      checked={perm.canView}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(perm.roleId, 'canView', checked)
                      }
                    />
                  </td>
                  <td className="text-center p-4">
                    <Switch
                      checked={perm.canCreate}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(perm.roleId, 'canCreate', checked)
                      }
                    />
                  </td>
                  <td className="text-center p-4">
                    <Switch
                      checked={perm.canReply}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(perm.roleId, 'canReply', checked)
                      }
                    />
                  </td>
                  <td className="text-center p-4">
                    <Switch
                      checked={perm.canModerate}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(perm.roleId, 'canModerate', checked)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-lg">
        <p><strong>权限说明：</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>查看 (canView)</strong>：是否可以查看该分类及其内容</li>
          <li><strong>发帖 (canCreate)</strong>：是否可以在该分类发布新话题</li>
          <li><strong>回复 (canReply)</strong>：是否可以回复该分类下的话题</li>
          <li><strong>管理 (canModerate)</strong>：是否可以管理该分类（编辑/删除他人内容、置顶等）</li>
        </ul>
      </div>
    </div>
  );
}
