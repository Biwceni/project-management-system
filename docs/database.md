Users
- id
- name
- email
- password
- created_at

Projects
- id
- name
- description
- owner_id
- created_at

ProjectMembers
- id
- project_id
- user_id
- role

Tasks
- id
- project_id
- title
- description
- status
- assigned_to
- created_at

Comments
- id
- task_id
- user_id
- content
- created_at