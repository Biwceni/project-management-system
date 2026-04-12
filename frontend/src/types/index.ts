export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  key: string;
  ownerId: string;
  createdAt: string;
  owner?: Pick<User, 'id' | 'name' | 'email'>;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number; members: number };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  project?: Pick<Project, 'id' | 'name' | 'ownerId'>;
  comments?: Comment[];
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  projectId: string;
  createdAt: string;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}
