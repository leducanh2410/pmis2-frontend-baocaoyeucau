import { AuthMockApi } from 'app/mock-api/common/auth/api';
import { MessagesMockApi } from 'app/mock-api/common/messages/api';
import { NavigationMockApi } from 'app/mock-api/common/navigation/api';
import { NotificationsMockApi } from 'app/mock-api/common/notifications/api';
import { ProjectMockApi } from 'app/mock-api/dashboards/project/api';
import { SearchMockApi } from 'app/mock-api/common/search/api';
import { ShortcutsMockApi } from 'app/mock-api/common/shortcuts/api';
import { TasksMockApi } from 'app/mock-api/apps/tasks/api';
import { UserMockApi } from 'app/mock-api/common/user/api';

export const mockApiServices = [
    AuthMockApi,
    MessagesMockApi,
    NavigationMockApi,
    NotificationsMockApi,
    ProjectMockApi,
    SearchMockApi,
    ShortcutsMockApi,
    TasksMockApi,
    UserMockApi
];
