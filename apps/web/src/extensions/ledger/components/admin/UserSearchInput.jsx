import { SearchSelect } from '@/components/common/SearchSelect';
import { userApi } from '@/lib/api';

/**
 * 管理员用户搜索输入框
 * 使用 userApi.getList 接口（需要管理员权限）
 * 
 * @param {Object} props
 * @param {Object} props.selectedUser - 当前选择的用户对象
 * @param {Function} props.onSelectUser - 选择用户时的回调
 */
export function UserSearchInput({ selectedUser, onSelectUser }) {
  // 管理员用户搜索函数
  const searchUsers = async (query) => {
    const data = await userApi.getList({ search: query, limit: 10 });
    return data.items || [];
  };

  // 数据转换：将用户对象转换为 SearchSelect 需要的格式
  const transformUser = (user) => ({
    id: user.id,
    label: user.username,
    description: user.email,
  });

  return (
    <SearchSelect
      value={selectedUser}
      onChange={onSelectUser}
      searchFn={searchUsers}
      transformData={transformUser}
      label="选择用户"
      placeholder="搜索用户名或邮箱"
      autoSearch={false}
    />
  );
}

